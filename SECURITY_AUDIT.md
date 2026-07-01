# Nalanda Production Readiness Security Audit

Date: 2026-06-22  
Scope: local repository at `E:\Nalanda`  
Method: static code/config review plus `npm audit`; no live staging environment or cloud configuration was available.

## 1. Executive Summary

Overall production readiness score: **38/100**  
Security score: **42/100**  
Availability/resilience score: **31/100**  
Data protection score: **34/100**

This application has several useful controls already present: HttpOnly cookie JWTs, CSRF checks, Helmet, schema validation on many routes, bcrypt password hashes, CORS allow-listing, basic rate limits, upload size/type limits, and a production JWT secret boot check. It is **not production-ready for paying customers tomorrow** because tenant/data isolation is incomplete, a real-looking API key exists in the local `.env`, demo credentials are present in frontend source, state management is in-memory with whole-state persistence, persistence failures are silent to clients, rate limiting is process-local, and monitoring/incident detection is minimal.

Top 10 risks:

1. **Authenticated users can fetch broad application data** through `/api/app-data`, including all users, courses, chapters, assignments, skills, target skills, skill ratings, settings, and chapter feedbacks.
2. **Google Gemini API key is present in local `.env`** and must be treated as exposed.
3. **Demo credentials are committed in frontend source** and shown in the login UI.
4. **Mutations can return success even when persistence fails**, causing silent data loss.
5. **Postgres storage is whole-application JSONB state**, not the relational RBAC schema in `database/schema.sql`; no database-level tenant constraints are enforced.
6. **Managers can assign courses to arbitrary user IDs** because assignment creation does not scope `userIds` to their team.
7. **Assessment start is not tied to enrollment/assignment**, so any eligible role can start any approved assessment by ID.
8. **Rate limiting is in-memory and weak for production**, so multi-process deployments, restarts, and distributed attacks bypass it.
9. **AI endpoints can be expensive under abuse**, with no per-day budget, org quota, provider circuit breaker, or prompt/content abuse policy.
10. **No verifiable production monitoring, alerting, backup, restore, or incident response implementation** exists in code.

Top 5 must-fix before production:

1. Replace `/api/app-data` with scoped, role-specific responses; never return unscoped collections.
2. Rotate `GEMINI_API_KEY`, remove real secrets from local/project files, and add secret scanning.
3. Remove frontend demo passwords/login shortcuts and force real bootstrap password rotation.
4. Make persistence transactional and request-coupled; fail requests if writes fail.
5. Move production persistence to normalized database tables or enforce row-level authorization in every query/mutation.

## 2. Architecture Understanding

Tech stack: Node.js ESM, Express 5, React 19, Vite 7, TypeScript frontend, Tailwind CSS, PostgreSQL driver, optional local JSON persistence.  
Frontend framework: React with Vite.  
Backend framework: Express.  
Database: intended PostgreSQL; actual runtime storage is an in-memory object graph saved either to `app_state(collection, data JSONB)` or `database/db.json`. The normalized PostgreSQL schema exists but is not used by backend routes.  
Authentication: username/email plus password, bcrypt hashes, JWT signed with `JWT_SECRET`, stored in HttpOnly cookie named `token`.  
Authorization model: roles: `Super Admin`, `Admin`, `Manager`, `Employee`; route-level `requireRole`; some object-level checks via `canManageCourse` and `visibleUserIdsFor`.  
Session/token handling: 30-minute JWT, session version claim `sv`, no refresh token, partial revocation on deactivation/deletion through in-memory/persisted `sessionVersions`.  
Storage providers: PostgreSQL JSONB or local JSON file; upload files are accepted in memory but only file field names are retained. No external object storage visible.  
Third-party APIs: Google Gemini via `@google/genai`.  
Payment providers: Cannot verify from current code; none found.  
File uploads: course creation accepts `pdf` and `video` plus image MIME types via `multer.memoryStorage`, 15 MB per file, max 5 files. Files are not durably stored.  
Queue/Redis/cache: Cannot verify from current code; none implemented.  
Deployment assumptions: Express serves built SPA from `frontend/dist`; Vite dev proxy in development; `NODE_ENV=production` required for secure cookies and JWT boot checks.  
Environment variables: `PORT`, `NODE_ENV`, `JWT_SECRET`, `ALLOWED_ORIGINS`, `SEED_*_PASSWORD`, `DATABASE_URL`, `PGSSL`, `PGPOOL_MAX`, `GEMINI_API_KEY`, `GEMINI_MODEL`.  
Background jobs/cron: Cannot verify from current code; none implemented.  
Admin/user roles: `Super Admin`, `Admin`, `Manager`, `Employee`.  
Multi-tenant/user data model: single-tenant org-style RBAC with manager/team scoping; no tenant/org ID. Multi-tenant SaaS isolation cannot be verified.

