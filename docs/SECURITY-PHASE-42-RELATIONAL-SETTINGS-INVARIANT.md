# Phase 42 — Relational exam-policy runtime invariant

Date: 2026-11-08
Status: **implemented, feature-gated, live staging proof pending**

## Outcome

`USE_PG_COURSES=1` now implies relational settings authority even when
`USE_PG_SETTINGS` is not independently enabled. Settings administration,
assessment-attempt start and live proctor-event processing therefore use one
PostgreSQL-backed proctor policy across every application task.

This closes a multi-task policy split in which camera, microphone, fullscreen,
tab-switch, noise and maximum-flag rules could differ by process while attempts
and proctor evidence were otherwise relational.

## Verification

- A truth-table regression proves relational settings authority is enabled by
  either the settings flag or the course flag.
- A route regression proves the course flag alone reads proctor policy from the
  relational settings repository.
- Architectural source gates cover server readiness/app-data, settings
  administration, attempt start and proctor-event enforcement.
- Course-cutover readiness now requires initialized relational settings.
- Focused settings, readiness and runtime suites pass.
- Functional suite: **79 files / 360 tests passed**.
- Adversarial security suite: **1 file / 32 tests passed**.
- JavaScript syntax checks, frontend TypeScript checking and the production
  Vite build passed.
- Authorization inventory remains **129 routes**.
- `git diff --check` passed. The production build retains the existing
  non-blocking large JavaScript bundle warning (1,010.55 kB; 283.21 kB gzip).

## Remaining release blockers

- Exercise policy updates while attempts run across multiple ECS tasks and
  prove every task observes the committed setting without restart.
- Validate row-lock contention, audit delivery and rollback behavior against
  staging RDS.
- Reconcile the intended initial production policy before cutover; do not rely
  on process-local defaults as migration input.

Production decision remains **NO-GO**.
