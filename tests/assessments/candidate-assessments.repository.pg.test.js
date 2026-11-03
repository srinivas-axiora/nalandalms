import { describe, expect, it, vi } from "vitest";
import {
  CandidateAssessmentRepositoryError,
  createCandidateAssessmentsPgRepository,
  hashCandidateToken,
} from "../../backend/src/repositories/candidate-assessments.repository.pg.js";

const linkRow = (overrides = {}) => ({
  id: "CAL-1",
  token_hash: hashCandidateToken("public-token"),
  token_hint: "ic-token",
  assessment_id: "ASM-1",
  title: "Candidate assessment",
  course_id: "COURSE-1",
  course_title: "Security",
  chapter_id: null,
  duration_minutes: 30,
  pass_score: "70",
  question_limit: 1,
  question_snapshot: [{ id: "Q-1", prompt: "Choose B", type: "MCQ", options: ["A", "B"], answer: 1, points: 10 }],
  proctoring_required: true,
  fullscreen_required: true,
  tab_switch_auto_submit: true,
  max_tab_switches: 3,
  expires_at: null,
  status: "Active",
  created_by: "OWNER-1",
  created_by_name: "Owner",
  version: 0,
  created_at: new Date("2026-11-03T00:00:00.000Z"),
  updated_at: new Date("2026-11-03T00:00:00.000Z"),
  is_expired: false,
  ...overrides,
});

const submissionRow = (overrides = {}) => ({
  id: "CAS-1",
  link_id: "CAL-1",
  candidate_name: "Candidate",
  candidate_email: "candidate@example.invalid",
  started_at: new Date("2026-11-03T00:00:00.000Z"),
  expires_at: new Date("2026-11-03T00:31:00.000Z"),
  submitted_at: null,
  expired_at: null,
  status: "InProgress",
  trust_score: 100,
  tab_switch_count: 0,
  flags: [],
  answers: {},
  question_ids: ["Q-1"],
  score: "0",
  max_score: "10",
  percentage: "0",
  passed: null,
  requires_manual_review: false,
  ignored_proctoring: false,
  proctoring_status: "CLEAN",
  hiring_recommendation: "Not Shortlisted",
  evaluated_responses: [],
  category_breakdown: {},
  auto_submitted_reason: null,
  time_spent_seconds: 0,
  version: 0,
  ...overrides,
});

const fakeDb = (handler) => {
  const client = { query: vi.fn(handler) };
  return { client, db: { query: vi.fn(handler), withTransaction: vi.fn((fn) => fn(client)) } };
};

