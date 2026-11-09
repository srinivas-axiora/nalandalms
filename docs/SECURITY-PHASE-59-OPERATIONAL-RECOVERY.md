# Security remediation Phase 59: operational recovery and reconciliation

Captured: 2026-11-09 (Asia/Calcutta)
Branch: `security-phase-0-baseline`

## Outcome

Nalanda now has one guarded AWS staging gate for three release-blocking
operational workflows:

- privacy erasure is driven through an object-deletion failure, durable retry
  scheduling, recovery and exactly-once completion;
- the payment ledger is exercised for atomic settlement, exact replay,
  cross-order payment reuse rejection and database-wide order/transaction/
  entitlement/processed-webhook reconciliation; and
- proctor-media retention uploads a temporary object, records a sanitized
  deletion failure, retries through the real object-store delete path, removes
  every version from the versioned bucket, removes the raw key from normalized
  state and verifies audit evidence contains only the digest.

`verify-operational-recovery.ps1` runs those checks as three isolated Fargate
tasks. It refuses production-named stacks, requires an explicit confirmation,
checks the expected AWS account and full Git revision, requires normalized
authority and a digest-pinned task definition, and rejects any service drift or
active stack alarm after the drill.

This is locally validated orchestration, not completed AWS evidence. The local
workstation still has no AWS credentials. Production remains **NO-GO**.

## Verifiers

### Payment reconciliation

`verify-payments.mjs` creates two synthetic paid orders in PostgreSQL and proves:

1. order, transaction, enrollment and audit commit atomically;
2. an exact retry is idempotent;
3. a provider payment ID cannot settle another order;
4. every paid order has exactly one transaction;
5. order/transaction user, course, amount, currency and provider-payment
   bindings match;
6. every transaction has its entitlement; and
7. every processed webhook maps to the matching transaction.

A pass writes a `PAYMENT_RECONCILIATION_PASSED` audit record bound to the run and
source revision. Synthetic business rows are removed.

This is internal ledger reconciliation. It does **not** prove Razorpay payout,
refund, dispute or settlement-report parity. That external provider exercise
remains a production go-live gate.

### Privacy-erasure retry

The existing comprehensive privacy verifier now deliberately fails one object
deletion. It requires `Failed`, `OBJECT_DELETE_FAILED`, a future retry and one
retained failed-object record before advancing the clock. The retry must delete
only the remaining object, finalize once, pseudonymize identity, revoke sessions
and leave hash-only deletion evidence. Production erasure uses complete S3
version removal; a delete marker alone is not accepted as deletion.

### Media-retention retry

`verify-proctor-retention.mjs` uses a unique `verification/` object key so the
drill does not race GuardDuty's protected-prefix scan workflow. It still uses
the same production S3 put/head/list/version-delete adapter and normalized retention
repository. The first delete is deliberately interrupted; the second uses the
real complete-delete operation. The verifier lists the exact key's S3 versions
and requires a zero count after recovery. State must transition `Active ->
Deleting -> Failed -> Deleting -> Deleted` with exactly two attempts.

## AWS command

Run only after Phase 58 has promoted and attested normalized staging:

```powershell
.\infra\aws\verify-operational-recovery.ps1 `
  -Region ap-south-1 `
  -StackName nalanda-staging `
  -ExpectedAccountId <12-digit-staging-account-id> `
  -ExpectedSourceRevision <40-character-git-revision> `
  -ConfirmRecoveryDrill
```

Preserve the generated `artifacts/aws/*-operational-recovery.json`, all three
task log streams, payment-reconciliation audit row, RDS events, S3 data events,
CloudTrail events and CloudWatch alarm history.

## Acceptance criteria

The gate passes only when:

- account, non-production stack, source revision, normalized authority and
  digest-pinned image all match;
- all three isolated tasks exit zero;
- payment reconciliation reports zero internal anomalies;
- privacy retry reaches durable failure and then completed erasure;
- the temporary retention object has no current object, versions or delete
  markers, its normalized row is hash-only `Deleted`, and no audit metadata
  includes its raw key;
- the ECS service task definition/count is unchanged and stable; and
- no stack alarm is in `ALARM` after the drill.

The same three verifiers are also mandatory inside the Phase-58 promotion
verifier set, before normalized authority can be selected.

## Local release-gate evidence

| Gate | Result |
|---|---|
| Focused operational/repository/promotion suite | 7 files; 34 tests passed |
| Standard suite | 100 files; 464 tests passed |
| Adversarial security suite | 1 file; 32 tests passed |
| JavaScript / PowerShell syntax | 349 / 9 files passed |
| TypeScript / production build | Passed / passed (bundle-size warning remains) |
| Dependency audit | 0 known vulnerabilities across 411 packages |
| CloudFormation / authorization inventory | 78 resources, 31 outputs / 129 routes |
| AWS execution | Blocked locally: no AWS credentials |

## Remaining production gates

- Execute Phase 58 and this Phase-59 drill in the intended AWS staging account.
- Reconcile Razorpay test-mode provider payments, refunds, disputes and
  settlement exports against Nalanda's immutable ledger with zero monetary
  variance.
- Execute backup/restore, ECS rollback and Redis/RDS failover against the same
  promoted revision and review the combined evidence set.
- Obtain business/privacy owner approval for retention and erasure policy.

Current decision: **NO-GO for production**.
