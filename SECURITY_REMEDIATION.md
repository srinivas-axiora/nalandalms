# Security Remediation Summary

Date: 2026-06-22

## Post-Hardening Score

Estimated production-readiness score after this pass: **79/100**

- Security: **82/100**
- Data protection: **80/100**
- Availability/resilience: **74/100**
- Abuse resistance: **78/100**

This is materially stronger than the original audit baseline, but it is not the same as a fully certified production posture. The remaining score blockers are mostly infrastructure and architecture items that cannot be fully proven from this repo alone: managed backup/PITR, centralized monitoring/alerting, distributed rate limiting, admin MFA, and normalized relational persistence.

## Fixed In This Pass

1. Scoped `/api/app-data` by role and visibility so employees/managers no longer receive broad global collections.
2. Reused centralized visibility helpers for course, chapter, and assessment list access.
3. Blocked manager course assignment outside permitted user scope and rejected invalid/duplicate assignments.
4. Required active approved course plus assignment/enrollment before non-admin users can start assessment attempts.
5. Made production startup fail when `DATABASE_URL` is missing, preventing accidental production use of local JSON-file persistence.
6. Changed successful mutating JSON responses to wait for durable save; save failure now returns `503`.
7. Replaced regex-based rich text sanitization with `sanitize-html` allow-listing.
8. Capped chapter learning-time increments and clamped assessment time to server-observed elapsed time.
9. Removed frontend hard-coded demo passwords and production login account shortcuts.
10. Changed backend seed passwords to env-only; missing seed passwords now become random unknown values.
11. Removed the local Gemini key from `.env`. The old key must still be rotated in the provider console.
12. Upgraded Vite tooling to remove the `esbuild` advisory; `npm audit` now reports zero vulnerabilities.
13. Updated architecture docs so no demo credentials are published.

## Verification

- `npm run build`: passed.
- `npm audit --json`: zero vulnerabilities.
- Backend syntax checks: `node --check backend/server.js` and `node --check backend/db.js` passed.
- Credential scan for known demo passwords and Google key pattern: no matches in source, excluding ignored build output and `node_modules`.

## Remaining Before True Production

1. Add admin MFA and sensitive-action re-authentication.
2. Replace process-local rate limiting with Redis/API-gateway rate limits.
3. Move from JSONB whole-state persistence to normalized PostgreSQL repositories, or at least add transactional per-entity persistence.
4. Add centralized structured logs, security alerts, uptime checks, and error tracking.
5. Configure and test managed database backups, restore, and PITR.
6. Add CI checks for secret scanning, dependency scanning, tests, and build.
7. Add automated authorization regression tests for every role and object-level route.

