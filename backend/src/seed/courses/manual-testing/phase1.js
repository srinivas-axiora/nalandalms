// Phase 1: Foundations of Quality Assurance & Testing Principles (Chapters 1 to 6) - Manual Testing
// World-class curriculum: Zero to employable master.

export const phase1 = {
  chapters: [
    // ── Chapter 1 ──
    {
      id: "CH-MNT-001",
      courseId: "CRS-MNT-001",
      sequence: 1,
      title: "Software Quality Fundamentals: Cost of Quality & The 7 Testing Principles",
      description: "Quality Control (QC) vs Quality Assurance (QA), Cost of Quality (CoQ) prevention vs appraisal vs failure, the 7 fundamental principles of testing (ISTQB), and defect psychology.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: QA Foundations • Chapter 1</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Software Quality Fundamentals & The 7 Testing Principles</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Software bugs cause catastrophic financial loss and reputational ruin—from the Therac-25 radiation disasters to the Knight Capital \$440M algorithmic trading glitch. Quality is not an afterthought; it is a discipline. In this chapter, we master the distinction between Quality Assurance and Quality Control, analyze the Cost of Quality, and internalize the 7 universal principles of testing.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/vOz_S5o9D-c" title="7 Principles of Software Testing ISTQB" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Quality Assurance (QA) vs Quality Control (QC) vs Testing</h2>
  <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
    <thead>
      <tr style="background:#f1f5f9;text-align:left;">
        <th style="padding:12px;border:1px solid #cbd5e1;">Dimension</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Quality Assurance (QA)</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Quality Control (QC)</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Testing</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Focus</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Process-oriented</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Product-oriented</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Activity / Execution-oriented</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Objective</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Prevent defects from being introduced into artifacts</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Identify defects in completed intermediate deliverables</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Execute software with specific intent to find deviations</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Nature</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Proactive managerial strategy</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Reactive operational inspection</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Verification and validation execution</td>
      </tr>
    </tbody>
  </table>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. The Cost of Quality (CoQ) & The 10x Defect Cost Rule</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">According to Boehm's empirical defect cost curve, the financial expense required to remediate a software defect amplifies by approximately <strong>10x at each subsequent phase</strong> of the lifecycle:</p>
  <div style="background:#f8fafc;border-left:4px solid #0284c7;padding:16px;margin:20px 0;font-size:14px;color:#1e293b;line-height:1.8;">
    $$\\text{Requirements Phase: } \\$100 \\longrightarrow \\text{Coding Phase: } \\$1,000 \\longrightarrow \\text{QA Testing: } \\$10,000 \\longrightarrow \\text{Production Release: } \\$100,000+$$
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">3. The 7 Fundamental ISTQB Testing Principles</h2>
  <ol style="font-size:14px;color:#334155;line-height:1.8;padding-left:20px;">
    <li><strong>Testing shows the presence of defects, not their absence:</strong> Testing can prove defects exist, but can never prove zero defects remain.</li>
    <li><strong>Exhaustive testing is impossible:</strong> Testing all input combinations and preconditions is mathematically infeasible. Use risk analysis and test design techniques.</li>
    <li><strong>Early testing saves time and money:</strong> Static testing should begin as early as the requirements drafting stage ("Shift-Left").</li>
    <li><strong>Defects cluster together (Pareto 80/20 Rule):</strong> ~80% of all software defects are found in ~20% of complex modules.</li>
    <li><strong>Beware of the Pesticide Paradox:</strong> Repeating identical test cases eventually fails to uncover new defects; test suites must be continuously revised.</li>
    <li><strong>Testing is context dependent:</strong> Testing an e-commerce website is fundamentally different from validating flight control avionics.</li>
    <li><strong>Absence-of-errors is a fallacy:</strong> Fixing 100% of bugs is useless if the system does not fulfill real user needs or business goals.</li>
  </ol>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Quality Assurance builds defect-prevention processes; Quality Control inspects products; Testing executes software to detect defects.</li>
      <li>Catching defects in requirements saves up to 100x the cost of patching them in production.</li>
      <li>Understand the 7 testing principles to communicate testing trade-offs clearly with engineering directors and product managers.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 2 ──
    {
      id: "CH-MNT-002",
      courseId: "CRS-MNT-001",
      sequence: 2,
      title: "SDLC vs STLC: V-Model, Agile Scrum & Shift-Left Testing",
      description: "Software Development Life Cycle vs Software Testing Life Cycle, V-Model verification-validation pairs, Agile sprint ceremonies, and Shift-Left test strategy.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: QA Foundations • Chapter 2</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">SDLC vs STLC: V-Model, Agile Scrum & Shift-Left</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Testing is not a single isolated phase occurring at the end of development. Professional QA operates within a structured lifecycle—the Software Testing Life Cycle (STLC)—that runs in lockstep with the broader Software Development Life Cycle (SDLC).</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/hB8N9z2Xm3g" title="STLC Phases Explained" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The 6 Phases of the STLC</h2>
  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin:20px 0;">
    <ol style="margin-bottom:0;padding-left:20px;font-size:14px;color:#334155;line-height:1.8;">
      <li><strong>Requirement Analysis:</strong> Identify testable requirements, clarify ambiguities with BAs, and prepare the RTM.</li>
      <li><strong>Test Planning:</strong> Determine scope, resource allocation, tool selection, risk assessment, and generate the Test Plan document.</li>
      <li><strong>Test Case Development:</strong> Author detailed test cases, test scenarios, and prepare test data.</li>
      <li><strong>Test Environment Setup:</strong> Configure hardware, databases, test accounts, and verify readiness with smoke tests.</li>
      <li><strong>Test Execution:</strong> Execute test cases, log actual results, file defect reports, and verify bug fixes.</li>
      <li><strong>Test Cycle Closure:</strong> Analyze defect metrics, evaluate exit criteria, compile Test Summary Report, and conduct retrospectives.</li>
    </ol>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. The V-Model: Dual-Sided Verification & Validation</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">The V-Model explicitly couples every development artifact on the left with a corresponding test level on the right:</p>
  <ul style="font-size:14px;color:#475569;line-height:1.8;">
    <li><strong>Business Requirements</strong> \\(\\longleftrightarrow\\) <strong>User Acceptance Testing (UAT)</strong></li>
    <li><strong>System Specifications</strong> \\(\\longleftrightarrow\\) <strong>System Testing (End-to-End)</strong></li>
    <li><strong>Architectural High-Level Design</strong> \\(\\longleftrightarrow\\) <strong>Integration Testing (API / Interface)</strong></li>
    <li><strong>Module Low-Level Design</strong> \\(\\longleftrightarrow\\) <strong>Unit Testing (Component)</strong></li>
  </ul>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>STLC proceeds through 6 structured phases: Analysis, Planning, Authoring, Environment, Execution, and Closure.</li>
      <li><strong>Shift-Left Testing</strong> pulls testing activities into the earliest development phases to catch defects before code is written.</li>
      <li>In Agile Scrum, QA is embedded directly in sprint rituals: planning, daily standup, refinement, and retrospective.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 3 ──
    {
      id: "CH-MNT-003",
      courseId: "CRS-MNT-001",
      sequence: 3,
      title: "Verification vs Validation: Static Testing & Code Reviews",
      description: "Static testing vs dynamic testing, formal inspections (Fagan inspection), structured walkthroughs, peer reviews, technical reviews, and defect prevention checklists.",
      contentType: "Rich Text",
      durationMinutes: 45,
      minimumTimeMinutes: 20,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: QA Foundations • Chapter 3</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Verification vs Validation & Static Testing</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Up to 60% of all software defects originate during requirements and design. Dynamic testing requires running compiled software, meaning defects cannot be caught until late in the lifecycle. Static testing evaluates work products—requirements, diagrams, source code—without executing them.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/Pj13pZknQJc" title="Verification vs Validation Explained" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Verification vs Validation Demystified (Boehm Taxonomy)</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:20px 0;">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#0284c7;margin-top:0;">Verification ("Are we building the product right?")</h3>
      <p style="font-size:14px;color:#475569;">Evaluates whether intermediate work products comply with conditions imposed at the start of that development phase. Static in nature: inspections, walkthroughs, reviews, desk checks.</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#10b981;margin-top:0;">Validation ("Are we building the right product?")</h3>
      <p style="font-size:14px;color:#475569;">Evaluates whether the completed, executable software satisfies genuine user needs, operational context, and business requirements. Dynamic in nature: executing test cases on running systems.</p>
    </div>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Static Review Taxonomy: Informal to Fagan Inspection</h2>
  <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
    <thead>
      <tr style="background:#f1f5f9;text-align:left;">
        <th style="padding:12px;border:1px solid #cbd5e1;">Review Type</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Formality</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Leader</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Primary Goal</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Informal Review</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Very Low</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Author</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Quick peer feedback, buddy checking, pair programming</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Walkthrough</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Medium</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Author</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Educating team on feature design, gathering consensus</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Technical Review</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Medium-High</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Trained Moderator</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Evaluating technical compliance, architectural consistency</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Formal Inspection</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Highest (Strict)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Independent Moderator</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Defect logging based on checklists, metrics capture (Fagan process)</td>
      </tr>
    </tbody>
  </table>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Static testing finds the causes of defects directly (e.g. logic flaws, typos), whereas dynamic testing reveals failures.</li>
      <li>Formal inspections require defined roles: Author, Moderator, Reader, Reviewer/Inspector, and Scribe.</li>
      <li>Conducting requirement ambiguity reviews before development starts eliminates more bugs than thousands of hours of testing.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 4 ──
    {
      id: "CH-MNT-004",
      courseId: "CRS-MNT-001",
      sequence: 4,
      title: "Requirements Analysis, Ambiguity Reviews & The RTM",
      description: "Functional vs non-functional requirements, identifying ambiguous specifications, INVEST criteria for user stories, and constructing a bidirectional Requirement Traceability Matrix (RTM).",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: QA Foundations • Chapter 4</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Requirements Analysis, Ambiguity Reviews & The RTM</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">A test is only as good as the requirements it verifies. Vague, unquantifiable words like "user-friendly", "fast", or "secure" lead to differing assumptions between engineers, testers, and product managers. We master requirement sanitization and bidirectional traceability.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/PjE5FqP0kdc" title="Requirements Traceability Matrix RTM" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Ambiguity Smells & Quantifiable Rewriting</h2>
  <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
    <thead>
      <tr style="background:#f1f5f9;text-align:left;">
        <th style="padding:12px;border:1px solid #cbd5e1;">Ambiguous Requirement</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Defect / Risk</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Quantifiable & Testable Requirement</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;">"System must respond quickly to customer searches."</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Untestable; subjective definition of 'quickly'.</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">"Under 500 concurrent users, 95% of search queries must return results in \\(\\le 1.2\\) seconds."</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;">"Passwords must be secure."</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Unspecified rules lead to security gaps.</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">"Passwords must contain \\(\\ge 12\\) characters, including 1 uppercase, 1 lowercase, 1 digit, and 1 symbol."</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;">"Support common web browsers."</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Unclear browser versions and OS matrices.</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">"Support latest 2 versions of Chrome, Edge, Firefox, and Safari on macOS 14+ and Windows 11."</td>
      </tr>
    </tbody>
  </table>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Constructing the Bidirectional Traceability Matrix (RTM)</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">An RTM is a tabular grid mapping requirements forward to test cases and defects, and backward to business objectives. It guarantees <strong>100% test coverage</strong> and prevents scope creep.</p>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:13px;overflow-x:auto;"><code>Req ID   | Requirement Description     | Test Case ID(s)     | Status | Defect ID(s)
REQ-101  | User Login with 2FA Auth    | TC-AUTH-01, TC-02   | Pass   | -
REQ-102  | Password Reset Token Expiry | TC-AUTH-03, TC-04   | Fail   | BUG-402
REQ-103  | Profile Picture Upload (5MB)| TC-USER-08, TC-09   | Blocked| BUG-405</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Requirements must satisfy the <strong>INVEST</strong> criteria: Independent, Negotiable, Valuable, Estimable, Small, and Testable.</li>
      <li>Forward traceability ensures all requirements have corresponding test cases (no missing test coverage).</li>
      <li>Backward traceability ensures no test cases exist without a business requirement (prevents gold-plating).</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 5 ──
    {
      id: "CH-MNT-005",
      courseId: "CRS-MNT-001",
      sequence: 5,
      title: "Test Planning & Strategy: Risk-Based Testing & Estimation",
      description: "IEEE 829 test plan standard, Master Test Plan vs Level Test Plan, Risk-Based Testing (Likelihood x Impact matrix), WBS estimation, and 3-point estimation (PERT).",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 28,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: QA Foundations • Chapter 5</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Test Planning & Strategy: Risk-Based Testing</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Failing to plan is planning to fail. An ad-hoc testing team squanders time verifying trivial cosmetic buttons while critical financial ledger calculation paths go untested. We master formal test planning and quantitative risk-based prioritization.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/5UuR7p0k51c" title="Test Plan and Test Strategy Tutorial" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Test Strategy vs Test Plan (Enterprise Separation)</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:20px 0;">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#0284c7;margin-top:0;">Test Strategy (Organizational / Static)</h3>
      <p style="font-size:14px;color:#475569;">High-level document authored by QA Director/Lead across the entire company or department. Defines standard test levels, entry/exit criteria, tooling standards, defect classification rules, and automation percentages. Rarely changes.</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#6366f1;margin-top:0;">Test Plan (Project-Specific / Dynamic)</h3>
      <p style="font-size:14px;color:#475569;">Project-level operational document defined for a specific release, milestone, or sprint. Specifies exact scope (features in/out), assigned resources, timeline, environment details, and risk mitigation schedules.</p>
    </div>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Risk-Based Testing Matrix: Prioritizing Finite Time</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">Because exhaustive testing is impossible, test coverage is allocated based on <strong>Risk Exposure = Probability of Failure \\(\\times\\) Impact of Failure</strong>:</p>
  <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
    <thead>
      <tr style="background:#f1f5f9;text-align:left;">
        <th style="padding:12px;border:1px solid #cbd5e1;">Risk Score</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Likelihood</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Business Impact</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Test Strategy & Depth</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;background:#fee2e2;color:#991b1b;font-weight:700;">Critical (Category 1)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">High (New complex logic)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Severe (Data breach / Fund loss)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Exhaustive BVA, negative testing, automated regression, peer reviewed</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;background:#fef3c7;color:#92400e;font-weight:700;">Moderate (Category 2)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Medium</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Moderate (User annoyance)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Equivalence partitioning, standard positive/negative scenarios</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;background:#f0fdf4;color:#166534;font-weight:700;">Low (Category 3)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Low (Static text/CSS)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Minor (Typo / Alignment)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Exploratory testing, sampled checks if time permits</td>
      </tr>
    </tbody>
  </table>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>An enterprise Test Plan follows IEEE 829 standards, defining features to be tested, features not to be tested, and suspension/resumption criteria.</li>
      <li>Use <strong>PERT 3-Point Estimation</strong>: \\(E = (O + 4M + P) / 6\\) to calculate realistic testing timelines accounting for unexpected blocking defects.</li>
      <li>Risk-Based Testing ensures maximum business protection when release deadlines are unexpectedly compressed.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 6 ──
    {
      id: "CH-MNT-006",
      courseId: "CRS-MNT-001",
      sequence: 6,
      title: "Test Levels: Unit, Integration, System & Acceptance (UAT)",
      description: "The 4 formal levels of testing, Big Bang vs Incremental Integration, Top-Down (Stubs) vs Bottom-Up (Drivers), System non-functional testing, Alpha vs Beta testing, and UAT sign-off.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: QA Foundations • Chapter 6</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Test Levels: Unit, Integration, System & UAT</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Testing must be organized hierarchically. Attempting to test an entire enterprise banking platform end-to-end without validating underlying API contracts or individual calculation functions results in chaos. We analyze the 4 formal levels of testing defined by ISTQB.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/9gS9_eFvhoc" title="Levels of Testing Explained" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The 4 Testing Levels Compared</h2>
  <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
    <thead>
      <tr style="background:#f1f5f9;text-align:left;">
        <th style="padding:12px;border:1px solid #cbd5e1;">Level</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Target Scope</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Primary Primary Owner</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Key Focus</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>1. Unit / Component</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Individual functions, classes, methods in isolation</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Software Developers</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Code structure, branch coverage, algorithmic correctness</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>2. Integration</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Interfaces between modules, microservices, databases</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Developers & QA Engineers</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">API schemas, contract compatibility, data exchange protocols</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>3. System</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Complete, integrated end-to-end software package</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Independent QA Engineers</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Functional workflows, performance, security, UI navigation</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>4. Acceptance (UAT)</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Readiness for real business deployment</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">End Users & Business Analysts</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Business value, Alpha/Beta field trials, regulatory compliance</td>
      </tr>
    </tbody>
  </table>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Integration Testing: Stubs vs Drivers</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:20px 0;">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#0284c7;margin-top:0;">Top-Down Integration (Uses Stubs)</h3>
      <p style="font-size:14px;color:#475569;">Starts from high-level control modules. Lower-level subordinate modules that have not yet been coded are simulated using <strong>Stubs</strong> (dummy modules that return hardcoded mock responses).</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#6366f1;margin-top:0;">Bottom-Up Integration (Uses Drivers)</h3>
      <p style="font-size:14px;color:#475569;">Starts from low-level atomic utility modules. Higher-level calling modules that have not yet been developed are simulated using <strong>Drivers</strong> (test harnesses that invoke the module and receive outputs).</p>
    </div>
  </div>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Avoid 'Big Bang' integration (waiting until all code is done to plug everything together at once); it makes isolating defects nearly impossible.</li>
      <li>Alpha testing is executed at the developer's site by internal users; Beta testing is executed by real external users in their own live operational environments.</li>
      <li>Formal UAT sign-off is the legal gate authorizing commercial deployment.</li>
    </ul>
  </div>
</div>`
    }
  ],

  assessments: [
    {
      id: "ASM-MNT-001",
      title: "Testing Principles & Quality Fundamentals Assessment",
      chapterId: "CH-MNT-001",
      courseId: "CRS-MNT-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-MNT-001-01", type: "MCQ", prompt: "What is the primary difference between Quality Assurance (QA) and Quality Control (QC)?", options: ["QA is process-oriented focused on defect prevention; QC is product-oriented focused on defect detection in deliverables", "QA only tests code; QC reviews documents", "QA is done by developers; QC by clients", "There is no difference"], answer: 0, points: 10 },
        { id: "Q-MNT-001-02", type: "MCQ", prompt: "What does the ISTQB principle 'Testing shows the presence of defects, not their absence' mean?", options: ["Testing can prove that defects exist in the software, but cannot prove that zero defects remain", "Testing guarantees 100% bug-free software", "Untested code has no bugs", "Bugs only appear after release"], answer: 0, points: 10 },
        { id: "Q-MNT-001-03", type: "MCQ", prompt: "According to the Cost of Quality (CoQ) rule, approximately how much does the cost of fixing a bug multiply if caught in production versus requirements?", options: ["Up to 100x or more", "No cost increase (1x)", "Exactly 2x", "Half the cost"], answer: 0, points: 10 },
        { id: "Q-MNT-001-04", type: "MCQ", prompt: "What does the 'Pesticide Paradox' principle warn testing teams about?", options: ["If the same tests are repeated over and over, eventually the same test cases will no longer find any new defects", "Automated tests expire after 30 days", "Bugs destroy computer hardware", "Too many tests slow down CI/CD"], answer: 0, points: 10 },
        { id: "Q-MNT-001-05", type: "MCQ", prompt: "What does the 'Defect Clustering' principle state based on the Pareto principle?", options: ["Approximately 80% of all software defects are typically found in only 20% of the system modules", "Defects are uniformly distributed across all files", "Each feature contains exactly 5 defects", "Defects disappear in groups"], answer: 0, points: 10 },
        { id: "Q-MNT-001-06", type: "MCQ", prompt: "Why is 'Exhaustive Testing' considered impossible in practical software engineering?", options: ["Testing every possible combination of inputs, preconditions, and timing paths is mathematically infinite and resource-prohibitive", "Testers lack technical skills", "Programming languages prevent it", "Computers crash after 100 tests"], answer: 0, points: 10 },
        { id: "Q-MNT-001-07", type: "MCQ", prompt: "What is the 'Absence-of-Errors Fallacy' in software quality?", options: ["Fixing all identified bugs is useless if the delivered system does not fulfill genuine user needs or business goals", "Bugs never exist in production", "Errors can be completely eliminated", "Finding no bugs means testing failed"], answer: 0, points: 10 },
        { id: "Q-MNT-001-08", type: "MCQ", prompt: "In software engineering terminology, what is the distinction between an Error, a Defect (Bug), and a Failure?", options: ["A human makes an Error (mistake), which introduces a Defect (bug) into the code, which causes a dynamic runtime Failure when executed", "They are identical synonyms", "A Failure causes a Defect which causes an Error", "Errors occur only on servers"], answer: 0, points: 10 },
        { id: "Q-MNT-001-09", type: "MCQ", prompt: "What category in the Cost of Quality framework encompasses training, code reviews, and process definition?", options: ["Prevention Costs", "Appraisal Costs", "Internal Failure Costs", "External Failure Costs"], answer: 0, points: 10 },
        { id: "Q-MNT-001-10", type: "MCQ", prompt: "What category in the Cost of Quality represents customer support tickets, warranty claims, and public PR damage from production bugs?", options: ["External Failure Costs", "Prevention Costs", "Appraisal Costs", "Internal Failure Costs"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-MNT-002",
      title: "SDLC vs STLC & Shift-Left Assessment",
      chapterId: "CH-MNT-002",
      courseId: "CRS-MNT-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-MNT-002-01", type: "MCQ", prompt: "What are the sequential 6 phases of the Software Testing Life Cycle (STLC)?", options: ["Requirement Analysis, Test Planning, Test Case Development, Environment Setup, Test Execution, Test Cycle Closure", "Coding, Testing, Release, Maintenance, Review, Close", "Design, Build, Deploy, Run, Fix, Log", "Plan, Code, Test, Ship"], answer: 0, points: 10 },
        { id: "Q-MNT-002-02", type: "MCQ", prompt: "In the V-Model of software engineering, which testing level corresponds directly to Business Requirements?", options: ["User Acceptance Testing (UAT)", "Unit Testing", "Integration Testing", "Component Testing"], answer: 0, points: 10 },
        { id: "Q-MNT-002-03", type: "MCQ", prompt: "In the V-Model, which testing level corresponds to System Architectural / High-Level Design?", options: ["Integration Testing", "Unit Testing", "UAT", "Smoke Testing"], answer: 0, points: 10 },
        { id: "Q-MNT-002-04", type: "MCQ", prompt: "What is 'Shift-Left Testing'?", options: ["Moving testing activities earlier into the requirements and design phases of the SDLC to prevent defects early", "Testing only the left side of the screen", "Skipping backend testing", "Postponing testing to production"], answer: 0, points: 10 },
        { id: "Q-MNT-002-05", type: "MCQ", prompt: "What document marks the primary deliverable produced during the Test Planning phase of the STLC?", options: ["Test Plan Document (defining scope, resources, schedule, risks, and exit criteria)", "Defect Report", "Source code", "User manual"], answer: 0, points: 10 },
        { id: "Q-MNT-002-06", type: "MCQ", prompt: "What is an 'Exit Criteria' in the STLC?", options: ["Predefined standards and metric thresholds that must be achieved before a testing phase can be officially declared complete", "The door to the testing lab", "The reason for cancelling a project", "The logout button"], answer: 0, points: 10 },
        { id: "Q-MNT-002-07", type: "MCQ", prompt: "In Agile Scrum, what is the role of a QA Engineer during Sprint Planning?", options: ["Review user stories for testability, estimate QA effort, and define acceptance criteria with the team", "Sit silently until coding is done", "Write production Java code only", "Approve developer vacations"], answer: 0, points: 10 },
        { id: "Q-MNT-002-08", type: "MCQ", prompt: "What is a 'Test Deliverable' produced during the Test Cycle Closure phase?", options: ["Test Summary / Completion Report and Metrics Dashboard", "Database schema", "Wireframe mockup", "Server invoice"], answer: 0, points: 10 },
        { id: "Q-MNT-002-09", type: "MCQ", prompt: "Why is the traditional Waterfall model problematic for testing complex, evolving web applications?", options: ["Testing occurs only at the very end; defects found late require massive rework and risk missing hard launch deadlines", "Waterfall has no documentation", "Developers refuse to write code in Waterfall", "Waterfall only works for hardware"], answer: 0, points: 10 },
        { id: "Q-MNT-002-10", type: "MCQ", prompt: "What activity is performed during the Test Environment Setup phase of STLC?", options: ["Setting up test servers, database seed data, test accounts, and running a smoke test to verify readiness", "Writing unit test code", "Signing customer contracts", "Interviewing new hires"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-MNT-003",
      title: "Verification vs Validation Assessment",
      chapterId: "CH-MNT-003",
      courseId: "CRS-MNT-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-MNT-003-01", type: "MCQ", prompt: "Which famous question summarizes the core objective of Verification?", options: ["'Are we building the product right?'", "'Are we building the right product?'", "'Are we on budget?'", "'Are users satisfied?'"], answer: 0, points: 10 },
        { id: "Q-MNT-003-02", type: "MCQ", prompt: "Which famous question summarizes the core objective of Validation?", options: ["'Are we building the right product?'", "'Are we building the product right?'", "'Does the code compile?'", "'Did we write comments?'"], answer: 0, points: 10 },
        { id: "Q-MNT-003-03", type: "MCQ", prompt: "What fundamental operational difference distinguishes Static Testing from Dynamic Testing?", options: ["Static testing evaluates work products without executing code; dynamic testing executes compiled software with test inputs", "Static testing only tests databases", "Dynamic testing has no documentation", "Static testing requires a GPU"], answer: 0, points: 10 },
        { id: "Q-MNT-003-04", type: "MCQ", prompt: "What formal inspection process, created by Michael Fagan at IBM, features defined roles, checklists, and entry/exit criteria?", options: ["Fagan Inspection", "Agile Standup", "Pair Programming", "Sprint Review"], answer: 0, points: 10 },
        { id: "Q-MNT-003-05", type: "MCQ", prompt: "Who leads a Walkthrough review session?", options: ["The author of the work product (who walks attendees through the document step by step)", "An external auditor", "The CEO", "A junior intern"], answer: 0, points: 10 },
        { id: "Q-MNT-003-06", type: "MCQ", prompt: "Who leads a Formal Technical Inspection meeting?", options: ["A trained, independent Moderator (not the author)", "The author", "The client", "The database administrator"], answer: 0, points: 10 },
        { id: "Q-MNT-003-07", type: "MCQ", prompt: "In an inspection meeting, what is the role of the 'Scribe' (or Recorder)?", options: ["Documenting each identified defect, action item, and open issue without taking part in defensive debates", "Fixing code during the meeting", "Serving coffee", "Grading the author"], answer: 0, points: 10 },
        { id: "Q-MNT-003-08", type: "MCQ", prompt: "What type of review is conducted by two peers reviewing each other's code informally at their desks?", options: ["Peer Review / Buddy Check", "Fagan Inspection", "UAT", "Regression Run"], answer: 0, points: 10 },
        { id: "Q-MNT-003-09", type: "MCQ", prompt: "Why does static analysis find defects that dynamic testing often misses?", options: ["Static analysis inspects unreachable code branches, uncalled functions, and security flaws regardless of execution paths", "Static analysis can run without computers", "Static analysis is 100% accurate", "Static analysis only checks spelling"], answer: 0, points: 10 },
        { id: "Q-MNT-003-10", type: "MCQ", prompt: "What is an example of a Verification activity in a software project?", options: ["Conducting a formal inspection of the Business Requirement Specification (BRS)", "Executing functional test cases on staging", "Running load tests with JMeter", "Conducting a user beta test"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-MNT-004",
      title: "Requirements Analysis & RTM Assessment",
      chapterId: "CH-MNT-004",
      courseId: "CRS-MNT-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-MNT-004-01", type: "MCQ", prompt: "What makes a software requirement 'testable'?", options: ["It is unambiguous, quantifiable, and stated such that an objective pass/fail criterion can be verified with evidence", "It is written in Java", "It is shorter than 10 words", "It is approved by marketing"], answer: 0, points: 10 },
        { id: "Q-MNT-004-02", type: "MCQ", prompt: "Why is the requirement 'The website must be user-friendly' defective?", options: ["It is subjective, unmeasurable, and open to conflicting interpretations", "It is too technical", "It requires automation", "It is too long"], answer: 0, points: 10 },
        { id: "Q-MNT-004-03", type: "MCQ", prompt: "What does RTM stand for in quality assurance engineering?", options: ["Requirement Traceability Matrix", "Real-Time Monitoring", "Regression Test Method", "Release Timing Management"], answer: 0, points: 10 },
        { id: "Q-MNT-004-04", type: "MCQ", prompt: "What is Forward Traceability in an RTM?", options: ["Mapping each business requirement forward to its corresponding test cases to verify 100% test coverage", "Mapping code to defects", "Scheduling releases into the future", "Tracking employee hours"], answer: 0, points: 10 },
        { id: "Q-MNT-004-05", type: "MCQ", prompt: "What is Backward (or Reverse) Traceability in an RTM?", options: ["Mapping test cases back to business requirements to ensure testing does not exceed project scope (prevents gold plating)", "Reversing row order in Excel", "Testing older software versions", "Rolling back database migrations"], answer: 0, points: 10 },
        { id: "Q-MNT-004-06", type: "MCQ", prompt: "What acronym describes the quality criteria of an Agile User Story?", options: ["INVEST (Independent, Negotiable, Valuable, Estimable, Small, Testable)", "SMART", "SOLID", "ACID"], answer: 0, points: 10 },
        { id: "Q-MNT-004-07", type: "MCQ", prompt: "What is the primary role of Acceptance Criteria on an Agile user story?", options: ["Defining boundary conditions and concrete scenarios that must be met for the story to be accepted as complete", "Writing employee salaries", "Estimating story points", "Selecting programming languages"], answer: 0, points: 10 },
        { id: "Q-MNT-004-08", type: "MCQ", prompt: "What type of requirement specifies system attributes like performance, scalability, security, and accessibility?", options: ["Non-Functional Requirements (NFR)", "Functional Requirements", "User Stories", "Bug Reports"], answer: 0, points: 10 },
        { id: "Q-MNT-004-09", type: "MCQ", prompt: "What document describes business processes from the end-user perspective before technical design begins?", options: ["BRD (Business Requirements Document)", "Technical Architecture Doc", "Git log", "API Swagger schema"], answer: 0, points: 10 },
        { id: "Q-MNT-004-10", type: "MCQ", prompt: "If a requirement has no associated test case in the RTM, what risk does this expose?", options: ["A coverage gap: the requirement will deploy to production completely unverified", "The database will fail", "The requirement is deleted", "The build breaks"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-MNT-005",
      title: "Test Planning & Risk-Based Testing Assessment",
      chapterId: "CH-MNT-005",
      courseId: "CRS-MNT-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-MNT-005-01", type: "MCQ", prompt: "What international standard provides the traditional outline and structure for software test documentation?", options: ["IEEE 829 (now ISO/IEC/IEEE 29119)", "ISO 9001", "RFC 2616", "PCI-DSS"], answer: 0, points: 10 },
        { id: "Q-MNT-005-02", type: "MCQ", prompt: "What is the primary distinction between a Test Strategy and a Test Plan?", options: ["A Test Strategy is an organizational, static policy defining standards; a Test Plan is a project-specific operational schedule", "A Test Plan is for automated tests; a Test Strategy is for manual tests", "A Test Strategy is written by developers", "There is no difference"], answer: 0, points: 10 },
        { id: "Q-MNT-005-03", type: "MCQ", prompt: "How is Risk Exposure mathematically calculated in Risk-Based Testing?", options: ["Risk = Probability of Failure (Likelihood) * Impact of Failure (Severity)", "Risk = Number of lines of code / Number of bugs", "Risk = Test cases * Testers", "Risk = Budget / Time"], answer: 0, points: 10 },
        { id: "Q-MNT-005-04", type: "MCQ", prompt: "What testing approach should be allocated to High-Likelihood, High-Impact critical features?", options: ["Deep rigorous testing: boundary values, negative scenarios, security, and automated regression coverage", "Exploratory testing only", "Sampled checking if time allows", "Skipping manual testing"], answer: 0, points: 10 },
        { id: "Q-MNT-005-05", type: "MCQ", prompt: "What section of a formal Test Plan explicitly prevents misunderstandings about project testing boundaries?", options: ["Scope / Features Not to be Tested (Out of Scope)", "Introduction", "Sign-off signature", "Approvals"], answer: 0, points: 10 },
        { id: "Q-MNT-005-06", type: "MCQ", prompt: "What are 'Suspension Criteria' in a Test Plan?", options: ["Conditions under which formal testing must be halted (e.g. blocking critical defects preventing environment login)", "Reasons to fire a tester", "When developers stop coding", "The end of the fiscal year"], answer: 0, points: 10 },
        { id: "Q-MNT-005-07", type: "MCQ", prompt: "What is the formula for PERT (3-Point) Estimation with Optimistic (O), Most Likely (M), and Pessimistic (P) estimates?", options: ["E = (O + 4M + P) / 6", "E = (O + M + P) / 3", "E = M * 2", "E = P - O"], answer: 0, points: 10 },
        { id: "Q-MNT-005-08", type: "MCQ", prompt: "What test estimation technique decomposes total testing into granular hierarchical activities before summing estimates?", options: ["Work Breakdown Structure (WBS)", "Delphi Method", "Fibonacci poker only", "Random guess"], answer: 0, points: 10 },
        { id: "Q-MNT-005-09", type: "MCQ", prompt: "What is an 'Entry Criteria' for the Test Execution phase?", options: ["Preconditions required before test execution begins (e.g. test environment stable, smoke test passed, test data seeded)", "Passing UAT", "Deploying to production", "Receiving the final invoice"], answer: 0, points: 10 },
        { id: "Q-MNT-005-10", type: "MCQ", prompt: "Why is Risk-Based Testing critical when project managers announce an unexpected 50% reduction in testing timeline?", options: ["It provides a rational framework to execute high-risk tests first, maximizing defect detection where business danger is highest", "It allows cancelling all testing", "It generates automatic code", "It removes the need for reports"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-MNT-006",
      title: "Test Levels: Unit to UAT Assessment",
      chapterId: "CH-MNT-006",
      courseId: "CRS-MNT-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-MNT-006-01", type: "MCQ", prompt: "What are the four recognized formal levels of software testing in ascending order?", options: ["Unit Testing -> Integration Testing -> System Testing -> Acceptance Testing (UAT)", "Smoke -> Sanity -> Regression -> UAT", "Alpha -> Beta -> Gamma -> Delta", "Static -> Dynamic -> Manual -> Automated"], answer: 0, points: 10 },
        { id: "Q-MNT-006-02", type: "MCQ", prompt: "What is the primary target of Unit Testing?", options: ["Individual software components, functions, or classes verified in complete isolation", "The entire UI application", "Network firewalls", "User contracts"], answer: 0, points: 10 },
        { id: "Q-MNT-006-03", type: "MCQ", prompt: "What is a 'Stub' in Top-Down integration testing?", options: ["A dummy lower-level subordinate module that simulates called routines that have not yet been developed", "A driver that invokes code", "A broken test case", "A type of database"], answer: 0, points: 10 },
        { id: "Q-MNT-006-04", type: "MCQ", prompt: "What is a 'Driver' in Bottom-Up integration testing?", options: ["A dummy higher-level calling module that invokes low-level utility components under test", "A device hardware driver", "A lead developer", "A test runner GUI"], answer: 0, points: 10 },
        { id: "Q-MNT-006-05", type: "MCQ", prompt: "Why is 'Big Bang' integration testing discouraged in professional engineering teams?", options: ["All modules are combined at once; when failures occur, isolating which module or interface caused the defect is extremely difficult", "It requires too many computers", "It only runs on weekends", "It is an agile ritual"], answer: 0, points: 10 },
        { id: "Q-MNT-006-06", type: "MCQ", prompt: "What distinguishes System Testing from Integration Testing?", options: ["System testing evaluates the entire integrated end-to-end product against specified business requirements; integration tests module interfaces", "System testing is done by developers", "System testing has no UI", "Integration testing requires UAT sign-off"], answer: 0, points: 10 },
        { id: "Q-MNT-006-07", type: "MCQ", prompt: "What is the key difference between Alpha Testing and Beta Testing?", options: ["Alpha testing is performed at the developer's site by internal employees; Beta testing is performed by external real users in their live environments", "Alpha testing is automated; Beta is manual", "Alpha is done after release; Beta before", "Beta testing has no bugs"], answer: 0, points: 10 },
        { id: "Q-MNT-006-08", type: "MCQ", prompt: "Who are the primary executioners of User Acceptance Testing (UAT)?", options: ["Real business end-users, client stakeholders, and business analysts", "Junior software developers", "Security penetration testers", "Cloud infrastructure engineers"], answer: 0, points: 10 },
        { id: "Q-MNT-006-09", type: "MCQ", prompt: "What type of Acceptance Testing verifies that software complies with legal regulations, government mandates, and safety standards?", options: ["Regulatory / Compliance Acceptance Testing", "Alpha Testing", "Unit Testing", "Stress Testing"], answer: 0, points: 10 },
        { id: "Q-MNT-006-10", type: "MCQ", prompt: "What document officially authorizes that a system has met all business requirements and is approved for commercial production launch?", options: ["Formal UAT Sign-Off Document", "Git commit message", "Bug report", "Sprint retrospective board"], answer: 0, points: 10 },
      ]
    }
  ]
};

