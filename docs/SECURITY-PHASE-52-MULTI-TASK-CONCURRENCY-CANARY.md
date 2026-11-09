# Security remediation Phase 52: multi-task concurrency canary

Captured: 2026-11-09 (Asia/Calcutta)
Branch: `security-phase-0-baseline`

## Outcome

Nalanda now has a live AWS gate that launches two independent Fargate tasks
against the same PostgreSQL database and proves that critical relational
invariants survive real cross-process races. The gate uses a synthetic,
run-scoped fixture, database-backed barriers and ECS task metadata identities;
it rejects ambiguous evidence and cleans the fixture after assertion.

This closes an evidence-tooling gap. It does **not** itself prove production
readiness because the canary has not run in the intended AWS account and does
not replace restore, failover, load/soak or rollback drills.

## Invariants exercised

Two tasks race the same operations after meeting at bounded database barriers:

1. Free self-enrollment: one task creates the unique enrollment and the other
   resolves the same record idempotently.
2. Workplace clock-in: one task creates the daily attendance record and the
   other resolves the existing record.
3. Assessment start: one task creates the active attempt and the other receives
   the expected active-attempt conflict.
4. Report work claiming: one task claims the synthetic report using
   `FOR UPDATE SKIP LOCKED`; the other receives no work. The repository accepts
   an optional report identifier so the canary cannot claim unrelated staging
   work; production workers retain the unscoped default.
5. Course update: one task advances the expected version and the stale writer
   receives a version conflict.

The assertion task verifies one durable row/transition for each winning race,
one transactional audit event for enrollment, attendance, attempt and course
update, and two distinct ECS task identities for every stage.

## AWS orchestration

`infra/aws/verify-multi-task.ps1` performs four fail-closed steps:

- prepare a uniquely named fixture in one task;
- launch exactly two worker tasks with `ecs run-task --count 2`;
- wait for both tasks and require zero exit codes;
- run the assertion/cleanup task and write a source-revision-bound JSON evidence
  artifact under `artifacts/aws/`.

Any failure triggers a best-effort idempotent cleanup task. The deployment
script exposes `-RunMultiTaskConcurrencyCanary`, but refuses it unless
`-RunRelationalVerifiers` is also selected.

## Local release-gate evidence

| Gate | Result |
|---|---|
| Focused Phase-52 regression suite | 3 files; 22 tests passed |
| `npm test` | 90 files; 414 tests passed |
| `npm run test:security` | 1 file; 32 tests passed |
| JavaScript syntax scan | 331 files; 0 failures |
| PowerShell syntax scan | 3 scripts; 0 failures |
| `npm run typecheck` | Passed |
| `npm run build` | Passed; existing ~1.01 MB chunk warning remains |
| `npm audit --json` | 0 known vulnerabilities across 411 dependencies |
| `npm run infra:validate` | 77 resources; 23 outputs |
| `npm run routes:inventory` | 129 routes |

The actual two-task gate cannot be represented by local unit tests and remains
unexecuted because this workstation has no AWS credentials. Static tests prove
the orchestration contract; only successful Fargate task evidence proves the
runtime claim.

## Staging command

After AWS authentication, snapshot approval and change-set review:

```powershell
.\infra\aws\deploy-staging.ps1 `
  -Region ap-south-1 `
  -StackName nalanda-staging `
  -ExpectedAccountId <12-digit-staging-account-id> `
  -ConfirmStagingDeployment `
  -PrepareRelationalDatabase `
  -RunRelationalVerifiers `
  -RunMultiTaskConcurrencyCanary `
  -RazorpayKeyIdSecretArn <secret-arn> `
  -RazorpayKeySecretArn <secret-arn> `
  -RazorpayWebhookSecretArn <secret-arn>
```

Direct invocation of `verify-multi-task.ps1` is also guarded and requires the
expected account, exact source revision and `-ConfirmMultiTaskCanary`. Its
evidence records the account and digest-pinned image for Phase-62 coherence.

Do not enable the long-running service's relational flags based only on the
component verifiers. Preserve the multi-task evidence JSON and matching
CloudWatch task logs in the release record.

## Remaining production gates

1. Run this canary in the intended private subnets with the deployed task role,
   RDS and exact release image digest.
2. Execute the Phase-57 sustained two-task HTTP load/soak gate after the
   reviewed normalized-authority promotion.
3. Exercise RDS restore and failover, Redis interruption, S3 quarantine and
   retention retry, privacy erasure retry, and task-definition rollback.
4. Reconcile backfill counts and audit/certificate/payment/exam records before
   enabling relational flags on the long-running service.

Current decision: **NO-GO for production**.
