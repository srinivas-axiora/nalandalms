import { describe, expect, it, vi } from "vitest";
import { createCertificatesPgRepository } from "../../backend/src/repositories/certificates.repository.pg.js";

const row = (overrides = {}) => ({
  id: "NLD-CERT-2026-0123456789ABCDEF0123456789ABCDEF",
  employee_id: "LEARNER-1",
  course_id: "COURSE-1",
  attempt_id: "ATTEMPT-1",
  recipient_name: "Learner One",
  recipient_email: "learner@example.invalid",
  course_title: "Secure Systems",
  title: "Certificate of Professional Mastery",
  template: "Executive",
  accent: "#0f766e",
  duration: "10 Hours",
  subtitle: "Verified completion",
  footer: "Nalanda Academic Board",
  issued_by: "OWNER-1",
  issued_by_name: "Course Owner",
  proctoring_verified: true,
  exam_score: "90",
  signature_version: 2,
  signature: "a".repeat(64),
  verification_url: "/verify/NLD-CERT",
  linkedin_share_url: "https://linkedin.example.invalid",
  status: "Active",
  revoked_by: null,
  revoked_at: null,
  revocation_reason: null,
  issued_at: new Date("2026-11-03T09:00:00.000Z"),
  ...overrides,
});

const certificate = {
  id: row().id,
  employeeId: "LEARNER-1",
  courseId: "COURSE-1",
  attemptId: "ATTEMPT-1",
  recipientName: "Learner One",
  recipientEmail: "learner@example.invalid",
  courseTitle: "Secure Systems",
  title: "Certificate of Professional Mastery",
  template: "Executive",
  accent: "#0f766e",
  duration: "10 Hours",
  subtitle: "Verified completion",
  footer: "Nalanda Academic Board",
  issuedBy: "OWNER-1",
  issuedByName: "Course Owner",
  proctoringVerified: true,
  examScore: 90,
  signatureVersion: 2,
  signature: "a".repeat(64),
  verificationUrl: "/verify/NLD-CERT",
  linkedinShareUrl: "https://linkedin.example.invalid",
  issuedAt: "2026-11-03T09:00:00.000Z",
};

const fakeDb = (handler) => {
  const client = { query: vi.fn(handler) };
  return { client, db: { query: vi.fn(handler), withTransaction: vi.fn((fn) => fn(client)) } };
};

describe("PostgreSQL certificate authority", () => {
  it("commits eligibility, credential, enrollment and audit together", async () => {
    const { client, db } = fakeDb(async (sql) => {
      if (sql.includes("FROM issued_certificates") && sql.includes("status = 'Active'")) return { rows: [] };
      if (sql.includes("FROM enrollments")) return { rows: [{ status: "Passed" }] };
      if (sql.includes("FROM assessment_attempts")) return { rows: [{ id: "ATTEMPT-1", status: "Passed", trust_score: 85, score: "90" }] };
      if (sql.includes("INSERT INTO issued_certificates")) return { rows: [row()] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createCertificatesPgRepository(db);

    const result = await repository.issueEligible({ certificate, automatic: true });

    expect(result).toMatchObject({ created: true, certificate: { status: "Active", examScore: 90 } });
    const statements = client.query.mock.calls.map(([sql]) => sql);
    expect(statements.some((sql) => sql.includes("pg_advisory_xact_lock"))).toBe(true);
    expect(statements.some((sql) => sql.includes("UPDATE enrollments SET status = 'Certified'"))).toBe(true);
    expect(statements.some((sql) => sql.includes("INSERT INTO audit_logs"))).toBe(true);
  });

  it("returns the existing active credential under the issuance lock", async () => {
    const { client, db } = fakeDb(async (sql) => {
      if (sql.includes("FROM issued_certificates")) return { rows: [row()] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createCertificatesPgRepository(db);

    const result = await repository.issueEligible({ certificate, automatic: true });

    expect(result.created).toBe(false);
    expect(client.query.mock.calls.some(([sql]) => sql.includes("INSERT INTO issued_certificates"))).toBe(false);
  });

  it("revokes the credential, rolls enrollment back and audits atomically", async () => {
    const { client, db } = fakeDb(async (sql) => {
      if (sql.includes("SELECT * FROM issued_certificates")) return { rows: [row()] };
      if (sql.includes("UPDATE issued_certificates")) {
        return { rows: [row({ status: "Revoked", revoked_by: "OWNER-1", revoked_at: new Date(), revocation_reason: "Verified issuance error" })] };
      }
      return { rows: [], rowCount: 1 };
    });
    const repository = createCertificatesPgRepository(db);

    const revoked = await repository.revoke({
      certificateId: certificate.id,
      actorId: "OWNER-1",
      reason: "Verified issuance error",
    });

    expect(revoked.status).toBe("Revoked");
    const statements = client.query.mock.calls.map(([sql]) => sql);
    expect(statements.some((sql) => sql.includes("certificate_id = NULL"))).toBe(true);
    expect(statements.some((sql) => sql.includes("REVOKE_CERTIFICATE"))).toBe(false);
    expect(client.query.mock.calls.some(([, params]) => params?.includes("REVOKE_CERTIFICATE"))).toBe(true);
  });
});
