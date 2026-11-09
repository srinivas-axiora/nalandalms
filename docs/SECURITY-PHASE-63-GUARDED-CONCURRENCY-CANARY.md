# Security remediation Phase 63: guarded multi-task canary

Captured: 2026-11-09 (Asia/Calcutta)
Branch: `security-phase-0-baseline`

## Outcome

The direct two-task concurrency canary now refuses to launch unless the
operator explicitly confirms the drill and the AWS account, non-production
stack name, full source revision, task-definition `SOURCE_REVISION` and
digest-pinned container all agree.

`deploy-staging.ps1` passes those bindings automatically from its already
guarded deployment context. Multi-task evidence now includes the AWS account
and immutable image, so the Phase-62 release evaluator no longer grants that
artifact an account exception.

## Direct command contract

```powershell
.\infra\aws\verify-multi-task.ps1 `
  -Region ap-south-1 `
  -StackName nalanda-staging `
  -ExpectedAccountId <12-digit-staging-account-id> `
  -ExpectedSourceRevision <40-character-git-revision> `
  -ConfirmMultiTaskCanary
```

Focused deployment, evidence and concurrency validation passed 33 tests across
four files. Live AWS execution remains unavailable without credentials, and no
production GO decision exists.

Current decision: **NO-GO for production**.
