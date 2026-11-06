# Phase 36 — Proctor cockpit authority

Date: 2026-11-06
Status: **implemented, feature-gated, live staging proof pending**

## Outcome

When `USE_PG_COURSES=1`, the active proctor cockpit no longer joins relational
attempts to process-local users, assessments or courses. PostgreSQL applies the
assigned-proctor, assessment-owner and course-owner scope before returning any
session.

The query projects only the operational fields required by the grid. It does
not select exam answers, question maps or manual grades. Attempt duration uses
the immutable duration snapshot captured when the exam began rather than a
subsequently edited assessment duration.

## Controls and tests

- Instructor and Manager visibility is enforced inside the relational query;
  administrators use an explicit boolean predicate and remain actor-bound.
- Candidate identity labels come from the same database transaction boundary
  as attempt, assessment and course labels.
- A standalone assessment remains representable through a left course join.
- Repository tests inspect both authorization predicates and the absence of
  sensitive exam columns.
- Route tests prove the relational authority is selected, role middleware runs
  before the database query, risk sorting remains intact and sensitive attempt
  internals are not serialized.
- Full functional suite: **74 files / 332 tests passed**.
- Adversarial security suite: **1 file / 32 tests passed**.
- JavaScript syntax validation, frontend typecheck and production build pass.
- Authorization inventory remains **129 routes**.
- The production build retains the known large-bundle warning
  (approximately 1,010.55 kB / 283.21 kB gzip).

## Remaining release blockers

- Move timeline identity/assessment labels and the remaining proctoring
  secondary reads off compatibility snapshots.
- Exercise reassignment, role revocation, concurrent pause/resume and cockpit
  refresh across multiple staging ECS tasks backed by RDS.

Production decision remains **NO-GO**.
