# Phase 32 — security evidence authority

Date: 2026-11-06
Status: **implemented, feature-gated, live PostgreSQL proof pending**
Production decision: **NO-GO remains unchanged**

## Outcome

Nalanda now has a single relational repository for application audit records
and security events. When `USE_PG_AUDIT=1`, governance APIs and administrator
app-data projections read PostgreSQL rather than capped process-local arrays.
Request-scoped evidence writes are drained before an HTTP response completes;
a database write failure changes the response to `503` instead of silently
losing the event.

The AWS task definition deliberately keeps the flag disabled. Mixed snapshot
business mutations and relational audit writes are not one transaction, so the
cutover is allowed only after the corresponding business authority is also
relational and staging reconciliation passes.

## Controls implemented

- Migration `0018_security_evidence_authority.sql` adds durable security events,
  deterministic ordering indexes and idempotent ingestion keys.
- Historic actor identifiers are labels rather than foreign keys. Account
  pseudonymization cannot cascade-delete audit history.
- A database trigger recursively removes credential fields, direct names and
  email addresses from nested audit/security metadata. The migration also
  scrubs existing relational metadata.
- The application applies the same audit-specific scrub before persistence, so
  local fallback evidence and PostgreSQL receive equivalent metadata shapes.
- An `AsyncLocalStorage` request context tracks evidence writes. The response
  persistence gate drains them to a fixed point and fails closed on rejection.
- Security logging now wraps JSON responses before CSRF and rate-limit checks,
  so `401`, `403` and `429` outcomes are registered before they are returned.
- Governance list APIs validate strict bounded limits and use parameterized,
  deterministically ordered PostgreSQL projections.
- `/api/app-data` uses the same relational audit and security-event projections
  for administrators; non-admin behavior remains empty.
- Snapshot persistence omits audit/security arrays when the feature flag is on,
  preventing accidental dual authority.
- Backfill admits legacy evidence idempotently with generated database UUIDs,
  bounded fields and recursive metadata redaction.
- Readiness verifies both tables, ordering/idempotency indexes and scrub
  triggers whenever the feature flag is enabled, and remains `503` until all
  related business authority flags are relational as well.
- AWS schema preparation now includes the migration, and the relational release
  gate includes `verify-security-evidence.mjs`.

## Required staging gate

After guarded bootstrap/migration and backfill in isolated staging, run:

```powershell
npm run db:verify-security-evidence
```

The verifier creates synthetic audit and security records, proves UUID
idempotency, recursively scrubbed metadata, durable row counts and required
schema/index/trigger presence, then removes its synthetic rows.

Before enabling `USE_PG_AUDIT`, also reconcile legacy counts and representative
records, inject database failure into an evidence write, and prove the HTTP
response fails closed without unhandled promise rejection.

## Local evidence

- The full application suite passed 64 files and 306 tests.
- The isolated adversarial suite passed all 32 tests.
- The focused evidence/app-data/infrastructure run passed 7 files and 24 tests;
  the AWS infrastructure suite remains green at 11 tests.
- Frontend type checking and the production build passed. The existing
  approximately 1.01 MB minified main-bundle warning remains.
- Authorization inventory passed for 129 routes; local CloudFormation parsing
  passed with 77 resources and 23 outputs.
- Modified JavaScript and both AWS PowerShell scripts passed syntax checks;
  `git diff --check` passed.
- This phase changes no dependency or lockfile. A fresh npm advisory query was
  unavailable from the restricted environment, so the most recent applicable
  Phase-31 evidence remains 0 known vulnerabilities across 411 dependencies;
  CI/staging must refresh that gate before promotion.
- The live verifier correctly refuses to run without `DATABASE_URL` or
  `PGHOST`; no local result is represented as PostgreSQL proof.

## Remaining blockers

- The migration and verifier have not run against the intended RDS instance.
- Generic audit writes around remaining snapshot mutations cannot be atomic
  with those business changes. Keep `USE_PG_AUDIT=0` until their relational
  cutovers and rollback-injection tests pass.
- Database-owner tamper resistance, append-only external export, retention
  policy, alerting and restore evidence remain required for production audit
  assurance.
- Course/assessment archive authority was completed in Phase 33; its live RDS
  verifier and legacy-incomplete archive reconciliation remain pending.
- Live AWS, load, failover, restore, payment reconciliation and privacy-erasure
  drills remain outstanding.

Production remains **NO-GO**.
