import assert from "node:assert/strict";
import crypto from "node:crypto";
import { closePool, withTransaction } from "./pool.js";
import { createAssessmentAuthorityRepository } from "../repositories/assessment-authority.repository.pg.js";
import { buildBlindExamAttempt } from "../modules/assessments/exam.service.js";

if (!process.env.DATABASE_URL && !process.env.PGHOST) {
  throw new Error("DATABASE_URL or PGHOST is required for assessment authority verification");
}

const suffix = crypto.randomBytes(6).toString("hex");
const adminId = `VERIFY-ASSESSMENT-ADMIN-${suffix}`;
const ownerId = `VERIFY-ASSESSMENT-OWNER-${suffix}`;
const learnerId = `VERIFY-ASSESSMENT-LEARNER-${suffix}`;
const courseId = `VERIFY-ASSESSMENT-COURSE-${suffix}`;
const chapterId = `VERIFY-ASSESSMENT-CHAPTER-${suffix}`;
const assessmentId = `VERIFY-ASSESSMENT-${suffix}`;
const enrollmentId = `VERIFY-ASSESSMENT-ENROLLMENT-${suffix}`;
const checks = [];
const ok = (name, condition) => {
  assert.ok(condition, name);
  checks.push(name);
};

try {
  await withTransaction(async (client) => {
    const db = { query: client.query.bind(client), withTransaction: (fn) => fn(client) };
    const repository = createAssessmentAuthorityRepository(db);
    await client.query(
      `INSERT INTO users (id, name, email, role, status)
       VALUES
         ($1, 'Assessment verifier admin', $2, 'Admin', 'Active'),
         ($3, 'Assessment verifier owner', $4, 'Manager', 'Active'),
         ($5, 'Assessment verifier learner', $6, 'Learner', 'Active')`,
      [
        adminId, `${adminId}@example.invalid`,
        ownerId, `${ownerId}@example.invalid`,
        learnerId, `${learnerId}@example.invalid`,
      ]
    );
    await client.query(
      `INSERT INTO courses (
         id, title, description, skill, status, approval, owner_id, current_version
       ) VALUES ($1, 'Assessment authority verification',
         'Synthetic transactional assessment verification course', 'Security',
         'Active', 'Approved', $2, 1)`,
      [courseId, ownerId]
    );
    await client.query(
      `INSERT INTO chapters (
         id, course_id, sequence, title, minimum_time_minutes, version
       ) VALUES ($1, $2, 1, 'Eligibility chapter', 0, 1)`,
      [chapterId, courseId]
    );

    const owner = { id: ownerId, name: "Assessment verifier owner", role: "Manager" };
    const admin = { id: adminId, name: "Assessment verifier admin", role: "Admin" };
    const created = await repository.createAssessment({
      actor: owner,
      expectedCourseVersion: 1,
      assessment: {
        id: assessmentId,
        courseId,
        chapterId,
        title: "Transactional assessment verification",
        type: "Mixed",
        strictMode: true,
        durationMinutes: 30,
        passScore: 70,
        questionLimit: 2,
        difficulty: "Advanced",
        questions: [
          {
            type: "MCQ",
            prompt: "Which control prevents duplicate retry processing?",
            options: ["Idempotency key", "Browser cache"],
            answer: 0,
            points: 10,
            explanation: "A stable key deduplicates the operation.",
          },
          {
            type: "Descriptive",
            prompt: "Explain the transaction boundary used by this workflow.",
            options: [],
            points: 10,
            rubric: { required: ["assessment", "attempt", "audit"] },
          },
        ],
      },
    });
    ok(
      "manager creation is pending and versions the course",
      created.assessment.approval === "Pending"
        && created.assessment.version === 1
        && created.courseVersion === 2
    );

    const reviewed = await repository.reviewAssessment({
      id: assessmentId,
      actor: admin,
      expectedCourseVersion: 2,
      expectedAssessmentVersion: 1,
      approval: "Approved",
      feedback: "Synthetic assessment review completed",
    });
    ok(
      "administrator review versions assessment and course",
      reviewed.assessment.approval === "Approved"
        && reviewed.assessment.version === 2
        && reviewed.courseVersion === 3
    );

    await client.query(
      `INSERT INTO enrollments (id, course_id, user_id, assigned_by)
       VALUES ($1, $2, $3, $3)`,
      [enrollmentId, courseId, learnerId]
    );
    await assert.rejects(
      repository.startAttempt({
        assessmentId,
        actor: { id: learnerId, role: "Learner" },
        buildAttempt: (assessment) => buildBlindExamAttempt({ assessment, userId: learnerId, persistSideEffects: false }),
      }),
      (error) => error?.code === "CHAPTERS_INCOMPLETE"
    );
    checks.push("incomplete relational enrollment cannot start an attempt");

    await client.query(
      `UPDATE enrollments SET completed_chapters = ARRAY[$3]::text[],
         progress = 100, status = 'AssessmentEligible', version = version + 1
       WHERE course_id = $1 AND user_id = $2`,
      [courseId, learnerId, chapterId]
    );
    const started = await repository.startAttempt({
      assessmentId,
      actor: { id: learnerId, role: "Learner" },
      buildAttempt: (assessment) => buildBlindExamAttempt({ assessment, userId: learnerId, persistSideEffects: false }),
    });
    ok(
      "eligible attempt is created from relational questions without answer disclosure",
      started.attempt.status === "InProgress"
        && started.attempt.selectedQuestionIds.length === 2
        && started.attempt.assessmentVersion === 2
        && started.attempt.durationMinutesSnapshot === 30
        && started.attempt.passScoreSnapshot === 70
        && Object.values(started.attempt.questionMap).every((question) => question.correctIndex !== undefined || question.type === "Descriptive")
    );

    await assert.rejects(
      repository.startAttempt({
        assessmentId,
        actor: { id: learnerId, role: "Learner" },
        buildAttempt: (assessment) => buildBlindExamAttempt({ assessment, userId: learnerId, persistSideEffects: false }),
      }),
      (error) => error?.code === "ATTEMPT_CONFLICT"
    );
    checks.push("one active attempt invariant rejects concurrent retry");

    await assert.rejects(
      repository.archiveAndDelete({
        id: assessmentId,
        actor: owner,
        expectedCourseVersion: 3,
        expectedAssessmentVersion: 2,
        deletionComment: "Synthetic retained-history verification",
      }),
      (error) => error?.code === "ASSESSMENT_HAS_HISTORY"
    );
    checks.push("attempt history blocks assessment deletion");

    const versions = await client.query(
      "SELECT count(*)::integer AS count FROM assessment_versions WHERE assessment_id = $1",
      [assessmentId]
    );
    ok("immutable assessment versions survive authoring changes", Number(versions.rows[0].count) === 2);

    await client.query("DELETE FROM audit_logs WHERE entity_type = 'ASSESSMENT_ATTEMPT' AND entity_id = $1", [started.attempt.id]);
    await client.query("DELETE FROM assessment_attempts WHERE id = $1", [started.attempt.id]);
    const deleted = await repository.archiveAndDelete({
      id: assessmentId,
      actor: owner,
      expectedCourseVersion: 3,
      expectedAssessmentVersion: 2,
      deletionComment: "Synthetic safe assessment deletion verification",
    });
    ok("history-free assessment is archived before deletion", deleted.deleted === true && deleted.courseVersion === 4);

    const evidence = await client.query(
      `SELECT
         (SELECT count(*) FROM assessments WHERE id = $1)::integer AS assessments,
         (SELECT count(*) FROM deleted_archives
          WHERE entity_type = 'Assessment' AND entity_id = $1)::integer AS archives,
         (SELECT count(*) FROM audit_logs
          WHERE entity_type = 'ASSESSMENT' AND entity_id = $1)::integer AS audits`,
      [assessmentId]
    );
    ok(
      "archive and audit evidence survive assessment deletion",
      Number(evidence.rows[0].assessments) === 0
        && Number(evidence.rows[0].archives) === 1
        && Number(evidence.rows[0].audits) >= 1
    );

    await client.query("DELETE FROM deleted_archives WHERE entity_type = 'Assessment' AND entity_id = $1", [assessmentId]);
    await client.query("DELETE FROM audit_logs WHERE entity_type = 'ASSESSMENT' AND entity_id = $1", [assessmentId]);
    await client.query("DELETE FROM enrollments WHERE id = $1", [enrollmentId]);
    await client.query("DELETE FROM course_versions WHERE course_id = $1", [courseId]);
    await client.query("DELETE FROM courses WHERE id = $1", [courseId]);
    await client.query("DELETE FROM users WHERE id = ANY($1::text[])", [[learnerId, ownerId, adminId]]);
  });

  for (const check of checks) console.log(`ok - ${check}`);
  console.log(`Assessment authority verification passed (${checks.length} checks).`);
} finally {
  await closePool();
}
