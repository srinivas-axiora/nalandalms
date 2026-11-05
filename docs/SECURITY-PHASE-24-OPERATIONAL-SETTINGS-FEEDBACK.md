# Phase 24 — operational settings and learning feedback authority

Date: 2026-11-05
Status: **implemented, feature-gated, live PostgreSQL proof pending**
Production decision: **NO-GO remains unchanged**

## Outcome

Proctoring policy settings and learner feedback no longer require split
snapshot authority. `USE_PG_SETTINGS=1` makes settings reads, updates and
runtime consumers relational. `USE_PG_SKILLS=1` makes chapter feedback,
skill-rating projections and local AI recommendations relational.

## Controls implemented

- Migration `0017_operational_settings_feedback.sql` initializes a secure
  proctoring policy, constrains its JSON shape, enforces chapter/course pairing
  and bounded rating data, and adds feedback-scope indexes.
- Settings updates accept a non-empty strict allowlist of bounded values,
  acquire a row lock and commit the new value with redacted audit evidence.
- Assessment-start strict rules and tab-switch auto-submit read the same
  current relational policy used by the settings API.
- Chapter feedback binds the authenticated subject to a matching chapter,
  course and active enrollment. Re-submission updates the unique learner/
  chapter record instead of creating duplicates.
- Feedback and its audit row commit in one transaction.
- Skill ratings and chapter feedback use SQL Admin, direct-report Manager or
  self scope. App-data consumes those projections without snapshot fallback
  when the skills cutover is enabled.
- Local AI course recommendations use relational skills, targets and the
  authenticated subject's rating scope.
- Backfill now covers settings, skill ratings and chapter feedback with FK,
  range, enum and length normalization.
- AWS keeps both new flags disabled until staging verification succeeds.

## Required staging gate

After migrations and backfill in isolated staging, run:

```powershell
npm run db:verify-operational
```

The verifier restores the original settings value and deletes its synthetic
records. It proves enrolled feedback, rejection of an unenrolled subject,
direct-report rating scope, settings durability and atomic audit evidence.

## Local verification checkpoint

The bounded local gates passed on 2026-11-05:

- application suite: 56 files, 275 tests;
- adversarial security suite: 32 tests;
- focused settings/feedback authority suite: 10 tests;
- affected assessment/proctoring/settings suite: 29 tests;
- frontend typecheck and production build;
- authorization-route inventory validation;
- dependency audit: 0 known vulnerabilities across 410 dependencies; and
- JavaScript syntax and whitespace checks.

The production build still reports a non-blocking frontend bundle-size warning
for the approximately 1 MB main JavaScript chunk. The live operational verifier
correctly refused to run locally because no `DATABASE_URL` or `PGHOST` was
provided; that is pending AWS staging evidence, not a passing database result.

## Remaining blockers

Live PostgreSQL concurrency and rollback injection are pending. The application
still has snapshot-backed application-wide audit/security events and archive
projections. Production cutover remains disabled and readiness stays
fail-closed until live evidence is available.
