# Security remediation Phase 55: Redis Multi-AZ failover

Captured: 2026-11-09 (Asia/Calcutta)
Branch: `security-phase-0-baseline`

## Outcome

Nalanda staging now declares a two-node, encrypted ElastiCache Redis replication
group distributed across Availability Zones with automatic failover. The
application Redis client uses capped exponential retry with jitter for the
lifetime of the process instead of permanently disconnecting after three
attempts. Security-sensitive request controls continue to fail closed while the
cache is unavailable.

An operator-run drill now invokes the managed ElastiCache test-failover API and
proves the complete failure path: a pre-armed ECS observer sees the outage,
Redis-backed rate limiting rejects rather than using process memory,
`/api/ready` reports HTTP 503, the primary changes, the client reconnects, and
the original ECS service task returns to HTTP 200 without replacement.

This is locally validated tooling, not live AWS evidence. No AWS identity is
configured on this workstation, no cache was changed, and production remains
**NO-GO** until the drill passes in the intended staging account.

## Architecture change

- `NumCacheClusters` is two, with one primary and one replica.
- `AutomaticFailoverEnabled` and `MultiAZEnabled` are true.
- At-rest and in-transit encryption remain enabled.
- Standard staging attestation now rejects a cache without two members in at
  least two Availability Zones and records cache topology in its JSON evidence.
- The Redis reconnect strategy always returns a numeric delay: exponential
  backoff caps at five seconds and adds up to 199 ms of jitter.
- Production mode still rejects memory fallback for rate limits, login lockout,
  companion pairing and proctor signaling.

The second cache node adds staging cost. That cost is intentional because a
single-node cache cannot produce credible automatic-failover evidence.

## Drill safety boundary

`verify-redis-failover.ps1` refuses to mutate unless:

- the operator supplies `-ConfirmFailover`;
- the authenticated account and deployed full Git revision match explicit
  operator-supplied expectations;
- the stack exports an explicitly non-production environment name;
- the replication group is available, non-clustered, Multi-AZ and automatic
  failover enabled;
- it has a primary and replica in distinct Availability Zones;
- the ECS service is stable with exactly one running staging task; and
- a production-mode observer is running and has logged its armed marker.

The managed operation promotes the replica and may cause a brief cache outage.
The script does not delete cache data or change the ECS task definition. AWS
limits how often test failover may be invoked, so schedule the exercise in an
approved staging window.

## Runbook

After deploying the current immutable release to staging, run:

```powershell
.\infra\aws\verify-redis-failover.ps1 `
  -Region ap-south-1 `
  -StackName nalanda-staging `
  -ExpectedAccountId <12-digit-staging-account-id> `
  -ExpectedSourceRevision <40-character-git-revision> `
  -ConfirmFailover `
  -RecoveryTimeoutSeconds 600
```

Preserve the generated `artifacts/aws/*-redis-failover.json`, both ElastiCache
events, CloudTrail `TestFailover`, the observer's CloudWatch log stream, ECS
service events and readiness alarm history. Then rerun `verify-staging.ps1`.

## Acceptance criteria

1. Standard attestation proves two Redis members in distinct Availability
   Zones with Multi-AZ automatic failover enabled.
2. The observer is connected before the managed failover begins.
3. The observer detects disconnection and a Redis-backed rate-limit operation
   throws instead of falling back to process memory.
4. At least one public `/api/ready` check returns HTTP 503 during interruption.
5. The replication group returns to `available` with a different primary.
6. The observer reconnects within the approved recovery-time objective.
7. The exact ECS service task ARN is unchanged and readiness returns to 200.
8. The JSON artifact reports `passed` and is bound to the deployed task
   definition and full source revision.

## Local release-gate evidence

| Gate | Result |
|---|---|
| Focused Redis/infrastructure suite | 3 files; 19 tests passed |
| `npm test` | 94 files; 429 tests passed |
| `npm run test:security` | 1 file; 32 tests passed |
| JavaScript syntax scan | 338 files; 0 failures |
| PowerShell syntax scan | 6 scripts; 0 failures |
| `npm run typecheck` | Passed |
| `npm run build` | Passed; existing ~1.01 MB chunk warning remains |
| `npm audit --json` | 0 known vulnerabilities across 411 dependencies |
| `npm run infra:validate` | 77 resources; 30 outputs |
| `npm run routes:inventory` | 129 routes |

Static tests cannot substitute for an actual primary promotion and client
reconnection.

## Remaining production gates

- Execute this drill and rerun the full staging attestation in AWS.
- Exercise Multi-AZ RDS failover on a production-like database topology.
- Complete sustained multi-task load/soak, privacy-erasure retry, payment
  reconciliation and media-retention failure/retry drills.
- Enable relational authorities only after their migration, reconciliation,
  concurrency and rollback evidence is approved.

## References

- [ioredis auto-reconnect behavior](https://github.com/redis/ioredis#auto-reconnect)
- [Testing automatic failover for ElastiCache](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/AutoFailover.html)
- [ElastiCache resilience guidance](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/disaster-recovery-resiliency.html)

Current decision: **NO-GO for production**.
