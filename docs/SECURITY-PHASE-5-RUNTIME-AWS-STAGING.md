# Security remediation Phase 5: runtime and AWS staging

Captured: 2026-11-03 (Asia/Calcutta)  
Branch: `security-phase-0-baseline`

## Outcome

The runtime now has production fail-closed dependency rules, distributed Redis
request budgets, separate liveness/readiness probes, safe object-retention
cleanup and a non-root multi-stage container. A CloudFormation deployment
package creates a production-shaped AWS staging environment.

This phase authorizes **staging only**. The application is still a single-writer
system because most business state is held in memory and persisted as whole
JSONB collections. The AWS service is deliberately limited to one task and
disables overlapping rolling deployments.

## Controls implemented

- Redis-backed global, AI, registration and login request budgets; production
  returns 503 rather than silently falling back to process-local enforcement.
- Atomic Redis increment/expiry via Lua.
- Production startup requires PostgreSQL TLS, Redis, private S3, Razorpay
  credentials and explicit certificate approval policy.
- `GET /api/health` for liveness and `GET /api/ready` for sanitized PostgreSQL,
  Redis and S3 dependency checks.
- Retention cleanup starts with the server, deletes through the object-store
  abstraction, rejects unsafe keys, retains failed objects for retry and saves
  cleanup state durably.
- Non-root multi-stage container with production dependencies only and a
  checksum-pinned AWS RDS CA bundle.
- CI gates functional tests, adversarial tests, type checking, dependency audit,
  production build, tracked runtime modules and container build.
- AWS staging stack: CloudFront HTTPS, CloudFront-only ALB ingress, single ECS
  Fargate writer, private encrypted RDS/Redis, private versioned S3, generated
  application secrets, least-privilege task roles and CloudWatch logs.

## Exit-gate evidence

| Gate | Result |
|---|---|
| `npm test` | 15 files; 121 tests passed |
| `npm run test:security` | 30 adversarial tests passed |
| `npm run typecheck` | Passed |
| `npm run build` | Passed; existing 1.01 MB main chunk warning remains |
| `npm audit --json` | 0 known vulnerabilities across 393 dependencies |
| JavaScript syntax checks | Passed |
| CloudFormation YAML parse | 37 resources parsed |
| PowerShell deployment script parse | Passed |
| `git diff --check` | Passed |

## Environment limitations

The workstation is not authenticated to AWS (`aws sts get-caller-identity`
cannot return an identity), and Docker cannot access its WSL backend. Therefore
the image has not been built locally, the template has not been validated by
the CloudFormation service, and no AWS resources were created. Those are
mandatory staging gates, not assumed successes.

## Remaining production blockers

- Phase 6 now provides a feature-gated transactional payment repository, but it
  still requires live PostgreSQL/concurrency validation and the remaining
  normalized repositories before enabling multiple tasks.
