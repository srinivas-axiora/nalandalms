import assert from "node:assert/strict";
import { closePool, query, withTransaction } from "./pool.js";
import { courseAuthorityRepository } from "../repositories/courses-authority.repository.pg.js";
import { assessmentAuthorityRepository } from "../repositories/assessment-authority.repository.pg.js";
import { workplaceRepository } from "../repositories/workplace.repository.pg.js";
import { reportsRepository } from "../repositories/reports.repository.pg.js";
import { buildBlindExamAttempt } from "../modules/assessments/exam.service.js";

if (!process.env.DATABASE_URL && !process.env.PGHOST) {
  throw new Error("DATABASE_URL or PGHOST is required for multi-task verification");
}

const [mode, rawRunId] = process.argv.slice(2);
if (!new Set(["setup", "worker", "assert", "cleanup"]).has(mode)) {
  throw new Error("Usage: verify-multi-task.mjs <setup|worker|assert|cleanup> <run-id>");
}
if (!/^[A-Za-z0-9-]{8,80}$/.test(rawRunId || "")) {
  throw new Error("The multi-task verification run ID is invalid");
}

const runId = rawRunId;
const prefix = `VERIFY-MT-${runId}`;
const ids = {
  owner: `${prefix}-OWNER`,
  learner: `${prefix}-LEARNER`,
  course: `${prefix}-COURSE`,
  chapter: `${prefix}-CHAPTER`,
  assessment: `${prefix}-ASSESSMENT`,
};
const entityType = "VERIFY_MULTI_TASK";
const workerCount = 2;
const barrierTimeoutMs = 90_000;

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const actionFor = (stage) => `VERIFY_MULTI_TASK_${stage}`;

const taskIdentity = async () => {
  if (process.env.VERIFY_MULTI_TASK_WORKER_ID) {
    return String(process.env.VERIFY_MULTI_TASK_WORKER_ID).slice(-64);
  }
  const metadataUri = process.env.ECS_CONTAINER_METADATA_URI_V4;
  if (metadataUri) {
    try {
      const response = await fetch(`${metadataUri}/task`, { signal: AbortSignal.timeout(5_000) });
      if (response.ok) {
        const metadata = await response.json();
        const taskArn = String(metadata.TaskARN || "");
        if (taskArn) return taskArn.split("/").at(-1).slice(-64);
      }
    } catch { /* fail closed below */ }
  }
  throw new Error("ECS task identity is unavailable; refusing an ambiguous multi-task result");
};

const writeEvidence = async ({ stage, workerId, outcome, details = {} }) => {
  const action = actionFor(stage);
  const ingestKey = `verify-multi-task:${runId}:${stage}:${workerId}`;
  await query(
    `INSERT INTO audit_logs (
       actor_id, action, entity_type, entity_id, metadata, ingest_key
     ) VALUES ($1, $2, $3, $4, $5::jsonb, $6)
     ON CONFLICT (ingest_key) WHERE ingest_key IS NOT NULL DO NOTHING`,
    [
      ids.owner,
      action,
      entityType,
      runId,
      JSON.stringify({ workerId, stage, outcome, ...details }),
      ingestKey,
    ]
  );
};

const barrier = async (stage, workerId) => {
  await writeEvidence({ stage: `${stage}_READY`, workerId, outcome: "ready" });
  const action = actionFor(`${stage}_READY`);
  const deadline = Date.now() + barrierTimeoutMs;
  while (Date.now() < deadline) {
    const result = await query(
      `SELECT count(DISTINCT metadata->>'workerId')::integer AS count
       FROM audit_logs
       WHERE entity_type = $1 AND entity_id = $2 AND action = $3`,
      [entityType, runId, action]
    );
    if (Number(result.rows[0]?.count || 0) >= workerCount) return;
    await delay(500);
  }
  throw new Error(`Timed out waiting for the ${stage} cross-task barrier`);
};

