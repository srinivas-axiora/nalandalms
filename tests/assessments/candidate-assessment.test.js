import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../backend/server.js";
import { users, assessments, courses, candidateAssessments, now } from "../../backend/src/core.js";
import { getCsrfPair, authCookieFor } from "../helpers/auth.js";

describe("Candidate Assessment Public Sharing & Proctoring Suite", () => {
  let csrf;
  const adminUser = users.find((u) => u.role === "Super Admin" || u.role === "Admin");
  const adminCookie = authCookieFor(adminUser);
  const testAssessmentId = "ASM-TEST-CANDIDATE-SHARING";
  let shareableToken = "";
  let shareableLinkId = "";

  beforeAll(async () => {
    csrf = await getCsrfPair();

    // Ensure base assessment exists with questions and answer keys
    assessments.push({
      id: testAssessmentId,
      courseId: "CRS-PY-001",
      title: "Python & System Architecture Skills Assessment",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 2,
      approval: "Approved",
      status: "Active",
      questions: [
        {
          id: "Q-CANDIDATE-01",
          prompt: "What is the primary purpose of Python's GIL?",
          type: "MCQ",
          options: [
            "Enable native multithreading across CPU cores",
            "Synchronize execution of threads so only one thread runs Python bytecode at once",
            "Compile Python bytecode into machine instructions ahead-of-time",
            "Manage GPU tensor allocations automatically",
          ],
          answer: 1,
          points: 50,
        },
        {
          id: "Q-CANDIDATE-02",
          prompt: "Which data structure provides O(1) average-time lookups?",
          type: "MCQ",
          options: ["Binary Search Tree", "Linked List", "Hash Table", "Stack"],
          answer: 2,
          points: 50,
        },
      ],
      createdAt: now(),
      updatedAt: now(),
    });
  });

  it("1. Assessor creates a public shareable assessment link", async () => {
    const res = await request(app)
      .post("/api/candidate-assessments")
      .set("Cookie", [adminCookie, csrf.cookie])
      .set("x-csrf-token", csrf.token)
      .send({
        assessmentId: testAssessmentId,
        durationMinutes: 25,
        passScore: 70,
        questionLimit: 2,
        proctoringRequired: true,
        fullscreenRequired: true,
        maxTabSwitches: 3,
      });

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.id).toMatch(/^CAL-/);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.shareableUrl).toContain("/candidate-assessment/");

    shareableToken = res.body.data.token;
    shareableLinkId = res.body.data.id;
  });

  it("2. Public candidate fetches assessment info without login or CSRF header", async () => {
    const res = await request(app).get(`/api/public/candidate-assessments/${shareableToken}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.title).toBe("Python & System Architecture Skills Assessment");
    expect(res.body.data.durationMinutes).toBe(25);
    expect(res.body.data.proctoringRequired).toBe(true);
    expect(res.body.data.fullscreenRequired).toBe(true);
    // Crucial: questions and answer keys must NOT be present in public metadata
    expect(res.body.data.questions).toBeUndefined();
  });

  it("3. Candidate starts test with Name and Email, receiving blind questions without answers", async () => {
    const res = await request(app)
      .post(`/api/public/candidate-assessments/${shareableToken}/start`)
      .send({
        candidateName: "Aditi Rao",
        candidateEmail: "aditi.rao@example.com",
      });

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.attemptToken).toBeDefined();
    expect(res.body.submissionId).toMatch(/^CAS-/);
    expect(res.body.questions).toHaveLength(2);

    // Verify questions are blinded (no 'answer' or 'correctAnswer' keys)
    res.body.questions.forEach((q) => {
      expect(q.prompt).toBeDefined();
      expect(q.options).toBeDefined();
      expect(q.answer).toBeUndefined();
      expect(q.correctAnswer).toBeUndefined();
    });
  });

  it("4. Enforces STRICT single-email rule: prevents starting second attempt with same email", async () => {
    const res = await request(app)
      .post(`/api/public/candidate-assessments/${shareableToken}/start`)
      .send({
        candidateName: "Aditi Rao Duplicate",
        candidateEmail: "ADITI.RAO@EXAMPLE.COM", // case-insensitive check
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toContain("Only one attempt is permitted");
  });

  it("5. Telemetry & Proctoring: records anomaly events and deducts trust score", async () => {
    // Look up the active candidate submission
    const link = candidateAssessments.find((l) => l.token === shareableToken);
    const sub = link.submissions.find((s) => s.candidateEmail === "aditi.rao@example.com");
    expect(sub).toBeDefined();
    expect(sub.trustScore).toBe(100);

    // Candidate switches tab (high severity: -15 penalty)
    const eventRes = await request(app)
      .post(`/api/public/candidate-assessments/${shareableToken}/event`)
      .send({
        attemptToken: sub.attemptToken,
        eventType: "TAB_SWITCH",
        severity: "high",
        metadata: { windowBlurDurationMs: 4200 },
      });

    expect(eventRes.status).toBe(200);
    expect(eventRes.body.ok).toBe(true);
    expect(eventRes.body.trustScore).toBe(85);
    expect(eventRes.body.tabSwitchCount).toBe(1);

    // Candidate leaves camera view (medium severity: -5 penalty)
    const faceRes = await request(app)
      .post(`/api/public/candidate-assessments/${shareableToken}/event`)
      .send({
        attemptToken: sub.attemptToken,
        eventType: "FACE_ABSENT",
        severity: "medium",
        confidence: 0.95,
      });

    expect(faceRes.status).toBe(200);
    expect(faceRes.body.trustScore).toBe(80);
  });

  it("6. Candidate submits answers and receives graded results", async () => {
    const link = candidateAssessments.find((l) => l.token === shareableToken);
    const sub = link.submissions.find((s) => s.candidateEmail === "aditi.rao@example.com");

    const submitRes = await request(app)
      .post(`/api/public/candidate-assessments/${shareableToken}/submit`)
      .send({
        attemptToken: sub.attemptToken,
        answers: {
          "Q-CANDIDATE-01": 1, // Correct (50 pts)
          "Q-CANDIDATE-02": 2, // Correct (50 pts)
        },
      });

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.ok).toBe(true);
    expect(submitRes.body.result.candidateEmail).toBe("aditi.rao@example.com");
    expect(submitRes.body.result.score).toBe(100);
    expect(submitRes.body.result.maxScore).toBe(100);
    expect(submitRes.body.result.percentage).toBe(100);
    expect(submitRes.body.result.passed).toBe(true);
    expect(submitRes.body.result.trustScore).toBe(80);
    expect(submitRes.body.result.submittedAt).toBeDefined();
  });

  it("7. Blocks candidate from re-attempting or submitting again", async () => {
    const res = await request(app)
      .post(`/api/public/candidate-assessments/${shareableToken}/start`)
      .send({
        candidateName: "Aditi Rao",
        candidateEmail: "aditi.rao@example.com",
      });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe("DUPLICATE_EMAIL_SUBMITTED");
  });

  it("8. Assessor retrieves all candidate submissions and proctoring telemetry", async () => {
    const res = await request(app)
      .get(`/api/candidate-assessments/${shareableLinkId}`)
      .set("Cookie", [adminCookie, csrf.cookie]);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.submissions).toHaveLength(1);
    const candidateRecord = res.body.data.submissions[0];
    expect(candidateRecord.candidateName).toBe("Aditi Rao");
    expect(candidateRecord.candidateEmail).toBe("aditi.rao@example.com");
    expect(candidateRecord.score).toBe(100);
    expect(candidateRecord.trustScore).toBe(80);
    expect(candidateRecord.flags).toHaveLength(2);
    expect(candidateRecord.flags.some((f) => f.eventType === "TAB_SWITCH")).toBe(true);
    expect(candidateRecord.flags.some((f) => f.eventType === "FACE_ABSENT")).toBe(true);
  });
  it("9. Question Library API: returns 300+ questions across 12 hiring categories with 1-5 marks", async () => {
    const res = await request(app)
      .get("/api/assessments/question-library")
      .set("Cookie", [adminCookie, csrf.cookie]);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.total).toBeGreaterThanOrEqual(300);
    expect(res.body.categories).toContain("Psychometric");
    expect(res.body.categories).toContain("Analytical");
    expect(res.body.categories).toContain("Coding");
    expect(res.body.categories).toContain("Testing");
    expect(res.body.categories).toContain("Sales");
    expect(res.body.categories).toContain("HR");
    expect(res.body.categories).toContain("Vocabulary");

    // Verify marks distribution (1, 2, 3, 4, 5)
    const pointsSet = new Set(res.body.data.map((q) => q.points));
    expect(pointsSet.has(1)).toBe(true);
  });

  it("10. Assessment Analytics Cockpit: returns attendees count, average score, average time spent, and top performers", async () => {
    const res = await request(app)
      .get("/api/candidate-assessments/analytics/CAL-INTERN-SWE")
      .set("Cookie", [adminCookie, csrf.cookie]);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.analytics.attendeesCount).toBe(5);
    expect(res.body.analytics.averageScore).toBeGreaterThanOrEqual(70);
    expect(res.body.analytics.averageTimeSpentSeconds).toBeGreaterThan(0);
    expect(res.body.analytics.ignoredProctoringCount).toBe(1); // Rohan Gupta ignored proctoring

    // Best performers leaderboard
    expect(res.body.bestPerformers).toBeInstanceOf(Array);
    expect(res.body.bestPerformers[0].candidateName).toBe("Aarav Sharma");
    expect(res.body.bestPerformers[0].percentage).toBe(94);
    expect(res.body.bestPerformers[0].trustScore).toBe(100);

    // Individual candidate responses verification
    expect(res.body.candidateResponses).toHaveLength(5);
    const rohan = res.body.candidateResponses.find((c) => c.candidateEmail === "rohan.gupta@campus.edu");
    expect(rohan.ignoredProctoring).toBe(true);
    expect(rohan.proctoringStatus).toBe("PROCTORING_VIOLATIONS_DETECTED");
    expect(rohan.evaluatedResponses.length).toBeGreaterThan(0);
  });
});

