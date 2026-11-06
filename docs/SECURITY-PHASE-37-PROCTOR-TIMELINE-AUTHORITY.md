# Phase 37 — Proctor timeline authority

Date: 2026-11-06
Status: **implemented, feature-gated, live staging proof pending**

## Outcome

When `USE_PG_COURSES=1`, incident timeline replay no longer resolves candidate
or assessment labels from process-local arrays. After the central attempt
permission middleware succeeds, PostgreSQL rechecks assigned-proctor,
assessment-owner or course-owner scope while returning only the candidate name
and assessment title.

The second scope check closes a time-of-check/time-of-use window: if ownership
or proctor assignment is revoked between the attempt lookup and timeline
rendering, the route now fails closed with HTTP 403.

## Verification

- Repository tests cover assigned-proctor, assessment-owner and course-owner
  predicates, actor binding, minimal column selection and revocation returning
  no context.
- Existing cockpit regressions continue to cover chronological rendering and
  the compatibility path.
- Full functional suite: **74 files / 334 tests passed**.
- Adversarial security suite: **1 file / 32 tests passed**.
- JavaScript syntax validation, frontend typecheck and production build pass.
- Authorization inventory remains **129 routes**.
- The production build retains the known large-bundle warning
  (approximately 1,010.55 kB / 283.21 kB gzip).

## Remaining release blockers

- Move remaining proctoring secondary reads away from compatibility state.
- Exercise ownership and proctor reassignment during timeline requests across
  multiple ECS tasks against staging RDS.

Production decision remains **NO-GO**.
