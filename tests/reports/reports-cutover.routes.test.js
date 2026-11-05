import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { reportsRepository } from "../../backend/src/repositories/reports.repository.pg.js";
import { authCookieFor, testUsers } from "../helpers/auth.js";

describe("report relational cutover selection", () => {
  const previous = process.env.USE_PG_COURSES;
  let app;

  beforeAll(async () => {
    process.env.USE_PG_COURSES = "1";
    const { registerReports } = await import(
      "../../backend/src/modules/reports/reports.routes.js?phase19-cutover"
    );
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    registerReports(app);
  });
  afterEach(() => vi.restoreAllMocks());
  afterAll(() => {
    if (previous === undefined) delete process.env.USE_PG_COURSES;
    else process.env.USE_PG_COURSES = previous;
  });

  it("uses the durable relational report path rather than snapshot rows", async () => {
    const prepare = vi.spyOn(reportsRepository, "prepareExport").mockResolvedValue({
      id: "RPT-PG", status: "Prepared", downloadUrl: null, rowCount: 0, rows: [],
    });
    const response = await request(app).post("/api/reports/export")
      .set("Cookie", authCookieFor(testUsers.admin))
      .send({ format: "PDF", reportType: "Course", filters: {} });
    expect(response.status).toBe(202);
    expect(response.body.data).toMatchObject({ id: "RPT-PG", downloadUrl: null });
    expect(prepare).toHaveBeenCalledOnce();
  });
});
