# Security remediation Phase 56: RDS Multi-AZ failover

Captured: 2026-11-09 (Asia/Calcutta)
Branch: `security-phase-0-baseline`

## Outcome

Nalanda staging now declares an encrypted, private Multi-AZ PostgreSQL DB
instance instead of a single-AZ instance. Both application PostgreSQL pools
bound client queries to ten seconds, preventing dependency checks and requests
from waiting indefinitely when existing connections break during failover.

An operator-run drill now forces an RDS Multi-AZ failover and proves that the
deployed application observes the outage, reports HTTP 503 readiness, reconnects
through the stable RDS endpoint, retains a committed revision-bound marker, and
returns to HTTP 200 on the original ECS service task.

This is locally validated tooling, not live AWS evidence. The workstation still
has no configured AWS identity, no database was failed over, and production
remains **NO-GO** until the drill passes in the intended staging account.

## Architecture change

- CloudFormation sets the RDS DB instance `MultiAZ` property to `true`.
- Encryption, private networking, automated backups and managed master
  credentials remain enabled.
- Standard staging attestation rejects a database that is unavailable,
  single-AZ, public or unencrypted and records database resilience state.
- The normalized relational pool and transitional JSONB snapshot pool both
  apply a 10-second client-side query timeout.
- The endpoint is not changed during failover; clients must discard broken
  sessions, resolve the RDS DNS record and establish new connections.

The standby DB instance adds staging cost. That cost is required for a credible
promotion and reconnect exercise; a single-AZ database can prove restore but
cannot prove automatic high availability.

## Safety boundary

`verify-rds-failover.ps1` refuses the operation unless:

- `-ConfirmFailover` is explicitly supplied;
- the AWS account and full deployed Git revision match operator expectations;
- the stack environment is explicitly non-production;
- the task image is digest-pinned and carries the expected revision label;
- the ECS service is stable on the stack-owned task definition;
- task `PGHOST` exactly matches the stack database endpoint;
- PostgreSQL is available, private, encrypted, Multi-AZ and has no pending
  modifications; and
- the observer has committed its marker and application readiness is initially
  HTTP 200.

AWS warns that forced failover abruptly interrupts connections and in-flight
transactions. Run this only in an approved synthetic staging window after
stopping user and batch traffic.

## Drill behavior

The ECS observer inserts one synthetic `audit_logs` row scoped by a random run
ID and source revision, then polls the writable primary. After the orchestrator
calls `reboot-db-instance --force-failover`, it must observe a connection error,
reconnect to a different server address, confirm `pg_is_in_recovery() = false`,
read the same durable marker and delete it.

The orchestrator independently requires:

- at least one public `/api/ready` HTTP 503 during failover;
- RDS to return to `available` in a different Availability Zone;
- the RDS endpoint hostname to remain unchanged;
- the exact ECS service task ARN to remain unchanged; and
- final readiness to return to HTTP 200 within the configured RTO.

If the drill fails after marker insertion, the script waits for RDS availability
and launches an exact run-scoped cleanup task. Failure evidence records whether
cleanup succeeded; it never deletes unrelated audit evidence.

## Runbook

Deploy and attest the immutable release, stop synthetic/background writers, and
run:

```powershell
.\infra\aws\verify-rds-failover.ps1 `
  -Region ap-south-1 `
  -StackName nalanda-staging `
  -ExpectedAccountId <12-digit-staging-account-id> `
  -ExpectedSourceRevision <40-character-git-revision> `
  -ConfirmFailover `
  -RecoveryTimeoutSeconds 900
```

Preserve the generated `artifacts/aws/*-rds-failover.json`, RDS events,
CloudTrail `RebootDBInstance`, observer and cleanup task logs, readiness alarm
history and service events. Rerun `verify-staging.ps1` afterward.

## Acceptance criteria

1. Standard attestation proves available, private, encrypted Multi-AZ RDS.
2. The observer commits exactly one marker before failover.
3. Application readiness is initially 200 and reports at least one 503 during
   the interruption.
4. The observer records an outage, reconnects to a writable server at a
   different address and reads the same revision-bound marker.
5. RDS returns to `available` in a different Availability Zone while retaining
   the same endpoint hostname.
6. The marker is removed and the exact ECS service task remains running.
7. Final application readiness is 200 within the approved RTO.
8. The source-bound JSON evidence reports `passed`.

## Local release-gate evidence

| Gate | Result |
|---|---|
| Focused RDS/infrastructure suite | 3 files; 22 tests passed |
| `npm test` | 95 files; 435 tests passed |
| Adversarial security suite | 1 file; 32 tests passed |
| JavaScript syntax | 340 files passed |
| PowerShell syntax | 7 files passed |
| `npm run typecheck` | Passed |
| `npm run build` | Passed; existing large-chunk warning retained |
| `npm audit --json` | 0 vulnerabilities; 411 dependencies |
| `npm run infra:validate` | 77 resources; 30 outputs |
| Authorization inventory | 129 routes |

All local project gates passed. These tests cannot prove DNS convergence, RDS
promotion or application reconnection; those claims require the live drill.

## Remaining production gates

- Execute backup/restore, ECS rollback, Redis failover and RDS failover in AWS.
- Complete sustained multi-task load/soak, privacy-erasure retry, payment
  reconciliation and media-retention failure/retry exercises.
- Reconcile migrations/backfill and enable relational authorities only after
  all live evidence is approved.

## AWS references

- [Rebooting an RDS DB instance](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_RebootInstance.html)
- [Failing over a Multi-AZ DB instance](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.Failover.html)
- [AWS CLI `reboot-db-instance`](https://docs.aws.amazon.com/cli/latest/reference/rds/reboot-db-instance.html)

Current decision: **NO-GO for production**.
