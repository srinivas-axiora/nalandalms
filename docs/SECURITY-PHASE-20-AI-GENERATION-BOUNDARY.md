# Phase 20 — AI generation boundary

Date: 2026-11-05
Status: **implemented locally; provider evaluation pending**
Production decision: **NO-GO remains unchanged**

## Outcome

AI course generation is now draft-only. The duplicate non-stream handler that
directly inserted generated courses, chapters and assessments into snapshot
arrays has been removed. Generated material must be reviewed and published
through the normal course, chapter and assessment authorities.

## Controls implemented

- One strict request schema is used by streaming and non-stream generation.
- Source material is limited to 50 through 50,000 characters.
- Chapter count is an integer from 1 through 20; course level is an enum.
- Skill identifiers/names are bounded and unknown request keys are rejected.
- Sending content to Gemini requires explicit `useProviderGeneration: true`.
  Merely configuring a provider key no longer causes external data transfer.
- The non-stream endpoint has one handler and always returns a reviewable draft.
- AI generation no longer mutates snapshot course, chapter or assessment state.

## Local evidence

- Oversized source material is rejected before generation.
- Unknown generation controls are rejected.
- A generic non-stream request returns a deterministic review draft while the
  course collection remains unchanged.
- JavaScript syntax and whitespace checks pass.

Checkpoint evidence on 2026-11-05:

- `npm test`: 46 files and 249 functional tests passed.
- `npm run test:security`: 1 file and 32 adversarial tests passed.
- `npm run typecheck`: passed with no TypeScript errors.
- `npm run build`: production build passed (996 modules transformed); the
  existing approximately 1,010 kB JavaScript bundle warning remains.
- `npm run routes:inventory`: passed and reports one non-stream generation
  endpoint with the Phase-20 controls.
- `npm audit --json`: 0 vulnerabilities across 393 dependencies.
- JavaScript syntax and `git diff --check` passed apart from the existing Git
  line-ending notice.

## Required staging gate

Using a dedicated non-production Gemini project and synthetic content:

1. Prove provider calls occur only with explicit opt-in.
2. Exercise 50, 50,000 and 50,001 character boundaries.
3. Exercise 1 and 20 chapter boundaries and upstream timeout/quota failures.
4. Validate generated HTML and question structures before publication.
5. Confirm drafts cannot create relational content without the standard
   ownership, approval and audit workflows.

## Remaining blockers

Generation feedback still uses cross-manager process-local memory and can
influence later prompts. It requires relational actor scope, retention, review
and audit controls. Provider DPA/retention terms, content classification, token
budgets and live failure testing are also unverified. `USE_PG_COURSES=1`
remains rejected by production readiness until the full secondary-consumer and
staging reconciliation checklist is complete.
