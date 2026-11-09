---
title: "Nalanda — Business Continuity & Disaster Recovery Plan (BCP/BCM)"
product: "Nalanda Training & Development Platform"
version: "1.0"
status: "Draft for Review"
date: "2026-06-22"
---

# Nalanda — Business Continuity & Disaster Recovery Plan (BCP / BCM)

| Field | Value |
|---|---|
| Document | Business Continuity Management & Disaster Recovery Plan |
| Product | Nalanda LMS |
| Owner | CTO / SRE (Axiora Global Solutions) |
| Version | 1.0 (Draft for Review) |
| Date | 2026-06-22 |
| Related | TRD (§6 Persistence, §10 Observability), SOW, BCM (Business Case) |

> **Scope note.** This is the standalone Business Continuity / Disaster Recovery plan. The investment-facing continuity *summary* lives in the Business Case (BCM, §9); this document is the operational plan.

---

## 1. Purpose & Scope

Define how Nalanda **prevents, withstands, and recovers from** disruptions — infrastructure failure, dependency outage, data loss, security incident, and personnel unavailability — so that training, assessment, and certification services remain available and data stays intact.

In scope: the Nalanda API + SPA, its PostgreSQL datastore, the Gemini AI dependency, hosting/network, secrets, and operational personnel. Out of scope: client-owned course content authoring and client corporate IT.

## 2. Objectives & Targets

| Objective | Target (GA) |
|---|---|
| Service availability | ≥99.5% monthly (TRD NFR-1) |
| **RPO** (max acceptable data loss) | ≤ 15 minutes (bounded by DB backup/WAL cadence) |
| **RTO** (max acceptable downtime) | ≤ 60 minutes for app; ≤ 4 hours for full DR |
| Backup restore drill | Pass quarterly |
| Critical incident detection | ≤ 5 minutes (alerting) |

> RPO/RTO are proposed targets; confirm with the business and the managed-DB provider's backup capabilities, then ratify.

## 3. Business Impact Analysis (BIA)

| Function | Criticality | Impact if down | Max tolerable downtime |
|---|---|---|---|
| Authentication / access | Critical | No one can use the platform | 1 hour |
| Proctored assessments in progress | Critical | Lost attempts, integrity disputes | 1 hour |
| Course learning / content | High | Training stalls | 4 hours |
| AI course generation (Acharya) | Medium | Authoring delayed (fallback exists) | 1 day |
| Analytics / reporting | Medium | Decisions delayed | 1 day |
| Certificate issuance | Medium | Recognition delayed | 1 day |
| Audit log availability | High (compliance) | Reduced traceability | 4 hours |

## 4. Architecture Resilience Posture (current)

Implemented controls that underpin continuity (see TRD §5–§6):
- **Durable, transactional persistence** (PostgreSQL via storage adapter) with atomic writes; **fail-fast** if the configured DB is unreachable (no silent data loss into ephemeral memory).
- **Graceful shutdown**: stop accepting connections → final state flush → close pool, on SIGTERM/SIGINT.
- **Write coalescing** to avoid save storms under load.
- **Soft-delete + archive** with restore for accidental/malicious deletion recovery.
- **Deterministic AI fallback** so a Gemini outage does not block course generation.
- **Bounded resource use** (rate limits, memory caps, upload limits) to resist overload/abuse.

Known limitation: single application instance at GA (in-memory working set) — a single point of failure until the Phase-2 relational migration enables multi-instance. Mitigated by fast redeploy + managed DB.

## 5. Backup & Data Protection

| Asset | Method | Frequency | Retention | Verification |
|---|---|---|---|---|
| PostgreSQL data | Managed automated backups + PITR/WAL | Continuous (PITR) + daily snapshot | ≥30 days | Quarterly restore drill |
| Secrets/config | Secret manager with versioning | On change | Per policy | Access review |
| Application artifact | Container image registry / build artifact | Per release | Last N releases | Redeploy test |
| Audit logs | Persisted in datastore (+ export option) | Continuous | Per compliance policy | Spot checks |
| Proctoring captures (if enabled) | Storage with retention limit | On capture | Minimal (privacy) | Policy review |

**File-fallback note:** the JSON file mode (no `DATABASE_URL`) is **not** a production continuity strategy — it is single-host and unbacked. Production must run on managed PostgreSQL.

## 6. Disaster Recovery Procedures (Runbooks)

> Each runbook should live in the ops wiki with owner + last-tested date. Summaries below.

### RB-1 — Application instance failure
1. Alert fires (health/uptime). 2. Orchestrator/health check restarts container. 3. On boot, app `loadDb()` rehydrates from PostgreSQL. 4. Verify `/api/health` 200 + login. **RTO target: ≤15 min.**

