import cookieParser from "cookie-parser";
import express from "express";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import * as skillsRepository from "../../backend/src/repositories/skills.repository.pg.js";
import { authCookieFor, testUsers } from "../helpers/auth.js";

describe("course cutover competency authority", () => {
  const previousCourses = process.env.USE_PG_COURSES;
  const previousSkills = process.env.USE_PG_SKILLS;
  const previousGlobalPg = process.env.USE_PG;
  let app;

  beforeAll(async () => {
    process.env.USE_PG_COURSES = "1";
    process.env.USE_PG_SKILLS = "0";
    process.env.USE_PG = "0";
    vi.spyOn(skillsRepository, "upsertChapterFeedback").mockResolvedValue({
      id: "CF-PHASE-43",
      userId: testUsers.employee.id,
      chapterId: "CH-PHASE-43",
      courseId: "CRS-PHASE-43",
    });
    const { registerSkills } = await import(
      "../../backend/src/modules/skills/skills.routes.js?phase43-course-cutover"
    );
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    registerSkills(app);
  });

  afterAll(() => {
    vi.restoreAllMocks();
    if (previousCourses === undefined) delete process.env.USE_PG_COURSES;
    else process.env.USE_PG_COURSES = previousCourses;
    if (previousSkills === undefined) delete process.env.USE_PG_SKILLS;
    else process.env.USE_PG_SKILLS = previousSkills;
    if (previousGlobalPg === undefined) delete process.env.USE_PG;
    else process.env.USE_PG = previousGlobalPg;
  });

  it("writes chapter feedback relationally from the course flag alone", async () => {
    const response = await request(app)
      .post("/api/chapter-feedbacks")
      .set("Cookie", authCookieFor(testUsers.employee))
      .send({
        chapterId: "CH-PHASE-43",
        courseId: "CRS-PHASE-43",
        rating: 5,
        clarity: 4,
        relevance: 5,
        comments: "Relational feedback",
      });

    expect(response.status).toBe(201);
    expect(skillsRepository.upsertChapterFeedback).toHaveBeenCalledWith(expect.objectContaining({
      actor: expect.objectContaining({ id: testUsers.employee.id }),
      feedback: expect.objectContaining({
        chapterId: "CH-PHASE-43",
        courseId: "CRS-PHASE-43",
      }),
    }));
  });
});
