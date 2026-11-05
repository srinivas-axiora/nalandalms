import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { assignmentAuthorityRepository } from "../../backend/src/repositories/assignment-authority.repository.pg.js";
import { authCookieFor, testUsers } from "../helpers/auth.js";

describe("assignment relational cutover selection", () => {
  const previous = process.env.USE_PG_COURSES;
  let app;

  beforeAll(async () => {
    process.env.USE_PG_COURSES = "1";
    const { registerEnrollments } = await import(
      "../../backend/src/modules/enrollments/enrollments.routes.js?phase16-cutover"
    );
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    registerEnrollments(app);
  });

  afterEach(() => vi.restoreAllMocks());
  afterAll(() => {
    if (previous === undefined) delete process.env.USE_PG_COURSES;
    else process.env.USE_PG_COURSES = previous;
  });

  it("registers the transactional assignment handler instead of mutating process-local state", async () => {
    vi.spyOn(assignmentAuthorityRepository, "assignCourse").mockResolvedValue([
      { id: "ENR-RELATIONAL", courseId: "CRS-1", userId: "USR-1" },
    ]);
    const response = await request(app).post("/api/assignments")
      .set("Cookie", authCookieFor(testUsers.manager))
      .send({ courseId: "CRS-1", userIds: ["USR-1"] });

    expect(response.status).toBe(201);
    expect(response.body.data).toEqual([
      { id: "ENR-RELATIONAL", courseId: "CRS-1", userId: "USR-1" },
    ]);
    expect(assignmentAuthorityRepository.assignCourse).toHaveBeenCalledOnce();
  });
});
