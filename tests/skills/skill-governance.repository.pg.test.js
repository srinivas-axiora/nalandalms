import { beforeEach, describe, expect, it, vi } from "vitest";

const client = { query: vi.fn() };

vi.mock("../../backend/src/db/pool.js", () => ({
  query: vi.fn(),
  withTransaction: vi.fn((callback) => callback(client)),
}));

const repository = await import("../../backend/src/repositories/skills.repository.pg.js?phase66");

const target = {
  id: "TS-P66",
  skillId: "SKILL-P66",
  scope: "Employee",
  userId: "EMP-P66",
  targetLevel: "Advanced",
  targetScore: 90,
  priority: "High",
  createdAt: "2026-11-10T00:00:00.000Z",
};

describe("relational skill-governance authority", () => {
  beforeEach(() => client.query.mockReset());

  it("commits skill creation and audit together", async () => {
    client.query
      .mockResolvedValueOnce({ rows: [{
        id: "SKILL-P66",
        name: "Secure delivery",
        category: "Technical",
        description: "test",
        status: "Active",
        created_at: "2026-11-10T00:00:00.000Z",
      }] })
      .mockResolvedValueOnce({ rows: [] });

    const result = await repository.createSkill({
      actor: { id: "ADMIN-1" },
      skill: {
        id: "SKILL-P66",
        name: "Secure delivery",
        category: "Technical",
        description: "test",
      },
    });

    expect(result).toMatchObject({ id: "SKILL-P66", status: "Active" });
    expect(client.query.mock.calls[1][0]).toContain("INSERT INTO audit_logs");
  });

  it("commits a status transition and audit together", async () => {
    client.query
      .mockResolvedValueOnce({ rows: [{
        id: "SKILL-P66",
        name: "Secure delivery",
        category: "Technical",
        description: "test",
        status: "Inactive",
        created_at: "2026-11-10T00:00:00.000Z",
      }] })
      .mockResolvedValueOnce({ rows: [] });

    const result = await repository.updateSkillStatus({
      actor: { id: "ADMIN-1" },
      id: "SKILL-P66",
      status: "Inactive",
    });

    expect(result.status).toBe("Inactive");
    expect(client.query.mock.calls[1][0]).toContain("INSERT INTO audit_logs");
  });

  it("rejects an unknown skill before writing", async () => {
    client.query.mockResolvedValueOnce({ rows: [] });

    await expect(repository.createTargetSkill({ actor: { id: "ADMIN-1" }, target }))
      .rejects.toMatchObject({ code: "SKILL_NOT_FOUND" });
    expect(client.query).toHaveBeenCalledTimes(1);
  });

  it("rejects a missing active scope reference before writing", async () => {
    client.query
      .mockResolvedValueOnce({ rows: [{ status: "Active" }] })
      .mockResolvedValueOnce({ rows: [] });

    await expect(repository.createTargetSkill({ actor: { id: "ADMIN-1" }, target }))
      .rejects.toMatchObject({ code: "TARGET_SCOPE_NOT_FOUND" });
    expect(client.query).toHaveBeenCalledTimes(2);
  });

  it("validates authority and commits the target plus audit in one transaction", async () => {
    client.query
      .mockResolvedValueOnce({ rows: [{ status: "Active" }] })
      .mockResolvedValueOnce({ rows: [{ exists: true }] })
      .mockResolvedValueOnce({ rows: [{
        id: target.id,
        skill_id: target.skillId,
        scope: target.scope,
        department: null,
        designation: null,
        user_id: target.userId,
        target_level: target.targetLevel,
        target_score: target.targetScore,
        priority: target.priority,
        created_at: target.createdAt,
      }] })
      .mockResolvedValueOnce({ rows: [] });

    const result = await repository.createTargetSkill({ actor: { id: "ADMIN-1" }, target });

    expect(result).toMatchObject({ id: "TS-P66", skillId: "SKILL-P66", userId: "EMP-P66" });
    expect(client.query).toHaveBeenCalledTimes(4);
    expect(client.query.mock.calls[3][0]).toContain("INSERT INTO audit_logs");
  });
});
