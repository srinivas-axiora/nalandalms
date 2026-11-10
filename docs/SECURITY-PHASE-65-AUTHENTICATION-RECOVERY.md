# Security remediation Phase 65: client authentication and durable recovery

Captured: 2026-11-10 (Asia/Calcutta)  
Branch: `security-phase-0-baseline`

## Outcome

The browser no longer treats failed-attempt data as authentication authority.
Production neither reads nor writes the broad application dataset in
`localStorage`; startup removes the legacy cache, and sign-out clears in-memory
application state. Development fixtures remain local-only.

The login screen now exposes working sign-in, learner registration, forgot
password and new-password modes. It consumes the server's generic errors and
`Retry-After` header instead of predicting account lockout. Reset tokens arrive
in a URL fragment, so the browser does not send them in the initial HTTP request
or ordinary query logs.

## Durable production recovery

1. The public endpoint applies Redis-backed source-IP and source/address-pair
   budgets.
2. Every syntactically valid production request is written to encrypted SQS
   before identity lookup, keeping existing and unknown-account timing aligned.
3. Multi-task-safe workers resolve identity, create deterministic 15-minute
   session-version-bound tokens, and send through SES.
4. Unknown accounts are deleted without delivery. Transient failures retry;
   exhausted messages enter an encrypted DLQ and raise an SNS-routed alarm.
5. Startup and `/api/ready` fail when SQS encryption/redrive or SES production
   access is unavailable. Deployment and attestation independently verify the
   queue, DLQ, sender identity and worker configuration.

The ECS role is scoped to the reset queue, the configured SES sender identity,
and the read-only SES account check. No static AWS credential is introduced.

## Current decision

All local release gates pass:

| Gate | Result |
|---|---|
| Functional suite | 103 files, 485 tests passed |
| Isolated adversarial suite | 33 tests passed |
| TypeScript | Passed |
| Production frontend build | Passed; existing 1,007.43 kB chunk warning remains |
| Dependency audit | 0 vulnerabilities across 414 dependencies |
| CloudFormation structure | 81 resources, 33 outputs |
| Authorization inventory | 129 route policies |
| JavaScript syntax | 358 files passed |
| PowerShell syntax | 9 files passed |
| OpenAPI YAML | Parsed successfully |
| Patch hygiene | `git diff --check` passed |

Live SES/SQS delivery, DLQ alarm exercise and end-to-end AWS staging
attestation still require the intended AWS account. The decision therefore
remains **NO-GO for production**; local green gates are necessary but do not
replace runtime evidence.
