// Phase 5: Chapters 25-30 and Assessments (ASM-SSM-025 to ASM-SSM-030)
export const phase5 = {
  chapters: [
  {
    "id": "CH-SSM-025",
    "courseId": "CRS-SSM-001",
    "title": "Statistical Process Control (SPC): Control Chart Architecture (X-bar & R, X-bar & S, I-MR, p, np, c, u charts)",
    "order": 25,
    "estimatedMinutes": 65,
    "content": "\n      <h2>1. The Control Phase: Sustaining the Gains</h2>\n      <p>Entering the <strong>Control Phase</strong> represents the final, vital frontier of DMAIC. Industry research indicates that over 70% of organizational improvement initiatives fail to sustain their gains after 12 months. Once the Six Sigma project team disbands and the Black Belt moves to another project, human habit, employee turnover, and operational fatigue cause processes to gradually backslide into their legacy, defective states.</p>\n      \n      <p>The definitive engineering weapon against process backsliding is <strong>Statistical Process Control (SPC)</strong>. Invented by <strong>Walter A. Shewhart</strong> at Bell Telephone Laboratories in the 1920s, SPC is the real-time application of statistical techniques to monitor, control, and signal when a process shifts away from its optimal target.</p>\n\n      <h2>2. Anatomical Architecture of a Shewhart Control Chart</h2>\n      <p>A Shewhart Control Chart is a time-ordered graphical chart displaying individual observations or subgroup statistics, bordered by three mathematical horizontal lines:</p>\n      <ul>\n        <li><strong>Center Line (CL):</strong> The mathematical average ($mu$ or $\bar{X}$) of the metric when the process is in a state of statistical control.</li>\n        <li><strong>Upper Control Limit (UCL):</strong> Set at exactly <strong>3 standard errors above the center line ($+3sigma$)</strong>:\n          $$\text{UCL} = \bar{X} + 3sigma_{\bar{X}}$$\n        </li>\n        <li><strong>Lower Control Limit (LCL):</strong> Set at exactly <strong>3 standard errors below the center line ($-3sigma$)</strong>:\n          $$\text{LCL} = \bar{X} - 3sigma_{\bar{X}}$$\n        </li>\n      </ul>\n\n      <div class=\"callout callout-danger\">\n        <h4>Critical Architectural Rule: Control Limits != Specification Limits!</h4>\n        <p>A fatal confusion among novice managers is conflating Control Limits with Specification Limits:\n          <ul>\n            <li><strong>Specification Limits (USL / LSL):</strong> Represent the <em>Voice of the Customer (VOC)</em>. They are external targets dictated by client contracts or design engineers. <em>They NEVER appear on a Shewhart control chart!</em></li>\n            <li><strong>Control Limits (UCL / LCL):</strong> Represent the <em>Voice of the Process (VOP)</em>. They are calculated purely from historical process standard deviation ($3sigma$). They show what the process is naturally delivering.</li>\n          </ul>\n        </p>\n      </div>\n\n      <h2>3. The Control Chart Decision Matrix: Selecting the Right Chart</h2>\n      <p>Deploying the wrong chart type yields false alarms or blinds managers to real shifts. Managers select charts based on the data type and subgroup size:</p>\n\n      <table class=\"table table-bordered\">\n        <thead>\n          <tr>\n            <th>Data Classification</th>\n            <th>Subgroup Size ($n$)</th>\n            <th>Control Chart Pair</th>\n            <th>Operational Use Case</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td><strong>Continuous (Variables)</strong></td>\n            <td>$n = 1$ (Individual observations)</td>\n            <td><strong>$I\text{-}MR$ Chart</strong><br>(Individuals and Moving Range)</td>\n            <td>Low-volume production; automated continuous batch measurements (e.g. chemical tank pH, monthly accounting closing time).</td>\n          </tr>\n          <tr>\n            <td><strong>Continuous (Variables)</strong></td>\n            <td>$2 le n le 9$ (Small subgroups)</td>\n            <td><strong>$\bar{X}\text{-}R$ Chart</strong><br>(Mean and Range)</td>\n            <td>Standard manufacturing line: sampling 5 consecutive parts every hour to monitor dimension center and spread.</td>\n          </tr>\n          <tr>\n            <td><strong>Continuous (Variables)</strong></td>\n            <td>$n ge 10$ (Large subgroups)</td>\n            <td><strong>$\bar{X}\text{-}S$ Chart</strong><br>(Mean and Standard Deviation)</td>\n            <td>High-speed stamping or automated packaging: subgroup sample standard deviation ($s$) replaces range for superior precision.</td>\n          </tr>\n          <tr>\n            <td><strong>Discrete (Defectives - Binomial)</strong></td>\n            <td>Variable sample size ($n_i$)</td>\n            <td><strong>$p$ Chart</strong><br>(Proportion Defective)</td>\n            <td>Tracking proportion of defective loan applications or rejected circuit boards when daily batch sizes vary.</td>\n          </tr>\n          <tr>\n            <td><strong>Discrete (Defectives - Binomial)</strong></td>\n            <td>Constant sample size ($n$)</td>\n            <td><strong>$np$ Chart</strong><br>(Count of Defectives)</td>\n            <td>Tracking raw count of rejected parts from a fixed daily sample of exactly 500 units.</td>\n          </tr>\n          <tr>\n            <td><strong>Discrete (Defects - Poisson)</strong></td>\n            <td>Constant area/unit of opportunity</td>\n            <td><strong>$c$ Chart</strong><br>(Count of Defects)</td>\n            <td>Counting total blemishes/scratches on an automobile door panel of fixed surface area.</td>\n          </tr>\n          <tr>\n            <td><strong>Discrete (Defects - Poisson)</strong></td>\n            <td>Variable area/unit of opportunity</td>\n            <td><strong>$u$ Chart</strong><br>(Defects per Unit)</td>\n            <td>Counting defects per square meter of rolled fabric when roll lengths vary.</td>\n          </tr>\n        </tbody>\n      </table>\n\n      <div class=\"video-container\">\n        <iframe src=\"https://www.youtube.com/embed/pTmLQvMM-1M\" title=\"Statistical Process Control (SPC) and Control Chart Selection Masterclass\" allowfullscreen></iframe>\n      </div>\n    ",
    "summary": "Master Statistical Process Control (SPC), build Shewhart control charts with $+/- 3sigma$ control limits, strictly distinguish Control Limits from Specification Limits, and navigate the chart selection matrix across continuous and discrete data.",
    "keyTakeaways": [
      "SPC is the primary operational tool to sustain gains and prevent process backsliding in the Control phase.",
      "Control limits are positioned at $+/- 3$ standard errors from the center line, calculated strictly from process data.",
      "Never put Specification Limits (USL/LSL) on Shewhart control charts; specifications represent customer voice, not process voice.",
      "Use $I$-$MR$ for single observations ($n=1$), $\bar{X}$-$R$ for small subgroups ($n le 9$), and $\bar{X}$-$S$ for large subgroups ($n ge 10$).",
      "Attribute charts handle classification counts: $p$/$np$ for defectives (Binomial), and $c$/$u$ for defects (Poisson)."
    ]
  },
  {
    "id": "CH-SSM-026",
    "courseId": "CRS-SSM-001",
    "title": "Control Chart Interpretation: Nelson Rules, Western Electric Rules, Special Cause vs. Common Cause Variation",
    "order": 26,
    "estimatedMinutes": 65,
    "content": "\n      <h2>1. The Science of Signal Detection</h2>\n      <p>A control chart is a real-time signal detection device. Its primary purpose is to distinguish between two fundamentally different types of operational variation:</p>\n      <ul>\n        <li><strong>Common Cause Variation (Chance Noise):</strong> The natural, predictable, background variation inherent in the design of the equipment, materials, and environment. A process exhibiting only common cause variation is in a state of <strong>Statistical Control</strong>.\n          <br><em>Management Action:</em> Do <strong>NOT</strong> adjust the machine! Tweaking a stable process in response to common cause noise is called <strong>Tampering</strong> (Deming's Funnel Experiment)—which actually <em>increases</em> total process variation!\n        </li>\n        <li><strong>Special Cause Variation (Assignable Signal):</strong> An unpredictable, non-random disruption introduced by an external source (e.g. broken tool, incorrect raw material batch, untrained substitute operator).\n          <br><em>Management Action:</em> Halt the line immediately, isolate the assignable root cause, and execute the Out-of-Control Action Plan (OCAP)!\n        </li>\n      </ul>\n\n      <h2>2. Zone Division of a Control Chart</h2>\n      <p>To detect non-random statistical patterns, the region between the Center Line and Control Limits is partitioned into three symmetrical $1sigma$ zones:</p>\n      <ul>\n        <li><strong>Zone C:</strong> The band between the Center Line and $pm 1sigma$. ($68.3%$ of random data falls here).</li>\n        <li><strong>Zone B:</strong> The band between $pm 1sigma$ and $pm 2sigma$.</li>\n        <li><strong>Zone A:</strong> The outer band between $pm 2sigma$ and $pm 3sigma$ (adjacent to UCL and LCL).</li>\n      </ul>\n\n      <h2>3. The Standard 8 Nelson Rules for Out-of-Control Detection</h2>\n      <p>Formulated by Lloyd S. Nelson in 1984, the <strong>Nelson Rules</strong> establish mathematical criteria for identifying special causes before a catastrophic point breaches the outer limits:</p>\n\n      <table class=\"table table-bordered\">\n        <thead>\n          <tr>\n            <th>Nelson Rule</th>\n            <th>Visual Pattern & Mathematical Trigger</th>\n            <th>Operational Interpretation</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td><strong>Rule 1 (Beyond Limits)</strong></td>\n            <td><strong>1 point</strong> falls beyond the Upper (UCL) or Lower (LCL) Control Limit ($> 3sigma$).</td>\n            <td>Severe gross disruption: tool snapped, power surge, wrong raw material used. Probability = 0.27%.</td>\n          </tr>\n          <tr>\n            <td><strong>Rule 2 (Shift in Mean)</strong></td>\n            <td><strong>9 (or 8) consecutive points</strong> fall on the same side of the Center Line.</td>\n            <td>Sustained process mean shift: new operator calibration, change in supplier material, thermal drift.</td>\n          </tr>\n          <tr>\n            <td><strong>Rule 3 (Trend)</strong></td>\n            <td><strong>6 consecutive points</strong> steadily increasing or steadily decreasing.</td>\n            <td>Continuous drift: progressive mechanical tool wear, chemical bath depletion, filter clogging.</td>\n          </tr>\n          <tr>\n            <td><strong>Rule 4 (Alternating)</strong></td>\n            <td><strong>14 consecutive points</strong> alternating up and down in a saw-tooth pattern.</td>\n            <td>Systematic alternating source: mixing two different machines, or two operators taking alternating turns.</td>\n          </tr>\n          <tr>\n            <td><strong>Rule 5 (Zone A Warning)</strong></td>\n            <td><strong>2 out of 3 consecutive points</strong> fall in Zone A ($> 2sigma$) on the same side of the center line.</td>\n            <td>Early warning of significant distribution shift; high probability of impending breach.</td>\n          </tr>\n          <tr>\n            <td><strong>Rule 6 (Zone B Warning)</strong></td>\n            <td><strong>4 out of 5 consecutive points</strong> fall in Zone B ($> 1sigma$) or beyond on the same side.</td>\n            <td>Moderate sustained drift away from center target.</td>\n          </tr>\n          <tr>\n            <td><strong>Rule 7 (Stratification / Hugging)</strong></td>\n            <td><strong>15 consecutive points</strong> fall within Zone C ($pm 1sigma$ of the Center Line).</td>\n            <td><strong>Too good to be true!</strong> Data is artificially tightly clustered: either control limits were miscalculated, or two subgroups with different means were averaged together.</td>\n          </tr>\n          <tr>\n            <td><strong>Rule 8 (Mixture / Avoidance)</strong></td>\n            <td><strong>8 consecutive points</strong> fall on either side of Center Line with <strong>none</strong> falling in Zone C.</td>\n            <td>Bimodal mixture: two distinct processes or streams are entering the inspection station without mixing.</td>\n          </tr>\n        </tbody>\n      </table>\n\n      <div class=\"callout callout-info\">\n        <h4>Deming's Funnel Experiment & The Tampering Trap</h4>\n        <p>In his famous Funnel Experiment, Deming dropped marbles through a funnel onto a target. When he adjusted the funnel position after every drop to 'compensate' for where the last marble landed, <strong>the dispersion of marbles doubled or tripled</strong>! Adjusting a machine in response to routine common cause variation introduces artificial instability. Only react when a Nelson Rule confirms a special cause!</p>\n      </div>\n\n      <div class=\"video-container\">\n        <iframe src=\"https://www.youtube.com/embed/5U_iK_fKzXw\" title=\"Nelson Rules and Special Cause Detection Masterclass\" allowfullscreen></iframe>\n      </div>\n    ",
    "summary": "Distinguish common cause from special cause variation, apply the 8 Nelson Rules to detect non-random process shifts, avoid the catastrophic tampering trap (Deming's Funnel), and establish Out-of-Control Action Plans.",
    "keyTakeaways": [
      "Common cause variation is inherent to system design; tampering with it increases total variation.",
      "Special cause variation represents assignable disruptions requiring immediate operational investigation.",
      "Control charts are divided into Zones A ($2sigma\text{--}3sigma$), B ($1sigma\text{--}2sigma$), and C ($0\text{--}1sigma$).",
      "Rule 1 triggers when 1 point breaches $3sigma$; Rule 2 detects shifts via 9 points on one side of center.",
      "Rule 7 (15 points hugging Zone C) detects data stratification or miscalculated limits.",
      "An Out-of-Control Action Plan (OCAP) dictates standard frontline steps when any Nelson rule triggers."
    ]
  },
  {
    "id": "CH-SSM-027",
    "courseId": "CRS-SSM-001",
    "title": "Process Control Plans, Standard Operating Procedures (SOPs) & TPM (Total Productive Maintenance - OEE)",
    "order": 27,
    "estimatedMinutes": 65,
    "content": "\n      <h2>1. The Control Plan: The Master Operational Playbook</h2>\n      <p>A validated statistical breakthrough in the Improve phase is worthless if it remains trapped in a presentation deck. The <strong>Process Control Plan (PCP)</strong> is the comprehensive operational document that specifies how every critical process parameter ($X$) and product attribute ($Y$) will be monitored, controlled, inspected, and reacted to on the factory or office floor.</p>\n\n      <h2>2. Anatomical Structure of an AIAG Control Plan</h2>\n      <p>Standardized by the Automotive Industry Action Group (AIAG), a production Control Plan contains columns linking design to shop-floor execution:</p>\n      <ul>\n        <li><strong>Part / Process Step Number & Name:</strong> Linked directly to the PFMEA and Process Flow Diagram.</li>\n        <li><strong>Machine / Tooling:</strong> Specific asset identifier (e.g. <em>\"CNC Mill #4\"</em>).</li>\n        <li><strong>Characteristics:</strong>\n          <ul>\n            <li><em>Product Characteristic ($Y$):</em> The dimensional or visual attribute measured on the part (e.g. <em>\"Bore Diameter: $50.00 pm 0.02\text{ mm}$\"</em>).</li>\n            <li><em>Process Characteristic ($X$):</em> The machine parameter controlled (e.g. <em>\"Spindle Speed: 3,200 RPM; Coolant Pressure: 4.5 bar\"</em>).</li>\n          </ul>\n        </li>\n        <li><strong>Methods:</strong>\n          <ul>\n            <li><em>Measurement Technique / Gage:</em> Digital bore micrometer (Gage R&R certified &lt; 8%).</li>\n            <li><em>Sample Size & Frequency:</em> 5 parts every 60 minutes.</li>\n            <li><em>Control Method:</em> Automated $\bar{X}$-$R$ SPC chart connected to MES.</li>\n          </ul>\n        </li>\n        <li><strong>Reaction Plan (OCAP):</strong> The exact step-by-step procedure the frontline operator must follow if a point goes out of control (e.g. <em>\"1. Halt CNC spindle immediately. 2. Quarantine previous 30 parts in Red Tag Bin. 3. Notify maintenance supervisor within 10 minutes\"</em>).</li>\n      </ul>\n\n      <h2>3. Standard Operating Procedures (SOPs): Visual & Living</h2>\n      <p>Traditional text-dense binders of SOPs gather dust on shelves and are ignored by frontline staff. Modern Lean Six Sigma mandates <strong>Visual One-Point Lessons (OPLs)</strong> and visual standard work combination sheets posted directly at workstations:</p>\n      <ul>\n        <li>80% visual imagery, diagrams, and photos of 'Good' vs. 'Defective' examples; 20% concise text.</li>\n        <li>Explicitly highlights the <strong>\"Why\"</strong> behind every step (e.g. <em>\"Tighten to 25 Nm to prevent hydraulic seal rupture\"</em>).</li>\n        <li>Authored collaboratively with frontline operators who execute the work daily.</li>\n      </ul>\n\n      <h2>4. Total Productive Maintenance (TPM) & Overall Equipment Effectiveness (OEE)</h2>\n      <p>Process capability is entirely dependent on machine reliability. <strong>Total Productive Maintenance (TPM)</strong>, pioneered by <strong>Seiichi Nakajima</strong>, engages all employees—from operators to maintenance engineers—in maximizing equipment effectiveness.</p>\n      \n      <p>TPM's central metric is <strong>Overall Equipment Effectiveness (OEE)</strong>, which multiplies three operational ratios:</p>\n\n      $$\text{OEE} = \text{Availability} \times \text{Performance} \times \text{Quality}$$\n\n      <table class=\"table table-bordered\">\n        <thead>\n          <tr>\n            <th>OEE Dimension</th>\n            <th>Formula & Mathematical Definition</th>\n            <th>The Two Associated \"Big Losses\"</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td><strong>Availability (A)</strong></td>\n            <td>$$\text{Availability} = \frac{\text{Operating Time}}{\text{Planned Production Time}}$$</td>\n            <td>1. Equipment Breakdowns / Unplanned Downtime.<br>2. Setup & Changeover Losses (SMED targets).</td>\n          </tr>\n          <tr>\n            <td><strong>Performance (P)</strong></td>\n            <td>$$\text{Performance} = \frac{\text{Ideal Cycle Time} \times \text{Total Count}}{\text{Operating Time}}$$</td>\n            <td>3. Minor Stoppages / Idling (sensor jams &lt; 5 min).<br>4. Reduced Speed (machine running below rated nameplate).</td>\n          </tr>\n          <tr>\n            <td><strong>Quality (Q)</strong></td>\n            <td>$$\text{Quality} = \frac{\text{Good Units Produced}}{\text{Total Units Produced}}$$</td>\n            <td>5. Startup Rejects (scrap during machine warm-up).<br>6. Production Defects & Rework.</td>\n          </tr>\n        </tbody>\n      </table>\n\n      <div class=\"callout callout-info\">\n        <h4>OEE Calculation Example</h4>\n        <p>A packaging machine runs an 8-hour shift (480 min) with 30 min planned lunch:\n          <ul>\n            <li>Planned Production Time: $480 - 30 = 450 \text{ minutes}$.</li>\n            <li>Machine experiences 45 min of unplanned breakdowns: Operating Time = $450 - 45 = 405 \text{ min}$.\n              $$\text{Availability} = \frac{405}{450} = 0.90 \text{ or } 90%$$\n            </li>\n            <li>Ideal cycle time is 0.5 min/unit. Total units produced = 700 units.\n              $$\text{Performance} = \frac{700 \times 0.5}{405} = \frac{350}{405} = 0.864 \text{ or } 86.4%$$\n            </li>\n            <li>Of 700 units produced, 35 units are defective scrap: Good Units = 665.\n              $$\text{Quality} = \frac{665}{700} = 0.95 \text{ or } 95%$$\n            </li>\n          </ul>\n          $$\text{OEE} = 0.90 \times 0.864 \times 0.95 = 0.7387 implies mathbf{73.9%}$$\n          (World-class benchmark OEE is widely recognized as $ge 85%$).\n        </p>\n      </div>\n\n      <div class=\"video-container\">\n        <iframe src=\"https://www.youtube.com/embed/n4fC5r6oE6s\" title=\"Process Control Plans and Overall Equipment Effectiveness Masterclass\" allowfullscreen></iframe>\n      </div>\n    ",
    "summary": "Construct production Control Plans linking PFMEA to frontline execution, author visual Standard Operating Procedures, and optimize equipment reliability using Total Productive Maintenance (TPM) and OEE.",
    "keyTakeaways": [
      "The Process Control Plan (PCP) is the master operational blueprint that sustains improvements long after project completion.",
      "Out-of-Control Action Plans (OCAPs) provide clear, mandatory frontline procedures when special causes trigger.",
      "Visual SOPs with photo examples of good vs. bad execution ensure repeatable human performance.",
      "Overall Equipment Effectiveness (OEE) evaluates equipment utilization: $\text{Availability} \times \text{Performance} \times \text{Quality}$.",
      "World-class manufacturing targets an OEE $ge 85%$ across all core assets."
    ]
  },
  {
    "id": "CH-SSM-028",
    "courseId": "CRS-SSM-001",
    "title": "Design for Six Sigma (DFSS) & Quality Function Deployment (QFD): House of Quality & DMADV Methodology",
    "order": 28,
    "estimatedMinutes": 65,
    "content": "\n      <h2>1. The Limits of DMAIC & The Need for DFSS</h2>\n      <p>The standard DMAIC methodology is an <em>optimization</em> tool for existing processes. However, empirical industrial research demonstrates that over <strong>70% to 80% of all quality problems and cost overruns are permanently locked into the product during the initial design phase</strong>! If a product geometry is physically flawed or software architecture is monolithic, no amount of shop-floor DMAIC Kaizen can ever achieve Six Sigma capability.</p>\n      \n      <p><strong>Design for Six Sigma (DFSS)</strong> is a proactive engineering methodology used to design brand-new products, services, and processes from day zero such that they launch with inherent $6sigma$ capability (defect rate $le 3.4$ DPMO).</p>\n\n      <h2>2. The DMADV Framework</h2>\n      <p>While DMAIC improves existing systems, DFSS projects follow the <strong>DMADV</strong> lifecycle:</p>\n\n      <table class=\"table table-bordered\">\n        <thead>\n          <tr>\n            <th>DMADV Phase</th>\n            <th>Primary Objective</th>\n            <th>Core Analytical Tools</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td><strong>Define</strong></td>\n            <td>Identify project goals, business case, customer segments, and high-level deliverables.</td>\n            <td>Project Charter, Stakeholder Analysis, Business Case, Benchmarking.</td>\n          </tr>\n          <tr>\n            <td><strong>Measure</strong></td>\n            <td>Capture Voice of the Customer (VOC) and translate into prioritized Critical to Quality (CTQ) specifications.</td>\n            <td>Kano Analysis, Customer Interviews, Focus Groups, CTQ Trees.</td>\n          </tr>\n          <tr>\n            <td><strong>Analyze</strong></td>\n            <td>Develop high-level design concepts, evaluate architectural alternatives, and select the winning concept.</td>\n            <td>Pugh Concept Selection Matrix, Functional Decomposition, Axiomatic Design, DFMEA.</td>\n          </tr>\n          <tr>\n            <td><strong>Design</strong></td>\n            <td>Engineer detailed product/process blueprints, optimize tolerances, and build prototype models.</td>\n            <td>Quality Function Deployment (QFD / House of Quality), Tolerance Stack-Up, Robust Design (Taguchi).</td>\n          </tr>\n          <tr>\n            <td><strong>Verify</strong></td>\n            <td>Build production pilot, validate that the design achieves $6sigma$ performance, and transition to operations.</td>\n            <td>Pilot production run, Capability Analysis ($C_{pk} ge 1.67$), Reliability Testing, Transition Plan.</td>\n          </tr>\n        </tbody>\n      </table>\n\n      <h2>3. Quality Function Deployment (QFD): The House of Quality</h2>\n      <p>Developed by <strong>Yoji Akao</strong> in Japan, <strong>Quality Function Deployment (QFD)</strong> is a structured matrix system that translates customer desires (WHATs) into technical engineering requirements (HOWs). Its primary architectural artifact is the <strong>House of Quality (HOQ)</strong>:</p>\n\n      <div class=\"callout callout-info\">\n        <h4>Anatomy of the House of Quality (HOQ)</h4>\n        <ol>\n          <li><strong>The Left Wall (WHATs):</strong> Customer Requirements (VOC) gathered from interviews, each assigned an importance rating ($1\text{ to }5$).</li>\n          <li><strong>The Attic / Ceiling (HOWs):</strong> Measurable Technical Engineering Descriptors designed to satisfy the customer requirements (e.g. wall thickness, tensile strength, battery capacity).</li>\n          <li><strong>The Main Living Room (Relationship Matrix):</strong> Evaluates the strength of the relationship between each Customer WHAT and Engineering HOW ($odot = 9 \text{ Strong}, \bigcirc = 3 \text{ Moderate}, \triangle = 1 \text{ Weak}, \text{Blank} = 0$).</li>\n          <li><strong>The Roof (Correlation Matrix):</strong> Identifies engineering trade-offs and conflicts between different HOWs (+ indicates positive synergy, - indicates negative trade-off, like weight vs. battery life).</li>\n          <li><strong>The Right Wall (Customer Competitive Assessment):</strong> Benchmarks your current product against key competitors across each customer requirement.</li>\n          <li><strong>The Basement (Technical Priorities & Targets):</strong> Calculates absolute and relative technical importance scores, setting target engineering specification limits.</li>\n        </ol>\n      </div>\n\n      <pre><code class=\"language-text\">Conceptual House of Quality (Automobile Door):\n                         /                        /    <-- Roof (Trade-offs: Steel Thickness vs Weight [-])\n                       /____       HOWs (Technical) | Wall Thickness | Latch Force | Acoustic Seal |\nWHATs (Customer Needs)  |     (mm)       |     (N)     |     (dB)      | Imp (1-5)\n------------------------+----------------+-------------+---------------+----------\nEasy to close           |       1        |      9      |       3       |    5\nQuiet cabin (no wind)   |       3        |      0      |       9       |    4\nSturdy / safe feel      |       9        |      3      |       3       |    4\n------------------------+----------------+-------------+---------------+----------\nTechnical Target        |     1.2 mm     |    45 N     |    < 35 dB    |\nRelative Weight         |     28.4%      |    36.2%    |     35.4%     | (Latch is #1 priority!)</code></pre>\n\n      <h2>4. The Pugh Concept Selection Matrix</h2>\n      <p>In the Analyze phase of DMADV, teams brainstorm multiple competing design concepts (e.g. Concept 1: Mechanical linkage, Concept 2: Hydraulic actuator, Concept 3: Electric solenoid). The <strong>Pugh Matrix</strong> compares each concept against a baseline standard across weighted criteria, scoring them as Better ($+$), Same ($S$), or Worse ($-$) to objectively select or synthesize the superior engineering architecture.</p>\n\n      <div class=\"video-container\">\n        <iframe src=\"https://www.youtube.com/embed/XqC__8yG27w\" title=\"Design for Six Sigma (DFSS) and Quality Function Deployment Masterclass\" allowfullscreen></iframe>\n      </div>\n    ",
    "summary": "Differentiate DFSS from DMAIC, execute the 5-phase DMADV framework, construct the House of Quality (QFD) to map VOC into engineering specifications, and apply Pugh Matrices for concept selection.",
    "keyTakeaways": [
      "70%-80% of quality issues are locked in during initial design; DFSS designs in Six Sigma capability from day zero.",
      "The DMADV lifecycle (Define, Measure, Analyze, Design, Verify) replaces DMAIC when creating new products or processes.",
      "Quality Function Deployment (QFD / House of Quality) systematically translates customer WHATs into technical HOWs.",
      "The HOQ roof identifies critical engineering trade-offs and conflicts between technical parameters.",
      "The Pugh Matrix evaluates competing conceptual designs against a baseline to synthesize superior solutions."
    ]
  },
  {
    "id": "CH-SSM-029",
    "courseId": "CRS-SSM-001",
    "title": "Lean Six Sigma in Service, Healthcare & Tech: Software DORA Metrics, Agile-Lean Synergy & ITIL Quality",
    "order": 29,
    "estimatedMinutes": 65,
    "content": "\n      <h2>1. Transcending the Factory Floor</h2>\n      <p>A prevalent myth is that Lean Six Sigma applies only to physical factories stamping metal brackets or assembling automobiles. In reality, the largest growth of Lean Six Sigma over the past two decades has occurred in <strong>knowledge work, healthcare, financial services, digital SaaS, and enterprise software engineering</strong>.</p>\n      \n      <p>The core principles are identical: in healthcare, an empty hospital bed waiting for patient admission is stagnant WIP inventory; in banking, an unapproved mortgage application is queue waste; in software development, an un-merged Git pull request waiting 5 days for review is pure non-value-added waiting waste ($Muda$)!</p>\n\n      <h2>2. Operationalizing Lean in Software & DevOps: DORA Metrics</h2>\n      <p>In digital technology and cloud platforms, the principles of flow, velocity, and zero defects are codified in the <strong>DevOps Research and Assessment (DORA) Metrics</strong>:</p>\n\n      <table class=\"table table-bordered\">\n        <thead>\n          <tr>\n            <th>DORA Metric</th>\n            <th>Lean Six Sigma Equivalent</th>\n            <th>Elite Performance Benchmark</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td><strong>Deployment Frequency (DF)</strong></td>\n            <td><strong>Batch Size Reduction:</strong> Shipping tiny single-piece changes continuously rather than massive quarterly releases.</td>\n            <td>Multiple deployments per day on demand.</td>\n          </tr>\n          <tr>\n            <td><strong>Lead Time for Changes (LTTC)</strong></td>\n            <td><strong>Process Lead Time (PLT):</strong> Time from first code commit to running in production.</td>\n            <td>Less than one hour from commit to production.</td>\n          </tr>\n          <tr>\n            <td><strong>Change Failure Rate (CFR)</strong></td>\n            <td><strong>Defect Rate / First Pass Yield:</strong> Percentage of releases requiring immediate hotfix, rollback, or patch.</td>\n            <td>Less than 5% (high-sigma stability).</td>\n          </tr>\n          <tr>\n            <td><strong>Mean Time to Restore (MTTR)</strong></td>\n            <td><strong>Andon / Jidoka Responsiveness:</strong> Time elapsed from service outage detection to full operational restoration.</td>\n            <td>Less than one hour.</td>\n          </tr>\n        </tbody>\n      </table>\n\n      <div class=\"callout callout-info\">\n        <h4>Agile and Lean: The Natural Symbiosis</h4>\n        <p>Agile software development (Scrum, Kanban) is the direct intellectual offspring of the Toyota Production System:\n          <ul>\n            <li><strong>Sprints / Iterations:</strong> Small batch sizes to minimize feedback loops and limit work in progress.</li>\n            <li><strong>WIP Limits on Kanban Boards:</strong> Directly enforcing Little's Law to maximize process velocity.</li>\n            <li><strong>Sprint Retrospectives:</strong> Weekly Kaizen reflection rituals designed to eliminate impediments.</li>\n            <li><strong>Automated CI/CD Testing:</strong> Digital Poka-Yoke and Jidoka—automatically halting the build when a unit test fails.</li>\n          </ul>\n        </p>\n      </div>\n\n      <h2>3. Lean Six Sigma in Healthcare Operations</h2>\n      <p>In healthcare, operational defects are not merely financial losses; they are life-or-death events. Hospitals apply Lean Six Sigma to:</p>\n      <ul>\n        <li><strong>Emergency Department (ED) Throughput:</strong> Value Stream Mapping patient arrival, triage, bed allocation, and discharge to reduce Door-to-Doctor time from 90 minutes to under 20 minutes.</li>\n        <li><strong>Medication Administration Errors:</strong> Barcode scanning at patient bedside acting as a Poka-Yoke control, eliminating medication mismatch errors.</li>\n        <li><strong>Operating Room (OR) Turnover:</strong> Applying SMED principles to clean, sanitize, and retool surgical suites between operations, increasing daily surgical capacity by 25%.</li>\n      </ul>\n\n      <h2>4. ITIL Service Management & Process Capability</h2>\n      <p>In enterprise IT service operations (ITIL v4), incident management queues and change advisory boards (CABs) are analyzed using Six Sigma capability indices:\n        <ul>\n          <li>Measuring Mean Time to Resolve (MTTR) against SLA limits using Weibull non-normal distribution models.</li>\n          <li>Deploying $I$-$MR$ control charts on daily service desk ticket volumes to distinguish routine seasonal variations from cyber incidents or major system outages.</li>\n        </ul>\n      </p>\n\n      <div class=\"video-container\">\n        <iframe src=\"https://www.youtube.com/embed/8t_1GkS4q-c\" title=\"Lean Six Sigma in Service, Healthcare and Tech Masterclass\" allowfullscreen></iframe>\n      </div>\n    ",
    "summary": "Translate Lean Six Sigma principles into modern service, healthcare, and digital technology environments, map DevOps DORA metrics to Lean flow, and integrate Agile practices with statistical quality control.",
    "keyTakeaways": [
      "Lean Six Sigma applies universally to knowledge work, services, banking, and healthcare.",
      "DevOps DORA metrics represent modern digital Lean: small batch sizes, short lead times, and low change failure rates.",
      "Un-merged pull requests and un-admitted patients represent WIP inventory waste.",
      "Automated CI/CD pipelines function as digital Poka-Yoke error-proofing and Jidoka line stops.",
      "Healthcare leverages SMED for operating room changeovers and Poka-Yoke barcode scanning for medication safety."
    ]
  },
  {
    "id": "CH-SSM-030",
    "courseId": "CRS-SSM-001",
    "title": "Enterprise Capstone Project: End-to-End Black Belt Operational Transformation & C-Suite Executive Tollgate Presentation",
    "order": 30,
    "estimatedMinutes": 70,
    "content": "\n      <h2>1. The Final Capstone Challenge: Project TitanOps</h2>\n      <p>As the Senior Operations Transformation Manager for <strong>Titan Logistics & Fulfillment Global</strong>, you are appointed Lead Black Belt for the flagship enterprise initiative: <strong>Project TitanOps</strong>. Titan operates 14 regional automated fulfillment hubs processing over 2.5 million customer orders daily across North America and Europe.</p>\n\n      <h2>2. The Strategic Crisis</h2>\n      <p>Over the past four quarters, customer order fulfillment cycle time has degraded from a historical baseline of 1.8 hours to an average of <strong>4.6 hours ($sigma = 1.6\text{ hours}$)</strong> against a strict customer SLA of 2.5 hours. Furthermore, order picking accuracy has deteriorated to <strong>96.2% yield (38,000 DPMO - a poor $3.3sigma$ capability)</strong>.</p>\n      \n      <p>The business consequences are severe:</p>\n      <ul>\n        <li>Monthly customer churn due to late and incorrect deliveries increased by 14%.</li>\n        <li>Expedited freight surcharges, return shipping costs, and customer appeasement credits exceed <strong>$4.2M per quarter</strong> in audited Cost of Poor Quality (COPQ).</li>\n        <li>The enterprise Board of Directors has conditioned executive bonuses on restoring operations to $C_{pk} ge 1.40$ within 6 months.</li>\n      </ul>\n\n      <h2>3. The DMAIC Operational Blueprint</h2>\n      <p>Your capstone execution synthesizes the entire Lean Six Sigma body of knowledge across all five DMAIC phases:</p>\n\n      <table class=\"table table-bordered\">\n        <thead>\n          <tr>\n            <th>DMAIC Phase</th>\n            <th>TitanOps Execution Blueprint</th>\n            <th>Verified Operational Artifacts</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td><strong>Define</strong></td>\n            <td>Charter approved with $12M annualized savings target; VOC to CTQ Tree mapped; SIPOC boundaries locked from order drop to courier scan.</td>\n            <td>Signed Project Charter, CTQ Tree ($USL = 2.5\text{ hrs}$), Macro SIPOC.</td>\n          </tr>\n          <tr>\n            <td><strong>Measure</strong></td>\n            <td>Gage R&R conducted on automated barcode optical sorters (%GRR = 6.2%, $ndc = 8$); baseline $C_{pk} = 0.42$; Current-State VSM reveals 88% waiting waste in staging buffers.</td>\n            <td>Certified MSA, Baseline Capability Report, Current-State VSM ($PCE = 3.8%$).</td>\n          </tr>\n          <tr>\n            <td><strong>Analyze</strong></td>\n            <td>Fishbone 6M mapped; 5 Whys drilled to sorter sensor blindness; Two-Way ANOVA and Multiple Regression prove pick-slot layout and scanner latency drive 78% of delay ($R^2_{\text{adj}} = 76.4%$).</td>\n            <td>Cause-and-Effect Matrix, Prioritized PFMEA, ANOVA ($p < 0.001$), Validated Regression Equation.</td>\n          </tr>\n          <tr>\n            <td><strong>Improve</strong></td>\n            <td>Full Factorial DOE optimizes sorter belt speed and divert timing; U-shaped pick cells implemented; 5S shadow boards installed; Contact Poka-Yoke weight-check scales block mis-picked boxes.</td>\n            <td>$2^3$ Factorial Analysis, Yamazumi Line Balance, SMED tool changeover, Pilot Test ($C_{pk}$ jumps to 1.52).</td>\n          </tr>\n          <tr>\n            <td><strong>Control</strong></td>\n            <td>Real-time $\bar{X}$-$R$ control charts deployed on pick times; OCAP documented; TPM autonomous maintenance schedule assigned; process officially transitioned to warehouse director.</td>\n            <td>Signed Control Plan, Live SPC Charts with Nelson Rule alerts, Audited Finance P&L Validation ($14.1M Hard Savings!).</td>\n          </tr>\n        </tbody>\n      </table>\n\n      <h2>4. The C-Suite Executive Tollgate Presentation</h2>\n      <p>The true capstone of a Black Belt leader is presenting the final Control Phase Tollgate to the Chief Executive Officer (CEO), Chief Financial Officer (CFO), and Chief Operating Officer (COO). Senior executives do not read 200-page statistical appendices. Your presentation must be structured into a compelling <strong>10-Slide Executive A3 Storyboard</strong>:</p>\n\n      <pre><code class=\"language-markdown\"># Executive A3 Summary: Project TitanOps\n\n## 1. Executive Summary & Financial Impact\n* **Audited Annual Hard Cost Savings:** $14,120,000 (verified by Corporate Controller).\n* **Fulfillment Lead Time:** Slashed from 4.6 hours to 1.4 hours (69.5% reduction).\n* **Quality Capability:** $C_{pk}$ improved from 0.42 ($3.3sigma$) to 1.52 ($4.6sigma$).\n* **Defect Rate:** Plummeted from 38,000 DPMO to 410 DPMO (98.9% defect elimination!).\n\n## 2. Before vs. After Process Capability\n* **Baseline (Measure):** Mean = 4.6h, $sigma = 1.6\text{h}$, $C_p = 0.52$, $C_{pk} = 0.42$, SLA Breaches = 28.4%.\n* **Target State (Control):** Mean = 1.4h, $sigma = 0.24\text{h}$, $C_p = 1.74$, $C_{pk} = 1.52$, SLA Breaches = 0.02%.\n\n## 3. Key Lean Six Sigma Innovations Implemented\n1. **Dynamic Poka-Yoke Weight Scales:** Integrated in-line scales that verify box weight against calculated SKU weights, blocking mis-picked boxes with zero human inspection.\n2. **U-Shaped Continuous Flow Workcells:** Reorganized fulfillment bays into 12 balanced cells, slashing operator travel distance by 6.2 miles per shift.\n3. **Automated SPC Telemetry:** Cloud-connected Shewhart control charts with real-time Nelson Rule 1 & 2 alerts on warehouse operational dashboards.\n\n## 4. Governance & Sustainment\n* Full sign-off and process handover executed with VP of Global Logistics.\n* Bi-weekly 5S radar audits and monthly OEE equipment tracking institutionalized.</code></pre>\n\n      <div class=\"video-container\">\n        <iframe src=\"https://www.youtube.com/embed/PjE2e6f4_r8\" title=\"Lean Six Sigma Black Belt Capstone and Executive Presentation\" allowfullscreen></iframe>\n      </div>\n\n      <h2>5. The Legacy of Operational Excellence</h2>\n      <p>Congratulations! You have mastered the entire operational spectrum—from scientific management to advanced statistical hypothesis testing, experimental design, cellular flow, and executive governance. As a Lean Six Sigma leader, you now possess the rare ability to see waste where others see routine, eliminate variation through empirical science, and transform organizations into world-class operational powerhouses.</p>\n    ",
    "summary": "Execute the comprehensive Black Belt Capstone Project (Project TitanOps), synthesizing all DMAIC phases, statistical analyses, Lean flow redesigns, and deliver an executive C-suite A3 presentation.",
    "keyTakeaways": [
      "Project TitanOps synthesizes the complete Lean Six Sigma toolkit in a multi-million-dollar global fulfillment turnaround.",
      "The Measure phase establishes certified MSA (%GRR &lt; 10%) and baseline capability ($C_{pk} = 0.42$).",
      "Analyze combines qualitative fishbone diagrams with rigorous inferential ANOVA and multiple regression ($R^2_{\text{adj}} > 75%$).",
      "Improve leverages factorial DOE, cellular U-shaped flow, and Poka-Yoke error-proofing to achieve $C_{pk} ge 1.50$.",
      "Control locks in $14.1M in audited hard savings using SPC control plans, OEE metrics, and an executive A3 storyboard."
    ]
  }
],
  assessments: [
  {
    "id": "ASM-SSM-025",
    "courseId": "CRS-SSM-001",
    "chapterId": "CH-SSM-025",
    "title": "Assessment: Statistical Process Control (SPC) Architecture",
    "passingScore": 70,
    "questions": [
      {
        "id": "Q-SSM-241",
        "question": "Why should Customer Specification Limits (USL / LSL) NEVER be plotted on a Shewhart Control Chart?",
        "options": [
          "Customers forbid sharing their specifications",
          "Control charts evaluate the Voice of the Process (VOP) calculated strictly from 3-sigma process data; conflating them with customer specifications (VOC) causes tampering and invalidates statistical signal detection",
          "Calculators cannot handle specifications",
          "Specification limits make control charts run slower"
        ],
        "correctAnswer": 1,
        "explanation": "Control limits represent the natural Voice of the Process ($pm 3sigma$). Mixing customer specification limits onto control charts distorts signal detection and leads to improper machine tampering."
      },
      {
        "id": "Q-SSM-242",
        "question": "Which control chart pair should be selected when monitoring a continuous variable where subgroup sample size is n = 1 (individual observations)?",
        "options": [
          "X-bar and R chart",
          "I-MR Chart (Individuals and Moving Range)",
          "p-Chart",
          "c-Chart"
        ],
        "correctAnswer": 1,
        "explanation": "When $n = 1$ (e.g. daily chemical tank readings or monthly metrics), the $I$-$MR$ (Individuals and Moving Range) chart is the mandatory choice."
      },
      {
        "id": "Q-SSM-243",
        "question": "What control chart should be chosen to monitor the proportion of defective items from a process where the daily sample size varies from day to day?",
        "options": [
          "np-Chart",
          "p-Chart (Proportion Defective with variable control limits)",
          "c-Chart",
          "X-bar and S chart"
        ],
        "correctAnswer": 1,
        "explanation": "The $p$-chart monitors binomial proportion defective when sample sizes vary across subgroups, resulting in stepped control limits."
      },
      {
        "id": "Q-SSM-244",
        "question": "What control chart pair is optimal for monitoring continuous variables with small subgroups (e.g. n = 4 or 5)?",
        "options": [
          "X-bar and R chart (Mean and Range)",
          "p-Chart",
          "u-Chart",
          "I-MR Chart"
        ],
        "correctAnswer": 0,
        "explanation": "The $\bar{X}$-$R$ chart is the classic manufacturing standard for small subgroups ($2 le n le 9$), tracking subgroup mean and subgroup range."
      },
      {
        "id": "Q-SSM-245",
        "question": "What mathematical distance separates the Center Line from the Upper Control Limit (UCL) on a standard Shewhart control chart?",
        "options": [
          "1 standard deviation",
          "Exactly 3 standard errors of the statistic (+3 sigma)",
          "10 millimeters",
          "The distance to the customer USL"
        ],
        "correctAnswer": 1,
        "explanation": "Shewhart control limits are set at exactly $pm 3sigma_{\bar{X}}$ (3 standard errors) from the center line."
      },
      {
        "id": "Q-SSM-246",
        "question": "When monitoring the count of defects on a product where the opportunity area is constant (e.g. scratches on a 1 square meter metal sheet), which chart is used?",
        "options": [
          "c-Chart (Poisson count of defects)",
          "p-Chart",
          "I-MR Chart",
          "np-Chart"
        ],
        "correctAnswer": 0,
        "explanation": "The $c$-chart monitors Poisson counts of defects across a constant area, volume, or unit of opportunity."
      },
      {
        "id": "Q-SSM-247",
        "question": "Why does an X-bar and S chart replace the X-bar and R chart when subgroup size is large (n >= 10)?",
        "options": [
          "The Range (R) becomes an inefficient and statistically biased estimator of dispersion for large samples; sample standard deviation (S) provides superior precision",
          "Range formulas cannot count past 10",
          "S-charts take less ink to print",
          "Automated software cannot compute range"
        ],
        "correctAnswer": 0,
        "explanation": "For large subgroups ($n ge 10$), extreme outliers distort the simple Range ($X_{max} - X_{min}$). Sample standard deviation ($s$) uses all observations and is far more efficient."
      },
      {
        "id": "Q-SSM-248",
        "question": "What is an Out-of-Control Action Plan (OCAP)?",
        "options": [
          "A document filed when declaring corporate bankruptcy",
          "A documented, step-by-step standard operating guide specifying the exact actions, notifications, and containment an operator must execute when a control chart signals an out-of-control point",
          "A marketing strategy for new products",
          "A software code repository"
        ],
        "correctAnswer": 1,
        "explanation": "An OCAP provides frontline personnel with clear, mandatory procedures to contain parts, investigate root causes, and notify supervisors when an SPC alarm occurs."
      },
      {
        "id": "Q-SSM-249",
        "question": "What discrete distribution forms the mathematical foundation of the p-chart and np-chart?",
        "options": [
          "Poisson distribution",
          "Binomial distribution (Pass/Fail, Defective/Good)",
          "Normal distribution",
          "Weibull distribution"
        ],
        "correctAnswer": 1,
        "explanation": "$p$ and $np$ charts monitor binary attribute data (defective vs. non-defective), governed by the Binomial probability distribution."
      },
      {
        "id": "Q-SSM-250",
        "question": "Who is credited with inventing Statistical Process Control and the control chart at Bell Labs in the 1920s?",
        "options": [
          "Walter A. Shewhart",
          "Steve Jobs",
          "Bill Gates",
          "Henry Ford"
        ],
        "correctAnswer": 0,
        "explanation": "Dr. Walter A. Shewhart invented the statistical control chart in 1924, establishing the foundation of modern statistical quality control."
      }
    ]
  },
  {
    "id": "ASM-SSM-026",
    "courseId": "CRS-SSM-001",
    "chapterId": "CH-SSM-026",
    "title": "Assessment: Control Chart Interpretation & Nelson Rules",
    "passingScore": 70,
    "questions": [
      {
        "id": "Q-SSM-251",
        "question": "In Deming's Funnel Experiment, what happens when an operator constantly adjusts a machine in response to routine Common Cause variation?",
        "options": [
          "Variation is reduced to zero",
          "The process becomes unstable, and total variation increases by 200% to 300% (the Tampering Trap)",
          "The machine runs twice as fast",
          "Product quality improves"
        ],
        "correctAnswer": 1,
        "explanation": "Tampering—adjusting a stable system in response to random common cause noise—injects additional artificial variance, making performance significantly worse."
      },
      {
        "id": "Q-SSM-252",
        "question": "What visual pattern triggers Nelson Rule 1 for out-of-control detection?",
        "options": [
          "A point exactly on the center line",
          "1 single point falling beyond the Upper (UCL) or Lower (LCL) Control Limit (> 3 sigma)",
          "5 points in a row increasing",
          "A point colored red"
        ],
        "correctAnswer": 1,
        "explanation": "Nelson Rule 1 triggers when any single point falls outside the 3-sigma control limits ($p = 0.0027$), indicating a severe special cause disruption."
      },
      {
        "id": "Q-SSM-253",
        "question": "What does Nelson Rule 2 detect on a control chart?",
        "options": [
          "9 consecutive points falling on the same side of the Center Line, indicating a sustained shift in the process average",
          "The machine running out of oil",
          "A single outlier",
          "Two operators arguing"
        ],
        "correctAnswer": 0,
        "explanation": "Nelson Rule 2 triggers when 9 consecutive points lie above (or below) the center line, signaling a statistically significant shift in the process mean."
      },
      {
        "id": "Q-SSM-254",
        "question": "What physical operational condition typically causes Nelson Rule 3 (6 consecutive points steadily increasing or decreasing)?",
        "options": [
          "A sudden power outage",
          "Progressive continuous wear (e.g. cutting tool wear, chemical bath evaporation, or filter clogging)",
          "A brand new machine being installed",
          "The weekend holiday"
        ],
        "correctAnswer": 1,
        "explanation": "Steady monotonic drift across 6 consecutive points reflects continuous wear-and-tear, thermal expansion, or reagent depletion."
      },
      {
        "id": "Q-SSM-255",
        "question": "What does Nelson Rule 7 (15 consecutive points falling within Zone C, +/- 1 sigma of the center line) indicate?",
        "options": [
          "The process is operating with world-class capability",
          "Stratification or artificial data clustering: control limits were miscalculated, or two subgroups with different means were averaged together, creating artificially suppressed variance",
          "The operator is working too quickly",
          "The measurement tool is broken"
        ],
        "correctAnswer": 1,
        "explanation": "Rule 7 is the 'too good to be true' rule. Points hugging the center line indicate that subgroups are mixing different populations or control limits are calculated incorrectly."
      },
      {
        "id": "Q-SSM-256",
        "question": "What physical phenomenon causes Nelson Rule 4 (14 consecutive points alternating strictly up and down in a saw-tooth pattern)?",
        "options": [
          "Random chance",
          "A systematic alternating source, such as combining output from two different mold cavities, two spindles, or two alternating inspectors",
          "High room temperature",
          "Normal seasonal changes"
        ],
        "correctAnswer": 1,
        "explanation": "Saw-tooth alternating patterns point to two alternating streams (e.g. Spindle A vs. Spindle B) being sampled together."
      },
      {
        "id": "Q-SSM-257",
        "question": "In standard control chart zone analysis, what is 'Zone A'?",
        "options": [
          "The zone between 0 and 1 sigma",
          "The outer band between 2 sigma and 3 sigma from the Center Line",
          "The region outside the control limits",
          "The administrative office"
        ],
        "correctAnswer": 1,
        "explanation": "Zone A is the outermost zone, spanning between $2sigma$ and $3sigma$ adjacent to the control limits."
      },
      {
        "id": "Q-SSM-258",
        "question": "What does Nelson Rule 5 evaluate?",
        "options": [
          "2 out of 3 consecutive points falling in Zone A (> 2 sigma) on the same side of the center line",
          "The speed of the conveyor belt",
          "The price of raw materials",
          "The temperature of the factory"
        ],
        "correctAnswer": 0,
        "explanation": "Rule 5 provides an early warning when 2 out of 3 consecutive points land in Zone A ($> 2sigma$), signaling an impending out-of-control excursion."
      },
      {
        "id": "Q-SSM-259",
        "question": "What is an 'Assignable Cause' in Statistical Process Control?",
        "options": [
          "A task assigned to an intern",
          "A specific, identifiable external factor (special cause) that introduced unexpected variation into the process and can be removed",
          "A normal daily fluctuation",
          "A line item on a balance sheet"
        ],
        "correctAnswer": 1,
        "explanation": "An assignable cause (special cause) is an identifiable root cause (e.g., broken sensor, bad batch) that temporarily destabilizes a process."
      },
      {
        "id": "Q-SSM-260",
        "question": "If all points on a control chart fall randomly between UCL and LCL with zero Nelson Rule violations, what can the manager conclude?",
        "options": [
          "The process has zero defects",
          "The process is in a state of Statistical Control, governed solely by predictable Common Cause variation",
          "The process meets all customer specifications",
          "The control chart can be deleted"
        ],
        "correctAnswer": 1,
        "explanation": "A chart with zero rule triggers is in statistical control. Note: this does NOT guarantee zero defects—only that process variation is stable and predictable!"
      }
    ]
  },
  {
    "id": "ASM-SSM-027",
    "courseId": "CRS-SSM-001",
    "chapterId": "CH-SSM-027",
    "title": "Assessment: Process Control Plans, SOPs & TPM (OEE)",
    "passingScore": 70,
    "questions": [
      {
        "id": "Q-SSM-261",
        "question": "What are the three components multiplied together to calculate Overall Equipment Effectiveness (OEE)?",
        "options": [
          "Cost, Volume, Profit",
          "Availability * Performance * Quality",
          "Speed * Maintenance * Labor",
          "Uptime * Safety * Scrap"
        ],
        "correctAnswer": 1,
        "explanation": "$\text{OEE} = \text{Availability} \times \text{Performance} \times \text{Quality}$, comprehensively quantifying equipment productivity."
      },
      {
        "id": "Q-SSM-262",
        "question": "What is widely recognized as the global benchmark standard for 'World-Class' OEE in discrete manufacturing?",
        "options": [
          "50%",
          "85% or higher (typically ~90% Availability, 95% Performance, 99.9% Quality)",
          "100%",
          "70%"
        ],
        "correctAnswer": 1,
        "explanation": "An OEE of 85% or higher is recognized globally as world-class manufacturing excellence."
      },
      {
        "id": "Q-SSM-263",
        "question": "In OEE calculation, what causes an 'Availability' loss?",
        "options": [
          "Equipment breakdowns and changeover/setup downtime",
          "Minor stoppages lasting 10 seconds",
          "Parts produced with dimensional scratches",
          "The machine running 5% slower than nameplate speed"
        ],
        "correctAnswer": 0,
        "explanation": "Availability losses are driven by unplanned breakdowns and planned changeover/setup downtime."
      },
      {
        "id": "Q-SSM-264",
        "question": "A CNC lathe has 400 minutes of operating time. Ideal cycle time is 1.0 min/part. It produces 340 total parts. What is the Performance ratio?",
        "options": [
          "100%",
          "85.0% ((340 * 1.0) / 400 = 0.85)",
          "50.0%",
          "12.0%"
        ],
        "correctAnswer": 1,
        "explanation": "$\text{Performance} = (\text{Ideal Cycle Time} \times \text{Total Count}) / \text{Operating Time} = (1.0 \times 340) / 400 = 0.85 \text{ or } 85.0%$."
      },
      {
        "id": "Q-SSM-265",
        "question": "What is the primary operational purpose of a Process Control Plan (PCP)?",
        "options": [
          "To serve as an invoice for customer billing",
          "To serve as the definitive operational document specifying how each critical parameter (X) and product attribute (Y) is monitored, inspected, and reacted to on the floor",
          "To schedule employee vacations",
          "To design marketing campaigns"
        ],
        "correctAnswer": 1,
        "explanation": "The Control Plan translates PFMEA findings into standardized floor-level inspection frequencies, gages, SPC methods, and reaction plans."
      },
      {
        "id": "Q-SSM-266",
        "question": "What is 'Autonomous Maintenance' (Jishu Hozen) in Total Productive Maintenance (TPM)?",
        "options": [
          "Robots that repair themselves",
          "Empowering machine operators to perform daily routine cleaning, lubrication, visual inspections, and minor adjustments rather than relying solely on maintenance technicians",
          "Letting machines run until they explode",
          "Outsourcing all maintenance to third parties"
        ],
        "correctAnswer": 1,
        "explanation": "Autonomous Maintenance trains and empowers operators to take daily ownership of their machines (cleaning, lubrication, inspection), catching minor wear early."
      },
      {
        "id": "Q-SSM-267",
        "question": "What makes a Visual One-Point Lesson (OPL) superior to traditional text-dense SOP manuals?",
        "options": [
          "It uses 80% visual photos and diagrams contrasting 'Good' vs. 'Defective' examples, enabling operators to understand standard work in under 60 seconds",
          "It takes up less space in filing cabinets",
          "It is written in Latin",
          "It does not require managerial approval"
        ],
        "correctAnswer": 0,
        "explanation": "Visual One-Point Lessons use clear photos and diagrams to convey standard methods instantly, eliminating ambiguity."
      },
      {
        "id": "Q-SSM-268",
        "question": "In an OEE breakdown, what category does 'Startup Scrap' (defective parts produced while a stamping press warms up) belong to?",
        "options": [
          "Availability Loss",
          "Performance Loss",
          "Quality Loss",
          "Maintenance Loss"
        ],
        "correctAnswer": 2,
        "explanation": "Any defective unit, whether produced during steady state or warmup, reduces the Quality ratio ($Q = \text{Good Units} / \text{Total Units}$)."
      },
      {
        "id": "Q-SSM-269",
        "question": "What is the reaction plan column in a Control Plan used for?",
        "options": [
          "Listing the customer's phone number",
          "Dictating the exact, non-negotiable containment and remediation steps an operator must take when an out-of-control condition or defect occurs",
          "Writing notes about lunch plans",
          "Recording the operator's signature"
        ],
        "correctAnswer": 1,
        "explanation": "The Reaction Plan outlines immediate containment (quarantine, stop line, notify maintenance) when a process parameter violates control limits."
      },
      {
        "id": "Q-SSM-270",
        "question": "What are the 'Six Big Losses' in TPM equipment management?",
        "options": [
          "Six financial quarters with negative earnings",
          "Breakdowns, Setup/Adjustments, Small Stops, Reduced Speed, Startup Rejects, and Production Defects",
          "Six employees resigning at once",
          "Six software viruses"
        ],
        "correctAnswer": 1,
        "explanation": "TPM categorizes equipment waste into the Six Big Losses across Availability (2), Performance (2), and Quality (2)."
      }
    ]
  },
  {
    "id": "ASM-SSM-028",
    "courseId": "CRS-SSM-001",
    "chapterId": "CH-SSM-028",
    "title": "Assessment: Design for Six Sigma (DFSS) & Quality Function Deployment",
    "passingScore": 70,
    "questions": [
      {
        "id": "Q-SSM-271",
        "question": "What percentage of product lifecycle costs and quality defects are typically locked in during the initial design phase?",
        "options": [
          "Less than 5%",
          "Between 70% and 80%",
          "Exactly 50%",
          "100%"
        ],
        "correctAnswer": 1,
        "explanation": "Studies prove that 70% to 80% of product cost, manufacturability, and failure risks are determined during initial engineering design."
      },
      {
        "id": "Q-SSM-272",
        "question": "What are the five phases of the DMADV methodology used in Design for Six Sigma?",
        "options": [
          "Define, Measure, Analyze, Design, Verify",
          "Define, Measure, Analyze, Improve, Control",
          "Design, Manufacture, Assemble, Deliver, Validate",
          "Draft, Model, Audit, Deploy, Value"
        ],
        "correctAnswer": 0,
        "explanation": "DMADV stands for Define, Measure, Analyze, Design, and Verify—the standard lifecycle for developing new products and processes with $6sigma$ quality."
      },
      {
        "id": "Q-SSM-273",
        "question": "In the Quality Function Deployment (QFD) House of Quality, what is represented on the 'Roof' of the house?",
        "options": [
          "The company brand name",
          "The correlation matrix evaluating trade-offs and synergies between different technical engineering parameters (HOWs)",
          "Customer satisfaction scores",
          "The retail price of the product"
        ],
        "correctAnswer": 1,
        "explanation": "The roof evaluates interactions between engineering requirements (e.g. increasing battery capacity improves runtime [+] but increases vehicle weight [-])."
      },
      {
        "id": "Q-SSM-274",
        "question": "What is the primary purpose of a Pugh Concept Selection Matrix in the Analyze phase of DMADV?",
        "options": [
          "Calculating machine horsepower",
          "Objectively comparing multiple competing conceptual designs against a baseline standard across weighted criteria to select or synthesize the superior architecture",
          "Auditing supplier invoices",
          "Writing Python code"
        ],
        "correctAnswer": 1,
        "explanation": "The Pugh Matrix evaluates alternative design concepts against a datum across weighted criteria (+, S, -) to choose the best concept."
      },
      {
        "id": "Q-SSM-275",
        "question": "What does the 'Living Room' (Relationship Matrix) of the House of Quality evaluate?",
        "options": [
          "Where employees take coffee breaks",
          "The strength of the relationship between Customer Requirements (WHATs) and Engineering Technical Specifications (HOWs)",
          "The physical dimensions of the factory floor",
          "The relationship between managers and supervisors"
        ],
        "correctAnswer": 1,
        "explanation": "The core grid maps how effectively each engineering parameter (HOW) addresses and satisfies each customer need (WHAT)."
      },
      {
        "id": "Q-SSM-276",
        "question": "What capability threshold (Cpk) is typically targeted for new products during the Verify phase of DFSS before release to mass manufacturing?",
        "options": [
          "Cpk >= 1.00",
          "Cpk >= 1.67 (or Cpk >= 2.00 for critical characteristics)",
          "Cpk = 0.50",
          "Cpk does not apply to new products"
        ],
        "correctAnswer": 1,
        "explanation": "DFSS targets initial pilot capability $C_{pk} ge 1.67$ ($5sigma$) or $2.0$ ($6sigma$) to absorb long-term manufacturing drift without customer defects."
      },
      {
        "id": "Q-SSM-277",
        "question": "What is 'Robust Parameter Design' pioneered by Genichi Taguchi in DFSS?",
        "options": [
          "Designing products with heavy steel",
          "Selecting parameter setpoints that make the product's performance insensitive (robust) to environmental noise, component variation, and customer wear without adding cost",
          "Testing products until they break",
          "Using expensive high-precision components for everything"
        ],
        "correctAnswer": 1,
        "explanation": "Taguchi's robust design optimizes nominal parameter setpoints to minimize sensitivity to noise factors (temperature, humidity, voltage swings) at low cost."
      },
      {
        "id": "Q-SSM-278",
        "question": "In QFD, what are the 'WHATs' on the left wall?",
        "options": [
          "The Voice of the Customer (customer desires, expectations, and requirements)",
          "The machine part numbers",
          "The raw material costs",
          "The software bug reports"
        ],
        "correctAnswer": 0,
        "explanation": "The left wall lists Customer Requirements (VOC)—the functional and qualitative attributes demanded by end-users."
      },
      {
        "id": "Q-SSM-279",
        "question": "What is Tolerance Stack-Up Analysis in the Design phase of DFSS?",
        "options": [
          "Stacking shipping boxes in a warehouse",
          "Calculating the cumulative effect of manufacturing part dimensional variations across an assembly to ensure mating components fit together with zero interference",
          "Measuring employee patience",
          "Balancing financial ledgers"
        ],
        "correctAnswer": 1,
        "explanation": "Tolerance stack-up calculates statistical variation accumulation across mating parts (Worst-Case or Root-Sum-Square) to ensure proper assembly fit."
      },
      {
        "id": "Q-SSM-280",
        "question": "When should an enterprise transition from DMAIC to DMADV?",
        "options": [
          "When the team runs out of budget",
          "When an existing process has reached its theoretical physical entitlement limit and incremental optimization can no longer satisfy customer demand",
          "When the Black Belt gets tired of DMAIC",
          "Only when building airplanes"
        ],
        "correctAnswer": 1,
        "explanation": "When an existing process hits its technological entitlement boundary, incremental DMAIC hits diminishing returns; the process must be completely redesigned via DMADV."
      }
    ]
  },
  {
    "id": "ASM-SSM-029",
    "courseId": "CRS-SSM-001",
    "chapterId": "CH-SSM-029",
    "title": "Assessment: Lean Six Sigma in Service, Healthcare & Tech",
    "passingScore": 70,
    "questions": [
      {
        "id": "Q-SSM-281",
        "question": "In digital software operations and DevOps, what does the DORA metric 'Deployment Frequency' correspond to in Lean principles?",
        "options": [
          "High batch sizes",
          "Batch size reduction: shipping small, continuous single-piece work units rather than massive risky quarterly releases",
          "Overtime hours worked by software engineers",
          "The size of the software code repository"
        ],
        "correctAnswer": 1,
        "explanation": "Deployment frequency reflects small batch flow: releasing small, validated increments rapidly rather than accumulating massive risky batches."
      },
      {
        "id": "Q-SSM-282",
        "question": "How is an un-merged pull request waiting 5 days for code review classified in Lean software development?",
        "options": [
          "Value-Added activity",
          "Non-Value-Added Waiting and Inventory Waste (WIP inventory)",
          "An essential architectural milestone",
          "A Poka-Yoke control"
        ],
        "correctAnswer": 1,
        "explanation": "Code sitting in an un-merged branch is stagnant inventory waiting in a queue, depreciating in value and risking merge conflicts."
      },
      {
        "id": "Q-SSM-283",
        "question": "How does an automated CI/CD pipeline represent the Lean principles of Poka-Yoke and Jidoka?",
        "options": [
          "It automatically hires software developers",
          "It automatically runs unit tests and linters, halting the deployment pipeline immediately (Jidoka) and preventing defective code from reaching production (Poka-Yoke)",
          "It sends emails to executives",
          "It deletes legacy databases"
        ],
        "correctAnswer": 1,
        "explanation": "Automated test gates fail fast and block deployment when defects occur, functioning as modern digital autonomation (Jidoka) and error proofing (Poka-Yoke)."
      },
      {
        "id": "Q-SSM-284",
        "question": "In hospital healthcare operations, how is the SMED (Single-Minute Exchange of Die) methodology applied?",
        "options": [
          "By speeding up surgical operations",
          "By streamlining and pre-staging Operating Room (OR) turnover—cleaning, sterilizing, and prepping equipment between surgeries—to increase surgical capacity",
          "By discharging patients early",
          "By eliminating nurses"
        ],
        "correctAnswer": 1,
        "explanation": "Hospitals apply SMED to operating room turnover, separating internal sterile tasks from external room prep to maximize surgical utilization."
      },
      {
        "id": "Q-SSM-285",
        "question": "What is the DORA metric 'Lead Time for Changes' equivalent to in Lean Six Sigma?",
        "options": [
          "Process Lead Time (PLT): the elapsed time from code commit to running live in production",
          "Machine changeover time",
          "Customer survey response time",
          "The time required to hire an engineer"
        ],
        "correctAnswer": 0,
        "explanation": "Lead Time for Changes measures the total elapsed time for a work unit to travel through the value stream from inception to production."
      },
      {
        "id": "Q-SSM-286",
        "question": "What is an example of a Poka-Yoke Control mechanism in modern healthcare?",
        "options": [
          "Posting warning signs in patient rooms",
          "Barcode scanning of patient wristbands and medication vials that physically blocks administration if patient ID, medication, or dosage does not match the electronic medical record",
          "Telling nurses to double-check pills",
          "Filing incident reports after errors occur"
        ],
        "correctAnswer": 1,
        "explanation": "Bedside barcode scanning verifies medication, dose, and patient identity before administration, physically preventing medication errors."
      },
      {
        "id": "Q-SSM-287",
        "question": "In Agile Scrum workflows, what ceremony directly reflects the Lean 'Hansei' (Kaizen reflection) ritual?",
        "options": [
          "Daily Standup",
          "Sprint Retrospective (evaluating what went well, what went wrong, and committing to immediate process improvements)",
          "Sprint Planning",
          "Product Demo"
        ],
        "correctAnswer": 1,
        "explanation": "The Sprint Retrospective is a dedicated Kaizen event where the squad inspects their process and commits to actionable improvements."
      },
      {
        "id": "Q-SSM-288",
        "question": "What does an empty hospital bed waiting for an admitted patient represent in healthcare Lean accounting?",
        "options": [
          "A successful hospital",
          "Stagnant Work-in-Progress (WIP) and capacity waste due to process handoff delays between emergency triage, environmental cleaning, and inpatient wards",
          "A hospital that has zero patients",
          "An FDA compliance requirement"
        ],
        "correctAnswer": 1,
        "explanation": "Delays in cleaning and prepping beds create bottlenecks that back up the emergency room, representing wasted bed capacity and lead time delay."
      },
      {
        "id": "Q-SSM-289",
        "question": "What does the DORA metric 'Change Failure Rate' (CFR) measure?",
        "options": [
          "The percentage of code written by junior developers",
          "The percentage of deployments to production that cause an incident, degradation, or require an immediate hotfix or rollback",
          "The cost of cloud servers",
          "The speed of network switches"
        ],
        "correctAnswer": 1,
        "explanation": "Change Failure Rate measures release quality: the percentage of changes that fail in production and require emergency remediation."
      },
      {
        "id": "Q-SSM-290",
        "question": "In banking and fintech loan underwriting, what is the primary benefit of applying Value Stream Mapping?",
        "options": [
          "Exposing that loan applications spend 90% of their 14-day turnaround time sitting in unassigned email inboxes and review queues rather than being actively processed",
          "Eliminating all credit checks",
          "Automating banking marketing",
          "Increasing loan interest rates"
        ],
        "correctAnswer": 0,
        "explanation": "VSM in financial services reveals that multi-day lead times are dominated by queue waiting and batch handoffs rather than actual underwriting review."
      }
    ]
  },
  {
    "id": "ASM-SSM-030",
    "courseId": "CRS-SSM-001",
    "chapterId": "CH-SSM-030",
    "title": "Assessment: Enterprise Capstone Project & Black Belt Executive Presentation",
    "passingScore": 70,
    "questions": [
      {
        "id": "Q-SSM-291",
        "question": "In Project TitanOps, what was the audited annualized financial cost savings achieved, and who validated the figure?",
        "options": [
          "$50,000, validated by an intern",
          "$14,120,000 in audited hard cost savings, validated by the Corporate Finance Controller",
          "$100,000,000 in theoretical savings",
          "Zero financial savings"
        ],
        "correctAnswer": 1,
        "explanation": "TitanOps achieved $14.12M in hard financial savings, verified on the enterprise P&L by the Corporate Controller."
      },
      {
        "id": "Q-SSM-292",
        "question": "How much was fulfillment lead time reduced in Project TitanOps?",
        "options": [
          "Reduced from 4.6 hours to 1.4 hours (a 69.5% reduction)",
          "Reduced by 5 minutes",
          "Lead time increased to 10 hours",
          "Lead time was unaffected"
        ],
        "correctAnswer": 0,
        "explanation": "Lead time plummeted from an average of 4.6 hours to 1.4 hours through cellular flow redesign and sorter optimization."
      },
      {
        "id": "Q-SSM-293",
        "question": "What transformation in process capability (Cpk) was achieved by Project TitanOps?",
        "options": [
          "Cpk decreased from 1.50 to 0.40",
          "Cpk improved from an incapable baseline of 0.42 to a world-class capability of 1.52",
          "Cpk remained exactly 1.00",
          "Cpk was not measured"
        ],
        "correctAnswer": 1,
        "explanation": "$C_{pk}$ jumped from 0.42 ($3.3sigma$) to 1.52 ($4.6sigma$), slashing defect rates from 38,000 DPMO to 410 DPMO."
      },
      {
        "id": "Q-SSM-294",
        "question": "What Poka-Yoke error-proofing mechanism was implemented in Project TitanOps to eliminate incorrect order shipments?",
        "options": [
          "Hiring 100 extra visual inspectors",
          "Dynamic automated in-line scales that verify package weight against calculated SKU weights, blocking mis-picked boxes from shipping",
          "Sending apologies to customers",
          "Printing larger shipping labels"
        ],
        "correctAnswer": 1,
        "explanation": "Automated weight-verification scales act as a Control Poka-Yoke, physically stopping boxes that do not match expected part weights."
      },
      {
        "id": "Q-SSM-295",
        "question": "How should a Six Sigma Black Belt structure an executive presentation to the C-suite (CEO, CFO, COO)?",
        "options": [
          "A 200-page slide deck full of raw Minitab output and statistical formulas",
          "A concise, high-impact Executive A3 Storyboard focusing on verified P&L dollar savings, customer SLA recovery, before-and-after capability, and long-term governance",
          "A speech criticizing past management failures",
          "An email with no data"
        ],
        "correctAnswer": 1,
        "explanation": "Executives require clear business narratives: financial return, capability improvements, risk mitigation, and sustainable governance."
      },
      {
        "id": "Q-SSM-296",
        "question": "What Lean layout redesign was executed in the fulfillment bays during Project TitanOps?",
        "options": [
          "Building higher walls between departments",
          "Reorganizing traditional linear batch areas into 12 balanced U-shaped continuous flow workcells, slashing travel waste by 6.2 miles per shift",
          "Moving all operations to another country",
          "Removing all conveyor belts"
        ],
        "correctAnswer": 1,
        "explanation": "Transitioning to U-shaped flow cells balanced work against Takt time and eliminated 6.2 miles of daily operator travel waste."
      },
      {
        "id": "Q-SSM-297",
        "question": "What real-time monitoring mechanism was instituted in the Control phase of Project TitanOps to sustain the gains?",
        "options": [
          "Manual monthly spreadsheets",
          "Cloud-connected Shewhart X-bar & R control charts with automated Nelson Rule alerts displayed on operational floor dashboards",
          "Annual customer surveys",
          "A suggestion box in the cafeteria"
        ],
        "correctAnswer": 1,
        "explanation": "Real-time SPC charts with automated Nelson rule triggers alert supervisors to process shifts before defects escape."
      },
      {
        "id": "Q-SSM-298",
        "question": "Who formally signs off on the final Control phase tollgate and assumes permanent ownership of the improved process?",
        "options": [
          "The external consultant",
          "The Operational Process Owner (e.g. VP of Global Logistics)",
          "The software vendor",
          "The customer"
        ],
        "correctAnswer": 1,
        "explanation": "The Process Owner signs off on the Control Plan and accepts long-term operational stewardship of the sustained process."
      },
      {
        "id": "Q-SSM-299",
        "question": "What is an 'Executive A3' storyboard?",
        "options": [
          "An airplane design document",
          "A standardized, single-page (A3 paper size) executive report that concisely captures the problem, baseline data, root causes, improvements, financial results, and sustainment plan",
          "A spreadsheet with 1,000 columns",
          "A job description for a manager"
        ],
        "correctAnswer": 1,
        "explanation": "Originating at Toyota, the A3 is a single-page storytelling framework that synthesizes complex operational projects for executive decision-makers."
      },
      {
        "id": "Q-SSM-300",
        "question": "What is the ultimate mark of an elite Lean Six Sigma Operations Leader?",
        "options": [
          "Memorizing statistical formulas without understanding their practical meaning",
          "The ability to see waste, eliminate variation through empirical science, foster a frontline Kaizen culture, and deliver audited multi-million dollar business value that endures permanently",
          "Running as many meetings as possible",
          "Writing the longest possible standard operating procedures"
        ],
        "correctAnswer": 1,
        "explanation": "True operational mastery combines deep statistical rigor with Lean cultural leadership, transforming organizations into resilient, high-performing engines of excellence."
      }
    ]
  }
]
};
