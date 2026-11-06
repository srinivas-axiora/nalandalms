# Phase 35 — Relational attempt authorization

Date: 2026-11-06
Status: **implemented, feature-gated, live staging proof pending**

## Outcome

When `USE_PG_COURSES=1`, attempt authorization no longer combines a
PostgreSQL attempt with process-local course or assessment ownership. Direct
access is limited to the candidate (view only), a currently privileged
assigned proctor and an administrator. Instructor/course ownership is accepted
only for a current staff role and only when relational assessment authority
confirms it.

This closes a split-brain path where a former owner preserved in seed or
snapshot memory could otherwise control or grade an authoritative database
attempt after ownership changed in PostgreSQL.

## Verification

- A regression constructs deliberately stale in-memory course and assessment
  ownership around a relational attempt and proves that owner is denied.
- Positive cases cover database-confirmed ownership, the attempt candidate and
  the assigned proctor.
- A role-downgrade regression proves that an assigned proctor or resource owner
  no longer retains staff access as a Learner.
- Full functional suite: **72 files / 328 tests passed**.
- Adversarial security suite: **1 file / 32 tests passed**.
- JavaScript syntax validation, frontend typecheck and production build pass.
- Authorization inventory remains **129 routes**.
- The production build retains the known large-bundle warning
  (approximately 1,010.55 kB / 283.21 kB gzip).

## Remaining release blockers

- Prove role, ownership and proctor reassignment changes across multiple ECS
  tasks against staging RDS.
- Finish the remaining learning consumers and enable course authority only in
  a drained canary task until reconciliation and rollback gates pass.

Production decision remains **NO-GO**.
