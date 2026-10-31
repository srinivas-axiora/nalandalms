export const phase5Chapters = [
  {
    id: "CH-MNT-025",
    courseId: "CRS-MNT-001",
    title: "QA in Agile Scrum: Three Amigos, DoR, DoD & BDD Basics",
    order: 25,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=0h3jO5BhnqE",
    content: `# QA in Agile Scrum: Three Amigos, DoR, DoD & BDD Basics

### Learning Objectives
1. Define the role of QA across Agile Scrum ceremonies: Sprint Planning, Daily Standup, Backlog Refinement, and Retrospectives.
2. Facilitate "Three Amigos" discovery sessions (Product Owner, Developer, QA) to uncover hidden ambiguities.
3. Establish robust Definition of Ready (DoR) and Definition of Done (DoD) quality contracts.
4. Formulate Behavior-Driven Development (BDD) scenarios using Gherkin syntax (Given-When-Then).

---

### 1. The QA Paradigm Shift in Agile

In traditional Waterfall, QA was an isolated phase at the tail end of delivery. In Agile, QA is a continuous discipline embedded within the cross-functional squad from day one.

\`\`\`
   +-------------------------------------------------------------+
   |                    THE THREE AMIGOS                         |
   +-------------------------------------------------------------+
   |  [ PRODUCT OWNER ]  --> What business problem are we        |
   |                         solving and why?                    |
   |                                                             |
   |  [ DEVELOPER ]      --> How technically can we build it,    |
   |                         and what are the architectural risks?|
   |                                                             |
   |  [ QA TESTER ]      --> What could go wrong? What are the   |
   |                         edge cases, boundary states & failures?|
   +-------------------------------------------------------------+
\`\`\`

---

### 2. Definition of Ready (DoR) vs. Definition of Done (DoD)

| Quality Contract | Focus | Key QA Criteria |
| :--- | :--- | :--- |
| **Definition of Ready (DoR)** | Can the squad start sprint work on this story? | - Acceptance criteria clearly specified.<br>- Edge cases and error states documented.<br>- UX wireframes finalized.<br>- Test data dependencies identified. |
| **Definition of Done (DoD)** | Can this increment be released to production? | - Code peer-reviewed & merged.<br>- Unit & integration tests pass with 85%+ coverage.<br>- Manual exploratory & regression tests pass.<br>- 0 open Blocker/Critical defects.<br>- Documentation & release notes updated. |

---

### 3. Behavior-Driven Development (BDD) & Gherkin Syntax

BDD aligns business, dev, and QA through structured, human-readable specifications written in Gherkin:

\`\`\`gherkin
Feature: Transfer Funds Between Accounts
  As a verified retail banking customer
  I want to transfer funds to external bank accounts
  So that I can pay bills and suppliers

  Scenario: Successful wire transfer with sufficient balance
    Given the user is authenticated with a checking balance of $1,500.00
    And the daily transfer limit is $5,000.00
    When the user initiates a transfer of $450.00 to account "ACC-9921"
    And confirms with 2FA code "123456"
    Then the system should deduct $450.00 from checking balance
    And the new checking balance should display $1,050.00
    And a transaction receipt with status "SUCCESS" should be generated

  Scenario: Transfer rejected due to insufficient funds
    Given the user is authenticated with a checking balance of $100.00
    When the user attempts to transfer $250.00 to account "ACC-9921"
    Then the system should reject the transaction
    And display error message "Insufficient funds available"
    And no funds should be deducted from checking balance
\`\`\`

---

### 4. Hands-on Lab: Three Amigos Workshop
1. Take an ambiguous user story: *"As a user I want to search items fast"*.
2. Identify 5 missing requirements (search filters, empty states, latency expectations, special characters, pagination).
3. Draft 3 acceptance criteria in Gherkin (Given-When-Then).
4. Update the story's Definition of Ready.`
  },
  {
    id: "CH-MNT-026",
    courseId: "CRS-MNT-001",
    title: "Test Metrics, Executive Reporting & Release Sign-Off",
    order: 26,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=J8w_3oKxV1E",
    content: `# Test Metrics, Executive Reporting & Release Sign-Off

### Learning Objectives
1. Calculate essential QA metrics: Test Execution Progress, Pass Rate, Defect Velocity, and Defect Slippage.
2. Interpret Agile Burndown and Cumulative Flow Diagrams (CFD) to identify QA bottlenecks.
3. Construct a high-impact Executive Test Summary Report for VP/C-level stakeholders.
4. Lead the formal Go/No-Go Release Decision Meeting based on objective quality gates.

---

### 1. Essential Test Metrics Dashboard

Senior QA leaders make data-driven recommendations using concrete metrics rather than subjective feelings.

\`\`\`
   +-------------------------------------------------------------+
   |                  EXECUTIVE METRICS MATRIX                   |
   +-------------------------------------------------------------+
   | Metric                   | Target Benchmark | Formula       |
   +--------------------------+------------------+---------------+
   | Test Execution Rate      | 100% scheduled   | (Executed / Total Planned) * 100
   | Test Case Pass Rate      | >= 95%           | (Passed / Executed) * 100
   | Defect Density           | < 2 per KLOC     | Bugs / Total KLOC
   | Defect Removal Efficiency| > 95%            | Internal / (Internal + Prod)
   | Critical / Blocker Bugs  | 0 open           | Count(S1 + S2 open)
   +-------------------------------------------------------------+
\`\`\`

---

### 2. Anatomy of a Release Sign-Off Document

The QA Release Sign-Off is an auditable artifact that gives formal engineering authorization to deploy a release candidate to production.

\`\`\`markdown
# Release Candidate Sign-Off Report: v2.4.0 (Build #849)
- Date: October 30, 2026
- QA Lead Sign-Off: Approved / With Conditions
- Target Deployment: Staging -> Production

## 1. Executive Summary
During Release Cycle 2026-W44, QA executed 420 test cases across 8 functional modules.
Overall Pass Rate reached 98.1%. Zero S1 (Blocker) and zero S2 (Critical) defects remain open.

## 2. Test Execution Summary
- Total Test Cases: 420
- Passed: 412 (98.1%)
- Failed: 6 (1.4% - minor cosmetics)
- Blocked: 0
- Skipped: 2 (deferred features)

## 3. Defect Severity Breakdown
- S1 (Blocker): 0 Open | 8 Resolved
- S2 (Critical): 0 Open | 14 Resolved
- S3 (Major): 2 Open (Workarounds documented in Release Notes)
- S4 (Minor/Trivial): 4 Open (Queued for Sprint 45)

## 4. Known Risks & Mitigation
- Minor: Safari 17 on iOS displays 2px button border overlap on checkout footer.
- Mitigation: Does not impede checkout conversion; CSS patch scheduled for hotfix branch.

## 5. Final Recommendation
- [X] GO - Approve Release to Production
- [ ] NO-GO - Reject Release (Blockers outstanding)
\`\`\`

---

### 3. The Go / No-Go Decision Framework

When release deadlines clash with unresolved defects, QA leaders facilitate the Go / No-Go decision:

1. **Strict Quality Gates**:
   - Are there any known data-loss or security vulnerabilities open? (Automatic NO-GO).
   - Are legal or regulatory requirements violated? (Automatic NO-GO).
2. **Acceptable Risk Trade-Offs**:
   - Are open bugs strictly cosmetic with intuitive workarounds?
   - Can the feature be toggled off in production via a LaunchDarkly Feature Flag?
3. **Rollback Plan**:
   - Has a verified, rehearsed rollback script and database snapshot been confirmed by DevOps?

---

### 4. Hands-on Lab: Release Gate Assessment
1. Review a simulated test run report with 2 open S2 defects and 1 open S3 defect.
2. Evaluate against predefined SLA release criteria.
3. Formulate the official QA recommendation and draft the executive sign-off memo.`
  },
  {
    id: "CH-MNT-027",
    courseId: "CRS-MNT-001",
    title: "Continuous Testing in CI/CD: Quality Gates & PR Verification",
    order: 27,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=scEDHsr3APg",
    content: `# Continuous Testing in CI/CD: Quality Gates & PR Verification

### Learning Objectives
1. Understand the Continuous Integration / Continuous Deployment (CI/CD) delivery pipeline.
2. Define Quality Gates at every stage: Commit, Pull Request, Build, Staging, and Production.
3. Test ephemeral Preview Environments and feature branches.
4. Collaborate with DevOps to configure build triggers, automated smoke tests, and failure notifications.

---

### 1. The CI/CD Pipeline and Testing Gates

Continuous Testing shifts verification left, executing automated and exploratory quality checks at each phase of delivery.

\`\`\`
   [ Developer Git Push ]
              |
              v
     +-----------------+
     |  COMMIT STAGE   |  --> Static Code Analysis (ESLint, SonarQube)
     +--------+--------+      Unit Tests (Jest, JUnit)
              | PASS
              v
     +-----------------+
     |   BUILD & PR    |  --> Component Tests, Build Artifact Creation,
     +--------+--------+      Security Dependency Scans (Snyk / Dependabot)
              | PASS
              v
     +-----------------+
     | PREVIEW / STAGE |  --> Ephemeral PR environments, Smoke Tests,
     +--------+--------+      Manual Exploratory QA Verification
              | QA SIGN-OFF
              v
     +-----------------+
     |   PRODUCTION    |  --> Canary / Blue-Green Deployment,
     +-----------------+      Synthetic Monitoring & Health Checks
\`\`\`

---

### 2. Quality Gates: Enforcing Standards

A **Quality Gate** is an automated or procedural threshold that code must satisfy to advance to the next delivery stage.

| Delivery Stage | Quality Gate Metric | Action on Failure |
| :--- | :--- | :--- |
| **Pull Request (PR)** | - SonarQube: 0 Blocker code smells.<br>- Unit Test Coverage >= 80%.<br>- Pull request approved by at least 2 peers. | Merge button blocked on GitHub/GitLab. |
| **Staging Deployment** | - Automated Smoke Test Suite passes 100%.<br>- Zero database migration errors. | Build rolled back; deployment halted. |
| **Production Canary** | - Production Error Rate < 0.01%.<br>- P99 API Latency < 400ms. | Automatic rollback of traffic to previous stable version. |

---

### 3. Ephemeral Environments for Manual Testing

Modern cloud infrastructure (e.g. Vercel, Kubernetes namespace spin-ups) creates isolated, temporary preview environments for every pull request:
- **Benefits for Manual QA**:
  - QA can test a developer's feature in isolation before it ever touches \`main\` or \`staging\`.
  - Multiple QA testers can evaluate parallel features simultaneously without staging environment collision or shared database contention.
- **Verification Strategy**:
  - Verify feature-specific acceptance criteria.
  - Test database migration rollbacks.
  - Validate that environment variables are properly wired.

---

### 4. Hands-on Lab: PR Verification & CI/CD Triage
1. Review a simulated GitHub Pull Request with failing CI checks.
2. Inspect the GitHub Actions build log to isolate unit test vs. linter failure.
3. Deploy an ephemeral branch preview and execute a focused exploratory smoke test.
4. Leave a structured review approval comment.`
  },
  {
    id: "CH-MNT-028",
    courseId: "CRS-MNT-001",
    title: "Regulatory Compliance & Audit Readiness: HIPAA, SOX & GDPR",
    order: 28,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=F_fP1Q9bO8M",
    content: `# Regulatory Compliance & Audit Readiness: HIPAA, SOX & GDPR

### Learning Objectives
1. Understand regulatory compliance mandates governing software quality: HIPAA, SOX, GDPR, ISO 9001/27001, and FDA 21 CFR Part 11.
2. Establish immutable audit trails, change logs, and electronic signature compliance.
3. Verify Personally Identifiable Information (PII) masking and "Right to be Forgotten" (GDPR).
4. Prepare QA documentation, test evidence, and RTMs for external government and third-party auditors.

---

### 1. The High Stakes of Compliance Testing

In healthcare, financial, aerospace, and defense industries, software bugs do not merely cause user inconvenience; they can result in multimillion-dollar fines, criminal liability, or loss of human life.

\`\`\`
   +-------------------------------------------------------------+
   |              REGULATORY COMPLIANCE LANDSCAPE                |
   +-------------------------------------------------------------+
   | HIPAA (Health Insurance Portability and Accountability Act):|
   | - Strict protection of Protected Health Information (PHI).  |
   | - Mandatory encryption at rest & in transit, access logs.   |
   +-------------------------------------------------------------+
   | SOX (Sarbanes-Oxley Act):                                   |
   | - Financial reporting accuracy, audit trails of ledger code |
   | - Strict segregation of duties (Dev cannot deploy to Prod). |
   +-------------------------------------------------------------+
   | GDPR (General Data Protection Regulation):                  |
   | - User consent tracking, Right to Access, Right to Erasure  |
   | - Fines up to €20M or 4% of global annual turnover.         |
   +-------------------------------------------------------------+
\`\`\`

---

### 2. QA Auditing Checkpoints for Compliance

#### A. Protected Health Information (PHI) & PII Masking
- Verify that social security numbers, credit card details, and patient medical notes are masked in UI views (e.g. \`***-**-1234\`).
- Verify that application server logs (ELK / Datadog / CloudWatch) **NEVER** log raw credit card numbers or patient passwords.

#### B. Audit Logging & Non-Repudiation
- Every financial or patient record modification must generate an immutable audit log entry:
  - *Who* performed the action (User ID, IP address).
  - *What* was modified (Old value -> New value).
  - *When* it happened (UTC timestamp with microsecond accuracy).
- Verify audit log records cannot be altered or deleted, even by system administrators.

#### C. Segregation of Duties (SoD)
- Verify that developers who authored code do not have production database write access or release deployment privileges.

---

### 3. Assembling the Audit Package

When federal or third-party auditors inspect software delivery, the QA Lead must present:
1. **Approved Test Strategy & Plan**: Signed off before testing commenced.
2. **Requirements Traceability Matrix (RTM)**: Proving 100% of regulatory specs have passing test records.
3. **Execution Evidence**: Timestamped screenshots, video captures, and automated test execution logs linked to immutable git commit hashes.
4. **Defect Log**: Documentation of every defect discovered, rationale for deferred bugs, and verification of fixes.

---

### 4. Hands-on Lab: GDPR Right to Erasure Verification
1. Create a simulated user profile containing PII (name, phone, address, credit card token).
2. Execute the "Delete My Account" GDPR workflow.
3. Inspect the relational database and cache layers to verify user PII is hard-deleted or irreversibly anonymized, while required financial transaction ledgers retain anonymized tokens for tax compliance.`
  },
  {
    id: "CH-MNT-029",
    courseId: "CRS-MNT-001",
    chapterId: "CH-MNT-029",
    title: "Comprehensive Capstone: Enterprise FinTech Banking Platform Audit",
    order: 29,
    estimatedMinutes: 60,
    videoUrl: "https://www.youtube.com/watch?v=0h3jO5BhnqE",
    content: `# Comprehensive Capstone: Enterprise FinTech Banking Platform Audit

### Learning Objectives
1. Synthesize all manual QA testing disciplines into an end-to-end audit of a mission-critical FinTech banking platform.
2. Conduct requirements analysis, construct risk-based test plans, and design comprehensive positive, boundary, and negative test matrices.
3. Execute manual API tests in Postman, direct database verification in SQL, and UI cross-browser audits.
4. Document production-grade defect reports with full telemetry and chair a formal Release Sign-Off meeting.

---

### 1. Capstone Enterprise Scenario: "Apex Global Bank"

You are the Lead QA Engineer assigned to audit the release candidate (v3.2.0) of **Apex Global Bank**.

\`\`\`
   +-------------------------------------------------------------+
   |                APEX GLOBAL BANK ARCHITECTURE                |
   +-------------------------------------------------------------+
   |  [ CLIENTS ]    Web Portal (React) | iOS & Android Apps     |
   |                                                             |
   |  [ API GATEWAY] REST / GraphQL Microservices                |
   |                 - Auth & KYC Service                        |
   |                 - Core Banking & Ledger Service             |
   |                 - Foreign Exchange (FX) & Wire Service      |
   |                                                             |
   |  [ DATABASE ]   PostgreSQL (ACID) & Redis Cache             |
   +-------------------------------------------------------------+
\`\`\`

#### Scope of Audit:
1. **User Authentication & Biometrics**: MFA SMS OTP, FaceID mobile login, session timeouts (15 mins inactivity).
2. **Core Transfers**: Domestic ACH transfers, international wire transfers with dynamic FX conversion rates, and overdraft rules.
3. **Regulatory & Compliance**: SOX ledger audit trails, GDPR privacy export, transaction rate limiting.

---

### 2. Milestone Deliverables

#### Milestone 1: Master Test Strategy & Risk Assessment
- Classify system risk areas using FMEA (Failure Mode and Effects Analysis).
- Map high-risk financial modules (Ledger updates, currency conversions) to P1 execution priority.

#### Milestone 2: Multi-Layer Verification Execution
- **Layer 1: UI / Cross-Browser**:
  - Test responsive breakpoints, WCAG 2.2 AA accessibility (contrast, keyboard navigation), and cross-browser consistency (Chrome, Safari, Firefox).
- **Layer 2: API Postman Suite**:
  - Verify \`POST /api/v3/transfers\` against boundary payloads (negative amounts, \$0.00, \$100,000.01 limit).
  - Verify horizontal IDOR authorization defenses.
- **Layer 3: SQL Database Audit**:
  - Verify double-entry ledger bookkeeping: debited checking account balance + credited recipient balance must exactly balance to \$0.00 variance.

#### Milestone 3: Defect Triage & Executive Sign-Off
- Log discovered defects in Jira format with HAR files, console dumps, and video screen captures.
- Produce the final QA Release Sign-Off document recommending GO or NO-GO with explicit stakeholder rationale.

---

### 3. Evaluation Criteria

| Evaluation Dimension | Weight | Success Criteria |
| :--- | :--- | :--- |
| **Requirements Traceability** | 25% | 100% of user stories mapped to test cases with zero ambiguity. |
| **Defect Reporting Quality** | 25% | Professional bug tickets with minimal STR, HAR logs, and exact root causes. |
| **Technical Verification** | 25% | Accurate SQL verification of ACID transactions and API security assertions. |
| **Executive Leadership** | 25% | Objective, data-backed Go/No-Go sign-off report suitable for executive review. |`
  },
  {
    id: "CH-MNT-030",
    courseId: "CRS-MNT-001",
    title: "QA Career Mastery: ISTQB Foundation Certification & Technical Interview",
    order: 30,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=wX0kY748p1k",
    content: `# QA Career Mastery: ISTQB Foundation Certification & Technical Interview

### Learning Objectives
1. Master the ISTQB Certified Tester Foundation Level (CTFL v4.0) exam syllabus, question formats, and key formulas.
2. Excel in technical QA interview rounds: bug advocacy scenarios, test design challenges, and live triage sessions.
3. Construct a standout technical QA portfolio showcasing real-world bug reports, Postman API collections, and test plans.
4. Chart the modern career trajectory from Manual QA to SDET, QA Lead, and Engineering Management.

---

### 1. ISTQB CTFL v4.0 Exam Strategy

The International Software Testing Qualifications Board (ISTQB) is the gold standard accreditation for software testing professionals worldwide.

\`\`\`
   +-------------------------------------------------------------+
   |                 ISTQB CTFL v4.0 EXAM BLUEPRINT              |
   +-------------------------------------------------------------+
   | Total Questions: 40 Multiple-Choice Questions               |
   | Duration: 60 minutes (75 mins for non-native speakers)      |
   | Passing Score: 65% (26 out of 40 correct)                   |
   +-------------------------------------------------------------+
   | Chapter 1: Fundamentals of Testing (8 questions)            |
   | Chapter 2: Testing Throughout the SDLC (6 questions)        |
   | Chapter 3: Static Testing (4 questions)                     |
   | Chapter 4: Test Analysis & Design (11 questions - K3 heavy) |
   | Chapter 5: Managing the Test Activities (9 questions)       |
   | Chapter 6: Test Tools (2 questions)                         |
   +-------------------------------------------------------------+
\`\`\`

#### Key Cognitive Levels (K-Levels):
- **K1 (Remember)**: Recognize or recall terms and definitions (e.g., What is confirmation testing?).
- **K2 (Understand)**: Explain reasons, compare concepts (e.g., Difference between verification and validation).
- **K3 (Apply)**: Apply test design techniques to concrete scenarios (Equivalence Partitioning, Boundary Value Analysis, Decision Tables).

---

### 2. Winning Technical QA Interview Strategies

Top tech companies (FAANG, Tier-1 FinTech) evaluate QA candidates using three practical interview formats:

#### A. The "How Would You Test a [X]?" Challenge
- *Question*: *"How would you test a vending machine / elevator / search box / YouTube video player?"*
- *Framework for Success*:
  1. **Clarify Requirements**: *"What are the user demographics? What payment methods are supported? What is the expected network latency?"*
  2. **Categorize Systematically**:
     - Functional (Happy path, boundary, negative).
     - Non-Functional (Performance, Usability, Accessibility, Security).
     - Environmental & Interruption (Power loss, network drop, extreme temperatures).
  3. **Prioritize**: State which 3 tests you would execute first and why.

#### B. The Bug Advocacy Scenario
- *Question*: *"A developer refuses to fix your bug, claiming 'it's working as designed' or 'no user would ever do that'. How do you handle it?"*
- *Winning Answer*: Avoid emotional arguments. Rely on data, business impact, and user analytics. Demonstrate the exact sequence of steps, cite customer usage telemetry, quantify potential financial loss, and if consensus fails, bring the Product Owner into a triage session for the final business call.

---

### 3. Your QA Career Progression Roadmap

\`\`\`
[ QA Engineer ] --> [ Senior QA / QA Lead ] --> [ QA Manager / Director of Quality ]
       |
       +----------> [ SDET (Automation) ] ----> [ Principal QA Architect ]
\`\`\`

- **Continuous Evolution**: Blend manual exploratory excellence with automated testing tools (Cypress, Playwright, Selenium), CI/CD fluency, and performance engineering.
- **You are the Quality Champion**: Software quality is not merely finding bugs; it is building a culture where defects are prevented before code is ever written.`
  }
];

