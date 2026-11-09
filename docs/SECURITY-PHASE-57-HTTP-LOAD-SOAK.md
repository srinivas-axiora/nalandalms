# Security remediation Phase 57: two-task HTTP load and soak gate

Captured: 2026-11-09 (Asia/Calcutta)
Branch: `security-phase-0-baseline`

## Outcome

Nalanda now has a guarded staging gate that scales the ECS service to two tasks,
pins one independent synthetic learner workload to each task's private address,
and measures authenticated relational API behavior for a sustained interval.
Edge readiness is exercised through CloudFront at the same time. The gate
requires per-route p95 latency below 400 ms by default, bounded p99, sufficient
throughput, no 5xx/auth/throttle failures, continuous public readiness, resource
headroom and no active staging alarms.

This is locally validated release tooling, not live load evidence. AWS
credentials are still unavailable on this workstation, the normalized
authority mode is not deployed, and production remains **NO-GO**.

## Controlled authority mode

CloudFormation now exposes one `AuthorityMode` parameter:

- `snapshot` is the default and keeps every relational authority flag and
  background worker disabled;
- `normalized` switches all relational authorities, the exact
  `normalized-v1` course coverage acknowledgement, the `normalized-v2` privacy
  acknowledgement, and the privacy/report workers as one atomic task-definition
  change.

The standard AWS attestation rejects a task definition whose flags,
acknowledgements or workers disagree with the stack output. The load gate
refuses snapshot mode. This parameter is a promotion mechanism, not permission
to promote: migrations, backfill reconciliation, component verifiers,
multi-task canary, backup and change approval must precede the change.

## Traffic profile

Each of two ECS load workers obtains an independent learner session and sends a
rate-controlled mix directly to one distinct service task:

- current-session identity;
- visible course catalog;
- authorized chapters and chapter progress;
- personal analytics;
- idempotent chapter heartbeat writes; and
- dependency readiness.

Each worker also samples `/api/ready` through the public HTTPS edge. The default
profile is two requests per second per worker for 15 minutes. The worker stores
one source-revision-bound summary in PostgreSQL; it does not persist request
bodies, cookies, tokens or credentials.

## Acceptance criteria

The gate passes only when:

1. the account, non-production environment, full Git revision, image digest,
   OCI revision label and normalized authority mode match expectations;
2. exactly two healthy service tasks run the same task definition in distinct
   Availability Zones;
3. each independent load worker targets one private service task and sustains
   at least 90% of the requested rate and duration;
4. every route has sufficient samples, p95 is below 400 ms and p99 is at most
   1,000 ms unless stricter approved thresholds are supplied;
5. aggregate error rate is at most 0.1%, with zero 5xx, 401/403 and 429
   responses;
6. public readiness remains HTTP 200 and neither service task is replaced;
7. peak ECS CPU and memory remain at or below 80%, and no stack alarm is in
   `ALARM`; and
8. the synthetic fixture is deleted and the ECS service returns to its original
   desired count even after failure.

## Private load boundary

The application security group permits port 8080 only from the ALB security
group and itself. The self-reference lets private one-off verifier tasks reach
specific service tasks; there is no CIDR, public IP or internet ingress. Standard
attestation verifies both sources and rejects any extra CIDR or prefix-list
source.

## Staging runbook

After a reviewed normalized-authority promotion and a successful standard
attestation, run:

```powershell
.\infra\aws\verify-http-soak.ps1 `
  -Region ap-south-1 `
  -StackName nalanda-staging `
  -ExpectedAccountId <12-digit-staging-account-id> `
  -ExpectedSourceRevision <40-character-git-revision> `
  -ConfirmLoadTest `
  -DurationSeconds 900 `
  -RequestsPerSecondPerWorker 2 `
  -P95ThresholdMilliseconds 400 `
  -P99ThresholdMilliseconds 1000
```

Preserve the generated `artifacts/aws/*-http-soak.json`, worker/assertion logs,
ECS service events, CloudWatch metrics and alarm history. Run standard
attestation again after the service returns to its original size.

## Local release-gate evidence

| Gate | Result |
|---|---|
| Focused load/infrastructure suite | 3 files; 25 tests passed |
| `npm test` | 96 files; 442 tests passed |
| Adversarial security suite | 1 file; 32 tests passed |
| JavaScript syntax | 342 files passed |
| PowerShell syntax | 8 files passed |
| `npm run typecheck` | Passed |
| `npm run build` | Passed; existing large-chunk warning retained |
| `npm audit --json` | 0 vulnerabilities; 411 dependencies |
| `npm run infra:validate` | 78 resources; 31 outputs |
| Authorization inventory | 129 routes |

All local project gates passed. These tests cannot establish runtime latency,
throughput, cross-AZ traffic distribution or CloudWatch headroom; those claims
require the live staging gate.

## Remaining production gates

- Execute the Phase-58 guarded relational promotion, which makes the multi-task
  concurrency canary and this load/soak gate mandatory, then run backup/restore,
  ECS rollback and Redis/RDS failover in AWS.
- Exercise privacy-erasure retry, payment reconciliation and media-retention
  failure/retry with reviewed evidence.
- Execute Phase 58's fail-closed reconciliation and promotion in AWS, preserve
  its hash-bound audit/evidence artifacts, and complete the production change
  review.

Current decision: **NO-GO for production**.
