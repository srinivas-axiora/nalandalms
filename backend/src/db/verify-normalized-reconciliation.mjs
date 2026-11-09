import assert from "node:assert/strict";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";
import { closePool, withTransaction } from "./pool.js";

const CHUNK_SIZE = 2_000;

const sha256 = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");

export function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => (
      `${JSON.stringify(key)}:${stableStringify(value[key])}`
    )).join(",")}}`;
  }
  return JSON.stringify(value);
}

const asArray = (value) => Array.isArray(value) ? value : [];

const validLegacyDate = (value) => {
  const candidate = String(value || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(candidate)) return false;
  const [year, month, day] = candidate.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day;
};

const normalizedLegacyTime = (value) => {
  const match = String(value || "").trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = Number(match[3] || 0);
  if (minute > 59 || second > 59) return null;
  const meridiem = match[4]?.toUpperCase();
  if (meridiem) {
    if (hour < 1 || hour > 12) return null;
    hour = meridiem === "AM" ? hour % 12 : (hour % 12) + 12;
  } else if (hour > 23) return null;
  return [hour, minute, second].map((part) => String(part).padStart(2, "0")).join(":");
};

function assertNoQuarantinedSourceRows(data) {
  const users = asArray(data.users);
  const userIds = new Set(users.map((row) => row?.id));
  const courses = asArray(data.courses);
  const coursesById = new Map(courses.map((row) => [row?.id, row]));
  const chapters = asArray(data.chapters);
  const chapterCourseById = new Map(chapters.map((row) => [row?.id, row?.courseId]));
  const assessments = asArray(data.assessments);
  const assessmentsById = new Map(assessments.map((row) => [row?.id, row]));
  const attempts = asArray(data.attempts);
  const attemptIds = new Set(attempts.map((row) => row?.id));
  const enrollments = asArray(data.assignments || data.enrollments);
  const enrollmentKeys = new Set(enrollments.map((row) => `${row?.userId}:${row?.courseId}`));

  asArray(data.archives).forEach((row, index) => {
    assert.ok(["User", "Course", "Assessment"].includes(row?.entityType), `deletion archives source row ${index} would be quarantined`);
    assert.ok(userIds.has(row?.deletedBy) || users[0]?.id, `deletion archives source row ${index} has no resolvable deleter`);
  });
  asArray(data.proctoringLogs).forEach((row, index) => {
    assert.ok(attemptIds.has(row?.attemptId) && userIds.has(row?.userId), `proctoring events source row ${index} would be quarantined`);
  });

  const certificates = asArray(data.issuedCertificates);
  const activePairCounts = certificates.reduce((counts, row) => {
    if ((row?.status || "Active") === "Active") {
      const key = `${row?.employeeId}:${row?.courseId}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return counts;
  }, new Map());
  certificates.forEach((row, index) => {
    const course = coursesById.get(row?.courseId);
    const status = row?.status || "Active";
    const pairKey = `${row?.employeeId}:${row?.courseId}`;
    const revocationValid = status === "Active"
      ? !row?.revokedBy && !row?.revokedAt && !row?.revocationReason
      : status === "Revoked" && userIds.has(row?.revokedBy) && Boolean(row?.revokedAt)
        && String(row?.revocationReason || "").trim().length >= 10;
    const issuerId = userIds.has(row?.issuedBy) ? row.issuedBy : course?.ownerId;
    assert.ok(
      Boolean(row?.id || row?.certificateId)
        && userIds.has(row?.employeeId)
        && Boolean(course)
        && enrollmentKeys.has(pairKey)
        && (status !== "Active" || activePairCounts.get(pairKey) === 1)
        && userIds.has(issuerId)
        && [1, 2].includes(Number(row?.signatureVersion || 1))
        && /^[a-f0-9]{64}$/i.test(row?.signature || "")
        && revocationValid,
      `certificates source row ${index} would be quarantined`,
    );
  });

  const candidateLinks = asArray(data.candidateAssessments);
  const tokenCounts = candidateLinks.reduce((counts, row) => {
    counts.set(row?.token, (counts.get(row?.token) || 0) + 1);
    return counts;
  }, new Map());
  const activeAttemptTokenCounts = candidateLinks.reduce((counts, link) => {
    for (const submission of asArray(link?.submissions)) {
      if (!submission?.submittedAt && submission?.attemptToken) {
        counts.set(submission.attemptToken, (counts.get(submission.attemptToken) || 0) + 1);
      }
    }
    return counts;
  }, new Map());
  candidateLinks.forEach((link, linkIndex) => {
    const assessment = assessmentsById.get(link?.assessmentId);
    assert.ok(
      Boolean(link?.id)
        && typeof link?.token === "string"
        && link.token.length >= 4
        && tokenCounts.get(link.token) === 1
        && Boolean(assessment)
        && coursesById.has(link?.courseId || assessment?.courseId)
        && userIds.has(link?.createdBy)
        && (!link?.expiresAt || Number.isFinite(Date.parse(link.expiresAt)))
        && asArray(assessment?.questions).length > 0,
      `candidate links source row ${linkIndex} would be quarantined`,
    );
    const submissions = asArray(link?.submissions);
    const emailCounts = submissions.reduce((counts, submission) => {
      const email = String(submission?.candidateEmail || "").trim().toLowerCase();
      counts.set(email, (counts.get(email) || 0) + 1);
      return counts;
    }, new Map());
    submissions.forEach((submission, submissionIndex) => {
      const email = String(submission?.candidateEmail || "").trim().toLowerCase();
      const submitted = Number.isFinite(Date.parse(submission?.submittedAt || ""));
      const status = submitted ? "closed" : "InProgress";
      assert.ok(
        Boolean(submission?.id)
          && email.includes("@")
          && emailCounts.get(email) === 1
          && Number.isFinite(Date.parse(submission?.startedAt || ""))
          && (status !== "InProgress" || (
            Boolean(submission?.attemptToken)
            && activeAttemptTokenCounts.get(submission.attemptToken) === 1
          )),
        `candidate submission ${linkIndex}:${submissionIndex} would be quarantined`,
      );
    });
  });

  asArray(data.attendanceLogs).forEach((row, index) => {
    const checkIn = normalizedLegacyTime(row?.checkInTime);
    const checkOut = row?.checkOutTime ? normalizedLegacyTime(row.checkOutTime) : null;
    assert.ok(
      row?.id && userIds.has(row?.userId) && validLegacyDate(row?.date) && checkIn
        && (!row?.checkOutTime || checkOut) && (!checkOut || checkOut >= checkIn),
      `attendance records source row ${index} would be quarantined`,
    );
  });
  asArray(data.performanceReviews).forEach((row, index) => {
    const rating = Number(row?.rating);
    assert.ok(
      row?.id && userIds.has(row?.userId) && validLegacyDate(row?.reviewDate)
        && String(row?.reviewerName || "").trim() && String(row?.comments || "").trim()
        && String(row?.goals || "").trim() && Number.isFinite(rating) && rating >= 1 && rating <= 5,
      `performance reviews source row ${index} would be quarantined`,
    );
  });
  asArray(data.communications).forEach((row, index) => {
    const sender = String(row?.senderId || "");
    const recipient = String(row?.recipientId || "");
    assert.ok(
      row?.id && (userIds.has(sender) || sender === "SYSTEM")
        && (recipient === "ALL" || userIds.has(recipient))
        && String(row?.senderName || "").trim() && String(row?.content || "").trim(),
      `workplace communications source row ${index} would be quarantined`,
    );
  });
  asArray(data.skillRatings).forEach((row, index) => {
    assert.ok(row?.id && userIds.has(row?.userId), `skill ratings source row ${index} would be quarantined`);
  });
  asArray(data.chapterFeedbacks).forEach((row, index) => {
    assert.ok(
      row?.id && userIds.has(row?.userId) && coursesById.has(row?.courseId)
        && chapterCourseById.get(row?.chapterId) === row?.courseId,
      `chapter feedback source row ${index} would be quarantined`,
    );
  });
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  asArray(data.acharyaFeedbackMemory).forEach((row, index) => {
    const createdAt = Number.isFinite(Date.parse(row?.createdAt || "")) ? new Date(row.createdAt) : new Date();
    const expiresAt = new Date(createdAt.getTime() + 180 * 24 * 60 * 60 * 1000);
    assert.ok(
      uuidPattern.test(String(row?.id || "")) && userIds.has(row?.createdBy)
        && String(row?.comment || "").trim().length >= 10 && expiresAt > new Date(),
      `AI feedback source row ${index} would be quarantined`,
    );
  });
}

