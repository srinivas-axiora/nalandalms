// Backfill tool: copies existing data into normalized PostgreSQL relational tables.
// Idempotent (upsert on ID). Run AFTER migrations:
//   node backend/src/db/migrate.js && node backend/src/db/backfill.js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { query, closePool, withTransaction } from "./pool.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_JSON = path.resolve(__dirname, "..", "..", "..", "database", "db.json");

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
      attempts: core.attempts || [],
      proctoringLogs: core.proctoringLogs || [],
      issuedCertificates: core.issuedCertificates || [],
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

    // 2. Skills & Target Skills
    const skills = data.skills || [];
    console.log(`[backfill] Upserting ${skills.length} skills...`);
    for (const s of skills) {
      await client.query(
        `INSERT INTO skills (id, name, category, description, status, created_at)
         VALUES ($1, $2, $3, $4, $5, COALESCE($6::timestamptz, now()))
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, category = EXCLUDED.category,
           description = EXCLUDED.description, status = EXCLUDED.status`,
        [s.id, s.name, s.category || "Technical", s.description || "", s.status || "Active", s.createdAt || null]
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
           status, approval, owner_id, current_version, created_at, updated_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7,
           $8, $9, $10, $11, $12, $13, $14,
           $15::lifecycle_status, $16::approval_status, $17, $18,
           COALESCE($19::timestamptz, now()), now()
         ) ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title, description = EXCLUDED.description,
           skill = EXCLUDED.skill, price_cents = EXCLUDED.price_cents,
           currency = EXCLUDED.currency, status = EXCLUDED.status,
           approval = EXCLUDED.approval`,
        [
          c.id, c.title, c.description, c.skill || "", c.skillIds || [],
          c.targetLevel || "Beginner", c.difficulty || "Beginner", c.estimatedHours || 4,
          c.priceCents || 0, c.currency || "INR", c.category || "General",
          c.prerequisites || [], c.tags || [], c.thumbnailColor || "#22d3ee",
          c.status || "Active", c.approval || "Approved",
          c.ownerId || users[0]?.id || "SAnalanda", c.version || 1, c.createdAt || null,
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
           body, url, file_name, duration_minutes, minimum_time_minutes, created_at, updated_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6,
           $7, $8, $9, $10, $11, COALESCE($12::timestamptz, now()), now()
         ) ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title, body = EXCLUDED.body, content_type = EXCLUDED.content_type`,
        [
          ch.id, ch.courseId, ch.sequence || 1, ch.title, ch.description || "",
          ch.contentType || "Rich Text", ch.body || "", ch.url || null,
          ch.fileName || null, ch.durationMinutes || 10, ch.minimumTimeMinutes ?? 1,
          ch.createdAt || null,
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
           approval, status, owner_id, created_at, updated_at
         ) VALUES (
           $1, $2, $3, $4, $5::assessment_type, $6,
           $7, $8, $9, $10,
           $11::approval_status, $12::lifecycle_status, $13,
           COALESCE($14::timestamptz, now()), now()
         ) ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title, status = EXCLUDED.status, approval = EXCLUDED.approval`,
        [
          a.id, a.courseId, a.chapterId || null, a.title, a.type || "MCQ",
          a.strictMode ?? true, a.durationMinutes || 15, a.passScore || 70,
          a.questionLimit || null, a.difficulty || "Beginner", a.approval || "Approved",
          a.status || "Active", a.ownerId || users[0]?.id || "SAnalanda", a.createdAt || null,
        ]
      );

      if (Array.isArray(a.questions)) {
        await client.query("DELETE FROM questions WHERE assessment_id = $1", [a.id]);
        for (let i = 0; i < a.questions.length; i++) {
          const q = a.questions[i];
          await client.query(
            `INSERT INTO questions (
               assessment_id, question_type, prompt, options, correct_answer, points, sort_order
             ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              a.id, q.type || "MCQ", q.prompt, JSON.stringify(q.options || []),
              JSON.stringify(q.answer ?? q.correctAnswer ?? 0), q.points || 10, i,
            ]
          );
        }
      }
    }

    // 6. Enrollments
    const enrollments = data.assignments || data.enrollments || [];
    console.log(`[backfill] Upserting ${enrollments.length} enrollments...`);
    for (const e of enrollments) {
      await client.query(
        `INSERT INTO enrollments (
           id, course_id, user_id, assigned_by, due_at, priority,
           mandatory, progress, completed_chapters, time_spent_minutes,
           time_spent_seconds, chapter_time_spent_seconds, status,
           certificate_id, started_at, completed_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6,
           $7, $8, $9, $10,
           $11, $12, $13, $14,
           COALESCE($15::timestamptz, now()), $16
         ) ON CONFLICT (course_id, user_id) DO UPDATE SET
           progress = EXCLUDED.progress, completed_chapters = EXCLUDED.completed_chapters,
           status = EXCLUDED.status, certificate_id = EXCLUDED.certificate_id,
           completed_at = EXCLUDED.completed_at`,
        [
          e.id, e.courseId, e.userId,
          userIds.has(e.assignedBy) ? e.assignedBy : e.userId,
          e.dueAt || null, e.priority || "Medium", e.mandatory ?? false,
          e.progress || 0, e.completedChapters || [], e.timeSpentMinutes || 0,
          e.timeSpentSeconds || 0, JSON.stringify(e.chapterTimeSpentSeconds || {}),
          e.status || "Enrolled", e.certificateId || null,
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
      await client.query(
        `INSERT INTO assessment_attempts (
           id, assessment_id, chapter_id, course_id, user_id, status, score,
           max_score, feedback, answers, selected_question_ids, question_map,
           manual_grades, flags, warnings, video_chunks, companion, trust_score,
           tab_switch_warnings, auto_submitted_reason, expires_at, is_paused,
           paused_at, resumed_at, terminated_reason, terminated_by, terminated_at,
           assigned_proctor_id, time_spent_seconds, started_at, submitted_at,
           evaluated_by, version
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7,
           $8, $9, $10::jsonb, $11, $12::jsonb,
           $13::jsonb, $14::jsonb, $15::jsonb, $16::jsonb, $17::jsonb, $18,
           $19, $20, $21, $22,
           $23, $24, $25, $26, $27,
           $28, $29, COALESCE($30::timestamptz, now()), $31,
           $32, $33
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

    // 9. Payment ledger. This preserves existing settlement evidence before
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
