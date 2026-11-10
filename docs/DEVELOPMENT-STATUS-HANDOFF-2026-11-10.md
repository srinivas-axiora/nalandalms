# Nalanda development and production-readiness handoff

Status date: 2026-11-10 (Asia/Calcutta)
Branch: `security-phase-0-baseline`
Decision: **ACTIVE DEVELOPMENT — NO-GO for production**

## Executive status

Nalanda has progressed from a locally functional but critically exposed React
and Express application into a substantially hardened, production-shaped
system. The source tree now contains normalized PostgreSQL authority paths,
transactional audit coupling, distributed controls, operational workers,
release evidence gates, AWS staging infrastructure and regression coverage for
the original confirmed security failures.

Local evidence is strong, but local evidence is not a production deployment.
The application must remain **NO-GO** until all migrations are exercised on the
intended staging dataset and the live AWS deployment, failover, recovery,
payment, privacy and concurrency attestations pass.

## What has been developed

### Application security and identity

- Public registration can no longer self-assign a privileged role.
- Authentication uses hardened cookies, CSRF/origin checks, security headers,
  rate controls, session revocation/versioning and step-up authentication for
  high-impact administration.
- Login lockout is account-safe and resists denial-of-service abuse.
- Password recovery is account-neutral and uses an encrypted SQS/SES delivery
  path with redrive, DLQ monitoring and production readiness checks.
- Password hashes and credential derivatives are redacted from audit/archive
  paths; production browser state is no longer broadly persisted.
- Resource-level authorization was added across assessments, candidates,
  proctoring, certificates, settings, archives, workplace and course flows.

### Learning, assessment and commerce integrity

- Exam deadlines, attempt state transitions, grading boundaries and candidate
  links are server-authoritative.
- Answer keys and candidate analytics use scoped DTOs and authorization.
- Payment orders are server-priced, signed, user/course/amount bound,
  idempotent and transactionally settled.
- Free and paid enrollment require durable prerequisite completion evidence.
- Checkout orders immutably bind course version, prerequisite snapshot and
  eligibility time; unbound legacy open orders are expired.
- Course prerequisite authoring rejects missing references, duplicates and
  direct/transitive cycles. PostgreSQL serializes graph mutations and prevents
  disabling or deleting a live prerequisite.
- Certificate issuance, signing, eligibility, revocation and verification have
  relational authority and protected administrative workflows.

### Data architecture and operations

- Feature-gated normalized PostgreSQL repositories now cover the major bounded
  contexts, including identity, courses, learning, assessments, attempts,
  payments, certificates, candidates, privacy, reports, settings, audit,
  archives, workplace and skills.
- Mutations use transactions, optimistic/row locking, idempotency keys and
  atomic audit evidence where required.
- Redis-backed distributed request budgets and recovery verification exist.
- Durable privacy erasure, retention cleanup, report export and password-reset
  workers include retries, failure evidence and readiness integration.
- Backup/restore, guarded restore, ECS rollback, Redis failover, RDS failover,
  multi-task concurrency and HTTP soak verification artifacts are present.

### Upload, browser and supply-chain hardening

- Upload grants are scoped, short-lived and content validated; unsafe direct
  publication paths are blocked. Private object storage and malware quarantine
  infrastructure are represented in staging.
- Dependency vulnerabilities are currently zero in the last completed audit
  across 414 packages.
- CI/release checks cover functional and adversarial tests, type checking,
  production builds, infrastructure structure, route authorization inventory,
  dependency audit, source tracking and release-evidence coherence.

### AWS staging architecture

- CloudFormation currently validates locally with **81 resources and 33
  outputs**.
- The design includes CloudFront, WAF, restricted ALB ingress, private ECS
  tasks, encrypted RDS/Redis/S3/SQS, Secrets Manager, CloudWatch logs/alarms,
  SNS routing, backup controls, optional ACM/Route 53, image digest pinning and
  post-deployment attestation.
- Deployment and verification scripts are available under `infra/aws/`.

### Most recently completed and committed phases

