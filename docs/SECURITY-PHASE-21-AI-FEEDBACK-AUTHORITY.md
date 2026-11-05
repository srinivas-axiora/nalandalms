# Phase 21 — scoped AI feedback authority

Date: 2026-11-05
Status: **implemented, feature-gated, live PostgreSQL proof pending**
Production decision: **NO-GO remains unchanged**

## Outcome

When `USE_PG_COURSES=1`, Acharya generation feedback is stored in PostgreSQL
and prompt memory is scoped by the authenticated actor. Managers can list and
reuse only their own feedback; Admins can review organization feedback.

## Controls implemented

- Migration `0015_ai_feedback_authority.sql` adds constrained durable feedback.
- Manager list and relevance queries enforce `created_by` scope inside SQL.
- Only active, unexpired feedback can influence generation; retention is 180
  days by default.
- Relevance ranking is deterministic and limited to five records.
- Feedback creation and redacted audit evidence commit atomically.
- Request fields are strict, bounded and enum-validated.
- Legacy backfill admits only unexpired records with valid UUIDs and existing
  creators.
- Privacy export and erasure cover the new feedback data class.

## Local evidence

- Repository tests cover Manager creator scope, transactional audit writes and
  scoped relevance retrieval.
- Route tests prove the relational cutover delegates listing and creation.
- AI generation boundary tests continue to pass.
- `db:verify-ai-feedback` creates two Managers and proves cross-manager prompt
  isolation, Admin review scope and durable audit evidence before cleanup. It
  fails closed without PostgreSQL configuration.

Checkpoint evidence on 2026-11-05:

- `npm test`: 48 files and 254 functional tests passed.
- `npm run test:security`: 1 file and 32 adversarial tests passed.
- `npm run typecheck`: passed with no TypeScript errors.
- `npm run build`: production build passed (996 modules transformed); the
  existing approximately 1,010 kB JavaScript bundle warning remains.
- `npm run routes:inventory`: passed with Phase-21 feedback scope descriptions.
- `npm audit --json`: 0 vulnerabilities across 393 dependencies.
- Repository, verifier and backfill syntax checks passed; `git diff --check`
  passed apart from the existing line-ending notice.

## Required staging gate

After migration and backfill in isolated staging, run:

```powershell
npm run db:verify-ai-feedback
```

Also verify expiry exclusion, privacy export/erasure, rollback on injected audit
failure, and that one Manager's low-rating comment never appears in another
Manager's generated prompt.

## Remaining blockers

Live PostgreSQL and Gemini-provider tests remain pending. Provider contractual
retention, data classification, aggregate token budgets and organization-level
kill switches require deployment evidence. Production cutover remains disabled.