## 3. Critical and High Findings

### F1: `/api/app-data` leaks broad application data

Severity: **Critical**  
Affected code: `backend/server.js:2564-2591`

Why it matters: every authenticated user receives `users: users.map(publicUser)`, all `courses`, all `chapters`, all `assignments`, all `settings`, all `skills`, all `targetSkills`, all `skillRatings`, and all `chapterFeedbacks`. Only attempts/proctoring/reports/certificates/learning events are partly scoped.

Exploit scenario: a normal employee logs in and calls `GET /api/app-data`. They can enumerate every employee's name, email, department, manager structure, assignments, skill ratings, and unpublished course/chapter data.

Recommended fix:

- Delete the broad aggregate endpoint for non-admin users or split it into role-specific loaders.
- For employees return only self profile, assigned approved courses, relevant chapters, own assignments, own skill ratings, own certificates, own feedback.
- For managers return only direct reports and owned/approved courses.
- For admins keep broad access, but consider pagination and field-level minimization.

Acceptance criteria:

- Employee response contains no user records except self and no assignments except self.
- Manager response contains only self and direct reports.
- Pending/unapproved courses/assessments are not returned to employees.

Safe validation test:

- Login as `EMP-1004`; call `/api/app-data`; assert no `users[*].id` other than `EMP-1004`, no other users' assignments, no unapproved courses, no global settings.

### F2: Real-looking secret in `.env`

Severity: **Critical**  
Affected files: `.env:3`, `.gitignore:1-9`

Why it matters: `.env` is not tracked by git, but it exists in the workspace and contains a Google API key-looking value. If the machine, backup, artifact, screenshot, zip, or accidental commit leaks, attackers can burn provider quota or access allowed Gemini services.

Recommended fix:

- Rotate the Gemini key immediately in Google Cloud/AI Studio.
- Replace local `.env` with placeholder values.
- Add automated secret scanning: Gitleaks or GitHub secret scanning in CI.
- Treat any key that has ever lived in a local repo as compromised.

Acceptance criteria:

- Current key is revoked.
- Secret scanning finds no real provider keys.
- CI blocks commits containing key patterns.

Safe validation test:

- Run secret scan locally; verify the old key no longer authenticates.

### F3: Demo credentials are shipped in frontend source and UI

Severity: **High**  
Affected code: `frontend/src/seedData.ts:66-74`, `frontend/src/pages/Login.tsx:103-108`, `frontend/src/pages/Login.tsx:349-353`, `backend/server.js:208-227`

Why it matters: known credentials are present for Super Admin, Admin, Manager, and Employee demo accounts. Backend production mode randomizes seed passwords if env vars are missing, but the frontend still advertises known credentials and login IDs.

Exploit scenario: if production is misconfigured with dev seed passwords or non-production data is exposed, attackers can sign in as privileged users using source-visible credentials.

Recommended fix:

- Remove frontend password helpers and role shortcut login buttons from production builds.
- Remove plaintext passwords from `seedData.ts`; keep mock data behind dev-only fixtures.
- Require explicit bootstrap password rotation on first login.
- Add a production startup check that refuses to boot if any seeded account has a known demo password hash.

Acceptance criteria:

- No plaintext passwords in frontend or docs.
- Login UI does not list accounts or autofill passwords.
- Production boot fails if demo hashes are detected.

Safe validation test:

- Build production and verify no former demo passwords are present in `dist`.

### F4: Mutations succeed even when persistence fails

Severity: **High**  
Affected code: `backend/server.js:167-170`, `backend/server.js:435-454`, `backend/db.js:96-113`

Why it matters: mutations update memory and send responses before `persist()` is called on `finish`. `saveDb()` catches errors and only logs them. Clients can receive success while data is not durable. A restart after a failed write loses customer data.

Exploit/failure scenario: DB becomes unavailable. Admin creates users/courses; API returns success. Server restarts and all changes vanish.

Recommended fix:

- Move persistence into mutation handlers or a repository layer and `await` it before returning success.
- Return `503`/`500` on write failure.
- Add health/readiness checks that fail when storage writes fail.
- Avoid whole-state saves for high-write paths.

Acceptance criteria:

- Simulated DB write failure causes mutation response failure.
- No success response is emitted until durable write completes.
- Failed write increments structured error metrics/alerts.

Safe validation test:

- In local/staging, point `DATABASE_URL` to a DB, stop DB, call `POST /api/users`; expect non-2xx and no in-memory-only success.

