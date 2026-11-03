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
- Add malware scanning/quarantine, AWS WAF, custom domain/certificate, access
  logs, alarms and incident routing.
- Execute backup restore, failover, load/soak, privacy erasure, payment
  reconciliation and rollback drills.
