# Security remediation Phase 62: production release evidence gate

Captured: 2026-11-09 (Asia/Calcutta)
Branch: `security-phase-0-baseline`

## Outcome

Nalanda now has one offline, fail-closed evaluator for the complete production
go/no-go evidence set. It will not emit `decision: "GO"` unless eleven inputs
are fresh, internally successful and bound to the same AWS account, region,
stack, full Git revision, ECS task definition and digest-pinned image:

1. final normalized staging attestation;
2. normalized-authority promotion;
3. two-task concurrency canary;
4. two-task HTTP load/soak;
5. payment/privacy/retention operational recovery;
6. encrypted RDS backup/restore;
7. RDS Multi-AZ failover;
8. Redis Multi-AZ failover;
9. ECS rollback and restoration;
10. reviewed Razorpay order/settlement/refund/dispute reconciliation; and
11. privacy-owner retention, erasure and legal-hold approval.

The evaluator rejects stale evidence, impossible future timestamps, pre-cutover
operational drills, changed task definitions, incomplete cleanup, image scan
findings, monetary variance, unmatched payment records and incomplete manual
approvals. A passing output contains SHA-256 digests of every source artifact
and is created with exclusive-write semantics so an existing decision is never
silently overwritten.

## Manual evidence contracts

Start from the deliberately non-passing examples:

- `docs/examples/RAZORPAY-RECONCILIATION.example.json`
- `docs/examples/PRIVACY-RETENTION-APPROVAL.example.json`

Do not change `result` to `passed` or `approved` until the named reviewer has
examined the referenced exports, logs, policies and zero-variance results.
These JSON records are release evidence, not substitutes for the underlying
provider exports or signed organizational approvals.

## Command

```powershell
npm run release:verify-evidence -- `
  --account-id <12-digit-staging-account-id> `
  --region ap-south-1 `
  --stack nalanda-staging `
  --source-revision <40-character-git-revision> `
  --max-age-hours 72 `
  --attestation artifacts/aws/final-attestation.json `
  --promotion artifacts/aws/normalized-promotion.json `
  --multi-task artifacts/aws/multi-task.json `
  --http-soak artifacts/aws/http-soak.json `
  --operational-recovery artifacts/aws/operational-recovery.json `
  --backup-restore artifacts/aws/backup-restore.json `
  --rds-failover artifacts/aws/rds-failover.json `
  --redis-failover artifacts/aws/redis-failover.json `
  --ecs-rollback artifacts/aws/ecs-rollback.json `
  --provider-reconciliation artifacts/aws/razorpay-reconciliation.json `
  --privacy-approval artifacts/aws/privacy-retention-approval.json `
  --output artifacts/aws/production-release-decision.json
```

## Current result

The evaluator is locally tested, but the required AWS and reviewed manual
artifacts do not exist on this workstation. Therefore no GO artifact has been
created and production remains **NO-GO**.

## Local validation

| Gate | Result |
|---|---|
| Release-evidence evaluator | 7 tests passed, including immutable file output |
| Complete standard suite | 101 files; 472 tests passed |
| Adversarial security suite | 1 file; 32 tests passed |
| JavaScript / PowerShell syntax | 351 / 9 files passed |
| TypeScript / production build | Passed / passed (bundle-size warning remains) |
| Dependency audit | 0 known vulnerabilities across 411 packages |
| CloudFormation structure | 78 resources; 31 outputs |
| Authorization inventory | 129 routes |
| Real release decision | Not created; mandatory external evidence is absent |