- Validate container build and CloudFormation deployment in the staging account.
- Phase 25 adds regional AWS WAF, ALB access logs, CloudWatch alarms and SNS
  routing; staging exercise and managed-rule tuning remain pending. Phase 26
  adds malware quarantine and Phase 27 adds optional custom-domain/ACM/Route 53
  wiring. Phase 28 adds optional regional ALB origin TLS and removes port 80
  whenever it is enabled. Phase 29 adds a post-deploy AWS attestation and
  redacted evidence artifact. Phase 30 pins the deployed ECS image to its
  scanned digest and attests the source revision and running service; all
  controls still require live staging evidence before production. Phase 31
  removes task public IPs and provides redundant private-subnet NAT egress.
  Phase 32 adds feature-gated relational audit/security evidence, a fail-closed
  response write gate and a live database verifier; AWS keeps the cutover off
  until staging proof and the remaining transactional authority work complete.
  Phase 33 adds complete relational course/assessment archives and a
  review-gated restore verifier; course authority remains disabled pending the
  remaining learning consumers and live RDS proof.
  Phase 34 removes snapshot learning projections from local Copilot commands;
  AWS still keeps course authority disabled until all remaining consumers and
  multi-task staging evidence are complete.
  Phase 35 also removes stale snapshot ownership from relational attempt
  authorization; reassignment and revocation still require multi-task RDS
  evidence before cutover.
  Phase 36 moves the active proctor cockpit grid to a minimal, SQL-scoped
  projection; live concurrency and ownership-change behavior remain staging
  gates.
  Phase 37 applies a second relational authorization check while resolving
  timeline labels so mid-request ownership revocation fails closed.
  Phase 38 establishes one runtime invariant: enabling relational course
  authority also enables relational attempt authority for every exam,
  proctoring and companion mutation path and for startup/readiness.
  Phase 39 extends the invariant to certificate eligibility, issuance,
  revocation, readiness and application projections.
  Phase 40 extends it to public candidate links, anonymous sessions,
  proctor evidence, deadline/grading writes, readiness and privacy coverage.
  Phase 41 extends it to payment orders, provider webhooks, settlement records
  and the enrolled-course entitlement written in the settlement transaction.
  Phase 42 extends it to the proctor policy used by settings administration,
  attempt start and live proctor-event enforcement.
  Phase 43 extends it to skills, competency targets, ratings, chapter feedback
  and the evidence used by local learning recommendations.
  Phase 44 extends it to authentication, session revocation, user lifecycle,
  companion identity validation and user archive authority.
  Phase 45 extends it to durable privacy export/deletion workflows while
  retaining explicit worker and coverage-acknowledgement release gates.
  Phase 46 extends it to durable audit/security evidence writes and reads while
  preserving the fail-closed response gate and schema/dependency readiness checks.
  Phase 47 replaces process-local proctoring-media retention with a normalized,
  retryable and multi-worker-safe RDS/S3 deletion workflow.
  Phase 48 closes the remaining enrollment-consumer inventory: course cutover
  selects relational authority for every enrollment read or mutation surface,
  with a route regression covering transactional attempt start. This removes
  the documented code-coverage gap but does not replace live RDS, concurrency
  or rollback evidence.
  Phase 49 removes the pending-review queue's last process-local identity join;
  learner labels now come from a bounded, credential-free PostgreSQL projection.
  Phase 50 moves Copilot attendance, performance reviews, announcements,
  inbox/direct messages and self-appraisals to normalized PostgreSQL authority;
  privacy coverage advances to `normalized-v2`. AWS retains a default-off
  `USE_PG_WORKPLACE` flag until live RDS, multi-task and erasure evidence exists.
  Phase 51 closes the final task-local course label lookup and replaces the
  unconditional production rejection with a versioned, default-off coverage
  acknowledgement plus database-shape readiness. The deployment verifier can
  now run an isolated production-mode course cutover canary, but the ECS service
  still ships with course authority and its acknowledgement disabled.
  Phase 52 adds a two-Fargate-task concurrency canary for enrollment,
  attendance, active-attempt uniqueness, report work claiming and optimistic
  course updates. It writes source-revision-bound evidence but remains unproven
  until executed in the intended AWS account.
  Phase 53 adds a tagged, isolated RDS snapshot/restore drill that verifies a
  source-revision marker, critical schema, private networking, encryption and
  a bounded recovery-time objective before deleting only run-scoped resources.
  Phase 54 adds an explicit ECS task-definition rollback rehearsal that rejects
  configuration drift and unsafe images, proves running-task identity and
  readiness, and restores the stack-owned release from a `finally` path.
  Phase 55 replaces the single cache node with encrypted two-node Multi-AZ
  Redis, fixes permanent client disconnect after transient failure and adds a
  guarded managed-failover rehearsal proving fail-closed readiness and in-place
  client recovery. Phase 56 upgrades RDS to an encrypted Multi-AZ DB instance,
  bounds database queries and adds a forced-failover rehearsal proving durable
  marker continuity, DNS/client reconnection and in-place ECS recovery. These
  are local controls only until executed in the intended AWS account.
- Phase 57 adds a default-off atomic normalized-authority mode and a guarded
  two-task HTTP load/soak gate. It pins traffic to both cross-AZ tasks, exercises
  authenticated reads and writes plus the public edge, and enforces latency,
  error, readiness, resource-headroom and alarm thresholds while restoring the
  original service size.
- Phase 58 integrates a guarded normalized-authority promotion into the release
  workflow: force snapshot mode, enforce and recover zero-task write
  quiescence, reject missing/quarantined source rows and critical binding
  mismatches with durable reconciliation evidence, run every verifier and
  concurrency gate, create an encrypted source-tagged RDS snapshot, promote and
  attest, require the Phase-57 soak, and automatically restore/attest snapshot
  authority after any post-cutover failure.
- Phase 59 adds an isolated normalized operational-recovery gate for internal
  payment-ledger reconciliation, privacy-erasure failure/retry and real
  object-store media-retention failure/retry. External Razorpay settlement,
  refund and dispute parity remains a live go-production requirement.
- Phases 60-61 bind the restore and primary staging-deployment entry points to
  explicit confirmation, the intended AWS account/revision and an unmistakably
  non-production stack. Phase 62 adds the final fresh, cross-artifact release
  decision over all AWS drills plus finance and privacy approval evidence.
- Phase 63 removes the last account exception from multi-task evidence by
  guarding direct canary execution and recording its account and immutable
  image binding.
- Execute the backup/restore, rollback, Redis and RDS failover gates, then
  execute the Phase-57 load/soak gate and complete privacy erasure, payment
  reconciliation and retention retry drills.
