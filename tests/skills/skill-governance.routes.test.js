import cookieParser from "cookie-parser";
import express from "express";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { skills, targetSkills, users } from "../../backend/src/core.js";
import { authCookieFor, stepUpCookieFor, testUsers } from "../helpers/auth.js";

describe("skill governance boundaries", () => {
  const previousSkills = process.env.USE_PG_SKILLS;
  const previousCourses = process.env.USE_PG_COURSES;
  const previousGlobal = process.env.USE_PG;
  let app;

  beforeAll(async () => {
    process.env.USE_PG_SKILLS = "0";
    process.env.USE_PG_COURSES = "0";
    process.env.USE_PG = "0";
    const { registerSkills } = await import(
      "../../backend/src/modules/skills/skills.routes.js?phase66-snapshot"
    );
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    registerSkills(app);
  });

  afterAll(() => {
    if (previousSkills === undefined) delete process.env.USE_PG_SKILLS;
    else process.env.USE_PG_SKILLS = previousSkills;
    if (previousCourses === undefined) delete process.env.USE_PG_COURSES;
    else process.env.USE_PG_COURSES = previousCourses;
    if (previousGlobal === undefined) delete process.env.USE_PG;
    else process.env.USE_PG = previousGlobal;
  });

  const adminCookies = (stepUp = true) => [
    authCookieFor(testUsers.admin),
    ...(stepUp ? [stepUpCookieFor(testUsers.admin)] : []),
  ];

  const validTarget = (overrides = {}) => ({
    skillId: skills.find((skill) => skill.status === "Active").id,
    scope: "Employee",
    userId: users.find((user) => user.status === "Active" && user.role === "Employee").id,
    targetLevel: "Intermediate",
    targetScore: 80,
    priority: "High",
    ...overrides,
  });

  it("requires recent re-authentication for skill administration", async () => {
    const response = await request(app)
      .post("/api/skills")
      .set("Cookie", adminCookies(false))
      .send({ name: "Phase 66 skill", category: "Technical", description: "test" });

    expect(response.status).toBe(412);
    expect(response.body.code).toBe("STEP_UP_REQUIRED");
  });

  it("rejects unknown status values on canonical and compatibility routes", async () => {
    const skill = skills[0];
    const canonical = await request(app)
      .patch(`/api/skills/${skill.id}/status`)
      .set("Cookie", adminCookies())
      .send({ status: "Deleted" });
    const compatibility = await request(app)
      .patch(`/api/skills/${skill.id}`)
      .set("Cookie", adminCookies())
      .send({ status: "Deleted" });

    expect(canonical.status).toBe(400);
    expect(compatibility.status).toBe(400);
    expect(compatibility.headers.deprecation).toBe("true");
  });

  it("enforces exact scope fields", async () => {
    const response = await request(app)
      .post("/api/skills/targets")
      .set("Cookie", adminCookies())
      .send(validTarget({ scope: "Organization", userId: "EMP-1004" }));

    expect(response.status).toBe(400);
    expect(response.body.error.fieldErrors.userId).toBeDefined();
  });

  it("rejects missing and inactive skills", async () => {
    const missing = await request(app)
      .post("/api/skills/targets")
      .set("Cookie", adminCookies())
      .send(validTarget({ skillId: "SKILL-NOT-FOUND" }));

    const inactiveSkill = { ...skills[0], id: "SKILL-P66-INACTIVE", status: "Inactive" };
    skills.push(inactiveSkill);
    try {
      const inactive = await request(app)
        .post("/api/skills/targets")
        .set("Cookie", adminCookies())
        .send(validTarget({ skillId: inactiveSkill.id }));
      expect(inactive.status).toBe(409);
      expect(inactive.body.code).toBe("SKILL_INACTIVE");
    } finally {
      skills.splice(skills.findIndex((skill) => skill.id === inactiveSkill.id), 1);
    }

    expect(missing.status).toBe(404);
    expect(missing.body.code).toBe("SKILL_NOT_FOUND");
  });

  it("requires a live scope reference and accepts a valid target", async () => {
    const missingUser = await request(app)
      .post("/api/skills/targets")
      .set("Cookie", adminCookies())
      .send(validTarget({ userId: "EMP-NOT-FOUND" }));
    expect(missingUser.status).toBe(422);
    expect(missingUser.body.code).toBe("TARGET_SCOPE_NOT_FOUND");

    const valid = await request(app)
      .post("/api/target-skills")
      .set("Cookie", adminCookies())
      .send(validTarget());
    expect(valid.status).toBe(201);
    expect(valid.headers.deprecation).toBe("true");
    expect(valid.body.data.id).toMatch(/^TS-/);
    targetSkills.splice(targetSkills.findIndex((target) => target.id === valid.body.data.id), 1);
  });
});
