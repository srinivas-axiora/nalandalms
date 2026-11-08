import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

describe("relational app-data identity scope", () => {
  const previousIdentity = process.env.USE_PG_IDENTITY;
  const previousCourses = process.env.USE_PG_COURSES;
  let request;
  let app;
  let authCookie;

  beforeAll(async () => {
    process.env.USE_PG_IDENTITY = "1";
    process.env.USE_PG_COURSES = "1";

    const manager = {
      id: "MGR-REL", name: "Relational Manager", email: "manager@example.invalid",
      role: "Manager", status: "Active", managerId: null, sessionVersion: 0,
    };
    const subordinate = {
      id: "USR-REL", name: "Relational User", email: "user@example.invalid",
      role: "Learner", status: "Active", managerId: manager.id, sessionVersion: 0,
    };
    const outsider = {
      id: "USR-OUT", name: "Outsider", email: "outsider@example.invalid",
      role: "Learner", status: "Active", managerId: null, sessionVersion: 0,
    };

    const { identityRepository } = await import("../../backend/src/repositories/identity.repository.pg.js");
    vi.spyOn(identityRepository, "findUserById").mockResolvedValue(manager);
    vi.spyOn(identityRepository, "listUsers").mockResolvedValue([manager, subordinate]);

    const { courseAuthorityRepository } = await import("../../backend/src/repositories/courses-authority.repository.pg.js");
    vi.spyOn(courseAuthorityRepository, "listVisible").mockResolvedValue([{ id: "CRS-REL" }]);
    const enrollments = await import("../../backend/src/repositories/enrollments.repository.pg.js");
    vi.spyOn(enrollments, "listEnrollments").mockResolvedValue([
      { id: "ENR-IN", userId: subordinate.id, courseId: "CRS-REL" },
      { id: "ENR-OUT", userId: outsider.id, courseId: "CRS-REL" },
    ]);
    const chapters = await import("../../backend/src/repositories/chapters.repository.pg.js");
    vi.spyOn(chapters, "listChapters").mockResolvedValue([]);
    const { attemptsRepository } = await import("../../backend/src/repositories/attempts.repository.pg.js");
    vi.spyOn(attemptsRepository, "list").mockResolvedValue([
      { id: "ATT-IN", userId: subordinate.id }, { id: "ATT-OUT", userId: outsider.id },
    ]);
    vi.spyOn(attemptsRepository, "listProctorEvents").mockResolvedValue([]);
    const { assessmentAuthorityRepository } = await import("../../backend/src/repositories/assessment-authority.repository.pg.js");
    vi.spyOn(assessmentAuthorityRepository, "listVisible").mockResolvedValue([]);
    const { reportsRepository } = await import("../../backend/src/repositories/reports.repository.pg.js");
    vi.spyOn(reportsRepository, "listAccessible").mockResolvedValue([]);
    const { aiFeedbackRepository } = await import("../../backend/src/repositories/ai-feedback.repository.pg.js");
    vi.spyOn(aiFeedbackRepository, "list").mockResolvedValue([]);
    const { analyticsRepository } = await import("../../backend/src/repositories/analytics.repository.pg.js");
    vi.spyOn(analyticsRepository, "listTimeEvents").mockResolvedValue([]);
    const { certificatesPgRepository } = await import("../../backend/src/repositories/certificates.repository.pg.js");
    vi.spyOn(certificatesPgRepository, "listForUser").mockResolvedValue([
      { id: "CERT-IN", employeeId: subordinate.id, courseId: "CRS-REL", status: "Active" },
    ]);
    const { candidateAssessmentsPgRepository } = await import("../../backend/src/repositories/candidate-assessments.repository.pg.js");
    vi.spyOn(candidateAssessmentsPgRepository, "listForUser").mockResolvedValue([
      { id: "CAL-IN", createdBy: manager.id, assessmentId: "ASM-REL", submissions: [] },
    ]);

    const { signToken } = await import("../../backend/src/domain.js");
    authCookie = `token=${signToken(manager)}`;
    ({ default: request } = await import("supertest"));
    ({ app } = await import("../../backend/server.js?phase23-identity-scope"));
  }, 30_000);

  afterAll(() => {
    vi.restoreAllMocks();
    if (previousIdentity === undefined) delete process.env.USE_PG_IDENTITY;
    else process.env.USE_PG_IDENTITY = previousIdentity;
    if (previousCourses === undefined) delete process.env.USE_PG_COURSES;
    else process.env.USE_PG_COURSES = previousCourses;
  });

  it("uses current direct-report identity scope for users, enrollments and attempts", async () => {
    const response = await request(app).get("/api/app-data").set("Cookie", authCookie);
    expect(response.status).toBe(200);
    expect(response.body.users.map((user) => user.id)).toEqual(["MGR-REL", "USR-REL"]);
    expect(response.body.assignments.map((item) => item.id)).toEqual(["ENR-IN"]);
    expect(response.body.attempts.map((item) => item.id)).toEqual(["ATT-IN"]);
    expect(response.body.issuedCertificates.map((item) => item.id)).toEqual(["CERT-IN"]);
    expect(response.body.candidateAssessments.map((item) => item.id)).toEqual(["CAL-IN"]);
    expect(response.body.users.every((user) => !Object.hasOwn(user, "passwordHash"))).toBe(true);
  });
});
