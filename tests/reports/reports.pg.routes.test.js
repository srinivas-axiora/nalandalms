import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerReportsPgRoutes } from "../../backend/src/modules/reports/reports.pg.routes.js";
import { reportsRepository } from "../../backend/src/repositories/reports.repository.pg.js";
import { authCookieFor, testUsers } from "../helpers/auth.js";

describe("PostgreSQL report routes", () => {
  let app;
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    registerReportsPgRoutes(app);
  });
  afterEach(() => vi.restoreAllMocks());

  it("delegates validated filters and authenticated scope to relational authority", async () => {
    const prepare = vi.spyOn(reportsRepository, "prepareExport").mockResolvedValue({
      id: "RPT-1", status: "Prepared", rowCount: 0, rows: [],
    });
    const response = await request(app).post("/api/reports/export")
      .set("Cookie", authCookieFor(testUsers.manager))
      .send({ format: "Excel", reportType: "Team", filters: { team: "Blue" } });

    expect(response.status).toBe(202);
    expect(prepare).toHaveBeenCalledWith({
      actor: expect.objectContaining({ id: testUsers.manager.id, role: testUsers.manager.role }),
      format: "Excel", reportType: "Team", filters: { team: "Blue" },
    });
  });

  it("rejects unknown filters without touching the repository", async () => {
    const prepare = vi.spyOn(reportsRepository, "prepareExport");
    const response = await request(app).post("/api/reports/export")
      .set("Cookie", authCookieFor(testUsers.manager))
      .send({ format: "PDF", reportType: "User", filters: { sql: "all" } });
    expect(response.status).toBe(400);
    expect(prepare).not.toHaveBeenCalled();
  });

  it("does not allow learners to prepare privileged exports", async () => {
    const response = await request(app).post("/api/reports/export")
      .set("Cookie", authCookieFor(testUsers.employee))
      .send({ format: "PDF", reportType: "User", filters: {} });
    expect(response.status).toBe(403);
  });

  it("returns scoped report status without exposing the private storage key", async () => {
    const reportId = "8a14967f-687d-4ab0-a253-ae01da76ecb8";
    vi.spyOn(reportsRepository, "getAccessibleById").mockResolvedValue({
      id: reportId, requestedBy: testUsers.manager.id, status: "Ready",
      artifactAvailable: true, storageKey: "reports/private/report.pdf",
    });
    const response = await request(app).get(`/api/reports/${reportId}`)
      .set("Cookie", authCookieFor(testUsers.manager));
    expect(response.status).toBe(200);
    expect(response.body.data).not.toHaveProperty("storageKey");
    expect(response.body.data).toMatchObject({ id: reportId, artifactAvailable: true });
  });

  it("refuses a download until the worker has completed the artifact", async () => {
    const reportId = "8a14967f-687d-4ab0-a253-ae01da76ecb8";
    vi.spyOn(reportsRepository, "getAccessibleById").mockResolvedValue({ id: reportId, status: "Processing", storageKey: null });
    const response = await request(app).get(`/api/reports/${reportId}/download`)
      .set("Cookie", authCookieFor(testUsers.manager));
    expect(response.status).toBe(409);
    expect(response.body.code).toBe("REPORT_NOT_READY");
  });

  it("issues and audits a short-lived grant only for an accessible ready artifact", async () => {
    const reportId = "8a14967f-687d-4ab0-a253-ae01da76ecb8";
    vi.spyOn(reportsRepository, "getAccessibleById").mockResolvedValue({
      id: reportId, reportType: "Team", format: "PDF", status: "Ready",
      storageKey: `reports/${reportId}/artifact.pdf`,
    });
    const audit = vi.spyOn(reportsRepository, "recordDownload").mockResolvedValue(undefined);
    const response = await request(app).get(`/api/reports/${reportId}/download`)
      .set("Cookie", authCookieFor(testUsers.manager));
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ expiresInSeconds: 300 });
    expect(response.body.downloadUrl).toMatch(/^\/api\/uploads\/download\?token=/);
    expect(audit).toHaveBeenCalledWith({ reportId, actorId: testUsers.manager.id });
  });
});
