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
| GET | `/api/app-data` | Any | N | N/A | N | G | Phases 23-24/32-33 relational identity scope plus canonical learning events, reports, AI feedback, settings, ratings, chapter feedback, administrator security evidence and Super Admin archives when cutovers are enabled; large response still requires decomposition |
| GET | `*splat` | Public | N | N/A | N | None | Frontend fallback; API paths return JSON 404 |
| POST | `/api/auth/register` | Public | Y | Y | N | G + registration limiter | Strict schema ignores/rejects role input and assigns Learner only |
| POST | `/api/auth/login` | Public | Y | Y | N | Redis-backed IP + source/identifier pair limits | Valid credentials are checked before pair throttling; no account-global lockout |
| POST | `/api/auth/logout` | Any | Cookie | Y | N | G | Authenticated logout rotates session version and revokes the presented JWT |
| POST | `/api/auth/forgot-password` | Public | Y | Y | N | G | No production delivery implementation shown |
| POST | `/api/auth/reset-password` | Public token | Y | Y | N | G | Reset bumps session version |
| POST | `/api/auth/reauth` | Any | Cookie | Y | N | G | Issues 10-minute step-up token |
| GET | `/api/auth/me` | Any | N | N/A | N | G | Session identity |
| PATCH | `/api/users/me/preferences` | Any | Y | Y | N | G | Self-scoped |
| GET | `/api/users` | A/M | N | N/A | N | G | Manager direct-report scope implemented |
| POST | `/api/users` | A | Y | Y | Y | G | Privileged account creation requires recent re-authentication |
| PATCH | `/api/users/:id` | A | Y | Y | Y | G | Step-up protected; credential/role/status changes revoke sessions; centralized audit redaction removes credential derivatives |
| PATCH | `/api/users/:id/status` | A | Y | Y | Y | G | Deactivation revokes; activation does not rotate |
| DELETE | `/api/users/:id` | SA | Y | Y | Y | G | Step-up protected; sessions revoked; archived identity is redacted before persistence |

Phase 44 makes `USE_PG_COURSES=1` select relational identity and session
authority across authentication, user administration, companion validation,
application projections and user archives. Course tasks therefore cannot trust
stale process-local roles, account status or session versions.

Phase 51 closes the pending-review queue's final task-local course-label lookup.
Production-mode course authority now also requires the exact versioned coverage
acknowledgement and passes readiness only when the normalized learning schema,
reference integrity and every implied relational authority are healthy. AWS
keeps the flag and acknowledgement disabled until live staging approval.

## Courses, chapters, enrollment and cohorts

