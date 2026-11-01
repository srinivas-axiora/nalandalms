# Security remediation Phase 0 baseline

Captured: 2026-11-01 (Asia/Calcutta)  
Branch: `security-phase-0-baseline`

## Commands and observed results

| Command | Exit | Result |
|---|---:|---|
| `npm test` | 0 | 12 files passed; 110 tests passed; 11.14 seconds |
| `npm run build` | 0 | Vite 8.0.16 built 996 modules; main JS 1,008.67 kB (282.62 kB gzip) |
| `npm audit --json` | 1 | 14 vulnerable packages: 2 critical, 8 high, 3 moderate, 1 low |

The build warning reports a JavaScript chunk above 500 kB. Dependency findings
are deliberately recorded, not changed, in Phase 0; supply-chain remediation is
scheduled for Phase 10.

## Safety-net deliverables

- `npm run routes:inventory` emits the route authorization matrix as JSON.
- `tests/security/authorization-matrix.test.js` compares every registered
  Express route with the declared authentication, CSRF, step-up, rate-limit and
  resource-ownership policy.
- `tests/helpers/security-fixtures.js` supplies canonical-role user factories,
  an authenticated CSRF-aware Supertest client and resettable state isolation.
- The exploit regression suite remains separate under `npm run test:security`.
  Its red findings are remediation inputs, not Phase 0 baseline failures.

No ESLint configuration or lint script exists in the baseline repository.
TypeScript checking is exposed as `npm run typecheck` using the existing strict
frontend TypeScript configuration.

## Phase 0 exit-gate evidence

| Command | Exit | Final Phase 0 result |
|---|---:|---|
| `npm test` | 0 | 14 files passed; 117 tests passed; includes 7 new matrix/helper tests |
| `npm run typecheck` | 0 | Strict frontend TypeScript check passed with no diagnostics |
| `npm run build` | 0 | 996 modules built; main JS 1,008.57 kB (282.60 kB gzip); size warning remains |
| `git diff --check` | 0 | No whitespace errors |
| `npm run routes:inventory` | 0 | 120 declared policies: 101 session and 19 public/token surfaces |
| `npm run test:security` | 1 | Expected remediation baseline: 14 confirmed exploit assertions remain red |

The red exploit suite does not represent a Phase 0 infrastructure failure: it
is the test-first queue for Phases 1–4. Phase 0 is green because its functional,
build, type and authorization-contract gates pass while preserving every exploit
assertion unchanged.
