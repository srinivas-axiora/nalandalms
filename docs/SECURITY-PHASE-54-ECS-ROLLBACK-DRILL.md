# Security remediation Phase 54: ECS rollback rehearsal

Captured: 2026-11-09 (Asia/Calcutta)
Branch: `security-phase-0-baseline`

## Outcome

Nalanda now has an operator-run staging rehearsal for returning the ECS service
to an explicitly approved prior task definition and then restoring the
CloudFormation stack's current task definition. The script verifies the actual
running task ARNs and application readiness at both stages and records evidence
whether the rehearsal passes or fails.

This is tooling, not live rollback evidence. The workstation has no configured
AWS identity, and no ECS service was changed. Production remains **NO-GO** until
the rehearsal runs in the intended account and the resulting evidence and
CloudTrail/ECS events are reviewed.

## Fail-closed preconditions

Before changing the service, `verify-ecs-rollback.ps1` requires:

- a full, revision-qualified task-definition ARN in the same account and region;
- an older revision in the current task family, not an inferred `latest` target;
- the expected 40-character Git revision and exact ECR digest URI;
- an active Fargate-compatible configuration equivalent to the current task
  definition except for the image and source-revision label;
- complete ECR scans with zero Critical or High findings for both images;
- a stable service on the stack-owned definition with the rolling ECS
  controller and circuit-breaker rollback enabled;
- green `/api/ready` and `/api/health` responses.

Configuration equivalence protects roles, secrets, environment flags, health
checks, logging, ports, runtime architecture, resources and storage settings.
This prevents a rollback rehearsal from silently reintroducing an older unsafe
configuration merely because its application image can start.

## Rehearsal behavior

The script performs these transitions:

```text
stack-owned current task
        -> approved prior task
        -> readiness observation
        -> stack-owned current task
```

The restoration runs from a `finally` block even when rollback deployment or
readiness fails. A failed current-release restoration is reported as a critical
error requiring immediate operator intervention. The JSON artifact always says
`passed` or `failed`; a failure artifact cannot be mistaken for release proof.

## Runbook

Identify the previous approved task definition and recover its immutable image
digest and Git revision from the prior controlled release record. Then run:

```powershell
.\infra\aws\verify-ecs-rollback.ps1 `
  -Region ap-south-1 `
  -StackName nalanda-staging `
  -RollbackTaskDefinitionArn <full-task-definition-arn-with-revision> `
  -ExpectedRollbackSourceRevision <40-character-git-revision> `
  -ExpectedRollbackContainerImage <account>.dkr.ecr.ap-south-1.amazonaws.com/nalanda@sha256:<digest> `
  -ObservationSeconds 60
```

Run only in an approved staging window. The current single-task deployment uses
`MinimumHealthyPercent: 0`, so a task-definition transition can cause a brief
staging interruption. Do not use this staging topology as evidence of
production zero-downtime behavior.

Preserve the generated `artifacts/aws/*-ecs-rollback.json`, ECS deployment
events, CloudTrail `UpdateService` calls, target-health history, application
logs and ECR scan evidence in the release record.

## Acceptance criteria

1. Both task definitions are active, digest-pinned, revision-labelled,
   configuration-equivalent and scan-clean.
2. The service reaches a completed deployment on the prior definition.
3. Every running task uses that exact prior definition and readiness remains
   green throughout the observation window.
4. The service returns to the stack-owned definition from the `finally` path.
5. Every final running task uses the stack definition and readiness is green.
6. The JSON artifact reports `passed`, the expected task/revision/image values,
   running task ARNs, observation count and completed restoration.
7. A subsequent `verify-staging.ps1` attestation reports no CloudFormation
   service drift and all standard release controls remain green.

## Local release-gate evidence

| Gate | Result |
|---|---|
| Focused rollback/infrastructure suite | 2 files; 16 tests passed |
| `npm test` | 92 files; 422 tests passed |
| `npm run test:security` | 1 file; 32 tests passed |
| JavaScript syntax scan | 335 files; 0 failures |
| PowerShell syntax scan | 5 scripts; 0 failures |
| `npm run typecheck` | Passed |
| `npm run build` | Passed; existing ~1.01 MB chunk warning remains |
| `npm audit --json` | 0 known vulnerabilities across 411 dependencies |
| `npm run infra:validate` | 77 resources; 27 outputs |
| `npm run routes:inventory` | 129 routes |

Static tests prove the fail-closed orchestration contract; they cannot prove an
ECS transition. Only a successful staging artifact, running-task evidence and
the subsequent standard attestation satisfy the live rollback gate.

## Remaining production gates

- Execute this rehearsal and rerun the complete staging attestation in AWS.
- Exercise Multi-AZ database failover on a production-like topology.
- Prove Redis interruption behavior and sustained multi-task load/soak targets.
- Complete privacy-erasure retry, payment reconciliation and media-retention
  failure/retry exercises before enabling relational runtime flags.

## AWS references

- [Updating an Amazon ECS service](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/update-service-parameters.html)
- [ECS deployment failure detection and rollback](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/deployment-failure-detection.html)

Current decision: **NO-GO for production**.
