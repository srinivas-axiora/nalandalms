import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { analyticsRepository } from "../../backend/src/repositories/analytics.repository.pg.js";
import { authCookieFor, testUsers } from "../helpers/auth.js";

describe("analytics relational cutover selection", () => {
  const previous = process.env.USE_PG_COURSES;
  let app;

  beforeAll(async () => {
    process.env.USE_PG_COURSES = "1";
    const { registerAnalytics } = await import(
      "../../backend/src/modules/analytics/analytics.routes.js?phase18-cutover"
    );
    app = express();
    app.use(cookieParser());
    registerAnalytics(app);
  });
  afterEach(() => vi.restoreAllMocks());
  afterAll(() => {
    if (previous === undefined) delete process.env.USE_PG_COURSES;
    else process.env.USE_PG_COURSES = previous;
  });

  it("registers database-derived personal analytics rather than hard-coded metrics", async () => {
    vi.spyOn(analyticsRepository, "personalOverview").mockResolvedValue({
      userId: testUsers.employee.id, progress: 42, completedCourses: 1, pendingCourses: 2,
      strengths: [], weaknesses: [], suggestions: [],
    });
    const response = await request(app).get("/api/analytics/me")
      .set("Cookie", authCookieFor(testUsers.employee));
    expect(response.status).toBe(200);
    expect(response.body.progress).toBe(42);
    expect(analyticsRepository.personalOverview).toHaveBeenCalledWith(testUsers.employee.id);
  });
});
