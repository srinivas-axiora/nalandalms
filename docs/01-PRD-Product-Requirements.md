---
title: "Nalanda — Product Requirements Document (PRD)"
product: "Nalanda Training & Development Platform"
owner: "Product Management — Axiora Global Solutions"
version: "1.0"
status: "Draft for Review"
date: "2026-06-22"
---

# Nalanda — Product Requirements Document (PRD)

| Field | Value |
|---|---|
| Document | Product Requirements Document (PRD) |
| Product | Nalanda — Training & Development / Learning Management Platform |
| Author | Product Management, Axiora Global Solutions |
| Version | 1.0 (Draft for Review) |
| Date | 2026-06-22 |
| Reviewers | CTO, Engineering Lead, L&D Director, Security |
| Related docs | FRD, TRD, SOW, BCM, Techno-Functional Spec |

---

## 1. Executive Summary

Nalanda is an enterprise **Learning & Development (L&D) platform** that lets organizations build skills, run training, assess competency under proctoring, and prove outcomes with auditable evidence and certificates. Its differentiator is **Acharya**, an AI course-generation pipeline (Google Gemini) that converts raw source material into structured, multi-chapter courses with chapter-aligned assessments — collapsing weeks of instructional-design effort into minutes.

The platform serves four roles — **Super Admin, Admin, Manager, Employee** — across the full L&D lifecycle: skill taxonomy → course authoring → enrollment → learning → proctored assessment → scoring → certification → analytics.

This PRD defines the product vision, target users, scope, prioritized capabilities, success metrics, and release plan for the first production-ready release ("GA").

## 2. Problem Statement

Organizations struggle to:
1. **Author quality training fast.** Instructional design is slow and expensive; content goes stale.
2. **Assess real competency.** Unproctored quizzes are gameable; results are not trustworthy for compliance.
3. **Prove outcomes.** Auditors, managers, and clients need defensible evidence of who learned what, when, and how well.
4. **Target the right skills.** Skill gaps are invisible without a taxonomy linking roles, departments, and individuals to target competency levels.

Nalanda addresses all four in one system, with AI-accelerated authoring and proctored, auditable assessment.

## 3. Goals & Non-Goals

### 3.1 Product Goals (GA)
- G1 — Reduce course creation time by ≥80% using Acharya AI generation vs. manual authoring.
- G2 — Provide trustworthy competency signals via proctored, server-scored assessments.
- G3 — Give managers/admins real-time visibility into progress, time-on-task, and skill gaps.
- G4 — Issue verifiable completion certificates.
- G5 — Maintain a complete, tamper-evident audit trail of sensitive actions.
- G6 — Be production-safe: secure-by-default, resilient under load, and durable.

### 3.2 Non-Goals (GA)
- N1 — Public/consumer marketplace or paid course storefront.
- N2 — Live virtual classroom / video conferencing.
- N3 — SCORM/xAPI import-export (candidate for a later release).
- N4 — Native mobile apps (responsive web only at GA).
- N5 — Multi-organization (true multi-tenant) isolation — GA is **single-tenant per deployment** (see TRD §Multi-tenancy roadmap).

## 4. Target Users & Personas

| Persona | Role | Primary jobs-to-be-done |
|---|---|---|
| **Priya — Platform Owner** | Super Admin | Govern the platform, manage all data, restore/delete entities with reason, oversee security. |
| **Nisha — L&D Director** | Admin | Define skills & targets, approve courses/assessments, assign training, issue certificates, read org analytics. |
| **Aarav — Team Manager** | Manager | Author courses for their team, assign training, monitor team progress and skill gaps. |
| **Diya — Employee/Learner** | Employee | Take assigned courses, learn chapters, sit proctored assessments, earn certificates, track own progress. |
| **(System) — Acharya** | AI Agent | Generate course outlines, chapters, and assessments from source text; self-validate and repair output. |

## 5. Product Scope & Capabilities (GA)

### 5.1 Capability map
1. **Identity & Access** — login, sessions, role-based access (4 roles), account lifecycle, lockout.
2. **Skill Taxonomy** — skills, categories, and target-skill definitions by org/department/role/employee.
3. **Course Authoring** — manual authoring + Acharya AI generation; versioning; approval workflow.
4. **Chapters & Content** — rich text / PDF / video-link chapters; minimum-time learning gates.
5. **Assessments & Proctoring** — MCQ/descriptive/mixed; strict mode; fullscreen, tab-switch, camera/mic monitoring; server-side scoring.
6. **Enrollment & Progress** — assignment, completion tracking, time-on-task (chapter + assessment).
7. **Certificates** — templated, issued, role-scoped visibility.
8. **Analytics & Reporting** — personal, team, org dashboards; exportable reports.
9. **AI Copilot** — embedded software-engineering mentor for learners.
10. **Governance** — audit logs, soft-delete archive with mandatory reason, restore, settings.

### 5.2 Prioritization (MoSCoW)

| Priority | Capabilities |
|---|---|
| **Must** | Identity & Access, Course Authoring (incl. Acharya), Chapters, Assessments & Proctoring, Enrollment/Progress, Certificates, Audit, Settings, Security baseline |
| **Should** | Skill Taxonomy & targets, Analytics dashboards, Report export, AI Copilot |
| **Could** | Archive restore UX polish, advanced proctoring (face match), notification digests |
| **Won't (GA)** | SCORM/xAPI, multi-tenant isolation, mobile apps, payments |

