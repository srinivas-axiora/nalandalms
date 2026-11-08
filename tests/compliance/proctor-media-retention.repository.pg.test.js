import { describe, expect, it, vi } from "vitest";
import { createProctorMediaRetentionRepository } from "../../backend/src/repositories/proctor-media-retention.repository.pg.js";

describe("proctor media retention repository", () => {
  it("claims due media with row locking and bounded retry state", async () => {
    const client = {
      query: vi.fn().mockResolvedValue({ rows: [{
        attempt_id: "ATT-1",
        object_key: "proctoring/ATT-1/chunk.webm",
        object_key_sha256: "a".repeat(64),
        delete_attempts: 1,
      }] }),
    };
    const db = {
      query: vi.fn(),
      withTransaction: vi.fn((work) => work(client)),
    };
    const repository = createProctorMediaRetentionRepository(db);

    const task = await repository.claimDue({ retentionDays: 90 });

    expect(task).toMatchObject({ attemptId: "ATT-1", deleteAttempts: 1 });
    const sql = client.query.mock.calls[0][0];
    expect(sql).toContain("FOR UPDATE OF media SKIP LOCKED");
    expect(sql).toContain("delete_attempts < 5");
    expect(sql).toContain("interval '15 minutes'");
    expect(sql).toContain("CLAIM_EXHAUSTED");
  });

  it("redacts the key, removes the attempt projection and audits atomically", async () => {
    const client = {
      query: vi.fn()
        .mockResolvedValueOnce({ rows: [{ attempt_id: "ATT-1" }] })
        .mockResolvedValue({ rows: [], rowCount: 1 }),
    };
    const db = {
      query: vi.fn(),
      withTransaction: vi.fn((work) => work(client)),
    };
    const repository = createProctorMediaRetentionRepository(db);

    const completed = await repository.markDeleted({
      attemptId: "ATT-1",
      objectKey: "proctoring/ATT-1/chunk.webm",
      objectKeySha256: "a".repeat(64),
    });

    expect(completed).toBe(true);
    const statements = client.query.mock.calls.map(([sql]) => sql);
    expect(statements[0]).toContain("object_key = NULL");
    expect(statements[1]).toContain("jsonb_array_elements(video_chunks)");
    expect(statements[2]).toContain("RETENTION_MEDIA_DELETED");
    expect(db.withTransaction).toHaveBeenCalledOnce();
  });
});
