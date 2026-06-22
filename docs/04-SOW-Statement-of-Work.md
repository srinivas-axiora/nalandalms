---
title: "Nalanda — Statement of Work (SOW)"
product: "Nalanda Training & Development Platform"
version: "1.0"
status: "Draft for Review"
date: "2026-06-22"
---

# Nalanda — Statement of Work (SOW)

| Field | Value |
|---|---|
| Document | Statement of Work (SOW) |
| Project | Nalanda LMS — Production Hardening & Launch |
| Provider | Axiora Global Solutions |
| Client | [Client / Internal Sponsor] |
| Version | 1.0 (Draft for Review) |
| Effective date | 2026-06-22 |
| Related | PRD, FRD, TRD, BCM |

> **Note.** Dates, durations, rates, and totals below are **placeholders/estimates** pending commercial agreement. They are planning figures, not a quote.

---

## 1. Purpose & Background

Nalanda is an AI-accelerated L&D platform (see PRD). The MVP and a security/durability hardening pass are complete. This SOW covers the work required to take Nalanda to a **production General Availability (GA)** launch and a follow-on **scale** phase.

## 2. Objectives

- O1 — Launch Nalanda to production with security, durability, and observability gates met.
- O2 — Operate reliably for the first cohort of paying/internal customers.
- O3 — Establish the foundation for horizontal scale (Phase-2 relational DB).

## 3. Scope of Work

### 3.1 In Scope

**Workstream A — Security & Compliance (largely complete; finalize)**
- Auth/secret hardening, RBAC + ownership enforcement, CSRF, CORS, rate limiting, input validation, output protection, HTML sanitization, dependency CVE remediation. *(Implemented.)*
- Final pen-test remediation pass and security sign-off.

**Workstream B — Persistence & Durability (Phase 1 complete)**
- Pluggable storage adapter (PostgreSQL + atomic file fallback), transactional writes, graceful shutdown, fail-fast. *(Implemented.)*
- Provision managed PostgreSQL; verify backups + point-in-time recovery.

**Workstream C — Observability & Operations (GA)**
- Structured logging with redaction, error tracking, uptime + metrics + alerting.
- Runbooks: incident response, restore-from-archive, deploy/rollback, key rotation.

**Workstream D — Release Engineering (GA)**
- CI/CD pipeline (lint, audit, build, secret scan, staged deploy, rollback).
- Environment setup (staging + production), secret management, TLS/reverse proxy.

**Workstream E — Product Finalization (GA)**
- Close remaining FRD acceptance gaps; QA pass (functional + role/permission + proctoring integrity).
- UAT support and defect resolution.

**Workstream F — Documentation & Handover**
- PRD/FRD/TRD/SOW/BCM/Techno-Functional set (this package), admin/user guides, API reference (`openapi.yaml`).

**Workstream G — Phase 2 (Scale; optional/contingent)**
- Relational migration per TRD §13: schema load, model reconciliation, repository layer, route-by-route async SQL conversion with live-DB testing, multi-instance enablement.

### 3.2 Out of Scope (this SOW)
- SCORM/xAPI; native mobile apps; payment/billing integration; live virtual classroom; true multi-tenant isolation; content authoring services (creating customer course content); third-party SSO/IdP integration (can be added via change request).

## 4. Deliverables & Acceptance Criteria

| ID | Deliverable | Acceptance Criteria |
|---|---|---|
| D1 | Security sign-off | 0 Critical/High open; runtime dependency scan clean; controls verified |
| D2 | Production PostgreSQL + durability | DB provisioned; transactional writes verified; backup + restore drill passed |
| D3 | Observability stack | Logs/metrics/alerts live; health + uptime monitored; error tracking active |
| D4 | CI/CD pipeline | Automated build/test/scan/deploy with rollback demonstrated |
| D5 | QA + UAT completion | FRD acceptance criteria met; UAT defects resolved/triaged |
| D6 | Documentation set | This document package + admin/user guides delivered and reviewed |
| D7 (opt) | Phase-2 migration | Routes on relational DB; integration tests pass on live DB; multi-instance verified |

