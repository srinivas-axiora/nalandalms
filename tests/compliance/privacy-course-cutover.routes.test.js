import cookieParser from "cookie-parser";
import express from "express";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { identityRepository } from "../../backend/src/repositories/identity.repository.pg.js";
import { privacyPgRepository } from "../../backend/src/repositories/privacy.repository.pg.js";
import { signToken } from "../../backend/src/domain.js";

describe("course cutover privacy authority", () => {
  const previousCourses = process.env.USE_PG_COURSES;
  const previousPrivacy = process.env.USE_PG_PRIVACY;
  const user = {
    id: "USR-PHASE-45",
    name: "Privacy Subject",
    email: "phase45@example.invalid",
    role: "Learner",
    status: "Active",
    sessionVersion: 0,
  };
  let app;

  beforeAll(async () => {
    process.env.USE_PG_COURSES = "1";
    process.env.USE_PG_PRIVACY = "0";
    vi.spyOn(identityRepository, "findUserById").mockResolvedValue(user);
    vi.spyOn(privacyPgRepository, "getForUser").mockResolvedValue({
      id: "PRIV-PHASE-45",
      userId: user.id,
      status: "GracePeriod",
      requestedAt: "2026-11-08T16:00:00.000Z",
      graceEndsAt: "2026-12-08T16:00:00.000Z",
      coverageVersion: "normalized-v2",
    });
    const { registerPrivacyCompliance } = await import(
      "../../backend/src/modules/governance/privacy.routes.js?phase45-course-cutover"
    );
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    registerPrivacyCompliance(app);
  });

  afterAll(() => {
    vi.restoreAllMocks();
    if (previousCourses === undefined) delete process.env.USE_PG_COURSES;
    else process.env.USE_PG_COURSES = previousCourses;
    if (previousPrivacy === undefined) delete process.env.USE_PG_PRIVACY;
    else process.env.USE_PG_PRIVACY = previousPrivacy;
  });

  it("reads the durable deletion workflow from the course flag alone", async () => {
    const response = await request(app)
      .get("/api/users/me/delete-request")
      .set("Cookie", `token=${signToken(user)}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      id: "PRIV-PHASE-45",
      status: "GracePeriod",
      coverageVersion: "normalized-v2",
    });
    expect(privacyPgRepository.getForUser).toHaveBeenCalledWith(user.id);
  });
});
