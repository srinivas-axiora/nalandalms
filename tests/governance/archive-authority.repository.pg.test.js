import { describe, expect, it, vi } from "vitest";
import {
  createArchiveAuthorityRepository,
} from "../../backend/src/repositories/archive-authority.repository.pg.js";

const archiveRow = (overrides = {}) => ({
  id: "11111111-1111-4111-8111-111111111111",
  entity_type: "Course",
  entity_id: "CRS-ARCHIVED",
  entity_data: {
    title: "Archived course", description: "Restore test", owner_id: "ADMIN-1",
    current_version: 2, status: "Active", approval: "Approved",
  },
  related_data: { archiveVersion: 2, chapters: [], assessments: [], questions: [] },
  deleted_by: "ADMIN-1",
  deleted_by_name: "Administrator",
  deletion_comment: "Retired obsolete authoring course",
  deleted_at: new Date("2026-11-06T00:00:00.000Z"),
  ...overrides,
});

const fakeDb = (handler) => {
  const client = { query: vi.fn(handler) };
  return {
    client,
    db: { query: vi.fn(handler), withTransaction: vi.fn((fn) => fn(client)) },
  };
};

describe("PostgreSQL archive authority", () => {
  it("treats non-UUID restore identifiers as not found without querying", async () => {
    const { db } = fakeDb(async () => ({ rows: [] }));
    const repository = createArchiveAuthorityRepository(db);
    await expect(repository.restoreAuthoringArchive({
      archiveId: "legacy-snapshot-id",
      actor: { id: "ADMIN-1", role: "Super Admin" },
    })).resolves.toBeNull();
    expect(db.withTransaction).not.toHaveBeenCalled();
  });

  it("lists only requested relational archive types in deterministic order", async () => {
    const { db } = fakeDb(async () => ({ rows: [archiveRow()] }));
    const repository = createArchiveAuthorityRepository(db);
    const result = await repository.listArchives({ entityTypes: ["Course", "Assessment"], limit: 20 });

    expect(result).toEqual([expect.objectContaining({
      entityType: "Course", entityId: "CRS-ARCHIVED", deletedBy: "ADMIN-1",
    })]);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("ORDER BY deleted_at DESC, id DESC"),
      [["Course", "Assessment"], 20],
    );
  });

  it("refuses legacy course archives that cannot prove question completeness", async () => {
    const legacy = archiveRow({ related_data: { chapters: [], assessments: [] } });
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("FROM deleted_archives") && sql.includes("FOR UPDATE")) return { rows: [legacy] };
      return { rows: [] };
    });
    const repository = createArchiveAuthorityRepository(db);

    await expect(repository.restoreAuthoringArchive({
      archiveId: legacy.id,
      actor: { id: "ADMIN-1", role: "Super Admin" },
    })).rejects.toMatchObject({ code: "ARCHIVE_INCOMPLETE" });
    expect(client.query.mock.calls.some(([sql]) => sql.includes("INSERT INTO courses"))).toBe(false);
    expect(client.query.mock.calls.some(([sql]) => sql.includes("DELETE FROM deleted_archives"))).toBe(false);
  });

  it("restores complete course content as an inactive draft and consumes the archive", async () => {
    const complete = archiveRow({
      related_data: {
        archiveVersion: 2,
        chapters: [{ id: "CH-1", title: "Chapter", body: "Body" }],
        assessments: [{
          id: "ASM-1", course_id: "CRS-ARCHIVED", title: "Assessment", type: "MCQ",
          duration_minutes: 20, pass_score: 70, owner_id: "ADMIN-1", version: 1,
        }],
        questions: [{
          id: "22222222-2222-4222-8222-222222222222", assessment_id: "ASM-1",
          question_type: "MCQ", prompt: "Question?", options: ["yes", "no"],
          correct_answer: 0, points: 10, sort_order: 0, metadata: {},
        }],
      },
    });
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("FROM deleted_archives") && sql.includes("FOR UPDATE")) return { rows: [complete] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createArchiveAuthorityRepository(db);
    const result = await repository.restoreAuthoringArchive({
      archiveId: complete.id,
      actor: { id: "ADMIN-1", role: "Super Admin" },
    });

    expect(result).toEqual({ entityType: "Course", entityId: "CRS-ARCHIVED" });
    const statements = client.query.mock.calls.map(([sql]) => sql);
    expect(statements.some((sql) => sql.includes("INSERT INTO courses"))).toBe(true);
    expect(statements.some((sql) => sql.includes("INSERT INTO chapters"))).toBe(true);
    expect(statements.some((sql) => sql.includes("INSERT INTO assessments"))).toBe(true);
    expect(statements.some((sql) => sql.includes("INSERT INTO questions"))).toBe(true);
    expect(statements.some((sql) => sql.includes("'RESTORE_ARCHIVE'"))).toBe(true);
    expect(statements.at(-1)).toContain("DELETE FROM deleted_archives");
  });

  it("refuses an assessment restore after its parent course is gone", async () => {
    const assessment = archiveRow({
      entity_type: "Assessment",
      entity_id: "ASM-1",
      entity_data: { id: "ASM-1", courseId: "CRS-MISSING", ownerId: "ADMIN-1" },
      related_data: { questions: [] },
    });
    const { db } = fakeDb(async (sql) => {
      if (sql.includes("FROM deleted_archives") && sql.includes("FOR UPDATE")) return { rows: [assessment] };
      if (sql.includes("SELECT * FROM courses")) return { rows: [] };
      return { rows: [] };
    });
    const repository = createArchiveAuthorityRepository(db);

    await expect(repository.restoreAuthoringArchive({
      archiveId: assessment.id,
      actor: { id: "ADMIN-1", role: "Super Admin" },
    })).rejects.toMatchObject({ code: "ARCHIVE_PARENT_MISSING" });
  });

  it("restores an assessment as review-gated content and advances its parent course", async () => {
    const assessment = archiveRow({
      entity_type: "Assessment",
      entity_id: "ASM-1",
      entity_data: {
        id: "ASM-1", courseId: "CRS-1", title: "Archived assessment", type: "MCQ",
        strictMode: true, durationMinutes: 20, passScore: 70, ownerId: "ADMIN-1", version: 2,
      },
      related_data: { questions: [{ type: "MCQ", prompt: "Question?", answer: 0 }] },
    });
    const course = {
      id: "CRS-1", title: "Parent course", description: "Course description", current_version: 4,
    };
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("FROM deleted_archives") && sql.includes("FOR UPDATE")) return { rows: [assessment] };
      if (sql.includes("SELECT * FROM courses")) return { rows: [course] };
      if (sql.includes("UPDATE courses")) return { rows: [{ ...course, current_version: 5 }] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createArchiveAuthorityRepository(db);

    const restored = await repository.restoreAuthoringArchive({
      archiveId: assessment.id,
      actor: { id: "ADMIN-1", role: "Super Admin" },
    });

    expect(restored).toEqual({ entityType: "Assessment", entityId: "ASM-1" });
    const statements = client.query.mock.calls.map(([sql]) => sql);
    expect(statements.find((sql) => sql.includes("INSERT INTO assessments"))).toContain("'Draft', 'Inactive'");
    expect(statements.some((sql) => sql.includes("UPDATE courses SET current_version = current_version + 1"))).toBe(true);
    expect(statements.at(-1)).toContain("DELETE FROM deleted_archives");
  });
});
