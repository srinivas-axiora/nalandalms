# Phase 16 — transactional assignment authority

Date: 2026-11-05
Status: **implemented, feature-gated, live PostgreSQL proof pending**
Production decision: **NO-GO remains unchanged**

## Outcome

The experimental `USE_PG_COURSES=1` path now sends course-assignment writes to
PostgreSQL instead of mutating the process-local `assignments` array. Course
authorization, assignee scope, duplicate detection, enrollment inserts and
audit evidence execute as one transaction.

No new schema migration is required. The authority uses the normalized
`courses`, `users`, `enrollments` and `audit_logs` tables and the existing
unique `(course_id, user_id)` enrollment invariant.

## Controls implemented

- Assignment requests use a strict schema, bounded batches of at most 500
  assignees, normalized identifiers and a validated ISO due date.
- The course must exist and be active and approved.
- An administrator may assign any active account. A Manager must own the course
  and may assign only active direct reports, never themselves.
- Assignee IDs are deduplicated before entering the transaction.
- Existing enrollments are detected before inserts. The database unique
  constraint independently closes concurrent check/insert races and is mapped
  to the same stable `ALREADY_ASSIGNED` conflict.
- Any invalid assignee or duplicate rejects the whole batch; no partial
  enrollment set or audit record commits.
- Successful enrollment rows and one allowlisted audit record commit together.
- The legacy handler remains available only while `USE_PG_COURSES=0`, preserving
  rollback without creating dual writes.

## Evidence

- Repository tests cover foreign course ownership, active direct-report scope,
  successful atomic batches, pre-existing enrollment conflicts and concurrent
  unique-constraint conflict mapping.
- Route tests cover bounded validation, request deduplication and stable error
  contracts.
- A cutover-selection test proves the flag registers the relational handler
  instead of the process-local mutation path.
- `db:verify-assignments` creates isolated synthetic rows, tests foreign-owner
  denial and duplicate rejection, races two real transactions, checks the
  resulting enrollment/audit cardinality and removes its evidence.
- The verifier fails closed when neither `DATABASE_URL` nor `PGHOST` is present;
  live execution remains a staging requirement.
- Functional regression: 36 files and 219 tests passed.
- Adversarial security regression: 32 of 32 tests passed.
- Frontend typecheck, production build and authorization-route inventory passed.
- The live registry audit reported zero vulnerabilities across 393 dependencies.
- `git diff --check` and JavaScript syntax checks passed.

## Required staging gate

Keep `USE_PG_COURSES=0` on production tasks. After snapshot, migration and
backfill in isolated staging, run:

```powershell
npm run db:verify-courses
npm run db:verify-learning
npm run db:verify-assessments
npm run db:verify-assignments
```

Then enable `USE_PG_COURSES=1` only on a non-ALB canary task and confirm:

1. A foreign Manager cannot assign another owner's course.
2. A Manager cannot assign themselves, an inactive account or a non-report.
3. A mixed valid/invalid batch creates no enrollments.
4. Concurrent requests for the same learner/course yield one 201 and one 409.
5. Every committed batch has matching durable audit evidence.
6. Readiness remains HTTP 503 while remaining secondary consumers are local.

## Remaining blockers

Cohorts still use process-local state and have race-prone capacity enforcement.
Reports, application-wide analytics and AI course generation also remain local
learning consumers. Production still rejects `USE_PG_COURSES=1`; no live RDS
verifier has been executed in this workspace.
