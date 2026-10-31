# Nalanda LMS — Production Deployment Guide & Architecture Topology

This document outlines the Go-To-Market (GTM) production deployment architecture, security configuration, and operational runbook for **Nalanda LMS**.

---

## 1. High-Level Architecture Topology

```
                   [ Cloudflare Edge CDN / WAF / DDoS Protection ]
                                         │
                                         ▼
                     [ Ingress Nginx / AWS ALB (TLS 1.3 Termination) ]
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
     [ Nalanda Node.js Express 5 API ]               [ Nalanda Node.js Express 5 API ]
               (Cluster Node 1)                                (Cluster Node 2)
                 │               │                               │               │
                 ▼               ▼                               ▼               ▼
        [ Redis Cluster ]  [ Cloudflare R2 / S3 ]       [ Redis Cluster ]  [ Cloudflare R2 / S3 ]
        (Sliding Window)   (Video Chunks & Media)       (Session Cache)    (Signed Documents)
                 │                                               │
                 └───────────────────────┬───────────────────────┘
                                         ▼
                     [ Managed PostgreSQL 16 (Primary + Replica) ]
                                (PgBouncer Pooling)
```

---

## 2. Infrastructure Requirements & Sizing

| Component | Minimum Production Spec | Recommended Enterprise Spec | High-Availability Config |
|---|---|---|---|
| **API Servers** | 2 vCPU, 4GB RAM (2 instances) | 4 vCPU, 8GB RAM (3+ auto-scaling) | Multi-AZ with Health Checks |
| **PostgreSQL** | 2 vCPU, 8GB RAM, 100GB SSD | 4 vCPU, 16GB RAM, 500GB NVMe | Multi-AZ with Read Replica & Automated PITR |
| **Redis** | 1GB RAM (Standalone) | 4GB RAM (Redis Cluster with persistence) | Redis Sentinel / Multi-node Cluster |
| **Object Store** | Cloudflare R2 / AWS S3 | Cloudflare R2 / AWS S3 + Global CDN | Zero-egress R2 or S3 Cross-Region Replication |

---

## 3. Environment Variable Manifest (`.env.production`)

```bash
# Core Environment
NODE_ENV=production
PORT=4000
BASE_URL=https://platform.nalanda.edu

# Security & Sessions
JWT_SECRET=YOUR_64_CHAR_CRYPTOGRAPHIC_JWT_SECRET
CERTIFICATE_SIGNING_SECRET=YOUR_64_CHAR_CERTIFICATE_SECRET
COOKIE_SECURE=true
COOKIE_SAMESITE=strict
CORS_ORIGIN=https://platform.nalanda.edu

# PostgreSQL (Production Connection)
USE_PG=1
DATABASE_URL=postgresql://nalanda_admin:SECURE_PASSWORD@pgbouncer.internal:6432/nalanda_prod
PGSSL=require

# Redis (Rate Limiting & Session Cache)
REDIS_URL=redis://default:REDIS_PASSWORD@redis.internal:6379

# Cloud Object Storage (S3 / Cloudflare R2 / MinIO)
AWS_ACCESS_KEY_ID=R2_OR_S3_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=R2_OR_S3_SECRET_KEY
S3_BUCKET=nalanda-production-media
S3_REGION=auto
S3_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com

# Razorpay Commercial Payment Gateway
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_SECRET_KEY
RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SIGNING_SECRET

# AI Vision & Course Generation
GEMINI_API_KEY=YOUR_ENTERPRISE_GEMINI_API_KEY
GEMINI_MODEL=gemini-2.5-flash

# Compliance & Retention
PROCTORING_RETENTION_DAYS=90
LOG_LEVEL=info
```

---

## 4. Production Deployment Checklist

1. **Database Schema & Migrations**:
   ```bash
   # Initialize tables, indexes, triggers, and views
   psql -d $DATABASE_URL -f database/schema.sql
   node backend/src/db/backfill.js
   ```

2. **Frontend Production Build**:
   ```bash
   npm ci --omit=dev
   npm run build
   ```

3. **Process Supervision (PM2 / Systemd / Docker)**:
   ```bash
   # PM2 Cluster Mode (Utilizes all CPU cores)
   pm2 start backend/server.js -i max --name nalanda-api
   pm2 save
   ```

4. **Verify Health & Telemetry**:
   ```bash
   curl -s http://localhost:4000/api/health | jq .
   ```

---

## 5. Security & Compliance Verification

- [x] All mutating routes (POST/PUT/PATCH/DELETE) enforce Double-Submit Cookie CSRF headers.
- [x] Passwords hashed with bcrypt (salt cost 10).
- [x] Proctoring video chunks stream directly to durable object storage.
- [x] Certificates cryptographically signed with HMAC-SHA256.
- [x] Candidate test browsers stripped of answer keys.
- [x] GDPR Article 17 (Right to Erasure) and Article 20 (Data Export) verified.

