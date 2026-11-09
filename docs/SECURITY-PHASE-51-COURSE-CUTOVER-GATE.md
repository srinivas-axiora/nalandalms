# Security remediation Phase 51: course cutover release gate

Captured: 2026-11-09 (Asia/Calcutta)
Branch: `security-phase-0-baseline`

## Outcome

The relational learning implementation now has an executable production-mode
canary gate. `USE_PG_COURSES=1` is accepted in a production process only when
`COURSE_AUTHORITY_COVERAGE_ACK=normalized-v1` is also present, and readiness
then proves the required normalized schema, indexes, reference integrity and
all dependent relational authorities.

This is a controlled path for staging evidence, **not permission to switch the
AWS service**. Phase 57 later adds a single default-off `AuthorityMode`
parameter that can atomically select normalized flags and acknowledgements only
after live evidence and a reviewed change authorize the cutover.

## Controls implemented

- The pending manual-review queue no longer evaluates a task-local course lookup
  under relational course mode. Assessment/course labels come only from the
  PostgreSQL assessment authority.
- A single version constant defines the accepted course-authority coverage
  acknowledgement. Missing, stale and future/unknown values fail production
  startup closed.
- Course readiness checks the course, chapter, enrollment, assessment, question,
  version-history, learning-time and cohort relations; key uniqueness/query
  indexes; enrollment identity/course references; and assessment/course
  references.
- Readiness exposes `coverage: normalized-v1` only when both the exact
  acknowledgement and database checks pass.
- `db:verify-course-cutover` starts an isolated production-mode API process with
  all implied relational modes and required workers, polls its private
  readiness endpoint, requires every authority check to pass, then terminates
  it cleanly.
- The AWS deployment's explicit relational verifier option runs the cutover
  canary last, after the component-level RDS verifiers.

## Local regression evidence

Focused tests cover the relational review label, version matching, production
startup rejection/acceptance, readiness response and default-off AWS template.

| Gate | Result |
|---|---|
| Focused Phase-51 regression suite | 5 files; 61 tests passed |
| `npm test` | 89 files; 409 tests passed |
| `npm run test:security` | 1 file; 32 tests passed |
| JavaScript syntax scan | 329 files; 0 failures |
| `npm run typecheck` | Passed |
| `npm run build` | Passed; existing ~1.01 MB chunk warning remains |
| `npm audit --json` | 0 known vulnerabilities across 411 dependencies |
| `npm run infra:validate` | 77 resources; 23 outputs |
| `npm run routes:inventory` | 129 routes |
| PowerShell deployment script parse | Passed |

The production-mode cutover canary itself was not run locally because this
workstation has no live PostgreSQL/Redis/S3 deployment credentials. It remains
a mandatory AWS staging evidence gate.

## Staging execution

After taking an RDS snapshot and reviewing backfill reconciliation, deploy with
the database preparation and verifier switches:

```powershell
.\infra\aws\deploy-staging.ps1 `
  -Region ap-south-1 `
  -StackName nalanda-staging `
  -PrepareRelationalDatabase `
  -RunRelationalVerifiers `
  -RunMultiTaskConcurrencyCanary
```

The last verifier is equivalent to:

```powershell
npm run db:verify-course-cutover
```

It must run in the private ECS network with the task role and deployed secrets.
Do not set the acknowledgement on the long-running ECS service during this
phase.

## Production gates still open

1. Authenticate the workstation/CI role to the intended AWS account and verify
   account, region and change set before deployment.
2. Capture successful migrations, backfill reconciliation and every relational
   verifier, including the production-mode cutover canary.
3. Prove concurrent workflows across at least two isolated tasks: enrollment,
   assessment start/submit/grade, proctor control, payment settlement,
   certificates, workplace actions and privacy erasure.
4. Exercise RDS restore/failover, Redis interruption, S3 quarantine/retention,
   worker retry and rollback to the pre-cutover task definition.
5. Review data reconciliation and security telemetry, then approve a separate
   change that enables the course flag, acknowledgement and workers together.

Current decision: **NO-GO for production**.
