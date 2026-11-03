# Nalanda — PostgreSQL data-layer migration

Status: **in progress — skills, payment, identity, attempt and certificate boundaries built.**
Owner: Engineering. Updated: 2026-11-03.

> ⚠️ **This code is UNVERIFIED by the author.** It was written without a live
> PostgreSQL to execute against (per the agreed "build it blind, I'll test"
> approach). All JavaScript is syntax-checked; the SQL and runtime behavior MUST
> be validated against a real database using the steps in §4 before any cutover.
> It is feature-gated — most of the running app still uses the existing
> in-memory/JSONB snapshot store. `USE_PG_SKILLS`, `USE_PG_PAYMENTS`,
> `USE_PG_IDENTITY`, `USE_PG_ATTEMPTS` and `USE_PG_CERTIFICATES` must stay off until their
> live-database gates pass.

---

## 1. Background

- **Phase 1 (done):** durable storage adapter (`backend/db.js`) — persists the whole
  in-memory state as JSONB-per-collection in Postgres when `DATABASE_URL` is set,
  else an atomic JSON file. This removed the single-file corruption risk but keeps
  the entire dataset in process memory (no horizontal scale, no per-row queries).
- **Phase 2 (this):** move to **normalized relational tables** with per-row SQL,
  so the app can scale horizontally and query/aggregate in the database.

## 2. What's in this kickoff slice

```
backend/src/db/pool.js                      pooled pg client + query()/withTransaction()
backend/src/db/migrate.js                   forward-only migration runner (schema_migrations)
backend/src/db/bootstrap.js                 guarded empty-database baseline + migrations
backend/src/db/backfill.js                  app_state/JSON snapshot relational backfill
backend/src/db/verify-skills.mjs            one-command verification of the pilot
backend/src/repositories/skills.repository.pg.js   SQL repository (API-shaped output)
database/migrations/0001_skills.sql         reconciled skills + target_skills tables
database/migrations/0005_payment_runtime_cutover.sql price/currency + open-order invariant
backend/src/repositories/payments.repository.pg.js atomic payment/enrollment/audit ledger
database/migrations/0006_identity_runtime_cutover.sql identity runtime columns + trigger
backend/src/repositories/identity.repository.pg.js transactional identity/session authority
backend/src/db/verify-identity.mjs             live PostgreSQL identity verifier
database/migrations/0007_attempt_runtime_cutover.sql transactional exam/proctor state
backend/src/db/verify-attempts.mjs              live PostgreSQL attempt verifier
database/migrations/0008_certificate_authority.sql signed credential/revocation authority
backend/src/repositories/certificates.repository.pg.js transactional certificate authority
backend/src/db/verify-certificates.mjs          signature/issuance/revocation verifier
```

The **skills** bounded context is the pilot (like the certificates pilot for the
module refactor): small, low-risk, exercises the full pattern (schema → migration
→ repository → backfill → verify → cutover).

## 3. Schema reconciliation decisions

The original `database/schema.sql` diverged from the running app. Decisions for
the relational target:

| Topic | Original schema | App reality | Decision |
|---|---|---|---|
| IDs | `UUID DEFAULT gen_random_uuid()` | string ids (`SKILL-SEC`, `TS-001`, `EMP-1001`) | **TEXT ids** — migrate storage, keep identifiers + API contract |
| Timestamps | `TIMESTAMPTZ` | ISO strings via `now()` | TIMESTAMPTZ columns; repo maps `created_at` ⇄ `createdAt` (ISO) |
| `attempt_status` | ENUM without `Passed`/`Failed` | app writes `Passed`/`Failed` (seed) + `Submitted`/`PendingManualReview`/`AutoSubmitted` | use **TEXT + CHECK** covering all observed values (avoid brittle ENUM) — *applies when attempts are migrated* |
| `enrollments` vs `assignments` | table `enrollments` | code uses `assignments` | table named `enrollments`; repository exposes `assignment`-shaped objects — *applies later* |
| Questions / answers | normalized `questions` table | inline `questions[]` array on assessment | **hybrid**: relational tables for entities, **JSONB columns** for genuinely document-like nested fields (`questions`, `answers`, `chapterTimeSpentSeconds`, proctor `flags`) — *applies later* |
| Enums (category/scope/priority/level/status) | PG ENUM types | zod enums in app | **TEXT + CHECK** mirroring the zod enums (simpler evolution, same guarantees) |

Naming: snake_case columns in SQL, camelCase in JS — repositories own the mapping.

## 4. How to run & verify (you do this against your Postgres)