| Method | Route | Auth | State | CSRF | Step | Rate | Scope / concern |
|---|---|---|---:|---|---:|---|---|
| GET | `/api/catalog` | Public | N | N/A | N | G | Approved active course metadata |
| POST | `/api/courses/:id/enroll` | Any | Y | Y | N | G | Phase-12 relational mode locks the course and uses enrollment uniqueness; prerequisite policy remains pending |
| GET | `/api/courses` | Any | N | N/A | N | G | Role/enrollment scoped; Phase-12 relational mode uses database joins |
| POST | `/api/courses` | A/M | Y | Y | N | G | Phase-12 relational mode accepts validated metadata only; media uses scoped object grants |
| PUT | `/api/courses/:id` | A/M | Y | Y | N | G | Phase-12 relational mode enforces owner/admin scope and optimistic versioning |
| POST | `/api/courses/:id/duplicate` | A/M | Y | Y | N | G | Phase-12 relational mode rejects foreign-manager duplication |
| PATCH | `/api/courses/:id/approval` | A | Y | Y | Y | G | Step-up required; Phase-12 relational mode also requires a current version and review reason |
| PATCH | `/api/courses/:id/status` | A | Y | Y | Y | G | Step-up present |
| DELETE | `/api/courses/:id` | A/M | Y | Y | Y | G | Phase-12 relational mode versions/archives and refuses deletion when retained learning, payment or credential history exists |
| GET | `/api/courses/:courseId/chapters` | Any | N | N/A | N | G | Phase-13 relational mode requires enrollment/ownership and emits a minimal DTO for locked chapters |
| POST | `/api/courses/:courseId/chapters` | A/M | Y | Y | N | G | Phase-13 relational mode enforces owner/admin scope, course version and transactional audit/version coupling |
| PUT | `/api/courses/:courseId/chapters/:chapterId` | A/M | Y | Y | N | G | Phase-13 relational mode requires course and chapter versions; HTML is sanitized |
| POST | `/api/courses/:courseId/chapters/:chapterId/progress` | Any | Y | Y | N | G | Phase-13 relational mode validates enrollment/unlock and stores monotonic maximum position transactionally |
| POST | `/api/courses/:courseId/chapters/:chapterId/time` | Any | Y | Y | N | G | Phase-13 relational mode requires a durable idempotency key and server-clock-clamped increment |
| GET | `/api/courses/:courseId/chapters/:chapterId/progress` | Any | N | N/A | N | G | Phase-13 relational mode enforces enrollment and sequential unlock policy |
| POST | `/api/courses/:courseId/chapters/:chapterId/heartbeat` | Any | Y | Y | N | G | Phase-13 relational mode locks enrollment, deduplicates retries and commits event/total/progress atomically |
| POST | `/api/assignments` | A/M | Y | Y | N | G | Phase-16 relational mode locks course/user scope, restricts Managers to owned courses and active direct reports, and commits the bounded batch with audit atomically |
| POST | `/api/cohorts` | A/M/I | Y | Y | N | G | Phase-17 relational mode requires active approved course authority, stores only the invite digest and couples create/audit transactionally |
| GET | `/api/cohorts` | Any | N | N/A | N | G | Phase-17 relational mode scopes administrators, creators and enrolled members without returning invite material |
| GET | `/api/cohorts/:id` | Any | N | N/A | N | G | Phase-17 relational mode requires administration, course/cohort authority or membership and returns no bearer invite |
| POST | `/api/cohorts/join` | Any | Y | Y | N | G | Phase-17 relational mode locks the target cohort before capacity count and commits enrollment/audit atomically |
| GET | `/api/cohorts/:id/analytics` | Any | N | N/A | N | G | Phase-17 relational mode requires cohort instructor, course owner or administrator authority |

## Assessments and external candidates

