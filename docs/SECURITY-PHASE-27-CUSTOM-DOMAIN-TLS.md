# Phase 27 — custom-domain TLS and DNS

Date: 2026-11-06
Status: **implemented locally; certificate, DNS and AWS validation pending**
Production decision: **NO-GO remains unchanged**

## Outcome

The AWS stack can now promote staging from its generated CloudFront hostname to
an intended application hostname without weakening the default path. Custom DNS
is enabled only when the domain name, Route 53 hosted zone and validated ACM
certificate ARN are supplied together.

CloudFront uses the certificate through SNI with the `TLSv1.2_2021` security
policy. Route 53 creates both A and AAAA aliases, the application URL output and
backend origin allowlist switch to the custom hostname, and the deployment
smoke test consequently validates that public hostname.

## Controls implemented

- CloudFormation parameter patterns and a template rule reject incomplete or
  malformed custom-domain configuration.
- The deployment script independently rejects partial input, malformed DNS or
  hosted-zone values, and certificate ARNs outside `us-east-1` before making an
  AWS call.
- CloudFront aliases, certificate settings, origin allowlist and application URL
  are driven by one condition to prevent split configuration.
- Route 53 publishes dual-stack aliases to the CloudFront distribution.
- When no custom-domain tuple is supplied, the existing CloudFront hostname and
  default certificate remain available for non-production staging.

## Local evidence

- Local CloudFormation structural validation passed with 64 resources and 14
  outputs.
- PowerShell deployment-script parsing passed with zero syntax errors; all 7
  focused AWS infrastructure tests passed.
- The full functional suite passed 58 files and 289 tests; the isolated
  adversarial suite passed all 32 tests.
- Frontend type checking and the production build passed. The build retains the
  known non-blocking large-bundle warning (approximately 1.01 MB minified).
- The authorization inventory passed with 129 declared route policies, and
  `git diff --check` passed.
- `npm audit --json` reported 0 known vulnerabilities across 411 dependencies.
- CloudFormation service validation: blocked because AWS credentials are not
  configured on this workstation.
- Certificate coverage/validation, DNS propagation and live TLS proof: pending
  the intended domain, hosted zone, certificate and AWS deployment.

## Remaining TLS boundary

This phase protects the viewer-to-CloudFront connection. Phase 28 now declares
an optional regional-certificate path for CloudFront-to-ALB HTTPS, but that path
still requires service validation and a live handshake from the deployed stack.
The HTTP staging fallback must never be promoted to production.

## Required deployment evidence

1. Confirm the intended hostname and Route 53 public hosted zone are owned by
   the staging/production account boundary.
2. Issue and DNS-validate the covering ACM public certificate in `us-east-1`.
3. Deploy with the complete domain tuple and retain CloudFormation validation,
   change-set and distribution-deployed evidence.
4. Verify A/AAAA resolution, certificate SAN/chain/expiry, SNI-only
   `TLSv1.2_2021`, HTTP redirect and `/api/ready` through the custom hostname.
5. Confirm hostile origins remain rejected and all application-generated links
   and cookies behave correctly on the final hostname.

## AWS design references

- CloudFront certificate region and certificate requirements:
  <https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-requirements.html>
- CloudFormation viewer certificate settings:
  <https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-properties-cloudfront-distribution-viewercertificate.html>
- Route 53 alias routing to CloudFront:
  <https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-to-cloudfront-distribution.html>

Production remains blocked on this live evidence, live origin-TLS proof, AWS deployment,
restore/failover/load/privacy/payment drills and completion of the relational
multi-writer cutover.
