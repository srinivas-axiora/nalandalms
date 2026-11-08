# Phase 47 — Durable proctoring-media retention

Date: 2026-11-08
Status: **implemented, feature-gated, live staging proof pending**

## Outcome

The retention daemon no longer treats the process-local attempt array as the
media authority when relational attempts or course cutover are enabled. A new
`proctor_media_objects` manifest records every relational upload, backfills
existing attempt manifests and drives private-object deletion from PostgreSQL.

Workers claim one due object with `FOR UPDATE SKIP LOCKED`, bounded attempts and
stale-claim recovery. Successful deletion redacts the stored object key, removes
the item from the attempt JSON projection and writes audit evidence in one
database transaction. Failures store only a bounded error code and key hash,
schedule retry, and never return or log the object key.

The legacy worker remains available only while relational attempt authority is
off. Relational readiness now requires the manifest table and due-work index.
No AWS feature flag has been enabled.

## Verification

- Focused worker tests cover successful deletion and sanitized retry behavior.
- Repository tests cover cross-worker row locking, bounded/stale claims, key
  redaction, projection cleanup and atomic audit evidence.
- Attempt repository coverage proves every new relational media chunk enters
  the normalized manifest in the same transaction as its attempt projection.
- Legacy compliance coverage remains green with relational authority disabled.
- Functional suite: **85 files / 387 tests passed**.
- Adversarial security suite: **1 file / 32 tests passed**.
- JavaScript syntax checks, frontend TypeScript checking, CloudFormation local
  validation and the production Vite build passed.
- Authorization inventory remains **129 routes**.
- `git diff --check` passed. The production build retains the existing
  non-blocking large JavaScript bundle warning (1,010.55 kB; 283.21 kB gzip).

## Remaining release blockers

- Apply migration `0020_proctor_media_retention.sql` to staging RDS and reconcile
  the backfilled manifest against the private S3 prefix.
- Run concurrent workers across at least two ECS tasks and prove each object is
  claimed once, stale claims recover, and retry exhaustion alerts operators.
- Prove S3 deletion is idempotent across the object-deleted/database-timeout
  failure boundary and reconcile any orphaned manifest or object records.
- Validate lifecycle, legal-hold and privacy-erasure precedence with synthetic
  evidence before enabling course cutover.

Production decision remains **NO-GO**.
