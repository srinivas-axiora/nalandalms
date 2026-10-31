# Nalanda LMS — Production Incident Response & Operational Runbook

This runbook provides emergency protocols, disaster recovery procedures, and standard operating procedures (SOPs) for the Nalanda engineering on-call rotation.

---

## 1. Incident Severity Definitions

| Severity | Definition | Response SLA | Action Trigger |
|---|---|---|---|
| **P0 — Catastrophic** | Platform down, live proctored exams failing across cohorts, payment gateway outage. | 15 minutes | Auto-page entire engineering leadership. |
| **P1 — Critical** | Proctoring video chunk uploads degraded, high error rate on `/api/assessments`, slow DB queries. | 1 hour | On-call engineer assigned, status page updated. |
| **P2 — Moderate** | Single course enrollment glitch, non-critical background job failure, minor UI visual bug. | 4 hours | Normal business hours ticket. |

---

## 2. Emergency Operational Playbooks

### Playbook A: Live High-Stakes Exam Outage
**Symptom:** Candidates report exams freezing or cannot submit answers.
1. Check `/api/health` for DB connectivity or memory leaks:
   ```bash
   curl -I https://platform.nalanda.edu/api/health
   ```
2. Check Redis sliding-window rate limiters:
   ```bash
   redis-cli -u $REDIS_URL PING
   ```
3. If specific candidate clocks need to be paused during investigation:
   - Use the **Live Proctoring Cockpit** (`/proctor-cockpit`) and click **Pause** on affected candidate tiles. This pauses the server-side exam countdown clock.
   - Once resolved, click **Resume** (the platform automatically recalculates `expiresAt` with the exact paused duration credited back to the candidate).

### Playbook B: PostgreSQL Connection Saturation
**Symptom:** `500 Internal Server Error` with `too many connections for role`.
1. Inspect PgBouncer pool status:
   ```bash
   psql -p 6432 -U pgbouncer -c "SHOW POOLS;"
   ```
2. Terminate idle connections older than 10 minutes:
   ```sql
   SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND state_change < now() - INTERVAL '10 minutes';
   ```

### Playbook C: GDPR Data Deletion / Right to Erasure Execution
**Symptom:** Candidate requests permanent erasure of account and proctoring video history under GDPR / DPDPA.
1. Verify candidate has filed request via `/api/users/me/delete-request`.
2. After 30-day grace period, execute hard purge:
   ```bash
   # Run retention cleanup for user's video chunks and records
   node -e "require('./backend/src/workers/retention-cleanup.js').runRetentionCleanup({ retentionDays: 0 });"
   ```

---

## 3. Disaster Recovery & Database Point-in-Time Recovery (PITR)

To restore from an automated backup snapshot:
```bash
# 1. Stop application traffic
pm2 stop all

# 2. Restore PostgreSQL snapshot
pg_restore -h pgbouncer.internal -U nalanda_admin -d nalanda_prod --clean --if-exists backup_snapshot.dump

# 3. Verify schema and integrity
psql -d $DATABASE_URL -c "SELECT count(*) FROM users; SELECT count(*) FROM issued_certificates;"

# 4. Restart application
pm2 restart all
```

