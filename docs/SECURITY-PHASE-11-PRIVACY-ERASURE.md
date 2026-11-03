# Phase 11 — durable privacy erasure workflow

Date: 2026-11-03
Status: **implemented, feature-gated, live PostgreSQL evidence pending**
Production decision: **NO-GO remains unchanged**

## Outcome

Data-export, erasure intake, review, legal hold, grace period, object deletion,
retry and completion evidence can use normalized PostgreSQL records behind
`USE_PG_PRIVACY=1`. Actual erasure execution has a second kill switch,
`ENABLE_PRIVACY_ERASURE_WORKER=1`. Both remain off in AWS staging until the
coverage and live gates below pass.

Migration `0010_privacy_erasure_workflow.sql` replaces the process-local Map
with a restart-safe state machine. A partial unique index allows one active
request per subject. Review is an explicit administrator and step-up action.
Workers claim approved, due work with `FOR UPDATE SKIP LOCKED`, persist every
object task before deletion, and do not pseudonymize database records until all
object deletions have succeeded.

## Controls implemented

- Personal-data export requires recent step-up authentication, uses explicit
  allowlists and returns a private, non-cacheable response.
- Request intake rechecks the confirmation email against a locked identity row,
  requires a recent step-up session, and stores a reason digest.
- Repeated intake is idempotent and returns the existing active request.
- Cancellation also requires step-up and is disallowed once processing starts.
- Approval or legal hold requires an administrator, step-up and a durable reason.
- A 30-day database-clock grace period is mandatory. Approval does not bypass it.
- Certificate issuers cannot be erased until their credential evidence is
  reassigned. The check is repeated during finalization to close the race.
- Object keys from assessment video, proctor captures and generated reports are
  queued durably. Failed deletion keeps the key and schedules a retry.
- Successful deletion clears the plaintext object key while retaining only its
  SHA-256 digest as completion evidence.
- Finalization removes answer/proctor/capture/feedback/rating/report records,
  minimizes retained attempt state, deletes recipient certificates,
  pseudonymizes candidate records and disables the identity.
- Password material, preferences, manager link and last-login state are cleared;
  the session version is incremented so every existing JWT is invalidated.
- Completion clears the free-text reason and stores only non-PII policy, count
  and pseudonym evidence.
- Export queries use explicit allowlists and do not expose password hashes,
  bearer hashes, object keys or answer-bearing question maps.
- Readiness fails unless the workflow tables/invariants, worker, coverage
  acknowledgement and all dependent relational feature flags are enabled.
- Production execution requires a dedicated 32+ character pseudonym secret;
  CloudFormation provisions it through Secrets Manager.

## Local evidence

| Gate | Result |
|---|---|
| Functional suite | **PASS** — 24 files, 161 tests |
| Adversarial security suite | **PASS** — 30 tests |
| Privacy/compliance focus | **PASS** — 3 files, 15 tests |
| Frontend typecheck | **PASS** |
| Production frontend build | **PASS** — existing 1.01 MB chunk warning remains |
| Authorization inventory | **PASS** |
| JavaScript syntax / `git diff --check` | **PASS** |
| CloudFormation local YAML parse | **PASS** — 38 resources; privacy secret present |
| Live PostgreSQL verifier | **BLOCKED** — no `DATABASE_URL` or `PGHOST` |
| CloudFormation service validation | **BLOCKED** — no AWS credentials |
| Container verification | **BLOCKED** — local WSL/Docker access denied |
| Fresh dependency advisory query | **BLOCKED** — npm registry DNS unavailable |

The last successful dependency audit reported zero advisories and neither
`package.json` dependencies nor `package-lock.json` changed in Phase 11. That
is useful continuity evidence, but it is not a substitute for a fresh CI audit.
The live verifier fails closed when PostgreSQL connection information is absent.

## Required staging gate

Take an RDS snapshot and verify the object bucket versioning/retention policy.
Keep both privacy flags off while running:

