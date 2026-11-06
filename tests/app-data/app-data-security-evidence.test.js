import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { authCookieFor, testUsers } from "../helpers/auth.js";
import { securityEvidenceRepository } from "../../backend/src/repositories/security-evidence.repository.pg.js";

describe("relational app-data security evidence projection", () => {
  const previous = process.env.USE_PG_AUDIT;
  let app;

  beforeAll(async () => {
    process.env.USE_PG_AUDIT = "1";
    ({ app } = await import("../../backend/server.js?phase32-app-data-evidence"));
  }, 30_000);
  afterEach(() => vi.restoreAllMocks());
  afterAll(() => {
    if (previous === undefined) delete process.env.USE_PG_AUDIT;
    else process.env.USE_PG_AUDIT = previous;
  });

  it("uses relational audit and security projections for administrators", async () => {
    const audits = vi.spyOn(securityEvidenceRepository, "listAudit").mockResolvedValue({
      data: [{ id: "AUD-PG", action: "LOGIN" }], total: 1,
    });
    const security = vi.spyOn(securityEvidenceRepository, "listSecurityEvents").mockResolvedValue({
      data: [{ id: "SEC-PG", type: "AUTHORIZATION_DENIED" }], total: 1,
    });

    const response = await request(app).get("/api/app-data")
      .set("Cookie", authCookieFor(testUsers.admin));

    expect(response.status).toBe(200);
    expect(response.body.auditLogs).toEqual([{ id: "AUD-PG", action: "LOGIN" }]);
    expect(response.body.securityEvents).toEqual([{ id: "SEC-PG", type: "AUTHORIZATION_DENIED" }]);
    expect(audits).toHaveBeenCalledWith({ limit: 200 });
    expect(security).toHaveBeenCalledWith({ limit: 500 });
  });
});
