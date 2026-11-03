# Phase 8 — transactional assessment and proctoring runtime

Date: 2026-11-03  
Status: **implemented, feature-gated, live PostgreSQL evidence pending**  
Production decision: **NO-GO remains unchanged**

## Outcome

Authenticated assessment attempts, grading state, enrollment transitions and
proctoring evidence can now use normalized PostgreSQL tables behind
`USE_PG_ATTEMPTS=1`. The flag is off by default and explicitly set to `0` in
AWS staging until the live cutover gate below passes.

Migration `0007_attempt_runtime_cutover.sql` aligns the database contract with
the existing API identifiers and states. Attempt and proctor-event IDs are
stored as text, all runtime statuses are constrained, and attempts carry a
monotonic optimistic `version`.

## Controls implemented

- Starting an exam writes the randomized server-only question map and audit
  event in one transaction.
- Answer autosave uses compare-and-swap versioning and a database-clock guard;
  submitted, paused, expired or concurrently modified attempts fail closed.
- Final submission and its enrollment time/status transition commit in one
  database transaction.
- Manual grades use optimistic concurrency and do not double-count assessment
  time.
- Deadline auto-submit is persisted even when the triggering request returns an
  expiry error.
- Proctor anomalies commit the trust-score transition, evidence row and audit
  record atomically.
- Warning, acknowledgement, pause, resume, termination, media-manifest and
  companion mutations use the same optimistic authority.
- Concurrent primary/companion media chunks and heartbeats use atomic JSONB
  append/merge operations, avoiding lost manifests during dual-camera traffic.
- WebRTC offer/answer/ICE signaling uses a bounded four-hour Redis list shared
  across tasks; production fails closed rather than silently using local state.
- Proctor termination and the failed-enrollment transition are atomic.
- `/api/ready` fails when attempt mode is enabled but required tables, text IDs,
  versioning, question-map or enrollment-status columns are absent.
- The legacy in-process attempts array is only a compatibility projection. A
  database-backed request mutates a detached object and updates the projection
  only after commit.

## Required staging cutover gate

Use synthetic records only and take a database snapshot before the backfill.

```powershell
npm run db:migrate
npm run db:backfill
npm run db:verify-attempts
```

Reconcile before enabling the flag:

```sql
SELECT count(*) FROM assessment_attempts;
SELECT count(*) FROM assessment_attempts WHERE version < 0;
SELECT status, count(*) FROM assessment_attempts GROUP BY status ORDER BY status;
SELECT count(*) FROM proctoring_logs p
LEFT JOIN assessment_attempts a ON a.id = p.attempt_id
WHERE a.id IS NULL;
SELECT count(*) FROM assessment_attempts a
LEFT JOIN users u ON u.id = a.user_id
WHERE u.id IS NULL;
```

Expected results: the verifier passes every check; invalid versions and orphan
counts are zero; status counts match the snapshot source.

After another snapshot, set `USE_PG_ATTEMPTS=1` in staging and verify:

1. start an exam on task A, autosave and submit it on task B;
2. submit the same attempt concurrently through two tasks and observe exactly
   one success and one `409` conflict;
3. try an answer after the database deadline and confirm no answer is stored;
4. record simultaneous proctor events and confirm no trust-score update is lost;
5. pause on task A and resume on task B with one monotonic version sequence;
6. terminate an attempt and confirm attempt, enrollment and audit state commit
   together;
7. pair a companion once, replace the task, then persist heartbeat and chunk
   manifest through the replacement;
8. replace both ECS tasks and confirm attempt, event, warning and media metadata
   remain visible;
9. make PostgreSQL unavailable and confirm readiness fails and mutations do not
   fall back to the process-local projection.

Keep `USE_PG_ATTEMPTS=0` if any check fails. Rollback is flag-only; preserve the
normalized rows for reconciliation and do not run a destructive down migration.

## Remaining architecture risk

This phase does not make the whole application multi-instance safe. Public
candidate-link submissions, certificates, privacy workflows and several admin
bounded contexts still use snapshot/process-local state. Those authorities
must move to PostgreSQL/Redis and pass cross-task tests before production
approval.
