# Phase 30 — immutable image and source provenance

Date: 2026-11-06
Status: **implemented locally; live ECR/ECS evidence pending**
Production decision: **NO-GO remains unchanged**

## Outcome

The staging release path now binds source, scan result, task definition and
running ECS service to one immutable image manifest. Deployment refuses a dirty
Git worktree, records the full commit, scans the pushed tag, resolves its
`sha256` manifest digest and deploys the digest URI rather than the tag.

This phase also corrects an ECR scan-field typo. The previous deployment script
read `findingsSeverityCounts`; AWS returns `findingSeverityCounts`. Because the
script did not use PowerShell strict mode, the missing property could become
null and make critical/high counts appear to be zero. The gate now reads the
documented field, and both tests and the deployed verifier pin that spelling.

## Controls implemented

- Rejects uncommitted tracked or untracked work before any AWS build/deploy
  activity and validates the image tag format.
- Requires a full 40-character source revision in CloudFormation and attaches
  it to the container as `org.opencontainers.image.revision`.
- Restricts `ContainerImage` to a digest URI ending in
  `@sha256:<64 lowercase hexadecimal characters>`.
- Resolves the digest only after ECR scan completion and deploys that exact
  manifest.
- The AWS attestation verifies the expected registry belongs to the authenticated
  account and region, the stack output and Docker label match the expected Git
  revision, and the task definition image equals the expected digest URI.
- Verifies the ECS service is active, points to that task definition, has a
  completed primary rollout and is stable at the intentional 1/1 single-writer
  task count.
- Re-reads scan findings by image digest and rejects any critical or high
  finding. The attestation records revision, task definition, digest, scan
  state/counts and service convergence.

## Local evidence

- Local CloudFormation structural validation passed with 65 resources and 20
  outputs.
- Both PowerShell scripts parse with zero syntax errors; all 10 focused AWS
  infrastructure tests passed.
- A complete synthetic control-plane execution proved the matching commit,
  digest, task definition, completed ECS deployment and zero critical/high scan
  path under PowerShell strict mode.
- A negative scan fixture with one high finding was rejected.
- The full functional suite passed 58 files and 292 tests; the isolated
  adversarial suite passed all 32 tests.
- Frontend type checking and the production build passed. The known
  approximately 1.01 MB minified bundle warning remains non-blocking for this
  infrastructure phase.
- The authorization inventory passed with 129 declared route policies, both
  PowerShell scripts parsed cleanly, and `git diff --check` passed.
- `npm audit --json` reported 0 known vulnerabilities across 411 dependencies.
- Live ECR digest, scan and ECS service proof is blocked because AWS credentials
  and a working local Docker backend are unavailable on this workstation.

## Required deployment evidence

1. Authenticate to the intended AWS account and restore a working Linux ARM64
   Docker builder.
2. Run deployment from the exact clean release commit; retain the pushed tag,
   resolved digest and ECR scan timestamps.
3. Confirm the attestation's account/region, source revision, digest URI, task
   definition, service rollout and finding counts.
4. Confirm the running task image digest through ECS task/container evidence and
   correlate it to the ECR manifest and release commit.
5. Store the attestation and ECR scan result in the controlled release record;
   any rebuild, rescan, task revision or source change requires new evidence.

## AWS design references

- ECR scan findings by image digest:
  <https://docs.aws.amazon.com/AmazonECR/latest/userguide/describe-scan-findings.html>
- ECR scan response and severity counts:
  <https://docs.aws.amazon.com/cli/latest/reference/ecr/describe-image-scan-findings.html>
- ECS service deployment and task-count evidence:
  <https://docs.aws.amazon.com/cli/latest/reference/ecs/describe-services.html>
- ECS task-definition Docker labels:
  <https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-properties-ecs-taskdefinition-containerdefinition.html>

Production remains blocked on live AWS evidence, restore/failover/load/privacy/
payment drills and completion of the relational multi-writer cutover.
