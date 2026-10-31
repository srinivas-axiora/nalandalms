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

describe("Sprint 8: WebRTC Proctoring, Continuous Chunking & Dual-Camera Pairing", () => {
  let csrf;
  const courseId = "CRS-SPRINT8-PROCTOR";
  const assessmentId = "ASM-S8-PROCTORED";
  let candidateAttemptId;

  const candidateA = {
    id: "EMP-S8-CANDIDATE-A",
    role: "Learner",
    name: "Candidate Alpha",
    email: "alpha@nalanda.edu",
    status: "Active",
  };
  const candidateB = {
    id: "EMP-S8-CANDIDATE-B",
    role: "Learner",
    name: "Candidate Beta",
    email: "beta@nalanda.edu",
    status: "Active",
  };
  const proctor = {
    id: "EMP-S8-PROCTOR",
    role: "Instructor",
    name: "Chief Proctor Holmes",
    email: "proctor@nalanda.edu",
    status: "Active",
  };

  beforeAll(async () => {
    csrf = await getCsrfPair();

    if (!users.some((u) => u.id === candidateA.id)) users.push(candidateA);
    if (!users.some((u) => u.id === candidateB.id)) users.push(candidateB);
    if (!users.some((u) => u.id === proctor.id)) users.push(proctor);

    courses.push({
      id: courseId,
      title: "Sprint 8 High-Stakes Proctored Certification",
      status: "Active",
      approval: "Approved",
      ownerId: proctor.id,
      priceCents: 0,
      isFree: true,
      createdAt: now(),
      updatedAt: now(),
    });

    assessments.push({
      id: assessmentId,
      courseId,
      title: "Screening Proctored Exam",
      type: "MCQ",
      approval: "Approved",
      status: "Active",
      durationMinutes: 30,
      passScore: 75,
      ownerId: proctor.id,
      questions: [
        {
          id: "Q-P1",
          type: "MCQ",
          prompt: "What is the primary function of a WebRTC ICE candidate?",
          options: ["Discover network address", "Encrypt video", "Compress audio", "Authenticate user"],
          answer: 0,
          points: 100,
        },
      ],
      createdAt: now(),
      updatedAt: now(),
    });

    // Start an exam attempt for Candidate A
    assignments.push({
      id: "ENR-S8-001",
      courseId,
      userId: candidateA.id,
      assignedBy: proctor.id,
      status: "AssessmentEligible",
      progress: 100,
      completedChapters: [],
      timeSpentSeconds: 1200,
      timeSpentMinutes: 20,
      chapterTimeSpentSeconds: {},
      startedAt: now(),
      completedAt: null,
      createdAt: now(),
    });

    const startRes = await request(app)
      .post(`/api/assessments/${assessmentId}/attempts/start`)
      .set("Cookie", [csrf.cookie, authCookieFor(candidateA)])
      .set("x-csrf-token", csrf.token);

    candidateAttemptId = startRes.body.data.id;
  });

  describe("1. Real-Time Anomaly Event Streaming & Trust Score Engine", () => {
    it("Candidate records a high-severity FACE_ABSENT anomaly, reducing trust score by 15", async () => {
      const res = await request(app)
        .post(`/api/proctoring/attempts/${candidateAttemptId}/events`)
        .set("Cookie", [csrf.cookie, authCookieFor(candidateA)])
        .set("x-csrf-token", csrf.token)
        .send({
          eventType: "FACE_ABSENT",
          severity: "high",
          confidence: 0.94,
          metadata: { absentDurationSeconds: 4.2 },
        });

      expect(res.status).toBe(201);
      expect(res.body.data.eventType).toBe("FACE_ABSENT");
      expect(res.body.trustScore).toBe(85); // 100 - 15 = 85
      expect(res.body.totalFlags).toBe(1);
    });

    it("Candidate records a medium-severity GAZE_AWAY anomaly, reducing trust score by 5", async () => {
      const res = await request(app)
        .post(`/api/proctoring/attempts/${candidateAttemptId}/events`)
        .set("Cookie", [csrf.cookie, authCookieFor(candidateA)])
        .set("x-csrf-token", csrf.token)
        .send({
          eventType: "GAZE_AWAY",
          severity: "medium",
          confidence: 0.88,
          metadata: { direction: "down-left", deviationDegrees: 34 },
        });

      expect(res.status).toBe(201);
      expect(res.body.data.eventType).toBe("GAZE_AWAY");
      expect(res.body.trustScore).toBe(80); // 85 - 5 = 80
      expect(res.body.totalFlags).toBe(2);
    });

    it("Candidate B cannot inject proctoring events into Candidate A's exam attempt", async () => {
      const res = await request(app)
        .post(`/api/proctoring/attempts/${candidateAttemptId}/events`)
        .set("Cookie", [csrf.cookie, authCookieFor(candidateB)])
        .set("x-csrf-token", csrf.token)
        .send({
          eventType: "DEVICE_DETECTED",
          severity: "high",
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain("Forbidden");
    });

    it("Proctor retrieves candidate's event audit trail with live trust score", async () => {
      const res = await request(app)
        .get(`/api/proctoring/attempts/${candidateAttemptId}/events`)
        .set("Cookie", authCookieFor(proctor));

      expect(res.status).toBe(200);
      expect(res.body.data.attemptId).toBe(candidateAttemptId);
      expect(res.body.data.trustScore).toBe(80);
      expect(res.body.data.flags).toHaveLength(2);
    });
  });

  describe("2. Continuous Video Chunk Upload & Replay Manifest Pipeline", () => {
    it("Candidate uploads a primary webcam video chunk (.webm)", async () => {
      const fakeWebmBuffer = Buffer.from("GHOST_WEBM_BINARY_HEADER_CHUNK_0");

      const res = await request(app)
        .post(`/api/proctoring/attempts/${candidateAttemptId}/chunks`)
        .set("Cookie", [csrf.cookie, authCookieFor(candidateA)])
        .set("x-csrf-token", csrf.token)
        .field("chunkIndex", 0)
        .field("streamRole", "primary")
        .field("durationSeconds", 10)
        .attach("chunk", fakeWebmBuffer, "primary_chunk_0000.webm");

      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.chunkIndex).toBe(0);
      expect(res.body.data.streamRole).toBe("primary");
      expect(res.body.data.key).toContain("primary_chunk_0000.webm");
    });

    it("Candidate uploads a companion mobile secondary angle video chunk", async () => {
      const fakeCompanionBuffer = Buffer.from("COMPANION_CAMERA_WEBM_CHUNK_0");

      const res = await request(app)
        .post(`/api/proctoring/attempts/${candidateAttemptId}/chunks`)
        .set("Cookie", [csrf.cookie, authCookieFor(candidateA)])
        .set("x-csrf-token", csrf.token)
        .field("chunkIndex", 0)
        .field("streamRole", "companion")
        .field("durationSeconds", 10)
        .attach("chunk", fakeCompanionBuffer, "companion_chunk_0000.webm");

      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.streamRole).toBe("companion");
      expect(res.body.data.key).toContain("companion_chunk_0000.webm");
    });

    it("Proctor retrieves video chunk manifest containing both primary and companion angles", async () => {
      const res = await request(app)
        .get(`/api/proctoring/attempts/${candidateAttemptId}/chunks`)
        .set("Cookie", authCookieFor(proctor));

      expect(res.status).toBe(200);
      const manifest = res.body.data;
      expect(manifest.totalChunks).toBe(2);
      expect(manifest.primaryCount).toBe(1);
      expect(manifest.companionCount).toBe(1);
    });
  });

  describe("3. WebRTC Signaling Broker for Live Proctored Feed", () => {
    it("Candidate posts a WebRTC SDP offer targeted for the proctor cockpit", async () => {
      const res = await request(app)
        .post(`/api/proctoring/attempts/${candidateAttemptId}/signal`)
        .set("Cookie", [csrf.cookie, authCookieFor(candidateA)])
        .set("x-csrf-token", csrf.token)
        .send({
          targetRole: "proctor",
          type: "offer",
          streamRole: "primary",
          data: { sdp: "v=0\r\no=candidate 12345 2 IN IP4 127.0.0.1..." },
        });

      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.type).toBe("offer");
    });

    it("Proctor polls signaling broker and receives candidate's SDP offer", async () => {
      const res = await request(app)
        .get(`/api/proctoring/attempts/${candidateAttemptId}/signals?targetRole=proctor`)
        .set("Cookie", authCookieFor(proctor));

      expect(res.status).toBe(200);
      expect(res.body.count).toBeGreaterThanOrEqual(1);
      const offerSignal = res.body.data.find((s) => s.type === "offer");
      expect(offerSignal).toBeDefined();
      expect(offerSignal.data.sdp).toContain("v=0");
    });
  });

  describe("4. Mobile Companion Pairing via QR Code", () => {
    let pairingToken;

    it("Candidate requests a mobile pairing token for dual-angle setup", async () => {
      const res = await request(app)
        .post(`/api/proctoring/attempts/${candidateAttemptId}/companion/token`)
        .set("Cookie", [csrf.cookie, authCookieFor(candidateA)])
        .set("x-csrf-token", csrf.token);

      expect(res.status).toBe(200);
      pairingToken = res.body.data.pairingToken;
      expect(pairingToken).toMatch(/^NLD-PAIR-[A-F0-9]{32}$/);
      expect(res.body.data.pairUrl).toContain(pairingToken);
    });

    it("Mobile companion device successfully pairs using token (No candidate login needed)", async () => {
      const res = await request(app)
        .post("/api/proctoring/companion/pair")
        .send({
          pairingToken,
          deviceName: "Pixel 8 Pro - Rear Workspace Camera",
          batteryLevel: 89,
        });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.message).toContain("successfully paired");
      expect(res.body.data.attemptId).toBe(candidateAttemptId);
    });

    it("Desktop client confirms companion camera is active and paired", async () => {
      const res = await request(app)
        .get(`/api/proctoring/attempts/${candidateAttemptId}/companion/status`)
        .set("Cookie", authCookieFor(candidateA));

      expect(res.status).toBe(200);
      expect(res.body.data.isPaired).toBe(true);
      expect(res.body.data.companion.deviceName).toContain("Pixel 8 Pro");
      expect(res.body.data.companion.batteryLevel).toBe(89);
    });

    it("Submitting invalid pairing token returns 404", async () => {
      const res = await request(app)
        .post("/api/proctoring/companion/pair")
        .send({
          pairingToken: "NLD-PAIR-INVALID00000000000000000",
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toContain("Invalid or expired");
    });
  });
});

