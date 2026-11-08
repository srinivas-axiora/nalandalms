import crypto from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import * as coursesRepository from "../../backend/src/repositories/courses.repository.pg.js";
import { paymentsRepository } from "../../backend/src/repositories/payments.repository.pg.js";

describe("course cutover payment authority", () => {
  const previousCourses = process.env.USE_PG_COURSES;
  const previousPayments = process.env.USE_PG_PAYMENTS;
  const previousWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  let createCheckoutOrder;
  let processWebhook;

  beforeAll(async () => {
    process.env.USE_PG_COURSES = "1";
    process.env.USE_PG_PAYMENTS = "0";
    process.env.RAZORPAY_WEBHOOK_SECRET = "phase-41-webhook-secret";
    vi.spyOn(coursesRepository, "findCourseById").mockResolvedValue({
      id: "CRS-PHASE-41",
      title: "Relational commerce",
      status: "Active",
      approval: "Approved",
      priceCents: 499900,
      currency: "INR",
    });
    vi.spyOn(paymentsRepository, "findEnrollment").mockResolvedValue(null);
    vi.spyOn(paymentsRepository, "findReusableOrder").mockResolvedValue({
      orderId: "order_phase41",
      amountCents: 499900,
      currency: "INR",
      expiresAt: "2026-11-08T18:00:00.000Z",
    });
    vi.spyOn(paymentsRepository, "recordIgnoredWebhook").mockResolvedValue({
      duplicate: false,
      ignored: true,
    });
    ({ createCheckoutOrder, processWebhook } = await import(
      "../../backend/src/modules/payments/payments.service.js?phase41-course-cutover"
    ));
  });

  afterAll(() => {
    vi.restoreAllMocks();
    if (previousCourses === undefined) delete process.env.USE_PG_COURSES;
    else process.env.USE_PG_COURSES = previousCourses;
    if (previousPayments === undefined) delete process.env.USE_PG_PAYMENTS;
    else process.env.USE_PG_PAYMENTS = previousPayments;
    if (previousWebhookSecret === undefined) delete process.env.RAZORPAY_WEBHOOK_SECRET;
    else process.env.RAZORPAY_WEBHOOK_SECRET = previousWebhookSecret;
  });

  it("creates checkout from relational course and order state from the course flag alone", async () => {
    const result = await createCheckoutOrder({
      user: { id: "EMP-PHASE-41" },
      courseId: "CRS-PHASE-41",
    });

    expect(coursesRepository.findCourseById).toHaveBeenCalledWith("CRS-PHASE-41");
    expect(paymentsRepository.findEnrollment).toHaveBeenCalledWith("EMP-PHASE-41", "CRS-PHASE-41");
    expect(paymentsRepository.findReusableOrder).toHaveBeenCalledWith(
      "EMP-PHASE-41",
      "CRS-PHASE-41",
      expect.any(Date)
    );
    expect(result).toMatchObject({
      orderId: "order_phase41",
      amount: 499900,
      currency: "INR",
      courseTitle: "Relational commerce",
      idempotent: true,
    });
  });

  it("persists webhook replay evidence relationally from the course flag alone", async () => {
    const body = { event: "payment.failed" };
    const rawBody = Buffer.from(JSON.stringify(body));
    const signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    const result = await processWebhook({
      rawBody,
      body,
      signature,
      eventId: "evt_phase41_course_cutover",
    });

    expect(result).toEqual({ status: "ok", duplicate: false, ignored: true });
    expect(paymentsRepository.recordIgnoredWebhook).toHaveBeenCalledWith(expect.objectContaining({
      eventId: "evt_phase41_course_cutover",
      eventType: "payment.failed",
      bodySha256: crypto.createHash("sha256").update(rawBody).digest("hex"),
    }));
  });
});
