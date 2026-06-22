---
title: "Nalanda — Business Case & Commercial Model (BCM)"
product: "Nalanda Training & Development Platform"
version: "1.0"
status: "Draft for Review"
date: "2026-06-22"
---

# Nalanda — Business Case & Commercial Model (BCM)

| Field | Value |
|---|---|
| Document | Business Case & Commercial Model (BCM) |
| Product | Nalanda LMS |
| Prepared for | Executive Sponsor / Investment Committee |
| Version | 1.0 (Draft for Review) |
| Date | 2026-06-22 |
| Related | PRD, SOW, TRD |

> **Interpretation note.** "BCM" is treated here as **Business Case & Commercial Model**. A **Business Continuity** summary is included in §9 because it is material to the investment decision. If you intended a standalone Business Continuity Management plan, this section can be expanded into its own document.

> **Financial figures are illustrative placeholders** for planning; replace with validated finance inputs before approval.

---

## 1. Executive Summary

Nalanda is an AI-accelerated Learning & Development platform that compresses course authoring from weeks to minutes (via the **Acharya** Gemini pipeline), enforces trustworthy competency assessment through proctoring and server-side scoring, and produces auditable training evidence. The MVP plus a security/durability hardening pass are complete. This business case recommends funding the **GA launch** and a follow-on **scale** phase, on the basis of strong cost-avoidance (instructional design + assessment tooling), compliance value, and a credible path to a productized SaaS offering.

**Recommendation:** Approve GA funding (Workstreams A–F) now; gate Phase-2 (scale) on early adoption metrics.

## 2. Problem & Opportunity

- **Problem:** Manual course authoring is slow/costly; unproctored assessments are untrustworthy; training outcomes are hard to prove to auditors and leadership; skill gaps are invisible.
- **Opportunity:** A single platform that (a) generates quality training with AI, (b) certifies competency credibly, and (c) provides skill-gap analytics — usable internally and sellable as SaaS.

## 3. Proposed Solution

The Nalanda platform (see PRD/FRD/TRD): RBAC, AI course generation with quality gates, proctored assessments with server scoring, certificates, skill taxonomy & targets, analytics/reporting, audit/archive governance — secure-by-default and durable.

## 4. Options Considered

| Option | Description | Verdict |
|---|---|---|
| **A. Do nothing** | Continue manual authoring + generic quiz tools | Rejected — high ongoing cost, weak assessment integrity |
| **B. Buy commercial LMS** | License a third-party LMS | Rejected/partial — license cost at scale, no Acharya AI authoring, limited customization, data residency concerns |
| **C. Build & launch Nalanda (recommended)** | Finish hardening, launch GA, scale | **Recommended** — differentiated AI authoring, owns data/IP, productizable |

## 5. Benefits

### 5.1 Quantifiable (cost avoidance / value)
- **Authoring efficiency:** ≥80% reduction in course creation time (PRD KPI). E.g., if an org produces *N* courses/year at *H* design-hours each at rate *R*, annual saving ≈ `N × H × R × 0.8`.
- **Tooling consolidation:** replaces separate authoring + quiz + proctoring + reporting tools.
- **Assessment integrity:** reduces re-test/audit costs from untrustworthy results.

### 5.2 Strategic / qualitative
- Defensible compliance evidence (audit trail, certificates).
- Owned IP and data; foundation for a SaaS revenue line.
- Faster skilling → measurable workforce capability gains.

## 6. Cost Model

> **ILLUSTRATIVE FIGURES** — example numbers for planning; replace with finance-validated inputs. Currency: USD.

### 6.1 One-time (build/launch — see SOW §10)
| Item | Cost (USD) |
|---|---|
| GA delivery (Workstreams A–F, milestones M1–M4) | 75,000 |
| *(MVP + security hardening + Phase-1 durability — already delivered)* | — |
| **One-time total (GA)** | **75,000** |
| Optional Phase-2 (scale) — later, gated | 60,000 – 90,000 |

### 6.2 Recurring (run) — annual estimate
| Cost item | Driver | Annual (USD) |
|---|---|---|
| Cloud hosting (app + LB) | instance size, traffic | 3,600 |
| Managed PostgreSQL | storage, IOPS, backups/PITR | 3,000 |
| Gemini API usage | tokens × generations/chats (**bounded** by rate limits, token caps, fallback) | 6,000 |
| Observability / error tracking | events/seats | 2,400 |
| Support & maintenance | ~0.25 FTE | 30,000 |
| **Annual run total** | | **~45,000** |

