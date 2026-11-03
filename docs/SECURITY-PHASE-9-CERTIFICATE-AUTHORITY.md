# Phase 9 — transactional certificate authority

Date: 2026-11-03  
Status: **implemented, feature-gated, live PostgreSQL evidence pending**  
Production decision: **NO-GO remains unchanged**

## Outcome

Certificate eligibility, issuance, enrollment certification, public
verification and revocation can now use normalized PostgreSQL records behind
`USE_PG_CERTIFICATES=1`. The flag is off by default and explicitly remains `0`
in AWS staging until every live gate below passes.

Migration `0008_certificate_authority.sql` creates the durable evidence and
revocation contract. A partial unique index permits at most one active
credential for a learner/course pair. Issuance takes a transaction-scoped
advisory lock and commits the credential, enrollment transition and audit row
together. Revocation locks the credential and atomically records actor, time and
reason while rolling the enrollment back to `Passed`.

## Controls implemented

- Public issuance requires authentication, the configured approval role,
  course authority, a current step-up session and verified enrollment/attempt
  evidence. Eligibility is rechecked inside the write transaction.
- Automatic issuance requires a passed assessment attempt; a caller cannot
  supply the signed score, trust result or attempt identity.
- Certificate IDs contain 128 random bits instead of a short predictable
  suffix.
- Signature format v2 uses an unambiguous JSON encoding and binds identity,
  course, attempt, displayed credential text, issuer, timestamp, proctor result
  and score. Changes to any bound evidence fail verification.
- Legacy v1 signatures remain explicitly versioned and verifiable for
  migration; all newly issued credentials use v2.
- Existing backfill rows with malformed signatures, unresolved principals or
  inconsistent revocation state are quarantined rather than admitted.
- The live verifier checks every migrated signature against the configured key
  before exercising synthetic issuance, idempotency, verification, revocation,
  enrollment rollback and transactional audit evidence.
- Public verification returns `verified: true` only when both the signature is
  valid and the durable credential status is `Active`.
- Revocation requires course authority, step-up authentication and a durable
  reason of at least ten characters.
- `/api/ready` fails when certificate mode is enabled without the table,
  evidence/revocation/signature-version columns, active-row uniqueness or a
  complete signature backfill.

## Local evidence

| Gate | Result |
|---|---|
| Functional suite | 20 files; 144 tests passed |
| Adversarial security suite | 30 tests passed |
| Certificate repository/API/signature focus | 15 tests passed |
| Frontend type check | Passed |
| Production frontend build | Passed; existing 1.01 MB chunk warning remains |
| Dependency audit | 0 known vulnerabilities across 393 dependencies |
| Authorization inventory generation | Passed |
| JavaScript syntax checks | Passed |
| `git diff --check` | Passed |
| Live PostgreSQL certificate verifier | Blocked locally: `DATABASE_URL`/`PGHOST` is not configured |

## Required staging cutover gate

Take an RDS snapshot first and use the exact certificate signing secret that
created the legacy records.

```powershell
npm run db:migrate
npm run db:backfill
npm run db:verify-certificates
```

Reconcile the source snapshot and normalized authority before enabling the
flag:

```sql
SELECT status, signature_version, count(*)
FROM issued_certificates
GROUP BY status, signature_version
ORDER BY status, signature_version;

SELECT count(*) AS missing_or_malformed_signatures
FROM issued_certificates
WHERE signature IS NULL OR signature !~ '^[a-f0-9]{64}$';

SELECT employee_id, course_id, count(*)
FROM issued_certificates
WHERE status = 'Active'
GROUP BY employee_id, course_id
HAVING count(*) > 1;

SELECT count(*) AS inconsistent_revocations
FROM issued_certificates
WHERE (status = 'Active' AND (revoked_by IS NOT NULL OR revoked_at IS NOT NULL OR revocation_reason IS NOT NULL))
   OR (status = 'Revoked' AND (revoked_by IS NULL OR revoked_at IS NULL OR length(trim(revocation_reason)) < 10));

SELECT count(*) AS orphaned_evidence
FROM issued_certificates c
LEFT JOIN users recipient ON recipient.id = c.employee_id
LEFT JOIN users issuer ON issuer.id = c.issued_by
LEFT JOIN courses course ON course.id = c.course_id
LEFT JOIN assessment_attempts attempt ON attempt.id = c.attempt_id
WHERE recipient.id IS NULL OR issuer.id IS NULL OR course.id IS NULL
   OR (c.attempt_id IS NOT NULL AND attempt.id IS NULL);

SELECT count(*) AS invalid_certified_enrollments
FROM enrollments e
LEFT JOIN issued_certificates c ON c.id = e.certificate_id
WHERE e.status = 'Certified'
  AND (e.certificate_id IS NULL OR c.id IS NULL OR c.status <> 'Active');

SELECT count(*) AS unbound_active_certificates
FROM issued_certificates c
LEFT JOIN enrollments e
  ON e.user_id = c.employee_id AND e.course_id = c.course_id
WHERE c.status = 'Active'
  AND (e.certificate_id IS DISTINCT FROM c.id OR e.status <> 'Certified');
```

Expected results: the live verifier passes every check, quarantine counts are
reviewed explicitly, and every anomaly query returns zero. A count match alone
is insufficient because `db:verify-certificates` also proves that the deployed
signing key validates every migrated signature.

After a second snapshot, set `USE_PG_CERTIFICATES=1` in staging and verify:

1. issue on ECS task A and verify through task B;
2. race two issue requests for the same learner/course and observe one active
   row and one idempotent response;
3. revoke through task B and verify the inactive result through task A;
4. replace both tasks and confirm credential, revocation and audit evidence
   remains available;
5. alter a bound field in a disposable row and confirm signature validation
   fails, then restore from the snapshot;
6. make PostgreSQL unavailable and confirm readiness fails without falling back
   to the process-local certificate array.

Keep `USE_PG_CERTIFICATES=0` if any check fails. Rollback is flag-only; preserve
normalized rows for investigation and never use a destructive down migration.

## Remaining architecture risk

- Signing is still symmetric HMAC using an application secret. Production-grade
  independent verification, rotation and compromise containment require a
  versioned asymmetric key in AWS KMS/HSM plus a published verification-key and
  revocation policy.
- Passing an authenticated PostgreSQL assessment currently creates the durable
  eligibility evidence, but reliable automatic issuance still needs an outbox
  or queue worker. Until that exists, `/api/certificates/auto-issue` is an
  idempotent retry boundary rather than an exactly-once post-exam workflow.
- Courses/users/assessments are not yet application-wide relational sources of
  truth, so all related feature flags must be reconciled and cross-task tested
  as one cutover set.
- Public candidate assessments, privacy workflows, archives and several admin
  contexts remain process-local. Multi-task production is not approved.
