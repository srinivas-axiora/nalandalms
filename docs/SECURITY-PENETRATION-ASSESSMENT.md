# Nalanda application security and penetration assessment

Assessment date: 2026-11-01 (Asia/Calcutta)  
Scope: local source tree and local Express application only  
Decision: **NO-GO for production**  
Overall risk: **Critical**

> **Historical assessment notice (updated 2026-11-03):** This document preserves
> the 2026-11-01 point-in-time findings. Remediation Phases 1–5 have since made
> all 30 adversarial tests green and reduced the dependency audit to zero known
> vulnerabilities. A production-shaped, single-writer AWS staging package is
> available, but the production decision remains **NO-GO** until normalized
> transactional persistence, multi-instance safety, malware quarantine and the
> operational release drills are complete. See
> [Phase 3](./SECURITY-PHASE-3-UPLOAD-ISOLATION.md),
> [Phase 4](./SECURITY-PHASE-4-EXAM-INTEGRITY.md) and
> [Phase 5](./SECURITY-PHASE-5-RUNTIME-AWS-STAGING.md).

## 1. Executive summary

Nalanda is a React and Express learning, assessment and proctoring platform with
course administration, candidate examinations, certificate issuance, payment
verification, AI-assisted content generation and privacy-governance functions.
The application has useful baseline controls—bcrypt password hashing, HttpOnly
cookies, CSRF middleware, role middleware, security headers, Zod validation in
some handlers and parameterized PostgreSQL calls—but they are not consistently
applied at resource and workflow boundaries.

Local exploitation confirmed fourteen broken security invariants. Most
importantly, an anonymous user can self-register as an Instructor. That account
can reach role-trusted functions that terminate other users' exams and issue
certificates. Separate flaws permit unsigned payment verification, answer-key
and candidate-data disclosure, cross-user proctor signaling, unrestricted
public file publication, post-expiry exam submission, expired candidate-link
use and continued JWT use after logout. Password hashes also enter audit data.

The standard suite passed 110 tests and the production build completed, but
those results do not establish security. The new isolated adversarial suite has
14 intentionally failing tests, one for every confirmed invariant violation.
An `npm audit` snapshot reported 14 vulnerable packages: 2 critical, 8 high,
3 moderate and 1 low.

## 2. Method and limitations

The assessment combined source review, route/middleware enumeration, local
Supertest requests, dependency audit, build/test execution and abuse-case
reasoning. Tests used only synthetic local state and temporary files, which
were removed after execution. No production host, third-party payment account,
cloud bucket, real candidate or live AI provider was exercised.

CVSS values are CVSS v3.1 base estimates and should be recalculated with the
deployment's environmental metrics. Compliance notes identify likely control
impact, not a legal opinion or certification result.

## 3. Threat model

### Assets

- Account credentials, session cookies, password hashes and role assignments.
- Learner/candidate PII, evaluated responses and behavioral/proctoring evidence.
- Question banks, correct answers, exam timers, grades and completion records.
- Course entitlements, payment orders and transaction evidence.
- Certificates, verification signatures and institutional reputation.
- Uploaded content, video chunks and object-store credentials.
- JWT, Razorpay, Gemini, database, Redis and certificate-signing secrets.
- Audit/security events, privacy requests and retention evidence.

### Trust boundaries

1. Untrusted browser/candidate client to the Express API.
2. Authenticated identity to role and resource authorization decisions.
3. Express process to in-memory state or the PostgreSQL JSON snapshot.
4. API to Redis, object storage, Gemini and Razorpay.
5. Public share-link and certificate-verification surfaces to protected data.
6. Public upload delivery to the application's same-origin browser context.
7. CI/build inputs and dependency registry to deployable artifacts.

### Attacker personas and likely outcomes

