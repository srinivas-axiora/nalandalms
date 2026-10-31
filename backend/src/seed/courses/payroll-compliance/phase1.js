export const phase1 = {
  "chapters": [
    {
      "id": "CH-AEP-001",
      "courseId": "CRS-AEP-001",
      "title": "Introduction to Enterprise Payroll & Compliance Architecture: The Life of a Paycheck",
      "description": "Foundations of enterprise payroll processing, statutory compliance mandates, the multi-stage payroll lifecycle, and the anatomy of gross-to-net computation.",
      "order": 1,
      "duration": "60 mins",
      "videoUrl": "https://www.youtube.com/embed/n3bNqXwFfio",
      "content": "\n        <div class=\"space-y-6\">\n          <p class=\"text-gray-300 leading-relaxed text-lg\">\n            Payroll is the most critical operational function within any enterprise. While customers can tolerate a brief service outage, an organization that fails to disburse accurate, timely compensation faces immediate catastrophic outcomes: employee attrition, union grievances, severe statutory penalties, and criminal liability for corporate fiduciaries. Enterprise payroll is not merely administrative bookkeeping; it is an intricate computational, financial, and legal discipline governed by hundreds of overlapping federal, state, and municipal regulations.\n          </p>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">1. The Multi-Stage Payroll Lifecycle</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Every standard payroll cycle transitions through six non-negotiable operational checkpoints, transforming raw workforce activity into audited bank remittances and statutory tax filings:\n          </p>\n          <div class=\"overflow-x-auto my-4\">\n            <table class=\"w-full text-left border-collapse border border-gray-700\">\n              <thead>\n                <tr class=\"bg-gray-800 text-gray-200\">\n                  <th class=\"p-3 border border-gray-700\">Stage</th>\n                  <th class=\"p-3 border border-gray-700\">Primary Activities</th>\n                  <th class=\"p-3 border border-gray-700\">Key Controls & Compliance Gateways</th>\n                </tr>\n              </thead>\n              <tbody class=\"text-gray-300 text-sm\">\n                <tr class=\"border-b border-gray-800\">\n                  <td class=\"p-3 font-semibold text-blue-400\">1. Data Ingestion</td>\n                  <td class=\"p-3\">HR changes (hires, terminations, compensation updates), timecard approvals, PTO usage, commission batches.</td>\n                  <td class=\"p-3\">Segregation of duties: HR creates records; Payroll calculates; Manager authorizes hours worked.</td>\n                </tr>\n                <tr class=\"border-b border-gray-800 bg-gray-800/30\">\n                  <td class=\"p-3 font-semibold text-emerald-400\">2. Gross-to-Net Engine</td>\n                  <td class=\"p-3\">Calculation of regular pay, overtime premiums, pre-tax deductions (401k, Section 125), tax withholding, and post-tax garnishments.</td>\n                  <td class=\"p-3\">Automated statutory ceiling checks (Social Security OASDI cap, 401k annual additions limits, CCPA disposable earnings).</td>\n                </tr>\n                <tr class=\"border-b border-gray-800\">\n                  <td class=\"p-3 font-semibold text-purple-400\">3. Pre-Commit Reconciliation</td>\n                  <td class=\"p-3\">Variance analysis comparing current run against trailing 3-month averages; anomaly detection (large payouts, negative net pay).</td>\n                  <td class=\"p-3\">Dual-signoff approval matrix (Payroll Manager & Financial Controller review variances &gt; 5%).</td>\n                </tr>\n                <tr class=\"border-b border-gray-800 bg-gray-800/30\">\n                  <td class=\"p-3 font-semibold text-amber-400\">4. Settlement & Disbursement</td>\n                  <td class=\"p-3\">NACHA direct deposit file generation, ACH credit initiation, off-cycle wire transfers, and physical paper check printing.</td>\n                  <td class=\"p-3\">Positive Pay verification with corporate treasury banking partner; two-factor cryptographic file release.</td>\n                </tr>\n                <tr class=\"border-b border-gray-800\">\n                  <td class=\"p-3 font-semibold text-rose-400\">5. General Ledger Posting</td>\n                  <td class=\"p-3\">Journal entry creation mapping gross wages, employer payroll taxes, and benefit accruals to specific cost centers.</td>\n                  <td class=\"p-3\">Payroll clearing account zero-balance verification against bank settlement confirmations.</td>\n                </tr>\n                <tr>\n                  <td class=\"p-3 font-semibold text-indigo-400\">6. Statutory Tax Remittance</td>\n                  <td class=\"p-3\">Federal tax deposits (EFTPS), state withholding, local tax remissions, and child support agency disbursements.</td>\n                  <td class=\"p-3\">Deposit schedule adherence (Semi-weekly vs. Monthly rule) to eliminate 2% to 15% late deposit penalties.</td>\n                </tr>\n              </tbody>\n            </table>\n          </div>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">2. Core Regulatory Authorities</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            In the United States and globally, payroll execution operates at the intersection of labor standards, tax codes, and employee benefits laws:\n          </p>\n          <ul class=\"list-disc pl-6 text-gray-300 space-y-2\">\n            <li><strong class=\"text-white\">Fair Labor Standards Act (FLSA):</strong> Establishes minimum wage, overtime pay standards (1.5x regular rate of pay), recordkeeping mandates, and youth employment standards enforced by the Department of Labor (DOL).</li>\n            <li><strong class=\"text-white\">Internal Revenue Code (IRC):</strong> Codifies federal income tax (FIT) withholding, FICA taxation (Social Security & Medicare), FUTA unemployment taxes, and pre-tax benefit tax shelters (Sections 125, 132, 401(k)).</li>\n            <li><strong class=\"text-white\">Employee Retirement Income Security Act (ERISA):</strong> Governs the administration, fiduciary standards, and timely remittance of employee retirement funds into qualified trust accounts.</li>\n            <li><strong class=\"text-white\">State Department of Revenue & Labor Agencies:</strong> Mandate State Income Tax (SIT) withholding, State Unemployment Tax (SUTA) rates, paid family leave (PFL/SDI), and strict final pay timing rules upon separation.</li>\n          </ul>\n\n          <div class=\"bg-gray-800/50 p-4 rounded-xl border border-gray-700 mt-6\">\n            <h4 class=\"font-bold text-amber-400 mb-2\">The Golden Rule of Enterprise Payroll Compliance:</h4>\n            <p class=\"text-gray-300 text-sm\">\n              Taxes withheld from employee compensation constitute <strong>Trust Fund Taxes</strong>. Legally, these funds belong to the federal and state governments held in fiduciary trust by the employer. Failure to remit trust fund taxes exposes company directors, executives, and payroll managers to personal civil liability and criminal prosecution under IRC Section 6672 (Trust Fund Recovery Penalty).\n            </p>\n          </div>\n        </div>\n      "
    },
    {
      "id": "CH-AEP-002",
      "courseId": "CRS-AEP-001",
      "title": "Employee Classification: W-2 vs. 1099, Exempt vs. Non-Exempt (FLSA), and Misclassification Risks",
      "description": "Master legal worker classification frameworks: the IRS Common Law Control Test, DOL Economic Realities Test, ABC Test for independent contractors, and FLSA salary/duties exemption criteria.",
      "order": 2,
      "duration": "65 mins",
      "videoUrl": "https://www.youtube.com/embed/Vb1-yE6vA3Q",
      "content": "\n        <div class=\"space-y-6\">\n          <p class=\"text-gray-300 leading-relaxed text-lg\">\n            Worker misclassification is among the highest financial exposure risks facing modern enterprises. Misclassifying an employee as an independent contractor (Form 1099) or incorrectly labeling a non-exempt employee as exempt from overtime can trigger multi-million dollar class-action lawsuits, retroactive payroll tax assessments, liquidated damages, and back pay extending up to three years under willful violation standards.\n          </p>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">1. Independent Contractor vs. Common Law Employee (W-2 vs. 1099)</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Statutory authorities apply distinct legal tests to evaluate whether a worker is an independent business operator or an employee:\n          </p>\n          <div class=\"grid grid-cols-1 md:grid-cols-3 gap-4 my-4\">\n            <div class=\"bg-gray-800/60 p-4 rounded-xl border border-gray-700/60\">\n              <h4 class=\"font-bold text-blue-400 mb-2\">IRS 3-Pillar Common Law Test</h4>\n              <p class=\"text-gray-300 text-sm\">Evaluates: <strong>Behavioral Control</strong> (does company direct how work is done?), <strong>Financial Control</strong> (unreimbursed expenses, investment in tools, profit/loss risk), and <strong>Type of Relationship</strong> (written contracts, employee benefits, permanence).</p>\n            </div>\n            <div class=\"bg-gray-800/60 p-4 rounded-xl border border-gray-700/60\">\n              <h4 class=\"font-bold text-emerald-400 mb-2\">DOL Economic Realities Test</h4>\n              <p class=\"text-gray-300 text-sm\">Focuses on whether the worker is economically dependent on the employer or in business for themselves: opportunity for profit/loss, investments by worker, degree of permanence, nature of control, and centrality to business.</p>\n            </div>\n            <div class=\"bg-gray-800/60 p-4 rounded-xl border border-gray-700/60\">\n              <h4 class=\"font-bold text-purple-400 mb-2\">The Strict ABC Test (CA, NJ, MA)</h4>\n              <p class=\"text-gray-300 text-sm\">Presumes worker is an employee unless employer proves ALL THREE: (A) Free from control, (B) Work is outside the usual course of hiring entity's business, and (C) Worker is customarily engaged in an independent trade.</p>\n            </div>\n          </div>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">2. FLSA Overtime Exemptions: The Three-Part Test</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Under the Fair Labor Standards Act (FLSA), all employees are legally presumed to be <strong>Non-Exempt</strong> (entitled to minimum wage and 1.5x overtime for hours worked over 40 in a workweek) unless they satisfy three concurrent legal requirements:\n          </p>\n          <div class=\"overflow-x-auto my-4\">\n            <table class=\"w-full text-left border-collapse border border-gray-700\">\n              <thead>\n                <tr class=\"bg-gray-800 text-gray-200\">\n                  <th class=\"p-3 border border-gray-700\">Exemption Category</th>\n                  <th class=\"p-3 border border-gray-700\">Salary Basis & Level</th>\n                  <th class=\"p-3 border border-gray-700\">Standard Duties Test (Primary Duty)</th>\n                </tr>\n              </thead>\n              <tbody class=\"text-gray-300 text-sm\">\n                <tr class=\"border-b border-gray-800\">\n                  <td class=\"p-3 font-semibold text-blue-400\">Executive Exemption</td>\n                  <td class=\"p-3\">Predetermined salary meeting federal threshold (unaffected by quality/quantity of work).</td>\n                  <td class=\"p-3\">Primary duty is management of enterprise/department; regularly directs 2+ full-time employees; has authority to hire or fire.</td>\n                </tr>\n                <tr class=\"border-b border-gray-800 bg-gray-800/30\">\n                  <td class=\"p-3 font-semibold text-emerald-400\">Administrative Exemption</td>\n                  <td class=\"p-3\">Predetermined salary meeting federal threshold.</td>\n                  <td class=\"p-3\">Primary duty is office or non-manual work directly related to management or general business operations; requires exercise of discretion and independent judgment on matters of significance.</td>\n                </tr>\n                <tr class=\"border-b border-gray-800\">\n                  <td class=\"p-3 font-semibold text-purple-400\">Professional Exemption</td>\n                  <td class=\"p-3\">Predetermined salary meeting federal threshold.</td>\n                  <td class=\"p-3\">Learned: Work requiring advanced knowledge in a field of science or learning acquired by prolonged course of specialized intellectual instruction. Creative: Invention or imagination in recognized artistic field.</td>\n                </tr>\n                <tr>\n                  <td class=\"p-3 font-semibold text-amber-400\">Computer Employee Exemption</td>\n                  <td class=\"p-3\">Salary basis threshold OR at least $27.63/hour if paid on an hourly basis.</td>\n                  <td class=\"p-3\">Application of systems analysis techniques, design/development of computer systems or programs, documentation of machine operating systems. (Does not include hardware support helpdesk).</td>\n                </tr>\n              </tbody>\n            </table>\n          </div>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">3. The Impermissible Salary Deduction Trap</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Paying an employee a salary does not automatically make them exempt. If an employer makes improper deductions from an exempt employee's predetermined salary for partial-day absences, quality variations, or disciplinary infractions, the company risks destroying the exemption for the entire employee class, retroactively entitling all affected workers to overtime pay.\n          </p>\n        </div>\n      "
    },
    {
      "id": "CH-AEP-003",
      "courseId": "CRS-AEP-001",
      "title": "Time & Attendance Tracking: Overtime Rules, Regular Rate of Pay (RROP), and Shift Differentials",
      "description": "Deconstruct hours worked under FLSA, preliminary/postliminary activities (Portal-to-Portal Act), calculating Regular Rate of Pay (RROP) with non-discretionary bonuses, and California daily overtime laws.",
      "order": 3,
      "duration": "65 mins",
      "videoUrl": "https://www.youtube.com/embed/5U7yZ8n7m88",
      "content": "\n        <div class=\"space-y-6\">\n          <p class=\"text-gray-300 leading-relaxed text-lg\">\n            Calculating overtime compensation is vastly more complex than simply multiplying an employee's base hourly rate by 1.5. In modern compensation models featuring performance bonuses, shift premiums, commissions, and on-call pay, federal law mandates the computation of the <strong>Regular Rate of Pay (RROP)</strong>. Failure to factor non-discretionary compensation into the overtime rate is the single most common cause of FLSA wage and hour audit violations.\n          </p>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">1. Hours Worked & The Portal-to-Portal Act</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Under the FLSA, an employer must compensate non-exempt employees for all time spent in \"physical or mental exertion controlled or required by the employer and pursued necessarily and primarily for the benefit of the employer\":\n          </p>\n          <ul class=\"list-disc pl-6 text-gray-300 space-y-2\">\n            <li><strong class=\"text-white\">Waiting Time (Engaged to Wait vs. Waiting to be Engaged):</strong> A firefighter reading a book at the station is \"engaged to wait\" (compensable time). An on-call employee free to pursue personal activities at home with a cell phone is \"waiting to be engaged\" (non-compensable until dispatched).</li>\n            <li><strong class=\"text-white\">Donning & Doffing:</strong> Changing into specialized protective gear integral to hazardous chemical manufacturing is compensable (Steiner v. Mitchell), whereas changing into standard work uniforms is generally excluded.</li>\n            <li><strong class=\"text-white\">Rest & Meal Periods:</strong> Short rest breaks (5 to 20 minutes) must be counted as paid hours worked. Bona fide meal breaks (30+ minutes) are non-compensable ONLY if the employee is completely relieved from all duties.</li>\n            <li><strong class=\"text-white\">Travel Time:</strong> Normal home-to-work commute is unpaid. Travel between job sites during the workday or special one-day out-of-town assignments is fully compensable.</li>\n          </ul>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">2. The Regular Rate of Pay (RROP) Mathematical Formula</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            The Regular Rate of Pay is calculated by dividing total remuneration in any workweek (except statutory exclusions) by the total number of hours actually worked in that workweek:\n          </p>\n          <div class=\"bg-gray-900 p-4 rounded-xl border border-gray-700 font-mono text-sm text-gray-300 space-y-2\">\n            <div><strong>RROP</strong> = (Total Straight-Time Earnings + Includable Non-Discretionary Bonuses + Shift Differentials) / Total Hours Worked</div>\n            <div class=\"text-emerald-400 mt-2\"><strong>Overtime Premium Rate</strong> = RROP × 0.5 (or 1.5 for hours worked beyond 40)</div>\n          </div>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">3. Statutory Exclusions vs. Inclusions in RROP</h3>\n          <div class=\"overflow-x-auto my-4\">\n            <table class=\"w-full text-left border-collapse border border-gray-700\">\n              <thead>\n                <tr class=\"bg-gray-800 text-gray-200\">\n                  <th class=\"p-3 border border-gray-700\">Remuneration Item</th>\n                  <th class=\"p-3 border border-gray-700\">RROP Status</th>\n                  <th class=\"p-3 border border-gray-700\">Legal Rationale</th>\n                </tr>\n              </thead>\n              <tbody class=\"text-gray-300 text-sm\">\n                <tr class=\"border-b border-gray-800\">\n                  <td class=\"p-3 font-semibold text-rose-400\">Non-Discretionary Bonus</td>\n                  <td class=\"p-3 font-bold text-rose-400\">INCLUDED</td>\n                  <td class=\"p-3\">Bonuses announced in advance to induce workers to produce more efficiently or maintain attendance (e.g., safety, production, retention).</td>\n                </tr>\n                <tr class=\"border-b border-gray-800 bg-gray-800/30\">\n                  <td class=\"p-3 font-semibold text-rose-400\">Shift Differentials & Hazard Pay</td>\n                  <td class=\"p-3 font-bold text-rose-400\">INCLUDED</td>\n                  <td class=\"p-3\">Premiums paid for working undesirable night shifts, weekends, or hazardous environments form part of the regular hourly compensation.</td>\n                </tr>\n                <tr class=\"border-b border-gray-800\">\n                  <td class=\"p-3 font-semibold text-emerald-400\">Discretionary Holiday / Gift Bonus</td>\n                  <td class=\"p-3 font-bold text-emerald-400\">EXCLUDED</td>\n                  <td class=\"p-3\">True surprise gifts given at employer's discretion without contractual expectation or formula (IRC Section 7(e)(1)).</td>\n                </tr>\n                <tr>\n                  <td class=\"p-3 font-semibold text-emerald-400\">Paid Leave & Expense Reimbursement</td>\n                  <td class=\"p-3 font-bold text-emerald-400\">EXCLUDED</td>\n                  <td class=\"p-3\">PTO, sick leave, holiday pay (for hours not worked), and bona fide travel/mileage expense reimbursements.</td>\n                </tr>\n              </tbody>\n            </table>\n          </div>\n        </div>\n      "
    },
    {
      "id": "CH-AEP-004",
      "courseId": "CRS-AEP-001",
      "title": "Compensation Structures: Base Salaries, Hourly Wages, Commissions, Bonuses, and Piece Rates",
      "description": "Enterprise compensation models, draw versus commission accounting (recoverable vs. non-recoverable), piece-rate minimum wage reconciliation, and executive deferred compensation.",
      "order": 4,
      "duration": "60 mins",
      "videoUrl": "https://www.youtube.com/embed/5a22Vz9e9-Y",
      "content": "\n        <div class=\"space-y-6\">\n          <p class=\"text-gray-300 leading-relaxed text-lg\">\n            Modern corporate compensation packages rarely consist solely of flat hourly wages. Enterprise sales teams operate on complex commission accelerator tiers and draws; manufacturing environments utilize piece-rate structures; and technology executives receive equity, deferred compensation, and performance bonuses. The enterprise payroll accountant must accurately compute, allocate, and withhold taxes across diverse earning types while ensuring minimum wage compliance in every pay period.\n          </p>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">1. Sales Commission Structures & Draws</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Sales professionals frequently receive draws against future commissions to ensure consistent income during onboarding or prolonged sales cycles:\n          </p>\n          <div class=\"grid grid-cols-1 md:grid-cols-2 gap-4 my-4\">\n            <div class=\"bg-gray-800/60 p-4 rounded-xl border border-gray-700/60\">\n              <h4 class=\"font-bold text-blue-400 mb-2\">Recoverable Draw</h4>\n              <p class=\"text-gray-300 text-sm\">A financial advance against future earned commissions. If earned commission is $2,000 and the draw is $3,000, the company advances $3,000, creating a $1,000 deficit balance carried forward to the next cycle. In many states, negative draw balances cannot be deducted from final pay upon termination without explicit written agreement.</p>\n            </div>\n            <div class=\"bg-gray-800/60 p-4 rounded-xl border border-gray-700/60\">\n              <h4 class=\"font-bold text-emerald-400 mb-2\">Non-Recoverable Draw</h4>\n              <p class=\"text-gray-300 text-sm\">A guaranteed minimum compensation floor. If earned commission is below the draw amount, the employee receives the full draw without incurring any debt or balance deficit in subsequent payroll periods.</p>\n            </div>\n          </div>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">2. Piece-Rate Systems & The Minimum Wage Make-Up Rule</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            In agricultural, manufacturing, and logistics environments, workers are often paid per unit produced (e.g., $15 per assembled component). Under FLSA and state labor laws:\n          </p>\n          <ul class=\"list-disc pl-6 text-gray-300 space-y-2\">\n            <li><strong class=\"text-white\">Minimum Wage Floor:</strong> In any single workweek, total piece-rate earnings divided by total hours worked must equal or exceed the statutory minimum wage. If the effective rate falls below minimum wage, the employer must fund a <strong>Make-Up Pay</strong> adjustment.</li>\n            <li><strong class=\"text-white\">Rest and Recovery Periods:</strong> Several states (e.g., California Labor Code 226.2) mandate that piece-rate workers must receive separate hourly compensation at their average rate for rest breaks and non-productive waiting time.</li>\n          </ul>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">3. Section 7(i) Retail & Service Commission Exemption</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Under FLSA Section 7(i), employees of retail or service establishments are exempt from overtime requirements if two conditions are met:\n          </p>\n          <div class=\"bg-gray-800/60 p-4 rounded-xl border border-gray-700/60 my-4 text-sm text-gray-300 space-y-1\">\n            <div>1. The employee's regular rate of pay exceeds <strong>1.5 times the federal minimum wage</strong> for all hours worked in the workweek.</div>\n            <div>2. More than <strong>50% of the employee's total compensation</strong> in a representative period (not less than one month) represents commissions on goods or services.</div>\n          </div>\n        </div>\n      "
    },
    {
      "id": "CH-AEP-005",
      "courseId": "CRS-AEP-001",
      "title": "Paid Time Off (PTO), Sick Leave Accruals, Statutory Holiday Pay & FMLA Compliance",
      "description": "PTO accrual mathematical modeling, use-it-or-lose-it state prohibitions, statutory sick leave mandates, holiday premium pay, and Family and Medical Leave Act (FMLA) job-protected unpaid leave.",
      "order": 5,
      "duration": "65 mins",
      "videoUrl": "https://www.youtube.com/embed/H3Z8J0b9X7E",
      "content": "\n        <div class=\"space-y-6\">\n          <p class=\"text-gray-300 leading-relaxed text-lg\">\n            Leave administration is a minefield of conflicting federal, state, and municipal regulations. While the federal Fair Labor Standards Act does not require employers to provide paid vacation or holiday leave, state-level statutory mandates (such as California Healthy Workplaces, New York Paid Sick Leave, and Paid Family Leave programs) impose strict accrual, tracking, and vesting obligations on payroll departments.\n          </p>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">1. PTO Accrual Mathematical Modeling</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Organizations typically structure leave policies under three mathematical mechanics:\n          </p>\n          <div class=\"overflow-x-auto my-4\">\n            <table class=\"w-full text-left border-collapse border border-gray-700\">\n              <thead>\n                <tr class=\"bg-gray-800 text-gray-200\">\n                  <th class=\"p-3 border border-gray-700\">Accrual Method</th>\n                  <th class=\"p-3 border border-gray-700\">Formula / Mechanism</th>\n                  <th class=\"p-3 border border-gray-700\">Payroll Accounting Implications</th>\n                </tr>\n              </thead>\n              <tbody class=\"text-gray-300 text-sm\">\n                <tr class=\"border-b border-gray-800\">\n                  <td class=\"p-3 font-semibold text-blue-400\">Hourly Pro-Rata Accrual</td>\n                  <td class=\"p-3\">Accrual Rate = Annual Entitlement / Annual Working Hours (e.g., 120 hrs / 2080 hrs = 0.0577 hrs per hour worked).</td>\n                  <td class=\"p-3\">Ideal for part-time and variable-hour workers; scales precisely with actual hours logged.</td>\n                </tr>\n                <tr class=\"border-b border-gray-800 bg-gray-800/30\">\n                  <td class=\"p-3 font-semibold text-emerald-400\">Per-Pay-Period Lump</td>\n                  <td class=\"p-3\">Annual Entitlement / Pay Cycles (e.g., 120 hrs / 24 semi-monthly runs = 5.0 hrs per run).</td>\n                  <td class=\"p-3\">Standard for salaried exempt employees; credits immediately upon payroll execution.</td>\n                </tr>\n                <tr>\n                  <td class=\"p-3 font-semibold text-purple-400\">Front-Loaded Annual Grant</td>\n                  <td class=\"p-3\">Full annual allocation granted on Jan 1 or anniversary date.</td>\n                  <td class=\"p-3\">Eliminates mid-year accrual tracking, but risks negative balances if employee departs early in the year.</td>\n                </tr>\n              </tbody>\n            </table>\n          </div>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">2. \"Use-It-or-Lose-It\" Prohibitions & Vacation Vesting</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            State labor laws diverge dramatically regarding vacation forfeiture:\n          </p>\n          <ul class=\"list-disc pl-6 text-gray-300 space-y-2\">\n            <li><strong class=\"text-white\">California, Montana & Nebraska:</strong> Vacation pay is legally classified as earned deferred wages. Once accrued, it vests immediately and <strong>cannot be forfeited under any circumstances</strong> (\"use-it-or-lose-it\" clauses are illegal). Employers can only place an accrual cap (e.g., capping max accrual at 1.5x annual limit until leave is taken).</li>\n            <li><strong class=\"text-white\">Other States (e.g., Texas, Florida, Georgia):</strong> Employers have wide latitude to enforce \"use-it-or-lose-it\" policies and deny accrued PTO payouts upon separation, provided the policy is documented in writing in the employee handbook.</li>\n          </ul>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">3. Family and Medical Leave Act (FMLA) Administration</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            FMLA grants eligible employees up to <strong>12 weeks of job-protected, unpaid leave</strong> per 12-month period for specified family and medical reasons (or 26 weeks for military caregiver leave):\n          </p>\n          <div class=\"bg-gray-800/60 p-4 rounded-xl border border-gray-700/60 text-sm text-gray-300 space-y-2\">\n            <div><strong class=\"text-white\">Eligibility Criteria:</strong> 12 months of service + 1,250 hours worked in the preceding 12 months at a location with 50+ employees within 75 miles.</div>\n            <div><strong class=\"text-white\">Benefit Continuation:</strong> Employer must maintain group health insurance benefits on the same conditions as if the employee continued working (employee must remit their pre-tax premium contribution).</div>\n            <div><strong class=\"text-white\">Intermittent Leave:</strong> FMLA may be taken in small increments (as short as 15 minutes), requiring tight time-tracking synchronization with payroll systems.</div>\n          </div>\n        </div>\n      "
    },
    {
      "id": "CH-AEP-006",
      "courseId": "CRS-AEP-001",
      "title": "Payroll Calendars, Pay Frequencies (Weekly, Bi-Weekly, Semi-Monthly, Monthly) & Cash Flow Planning",
      "description": "Analyze payroll frequencies, leap year / 27-pay-period anomalies, treasury cash funding float, banking holidays under Federal Reserve NACHA rules, and state frequency mandates.",
      "order": 6,
      "duration": "65 mins",
      "videoUrl": "https://www.youtube.com/embed/q_2iF6w-9Z0",
      "content": "\n        <div class=\"space-y-6\">\n          <p class=\"text-gray-300 leading-relaxed text-lg\">\n            Establishing the corporate payroll calendar dictates organizational cash flow, accounting accruals, and regulatory compliance. Selecting between bi-weekly, semi-monthly, weekly, and monthly frequencies involves balancing employee expectations, administrative overhead, state statutory frequency mandates, and treasury liquidity requirements.\n          </p>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">1. Comparative Pay Frequency Architecture</h3>\n          <div class=\"overflow-x-auto my-4\">\n            <table class=\"w-full text-left border-collapse border border-gray-700\">\n              <thead>\n                <tr class=\"bg-gray-800 text-gray-200\">\n                  <th class=\"p-3 border border-gray-700\">Frequency</th>\n                  <th class=\"p-3 border border-gray-700\">Periods / Year</th>\n                  <th class=\"p-3 border border-gray-700\">Pros & Structural Advantages</th>\n                  <th class=\"p-3 border border-gray-700\">Operational Cons & Vulnerabilities</th>\n                </tr>\n              </thead>\n              <tbody class=\"text-gray-300 text-sm\">\n                <tr class=\"border-b border-gray-800\">\n                  <td class=\"p-3 font-semibold text-blue-400\">Weekly</td>\n                  <td class=\"p-3\">52 (or 53)</td>\n                  <td class=\"p-3\">Ideal for hourly, construction, and union workers; aligns perfectly with 40-hr FLSA workweek.</td>\n                  <td class=\"p-3\">Extremely high administrative burden; 52 bank transaction fees and reconciliation cycles per year.</td>\n                </tr>\n                <tr class=\"border-b border-gray-800 bg-gray-800/30\">\n                  <td class=\"p-3 font-semibold text-emerald-400\">Bi-Weekly</td>\n                  <td class=\"p-3\">26 (or 27)</td>\n                  <td class=\"p-3\">Consistent payday (e.g., every other Friday); clean 80-hour overtime calculations; favored by employees.</td>\n                  <td class=\"p-3\">Two months per year have 3 paychecks (the \"three-paycheck month\"), creating cash flow strain and general ledger month-end accrual splits.</td>\n                </tr>\n                <tr class=\"border-b border-gray-800\">\n                  <td class=\"p-3 font-semibold text-purple-400\">Semi-Monthly</td>\n                  <td class=\"p-3\">24</td>\n                  <td class=\"p-3\">Predictable dates (e.g., 15th and last day of month); aligns cleanly with monthly accounting and benefit deductions.</td>\n                  <td class=\"p-3\">Paydays land on different days of the week; workweeks are split across periods, complicating hourly overtime calculations.</td>\n                </tr>\n                <tr>\n                  <td class=\"p-3 font-semibold text-amber-400\">Monthly</td>\n                  <td class=\"p-3\">12</td>\n                  <td class=\"p-3\">Lowest administrative cost; 12 cycles per year; ideal for executive and high-earning professional workforces.</td>\n                  <td class=\"p-3\">Prohibited for non-exempt hourly employees in most states; causes personal budgeting friction for junior staff.</td>\n                </tr>\n              </tbody>\n            </table>\n          </div>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">2. The 27-Pay-Period Leap Year Anomaly</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            In a bi-weekly payroll system, 26 pay periods cover 364 days (26 × 14 = 364). Because a solar year has 365 days (366 in leap years), an extra pay period accumulates approximately every 11 years, resulting in <strong>27 pay dates in a single calendar year</strong>. If an employer fails to adjust the gross pay calculation for salaried employees, the company experiences a 3.85% unbudgeted payroll expenditure surge (paying 27/26ths of annual salary).\n          </p>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">3. Banking Holidays & NACHA Direct Deposit Timelines</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            The National Automated Clearing House Association (NACHA) governs direct deposit transactions. When a scheduled payday coincides with a Federal Reserve banking holiday (e.g., Thanksgiving, Christmas, Juneteenth), payroll files must be transmitted <strong>one banking day earlier</strong> to guarantee funds settle into employee accounts on or before the statutory pay date.\n          </p>\n        </div>\n      "
    }
  ],
  "assessments": [
    {
      "id": "ASM-AEP-001",
      "courseId": "CRS-AEP-001",
      "chapterId": "CH-AEP-001",
      "title": "Assessment: Enterprise Payroll & Compliance Architecture",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-AEP-001",
          "question": "Why are payroll withholdings legally classified as 'Trust Fund Taxes' under Internal Revenue Code Section 6672?",
          "options": [
            "Because they are deposited into a private investment trust fund for the CEO's retirement",
            "Because the employer holds employee-withheld income and FICA taxes in fiduciary trust for the government until remitted",
            "Because they can only be processed by licensed banking trust departments",
            "Because they are exempt from federal and state tax audits"
          ],
          "correctAnswer": 1,
          "explanation": "Employee taxes withheld are not company assets; they are held in legal trust for federal and state taxing authorities, exposing corporate fiduciaries to personal liability if unremitted."
        },
        {
          "id": "Q-AEP-002",
          "question": "Which federal agency is responsible for enforcing minimum wage, overtime rules, and youth employment standards under the Fair Labor Standards Act (FLSA)?",
          "options": [
            "Internal Revenue Service (IRS)",
            "Department of Labor (DOL) Wage and Hour Division",
            "Equal Employment Opportunity Commission (EEOC)",
            "Federal Reserve Board"
          ],
          "correctAnswer": 1,
          "explanation": "The Wage and Hour Division of the US Department of Labor oversees FLSA enforcement, including minimum wage and overtime compliance."
        },
        {
          "id": "Q-AEP-003",
          "question": "In the enterprise payroll lifecycle, what is the primary function of the 'Pre-Commit Reconciliation' gateway?",
          "options": [
            "Printing physical checks for distribution",
            "Running variance analytics against historical runs to identify anomalies, unauthorized salary spikes, and negative net pay prior to final transmission",
            "Submitting annual W-2 reports to the Social Security Administration",
            "Negotiating insurance premiums with healthcare providers"
          ],
          "correctAnswer": 1,
          "explanation": "Pre-commit reconciliation stops payroll errors before money leaves the bank account by auditing variances against trailing averages."
        },
        {
          "id": "Q-AEP-004",
          "question": "What internal control principle mandates that the employee creating HR profiles cannot also authorize final payroll wire disbursements?",
          "options": [
            "Positive Pay Banking Protocol",
            "Segregation of Duties (SoD)",
            "Double-Entry General Ledger Rule",
            "NACHA Float Rule"
          ],
          "correctAnswer": 1,
          "explanation": "Segregation of Duties prevents internal fraud (such as ghost employees) by dividing record creation, calculation, and final disbursement authority across distinct individuals."
        },
        {
          "id": "Q-AEP-005",
          "question": "What is the consequence of an employer being classified as a 'Semi-Weekly Schedule Depositor' by the IRS for federal payroll taxes?",
          "options": [
            "The employer is required to pay employees twice per week",
            "Taxes for payments made on Wednesday, Thursday, or Friday must be deposited by the following Wednesday; payments made Saturday through Tuesday must be deposited by Friday",
            "The employer pays federal taxes once every six months",
            "Federal income taxes are waived for the first 90 days of the year"
          ],
          "correctAnswer": 1,
          "explanation": "Semi-weekly depositors must remit federal payroll tax deposits within three business days of each payroll disbursement under IRS deposit schedules."
        },
        {
          "id": "Q-AEP-006",
          "question": "Which of the following is considered a statutory pre-tax deduction under IRS regulations?",
          "options": [
            "Roth 401(k) voluntary deferral",
            "Section 125 Cafeteria Plan group health insurance premium",
            "Court-ordered child support wage garnishment",
            "Union monthly membership dues"
          ],
          "correctAnswer": 1,
          "explanation": "Section 125 health insurance deductions are pre-tax, reducing wages subject to Federal Income Tax, Social Security, and Medicare."
        },
        {
          "id": "Q-AEP-007",
          "question": "What is Positive Pay in enterprise treasury payroll operations?",
          "options": [
            "An emotional wellness program for payroll accountants",
            "An automated fraud detection service where the bank matches check numbers, account numbers, and dollar amounts against a pre-authorized list submitted by the employer before honoring checks",
            "A mandatory annual salary bonus paid to high performers",
            "Paying employees on a Friday rather than a Monday"
          ],
          "correctAnswer": 1,
          "explanation": "Positive Pay protects organizations against check fraud by requiring banks to cross-reference every presented check against a company-supplied issue file."
        },
        {
          "id": "Q-AEP-008",
          "question": "Under ERISA regulations, what is the maximum time limit for an employer to deposit employee 401(k) salary deferrals into the retirement plan trust?",
          "options": [
            "By the end of the subsequent calendar year",
            "As soon as administratively feasible, but no later than the 15th business day of the month following the month in which amounts were withheld",
            "Within 180 days of the company's fiscal year-end",
            "At the employee's retirement date"
          ],
          "correctAnswer": 1,
          "explanation": "The DOL mandates that 401(k) salary withholdings must be remitted as soon as reasonably possible, with a hard regulatory ceiling of the 15th business day of the following month."
        },
        {
          "id": "Q-AEP-009",
          "question": "What does the term 'Gross-to-Net' refer to in enterprise payroll processing?",
          "options": [
            "The difference between total company revenue and net profit",
            "The mathematical engine that calculates gross earnings, applies pre-tax deductions, calculates statutory tax withholdings, deducts post-tax garnishments, and produces net pay",
            "The physical delivery of checks from headquarters to remote branches",
            "The calculation of gross weight for international shipping"
          ],
          "correctAnswer": 1,
          "explanation": "Gross-to-Net represents the entire computational pipeline transforming total compensation into take-home pay through tax and benefit deductions."
        },
        {
          "id": "Q-AEP-010",
          "question": "Under IRC Section 6672, what penalty can the IRS assess against a 'responsible person' who willfully fails to collect or pay over trust fund taxes?",
          "options": [
            "A $50 administrative parking ticket",
            "A personal penalty equal to 100% of the unpaid trust fund taxes (Trust Fund Recovery Penalty)",
            "Mandatory community service at a local library",
            "A 5% reduction in company stock value"
          ],
          "correctAnswer": 1,
          "explanation": "The Trust Fund Recovery Penalty allows the IRS to pierce the corporate veil and seize personal assets of directors, officers, and payroll managers equal to 100% of unpaid taxes."
        }
      ]
    },
    {
      "id": "ASM-AEP-002",
      "courseId": "CRS-AEP-001",
      "chapterId": "CH-AEP-002",
      "title": "Assessment: Employee Classification & FLSA Exemption Frameworks",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-AEP-011",
          "question": "What is the legal presumption regarding worker status under the strict 'ABC Test' used in California and New Jersey?",
          "options": [
            "A worker is presumed to be a shareholder until proven otherwise",
            "A worker is legally presumed to be an employee unless the employer proves all three criteria (A, B, and C)",
            "A worker is presumed to be an independent contractor if they sign a contract",
            "A worker can freely choose their classification on tax returns"
          ],
          "correctAnswer": 1,
          "explanation": "Under the ABC test, the default legal status is employee; the hiring entity carries the burden of proving all three prongs to validate 1099 contractor status."
        },
        {
          "id": "Q-AEP-012",
          "question": "Under the FLSA Executive Exemption duties test, which of the following is a mandatory requirement?",
          "options": [
            "The employee must hold a Master of Business Administration degree",
            "The employee must regularly direct the work of two or more full-time employees (or their equivalent in part-time workers)",
            "The employee must earn over $250,000 in annual base salary",
            "The employee must have direct ownership of company stock"
          ],
          "correctAnswer": 1,
          "explanation": "The executive exemption requires the primary duty to be department management and the regular supervision of at least two full-time employees."
        },
        {
          "id": "Q-AEP-013",
          "question": "What distinguishes the FLSA Administrative Exemption from ordinary clerical administrative support?",
          "options": [
            "Clerical workers do not use computers",
            "Exempt administrative employees must exercise discretion and independent judgment on matters of significance to business operations",
            "Exempt administrative employees are paid on an hourly basis",
            "Administrative employees cannot take lunch breaks"
          ],
          "correctAnswer": 1,
          "explanation": "The hallmark of the FLSA administrative exemption is the exercise of independent discretion on significant business matters, excluding routine clerical tasks."
        },
        {
          "id": "Q-AEP-014",
          "question": "What happens if an employer makes an improper partial-day salary deduction from an exempt employee for poor work performance?",
          "options": [
            "The employee is automatically promoted to supervisor",
            "The deduction violates the salary basis test, risking the loss of the exemption for that employee and all employees in the same job classification",
            "The deduction is tax-deductible for the employer",
            "The IRS will issue an immediate refund to the employee"
          ],
          "correctAnswer": 1,
          "explanation": "Deductions based on the quality of work destroy the salary basis, exposing the employer to overtime liabilities across the entire job class."
        },
        {
          "id": "Q-AEP-015",
          "question": "Under the IRS Common Law Control test, which factor points strongly toward employee (W-2) status rather than independent contractor (1099)?",
          "options": [
            "The worker provides their own proprietary software tools and equipment",
            "The company dictates the exact hours, sequence, and detailed instructions on how the work must be performed",
            "The worker markets their services to multiple competing clients simultaneously",
            "The worker submits invoices with Net-30 payment terms"
          ],
          "correctAnswer": 1,
          "explanation": "Direct behavioral control over the time, manner, and detailed execution of work is the primary indicator of an employment relationship."
        },
        {
          "id": "Q-AEP-016",
          "question": "What is the statutory hourly minimum rate required to exempt a Computer Employee from overtime if paid on an hourly basis under the FLSA?",
          "options": [
            "$15.00 per hour",
            "Not less than $27.63 per hour",
            "$50.00 per hour",
            "$75.50 per hour"
          ],
          "correctAnswer": 1,
          "explanation": "Under FLSA Section 13(a)(17), computer professionals paid on an hourly basis must receive at least $27.63 per hour to qualify for exemption."
        },
        {
          "id": "Q-AEP-017",
          "question": "Which role would be improperly classified as exempt under the Computer Employee Exemption?",
          "options": [
            "Senior Software Systems Architect designing microservices",
            "Entry-level IT Help Desk technician repairing hardware and resetting user passwords",
            "Database Administrator developing automated backup pipelines",
            "Operating Systems Programmer writing kernel drivers"
          ],
          "correctAnswer": 1,
          "explanation": "The DOL explicitly excludes routine hardware maintenance, cable installation, and helpdesk support from the computer employee exemption."
        },
        {
          "id": "Q-AEP-018",
          "question": "What is the statute of limitations for back-wage claims under the FLSA in the case of a 'willful violation' by an employer?",
          "options": [
            "6 months",
            "3 years",
            "10 years",
            "30 days"
          ],
          "correctAnswer": 1,
          "explanation": "Standard FLSA claims have a 2-year statute of limitations, but willful violations extend the liability period to 3 years, plus liquidated damages."
        },
        {
          "id": "Q-AEP-019",
          "question": "What does 'Liquidated Damages' represent in an FLSA overtime misclassification settlement?",
          "options": [
            "The cash value of liquid office supplies",
            "An automatic additional penalty equal to 100% of the unpaid overtime wages awarded to the employee, doubling the employer's liability",
            "The legal fees paid to the company's defense attorneys",
            "A discount given to the employer for settling early"
          ],
          "correctAnswer": 1,
          "explanation": "FLSA awards liquidated damages equal to 100% of the back wages owed unless the employer proves it acted in good faith with reasonable grounds."
        },
        {
          "id": "Q-AEP-020",
          "question": "Under the Outside Sales Exemption, what is the primary operational requirement?",
          "options": [
            "The employee must travel outside the United States once per year",
            "The employee's primary duty must be making sales, and they must be regularly and customarily engaged away from the employer's place of business",
            "The employee must make at least 100 telephone sales calls per day",
            "The employee must work in retail storefront stores"
          ],
          "correctAnswer": 1,
          "explanation": "Outside sales representatives must regularly conduct sales activities away from the employer's offices (in-person customer visits) to qualify."
        }
      ]
    },
    {
      "id": "ASM-AEP-003",
      "courseId": "CRS-AEP-001",
      "chapterId": "CH-AEP-003",
      "title": "Assessment: Time & Attendance, Overtime & Regular Rate of Pay (RROP)",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-AEP-021",
          "question": "An employee works 45 hours in a workweek at a base rate of $20/hr, and earns a $100 non-discretionary production bonus. What is the employee's Regular Rate of Pay (RROP)?",
          "options": [
            "$20.00 / hr",
            "$22.22 / hr ($1,000 total earnings / 45 hours)",
            "$25.00 / hr",
            "$30.00 / hr"
          ],
          "correctAnswer": 1,
          "explanation": "Total straight-time pay is (45 × $20) + $100 = $1,000. Dividing total earnings ($1,000) by total hours worked (45) yields an RROP of $22.22/hr."
        },
        {
          "id": "Q-AEP-022",
          "question": "Continuing from the previous calculation (RROP = $22.22/hr, 45 total hours worked), what is the additional overtime premium due for the 5 overtime hours?",
          "options": [
            "$50.00",
            "$55.55 (5 hours × 0.5 × $22.22)",
            "$111.10",
            "$150.00"
          ],
          "correctAnswer": 1,
          "explanation": "Since straight-time pay for all 45 hours is already paid in the $1,000, the remaining overtime premium is 5 hours × (0.5 × $22.22) = $55.55."
        },
        {
          "id": "Q-AEP-023",
          "question": "Under the FLSA, when is a meal break for non-exempt employees legally allowed to be unpaid?",
          "options": [
            "Whenever the supervisor writes 'unpaid' on the timesheet",
            "Only when the break is at least 30 uninterrupted minutes and the employee is completely relieved from all duties",
            "Meal breaks must always be paid under federal law",
            "Whenever the employee eats at their desk while answering customer calls"
          ],
          "correctAnswer": 1,
          "explanation": "If an employee performs any active or inactive work (such as watching monitors or answering phones) during a lunch break, the entire period is compensable."
        },
        {
          "id": "Q-AEP-024",
          "question": "Which compensation item must be legally EXCLUDED from the Regular Rate of Pay calculation under FLSA Section 7(e)?",
          "options": [
            "Attendance bonuses promised for zero absences",
            "Bona fide discretionary gifts on Christmas with no contractual expectation",
            "Hazardous duty pay premiums",
            "Shift differential premiums for working night shifts"
          ],
          "correctAnswer": 1,
          "explanation": "True discretionary bonuses or holiday gifts not tied to hours, production, or contractual formulas are statutory exclusions from RROP."
        },
        {
          "id": "Q-AEP-025",
          "question": "What is California's specific daily overtime rule for non-exempt employees?",
          "options": [
            "Overtime is paid only after 50 hours in a calendar month",
            "1.5x regular rate after 8 hours worked in a single workday, and 2.0x (double time) after 12 hours in a single workday",
            "California follows the federal 40-hour weekly rule with no daily overtime requirements",
            "Overtime is paid only on Sundays"
          ],
          "correctAnswer": 1,
          "explanation": "California mandates daily overtime: 1.5x for hours over 8 up to 12 in a workday, and double time (2.0x) for hours worked in excess of 12 in a single day."
        },
        {
          "id": "Q-AEP-026",
          "question": "Under the Portal-to-Portal Act, which travel time activity is compensable as hours worked?",
          "options": [
            "Normal daily commuting from home to the permanent office",
            "Travel between distinct job sites or client locations during the normal working day",
            "Riding a public transit subway home after clocking out",
            "Walking from the parking lot to the office lobby"
          ],
          "correctAnswer": 1,
          "explanation": "Travel from job site to job site during the workday is integral to the job and must be compensated as hours worked."
        },
        {
          "id": "Q-AEP-027",
          "question": "What is 'Engaged to Wait' versus 'Waiting to be Engaged' under FLSA on-call rules?",
          "options": [
            "There is no legal difference between the two terms",
            "'Engaged to wait' is compensable because freedom is severely restricted; 'waiting to be engaged' allows personal pursuits and is unpaid until called",
            "'Waiting to be engaged' is paid at double time",
            "Both categories are exempt from federal wage laws"
          ],
          "correctAnswer": 1,
          "explanation": "Workers required to remain on premises or so close that they cannot use time effectively for personal purposes are engaged to wait and must be paid."
        },
        {
          "id": "Q-AEP-028",
          "question": "How must a non-discretionary quarterly bonus covering multiple pay periods be handled for overtime calculation?",
          "options": [
            "It is taxed as an independent payment with no overtime recalculation",
            "The bonus must be apportioned back across each workweek of the quarter, and retroactive overtime must be calculated and paid for any week with overtime hours",
            "The bonus is converted into common stock options",
            "The bonus is forfeited if the employee worked overtime"
          ],
          "correctAnswer": 1,
          "explanation": "Employers must allocate deferred non-discretionary bonuses back to the workweeks in which they were earned and pay retroactive overtime on the expanded RROP."
        },
        {
          "id": "Q-AEP-029",
          "question": "Under FLSA recordkeeping regulations, how long must an employer retain basic payroll records, including employee earnings cards and wage rate tables?",
          "options": [
            "1 year",
            "At least 3 years (with timecards and work schedules kept for at least 2 years)",
            "30 days",
            "Permanently for 50 years"
          ],
          "correctAnswer": 1,
          "explanation": "FLSA 29 CFR Part 516 mandates retaining basic payroll and tax records for 3 years, and supplementary timecards and rate schedules for 2 years."
        },
        {
          "id": "Q-AEP-030",
          "question": "What is 'Off-the-Clock' work, and what is the employer's legal liability if a manager knows an employee is checking emails after hours?",
          "options": [
            "Off-the-clock work is legal as long as the employee does not complain",
            "If the employer knows or has reason to believe work is being performed, it must be counted and paid as compensable time, even if not formally authorized",
            "The employee must pay a fine to the company for unauthorized work",
            "Off-the-clock work is treated as a charitable contribution"
          ],
          "correctAnswer": 1,
          "explanation": "The FLSA mandates that if management 'suffers or permits' an employee to work, that time is compensable regardless of whether it was pre-authorized."
        }
      ]
    },
    {
      "id": "ASM-AEP-004",
      "courseId": "CRS-AEP-001",
      "chapterId": "CH-AEP-004",
      "title": "Assessment: Compensation Structures, Piece Rates & Draws",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-AEP-031",
          "question": "What is the primary difference between a Recoverable Draw and a Non-Recoverable Draw in sales compensation accounting?",
          "options": [
            "Recoverable draws are paid in gold coins",
            "A recoverable draw is an advance creating a debt balance to be repaid from future commissions; a non-recoverable draw is a guaranteed floor with no debt carryover",
            "Non-recoverable draws are exempt from federal income taxation",
            "Recoverable draws apply only to independent contractors"
          ],
          "correctAnswer": 1,
          "explanation": "Recoverable draws represent advances against future earnings that must be reconciled, whereas non-recoverable draws establish an unrecoverable floor."
        },
        {
          "id": "Q-AEP-032",
          "question": "In a piece-rate compensation model, what must the payroll department do if an employee's weekly piece-rate earnings divide out to $6.50 per hour worked?",
          "options": [
            "Terminate the employee immediately without pay",
            "Issue a Make-Up Pay adjustment to bring total earnings up to at least the statutory minimum wage for all hours worked",
            "Deduct the deficit from the employee's subsequent pay run",
            "Report the employee to the state labor board for slow productivity"
          ],
          "correctAnswer": 1,
          "explanation": "Employers cannot pay less than the statutory minimum wage; if piece-rate production yields less, a supplemental make-up adjustment is mandatory."
        },
        {
          "id": "Q-AEP-033",
          "question": "Under FLSA Section 7(i), which retail employees are exempt from statutory overtime?",
          "options": [
            "All retail store cashiers and stockroom clerks",
            "Employees whose regular rate exceeds 1.5x minimum wage and more than 50% of whose compensation represents commissions in a representative period",
            "Employees who work fewer than 10 hours per week",
            "Store managers who earn less than minimum wage"
          ],
          "correctAnswer": 1,
          "explanation": "Section 7(i) exempts commissioned retail sales representatives if their earnings exceed 1.5x minimum wage and more than half their pay comes from commissions."
        },
        {
          "id": "Q-AEP-034",
          "question": "How are non-cash prizes and awards (e.g., a $1,500 vacation package won in a sales contest) treated for payroll tax purposes?",
          "options": [
            "They are completely non-taxable gifts",
            "They are considered supplemental taxable wages, subject to FIT, FICA, and FUTA withholding based on fair market value",
            "They are taxed only if the employee converts them into cash",
            "They are reported on Form 1099-MISC regardless of W-2 status"
          ],
          "correctAnswer": 1,
          "explanation": "Employer-provided prizes and contest awards are supplemental compensation subject to full payroll taxation at fair market value."
        },
        {
          "id": "Q-AEP-035",
          "question": "What is 'Gross-Up' in supplemental compensation accounting?",
          "options": [
            "Increasing the physical dimensions of the printed paycheck",
            "An accounting calculation where the employer pays the employee's tax liability so the net disbursement matches a specific predetermined dollar amount",
            "Adding overtime hours to an employee's timesheet without permission",
            "Deducting company administrative fees from gross wages"
          ],
          "correctAnswer": 1,
          "explanation": "A gross-up recalculates gross pay upward so that after all mandatory taxes are withheld, the resulting net pay equals the exact desired net award."
        },
        {
          "id": "Q-AEP-036",
          "question": "What is the formula for calculating Gross Pay from a desired Net Pay using a total tax rate percentage (T)?",
          "options": [
            "Gross Pay = Desired Net Pay × (1 + T)",
            "Gross Pay = Desired Net Pay / (1 - T)",
            "Gross Pay = Desired Net Pay + T",
            "Gross Pay = Desired Net Pay × T"
          ],
          "correctAnswer": 1,
          "explanation": "The standard gross-up formula divides the desired net amount by (1 minus the combined marginal tax withholding percentage)."
        },
        {
          "id": "Q-AEP-037",
          "question": "Why must negative draw balances be monitored carefully when an employee separates from an organization?",
          "options": [
            "Because banks will cancel the company's direct deposit routing number",
            "Many state labor laws prohibit deducting unearned commission draw deficits from an employee's final wages without express prior written consent",
            "Negative balances automatically convert into company equity",
            "The Department of Labor confiscates negative balances"
          ],
          "correctAnswer": 1,
          "explanation": "State wage protection laws strictly limit deductions from final paychecks, often prohibiting recovering unearned draw deficits."
        },
        {
          "id": "Q-AEP-038",
          "question": "In California (Labor Code 226.2), how must employers pay piece-rate workers for mandatory 10-minute rest breaks?",
          "options": [
            "Rest breaks are unpaid for piece-rate workers",
            "At an hourly rate determined by dividing total weekly piece-rate compensation by total productive hours worked (average hourly rate)",
            "At a flat rate of $1.00 per break",
            "Piece-rate workers are not permitted to take rest breaks"
          ],
          "correctAnswer": 1,
          "explanation": "California mandates that piece-rate employees receive separate hourly compensation for rest and non-productive time at their average hourly piece-rate."
        },
        {
          "id": "Q-AEP-039",
          "question": "Under the FLSA, can an employer average an employee's wages across two different workweeks to avoid paying overtime?",
          "options": [
            "Yes, as long as the employee is paid on a bi-weekly payroll schedule",
            "No. Each individual workweek stands alone, and hours cannot be averaged across workweeks for overtime determination",
            "Yes, if the employee signs an overtime waiver",
            "Yes, during holiday periods only"
          ],
          "correctAnswer": 1,
          "explanation": "The workweek is the standard unit of measurement under FLSA; averaging hours over a bi-weekly 80-hour period (e.g., 50 hrs in week 1, 30 hrs in week 2) is illegal."
        },
        {
          "id": "Q-AEP-040",
          "question": "What is 'Imputed Income' in employee benefits and compensation?",
          "options": [
            "Income earned from foreign cryptocurrency exchanges",
            "The estimated cash value of non-cash fringe benefits (e.g., personal use of company car, excess life insurance) added to gross pay for taxation purposes",
            "Unreported cash tips handed directly to workers",
            "Salaries paid to corporate board directors"
          ],
          "correctAnswer": 1,
          "explanation": "Imputed income reflects the taxable value of employer-provided fringe benefits, increasing taxable gross wages without increasing net cash pay."
        }
      ]
    },
    {
      "id": "ASM-AEP-005",
      "courseId": "CRS-AEP-001",
      "chapterId": "CH-AEP-005",
      "title": "Assessment: PTO Accruals, Statutory Sick Leave & FMLA Compliance",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-AEP-041",
          "question": "In California, why are 'use-it-or-lose-it' vacation policies legally void?",
          "options": [
            "Because vacation is not allowed in California",
            "Earned vacation is legally recognized as deferred compensation and wages; once accrued, it cannot be forfeited and must be paid out upon separation",
            "Because all vacation must be taken within 7 days of accrual",
            "State laws require vacation days to be traded for stock"
          ],
          "correctAnswer": 1,
          "explanation": "Under Suastez v. Plastic Dress-Up Co., California law holds that vacation vests day by day as labor is rendered and cannot be forfeited."
        },
        {
          "id": "Q-AEP-042",
          "question": "How can an employer in a 'no-forfeiture' state like California manage skyrocketing vacation balances without violating the law?",
          "options": [
            "By secretly deleting unused hours at the end of the year",
            "By implementing an accrual cap: once an employee reaches the maximum cap (e.g., 200 hours), accrual stops until leave is taken",
            "By firing employees who have more than 100 vacation hours",
            "By transferring vacation hours to the supervisor's balance"
          ],
          "correctAnswer": 1,
          "explanation": "Accrual caps prevent endless liability accumulation without illegally forfeiting previously earned and vested vacation hours."
        },
        {
          "id": "Q-AEP-043",
          "question": "What is the basic employee eligibility requirement to qualify for leave under the federal Family and Medical Leave Act (FMLA)?",
          "options": [
            "30 days of employment and 500 hours worked",
            "At least 12 months of service, 1,250 hours worked in the preceding 12 months, at a location with 50+ employees within 75 miles",
            "Any full-time employee from their first day of work",
            "Only executive level corporate directors"
          ],
          "correctAnswer": 1,
          "explanation": "FMLA requires 12 months of employment, 1,250 actual hours worked in the trailing 12 months, and employer coverage (50 employees within a 75-mile radius)."
        },
        {
          "id": "Q-AEP-044",
          "question": "Is leave under the federal FMLA required to be paid by the employer?",
          "options": [
            "Yes, federal law mandates 100% full wage replacement for 12 weeks",
            "No. FMLA provides job-protected unpaid leave, although employees may elect or employers require the substitution of accrued paid leave",
            "Yes, paid exclusively through federal grant checks",
            "FMLA is paid only during leap years"
          ],
          "correctAnswer": 1,
          "explanation": "Federal FMLA guarantees job protection and health benefit continuation, but does not mandate paid wage replacement."
        },
        {
          "id": "Q-AEP-045",
          "question": "During an employee's unpaid FMLA leave, how must health insurance benefits be handled by payroll?",
          "options": [
            "Health insurance must be cancelled immediately on the first day of leave",
            "The employer must maintain coverage under the same conditions, and the employee must continue to pay their normal employee share of the premium",
            "The employer must pay 100% of all costs, including the employee's premium",
            "The employee must transition permanently to COBRA"
          ],
          "correctAnswer": 1,
          "explanation": "Employers must maintain health coverage during FMLA leave; employees remain responsible for their standard pre-leave premium contributions."
        },
        {
          "id": "Q-AEP-046",
          "question": "An employee earns 120 hours of PTO annually in a bi-weekly payroll system (26 pay periods). What is the accrual per pay period?",
          "options": [
            "10.00 hours",
            "4.615 hours (120 / 26)",
            "5.000 hours (120 / 24)",
            "2.308 hours"
          ],
          "correctAnswer": 1,
          "explanation": "Dividing 120 annual hours across 26 bi-weekly pay periods yields an accrual rate of 4.615 hours per pay period."
        },
        {
          "id": "Q-AEP-047",
          "question": "What is 'Intermittent FMLA Leave'?",
          "options": [
            "Leave taken only during national holidays",
            "FMLA leave taken in separate blocks of time or on a reduced schedule due to a single qualifying medical condition, in increments as small as the shortest time-tracking unit",
            "Leave shared between two unrelated employees",
            "Leave that does not require medical certification"
          ],
          "correctAnswer": 1,
          "explanation": "Intermittent leave allows employees to take time off in small increments (e.g., 1 hour for chemotherapy) while working the remainder of the day."
        },
        {
          "id": "Q-AEP-048",
          "question": "How do statutory paid sick leave mandates (e.g., in NY, CA, WA) differ from general discretionary vacation policies?",
          "options": [
            "Statutory sick leave is voluntary for employers",
            "State laws mandate minimum accrual rates (e.g., 1 hr per 30 hrs worked), protected usage reasons, anti-retaliation protections, and carryover rules",
            "Sick leave must be paid in physical gold certificates",
            "Sick leave applies only to executive management"
          ],
          "correctAnswer": 1,
          "explanation": "Statutory sick leave laws establish non-negotiable minimum accrual rates, legally protected reasons for absence, and strict penalties for retaliation."
        },
        {
          "id": "Q-AEP-049",
          "question": "Are employers federally required under the FLSA to pay premium rates (e.g., 1.5x) for working on national holidays like Christmas or New Year's Day?",
          "options": [
            "Yes, all federal holidays require 2.0x double-time pay",
            "No. The FLSA treats holidays as regular workdays; overtime premiums are required only if total weekly hours worked exceed 40",
            "Yes, 1.5x is mandated for any work performed on a federal holiday",
            "Holiday work is strictly prohibited under federal labor law"
          ],
          "correctAnswer": 1,
          "explanation": "Federal law does not require extra pay for working on holidays unless those hours push the non-exempt employee's weekly total over 40 hours."
        },
        {
          "id": "Q-AEP-050",
          "question": "What is the payroll accounting entry when an employee takes 8 hours of accrued paid vacation?",
          "options": [
            "Debit Cash, Credit Revenue",
            "Debit Accrued Vacation Liability, Credit Cash (or Payroll Clearing)",
            "Debit Accounts Receivable, Credit Sales",
            "Debit Tax Expense, Credit Common Stock"
          ],
          "correctAnswer": 1,
          "explanation": "Taking vacation liquidates the accrued vacation liability previously accumulated on the balance sheet and reduces cash/clearing."
        }
      ]
    },
    {
      "id": "ASM-AEP-006",
      "courseId": "CRS-AEP-001",
      "chapterId": "CH-AEP-006",
      "title": "Assessment: Payroll Calendars, Pay Frequencies & Cash Flow Planning",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-AEP-051",
          "question": "How many pay periods occur in a standard Bi-Weekly payroll schedule versus a Semi-Monthly payroll schedule in a normal calendar year?",
          "options": [
            "Bi-Weekly has 24; Semi-Monthly has 26",
            "Bi-Weekly has 26; Semi-Monthly has 24",
            "Bi-Weekly has 52; Semi-Monthly has 12",
            "Both schedules have exactly 24 pay periods"
          ],
          "correctAnswer": 1,
          "explanation": "Bi-weekly schedules disburse every two weeks (52 / 2 = 26 runs), while semi-monthly schedules disburse twice per month (12 × 2 = 24 runs)."
        },
        {
          "id": "Q-AEP-052",
          "question": "What is the financial danger of the '27th pay period' in a bi-weekly payroll system for salaried employees?",
          "options": [
            "Banks refuse to process direct deposits in leap years",
            "If annual salaries are divided by 26 instead of 27, the employer unintentionally pays an extra 3.85% in total unbudgeted salary compensation",
            "Employee tax withholdings are cancelled by the IRS",
            "Overtime rates drop to zero"
          ],
          "correctAnswer": 1,
          "explanation": "Paying 27 paychecks at 1/26th of annual salary results in paying 103.85% of each employee's contracted annual salary, inflating payroll costs."
        },
        {
          "id": "Q-AEP-053",
          "question": "Under NACHA operating guidelines, if a direct deposit payday falls on a Federal Reserve banking holiday, what is the required action?",
          "options": [
            "Delay payment until three days after the holiday",
            "Transmit ACH payroll files early so that funds settle into employee accounts on the preceding business day",
            "Cancel direct deposit and hand-write physical checks",
            "Deposit funds into the employer's tax savings account"
          ],
          "correctAnswer": 1,
          "explanation": "To ensure employees have access to funds on or before payday, ACH files must be processed one banking day earlier when holidays intervene."
        },
        {
          "id": "Q-AEP-054",
          "question": "Why do hourly manufacturing enterprises prefer Bi-Weekly over Semi-Monthly payroll frequencies?",
          "options": [
            "Bi-weekly is legally mandatory for all factory workers",
            "Bi-weekly pay periods always cover an exact 14-day / 2-workweek cycle, preventing split workweeks and simplifying overtime calculations",
            "Semi-monthly payroll cannot process cash disbursements",
            "Bi-weekly saves on bank transaction fees compared to monthly"
          ],
          "correctAnswer": 1,
          "explanation": "Semi-monthly paydays split 7-day FLSA workweeks in half, making overtime calculation and timecard cutoff reconciliations complicated."
        },
        {
          "id": "Q-AEP-055",
          "question": "What is a 'Three-Paycheck Month' in a bi-weekly payroll architecture?",
          "options": [
            "A month where employees receive a triple bonus",
            "The two months each year where 3 bi-weekly pay dates fall within the same calendar month instead of the usual 2",
            "A penalty assessed by the Department of Labor",
            "A month where the employer does not deduct payroll taxes"
          ],
          "correctAnswer": 1,
          "explanation": "Since 26 bi-weekly periods occur in 12 months, two months in every year contain three paydays, creating unique cash flow demands."
        },
        {
          "id": "Q-AEP-056",
          "question": "How do sophisticated payroll departments handle fixed monthly benefit deductions (e.g., medical insurance) during a 'three-paycheck month'?",
          "options": [
            "Deduct triple insurance premiums to boost company profits",
            "Deduct benefit premiums only on the first 2 paychecks of every month, leaving the 3rd paycheck free of fixed benefit deductions ('deduction holiday')",
            "Double the employee's 401(k) deduction automatically",
            "Cancel medical coverage for that pay run"
          ],
          "correctAnswer": 1,
          "explanation": "Splitting monthly premiums across 24 deductions ensures the 25th and 26th paychecks have zero insurance deductions, providing employees higher net pay."
        },
        {
          "id": "Q-AEP-057",
          "question": "Which of the following states strictly limits or prohibits monthly pay frequencies for non-exempt hourly employees?",
          "options": [
            "Texas and Florida",
            "New York and California (mandating weekly or semi-monthly/bi-weekly for manual and non-exempt workers)",
            "Montana and Wyoming",
            "All 50 states mandate monthly pay"
          ],
          "correctAnswer": 1,
          "explanation": "States like New York (requiring weekly pay for manual workers) and California restrict monthly pay for non-exempt hourly workers."
        },
        {
          "id": "Q-AEP-058",
          "question": "What is 'Payroll Float' in corporate treasury cash management?",
          "options": [
            "Money kept in an office petty cash box",
            "The time period between when payroll funds are debited from the corporate operating account and when ACH transfers settle into employee accounts",
            "The cost of printing paper checks",
            "The fluctuation of corporate stock on payday"
          ],
          "correctAnswer": 1,
          "explanation": "Float represents the financial transit window during settlement, which treasury manages to optimize working capital liquidity."
        },
        {
          "id": "Q-AEP-059",
          "question": "What is the standard ACH settlement window under Same-Day ACH guidelines for emergency payroll corrections?",
          "options": [
            "14 business days",
            "Same-day settlement if submitted by NACHA processing cutoff windows (e.g., 10:30 AM or 2:45 PM ET)",
            "Exactly 72 hours",
            "Same-day ACH is prohibited for payroll disbursements"
          ],
          "correctAnswer": 1,
          "explanation": "Same-Day ACH allows off-cycle corrections and missed wage payments to settle on the identical business day if submitted within clearing windows."
        },
        {
          "id": "Q-AEP-060",
          "question": "What is the consequence if an employer consistently disburses payroll 5 days after the scheduled payday established in the employee handbook?",
          "options": [
            "The employer is eligible for a federal tax credit",
            "The employer violates state timely wage payment statutes, incurring statutory interest, waiting time penalties, and potential labor board sanctions",
            "Employees are exempt from paying federal income taxes",
            "The payroll schedule automatically shifts to monthly"
          ],
          "correctAnswer": 1,
          "explanation": "State prompt payment statutes strictly enforce adherence to established paydays, penalizing delinquent employers with daily wage penalties."
        }
      ]
    }
  ]
};
