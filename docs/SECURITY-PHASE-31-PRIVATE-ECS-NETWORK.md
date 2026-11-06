# Phase 31 — private ECS application network

Date: 2026-11-06
Status: **implemented locally; live VPC/ECS path proof pending**
Production decision: **NO-GO remains unchanged**

## Outcome

Nalanda's ECS service and all one-off schema/backfill/verifier tasks no longer
use public subnets or public IP addresses. Two dedicated private application
subnets now host task ENIs. Each Availability Zone has its own public NAT
gateway and private route table so outbound dependency access does not depend
on the other zone.

The internet-facing ALB remains in the two public subnets. Its security group is
still the only inbound source for application port 8080, while data subnets stay
isolated without a default internet route.

## Controls implemented

- Adds private application subnets in both configured Availability Zones with
  `MapPublicIpOnLaunch: false`.
- Adds one elastic IP and public NAT gateway per Availability Zone.
- Adds separate application route tables with an active `0.0.0.0/0` route to
  the same-zone NAT gateway.
- Moves the ECS service to the application subnets and sets
  `AssignPublicIp: DISABLED`.
- Moves deployment one-off tasks to the same private subnets and explicitly sets
  `assignPublicIp=DISABLED`.
- Exposes application subnet, route-table and NAT identifiers as stack outputs
  for evidence rather than inferring placement from the template.
- Extends the deployed verifier to require the expected private subnet and
  application security-group sets, disabled public IP assignment, two private
  subnets without automatic public addressing, two available NAT gateways in
  the public subnets, and one active NAT default route per route table.
- Records the verified network placement and egress resources in the redacted
  deployment attestation.

## Local evidence

- Local CloudFormation structural validation passed with 77 resources and 23
  outputs.
- Both PowerShell scripts parse with zero syntax errors; all 11 focused AWS
  infrastructure tests passed.
- A complete synthetic ECS/VPC control-plane fixture passed with reversed
  service-subnet ordering, proving set-based comparison of the private network,
  available NAT gateways and active default routes.
- A negative fixture with `assignPublicIp=ENABLED` was rejected.
- A second negative fixture that crossed each private subnet to the other
  Availability Zone's NAT gateway was rejected.
- The full functional suite passed 58 files and 293 tests; the isolated
  adversarial suite passed all 32 tests.
- Frontend type checking and the production build passed. The known
  approximately 1.01 MB minified bundle warning remains non-blocking for this
  infrastructure phase.
- The authorization inventory passed with 129 route policies, both PowerShell
  scripts parsed cleanly, and `git diff --check` passed.
- `npm audit --json` reported 0 known vulnerabilities across 411 dependencies.
- Live routing, NAT availability and task ENI proof is blocked because AWS
  credentials are not configured on this workstation.

## Required deployment evidence

1. Deploy into the intended staging VPC and retain CloudFormation subnet,
   route, EIP and NAT events.
2. Confirm both NAT gateways reach `available` and each resides in the public
   subnet from the corresponding Availability Zone.
3. Confirm the ECS service and a one-off verifier task receive only private IPs
   in the application subnets and have no public address.
4. Exercise ECR pulls, Secrets Manager, CloudWatch logs, S3, Razorpay test-mode
   and approved AI-provider egress from both zones.
5. Fail one task/AZ path and prove replacement and outbound dependency access
   continue through the other zone without opening public task exposure.
6. Review NAT hourly/data-processing cost and flow/log telemetry before keeping
   this production-shaped topology continuously active.

## AWS design references

- ECS exposure remediation with private subnets and disabled public IPs:
  <https://docs.aws.amazon.com/securityhub/latest/userguide/exposure-ecs-service.html>
- Fargate private-subnet networking requirements:
  <https://docs.aws.amazon.com/AmazonECS/latest/developerguide/fargate-task-networking.html>
- Resilient private subnets with NAT gateways in both zones:
  <https://docs.aws.amazon.com/vpc/latest/userguide/vpc-example-private-subnets-nat.html>
- CloudFormation NAT gateway configuration:
  <https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-ec2-natgateway.html>

Production remains blocked on live AWS evidence, restore/failover/load/privacy/
payment drills and completion of the relational multi-writer cutover.
