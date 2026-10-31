export const phase3Chapters = [
  {
    id: "CH-MNT-013",
    courseId: "CRS-MNT-001",
    title: "Defect Lifecycle, Triage & Root Cause Analysis (RCA)",
    order: 13,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=R9Z8bW6S2_0",
    content: `# Defect Lifecycle, Triage & Root Cause Analysis (RCA)

### Learning Objectives
1. Map the end-to-end defect state machine from submission to closure.
2. Establish rigorous triage criteria differentiating Severity (impact on system) vs Priority (business urgency).
3. Conduct Root Cause Analysis using the 5 Whys, Ishikawa (Fishbone) diagrams, and Pareto analysis (80/20 rule).
4. Compute key quality metrics: Defect Density, Defect Age, and Defect Removal Efficiency (DRE).

---

### 1. The Defect State Machine

A software defect (or bug) is a variance between the actual result and expected result. Managing defects requires a deterministic workflow governed by states and transitions.

\`\`\`
       +-------------+
       |     NEW     |
       +------+------+
              | (Triage)
              v
       +-------------+        (Reject/Duplicate/Not a Bug)
       |   ASSIGNED  |------------------------------------+
       +------+------+                                    |
              | (Dev investigates)                        v
              v                                    +-------------+
       +-------------+                             |   REJECTED  |
       | IN PROGRESS |                             +-------------+
       +------+------+
              | (Code fix & Unit test)
              v
       +-------------+
       |    FIXED    |
       +------+------+
              | (QA Deployment)
              v
       +-------------+
       |   RETEST    |
       +------+------+
         |         |
(Pass)   |         | (Fail)
         v         v
   +----------+  +----------+
   |  CLOSED  |  | REOPENED |
   +----------+  +----+-----+
                      |
                      +---> (Back to IN PROGRESS)
\`\`\`

#### Key State Definitions
- **NEW / SUBMITTED**: Logged by QA, awaiting triage.
- **OPEN / ASSIGNED**: Validated by QA Lead / Product Owner and assigned to an engineering owner.
- **DEFERRED**: Valid bug, but intentionally postponed to a future sprint/release due to low priority or scope freeze.
- **REJECTED / WONTFIX**: Invalid behavior, working as designed, or duplicate of an existing ticket.
- **FIXED / RESOLVED**: Developer committed code fix and deployed to QA environment.
- **RETEST / VERIFY**: QA verifies fix against the exact build and preconditions.
- **REOPENED**: Retest failed; defect still reproducible or regression introduced.
- **CLOSED**: Verification passed; evidence attached and ticket permanently archived.

---

### 2. Severity vs. Priority Matrix

One of the most frequent dysfunctions in engineering teams is confusing **Severity** (technical impact) with **Priority** (commercial urgency).

| Combination | Definition | Real-World Example |
| :--- | :--- | :--- |
| **Critical Severity / High Priority (P1/S1)** | System crash, data corruption, total blocker with immediate commercial fallout. | Payment gateway returns HTTP 500 on all transactions during Black Friday sale. |
| **Critical Severity / Low Priority (P3/S1)** | Catastrophic failure in rare edge cases or unsupported configurations. | System crashes with kernel panic only on Windows 98 or IE6 (unsupported legacy platform). |
| **Low Severity / High Priority (P1/S4)** | Cosmetic or trivial technical issue, but high brand exposure or legal danger. | Company brand name misspelled on CEO homepage hero banner or GDPR privacy link broken. |
| **Low Severity / Low Priority (P4/S4)** | Minor cosmetic or alignment flaw with zero impact on functionality. | Tooltip margin is 4px instead of 8px on secondary admin settings page. |

---

### 3. Root Cause Analysis (RCA) Frameworks

Fixing bugs without addressing root causes leads to recurring failures. Top-tier QA teams lead Root Cause Analysis after critical incidents.

#### A. The 5 Whys Technique
- **Problem**: In-flight booking reservation failed during customer checkout.
- *Why 1*: The database timed out writing the booking record.
- *Why 2*: The connection pool was exhausted.
- *Why 3*: A previous batch inventory check failed to release database connections in its \`finally\` block.
- *Why 4*: The code was written during an emergency hotfix without automated unit testing of error paths.
- *Why 5 (Root Cause)*: Hotfix procedure bypassed standard static code analysis and peer review gates.
- **Corrective Action**: Enforce strict SonarQube quality gates on hotfix branches and audit all connection pool closures.

#### B. Defect Metrics Formulas

$$\\text{Defect Density} = \\frac{\\text{Total Defects Found}}{\\text{Size of Module (KLOC or Function Points)}}$$

$$\\text{Defect Removal Efficiency (DRE)} = \\frac{D_{\\text{Internal}}}{D_{\\text{Internal}} + D_{\\text{Production}}} \\times 100$$

A high DRE (above 95%) demonstrates that the QA process catches defects before they escape to end users.

---

### 4. Hands-on Lab: Bug Triage Simulation
1. Review 5 incoming defects from a release sprint.
2. Assign Severity (S1-S4) and Priority (P1-P4) based on SLA guidelines.
3. Formulate the triage decision (Accept, Defer, Reject, or Request More Info).`
  },
  {
    id: "CH-MNT-014",
    courseId: "CRS-MNT-001",
    title: "Defect Reporting Mastery: Crafting Irrefutable Bug Reports",
    order: 14,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=FqSPh_x2Yt4",
    content: `# Defect Reporting Mastery: Crafting Irrefutable Bug Reports

### Learning Objectives
1. Structure professional bug tickets that eliminate ambiguity and prevent "Works on My Machine" rejections.
2. Capture and attach technical artifacts: HAR files, console logs, network payloads, and annotated video recordings.
3. Formulate minimal, deterministic steps to reproduce (STR).
4. Configure Jira/Linear bug templates with mandatory fields and automation rules.

---

### 1. Anatomy of an Irrefutable Bug Report

A great bug report is an engineering document. It communicates what happened, what was expected, and gives developers the exact telemetry needed to fix the issue immediately without back-and-forth chat.

\`\`\`
+--------------------------------------------------------------------------+
| ISSUE KEY: FIN-2841                                       STATUS: Open   |
| TITLE: [Checkout][Stripe] 3DS verification modal freezes on Safari 17.2 |
+--------------------------------------------------------------------------+
| ENVIRONMENT:                                                             |
|   - OS: macOS Sonoma 14.3.1 (23D60)                                      |
|   - Browser: Apple Safari 17.2.1 (Webkit 617.1.49)                       |
|   - Client Build: v2.4.1-rc3 (SHA: 4a9f8b2)                              |
|   - Account: Sandbox user (tier: Gold, KYC: Verified)                    |
+--------------------------------------------------------------------------+
| PRECONDITIONS:                                                           |
|   1. User authenticated with active cart containing 1 physical SKU ($49) |
|   2. Payment method selected: Test Visa with 3D Secure enabled           |
+--------------------------------------------------------------------------+
| STEPS TO REPRODUCE (STR):                                                |
|   1. Navigate to /checkout/review.                                       |
|   2. Click 'Complete Order' button.                                      |
|   3. Observe the Stripe 3DS OTP modal appear.                            |
|   4. Enter OTP '123456' and click 'Submit'.                              |
+--------------------------------------------------------------------------+
| EXPECTED RESULT:                                                         |
|   Modal closes with loading spinner, and user is redirected to           |
|   /orders/confirmation?orderId=12345 with HTTP 200.                      |
+--------------------------------------------------------------------------+
| ACTUAL RESULT:                                                           |
|   Spinner freezes at 100%; iframe unmounts prematurely with error:      |
|   "TypeError: null is not an object (evaluating 't.postMessage')".        |
+--------------------------------------------------------------------------+
| ATTACHMENTS & TELEMETRY:                                                 |
|   - Video: 3ds_freeze_safari17.mp4 (annotated timestamp 00:14)           |
|   - HAR file: stripe_network_trace.har (captured from Web Inspector)     |
|   - Console Log: safari_console_trace.log                                |
+--------------------------------------------------------------------------+
\`\`\`

---

### 2. Capturing Advanced Technical Telemetry

#### A. HTTP Archive (HAR) Files
When dealing with network discrepancies, race conditions, or intermittent API failures, exporting a HAR file captures every single network request, header, payload, cookie, and round-trip timing.
- **Chrome / Edge / Firefox**: Open DevTools \`F12\` -> \`Network\` tab -> Ensure \`Preserve log\` is checked -> Reproduce bug -> Click \`Export HAR\` (down-arrow icon).
- **Sanitization Warning**: Always scrub sensitive Authorization bearer tokens or passwords before uploading HAR files to shared Jira tickets.

#### B. JavaScript Stack Traces & Crash Dumps
Never simply state "The page went blank". QA must open the Browser Console and record:
- The exact unhandled exception name (e.g., \`Uncaught TypeError\`).
- The source file and line number from the source map.
- The component stack trace (e.g., React component tree hierarchy).

---

### 3. Eliminating Ambiguity: Do's and Don'ts

| Aspect | Poor Bug Report ❌ | Professional Bug Report ✅ |
| :--- | :--- | :--- |
| **Title** | "Search is broken" | "[Search] Filter by 'Electronics' returns HTTP 500 when query contains apostrophe (e.g. 'O'Reilly')" |
| **Steps** | "Go to catalog, search, and click stuff until it fails" | "1. Visit /catalog\\n2. Enter 'O\\'Reilly' in search box\\n3. Select filter 'Electronics'\\n4. Click Search" |
| **Expected** | "It should work properly" | "Returns matching catalog items or displays 'No products found' banner with 0 errors" |
| **Actual** | "Nothing happened, screen got stuck" | "Search spinner loops indefinitely; Network tab shows POST /api/v1/search returned HTTP 500 Internal Server Error" |

---

### 4. Hands-on Lab: Bug Reporting Challenge
1. Open a live demo e-commerce store with an intentional defect.
2. Record browser actions with screencast tool.
3. Export HAR file and console output.
4. Compose a defect ticket in Markdown following the professional template.`
  },
  {
    id: "CH-MNT-015",
    courseId: "CRS-MNT-001",
    title: "Test Execution Cycles: Smoke, Sanity, Regression & Retesting",
    order: 15,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=XzWjBwbN65Y",
    content: `# Test Execution Cycles: Smoke, Sanity, Regression & Retesting

### Learning Objectives
1. Define the purpose, timing, and execution scope of Smoke, Sanity, Retesting, and Regression testing cycles.
2. Differentiate Retesting (verifying the defect fix) from Regression testing (verifying unaffected modules).
3. Design optimized Regression suites using Selective vs. Full regression techniques.
4. Build a deployment sign-off checklist for staging and production releases.

---

### 1. The Taxonomy of Test Execution Cycles

Testing is not a one-off phase; it executes in distinct, structured rhythms across the development lifecycle.

\`\`\`
   [ Developer commits code ]
               |
               v
     +-------------------+
     |   SMOKE TESTING   |  --> Build Acceptance: Does the app launch?
     +---------+---------+      Can a user log in? (Fast: 5-15 mins)
               | PASS
               v
     +-------------------+
     |  FEATURE TESTING  |  --> Deep functional validation of new user stories
     +---------+---------+
               | (Bug found & fixed)
               v
     +-------------------+
     |    RETESTING      |  --> Re-run specific failed test cases for the bug
     +---------+---------+
               | PASS
               v
     +-------------------+
     |  SANITY TESTING   |  --> Quick check on bug-fix area & related components
     +---------+---------+
               | PASS
               v
     +-------------------+
     | REGRESSION SUITE  |  --> Exhaustive verification that unchanged features
     +---------+---------+      did not break (Impact Analysis driven)
               | PASS
               v
     +-------------------+
     |  PROD DEPLOYMENT  |
     +-------------------+
\`\`\`

---

### 2. Smoke Testing vs. Sanity Testing: The Decisive Comparison

| Characteristic | Smoke Testing | Sanity Testing |
| :--- | :--- | :--- |
| **Origin / Metaphor** | Plumbing / Hardware: Apply smoke to pipes; if smoke leaks out, system is broken. | Mental health / Sanity: Is the developer thinking reasonably after a quick fix? |
| **When Executed** | Immediately after every new build / deployment to an environment. | After a defect fix is deployed, before deep regression. |
| **Scope** | Broad and shallow (verifies major subsystems end-to-end). | Narrow and deep (focuses specifically on the module modified by the fix). |
| **Goal** | Determine if the build is stable enough for QA to accept. | Determine if the specific bug fix works and didn't immediately wreck neighboring flows. |
| **Outcome on Failure** | Build rejected immediately; QA stops testing. | Bug fix rejected; developer reopens investigation. |

---

### 3. Retesting vs. Regression Testing

A common certification question and practical confusion point:
- **Retesting (Verification of Fix)**:
  - Carried out exclusively with the exact test data, steps, and environment where the defect originally occurred.
  - Objective: Prove the bug is gone.
- **Regression Testing (Side Effect Prevention)**:
  - Carried out across existing, previously working features.
  - Objective: Ensure the code change did not introduce unintended regressions in downstream services or shared database tables.

#### Regression Suite Optimization Strategies
1. **Retest All**: Running 100% of the regression suite. Only feasible with extensive test automation or small apps.
2. **Selective / Impact-Based Regression**: Analyze git diffs, modified APIs, and shared databases to test only impacted modules.
3. **Risk-Based Regression**: Execute critical business flows (P1 tests) first, followed by high-frequency user journeys.

---

### 4. Hands-on Lab: Regression Selection Matrix
1. Analyze a simulated Git commit diff changing the payment calculation tax logic.
2. Identify downstream impacted modules (Invoicing, Cart checkout, Order history, Admin tax reporting).
3. Select 15 targeted regression test cases from a master repository of 200 cases to complete regression within a 2-hour release window.`
  },
  {
    id: "CH-MNT-016",
    courseId: "CRS-MNT-001",
    title: "Test Management Tools: Jira, Zephyr & TestRail in Action",
    order: 16,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=wX0kY748p1k",
    content: `# Test Management Tools: Jira, Zephyr & TestRail in Action

### Learning Objectives
1. Configure modern test management suites (Zephyr Scale/Squad, TestRail, and Xray).
2. Organize test repositories using hierarchical folders, labels, and shared parameters.
3. Plan and execute Test Runs with live result tracking (Pass, Fail, Blocked, Retest).
4. Generate bidirectional Requirements Traceability Matrices (RTM) directly from test suites.

---

### 1. Modern QA Tool Ecosystem

In enterprise environments, test cases and defect tracking are tightly unified inside agile project management tools.

\`\`\`
   +-------------------------------------------------------------+
   |                       ATLASSIAN JIRA                        |
   |                                                             |
   |  +-------------------+              +--------------------+  |
   |  |   User Story      |<------------>|  Zephyr / Xray     |  |
   |  |   (PROJ-101)      |  Links to    |  Test Case         |  |
   |  +---------+---------+              |  (TEST-402)        |  |
   |            |                        +---------+----------+  |
   |            | Linked                           | Part of     |
   |            v                                  v             |
   |  +-------------------+              +--------------------+  |
   |  |   Bug Ticket      |<-------------|  Test Execution    |  |
   |  |   (PROJ-890)      |  Fails on    |  (Cycle 2026-W44)  |  |
   |  +-------------------+              +--------------------+  |
   +-------------------------------------------------------------+
\`\`\`

---

### 2. TestRail vs. Zephyr Scale Architecture

| Feature | TestRail | Zephyr Scale (for Jira) |
| :--- | :--- | :--- |
| **Hosting Model** | Standalone SaaS or Server with Jira plugin. | Native integration directly inside Jira workspace. |
| **Hierarchy** | Suite -> Section -> Subsection -> Test Cases. | Folder -> Subfolder -> Test Cases with Jira Issue Links. |
| **Reusability** | Master Suites & Baselines across projects. | Test Case versioning with cross-project reusability. |
| **Execution Logging** | Test Runs -> Test Plans -> Milestones. | Test Cycles -> Test Execution -> Defect Linking. |
| **API Automation Hook**| Mature REST API for CI/CD results ingestion. | Full REST API for JUnit, Cucumber, and PyTest results. |

---

### 3. Creating a Production Test Execution Cycle

A Test Execution Cycle bundles a curated selection of test cases assigned to QA testers for a specific release candidate.

#### Test Execution Statuses:
- **PASSED**: All verification steps satisfied expected results.
- **FAILED**: One or more verification steps deviated; bug ticket linked.
- **BLOCKED**: Environmental outage, credential failure, or preceding defect prevents test progression.
- **SKIPPED / UNEXECUTED**: Intentionally omitted based on time constraints or triage agreement.

\`\`\`
Example Test Run Dashboard:
  [==================== 82% Executed ====================]
  PASSED: 142 (71%) | FAILED: 18 (9%) | BLOCKED: 4 (2%) | UNEXECUTED: 36 (18%)
\`\`\`

---

### 4. Hands-on Lab: End-to-End Test Cycle Setup
1. Configure a mock TestRail or Zephyr project structure.
2. Import 10 test cases from a CSV file.
3. Link test cases to user stories to construct an automated RTM.
4. Execute the test run, mark step results, and automatically spawn a linked bug ticket on a failed step.`
  },
  {
    id: "CH-MNT-017",
    courseId: "CRS-MNT-001",
    title: "Non-Functional Testing: Usability, Compatibility & OS/Browser Matrices",
    order: 17,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=5x2bK3L_1U0",
    content: `# Non-Functional Testing: Usability, Compatibility & OS/Browser Matrices

### Learning Objectives
1. Define non-functional quality attributes and distinguish them from functional behavior.
2. Conduct heuristic Usability Testing using Nielsen's 10 Usability Heuristics.
3. Design and execute Cross-Browser and Cross-Platform Compatibility Matrices.
4. Utilize tools like BrowserStack and Sauce Labs for remote device testing.

---

### 1. Functional vs. Non-Functional Testing

While functional testing answers *"Does the system perform the right action?"*, non-functional testing answers *"How well does the system perform that action under real-world conditions?"*.

\`\`\`
                             +------------------------+
                             |   SOFTWARE TESTING     |
                             +-----------+------------+
                                         |
                  +----------------------+----------------------+
                  |                                             |
                  v                                             v
        +-------------------+                         +-------------------+
        |    FUNCTIONAL     |                         |  NON-FUNCTIONAL   |
        +-------------------+                         +-------------------+
        | - Unit Testing    |                         | - Usability       |
        | - Integration     |                         | - Compatibility   |
        | - System / E2E    |                         | - Accessibility   |
        | - Smoke / Sanity  |                         | - Performance     |
        | - Regression      |                         | - Security        |
        +-------------------+                         +-------------------+
\`\`\`

---

### 2. Jakob Nielsen's 10 Usability Heuristics for QA

When evaluating user interfaces, QA professionals apply Nielsen's industry-standard heuristics:

1. **Visibility of System Status**: The system should always keep users informed through appropriate feedback within reasonable time (e.g., progress bars, loading spinners).
2. **Match Between System and Real World**: Use familiar words, phrases, and concepts rather than internal database keys or cryptic error codes.
3. **User Control and Freedom**: Clear "emergency exits" such as Undo, Cancel, and Back buttons.
4. **Consistency and Standards**: Same UI terminology, icons, and layout across all views.
5. **Error Prevention**: Better to prevent errors before they occur (e.g., disable invalid submit button, confirm before destructive delete).
6. **Recognition Rather than Recall**: Minimize user memory load by making elements, actions, and options visible.
7. **Flexibility and Efficiency of Use**: Accelerators for power users (keyboard shortcuts).
8. **Aesthetic and Minimalist Design**: Dialogs should not contain irrelevant or rarely needed information.
9. **Help Users Recognize, Diagnose, and Recover from Errors**: Express errors in plain language, indicate the problem precisely, and suggest a constructive solution.
10. **Help and Documentation**: Searchable, task-focused documentation easily accessible.

---

### 3. Designing a Cross-Browser Compatibility Matrix

A compatibility matrix prioritizes testing across diverse browser engines, operating systems, and screen resolutions based on production Google Analytics traffic.

| Tier | Market Share | OS | Browser Engine | Viewport |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1 (Mandatory)** | 65% | Windows 11 / macOS | Chrome (Blink) / Safari (WebKit) | 1920x1080 / Mobile 390x844 |
| **Tier 2 (High)** | 22% | Windows 10 / iOS 17 | Edge (Blink) / Mobile Safari | 1366x768 / Mobile 412x915 |
| **Tier 3 (Medium)** | 10% | Linux / Android 14 | Firefox (Gecko) / Chrome Mobile | 1440x900 |
| **Tier 4 (Low)** | <3% | Windows 8.1 | Opera / Samsung Internet | Legacy viewports |

---

### 4. Hands-on Lab: Compatibility Audit
1. Access a responsive web portal across Chrome, Safari, and Firefox.
2. Identify CSS flexbox/grid rendering discrepancies on Safari WebKit vs. Chrome Blink.
3. Document layout breakages at breakpoint transitions (320px, 768px, 1024px, 1440px).`
  },
  {
    id: "CH-MNT-018",
    courseId: "CRS-MNT-001",
    title: "Digital Accessibility (a11y) Testing: WCAG 2.2 & Screen Readers",
    order: 18,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=cOmehxAU_4s",
    content: `# Digital Accessibility (a11y) Testing: WCAG 2.2 & Screen Readers

### Learning Objectives
1. Understand Web Content Accessibility Guidelines (WCAG 2.2) principles: POUR (Perceivable, Operable, Understandable, Robust).
2. Differentiate WCAG Conformance Levels (Level A, AA, and AAA).
3. Conduct manual keyboard-only navigation audits (focus states, tab order, trap prevention).
4. Perform screen reader testing with NVDA, JAWS, and macOS VoiceOver.
5. Validate color contrast ratios and text scaling up to 200%.

---

### 1. The POUR Principles of Accessibility

Accessibility ensures digital products can be used by everyone, including people with visual, motor, auditory, cognitive, or speech disabilities.

\`\`\`
   +---------------------------------------------------------------+
   |                      THE POUR PRINCIPLES                      |
   +---------------------------------------------------------------+
   |  [P] PERCEIVABLE    | Information & UI components must be     |
   |                     | presentable in ways users can perceive. |
   |                     | (Alt text, captions, color contrast)    |
   +---------------------+-----------------------------------------+
   |  [O] OPERABLE       | UI components and navigation must be    |
   |                     | operable. (Keyboard navigation, no traps|
   |                     | sufficient time, seizure prevention)    |
   +---------------------+-----------------------------------------+
   |  [U] UNDERSTANDABLE | Information & operation of UI must be   |
   |                     | understandable. (Readable text, clear   |
   |                     | error prompts, predictable behavior)    |
   +---------------------+-----------------------------------------+
   |  [R] ROBUST         | Content must be robust enough to be     |
   |                     | reliably interpreted by assistive tech  |
   |                     | (ARIA attributes, semantic HTML tags)   |
   +---------------------------------------------------------------+
\`\`\`

---

### 2. Manual Keyboard Navigation Audit Checklist

Never rely solely on automated accessibility scanners (like Axe or Lighthouse); they detect only ~30-40% of WCAG violations. Manual testing is vital.

- **Tab Navigation**: Can every interactive element (links, buttons, inputs, modals) be reached using the \`Tab\` and \`Shift + Tab\` keys?
- **Visible Focus Indicator**: Is there an unmistakable outline (minimum 2px with high contrast) showing which element currently has focus?
- **No Keyboard Traps**: When a user tabs into a dropdown, modal, or datepicker, can they escape back to the main document using \`Escape\` or \`Tab\`?
- **Logical Tab Order**: Does navigation flow naturally from top-to-bottom, left-to-right matching the visual layout?
- **Skip Links**: Is there a hidden "Skip to Main Content" link that appears on first tab press to bypass long navigation headers?

---

### 3. Screen Reader Testing (NVDA & VoiceOver)

| Screen Reader | Platform | Key Controls |
| :--- | :--- | :--- |
| **NVDA (NonVisual Desktop Access)** | Windows (Free, Open Source) | \`Insert + Down\` (Read all), \`H\` (Jump to next heading), \`K\` (Jump to next link), \`T\` (Jump to table). |
| **VoiceOver** | macOS / iOS (Built-in) | \`VO (Ctrl + Option) + Right/Left Arrow\` (Read item), \`VO + U\` (Open Web Rotor). |
| **JAWS** | Windows (Commercial) | Industry-standard for blind enterprise users. |

#### Critical Auditing Checkpoints:
1. **Semantic Headings**: Are headings structured hierarchically (\`<h1>\`, \`<h2>\`, \`<h3>\`) without skipping levels?
2. **Accessible Name / ARIA Labels**: Do icon buttons have accessible labels (e.g., \`<button aria-label="Close dialog">X</button>\`)?
3. **Form Controls**: Does every input have an associated \`<label for="inputId">\`? Screen readers must announce the label when the field is focused.
4. **Color Contrast**: Normal text requires a minimum contrast ratio of **4.5:1** against the background; large text (18pt+) requires **3:1** (WCAG AA).

---

### 4. Hands-on Lab: Accessibility Audit
1. Audit a sample web application using keyboard navigation alone (disconnect mouse).
2. Run NVDA or VoiceOver to navigate a multi-step checkout form.
3. Verify that validation errors are announced dynamically to assistive technology via \`aria-live="polite"\`.`
  }
];

