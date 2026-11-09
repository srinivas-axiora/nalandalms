import { describe, expect, it, vi } from "vitest";
import {
  PrivacyRepositoryError,
  createPrivacyPgRepository,
} from "../../backend/src/repositories/privacy.repository.pg.js";

const requestRow = (overrides = {}) => ({
  id: "PRIV-1",
  user_id: "USR-1",
  request_type: "Erasure",
  status: "PendingReview",
  reason: "Please erase my learning account",
  reason_sha256: "a".repeat(64),
  verification_method: "STEP_UP_EMAIL",
  requested_at: new Date("2026-11-03T00:00:00.000Z"),
  grace_ends_at: new Date("2026-12-03T00:00:00.000Z"),
  reviewed_by: null,
  reviewed_at: null,
  review_reason: null,
  processing_started_at: null,
  completed_at: null,
  cancelled_at: null,
  legal_hold_reason: null,
  attempts: 0,
  next_attempt_at: null,
  last_error_code: null,
  coverage_version: "normalized-v2",
  completion_evidence: {},
  version: 0,
  ...overrides,
});

const fakeDb = (handler) => {
  const client = { query: vi.fn(handler) };
  return { client, db: { query: vi.fn(handler), withTransaction: vi.fn((fn) => fn(client)) } };
};

