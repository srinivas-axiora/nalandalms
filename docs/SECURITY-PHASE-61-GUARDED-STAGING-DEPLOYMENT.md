# Security remediation Phase 61: guarded AWS staging deployment

Captured: 2026-11-09 (Asia/Calcutta)
Branch: `security-phase-0-baseline`

## Outcome

The primary AWS deployment entry point now refuses to build, push or deploy
unless all of these preconditions are true:

- `-ConfirmStagingDeployment` is explicitly supplied;
- the stack name clearly identifies staging, test, development or nonproduction
  and does not identify production; and
- the authenticated 12-digit AWS account matches `-ExpectedAccountId`.

These checks run before the container build, ECR push and CloudFormation
mutation. Existing clean-worktree, image scanning, digest pinning, relational
verification, normalized promotion, soak and attestation gates remain intact.

## Command contract

Every deployment now starts with:

```powershell
.\infra\aws\deploy-staging.ps1 `
  -Region ap-south-1 `
  -StackName nalanda-staging `
  -ExpectedAccountId <12-digit-staging-account-id> `
  -ConfirmStagingDeployment `
  <existing deployment and secret parameters>
```

This script remains deliberately staging-only. A future production deployment
must use a separately reviewed entry point with production account, approval,
change-window and rollback controls; weakening this name guard is not an
acceptable shortcut.

No AWS mutation was performed locally because credentials are unavailable.
Production remains **NO-GO**.