function identifiers(name, records, getIdentifier = (record) => record?.id) {
  const values = records.map((record, index) => {
    const value = String(getIdentifier(record) || "").trim();
    assert.ok(value, `${name} source row ${index} has no reconciliation identifier`);
    return value;
  });
  const unique = new Set(values);
  assert.equal(unique.size, values.length, `${name} source contains duplicate reconciliation identifiers`);
  return values;
}

function scheduledPrivacyRequestIds(users) {
  return users.flatMap((user, index) => {
    const requested = String(user?.deletionRequestedAt || "").trim();
    const scheduled = String(user?.deletionScheduledAt || "").trim();
    if (!requested && !scheduled) return [];
    assert.ok(Number.isFinite(Date.parse(requested)), `users source row ${index} has an invalid deletionRequestedAt`);
    assert.ok(Number.isFinite(Date.parse(scheduled)), `users source row ${index} has an invalid deletionScheduledAt`);
    assert.ok(String(user?.id || "").trim(), `users source row ${index} has no ID for its privacy request`);
    return [`PRIV-BACKFILL-${sha256(user.id).slice(0, 32).toUpperCase()}`];
  });
}

export function collectExpectedRows(data) {
  assertNoQuarantinedSourceRows(data);
  const users = asArray(data.users);
  const assessments = asArray(data.assessments);
  const candidateLinks = asArray(data.candidateAssessments);
  const enrollments = asArray(data.assignments || data.enrollments);
  const candidateSubmissions = candidateLinks.flatMap((link) => asArray(link?.submissions));
  const candidateEvents = candidateLinks.flatMap((link) => asArray(link?.submissions).flatMap((submission) => (
    asArray(submission?.flags).map((flag, index) => flag?.id
      || `CPE-BACKFILL-${sha256(`${link.id}:${submission.id}:${index}`).slice(0, 32).toUpperCase()}`)
  )));
  const archives = asArray(data.archives).map((archive) => sha256(String(
    archive?.id || `${archive?.entityType}:${archive?.entityId}:${archive?.deletedAt || "legacy"}`
  )));
  const auditKeys = asArray(data.auditLogs).map((event) => `legacy-audit:${sha256(JSON.stringify({
    id: event?.id || null,
    action: event?.action || null,
    entityType: event?.entityType || event?.entity || null,
    entityId: event?.entityId || event?.entity || null,
    createdAt: event?.createdAt || event?.at || null,
  }))}`);
  const securityKeys = asArray(data.securityEvents).map((event) => `legacy-security:${sha256(JSON.stringify({
    id: event?.id || null,
    type: event?.type || null,
    actorId: event?.actorId || null,
    createdAt: event?.createdAt || null,
  }))}`);

  const direct = [
    ["users", "users", "id", identifiers("users", users)],
    ["skills", "skills", "id", identifiers("skills", asArray(data.skills))],
    ["target skills", "target_skills", "id", identifiers("target skills", asArray(data.targetSkills))],
    ["courses", "courses", "id", identifiers("courses", asArray(data.courses))],
    ["chapters", "chapters", "id", identifiers("chapters", asArray(data.chapters))],
    ["assessments", "assessments", "id", identifiers("assessments", assessments)],
    ["cohorts", "cohorts", "id", identifiers("cohorts", asArray(data.cohorts))],
    ["enrollments", "enrollments", "id", identifiers("enrollments", enrollments)],
    ["assessment attempts", "assessment_attempts", "id", identifiers("assessment attempts", asArray(data.attempts))],
    ["proctoring events", "proctoring_logs", "id", identifiers("proctoring events", asArray(data.proctoringLogs))],
    ["certificates", "issued_certificates", "id", identifiers("certificates", asArray(data.issuedCertificates), (row) => row?.id || row?.certificateId)],
    ["candidate links", "candidate_assessment_links", "id", identifiers("candidate links", candidateLinks)],
    ["candidate submissions", "candidate_assessment_submissions", "id", identifiers("candidate submissions", candidateSubmissions)],
    ["candidate proctor events", "candidate_proctor_events", "id", identifiers("candidate proctor events", candidateEvents, (value) => value)],
    ["payment orders", "payment_orders", "order_id", identifiers("payment orders", asArray(data.paymentOrders), (row) => row?.orderId)],
    ["payment transactions", "payment_transactions", "id", identifiers("payment transactions", asArray(data.paymentTransactions), (row) => String(row?.id || "").toLowerCase())],
    ["payment webhook events", "payment_webhook_events", "event_id", identifiers("payment webhook events", asArray(data.paymentWebhookEvents), (row) => row?.eventId)],
    ["privacy requests", "privacy_requests", "id", identifiers("privacy requests", scheduledPrivacyRequestIds(users), (value) => value)],
    ["attendance records", "attendance_records", "id", identifiers("attendance records", asArray(data.attendanceLogs))],
    ["performance reviews", "performance_reviews", "id", identifiers("performance reviews", asArray(data.performanceReviews))],
    ["workplace communications", "workplace_communications", "id", identifiers("workplace communications", asArray(data.communications))],
    ["skill ratings", "skill_ratings", "id", identifiers("skill ratings", asArray(data.skillRatings))],
    ["chapter feedback", "chapter_feedbacks", "id", identifiers("chapter feedback", asArray(data.chapterFeedbacks))],
    ["AI feedback", "ai_generation_feedback", "id", identifiers("AI feedback", asArray(data.acharyaFeedbackMemory), (row) => String(row?.id || "").toLowerCase())],
    ["deletion archives", "deleted_archives", "source_key", identifiers("deletion archives", archives, (value) => value)],
    ["audit evidence", "audit_logs", "ingest_key", identifiers("audit evidence", auditKeys, (value) => value)],
    ["security evidence", "security_events", "ingest_key", identifiers("security evidence", securityKeys, (value) => value)],
  ].map(([name, table, column, values]) => ({ name, table, column, values }));

  const questionCounts = new Map(assessments.map((assessment) => [
    String(assessment.id),
    asArray(assessment.questions).length,
  ]));

  return {
    direct,
    questionCounts,
    settingsExpected: Boolean(data.settings && typeof data.settings === "object" && !Array.isArray(data.settings)),
    bindings: {
      certificates: asArray(data.issuedCertificates).map((row) => ({
        id: String(row.id || row.certificateId || ""),
        employeeId: String(row.employeeId || ""),
        courseId: String(row.courseId || ""),
        signature: String(row.signature || "").toLowerCase(),
        status: String(row.status || "Active"),
      })),
      candidateLinks: candidateLinks.map((row) => ({
        id: String(row.id || ""),
        assessmentId: String(row.assessmentId || ""),
        courseId: String(row.courseId || assessments.find((item) => item.id === row.assessmentId)?.courseId || ""),
        tokenHash: sha256(row.token || ""),
      })),
      candidateSubmissions: candidateLinks.flatMap((link) => asArray(link.submissions).map((row) => ({
        id: String(row.id || ""),
        linkId: String(link.id || ""),
        candidateEmail: String(row.candidateEmail || "").trim().toLowerCase(),
      }))),
      paymentOrders: asArray(data.paymentOrders).map((row) => ({
        id: String(row.orderId || ""),
        userId: String(row.userId || ""),
        courseId: String(row.courseId || ""),
        amountCents: Number(row.amountCents),
        currency: String(row.currency || "INR"),
      })),
    },
  };
}

