import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "../../backend/server.js";
import {
  assignments,
  courses,
  paymentOrders,
  paymentTransactions,
} from "../../backend/src/core.js";
import { authCookieFor, getCsrfPair, testUsers } from "../helpers/auth.js";

describe("server-authoritative enrollment prerequisites", () => {
  const suffix = Date.now().toString(36);
  const prerequisiteId = `CRS-P67-PRE-${suffix}`;
  const freeCourseId = `CRS-P67-FREE-${suffix}`;
  const paidCourseId = `CRS-P67-PAID-${suffix}`;
  let csrf;

  beforeAll(async () => {
    csrf = await getCsrfPair();
    const base = {
      description: "Phase 67 prerequisite validation course",
      skill: "Security",
      skillIds: [],
      targetLevel: "Intermediate",
      difficulty: "Intermediate",
      estimatedHours: 1,
      currency: "INR",
      category: "Technical",
      tags: [],
      thumbnailColor: "#123456",
      ownerId: testUsers.admin.id,
      approval: "Approved",
      status: "Active",
      version: 1,
      createdAt: new Date().toISOString(),
    };
    courses.push(
      { ...base, id: prerequisiteId, title: "Prerequisite", prerequisites: [], priceCents: 0, isFree: true },
      { ...base, id: freeCourseId, title: "Free gated course", prerequisites: [prerequisiteId], priceCents: 0, isFree: true },
      { ...base, id: paidCourseId, title: "Paid gated course", prerequisites: [prerequisiteId], priceCents: 2500, isFree: false },
    );
  });

  afterAll(() => {
    for (const collection of [courses, assignments]) {
      for (let index = collection.length - 1; index >= 0; index -= 1) {
        const item = collection[index];
        if ([prerequisiteId, freeCourseId, paidCourseId].includes(item.id || item.courseId)) {
          collection.splice(index, 1);
        }
      }
    }
    for (let index = paymentOrders.length - 1; index >= 0; index -= 1) {
      if (paymentOrders[index].courseId === paidCourseId) paymentOrders.splice(index, 1);
    }
    for (let index = paymentTransactions.length - 1; index >= 0; index -= 1) {
      if (paymentTransactions[index].courseId === paidCourseId) paymentTransactions.splice(index, 1);
    }
  });

  const post = (path, body = {}) => request(app)
    .post(path)
    .set("Cookie", [authCookieFor(testUsers.employee), csrf.cookie])
    .set("X-CSRF-Token", csrf.token)
    .send(body);

  it("blocks free self-enrollment before prerequisite completion", async () => {
    const response = await post(`/api/courses/${freeCourseId}/enroll`);

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      code: "PREREQUISITES_NOT_MET",
      details: { unmetPrerequisiteIds: [prerequisiteId] },
    });
    expect(assignments.some((item) => item.courseId === freeCourseId && item.userId === testUsers.employee.id)).toBe(false);
  });

  it("blocks paid checkout before prerequisite completion", async () => {
    const response = await post("/api/payments/create-order", { courseId: paidCourseId });

    expect(response.status).toBe(409);
    expect(paymentOrders.some((item) => item.courseId === paidCourseId)).toBe(false);
  });

  it("allows both paths after durable completion evidence exists", async () => {
    assignments.push({
      id: `ENR-P67-PRE-${suffix}`,
      courseId: prerequisiteId,
      userId: testUsers.employee.id,
      progress: 100,
      status: "Passed",
      completedAt: new Date().toISOString(),
    });

    const free = await post(`/api/courses/${freeCourseId}/enroll`);
    const paid = await post("/api/payments/create-order", { courseId: paidCourseId });

    expect(free.status).toBe(201);
    expect(paid.status).toBe(200);
    const order = paymentOrders.find((item) => item.orderId === paid.body.orderId);
    expect(order).toMatchObject({
      courseVersion: 1,
      prerequisiteIds: [prerequisiteId],
    });
    expect(order.eligibilityBoundAt).toBeTruthy();
  });
});
