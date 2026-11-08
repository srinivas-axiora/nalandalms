# Phase 44 — Relational identity runtime invariant

Date: 2026-11-08
Status: **implemented, feature-gated, live staging proof pending**

## Outcome

`USE_PG_COURSES=1` now implies relational identity authority even when
`USE_PG_IDENTITY` is not independently enabled. Authentication, registration,
login, logout, password reset, step-up identity, user administration, companion
pairing, application projections and user archives therefore share current
PostgreSQL-backed account and session state with the relational learning runtime.

This closes a critical multi-task trust split in which course ownership,
enrollment, exam, payment and certificate decisions could use a role or account
status cached before an administrator changed or disabled that user. Session
version checks now fail closed through the identity repository throughout a
course cutover.

## Verification

- A truth-table regression proves relational identity authority is enabled by
  either the identity flag or the course flag.
- A middleware regression proves the course flag alone resolves the JWT subject
  and session version through the relational identity repository.
- Architectural source gates cover server startup/readiness/app-data,
  authentication, user administration, companion pairing, governance and
  snapshot archive persistence.
- Course-cutover readiness now requires users, audit/archive support columns and
  the trust-change session-revocation trigger.
- Course cutover now requests User, Course and Assessment archives from the
  relational archive authority.
- Focused identity, archive, app-data, readiness and runtime suites pass.
- Functional suite: **81 files / 372 tests passed**.
- Adversarial security suite: **1 file / 32 tests passed**.
- JavaScript syntax checks, frontend TypeScript checking and the production
  Vite build passed.
- Authorization inventory remains **129 routes**.
- `git diff --check` passed. The production build retains the existing
  non-blocking large JavaScript bundle warning (1,010.55 kB; 283.21 kB gzip).

## Remaining release blockers

- Exercise role, password, status and manager changes while sessions are active
  across multiple ECS tasks against staging RDS and Redis.
- Prove logout and trust-change revocation remain effective during task restart,
  Redis failover and database failover.
- Reconcile duplicate emails, identifiers, manager references and snapshot-only
  sessions before enabling the cutover.

Production decision remains **NO-GO**.