async function selectByTextIdentifiers(client, table, column, values, selectedColumns = `${column}::text AS key`) {
  const rows = [];
  for (let offset = 0; offset < values.length; offset += CHUNK_SIZE) {
    const chunk = values.slice(offset, offset + CHUNK_SIZE);
    const result = await client.query(
      `SELECT ${selectedColumns} FROM ${table} WHERE ${column}::text = ANY($1::text[])`,
      [chunk],
    );
    rows.push(...result.rows);
  }
  return rows;
}

async function reconcile(client, expected) {
  const checks = [];
  for (const spec of expected.direct) {
    const rows = spec.values.length
      ? await selectByTextIdentifiers(client, spec.table, spec.column, spec.values)
      : [];
    const found = new Set(rows.map((row) => row.key));
    const missing = spec.values.filter((value) => !found.has(value));
    assert.equal(missing.length, 0, `${spec.name} reconciliation is missing ${missing.length} of ${spec.values.length} source rows`);
    checks.push({ name: spec.name, source: spec.values.length, matched: found.size });
  }

  const assessmentIds = [...expected.questionCounts.keys()];
  const questionRows = [];
  for (let offset = 0; offset < assessmentIds.length; offset += CHUNK_SIZE) {
    const result = await client.query(
      `SELECT assessment_id::text AS key, count(*)::integer AS count
         FROM questions
        WHERE assessment_id::text = ANY($1::text[])
        GROUP BY assessment_id`,
      [assessmentIds.slice(offset, offset + CHUNK_SIZE)],
    );
    questionRows.push(...result.rows);
  }
  const actualQuestionCounts = new Map(questionRows.map((row) => [row.key, Number(row.count)]));
  for (const [assessmentId, sourceCount] of expected.questionCounts) {
    assert.equal(actualQuestionCounts.get(assessmentId) || 0, sourceCount, `question count mismatch for assessment ${assessmentId}`);
  }
  checks.push({
    name: "assessment questions",
    source: [...expected.questionCounts.values()].reduce((sum, value) => sum + value, 0),
    matched: [...actualQuestionCounts.values()].reduce((sum, value) => sum + value, 0),
  });

  if (expected.settingsExpected) {
    const settings = await client.query("SELECT count(*)::integer AS count FROM system_settings WHERE key = 'proctoring'");
    assert.equal(Number(settings.rows[0]?.count), 1, "proctoring settings were not reconciled");
    checks.push({ name: "proctoring settings", source: 1, matched: 1 });
  }

  await reconcileBindings(client, expected.bindings, checks);
  return checks;
}

