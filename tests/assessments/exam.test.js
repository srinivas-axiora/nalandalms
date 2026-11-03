import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../backend/server.js";
import {
  courses,
  chapters,
  assessments,
  assignments,
  attempts,
  users,
  now,
} from "../../backend/src/core.js";
import { testUsers, getCsrfPair, authCookieFor, stepUpCookieFor } from "../helpers/auth.js";

describe("Sprint 7: Blind Exam Delivery Engine", () => {
  let csrf;
  const courseId = "CRS-SPRINT7-EXAM";
  const mcqAssessmentId = "ASM-S7-BLIND-MCQ";
  const descAssessmentId = "ASM-S7-DESCRIPTIVE";

  const studentA = {
    id: "EMP-S7-STUDENT-A",
    role: "Learner",
    name: "Student A",
    email: "studentA@nalanda.edu",
    status: "Active",
  };
  const studentB = {
    id: "EMP-S7-STUDENT-B",
    role: "Learner",
    name: "Student B",
    email: "studentB@nalanda.edu",
    status: "Active",
  };
  const instructor = {
    id: "EMP-S7-INSTRUCTOR",
    role: "Instructor",
    name: "Professor Turing",
    email: "turing@nalanda.edu",
    status: "Active",
  };

  beforeAll(async () => {
    csrf = await getCsrfPair();

    if (!users.some((u) => u.id === studentA.id)) users.push(studentA);
    if (!users.some((u) => u.id === studentB.id)) users.push(studentB);
    if (!users.some((u) => u.id === instructor.id)) users.push(instructor);

    courses.push({
      id: courseId,
      title: "Sprint 7 Advanced Cryptography & Architecture",
      description: "Blind exam testing course.",
      skill: "Security",
      status: "Active",
      approval: "Approved",
      ownerId: instructor.id,
      priceCents: 0,
      isFree: true,
      createdAt: now(),
      updatedAt: now(),
    });

    // Seed enrollments for students
    assignments.push(
      {
        id: "ENR-S7-001",
        courseId,
        userId: studentA.id,
        assignedBy: instructor.id,
        status: "AssessmentEligible",
        progress: 100,
        completedChapters: [],
        timeSpentSeconds: 3600,
        timeSpentMinutes: 60,
        chapterTimeSpentSeconds: {},
        startedAt: now(),
        completedAt: null,
        createdAt: now(),
      },
      {
        id: "ENR-S7-002",
        courseId,
        userId: studentB.id,
        assignedBy: instructor.id,
        status: "AssessmentEligible",
        progress: 100,
        completedChapters: [],
        timeSpentSeconds: 3600,
        timeSpentMinutes: 60,
        chapterTimeSpentSeconds: {},
        startedAt: now(),
        completedAt: null,
        createdAt: now(),
      }
    );

    // Seed MCQ Assessment
    assessments.push({
      id: mcqAssessmentId,
      courseId,
      title: "Blind MCQ Screening",
      type: "MCQ",
      approval: "Approved",
      status: "Active",
      durationMinutes: 10,
      passScore: 70,
      ownerId: instructor.id,
      questions: [
        {
          id: "Q-MCQ-1",
          type: "MCQ",
          prompt: "What is an initialization vector (IV) used for in CBC mode?",
          options: ["Ensure unique ciphertext", "Sign the message", "Compress data", "Speed up hash"],
          answer: 0,
          points: 50,
        },
        {
          id: "Q-MCQ-2",
          type: "MCQ",
          prompt: "Which asymmetric algorithm is based on discrete logarithms?",
          options: ["Diffie-Hellman", "AES-256", "ChaCha20", "SHA-3"],
          answer: 0,
          points: 50,
        },
      ],
      createdAt: now(),
      updatedAt: now(),
    });

    // Seed Descriptive Assessment
    assessments.push({
      id: descAssessmentId,
      courseId,
      title: "Architecture Design Review Exam",
      type: "Descriptive",
      approval: "Approved",
      status: "Active",
      durationMinutes: 30,
      passScore: 75,
      ownerId: instructor.id,
      questions: [
        {
          id: "Q-DESC-1",
          type: "Descriptive",
          prompt: "Describe how you would design a zero-trust network boundary between microservices.",
          points: 100,
        },
      ],
      createdAt: now(),
      updatedAt: now(),
    });
  });

  describe("1. Question Randomization & Blind Delivery (Zero Answer Key Leakage)", () => {
    let attemptAId;

    it("Student A starts an attempt and gets sanitized metadata without answer keys", async () => {
      const res = await request(app)
        .post(`/api/assessments/${mcqAssessmentId}/attempts/start`)
        .set("Cookie", [csrf.cookie, authCookieFor(studentA)])
        .set("x-csrf-token", csrf.token);

      expect(res.status).toBe(201);
      const attempt = res.body.data;
      attemptAId = attempt.id;
      expect(attempt.id).toBeDefined();
      expect(attempt.status).toBe("InProgress");
      expect(attempt.expiresAt).toBeDefined();

      // Ensure no internal question map with answer keys is returned in start response
      expect(attempt.questionMap).toBeUndefined();
      expect(attempt.answers).toBeUndefined();
    });

    it("Fetching blind questions delivers stripped questions with active countdown timer", async () => {
      const res = await request(app)
        .get(`/api/assessments/attempts/${attemptAId}/questions?page=1&limit=2`)
        .set("Cookie", authCookieFor(studentA));

      expect(res.status).toBe(200);
      const data = res.body.data;
      expect(data.pagination.totalQuestions).toBe(2);
      expect(data.questions).toHaveLength(2);

      // Verify zero leak of answers or internal indices
      for (const q of data.questions) {
        expect(q.prompt).toBeDefined();
        expect(q.options).toBeDefined();
        expect(q.options.length).toBe(4);
        expect(q.answer).toBeUndefined();
        expect(q.correctIndex).toBeUndefined();
        expect(q.originalIndex).toBeUndefined();
      }

      // Verify clock
      expect(data.clock.durationSeconds).toBe(600); // 10 minutes
      expect(data.clock.timeRemainingSeconds).toBeGreaterThan(580);
      expect(data.clock.isExpired).toBe(false);
    });

    it("Another student is forbidden from accessing Student A's exam questions", async () => {
      const res = await request(app)
        .get(`/api/assessments/attempts/${attemptAId}/questions`)
        .set("Cookie", authCookieFor(studentB));

      expect(res.status).toBe(403);
      expect(res.body.error).toContain("Forbidden");
    });
  });

  describe("2. Autosave, Answer Locking & Anti-Replay", () => {
    let attemptAId;
    let questions;

    beforeAll(async () => {
      const startRes = await request(app)
        .post(`/api/assessments/${mcqAssessmentId}/attempts/start`)
        .set("Cookie", [csrf.cookie, authCookieFor(studentA)])
        .set("x-csrf-token", csrf.token);
      attemptAId = startRes.body.data.id;

      const qRes = await request(app)
        .get(`/api/assessments/attempts/${attemptAId}/questions`)
        .set("Cookie", authCookieFor(studentA));
      questions = qRes.body.data.questions;
    });

    it("Autosaving a question answer updates server state incrementally", async () => {
      const q1 = questions[0];
      const selectedIndex = 1;

      const res = await request(app)
        .post(`/api/assessments/attempts/${attemptAId}/answer`)
        .set("Cookie", [csrf.cookie, authCookieFor(studentA)])
        .set("x-csrf-token", csrf.token)
        .send({
          questionId: q1.id,
          answer: selectedIndex,
        });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.questionId).toBe(q1.id);
      expect(res.body.answeredCount).toBe(1);

      // Verify question list now reflects answered status
      const checkRes = await request(app)
        .get(`/api/assessments/attempts/${attemptAId}/questions`)
        .set("Cookie", authCookieFor(studentA));

      const updatedQ = checkRes.body.data.questions.find((item) => item.id === q1.id);
      expect(updatedQ.answered).toBe(true);
      expect(updatedQ.currentAnswer).toBe(selectedIndex);
    });

    it("Submitting exam finalizes attempt, preventing further answer modifications (Anti-Replay)", async () => {
      // Finalize submission
      const submitRes = await request(app)
        .post(`/api/assessments/attempts/${attemptAId}/submit`)
        .set("Cookie", [csrf.cookie, authCookieFor(studentA)])
        .set("x-csrf-token", csrf.token)
        .send({});

      expect(submitRes.status).toBe(200);
      expect(submitRes.body.data.submittedAt).toBeDefined();

      // Attempting to submit again is rejected with 409
      const reSubmitRes = await request(app)
        .post(`/api/assessments/attempts/${attemptAId}/submit`)
        .set("Cookie", [csrf.cookie, authCookieFor(studentA)])
        .set("x-csrf-token", csrf.token)
        .send({});

      expect(reSubmitRes.status).toBe(409);
      expect(reSubmitRes.body.error).toContain("already submitted");

      // Attempting to post another answer after submit is rejected with 409
      const answerAfterRes = await request(app)
        .post(`/api/assessments/attempts/${attemptAId}/answer`)
        .set("Cookie", [csrf.cookie, authCookieFor(studentA)])
        .set("x-csrf-token", csrf.token)
        .send({
          questionId: questions[1].id,
          answer: 0,
        });

      expect(answerAfterRes.status).toBe(409);
      expect(answerAfterRes.body.error).toContain("already been submitted");
    });
  });

  describe("3. Server-Side Exam Clock & Expiration Enforcement", () => {
    it("Expired exam rejects answer submissions and auto-finalizes with 'TIME_EXPIRED'", async () => {
      // Start fresh attempt for Student B
      const startRes = await request(app)
        .post(`/api/assessments/${mcqAssessmentId}/attempts/start`)
        .set("Cookie", [csrf.cookie, authCookieFor(studentB)])
        .set("x-csrf-token", csrf.token);

      const attemptId = startRes.body.data.id;

      // Simulate expired exam clock by backdating startedAt by 15 minutes (duration is 10 min)
      const attempt = attempts.find((a) => a.id === attemptId);
      attempt.startedAt = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      attempt.expiresAt = new Date(Date.now() - 60 * 1000).toISOString();

      // Attempting to save answer now should fail due to expiration
      const answerRes = await request(app)
        .post(`/api/assessments/attempts/${attemptId}/answer`)
        .set("Cookie", [csrf.cookie, authCookieFor(studentB)])
        .set("x-csrf-token", csrf.token)
        .send({
          questionId: "Q-MCQ-1",
          answer: 0,
        });

      expect(answerRes.status).toBe(403);
      expect(answerRes.body.error).toContain("time has expired");

      // Verify attempt is marked auto-submitted due to time expiration
      expect(attempt.submittedAt).toBeDefined();
      expect(attempt.autoSubmittedReason).toBe("TIME_EXPIRED");
    });
  });

  describe("4. Descriptive Questions & Instructor Manual Grading Workflow", () => {
    let descAttemptId;

    it("Learner submits descriptive exam which enters 'PendingManualReview' status", async () => {
      const startRes = await request(app)
        .post(`/api/assessments/${descAssessmentId}/attempts/start`)
        .set("Cookie", [csrf.cookie, authCookieFor(studentA)])
        .set("x-csrf-token", csrf.token);

      descAttemptId = startRes.body.data.id;

      // Submit descriptive answer
      await request(app)
        .post(`/api/assessments/attempts/${descAttemptId}/answer`)
        .set("Cookie", [csrf.cookie, authCookieFor(studentA)])
        .set("x-csrf-token", csrf.token)
        .send({
          questionId: "Q-DESC-1",
          answer: "Mutual TLS via SPIFFE/SPIRE with Envoy sidecars and Open Policy Agent RBAC authorization.",
        });

      const submitRes = await request(app)
        .post(`/api/assessments/attempts/${descAttemptId}/submit`)
        .set("Cookie", [csrf.cookie, authCookieFor(studentA)])
        .set("x-csrf-token", csrf.token)
        .send({});

      expect(submitRes.status).toBe(200);
      expect(submitRes.body.data.status).toBe("PendingManualReview");
      expect(submitRes.body.feedback).toContain("instructor evaluation");
    });

    it("Instructor sees the attempt in the pending review queue", async () => {
      const res = await request(app)
        .get("/api/assessments/attempts/pending-review")
        .set("Cookie", authCookieFor(instructor));

      expect(res.status).toBe(200);
      const queue = res.body.data;
      const found = queue.find((a) => a.id === descAttemptId);
      expect(found).toBeDefined();
      expect(found.learnerName).toBe("Student A");
      expect(found.courseTitle).toContain("Sprint 7");
    });

    it("Instructor grades the descriptive answer, promoting status to 'Passed'", async () => {
      const gradeRes = await request(app)
        .post(`/api/assessments/attempts/${descAttemptId}/grade`)
        .set("Cookie", [csrf.cookie, authCookieFor(instructor), stepUpCookieFor(instructor)])
        .set("x-csrf-token", csrf.token)
        .send({
          grades: {
            "Q-DESC-1": {
              pointsAwarded: 90,
              feedback: "Excellent mTLS and OPA architecture design.",
            },
          },
          overallFeedback: "Outstanding grasp of zero-trust architecture. Certified.",
        });

      expect(gradeRes.status).toBe(200);
      expect(gradeRes.body.score).toBe(90);
      expect(gradeRes.body.passed).toBe(true);
      expect(gradeRes.body.status).toBe("Passed");

      // Verify the learner enrollment is now marked Passed
      const assignment = assignments.find(
        (a) => a.courseId === courseId && a.userId === studentA.id
      );
      expect(assignment.status).toBe("Passed");
      expect(assignment.completedAt).toBeDefined();
    });
  });
});

