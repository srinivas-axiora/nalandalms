export const phase5Chapters = [
  {
    id: "CH-AUT-026",
    courseId: "CRS-AUT-001",
    title: "Continuous Testing & CI/CD Pipelines: GitHub Actions & Jenkins",
    order: 26,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=scEDHsr3APg",
    content: `# Continuous Testing & CI/CD Pipelines: GitHub Actions & Jenkins

### Learning Objectives
1. Architect end-to-end Continuous Testing pipelines in GitHub Actions and Jenkins.
2. Implement Matrix Builds to execute test suites concurrently across OS (Ubuntu, macOS, Windows) and browsers.
3. Configure artifact archiving for test reports, video recordings, and trace zip bundles.
4. Establish Pull Request quality gates and integrate automated Slack/Teams build notifications.

---

### 1. Continuous Testing Pipeline Architecture

Continuous Testing embeds automated quality verification into every commit, pull request, and deployment event:

\`\`\`
   [ Developer Git Push ]
              |
              v
     +-----------------+
     |  FAST LINT &    |  --> Static analysis, SonarQube,
     |  UNIT TESTS     |      Unit tests in Jest/JUnit (< 2 mins)
     +--------+--------+
              | PASS
              v
     +-----------------+
     |  API CONTRACT   |  --> REST Assured / Pact tests against
     |  TEST MATRIX    |      mocked or containerized services (< 5 mins)
     +--------+--------+
              | PASS
              v
     +-----------------+
     | PARALLEL UI E2E |  --> Playwright / Selenium across 4 browser shards
     |  SMOKE GATES    |      (Chromium, WebKit, Firefox) (< 8 mins)
     +--------+--------+
              | ALL GATES PASS
              v
     +-----------------+
     | MERGE PR / DEPLOY
     +-----------------+
\`\`\`

---

### 2. GitHub Actions Workflow Configuration

\`\`\`yaml
name: Production End-to-End Test Suite

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  e2e-matrix:
    timeout-minutes: 30
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shardIndex: [1, 2, 3, 4]
        shardTotal: [4]

    steps:
      - name: Checkout Code Repository
        uses: actions/checkout@v4

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Install Playwright Browsers & OS Dependencies
        run: npx playwright install --with-deps

      - name: Run Sharded Playwright Tests
        run: npx playwright test --shard=\${{ matrix.shardIndex }}/\${{ matrix.shardTotal }}

      - name: Upload Test Results & Failure Traces
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report-shard-\${{ matrix.shardIndex }}
          path: playwright-report/
          retention-days: 14
\`\`\`

---

### 3. Automated Failure Notifications

Integrating test results directly into developer communication channels accelerates triage and mean time to resolution (MTTR):

\`\`\`yaml
      - name: Send Slack Notification on Pipeline Failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: \${{ job.status }}
          fields: repo,message,commit,author,action,eventName,workflow
        env:
          SLACK_WEBHOOK_URL: \${{ secrets.SLACK_WEBHOOK_URL }}
\`\`\`

---

### 4. Hands-on Lab: GitHub Actions Pipeline Lab
1. Create a \`.github/workflows/e2e.yml\` workflow file.
2. Configure a 4-way parallel sharding matrix.
3. Push to a branch, observe simultaneous runner execution, and download the aggregated artifact report.`
  },
  {
    id: "CH-AUT-027",
    courseId: "CRS-AUT-001",
    title: "Visual Regression Testing & AI-Powered QA: Applitools & Percy",
    order: 27,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=F3zWw4Zp8sM",
    content: `# Visual Regression Testing & AI-Powered QA: Applitools & Percy

### Learning Objectives
1. Understand why DOM assertions miss visual bugs (CSS misalignments, overlapping text, color shifts).
2. Compare Pixel-by-Pixel diffing (pixelmatch) vs. AI-powered Visual AI (Applitools Eyes).
3. Integrate BrowserStack Percy and Applitools into Playwright and Cypress suites.
4. Manage visual baseline drift, dynamic content masking, and responsive layout comparisons.

---

### 1. Why Functional Tests Miss Visual Bugs

A functional test asserting that a button is attached to the DOM and has the text "Checkout" will pass even if:
- A CSS bug caused the button to be 2px high and illegible.
- The button is rendered upside-down or behind an unclickable banner.
- A font rendering error caused text to overflow into an adjacent column.

\`\`\`
   FUNCTIONAL TEST ASSERTION:
   expect(button).toBeVisible();  --> PASSES ✅ (Element exists in DOM)

   WHAT REAL USERS SEE:
   +---------------------------------------+
   | [CHECKOUT] button rendered at         |
   | opacity: 0.05 (Completely invisible!) |
   +---------------------------------------+
\`\`\`

**Visual Regression Testing** captures pixel-accurate screenshots of rendered pages and compares them against verified **Visual Baselines**.

---

### 2. Pixel-by-Pixel Diffing vs. Visual AI

| Feature | Pixel-by-Pixel Diffing (pixelmatch) | Visual AI (Applitools Eyes) |
| :--- | :--- | :--- |
| **Comparison Model** | Compares color values of coordinate (X,Y). | Uses computer vision algorithms mimicking human visual cortex. |
| **Anti-Aliasing** | Flaky; flags sub-pixel font anti-aliasing variations as false bugs. | Ignores sub-pixel rendering differences automatically. |
| **Dynamic Data** | Breaks if timestamp or username changes. | Supports semantic layout matching and ignore regions. |
| **Responsive Shift**| Fails on 1px padding shifts. | Understands layout structure and reflow. |

---

### 3. Implementing Visual Testing with Playwright

Playwright includes native snapshot diffing:

\`\`\`typescript
import { test, expect } from '@playwright/test';

test('homepage visual snapshot comparison', async ({ page }) => {
  await page.goto('https://nalanda.learning');

  // Mask dynamic elements that change across runs
  await expect(page).toHaveScreenshot('homepage-baseline.png', {
    mask: [page.getByTestId('live-clock'), page.getByTestId('user-avatar')],
    maxDiffPixelRatio: 0.02, // Allow up to 2% pixel variance for anti-aliasing
    fullPage: true
  });
});
\`\`\`

---

### 4. Hands-on Lab: Visual Regression Baseline
1. Take a baseline visual snapshot of a course card component.
2. Introduce an intentional 4px CSS margin change in the stylesheet.
3. Run the test, inspect the generated diff image highlighting visual variances in bright magenta, and approve or reject the baseline change.`
  },
  {
    id: "CH-AUT-028",
    courseId: "CRS-AUT-001",
    title: "Flaky Test Management, Quarantine & Self-Healing Locators",
    order: 28,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=VywxIQ2ZXw4",
    content: `# Flaky Test Management, Quarantine & Self-Healing Locators

### Learning Objectives
1. Classify root causes of test flakiness: race conditions, animation lag, shared state, and test order dependencies.
2. Implement automated Quarantine workflows to protect CI pipeline velocity and trust.
3. Architect Self-Healing locator mechanisms that adapt dynamically when frontend markup changes.
4. Measure and track the Flakiness Index using test telemetry dashboards.

---

### 1. The Flakiness Taxonomy

A test is **flaky** when it exhibits non-deterministic outcomes (passing and failing) without any changes to the underlying code.

\`\`\`
   +-------------------------------------------------------------+
   |                     SOURCES OF FLAKINESS                    |
   +-------------------------------------------------------------+
   | 1. Dynamic DOM Timing | Elements animating; AJAX in-flight   |
   | 2. Shared State       | Test A mutates DB data used by Test B|
   | 3. Order Dependency   | Test passes only when run after Auth |
   | 4. Network Glitches   | Third-party API rate limits / drops  |
   | 5. Hardware Strain    | CI CPU throttling slows execution    |
   +-------------------------------------------------------------+
\`\`\`

---

### 2. The Quarantine Pattern

Never allow flaky tests to run in the critical merge path. Teams that tolerate flaky tests quickly develop "CI alert fatigue" where real bugs are ignored.

\`\`\`
   [ Test Fails Intermittently in CI ]
                   |
                   v
   +---------------------------------------------+
   |             AUTOMATED QUARANTINE            |
   | 1. Label test as @quarantine or @flaky      |
   | 2. Remove from blocking PR merge gate       |
   | 3. Route to dedicated quarantine CI job     |
   | 4. Automatically create bug ticket for SDET |
   +---------------------------------------------+
                   |
                   | SDET fixes root timing/locator cause
                   v
   [ 50 Consecutive Passes ] --> Restored to Main CI Pipeline
\`\`\`

---

### 3. Self-Healing Locators Architecture

Self-healing frameworks maintain a multi-dimensional attribute profile for every element. If the primary selector fails, the engine computes similarity scores across backup attributes to heal the locator on the fly:

\`\`\`
   Primary:   [ data-testid="checkout-btn" ]  --> FAILS (Dev renamed attribute)
                     |
                     v (Self-Healing Fallback Engine)
   Backup 1:  [ role="button" & text="Complete Order" ] --> MATCH (98% confidence)
   Backup 2:  [ #order-checkout-primary ]               --> MATCH (90% confidence)
   Action:    Click button, complete test, and log auto-healing warning to Jira
\`\`\`

---

### 4. Hands-on Lab: Flaky Test Rehabilitation
1. Run a 10-test suite with intentional concurrency race conditions.
2. Use Playwright's \`--repeat-each=10\` flag to expose flaky tests.
3. Eliminate order dependencies by giving each test its own isolated tenant data.`
  },
  {
    id: "CH-AUT-029",
    courseId: "CRS-AUT-001",
    title: "Automated Security & Vulnerability Scanning in CI/CD",
    order: 29,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=0h3jO5BhnqE",
    content: `# Automated Security & Vulnerability Scanning in CI/CD

### Learning Objectives
1. Shift security testing left by embedding Dynamic Application Security Testing (DAST) into automated pipelines.
2. Configure OWASP Zed Attack Proxy (ZAP) in headless Docker mode.
3. Proxy automated functional E2E tests through OWASP ZAP to passively detect security vulnerabilities.
4. Establish security quality gates that fail builds on Critical or High OWASP alerts.

---

### 1. DevSecOps: Marrying QA Automation with Security

Security cannot be treated as an annual post-release audit. Modern SDETs configure existing functional browser test suites to route traffic through an intercepting security proxy:

\`\`\`
   [ Playwright / Selenium Tests ]
                  |
                  | Proxies all HTTP / HTTPS traffic
                  v
   +---------------------------------------------+
   |          OWASP ZAP SECURITY PROXY           |
   | - Analyzes headers (CSP, HSTS, X-Frame)     |
   | - Detects cookie security flaws (HttpOnly)  |
   | - Identifies information leaks & XSS        |
   +----------------------+----------------------+
                          |
                          v
   [ Target Application Under Test (Staging) ]
\`\`\`

---

### 2. Dockerized OWASP ZAP Pipeline Step

\`\`\`yaml
# GitHub Actions Step for Automated DAST
- name: Run OWASP ZAP Baseline Security Scan
  uses: zaproxy/action-baseline@v0.12.0
  with:
    target: 'https://staging.nalanda.learning'
    rules_file_name: '.zap/rules.tsv'
    cmd_options: '-a' # Include alpha passive scan rules
    fail_action: true # Fail the CI pipeline if High/Medium flaws found
\`\`\`

---

### 3. Passive vs. Active Security Scans in Automation

- **Passive Scanning**: ZAP inspects HTTP responses flowing through the proxy during normal automated functional test runs. It does not alter payloads or attack the target. Safe for staging and production.
- **Active Scanning**: ZAP actively injects malicious attack payloads (SQL injection strings, XSS scripts, path traversal) to exploit potential vulnerabilities. **Must only be run in isolated sandboxes!**

---

### 4. Hands-on Lab: ZAP Passive Scan Integration
1. Launch OWASP ZAP in Docker on port 8080.
2. Configure Playwright to route browser traffic through \`proxy: { server: 'http://localhost:8080' }\`.
3. Run functional authentication tests.
4. Export the ZAP security assessment report and inspect missing Content Security Policy (CSP) headers.`
  },
  {
    id: "CH-AUT-030",
    courseId: "CRS-AUT-001",
    title: "Test Data Management (TDM) & Database Seeding Strategies",
    order: 30,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=wX0kY748p1k",
    content: `# Test Data Management (TDM) & Database Seeding Strategies

### Learning Objectives
1. Implement autonomous Test Data Management (TDM) strategies that prevent shared database contention.
2. Generate realistic synthetic test datasets using libraries like Faker / JavaFaker.
3. Master database seeding via SQL migrations, Docker volumes, and API factory helpers.
4. Build clean teardown hooks ensuring tests leave zero residual artifacts in persistent datastores.

---

### 1. The Shared Test Data Nightmare

The #1 cause of unreliability in test automation is **shared, mutable test data**:
- Test A modifies the password of user \`test_user@domain.com\`.
- Test B runs concurrently and attempts to log in with the old password -> **FAILS**.
- Test C deletes customer \`CUST-100\` while Test D is verifying its order history -> **FAILS**.

\`\`\`
   GOLDEN RULE OF TEST DATA:
   Every test must create its own isolated, unique test data
   and clean up after itself, OR operate against immutable fixtures.
\`\`\`

---

### 2. Generating Synthetic Data with Faker

Never hardcode static emails or addresses. Use programmatic synthetic generators:

\`\`\`java
package com.nalanda.data;

import com.github.javafaker.Faker;
import java.util.Locale;

public class TestDataGenerator {
    private static final Faker faker = new Faker(new Locale("en-US"));

    public static UserProfile generateRandomUser() {
        return UserProfile.builder()
            .firstName(faker.name().firstName())
            .lastName(faker.name().lastName())
            .email("qa_" + faker.internet().uuid() + "@nalanda.org") // Guaranteed unique
            .phoneNumber(faker.phoneNumber().cellPhone())
            .streetAddress(faker.address().streetAddress())
            .city(faker.address().city())
            .zipCode(faker.address().zipCode())
            .build();
    }
}
\`\`\`

---

### 3. Database Seeding via API Factory vs. Direct SQL

| Strategy | Advantages | Disadvantages |
| :--- | :--- | :--- |
| **API Factory Seeding** (e.g. \`UserApi.createUser()\`) | High fidelity; triggers all business validation and database triggers naturally. | Slower if creating hundreds of hierarchical records. |
| **Direct SQL Seeding** (e.g. \`INSERT INTO users...\`) | Blazingly fast; sets up complex database states in milliseconds. | Bypasses business validation; breaks easily when schema migrations alter tables. |

---

### 4. Hands-on Lab: Autonomous Data Factory
1. Build an \`OrderDataFactory\` generating unique order requests.
2. Implement an \`@AfterEach\` database hook that purges created test records via primary keys.
3. Run 20 concurrent tests against the same database without data collisions.`
  },
  {
    id: "CH-AUT-031",
    courseId: "CRS-AUT-001",
    title: "Comprehensive Capstone: Enterprise E-Commerce Automation Suite",
    order: 31,
    estimatedMinutes: 60,
    videoUrl: "https://www.youtube.com/watch?v=k423X7jK5yI",
    content: `# Comprehensive Capstone: Enterprise E-Commerce Automation Suite

### Learning Objectives
1. Architect an enterprise-grade, multi-tier test automation framework from scratch.
2. Synthesize UI testing (Playwright), API validation (REST Assured), and visual comparison into a cohesive suite.
3. Configure parallel grid execution, dynamic data seeding, and failure telemetry.
4. Deliver an automated GitHub Actions CI/CD pipeline with Allure visual reporting and Slack alerts.

---

### 1. Capstone Enterprise Challenge: "Nalanda Global Store"

You are the Principal SDET hired to build the production test automation architecture for **Nalanda Global Store**, a high-volume multi-tenant e-commerce platform.

\`\`\`
   +-------------------------------------------------------------+
   |             CAPSTONE FRAMEWORK ARCHITECTURE                 |
   +-------------------------------------------------------------+
   |  [ TEST RUNNER ]     JUnit 5 / Playwright Test Runner       |
   |                                                             |
   |  [ TEST DESIGN ]     Page Object Model & Component Objects  |
   |                                                             |
   |  [ API ENGINE ]      REST Assured for rapid pre-seeding     |
   |                                                             |
   |  [ SYNCHRONIZATION ] Dynamic Auto-Waiting & Explicit Waits  |
   |                                                             |
   |  [ REPORTING ]       Allure Reports + Playwright Traces     |
   |                                                             |
   |  [ CI/CD ]           GitHub Actions Matrix Sharding (4x)    |
   +-------------------------------------------------------------+
\`\`\`

---

### 2. Capstone Milestones

#### Milestone 1: API Fast-Path Authentication & State Setup
- Avoid testing UI login 50 times!
- Implement an API client that obtains a JWT session token and injects cookies directly into the browser context, navigating directly to the checkout page in under 300ms.

#### Milestone 2: E2E Purchasing Workflow with Resilient Selectors
- Automate product search, facet filtering, cart addition, promo code application, and credit card processing.
- Strictly adhere to accessible \`getByRole\` and \`data-testid\` locators.

#### Milestone 3: Error Injection & Trace Debugging
- Intercept the payment gateway call with \`page.route()\` to simulate an unexpected bank decline (HTTP 402).
- Verify that the UI displays a helpful error banner without unhandled React exceptions.

#### Milestone 4: CI/CD Pipeline & Allure Reporting
- Wire the complete suite into GitHub Actions with matrix sharding.
- Configure Allure Report publishing to GitHub Pages with embedded failure screenshots and video recordings.

---

### 3. Capstone Deliverables Checklist
- [ ] Clean Git repository with clear modular structure (\`pages/\`, \`tests/\`, \`api/\`, \`fixtures/\`).
- [ ] Zero \`Thread.sleep()\` calls across the entire codebase.
- [ ] 100% passing test execution across 4 parallel workers.
- [ ] Automated Allure HTML report hosted as a build artifact.`
  },
  {
    id: "CH-AUT-032",
    courseId: "CRS-AUT-001",
    title: "SDET Career Mastery: System Design for QA & Technical Interview",
    order: 32,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=VywxIQ2ZXw4",
    content: `# SDET Career Mastery: System Design for QA & Technical Interview

### Learning Objectives
1. Excel in Tier-1 SDET technical interview rounds: Data Structures & Algorithms, Framework Architecture, and Live Debugging.
2. Master the "System Design for Testability" interview format.
3. Construct an elite open-source GitHub portfolio demonstrating professional framework engineering.
4. Chart the modern career path from QA Engineer to Staff SDET and Director of Quality Engineering.

---

### 1. The SDET Interview Spectrum

Top tech companies evaluate Software Development Engineers in Test across three distinct evaluation tracks:

\`\`\`
   [ TRACK 1: CODING & DSA ]       --> LeetCode Easy/Medium (Strings, Arrays,
                                       HashMaps, Trees, Recursion)
   [ TRACK 2: FRAMEWORK ARCHITECTURE]--> Design a framework from scratch on a
                                       whiteboard; explain POM, waits, CI/CD
   [ TRACK 3: SYSTEM DESIGN & QA ] --> "Design a distributed test infrastructure
                                       capable of running 100,000 tests daily"
\`\`\`

---

### 2. Tackling the Framework Architecture Whiteboard

When an interviewer asks: *"How would you architect an automation framework for our company?"*, avoid jumping into code syntax. Follow this structured 6-layer blueprint:

1. **Design Patterns**: Page Object Model + Component Object Model with fluent interfaces.
2. **Execution & Concurrency**: ThreadLocal driver pooling, JUnit 5 / TestNG parallel execution, or Playwright worker processes.
3. **Configuration & Environments**: Dynamic property loaders reading from environment variables or \`.env\` files (Base URLs, credentials, timeouts).
4. **Test Data Management**: Dynamic synthetic data generation via Faker; API factories for rapid state pre-seeding.
5. **Reporting & Observability**: Allure reporting with failure screenshots, network logs, and interactive trace bundles.
6. **CI/CD Integration**: Containerized Docker Grid scaling, GitHub Actions matrix sharding, and Slack webhooks.

---

### 3. System Design for Testability: 100,000 Tests Daily

#### Key Architectural Requirements:
- **Test Optimization**: Shifting 70% of regression to API contract tests, reserving UI for critical 10% journeys.
- **Dynamic Worker Autoscaling**: Kubernetes Horizontal Pod Autoscalers (HPA) spinning up browser pods on demand during PR spikes and terminating on idle.
- **Intelligent Test Selection (Impact Analysis)**: Analyzing git diffs to run only tests impacted by modified services rather than the full monolithic suite.
- **Automated Quarantine**: Isolating flaky tests automatically using ML telemetry models.

---

### 4. Hands-on Lab: Technical Interview Simulation
1. Solve a common SDET string manipulation coding problem (e.g. Valid Anagram or Longest Common Prefix).
2. Whiteboard a diagram of a distributed cross-browser grid.
3. Prepare a 3-minute executive elevator pitch describing your automated framework architecture.`
  }
];

