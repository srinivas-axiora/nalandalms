# Phase 12 — transactional course authority foundation

Date: 2026-11-05
Status: **course authority implemented, feature-gated, incomplete cutover**
Production decision: **NO-GO remains unchanged**

## Outcome

The course catalog and course lifecycle now have a transaction-capable
PostgreSQL authority behind `USE_PG_COURSES=1`. The authority provides
parameterized catalog search, database-scoped visibility, immutable version
history, optimistic concurrency, durable audit coupling, race-safe free
enrollment and fail-closed deletion.

This flag is deliberately not deployable yet. If enabled, `/api/ready` returns
503 with `experimental-course-only`, so an ECS task is removed from ALB service.
Production startup also rejects the flag as a second independent interlock.
Chapters, learning progress, assessment definitions, uploads, cohorts and AI
course generation still contain process-local consumers and must be migrated
before the interlock can be removed.

## Controls implemented

- Catalog filters and search values are SQL parameters; catalog rows are limited
  to approved, active courses and include database-derived counts.
- Learner visibility is enrollment-joined. Managers see owned courses plus the
  approved catalog; administrators retain organization scope.
- Course creation, version history and audit evidence commit in one transaction.
- Managers create pending content; administrator-owned content is approved.
- Update, review, status and deletion paths use a locked row and expected
  version. Stale writers receive a stable `VERSION_CONFLICT`.
- A manager cannot update or duplicate another manager's course.
- Course approval now requires step-up in both legacy and relational modes; the
  relational path also requires a review reason.
- Free self-enrollment locks the course and relies on the database uniqueness
  constraint, making concurrent retries idempotent.
- Paid courses fail with payment-required and continue through the signed
  payment ledger rather than receiving a direct entitlement.
- Deletion archives authoring data but refuses to destroy a course when any
  enrollment, payment order, attempt, certificate, candidate link, proctor
  capture, feedback or learning-time history remains.
- Course storage metadata is JSON-constrained. New relational course creation
  accepts metadata only; media continues through scoped object-store grants.

## Schema and code

- `0011_learning_content_authority.sql` adds course content/storage metadata,
  durable enrollment heartbeat/progress state, enrollment versions and indexes.
- `courses-authority.repository.pg.js` is the transactional authority.
- `courses.pg.routes.js` exposes the guarded API contract.
- `verify-courses.mjs` is a self-cleaning live PostgreSQL verifier.
- AWS staging and `.env.example` explicitly keep `USE_PG_COURSES` disabled.

## Local evidence

The 2026-11-05 local gate completed with:

- Functional suite: 27 files and 173 tests passed.
- Security regression suite: 30 tests passed.
- Phase 12 focus: 3 files and 12 tests passed, covering transaction coupling,
  parameter binding, ownership, stale writes, enrollment races, safe deletion,
  step-up and the 503 deployment interlock.
- TypeScript checking, production build and documented-route inventory passed.
- JavaScript syntax checks and `git diff --check` passed.
- `npm audit --json` reported zero known vulnerabilities across 393 packages.
- The AWS staging CloudFormation template parsed locally with 38 resources and
  explicitly keeps `USE_PG_COURSES=0`.

The existing production-build warning remains: the main JavaScript chunk is
approximately 1.01 MB and should be split for performance, but it is not a
Phase 12 integrity failure.

The live PostgreSQL verifier was also exercised fail-closed and refused to run
without database configuration. No RDS/PostgreSQL endpoint was available in
this workspace, so migration execution, engine-level constraints, transaction
races and cleanup against the target database remain unproven staging gates.
Local green evidence does not authorize enabling `USE_PG_COURSES`.

## Required staging gate

Keep `USE_PG_COURSES=0`, take an RDS snapshot, then run:

```powershell
npm run db:migrate
npm run db:backfill
npm run db:verify-courses
```

Reconcile before any cutover experiment:

```sql
SELECT count(*) AS courses_without_owner
FROM courses c
LEFT JOIN users u ON u.id = c.owner_id
WHERE u.id IS NULL;

SELECT id, current_version
FROM courses
WHERE current_version < 1;

SELECT course_id, version, count(*)
FROM course_versions
GROUP BY course_id, version
HAVING count(*) > 1;

SELECT course_id, user_id, count(*)
FROM enrollments
GROUP BY course_id, user_id
HAVING count(*) > 1;

SELECT count(*) AS malformed_course_storage
FROM courses
WHERE jsonb_typeof(storage_metadata) <> 'object';

SELECT count(*) AS malformed_enrollment_runtime
FROM enrollments
WHERE jsonb_typeof(chapter_heartbeat_timestamps) <> 'object'
   OR jsonb_typeof(video_progress) <> 'object'
   OR version < 0;
```

All anomaly counts must be zero. The live verifier must prove version conflict,
approval, idempotent enrollment, history-protected deletion and archive/audit
survival against the target RDS engine.

## Remaining work before this flag may serve traffic

1. Move chapter CRUD, locked-content delivery and chapter sequencing to a
   transactional repository with owner and enrollment checks.
2. Move heartbeat/video progress to atomic database updates with idempotency or
   server-clock clamping; process-local timestamp maps cannot remain.
3. Move assessment/question authoring and eligibility reads to PostgreSQL.
4. Update upload/content download authorization, cohorts, reports and AI course
   generation to read authoritative course ownership from PostgreSQL.
5. Reconcile `/api/app-data` and remove the course/chapter/enrollment arrays as
   authorization inputs.
6. Run duplicate create/update/enroll/delete races across at least two ECS
   tasks, replace tasks mid-transaction and prove no stale projection is used.
7. Only then remove the deliberate readiness interlock and enable the flag in a
   staging canary. Production remains prohibited until that canary passes.

## Rollback

The flag remains off, so rollback is currently code/config only. Once a canary
begins, stop relational writes before reverting; do not silently return to a
stale JSON snapshot. Preserve version, audit and archive evidence.
