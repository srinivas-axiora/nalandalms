import { describe, expect, it, vi } from "vitest";
import {
  createAttemptsRepository,
} from "../../backend/src/repositories/attempts.repository.pg.js";

const attemptRow = (overrides = {}) => ({
  id: "ATT-001",
  assessment_id: "ASM-001",
  chapter_id: "CH-001",
  course_id: "CRS-001",
  user_id: "USR-001",
  status: "InProgress",
  score: null,
  max_score: "100",
  feedback: "",
  answers: {},
  selected_question_ids: ["Q-001"],
  question_map: { "Q-001": { type: "MCQ", correctIndex: 1, points: 10 } },
  manual_grades: {},
  flags: [],
  warnings: [],
  video_chunks: [],
  companion: null,
  trust_score: 100,
  tab_switch_warnings: 0,
  auto_submitted_reason: null,
  expires_at: new Date("2026-11-03T09:00:00.000Z"),
  is_paused: false,
  paused_at: null,
  resumed_at: null,
  terminated_reason: null,
  terminated_by: null,
  terminated_at: null,
  assigned_proctor_id: null,
  time_spent_seconds: 0,
  started_at: new Date("2026-11-03T08:00:00.000Z"),
  submitted_at: null,
  evaluated_by: null,
  version: 0,
  ...overrides,
});

const domainAttempt = (overrides = {}) => ({
  id: "ATT-001",
  assessmentId: "ASM-001",
  chapterId: "CH-001",
  courseId: "CRS-001",
  userId: "USR-001",
  status: "InProgress",
  score: null,
  maxScore: 100,
  feedback: "",
  answers: {},
  selectedQuestionIds: ["Q-001"],
  questionMap: { "Q-001": { type: "MCQ", correctIndex: 1, points: 10 } },
  flags: [],
  warnings: [],
  videoChunks: [],
  trustScore: 100,
  expiresAt: "2026-11-03T09:00:00.000Z",
  startedAt: "2026-11-03T08:00:00.000Z",
  version: 0,
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

describe("PostgreSQL assessment-attempt repository", () => {
  it("inserts the attempt and start audit in one transaction", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("INSERT INTO assessment_attempts")) return { rows: [attemptRow()] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createAttemptsRepository(db);

    const result = await repository.insert(domainAttempt());

    expect(db.withTransaction).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ id: "ATT-001", version: 0, selectedQuestionIds: ["Q-001"] });
    const statements = client.query.mock.calls.map(([sql]) => sql);
    expect(statements.some((sql) => sql.includes("INSERT INTO assessment_attempts"))).toBe(true);
    expect(statements.some((sql) => sql.includes("INSERT INTO audit_logs"))).toBe(true);
  });

  it("enforces open status and the server database clock for answer writes", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("UPDATE assessment_attempts")) return { rows: [attemptRow({ version: 1 })] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createAttemptsRepository(db);

    const result = await repository.save(domainAttempt({
      answers: { "Q-001": { answer: 1, recordedAt: "2026-11-03T08:05:00.000Z" } },
    }), { guard: "answer", action: "SAVE_EXAM_ANSWER" });

    expect(result.version).toBe(1);
    const updateSql = client.query.mock.calls.find(([sql]) => sql.includes("UPDATE assessment_attempts"))[0];
    expect(updateSql).toContain("status = 'InProgress'");
    expect(updateSql).toContain("expires_at >= now()");
    expect(updateSql).toContain("version = $2");
  });

  it("rejects a stale optimistic version rather than overwriting a competing write", async () => {
    const { db } = fakeDb(async (sql) => {
      if (sql.includes("UPDATE assessment_attempts")) return { rows: [] };
      if (sql.includes("SELECT * FROM assessment_attempts")) return { rows: [attemptRow({ version: 2 })] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createAttemptsRepository(db);

    await expect(repository.save(domainAttempt(), { expectedVersion: 0 }))
      .rejects.toMatchObject({ code: "ATTEMPT_CONFLICT" });
  });

  it("stores the attempt trust transition, event and audit atomically", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("UPDATE assessment_attempts")) {
        return { rows: [attemptRow({ trust_score: 85, version: 1 })] };
      }
      if (sql.includes("INSERT INTO proctoring_logs")) {
        return { rows: [{
          id: "EVT-001",
          attempt_id: "ATT-001",
          user_id: "USR-001",
          event_type: "FACE_ABSENT",
          severity: "high",
          confidence: "0.900",
          capture_key: null,
          trust_score_after: 85,
          metadata: {},
          created_at: new Date("2026-11-03T08:10:00.000Z"),
        }] };
      }
      return { rows: [], rowCount: 1 };
    });
    const repository = createAttemptsRepository(db);

    const result = await repository.recordProctorEvent({
      attempt: domainAttempt({ trustScore: 85 }),
      enrollment: { addTimeSeconds: 30 },
      event: {
        id: "EVT-001",
        attemptId: "ATT-001",
        userId: "USR-001",
        eventType: "FACE_ABSENT",
        severity: "high",
        confidence: 0.9,
        trustScoreAfter: 85,
        createdAt: "2026-11-03T08:10:00.000Z",
      },
    });

    expect(db.withTransaction).toHaveBeenCalledTimes(1);
    expect(result.attempt).toMatchObject({ trustScore: 85, version: 1 });
    const statements = client.query.mock.calls.map(([sql]) => sql);
    expect(statements.some((sql) => sql.includes("INSERT INTO proctoring_logs"))).toBe(true);
    expect(statements.some((sql) => sql.includes("UPDATE enrollments"))).toBe(true);
    expect(statements.some((sql) => sql.includes("INSERT INTO audit_logs"))).toBe(true);
  });

  it("appends dual-camera chunks without replacing the existing manifest", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("video_chunks = video_chunks ||")) {
        return { rows: [attemptRow({
          video_chunks: [{ chunkIndex: 0 }, { chunkIndex: 1 }],
          version: 2,
        })] };
      }
      return { rows: [], rowCount: 1 };
    });
    const repository = createAttemptsRepository(db);

    const saved = await repository.appendVideoChunk({
      attemptId: "ATT-001",
      actorId: "USR-001",
      chunk: { chunkIndex: 1, streamRole: "companion", key: "chunk-1.webm" },
    });

    expect(saved).toMatchObject({ version: 2, videoChunks: [{ chunkIndex: 0 }, { chunkIndex: 1 }] });
    const updateSql = client.query.mock.calls.find(([sql]) => sql.includes("UPDATE assessment_attempts"))[0];
    expect(updateSql).toContain("video_chunks = video_chunks ||");
    expect(updateSql).toContain("version = version + 1");
  });
});