| Persona | Capability | Confirmed or credible impact |
|---|---|---|
| Anonymous internet user | Register, use public candidate/payment/companion paths | Self-assign Instructor; reuse expired candidate link; invoke unauthenticated companion paths |
| Learner/employee | Valid low-privilege account and CSRF token | Read answer keys, publish active content, view foreign signals, replay session after logout |
| Malicious instructor/manager | Trusted role without resource ownership | Terminate foreign exams, grade foreign attempts, issue arbitrary certificates, inspect candidate details |
| Compromised browser/XSS actor | Run script in application origin | Exfiltrate localStorage application data and invoke cookie-authenticated mutations |
| Network/resource exhaustion actor | Many clients or multiple app replicas | Bypass per-process rate state; amplify upload, AI and snapshot-write cost |
| Supply-chain attacker | Exploit a vulnerable dependency or missing source artifact | DoS, request parsing compromise, release failure or altered build behavior |

### Primary abuse cases

- Convert anonymous access into a trusted Instructor identity.
- Obtain answer keys or candidate results before/after an examination.
- Manipulate attempts, grading, proctor decisions or certificates outside scope.
- Unlock a course without a cryptographically verified, bound payment.
- Store attacker-controlled active content and distribute it from the app origin.
- Retain access after logout, password/role administration or privacy deletion.
- Create split-brain state or bypass limits across horizontally scaled processes.

The complete endpoint inventory is in
[SECURITY-ATTACK-SURFACE.md](./SECURITY-ATTACK-SURFACE.md).

## 4. Control verification (C1-C12)

| ID | Control | Result | Evidence and gap |
|---|---|---|---|
| C1 | Password/secret protection | Partial | bcrypt and public-user shaping exist, but password hashes are copied to audit/archive records; certificate signing has a known fallback secret. |
| C2 | Session lifecycle/revocation | Bypassable | Logout only clears the cookie. Existing JWTs remain valid; role and admin password changes do not invalidate sessions. Tokens lack a server-side session/JTI denylist. |
| C3 | Role-based authorization | Bypassable | Public registration trusts the requested Instructor role; several handlers allow any authenticated user or broad staff role. |
| C4 | Step-up authentication | Partial | Present on selected settings/user operations, absent on certificate issuance, proctor termination, archive restore and several trust-changing actions. |
| C5 | CSRF/CORS/origin defense | Partial | Double-submit CSRF and a hostile-origin CORS rejection worked locally. Public candidate, webhook and companion exemptions widen the boundary; payment authentication is independently broken. |
| C6 | Object-level authorization | Bypassable | Candidate analytics, question library, signaling, companion status, proctor controls, grading and certificate operations omit ownership/assignment checks. |
| C7 | Input and file validation | Bypassable | Validation is inconsistent. Direct upload lacks role, size and MIME controls; rooted keys can escape the intended directory; Multer trusts client MIME/extension. |
| C8 | Browser/transport hardening | Partial | Local responses included CSP, HSTS, X-Frame-Options and nosniff. Production TLS/proxy behavior was not in scope; public active content and localStorage weaken browser protection. |
| C9 | Secure configuration/fail closed | Partial | Production checks exist for key secrets and database configuration, but local/in-memory fallbacks remain and payment/certificate verification can fail open. |
| C10 | Data integrity/persistence | Partial | SQL calls are parameterized and transaction helpers exist. Whole-state JSON snapshot persistence is last-write-wins; logs are mutable bounded arrays. |
| C11 | Privacy/retention lifecycle | Bypassable | Deletion requests are in-memory and have no executor. A retention worker exists but is not started by the server. Export/deletion coverage is incomplete. |
| C12 | Dependency/SDLC assurance | Bypassable | Audit found critical/high vulnerabilities. The upload route source is ignored by an unanchored `uploads/` rule, so a clean checkout can miss an imported module. |

## 5. Confirmed findings

### F-01 — Anonymous privilege escalation to Instructor

- Severity: **Critical**, CVSS 9.8 (`AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H`)
- CWE-269 Improper Privilege Management; OWASP A01 Broken Access Control
- Evidence: `POST /api/auth/register` accepts `role: "Instructor"` and assigns it.
  Security test `SEC-001` received an Instructor account instead of a Learner.
- Impact: anonymous-to-privileged escalation; subsequent exam termination,
  grading, candidate inspection and certificate abuse.
