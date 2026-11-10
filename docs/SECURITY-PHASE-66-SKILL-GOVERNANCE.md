# Security remediation Phase 66: skill governance integrity

Captured: 2026-11-10 (Asia/Calcutta)  
Branch: `security-phase-0-baseline`

## Outcome

Skill administration no longer has parallel validation models or unvalidated
status mutations. Canonical and compatibility endpoints share the same strict
handlers, and every skill/target mutation requires a recent step-up session.
Compatibility routes remain available with deprecation headers so existing
clients can migrate without preserving a weaker security path.

Target competency rules now require exactly the reference appropriate to their
scope. The referenced skill must exist and be active; department, designation
or employee scopes must resolve to an active user population. Snapshot mode
enforces this in application policy. Relational skill creation, status changes
and target creation each couple the domain mutation and audit evidence in one
transaction; target creation also locks and validates its authority first.

Migration `0022_skill_governance_integrity.sql` adds skill/user foreign keys,
exact scope/reference checks and a positive score constraint. Constraint
validation intentionally fails deployment if historical data is inconsistent,
requiring explicit reconciliation rather than silent loss.

## Verification status

| Gate | Result |
|---|---|
| Functional suite | 106 files, 498 tests passed |
| Isolated adversarial suite | 33 tests passed |
| TypeScript | Passed |
| Production frontend build | Passed; existing 1,007.43 kB chunk warning remains |
| Dependency audit | 0 vulnerabilities across 414 dependencies |
| CloudFormation structure | 81 resources, 33 outputs |
| Authorization inventory | 129 route policies |
| JavaScript syntax | 361 files passed |
| PowerShell syntax | 9 files passed |
| OpenAPI YAML | Parsed successfully |
| Patch hygiene | `git diff --check` passed |

## Current decision

This phase closes the documented skill-governance gaps and all local gates are
green. Production remains **NO-GO** until migration `0022` is exercised against
the intended PostgreSQL staging data and the complete live AWS staging
attestation passes.
