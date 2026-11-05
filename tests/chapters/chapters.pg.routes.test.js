import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerChaptersPgRoutes } from "../../backend/src/modules/chapters/chapters.pg.routes.js";
import {
  LearningAuthorityError,
  learningAuthorityRepository,
} from "../../backend/src/repositories/learning-authority.repository.pg.js";
import { authCookieFor, testUsers } from "../helpers/auth.js";

describe("PostgreSQL chapter and progress routes", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    registerChaptersPgRoutes(app);
  });

  afterEach(() => vi.restoreAllMocks());

  it("returns the repository's redacted chapter projection", async () => {
    vi.spyOn(learningAuthorityRepository, "listForActor").mockResolvedValue({
      courseVersion: 4,
      chapters: [{ id: "CH-1", isLocked: true, title: "Locked" }],
    });
    const response = await request(app)
      .get("/api/courses/CRS-1/chapters")
      .set("Cookie", authCookieFor(testUsers.employee));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: [{ id: "CH-1", isLocked: true, title: "Locked" }],
      total: 1,
      courseVersion: 4,
    });
  });

  it("requires an optimistic course version for chapter creation", async () => {
    const create = vi.spyOn(learningAuthorityRepository, "createChapter");
    const response = await request(app)
      .post("/api/courses/CRS-1/chapters")
      .set("Cookie", authCookieFor(testUsers.manager))
      .send({ title: "No version" });

    expect(response.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("requires a durable idempotency key before recording heartbeat time", async () => {
    const heartbeat = vi.spyOn(learningAuthorityRepository, "recordHeartbeat");
    const response = await request(app)
      .post("/api/courses/CRS-1/chapters/CH-1/heartbeat")
      .set("Cookie", authCookieFor(testUsers.employee))
      .send({ incrementSeconds: 15 });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("Idempotency-Key");
    expect(heartbeat).not.toHaveBeenCalled();
  });

  it("passes the idempotency key and learner identity to the transaction", async () => {
    vi.spyOn(learningAuthorityRepository, "recordHeartbeat").mockResolvedValue({
      ok: true, effectiveIncrement: 15, replayed: false,
    });
    const response = await request(app)
      .post("/api/courses/CRS-1/chapters/CH-1/heartbeat")
      .set("Cookie", authCookieFor(testUsers.employee))
      .set("Idempotency-Key", "heartbeat-request-1001")
      .send({ incrementSeconds: 15, currentPositionSeconds: 45 });

    expect(response.status).toBe(200);
    expect(learningAuthorityRepository.recordHeartbeat).toHaveBeenCalledWith({
      courseId: "CRS-1",
      chapterId: "CH-1",
      userId: testUsers.employee.id,
      idempotencyKey: "heartbeat-request-1001",
      incrementSeconds: 15,
      currentPositionSeconds: 45,
    });
  });

  it("maps locked-chapter enforcement without returning protected content", async () => {
    vi.spyOn(learningAuthorityRepository, "getProgress").mockRejectedValue(
      new LearningAuthorityError("CHAPTER_LOCKED", "Prerequisite chapter incomplete", {
        requiredChapterId: "CH-0",
      })
    );
    const response = await request(app)
      .get("/api/courses/CRS-1/chapters/CH-1/progress")
      .set("Cookie", authCookieFor(testUsers.employee));

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: "Prerequisite chapter incomplete",
      code: "CHAPTER_LOCKED",
      details: { requiredChapterId: "CH-0" },
    });
  });
});
