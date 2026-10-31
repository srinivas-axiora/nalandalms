import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../backend/server.js";
import {
  courses,
  assessments,
  assignments,
  attempts,
  users,
  now,
} from "../../backend/src/core.js";
import { testUsers, getCsrfPair, authCookieFor } from "../helpers/auth.js";

describe("Sprint 9: Live Proctoring Cockpit, Remote Interventions & Timeline Replay", () => {
  let csrf;
  const courseId = "CRS-SPRINT9-COCKPIT";
  const assessmentId = "ASM-S9-SCREENING";
  let highRiskAttemptId;
  let safeAttemptId;

  const candidateHighRisk = {
    id: "EMP-S9-RISKY",
    role: "Learner",
    name: "Risky Candidate",
    email: "risky@nalanda.edu",
    status: "Active",
  };
  const candidateSafe = {
    id: "EMP-S9-SAFE",
    role: "Learner",
    name: "Safe Candidate",
    email: "safe@nalanda.edu",
    status: "Active",
  };
  const instructorProctor = {
    id: "EMP-S9-CHIEF-PROCTOR",
    role: "Instructor",
    name: "Dr. Evelyn Proctor",
    email: "evelyn@nalanda.edu",
    status: "Active",
  };

  beforeAll(async () => {
    csrf = await getCsrfPair();

    if (!users.some((u) => u.id === candidateHighRisk.id)) users.push(candidateHighRisk);
    if (!users.some((u) => u.id === candidateSafe.id)) users.push(candidateSafe);
    if (!users.some((u) => u.id === instructorProctor.id)) users.push(instructorProctor);

    courses.push({
      id: courseId,
      title: "Sprint 9 Advanced Autonomous Systems",
      status: "Active",
      approval: "Approved",
      ownerId: instructorProctor.id,
      priceCents: 0,
      isFree: true,
      createdAt: now(),
      updatedAt: now(),
    });

    assessments.push({
      id: assessmentId,
      courseId,
      title: "Proctored Final Exam",
      type: "MCQ",
      approval: "Approved",
      status: "Active",
      durationMinutes: 45,
      passScore: 70,
      ownerId: instructorProctor.id,
      questions: [
        {
          id: "Q-S9-01",
          type: "MCQ",
          prompt: "What is the consensus algorithm in Raft?",
          options: ["Leader election", "Proof of Work", "Gossip", "None"],
          answer: 0,
          points: 100,
        },
      ],
      createdAt: now(),
      updatedAt: now(),
    });

    // Seed enrollments
    assignments.push(
      {
        id: "ENR-S9-001",
        courseId,
        userId: candidateHighRisk.id,
        assignedBy: instructorProctor.id,
        status: "AssessmentEligible",
        progress: 100,
        completedChapters: [],
        timeSpentSeconds: 3000,
        timeSpentMinutes: 50,
        chapterTimeSpentSeconds: {},
        startedAt: now(),
        completedAt: null,
        createdAt: now(),
      },
      {
        id: "ENR-S9-002",
        courseId,
        userId: candidateSafe.id,
        assignedBy: instructorProctor.id,
        status: "AssessmentEligible",
        progress: 100,
        completedChapters: [],
        timeSpentSeconds: 3000,
        timeSpentMinutes: 50,
        chapterTimeSpentSeconds: {},
        startedAt: now(),
        completedAt: null,
        createdAt: now(),
      }
    );

    // Start attempts for both candidates
    const resA = await request(app)
      .post(`/api/assessments/${assessmentId}/attempts/start`)
      .set("Cookie", [csrf.cookie, authCookieFor(candidateHighRisk)])
      .set("x-csrf-token", csrf.token);
    highRiskAttemptId = resA.body.data.id;

    const resB = await request(app)
      .post(`/api/assessments/${assessmentId}/attempts/start`)
      .set("Cookie", [csrf.cookie, authCookieFor(candidateSafe)])
      .set("x-csrf-token", csrf.token);
    safeAttemptId = resB.body.data.id;

    // Simulate anomalies on Candidate High Risk (dropping Trust Score to 45)
    const highRiskAttempt = attempts.find((a) => a.id === highRiskAttemptId);
    highRiskAttempt.trustScore = 45;
    highRiskAttempt.flags = [
      {
        id: "FLG-1",
        eventType: "FACE_ABSENT",
        severity: "high",
        confidence: 0.95,
        trustScoreAfter: 85,
        createdAt: now(),
      },
      {
        id: "FLG-2",
        eventType: "MULTIPLE_FACES",
        severity: "high",
        confidence: 0.98,
        trustScoreAfter: 70,
        createdAt: now(),
      },
      {
        id: "FLG-3",
        eventType: "DEVICE_DETECTED",
        severity: "high",
        confidence: 0.91,
        trustScoreAfter: 45,
        createdAt: now(),
      },
    ];

    const safeAttempt = attempts.find((a) => a.id === safeAttemptId);
    safeAttempt.trustScore = 98;
  });

  describe("1. Live Proctoring Cockpit Grid & Anomaly Sorting", () => {
    it("Instructor retrieves active session grid, automatically sorted by highest risk first", async () => {
      const res = await request(app)
        .get("/api/proctoring/cockpit/active")
        .set("Cookie", authCookieFor(instructorProctor));

      expect(res.status).toBe(200);
      const data = res.body.data;
      expect(data.length).toBeGreaterThanOrEqual(2);

      // Verify Candidate High Risk appears first due to high risk ranking
      const firstCandidate = data[0];
      expect(firstCandidate.candidateId).toBe(candidateHighRisk.id);
      expect(firstCandidate.riskLevel).toBe("high");
      expect(firstCandidate.trustScore).toBe(45);
      expect(firstCandidate.flagsCount).toBe(3);
      expect(firstCandidate.recentFlags).toHaveLength(3);

      // Safe candidate follows
      const safeEntry = data.find((s) => s.candidateId === candidateSafe.id);
      expect(safeEntry.riskLevel).toBe("low");
      expect(safeEntry.trustScore).toBe(98);
    });

    it("Learners are strictly forbidden from viewing the proctoring cockpit", async () => {
      const res = await request(app)
        .get("/api/proctoring/cockpit/active")
        .set("Cookie", authCookieFor(candidateSafe));

      expect(res.status).toBe(403);
      expect(res.body.error).toContain("Forbidden");
    });
  });

  describe("2. Real-Time Remote Candidate Warnings", () => {
    let warningId;

    it("Proctor sends an urgent remote warning to Candidate High Risk", async () => {
      const res = await request(app)
        .post(`/api/proctoring/attempts/${highRiskAttemptId}/warn`)
        .set("Cookie", [csrf.cookie, authCookieFor(instructorProctor)])
        .set("x-csrf-token", csrf.token)
        .send({
          message: "Please remove external secondary monitors from your desk immediately.",
          severity: "critical",
        });

      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
      const warn = res.body.data;
      warningId = warn.id;
      expect(warn.id).toBeDefined();
      expect(warn.sentByName).toBe(instructorProctor.name);
      expect(warn.acknowledged).toBe(false);
    });

    it("Candidate receives pending warnings via polling endpoint", async () => {
      const res = await request(app)
        .get(`/api/assessments/attempts/${highRiskAttemptId}/warnings`)
        .set("Cookie", authCookieFor(candidateHighRisk));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].id).toBe(warningId);
      expect(res.body.data[0].message).toContain("remove external secondary monitors");
    });

    it("Candidate acknowledges receipt of warning", async () => {
      const res = await request(app)
        .post(`/api/assessments/attempts/${highRiskAttemptId}/warnings/${warningId}/ack`)
        .set("Cookie", [csrf.cookie, authCookieFor(candidateHighRisk)])
        .set("x-csrf-token", csrf.token);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.acknowledged).toBe(true);

      // Warning queue is now empty
      const checkRes = await request(app)
        .get(`/api/assessments/attempts/${highRiskAttemptId}/warnings`)
        .set("Cookie", authCookieFor(candidateHighRisk));

      expect(checkRes.body.data).toHaveLength(0);
    });
  });

  describe("3. Remote Exam Clock Pause & Resume", () => {
    it("Proctor pauses Candidate High Risk's exam session", async () => {
      const res = await request(app)
        .post(`/api/proctoring/attempts/${highRiskAttemptId}/pause`)
        .set("Cookie", [csrf.cookie, authCookieFor(instructorProctor)])
        .set("x-csrf-token", csrf.token);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.status).toBe("Paused");

      const attempt = attempts.find((a) => a.id === highRiskAttemptId);
      expect(attempt.isPaused).toBe(true);
    });

    it("Proctor resumes the paused exam session", async () => {
      const res = await request(app)
        .post(`/api/proctoring/attempts/${highRiskAttemptId}/resume`)
        .set("Cookie", [csrf.cookie, authCookieFor(instructorProctor)])
        .set("x-csrf-token", csrf.token);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.status).toBe("InProgress");

      const attempt = attempts.find((a) => a.id === highRiskAttemptId);
      expect(attempt.isPaused).toBe(false);
    });
  });

  describe("4. Remote Disqualification & Immediate Termination", () => {
    it("Proctor disqualifies Candidate High Risk, failing their enrollment immediately", async () => {
      const res = await request(app)
        .post(`/api/proctoring/attempts/${highRiskAttemptId}/terminate`)
        .set("Cookie", [csrf.cookie, authCookieFor(instructorProctor)])
        .set("x-csrf-token", csrf.token)
        .send({
          reason: "Persistent second person detected and unauthorized external hardware found.",
          evidenceSummary: "Flagged with 3 high severity anomalies and 1 ignored critical warning.",
        });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.status).toBe("Terminated");
      expect(res.body.data.score).toBe(0);

      // Verify attempt in memory
      const attempt = attempts.find((a) => a.id === highRiskAttemptId);
      expect(attempt.status).toBe("Terminated");
      expect(attempt.submittedAt).toBeDefined();

      // Verify candidate enrollment is marked Failed
      const assignment = assignments.find(
        (a) => a.courseId === courseId && a.userId === candidateHighRisk.id
      );
      expect(assignment.status).toBe("Failed");
    });
  });

  describe("5. Chronological Incident Timeline & Replay Engine", () => {
    it("Proctor retrieves complete chronological timeline of the terminated session", async () => {
      const res = await request(app)
        .get(`/api/proctoring/attempts/${highRiskAttemptId}/timeline`)
        .set("Cookie", authCookieFor(instructorProctor));

      expect(res.status).toBe(200);
      const data = res.body.data;
      expect(data.attemptId).toBe(highRiskAttemptId);
      expect(data.candidateName).toBe(candidateHighRisk.name);
      expect(data.status).toBe("Terminated");

      const timeline = data.timeline;
      expect(timeline.length).toBeGreaterThanOrEqual(5);

      // Verify chronological ordering
      const startItem = timeline.find((t) => t.type === "EXAM_STARTED");
      expect(startItem).toBeDefined();

      const warningItem = timeline.find((t) => t.type === "PROCTOR_WARNING");
      expect(warningItem).toBeDefined();
      expect(warningItem.details.message).toContain("remove external secondary monitors");

      const termItem = timeline.find((t) => t.type === "EXAM_TERMINATED");
      expect(termItem).toBeDefined();
      expect(termItem.severity).toBe("high");
    });
  });
});

