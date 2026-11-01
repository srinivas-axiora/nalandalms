import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../backend/server.js";
import {
  users,
  courses,
  assignments,
  attempts,
  now,
} from "../../backend/src/core.js";
import { runRetentionCleanup } from "../../backend/src/workers/retention-cleanup.js";
import { testUsers, getCsrfPair, authCookieFor, stepUpCookieFor } from "../helpers/auth.js";

describe("Sprint 11: Production Polish, Health Telemetry & Privacy Compliance", () => {
  let csrf;
  const compliantUser = {
    id: "EMP-S11-PRIVACY",
    role: "Learner",
    name: "Ada Lovelace",
    email: "ada@nalanda.edu",
    status: "Active",
  };

  beforeAll(async () => {
    csrf = await getCsrfPair();
    if (!users.some((u) => u.id === compliantUser.id)) users.push(compliantUser);

    assignments.push({
      id: "ENR-S11-001",
      courseId: "CRS-001",
      userId: compliantUser.id,
      assignedBy: "EMP-1001",
      status: "InProgress",
      progress: 50,
      completedChapters: ["CH-001"],
      timeSpentSeconds: 1800,
      timeSpentMinutes: 30,
      chapterTimeSpentSeconds: { "CH-001": 1800 },
      startedAt: now(),
      completedAt: null,
      createdAt: now(),
    });
  });

  describe("1. Deep Health Telemetry & Request Correlation", () => {
    it("GET /api/health returns deep component diagnostics, memory stats and uptime", async () => {
      const res = await request(app).get("/api/health");

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.version).toBe("2.0.0-gtm");
      expect(res.body.uptimeSeconds).toBeGreaterThanOrEqual(0);

      const status = res.body.status;
      expect(status.api).toBe("healthy");
      expect(status.storage.operational).toBe(true);
      expect(status.database.connected).toBe(true);

      const system = res.body.system;
      expect(system.memoryRssMb).toBeGreaterThan(0);
      expect(system.memoryHeapUsedMb).toBeGreaterThan(0);
    });

    it("Every HTTP response carries an x-request-id correlation header", async () => {
      const res = await request(app).get("/api/health");
      expect(res.headers["x-request-id"]).toBeDefined();
      expect(res.headers["x-request-id"]).toMatch(/^REQ-[a-f0-9]{16}$/);
    });
  });

  describe("2. GDPR Article 20: Complete Personal Data Export", () => {
    it("Authenticated learner downloads complete portable JSON archive of personal data", async () => {
      const res = await request(app)
        .get("/api/users/me/data-export")
        .set("Cookie", authCookieFor(compliantUser));

      expect(res.status).toBe(200);
      expect(res.headers["content-disposition"]).toContain("nalanda-data-export");

      const archive = res.body;
      expect(archive.exportMetadata.userId).toBe(compliantUser.id);
      expect(archive.profile.name).toBe(compliantUser.name);
      expect(archive.profile.email).toBe(compliantUser.email);
      expect(archive.learning.enrollmentsCount).toBeGreaterThanOrEqual(1);
      expect(archive.learning.enrollments[0].courseId).toBe("CRS-001");
    });
  });

  describe("3. GDPR Article 17 / DPDPA: Right to Erasure & Grace Period", () => {
    it("Learner queues account deletion with a 30-day grace period", async () => {
      const res = await request(app)
        .post("/api/users/me/delete-request")
        .set("Cookie", [csrf.cookie, authCookieFor(compliantUser), stepUpCookieFor(compliantUser)])
        .set("x-csrf-token", csrf.token)
        .send({
          confirmEmail: compliantUser.email,
          reason: "Completed studies; requesting data deletion.",
        });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.scheduledDeletionDate).toBeDefined();

      const user = users.find((u) => u.id === compliantUser.id);
      expect(user.deletionScheduledAt).toBeDefined();
    });

    it("Providing an incorrect confirmation email is rejected with 400", async () => {
      const res = await request(app)
        .post("/api/users/me/delete-request")
        .set("Cookie", [csrf.cookie, authCookieFor(compliantUser), stepUpCookieFor(compliantUser)])
        .set("x-csrf-token", csrf.token)
        .send({
          confirmEmail: "wrong@nalanda.edu",
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("does not match");
    });

    it("Learner can cancel the scheduled deletion before grace period expires", async () => {
      const res = await request(app)
        .post("/api/users/me/cancel-delete")
        .set("Cookie", [csrf.cookie, authCookieFor(compliantUser)])
        .set("x-csrf-token", csrf.token);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);

      const user = users.find((u) => u.id === compliantUser.id);
      expect(user.deletionScheduledAt).toBeUndefined();
    });
  });

  describe("4. Automated Evidence Retention Cleanup Worker", () => {
    it("Retention worker purges video chunks older than retention threshold", () => {
      // Seed an expired exam attempt older than 90 days with video chunks
      const oldSubmittedAt = new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString();
      const oldAttempt = {
        id: "ATT-EXPIRED-RETENTION-001",
        assessmentId: "ASM-001",
        courseId: "CRS-001",
        userId: compliantUser.id,
        status: "Passed",
        startedAt: oldSubmittedAt,
        submittedAt: oldSubmittedAt,
        videoChunks: [
          { chunkIndex: 0, streamRole: "primary", key: "proctoring/ATT-EXPIRED/chunk_0000.webm" },
          { chunkIndex: 1, streamRole: "primary", key: "proctoring/ATT-EXPIRED/chunk_0001.webm" },
        ],
      };
      attempts.push(oldAttempt);

      // Run cleanup
      const result = runRetentionCleanup({ retentionDays: 90, dryRun: false });

      expect(result.purgedAttemptsCount).toBeGreaterThanOrEqual(1);
      expect(result.deletedChunksCount).toBeGreaterThanOrEqual(2);

      // Verify the old attempt had chunks cleared
      expect(oldAttempt.videoChunks).toHaveLength(0);
      expect(oldAttempt.retentionPurgedAt).toBeDefined();
    });
  });
});

