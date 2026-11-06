# Nalanda AWS staging deployment

This stack is intentionally a **single-writer staging environment**, not a
production approval. It provides CloudFront HTTPS, an ALB, one ARM64 ECS Fargate
task, private RDS PostgreSQL, private TLS-enabled ElastiCache Redis, private S3,
Secrets Manager, ALB access logs, a regional AWS WAF and CloudWatch/SNS alarms
encrypted with a rotating customer-managed KMS key. GuardDuty Malware
Protection scans course media, chapter PDFs and proctoring objects.

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
  KMS, GuardDuty Malware Protection, EventBridge, Secrets Manager, WAF, SNS and
  CloudWatch resources, including permission to pass the generated scan role to
  `malware-protection-plan.guardduty.amazonaws.com`.

## Deploy

```powershell
aws sso login --profile YOUR_PROFILE
$env:AWS_PROFILE = "YOUR_PROFILE"

.\infra\aws\deploy-staging.ps1 `
  -Region ap-south-1 `
  -PrepareRelationalDatabase `
  -RunRelationalVerifiers `
  -AlertEmail sre@example.com `
  -RazorpayKeyIdSecretArn arn:aws:secretsmanager:...:secret:razorpay-key-id `
  -RazorpayKeySecretArn arn:aws:secretsmanager:...:secret:razorpay-key-secret `
  -RazorpayWebhookSecretArn arn:aws:secretsmanager:...:secret:razorpay-webhook
```

CloudFront provisioning commonly takes several minutes. The script prints the
application URL and operational resource identifiers after the stack completes.
Before deployment the script validates the template with CloudFormation, builds
and pushes an immutable image, and blocks on any critical/high ECR scan finding.
`-PrepareRelationalDatabase` runs the guarded baseline/migrations and an
idempotent snapshot backfill inside the VPC. `-RunRelationalVerifiers` then runs
all current live PostgreSQL verification programs as isolated ECS tasks. Neither
switch enables a PostgreSQL feature flag; review and reconcile their evidence
before a separate cutover. The script finishes with a CloudFront readiness
smoke gate.

The optional alert email receives an AWS subscription confirmation. Until that
confirmation is accepted, alarms publish to the encrypted SNS topic but email
delivery is inactive. ALB request logs are retained for 90 days. WAF blocks
known-bad inputs and forwarded-client floods; the AWS common rule set starts in
count mode so staging evidence can identify legitimate large HTML, JSON and
upload payloads before selected rules are promoted to block.

Protected media is unavailable by default. GuardDuty writes the
`GuardDutyMalwareScanStatus` tag after scanning; both the API and S3 bucket
policy permit reads only for `NO_THREATS_FOUND`. Threats, skipped scans,
permission failures, internal failures and objects without a verdict remain
quarantined. EventBridge sends non-clean results and protection-health failures
to the encrypted alert topic.

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

- A transactional PostgreSQL payment path now exists behind a disabled flag;
  whole-state JSONB persistence and the remaining in-memory state still require
  one writer.
- No zero-downtime deployment or multi-AZ application service is safe yet.
- A custom domain and ACM certificate are not yet configured. The regional WAF
  protects the ALB origin; a separately managed `CLOUDFRONT`-scope web ACL in
  `us-east-1` is still recommended when the custom distribution is promoted.
- GuardDuty malware scanning/quarantine is declared, but staging must prove the
  plan becomes active, clean media becomes readable, non-clean media remains
  unreadable and alert delivery works before production.
- Restore, failover, load, privacy-erasure and payment reconciliation drills
  still require evidence.
