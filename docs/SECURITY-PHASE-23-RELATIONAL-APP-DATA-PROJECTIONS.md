# Phase 23 — relational app-data projections

Date: 2026-11-05  
Status: **implemented, feature-gated, live PostgreSQL proof pending**  
Production decision: **NO-GO remains unchanged**

## Outcome

When `USE_PG_COURSES=1`, `/api/app-data` no longer returns stale snapshot
copies of report-export metadata or Acharya feedback. Those projections now use
the same PostgreSQL authorities as their write and workflow APIs.

## Controls implemented

- Report metadata is listed through SQL requester scope for Managers and
  organization scope for Admins.
- Storage keys are never included in app-data report projections.
- AI feedback uses the Phase-21 active/unexpired creator scope for Managers and
  organization scope for Admins.
- Learners receive neither privileged report metadata nor AI feedback.
- Learning-time events use the Phase-18 SQL scope and a deterministic 500-row
  cap rather than the mutable snapshot array.
- When relational identity is enabled, user visibility and downstream
  assignment/attempt/proctor scoping are derived from current PostgreSQL users:
  Admins see organization scope, Managers see self plus direct reports, and
  other roles see self only.
- Snapshot behavior remains unchanged while the relational feature flag is
  disabled, preserving the controlled migration boundary.

## Remaining work in this phase

Phase 24 migrated settings/skill projections and Phase 32 now provides
feature-gated relational audit/security projections. Course/assessment archive
projections and a production-sized bootstrap/pagination design remain required
before the course cutover can be declared complete.

## Local evidence

- Dedicated app-data tests prove PostgreSQL direct-report scope controls users,
  enrollments and attempts and that password hashes remain redacted.
- Projection tests prove report metadata and AI feedback come from relational
  repositories and learning events use the canonical SQL path.
- `npm test -- --maxWorkers=4`: 52 files and 266 tests passed.
- `npm run test:security -- --maxWorkers=2`: 32 adversarial tests passed.
- Typecheck, production build and route inventory passed. The existing large
  frontend bundle warning remains.
- The Phase-22 dependency audit remains applicable because this phase changed
  no dependencies: 0 vulnerabilities across 410 packages.

Live PostgreSQL reconciliation remains pending; production cutover stays
disabled and readiness remains fail-closed.
