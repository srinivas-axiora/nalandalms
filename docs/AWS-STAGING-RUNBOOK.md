# AWS staging release runbook

Date: 2026-11-06
Default region: `ap-south-1`
Target: production-shaped staging only

## 1. Before deployment

- Use a dedicated non-production AWS account or workload boundary.
- Configure AWS SSO/CLI and confirm `aws sts get-caller-identity` returns the
  intended account and role.
- Create three Secrets Manager values containing Razorpay test-mode key ID, key
  secret and webhook secret. Never place their values in command history,
  CloudFormation parameters, source files or Terraform state.
- For a custom hostname, prepare a public Route 53 hosted zone and an already
  validated ACM certificate in `us-east-1` whose subject/SAN covers the exact
  hostname.
- For encrypted origin traffic, prepare a distinct public origin hostname in
  that hosted zone and a second validated ACM certificate in the deployment
  region whose subject/SAN covers the origin hostname.
- Obtain budget approval for two NAT gateways and their data-processing
  charges; one gateway per Availability Zone avoids a cross-zone egress
  dependency.
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
npm run infra:validate
npm audit --audit-level=high
```

Also parse `infra/aws/deploy-staging.ps1` and
`infra/aws/verify-staging.ps1` with the PowerShell language parser before
invoking them. The repository tests pin service-validation, image-scan,
relational-verifier, readiness and deployed-attestation gates.

Expected gate: the current committed functional and adversarial suites pass,
type/build succeed, and no high/critical dependency advisory is present. Record
the exact test counts in the release evidence rather than relying on stale
hard-coded totals.

## 2. Deploy

Run `infra/aws/deploy-staging.ps1` using the three secret ARNs. The script:

1. verifies AWS identity and validates the template through CloudFormation;
2. creates or locates the immutable/scanned ECR repository;
3. refuses a dirty worktree, builds and pushes an immutable ARM64 image;
4. waits for ECR scanning and rejects any critical/high finding;
5. resolves the scanned manifest digest and deploys that digest with the full
   Git revision embedded in the task definition;
6. deploys the CloudFormation stack;
7. optionally runs guarded schema/bootstrap/backfill and every relational live
   verifier as isolated ECS tasks, including durable audit/security evidence,
   recursive metadata-redaction proof and the complete archive/restore drill;
   and
8. requires readiness plus deployed edge, image, task and scan attestation
   before printing outputs.

For a new staging database, prepare (but do not enable) the normalized tables:

```powershell
.\infra\aws\deploy-staging.ps1 `
  -PrepareRelationalDatabase `
  -RunRelationalVerifiers `
  -AlertEmail $alertEmail `
  -CustomDomainName $customDomainName `
  -HostedZoneId $hostedZoneId `
  -CloudFrontCertificateArn $cloudFrontCertificateArn `
  -OriginDomainName $originDomainName `
  -OriginCertificateArn $originCertificateArn `
  -EvidencePath artifacts/aws/nalanda-staging-attestation.json `
  -RazorpayKeyIdSecretArn $keyIdArn `
  -RazorpayKeySecretArn $keySecretArn `
  -RazorpayWebhookSecretArn $webhookSecretArn
