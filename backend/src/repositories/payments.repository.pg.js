import { v4 as uuid } from "uuid";
import { query, withTransaction } from "../db/pool.js";
import { enrollmentIsComplete } from "../enrollment-eligibility.js";

const iso = (value) => (value instanceof Date ? value.toISOString() : value);

const mapOrder = (row) => row && ({
  orderId: row.order_id,
  receipt: row.receipt,
  provider: row.provider,
  userId: row.user_id,
  courseId: row.course_id,
  courseVersion: row.course_version == null ? null : Number(row.course_version),
  prerequisiteIds: row.prerequisite_ids || [],
  eligibilityBoundAt: row.eligibility_bound_at ? iso(row.eligibility_bound_at) : null,
  amountCents: Number(row.amount_cents),
  currency: row.currency,
  status: row.status,
  paymentId: row.provider_payment_id || null,
  createdAt: iso(row.created_at),
  expiresAt: iso(row.expires_at),
  paidAt: row.paid_at ? iso(row.paid_at) : null,
  updatedAt: row.updated_at ? iso(row.updated_at) : null,
});

const mapTransaction = (row) => row && ({
  id: row.id,
  orderId: row.order_id,
  paymentId: row.provider_payment_id,
  userId: row.user_id,
  courseId: row.course_id,
  amountCents: Number(row.amount_cents),
  currency: row.currency,
  status: row.status,
  source: row.source,
  createdAt: iso(row.created_at),
});

const mapEnrollment = (row) => row && ({
  id: row.id,
  courseId: row.course_id,
  userId: row.user_id,
  assignedBy: row.assigned_by,
  dueAt: row.due_at ? iso(row.due_at) : null,
  priority: row.priority,
  mandatory: Boolean(row.mandatory),
  progress: Number(row.progress),
  completedChapters: row.completed_chapters || [],
  timeSpentMinutes: Number(row.time_spent_minutes || 0),
  timeSpentSeconds: Number(row.time_spent_seconds || 0),
  chapterTimeSpentSeconds: row.chapter_time_spent_seconds || {},
  startedAt: iso(row.started_at),
  completedAt: row.completed_at ? iso(row.completed_at) : null,
});

export class PaymentRepositoryError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "PaymentRepositoryError";
    this.code = code;
  }
}

const repoFail = (code, message) => {
  throw new PaymentRepositoryError(code, message);
};

