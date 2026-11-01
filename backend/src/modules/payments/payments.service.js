import crypto from "node:crypto";
import { v4 as uuid } from "uuid";
import {
  PAYMENT_ORDER_TTL_SECONDS,
  getRazorpayKeyId,
  getRazorpayKeySecret,
  getRazorpayWebhookSecret,
} from "../../config.js";
import {
  assignments,
  courses,
  now,
  paymentOrders,
  paymentTransactions,
  paymentWebhookEvents,
} from "../../core.js";
import { audit } from "../../domain.js";

const RAZORPAY_API_ORIGIN = "https://api.razorpay.com";

export class PaymentError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "PaymentError";
    this.status = status;
  }
}

const fail = (status, message) => {
  throw new PaymentError(status, message);
};

const normalizedCurrency = (value) => String(value || "INR").trim().toUpperCase();

const secureHexEqual = (supplied, expected) => {
  if (!/^[a-f0-9]{64}$/i.test(String(supplied || ""))) return false;
  const suppliedBytes = Buffer.from(String(supplied), "hex");
  const expectedBytes = Buffer.from(String(expected), "hex");
  return suppliedBytes.length === expectedBytes.length && crypto.timingSafeEqual(suppliedBytes, expectedBytes);
};

const providerRequest = async (path, options = {}) => {
  const keyId = getRazorpayKeyId();
  const keySecret = getRazorpayKeySecret();
  if (!keyId || !keySecret) fail(503, "Payment provider credentials are not configured");

  let response;
  try {
    response = await fetch(`${RAZORPAY_API_ORIGIN}${path}`, {
      ...options,
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  } catch {
    fail(502, "Payment provider is unavailable");
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) fail(502, payload?.error?.description || "Payment provider rejected the request");
  return payload;
};

const createProviderOrder = async ({ amountCents, currency, receipt, userId, courseId }) => {
  if (process.env.NODE_ENV !== "production") {
    return { id: `order_${uuid().replace(/-/g, "").slice(0, 16)}`, amount: amountCents, currency };
  }
  return providerRequest("/v1/orders", {
    method: "POST",
    body: JSON.stringify({
      amount: amountCents,
      currency,
      receipt,
      notes: { userId, courseId },
    }),
  });
};

const verifyProviderPayment = async (order, paymentId) => {
  if (process.env.NODE_ENV !== "production") return;
  const payment = await providerRequest(`/v1/payments/${encodeURIComponent(paymentId)}`);
  if (
    payment.id !== paymentId
    || payment.order_id !== order.orderId
    || payment.amount !== order.amountCents
    || normalizedCurrency(payment.currency) !== order.currency
    || payment.status !== "captured"
  ) {
    fail(400, "Payment provider record does not match the checkout order");
  }
};

const enrollmentFor = (userId, courseId) =>
  assignments.find((item) => item.userId === userId && item.courseId === courseId);

const makeEnrollment = (order, source) => ({
  id: `ENR-${uuid().replace(/-/g, "").slice(0, 12).toUpperCase()}`,
  courseId: order.courseId,
  userId: order.userId,
  assignedBy: source === "Webhook" ? "SYSTEM_WEBHOOK" : "SYSTEM_CHECKOUT",
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

const settledTransaction = (order, paymentId) =>
  paymentTransactions.find((item) => item.orderId === order.orderId && item.paymentId === paymentId);

const settleOrder = (order, paymentId, source, actorId) => {
  const existing = settledTransaction(order, paymentId);
  if (existing) {
    return {
      transaction: existing,
      enrollment: enrollmentFor(order.userId, order.courseId),
      idempotent: true,
    };
  }
  if (paymentTransactions.some((item) => item.paymentId === paymentId && item.orderId !== order.orderId)) {
    fail(409, "Payment has already been applied to another order");
  }
  if (order.status === "Paid") fail(409, "Order has already been paid with a different payment");

  let enrollment = enrollmentFor(order.userId, order.courseId);
  if (!enrollment) {
    enrollment = makeEnrollment(order, source);
    assignments.push(enrollment);
  }

  const paidAt = now();
  const transaction = {
    id: uuid(),
    orderId: order.orderId,
    paymentId,
    userId: order.userId,
    courseId: order.courseId,
    amountCents: order.amountCents,
    currency: order.currency,
    status: "Paid",
    source,
    createdAt: paidAt,
  };
  paymentTransactions.push(transaction);
  Object.assign(order, { status: "Paid", paymentId, paidAt, updatedAt: paidAt });
  audit(actorId || "SYSTEM_RAZORPAY", "PAYMENT_SUCCESS", "COURSE", order.courseId, {
    orderId: order.orderId,
    paymentId,
    amountCents: order.amountCents,
    currency: order.currency,
    source,
  });
  return { transaction, enrollment, idempotent: false };
};

export const createCheckoutOrder = async ({ user, courseId }) => {
  const course = courses.find((item) => item.id === courseId && item.status === "Active" && item.approval === "Approved");
  if (!course) fail(404, "Course not found");
  if (enrollmentFor(user.id, course.id)) fail(409, "You are already enrolled in this course");

  const amountCents = Number(course.priceCents);
  const currency = normalizedCurrency(course.currency);
  if (!Number.isSafeInteger(amountCents) || amountCents <= 0) fail(400, "Course is not configured for paid checkout");
  if (!/^[A-Z]{3}$/.test(currency)) fail(500, "Course currency configuration is invalid");

  const currentTime = Date.now();
  const reusable = paymentOrders.find((item) =>
    item.userId === user.id
    && item.courseId === course.id
    && item.status === "Created"
    && Date.parse(item.expiresAt) > currentTime
  );
  if (reusable) {
    return {
      orderId: reusable.orderId,
      amount: reusable.amountCents,
      currency: reusable.currency,
      courseTitle: course.title,
      keyId: getRazorpayKeyId() || "rzp_test_nalanda",
      expiresAt: reusable.expiresAt,
      idempotent: true,
    };
  }

  const receipt = `nld_${uuid().replace(/-/g, "").slice(0, 24)}`;
  const providerOrder = await createProviderOrder({ amountCents, currency, receipt, userId: user.id, courseId: course.id });
  if (
    !providerOrder?.id
    || providerOrder.amount !== amountCents
    || normalizedCurrency(providerOrder.currency) !== currency
  ) {
    fail(502, "Payment provider returned an invalid order");
  }

  const createdAt = now();
  const order = {
    orderId: providerOrder.id,
    receipt,
    provider: "Razorpay",
    userId: user.id,
    courseId: course.id,
    amountCents,
    currency,
    status: "Created",
    createdAt,
    expiresAt: new Date(Date.parse(createdAt) + PAYMENT_ORDER_TTL_SECONDS * 1000).toISOString(),
  };
  paymentOrders.push(order);
  audit(user.id, "PAYMENT_ORDER_CREATED", "COURSE", course.id, {
    orderId: order.orderId,
    amountCents,
    currency,
  });
  return {
    orderId: order.orderId,
    amount: amountCents,
    currency,
    courseTitle: course.title,
    keyId: getRazorpayKeyId() || "rzp_test_nalanda",
    expiresAt: order.expiresAt,
  };
};

export const verifyCheckoutPayment = async ({ actor, orderId, paymentId, signature, courseId }) => {
  const order = paymentOrders.find((item) => item.orderId === orderId);
  if (!order) fail(404, "Order not found or expired");
  if (order.userId !== actor.id) fail(403, "This payment order belongs to another account");
  if (courseId && courseId !== order.courseId) fail(400, "Course does not match the payment order");

  const keySecret = getRazorpayKeySecret();
  if (!keySecret) fail(503, "Payment signature verification is not configured");
  const expected = crypto.createHmac("sha256", keySecret).update(`${order.orderId}|${paymentId}`).digest("hex");
  if (!secureHexEqual(signature, expected)) fail(400, "Invalid payment signature verification");

  const alreadySettled = settledTransaction(order, paymentId);
  if (alreadySettled) {
    return {
      ok: true,
      message: "Payment was already verified.",
      enrollment: enrollmentFor(order.userId, order.courseId),
      idempotent: true,
    };
  }
  if (order.status !== "Created") fail(409, "Payment order is no longer payable");
  if (Date.parse(order.expiresAt) <= Date.now()) {
    Object.assign(order, { status: "Expired", updatedAt: now() });
    fail(410, "Payment order has expired");
  }

  await verifyProviderPayment(order, paymentId);
  const result = settleOrder(order, paymentId, "Checkout", actor.id);
  return {
    ok: true,
    message: result.idempotent ? "Payment was already verified." : "Payment verified successfully. You are now enrolled!",
    enrollment: result.enrollment,
    idempotent: result.idempotent,
  };
};

export const processWebhook = ({ rawBody, body, signature, eventId }) => {
  if (!Buffer.isBuffer(rawBody)) fail(400, "Raw webhook body is required");
  const webhookSecret = getRazorpayWebhookSecret();
  if (!webhookSecret) fail(503, "Webhook signature verification is not configured");
  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  if (!secureHexEqual(signature, expected)) fail(400, "Invalid webhook signature");
  if (!eventId || typeof eventId !== "string" || eventId.length > 200) fail(400, "Webhook event ID is required");

  const existingEvent = paymentWebhookEvents.find((item) => item.eventId === eventId);
  if (existingEvent) return { status: "ok", duplicate: true };

  const eventType = String(body?.event || "");
  const bodySha256 = crypto.createHash("sha256").update(rawBody).digest("hex");
  if (!["payment.captured", "order.paid"].includes(eventType)) {
    paymentWebhookEvents.push({ eventId, eventType, bodySha256, status: "Ignored", receivedAt: now(), processedAt: now() });
    return { status: "ok", ignored: true };
  }

  const payment = body?.payload?.payment?.entity;
  if (!payment?.id || !payment?.order_id || payment.status !== "captured") fail(400, "Webhook payment payload is incomplete");
  const order = paymentOrders.find((item) => item.orderId === payment.order_id);
  if (!order) {
    paymentWebhookEvents.push({
      eventId,
      eventType,
      bodySha256,
      orderId: payment.order_id,
      paymentId: payment.id,
      status: "Unmatched",
      receivedAt: now(),
      processedAt: now(),
    });
    return { status: "ok", accepted: false };
  }
  if (Number(payment.amount) !== order.amountCents || normalizedCurrency(payment.currency) !== order.currency) {
    fail(409, "Webhook payment does not match the checkout order");
  }

  const result = settleOrder(order, payment.id, "Webhook", "SYSTEM_RAZORPAY");
  paymentWebhookEvents.push({
    eventId,
    eventType,
    bodySha256,
    orderId: order.orderId,
    paymentId: payment.id,
    status: "Processed",
    receivedAt: now(),
    processedAt: now(),
  });
  return { status: "ok", duplicate: false, idempotent: result.idempotent };
};
