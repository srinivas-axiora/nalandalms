// Background Data Retention Cleanup Worker
// Automatically cleans up proctoring video chunks older than the retention threshold (default: 90 days)
import fs from "node:fs";
import path from "node:path";
import { attempts, proctoringLogs, now } from "../core.js";
import { audit } from "../domain.js";
import { logger } from "../logging/logger.js";

const DEFAULT_RETENTION_DAYS = parseInt(process.env.PROCTORING_RETENTION_DAYS || "90", 10);

export function runRetentionCleanup({ retentionDays = DEFAULT_RETENTION_DAYS, dryRun = false } = {}) {
  const cutoffTime = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  let deletedChunksCount = 0;
  let purgedAttemptsCount = 0;

  for (const attempt of attempts) {
    if (!attempt.submittedAt) continue; // Do not touch in-progress attempts
    const examSubmittedTime = new Date(attempt.submittedAt).getTime();

    if (examSubmittedTime < cutoffTime) {
      if (attempt.videoChunks && attempt.videoChunks.length > 0) {
        deletedChunksCount += attempt.videoChunks.length;
        if (!dryRun) {
          // Remove local chunk files if stored on disk
          for (const chunk of attempt.videoChunks) {
            if (chunk.key) {
              const fullPath = path.resolve(process.cwd(), "uploads", chunk.key);
              if (fs.existsSync(fullPath)) {
                try {
                  fs.unlinkSync(fullPath);
                } catch {
                  // Ignore deletion failures for already removed files
                }
              }
            }
          }
          attempt.videoChunks = [];
          attempt.retentionPurgedAt = now();
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

  return result;
}

export function startRetentionDaemon(intervalMs = 24 * 60 * 60 * 1000) {
  // Run once on startup, then daily
  runRetentionCleanup();
  const timer = setInterval(() => {
    runRetentionCleanup();
  }, intervalMs);
  timer.unref();
  return timer;
}

