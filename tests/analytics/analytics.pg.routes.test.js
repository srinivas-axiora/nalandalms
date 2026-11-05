import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerAnalyticsPgRoutes } from "../../backend/src/modules/analytics/analytics.pg.routes.js";
import { analyticsRepository } from "../../backend/src/repositories/analytics.repository.pg.js";
import { authCookieFor, testUsers } from "../helpers/auth.js";

describe("PostgreSQL analytics routes", () => {
  let app;
  beforeEach(() => {
    app = express();
    app.use(cookieParser());
    registerAnalyticsPgRoutes(app);
  });
  afterEach(() => vi.restoreAllMocks());

  it("delegates global analytics to relational authority", async () => {
    vi.spyOn(analyticsRepository, "globalOverview").mockResolvedValue({ users: 4, completionRate: 60 });
    const response = await request(app).get("/api/analytics/global")
      .set("Cookie", authCookieFor(testUsers.admin));
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ users: 4, completionRate: 60 });
  });

  it("summarizes relational time rows without process-local events", async () => {
    vi.spyOn(analyticsRepository, "timeRows").mockResolvedValue([
      { userId: "USR-1", courseId: "CRS-1", chapterTimeSeconds: 10, assessmentTimeSeconds: 20, courseTimeSeconds: 30 },
      { userId: "USR-1", courseId: "CRS-1", chapterTimeSeconds: 5, assessmentTimeSeconds: 5, courseTimeSeconds: 30 },
    ]);
    vi.spyOn(analyticsRepository, "countTimeEvents").mockResolvedValue(2);
    const response = await request(app).get("/api/analytics/time")
      .set("Cookie", authCookieFor(testUsers.manager));
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: [
        { userId: "USR-1", courseId: "CRS-1", chapterTimeSeconds: 10, assessmentTimeSeconds: 20, courseTimeSeconds: 30 },
        { userId: "USR-1", courseId: "CRS-1", chapterTimeSeconds: 5, assessmentTimeSeconds: 5, courseTimeSeconds: 30 },
      ],
      total: 2, eventCount: 2,
      summary: { chapterTimeSeconds: 15, assessmentTimeSeconds: 25, courseTimeSeconds: 30 },
    });
  });

  it("rejects invalid event limits before repository access", async () => {
    const list = vi.spyOn(analyticsRepository, "listTimeEvents");
    const response = await request(app).get("/api/analytics/time/events?limit=501")
      .set("Cookie", authCookieFor(testUsers.manager));
    expect(response.status).toBe(400);
    expect(list).not.toHaveBeenCalled();
  });
});