### F5: Production data layer does not enforce relational isolation

Severity: **High**  
Affected code: `backend/db.js:80-107`, `backend/server.js:411-432`, `database/schema.sql`

Why it matters: the backend stores collections as JSONB blobs in `app_state`, not the normalized relational schema. There are no database foreign keys, row constraints, row-level security policies, or query-level tenant/user predicates in production paths.

Exploit/failure scenario: one authorization bug in application code exposes or mutates the entire state collection. Concurrent saves overwrite whole collections.

Recommended fix:

- Implement repository methods against normalized tables in `database/schema.sql`.
- Add DB constraints and foreign keys for all mutable entities.
- Add tenant/org columns before multi-tenant SaaS launch.
- Consider PostgreSQL RLS if multiple tenants are added.

Acceptance criteria:

- Routes no longer read/write full global arrays for business entities.
- DB constraints reject invalid foreign keys.
- Authorization tests exist for every object-level route.

Safe validation test:

- Attempt to assign a non-existent user/course; DB rejects it.
- Attempt manager access to non-team user/course; API rejects before query or query returns zero rows.

### F6: Manager assignment can target arbitrary users

Severity: **High**  
Affected code: `backend/server.js:1313-1341`

Why it matters: route requires `Admin` or `Manager`, but it does not verify that `courseId` exists, that the manager owns/can assign the course, or that `userIds` belong to the manager's team.

Exploit scenario: a manager posts arbitrary employee IDs and assigns courses to users outside their team, creating records and noise across the company.

Recommended fix:

- Validate course exists.
- Require `canManageCourse(req.user, course)` for managers.
- Restrict manager `userIds` to `visibleUserIdsFor(req.user)` excluding unrelated employees.
- Prevent duplicate assignments with unique constraints.

Acceptance criteria:

- Manager cannot assign to users outside direct reports.
- Non-existent course/user IDs are rejected.
- Duplicate assignments return conflict or idempotent existing records.

Safe validation test:

- Login as `EMP-1002`; attempt to assign course to `EMP-1004` if not direct report; expect `403`.

### F7: Assessment attempts are not enrollment-scoped

Severity: **High**  
Affected code: `backend/server.js:1457-1463`

Why it matters: any `Employee`, `Manager`, or `Admin` can start any approved assessment by ID. There is no check that the assessment belongs to an assigned course, active course, visible course, or completed prerequisite.

Exploit scenario: an employee guesses or obtains an assessment ID and takes assessments outside their enrollment path, possibly exposing questions and corrupting analytics.

Recommended fix:

- Require active assignment/enrollment for employees.
- Require course approval/status checks.
- Restrict managers to owned courses or assigned self/team rules.
- Rate-limit attempt starts.

Acceptance criteria:

- Unassigned employee receives `403` for approved assessments outside assigned courses.
- Inactive/rejected course assessments cannot be started.

Safe validation test:

- Login as an employee not assigned to a course; call `POST /api/assessments/:id/attempts/start`; expect `403`.

### F8: Client-controlled learning/assessment time can be inflated

Severity: **High**  
Affected code: `backend/server.js:1466-1501`, `backend/server.js:1638-1664`, `backend/server.js:672-680`

Why it matters: clients submit arbitrary positive `seconds` for chapter time and `timeSpentSeconds` for assessment time. There is no upper bound, server-side elapsed cap, replay protection, or rate per chapter.

Exploit scenario: user sends one request with a huge `seconds` value and satisfies minimum time gates or corrupts compliance reports.

Recommended fix:

- Cap submitted increments to elapsed wall-clock since last heartbeat.
- Store server timestamps per session/chapter.
- Reject unreasonable values, duplicates, and high-frequency submissions.

Acceptance criteria:

- A single request cannot add more than a small bounded interval.
- Assessment time cannot exceed server-observed elapsed attempt duration.

Safe validation test:

- Submit `{seconds: 999999}`; expect `400` or clamped value with audit log.

## 4. Question-by-Question Answers

Legend: `Pass` means code proves a reasonable control; `Partial` means some controls exist but important gaps remain; `Fail` means confirmed unsafe behavior; `Cannot Verify` means not visible in code/config.

### A. Tenant Isolation & Authorization

