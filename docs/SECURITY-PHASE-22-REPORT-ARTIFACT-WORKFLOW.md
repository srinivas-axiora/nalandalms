# Phase 22 — private report artifact workflow

Date: 2026-11-05  
Status: **implemented, feature-gated, live PostgreSQL/S3 proof pending**  
Production decision: **NO-GO remains unchanged**

## Outcome

Relational report requests can now be completed by a durable worker that
creates genuine PDF or XLSX files and writes them to private object storage.
The API never publishes an object key. An authorized requester receives a
caller-authorized, five-minute download grant only after the report reaches
`Ready`. Local fallback grants are cryptographically subject-bound; S3
presigned URLs are short-lived bearer capabilities after issuance.

## Controls implemented

- Migration `0016_report_artifact_workflow.sql` adds bounded attempts, retry
  scheduling, claim timestamps, row counts, summaries and failure codes.
- Workers claim due jobs with `FOR UPDATE SKIP LOCKED`, so multiple workers do
  not process the same report concurrently.
- Stale `Processing` jobs are reclaimed after 15 minutes. The in-flight object
  key is persisted before upload so crash recovery can delete abandoned data.
- Each retry re-evaluates the requester against current user status and role,
  then rebuilds rows using SQL-enforced Admin or Manager scope.
- XLSX generation uses inline string cells and emits no formulas, preventing
  spreadsheet formula injection. XML control characters are stripped and
  markup is escaped.
- PDF rendering bounds displayed fields and normalizes control characters.
- Internal object uploads are capped by the object-store adapter at 25 MiB and
  use S3 server-side encryption when AWS storage is configured.
- Retry errors expose only stable error codes. Deactivated or demoted
  requesters fail terminally.
- Status and download routes require Admin or Manager authentication;
  non-admin users can retrieve only their own report request.
- Local download grants are subject-bound. AWS grants are five-minute S3 bearer
  URLs and must not be logged or shared.
- Successful downloads append `DOWNLOAD_REPORT` audit evidence.
- Readiness reports the worker as unhealthy when relational reports are
  enabled without `ENABLE_REPORT_EXPORT_WORKER=1`.

## Local evidence

- Artifact tests validate genuine PDF and ZIP-based XLSX signatures, workbook
  structure, XML escaping and absence of formula cells.
- Worker tests validate success, sanitized failure handling and uploaded-object
  cleanup when the final database transition fails.
- Route tests prove storage keys are redacted and incomplete artifacts cannot
  be downloaded.
- Repository tests continue to prove SQL-enforced Manager scope and atomic
  request/audit creation.

Checkpoint evidence on 2026-11-05:

- `npm test`: 50 files and 263 functional tests passed.
- `npm run test:security`: 1 file and 32 adversarial tests passed.
- `npm run typecheck`: passed with no TypeScript errors.
- `npm run build`: production build passed (996 modules transformed); the
  existing approximately 1,010 kB JavaScript bundle warning remains.
- `npm run routes:inventory`: passed with all three report workflow routes.
- `npm audit --json`: 0 vulnerabilities across 410 dependencies.
- Syntax checks and `git diff --check` passed apart from line-ending notices.
- `db:verify-reports` fails closed locally because no PostgreSQL configuration
  is present; live database/object-store proof remains pending.

## Required staging gate

Apply migration `0016`, configure private S3, enable the worker only in an
isolated task revision, and run:

```powershell
npm run db:verify-reports
```

The verifier creates synthetic scoped data, generates a real private artifact,
obtains an authorized short-lived grant, removes the object and cleans up the
database evidence. Also kill the worker between upload and completion and
confirm stale-job recovery deletes the reserved object before retrying.

## Remaining blockers

The feature flag stays disabled in the committed AWS template. Production
still requires live PostgreSQL/S3 evidence, lifecycle expiry for report
objects, multi-worker concurrency/load tests, alarms for terminal failures and
an operational retention policy. The broader relational learning cutover also
remains incomplete, so this phase does not change the production decision.
