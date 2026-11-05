# Phase 19 — relational report authority

Date: 2026-11-05
Status: **implemented, feature-gated, live PostgreSQL proof pending**
Production decision: **NO-GO remains unchanged**

## Outcome

When `USE_PG_COURSES=1`, `POST /api/reports/export` now prepares report rows
from normalized PostgreSQL learning state. Manager visibility is enforced in
SQL, filters are strictly typed, and the report request and audit evidence are
committed in one database transaction.

The legacy snapshot route remains selected while `USE_PG_COURSES=0`. No
production setting is changed by this phase.

## Controls implemented

- Administrator scope is explicit; Managers can see only themselves and direct
  reports, even when a foreign user, course, team or department is supplied as
  a filter.
- Filters accept only `userId`, `courseId`, `team` and `department`; unknown
  keys and malformed identifiers are rejected before repository access.
- User projections select only fields required by the report. Password hashes,
  session versions and other identity internals never leave PostgreSQL.
- Chapter, assessment and course time come from canonical relational totals.
- Query values and the 5,001-row detection limit are parameterized.
- Synchronous preparation is capped at 5,000 rows. Larger requests fail with
  HTTP 413 before report or audit state is written.
- `report_exports` and its `EXPORT_REPORT` audit row are committed atomically.
- The API no longer fabricates an `/exports/...` URL. It returns
  `artifactAvailable: false` and `downloadUrl: null` until a separate binary
  artifact worker has actually generated and stored the requested file.

## Local evidence

- Repository tests cover SQL manager scope, explicit identity projection,
  canonical totals, atomic report/audit persistence and the row limit.
- Route tests cover typed filters, role denial and repository delegation.
- A cutover test proves `USE_PG_COURSES=1` selects the relational path.
- `db:verify-reports` creates a direct report and unrelated learner, prepares a
  report, reconciles its totals, verifies outsider exclusion and confirms the
  durable report/audit pair before cleanup. It fails closed without PostgreSQL.

Checkpoint evidence on 2026-11-05:

- `npm test`: 45 files and 246 functional tests passed.
- `npm run test:security`: 1 file and 32 adversarial tests passed.
- `npm run typecheck`: passed with no TypeScript errors.
- `npm run build`: production build passed (996 modules transformed). The
  generated JavaScript bundle remains about 1,010 kB before gzip and retains a
  non-blocking code-splitting warning.
- `npm run routes:inventory`: passed with the Phase-19 route description.
- `npm audit --json`: 0 vulnerabilities across 393 dependencies.
- `node --check` passed for the repository, route module and live verifier;
  `git diff --check` passed apart from Git's existing line-ending notice.

## Required staging gate

After migration/backfill reconciliation in isolated staging, run:

```powershell
npm run db:verify-reports
```

Then verify through the HTTP route:

1. Admin organization export and Manager direct-report export.
2. Foreign `userId`, `courseId`, `team` and `department` filters return no
   unauthorized rows.
3. Canonical chapter, assessment and course totals match read-only SQL.
4. The 5,000-row boundary succeeds and 5,001 rows fail without durable writes.
5. Database rollback removes both report and audit evidence on injected error.

## Remaining blockers

The requested PDF/Excel artifact is not yet produced. A bounded asynchronous
worker must claim queued/prepared records, generate a real file, write it to the
private object store, publish a subject-scoped short-lived download grant and
record failure/retry/retention state. AI course generation also still consumes
process-local state. Production continues to reject `USE_PG_COURSES=1`, and
the live PostgreSQL verifier has not been run from this workspace.