| Question | Status | Severity | Evidence | Risk | Fix/Test |
|---|---:|---:|---|---|---|
| Can a user access resources that belong to another user? | Fail | Critical | `backend/server.js:2564-2591` | Employees receive broad data. | Scope `/api/app-data`; test employee payload. |
| Are all DB queries scoped by user/tenant/org? | Fail | High | Global arrays; `backend/db.js:80-107` | No DB-level isolation. | Repository methods with scoped predicates; authz tests. |
| Are object IDs guessable? | Partial | Medium | IDs like `EMP-1001`, `CRS-*`, random 4 digits | Enumeration easier. | Use UUIDs/opaque IDs; test ID guessing. |
| Can users modify another user's records by changing ID? | Partial | High | Good: attempts submit checks user ID; bad: assignments arbitrary IDs. | Cross-team assignment/mutation. | Object-level checks on every route. |
| Are admin-only routes protected server-side? | Partial | High | `requireRole` used; broad `/api/app-data` leaks admin data. | UI hidden controls are not enough. | Scope aggregate endpoint. |
| Are role checks enforced at API/backend layer? | Partial | High | `requireRole` exists at `backend/server.js:549-554` | Some object checks missing. | Add route+object authorization matrix. |
| Is there IDOR? | Fail | Critical | `/api/app-data`, assessment start, assignment route | Data leakage and unauthorized actions. | Add object ownership/enrollment checks. |

### B. Authentication & Token Safety

| Question | Status | Severity | Evidence | Risk | Fix/Test |
|---|---:|---:|---|---|---|
| If attacker steals JWT/session token? | Partial | High | `backend/server.js:524-540` | Usable until 30 min or sessionVersion change. | Add device/session table, revoke all, MFA for admins. |
| Is token expiry short enough? | Pass | Low | `expiresIn: "30m"` | 30 min reasonable. | Verify cookie expiry. |
| Refresh token rotation? | Cannot Verify | Medium | None found | No long-lived session design. | Implement if persistent sessions required. |
| Can tokens be revoked? | Partial | Medium | sessionVersions on deactivate/delete | No per-session revoke/logout server invalidation. | Store session IDs and revocation list. |
| Are tokens stored safely? | Partial | Medium | HttpOnly cookie at login | Secure only when `NODE_ENV=production`. | Enforce production env/HTTPS. |
| Cookies HttpOnly/Secure/SameSite? | Partial | Medium | `backend/server.js:80-81`, `832` | Secure depends on env; SameSite lax. | Production config tests. |
| Session fixation protection? | Partial | Low | New JWT on login | No explicit cookie name rotation issue seen. | Test old cookie replaced. |
| Password reset flows safe? | Cannot Verify | High | No reset flow | Unknown. | Build tokenized reset with rate limits. |
| Email verification/account recovery abuse-resistant? | Cannot Verify | High | None found | Unknown. | Add verified email flow and abuse controls. |
| MFA for admins? | Fail | High | No MFA found | Admin compromise high blast radius. | Require MFA/WebAuthn/TOTP for admins. |

### C. Rate Limiting & Abuse Resistance

| Question | Status | Severity | Evidence | Risk | Fix/Test |
|---|---:|---:|---|---|---|
| 10,000 requests/min? | Fail | High | In-memory 600/min/IP `backend/server.js:146-165` | Per-process bypass, memory pressure. | Redis/API gateway limiter; load test. |
| Login/signup/reset/OTP/contact/public limited? | Partial | High | Login limited; no signup/reset/OTP/contact | Login lockout can be abused for DoS. | Per-account+IP+captcha after threshold. |
| Expensive endpoints protected? | Partial | High | AI has 15/min/user | No daily quota/cost caps. | Add budget quotas and circuit breaker. |
| AI/API cost abuse protected? | Partial | High | `aiRateLimit` only | Stolen account can burn quota. | Per-day spend caps and admin alerts. |
| Per-user, per-IP, per-route limits? | Partial | Medium | Global IP and AI user limit | Not distributed. | Central rate-limit store. |
| Bot/spam protections needed? | Partial | Medium | No bot controls | Login brute force/signaling abuse. | CAPTCHA/risk-based throttles. |
| Can one user overload shared infra? | Fail | High | AI streaming up to 20 chapters; whole-state persistence | CPU/API/DB pressure. | Queues, concurrency limits. |

### D. Public Repository & Secret Exposure

| Question | Status | Severity | Evidence | Risk | Fix/Test |
|---|---:|---:|---|---|---|
| If GitHub repo public, what exposed? | Fail | High | `seedData.ts`, docs, schema, package lock | Demo creds, architecture, internal logic. | Remove creds, review docs. |
| Are `.env` files committed? | Pass | Medium | `git ls-files` shows not tracked; `.gitignore` includes `.env` | Local secret still exists. | Secret scan. |
| Keys/secrets/private keys in code? | Fail | Critical | `.env:3`; frontend demo passwords | Provider key and passwords. | Rotate/remove. |
| Secrets printed in logs? | Partial | Medium | Error messages log provider errors | Cannot prove provider never includes sensitive data. | Sanitize logs. |
| Example env files safe? | Pass | Low | `.env.example` empty secrets | OK. | Keep placeholders. |
| Build artifacts leaking data? | Cannot Verify | Medium | `frontend/dist` absent | Need production build review. | Build and scan dist. |
| Source maps expose secrets/internal logic? | Partial | Low | Vite default no production sourcemap in config | Internal logic still in JS bundle. | Confirm build config and scan. |

