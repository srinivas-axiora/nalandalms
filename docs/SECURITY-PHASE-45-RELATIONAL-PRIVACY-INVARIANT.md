# Phase 45 — Relational privacy runtime invariant

Date: 2026-11-08
Status: **implemented, feature-gated, live staging proof pending**

## Outcome

`USE_PG_COURSES=1` now implies relational privacy authority even when
`USE_PG_PRIVACY` is not independently enabled. Data export, deletion intake,
workflow status, cancellation, administrator review, legal hold, object outbox,
pseudonymization and completion evidence therefore use the durable PostgreSQL
workflow for a relational learning deployment.

This removes the process-local deletion map from the course-cutover path. The
erasure worker and a versioned `PRIVACY_COVERAGE_ACK` remain explicit controls
(Phase 50 supersedes the original `normalized-v1` value with `normalized-v2`):
readiness fails until both are deliberately enabled and the schema checks pass.
Course cutover does not silently execute destructive erasure work.

## Verification

- A truth-table regression proves relational privacy authority is enabled by
  either the privacy flag or the course flag.
- A route regression proves the course flag alone reads a durable deletion
  request through the relational privacy repository and current identity.
- Architectural source gates cover server readiness/worker startup and privacy
  route selection.
- Course-cutover readiness now enters normalized privacy mode and remains
  unavailable without schema, worker and coverage evidence.
- Focused privacy repository, erasure worker, compliance, readiness and runtime
  suites pass.
- Functional suite: **82 files / 377 tests passed**.
- Adversarial security suite: **1 file / 32 tests passed**.
- JavaScript syntax checks, frontend TypeScript checking and the production
  Vite build passed.
- Authorization inventory remains **129 routes**.
- `git diff --check` passed. The production build retains the existing
  non-blocking large JavaScript bundle warning (1,010.55 kB; 283.21 kB gzip).

## Remaining release blockers

- Execute export, approval, grace-period, object deletion, pseudonymization and
  completion against staging RDS and S3 with synthetic subjects.
- Prove retry/idempotency behavior across multiple ECS tasks and worker restart,
  including legal hold and partial object-store failure.
- Complete the data-store/subprocessor coverage registry and backup-erasure or
  expiry evidence before acknowledging the current coverage version in production.

Production decision remains **NO-GO**.