- `6309d29` — Phase 70: snapshot/relational course-duplication authorization parity.
- `650e855` — Phase 69: route-level frontend delivery and enforced chunk budget.
- `bb7c9eb` — Phase 68: course prerequisite graph integrity.
- `819cd5b` — Phase 67: server-authoritative enrollment prerequisites.
- `2ce36c1` — Phase 66: skill governance integrity.
- `6656b23` — Phase 65: durable password recovery.
- `d0d1f3f` — Phase 64: login abuse resilience.
- `4aabbe5`, `9b4223b`, `ae643a1` — concurrency and release/deployment evidence
  controls.

## Work completed after the pause

Phase 69 is committed and locally validated.

- All top-level pages and public/runtime surfaces now use route-level dynamic
  imports behind a shared React Suspense boundary.
- The former **1,007.43 kB** entry bundle is now **356.68 kB**.
- The build emits **23 JavaScript chunks**; the largest is **348.32 KiB** by
  filesystem size.
- `scripts/verify-frontend-bundles.mjs` makes a 500 KiB per-chunk limit a
  fail-closed part of `npm run build`.
- The build completes without chunk-size or ineffective-import warnings.

Phase 70 is also committed. Snapshot and relational course-duplication routes
now both require source-course ownership for Managers, with an authenticated
cross-owner denial regression test.

## Latest verified local evidence

| Gate | Result |
|---|---|
| Functional suite | 111 files, 518 tests passed |
| Isolated adversarial suite | 33 tests passed |
| TypeScript | Passed |
| Production frontend build | Passed; 23 chunks, largest 348.32 KiB |
| Dependency audit | 0 vulnerabilities across 414 dependencies |
| CloudFormation structure | 81 resources, 33 outputs |
| Authorization inventory | 129 route policies |
| JavaScript syntax | 369 files passed |
| PowerShell syntax | 9 files passed |
| OpenAPI YAML | Parsed successfully |
| Patch hygiene | `git diff --check` passed |

## What is yet to be developed or proven

### Immediate source-control work

1. Continue decomposing the broad `/api/app-data` response into bounded,
   role-scoped projections to reduce data exposure, payload size and coupling.
2. Continue reviewing remaining compatibility/snapshot paths so no weaker
   fallback can be enabled in production.
3. Add live PostgreSQL execution evidence for migrations `0023` and `0024`,
   including concurrent prerequisite graph mutation coverage.

### Mandatory staging proof

1. Authenticate to the intended AWS staging account and record account, region,
   source revision and immutable image digest.
2. Build and scan the container, push it to ECR, validate CloudFormation through
   the AWS service and deploy the staging stack.
3. Run migrations `0001` through `0024` against a copy of intended data. Resolve
   every reconciliation failure explicitly; do not weaken constraints to make
   migration pass.
4. Enable normalized authority flags only after each live database verifier and
   readiness dependency is green.
5. Execute multi-task concurrency, payment replay/reconciliation, privacy
   erasure, retention retry, report export and password-reset delivery drills.
6. Execute backup/restore, guarded restore, ECS rollback, Redis failover, RDS
   failover and HTTP load/soak gates with timestamped artifacts.
7. Verify WAF/CloudFront/ALB behavior, TLS, DNS, private S3 delivery, malware
   quarantine, alarms, log retention and least-privilege IAM in the deployed
   account.
8. Exercise real sandbox integrations for Razorpay, SES/SQS and Gemini under
   approved data-handling terms.

### Production release work

1. Review and approve every generated staging evidence artifact.
2. Rotate production JWT, payment, certificate and integration secrets; keep
   them only in managed secret stores.
3. Reconcile records created under vulnerable historical builds.
4. Complete tenant/organization boundary decisions, operational ownership,
   incident response, on-call routing, backup retention and legal/privacy
   approvals.
5. Obtain an explicit go decision only after all Critical/High risks are fixed
   or formally accepted and every release gate is current for the exact image
   digest being promoted.

## Current development focus

Phase 69 and Phase 70 are complete. The next source-level focus is decomposing
`/api/app-data` into bounded role-scoped projections while preserving existing
client behavior. Live AWS staging remains the decisive production gate once
the remaining local compatibility boundaries are closed.