### E. Input Validation & Injection Risks

| Question | Status | Severity | Evidence | Risk | Fix/Test |
|---|---:|---:|---|---|---|
| Unexpected data? | Partial | Medium | Many Zod schemas; some `z.any`/unbounded objects | Data pollution, huge nested payloads. | Strict schemas. |
| Request bodies schema validated? | Partial | Medium | Most routes use Zod | Some broad records. | Add schemas everywhere. |
| Query params validated? | Partial | Low | Simple filtering only | Type confusion, unexpected filters. | Validate queries with Zod. |
| File names/IDs/emails/prices/dates validated? | Partial | Medium | Emails yes; IDs/status partial; dates weak | Bad references and reporting errors. | Strong validators. |
| SQL/NoSQL injection risk? | Partial | Medium | Parameterized PG in storage | JSONB whole-state avoids dynamic SQL but design unsafe. | Use parameterized repositories. |
| Command injection risk? | Pass | Low | No command execution found | Low from current code. | Keep no shelling out. |
| SSRF risk? | Cannot Verify | Medium | No server fetch to user URLs found | Future video/link handling could add risk. | URL allow-list if fetching. |
| XSS risk? | Partial | High | Server sanitizer regex; client `dangerouslySetInnerHTML` | Regex sanitizer may miss malformed HTML. | Use DOMPurify/sanitize-html server-side. |
| Template injection risk? | Cannot Verify | Medium | No templates found | Unknown. | Avoid server templates. |
| Error messages leaking internals? | Partial | Medium | Central handler generic; AI stream sends `detail` | Provider/internal error details may leak. | Remove detailed errors in prod. |

### F. Account Compromise Impact

Normal user compromise: access to `/api/app-data` currently leaks organization-wide metadata.  
Admin compromise: full user/course/assessment/certificate/settings/audit access; no MFA or re-auth.

| Question | Status | Severity | Evidence/Risk/Fix |
|---|---:|---:|---|
| Normal user compromised? | Fail | Critical | Broad app-data leakage; scope data. |
| Admin compromised? | Fail | Critical | Admin can mutate critical state; add MFA, re-auth, approvals. |
| Export all data? | Partial | High | Reports are role-scoped, but app-data broad. |
| Delete business-critical data? | Partial | High | Admin/manager can delete manageable courses/assessments; archives exist. |
| Change billing/bank/payout/business settings? | Cannot Verify | High | No payment/billing code found. |
| Sensitive actions re-authenticated? | Fail | High | No re-auth for delete/password/role/settings. |
| Account changes logged? | Partial | Medium | `audit()` logs but capped/in-app only. |
| Unusual activity detected? | Fail | Medium | No detection/alerts. |
| Owner recover control? | Cannot Verify | High | No recovery flow. |

### G. Third-Party Package & Supply Chain Risk

`npm audit` reports **1 low vulnerability**: `esbuild` arbitrary file read in dev server on Windows, fix available. Dependency count: **367 total**, **198 production**, **168 dev**, **76 optional**.

Security-sensitive packages: `express`, `jsonwebtoken`, `bcryptjs`, `cookie-parser`, `cors`, `helmet`, `multer`, `pg`, `@google/genai`, `vite`, `esbuild`.

| Question | Status | Severity | Evidence/Risk/Fix |
|---|---:|---:|---|
| How many packages? | Pass | Low | 367 total from `npm audit`. |
| Security-sensitive packages? | Pass | Medium | Listed above. |
| Known vulnerable packages? | Partial | Low | `esbuild` low vuln; run `npm audit fix`. |
| Unused packages present? | Cannot Verify | Low | Needs depcheck/manual use analysis. |
| Packages pinned? | Partial | Medium | lock file exists; package uses many `^` ranges. |
| Lock files committed? | Pass | Low | `package-lock.json` tracked. |
| Install scripts risky? | Cannot Verify | Medium | No package script audit performed. |
| Maintained? | Cannot Verify | Medium | Need package health review. |
| Dependency scanning configured? | Cannot Verify | Medium | No CI visible. |
| Package compromise expose secrets/data? | Fail | High | Server has env secrets and whole data state in process. |