- Fix: ignore all client-supplied roles on public registration and assign a
  fixed low-privilege role. Provision staff only through a step-up protected,
  audited admin workflow with invitation expiry and organization scope.
- Acceptance: all public role values are rejected or ignored; a matrix test
  proves every privileged role requires authorized provisioning.

### F-02 — Payment verification fails open and is not order-bound

- Severity: **Critical**, CVSS 9.1 (`AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:N`)
- CWE-345 Insufficient Verification of Data Authenticity; OWASP A04 Insecure Design
- Evidence: verification checks HMAC only when both a configured secret and a
  signature are present. It does not securely bind order, payer, course and
  server-calculated amount. `SEC-006` unlocked a substituted course without a
  signature. The webhook has an optional secret, verifies reserialized JSON
  rather than raw request bytes and lacks robust idempotency.
- Impact: unpaid enrollment, fraudulent entitlements, certificate eligibility,
  reconciliation failures and repeat processing.
- Fix: fail closed when any verification material is absent; persist an
  immutable server-side order ledger; verify the provider signature over the
  exact required bytes; bind user/course/currency/amount/order; process events
  idempotently inside a transaction; implement refunds/reversals.
- Acceptance: missing, malformed, replayed, cross-user and cross-course payment
  tests all fail without changing entitlement state.

### F-03 — Proctor control, signaling and companion IDOR

- Severity: **High**, CVSS 8.8 (`AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H`)
- CWE-639 Authorization Bypass Through User-Controlled Key; OWASP A01
- Evidence: broad Instructor/Manager checks do not verify assignment or
  assessment ownership; signaling GET/POST and companion status omit object
  scope. `SEC-004`, `SEC-005` and `SEC-013` respectively terminated a foreign
  exam, read foreign signals and read a foreign companion status.
- Impact: exam disruption, impersonated proctor messages, leakage of ICE/network
  information, monitoring status and evidence integrity loss.
- Fix: centralize `canManageAttempt`/`canSignalAttempt` policy using tenant,
  assessment owner, explicit proctor assignment and candidate identity; bind
  signaling channels to short-lived, audience-restricted attempt tokens.

### F-04 — Answer keys and candidate analytics exposed

- Severity: **High**, CVSS 8.1 (`AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:N`)
- CWE-200 Exposure of Sensitive Information / CWE-639; OWASP A01
- Evidence: the question-library route requires authentication but returns full
  questions including `answer`. Candidate analytics is not resource-scoped and
  returns email, evaluated responses and correct answers. `SEC-002` and
  `SEC-003` received HTTP 200 for both foreign resources.
- Impact: examination compromise, perfect-score fraud and candidate PII breach.
- Fix: use separate authoring and delivery DTOs; never serialize answers on a
  candidate/learner path; authorize analytics by tenant and owned assessment;
  redact answer details unless a justified, audited reviewer action permits it.

### F-05 — Arbitrary upload and public same-origin content delivery

- Severity: **High**, CVSS 8.8 (`AV:N/AC:L/PR:L/UI:R/S:C/C:H/I:H/A:H`)
- CWE-434 Unrestricted Upload, CWE-22 Path Traversal, CWE-862 Missing Authorization;
  OWASP A01/A05
- Evidence: any authenticated user can use direct upload; no size/content-type
  allowlist is enforced; traversal defense only rejects `..`; an absolute/rooted
  key can escape the intended root; uploaded files are publicly served outside
  the API limiter. `SEC-007` published HTML and retrieved it anonymously.
- Impact: persistent same-origin active content, malware/phishing hosting,
  storage exhaustion, file overwrite depending on platform/path and evidence
  tampering. Proctor capture also lacks attempt ownership.
- Fix: remove direct upload for untrusted roles; generate scoped one-time object
  keys; validate magic bytes, extension and decoded content; enforce size/count
  quotas; store outside web root on a separate download origin; force attachment
  and safe content type; scan/quarantine; reject non-relative normalized paths.

### F-06 — Exam deadline and grading integrity bypass

- Severity: **High**, CVSS 8.1 (`AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:H/A:H`)
- CWE-602 Client-Side Enforcement of Server-Side Security / CWE-367 TOCTOU;
  OWASP A04
