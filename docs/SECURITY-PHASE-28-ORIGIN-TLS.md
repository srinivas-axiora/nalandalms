# Phase 28 — CloudFront-to-ALB origin TLS

Date: 2026-11-06
Status: **implemented locally; AWS certificate and handshake proof pending**
Production decision: **NO-GO remains unchanged**

## Outcome

The staging stack can now encrypt both external transport hops. When a distinct
origin hostname and a validated regional ACM certificate are supplied together,
Route 53 maps that hostname to the ALB, the ALB exposes HTTPS/443 with a modern
TLS policy, and CloudFront connects to the custom origin with `https-only` and
TLS 1.2.

The existing HTTP origin remains only as an explicit non-production staging
fallback. Enabling origin TLS removes port 80 from the ALB security group and
listener rather than leaving a parallel cleartext route.

## Controls implemented

- CloudFormation parameters and rules require the origin hostname and
  certificate together, require the existing hosted zone, and reject reuse of
  the public application hostname.
- The deployment script independently validates the complete tuple, DNS name,
  hostname separation and certificate region before making an AWS call.
- Route 53 creates a conditional A alias from the origin hostname to the ALB
  using the load balancer's canonical hosted-zone ID.
- The ALB listener conditionally switches from HTTP/80 to HTTPS/443, attaches
  the regional certificate and uses `ELBSecurityPolicy-TLS13-1-2-2021-06`.
- The ALB security group conditionally admits only 443 from AWS's CloudFront
  origin-facing managed prefix list.
- CloudFront conditionally uses the origin hostname, `https-only`, port 443 and
  TLS 1.2. The origin request policy continues to exclude the viewer `Host`
  header so TLS name validation uses the configured origin name.

## Local evidence

- Local CloudFormation structural validation passed with 65 resources and 15
  outputs.
- PowerShell parsing passed with zero syntax errors; all 8 focused AWS
  infrastructure tests passed.
- Four negative deployment-script probes passed: partial origin input, origin
  TLS without the complete viewer tuple, duplicate viewer/origin hostname and a
  certificate from the wrong region all failed before any AWS call.
- The full functional suite passed 58 files and 290 tests; the isolated
  adversarial suite passed all 32 tests.
- Frontend type checking and the production build passed. The existing
  approximately 1.01 MB minified bundle warning remains non-blocking for this
  infrastructure phase.
- The authorization inventory passed with 129 declared route policies, and
  `git diff --check` passed.
- `npm audit --json` reported 0 known vulnerabilities across 411 dependencies.
- CloudFormation service validation is blocked because AWS credentials are not
  configured on this workstation (`NoCredentials`).
- Regional certificate status, DNS resolution and CloudFront-to-ALB TLS
  handshake proof: pending the intended account, region and domains.
- Phase 29 now automates the deployed distribution, listener, certificate,
  security-group, WAF and readiness checks and records a redacted JSON
  attestation; it still requires authenticated AWS execution.

## Required deployment evidence

1. Issue and DNS-validate a public ACM certificate in the deployment region for
   a distinct origin hostname such as `origin.staging.example.com`.
2. Deploy the complete viewer and origin tuples; retain CloudFormation
   validation, change-set and successful stack-event evidence.
3. Confirm the origin A alias resolves to the stack ALB and that the ALB
   presents the expected certificate and complete chain on port 443.
4. Confirm there is no listener or security-group ingress on port 80 and that
   only the CloudFront managed origin-facing prefix list can reach port 443.
5. Exercise `/api/ready` and representative authenticated requests through
   CloudFront; retain response and distribution evidence proving the origin is
   `https-only` without 502/TLS errors.

## AWS design references

- CloudFront HTTPS to a custom origin:
  <https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-https-cloudfront-to-custom-origin.html>
- CloudFormation ALB listener and certificate configuration:
  <https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-elasticloadbalancingv2-listener.html>
- Route 53 aliases to load balancers:
  <https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/quickref-route53.html>

Production remains blocked on this live evidence, AWS deployment,
restore/failover/load/privacy/payment drills and completion of the relational
multi-writer cutover.
