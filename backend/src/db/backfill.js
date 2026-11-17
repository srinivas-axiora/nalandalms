// Backfill tool: copies existing data into normalized PostgreSQL relational tables.
// Idempotent (upsert on ID). Run AFTER migrations:
//   node backend/src/db/migrate.js && node backend/src/db/backfill.js
import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { query, closePool, withTransaction } from "./pool.js";
import { hashCandidateToken } from "../repositories/candidate-assessments.repository.pg.js";
import { redactAuditMetadata, redactSensitive } from "../security/redaction.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_JSON = path.resolve(__dirname, "..", "..", "..", "database", "db.json");

const normalizeLegacyTime = (value) => {
  const candidate = String(value || "").trim();
  const match = candidate.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = Number(match[3] || 0);
  if (minute > 59 || second > 59) return null;
  const meridiem = match[4]?.toUpperCase();
  if (meridiem) {
    if (hour < 1 || hour > 12) return null;
    if (meridiem === "AM") hour %= 12;
    else hour = (hour % 12) + 12;
  } else if (hour > 23) return null;
  return [hour, minute, second].map((part) => String(part).padStart(2, "0")).join(":");
};

const normalizeLegacyDate = (value) => {
  const candidate = String(value || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(candidate)) return null;
  const [year, month, day] = candidate.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day ? candidate : null;
};

async function loadSource() {
  if (process.env.DATABASE_URL || process.env.PGHOST) {
    const sentinel = await query("SELECT to_regclass('public.app_state') AS table_name");
    if (sentinel.rows[0]?.table_name) {
      const { rows } = await query("SELECT collection, data FROM app_state");
      if (rows.length) {
        return {
          data: Object.fromEntries(rows.map((row) => [row.collection, row.data])),
          source: "PostgreSQL app_state snapshot",
        };
      }
    }
  }
  if (fs.existsSync(DB_JSON)) {
    const data = JSON.parse(fs.readFileSync(DB_JSON, "utf8"));
    return { data, source: "database/db.json" };
  }
  const core = await import("../core.js");
  return {
    data: {
      users: core.users || [],
      skills: core.skills || [],
      targetSkills: core.targetSkills || [],
      courses: core.courses || [],
      chapters: core.chapters || [],
      assessments: core.assessments || [],
      assignments: core.assignments || [],
      cohorts: core.cohorts || [],
      attempts: core.attempts || [],
      proctoringLogs: core.proctoringLogs || [],
      acharyaFeedbackMemory: core.acharyaFeedbackMemory || [],
      skillRatings: core.skillRatings || [],
      chapterFeedbacks: core.chapterFeedbacks || [],
      settings: core.settings || {},
      issuedCertificates: core.issuedCertificates || [],
      candidateAssessments: core.candidateAssessments || [],
      auditLogs: core.auditLogs || [],
      securityEvents: core.securityEvents || [],
      archives: core.archives || [],
      attendanceLogs: core.attendanceLogs || [],
      performanceReviews: core.performanceReviews || [],
      communications: core.communications || [],
    },
    source: "in-memory seed",
  };
}

