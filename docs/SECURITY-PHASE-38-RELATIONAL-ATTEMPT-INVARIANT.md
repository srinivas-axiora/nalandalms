# Phase 38 — Relational attempt runtime invariant

Date: 2026-11-06
Status: **implemented, feature-gated, live staging proof pending**

## Outcome

`USE_PG_COURSES=1` now implies relational attempt authority everywhere, even
when the older `USE_PG_ATTEMPTS` flag is not set independently. A shared runtime
invariant is consumed by server startup/readiness, assessment delivery,
attempt authorization, the proctor cockpit, proctoring events and media, and
mobile companion pairing.

This closes a split-brain mode where an attempt could be authorized from
PostgreSQL but then have warnings, pause/resume, termination, anomaly events,
video chunks or companion state written only to a process-local mirror.

The proctor event path also avoids reading a snapshot assessment in relational
mode; that lookup is now limited to the compatibility-only time-accounting
branch.

## Verification

- A truth-table regression proves relational attempts are enabled by either
  the attempt flag or the course flag and disabled only when both are off.
- An architectural source gate covers every attempt read/write surface and
  rejects reintroduction of direct `USE_PG_ATTEMPTS` branching.
- The course-cutover readiness regression proves the attempt schema check is
  activated in normalized mode even without the standalone attempt flag.
- Full functional suite: **75 files / 339 tests passed**.
- Adversarial security suite: **1 file / 32 tests passed**.
- JavaScript syntax validation, frontend typecheck and production build pass.
- Authorization inventory remains **129 routes**.
- The production build retains the known large-bundle warning
  (approximately 1,010.55 kB / 283.21 kB gzip).

## Remaining release blockers

- Validate this invariant against staging RDS across multiple ECS tasks,
  including concurrent pause/resume, termination, chunk append and pairing.
- Finish the remaining non-proctor learning consumers before removing the
  production course-cutover prohibition.

Production decision remains **NO-GO**.