describe("PostgreSQL privacy workflow", () => {
  it("creates one durable, verified grace-period request", async () => {
    const { client, db } = fakeDb(async (sql) => {
      if (sql.includes("SELECT id, email FROM users")) {
        return { rows: [{ id: "USR-1", email: "person@example.invalid" }] };
      }
      if (sql.includes("FROM privacy_requests") && sql.includes("status IN")) return { rows: [] };
      if (sql.includes("INSERT INTO privacy_requests")) return { rows: [requestRow()] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createPrivacyPgRepository(db, "p".repeat(64));
    const result = await repository.requestErasure({
      id: "PRIV-1",
      userId: "USR-1",
      confirmEmail: "PERSON@example.invalid",
      reason: "Please erase my learning account",
      graceDays: 30,
    });

    expect(result).toMatchObject({ created: true, request: { id: "PRIV-1", status: "PendingReview" } });
    const insert = client.query.mock.calls.find(([sql]) => sql.includes("INSERT INTO privacy_requests"));
    expect(insert[1][3]).toMatch(/^[a-f0-9]{64}$/);
    expect(client.query.mock.calls.some(([, params]) =>
      params?.includes("PRIVACY_ERASURE_REQUESTED"))).toBe(true);
  });

  it("rejects confirmation that does not match the locked identity record", async () => {
    const { db } = fakeDb(async (sql) => {
      if (sql.includes("SELECT id, email FROM users")) {
        return { rows: [{ id: "USR-1", email: "person@example.invalid" }] };
      }
      return { rows: [] };
    });
    const repository = createPrivacyPgRepository(db, "p".repeat(64));
    await expect(repository.requestErasure({
      id: "PRIV-1",
      userId: "USR-1",
      confirmEmail: "attacker@example.invalid",
      reason: "Please erase my learning account",
    })).rejects.toMatchObject({
      name: "PrivacyRepositoryError",
      code: "EMAIL_MISMATCH",
    });
  });

  it("claims approved due work with skip-locked semantics and object discovery", async () => {
    const approved = requestRow({
      status: "Approved",
      reviewed_by: "ADM-1",
      reviewed_at: new Date("2026-11-04T00:00:00.000Z"),
      review_reason: "Identity and retention review approved",
    });
    const processing = requestRow({
      ...approved,
      status: "Processing",
      processing_started_at: new Date("2026-12-03T00:00:01.000Z"),
      attempts: 1,
      version: 1,
    });
    const { client, db } = fakeDb(async (sql) => {
      if (sql.includes("FOR UPDATE SKIP LOCKED")) return { rows: [approved] };
      if (sql.includes("UPDATE privacy_requests SET") && sql.includes("Processing")) return { rows: [processing] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createPrivacyPgRepository(db, "p".repeat(64));
    const claimed = await repository.claimDue();

    expect(claimed).toMatchObject({ id: "PRIV-1", status: "Processing", attempts: 1 });
    const statements = client.query.mock.calls.map(([sql]) => sql);
    expect(statements.some((sql) => sql.includes("jsonb_array_elements"))).toBe(true);
    expect(statements.some((sql) => sql.includes("FOR UPDATE SKIP LOCKED"))).toBe(true);
    expect(statements.find((sql) => sql.includes("FOR UPDATE SKIP LOCKED")))
      .toContain("coverage_version = 'normalized-v2'");
  });

  it("erases workplace subject data and pseudonymizes retained reviewer evidence", async () => {
    const processing = requestRow({
      status: "Processing",
      reviewed_by: "ADM-1",
      reviewed_at: new Date("2026-11-04T00:00:00.000Z"),
      review_reason: "Identity and retention review approved",
      processing_started_at: new Date("2026-12-03T00:00:01.000Z"),
    });
    const completed = requestRow({
      ...processing,
      status: "Completed",
      completed_at: new Date("2026-12-03T00:01:00.000Z"),
      completion_evidence: { policyVersion: "normalized-v2" },
    });
    const { client, db } = fakeDb(async (sql) => {
      if (sql.includes("SELECT * FROM privacy_requests")) return { rows: [processing] };
      if (sql.includes("privacy_erasure_objects") && sql.includes("status <> 'Deleted'")) {
        return { rows: [{ count: 0 }] };
      }
      if (sql.includes("SELECT * FROM users")) {
        return { rows: [{ id: "USR-1", email: "person@example.invalid" }] };
      }
      if (sql.includes("FROM issued_certificates")) return { rows: [{ count: 0 }] };
      if (sql.includes("privacy_erasure_objects") && sql.includes("status = 'Deleted'")) {
        return { rows: [{ count: 0 }] };
      }
      if (sql.includes("UPDATE privacy_requests SET") && sql.includes("status = 'Completed'")) {
        return { rows: [completed] };
      }
      return { rows: [], rowCount: 1 };
    });
    const repository = createPrivacyPgRepository(db, "p".repeat(64));

    const result = await repository.finalizeErasure("PRIV-1");

    expect(result).toMatchObject({ blocked: false, request: { status: "Completed" } });
    const statements = client.query.mock.calls.map(([sql]) => sql);
    expect(statements.some((sql) => sql.includes("DELETE FROM attendance_records"))).toBe(true);
    expect(statements.some((sql) => sql.includes("DELETE FROM performance_reviews"))).toBe(true);
    expect(statements.some((sql) => sql.includes("UPDATE performance_reviews SET reviewer_id = NULL"))).toBe(true);
    expect(statements.some((sql) => sql.includes("DELETE FROM workplace_communications"))).toBe(true);
    const completionUpdate = client.query.mock.calls.find(([sql]) =>
      sql.includes("UPDATE privacy_requests SET") && sql.includes("status = 'Completed'"));
    expect(completionUpdate[1][1]).toContain('"policyVersion":"normalized-v2"');
  });

  it("exports workplace records without credential columns", async () => {
    const { db } = fakeDb(async (sql) => {
      if (sql.includes("FROM users WHERE id")) {
        return { rows: [{ id: "USR-1", email: "person@example.invalid" }] };
      }
      if (sql.includes("FROM attendance_records")) return { rows: [{ id: "ATT-1", status: "Present" }] };
      if (sql.includes("FROM performance_reviews")) return { rows: [{ id: "REV-1", rating: 4.5 }] };
      if (sql.includes("FROM workplace_communications")) return { rows: [{ id: "MSG-1", kind: "Direct" }] };
      return { rows: [] };
    });
    const repository = createPrivacyPgRepository(db, "p".repeat(64));

    const exported = await repository.exportUserData("USR-1");

    expect(exported.workplace).toEqual({
      attendance: [{ id: "ATT-1", status: "Present" }],
      performanceReviews: [{ id: "REV-1", rating: 4.5 }],
      communications: [{ id: "MSG-1", kind: "Direct" }],
    });
    const profileSql = db.query.mock.calls[0][0];
    expect(profileSql).not.toContain("password_hash");
  });

  it("blocks finalization if the subject is certificate issuer evidence", async () => {
    const processing = requestRow({
      status: "Processing",
      reviewed_by: "ADM-1",
      reviewed_at: new Date("2026-11-04T00:00:00.000Z"),
      review_reason: "Identity and retention review approved",
      processing_started_at: new Date("2026-12-03T00:00:01.000Z"),
    });
    const blocked = requestRow({
      ...processing,
      status: "Blocked",
      legal_hold_reason: "Certificate issuer reassignment required",
      last_error_code: "ISSUER_REASSIGNMENT_REQUIRED",
      processing_started_at: processing.processing_started_at,
    });
    const { client, db } = fakeDb(async (sql) => {
      if (sql.includes("SELECT * FROM privacy_requests")) return { rows: [processing] };
      if (sql.includes("FROM privacy_erasure_objects")) return { rows: [{ count: 0 }] };
      if (sql.includes("SELECT * FROM users")) {
        return { rows: [{ id: "USR-1", email: "person@example.invalid" }] };
      }
      if (sql.includes("FROM issued_certificates")) return { rows: [{ count: 1 }] };
      if (sql.includes("UPDATE privacy_requests SET")) return { rows: [blocked] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createPrivacyPgRepository(db, "p".repeat(64));
    const result = await repository.finalizeErasure("PRIV-1");

    expect(result).toMatchObject({ blocked: true, request: { status: "Blocked" } });
    expect(client.query.mock.calls.some(([sql]) => sql.includes("DELETE FROM assessment_answers"))).toBe(false);
  });

  it("uses stable typed errors for non-cancellable requests", async () => {
    const { db } = fakeDb(async () => ({ rows: [] }));
    const repository = createPrivacyPgRepository(db, "p".repeat(64));
    await expect(repository.cancelForUser({ userId: "USR-1" }))
      .rejects.toBeInstanceOf(PrivacyRepositoryError);
  });
});
