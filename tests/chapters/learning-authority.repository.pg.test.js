import { describe, expect, it, vi } from "vitest";
import {
  createLearningAuthorityRepository,
} from "../../backend/src/repositories/learning-authority.repository.pg.js";

const course = (overrides = {}) => ({
  id: "CRS-1",
  title: "Secure learning",
  description: "A controlled course",
  status: "Active",
  approval: "Approved",
  owner_id: "OWNER-1",
  current_version: 2,
  ...overrides,
});

const chapter = (overrides = {}) => ({
  id: "CH-1",
  course_id: "CRS-1",
  sequence: 1,
  title: "Foundation",
  description: "Start here",
  content_type: "Rich Text",
  body: "protected body",
  url: "https://content.example/chapter",
  file_name: "chapter.pdf",
  duration_minutes: 1,
  minimum_time_minutes: 0,
  version: 1,
  created_at: new Date("2026-11-05T00:00:00.000Z"),
  updated_at: new Date("2026-11-05T00:00:00.000Z"),
  ...overrides,
});

const enrollment = (overrides = {}) => ({
  id: "ENR-1",
  course_id: "CRS-1",
  user_id: "LEARNER-1",
  progress: 0,
  completed_chapters: [],
  time_spent_minutes: 0,
  time_spent_seconds: 0,
  chapter_time_spent_seconds: {},
  chapter_heartbeat_timestamps: {},
  video_progress: {},
  status: "Enrolled",
  version: 0,
  completed_at: null,
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

describe("PostgreSQL chapter and progress authority", () => {
  it("redacts locked chapter content while preserving minimal metadata", async () => {
    const rows = [chapter(), chapter({ id: "CH-2", sequence: 2, title: "Advanced", body: "answer", url: "https://secret" })];
    const { db } = fakeDb(async (sql) => {
      if (sql.includes("SELECT * FROM courses")) return { rows: [course()] };
      if (sql.includes("SELECT * FROM enrollments")) return { rows: [enrollment()] };
      if (sql.includes("SELECT * FROM chapters")) return { rows };
      return { rows: [] };
    });
    const repository = createLearningAuthorityRepository(db);

    const result = await repository.listForActor({
      courseId: "CRS-1",
      actor: { id: "LEARNER-1", role: "Learner" },
    });

    expect(result.chapters[0]).toMatchObject({ id: "CH-1", isLocked: false, body: "protected body" });
    expect(result.chapters[1]).toMatchObject({ id: "CH-2", isLocked: true, lockReason: "Prerequisite chapter incomplete" });
    expect(result.chapters[1]).not.toHaveProperty("body");
    expect(result.chapters[1]).not.toHaveProperty("url");
    expect(result.chapters[1]).not.toHaveProperty("fileName");
  });

  it("creates a chapter and couples course versioning and audit in one transaction", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("SELECT * FROM courses")) return { rows: [course()] };
      if (sql.includes("max(sequence)")) return { rows: [{ next_sequence: 3 }] };
      if (sql.includes("INSERT INTO chapters")) return { rows: [chapter({ id: "CH-NEW", sequence: 3 })] };
      if (sql.startsWith("UPDATE courses")) return { rows: [course({ current_version: 3, approval: "Pending" })] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createLearningAuthorityRepository(db);

    const result = await repository.createChapter({
      courseId: "CRS-1",
      actor: { id: "OWNER-1", role: "Manager" },
      expectedCourseVersion: 2,
      chapter: { id: "CH-NEW", title: "New chapter", body: "safe" },
    });

    expect(result).toMatchObject({ chapter: { id: "CH-NEW", version: 1 }, courseVersion: 3 });
    const statements = client.query.mock.calls.map(([sql]) => sql);
    expect(statements.some((sql) => sql.includes("INSERT INTO course_versions"))).toBe(true);
    expect(statements.some((sql) => sql.includes("INSERT INTO audit_logs"))).toBe(true);
  });

  it("rejects stale chapter authoring before issuing an update", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("SELECT * FROM courses")) return { rows: [course()] };
      if (sql.includes("SELECT * FROM chapters WHERE id")) return { rows: [chapter({ version: 4 })] };
      return { rows: [] };
    });
    const repository = createLearningAuthorityRepository(db);

    await expect(repository.updateChapter({
      courseId: "CRS-1",
      chapterId: "CH-1",
      actor: { id: "OWNER-1", role: "Manager" },
      expectedCourseVersion: 2,
      expectedChapterVersion: 3,
      updates: { title: "Stale" },
    })).rejects.toMatchObject({ code: "VERSION_CONFLICT", details: { currentVersion: 4 } });
    expect(client.query.mock.calls.some(([sql]) => sql.startsWith("UPDATE chapters"))).toBe(false);
  });

  it("prevents a manager from authoring chapters in another owner's course", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("SELECT * FROM courses")) return { rows: [course()] };
      return { rows: [] };
    });
    const repository = createLearningAuthorityRepository(db);

    await expect(repository.createChapter({
      courseId: "CRS-1",
      actor: { id: "FOREIGN-MANAGER", role: "Manager" },
      expectedCourseVersion: 2,
      chapter: { id: "CH-FOREIGN", title: "Unauthorized" },
    })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(client.query.mock.calls.some(([sql]) => sql.includes("INSERT INTO chapters"))).toBe(false);
  });

  it("replays a heartbeat idempotently without accumulating time twice", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("SELECT * FROM courses")) return { rows: [course()] };
      if (sql.includes("SELECT * FROM enrollments")) return { rows: [enrollment({ time_spent_seconds: 15, chapter_time_spent_seconds: { "CH-1": 15 }, version: 1 })] };
      if (sql.includes("SELECT * FROM chapters")) return { rows: [chapter()] };
      if (sql.includes("SELECT * FROM learning_time_events")) return { rows: [{ chapter_id: "CH-1", seconds_spent: 15 }] };
      return { rows: [] };
    });
    const repository = createLearningAuthorityRepository(db);

    const result = await repository.recordHeartbeat({
      courseId: "CRS-1",
      chapterId: "CH-1",
      userId: "LEARNER-1",
      idempotencyKey: "heartbeat-request-0001",
      incrementSeconds: 15,
    });

    expect(result).toMatchObject({ replayed: true, effectiveIncrement: 15, chapterTimeSeconds: 15 });
    expect(client.query.mock.calls.some(([sql]) => sql.startsWith("UPDATE enrollments"))).toBe(false);
  });

  it("atomically records time, canonical totals, event evidence and completion", async () => {
    const { db, client } = fakeDb(async (sql, params) => {
      if (sql.includes("SELECT * FROM courses")) return { rows: [course()] };
      if (sql.includes("SELECT * FROM enrollments")) return { rows: [enrollment()] };
      if (sql.includes("SELECT * FROM chapters")) return { rows: [chapter()] };
      if (sql.includes("SELECT * FROM learning_time_events")) return { rows: [] };
      if (sql.includes("clock_timestamp")) return { rows: [{ server_now: new Date("2026-11-05T00:00:15.000Z") }] };
      if (sql.includes("count(*)::integer AS count FROM assessments")) return { rows: [{ count: 0 }] };
      if (sql.startsWith("UPDATE enrollments")) {
        return { rows: [enrollment({
          progress: params[2], completed_chapters: params[3], time_spent_seconds: params[4],
          time_spent_minutes: params[5], chapter_time_spent_seconds: JSON.parse(params[6]),
          chapter_heartbeat_timestamps: JSON.parse(params[7]), video_progress: JSON.parse(params[8]),
          status: params[10], completed_at: params[11], version: 1,
        })] };
      }
      return { rows: [], rowCount: 1 };
    });
    const repository = createLearningAuthorityRepository(db);

    const result = await repository.recordHeartbeat({
      courseId: "CRS-1",
      chapterId: "CH-1",
      userId: "LEARNER-1",
      idempotencyKey: "heartbeat-request-0002",
      incrementSeconds: 30,
      currentPositionSeconds: 9999,
    });

    expect(result).toMatchObject({ effectiveIncrement: 15, justCompleted: true, progress: 100, enrollmentStatus: "Passed" });
    const statements = client.query.mock.calls.map(([sql]) => sql);
    expect(statements.some((sql) => sql.includes("INSERT INTO chapter_time_totals"))).toBe(true);
    expect(statements.some((sql) => sql.includes("INSERT INTO learning_time_events"))).toBe(true);
    expect(statements.filter((sql) => sql.includes("INSERT INTO audit_logs"))).toHaveLength(2);
  });

  it("rejects rapid repeated accumulation using the database clock", async () => {
    const { db } = fakeDb(async (sql) => {
      if (sql.includes("SELECT * FROM courses")) return { rows: [course()] };
      if (sql.includes("SELECT * FROM enrollments")) return { rows: [enrollment({ chapter_heartbeat_timestamps: { "CH-1": "2026-11-05T00:00:15.000Z" } })] };
      if (sql.includes("SELECT * FROM chapters")) return { rows: [chapter()] };
      if (sql.includes("SELECT * FROM learning_time_events")) return { rows: [] };
      if (sql.includes("clock_timestamp")) return { rows: [{ server_now: new Date("2026-11-05T00:00:15.500Z") }] };
      return { rows: [] };
    });
    const repository = createLearningAuthorityRepository(db);

    await expect(repository.recordHeartbeat({
      courseId: "CRS-1", chapterId: "CH-1", userId: "LEARNER-1",
      idempotencyKey: "heartbeat-request-0003", incrementSeconds: 15,
    })).rejects.toMatchObject({ code: "HEARTBEAT_TOO_SOON" });
  });
});