const cleanup = async () => {
  await withTransaction(async (client) => {
    await client.query(
      `DELETE FROM audit_logs
       WHERE (entity_type = $1 AND entity_id = $2)
          OR actor_id = ANY($3::text[])
          OR entity_id = ANY($4::text[])`,
      [entityType, runId, [ids.owner, ids.learner], Object.values(ids)]
    );
    await client.query("DELETE FROM report_exports WHERE filters->>'verificationRunId' = $1", [runId]);
    await client.query("DELETE FROM assessment_attempts WHERE course_id = $1", [ids.course]);
    await client.query("DELETE FROM attendance_records WHERE user_id = $1", [ids.learner]);
    await client.query("DELETE FROM enrollments WHERE course_id = $1", [ids.course]);
    await client.query("DELETE FROM assessments WHERE id = $1", [ids.assessment]);
    await client.query("DELETE FROM chapters WHERE id = $1", [ids.chapter]);
    await client.query("DELETE FROM course_versions WHERE course_id = $1", [ids.course]);
    await client.query("DELETE FROM courses WHERE id = $1", [ids.course]);
    await client.query("DELETE FROM users WHERE id = ANY($1::text[])", [[ids.learner, ids.owner]]);
  });
};

const setup = async () => {
  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO users (id, name, email, role, status)
       VALUES
         ($1, 'Multi-task verifier owner', $2, 'Manager', 'Active'),
         ($3, 'Multi-task verifier learner', $4, 'Learner', 'Active')`,
      [
        ids.owner, `${ids.owner.toLowerCase()}@example.invalid`,
        ids.learner, `${ids.learner.toLowerCase()}@example.invalid`,
      ]
    );
    await client.query(
      `INSERT INTO courses (
         id, title, description, skill, status, approval, owner_id, current_version
       ) VALUES ($1, 'Multi-task concurrency verification',
         'Synthetic cross-task invariant verification', 'Security',
         'Active', 'Approved', $2, 1)`,
      [ids.course, ids.owner]
    );
    await client.query(
      `INSERT INTO course_versions (
         course_id, version, title, description, change_note, created_by
       ) VALUES ($1, 1, 'Multi-task concurrency verification',
         'Synthetic cross-task invariant verification', 'Canary setup', $2)`,
      [ids.course, ids.owner]
    );
    await client.query(
      `INSERT INTO chapters (
         id, course_id, sequence, title, minimum_time_minutes, version
       ) VALUES ($1, $2, 1, 'Concurrency chapter', 0, 1)`,
      [ids.chapter, ids.course]
    );
    await client.query(
      `INSERT INTO assessments (
         id, course_id, chapter_id, title, type, strict_mode, duration_minutes,
         pass_score, question_limit, difficulty, approval, status, owner_id, version
       ) VALUES ($1, $2, $3, 'Concurrency assessment', 'Mixed', false, 15,
         70, 1, 'Advanced', 'Approved', 'Active', $4, 1)`,
      [ids.assessment, ids.course, ids.chapter, ids.owner]
    );
    await client.query(
      `INSERT INTO questions (
         assessment_id, question_type, prompt, options, correct_answer, points, sort_order
       ) VALUES ($1, 'MCQ', 'Which database invariant prevents duplicate active attempts?',
         '["A unique partial index","A browser mutex"]'::jsonb, '0'::jsonb, 10, 1)`,
      [ids.assessment]
    );
    await client.query(
      `INSERT INTO assessment_versions (
         assessment_id, version, snapshot, change_note, created_by
       ) VALUES ($1, 1, $2::jsonb, 'Canary setup', $3)`,
      [ids.assessment, JSON.stringify({ id: ids.assessment, courseId: ids.course }), ids.owner]
    );
    await client.query(
      `INSERT INTO report_exports (
         requested_by, report_type, format, filters, status, row_count, summary
       ) VALUES ($1, 'Course', 'PDF', $2::jsonb, 'Prepared', 0, '{}'::jsonb)`,
      [ids.owner, JSON.stringify({ verificationRunId: runId })]
    );
  });
  console.log(`Multi-task fixture prepared: ${runId}`);
};

const worker = async () => {
  const workerId = await taskIdentity();

  await barrier("ENROLLMENT", workerId);
  const enrollment = await courseAuthorityRepository.selfEnroll({
    enrollmentId: `${prefix}-ENROLLMENT-${workerId.slice(-12)}`,
    courseId: ids.course,
    userId: ids.learner,
  });
  await writeEvidence({
    stage: "ENROLLMENT_RESULT",
    workerId,
    outcome: enrollment.created ? "created" : "existing",
    details: { enrollmentId: enrollment.enrollment.id },
  });

  await barrier("ASSESSMENT_ELIGIBILITY", workerId);
  await query(
    `UPDATE enrollments SET completed_chapters = ARRAY[$3]::text[],
       progress = 100, status = 'AssessmentEligible', version = version + 1
     WHERE course_id = $1 AND user_id = $2`,
    [ids.course, ids.learner, ids.chapter]
  );

  await barrier("ATTENDANCE", workerId);
  const attendance = await workplaceRepository.clockIn({
    id: `${prefix}-ATTENDANCE-${workerId.slice(-12)}`,
    userId: ids.learner,
  });
  await writeEvidence({
    stage: "ATTENDANCE_RESULT",
    workerId,
    outcome: attendance.created ? "created" : "existing",
    details: { attendanceId: attendance.record.id },
  });

  await barrier("ATTEMPT", workerId);
  let attemptOutcome = "conflict";
  let attemptId = null;
  try {
    const started = await assessmentAuthorityRepository.startAttempt({
      assessmentId: ids.assessment,
      actor: { id: ids.learner, role: "Learner" },
      buildAttempt: (assessment) => buildBlindExamAttempt({
        assessment,
        userId: ids.learner,
        persistSideEffects: false,
      }),
    });
    attemptOutcome = "created";
    attemptId = started.attempt.id;
  } catch (error) {
    if (error?.code !== "ATTEMPT_CONFLICT") throw error;
  }
  await writeEvidence({
    stage: "ATTEMPT_RESULT",
    workerId,
    outcome: attemptOutcome,
    details: { attemptId },
  });

  await barrier("REPORT_CLAIM", workerId);
  const reportResult = await query(
    "SELECT id FROM report_exports WHERE filters->>'verificationRunId' = $1",
    [runId]
  );
  const reportId = reportResult.rows[0]?.id;
  assert.ok(reportId, "Synthetic report is missing");
  const report = await reportsRepository.claimDue({ reportId });
  await writeEvidence({
    stage: "REPORT_CLAIM_RESULT",
    workerId,
    outcome: report ? "claimed" : "no_work",
    details: { reportId: String(reportId) },
  });

  await barrier("COURSE_UPDATE", workerId);
  let updateOutcome = "conflict";
  try {
    await courseAuthorityRepository.updateCourse({
      id: ids.course,
      actor: { id: ids.owner, role: "Manager" },
      expectedVersion: 1,
      updates: { description: `Updated by cross-task worker ${workerId}` },
    });
    updateOutcome = "updated";
  } catch (error) {
    if (error?.code !== "VERSION_CONFLICT") throw error;
  }
  await writeEvidence({
    stage: "COURSE_UPDATE_RESULT",
    workerId,
    outcome: updateOutcome,
  });

  console.log(`Multi-task worker completed: ${workerId}`);
};

const assertResults = async () => {
  const checks = [];
  const ok = (name, condition) => {
    assert.ok(condition, name);
    checks.push(name);
  };
  try {
    const evidence = await query(
      `SELECT action, metadata FROM audit_logs
       WHERE entity_type = $1 AND entity_id = $2
       ORDER BY created_at, id`,
      [entityType, runId]
    );
    const resultsFor = (stage) => evidence.rows
      .filter((row) => row.action === actionFor(`${stage}_RESULT`))
      .map((row) => row.metadata);
    const assertTwoWorkers = (stage, expectedOutcomes) => {
      const rows = resultsFor(stage);
      ok(`${stage} has one result from each ECS task`, rows.length === 2
        && new Set(rows.map((row) => row.workerId)).size === 2);
      ok(`${stage} preserved the expected race outcomes`,
        JSON.stringify(rows.map((row) => row.outcome).sort()) === JSON.stringify([...expectedOutcomes].sort()));
      return rows;
    };

    const enrollmentRows = assertTwoWorkers("ENROLLMENT", ["created", "existing"]);
    ok("both tasks resolved the same enrollment", new Set(enrollmentRows.map((row) => row.enrollmentId)).size === 1);
    assertTwoWorkers("ATTENDANCE", ["created", "existing"]);
    assertTwoWorkers("ATTEMPT", ["created", "conflict"]);
    assertTwoWorkers("REPORT_CLAIM", ["claimed", "no_work"]);
    assertTwoWorkers("COURSE_UPDATE", ["updated", "conflict"]);

    const state = await query(
      `SELECT
         (SELECT count(*) FROM enrollments WHERE course_id = $1 AND user_id = $2)::integer AS enrollments,
         (SELECT count(*) FROM attendance_records WHERE user_id = $2)::integer AS attendance,
         (SELECT count(*) FROM assessment_attempts
            WHERE assessment_id = $3 AND user_id = $2
              AND status IN ('InProgress', 'Paused'))::integer AS active_attempts,
         (SELECT count(*) FROM report_exports
            WHERE filters->>'verificationRunId' = $4
              AND status = 'Processing' AND attempts = 1)::integer AS claimed_reports,
         (SELECT current_version FROM courses WHERE id = $1)::integer AS course_version,
         (SELECT count(*) FROM audit_logs
            WHERE actor_id = $2 AND action = 'SELF_ENROLL' AND entity_id = $1)::integer AS enrollment_audits,
         (SELECT count(*) FROM audit_logs
            WHERE actor_id = $2 AND action = 'ATTENDANCE_CLOCK_IN')::integer AS attendance_audits,
         (SELECT count(*) FROM audit_logs
            WHERE actor_id = $2 AND action = 'START_BLIND_EXAM')::integer AS attempt_audits,
         (SELECT count(*) FROM audit_logs
            WHERE actor_id = $5 AND action = 'UPDATE_COURSE' AND entity_id = $1)::integer AS update_audits`,
      [ids.course, ids.learner, ids.assessment, runId, ids.owner]
    );
    const row = state.rows[0] || {};
    ok("database uniqueness retained one enrollment", Number(row.enrollments) === 1);
    ok("database uniqueness retained one daily attendance row", Number(row.attendance) === 1);
    ok("database uniqueness retained one active assessment attempt", Number(row.active_attempts) === 1);
    ok("SKIP LOCKED allowed one report claim", Number(row.claimed_reports) === 1);
    ok("optimistic course version advanced exactly once", Number(row.course_version) === 2);
    ok("winning enrollment transition has one audit record", Number(row.enrollment_audits) === 1);
    ok("winning attendance transition has one audit record", Number(row.attendance_audits) === 1);
    ok("winning attempt transition has one audit record", Number(row.attempt_audits) === 1);
    ok("winning course update has one audit record", Number(row.update_audits) === 1);

    for (const check of checks) console.log(`ok - ${check}`);
    console.log(`Multi-task concurrency verification passed (${checks.length} checks).`);
  } finally {
    await cleanup();
  }
};

try {
  if (mode === "setup") await setup();
  if (mode === "worker") await worker();
  if (mode === "assert") await assertResults();
  if (mode === "cleanup") {
    await cleanup();
    console.log(`Multi-task fixture removed: ${runId}`);
  }
} finally {
  await closePool();
}
