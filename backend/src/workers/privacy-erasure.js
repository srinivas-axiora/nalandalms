import { privacyPgRepository } from "../repositories/privacy.repository.pg.js";
import { deleteObject, normalizeObjectKey } from "../storage/object-store.js";
import { logger } from "../logging/logger.js";

const DEFAULT_INTERVAL_MS = Number(process.env.PRIVACY_ERASURE_INTERVAL_MS || 5 * 60 * 1000);
const DEFAULT_BATCH_SIZE = Number(process.env.PRIVACY_ERASURE_BATCH_SIZE || 10);

export async function runPrivacyErasureBatch({
  limit = DEFAULT_BATCH_SIZE,
  repository = privacyPgRepository,
  deleteFn = deleteObject,
} = {}) {
  const result = {
    claimed: 0,
    completed: 0,
    blocked: 0,
    failed: 0,
    objectsDeleted: 0,
  };

  for (let index = 0; index < limit; index += 1) {
    const request = await repository.claimDue();
    if (!request) break;
    result.claimed += 1;
    let objectFailure = false;
    const tasks = await repository.listObjectTasks(request.id);
    for (const task of tasks) {
      try {
        await deleteFn(normalizeObjectKey(task.objectKey));
        await repository.markObjectDeleted(task.id);
        result.objectsDeleted += 1;
      } catch (error) {
        objectFailure = true;
        await repository.markObjectFailed(task.id, "OBJECT_DELETE_FAILED");
        logger.error("PRIVACY_OBJECT_DELETE_FAILED", {
          requestId: request.id,
          objectKeySha256: task.objectKeySha256,
          errorCode: "OBJECT_DELETE_FAILED",
        });
      }
    }
    if (objectFailure) {
      await repository.markRetry({
        requestId: request.id,
        errorCode: "OBJECT_DELETE_FAILED",
      });
      result.failed += 1;
      continue;
    }
    try {
      const finalized = await repository.finalizeErasure(request.id);
      if (finalized.blocked) result.blocked += 1;
      else result.completed += 1;
    } catch (error) {
      await repository.markRetry({
        requestId: request.id,
        errorCode: "FINALIZATION_FAILED",
      });
      result.failed += 1;
      logger.error("PRIVACY_ERASURE_FINALIZATION_FAILED", {
        requestId: request.id,
        errorCode: "FINALIZATION_FAILED",
      });
    }
  }

  logger.info("PRIVACY_ERASURE_BATCH_COMPLETED", result);
  return result;
}

export function startPrivacyErasureDaemon(intervalMs = DEFAULT_INTERVAL_MS) {
  runPrivacyErasureBatch().catch(() => logger.error("PRIVACY_ERASURE_BATCH_FAILED", {
    errorCode: "BATCH_FAILED",
  }));
  const timer = setInterval(() => {
    runPrivacyErasureBatch().catch(() => logger.error("PRIVACY_ERASURE_BATCH_FAILED", {
      errorCode: "BATCH_FAILED",
    }));
  }, intervalMs);
  timer.unref();
  return timer;
}
