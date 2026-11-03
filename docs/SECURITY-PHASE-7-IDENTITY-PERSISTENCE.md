# Phase 7 — relational identity and session authority

Date: 2026-11-03  
Status: **implemented, feature-gated, live PostgreSQL evidence pending**  
Production decision: **NO-GO remains unchanged**

## Outcome

Authentication, account administration and session revocation can now use the
normalized PostgreSQL `users` table behind `USE_PG_IDENTITY=1`. The flag is off
by default and explicitly set to `0` in AWS staging until the live cutover gate
below passes.

This phase also moves login-failure counters and mobile companion pairing-token
claims to Redis. Production fails closed if Redis is unavailable; development
retains bounded in-process fallbacks.

## Controls implemented

- JWT and step-up-token checks compare against the database session version.
- JWTs validate the configured issuer and audience in addition to signature,
  expiry and server-authoritative session version.
- Logout, password reset, password changes, role changes and deactivation revoke
  prior sessions using a server-authoritative version.
- Password reset uses optimistic session-version matching, so a token is
  one-time and becomes invalid after any intervening trust change.
- Registration, user administration and preference updates use transactional
  PostgreSQL writes with database audit records.
- User archives exclude password hashes. Restore leaves the account inactive,
  installs an unknown replacement credential and requires administrator action.
- Login lockouts are shared across replicas through Redis and scoped to the
  account/IP pair.
- Companion pairing tokens are stored by SHA-256 digest, expire in Redis, are
  atomically claimed once and inherit candidate session revocation.
- `/api/ready` fails when identity mode is enabled but its tables, added columns
  or session-revocation trigger are missing.
- At startup, PostgreSQL refreshes a compatibility user projection for bounded
  contexts not yet migrated. Mutations refresh the local projection, but it is
  never trusted for authentication or session revocation.

## Required staging cutover gate

Use synthetic accounts only.

```powershell
npm run db:bootstrap
npm run db:backfill
npm run db:verify-identity
```

Then reconcile before enabling the flag:

```sql
SELECT count(*) FROM users;
SELECT count(*) FROM users WHERE password_hash IS NULL;
SELECT count(*) FROM users WHERE session_version < 0;
SELECT count(*) FROM audit_logs WHERE metadata::text ~* 'password(hash)?';
```

Expected results: verifier passes all checks; no active user has a null password
hash; session versions are non-negative; no credential derivative appears in
audit metadata.

After a database snapshot, set `USE_PG_IDENTITY=1` in staging and verify:

1. login and `/api/auth/me` work on two sequential ECS task replacements;
2. a token captured before logout fails after logout on a replacement task;
3. password, role and inactive-status changes revoke old JWT and step-up tokens;
4. password-reset token replay fails;
5. user archive/restore is visible after a task replacement and restore remains
   inactive;
6. five failed logins observed through different tasks share the same lockout;
7. one companion pairing token cannot be claimed twice concurrently;
8. PostgreSQL or Redis loss makes readiness fail and identity mutations return a
   controlled error rather than accepting stale process state.

Keep `USE_PG_IDENTITY=0` if any check fails. Rollback is flag-only because the
migration is additive; do not delete normalized identity or audit data.

## Remaining architecture risk

Identity is no longer required to be process-local when the flag is enabled,
but assessments, attempts, proctoring evidence, privacy workflows and several
other bounded contexts still use the snapshot/in-memory model. Multi-instance
production remains unsafe until those stateful workflows have relational or
distributed authorities and concurrency tests.