- Evidence: bulk finalization merges answers even after expiry while autosave
  rejects them. Candidate start does not repeat the GET expiry check, and public
  candidate submission does not enforce the deadline. Descriptive responses
  longer than ten characters can receive automatic credit. `SEC-008` submitted
  an expired attempt and `SEC-012` started an expired link.
- Impact: late-answer injection, score manipulation, inconsistent examination
  outcomes and unreliable certification evidence.
- Fix: enforce a single server-authoritative state machine and clock in every
  write path; reject any answer recorded after deadline; atomically transition
  attempt state; require rubric/manual or validated model grading for prose.

### F-07 — Arbitrary certificate issuance and predictable signing fallback

- Severity: **High**, CVSS 8.8 (`AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H`)
- CWE-862 Missing Authorization / CWE-798 Hard-coded Credentials; OWASP A01/A07
- Evidence: any Instructor/Manager can issue for any employee/course without
  ownership or verified completion. A known fallback certificate secret is in
  source. `SEC-009` issued an unrelated certificate.
- Impact: fraudulent credentials and loss of trust in public verification.
- Fix: derive issuance only from an immutable eligible completion transaction;
  enforce tenant/course authority and separation of duties; require step-up;
  store versioned asymmetric signing keys in KMS/HSM and support revocation.

### F-08 — Logout and trust changes do not revoke sessions

- Severity: **High**, CVSS 7.5 (`AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:N`)
- CWE-613 Insufficient Session Expiration; OWASP A07 Identification and Authentication Failures
- Evidence: logout clears a browser cookie but does not invalidate its JWT.
  Role and administrator password changes do not increment session version.
  `SEC-010` replayed the pre-logout token and received HTTP 200.
- Fix: use short-lived access tokens plus rotating refresh sessions, unique JTI,
  server-side session records and revocation; increment security version for
  password, role, disable and privilege changes; validate issuer/audience.

### F-09 — Password hashes and client-side sensitive state leakage

- Severity: **High**, CVSS 7.5 (`AV:N/AC:L/PR:H/UI:N/S:U/C:H/I:L/A:N`)
- CWE-532 Sensitive Information in Log Files / CWE-922 Insecure Storage;
  OWASP A02/A09
- Evidence: administrator password change writes `passwordHash` into audit
  metadata; archived user objects retain it. `SEC-014` found a bcrypt hash in
  the audit record. The React state helper serializes broad application data to
  `localStorage` and logout does not reliably purge it.
- Impact: offline cracking material for privileged readers/backups and bulk data
  exfiltration from any same-origin XSS or shared workstation.
- Fix: schema-based allowlist/redaction before logging or archiving; never log
  secrets or credential derivatives; minimize browser state, keep sensitive
  records in memory, clear storage on logout and set short cache lifetimes.

### F-10 — Privacy deletion and retention are non-operational

- Severity: **High**, CVSS 7.5 (`AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:L/A:N`)
- CWE-459 Incomplete Cleanup / CWE-664 Improper Control of a Resource Lifetime
- Evidence: deletion requests live in a process-local Map with no execution
  worker. The retention-cleanup worker is not started by the server. Export and
  erase flows do not cover every operational store, log or object.
- Impact: inability to honor retention/erasure commitments, orphaned proctoring
  media and inconsistent subject-access responses.
- Fix: durable workflow with identity re-verification, legal-hold exceptions,
  approval/SLA state, coverage registry, idempotent erasure/anonymization and
  signed completion evidence; schedule and monitor retention jobs.

### F-11 — Process-local controls and last-write-wins persistence

- Severity: **High**, CVSS 8.1 (`AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:H/A:H`)
- CWE-362 Race Condition / CWE-400 Uncontrolled Resource Consumption; OWASP A04
- Evidence: global and AI limits are Maps despite a Redis helper. Application
  state is saved as a whole JSON collection; multiple replicas can overwrite
  each other's updates. Audit/security logs are bounded mutable arrays.
- Impact: rate-limit bypass, AI/upload cost abuse, split-brain authorization,
  lost exam/payment updates and non-durable audit evidence.
