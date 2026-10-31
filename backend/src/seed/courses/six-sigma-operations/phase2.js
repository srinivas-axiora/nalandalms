// Phase 2: Chapters 7-12 and Assessments (ASM-SSM-007 to ASM-SSM-012)
export const phase2 = {
  chapters: [
  {
    "id": "CH-SSM-007",
    "courseId": "CRS-SSM-001",
    "title": "Applied Statistics for Process Managers: Normal Distributions, Central Limit Theorem, Variance & Standard Deviation",
    "order": 7,
    "estimatedMinutes": 65,
    "content": "\n      <h2>1. The Foundation of Empirical Process Governance</h2>\n      <p>Operational decisions made on intuition, gut feeling, or executive seniority inevitably fail. Six Sigma replaces subjective debate with statistical rigor. At the core of the <strong>Measure Phase</strong> is the realization that <em>all processes exhibit variation</em>. Two manufactured engine pistons or two customer support phone calls will never be identical. The operational manager's challenge is to mathematically characterize this variation, distinguish routine common-cause background noise from actionable special-cause signals, and quantify process dispersion.</p>\n\n      <h2>2. Measures of Central Tendency & Dispersion</h2>\n      <p>To summarize any operational dataset, managers calculate two fundamental mathematical dimensions:</p>\n      <ul>\n        <li><strong>Central Tendency:</strong> Where does the cluster of data center?\n          <ul>\n            <li><strong>Mean ($mu$ or $\bar{X}$):</strong> The arithmetic average: $\bar{X} = \frac{sum X_i}{n}$. Sensitive to extreme outliers.</li>\n            <li><strong>Median ($\tilde{X}$):</strong> The middle observation when data is sorted in ascending order. Highly robust against outliers (preferred for skewed cycle times).</li>\n            <li><strong>Mode:</strong> The most frequently occurring value in the dataset.</li>\n          </ul>\n        </li>\n        <li><strong>Dispersion (Spread):</strong> How far do individual observations deviate from the center?\n          <ul>\n            <li><strong>Range ($R$):</strong> $R = X_{max} - X_{min}$. Highly vulnerable to sample size extremes.</li>\n            <li><strong>Sample Variance ($s^2$):</strong> The average squared deviation from the mean:\n              $$s^2 = \frac{sum_{i=1}^{n} (X_i - \bar{X})^2}{n - 1}$$\n            </li>\n            <li><strong>Standard Deviation ($sigma$ or $s$):</strong> The square root of the variance ($s = sqrt{s^2}$). Expressed in the exact same physical units as the original data, representing the standard metric of variation in Six Sigma.</li>\n          </ul>\n        </li>\n      </ul>\n\n      <h2>3. The Normal Distribution & The Empirical Rule</h2>\n      <p>The bell-shaped <strong>Normal (Gaussian) Distribution</strong> is defined mathematically by its mean ($mu$) and standard deviation ($sigma$):\n        $$f(x) = \frac{1}{sigma sqrt{2pi}} e^{-\frac{1}{2}left(\frac{x - mu}{sigma}\right)^2}$$\n      </p>\n\n      <div class=\"callout callout-info\">\n        <h4>The 68-95-99.7 Empirical Rule</h4>\n        <p>For any normally distributed process:\n          <ul>\n            <li><strong>$mu pm 1sigma$:</strong> Encompasses approximately <strong>68.27%</strong> of all observations.</li>\n            <li><strong>$mu pm 2sigma$:</strong> Encompasses approximately <strong>95.45%</strong> of all observations.</li>\n            <li><strong>$mu pm 3sigma$:</strong> Encompasses approximately <strong>99.73%</strong> of all observations. (Traditional $3sigma$ control limits leave 0.27% or 2,700 ppm outside limits).</li>\n            <li><strong>$mu pm 6sigma$:</strong> Leaves only <strong>3.4 parts per million</strong> outside limits when accounting for a standard $1.5sigma$ long-term mean drift!</li>\n          </ul>\n        </p>\n      </div>\n\n      <h2>4. The Central Limit Theorem (CLT): The Manager's Superpower</h2>\n      <p>In real-world operations, raw individual cycle times, ticket arrival intervals, and transactional durations are rarely normally distributed; they are frequently skewed, bimodal, or exponential. How can Six Sigma statistical methods work on non-normal business processes?</p>\n      \n      <p>The answer is the <strong>Central Limit Theorem (CLT)</strong>:</p>\n      <blockquote>\n        Regardless of the underlying population distribution of individual observations (whether skewed, uniform, or irregular), the distribution of <strong>sample means ($\bar{X}$)</strong> drawn randomly from that population will approach a <strong>Normal Distribution</strong> as the sample size ($n$) becomes sufficiently large ($n ge 30$).\n      </blockquote>\n      \n      <p>Furthermore, the mean of the sample means equals the true population mean ($mu_{\bar{X}} = mu$), and the dispersion of the sample means (the <strong>Standard Error of the Mean</strong>) shrinks inversely with the square root of $n$:\n        $$sigma_{\bar{X}} = \frac{sigma}{sqrt{n}}$$\n      This mathematical law enables operations managers to apply normal-theory statistical control charts ($X$-bar charts) to virtually any business process by grouping observations into rational subgroups!\n      </p>\n\n      <div class=\"video-container\">\n        <iframe src=\"https://www.youtube.com/embed/zeJD6dqJ5lo\" title=\"Normal Distribution and Central Limit Theorem for Six Sigma\" allowfullscreen></iframe>\n      </div>\n\n      <h2>5. Standardized Normal Scores: The $Z$-Score</h2>\n      <p>To compare different processes with disparate scales (e.g. comparing injection molding diameter measured in millimeters against invoice payment turnaround measured in days), managers convert raw metrics into unitless <strong>$Z$-Scores</strong>:\n        $$Z = \frac{X - mu}{sigma}$$\n      A $Z$-score represents the exact number of standard deviations a data point lies above or below the process mean. In Six Sigma, the \"Sigma Level\" of a process is directly related to the distance (in $Z$-units) between the process mean and the closest customer specification limit ($Z_{min}$).\n      </p>\n    ",
    "summary": "Master applied process statistics, evaluate central tendency and dispersion ($sigma$), leverage the 68-95-99.7 Empirical Rule, apply the Central Limit Theorem to non-normal operational data, and calculate $Z$-scores.",
    "keyTakeaways": [
      "All processes exhibit variation; managing it requires characterizing central tendency ($mu$) and dispersion ($sigma$).",
      "Standard deviation represents the root mean square deviation and is the definitive metric of variation in Six Sigma.",
      "The Empirical Rule dictates that 68.27%, 95.45%, and 99.73% of normal data falls within $pm 1sigma, pm 2sigma$, and $pm 3sigma$.",
      "The Central Limit Theorem proves that sample means are normally distributed ($n ge 30$) even when underlying individual data is heavily skewed.",
      "The $Z$-Score standardizes disparate operational metrics into a universal unit of measure: distance from the mean in standard deviations."
    ]
  },
  {
    "id": "CH-SSM-008",
    "courseId": "CRS-SSM-001",
    "title": "Data Collection Architecture: Stratification, Sampling Techniques, Sample Size Calculations & Measurement Planning",
    "order": 8,
    "estimatedMinutes": 65,
    "content": "\n      <h2>1. The Garbage-In, Garbage-Out Reality of Operational Data</h2>\n      <p>No sophisticated statistical test, machine learning model, or regression analysis can compensate for biased, corrupted, or unrepresentative data collection. If the data feeding the Measure phase is flawed, every subsequent root cause identified in Analyze will be a hallucination. Operational leaders must architect a rigorous <strong>Data Collection Plan</strong> before logging a single observation.</p>\n\n      <h2>2. Continuous vs. Discrete (Attribute) Data</h2>\n      <p>Before designing a measurement protocol, the operations manager must identify the mathematical nature of the data:</p>\n\n      <table class=\"table table-bordered\">\n        <thead>\n          <tr>\n            <th>Data Classification</th>\n            <th>Mathematical Definition</th>\n            <th>Statistical Characteristics</th>\n            <th>Operational Examples</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td><strong>Continuous Data (Variable)</strong></td>\n            <td>Data measured along an unbroken scale; can assume any numerical value within an interval (fractions/decimals).</td>\n            <td><strong>High Information Density:</strong> Requires much smaller sample sizes ($n approx 30$) to detect shifts. Enables powerful parametric tests ($t$-tests, ANOVA).</td>\n            <td>Cycle time in seconds, temperature in &deg;C, package weight in grams, invoice dollar value, server latency in ms.</td>\n          </tr>\n          <tr>\n            <td><strong>Discrete Data (Attribute)</strong></td>\n            <td>Data counted in distinct, non-fractional integers or categorized into qualitative buckets.</td>\n            <td><strong>Low Information Density:</strong> Requires massive sample sizes ($n approx 300\text{--}1000+$) to detect small shifts. Requires non-parametric or binomial/Poisson tests.</td>\n            <td>Pass/Fail, Defective/Non-Defective, count of customer complaints, call center queue drops, department name.</td>\n          </tr>\n        </tbody>\n      </table>\n\n      <div class=\"callout callout-info\">\n        <h4>Operational Rule of Thumb: Convert Discrete to Continuous</h4>\n        <p>Whenever economically feasible, convert discrete attribute measurements into continuous variable data. For instance, instead of recording customer support outcomes as <em>\"SLA Met / SLA Breached\"</em> (discrete), record <em>\"Elapsed ticket resolution time in decimal minutes\"</em> (continuous). This reveals whether a breach missed by 10 seconds or 4 hours, and slashes required sample sizes by over 80%!</p>\n      </div>\n\n      <h2>3. Scientific Sampling Strategies</h2>\n      <p>Collecting 100% of operational data is often economically impossible or introduces inspection fatigue. Managers select appropriate sampling techniques:</p>\n      <ul>\n        <li><strong>Simple Random Sampling:</strong> Every single item in the population has an equal mathematical probability of selection. Avoids human bias; best for uniform populations.</li>\n        <li><strong>Stratified Sampling:</strong> The population is divided into mutually exclusive homogeneous strata (e.g. Day Shift vs. Night Shift; North America vs. APAC), and random samples are drawn proportionally from each stratum. Ensures sub-groups are fairly represented.</li>\n        <li><strong>Systematic Sampling:</strong> Selecting every $k$-th item from a process stream (e.g., inspecting every 25th container exiting the conveyor belt). Must verify that the sampling interval does not synchronize with a hidden cyclical machine rhythm.</li>\n        <li><strong>Rational Subgrouping:</strong> Drawing small samples ($n = 4\text{ to }5$) collected within a narrow time window where variation is minimized within the subgroup, maximizing the opportunity to detect variation <em>between</em> subgroups over time.</li>\n      </ul>\n\n      <h2>4. Sample Size Calculations</h2>\n      <p>A frequent error is arbitrarily choosing \"30 samples\" for every project. The required sample size depends on the confidence level ($1 - alpha$), the acceptable margin of error ($E$), and process standard deviation ($sigma$):</p>\n      \n      <p>For estimating a <strong>Continuous Mean</strong>:\n        $$n = left(\frac{Z_{alpha/2} cdot sigma}{E}\right)^2$$\n      Where $Z_{0.025} = 1.96$ for a 95% confidence level.\n      </p>\n\n      <p>For estimating a <strong>Discrete Proportion</strong> ($p$):\n        $$n = \frac{Z_{alpha/2}^2 cdot p(1 - p)}{E^2}$$\n      (If $p$ is unknown, assume $p = 0.5$ for the most conservative/maximum sample size estimate).\n      </p>\n\n      <h2>5. The Operational Data Collection Plan</h2>\n      <p>A complete Data Collection Plan specifies:</p>\n      <ol>\n        <li><strong>Data Element & Operational Definition:</strong> Clear, unambiguous definition (e.g. <em>\"When does the clock start? When does it stop?\"</em>).</li>\n        <li><strong>Data Type:</strong> Continuous vs. Discrete.</li>\n        <li><strong>Sampling Plan:</strong> Sampling method, frequency, and sample size ($n$).</li>\n        <li><strong>Data Source & Measurement Tool:</strong> ERP database query, digital scale, optical micrometer.</li>\n        <li><strong>Data Collector & Location:</strong> Name of responsible technician, workstation number.</li>\n      </ol>\n\n      <div class=\"video-container\">\n        <iframe src=\"https://www.youtube.com/embed/B3wM1lF8QYQ\" title=\"Data Collection Planning and Sampling in Six Sigma\" allowfullscreen></iframe>\n      </div>\n    ",
    "summary": "Architect robust Data Collection Plans, distinguish continuous from discrete data, apply scientific sampling strategies (Stratified, Systematic, Rational Subgroups), and calculate sample sizes.",
    "keyTakeaways": [
      "Continuous data provides far higher information density than discrete attribute data, requiring significantly smaller sample sizes.",
      "Convert discrete binary metrics (Pass/Fail) to continuous scale measurements wherever feasible.",
      "Stratified sampling ensures underrepresented shifts or regions are accurately captured.",
      "Rational subgrouping minimizes variation within subgroups while exposing variation between subgroups over time.",
      "Sample size calculations depend on the chosen confidence level ($Z$), process variation ($sigma$), and allowable margin of error ($E$)."
    ]
  },
  {
    "id": "CH-SSM-009",
    "courseId": "CRS-SSM-001",
    "title": "Measurement System Analysis (MSA): Gage R&R (Repeatability & Reproducibility) for Continuous & Attribute Data",
    "order": 9,
    "estimatedMinutes": 65,
    "content": "\n      <h2>1. Can You Trust Your Data?</h2>\n      <p>A cardinal sin of operations management is observing an increase in reported defect rates and immediately re-engineering the manufacturing equipment or retraining frontline operators—without first checking if the measurement tool or inspector is defective. In reality, observed process variation is the sum of two distinct sources:</p>\n      \n      $$sigma^2_{\text{Total Observed}} = sigma^2_{\text{Actual Process}} + sigma^2_{\text{Measurement System}}$$\n\n      <p>If your measurement system accounts for 40% of the observed variation, you are measuring the noise of your measuring tape, not the variation of your product! <strong>Measurement System Analysis (MSA)</strong> is the statistical methodology used in the Measure phase to isolate, evaluate, and validate the precision, accuracy, and stability of the measurement process.</p>\n\n      <h2>2. Anatomical Taxonomy of Measurement Errors</h2>\n      <p>Measurement errors split into two broad categories: <strong>Accuracy (Location)</strong> and <strong>Precision (Width)</strong>:</p>\n\n      <table class=\"table table-bordered\">\n        <thead>\n          <tr>\n            <th>Measurement Property</th>\n            <th>Category</th>\n            <th>Operational Definition & Failure Mode</th>\n            <th>Remediation Strategy</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td><strong>Bias</strong></td>\n            <td>Accuracy</td>\n            <td>The mathematical difference between the observed average of measurements and a certified reference master standard.</td>\n            <td>Recalibrate tool against NIST traceable standards.</td>\n          </tr>\n          <tr>\n            <td><strong>Linearity</strong></td>\n            <td>Accuracy</td>\n            <td>The change in bias across the entire operating range of the instrument (e.g. accurate at 5kg, but off by 500g at 100kg).</td>\n            <td>Multi-point calibration; replace non-linear sensor.</td>\n          </tr>\n          <tr>\n            <td><strong>Stability</strong></td>\n            <td>Accuracy</td>\n            <td>The total variation in measurements obtained with a measurement system on the same parts when measuring a single characteristic over extended time.</td>\n            <td>Control charts on reference standards; environmental temperature controls.</td>\n          </tr>\n          <tr>\n            <td><strong>Repeatability (Equipment Variation - EV)</strong></td>\n            <td>Precision</td>\n            <td>The inherent variation observed when <strong>one operator</strong> uses the <strong>same measurement device</strong> to measure the <strong>same part</strong> multiple times.</td>\n            <td>Fix mechanical wear, gauge clamping, electrical interference.</td>\n          </tr>\n          <tr>\n            <td><strong>Reproducibility (Appraiser Variation - AV)</strong></td>\n            <td>Precision</td>\n            <td>The variation observed when <strong>different operators</strong> use the <strong>same measurement device</strong> to measure the <strong>same part</strong>.</td>\n            <td>Standardize operator measurement SOPs, training, visual cues.</td>\n          </tr>\n        </tbody>\n      </table>\n\n      <h2>3. Continuous Gage R&R: The Crossed Study</h2>\n      <p>The standard continuous MSA protocol is the <strong>Gage Repeatability & Reproducibility (Gage R&R) Crossed Study</strong> (typically: 10 parts, 3 operators, 2 to 3 repeated trials per operator, measured in random order):</p>\n      \n      $$\text{Gage R&R Variance} = sigma^2_{\text{GRR}} = sigma^2_{\text{Repeatability}} + sigma^2_{\text{Reproducibility}}$$\n\n      <div class=\"callout callout-info\">\n        <h4>Automotive Industry Action Group (AIAG) Acceptance Criteria</h4>\n        <p>The system capability is evaluated by calculating <strong>%Gage R&R (%Study Variation or %Tolerance)</strong>:\n          <ul>\n            <li><strong>$%GRR < 10%$:</strong> <strong>Acceptable</strong> measurement system. World-class precision.</li>\n            <li><strong>$10% le %GRR le 30%$:</strong> <strong>Marginal / Conditional</strong>. May be acceptable based on application criticality, cost of gauge, or risk of defect.</li>\n            <li><strong>$%GRR > 30%$:</strong> <strong>Unacceptable!</strong> The measurement system is incapable and cannot be used for Six Sigma analysis. Must be paused and overhauled.</li>\n          </ul>\n        </p>\n      </div>\n\n      <h2>4. Number of Distinct Categories ($ndc$)</h2>\n      <p>Beyond %GRR, an MSA must report the <strong>Number of Distinct Categories ($ndc$)</strong>—a metric representing the number of non-overlapping confidence intervals the measurement system can distinguish across process variation:\n        $$ndc = 1.41 \times \frac{sigma_{\text{Part}}}{sigma_{\text{GRR}}}$$\n      <strong>Criteria:</strong> An acceptable measurement system must exhibit an <strong>$ndc ge 5$</strong>. If $ndc < 2$, the gauge is functioning as nothing more than a crude binary pass/fail stick, unable to detect process shifts.\n      </p>\n\n      <h2>5. Attribute Agreement Analysis (Attribute MSA)</h2>\n      <p>In service, software, and visual inspection environments, data is often discrete (e.g., inspector visual inspection of surface finish, or loan underwriter approval: Approve / Reject). An <strong>Attribute Agreement Analysis</strong> assesses:</p>\n      <ul>\n        <li><strong>Within-Appraiser Agreement (Repeatability):</strong> Does Operator A rate the same 30 parts consistently when presented blind a second time?</li>\n        <li><strong>Between-Appraiser Agreement (Reproducibility):</strong> Do Operator A, Operator B, and Operator C agree on the classification of the same parts?</li>\n        <li><strong>Agreement with Master Standard (Accuracy):</strong> Do the operators agree with the certified known master answer?</li>\n      </ul>\n      <p>Statistical agreement is quantified using <strong>Fleiss' Kappa ($kappa$)</strong> or <strong>Cohen's Kappa</strong> ($kappa > 0.75$ indicates good agreement; $kappa > 0.90$ is excellent).\n      </p>\n\n      <div class=\"video-container\">\n        <iframe src=\"https://www.youtube.com/embed/q0_yqZq4y2M\" title=\"Measurement System Analysis (MSA) and Gage R&R Masterclass\" allowfullscreen></iframe>\n      </div>\n    ",
    "summary": "Conduct rigorous Measurement System Analysis (MSA), delineate repeatability from reproducibility, execute continuous Gage R&R studies against AIAG criteria, calculate $ndc$, and evaluate attribute data with Kappa.",
    "keyTakeaways": [
      "Total observed process variation is the sum of actual process variation plus measurement system error.",
      "Repeatability reflects gauge equipment variation; Reproducibility reflects operator appraiser variation.",
      "AIAG acceptance standards: %GRR &lt; 10% is acceptable; 10%-30% is marginal; &gt;30% is unacceptable.",
      "The Number of Distinct Categories ($ndc$) must be $ge 5$ to detect subtle process shifts.",
      "Attribute Agreement Analysis utilizes Cohen's/Fleiss' Kappa ($kappa ge 0.75$) to evaluate discrete inspections."
    ]
  },
  {
    "id": "CH-SSM-010",
    "courseId": "CRS-SSM-001",
    "title": "Process Capability Analysis: Calculating & Interpreting Cp, Cpk, Pp, Ppk & Parts Per Million (PPM) Defect Rates",
    "order": 10,
    "estimatedMinutes": 65,
    "content": "\n      <h2>1. The Voice of the Process vs. The Voice of the Customer</h2>\n      <p>Once a measurement system is certified reliable through MSA, the operations manager can definitively answer the central question of the Measure phase: <em>Is our process capable of satisfying our customers' requirements?</em></p>\n      \n      <p><strong>Process Capability</strong> is the mathematical comparison between two independent distributions:</p>\n      <ul>\n        <li><strong>Voice of the Customer (VOC):</strong> Defined by the specification width: $\text{Tolerance} = \text{USL} - \text{LSL}$. This is what the customer <em>demands</em>.</li>\n        <li><strong>Voice of the Process (VOP):</strong> Defined by the statistical process spread: $6sigma$. This is what the process is currently <em>delivering</em>.</li>\n      </ul>\n\n      <div class=\"callout callout-info\">\n        <h4>Prerequisite for Capability Analysis: Statistical Stability</h4>\n        <p>A process capability analysis is <strong>statistically invalid</strong> if the process is not in a state of statistical control! A process plagued by out-of-control special causes has an unstable mean and unstable variance; calculating capability on an unstable process produces meaningless numbers. Control charts must verify stability first.</p>\n      </div>\n\n      <h2>2. Potential Capability: $C_p$ (The Wishful Thinking Metric)</h2>\n      <p><strong>$C_p$</strong> measures the <em>potential</em> capability of a process, assuming the process distribution is perfectly centered exactly midway between the customer's Upper (USL) and Lower (LSL) specification limits:</p>\n      \n      $$C_p = \frac{\text{USL} - \text{LSL}}{6sigma_{\text{within}}}$$\n\n      <p>$C_p$ measures only the <em>spread</em> of the process relative to customer tolerance. It completely ignores whether the process is centered on target! A process could have an extraordinary $C_p = 2.0$, but if the mean has drifted far above the USL, 100% of the parts produced will be scrap!</p>\n\n      <h2>3. Actual Capability: $C_{pk}$ (The Reality Metric)</h2>\n      <p>To evaluate true operational performance, Six Sigma calculates <strong>$C_{pk}$</strong>, which accounts for both the process spread <em>and</em> process centering:</p>\n      \n      $$C_{pu} = \frac{\text{USL} - mu}{3sigma}, quad C_{pl} = \frac{mu - \text{LSL}}{3sigma}$$\n      $$C_{pk} = min(C_{pu}, C_{pl})$$\n\n      <table class=\"table table-bordered\">\n        <thead>\n          <tr>\n            <th>Capability Index</th>\n            <th>Statistical Meaning & Centering</th>\n            <th>Process Assessment</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td><strong>$C_{pk} < 1.0$</strong></td>\n            <td>The process spread exceeds specification limits, or the mean has drifted outside limits.</td>\n            <td><strong>Incapable!</strong> The process is generating active defects and customer escapes.</td>\n          </tr>\n          <tr>\n            <td><strong>$C_{pk} = 1.0$</strong></td>\n            <td>The $3sigma$ edge of the process curve touches the customer specification limit.</td>\n            <td><strong>Barely Capable (3-Sigma).</strong> Yields 99.73% quality; produces 2,700 PPM defects with zero margin for error.</td>\n          </tr>\n          <tr>\n            <td><strong>$C_{pk} = 1.33$</strong></td>\n            <td>The $4sigma$ edge of the process curve touches the specification limit.</td>\n            <td><strong>Industry Standard Minimum.</strong> Traditional manufacturing baseline capability (63 PPM).</td>\n          </tr>\n          <tr>\n            <td><strong>$C_{pk} ge 1.67$</strong></td>\n            <td>$5sigma$ process capability.</td>\n            <td><strong>World-Class Quality.</strong> Highly robust against environmental drift.</td>\n          </tr>\n          <tr>\n            <td><strong>$C_{pk} ge 2.0$</strong></td>\n            <td><strong>Six Sigma Capability ($6sigma$).</strong></td>\n            <td><strong>Defect-Free Benchmark.</strong> Allows for a $1.5sigma$ mean shift while maintaining $le 3.4$ DPMO!</td>\n          </tr>\n        </tbody>\n      </table>\n\n      <h2>4. $C_p / C_{pk}$ (Short-Term) vs. $P_p / P_{pk}$ (Long-Term Performance)</h2>\n      <p>In industry audits, managers must distinguish between Capability ($C_p, C_{pk}$) and Performance ($P_p, P_{pk}$):</p>\n      <ul>\n        <li><strong>$C_p, C_{pk}$ (Short-Term Potential):</strong> Uses $sigma_{\text{within}}$ estimated from subgroup ranges or standard deviations ($\bar{R}/d_2$ or $\bar{S}/c_4$). Reflects what the process can achieve in the best-case short term, free of between-batch shift.</li>\n        <li><strong>$P_p, P_{pk}$ (Long-Term Actual):</strong> Uses the overall sample standard deviation ($s_{\text{overall}}$) calculated across all collected historical data:\n          $$P_p = \frac{\text{USL} - \text{LSL}}{6s_{\text{overall}}}, quad P_{pk} = minleft(\frac{\text{USL} - \bar{X}}{3s_{\text{overall}}}, \frac{\bar{X} - \text{LSL}}{3s_{\text{overall}}}\right)$$\n          Reflects the true customer experience over months, incorporating machine wear, operator turnover, and ambient temperature swings.\n        </li>\n      </ul>\n\n      <div class=\"video-container\">\n        <iframe src=\"https://www.youtube.com/embed/G6j_zU3M8v4\" title=\"Process Capability Analysis: Cp, Cpk, Pp, Ppk Masterclass\" allowfullscreen></iframe>\n      </div>\n\n      <h2>5. Defect Metrics: DPU, DPO & DPMO</h2>\n      <p>When reporting to executive management, convert capability metrics into standardized defect rates:</p>\n      <ul>\n        <li><strong>Defects Per Unit (DPU):</strong> $\text{DPU} = \frac{\text{Total Defects Found}}{\text{Total Units Sampled}}$. (A single unit can have multiple defects!).</li>\n        <li><strong>Defects Per Opportunity (DPO):</strong> $\text{DPO} = \frac{\text{Total Defects}}{\text{Total Units} \times \text{Opportunities Per Unit (O)}}$.</li>\n        <li><strong>Defects Per Million Opportunities (DPMO):</strong>\n          $$\text{DPMO} = \text{DPO} \times 1,000,000$$\n        </li>\n      </ul>\n    ",
    "summary": "Calculate and interpret process capability metrics ($C_p, C_{pk}$) and process performance metrics ($P_p, P_{pk}$), distinguish within-subgroup from overall variation, and compute DPU, DPO, and DPMO.",
    "keyTakeaways": [
      "Process capability compares the Voice of the Customer (tolerance) with the Voice of the Process ($6sigma$).",
      "Process stability on control charts is an absolute prerequisite for valid capability analysis.",
      "$C_p$ measures potential spread assuming perfect centering; $C_{pk}$ accounts for actual process centering.",
      "$C_{pk} ge 1.33$ is standard industry minimum; $C_{pk} ge 2.0$ represents Six Sigma excellence.",
      "$C_{pk}$ uses short-term within-subgroup variation; $P_{pk}$ uses long-term overall sample variation.",
      "DPMO normalizes defect counts across differing product complexities: $\text{DPO} \times 10^6$."
    ]
  },
  {
    "id": "CH-SSM-011",
    "courseId": "CRS-SSM-001",
    "title": "Non-Normal Distributions & Data Transformations: Box-Cox, Johnson Transformations & Non-Parametric Metrics",
    "order": 11,
    "estimatedMinutes": 65,
    "content": "\n      <h2>1. The Non-Normal Operational Reality</h2>\n      <p>Standard capability calculations ($C_p, C_{pk}$) and classic parametric hypothesis tests ($t$-tests, ANOVA) are predicated on the mathematical assumption that process data follows a Gaussian Normal distribution. However, in transactional services, healthcare, logistics, and digital software operations, <strong>real-world data is overwhelmingly non-normal</strong>.</p>\n      \n      <p>Common real-world non-normal operational profiles include:</p>\n      <ul>\n        <li><strong>Cycle Times & Wait Times:</strong> Strongly right-skewed with a physical zero lower bound and long positive tails (Lognormal or Gamma distributions).</li>\n        <li><strong>Time-to-Failure & Reliability Data:</strong> Weibull distribution, modeling infant mortality or mechanical wear-out over time.</li>\n        <li><strong>Customer Defect Counts / Server Error Spikes:</strong> Discrete Poisson or Negative Binomial distributions.</li>\n      </ul>\n\n      <div class=\"callout callout-danger\">\n        <h4>The Danger of Naive Normal Capability on Skewed Data</h4>\n        <p>If an operations manager blindly calculates $C_{pk}$ on a right-skewed cycle time dataset using standard formulas ($mu pm 3sigma$), the normal assumption assumes symmetrical tails. This results in wildly inaccurate defect predictions—often underestimating customer SLA breaches by a factor of 10x!</p>\n      </div>\n\n      <h2>2. Testing for Normality: The Anderson-Darling Test</h2>\n      <p>Before applying parametric formulas, managers test for normality using the <strong>Anderson-Darling Normality Test</strong>:</p>\n      <ul>\n        <li><strong>Null Hypothesis ($H_0$):</strong> The operational data follows a normal distribution.</li>\n        <li><strong>Alternative Hypothesis ($H_1$):</strong> The operational data does not follow a normal distribution.</li>\n        <li><strong>Decision Rule:</strong> If the <strong>$p$-value &lt; 0.05</strong>, reject $H_0$. The data is statistically non-normal!</li>\n      </ul>\n\n      <h2>3. Mathematical Data Transformations: Box-Cox vs. Johnson</h2>\n      <p>When operational data is non-normal, managers have two primary strategic paths: transform the data into a normal distribution, or fit a specific non-normal distribution directly.</p>\n\n      <h3>A. The Box-Cox Power Transformation</h3>\n      <p>The Box-Cox transformation applies a mathematical power function using parameter $lambda$ (lambda):</p>\n      $$Y' = \begin{cases} \frac{Y^lambda - 1}{lambda} & \text{if } lambda \neq 0 \\ ln(Y) & \text{if } lambda = 0 end{cases}$$\n      <p>Minitab or Python statistically iterates through values of $lambda$ (typically between -5 and +5) to find the optimal power that maximizes normality.\n      <br><strong>Critical Constraint:</strong> The Box-Cox transformation can <em>only</em> be used on strictly positive continuous data ($Y > 0$). It fails if data contains zeros or negative numbers.</p>\n\n      <h3>B. The Johnson Transformation</h3>\n      <p>For complex distributions, bounded datasets, or data containing zeros and negative numbers, the <strong>Johnson Transformation System</strong> is superior. It selects from three flexible mathematical families:</p>\n      <ul>\n        <li><strong>$S_B$:</strong> Bounded system (ideal for variables with strict natural floors and ceilings, like percentages).</li>\n        <li><strong>$S_L$:</strong> Lognormal system.</li>\n        <li><strong>$S_U$:</strong> Unbounded system.</li>\n      </ul>\n      <p>Once transformed, the manager calculates $C_{pk}$ on the normalized $Y'$ values, and transforms the resulting specification limits back into original units for reporting.</p>\n\n      <h2>4. Non-Parametric Capability: The Percentile Method</h2>\n      <p>If transformations fail to achieve normality ($p < 0.05$ persists), managers use the <strong>Percentile Method</strong> (ISO 21747). Rather than relying on mean and standard deviation, capability is calculated directly from empirical percentiles of the fitted distribution:</p>\n      \n      $$C_{pk} = minleft(\frac{\text{USL} - P_{50}}{P_{99.865} - P_{50}}, \frac{P_{50} - \text{LSL}}{P_{50} - P_{0.135}}\right)$$\n      <p>Where $P_{50}$ is the process median, $P_{99.865}$ represents the equivalent of $+3sigma$, and $P_{0.135}$ represents $-3sigma$.</p>\n\n      <div class=\"video-container\">\n        <iframe src=\"https://www.youtube.com/embed/n4fC5r6oE6s\" title=\"Non-Normal Data and Box-Cox Transformation Masterclass\" allowfullscreen></iframe>\n      </div>\n    ",
    "summary": "Identify non-normal process distributions, test normality via Anderson-Darling, transform skewed data using Box-Cox and Johnson transformations, and compute non-parametric percentile capability.",
    "keyTakeaways": [
      "Real-world cycle times and failure rates are overwhelmingly skewed and non-normal.",
      "The Anderson-Darling test rejects normality when $p < 0.05$.",
      "Box-Cox power transformation requires strictly positive data ($Y > 0$).",
      "The Johnson Transformation handles zero, negative, and bounded distributions across $S_B, S_L, S_U$ families.",
      "Non-parametric capability utilizes empirical percentiles ($P_{0.135}, P_{50}, P_{99.865}$) when transformations are unsuitable."
    ]
  },
  {
    "id": "CH-SSM-012",
    "courseId": "CRS-SSM-001",
    "title": "Detailed Process Mapping: Value Stream Mapping (VSM) Current-State Architecture & Takt Time Analysis",
    "order": 12,
    "estimatedMinutes": 65,
    "content": "\n      <h2>1. Beyond High-Level SIPOC: Value Stream Mapping</h2>\n      <p>While the SIPOC defines high-level project boundaries, driving targeted operational waste reduction requires micro-level transparency into the heartbeat of production. A <strong>Value Stream</strong> encompasses all actions—both value-added and non-value-added—currently required to bring a specific product or service from raw material into the hands of the customer.</p>\n      \n      <p><strong>Value Stream Mapping (VSM)</strong>, codified by Mike Rother and John Shook in <em>Learning to See</em>, is a standardized visual diagramming methodology that tracks two simultaneous streams: the <strong>Physical Flow of Materials / Tasks</strong> and the <strong>Information Flow</strong> that schedules and dictates production.</p>\n\n      <h2>2. Anatomical Components of a Current-State VSM</h2>\n      <p>A rigorous Current-State VSM incorporates four distinct operational zones:</p>\n      <ol>\n        <li><strong>Customer & Supplier Icons (Top Right & Left):</strong> Quantifies customer monthly demand, container order batch sizes, delivery frequency, and shipment modes.</li>\n        <li><strong>Information Flow (Top Middle):</strong> Tracks how customer orders travel to Production Control (ERP/SAP) and how work is dispatched downstream (push schedules via manual weekly MRP spreadsheets vs. pull kanban signals).</li>\n        <li><strong>Material / Process Flow (Middle):</strong> Sequential process process boxes representing workstations, annotated with inventory triangles representing stagnant WIP piles between stations.</li>\n        <li><strong>The Timeline Ladder (Bottom):</strong> The definitive diagnostic ledger of Lean operations. The lower rungs record <strong>Value-Added Cycle Time (C/T)</strong>; the upper peaks record <strong>Non-Value-Added Waiting / Inventory Lead Time</strong>.</li>\n      </ol>\n\n      <table class=\"table table-bordered\">\n        <thead>\n          <tr>\n            <th>Process Box Metric</th>\n            <th>Symbol</th>\n            <th>Operational Definition</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td><strong>Cycle Time</strong></td>\n            <td><strong>C/T</strong></td>\n            <td>The time elapsed between completed units emerging from a single workstation.</td>\n          </tr>\n          <tr>\n            <td><strong>Changeover Time</strong></td>\n            <td><strong>C/O</strong></td>\n            <td>The elapsed downtime required to switch a workstation from running Product A to Product B.</td>\n          </tr>\n          <tr>\n            <td><strong>Uptime / Reliability</strong></td>\n            <td><strong>%</strong></td>\n            <td>Percentage of planned operating time that the machine/workstation is actually operational.</td>\n          </tr>\n          <tr>\n            <td><strong>First Pass Yield</strong></td>\n            <td><strong>FTT / FPY</strong></td>\n            <td>Percentage of parts that pass through the workstation without defects or rework.</td>\n          </tr>\n          <tr>\n            <td><strong>Number of Operators</strong></td>\n            <td><strong>Operators</strong></td>\n            <td>Headcount assigned to that specific cell or station.</td>\n          </tr>\n        </tbody>\n      </table>\n\n      <h2>3. Takt Time: The Heartbeat of Lean Production</h2>\n      <p>Derived from the German word <em>Taktzeit</em> (musical meter / tempo), <strong>Takt Time</strong> is the pace of customer demand. It is not how fast your machines <em>can</em> run; it is the rate at which you <em>must</em> produce units to precisely satisfy customer demand with zero overproduction and zero shortages.</p>\n\n      $$\text{Takt Time} = \frac{\text{Net Available Working Time per Day}}{\text{Customer Demand per Day}}$$\n\n      <div class=\"callout callout-info\">\n        <h4>Takt Time Calculation Example</h4>\n        <p>A precision machining cell operates on one 8-hour shift (480 minutes).\n          <ul>\n            <li>Planned lunch break: 30 minutes.</li>\n            <li>Two 15-minute paid breaks: 30 minutes.</li>\n            <li>Planned team safety huddle: 10 minutes.</li>\n            <li><strong>Net Available Working Time:</strong> $480 - 30 - 30 - 10 = 410 \text{ minutes} = 24,600 \text{ seconds}$.</li>\n            <li>Customer daily demand: <strong>600 units</strong>.</li>\n          </ul>\n          $$\text{Takt Time} = \frac{24,600 \text{ seconds}}{600 \text{ units}} = 41.0 \text{ seconds per unit}$$\n          Every 41 seconds, a finished, defect-free unit must roll off the final line. If a station's Cycle Time &gt; 41s, it is a bottleneck causing line starvation. If Cycle Time &lt; 41s, the station will overproduce unless line balanced!\n        </p>\n      </div>\n\n      <h2>4. Calculating Process Lead Time & Process Velocity</h2>\n      <p>Using Little's Law, the inventory piled between workstations is converted into units of time:\n        $$\text{Days of Supply / Inventory Lead Time} = \frac{\text{WIP Inventory Count}}{\text{Daily Customer Demand}}$$\n      </p>\n\n      <p><strong>Total Lead Time (PLT)</strong> is the sum of all inventory wait times plus processing times along the value stream. <strong>Process Velocity (Cycle Efficiency)</strong> measures true operational efficiency:\n        $$\text{Process Cycle Efficiency (PCE)} = \frac{\text{Total Value-Added Time (VA)}}{\text{Total Process Lead Time (PLT)}} \times 100$$\n      In un-optimized manufacturing or service organizations, PCE is typically between <strong>0.5% and 5%</strong>—revealing that 95%+ of lead time is pure stagnant waiting waste!\n      </p>\n\n      <div class=\"video-container\">\n        <iframe src=\"https://www.youtube.com/embed/i_C6GqM9u0A\" title=\"Value Stream Mapping (VSM) and Takt Time Masterclass\" allowfullscreen></iframe>\n      </div>\n    ",
    "summary": "Construct Current-State Value Stream Maps, analyze physical and information flows, calculate Takt Time to synchronize production with customer demand, and compute Process Cycle Efficiency (PCE).",
    "keyTakeaways": [
      "VSM visually links material flow with information scheduling across the end-to-end value chain.",
      "The timeline ladder isolates Value-Added Cycle Time (C/T) from Non-Value-Added inventory wait time.",
      "Takt Time defines the customer demand pace: Net Available Working Time divided by Customer Demand.",
      "WIP inventory between stations translates directly into lead time delay via Little's Law.",
      "Process Cycle Efficiency (PCE) reveals that typical enterprise processes spend &gt;95% of time waiting in non-value-added queues."
    ]
  }
],
  assessments: [
  {
    "id": "ASM-SSM-007",
    "courseId": "CRS-SSM-001",
    "chapterId": "CH-SSM-007",
    "title": "Assessment: Applied Statistics for Process Managers",
    "passingScore": 70,
    "questions": [
      {
        "id": "Q-SSM-061",
        "question": "What percentage of data in a standard Normal distribution falls within plus or minus 2 standard deviations (+/- 2 sigma) of the mean?",
        "options": [
          "68.27%",
          "95.45%",
          "99.73%",
          "99.99966%"
        ],
        "correctAnswer": 1,
        "explanation": "The Empirical Rule establishes that approximately 95.45% of normally distributed data lies within +/- 2 standard deviations of the mean."
      },
      {
        "id": "Q-SSM-062",
        "question": "According to the Central Limit Theorem (CLT), what happens to the distribution of sample means as sample size (n) increases (n >= 30)?",
        "options": [
          "The distribution becomes perfectly uniform",
          "The distribution of sample means approaches a Normal distribution regardless of the underlying population shape",
          "The standard deviation expands to infinity",
          "The sample mean becomes zero"
        ],
        "correctAnswer": 1,
        "explanation": "The Central Limit Theorem proves that sample means approach a normal distribution as sample size increases (n >= 30), regardless of whether individual data is skewed."
      },
      {
        "id": "Q-SSM-063",
        "question": "Why is the Median preferred over the Mean when analyzing highly skewed operational cycle times?",
        "options": [
          "The median is easier to spell",
          "The median is robust against extreme outliers, whereas the mean is pulled heavily by severe delays",
          "The median requires no mathematical calculation",
          "Six Sigma forbids the use of the mean"
        ],
        "correctAnswer": 1,
        "explanation": "A few massive cycle time delays (e.g. 50 days vs normal 2 days) pull the mean upward, giving a distorted view. The median represents the true middle experience."
      },
      {
        "id": "Q-SSM-064",
        "question": "What does a Z-Score represent in applied statistics?",
        "options": [
          "The price of raw materials",
          "The number of standard deviations a specific observation lies above or below the population mean",
          "The total count of defects in a factory",
          "The slope of a linear regression line"
        ],
        "correctAnswer": 1,
        "explanation": "A Z-score ($Z = (X - mu)/sigma$) standardizes data into units representing how many standard deviations an observation deviates from the mean."
      },
      {
        "id": "Q-SSM-065",
        "question": "What is the relationship between the sample variance (s^2) and sample standard deviation (s)?",
        "options": [
          "Standard deviation is the square root of the variance",
          "Variance is the square root of standard deviation",
          "Standard deviation is variance multiplied by 2",
          "They are unrelated formulas"
        ],
        "correctAnswer": 0,
        "explanation": "Standard deviation ($s$) is the square root of variance ($s^2$), restoring the dispersion metric into the same physical units as the original observations."
      },
      {
        "id": "Q-SSM-066",
        "question": "What happens to the Standard Error of the Mean as the sample size (n) increases?",
        "options": [
          "It increases linearly",
          "It decreases inversely with the square root of n (sigma / sqrt(n)), yielding more precise estimates of the true population mean",
          "It stays completely constant",
          "It drops to negative numbers"
        ],
        "correctAnswer": 1,
        "explanation": "The Standard Error ($sigma/sqrt{n}$) decreases as sample size grows, shrinking the uncertainty of sample mean estimates."
      },
      {
        "id": "Q-SSM-067",
        "question": "In Deming's terminology, what is 'Common Cause' variation?",
        "options": [
          "A catastrophic event caused by an operator dropping a wrench",
          "The inherent, predictable, day-to-day background noise natural to a system operating as designed",
          "A variation caused by a software virus",
          "Variation caused by seasonal weather"
        ],
        "correctAnswer": 1,
        "explanation": "Common cause variation is inherent to the process design. It is stable and predictable over time and can only be reduced by redesigning the system."
      },
      {
        "id": "Q-SSM-068",
        "question": "Why does sample variance divide by (n - 1) rather than (n)?",
        "options": [
          "To account for the fact that one sample is always defective",
          "Bessel's correction: to provide an unbiased estimate of the population variance by accounting for the lost degree of freedom from estimating the sample mean",
          "Because calculators cannot divide by n",
          "To make the calculation result smaller"
        ],
        "correctAnswer": 1,
        "explanation": "Dividing by $n - 1$ (Bessel's correction) corrects for the downward bias when estimating population variance from a sample."
      },
      {
        "id": "Q-SSM-069",
        "question": "What is a 'Bimodal' distribution in operational data?",
        "options": [
          "A distribution with zero variation",
          "A distribution displaying two distinct peaks, typically indicating that two different populations (e.g. two machines, two shifts, or two suppliers) were mixed together",
          "A distribution that only occurs in leap years",
          "A distribution with only positive numbers"
        ],
        "correctAnswer": 1,
        "explanation": "A bimodal distribution shows two separate peaks, signaling that two distinct underlying processes or conditions are merged in the dataset."
      },
      {
        "id": "Q-SSM-070",
        "question": "What percentage of data falls within +/- 3 standard deviations in a Normal distribution?",
        "options": [
          "50.0%",
          "99.73%",
          "95.45%",
          "68.27%"
        ],
        "correctAnswer": 1,
        "explanation": "Under the Empirical Rule, 99.73% of normal data falls within $pm 3sigma$, leaving 0.27% in the outer tails."
      }
    ]
  },
  {
    "id": "ASM-SSM-008",
    "courseId": "CRS-SSM-001",
    "chapterId": "CH-SSM-008",
    "title": "Assessment: Data Collection Architecture & Sampling",
    "passingScore": 70,
    "questions": [
      {
        "id": "Q-SSM-071",
        "question": "Why is Continuous (variable) data preferred over Discrete (attribute) data in Six Sigma projects?",
        "options": [
          "Continuous data is easier to count on fingers",
          "Continuous data provides far higher information density, enabling powerful parametric tests and requiring significantly smaller sample sizes to detect process shifts",
          "Discrete data cannot be saved on computers",
          "Continuous data is always free from errors"
        ],
        "correctAnswer": 1,
        "explanation": "Continuous data tells you 'how much' or 'to what degree', requiring $n approx 30$ samples versus hundreds or thousands for binary discrete attribute data."
      },
      {
        "id": "Q-SSM-072",
        "question": "What is 'Stratified Sampling'?",
        "options": [
          "Sampling items only when a machine breaks down",
          "Dividing the population into distinct homogeneous sub-groups (strata, e.g. shifts, facilities, product types) and sampling proportionally from each to ensure balanced representation",
          "Asking volunteers to self-report data",
          "Selecting every 10th item on a conveyor"
        ],
        "correctAnswer": 1,
        "explanation": "Stratified sampling partitions populations into meaningful subgroups to prevent dominant groups from obscuring important sub-group variation."
      },
      {
        "id": "Q-SSM-073",
        "question": "What is the primary risk of Systematic Sampling (e.g. inspecting every 20th part)?",
        "options": [
          "It takes too long to execute",
          "If the sampling frequency synchronizes with a hidden periodic machine cycle or tooling rhythm, the sample can be severely biased",
          "Systematic sampling cannot be used on metal parts",
          "It violates ISO standards"
        ],
        "correctAnswer": 1,
        "explanation": "If a machine experiences a cyclical cooling or tooling adjustment every 20 parts, systematic sampling could sample only peak or valley parts, blinding inspectors to variation."
      },
      {
        "id": "Q-SSM-074",
        "question": "What is the concept of 'Rational Subgrouping' in sampling architecture?",
        "options": [
          "Gathering data from logical thinkers only",
          "Selecting samples within a narrow window where variation is minimized within the subgroup, maximizing the opportunity to detect variation between subgroups over time",
          "Sampling 1 unit per year",
          "Combining data from 10 different factories into one number"
        ],
        "correctAnswer": 1,
        "explanation": "Rational subgrouping groups units produced under virtually identical conditions together so within-subgroup variation represents pure random noise, making between-subgroup shifts stand out clearly."
      },
      {
        "id": "Q-SSM-075",
        "question": "In the sample size formula for continuous data n = ((Z * sigma) / E)^2, what does 'E' represent?",
        "options": [
          "Electricity usage",
          "The allowable Margin of Error (the precision tolerance the manager is willing to accept around the true mean)",
          "The number of employees",
          "The total defect count"
        ],
        "correctAnswer": 1,
        "explanation": "E represents the acceptable margin of error (e.g., estimating mean turnaround within $pm 0.5$ hours)."
      },
      {
        "id": "Q-SSM-076",
        "question": "What value of Z is used in sample size calculations for a 95% confidence level?",
        "options": [
          "1.00",
          "1.96",
          "3.00",
          "6.00"
        ],
        "correctAnswer": 1,
        "explanation": "For a two-tailed 95% confidence interval, $Z_{alpha/2} = Z_{0.025} approx 1.96$."
      },
      {
        "id": "Q-SSM-077",
        "question": "What is an 'Operational Definition' in a Data Collection Plan?",
        "options": [
          "A dictionary entry for a word",
          "A clear, unambiguous, standardized description of what is being measured and the precise criteria for how data is collected, leaving zero room for subjective interpretation",
          "The job description of an operator",
          "A list of software passwords"
        ],
        "correctAnswer": 1,
        "explanation": "Operational definitions eliminate ambiguity (e.g. defining exactly when a support ticket clock starts and stops) so all collectors gather data identically."
      },
      {
        "id": "Q-SSM-078",
        "question": "When calculating sample size for a discrete proportion (n = (Z^2 * p * (1-p)) / E^2), what value should be assumed for p if historical defect proportion is unknown?",
        "options": [
          "p = 0.00",
          "p = 0.50 (yielding the maximum conservative sample size)",
          "p = 1.00",
          "p = 0.05"
        ],
        "correctAnswer": 1,
        "explanation": "Assuming $p = 0.5$ maximizes the variance product $p(1 - p) = 0.25$, guaranteeing the resulting sample size will be conservative and adequate."
      },
      {
        "id": "Q-SSM-079",
        "question": "Which of the following is an example of Discrete Attribute Data?",
        "options": [
          "Pressure reading of 42.6 PSI",
          "Number of customer returns categorized as 'Damaged' vs 'Wrong Size'",
          "Tensile strength of 550 MPa",
          "Transaction processing latency of 124.5 ms"
        ],
        "correctAnswer": 1,
        "explanation": "Categorical counts (Damaged vs. Wrong Size) are discrete attributes, counted in whole integers."
      },
      {
        "id": "Q-SSM-080",
        "question": "What is 'Inspection Fatigue' in 100% manual inspection?",
        "options": [
          "Inspectors falling asleep at their desks",
          "The proven psychological degradation where human inspectors inspecting 100% of parts miss 10% to 20% of defects due to monotony and cognitive exhaustion",
          "A physical breakdown of optical microscopes",
          "A failure of the conveyor belt"
        ],
        "correctAnswer": 1,
        "explanation": "100% manual inspection is notoriously unreliable (often only 80-90% effective) because repetitive tasks lead to human fatigue and missed defects."
      }
    ]
  },
  {
    "id": "ASM-SSM-009",
    "courseId": "CRS-SSM-001",
    "chapterId": "CH-SSM-009",
    "title": "Assessment: Measurement System Analysis (MSA) & Gage R&R",
    "passingScore": 70,
    "questions": [
      {
        "id": "Q-SSM-081",
        "question": "What is the primary difference between Repeatability and Reproducibility in a Gage R&R study?",
        "options": [
          "Repeatability assesses software; Reproducibility assesses hardware",
          "Repeatability is the variation observed when one operator measures the same part repeatedly with the same gauge; Reproducibility is the variation between different operators",
          "Repeatability is measured in days; Reproducibility is measured in weeks",
          "There is no mathematical difference"
        ],
        "correctAnswer": 1,
        "explanation": "Repeatability isolates equipment variation (one operator, same part, repeated trials). Reproducibility isolates appraiser variation (difference between operators)."
      },
      {
        "id": "Q-SSM-082",
        "question": "Under standard AIAG guidelines, what threshold determines that a measurement system is fully acceptable?",
        "options": [
          "%Gage R&R < 10%",
          "%Gage R&R between 30% and 50%",
          "%Gage R&R > 75%",
          "%Gage R&R = 100%"
        ],
        "correctAnswer": 0,
        "explanation": "Under AIAG standards, a %Gage R&R below 10% indicates an acceptable, precise measurement system. 10%-30% is marginal; >30% is unacceptable."
      },
      {
        "id": "Q-SSM-083",
        "question": "What does the 'Number of Distinct Categories' (ndc) metric evaluate in an MSA study?",
        "options": [
          "The number of product models in the catalog",
          "The number of non-overlapping confidence intervals the measurement system can distinguish across process variation (must be >= 5)",
          "The count of inspectors in the department",
          "The number of tools in a toolbox"
        ],
        "correctAnswer": 1,
        "explanation": "$ndc$ represents measurement resolution relative to process spread. An acceptable system must have $ndc ge 5$; values below 2 cannot distinguish process shifts."
      },
      {
        "id": "Q-SSM-084",
        "question": "In Measurement System Analysis, what is 'Bias'?",
        "options": [
          "A manager's personal preference for certain employees",
          "The mathematical difference between the observed average of measurements and a certified reference master standard",
          "The speed at which the gauge operates",
          "The physical weight of the measurement tool"
        ],
        "correctAnswer": 1,
        "explanation": "Bias measures location accuracy: the difference between the gauge's observed mean reading and the true certified master reference value."
      },
      {
        "id": "Q-SSM-085",
        "question": "What statistical metric is used in Attribute Agreement Analysis to quantify inter-rater reliability among inspectors?",
        "options": [
          "Student's t-statistic",
          "Cohen's Kappa / Fleiss' Kappa (kappa)",
          "Pearson's correlation coefficient",
          "F-statistic"
        ],
        "correctAnswer": 1,
        "explanation": "Kappa ($kappa$) measures agreement between attribute raters beyond chance alone ($kappa ge 0.75$ indicates acceptable agreement)."
      },
      {
        "id": "Q-SSM-086",
        "question": "What is 'Linearity' error in a measurement system?",
        "options": [
          "Drawing lines with a ruler",
          "The variation in bias across the entire operating range of the measurement device (e.g. gauge is accurate at low weights but inaccurate at high weights)",
          "A defect in the electrical wiring",
          "Measuring in straight lines only"
        ],
        "correctAnswer": 1,
        "explanation": "Linearity represents how bias changes across the operating range of the gauge."
      },
      {
        "id": "Q-SSM-087",
        "question": "Why must parts be measured in randomized order during a Gage R&R study?",
        "options": [
          "To confuse the operators",
          "To prevent operator memory bias and eliminate systematic sequence or thermal drift effects",
          "Because computers cannot sort numbers",
          "To make the study take longer"
        ],
        "correctAnswer": 1,
        "explanation": "Randomization prevents operators from remembering what Part 3 measured previously, ensuring unbiased, independent measurement trials."
      },
      {
        "id": "Q-SSM-088",
        "question": "What is 'Stability' in a measurement system?",
        "options": [
          "Whether the table the gauge rests on is sturdy",
          "The ability of the measurement system to yield consistent measurements of the same master standard over extended time periods (evaluating gauge drift)",
          "The weight of the gauge battery",
          "How fast the gauge turns on"
        ],
        "correctAnswer": 1,
        "explanation": "Stability measures long-term drift: whether an instrument maintains consistent readings on reference standards over weeks and months."
      },
      {
        "id": "Q-SSM-089",
        "question": "If a Gage R&R study yields a %GRR of 42%, what action should the operations manager take?",
        "options": [
          "Proceed directly to the Analyze phase and run hypothesis tests",
          "Stop and overhaul the measurement system: the gauge is incapable and accounts for too much observed variation to draw valid conclusions",
          "Falsify the data to show 8%",
          "Ignore the result because Six Sigma only cares about product defects"
        ],
        "correctAnswer": 1,
        "explanation": "At 42% GRR, the measurement system is unacceptable. Analyzing process capability with this gauge will analyze measurement noise rather than true process signals."
      },
      {
        "id": "Q-SSM-090",
        "question": "In an Attribute Agreement Analysis, what does 'Within-Appraiser Agreement' test?",
        "options": [
          "Whether the appraiser likes their job",
          "Whether the same individual appraiser evaluates identical parts consistently across repeated blind trials (Repeatability)",
          "Whether all appraisers have identical handwriting",
          "Whether the appraiser agrees with management decisions"
        ],
        "correctAnswer": 1,
        "explanation": "Within-appraiser agreement assesses repeatability: does inspector A evaluate the same set of parts consistently when tested twice?"
      }
    ]
  },
  {
    "id": "ASM-SSM-010",
    "courseId": "CRS-SSM-001",
    "chapterId": "CH-SSM-010",
    "title": "Assessment: Process Capability Analysis (Cp, Cpk, Pp, Ppk)",
    "passingScore": 70,
    "questions": [
      {
        "id": "Q-SSM-091",
        "question": "What is an essential prerequisite before conducting a valid Process Capability Analysis (Cp / Cpk)?",
        "options": [
          "The factory must be newer than 5 years old",
          "The process must be demonstrated to be in a state of statistical control (stable, with zero special causes) on control charts",
          "All operators must have college degrees",
          "The product must be sold at a profit"
        ],
        "correctAnswer": 1,
        "explanation": "Calculating capability on an unstable, out-of-control process produces meaningless numbers because the mean and variance are constantly shifting."
      },
      {
        "id": "Q-SSM-092",
        "question": "What critical limitation exists in the potential capability index Cp = (USL - LSL) / 6sigma?",
        "options": [
          "It can only be calculated on weekends",
          "It measures only the spread of the process relative to tolerance and completely ignores whether the process mean is centered between specification limits",
          "It produces negative numbers",
          "It requires 1,000 samples"
        ],
        "correctAnswer": 1,
        "explanation": "$C_p$ measures process potential width. If the process shifts far to the right, $C_p$ can be high even while 100% of parts fail customer specifications."
      },
      {
        "id": "Q-SSM-093",
        "question": "What is the standard minimum acceptable Cpk value for existing manufacturing processes in modern industry?",
        "options": [
          "Cpk = 0.50",
          "Cpk = 1.33 (4-Sigma quality)",
          "Cpk = 0.00",
          "Cpk = 10.0"
        ],
        "correctAnswer": 1,
        "explanation": "$C_{pk} ge 1.33$ is the standard minimum benchmark in manufacturing, leaving a $4sigma$ margin between the process edge and customer specifications."
      },
      {
        "id": "Q-SSM-094",
        "question": "How does Cpk differ from Ppk in capability accounting?",
        "options": [
          "Cpk uses short-term within-subgroup variation (sigma_within), whereas Ppk uses long-term overall sample variation (s_overall)",
          "Cpk is for software; Ppk is for hardware",
          "Ppk is always higher than Cpk",
          "Cpk is calculated without customer specifications"
        ],
        "correctAnswer": 0,
        "explanation": "$C_{pk}$ measures short-term capability using within-subgroup variation ($\bar{R}/d_2$), while $P_{pk}$ measures long-term performance using total sample standard deviation."
      },
      {
        "id": "Q-SSM-095",
        "question": "If a process has Cp = 1.80 and Cpk = 0.65, what does this indicate to the operations manager?",
        "options": [
          "The process has too much variation",
          "The process variation is tight enough to achieve high capability, but the process mean has shifted significantly off-center toward a specification limit",
          "The measurement system is broken",
          "The customer specification limits are too wide"
        ],
        "correctAnswer": 1,
        "explanation": "High $C_p$ (1.80) means the process spread is narrow, but low $C_{pk}$ (0.65) proves the process is off-center, causing defects. Re-centering the process will fix it!"
      },
      {
        "id": "Q-SSM-096",
        "question": "What Cpk value corresponds to true Six Sigma quality (3.4 DPMO with a 1.5-sigma shift)?",
        "options": [
          "Cpk = 1.00",
          "Cpk = 1.50 (with Cp = 2.00)",
          "Cpk = 0.67",
          "Cpk = 3.40"
        ],
        "correctAnswer": 1,
        "explanation": "In Six Sigma, a $C_p = 2.0$ process experiencing a standard $1.5sigma$ mean drift yields a minimum $C_{pk} = 1.50$, resulting in $le 3.4$ DPMO."
      },
      {
        "id": "Q-SSM-097",
        "question": "What is the formula for calculating Defects Per Million Opportunities (DPMO)?",
        "options": [
          "DPMO = Defects * 1,000,000",
          "DPMO = (Total Defects / (Total Units * Opportunities per Unit)) * 1,000,000",
          "DPMO = Cpk * 1,000,000",
          "DPMO = Units / Defects"
        ],
        "correctAnswer": 1,
        "explanation": "DPMO normalizes defect counts across opportunities: $\text{DPO} = \text{Defects} / (\text{Units} \times \text{Opportunities})$, then multiplied by $10^6$."
      },
      {
        "id": "Q-SSM-098",
        "question": "What does it mean if a calculated Cpk is negative (Cpk < 0)?",
        "options": [
          "The process is exceptionally good",
          "The process mean has shifted entirely outside the customer specification limits, meaning more than 50% of production is defective scrap",
          "The calculation was done in reverse",
          "The standard deviation is zero"
        ],
        "correctAnswer": 1,
        "explanation": "A negative $C_{pk}$ indicates that the process average itself lies outside the customer specification limits, generating massive continuous scrap."
      },
      {
        "id": "Q-SSM-099",
        "question": "What is the difference between DPU (Defects Per Unit) and Defect Rate?",
        "options": [
          "DPU cannot exceed 1.0",
          "DPU measures the total count of defects divided by units, allowing values > 1.0 if a single unit contains multiple defects (e.g. 3 scratches on one car)",
          "Defect Rate is only used in healthcare",
          "There is no difference"
        ],
        "correctAnswer": 1,
        "explanation": "A unit can have multiple defects. DPU accounts for all defects on a unit, so 5 defects on 1 unit yields $\text{DPU} = 5.0$."
      },
      {
        "id": "Q-SSM-100",
        "question": "When evaluating a supplier's new part qualification before mass production, which metric do automotive customers mandate (typically requiring >= 1.67)?",
        "options": [
          "Pp / Ppk",
          "Cp / Cpk (Initial Process Capability)",
          "Median cycle time",
          "Net Profit Margin"
        ],
        "correctAnswer": 1,
        "explanation": "Automotive PPAP (Production Part Approval Process) typically requires an initial short-term capability $C_{pk} ge 1.67$ before mass production approval."
      }
    ]
  },
  {
    "id": "ASM-SSM-011",
    "courseId": "CRS-SSM-001",
    "chapterId": "CH-SSM-011",
    "title": "Assessment: Non-Normal Distributions & Data Transformations",
    "passingScore": 70,
    "questions": [
      {
        "id": "Q-SSM-101",
        "question": "In the Anderson-Darling Normality Test, what p-value indicates that data is statistically non-normal?",
        "options": [
          "p > 0.05",
          "p < 0.05 (reject the null hypothesis of normality)",
          "p = 1.00",
          "p > 0.95"
        ],
        "correctAnswer": 1,
        "explanation": "The null hypothesis ($H_0$) is that data is normally distributed. A $p$-value &lt; 0.05 provides statistically significant evidence to reject $H_0$, confirming non-normality."
      },
      {
        "id": "Q-SSM-102",
        "question": "What is a primary mathematical restriction when using the Box-Cox Power Transformation?",
        "options": [
          "It only works on negative numbers",
          "All data values must be strictly positive (Y > 0); it cannot process zero or negative numbers",
          "It requires exactly 100 samples",
          "It only works on integers"
        ],
        "correctAnswer": 1,
        "explanation": "The Box-Cox transformation involves logarithmic and power transformations that are mathematically undefined for zero or negative values."
      },
      {
        "id": "Q-SSM-103",
        "question": "Which distribution family in the Johnson Transformation system is designed for bounded data with natural minimum and maximum limits (e.g. percentages 0-100%)?",
        "options": [
          "S_B (Bounded system)",
          "S_U (Unbounded system)",
          "S_L (Lognormal system)",
          "Normal system"
        ],
        "correctAnswer": 0,
        "explanation": "The $S_B$ family in the Johnson system specifically handles data bounded by natural floors and ceilings."
      },
      {
        "id": "Q-SSM-104",
        "question": "Why do customer service wait times and transactional cycle times typically follow a right-skewed distribution?",
        "options": [
          "Customers dislike waiting",
          "There is a physical zero lower bound (time cannot be negative), most transactions complete quickly, but occasional complex bottlenecks create long positive tails",
          "Because computers run in binary",
          "Because of daylight saving time"
        ],
        "correctAnswer": 1,
        "explanation": "Cycle times cannot drop below zero, creating a hard boundary on the left, while complex edge cases and disruptions create long trailing tails to the right."
      },
      {
        "id": "Q-SSM-105",
        "question": "What distribution is commonly used in reliability engineering to model equipment failure rates over time (including wear-out and infant mortality)?",
        "options": [
          "Normal distribution",
          "Weibull distribution",
          "Uniform distribution",
          "Binomial distribution"
        ],
        "correctAnswer": 1,
        "explanation": "The Weibull distribution is the cornerstone of reliability engineering because its shape parameter ($\beta$) can model decreasing, constant, or increasing failure rates."
      },
      {
        "id": "Q-SSM-106",
        "question": "In the Box-Cox transformation, what mathematical transformation is applied when lambda (lambda) equals 0?",
        "options": [
          "Square root of Y",
          "Natural logarithm: ln(Y)",
          "Y squared",
          "1 / Y"
        ],
        "correctAnswer": 1,
        "explanation": "When $lambda = 0$, the mathematical limit of $(Y^lambda - 1)/lambda$ is the natural logarithm $ln(Y)$."
      },
      {
        "id": "Q-SSM-107",
        "question": "What method does the ISO 21747 standard use to calculate process capability on non-normal data without transformations?",
        "options": [
          "The Guessing Method",
          "The Percentile Method (using P0.135, P50, and P99.865 percentiles)",
          "Multiplying by 10",
          "Deleting the outliers"
        ],
        "correctAnswer": 1,
        "explanation": "The Percentile Method determines equivalent $3sigma$ cutoffs using empirical percentiles ($P_{0.135}, P_{50}, P_{99.865}$) directly from the fitted non-normal curve."
      },
      {
        "id": "Q-SSM-108",
        "question": "What is the danger of removing legitimate extreme cycle time outliers from a dataset to force it to pass a normality test?",
        "options": [
          "The computer memory fills up",
          "It blinds management to the real-world operational bottlenecks that cause customer churn, creating a false illusion of capability",
          "It makes the mean lower than the median",
          "Regulators mandate removing all outliers"
        ],
        "correctAnswer": 1,
        "explanation": "Deleting legitimate outliers is unethical and hides actual operational failures. Outliers represent real customer pain points that must be investigated in Analyze."
      },
      {
        "id": "Q-SSM-109",
        "question": "What discrete distribution models the number of defects occurring randomly in a continuous unit of area, time, or volume (e.g. flaws per square meter of glass)?",
        "options": [
          "Poisson distribution",
          "Normal distribution",
          "Uniform distribution",
          "Beta distribution"
        ],
        "correctAnswer": 0,
        "explanation": "The Poisson distribution models discrete counts of independent events occurring across a fixed interval of time, space, or volume."
      },
      {
        "id": "Q-SSM-110",
        "question": "If a dataset has an Anderson-Darling p-value of 0.42, what conclusion should the manager draw?",
        "options": [
          "The data is definitively non-normal and must be transformed",
          "Fail to reject the null hypothesis; the data can be treated as normally distributed for parametric analysis",
          "The sample size is too large",
          "The data collection was corrupted"
        ],
        "correctAnswer": 1,
        "explanation": "Since $p = 0.42 > 0.05$, there is no evidence to reject normality. Standard parametric formulas ($t$-test, ANOVA, standard $C_{pk}$) may be used safely."
      }
    ]
  },
  {
    "id": "ASM-SSM-012",
    "courseId": "CRS-SSM-001",
    "chapterId": "CH-SSM-012",
    "title": "Assessment: Detailed Process Mapping & Value Stream Mapping (VSM)",
    "passingScore": 70,
    "questions": [
      {
        "id": "Q-SSM-111",
        "question": "What is Takt Time in Lean Operations?",
        "options": [
          "The fastest speed a machine can run without breaking",
          "The pace of customer demand: Net Available Working Time divided by Customer Demand",
          "The time employees spend taking breaks",
          "The shipping transit time from warehouse to customer"
        ],
        "correctAnswer": 1,
        "explanation": "Takt Time is the rate at which a product must be completed to satisfy customer demand, calculated as available working time divided by required customer quantity."
      },
      {
        "id": "Q-SSM-112",
        "question": "In a Value Stream Map, what is the 'Timeline Ladder' at the bottom used to compare?",
        "options": [
          "Company stock price vs competitor stock price",
          "Value-Added processing Cycle Time (lower rung) versus Non-Value-Added inventory waiting Lead Time (upper rung)",
          "Manager salaries vs operator salaries",
          "Morning shift vs night shift attendance"
        ],
        "correctAnswer": 1,
        "explanation": "The timeline ladder displays value-added processing time (rungs) against non-value-added waiting time (peaks), highlighting lead time waste."
      },
      {
        "id": "Q-SSM-113",
        "question": "A manufacturing cell has 27,000 seconds of net available working time per shift. Customer demand is 900 units per shift. What is the Takt Time?",
        "options": [
          "30.0 seconds per unit",
          "10.0 seconds per unit",
          "300 seconds per unit",
          "90 seconds per unit"
        ],
        "correctAnswer": 0,
        "explanation": "$\text{Takt Time} = 27,000 / 900 = 30.0 \text{ seconds per unit}$. A completed unit must be produced every 30 seconds."
      },
      {
        "id": "Q-SSM-114",
        "question": "What is Process Cycle Efficiency (PCE)?",
        "options": [
          "The speed of electricity in the factory",
          "The ratio of Total Value-Added Time to Total Process Lead Time (VA / PLT * 100)",
          "The percentage of parts that pass inspection",
          "The cost of machine maintenance"
        ],
        "correctAnswer": 1,
        "explanation": "Process Cycle Efficiency measures the proportion of total lead time that actually adds customer value ($\text{VA} / \text{PLT} \times 100$)."
      },
      {
        "id": "Q-SSM-115",
        "question": "In typical un-optimized service, office, or manufacturing workflows, what is the typical Process Cycle Efficiency (PCE)?",
        "options": [
          "Between 80% and 95%",
          "Usually less than 5% (over 95% of lead time is waiting waste!)",
          "Exactly 50%",
          "100%"
        ],
        "correctAnswer": 1,
        "explanation": "In traditional batch-and-queue operations, parts spend over 95% of their total lead time waiting in queues, yielding a PCE below 5%."
      },
      {
        "id": "Q-SSM-116",
        "question": "How is Work-In-Progress (WIP) inventory converted into units of time on a VSM?",
        "options": [
          "By multiplying WIP by 3.4",
          "Using Little's Law: dividing total WIP inventory count by daily customer demand rate",
          "By weighing the inventory pallets",
          "By asking the warehouse supervisor"
        ],
        "correctAnswer": 1,
        "explanation": "Inventory days of supply is calculated by dividing inventory count by daily demand (e.g. 1,000 units in queue / 200 units/day = 5 days of waiting lead time)."
      },
      {
        "id": "Q-SSM-117",
        "question": "What does the inventory triangle icon represent on a Value Stream Map?",
        "options": [
          "A hazardous chemical warning",
          "Stagnant Work-in-Progress (WIP) or raw material buffer waiting between processing steps",
          "A completed customer shipment",
          "A meeting room"
        ],
        "correctAnswer": 1,
        "explanation": "The standard VSM triangle represents stagnant inventory buffers where items sit idle between operations."
      },
      {
        "id": "Q-SSM-118",
        "question": "What is 'Changeover Time' (C/O) in a VSM process data box?",
        "options": [
          "The time it takes workers to change uniforms",
          "The elapsed time from the last good unit of Product A to the first good unit of Product B produced at full production speed",
          "The time required to hire a new manager",
          "The time between morning and afternoon shifts"
        ],
        "correctAnswer": 1,
        "explanation": "Changeover time is the downtime required to retool, reconfigure, and calibrate equipment to transition from one product variant to another."
      },
      {
        "id": "Q-SSM-119",
        "question": "What is the primary difference between a high-level SIPOC and a Value Stream Map (VSM)?",
        "options": [
          "SIPOC is used only in finance; VSM is used in engineering",
          "SIPOC provides a macro scoping boundary of suppliers and outputs; VSM maps micro-level material flows, information flows, and cycle times against Takt time",
          "VSM requires no data collection",
          "SIPOC is drawn on paper; VSM can only be drawn on whiteboards"
        ],
        "correctAnswer": 1,
        "explanation": "SIPOC defines high-level scoping in Define. VSM provides deep quantitative operational diagnostics (cycle times, WIP, flow, information triggers) in Measure."
      },
      {
        "id": "Q-SSM-120",
        "question": "If a workstation has a Cycle Time of 55 seconds while the customer Takt Time is 40 seconds, what operational problem occurs?",
        "options": [
          "The workstation will overproduce and flood the factory with inventory",
          "The workstation is a bottleneck that cannot keep up with customer demand, creating downstream line starvation and missed delivery schedules",
          "The workstation runs at Six Sigma capability",
          "The workstation has zero defects"
        ],
        "correctAnswer": 1,
        "explanation": "When Cycle Time exceeds Takt Time ($55\text{s} > 40\text{s}$), the station cannot meet demand, creating a bottleneck that starves downstream operations and breaches SLAs."
      }
    ]
  }
]
};
