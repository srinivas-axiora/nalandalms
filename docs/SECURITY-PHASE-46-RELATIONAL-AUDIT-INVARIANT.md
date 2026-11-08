# Phase 46 — Relational audit and security-evidence invariant

Date: 2026-11-08
Status: **implemented, feature-gated, live staging proof pending**

## Outcome

`USE_PG_COURSES=1` now implies relational audit and security-event authority
even when `USE_PG_AUDIT` is not independently enabled. Shared audit and security
events are appended to PostgreSQL, governance and application-data projections
read PostgreSQL, and the snapshot store neither saves nor reloads competing
evidence arrays on the course-cutover path.

Transaction-critical business repositories continue to insert their audit rows
inside the same database transaction as their mutations. Cross-cutting shared
evidence uses the existing request context and response persistence gate: a
failed evidence write prevents the response from completing successfully.

The independent audit flag remains supported for isolated verification, but
readiness rejects it when the related relational business authorities are not
complete. Course cutover satisfies that dependency invariant; schema checks and
the broader experimental course interlock still keep the local course mode
unready. No AWS feature flag has been enabled.

## Verification

- A truth-table regression proves relational evidence is enabled by either the
  audit flag or the course flag.
- A course-cutover regression proves generic evidence writes and administrator
  governance reads use the relational repository when `USE_PG_AUDIT=0`.
- Architectural source gates cover shared writes, server readiness/application
  data, governance reads and snapshot exclusion.
- Course-cutover readiness reports normalized audit mode with complete business
  dependencies while remaining unavailable without live schemas and the other
  release gates.
- Focused runtime, readiness, governance, application-data and response-gate
  suites passed: **7 files / 48 tests**.
- Functional suite: **83 files / 383 tests passed**.
- Adversarial security suite: **1 file / 32 tests passed**.
- JavaScript syntax checks, frontend TypeScript checking, CloudFormation local
  validation and the production Vite build passed.
- Authorization inventory remains **129 routes**.
- `git diff --check` passed. The production build retains the existing
  non-blocking large JavaScript bundle warning (1,010.55 kB; 283.21 kB gzip).

## Remaining release blockers

- Run the Phase-32 verifier against staging RDS after applying all migrations,
  including idempotency indexes and recursive metadata-scrubbing triggers.
- Prove evidence ordering, idempotency and fail-closed response behavior across
  multiple ECS tasks during database interruption and recovery.
- Export the append-only stream to the governed centralized audit destination
  and validate retention, access control, alerting and tamper evidence.
- Reconcile snapshot-era evidence before cutover and retain a documented,
  reviewable rollback procedure that does not reintroduce split authority.

Production decision remains **NO-GO**.