### RB-2 — Database unavailable / failover
1. App readiness fails closed while liveness remains available. 2. Multi-AZ RDS
promotes its synchronous standby and retains the endpoint hostname. 3. Existing
connections are discarded and pools reconnect through refreshed DNS. 4. Verify
the durable marker, `/api/ready`, writer Availability Zone and unchanged ECS
task. If automatic recovery fails, stop writers and execute the isolated PITR
restore procedure. **Target failover RTO ≤15 min; restore RTO ≤60 min; RPO ≤15
min** (PITR).

### RB-3 — Data corruption / bad deploy
1. Halt writes (scale to zero or maintenance mode). 2. PITR restore to timestamp before corruption. 3. Redeploy known-good artifact. 4. Validate audit log + sample records. 5. Resume.

### RB-4 — Accidental/malicious entity deletion
1. Super Admin opens **Archive**. 2. Locate snapshot (reason/who/when recorded). 3. **Restore** entity (+ related data). 4. Confirm + audit.

### RB-5 — Gemini (AI) outage or quota exhaustion
1. Symptom: AI errors/timeouts. 2. App auto-uses **deterministic fallback** generator (no action needed for continuity). 3. Monitor cost/quota alerts; raise quota or rotate key as needed. 4. Communicate degraded-AI status to authors.

### RB-6 — Secret compromise / key rotation
1. Revoke/rotate `JWT_SECRET` (invalidates all sessions — forces re-login), `GEMINI_API_KEY`, DB creds. 2. Redeploy with new secrets. 3. Review audit logs for misuse. 4. Post-incident review.

### RB-7 — Security incident (breach/abuse)
1. Contain (block source, revoke tokens, rotate secrets). 2. Preserve audit logs. 3. Assess scope. 4. Notify per policy/regulation. 5. Remediate + post-mortem.

### RB-8 — Region/provider outage
1. Restore latest backup to alternate region/provider. 2. Deploy artifact there. 3. Repoint DNS. 4. Validate. **RTO ≤4 h** (full DR).

## 7. Incident Response Roles (RACI)

| Role | Responsibility |
|---|---|
| Incident Commander (IC) | Owns the incident, declares severity, coordinates |
| Ops/SRE | Executes runbooks, restores service |
| Engineering on-call | Diagnoses/patches application issues |
| Security lead | Leads security incidents, forensics |
| Comms lead | Stakeholder/customer communication |
| Product/Sponsor | Business decisions, customer relations |

### Severity matrix
| Sev | Definition | Response |
|---|---|---|
| Sev-1 | Full outage / data loss / breach | Immediate, all-hands, IC engaged |
| Sev-2 | Major degradation (e.g., assessments failing) | Urgent, on-call + IC |
| Sev-3 | Minor/partial (e.g., AI degraded to fallback) | Normal business hours |

## 8. Communications Plan

- **Internal:** incident channel + status updates at defined cadence (Sev-1: every 30 min).
- **Customers/stakeholders:** status page / email for Sev-1/2 with impact, ETA, workaround.
- **Post-incident:** blameless post-mortem within 5 business days (timeline, root cause, corrective actions, owners).

## 9. Dependencies & Single Points of Failure

| Dependency | Risk | Continuity control |
|---|---|---|
| PostgreSQL (managed) | Data tier outage | Backups + PITR + replica/failover (RB-2) |
| Gemini API | AI unavailable/costly | Deterministic fallback (RB-5), quotas, key rotation |
| Single app instance | SPOF (GA) | Fast redeploy + health checks; Phase-2 multi-instance |
| Secrets store | Access loss/compromise | Versioned secret manager, rotation runbook (RB-6) |
| TLS/reverse proxy | Ingress failure | Provider redundancy / redeploy |
| Hosting region | Region outage | Cross-region restore (RB-8) |

## 10. Monitoring & Early Warning (continuity-relevant)

Per TRD §10: health/uptime checks, error-rate and latency alerts, auth-failure-spike alerts, AI cost-threshold alerts, backup-success monitoring, and disk/memory pressure alerts. Detection target ≤5 min.

## 11. Testing & Maintenance Schedule

| Activity | Frequency |
|---|---|
| Backup restore drill (RB-2/RB-3) | Quarterly |
| Failover/region DR test (RB-8) | Semi-annually |
| Archive restore test (RB-4) | Quarterly |
| Secret rotation drill (RB-6) | Semi-annually |
| Plan review & RPO/RTO ratification | Annually or post-incident |
| Tabletop incident exercise | Semi-annually |

## 12. Post-GA Improvements (continuity roadmap)

- **Phase-2 relational DB → multi-instance** (removes the single-instance SPOF; enables rolling deploys and HA).
- Keep rate-limit, login-lockout, companion and signaling state on the shared
  Multi-AZ Redis authority and rehearse failover regularly.
- Circuit breaker around Gemini; automated quota backpressure.
- Automated, alerting backup-restore verification.

## 13. Approvals

| Name | Role | Signature | Date |
|---|---|---|---|
| | CTO | | |
| | SRE/Ops Lead | | |
| | Security Lead | | |
| | Business Sponsor | | |
