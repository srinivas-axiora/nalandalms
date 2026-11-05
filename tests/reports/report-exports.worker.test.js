import { describe, expect, it, vi } from "vitest";
import { runReportExportBatch } from "../../backend/src/workers/report-exports.js";

const report = {
  id: "8a14967f-687d-4ab0-a253-ae01da76ecb8", reportType: "Team", format: "PDF",
  filters: {}, actor: { id: "MGR-1", role: "Manager", status: "Active" },
};
const rows = [{ chapterTimeSeconds: 1, assessmentTimeSeconds: 2, courseTimeSeconds: 3 }];

describe("report export worker", () => {
  it("claims, generates, privately uploads and completes an artifact", async () => {
    const repository = {
      claimDue: vi.fn().mockResolvedValueOnce(report).mockResolvedValueOnce(null),
      loadRowsForClaim: vi.fn().mockResolvedValue(rows),
      reserveStorageKey: vi.fn().mockResolvedValue(undefined),
      markReady: vi.fn().mockResolvedValue({ status: "Ready" }),
      markFailed: vi.fn(),
    };
    const upload = vi.fn().mockResolvedValue({ mode: "s3" });
    const result = await runReportExportBatch({
      limit: 2, repository, upload, remove: vi.fn(),
      createArtifact: vi.fn().mockResolvedValue({ buffer: Buffer.from("pdf"), extension: "pdf", contentType: "application/pdf" }),
    });
    expect(result).toEqual({ claimed: 1, ready: 1, failed: 0 });
    expect(upload).toHaveBeenCalledWith(expect.stringMatching(/^reports\/.+\/.+\.pdf$/), expect.any(Buffer), "application/pdf");
    expect(repository.markReady).toHaveBeenCalledWith(expect.objectContaining({
      reportId: report.id, rowCount: 1,
      summary: { chapterTimeSeconds: 1, assessmentTimeSeconds: 2, courseTimeSeconds: 3 },
    }));
  });

  it("removes an uploaded orphan and records a sanitized retry failure", async () => {
    const repository = {
      claimDue: vi.fn().mockResolvedValueOnce(report).mockResolvedValueOnce(null),
      loadRowsForClaim: vi.fn().mockResolvedValue(rows),
      reserveStorageKey: vi.fn().mockResolvedValue(undefined),
      markReady: vi.fn().mockRejectedValue(new Error("database details")),
      markFailed: vi.fn().mockResolvedValue({ status: "Failed" }),
    };
    const remove = vi.fn().mockResolvedValue(true);
    const result = await runReportExportBatch({
      limit: 2, repository, remove, upload: vi.fn().mockResolvedValue({}),
      createArtifact: vi.fn().mockResolvedValue({ buffer: Buffer.from("pdf"), extension: "pdf", contentType: "application/pdf" }),
    });
    expect(result).toEqual({ claimed: 1, ready: 0, failed: 1 });
    expect(remove).toHaveBeenCalledOnce();
    expect(repository.markFailed).toHaveBeenCalledWith({
      reportId: report.id, errorCode: "REPORT_ARTIFACT_FAILED", terminal: false, preserveStorageKey: false,
    });
  });
});
