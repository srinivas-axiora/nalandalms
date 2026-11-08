import cookieParser from "cookie-parser";
import express from "express";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { identityRepository } from "../../backend/src/repositories/identity.repository.pg.js";
import { signToken } from "../../backend/src/domain.js";

describe("course cutover identity authority", () => {
  const previousCourses = process.env.USE_PG_COURSES;
  const previousIdentity = process.env.USE_PG_IDENTITY;
  const user = {
    id: "USR-PHASE-44",
    name: "Relational Identity",
    email: "phase44@example.invalid",
    role: "Learner",
    status: "Active",
    sessionVersion: 7,
  };
  let app;

  beforeAll(async () => {
    process.env.USE_PG_COURSES = "1";
    process.env.USE_PG_IDENTITY = "0";
    vi.spyOn(identityRepository, "findUserById").mockResolvedValue(user);
    const { authenticate } = await import("../../backend/src/middleware.js?phase44-course-cutover");
    app = express();
    app.use(cookieParser());
    app.get("/protected", authenticate, (req, res) => res.json({ userId: req.user.id }));
  });

  afterAll(() => {
    vi.restoreAllMocks();
    if (previousCourses === undefined) delete process.env.USE_PG_COURSES;
    else process.env.USE_PG_COURSES = previousCourses;
    if (previousIdentity === undefined) delete process.env.USE_PG_IDENTITY;
    else process.env.USE_PG_IDENTITY = previousIdentity;
  });

  it("validates the session against relational identity from the course flag alone", async () => {
    const response = await request(app)
      .get("/protected")
      .set("Cookie", `token=${signToken(user)}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ userId: user.id });
    expect(identityRepository.findUserById).toHaveBeenCalledWith(user.id);
  });
});
