import { describe, expect, it, vi } from "vitest";
import {
  createAssessmentAuthorityRepository,
} from "../../backend/src/repositories/assessment-authority.repository.pg.js";

const courseRow = (overrides = {}) => ({
  id: "CRS-1",
  title: "Secure learning",
  description: "A secure course",
  owner_id: "OWNER-1",
  status: "Active",
  approval: "Approved",
  current_version: 2,
  ...overrides,
});

const assessmentRow = (overrides = {}) => ({
  id: "ASM-1",
  course_id: "CRS-1",
  course_title: "Secure learning",
  chapter_id: null,
  title: "Security assessment",
  type: "MCQ",
  strict_mode: true,
  duration_minutes: 30,
  pass_score: 70,
  question_limit: 1,
  difficulty: "Advanced",
  approval: "Approved",
  status: "Active",
  owner_id: "OWNER-1",
  version: 1,
  created_at: new Date("2026-11-05T00:00:00.000Z"),
  updated_at: new Date("2026-11-05T00:00:00.000Z"),
  ...overrides,
});

const questionRow = (overrides = {}) => ({
  id: "5f6dd627-b090-45ae-8c92-8ac130dc0725",
  assessment_id: "ASM-1",
  question_type: "MCQ",
  prompt: "Which control prevents retry duplication?",
  options: ["Idempotency", "Caching"],
  correct_answer: 0,
  points: 10,
  sort_order: 0,
  metadata: { explanation: "Retries need stable request identity" },
  ...overrides,
});