| Method | Route | Auth | State | CSRF | Step | Rate | Scope / concern |
|---|---|---|---:|---|---:|---|---|
| GET | `/api/assessments` | Any | N | N/A | N | G | Phase-14 relational mode uses enrollment/course scope and strips answer, rubric and explanation material for non-owners |
| POST | `/api/assessments` | A/M | Y | Y | N | G | Phase-14 relational mode couples ownership, course version, questions, immutable assessment version and audit transactionally |
| PUT | `/api/assessments/:id` | A/M | Y | Y | N | G | Phase-14 relational mode requires course/assessment versions and owner/admin authority |
| PATCH | `/api/assessments/:id/status` | A/M | Y | Y | Y | G | Phase-14 relational mode enforces owner/admin scope and optimistic versions |
| DELETE | `/api/assessments/:id` | A/M | Y | Y | Y | G | Phase-14 relational mode archives and refuses deletion when attempts or candidate links exist |
| PATCH | `/api/assessments/:id/approval` | A | Y | Y | Y | G | Phase-14 relational mode requires administrator step-up, versions and review feedback |
| POST | `/api/assessments/:id/attempts/start` | A/M/I/E/L | Y | Y | N | G | Phase-14 relational mode locks published assessment/course/enrollment, derives chapter completion and creates the blind attempt in one transaction |
| GET | `/api/assessments/attempts/:attemptId/questions` | Any | N | N/A | N | G | Central attempt view policy; answer keys remain server-only and relational attempts retain immutable duration/pass-score/version settings |
| POST | `/api/assessments/attempts/:attemptId/answer` | Any | Y | Y | N | G | Owner-only; database-clock and optimistic-version guard in relational mode |
| POST | `/api/assessments/attempts/:attemptId/submit` | Any | Y | Y | N | G | Owner-only; deadline and duplicate submit enforced server-side; grading uses the attempt-bound pass score rather than mutable authoring state |
| GET | `/api/assessments/attempts/pending-review` | A/M/I | N | N/A | N | G | Phase-14 relational mode scopes reviewers through assessment/course authority; Phase 49 resolves learner labels from a password-free relational identity projection |
| POST | `/api/assessments/attempts/:attemptId/grade` | A/M/I | Y | Y | Y | G | Central owner/assigned-proctor policy plus step-up |
| GET | `/api/assessments/question-library` | A | N | N/A | N | G | Answer-bearing authoring view is administrator-only |
| POST | `/api/candidate-assessments` | A/M/I | Y | Y | N | G | Source ownership checked; when both flags are enabled the source assessment is relational and the candidate runtime freezes an immutable question snapshot |
| GET | `/api/candidate-assessments` | Any | N | N/A | N | G | Creator/admin filter; relational mode never recovers bearer tokens |
| GET | `/api/candidate-assessments/analytics/:id` | Any | N | N/A | N | G | Creator/admin scoped; contains candidate PII and evaluated answers |
| GET | `/api/candidate-assessments/:id` | Any | N | N/A | N | G | Creator/admin check present |
| PATCH | `/api/candidate-assessments/:id/status` | Any | Y | Y | Y | G | Creator/admin scope plus step-up |
| POST | `/api/candidate-assessments/:id/rotate-token` | Any | Y | Y | Y | G | Creator/admin scope plus step-up; old bearer hash is invalidated atomically |
| DELETE | `/api/candidate-assessments/:id` | Any | Y | Y | Y | G | Creator/admin scope plus step-up |
| GET | `/api/public/candidate-assessments/:token` | Public token | N | N/A | N | G | Checks status and expiry |
| POST | `/api/public/candidate-assessments/:token/start` | Public token | Y | Exempt | N | G | Status/expiry checked; relational mode atomically enforces case-insensitive email uniqueness |
| POST | `/api/public/candidate-assessments/:token/event` | Public attempt token | Y | Exempt | N | G | Deadline enforced; relational mode derives severity server-side, deduplicates client event IDs and commits evidence atomically |
| POST | `/api/public/candidate-assessments/:token/submit` | Public attempt token | Y | Exempt | N | G | Server deadline enforced; prose requires manual review; relational mode locks and commits once |

Phase 40 makes `USE_PG_COURSES=1` select the relational candidate-assessment
engine for every authenticated and public route, including token hashing,
deadline enforcement, idempotent proctor evidence and atomic submission.

Phase 41 also makes the course cutover select the relational payment ledger.
Checkout, signature verification and provider webhooks therefore create the
same transactional enrollment records consumed by relational course access.

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
| GET | `/api/proctoring/cockpit/active` | A/M/I | N | N/A | N | G | Phase-36 relational mode scopes assigned proctor/assessment owner/course owner in SQL; minimal projection excludes answers and question maps |
| POST | `/api/proctoring/attempts/:attemptId/warn` | A/M/I | Y | Y | Y | G | Central attempt policy plus step-up |
| GET | `/api/assessments/attempts/:attemptId/warnings` | Any | N | N/A | N | G | Central attempt view policy |
| POST | `/api/assessments/attempts/:attemptId/warnings/:warningId/ack` | Any | Y | Y | N | G | Candidate/admin plus central attempt view policy |
| POST | `/api/proctoring/attempts/:attemptId/pause` | A/M/I | Y | Y | Y | G | Central attempt policy plus step-up |
| POST | `/api/proctoring/attempts/:attemptId/resume` | A/M/I | Y | Y | Y | G | Central attempt policy plus step-up |
| POST | `/api/proctoring/attempts/:attemptId/terminate` | A/M/I | Y | Y | Y | G | Central attempt policy plus step-up |
| GET | `/api/proctoring/attempts/:attemptId/timeline` | A/M/I | N | N/A | N | G | Phase-37 relational mode rechecks assigned-proctor/assessment-owner/course-owner scope while resolving minimal timeline labels |

## Certificates, payments, uploads and reports

