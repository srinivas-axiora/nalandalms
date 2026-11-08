import cookieParser from "cookie-parser";
import express from "express";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { identityRepository } from "../../backend/src/repositories/identity.repository.pg.js";
import { securityEvidenceRepository } from "../../backend/src/repositories/security-evidence.repository.pg.js";
import { audit, signToken } from "../../backend/src/domain.js";

describe("course cutover security evidence authority", () => {
  const previousCourses = process.env.USE_PG_COURSES;
  const previousAudit = process.env.USE_PG_AUDIT;
  const admin = {
    id: "ADM-PHASE-46",
    name: "Evidence Administrator",
    email: "phase46@example.invalid",
    role: "Admin",
    status: "Active",
    sessionVersion: 0,
  };
  let app;

  beforeAll(async () => {
    process.env.USE_PG_COURSES = "1";
    process.env.USE_PG_AUDIT = "0";
    vi.spyOn(identityRepository, "findUserById").mockResolvedValue(admin);
    const { registerGovernance } = await import(
      "../../backend/src/modules/governance/governance.routes.js?phase46-course-cutover"
    );
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    registerGovernance(app);
  });

  afterAll(() => {
    vi.restoreAllMocks();
    if (previousCourses === undefined) delete process.env.USE_PG_COURSES;
    else process.env.USE_PG_COURSES = previousCourses;
    if (previousAudit === undefined) delete process.env.USE_PG_AUDIT;
    else process.env.USE_PG_AUDIT = previousAudit;
  });

  it("writes generic evidence durably from the course flag alone", async () => {
    const append = vi.spyOn(securityEvidenceRepository, "appendAudit").mockResolvedValue({
      id: "AUD-WRITE-PHASE-46",
    });

    await audit(admin.id, "PHASE_46_EVIDENCE", "SYSTEM", "course-cutover");

    expect(append).toHaveBeenCalledWith(expect.objectContaining({
      actorId: admin.id,
      action: "PHASE_46_EVIDENCE",
      entityType: "SYSTEM",
      entityId: "course-cutover",
    }));
  });

  it("reads durable audit and security projections from the course flag alone", async () => {
    const audits = vi.spyOn(securityEvidenceRepository, "listAudit").mockResolvedValue({
      data: [{ id: "AUD-PHASE-46" }], total: 1,
    });
    const events = vi.spyOn(securityEvidenceRepository, "listSecurityEvents").mockResolvedValue({
      data: [{ id: "SEC-PHASE-46" }], total: 1,
    });
    const cookie = `token=${signToken(admin)}`;

    const auditResponse = await request(app).get("/api/audit-logs").set("Cookie", cookie);
    const eventResponse = await request(app).get("/api/security-events").set("Cookie", cookie);

    expect(auditResponse.status).toBe(200);
    expect(eventResponse.status).toBe(200);
    expect(audits).toHaveBeenCalledWith({ limit: 50 });
    expect(events).toHaveBeenCalledWith({ limit: 100 });
  });
});
