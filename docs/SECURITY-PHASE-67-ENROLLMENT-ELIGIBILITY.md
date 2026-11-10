# Security remediation Phase 67: enrollment eligibility authority

Captured: 2026-11-10 (Asia/Calcutta)
Branch: `security-phase-0-baseline`

## Outcome

Course prerequisites are now a server-side entitlement rule. Free
self-enrollment checks durable completion evidence for every prerequisite in
both snapshot and relational modes. Existing enrollment remains idempotent and
is returned before a new eligibility decision.

Paid checkout applies the same policy before creating a provider order. New
payment-order records bind the course version, exact prerequisite IDs and the
eligibility decision time. The relational insert re-locks the course, verifies
price/currency/version/prerequisites and rechecks completion inside the order
transaction. Settlement trusts only such an immutable bound order, preventing
course edits between checkout and provider capture from silently changing the
entitlement contract.

Migration `0023_enrollment_prerequisite_authority.sql` adds the binding fields,
expires older unbound open orders, requires the fields on every new insert and
extends the existing immutability trigger. Historical paid ledger evidence is
not rewritten.

## Verification status

| Gate | Result |
|---|---|
| Functional suite | 109 files, 509 tests passed |
| Isolated adversarial suite | 33 tests passed |
| TypeScript | Passed |
| Production frontend build | Passed; existing 1,007.43 kB chunk warning remains |
| Dependency audit | 0 vulnerabilities across 414 dependencies |
| CloudFormation structure | 81 resources, 33 outputs |
| Authorization inventory | 129 route policies |
| JavaScript syntax | 365 files passed |
| PowerShell syntax | 9 files passed |
| OpenAPI YAML | Parsed successfully |
| Patch hygiene | `git diff --check` passed |

## Current decision

The documented prerequisite-policy gap is closed locally. Production remains
**NO-GO** until migration `0023` and the end-to-end checkout/enrollment paths
pass in the intended AWS staging environment. The production frontend bundle
also remains above the configured chunk-size warning threshold and should be
split before treating frontend performance as production-ready.