- Fix: Redis atomic distributed limits; relational records with constraints,
  row/version locking and idempotency keys; append-only centralized audit sink;
  per-route budgets and backpressure.

### F-12 — Known vulnerable dependency set

- Severity: **Critical program risk**; highest observed advisory CVSS 9.1
- CWE varies; OWASP A06 Vulnerable and Outdated Components
- Evidence: `npm audit --json` reported 14 vulnerable packages (2 critical,
  8 high, 3 moderate, 1 low), including critical `proxy-addr` and `shell-quote`,
  plus high-severity `multer`, `body-parser`, `zod`, Vite/dev-chain and others.
- Impact: request parsing/DoS, build-chain execution and validation weaknesses;
  exact exploitability depends on reachable versions and deployment usage.
- Fix: update direct constraints and lockfile, remove unused packages, separate
  production/dev dependencies, generate an SBOM and gate CI on reachable
  critical/high advisories with documented time-bound exceptions.

### F-13 — Locked chapter content is returned to unauthorized learners

- Severity: **High**, CVSS 7.1 (`AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N`)
- CWE-200 / CWE-639; OWASP A01
- Evidence: a locked response includes `body`, URL and filename and merely adds
  an `isLocked` flag. `SEC-011` recovered the protected body.
- Fix: emit a minimal metadata DTO for locked chapters; enforce enrollment,
  payment and prerequisite policy before retrieving or serializing content.

### F-14 — Security-critical upload module excluded from version control

- Severity: **High release integrity risk**, CVSS 7.5
  (`AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:H/A:H`)
- CWE-706 Use of Incorrectly-Resolved Name / OWASP A05 Security Misconfiguration
- Evidence: `.gitignore` contains unanchored `uploads/`, which also ignores
  `backend/src/modules/uploads/uploads.routes.js`; `server.js` imports that file
  but it is absent from `git ls-files`.
- Impact: clean checkout/build failure or environment-dependent deployment where
  security behavior differs from the reviewed source tree.
- Fix: anchor runtime-data ignores (for example `/uploads/`), explicitly track
  source modules and add a clean-clone build/test job plus manifest validation.

## 6. Exploit-chain analysis

1. **Anonymous to exam administrator:** register as Instructor (F-01), enumerate
   candidate/attempt data (F-03/F-04), terminate or grade a foreign exam
   (F-03/F-06), then issue a trusted certificate (F-07).
2. **Answer theft to credential fraud:** low-privilege login, retrieve answer
   keys (F-04), submit a high score even after timing boundaries (F-06), then
   exploit weak issuance policy (F-07).
3. **No payment to paid entitlement:** create/guess an order, verify without a
   signature while substituting a course (F-02), access locked content and use
   it as certification evidence.
4. **Upload to account actions:** upload HTML (F-05), lure an authenticated user
   to the same-origin public file, fetch a CSRF token and make ambient-cookie
   authenticated requests. HttpOnly alone does not stop such same-origin code.
5. **Browser compromise to bulk data loss:** exploit any same-origin script path,
   read broad localStorage state (F-09), call unscoped analytics/signaling APIs
   (F-03/F-04), and retain access using an unrevoked token (F-08).
6. **Scale-out integrity failure:** distribute calls across replicas to evade
   Map-based limits while concurrent whole-state snapshots overwrite payment,
   assessment or privacy workflow changes (F-10/F-11).

## 7. Gap and compliance impact (G1-G6)

| Gap | Result | Likely governance impact |
|---|---|---|
| G1 Payment authenticity and reconciliation | Failed | Payment-integrity, consumer-protection and accounting controls; PCI DSS scope must still be documented even if card data remains provider-hosted. |
| G2 Upload/content security | Failed | Confidentiality and malware/content-distribution controls; OWASP A01/A05 and GDPR/DPDP security safeguards. |
| G3 Data-subject export/deletion | Failed | GDPR Arts. 5, 15, 17, 20 and 32; India DPDP/DPDPA access/correction/erasure and reasonable-safeguard obligations, subject to applicability and exemptions. |
| G4 Retention and evidence lifecycle | Failed | Storage limitation, deletion evidence, proctor-media policy and legal-hold governance. |
| G5 Availability/distributed enforcement | Failed | SOC 2-style logical access, processing integrity, availability and monitoring expectations; unreliable audit trails. |
| G6 Dependency and release assurance | Failed | OWASP A06 and secure-SDLC/SBOM/vulnerability-management expectations; clean-build reproducibility. |