async function reconcileBindings(client, bindings, checks) {
  const certificateRows = bindings.certificates.length ? await selectByTextIdentifiers(
    client, "issued_certificates", "id", bindings.certificates.map((row) => row.id),
    "id::text AS key, employee_id, course_id, signature, status",
  ) : [];
  const certificates = new Map(certificateRows.map((row) => [row.key, row]));
  for (const expected of bindings.certificates) {
    const actual = certificates.get(expected.id);
    assert.ok(actual, `certificate ${expected.id} is missing`);
    assert.deepEqual(
      [actual.employee_id, actual.course_id, actual.signature, actual.status],
      [expected.employeeId, expected.courseId, expected.signature, expected.status],
      `certificate ${expected.id} binding mismatch`,
    );
  }

  const linkRows = bindings.candidateLinks.length ? await selectByTextIdentifiers(
    client, "candidate_assessment_links", "id", bindings.candidateLinks.map((row) => row.id),
    "id::text AS key, assessment_id, course_id, token_hash",
  ) : [];
  const links = new Map(linkRows.map((row) => [row.key, row]));
  for (const expected of bindings.candidateLinks) {
    const actual = links.get(expected.id);
    assert.ok(actual, `candidate link ${expected.id} is missing`);
    assert.deepEqual(
      [actual.assessment_id, actual.course_id, actual.token_hash],
      [expected.assessmentId, expected.courseId, expected.tokenHash],
      `candidate link ${expected.id} binding mismatch`,
    );
  }

  const submissionRows = bindings.candidateSubmissions.length ? await selectByTextIdentifiers(
    client, "candidate_assessment_submissions", "id", bindings.candidateSubmissions.map((row) => row.id),
    "id::text AS key, link_id, lower(candidate_email::text) AS candidate_email",
  ) : [];
  const submissions = new Map(submissionRows.map((row) => [row.key, row]));
  for (const expected of bindings.candidateSubmissions) {
    const actual = submissions.get(expected.id);
    assert.ok(actual, `candidate submission ${expected.id} is missing`);
    assert.deepEqual(
      [actual.link_id, actual.candidate_email],
      [expected.linkId, expected.candidateEmail],
      `candidate submission ${expected.id} binding mismatch`,
    );
  }

  const paymentRows = bindings.paymentOrders.length ? await selectByTextIdentifiers(
    client, "payment_orders", "order_id", bindings.paymentOrders.map((row) => row.id),
    "order_id::text AS key, user_id, course_id, amount_cents, currency",
  ) : [];
  const payments = new Map(paymentRows.map((row) => [row.key, row]));
  for (const expected of bindings.paymentOrders) {
    const actual = payments.get(expected.id);
    assert.ok(actual, `payment order ${expected.id} is missing`);
    assert.deepEqual(
      [actual.user_id, actual.course_id, Number(actual.amount_cents), actual.currency],
      [expected.userId, expected.courseId, expected.amountCents, expected.currency],
      `payment order ${expected.id} binding mismatch`,
    );
  }

  checks.push({
    name: "critical immutable bindings",
    source: bindings.certificates.length + bindings.candidateLinks.length
      + bindings.candidateSubmissions.length + bindings.paymentOrders.length,
    matched: certificateRows.length + linkRows.length + submissionRows.length + paymentRows.length,
    coverage: false,
  });
}

