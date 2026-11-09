# Security remediation Phase 60: guarded backup/restore execution

Captured: 2026-11-09 (Asia/Calcutta)
Branch: `security-phase-0-baseline`

## Outcome

The AWS backup/restore rehearsal now fails before any source marker, snapshot
or restored database is created unless the operator supplies:

- an explicit `-ConfirmRestoreDrill` acknowledgement;
- the expected 12-digit AWS account;
- the exact 40-character staged source revision; and
- a stack name that is unambiguously non-production.

The script also requires the stack task definition to use a digest-pinned
Nalanda image whose `SOURCE_REVISION` matches the requested revision. Successful
evidence now records the account and immutable container image alongside the
task definition and source revision.

Cleanup remains limited to generated names with the run's
`NalandaRestoreRun` tag. This is locally validated orchestration only; no AWS
restore has run because the workstation has no AWS credentials.

## Command

```powershell
.\infra\aws\verify-backup-restore.ps1 `
  -Region ap-south-1 `
  -StackName nalanda-staging `
  -ExpectedAccountId <12-digit-staging-account-id> `
  -ExpectedSourceRevision <40-character-git-revision> `
  -ConfirmRestoreDrill `
  -MaxRestoreMinutes 45
```

## Acceptance

- Wrong account, revision, stack class, confirmation or mutable image fails
  before the source database is changed.
- The restored database remains private and encrypted and passes the deployed
  revision's schema/marker verifier.
- Source marker, restored instance and manual snapshot are removed before a
  pass artifact is written.
- AWS execution evidence is still required before production approval.

## Local evidence

- Focused restore/infrastructure suite: 2 files, 16 tests passed.
- Complete standard suite: 100 files, 464 tests passed.
- PowerShell syntax: all 9 scripts passed.
- Live AWS execution: blocked locally because credentials are unavailable.

Current decision: **NO-GO for production**.
