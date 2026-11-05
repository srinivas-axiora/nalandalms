# Phase 13 — transactional chapter and progress authority

Date: 2026-11-05
Status: **implemented, feature-gated, live database proof pending**
Production decision: **NO-GO remains unchanged**

## Outcome

The experimental `USE_PG_COURSES=1` path now extends from course metadata into
chapter authoring, locked-content delivery, video resume state and learner time
accumulation. The feature remains unavailable to production: configuration
rejects it during production startup, readiness reports
`experimental-learning-partial`, and AWS staging explicitly sets the flag to
zero.

This phase does not claim a complete learning cutover. Assessment eligibility,
uploads, cohorts, reports and AI course generation still contain process-local
course or chapter consumers. They must move to relational policy before the
readiness and startup interlocks can be removed.

## Controls implemented

- Chapter list access is derived from a locked course row and database
  enrollment. Locked chapters return metadata only; body, URL and filename are
  not serialized.
- Chapter create/update requires course ownership or administrator authority.
  Both course and chapter optimistic versions protect authoring writes.
- Chapter writes, course version history and audit evidence share one database
  transaction. Manager edits return the course to pending review.
- Heartbeats lock the enrollment row so concurrent ECS tasks cannot overwrite
  one another's progress.
- Every time write requires a 16–128 character idempotency key. A partial unique
  index prevents retry duplication, and reuse for a different chapter fails.
- The database clock, not client time, limits accumulation. The first write is
  capped at 15 seconds; subsequent writes cannot exceed elapsed whole seconds
  or the 30-second request cap.
- Client video position is stored for resume UX but cannot independently mark a
  chapter complete. Completion is based on accumulated server-controlled time.
- Enrollment state, JSON API projection, canonical `chapter_time_totals`, the
  immutable learning-time event and completion/clamp audit records commit in a
  single transaction.
- Video progress updates validate enrollment and prerequisite access and retain
  a monotonic maximum position even when the learner seeks backward.

## Schema and code

- `0012_chapter_progress_authority.sql` adds chapter versions and durable
  heartbeat idempotency/claimed-time evidence.
- `learning-authority.repository.pg.js` owns transactional authoring, access,
  progress, totals and event operations.
- `chapters.pg.routes.js` provides strict request validation and stable error
  contracts while preserving the existing route shapes.
- `verify-learning.mjs` is a self-cleaning live PostgreSQL verifier.
- The backfill now preserves chapter versions and the enrollment repository maps
  heartbeat, video and version fields.

## Local evidence

The 2026-11-05 local gate completed with:

- Functional suite: 29 files and 185 tests passed.
- Security regression suite: 30 tests passed.
- Focused learning gate: 4 files and 25 tests passed. This includes 12 new
  relational chapter/progress tests plus the readiness and existing end-to-end
  progression tests.
- TypeScript checking, production build and documented-route inventory passed.
- JavaScript syntax and package JSON parsing passed; final diff checks are part
  of the checkpoint gate.
- `npm audit --json` reported zero known vulnerabilities across 393 packages.
- The AWS staging template parsed locally with 38 resources and explicitly
  keeps `USE_PG_COURSES=0`.

Repository coverage includes locked DTO redaction, transactional version/audit
coupling, stale writers, idempotent retries, canonical time evidence, completion
and rapid-heartbeat rejection. Route coverage includes authentication, version
requirements, mandatory idempotency and stable locked errors.

The existing production-build warning remains: the main JavaScript chunk is
approximately 1.01 MB and should be split for performance.

The live verifier fails closed when no PostgreSQL target is configured. No
PostgreSQL/RDS endpoint was available in this workspace, so migration execution,
database constraints, real transaction rollback and cross-task races remain
unproven staging gates. A local `psql` client was unavailable and Docker could
not reach its WSL service (`E_ACCESSDENIED`), so no substitute engine proof was
possible. This local evidence does not authorize enabling the feature flag.

## Required staging gate

Keep `USE_PG_COURSES=0`, snapshot RDS, then run:

```powershell
npm run db:migrate
npm run db:backfill
npm run db:verify-courses
npm run db:verify-learning
```

Reconcile:

```sql
SELECT count(*) AS invalid_chapter_versions
FROM chapters
WHERE version < 1;

SELECT user_id, course_id, idempotency_key, count(*)
FROM learning_time_events
WHERE idempotency_key IS NOT NULL
GROUP BY user_id, course_id, idempotency_key
HAVING count(*) > 1;

SELECT e.user_id, e.course_id, e.chapter_id,
       e.event_seconds, t.time_spent_seconds AS total_seconds
FROM (
  SELECT user_id, course_id, chapter_id, sum(seconds_spent) AS event_seconds
  FROM learning_time_events
  WHERE event_type = 'CHAPTER_TIME'
  GROUP BY user_id, course_id, chapter_id
) e
FULL JOIN chapter_time_totals t
  USING (user_id, course_id, chapter_id)
WHERE COALESCE(e.event_seconds, 0) <> COALESCE(t.time_spent_seconds, 0);

SELECT id
FROM enrollments
WHERE jsonb_typeof(chapter_time_spent_seconds) <> 'object'
   OR jsonb_typeof(chapter_heartbeat_timestamps) <> 'object'
   OR jsonb_typeof(video_progress) <> 'object'
   OR version < 0;
```

All queries must return zero anomalies. Run concurrent same-key, different-key,
cross-chapter and locked-chapter heartbeats through at least two ECS tasks. Kill
one task during a transaction and confirm that totals, events and enrollment
state either all commit or all roll back.

## Remaining release blockers

1. Move assessment/question authoring and assessment eligibility to the same
   relational course/enrollment authority.
2. Make upload grants and content download authorization read the relational
   chapter and enrollment policy.
3. Migrate cohorts, reports, analytics and AI generation away from process-local
   course/chapter arrays.
4. Reconcile historical time events and investigate any drift before canary.
5. Execute the live verifier and multi-task races against the actual RDS engine.
6. Keep readiness unhealthy and production startup prohibited until all of the
   above pass.

## Rollback

The feature flag remains off, so rollback is code/config only. After any future
canary begins, stop relational writers before reverting and preserve chapter
versions, time events, canonical totals and audit records for reconciliation.
