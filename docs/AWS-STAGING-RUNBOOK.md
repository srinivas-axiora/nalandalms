# AWS staging release runbook

Date: 2026-11-03  
Default region: `ap-south-1`  
Target: production-shaped staging only

## 1. Before deployment

- Use a dedicated non-production AWS account or workload boundary.
- Configure AWS SSO/CLI and confirm `aws sts get-caller-identity` returns the
  intended account and role.
- Create three Secrets Manager values containing Razorpay test-mode key ID, key
  secret and webhook secret. Never place their values in command history,
  CloudFormation parameters, source files or Terraform state.
- Start Docker Desktop and confirm Linux ARM64 builds work.
- Confirm the repository is clean and the intended security commits are on the
  deployment branch.
- Run locally:

```powershell
npm ci
npm test
npm run test:security
npm run typecheck
npm run build
npm audit --audit-level=high
```

Expected gate: 127 functional tests, 30 adversarial tests, type/build success
and no high/critical dependency advisory.

## 2. Deploy

Run `infra/aws/deploy-staging.ps1` using the three secret ARNs. The script:

1. verifies AWS identity;
2. creates or locates the immutable/scanned ECR repository;
3. builds and pushes an immutable ARM64 image;
4. deploys the CloudFormation stack; and
5. optionally runs guarded schema bootstrap and snapshot backfill as one-off ECS
   tasks when `-PrepareRelationalDatabase` is supplied; and
6. prints the CloudFront URL and operational identifiers.

For a new staging database, prepare (but do not enable) the normalized tables:

```powershell
.\infra\aws\deploy-staging.ps1 `
  -PrepareRelationalDatabase `
  -RazorpayKeyIdSecretArn $keyIdArn `
  -RazorpayKeySecretArn $keySecretArn `
  -RazorpayWebhookSecretArn $webhookSecretArn
```

The two one-off tasks must exit zero. Reconcile the tables using
`SECURITY-PHASE-6-PAYMENT-PERSISTENCE.md`. `USE_PG_PAYMENTS` remains off; do not
manually add it to the task definition until the live database and concurrency
gate is signed off.

Do not change the ECS desired count or deployment percentages.

## 3. Smoke and security checks

From a clean browser profile and the command line:

- `/api/health` returns 200 and `/api/ready` returns 200 with PostgreSQL, Redis
  and S3 checks green.
- HTTP is redirected to CloudFront HTTPS; direct ALB access is rejected by its
  security group.
- Registering with a privileged role still creates a Learner.
- Login, logout and pre-logout token replay behave as expected.
- Cross-user course, assessment, proctoring and certificate requests return 403.
- Expired assessment starts/submissions reject late answers.
- Upload a synthetic PDF; anonymous and cross-user downloads fail, while the
  authorized download is an attachment with `nosniff`.
- Create a Razorpay test order, verify a signed test payment, replay it and send
  a mismatched user/course request. Only the bound, signed flow changes state.
- Verify CloudWatch contains correlation IDs and no cookies, passwords, signed
  object grants or provider secrets.

Do not use real learner/candidate PII or real payments in this staging stack.

## 4. Operational checks

- Force-stop the ECS task and verify ECS replaces it and readiness recovers.
- Confirm RDS automated backups and S3 versioning are enabled.
- Confirm Redis and RDS have no public endpoint exposure.
- Confirm S3 Block Public Access is enabled at all four settings.
- Retrieve the generated bootstrap administrator secret, log in once, change
  the account password and rotate/remove bootstrap access.
- Review CloudWatch errors and ALB target health for at least one normal user
  journey.

## 5. Rollback

Redeploy the last known-good immutable ECR image tag through the same script.
Because this is a single-writer service, ECS stops the old task before starting
the replacement. Do not roll back the database independently unless a reviewed
data migration requires it.

If data integrity is in doubt:

1. stop the ECS service;
2. preserve logs and the current RDS snapshot;
3. restore RDS to a new instance from the last known-good point;
4. verify counts and critical payment/exam records; and
5. update the service only after written go approval.

## 6. No-go conditions

Stop the release if identity is wrong, readiness is not green, any gate fails,
the container cannot run non-root, CloudFront HTTPS is unavailable, secrets are
missing, S3 is public, or the AWS account/region is not the intended staging
target.
