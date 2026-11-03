# Nalanda AWS staging deployment

This stack is intentionally a **single-writer staging environment**, not a
production approval. It provides CloudFront HTTPS, an ALB, one ARM64 ECS Fargate
task, private RDS PostgreSQL, private TLS-enabled ElastiCache Redis, private S3,
Secrets Manager and CloudWatch Logs.

The ECS deployment configuration never overlaps old and new tasks. This avoids
two application processes writing the current whole-state JSONB snapshot at the
same time. Deployments therefore have a short interruption. Do not raise
`DesiredCount` above one until the normalized transactional repository cutover
is complete and multi-instance concurrency tests pass.

## Prerequisites

- AWS CLI authenticated to the intended non-production account.
- Docker Desktop able to build `linux/arm64` images.
- Three existing Secrets Manager secrets containing the Razorpay key ID, key
  secret and webhook secret. Use test-mode Razorpay credentials in staging.
- Permission to create VPC, ECS, ECR, RDS, ElastiCache, CloudFront, S3, IAM,
  Secrets Manager and CloudWatch resources.

## Deploy

```powershell
aws sso login --profile YOUR_PROFILE
$env:AWS_PROFILE = "YOUR_PROFILE"

.\infra\aws\deploy-staging.ps1 `
  -Region ap-south-1 `
  -RazorpayKeyIdSecretArn arn:aws:secretsmanager:...:secret:razorpay-key-id `
  -RazorpayKeySecretArn arn:aws:secretsmanager:...:secret:razorpay-key-secret `
  -RazorpayWebhookSecretArn arn:aws:secretsmanager:...:secret:razorpay-webhook
```

CloudFront provisioning commonly takes several minutes. The script prints the
application URL and operational resource identifiers after the stack completes.

## First-login and validation

Retrieve the generated bootstrap password without printing it into shared logs,
sign in as the seeded Super Admin, change the password immediately, then revoke
or rotate the bootstrap secret.

Run these gates against the CloudFront URL:

```powershell
$url = "https://YOUR_DISTRIBUTION.cloudfront.net"
Invoke-RestMethod "$url/api/health"
Invoke-RestMethod "$url/api/ready"
```

Then execute the smoke checklist in `docs/AWS-STAGING-RUNBOOK.md`. Do not copy
production PII, payment records or real candidate evidence into this stack.

## Known production blockers

- Whole-state JSONB persistence and in-memory runtime state require one writer.
- No zero-downtime deployment or multi-AZ application service is safe yet.
- The stack does not yet attach AWS WAF or a custom domain/certificate.
- Malware scanning/quarantine must be added before untrusted file uploads are
  enabled for production.
- Restore, failover, load, privacy-erasure and payment reconciliation drills
  still require evidence.
