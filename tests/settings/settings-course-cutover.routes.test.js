import cookieParser from "cookie-parser";
import express from "express";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { settingsRepository } from "../../backend/src/repositories/settings.repository.pg.js";
import { authCookieFor, testUsers } from "../helpers/auth.js";

describe("course cutover settings authority", () => {
  const previousCourses = process.env.USE_PG_COURSES;
  const previousSettings = process.env.USE_PG_SETTINGS;
  let app;

  beforeAll(async () => {
    process.env.USE_PG_COURSES = "1";
    process.env.USE_PG_SETTINGS = "0";
    vi.spyOn(settingsRepository, "getProctoring").mockResolvedValue({
      fullscreenRequired: true,
      cameraRequired: true,
      microphoneRequired: false,
      tabSwitchAutoSubmit: true,
      noiseThreshold: 73,
      maxAssessmentFlags: 4,
    });
    const { registerSettings } = await import(
      "../../backend/src/modules/settings/settings.routes.js?phase42-course-cutover"
    );
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    registerSettings(app);
  });

  afterAll(() => {
    vi.restoreAllMocks();
    if (previousCourses === undefined) delete process.env.USE_PG_COURSES;
    else process.env.USE_PG_COURSES = previousCourses;
    if (previousSettings === undefined) delete process.env.USE_PG_SETTINGS;
    else process.env.USE_PG_SETTINGS = previousSettings;
  });

  it("reads proctor policy relationally from the course flag alone", async () => {
    const response = await request(app)
      .get("/api/settings")
      .set("Cookie", authCookieFor(testUsers.admin));

    expect(response.status).toBe(200);
    expect(settingsRepository.getProctoring).toHaveBeenCalledTimes(1);
    expect(response.body.data).toMatchObject({
      tabSwitchAutoSubmit: true,
      noiseThreshold: 73,
      maxAssessmentFlags: 4,
    });
  });
});
