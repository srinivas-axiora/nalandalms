# Phase 29 — deployed AWS control attestation

Date: 2026-11-06
Status: **implemented locally; authenticated AWS execution pending**
Production decision: **NO-GO remains unchanged**

## Outcome

Staging deployment no longer treats a successful CloudFormation update or one
readiness response as sufficient release evidence. A standalone verifier reads
the deployed AWS control plane, compares it with the expected viewer and origin
configuration, fails closed on drift, and emits a redacted JSON attestation for
the release record.

The deployment script invokes this verifier after its readiness smoke gate.
The attestation is ignored by Git by default because it contains account,
resource and hostname identifiers even though it contains no secret values.

## Controls implemented

- Requires the stack to be in `CREATE_COMPLETE`, `UPDATE_COMPLETE` or
  `IMPORT_COMPLETE` and the CloudFront distribution to be enabled and deployed.
- Verifies the expected CloudFront alias, viewer certificate, SNI setting and
  `TLSv1.2_2021` policy when a custom hostname is configured.
- Verifies the ALB origin name, `https-only`, port 443 and TLS 1.2 when origin
  TLS is required; incomplete expected tuples are rejected before any AWS call.
- Requires exactly one ALB listener, the approved HTTPS policy and expected
  regional certificate. In fallback staging it instead proves the single
  HTTP/80 listener rather than misreporting end-to-end TLS.
- Requires exactly one ALB ingress rule on the expected port, with only the AWS
  CloudFront origin-facing managed prefix list and no CIDR, IPv6 or security-
  group source.
- Confirms the expected regional WAF is actually associated with the ALB and
  re-runs public application readiness.
- Records timestamp, AWS account, region, stack, CloudFront, listener,
  security-group, WAF and readiness facts as JSON without credentials or secret
  values.

## Local evidence

- Local CloudFormation structural validation passed with 65 resources and 19
  outputs.
- Both PowerShell files parse with zero syntax errors; all 9 focused AWS
  infrastructure tests passed.
- Three verifier preflight probes passed: partial viewer input, origin TLS
  without the viewer tuple and required end-to-end TLS without both tuples all
  fail before an AWS call.
- Complete synthetic AWS response fixtures exercised both the end-to-end TLS
  path and the HTTP-only staging fallback under PowerShell strict mode; both
  produced the expected redacted attestation and control state.
- The full functional suite passed 58 files and 291 tests; the isolated
  adversarial suite passed all 32 tests.
- Frontend type checking and the production build passed. The known
  approximately 1.01 MB minified bundle warning remains non-blocking for this
  infrastructure phase.
- The authorization inventory passed with 129 declared route policies, and
  `git diff --check` passed.
- `npm audit --json` reported 0 known vulnerabilities across 411 dependencies.
- Live attestation is blocked because AWS CLI reports `NoCredentials` on this
  workstation.

## Required deployment evidence

1. Authenticate to the intended AWS account with a read role covering
   CloudFormation, CloudFront, ELBv2, EC2 security groups and regional WAF.
2. Run the staging deployment with both TLS tuples and retain the automatically
   generated attestation outside the repository.
3. Independently review the artifact's account ID, region, stack name and
   resource identifiers before approving it as evidence.
4. Correlate the artifact timestamp with CloudFormation events, ECR scan result,
   GuardDuty malware-plan evidence, DNS/certificate probes and the release
   commit/image digest.
5. Re-run the verifier after any manual AWS change; drift or a failed assertion
   invalidates the previous release evidence.

## AWS design references

- CloudFront `get-distribution` command:
  <https://docs.aws.amazon.com/cli/latest/reference/cloudfront/get-distribution.html>
- ELBv2 listener inspection:
  <https://docs.aws.amazon.com/cli/latest/reference/elbv2/describe-listeners.html>
- EC2 security-group inspection:
  <https://docs.aws.amazon.com/cli/latest/reference/ec2/describe-security-groups.html>
- Regional WAF association lookup:
  <https://docs.aws.amazon.com/cli/latest/reference/wafv2/get-web-acl-for-resource.html>

Production remains blocked on authenticated live evidence, backup restore,
failover/load/privacy/payment drills and completion of the relational
multi-writer cutover.
