# Phase 25 — AWS edge protection and operational evidence

Date: 2026-11-06
Status: **implemented locally; AWS service validation and exercise pending**
Production decision: **NO-GO remains unchanged**

## Outcome

The production-shaped staging stack now includes origin-layer WAF protection,
retained ALB request logs, encrypted alarm routing and explicit runtime,
application, database and edge alarms. The deployment script also turns image
scanning and every live relational verifier into release gates.

## Controls implemented

- A private, encrypted, versioned ALB access-log bucket retains current logs for
  90 days and noncurrent versions for 30 days. Its policy grants only the AWS
  load-balancer log-delivery service the account/region-scoped object path and
  denies insecure transport.
- A `REGIONAL` AWS WAF web ACL is associated with the ALB. It blocks excessive
  requests using CloudFront's forwarded client IP and blocks the AWS known-bad
  input managed rule group.
- The AWS common managed rule group starts in count mode. This is deliberate:
  Nalanda accepts large JSON, HTML and upload bodies, so staging must identify
  false positives before individual rules are promoted to block.
- A customer-managed, automatically rotating KMS key grants the account-scoped
  CloudWatch alarm publisher only the data-key operations needed for the
  encrypted notification path. The encrypted SNS topic routes unhealthy target,
  target 5xx, ECS CPU/memory, RDS CPU/free-storage, readiness failure,
  application error and WAF block alarms. Email subscription is optional and
  requires confirmation.
- Structured application logs create dedicated readiness-failure and error
  metrics.
- The deployment script validates the template through the AWS service, waits
  for ECR scanning, rejects critical/high image findings and requires a final
  CloudFront readiness response.
- `-RunRelationalVerifiers` runs all fourteen current live PostgreSQL verifier
  programs as isolated ECS tasks and fails the deployment workflow on any
  non-zero exit.

## Local evidence

- PowerShell syntax parsing: passed with zero parser errors.
- CloudFormation local structural validation: passed with 57 resources and 13
  outputs; duplicate keys and required edge/observability resources are gated.
- AWS infrastructure regression tests: 5 passed.
- Application suite: 57 files and 280 tests passed.
- Isolated adversarial security suite: 32 tests passed.
- TypeScript type check, production frontend build and 129-route authorization
  inventory: passed. The build retains a non-blocking large-bundle warning.
- Dependency audit: 0 known vulnerabilities across all severities.
- Diff hygiene: passed.
- CloudFormation service validation: blocked because AWS credentials are not
  configured on this workstation.
- Container build/ECR scan/AWS deployment: blocked because Docker's WSL backend
  is access-denied and AWS identity is unavailable.

The local YAML gate validates syntax and required structure but does not claim
CloudFormation resource-schema or account-policy acceptance. The deployment
script therefore repeats validation through the AWS service before it builds or
deploys anything.

## AWS design references

- ALB access-log bucket requirements and delivery policy:
  <https://docs.aws.amazon.com/elasticloadbalancing/latest/application/enable-access-logging.html>
- Regional web ACL association:
  <https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-wafv2-webaclassociation.html>
- AWS managed WAF rule groups:
  <https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-properties-wafv2-webacl-managedrulegroupstatement.html>
- Encrypted SNS event-source key permissions:
  <https://docs.aws.amazon.com/sns/latest/dg/sns-key-management.html>

## Required staging evidence

1. Confirm the intended AWS account/role and validate the template through the
   service.
2. Build the non-root ARM64 image and preserve an ECR scan with zero high or
   critical findings.
3. Deploy with schema preparation and all relational verifiers enabled; retain
   task ARNs and CloudWatch log streams.
4. Confirm ALB log delivery, WAF association and forwarded-IP rate blocking.
5. Exercise every alarm and confirm both alarm and recovery notifications.
6. Tune common-rule false positives using only synthetic requests, then promote
   reviewed rules from count to block.

Production remains blocked on this live evidence, live verification of the
Phase-26 malware quarantine, custom-domain/ACM configuration,
restore/failover/load/privacy/payment drills and completion of the relational
multi-writer cutover.
