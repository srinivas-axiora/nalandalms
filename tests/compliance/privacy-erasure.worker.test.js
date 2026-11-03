import { describe, expect, it, vi } from "vitest";
import { runPrivacyErasureBatch } from "../../backend/src/workers/privacy-erasure.js";

describe("privacy erasure worker", () => {
  it("deletes queued objects before finalizing the database erasure", async () => {
    const repository = {
      claimDue: vi.fn()
        .mockResolvedValueOnce({ id: "PRIV-1" })
        .mockResolvedValueOnce(null),
      listObjectTasks: vi.fn().mockResolvedValue([
        { id: "OBJ-1", objectKey: "proctoring/attempt/chunk.webm", objectKeySha256: "a".repeat(64) },
      ]),
      markObjectDeleted: vi.fn().mockResolvedValue(undefined),
      markObjectFailed: vi.fn().mockResolvedValue(undefined),
      markRetry: vi.fn().mockResolvedValue(undefined),
      finalizeErasure: vi.fn().mockResolvedValue({ blocked: false }),
    };
    const deleteFn = vi.fn().mockResolvedValue(true);

    const result = await runPrivacyErasureBatch({ limit: 2, repository, deleteFn });

    expect(result).toEqual({ claimed: 1, completed: 1, blocked: 0, failed: 0, objectsDeleted: 1 });
    expect(deleteFn).toHaveBeenCalledWith("proctoring/attempt/chunk.webm");
    expect(repository.markObjectDeleted).toHaveBeenCalledWith("OBJ-1");
    expect(repository.finalizeErasure).toHaveBeenCalledWith("PRIV-1");
  });

  it("retains failed object tasks and schedules a retry without finalizing", async () => {
    const repository = {
      claimDue: vi.fn()
        .mockResolvedValueOnce({ id: "PRIV-2" })
        .mockResolvedValueOnce(null),
      listObjectTasks: vi.fn().mockResolvedValue([
        { id: "OBJ-2", objectKey: "proctoring/attempt/chunk.webm", objectKeySha256: "b".repeat(64) },
      ]),
      markObjectDeleted: vi.fn().mockResolvedValue(undefined),
      markObjectFailed: vi.fn().mockResolvedValue(undefined),
      markRetry: vi.fn().mockResolvedValue(undefined),
      finalizeErasure: vi.fn(),
    };
    const deleteFn = vi.fn().mockRejectedValue(new Error("synthetic S3 failure"));

    const result = await runPrivacyErasureBatch({ limit: 2, repository, deleteFn });

    expect(result).toMatchObject({ claimed: 1, failed: 1, completed: 0 });
    expect(repository.markObjectFailed).toHaveBeenCalledWith("OBJ-2", "OBJECT_DELETE_FAILED");
    expect(repository.markRetry).toHaveBeenCalledWith({
      requestId: "PRIV-2",
      errorCode: "OBJECT_DELETE_FAILED",
    });
    expect(repository.finalizeErasure).not.toHaveBeenCalled();
  });
});
