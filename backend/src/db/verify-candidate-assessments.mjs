import assert from "node:assert/strict";
import crypto from "node:crypto";
import { withTransaction, closePool } from "./pool.js";
import {
  CandidateAssessmentRepositoryError,
  createCandidateAssessmentsPgRepository,
  hashCandidateToken,
} from "../repositories/candidate-assessments.repository.pg.js";
import { evaluateCandidateSubmission } from "../modules/assessments/candidate-assessment.runtime.js";

if (!process.env.DATABASE_URL && !process.env.PGHOST) {
  throw new Error("DATABASE_URL or PGHOST is required for candidate-assessment verification");
}

const suffix = crypto.randomBytes(6).toString("hex");
const ownerId = `VERIFY-CANDIDATE-OWNER-${suffix}`;
const courseId = `VERIFY-CANDIDATE-COURSE-${suffix}`;
const assessmentId = `VERIFY-CANDIDATE-ASSESSMENT-${suffix}`;
const linkId = `VERIFY-CANDIDATE-LINK-${suffix}`;
const token = crypto.randomBytes(32).toString("hex");
const replacementToken = crypto.randomBytes(32).toString("hex");
const attemptToken = crypto.randomBytes(32).toString("hex");
const thresholdAttemptToken = crypto.randomBytes(32).toString("hex");
const lateAttemptToken = crypto.randomBytes(32).toString("hex");
const submissionId = `VERIFY-CANDIDATE-SUBMISSION-${suffix}`;
const thresholdSubmissionId = `VERIFY-CANDIDATE-THRESHOLD-${suffix}`;
const lateSubmissionId = `VERIFY-CANDIDATE-LATE-${suffix}`;
const questions = [{
  id: "VERIFY-CANDIDATE-Q-1",
  prompt: "Select the verified answer",
  type: "MCQ",
  options: ["No", "Yes"],
  answer: 1,
  points: 10,
  category: "Verification",
}];
const checks = [];

const ok = (name, condition) => {
  assert.ok(condition, name);
  checks.push(name);
};