```powershell
npm run db:migrate
npm run db:backfill
npm run db:verify-privacy
```

Reconcile before enabling intake:

```sql
SELECT status, count(*)
FROM privacy_requests
GROUP BY status
ORDER BY status;

SELECT user_id, count(*)
FROM privacy_requests
WHERE status IN ('PendingReview', 'Approved', 'Processing', 'Blocked', 'Failed')
GROUP BY user_id
HAVING count(*) > 1;

SELECT count(*) AS invalid_completed_requests
FROM privacy_requests
WHERE status = 'Completed'
  AND (completed_at IS NULL OR completion_evidence = '{}'::jsonb
       OR reason <> '[erased after completion]');

SELECT count(*) AS leaked_deleted_object_keys
FROM privacy_erasure_objects
WHERE status = 'Deleted' AND (object_key IS NOT NULL OR deleted_at IS NULL);

SELECT count(*) AS malformed_object_hashes
FROM privacy_erasure_objects
WHERE object_key_sha256 !~ '^[a-f0-9]{64}$';

SELECT count(*) AS unreviewed_executable_requests
FROM privacy_requests
WHERE status IN ('Approved', 'Processing', 'Failed', 'Completed')
  AND (reviewed_by IS NULL OR reviewed_at IS NULL OR length(trim(review_reason)) < 10);
```

Expected anomaly counts are zero. Review every backfill quarantine or skipped
legacy request explicitly.

Then set `USE_PG_PRIVACY=1` while keeping the worker off, exercise intake,
cancellation, review and hold on staging, and confirm readiness remains 503.
After the coverage audit below is signed, take a second snapshot and set:

```text
USE_PG_PRIVACY=1
ENABLE_PRIVACY_ERASURE_WORKER=1
PRIVACY_COVERAGE_ACK=normalized-v1
```

Prove across at least two ECS tasks:

1. duplicate intake creates one active request;
2. cancellation and review are immediately visible across tasks;
3. two workers race one due request and exactly one claims it;
4. injected S3 failure retains the key, emits a redacted error and retries;
5. a successful retry clears every object key before database finalization;
6. task replacement preserves request, work and completion state;
7. old JWTs fail immediately after completion;
8. export, application search and direct SQL cannot recover the original email,
   name, response content or object key;
9. RDS restore and S3 version recovery follow the documented privacy/backup
   policy rather than silently resurrecting data;
10. PostgreSQL or S3 loss makes readiness fail without process-local fallback.

## Coverage sign-off required before worker enablement

The `normalized-v1` acknowledgement is operational approval, not a substitute
for evidence. Data owners must map and test every production store, including
RDS tables, S3 versions, CloudWatch logs, Redis keys, RDS snapshots, exports,
email/payment providers, AI processors and disaster-recovery copies. Legal
holds and statutory payment/audit retention must be documented per jurisdiction.

Keep the worker off if any store is absent from that register. Rollback is
flag-only; preserve workflow evidence and never use a destructive down migration.

## Remaining architecture risk

- The current relational model retains the original technical user primary key
  in attempts, payment and audit records. Name/email are pseudonymized and
  response content is minimized, but completion is not anonymous deletion.
  Production approval requires a documented retention basis and, longer term,
  opaque subject identifiers designed for key rotation or detachment.
- The synchronous JSON export does not package S3 media, backup copies or data
  held by external processors. Those stores require an asynchronous,
  access-controlled data-subject bundle and provider-specific fulfillment.
- Attendance and performance-review data still originate from process-local
  projections. The readiness prerequisites intentionally prevent privacy
  execution until all source-of-truth cutovers are reconciled.
- Backup/S3-version expiration is infrastructure policy and cannot be proven by
  application unit tests. It requires an AWS restore/erasure drill.
- Course ownership and issuer reassignment need an administrator workflow for
  staff subjects; the executor fails closed instead of corrupting signed records.
- Completion evidence supports auditability but is not a legal determination
  that erasure is required or that no retention exemption applies.
