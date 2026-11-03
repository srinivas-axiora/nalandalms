# Nalanda attack-surface and route-control map

Assessment date: 2026-11-01 (Asia/Calcutta)

This map reflects the Express routes in the local workspace, not only the routes
described in documentation. `Candidate` is not an authenticated account role;
external candidates use a share-link token and an attempt token.

The table is also the source for the machine-readable inventory. Run
`npm run routes:inventory` to emit normalized JSON. The authorization contract
test fails when a registered route has no row or when observed authentication
or step-up middleware disagrees with its declaration.

## Control legend

- Auth: `Public`, `Any` authenticated user, `SA` Super Admin, `A` Admin,
  `M` Manager, `I` Instructor, `E` Employee, `L` Learner.
- CSRF: `Y` means the global double-submit middleware applies. `Exempt` means
  the route is explicitly excluded. `N/A` is a safe-method request.
- Step: `Y` means `requireStepUp` is present.
- Rate: `G` is the Redis-backed global `/api` budget (600/minute/IP); `AI` is
  the additional Redis-backed 15/minute/user budget in production. Non-API routes and public
  `/uploads` are outside `G`.
- Scope flags identify missing or incomplete object-level authorization.
- All state-changing `/api` routes use CSRF unless marked Exempt. Because CSRF
  runs before the global limiter, rejected mutation floods are not rate limited.

## System, authentication and users

| Method | Route | Auth | State | CSRF | Step | Rate | Scope / concern |
|---|---|---|---:|---|---:|---|---|
| GET | `/api/health` | Public | N | N/A | N | G | Liveness, version, uptime and process memory |
| GET | `/api/ready` | Public | N | N/A | N | G | Sanitized database, Redis and object-store readiness |
| GET | `/api/csrf-token` | Public | Cookie | N/A | N | G | Token returned in body intentionally |
| GET | `/api/app-data` | Any | N | N/A | N | G | Primary scoped aggregate; large response |
| GET | `*splat` | Public | N | N/A | N | None | Frontend fallback; API paths return JSON 404 |
| POST | `/api/auth/register` | Public | Y | Y | N | G + login map | Allows public Instructor self-assignment |
| POST | `/api/auth/login` | Public | Y | Y | N | G + login map | Identifier lockout enables victim DoS |
| POST | `/api/auth/logout` | Any | Cookie | Y | N | G | Authenticated logout rotates session version and revokes the presented JWT |
| POST | `/api/auth/forgot-password` | Public | Y | Y | N | G | No production delivery implementation shown |
| POST | `/api/auth/reset-password` | Public token | Y | Y | N | G | Reset bumps session version |
| POST | `/api/auth/reauth` | Any | Cookie | Y | N | G | Issues 10-minute step-up token |
| GET | `/api/auth/me` | Any | N | N/A | N | G | Session identity |
| PATCH | `/api/users/me/preferences` | Any | Y | Y | N | G | Self-scoped |
| GET | `/api/users` | A/M | N | N/A | N | G | Manager direct-report scope implemented |
| POST | `/api/users` | A | Y | Y | Y | G | Privileged account creation requires recent re-authentication |
| PATCH | `/api/users/:id` | A | Y | Y | Y | G | Password hash copied into audit metadata |
| PATCH | `/api/users/:id/status` | A | Y | Y | Y | G | Deactivation revokes; activation does not rotate |
| DELETE | `/api/users/:id` | SA | Y | Y | Y | G | Archive retains full user including hash |

## Courses, chapters, enrollment and cohorts

