# Phase 10 — transactional public candidate runtime

Date: 2026-11-03
Status: **implemented, feature-gated, live PostgreSQL evidence pending**
Production decision: **NO-GO remains unchanged**

## Outcome

Public candidate links, anonymous assessment sessions, proctor events, grading
and terminal attempt state can now use normalized PostgreSQL records behind
`USE_PG_CANDIDATE_ASSESSMENTS=1`. The flag is off by default and explicitly
remains `0` in AWS staging until every live gate below passes.

Migration `0009_candidate_assessment_runtime.sql` creates the durable runtime.
Link and attempt bearer tokens are stored only as SHA-256 hashes. Starting an
attempt serializes on the link row and relies on a case-insensitive database
unique constraint to enforce one candidate email per link. Event, deadline and
submission transitions lock the attempt and use the database clock, so two ECS
tasks cannot independently accept the same terminal mutation.

## Controls implemented

- Link and attempt tokens contain 256 random bits, are disclosed once, and are
  never recoverable from PostgreSQL, list APIs or analytics responses.
- Lost link tokens can be replaced through an owner-scoped, step-up-protected,
  audited rotation. Rotation atomically invalidates the previous bearer hash.
- Public lookup resolves only a token hash. A link ID cannot substitute for the
  public bearer token.
- Each link stores an immutable question snapshot. Public metadata never emits
  questions, and the start response removes answers and explanations.
- Public start rechecks link status and expiry while holding the link row lock.
- `CITEXT` plus `UNIQUE (link_id, candidate_email)` enforces one
  case-insensitive email identity per link under concurrency.
- Attempts use database-derived deadlines. Event and submit paths lock the row;
  late answers are rejected and the durable state becomes `Expired`.
- Proctor severity is selected server-side. Client-supplied severity is ignored,
  metadata is limited to 4 KiB, and trust/event/audit writes share a transaction.
- Client event IDs are unique per attempt. Network retries return the current
  durable result without applying a second trust penalty.
- A configured tab-switch threshold creates an authoritative terminal failure;
  it is not merely a browser-side signal.
- Grading accepts only snapshotted question IDs. Descriptive answers always
  require manual review and are never awarded automatic credit.
- Answer payloads are limited to 500 keys and 64 KiB. Terminal submission,
  evaluation evidence and audit evidence commit atomically.
- Link management and analytics require creator ownership or an administrator;
  status changes and deletion require step-up authentication.
- `/api/ready` fails when relational candidate mode is enabled without all three
  tables, bearer/email uniqueness, nonempty snapshots or the no-plaintext-token
  schema invariant.

## Local evidence

| Gate | Result |
|---|---|
| Functional suite | 22 files; 154 tests passed |
| Adversarial security suite | 30 tests passed |
| Candidate runtime/repository/API focus | 24 tests passed |
| Frontend type check | Passed |
| Production frontend build | Passed; existing 1.01 MB chunk warning remains |
| Dependency audit | 0 known vulnerabilities across 393 dependencies |
| Authorization inventory generation | Passed |
| JavaScript syntax checks | Passed |
| `git diff --check` | Passed |
| Live PostgreSQL candidate verifier | Blocked locally: `DATABASE_URL`/`PGHOST` is not configured |

The blocked live verifier is a failed deployment prerequisite, not evidence of
database correctness.

## Required staging cutover gate

Take an RDS snapshot before backfill, then run:

```powershell
npm run db:migrate
npm run db:backfill
npm run db:verify-candidate-assessments
```

Reconcile the normalized authority before enabling the flag:

```sql
SELECT count(*) AS malformed_link_tokens
FROM candidate_assessment_links
WHERE token_hash !~ '^[a-f0-9]{64}$'
   OR jsonb_array_length(question_snapshot) = 0;

SELECT count(*) AS malformed_attempt_tokens
FROM candidate_assessment_submissions
WHERE attempt_token_hash !~ '^[a-f0-9]{64}$'
   OR cardinality(question_ids) = 0;

SELECT link_id, lower(candidate_email::text), count(*)
FROM candidate_assessment_submissions
GROUP BY link_id, lower(candidate_email::text)
HAVING count(*) > 1;

SELECT count(*) AS orphaned_submissions
FROM candidate_assessment_submissions submission
LEFT JOIN candidate_assessment_links link ON link.id = submission.link_id
WHERE link.id IS NULL;

SELECT count(*) AS orphaned_proctor_events
FROM candidate_proctor_events event
LEFT JOIN candidate_assessment_submissions submission
  ON submission.id = event.submission_id
WHERE submission.id IS NULL;

SELECT submission_id, client_event_id, count(*)
FROM candidate_proctor_events
GROUP BY submission_id, client_event_id
HAVING count(*) > 1;

SELECT count(*) AS inconsistent_terminal_state
FROM candidate_assessment_submissions
WHERE (status = 'InProgress' AND submitted_at IS NOT NULL)
   OR (status <> 'InProgress' AND submitted_at IS NULL)
   OR (status = 'Passed' AND passed IS DISTINCT FROM true)
   OR (status = 'Failed' AND passed IS DISTINCT FROM false)
   OR (status IN ('InProgress', 'Expired', 'PendingManualReview') AND passed IS NOT NULL)
   OR ((status = 'Expired') <> (expired_at IS NOT NULL));
```

Every anomaly query must return zero, and any backfill quarantine count must be
reviewed and dispositioned. After a second snapshot, enable
`USE_PG_CANDIDATE_ASSESSMENTS=1` in staging and prove:

1. create a link on ECS task A, copy its one-time token, and start on task B;
2. race two case-variant starts for one email and observe exactly one session;
3. record events on different tasks and observe one monotonic trust/tab count;
4. race submit and expiry across tasks and observe exactly one terminal state;
5. reach the tab threshold and confirm subsequent event/submit calls are rejected;
6. replace every ECS task and confirm link, attempt, event and audit evidence remains;
7. make PostgreSQL unavailable and confirm readiness fails without falling back
   to process-local candidate state.

Keep the flag at `0` if any check fails. Rollback is flag-only; preserve the
normalized rows for investigation and do not run a destructive down migration.

## Remaining architecture risk

- Email uniqueness is not candidate identity proof. Before high-stakes exams,
  require an expiring email OTP/magic-link challenge bound to the link and
  attempt, with retry budgets and anti-enumeration responses.
- The administration UI still needs to expose the one-time copy and rotation
  workflow cleanly; the API deliberately cannot redisplay an existing bearer.
- Link creation still snapshots assessments/courses from process-local state.
  Enable this flag only as part of a reconciled source-of-truth cutover, not as
  an isolated production switch.
- Public endpoints still need AWS WAF/bot controls, CloudFront/ALB request
  budgets, abuse telemetry and load/soak evidence.
- Manual-review assignment, privacy erasure/retention and append-only external
  audit export remain incomplete. Candidate runtime alone does not authorize a
  production launch.
