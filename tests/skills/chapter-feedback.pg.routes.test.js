import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { authCookieFor, testUsers } from "../helpers/auth.js";
import * as skillsRepository from "../../backend/src/repositories/skills.repository.pg.js";

describe("relational chapter feedback route", () => {
  const previous = process.env.USE_PG_SKILLS;
  let app;
  beforeAll(async () => {
    process.env.USE_PG_SKILLS = "1";
    const { registerSkills } = await import("../../backend/src/modules/skills/skills.routes.js?phase24-feedback");
    app = express(); app.use(express.json()); app.use(cookieParser()); registerSkills(app);
  });
  afterEach(() => vi.restoreAllMocks());
  afterAll(() => {
    if (previous === undefined) delete process.env.USE_PG_SKILLS;
    else process.env.USE_PG_SKILLS = previous;
  });

  it("delegates identity-bound feedback to relational enrollment authority", async () => {
    const upsert = vi.spyOn(skillsRepository, "upsertChapterFeedback").mockResolvedValue({ id: "CF-PG", userId: testUsers.employee.id });
    const response = await request(app).post("/api/chapter-feedbacks")
      .set("Cookie", authCookieFor(testUsers.employee))
      .send({ chapterId: "CH-1", courseId: "CRS-1", rating: 5, clarity: 4, relevance: 5, comments: "Useful" });
    expect(response.status).toBe(201);
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({
      actor: expect.objectContaining({ id: testUsers.employee.id }),
      feedback: expect.objectContaining({ chapterId: "CH-1", courseId: "CRS-1" }),
    }));
  });

  it("maps missing enrollment or mismatched chapter authority to forbidden", async () => {
    vi.spyOn(skillsRepository, "upsertChapterFeedback").mockRejectedValue(
      new skillsRepository.SkillFeedbackRepositoryError("FEEDBACK_SCOPE_DENIED", "denied"),
    );
    const response = await request(app).post("/api/chapter-feedbacks")
      .set("Cookie", authCookieFor(testUsers.employee))
      .send({ chapterId: "CH-1", courseId: "CRS-X", rating: 5, clarity: 4, relevance: 5, comments: "Useful" });
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FEEDBACK_SCOPE_DENIED");
  });
});