| Method | Route | Auth | State | CSRF | Step | Rate | Scope / concern |
|---|---|---|---:|---|---:|---|---|
| GET | `/api/catalog` | Public | N | N/A | N | G | Approved active course metadata |
| POST | `/api/courses/:id/enroll` | Any | Y | Y | N | G | No prerequisite enforcement or DB uniqueness |
| GET | `/api/courses` | Any | N | N/A | N | G | Role-scoped through `coursesVisibleTo` |
| POST | `/api/courses` | A/M | Y | Y | N | G | Multipart MIME trusted; files become public |
| PUT | `/api/courses/:id` | A/M | Y | Y | N | G | Ownership checked; no optimistic locking |
| POST | `/api/courses/:id/duplicate` | A/M | Y | Y | N | G | Missing source-course ownership check |
| PATCH | `/api/courses/:id/approval` | A | Y | Y | N | G | Sensitive approval lacks step-up |
| PATCH | `/api/courses/:id/status` | A | Y | Y | Y | G | Step-up present |
| DELETE | `/api/courses/:id` | A/M | Y | Y | Y | G | Ownership checked; cascades in arrays |
| GET | `/api/courses/:courseId/chapters` | Any | N | N/A | N | G | Locked chapters still return body/URLs |
| POST | `/api/courses/:courseId/chapters` | A/M | Y | Y | N | G | Ownership and HTML sanitization present |
| PUT | `/api/courses/:courseId/chapters/:chapterId` | A/M | Y | Y | N | G | Ownership and sanitization present |
| POST | `/api/courses/:courseId/chapters/:chapterId/progress` | Any | Y | Y | N | G | No enrollment, chapter existence or bounds check |
| POST | `/api/courses/:courseId/chapters/:chapterId/time` | Any | Y | Y | N | G | Access and increment cap present |
| GET | `/api/courses/:courseId/chapters/:chapterId/progress` | Any | N | N/A | N | G | No explicit enrollment check |
| POST | `/api/courses/:courseId/chapters/:chapterId/heartbeat` | Any | Y | Y | N | G | Service access checks; replay/concurrency risk |
| POST | `/api/assignments` | A/M | Y | Y | N | G | Manager/direct-report scoping present |
| POST | `/api/cohorts` | A/M/I | Y | Y | N | G | Course ownership check present |
| GET | `/api/cohorts` | Any | N | N/A | N | G | Scoped listing |
| GET | `/api/cohorts/:id` | Any | N | N/A | N | G | Missing membership/ownership check; leaks invite code |
| POST | `/api/cohorts/join` | Any | Y | Y | N | G | Capacity check is race-prone |
| GET | `/api/cohorts/:id/analytics` | Any | N | N/A | N | G | Owner/admin check present |

## Assessments and external candidates

| Method | Route | Auth | State | CSRF | Step | Rate | Scope / concern |
|---|---|---|---:|---|---:|---|---|
| GET | `/api/assessments` | Any | N | N/A | N | G | Normal learner view strips answers |
| POST | `/api/assessments` | A/M | Y | Y | N | G | Course ownership check present |
| PUT | `/api/assessments/:id` | A/M | Y | Y | N | G | Target-course ownership checked |
| PATCH | `/api/assessments/:id/status` | A/M | Y | Y | Y | G | Manager ownership check missing |
| DELETE | `/api/assessments/:id` | A/M | Y | Y | Y | G | Course ownership checked |
| PATCH | `/api/assessments/:id/approval` | A | Y | Y | N | G | Sensitive approval lacks step-up |
| POST | `/api/assessments/:id/attempts/start` | A/M/I/E/L | Y | Y | N | G | Enrollment/progression check for non-admin |
| GET | `/api/assessments/attempts/:attemptId/questions` | Any | N | N/A | N | G | Central attempt view policy; answer keys remain server-only |
| POST | `/api/assessments/attempts/:attemptId/answer` | Any | Y | Y | N | G | Owner-only; database-clock and optimistic-version guard in relational mode |
| POST | `/api/assessments/attempts/:attemptId/submit` | Any | Y | Y | N | G | Owner-only; deadline and duplicate submit enforced server-side |
| GET | `/api/assessments/attempts/pending-review` | A/M/I | N | N/A | N | G | Manager sees all; Instructor listing partly scoped |
| POST | `/api/assessments/attempts/:attemptId/grade` | A/M/I | Y | Y | Y | G | Central owner/assigned-proctor policy plus step-up |
| GET | `/api/assessments/question-library` | A | N | N/A | N | G | Answer-bearing authoring view is administrator-only |
| POST | `/api/candidate-assessments` | A/M/I | Y | Y | N | G | Source assessment ownership check missing |
| GET | `/api/candidate-assessments` | Any | N | N/A | N | G | Creator/admin filter present |
| GET | `/api/candidate-assessments/analytics/:id` | Any | N | N/A | N | G | No role/ownership check; exposes PII/answers |
| GET | `/api/candidate-assessments/:id` | Any | N | N/A | N | G | Creator/admin check present |
| PATCH | `/api/candidate-assessments/:id/status` | Any | Y | Y | Y | G | Creator/admin scope plus step-up |
| DELETE | `/api/candidate-assessments/:id` | Any | Y | Y | Y | G | Creator/admin scope plus step-up |
| GET | `/api/public/candidate-assessments/:token` | Public token | N | N/A | N | G | Checks status and expiry |
| POST | `/api/public/candidate-assessments/:token/start` | Public token | Y | Exempt | N | G | Does not check expiry; email rule is bypassable identity |
| POST | `/api/public/candidate-assessments/:token/event` | Public attempt token | Y | Exempt | N | G | Client controls event/severity/confidence |
| POST | `/api/public/candidate-assessments/:token/submit` | Public attempt token | Y | Exempt | N | G | No server deadline enforcement; descriptive >10 chars passes |

