import assert from "node:assert/strict";
import crypto from "node:crypto";
import { withTransaction, closePool } from "./pool.js";
import {
  AttemptRepositoryError,
  createAttemptsRepository,
} from "../repositories/attempts.repository.pg.js";

if (!process.env.DATABASE_URL && !process.env.PGHOST) {
  throw new Error("DATABASE_URL or PGHOST is required for attempt verification");
}

const suffix = crypto.randomBytes(6).toString("hex");
const ownerId = `VERIFY-ATTEMPT-OWNER-${suffix}`;
const learnerId = `VERIFY-ATTEMPT-LEARNER-${suffix}`;
const courseId = `VERIFY-ATTEMPT-COURSE-${suffix}`;
const assessmentId = `VERIFY-ATTEMPT-ASSESSMENT-${suffix}`;
const enrollmentId = `VERIFY-ATTEMPT-ENROLLMENT-${suffix}`;
const attemptId = `VERIFY-ATTEMPT-${suffix}`;
const expiredAttemptId = `VERIFY-ATTEMPT-EXPIRED-${suffix}`;
const checks = [];

const ok = (name, condition) => {
  assert.ok(condition, name);
  checks.push(name);
};

const newAttempt = (id, expiresAt) => ({
  id,
  assessmentId,
  courseId,
  userId: learnerId,
  status: "InProgress",
  score: null,
  maxScore: 10,
  feedback: "",
  answers: {},
  selectedQuestionIds: ["VERIFY-Q-1"],
  questionMap: {
    "VERIFY-Q-1": {
      prompt: "Synthetic verification question",
      type: "MCQ",
      points: 10,
      options: ["A", "B"],
      correctIndex: 1,
    },
  },
  flags: [],
  warnings: [],
  videoChunks: [],
  trustScore: 100,
  expiresAt,
  startedAt: new Date().toISOString(),
  version: 0,
});

