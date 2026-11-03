import { describe, expect, it, vi } from "vitest";
import {
  PaymentRepositoryError,
  createPaymentsRepository,
} from "../../backend/src/repositories/payments.repository.pg.js";

const orderRow = (overrides = {}) => ({
  order_id: "order_001",
  receipt: "nld_receipt_001",
  provider: "Razorpay",
  user_id: "USR-001",
  course_id: "CRS-001",
  amount_cents: 499900,
  currency: "INR",
  status: "Created",
  provider_payment_id: null,
  created_at: new Date("2026-11-03T08:00:00.000Z"),
  expires_at: new Date("2026-11-03T09:00:00.000Z"),
  paid_at: null,
  updated_at: null,
  ...overrides,
});

const enrollmentRow = {
  id: "ENR-001",
  course_id: "CRS-001",
  user_id: "USR-001",
  assigned_by: "USR-001",
  due_at: null,
  priority: "High",
  mandatory: false,
  progress: 0,
  completed_chapters: [],
  time_spent_minutes: 0,
  time_spent_seconds: 0,
  chapter_time_spent_seconds: {},
  started_at: new Date("2026-11-03T08:05:00.000Z"),
  completed_at: null,
};

const transactionRow = {
  id: "TX-001",
  order_id: "order_001",
  provider_payment_id: "pay_001",
  user_id: "USR-001",
  course_id: "CRS-001",
  amount_cents: 499900,
  currency: "INR",
  status: "Paid",
  source: "Checkout",
  created_at: new Date("2026-11-03T08:05:00.000Z"),
};

const fakeDb = (handler) => {
  const client = { query: vi.fn(handler) };
  return {
    client,
    db: {
      query: vi.fn(handler),
      withTransaction: vi.fn((fn) => fn(client)),
    },
  };
};

