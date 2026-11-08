import cookieParser from "cookie-parser";
import express from "express";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { candidateAssessmentsPgRepository } from "../../backend/src/repositories/candidate-assessments.repository.pg.js";
import { authCookieFor, testUsers } from "../helpers/auth.js";

describe("course cutover candidate-assessment authority", () => {
  const previousCourses = process.env.USE_PG_COURSES;
  const previousCandidates = process.env.USE_PG_CANDIDATE_ASSESSMENTS;
  let app;

  beforeAll(async () => {
    process.env.USE_PG_COURSES = "1";
    process.env.USE_PG_CANDIDATE_ASSESSMENTS = "0";
    vi.spyOn(candidateAssessmentsPgRepository, "listForUser").mockResolvedValue([{
      id: "CAL-REL-COURSE-CUTOVER",
      assessmentId: "ASM-REL",
      title: "Relational candidate assessment",
      courseTitle: "Relational Course",
      status: "Active",
      createdBy: testUsers.employee.id,
      submissions: [],
    }]);
    const { registerCandidateAssessments } = await import(
      "../../backend/src/modules/assessments/candidate-assessments.routes.js?phase40-course-cutover"
    );
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    registerCandidateAssessments(app);
  });

  afterAll(() => {
    vi.restoreAllMocks();
    if (previousCourses === undefined) delete process.env.USE_PG_COURSES;
    else process.env.USE_PG_COURSES = previousCourses;
    if (previousCandidates === undefined) delete process.env.USE_PG_CANDIDATE_ASSESSMENTS;
    else process.env.USE_PG_CANDIDATE_ASSESSMENTS = previousCandidates;
  });

  it("selects relational candidate links from the course flag alone", async () => {
    const response = await request(app)
      .get("/api/candidate-assessments")
      .set("Cookie", authCookieFor(testUsers.employee));

    expect(response.status).toBe(200);
    expect(candidateAssessmentsPgRepository.listForUser).toHaveBeenCalledWith(
      expect.objectContaining({ id: testUsers.employee.id })
    );
    expect(response.body.data).toEqual([
      expect.objectContaining({ id: "CAL-REL-COURSE-CUTOVER", token: null }),
    ]);
  });
});
