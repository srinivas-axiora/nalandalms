import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { authCookieFor, testUsers } from "../helpers/auth.js";
import { courseAuthorityRepository } from "../../backend/src/repositories/courses-authority.repository.pg.js";
import * as enrollmentsRepository from "../../backend/src/repositories/enrollments.repository.pg.js";
import * as chaptersRepository from "../../backend/src/repositories/chapters.repository.pg.js";
import { attemptsRepository } from "../../backend/src/repositories/attempts.repository.pg.js";
import { assessmentAuthorityRepository } from "../../backend/src/repositories/assessment-authority.repository.pg.js";
import { reportsRepository } from "../../backend/src/repositories/reports.repository.pg.js";
import { aiFeedbackRepository } from "../../backend/src/repositories/ai-feedback.repository.pg.js";
import { analyticsRepository } from "../../backend/src/repositories/analytics.repository.pg.js";
import * as skillsRepository from "../../backend/src/repositories/skills.repository.pg.js";

describe("relational app-data secondary projections", () => {
  const previous = process.env.USE_PG_COURSES;
  const previousSkills = process.env.USE_PG_SKILLS;
  let app;

  beforeAll(async () => {
    process.env.USE_PG_COURSES = "1";
    process.env.USE_PG_SKILLS = "1";
    ({ app } = await import("../../backend/server.js?phase23-app-data"));
  }, 30_000);
  afterEach(() => vi.restoreAllMocks());
  afterAll(() => {
    if (previous === undefined) delete process.env.USE_PG_COURSES;
    else process.env.USE_PG_COURSES = previous;
    if (previousSkills === undefined) delete process.env.USE_PG_SKILLS;
    else process.env.USE_PG_SKILLS = previousSkills;
  });

  it("uses scoped relational reports and AI feedback instead of snapshot arrays", async () => {
    vi.spyOn(courseAuthorityRepository, "listVisible").mockResolvedValue([]);
    vi.spyOn(enrollmentsRepository, "listEnrollments").mockResolvedValue([]);
    vi.spyOn(chaptersRepository, "listChapters").mockResolvedValue([]);
    vi.spyOn(attemptsRepository, "list").mockResolvedValue([]);
    vi.spyOn(attemptsRepository, "listProctorEvents").mockResolvedValue([]);
    vi.spyOn(assessmentAuthorityRepository, "listVisible").mockResolvedValue([]);
    const reportList = vi.spyOn(reportsRepository, "listAccessible").mockResolvedValue([
      { id: "RPT-PG", requestedBy: testUsers.manager.id, status: "Ready", artifactAvailable: true },
    ]);
    const feedbackList = vi.spyOn(aiFeedbackRepository, "list").mockResolvedValue([
      { id: "FB-PG", createdBy: testUsers.manager.id, comment: "Scoped feedback" },
    ]);
    vi.spyOn(analyticsRepository, "listTimeEvents").mockResolvedValue([]);
    vi.spyOn(skillsRepository, "listSkills").mockResolvedValue([]);
    vi.spyOn(skillsRepository, "listTargetSkills").mockResolvedValue([]);
    vi.spyOn(skillsRepository, "listSkillRatings").mockResolvedValue([
      { id: "RATE-PG", userId: testUsers.manager.id, skill: "Security", score: 80 },
    ]);
    vi.spyOn(skillsRepository, "listChapterFeedback").mockResolvedValue([
      { id: "CF-PG", userId: testUsers.manager.id, chapterId: "CH-1" },
    ]);

    const response = await request(app).get("/api/app-data")
      .set("Cookie", authCookieFor(testUsers.manager));

    expect(response.status).toBe(200);
    expect(response.body.reportExports).toEqual([
      expect.objectContaining({ id: "RPT-PG", artifactAvailable: true }),
    ]);
    expect(response.body.acharyaFeedbackMemory).toEqual([
      expect.objectContaining({ id: "FB-PG", createdBy: testUsers.manager.id }),
    ]);
    expect(response.body.skillRatings).toEqual([expect.objectContaining({ id: "RATE-PG" })]);
    expect(response.body.chapterFeedbacks).toEqual([expect.objectContaining({ id: "CF-PG" })]);
    expect(reportList).toHaveBeenCalledWith({ actor: expect.objectContaining({ id: testUsers.manager.id }) });
    expect(feedbackList).toHaveBeenCalledWith(expect.objectContaining({ id: testUsers.manager.id }), 25);
  });
});
