---
title: "Nalanda — Technical Requirements Document (TRD)"
product: "Nalanda Training & Development Platform"
version: "1.0"
status: "Draft for Review"
date: "2026-06-22"
---

# Nalanda — Technical Requirements Document (TRD)

| Field | Value |
|---|---|
| Document | Technical Requirements Document (TRD) |
| Product | Nalanda LMS |
| Version | 1.0 (Draft for Review) |
| Date | 2026-06-22 |
| Audience | Engineering, DevOps/SRE, Security |
| Related | PRD, FRD, SOW, Techno-Functional Spec, `docs/ARCHITECTURE.md`, `docs/openapi.yaml` |

---

## 1. Architecture Overview

Nalanda is a single-process **Node.js (Express 5)** API that also serves a **React 19 + Vite + TypeScript** SPA build. State is held in-memory at runtime and persisted durably via a pluggable storage adapter (**PostgreSQL** in production, atomic **JSON file** in fallback). AI features call **Google Gemini** via `@google/genai`, with a deterministic fallback generator.

```
[ Browser SPA (React/Vite) ]
        | HTTPS (cookies: HttpOnly JWT + CSRF double-submit)
        v
[ Express API (backend/server.js) ]
   ├─ Middleware: helmet, CORS allow-list, JSON limit, cookieParser, CSRF, rate limit
   ├─ AuthN/AuthZ: JWT verify + session-version + role/ownership checks
   ├─ Domain routes: users, skills, courses, chapters, assessments, attempts,
   │                 proctoring, enrollments, certificates, analytics, reports,
   │                 settings, audit, archive, AI (Acharya + Copilot)
   ├─ Persistence: storage adapter (backend/db.js)
   │     ├─ Postgres (pg Pool, JSONB per collection, transactional)  [prod]
   │     └─ Atomic JSON file (temp + rename)                          [fallback]
   └─ Static: serves frontend/dist + SPA fallback
        |
        v
[ Google Gemini API ]   (optional; deterministic fallback if absent)
```

## 2. Technology Stack

| Layer | Technology | Version (current) |
|---|---|---|
| Runtime | Node.js (ESM) | per host (≥18 recommended) |
| API framework | Express | 5.x |
| Security | helmet, cors, cookie-parser, jsonwebtoken, bcryptjs | current |
| Validation | zod | 4.x |
| AI | @google/genai (Gemini) | 2.x |
| Uploads | multer (memory, limited) | 2.x |
| DB driver | pg (PostgreSQL) | 8.x |
| Frontend | React, React DOM | 19.x |
| Build | Vite, TypeScript, Tailwind | 7.x / 5.x / 4.x |
| Charts/UX | recharts, framer-motion, clsx, tailwind-merge | current |

## 3. Data Model

### 3.1 Runtime collections (current persistence)
Persisted as JSONB-per-collection (Postgres) or a single JSON document (file): `users, courses, chapters, assessments, assignments(enrollments), attempts, proctoringLogs, auditLogs, learningTimeEvents, acharyaFeedbackMemory, reportExports, settings, videoProgress, loginSecurity, sessionVersions, issuedCertificates, archives, skills, targetSkills, skillRatings, chapterFeedbacks`.

### 3.2 Target relational schema (Phase 2)
The normalized PostgreSQL schema is defined in `database/schema.sql` (departments, users, login_security, skills, target_skills, courses, course_versions, chapters, course_approvals, enrollments, chapter_time_totals, assessments, questions, assessment_attempts, learning_time_events, assessment_answers, proctoring_logs, proctor_captures, chapter_feedbacks, skill_ratings, system_settings, report_exports, audit_logs, deleted_archives, issued_certificates + analytics views).

### 3.3 Known model reconciliation items (must fix before Phase 2)
- `attempt_status` ENUM vs app statuses `"Passed"/"Failed"` — reconcile (add columns or map to `Submitted/Evaluated` + a derived pass flag).
- Runtime `assignments` ↔ schema `enrollments` field/shape mapping (`timeSpentMinutes` is derived, not stored).
- Inline `questions` arrays vs normalized `questions`/`assessment_answers` tables.

## 4. API Surface (selected; see `docs/openapi.yaml`)

