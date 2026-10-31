import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../backend/server.js";
import {
  courses,
  chapters,
  assessments,
  assignments,
  cohorts,
  users,
  now,
} from "../../backend/src/core.js";
import { testUsers, getCsrfPair, authCookieFor } from "../helpers/auth.js";

describe("Sprint 6: Enrollment Engine, Progress Integrity & Cohorts", () => {
  let csrf;
  const courseId = "CRS-SPRINT6-001";
  const ch1Id = "CH-S6-001";
  const ch2Id = "CH-S6-002";
  const asmId = "ASM-S6-001";
  const testLearner = {
    id: "EMP-S6-LEARNER",
    role: "Learner",
    name: "S6 Learner",
    email: "s6learner@nalanda.edu",
    status: "Active",
  };
  const testInstructor = {
    id: "EMP-S6-INSTRUCTOR",
    role: "Instructor",
    name: "S6 Instructor",
    email: "s6instructor@nalanda.edu",
    status: "Active",
  };

  beforeAll(async () => {
    csrf = await getCsrfPair();

    // Register test users
    if (!users.some((u) => u.id === testLearner.id)) users.push(testLearner);
    if (!users.some((u) => u.id === testInstructor.id)) users.push(testInstructor);

    // Seed test course with 2 sequential chapters and 1 screening assessment
    courses.push({
      id: courseId,
      title: "Sprint 6 Secure Progress Course",
      description: "Testing server-side progress, locking, and cohorts.",
      skill: "Security",
      status: "Active",
      approval: "Approved",
      ownerId: testInstructor.id,
      priceCents: 0,
      isFree: true,
      createdAt: now(),
      updatedAt: now(),
    });

    chapters.push(
      {
        id: ch1Id,
        courseId,
        sequence: 1,
        title: "Chapter 1: Security Fundamentals",
        contentType: "Rich Text",
        durationMinutes: 1,
        minimumTimeMinutes: 1,
        body: "<p>Fundamentals</p>",
        createdAt: now(),
        updatedAt: now(),
      },
      {
        id: ch2Id,
        courseId,
        sequence: 2,
        title: "Chapter 2: Advanced Defense",
        contentType: "Rich Text",
        durationMinutes: 1,
        minimumTimeMinutes: 1,
        body: "<p>Advanced Defense</p>",
        createdAt: now(),
        updatedAt: now(),
      }
    );

    assessments.push({
      id: asmId,
      courseId,
      title: "Course Screening Exam",
      type: "MCQ",
      approval: "Approved",
      status: "Active",
      durationMinutes: 15,
      passScore: 70,
      ownerId: testInstructor.id,
      questions: [
        {
          id: "Q-S6-01",
          type: "MCQ",
          prompt: "What is the primary goal of defense in depth?",
          options: ["Layered security", "Single perimeter", "Disable logging", "None"],
          answer: 0,
          points: 100,
        },
      ],
      createdAt: now(),
      updatedAt: now(),
    });
  });

  describe("1. Self-Enrollment & Initial State", () => {
    it("Learner self-enrolls and is placed in 'Enrolled' status with 0 progress", async () => {
      const res = await request(app)
        .post(`/api/courses/${courseId}/enroll`)
        .set("Cookie", [csrf.cookie, authCookieFor(testLearner)])
        .set("x-csrf-token", csrf.token);

      expect(res.status).toBe(201);
      expect(res.body.data.courseId).toBe(courseId);
      expect(res.body.data.userId).toBe(testLearner.id);
      expect(res.body.data.progress).toBe(0);
      expect(res.body.data.completedChapters).toHaveLength(0);
    });
  });

  describe("2. Prerequisite Chapter Locking & Heartbeat Verification", () => {
    it("Chapter 1 is unlocked, but Chapter 2 is locked with prerequisite error", async () => {
      const res = await request(app)
        .get(`/api/courses/${courseId}/chapters`)
        .set("Cookie", authCookieFor(testLearner));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);

      const ch1 = res.body.data.find((c) => c.id === ch1Id);
      const ch2 = res.body.data.find((c) => c.id === ch2Id);

      expect(ch1.isLocked).toBe(false);
      expect(ch2.isLocked).toBe(true);
      expect(ch2.lockReason).toContain("Prerequisite chapter incomplete");
    });

    it("Sending heartbeat to locked Chapter 2 is rejected with 403 Forbidden", async () => {
      const res = await request(app)
        .post(`/api/courses/${courseId}/chapters/${ch2Id}/heartbeat`)
        .set("Cookie", [csrf.cookie, authCookieFor(testLearner)])
        .set("x-csrf-token", csrf.token)
        .send({ incrementSeconds: 15 });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain("Prerequisite chapter incomplete");
    });

    it("Sending heartbeat to unlocked Chapter 1 accumulates time and clamps speed-run fraud", async () => {
      // First heartbeat (normal 15s)
      const res1 = await request(app)
        .post(`/api/courses/${courseId}/chapters/${ch1Id}/heartbeat`)
        .set("Cookie", [csrf.cookie, authCookieFor(testLearner)])
        .set("x-csrf-token", csrf.token)
        .send({ incrementSeconds: 15 });

      expect(res1.status).toBe(200);
      expect(res1.body.ok).toBe(true);
      expect(res1.body.enrollmentStatus).toBe("InProgress");
      expect(res1.body.isChapterCompleted).toBe(false);

      // Fraudulent heartbeat claiming 500 seconds should be clamped
      const res2 = await request(app)
        .post(`/api/courses/${courseId}/chapters/${ch1Id}/heartbeat`)
        .set("Cookie", [csrf.cookie, authCookieFor(testLearner)])
        .set("x-csrf-token", csrf.token)
        .send({ incrementSeconds: 500 });

      expect(res2.status).toBe(200);
      // increment clamped to max 30s or real-time delta
      expect(res2.body.effectiveIncrement).toBeLessThanOrEqual(30);
    });

    it("Completing Chapter 1 unlocks Chapter 2 and updates progress to 50%", async () => {
      // Simulate reaching completion threshold (durationMinutes = 1 min = 60s)
      const assignment = assignments.find(
        (a) => a.courseId === courseId && a.userId === testLearner.id
      );
      assignment.chapterTimeSpentSeconds[ch1Id] = 55;
      // Backdate heartbeat timestamp to simulate realistic time elapsed
      assignment.lastHeartbeatTimestamps[ch1Id] = new Date(Date.now() - 30000).toISOString();

      const res = await request(app)
        .post(`/api/courses/${courseId}/chapters/${ch1Id}/heartbeat`)
        .set("Cookie", [csrf.cookie, authCookieFor(testLearner)])
        .set("x-csrf-token", csrf.token)
        .send({ incrementSeconds: 10 });

      expect(res.status).toBe(200);
      expect(res.body.isChapterCompleted).toBe(true);
      expect(res.body.justCompleted).toBe(true);
      expect(res.body.progress).toBe(50);
      expect(res.body.nextChapterId).toBe(ch2Id);

      // Verify Chapter 2 is now unlocked
      const chaptersRes = await request(app)
        .get(`/api/courses/${courseId}/chapters`)
        .set("Cookie", authCookieFor(testLearner));

      const ch2 = chaptersRes.body.data.find((c) => c.id === ch2Id);
      expect(ch2.isLocked).toBe(false);
    });
  });

  describe("3. Assessment Screening Gate & State Machine Transitions", () => {
    it("Learner is blocked from starting screening exam before all chapters are complete", async () => {
      const res = await request(app)
        .post(`/api/assessments/${asmId}/attempts/start`)
        .set("Cookie", [csrf.cookie, authCookieFor(testLearner)])
        .set("x-csrf-token", csrf.token);

      expect(res.status).toBe(403);
      expect(res.body.error).toContain("must complete all course chapters");
    });

    it("Completing Chapter 2 transitions enrollment status to 'AssessmentEligible'", async () => {
      // Complete Chapter 2
      const assignment = assignments.find(
        (a) => a.courseId === courseId && a.userId === testLearner.id
      );
      assignment.chapterTimeSpentSeconds[ch2Id] = 55;
      assignment.lastHeartbeatTimestamps[ch2Id] = new Date(Date.now() - 30000).toISOString();

      const res = await request(app)
        .post(`/api/courses/${courseId}/chapters/${ch2Id}/heartbeat`)
        .set("Cookie", [csrf.cookie, authCookieFor(testLearner)])
        .set("x-csrf-token", csrf.token)
        .send({ incrementSeconds: 15 });

      expect(res.status).toBe(200);
      expect(res.body.isChapterCompleted).toBe(true);
      expect(res.body.progress).toBe(100);
      expect(res.body.enrollmentStatus).toBe("AssessmentEligible");
    });

    it("Learner can now start and pass the screening exam, transitioning status to 'Passed'", async () => {
      // Start attempt
      const startRes = await request(app)
        .post(`/api/assessments/${asmId}/attempts/start`)
        .set("Cookie", [csrf.cookie, authCookieFor(testLearner)])
        .set("x-csrf-token", csrf.token);

      expect(startRes.status).toBe(201);
      const attemptId = startRes.body.data.id;
      expect(attemptId).toBeDefined();

            // Fetch blind questions to find the shuffled position of "Layered security"
      const questionsRes = await request(app)
        .get(`/api/assessments/attempts/${attemptId}/questions`)
        .set("Cookie", authCookieFor(testLearner));

      expect(questionsRes.status).toBe(200);
      const q = questionsRes.body.data.questions.find((item) => item.id === "Q-S6-01");
      expect(q).toBeDefined();
      const correctShuffledIndex = q.options.indexOf("Layered security");
      expect(correctShuffledIndex).toBeGreaterThanOrEqual(0);

      // Submit attempt with dynamically discovered shuffled option index
      const submitRes = await request(app)
        .post(`/api/assessments/attempts/${attemptId}/submit`)
        .set("Cookie", [csrf.cookie, authCookieFor(testLearner)])
        .set("x-csrf-token", csrf.token)
        .send({
          answers: { "Q-S6-01": correctShuffledIndex },
        });

      expect(submitRes.status).toBe(200);
      expect(submitRes.body.data.score).toBe(100);
      expect(submitRes.body.feedback).toBe("Passed");

      // Verify assignment status updated to Passed
      const assignment = assignments.find(
        (a) => a.courseId === courseId && a.userId === testLearner.id
      );
      expect(["Passed", "Certified"]).toContain(assignment.status);
      expect(assignment.completedAt).toBeDefined();
    });
  });

  describe("4. Cohort Management, Batch Invite & Analytics", () => {
    let createdCohort;

    it("Instructor creates a cohort and gets a unique invite code", async () => {
      const res = await request(app)
        .post("/api/cohorts")
        .set("Cookie", [csrf.cookie, authCookieFor(testInstructor)])
        .set("x-csrf-token", csrf.token)
        .send({
          name: "Sprint 6 Cyber Defenders Batch 1",
          courseId,
          startDate: "2026-11-01",
          endDate: "2026-12-15",
          capacity: 40,
          description: "Batch 1 for proctored defense training",
        });

      expect(res.status).toBe(201);
      createdCohort = res.body.data;
      expect(createdCohort.id).toBeDefined();
      expect(createdCohort.inviteCode).toMatch(/^NLD-[A-Z0-9]{6}$/);
      expect(createdCohort.capacity).toBe(40);
    });

    it("Learner joins the cohort using the valid invite code", async () => {
      const anotherLearner = {
        id: "EMP-S6-COHORT-USER",
        role: "Learner",
        name: "Cohort Learner",
        email: "cohortlearner@nalanda.edu",
        status: "Active",
      };
      users.push(anotherLearner);

      const res = await request(app)
        .post("/api/cohorts/join")
        .set("Cookie", [csrf.cookie, authCookieFor(anotherLearner)])
        .set("x-csrf-token", csrf.token)
        .send({ inviteCode: createdCohort.inviteCode });

      expect(res.status).toBe(201);
      expect(res.body.data.cohort.id).toBe(createdCohort.id);
      expect(res.body.data.enrollment.cohortId).toBe(createdCohort.id);
      expect(res.body.data.enrollment.userId).toBe(anotherLearner.id);
    });

    it("Attempting to join with an invalid invite code returns 404", async () => {
      const res = await request(app)
        .post("/api/cohorts/join")
        .set("Cookie", [csrf.cookie, authCookieFor(testLearner)])
        .set("x-csrf-token", csrf.token)
        .send({ inviteCode: "INVALID-CODE-999" });

      expect(res.status).toBe(404);
      expect(res.body.error).toContain("Invalid or expired");
    });

    it("Instructor views cohort analytics and roster", async () => {
      const res = await request(app)
        .get(`/api/cohorts/${createdCohort.id}/analytics`)
        .set("Cookie", authCookieFor(testInstructor));

      expect(res.status).toBe(200);
      const data = res.body.data;
      expect(data.cohortId).toBe(createdCohort.id);
      expect(data.totalMembers).toBe(1);
      expect(data.roster).toHaveLength(1);
      expect(data.roster[0].userId).toBe("EMP-S6-COHORT-USER");
      expect(data.statusCounts.Enrolled).toBe(1);
    });
  });
});
