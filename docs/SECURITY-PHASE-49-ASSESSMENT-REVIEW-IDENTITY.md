# Phase 49 — Relational assessment-review identity

Date: 2026-11-09
Status: **implemented, feature-gated, live staging proof pending**

## Outcome

The pending manual-review queue no longer joins relational attempts to the
process-local `users` array when course cutover is enabled. It resolves all
learner labels in one PostgreSQL query through a dedicated identity-summary
projection. A role, name, email or lifecycle change made by another ECS task is
therefore visible to reviewers without relying on the JSON snapshot.

The projection selects only `id`, `name`, `email` and `status`. It cannot return
password hashes, preferences, session versions or other unnecessary identity
data. Duplicate learner IDs are collapsed before the query.

No AWS flag or production interlock changed.

## Verification

- Repository coverage proves the batch query deduplicates IDs and excludes
  credential material from both SQL and mapped results.
- Route coverage proves the pending-review response uses the relational learner
  name and email while course cutover is enabled.
- Existing assessment authority checks still scope the review queue to assigned
  proctors, assessment owners, course owners and administrators.
- Functional suite: **85 files / 390 tests passed**.
- Adversarial security suite: **1 file / 32 tests passed**.
- JavaScript syntax validation passed for **322 files**; frontend TypeScript,
  the production build and local CloudFormation validation also passed.
- Authorization inventory remains **129 routes** and `git diff --check` passed.
- The existing non-blocking bundle warning remains (1,010.55 kB; 283.21 kB
  gzip).

## Remaining release blockers

- Exercise reviewer visibility and mid-request role/ownership revocation across
  at least two staging ECS tasks against RDS.
- Continue the secondary-consumer audit for any process-local joins reachable
  under course cutover before removing the production prohibition.
- Complete migration/backfill reconciliation, backup restore, failover,
  rollback, privacy, payment and media-retention drills.

Production decision remains **NO-GO**.
