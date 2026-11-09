# Security remediation Phase 58: normalized-authority promotion and rollback

Captured: 2026-11-09 (Asia/Calcutta)
Branch: `security-phase-0-baseline`

## Outcome

The AWS deployment workflow now has a guarded path across Nalanda's highest-risk
runtime boundary: snapshot authority to normalized PostgreSQL authority. The
path forces snapshot mode during preparation, enforces a zero-task write
quiescence window, bootstraps and backfills the schema, performs fail-closed
source-to-target reconciliation, runs every relational verifier and the
cross-task concurrency canary, creates an encrypted source-bound RDS snapshot,
promotes all authorities and workers atomically, attests readiness, and makes
the two-task HTTP soak gate mandatory before accepting the promotion.

Any failed post-cutover readiness, attestation or soak assertion automatically
redeploys `AuthorityMode=snapshot`, waits for readiness and attests the restored
mode. A rollback failure is reported distinctly and cannot be mistaken for a
successful recovery.

This is locally validated orchestration, not a completed AWS promotion. The
workstation still has no configured AWS identity, so production remains
**NO-GO**.

## Fail-closed sequence

`deploy-staging.ps1 -PromoteNormalizedAuthority` executes this order:

1. Require a clean Git revision, immutable scanned image, database preparation,
   all relational verifiers, the two-task concurrency canary, explicit
   promotion confirmation and confirmation that staging traffic is stopped.
2. Deploy the release in `AuthorityMode=snapshot`, record the existing ECS
   desired count, scale the service to zero, and attest zero running/pending
   service tasks before database preparation.
3. Bootstrap/migrate and backfill, then run
   `verify-normalized-reconciliation.mjs`. It rejects missing rows, duplicate
   source identities, any row the backfill would quarantine, question-count
   differences, or mismatched payment/certificate/candidate bindings. A pass
   writes revision- and source-snapshot-hash-bound audit evidence.
4. Run every semantic relational verifier and the cross-task PostgreSQL
   invariant canary, then restore and attest the exact prior service count even
   if a gate fails.
5. Wait for snapshot-mode readiness and attest the complete AWS stack.
6. Re-enter zero-task quiescence, refresh the backfill and reconciliation, then
   create and wait for an encrypted manual RDS snapshot tagged with the full
   source revision. This closes the writer race between verification and the
   recovery point.
7. Deploy the identical digest and configuration with
   `AuthorityMode=normalized`; require a new task definition and green
   readiness/attestation, and restore the exact pre-promotion service count.
8. Run the Phase-57 two-task HTTP soak gate and attest again after it restores
   the service count.
9. Write source-bound promotion evidence and leave normalized mode active only
   after every assertion passes.

The process does not automatically restore the database snapshot. A failed
functional cutover first restores the prior application authority mode because
that is faster and nondestructive. The retained RDS snapshot is the approved
recovery point if reconciliation later demonstrates data corruption.

Any incomplete or malformed legacy row is deliberately a release blocker; the
workflow does not silently accept a quarantine. Review and correct the source
snapshot, rerun the backfill, and preserve the reconciliation audit event. The
gate proves row coverage plus critical immutable bindings. The separate
relational verifier suite remains responsible for deeper workflow semantics.

## Command

Run only in the approved synthetic staging window:

```powershell
.\infra\aws\deploy-staging.ps1 `
  -Region ap-south-1 `
  -StackName nalanda-staging `
  -ExpectedAccountId <12-digit-staging-account-id> `
  -ConfirmStagingDeployment `
  -PrepareRelationalDatabase `
  -RunRelationalVerifiers `
  -RunMultiTaskConcurrencyCanary `
  -PromoteNormalizedAuthority `
  -ConfirmNormalizedPromotion `
  -ConfirmStagingTrafficStopped `
  -SoakDurationSeconds 900 `
  -SoakRequestsPerSecondPerWorker 2 `
  -RazorpayKeyIdSecretArn <secret-arn> `
  -RazorpayKeySecretArn <secret-arn> `
  -RazorpayWebhookSecretArn <secret-arn>
```

Preserve the pre-promotion and final attestations, RDS snapshot metadata,
component/canary logs, HTTP soak evidence, CloudFormation events, CloudTrail
events and `*-normalized-promotion.json`.

## Acceptance criteria

Promotion evidence is acceptable only when:

- the source revision, image digest, account and non-production stack match;
- both write-quiescence windows reach zero running/pending service tasks and
  restore the exact prior desired count;
- source snapshot hashing, zero-quarantine row reconciliation, critical
  immutable bindings and every semantic database verifier pass;
- the manual RDS snapshot is `available`, encrypted and bound to the source DB;
- the stack output and task environment both report normalized authority;
- a new task definition reaches stable readiness;
- the two-task cross-AZ HTTP soak meets its latency, correctness, readiness,
  alarm and resource-headroom objectives;
- final standard attestation passes after the soak service-scale rollback; and
- the evidence result is `passed` with `rollbackResult=not-required`.

For a failed promotion, acceptable failure evidence requires snapshot authority
to be restored and attested. A failed automatic rollback is an incident and
blocks all further deployment.

## Local release-gate evidence

| Gate | Result |
|---|---|
| Focused promotion/reconciliation/infrastructure suite | 4 files; 33 tests passed |
| `npm test` | 98 files; 456 tests passed |
| Adversarial security suite | 1 file; 32 tests passed |
| JavaScript syntax | 345 files passed |
| PowerShell syntax | 8 files passed |
| `npm run typecheck` | Passed |
| `npm run build` | Passed; existing large-chunk warning retained |
| `npm audit --json` | 0 vulnerabilities; 411 dependencies |
| `npm run infra:validate` | 78 resources; 31 outputs |
| Authorization inventory | 129 routes |

All local project gates passed. Local tests cannot prove CloudFormation
replacement behavior, live database reconciliation, runtime cutover or
rollback.

## Remaining production gates

- Execute this promotion in AWS and review all generated evidence.
- Execute backup/restore, ECS rollback and Redis/RDS failover on the promoted
  release.
- Execute the Phase-59 operational recovery gate in AWS and complete external
  Razorpay settlement/refund/dispute reconciliation before a production go
  decision.

Current decision: **NO-GO for production**.