| Area | Method & Path |
|---|---|
| Health/CSRF | `GET /api/health`, `GET /api/csrf-token` |
| Auth | `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` |
| Users | `GET/POST /api/users`, `PATCH /api/users/:id`, `PATCH /api/users/:id/status`, `DELETE /api/users/:id`, `PATCH /api/users/me/preferences` |
| Skills | `POST /api/skills`, `PATCH /api/skills/:id[/status]`, `POST /api/skills/targets`, `POST /api/target-skills` |
| Courses | `GET/POST /api/courses`, `PUT /api/courses/:id`, `POST /api/courses/:id/duplicate`, `PATCH /api/courses/:id/approval|status`, `DELETE /api/courses/:id` |
| Chapters | `GET/POST /api/courses/:courseId/chapters`, `PUT /api/courses/:courseId/chapters/:chapterId`, progress/time endpoints |
| Assessments | `GET/POST /api/assessments`, `PUT /api/assessments/:id`, `PATCH .../status|approval`, `DELETE /api/assessments/:id` |
| Attempts | `POST /api/assessments/:id/attempts/start`, `POST /api/assessments/attempts/:attemptId/submit` |
| Proctoring | `POST /api/proctoring/events` |
| Enrollment | `POST /api/assignments` |
| AI | `POST /api/ai/chat`, `POST /api/ai/generate-course`, `POST /api/ai/generate-course-stream`, `GET/POST /api/ai/generation-feedback` |
| Certificates | `GET/POST /api/certificates` |
| Analytics/Reports | `GET /api/analytics/{global|team|me|time|time/events}`, `POST /api/reports/export` |
| Governance | `GET /api/audit-logs`, `GET /api/archive`, `POST /api/archive/:id/restore`, `GET/PATCH /api/settings` |
| Bootstrap | `GET /api/app-data` |

## 5. Security Architecture (implemented baseline)

- **AuthN:** JWT (HS256) in HttpOnly cookie, 30-min expiry, issuer/audience validation, server-authoritative session version, `Secure` + `SameSite` in production; `trust proxy` enabled for correct client IP/secure cookies behind TLS terminators.
- **Secrets:** `JWT_SECRET` required (≥32 chars) in production — process **refuses to boot** on missing/default; ephemeral dev secret otherwise. Seed passwords are env-driven (`SEED_*_PASSWORD`); no shipped credentials.
- **AuthZ:** role + ownership checks server-side on every protected route; privilege-escalation guards (only SA grants/edits Super Admin; no self role-change/self-deactivation).
- **CSRF:** double-submit cookie + `X-CSRF-Token` header with constant-time compare.
- **CORS:** strict allow-list (`ALLOWED_ORIGINS`); credentials enabled; same-origin in prod.
- **Rate limiting:** Redis-backed production limits — global per-IP (600/min), per-user AI (15/min), per-IP login (10/min) plus account/IP-scoped failed-login lockout; development has in-memory fallbacks.
- **Input validation:** zod schemas on writes; JSON body limit; payload JSON parse guarded.
- **Output protection:** assessment answer-keys stripped for learners; `/api/app-data` role-scoped.
- **Content safety:** server-side HTML sanitizer for chapter/AI bodies; helmet security headers.
- **Uploads:** memory storage capped at 15 MB / 5 files with MIME allow-list.
- **Abuse/cost control:** AI provider calls time-bounded; deterministic fallback; per-user quotas.
- **Logging hygiene:** centralized error handler (registered last); provider errors redacted; no secret logging.

### 5.1 Security NFRs
- No Critical/High findings open at GA. Dependency scan clean for runtime (`npm audit --omit=dev` = 0).
- All sensitive actions audited. Secrets via env/secret manager only; never committed.

## 6. Persistence & Durability

- **Adapter:** `backend/db.js` exposes `init/load/save/close`.
- **Postgres mode (`DATABASE_URL` set):** pooled connections (`PGPOOL_MAX`), TLS via `PGSSL` (`require`/`no-verify`), `app_state(collection, data jsonb, updated_at)`, **transactional** multi-collection upsert, fail-fast on init error.
- **File mode (fallback):** atomic temp-write + rename.
- **Write coalescing:** at most one in-flight + one queued save under bursty mutations.
- **Graceful shutdown:** SIGTERM/SIGINT → stop accepting connections → final flush → close pool.
- **Backups/PITR:** provided by the managed PostgreSQL service in production.

