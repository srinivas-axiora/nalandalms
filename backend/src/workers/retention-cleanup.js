// Background Data Retention Cleanup Worker
// Automatically cleans up proctoring video chunks older than the retention threshold (default: 90 days)
import { attempts, now, saveDb } from "../core.js";
import { audit } from "../domain.js";
import { logger } from "../logging/logger.js";
import { deleteObject, normalizeObjectKey } from "../storage/object-store.js";
import { relationalAttemptsEnabled } from "../runtime-modes.js";
import { proctorMediaRetentionRepository } from "../repositories/proctor-media-retention.repository.pg.js";

const boundedInteger = (value, fallback, minimum, maximum) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum ? parsed : fallback;
};
const DEFAULT_RETENTION_DAYS = boundedInteger(process.env.PROCTORING_RETENTION_DAYS, 90, 1, 3650);
const DEFAULT_BATCH_SIZE = boundedInteger(process.env.PROCTORING_RETENTION_BATCH_SIZE, 100, 1, 500);

async function runSnapshotRetentionCleanup({ retentionDays, dryRun }) {
  const cutoffTime = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  let deletedChunksCount = 0;
  let purgedAttemptsCount = 0;

  for (const attempt of attempts) {
    if (!attempt.submittedAt) continue; // Do not touch in-progress attempts
    const examSubmittedTime = new Date(attempt.submittedAt).getTime();

    if (examSubmittedTime < cutoffTime) {
      if (attempt.videoChunks && attempt.videoChunks.length > 0) {
        const retainedChunks = [];
        if (!dryRun) {
          for (const chunk of attempt.videoChunks) {
            try {
              if (chunk.key) await deleteObject(normalizeObjectKey(chunk.key));
              deletedChunksCount += 1;
            } catch (err) {
              retainedChunks.push(chunk);
              logger.error("RETENTION_OBJECT_DELETE_FAILED", {
                attemptId: attempt.id,
                key: chunk.key,
                error: err?.message || "Object deletion failed",
              });
            }
          }
          attempt.videoChunks = retainedChunks;
          if (retainedChunks.length === 0) attempt.retentionPurgedAt = now();
        } else {
          deletedChunksCount += attempt.videoChunks.length;
        }
        purgedAttemptsCount++;
      }
    }
  }

  const result = {
    cutoffDate: new Date(cutoffTime).toISOString(),
    retentionDays,
    purgedAttemptsCount,
    deletedChunksCount,
    dryRun,
    executedAt: now(),
  };

  logger.info("RETENTION_CLEANUP_JOB_COMPLETED", result);
  await audit("SYSTEM", "RETENTION_CLEANUP", "PROCTORING", "BATCH", result);
  if (!dryRun) await saveDb();

  return result;
}

async function runRelationalRetentionCleanup({
  retentionDays,
  dryRun,
  limit,
  repository,
  deleteFn,
  auditFn,
}) {
  const result = {
    cutoffDate: new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString(),
    retentionDays,
    purgedAttemptsCount: 0,
    deletedChunksCount: 0,
    failedChunksCount: 0,
    dryRun,
    executedAt: now(),
  };
  const affectedAttempts = new Set();

  if (dryRun) {
    const due = await repository.listDue({ retentionDays, limit });
    for (const task of due) affectedAttempts.add(task.attemptId);
    result.purgedAttemptsCount = affectedAttempts.size;
    result.deletedChunksCount = due.length;
    logger.info("RETENTION_CLEANUP_JOB_COMPLETED", result);
    return result;
  }

  for (let index = 0; index < limit; index += 1) {
    const task = await repository.claimDue({ retentionDays });
    if (!task) break;
    affectedAttempts.add(task.attemptId);
    try {
      await deleteFn(normalizeObjectKey(task.objectKey));
      await repository.markDeleted(task);
      result.deletedChunksCount += 1;
    } catch {
      await repository.markFailed({
        attemptId: task.attemptId,
        objectKeySha256: task.objectKeySha256,
        errorCode: "OBJECT_DELETE_FAILED",
      });
      result.failedChunksCount += 1;
      logger.error("RETENTION_OBJECT_DELETE_FAILED", {
        attemptId: task.attemptId,
        objectKeySha256: task.objectKeySha256,
        errorCode: "OBJECT_DELETE_FAILED",
      });
    }
  }

  result.purgedAttemptsCount = affectedAttempts.size;
  result.executedAt = now();
  logger.info("RETENTION_CLEANUP_JOB_COMPLETED", result);
  await auditFn("SYSTEM", "RETENTION_CLEANUP", "PROCTORING", "BATCH", result);
  return result;
}

export async function runRetentionCleanup({
  retentionDays = DEFAULT_RETENTION_DAYS,
  dryRun = false,
  limit = DEFAULT_BATCH_SIZE,
  repository = proctorMediaRetentionRepository,
  deleteFn = deleteObject,
  auditFn = audit,
} = {}) {
  if (relationalAttemptsEnabled()) {
    return runRelationalRetentionCleanup({ retentionDays, dryRun, limit, repository, deleteFn, auditFn });
  }
  return runSnapshotRetentionCleanup({ retentionDays, dryRun });
}

export function startRetentionDaemon(intervalMs = 24 * 60 * 60 * 1000) {
  // Run once on startup, then daily
  runRetentionCleanup().catch((err) => logger.error("RETENTION_CLEANUP_JOB_FAILED", { error: err?.message || err }));
  const timer = setInterval(() => {
    runRetentionCleanup().catch((err) => logger.error("RETENTION_CLEANUP_JOB_FAILED", { error: err?.message || err }));
  }, intervalMs);
  timer.unref();
  return timer;
}

