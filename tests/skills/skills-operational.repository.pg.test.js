import { describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ query: vi.fn(), withTransaction: vi.fn() }));
vi.mock("../../backend/src/db/pool.js", () => db);

import {
  listChapterFeedback,
  listSkillRatings,
  upsertChapterFeedback,
} from "../../backend/src/repositories/skills.repository.pg.js";

describe("relational skill and feedback operational authority", () => {
  it("enforces direct-report skill-rating scope inside SQL", async () => {
    db.query.mockResolvedValueOnce({ rows: [{
      id: "RATE-1", user_id: "USR-1", skill: "Security", score: "82",
      assessments_based: 2, trend: "up", last_updated: new Date("2026-11-05T00:00:00Z"),
    }] });
    const result = await listSkillRatings({ id: "MGR-1", role: "Manager" });
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining("$2::boolean AND app_user.manager_id = $3"), [false, true, "MGR-1"]);
    expect(result[0]).toMatchObject({ id: "RATE-1", score: 82, assessmentsBased: 2 });
  });

  it("does not grant direct-report visibility to a non-Manager role", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    await listChapterFeedback({ id: "USR-1", role: "Learner" });
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("$2::boolean AND app_user.manager_id = $3"),
      [false, false, "USR-1"],
    );
  });

  it("checks enrollment and commits feedback plus audit in one transaction", async () => {
    const client = { query: vi.fn(async (sql) => {
      if (sql.includes("JOIN enrollments")) return { rows: [{ id: "CH-1" }] };
      if (sql.includes("INSERT INTO chapter_feedbacks")) return { rows: [{
        id: "CF-1", chapter_id: "CH-1", course_id: "CRS-1", user_id: "USR-1",
        rating: 5, clarity: 4, relevance: 5, comments: "Useful", submitted_at: new Date(),
      }] };
      if (sql.includes("INSERT INTO audit_logs")) return { rows: [] };
      throw new Error("unexpected query");
    }) };
    db.withTransaction.mockImplementationOnce((fn) => fn(client));
    const result = await upsertChapterFeedback({
      actor: { id: "USR-1", role: "Learner" },
      feedback: { id: "CF-1", chapterId: "CH-1", courseId: "CRS-1", rating: 5, clarity: 4, relevance: 5, comments: "Useful" },
    });
    expect(result).toMatchObject({ id: "CF-1", userId: "USR-1" });
    expect(client.query.mock.calls.some(([sql]) => sql.includes("ON CONFLICT (chapter_id, user_id)"))).toBe(true);
    expect(client.query.mock.calls.some(([sql]) => sql.includes("INSERT INTO audit_logs"))).toBe(true);
  });
});
