# Security remediation Phase 6: transactional payment persistence

Captured: 2026-11-03 (Asia/Calcutta)  
Branch: `security-phase-0-baseline`

## Outcome

The payment bounded context now has an opt-in PostgreSQL path that commits the
payment order, entitlement, immutable transaction and audit record in one
database transaction. Checkout settlement locks its order row, payment IDs and
order IDs are unique, webhook event IDs are bound to the exact raw-body hash,
and duplicate delivery is idempotent.

The path is gated by `USE_PG_PAYMENTS=1` and remains **off** in AWS staging.
This is deliberate: the SQL has not yet executed against a live PostgreSQL
instance on this workstation, and course/user repositories are not yet the
application-wide source of truth.

## Controls implemented

- Row-level `FOR UPDATE` locking before settlement.
- One open checkout order per learner/course through a partial unique index.
- Provider payment ID and order ID replay protection.
- Atomic enrollment, payment transaction, order state and audit insertion.
- Atomic webhook claim and processing, with event-ID/raw-body hash binding.
- Durable expiry transition before an expired-order error is returned.
- Relational course price/currency fields with database checks.
- Backfill reads the current PostgreSQL `app_state` snapshot when present and
  migrates historical payment orders, transactions and webhook evidence.
- Empty-database baseline bootstrap refuses partially initialized schemas.
- Course create/update validation supports integer minor units and ISO-style
  three-letter currency codes.

## Evidence obtained locally

| Gate | Result |
|---|---|
| Payment repository unit tests | 6 passed |
| Functional suite | 16 files; 127 tests passed |
| Adversarial security suite | 30 tests passed |
| Frontend type check | Passed |
| Production frontend build | Passed; existing 1.01 MB chunk warning remains |
| Dependency audit | 0 known vulnerabilities across 393 dependencies |
| JavaScript syntax checks | Passed |
| `package.json` parse | Passed |
| `git diff --check` | Passed |

## Required live PostgreSQL gate

Do not enable `USE_PG_PAYMENTS` until all of the following pass in an isolated
staging database:

1. Take a snapshot, run `npm run db:bootstrap`, then `npm run db:backfill`.
2. Reconcile row counts and monetary totals between `app_state` and normalized
   tables; investigate every difference.
3. Exercise create, signed verify, exact replay, wrong-user, wrong-course,
   expired-order, reused-payment-ID and webhook-body-mismatch cases.
4. Run at least two concurrent settlement requests for the same order and prove
   exactly one transaction/enrollment exists.
5. Restart the task and verify the normalized evidence remains available.
6. Switch the flag on for staging only, observe logs/metrics, then perform the
   documented flag rollback.

## Remaining architecture blockers

- Users, courses, assessments, attempts, certificates, privacy workflows and
  most audit data still use whole-state snapshot persistence.
- Paid-course administration is not yet fully cut over to the relational course
  repository, so the payment flag must not precede course/user reconciliation.
- A live PostgreSQL run, concurrent transaction test and AWS staging deployment
  are still missing.
- Multi-task ECS remains prohibited until every correctness-critical context is
  normalized and distributed-state tests pass.