## Proctoring and signaling

| Method | Route | Auth | State | CSRF | Step | Rate | Scope / concern |
|---|---|---|---:|---|---:|---|---|
| POST | `/api/proctoring/attempts/:attemptId/events` | Any | Y | Y | N | G | Central attempt policy; event/trust/audit transaction in relational mode |
| POST | `/api/proctoring/events` | Any | Y | Y | N | G | Same backward-compatible weakness |
| GET | `/api/proctoring/attempts/:attemptId/events` | Any | N | N/A | N | G | Central attempt view policy |
| POST | `/api/proctoring/attempts/:attemptId/chunks` | Public token | Y | Exempt | N | G | Candidate session or scoped companion token; companion is restricted to companion media |
| GET | `/api/proctoring/attempts/:attemptId/chunks` | Any | N | N/A | N | G | Central attempt view policy |
| POST | `/api/proctoring/attempts/:attemptId/signal` | Any | Y | Y | N | G | Central attempt view policy; Redis-backed bounded stream |
| GET | `/api/proctoring/attempts/:attemptId/signals` | Any | N | N/A | N | G | Central attempt view policy; role-filtered Redis stream |
| POST | `/api/proctoring/attempts/:attemptId/companion/token` | Any | Y | Y | N | G | Candidate/admin scope present |
| POST | `/api/proctoring/companion/pair` | Public token | Y | Exempt | N | G | Pair token expiry present; reusable token not deleted |
| POST | `/api/proctoring/attempts/:attemptId/companion/ping` | Public token | Y | Exempt | N | G | Scoped companion token bound to attempt, candidate and session version |
| GET | `/api/proctoring/attempts/:attemptId/companion/status` | Any | N | N/A | N | G | Central attempt view policy |
| GET | `/api/proctoring/cockpit/active` | A/M/I | N | N/A | N | G | Manager sees all; Instructor owned-course filter only |
| POST | `/api/proctoring/attempts/:attemptId/warn` | A/M/I | Y | Y | Y | G | Central attempt policy plus step-up |
| GET | `/api/assessments/attempts/:attemptId/warnings` | Any | N | N/A | N | G | Central attempt view policy |
| POST | `/api/assessments/attempts/:attemptId/warnings/:warningId/ack` | Any | Y | Y | N | G | Candidate/admin plus central attempt view policy |
| POST | `/api/proctoring/attempts/:attemptId/pause` | A/M/I | Y | Y | Y | G | Central attempt policy plus step-up |
| POST | `/api/proctoring/attempts/:attemptId/resume` | A/M/I | Y | Y | Y | G | Central attempt policy plus step-up |
| POST | `/api/proctoring/attempts/:attemptId/terminate` | A/M/I | Y | Y | Y | G | Central attempt policy plus step-up |
| GET | `/api/proctoring/attempts/:attemptId/timeline` | A/M/I | N | N/A | N | G | Central attempt control policy |

## Certificates, payments, uploads and reports

| Method | Route | Auth | State | CSRF | Step | Rate | Scope / concern |
|---|---|---|---:|---|---:|---|---|
| GET | `/api/certificates/verify/:certificateId` | Public | N | N/A | N | G | Public PII; enumeration/rate considerations |
| GET | `/verify/:certificateId` | Public | N | N/A | N | None | HTML shortcut outside API limiter |
| GET | `/api/certificates` | Any | N | N/A | N | G | Role-scoped service |
| POST | `/api/certificates` | A/M/I | Y | Y | Y | G | Configured approver, course authority, eligibility and step-up required |
| POST | `/api/certificates/auto-issue` | Any | Y | Y | N | G | Self-scoped but accepts caller-selected attemptId |
| POST | `/api/payments/create-order` | Any | Y | Y | N | G | Server-priced order ledger binds user/course/amount/currency and expires |
| POST | `/api/payments/verify` | Any | Y | Y | N | G | Mandatory HMAC, order ownership/binding and payment-level idempotency |
| POST | `/api/payments/webhook` | Public | Y | Exempt | N | G | Mandatory raw-body HMAC and provider event-ID replay protection |
| POST | `/api/uploads/presign` | A/M | Y | Y | N | G | Short-lived scoped grant; extension/MIME allowlist and randomized rooted key |
| PUT | `/api/uploads/direct` | A/M | Y | Y | N | G | Subject-bound one-use grant, 15MB cap and magic-byte validation |
| GET | `/api/uploads/download` | Any | N | N/A | N | G | Subject-bound grant; attachment, no-store, nosniff and sandbox headers |
| GET | `/api/content/:courseId/:chapterId/url` | Any | N | N/A | N | G | Enrollment/owner/admin authorization present |
| POST | `/api/proctoring/captures` | Any | Y | Y | N | G | Attempt-scoped; strict JPEG decoding and 5MB cap |
| GET | `/uploads/*` | Public | N | N/A | N | None | Explicit 404; local object directory is not published |
| POST | `/api/reports/export` | A/M | Y | Y | N | G | In-memory synchronous rows; manager scope via helper |

