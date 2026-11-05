import { describe, expect, it, vi } from "vitest";
import { createAssignmentAuthorityRepository } from "../../backend/src/repositories/assignment-authority.repository.pg.js";

const course = (overrides = {}) => ({
  id: "CRS-1", owner_id: "MGR-1", status: "Active", approval: "Approved", ...overrides,
});
const enrollment = (userId, id = `ENR-${userId}`) => ({
  id, course_id: "CRS-1", user_id: userId, assigned_by: "MGR-1", due_at: null,
  priority: "High", mandatory: true, progress: 0, completed_chapters: [],
  time_spent_minutes: 0, time_spent_seconds: 0, chapter_time_spent_seconds: {},
  status: "Enrolled", version: 0, started_at: new Date("2026-11-05T00:00:00Z"), completed_at: null,
});
const fakeDb = (handler) => {
  const client = { query: vi.fn(handler) };
  return { client, db: { query: vi.fn(handler), withTransaction: vi.fn((fn) => fn(client)) } };
};

describe("transactional assignment authority", () => {
  it("rejects a Manager who does not own the course", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("FROM courses")) return { rows: [course()] };
      return { rows: [] };
    });
    const repository = createAssignmentAuthorityRepository(db);

    await expect(repository.assignCourse({
      courseId: "CRS-1", actor: { id: "MGR-2", role: "Manager" },
      assignees: [{ userId: "USR-1", enrollmentId: "ENR-1" }], dueAt: null,
      priority: "Medium", mandatory: false,
    })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(client.query.mock.calls.some(([sql]) => sql.includes("INSERT INTO enrollments"))).toBe(false);
  });

  it("atomically assigns active direct reports and writes one audit record", async () => {
    const { db, client } = fakeDb(async (sql, params) => {
      if (sql.includes("FROM courses")) return { rows: [course()] };
      if (sql.includes("FROM users")) return { rows: [
        { id: "USR-1", status: "Active", manager_id: "MGR-1" },
        { id: "USR-2", status: "Active", manager_id: "MGR-1" },
      ] };
      if (sql.includes("SELECT user_id FROM enrollments")) return { rows: [] };
      if (sql.includes("INSERT INTO enrollments")) return { rows: [enrollment(params[2], params[0])] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createAssignmentAuthorityRepository(db);

    const result = await repository.assignCourse({
      courseId: "CRS-1", actor: { id: "MGR-1", role: "Manager" },
      assignees: [
        { userId: "USR-1", enrollmentId: "ENR-1" },
        { userId: "USR-2", enrollmentId: "ENR-2" },
      ], dueAt: "2026-12-01", priority: "High", mandatory: true,
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ courseId: "CRS-1", userId: "USR-1", assignedBy: "MGR-1" });
    const statements = client.query.mock.calls.map(([sql]) => sql);
    expect(statements.filter((sql) => sql.includes("INSERT INTO enrollments"))).toHaveLength(2);
    expect(statements.filter((sql) => sql.includes("INSERT INTO audit_logs"))).toHaveLength(1);
  });

  it("rejects inactive or out-of-scope assignees before inserting", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("FROM courses")) return { rows: [course()] };
      if (sql.includes("FROM users")) return { rows: [{ id: "USR-1", status: "Active", manager_id: "MGR-2" }] };
      return { rows: [] };
    });
    const repository = createAssignmentAuthorityRepository(db);

    await expect(repository.assignCourse({
      courseId: "CRS-1", actor: { id: "MGR-1", role: "Manager" },
      assignees: [{ userId: "USR-1", enrollmentId: "ENR-1" }, { userId: "MISSING", enrollmentId: "ENR-2" }],
      dueAt: null, priority: "Medium", mandatory: false,
    })).rejects.toMatchObject({ code: "ASSIGNEE_FORBIDDEN", details: { userIds: ["USR-1", "MISSING"] } });
    expect(client.query.mock.calls.some(([sql]) => sql.includes("INSERT INTO enrollments"))).toBe(false);
  });

  it("returns the conflicting users without partially inserting the batch", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("FROM courses")) return { rows: [course()] };
      if (sql.includes("FROM users")) return { rows: [{ id: "USR-1", status: "Active", manager_id: "MGR-1" }] };
      if (sql.includes("SELECT user_id FROM enrollments")) return { rows: [{ user_id: "USR-1" }] };
      return { rows: [] };
    });
    const repository = createAssignmentAuthorityRepository(db);

    await expect(repository.assignCourse({
      courseId: "CRS-1", actor: { id: "MGR-1", role: "Manager" },
      assignees: [{ userId: "USR-1", enrollmentId: "ENR-1" }], dueAt: null,
      priority: "Medium", mandatory: false,
    })).rejects.toMatchObject({ code: "ALREADY_ASSIGNED", details: { userIds: ["USR-1"] } });
    expect(client.query.mock.calls.some(([sql]) => sql.includes("INSERT INTO enrollments"))).toBe(false);
  });

  it("maps a concurrent unique-constraint race to a stable assignment conflict", async () => {
    const { db } = fakeDb(async (sql) => {
      if (sql.includes("FROM courses")) return { rows: [course()] };
      if (sql.includes("FROM users")) return { rows: [{ id: "USR-1", status: "Active", manager_id: "MGR-1" }] };
      if (sql.includes("SELECT user_id FROM enrollments")) return { rows: [] };
      if (sql.includes("INSERT INTO enrollments")) {
        throw { code: "23505", constraint: "enrollments_course_id_user_id_key" };
      }
      return { rows: [] };
    });
    const repository = createAssignmentAuthorityRepository(db);

    await expect(repository.assignCourse({
      courseId: "CRS-1", actor: { id: "MGR-1", role: "Manager" },
      assignees: [{ userId: "USR-1", enrollmentId: "ENR-1" }], dueAt: null,
      priority: "Medium", mandatory: false,
    })).rejects.toMatchObject({ code: "ALREADY_ASSIGNED" });
  });
});
