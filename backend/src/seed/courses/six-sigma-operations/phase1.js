// Phase 1: Chapters 1-6 and Assessments (ASM-SSM-001 to ASM-SSM-006)
export const phase1 = {
  chapters: [
  {
    "id": "CH-SSM-001",
    "courseId": "CRS-SSM-001",
    "title": "The Evolution of Operational Excellence: Scientific Management, Toyota Production System (TPS) & Six Sigma Origins",
    "order": 1,
    "estimatedMinutes": 65,
    "content": "\n      <h2>1. The Historical Trajectory of Operational Excellence</h2>\n      <p>The quest for operational perfection, efficiency, and zero-defect execution is not a modern buzzword; it is an evolving scientific discipline spanning more than a century of industrial and intellectual evolution. As a prospective Lean Six Sigma Operations Manager, understanding the historical foundations provides the mental models necessary to discern timeless manufacturing and service principles from fleeting management fads.</p>\n      \n      <p>The journey began in the early 20th century with <strong>Frederick Winslow Taylor</strong> and the advent of <em>Scientific Management</em>. Taylor introduced time-and-motion studies, breaking work down into standardized, measurable tasks. While Taylorism dramatically boosted industrial throughput, it suffered from a mechanistic worldview that alienated frontline workers and ignored holistic process variation.</p>\n\n      <p>Following World War II, the epicenter of quality shifted to Japan. Reeling from postwar industrial devastation, Japanese industry embraced the radical statistical philosophies of <strong>W. Edwards Deming</strong> and <strong>Joseph M. Juran</strong>. Deming introduced the <em>Plan-Do-Check-Act (PDCA)</em> cycle (the Shewhart Cycle) and his famous 14 Points for Management, positing that over 85% (later updated to 94%) of quality failures stem from systemic faults in management-designed processes rather than worker carelessness.</p>\n\n      <div class=\"callout callout-info\">\n        <h4>Deming's Red Bead Experiment</h4>\n        <p>In his iconic demonstration, Deming had willing workers dip paddles into a mixture of white and red beads. Despite strict instructions, incentives, and threats, workers consistently produced ~20% defective red beads. Deming's fundamental proof: <em>Performance is constrained by the capability of the system. Blaming frontline workers for system-level variation is futile; only management redesigning the process can improve quality.</em></p>\n      </div>\n\n      <h2>2. The Toyota Production System (TPS): The Birth of Lean</h2>\n      <p>In the 1950s through 1970s, Toyota executives <strong>Kiichiro Toyoda</strong>, <strong>Taiichi Ohno</strong>, and <strong>Shigeo Shingo</strong> confronted severe resource scarcity, small domestic market demand, and lack of capital. Unlike American automotive mass-producers (Ford, GM) who relied on massive batches, high inventory, and economies of scale, Toyota pioneered the <strong>Toyota Production System (TPS)</strong>—which later came to be known globally as <em>Lean Manufacturing</em>.</p>\n      \n      <p>TPS rests upon two foundational pillars (the \"TPS House\"):</p>\n      <ul>\n        <li><strong>Just-In-Time (JIT):</strong> Making only <em>what</em> is needed, <em>when</em> it is needed, and in the <em>amount</em> needed. Driven by Takt Time, One-Piece Flow, and Kanban pull systems.</li>\n        <li><strong>Jidoka (Autonomation / Automation with Human Intelligence):</strong> Designing machines and workstations to detect abnormalities immediately and automatically stop production (via Andon cords), preventing defective components from being passed downstream.</li>\n      </ul>\n\n      <h2>3. The Origins of Six Sigma at Motorola & General Electric</h2>\n      <p>In the early 1980s, Motorola was struggling against fierce Japanese competition in cellular and communications equipment. Japanese pagers and television sets operated with defect rates orders of magnitude lower than American products. Motorola senior engineer <strong>Bill Smith</strong> identified that the traditional quality standard of $pm 3sigma$ (yielding 99.73% quality or 2,700 Defects Per Million Opportunities - DPMO) was wholly inadequate for complex electronic assemblies containing thousands of individual components.</p>\n      \n      <p>Bill Smith proposed raising the threshold of process capability to <strong>Six Sigma ($pm 6sigma$)</strong>, which permits no more than <strong>3.4 Defects Per Million Opportunities (DPMO)</strong> over the long term (incorporating a standard $1.5sigma$ process mean shift). Motorola CEO <strong>Bob Galvin</strong> institutionalized Six Sigma across the corporation, winning the inaugural Malcolm Baldrige National Quality Award in 1988.</p>\n\n      <p>A decade later, under CEO <strong>Jack Welch</strong>, <strong>General Electric (GE)</strong> supercharged Six Sigma into a corporate religion, mandating Black Belt training for all managerial promotions and delivering an audited $12 Billion in cost savings over five years.</p>\n\n      <table class=\"table table-bordered\">\n        <thead>\n          <tr>\n            <th>Sigma Level</th>\n            <th>Defects Per Million Opportunities (DPMO)</th>\n            <th>Yield Percentage</th>\n            <th>Real-World Everyday Equivalent</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td><strong>$1sigma$</strong></td>\n            <td>691,462</td>\n            <td>30.85%</td>\n            <td>Losing 69 out of 100 packages mailed.</td>\n          </tr>\n          <tr>\n            <td><strong>$2sigma$</strong></td>\n            <td>308,537</td>\n            <td>69.15%</td>\n            <td>No electricity for 7.4 hours each day.</td>\n          </tr>\n          <tr>\n            <td><strong>$3sigma$</strong></td>\n            <td>66,807</td>\n            <td>93.32%</td>\n            <td>Unsafe drinking water for 15 minutes each day.</td>\n          </tr>\n          <tr>\n            <td><strong>$4sigma$</strong></td>\n            <td>6,210</td>\n            <td>99.38%</td>\n            <td>20,000 lost postal mail articles per hour.</td>\n          </tr>\n          <tr>\n            <td><strong>$5sigma$</strong></td>\n            <td>233</td>\n            <td>99.977%</td>\n            <td>One unsafe airline landing per week.</td>\n          </tr>\n          <tr>\n            <td><strong>$6sigma$</strong></td>\n            <td><strong>3.4</strong></td>\n            <td><strong>99.99966%</strong></td>\n            <td>1 wrong drug prescription in 294,000; commercial airline aviation safety.</td>\n          </tr>\n        </tbody>\n      </table>\n\n      <div class=\"video-container\">\n        <iframe src=\"https://www.youtube.com/embed/5a3U_wGv8bE\" title=\"History of Quality: From Scientific Management to Lean Six Sigma\" allowfullscreen></iframe>\n      </div>\n\n      <h2>4. The Synthesis: Lean Six Sigma (LSS)</h2>\n      <p>Historically, Lean and Six Sigma were treated as competing philosophies. Six Sigma specialists viewed Lean practitioners as non-rigorous shop-floor tinkers, while Lean advocates derided Six Sigma Black Belts as ivory-tower statisticians lost in Minitab regression models.</p>\n      \n      <p>Modern operational excellence recognizes their profound synergy: <strong>Lean eliminates waste, accelerates cycle time, and optimizes flow; Six Sigma eliminates process variation, uncovers root causes, and achieves statistical precision.</strong> Neither can succeed in isolation: a fast process with high defect rates merely produces scrap faster, while a zero-defect process choked with inventory and waiting waste goes bankrupt. Lean Six Sigma unifies velocity with capability.</p>\n    ",
    "summary": "Explore the century-long evolution of operational excellence from Taylor's scientific management to Deming's PDCA, the Toyota Production System (TPS), Motorola's Six Sigma, and the modern synthesis of Lean Six Sigma.",
    "keyTakeaways": [
      "W. Edwards Deming proved that 94% of operational variation stems from management systems, not worker error.",
      "The Toyota Production System (TPS) rests on two pillars: Just-In-Time (JIT) and Jidoka (Autonomation).",
      "Six Sigma originated at Motorola under Bill Smith, defining world-class capability as 3.4 Defects Per Million Opportunities (DPMO).",
      "Lean accelerates velocity by eliminating non-value-added waste; Six Sigma eliminates process variation and defects.",
      "Lean Six Sigma unifies both philosophies: maximizing speed while ensuring near-zero defects."
    ]
  },
  {
    "id": "CH-SSM-002",
    "courseId": "CRS-SSM-001",
    "title": "Lean Principles vs. Six Sigma: Synergies, Philosophy & The 8 Deadly Wastes (DOWNTIME / Muda, Muri, Mura)",
    "order": 2,
    "estimatedMinutes": 60,
    "content": "\n      <h2>1. The Philosophical Tension: Lean vs. Six Sigma</h2>\n      <p>To lead transformation initiatives effectively, an Operations Manager must master the core philosophies, methodologies, and metrics that differentiate and unite Lean and Six Sigma:</p>\n\n      <table class=\"table table-bordered\">\n        <thead>\n          <tr>\n            <th>Dimension</th>\n            <th>Lean Methodology</th>\n            <th>Six Sigma Methodology</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td><strong>Primary Objective</strong></td>\n            <td>Eliminate Waste ($Muda$), optimize process flow, slash lead time.</td>\n            <td>Reduce Variation ($sigma$), eliminate defects, optimize capability.</td>\n          </tr>\n          <tr>\n            <td><strong>Guiding Metaphor</strong></td>\n            <td>Rivers flowing freely without dams, stagnant pools, or debris.</td>\n            <td>The normal distribution curve shrinking tightly around target $mu$.</td>\n          </tr>\n          <tr>\n            <td><strong>Core Toolkit</strong></td>\n            <td>VSM, 5S, Kanban, Kaizen, SMED, Poka-Yoke, Cellular Flow.</td>\n            <td>DMAIC, SPC charts, ANOVA, Gage R&R, FMEA, Regression, DOE.</td>\n          </tr>\n          <tr>\n            <td><strong>Measurement Focus</strong></td>\n            <td>Lead Time, Cycle Time, Takt Time, Work-in-Progress (WIP).</td>\n            <td>DPMO, $C_p$, $C_{pk}$, Standard Deviation ($sigma$), $p$-values.</td>\n          </tr>\n          <tr>\n            <td><strong>Deployment Model</strong></td>\n            <td>Bottom-up, continuous frontline engagement (Kaizen).</td>\n            <td>Top-down, project-based Belt hierarchy (Green, Black, Master Black Belt).</td>\n          </tr>\n        </tbody>\n      </table>\n\n      <h2>2. The Japanese Trifecta: Muda, Muri, Mura</h2>\n      <p>Taiichi Ohno emphasized that eliminating waste is impossible without addressing the three interconnected Japanese process enemies:</p>\n      <ul>\n        <li><strong>Muda (無駄 - Waste):</strong> Any activity or expenditure of resources that consumes time or capital without adding value from the perspective of the end customer.</li>\n        <li><strong>Muri (無理 - Overburden):</strong> Overstressing employees, equipment, or systems beyond their natural, sustainable operating capacity. Muri leads to worker burnout, machine breakdowns, and safety incidents.</li>\n        <li><strong>Mura (斑 - Unevenness / Inconsistency):</strong> Fluctuations and erratic variability in customer demand, batch arrival sizes, or production scheduling. Mura directly creates Muri (overburden during spikes) which inevitably produces Muda (idle waste during lulls).</li>\n      </ul>\n\n      <div class=\"callout callout-warning\">\n        <h4>Value-Added vs. Non-Value-Added Analysis</h4>\n        <p>In Lean operations, every process activity is categorized into three strict classifications:\n          <ol>\n            <li><strong>Value-Added (VA):</strong> The activity transforms the form, fit, or function of the product/service; the customer is willing to pay for it; and it is done right the first time. (In typical un-optimized processes, VA represents <em>less than 5% of total lead time!</em>)</li>\n            <li><strong>Business Non-Value-Added (BNVA / Necessary Waste):</strong> Adds no direct customer value, but is legally, regulatorily, or financially mandatory (e.g. tax reporting, compliance audits, safety inspections). Goal: <em>Minimize</em>.</li>\n            <li><strong>Non-Value-Added (NVA / Pure Waste):</strong> Consumes resources without adding value or satisfying regulation (waiting, rework, excessive travel). Goal: <em>Eliminate completely</em>.</li>\n          </ol>\n        </p>\n      </div>\n\n      <h2>3. The 8 Deadly Wastes (The DOWNTIME Acronym)</h2>\n      <p>Modern Lean codifies the traditional 7 wastes of Ohno plus the modern 8th waste into the universal acronym <strong>DOWNTIME</strong>:</p>\n\n      <table class=\"table table-bordered\">\n        <thead>\n          <tr>\n            <th>Waste Letter</th>\n            <th>Waste Category</th>\n            <th>Manufacturing Example</th>\n            <th>Service / Tech / Office Example</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td><strong>D</strong></td>\n            <td><strong>Defects</strong></td>\n            <td>Scrapped auto parts, machining burrs, solder bridges.</td>\n            <td>Software bugs, data entry typos, invoice errors.</td>\n          </tr>\n          <tr>\n            <td><strong>O</strong></td>\n            <td><strong>Overproduction</strong></td>\n            <td>Producing 5,000 parts ahead of customer orders (the worst waste!).</td>\n            <td>Building software features no customer uses; printing reports unread.</td>\n          </tr>\n          <tr>\n            <td><strong>W</strong></td>\n            <td><strong>Waiting</strong></td>\n            <td>Assembly technicians idle waiting for delayed parts delivery.</td>\n            <td>Developers waiting 4 days for managerial PR review approvals.</td>\n          </tr>\n          <tr>\n            <td><strong>N</strong></td>\n            <td><strong>Non-Utilized Talent</strong></td>\n            <td>Treating shop-floor operators as manual hands without asking for improvement ideas.</td>\n            <td>Assigning senior engineers to manually enter data into spreadsheets.</td>\n          </tr>\n          <tr>\n            <td><strong>T</strong></td>\n            <td><strong>Transportation</strong></td>\n            <td>Moving pallet inventory across three warehouses on forklifts.</td>\n            <td>Emailing attachments across 5 departments for sequential review.</td>\n          </tr>\n          <tr>\n            <td><strong>I</strong></td>\n            <td><strong>Inventory</strong></td>\n            <td>Excess raw materials, huge WIP piles between workstations.</td>\n            <td>Backlog of 300 unresolved customer support tickets.</td>\n          </tr>\n          <tr>\n            <td><strong>M</strong></td>\n            <td><strong>Motion</strong></td>\n            <td>Workers bending, stretching, or walking 15 steps to fetch tools.</td>\n            <td>Context switching across 12 open browser tabs and software windows.</td>\n          </tr>\n          <tr>\n            <td><strong>E</strong></td>\n            <td><strong>Extra Processing</strong></td>\n            <td>Polishing a concealed metal bracket beyond customer specification.</td>\n            <td>Requiring 4 redundant executive sign-offs for a $50 purchase.</td>\n          </tr>\n        </tbody>\n      </table>\n\n      <div class=\"video-container\">\n        <iframe src=\"https://www.youtube.com/embed/3zrfKz7L9oU\" title=\"The 8 Wastes of Lean: DOWNTIME and Muda Deep Dive\" allowfullscreen></iframe>\n      </div>\n\n      <h2>4. The Lean Sea of Inventory Metaphor</h2>\n      <p>Lean visualizes inventory as the water level in an ocean. Beneath the surface lie jagged rocks representing operational dysfunctions: unreliable machines, supplier tardiness, long setup times, defective parts, and absenteeism. When the water level (inventory) is kept artificially high, the ship sails smoothly over the rocks, completely blind to the systemic rot beneath. Lean lowers the water level systematically, exposing rocks one by one so operational teams can permanently quarry them away.</p>\n    ",
    "summary": "Differentiate Lean from Six Sigma, dissect the Japanese triumvirate of Muda, Muri, and Mura, master the 8 deadly wastes (DOWNTIME), and analyze Value-Added versus Non-Value-Added process steps.",
    "keyTakeaways": [
      "Lean targets waste and velocity; Six Sigma targets variation and defects.",
      "Mura (unevenness) creates Muri (overburden), which directly produces Muda (waste).",
      "Value-Added activities must transform the product, be done right the first time, and be valued by the customer (typically &lt;5% of total lead time).",
      "The 8 Deadly Wastes are codified by DOWNTIME: Defects, Overproduction, Waiting, Non-utilized talent, Transportation, Inventory, Motion, Extra Processing.",
      "Overproduction is recognized as the mother of all wastes because it conceals all other dysfunctions."
    ]
  },
  {
    "id": "CH-SSM-003",
    "courseId": "CRS-SSM-001",
    "title": "The DMAIC Framework Architecture: Phase Gates, Deliverables, Tollgates & Project Charter Mastery",
    "order": 3,
    "estimatedMinutes": 65,
    "content": "\n      <h2>1. The DMAIC Methodological Engine</h2>\n      <p>Six Sigma's enduring success lies in its universal, disciplined problem-solving methodology: <strong>DMAIC</strong> (pronounced <em>duh-MAY-ik</em>): <strong>Define, Measure, Analyze, Improve, Control</strong>. Unlike unstructured brainstorming or intuitive tinkering, DMAIC is an evidence-based roadmap that prevents organizations from jumping to premature conclusions or treating symptoms rather than verified root causes.</p>\n\n      <div class=\"callout callout-info\">\n        <h4>DMAIC vs. DMADV (DFSS)</h4>\n        <p>A critical architectural distinction for managers:\n          <br><strong>DMAIC</strong> is used to improve, fix, and optimize an <strong>existing</strong> process that is operating below target performance.\n          <br><strong>DMADV</strong> (Define, Measure, Analyze, Design, Verify) is used when <strong>designing a brand-new</strong> process, product, or service from scratch, or when an existing process is so fundamentally broken that incremental improvement is futile (Design for Six Sigma - DFSS).\n        </p>\n      </div>\n\n      <h2>2. Phase-by-Phase Architecture & Deliverables</h2>\n      <p>Each phase of DMAIC demands specific statistical and operational artifacts before progressing:</p>\n\n      <table class=\"table table-bordered\">\n        <thead>\n          <tr>\n            <th>Phase</th>\n            <th>Primary Question Answered</th>\n            <th>Core Tools & Techniques</th>\n            <th>Key Exit Deliverables</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td><strong>Define</strong></td>\n            <td><em>What problem are we solving, why does it matter financially, and who is the customer?</em></td>\n            <td>Project Charter, VOC, Kano Model, CTQ Tree, SIPOC, Stakeholder Map.</td>\n            <td>Approved Project Charter, signed Stakeholder Agreement, high-level SIPOC.</td>\n          </tr>\n          <tr>\n            <td><strong>Measure</strong></td>\n            <td><em>How is the current process performing, and can we trust our measurement data?</em></td>\n            <td>Data Collection Plan, Gage R&R (MSA), Process Capability ($C_p, C_{pk}$), VSM.</td>\n            <td>Validated Measurement System (Gage R&R &lt; 10%), Baseline Capability, Current-State VSM.</td>\n          </tr>\n          <tr>\n            <td><strong>Analyze</strong></td>\n            <td><em>What are the verified root causes of variation, defects, and waste ($Y = f(X)$)?</em></td>\n            <td>Fishbone Diagram, 5 Whys, FMEA, Hypothesis Testing ($t$-tests, ANOVA), Multi-Vari charts.</td>\n            <td>Prioritized FMEA with RPNs, statistically validated root causes ($p &lt; 0.05$).</td>\n          </tr>\n          <tr>\n            <td><strong>Improve</strong></td>\n            <td><em>What creative solutions will permanently eliminate root causes, and how do we optimize them?</em></td>\n            <td>Design of Experiments (DOE), Brainstorming, Kaizen Blitz, SMED, Poka-Yoke, Pilot Test.</td>\n            <td>Solution selection matrix, validated Pilot results, Cost-Benefit Analysis, Implementation Plan.</td>\n          </tr>\n          <tr>\n            <td><strong>Control</strong></td>\n            <td><em>How do we sustain the gains permanently and prevent the process from backsliding?</em></td>\n            <td>Statistical Process Control (SPC), Control Plans, SOPs, Visual Management, Training, Handover.</td>\n            <td>Operational Control Plan, live Control Charts, updated SOPs, sign-off by Process Owner.</td>\n          </tr>\n        </tbody>\n      </table>\n\n      <h2>3. The Project Charter: The Binding Contract of Operational Excellence</h2>\n      <p>Over 50% of Six Sigma project failures trace back to a poorly framed or unaligned Project Charter. The Project Charter is the definitive executive contract between the project team, the Project Champion/Sponsor, and the business unit. A world-class charter consists of six non-negotiable sections:</p>\n      \n      <ol>\n        <li><strong>Business Case:</strong> Explains <em>why</em> this project is worth investing capital and engineering hours. Ties the operational defect directly to strategic business metrics (e.g. EBITDA, market share, customer churn).</li>\n        <li><strong>Problem Statement:</strong> A precise, data-grounded declaration describing <em>what</em> is wrong, <em>where</em> it occurs, <em>when</em> it started, and <em>the magnitude of impact</em>. <strong>Rule: It must NEVER assign blame or propose a pre-baked solution!</strong></li>\n        <li><strong>Goal Statement:</strong> Follows the SMART framework (Specific, Measurable, Actionable, Relevant, Time-bound). Defines the baseline, the target improvement, and the target completion date.</li>\n        <li><strong>Scope (In-Scope / Out-of-Scope):</strong> Establishes strict geographic, system, and organizational boundaries to eliminate \"scope creep\".</li>\n        <li><strong>Project Team & Roles:</strong> Identifies Champion, Process Owner, Black Belt Lead, Green Belts, and Subject Matter Experts (SMEs).</li>\n        <li><strong>Milestones & Tollgate Schedule:</strong> Projected target dates for each DMAIC phase gate review.</li>\n      </ol>\n\n      <pre><code class=\"language-markdown\"># Example Executive Six Sigma Project Charter\n\n## Project Title\nMeridian Logistics: Cold-Chain Pharmaceutical Dispatch Cycle Time Reduction\n\n## Business Case\nLate cold-chain dispatches result in temperature excursions, leading to product spoilage, regulatory quarantine, \nand customer penalty fees totaling $3.4M annually. Streamlining dispatch protects $45M in core vaccine revenue.\n\n## Problem Statement\nBetween Jan 1 and Sep 30, 2026, the Cold-Chain Packaging & Dispatch Department experienced an average dispatch cycle \ntime of 4.8 hours with a standard deviation of 1.4 hours, against a target SLA of 2.0 hours. This resulted in \na 24.2% SLA breach rate, incurring $280,000 monthly in expedited courier surcharges and product return scrap.\n\n## Goal Statement\nReduce the Cold-Chain Packaging & Dispatch cycle time from an average of 4.8 hours ($sigma = 1.4$) to \nunder 1.8 hours ($sigma le 0.35$), slashing the monthly SLA breach rate from 24.2% to less than 0.5% by March 31, 2027, \ngenerating an annualized cost avoidance of $2.9M.\n\n## Project Scope\n* **In-Scope:** Receipt of order confirmation to handover to refrigerated carrier at Dock 4.\n* **Out-of-Scope:** In-transit carrier logistics, formulation manufacturing, client PO generation.\n\n## Roles\n* **Executive Champion:** VP of Supply Chain\n* **Process Owner:** Cold-Chain Warehouse Director\n* **Black Belt Project Leader:** Lead Operations Architect</code></pre>\n\n      <div class=\"video-container\">\n        <iframe src=\"https://www.youtube.com/embed/nU6qD4b_eQE\" title=\"Mastering the DMAIC Methodology and Project Charter\" allowfullscreen></iframe>\n      </div>\n\n      <h2>4. The Tollgate Review Discipline</h2>\n      <p>A \"Tollgate\" is a formal executive decision checkpoint conducted at the conclusion of each DMAIC phase. The Project Champion, Process Owner, and Master Black Belt examine the phase deliverables. The tollgate review has only three possible outcomes:</p>\n      <ul>\n        <li><strong>GO (Approved):</strong> Deliverables are verified, statistical validity is confirmed, and the team proceeds to the next phase.</li>\n        <li><strong>REWORK (Conditional):</strong> Gaps identified (e.g. insufficient sample size in Measure, or root causes not statistically tested in Analyze). The team must remediate and reconvene.</li>\n        <li><strong>KILL / PIVOT (Terminated):</strong> Business priorities have shifted, or data reveals that the financial benefit is insufficient to justify further investment. Terminating low-value projects early is a hallmark of mature governance.</li>\n      </ul>\n    ",
    "summary": "Master the DMAIC lifecycle architecture, delineate DMAIC from DMADV, author rigorous executive Project Charters, and govern transitions through disciplined phase tollgate reviews.",
    "keyTakeaways": [
      "DMAIC improves existing underperforming processes; DMADV designs brand-new processes.",
      "The Project Charter is an executive contract consisting of Business Case, Problem Statement, Goal Statement, Scope, Milestones, and Roles.",
      "Problem statements must quantify what, where, when, and magnitude—never speculating on causes or solutions.",
      "Goal statements must be SMART, defining quantitative improvement from baseline to target with standard deviation goals.",
      "Tollgates are formal gatekeeper checkpoints (Go, Rework, or Kill) ensuring statistical and business rigor before advancing phases."
    ]
  },
  {
    "id": "CH-SSM-004",
    "courseId": "CRS-SSM-001",
    "title": "Voice of the Customer (VOC) to Critical to Quality (CTQ): Affinity Diagrams, Kano Model & CTQ Trees",
    "order": 4,
    "estimatedMinutes": 65,
    "content": "\n      <h2>1. The Voice of the Customer (VOC) Imperative</h2>\n      <p>Quality has only one authoritative definition: <em>conformance to customer expectations and requirements</em>. A product engineered with the highest precision or software written with zero syntax errors is completely defective if it fails to deliver what the customer values. In the Define phase of Six Sigma, operational leaders must systematically capture the diffuse, emotional, and often contradictory <strong>Voice of the Customer (VOC)</strong> and translate it into actionable, mathematically measurable technical metrics.</p>\n      \n      <p>VOC inputs arrive through multiple channels: customer interviews, focus groups, surveys, Net Promoter Score (NPS) feedback, warranty claims, churn exit interviews, and social media sentiment.</p>\n\n      <h2>2. Synthesizing Unstructured VOC: Affinity Diagrams</h2>\n      <p>When collecting hundreds of raw customer statements, teams are overwhelmed by qualitative noise. An <strong>Affinity Diagram</strong> (the KJ Method, developed by Jiro Kawakita) is a visual, consensus-driven tool that organizes large volumes of subjective ideas into natural, thematic groupings.</p>\n      \n      <p>Raw verbatim statements (e.g., <em>\"The app crashes when I upload photos\"</em>, <em>\"I can never reach a human agent\"</em>, <em>\"Shipping takes forever\"</em>) are placed on cards. The team groups them silently based on affinity, synthesizing hundreds of data points into 4 to 6 core customer pain themes (e.g., Reliability, Service Responsiveness, Logistics Velocity).</p>\n\n      <h2>3. The Kano Analysis Model</h2>\n      <p>Developed by Professor <strong>Noriaki Kano</strong> in 1984, the Kano Model challenges the naive assumption that customer satisfaction is linearly proportional to how many features or quality attributes you deliver. Kano categorizes customer requirements into five distinct emotional dimensions:</p>\n\n      <table class=\"table table-bordered\">\n        <thead>\n          <tr>\n            <th>Kano Category</th>\n            <th>Customer Perception & Behavior</th>\n            <th>Impact on Satisfaction</th>\n            <th>Real-World Example</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td><strong>Must-Be / Basic (Dissatisfiers)</strong></td>\n            <td>Taken for granted; customers only notice when it is missing or broken.</td>\n            <td>Presence yields zero satisfaction; absence causes explosive outrage!</td>\n            <td>Clean sheets in a hotel room; seatbelts in a car; SSL certificate on a bank website.</td>\n          </tr>\n          <tr>\n            <td><strong>One-Dimensional / Performance</strong></td>\n            <td>Linear relationship: the more you deliver, the higher the customer satisfaction.</td>\n            <td>Satisfaction increases proportionately with performance; decreases with poor speed.</td>\n            <td>Automobile fuel efficiency (MPG); smartphone battery life; SaaS dashboard load speed.</td>\n          </tr>\n          <tr>\n            <td><strong>Attractive / Delighters (Exciters)</strong></td>\n            <td>Unexpected innovations that surprise and delight the customer.</td>\n            <td>Absence causes zero dissatisfaction (customer did not expect it); presence sparks delight and virality!</td>\n            <td>Free luxury rental car upgrade; unexpected free airline lounge pass; AI that predicts and resolves issue before user notices.</td>\n          </tr>\n          <tr>\n            <td><strong>Indifferent</strong></td>\n            <td>Features that the customer simply does not care about one way or the other.</td>\n            <td>Zero impact on satisfaction; represents pure wasted engineering spend.</td>\n            <td>Gold-plated internal chassis screws inside a computer case.</td>\n          </tr>\n          <tr>\n            <td><strong>Reverse</strong></td>\n            <td>Features that actually annoy customers the more they are added.</td>\n            <td>Presence decreases customer satisfaction.</td>\n            <td>Excessive multi-factor security popups requiring re-authentication every 2 minutes.</td>\n          </tr>\n        </tbody>\n      </table>\n\n      <div class=\"callout callout-warning\">\n        <h4>The Kano Decay Phenomenon</h4>\n        <p>Customer expectations are never static. Over time, every <strong>Delighter</strong> naturally decays into a <strong>Performance</strong> requirement, and ultimately degrades into a basic <strong>Must-Be</strong>. In 2007, a smartphone touchscreen with pinch-to-zoom was a mind-blowing Delighter; today, a smartphone without a responsive touchscreen is considered defective scrap. Operational architectures must continuously refresh VOC.</p>\n      </div>\n\n      <h2>4. The CTQ Tree: Translating VOC into Measurable Specifications</h2>\n      <p>Customer statements are inevitably qualitative and ambiguous (e.g., <em>\"I want fast delivery\"</em> or <em>\"Your customer service is unhelpful\"</em>). An engineering or operational process cannot be statistically controlled around the word \"fast\".</p>\n      \n      <p>A <strong>Critical to Quality (CTQ) Tree</strong> is a hierarchical decomposition diagram that systematically converts broad customer desires into quantitative specifications through three tiers:</p>\n      <ol>\n        <li><strong>Tier 1: Voice of Customer (VOC):</strong> The raw, qualitative customer need. (e.g., <em>\"Order processing must be quick\"</em>).</li>\n        <li><strong>Tier 2: Key Quality Driver:</strong> The specific operational dimension that satisfies the VOC. (e.g., <em>\"Checkout transaction turnaround time\"</em>).</li>\n        <li><strong>Tier 3: Critical to Quality (CTQ) Metric & Specification:</strong> The exact, measurable unit of measure with Upper Specification Limits (USL) and Lower Specification Limits (LSL). (e.g., <em>\"API payment authorization latency $le 850\text{ms}$; Failure rate $le 0.01%$\"</em>).</li>\n      </ol>\n\n      <pre><code class=\"language-yaml\"># Conceptual CTQ Tree Architecture\nVoice of Customer (VOC):\n  \"The loan application takes too long and I never know what is happening.\"\n  |\n  +-- Key Quality Driver 1: Application Approval Speed\n  |     +-- CTQ Metric 1.1: Decision Elapsed Time\n  |     |     Target: <= 24 hours\n  |     |     Upper Specification Limit (USL): 36 hours\n  |     |     Unit: Decimal Hours\n  |\n  +-- Key Quality Driver 2: Status Transparency\n        +-- CTQ Metric 2.1: Automated SMS/Email Milestone Notifications\n              Target: 100% of pipeline stage transitions triggered\n              Lower Specification Limit (LSL): 99.5%\n              Defect: Unsent notification upon stage transition</code></pre>\n\n      <div class=\"video-container\">\n        <iframe src=\"https://www.youtube.com/embed/PjE2e6f4_r8\" title=\"Voice of Customer to Critical to Quality (CTQ) Tree Masterclass\" allowfullscreen></iframe>\n      </div>\n\n      <h2>5. Defining Operational Defects</h2>\n      <p>Once CTQs are established with upper and lower specification limits, the definition of an <strong>Operational Defect</strong> becomes absolute: <em>any event or instance where a product or service output falls outside the customer's specified tolerance limits ($&lt; \text{LSL}$ or $&gt; \text{USL}$)</em>. This objective definition forms the denominator for all subsequent Six Sigma statistical calculations.</p>\n    ",
    "summary": "Systematically capture and analyze the Voice of the Customer (VOC), apply Kano Model classification to prevent wasted engineering spend, and translate customer expectations into quantitative CTQ specifications.",
    "keyTakeaways": [
      "Quality is defined exclusively by customer perception and requirements, not internal technical vanity.",
      "Affinity Diagrams structure qualitative customer noise into thematic operational clusters.",
      "The Kano Model classifies needs into Must-Be, Performance, Delighter, Indifferent, and Reverse requirements.",
      "The Kano Decay principle proves that today's delighters inevitably become tomorrow's basic must-haves.",
      "CTQ Trees decompose broad customer statements into concrete metrics with Upper (USL) and Lower (LSL) specification limits."
    ]
  },
  {
    "id": "CH-SSM-005",
    "courseId": "CRS-SSM-001",
    "title": "High-Level Process Mapping: SIPOC (Suppliers, Inputs, Process, Outputs, Customers) & Coping with Process Boundaries",
    "order": 5,
    "estimatedMinutes": 65,
    "content": "\n      <h2>1. The Necessity of Macro-Level Process Scoping</h2>\n      <p>Before an operations team dives into granular micro-level process maps, value stream charts, or statistical data collection, they must step back and capture the macro-level systemic landscape. Jumping into minute task details too early causes teams to lose sight of end-to-end organizational context, argue over trivial local idiosyncrasies, and miss major systemic bottlenecks.</p>\n      \n      <p>The standard architectural tool for defining the high-level boundary of any process in the Define phase is the <strong>SIPOC Diagram</strong> (<strong>Suppliers, Inputs, Process, Outputs, Customers</strong>).</p>\n\n      <h2>2. Anatomical Architecture of a SIPOC</h2>\n      <p>A SIPOC provides a clean, single-page executive snapshot of a process from end to end, composed of five interconnected columns:</p>\n\n      <table class=\"table table-bordered\">\n        <thead>\n          <tr>\n            <th>Column</th>\n            <th>Architectural Definition</th>\n            <th>Key Questions to Uncover</th>\n            <th>Example (E-Commerce Fulfillment)</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td><strong>S - Suppliers</strong></td>\n            <td>The upstream entities, vendors, or internal departments providing the raw resources, data, or materials.</td>\n            <td><em>Where does our input originate? Who controls the quality of incoming data?</em></td>\n            <td>Inventory Vendors, Payment Gateways (Stripe), Customer Browser Client.</td>\n          </tr>\n          <tr>\n            <td><strong>I - Inputs</strong></td>\n            <td>The materials, information, orders, documentation, or energy required to execute the process.</td>\n            <td><em>What exact data artifacts or physical assets are consumed? What are the entry specifications?</em></td>\n            <td>Customer shipping address, validated payment token, SKU inventory pick list, cardboard cartons.</td>\n          </tr>\n          <tr>\n            <td><strong>P - Process</strong></td>\n            <td>A high-level sequence of <strong>4 to 7 macro steps</strong> that transform inputs into outputs.</td>\n            <td><em>What are the foundational verbs of transformation? (Avoid getting bogged down in decision branches!).</em></td>\n            <td>1. Receive Order &rarr; 2. Pick Items &rarr; 3. Pack Box &rarr; 4. Affix Shipping Label &rarr; 5. Handover to Carrier.</td>\n          </tr>\n          <tr>\n            <td><strong>O - Outputs</strong></td>\n            <td>The tangible products, services, notifications, or completed records resulting from the transformation.</td>\n            <td><em>What is delivered to the world? What are the key performance metrics of this output?</em></td>\n            <td>Sealed parcel, tracking number barcode, electronic invoice receipt, inventory decrement signal.</td>\n          </tr>\n          <tr>\n            <td><strong>C - Customers</strong></td>\n            <td>The downstream individuals, business units, or end consumers who receive and consume the output.</td>\n            <td><em>Who is impacted if this output is late or defective? Who defines the CTQs?</em></td>\n            <td>Online purchaser, Carrier Driver (FedEx), Enterprise Accounting, Regional Sorting Hub.</td>\n          </tr>\n        </tbody>\n      </table>\n\n      <div class=\"callout callout-info\">\n        <h4>The Reverse Construction Rule (COPIS)</h4>\n        <p>Although spelled S-I-P-O-C, experienced Lean Six Sigma leaders construct the diagram in reverse—often called <strong>COPIS</strong>:\n          <ol>\n            <li>Identify the <strong>Customer</strong> first.</li>\n            <li>Define the <strong>Outputs</strong> required to satisfy the customer's CTQs.</li>\n            <li>Outline the 4–7 high-level <strong>Process</strong> transformation steps.</li>\n            <li>Determine the exact <strong>Inputs</strong> needed for those process steps.</li>\n            <li>Pinpoint the <strong>Suppliers</strong> responsible for delivering those inputs.</li>\n          </ol>\n          Starting with the Customer ensures the entire operational analysis remains anchored in customer value rather than supplier convenience.\n        </p>\n      </div>\n\n      <h2>3. Defining Strict Process Boundaries</h2>\n      <p>A SIPOC is the definitive operational mechanism for establishing project scope. The first and last steps of the <strong>Process</strong> column formally define the <strong>Start Boundary</strong> and <strong>Stop Boundary</strong> of the Lean Six Sigma project:</p>\n      <ul>\n        <li><strong>Start Boundary:</strong> The trigger event that initiates the process under investigation (e.g. <em>\"Timestamp of customer payment authorization received\"</em>).</li>\n        <li><strong>Stop Boundary:</strong> The handoff event where responsibility passes to downstream external stakeholders (e.g. <em>\"Carrier driver scans physical barcode manifest at Loading Bay 3\"</em>).</li>\n      </ul>\n      <p>Any activity occurring prior to the start trigger or subsequent to the stop handoff is strictly <strong>Out-of-Scope</strong>, protecting the Black Belt and team from crippling project creep.</p>\n\n      <h2>4. The SIPOC to Data Collection Bridge</h2>\n      <p>Beyond scoping, the SIPOC serves as the statistical foundation for the upcoming Measure phase. By examining the Inputs ($X$) and Outputs ($Y$), the team identifies the critical mathematical relationship:\n        $$Y = f(X_1, X_2, X_3, dots, X_n)$$\n      The Outputs ($Y$) represent the project's primary dependent outcome variables (lead time, defect rate), while the Inputs ($X$) and Process steps represent the potential independent variables that drive process performance.</p>\n\n      <div class=\"video-container\">\n        <iframe src=\"https://www.youtube.com/embed/6iO2xV5d1xM\" title=\"How to Create an Effective SIPOC Diagram for Process Improvement\" allowfullscreen></iframe>\n      </div>\n    ",
    "summary": "Construct high-level SIPOC diagrams, apply the reverse COPIS methodology to anchor process maps in customer value, establish ironclad project boundaries, and map input-output relationships ($Y = f(X)$).",
    "keyTakeaways": [
      "SIPOC provides a macro, single-page executive overview of a process before diving into detailed mapping.",
      "The five pillars are Suppliers, Inputs, Process (4-7 steps), Outputs, and Customers.",
      "Building the diagram in reverse (COPIS) guarantees that outputs and inputs directly serve customer needs.",
      "The first and last process steps define the absolute Start and Stop boundaries of the project scope.",
      "SIPOC maps the fundamental operational function: Outputs ($Y$) as a function of upstream Inputs and Steps ($X$)."
    ]
  },
  {
    "id": "CH-SSM-006",
    "courseId": "CRS-SSM-001",
    "title": "Financial Valuation & Business Case Formulation: Cost of Poor Quality (COPQ), Hard vs. Soft Financial Savings & Rolled First Pass Yield (RFPY)",
    "order": 6,
    "estimatedMinutes": 65,
    "content": "\n      <h2>1. The Financial Language of Operational Excellence</h2>\n      <p>The ultimate arbiter of any Six Sigma initiative is the enterprise balance sheet. Engineers and quality specialists who speak only in terms of $p$-values, standard deviations, and histograms fail to capture the attention of Chief Financial Officers. To secure executive sponsorship and institutional investment, an Operations Manager must master the translation of process defects into audited currency.</p>\n\n      <h2>2. Cost of Poor Quality (COPQ) & The PAF Model</h2>\n      <p><strong>Cost of Poor Quality (COPQ)</strong> represents the total financial loss incurred by an enterprise because a product or service was not manufactured or delivered perfectly the first time. In average organizations operating at $3sigma$ to $4sigma$ capability, COPQ consumes between <strong>15% and 30% of total gross revenue</strong>!</p>\n      \n      <p>COPQ is categorized under the classic <strong>PAF Model (Prevention, Appraisal, Failure)</strong>:</p>\n\n      <table class=\"table table-bordered\">\n        <thead>\n          <tr>\n            <th>Cost Category</th>\n            <th>Type</th>\n            <th>Definition & Strategic Objective</th>\n            <th>Industry Examples</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td><strong>Prevention Costs</strong></td>\n            <td>Cost of Good Quality (Investment)</td>\n            <td>Expenditures incurred to design quality into the product/process and prevent defects from occurring in the first place.</td>\n            <td>Operator training, FMEA reviews, Design for Six Sigma (DFSS), Poka-Yoke error proofing, supplier certification.</td>\n          </tr>\n          <tr>\n            <td><strong>Appraisal Costs</strong></td>\n            <td>Cost of Good Quality (Inspection)</td>\n            <td>Costs associated with evaluating, testing, auditing, and inspecting products or services to detect defects.</td>\n            <td>End-of-line inspections, calibration of test gauges, laboratory destructive testing, code reviews.</td>\n          </tr>\n          <tr>\n            <td><strong>Internal Failure Costs</strong></td>\n            <td>Cost of Poor Quality (Waste)</td>\n            <td>Losses resulting from defects identified <em>before</em> the product or service is delivered to the customer.</td>\n            <td>Scrapped raw material, rework labor hours, re-testing, downtime caused by tooling failure.</td>\n          </tr>\n          <tr>\n            <td><strong>External Failure Costs</strong></td>\n            <td>Cost of Poor Quality (Catastrophic)</td>\n            <td>Costs incurred when defective products or services reach the customer. (The most damaging costs!).</td>\n            <td>Product recalls, warranty repair claims, customer support call volume, legal liability, brand damage & churn.</td>\n          </tr>\n        </tbody>\n      </table>\n\n      <div class=\"callout callout-info\">\n        <h4>The 1-10-100 Rule of Quality Costs</h4>\n        <p>The 1-10-100 Rule illustrates the exponential financial penalty of delayed defect detection:\n          <ul>\n            <li>Investing <strong>$1</strong> in Prevention (e.g. error-proofing the order entry form) prevents the defect entirely.</li>\n            <li>If missed, it costs <strong>$10</strong> in Appraisal and Internal Failure (detecting the error during shipping inspection and re-entering the order).</li>\n            <li>If it escapes to the customer, it costs <strong>$100</strong> (or $1,000+) in External Failure (handling return shipping, processing refunds, apologizing, and suffering customer churn).</li>\n          </ul>\n        </p>\n      </div>\n\n      <h2>3. Hard Savings vs. Soft Savings</h2>\n      <p>Every Six Sigma project business case must explicitly delineate between two financial categories, validated by the corporate Finance Controller:</p>\n      <ul>\n        <li><strong>Hard Savings (Direct Bottom-Line Cash):</strong> Measurable reductions in operating expense that directly show up on the financial P&L statement. Examples include: reduction in material scrap spend, eliminated overtime labor hours, reduced vendor licensing fees, or direct reduction in warranty payout cash.</li>\n        <li><strong>Soft Savings (Cost Avoidance & Capacity Creation):</strong> Improvements that enhance efficiency or prevent future cost increases without immediate cash extraction. Examples include: freeing up 20% of warehouse floor space, eliminating 2 hours of managerial paperwork per week, or improving customer satisfaction scores. Soft savings only become hard savings if freed capacity is redeployed to generate new revenue or reduce headcount.</li>\n      </ul>\n\n      <h2>4. Rolled First Pass Yield (RFPY) vs. Traditional Final Yield</h2>\n      <p>Traditional manufacturing and service reporting frequently conceals massive internal waste through <strong>Final Yield</strong>. If a factory starts with 100 units, scraps 10 along the way, reworks 30 units three times through the line, and finally inspects 90 good units at the end of the day, management naively reports a \"90% Yield\". This hides the immense labor and machine cost consumed by the \"Hidden Factory\" of rework loops.</p>\n      \n      <p>Six Sigma uses <strong>Rolled First Pass Yield (RFPY / $Y_{rt}$)</strong>: the probability that a unit will pass through <em>every single step of a multi-stage process with zero rework and zero defects</em>.</p>\n      \n      $$RFPY = prod_{i=1}^{k} FPY_i = FPY_1 \times FPY_2 \times FPY_3 \times dots \times FPY_k$$\n\n      <div class=\"callout callout-warning\">\n        <h4>The Mathematical Shock of RFPY</h4>\n        <p>Consider a 5-step order fulfillment process where each individual station operates at a seemingly respectable 95% First Pass Yield ($0.95$):\n          $$RFPY = 0.95 \times 0.95 \times 0.95 \times 0.95 \times 0.95 = (0.95)^5 approx 0.7737 \text{ or } 77.4%$$\n          While every manager proudly reports \"95% quality\", in reality, <strong>nearly 23% of all orders</strong> require expensive rework, manual intervention, or scrapping before reaching the customer!\n        </p>\n      </div>\n\n      <div class=\"video-container\">\n        <iframe src=\"https://www.youtube.com/embed/XqC9m7vQ7tM\" title=\"Cost of Poor Quality (COPQ) and Rolled First Pass Yield Masterclass\" allowfullscreen></iframe>\n      </div>\n    ",
    "summary": "Formulate defensible financial business cases for Six Sigma projects, calculate Cost of Poor Quality (COPQ) using the PAF model, differentiate Hard from Soft savings, and compute Rolled First Pass Yield (RFPY).",
    "keyTakeaways": [
      "COPQ typically accounts for 15% to 30% of gross revenue in average organizations.",
      "The PAF model categorizes quality costs into Prevention, Appraisal, Internal Failure, and External Failure.",
      "The 1-10-100 Rule demonstrates the exponential escalation of defect costs the later they are detected.",
      "Hard savings directly reduce P&L cash expenditures; soft savings represent cost avoidance and freed capacity.",
      "Rolled First Pass Yield (RFPY) reveals the true efficiency of a multi-step process by multiplying individual step yields, exposing the hidden factory of rework."
    ]
  }
],
  assessments: [
  {
    "id": "ASM-SSM-001",
    "courseId": "CRS-SSM-001",
    "chapterId": "CH-SSM-001",
    "title": "Assessment: Evolution of Operational Excellence & Six Sigma Origins",
    "passingScore": 70,
    "questions": [
      {
        "id": "Q-SSM-001",
        "question": "What core truth did W. Edwards Deming prove through his famous Red Bead Experiment?",
        "options": [
          "Workers perform better when given cash financial bonuses for zero defects",
          "The vast majority of process failures stem from systemic faults in management-designed processes rather than worker carelessness",
          "Automated machines make more errors than human operators",
          "Inspection is the most cost-effective method of quality assurance"
        ],
        "correctAnswer": 1,
        "explanation": "Deming's Red Bead Experiment proved that variation is built into the system. Blaming frontline workers for systemic defects is futile; only management redesigning the process can improve performance."
      },
      {
        "id": "Q-SSM-002",
        "question": "What defect rate is defined by the Six Sigma standard over the long term (including the standard 1.5-sigma shift)?",
        "options": [
          "3.4 Defects Per Million Opportunities (DPMO)",
          "66,807 Defects Per Million Opportunities (DPMO)",
          "2,700 Defects Per Million Opportunities (DPMO)",
          "0.1 Defects Per Million Opportunities (DPMO)"
        ],
        "correctAnswer": 0,
        "explanation": "Six Sigma is defined mathematically as achieving no more than 3.4 Defects Per Million Opportunities (DPMO), representing 99.99966% yield with a 1.5-sigma shift."
      },
      {
        "id": "Q-SSM-003",
        "question": "What are the two core pillars of the Toyota Production System (the TPS House)?",
        "options": [
          "Marketing and Accounting",
          "Just-In-Time (JIT) and Jidoka (Autonomation / Automation with human intelligence)",
          "Overtime work and large batch production",
          "Statistical regression and ANOVA testing"
        ],
        "correctAnswer": 1,
        "explanation": "The two pillars of TPS are Just-In-Time (producing only what is needed, when needed) and Jidoka (building in quality by automatically stopping when abnormalities occur)."
      },
      {
        "id": "Q-SSM-004",
        "question": "Who is recognized as the father of Six Sigma at Motorola in the early 1980s?",
        "options": [
          "Henry Ford",
          "Bill Smith",
          "Taiichi Ohno",
          "Jack Welch"
        ],
        "correctAnswer": 1,
        "explanation": "Bill Smith, a senior engineer at Motorola, recognized that higher component complexity required raising quality standards to Six Sigma, formally founding the methodology."
      },
      {
        "id": "Q-SSM-005",
        "question": "Which CEO championed Six Sigma at General Electric (GE) in the mid-1990s, generating billions in audited savings?",
        "options": [
          "Jack Welch",
          "Steve Jobs",
          "Kiichiro Toyoda",
          "Frederick Taylor"
        ],
        "correctAnswer": 0,
        "explanation": "Jack Welch instituted Six Sigma across GE in 1995, mandating it for managerial advancement and establishing it as the global benchmark for corporate excellence."
      },
      {
        "id": "Q-SSM-006",
        "question": "What is the primary synergy achieved by combining Lean and Six Sigma into Lean Six Sigma (LSS)?",
        "options": [
          "Lean eliminates waste and accelerates velocity, while Six Sigma reduces variation and eliminates defects",
          "Lean focuses exclusively on software while Six Sigma focuses on hardware",
          "Six Sigma replaces the need for process maps",
          "Lean eliminates the need for data collection"
        ],
        "correctAnswer": 0,
        "explanation": "Lean and Six Sigma complement each other: Lean optimizes flow and eliminates non-value-added waste, while Six Sigma stabilizes the process by reducing variation and defects."
      },
      {
        "id": "Q-SSM-007",
        "question": "What does the Japanese term 'Jidoka' mean in the context of Lean Manufacturing?",
        "options": [
          "Running machines at maximum speed 24/7",
          "Automation with a human touch: empowering machines or workers to stop the line immediately when an abnormality is detected",
          "Storing large piles of inventory between stations",
          "Working overtime on weekends"
        ],
        "correctAnswer": 1,
        "explanation": "Jidoka means autonomation—giving equipment and operators the ability to detect defects immediately and stop production, preventing defects from moving downstream."
      },
      {
        "id": "Q-SSM-008",
        "question": "What yield percentage is achieved by a process operating at a 3-Sigma level of quality?",
        "options": [
          "93.32% (yielding ~66,807 DPMO)",
          "99.99966%",
          "50.0%",
          "30.85%"
        ],
        "correctAnswer": 0,
        "explanation": "A 3-Sigma process produces approximately 66,807 defects per million opportunities, yielding a 93.32% success rate, which is inadequate for modern high-volume operations."
      },
      {
        "id": "Q-SSM-009",
        "question": "In Deming's management philosophy, what percentage of quality problems are attributable to the management system rather than frontline workers?",
        "options": [
          "Less than 5%",
          "Approximately 85% to 94%",
          "Exactly 50%",
          "100% of errors are caused by frontline workers"
        ],
        "correctAnswer": 1,
        "explanation": "Deming stated that 85% (and later revised to 94%) of quality issues are caused by the system designed and controlled by management, with only a small fraction due to special worker causes."
      },
      {
        "id": "Q-SSM-010",
        "question": "What was the Malcolm Baldrige National Quality Award?",
        "options": [
          "A tax incentive for importing goods",
          "A prestigious United States presidential award established in 1987 to recognize organizations for quality and operational excellence (won by Motorola in 1988)",
          "A sports trophy for factory workers",
          "A certification for accounting firms"
        ],
        "correctAnswer": 1,
        "explanation": "The Malcolm Baldrige National Quality Award was created by the US Congress in 1987 to promote quality awareness; Motorola was the inaugural winner in 1988."
      }
    ]
  },
  {
    "id": "ASM-SSM-002",
    "courseId": "CRS-SSM-001",
    "chapterId": "CH-SSM-002",
    "title": "Assessment: Lean Principles, Synergies & The 8 Deadly Wastes",
    "passingScore": 70,
    "questions": [
      {
        "id": "Q-SSM-011",
        "question": "What does the Japanese term 'Muri' represent in Lean operations?",
        "options": [
          "Wasteful activity",
          "Overburdening workers, machinery, or systems beyond their sustainable capacity",
          "Unevenness in workflow",
          "Continuous improvement"
        ],
        "correctAnswer": 1,
        "explanation": "Muri refers to overburden or unreasonableness—pushing personnel or machinery beyond natural limits, resulting in burnout, breakdowns, and safety hazards."
      },
      {
        "id": "Q-SSM-012",
        "question": "Which of the following is considered the worst of all Lean wastes because it conceals all other operational dysfunctions?",
        "options": [
          "Motion",
          "Overproduction",
          "Waiting",
          "Transportation"
        ],
        "correctAnswer": 1,
        "explanation": "Overproduction produces inventory ahead of customer demand, consuming capital, occupying warehouse space, and masking defects, maintenance issues, and process bottlenecks."
      },
      {
        "id": "Q-SSM-013",
        "question": "What are the three criteria required for an activity to be classified as 'Value-Added' (VA)?",
        "options": [
          "It takes a long time, requires a manager, and costs money",
          "The customer is willing to pay for it, it transforms the form/fit/function of the product/service, and it is done right the first time",
          "It is documented in an SOP, audited by QA, and entered into an ERP",
          "It uses automated machines, requires overtime, and produces inventory"
        ],
        "correctAnswer": 1,
        "explanation": "To be Value-Added: (1) The customer must care/be willing to pay, (2) the product or service must be transformed, and (3) it must be done correctly the first time."
      },
      {
        "id": "Q-SSM-014",
        "question": "In the DOWNTIME acronym for the 8 deadly wastes, what does the 'N' stand for?",
        "options": [
          "Negative thinking",
          "Non-Utilized Talent / Human Potential",
          "Network latency",
          "New equipment"
        ],
        "correctAnswer": 1,
        "explanation": "N stands for Non-Utilized Talent—failing to engage employees' skills, ideas, creativity, and problem-solving abilities."
      },
      {
        "id": "Q-SSM-015",
        "question": "What does 'Mura' mean in Lean manufacturing?",
        "options": [
          "Unevenness, inconsistency, or fluctuation in production volume, scheduling, or demand",
          "Polishing metal brackets",
          "Error-proofing tools",
          "Daily standup meetings"
        ],
        "correctAnswer": 0,
        "explanation": "Mura represents unevenness or irregularity. Fluctuations in pace or batch sizes cause alternating cycles of overburden (Muri) and idle waste (Muda)."
      },
      {
        "id": "Q-SSM-016",
        "question": "In the Lean 'Sea of Inventory' metaphor, what do the rocks beneath the water represent?",
        "options": [
          "Valuable minerals owned by the factory",
          "Hidden operational dysfunctions such as machine breakdowns, poor suppliers, high defect rates, and long changeovers",
          "Customer payment records",
          "Office furniture"
        ],
        "correctAnswer": 1,
        "explanation": "The water is inventory; the rocks are underlying process dysfunctions. Keeping inventory high allows companies to float over problems without ever fixing root causes."
      },
      {
        "id": "Q-SSM-017",
        "question": "How is an activity classified if it adds no direct customer value but is required by law or safety regulations (e.g. tax filing, OSHA safety audit)?",
        "options": [
          "Pure Waste (Muda)",
          "Business Non-Value-Added (BNVA / Necessary Waste)",
          "Value-Added (VA)",
          "Overproduction"
        ],
        "correctAnswer": 1,
        "explanation": "BNVA (Business Non-Value-Added) activities do not directly benefit the customer but are required by regulations, accounting, or legal mandates. The goal is to minimize them."
      },
      {
        "id": "Q-SSM-018",
        "question": "In typical un-optimized service and manufacturing processes, what percentage of total lead time is actually Value-Added?",
        "options": [
          "Over 90%",
          "Usually less than 5%",
          "Exactly 50%",
          "Around 75%"
        ],
        "correctAnswer": 1,
        "explanation": "In most traditional processes, actual value-added transformation time accounts for less than 5% of total lead time; over 95% of the time is spent waiting, in queue, or moving."
      },
      {
        "id": "Q-SSM-019",
        "question": "Which of the following is an example of the waste of 'Motion'?",
        "options": [
          "A worker walking across the factory floor multiple times to retrieve missing hand tools",
          "Shipping finished goods to another state",
          "Scrapping a misprinted label",
          "Producing 50 extra units"
        ],
        "correctAnswer": 0,
        "explanation": "Motion waste involves unnecessary physical movement of people (bending, walking, searching for tools) that does not add value to the product."
      },
      {
        "id": "Q-SSM-020",
        "question": "What is an example of 'Extra Processing' waste in a digital software or banking workflow?",
        "options": [
          "Customers receiving their loan approval in 5 minutes",
          "Requiring 4 redundant layers of managerial sign-off for a routine $25 expense report",
          "Software code containing zero bugs",
          "Sending an automated email receipt"
        ],
        "correctAnswer": 1,
        "explanation": "Extra processing waste occurs when more work, complexity, or inspection is performed than required by the customer or business (e.g. redundant approvals)."
      }
    ]
  },
  {
    "id": "ASM-SSM-003",
    "courseId": "CRS-SSM-001",
    "chapterId": "CH-SSM-003",
    "title": "Assessment: DMAIC Framework Architecture & Project Charters",
    "passingScore": 70,
    "questions": [
      {
        "id": "Q-SSM-021",
        "question": "When should the DMADV methodology be selected instead of DMAIC?",
        "options": [
          "When improving an existing, stable manufacturing line",
          "When designing a brand-new product, service, or process from scratch, or when an existing process is so broken that incremental improvement is futile",
          "When the project team has no budget",
          "When statistical tools are forbidden"
        ],
        "correctAnswer": 1,
        "explanation": "DMADV (Define, Measure, Analyze, Design, Verify) is used for Design for Six Sigma (DFSS) to create new processes/products, whereas DMAIC optimizes existing ones."
      },
      {
        "id": "Q-SSM-022",
        "question": "What is a fatal flaw in a Six Sigma Problem Statement?",
        "options": [
          "Including baseline data and standard deviation metrics",
          "Assigning blame or presuming a pre-baked solution before the data has been analyzed",
          "Specifying the location and time period of the problem",
          "Quantifying the financial cost of defects"
        ],
        "correctAnswer": 1,
        "explanation": "A problem statement must describe what is happening, where, when, and the magnitude. It must never state a cause or solution, which biases the investigation."
      },
      {
        "id": "Q-SSM-023",
        "question": "In which DMAIC phase is the Measurement System Analysis (Gage R&R) executed?",
        "options": [
          "Define",
          "Measure",
          "Improve",
          "Control"
        ],
        "correctAnswer": 1,
        "explanation": "Measurement System Analysis (MSA / Gage R&R) is conducted during the Measure phase to ensure that measurement data is accurate and precise before analyzing root causes."
      },
      {
        "id": "Q-SSM-024",
        "question": "What are the three possible outcomes of an executive Tollgate Review?",
        "options": [
          "Hire, Fire, Promote",
          "Go (Approved), Rework (Conditional), or Kill/Pivot (Terminated)",
          "Plan, Do, Check",
          "Pass, Fail, Inconclusive"
        ],
        "correctAnswer": 1,
        "explanation": "Tollgate reviews evaluate phase deliverables, resulting in Go (proceed to next phase), Rework (address gaps and reconvene), or Kill/Pivot (terminate the project)."
      },
      {
        "id": "Q-SSM-025",
        "question": "What is the primary objective of the Control phase in DMAIC?",
        "options": [
          "To brainstorm new product ideas",
          "To institutionalize process controls (SPC, SOPs, Control Plans) to sustain the gains and prevent the process from backsliding into legacy habits",
          "To calculate the initial baseline capability",
          "To create the Project Charter"
        ],
        "correctAnswer": 1,
        "explanation": "The Control phase establishes standard operating procedures, training, and statistical process control charts to ensure improvements are permanently sustained."
      },
      {
        "id": "Q-SSM-026",
        "question": "Which role in a Six Sigma project typically holds direct budget authority, removes organizational roadblocks, and approves project charters?",
        "options": [
          "Green Belt",
          "Project Champion / Executive Sponsor",
          "External Consultant",
          "Frontline Operator"
        ],
        "correctAnswer": 1,
        "explanation": "The Project Champion/Sponsor is an executive leader who provides resources, aligns the project with business strategy, and breaks through organizational barriers."
      },
      {
        "id": "Q-SSM-027",
        "question": "What does the SMART criteria require for a Six Sigma Goal Statement?",
        "options": [
          "Specific, Measurable, Actionable/Attainable, Relevant, Time-bound",
          "Statistical, Mathematical, Audited, Rational, Tested",
          "Simple, Minimal, Automatic, Robust, Thorough",
          "Systematic, Modern, Agile, Rapid, Technical"
        ],
        "correctAnswer": 0,
        "explanation": "SMART stands for Specific, Measurable, Actionable/Attainable, Relevant, and Time-bound, ensuring the goal is clear, quantifiable, and bound by a target date."
      },
      {
        "id": "Q-SSM-028",
        "question": "What is 'Scope Creep' in Six Sigma project governance?",
        "options": [
          "Finishing a project ahead of schedule",
          "The uncontrolled expansion of project boundaries into unrelated processes or departments without adjusting time and resources",
          "Using microscopes to inspect parts",
          "Hiring too many Black Belts"
        ],
        "correctAnswer": 1,
        "explanation": "Scope creep happens when project boundaries expand beyond the original charter, diluting team focus and causing projects to run over schedule and budget."
      },
      {
        "id": "Q-SSM-029",
        "question": "In the Analyze phase, what standard alpha ($alpha$) threshold is typically used in hypothesis testing to confirm statistical significance?",
        "options": [
          "p < 0.50",
          "p < 0.05 (5% risk of Type I error)",
          "p > 0.95",
          "p = 0.00"
        ],
        "correctAnswer": 1,
        "explanation": "The standard significance level is $alpha = 0.05$. A $p$-value less than 0.05 provides statistically significant evidence to reject the null hypothesis and confirm a root cause."
      },
      {
        "id": "Q-SSM-030",
        "question": "Who formally assumes long-term ownership of the improved process upon project completion at the end of the Control phase?",
        "options": [
          "The Process Owner",
          "The Black Belt leader",
          "The external auditor",
          "The IT department"
        ],
        "correctAnswer": 0,
        "explanation": "The Process Owner is the operational manager responsible for day-to-day execution; they sign off and maintain the Control Plan once the project team disbands."
      }
    ]
  },
  {
    "id": "ASM-SSM-004",
    "courseId": "CRS-SSM-001",
    "chapterId": "CH-SSM-004",
    "title": "Assessment: Voice of the Customer (VOC) & CTQ Trees",
    "passingScore": 70,
    "questions": [
      {
        "id": "Q-SSM-031",
        "question": "In the Kano Model, how does customer satisfaction respond to the presence or absence of a 'Must-Be' (Basic) requirement?",
        "options": [
          "Customer satisfaction skyrockets when present, but absence goes unnoticed",
          "Its presence creates zero special satisfaction (taken for granted), but its absence causes extreme dissatisfaction and outrage",
          "Satisfaction increases linearly with every additional unit delivered",
          "Customers prefer when Must-Be features are removed"
        ],
        "correctAnswer": 1,
        "explanation": "Must-Be requirements are baseline expectations (e.g. clean sheets in a hotel). Customers take them for granted when present, but their absence triggers immediate fury."
      },
      {
        "id": "Q-SSM-032",
        "question": "What is an Affinity Diagram (KJ Method) used for during the Define phase?",
        "options": [
          "Calculating the standard deviation of chemical samples",
          "Organizing large volumes of unstructured qualitative customer statements and ideas into natural thematic groupings",
          "Designing electrical schematics",
          "Writing code for an automated robot"
        ],
        "correctAnswer": 1,
        "explanation": "Affinity Diagrams allow teams to group unstructured qualitative statements (VOC) into thematic categories using collaborative clustering."
      },
      {
        "id": "Q-SSM-033",
        "question": "What is the phenomenon known as 'Kano Decay'?",
        "options": [
          "The physical rotting of wooden shipping pallets",
          "The natural transition over time where exciting Delighter features decay into expected Performance features and eventually become basic Must-Be requirements",
          "The loss of data in a relational database",
          "Customer satisfaction declining when prices increase"
        ],
        "correctAnswer": 1,
        "explanation": "Kano Decay describes how innovative delighters (e.g., smartphone touchscreen, free Wi-Fi) become standard expectations over time as the market matures."
      },
      {
        "id": "Q-SSM-034",
        "question": "What are the three structural levels of a Critical to Quality (CTQ) Tree?",
        "options": [
          "Level 1: Goal, Level 2: Task, Level 3: Result",
          "Level 1: Voice of Customer (VOC), Level 2: Key Quality Driver, Level 3: Critical to Quality (CTQ) Metric with specification limits",
          "Level 1: Inputs, Level 2: Operations, Level 3: Profit",
          "Level 1: Problem, Level 2: Solution, Level 3: Review"
        ],
        "correctAnswer": 1,
        "explanation": "A CTQ tree translates broad VOC statements into Key Quality Drivers, which decompose into measurable CTQ metrics bounded by USL and LSL specifications."
      },
      {
        "id": "Q-SSM-035",
        "question": "How is an operational 'Defect' objectively defined in Six Sigma?",
        "options": [
          "Anything a manager personally dislikes",
          "Any event or instance where a product or service output falls outside the customer's specified tolerance limits (< LSL or > USL)",
          "An item that costs more than $100 to manufacture",
          "A software release that takes more than 1 week"
        ],
        "correctAnswer": 1,
        "explanation": "A defect is objectively defined as any failure to meet a customer requirement—specifically when a performance metric falls outside upper (USL) or lower (LSL) specification limits."
      },
      {
        "id": "Q-SSM-036",
        "question": "In the Kano Model, what characterizes a 'Performance' (One-Dimensional) attribute?",
        "options": [
          "Customer satisfaction is linearly proportional to the level of execution: the more you deliver, the more satisfied the customer is",
          "Customers dislike having more of this feature",
          "It has zero impact on customer perception",
          "It is completely unexpected by the customer"
        ],
        "correctAnswer": 0,
        "explanation": "Performance attributes exhibit a direct linear relationship: better execution (e.g. higher MPG in a car, faster query response time) yields directly higher satisfaction."
      },
      {
        "id": "Q-SSM-037",
        "question": "What is an 'Attractive / Delighter' feature in Kano analysis?",
        "options": [
          "An unexpected innovation that surprises and delights the customer, causing high satisfaction when present with no dissatisfaction if absent",
          "A basic legal requirement",
          "A feature that customer surveys explicitly demanded in writing",
          "An expensive add-on that reduces battery life"
        ],
        "correctAnswer": 0,
        "explanation": "Delighters are unexpected features that create genuine delight. Because customers didn't anticipate them, their absence causes no dissatisfaction."
      },
      {
        "id": "Q-SSM-038",
        "question": "Why can't an operational improvement project be measured directly against the raw statement 'Customer wants fast service'?",
        "options": [
          "Because fast service is impossible to achieve",
          "Because 'fast' is a subjective qualitative descriptor; it must be translated into an exact operational metric (e.g. response time <= 45 seconds)",
          "Because customers lie on surveys",
          "Because Six Sigma only applies to physical manufacturing"
        ],
        "correctAnswer": 1,
        "explanation": "Subjective terms like 'fast' cannot be measured or statistically tested. They must be operationalized into concrete metrics with units and specification limits."
      },
      {
        "id": "Q-SSM-039",
        "question": "What is an 'Indifferent' requirement in the Kano Model?",
        "options": [
          "A feature that customers simply do not care about either way, representing potential wasted development expense",
          "A feature that makes customers angry",
          "The most critical feature of the product",
          "A feature that only managers care about"
        ],
        "correctAnswer": 0,
        "explanation": "Indifferent features provide no perceptible value to the customer whether present or absent. Investing engineering effort into them is pure waste."
      },
      {
        "id": "Q-SSM-040",
        "question": "What is the primary risk of relying solely on unsolicited complaint logs for VOC data?",
        "options": [
          "Complaint logs are too expensive to maintain",
          "They suffer from severe selection bias, capturing only the most vocal or angry customers while missing the silent majority who defect to competitors without complaining",
          "Complaint logs only capture positive feedback",
          "Computers cannot store text logs"
        ],
        "correctAnswer": 1,
        "explanation": "Only a small fraction of dissatisfied customers submit formal complaints; most simply abandon the product. Relying solely on complaint logs creates a skewed picture of quality."
      }
    ]
  },
  {
    "id": "ASM-SSM-005",
    "courseId": "CRS-SSM-001",
    "chapterId": "CH-SSM-005",
    "title": "Assessment: High-Level Process Mapping (SIPOC & Boundaries)",
    "passingScore": 70,
    "questions": [
      {
        "id": "Q-SSM-041",
        "question": "What does the acronym SIPOC stand for?",
        "options": [
          "Standards, Inspection, Precision, Operations, Control",
          "Suppliers, Inputs, Process, Outputs, Customers",
          "Strategy, Investment, Profit, Objectives, Capital",
          "Safety, Inventory, Planning, Organization, Culture"
        ],
        "correctAnswer": 1,
        "explanation": "SIPOC stands for Suppliers, Inputs, Process, Outputs, and Customers, summarizing high-level process flow."
      },
      {
        "id": "Q-SSM-042",
        "question": "Why do experienced Lean Six Sigma practitioners often construct a SIPOC in reverse order (COPIS)?",
        "options": [
          "Because writing backwards takes less ink",
          "To ensure the entire analysis is anchored in customer needs and outputs before defining required inputs and suppliers",
          "Because suppliers refuse to participate in process mapping",
          "Because statistical software requires reverse entry"
        ],
        "correctAnswer": 1,
        "explanation": "Starting with the Customer (COPIS) ensures that process steps and inputs are designed specifically to produce the outputs that satisfy customer expectations."
      },
      {
        "id": "Q-SSM-043",
        "question": "How many macro-level steps should typically be included in the 'Process' column of a SIPOC diagram?",
        "options": [
          "At least 50 detailed micro-steps",
          "Between 4 and 7 high-level transformation steps",
          "Exactly 1 step",
          "Hundreds of steps detailing every decision tree"
        ],
        "correctAnswer": 1,
        "explanation": "A SIPOC is a high-level macro view. It should contain only 4 to 7 major steps, avoiding deep operational detail or decision branching."
      },
      {
        "id": "Q-SSM-044",
        "question": "How does a SIPOC diagram establish project boundaries?",
        "options": [
          "By drawing physical lines on the factory floor",
          "The first step of the Process column defines the Start boundary, and the final step defines the Stop boundary of the project scope",
          "By setting employee working hours",
          "By limiting the budget to $10,000"
        ],
        "correctAnswer": 1,
        "explanation": "The initial and concluding process steps in the SIPOC establish the precise start and stop points of the workflow, defining what is in-scope vs. out-of-scope."
      },
      {
        "id": "Q-SSM-045",
        "question": "In the mathematical model $Y = f(X)$, what component of the SIPOC represents the $Y$ variable?",
        "options": [
          "Suppliers",
          "Outputs (and Customer CTQs)",
          "Inputs",
          "Office desks"
        ],
        "correctAnswer": 1,
        "explanation": "Outputs ($Y$) represent the dependent outcome metrics (e.g. cycle time, defects) which are driven by upstream Inputs and Process steps ($X$)."
      },
      {
        "id": "Q-SSM-046",
        "question": "Which of the following would be categorized as an 'Input' in a software customer support SIPOC?",
        "options": [
          "The resolved customer issue",
          "A customer submitting an error ticket containing system logs and user description",
          "The software support technician",
          "The customer satisfaction survey rating"
        ],
        "correctAnswer": 1,
        "explanation": "The incoming support ticket and diagnostic logs are the raw information inputs consumed and transformed by the support resolution process."
      },
      {
        "id": "Q-SSM-047",
        "question": "What is the primary danger of skipping the SIPOC diagram and immediately creating detailed micro-level process maps?",
        "options": [
          "The team uses too much paper",
          "Teams get bogged down in minutiae, argue over local exceptions, and lose sight of systemic boundaries and end-to-end customer value",
          "Process maps are illegal without a SIPOC",
          "Detailed maps run faster in software"
        ],
        "correctAnswer": 1,
        "explanation": "Without a macro SIPOC anchor, teams quickly get lost in granular task variations, edge cases, and departmental debates, missing major systemic handoff issues."
      },
      {
        "id": "Q-SSM-048",
        "question": "Can an internal department be classified as a 'Customer' in a SIPOC diagram?",
        "options": [
          "No, customers can only be external consumers who pay money",
          "Yes, downstream internal departments (e.g. Assembly receiving parts from Machining) are internal customers whose requirements must be satisfied",
          "Only if the department is in another country",
          "Only if approved by the CEO"
        ],
        "correctAnswer": 1,
        "explanation": "Lean principles recognize both external and internal customers. Any downstream department receiving the output of a prior step is an internal customer."
      },
      {
        "id": "Q-SSM-049",
        "question": "What role do 'Suppliers' play in a SIPOC?",
        "options": [
          "They buy the finished product",
          "They provide the critical information, materials, resources, or services that feed into the process",
          "They audit the company's financial books",
          "They supervise factory employees"
        ],
        "correctAnswer": 1,
        "explanation": "Suppliers are the originators of incoming resources, data, parts, or forms required by the process steps."
      },
      {
        "id": "Q-SSM-050",
        "question": "In a SIPOC, if an output does not have a clearly identified customer, what does that signal to the operations manager?",
        "options": [
          "The output is high quality",
          "The output is likely non-value-added waste ($Muda$) that should be investigated and potentially eliminated",
          "The customer is anonymous",
          "The process is operating at Six Sigma"
        ],
        "correctAnswer": 1,
        "explanation": "If a process produces an output that no customer (internal or external) consumes or values (e.g. an unread daily report), it represents pure wasted activity."
      }
    ]
  },
  {
    "id": "ASM-SSM-006",
    "courseId": "CRS-SSM-001",
    "chapterId": "CH-SSM-006",
    "title": "Assessment: Financial Valuation, COPQ & Rolled First Pass Yield",
    "passingScore": 70,
    "questions": [
      {
        "id": "Q-SSM-051",
        "question": "What does Cost of Poor Quality (COPQ) typically represent as a percentage of gross revenue in average organizations operating at 3-Sigma to 4-Sigma?",
        "options": [
          "Less than 1%",
          "Between 15% and 30% of total gross revenue",
          "Exactly 50%",
          "Zero, because defects are accounted for in pricing"
        ],
        "correctAnswer": 1,
        "explanation": "In typical 3-to-4 Sigma organizations, the Cost of Poor Quality (scrap, rework, inspection, warranty claims) consumes between 15% and 30% of annual revenue."
      },
      {
        "id": "Q-SSM-052",
        "question": "In the PAF model of quality costs, which category does operator training and error-proofing (Poka-Yoke) fall under?",
        "options": [
          "Appraisal Cost",
          "Prevention Cost (Cost of Good Quality)",
          "Internal Failure Cost",
          "External Failure Cost"
        ],
        "correctAnswer": 1,
        "explanation": "Prevention costs are proactive investments made in design, training, and mistake-proofing to prevent defects from being produced initially."
      },
      {
        "id": "Q-SSM-053",
        "question": "What is an 'Internal Failure Cost' in the PAF model?",
        "options": [
          "Costs incurred when defective products reach the end consumer",
          "Costs incurred from defects detected and remediated inside the organization before the product/service reaches the customer (e.g. rework, internal scrap)",
          "The cost of buying office supplies",
          "The salary of the Chief Executive Officer"
        ],
        "correctAnswer": 1,
        "explanation": "Internal failure costs occur when defects are caught before shipment or delivery to the customer, requiring scrapping, re-machining, or re-processing."
      },
      {
        "id": "Q-SSM-054",
        "question": "What is the key difference between 'Hard Savings' and 'Soft Savings' in Six Sigma financial accounting?",
        "options": [
          "Hard savings are in cash dollars; soft savings are paid in company stock",
          "Hard savings directly reduce P&L operational expenses (cash savings); soft savings represent cost avoidance or capacity creation that does not directly reduce current cash outlay",
          "Soft savings are audited by the IRS; hard savings are not",
          "There is no difference between them"
        ],
        "correctAnswer": 1,
        "explanation": "Hard savings directly reduce budget lines on the financial P&L. Soft savings represent capacity creation, time savings, or cost avoidance."
      },
      {
        "id": "Q-SSM-055",
        "question": "A manufacturing line has 4 sequential workstations. The First Pass Yield (FPY) of each station is: Station 1 = 90%, Station 2 = 90%, Station 3 = 90%, Station 4 = 90%. What is the Rolled First Pass Yield (RFPY)?",
        "options": [
          "90.0%",
          "65.61% (0.90 * 0.90 * 0.90 * 0.90)",
          "10.0%",
          "81.0%"
        ],
        "correctAnswer": 1,
        "explanation": "Rolled First Pass Yield is the product of individual stage yields: $0.90 \times 0.90 \times 0.90 \times 0.90 = 0.6561$ or 65.61%. Over 34% of products require rework or are scrapped!"
      },
      {
        "id": "Q-SSM-056",
        "question": "What does the '1-10-100 Rule' demonstrate regarding quality costs?",
        "options": [
          "Every factory needs 1 manager, 10 supervisors, and 100 workers",
          "The financial cost to remediate a defect escalates by an order of magnitude at each stage: $1 to prevent, $10 to detect internally, and $100+ once it reaches the customer",
          "It takes 100 days to achieve Six Sigma",
          "Processes must have 1 input, 10 steps, and 100 outputs"
        ],
        "correctAnswer": 1,
        "explanation": "The 1-10-100 Rule proves that preventing defects early costs a fraction of catching them during inspection, which in turn costs a fraction of resolving external customer escapes."
      },
      {
        "id": "Q-SSM-057",
        "question": "What is the 'Hidden Factory' in Lean Six Sigma terminology?",
        "options": [
          "An illegal manufacturing facility",
          "The undocumented capacity, labor hours, and machinery consumed solely by fixing rework, re-testing, and correcting errors within an organization",
          "A factory built underground",
          "The portion of the company that produces secret patents"
        ],
        "correctAnswer": 1,
        "explanation": "The 'Hidden Factory' refers to the non-productive capacity, labor, and resources spent repeating work, investigating defects, and performing rework."
      },
      {
        "id": "Q-SSM-058",
        "question": "Which category in the PAF model represents the most catastrophic and costly type of quality failure?",
        "options": [
          "Prevention Costs",
          "Appraisal Costs",
          "External Failure Costs (recalls, lawsuits, brand damage, customer loss)",
          "Inspection Costs"
        ],
        "correctAnswer": 2,
        "explanation": "External failures occur after delivery. They are the most destructive, leading to customer churn, warranty claims, product recalls, and severe brand damage."
      },
      {
        "id": "Q-SSM-059",
        "question": "Why do Six Sigma Black Belts require corporate Finance Controller validation on Project Charters?",
        "options": [
          "To verify that project financial savings calculations are real, verifiable on the P&L, and adhere to corporate accounting rules",
          "Because engineers are not allowed to use calculators",
          "To obtain permission to purchase software",
          "To ensure the Black Belt gets paid a bonus"
        ],
        "correctAnswer": 0,
        "explanation": "Finance validation ensures savings estimates are rigorous and auditable, distinguishing genuine hard-dollar cost reductions from theoretical gains."
      },
      {
        "id": "Q-SSM-060",
        "question": "What is an Appraisal Cost in quality financial accounting?",
        "options": [
          "The fee paid to an appraiser when selling a building",
          "The cost of activities performed to inspect, test, or evaluate materials and products to ensure conformance to requirements (e.g. lab testing, gauge calibration)",
          "The cost of scrapped raw material",
          "The price of advertising products"
        ],
        "correctAnswer": 1,
        "explanation": "Appraisal costs are expenses associated with inspecting, testing, and auditing products or services to assess their quality and detect defects."
      }
    ]
  }
]
};
