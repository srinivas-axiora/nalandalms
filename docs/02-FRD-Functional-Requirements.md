---
title: "Nalanda — Functional Requirements Document (FRD)"
product: "Nalanda Training & Development Platform"
version: "1.0"
status: "Draft for Review"
date: "2026-06-22"
---

# Nalanda — Functional Requirements Document (FRD)

| Field | Value |
|---|---|
| Document | Functional Requirements Document (FRD) |
| Product | Nalanda LMS |
| Version | 1.0 (Draft for Review) |
| Date | 2026-06-22 |
| Source of truth | `backend/server.js` REST API + React SPA (`frontend/src`) |
| Related | PRD, TRD, Techno-Functional Spec |

> **Convention.** Each requirement has an ID (`FR-<module>-<n>`), actor(s), description, business rules, and acceptance criteria. Roles: **SA** = Super Admin, **AD** = Admin, **MG** = Manager, **EM** = Employee. Super Admin inherits all Admin permissions.

---

## 1. Roles & Permission Matrix

| Capability | SA | AD | MG | EM |
|---|:--:|:--:|:--:|:--:|
| Login / own profile & preferences | ✔ | ✔ | ✔ | ✔ |
| List users | ✔ | ✔ | own team | – |
| Create/edit users | ✔ | ✔ | – | – |
| Grant **Super Admin** role | ✔ | – | – | – |
| Delete user (archive) | ✔ | – | – | – |
| Manage skills & target skills | ✔ | ✔ | – | – |
| Create course (manual/AI) | ✔ | ✔ | ✔ | – |
| Approve course/assessment | ✔ | ✔ | – | – |
| Edit/delete own course | ✔ | ✔ | own | – |
| Assign courses | ✔ | ✔ | ✔ | – |
| Take assessment | ✔ | ✔ | ✔ | ✔ |
| Issue certificate | ✔ | ✔ | – | – |
| View analytics | org | org | team | self |
| Export reports | ✔ | ✔ | team | – |
| Settings (proctoring) | ✔ | ✔ | – | – |
| Audit logs | ✔ | ✔ | – | – |
| Archive / restore | ✔ | – | – | – |

---

## 2. Module: Authentication & Session (AUTH)

- **FR-AUTH-1 — Login.** Actors: all. Users sign in with email + password; Super Admin may sign in with the identifier `"Super Admin"`.
  - Rules: passwords verified against bcrypt hash; only `Active` accounts may sign in; session issued as an HttpOnly JWT cookie (30-min expiry); `Secure` cookie in production.
  - AC: valid creds → 200 + session; invalid → 401 generic "Invalid credentials"; deactivated → 401.
- **FR-AUTH-2 — Brute-force protection.** Login requests are rate-limited by source IP and by a normalized source/identifier pair. Five invalid passwords throttle that pair for 5 minutes; a valid password remains recoverable and clears the pair state so hostile guesses cannot lock the account globally.
  - AC: the fifth invalid attempt within the window → 429 with a `Retry-After` header and a generic response; unknown and inactive identities traverse the same bcrypt path; valid credentials still succeed after pair throttling.
- **FR-AUTH-3 — CSRF protection.** All state-changing requests require a valid CSRF token (double-submit cookie + `X-CSRF-Token` header).
  - AC: missing/mismatched token → 403.
- **FR-AUTH-4 — Session revocation.** Deactivating or deleting a user invalidates their existing sessions (session-version bump).
  - AC: a token for a now-inactive/deleted user → 401 "Session revoked".
- **FR-AUTH-5 — Logout.** Clears session and CSRF cookies.
- **FR-AUTH-6 — Preferences.** A user can update own UI preferences (theme, font size, language, notifications, accessibility).
- **FR-AUTH-7 — Password recovery.** Public requests return one generic response for existing and unknown addresses and are limited by source plus source/address pair. Production queues every valid request before identity lookup; a worker resolves active identity and delivers a 15-minute, single-use-through-session-version link through SES.
  - AC: no token appears in an HTTP query or production API response; encrypted SQS redrives failures to an alarmed DLQ; unknown accounts are consumed without email; reset rotates the session version and invalidates all outstanding reset/session tokens.

## 3. Module: User & Org Management (USR)

- **FR-USR-1 — List users.** AD/SA see all; MG sees own reports + self; filterable by department/role/status.
- **FR-USR-2 — Create user.** AD/SA. Validated fields (name, email, role, department, password ≥8). Unique id/email enforced.
  - Rule: only SA may create a **Super Admin**.
