import assert from "node:assert/strict";
import crypto from "node:crypto";
import { closePool, query, withTransaction } from "./pool.js";
import {
  PaymentRepositoryError,
  createPaymentsRepository,
} from "../repositories/payments.repository.pg.js";

if (!process.env.DATABASE_URL && !process.env.PGHOST) {
  throw new Error("DATABASE_URL or PGHOST is required for payment verification");
}

const suffix = crypto.randomBytes(6).toString("hex");
const runId = `VERIFY-PAYMENT-${suffix}`;
const userId = `${runId}-USER`;
const ownerId = `${runId}-OWNER`;
const courseIds = [`${runId}-COURSE-A`, `${runId}-COURSE-B`];
const orderIds = [`order_${suffix}_a`, `order_${suffix}_b`];
const paymentIds = [`pay_${suffix}_a`, `pay_${suffix}_b`];
const sourceRevision = String(process.env.SOURCE_REVISION || "").trim();
const repository = createPaymentsRepository();
const checks = [];
const ok = (name, condition) => { assert.ok(condition, name); checks.push(name); };

if (process.env.NODE_ENV === "production") {
  assert.match(sourceRevision, /^[0-9a-f]{40}$/, "SOURCE_REVISION must identify the deployed Git commit in production");
}

const makeOrder = (index) => ({
  orderId: orderIds[index],
  receipt: `nld_${suffix}_${index}`,
  provider: "Razorpay",
  userId,
  courseId: courseIds[index],
  courseVersion: 1,
  prerequisiteIds: [],
  eligibilityBoundAt: new Date().toISOString(),
  amountCents: 125_00 + index,
  currency: "INR",
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
});

