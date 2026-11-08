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
- Execute backup restore, failover, load/soak, privacy erasure, payment
  reconciliation and rollback drills.
