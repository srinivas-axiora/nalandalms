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
});
