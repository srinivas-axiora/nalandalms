import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { registerAI } from "../../backend/src/modules/ai/ai.routes.js";
import { courses } from "../../backend/src/core.js";
import { authCookieFor, testUsers } from "../helpers/auth.js";

const sourceText = "Secure course generation must validate input, scope output, and preserve review before publication.";

describe("AI course generation request boundary", () => {
  let app;
  beforeEach(() => {
    app = express();
    app.use(express.json({ limit: "1mb" }));
    app.use(cookieParser());
    registerAI(app);
  });

  it("rejects oversized source material before generation", async () => {
    const response = await request(app).post("/api/ai/generate-course")
      .set("Cookie", authCookieFor(testUsers.manager))
      .send({ text: "x".repeat(50_001) });
    expect(response.status).toBe(400);
  });

  it("rejects unknown generation controls", async () => {
    const response = await request(app).post("/api/ai/generate-course-stream")
      .set("Cookie", authCookieFor(testUsers.manager))
      .send({ text: sourceText, bypassBudget: true });
    expect(response.status).toBe(400);
  });

  it("returns a reviewable draft without mutating the snapshot course authority", async () => {
    const before = courses.length;
    const response = await request(app).post("/api/ai/generate-course")
      .set("Cookie", authCookieFor(testUsers.manager))
      .send({ text: sourceText });
    expect(response.status).toBe(201);
    expect(response.body.draft).toMatchObject({
      course: { targetLevel: "Beginner" },
      usedFallback: true,
    });
    expect(response.body.draft.chapters).toHaveLength(3);
    expect(courses).toHaveLength(before);
  });
});