## 5. Timeline & Milestones (indicative)

| Phase | Milestone | Est. duration |
|---|---|---|
| M0 | Kickoff & environment provisioning | Week 1 |
| M1 | Security finalization + DB durability verified (D1, D2) | Weeks 1–2 |
| M2 | Observability + CI/CD (D3, D4) | Weeks 2–4 |
| M3 | QA + UAT + docs (D5, D6) | Weeks 4–6 |
| M4 | **GA Launch** | Week 6 |
| M5 (opt) | Phase-2 relational migration (D7) | Weeks 7–12 |

## 6. Roles & Responsibilities (RACI)

| Activity | Provider (Axiora) | Client/Sponsor | CTO | Security |
|---|---|---|---|---|
| Requirements sign-off | R | A | C | C |
| Implementation & hardening | R | C | A | C |
| DB provisioning / secrets | R | A | C | C |
| Security testing & sign-off | C | A | C | R |
| UAT | C | R/A | C | I |
| GA go/no-go | C | A | R | C |

*(R=Responsible, A=Accountable, C=Consulted, I=Informed.)*

## 7. Assumptions

- Client provides cloud accounts, managed PostgreSQL, domain/TLS, and Gemini API access/billing.
- Timely access to stakeholders for reviews/UAT.
- Single-tenant deployment at GA.
- Course content is authored by the client (Nalanda provides the tooling, incl. Acharya).

## 8. Dependencies

- Google Gemini availability and quota.
- Cloud provider and managed PostgreSQL provisioning lead times.
- Client UAT availability.

## 9. Change Management

Scope changes are handled via written **Change Requests** describing impact on scope, timeline, and cost; work proceeds on mutual sign-off.

## 10. Commercials

> **ILLUSTRATIVE FIGURES** — example numbers for planning; replace with your validated rate card and estimates before contracting. Currency: USD.

### 10.1 Engagement model
Milestone-based **fixed fee** for GA (Workstreams A–F); **Time & Materials** for optional Phase-2 (Workstream G).

### 10.2 Rate card (illustrative day rates)
| Role | Day rate (USD) |
|---|---|
| Principal Engineer / Architect | 1,200 |
| Senior Engineer | 900 |
| Engineer | 700 |
| Product/Business Analyst | 800 |
| Security Engineer | 1,000 |
| DevOps/SRE | 950 |

### 10.3 GA fixed-fee milestones
| Milestone | Scope | Fee (USD) |
|---|---|---|
| M1 | Security finalization + DB durability (D1, D2) | 18,000 |
| M2 | Observability + CI/CD (D3, D4) | 22,000 |
| M3 | QA + UAT + documentation (D5, D6) | 20,000 |
| M4 | GA launch + hypercare (2 weeks) | 15,000 |
| **Total (GA)** | | **75,000** |

### 10.4 Optional Phase-2 (Scale) — T&M estimate
| Item | Estimate (USD) |
|---|---|
| Relational migration + multi-instance (D7), ~6 weeks blended team | 60,000 – 90,000 |

### 10.5 Recurring run costs (client-borne; see BCM §6)
Hosting, managed PostgreSQL, Gemini usage, observability, and support/maintenance — estimated **~$45,000/year** (illustrative; see BCM for the breakdown).

### 10.6 Invoicing & terms
Invoiced on milestone acceptance (M1–M4); Net-30 (placeholder). Phase-2 billed monthly on T&M with an agreed not-to-exceed cap. Expenses (cloud, licenses) passed through at cost or borne by client per §7.

- See **BCM** for the cost model, benefits, ROI, and payback.

## 11. Acceptance & Sign-off

GA is accepted when D1–D6 acceptance criteria are met and the go/no-go gate (TRD §14) passes. Sign-off recorded by the Accountable parties below.

| Name | Role | Signature | Date |
|---|---|---|---|
| | Client Sponsor | | |
| | CTO | | |
| | Provider Lead | | |