export const phase5Assessments = [
  {
    id: "ASM-AUT-026",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-026",
    title: "Assessment: Continuous Testing & CI/CD Pipelines",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-026-01",
        text: "What is the primary benefit of Matrix Sharding in CI/CD pipeline automation (e.g. shard=1/4, 2/4)?",
        options: [
          "It splits a large test suite across multiple parallel runner machines, dramatically reducing total build time",
          "It converts Java tests into Python",
          "It encrypts the source code",
          "It automatically deletes failing tests"
        ],
        correctAnswer: 0,
        explanation: "Matrix sharding distributes test specs evenly across concurrent runners to accelerate feedback."
      },
      {
        id: "Q-AUT-026-02",
        text: "In GitHub Actions, which action step is used to preserve test reports and failure traces so developers can download them after the workflow completes?",
        options: [
          "actions/upload-artifact",
          "actions/checkout",
          "actions/cache",
          "actions/setup-node"
        ],
        correctAnswer: 0,
        explanation: "'actions/upload-artifact' uploads generated files (reports, traces) as downloadable artifacts."
      },
      {
        id: "Q-AUT-026-03",
        text: "What condition should be attached to the test report upload step in GitHub Actions so it executes even if tests fail?",
        options: ["if: always()", "if: failure()", "if: success()", "if: never()"],
        correctAnswer: 0,
        explanation: "'if: always()' ensures reports and failure artifacts upload regardless of pass/fail status."
      },
      {
        id: "Q-AUT-026-04",
        text: "What is a Pull Request Quality Gate in continuous testing?",
        options: [
          "An automated CI check that blocks merging unless all automated tests pass, coverage meets benchmarks, and static analysis reports 0 blockers",
          "A physical lock on the office server room",
          "A password required to open GitHub",
          "A manual signature on paper"
        ],
        correctAnswer: 0,
        explanation: "Quality gates enforce automated criteria that must be satisfied before code can merge into main branches."
      },
      {
        id: "Q-AUT-026-05",
        text: "What command installs both Playwright browser binaries and all required Linux operating system shared libraries on an Ubuntu CI runner?",
        options: [
          "npx playwright install --with-deps",
          "npx playwright get-browsers",
          "apt-get install browsers",
          "npm install browsers"
        ],
        correctAnswer: 0,
        explanation: "'--with-deps' installs required system dependencies (libgtk, libasound) required by headless browsers."
      },
      {
        id: "Q-AUT-026-06",
        text: "What does 'fail-fast: false' do in a GitHub Actions matrix strategy?",
        options: [
          "It allows remaining matrix jobs to finish running even if one matrix shard encounters a failure",
          "It cancels all jobs immediately on the first error",
          "It disables all assertions",
          "It makes tests run twice as fast"
        ],
        correctAnswer: 0,
        explanation: "'fail-fast: false' prevents GitHub from cancelling other matrix shards when one fails, ensuring complete test reporting."
      },
      {
        id: "Q-AUT-026-07",
        text: "Why should dependency caching ('cache: 'npm'') be configured in CI workflows?",
        options: [
          "It caches the 'node_modules' directory across runs, saving several minutes of download time on every build",
          "It makes browser tests invisible",
          "It bypasses the need for npm install",
          "It deletes unused dependencies"
        ],
        correctAnswer: 0,
        explanation: "Dependency caching avoids re-downloading packages, significantly speeding up workflow initialization."
      },
      {
        id: "Q-AUT-026-08",
        text: "How can CI/CD pipelines instantly alert developers when an automated test suite breaks on the main branch?",
        options: [
          "Via automated webhook notifications integrated with Slack, Microsoft Teams, or PagerDuty",
          "By sending physical letters",
          "By shutting down the developer's computer",
          "By locking the office doors"
        ],
        correctAnswer: 0,
        explanation: "Webhooks broadcast build statuses, failures, and commit details directly into team messaging platforms."
      },
      {
        id: "Q-AUT-026-09",
        text: "What is the recommended timeout duration configuration on CI test jobs to prevent hung processes from blocking runners indefinitely?",
        options: [
          "Setting an explicit timeout (e.g. timeout-minutes: 30)",
          "Disabling timeouts completely",
          "Setting timeout to 24 hours",
          "Timeouts are not supported in CI"
        ],
        correctAnswer: 0,
        explanation: "Configuring explicit timeouts terminates hung or zombie processes, freeing up runner capacity."
      },
      {
        id: "Q-AUT-026-10",
        text: "In continuous testing, when should lightweight smoke tests run compared to comprehensive regression tests?",
        options: [
          "Smoke tests run on every Pull Request (fast feedback <5 mins); regression tests run nightly or prior to production release",
          "Regression tests run on every keystroke; smoke tests run once a year",
          "Both must run simultaneously on every commit",
          "Smoke tests are only run manually"
        ],
        correctAnswer: 0,
        explanation: "Tiered testing provides rapid feedback on PRs with smoke suites while scheduling exhaustive regression suites overnight."
      }
    ]
  },
  {
    id: "ASM-AUT-027",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-027",
    title: "Assessment: Visual Regression Testing & Visual AI",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-027-01",
        text: "What major defect category is missed by standard DOM assertion testing but caught by Visual Regression Testing?",
        options: [
          "Visual CSS layout breaks, overlapping text, color regressions, and hidden buttons caused by styling bugs",
          "Backend SQL injection vulnerabilities",
          "Network timeout errors",
          "Database connection pool exhaustion"
        ],
        correctAnswer: 0,
        explanation: "Visual testing evaluates rendered visual output, catching styling and layout issues that DOM tests miss."
      },
      {
        id: "Q-AUT-027-02",
        text: "What is a 'Visual Baseline' in visual testing?",
        options: [
          "An approved, gold-standard screenshot of a page or component used as the benchmark to compare future test runs against",
          "The bottom of the computer monitor",
          "A line drawn on a piece of paper",
          "A font size setting"
        ],
        correctAnswer: 0,
        explanation: "Baselines represent the verified expected appearance; new screenshots are compared against them for variances."
      },
      {
        id: "Q-AUT-027-03",
        text: "Why is traditional Pixel-by-Pixel diffing (e.g. pixelmatch) often prone to false positive test failures?",
        options: [
          "Minor operating system sub-pixel font anti-aliasing variations or 1px layout reflows trigger pixel mismatches even when visually identical to humans",
          "Pixel diffing does not work on color monitors",
          "Pixels change color randomly every day",
          "It can only compare black and white images"
        ],
        correctAnswer: 0,
        explanation: "Sub-pixel font rendering differences across OS engines cause false alarms in rigid pixel-by-pixel comparisons."
      },
      {
        id: "Q-AUT-027-04",
        text: "How does AI-powered Visual Testing (such as Applitools Eyes) improve upon strict pixel diffing?",
        options: [
          "It uses computer vision algorithms that emulate human visual perception, ignoring negligible anti-aliasing and handling responsive reflow",
          "It writes test cases automatically without code",
          "It eliminates the need for browsers",
          "It runs on paper printouts"
        ],
        correctAnswer: 0,
        explanation: "Visual AI mimics human eye perception, focusing on meaningful visual defects while ignoring technical noise."
      },
      {
        id: "Q-AUT-027-05",
        text: "How do you prevent dynamic content (like a live clock or rotating news banner) from breaking visual snapshot tests in Playwright?",
        options: [
          "Use the 'mask' option to cover dynamic elements with solid overlay boxes: expect(page).toHaveScreenshot({ mask: [clock] })",
          "Delete the elements from the production website",
          "Turn off the internet during the test",
          "Take blurry screenshots"
        ],
        correctAnswer: 0,
        explanation: "Masking overlays dynamic elements with solid color boxes so transient content changes are ignored during diffing."
      },
      {
        id: "Q-AUT-027-06",
        text: "What visual testing platform by BrowserStack integrates with Playwright and Cypress for cross-browser visual review workflows?",
        options: ["Percy", "Selenium", "Postman", "Wireshark"],
        correctAnswer: 0,
        explanation: "Percy is BrowserStack's visual testing platform for automated snapshot reviews and baseline management."
      },
      {
        id: "Q-AUT-027-07",
        text: "What color is standardly used by visual diffing engines to highlight pixel variances between baseline and actual screenshots?",
        options: ["Bright Magenta / Pink", "Invisible white", "Dark black", "Transparent green"],
        correctAnswer: 0,
        explanation: "Diffing tools highlight visual discrepancies using high-contrast magenta/pink for immediate visibility."
      },
      {
        id: "Q-AUT-027-08",
        text: "What does 'fullPage: true' do in Playwright screenshot assertions?",
        options: [
          "It scrolls the entire document to capture a complete composite screenshot from top header to bottom footer",
          "It maximizes the monitor brightness",
          "It captures the user's physical room",
          "It fills the hard drive with screenshots"
        ],
        correctAnswer: 0,
        explanation: "'fullPage: true' captures the full scrollable height of the document rather than just the visible viewport."
      },
      {
        id: "Q-AUT-027-09",
        text: "What should an SDET do when a visual regression test legitimately flags an approved intentional redesign of the navbar?",
        options: [
          "Approve and update the Visual Baseline to make the new design the new gold standard benchmark",
          "Reject the build and demand developers revert the redesign",
          "Delete the visual test",
          "Disable all CSS stylesheets"
        ],
        correctAnswer: 0,
        explanation: "When UI changes are intentional, accepting the diff updates the baseline to the new design."
      },
      {
        id: "Q-AUT-027-10",
        text: "What is an 'Ignore Region' in enterprise visual testing tools?",
        options: [
          "A defined bounding box coordinate on the page where visual differences are intentionally ignored during comparison",
          "A geographic country where testing is banned",
          "A section of code that is commented out",
          "An unclickable button"
        ],
        correctAnswer: 0,
        explanation: "Ignore regions exclude specific areas (e.g. third-party ads, dynamic timestamps) from visual diff evaluations."
      }
    ]
  },
  {
    id: "ASM-AUT-028",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-028",
    title: "Assessment: Flaky Test Management & Self-Healing",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-028-01",
        text: "What is the technical definition of a 'Flaky Test'?",
        options: [
          "A test that demonstrates non-deterministic results (both passing and failing) on identical code and environment configurations",
          "A test that fails 100% of the time due to a syntax error",
          "A test that takes longer than 1 hour to execute",
          "A test written by an intern"
        ],
        correctAnswer: 0,
        explanation: "Flakiness is intermittent, non-deterministic behavior where tests flip between pass and fail without code changes."
      },
      {
        id: "Q-AUT-028-02",
        text: "What is the primary danger of tolerating flaky tests in a team's continuous integration pipeline?",
        options: [
          "Alert fatigue: developers begin ignoring CI failures, assuming they are false alarms, which allows genuine bugs to escape to production",
          "The computer keyboard stops responding",
          "GitHub deletes the repository",
          "Test runs become completely free"
        ],
        correctAnswer: 0,
        explanation: "Flakiness erodes trust; teams stop treating test failures as blockers, leading to defect leakage."
      },
      {
        id: "Q-AUT-028-03",
        text: "What is the 'Quarantine Pattern' in test automation engineering?",
        options: [
          "Immediately isolating identified flaky tests into a non-blocking job so they do not block PR merges while SDETs investigate root causes",
          "Deleting flaky tests permanently without fixing them",
          "Putting the CI server in a separate room",
          "Running tests only on weekends"
        ],
        correctAnswer: 0,
        explanation: "Quarantining isolates intermittent tests to protect pipeline flow while preserving visibility until fixed."
      },
      {
        id: "Q-AUT-028-04",
        text: "How do Self-Healing locator mechanisms function when a primary selector breaks?",
        options: [
          "They analyze backup attribute profiles (text, roles, tags, relative positions) and automatically resolve the element using similarity matching",
          "They email the developer asking for help",
          "They invent imaginary buttons",
          "They restart the browser in dark mode"
        ],
        correctAnswer: 0,
        explanation: "Self-healing algorithms fall back to alternative attribute vectors to locate elements when primary selectors fail."
      },
      {
        id: "Q-AUT-028-05",
        text: "What Playwright CLI flag is commonly used in local environments to expose intermittent timing flakiness?",
        options: ["--repeat-each=N", "--debug-hard", "--loop-forever", "--find-flaky"],
        correctAnswer: 0,
        explanation: "'--repeat-each=N' runs specs N times consecutively to stress test timing and reveal intermittent failures."
      },
      {
        id: "Q-AUT-028-06",
        text: "Why is 'automatic test retry' (e.g. retries: 2) in CI considered a double-edged sword?",
        options: [
          "It masks underlying timing bugs and architectural flaws, allowing flaky tests to survive uncorrected while doubling CI execution times",
          "It is not supported in modern runners",
          "It causes computers to crash",
          "It deletes test reports"
        ],
        correctAnswer: 0,
        explanation: "Retries prevent builds from failing on transient network blips, but often mask flakiness instead of fixing root causes."
      },
      {
        id: "Q-AUT-028-07",
        text: "What common architectural flaw causes test order dependencies (e.g. Test B fails unless Test A runs first)?",
        options: [
          "Shared mutable state (such as static variables or dirty database records) left behind by preceding tests",
          "Using CSS selectors",
          "Running tests in headless mode",
          "Using Linux instead of macOS"
        ],
        correctAnswer: 0,
        explanation: "Order dependency happens when tests rely on residual data or state created by prior tests."
      },
      {
        id: "Q-AUT-028-08",
        text: "How should an SDET eliminate order dependencies in an e-commerce automation suite?",
        options: [
          "Ensure each test creates its own unique user account, cart items, and test fixtures dynamically, cleaning up upon completion",
          "Run all tests in alphabetical order",
          "Write all tests in a single giant 5,000-line method",
          "Disable parallel execution"
        ],
        correctAnswer: 0,
        explanation: "Independent test data generation guarantees that every test runs autonomously regardless of execution order."
      },
      {
        id: "Q-AUT-028-09",
        text: "What metric tracks the percentage of test runs that fail initially but pass on retry?",
        options: ["Flakiness Rate / Flip Rate", "Defect Density", "Cyclomatic Complexity", "Code Coverage"],
        correctAnswer: 0,
        explanation: "Flakiness or Flip Rate measures the frequency of tests changing state between runs on unchanged code."
      },
      {
        id: "Q-AUT-028-10",
        text: "What actionability check in Playwright helps prevent flakiness caused by CSS animations moving buttons across the screen?",
        options: ["Stability check (verifying element is not animating)", "Spelling check", "Color check", "Font check"],
        correctAnswer: 0,
        explanation: "Playwright's stability check verifies that the element's bounding box has stopped moving before clicking."
      }
    ]
  },
  {
    id: "ASM-AUT-029",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-029",
    title: "Assessment: Automated Security Scanning in CI/CD",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-029-01",
        text: "What does DAST stand for in continuous application security testing?",
        options: [
          "Dynamic Application Security Testing",
          "Direct Automated Software Tool",
          "Database Architecture Security Table",
          "Distributed Application System Transmission"
        ],
        correctAnswer: 0,
        explanation: "DAST analyzes running applications from the outside by inspecting responses and testing live endpoints."
      },
      {
        id: "Q-AUT-029-02",
        text: "What open-source security tool is widely used to proxy automated browser tests and detect vulnerabilities in CI/CD?",
        options: ["OWASP ZAP (Zed Attack Proxy)", "Wireshark", "Selenium Grid", "Postman"],
        correctAnswer: 0,
        explanation: "OWASP ZAP is the leading open-source security scanner, often configured as an automated proxy in CI."
      },
      {
        id: "Q-AUT-029-03",
        text: "What is the difference between Passive Security Scanning and Active Security Scanning in OWASP ZAP?",
        options: [
          "Passive scanning inspects traffic flowing through the proxy without modifying requests; Active scanning injects malicious payloads to exploit flaws",
          "Passive scanning only runs on weekends",
          "Active scanning does not find any vulnerabilities",
          "There is no difference"
        ],
        correctAnswer: 0,
        explanation: "Passive scans analyze natural application traffic safely; active scans inject live attack payloads."
      },
      {
        id: "Q-AUT-029-04",
        text: "Why should Active DAST scans NEVER be executed against production environments without strict authorization?",
        options: [
          "Active scans inject dangerous payloads (SQLi, command injections) that can delete database tables or corrupt live customer data",
          "Because active scans are illegal under international copyright law",
          "Because active scans turn off the internet",
          "Because active scans only work in development"
        ],
        correctAnswer: 0,
        explanation: "Active scanning executes real attacks that can corrupt production databases, trigger rate limits, or crash servers."
      },
      {
        id: "Q-AUT-029-05",
        text: "How can Playwright automated tests route their browser traffic through a local OWASP ZAP proxy?",
        options: [
          "By configuring the proxy option in browser launch: proxy: { server: 'http://localhost:8080' }",
          "By running tests on an Android phone",
          "By using HTTPS instead of HTTP",
          "Playwright cannot connect to proxies"
        ],
        correctAnswer: 0,
        explanation: "Playwright supports browser-level HTTP proxies via the launch or context 'proxy' configuration."
      },
      {
        id: "Q-AUT-029-06",
        text: "What security header should an automated DAST scanner verify to ensure the application mitigates Cross-Site Scripting (XSS)?",
        options: [
          "Content-Security-Policy (CSP)",
          "Access-Control-Allow-Origin",
          "Accept-Encoding",
          "Cache-Control"
        ],
        correctAnswer: 0,
        explanation: "Content Security Policy (CSP) restricts sources of executable scripts, mitigating XSS attacks."
      },
      {
        id: "Q-AUT-029-07",
        text: "What vulnerability occurs when an application transmits sensitive authentication session cookies without the 'Secure' attribute?",
        options: [
          "Cookies can be intercepted in plaintext over unencrypted Wi-Fi or plain HTTP connections",
          "Cookies expire in 2 seconds",
          "The browser crashes immediately",
          "Cookies cannot be read by JavaScript"
        ],
        correctAnswer: 0,
        explanation: "The Secure flag ensures cookies are only transmitted over TLS/HTTPS encrypted connections."
      },
      {
        id: "Q-AUT-029-08",
        text: "What CI action allows setting quality gates that fail pull requests when ZAP detects High or Critical security flaws?",
        options: [
          "Configuring 'fail_action: true' in the OWASP ZAP GitHub Action step",
          "Disabling GitHub pull requests",
          "Deleting the security report",
          "Ignoring all alerts"
        ],
        correctAnswer: 0,
        explanation: "Setting fail_action: true halts the pipeline when security rules matching designated thresholds are breached."
      },
      {
        id: "Q-AUT-029-09",
        text: "What security header prevents an application from being embedded inside an unauthorized '<iframe>' (mitigating Clickjacking attacks)?",
        options: [
          "X-Frame-Options: DENY (or Content-Security-Policy: frame-ancestors)",
          "X-XSS-Protection",
          "Strict-Transport-Security",
          "Server: Apache"
        ],
        correctAnswer: 0,
        explanation: "X-Frame-Options and CSP frame-ancestors block framing by malicious third-party websites."
      },
      {
        id: "Q-AUT-029-10",
        text: "What does SAST (Static Application Security Testing) scan compared to DAST?",
        options: [
          "SAST scans the source code repository directly for vulnerabilities without running the application; DAST scans the running app",
          "SAST only tests mobile applications",
          "SAST is performed manually by hackers",
          "SAST does not find security bugs"
        ],
        correctAnswer: 0,
        explanation: "SAST inspects static source code (e.g. via SonarQube or Snyk); DAST inspects active runtime behavior."
      }
    ]
  },
  {
    id: "ASM-AUT-030",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-030",
    title: "Assessment: Test Data Management & Seeding",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-030-01",
        text: "What is the primary danger of using hardcoded, static user accounts across automated parallel tests?",
        options: [
          "Data collisions and state corruption: concurrent tests overwrite each other's passwords, cart items, or balances, causing false failures",
          "Hardcoded accounts use too much RAM",
          "Static accounts are illegal in Java",
          "Static accounts cannot be stored in databases"
        ],
        correctAnswer: 0,
        explanation: "Shared mutable accounts cause race conditions and unexpected state mutations during parallel execution."
      },
      {
        id: "Q-AUT-030-02",
        text: "What is the role of libraries like Faker (JavaFaker / @faker-js/faker) in test automation?",
        options: [
          "Generating realistic, dynamic, and unique synthetic test data (names, emails, credit cards, addresses) at runtime",
          "Faking test results to make failing tests pass",
          "Creating fake computer hardware",
          "Generating fake CSS stylesheets"
        ],
        correctAnswer: 0,
        explanation: "Faker generates randomized, unique synthetic attributes to ensure tests operate against isolated data."
      },
      {
        id: "Q-AUT-030-03",
        text: "Why is API Factory Seeding (e.g. calling POST /api/users to create a user) preferred over UI registration during E2E checkout tests?",
        options: [
          "It takes 200ms via API compared to 15 seconds through the UI, saving immense time while executing real business logic and triggers",
          "API seeding is illegal",
          "UI registration does not save data to the database",
          "Browsers cannot create user accounts"
        ],
        correctAnswer: 0,
        explanation: "API fast-path seeding sets up prerequisite state in milliseconds, reserving UI testing for the feature under test."
      },
      {
        id: "Q-AUT-030-04",
        text: "What is a 'Database Fixture' in test automation?",
        options: [
          "A predefined, consistent baseline dataset loaded into the database before test execution begins",
          "A physical cable connecting the server",
          "A bug in the database schema",
          "A database user with root privileges"
        ],
        correctAnswer: 0,
        explanation: "Fixtures provide known baseline datasets (e.g. standard product catalogs) for reproducible testing."
      },
      {
        id: "Q-AUT-030-05",
        text: "What database testing technique isolates test mutations by rolling back changes at the end of each test method?",
        options: [
          "Database Transaction Rollback (@Transactional)",
          "Re-formatting the hard drive",
          "Deleting all database tables",
          "Shutting down the database server"
        ],
        correctAnswer: 0,
        explanation: "Executing tests within uncommitted database transactions that rollback at teardown ensures pristine isolation."
      },
      {
        id: "Q-AUT-030-06",
        text: "How should unique email addresses be generated to guarantee zero collisions during high-concurrency parallel runs?",
        options: [
          "Appending a UUID or microsecond timestamp: 'user_' + UUID.randomUUID() + '@domain.com'",
          "Using 'user1@domain.com' for all tests",
          "Using random single-digit numbers",
          "Hardcoding the developer's personal email"
        ],
        correctAnswer: 0,
        explanation: "UUIDs provide mathematical collision-free uniqueness across thousands of distributed concurrent test runners."
      },
      {
        id: "Q-AUT-030-07",
        text: "What is the 'Tear-Down' responsibility in autonomous test data management?",
        options: [
          "Cleaning up or soft-deleting any persistent records created by the test so the environment does not accumulate dirty orphan data",
          "Tearing down the office building",
          "Uninstalling the IDE",
          "Deleting the Git repository"
        ],
        correctAnswer: 0,
        explanation: "Teardown hooks purge or anonymize created test artifacts to prevent database bloat and environment pollution."
      },
      {
        id: "Q-AUT-030-08",
        text: "What tool allows spinning up temporary, disposable real database containers (Postgres, MySQL, Redis) in Docker for integration tests?",
        options: ["Testcontainers", "VirtualBox", "Selenium Grid", "WireMock"],
        correctAnswer: 0,
        explanation: "Testcontainers is the industry-standard Java/Node library for provisioning disposable Docker database instances."
      },
      {
        id: "Q-AUT-030-09",
        text: "Why should production database dumps containing real customer PII NEVER be imported into QA testing environments?",
        options: [
          "It violates GDPR, HIPAA, and privacy regulations; real PII must be sanitized and masked before use in test environments",
          "Because production databases are too small",
          "Because databases don't work in QA",
          "Because customers will receive phone calls from tests"
        ],
        correctAnswer: 0,
        explanation: "Data privacy regulations mandate that customer PII must never be stored in lower-security test environments."
      },
      {
        id: "Q-AUT-030-10",
        text: "What is an 'Ephemeral Database'?",
        options: [
          "A short-lived database created specifically for a test run and completely destroyed immediately after tests finish",
          "A database stored only in the clouds",
          "A database without any tables",
          "A paper ledger"
        ],
        correctAnswer: 0,
        explanation: "Ephemeral databases guarantee complete isolation by living only for the duration of the test suite."
      }
    ]
  },
  {
    id: "ASM-AUT-031",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-031",
    title: "Assessment: Enterprise E-Commerce Capstone Suite",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-031-01",
        text: "In the enterprise capstone architecture, how does the framework bypass the slow UI login page during 50 checkout tests?",
        options: [
          "By using API fast-path authentication to obtain a session token and injecting cookies directly into the browser context",
          "By removing the login screen from the website",
          "By hardcoding the password in the HTML",
          "By testing without any authentication"
        ],
        correctAnswer: 0,
        explanation: "Fast-path authentication injects authenticated session state directly into browser contexts in milliseconds."
      },
      {
        id: "Q-AUT-031-02",
        text: "What locator strategy is strictly mandated in the capstone framework for critical interactive buttons?",
        options: [
          "Accessible role locators: getByRole('button', { name: '...' }) or data-testid hooks",
          "Absolute XPath expressions",
          "CSS font-family selectors",
          "Element coordinate clicks"
        ],
        correctAnswer: 0,
        explanation: "Accessible roles and data-testid attributes provide high resilience against UI restyling."
      },
      {
        id: "Q-AUT-031-03",
        text: "In the payment decline milestone, how is the third-party payment gateway error simulated deterministically?",
        options: [
          "Using Playwright's page.route() to intercept the checkout API and fulfill with an HTTP 402 Payment Required status",
          "Using an expired real credit card",
          "Turning off the office Wi-Fi",
          "Asking the bank to cancel the account"
        ],
        correctAnswer: 0,
        explanation: "Network interception via page.route allows deterministic simulation of third-party payment failures."
      },
      {
        id: "Q-AUT-031-04",
        text: "What reporting tool is integrated into the capstone to generate interactive HTML reports with timelines, graphs, and failure screenshots?",
        options: ["Allure Report", "Notepad", "Excel", "Console.log"],
        correctAnswer: 0,
        explanation: "Allure Report is the standard enterprise open-source test reporting framework across Java and JS."
      },
      {
        id: "Q-AUT-031-05",
        text: "What rule governs wait mechanisms across the entire capstone framework codebase?",
        options: [
          "Zero Thread.sleep() calls; all synchronization must rely on dynamic auto-waiting and explicit condition polling",
          "All tests must wait exactly 10 seconds per step",
          "Waits are forbidden",
          "Waits must be written in assembly language"
        ],
        correctAnswer: 0,
        explanation: "Production enterprise frameworks strictly prohibit hardcoded thread sleeps in favor of dynamic synchronization."
      },
      {
        id: "Q-AUT-031-06",
        text: "How does the capstone framework ensure that tests run cleanly across 4 concurrent parallel workers without collisions?",
        options: [
          "Each test generates isolated test data with UUID prefixes and runs within an isolated BrowserContext",
          "By running tests on 4 physical computers",
          "By running tests one at a time",
          "By sharing a single admin account"
        ],
        correctAnswer: 0,
        explanation: "Autonomous test data generation and browser context isolation enable collision-free concurrent execution."
      },
      {
        id: "Q-AUT-031-07",
        text: "What artifact is uploaded to GitHub Actions upon capstone test completion to enable post-mortem debugging of failures?",
        options: [
          "Playwright Trace zip bundles and Allure HTML report directories",
          "The developer's desktop wallpaper",
          "The compiled Java bytecode",
          "The computer BIOS settings"
        ],
        correctAnswer: 0,
        explanation: "Trace bundles and reports provide complete post-mortem diagnostics of CI test runs."
      },
      {
        id: "Q-AUT-031-08",
        text: "What is verified in the capstone when testing promo code validation?",
        options: [
          "That applying a valid promo code calculates the percentage discount accurately and recalculates tax and total price accordingly",
          "That promo codes are printed on paper",
          "That promo codes never expire",
          "That promo codes are free"
        ],
        correctAnswer: 0,
        explanation: "Cart checkout verification validates price discounts, recalculations, and total ledger consistency."
      },
      {
        id: "Q-AUT-031-09",
        text: "What architectural pattern organizes the capstone's navigation bars, search inputs, and modal dialogs?",
        options: [
          "Component Object Pattern",
          "Singleton Pattern only",
          "Monolithic Script Pattern",
          "Linear Procedural Pattern"
        ],
        correctAnswer: 0,
        explanation: "Component Objects encapsulate reusable UI sections across multiple page objects."
      },
      {
        id: "Q-AUT-031-10",
        text: "What exit status code must the CI test command emit if any automated test in the capstone suite fails?",
        options: ["Non-zero exit code (e.g. exit 1)", "Exit code 0", "Exit code 200", "No exit code"],
        correctAnswer: 0,
        explanation: "CI/CD engines detect build failures through non-zero process exit codes."
      }
    ]
  },
  {
    id: "ASM-AUT-032",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-032",
    title: "Assessment: SDET Career Mastery & Technical Interviews",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-032-01",
        text: "What core capability distinguishes a Software Development Engineer in Test (SDET) from a traditional QA Automation Engineer?",
        options: [
          "SDETs possess full-stack software engineering depth: designing scalable test platforms, CI/CD architectures, tooling, and testability features alongside developers",
          "SDETs only write manual test cases",
          "SDETs do not know how to code",
          "SDETs are hardware technicians"
        ],
        correctAnswer: 0,
        explanation: "SDETs combine software engineering rigor with quality architecture to build platforms and automated systems."
      },
      {
        id: "Q-AUT-032-02",
        text: "When whiteboarding framework architecture in an interview, what are the essential layers to present?",
        options: [
          "Design Patterns (POM), Dynamic Synchronization, Test Runners, Data Management, Reporting, and CI/CD Infrastructure",
          "Keyboard shortcuts and screen brightness",
          "A list of favorite video games",
          "The company organizational chart"
        ],
        correctAnswer: 0,
        explanation: "A complete framework architecture covers design patterns, synchronization, runner execution, test data, reporting, and CI/CD."
      },
      {
        id: "Q-AUT-032-03",
        text: "In an SDET interview challenge 'Design a test platform capable of running 50,000 tests daily', what architectural strategy is critical?",
        options: [
          "Heavy test pyramid optimization (70% API/Contract), dynamic container auto-scaling (Kubernetes), and impact-based test selection",
          "Running all 50,000 tests through UI browsers on a single laptop",
          "Deleting 49,000 tests",
          "Running tests once every six months"
        ],
        correctAnswer: 0,
        explanation: "Massive scale requires shifting tests to fast API layers, distributed container scaling, and smart test selection."
      },
      {
        id: "Q-AUT-032-04",
        text: "What is 'Impact-Based Test Selection' (or Predictive Test Selection)?",
        options: [
          "Analyzing source code git diffs to execute only the subset of automated tests affected by code modifications rather than the entire suite",
          "Running tests that impact computer hardware",
          "Randomly selecting 5 tests to run",
          "Selecting tests based on their file size"
        ],
        correctAnswer: 0,
        explanation: "Impact analysis identifies modified dependencies and maps them to impacted tests, slashing pipeline execution time."
      },
      {
        id: "Q-AUT-032-05",
        text: "How should an SDET answer the behavioral question: 'A developer refuses to fix your automated bug, claiming it's a minor edge case'?",
        options: [
          "Present objective production telemetry, business risk quantification, reproduction frequency, and escalate collaboratively to Product in triage",
          "Argue aggressively in the office kitchen",
          "Delete the automated test from GitHub",
          "Refuse to test any code from that developer"
        ],
        correctAnswer: 0,
        explanation: "Top SDETs remain objective, presenting data, customer usage analytics, and commercial impact in structured triage."
      },
      {
        id: "Q-AUT-032-06",
        text: "What data structure is optimal for verifying whether an array of strings contains duplicates in O(N) time complexity?",
        options: ["HashSet / Set", "LinkedList", "Binary Tree", "Stack"],
        correctAnswer: 0,
        explanation: "HashSets provide O(1) average lookup and insertion, allowing linear O(N) duplicate detection."
      },
      {
        id: "Q-AUT-032-07",
        text: "What makes an open-source GitHub portfolio standout during senior SDET candidate evaluations?",
        options: [
          "A production-ready framework repository demonstrating clean architecture, Docker compose grid, CI workflows, and detailed documentation",
          "Forking 500 random repositories without writing any code",
          "A blank repository with only a README file",
          "A collection of pirated software"
        ],
        correctAnswer: 0,
        explanation: "Interviewers look for clean architecture, containerization, active CI workflows, and engineering maturity."
      },
      {
        id: "Q-AUT-032-08",
        text: "What is 'Shift-Right Testing' in modern quality engineering?",
        options: [
          "Testing in production using synthetic user monitoring, canary releases, feature flags, and distributed telemetry (observability)",
          "Testing only on the right side of the monitor",
          "Postponing all testing until after deployment",
          "Reassigning tests to marketing"
        ],
        correctAnswer: 0,
        explanation: "Shift-right encompasses production monitoring, canary verification, and real-user synthetic traffic."
      },
      {
        id: "Q-AUT-032-09",
        text: "What is the time complexity of looking up a key in a balanced HashMap?",
        options: ["O(1) average time", "O(N^2) time", "O(log N) time", "O(N!) time"],
        correctAnswer: 0,
        explanation: "HashMaps offer O(1) constant average time complexity for key lookups."
      },
      {
        id: "Q-AUT-032-10",
        text: "What executive mindset defines a Staff SDET / Principal Quality Architect?",
        options: [
          "Treating quality as a whole-engineering capability: building developer productivity tools, CI/CD quality gates, and fostering defect prevention",
          "Writing as many lines of test code as possible",
          "Finding ways to block developers from shipping",
          "Focusing exclusively on manual regression execution"
        ],
        correctAnswer: 0,
        explanation: "Principal SDETs empower entire engineering organizations with tools, metrics, and architectures that make quality frictionless."
      }
    ]
  }
];

export const phase5 = {
  chapters: phase5Chapters,
  assessments: phase5Assessments
};

