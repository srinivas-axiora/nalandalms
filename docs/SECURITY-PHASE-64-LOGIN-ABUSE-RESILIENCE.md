# Security remediation Phase 64: login abuse resilience

Captured: 2026-11-10 (Asia/Calcutta)  
Branch: `security-phase-0-baseline`

## Outcome

Login abuse controls no longer create an account-global denial-of-service
primitive. The endpoint keeps its distributed source-IP request budget and
uses a Redis-backed, normalized source/identifier pair for failed-password
state. A correct password is verified before that pair state is enforced and
clears the state, so guesses made from another source cannot lock the victim's
account.

Unknown, inactive and active identities all execute a bcrypt comparison. The
first four pair failures return the generic `Invalid credentials` response;
the fifth and later failures return a generic HTTP 429 with `Retry-After`.
Failure counts and lock timestamps are no longer disclosed in the response.

## Persistence and availability contract

- Production counters are Redis-authoritative and fail closed when Redis is
  unavailable.
- Development and tests retain only the existing process-local fallback.
- Abuse counters are deliberately absent from durable application snapshots;
  legacy `loginSecurity` snapshot data is ignored on load.
- Source-IP limiting remains independent of account identity. Exhausting a
  source budget can temporarily throttle that source, but it cannot target an
  account for users arriving from other sources.

## Regression evidence

The authentication regression creates a learner, submits five invalid
passwords, verifies the generic 429 and `Retry-After`, and then proves the valid
password still receives a session from the same source/identifier pair.

Focused authentication and password-lifecycle validation passed 15 tests
across two files. The independent adversarial suite includes `SEC-P64-001` for
the same invariant.

## Validation

| Gate | Result |
|---|---|
| Functional suite | 101 files; 474 tests passed |
| Adversarial suite | 33 tests passed |
| Frontend typecheck | Passed |
| Production build | Passed; existing 1.01 MB main-chunk warning remains |
| Dependency audit | 0 known vulnerabilities across 411 dependencies |
| Local CloudFormation validation | 78 resources; 31 outputs |
| Authorization inventory | 129 routes |
| JavaScript syntax | 355 files passed |
| PowerShell syntax | 9 files passed |
| `git diff --check` | Passed |

Live AWS staging evidence is still unavailable without credentials. This
control does not change the existing **NO-GO for production** decision.