| Method | Route | Auth | State | CSRF | Step | Rate | Scope / concern |
|---|---|---|---:|---|---:|---|---|
| GET | `/api/certificates/verify/:certificateId` | Public | N | N/A | N | G | Public PII; enumeration/rate considerations |
| GET | `/verify/:certificateId` | Public | N | N/A | N | None | HTML shortcut outside API limiter |
| GET | `/api/certificates` | Any | N | N/A | N | G | Role-scoped service |
| POST | `/api/certificates` | A/M/I | Y | Y | Y | G | Phase-39 course cutover implies relational eligibility; configured approver, course authority and step-up required |
| POST | `/api/certificates/:certificateId/revoke` | A/M/I | Y | Y | Y | G | Phase-39 course cutover implies transactional certificate/enrollment revocation; course authority and step-up required |
| POST | `/api/certificates/auto-issue` | Any | Y | Y | N | G | Phase-39 relational self-scope; selected passed attempt is transactionally bound to learner/course |
| POST | `/api/payments/create-order` | Any | Y | Y | N | G | Server-priced order ledger binds user/course/amount/currency and expires |
| POST | `/api/payments/verify` | Any | Y | Y | N | G | Mandatory HMAC, order ownership/binding and payment-level idempotency |
| POST | `/api/payments/webhook` | Public | Y | Exempt | N | G | Mandatory raw-body HMAC and provider event-ID replay protection |
| POST | `/api/uploads/presign` | A/M | Y | Y | N | G | Explicit course scope; owner/admin authority; short-lived grant; extension/MIME allowlist and course-rooted randomized key; no pre-scan download grant |
| PUT | `/api/uploads/direct` | A/M | Y | Y | N | G | Subject-bound one-use grant, 15MB cap and magic-byte validation; S3 objects enter GuardDuty quarantine |
| GET | `/api/uploads/download` | Any | N | N/A | N | G | Subject-bound grant; attachment, no-store, nosniff and sandbox headers; S3 protected prefixes require a clean malware-scan tag |
| GET | `/api/content/:courseId/:chapterId/url` | Any | N | N/A | N | G | Relational owner/admin or published enrollment authority; prerequisite gate; object key must remain inside the requested course prefix |
| POST | `/api/proctoring/captures` | Any | Y | Y | N | G | Attempt-scoped; strict JPEG decoding and 5MB cap |
| GET | `/uploads/*` | Public | N | N/A | N | None | Explicit 404; local object directory is not published |
| POST | `/api/reports/export` | A/M | Y | Y | N | G | Phase-22 relational mode uses strict filters, SQL scope, canonical totals, a 5,000-row cap and atomic report/audit persistence; the private artifact worker rechecks current authority |
| GET | `/api/reports/:reportId` | A/M | N | N/A | N | G | Admin organization scope or requester-only Manager scope; private storage keys are redacted |
| GET | `/api/reports/:reportId/download` | A/M | N | N/A | N | G | Ready artifacts only; Admin organization scope or requester-only Manager scope; five-minute attachment grant and audit evidence (S3 URL is bearer after issuance) |

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
| POST | `/api/chapter-feedbacks` | Any | Y | Y | N | G | Phase-24 relational mode binds subject identity, matching chapter/course and active enrollment; feedback and audit commit atomically |
| GET | `/api/analytics/global` | A | N | N/A | N | G | Phase-18 relational mode derives organization counts, progress, scores and performer ordering from PostgreSQL |
| GET | `/api/analytics/team` | M | N | N/A | N | G | Phase-18 relational mode enforces direct-report scope in SQL and derives completion, skills and engagement |
| GET | `/api/analytics/me` | Any | N | N/A | N | G | Phase-18 relational mode derives self-scoped enrollment, skill and course-suggestion metrics |
| GET | `/api/analytics/time` | A/M | N | N/A | N | G | Phase-18 relational mode reconciles canonical chapter totals, attempts and enrollment time with SQL scope |
| GET | `/api/analytics/time/events` | A/M | N | N/A | N | G | Phase-18 relational mode uses SQL scope, deterministic ordering and a strict 1-500 limit |
| GET | `/api/archive` | SA | N | N/A | N | G | Phase-33 relational mode provides a bounded, deterministic redacted archive view; identity archives exclude password hashes |
| POST | `/api/archive/:id/restore` | SA | Y | Y | Y | G | Step-up required; user restores inactive with rotated credentials; course/assessment restores are atomic, versioned and forced to inactive draft review |
| GET | `/api/audit-logs` | A | N | N/A | N | G | Phase-32 bounded, redacted, deterministically ordered PostgreSQL projection when enabled; snapshot fallback remains feature-gated |
| GET | `/api/security-events` | A | N | N/A | N | G | Phase-32 bounded, redacted, deterministically ordered PostgreSQL projection when enabled; response evidence writes fail closed |
| GET | `/api/users/me/data-export` | Any | N | N/A | Y | G | Self-scoped bulk export; step-up required; relational mode uses explicit allowlists and omits secrets/object keys |
| GET | `/api/users/me/delete-request` | Any | N | N/A | N | G | Self-scoped durable workflow status in relational mode |
| POST | `/api/users/me/delete-request` | Any | Y | Y | Y | G | Step-up/email verification; relational mode enforces one active durable request |
| POST | `/api/users/me/cancel-delete` | Any | Y | Y | Y | G | Self-scoped; step-up required; processing requests cannot be cancelled |
| GET | `/api/privacy/requests` | A | N | N/A | N | G | Administrator review queue containing subject PII |
| POST | `/api/privacy/requests/:requestId/review` | A | Y | Y | Y | G | Administrator step-up; explicit approve or legal hold reason |
| GET | `/api/settings` | A | N | N/A | N | G | Admin-only; Phase-24 relational mode reads constrained operational settings |
| PATCH | `/api/settings` | A | Y | Y | Y | G | Strict bounded patch, step-up, row lock and atomic audit in Phase-24 relational mode |
| GET | `/api/ai/generation-feedback` | A/M | N | N/A | N | G | Phase-21 relational mode gives Managers creator-only scope and Admins organization review scope; expired feedback is excluded |
| POST | `/api/ai/generation-feedback` | A/M | Y | Y | N | G | Phase-21 relational mode validates bounded fields and commits feedback plus audit atomically with 180-day retention |
| POST | `/api/ai/chat` | Any | Y | Y | N | G+AI | Phase-34 learning commands use scoped relational learning projections; Phase-50 attendance/review/message commands use bounded relational workplace authority with transactional audit when enabled; user/context enters provider prompt; 4k message cap |
| POST | `/api/ai/generate-course-stream` | A/M | Y | Y | N | G+AI | Phase-20 strict 50-50,000 character input, 1-20 chapters and explicit provider opt-in; NDJSON errors can occur after HTTP 200 |
| POST | `/api/ai/generate-course` | A/M | Y | Y | N | G+AI | Phase-20 single draft-only handler; strict shared input schema and no direct content-authority mutation |

