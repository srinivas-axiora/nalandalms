import { describe, expect, it, vi } from "vitest";
import { createSecurityEvidenceRepository } from "../../backend/src/repositories/security-evidence.repository.pg.js";

describe("relational security evidence repository", () => {
  it("inserts an idempotent audit record with parameterized values", async () => {
    const row = {
      id: "11111111-1111-4111-8111-111111111111",
      actor_id: "USR-1",
      action: "UPDATE_USER",
      entity_type: "USER",
      entity_id: "USR-2",
      metadata: { fields: ["status"] },
      created_at: new Date("2026-11-06T10:00:00Z"),
    };
    const query = vi.fn().mockResolvedValue({ rows: [row] });
    const repository = createSecurityEvidenceRepository({ query });

    await expect(repository.appendAudit({
      id: row.id,
      actorId: "USR-1",
      action: "UPDATE_USER",
      entityType: "USER",
      entityId: "USR-2",
      metadata: { fields: ["status"] },
    })).resolves.toEqual({
      id: row.id,
      actorId: "USR-1",
      action: "UPDATE_USER",
      entityType: "USER",
      entityId: "USR-2",
      metadata: { fields: ["status"] },
      createdAt: "2026-11-06T10:00:00.000Z",
    });
    expect(query.mock.calls[0][0]).toContain("ON CONFLICT (id) DO NOTHING");
    expect(query.mock.calls[0][1]).toContain(`runtime:${row.id}`);
  });

  it("bounds request-derived security telemetry before insertion", async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repository = createSecurityEvidenceRepository({ query });
    await repository.appendSecurityEvent({
      id: "22222222-2222-4222-8222-222222222222",
      type: "AUTHORIZATION_DENIED",
      method: "GET",
      path: `/${"x".repeat(3000)}`,
      userAgent: "u".repeat(2000),
      metadata: {},
    });
    const values = query.mock.calls[0][1];
    expect(values[5]).toHaveLength(2048);
    expect(values[6]).toHaveLength(1024);
  });

  it("maps bounded audit and security-event projections with totals", async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [{
        id: "a", actor_id: null, action: "LOGIN", entity_type: "USER",
        entity_id: "USR-1", metadata: {}, created_at: "2026-11-06T10:00:00Z", total_count: 7,
      }] })
      .mockResolvedValueOnce({ rows: [{
        id: "s", event_type: "RATE_LIMITED", actor_id: "USR-1", ip_address: "127.0.0.1",
        http_method: "POST", request_path: "/api/x", user_agent: "test", request_id: "req-1",
        metadata: { statusCode: 429 }, created_at: "2026-11-06T10:01:00Z", total_count: 3,
      }] });
    const repository = createSecurityEvidenceRepository({ query });
    const audits = await repository.listAudit({ limit: 25 });
    const security = await repository.listSecurityEvents({ limit: 50 });
    expect(audits.total).toBe(7);
    expect(audits.data[0].action).toBe("LOGIN");
    expect(security.total).toBe(3);
    expect(security.data[0]).toMatchObject({ type: "RATE_LIMITED", requestId: "req-1" });
  });

  it("rejects invalid page limits before querying", async () => {
    const query = vi.fn();
    const repository = createSecurityEvidenceRepository({ query });
    await expect(repository.listAudit({ limit: 0 })).rejects.toThrow("between 1 and 200");
    await expect(repository.listSecurityEvents({ limit: 501 })).rejects.toThrow("between 1 and 500");
    expect(query).not.toHaveBeenCalled();
  });
});
