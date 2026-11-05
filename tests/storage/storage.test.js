import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../backend/server.js";
import { testUsers, getCsrfPair, authCookieFor } from "../helpers/auth.js";
import { storage, loadDb, attempts } from "../../backend/src/core.js";
import { uploadBuffer, deleteObject } from "../../backend/src/storage/object-store.js";
import { rateLimitCheckAndIncr } from "../../backend/src/cache/redis.js";

describe("Nalanda LMS — Cloud Storage, Media & Redis Rate Limiting", () => {
  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    await storage.init();
    await loadDb();
    if (!attempts.some((item) => item.id === "ATT-TEST-001")) {
      attempts.push({
        id: "ATT-TEST-001",
        assessmentId: "ASM-TEST-UPLOAD",
        courseId: "CRS-001",
        userId: testUsers.employee.id,
        status: "InProgress",
        answers: {},
        flags: [],
        startedAt: new Date().toISOString(),
      });
    }
  });

  describe("Object Storage Adapter", () => {
    it("should write and delete a buffer cleanly", async () => {
      const testKey = `test/spec-${Date.now()}.txt`;
      const buffer = Buffer.from("Nalanda media storage unit test");
      const res = await uploadBuffer(testKey, buffer, "text/plain");

      expect(res.key).toBe(testKey);
      expect(["s3", "local"]).toContain(res.mode);

      const deleted = await deleteObject(testKey);
      expect(deleted).toBe(true);
    });
  });

  describe("Pre-Signed Upload Endpoints (/api/uploads/presign)", () => {
    it("should reject unauthenticated request with 401", async () => {
      const { token, cookie } = await getCsrfPair();
      const res = await request(app)
        .post("/api/uploads/presign")
        .set("Cookie", cookie)
        .set("x-csrf-token", token)
        .send({
          courseId: "CRS-001",
          filename: "intro.mp4",
          contentType: "video/mp4",
        });
      expect(res.status).toBe(401);
    });

    it("should reject Employee role with 403 (Admin/Manager required)", async () => {
      const { token, cookie } = await getCsrfPair();
      const res = await request(app)
        .post("/api/uploads/presign")
        .set("Cookie", `${cookie}; ${authCookieFor(testUsers.employee)}`)
        .set("x-csrf-token", token)
        .send({
          courseId: "CRS-001",
          filename: "intro.mp4",
          contentType: "video/mp4",
        });
      expect(res.status).toBe(403);
    });

    it("should reject unsupported MIME type with 415", async () => {
      const { token, cookie } = await getCsrfPair();
      const res = await request(app)
        .post("/api/uploads/presign")
        .set("Cookie", `${cookie}; ${authCookieFor(testUsers.admin)}`)
        .set("x-csrf-token", token)
        .send({
          courseId: "CRS-001",
          filename: "malicious.exe",
          contentType: "application/x-msdownload",
        });
      expect(res.status).toBe(415);
    });

    it("should issue a presigned upload URL for valid course media", async () => {
      const { token, cookie } = await getCsrfPair();
      const res = await request(app)
        .post("/api/uploads/presign")
        .set("Cookie", `${cookie}; ${authCookieFor(testUsers.admin)}`)
        .set("x-csrf-token", token)
        .send({
          courseId: "CRS-001",
          filename: "syllabus.pdf",
          contentType: "application/pdf",
          category: "chapter_pdf",
        });

      expect(res.status).toBe(200);
      expect(res.body.uploadUrl).toBeDefined();
      expect(res.body.key).toMatch(/^chapter_pdf\/CRS-001\//);
      expect(res.body.downloadUrl).toBeDefined();
    });
  });

  describe("Proctoring Capture Upload (/api/proctoring/captures)", () => {
    it("should accept snapshot upload and return persistent key", async () => {
      const { token, cookie } = await getCsrfPair();
      const res = await request(app)
        .post("/api/proctoring/captures")
        .set("Cookie", `${cookie}; ${authCookieFor(testUsers.employee)}`)
        .set("x-csrf-token", token)
        .send({
          attemptId: "ATT-TEST-001",
          questionId: "Q-1",
          imageData: "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.key).toMatch(/^proctoring\/ATT-TEST-001\//);
    });
  });

  describe("Redis / Distributed Sliding Window Rate Limiter", () => {
    it("should track and enforce sliding window budget", async () => {
      const testKey = `test:rl:${Date.now()}`;
      const windowSeconds = 10;
      const limit = 3;

      const r1 = await rateLimitCheckAndIncr(testKey, windowSeconds, limit);
      expect(r1.allowed).toBe(true);

      const r2 = await rateLimitCheckAndIncr(testKey, windowSeconds, limit);
      expect(r2.allowed).toBe(true);

      const r3 = await rateLimitCheckAndIncr(testKey, windowSeconds, limit);
      expect(r3.allowed).toBe(true);

      const r4 = await rateLimitCheckAndIncr(testKey, windowSeconds, limit);
      expect(r4.allowed).toBe(false);
      expect(r4.remaining).toBe(0);
    });
  });
});
