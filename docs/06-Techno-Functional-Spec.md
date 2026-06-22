---
title: "Nalanda — Techno-Functional Specification"
product: "Nalanda Training & Development Platform"
version: "1.0"
status: "Draft for Review"
date: "2026-06-22"
---

# Nalanda — Techno-Functional Specification

| Field | Value |
|---|---|
| Document | Techno-Functional Specification (bridges FRD ⇄ TRD) |
| Product | Nalanda LMS |
| Version | 1.0 (Draft for Review) |
| Date | 2026-06-22 |
| Purpose | Map each business function to its API, data, UI, controls, and tests for traceability |

---

## 1. How to read this document

This is the **bridge** between business (FRD) and technical (TRD) views. The core artifact is the **traceability matrix** (§3): every functional requirement maps to the API route(s), data collection(s), UI screen(s), authorization rule, and verification approach that realize it.

## 2. Component & Interaction Map

| Functional area | UI (frontend/src/pages) | API (backend/server.js) | Data collections | Key controls |
|---|---|---|---|---|
| Login/Session | `Login.tsx`, `App.tsx` | `/api/auth/*`, `/api/csrf-token` | users, loginSecurity, sessionVersions | JWT cookie, CSRF, lockout, rate limit |
| Users/RBAC | `Users.tsx` | `/api/users*` | users | role+ownership, escalation guards |
| Skills | `Skills.tsx` | `/api/skills*`, `/api/target-skills` | skills, targetSkills, skillRatings | AD/SA only |
| Courses | `Courses.tsx` | `/api/courses*` | courses, course versions | approval workflow, owner checks |
| Chapters | `Chapters.tsx`, `Courses.tsx` | `/api/courses/:id/chapters*`, time/progress | chapters, learningTimeEvents, videoProgress | HTML sanitize, time gates |
| Assessments | `Assessments.tsx`, `Evaluation.tsx` | `/api/assessments*`, attempts | assessments, attempts | answer-key stripping, server scoring |
| Proctoring | `Courses.tsx` (ProctoredAssessment) | `/api/proctoring/events`, `/api/settings` | proctoringLogs, attempts, settings | attempt ownership, auto-submit |
| Enrollment | `Courses.tsx`, `Team.tsx` | `/api/assignments` | assignments(enrollments) | AD/MG assign |
| AI Acharya | `TextToCourseAgent.tsx` | `/api/ai/generate-course[-stream]`, `/api/ai/generation-feedback` | courses, chapters, assessments, acharyaFeedbackMemory | AI rate limit, fallback, sanitize |
| AI Copilot | `AICopilot.tsx` | `/api/ai/chat` | (stateless) | per-user limit, timeout, word cap |
| Certificates | `Certificates.tsx` | `/api/certificates` | issuedCertificates | role-scoped visibility |
| Analytics/Reports | `Dashboard.tsx`, `Reports.tsx` | `/api/analytics/*`, `/api/reports/export` | assignments, attempts, learningTimeEvents | visibility scoping |
| Governance | `Archive.tsx`, `Settings.tsx` | `/api/audit-logs`, `/api/archive*`, `/api/settings` | auditLogs, archives, settings | SA/AD only |
| Bootstrap | `App.tsx` | `/api/app-data` | (role-scoped aggregate) | per-role scoping |

## 3. Traceability Matrix (Function → Technical realization)

| FR ID | Function | API route(s) | Method | Data | AuthZ | Verification |
|---|---|---|---|---|---|---|
| FR-AUTH-1 | Login | `/api/auth/login` | POST | users | public+lockout | valid/invalid/deactivated cases |
| FR-AUTH-3 | CSRF | all writes | * | csrf cookie | double-submit | missing/mismatch → 403 |
| FR-AUTH-4 | Session revoke | `authenticate` mw | * | sessionVersions | sv match | stale token → 401 |
| FR-USR-2/3 | User create/update | `/api/users`, `/api/users/:id` | POST/PATCH | users | AD/SA + escalation guard | non-SA cannot grant SA |
| FR-USR-5 | Delete user | `/api/users/:id` | DELETE | users, archives | SA + reason | archived + sessions revoked |
| FR-SKL-2 | Target skills | `/api/skills/targets`, `/api/target-skills` | POST | targetSkills | AD/SA | scope validation |
| FR-CRS-2/3 | Course create/update | `/api/courses`, `/api/courses/:id` | POST/PUT | courses | AD/MG owner | whitelist fields; MG→Pending |
| FR-CRS-7 | Delete course | `/api/courses/:id` | DELETE | courses+related, archives | AD/SA/owner + reason | cascade archive |
| FR-CHP-2 | Chapter content | `/api/courses/:id/chapters*` | POST/PUT | chapters | owner/AD | body sanitized server-side |
| FR-ASM-1 | List assessments | `/api/assessments` | GET | assessments | role-scoped | **answers stripped for EM/MG-non-owner** |
| FR-ASM-5 | Submit attempt | `/api/assessments/attempts/:id/submit` | POST | attempts | attempt owner | server scoring; 409 on resubmit |
| FR-ASM-6 | Proctor events | `/api/proctoring/events` | POST | proctoringLogs, attempts | attempt owner | other-user → 403; auto-submit |
| FR-ENR-1 | Assign course | `/api/assignments` | POST | assignments | AD/MG | bulk create |
| FR-AI-1 | Acharya stream | `/api/ai/generate-course-stream` | POST | courses/chapters/assessments | AD/MG + aiRateLimit | NDJSON; gate+repair+fallback |
| FR-AI-4 | Copilot | `/api/ai/chat` | POST | – | auth + aiRateLimit | timeout; word cap; len limit |
| FR-CRT-1/2 | Certificates | `/api/certificates` | POST/GET | issuedCertificates | AD/SA issue; scoped read | EM sees own only |
| FR-RPT-5 | Report export | `/api/reports/export` | POST | assignments/attempts | AD/MG | rows scoped to visible users |
| FR-GOV-1 | Audit log | `/api/audit-logs` | GET | auditLogs | AD/SA | capped/paginated |
| FR-GOV-2/3 | Archive/restore | `/api/archive*` | GET/POST | archives | SA | snapshot + restore |
| FR-SYS-1 | App bootstrap | `/api/app-data` | GET | aggregate | per-role scope | leakage checks |

