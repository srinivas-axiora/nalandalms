# Phase 14 — transactional assessment authority

Date: 2026-11-05
Status: **implemented, feature-gated, live database proof pending**
Production decision: **NO-GO remains unchanged**

## Outcome

The experimental `USE_PG_COURSES=1` path now owns assessment and question
authoring, review, lifecycle state, learner eligibility and authenticated exam
start in PostgreSQL. Course, chapter, enrollment, assessment, question, attempt
and audit decisions involved in starting an exam now share one relational trust
boundary.

The feature remains prohibited in production. Production configuration rejects
the flag, readiness returns 503 with mode
`experimental-learning-secondary-consumers`, and the AWS staging task definition
keeps `USE_PG_COURSES=0`. Upload/content grants, cohorts, assignments, reports,
analytics and AI generation still have process-local course consumers.

## Controls implemented

- Assessment list scope comes from relational course ownership or enrollment.
  Non-owners never receive answers, expected answers, rubrics or explanations.
- Assessment create/update locks the course, checks owner/admin authority and
  requires optimistic course and assessment versions.
- Questions are normalized rows with constrained positive points and a separate
  metadata object. MCQ answers are validated against the option count.
- Every authoring/review/status transition records an immutable assessment
  snapshot, advances the parent course version and writes audit evidence in the
  same transaction.
- New assessments and every substantive edit return to pending review,
  including administrator-authored changes; an existing approval cannot survive
  a question, threshold or timing mutation.
- Approval requires administrator role, recent step-up authentication, current
  versions and meaningful review feedback.
- Deletion requires step-up, archives the current assessment, and refuses to
  remove any assessment referenced by an authenticated attempt or public
  candidate link.
- Learner eligibility is derived from the approved active assessment/course,
  relational enrollment and complete relational chapter set under database
  locks. Client-reported progress is not trusted.
- A partial unique index permits only one active or paused attempt for each
  learner/assessment pair. Eligibility, blind question selection, attempt insert
  and start audit commit atomically.
- Each attempt freezes its assessment version, duration, pass score, shuffled
  question text/options and server-only answer map. Later authoring changes or
  deactivation cannot change an in-flight attempt's clock or grading threshold.
- Relational attempt reads are automatically selected with the course cutover,
  preventing split authority when `USE_PG_ATTEMPTS` is independently disabled.
- Candidate-link creation reads and authorizes the relational source assessment
  when both candidate and learning flags are enabled, then freezes its own
  immutable runtime snapshot.
- The assessment console sends course/assessment versions, advances its local
  course version after each mutation, supplies review evidence and accepts the
  server's normalized question identifiers. Legacy mode ignores the extra
  concurrency fields, preserving rollback compatibility.

## Schema and code

- `0013_assessment_authority.sql` adds assessment versions, constrained question
  metadata, immutable attempt settings and the one-active-attempt invariant.
- `assessment-authority.repository.pg.js` owns transactional authoring,
  projection, eligibility and attempt start.
- `assessments.pg.routes.js` provides strict input validation and stable error
  contracts while retaining the existing HTTP route shapes.
- `verify-assessments.mjs` is a self-cleaning live PostgreSQL verifier covering
  review, eligibility, immutable settings, duplicate starts and deletion safety.
- The backfill normalizes assessment questions, creates an initial version and
  populates attempt snapshots from the best historical assessment state
  available.

## Local evidence

The 2026-11-05 local release gate completed with:

- Functional suite: 32 files and 201 tests passed.
- Security regression suite: 30 adversarial tests passed.
- Focused assessment gate: 6 files and 31 tests passed, including repository,
  route selection, readiness, persistence and end-to-end blind-exam coverage.
- TypeScript checking, production build and documented-route inventory passed.
- JavaScript syntax checks and `git diff --check` passed.
- `npm audit --json` reported zero known vulnerabilities across 393 packages.
- The AWS staging template parsed locally with 38 resources and explicitly
  keeps `USE_PG_COURSES=0`.

The full suite's fresh-server readiness import now has a 30-second hook budget;
the module graph exceeded Vitest's 10-second default under full parallel load.
The assertion remains fail-closed and returned HTTP 503 when the experimental
flag was enabled.

The existing production build warning remains: the main JavaScript chunk is
approximately 1.01 MB and should be split for performance.

The live verifier fails closed when no PostgreSQL target is configured. No
PostgreSQL/RDS endpoint was available in this workspace, `psql` was unavailable,
and Docker could not access its WSL backend. Consequently migration execution,
real constraint behavior, transaction rollback and multi-task races remain
unproven staging gates. Local mocks do not authorize enabling the feature flag.

## Required staging gate

Keep `USE_PG_COURSES=0`, snapshot RDS, then run:

```powershell
npm run db:migrate
npm run db:backfill
npm run db:verify-courses
npm run db:verify-learning
npm run db:verify-assessments
```

Reconcile:

```sql
SELECT id
FROM assessments
WHERE version < 1;

SELECT assessment_id, version, count(*)
FROM assessment_versions
GROUP BY assessment_id, version
HAVING count(*) > 1;

SELECT id
FROM assessment_attempts
WHERE assessment_version < 1
   OR duration_minutes_snapshot NOT BETWEEN 1 AND 360
   OR pass_score_snapshot NOT BETWEEN 1 AND 100;

SELECT assessment_id, user_id, count(*)
FROM assessment_attempts
WHERE status IN ('InProgress', 'Paused')
GROUP BY assessment_id, user_id
HAVING count(*) > 1;

SELECT q.id
FROM questions q
LEFT JOIN assessments a ON a.id = q.assessment_id
WHERE a.id IS NULL
   OR q.points <= 0
   OR jsonb_typeof(q.metadata) <> 'object';
```

All queries must return zero anomalies. Through at least two ECS tasks, race two
attempt starts for the same learner/assessment and prove exactly one commits.
Race assessment edits/reviews against stale versions, kill a task during start,
and prove attempt/audit rows either both commit or both roll back. Edit and then
deactivate an assessment after an attempt begins; submission and grading must
continue using the attempt-bound question map, duration and pass score.

## Remaining release blockers

1. Make upload grants and content downloads authorize against relational course,
   chapter and enrollment policy; add scan/quarantine evidence.
2. Migrate assignments and cohorts, including invite secrecy, membership scope
   and race-safe capacity enforcement.
3. Move reports, analytics and AI course generation away from process-local
   course/chapter/assessment arrays.
4. Execute every relational verifier and multi-task race against the real RDS
   engine, then reconcile source/target counts and hashes.
5. Complete AWS staging deployment, restore/failover/load/rollback drills and
   operational monitoring before any production go decision.
6. Keep readiness unhealthy and production startup prohibited until all of the
   above pass.

## Rollback

The AWS and production flags remain off, so the current rollback is code/config
only. After a future canary starts writing relational data, stop writers before
reverting and preserve assessment versions, attempts, audit rows and archives
for reconciliation. Never backfill mutable authoring values over existing
attempt snapshots.
