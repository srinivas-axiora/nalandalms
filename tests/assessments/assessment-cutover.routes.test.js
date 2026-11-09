import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { users } from "../../backend/src/core.js";
import { signToken } from "../../backend/src/domain.js";
import { assessmentAuthorityRepository } from "../../backend/src/repositories/assessment-authority.repository.pg.js";
import { identityRepository } from "../../backend/src/repositories/identity.repository.pg.js";
import { settingsRepository } from "../../backend/src/repositories/settings.repository.pg.js";
import { attemptsRepository } from "../../backend/src/repositories/attempts.repository.pg.js";

describe("assessment relational cutover selection", () => {
  const previous = process.env.USE_PG_COURSES;
  let app;

  beforeAll(async () => {
    process.env.USE_PG_COURSES = "1";
    const { registerAssessments } = await import(
      "../../backend/src/modules/assessments/assessments.routes.js?phase14-cutover"
    );
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    registerAssessments(app);
  });

  afterEach(() => vi.restoreAllMocks());

  afterAll(() => {
    if (previous === undefined) delete process.env.USE_PG_COURSES;
    else process.env.USE_PG_COURSES = previous;
  });

  it("registers the relational assessment listing instead of the process-local handler", async () => {
    const employee = users.find((user) => user.role === "Employee");
    vi.spyOn(identityRepository, "findUserById").mockResolvedValue(employee);
    vi.spyOn(assessmentAuthorityRepository, "listVisible").mockResolvedValue([
      { id: "ASM-RELATIONAL", title: "Relational assessment", questions: [] },
    ]);
    const response = await request(app)
      .get("/api/assessments")
      .set("Cookie", `token=${signToken(employee)}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ data: [{ id: "ASM-RELATIONAL" }], total: 1 });
    expect(assessmentAuthorityRepository.listVisible).toHaveBeenCalledWith(expect.objectContaining({
      actor: expect.objectContaining({ id: employee.id }),
    }));
  });

  it("starts attempts through the transactional assessment authority without consulting snapshot enrollment", async () => {
    const employee = users.find((user) => user.role === "Employee");
    const assessment = {
      id: "ASM-RELATIONAL-START",
      courseId: "CRS-RELATIONAL",
      title: "Relational runtime assessment",
      strictMode: false,
      durationMinutes: 30,
      questions: [{ id: "Q-1", type: "MCQ", prompt: "Safe?", options: ["Yes", "No"], answer: 0 }],
    };
    const attempt = {
      id: "ATT-RELATIONAL",
      assessmentId: assessment.id,
      courseId: assessment.courseId,
      chapterId: null,
      userId: employee.id,
      startedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 1_800_000).toISOString(),
      status: "InProgress",
      questionOrder: ["Q-1"],
      maxScore: 1,
      version: 1,
    };

    vi.spyOn(identityRepository, "findUserById").mockResolvedValue(employee);
    vi.spyOn(settingsRepository, "getProctoring").mockResolvedValue({});
    vi.spyOn(assessmentAuthorityRepository, "startAttempt").mockImplementation(async ({ actor, buildAttempt }) => {
      expect(actor.id).toBe(employee.id);
      expect(buildAttempt).toEqual(expect.any(Function));
      return { assessment, attempt };
    });

    const response = await request(app)
      .post(`/api/assessments/${assessment.id}/attempts/start`)
      .set("Cookie", `token=${signToken(employee)}`)
      .send({});

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      id: attempt.id,
      assessmentId: assessment.id,
      courseId: assessment.courseId,
      userId: employee.id,
    });
    expect(assessmentAuthorityRepository.startAttempt).toHaveBeenCalledOnce();
  });

  it("decorates the pending-review queue from relational identity summaries", async () => {
    const instructor = users.find((user) => user.role === "Manager");
    const attempt = {
      id: "ATT-RELATIONAL-REVIEW",
      assessmentId: "ASM-RELATIONAL-REVIEW",
      courseId: "CRS-RELATIONAL",
      userId: "USR-RDS-LEARNER",
      status: "PendingManualReview",
    };
    vi.spyOn(identityRepository, "findUserById").mockResolvedValue(instructor);
    vi.spyOn(attemptsRepository, "list").mockResolvedValue([attempt]);
    vi.spyOn(assessmentAuthorityRepository, "canManageAssessment").mockResolvedValue(true);
    vi.spyOn(assessmentAuthorityRepository, "findById").mockResolvedValue({
      id: attempt.assessmentId,
      title: "Relational review assessment",
      courseTitle: "Relational course",
    });
    vi.spyOn(identityRepository, "findUserSummariesByIds").mockResolvedValue([{
      id: attempt.userId,
      name: "Current RDS Learner",
      email: "current-rds@example.com",
      status: "Active",
    }]);

    const response = await request(app)
      .get("/api/assessments/attempts/pending-review")
      .set("Cookie", `token=${signToken(instructor)}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([expect.objectContaining({
      id: attempt.id,
      learnerName: "Current RDS Learner",
      learnerEmail: "current-rds@example.com",
      assessmentTitle: "Relational review assessment",
      courseTitle: "Relational course",
    })]);
    expect(identityRepository.findUserSummariesByIds).toHaveBeenCalledWith([attempt.userId]);
  });
});