export const phase3Assessments = [
  {
    id: "ASM-MNT-013",
    courseId: "CRS-MNT-001",
    chapterId: "CH-MNT-013",
    title: "Assessment: Defect Lifecycle & Root Cause Analysis",
    passingScore: 70,
    questions: [
      {
        id: "Q-MNT-013-01",
        text: "In the standard defect lifecycle, what state should a defect transition to after a developer has implemented and unit-tested the fix in the QA environment?",
        options: ["CLOSED", "FIXED / RESOLVED", "RETEST / VERIFY", "IN PROGRESS"],
        correctAnswer: 1,
        explanation: "When a developer finishes the code change and deploys it to the test environment, the defect moves to FIXED / RESOLVED. QA then moves it to RETEST."
      },
      {
        id: "Q-MNT-013-02",
        text: "A critical payment crash occurs only on an obsolete browser (such as Netscape Navigator) which represents 0.001% of traffic and is officially unsupported. What is the appropriate classification?",
        options: [
          "High Severity, High Priority",
          "High Severity, Low Priority",
          "Low Severity, High Priority",
          "Low Severity, Low Priority"
        ],
        correctAnswer: 1,
        explanation: "The technical impact is catastrophic (crash = High Severity), but the business urgency is negligible due to unsupported platform (Low Priority)."
      },
      {
        id: "Q-MNT-013-03",
        text: "What defect state is assigned when the Product Owner decides a bug is valid but will be fixed in a future release cycle rather than the current sprint?",
        options: ["REJECTED", "WONTFIX", "DEFERRED", "DUPLICATE"],
        correctAnswer: 2,
        explanation: "DEFERRED indicates the defect is acknowledged and valid, but postponed to a subsequent milestone or release."
      },
      {
        id: "Q-MNT-013-04",
        text: "What is Defect Removal Efficiency (DRE) primarily used to measure?",
        options: [
          "The speed at which developers fix reported bugs",
          "The percentage of total bugs caught internally before production release",
          "The total count of cosmetic bugs logged in Jira",
          "The financial cost of test case authoring"
        ],
        correctAnswer: 1,
        explanation: "DRE calculates internal defects divided by (internal + production defects) * 100, measuring how effectively testing prevents defect leakage."
      },
      {
        id: "Q-MNT-013-05",
        text: "In the '5 Whys' root cause analysis technique, what is the core objective of asking repeated 'Why' questions?",
        options: [
          "To assign individual blame to the responsible developer",
          "To drill past surface symptoms to discover the underlying systemic or procedural breakdown",
          "To extend the sprint timeline",
          "To generate 5 distinct bug reports in Jira"
        ],
        correctAnswer: 1,
        explanation: "The 5 Whys technique drives past superficial symptoms to uncover systemic root causes that caused the failure."
      },
      {
        id: "Q-MNT-013-06",
        text: "If a module contains 40 defects across 5,000 lines of code (5 KLOC), what is its Defect Density?",
        options: ["8 defects per KLOC", "200 defects per KLOC", "0.125 defects per KLOC", "12.5 defects per KLOC"],
        correctAnswer: 0,
        explanation: "Defect Density = Total Defects / KLOC = 40 / 5 = 8 defects per KLOC."
      },
      {
        id: "Q-MNT-013-07",
        text: "What happens when QA retests a bug in the RETEST state and finds the exact same failure persists?",
        options: ["The bug is moved to CLOSED", "The bug is moved to REOPENED", "The bug is moved to DEFERRED", "The bug is marked as DUPLICATE"],
        correctAnswer: 1,
        explanation: "When a retest fails to confirm the fix, the ticket transitions to REOPENED with updated logs and evidence."
      },
      {
        id: "Q-MNT-013-08",
        text: "The CEO notices the company's trademarked name is misspelled as 'Googel' in the main header of the public landing page. How should this bug be triaged?",
        options: [
          "Low Severity, Low Priority",
          "Low Severity, High Priority",
          "High Severity, Low Priority",
          "Critical Severity, Critical Priority"
        ],
        correctAnswer: 1,
        explanation: "A typo has no functional impact on application code (Low Severity), but poses extreme public brand and executive embarrassment (High Priority)."
      },
      {
        id: "Q-MNT-013-09",
        text: "What is an Ishikawa (Fishbone) diagram used for in defect triage and post-mortems?",
        options: [
          "Displaying sprint velocity over time",
          "Categorizing potential contributing causes of a failure into People, Process, Machine, and Environment",
          "Automating regression test execution",
          "Estimating story points for planning poker"
        ],
        correctAnswer: 1,
        explanation: "Ishikawa/Fishbone diagrams group potential root causes into structured categories like People, Methods, Materials, and Measurements."
      },
      {
        id: "Q-MNT-013-10",
        text: "Who typically participates in a daily or weekly Defect Triage Meeting?",
        options: [
          "Only junior QA interns",
          "QA Lead, Development Lead, and Product Owner / Business Analyst",
          "Only end users and customer support staff",
          "External compliance auditors only"
        ],
        correctAnswer: 1,
        explanation: "Triage requires cross-functional alignment between QA (severity/steps), Dev (feasibility/risk), and Product (business priority)."
      }
    ]
  },
  {
    id: "ASM-MNT-014",
    courseId: "CRS-MNT-001",
    chapterId: "CH-MNT-014",
    title: "Assessment: Defect Reporting Mastery",
    passingScore: 70,
    questions: [
      {
        id: "Q-MNT-014-01",
        text: "Which of the following is considered the most critical component of a defect report for enabling rapid debugging?",
        options: [
          "The tester's personal opinion of the developer's work",
          "Deterministic, step-by-step Steps to Reproduce (STR)",
          "A vague description like 'the screen crashes sometimes'",
          "The color theme of the tester's operating system"
        ],
        correctAnswer: 1,
        explanation: "Deterministic steps to reproduce allow the developer to recreate the defect in their local debug environment immediately."
      },
      {
        id: "Q-MNT-014-02",
        text: "What does an HTTP Archive (HAR) file contain when exported from browser developer tools?",
        options: [
          "The tester's entire web browsing history over the past year",
          "A JSON record of all HTTP requests, responses, headers, timing, and payloads captured during the session",
          "The compiled machine code of the browser engine",
          "The developer's git commit logs"
        ],
        correctAnswer: 1,
        explanation: "HAR files record complete network telemetry, including status codes, request/response headers, timings, and JSON payloads."
      },
      {
        id: "Q-MNT-014-03",
        text: "Before attaching a HAR file or network log to a public Jira ticket, what vital security step must a QA engineer perform?",
        options: [
          "Sanitize sensitive tokens, passwords, and PII from headers and bodies",
          "Encrypt the file with a proprietary password and delete the key",
          "Convert the HAR file into an MP4 video",
          "Change all HTTP status codes to 200"
        ],
        correctAnswer: 0,
        explanation: "HAR files frequently contain sensitive cookies, Bearer tokens, or passwords, which must be sanitized before sharing."
      },
      {
        id: "Q-MNT-014-04",
        text: "Which bug title conforms best to professional QA standards?",
        options: [
          "Broken cart",
          "[Cart] Total price displays $0.00 when item quantity is incremented past 9 on iOS Safari",
          "Ugh, checkout fails again please fix quickly",
          "JavaScript error on website"
        ],
        correctAnswer: 1,
        explanation: "A professional title includes the module tag, specific failure symptom, trigger condition, and environmental constraint."
      },
      {
        id: "Q-MNT-014-05",
        text: "Why should a QA engineer record video or animated GIF evidence for complex UI defects?",
        options: [
          "To increase Jira storage costs",
          "To provide undeniable visual proof of timing issues, animations, and intermittent glitches",
          "To avoid writing any text in the bug ticket",
          "Because developers cannot read English"
        ],
        correctAnswer: 1,
        explanation: "Video evidence captures transient UI states, animations, race conditions, and exact mouse gestures that are difficult to convey in text."
      },
      {
        id: "Q-MNT-014-06",
        text: "What is an 'Environment' field in a bug report used to capture?",
        options: [
          "The weather outside the testing office",
          "The exact OS version, browser version, client build commit SHA, and test backend environment (Staging/UAT)",
          "The developer's IDE preferences",
          "The company's carbon footprint"
        ],
        correctAnswer: 1,
        explanation: "Environment details ensure developers attempt reproduction on the identical software, hardware, and backend deployment."
      },
      {
        id: "Q-MNT-014-07",
        text: "What is the difference between 'Expected Result' and 'Actual Result'?",
        options: [
          "Expected Result is what the specifications dictate; Actual Result is what the system currently exhibits",
          "Actual Result is what the customer wants; Expected Result is what the developer created",
          "They are synonymous and can be used interchangeably",
          "Expected Result is recorded only if the test passes"
        ],
        correctAnswer: 0,
        explanation: "Expected Result comes from requirements/specifications; Actual Result documents the observed faulty behavior."
      },
      {
        id: "Q-MNT-014-08",
        text: "If a defect occurs intermittently (e.g., 2 times out of 10 attempts), how should this be documented in the bug report?",
        options: [
          "Do not log the bug until it reaches 100% reproducibility",
          "Explicitly document the reproducibility rate (e.g., 'Reproducibility: ~20% (2/10)') and describe variations in timing or state",
          "Log 10 separate bug tickets",
          "Blame the network provider in the comments"
        ],
        correctAnswer: 1,
        explanation: "Intermittent bugs must be documented with their exact reproduction frequency and potential contributing factors like race conditions."
      },
      {
        id: "Q-MNT-014-09",
        text: "What role does a 'Preconditions' section play in a bug report?",
        options: [
          "It lists prerequisites that must be true before beginning Step 1 (e.g., user role, account balance, feature flags)",
          "It lists the tester's university qualifications",
          "It describes how to deploy the server",
          "It defines the developer's compensation"
        ],
        correctAnswer: 0,
        explanation: "Preconditions set the baseline state required before the reproduction steps can be executed."
      },
      {
        id: "Q-MNT-014-10",
        text: "When a developer responds with 'Cannot Reproduce' (WNF), what should the QA engineer do next?",
        options: [
          "Immediately close the ticket and apologize",
          "Attempt reproduction together in a live pairing session or provide additional environment logs and HAR traces",
          "Delete the test case from the repository",
          "Escalate immediately to the CEO"
        ],
        correctAnswer: 1,
        explanation: "A professional QA engineer collaborates with the developer, pairing live or providing deeper diagnostic artifacts."
      }
    ]
  },
  {
    id: "ASM-MNT-015",
    courseId: "CRS-MNT-001",
    chapterId: "CH-MNT-015",
    title: "Assessment: Test Execution Cycles",
    passingScore: 70,
    questions: [
      {
        id: "Q-MNT-015-01",
        text: "What is the primary objective of a Smoke Test?",
        options: [
          "To test every single edge case and negative scenario in the application",
          "To quickly verify whether the core critical paths of the build are stable enough to accept for detailed testing",
          "To perform load testing up to 100,000 concurrent users",
          "To inspect the source code formatting"
        ],
        correctAnswer: 1,
        explanation: "Smoke tests act as a build acceptance gate, verifying critical user paths before deeper testing commences."
      },
      {
        id: "Q-MNT-015-02",
        text: "What immediate action should QA take if a new build fails its Smoke Test?",
        options: [
          "Continue testing other modules anyway",
          "Reject the build immediately and notify engineering, blocking further testing until a stable build is delivered",
          "Modify the test cases so that the build passes",
          "Wait 3 days without reporting"
        ],
        correctAnswer: 1,
        explanation: "If smoke tests fail, the build is rejected to prevent QA from wasting time on an unstable environment."
      },
      {
        id: "Q-MNT-015-03",
        text: "How does Sanity Testing differ from Smoke Testing?",
        options: [
          "Sanity testing is narrow and deep, focusing specifically on the module modified by a bug fix",
          "Smoke testing is only performed in production",
          "Sanity testing is completely automated while smoke testing is always manual",
          "There is no difference between the two terms"
        ],
        correctAnswer: 0,
        explanation: "Sanity testing verifies that a specific bug fix or minor release works properly and did not immediately break adjacent functionality."
      },
      {
        id: "Q-MNT-015-04",
        text: "What is the definition of Retesting?",
        options: [
          "Testing an entire application from scratch every single sprint",
          "Executing specific test cases that previously failed to verify that the defect has been successfully resolved",
          "Testing performance under heavy network throttling",
          "Running tests in multiple foreign languages"
        ],
        correctAnswer: 1,
        explanation: "Retesting is targeted execution of the exact test cases that failed, verifying that the reported defect is resolved."
      },
      {
        id: "Q-MNT-015-05",
        text: "Why is Regression Testing necessary after a bug fix is deployed?",
        options: [
          "Because developers always introduce syntax errors",
          "To verify that the code change did not inadvertently break existing, previously working features in other parts of the system",
          "To test whether the computer hardware is overheating",
          "To re-estimate the project budget"
        ],
        correctAnswer: 1,
        explanation: "Code modifications often produce unintended ripple effects; regression testing ensures untouched features remain intact."
      },
      {
        id: "Q-MNT-015-06",
        text: "In a time-constrained release cycle where running 1,000 regression tests is impossible, which strategy should QA adopt?",
        options: [
          "Skip regression testing completely and deploy directly",
          "Perform Impact-Based and Risk-Based selective regression targeting modified modules and high-priority business flows",
          "Run only tests that start with the letter 'A'",
          "Test only the login screen"
        ],
        correctAnswer: 1,
        explanation: "Risk-based and impact-based regression focuses execution on areas affected by recent code changes and high-business-value paths."
      },
      {
        id: "Q-MNT-015-07",
        text: "What is 'Build Acceptance Testing' (BAT) synonymous with?",
        options: ["Stress Testing", "Smoke Testing", "Usability Testing", "Accessibility Testing"],
        correctAnswer: 1,
        explanation: "Build Acceptance Testing is another common industry term for Smoke Testing."
      },
      {
        id: "Q-MNT-015-08",
        text: "When during the SDLC is Regression Testing typically executed?",
        options: [
          "Only once before writing any code",
          "Continuously throughout the sprint following code changes, and extensively during release hardening before production deployment",
          "Only after customers report critical production outages",
          "During the initial requirement gathering phase"
        ],
        correctAnswer: 1,
        explanation: "Regression testing runs iteratively as new code is integrated and during release candidate hardening."
      },
      {
        id: "Q-MNT-015-09",
        text: "What is a 'Regression Bug'?",
        options: [
          "A bug that was fixed in the past but has reappeared due to a recent code merge or configuration mistake",
          "A bug in the automated testing framework itself",
          "A defect caused by outdated hardware",
          "A defect logged by an automated security scanner"
        ],
        correctAnswer: 0,
        explanation: "A regression bug is a defect where functionality that used to work properly stops working due to subsequent modifications."
      },
      {
        id: "Q-MNT-015-10",
        text: "What document or checklist is finalized by QA at the end of a successful test execution cycle?",
        options: [
          "Employee payroll ledger",
          "QA Release Sign-Off Report / Test Summary Report",
          "Software architecture blueprint",
          "Marketing product launch deck"
        ],
        correctAnswer: 1,
        explanation: "The QA Sign-Off / Test Summary Report summarizes test execution metrics, known issues, and formal deployment approval."
      }
    ]
  },
  {
    id: "ASM-MNT-016",
    courseId: "CRS-MNT-001",
    chapterId: "CH-MNT-016",
    title: "Assessment: Test Management Tools",
    passingScore: 70,
    questions: [
      {
        id: "Q-MNT-016-01",
        text: "In TestRail, what is the hierarchical relationship between Suites, Sections, and Test Cases?",
        options: [
          "Test Cases contain Sections which contain Suites",
          "A Test Suite contains Sections (folders), which contain individual Test Cases",
          "Milestones contain Test Cases directly without sections",
          "There is no hierarchy in TestRail"
        ],
        correctAnswer: 1,
        explanation: "TestRail organizes test repositories hierarchically into Suites, Sections (and Subsections), and individual Test Cases."
      },
      {
        id: "Q-MNT-016-02",
        text: "What is a 'Test Run' in test management systems like TestRail and Zephyr?",
        options: [
          "A physical sprint around the company building",
          "A specific execution instance of selected test cases assigned to testers for a designated milestone or build",
          "A script that deletes the database",
          "The process of creating Jira user stories"
        ],
        correctAnswer: 1,
        explanation: "A Test Run (or Test Execution Cycle) is a snapshot of test cases instantiated to record live execution results."
      },
      {
        id: "Q-MNT-016-03",
        text: "What status should a QA tester assign to a test case in a Test Run if an environment crash prevents them from performing Step 2?",
        options: ["PASSED", "FAILED", "BLOCKED", "REOPENED"],
        correctAnswer: 2,
        explanation: "BLOCKED indicates that external factors (e.g., environment outage, missing dependency) prevent the test from being executed."
      },
      {
        id: "Q-MNT-016-04",
        text: "How does Zephyr Scale integrate with Atlassian Jira?",
        options: [
          "It replaces Jira completely with an external wiki",
          "It operates natively inside Jira, allowing test cases to be linked directly to Jira epics, user stories, and bug tickets",
          "It converts Jira tickets into Microsoft Word documents",
          "It only works with Git command-line tools"
        ],
        correctAnswer: 1,
        explanation: "Zephyr Scale is an Atlassian app residing directly inside Jira, providing seamless linking between stories, tests, and defects."
      },
      {
        id: "Q-MNT-016-05",
        text: "What is bidirectional traceability in a test management tool?",
        options: [
          "The ability to trace forward from requirements to test cases and bugs, and backward from bugs to test cases and requirements",
          "The ability to translate test cases into two spoken languages",
          "Running tests both forwards and in reverse order",
          "Connecting two database servers simultaneously"
        ],
        correctAnswer: 0,
        explanation: "Bidirectional traceability ensures complete visibility across the development chain in both forward and backward directions."
      },
      {
        id: "Q-MNT-016-06",
        text: "In TestRail, what is a 'Milestone' typically mapped to?",
        options: [
          "A major software release, sprint, or version target (e.g., v2.4.0 Release)",
          "An individual employee's birthday",
          "A single line of source code",
          "A customer payment receipt"
        ],
        correctAnswer: 0,
        explanation: "Milestones in TestRail group test plans, runs, and results toward a targeted release milestone or product delivery."
      },
      {
        id: "Q-MNT-016-07",
        text: "When a test step fails during execution in Zephyr, what is the best practice for defect linkage?",
        options: [
          "Email the developer directly without logging anything",
          "Click 'Create Issue / Link Defect' directly from the failed test step so the bug is automatically associated with the execution context",
          "Delete the failed test step",
          "Mark the overall test case as PASSED anyway"
        ],
        correctAnswer: 1,
        explanation: "Linking the defect directly from the failed execution ensures full traceability and preserves the execution context."
      },
      {
        id: "Q-MNT-016-08",
        text: "What capability allows automated testing frameworks (like Cypress or Playwright) to update TestRail results automatically?",
        options: [
          "TestRail REST API endpoints (e.g., add_result_for_case)",
          "Manual copy-pasting of test output",
          "Sending physical mail to TestRail headquarters",
          "Bluetooth pairing"
        ],
        correctAnswer: 0,
        explanation: "Test management tools provide REST APIs that CI/CD pipelines call to automatically publish automated test run outcomes."
      },
      {
        id: "Q-MNT-016-09",
        text: "What is a 'Test Plan' in TestRail?",
        options: [
          "A collection of multiple Test Runs grouped together, often across different test configurations (e.g., across Chrome, Firefox, iOS)",
          "A word processor document describing team salaries",
          "A user story written by the Product Owner",
          "A network router configuration"
        ],
        correctAnswer: 0,
        explanation: "A Test Plan in TestRail aggregates multiple test runs and test configurations under a unified tracking container."
      },
      {
        id: "Q-MNT-016-10",
        text: "Why is versioning of test cases in test management tools important?",
        options: [
          "To allow historical audits of how test criteria evolved across releases as software requirements changed",
          "To force testers to rewrite tests every week",
          "To encrypt test documentation",
          "To prevent developers from seeing test steps"
        ],
        correctAnswer: 0,
        explanation: "Test case versioning ensures teams can audit what verification criteria were executed for legacy releases vs. current releases."
      }
    ]
  },
  {
    id: "ASM-MNT-017",
    courseId: "CRS-MNT-001",
    chapterId: "CH-MNT-017",
    title: "Assessment: Non-Functional Testing",
    passingScore: 70,
    questions: [
      {
        id: "Q-MNT-017-01",
        text: "What core question does Non-Functional Testing answer?",
        options: [
          "Does the software produce the mathematically expected output for valid inputs?",
          "How well, reliably, securely, and efficiently does the system perform its functions?",
          "What is the total price of the software license?",
          "How many employees are working on the project?"
        ],
        correctAnswer: 1,
        explanation: "Non-functional testing evaluates operational attributes such as performance, usability, compatibility, and reliability."
      },
      {
        id: "Q-MNT-017-02",
        text: "According to Nielsen's heuristic 'Visibility of System Status', what should a web app display when processing a 5-second payment?",
        options: [
          "A frozen white screen with no response",
          "An animated progress spinner or status message indicating payment processing is underway",
          "An immediate error message telling the user to restart",
          "A link to the developer's LinkedIn profile"
        ],
        correctAnswer: 1,
        explanation: "Visibility of system status requires timely, informative feedback so users understand the system is working on their request."
      },
      {
        id: "Q-MNT-017-03",
        text: "Which browser rendering engine powers Apple Safari on macOS and iOS?",
        options: ["Blink", "Gecko", "WebKit", "Trident"],
        correctAnswer: 2,
        explanation: "Safari is powered by Apple's open-source WebKit rendering engine."
      },
      {
        id: "Q-MNT-017-04",
        text: "What browser engine powers Google Chrome, Microsoft Edge, and Opera?",
        options: ["Gecko", "Blink", "WebKit", "Presto"],
        correctAnswer: 1,
        explanation: "Google Chrome, Microsoft Edge, Opera, and Brave are built on Google's Chromium project using the Blink engine."
      },
      {
        id: "Q-MNT-017-05",
        text: "When conducting Usability Testing, what does the heuristic 'Error Prevention' advocate?",
        options: [
          "Designing interfaces so user slips and errors are prevented in advance (e.g., confirmation dialogs, intelligent defaults)",
          "Hiding all error messages so users never feel stressed",
          "Removing all input fields from the application",
          "Ignoring invalid inputs silently"
        ],
        correctAnswer: 0,
        explanation: "Error prevention prioritizes thoughtful UI constraints and confirmation safeguards over simply displaying error messages after the fact."
      },
      {
        id: "Q-MNT-017-06",
        text: "Why must Cross-Browser Compatibility testing be conducted even when web apps are built with modern frameworks like React?",
        options: [
          "Different browser engines (Blink, WebKit, Gecko) have subtle differences in CSS layout rendering, JS engine quirks, and API support",
          "Because React only works on Google Chrome",
          "Because browsers rewrite the backend database queries",
          "Because JavaScript is disabled on all mobile browsers"
        ],
        correctAnswer: 0,
        explanation: "Engines render CSS, handle DOM events, and support experimental Web APIs differently, necessitating cross-browser verification."
      },
      {
        id: "Q-MNT-017-07",
        text: "What cloud platforms allow QA testers to manually interact with thousands of real physical devices and desktop browser configurations remotely?",
        options: [
          "BrowserStack and Sauce Labs",
          "Microsoft Word and Excel",
          "Docker and Kubernetes",
          "Notepad++ and Sublime"
        ],
        correctAnswer: 0,
        explanation: "BrowserStack and Sauce Labs provide real device clouds enabling QA to test across real hardware and OS versions via browser streaming."
      },
      {
        id: "Q-MNT-017-08",
        text: "What does Responsive Design testing specifically evaluate?",
        options: [
          "Whether the backend responds in under 10 milliseconds",
          "Whether UI layouts, images, typography, and controls fluidly adapt across diverse screen resolutions and aspect ratios",
          "Whether the customer support team responds quickly to chat tickets",
          "Whether the database server has enough RAM"
        ],
        correctAnswer: 1,
        explanation: "Responsive testing ensures web interfaces dynamically adapt to phone, tablet, laptop, and ultra-wide monitor viewports."
      },
      {
        id: "Q-MNT-017-09",
        text: "In Nielsen's heuristics, what does 'Recognition Rather than Recall' mean for UI design?",
        options: [
          "Users should not have to remember information from one part of the interface to another; options and actions should be visible",
          "Users must memorize 10-character product codes to place orders",
          "The system should require facial recognition to access every page",
          "Users must pass a memory quiz before checkout"
        ],
        correctAnswer: 0,
        explanation: "Minimizing cognitive load by keeping options, navigation cues, and instructions visible rather than forcing user recall."
      },
      {
        id: "Q-MNT-017-10",
        text: "How should a QA team determine which browsers and devices to include in their Compatibility Matrix?",
        options: [
          "By surveying the personal smartphones owned by the QA team",
          "By analyzing actual production user traffic data from web analytics (e.g., Google Analytics, Mixpanel)",
          "By choosing only the newest iPhone model",
          "By selecting the oldest devices available on eBay"
        ],
        correctAnswer: 1,
        explanation: "Real user demographics from production analytics determine the priority tiers in a cross-platform compatibility matrix."
      }
    ]
  },
  {
    id: "ASM-MNT-018",
    courseId: "CRS-MNT-001",
    chapterId: "CH-MNT-018",
    title: "Assessment: Digital Accessibility (a11y) Testing",
    passingScore: 70,
    questions: [
      {
        id: "Q-MNT-018-01",
        text: "What are the four foundational principles of WCAG accessibility guidelines represented by the acronym POUR?",
        options: [
          "Predictable, Open, Usable, Resilient",
          "Perceivable, Operable, Understandable, Robust",
          "Persistent, Online, Universal, Responsive",
          "Performant, Optimal, Unified, Reliable"
        ],
        correctAnswer: 1,
        explanation: "WCAG is structured upon four core principles: Perceivable, Operable, Understandable, and Robust."
      },
      {
        id: "Q-MNT-018-02",
        text: "What is the minimum WCAG 2.2 AA color contrast ratio required for standard body text against its background?",
        options: ["2:1", "3:1", "4.5:1", "7:1"],
        correctAnswer: 2,
        explanation: "WCAG Level AA requires a minimum contrast ratio of 4.5:1 for regular text and 3:1 for large text (18pt+ or 14pt bold)."
      },
      {
        id: "Q-MNT-018-03",
        text: "What severe usability failure occurs when a user tabs into a UI component (such as a modal) with the keyboard and cannot tab out or escape?",
        options: ["Buffer overflow", "Keyboard trap", "Race condition", "Memory leak"],
        correctAnswer: 1,
        explanation: "A keyboard trap occurs when keyboard focus becomes locked inside a component with no way to exit via standard keys."
      },
      {
        id: "Q-MNT-018-04",
        text: "What is the purpose of an 'alt' attribute on an \`<img>\` HTML tag?",
        options: [
          "It defines alternate server URLs for image caching",
          "It provides a text equivalent of the image for screen reader users and displays if the image fails to load",
          "It controls image rotation animations",
          "It alters the image compression ratio"
        ],
        correctAnswer: 1,
        explanation: "The alt attribute provides a text description read by screen readers to visually impaired users."
      },
      {
        id: "Q-MNT-018-05",
        text: "Which free, open-source screen reader is widely used on the Windows operating system for accessibility testing?",
        options: ["NVDA", "VoiceOver", "TalkBack", "Siri"],
        correctAnswer: 0,
        explanation: "NVDA (NonVisual Desktop Access) is the primary free open-source screen reader for Windows."
      },
      {
        id: "Q-MNT-018-06",
        text: "Why is automated accessibility testing (e.g., using axe-core or Lighthouse) insufficient on its own?",
        options: [
          "Because automated tools cannot run in CI/CD",
          "Because automated scanners detect only ~30-40% of WCAG violations and cannot verify semantic context or keyboard UX",
          "Because automated tools only work on mobile devices",
          "Because WCAG forbids the use of automated software"
        ],
        correctAnswer: 1,
        explanation: "Automated tools cannot evaluate cognitive readability, meaningful alt text quality, or complex interactive keyboard workflows."
      },
      {
        id: "Q-MNT-018-07",
        text: "What ARIA attribute should be added to an alert or live notification banner so screen readers announce it immediately when it appears?",
        options: [
          "aria-live='assertive' or aria-live='polite'",
          "aria-hidden='true'",
          "aria-disabled='true'",
          "aria-expanded='false'"
        ],
        correctAnswer: 0,
        explanation: "aria-live tells assistive tech to announce dynamic DOM updates without requiring the user to navigate to the element."
      },
      {
        id: "Q-MNT-018-08",
        text: "What happens if a decorative image that conveys no informative meaning has \`alt=\"\" \` (empty alt attribute)?",
        options: [
          "Screen readers skip over the image completely, avoiding unnecessary noise for the user",
          "The browser crashes immediately",
          "The screen reader reads the full image file URL path",
          "The page fails to render"
        ],
        correctAnswer: 0,
        explanation: "An empty alt attribute (\`alt=\"\"\`) marks the image as decorative, instructing screen readers to ignore it safely."
      },
      {
        id: "Q-MNT-018-09",
        text: "What is a 'Skip Navigation' link on accessible websites?",
        options: [
          "A link allowing keyboard and screen reader users to bypass repetitive top navigation bars and jump directly to main content",
          "A button that skips video advertisements",
          "A shortcut that closes the browser window",
          "A button to skip payment during checkout"
        ],
        correctAnswer: 0,
        explanation: "Skip navigation links allow screen reader and keyboard users to bypass long header menus directly to primary content."
      },
      {
        id: "Q-MNT-018-10",
        text: "What standard conformance level do international laws (such as ADA Title III, Section 508, and European EN 301 549) typically mandate for public websites?",
        options: ["WCAG Level A", "WCAG Level AA", "WCAG Level AAA", "No standards apply to websites"],
        correctAnswer: 1,
        explanation: "WCAG 2.1 / 2.2 Level AA is the universally accepted legal and compliance benchmark for digital accessibility worldwide."
      }
    ]
  }
];

export const phase3 = { chapters: phase3Chapters, assessments: phase3Assessments };
