import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { aiFeedbackRepository } from "../../backend/src/repositories/ai-feedback.repository.pg.js";
import { authCookieFor, testUsers } from "../helpers/auth.js";

describe("relational AI feedback routes", () => {
  const previous = process.env.USE_PG_COURSES;
  let app;
  beforeAll(async () => {
    process.env.USE_PG_COURSES = "1";
    const { registerAI } = await import("../../backend/src/modules/ai/ai.routes.js?phase21-feedback");
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    registerAI(app);
  });
  afterEach(() => vi.restoreAllMocks());
  afterAll(() => {
    if (previous === undefined) delete process.env.USE_PG_COURSES;
    else process.env.USE_PG_COURSES = previous;
  });

  it("lists only through the relational scoped repository", async () => {
    const list = vi.spyOn(aiFeedbackRepository, "list").mockResolvedValue([{ id: "FDB-1", createdBy: testUsers.manager.id }]);
    const response = await request(app).get("/api/ai/generation-feedback")
      .set("Cookie", authCookieFor(testUsers.manager));
    expect(response.status).toBe(200);
    expect(list).toHaveBeenCalledWith(expect.objectContaining({ id: testUsers.manager.id }));
  });

  it("persists strictly validated feedback through relational authority", async () => {
    const create = vi.spyOn(aiFeedbackRepository, "create").mockResolvedValue({ id: "FDB-1" });
    const feedback = {
      skillName: "Security", courseLevel: "Advanced", feedbackType: "Overall",
      rating: 2, comment: "Add stronger authorization examples.",
    };
    const response = await request(app).post("/api/ai/generation-feedback")
      .set("Cookie", authCookieFor(testUsers.manager)).send(feedback);
    expect(response.status).toBe(201);
    expect(create).toHaveBeenCalledWith({
      actor: expect.objectContaining({ id: testUsers.manager.id }), feedback,
    });
  });
});
