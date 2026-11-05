import { describe, expect, it, vi } from "vitest";
import {
  createCohortAuthorityRepository,
  hashCohortInviteCode,
} from "../../backend/src/repositories/cohort-authority.repository.pg.js";

const cohortRow = (overrides = {}) => ({
  id: "COH-1", course_id: "CRS-1", instructor_id: "MGR-1", name: "Secure cohort",
  description: "", start_date: new Date("2026-11-05T00:00:00Z"), end_date: null,
  capacity: 1, invite_code_hash: hashCohortInviteCode("NLD-ABC234"), active: true,
  version: 1, created_at: new Date("2026-11-05T00:00:00Z"),
  updated_at: new Date("2026-11-05T00:00:00Z"), course_title: "Course",
  course_status: "Active", course_approval: "Approved", ...overrides,
});
const enrollmentRow = (overrides = {}) => ({
  id: "ENR-1", course_id: "CRS-1", user_id: "USR-1", assigned_by: "MGR-1",
  cohort_id: "COH-1", due_at: null, priority: "Medium", mandatory: false,
  progress: 0, completed_chapters: [], time_spent_minutes: 0, time_spent_seconds: 0,
  chapter_time_spent_seconds: {}, status: "Enrolled", version: 0,
  started_at: new Date("2026-11-05T00:00:00Z"), completed_at: null, ...overrides,
});
const fakeDb = (handler) => {
  const client = { query: vi.fn(handler) };
  return { client, db: { query: vi.fn(handler), withTransaction: vi.fn((fn) => fn(client)) } };
};

describe("transactional cohort authority", () => {
  it("hashes invite codes deterministically without preserving the bearer value", () => {
    const digest = hashCohortInviteCode(" nld-abc234 ");
    expect(digest).toBe(hashCohortInviteCode("NLD-ABC234"));
    expect(digest).toMatch(/^[a-f0-9]{64}$/);
    expect(digest).not.toContain("ABC234");
  });

  it("rejects cohort creation for a foreign course owner", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("FROM courses")) {
        return { rows: [{ id: "CRS-1", owner_id: "MGR-2", status: "Active", approval: "Approved" }] };
      }
      return { rows: [] };
    });
    const repository = createCohortAuthorityRepository(db);

    await expect(repository.createCohort({
      actor: { id: "MGR-1", role: "Manager" },
      cohort: { id: "COH-1", courseId: "CRS-1", name: "Secure cohort", description: "", startDate: "2026-11-05", endDate: null, capacity: 10 },
      inviteCodeHash: hashCohortInviteCode("NLD-ABC234"),
    })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(client.query.mock.calls.some(([sql]) => sql.includes("INSERT INTO cohorts"))).toBe(false);
  });

  it("creates a cohort and its audit record in one transaction", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("FROM courses")) {
        return { rows: [{ id: "CRS-1", owner_id: "MGR-1", status: "Active", approval: "Approved" }] };
      }
      if (sql.includes("INSERT INTO cohorts")) return { rows: [cohortRow()] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createCohortAuthorityRepository(db);
    const result = await repository.createCohort({
      actor: { id: "MGR-1", role: "Manager" },
      cohort: { id: "COH-1", courseId: "CRS-1", name: "Secure cohort", description: "", startDate: "2026-11-05", endDate: null, capacity: 1 },
      inviteCodeHash: hashCohortInviteCode("NLD-ABC234"),
    });

    expect(result).toMatchObject({ id: "COH-1", courseId: "CRS-1", capacity: 1 });
    expect(client.query.mock.calls.filter(([sql]) => sql.includes("INSERT INTO audit_logs"))).toHaveLength(1);
  });

  it("returns an idempotent join before applying the capacity check", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("FROM cohorts cohort") && sql.includes("FOR UPDATE")) return { rows: [cohortRow()] };
      if (sql.includes("FROM users")) return { rows: [{ id: "USR-1", status: "Active" }] };
      if (sql.includes("FROM enrollments WHERE course_id")) return { rows: [enrollmentRow()] };
      return { rows: [] };
    });
    const repository = createCohortAuthorityRepository(db);
    const result = await repository.joinCohort({
      actor: { id: "USR-1", role: "Learner" },
      inviteCodeHash: hashCohortInviteCode("NLD-ABC234"), enrollmentId: "ENR-NEW",
    });

    expect(result).toMatchObject({ created: false, alreadyMember: true });
    expect(client.query.mock.calls.some(([sql]) => sql.includes("count(*)"))).toBe(false);
  });

  it("locks the cohort and rejects a new member when capacity is full", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("FROM cohorts cohort") && sql.includes("FOR UPDATE")) return { rows: [cohortRow()] };
      if (sql.includes("FROM users")) return { rows: [{ id: "USR-2", status: "Active" }] };
      if (sql.includes("FROM enrollments WHERE course_id")) return { rows: [] };
      if (sql.includes("count(*)")) return { rows: [{ count: 1 }] };
      return { rows: [] };
    });
    const repository = createCohortAuthorityRepository(db);

    await expect(repository.joinCohort({
      actor: { id: "USR-2", role: "Learner" },
      inviteCodeHash: hashCohortInviteCode("NLD-ABC234"), enrollmentId: "ENR-2",
    })).rejects.toMatchObject({ code: "COHORT_FULL" });
    expect(client.query.mock.calls[0][0]).toContain("FOR UPDATE OF cohort, course");
    expect(client.query.mock.calls.some(([sql]) => sql.includes("INSERT INTO enrollments"))).toBe(false);
  });

  it("inserts membership and audit evidence atomically", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("FROM cohorts cohort") && sql.includes("FOR UPDATE")) return { rows: [cohortRow({ capacity: 2 })] };
      if (sql.includes("FROM users")) return { rows: [{ id: "USR-2", status: "Active" }] };
      if (sql.includes("FROM enrollments WHERE course_id")) return { rows: [] };
      if (sql.includes("count(*)")) return { rows: [{ count: 1 }] };
      if (sql.includes("INSERT INTO enrollments")) return { rows: [enrollmentRow({ id: "ENR-2", user_id: "USR-2" })] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createCohortAuthorityRepository(db);
    const result = await repository.joinCohort({
      actor: { id: "USR-2", role: "Learner" },
      inviteCodeHash: hashCohortInviteCode("NLD-ABC234"), enrollmentId: "ENR-2",
    });

    expect(result).toMatchObject({ created: true, alreadyMember: false });
    expect(client.query.mock.calls.filter(([sql]) => sql.includes("INSERT INTO audit_logs"))).toHaveLength(1);
  });
});