Phase 42 makes `USE_PG_COURSES=1` select relational settings for administration,
attempt start and proctor-event enforcement, preventing task-local exam policy.
Phase 43 applies the same invariant to skills, targets, ratings, chapter
feedback and the competency evidence used by local course recommendations.
Phase 45 applies it to privacy export, deletion intake, review, legal hold and
erasure state. The erasure worker and normalized coverage acknowledgement remain
explicit readiness requirements rather than being silently enabled.
Phase 46 applies it to append-only audit and security evidence writes, governance
reads and application-data projections. Evidence-write failure remains a
response-blocking error, and the snapshot no longer loads or saves competing
evidence arrays on the course-cutover path.
Phase 47 moves proctoring-media retention off the process-local attempt array.
Relational deployments now claim expired objects with row locks, delete private
objects, redact stored keys, update the attempt projection and audit completion
atomically, with bounded retry and stale-claim recovery.
Phase 50 applies the course-cutover invariant to Copilot workplace state.
Attendance has one concurrency-safe daily record, messages revalidate active
recipients inside the transaction, ambiguous names fail closed, and privacy
export/erasure coverage is acknowledged as `normalized-v2`.

Attempt permission middleware uses only relational attempt principals and
relational assessment/course ownership when `USE_PG_COURSES=1`; stale snapshot
ownership cannot authorize view, control or grading operations (Phase 35).
Course cutover also implies relational attempt persistence across assessment,
cockpit, proctor-event, media-chunk and companion-pairing paths (Phase 38).

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
6. Locked chapter DTO redaction is present in both modes; Phase-13 additionally
   derives enrollment and prerequisite scope from locked relational rows.

