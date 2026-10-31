// Phase 3: Chapters 13-18 and Assessments (ASM-SSM-013 to ASM-SSM-018)
export const phase3 = {
  chapters: [
  {
    "id": "CH-SSM-013",
    "courseId": "CRS-SSM-001",
    "title": "Qualitative Root Cause Analysis: Ishikawa (Fishbone) Diagrams, 5 Whys Architecture & Cause-and-Effect Matrix",
    "order": 13,
    "estimatedMinutes": 65,
    "content": "\n      <h2>1. The Analyze Phase: Transitioning from Symptoms to Causes</h2>\n      <p>Entering the <strong>Analyze Phase</strong> of DMAIC marks a decisive shift in mindset. In Define, we scoped the customer pain ($Y$); in Measure, we verified our measurement instruments and calculated baseline capability. In Analyze, the central objective is to isolate and prove the vital few independent root cause variables ($X_1, X_2, dots, X_k$) that drive the defect ($Y = f(X)$).</p>\n      \n      <p>Before launching into complex inferential statistical tests (hypothesis testing, ANOVA, regression), experienced operations managers deploy structured qualitative root cause frameworks to narrow the infinite universe of possible factors down to a manageable shortlist of verified suspects.</p>\n\n      <h2>2. Ishikawa (Fishbone / Cause-and-Effect) Diagram Architecture</h2>\n      <p>Invented by <strong>Kaoru Ishikawa</strong> in the 1960s, the Cause-and-Effect Diagram (commonly called the <em>Fishbone Diagram</em> due to its skeletal appearance) is a structured brainstorming tool that maps all potential contributors to a problem.</p>\n      \n      <p>The \"head\" of the fish represents the specific Problem Statement or Defect ($Y$). The primary \"bones\" radiating from the spine represent standardized operational categories. In manufacturing, teams standardize on the <strong>6M Framework</strong>; in service and software environments, they adapt to the <strong>4P / 5S Framework</strong>.</p>\n\n      <table class=\"table table-bordered\">\n        <thead>\n          <tr>\n            <th>Manufacturing (6M)</th>\n            <th>Service / Healthcare / Office (4P / 5S)</th>\n            <th>Operational Brainstorming Focus</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td><strong>Man (People)</strong></td>\n            <td><strong>Personnel (People)</strong></td>\n            <td>Training, experience, fatigue, communication, shift handover, cognitive workload.</td>\n          </tr>\n          <tr>\n            <td><strong>Machine</strong></td>\n            <td><strong>Plant / Platform (Technology)</strong></td>\n            <td>Equipment calibration, tooling wear, software bugs, server latency, mechanical backlash.</td>\n          </tr>\n          <tr>\n            <td><strong>Method</strong></td>\n            <td><strong>Process (Policies)</strong></td>\n            <td>Standard Operating Procedures (SOPs), sequencing, approvals, batch sizes, checklists.</td>\n          </tr>\n          <tr>\n            <td><strong>Material</strong></td>\n            <td><strong>Part / Supplies</strong></td>\n            <td>Raw material purity, vendor batch variability, incoming data corruption, chemical specs.</td>\n          </tr>\n          <tr>\n            <td><strong>Measurement</strong></td>\n            <td><strong>Metrics (Inspection)</strong></td>\n            <td>Gage error, inspection criteria ambiguity, sampling bias, sensor drift.</td>\n          </tr>\n          <tr>\n            <td><strong>Milieu (Environment)</strong></td>\n            <td><strong>Surroundings (Culture)</strong></td>\n            <td>Ambient temperature, humidity, lighting, noise, corporate pressure, organizational culture.</td>\n          </tr>\n        </tbody>\n      </table>\n\n      <h2>3. The 5 Whys Architecture: Drilling to Foundational Root Causes</h2>\n      <p>Pioneered by <strong>Sakichi Toyoda</strong> within Toyota, the <strong>5 Whys</strong> methodology is an iterative interrogative technique designed to drill through superficial operational symptoms down to underlying management system failures.</p>\n\n      <div class=\"callout callout-info\">\n        <h4>The Real-World 5 Whys Discipline</h4>\n        <p>A machine stops running on the assembly line:\n          <ol>\n            <li><strong>Why did the machine stop?</strong> The circuit breaker tripped due to an electrical overload.</li>\n            <li><strong>Why was there an overload?</strong> The bearing was not sufficiently lubricated and seized.</li>\n            <li><strong>Why was it not lubricated?</strong> The automatic lubrication pump failed to circulate oil.</li>\n            <li><strong>Why did the pump fail?</strong> The pump shaft had worn out because metal shavings entered the oil reservoir.</li>\n            <li><strong>Why did shavings enter the reservoir?</strong> There was no protective filter screen on the reservoir intake. (<strong>Root Cause:</strong> Redesign reservoir with dual-mesh filter screen and add to preventative maintenance SOP!).</li>\n          </ol>\n          If the team stopped at Why #1 (just replacing the fuse), the machine would seize again within 48 hours!\n        </p>\n      </div>\n\n      <div class=\"callout callout-warning\">\n        <h4>Common Pitfalls of 5 Whys</h4>\n        <p>Operations managers must guard against three common 5 Whys failures:\n          <ul>\n            <li><strong>Stopping at Human Error:</strong> Ending the chain with <em>\"Because the operator was careless\"</em> is a failure of leadership. The next question must always be: <em>\"Why did the system permit an operator error to cause a failure?\"</em></li>\n            <li><strong>Single Linear Path:</strong> Real-world problems frequently have branching causes (a \"Why-Why Tree\").</li>\n            <li><strong>Subjective Confirmation Bias:</strong> Teams verify steps with speculation rather than empirical proof. Every \"Why\" answer must be physically or statistically verifiable!</li>\n          </ul>\n        </p>\n      </div>\n\n      <h2>4. The Cause-and-Effect (C&E / XY) Matrix</h2>\n      <p>Brainstorming with Fishbone diagrams often yields 50 to 100 potential causes ($X$s). Testing all 100 statistically would consume months of budget. The <strong>Cause-and-Effect Matrix (C&E Matrix)</strong> is a prioritization tool that mathematically scores inputs against customer CTQs:</p>\n\n      <ol>\n        <li>List key Customer CTQ Outputs ($Y$) along the top columns, assigning each an importance weight ($1\text{ to }10$).</li>\n        <li>List all candidate Process Inputs ($X$) identified from the Fishbone along the left rows.</li>\n        <li>Score the correlation between each Input and each Output ($0 = \text{None}, 1 = \text{Weak}, 3 = \text{Moderate}, 9 = \text{Strong}$).</li>\n        <li>Compute the weighted cross-product total score for each $X$. The top 10% to 20% highest-scoring inputs advance to FMEA and statistical hypothesis testing!</li>\n      </ol>\n\n      <div class=\"video-container\">\n        <iframe src=\"https://www.youtube.com/embed/5U_iK_fKzXw\" title=\"Ishikawa Fishbone and 5 Whys Root Cause Analysis\" allowfullscreen></iframe>\n      </div>\n    ",
    "summary": "Execute qualitative root cause analysis during the Analyze phase using Ishikawa 6M fishbone diagrams, drill to systemic process failures via 5 Whys, and prioritize inputs using the Cause-and-Effect Matrix.",
    "keyTakeaways": [
      "The Analyze phase shifts focus from characterizing the problem ($Y$) to proving root cause drivers ($X$).",
      "Ishikawa Fishbone diagrams categorize potential causes across the 6M (Man, Machine, Method, Material, Measurement, Milieu) or 4P frameworks.",
      "The 5 Whys drills past superficial physical symptoms to uncover root systemic and managerial failures.",
      "Never stop at 'operator error'; investigate why the process allowed the error to occur.",
      "The Cause-and-Effect (XY) Matrix numerically filters dozens of brainstormed inputs down to the vital few factors for statistical testing."
    ]
  },
  {
    "id": "CH-SSM-014",
    "courseId": "CRS-SSM-001",
    "title": "Failure Mode and Effects Analysis (FMEA): Severity, Occurrence, Detection & Risk Priority Number (RPN / Action Priority)",
    "order": 14,
    "estimatedMinutes": 65,
    "content": "\n      <h2>1. The Proactive Engineering Mindset</h2>\n      <p>Traditional quality management was reactionary: wait for a part to break in the field, wait for a customer to complain, and then launch an investigation. <strong>Failure Mode and Effects Analysis (FMEA)</strong>—originally developed by the U.S. Military (MIL-STD-1629A) and perfected by NASA and the automotive industry (AIAG)—reverses this dynamic. FMEA is a structured, proactive engineering discipline designed to anticipate failure modes <em>before they occur</em> and build preventative mitigations into product and process designs.</p>\n      \n      <p>In Lean Six Sigma, teams utilize two primary FMEA variants:\n        <ul>\n          <li><strong>DFMEA (Design FMEA):</strong> Focuses on product design flaws (material selection, geometry, tolerances).</li>\n          <li><strong>PFMEA (Process FMEA):</strong> Focuses on manufacturing, operational, transactional, and service execution flaws (assembly sequencing, machine parameters, operator errors, data entry).</li>\n        </ul>\n      </p>\n\n      <h2>2. Anatomical Columns of a PFMEA</h2>\n      <p>A PFMEA systematically marches through each step of the process mapped in the SIPOC / VSM:</p>\n      <ul>\n        <li><strong>Process Step / Function:</strong> The specific operation being performed (e.g. <em>\"Step 40: Laser-weld battery pack terminal connector\"</em>).</li>\n        <li><strong>Potential Failure Mode:</strong> The manner in which the step could fail to meet customer requirements (e.g. <em>\"Incomplete weld bead; cold solder joint\"</em>).</li>\n        <li><strong>Potential Effect(s) of Failure:</strong> The downstream consequence on the customer or system (e.g. <em>\"Intermittent battery disconnect, electrical arcing, vehicle loss of motive power\"</em>).</li>\n        <li><strong>Potential Cause(s) of Failure:</strong> The specific root cause driver (e.g. <em>\"Laser optics contaminated with soot; shield gas flow rate below 15 LPM\"</em>).</li>\n        <li><strong>Current Process Controls:</strong>\n          <ul>\n            <li><em>Prevention Controls:</em> What currently stops the failure from happening? (e.g. scheduled cleaning SOP).</li>\n            <li><em>Detection Controls:</em> What currently catches the failure before shipping? (e.g. manual visual inspection under magnifying lamp).</li>\n          </ul>\n        </li>\n      </ul>\n\n      <h2>3. The SOD Scoring Rubric: Severity, Occurrence & Detection</h2>\n      <p>Each failure mode is scored across three independent dimensions on a standard <strong>1 to 10 scale</strong>:</p>\n\n      <table class=\"table table-bordered\">\n        <thead>\n          <tr>\n            <th>Rating Dimension</th>\n            <th>1 (Best / Lowest Risk)</th>\n            <th>5 (Moderate Risk)</th>\n            <th>10 (Worst / Catastrophic Risk)</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td><strong>Severity (S)</strong><br><em>Impact on customer if failure occurs</em></td>\n            <td>Negligible impact; customer will not notice.</td>\n            <td>Customer experiences annoyance; minor reduction in product performance.</td>\n            <td><strong>Catastrophic safety hazard</strong>; injury or death; regulatory non-compliance with zero warning!</td>\n          </tr>\n          <tr>\n            <td><strong>Occurrence (O)</strong><br><em>Frequency / Probability of root cause occurring</em></td>\n            <td>Extremely remote; failure almost never occurs (&lt; 1 in 1,000,000).</td>\n            <td>Occasional failure; ~1 in 2,000 units.</td>\n            <td>Persistent daily failure; probability &gt; 1 in 10 units (&gt; 10% scrap).</td>\n          </tr>\n          <tr>\n            <td><strong>Detection (D)</strong><br><em>Ability of current controls to catch failure before release</em></td>\n            <td><strong>Certain detection</strong>: automated 100% Poka-Yoke sensor blocks defective part.</td>\n            <td>Moderate chance: manual optical inspection or statistical sampling catches defect.</td>\n            <td><strong>Zero detection capability</strong>: defect is invisible, latent, and cannot be caught before customer delivery.</td>\n          </tr>\n        </tbody>\n      </table>\n\n      <div class=\"callout callout-danger\">\n        <h4>Critical Rule: Severity is an Invariant!</h4>\n        <p>A common rookie mistake in FMEA is attempting to lower the <strong>Severity (S)</strong> score through process controls. <em>Severity is an intrinsic property of the failure effect on the customer.</em> If an automotive steering knuckle breaks at 70 mph, Severity is 10. Adding a million inspection cameras will <strong>never</strong> lower Severity from 10! The only way to lower Severity is to <strong>physically redesign the product</strong> (e.g. adding a mechanical failsafe backup). Process teams must reduce risk by lowering <strong>Occurrence (O)</strong> and improving <strong>Detection (D)</strong>.</p>\n      </div>\n\n      <h2>4. Risk Priority Number (RPN) vs. AIAG-VDA Action Priority (AP)</h2>\n      <p>Historically, teams calculated the <strong>Risk Priority Number (RPN)</strong>:\n        $$\text{RPN} = S \times O \times D quad (1 \text{ to } 1,000)$$\n      Teams established arbitrary thresholds (e.g. \"Fix anything with RPN &gt; 100\").\n      </p>\n\n      <p>However, simple multiplication creates severe blind spots:\n        <ul>\n          <li>Scenario A: $S=10, O=2, D=4 implies \text{RPN} = 80$ (Catastrophic safety hazard!).</li>\n          <li>Scenario B: $S=2, O=8, D=8 implies \text{RPN} = 128$ (Cosmetic scratch occurring frequently).</li>\n        </ul>\n        A naive RPN threshold fixes the harmless scratch (128) while ignoring the lethal safety risk (80)!\n      </p>\n      \n      <p>To eliminate this flaw, the harmonized <strong>AIAG-VDA FMEA standard</strong> replaced RPN with <strong>Action Priority (AP: High, Medium, Low)</strong>. AP uses logic lookup tables that strictly prioritize <strong>Severity first</strong>, followed by Occurrence, and finally Detection—guaranteeing that catastrophic failure modes are never masked by low occurrence.</p>\n\n      <div class=\"video-container\">\n        <iframe src=\"https://www.youtube.com/embed/5a1Y1_6v7bA\" title=\"Failure Mode and Effects Analysis (FMEA) and RPN Action Priority\" allowfullscreen></iframe>\n      </div>\n    ",
    "summary": "Construct Process FMEAs (PFMEA), score Severity, Occurrence, and Detection using standard AIAG rubrics, delineate RPN from modern Action Priority (AP), and design preventative mitigations.",
    "keyTakeaways": [
      "FMEA is a proactive risk assessment tool to prevent failures before they occur in the field.",
      "Severity (S) measures customer impact; Occurrence (O) measures frequency; Detection (D) measures control effectiveness.",
      "Severity cannot be reduced by inspection; only product/process redesign changes Severity.",
      "Detection rating 1 represents automated error-proofing; Detection rating 10 represents zero ability to catch the defect.",
      "Modern AIAG-VDA Action Priority (AP: High, Medium, Low) replaces naive RPN thresholds to prevent catastrophic high-severity risks from being overlooked."
    ]
  },
  {
    "id": "CH-SSM-015",
    "courseId": "CRS-SSM-001",
    "title": "Inferential Statistics & Hypothesis Testing Fundamentals: Null vs. Alternative Hypotheses, Alpha, Beta, p-Values & Power",
    "order": 15,
    "estimatedMinutes": 65,
    "content": "\n      <h2>1. The Bridge from Descriptive to Inferential Statistics</h2>\n      <p>In the Measure phase, we used <em>descriptive statistics</em> (mean, standard deviation, histograms) to describe the sample data we observed. In the Analyze phase, our objective shifts to <strong>Inferential Statistics</strong>: drawing scientifically defensible conclusions about an entire, unmeasured population based strictly on sample evidence.</p>\n      \n      <p>Suppose an operations team tests a new ceramic cutting tool on 30 parts and observes an average cycle time of 42.1 seconds, compared to the historical baseline of 44.5 seconds. Did the new tool genuinely cause an improvement, or was this 2.4-second difference merely the result of random sampling luck? <strong>Hypothesis Testing</strong> provides the mathematical framework to answer this question with specified confidence.</p>\n\n      <h2>2. Framing the Hypotheses: $H_0$ and $H_a$</h2>\n      <p>Every hypothesis test pits two opposing mathematical statements against each other:</p>\n      <ul>\n        <li><strong>Null Hypothesis ($H_0$ - The Status Quo):</strong> Assumes that <em>no real change, no difference, and no relationship exists</em>. Any observed difference in sample data is pure random chance.\n          $$H_0: mu_{\text{New}} = mu_{\text{Baseline}} quad (\text{or } mu_1 - mu_2 = 0)$$\n        </li>\n        <li><strong>Alternative Hypothesis ($H_a$ or $H_1$ - The Challenger):</strong> The research hypothesis. Assumes that a genuine, statistically significant difference or effect exists:\n          $$H_a: mu_{\text{New}} \neq mu_{\text{Baseline}} quad (\text{Two-Tailed}) quad \text{or} quad H_a: mu_{\text{New}} < mu_{\text{Baseline}} quad (\text{One-Tailed})$$\n        </li>\n      </ul>\n\n      <div class=\"callout callout-info\">\n        <h4>The Legal Trial Analogy</h4>\n        <p>A hypothesis test operates exactly like a criminal trial:\n          <ul>\n            <li>The defendant is presumed innocent until proven guilty beyond a reasonable doubt ($\text{Presume } H_0$).</li>\n            <li>The prosecution (the Black Belt) presents sample evidence.</li>\n            <li>If the evidence is overwhelmingly incompatible with innocence ($p < alpha$), we <strong>Reject $H_0$</strong> and declare guilt ($H_a$).</li>\n            <li>If evidence is insufficient, we <strong>Fail to Reject $H_0$</strong>. (Notice we <em>never</em> declare the defendant \"innocent\"; we merely declare \"not proven guilty\"). In statistics, we never \"accept\" the null hypothesis!</li>\n          </ul>\n        </p>\n      </div>\n\n      <h2>3. The Risk Matrix: Type I Error ($alpha$) vs. Type II Error ($\beta$)</h2>\n      <p>Because we make inferences based on incomplete samples, decision errors are inevitable. Managers balance two distinct risks:</p>\n\n      <table class=\"table table-bordered\">\n        <thead>\n          <tr>\n            <th>Reality in Population</th>\n            <th>Decision: Fail to Reject $H_0$ (Conclude No Difference)</th>\n            <th>Decision: Reject $H_0$ (Conclude Real Difference Exists)</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td><strong>$H_0$ is Actually True</strong><br><em>(No real difference exists)</em></td>\n            <td><strong>Correct Decision</strong><br>Confidence Level: $1 - alpha$ (typically 95%)</td>\n            <td><strong>Type I Error ($alpha$ - Alpha Risk / Producer's Risk)</strong><br>False Alarm: Claiming an improvement exists when it does not! ($alpha = 0.05$).</td>\n          </tr>\n          <tr>\n            <td><strong>$H_0$ is Actually False</strong><br><em>(A real difference exists)</em></td>\n            <td><strong>Type II Error ($\beta$ - Beta Risk / Consumer's Risk)</strong><br>Missed Opportunity: Missing a real improvement! ($\beta approx 0.10\text{--}0.20$).</td>\n            <td><strong>Correct Decision (Power of the Test)</strong><br>Statistical Power: $1 - \beta$ (typically $ge 80%$).</td>\n          </tr>\n        </tbody>\n      </table>\n\n      <h2>4. Demystifying the $p$-Value</h2>\n      <p>The <strong>$p$-value (Probability Value)</strong> is the most widely cited—and most frequently misunderstood—metric in modern data analysis:</p>\n      <blockquote>\n        The $p$-value is the probability of obtaining a test statistic at least as extreme as the one observed in your sample, <strong>assuming the null hypothesis ($H_0$) is true</strong>.\n      </blockquote>\n\n      <p>The universal decision rule in Six Sigma:</p>\n      $$\text{If } p le alpha \text{ (typically 0.05)} implies \text{\textbf{Reject }} H_0 \text{ (Statistically Significant!)}$$\n      $$\text{If } p > alpha \text{ (typically 0.05)} implies \text{\textbf{Fail to Reject }} H_0 \text{ (Not Significant!)}$$\n\n      <div class=\"callout callout-warning\">\n        <h4>Statistical Significance vs. Practical Significance</h4>\n        <p>A critical managerial trap: With a massive sample size ($n = 50,000$), a tiny, trivial difference of 0.001 seconds can yield a statistically significant $p = 0.0001$. However, saving 1 millisecond on an invoice approval that takes 3 days has <strong>zero practical business significance</strong>. Operational managers must pair $p$-values with <strong>Effect Size</strong> and <strong>Confidence Intervals</strong> to determine if an improvement justifies commercial investment.</p>\n      </div>\n\n      <div class=\"video-container\">\n        <iframe src=\"https://www.youtube.com/embed/0oc49DyA3hU\" title=\"Hypothesis Testing, Alpha, Beta and p-Values Masterclass\" allowfullscreen></iframe>\n      </div>\n    ",
    "summary": "Establish inferential statistical foundations, formulate Null ($H_0$) and Alternative ($H_a$) hypotheses, balance Type I ($alpha$) and Type II ($\beta$) risks, interpret $p$-values, and distinguish statistical from practical significance.",
    "keyTakeaways": [
      "Inferential statistics draws valid population conclusions from sample data.",
      "The Null Hypothesis ($H_0$) assumes no change; the Alternative Hypothesis ($H_a$) claims a real effect exists.",
      "Type I error ($alpha$) is a false positive (claiming an effect that doesn't exist); standard threshold is $alpha = 0.05$.",
      "Type II error ($\beta$) is a false negative (failing to detect a real improvement); Statistical Power is $1 - \beta ge 80%$.",
      "If $p le 0.05$, reject $H_0$; always evaluate statistical significance alongside practical business significance."
    ]
  },
  {
    "id": "CH-SSM-016",
    "courseId": "CRS-SSM-001",
    "title": "Hypothesis Testing for Means: One-Sample t-Test, Two-Sample t-Test & Paired t-Test",
    "order": 16,
    "estimatedMinutes": 65,
    "content": "\n      <h2>1. The Family of Student's t-Tests</h2>\n      <p>When analyzing continuous operational variables (lead times, dimensions, chemical yields, server latencies), comparing process averages (means) is the most frequent statistical activity in the Analyze phase. Because true population standard deviations ($sigma$) are almost never known in real-world business environments, operations managers rely on the <strong>Student's $t$-Distribution</strong> (developed by William Sealy Gosset under the pseudonym \"Student\" at Guinness Brewery in 1908).</p>\n      \n      <p>The $t$-distribution features heavier tails than the standard normal distribution, accurately accounting for the additional uncertainty introduced when estimating population standard deviation from small sample sizes. As sample degrees of freedom ($df = n - 1$) increase, the $t$-distribution converges to the normal distribution.</p>\n\n      <h2>2. Decision Matrix: Selecting the Right Mean Test</h2>\n      <p>Choosing the correct test depends on the experimental design and data independence:</p>\n\n      <table class=\"table table-bordered\">\n        <thead>\n          <tr>\n            <th>Hypothesis Test</th>\n            <th>Primary Objective</th>\n            <th>Data Structure & Assumptions</th>\n            <th>Operational Example</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td><strong>1-Sample $t$-Test</strong></td>\n            <td>Compare a single sample mean ($\bar{X}$) against a known target or historical benchmark ($mu_0$).</td>\n            <td>Continuous data; independent samples; roughly normal distribution.</td>\n            <td>Testing whether average call center handling time ($\bar{X}$) meets the contractual SLA target of 180 seconds ($mu_0$).</td>\n          </tr>\n          <tr>\n            <td><strong>2-Sample $t$-Test (Independent)</strong></td>\n            <td>Compare the means of two independent, unrelated groups ($\bar{X}_1$ vs. $\bar{X}_2$).</td>\n            <td>Continuous data; two independent groups; checks for equal vs. unequal variances (Welch's correction).</td>\n            <td>Comparing packaging cycle time on Shift 1 (Day) versus Shift 2 (Night).</td>\n          </tr>\n          <tr>\n            <td><strong>Paired $t$-Test (Dependent)</strong></td>\n            <td>Compare two paired, dependent measurements taken on the <em>exact same subjects</em> (Before vs. After).</td>\n            <td>Continuous data; natural pairing; the test evaluates the mean difference ($d_i = X_{\text{After}} - X_{\text{Before}}$).</td>\n            <td>Measuring invoice processing error rates for 20 clerks <em>before</em> and <em>after</em> implementing a new software checklist.</td>\n          </tr>\n        </tbody>\n      </table>\n\n      <h2>3. The 1-Sample $t$-Test Mathematical Architecture</h2>\n      <p>The test statistic measures how many standard errors the sample mean lies from the hypothesized target:</p>\n      \n      $$t = \frac{\bar{X} - mu_0}{\frac{s}{sqrt{n}}}$$\n      <p>With degrees of freedom $df = n - 1$. If the resulting $p$-value &lt; 0.05, we reject $H_0$ and conclude that the process mean differs significantly from target.</p>\n\n      <h2>4. The 2-Sample $t$-Test & Welch's Correction</h2>\n      <p>When comparing two independent populations, managers must test for <strong>Equal Variances</strong> (using the $F$-test or Levene's test). If variances are equal, pooled variance is used. However, in modern operations, managers routinely use <strong>Welch's Two-Sample $t$-Test</strong>, which does not assume equal variances and adjusts degrees of freedom accordingly:</p>\n      \n      $$t = \frac{\bar{X}_1 - \bar{X}_2}{sqrt{\frac{s_1^2}{n_1} + \frac{s_2^2}{n_2}}}$$\n\n      <div class=\"callout callout-info\">\n        <h4>Why Paired $t$-Tests Are Vastly More Powerful</h4>\n        <p>Whenever possible, design experiments as <strong>Paired Studies</strong>! In an independent 2-sample test, extraneous background noise (differences in operator typing speed, operator IQ, desk ergonomics) increases denominator variance, making it harder to detect small improvements. A Paired test takes differences on the <em>same operator</em> ($d_i = \text{After} - \text{Before}$), subtracting away all subject-to-subject variation and drastically increasing statistical power!</p>\n      </div>\n\n      <pre><code class=\"language-python\"># Executing a Paired t-Test in Python (scipy.stats)\nimport scipy.stats as stats\n\n# Cycle time in seconds for 12 technicians Before and After Lean 5S reorganization\nbefore = [54.2, 58.1, 62.4, 49.8, 55.0, 61.2, 57.3, 53.9, 59.5, 64.1, 51.2, 56.8]\nafter  = [48.1, 51.0, 55.2, 45.3, 49.8, 54.1, 50.9, 48.2, 53.0, 57.4, 46.5, 50.1]\n\nt_stat, p_val = stats.ttest_rel(after, before)\nprint(f\"Paired t-statistic: {t_stat:.4f}, p-value: {p_val:.6f}\")\n# Output: Paired t-statistic: -14.8291, p-value: 0.000000\n# Conclusion: p < 0.001 -> Reject H0! The 5S reorganization produced a massive, verified cycle time reduction.</code></pre>\n\n      <div class=\"video-container\">\n        <iframe src=\"https://www.youtube.com/embed/pTmLQvMM-1M\" title=\"1-Sample, 2-Sample and Paired t-Tests Masterclass\" allowfullscreen></iframe>\n      </div>\n    ",
    "summary": "Select and execute hypothesis tests for means, formulate 1-Sample, 2-Sample, and Paired $t$-tests, apply Welch's variance correction, and harness the statistical power of paired experimental designs.",
    "keyTakeaways": [
      "Student's $t$-distribution accounts for the added uncertainty of estimating population standard deviation from small samples.",
      "1-Sample $t$-test compares a sample mean against a fixed benchmark target ($mu_0$).",
      "2-Sample $t$-test compares two independent groups (e.g., Day shift vs. Night shift).",
      "Welch's $t$-test is robust against unequal group variances.",
      "Paired $t$-tests evaluate before-and-after differences on identical subjects, eliminating subject-to-subject noise and maximizing statistical power."
    ]
  },
  {
    "id": "CH-SSM-017",
    "courseId": "CRS-SSM-001",
    "title": "Hypothesis Testing for Variances & Multi-Group Analysis: F-Test, Bartlett's Test & One-Way / Two-Way ANOVA",
    "order": 17,
    "estimatedMinutes": 65,
    "content": "\n      <h2>1. The Flaw of Multiple Pairwise t-Tests</h2>\n      <p>Suppose an operations manager wants to compare the throughput of <strong>four different manufacturing lines</strong> (Line A, Line B, Line C, Line D). A naive analyst might consider running six separate 2-Sample $t$-tests (A vs B, A vs C, A vs D, B vs C, B vs D, C vs D).</p>\n      \n      <p>This approach commits a catastrophic statistical error known as <strong>Alpha Inflation (Family-Wise Error Rate)</strong>. If each test carries an $alpha = 0.05$ risk of a false positive, the cumulative probability of falsely declaring at least one difference across $k = 6$ tests is:\n        $$alpha_{\text{family}} = 1 - (1 - alpha)^k = 1 - (0.95)^6 = 1 - 0.735 = 0.265 \text{ or } mathbf{26.5%!}$$\n      There is a greater than 1-in-4 chance of reaching a false conclusion! To compare three or more group means simultaneously while locking the global error rate strictly at 5%, operations managers use <strong>ANOVA (Analysis of Variance)</strong>.</p>\n\n      <h2>2. Tests for Equal Variance: $F$-Test, Bartlett's & Levene's Tests</h2>\n      <p>Before running ANOVA, managers must verify the assumption of equal variances (homoscedasticity):</p>\n      <ul>\n        <li><strong>$F$-Test:</strong> Compares the variances of exactly <strong>two</strong> groups by evaluating the ratio of sample variances:\n          $$F = \frac{s_1^2}{s_2^2}$$\n          (Put the larger variance in the numerator so $F ge 1.0$). Highly sensitive to non-normality.\n        </li>\n        <li><strong>Bartlett's Test:</strong> Compares variances across <strong>3 or more</strong> groups. Extremely powerful for normally distributed data.</li>\n        <li><strong>Levene's Test:</strong> Robust alternative to Bartlett's test when data deviates from normality (evaluates absolute deviations from the group median).</li>\n      </ul>\n      <p>If $p > 0.05$ in Levene's test, the equal variance assumption holds.</p>\n\n      <h2>3. One-Way ANOVA: The Mechanics of Variance Partitioning</h2>\n      <p>Despite being called \"Analysis of Variance\", ANOVA actually tests whether several <strong>group means</strong> are equal! It accomplishes this by partitioning the total sum of squares ($SS_{\text{Total}}$) into two components:</p>\n\n      $$\text{Total Variation} = \text{Between-Group Variation} + \text{Within-Group Variation}$$\n      $$SS_{\text{Total}} = SS_{\text{Factor}} + SS_{\text{Error}}$$\n\n      <table class=\"table table-bordered\">\n        <thead>\n          <tr>\n            <th>Source of Variation</th>\n            <th>Degrees of Freedom ($df$)</th>\n            <th>Sum of Squares ($SS$)</th>\n            <th>Mean Square ($MS$)</th>\n            <th>$F$-Statistic</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td><strong>Between Groups (Factor / Lines)</strong></td>\n            <td>$k - 1$</td>\n            <td>$SS_{\text{Factor}}$</td>\n            <td>$MS_{\text{Factor}} = \frac{SS_{\text{Factor}}}{k - 1}$</td>\n            <td rowspan=\"2\">$$F = \frac{MS_{\text{Factor}}}{MS_{\text{Error}}}$$</td>\n          </tr>\n          <tr>\n            <td><strong>Within Groups (Error / Random Noise)</strong></td>\n            <td>$N - k$</td>\n            <td>$SS_{\text{Error}}$</td>\n            <td>$MS_{\text{Error}} = \frac{SS_{\text{Error}}}{N - k}$</td>\n          </tr>\n          <tr>\n            <td><strong>Total</strong></td>\n            <td>$N - 1$</td>\n            <td>$SS_{\text{Total}}$</td>\n            <td colspan=\"2\">If $F$ is large ($p < 0.05$), between-group differences exceed random error!</td>\n          </tr>\n        </tbody>\n      </table>\n\n      <div class=\"callout callout-info\">\n        <h4>Post-Hoc Analysis: Tukey's HSD (Honestly Significant Difference)</h4>\n        <p>A significant ANOVA ($p < 0.05$) only proves that <em>at least one group mean is different</em>; it does not tell you <em>which</em> specific groups differ. To identify exactly which lines outperform others without inflating alpha, managers run a <strong>Tukey-Kramer Post-Hoc Test</strong>. Tukey generates simultaneous confidence intervals for all pairwise comparisons, cleanly isolating the winning machine or line.</p>\n      </div>\n\n      <h2>4. Two-Way ANOVA & Interaction Effects</h2>\n      <p>When studying two factors simultaneously (e.g., Factor A = Temperature: Low, Med, High; Factor B = Raw Material Supplier: Vendor 1 vs Vendor 2), <strong>Two-Way ANOVA</strong> evaluates three distinct hypotheses:</p>\n      <ol>\n        <li>Main effect of Factor A.</li>\n        <li>Main effect of Factor B.</li>\n        <li><strong>Interaction Effect ($A \times B$):</strong> Does the effect of Temperature depend upon which Supplier's material is used? On an Interaction Plot, non-parallel lines signify an interaction effect—revealing hidden operational synergies or conflicts!</li>\n      </ol>\n\n      <div class=\"video-container\">\n        <iframe src=\"https://www.youtube.com/embed/ITf4vHhyGpc\" title=\"One-Way and Two-Way ANOVA with Tukey Post-Hoc Masterclass\" allowfullscreen></iframe>\n      </div>\n    ",
    "summary": "Prevent alpha inflation using ANOVA, verify equal variances via Levene's and Bartlett's tests, partition sums of squares into between-group and within-group variance, and isolate pairwise differences with Tukey's HSD.",
    "keyTakeaways": [
      "Running multiple pairwise $t$-tests causes alpha inflation, dramatically increasing false-positive risks.",
      "ANOVA compares 3+ group means simultaneously while maintaining global alpha at 0.05.",
      "The $F$-statistic is the ratio of Between-Group variance to Within-Group random error ($MS_{\text{Factor}} / MS_{\text{Error}}$).",
      "Levene's test verifies the assumption of equal variance across groups, robust against non-normality.",
      "Tukey's HSD post-hoc test identifies exactly which specific groups differ after ANOVA confirms overall significance.",
      "Two-Way ANOVA evaluates interaction effects ($A \times B$); non-parallel interaction lines indicate factor dependency."
    ]
  },
  {
    "id": "CH-SSM-018",
    "courseId": "CRS-SSM-001",
    "title": "Correlation, Simple Linear Regression & Multiple Regression Analysis for Process Drivers (Y = f(X))",
    "order": 18,
    "estimatedMinutes": 65,
    "content": "\n      <h2>1. Quantifying Mathematical Relationships</h2>\n      <p>The ultimate goal of the Analyze phase is to transition from qualitative theories to an empirical mathematical equation governing the process:\n        $$Y = f(X_1, X_2, dots, X_p)$$\n      Once this equation is validated, the team can predict operational outcomes, set optimal machine setpoints, and establish tolerances that guarantee zero defects.</p>\n\n      <h2>2. Correlation Analysis: Pearson's $r$ vs. Spearman's $\rho$</h2>\n      <p><strong>Correlation</strong> measures the strength and direction of the linear association between two continuous variables:</p>\n      <ul>\n        <li><strong>Pearson Correlation Coefficient ($r$):</strong> Ranges from $-1.0$ (perfect negative correlation) to $+1.0$ (perfect positive correlation), with $0$ indicating no linear relationship.\n          $$r = \frac{sum (X - \bar{X})(Y - \bar{Y})}{sqrt{sum (X - \bar{X})^2 sum (Y - \bar{Y})^2}}$$\n          Assumes continuous, normally distributed data with linear relationships.\n        </li>\n        <li><strong>Spearman's Rank Correlation ($\rho$):</strong> Non-parametric alternative that evaluates monotonic relationships based on data ranks rather than raw values. Robust against non-linear curvature and outliers.</li>\n      </ul>\n\n      <div class=\"callout callout-warning\">\n        <h4>Correlation Does NOT Equal Causation!</h4>\n        <p>A strong correlation ($r = 0.92$) between ice cream sales and shark attacks does not mean eating ice cream attracts sharks; both are driven by a third confounding variable: warm summer weather! Never assume causality from correlation alone. Operations managers must prove causality through physical engineering mechanisms or controlled experiments (DOE).</p>\n      </div>\n\n      <h2>3. Simple Linear Regression Analysis</h2>\n      <p>While correlation quantifies association, <strong>Regression</strong> models the functional mathematical relationship to predict the dependent variable ($Y$) from an independent predictor ($X$):</p>\n      \n      $$hat{Y} = \beta_0 + \beta_1 X + epsilon$$\n      <p>Where $\beta_0$ is the $Y$-intercept, $\beta_1$ is the slope coefficient, and $epsilon$ is random error.</p>\n\n      <h3>Evaluating Regression Model Quality</h3>\n      <table class=\"table table-bordered\">\n        <thead>\n          <tr>\n            <th>Diagnostic Metric</th>\n            <th>Mathematical Meaning</th>\n            <th>Executive Interpretation</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td><strong>$p$-Value of Predictor</strong></td>\n            <td>Tests $H_0: \beta_1 = 0$ (Slope is zero / no relationship).</td>\n            <td>If $p < 0.05$, the predictor variable $X$ is a statistically significant driver of $Y$.</td>\n          </tr>\n          <tr>\n            <td><strong>Coefficient of Determination ($R^2$)</strong></td>\n            <td>The percentage of total variation in $Y$ explained by the regression model ($0%\text{ to }100%$).</td>\n            <td>If $R^2 = 82%$, 82% of the variation in cycle time is explained by machine temperature; 18% is unexplained noise.</td>\n          </tr>\n          <tr>\n            <td><strong>Adjusted $R^2$ ($R^2_{\text{adj}}$)</strong></td>\n            <td>Penalizes the addition of extraneous, useless predictor variables to the model.</td>\n            <td>Always compare models using $R^2_{\text{adj}}$ to prevent over-fitting!</td>\n          </tr>\n        </tbody>\n      </table>\n\n      <h2>4. Multiple Linear Regression & Multicollinearity (VIF)</h2>\n      <p>In complex enterprise processes, the outcome is driven by multiple simultaneous inputs:\n        $$hat{Y} = \beta_0 + \beta_1 X_1 + \beta_2 X_2 + \beta_3 X_3 + epsilon$$\n      When multiple predictors are correlated with each other (e.g. ambient temperature and coolant temperature), <strong>Multicollinearity</strong> destabilizes the model, causing slope coefficients to swing wildly and inflating $p$-values.</p>\n      \n      <p>Managers diagnose multicollinearity using the <strong>Variance Inflation Factor (VIF)</strong>:\n        $$VIF_j = \frac{1}{1 - R_j^2}$$\n      <ul>\n        <li><strong>$VIF approx 1$:</strong> Ideal; no multicollinearity.</li>\n        <li><strong>$1 < VIF < 5$:</strong> Moderate correlation; acceptable.</li>\n        <li><strong>$VIF > 5$ (or $> 10$):</strong> Severe multicollinearity! The model cannot separate the individual effects of the predictors. One of the redundant variables must be removed.</li>\n      </ul>\n      </p>\n\n      <h2>5. Residual Diagnostics: Validating Model Assumptions</h2>\n      <p>A regression equation cannot be accepted until its <strong>Residuals ($e_i = Y_i - hat{Y}_i$)</strong> pass four diagnostic checks (the \"4-in-1 Plot\"):</p>\n      <ol>\n        <li><strong>Normality:</strong> Residuals must follow a straight line on a normal probability plot.</li>\n        <li><strong>Versus Fits (Homoscedasticity):</strong> Residuals must scatter randomly around zero with constant variance across predicted values (no megaphone/funnel shapes!).</li>\n        <li><strong>Versus Order (Independence):</strong> Residuals must show zero time-series patterns, cyclical waves, or autocorrelation.</li>\n      </ol>\n\n      <div class=\"video-container\">\n        <iframe src=\"https://www.youtube.com/embed/PaFPbb66DxQ\" title=\"Simple and Multiple Linear Regression Analysis Masterclass\" allowfullscreen></iframe>\n      </div>\n    ",
    "summary": "Construct empirical regression models ($Y = f(X)$), calculate Pearson and Spearman correlation, evaluate $R^2$ and Adjusted $R^2$, detect multicollinearity using VIF, and validate residual assumptions.",
    "keyTakeaways": [
      "Correlation measures association strength ($-1$ to $+1$); regression models mathematical prediction.",
      "Correlation does not equal causation; causal mechanisms must be verified through engineering and DOE.",
      "$R^2$ indicates the proportion of outcome variation explained by the model; Adjusted $R^2$ guards against overfitting.",
      "Multicollinearity occurs when predictors correlate with each other; diagnose with VIF (remove variables with $\text{VIF} > 5$).",
      "Residual diagnostics (normality, equal variance, independence) must be verified before acting on any regression model."
    ]
  }
],
  assessments: [
  {
    "id": "ASM-SSM-013",
    "courseId": "CRS-SSM-001",
    "chapterId": "CH-SSM-013",
    "title": "Assessment: Qualitative Root Cause Analysis (Fishbone, 5 Whys & C&E Matrix)",
    "passingScore": 70,
    "questions": [
      {
        "id": "Q-SSM-121",
        "question": "What are the standard 6M categories used on a manufacturing Ishikawa Fishbone diagram?",
        "options": [
          "Money, Marketing, Management, Meetings, Motivation, Morale",
          "Man (People), Machine, Method, Material, Measurement, Milieu (Environment)",
          "Monday, Morning, Midday, Midnight, Monthly, Maintenance",
          "Micro, Macro, Metric, Model, Map, Module"
        ],
        "correctAnswer": 1,
        "explanation": "The traditional 6M framework organizes causes into Man (People), Machine, Method, Material, Measurement, and Milieu (Environment)."
      },
      {
        "id": "Q-SSM-122",
        "question": "What is a critical failure in executing the 5 Whys technique?",
        "options": [
          "Stopping the investigation at 'Operator Error' rather than investigating why the system permitted the human error to occur",
          "Asking questions too loudly",
          "Using a whiteboard instead of a computer",
          "Consulting frontline workers"
        ],
        "correctAnswer": 0,
        "explanation": "Stopping at operator error fails to identify systemic root causes. Operations managers must ask why the process or training allowed the error to happen."
      },
      {
        "id": "Q-SSM-123",
        "question": "What is the primary function of a Cause-and-Effect (C&E / XY) Matrix in the Analyze phase?",
        "options": [
          "To calculate the standard deviation of chemical samples",
          "To mathematically prioritize a large list of brainstormed process inputs (Xs) against weighted customer CTQ outputs (Ys) to identify the vital few factors for statistical testing",
          "To evaluate employee attendance records",
          "To purchase new factory machines"
        ],
        "correctAnswer": 1,
        "explanation": "The C&E Matrix narrows down dozens of candidate Xs from the Fishbone by scoring their correlation against weighted customer CTQs."
      },
      {
        "id": "Q-SSM-124",
        "question": "Who developed the Cause-and-Effect (Fishbone) diagram?",
        "options": [
          "Kaoru Ishikawa",
          "Taiichi Ohno",
          "Henry Ford",
          "Bill Smith"
        ],
        "correctAnswer": 0,
        "explanation": "Kaoru Ishikawa pioneered the Cause-and-Effect diagram at the University of Tokyo in the 1960s."
      },
      {
        "id": "Q-SSM-125",
        "question": "What does the 'head' of the Ishikawa fishbone diagram represent?",
        "options": [
          "The company logo",
          "The specific Problem Statement or Defect (the primary Y outcome variable under investigation)",
          "The project manager's name",
          "The total budget spent"
        ],
        "correctAnswer": 1,
        "explanation": "The head represents the effect or problem statement ($Y$) being analyzed, with the bones feeding into it representing potential causes ($X$s)."
      },
      {
        "id": "Q-SSM-126",
        "question": "What framework is often substituted for the 6M in service, healthcare, and office environments?",
        "options": [
          "The 4P Framework (Personnel, Policies, Procedures, Plant/Platform)",
          "The 8 Wastes",
          "The Fibonacci sequence",
          "The Periodic Table"
        ],
        "correctAnswer": 0,
        "explanation": "Service and administrative environments frequently adapt the 6M into the 4P / 5S framework: Personnel, Policies, Procedures, and Plant/Platform."
      },
      {
        "id": "Q-SSM-127",
        "question": "Why should every answer in a 5 Whys analysis be physically or empirically verified?",
        "options": [
          "To prevent confirmation bias and stop teams from acting on speculative or theoretical assumptions",
          "Because calculators require paper receipts",
          "To satisfy legal courtroom requirements",
          "Because 5 Whys is legally binding"
        ],
        "correctAnswer": 0,
        "explanation": "Without physical or statistical verification of each 'Why' step, teams often follow speculative assumptions down incorrect root cause rabbit holes."
      },
      {
        "id": "Q-SSM-128",
        "question": "In a Cause-and-Effect Matrix, what standard scale is commonly used to score the relationship between an Input (X) and an Output (Y)?",
        "options": [
          "1 to 100 in increments of 10",
          "0 (None), 1 (Weak), 3 (Moderate), 9 (Strong)",
          "Yes / No",
          "A, B, C, D"
        ],
        "correctAnswer": 1,
        "explanation": "The non-linear 0-1-3-9 scale emphasizes strong relationships, separating vital drivers from marginal factors."
      },
      {
        "id": "Q-SSM-129",
        "question": "What is a 'Why-Why Tree'?",
        "options": [
          "A species of oak tree planted in Japan",
          "A branching 5 Whys diagram that accounts for multiple simultaneous failure pathways contributing to an event",
          "A mathematical decision tree for calculating profit",
          "A software code file"
        ],
        "correctAnswer": 1,
        "explanation": "Complex operational failures often have multiple branching causes. A Why-Why tree maps multiple contributing causal paths rather than a single linear chain."
      },
      {
        "id": "Q-SSM-130",
        "question": "Once the vital few Xs are identified via the C&E Matrix, what is the next step in the DMAIC roadmap?",
        "options": [
          "Immediately purchase expensive new equipment",
          "Validate and prove their statistical significance using Hypothesis Testing, ANOVA, or Regression in the Analyze phase",
          "Close the project and write the final report",
          "Return to the Define phase"
        ],
        "correctAnswer": 1,
        "explanation": "Qualitative screening identifies suspects; inferential statistical tests (hypothesis testing, regression) formally prove whether they are statistically significant root causes."
      }
    ]
  },
  {
    "id": "ASM-SSM-014",
    "courseId": "CRS-SSM-001",
    "chapterId": "CH-SSM-014",
    "title": "Assessment: Failure Mode and Effects Analysis (FMEA & RPN)",
    "passingScore": 70,
    "questions": [
      {
        "id": "Q-SSM-131",
        "question": "What are the three core rating dimensions evaluated in a Process FMEA?",
        "options": [
          "Speed, Cost, Quality",
          "Severity (S), Occurrence (O), and Detection (D)",
          "Man, Machine, Method",
          "Input, Output, Process"
        ],
        "correctAnswer": 1,
        "explanation": "PFMEAs score Severity (impact of failure), Occurrence (probability of cause), and Detection (effectiveness of current controls to detect before customer shipment)."
      },
      {
        "id": "Q-SSM-132",
        "question": "Why can the Severity (S) rating in an FMEA never be reduced by adding more inspection stations?",
        "options": [
          "Inspectors refuse to change severity scores",
          "Severity is an intrinsic property of the failure's impact on the customer; inspection only affects Detection (D)",
          "Severity can only be changed by the CEO",
          "Inspection reduces Severity automatically"
        ],
        "correctAnswer": 1,
        "explanation": "Severity reflects how severely the customer is harmed if the defect escapes. Inspecting more often catches defects (improving Detection), but doesn't change the harm if it does escape."
      },
      {
        "id": "Q-SSM-133",
        "question": "How is the traditional Risk Priority Number (RPN) calculated in an FMEA?",
        "options": [
          "RPN = Severity + Occurrence + Detection",
          "RPN = Severity * Occurrence * Detection",
          "RPN = Severity / (Occurrence * Detection)",
          "RPN = (Severity * Occurrence) / Detection"
        ],
        "correctAnswer": 1,
        "explanation": "The traditional Risk Priority Number is the product of the three scores: $\text{RPN} = S \times O \times D$, ranging from 1 to 1,000."
      },
      {
        "id": "Q-SSM-134",
        "question": "Why did the harmonized AIAG-VDA FMEA standard replace RPN with Action Priority (AP: High, Medium, Low)?",
        "options": [
          "Multiplication is too difficult for software",
          "RPN multiplication allows high-severity catastrophic safety risks with low occurrence to be masked by low numerical RPN scores, creating severe safety blind spots",
          "VDA eliminated all failure modes",
          "Because AP uses colors instead of letters"
        ],
        "correctAnswer": 1,
        "explanation": "Simple RPN multiplication treats $S=10, O=2, D=4$ (RPN 80, lethal risk) as lower priority than $S=2, O=8, D=8$ (RPN 128, cosmetic flaw). Action Priority prioritizes Severity first."
      },
      {
        "id": "Q-SSM-135",
        "question": "What does a Detection (D) score of 1 indicate in an FMEA?",
        "options": [
          "The defect is impossible to detect",
          "Almost certain detection: an automated 100% Poka-Yoke error-proofing device prevents or catches the defect automatically",
          "Manual visual inspection by an operator",
          "The gauge has not been calibrated"
        ],
        "correctAnswer": 1,
        "explanation": "A Detection rating of 1 represents virtually certain detection, typically via automated mistake-proofing (Poka-Yoke) or 100% automated interlocks."
      },
      {
        "id": "Q-SSM-136",
        "question": "What does a Severity rating of 9 or 10 represent in standard AIAG FMEA rubrics?",
        "options": [
          "A minor cosmetic defect that customer will not notice",
          "Catastrophic failure impacting safety, human life, or violating government safety/environmental regulations without warning",
          "A delay in delivery of 1 hour",
          "A packaging label printed in black instead of blue"
        ],
        "correctAnswer": 1,
        "explanation": "Severity 9 and 10 are reserved for critical regulatory violations and safety hazards that risk human injury or death."
      },
      {
        "id": "Q-SSM-137",
        "question": "What is the primary difference between a DFMEA and a PFMEA?",
        "options": [
          "DFMEA focuses on product design; PFMEA focuses on manufacturing and operational process execution",
          "DFMEA is used in Europe; PFMEA is used in Asia",
          "PFMEA has no severity ratings",
          "DFMEA is conducted after production starts"
        ],
        "correctAnswer": 0,
        "explanation": "Design FMEA (DFMEA) evaluates vulnerabilities in product design (geometry, materials, tolerances); Process FMEA (PFMEA) evaluates process execution (tooling, assembly, operator error)."
      },
      {
        "id": "Q-SSM-138",
        "question": "What is an effective architectural action to reduce the Occurrence (O) rating of a failure mode?",
        "options": [
          "Redesigning the process tooling, changing machine parameters, or implementing preventative maintenance to prevent the root cause from happening",
          "Adding three more inspectors at the end of the line",
          "Increasing the speed of the conveyor belt",
          "Asking the customer to accept defective parts"
        ],
        "correctAnswer": 0,
        "explanation": "Occurrence reflects how frequently the root cause happens. Redesigning tooling, adding automated guides, or stabilizing parameters directly reduces occurrence."
      },
      {
        "id": "Q-SSM-139",
        "question": "When should an FMEA be updated in an operational facility?",
        "options": [
          "Only when the company is sold",
          "It is a living document that must be updated whenever a process/design change occurs, a new failure mode appears, or following corrective actions in Control",
          "Never; it is locked after the Define phase",
          "Only once every 20 years"
        ],
        "correctAnswer": 1,
        "explanation": "FMEA is a living document. It must be updated continuously when designs change, when new failure modes occur, and after improvements are verified."
      },
      {
        "id": "Q-SSM-140",
        "question": "What does a Detection rating of 10 mean in an FMEA?",
        "options": [
          "Certain detection by high-speed cameras",
          "Zero detection capability: the defect cannot be detected by current controls and will almost certainly escape to the customer",
          "The part is 100% defect-free",
          "The inspector has 10 years of experience"
        ],
        "correctAnswer": 1,
        "explanation": "Detection 10 is the worst score: current controls have no mechanism to detect the failure mode prior to delivery."
      }
    ]
  },
  {
    "id": "ASM-SSM-015",
    "courseId": "CRS-SSM-001",
    "chapterId": "CH-SSM-015",
    "title": "Assessment: Inferential Statistics & Hypothesis Testing Fundamentals",
    "passingScore": 70,
    "questions": [
      {
        "id": "Q-SSM-141",
        "question": "What does the Null Hypothesis (H0) represent in scientific hypothesis testing?",
        "options": [
          "The claim that a new tool has revolutionized the process",
          "The status quo: assuming no real difference, no change, and that observed sample variations are due purely to random chance",
          "The target revenue of the company",
          "A statement that is always false"
        ],
        "correctAnswer": 1,
        "explanation": "The Null Hypothesis ($H_0$) represents the baseline position of 'no effect' or 'no difference'. We assume $H_0$ is true until evidence proves otherwise."
      },
      {
        "id": "Q-SSM-142",
        "question": "What is a Type I Error (Alpha risk / Producer's Risk)?",
        "options": [
          "Rejecting the null hypothesis when it is actually true (a False Positive: claiming an improvement exists when it does not)",
          "Failing to reject the null hypothesis when it is actually false",
          "Entering numbers incorrectly into Excel",
          "A failure of the computer battery"
        ],
        "correctAnswer": 0,
        "explanation": "Type I error ($alpha$) is a false positive: concluding there is a significant effect or improvement when in reality none exists (typically capped at $alpha = 0.05$)."
      },
      {
        "id": "Q-SSM-143",
        "question": "What is a Type II Error (Beta risk / Consumer's Risk)?",
        "options": [
          "Failing to reject the null hypothesis when it is actually false (a False Negative: missing a real improvement)",
          "Rejecting the null hypothesis when it is true",
          "A mistake made by the second operator on the shift",
          "A failure to complete the project on time"
        ],
        "correctAnswer": 0,
        "explanation": "Type II error ($\beta$) is a false negative: failing to detect a real improvement or difference that actually exists in the population."
      },
      {
        "id": "Q-SSM-144",
        "question": "What is the Statistical Power of a hypothesis test?",
        "options": [
          "The voltage required to run statistical software",
          "The probability of correctly rejecting the null hypothesis when a real difference exists (Power = 1 - Beta, typically >= 80%)",
          "The number of samples multiplied by 10",
          "The speed of the CPU processor"
        ],
        "correctAnswer": 1,
        "explanation": "Statistical Power ($1 - \beta$) is the test's ability to detect a true effect of a specified size. Industry standards target Power $ge 80%$."
      },
      {
        "id": "Q-SSM-145",
        "question": "What is the correct decision rule when a hypothesis test yields a p-value of 0.012 with alpha = 0.05?",
        "options": [
          "Fail to reject the null hypothesis",
          "Reject the null hypothesis (p <= alpha): the observed difference is statistically significant",
          "Accept the null hypothesis as absolute truth",
          "Delete the data and restart the project"
        ],
        "correctAnswer": 1,
        "explanation": "Because $p = 0.012 le 0.05$, there is statistically significant evidence to reject $H_0$ in favor of $H_a$."
      },
      {
        "id": "Q-SSM-146",
        "question": "What is the definition of a p-value in inferential statistics?",
        "options": [
          "The probability that the null hypothesis is true",
          "The probability of obtaining sample results at least as extreme as those observed, assuming the null hypothesis is true",
          "The probability that the Black Belt made a calculation error",
          "The percentage of defective parts"
        ],
        "correctAnswer": 1,
        "explanation": "The $p$-value measures the probability of seeing data as extreme as observed purely by random chance if the null hypothesis were true."
      },
      {
        "id": "Q-SSM-147",
        "question": "Why should operations managers distinguish between Statistical Significance and Practical Significance?",
        "options": [
          "Because managers dislike statistics",
          "Very large sample sizes can make minuscule, commercially trivial differences statistically significant (p < 0.05) even though they have zero practical business value",
          "Because statistical tests are unreliable",
          "Because regulators only care about practical results"
        ],
        "correctAnswer": 1,
        "explanation": "With $n=100,000$, saving 0.001 seconds can yield $p < 0.001$, but it is practically meaningless. Managers must evaluate effect size alongside $p$-values."
      },
      {
        "id": "Q-SSM-148",
        "question": "Why do statisticians state 'Fail to Reject H0' instead of 'Accept H0'?",
        "options": [
          "To confuse business executives",
          "Because failing to prove guilt in a court of law does not prove absolute innocence; the sample merely lacked sufficient evidence to prove a difference",
          "Because software cannot output the word accept",
          "To avoid paying copyright fees"
        ],
        "correctAnswer": 1,
        "explanation": "A sample cannot prove that no difference exists across an entire infinite population; it can only conclude that current evidence is insufficient to reject the null."
      },
      {
        "id": "Q-SSM-149",
        "question": "What type of hypothesis test should be used when the manager is specifically testing if a new process is faster than the old process (direction specified)?",
        "options": [
          "Two-Tailed Test",
          "One-Tailed (Directional) Test",
          "Zero-Tailed Test",
          "Non-parametric median test"
        ],
        "correctAnswer": 1,
        "explanation": "A one-tailed test evaluates directionality (e.g., $H_a: mu_{\text{New}} < mu_{\text{Old}}$), concentrating all $alpha$ risk in one tail for greater sensitivity."
      },
      {
        "id": "Q-SSM-150",
        "question": "How can an operations team increase the Statistical Power (1 - Beta) of an experiment without changing alpha?",
        "options": [
          "Decrease the sample size",
          "Increase the sample size (n) or reduce experimental measurement noise",
          "Ignore outliers",
          "Run the test on a different computer"
        ],
        "correctAnswer": 1,
        "explanation": "Increasing sample size ($n$) narrows standard error, directly boosting statistical power to detect smaller effect sizes."
      }
    ]
  },
  {
    "id": "ASM-SSM-016",
    "courseId": "CRS-SSM-001",
    "chapterId": "CH-SSM-016",
    "title": "Assessment: Hypothesis Testing for Means (t-Tests)",
    "passingScore": 70,
    "questions": [
      {
        "id": "Q-SSM-151",
        "question": "When is a 1-Sample t-Test appropriate to use in operational analysis?",
        "options": [
          "When comparing 5 different suppliers simultaneously",
          "When comparing the mean of a single continuous sample against a specified benchmark standard or customer SLA target",
          "When analyzing pass/fail attribute data",
          "When the data follows a Poisson distribution"
        ],
        "correctAnswer": 1,
        "explanation": "A 1-Sample $t$-test compares one continuous sample mean ($\bar{X}$) against a known numerical reference target ($mu_0$)."
      },
      {
        "id": "Q-SSM-152",
        "question": "What is the primary advantage of a Paired t-Test over an Independent 2-Sample t-Test?",
        "options": [
          "Paired t-tests run faster in software",
          "By evaluating before-and-after differences on the exact same subjects, it controls for subject-to-subject variation, dramatically increasing statistical power",
          "Paired t-tests do not require continuous data",
          "Paired t-tests work on sample sizes of n = 1"
        ],
        "correctAnswer": 1,
        "explanation": "Paired designs eliminate between-subject background noise by evaluating individual differences ($d_i = \text{After} - \text{Before}$), yielding higher statistical power."
      },
      {
        "id": "Q-SSM-153",
        "question": "What modification did B.L. Welch introduce to the standard 2-Sample t-test?",
        "options": [
          "It converts all t-values into percentages",
          "It adjusts the degrees of freedom and standard error so the test does not assume equal variances between the two groups",
          "It eliminates the need for a p-value",
          "It multiplies the sample mean by 2"
        ],
        "correctAnswer": 1,
        "explanation": "Welch's $t$-test is an unpooled two-sample test that adjusts degrees of freedom to remain robust when the two populations have unequal variances."
      },
      {
        "id": "Q-SSM-154",
        "question": "Why was the Student's t-distribution developed instead of using the standard z-distribution?",
        "options": [
          "To test high-school students",
          "Because in real-world samples, the true population standard deviation (sigma) is unknown and must be estimated from sample standard deviation (s), creating heavier tails",
          "Because normal distributions cannot handle numbers greater than 100",
          "To reduce paper usage"
        ],
        "correctAnswer": 1,
        "explanation": "Gosset created the $t$-distribution to account for the extra sample uncertainty introduced when using sample standard deviation ($s$) instead of known $sigma$."
      },
      {
        "id": "Q-SSM-155",
        "question": "A company measures delivery turnaround times for Shift A (n=25) and Shift B (n=25). The 2-Sample t-test yields t = 3.42 and p = 0.0013. What is the conclusion (alpha = 0.05)?",
        "options": [
          "Fail to reject H0; shifts perform identically",
          "Reject H0 (p < 0.05); there is a statistically significant difference in mean delivery turnaround times between Shift A and Shift B",
          "The test is inconclusive because n < 30",
          "The measurement system is broken"
        ],
        "correctAnswer": 1,
        "explanation": "With $p = 0.0013 < 0.05$, we reject $H_0$. The evidence proves a statistically significant difference between shifts."
      },
      {
        "id": "Q-SSM-156",
        "question": "In a 1-Sample t-test, what are the degrees of freedom (df) for a sample of size n = 22?",
        "options": [
          "df = 22",
          "df = 21 (n - 1)",
          "df = 44",
          "df = 1"
        ],
        "correctAnswer": 1,
        "explanation": "For a 1-Sample $t$-test, degrees of freedom is $df = n - 1 = 22 - 1 = 21$."
      },
      {
        "id": "Q-SSM-157",
        "question": "Which operational scenario calls for an Independent 2-Sample t-Test?",
        "options": [
          "Comparing cycle times of Machine 1 against Machine 2 where each machine processes completely different batches of parts",
          "Measuring blood pressure of the same patient before and after medication",
          "Comparing 6 different factory locations",
          "Counting the number of typos on a website"
        ],
        "correctAnswer": 0,
        "explanation": "Comparing two independent groups of parts processed on two different machines is the classic independent two-sample design."
      },
      {
        "id": "Q-SSM-158",
        "question": "What is an underlying assumption of standard t-tests?",
        "options": [
          "Data must be discrete attributes",
          "Data should be continuous and approximately normally distributed (or sample size large enough for CLT)",
          "Sample size must be at least 1,000",
          "The mean must be zero"
        ],
        "correctAnswer": 1,
        "explanation": "$t$-tests assume continuous data and approximately normal distributions (though moderate skew is tolerated with $n ge 30$ via the Central Limit Theorem)."
      },
      {
        "id": "Q-SSM-159",
        "question": "If the 95% Confidence Interval for the difference between two means (mu1 - mu2) is [-12.4, -2.1], what does this tell you?",
        "options": [
          "Zero is contained in the interval, so there is no difference",
          "Zero is NOT in the interval; Group 1 is statistically significantly lower than Group 2 (p < 0.05)",
          "The calculation resulted in an error",
          "The process is operating at Six Sigma"
        ],
        "correctAnswer": 1,
        "explanation": "Since the entire 95% confidence interval is negative (does not include zero), the difference is statistically significant at $alpha = 0.05$."
      },
      {
        "id": "Q-SSM-160",
        "question": "What test is used to check whether two independent samples have equal variances before running a standard pooled 2-sample t-test?",
        "options": [
          "The F-test (or Levene's test)",
          "The Z-test",
          "The Chi-Square test",
          "Linear regression"
        ],
        "correctAnswer": 0,
        "explanation": "The $F$-test evaluates the ratio of two sample variances ($s_1^2 / s_2^2$) to test the null hypothesis of equal variances."
      }
    ]
  },
  {
    "id": "ASM-SSM-017",
    "courseId": "CRS-SSM-001",
    "chapterId": "CH-SSM-017",
    "title": "Assessment: Hypothesis Testing for Variances & ANOVA",
    "passingScore": 70,
    "questions": [
      {
        "id": "Q-SSM-161",
        "question": "What statistical problem occurs if you run six separate 2-sample t-tests to compare four different production lines?",
        "options": [
          "The computer memory overflows",
          "Alpha Inflation (Family-Wise Error Rate): the cumulative risk of a false positive escalates from 5% to over 26%",
          "The t-distribution becomes non-linear",
          "The sample standard deviation drops to zero"
        ],
        "correctAnswer": 1,
        "explanation": "Running multiple individual tests compounds the false-positive rate ($1 - (0.95)^6 approx 26.5%$). ANOVA avoids this by testing all means simultaneously."
      },
      {
        "id": "Q-SSM-162",
        "question": "In One-Way ANOVA, what does the F-statistic mathematically represent?",
        "options": [
          "The ratio of Between-Group Variance (Factor) to Within-Group Variance (Random Error): MS_Factor / MS_Error",
          "The sum of all sample means",
          "The number of operators on the line",
          "The difference between the highest and lowest observation"
        ],
        "correctAnswer": 0,
        "explanation": "$F = MS_{\text{Factor}} / MS_{\text{Error}}$. When between-group variance is significantly larger than random background noise, $F$ is large and $p < 0.05$."
      },
      {
        "id": "Q-SSM-163",
        "question": "What does a statistically significant ANOVA result (p < 0.05) tell the operations manager?",
        "options": [
          "All groups are completely identical",
          "At least one group mean is statistically significantly different from the others, but it does not specify which one",
          "Line 1 is the best line",
          "The process has zero variation"
        ],
        "correctAnswer": 1,
        "explanation": "ANOVA tests $H_0: mu_1 = mu_2 = dots = mu_k$. Rejecting $H_0$ proves that at least one mean differs, requiring post-hoc testing to identify which pairs differ."
      },
      {
        "id": "Q-SSM-164",
        "question": "Which post-hoc test is standard in Six Sigma to determine which specific group means differ after ANOVA confirms significance, while controlling family-wise error?",
        "options": [
          "Tukey's Honestly Significant Difference (HSD) test",
          "Deming test",
          "Pareto chart",
          "Gage R&R test"
        ],
        "correctAnswer": 0,
        "explanation": "Tukey's HSD performs all pairwise comparisons while strictly maintaining the overall family-wise error rate at $alpha = 0.05$."
      },
      {
        "id": "Q-SSM-165",
        "question": "What test is preferred to evaluate the equality of variances across 3 or more groups when data deviates from normality?",
        "options": [
          "Levene's Test",
          "Bartlett's Test",
          "Student's t-test",
          "Z-test"
        ],
        "correctAnswer": 0,
        "explanation": "Levene's test is robust against non-normal distributions, whereas Bartlett's test is sensitive to normality violations."
      },
      {
        "id": "Q-SSM-166",
        "question": "In a Two-Way ANOVA, what is an 'Interaction Effect'?",
        "options": [
          "Operators chatting with each other on the line",
          "When the effect of one factor on the outcome depends upon the level of a second factor",
          "Two machines breaking down at the exact same second",
          "A correlation between two customers"
        ],
        "correctAnswer": 1,
        "explanation": "An interaction exists when the impact of Factor A depends on the setting of Factor B (e.g. chemical yield increases with temperature for Catalyst 1, but decreases for Catalyst 2)."
      },
      {
        "id": "Q-SSM-167",
        "question": "How is an interaction effect visually identified on an Interaction Plot?",
        "options": [
          "Lines that are perfectly parallel",
          "Lines that are non-parallel, converging, or crossing each other",
          "Lines that are colored blue",
          "Dotted lines"
        ],
        "correctAnswer": 1,
        "explanation": "Parallel lines indicate no interaction. Non-parallel or intersecting lines visually confirm an interaction effect between factors."
      },
      {
        "id": "Q-SSM-168",
        "question": "In an ANOVA table with 4 groups (k = 4) and a total of 60 observations (N = 60), what are the degrees of freedom for the Factor (Between)?",
        "options": [
          "df = 60",
          "df = 3 (k - 1 = 4 - 1)",
          "df = 56",
          "df = 4"
        ],
        "correctAnswer": 1,
        "explanation": "Between-group degrees of freedom is $k - 1 = 4 - 1 = 3$."
      },
      {
        "id": "Q-SSM-169",
        "question": "In an ANOVA table with 4 groups (k = 4) and 60 total observations (N = 60), what are the degrees of freedom for Error (Within)?",
        "options": [
          "df = 56 (N - k = 60 - 4)",
          "df = 3",
          "df = 59",
          "df = 60"
        ],
        "correctAnswer": 0,
        "explanation": "Within-group (Error) degrees of freedom is $N - k = 60 - 4 = 56$."
      },
      {
        "id": "Q-SSM-170",
        "question": "What is the null hypothesis (H0) for Levene's test of equal variances across 3 groups?",
        "options": [
          "H0: mu1 = mu2 = mu3",
          "H0: sigma1^2 = sigma2^2 = sigma3^2 (All group variances are equal)",
          "H0: All groups have zero defects",
          "H0: Cpk >= 1.33"
        ],
        "correctAnswer": 1,
        "explanation": "Levene's test evaluates variance equality: $H_0: sigma_1^2 = sigma_2^2 = dots = sigma_k^2$."
      }
    ]
  },
  {
    "id": "ASM-SSM-018",
    "courseId": "CRS-SSM-001",
    "chapterId": "CH-SSM-018",
    "title": "Assessment: Correlation & Regression Analysis (Y = f(X))",
    "passingScore": 70,
    "questions": [
      {
        "id": "Q-SSM-171",
        "question": "What range of values can the Pearson Correlation Coefficient (r) assume?",
        "options": [
          "0 to 100",
          "-1.0 to +1.0",
          "0 to positive infinity",
          "-100 to +100"
        ],
        "correctAnswer": 1,
        "explanation": "Pearson's $r$ ranges strictly between $-1.0$ (perfect negative correlation) and $+1.0$ (perfect positive correlation), with $0$ indicating no linear relationship."
      },
      {
        "id": "Q-SSM-172",
        "question": "What does the Coefficient of Determination (R-squared = 0.84) mean in a regression analysis?",
        "options": [
          "The process has an 84% scrap rate",
          "84% of the total variation in the outcome Y is explained by the regression model; 16% is unexplained random noise",
          "The slope of the line is 0.84",
          "The p-value is 0.84"
        ],
        "correctAnswer": 1,
        "explanation": "$R^2$ represents the percentage of total variance in the dependent variable explained by the independent predictor(s)."
      },
      {
        "id": "Q-SSM-173",
        "question": "Why is Adjusted R-squared preferred over standard R-squared when evaluating Multiple Regression models?",
        "options": [
          "Adjusted R-squared is always 100%",
          "Standard R-squared artificially increases whenever any new predictor is added (even useless noise); Adjusted R-squared penalizes the addition of non-significant variables",
          "Adjusted R-squared eliminates the need for p-values",
          "Standard R-squared cannot handle negative numbers"
        ],
        "correctAnswer": 1,
        "explanation": "$R^2_{\text{adj}}$ penalizes model complexity, preventing analysts from artificially inflating $R^2$ by adding redundant predictor variables."
      },
      {
        "id": "Q-SSM-174",
        "question": "What is Multicollinearity in a multiple linear regression model?",
        "options": [
          "A software bug in Minitab",
          "When two or more independent predictor variables (Xs) are highly correlated with each other, destabilizing coefficient estimates and inflating standard errors",
          "When the outcome Y is discrete",
          "When residuals follow a curve"
        ],
        "correctAnswer": 1,
        "explanation": "Multicollinearity occurs when predictors share high correlation, making it impossible for the model to isolate their individual effects on $Y$."
      },
      {
        "id": "Q-SSM-175",
        "question": "What metric is used to diagnose multicollinearity in multiple regression, and what threshold indicates severe collinearity?",
        "options": [
          "Z-score > 3.0",
          "Variance Inflation Factor (VIF) > 5 (or > 10)",
          "p-value < 0.05",
          "DPMO > 3.4"
        ],
        "correctAnswer": 1,
        "explanation": "The Variance Inflation Factor (VIF) measures how much the variance of a regression coefficient is inflated by collinearity. VIF &gt; 5-10 indicates severe multicollinearity."
      },
      {
        "id": "Q-SSM-176",
        "question": "What is a 'Residual' in regression analysis?",
        "options": [
          "Leftover metal scrap on the factory floor",
          "The difference between the actual observed value of Y and the value predicted by the regression equation (e_i = Y_i - Y_hat_i)",
          "The intercept of the line",
          "The standard error of the slope"
        ],
        "correctAnswer": 1,
        "explanation": "A residual ($e_i$) is the vertical distance between the actual observed data point and the fitted regression line."
      },
      {
        "id": "Q-SSM-177",
        "question": "When inspecting the 'Residuals vs. Fits' plot, what pattern indicates that the assumption of equal variance (homoscedasticity) is violated?",
        "options": [
          "Points scattered randomly in a horizontal band around zero",
          "A 'megaphone' or 'funnel' shape where residual spread expands or contracts as fitted values increase",
          "Points arranged in a circle",
          "Points forming a single straight horizontal line"
        ],
        "correctAnswer": 1,
        "explanation": "A megaphone or funnel pattern reveals heteroscedasticity (unequal variance), indicating that prediction accuracy degrades at higher operational ranges."
      },
      {
        "id": "Q-SSM-178",
        "question": "What non-parametric correlation coefficient evaluates monotonic relationships based on data ranks rather than raw values?",
        "options": [
          "Pearson's r",
          "Spearman's Rank Correlation (rho)",
          "Student's t",
          "Cohen's Kappa"
        ],
        "correctAnswer": 1,
        "explanation": "Spearman's $\rho$ computes correlation on the ranks of observations, making it robust against non-linear curvature and extreme outliers."
      },
      {
        "id": "Q-SSM-179",
        "question": "In the regression equation Y = 12.5 + 3.2X, what does the slope coefficient 3.2 mean?",
        "options": [
          "For every 1-unit increase in X, Y increases by an average of 3.2 units",
          "When X = 0, Y = 3.2",
          "The correlation is 3.2",
          "The model explains 3.2% of the variance"
        ],
        "correctAnswer": 0,
        "explanation": "The slope ($\beta_1 = 3.2$) dictates the rate of change: for each 1-unit increase in the independent predictor $X$, the outcome $Y$ increases by 3.2 units."
      },
      {
        "id": "Q-SSM-180",
        "question": "Why does a strong correlation between two variables NOT prove that one causes the other?",
        "options": [
          "Because correlation formulas are inaccurate",
          "Both variables could be driven by an unobserved third confounding factor, or the correlation may be a pure statistical coincidence (spurious correlation)",
          "Because Six Sigma forbids regression",
          "Because p-values cannot measure causality"
        ],
        "correctAnswer": 1,
        "explanation": "Correlation proves association, not causation. Confounding variables or spurious associations frequently produce high correlation without causal mechanisms."
      }
    ]
  }
]
};