describe("PostgreSQL payment repository", () => {
  it("settles order, entitlement, transaction and audit in one transaction", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("FROM payment_orders") && sql.includes("FOR UPDATE")) return { rows: [orderRow()] };
      if (sql.includes("FROM payment_transactions")) return { rows: [] };
      if (sql.includes("INSERT INTO payment_transactions")) return { rows: [transactionRow] };
      if (sql.includes("FROM enrollments")) return { rows: [enrollmentRow] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createPaymentsRepository(db);

    const result = await repository.settleOrder({
      orderId: "order_001",
      paymentId: "pay_001",
      source: "Checkout",
      actorId: "USR-001",
      at: "2026-11-03T08:05:00.000Z",
    });

    expect(db.withTransaction).toHaveBeenCalledTimes(1);
    expect(result.idempotent).toBe(false);
    expect(result.enrollment).toMatchObject({ userId: "USR-001", courseId: "CRS-001" });
    expect(result.transaction).toMatchObject({ orderId: "order_001", paymentId: "pay_001" });
    const statements = client.query.mock.calls.map(([sql]) => sql);
    expect(statements.some((sql) => sql.includes("FOR UPDATE"))).toBe(true);
    expect(statements.some((sql) => sql.includes("INSERT INTO enrollments"))).toBe(true);
    expect(statements.some((sql) => sql.includes("INSERT INTO payment_transactions"))).toBe(true);
    expect(statements.some((sql) => sql.includes("UPDATE payment_orders"))).toBe(true);
    expect(statements.some((sql) => sql.includes("INSERT INTO audit_logs"))).toBe(true);
  });

  it("returns an exact settlement replay without writing a second entitlement", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("FROM payment_orders") && sql.includes("FOR UPDATE")) {
        return { rows: [orderRow({ status: "Paid", provider_payment_id: "pay_001" })] };
      }
      if (sql.includes("FROM payment_transactions")) return { rows: [transactionRow] };
      if (sql.includes("FROM enrollments")) return { rows: [enrollmentRow] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createPaymentsRepository(db);

    const result = await repository.settleOrder({
      orderId: "order_001",
      paymentId: "pay_001",
      source: "Checkout",
      actorId: "USR-001",
      at: "2026-11-03T08:06:00.000Z",
    });

    expect(result.idempotent).toBe(true);
    const statements = client.query.mock.calls.map(([sql]) => sql);
    expect(statements.some((sql) => sql.includes("INSERT INTO enrollments"))).toBe(false);
    expect(statements.some((sql) => sql.includes("INSERT INTO payment_transactions"))).toBe(false);
    expect(statements.some((sql) => sql.includes("INSERT INTO audit_logs"))).toBe(false);
  });

  it("persists expiry before surfacing the expired-order error", async () => {
    const expired = orderRow({ expires_at: new Date("2026-11-03T07:00:00.000Z") });
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("FROM payment_orders") && sql.includes("FOR UPDATE")) return { rows: [expired] };
      if (sql.includes("FROM payment_transactions")) return { rows: [] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createPaymentsRepository(db);

    await expect(repository.settleOrder({
      orderId: "order_001",
      paymentId: "pay_001",
      source: "Checkout",
      actorId: "USR-001",
      at: "2026-11-03T08:05:00.000Z",
    })).rejects.toMatchObject({ code: "ORDER_EXPIRED" });

    expect(db.withTransaction).toHaveResolved();
    expect(client.query.mock.calls.some(([sql]) => sql.includes("SET status = 'Expired'"))).toBe(true);
  });

  it("rejects reuse of a webhook event ID with different bytes", async () => {
    const { db } = fakeDb(async (sql) => {
      if (sql.includes("INSERT INTO payment_webhook_events")) return { rows: [], rowCount: 0 };
      if (sql.includes("SELECT body_sha256")) return { rows: [{ body_sha256: "a".repeat(64) }] };
      return { rows: [], rowCount: 0 };
    });
    const repository = createPaymentsRepository(db);

    await expect(repository.processCapturedWebhook({
      eventId: "evt_001",
      eventType: "payment.captured",
      bodySha256: "b".repeat(64),
      orderId: "order_001",
      paymentId: "pay_001",
      amountCents: 499900,
      currency: "INR",
      at: "2026-11-03T08:05:00.000Z",
    })).rejects.toEqual(expect.objectContaining({
      name: "PaymentRepositoryError",
      code: "EVENT_REPLAY_MISMATCH",
    }));
  });

  it("applies the same payload-binding rule to ignored webhook events", async () => {
    const { db } = fakeDb(async (sql) => {
      if (sql.includes("INSERT INTO payment_webhook_events")) return { rows: [], rowCount: 0 };
      if (sql.includes("SELECT body_sha256")) return { rows: [{ body_sha256: "c".repeat(64) }] };
      return { rows: [], rowCount: 0 };
    });
    const repository = createPaymentsRepository(db);

    await expect(repository.recordIgnoredWebhook({
      eventId: "evt_ignored_001",
      eventType: "payment.failed",
      bodySha256: "d".repeat(64),
      at: "2026-11-03T08:05:00.000Z",
    })).rejects.toEqual(expect.objectContaining({
      code: "EVENT_REPLAY_MISMATCH",
    }));
  });

  it("uses the partial unique key when racing to create an open order", async () => {
    let insertSeen = false;
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("INSERT INTO payment_orders")) {
        insertSeen = true;
        return { rows: [], rowCount: 0 };
      }
      if (insertSeen && sql.includes("SELECT * FROM payment_orders")) return { rows: [orderRow()] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createPaymentsRepository(db);
    const result = await repository.insertOrder({
      orderId: "order_competing",
      receipt: "nld_competing",
      provider: "Razorpay",
      userId: "USR-001",
      courseId: "CRS-001",
      amountCents: 499900,
      currency: "INR",
      createdAt: "2026-11-03T08:00:00.000Z",
      expiresAt: "2026-11-03T09:00:00.000Z",
    });

    expect(result).toMatchObject({ idempotent: true, order: { orderId: "order_001" } });
    const insertSql = client.query.mock.calls.find(([sql]) => sql.includes("INSERT INTO payment_orders"))[0];
    expect(insertSql).toContain("ON CONFLICT (user_id, course_id) WHERE status = 'Created'");
  });
});