export async function verifyNormalizedReconciliation() {
  const sourceRevision = String(process.env.SOURCE_REVISION || "").trim();
  if (process.env.NODE_ENV === "production") {
    assert.match(sourceRevision, /^[0-9a-f]{40}$/, "SOURCE_REVISION must identify the deployed Git commit in production");
  }

  return withTransaction(async (client) => {
    await client.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ");
    const source = await client.query(
      "SELECT collection, data, updated_at FROM app_state ORDER BY collection",
    );
    assert.ok(source.rows.length > 0, "app_state contains no source snapshot to reconcile");
    const data = Object.fromEntries(source.rows.map((row) => [row.collection, row.data]));
    const sourceSnapshotSha256 = sha256(stableStringify(data));
    const sourceUpdatedAt = source.rows.reduce((latest, row) => {
      const value = new Date(row.updated_at).toISOString();
      return value > latest ? value : latest;
    }, "");
    const expected = collectExpectedRows(data);
    const checks = await reconcile(client, expected);
    const coverageChecks = checks.filter((check) => check.coverage !== false);
    const totalSourceRows = coverageChecks.reduce((sum, check) => sum + check.source, 0);
    const totalMatchedRows = coverageChecks.reduce((sum, check) => sum + check.matched, 0);
    assert.equal(totalMatchedRows, totalSourceRows, "aggregate normalized reconciliation mismatch");

    const report = {
      schemaVersion: 1,
      sourceSnapshotSha256,
      sourceUpdatedAt,
      sourceRevision: sourceRevision || null,
      totalSourceRows,
      totalMatchedRows,
      checks,
    };
    const evidenceKey = `normalized-reconciliation:${sourceSnapshotSha256}:${sourceRevision || "unversioned"}`;
    await client.query(
      `INSERT INTO audit_logs (
         actor_id, action, entity_type, entity_id, metadata, ingest_key
       ) VALUES (
         NULL, 'NORMALIZED_RECONCILIATION_PASSED', 'SYSTEM', $1, $2::jsonb, $3
       ) ON CONFLICT DO NOTHING`,
      [sourceSnapshotSha256, JSON.stringify(report), evidenceKey],
    );
    const evidence = await client.query(
      `SELECT count(*)::integer AS count
         FROM audit_logs
        WHERE ingest_key = $1
          AND action = 'NORMALIZED_RECONCILIATION_PASSED'`,
      [evidenceKey],
    );
    assert.equal(Number(evidence.rows[0]?.count), 1, "durable reconciliation evidence was not written");
    return report;
  });
}

const invokedDirectly = process.argv[1]
  && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  verifyNormalizedReconciliation()
    .then((report) => {
      for (const check of report.checks) {
        console.log(`ok - ${check.name}: ${check.matched}/${check.source}`);
      }
      console.log(`Normalized reconciliation passed (${report.totalMatchedRows} rows, snapshot ${report.sourceSnapshotSha256}).`);
    })
    .finally(() => closePool());
}