const enrollmentRow = (overrides = {}) => ({
  id: "ENR-1",
  course_id: "CRS-1",
  user_id: "LEARNER-1",
  completed_chapters: [],
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

describe("PostgreSQL assessment authority", () => {
  it("uses enrollment-scoped SQL and redacts answer material for learners", async () => {
    const { db } = fakeDb(async (sql) => {
      if (sql.includes("FROM assessments a JOIN courses")) return { rows: [assessmentRow()] };
      if (sql.includes("FROM questions")) return { rows: [questionRow()] };
      return { rows: [] };
    });
    const repository = createAssessmentAuthorityRepository(db);

    const result = await repository.listVisible({
      actor: { id: "LEARNER-1", role: "Learner" },
      status: "Active",
    });

    expect(result[0]).toMatchObject({ id: "ASM-1", questions: [{ prompt: expect.any(String) }] });
    expect(result[0].questions[0]).not.toHaveProperty("answer");
    expect(result[0].questions[0]).not.toHaveProperty("correctAnswer");
    expect(result[0].questions[0]).not.toHaveProperty("explanation");
    const [sql, params] = db.query.mock.calls[0];
    expect(sql).toContain("JOIN enrollments");
    expect(params).toContain("LEARNER-1");
  });

  it("creates assessment, questions, immutable version, course version and audit atomically", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("SELECT * FROM courses")) return { rows: [courseRow()] };
      if (sql.includes("INSERT INTO assessments")) return { rows: [assessmentRow({ approval: "Pending" })] };
      if (sql.includes("INSERT INTO questions")) return { rows: [questionRow()] };
      if (sql.startsWith("UPDATE courses")) return { rows: [courseRow({ current_version: 3, approval: "Pending" })] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createAssessmentAuthorityRepository(db);

    const result = await repository.createAssessment({
      actor: { id: "OWNER-1", role: "Manager" },
      expectedCourseVersion: 2,
      assessment: {
        id: "ASM-1", courseId: "CRS-1", title: "Security assessment", type: "MCQ",
        strictMode: true, durationMinutes: 30, passScore: 70,
        questions: [{ type: "MCQ", prompt: "Which control?", options: ["A", "B"], answer: 0, points: 10 }],
      },
    });

    expect(result).toMatchObject({ assessment: { id: "ASM-1", version: 1 }, courseVersion: 3 });
    const statements = client.query.mock.calls.map(([sql]) => sql);
    expect(statements.some((sql) => sql.includes("INSERT INTO assessment_versions"))).toBe(true);
    expect(statements.some((sql) => sql.includes("INSERT INTO course_versions"))).toBe(true);
    expect(statements.some((sql) => sql.includes("INSERT INTO audit_logs"))).toBe(true);
  });

  it("keeps administrator-created assessments pending until step-up review", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("SELECT * FROM courses")) return { rows: [courseRow()] };
      if (sql.includes("INSERT INTO assessments")) return { rows: [assessmentRow({ approval: "Pending" })] };
      if (sql.includes("INSERT INTO questions")) return { rows: [questionRow()] };
      if (sql.startsWith("UPDATE courses")) return { rows: [courseRow({ current_version: 3 })] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createAssessmentAuthorityRepository(db);

    const result = await repository.createAssessment({
      actor: { id: "ADMIN-1", role: "Admin" },
      expectedCourseVersion: 2,
      assessment: {
        id: "ASM-1", courseId: "CRS-1", title: "Security assessment", type: "MCQ",
        strictMode: true, durationMinutes: 30, passScore: 70,
        questions: [{ type: "MCQ", prompt: "Which control?", options: ["A", "B"], answer: 0, points: 10 }],
      },
    });

    expect(result.assessment.approval).toBe("Pending");
    const assessmentInsert = client.query.mock.calls.find(([sql]) => sql.includes("INSERT INTO assessments"));
    expect(assessmentInsert[1][10]).toBe("Pending");
  });

  it("invalidates administrator approval when assessment content changes", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("SELECT * FROM assessments")) return { rows: [assessmentRow()] };
      if (sql.includes("SELECT * FROM courses")) return { rows: [courseRow()] };
      if (sql.startsWith("UPDATE assessments")) {
        return { rows: [assessmentRow({ title: "Changed assessment", approval: "Pending", version: 2 })] };
      }
      if (sql.includes("FROM questions")) return { rows: [questionRow()] };
      if (sql.startsWith("UPDATE courses")) return { rows: [courseRow({ current_version: 3 })] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createAssessmentAuthorityRepository(db);

    const result = await repository.updateAssessment({
      id: "ASM-1",
      actor: { id: "ADMIN-1", role: "Admin" },
      expectedCourseVersion: 2,
      expectedAssessmentVersion: 1,
      updates: { title: "Changed assessment" },
    });

    expect(result.assessment).toMatchObject({ approval: "Pending", version: 2 });
    const assessmentUpdate = client.query.mock.calls.find(([sql]) => sql.startsWith("UPDATE assessments"));
    expect(assessmentUpdate[1]).toContain("Pending");
  });

  it("prevents a manager from creating an assessment in another owner's course", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("SELECT * FROM courses")) return { rows: [courseRow()] };
      return { rows: [] };
    });
    const repository = createAssessmentAuthorityRepository(db);

    await expect(repository.createAssessment({
      actor: { id: "FOREIGN", role: "Manager" },
      expectedCourseVersion: 2,
      assessment: { id: "ASM-X", courseId: "CRS-1", questions: [] },
    })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(client.query.mock.calls.some(([sql]) => sql.includes("INSERT INTO assessments"))).toBe(false);
  });

  it("rejects a stale assessment writer before question replacement", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("SELECT * FROM assessments")) return { rows: [assessmentRow({ version: 4 })] };
      if (sql.includes("SELECT * FROM courses")) return { rows: [courseRow()] };
      return { rows: [] };
    });
    const repository = createAssessmentAuthorityRepository(db);

    await expect(repository.updateAssessment({
      id: "ASM-1",
      actor: { id: "OWNER-1", role: "Manager" },
      expectedCourseVersion: 2,
      expectedAssessmentVersion: 3,
      updates: { title: "Stale assessment" },
    })).rejects.toMatchObject({ code: "VERSION_CONFLICT", details: { resource: "assessment", currentVersion: 4 } });
    expect(client.query.mock.calls.some(([sql]) => sql.startsWith("UPDATE assessments"))).toBe(false);
  });

  it("refuses deletion when attempt history exists", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("SELECT * FROM assessments")) return { rows: [assessmentRow()] };
      if (sql.includes("SELECT * FROM courses")) return { rows: [courseRow()] };
      if (sql.includes("SELECT\n           (SELECT count(*) FROM assessment_attempts")) {
        return { rows: [{ attempts: 1, candidate_links: 0 }] };
      }
      return { rows: [] };
    });
    const repository = createAssessmentAuthorityRepository(db);

    await expect(repository.archiveAndDelete({
      id: "ASM-1",
      actor: { id: "OWNER-1", role: "Manager", name: "Owner" },
      expectedCourseVersion: 2,
      expectedAssessmentVersion: 1,
      deletionComment: "Retire this obsolete assessment",
    })).rejects.toMatchObject({ code: "ASSESSMENT_HAS_HISTORY" });
    expect(client.query.mock.calls.some(([sql]) => sql.startsWith("DELETE FROM assessments"))).toBe(false);
  });

  it("derives attempt eligibility from the locked relational enrollment", async () => {
    const { db } = fakeDb(async (sql) => {
      if (sql.includes("FROM assessments a JOIN courses")) return { rows: [assessmentRow()] };
      if (sql.includes("SELECT * FROM enrollments")) return { rows: [enrollmentRow()] };
      if (sql.includes("SELECT id FROM chapters")) return { rows: [{ id: "CH-1" }, { id: "CH-2" }] };
      return { rows: [] };
    });
    const repository = createAssessmentAuthorityRepository(db);

    await expect(repository.startAttempt({
      assessmentId: "ASM-1",
      actor: { id: "LEARNER-1", role: "Learner" },
      buildAttempt: vi.fn(),
    })).rejects.toMatchObject({
      code: "CHAPTERS_INCOMPLETE",
      details: { completedCount: 0, totalCount: 2, nextChapterId: "CH-1" },
    });
  });

  it("creates the eligible blind attempt inside the same transaction", async () => {
    const attemptRow = {
      id: "ATT-1", assessment_id: "ASM-1", course_id: "CRS-1", chapter_id: null,
      user_id: "LEARNER-1", status: "InProgress", score: null, max_score: 10,
      assessment_version: 1, duration_minutes_snapshot: 30, pass_score_snapshot: 70,
      feedback: "", answers: {}, selected_question_ids: [questionRow().id], question_map: {},
      manual_grades: {}, flags: [], warnings: [], video_chunks: [], companion: null,
      trust_score: 100, tab_switch_warnings: 0, auto_submitted_reason: null,
      expires_at: new Date("2026-11-05T01:00:00.000Z"), is_paused: false,
      started_at: new Date("2026-11-05T00:00:00.000Z"), submitted_at: null, version: 0,
    };
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("FROM assessments a JOIN courses")) return { rows: [assessmentRow()] };
      if (sql.includes("SELECT * FROM enrollments")) return { rows: [enrollmentRow({ completed_chapters: ["CH-1"] })] };
      if (sql.includes("SELECT id FROM chapters")) return { rows: [{ id: "CH-1" }] };
      if (sql.includes("FROM questions")) return { rows: [questionRow()] };
      if (sql.includes("INSERT INTO assessment_attempts")) return { rows: [attemptRow] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createAssessmentAuthorityRepository(db);
    const buildAttempt = vi.fn(() => ({
      id: "ATT-1", assessmentId: "ASM-1", courseId: "CRS-1", userId: "LEARNER-1",
      assessmentVersion: 1, durationMinutesSnapshot: 30, passScoreSnapshot: 70,
      status: "InProgress", maxScore: 10, answers: {}, selectedQuestionIds: [questionRow().id],
      questionMap: {}, flags: [], startedAt: "2026-11-05T00:00:00.000Z",
    }));

    const result = await repository.startAttempt({
      assessmentId: "ASM-1",
      actor: { id: "LEARNER-1", role: "Learner" },
      buildAttempt,
    });

    expect(result).toMatchObject({ assessment: { id: "ASM-1" }, attempt: { id: "ATT-1" } });
    expect(buildAttempt).toHaveBeenCalledWith(expect.objectContaining({ questions: [expect.objectContaining({ answer: 0 })] }));
    expect(client.query.mock.calls.some(([sql]) => sql.includes("INSERT INTO assessment_attempts"))).toBe(true);
    expect(client.query.mock.calls.some(([sql]) => sql.includes("START_BLIND_EXAM"))).toBe(false);
    expect(client.query.mock.calls.some(([sql, params]) => sql.includes("INSERT INTO audit_logs") && params?.includes("START_BLIND_EXAM"))).toBe(true);
  });
});