### H. File Upload Security

| Question | Status | Severity | Evidence/Risk/Fix |
|---|---:|---:|---|
| Arbitrary files? | Partial | Medium | MIME allow-list only, `backend/server.js:49-59`. |
| File types restricted? | Partial | Medium | Client-provided MIME checked; no magic-byte verification. |
| MIME verified server-side? | Fail | Medium | Uses `file.mimetype`; verify signatures. |
| File size limited? | Pass | Low | 15 MB/file, 5 files. |
| Scanned/sanitized? | Fail | High | No AV/CDR/image re-encode. |
| Executables allowed? | Partial | Medium | MIME rejects obvious executables; spoofing possible. |
| SVG/HTML XSS upload? | Pass/Partial | Medium | SVG/HTML MIME not allowed, but verify bytes. |
| Stored outside web root? | Partial | Low | Files not stored. |
| File URLs auth protected? | Cannot Verify | Medium | No durable file URLs implemented. |
| User access other's uploads? | Cannot Verify | Medium | No storage implemented. |
| Path traversal protection? | Partial | Low | Memory storage avoids paths. |
| Image libs malformed attacks? | Cannot Verify | Medium | No image processing found. |

### I. Redis / Cache / Queue Failure

Cannot verify Redis/cache/queue from current code; none is implemented. Rate limits are in process, so restarts clear limits and multi-instance deployments have independent buckets. Background jobs are not visible.

### J. Database Failure & Data Protection

| Question | Status | Severity | Evidence/Risk/Fix |
|---|---:|---:|---|
| DB unavailable? | Fail | High | Startup fails, but runtime save failure is swallowed. |
| Errors graceful? | Partial | Medium | Central handler exists; save failures hidden. |
| App crash? | Partial | Medium | Startup exits on init failure; runtime may continue unsafe. |
| Retries controlled? | Fail | Medium | No retry/backoff around storage writes. |
| Connection pooled safely? | Partial | Medium | `pg.Pool max` exists; whole-state writes heavy. |
| Migrations safe? | Cannot Verify | Medium | Schema exists; backend auto-creates only `app_state`. |
| Backups configured? | Cannot Verify | High | Docs mention, no infra. |
| PITR? | Cannot Verify | High | Docs mention, no infra. |
| Encryption at rest? | Cannot Verify | High | Depends on provider. |
| Encryption in transit? | Partial | High | `PGSSL=require` option; not enforced. |
| Soft deletes/recoverable? | Partial | Medium | Archives for users/courses/assessments, not all entities. |
| Audit logging critical changes? | Partial | Medium | In-memory/persisted capped audit log. |

### K. Third-Party API Failure

Google Gemini has timeout wrappers in some paths (`backend/server.js:98-102`, `1810-1818`, `2057-2070`), fallback in generation paths, and explicit 503 for AI chat without key. No circuit breaker, bounded retries, provider isolation, or alerting is visible.

### L. Monitoring, Logging & Incident Detection

| Question | Status | Severity | Evidence/Risk/Fix |
|---|---:|---:|---|
| Would we know if attacked? | Fail | High | No alerting/SIEM metrics visible. |
| Failed logins logged? | Partial | Medium | loginSecurity state, but no audit event on failures. |
| Authorization failures logged? | Fail | Medium | 403s not audited centrally. |
| Suspicious spikes logged? | Fail | Medium | Rate limiter does not log/alert. |
| Admin actions logged? | Partial | Medium | `audit()` used broadly. |
| Payment/security events logged? | Cannot Verify | High | No payment; security events incomplete. |
| Structured/searchable logs? | Fail | Medium | console strings, in-app arrays. |
| Alerts configured? | Cannot Verify | High | None visible. |
| Uptime monitoring? | Cannot Verify | High | `/api/health` only. |
| Error tracking? | Cannot Verify | Medium | None visible. |
| Logs redact secrets/PII? | Partial | High | No central redaction policy. |

## 5. Production Failure Readiness

