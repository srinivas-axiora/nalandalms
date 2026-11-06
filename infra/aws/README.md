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
  -CustomDomainName staging.example.com `
  -HostedZoneId Z0123456789EXAMPLE `
  -CloudFrontCertificateArn arn:aws:acm:us-east-1:123456789012:certificate/00000000-0000-0000-0000-000000000000 `
  -OriginDomainName origin.staging.example.com `
  -OriginCertificateArn arn:aws:acm:ap-south-1:123456789012:certificate/11111111-1111-1111-1111-111111111111 `
  -RazorpayKeyIdSecretArn arn:aws:secretsmanager:...:secret:razorpay-key-id `
  -RazorpayKeySecretArn arn:aws:secretsmanager:...:secret:razorpay-key-secret `
  -RazorpayWebhookSecretArn arn:aws:secretsmanager:...:secret:razorpay-webhook
```

CloudFront provisioning commonly takes several minutes. The script prints the
application URL and operational resource identifiers after the stack completes.
Before deployment the script validates the template with CloudFormation, builds
and pushes an immutable image from a clean Git worktree, and blocks on any
critical/high ECR scan finding. It then resolves the scanned manifest digest and
passes the digest URI—not the mutable tag—to the ECS task definition together
with the full Git revision.
`-PrepareRelationalDatabase` runs the guarded baseline/migrations and an
idempotent snapshot backfill inside the VPC. `-RunRelationalVerifiers` then runs
all current live PostgreSQL verification programs as isolated ECS tasks. Neither
switch enables a PostgreSQL feature flag; review and reconcile their evidence
before a separate cutover. The script finishes with a CloudFront readiness
smoke gate and deployed-control attestation.

The three custom-domain parameters are optional but atomic: provide all three
or none. The certificate must already be validated, cover the requested DNS
name and reside in ACM `us-east-1`, as required by CloudFront. When supplied,
the stack configures SNI-only `TLSv1.2_2021`, IPv4/IPv6 Route 53 aliases and the
application origin allowlist. Without them, staging uses the generated
`cloudfront.net` hostname and certificate.

The two origin-TLS parameters are also optional but atomic and require the
complete custom-domain tuple. The origin hostname must be distinct from the
application hostname, and its public ACM certificate must be validated in the
deployment region. When supplied, Route 53 aliases the origin name to the ALB,
the listener moves from HTTP/80 to HTTPS/443 with a TLS 1.2/1.3 policy, the
CloudFront origin becomes `https-only`, and the security group exposes only 443
to the CloudFront managed origin-facing prefix list.

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

After readiness passes, deployment invokes `verify-staging.ps1`. The verifier
fails closed unless CloudFront is deployed, expected viewer/origin TLS settings
and certificates match, the ALB exposes one approved listener, its security
group is scoped only to the CloudFront managed prefix list, the regional WAF is
attached and `/api/ready` succeeds. It writes a redacted JSON attestation under
`artifacts/aws/` by default; Git ignores that directory, so copy the result to
the controlled release record. The attestation also proves the task definition
and active ECS service use the expected digest and revision, the service is at a
stable 1/1 single-writer count, and ECR reports no critical or high findings.

The verification can also be rerun without redeploying:

```powershell
./infra/aws/verify-staging.ps1 `
  -Region ap-south-1 `
  -StackName nalanda-staging `
  -ExpectedCustomDomainName staging.example.com `
  -ExpectedCloudFrontCertificateArn $cloudFrontCertificateArn `
  -ExpectedOriginDomainName origin.staging.example.com `
  -ExpectedOriginCertificateArn $originCertificateArn `
  -ExpectedContainerImage $expectedContainerImageDigestUri `
  -ExpectedSourceRevision $expectedGitRevision `
  -RequireEndToEndTls `
  -EvidencePath artifacts/aws/nalanda-staging-attestation.json
```

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
- Custom-domain/ACM wiring is declared but needs the intended domain, public
  hosted zone and a validated `us-east-1` certificate plus live DNS/TLS proof.
  Origin TLS is declared separately and needs a distinct origin hostname, a
  validated regional certificate and a successful CloudFront-to-ALB handshake
  probe; do not promote the HTTP fallback to production.
  The regional WAF protects the ALB origin; a separately managed
  `CLOUDFRONT`-scope web ACL in `us-east-1` is still recommended when the custom
  distribution is promoted.
- GuardDuty malware scanning/quarantine is declared, but staging must prove the
  plan becomes active, clean media becomes readable, non-clean media remains
  unreadable and alert delivery works before production.
- Restore, failover, load, privacy-erasure and payment reconciliation drills
  still require evidence.
