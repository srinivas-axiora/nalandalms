import { v4 as uuid } from "uuid";
import { reportsRepository } from "../repositories/reports.repository.pg.js";
import { summarizeReportRows } from "../repositories/reports.repository.pg.js";
import { createReportArtifact } from "../reports/report-artifacts.js";
import { deleteObject, uploadBuffer } from "../storage/object-store.js";
import { logger } from "../logging/logger.js";

const boundedInteger = (value, fallback, minimum, maximum) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum ? parsed : fallback;
};
const DEFAULT_INTERVAL_MS = boundedInteger(process.env.REPORT_EXPORT_INTERVAL_MS, 30_000, 5_000, 3_600_000);
const DEFAULT_BATCH_SIZE = boundedInteger(process.env.REPORT_EXPORT_BATCH_SIZE, 3, 1, 20);

const safeErrorCode = (error) => ["REPORT_TOO_LARGE", "REQUESTER_NOT_AUTHORIZED"].includes(error?.code)
  ? error.code : "REPORT_ARTIFACT_FAILED";

export async function runReportExportBatch({
  limit = DEFAULT_BATCH_SIZE,
  repository = reportsRepository,
  createArtifact = createReportArtifact,
  upload = uploadBuffer,
  remove = deleteObject,
} = {}) {
  const result = { claimed: 0, ready: 0, failed: 0 };
  for (let index = 0; index < limit; index += 1) {
    const report = await repository.claimDue();
    if (!report) break;
    result.claimed += 1;
    let storageKey = null;
    let pendingStorageKeyRetained = Boolean(report.pendingStorageKey);
    try {
      if (report.pendingStorageKey) {
        await remove(report.pendingStorageKey);
        pendingStorageKeyRetained = false;
      }
      const rows = await repository.loadRowsForClaim(report);
      const artifact = await createArtifact({ report, rows });
      storageKey = `reports/${report.id}/${uuid()}.${artifact.extension}`;
      await repository.reserveStorageKey({ reportId: report.id, storageKey });
      await upload(storageKey, artifact.buffer, artifact.contentType);
      await repository.markReady({ reportId: report.id, storageKey, rowCount: rows.length, summary: summarizeReportRows(rows) });
      result.ready += 1;
    } catch (error) {
      let preserveStorageKey = pendingStorageKeyRetained && !storageKey;
      if (storageKey) {
        try {
          await remove(storageKey);
          preserveStorageKey = false;
        } catch {
          preserveStorageKey = true;
        }
      }
      await repository.markFailed({
        reportId: report.id,
        errorCode: safeErrorCode(error),
        terminal: error?.code === "REQUESTER_NOT_AUTHORIZED",
        preserveStorageKey,
      });
      result.failed += 1;
      logger.error("REPORT_EXPORT_FAILED", { reportId: report.id, errorCode: safeErrorCode(error) });
    }
  }
  logger.info("REPORT_EXPORT_BATCH_COMPLETED", result);
  return result;
}

export function startReportExportDaemon(intervalMs = DEFAULT_INTERVAL_MS) {
  runReportExportBatch().catch(() => logger.error("REPORT_EXPORT_BATCH_FAILED", { errorCode: "BATCH_FAILED" }));
  const timer = setInterval(() => {
    runReportExportBatch().catch(() => logger.error("REPORT_EXPORT_BATCH_FAILED", { errorCode: "BATCH_FAILED" }));
  }, intervalMs);
  timer.unref();
  return timer;
}