- **FR-USR-3 — Update user.** AD/SA. Can change profile, role, status, password.
  - Rules: only SA may modify a Super Admin or grant Super Admin; a user cannot change **own** role or deactivate **own** account.
- **FR-USR-4 — Change status.** AD/SA. Active⇄Inactive; deactivation revokes sessions; self-deactivation blocked.
- **FR-USR-5 — Delete user.** SA only. Requires deletion reason (≥10 chars); full snapshot archived; sessions revoked; audited.

## 4. Module: Skills & Targets (SKL)

- **FR-SKL-1 — Manage skills.** AD/SA create skills (name, category, description); names unique; activate/deactivate.
- **FR-SKL-2 — Target skills.** AD/SA define a target competency (level + score + priority) scoped to **Organization / Department / Role / Employee**.
- **FR-SKL-3 — Skill ratings.** System maintains per-user skill scores updated from assessment outcomes (trend up/down/stable).

## 5. Module: Courses (CRS)

- **FR-CRS-1 — List courses.** Role-scoped: EM sees only Approved+Active; MG sees own + Approved; AD/SA see all; filter by skill/approval/status.
- **FR-CRS-2 — Create course (manual).** AD/MG. Validated metadata; AD-created → `Approved`, MG-created → `Pending`.
- **FR-CRS-3 — Update course.** AD/SA or owner (MG). Whitelisted fields only; version increments; MG edits revert to `Pending`.
- **FR-CRS-4 — Duplicate course.** AD/MG clones a course as a new draft owned by actor.
- **FR-CRS-5 — Approval workflow.** AD/SA approve/reject; rejection sets course Inactive; recorded with reason.
- **FR-CRS-6 — Status.** AD/SA set Active/Inactive.
- **FR-CRS-7 — Delete course.** AD/SA or owner. Reason ≥10 chars; archives course + related chapters/assessments/enrollments; audited.

## 6. Module: Chapters & Content (CHP)

- **FR-CHP-1 — List chapters.** Ordered by sequence; EM blocked on non-Approved/Inactive courses.
- **FR-CHP-2 — Create/Update chapter.** AD/SA or owner. Content types: **Rich Text / PDF / Video Link**; HTML body is **server-sanitized**; supports `minimumTimeMinutes` learning gate.
- **FR-CHP-3 — Learning-time gate.** A chapter's minimum time must be met before completion/next-gate is satisfied.
- **FR-CHP-4 — Time tracking.** System records per-chapter and per-course time-on-task and video resume position.
- **FR-CHP-5 — Chapter feedback.** Learner can submit rating/clarity/relevance + comments (one per chapter).

## 7. Module: Assessments & Proctoring (ASM)

- **FR-ASM-1 — List assessments.** Role-scoped; EM sees only Approved.
  - **Rule (integrity):** answer keys (`answer`, `correctAnswer`, `expectedAnswer`, `rubric`) are **stripped** for non-owner/non-admin viewers.
- **FR-ASM-2 — Create/Update assessment.** AD/MG owner. Types: MCQ/Descriptive/Timed Quiz/Mixed; `passScore` 0–100; `durationMinutes`; optional `questionLimit`; strict mode flag.
- **FR-ASM-3 — Approval/Status/Delete.** AD/SA approve; owner/AD delete with reason (archived).
- **FR-ASM-4 — Start attempt.** EM/MG/AD. Only on **Approved** assessments; creates an `InProgress` attempt with server-computed `maxScore`.
- **FR-ASM-5 — Submit attempt.** Owner of attempt only. **Server-side scoring** of MCQ; descriptive → `PendingManualReview`; records time spent; idempotent (re-submit blocked).
  - AC: score computed on server; client never trusted for score; duplicate submit → 409.
- **FR-ASM-6 — Proctoring events.** Owner of attempt only. Event types: FULLSCREEN_EXIT, TAB_SWITCH, NOISE, CAMERA_OFF, MIC_OFF, FACE_MISMATCH (severity low/medium/high).
  - Rule: posting an event for **another user's** attempt → 403.
  - Rule: if tab-switch auto-submit is enabled, a TAB_SWITCH on an in-progress attempt auto-submits it.
- **FR-ASM-7 — Proctoring settings.** AD/SA configure fullscreen/camera/mic requirements, noise threshold, tab-switch auto-submit, max flags.