## 8. Reproducible security regression suite

Run only the adversarial suite:

```powershell
npm run test:security
```

The suite is isolated by `vitest.security.config.ts` and uses a temporary
working directory. At assessment time all 14 assertions failed, which is the
expected red state for confirmed defects. Each should turn green as its control
is fixed; do not weaken the expected secure behavior to make a test pass.

Representative test mapping:

| Tests | Findings |
|---|---|
| SEC-001 | F-01 |
| SEC-002, SEC-003 | F-04 |
| SEC-004, SEC-005, SEC-013 | F-03 |
| SEC-006 | F-02 |
| SEC-007 | F-05 |
| SEC-008, SEC-012 | F-06 |
| SEC-009 | F-07 |
| SEC-010 | F-08 |
| SEC-011 | F-13 |
| SEC-014 | F-09 |

## 9. Remediation roadmap

### Release blockers (before any production launch)

1. Close F-01 through F-08 and F-13; rotate any deployed certificate/payment/JWT
   secrets after implementing fail-closed validation.
2. Remove public direct upload and deploy safe object handling on a separate
   origin; review existing stored objects.
3. Fix dependency critical/high findings and the ignored source module; prove a
   clean-clone build and run unit, integration and adversarial suites in CI.
4. Add tenant/resource authorization tests for every ID-bearing route in the
   attack-surface map, including negative cross-tenant cases.
5. Reconcile payment/certificate/exam records created under vulnerable builds.

### First 30 days

- Replace snapshot persistence with normalized transactional records and
  optimistic/row locking; deploy Redis-backed atomic limits and queues.
- Implement durable privacy and retention workflows with operational alerts.
- Centralize response DTOs, secret/log redaction and append-only audit export.
- Add structured security telemetry: authz denial spikes, role changes, unusual
  exam controls, payment mismatch/replay, certificate issuance and upload scans.
- Threat-model every external integration and test raw-body webhook verification.

### Strategic hardening

- Enterprise OIDC/SAML with MFA for staff, SCIM lifecycle and phishing-resistant
  step-up for high-impact actions.
- Managed secrets/KMS/HSM, automatic rotation and asymmetric certificate signing.
- WAF/CDN request budgets, bot protection and isolated media/download domains.
- SAST, secret scanning, dependency reachability, container/IaC scanning, SBOM,
  signed provenance and periodic independent penetration testing.
- AI input/output policy, tenant isolation, token/cost quotas, egress controls,
  provider data-retention agreements and prompt-injection monitoring.

## 10. Go/no-go criteria

Current result: **NO-GO**.

Release can be reconsidered only when all Critical and High findings have an
approved fix or explicitly accepted residual risk, the 14 adversarial tests are
green, a clean-clone production build passes, critical/high dependency exposure
is cleared, and payment/exam/certificate/privacy workflows pass negative and
concurrency testing in a production-like multi-instance environment.

## 11. Open questions requiring deployment evidence

- What tenant/organization boundary is intended, and which roles may cross it?
- Are staff accounts federated and MFA/step-up enforced outside this codebase?
- Which reverse proxy terminates TLS, normalizes client IPs and limits bodies?
- Are uploaded objects served from a separate origin with scanning and CSP?
- What are the authoritative Razorpay event types, refund flow and reconciliation SLA?
- Which data stores, backups and subprocessors must export/erase/retain each data class?
- Is the PostgreSQL JSON snapshot used in production, and can more than one API
  replica write concurrently?
- Where are audit logs exported, protected from modification and retained?
- Are certificate verification keys rotated/versioned and is revocation supported?
- What AI prompts/content may leave the organization, and under which DPA/retention terms?

