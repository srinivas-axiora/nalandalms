# Phase 17 — transactional cohort authority

Date: 2026-11-05
Status: **implemented, feature-gated, live PostgreSQL proof pending**
Production decision: **NO-GO remains unchanged**

## Outcome

The experimental `USE_PG_COURSES=1` path now moves cohort creation, discovery,
membership and analytics off process-local arrays. Cohort capacity is enforced
inside a transaction that locks the target cohort before counting or inserting
members, closing the previous final-seat race across application replicas.

Migration `0014_cohort_authority.sql` adds normalized cohorts and an optional
foreign-keyed `enrollments.cohort_id`. The snapshot backfill now imports cohorts
before enrollments and converts invite codes to one-way SHA-256 digests. Cohorts
with legacy short or missing invites are imported inactive so an unusable or
weak bearer credential cannot remain live after cutover.

## Controls implemented

- Creation requires an active approved course and administrator or course-owner
  authority. The cohort and allowlisted audit record commit together.
- Capacity is bounded from 1 to 10,000 and date ranges are validated in both
  application and database constraints.
- Invite codes carry about 60 bits of cryptographic randomness, are returned
  once at creation and are stored only as normalized SHA-256 digests. Legacy
  six-character codes do not satisfy the relational route and must be reissued
  during staging cutover.
- List and detail reads reveal cohorts only to administrators, cohort creators,
  course owners or enrolled members. Invite material is never serialized.
- Join locks the cohort and course row, verifies active account/course state,
  handles idempotent retries before capacity rejection and commits membership
  plus audit evidence atomically.
- The `(course_id, user_id)` enrollment invariant independently closes
  concurrent new-enrollment races and maps them to a stable conflict.
- Analytics is database-derived and restricted to administrators, the cohort
  instructor or the course owner.
- The legacy cohort module remains available only while `USE_PG_COURSES=0`;
  there are no dual writes.

## Local evidence

- Repository tests cover invite hashing, foreign-owner denial, atomic creation,
  idempotent membership, locked capacity rejection and transactional join/audit.
- Route tests cover one-time invite delivery, digest delegation, malformed
  invite rejection, stable capacity errors and response secrecy.
- A cutover test proves `USE_PG_COURSES=1` selects the relational module.
- `db:verify-cohorts` fails closed without PostgreSQL and is designed to race two
  real transactions for a one-seat cohort, then reconcile membership, audit and
  invite-digest invariants.
- Functional regression: 39 files and 230 tests passed.
- Adversarial security regression: 32 of 32 tests passed.
- Frontend typecheck, production build and authorization-route inventory passed.
- The live registry audit reported zero vulnerabilities across 393 dependencies.
- JavaScript syntax checks and `git diff --check` passed.

## Required staging gate

Keep `USE_PG_COURSES=0` on production tasks. After snapshot, migrations and
backfill in isolated staging, run:

```powershell
npm run db:verify-courses
npm run db:verify-learning
npm run db:verify-assessments
npm run db:verify-assignments
npm run db:verify-cohorts
```

Then enable `USE_PG_COURSES=1` only on a non-ALB canary task and confirm:

1. Foreign staff cannot create cohorts for courses they do not own.
2. A learner cannot enumerate a cohort before membership.
3. Invite codes appear only in the successful creation response and never in
   storage, logs, list/detail or analytics responses.
4. Two simultaneous joins for the final seat yield one success and one stable
   capacity rejection, with exactly one membership and one join audit record.
5. Repeating the successful join is idempotent even when the cohort is full.
6. Course deactivation, cohort expiry and inactive users all fail closed.
7. Readiness remains HTTP 503 while remaining secondary consumers are local.

## Remaining blockers

Reports, application-wide analytics and AI course generation remain
process-local learning consumers. Production still rejects
`USE_PG_COURSES=1`; migration/backfill reconciliation and live RDS verifiers
have not been executed from this workspace.
