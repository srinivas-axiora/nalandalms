import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../backend/server.js";
import { testUsers, getCsrfPair, authCookieFor } from "../helpers/auth.js";
import { storage, loadDb, courses, assignments } from "../../backend/src/core.js";

describe("Nalanda LMS — Course Marketplace, Pricing & Checkout", () => {
  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    await storage.init();
    await loadDb();

    // Ensure we have a free course and a paid course for testing
    if (courses[0]) {
      courses[0].approval = "Approved";
      courses[0].status = "Active";
      courses[0].isFree = true;
      courses[0].priceCents = 0;
    }
    if (courses[1]) {
      courses[1].approval = "Approved";
      courses[1].status = "Active";
      courses[1].isFree = false;
      courses[1].priceCents = 499900; // ₹4,999
    }
  });

  describe("Public Course Catalog (GET /api/catalog)", () => {
    it("should return approved catalog courses without authentication", async () => {
      const res = await request(app).get("/api/catalog");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const item = res.body.data[0];
      expect(item.id).toBeDefined();
      expect(item.title).toBeDefined();
      expect(item.priceCents).toBeDefined();
      expect(item.currency).toBeDefined();
      expect(item.instructorName).toBeDefined();
      expect(typeof item.chapterCount).toBe("number");
    });

    it("should filter catalog by search query", async () => {
      const res = await request(app).get("/api/catalog?search=Security");
      expect(res.status).toBe(200);
      for (const item of res.body.data) {
        const matches =
          item.title.toLowerCase().includes("security") ||
          item.description.toLowerCase().includes("security") ||
          item.skill.toLowerCase().includes("security");
        expect(matches).toBe(true);
      }
    });
  });

  describe("Self-Enrollment (POST /api/courses/:id/enroll)", () => {
    it("should reject unauthenticated enrollment with 401", async () => {
      const { token, cookie } = await getCsrfPair();
      const res = await request(app)
        .post(`/api/courses/${courses[0].id}/enroll`)
        .set("Cookie", cookie)
        .set("x-csrf-token", token)
        .send({});
      expect(res.status).toBe(401);
    });

    it("should self-enroll candidate into a free approved course", async () => {
      const { token, cookie } = await getCsrfPair();
      // Remove any prior enrollment for diya in courses[0]
      const idx = assignments.findIndex((a) => a.courseId === courses[0].id && a.userId === testUsers.employee.id);
      if (idx !== -1) assignments.splice(idx, 1);

      const res = await request(app)
        .post(`/api/courses/${courses[0].id}/enroll`)
        .set("Cookie", `${cookie}; ${authCookieFor(testUsers.employee)}`)
        .set("x-csrf-token", token)
        .send({});

      expect(res.status).toBe(201);
      expect(res.body.data.courseId).toBe(courses[0].id);
      expect(res.body.data.userId).toBe(testUsers.employee.id);
      expect(res.body.data.progress).toBe(0);
    });

    it("should return 200 with existing enrollment if already enrolled", async () => {
      const { token, cookie } = await getCsrfPair();
      const res = await request(app)
        .post(`/api/courses/${courses[0].id}/enroll`)
        .set("Cookie", `${cookie}; ${authCookieFor(testUsers.employee)}`)
        .set("x-csrf-token", token)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/already enrolled/i);
    });

    it("should require payment (402) when enrolling in a paid course", async () => {
      const { token, cookie } = await getCsrfPair();
      // Remove any prior enrollment
      const idx = assignments.findIndex((a) => a.courseId === courses[1].id && a.userId === testUsers.employee.id);
      if (idx !== -1) assignments.splice(idx, 1);

      const res = await request(app)
        .post(`/api/courses/${courses[1].id}/enroll`)
        .set("Cookie", `${cookie}; ${authCookieFor(testUsers.employee)}`)
        .set("x-csrf-token", token)
        .send({});

      expect(res.status).toBe(402);
      expect(res.body.error).toMatch(/Payment required/i);
      expect(res.body.priceCents).toBeGreaterThan(0);
    });
  });

  describe("Checkout & Payment Gateway (Razorpay Engine)", () => {
    let orderId = "";

    it("should create a checkout order for paid course", async () => {
      const { token, cookie } = await getCsrfPair();
      const res = await request(app)
        .post("/api/payments/create-order")
        .set("Cookie", `${cookie}; ${authCookieFor(testUsers.employee)}`)
        .set("x-csrf-token", token)
        .send({ courseId: courses[1].id });

      expect(res.status).toBe(200);
      expect(res.body.orderId).toBeDefined();
      expect(res.body.amount).toBe(courses[1].priceCents);
      expect(res.body.currency).toBe("INR");
      expect(res.body.keyId).toBeDefined();
      orderId = res.body.orderId;
    });

    it("should verify payment and auto-enroll the candidate", async () => {
      const { token, cookie } = await getCsrfPair();
      const res = await request(app)
        .post("/api/payments/verify")
        .set("Cookie", `${cookie}; ${authCookieFor(testUsers.employee)}`)
        .set("x-csrf-token", token)
        .send({
          orderId,
          paymentId: `pay_${Date.now()}`,
          courseId: courses[1].id,
        });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.enrollment).toBeDefined();
      expect(res.body.enrollment.courseId).toBe(courses[1].id);
      expect(res.body.enrollment.userId).toBe(testUsers.employee.id);
    });
  });
});
