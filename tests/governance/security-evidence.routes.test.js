import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { authCookieFor, testUsers } from "../helpers/auth.js";
import { securityEvidenceRepository } from "../../backend/src/repositories/security-evidence.repository.pg.js";

describe("relational governance evidence routes", () => {
  const previous = process.env.USE_PG_AUDIT;
  let app;

  beforeAll(async () => {
    process.env.USE_PG_AUDIT = "1";
    const { registerGovernance } = await import("../../backend/src/modules/governance/governance.routes.js?phase32-evidence");
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    registerGovernance(app);
  });
  afterEach(() => vi.restoreAllMocks());
  afterAll(() => {
    if (previous === undefined) delete process.env.USE_PG_AUDIT;
    else process.env.USE_PG_AUDIT = previous;
  });

  it("reads audit and security projections only through PostgreSQL", async () => {
    const audits = vi.spyOn(securityEvidenceRepository, "listAudit").mockResolvedValue({ data: [{ id: "a" }], total: 1 });
    const events = vi.spyOn(securityEvidenceRepository, "listSecurityEvents").mockResolvedValue({ data: [{ id: "s" }], total: 1 });
    const cookie = authCookieFor(testUsers.admin);
    const auditResponse = await request(app).get("/api/audit-logs?limit=25").set("Cookie", cookie);
    const eventResponse = await request(app).get("/api/security-events?limit=50").set("Cookie", cookie);
    expect(auditResponse.status).toBe(200);
    expect(eventResponse.status).toBe(200);
    expect(audits).toHaveBeenCalledWith({ limit: 25 });
    expect(events).toHaveBeenCalledWith({ limit: 50 });
  });

  it("rejects invalid limits before repository access", async () => {
    const list = vi.spyOn(securityEvidenceRepository, "listAudit");
    const response = await request(app).get("/api/audit-logs?limit=999").set("Cookie", authCookieFor(testUsers.admin));
    expect(response.status).toBe(400);
    expect(list).not.toHaveBeenCalled();
  });
});