The runtime-data ignore is anchored to `/uploads/`, so source modules under an
`uploads` directory remain tracked in clean checkouts.

## Skills, analytics, governance and AI

| Method | Route | Auth | State | CSRF | Step | Rate | Scope / concern |
|---|---|---|---:|---|---:|---|---|
| POST | `/api/skills` | A | Y | Y | N | G | Validated create |
| PATCH | `/api/skills/:id/status` | A | Y | Y | N | G | No step-up |
| POST | `/api/skills/targets` | A | Y | Y | N | G | Missing referenced entity validation |
| PATCH | `/api/skills/:id` | A | Y | Y | N | G | Unvalidated `req.body.status` path |
| POST | `/api/target-skills` | A | Y | Y | N | G | Duplicate target route/model |
| POST | `/api/chapter-feedbacks` | Any | Y | Y | N | G | No enrollment/chapter existence check |
| GET | `/api/analytics/global` | A | N | N/A | N | G | Returns hard-coded metrics in part |
| GET | `/api/analytics/team` | M | N | N/A | N | G | Direct-report scope; hard-coded metrics in part |
| GET | `/api/analytics/me` | Any | N | N/A | N | G | Hard-coded metrics |
| GET | `/api/analytics/time` | A/M | N | N/A | N | G | Scope helper used |
| GET | `/api/analytics/time/events` | A/M | N | N/A | N | G | Scope helper used; query coercion weak |
| GET | `/api/archive` | SA | N | N/A | N | G | Redacted archive view; identity archives exclude password hashes |
| POST | `/api/archive/:id/restore` | SA | Y | Y | Y | G | Step-up required; restored user is inactive with a rotated credential/session |
| GET | `/api/audit-logs` | A | N | N/A | N | G | Redacted view; normalized identity/attempt writes use database audit rows |
| GET | `/api/security-events` | A | N | N/A | N | G | Mutable bounded array |
| GET | `/api/users/me/data-export` | Any | N | N/A | N | G | Self-scoped; incomplete across all stores/logs |
| POST | `/api/users/me/delete-request` | Any | Y | Y | Y | G | Step-up required; queue remains process-local pending privacy phase |
| POST | `/api/users/me/cancel-delete` | Any | Y | Y | N | G | Self-scoped |
| GET | `/api/settings` | A | N | N/A | N | G | Admin-only |
| PATCH | `/api/settings` | A | Y | Y | Y | G | Step-up present |
| GET | `/api/ai/generation-feedback` | A/M | N | N/A | N | G | Cross-manager feedback memory visible |
| POST | `/api/ai/generation-feedback` | A/M | Y | Y | N | G | No AI budget; persistent prompt influence |
| POST | `/api/ai/chat` | Any | Y | Y | N | G+AI | User/context injected into prompt; 4k message cap |
| POST | `/api/ai/generate-course-stream` | A/M | Y | Y | N | G+AI | No input token cap/concurrency lock; 200 before errors |
| POST | `/api/ai/generate-course` | A/M | Y | Y | N | G+AI twice | Duplicate handlers and inconsistent timeout/schema behavior |

## Highest-priority route mismatches

1. Public registration can create an Instructor, while Instructor is trusted by
   certificate, assessment and proctoring routes.
2. Payment authentication was remediated in Phase 2; deployment still requires
   the payment migration, unique production secrets and provider reconciliation.
3. Candidate analytics, signaling, companion status and many proctor controls
   have role-only or no resource authorization.
4. Direct upload is available to every authenticated account and its output is
   served publicly outside the API limiter.
5. Several destructive or trust-changing actions lack step-up: certificate
   issue, proctor termination, approval, archive restore and account creation.
6. Safe-looking locked chapters still disclose their content in the response.