```bash
# 1. Point at a throwaway/staging Postgres
export DATABASE_URL='postgres://user:pass@host:5432/nalanda'
export PGSSL=require        # 'require' (verify cert) | 'no-verify' (managed self-signed) | unset (local)

# 2. Create the normalized baseline when empty, then apply migrations.
# The command refuses to continue over a partial relational schema.
npm run db:bootstrap

# 3. Backfill the current app_state snapshot (or local db.json fallback)
npm run db:backfill

# 4. One-command pilot verification (migrate + backfill + exercise repo + cleanup)
node backend/src/db/verify-skills.mjs
#    Expect all lines to start with "ok"; any "FAIL" is a real problem to fix.

# 5. Exercise identity/session invariants with self-cleaning synthetic data
npm run db:verify-identity
npm run db:verify-attempts
npm run db:verify-certificates
```

If `verify-skills.mjs` prints all `ok`, the pilot pattern is sound and we proceed
to wire it into the app (§5). If anything fails, tell me the output and I'll fix.

## 5. Cutover for the skills module (after verification)

The skills module currently mutates the in-memory `skills`/`targetSkills` arrays.
To switch it to Postgres, change its handlers to call the repository — example:

```js
// backend/src/modules/skills/skills.routes.js  (illustrative)
import * as skillsRepo from "../../repositories/skills.repository.pg.js";

app.post("/api/skills", authenticate, requireRole("Admin"), async (req, res) => {
  // ...validate with zod (unchanged)...
  const existing = await skillsRepo.findSkillByName(skill.name);
  if (existing) return res.status(409).json({ error: "Skill name already exists" });
  const saved = await skillsRepo.insertSkill(skill);
  audit(req.user.id, "CREATE_SKILL", "SKILL", saved.id);
  res.status(201).json({ data: saved });
});
```

Handlers become `async`; reads (`listSkills`) replace the array reads in
`/api/app-data`. Because the repository returns the **same shapes**, the API
contract and the frontend are unchanged. Verify with the existing Wave-1 smoke
harness (`tmp-dev-logs/wave1-smoke.sh`) pointed at a server booted with
`DATABASE_URL` set, diffed against the in-memory build.

**Dual-run option:** keep both behind a flag (`USE_PG_SKILLS=1`) so you can switch
per-entity and roll back instantly.

## 6. Per-entity rollout checklist (remaining work)

For each bounded context, in roughly ascending coupling:

- [x] skills, target_skills  *(pilot — schema + repo + backfill)*
- [x] skills/target_skills **module cutover wired behind `USE_PG_SKILLS=1`** —
      default-off path verified unchanged; on-path uses Postgres (verify against a real DB)
- [x] payment order/transaction/webhook repository and atomic entitlement/audit
      settlement built behind `USE_PG_PAYMENTS=1` (live-DB gate still pending)
- [ ] chapter_feedbacks
- [x] users/session authority repository, audit and Redis login lockouts behind
      `USE_PG_IDENTITY=1` (live-DB and failover gate still pending)
- [x] Authenticated assessment attempts, grading/enrollment transitions and
      proctor evidence are implemented behind `USE_PG_ATTEMPTS=1` (Phase 8;
      live-DB concurrency and cross-task gate still pending)
- [x] Signed certificate issuance, active-credential uniqueness, enrollment
      certification, public verification and revocation are implemented behind
      `USE_PG_CERTIFICATES=1` (Phase 9; live-DB/cross-task gate still pending)
- [ ] courses (price/currency schema and repository mapping complete; route-wide
      source-of-truth cutover remains)
- [ ] chapters  (+ chapter_time_totals / learning_time_events)
- [ ] assessments (+ questions as JSONB)  ·  enrollments(assignments)
- [x] attempts (+ answers/flags as JSONB; reconcile status CHECK)
- [x] proctoring_logs  ·  certificates
- [ ] archives  ·  audit_logs / security_events (certificate/attempt audit rows
      are durable, but application-wide audit authority remains incomplete)
- [ ] reports, analytics → convert aggregates to SQL (`GROUP BY`, views)
- [ ] remove the in-memory arrays + JSON-blob adapter; externalize rate-limit /
      session / lockout state to enable **multi-instance** horizontal scaling

Each entity: add migration SQL → repository → backfill → verify → wire module
(async) → smoke-diff → commit. Same discipline as the module refactor waves.

## 7. Risks / open items

- **Unverified SQL** (this slice) — must pass §4 before trusting it.
- **Payment cutover remains disabled** until the live PostgreSQL and concurrency
  gates in `SECURITY-PHASE-6-PAYMENT-PERSISTENCE.md` pass.
- **`now()`-seeded timestamps** are identical across seed rows, so list ordering
  by `created_at` is approximate; if exact order matters, add a sort key.
- **Backfill source** prefers the PostgreSQL `app_state` snapshot, then local
  `database/db.json`, and only uses seed state when neither contains data.
- **Transactions across entities** (e.g., course delete cascading to chapters/
  assessments/enrollments + archive) must move into a single `withTransaction`
  when those entities are migrated, to preserve the current all-or-nothing behavior.
