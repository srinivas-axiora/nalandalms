# Security remediation Phase 53: AWS backup/restore drill

Captured: 2026-11-09 (Asia/Calcutta)
Branch: `security-phase-0-baseline`

## Outcome

Nalanda now has an operator-run staging drill that proves an encrypted RDS
snapshot can be restored into an isolated private database and read by the exact
ECS task definition deployed for the release. The drill binds a synthetic
database marker to the stack's full source revision, checks critical normalized
tables and migration history, enforces a configurable recovery-time objective,
and writes JSON evidence only after run-scoped cleanup succeeds.

This adds the missing restore mechanism; it does not claim a successful AWS
exercise. The workstation has no AWS credentials, so production remains
**NO-GO** until the drill runs in the intended account and its logs and evidence
are reviewed.

## Safety boundary

The script does not change the ECS service, production flags, DNS, or the source
database endpoint. It creates only these run-scoped resources:

- one uniquely tagged manual snapshot;
- one uniquely tagged, private, single-AZ restored database instance;
- one synthetic audit marker removed from the source after the snapshot;
- one JSON evidence artifact after successful validation and cleanup.

Before deleting a resource, the script verifies both its exact generated name
and its `NalandaRestoreRun` tag. A failed drill cleans up by default. Use
`-KeepFailedResources` only when an authorized operator accepts the temporary
cost and needs the failed clone for diagnosis; the source marker is still
removed.

## Runbook

Run this only against staging after the stack and relational schema have been
deployed and verified:

```powershell
.\infra\aws\verify-backup-restore.ps1 `
  -Region ap-south-1 `
  -StackName nalanda-staging `
  -MaxRestoreMinutes 45
```

The operator identity needs scoped permission for CloudFormation output reads,
ECS one-off tasks, RDS snapshot/restore/describe/delete, and the related wait
operations. Preserve the generated `artifacts/aws/*-backup-restore.json` file,
CloudTrail events, RDS events and both ECS task log streams in the release
record.

## Acceptance criteria

1. The source marker task exits zero using the deployed task definition.
2. The manual snapshot reaches `available`.
3. The restored instance is private and uses the stack's data subnet group and
   database security group, plus the source database parameter group.
4. The restored verifier finds exactly one marker with the expected source
   revision, migration history and all critical tables.
5. Total drill duration remains within the approved recovery-time objective.
6. The source marker, restored instance and manual snapshot are removed.
7. Evidence records the immutable task definition, source revision, resource
   identifiers, task ARNs, duration and successful cleanup.

## Local release-gate evidence

| Gate | Result |
|---|---|
| Focused restore/infrastructure suite | 2 files; 16 tests passed |
| `npm test` isolated rerun | 91 files; 418 tests passed |
| `npm run test:security` | 1 file; 32 tests passed |
| JavaScript syntax scan | 334 files; 0 failures |
| PowerShell syntax scan | 4 scripts; 0 failures |
| `npm run typecheck` | Passed |
| `npm run build` | Passed; existing ~1.01 MB chunk warning remains |
| `npm audit --json` | 0 known vulnerabilities across 411 dependencies |
| `npm run infra:validate` | 77 resources; 27 outputs |
| `npm run routes:inventory` | 129 routes |

The first full-suite attempt ran concurrently with three other CPU-heavy gates
and one module-import hook exceeded its ten-second timeout. No application
assertion failed. The mandatory isolated rerun passed all 418 tests; release
automation should keep the full suite isolated or raise the hook budget only
with measured evidence.

## Remaining production gates

- Execute and review this restore drill in AWS; choose formal RTO/RPO targets
  with the business owner.
- Exercise Multi-AZ failover on a production-like topology. Staging remains
  deliberately single-AZ and cannot prove database failover.
- Prove ECS task-definition rollback, Redis interruption behavior and sustained
  multi-task load/soak performance.
- Complete privacy-erasure retry and payment reconciliation exercises before
  enabling the corresponding relational flags.

Current decision: **NO-GO for production**.

## AWS references

- [Restoring an RDS DB instance from a snapshot](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_RestoreFromSnapshot.html)
- [RDS master-password management with Secrets Manager](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-secrets-manager.html)