try {
  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO users (id, name, email, role, status)
       VALUES
         ($1, 'Payment verifier owner', $2, 'Admin', 'Active'),
         ($3, 'Payment verifier learner', $4, 'Learner', 'Active')`,
      [ownerId, `${ownerId}@example.invalid`, userId, `${userId}@example.invalid`],
    );
    for (const [index, courseId] of courseIds.entries()) {
      await client.query(
        `INSERT INTO courses (
           id, title, description, owner_id, status, approval, price_cents, currency,
           current_version, prerequisites
         ) VALUES ($1, $2, 'Synthetic payment reconciliation', $3,
                   'Active', 'Approved', $4, 'INR', 1, ARRAY[]::text[])`,
        [courseId, `Payment verification ${index + 1}`, ownerId, 125_00 + index],
      );
    }
  });

  const firstOrder = await repository.insertOrder(makeOrder(0));
  ok("payment order is created once", firstOrder.idempotent === false && firstOrder.order.orderId === orderIds[0]);
  const firstSettlement = await repository.settleOrder({
    orderId: orderIds[0], paymentId: paymentIds[0], source: "Checkout",
    actorId: userId, at: new Date().toISOString(),
  });
  ok(
    "payment settlement atomically creates ledger and entitlement",
    firstSettlement.idempotent === false
      && firstSettlement.transaction.orderId === orderIds[0]
      && firstSettlement.enrollment.userId === userId,
  );
  const replay = await repository.settleOrder({
    orderId: orderIds[0], paymentId: paymentIds[0], source: "Checkout",
    actorId: userId, at: new Date().toISOString(),
  });
  ok("exact payment replay is idempotent", replay.idempotent === true);

  await repository.insertOrder(makeOrder(1));
  let reuseError = null;
  try {
    await repository.settleOrder({
      orderId: orderIds[1], paymentId: paymentIds[0], source: "Checkout",
      actorId: userId, at: new Date().toISOString(),
    });
  } catch (error) {
    reuseError = error;
  }
  ok(
    "provider payment cannot be reused across orders",
    reuseError instanceof PaymentRepositoryError && reuseError.code === "PAYMENT_REUSED",
  );
  const secondSettlement = await repository.settleOrder({
    orderId: orderIds[1], paymentId: paymentIds[1], source: "Webhook",
    actorId: null, at: new Date().toISOString(),
  });
  ok("independent provider payment settles the second order", secondSettlement.idempotent === false);

  const reconciliation = await query(
    `WITH transaction_counts AS (
       SELECT order_id, count(*)::integer AS count
         FROM payment_transactions
        GROUP BY order_id
     )
     SELECT
       (SELECT count(*)::integer
          FROM payment_orders payment_order
          LEFT JOIN transaction_counts tally ON tally.order_id = payment_order.order_id
         WHERE payment_order.status = 'Paid' AND COALESCE(tally.count, 0) <> 1) AS paid_order_count_anomalies,
       (SELECT count(*)::integer
          FROM payment_transactions transaction
          LEFT JOIN payment_orders payment_order ON payment_order.order_id = transaction.order_id
         WHERE payment_order.order_id IS NULL
            OR payment_order.status <> 'Paid'
            OR payment_order.provider_payment_id <> transaction.provider_payment_id
            OR payment_order.user_id <> transaction.user_id
            OR payment_order.course_id <> transaction.course_id
            OR payment_order.amount_cents <> transaction.amount_cents
            OR payment_order.currency <> transaction.currency) AS transaction_binding_anomalies,
       (SELECT count(*)::integer
          FROM payment_transactions transaction
          LEFT JOIN enrollments enrollment
            ON enrollment.user_id = transaction.user_id
           AND enrollment.course_id = transaction.course_id
         WHERE enrollment.id IS NULL) AS missing_entitlements,
       (SELECT count(*)::integer
          FROM payment_webhook_events event
          LEFT JOIN payment_transactions transaction
            ON transaction.order_id = event.order_id
           AND transaction.provider_payment_id = event.provider_payment_id
         WHERE event.status = 'Processed' AND transaction.id IS NULL) AS processed_webhook_anomalies,
       (SELECT count(*)::integer FROM payment_orders) AS order_count,
       (SELECT count(*)::integer FROM payment_transactions) AS transaction_count,
       (SELECT count(*)::integer FROM payment_webhook_events) AS webhook_count`,
  );
  const summary = reconciliation.rows[0];
  ok(
    "complete payment ledger has zero internal reconciliation anomalies",
    Number(summary.paid_order_count_anomalies) === 0
      && Number(summary.transaction_binding_anomalies) === 0
      && Number(summary.missing_entitlements) === 0
      && Number(summary.processed_webhook_anomalies) === 0,
  );

  const evidence = {
    schemaVersion: 1,
    runId,
    sourceRevision: sourceRevision || null,
    orders: Number(summary.order_count),
    transactions: Number(summary.transaction_count),
    webhooks: Number(summary.webhook_count),
    anomalyCounts: {
      paidOrders: Number(summary.paid_order_count_anomalies),
      bindings: Number(summary.transaction_binding_anomalies),
      entitlements: Number(summary.missing_entitlements),
      processedWebhooks: Number(summary.processed_webhook_anomalies),
    },
  };
  await query(
    `INSERT INTO audit_logs (
       actor_id, action, entity_type, entity_id, metadata, ingest_key
     ) VALUES (
       NULL, 'PAYMENT_RECONCILIATION_PASSED', 'SYSTEM', $1, $2::jsonb, $3
     )`,
    [runId, JSON.stringify(evidence), `payment-reconciliation:${runId}`],
  );
  const durable = await query(
    "SELECT metadata FROM audit_logs WHERE ingest_key = $1",
    [`payment-reconciliation:${runId}`],
  );
  ok(
    "payment reconciliation evidence is durable and revision-bound",
    durable.rows.length === 1
      && durable.rows[0]?.metadata?.runId === runId
      && durable.rows[0]?.metadata?.sourceRevision === (sourceRevision || null),
  );

  checks.forEach((check) => console.log(`ok - ${check}`));
  console.log(`Payment reconciliation verification passed (${checks.length} checks).`);
} finally {
  await query("DELETE FROM payment_transactions WHERE order_id = ANY($1::text[])", [orderIds]).catch(() => {});
  await query("DELETE FROM payment_webhook_events WHERE order_id = ANY($1::text[])", [orderIds]).catch(() => {});
  await query("DELETE FROM payment_orders WHERE order_id = ANY($1::text[])", [orderIds]).catch(() => {});
  await query("DELETE FROM enrollments WHERE user_id = $1 AND course_id = ANY($2::text[])", [userId, courseIds]).catch(() => {});
  await query(
    `DELETE FROM audit_logs
      WHERE actor_id = ANY($1::text[])
         OR (entity_type = 'COURSE' AND entity_id = ANY($2::text[]))`,
    [[userId, ownerId], courseIds],
  ).catch(() => {});
  await query("DELETE FROM courses WHERE id = ANY($1::text[])", [courseIds]).catch(() => {});
  await query("DELETE FROM users WHERE id = ANY($1::text[])", [[userId, ownerId]]).catch(() => {});
  await closePool();
}
