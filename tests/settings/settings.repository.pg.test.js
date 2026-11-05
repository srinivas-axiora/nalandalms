import { describe, expect, it, vi } from "vitest";
import { createSettingsRepository } from "../../backend/src/repositories/settings.repository.pg.js";

describe("relational operational settings repository", () => {
  it("locks, merges and audits a settings update atomically", async () => {
    const query = vi.fn(async (sql, params) => {
      if (sql.includes("FOR UPDATE")) {
        return { rows: [{ value: { fullscreenRequired: true, noiseThreshold: 70, maxAssessmentFlags: 2 } }] };
      }
      if (sql.includes("UPDATE system_settings")) {
        const value = JSON.parse(params[0]);
        expect(value).toMatchObject({ fullscreenRequired: true, noiseThreshold: 80, maxAssessmentFlags: 2 });
        return { rows: [{ value }] };
      }
      if (sql.includes("INSERT INTO audit_logs")) return { rows: [], rowCount: 1 };
      throw new Error("unexpected query");
    });
    const repository = createSettingsRepository({ query, withTransaction: vi.fn((fn) => fn({ query })) });
    const result = await repository.updateProctoring({ actorId: "ADMIN-1", patch: { noiseThreshold: 80 } });
    expect(result.noiseThreshold).toBe(80);
    expect(query.mock.calls.some(([sql]) => sql.includes("INSERT INTO audit_logs"))).toBe(true);
  });

  it("fails closed when settings were not initialized", async () => {
    const repository = createSettingsRepository({
      query: vi.fn().mockResolvedValue({ rows: [] }), withTransaction: vi.fn(),
    });
    await expect(repository.getProctoring()).rejects.toMatchObject({ code: "SETTINGS_NOT_INITIALIZED" });
  });
});
