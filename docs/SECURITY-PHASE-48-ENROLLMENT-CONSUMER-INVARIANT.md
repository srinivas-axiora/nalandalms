# Phase 48 — Relational enrollment-consumer invariant

Date: 2026-11-08
Status: **implemented, feature-gated, live staging proof pending**

## Outcome

The final source and route audit found no enrollment consumer that remains on
process-local `assignments` state when `USE_PG_COURSES=1`. The previously open
migration item was stale after the authority and invariant work in Phases
13–46. It is now closed with an explicit consumer matrix and an additional
route regression for transactional assessment start.

No AWS flag or production interlock changed. Process-local implementations are
still supported as the development/legacy path when course cutover is off.

## Consumer matrix

| Surface | Course-cutover authority |
|---|---|
| Course discovery and self-enrollment | course authority repository |
| Assignment administration | assignment authority repository |
| Cohort membership and capacity | cohort authority repository |
| Chapter access, heartbeat and completion | learning authority repository |
| Managed-content download authorization | learning authority repository |
| Assessment eligibility and attempt start | assessment authority transaction |
| Submission, manual grading and proctor transitions | attempt repository transaction with enrollment transition |
| Payment-created entitlement | payment settlement transaction |
| Certificate issuance and revocation | certificate/enrollment transaction |
| Analytics, reports and application projections | relational scoped repositories |
| Local Copilot learning context | relational course, enrollment, chapter and assessment projections |
| Privacy, archive and audit coverage | relational privacy, archive and evidence repositories |

The assessment-start regression is important because that boundary previously
called the snapshot `canAttemptAssessment` helper. With course cutover enabled,
the handler now proves it calls `assessmentAuthorityRepository.startAttempt`,
which locks and verifies the relational course, enrollment, completed chapters,
existing active attempt and question set before inserting the attempt in the
same transaction.

## Verification

- Focused assessment cutover tests cover relational listing and transactional
  attempt start without snapshot enrollment lookup.
- Existing cutover tests cover assignments, cohorts, chapter/content access,
  analytics, reports, payments, certificates, candidates, Copilot and app-data.
- The course cutover still implies relational attempt, certificate, candidate,
  payment, settings, skill, identity, privacy and audit runtime modes.
- Functional suite: **85 files / 388 tests passed**.
- Adversarial security suite: **1 file / 32 tests passed**.
- JavaScript syntax checks, frontend TypeScript checking, local CloudFormation
  validation and the production Vite build passed.
- Authorization inventory remains **129 routes** and `git diff --check` passed.
- The existing non-blocking large JavaScript bundle warning remains
  (1,010.55 kB; 283.21 kB gzip).
- No AWS feature flag was enabled and production still rejects experimental
  course cutover.

## Remaining release blockers

- Apply all migrations and backfills to staging RDS, run every verifier, and
  reconcile row counts and sampled records against the legacy snapshot.
- Exercise the complete learner-to-certificate lifecycle concurrently across
  at least two ECS tasks, including ownership and role changes mid-request.
- Prove backup restore, rollback, failover, privacy erasure, payment
  reconciliation and proctor-media deletion in the production-shaped stack.
- Remove the production course-cutover prohibition only after those artifacts
  are reviewed and the readiness interlock reports healthy dependencies.

Production decision remains **NO-GO**.