### 6.3 AI cost control (built-in)
Per-user AI rate limits, output-token caps, request timeouts, and a deterministic fallback generator cap worst-case spend and prevent cost-runaway abuse.

## 7. ROI / Payback (worked example)

> **ILLUSTRATIVE** — based on the assumptions below. Swap in your real figures to finalize.

### 7.1 Assumptions (replace with validated inputs)
| Input | Value |
|---|---|
| Courses authored / year | 60 |
| Manual design hours / course | 40 |
| Loaded hourly rate (instructional design) | $45 |
| Acharya authoring-time reduction | 80% |
| Tools consolidated (authoring/quiz/proctoring/reporting) | ~$24,000/yr avoided |
| Audit/re-test savings | ~$15,000/yr |

### 7.2 Annual benefit
| Component | Calculation | USD/yr |
|---|---|---|
| Authoring savings | 60 × 40 × $45 × 80% | 86,400 |
| Tooling consolidation | — | 24,000 |
| Audit/re-test savings | — | 15,000 |
| **Total annual benefit** | | **125,400** |

### 7.3 ROI & payback
| Metric | Calculation | Result |
|---|---|---|
| Annual run cost | (BCM §6.2) | 45,000 |
| **Net annual benefit** | 125,400 − 45,000 | **80,400** |
| One-time build (GA) | (BCM §6.1) | 75,000 |
| **Payback period** | 75,000 ÷ (80,400 ÷ 12) | **~11 months** |
| **First-year ROI** | 80,400 ÷ 45,000 | **~179%** |

*Authoring-time savings dominate, so payback inside the first year is realistic for mid-size L&D operations. Validate the assumption table with finance before approval.*

## 8. Commercial Model (if productized as SaaS)

| Element | Approach |
|---|---|
| Packaging | Per-seat (learner) tiers + admin seats; or per-active-learner/month |
| Add-ons | AI generation credits (Acharya), advanced proctoring, premium support |
| Deployment | Single-tenant managed (GA) → multi-tenant SaaS (post Phase-2) |
| Pricing levers | seat volume, AI usage, retention/compliance features |
| Gross-margin driver | AI cost control + multi-tenant efficiency (Phase 2) |

## 9. Business Continuity & Resilience (summary)

Material to the investment case given the audited "availability is security" stance:
- **Durability:** transactional PostgreSQL persistence + managed backups/PITR; atomic file fallback; graceful-shutdown flush.
- **Recovery:** soft-delete archive + restore; documented restore runbook (GA).
- **Availability target:** ≥99.5% (TRD NFR-1); single instance at GA, multi-instance after Phase-2.
- **Continuity risks & controls:** AI provider outage → deterministic fallback; single-instance failure → managed DB + fast redeploy + container health checks; secret compromise → fail-fast secret policy + rotation runbook.
- **RPO/RTO (to finalize):** RPO bounded by DB backup cadence; RTO by redeploy time — targets set at GA.

## 10. Key Risks & Mitigations (business)

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| AI cost variability | Med | Med | Rate limits, token caps, fallback, usage monitoring/alerts |
| Adoption below target | Med | High | UX polish, assignment workflows, manager dashboards, change mgmt |
| Compliance/privacy (proctoring) | Med | High | Consent, retention limits, scoped access, policy |
| Scale limits pre-Phase-2 | Med | Med | Gate growth on Phase-2; capacity monitoring |
| Vendor lock-in (Gemini) | Low | Med | Provider-abstracted AI layer + fallback |

## 11. Success Metrics (business)

Authoring-time reduction (≥80%), course completion (≥65%), adoption (≥70% started in 7 days), availability (≥99.5%), AI cost per active learner within budget, and (if SaaS) ARR/seat growth and gross margin.

## 12. Recommendation & Decision

**Approve GA funding now** (SOW Workstreams A–F) to launch a secure, durable, observable platform. **Gate Phase-2 (scale)** on achieving early adoption and reliability KPIs. Revisit SaaS productization post-GA based on internal results.

| Decision | Approver | Date |
|---|---|---|
| GA funding approved | Executive Sponsor | |
| Phase-2 gate criteria approved | CTO / Sponsor | |
