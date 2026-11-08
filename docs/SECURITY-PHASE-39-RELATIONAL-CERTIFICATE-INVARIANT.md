# Phase 39 — Relational certificate runtime invariant

Date: 2026-11-08
Status: **implemented, feature-gated, live staging proof pending**

## Outcome

`USE_PG_COURSES=1` now implies relational certificate authority even when
`USE_PG_CERTIFICATES` is not independently enabled. Certificate eligibility,
manual issuance, auto-issuance, revocation, readiness and `/api/app-data`
projections therefore cannot fall back to process-local courses, enrollments,
attempts or certificate arrays during a relational learning cutover.

The existing transactional repository remains the authority: it locks the
learner/course issuance key, rechecks enrollment and passed-attempt evidence,
prevents duplicate active credentials, updates enrollment state and writes the
audit record in the same transaction.

## Verification

- A truth-table regression proves relational certificate authority is enabled
  by either the certificate flag or the course flag.
- The architectural runtime-mode gate rejects direct certificate-flag branches
  in server and route wiring.
- The course-cutover readiness regression proves certificate schema validation
  becomes mandatory in normalized mode.
- Existing certificate service and repository regressions remain green.
- Full functional suite: **76 files / 344 tests passed**.
- Adversarial security suite: **1 file / 32 tests passed**.
- JavaScript syntax validation, frontend typecheck and production build pass.
- Authorization inventory remains **129 routes**.
- The production build retains the known large-bundle warning
  (approximately 1,010.55 kB / 283.21 kB gzip).

## Remaining release blockers

- Exercise concurrent auto/manual issuance, revocation and retry behavior
  across multiple ECS tasks against staging RDS.
- Reconcile any credentials created by builds that used snapshot eligibility.

Production decision remains **NO-GO**.
