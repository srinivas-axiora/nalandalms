import { afterEach, describe, expect, it, vi } from "vitest";
import { runRetentionCleanup } from "../../backend/src/workers/retention-cleanup.js";

describe("relational proctor media retention worker", () => {
  const previousCourses = process.env.USE_PG_COURSES;
  const previousAttempts = process.env.USE_PG_ATTEMPTS;

  afterEach(() => {
    if (previousCourses === undefined) delete process.env.USE_PG_COURSES;
    else process.env.USE_PG_COURSES = previousCourses;
    if (previousAttempts === undefined) delete process.env.USE_PG_ATTEMPTS;
    else process.env.USE_PG_ATTEMPTS = previousAttempts;
  });

  it("claims, deletes and durably completes each expired object", async () => {
    process.env.USE_PG_COURSES = "1";
    process.env.USE_PG_ATTEMPTS = "0";
    const task = {
      attemptId: "ATT-RET-1",
      objectKey: "proctoring/ATT-RET-1/primary.webm",
      objectKeySha256: "a".repeat(64),
    };
    const repository = {
      claimDue: vi.fn().mockResolvedValueOnce(task).mockResolvedValueOnce(null),
      markDeleted: vi.fn().mockResolvedValue(true),
      markFailed: vi.fn(),
    };
    const deleteFn = vi.fn().mockResolvedValue(true);
    const auditFn = vi.fn().mockResolvedValue({});

    const result = await runRetentionCleanup({
      retentionDays: 90, limit: 2, repository, deleteFn, auditFn,
    });

    expect(result).toMatchObject({
      purgedAttemptsCount: 1, deletedChunksCount: 1, failedChunksCount: 0,
    });
    expect(deleteFn).toHaveBeenCalledWith(task.objectKey);
    expect(repository.markDeleted).toHaveBeenCalledWith(task);
    expect(auditFn).toHaveBeenCalledOnce();
  });

  it("records a sanitized retry without logging or returning object keys", async () => {
    process.env.USE_PG_COURSES = "1";
    const task = {
      attemptId: "ATT-RET-2",
      objectKey: "proctoring/ATT-RET-2/primary.webm",
      objectKeySha256: "b".repeat(64),
    };
    const repository = {
      claimDue: vi.fn().mockResolvedValueOnce(task).mockResolvedValueOnce(null),
      markDeleted: vi.fn(),
      markFailed: vi.fn().mockResolvedValue(undefined),
    };

    const result = await runRetentionCleanup({
      retentionDays: 90,
      limit: 2,
      repository,
      deleteFn: vi.fn().mockRejectedValue(new Error("s3 details")),
      auditFn: vi.fn().mockResolvedValue({}),
    });

    expect(result).toMatchObject({ deletedChunksCount: 0, failedChunksCount: 1 });
    expect(JSON.stringify(result)).not.toContain(task.objectKey);
    expect(repository.markFailed).toHaveBeenCalledWith({
      attemptId: task.attemptId,
      objectKeySha256: task.objectKeySha256,
      errorCode: "OBJECT_DELETE_FAILED",
    });
  });
});
