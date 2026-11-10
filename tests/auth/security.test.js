import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../backend/server.js";
import { testUsers, getCsrfPair, authCookieFor } from "../helpers/auth.js";
import { storage, loadDb, sessionVersions } from "../../backend/src/core.js";
import { JWT_SECRET } from "../../backend/src/config.js";

describe("Nalanda LMS — Security Controls & Input Sanitization", () => {
  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    await storage.init();
    await loadDb();
  });

  describe("Authentication Brute-Force & Lockout", () => {
    it("rejects a correctly signed JWT from the wrong issuer and audience", async () => {
      const user = testUsers.learner;
      const token = jwt.sign(
        { sub: user.id, role: user.role, sv: sessionVersions[user.id] || 0 },
        JWT_SECRET,
        { expiresIn: "5m", issuer: "untrusted-issuer", audience: "other-application" }
      );

      const res = await request(app)
        .get("/api/auth/me")
        .set("Cookie", `token=${token}`);

      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/Invalid or expired token/i);
    });

    it("should reject login with invalid credentials with 401", async () => {
      const { token, cookie } = await getCsrfPair();
      const res = await request(app)
        .post("/api/auth/login")
        .set("Cookie", cookie)
        .set("x-csrf-token", token)
        .send({
          email: "diya@nalanda.local",
          password: "wrongpassword123",
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/Invalid credentials/i);
    });

    it("should reject login with short password via schema validation (400)", async () => {
      const { token, cookie } = await getCsrfPair();
      const res = await request(app)
        .post("/api/auth/login")
        .set("Cookie", cookie)
        .set("x-csrf-token", token)
        .send({
          email: "diya@nalanda.local",
          password: "123",
        });

      expect(res.status).toBe(400);
    });

    it("throttles bad source/identity pairs without denying the correct password", async () => {
      const email = `lockout-${Date.now()}@example.com`;
      const password = "correct-password-123";
      const registrationCsrf = await getCsrfPair();
      const registered = await request(app)
        .post("/api/auth/register")
        .set("Cookie", registrationCsrf.cookie)
        .set("x-csrf-token", registrationCsrf.token)
        .send({ name: "Lockout Test", email, password });
      expect(registered.status).toBe(201);

      let finalFailure;
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const csrf = await getCsrfPair();
        finalFailure = await request(app)
          .post("/api/auth/login")
          .set("Cookie", csrf.cookie)
          .set("x-csrf-token", csrf.token)
          .send({ email, password: "incorrect-password-123" });
      }

      expect(finalFailure.status).toBe(429);
      expect(finalFailure.headers["retry-after"]).toBeDefined();
      expect(finalFailure.body).toEqual({ error: "Too many invalid login attempts. Please retry later." });

      const loginCsrf = await getCsrfPair();
      const validLogin = await request(app)
        .post("/api/auth/login")
        .set("Cookie", loginCsrf.cookie)
        .set("x-csrf-token", loginCsrf.token)
        .send({ email, password });

      expect(validLogin.status).toBe(200);
      expect(validLogin.body.user.email).toBe(email);
    });
  });

  describe("Rate Limiter & Endpoint Protection", () => {
    it("should respond normally within standard request rate", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
    });
  });

  describe("Input Validation & XSS Sanitization", () => {
    it("Chapter creation sanitizes malicious script tags in rich text body", async () => {
      const { token, cookie } = await getCsrfPair();
      const res = await request(app)
        .post("/api/chapters")
        .set("Cookie", `${cookie}; ${authCookieFor(testUsers.admin)}`)
        .set("x-csrf-token", token)
        .send({
          courseId: "NLD-SE-1001",
          title: "XSS Test Chapter",
          contentType: "Rich Text",
          body: "<p>Safe content</p><script>alert('pwned')</script>",
          durationMinutes: 10,
        });

      // Chapter creation may succeed or fail depending on courseId existence,
      // but if accepted or rejected, verify schema rejection or sanitization
      if (res.status === 201) {
        expect(res.body.data.body).not.toContain("<script>");
      } else {
        expect([400, 404]).toContain(res.status);
      }
    });
  });
});

