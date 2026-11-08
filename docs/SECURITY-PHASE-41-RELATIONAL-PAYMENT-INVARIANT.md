# Phase 41 — Relational payment runtime invariant

Date: 2026-11-08
Status: **implemented, feature-gated, live staging proof pending**

## Outcome

`USE_PG_COURSES=1` now implies relational payment authority even when
`USE_PG_PAYMENTS` is not independently enabled. Checkout order creation,
provider signature verification, webhook replay evidence, payment transactions
and enrollment settlement therefore share PostgreSQL authority with relational
catalog and course-access decisions.

This closes a commercial split-brain in which checkout could read snapshot
courses and grant a snapshot enrollment that the relational learning runtime
would never recognize. Readiness and privacy dependency checks now use the same
payment invariant as the service.

## Verification

- A truth-table regression proves relational payment authority is enabled by
  either the payment flag or the course flag.
- Service regressions prove the course flag alone reads relational course/order
  state for checkout and persists webhook replay evidence relationally.
- Architectural source gates reject direct payment-flag branches in server and
  payment-service wiring.
- Course-cutover readiness now requires payment orders, transactions, webhook
  evidence and enrollments to exist in normalized storage.
- Focused payment, marketplace, readiness and runtime suites pass.
- Functional suite: **78 files / 355 tests passed**.
- Adversarial security suite: **1 file / 32 tests passed**.
- JavaScript syntax checks, frontend TypeScript checking and the production
  Vite build passed.
- Authorization inventory remains **129 routes**.
- `git diff --check` passed. The production build retains the existing
  non-blocking large JavaScript bundle warning (1,010.55 kB; 283.21 kB gzip).

## Remaining release blockers

- Exercise concurrent checkout creation, payment replay, webhook redelivery and
  settlement across multiple ECS tasks against staging RDS.
- Reconcile open orders, transactions and entitlements created by snapshot-mode
  builds before enabling the cutover.
- Validate Razorpay production credentials and raw-body webhook behavior through
  the deployed edge path without using synthetic payment data.

Production decision remains **NO-GO**.
