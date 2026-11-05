import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerAssessmentAuthoringPgRoutes } from "../../backend/src/modules/assessments/assessments.pg.routes.js";
import {
  AssessmentAuthorityError,
  assessmentAuthorityRepository,
} from "../../backend/src/repositories/assessment-authority.repository.pg.js";
import { authCookieFor, stepUpCookieFor, testUsers } from "../helpers/auth.js";

const validQuestion = {
  id: "Q-CLIENT-1",
  type: "MCQ",
  prompt: "Which control prevents retry duplication?",
  options: ["Idempotency", "Caching"],
  answer: 0,
  points: 10,
};

describe("PostgreSQL assessment authoring routes", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    registerAssessmentAuthoringPgRoutes(app);
  });

  afterEach(() => vi.restoreAllMocks());

  it("returns the repository's actor-scoped assessment projection", async () => {
    vi.spyOn(assessmentAuthorityRepository, "listVisible").mockResolvedValue([
      { id: "ASM-1", questions: [{ id: "Q-1", prompt: "Safe" }] },
    ]);
    const response = await request(app)
      .get("/api/assessments")
      .set("Cookie", authCookieFor(testUsers.employee));

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ total: 1, data: [{ id: "ASM-1" }] });
    expect(assessmentAuthorityRepository.listVisible).toHaveBeenCalledWith(expect.objectContaining({
      actor: expect.objectContaining({ id: testUsers.employee.id }),
    }));
  });

  it("requires course versioning for assessment creation", async () => {
    const create = vi.spyOn(assessmentAuthorityRepository, "createAssessment");
    const response = await request(app)
      .post("/api/assessments")
      .set("Cookie", authCookieFor(testUsers.manager))
      .send({
        courseId: "CRS-1", title: "Security assessment", type: "MCQ",
        questions: [validQuestion], durationMinutes: 30, passScore: 70,
      });

    expect(response.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("accepts the assessment console question shape and forwards optimistic versions", async () => {
    const create = vi.spyOn(assessmentAuthorityRepository, "createAssessment").mockResolvedValue({
      assessment: { id: "ASM-1", version: 1, questions: [validQuestion] },
      courseVersion: 3,
    });
    const response = await request(app)
      .post("/api/assessments")
      .set("Cookie", authCookieFor(testUsers.manager))
      .send({
        courseId: "CRS-1", courseVersion: 2, title: "Security assessment", type: "MCQ",
        questions: [validQuestion], durationMinutes: 30, passScore: 70,
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ data: { id: "ASM-1" }, courseVersion: 3 });
    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      expectedCourseVersion: 2,
      assessment: expect.objectContaining({
        questions: [expect.objectContaining({ id: "Q-CLIENT-1", answer: 0 })],
      }),
    }));
  });

  it("rejects an MCQ answer outside the supplied options", async () => {
    const create = vi.spyOn(assessmentAuthorityRepository, "createAssessment");
    const response = await request(app)
      .post("/api/assessments")
      .set("Cookie", authCookieFor(testUsers.manager))
      .send({
        courseId: "CRS-1", courseVersion: 1, title: "Security assessment", type: "MCQ",
        questions: [{ ...validQuestion, answer: 3 }], durationMinutes: 30, passScore: 70,
      });

    expect(response.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("requires recent step-up for assessment approval", async () => {
    const review = vi.spyOn(assessmentAuthorityRepository, "reviewAssessment");
    const response = await request(app)
      .patch("/api/assessments/ASM-1/approval")
      .set("Cookie", authCookieFor(testUsers.admin))
      .send({
        courseVersion: 2, assessmentVersion: 1, approval: "Approved",
        feedback: "Reviewed against the assessment publishing policy",
      });

    expect(response.status).toBe(412);
    expect(review).not.toHaveBeenCalled();
  });

  it("maps retained attempt history to a stable conflict response", async () => {
    vi.spyOn(assessmentAuthorityRepository, "archiveAndDelete").mockRejectedValue(
      new AssessmentAuthorityError(
        "ASSESSMENT_HAS_HISTORY",
        "Assessment has retained attempt or candidate-link history",
        { attempts: 2, candidate_links: 0 }
      )
    );
    const response = await request(app)
      .delete("/api/assessments/ASM-1")
      .set("Cookie", [authCookieFor(testUsers.manager), stepUpCookieFor(testUsers.manager)])
      .send({
        courseVersion: 2,
        assessmentVersion: 1,
        deletionComment: "Retire this obsolete assessment safely",
      });

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      code: "ASSESSMENT_HAS_HISTORY",
      details: { attempts: 2 },
    });
  });
});
