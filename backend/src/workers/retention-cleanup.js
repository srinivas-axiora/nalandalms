// Background Data Retention Cleanup Worker
// Automatically cleans up proctoring video chunks older than the retention threshold (default: 90 days)
import { attempts, now, saveDb } from "../core.js";
import { audit } from "../domain.js";
import { logger } from "../logging/logger.js";
import { deleteObject, normalizeObjectKey } from "../storage/object-store.js";

const DEFAULT_RETENTION_DAYS = parseInt(process.env.PROCTORING_RETENTION_DAYS || "90", 10);

export async function runRetentionCleanup({ retentionDays = DEFAULT_RETENTION_DAYS, dryRun = false } = {}) {
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
  audit("SYSTEM", "RETENTION_CLEANUP", "PROCTORING", "BATCH", result);
  if (!dryRun) await saveDb();

  return result;
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