| Scenario | Expected behavior | Current behavior from code | Risk | Required fix | Safe test |
|---|---|---|---:|---|---|
| Traffic increases 100x | Backpressure, scale, no data leakage | In-memory arrays, whole-state saves, per-process rate limits | High | Distributed limiter, DB repositories, load tests | k6/Artillery 100x read/write mix |
| Database slow | Timeouts, 503, circuit breaker | PG connection timeout only; writes after response; no readiness fail | High | Await writes, expose degraded readiness | Inject DB latency |
| Redis slow | Degrade/fail closed | No Redis | Cannot Verify | Add Redis only with failure policy | Simulate Redis outage after implementation |
| Email/SMS/WhatsApp fails | Queue/retry/fallback | None visible | Cannot Verify | Add provider abstraction | Mock provider 500s |
| Payment provider fails | No double charge, clear state | No payment provider | Cannot Verify | Payment idempotency if added | Provider sandbox failure |
| Storage provider fails | Upload fails safely | Files only in memory and discarded | Medium | Durable object storage with error handling | Force storage 500 |
| Attacker controls input | Validation, sanitization, audit | Partial Zod, regex HTML sanitizer | High | Strict schemas and robust HTML sanitizer | Fuzz payloads |
| Background jobs stop | Alert and recover | No jobs visible | Cannot Verify | Queue monitoring | Stop worker |
| Deployment partially fails | Health gates/rollback | Cannot verify deployment infra | High | CI/CD health checks, migrations | Blue/green failure drill |
| Env vars missing | Fail closed for prod JWT; AI degrades partly | `DATABASE_URL` missing falls back to file | High | Refuse production boot without DB/secrets | Boot prod with missing vars |
| Two users update same record | Optimistic concurrency | Last write wins in memory | High | Version checks/transactions | Concurrent update test |
| Server restarts mid-operation | Durable transaction or rollback | In-memory state can lose completed responses | High | Await durable write before response | Kill server during mutation |

## 6. OWASP & Production Checklist

Broken Access Control: **Fail** (`/api/app-data`, assignment scoping, assessment start).  
Cryptographic Failures: **Partial** (HttpOnly JWT; secret exposure; PG TLS not enforced).  
Injection: **Partial** (parameterized PG; broad `z.any`; regex sanitizer).  
Insecure Design: **Fail** (global state, broad aggregate endpoint, demo creds).  
Security Misconfiguration: **Fail** (`.env` secret; production DB fallback possible).  
Vulnerable/Outdated Components: **Partial** (1 low `esbuild`; scanning absent).  
Identification/Auth Failures: **Partial** (no MFA, reset/recovery absent).  
Software/Data Integrity Failures: **Fail** (whole-state persistence, silent write failure).  
Security Logging/Monitoring Failures: **Fail**.  
SSRF: **Cannot Verify**; no server-side user URL fetch found.

Additional checklist:

- CSRF: **Partial/Pass** double-submit cookie exists.
- CORS: **Partial/Pass** allow-list exists; non-browser no-origin allowed.
- Security headers: **Pass** via Helmet, CSP specifics not reviewed.
- CSP: **Partial** Helmet default; app-specific CSP cannot verify.
- Clickjacking: **Pass/Partial** Helmet default frame protections.
- HTTPS enforcement: **Cannot Verify**; cookies secure only in production.
- Cookie security: **Partial**.
- API versioning: **Fail**; no `/api/v1`.
- Request size limits: **Partial** JSON 2 MB; upload 15 MB.
- File size limits: **Pass**.
- Error boundaries: **Cannot Verify** frontend UX only.
- Admin route protection: **Partial** route-level yes, object/data gaps.
- Backup/recovery: **Cannot Verify**.
- Secrets management: **Fail**.
- CI/CD safety: **Cannot Verify**.

## 7. Secrets & Public Repo Exposure Review

Confirmed if repository/workspace becomes public:

- Local `.env` contains a Google API key-looking value. It is not tracked by git, but it is present in the project directory.
- Frontend source includes demo passwords: `frontend/src/seedData.ts:66-74`, `frontend/src/pages/Login.tsx:103-108`.
- Login UI lists active users and login IDs via `frontend/src/pages/Login.tsx:349-353`.
- Docs expose architecture and required secrets but not secret values.
- `database/acharya-feedback.json` is tracked; review contents for customer feedback before public release.

Cannot verify from current code: cloud secrets, deployment variables, provider dashboards, production logs, build artifacts.

## 8. Data Access & Multi-Tenant Isolation Review

Users cannot be confirmed to access only their own data. The opposite is confirmed for `/api/app-data`. There is no `tenantId` or `organizationId` model. Manager scoping exists in helpers, but not consistently applied to all routes. Production storage does not use database row filters or relational constraints.

## 9. Availability & Abuse Resistance Review

Rate limits are in-memory and reset on restart. They do not work across multiple Node instances. Expensive AI routes have 15/min/user but no daily budgets or concurrency caps. Persistence writes serialize whole app state and are not awaited before success. No queue, Redis, circuit breaker, uptime monitoring, alerting, or structured log pipeline is visible.

## 10. Remediation Roadmap

Fix within 24 hours:

