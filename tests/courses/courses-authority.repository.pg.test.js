import { describe, expect, it, vi } from "vitest";
import {
  createCourseAuthorityRepository,
} from "../../backend/src/repositories/courses-authority.repository.pg.js";

const courseRow = (overrides = {}) => ({
  id: "CRS-1",
  title: "Secure systems",
  description: "Production security engineering",
  skill: "Security",
  skill_ids: ["SK-1"],
  target_level: "Advanced",
  difficulty: "Advanced",
  estimated_hours: "8",
  price_cents: 0,
  currency: "INR",
  category: "Technical",
  prerequisites: [],
  tags: ["security"],
  thumbnail_color: "#123456",
  content_types: ["Rich Text"],
  storage_metadata: { files: [] },
  status: "Active",
  approval: "Approved",
  owner_id: "OWNER-1",
  current_version: 1,
  created_at: new Date("2026-11-05T00:00:00.000Z"),
  updated_at: new Date("2026-11-05T00:00:00.000Z"),
  ...overrides,
});

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

describe("PostgreSQL course authority", () => {
  it("builds the public catalog with parameterized filters and aggregate counts", async () => {
    const row = courseRow({
      instructor_name: "Instructor",
      instructor_title: "Principal",
      chapter_count: 4,
      enrollment_count: 12,
    });
    const { db } = fakeDb(async () => ({ rows: [row] }));
    const repository = createCourseAuthorityRepository(db);

    const result = await repository.listCatalog({
      skill: "Security",
      search: "systems%' OR true --",
    });

    expect(result[0]).toMatchObject({
      id: "CRS-1",
      instructorName: "Instructor",
      chapterCount: 4,
      enrollmentCount: 12,
    });
    const [sql, params] = db.query.mock.calls[0];
    expect(sql).not.toContain("OR true");
    expect(params).toEqual(["Security", "%systems%' OR true --%"]);
  });

  it("creates course, initial version and audit in one transaction", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("INSERT INTO courses")) return { rows: [courseRow()] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createCourseAuthorityRepository(db);
    const created = await repository.createCourse({
      actor: { id: "OWNER-1", role: "Manager" },
      course: {
        id: "CRS-1",
        title: "Secure systems",
        description: "Production security engineering",
        skill: "Security",
      },
    });

    expect(created).toMatchObject({ id: "CRS-1", version: 1 });
    expect(db.withTransaction).toHaveBeenCalledTimes(1);
    const statements = client.query.mock.calls.map(([sql]) => sql);
    expect(statements.some((sql) => sql.includes("INSERT INTO course_versions"))).toBe(true);
    expect(statements.some((sql) => sql.includes("INSERT INTO audit_logs"))).toBe(true);
    const courseInsert = client.query.mock.calls.find(([sql]) => sql.includes("INSERT INTO courses"));
    expect(courseInsert[1]).toContain("Pending");
  });

  it("rejects a stale writer before issuing an update", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("SELECT * FROM courses")) return { rows: [courseRow({ current_version: 3 })] };
      return { rows: [] };
    });
    const repository = createCourseAuthorityRepository(db);

    await expect(repository.updateCourse({
      id: "CRS-1",
      actor: { id: "OWNER-1", role: "Manager" },
      expectedVersion: 2,
      updates: { title: "Stale title" },
    })).rejects.toMatchObject({ code: "VERSION_CONFLICT", details: { currentVersion: 3 } });

    expect(client.query.mock.calls.some(([sql]) => sql.startsWith("UPDATE courses"))).toBe(false);
  });

  it("prevents a manager from mutating or duplicating another owner's course", async () => {
    const { db } = fakeDb(async (sql) => {
      if (sql.includes("SELECT * FROM courses")) return { rows: [courseRow()] };
      return { rows: [] };
    });
    const repository = createCourseAuthorityRepository(db);
    const actor = { id: "FOREIGN-MANAGER", role: "Manager" };

    await expect(repository.updateCourse({
      id: "CRS-1", actor, expectedVersion: 1, updates: { title: "Takeover" },
    })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(repository.duplicateCourse({
      sourceId: "CRS-1", newId: "CRS-COPY", actor,
    })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("makes free self-enrollment idempotent under a uniqueness race", async () => {
    const enrollment = {
      id: "ENR-EXISTING", course_id: "CRS-1", user_id: "USER-1",
      assigned_by: "USER-1", status: "Enrolled",
    };
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("SELECT * FROM courses")) return { rows: [courseRow()] };
      if (sql.includes("INSERT INTO enrollments")) return { rows: [], rowCount: 0 };
      if (sql.includes("SELECT * FROM enrollments")) return { rows: [enrollment] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createCourseAuthorityRepository(db);
    const result = await repository.selfEnroll({
      enrollmentId: "ENR-COMPETING", courseId: "CRS-1", userId: "USER-1",
    });

    expect(result).toMatchObject({ created: false, enrollment: { id: "ENR-EXISTING" } });
    expect(client.query.mock.calls.some(([sql]) => sql.includes("INSERT INTO audit_logs"))).toBe(false);
  });

  it("rejects free self-enrollment until every prerequisite is complete", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("SELECT * FROM courses")) {
        return { rows: [courseRow({ prerequisites: ["CRS-PRE-1", "CRS-PRE-2"] })] };
      }
      if (sql.includes("course_id = ANY")) {
        return { rows: [{ course_id: "CRS-PRE-1", progress: 100 }] };
      }
      if (sql.includes("SELECT * FROM enrollments")) return { rows: [] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createCourseAuthorityRepository(db);

    await expect(repository.selfEnroll({
      enrollmentId: "ENR-NEW", courseId: "CRS-1", userId: "USER-1",
    })).rejects.toMatchObject({
      code: "PREREQUISITES_NOT_MET",
      details: { unmetPrerequisiteIds: ["CRS-PRE-2"] },
    });
    expect(client.query.mock.calls.some(([sql]) => sql.includes("INSERT INTO enrollments"))).toBe(false);
  });

  it("creates enrollment after all prerequisites are complete", async () => {
    const enrollment = {
      id: "ENR-NEW", course_id: "CRS-1", user_id: "USER-1",
      assigned_by: "USER-1", status: "Enrolled",
    };
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("SELECT * FROM courses")) {
        return { rows: [courseRow({ prerequisites: ["CRS-PRE-1"] })] };
      }
      if (sql.includes("course_id = ANY")) {
        return { rows: [{ course_id: "CRS-PRE-1", status: "Passed" }] };
      }
      if (sql.includes("SELECT * FROM enrollments")) return { rows: [] };
      if (sql.includes("INSERT INTO enrollments")) return { rows: [enrollment], rowCount: 1 };
      return { rows: [], rowCount: 1 };
    });
    const repository = createCourseAuthorityRepository(db);

    const result = await repository.selfEnroll({
      enrollmentId: "ENR-NEW", courseId: "CRS-1", userId: "USER-1",
    });

    expect(result).toMatchObject({ created: true, enrollment: { id: "ENR-NEW" } });
    expect(client.query.mock.calls.some(([sql]) => sql.includes("INSERT INTO audit_logs"))).toBe(true);
  });

  it("refuses deletion when retained learning or financial history exists", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("SELECT * FROM courses")) return { rows: [courseRow()] };
      if (sql.includes("SELECT\n           (SELECT count(*) FROM enrollments")) {
        return { rows: [{ enrollments: 1, payment_orders: 0, attempts: 0, certificates: 0,
          candidate_links: 0, proctor_captures: 0, feedbacks: 0, time_events: 0 }] };
      }
      return { rows: [], rowCount: 1 };
    });
    const repository = createCourseAuthorityRepository(db);

    await expect(repository.archiveAndDelete({
      id: "CRS-1",
      actor: { id: "OWNER-1", name: "Owner", role: "Manager" },
      expectedVersion: 1,
      deletionComment: "Retire obsolete authoring draft",
    })).rejects.toMatchObject({ code: "COURSE_HAS_HISTORY" });

    expect(client.query.mock.calls.some(([sql]) => sql.startsWith("DELETE FROM courses"))).toBe(false);
  });

  it("archives assessment questions before deleting a history-free course", async () => {
    const question = { id: "11111111-1111-4111-8111-111111111111", assessment_id: "ASM-1" };
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("SELECT * FROM courses")) return { rows: [courseRow()] };
      if (sql.includes("SELECT\n           (SELECT count(*) FROM enrollments")) {
        return { rows: [{ enrollments: 0, payment_orders: 0, attempts: 0, certificates: 0,
          candidate_links: 0, proctor_captures: 0, feedbacks: 0, time_events: 0 }] };
      }
      if (sql.includes("AS chapters") && sql.includes("AS questions")) {
        return { rows: [{ chapters: [], assessments: [], questions: [question], archiveVersion: 2 }] };
      }
      return { rows: [], rowCount: 1 };
    });
    const repository = createCourseAuthorityRepository(db);

    await repository.archiveAndDelete({
      id: "CRS-1",
      actor: { id: "OWNER-1", name: "Owner", role: "Manager" },
      expectedVersion: 1,
      deletionComment: "Retire obsolete authoring draft",
    });

    const archiveCall = client.query.mock.calls.find(([sql]) => sql.includes("INSERT INTO deleted_archives"));
    expect(JSON.parse(archiveCall[1][2])).toMatchObject({ archiveVersion: 2, questions: [question] });
    expect(client.query.mock.calls.some(([sql]) => sql.startsWith("DELETE FROM courses"))).toBe(true);
  });
});