```

Every one-off task must exit zero. Preserve the task ARNs and CloudWatch streams
as release evidence. Reconcile the tables using the phase documents and keep
all cutover flags off until their live database, concurrency and rollback gates
are signed off.

The task definition also pins `USE_PG_IDENTITY=0`. Run the verifier and all
cutover/failover checks in `SECURITY-PHASE-7-IDENTITY-PERSISTENCE.md` before
changing it. Enabling either feature flag without its evidence is a no-go.

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
- Keep `AuthorityMode=snapshot` through schema preparation, backfill,
  reconciliation and relational/multi-task verification. Promote it to
  `normalized` only through an approved change set, then rerun standard
  attestation before load testing.
- Confirm RDS is encrypted, `available` and Multi-AZ. Stop staging writers and
  run the forced-failover rehearsal:

    ```powershell
    .\infra\aws\verify-rds-failover.ps1 `
      -Region ap-south-1 `
      -StackName nalanda-staging `
      -ExpectedAccountId <12-digit-staging-account-id> `
      -ExpectedSourceRevision <40-character-git-revision> `
      -ConfirmFailover `
      -RecoveryTimeoutSeconds 900
    ```

    Preserve the JSON artifact, RDS/CloudTrail events, observer logs and alarm
    history. Require marker continuity, HTTP 503 during interruption, a changed
    writer Availability Zone, stable endpoint, unchanged ECS task and final
    HTTP 200 readiness.
- With normalized authority attested, run the two-task HTTP load/soak gate:

    ```powershell
    .\infra\aws\verify-http-soak.ps1 `
      -Region ap-south-1 `
      -StackName nalanda-staging `
      -ExpectedAccountId <12-digit-staging-account-id> `
      -ExpectedSourceRevision <40-character-git-revision> `
      -ConfirmLoadTest `
      -DurationSeconds 900
    ```

    Require both tasks in distinct Availability Zones, per-route p95 below 400
    ms, bounded p99/error rate, continuous readiness, CPU/memory headroom, no
    active alarms, exact fixture cleanup and restoration of the original
    service count.
- Confirm Redis reports two members in distinct Availability Zones with
  Multi-AZ and automatic failover enabled. Run the guarded failover rehearsal:

    ```powershell
    .\infra\aws\verify-redis-failover.ps1 `
      -Region ap-south-1 `
      -StackName nalanda-staging `
      -ExpectedAccountId <12-digit-staging-account-id> `
      -ExpectedSourceRevision <40-character-git-revision> `
      -ConfirmFailover `
      -RecoveryTimeoutSeconds 600
    ```

    Preserve the JSON evidence, observer log stream, ElastiCache events,
    CloudTrail event and readiness alarm history. The drill must observe HTTP
    503 while Redis request controls fail closed, a changed primary, in-place
    ECS client recovery and final HTTP 200 readiness.
- Confirm ECS service and one-off tasks use the private application subnets,
  `assignPublicIp=DISABLED`, and only the application security group. Verify
  both NAT gateways are available in their corresponding public subnets and
  each application route table sends `0.0.0.0/0` to its same-zone NAT gateway.
- Confirm S3 Block Public Access is enabled at all four settings.
- Confirm ALB access-log test and request objects appear under
  `alb/AWSLogs/<account-id>/` in the retained logging bucket.
- Confirm the regional WAF is associated with the ALB, the forwarded-IP rate
  rule blocks a synthetic flood, known-bad inputs block, and common managed
  rules emit count metrics without breaking valid large requests.
- Confirm the alert SNS subscription and exercise unhealthy-target, readiness
  failure and application-error alarm delivery/recovery in staging.
- Confirm the GuardDuty Malware Protection plan reaches `ACTIVE`. Upload clean
  synthetic media through the application and verify it is unreadable before
  the scan tag, then downloadable only after `NO_THREATS_FOUND`.
- In the isolated staging account, upload an approved antivirus test artifact
  and verify the object remains unreadable, the scan result is
  `THREATS_FOUND`, and the EventBridge-to-SNS alert is delivered. Never use a
  real malicious file or production data for this exercise.
- For a custom domain, verify Route 53 A and AAAA aliases, certificate name and
  chain, `TLSv1.2_2021`, HTTP-to-HTTPS redirect, the application origin
  allowlist and readiness through the custom hostname. Preserve DNS/TLS probe
  evidence and the CloudFront deployed status.
- Verify the origin A alias resolves to the ALB, the ALB listener exposes only
  HTTPS/443 to the CloudFront managed prefix list, and the regional certificate
  matches the origin name. Confirm CloudFront returns a healthy response over
  `https-only` origin transport and no HTTP/80 origin listener remains.
- Preserve the JSON produced by `verify-staging.ps1` in the controlled release
  record. Review its account, region, stack, distribution, listener,
  prefix-list, WAF and readiness fields; evidence from another account or stack
  is not transferable.
- Confirm the attestation's source revision equals the release commit, the
  container image contains `@sha256:`, the ECS task definition and primary
  service deployment match, the rollout is complete, and critical/high ECR
  counts are both zero.
- Retrieve the generated bootstrap administrator secret, log in once, change
  the account password and rotate/remove bootstrap access.
- Review CloudWatch errors and ALB target health for at least one normal user
  journey.

## 5. Rollback

Before production consideration, rehearse application rollback in staging with
the explicit prior task-definition ARN, Git revision and immutable image digest:

```powershell
.\infra\aws\verify-ecs-rollback.ps1 `
  -Region ap-south-1 `
  -StackName nalanda-staging `
  -RollbackTaskDefinitionArn <full-prior-task-definition-arn> `
  -ExpectedRollbackSourceRevision <40-character-git-revision> `
  -ExpectedRollbackContainerImage <digest-pinned-ecr-image>
```

The rehearsal rejects configuration drift, verifies both ECR scans, proves
running-task identity and readiness, and always attempts to restore the
stack-owned task definition. Rerun `verify-staging.ps1` afterward and preserve
both evidence artifacts. For an actual rollback, redeploy the last known-good
immutable ECR image digest through the normal reviewed release path. Because
this is a single-writer service, ECS stops the old task before starting the
replacement. Do not roll back the database independently unless a reviewed
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