export function createPaymentsRepository(db = { query, withTransaction }) {
  const findOrderById = async (orderId) => {
    const { rows } = await db.query("SELECT * FROM payment_orders WHERE order_id = $1 LIMIT 1", [orderId]);
    return mapOrder(rows[0]);
  };

  const findEnrollment = async (userId, courseId, client = null) => {
    const runner = client || db;
    const { rows } = await runner.query(
      "SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2 LIMIT 1",
      [userId, courseId]
    );
    return mapEnrollment(rows[0]);
  };

  const findReusableOrder = async (userId, courseId, at = new Date()) => {
    const { rows } = await db.query(
      `SELECT * FROM payment_orders
       WHERE user_id = $1 AND course_id = $2 AND status = 'Created'
         AND eligibility_bound_at IS NOT NULL AND expires_at > $3
       ORDER BY created_at DESC LIMIT 1`,
      [userId, courseId, at]
    );
    return mapOrder(rows[0]);
  };

  const findUnmetPrerequisiteIds = async (userId, prerequisiteIds, runner = db) => {
    const prerequisites = [...new Set(prerequisiteIds || [])];
    if (!prerequisites.length) return [];
    const { rows } = await runner.query(
      `SELECT * FROM enrollments
       WHERE user_id = $1 AND course_id = ANY($2::text[])`,
      [userId, prerequisites],
    );
    const completed = new Set(rows.filter(enrollmentIsComplete).map((row) => row.course_id));
    return prerequisites.filter((id) => !completed.has(id));
  };

  const insertOrder = async (order) => db.withTransaction(async (client) => {
    await client.query(
      `UPDATE payment_orders SET status = 'Expired', updated_at = $3
       WHERE user_id = $1 AND course_id = $2 AND status = 'Created' AND expires_at <= $3`,
      [order.userId, order.courseId, order.createdAt]
    );
    const courseResult = await client.query(
      `SELECT current_version, prerequisites, price_cents, currency, status, approval
       FROM courses WHERE id = $1 FOR SHARE`,
      [order.courseId],
    );
    const course = courseResult.rows[0];
    const currentPrerequisites = [...new Set(course?.prerequisites || [])];
    const boundPrerequisites = [...new Set(order.prerequisiteIds || [])];
    if (
      !course
      || course.status !== "Active"
      || course.approval !== "Approved"
      || Number(course.current_version) !== Number(order.courseVersion)
      || JSON.stringify(currentPrerequisites) !== JSON.stringify(boundPrerequisites)
    ) {
      repoFail("ORDER_ELIGIBILITY_STALE", "Course eligibility changed before checkout order creation");
    }
    if (
      Number(course.price_cents) !== Number(order.amountCents)
      || String(course.currency || "").toUpperCase() !== String(order.currency || "").toUpperCase()
    ) {
      repoFail("ORDER_BINDING_MISMATCH", "Course price changed before checkout order creation");
    }
    const unmetPrerequisiteIds = await findUnmetPrerequisiteIds(
      order.userId,
      boundPrerequisites,
      client,
    );
    if (unmetPrerequisiteIds.length) {
      repoFail("PREREQUISITES_NOT_MET", "Course prerequisites are not complete");
    }
    const { rows } = await client.query(
        `INSERT INTO payment_orders (
           order_id, receipt, provider, user_id, course_id, amount_cents, currency,
           course_version, prerequisite_ids, eligibility_bound_at,
           status, created_at, expires_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Created', $11, $12)
         ON CONFLICT (user_id, course_id) WHERE status = 'Created' DO NOTHING
         RETURNING *`,
        [
          order.orderId, order.receipt, order.provider, order.userId, order.courseId,
          order.amountCents, order.currency, order.courseVersion,
          boundPrerequisites, order.eligibilityBoundAt,
          order.createdAt, order.expiresAt,
        ]
    );
    if (rows[0]) {
      await client.query(
        `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
         VALUES ($1, 'PAYMENT_ORDER_CREATED', 'COURSE', $2, $3::jsonb)`,
        [order.userId, order.courseId, JSON.stringify({
          orderId: order.orderId,
          amountCents: order.amountCents,
          currency: order.currency,
          courseVersion: order.courseVersion,
          prerequisiteIds: boundPrerequisites,
        })]
      );
      return { order: mapOrder(rows[0]), idempotent: false };
    }
    const existing = await client.query(
      `SELECT * FROM payment_orders
       WHERE user_id = $1 AND course_id = $2 AND status = 'Created'
         AND eligibility_bound_at IS NOT NULL AND expires_at > $3
       ORDER BY created_at DESC LIMIT 1`,
      [order.userId, order.courseId, order.createdAt]
    );
    if (!existing.rows[0]) repoFail("ORDER_INSERT_CONFLICT", "Unable to create a unique checkout order");
    return { order: mapOrder(existing.rows[0]), idempotent: true };
  });

  const settleLockedOrder = async (client, { orderId, paymentId, source, actorId, at }) => {
    const locked = await client.query(
      "SELECT * FROM payment_orders WHERE order_id = $1 FOR UPDATE",
      [orderId]
    );
    const order = mapOrder(locked.rows[0]);
    if (!order) repoFail("ORDER_NOT_FOUND", "Order not found or expired");

    const existing = await client.query(
      `SELECT * FROM payment_transactions
       WHERE order_id = $1 OR provider_payment_id = $2
       ORDER BY created_at ASC LIMIT 1`,
      [orderId, paymentId]
    );
    const existingTransaction = mapTransaction(existing.rows[0]);
    if (existingTransaction) {
      if (existingTransaction.orderId === orderId && existingTransaction.paymentId === paymentId) {
        return {
          order,
          transaction: existingTransaction,
          enrollment: await findEnrollment(order.userId, order.courseId, client),
          idempotent: true,
        };
      }
      if (existingTransaction.paymentId === paymentId) {
        repoFail("PAYMENT_REUSED", "Payment has already been applied to another order");
      }
      repoFail("ORDER_PAID", "Order has already been paid with a different payment");
    }
    if (order.status !== "Created") repoFail("ORDER_NOT_PAYABLE", "Payment order is no longer payable");
    if (!order.eligibilityBoundAt || !Number.isInteger(order.courseVersion)) {
      repoFail("ORDER_NOT_PAYABLE", "Payment order is missing its eligibility binding");
    }
    if (Date.parse(order.expiresAt) <= Date.parse(at)) {
      await client.query(
        "UPDATE payment_orders SET status = 'Expired', updated_at = $2 WHERE order_id = $1",
        [orderId, at]
      );
      return { expired: true };
    }

    const enrollmentId = `ENR-${uuid().replace(/-/g, "").slice(0, 12).toUpperCase()}`;
    await client.query(
      `INSERT INTO enrollments (
         id, course_id, user_id, assigned_by, priority, mandatory, progress,
         completed_chapters, time_spent_minutes, time_spent_seconds,
         chapter_time_spent_seconds, started_at
       ) VALUES ($1, $2, $3, $3, 'High', false, 0, '{}', 0, 0, '{}', $4)
       ON CONFLICT (course_id, user_id) DO NOTHING`,
      [enrollmentId, order.courseId, order.userId, at]
    );

    const transactionId = uuid();
    const inserted = await client.query(
      `INSERT INTO payment_transactions (
         id, order_id, provider_payment_id, user_id, course_id, amount_cents,
         currency, status, source, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'Paid', $8, $9)
       RETURNING *`,
      [
        transactionId, order.orderId, paymentId, order.userId, order.courseId,
        order.amountCents, order.currency, source, at,
      ]
    );
    await client.query(
      `UPDATE payment_orders
       SET status = 'Paid', provider_payment_id = $2, paid_at = $3, updated_at = $3
       WHERE order_id = $1`,
      [order.orderId, paymentId, at]
    );
    await client.query(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, 'PAYMENT_SUCCESS', 'COURSE', $2, $3::jsonb)`,
      [actorId || null, order.courseId, JSON.stringify({
        orderId: order.orderId,
        paymentId,
        amountCents: order.amountCents,
        currency: order.currency,
        source,
      })]
    );
    return {
      order: { ...order, status: "Paid", paymentId, paidAt: at, updatedAt: at },
      transaction: mapTransaction(inserted.rows[0]),
      enrollment: await findEnrollment(order.userId, order.courseId, client),
      idempotent: false,
    };
  };

  const settleOrder = async (input) => {
    const result = await db.withTransaction((client) => settleLockedOrder(client, input));
    if (result?.expired) repoFail("ORDER_EXPIRED", "Payment order has expired");
    return result;
  };

  const recordIgnoredWebhook = async ({ eventId, eventType, bodySha256, at }) =>
    db.withTransaction(async (client) => {
      const { rowCount } = await client.query(
        `INSERT INTO payment_webhook_events (
           event_id, event_type, body_sha256, status, received_at, processed_at
         ) VALUES ($1, $2, $3, 'Ignored', $4, $4)
         ON CONFLICT (event_id) DO NOTHING`,
        [eventId, eventType, bodySha256, at]
      );
      if (rowCount === 0) {
        const existing = await client.query(
          "SELECT body_sha256 FROM payment_webhook_events WHERE event_id = $1 LIMIT 1",
          [eventId]
        );
        if (existing.rows[0]?.body_sha256 !== bodySha256) {
          repoFail("EVENT_REPLAY_MISMATCH", "Webhook event ID was replayed with a different payload");
        }
      }
      return { duplicate: rowCount === 0, ignored: true };
    });

  const processCapturedWebhook = async ({
    eventId, eventType, bodySha256, orderId, paymentId, amountCents, currency, at,
  }) => db.withTransaction(async (client) => {
    const claimed = await client.query(
      `INSERT INTO payment_webhook_events (
         event_id, event_type, body_sha256, order_id, provider_payment_id,
         status, received_at, processed_at
       ) VALUES ($1, $2, $3, $4, $5, 'Unmatched', $6, $6)
       ON CONFLICT (event_id) DO NOTHING RETURNING event_id`,
      [eventId, eventType, bodySha256, orderId, paymentId, at]
    );
    if (!claimed.rowCount) {
      const existing = await client.query(
        "SELECT body_sha256 FROM payment_webhook_events WHERE event_id = $1 LIMIT 1",
        [eventId]
      );
      if (existing.rows[0]?.body_sha256 !== bodySha256) {
        repoFail("EVENT_REPLAY_MISMATCH", "Webhook event ID was replayed with a different payload");
      }
      return { duplicate: true };
    }

    const orderResult = await client.query(
      "SELECT * FROM payment_orders WHERE order_id = $1 LIMIT 1",
      [orderId]
    );
    const order = mapOrder(orderResult.rows[0]);
    if (!order) return { duplicate: false, accepted: false };
    if (order.amountCents !== amountCents || order.currency !== currency) {
      repoFail("WEBHOOK_MISMATCH", "Webhook payment does not match the checkout order");
    }

    const result = await settleLockedOrder(client, {
      orderId, paymentId, source: "Webhook", actorId: null, at,
    });
    if (result?.expired) repoFail("ORDER_EXPIRED", "Payment order has expired");
    await client.query(
      `UPDATE payment_webhook_events
       SET status = 'Processed', processed_at = $2 WHERE event_id = $1`,
      [eventId, at]
    );
    return { duplicate: false, accepted: true, idempotent: result.idempotent };
  });

  return {
    findOrderById,
    findEnrollment,
    findReusableOrder,
    findUnmetPrerequisiteIds,
    insertOrder,
    settleOrder,
    recordIgnoredWebhook,
    processCapturedWebhook,
  };
}

export const paymentsRepository = createPaymentsRepository();
