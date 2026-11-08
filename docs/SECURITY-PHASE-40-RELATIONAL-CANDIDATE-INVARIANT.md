# Phase 40 — Relational candidate-assessment runtime invariant

Date: 2026-11-08
Status: **implemented, feature-gated, live staging proof pending**

## Outcome

`USE_PG_COURSES=1` now implies relational candidate-assessment authority even
when `USE_PG_CANDIDATE_ASSESSMENTS` is not independently enabled. Authenticated
link administration and public token routes therefore use PostgreSQL for link
hashes, anonymous sessions, immutable question snapshots, deadline checks,
proctor events, grading and submission state throughout a relational learning
cutover.

Readiness, privacy dependency checks and `/api/app-data` use the same runtime
invariant, preventing those projections from silently returning process-local
candidate records.

## Verification

- A truth-table regression proves relational candidate authority is enabled by
  either the candidate flag or the course flag.
- A route regression proves the course flag alone selects the relational link
  repository while the standalone candidate flag is disabled.
- Architectural source gates reject direct candidate-flag branches in server
  and route wiring.
- Course-cutover readiness now requires normalized candidate link, session,
  event, token-hash, idempotency and question-snapshot controls.
- App-data tests assert scoped relational candidate projections.
- Functional suite: **77 files / 349 tests passed**.
- Adversarial security suite: **1 file / 32 tests passed**.
- Frontend TypeScript checking and the production Vite build passed.
- Authorization inventory remains **129 routes**.
- `git diff --check` passed. The production build retains the existing
  non-blocking large JavaScript bundle warning (1,010.55 kB; 283.21 kB gzip).

## Remaining release blockers

- Exercise concurrent anonymous starts, token rotation, event replay and
  deadline submission across multiple ECS tasks against staging RDS.
- Reconcile or revoke links created by snapshot-mode builds before cutover.

Production decision remains **NO-GO**.
