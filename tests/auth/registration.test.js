import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../backend/server.js";
import { getCsrfPair } from "../helpers/auth.js";
import { storage, loadDb } from "../../backend/src/core.js";

describe("Nalanda LMS — Public Registration & Password Lifecycle", () => {
  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    await storage.init();
    await loadDb();
  });

  const testEmail = `candidate-${Date.now()}@example.com`;
  const initialPassword = "securePassword123!";
  const updatedPassword = "newPassword456!xyz";

  describe("Public Self-Registration (/api/auth/register)", () => {
    it("should reject registration with invalid email (400)", async () => {
      const { token, cookie } = await getCsrfPair();
      const res = await request(app)
        .post("/api/auth/register")
        .set("Cookie", cookie)
        .set("x-csrf-token", token)
        .send({
          name: "Test Candidate",
          email: "not-an-email",
          password: initialPassword,
        });

      expect(res.status).toBe(400);
    });

    it("should reject registration with password shorter than 8 chars (400)", async () => {
      const { token, cookie } = await getCsrfPair();
      const res = await request(app)
        .post("/api/auth/register")
        .set("Cookie", cookie)
        .set("x-csrf-token", token)
        .send({
          name: "Test Candidate",
          email: "candidate@example.com",
          password: "short",
        });

      expect(res.status).toBe(400);
    });

    it("should successfully register a new Learner and issue auth cookie (201)", async () => {
      const { token, cookie } = await getCsrfPair();
      const res = await request(app)
        .post("/api/auth/register")
        .set("Cookie", cookie)
        .set("x-csrf-token", token)
        .send({
          name: "Sarah Connor",
          email: testEmail,
          password: initialPassword,
          role: "Learner",
        });

      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testEmail.toLowerCase());
      expect(res.body.user.role).toBe("Learner");
      expect(res.body.user.passwordHash).toBeUndefined();

      // Auth cookie must be set
      const cookies = res.headers["set-cookie"];
      expect(cookies.some((c) => c.startsWith("token="))).toBe(true);
    });

    it("should reject registration when email already exists (409)", async () => {
      const { token, cookie } = await getCsrfPair();
      const res = await request(app)
        .post("/api/auth/register")
        .set("Cookie", cookie)
        .set("x-csrf-token", token)
        .send({
          name: "Duplicate User",
          email: testEmail,
          password: "anotherPassword123",
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/already exists/i);
    });
  });

  describe("Login with Newly Registered Account", () => {
    it("should successfully log in with registered credentials", async () => {
      const { token, cookie } = await getCsrfPair();
      const res = await request(app)
        .post("/api/auth/login")
        .set("Cookie", cookie)
        .set("x-csrf-token", token)
        .send({
          email: testEmail,
          password: initialPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(testEmail.toLowerCase());
    });
  });

  describe("Forgot & Reset Password Lifecycle", () => {
    let resetToken = "";

    it("should request password reset and receive signed token in test environment", async () => {
      const { token, cookie } = await getCsrfPair();
      const res = await request(app)
        .post("/api/auth/forgot-password")
        .set("Cookie", cookie)
        .set("x-csrf-token", token)
        .send({
          email: testEmail,
        });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.resetToken).toBeDefined();
      resetToken = res.body.resetToken;
    });

    it("should reset password using token", async () => {
      const { token, cookie } = await getCsrfPair();
      const res = await request(app)
        .post("/api/auth/reset-password")
        .set("Cookie", cookie)
        .set("x-csrf-token", token)
        .send({
          token: resetToken,
          newPassword: updatedPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });

    it("should reject subsequent login with old password", async () => {
      const { token, cookie } = await getCsrfPair();
      const res = await request(app)
        .post("/api/auth/login")
        .set("Cookie", cookie)
        .set("x-csrf-token", token)
        .send({
          email: testEmail,
          password: initialPassword,
        });

      expect(res.status).toBe(401);
    });

    it("should log in successfully with updated password", async () => {
      const { token, cookie } = await getCsrfPair();
      const res = await request(app)
        .post("/api/auth/login")
        .set("Cookie", cookie)
        .set("x-csrf-token", token)
        .send({
          email: testEmail,
          password: updatedPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(testEmail.toLowerCase());
    });
  });
});

