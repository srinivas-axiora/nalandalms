import { describe, expect, it, vi } from "vitest";
import { createProctorCockpitRepository } from "../../backend/src/repositories/proctor-cockpit.repository.pg.js";

describe("relational proctor cockpit authority", () => {
  it("scopes active sessions in SQL and returns a minimal cockpit projection", async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{
      attempt_id: "ATT-1",
      assessment_id: "ASM-1",
      course_id: "CRS-1",
      user_id: "LRN-1",
      status: "InProgress",
      started_at: new Date("2026-11-06T08:00:00Z"),
      expires_at: new Date("2026-11-06T09:00:00Z"),
      is_paused: false,
      duration_minutes_snapshot: 60,
      flags: [{ id: "FLAG-1" }],
      warnings: [],
      video_chunks: [],
      companion: null,
      trust_score: 74,
      assigned_proctor_id: "INS-1",
      candidate_name: "Scoped Candidate",
      candidate_email: "candidate@example.test",
      assessment_title: "Scoped Exam",
      course_title: "Scoped Course",
    }] });
    const repository = createProctorCockpitRepository({ query });

    const result = await repository.listActiveForActor({ id: "INS-1", role: "Instructor" });
    const [sql, params] = query.mock.calls[0];

    expect(sql).toContain("aa.assigned_proctor_id = $3");
    expect(sql).toContain("assessment.owner_id = $3");
    expect(sql).toContain("course.owner_id = $3");
    expect(sql).not.toMatch(/question_map|answers|manual_grades/i);
    expect(params).toEqual([["InProgress", "Paused"], false, "INS-1"]);
    expect(result[0]).toMatchObject({
      attempt: { id: "ATT-1", trustScore: 74, durationMinutesSnapshot: 60 },
      candidate: { name: "Scoped Candidate" },
      assessment: { title: "Scoped Exam" },
      course: { title: "Scoped Course" },
    });
  });

  it("passes an explicit administrator predicate without dropping actor binding", async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repository = createProctorCockpitRepository({ query });

    await repository.listActiveForActor({ id: "ADMIN-1", role: "Admin" });

    expect(query.mock.calls[0][1]).toEqual([["InProgress", "Paused"], true, "ADMIN-1"]);
  });

  it("rechecks actor scope while resolving timeline labels", async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{
      candidate_name: "Timeline Candidate",
      assessment_title: "Timeline Exam",
    }] });
    const repository = createProctorCockpitRepository({ query });

    const result = await repository.findTimelineContextForActor(
      "ATT-TIMELINE",
      { id: "INS-TIMELINE", role: "Instructor" }
    );
    const [sql, params] = query.mock.calls[0];

    expect(sql).toContain("aa.id = $1");
    expect(sql).toContain("aa.assigned_proctor_id = $3");
    expect(sql).toContain("assessment.owner_id = $3");
    expect(sql).toContain("course.owner_id = $3");
    expect(sql).not.toMatch(/candidate\.email|question_map|answers/i);
    expect(params).toEqual(["ATT-TIMELINE", false, "INS-TIMELINE"]);
    expect(result).toEqual({
      candidateName: "Timeline Candidate",
      assessmentTitle: "Timeline Exam",
    });
  });

  it("fails closed when timeline scope has been revoked", async () => {
    const repository = createProctorCockpitRepository({
      query: vi.fn().mockResolvedValue({ rows: [] }),
    });

    await expect(repository.findTimelineContextForActor(
      "ATT-REVOKED",
      { id: "FORMER-PROCTOR", role: "Instructor" }
    )).resolves.toBeNull();
  });
});
