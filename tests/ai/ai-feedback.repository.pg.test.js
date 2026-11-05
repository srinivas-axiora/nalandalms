import { describe, expect, it, vi } from "vitest";
import { createAiFeedbackRepository } from "../../backend/src/repositories/ai-feedback.repository.pg.js";

const row = {
  id: "f3c6608d-a404-4dc8-9550-e72e61ce9629",
  skill_name: "Security", course_level: "Advanced", feedback_type: "Overall",
  rating: 2, comment: "Add stronger authorization examples.", created_by: "MGR-1",
  created_at: new Date("2026-11-05T00:00:00Z"),
  expires_at: new Date("2027-05-04T00:00:00Z"),
};

describe("relational AI feedback repository", () => {
  it("limits Manager listing to the authenticated creator", async () => {
    const query = vi.fn(async (_sql, params) => {
      expect(params).toEqual([false, "MGR-1", 25]);
      return { rows: [row] };
    });
    const repository = createAiFeedbackRepository({ query });
    const result = await repository.list({ id: "MGR-1", role: "Manager" });
    expect(result[0]).toMatchObject({ createdBy: "MGR-1", skillName: "Security", rating: 2 });
  });

  it("writes feedback and audit evidence in one transaction", async () => {
    const query = vi.fn(async (sql) => sql.includes("INSERT INTO ai_generation_feedback")
      ? { rows: [row] }
      : { rows: [], rowCount: 1 });
    const repository = createAiFeedbackRepository({ query, withTransaction: vi.fn((fn) => fn({ query })) });
    const result = await repository.create({
      actor: { id: "MGR-1", role: "Manager" },
      feedback: { skillName: "Security", courseLevel: "Advanced", feedbackType: "Overall", rating: 2, comment: row.comment },
    });
    expect(result.id).toBe(row.id);
    expect(query.mock.calls.some(([sql]) => sql.includes("INSERT INTO audit_logs"))).toBe(true);
  });

  it("uses creator scope, expiry and relevance ranking for prompt memory", async () => {
    const query = vi.fn(async (sql, params) => {
      expect(sql).toContain("expires_at > now()");
      expect(sql).toContain("created_by = $2");
      expect(params).toEqual([false, "MGR-1", "Security", "Advanced"]);
      return { rows: [row] };
    });
    const repository = createAiFeedbackRepository({ query });
    await expect(repository.findRelevant({
      actor: { id: "MGR-1", role: "Manager" }, skillName: "Security", courseLevel: "Advanced",
    })).resolves.toHaveLength(1);
  });
});
