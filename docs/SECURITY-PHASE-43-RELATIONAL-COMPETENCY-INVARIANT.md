# Phase 43 — Relational competency runtime invariant

Date: 2026-11-08
Status: **implemented, feature-gated, live staging proof pending**

## Outcome

`USE_PG_COURSES=1` now implies relational competency authority even when
`USE_PG_SKILLS` is not independently enabled. Skills, target competencies,
ratings, chapter feedback, application projections and local course
recommendations therefore use one PostgreSQL-backed learning record.

The shared invariant also preserves the legacy `USE_PG=1` behavior. This closes
a split in which relational course and enrollment data could be combined with
task-local competency evidence, producing inconsistent recommendations and
losing learner feedback across application tasks.

Readiness now verifies all four competency tables, and relational privacy
readiness requires the competency authority whose ratings and feedback it must
export or erase.

## Verification

- A truth-table regression covers the legacy global flag, skills flag and
  course-cutover implication.
- A route regression proves course cutover alone writes chapter feedback through
  relational enrollment and chapter scope.
- Local Copilot regression proves recommendation skills, targets and ratings are
  read from relational repositories during course cutover.
- Architectural source gates cover server projections, skill mutations and the
  local recommendation engine.
- Course-cutover readiness now requires skills, targets, ratings and feedback
  tables in normalized storage.
- Focused competency, AI, app-data, readiness and runtime suites pass.
- Functional suite: **80 files / 367 tests passed**.
- Adversarial security suite: **1 file / 32 tests passed**.
- JavaScript syntax checks, frontend TypeScript checking and the production
  Vite build passed.
- Authorization inventory remains **129 routes**.
- `git diff --check` passed. The production build retains the existing
  non-blocking large JavaScript bundle warning (1,010.55 kB; 283.21 kB gzip).

## Remaining release blockers

- Exercise concurrent feedback upserts, target changes and rating updates across
  multiple ECS tasks against staging RDS.
- Run the skills and operational-authority verifiers against the staged schema
  and reconcile legacy targets with missing referenced skills or users.
- Validate recommendation changes after competency updates and confirm privacy
  export/erasure coverage on real relational rows.

Production decision remains **NO-GO**.
