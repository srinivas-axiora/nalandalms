# Security remediation Phase 50: relational workplace authority

Captured: 2026-11-09 (Asia/Calcutta)
Branch: `security-phase-0-baseline`

## Outcome

Nalanda Copilot attendance, performance reviews, announcements, inbox messages,
direct messages and self-appraisals now have a normalized PostgreSQL authority.
When `USE_PG_WORKPLACE=1`—or the broader `USE_PG_COURSES=1` invariant is
selected—these workflows no longer read or mutate task-local arrays.

This closes a multi-task split-brain boundary, but it does **not** authorize a
production cutover. AWS keeps every relational flag disabled until migration,
backfill, live verifier, failover and multi-task evidence is captured.

## Controls implemented

- `attendance_records` has one row per user and workplace-local date. Clock-in
  uses a unique constraint plus `ON CONFLICT`; clock-out is a conditional atomic
  update. Both successful transitions write audit evidence in the transaction.
- `performance_reviews` stores bounded review evidence with subject and optional
  reviewer identity references.
- `workplace_communications` stores bounded announcements, direct messages and
  self-appraisals. Direct recipients are revalidated as active inside the write
  transaction, and audit metadata never contains message content.
- Recipient search fails closed when a name is ambiguous instead of choosing an
  arbitrary account.
- Snapshot save/load excludes workplace arrays whenever relational workplace
  authority is selected.
- Backfill validates legacy identities, dates, times, ratings and field lengths;
  legacy local attendance time is interpreted using `APP_TIME_ZONE`.
- Readiness requires all three tables, their query indexes, daily-attendance
  uniqueness, relational identity/session enforcement and relational audit
  visibility. Transactional audit and privacy readiness also depend on this
  authority.
- Privacy coverage advances to `normalized-v2`: export includes workplace data;
  erasure deletes subject attendance, owned reviews and sent/received messages;
  retained reviews written by the subject pseudonymize reviewer identity.
- Migration `0021_workplace_authority.sql` refuses to run while an erasure is
  `Processing` and returns unfinished reviewed requests to explicit review under
  coverage v2.

## Verification

Local focused tests cover:

- concurrent-safe clock-in and conditional clock-out SQL;
- transactional message/audit writes without content leakage;
- ambiguity-safe recipient resolution;
- Copilot reads and writes through the relational repository;
- privacy v2 claim, export and erasure coverage;
- default-off AWS feature flags and readiness interlocks.

The live RDS verifier is:

```powershell
npm run db:verify-workplace
```

It creates synthetic users, races two clock-ins and two clock-outs, checks scoped
review and communication behavior, verifies audit evidence, and removes its test
records. The staging deployment verifier list includes this command.

Local release-gate evidence for this change:

| Gate | Result |
|---|---|
| Focused Phase-50 regression suite | 6 files; 68 tests passed |
| `npm test` | 88 files; 405 tests passed |
| `npm run test:security` | 1 file; 32 tests passed |
| JavaScript syntax scan | 327 files; 0 failures |
| `npm run typecheck` | Passed |
| `npm run build` | Passed; existing ~1.01 MB chunk warning remains |
| `npm audit --json` | 0 known vulnerabilities across 411 dependencies |
| `npm run infra:validate` | 77 resources; 23 outputs |
| `npm run routes:inventory` | 129 routes |

## Production gates still open

1. Apply migration 0021 and run idempotent backfill against an isolated copy of
   staging RDS; reconcile admitted/skipped record counts.
2. Run `db:verify-workplace` and the updated `db:verify-privacy` against staging.
3. Prove two ECS tasks racing clock-in, clock-out and messaging preserve one
   authoritative result and complete audit evidence.
4. Exercise backup restore and privacy erasure after workplace data exists.
5. Only then consider `USE_PG_WORKPLACE=1`; do not enable `USE_PG_COURSES` while
   its separate readiness interlock still reports an incomplete cutover.

Current decision: **NO-GO for production**.