describe("PostgreSQL candidate assessment runtime", () => {
  it("hashes bearer tokens and starts one database-clock session", async () => {
    const { client, db } = fakeDb(async (sql) => {
      if (sql.includes("FROM candidate_assessment_links")) return { rows: [linkRow()] };
      if (sql.includes("INSERT INTO candidate_assessment_submissions")) return { rows: [submissionRow()] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createCandidateAssessmentsPgRepository(db);

    const result = await repository.startSubmission({
      token: "public-token",
      attemptToken: "attempt-secret",
      graceSeconds: 30,
      submission: { id: "CAS-1", candidateName: "Candidate", candidateEmail: "candidate@example.invalid" },
    });

    expect(result.submission).toMatchObject({ id: "CAS-1", status: "In Progress" });
    expect(result.questions[0]).toHaveProperty("answer", 1);
    const linkLookup = client.query.mock.calls.find(([sql]) => sql.includes("FROM candidate_assessment_links"));
    expect(linkLookup[1]).toEqual([hashCandidateToken("public-token")]);
    const insertion = client.query.mock.calls.find(([sql]) => sql.includes("INSERT INTO candidate_assessment_submissions"));
    expect(insertion[1][2]).toBe(hashCandidateToken("attempt-secret"));
    expect(JSON.stringify(insertion[1])).not.toContain("attempt-secret");
  });

  it("rotates a public bearer atomically without persisting plaintext", async () => {
    const { client, db } = fakeDb(async (sql) => {
      if (sql.includes("FROM candidate_assessment_links")) return { rows: [linkRow()] };
      if (sql.includes("UPDATE candidate_assessment_links")) {
        return { rows: [linkRow({
          token_hash: hashCandidateToken("replacement-token"),
          token_hint: "nt-token",
          version: 1,
        })] };
      }
      return { rows: [], rowCount: 1 };
    });
    const repository = createCandidateAssessmentsPgRepository(db);
    const rotated = await repository.rotateToken({
      identifier: "CAL-1",
      actorId: "OWNER-1",
      token: "replacement-token",
    });

    expect(rotated).toMatchObject({ id: "CAL-1", token: null, tokenHint: "nt-token", version: 1 });
    const update = client.query.mock.calls.find(([sql]) => sql.includes("UPDATE candidate_assessment_links"));
    expect(update[1]).toEqual(["CAL-1", hashCandidateToken("replacement-token"), "nt-token"]);
    expect(JSON.stringify(update[1])).not.toContain('"replacement-token"');
    expect(client.query.mock.calls.some(([, params]) =>
      params?.includes("ROTATE_CANDIDATE_ASSESSMENT_TOKEN"))).toBe(true);
  });

  it("maps the unique candidate constraint to a stable conflict", async () => {
    const duplicate = Object.assign(new Error("duplicate"), { code: "23505" });
    const { db } = fakeDb(async (sql) => {
      if (sql.includes("FROM candidate_assessment_links")) return { rows: [linkRow()] };
      if (sql.includes("INSERT INTO candidate_assessment_submissions")) throw duplicate;
      return { rows: [] };
    });
    const repository = createCandidateAssessmentsPgRepository(db);
    await expect(repository.startSubmission({
      token: "public-token",
      attemptToken: "attempt-secret",
      graceSeconds: 30,
      submission: { id: "CAS-2", candidateName: "Candidate", candidateEmail: "candidate@example.invalid" },
    })).rejects.toMatchObject({
      name: "CandidateAssessmentRepositoryError",
      code: "DUPLICATE_EMAIL",
    });
  });

  it("commits trust transition, evidence and audit in one transaction", async () => {
    const locked = {
      ...submissionRow(),
      runtime_link_id: "CAL-1",
      runtime_link_title: "Candidate assessment",
      runtime_max_tab_switches: 3,
      runtime_tab_switch_auto_submit: true,
      runtime_is_expired: false,
    };
    const { client, db } = fakeDb(async (sql) => {
      if (sql.includes("FROM candidate_assessment_submissions s")) return { rows: [locked] };
      if (sql.includes("UPDATE candidate_assessment_submissions")) {
        return { rows: [submissionRow({
          trust_score: 85,
          tab_switch_count: 1,
          flags: [{ eventType: "TAB_SWITCH" }],
          proctoring_status: "CLEAN",
          version: 1,
        })] };
      }
      return { rows: [], rowCount: 1 };
    });
    const repository = createCandidateAssessmentsPgRepository(db);
    const result = await repository.recordEvent({
      token: "public-token",
      attemptToken: "attempt-secret",
      event: {
        id: "CPE-1", eventType: "TAB_SWITCH", severity: "high",
        confidence: 1, metadata: {}, createdAt: "2026-11-03T00:01:00.000Z",
      },
    });
    expect(result.submission).toMatchObject({ trustScore: 85, tabSwitchCount: 1 });
    const statements = client.query.mock.calls.map(([sql]) => sql);
    expect(statements.some((sql) => sql.includes("INSERT INTO candidate_proctor_events"))).toBe(true);
    expect(statements.some((sql) => sql.includes("INSERT INTO audit_logs"))).toBe(true);
  });

  it("returns a prior proctor event without applying its penalty twice", async () => {
    const locked = {
      ...submissionRow({ trust_score: 85, tab_switch_count: 1 }),
      runtime_link_id: "CAL-1",
      runtime_max_tab_switches: 3,
      runtime_tab_switch_auto_submit: true,
      runtime_is_expired: false,
    };
    const { client, db } = fakeDb(async (sql) => {
      if (sql.includes("FROM candidate_assessment_submissions s")) return { rows: [locked] };
      if (sql.includes("FROM candidate_proctor_events")) return { rows: [{ id: "CPE-ORIGINAL" }] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createCandidateAssessmentsPgRepository(db);
    const result = await repository.recordEvent({
      token: "public-token",
      attemptToken: "attempt-secret",
      event: {
        id: "CPE-RETRY", clientEventId: "browser-event-1",
        eventType: "TAB_SWITCH", severity: "high", confidence: 1,
        metadata: {}, createdAt: "2026-11-03T00:01:01.000Z",
      },
    });

    expect(result).toMatchObject({
      replayed: true,
      submission: { trustScore: 85, tabSwitchCount: 1 },
    });
    expect(client.query.mock.calls.some(([sql]) =>
      sql.includes("UPDATE candidate_assessment_submissions"))).toBe(false);
    expect(client.query.mock.calls.some(([sql]) =>
      sql.includes("INSERT INTO candidate_proctor_events"))).toBe(false);
  });

  it("atomically closes a session when the tab-switch threshold is reached", async () => {
    const locked = {
      ...submissionRow({ tab_switch_count: 0 }),
      runtime_link_id: "CAL-1",
      runtime_link_title: "Candidate assessment",
      runtime_max_tab_switches: 1,
      runtime_tab_switch_auto_submit: true,
      runtime_is_expired: false,
    };
    let updateCount = 0;
    const { client, db } = fakeDb(async (sql) => {
      if (sql.includes("FROM candidate_assessment_submissions s")) return { rows: [locked] };
      if (sql.includes("UPDATE candidate_assessment_submissions")) {
        updateCount += 1;
        if (updateCount === 1) {
          return { rows: [submissionRow({
            trust_score: 85,
            tab_switch_count: 1,
            flags: [{ eventType: "TAB_SWITCH" }],
            ignored_proctoring: true,
            proctoring_status: "PROCTORING_VIOLATIONS_DETECTED",
            version: 1,
          })] };
        }
        return { rows: [submissionRow({
          status: "Failed",
          submitted_at: new Date("2026-11-03T00:01:00.000Z"),
          trust_score: 85,
          tab_switch_count: 1,
          flags: [{ eventType: "TAB_SWITCH" }],
          passed: false,
          ignored_proctoring: true,
          proctoring_status: "PROCTORING_VIOLATIONS_DETECTED",
          auto_submitted_reason: "PROCTORING_THRESHOLD",
          version: 2,
        })] };
      }
      return { rows: [], rowCount: 1 };
    });
    const repository = createCandidateAssessmentsPgRepository(db);
    const result = await repository.recordEvent({
      token: "public-token",
      attemptToken: "attempt-secret",
      event: {
        id: "CPE-THRESHOLD", eventType: "TAB_SWITCH", severity: "high",
        confidence: 1, metadata: {}, createdAt: "2026-11-03T00:01:00.000Z",
      },
    });

    expect(result).toMatchObject({
      autoSubmitted: true,
      submission: {
        status: "Failed",
        passed: false,
        autoSubmittedReason: "PROCTORING_THRESHOLD",
      },
    });
    expect(updateCount).toBe(2);
    expect(client.query.mock.calls.some(([, params]) =>
      params?.includes("AUTO_SUBMIT_CANDIDATE_ASSESSMENT"))).toBe(true);
  });

  it("durably expires a late submission without accepting answers", async () => {
    const locked = {
      ...submissionRow(),
      runtime_link_id: "CAL-1",
      runtime_pass_score: "70",
      runtime_max_tab_switches: 3,
      runtime_question_snapshot: linkRow().question_snapshot,
      runtime_is_expired: true,
    };
    const { client, db } = fakeDb(async (sql) => {
      if (sql.includes("FROM candidate_assessment_submissions s")) return { rows: [locked] };
      if (sql.includes("UPDATE candidate_assessment_submissions")) {
        return { rows: [submissionRow({
          status: "Expired",
          submitted_at: new Date("2026-11-03T00:31:00.000Z"),
          expired_at: new Date("2026-11-03T00:31:00.000Z"),
          auto_submitted_reason: "TIME_EXPIRED",
          version: 1,
        })] };
      }
      return { rows: [], rowCount: 1 };
    });
    const repository = createCandidateAssessmentsPgRepository(db);
    const evaluate = vi.fn();
    const result = await repository.submit({ token: "public-token", attemptToken: "attempt-secret", evaluate });
    expect(result).toMatchObject({ expired: true, submission: { status: "Expired" } });
    expect(evaluate).not.toHaveBeenCalled();
    expect(client.query.mock.calls.some(([sql]) => sql.includes("EXPIRE_CANDIDATE_SUBMISSION"))).toBe(false);
    expect(client.query.mock.calls.some(([, params]) => params?.includes("EXPIRE_CANDIDATE_SUBMISSION"))).toBe(true);
  });
});
