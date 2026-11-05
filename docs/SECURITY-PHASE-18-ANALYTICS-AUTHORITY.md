# Phase 18 — relational analytics authority

Date: 2026-11-05
Status: **implemented, feature-gated, live PostgreSQL proof pending**
Production decision: **NO-GO remains unchanged**

## Outcome

The experimental `USE_PG_COURSES=1` path now derives global, team, personal
and learning-time analytics from normalized PostgreSQL state. The previous
hard-coded dashboard values and process-local enrollment/time-event reads are
no longer used when relational learning mode is selected.

No migration is required. The authority reads `users`, `departments`,
`courses`, `enrollments`, `chapters`, `chapter_time_totals`,
`assessment_attempts`, `learning_time_events` and `skill_ratings`.

## Controls implemented

- Organization metrics and performer rankings are computed from current
  relational rows rather than constants.
- Manager analytics constrain users by `manager_id` inside SQL and return only
  public identity fields; no credential or session fields are selected.
- Personal analytics are subject-bound and derive progress, completion, skill
  bands and course suggestions from the authenticated user's rows.
- Learning-time rows reconcile canonical chapter totals, assessment attempt
  time and enrollment course totals.
- Administrator and Manager visibility is expressed in each time/event query,
  preventing a process-local scope projection from drifting across replicas.
- Event retrieval has deterministic ordering and a strictly validated limit of
  1 through 500.
- The legacy analytics handlers remain available only while
  `USE_PG_COURSES=0`; there are no dual reads or writes on the selected path.

## Local evidence

- Repository tests cover database-derived organization metrics, manager scope,
  personal analytics, canonical time mapping and parameterized event limits.
- Route tests cover relational delegation, time summaries and invalid-limit
  rejection.
- A cutover test proves `USE_PG_COURSES=1` selects database-derived personal
  analytics rather than the hard-coded legacy response.
- `db:verify-analytics` creates isolated relational evidence, reconciles team,
  personal and time results, checks outsider exclusion and cleans up. It fails
  closed when no PostgreSQL connection is configured.

Checkpoint evidence on 2026-11-05:

- `npm test`: 42 files and 239 functional tests passed.
- `npm run test:security`: 1 file and 32 adversarial tests passed.
- `npm run typecheck`: passed with no TypeScript errors.
- `npm run build`: production build passed (996 modules transformed). The
  generated JavaScript bundle remains about 1,010 kB before gzip and carries a
  non-blocking code-splitting warning that should be addressed as performance
  debt before broad rollout.
- `npm run routes:inventory`: passed and includes all five Phase-18 endpoints.
- `npm audit --json`: 0 vulnerabilities across 393 dependencies.
- `node --check` passed for the repository, route module and live verifier;
  `git diff --check` passed apart from Git's existing line-ending notice.

## Required staging gate

After migration/backfill reconciliation in isolated staging, run:

```powershell
npm run db:verify-analytics
```

Then compare canary responses with direct read-only SQL for:

1. Administrator organization counts, completion rate and average score.
2. A Manager with direct reports and a Manager with no reports.
3. A learner with no enrollments/ratings and a learner with mixed outcomes.
4. Chapter, assessment and course time where several chapters and attempts
   exist, including course-level attempts without a chapter.
5. Event listing/count parity and 1, 100 and 500 row limits.
6. Negative cross-manager and unrelated-user scope checks.

## Remaining blockers

Report export generation and AI course generation still consume process-local
state. Production continues to reject `USE_PG_COURSES=1`; live RDS analytics
reconciliation has not been executed from this workspace.