try {
  await withTransaction(async (client) => {
    const db = {
      query: client.query.bind(client),
      withTransaction: (fn) => fn(client),
    };
    const repository = createAttemptsRepository(db);

    await client.query(
      `INSERT INTO users (id, name, email, role, status)
       VALUES ($1, 'Attempt verifier owner', $2, 'Instructor', 'Active'),
              ($3, 'Attempt verifier learner', $4, 'Learner', 'Active')`,
      [ownerId, `${ownerId}@example.invalid`, learnerId, `${learnerId}@example.invalid`]
    );
    await client.query(
      `INSERT INTO courses (id, title, description, owner_id, status, approval)
       VALUES ($1, 'Attempt verification course', 'Synthetic live database check', $2, 'Active', 'Approved')`,
      [courseId, ownerId]
    );
    await client.query(
      `INSERT INTO assessments (
         id, course_id, title, type, duration_minutes, pass_score,
         approval, status, owner_id
       ) VALUES ($1, $2, 'Attempt verification assessment', 'MCQ', 30, 70, 'Approved', 'Active', $3)`,
      [assessmentId, courseId, ownerId]
    );
    await client.query(
      `INSERT INTO enrollments (id, course_id, user_id, assigned_by, status)
       VALUES ($1, $2, $3, $4, 'AssessmentEligible')`,
      [enrollmentId, courseId, learnerId, ownerId]
    );

    const created = await repository.insert(newAttempt(
      attemptId,
      new Date(Date.now() + 30 * 60_000).toISOString()
    ));
    ok("attempt and start audit commit", created.id === attemptId && created.version === 0);

    created.answers["VERIFY-Q-1"] = { answer: 1, recordedAt: new Date().toISOString() };
    const answered = await repository.save(created, {
      guard: "answer",
      action: "VERIFY_SAVE_ANSWER",
      metadata: { questionId: "VERIFY-Q-1" },
    });
    ok("answer uses optimistic transition", answered.version === 1 && answered.answers["VERIFY-Q-1"].answer === 1);

    await assert.rejects(
      repository.save({ ...answered, version: 0 }, { expectedVersion: 0 }),
      (error) => error instanceof AttemptRepositoryError && error.code === "ATTEMPT_CONFLICT"
    );
    checks.push("stale version is rejected");

    answered.trustScore = 85;
    const eventResult = await repository.recordProctorEvent({
      attempt: answered,
      expectedVersion: answered.version,
      actorId: learnerId,
      event: {
        id: `VERIFY-EVENT-${suffix}`,
        attemptId,
        userId: learnerId,
        eventType: "FACE_ABSENT",
        severity: "high",
        confidence: 0.95,
        trustScoreAfter: 85,
        metadata: { synthetic: true },
        createdAt: new Date().toISOString(),
      },
    });
    ok("proctor evidence and trust transition commit", eventResult.attempt.version === 2 && eventResult.event.trustScoreAfter === 85);

    const withChunk = await repository.appendVideoChunk({
      attemptId,
      actorId: learnerId,
      chunk: {
        chunkIndex: 0,
        streamRole: "primary",
        key: `verify/${attemptId}/chunk-0.webm`,
        sizeBytes: 128,
        durationSeconds: 10,
        recordedAt: new Date().toISOString(),
      },
    });
    ok("media manifest append is atomic", withChunk.version === 3 && withChunk.videoChunks.length === 1);

    const submitted = {
      ...withChunk,
      status: "Passed",
      score: 100,
      feedback: "Passed",
      submittedAt: new Date().toISOString(),
      timeSpentSeconds: 120,
    };
    const completed = await repository.save(submitted, {
      expectedVersion: submitted.version,
      guard: "submit",
      actorId: learnerId,
      action: "VERIFY_SUBMIT_ATTEMPT",
      enrollment: { status: "Passed", addTimeSeconds: 120, completedAt: new Date().toISOString() },
    });
    const enrollment = await client.query(
      "SELECT status, time_spent_seconds, assessment_time_spent_seconds FROM enrollments WHERE id = $1",
      [enrollmentId]
    );
    ok(
      "attempt and enrollment complete atomically",
      completed.status === "Passed"
        && enrollment.rows[0]?.status === "Passed"
        && enrollment.rows[0]?.time_spent_seconds === 120
        && enrollment.rows[0]?.assessment_time_spent_seconds === 120
    );

    const expired = await repository.insert(newAttempt(
      expiredAttemptId,
      new Date(Date.now() - 60_000).toISOString()
    ));
    expired.answers["VERIFY-Q-1"] = { answer: 1, recordedAt: new Date().toISOString() };
    await assert.rejects(
      repository.save(expired, { guard: "answer", action: "VERIFY_EXPIRED_ANSWER" }),
      (error) => error instanceof AttemptRepositoryError && error.code === "ATTEMPT_CLOSED"
    );
    checks.push("database clock rejects expired answer");

    const auditRows = await client.query(
      "SELECT count(*)::integer AS count FROM audit_logs WHERE entity_id = ANY($1::text[])",
      [[attemptId, expiredAttemptId]]
    );
    ok("attempt mutations emit database audit evidence", auditRows.rows[0]?.count >= 5);

    await client.query("DELETE FROM audit_logs WHERE entity_id = ANY($1::text[])", [[attemptId, expiredAttemptId]]);
    await client.query("DELETE FROM assessment_attempts WHERE id = ANY($1::text[])", [[attemptId, expiredAttemptId]]);
    await client.query("DELETE FROM enrollments WHERE id = $1", [enrollmentId]);
    await client.query("DELETE FROM assessments WHERE id = $1", [assessmentId]);
    await client.query("DELETE FROM courses WHERE id = $1", [courseId]);
    await client.query("DELETE FROM users WHERE id = ANY($1::text[])", [[ownerId, learnerId]]);
  });

  for (const check of checks) console.log(`ok - ${check}`);
  console.log(`Assessment-attempt verification passed (${checks.length} checks).`);
} finally {
  await closePool();
}
