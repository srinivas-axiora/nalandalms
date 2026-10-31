// Phase 4: Chapters 19-24 and Assessments (ASM-SSM-019 to ASM-SSM-024)
export const phase4 = {
  chapters: [
  {
    "id": "CH-SSM-019",
    "courseId": "CRS-SSM-001",
    "title": "Design of Experiments (DOE): Full Factorial, Fractional Factorial, Main Effects & Interaction Plots",
    "order": 19,
    "estimatedMinutes": 65,
    "content": "\n      <h2>1. The Power of Active Experimentation</h2>\n      <p>In the Analyze phase, we observed historical observational data to identify candidate root causes. However, observational data has an inherent limitation: passive observation cannot separate correlated variables or discover breakthrough combinations of parameters. In the <strong>Improve Phase</strong>, operations managers transition to <strong>Design of Experiments (DOE)</strong>—the gold standard of active scientific experimentation.</p>\n      \n      <p>Pioneered by Sir Ronald Fisher at Rothamsted Agricultural Station, DOE intentionally introduces planned changes to process input variables (Factors) to observe and mathematically model their impact on the outcome response ($Y$).</p>\n\n      <h2>2. One-Factor-at-a-Time (OFAT) vs. Factorial Design</h2>\n      <p>The traditional, intuitive method of experimentation is <strong>OFAT (One-Factor-at-a-Time)</strong>: an engineer holds pressure and speed constant, changes temperature from 150&deg;C to 200&deg;C, observes the output, and then tests speed. OFAT is a severe engineering anti-pattern:</p>\n\n      <table class=\"table table-bordered\">\n        <thead>\n          <tr>\n            <th>Experimental Dimension</th>\n            <th>OFAT (One-Factor-at-a-Time)</th>\n            <th>DOE (Factorial Design)</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td><strong>Interaction Detection</strong></td>\n            <td><strong>Blind to interactions!</strong> Cannot detect if Temperature works only when Pressure is high.</td>\n            <td><strong>Full interaction detection!</strong> Simultaneously tests all factor combinations and interaction terms.</td>\n          </tr>\n          <tr>\n            <td><strong>Experimental Runs Required</strong></td>\n            <td>High: Requires dozens of runs to explore multiple factors, with low statistical precision.</td>\n            <td>Low: Orthogonal designs maximize statistical power with minimum experimental runs.</td>\n          </tr>\n          <tr>\n            <td><strong>Optimal Solution Discovery</strong></td>\n            <td>Rarely finds true global optimum; gets trapped on false local plateaus.</td>\n            <td>Maps response surface to uncover true multi-variable global optimum setpoints.</td>\n          </tr>\n          <tr>\n            <td><strong>Cost & Efficiency</strong></td>\n            <td>Expensive and wasteful; high risk of contradictory conclusions.</td>\n            <td>Mathematically optimized efficiency via orthogonal matrices.</td>\n          </tr>\n        </tbody>\n      </table>\n\n      <h2>3. Two-Level Full Factorial Design ($2^k$)</h2>\n      <p>The most common industrial DOE is the <strong>$2^k$ Full Factorial Design</strong>, where $k$ factors are each tested at two discrete levels: <strong>Low ($-1$)</strong> and <strong>High ($+1$)</strong>.</p>\n      \n      <p>The total number of unique experimental treatment runs is:\n        $$N = 2^k$$\n      For a process with $k = 3$ factors (e.g. Temperature, Pressure, Belt Speed):\n        $$N = 2^3 = 8 \text{ experimental runs}$$\n      This design tests 3 Main Effects ($A, B, C$), 3 Two-Way Interactions ($AB, AC, BC$), and 1 Three-Way Interaction ($ABC$).\n      </p>\n\n      <pre><code class=\"language-text\">Standard 2^3 Orthogonal Array (Design Matrix):\nRun | Factor A (Temp) | Factor B (Press) | Factor C (Speed) | Response Y (Tensile Strength)\n 1  |      -1         |       -1         |       -1         |            42 MPa\n 2  |      +1         |       -1         |       -1         |            58 MPa\n 3  |      -1         |       +1         |       -1         |            44 MPa\n 4  |      +1         |       +1         |       -1         |            65 MPa\n 5  |      -1         |       -1         |       +1         |            40 MPa\n 6  |      +1         |       -1         |       +1         |            59 MPa\n 7  |      -1         |       +1         |       +1         |            46 MPa\n 8  |      +1         |       +1         |       +1         |            78 MPa (OPTIMUM!)</code></pre>\n\n      <h2>4. Fractional Factorial Designs ($2^{k-p}$) & Confounding / Aliasing</h2>\n      <p>When screening many variables (e.g. $k = 7$ factors), a Full Factorial requires $2^7 = 128$ runs—prohibitively expensive in physical production. Operations managers use <strong>Fractional Factorial Designs ($2^{k-p}$)</strong>, running a balanced subset (e.g. a half-fraction $2^{7-1} = 64$ runs, or a quarter-fraction $2^{7-2} = 32$ runs).</p>\n      \n      <p>The trade-off of fractional designs is <strong>Aliasing (Confounding)</strong>: higher-order interaction effects are mathematically entangled with main effects. Designs are classified by <strong>Resolution</strong>:</p>\n      <ul>\n        <li><strong>Resolution III:</strong> Main effects are confounded with two-way interactions ($A = BC$). Risky; acceptable only for crude initial screening.</li>\n        <li><strong>Resolution IV:</strong> Main effects are clean of two-way interactions, but two-way interactions are confounded with each other ($AB = CD$). Standard industrial workhorse.</li>\n        <li><strong>Resolution V:</strong> Main effects and two-way interactions are completely unconfounded with each other. Highly robust.</li>\n      </ul>\n\n      <div class=\"callout callout-info\">\n        <h4>The Sparsity of Effects Principle (Pareto in DOE)</h4>\n        <p>The Sparsity of Effects Principle posits that a process response is almost always driven by <strong>Main Effects and Low-Order (2-Way) Interactions</strong>. Three-way ($ABC$) and four-way ($ABCD$) interactions are virtually always non-significant random noise. Fractional factorials leverage this truth by deliberately sacrificing high-order interactions to slash experimental runs by 50% to 75%!</p>\n      </div>\n\n      <div class=\"video-container\">\n        <iframe src=\"https://www.youtube.com/embed/n4fC5r6oE6s\" title=\"Design of Experiments (DOE) Full and Fractional Factorial Masterclass\" allowfullscreen></iframe>\n      </div>\n    ",
    "summary": "Plan and execute Design of Experiments (DOE), contrast OFAT with orthogonal factorial matrices, design $2^k$ full factorials, evaluate interaction plots, and leverage fractional factorials ($2^{k-p}$).",
    "keyTakeaways": [
      "DOE intentionally perturbs inputs to discover optimal mathematical relationships and interaction synergies.",
      "One-Factor-at-a-Time (OFAT) is an engineering trap that is completely blind to multi-factor interactions.",
      "A $2^k$ full factorial evaluates $k$ factors at 2 levels across $2^k$ experimental runs.",
      "Fractional factorials ($2^{k-p}$) run balanced fractions, sacrificing high-order interactions to cut experimental costs.",
      "Resolution IV designs ensure main effects are clean of two-way interactions; the Sparsity of Effects principle confirms low-order terms dominate."
    ]
  },
  {
    "id": "CH-SSM-020",
    "courseId": "CRS-SSM-001",
    "title": "Lean Workcell Design & Flow: Continuous Flow, Cellular Manufacturing, Line Balancing & Bottleneck Theory (TOC)",
    "order": 20,
    "estimatedMinutes": 65,
    "content": "\n      <h2>1. The Death of Batch-and-Queue Production</h2>\n      <p>Traditional manufacturing and transactional operations were organized by functional departments: all milling machines in Room A, all heat treatment in Room B, all packaging in Room C. Work moved across the facility in massive batches of 500 units on pallets, spending 95% of total lead time sitting idle in queues. When a defect occurred, all 500 units in the batch were already contaminated.</p>\n      \n      <p>Lean operations transforms this fragmented topography into <strong>Continuous One-Piece Flow</strong> organized within <strong>Cellular Manufacturing Workcells</strong>.</p>\n\n      <h2>2. Cellular Manufacturing: The U-Shaped Workcell</h2>\n      <p>A cellular workcell arranges dissimilar machines and sequential processes in immediate physical proximity—typically in a <strong>U-Shape</strong>:</p>\n\n      <div class=\"callout callout-info\">\n        <h4>Architectural Advantages of the U-Shaped Cell</h4>\n        <ul>\n          <li><strong>Minimizes Footprint & Travel:</strong> Raw material entry and finished good exit are located at the open neck of the 'U', minimizing forklift travel and material handling.</li>\n          <li><strong>Flexible Multi-Skilled Manpower:</strong> A single cross-trained operator can easily pivot across 3 adjacent machines (e.g. lathe, deburr, inspect).</li>\n          <li><strong>Visual Transparency:</strong> Operators and supervisors have an unobstructed 360-degree line of sight across the entire value stream.</li>\n          <li><strong>Elastic Line Balancing:</strong> If customer demand doubles, 2 operators are placed in the cell; if demand drops by half, 1 operator manages the entire cell without altering physical layout.</li>\n        </ul>\n      </div>\n\n      <h2>3. Line Balancing & Operator Loading: The Yamazumi Chart</h2>\n      <p>To establish continuous flow without bottleneck blockages or workstation starvation, operations managers perform <strong>Line Balancing</strong>. A <strong>Yamazumi Chart</strong> (operator balance chart) stacks the elemental work content times for each operator alongside the customer <strong>Takt Time</strong>:</p>\n\n      <pre><code class=\"language-text\">Yamazumi Operator Balance Chart:\nTakt Time = 45 Seconds\n-------------------------------------------------------------------------\nOp 1 (Prep)      : [============== 38s =============]              (Under Takt - Idle 7s)\nOp 2 (Assembly)  : [====================== 52s ==================] (OVER TAKT! BOTTLENECK - Line Starvation!)\nOp 3 (Inspection): [=========== 30s ==========]                    (Under Takt - Idle 15s)\nOp 4 (Pack)      : [============== 40s =============]              (Under Takt - Idle 5s)\n-------------------------------------------------------------------------\nLine Balance Action: \nStrip 8s of non-value-added packaging prep from Op 2 and reassign to Op 1 and Op 3.\nNew Balance: Op 1 = 42s, Op 2 = 44s, Op 3 = 38s, Op 4 = 40s (ALL UNDER 45s TAKT TIME!).</code></pre>\n\n      <h2>4. Theory of Constraints (TOC) & The Five Focusing Steps</h2>\n      <p>Introduced by <strong>Eliyahu M. Goldratt</strong> in <em>The Goal</em>, the <strong>Theory of Constraints (TOC)</strong> asserts that any manageable system is limited in achieving higher throughput by a very small number of constraints (typically exactly one <strong>Bottleneck</strong>):</p>\n\n      $$\text{Total System Throughput} equiv \text{Throughput of the Bottleneck}$$\n\n      <div class=\"callout callout-warning\">\n        <h4>The Fallacy of Local Optimization</h4>\n        <p>An hour saved at a non-bottleneck workstation is an <strong>illusion and pure waste</strong>! Speeding up a non-bottleneck simply produces more stagnant WIP inventory that piles up in front of the bottleneck. <em>Only an hour saved at the bottleneck adds an hour to the entire enterprise throughput.</em></p>\n      </div>\n\n      <h3>Goldratt's Five Focusing Steps:</h3>\n      <ol>\n        <li><strong>Identify the system's constraint:</strong> Locate the single process step whose cycle time exceeds Takt time and accumulates massive WIP inventory in front of it.</li>\n        <li><strong>Exploit the constraint:</strong> Squeeze maximum output from the bottleneck with zero downtime. Never let the bottleneck take a lunch break, run scrap parts, or wait for materials!</li>\n        <li><strong>Subordinate everything else to the constraint:</strong> Slow down upstream workstations to match the bottleneck's pace (Drum-Buffer-Rope), preventing WIP flooding.</li>\n        <li><strong>Elevate the constraint:</strong> Invest capital, add automation, or offload tasks to increase the bottleneck's physical capacity.</li>\n        <li><strong>Prevent Inertia:</strong> Once the constraint is broken, go back to Step 1. Do NOT let inertia become the new constraint!</li>\n      </ol>\n\n      <div class=\"video-container\">\n        <iframe src=\"https://www.youtube.com/embed/5U_iK_fKzXw\" title=\"Cellular Manufacturing and Theory of Constraints Masterclass\" allowfullscreen></iframe>\n      </div>\n    ",
    "summary": "Design Lean cellular manufacturing workcells, eliminate batch-and-queue waste with one-piece flow, balance lines against Takt time using Yamazumi charts, and apply Goldratt's Theory of Constraints.",
    "keyTakeaways": [
      "Batch-and-queue production inflates inventory, elongates lead times, and conceals quality defects.",
      "U-shaped workcells minimize footprint, facilitate multi-skilled operator staffing, and support visual control.",
      "Yamazumi balance charts stack elemental task times against Takt time to redistribute work content evenly.",
      "Theory of Constraints dictates that overall system throughput is strictly governed by the single bottleneck resource.",
      "An hour saved at a non-bottleneck is an illusion; focus improvement investments exclusively on the constraint."
    ]
  },
  {
    "id": "CH-SSM-021",
    "courseId": "CRS-SSM-001",
    "title": "Just-In-Time (JIT) & Pull Systems: Kanban Sizing Calculations, Supermarkets & CONWIP",
    "order": 21,
    "estimatedMinutes": 65,
    "content": "\n      <h2>1. Push vs. Pull Manufacturing Paradigms</h2>\n      <p>Traditional manufacturing operates under a <strong>Push System</strong>: centralized MRP (Material Requirements Planning) systems forecast future demand months in advance and generate rigid production schedules. Upstream workstations build parts and blindly push them downstream regardless of whether downstream operations are ready to consume them, resulting in massive WIP warehouses and stockouts of critical parts.</p>\n      \n      <p>Lean operations mandates a <strong>Pull System (Just-In-Time)</strong>: <em>nothing is produced by upstream operations until a downstream customer signals consumption</em>. Production is paced strictly by real customer demand.</p>\n\n      <h2>2. The Physical Kanban Mechanism</h2>\n      <p>Invented by <strong>Taiichi Ohno</strong>, <strong>Kanban (看板 - Visual Card / Signal)</strong> is the execution mechanism of pull systems. When a downstream assembly station consumes a container of parts, the empty container (or attached laminated barcode card) is returned to the upstream supplying workstation. This visual card serves as the <strong>authorization signal to produce exactly one container of replacement parts</strong>.</p>\n\n      <div class=\"callout callout-info\">\n        <h4>The Six Non-Negotiable Rules of Kanban</h4>\n        <ol>\n          <li>Do not send defective parts downstream.</li>\n          <li>Downstream processes withdraw only what is needed, when needed.</li>\n          <li>Upstream processes produce only the exact quantity withdrawn by downstream.</li>\n          <li>Equalize production across all products (Heijunka).</li>\n          <li>Kanban is a visual fine-tuning tool: never produce anything without a Kanban card!</li>\n          <li>Stabilize and rationalize the process to reduce the number of cards over time.</li>\n        </ol>\n      </div>\n\n      <h2>3. Scientific Kanban Sizing Formula</h2>\n      <p>How many Kanban containers must circulate in a loop to guarantee zero stockouts while minimizing inventory waste? Operations managers use the standard <strong>Kanban Sizing Equation</strong>:</p>\n\n      $$K = \frac{D \times L \times (1 + S)}{C}$$\n\n      <table class=\"table table-bordered\">\n        <thead>\n          <tr>\n            <th>Variable</th>\n            <th>Operational Meaning</th>\n            <th>Example Unit</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td><strong>$K$</strong></td>\n            <td><strong>Number of Kanban Cards / Containers</strong></td>\n            <td>Integer count (always rounded <em>up</em> to nearest integer!).</td>\n          </tr>\n          <tr>\n            <td><strong>$D$</strong></td>\n            <td><strong>Average Demand Rate</strong></td>\n            <td>Units required per unit of time (e.g. 50 parts per hour).</td>\n          </tr>\n          <tr>\n            <td><strong>$L$</strong></td>\n            <td><strong>Replenishment Lead Time</strong></td>\n            <td>Total time to replenish (Processing Time + Wait Time + Move Time + Changeover Time).</td>\n          </tr>\n          <tr>\n            <td><strong>$S$</strong></td>\n            <td><strong>Safety Factor ($alpha$)</strong></td>\n            <td>Buffer decimal (typically $0.10\text{ to }0.25$, or 10%–25% safety reserve).</td>\n          </tr>\n          <tr>\n            <td><strong>$C$</strong></td>\n            <td><strong>Container Capacity</strong></td>\n            <td>Standard lot size per bin (e.g. 20 parts per bin).</td>\n          </tr>\n        </tbody>\n      </table>\n\n      <div class=\"callout callout-info\">\n        <h4>Kanban Calculation in Action</h4>\n        <p>A precision assembly line consumes <strong>$D = 80 \text{ sensors/hour}$</strong>.\n          <ul>\n            <li>Supplying machine lead time: $L = 2.5 \text{ hours}$ (manufacturing + transit).</li>\n            <li>Management establishes a safety buffer of $S = 0.15$ (15%).</li>\n            <li>Standard tote container capacity: $C = 25 \text{ sensors/tote}$.</li>\n          </ul>\n          $$K = \frac{80 \times 2.5 \times (1 + 0.15)}{25} = \frac{200 \times 1.15}{25} = \frac{230}{25} = 9.2 implies mathbf{10 \text{ Kanban Cards / Totes}}$$\n          Exactly 10 totes circulate. Maximum total system inventory is strictly capped at $10 \times 25 = 250 \text{ sensors}$.\n        </p>\n      </div>\n\n      <h2>4. Supermarkets & CONWIP Topologies</h2>\n      <p>In environments with high product variety or long setup times, two advanced pull topologies are deployed:</p>\n      <ul>\n        <li><strong>Supermarket Pull System:</strong> A decentralized buffer of standardized intermediate inventory located between disconnected processes. When a downstream cell withdraws items from a supermarket shelf, a withdrawal Kanban signals the upstream cell to replenish the empty shelf location.</li>\n        <li><strong>CONWIP (Constant Work-in-Progress):</strong> A hybrid pull architecture pioneered by Spearman, Woodruff, and Hopp. A fixed number of work authorization tokens circulate across the <em>entire production line</em>. A job enters the line at Step 1 only when a finished unit exits at the final step, strictly locking WIP across the factory floor.</li>\n      </ul>\n\n      <div class=\"video-container\">\n        <iframe src=\"https://www.youtube.com/embed/jZ_yZ5b-wQE\" title=\"Just-In-Time, Pull Systems and Kanban Sizing Masterclass\" allowfullscreen></iframe>\n      </div>\n    ",
    "summary": "Transition from push to pull manufacturing, implement physical and digital Kanban loops, calculate exact container quantities using scientific sizing formulas, and configure Supermarkets and CONWIP systems.",
    "keyTakeaways": [
      "Push systems flood factory floors based on MRP forecasts; Pull systems authorize production based strictly on consumption.",
      "Kanban visual cards act as operational currency: no production is permitted without an authorized card.",
      "The Kanban sizing formula: $K = [D \times L \times (1 + S)] / C$ (always rounded up to the nearest integer).",
      "Supermarkets provide decentralized replenishment buffers between decoupled production processes.",
      "CONWIP caps total work-in-progress across the entire line, maintaining high throughput with low inventory."
    ]
  },
  {
    "id": "CH-SSM-022",
    "courseId": "CRS-SSM-001",
    "title": "Quick Changeover Engineering: Single-Minute Exchange of Die (SMED) Internal vs. External Setup Reduction",
    "order": 22,
    "estimatedMinutes": 65,
    "content": "\n      <h2>1. The Economic Lot Size Dilemma</h2>\n      <p>In traditional industrial economics, Ford W. Harris developed the classic <strong>Economic Order Quantity (EOQ)</strong> formula, which proves that when changeover setup times are long (e.g. 4 hours to change heavy metal stamping dies on a press), producing in massive batches of 50,000 units is the only way to amortize setup costs across many units. However, massive batches create disastrous inventory holding costs, sluggish customer responsiveness, and catastrophic quality scrap.</p>\n      \n      <p>Toyota industrial engineer <strong>Shigeo Shingo</strong> attacked the premise of the equation: <em>Instead of accepting long setup times and producing huge batches, what if we engineered the setup time down to near zero?</em> Shingo pioneered <strong>Single-Minute Exchange of Die (SMED)</strong>—reducing changeover times to the \"single digits\" (under 10 minutes!).</p>\n\n      <h2>2. Internal vs. External Setup Activities: The Core Distinction</h2>\n      <p>Shingo's breakthrough insight was categorizing all changeover setup activities into two distinct operational classes:</p>\n\n      <table class=\"table table-bordered\">\n        <thead>\n          <tr>\n            <th>Activity Category</th>\n            <th>Operational Definition</th>\n            <th>Examples</th>\n            <th>SMED Optimization Strategy</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td><strong>Internal Setup (IED)</strong></td>\n            <td>Activities that can <strong>ONLY</strong> be performed while the machine/process is completely stopped and powered down.</td>\n            <td>Bolting new die into press bed; connecting pneumatic hoses; swapping drill spindle.</td>\n            <td>Streamline, eliminate bolts, use quick-release clamps, standardize heights.</td>\n          </tr>\n          <tr>\n            <td><strong>External Setup (OED)</strong></td>\n            <td>Activities that can be performed <strong>WHILE</strong> the machine is still running and producing the previous product.</td>\n            <td>Fetching new die from warehouse on forklift; pre-heating raw materials; finding wrenches; preparing paperwork.</td>\n            <td><strong>Convert to external!</strong> Pre-stage all tools and dies <em>before</em> the current production run stops.</td>\n          </tr>\n        </tbody>\n      </table>\n\n      <div class=\"callout callout-warning\">\n        <h4>The Pitfall of Mixing Internal & External Tasks</h4>\n        <p>In un-optimized factories, when a machine stops for a changeover, the operator shuts it down and <em>then</em> spends 45 minutes walking around searching for a forklift, looking for the right hex wrench, and retrieving die bolts. These are all <strong>External</strong> activities executed while the machine sits idle, destroying millions in capacity!</p>\n      </div>\n\n      <h2>3. The 4-Stage SMED Methodology</h2>\n      <p>Shingo codified SMED into a rigorous 4-stage engineering lifecycle:</p>\n      <ol>\n        <li><strong>Stage 0: Observe & Document Current Setup:</strong> Video record the complete changeover from the last good part of Product A to the first good part of Product B. Create a spaghetti diagram of operator travel.</li>\n        <li><strong>Stage 1: Separate Internal and External Activities:</strong> Formally categorize every recorded task. Shift all external prep (fetching dies, tools, staging pallets) to occur while the machine is running. <em>(This single step typically slashes downtime by 30% to 50% with zero capital expenditure!).</em></li>\n        <li><strong>Stage 2: Convert Internal Activities to External:</strong> Re-engineer tasks so they can be executed offline. Pre-heat molds before machine entry; standardize mounting plate heights so limit switches do not require mechanical re-adjustment.</li>\n        <li><strong>Stage 3: Streamline All Remaining Internal & External Operations:</strong> Replace threaded screw bolts with quick-release pneumatic clamps, quarter-turn fasteners, or magnetic beds. Use parallel operations (Pit Stop Crew discipline).</li>\n      </ol>\n\n      <pre><code class=\"language-text\">SMED Evolution Timeline:\nOriginal Baseline : [=============== 120 Minutes Total Machine Downtime ===============]\nStage 1 (Separated): [===== External 50m (Machine Running) =====] [=== Internal 70m Downtime ===]\nStage 2 (Converted): [=========== External 80m (Running) ===========] [= Internal 40m =]\nStage 3 (Streamline): [=========== External 80m (Running) ===========] [ 8.5m! ] (SINGLE DIGIT SMED!)</code></pre>\n\n      <div class=\"video-container\">\n        <iframe src=\"https://www.youtube.com/embed/g2J03WfX9Yc\" title=\"Single-Minute Exchange of Die (SMED) Methodology Masterclass\" allowfullscreen></iframe>\n      </div>\n\n      <h2>4. The F1 Pit Stop Metaphor: Parallel Operations</h2>\n      <p>In a Formula 1 pit stop, 20 specialized mechanics change 4 tires in 2.2 seconds. No mechanic searches for a tire or walks around the car. SMED applies this exact choreography: operators have dedicated, pre-staged tool shadows; tasks are balanced simultaneously in parallel; and standard work combination sheets dictate every movement down to the second.</p>\n    ",
    "summary": "Master Shigeo Shingo's Single-Minute Exchange of Die (SMED) framework, separate and convert internal setup activities into external preparation, replace bolts with quick-fasteners, and achieve sub-10-minute changeovers.",
    "keyTakeaways": [
      "SMED cuts changeover times to single digits (< 10 minutes), enabling small-batch manufacturing without cost penalties.",
      "Internal setup tasks can only be performed when the machine is stopped; External setup tasks can be performed while running.",
      "Stage 1 (separating internal from external tasks) cuts downtime by 30%-50% with zero capital investment.",
      "Stage 2 converts internal tasks to external through pre-heating, pre-assembly, and standardization.",
      "Stage 3 streamlines remaining tasks using quick-release clamps, eliminated bolts, and parallel F1 pit-stop choreography."
    ]
  },
  {
    "id": "CH-SSM-023",
    "courseId": "CRS-SSM-001",
    "title": "Workplace Organization & Visual Management: 5S Deployment, Andon Systems & Visual Workspaces",
    "order": 23,
    "estimatedMinutes": 60,
    "content": "\n      <h2>1. The Psychology of Visual Order</h2>\n      <p>A cluttered, disorganized, and visually chaotic workplace is breeding ground for defects, safety accidents, and wasted motion. When tools, documents, parts, and computer files lack defined locations, employees waste up to 20% of their working hours searching, asking questions, and making cognitive errors. Furthermore, in an opaque environment, operational abnormalities (defective parts, stopped machines, delayed orders) remain completely invisible to management.</p>\n      \n      <p>Lean operations establishes an intuitive, self-explaining, self-ordering workplace through <strong>5S Workplace Organization</strong> and <strong>Visual Management (Andon)</strong>.</p>\n\n      <h2>2. The 5S Framework Architecture</h2>\n      <p>Originating from five Japanese terms beginning with the letter 'S', 5S is not a superficial spring cleaning; it is a permanent cultural operating discipline:</p>\n\n      <table class=\"table table-bordered\">\n        <thead>\n          <tr>\n            <th>Japanese Term</th>\n            <th>English Translation</th>\n            <th>Operational Objective & Implementation Activity</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td><strong>Seiri (整理)</strong></td>\n            <td><strong>Sort</strong></td>\n            <td>Distinguish between what is needed and what is unneeded. Apply the <strong>Red Tagging</strong> protocol: unneeded items are marked with red tags, moved to a central quarantine holding zone, and disposed of or relocated within 48 hours.</td>\n          </tr>\n          <tr>\n            <td><strong>Seiton (整頓)</strong></td>\n            <td><strong>Set in Order (Straighten)</strong></td>\n            <td><em>\"A place for everything, and everything in its place.\"</em> Arrange needed tools in ergonomic proximity to work; paint floor boundaries; create custom <strong>Shadow Boards</strong> so missing tools are instantly glaring.</td>\n          </tr>\n          <tr>\n            <td><strong>Seiso (清掃)</strong></td>\n            <td><strong>Shine (Sweep & Clean)</strong></td>\n            <td>Cleaning is an act of <strong>inspection</strong>! As operators clean machinery daily, they detect oil leaks, loose bolts, frayed wiring, and abnormal vibration before catastrophic breakdowns occur.</td>\n          </tr>\n          <tr>\n            <td><strong>Seiketsu (清潔)</strong></td>\n            <td><strong>Standardize</strong></td>\n            <td>Create visual checklists, Standard Operating Procedures (SOPs), color-coded zone labeling, and visual audits to make the first three S's a repeatable daily ritual.</td>\n          </tr>\n          <tr>\n            <td><strong>Shitsuke (躾)</strong></td>\n            <td><strong>Sustain (Self-Discipline)</strong></td>\n            <td>The most difficult S: maintaining standards through weekly 5S radar audits, leadership Gemba walks, recognition boards, and continuous team accountability.</td>\n          </tr>\n        </tbody>\n      </table>\n\n      <div class=\"callout callout-info\">\n        <h4>The 6th S: Safety</h4>\n        <p>Modern global industry expands 5S to <strong>6S</strong> by explicitly embedding <strong>Safety</strong> into every phase: identifying slip/trip hazards during Sort, maintaining clear egress aisles in Set in Order, detecting chemical leaks during Shine, and auditing PPE compliance during Sustain.</p>\n      </div>\n\n      <h2>3. The Andon System: Visual Abnormalities at a Glance</h2>\n      <p>In Japanese, <strong>Andon (行灯)</strong> refers to a paper lantern. In Lean production, an Andon is a visual signaling light system (often accompanied by musical chimes) hung prominently above assembly lines and digital workflows to announce operational status:</p>\n      <ul>\n        <li><strong>Green Light:</strong> Line operating normally; producing within Takt time with zero quality defects.</li>\n        <li><strong>Yellow Light:</strong> Operator detects an abnormality, requires parts replenishment, or is struggling to maintain pace. A team leader or supervisor responds within 30 seconds to assist without stopping the line.</li>\n        <li><strong>Red Light:</strong> Line stopped! A defect occurred, safety emergency arose, or an unresolvable issue emerged. Work is halted immediately (Jidoka) to prevent defects from escaping downstream.</li>\n      </ul>\n\n      <div class=\"video-container\">\n        <iframe src=\"https://www.youtube.com/embed/5a1Z1E5l6E4\" title=\"5S Workplace Organization and Visual Management Systems\" allowfullscreen></iframe>\n      </div>\n\n      <h2>4. The 30-Second Rule of Visual Management</h2>\n      <p>A mature Lean workspace satisfies <strong>The 30-Second Rule</strong>: <em>Any visitor, manager, or newly hired worker walking through the department should be able to determine within 30 seconds whether the operation is ahead of schedule, behind schedule, or experiencing a quality abnormality—without speaking a single word to anyone!</em></p>\n    ",
    "summary": "Deploy the 5S methodology (Sort, Set in Order, Shine, Standardize, Sustain), implement Red Tagging protocols and shadow boards, integrate the 6th S (Safety), and construct Andon visual systems.",
    "keyTakeaways": [
      "5S transforms workplaces from chaos into self-explaining, self-ordering environments.",
      "Sort uses Red Tagging to eliminate unneeded items; Set in Order establishes shadow boards and defined locations.",
      "Shine is an inspection ritual: daily cleaning uncovers early mechanical wear and fluid leaks.",
      "Standardize creates visual audits; Sustain enforces self-discipline through weekly 5S radar audits.",
      "Andon systems provide instant visual status (Green, Yellow, Red) and empower frontline workers to halt production upon defect detection."
    ]
  },
  {
    "id": "CH-SSM-024",
    "courseId": "CRS-SSM-001",
    "title": "Error Proofing (Poka-Yoke) & Kaizen Event Leadership: Designing Mistake-Proof Operations & Rapid Improvement Blitzen",
    "order": 24,
    "estimatedMinutes": 65,
    "content": "\n      <h2>1. The Fallacy of Human Infallibility</h2>\n      <p>Traditional managers believe that human errors can be eliminated through managerial admonition: <em>\"Pay closer attention!\", \"Double-check your work!\", \"Be more careful!\"</em> This is psychologically and operationally bankrupt. Human beings are biologically wired to experience attention lapses, fatigue, distraction, and cognitive overload. Demanding 100% human perfection across an 8-hour shift guarantees quality failures.</p>\n      \n      <p>Toyota quality engineer <strong>Shigeo Shingo</strong> codified a fundamental operational law: <strong>Mistakes are inevitable; defects are not!</strong> A mistake is an unintended human action; a defect is the consequence when that mistake escapes and impacts the customer. <strong>Poka-Yoke (ポカヨケ - Error Proofing)</strong> is the engineering discipline of designing products, tools, and processes such that mistakes are physically impossible to make or are immediately detected and halted before becoming defects.</p>\n\n      <h2>2. Taxonomy of Poka-Yoke Mechanisms</h2>\n      <p>Poka-Yoke devices operate at two distinct functional levels:</p>\n\n      <table class=\"table table-bordered\">\n        <thead>\n          <tr>\n            <th>Poka-Yoke Level</th>\n            <th>Operational Mechanism</th>\n            <th>Effectiveness</th>\n            <th>Everyday & Industrial Examples</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td><strong>Control Method (Prevention)</strong></td>\n            <td>Physically stops the operation or makes it physically impossible to execute improperly.</td>\n            <td><strong>100% Defect Elimination!</strong> (Highest quality tier).</td>\n            <td>USB-C cable or SIM card tray that can only insert in the correct orientation; car refusing to start unless brake pedal is depressed; microwave turning off if door opens.</td>\n          </tr>\n          <tr>\n            <td><strong>Warning Method (Detection)</strong></td>\n            <td>Alerts the operator via visual light, buzzer, or screen prompt that an error has occurred.</td>\n            <td>Moderate: Relies on human operator reacting to the alarm.</td>\n            <td>Car chiming if driver attempts to drive without seatbelt; software popping up confirmation dialog: <em>\"Are you sure you want to delete this database?\"</em>.</td>\n          </tr>\n        </tbody>\n      </table>\n\n      <h3>Shingo's Three Mechanical Types of Poka-Yoke</h3>\n      <ul>\n        <li><strong>Contact Method:</strong> Uses physical geometry, guide pins, optical sensors, or limit switches to detect irregular part shapes, reversed orientations, or missing holes.</li>\n        <li><strong>Fixed-Value Method:</strong> Enforces that a fixed number of operations or parts are consumed (e.g. an egg carton holding exactly 6 bolts; if a bolt remains in the tray after assembly, an operation was skipped!).</li>\n        <li><strong>Motion-Step (Sequence) Method:</strong> Enforces an invariant sequential order (e.g. an interlocked optical curtain: Operator cannot press weld button until hand reaches into parts bin and breaks sensor beam).</li>\n      </ul>\n\n      <h2>3. The Kaizen Blitz (Rapid Improvement Event)</h2>\n      <p>In Japanese, <strong>Kaizen (改善)</strong> translates to <em>Continuous Improvement (Kai = Change, Zen = Good)</em>. While Six Sigma DMAIC projects typically run for 3 to 4 months solving complex statistical mysteries, a <strong>Kaizen Blitz (or Kaizen Event)</strong> is an intense, cross-functional <strong>3-to-5-day focused workshop</strong> designed to eliminate waste, reorganize workcells, and execute immediate operational breakthroughs.</p>\n\n      <div class=\"callout callout-info\">\n        <h4>The Standard 5-Day Kaizen Blitz Schedule</h4>\n        <ul>\n          <li><strong>Day 1 (Training & Scope):</strong> Team alignment, charter review, Lean waste training, Gemba walk to observe baseline process.</li>\n          <li><strong>Day 2 (Mapping & Measurement):</strong> Current-State VSM, time-and-motion studies, identifying root causes of waiting and motion waste.</li>\n          <li><strong>Day 3 (Brainstorming & Mockup):</strong> Developing Future-State design, cardboard mockups, running simulated workflows.</li>\n          <li><strong>Day 4 (Physical Implementation):</strong> Rewiring equipment, unbolting and moving machinery, building shadow boards, authoring new SOPs.</li>\n          <li><strong>Day 5 (Standardization & Executive Tollgate):</strong> Running live production trial, measuring initial gains, presenting results to the executive sponsor.</li>\n        </ul>\n      </div>\n\n      <div class=\"video-container\">\n        <iframe src=\"https://www.youtube.com/embed/jZ_yZ5b-wQE\" title=\"Poka-Yoke Error Proofing and Kaizen Event Leadership\" allowfullscreen></iframe>\n      </div>\n\n      <h2>4. The 10 Principles of the Kaizen Mindset</h2>\n      <p>Leading an effective Kaizen event requires cultivating an operational culture grounded in action:\n        <ol>\n          <li>Question traditional practices; discard fixed ideas about what can or cannot be done.</li>\n          <li>Think of how to do it, not why it cannot be done.</li>\n          <li>Do not accept excuses; question the status quo constantly.</li>\n          <li>Do not seek immediate perfection; implement a 60% solution today rather than waiting 6 months for a 100% solution!</li>\n          <li>Correct mistakes immediately on the spot.</li>\n          <li>Use wisdom, creativity, and simple tools rather than throwing expensive capital at problems.</li>\n          <li>Difficulties sharpen the mind; look for true root causes by asking 'Why' five times.</li>\n          <li>Seek the wisdom of ten frontline workers rather than the single knowledge of one outside expert.</li>\n          <li>Continuous improvement has no finish line; there is always room for Kaizen.</li>\n        </ol>\n      </p>\n    ",
    "summary": "Engineer Poka-Yoke mistake-proofing mechanisms (Control vs. Warning methods), implement Contact, Fixed-Value, and Motion-Step error proofing, and lead intense 5-day cross-functional Kaizen Blitz improvement events.",
    "keyTakeaways": [
      "Mistakes are inevitable human lapses; defects are preventable escapes.",
      "Poka-Yoke Control methods make errors physically impossible; Warning methods alert operators via alarms.",
      "The three mechanical types of Poka-Yoke are Contact, Fixed-Value, and Motion-Step sequence devices.",
      "A Kaizen Blitz is an intense 3-to-5-day event that rapidly executes tangible shop-floor improvements.",
      "The Kaizen mindset prioritizes simple, immediate 60% solutions implemented today over costly theoretical perfection."
    ]
  }
],
  assessments: [
  {
    "id": "ASM-SSM-019",
    "courseId": "CRS-SSM-001",
    "chapterId": "CH-SSM-019",
    "title": "Assessment: Design of Experiments (DOE) & Factorial Designs",
    "passingScore": 70,
    "questions": [
      {
        "id": "Q-SSM-181",
        "question": "What is the primary flaw of One-Factor-at-a-Time (OFAT) experimentation compared to Factorial DOE?",
        "options": [
          "OFAT takes too few samples",
          "OFAT is completely blind to multi-factor interaction effects and fails to uncover true global optimal setpoints",
          "OFAT requires computers",
          "OFAT only works on liquids"
        ],
        "correctAnswer": 1,
        "explanation": "OFAT changes one variable while holding others constant. It is fundamentally incapable of detecting interactions where the effect of Factor A depends on Factor B."
      },
      {
        "id": "Q-SSM-182",
        "question": "In a 2^k Full Factorial Design, how many total experimental runs are required if k = 4 factors are being tested?",
        "options": [
          "8 runs",
          "16 runs (2^4 = 16)",
          "32 runs",
          "4 runs"
        ],
        "correctAnswer": 1,
        "explanation": "A full factorial design evaluates all possible treatment combinations: $N = 2^k = 2^4 = 16 \text{ runs}$."
      },
      {
        "id": "Q-SSM-183",
        "question": "What does an interaction effect between two factors (A * B) signify in a DOE?",
        "options": [
          "The two factors cancel each other out to zero",
          "The impact of Factor A on the response variable changes depending on what level Factor B is set to",
          "The machine broke during the run",
          "The data is non-normal"
        ],
        "correctAnswer": 1,
        "explanation": "An interaction means the effect of one factor is contingent on the level of another factor (e.g. high temperature improves yield with Catalyst 1, but ruins yield with Catalyst 2)."
      },
      {
        "id": "Q-SSM-184",
        "question": "What is 'Aliasing' (or Confounding) in a Fractional Factorial Design?",
        "options": [
          "When an engineer uses a fake name on the test report",
          "When two or more factor effects (e.g. Main Effect A and 2-Way Interaction BC) are mathematically entangled, making their individual effects indistinguishable",
          "A failure of the computer software",
          "When all data points equal zero"
        ],
        "correctAnswer": 1,
        "explanation": "In fractional factorials, running a subset of trials causes certain high-order interaction effects to become mathematically identical (aliased) with other terms."
      },
      {
        "id": "Q-SSM-185",
        "question": "What does a 'Resolution IV' Fractional Factorial Design guarantee?",
        "options": [
          "No interactions exist in the process",
          "Main effects are clean (not confounded) with any two-way interactions, although two-way interactions are confounded with each other",
          "The design requires 1,000 runs",
          "All main effects are confounded with each other"
        ],
        "correctAnswer": 1,
        "explanation": "In Resolution IV designs, main effects are unconfounded with any 2-factor interactions, making it the industry workhorse for screening."
      },
      {
        "id": "Q-SSM-186",
        "question": "What is the 'Sparsity of Effects Principle' in experimental design?",
        "options": [
          "Factories should have as few workers as possible",
          "A system response is almost always dominated by main effects and low-order (2-way) interactions; 3-way and higher interactions are virtually always negligible noise",
          "Experiments must never test more than two variables",
          "The response variable must be zero"
        ],
        "correctAnswer": 1,
        "explanation": "The Sparsity of Effects principle (Pareto in DOE) states that low-order terms drive the vast majority of variation, allowing engineers to safely use fractional factorials."
      },
      {
        "id": "Q-SSM-187",
        "question": "Why are center points (runs conducted at the midpoint between Low and High levels) added to a 2-level factorial design?",
        "options": [
          "To test if the operators are awake",
          "To test for non-linear curvature in the response surface and provide an independent estimate of experimental error (pure error)",
          "To reduce the number of runs",
          "Because high levels are dangerous"
        ],
        "correctAnswer": 1,
        "explanation": "Center points allow the model to detect quadratic curvature (non-linearity) between low and high settings without running a full 3-level response surface design."
      },
      {
        "id": "Q-SSM-188",
        "question": "What is an 'Orthogonal Design' in DOE?",
        "options": [
          "A design that only tests right angles",
          "An experimental matrix where all factor columns are completely independent of each other (zero correlation), allowing the effect of each factor to be estimated cleanly",
          "A design drawn on a circle",
          "An experiment conducted in a square room"
        ],
        "correctAnswer": 1,
        "explanation": "In an orthogonal matrix, the sum of products of any two factor columns equals zero, guaranteeing that estimates of factor effects are independent."
      },
      {
        "id": "Q-SSM-189",
        "question": "How should experimental runs be executed during a physical DOE to protect against environmental temperature drift or machine wear?",
        "options": [
          "Run all Low runs on Monday and all High runs on Friday",
          "Completely randomize the run order of the experimental treatments",
          "Run treatments in numerical order from 1 to 16",
          "Let operators choose whichever run looks easiest"
        ],
        "correctAnswer": 1,
        "explanation": "Randomization balances out unmeasured environmental disturbances (e.g. ambient temperature or tool wear over the day) across all treatments."
      },
      {
        "id": "Q-SSM-190",
        "question": "What is a 'Main Effect' in Design of Experiments?",
        "options": [
          "The main defect reported by the customer",
          "The change in the average response variable produced by a change in the level of a single factor from its Low setting to its High setting",
          "The most expensive factor",
          "The factory electric bill"
        ],
        "correctAnswer": 1,
        "explanation": "A main effect is the direct average impact of changing one independent factor from low to high on the response variable."
      }
    ]
  },
  {
    "id": "ASM-SSM-020",
    "courseId": "CRS-SSM-001",
    "chapterId": "CH-SSM-020",
    "title": "Assessment: Lean Workcell Design, Flow & Theory of Constraints",
    "passingScore": 70,
    "questions": [
      {
        "id": "Q-SSM-191",
        "question": "What is the primary operational advantage of arranging a manufacturing or assembly cell in a 'U-Shape'?",
        "options": [
          "It looks modern in marketing brochures",
          "Raw material entry and finished good exit are colocated at the open neck, reducing travel, maximizing visual control, and allowing flexible operator staffing",
          "It eliminates the need for air conditioning",
          "It increases batch inventory sizes"
        ],
        "correctAnswer": 1,
        "explanation": "U-shaped cells colocate entry and exit, minimize footprint, eliminate forklift travel, and enable multi-skilled operators to flex across multiple machines."
      },
      {
        "id": "Q-SSM-192",
        "question": "According to Goldratt's Theory of Constraints (TOC), what governs the total throughput capacity of an entire production facility?",
        "options": [
          "The fastest machine in the plant",
          "The capacity of the single bottleneck (constraint) resource",
          "The number of managers employed",
          "The size of the finished goods warehouse"
        ],
        "correctAnswer": 1,
        "explanation": "Goldratt proved that system throughput is strictly limited by the single constraint. Total throughput can never exceed the throughput of the bottleneck."
      },
      {
        "id": "Q-SSM-193",
        "question": "What happens if an operations manager optimizes and speeds up a non-bottleneck workstation?",
        "options": [
          "Total factory profit increases immediately",
          "It creates an illusion of improvement: the faster non-bottleneck merely produces excess WIP inventory that piles up in front of the bottleneck",
          "The bottleneck automatically speeds up",
          "All defects are eliminated"
        ],
        "correctAnswer": 1,
        "explanation": "An hour saved at a non-bottleneck is an illusion. Speeding up a non-bottleneck only creates excess inventory that chokes the bottleneck."
      },
      {
        "id": "Q-SSM-194",
        "question": "What is a Yamazumi Chart used for in Lean operations?",
        "options": [
          "Tracking employee vacation days",
          "Visualizing and balancing operator task times by stacking work content elements against the customer Takt time to eliminate bottlenecks and idle time",
          "Calculating company taxes",
          "Drawing architectural blueprints"
        ],
        "correctAnswer": 1,
        "explanation": "Yamazumi charts visually stack work content against Takt time, enabling managers to balance the line by shifting elemental tasks between operators."
      },
      {
        "id": "Q-SSM-195",
        "question": "What is the second step in Goldratt's Five Focusing Steps of TOC?",
        "options": [
          "Identify the constraint",
          "Exploit the constraint (squeeze maximum throughput from the bottleneck with zero downtime or waste)",
          "Purchase a new factory",
          "Fire the bottleneck operator"
        ],
        "correctAnswer": 1,
        "explanation": "Step 2 is 'Exploit the constraint': maximize output from the bottleneck without capital expenditure (never allow the bottleneck to sit idle during lunch or run scrap)."
      },
      {
        "id": "Q-SSM-196",
        "question": "What is 'One-Piece Flow' (Single-Piece Flow)?",
        "options": [
          "Producing only one product per year",
          "A manufacturing state where products move through processing steps one unit at a time with zero stagnant WIP inventory between stations",
          "Working on one task for 8 hours without stopping",
          "Using a single machine for everything"
        ],
        "correctAnswer": 1,
        "explanation": "One-piece flow moves single units sequentially between operations without queues, eliminating waiting waste and detecting defects instantly."
      },
      {
        "id": "Q-SSM-197",
        "question": "In Theory of Constraints, what does 'Subordinating everything else to the constraint' mean?",
        "options": [
          "Making all workers report to the bottleneck supervisor",
          "Pacing all upstream non-bottleneck workstations to match the exact consumption rate of the bottleneck, preventing excess WIP buildup",
          "Shutting down the entire factory",
          "Running all machines at maximum speed"
        ],
        "correctAnswer": 1,
        "explanation": "Subordination ensures upstream non-bottlenecks produce only what the bottleneck can consume, avoiding WIP clutter and line congestion."
      },
      {
        "id": "Q-SSM-198",
        "question": "If a production cell has a total work content time of 160 seconds and the customer Takt time is 40 seconds, what is the minimum theoretical number of operators required?",
        "options": [
          "2 operators",
          "4 operators (160 / 40 = 4)",
          "8 operators",
          "16 operators"
        ],
        "correctAnswer": 1,
        "explanation": "Minimum staffing is calculated as: $\text{Operators} = \text{Total Work Content} / \text{Takt Time} = 160 / 40 = 4 \text{ operators}$."
      },
      {
        "id": "Q-SSM-199",
        "question": "What does 'Line Balancing' achieve in a cellular manufacturing environment?",
        "options": [
          "Drawing straight chalk lines on the floor",
          "Distributing operational tasks evenly across all workcell operators so each operator's cycle time is balanced just below Takt time",
          "Equalizing salaries among operators",
          "Ensuring the conveyor belt is physically level"
        ],
        "correctAnswer": 1,
        "explanation": "Line balancing eliminates both bottleneck bottlenecks (over Takt) and operator idle time (under Takt) by distributing work content evenly."
      },
      {
        "id": "Q-SSM-200",
        "question": "What is 'Drum-Buffer-Rope' (DBR) in Theory of Constraints execution?",
        "options": [
          "A musical rhythm for factory workers",
          "A pull scheduling methodology: the Drum is the constraint's pace; the Buffer protects it from starvation; the Rope ties material release to the constraint's consumption",
          "A safety climbing harness for high machinery",
          "A method for tying down pallets"
        ],
        "correctAnswer": 1,
        "explanation": "DBR manages flow: the constraint sets the beat (Drum), a small inventory buffer protects the constraint from starvation, and the Rope synchronizes material release."
      }
    ]
  },
  {
    "id": "ASM-SSM-021",
    "courseId": "CRS-SSM-001",
    "chapterId": "CH-SSM-021",
    "title": "Assessment: JIT, Pull Systems & Kanban Calculations",
    "passingScore": 70,
    "questions": [
      {
        "id": "Q-SSM-201",
        "question": "What is the primary difference between a Push manufacturing system and a Pull manufacturing system?",
        "options": [
          "Push systems use electric motors; Pull systems use gravity",
          "Push systems produce to forecast and push WIP downstream; Pull systems produce strictly in response to actual downstream consumption signals",
          "Push systems have zero defects; Pull systems have high defects",
          "Pull systems require massive central warehouses"
        ],
        "correctAnswer": 1,
        "explanation": "Push systems build to forecasted schedules regardless of immediate downstream readiness; Pull systems authorize production only when downstream units are consumed."
      },
      {
        "id": "Q-SSM-202",
        "question": "In the scientific Kanban sizing equation K = (D * L * (1 + S)) / C, what does 'D' represent?",
        "options": [
          "Defect count per batch",
          "Average customer Demand rate per unit of time",
          "Distance between workstations in meters",
          "Diameter of the part"
        ],
        "correctAnswer": 1,
        "explanation": "D represents customer demand rate (e.g. units demanded per hour or per day)."
      },
      {
        "id": "Q-SSM-203",
        "question": "A cell consumes 60 parts per hour. Lead time is 3 hours. Safety factor is 20% (0.20). Container capacity is 25 parts. How many Kanban cards (K) are required?",
        "options": [
          "7 cards",
          "9 cards (rounded up from 8.64)",
          "5 cards",
          "20 cards"
        ],
        "correctAnswer": 1,
        "explanation": "$K = (60 \times 3 \times 1.20) / 25 = 216 / 25 = 8.64$. In Kanban sizing, always round up to ensure zero stockouts: $mathbf{9 \text{ cards}}$."
      },
      {
        "id": "Q-SSM-204",
        "question": "Why must the calculated number of Kanban cards (K) always be rounded UP to the nearest integer?",
        "options": [
          "Because fractional cards cannot be physically printed",
          "Rounding down would eliminate the safety buffer and cause material stockouts when minor processing fluctuations occur",
          "Because Six Sigma requires even numbers",
          "To increase factory warehouse revenue"
        ],
        "correctAnswer": 1,
        "explanation": "Rounding down starves the line during demand surges or slight transit delays. Rounding up preserves the required buffer margin."
      },
      {
        "id": "Q-SSM-205",
        "question": "What does the Japanese term 'Kanban' literally mean?",
        "options": [
          "Zero inventory",
          "Visual card, billboard, or signboard",
          "Fast assembly",
          "High quality"
        ],
        "correctAnswer": 1,
        "explanation": "Kanban translates literally to 'signboard' or 'visual card'—serving as the visual authorization token to produce or move parts."
      },
      {
        "id": "Q-SSM-206",
        "question": "What is a 'Supermarket' in a Lean pull architecture?",
        "options": [
          "A grocery store where factory workers buy lunch",
          "A decentralized, standardized intermediate inventory store between decoupled processes where downstream stations withdraw what they need and trigger upstream replenishment",
          "A warehouse for rejected scrap parts",
          "The main corporate headquarters"
        ],
        "correctAnswer": 1,
        "explanation": "A Lean Supermarket acts as a controlled buffer between processes running at different paces or with changeovers, maintaining limited stock replenished via pull."
      },
      {
        "id": "Q-SSM-207",
        "question": "What is CONWIP (Constant Work-in-Progress)?",
        "options": [
          "A permanent state of factory construction",
          "A hybrid pull system that caps total WIP across an entire line by authorizing new job entry only when a completed unit exits the line",
          "A software tool for writing emails",
          "A method that doubles WIP inventory every month"
        ],
        "correctAnswer": 1,
        "explanation": "CONWIP limits total WIP in the system using fixed circulation cards, ensuring constant inventory levels and predictable throughput."
      },
      {
        "id": "Q-SSM-208",
        "question": "What is the First Rule of Kanban?",
        "options": [
          "Never pass a defective part to the downstream process",
          "Produce as many parts as possible before going home",
          "Always work overtime on Fridays",
          "Keep all Kanban cards hidden"
        ],
        "correctAnswer": 0,
        "explanation": "Rule 1 of Kanban: Do not send defective parts downstream. Quality must be built-in at the source."
      },
      {
        "id": "Q-SSM-209",
        "question": "What happens to the required number of Kanban containers if an operations team cuts replenishment lead time (L) in half?",
        "options": [
          "The number of Kanban containers doubles",
          "The number of required Kanban containers is cut in half, directly slashing system WIP inventory",
          "The number of cards stays exactly the same",
          "Kanban becomes illegal"
        ],
        "correctAnswer": 1,
        "explanation": "Because $K$ is directly proportional to lead time ($L$), slashing lead time cuts required Kanban cards, freeing trapped working capital."
      },
      {
        "id": "Q-SSM-210",
        "question": "What is 'Heijunka' in Lean operations?",
        "options": [
          "Production leveling and smoothing: leveling both the volume and product mix over a given time period to eliminate Mura (unevenness)",
          "A martial art practiced by managers",
          "A type of cutting tool",
          "A financial penalty for late delivery"
        ],
        "correctAnswer": 0,
        "explanation": "Heijunka is production leveling: producing a mixed sequence of products (e.g. A-B-A-B rather than AAA then BBB) to smooth demand ripples across suppliers."
      }
    ]
  },
  {
    "id": "ASM-SSM-022",
    "courseId": "CRS-SSM-001",
    "chapterId": "CH-SSM-022",
    "title": "Assessment: Quick Changeover Engineering (SMED)",
    "passingScore": 70,
    "questions": [
      {
        "id": "Q-SSM-211",
        "question": "What does SMED stand for, and what is its target threshold?",
        "options": [
          "Standard Machine Execution Duration (under 1 hour)",
          "Single-Minute Exchange of Die: reducing changeover setup times to single digits (under 10 minutes)",
          "Synchronized Manufacturing Efficiency Drive (zero downtime)",
          "Software Modular Enterprise Deployment"
        ],
        "correctAnswer": 1,
        "explanation": "SMED stands for Single-Minute Exchange of Die, coined by Shigeo Shingo, aiming to complete tooling changeovers in single-digit minutes (< 10 minutes)."
      },
      {
        "id": "Q-SSM-212",
        "question": "What is the foundational definition of an 'Internal Setup' activity in SMED?",
        "options": [
          "An activity performed inside the corporate headquarters",
          "An activity that can ONLY be performed while the machine or process is completely stopped and powered down",
          "An activity performed while the machine is running at full speed",
          "An activity performed by the plant manager"
        ],
        "correctAnswer": 1,
        "explanation": "Internal setup elements require the machine to be halted (e.g. bolting the new mold into the platen)."
      },
      {
        "id": "Q-SSM-213",
        "question": "What is an 'External Setup' activity in SMED?",
        "options": [
          "Work done outside in the parking lot",
          "An activity that can be executed WHILE the machine is actively running and producing the previous product run",
          "An activity performed by outside contractors",
          "Inspecting parts after delivery to the customer"
        ],
        "correctAnswer": 1,
        "explanation": "External setup operations (e.g. pre-heating molds, staging tools, preparing paperwork) can and must be done while the previous job is running."
      },
      {
        "id": "Q-SSM-214",
        "question": "What typical percentage reduction in machine changeover downtime is achieved in Stage 1 of SMED simply by separating internal from external tasks?",
        "options": [
          "Less than 1%",
          "Between 30% and 50% reduction with virtually zero capital investment",
          "100% immediate elimination",
          "Setup time actually increases"
        ],
        "correctAnswer": 1,
        "explanation": "Simply pre-staging tools and materials while the machine runs (Stage 1) routinely cuts downtime by 30% to 50% without buying new equipment."
      },
      {
        "id": "Q-SSM-215",
        "question": "How does SMED Stage 2 'Convert Internal Setup to External' work?",
        "options": [
          "By moving the machine outdoors",
          "By re-engineering tasks so they are completed offline (e.g. pre-heating dies, pre-assembling tooling on standardized cartridges before stopping the press)",
          "By hiring more operators",
          "By eliminating all product changeovers"
        ],
        "correctAnswer": 1,
        "explanation": "Stage 2 converts internal tasks into external ones through pre-heating, pre-alignment, and modular cartridges that slide in quickly."
      },
      {
        "id": "Q-SSM-216",
        "question": "Why does Shigeo Shingo advocate eliminating threaded bolts in SMED Stage 3?",
        "options": [
          "Bolts are too expensive",
          "Only the last turn of a threaded bolt actually tightens it; all previous turns are pure wasted motion! Replacing bolts with quarter-turn fasteners or pneumatic clamps slashes setup time",
          "Threaded bolts cause rust",
          "Bolts are illegal in Japan"
        ],
        "correctAnswer": 1,
        "explanation": "Turning a bolt 15 times wastes valuable seconds. Only the final turn provides clamping pressure. Quick-release cams, quarter-turns, or hydraulic clamps secure instantly."
      },
      {
        "id": "Q-SSM-217",
        "question": "What is the economic consequence of successfully reducing setup time from 4 hours to 8 minutes?",
        "options": [
          "The factory must close down",
          "Batch sizes can be slashed dramatically, enabling high-mix, low-volume production with minimal inventory and ultra-fast customer responsiveness",
          "Operators must be laid off",
          "Product quality degrades"
        ],
        "correctAnswer": 1,
        "explanation": "Slashing setup time removes the economic justification for massive batches, allowing factories to run small, flexible batches tailored to real customer demand."
      },
      {
        "id": "Q-SSM-218",
        "question": "What real-world sporting event serves as the ultimate benchmark and metaphor for SMED choreography?",
        "options": [
          "A marathon",
          "A Formula 1 racing Pit Stop (replacing 4 tires in 2 seconds through pre-staged tools and parallel teamwork)",
          "A chess tournament",
          "A golf match"
        ],
        "correctAnswer": 1,
        "explanation": "F1 pit stops represent the pinnacle of SMED: parallel multi-operator tasks, specialized quick-release equipment, and pre-staged components."
      },
      {
        "id": "Q-SSM-219",
        "question": "What is Stage 0 in the SMED methodology?",
        "options": [
          "Buying new robots",
          "Video-recording and documenting the complete changeover process from last good part of Job A to first good part of Job B without making any changes",
          "Painting the floor blue",
          "Conducting an ANOVA test"
        ],
        "correctAnswer": 1,
        "explanation": "Stage 0 is baseline documentation: recording the entire changeover on video to establish an objective, fact-based timeline of all operator movements."
      },
      {
        "id": "Q-SSM-220",
        "question": "What is a 'Spaghetti Diagram' in changeover analysis?",
        "options": [
          "A recipe for lunch",
          "A visual map tracing the physical walking path of an operator during a changeover, exposing excessive travel and motion waste",
          "A computer network cable layout",
          "A statistical control chart"
        ],
        "correctAnswer": 1,
        "explanation": "A spaghetti diagram visually traces an operator's walking path, illustrating wasted motion and physical travel spent searching for tools."
      }
    ]
  },
  {
    "id": "ASM-SSM-023",
    "courseId": "CRS-SSM-001",
    "chapterId": "CH-SSM-023",
    "title": "Assessment: Workplace Organization & Visual Management (5S)",
    "passingScore": 70,
    "questions": [
      {
        "id": "Q-SSM-221",
        "question": "What are the 5 Japanese steps of the 5S framework in order?",
        "options": [
          "Sushi, Samurai, Shogun, Sakura, Sayonara",
          "Seiri (Sort), Seiton (Set in Order), Seiso (Shine), Seiketsu (Standardize), Shitsuke (Sustain)",
          "Kaizen, Kanban, Muda, Muri, Mura",
          "DMAIC, DFSS, FMEA, SPC, DOE"
        ],
        "correctAnswer": 1,
        "explanation": "The 5S sequence is Seiri (Sort), Seiton (Set in Order), Seiso (Shine), Seiketsu (Standardize), and Shitsuke (Sustain)."
      },
      {
        "id": "Q-SSM-222",
        "question": "What is the 'Red Tagging' technique used during the 'Sort' (Seiri) phase of 5S?",
        "options": [
          "Marking defective parts to be sold at a discount",
          "Attaching visual red tags to unneeded or questionable items, moving them to a quarantine holding area for review and disposal within 48 hours",
          "Tagging employees who arrive late",
          "Marking emergency exits"
        ],
        "correctAnswer": 1,
        "explanation": "Red tags identify unneeded items, equipment, or documents, moving them to a quarantine zone for systematic disposal to declutter the workspace."
      },
      {
        "id": "Q-SSM-223",
        "question": "What philosophy summarizes the 'Set in Order' (Seiton) phase of 5S?",
        "options": [
          "Buy the most expensive cabinets available",
          "A place for everything, and everything in its place",
          "Hide all tools in locked drawers",
          "Throw away all tools"
        ],
        "correctAnswer": 1,
        "explanation": "Set in Order organizes remaining needed items logically with labeled locations, shadow boards, and visual cues so anyone can retrieve and return items instantly."
      },
      {
        "id": "Q-SSM-224",
        "question": "Why is 'Shine' (Seiso) described as an act of inspection rather than simple janitorial cleaning?",
        "options": [
          "Janitors are too expensive",
          "As operators clean and wipe down machinery daily, they actively discover early warning signs like fluid leaks, abnormal vibrations, loose bolts, and fraying belts",
          "To save electricity in the facility",
          "Because Six Sigma requires clean floors"
        ],
        "correctAnswer": 1,
        "explanation": "Cleaning is inspection. Wiping down equipment allows operators to spot early defects, wear, and leaks before they trigger catastrophic line downtime."
      },
      {
        "id": "Q-SSM-225",
        "question": "Which of the 5S phases is widely recognized as the most difficult to achieve over the long term?",
        "options": [
          "Sort",
          "Set in Order",
          "Sustain (Shitsuke)",
          "Shine"
        ],
        "correctAnswer": 2,
        "explanation": "Sustain requires lasting behavioral change and cultural self-discipline, preventing the natural human tendency to backslide into clutter."
      },
      {
        "id": "Q-SSM-226",
        "question": "What is an 'Andon' system in Lean visual management?",
        "options": [
          "A type of factory robot",
          "A visual status light board and audible alarm hung above workstations that signals green (normal), yellow (abnormality/help needed), or red (line stopped)",
          "A Japanese accounting system",
          "An emergency fire sprinkler"
        ],
        "correctAnswer": 1,
        "explanation": "Andon systems provide instant visual status of line operations, signaling abnormalities and empowering teams to resolve issues immediately."
      },
      {
        "id": "Q-SSM-227",
        "question": "What is a 'Shadow Board' in 5S workplace organization?",
        "options": [
          "A board used for secret management meetings",
          "A tool-hanging board painted with the physical outline (shadow) of each tool, making it instantly obvious when a tool is missing or in use",
          "A dark corner of the warehouse",
          "A computer screensaver"
        ],
        "correctAnswer": 1,
        "explanation": "Shadow boards paint tool silhouettes, providing immediate visual feedback when an instrument is missing or returned to the wrong position."
      },
      {
        "id": "Q-SSM-228",
        "question": "What is the '30-Second Rule' in visual workplace management?",
        "options": [
          "Operators must eat lunch in 30 seconds",
          "Any supervisor or visitor walking into a work area should be able to understand the operational status (ahead, behind, or quality issue) within 30 seconds without asking",
          "Machines must cycle in 30 seconds",
          "Meetings must last no longer than 30 seconds"
        ],
        "correctAnswer": 1,
        "explanation": "The 30-Second Rule states that a truly visual workplace communicates status, pace, and abnormalities instantly to anyone at a glance."
      },
      {
        "id": "Q-SSM-229",
        "question": "What is the 6th 'S' added to modern 5S deployments in global enterprise programs?",
        "options": [
          "Salary",
          "Safety",
          "Speed",
          "Software"
        ],
        "correctAnswer": 1,
        "explanation": "6S explicitly incorporates Safety—ensuring ergonomics, PPE, hazard elimination, and slip-prevention are integrated into daily visual management."
      },
      {
        "id": "Q-SSM-230",
        "question": "What visual tool is used to monitor 5S audit compliance over time across multiple departments?",
        "options": [
          "A Radar Chart (Spider Chart)",
          "A pie chart",
          "A scatter plot",
          "A regression line"
        ],
        "correctAnswer": 0,
        "explanation": "5S Radar charts plot audit scores across Sort, Set in Order, Shine, Standardize, and Sustain, revealing maturity and gaps at a glance."
      }
    ]
  },
  {
    "id": "ASM-SSM-024",
    "courseId": "CRS-SSM-001",
    "chapterId": "CH-SSM-024",
    "title": "Assessment: Error Proofing (Poka-Yoke) & Kaizen Event Leadership",
    "passingScore": 70,
    "questions": [
      {
        "id": "Q-SSM-231",
        "question": "What is the fundamental philosophy of Poka-Yoke pioneered by Shigeo Shingo?",
        "options": [
          "Human beings must be punished when they make mistakes",
          "Mistakes are inevitable human cognitive lapses; defects are preventable escapes! Design the process so mistakes cannot turn into defects",
          "All assembly work should be automated by robots",
          "Inspectors must inspect parts three times"
        ],
        "correctAnswer": 1,
        "explanation": "Poka-Yoke recognizes that human error is natural. Rather than blaming workers, processes must be engineered to prevent errors from becoming defects."
      },
      {
        "id": "Q-SSM-232",
        "question": "What is the difference between a Poka-Yoke 'Control Method' and a 'Warning Method'?",
        "options": [
          "Control methods cost less than warning methods",
          "Control methods physically prevent the error or stop the process (100% defect-free); Warning methods merely alert the operator via a buzzer, light, or prompt",
          "Warning methods are always preferred in automotive",
          "Control methods are software only"
        ],
        "correctAnswer": 1,
        "explanation": "Control methods physically halt or block the operation (e.g. asymmetrical connector). Warning methods alert the user (e.g. seatbelt chime) but rely on human reaction."
      },
      {
        "id": "Q-SSM-233",
        "question": "Which of the following is a classic real-world example of a Poka-Yoke Control Method?",
        "options": [
          "A USB-C connector that can be inserted in either orientation, or a 3-prong electrical plug that only fits one way",
          "A sign on the wall saying 'Please drive slowly'",
          "An alarm clock",
          "A reminder email sent by a supervisor"
        ],
        "correctAnswer": 0,
        "explanation": "Asymmetrical 3-prong plugs or reversible USB-C connectors make improper insertion physically impossible—the definition of a Control Poka-Yoke."
      },
      {
        "id": "Q-SSM-234",
        "question": "What is a 'Fixed-Value' Poka-Yoke mechanism?",
        "options": [
          "A fixed dollar budget for parts",
          "A mechanism requiring a fixed number of parts or operations to be consumed (e.g. an egg crate holding exactly 4 screws; leftover screws indicate an omitted operation)",
          "A tool that never changes temperature",
          "A static price tag"
        ],
        "correctAnswer": 1,
        "explanation": "Fixed-value error-proofing uses pre-counted kits or fixed-stroke counters so missing an operation or omitting a part is immediately obvious."
      },
      {
        "id": "Q-SSM-235",
        "question": "What is a Kaizen Blitz (or Rapid Improvement Event)?",
        "options": [
          "A corporate layoff announcement",
          "An intense, cross-functional 3-to-5-day workshop focused on rapidly designing, implementing, and verifying tangible shop-floor improvements",
          "A 2-year university degree program",
          "A formal annual shareholders meeting"
        ],
        "correctAnswer": 1,
        "explanation": "A Kaizen Blitz is a focused 3-to-5-day event where a cross-functional team observes, designs, implements, and standardizes immediate improvements."
      },
      {
        "id": "Q-SSM-236",
        "question": "What does the Kaizen principle 'Implement a 60% solution today rather than waiting for a 100% solution' mean?",
        "options": [
          "Accepting poor quality products",
          "Prioritizing rapid, practical, low-cost improvements immediately over getting trapped in analysis paralysis seeking theoretical perfection",
          "Only working 60% of the day",
          "Giving 40% discounts to customers"
        ],
        "correctAnswer": 1,
        "explanation": "Kaizen emphasizes immediate action. Implementing a simple 60% solution today delivers immediate value and creates momentum for ongoing incremental refinement."
      },
      {
        "id": "Q-SSM-237",
        "question": "What occurs on Day 4 of a standard 5-Day Kaizen Blitz schedule?",
        "options": [
          "Team members take a day off",
          "Physical implementation: unbolting and moving machinery, building shadow boards, rearranging workcells, and authoring new SOPs",
          "Writing the project charter",
          "Interviewing customers"
        ],
        "correctAnswer": 1,
        "explanation": "Day 4 is implementation day: executing physical changes, moving workstations, rewiring, installing visual boards, and setting up the new flow."
      },
      {
        "id": "Q-SSM-238",
        "question": "What is a 'Motion-Step' (Sequence) Poka-Yoke mechanism?",
        "options": [
          "A pedometer worn by workers",
          "A system that enforces an invariant sequential order (e.g. an interlocked optical light curtain that prevents a machine cycle until a part is picked from bin A)",
          "A video game for factory operators",
          "A conveyor belt speed controller"
        ],
        "correctAnswer": 1,
        "explanation": "Motion-step Poka-Yoke ensures steps are executed in exact required sequence, interlocking subsequent steps until prior actions are verified."
      },
      {
        "id": "Q-SSM-239",
        "question": "What Japanese words form the compound term 'Kaizen'?",
        "options": [
          "Kai (Change) and Zen (Good / For the Better)",
          "Kata (Form) and Zen (Meditation)",
          "Kanban (Card) and Zenshin (Forward)",
          "Kao (Face) and Zoku (Tribe)"
        ],
        "correctAnswer": 0,
        "explanation": "Kaizen is composed of Kai (Change) and Zen (Good), translating to 'Continuous Improvement' or 'Change for the Better'."
      },
      {
        "id": "Q-SSM-240",
        "question": "Why should a Kaizen event team include frontline operators who perform the work every day?",
        "options": [
          "Because managers do not like walking onto the factory floor",
          "Frontline operators possess the deepest empirical knowledge of real-world friction, workarounds, and safety hazards, ensuring solutions are practical and embraced",
          "To reduce labor costs",
          "Because ISO standards mandate operator signatures"
        ],
        "correctAnswer": 1,
        "explanation": "Top-down solutions designed by managers in conference rooms fail. Frontline workers understand actual operational reality and ensure lasting adoption."
      }
    ]
  }
]
};
