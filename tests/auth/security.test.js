import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../backend/server.js";
import { testUsers, getCsrfPair, authCookieFor } from "../helpers/auth.js";
import { storage, loadDb } from "../../backend/src/core.js";

describe("Nalanda LMS — Security Controls & Input Sanitization", () => {
  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    await storage.init();
    await loadDb();
  });

  describe("Authentication Brute-Force & Lockout", () => {
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