try {
  await withTransaction(async (client) => {
    const db = { query: client.query.bind(client), withTransaction: (fn) => fn(client) };
    const repository = createCandidateAssessmentsPgRepository(db);

    await client.query(
      `INSERT INTO users (id, name, email, role, status)
       VALUES ($1, 'Candidate verifier owner', $2, 'Admin', 'Active')`,
      [ownerId, `${ownerId}@example.invalid`]
    );
    await client.query(
      `INSERT INTO courses (id, title, description, owner_id, status, approval)
       VALUES ($1, 'Candidate runtime verification', 'Synthetic live database check', $2, 'Active', 'Approved')`,
      [courseId, ownerId]
    );
    await client.query(
      `INSERT INTO assessments (
         id, course_id, title, type, duration_minutes, pass_score,
         approval, status, owner_id
       ) VALUES ($1, $2, 'Candidate runtime assessment', 'MCQ', 30, 70, 'Approved', 'Active', $3)`,
      [assessmentId, courseId, ownerId]
    );

    const created = await repository.createLink({
      token,
      questions,
      link: {
        id: linkId,
        assessmentId,
        title: "Candidate runtime assessment",
        courseId,
        courseTitle: "Candidate runtime verification",
        chapterId: null,
        durationMinutes: 30,
        passScore: 70,
        questionLimit: 1,
        proctoringRequired: true,
        fullscreenRequired: true,
        tabSwitchAutoSubmit: false,
        maxTabSwitches: 3,
        expiresAt: null,
        createdBy: ownerId,
        createdByName: "Candidate verifier owner",
        createdAt: new Date().toISOString(),
      },
    });
    const storedToken = await client.query(
      "SELECT token_hash, token_hint FROM candidate_assessment_links WHERE id = $1",
      [linkId]
    );
    ok(
      "link bearer is hashed and cannot be recovered from the database",
      created.token === null
        && storedToken.rows[0]?.token_hash === hashCandidateToken(token)
        && storedToken.rows[0]?.token_hash !== token
    );

    const publicLink = await repository.findPublicByToken(token);
    ok("hashed public lookup resolves the active link", publicLink?.id === linkId && publicLink.isExpired === false);

    const started = await repository.startSubmission({
      token,
      attemptToken,
      graceSeconds: 30,
      submission: {
        id: submissionId,
        candidateName: "Candidate One",
        candidateEmail: "candidate.one@example.invalid",
      },
    });
    ok(
      "candidate start uses database time and immutable question snapshot",
      started.submission.id === submissionId
        && started.submission.status === "In Progress"
        && started.questions[0]?.answer === 1
    );
    const storedAttempt = await client.query(
      "SELECT attempt_token_hash FROM candidate_assessment_submissions WHERE id = $1",
      [submissionId]
    );
    ok(
      "attempt bearer is stored only as a hash",
      storedAttempt.rows[0]?.attempt_token_hash === hashCandidateToken(attemptToken)
        && storedAttempt.rows[0]?.attempt_token_hash !== attemptToken
    );

    await assert.rejects(
      repository.startSubmission({
        token,
        attemptToken: crypto.randomBytes(32).toString("hex"),
        graceSeconds: 30,
        submission: {
          id: `${submissionId}-DUPLICATE`,
          candidateName: "Duplicate Candidate",
          candidateEmail: "CANDIDATE.ONE@example.invalid",
        },
      }),
      (error) => error instanceof CandidateAssessmentRepositoryError && error.code === "DUPLICATE_EMAIL"
    );
    checks.push("case-insensitive one-candidate constraint is atomic");

    const event = await repository.recordEvent({
      token,
      attemptToken,
      event: {
        id: `VERIFY-CANDIDATE-EVENT-${suffix}`,
        clientEventId: `client-event-${suffix}`,
        eventType: "TAB_SWITCH",
        severity: "high",
        confidence: 1,
        metadata: { synthetic: true },
        createdAt: new Date().toISOString(),
      },
    });
    ok(
      "proctor trust transition and evidence commit together",
      event.submission.trustScore === 85 && event.submission.tabSwitchCount === 1
    );
    const eventReplay = await repository.recordEvent({
      token,
      attemptToken,
      event: {
        id: `VERIFY-CANDIDATE-EVENT-RETRY-${suffix}`,
        clientEventId: `client-event-${suffix}`,
        eventType: "TAB_SWITCH",
        severity: "high",
        confidence: 1,
        metadata: { synthetic: true, retry: true },
        createdAt: new Date().toISOString(),
      },
    });
    ok(
      "proctor event retries are idempotent",
      eventReplay.replayed === true
        && eventReplay.submission.trustScore === 85
        && eventReplay.submission.tabSwitchCount === 1
    );

    const submitted = await repository.submit({
      token,
      attemptToken,
      evaluate: ({ submission, questions: snapshot, passScore, maxTabSwitches }) =>
        evaluateCandidateSubmission({
          submission,
          questions: snapshot,
          answers: { "VERIFY-CANDIDATE-Q-1": 1 },
          passScore,
          maxTabSwitches,
        }),
    });
    ok(
      "grading and terminal state commit atomically",
      submitted.submission.status === "Passed"
        && submitted.submission.score === 10
        && submitted.submission.percentage === 100
    );

    await assert.rejects(
      repository.submit({ token, attemptToken, evaluate: () => ({}) }),
      (error) => error instanceof CandidateAssessmentRepositoryError && error.code === "SESSION_CLOSED"
    );
    checks.push("terminal submission replay is rejected");

    await client.query(
      `UPDATE candidate_assessment_links
       SET tab_switch_auto_submit = true, max_tab_switches = 1
       WHERE id = $1`,
      [linkId]
    );
    await repository.startSubmission({
      token,
      attemptToken: thresholdAttemptToken,
      graceSeconds: 30,
      submission: {
        id: thresholdSubmissionId,
        candidateName: "Threshold Candidate",
        candidateEmail: "threshold.candidate@example.invalid",
      },
    });
    const threshold = await repository.recordEvent({
      token,
      attemptToken: thresholdAttemptToken,
      event: {
        id: `VERIFY-CANDIDATE-THRESHOLD-EVENT-${suffix}`,
        clientEventId: `threshold-event-${suffix}`,
        eventType: "TAB_SWITCH",
        severity: "high",
        confidence: 1,
        metadata: { synthetic: true },
        createdAt: new Date().toISOString(),
      },
    });
    ok(
      "tab-switch threshold creates an authoritative terminal failure",
      threshold.autoSubmitted === true
        && threshold.submission.status === "Failed"
        && threshold.submission.passed === false
        && threshold.submission.autoSubmittedReason === "PROCTORING_THRESHOLD"
    );

    await repository.startSubmission({
      token,
      attemptToken: lateAttemptToken,
      graceSeconds: 30,
      submission: {
        id: lateSubmissionId,
        candidateName: "Late Candidate",
        candidateEmail: "late.candidate@example.invalid",
      },
    });
    await client.query(
      "UPDATE candidate_assessment_submissions SET expires_at = now() - interval '1 second' WHERE id = $1",
      [lateSubmissionId]
    );
    const late = await repository.submit({ token, attemptToken: lateAttemptToken, evaluate: () => ({}) });
    ok(
      "database deadline expires late attempts without accepting answers",
      late.expired === true
        && late.submission.status === "Expired"
        && Object.keys(late.submission.answers).length === 0
    );

    await repository.rotateToken({ identifier: linkId, actorId: ownerId, token: replacementToken });
    const previousLink = await repository.findPublicByToken(token);
    const rotatedLink = await repository.findPublicByToken(replacementToken);
    ok(
      "bearer rotation atomically invalidates the previous public link",
      previousLink === null && rotatedLink?.id === linkId
    );

    const auditRows = await client.query(
      `SELECT action FROM audit_logs
       WHERE entity_type = 'CANDIDATE_ASSESSMENT'
         AND entity_id = ANY($1::text[])`,
      [[linkId, submissionId, thresholdSubmissionId, lateSubmissionId]]
    );
    ok(
      "link, session, proctor and grading mutations emit database audit evidence",
      new Set(auditRows.rows.map((row) => row.action)).size >= 5
    );

    await client.query(
      "DELETE FROM audit_logs WHERE entity_type = 'CANDIDATE_ASSESSMENT' AND entity_id = ANY($1::text[])",
      [[linkId, submissionId, thresholdSubmissionId, lateSubmissionId]]
    );
    await client.query("DELETE FROM candidate_assessment_links WHERE id = $1", [linkId]);
    await client.query("DELETE FROM assessments WHERE id = $1", [assessmentId]);
    await client.query("DELETE FROM courses WHERE id = $1", [courseId]);
    await client.query("DELETE FROM users WHERE id = $1", [ownerId]);
  });

  for (const check of checks) console.log(`ok - ${check}`);
  console.log(`Candidate-assessment verification passed (${checks.length} checks).`);
} finally {
  await closePool();
}
