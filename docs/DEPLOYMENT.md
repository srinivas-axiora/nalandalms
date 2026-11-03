# Nalanda deployment architecture

Current release decision: **staging permitted; production remains gated**.

## Approved AWS topology for the current architecture

```text
Browser
  -> CloudFront (HTTPS, cache disabled for authenticated application traffic)
  -> Application Load Balancer (accepts CloudFront origin traffic only)
  -> one ECS Fargate task (single writer)
       -> private RDS PostgreSQL (current JSONB collection snapshot)
       -> private TLS ElastiCache Redis (distributed request budgets)
       -> private encrypted S3 (uploaded objects)
       -> Secrets Manager (runtime credentials)
       -> CloudWatch Logs / Container Insights
```

The one-task limit is a correctness constraint, not a sizing recommendation.
The running application still holds its authoritative working set in process
memory and persists whole collections. Multiple tasks or overlapping rolling
deployments can overwrite each other's state. The staging CloudFormation stack
therefore uses `DesiredCount: 1`, `MaximumPercent: 100` and
`MinimumHealthyPercent: 0`.

## Production runtime contract

Production startup fails closed unless all of these are configured:

- PostgreSQL via `DATABASE_URL` or the standard `PGHOST`, `PGPORT`,
  `PGDATABASE`, `PGUSER`, `PGPASSWORD` variables, with `PGSSL=require`.
- `REDIS_URL`; request rate controls do not fall back to process memory in
  production.
- `S3_BUCKET` and `S3_REGION`; ECS uses its IAM task role, not static access
  keys.
- Strong `JWT_SECRET` and `CERTIFICATE_SIGNING_SECRET` values.
- Razorpay key ID, key secret and webhook secret.
- An explicit `CERTIFICATE_ISSUANCE_APPROVAL_ROLE`.

`GET /api/health` is the process liveness probe. `GET /api/ready` verifies the
database, Redis and object store and returns 503 if a dependency is unavailable.

## Container

The root `Dockerfile` builds the frontend in a separate stage and runs the API
as a non-root user with production dependencies only. It pins the checksum of
the official AWS RDS global CA bundle and exposes port 8080.

The CI gate runs functional tests, the adversarial security suite, TypeScript,
the dependency audit, the production build and a clean container build.

## Deploy staging

Use [the AWS deployment package](../infra/aws/README.md) and the associated
runbook. The deploy script builds an immutable ARM64 image, pushes it to an
immutable/scanned ECR repository and deploys the CloudFormation stack in
`ap-south-1` by default.

## Production go criteria

Do not promote staging to production until all of the following are evidenced:

1. Normalized transactional repositories replace whole-state snapshot writes
   for identity, enrollment, assessment, attempt, payment, certificate, audit
   and privacy workflows.
2. Two or more ECS tasks pass concurrency and failover tests without lost
   updates; zero-downtime rolling deployment is restored.
3. AWS WAF, custom domain/ACM, access logs, alarms and incident routing are
   enabled and exercised.
4. S3 malware scanning/quarantine prevents unscanned objects from being served.
5. Privacy deletion and retention workflows operate durably across PostgreSQL,
   S3, logs and backups with legal-hold handling.
6. RDS point-in-time restore, application rollback and secret rotation drills
   meet the agreed RTO/RPO.
7. Production-like load, soak, payment reconciliation and negative-security
   tests pass with approved evidence.
