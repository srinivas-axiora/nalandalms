// Module: Payments & Commercial Checkout (Razorpay / Stripe engine).
import { z } from "zod";
import crypto from "node:crypto";
import { v4 as uuid } from "uuid";
import { authenticate } from "../../middleware.js";
import { courses, assignments, auditLogs, now } from "../../core.js";
import { audit } from "../../domain.js";

const pendingOrders = new Map();
const completedPayments = [];

export function registerPayments(app) {
  // Create checkout order
  app.post("/api/payments/create-order", authenticate, (req, res) => {
    const schema = z.object({ courseId: z.string() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const course = courses.find((c) => c.id === parsed.data.courseId && c.status === "Active" && c.approval === "Approved");
    if (!course) return res.status(404).json({ error: "Course not found" });

    // Check if already enrolled
    if (assignments.some((a) => a.courseId === course.id && a.userId === req.user.id)) {
      return res.status(409).json({ error: "You are already enrolled in this course" });
    }

    const priceCents = course.priceCents || 499900; // Default ₹4,999 if not set
    const currency = course.currency || "INR";
    const orderId = `order_${uuid().replace(/-/g, "").slice(0, 16)}`;

    const orderData = {
      orderId,
      courseId: course.id,
      userId: req.user.id,
      amountCents: priceCents,
      currency,
      status: "Created",
      createdAt: now(),
    };

    pendingOrders.set(orderId, orderData);

    res.json({
      orderId,
      amount: priceCents,
      currency,
      courseTitle: course.title,
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_nalanda",
    });
  });

  // Verify payment and auto-enroll
  app.post("/api/payments/verify", authenticate, (req, res) => {
    const schema = z.object({
      orderId: z.string(),
      paymentId: z.string(),
      signature: z.string().optional(),
      courseId: z.string(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const order = pendingOrders.get(parsed.data.orderId);
    if (!order && process.env.NODE_ENV === "production") {
      return res.status(404).json({ error: "Order not found or expired" });
    }

    const course = courses.find((c) => c.id === parsed.data.courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    // Verify signature if secret configured
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (keySecret && parsed.data.signature) {
      const generated = crypto
        .createHmac("sha256", keySecret)
        .update(`${parsed.data.orderId}|${parsed.data.paymentId}`)
        .digest("hex");
      if (generated !== parsed.data.signature) {
        return res.status(400).json({ error: "Invalid payment signature verification" });
      }
    }

    // Auto-enroll candidate
    let enrollment = assignments.find((a) => a.courseId === course.id && a.userId === req.user.id);
    if (!enrollment) {
      enrollment = {
        id: `ENR-${Math.floor(1000 + Math.random() * 9000)}`,
        courseId: course.id,
        userId: req.user.id,
        assignedBy: "SYSTEM_CHECKOUT",
        dueAt: null,
        priority: "High",
        mandatory: false,
        progress: 0,
        completedChapters: [],
        timeSpentMinutes: 0,
        timeSpentSeconds: 0,
        chapterTimeSpentSeconds: {},
        startedAt: now(),
        completedAt: null,
        createdAt: now(),
      };
      assignments.push(enrollment);
    }

    const paymentRecord = {
      id: uuid(),
      orderId: parsed.data.orderId,
      paymentId: parsed.data.paymentId,
      userId: req.user.id,
      courseId: course.id,
      amountCents: order?.amountCents || course.priceCents || 499900,
      currency: order?.currency || "INR",
      status: "Paid",
      createdAt: now(),
    };
    completedPayments.push(paymentRecord);
    pendingOrders.delete(parsed.data.orderId);

    audit(req.user.id, "PAYMENT_SUCCESS", "COURSE", course.id, {
      paymentId: parsed.data.paymentId,
      amount: paymentRecord.amountCents,
    });

    res.json({
      ok: true,
      message: "Payment verified successfully. You are now enrolled!",
      enrollment,
    });
  });

  // Webhook listener for async payment gateway events
  app.post("/api/payments/webhook", (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers["x-razorpay-signature"];
      const shasum = crypto.createHmac("sha256", webhookSecret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest("hex");
      if (digest !== signature) {
        return res.status(400).json({ error: "Invalid webhook signature" });
      }
    }

    const event = req.body.event;
    if (event === "payment.captured" || event === "order.paid") {
      const payload = req.body.payload?.payment?.entity;
      if (payload?.notes?.userId && payload?.notes?.courseId) {
        const { userId, courseId } = payload.notes;
        if (!assignments.some((a) => a.courseId === courseId && a.userId === userId)) {
          assignments.push({
            id: `ENR-${Math.floor(1000 + Math.random() * 9000)}`,
            courseId,
            userId,
            assignedBy: "SYSTEM_WEBHOOK",
            dueAt: null,
            priority: "High",
            mandatory: false,
            progress: 0,
            completedChapters: [],
            timeSpentMinutes: 0,
            timeSpentSeconds: 0,
            chapterTimeSpentSeconds: {},
            startedAt: now(),
            completedAt: null,
            createdAt: now(),
          });
        }
      }
    }

    res.json({ status: "ok" });
  });
}