## 8. Module: Enrollment & Progress (ENR)

- **FR-ENR-1 — Assign course.** AD/MG assign to one or more users (priority, due date, mandatory flag).
- **FR-ENR-2 — Track progress.** System maintains progress %, completed chapters, time-on-task, completion timestamp per (user, course).
- **FR-ENR-3 — Self-enroll on activity.** Time/progress events auto-create an enrollment if absent.

## 9. Module: AI — Acharya & Copilot (AI)

- **FR-AI-1 — Generate course (streaming).** AD/MG. Input: source text (≥50 chars), skill, level, chapter count (1–20).
  - Flow: outline → per-chapter generation → quality-gate validation → focused repair → assessment generation → final draft (NDJSON progress stream).
  - Rule: provider use is opt-in; deterministic fallback guarantees output; per-user AI rate limit applies.
- **FR-AI-2 — Generate course (non-stream).** AD/MG. Single-shot generation; persists course/chapters/assessments; AI bodies server-sanitized.
- **FR-AI-3 — Generation feedback memory.** AD/MG submit feedback (type, rating 1–5, comment); Acharya retrieves relevant feedback to improve future generations.
- **FR-AI-4 — AI Copilot chat.** Any authenticated user. Software-engineering mentor; replies capped to 30 words unless detail requested; chapter context-aware; per-user rate limited; provider call time-bounded.

## 10. Module: Certificates (CRT)

- **FR-CRT-1 — Issue certificate.** AD/SA issue to an employee for a course (template, accent, subtitle, footer, HTML snapshot).
- **FR-CRT-2 — View certificates.** Role-scoped: EM sees own; MG sees own + team; AD/SA see all.

## 11. Module: Analytics & Reporting (RPT)

- **FR-RPT-1 — Personal analytics.** EM views own progress, strengths/weaknesses, suggestions.
- **FR-RPT-2 — Team analytics.** MG views team completion, skill gaps, engagement.
- **FR-RPT-3 — Org analytics.** AD/SA view org-wide counts, completion, top/low performers.
- **FR-RPT-4 — Time analytics.** AD/MG view chapter/assessment/course time-on-task, scoped to visible users.
- **FR-RPT-5 — Export report.** AD/MG export User/Team/Course reports (PDF/Excel) with filters; rows scoped to visible users.

## 12. Module: Governance — Audit & Archive (GOV)

- **FR-GOV-1 — Audit log.** AD/SA read recent audit entries (capped, paginated). All sensitive actions (login, CRUD, approvals, deletions, AI generation, settings, certificates) are recorded with actor, action, entity, metadata, timestamp.
- **FR-GOV-2 — Archive.** SA view soft-deleted entities with snapshot + reason + who/when.
- **FR-GOV-3 — Restore.** SA restore an archived user/course/assessment (with related data).

## 13. Module: App Bootstrap (SYS)

- **FR-SYS-1 — App data.** Authenticated bootstrap endpoint returns the data the SPA needs, **scoped by role** (answers stripped for learners; audit/archive admin/SA-only; attempts/certs/reports scoped to visible users).
- **FR-SYS-2 — Health.** Unauthenticated health endpoint reports service status and AI configuration flag.

## 14. Cross-Cutting Functional Rules

- **CF-1 — Input validation.** All write endpoints validate request bodies (schema) and reject invalid input with 400 + field errors.
- **CF-2 — Authorization at API layer.** Every protected route enforces role + ownership server-side (UI hiding is not relied upon).
- **CF-3 — Rate limiting.** Global per-IP limit on all API routes; stricter per-user limit on AI routes; per-IP limit on login.
- **CF-4 — Auditability.** Every sensitive mutation produces an audit record.
- **CF-5 — Soft delete.** Destructive deletes require a reason and archive a full snapshot (recoverable by SA).
- **CF-6 — Durability.** State persists transactionally (PostgreSQL) or via atomic file write (fallback); final flush on shutdown.

## 15. Acceptance Criteria Summary (Definition of Done per requirement)

A requirement is "Done" when: (a) implemented behind correct role/ownership checks, (b) inputs validated, (c) sensitive actions audited, (d) happy-path + at least one negative-path test pass, and (e) no answer-key/PII leakage to unauthorized roles.

## 16. Traceability

See the **Techno-Functional Specification** for the requirement → API route → data entity → UI screen traceability matrix.