## 4. Key End-to-End Flows (sequence narratives)

### 4.1 AI Course Generation (FR-AI-1)
1. UI (`TextToCourseAgent.tsx`) POSTs source text + params with CSRF header.
2. API enforces auth + AD/MG + `aiRateLimit`; opens an NDJSON stream.
3. Acharya builds **outline** → for each chapter: generate → **validate** (≥500 words, required sections, examples, formatting, repetition) → **repair** if failing → fallback if still failing.
4. Generates one assessment per chapter (30-question mixed plan).
5. Streams `final` draft for **human review**; chapters sanitized on persist.
6. Action audited; per-user rate budget enforced; provider calls time-bounded; deterministic fallback if no/failed provider.

### 4.2 Proctored Assessment (FR-ASM-4/5/6)
1. Learner starts attempt (Approved assessment only) → `InProgress`, server `maxScore`.
2. Client enters fullscreen, requests camera/mic per settings.
3. Violations POST to `/api/proctoring/events` (ownership-checked); TAB_SWITCH may auto-submit.
4. Submit → **server scores MCQ**, descriptive → `PendingManualReview`; time recorded; resubmit blocked.
5. Skill rating updated from server score; audited.

### 4.3 Govern & Recover (FR-USR-5, FR-GOV-2/3)
1. SA deletes a user/course with reason (≥10 chars) → full snapshot archived; sessions revoked.
2. SA can browse archive and restore entity (+ related data) later.

## 5. Authorization Model (technical)

- `authenticate` → verifies JWT, user Active, session-version match.
- `requireRole(...)` → role gate (SA inherits AD).
- Ownership helpers (`canManageCourse`, attempt `userId` check, `visibleUserIdsFor`) → row-level scope.
- Escalation guards on user routes (SA-only for Super Admin; no self role-change/self-deactivation).

## 6. Validation & Data Integrity

- zod schemas on all write bodies; coercions for numerics; enum constraints.
- Server-authoritative scoring (no client-trusted scores).
- Soft-delete + archive for destructive ops.
- Memory-bounded logs; transactional/atomic persistence (TRD §6).

## 7. Error Handling & Observability Hooks

- Centralized error handler (last middleware) maps CORS/upload/validation/unknown errors to 403/413/415/400/500; logs redacted.
- Audit records for sensitive mutations.
- Health endpoint + (GA) metrics/alerts per TRD §10.

## 8. Configuration → Behavior Mapping

| Env | Behavioral effect |
|---|---|
| `NODE_ENV=production` | Secure cookies; secret enforcement (fail-fast); strict CORS default |
| `DATABASE_URL` | Postgres durable mode (else file fallback) |
| `GEMINI_API_KEY` | Live AI (else deterministic fallback) |
| `SEED_*_PASSWORD` | Bootstrap account passwords (random/unknown if unset in prod) |
| `ALLOWED_ORIGINS` | Permitted browser origins |

## 9. Test Strategy (functional + technical)

| Layer | What to test |
|---|---|
| AuthZ matrix | Each role × each route → allowed/denied as per FRD §1 |
| Integrity | Answer-key stripping; server scoring; resubmit idempotency |
| Abuse | Rate limits (global/AI/login); lockout; oversized upload; CSRF |
| Durability | Crash/restart durability; transactional write; graceful shutdown |
| AI | Fallback path; quality gate/repair; timeout behavior; rate budget |
| Recovery | Delete→archive→restore round-trip |
| Privacy | `/api/app-data` scoping; cross-user IDOR negatives |

## 10. Open Technical-Functional Items

- Phase-2 relational mapping (TRD §3.3/§13) — reconcile statuses/shapes before normalized SQL.
- Certificate verification model (public vs internal).
- Proctoring capture storage/retention (table exists; endpoint TBD).
- Notification/digest delivery (preferences exist; delivery channel TBD).