## 6. Key User Journeys (Epics)

- **E1 — AI Course Creation:** Admin/Manager pastes source material → Acharya streams an outline → writes chapters (validated/repaired) → generates assessments → human reviews → publishes.
- **E2 — Assign & Learn:** Admin/Manager assigns a course → Employee learns chapters (time-gated) → AI Copilot assists → marks progress.
- **E3 — Proctored Assessment:** Employee starts attempt → fullscreen + camera/mic checks → answers → tab-switch auto-submit on violation → server scores → result + skill rating update.
- **E4 — Certify:** Admin issues certificate on completion → Employee views/downloads.
- **E5 — Govern & Audit:** Super Admin reviews audit log, deletes with reason (archived), restores when needed.
- **E6 — Measure:** Manager/Admin views progress, time-on-task, and skill-gap analytics; exports reports.

## 7. Representative User Stories (with acceptance criteria)

> Full functional detail and per-module acceptance criteria are in the **FRD**. Representative samples:

- **US-1 (Acharya):** *As an Admin, I can generate a multi-chapter course from pasted text so that I author faster.*
  - AC: I can request 1–20 chapters; I see streamed progress; each chapter passes a quality gate (≥500 words, required sections, examples) or is auto-repaired/fallback; output is a reviewable draft, not auto-published.
- **US-2 (Proctoring integrity):** *As an L&D Director, I need assessment answers hidden from learners so results are trustworthy.*
  - AC: Learner-facing assessment payloads never contain answer keys; scoring is server-side; a tab-switch beyond threshold auto-submits.
- **US-3 (Access control):** *As a Super Admin, only I can permanently delete users/courses, always with a reason.*
  - AC: Delete requires a ≥10-char reason; entity is archived with full snapshot; sessions of deleted users are revoked; action is audited.
- **US-4 (Learner):** *As an Employee, I can only see my own results and certificates.*
  - AC: Lists are role-scoped server-side; an employee cannot read another user's attempts, certificates, or audit logs.

## 8. Success Metrics (KPIs)

| Category | Metric | GA Target |
|---|---|---|
| Authoring efficiency | Median course creation time (AI vs manual) | ≥80% reduction |
| Adoption | % assigned courses started within 7 days | ≥70% |
| Completion | Course completion rate | ≥65% |
| Assessment integrity | % attempts with proctoring telemetry captured | ≥95% |
| Reliability | API availability (monthly) | ≥99.5% |
| Performance | p95 API latency (non-AI) | <400 ms |
| Trust/Security | Critical security findings open in prod | 0 |
| Satisfaction | Acharya output rating (1–5) | ≥4.0 |

## 9. Assumptions & Dependencies

- Google Gemini API access (`GEMINI_API_KEY`) is available; AI features **degrade gracefully** to a deterministic generator when absent.
- A PostgreSQL database (`DATABASE_URL`) is provisioned for production durability; a file fallback exists for non-production.
- Users are provisioned by Admins (no public self-signup at GA).
- Single-tenant deployment per customer organization at GA.

## 10. Constraints

- Internal browser-based tool; modern evergreen browsers; responsive web.
- Compliance posture must support audit evidence retention.
- Proctoring requires camera/microphone permissions and fullscreen support.

## 11. Risks & Mitigations (product-level)

| Risk | Impact | Mitigation |
|---|---|---|
| AI cost runaway | Financial | Per-user AI rate limits, token caps, deterministic fallback |
| Proctoring privacy concerns | Legal/trust | Consent, clear policy, scoped access to captures, retention limits |
| Single-instance scale limits | Availability | Phase-2 relational DB enables horizontal scale |
| AI content quality variance | Trust | Quality gate + repair loop + mandatory human review before publish |

## 12. Release Plan (high level)

| Release | Theme | Contents |
|---|---|---|
| **MVP (done/iterated)** | Core LMS + AI authoring | Auth, courses, chapters, assessments, proctoring, certificates, Acharya |
| **Hardening (done)** | Security & durability | Security baseline, rate limits, durable storage adapter |
| **GA** | Production launch | Monitoring, PostgreSQL persistence, runbooks, SLAs |
| **Post-GA** | Scale & extend | Phase-2 relational DB, notifications, SCORM/xAPI, multi-tenant |

## 13. Open Questions

- OQ-1: Final interpretation of "BCM" (Business Case vs Business Continuity) — assumed Business Case & Commercial Model.
- OQ-2: Certificate verification — public verify URL vs internal only?
- OQ-3: Data retention windows for proctoring captures and audit logs.
- OQ-4: Multi-tenant timeline — is cross-org isolation required before scale?

## 14. Glossary

- **Acharya** — Nalanda's AI course-generation agent.
- **Target Skill** — a desired competency level scoped to org/department/role/employee.
- **Strict mode** — proctoring enforcement (fullscreen, camera/mic, tab-switch auto-submit).
- **Archive** — soft-deleted entity snapshot with mandatory deletion reason.