export const phase5Assessments = [
  {
    id: "ASM-MNT-025",
    courseId: "CRS-MNT-001",
    chapterId: "CH-MNT-025",
    title: "Assessment: QA in Agile Scrum & Modern Delivery",
    passingScore: 70,
    questions: [
      {
        id: "Q-MNT-025-01",
        text: "Who are the primary participants in an Agile 'Three Amigos' discovery session?",
        options: [
          "Product Owner / Business Analyst, Developer, and QA Tester",
          "Chief Executive Officer, Chief Financial Officer, and Legal Counsel",
          "Three senior developers only",
          "External sales representatives only"
        ],
        correctAnswer: 0,
        explanation: "Three Amigos unites Product (business intent), Development (technical architecture), and QA (edge cases and quality risks)."
      },
      {
        id: "Q-MNT-025-02",
        text: "What is the primary difference between Definition of Ready (DoR) and Definition of Done (DoD)?",
        options: [
          "DoR determines if a user story is well-defined enough to begin development; DoD determines if the completed story meets quality standards to be released",
          "DoD applies to hardware; DoR applies to software",
          "DoR is written by developers; DoD is written by marketing",
          "There is no difference between DoR and DoD"
        ],
        correctAnswer: 0,
        explanation: "DoR is the entry quality gate before sprint execution; DoD is the exit quality gate before shipping."
      },
      {
        id: "Q-MNT-025-03",
        text: "What structured syntax is used in Behavior-Driven Development (BDD) to write human-readable test scenarios?",
        options: ["Gherkin (Given-When-Then)", "HTML / CSS", "SQL DDL", "JSON Schema"],
        correctAnswer: 0,
        explanation: "Gherkin uses Given (context), When (action), and Then (expected outcome) to define executable acceptance criteria."
      },
      {
        id: "Q-MNT-025-04",
        text: "In Agile Scrum, what is the QA engineer's primary contribution during Sprint Planning?",
        options: [
          "Remaining silent until developers finish coding",
          "Estimating testing effort, challenging vague acceptance criteria, and identifying test data/environment dependencies",
          "Writing the company budget",
          "Booking meeting rooms"
        ],
        correctAnswer: 1,
        explanation: "QA ensures testability, estimates QA effort, identifies environmental risks, and clarifies acceptance criteria during planning."
      },
      {
        id: "Q-MNT-025-05",
        text: "In Gherkin syntax, what does the 'Given' step define?",
        options: [
          "The initial context, preconditions, or baseline state before an action is taken",
          "The user's action or event",
          "The final assertion or expected outcome",
          "The author of the test case"
        ],
        correctAnswer: 0,
        explanation: "The 'Given' keyword establishes the initial preconditions and state of the system."
      },
      {
        id: "Q-MNT-025-06",
        text: "What is the danger of a user story entering a sprint without satisfying the Definition of Ready?",
        options: [
          "Mid-sprint requirement churn, unexpected blockers, scope creep, and inaccurate delivery timelines",
          "The story will finish too quickly",
          "The code will automatically delete itself",
          "The sprint will be cancelled automatically by Jira"
        ],
        correctAnswer: 0,
        explanation: "Unready stories cause team confusion, mid-sprint rework, blocked dependencies, and missed delivery commitments."
      },
      {
        id: "Q-MNT-025-07",
        text: "What is the role of QA in the Sprint Retrospective ceremony?",
        options: [
          "To blame individual developers for bugs found during the sprint",
          "To collaborate on process improvements, identify systemic causes of defects, and refine team quality practices",
          "To take meeting minutes and order coffee",
          "QA is prohibited from attending retrospectives"
        ],
        correctAnswer: 1,
        explanation: "Retrospectives provide a blameless forum for continuous process improvement and strengthening quality practices."
      },
      {
        id: "Q-MNT-025-08",
        text: "In Gherkin syntax, what does the 'When' step represent?",
        options: [
          "The date and time the test was executed",
          "The specific action, trigger, or event initiated by the user or external system",
          "The expected database state",
          "The tester's lunch schedule"
        ],
        correctAnswer: 1,
        explanation: "'When' represents the key action, trigger, or interaction executed on the system."
      },
      {
        id: "Q-MNT-025-09",
        text: "What is 'Sprint Burndown' used to monitor in Agile development?",
        options: [
          "The amount of remaining work (hours or story points) over the duration of the sprint",
          "The temperature of the office air conditioning",
          "The total financial spending on software licenses",
          "The number of emails sent by the team"
        ],
        correctAnswer: 0,
        explanation: "A burndown chart tracks remaining sprint workload day-by-day against the target completion timeline."
      },
      {
        id: "Q-MNT-025-10",
        text: "Why should QA test continuously throughout an Agile sprint rather than waiting for the end of the sprint?",
        options: [
          "Testing only at the end creates an anti-pattern known as 'mini-waterfall', leaving zero time to fix defects before sprint close",
          "Because developers leave the company at the end of the sprint",
          "Because Jira locks tickets on the last day",
          "Because computers are slower on Fridays"
        ],
        correctAnswer: 0,
        explanation: "Deferring testing to sprint end recreates a waterfall bottleneck, leading to rushed verification and defect leakage."
      }
    ]
  },
  {
    id: "ASM-MNT-026",
    courseId: "CRS-MNT-001",
    chapterId: "CH-MNT-026",
    title: "Assessment: Test Metrics, Executive Reporting & Sign-Off",
    passingScore: 70,
    questions: [
      {
        id: "Q-MNT-026-01",
        text: "How is the Test Case Pass Rate calculated for a test execution cycle?",
        options: [
          "(Total Passed Tests / Total Executed Tests) * 100",
          "(Total Failed Tests / Total Planned Tests) * 100",
          "(Total Bugs Logged / Total Lines of Code) * 100",
          "Total Test Hours / Total Developers"
        ],
        correctAnswer: 0,
        explanation: "Test Pass Rate is calculated by dividing total passed tests by the total number of executed tests, multiplied by 100."
      },
      {
        id: "Q-MNT-026-02",
        text: "What is a 'Go/No-Go' meeting in software release management?",
        options: [
          "A formal stakeholder meeting where engineering, QA, product, and operations evaluate release criteria to approve or halt deployment",
          "A meeting to plan team vacation schedules",
          "A session where developers play video games",
          "A meeting to hire new employees"
        ],
        correctAnswer: 0,
        explanation: "The Go/No-Go meeting assesses quality metrics, risks, and operational readiness to make a definitive release decision."
      },
      {
        id: "Q-MNT-026-03",
        text: "What quality condition typically triggers an automatic 'NO-GO' recommendation from QA leadership?",
        options: [
          "One or more unresolved S1 (Blocker) defects that cause crashes, data loss, or regulatory violations",
          "Two minor spelling typos on an internal help page",
          "The font on a button is dark gray instead of black",
          "A developer requests a code review"
        ],
        correctAnswer: 0,
        explanation: "Unresolved Blocker/Critical defects with severe business, legal, or data integrity impact justify an immediate NO-GO."
      },
      {
        id: "Q-MNT-026-04",
        text: "What is 'Defect Slippage' (or Defect Leakage)?",
        options: [
          "The percentage of defects that were missed during internal QA testing and discovered by end users in production",
          "A physical slip hazard in the office",
          "The speed at which bugs are fixed",
          "The count of bugs logged on mobile devices"
        ],
        correctAnswer: 0,
        explanation: "Defect slippage measures defects that escaped internal test phases into the live production environment."
      },
      {
        id: "Q-MNT-026-05",
        text: "What does a Cumulative Flow Diagram (CFD) help engineering and QA teams detect?",
        options: [
          "Bottlenecks and work-in-progress (WIP) build-ups across workflow states (e.g. stories stuck in 'Ready for QA')",
          "The financial revenue of the company",
          "The daily network download speeds",
          "The temperature of server racks"
        ],
        correctAnswer: 0,
        explanation: "CFD charts visualize work items across statuses over time, revealing bottlenecks where tickets pile up."
      },
      {
        id: "Q-MNT-026-06",
        text: "What should be included in the 'Known Issues' section of a QA Release Sign-Off report?",
        options: [
          "All open non-critical defects approved to ship with documented workarounds and target milestone for resolution",
          "The names of underperforming developers",
          "Speculation about competitor products",
          "A copy of the entire source code"
        ],
        correctAnswer: 0,
        explanation: "Known issues detail deferred minor bugs, user impact, workarounds, and scheduled patch dates for transparency."
      },
      {
        id: "Q-MNT-026-07",
        text: "If a sprint executes 200 tests out of 250 planned tests, what is the Test Execution Rate?",
        options: ["80%", "50%", "20%", "95%"],
        correctAnswer: 0,
        explanation: "Execution Rate = (200 executed / 250 planned) * 100 = 80%."
      },
      {
        id: "Q-MNT-026-08",
        text: "Why must a formal Rollback Plan be documented and tested prior to any production deployment?",
        options: [
          "To allow immediate reversion to the previous stable release version if catastrophic issues arise post-deployment",
          "To delete old user accounts",
          "To satisfy hardware warranty terms",
          "Because deployments always fail"
        ],
        correctAnswer: 0,
        explanation: "A verified rollback plan provides a safety net to restore system availability if a production release encounters critical failure."
      },
      {
        id: "Q-MNT-026-09",
        text: "What metric measures the time elapsed from when a defect is first reported until it is verified and closed by QA?",
        options: ["Defect Age / Defect Turnaround Time", "Sprint Velocity", "Cyclomatic Complexity", "Story Points"],
        correctAnswer: 0,
        explanation: "Defect Age tracks the total duration a bug remains open before being resolved and closed."
      },
      {
        id: "Q-MNT-026-10",
        text: "Who has the final business authority to accept risk and authorize a deployment if minor defects remain open at the Go/No-Go gate?",
        options: [
          "Product Owner / Business Stakeholders, in consultation with QA and Engineering Leads",
          "The junior intern who joined yesterday",
          "An automated script",
          "The hardware manufacturer"
        ],
        correctAnswer: 0,
        explanation: "Product leadership owns the business risk decision, guided by QA's objective risk assessment."
      }
    ]
  },
  {
    id: "ASM-MNT-027",
    courseId: "CRS-MNT-001",
    chapterId: "CH-MNT-027",
    title: "Assessment: Continuous Testing in CI/CD",
    passingScore: 70,
    questions: [
      {
        id: "Q-MNT-027-01",
        text: "What is Continuous Integration (CI)?",
        options: [
          "The software engineering practice of frequently merging code changes into a central repository, triggering automated builds and tests",
          "Deploying code once every 6 months",
          "Writing code without any automated tests",
          "Connecting multiple computer monitors together"
        ],
        correctAnswer: 0,
        explanation: "CI involves developers merging code frequently into shared branches, triggering automated verification pipelines."
      },
      {
        id: "Q-MNT-027-02",
        text: "What is an Ephemeral / Preview Environment in modern web delivery?",
        options: [
          "A temporary, isolated cloud environment spun up automatically for a specific Pull Request branch and destroyed after merge",
          "An environment that only exists on paper",
          "A permanent production database server",
          "A physical laptop used for demos"
        ],
        correctAnswer: 0,
        explanation: "Ephemeral environments provide dynamic preview URLs per PR, allowing isolated manual and automated testing."
      },
      {
        id: "Q-MNT-027-03",
        text: "What is a 'Quality Gate' in a CI/CD pipeline?",
        options: [
          "An automated threshold (e.g. test pass rate, code coverage, zero security vulnerabilities) that must pass before advancing code",
          "A physical turnstile at the office entrance",
          "A password on the company Wi-Fi",
          "A payment gateway integration"
        ],
        correctAnswer: 0,
        explanation: "Quality gates enforce automated quality thresholds that prevent flawed builds from progressing down the delivery pipeline."
      },
      {
        id: "Q-MNT-027-04",
        text: "What does 'Shift-Left Testing' mean?",
        options: [
          "Moving testing activities earlier in the software development lifecycle to prevent and detect defects as early as possible",
          "Testing only on the left side of the computer screen",
          "Reassigning all testing tasks to marketing",
          "Postponing testing until after customer release"
        ],
        correctAnswer: 0,
        explanation: "Shift-left emphasizes defect prevention and early testing during requirements and development rather than post-build."
      },
      {
        id: "Q-MNT-027-05",
        text: "What type of automated test suite is typically triggered immediately following a deployment to Staging to ensure system health?",
        options: ["Automated Smoke / Health Check Suite", "A full 24-hour endurance test", "Stress test to server destruction", "Manual usability study"],
        correctAnswer: 0,
        explanation: "Automated smoke suites execute rapid health checks to ensure the newly deployed build is operational."
      },
      {
        id: "Q-MNT-027-06",
        text: "In a GitHub Pull Request workflow, what should happen if automated unit tests fail in the CI pipeline?",
        options: [
          "The Pull Request merge button is blocked, preventing faulty code from entering the main branch",
          "The code is automatically deployed to production anyway",
          "The developer's computer is restarted",
          "The git repository is deleted"
        ],
        correctAnswer: 0,
        explanation: "Failing CI status checks block branch merging, preventing broken code from contaminating shared branches."
      },
      {
        id: "Q-MNT-027-07",
        text: "What is a 'Canary Deployment'?",
        options: [
          "A deployment technique where a new release is rolled out to a small percentage of real users (e.g. 5%) to monitor metrics before full rollout",
          "Installing software on computers inside coal mines",
          "Testing software using bird sounds",
          "Deploying software on weekends only"
        ],
        correctAnswer: 0,
        explanation: "Canary deployments minimize blast radius by exposing new builds to a tiny fraction of production traffic initially."
      },
      {
        id: "Q-MNT-027-08",
        text: "What tool is widely used to analyze source code for bugs, vulnerabilities, and code smells during CI builds?",
        options: ["SonarQube", "VLC Media Player", "Adobe Photoshop", "Microsoft PowerPoint"],
        correctAnswer: 0,
        explanation: "SonarQube is an industry-standard static analysis platform for continuous code quality and security inspection."
      },
      {
        id: "Q-MNT-027-09",
        text: "Why are ephemeral preview environments beneficial for manual QA engineers?",
        options: [
          "QA can test isolated features without waiting for shared staging environments or risking database collisions with other testers",
          "Because ephemeral environments don't require internet access",
          "Because QA doesn't need to write bug reports",
          "Because ephemeral environments are free of all bugs"
        ],
        correctAnswer: 0,
        explanation: "Ephemeral environments eliminate staging queue contention, enabling isolated verification of parallel PRs."
      },
      {
        id: "Q-MNT-027-10",
        text: "What does 'Blue-Green Deployment' achieve?",
        options: [
          "Zero-downtime releases by switching live traffic from an idle environment (Green) to an updated environment (Blue)",
          "Painting server racks different colors",
          "Testing websites in blue and green color palettes",
          "Deploying code only during daytime"
        ],
        correctAnswer: 0,
        explanation: "Blue-green deployments maintain two identical production environments to allow instantaneous switching with zero downtime."
      }
    ]
  },
  {
    id: "ASM-MNT-028",
    courseId: "CRS-MNT-001",
    chapterId: "CH-MNT-028",
    title: "Assessment: Regulatory Compliance & Audit Readiness",
    passingScore: 70,
    questions: [
      {
        id: "Q-MNT-028-01",
        text: "Under HIPAA regulations, what category of sensitive data requires strict encryption, access logging, and role-based protection?",
        options: [
          "Protected Health Information (PHI)",
          "Public weather forecasts",
          "Corporate marketing brochures",
          "Software version numbers"
        ],
        correctAnswer: 0,
        explanation: "HIPAA mandates strict confidentiality, encryption, and audit controls for all Protected Health Information (PHI)."
      },
      {
        id: "Q-MNT-028-02",
        text: "What does the 'Right to Erasure' (Right to be Forgotten) under GDPR require an application to support?",
        options: [
          "The ability for users to request that all their personal identifiable data (PII) be permanently deleted or irreversibly anonymized",
          "The right for developers to erase bug reports",
          "The right to clear browser cache automatically",
          "The right to erase operating systems"
        ],
        correctAnswer: 0,
        explanation: "GDPR Article 17 grants individuals the right to have their personal data erased without undue delay."
      },
      {
        id: "Q-MNT-028-03",
        text: "In financial systems subject to Sarbanes-Oxley (SOX) compliance, what is 'Segregation of Duties' (SoD)?",
        options: [
          "A control ensuring the person who develops code cannot also deploy it to production or approve financial transactions",
          "Separating desks in the office",
          "Testing on different days of the week",
          "Using two different monitors"
        ],
        correctAnswer: 0,
        explanation: "Segregation of Duties prevents fraud and errors by ensuring no single individual controls the full lifecycle of critical processes."
      },
      {
        id: "Q-MNT-028-04",
        text: "What property must audit logs possess in regulated enterprise systems?",
        options: [
          "Immutability: logs must be tamper-proof and cannot be modified or deleted, even by system administrators",
          "Logs must be rewritten every 24 hours",
          "Logs must be stored in plaintext on public servers",
          "Logs can be edited by any user"
        ],
        correctAnswer: 0,
        explanation: "Audit logs must provide an immutable, tamper-evident record of who did what and when for regulatory compliance."
      },
      {
        id: "Q-MNT-028-05",
        text: "What is Personally Identifiable Information (PII)?",
        options: [
          "Any information that can be used to distinguish or trace an individual's identity (e.g. SSN, full name, email, biometric records)",
          "Public domain software libraries",
          "The model number of the server CPU",
          "The company's brand logo"
        ],
        correctAnswer: 0,
        explanation: "PII encompasses any data that directly or indirectly identifies a specific human individual."
      },
      {
        id: "Q-MNT-028-06",
        text: "Why must QA verify that application server logs (e.g. CloudWatch, Logstash) do NOT record raw credit card CVV codes or passwords?",
        options: [
          "Logging unmasked sensitive financial credentials violates PCI-DSS and data privacy laws, exposing users to credential theft",
          "Because logs become too colorful",
          "Because printers cannot print numbers",
          "Because passwords make log files too large"
        ],
        correctAnswer: 0,
        explanation: "PCI-DSS strictly prohibits the persistence of sensitive authentication data (such as card CVV codes) in log files."
      },
      {
        id: "Q-MNT-028-07",
        text: "In FDA 21 CFR Part 11 regulated software (medical/pharma), what must electronic signatures legally represent?",
        options: [
          "The legally binding equivalent of a handwritten, wet-ink signature accompanied by manifestation of signer identity and intent",
          "An informal text message emoji",
          "An unsigned PDF file",
          "A verbal phone call"
        ],
        correctAnswer: 0,
        explanation: "21 CFR Part 11 establishes criteria under which electronic signatures are deemed equivalent to paper handwritten signatures."
      },
      {
        id: "Q-MNT-028-08",
        text: "What document proves to an external auditor that every regulatory requirement was verified by specific executed test cases?",
        options: [
          "Requirements Traceability Matrix (RTM)",
          "A marketing PowerPoint slide",
          "The company organizational chart",
          "A developer's timesheet"
        ],
        correctAnswer: 0,
        explanation: "The RTM demonstrates complete end-to-end traceability between regulatory mandates and validated test executions."
      },
      {
        id: "Q-MNT-028-09",
        text: "When testing data export functionality under GDPR (Right to Data Portability), what format must the data be provided in?",
        options: [
          "A structured, commonly used, and machine-readable format (e.g. JSON, XML, CSV)",
          "An encrypted proprietary format that cannot be opened",
          "A handwritten physical letter",
          "An audio recording"
        ],
        correctAnswer: 0,
        explanation: "GDPR Article 20 requires data portability in a structured, commonly used, and machine-readable format."
      },
      {
        id: "Q-MNT-028-10",
        text: "What is an 'Audit Trail' in enterprise software?",
        options: [
          "A chronological, timestamped record documenting the sequence of activities that have affected an operation, procedure, or event",
          "A footpath through a forest",
          "A list of software patents",
          "A collection of user reviews on the App Store"
        ],
        correctAnswer: 0,
        explanation: "An audit trail provides chronological evidence of operations, detailing user, action, time, and prior/new state values."
      }
    ]
  },
  {
    id: "ASM-MNT-029",
    courseId: "CRS-MNT-001",
    chapterId: "CH-MNT-029",
    title: "Assessment: FinTech Banking Platform Capstone Audit",
    passingScore: 70,
    questions: [
      {
        id: "Q-MNT-029-01",
        text: "In double-entry bookkeeping for banking transactions, if Account A transfers $500 to Account B, what must the database validation verify?",
        options: [
          "Account A balance is debited by exactly $500, Account B balance is credited by exactly $500, and ledger net variance is $0.00",
          "Account A balance is credited by $500 and Account B balance is unchanged",
          "Both accounts receive a free $500 bonus",
          "The database deletes Account A"
        ],
        correctAnswer: 0,
        explanation: "Double-entry ledger rules mandate that total debits must equal total credits, with zero net variance."
      },
      {
        id: "Q-MNT-029-02",
        text: "During the FinTech capstone audit, what is an essential negative test case for the fund transfer API endpoint 'POST /api/v3/transfers'?",
        options: [
          "Submitting a negative transfer amount (e.g., amount = -500.00) to ensure the server rejects it with HTTP 400",
          "Submitting a valid amount of $10.00",
          "Checking the color of the submit button",
          "Testing on a laptop connected to Wi-Fi"
        ],
        correctAnswer: 0,
        explanation: "Negative amounts must be rejected by backend validation; otherwise attackers can artificially credit their own balance."
      },
      {
        id: "Q-MNT-029-03",
        text: "What security verification must be executed when testing banking session management after 15 minutes of user inactivity?",
        options: [
          "The session must terminate automatically, invalidating the session token and requiring re-authentication",
          "The app should stay logged in indefinitely for convenience",
          "The browser should play an audio alert and keep the token valid",
          "The app should reveal the user's password on screen"
        ],
        correctAnswer: 0,
        explanation: "Financial security standards mandate automatic session timeouts after inactivity to prevent unauthorized physical access."
      },
      {
        id: "Q-MNT-029-04",
        text: "When testing currency exchange (FX) wire transfers, what boundary condition must be verified regarding exchange rates?",
        options: [
          "The exchange rate must be locked for a defined quote window (e.g. 60 seconds) and recalculated if the user exceeds the window",
          "The exchange rate must always be exactly 1:1 regardless of currency",
          "The exchange rate should be chosen randomly by the customer",
          "Exchange rates can never change"
        ],
        correctAnswer: 0,
        explanation: "Dynamic FX rates fluctuate constantly; banking platforms offer a guaranteed quote duration before requiring re-quote."
      },
      {
        id: "Q-MNT-029-05",
        text: "What database transaction property ensures that if a server crash occurs midway through transferring money between accounts, no partial transfer occurs?",
        options: ["Atomicity", "Scalability", "Elasticity", "Virtualization"],
        correctAnswer: 0,
        explanation: "Atomicity ensures all legs of the financial transaction succeed or the entire operation rolls back completely."
      },
      {
        id: "Q-MNT-029-06",
        text: "What Horizontal IDOR test must be conducted on the banking transaction endpoint 'GET /api/v3/statements/{statementId}'?",
        options: [
          "Customer A attempts to fetch Customer B's statement ID; the system must return HTTP 403 Forbidden or 404 Not Found",
          "Customer A fetches their own statement",
          "Customer A prints the statement on paper",
          "Customer A updates their email address"
        ],
        correctAnswer: 0,
        explanation: "The endpoint must verify resource authorization, blocking User A from viewing User B's confidential statements."
      },
      {
        id: "Q-MNT-029-07",
        text: "What test must be performed on financial decimal calculations to prevent floating-point rounding errors (e.g. 0.1 + 0.2 = 0.30000000000000004)?",
        options: [
          "Verify the backend uses arbitrary-precision types (e.g. BigDecimal or integer cents) rather than standard IEEE floating-point math",
          "Round all customer balances to the nearest $100",
          "Ignore fractions of a cent",
          "Use Roman numerals"
        ],
        correctAnswer: 0,
        explanation: "FinTech applications must use exact decimal/BigDecimal types or store values as integer cents to avoid binary float errors."
      },
      {
        id: "Q-MNT-029-08",
        text: "What mobile biometric test case is critical for the banking app capstone?",
        options: [
          "Verifying that after 5 consecutive failed FaceID/fingerprint attempts, the app locks biometrics and requires device PIN / password",
          "Verifying that biometrics work with sunglasses",
          "Verifying that FaceID works on a photograph",
          "Disabling biometric authentication entirely"
        ],
        correctAnswer: 0,
        explanation: "Rate limiting and fallback to PIN/password after repeated biometric failures protects against unauthorized physical attacks."
      },
      {
        id: "Q-MNT-029-09",
        text: "What is an essential audit log verification step following a wire transfer of $10,000?",
        options: [
          "Query the audit table to ensure an immutable log record was generated with user ID, source/dest accounts, timestamp, and IP address",
          "Verify that the audit log file was deleted immediately",
          "Verify that the audit record can be modified by the sender",
          "Ensure no record exists in the database"
        ],
        correctAnswer: 0,
        explanation: "Regulatory compliance mandates an immutable, detailed audit record for every substantial financial transfer."
      },
      {
        id: "Q-MNT-029-10",
        text: "In the capstone Go/No-Go release meeting, what document does the Lead QA Engineer present to synthesize all testing outcomes?",
        options: [
          "QA Executive Release Sign-Off Report containing metrics, test results, known risks, and formal deployment recommendation",
          "A handwritten thank-you card",
          "A list of software development team birthdays",
          "A competitor marketing analysis"
        ],
        correctAnswer: 0,
        explanation: "The QA Executive Release Sign-Off Report provides the authoritative, data-backed summary governing release approval."
      }
    ]
  },
  {
    id: "ASM-MNT-030",
    courseId: "CRS-MNT-001",
    chapterId: "CH-MNT-030",
    title: "Assessment: QA Career Mastery & ISTQB Certification",
    passingScore: 70,
    questions: [
      {
        id: "Q-MNT-030-01",
        text: "What is the passing score for the ISTQB Certified Tester Foundation Level (CTFL) examination?",
        options: ["65% (26 out of 40 questions)", "50% (20 out of 40 questions)", "80% (32 out of 40 questions)", "100% (40 out of 40 questions)"],
        correctAnswer: 0,
        explanation: "The ISTQB CTFL exam requires achieving at least 65% (answering 26 or more out of 40 questions correctly)."
      },
      {
        id: "Q-MNT-030-02",
        text: "In ISTQB cognitive levels, what does a 'K3' question test?",
        options: [
          "Application: Applying a testing technique or procedure to a specific scenario (e.g. deriving boundary values)",
          "Remembering: Recalling a factual definition",
          "Understanding: Explaining the rationale for a concept",
          "Writing code from scratch"
        ],
        correctAnswer: 0,
        explanation: "K3 measures application skills, requiring candidates to calculate or design tests for specific practical scenarios."
      },
      {
        id: "Q-MNT-030-03",
        text: "When an interviewer asks 'How would you test a coffee machine?', what is the most impressive opening approach for a candidate?",
        options: [
          "Clarify requirements and context: Ask about user demographics, cup sizes, payment mechanisms, and environmental constraints",
          "Start listing random buttons to press",
          "Say that coffee machines cannot be tested",
          "Demand to see the source code"
        ],
        correctAnswer: 0,
        explanation: "Top candidates always clarify requirements, operational parameters, and assumptions before jumping to test design."
      },
      {
        id: "Q-MNT-030-04",
        text: "How should a professional QA engineer advocate for a critical bug when a developer claims 'No user will ever do that'?",
        options: [
          "Present objective data: production analytics on user behavior, business impact, potential revenue loss, and step-by-step reproduction",
          "Start an argument and yell in the office",
          "Silently delete the bug report",
          "Refuse to test any more features from that developer"
        ],
        correctAnswer: 0,
        explanation: "Professional bug advocacy relies on objective evidence, user telemetry, business risk quantification, and collaborative triage."
      },
      {
        id: "Q-MNT-030-05",
        text: "What role does a Software Development Engineer in Test (SDET) play compared to a manual QA engineer?",
        options: [
          "An SDET writes code to build automated test frameworks, CI/CD quality gates, and testing tools alongside development",
          "An SDET only tests printers",
          "An SDET is a project manager",
          "There is no difference in skillset or role"
        ],
        correctAnswer: 0,
        explanation: "SDETs combine software engineering skills with QA discipline to build scalable automation architectures and tooling."
      },
      {
        id: "Q-MNT-030-06",
        text: "In ISTQB terminology, what is 'Confirmation Testing'?",
        options: [
          "Retesting: Executing test cases to confirm that a defect has been successfully fixed",
          "Confirming that a meeting will take place",
          "Confirming the developer's employment status",
          "Testing only on confirmed hardware"
        ],
        correctAnswer: 0,
        explanation: "Confirmation testing (retesting) verifies that a previously failing defect has been resolved by a code fix."
      },
      {
        id: "Q-MNT-030-07",
        text: "What is an effective artifact to include in a technical QA portfolio when interviewing for senior roles?",
        options: [
          "A comprehensive Master Test Plan, an automated Postman API collection with scripts, and a sanitized executive sign-off memo",
          "A list of company confidential passwords",
          "A screenshot of a desktop wallpaper",
          "A certificate of participation in an elementary school race"
        ],
        correctAnswer: 0,
        explanation: "A robust portfolio demonstrates test strategy authoring, API test design, and executive communication skills."
      },
      {
        id: "Q-MNT-030-08",
        text: "What does the ISTQB testing principle 'Testing shows the presence of defects, not their absence' mean?",
        options: [
          "Testing proves that defects exist, but even if no defects are found, it does not prove the software is 100% defect-free",
          "Testing always fails",
          "Testers must invent imaginary defects",
          "Software can never be deployed"
        ],
        correctAnswer: 0,
        explanation: "Testing reduces the probability of undiscovered defects remaining, but cannot mathematically prove zero defects exist."
      },
      {
        id: "Q-MNT-030-09",
        text: "What is the primary difference between a Test Case and a Test Suite?",
        options: [
          "A Test Case is an individual set of inputs, execution conditions, and expected results; a Test Suite is a collection of related test cases",
          "A Test Case is written in Python; a Test Suite is written in Word",
          "A Test Suite is only executed in production",
          "There is no difference between them"
        ],
        correctAnswer: 0,
        explanation: "A test case validates a specific verification scenario; a test suite bundles multiple test cases for cohesive execution."
      },
      {
        id: "Q-MNT-030-10",
        text: "What mindset distinguishes a world-class Quality Assurance professional from an average tester?",
        options: [
          "Viewing quality as defect prevention and whole-team enablement, advocating relentlessly for end users and business value",
          "Viewing quality as merely checking off manual test steps at the end of a sprint",
          "Finding ways to make developers look bad",
          "Avoiding any technical or code understanding"
        ],
        correctAnswer: 0,
        explanation: "Elite QA champions quality across people, process, and architecture, focusing on defect prevention and customer advocacy."
      }
    ]
  }
];

export const phase5 = { chapters: phase5Chapters, assessments: phase5Assessments };
