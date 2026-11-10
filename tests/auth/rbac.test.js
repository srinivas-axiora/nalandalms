import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../backend/server.js";
import { testUsers, getCsrfPair, authCookieFor, stepUpCookieFor } from "../helpers/auth.js";
import { storage, loadDb } from "../../backend/src/core.js";

describe("Nalanda LMS — Security & RBAC Test Suite", () => {
  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    await storage.init();
    await loadDb();
  });

  describe("Public & Health Endpoints", () => {
    it("GET /api/health should return ok: true and service info", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.service).toBe("Nalanda API");
    });

    it("GET /api/csrf-token should issue a CSRF cookie and token", async () => {
      const res = await request(app).get("/api/csrf-token");
      expect(res.status).toBe(200);
      expect(res.body.csrfToken).toBeDefined();
      expect(res.headers["set-cookie"]).toBeDefined();
    });
  });

  describe("Authentication Requirements", () => {
    it("should return 401 when accessing /api/app-data without token", async () => {
      const res = await request(app).get("/api/app-data");
      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/Missing token/i);
    });

    it("should return 401 when accessing /api/auth/me without token", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
    });

    it("should return 401 with invalid token", async () => {
      const res = await request(app)
        .get("/api/app-data")
        .set("Cookie", "token=invalid.jwt.token");
      expect(res.status).toBe(401);
    });
  });

  describe("CSRF Protection on Mutations", () => {
    it("should reject POST requests with 403 if CSRF is missing", async () => {
      const res = await request(app)
        .post("/api/auth/logout")
        .send({});
      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/Invalid CSRF token/i);
    });

    it("should reject POST requests if CSRF header does not match cookie", async () => {
      const { token, cookie } = await getCsrfPair();
      const res = await request(app)
        .post("/api/auth/logout")
        .set("Cookie", cookie)
        .set("x-csrf-token", "tampered-token")
        .send({});
      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/Invalid CSRF token/i);
    });
  });

  describe("Role-Based Access Control (RBAC)", () => {
    it("Employee should be denied access to Admin user management (GET /api/users)", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Cookie", authCookieFor(testUsers.employee));
      expect(res.status).toBe(403);
      expect(res.body.error).toBe("Forbidden");
    });

    it("Manager should be allowed access to team users (GET /api/users)", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Cookie", authCookieFor(testUsers.manager));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("Admin should be allowed access to all users (GET /api/users)", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Cookie", authCookieFor(testUsers.admin));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("Employee cannot create a course (POST /api/courses)", async () => {
      const { token, cookie } = await getCsrfPair();
      const res = await request(app)
        .post("/api/courses")
        .set("Cookie", `${cookie}; ${authCookieFor(testUsers.employee)}`)
        .set("x-csrf-token", token)
        .send({
          title: "Malicious Course",
          description: "This should be forbidden",
          skill: "Security",
        });
      expect(res.status).toBe(403);
    });

    it("Manager cannot duplicate another owner's course", async () => {
      const { token, cookie } = await getCsrfPair();
      const res = await request(app)
        .post("/api/courses/CRS-001/duplicate")
        .set("Cookie", `${cookie}; ${authCookieFor(testUsers.manager)}`)
        .set("x-csrf-token", token)
        .send({});
      expect(res.status).toBe(403);
      expect(res.body.error).toBe("Forbidden");
    });

    it("Employee cannot delete an assessment (DELETE /api/assessments/:id)", async () => {
      const { token, cookie } = await getCsrfPair();
      const res = await request(app)
        .delete("/api/assessments/ASM-1001")
        .set("Cookie", `${cookie}; ${authCookieFor(testUsers.employee)}`)
        .set("x-csrf-token", token)
        .send({ deletionComment: "Forbidden deletion attempt" });
      expect(res.status).toBe(403);
    });
  });

  describe("Data Scoping & Leakage Prevention (/api/app-data)", () => {
    it("Employee response contains ONLY self profile and NO audit/security logs", async () => {
      const res = await request(app)
        .get("/api/app-data")
        .set("Cookie", authCookieFor(testUsers.employee));

      expect(res.status).toBe(200);
      const data = res.body;

      // Scoped users: only self
      expect(data.users.length).toBe(1);
      expect(data.users[0].id).toBe(testUsers.employee.id);

      // Sensitive administrative tables must be empty for employee
      expect(data.auditLogs).toEqual([]);
      expect(data.securityEvents).toEqual([]);
      expect(data.settings).toEqual({});
      expect(data.archives).toEqual([]);

      // Assessments must NOT contain answer keys
      for (const assessment of data.assessments || []) {
        for (const question of assessment.questions || []) {
          expect(question.answer).toBeUndefined();
          expect(question.correctAnswer).toBeUndefined();
          expect(question.expectedAnswer).toBeUndefined();
        }
      }

      // Feedbacks: employee cannot see other employees' feedbacks
      for (const feedback of data.chapterFeedbacks || []) {
        expect(feedback.userId).toBe(testUsers.employee.id);
      }
    });

    it("Manager response contains only direct reports + self", async () => {
      const res = await request(app)
        .get("/api/app-data")
        .set("Cookie", authCookieFor(testUsers.manager));

      expect(res.status).toBe(200);
      const data = res.body;

      // Manager must not see audit logs or global settings
      expect(data.auditLogs).toEqual([]);
      expect(data.securityEvents).toEqual([]);
      expect(data.settings).toEqual({});

      // Users returned must only be self or direct reports
      for (const u of data.users) {
        expect(u.id === testUsers.manager.id || u.managerId === testUsers.manager.id).toBe(true);
      }
    });

    it("Admin response includes settings, auditLogs, and all users", async () => {
      const res = await request(app)
        .get("/api/app-data")
        .set("Cookie", authCookieFor(testUsers.admin));

      expect(res.status).toBe(200);
      const data = res.body;

      expect(data.users.length).toBeGreaterThan(1);
      expect(Array.isArray(data.auditLogs)).toBe(true);
      expect(typeof data.settings).toBe("object");
    });
  });

  describe("Assessment Attempt Protection", () => {
    it("Starting an assessment requires enrollment in the course", async () => {
      const { token, cookie } = await getCsrfPair();
      // Try to start with an employee who is not assigned to course
      const res = await request(app)
        .post("/api/assessments/ASM-9999/attempts/start")
        .set("Cookie", `${cookie}; ${authCookieFor(testUsers.employee)}`)
        .set("x-csrf-token", token)
        .send({});

      // Should be 404 (if not found) or 403 (if not assigned)
      expect([403, 404]).toContain(res.status);
    });
  });
});