## 7. Non-Functional Requirements (NFR)

| ID | Category | Requirement |
|---|---|---|
| NFR-1 | Availability | ≥99.5% monthly API availability |
| NFR-2 | Performance | p95 < 400 ms for non-AI endpoints under nominal load |
| NFR-3 | Scalability | Single instance at GA; Phase-2 relational model required for horizontal scale |
| NFR-4 | Durability | No data loss on crash/restart; atomic/transactional writes; backups |
| NFR-5 | Security | See §5; OWASP Top 10 controls in place |
| NFR-6 | Observability | Structured logs, health endpoint, error tracking, uptime + alerting (GA) |
| NFR-7 | Maintainability | Single-source API; typed frontend; documented env config |
| NFR-8 | Compliance | Audit retention; proctoring data retention policy; PII minimization |
| NFR-9 | Accessibility | Reduced-motion/high-contrast prefs; responsive UI |
| NFR-10 | Recoverability | Soft-delete archive + restore; documented runbooks |

## 8. Configuration (environment variables)

| Var | Purpose | Notes |
|---|---|---|
| `NODE_ENV` | environment | `production` enables secure cookies + secret enforcement |
| `PORT` | listen port | default 8080 |
| `JWT_SECRET` | session signing | required ≥32 chars in prod |
| `JWT_ISSUER` / `JWT_AUDIENCE` | token namespace | defaults `nalanda-api` / `nalanda-web` |
| `ALLOWED_ORIGINS` | CORS allow-list | comma-separated |
| `DATABASE_URL` | Postgres connection | enables durable DB mode |
| `PGSSL` / `PGPOOL_MAX` | DB TLS / pool size | `require`/`no-verify`; default pool 10 |
| `SEED_*_PASSWORD` | bootstrap account passwords | required in prod to access seeded accounts |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | AI provider | optional; fallback if absent |

See `.env.example`.

## 9. Deployment

- **Build:** `npm run build` (Vite → `frontend/dist`), served by Express.
- **Run:** `node backend/server.js` with env injected.
- **Topology (GA):** single app instance + managed PostgreSQL + TLS-terminating reverse proxy/load balancer; secrets via secret manager.
- **Process mgmt:** containerized (recommended) with health checks and graceful shutdown honored.
- **CI/CD (recommended):** lint + `npm audit` + build + secret scan + staged deploy with rollback.

## 10. Observability (GA requirements)

- Structured request/error logging with secret/PII redaction.
- Health/uptime monitoring on `/api/health`.
- Error tracking (e.g., Sentry-class) integration.
- Metrics: request rate, p95 latency, 4xx/5xx, AI call count/cost, rate-limit rejections.
- Alerts: availability, error-rate spike, auth-failure spike, AI cost threshold.

## 11. Performance & Capacity

- AI generation is the most expensive path; bounded by per-user rate limit + token caps + timeouts.
- Persistence writes are off the response path (on `finish`) and coalesced.
- Memory-bounded logs (audit/learning-time/proctoring caps) prevent unbounded growth.
- Capacity at GA constrained by single-instance memory footprint; Phase 2 removes this.

## 12. Technical Risks & Mitigations

| Risk | Mitigation |
|---|---|
| In-memory state limits horizontal scale | Phase-2 relational DB |
| AI provider outage/latency | Timeouts + deterministic fallback + circuit-breaker (planned) |
| Regex HTML sanitizer edge cases | Allow-list sanitizer library (planned) + CSP |
| Single instance = single point of failure | Containerize + managed DB; Phase-2 multi-instance |

## 13. Phase 2 — Relational Migration (engineering plan)

1. Stand up a test/staging PostgreSQL; load `database/schema.sql`.
2. Reconcile model mismatches (§3.3); write migration/transform from current JSON.
3. Introduce repository layer (parameterized SQL) per entity behind current API.
4. Convert routes to async SQL incrementally; integration-test each against the live DB.
5. Cut over with dual-write/backfill; enable multi-instance once state is fully externalized.

## 14. Definition of Production-Ready (technical gate)

Secrets enforced; durable DB configured; monitoring + alerting live; backups verified; dependency scan clean; load test meets NFR-2; runbooks (incident, restore, deploy/rollback) published.
