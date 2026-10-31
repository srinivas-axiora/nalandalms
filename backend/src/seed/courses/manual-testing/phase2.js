// Phase 2: Black-Box Test Design Techniques & Test Case Engineering (Chapters 7 to 12) - Manual Testing
// World-class curriculum: Zero to employable master.

export const phase2 = {
  chapters: [
    // ── Chapter 7 ──
    {
      id: "CH-MNT-007",
      courseId: "CRS-MNT-001",
      sequence: 7,
      title: "Equivalence Class Partitioning (ECP) & Boundary Value Analysis (BVA)",
      description: "Mathematical partitioning of continuous and discrete input domains, valid vs invalid partitions, 2-value vs 3-value boundary testing, off-by-one errors, and test minimization.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 28,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Test Design Techniques • Chapter 7</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Equivalence Partitioning (ECP) & Boundary Value Analysis (BVA)</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Amateur testers test random inputs; professional QA engineers apply mathematical test design techniques that maximize defect yield while minimizing test case count. Equivalence Partitioning and Boundary Value Analysis are the two most fundamental black-box techniques in computer science.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/H0m3r7Qx9G4" title="Equivalence Partitioning and Boundary Value Analysis" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Equivalence Partitioning (ECP) Mechanics</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">Equivalence Partitioning divides the input domain into disjoint subsets where all values within a partition are assumed to be processed identically by the program logic. If one value in a partition uncovers a defect, all other values in that partition are presumed to uncover the same defect.</p>
  <div style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:8px;padding:18px;margin:20px 0;">
    <h4 style="margin-top:0;color:#0f172a;">Scenario: Age Field for Student Discount (Valid: 18 to 25 inclusive)</h4>
    <ul style="margin-bottom:0;padding-left:20px;font-size:14px;color:#334155;line-height:1.8;">
      <li><strong>Invalid Partition 1 (Too Low):</strong> Age \\(< 18\\) (e.g. Test Value = 14) \\(\\implies\\) Expected: Error "Too Young".</li>
      <li><strong>Valid Partition (Eligible):</strong> \\(18 \\le \\text{Age} \\le 25\\) (e.g. Test Value = 21) \\(\\implies\\) Expected: Discount Applied.</li>
      <li><strong>Invalid Partition 2 (Too High):</strong> Age \\(> 25\\) (e.g. Test Value = 32) \\(\\implies\\) Expected: Error "Ineligible".</li>
    </ul>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Boundary Value Analysis (BVA): 2-Value vs 3-Value Testing</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">Defects cluster overwhelmingly at the boundaries of equivalence partitions due to developer relational operator mistakes (e.g. typing <code>&lt;</code> instead of <code>&lt;=</code>, off-by-one errors).</p>
  <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
    <thead>
      <tr style="background:#f1f5f9;text-align:left;">
        <th style="padding:12px;border:1px solid #cbd5e1;">Technique</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Test Points Evaluated (Range [A, B])</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Example Values for Range [18, 25]</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>2-Value BVA</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Boundary point (On) + Adjacent outside point (Off)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Min-1: <strong>17</strong>, Min: <strong>18</strong> | Max: <strong>25</strong>, Max+1: <strong>26</strong></td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>3-Value BVA (Safety-Critical)</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Below (Off), Exactly On, and Above (In)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>17, 18, 19</strong> (Lower boundary) | <strong>24, 25, 26</strong> (Upper boundary)</td>
      </tr>
    </tbody>
  </table>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Always identify both <strong>valid</strong> and <strong>invalid</strong> equivalence partitions for every input field.</li>
      <li>BVA tests the extreme perimeter points where relational logic errors (<code>&gt;</code> vs <code>&gt;=</code>) occur most frequently.</li>
      <li>Combine ECP with BVA to achieve maximum branch coverage with minimum test case overhead.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 8 ──
    {
      id: "CH-MNT-008",
      courseId: "CRS-MNT-001",
      sequence: 8,
      title: "Decision Table Testing & Cause-Effect Graphing",
      description: "Combinatorial business rules, boolean logic matrices, identifying conditions and actions, collapsing redundant rules, and testing complex banking/insurance workflows.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Test Design Techniques • Chapter 8</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Decision Table Testing & Cause-Effect Graphing</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">When software behavior is governed by combinations of multiple interdependent conditions (e.g. credit score, income, citizenship, and loan history), testing conditions in isolation misses critical logic traps. Decision tables provide a structured tabular matrix guaranteeing 100% combinatorial rule coverage.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/5UuR7p0k51c" title="Decision Table Testing Explained" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Anatomy of a Decision Table (Credit Card Approval)</h2>
  <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
    <thead>
      <tr style="background:#f1f5f9;text-align:left;">
        <th style="padding:10px;border:1px solid #cbd5e1;">Rule #</th>
        <th style="padding:10px;border:1px solid #cbd5e1;">Rule 1</th>
        <th style="padding:10px;border:1px solid #cbd5e1;">Rule 2</th>
        <th style="padding:10px;border:1px solid #cbd5e1;">Rule 3</th>
        <th style="padding:10px;border:1px solid #cbd5e1;">Rule 4</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background:#f8fafc;">
        <td colspan="5" style="padding:8px;border:1px solid #cbd5e1;font-weight:700;color:#0284c7;">Conditions (Inputs / Causes)</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;">Credit Score \\(\\ge 700\\)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">True</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">True</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">False</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">False</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;">Income \\(\\ge \\$50,000\\)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">True</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">False</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">True</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">False</td>
      </tr>
      <tr style="background:#f8fafc;">
        <td colspan="5" style="padding:8px;border:1px solid #cbd5e1;font-weight:700;color:#10b981;">Actions (Outputs / Effects)</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;">Approve Platinum Card</td>
        <td style="padding:10px;border:1px solid #cbd5e1;color:#10b981;font-weight:700;">YES</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">NO</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">NO</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">NO</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;">Approve Silver Card</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">NO</td>
        <td style="padding:10px;border:1px solid #cbd5e1;color:#10b981;font-weight:700;">YES</td>
        <td style="padding:10px;border:1px solid #cbd5e1;color:#10b981;font-weight:700;">YES</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">NO</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;">Reject Application</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">NO</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">NO</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">NO</td>
        <td style="padding:10px;border:1px solid #cbd5e1;color:#ef4444;font-weight:700;">YES</td>
      </tr>
    </tbody>
  </table>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>For \\(N\\) binary boolean conditions, the full uncollapsed table contains \\(2^N\\) distinct rules.</li>
      <li>Each distinct vertical column (rule) translates directly into at least one executable test case.</li>
      <li>Collapse impossible or indifferent combinations (e.g. if User is Not Logged In, checking Admin permission is irrelevant).</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 9 ──
    {
      id: "CH-MNT-009",
      courseId: "CRS-MNT-001",
      sequence: 9,
      title: "State Transition Testing & Finite State Machines (FSM)",
      description: "State transition diagrams, valid vs invalid transitions, 0-switch vs 1-switch coverage, ATM/E-commerce checkout states, and transition matrices.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Test Design Techniques • Chapter 9</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">State Transition Testing & Finite State Machines</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Systems with stateful lifecycles—order processing, banking transactions, authentication sessions—respond differently to the same input depending on their current internal state. A user clicking 'Submit Payment' in an 'Active Cart' succeeds, but clicking it in an 'Already Paid' state must fail. We master State Transition Testing.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/5UuR7p0k51c" title="State Transition Testing Tutorial" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The 4 Elements of a State Machine</h2>
  <ul style="font-size:14px;color:#475569;line-height:1.8;">
    <li><strong>States:</strong> Conditions or modes of the system waiting for one or more events (e.g. <em>Created, Paid, Shipped, Cancelled</em>).</li>
    <li><strong>Events (Inputs):</strong> Triggers that arrive from the outside world (e.g. <em>Card Authorized, User Canceled</em>).</li>
    <li><strong>Transitions:</strong> The change of state caused by an event.</li>
    <li><strong>Actions (Outputs):</strong> The resulting side-effect (e.g. <em>Send Confirmation Email, Release Inventory</em>).</li>
  </ul>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Coverage Criteria: 0-Switch vs 1-Switch Coverage</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;"><strong>0-Switch Coverage (All Transitions):</strong> Tests every valid single transition at least once: \\(S_1 \\xrightarrow{E_1} S_2\\).<br><strong>1-Switch Coverage:</strong> Tests sequences of two consecutive transitions: \\(S_1 \\xrightarrow{E_1} S_2 \\xrightarrow{E_2} S_3\\). Uncovers bugs where lingering session state corrupts subsequent operations.</p>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Construct a <strong>State Transition Table</strong> listing all possible states as rows and all events as columns to easily identify illegal/invalid transitions.</li>
      <li>Negative testing in state machines verifies that illegal events (e.g. attempting to cancel an order that is already 'Delivered') are gracefully rejected.</li>
      <li>State transition testing is essential for embedded devices, e-commerce checkout flows, and user authentication locks.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 10 ──
    {
      id: "CH-MNT-010",
      courseId: "CRS-MNT-001",
      sequence: 10,
      title: "Use Case Testing & User Journey Mapping",
      description: "Actors, preconditions, main success scenario (happy path), alternative extensions, exceptional error flows, and customer journey validation across real-world workflows.",
      contentType: "Rich Text",
      durationMinutes: 45,
      minimumTimeMinutes: 20,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Test Design Techniques • Chapter 10</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Use Case Testing & User Journey Mapping</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Individual buttons and fields can function flawlessly, yet the software can still fail to support a customer's real commercial goal. Use case testing designs test cases around natural actor-system interactions, bridging the gap between technical units and business value.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/5UuR7p0k51c" title="Use Case Testing Tutorial" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Deconstructing a Use Case into Test Cases</h2>
  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin:20px 0;">
    <h4 style="margin-top:0;color:#0f172a;">Use Case: Purchase Item with Credit Card</h4>
    <p style="font-size:14px;color:#334155;"><strong>Primary Actor:</strong> Registered Shopper</p>
    <p style="font-size:14px;color:#334155;"><strong>Main Success Scenario (Happy Path - Test Case 1):</strong></p>
    <ol style="font-size:13px;color:#475569;line-height:1.7;">
      <li>Shopper selects items and proceeds to checkout.</li>
      <li>System displays order summary and prompts for payment.</li>
      <li>Shopper enters valid card credentials.</li>
      <li>Payment gateway authorizes transaction; system deducts inventory and renders Receipt.</li>
    </ol>
    <p style="font-size:14px;color:#334155;"><strong>Alternative Path 2a (Payment Declined - Test Case 2):</strong></p>
    <p style="font-size:13px;color:#475569;">At Step 4, gateway returns "Insufficient Funds". System retains cart, displays actionable error, and allows card re-entry.</p>
    <p style="font-size:14px;color:#334155;"><strong>Exception Path 3a (Network Timeout - Test Case 3):</strong></p>
    <p style="font-size:13px;color:#475569;">At Step 4, gateway times out. System must NOT charge card twice and must gracefully log pending authorization.</p>
  </div>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Every use case generates at least one Happy Path test case, plus one test case for every documented alternative and exception branch.</li>
      <li>Use case tests are prime candidates for System Integration and User Acceptance Testing (UAT).</li>
      <li>Mapping end-to-end user journeys uncovers cross-functional workflow blockers that isolated unit checks never encounter.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 11 ──
    {
      id: "CH-MNT-011",
      courseId: "CRS-MNT-001",
      sequence: 11,
      title: "Exploratory Testing, Whittaker's Tours & Session-Based Testing",
      description: "Scripted vs exploratory testing, James Bach's Session-Based Test Management (SBTM), test charters, time-boxing, and James Whittaker's exploratory software tours.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Test Design Techniques • Chapter 11</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Exploratory Testing & Session-Based Test Management (SBTM)</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Rigid adherence to pre-written scripts blinds testers to unexpected anomalies. Exploratory testing is simultaneous learning, test design, and test execution. When governed by Session-Based Test Management (SBTM), exploratory testing becomes a rigorous, measurable enterprise methodology.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/n3RKsY2H-NE" title="Exploratory Testing Masterclass" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. James Whittaker's Exploratory Tours Metaphor</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:16px;margin:20px 0;">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#0284c7;margin-top:0;">The Money Tour</h3>
      <p style="font-size:14px;color:#475569;">Tour the core revenue-generating features advertised in sales demos (checkout, payments, subscription tiers). Ensure primary commercial value paths are flawless.</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#ef4444;margin-top:0;">The Bad-Neighborhood Tour</h3>
      <p style="font-size:14px;color:#475569;">Focus on complex legacy modules known for frequent regression breaks, fragile database queries, and poor code hygiene.</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#6366f1;margin-top:0;">The Saboteur Tour</h3>
      <p style="font-size:14px;color:#475569;">Attempt to break the application through environmental disruption: pulling network cables mid-transfer, killing background processes, starving disk space.</p>
    </div>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. The SBTM Charter Structure (Time-Boxed 90 Minutes)</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:13px;overflow-x:auto;"><code>CHARTER: Explore the User Profile image upload mechanism with varying file headers and corrupt payloads to discover validation flaws.
DURATION: 90 Minutes (Time-boxed)
TESTER: Senior QA Engineer

NOTES & EVIDENCE:
- Discovered MIME-type spoofing vulnerability: renaming .exe to .jpg bypasses validation.
- Attached HAR logs and screenshot showing server 500 stacktrace.

OPPORTUNITY (TBS Breakdown):
- Test Design & Execution: 75%
- Bug Investigation & Reporting: 20%
- Environment / Setup: 5%</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Exploratory testing is not unstructured 'monkey testing'; it is systematic investigation driven by professional heuristics and charters.</li>
      <li>Time-boxing sessions to 60-90 minutes maintains deep focus and prevents investigative rabbit-holes.</li>
      <li>Session debriefs between tester and lead review defect discoveries and generate new targeted charters.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 12 ──
    {
      id: "CH-MNT-012",
      courseId: "CRS-MNT-001",
      sequence: 12,
      title: "Professional Test Case Authoring: Structure, Severity & Priority",
      description: "Standard IEEE test case anatomy, writing crystal-clear atomic steps, distinguishing expected vs actual results, Severity (Critical, Major, Minor) vs Priority (P1-P4).",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 28,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Test Design Techniques • Chapter 12</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Professional Test Case Authoring: Anatomy & Classification</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">A poorly written test case is worse than no test case at all; it creates ambiguity, wastes developer time with false repro attempts, and lets regressions slip into production. We master standard enterprise test case authoring and the vital distinction between Severity and Priority.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/5UuR7p0k51c" title="Writing Professional Test Cases" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Standard Enterprise Test Case Template</h2>
  <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
    <thead>
      <tr style="background:#f1f5f9;text-align:left;">
        <th style="padding:10px;border:1px solid #cbd5e1;width:25%;">Field</th>
        <th style="padding:10px;border:1px solid #cbd5e1;">Content Example</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Test Case ID</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;"><code>TC-AUTH-004</code></td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Test Title</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Verify account lockout after 5 consecutive invalid password attempts</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Preconditions</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">User account <code>user@company.com</code> exists with 'Active' status; 0 prior failed attempts</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Test Steps</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">1. Navigate to /login.<br>2. Enter email <code>user@company.com</code> and invalid password <code>WrongPass1!</code>.<br>3. Click 'Sign In'. Repeat 5 times consecutively.</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Test Data</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Email: <code>user@company.com</code>, Password: <code>WrongPass1!</code></td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Expected Result</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">On the 5th attempt, login fails and system displays: "Account locked for 15 minutes due to security policy." Database status updates to <code>lockedUntil = NOW() + 15m</code>.</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Severity / Priority</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Severity: High (Security violation) | Priority: P1 (Critical for release)</td>
      </tr>
    </tbody>
  </table>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Severity vs Priority: The 4 Quadrants</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:20px 0;">
    <div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;padding:16px;">
      <h3 style="color:#991b1b;margin-top:0;">High Severity & High Priority</h3>
      <p style="font-size:13px;color:#7f1d1d;">Server crashes on payment submit; all customers blocked from purchasing. Fix immediately!</p>
    </div>
    <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:16px;">
      <h3 style="color:#92400e;margin-top:0;">High Severity & Low Priority</h3>
      <p style="font-size:13px;color:#78350f;">App crashes only when printing reports on legacy Windows 98. Severe technical defect, but negligible real customer impact.</p>
    </div>
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;">
      <h3 style="color:#1e40af;margin-top:0;">Low Severity & High Priority</h3>
      <p style="font-size:13px;color:#1e3a8a;">Company logo is misspelled as "Gooogle" on homepage. Zero functional impact, but severe brand/PR embarrassment requiring immediate fix.</p>
    </div>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;">
      <h3 style="color:#166534;margin-top:0;">Low Severity & Low Priority</h3>
      <p style="font-size:13px;color:#14532d;">Minor 2-pixel margin misalignment in privacy policy footer. Fixed in future sprint cleanup.</p>
    </div>
  </div>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li><strong>Severity</strong> measures technical impact on system functionality (determined by QA).</li>
      <li><strong>Priority</strong> measures commercial urgency to fix the bug (determined by Product Manager / Business).</li>
      <li>Test cases must be <strong>atomic</strong>: testing exactly one condition per case to ensure crystal-clear root cause isolation.</li>
    </ul>
  </div>
</div>`
    }
  ],

  assessments: [
    {
      id: "ASM-MNT-007",
      title: "Equivalence Partitioning & BVA Assessment",
      chapterId: "CH-MNT-007",
      courseId: "CRS-MNT-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-MNT-007-01", type: "MCQ", prompt: "What is the core premise of Equivalence Class Partitioning (ECP)?", options: ["Inputs are partitioned into subsets where all values within a partition are treated equivalently by the software logic", "Every single integer must be tested", "Inputs must always be positive numbers", "Partitions must contain exactly 10 items"], answer: 0, points: 10 },
        { id: "Q-MNT-007-02", type: "MCQ", prompt: "An input field accepts integer values between 1 and 100 inclusive. What are the 3 equivalence partitions?", options: ["Values < 1 (Invalid), Values 1 to 100 (Valid), Values > 100 (Invalid)", "Values 1 to 50, and 51 to 100", "Only even numbers and odd numbers", "Positive numbers and negative numbers"], answer: 0, points: 10 },
        { id: "Q-MNT-007-03", type: "MCQ", prompt: "Why do software defects cluster at boundary values?", options: ["Programmers frequently make relational logic mistakes with boundary operators (e.g. using < instead of <=, off-by-one errors)", "Computers cannot process boundaries", "Boundaries have higher voltages", "Memory is smaller at boundaries"], answer: 0, points: 10 },
        { id: "Q-MNT-007-04", type: "MCQ", prompt: "Using standard 2-Value Boundary Value Analysis for an input range of [1, 100], what 4 test values should be selected?", options: ["0, 1, 100, 101", "1, 50, 100", "0, 50, 101", "-1, 0, 100, 200"], answer: 0, points: 10 },
        { id: "Q-MNT-007-05", type: "MCQ", prompt: "Using 3-Value Boundary Value Analysis for an input range [1, 100], what test values are tested at the lower boundary?", options: ["0, 1, 2", "0, 1", "-1, 0, 1", "1, 2, 3"], answer: 0, points: 10 },
        { id: "Q-MNT-007-06", type: "MCQ", prompt: "A password field requires 8 to 16 characters. What test input lengths represent Boundary Value Analysis testing?", options: ["7, 8, 16, 17 characters", "1, 8, 16, 100 characters", "8 and 16 only", "0 and 255 only"], answer: 0, points: 10 },
        { id: "Q-MNT-007-07", type: "MCQ", prompt: "What type of testing technique is Equivalence Class Partitioning classified under?", options: ["Black-Box (Specification-Based) Technique", "White-Box (Structure-Based) Technique", "Experience-Based Technique", "Non-Functional Technique"], answer: 0, points: 10 },
        { id: "Q-MNT-007-08", type: "MCQ", prompt: "If a system behaves incorrectly for one value in an equivalence partition, what is assumed about other values in that same partition?", options: ["They will also fail because they trigger the identical underlying code execution path", "They will all pass", "Their behavior is completely random", "They cannot be executed"], answer: 0, points: 10 },
        { id: "Q-MNT-007-09", type: "MCQ", prompt: "What is an 'Invalid Equivalence Partition'?", options: ["A range of input values that the system is specified to reject with appropriate validation error messages", "A broken test case", "A corrupted database partition", "An untested module"], answer: 0, points: 10 },
        { id: "Q-MNT-007-10", type: "MCQ", prompt: "Can Boundary Value Analysis be applied to non-numeric inputs like calendar dates or strings?", options: ["Yes, boundaries can be evaluated on string lengths, calendar start/end dates, and list capacities", "No, BVA only applies to integers", "No, BVA is purely theoretical", "Only in automated testing"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-MNT-008",
      title: "Decision Table Testing Assessment",
      chapterId: "CH-MNT-008",
      courseId: "CRS-MNT-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-MNT-008-01", type: "MCQ", prompt: "What software testing scenarios benefit most from Decision Table Testing?", options: ["Complex business logic where system outcomes depend on combinations of multiple interdependent conditions", "Testing single button colors", "Static spelling checks", "Hardware voltage testing"], answer: 0, points: 10 },
        { id: "Q-MNT-008-02", type: "MCQ", prompt: "For a decision table with 3 independent binary boolean conditions (True/False), how many total rules exist before collapsing?", options: ["8 rules (2^3)", "6 rules", "9 rules", "3 rules"], answer: 0, points: 10 },
        { id: "Q-MNT-008-03", type: "MCQ", prompt: "What are the two primary structural halves of a standard Decision Table?", options: ["Condition Stub/Entries (Inputs) and Action Stub/Entries (Outputs)", "Header and Footer", "Source and Destination", "Pass and Fail"], answer: 0, points: 10 },
        { id: "Q-MNT-008-04", type: "MCQ", prompt: "What does collapsing rules in a decision table mean?", options: ["Combining rules where the value of a particular condition does not affect the resulting action (using 'Don't Care' '-')", "Deleting failing tests", "Removing conditions from the product", "Combining all tests into one"], answer: 0, points: 10 },
        { id: "Q-MNT-008-05", type: "MCQ", prompt: "In a decision table, how does each valid column translate into test cases?", options: ["Each column represents a unique business rule that translates directly into at least one test case", "All columns become 1 test case", "Columns are ignored", "Only odd columns are tested"], answer: 0, points: 10 },
        { id: "Q-MNT-008-06", type: "MCQ", prompt: "What graphical modeling technique maps combinations of causes (inputs) to effects (outputs) using boolean logic gates?", options: ["Cause-Effect Graphing", "Sankey Diagram", "Gantt Chart", "Histogram"], answer: 0, points: 10 },
        { id: "Q-MNT-008-07", type: "MCQ", prompt: "Why is Decision Table testing especially prominent in banking and insurance domains?", options: ["Financial underwriting, loan approvals, and policy premiums are heavily governed by complex regulatory multi-variable rules", "Banks do not use databases", "Insurance apps have no UI", "Financial software has no bugs"], answer: 0, points: 10 },
        { id: "Q-MNT-008-08", type: "MCQ", prompt: "What symbol in an action row indicates that a particular outcome action should NOT occur for that rule?", options: ["'N' or 'False' or '-'", "'Y'", "'X'", "'*'"], answer: 0, points: 10 },
        { id: "Q-MNT-008-09", type: "MCQ", prompt: "What is an impossible combination in a decision table (e.g., 'Student Status = True' and 'Age < 5') called?", options: ["A constrained or infeasible rule that can be flagged or omitted from execution", "A defect in the table", "A syntax error", "A null pointer"], answer: 0, points: 10 },
        { id: "Q-MNT-008-10", type: "MCQ", prompt: "What is the primary risk of not using decision tables for complex logic?", options: ["Omission of edge combinations: testers miss subtle combinations that cause critical logic bugs in production", "Tests run too fast", "The table runs out of columns", "Code becomes uncompiled"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-MNT-009",
      title: "State Transition Testing Assessment",
      chapterId: "CH-MNT-009",
      courseId: "CRS-MNT-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-MNT-009-01", type: "MCQ", prompt: "What is a 'State' in a Finite State Machine (FSM)?", options: ["A condition or mode in which an entity rests waiting for one or more incoming events", "A geographic region", "A database server", "A completed test case"], answer: 0, points: 10 },
        { id: "Q-MNT-009-02", type: "MCQ", prompt: "What causes a transition from one state to another?", options: ["An Event (trigger) occurring that satisfies transition guards", "A timer ticking only", "A system restart", "A manual database update"], answer: 0, points: 10 },
        { id: "Q-MNT-009-03", type: "MCQ", prompt: "What is 0-Switch Coverage in state transition testing?", options: ["Testing every valid single state transition in the model at least once", "Testing zero transitions", "Testing pairs of two transitions", "Testing without a computer"], answer: 0, points: 10 },
        { id: "Q-MNT-009-04", type: "MCQ", prompt: "What is 1-Switch Coverage in state transition testing?", options: ["Testing all sequences of two consecutive transitions (S1 -> S2 -> S3)", "Testing one transition total", "Testing only the first state", "Flipping a physical switch"], answer: 0, points: 10 },
        { id: "Q-MNT-009-05", type: "MCQ", prompt: "What is a State Transition Table?", options: ["A tabular matrix mapping current states against input events to define resulting next states and actions", "A list of database tables", "A test plan template", "A bug tracking board"], answer: 0, points: 10 },
        { id: "Q-MNT-009-06", type: "MCQ", prompt: "How does State Transition Testing uncover negative / illegal behavior?", options: ["By sending unexpected events in states where they are prohibited (e.g. attempting to Ship an Order that is Unpaid)", "By turning off the server", "By corrupting the disk", "By typing random letters"], answer: 0, points: 10 },
        { id: "Q-MNT-009-07", type: "MCQ", prompt: "In an ATM cash withdrawal workflow, what state transition occurs after 3 consecutive invalid PIN entries?", options: ["Transition from 'PIN Entry' to 'Card Confiscated / Account Locked'", "Transition to 'Dispense Cash'", "Transition to 'Main Menu'", "No change"], answer: 0, points: 10 },
        { id: "Q-MNT-009-08", type: "MCQ", prompt: "What diagram visually depicts states as circles/boxes and transitions as directed arrows?", options: ["State Transition Diagram (or Statechart)", "Class Diagram", "Sequence Diagram", "Scatter Plot"], answer: 0, points: 10 },
        { id: "Q-MNT-009-09", type: "MCQ", prompt: "What is an 'End / Terminal State' in a finite state machine?", options: ["A state with no outgoing transitions representing workflow completion (e.g. 'Order Closed' or 'Session Terminated')", "A fatal crash state", "The login screen", "A paused state"], answer: 0, points: 10 },
        { id: "Q-MNT-009-10", type: "MCQ", prompt: "Why is state transition testing vital for online video game or IoT device testing?", options: ["Device operation and gameplay are fundamentally state-dependent (e.g. Character Dead, Shield Active, Sensor Paired)", "Games have no code", "IoT devices have no networks", "To measure graphic resolution"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-MNT-010",
      title: "Use Case Testing & User Journeys Assessment",
      chapterId: "CH-MNT-010",
      courseId: "CRS-MNT-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-MNT-010-01", type: "MCQ", prompt: "What is a 'Use Case' in software requirements engineering?", options: ["A formal description of interactions between an external Actor and the System to achieve a specific business goal", "A test case written in Python", "A developer user story", "A database schema"], answer: 0, points: 10 },
        { id: "Q-MNT-010-02", type: "MCQ", prompt: "What is an 'Actor' in a use case specification?", options: ["Any entity outside the system boundary (human user or external system) that interacts with the software", "A Hollywood movie performer", "The software database", "The QA manager"], answer: 0, points: 10 },
        { id: "Q-MNT-010-03", type: "MCQ", prompt: "What is the 'Main Success Scenario' (also known as the Happy Path)?", options: ["The primary default sequence of steps where everything proceeds without errors to successfully achieve the actor's goal", "A test case that always passes", "A test with no assertions", "The marketing roadmap"], answer: 0, points: 10 },
        { id: "Q-MNT-010-04", type: "MCQ", prompt: "What is an 'Alternative Flow' (or Extension) in a use case?", options: ["A secondary path where the user takes an optional or alternative route to still achieve their goal", "A software bug", "An invalid test step", "A hardware crash"], answer: 0, points: 10 },
        { id: "Q-MNT-010-05", type: "MCQ", prompt: "What is an 'Exception Flow' in a use case?", options: ["An anticipated error or failure path where the actor cannot complete the goal (e.g. Card Declined)", "A Python try/catch block", "An untestable requirement", "A server reboot"], answer: 0, points: 10 },
        { id: "Q-MNT-010-06", type: "MCQ", prompt: "How many baseline test cases should be derived from a single use case?", options: ["At least one test case for the main success path, plus one test case for every alternative and exception flow", "Exactly 1", "Always 100", "Zero"], answer: 0, points: 10 },
        { id: "Q-MNT-010-07", type: "MCQ", prompt: "Why is Use Case Testing particularly effective for System Integration and Acceptance Testing (UAT)?", options: ["It validates real end-to-end user transactions across integrated sub-systems rather than isolated technical functions", "It tests unit code coverage", "It requires no user interface", "It runs in 1 millisecond"], answer: 0, points: 10 },
        { id: "Q-MNT-010-08", type: "MCQ", prompt: "What are 'Preconditions' in a use case definition?", options: ["State conditions that must be true before the use case can be initiated (e.g. User has an active account and is logged in)", "The list of test steps", "The post-test cleanup", "The server operating system"], answer: 0, points: 10 },
        { id: "Q-MNT-010-09", type: "MCQ", prompt: "What are 'Postconditions' in a use case definition?", options: ["Guaranteed state conditions that exist after the use case completes (e.g. Order created in DB, inventory decremented)", "Pre-test setup", "Bug reports logged", "Test case execution time"], answer: 0, points: 10 },
        { id: "Q-MNT-010-10", type: "MCQ", prompt: "What is User Journey Mapping in modern product QA?", options: ["Visualizing the chronological multi-screen experience of a customer navigating through the app to achieve real-world goals", "Mapping GPS coordinates of testers", "A Google Maps API test", "Tracking CPU utilization"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-MNT-011",
      title: "Exploratory & Session-Based Testing Assessment",
      chapterId: "CH-MNT-011",
      courseId: "CRS-MNT-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-MNT-011-01", type: "MCQ", prompt: "How did Cem Kaner define Exploratory Testing?", options: ["An approach that emphasizes simultaneous learning, test design, and test execution", "Testing without a plan or documentation", "Clicking random buttons as fast as possible", "Automated selenium testing"], answer: 0, points: 10 },
        { id: "Q-MNT-011-02", type: "MCQ", prompt: "What is a 'Test Charter' in Session-Based Test Management (SBTM)?", options: ["A clear mission statement defining the specific goal, area of the application, and heuristics to explore during a session", "A legal contract with the client", "A company policy manual", "A bug report template"], answer: 0, points: 10 },
        { id: "Q-MNT-011-03", type: "MCQ", prompt: "What is the typical recommended time-box duration for an SBTM exploratory testing session?", options: ["60 to 90 minutes", "10 seconds", "8 hours", "1 week"], answer: 0, points: 10 },
        { id: "Q-MNT-011-04", type: "MCQ", prompt: "What does the TBS metric breakdown track in Session-Based Testing?", options: ["Time spent on Test Execution, Bug Investigation, and Setup/Interruption", "Total Bugs Submitted", "Test Build Success", "Team Budget Spending"], answer: 0, points: 10 },
        { id: "Q-MNT-011-05", type: "MCQ", prompt: "In James Whittaker's tours, what is the 'Money Tour'?", options: ["Touring the critical business revenue-generating features showcased in sales demos and customer onboarding", "Testing the pricing page only", "Paying testers bonuses", "Testing banking APIs"], answer: 0, points: 10 },
        { id: "Q-MNT-011-06", type: "MCQ", prompt: "In Whittaker's tours, what is the 'Saboteur Tour'?", options: ["Actively trying to disrupt the software by yanking cables, cutting power, starving memory, and simulating disk corruption", "Planting malicious code", "Testing rival products", "Deleting test documentation"], answer: 0, points: 10 },
        { id: "Q-MNT-011-07", type: "MCQ", prompt: "What is 'Error Guessing' in manual testing?", options: ["An experience-based technique where testers anticipate common mistakes based on past defects and developer psychology", "Guessing passwords", "Guessing random answers", "Ignoring error logs"], answer: 0, points: 10 },
        { id: "Q-MNT-011-08", type: "MCQ", prompt: "What occurs during a formal SBTM 'Session Debrief'?", options: ["The tester and QA lead review session notes, inspect defects found, and generate new focused charters", "The team packs up for the day", "Developers explain code", "Managers assign performance ratings"], answer: 0, points: 10 },
        { id: "Q-MNT-011-09", type: "MCQ", prompt: "What is a primary advantage of exploratory testing over rigid scripted test execution?", options: ["It uncovers unexpected, complex defects situated outside the narrow scope of pre-written scripts", "It requires no thinking", "It can be performed by non-technical people with zero training", "It takes 0 seconds"], answer: 0, points: 10 },
        { id: "Q-MNT-011-10", type: "MCQ", prompt: "What heuristic acronym developed by Elisabeth Hendrickson guides exploratory testing permutations?", options: ["SFDIPOT (San Francisco Depot) / FEW HICCUPPS", "SOLID", "STLC", "ACID"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-MNT-012",
      title: "Test Case Authoring & Classification Assessment",
      chapterId: "CH-MNT-012",
      courseId: "CRS-MNT-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-MNT-012-01", type: "MCQ", prompt: "What is the primary operational difference between Defect Severity and Defect Priority?", options: ["Severity measures technical impact on functionality (QA-driven); Priority measures commercial urgency to fix (Business-driven)", "Severity is for web; Priority for mobile", "Severity is a number; Priority is text", "They are identical"], answer: 0, points: 10 },
        { id: "Q-MNT-012-02", type: "MCQ", prompt: "A critical payment gateway crashes when processing transactions in legacy IE11, which represents <0.01% of customers. How should it be classified?", options: ["High Severity, Low Priority", "High Severity, High Priority", "Low Severity, High Priority", "Low Severity, Low Priority"], answer: 0, points: 10 },
        { id: "Q-MNT-012-03", type: "MCQ", prompt: "The company's primary corporate brand name is misspelled on the public homepage header. How should it be classified?", options: ["Low Severity, High Priority (Zero functional impact, but severe reputational damage)", "High Severity, High Priority", "Low Severity, Low Priority", "Not a defect"], answer: 0, points: 10 },
        { id: "Q-MNT-012-04", type: "MCQ", prompt: "What does it mean for a test case step to be 'atomic'?", options: ["It performs one single verifiable action rather than combining multiple disparate tasks into one step", "It tests atomic physics", "It is smaller than 10 characters", "It requires automation"], answer: 0, points: 10 },
        { id: "Q-MNT-012-05", type: "MCQ", prompt: "What is the role of 'Preconditions' in an enterprise test case?", options: ["Documenting the precise prerequisite system state and user credentials required before test execution begins", "Listing developer names", "Writing the expected result", "Estimating time in minutes"], answer: 0, points: 10 },
        { id: "Q-MNT-012-06", type: "MCQ", prompt: "Why should expected results never be written vaguely like 'System behaves properly'?", options: ["It is non-verifiable and subjective; expected results must detail exact screen messages, status codes, and DB states", "It takes too long to type", "It confuses the database", "It fails automated runners"], answer: 0, points: 10 },
        { id: "Q-MNT-012-07", type: "MCQ", prompt: "What is a 'Negative Test Case'?", options: ["A test designed to verify that the system handles invalid inputs, unauthorized actions, and error states gracefully without crashing", "A test that fails intentionally", "A depressed tester's notes", "A deleted test case"], answer: 0, points: 10 },
        { id: "Q-MNT-012-08", type: "MCQ", prompt: "What is a 'Test Suite'?", options: ["A collection of test cases grouped logically for execution (e.g. Smoke Suite, Regression Suite, Billing Suite)", "A luxury testing office", "A single test step", "A defect tracking software"], answer: 0, points: 10 },
        { id: "Q-MNT-012-09", type: "MCQ", prompt: "What test case field tracks whether the test case is currently Draft, Ready, Obsolete, or Under Review?", options: ["Test Case Status / Lifecycle State", "Severity", "Test Type", "Precondition"], answer: 0, points: 10 },
        { id: "Q-MNT-012-10", type: "MCQ", prompt: "Why is documenting exact 'Test Data' inside the test case essential?", options: ["It guarantees reproducibility: any tester or developer re-running the test will achieve identical deterministic results", "To test database storage limits", "To comply with tax laws", "To encrypt user information"], answer: 0, points: 10 },
      ]
    }
  ]
};