export async function backfill() {
  const { data, source } = await loadSource();
  console.log(`[backfill] Loading data from ${source}...`);

  await withTransaction(async (client) => {
    // 1. Users & Departments
    const users = data.users || [];
    const userIds = new Set(users.map((user) => user.id));
    console.log(`[backfill] Upserting ${users.length} users...`);
    for (const u of users) {
      let deptId = null;
      if (u.department) {
        const dRes = await client.query(
          "INSERT INTO departments (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id",
          [u.department]
        );
        deptId = dRes.rows[0]?.id;
      }
      await client.query(
        `INSERT INTO users (
           id, name, email, password_hash, role, department_id,
           team, designation, manager_id, status, session_version, preferences,
           joined_at, created_at, updated_at
         ) VALUES (
           $1, $2, $3, $4, $5::user_role, $6,
           $7, $8, $9, $10::lifecycle_status, $11, $12::jsonb,
           $13::date, COALESCE($14::timestamptz, now()), now()
         ) ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, email = EXCLUDED.email,
           password_hash = EXCLUDED.password_hash, role = EXCLUDED.role,
           department_id = EXCLUDED.department_id, team = EXCLUDED.team,
           designation = EXCLUDED.designation, manager_id = EXCLUDED.manager_id,
           status = EXCLUDED.status,
           session_version = GREATEST(users.session_version, EXCLUDED.session_version),
           preferences = EXCLUDED.preferences,
           joined_at = EXCLUDED.joined_at`,
        [
          u.id, u.name, u.email, u.passwordHash || null, u.role || "Employee", deptId,
          u.team || "Unassigned", u.designation || "Employee", null,
          u.status || "Active", u.sessionVersion || 0,
          JSON.stringify(u.preferences || {}), u.joinedAt || null, u.createdAt || null,
        ]
      );
    }
    for (const u of users) {
      if (u.managerId) {
        await client.query("UPDATE users SET manager_id = $2 WHERE id = $1", [u.id, u.managerId]);
      }
    }

    // 1b. Legacy deletion archives. The source key makes repeated backfills
    // idempotent without trusting process-local archive identifiers as UUIDs.
    const archives = data.archives || [];
    console.log(`[backfill] Upserting ${archives.length} deletion archives...`);
    for (const archive of archives) {
      if (!["User", "Course", "Assessment"].includes(archive.entityType)) continue;
      const deletedBy = userIds.has(archive.deletedBy) ? archive.deletedBy : users[0]?.id;
      if (!deletedBy) continue;
      const sourceKey = crypto.createHash("sha256").update(String(
        archive.id || `${archive.entityType}:${archive.entityId}:${archive.deletedAt || "legacy"}`
      )).digest("hex");
      const deletionComment = String(archive.deletionComment || "Imported legacy deletion archive").trim();
      const entityData = archive.entityData && typeof archive.entityData === "object"
        && !Array.isArray(archive.entityData) ? archive.entityData : {};
      const relatedData = archive.relatedData && typeof archive.relatedData === "object"
        && !Array.isArray(archive.relatedData) ? archive.relatedData : {};
      await client.query(
        `INSERT INTO deleted_archives (
           entity_type, entity_id, entity_data, related_data, deleted_by,
           deleted_by_name, deletion_comment, deleted_at, source_key
         ) VALUES (
           $1, $2, $3::jsonb, $4::jsonb, $5,
           $6, $7, COALESCE($8::timestamptz, now()), $9
         ) ON CONFLICT (source_key) WHERE source_key IS NOT NULL DO NOTHING`,
        [archive.entityType, String(archive.entityId),
          JSON.stringify(redactSensitive(entityData)),
          JSON.stringify(redactSensitive(relatedData)), deletedBy,
          String(archive.deletedByName || "").slice(0, 300),
          (deletionComment.length >= 10 ? deletionComment : "Imported legacy archive").slice(0, 5000),
          archive.deletedAt || null, sourceKey]
      );
    }

    // 2. Skills & Target Skills
    const VALID_SKILL_CATEGORIES = new Set(["Technical", "Functional", "Leadership", "Compliance", "Behavioral"]);
    const normalizeSkillCategory = (cat) => {
      if (VALID_SKILL_CATEGORIES.has(cat)) return cat;
      const lower = String(cat || "").toLowerCase();
      if (lower.includes("compliance") || lower.includes("payroll")) return "Compliance";
      if (lower.includes("lead") || lower.includes("manage")) return "Leadership";
      if (lower.includes("behavior") || lower.includes("soft") || lower.includes("comm")) return "Behavioral";
      if (lower.includes("function") || lower.includes("business") || lower.includes("resource") || lower.includes("sales") || lower.includes("operation") || lower.includes("marketing")) return "Functional";
      return "Technical";
    };

    const skills = data.skills || [];
    console.log(`[backfill] Upserting ${skills.length} skills...`);
    for (const s of skills) {
      await client.query(
        `INSERT INTO skills (id, name, category, description, status, created_at)
         VALUES ($1, $2, $3, $4, $5, COALESCE($6::timestamptz, now()))
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, category = EXCLUDED.category,
           description = EXCLUDED.description, status = EXCLUDED.status`,
        [s.id, s.name, normalizeSkillCategory(s.category), s.description || "", s.status || "Active", s.createdAt || null]
      );
    }
    const targetSkills = data.targetSkills || [];
    console.log(`[backfill] Upserting ${targetSkills.length} target skills...`);
    for (const target of targetSkills) {
      await client.query(
        `INSERT INTO target_skills (
           id, skill_id, scope, department, designation, user_id,
           target_level, target_score, priority, created_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10::timestamptz, now()))
         ON CONFLICT (id) DO UPDATE SET
           skill_id = EXCLUDED.skill_id, scope = EXCLUDED.scope,
           department = EXCLUDED.department, designation = EXCLUDED.designation,
           user_id = EXCLUDED.user_id, target_level = EXCLUDED.target_level,
           target_score = EXCLUDED.target_score, priority = EXCLUDED.priority`,
        [
          target.id, target.skillId, target.scope, target.department || null,
          target.designation || null, target.userId || null,
          target.targetLevel || "Intermediate", target.targetScore ?? 80,
          target.priority || "Medium", target.createdAt || null,
        ]
      );
    }

    // 3. Courses
    const courses = data.courses || [];
    console.log(`[backfill] Upserting ${courses.length} courses...`);
    for (const c of courses) {
      await client.query(
        `INSERT INTO courses (
           id, title, description, skill, skill_ids, target_level, difficulty,
           estimated_hours, price_cents, currency, category, prerequisites, tags, thumbnail_color,
           content_types, storage_metadata, status, approval, owner_id,
           current_version, created_at, updated_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7,
           $8, $9, $10, $11, $12, $13, $14,
           $15, $16::jsonb, $17::lifecycle_status, $18::approval_status, $19,
           $20, COALESCE($21::timestamptz, now()), now()
         ) ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title, description = EXCLUDED.description,
           skill = EXCLUDED.skill, price_cents = EXCLUDED.price_cents,
           currency = EXCLUDED.currency, status = EXCLUDED.status,
           approval = EXCLUDED.approval,
           content_types = EXCLUDED.content_types,
           storage_metadata = EXCLUDED.storage_metadata`,
        [
          c.id, c.title, c.description, c.skill || "", c.skillIds || [],
          c.targetLevel || "Beginner", c.difficulty || "Beginner", c.estimatedHours || 4,
          c.priceCents || 0, c.currency || "INR", c.category || "General",
          c.prerequisites || [], c.tags || [], c.thumbnailColor || "#22d3ee",
          c.contentTypes || ["Rich Text"], JSON.stringify(c.storage || { files: [] }),
          c.status || "Active", c.approval || "Approved",
          c.ownerId || users[0]?.id || "SAnalanda", c.version || 1,
          c.createdAt || null,
        ]
      );
    }

    // 4. Chapters
    const chapters = data.chapters || [];
    console.log(`[backfill] Upserting ${chapters.length} chapters...`);
    for (const ch of chapters) {
      await client.query(
        `INSERT INTO chapters (
           id, course_id, sequence, title, description, content_type,
           body, url, file_name, duration_minutes, minimum_time_minutes, version, created_at, updated_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6,
           $7, $8, $9, $10, $11, $12, COALESCE($13::timestamptz, now()), now()
         ) ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title, body = EXCLUDED.body, content_type = EXCLUDED.content_type,
           version = GREATEST(chapters.version, EXCLUDED.version)`,
        [
          ch.id, ch.courseId, ch.sequence || 1, ch.title, ch.description || "",
          ch.contentType || "Rich Text", ch.body || "", ch.url || null,
          ch.fileName || null, ch.durationMinutes || 10, ch.minimumTimeMinutes ?? 1,
          ch.version || 1, ch.createdAt || null,
        ]
      );
    }

    // 5. Assessments & Questions
    const assessments = data.assessments || [];
    console.log(`[backfill] Upserting ${assessments.length} assessments...`);
    for (const a of assessments) {
      await client.query(
        `INSERT INTO assessments (
           id, course_id, chapter_id, title, type, strict_mode,
           duration_minutes, pass_score, question_limit, difficulty,
           approval, status, owner_id, version, created_at, updated_at
         ) VALUES (
           $1, $2, $3, $4, $5::assessment_type, $6,
           $7, $8, $9, $10,
           $11::approval_status, $12::lifecycle_status, $13, $14,
           COALESCE($15::timestamptz, now()), now()
         ) ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title, status = EXCLUDED.status, approval = EXCLUDED.approval,
           version = GREATEST(assessments.version, EXCLUDED.version)`,
        [
          a.id, a.courseId, a.chapterId || null, a.title, a.type || "MCQ",
          a.strictMode ?? true, a.durationMinutes || 15, a.passScore || 70,
          a.questionLimit || null, a.difficulty || "Beginner", a.approval || "Approved",
          a.status || "Active", a.ownerId || users[0]?.id || "SAnalanda",
          a.version || 1, a.createdAt || null,
        ]
      );

      if (Array.isArray(a.questions)) {
        await client.query("DELETE FROM questions WHERE assessment_id = $1", [a.id]);
        for (let i = 0; i < a.questions.length; i++) {
          const q = a.questions[i];
          const {
            id: questionId,
            type: questionType,
            prompt: questionPrompt,
            options: questionOptions,
            answer: questionAnswer,
            correctAnswer,
            points: questionPoints,
            sortOrder,
            ...questionMetadata
          } = q;
          await client.query(
            `INSERT INTO questions (
               assessment_id, question_type, prompt, options, correct_answer,
               points, sort_order, metadata
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)`,
            [
              a.id, questionType || "MCQ", questionPrompt,
              JSON.stringify(questionOptions || []),
              JSON.stringify(questionAnswer ?? correctAnswer ?? null),
              questionPoints || 10, sortOrder ?? i, JSON.stringify(questionMetadata),
            ]
          );
        }
      }
      await client.query(
        `INSERT INTO assessment_versions (
           assessment_id, version, snapshot, change_note, created_by
         )
         SELECT a.id, a.version,
           to_jsonb(a) || jsonb_build_object(
             'questions', COALESCE((
               SELECT jsonb_agg(to_jsonb(q) ORDER BY q.sort_order, q.id)
               FROM questions q WHERE q.assessment_id = a.id
             ), '[]'::jsonb)
           ),
           'Backfilled assessment version', a.owner_id
         FROM assessments a WHERE a.id = $1
         ON CONFLICT (assessment_id, version) DO NOTHING`,
        [a.id]
      );
    }

    // 6. Cohorts. Invite codes are one-way hashed; they must be reissued if the
    // source snapshot did not contain the original bearer value.
    const cohorts = data.cohorts || [];
    console.log(`[backfill] Upserting ${cohorts.length} cohorts...`);
    for (const cohort of cohorts) {
      const inviteCode = String(cohort.inviteCode || `REISSUE-${cohort.id}`).trim().toUpperCase();
      const inviteUsable = /^NLD-[A-HJ-NP-Z2-9]{12}$/.test(inviteCode);
      const inviteCodeHash = crypto.createHash("sha256").update(inviteCode).digest("hex");
      await client.query(
        `INSERT INTO cohorts (
           id, course_id, instructor_id, name, description, start_date,
           end_date, capacity, invite_code_hash, active, version,
           created_at, updated_at
         ) VALUES (
           $1, $2, $3, $4, $5, COALESCE($6::timestamptz, now()),
           $7, $8, $9, $10, $11,
           COALESCE($12::timestamptz, now()), COALESCE($13::timestamptz, now())
         ) ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, description = EXCLUDED.description,
           start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date,
           capacity = EXCLUDED.capacity, active = EXCLUDED.active,
           version = GREATEST(cohorts.version, EXCLUDED.version),
           updated_at = EXCLUDED.updated_at`,
        [
          cohort.id, cohort.courseId, cohort.instructorId, cohort.name,
          cohort.description || "", cohort.startDate || null, cohort.endDate || null,
          cohort.capacity || 100, inviteCodeHash, cohort.active !== false && inviteUsable,
          cohort.version || 1, cohort.createdAt || null, cohort.updatedAt || null,
        ],
      );
    }

    // 7. Enrollments
    const enrollments = data.assignments || data.enrollments || [];
    console.log(`[backfill] Upserting ${enrollments.length} enrollments...`);
    for (const e of enrollments) {
      await client.query(
        `INSERT INTO enrollments (
           id, course_id, user_id, assigned_by, cohort_id, due_at, priority,
           mandatory, progress, completed_chapters, time_spent_minutes,
           time_spent_seconds, chapter_time_spent_seconds,
           chapter_heartbeat_timestamps, video_progress, last_heartbeat_at,
           version, status, certificate_id, started_at, completed_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7,
           $8, $9, $10, $11,
           $12, $13, $14, $15, $16,
           $17, $18, $19,
           COALESCE($20::timestamptz, now()), $21
         ) ON CONFLICT (course_id, user_id) DO UPDATE SET
           cohort_id = EXCLUDED.cohort_id,
           progress = EXCLUDED.progress, completed_chapters = EXCLUDED.completed_chapters,
           status = EXCLUDED.status, certificate_id = EXCLUDED.certificate_id,
           completed_at = EXCLUDED.completed_at,
           chapter_heartbeat_timestamps = EXCLUDED.chapter_heartbeat_timestamps,
           video_progress = EXCLUDED.video_progress,
           last_heartbeat_at = EXCLUDED.last_heartbeat_at,
           version = GREATEST(enrollments.version, EXCLUDED.version)`,
        [
          e.id, e.courseId, e.userId,
          userIds.has(e.assignedBy) ? e.assignedBy : e.userId,
          e.cohortId || null, e.dueAt || null, e.priority || "Medium", e.mandatory ?? false,
          e.progress || 0, e.completedChapters || [], e.timeSpentMinutes || 0,
          e.timeSpentSeconds || 0, JSON.stringify(e.chapterTimeSpentSeconds || {}),
          JSON.stringify(e.lastHeartbeatTimestamps || {}),
          JSON.stringify(e.videoProgress || {}), e.lastHeartbeatAt || null,
          e.version || 0, e.status || "Enrolled", e.certificateId || null,
          e.startedAt || null, e.completedAt || null,
        ]
      );
    }

    // 7. Assessment attempts and proctoring evidence. Attempt IDs are TEXT to
    // preserve the public API contract and historical identifiers.
    const attempts = data.attempts || [];
    const attemptIds = new Set(attempts.map((attempt) => attempt.id));
    console.log(`[backfill] Upserting ${attempts.length} assessment attempts...`);
    for (const attempt of attempts) {
      const attemptAssessment = (data.assessments || []).find(
        (assessment) => assessment.id === attempt.assessmentId
      );
      await client.query(
        `INSERT INTO assessment_attempts (
           id, assessment_id, chapter_id, course_id, user_id, status, score,
           max_score, feedback, answers, selected_question_ids, question_map,
           manual_grades, flags, warnings, video_chunks, companion, trust_score,
           tab_switch_warnings, auto_submitted_reason, expires_at, is_paused,
           paused_at, resumed_at, terminated_reason, terminated_by, terminated_at,
           assigned_proctor_id, time_spent_seconds, started_at, submitted_at,
           evaluated_by, assessment_version, duration_minutes_snapshot,
           pass_score_snapshot, version
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7,
           $8, $9, $10::jsonb, $11, $12::jsonb,
           $13::jsonb, $14::jsonb, $15::jsonb, $16::jsonb, $17::jsonb, $18,
           $19, $20, $21, $22,
           $23, $24, $25, $26, $27,
           $28, $29, COALESCE($30::timestamptz, now()), $31,
           $32, $33, $34, $35, $36
         ) ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status, score = EXCLUDED.score,
           feedback = EXCLUDED.feedback, answers = EXCLUDED.answers,
           question_map = EXCLUDED.question_map, manual_grades = EXCLUDED.manual_grades,
           flags = EXCLUDED.flags, warnings = EXCLUDED.warnings,
           video_chunks = EXCLUDED.video_chunks, companion = EXCLUDED.companion,
           trust_score = EXCLUDED.trust_score, expires_at = EXCLUDED.expires_at,
           submitted_at = EXCLUDED.submitted_at,
           version = GREATEST(assessment_attempts.version, EXCLUDED.version)`,
        [
          attempt.id, attempt.assessmentId, attempt.chapterId || null,
          attempt.courseId || null, attempt.userId, attempt.status || "InProgress",
          attempt.score ?? null, attempt.maxScore ?? null, attempt.feedback || "",
          JSON.stringify(attempt.answers || {}), attempt.selectedQuestionIds || [],
          JSON.stringify(attempt.questionMap || {}), JSON.stringify(attempt.manualGrades || {}),
          JSON.stringify(attempt.flags || []), JSON.stringify(attempt.warnings || []),
          JSON.stringify(attempt.videoChunks || []), JSON.stringify(attempt.companion || null),
          attempt.trustScore ?? 100, attempt.tabSwitchWarnings || 0,
          attempt.autoSubmittedReason || null, attempt.expiresAt || null,
          Boolean(attempt.isPaused), attempt.pausedAt || null, attempt.resumedAt || null,
          attempt.terminatedReason || null,
          userIds.has(attempt.terminatedBy) ? attempt.terminatedBy : null,
          attempt.terminatedAt || null,
          userIds.has(attempt.assignedProctorId) ? attempt.assignedProctorId : null,
          attempt.timeSpentSeconds || 0, attempt.startedAt || null,
          attempt.submittedAt || null,
          userIds.has(attempt.evaluatedBy) ? attempt.evaluatedBy : null,
          attempt.assessmentVersion || attemptAssessment?.version || 1,
          attempt.durationMinutesSnapshot || attemptAssessment?.durationMinutes || 15,
          attempt.passScoreSnapshot || attemptAssessment?.passScore || 70,
          attempt.version || 0,
        ]
      );
    }

    const proctorEvents = data.proctoringLogs || [];
    const eligibleEvents = proctorEvents.filter((event) => (
      attemptIds.has(event.attemptId) && userIds.has(event.userId)
    ));
    console.log(`[backfill] Upserting ${eligibleEvents.length} proctoring events...`);
    for (const event of eligibleEvents) {
      await client.query(
        `INSERT INTO proctoring_logs (
           id, attempt_id, user_id, event_type, severity, confidence,
           capture_key, trust_score_after, metadata, created_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, COALESCE($10::timestamptz, now()))
         ON CONFLICT (id) DO NOTHING`,
        [
          event.id, event.attemptId, event.userId, event.eventType,
          event.severity, event.confidence ?? null, event.captureKey || null,
          event.trustScoreAfter ?? null, JSON.stringify(event.metadata || {}),
          event.createdAt || null,
        ]
      );
    }

    // 8. Issued certificates. Only signed credentials with resolvable subjects
    // are admitted to the normalized authority; reconciliation reports any
    // quarantined legacy rows before the feature flag can be enabled.
    const certificates = data.issuedCertificates || [];
    const coursesById = new Map(courses.map((course) => [course.id, course]));
    const enrollmentKeys = new Set(enrollments.map((enrollment) => `${enrollment.userId}:${enrollment.courseId}`));
    const activePairCounts = certificates.reduce((counts, certificate) => {
      if ((certificate.status || "Active") !== "Active") return counts;
      const key = `${certificate.employeeId}:${certificate.courseId}`;
      counts.set(key, (counts.get(key) || 0) + 1);
      return counts;
    }, new Map());
    const eligibleCertificates = certificates.filter((certificate) => {
      const course = coursesById.get(certificate.courseId);
      const status = certificate.status || "Active";
      const pairKey = `${certificate.employeeId}:${certificate.courseId}`;
      const hasValidRevocation = status === "Active"
        ? !certificate.revokedBy && !certificate.revokedAt && !certificate.revocationReason
        : status === "Revoked"
          && userIds.has(certificate.revokedBy)
          && Boolean(certificate.revokedAt)
          && String(certificate.revocationReason || "").trim().length >= 10;
      return Boolean(certificate.id || certificate.certificateId)
        && userIds.has(certificate.employeeId)
        && Boolean(course)
        && enrollmentKeys.has(pairKey)
        && (status !== "Active" || activePairCounts.get(pairKey) === 1)
        && userIds.has(userIds.has(certificate.issuedBy) ? certificate.issuedBy : course?.ownerId)
        && [1, 2].includes(Number(certificate.signatureVersion || 1))
        && /^[a-f0-9]{64}$/i.test(certificate.signature || "")
        && hasValidRevocation;
    });
    console.log(`[backfill] Upserting ${eligibleCertificates.length} signed certificates (${certificates.length - eligibleCertificates.length} quarantined)...`);
    for (const certificate of eligibleCertificates) {
      const course = coursesById.get(certificate.courseId);
      const issuerId = userIds.has(certificate.issuedBy) ? certificate.issuedBy : course.ownerId;
      const inserted = await client.query(
        `INSERT INTO issued_certificates (
           id, employee_id, course_id, attempt_id, recipient_name,
           recipient_email, course_title, title, template, accent, duration,
           subtitle, footer, issued_by, issued_by_name, html_snapshot,
           proctoring_verified, exam_score, signature_version, signature, verification_url,
           linkedin_share_url, status, revoked_by, revoked_at,
           revocation_reason, issued_at
         ) VALUES (
           $1, $2, $3, $4, $5,
           $6, $7, $8, $9, $10, $11,
           $12, $13, $14, $15, '',
           $16, $17, $18, $19, $20,
           $21, $22, $23, $24,
           $25, COALESCE($26::timestamptz, now())
         ) ON CONFLICT (id) DO NOTHING
         RETURNING id, employee_id, course_id, status, issued_at`,
        [
          certificate.id || certificate.certificateId, certificate.employeeId,
          certificate.courseId, attemptIds.has(certificate.attemptId) ? certificate.attemptId : null,
          certificate.recipientName || users.find((user) => user.id === certificate.employeeId)?.name,
          certificate.recipientEmail || users.find((user) => user.id === certificate.employeeId)?.email,
          certificate.courseTitle || course.title, certificate.title || "Certificate of Completion",
          certificate.template || "Executive", certificate.accent || "#0f766e",
          certificate.duration || "", certificate.subtitle || "", certificate.footer || "",
          issuerId, certificate.issuedByName || "Nalanda Academic Board",
          Boolean(certificate.proctoringVerified), certificate.examScore ?? null,
          certificate.signatureVersion || 1, certificate.signature.toLowerCase(),
          certificate.verificationUrl || `/verify/${certificate.id || certificate.certificateId}`,
          certificate.linkedinShareUrl || "", certificate.status || "Active",
          userIds.has(certificate.revokedBy) ? certificate.revokedBy : null,
          certificate.revokedAt || null, certificate.revocationReason || null,
          certificate.issuedAt || null,
        ]
      );
      const admitted = inserted.rows[0];
      if (admitted?.status === "Active") {
        await client.query(
          `UPDATE enrollments SET status = 'Certified', certificate_id = $3,
             completed_at = COALESCE(completed_at, $4)
           WHERE user_id = $1 AND course_id = $2`,
          [admitted.employee_id, admitted.course_id, admitted.id, admitted.issued_at]
        );
      } else if (admitted?.status === "Revoked") {
        await client.query(
          `UPDATE enrollments SET status = 'Passed', certificate_id = NULL
           WHERE user_id = $1 AND course_id = $2 AND certificate_id = $3`,
          [admitted.employee_id, admitted.course_id, admitted.id]
        );
      }
    }

    // 9. Public candidate links and anonymous submissions. Plaintext bearer
    // tokens never enter the normalized tables.
    const candidateLinks = data.candidateAssessments || [];
    const assessmentsById = new Map(assessments.map((assessment) => [assessment.id, assessment]));
    const chapterIds = new Set(chapters.map((chapter) => chapter.id));
    const candidateTokenCounts = candidateLinks.reduce((counts, link) => {
      counts.set(link.token, (counts.get(link.token) || 0) + 1);
      return counts;
    }, new Map());
    const activeAttemptTokenCounts = candidateLinks.reduce((counts, link) => {
      for (const submission of (link.submissions || [])) {
        if (!submission.submittedAt && submission.attemptToken) {
          counts.set(submission.attemptToken, (counts.get(submission.attemptToken) || 0) + 1);
        }
      }
      return counts;
    }, new Map());
    const eligibleCandidateLinks = candidateLinks.filter((link) => {
      const assessment = assessmentsById.get(link.assessmentId);
      return Boolean(link.id)
        && typeof link.token === "string"
        && link.token.length >= 4
        && candidateTokenCounts.get(link.token) === 1
        && Boolean(assessment)
        && coursesById.has(link.courseId || assessment?.courseId)
        && userIds.has(link.createdBy)
        && (!link.expiresAt || Number.isFinite(Date.parse(link.expiresAt)))
        && Array.isArray(assessment?.questions)
        && assessment.questions.length > 0;
    });
    console.log(`[backfill] Upserting ${eligibleCandidateLinks.length} candidate links (${candidateLinks.length - eligibleCandidateLinks.length} quarantined)...`);
    for (const link of eligibleCandidateLinks) {
      const assessment = assessmentsById.get(link.assessmentId);
      const course = coursesById.get(link.courseId || assessment.courseId);
      const questionLimit = Math.min(
        Math.max(1, Number(link.questionLimit || assessment.questionLimit || assessment.questions.length)),
        assessment.questions.length
      );
      const questions = assessment.questions.slice(0, questionLimit);
      await client.query(
        `INSERT INTO candidate_assessment_links (
           id, token_hash, token_hint, assessment_id, title, course_id,
           course_title, chapter_id, duration_minutes, pass_score, question_limit,
           question_snapshot, proctoring_required, fullscreen_required,
           tab_switch_auto_submit, max_tab_switches, expires_at, status,
           created_by, created_by_name, created_at, updated_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6,
           $7, $8, $9, $10, $11,
           $12::jsonb, $13, $14,
           $15, $16, $17, $18,
           $19, $20, COALESCE($21::timestamptz, now()), COALESCE($21::timestamptz, now())
         ) ON CONFLICT (id) DO NOTHING`,
        [
          link.id, hashCandidateToken(link.token), link.token.slice(-8),
          assessment.id, link.title || assessment.title, course.id,
          link.courseTitle || course.title,
          chapterIds.has(link.chapterId) ? link.chapterId : null,
          Math.min(360, Math.max(1, Number(link.durationMinutes || assessment.durationMinutes || 30))),
          Math.min(100, Math.max(1, Number(link.passScore || assessment.passScore || 70))),
          questionLimit, JSON.stringify(questions), link.proctoringRequired !== false,
          link.fullscreenRequired !== false, Boolean(link.tabSwitchAutoSubmit),
          Math.min(10, Math.max(1, Number(link.maxTabSwitches || 3))),
          link.expiresAt || null, link.status === "Closed" ? "Closed" : "Active",
          link.createdBy, link.createdByName || users.find((user) => user.id === link.createdBy)?.name,
          Number.isFinite(Date.parse(link.createdAt || "")) ? link.createdAt : null,
        ]
      );

      const submissions = Array.isArray(link.submissions) ? link.submissions : [];
      const emailCounts = submissions.reduce((counts, submission) => {
        const email = String(submission.candidateEmail || "").trim().toLowerCase();
        counts.set(email, (counts.get(email) || 0) + 1);
        return counts;
      }, new Map());
      let admittedSubmissions = 0;
      for (const submission of submissions) {
        const email = String(submission.candidateEmail || "").trim().toLowerCase();
        const startedAtMs = Date.parse(submission.startedAt || "");
        const submittedAt = Number.isFinite(Date.parse(submission.submittedAt || ""))
          ? submission.submittedAt
          : null;
        if (!submission.id || !email.includes("@") || emailCounts.get(email) !== 1 || !Number.isFinite(startedAtMs)) continue;
        const rawStatus = String(submission.status || "").replaceAll(" ", "");
        const status = submittedAt
          ? ["Expired", "PendingManualReview", "Passed", "Failed"].includes(rawStatus)
            ? rawStatus
            : submission.passed === true ? "Passed" : submission.passed === false ? "Failed" : "PendingManualReview"
          : "InProgress";
        if (status === "InProgress" && (
          !submission.attemptToken || activeAttemptTokenCounts.get(submission.attemptToken) !== 1
        )) continue;
        const expiresAt = Number.isFinite(Date.parse(submission.expiresAt || ""))
          ? submission.expiresAt
          : new Date(
          startedAtMs + (Number(link.durationMinutes || assessment.durationMinutes || 30) * 60 + 30) * 1000
          ).toISOString();
        const questionIds = submission.questionIds?.length
          ? submission.questionIds
          : submission.evaluatedResponses?.map((response) => response.questionId).filter(Boolean).length
            ? submission.evaluatedResponses.map((response) => response.questionId).filter(Boolean)
            : questions.map((question, index) => question.id || `Q-${index + 1}`);
        const passed = status === "Passed" ? true : status === "Failed" ? false : null;
        const requiresManualReview = status === "PendingManualReview";
        const inserted = await client.query(
          `INSERT INTO candidate_assessment_submissions (
             id, link_id, attempt_token_hash, candidate_name, candidate_email,
             started_at, expires_at, submitted_at, expired_at, status,
             trust_score, tab_switch_count, flags, answers, question_ids,
             score, max_score, percentage, passed, requires_manual_review,
             ignored_proctoring, proctoring_status, hiring_recommendation,
             evaluated_responses, category_breakdown, auto_submitted_reason,
             time_spent_seconds
           ) VALUES (
             $1, $2, $3, $4, $5,
             $6, $7, $8, $9, $10,
             $11, $12, $13::jsonb, $14::jsonb, $15,
             $16, $17, $18, $19, $20,
             $21, $22, $23,
             $24::jsonb, $25::jsonb, $26,
             $27
           ) ON CONFLICT (id) DO NOTHING RETURNING id`,
          [
            submission.id, link.id,
            hashCandidateToken(status === "InProgress"
              ? submission.attemptToken
              : `closed:${crypto.randomUUID()}`),
            submission.candidateName || "Legacy candidate", email,
            submission.startedAt, expiresAt, submittedAt,
            status === "Expired" ? (submission.expiredAt || submittedAt) : null, status,
            Math.min(100, Math.max(0, Number(submission.trustScore ?? 100))),
            Math.max(0, Number(submission.tabSwitchCount || 0)),
            JSON.stringify(submission.flags || []), JSON.stringify(submission.answers || {}),
            questionIds, Number(submission.score || 0),
            Math.max(1, Number(submission.maxScore || questions.reduce((sum, item) => sum + Number(item.points || 1), 0))),
            Math.min(100, Math.max(0, Number(submission.percentage || 0))),
            passed, requiresManualReview,
            Boolean(submission.ignoredProctoring), submission.proctoringStatus || "CLEAN",
            submission.hiringRecommendation || "Not Shortlisted",
            JSON.stringify(submission.evaluatedResponses || []),
            JSON.stringify(submission.categoryBreakdown || {}),
            submission.autoSubmittedReason || null, Math.max(0, Number(submission.timeSpentSeconds || 0)),
          ]
        );
        if (!inserted.rows[0]) continue;
        admittedSubmissions += 1;
        for (const [index, flag] of (submission.flags || []).entries()) {
          const eventId = flag.id || `CPE-BACKFILL-${hashCandidateToken(`${link.id}:${submission.id}:${index}`).slice(0, 32).toUpperCase()}`;
          const legacyClientEventId = String(flag.id || eventId);
          const clientEventId = legacyClientEventId.length >= 8
            ? legacyClientEventId.slice(0, 128)
            : eventId;
          await client.query(
            `INSERT INTO candidate_proctor_events (
               id, submission_id, client_event_id, event_type, severity, confidence,
               trust_score_after, metadata, created_at
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, COALESCE($9::timestamptz, now()))
             ON CONFLICT DO NOTHING`,
            [
              eventId, submission.id, clientEventId,
              flag.eventType || "LEGACY_EVENT",
              ["low", "medium", "high"].includes(flag.severity) ? flag.severity : "medium",
              flag.confidence === null || flag.confidence === undefined
                ? null
                : Math.min(1, Math.max(0, Number(flag.confidence))),
              Math.min(100, Math.max(0, Number(flag.trustScoreAfter ?? submission.trustScore ?? 100))),
              JSON.stringify(flag.metadata || {}), flag.createdAt || null,
            ]
          );
        }
      }
      console.log(`[backfill] Candidate link ${link.id}: admitted ${admittedSubmissions}/${submissions.length} submissions.`);
    }

    // 10. Payment ledger. This preserves existing settlement evidence before
    // USE_PG_PAYMENTS is enabled. Foreign keys require users/courses/enrollments
    // to be loaded first.
    const paymentOrders = data.paymentOrders || [];
    console.log(`[backfill] Upserting ${paymentOrders.length} payment orders...`);
    for (const order of paymentOrders) {
      await client.query(
        `INSERT INTO payment_orders (
           order_id, receipt, provider, user_id, course_id, amount_cents,
           currency, status, provider_payment_id, created_at, expires_at,
           paid_at, updated_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6,
           $7, $8, $9, $10, $11,
           $12, $13
         ) ON CONFLICT (order_id) DO NOTHING`,
        [
          order.orderId, order.receipt, order.provider || "Razorpay",
          order.userId, order.courseId, order.amountCents, order.currency || "INR",
          order.status || "Created", order.paymentId || null,
          order.createdAt, order.expiresAt, order.paidAt || null, order.updatedAt || null,
        ]
      );
    }

    const paymentTransactions = data.paymentTransactions || [];
    console.log(`[backfill] Upserting ${paymentTransactions.length} payment transactions...`);
    for (const transaction of paymentTransactions) {
      await client.query(
        `INSERT INTO payment_transactions (
           id, order_id, provider_payment_id, user_id, course_id, amount_cents,
           currency, status, source, created_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'Paid', $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [
          transaction.id, transaction.orderId, transaction.paymentId,
          transaction.userId, transaction.courseId, transaction.amountCents,
          transaction.currency || "INR", transaction.source || "Checkout",
          transaction.createdAt,
        ]
      );
    }

    const paymentWebhookEvents = data.paymentWebhookEvents || [];
    console.log(`[backfill] Upserting ${paymentWebhookEvents.length} payment webhook events...`);
    for (const event of paymentWebhookEvents) {
      await client.query(
        `INSERT INTO payment_webhook_events (
           event_id, event_type, body_sha256, order_id, provider_payment_id,
           status, received_at, processed_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (event_id) DO NOTHING`,
        [
          event.eventId, event.eventType, event.bodySha256,
          event.orderId || null, event.paymentId || null, event.status,
          event.receivedAt, event.processedAt,
        ]
      );
    }

    // 11. Durable privacy intake. Legacy scheduling fields are admitted only
    // when both timestamps are valid; execution still requires explicit review.
    const scheduledPrivacyUsers = users.filter((user) =>
      Number.isFinite(Date.parse(user.deletionRequestedAt || ""))
      && Number.isFinite(Date.parse(user.deletionScheduledAt || ""))
    );
    console.log(`[backfill] Upserting ${scheduledPrivacyUsers.length} privacy requests...`);
    for (const user of scheduledPrivacyUsers) {
      const requestedAt = new Date(user.deletionRequestedAt);
      const scheduledAt = new Date(user.deletionScheduledAt);
      const graceEndsAt = scheduledAt > requestedAt
        ? scheduledAt.toISOString()
        : new Date(requestedAt.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const reason = String(user.deletionReason || "Legacy user-requested account erasure").slice(0, 2000);
      const requestId = `PRIV-BACKFILL-${hashCandidateToken(user.id).slice(0, 32).toUpperCase()}`;
      await client.query(
        `INSERT INTO privacy_requests (
           id, user_id, status, reason, reason_sha256,
           requested_at, grace_ends_at, coverage_version
         ) VALUES ($1, $2, 'PendingReview', $3, $4, $5, $6, 'normalized-v2')
         ON CONFLICT DO NOTHING`,
        [requestId, user.id, reason, hashCandidateToken(reason), requestedAt.toISOString(), graceEndsAt]
      );
    }

    // 12. Workplace attendance, performance reviews and communications.
    // Legacy local times are interpreted in the configured workplace timezone.
    const workplaceTimeZone = process.env.APP_TIME_ZONE || "Asia/Kolkata";
    const attendanceLogs = data.attendanceLogs || [];
    let admittedAttendance = 0;
    for (const record of attendanceLogs) {
      const attendanceDate = normalizeLegacyDate(record.date);
      const checkInTime = normalizeLegacyTime(record.checkInTime);
      const checkOutTime = record.checkOutTime ? normalizeLegacyTime(record.checkOutTime) : null;
      if (!record.id || !userIds.has(record.userId) || !attendanceDate || !checkInTime
        || (record.checkOutTime && !checkOutTime)
        || (checkOutTime && checkOutTime < checkInTime)) continue;
      const status = ["Present", "Absent", "Leave"].includes(record.status) ? record.status : "Present";
      await client.query(
        `INSERT INTO attendance_records (
           id, user_id, attendance_date, check_in_at, check_out_at, status
         ) VALUES (
           $1, $2, $3::date,
           ($3::date + $4::time) AT TIME ZONE $7,
           CASE WHEN $5::text IS NULL THEN NULL
             ELSE ($3::date + $5::time) AT TIME ZONE $7 END,
           $6
         ) ON CONFLICT (user_id, attendance_date) DO UPDATE SET
           check_in_at = EXCLUDED.check_in_at,
           check_out_at = EXCLUDED.check_out_at,
           status = EXCLUDED.status,
           updated_at = now()`,
        [record.id, record.userId, attendanceDate, checkInTime, checkOutTime, status, workplaceTimeZone],
      );
      admittedAttendance += 1;
    }
    console.log(`[backfill] Admitted ${admittedAttendance}/${attendanceLogs.length} attendance records.`);

    const performanceReviews = data.performanceReviews || [];
    let admittedReviews = 0;
    for (const review of performanceReviews) {
      const reviewDate = normalizeLegacyDate(review.reviewDate);
      const reviewerName = String(review.reviewerName || "").trim().slice(0, 200);
      const comments = String(review.comments || "").trim().slice(0, 4000);
      const goals = String(review.goals || "").trim().slice(0, 8000);
      const rating = Number(review.rating);
      if (!review.id || !userIds.has(review.userId) || !reviewDate || !reviewerName
        || !comments || !goals || !Number.isFinite(rating) || rating < 1 || rating > 5) continue;
      const reviewerId = userIds.has(review.reviewerId) ? review.reviewerId : null;
      await client.query(
        `INSERT INTO performance_reviews (
           id, user_id, reviewer_id, reviewer_name, review_date, rating, comments, goals
         ) VALUES ($1, $2, $3, $4, $5::date, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
           user_id = EXCLUDED.user_id, reviewer_id = EXCLUDED.reviewer_id,
           reviewer_name = EXCLUDED.reviewer_name, review_date = EXCLUDED.review_date,
           rating = EXCLUDED.rating, comments = EXCLUDED.comments, goals = EXCLUDED.goals`,
        [review.id, review.userId, reviewerId, reviewerName, reviewDate, rating, comments, goals],
      );
      admittedReviews += 1;
    }
    console.log(`[backfill] Admitted ${admittedReviews}/${performanceReviews.length} performance reviews.`);

    const communications = data.communications || [];
    let admittedCommunications = 0;
    for (const message of communications) {
      const senderId = String(message.senderId || "");
      const recipientId = String(message.recipientId || "");
      const senderName = String(message.senderName || "").trim().slice(0, 200);
      const content = String(message.content || "").trim().slice(0, 4000);
      const kind = recipientId === "ALL" ? "Announcement"
        : content.startsWith("[SELF-APPRAISAL SUBMISSION]:") ? "SelfAppraisal" : "Direct";
      if (!message.id || (!userIds.has(senderId) && senderId !== "SYSTEM")
        || (recipientId !== "ALL" && !userIds.has(recipientId)) || !senderName || !content) continue;
      await client.query(
        `INSERT INTO workplace_communications (
           id, sender_id, sender_name, recipient_id, kind, content, sent_at
         ) VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7::timestamptz, now()))
         ON CONFLICT (id) DO UPDATE SET
           sender_id = EXCLUDED.sender_id, sender_name = EXCLUDED.sender_name,
           recipient_id = EXCLUDED.recipient_id, kind = EXCLUDED.kind,
           content = EXCLUDED.content, sent_at = EXCLUDED.sent_at`,
        [message.id, senderId, senderName, recipientId, kind, content,
          Number.isFinite(Date.parse(message.sentAt || "")) ? message.sentAt : null],
      );
      admittedCommunications += 1;
    }
    console.log(`[backfill] Admitted ${admittedCommunications}/${communications.length} workplace communications.`);

    // 13. Operational settings and learning feedback.
    if (data.settings && typeof data.settings === "object" && !Array.isArray(data.settings)) {
      const defaults = {
        fullscreenRequired: true, cameraRequired: true, microphoneRequired: true,
        tabSwitchAutoSubmit: true, noiseThreshold: 70, maxAssessmentFlags: 2,
      };
      const boundedInteger = (candidate, fallback, min, max) => {
        const value = Number(candidate);
        return Number.isInteger(value) && value >= min && value <= max ? value : fallback;
      };
      const value = {
        fullscreenRequired: typeof data.settings.fullscreenRequired === "boolean" ? data.settings.fullscreenRequired : defaults.fullscreenRequired,
        cameraRequired: typeof data.settings.cameraRequired === "boolean" ? data.settings.cameraRequired : defaults.cameraRequired,
        microphoneRequired: typeof data.settings.microphoneRequired === "boolean" ? data.settings.microphoneRequired : defaults.microphoneRequired,
        tabSwitchAutoSubmit: typeof data.settings.tabSwitchAutoSubmit === "boolean" ? data.settings.tabSwitchAutoSubmit : defaults.tabSwitchAutoSubmit,
        noiseThreshold: boundedInteger(data.settings.noiseThreshold, defaults.noiseThreshold, 1, 100),
        maxAssessmentFlags: boundedInteger(data.settings.maxAssessmentFlags, defaults.maxAssessmentFlags, 0, 100),
      };
      await client.query(
        `INSERT INTO system_settings (key, value, updated_by)
         VALUES ('proctoring', $1::jsonb, NULL)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
        [JSON.stringify(value)],
      );
    }

    const skillRatings = data.skillRatings || [];
    for (const rating of skillRatings) {
      if (!rating.id || !userIds.has(rating.userId)) continue;
      const score = Number(rating.score);
      const assessmentsBased = Number(rating.assessmentsBased);
      await client.query(
        `INSERT INTO skill_ratings (
           id, user_id, skill, score, assessments_based, trend, last_updated
         ) VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7::timestamptz, now()))
         ON CONFLICT (user_id, skill) DO UPDATE SET
           score = EXCLUDED.score, assessments_based = EXCLUDED.assessments_based,
           trend = EXCLUDED.trend, last_updated = EXCLUDED.last_updated`,
        [rating.id, rating.userId, String(rating.skill || "Unknown").trim().slice(0, 200) || "Unknown",
          Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 0,
          Number.isInteger(assessmentsBased) ? Math.max(0, assessmentsBased) : 0,
          ["up", "down", "stable"].includes(rating.trend) ? rating.trend : "stable",
          rating.lastUpdated || null],
      );
    }

    const courseIds = new Set(courses.map((course) => course.id));
    const chapterCourseById = new Map(chapters.map((chapter) => [chapter.id, chapter.courseId]));
    const legacyFeedback = data.chapterFeedbacks || [];
    for (const feedback of legacyFeedback) {
      if (!feedback.id || !userIds.has(feedback.userId)
        || !courseIds.has(feedback.courseId)
        || chapterCourseById.get(feedback.chapterId) !== feedback.courseId) continue;
      const normalizeRating = (candidate) => {
        const value = Number(candidate);
        return Number.isInteger(value) ? Math.max(1, Math.min(5, value)) : 1;
      };
      await client.query(
        `INSERT INTO chapter_feedbacks (
           id, chapter_id, course_id, user_id, rating, clarity, relevance,
           comments, submitted_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9::timestamptz, now()))
         ON CONFLICT (chapter_id, user_id) DO UPDATE SET
           rating = EXCLUDED.rating, clarity = EXCLUDED.clarity,
           relevance = EXCLUDED.relevance, comments = EXCLUDED.comments,
           submitted_at = EXCLUDED.submitted_at`,
        [feedback.id, feedback.chapterId, feedback.courseId, feedback.userId,
          normalizeRating(feedback.rating), normalizeRating(feedback.clarity),
          normalizeRating(feedback.relevance),
          String(feedback.comments || "").slice(0, 2000), feedback.submittedAt || null],
      );
    }

    // 14. AI generation feedback. Only records with a valid UUID and an
    // existing creator are admitted; expired legacy prompt influence is not
    // carried into the relational authority.
    const aiFeedback = data.acharyaFeedbackMemory || [];
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    let admittedFeedback = 0;
    for (const item of aiFeedback) {
      if (!uuidPattern.test(String(item.id || "")) || !userIds.has(item.createdBy)) continue;
      const comment = String(item.comment || "").trim().slice(0, 1200);
      if (comment.length < 10) continue;
      const createdAt = Number.isFinite(Date.parse(item.createdAt || "")) ? new Date(item.createdAt) : new Date();
      const expiresAt = new Date(createdAt.getTime() + 180 * 24 * 60 * 60 * 1000);
      if (expiresAt <= new Date()) continue;
      await client.query(
        `INSERT INTO ai_generation_feedback (
           id, skill_name, course_level, feedback_type, rating, comment,
           created_by, created_at, expires_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [
          item.id, String(item.skillName || "General").slice(0, 200),
          ["Beginner", "Intermediate", "Advanced", "Expert"].includes(item.courseLevel) ? item.courseLevel : "Beginner",
          ["Course", "Chapter", "Assessment", "Overall"].includes(item.feedbackType) ? item.feedbackType : "Overall",
          Math.round(Math.min(5, Math.max(1, Number(item.rating || 3)))),
          comment,
          item.createdBy, createdAt.toISOString(), expiresAt.toISOString(),
        ]
      );
      admittedFeedback += 1;
    }
    console.log(`[backfill] Admitted ${admittedFeedback}/${aiFeedback.length} active AI feedback records.`);

    // 15. Application-wide audit and security evidence. Legacy identifiers are
    // retained only as hashed idempotency keys; database UUIDs are generated by
    // PostgreSQL so malformed historic IDs cannot block the migration.
    const validTimestamp = (value) => Number.isFinite(Date.parse(value || "")) ? value : null;
    const auditRecords = data.auditLogs || [];
    let admittedAudit = 0;
    for (const event of auditRecords) {
      const ingestKey = `legacy-audit:${hashCandidateToken(JSON.stringify({
        id: event.id || null, action: event.action || null,
        entityType: event.entityType || event.entity || null,
        entityId: event.entityId || event.entity || null,
        createdAt: event.createdAt || event.at || null,
      }))}`;
      const inserted = await client.query(
        `INSERT INTO audit_logs (
           actor_id, action, entity_type, entity_id, metadata, ingest_key, created_at
         ) VALUES ($1, $2, $3, $4, $5::jsonb, $6, COALESCE($7::timestamptz, now()))
         ON CONFLICT DO NOTHING RETURNING id`,
        [
          event.actorId || null,
          String(event.action || "LEGACY_EVENT").slice(0, 200),
          String(event.entityType || event.entity || "SYSTEM").slice(0, 100),
          String(event.entityId || event.entity || event.id || "legacy").slice(0, 300),
          JSON.stringify(redactAuditMetadata(event.metadata || {})),
          ingestKey,
          validTimestamp(event.createdAt || event.at),
        ],
      );
      if (inserted.rows[0]) admittedAudit += 1;
    }
    console.log(`[backfill] Admitted ${admittedAudit}/${auditRecords.length} legacy audit records.`);

    const securityRecords = data.securityEvents || [];
    let admittedSecurity = 0;
    for (const event of securityRecords) {
      const ingestKey = `legacy-security:${hashCandidateToken(JSON.stringify({
        id: event.id || null, type: event.type || null,
        actorId: event.actorId || null, createdAt: event.createdAt || null,
      }))}`;
      const inserted = await client.query(
        `INSERT INTO security_events (
           event_type, actor_id, ip_address, http_method, request_path,
           user_agent, request_id, metadata, ingest_key, created_at
         ) VALUES (
           $1, $2, $3, $4, $5,
           $6, $7, $8::jsonb, $9, COALESCE($10::timestamptz, now())
         ) ON CONFLICT DO NOTHING RETURNING id`,
        [
          String(event.type || "LEGACY_SECURITY_EVENT").slice(0, 200),
          event.actorId ? String(event.actorId).slice(0, 200) : null,
          event.ip ? String(event.ip).slice(0, 200) : null,
          event.method ? String(event.method).slice(0, 16) : null,
          event.path ? String(event.path).slice(0, 2048) : null,
          event.userAgent ? String(event.userAgent).slice(0, 1024) : null,
          event.requestId ? String(event.requestId).slice(0, 200) : null,
          JSON.stringify(redactAuditMetadata(event.metadata || {})),
          ingestKey,
          validTimestamp(event.createdAt),
        ],
      );
      if (inserted.rows[0]) admittedSecurity += 1;
    }
    console.log(`[backfill] Admitted ${admittedSecurity}/${securityRecords.length} legacy security records.`);
  });

  console.log("[backfill] Relational backfill complete!");
}

if (process.argv[1]?.endsWith("backfill.js")) {
  backfill()
    .then(() => closePool())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[backfill] failed:", err?.message || err);
      process.exit(1);
    });
}