- Rotate `GEMINI_API_KEY`; remove real `.env` values.
- Remove login demo credential autofill/listing from production.
- Lock down `/api/app-data` or disable it for non-admins.
- Add explicit production boot requirement: `NODE_ENV=production`, strong `JWT_SECRET`, `DATABASE_URL`, `PGSSL=require`.
- Run `npm audit fix` for the low `esbuild` issue.

Fix within 3 days:

- Add object-level authorization tests for every API route.
- Fix manager assignment scoping and assessment enrollment checks.
- Await persistence writes before returning success.
- Add server-side caps to learning/assessment time.
- Replace regex HTML sanitizer with a maintained sanitizer.

Fix within 7 days:

- Implement distributed rate limiting with Redis or gateway.
- Add admin MFA and re-auth for destructive/sensitive actions.
- Add structured security logging for login failures, 403s, rate limits, admin actions.
- Add CI secret scanning and dependency scanning.

Fix before production launch:

- Move runtime storage to normalized PostgreSQL tables or equivalent repository layer.
- Add backup/restore/PITR verification and documented drills.
- Add monitoring, alerts, uptime checks, and error tracking.
- Add load tests and failure drills for DB/provider outages.

Fix after launch but before scale:

- Add API versioning.
- Add per-tenant/org model if sold as multi-tenant SaaS.
- Add queues for report/AI generation.
- Add anomaly detection for account compromise and abuse.

## 11. Engineering Backlog

1. **Scope `/api/app-data` responses**  
   Priority: P0  
   Story: As an authenticated user, I only receive data I am authorized to see.  
   Acceptance: employee/manager/admin fixtures prove correct scoping.  
   Files: `backend/server.js`, frontend data loaders.  
   Approach: replace global aggregate with role-aware DTO builder.

2. **Rotate and remove exposed secrets**  
   Priority: P0  
   Story: As an operator, secrets never live in source/workspace artifacts.  
   Acceptance: old Gemini key revoked; secret scanner passes.  
   Files: `.env`, CI config.  
   Approach: environment secret manager plus Gitleaks.

3. **Remove demo credentials from production UI/source**  
   Priority: P0  
   Acceptance: production bundle contains no known passwords/login shortcuts.  
   Files: `frontend/src/seedData.ts`, `frontend/src/pages/Login.tsx`, backend seed code.  
   Approach: dev-only fixtures behind env flag.

4. **Make writes durable before success**  
   Priority: P0  
   Acceptance: DB save failure returns non-2xx and no false success.  
   Files: `backend/server.js`, `backend/db.js`.  
   Approach: repository layer or awaited `persistOrFail()`.

5. **Fix assignment authorization**  
   Priority: P0  
   Acceptance: managers cannot assign outside direct reports or invalid course/users.  
   Files: `backend/server.js:1313-1341`.  
   Approach: validate course/user existence and visible user IDs.

6. **Require enrollment for assessment attempts**  
   Priority: P0  
   Acceptance: unassigned employee cannot start approved assessment.  
   Files: `backend/server.js:1457-1463`.  
   Approach: check active assignment and course status.

7. **Cap client-reported learning time**  
   Priority: P1  
   Acceptance: unrealistic seconds rejected/clamped and audited.  
   Files: `backend/server.js:1466-1501`, `1638-1664`.  
   Approach: server heartbeat sessions and elapsed caps.

8. **Replace sanitizer**  
   Priority: P1  
   Acceptance: XSS test corpus blocked.  
   Files: `backend/server.js:511-521`, frontend rich text rendering.  
   Approach: `sanitize-html` or DOMPurify with explicit allow-list.

9. **Add distributed rate limiting and AI quotas**  
   Priority: P1  
   Acceptance: limits shared across instances; daily AI budget enforced.  
   Files: `backend/server.js`.  
   Approach: Redis-backed limiter and quota table.

10. **Add security monitoring and alerts**  
    Priority: P1  
    Acceptance: failed login spikes, 403 spikes, admin destructive actions alert.  
    Files: backend logging middleware, deployment/observability config.  
    Approach: structured logs to SIEM/error tracker.

11. **Normalize production persistence**  
    Priority: P1  
    Acceptance: routes use tables from `database/schema.sql`; no full-state JSONB writes.  
    Files: `backend/db.js`, route repositories, migrations.  
    Approach: phased repository migration with tests.

12. **Admin MFA and sensitive-action re-auth**  
    Priority: P1  
    Acceptance: admin role changes/deletes/settings require recent auth + MFA.  
    Files: auth routes, frontend admin flows.  
    Approach: TOTP/WebAuthn and `lastAuthAt` checks.
