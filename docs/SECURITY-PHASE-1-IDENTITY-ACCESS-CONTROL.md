# Phase 1 — Identity, sessions and access-control remediation

Assessment date: 2026-11-01 (Asia/Calcutta)  
Branch: `security-phase-0-baseline`  
Scope: Phase 1 application changes only; no production deployment or data mutation was performed

## Outcome

Phase 1 closes the identity and authorization exploit paths represented by
SEC-001 through SEC-005, SEC-009 through SEC-011, SEC-013, SEC-014 and the six
Phase 1 regression cases. The application remains **NO-GO for production**
because payment, upload and exam-deadline findings belong to later phases and
remain intentionally red.

## Implemented controls

- Public registration ignores client role input and always provisions a
  `Learner`. Privileged roles are available only through the authenticated,
  administrator and step-up protected user-provisioning route.
- Runtime and PostgreSQL roles now share one seven-role contract. Migration
  `0002_identity_access_control.sql` adds missing database roles and rotates the
  session version after password, role or status trust changes.
- Logout rotates the session version. Password changes, role changes,
  deactivation and restored accounts also invalidate previously issued JWT and
  step-up tokens.
- Login throttling retains an IP-wide budget and adds identifier/IP isolation so
  an attacker cannot create a global lockout for another account. Express proxy
  trust is explicit and validated instead of unconditionally trusting one hop.
- Central attempt policies now protect questions, grading, candidate analytics,
  proctor events/media/signaling/status and cockpit controls. Cross-owner access
  returns 403 before a step-up challenge.
- High-impact grading, proctor interventions, user provisioning, candidate-link
  state changes, archive restoration, privacy deletion requests and manual
  certificate issuance require recent re-authentication.
- Companion tokens are random, short-lived, attempt/candidate scoped and bound
  to the candidate session version. Pairing is one-use; heartbeat and companion
  uploads require the bearer token, and session revocation invalidates it.
- Manual certificate issuance fails closed unless
  `CERTIFICATE_ISSUANCE_APPROVAL_ROLE` is configured. It also requires course
  authority, completion/passing evidence and step-up. Score and proctor status
  are derived from server state, not request fields.
- Production startup now requires a separate strong
  `CERTIFICATE_SIGNING_SECRET`; the known source fallback was removed.
- Locked chapter DTOs no longer include protected body, URL or filename fields.
- Recursive redaction removes credential material from public users, audit and
  security metadata, archives and aggregate application responses.

## Database and incident-response handoff

Apply migrations in order:

1. `0002_identity_access_control.sql`
2. `0003_audit_privileged_self_registration.sql`

The second migration creates the read-only
`privileged_self_registration_audit` view. Security/operations must investigate
each row before changing roles or disabling accounts. For confirmed unauthorized
accounts, revoke sessions, correct or disable the account, rotate any exposed
credentials and review its audit trail for downstream exam, payment and
certificate activity.

Required production configuration:

- `JWT_SECRET`: unique random value of at least 32 characters.
- `CERTIFICATE_SIGNING_SECRET`: separate unique random value of at least 32
  characters.
- `CERTIFICATE_ISSUANCE_APPROVAL_ROLE`: the explicitly approved manual issuer
  role (recommended `Admin`).
- `TRUST_PROXY`: the actual trusted proxy topology; otherwise `false`.
- `COMPANION_TOKEN_TTL_SECONDS`: 60–3600 seconds; default 900.

Any previously deployed JWT or certificate signing secrets must be rotated
after rollout. Existing HMAC-signed certificate verification requires an
explicit legacy-key/version migration plan before rotation; this phase does not
silently invalidate production credentials.

## Verification evidence

- Phase 1 targeted adversarial cases: 16 passed.
- Living authorization-matrix contract and database/runtime role contract:
  passed.
- Normal application suite: 15 files, 120 tests passed.
- Frontend strict typecheck: passed.
- Production frontend build: passed (with the existing large-chunk warning).
- Dependency audit: unchanged at 14 vulnerable packages (2 critical, 8 high,
  3 moderate and 1 low); dependency remediation is not part of this phase.
- Full adversarial suite: 16 passed; four later-phase cases remain red by design:
  SEC-006 payment verification, SEC-007 direct upload/public delivery, SEC-008
  post-expiry final submission and SEC-012 expired public candidate start.

## Residual risk and next phase

The application must not be released yet. Phase 2 should address payment
authenticity and immutable order binding first (SEC-006), followed by upload
isolation and exam-state/deadline enforcement. Process-local session/rate state
also remains unsuitable for multi-instance production and must be moved to a
durable distributed store in the architecture phase.
