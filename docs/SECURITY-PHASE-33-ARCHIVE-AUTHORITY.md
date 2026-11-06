# Phase 33 — Relational deletion archive authority

Date: 2026-11-06
Status: **implemented, feature-gated, live PostgreSQL proof pending**

## Outcome

Course and assessment deletion archives now have a complete PostgreSQL-backed
read and restore path when `USE_PG_COURSES=1`. Course deletion captures its
chapters, assessments and assessment questions in the same transaction before
removing authoring rows. Governance combines relational archives only for
bounded contexts whose cutover is enabled, so partial rollouts do not silently
hide snapshot-backed records.

Restore is deliberately non-publishing. A restored course and its assessments
return as `Inactive` / `Draft`, versions advance, current version records are
created, the archive is consumed, and durable `RESTORE_ARCHIVE` evidence is
written atomically. Assessment-only restore also locks and advances its parent
course. Missing parents, incomplete legacy course archives and identifier/FK
conflicts fail closed with HTTP 409.

## Controls added

- `archive-authority.repository.pg.js` provides bounded deterministic listing,
  lookup and transactional course/assessment restore.
- Course archive format version 2 includes the exact relational question rows.
- `0019_archive_authority.sql` adds JSON-shape/bounds enforcement, an idempotent
  legacy source key and deterministic ordering indexes.
- Snapshot backfill imports legacy archives idempotently and strips credential
  material recursively before persistence.
- Full identity + course archive cutover removes the archive collection from
  snapshot load/save; partial cutovers preserve only the disabled context's
  fallback behavior.
- `/api/ready` verifies archive table, constraint and indexes whenever identity
  or course relational authority is enabled.
- The AWS one-off verifier gate includes `verify-archives.mjs`.

## Live verification

After migration/backfill on a snapshotted staging RDS instance, run:

```powershell
npm run db:verify-archives
```

The verifier creates synthetic course/chapter/assessment/question authoring
state, archives it, proves the complete relational snapshot, restores it,
proves review-gated status and audit evidence, then removes all synthetic rows.
It refuses to run without `DATABASE_URL` or `PGHOST`.

## Local evidence

- Full functional suite: **69 files / 319 tests passed**.
- Adversarial security suite: **32 tests passed**.
- Focused infrastructure suite: **11 tests passed**.
- TypeScript typecheck and production build pass. The existing large-bundle
  warning remains (about 1,010.55 kB minified / 283.21 kB gzip).
- Authorization inventory passes for **129 routes**.
- Local CloudFormation structure passes with **77 resources / 23 outputs**;
  JavaScript and both PowerShell deployment scripts pass syntax validation.
- The live verifier is present in the staging deployment gate.
- `npm run db:verify-archives` correctly refuses to run without
  `DATABASE_URL` or `PGHOST`.
- Live SQL execution is pending because this workstation has no reachable
  PostgreSQL service and no AWS credentials.

## Remaining release blockers

- Execute migration 0019, backfill and `db:verify-archives` against staging RDS.
- Reconcile pre-Phase-33 course archives. They intentionally fail closed
  because they cannot prove question completeness; recover them only from a
  reviewed backup or re-author the missing questions.
- Complete remaining enrollment consumers and the broader learning-authority
  cutover before removing the production `USE_PG_COURSES` prohibition.
- Run multi-task concurrency, backup/restore and failover drills in AWS.

This phase does not change the production decision: **NO-GO** until the full
staging release gate and remaining live evidence pass.
