export const phase2 = {
  "chapters": [
    {
      "id": "CH-AEP-007",
      "courseId": "CRS-AEP-001",
      "title": "Gross-to-Net Engine Mechanics: Calculating Gross Pay, Taxable Wages & Net Remittance",
      "description": "Deconstruct the internal architecture of gross-to-net payroll computation engines: waterfall deduction sequencing, taxable wage base isolation, and precision rounding rules.",
      "order": 7,
      "duration": "65 mins",
      "videoUrl": "https://www.youtube.com/embed/n3bNqXwFfio",
      "content": "\n        <div class=\"space-y-6\">\n          <p class=\"text-gray-300 leading-relaxed text-lg\">\n            At the heart of every enterprise payroll system—from enterprise ERPs like SAP and Workday to specialized payroll platforms like ADP and UKG—lies the <strong>Gross-to-Net Calculation Engine</strong>. While conceptually straightforward, the computational mechanics require a strict waterfall sequence. An error in deduction ordering or taxable wage base determination propagates instantly into tax underwithholding, regulatory non-compliance, and balance sheet reconciliation discrepancies.\n          </p>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">1. The Gross-to-Net Computational Waterfall</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Statutory authorities mandate an exact mathematical sequence when processing earnings and deductions:\n          </p>\n          <div class=\"bg-gray-900 p-4 rounded-xl border border-gray-700 font-mono text-sm text-gray-300 space-y-3\">\n            <div><strong class=\"text-blue-400\">Step 1: Total Gross Pay</strong> = Regular Salary/Wages + Overtime Premiums + Commissions + Bonuses + Shift Differentials + Imputed Income</div>\n            <div><strong class=\"text-emerald-400\">Step 2: Pre-Tax Deductions</strong> = Section 125 (Medical, Dental, Vision) + HSA + FSA + Traditional 401(k) / 403(b)</div>\n            <div><strong class=\"text-purple-400\">Step 3: Taxable Wage Determination</strong> =\n              <div class=\"pl-4 text-gray-400\">\n                • FIT Taxable Wages = Gross - Section 125 - 401(k) - HSA/FSA<br/>\n                • FICA Taxable Wages = Gross - Section 125 - HSA/FSA (Note: 401(k) is NOT exempt from FICA)<br/>\n                • FUTA/SUTA Taxable Wages = Gross - Section 125\n              </div>\n            </div>\n            <div><strong class=\"text-amber-400\">Step 4: Statutory Tax Withholding</strong> = Federal Income Tax (FIT) + Social Security (OASDI) + Medicare + State (SIT) + Local (LIT)</div>\n            <div><strong class=\"text-rose-400\">Step 5: Disposable Earnings Calculation</strong> = Gross Pay - Mandatory Statutory Taxes (Used for CCPA Garnishment Limits)</div>\n            <div><strong class=\"text-indigo-400\">Step 6: Post-Tax Deductions</strong> = Statutory Garnishments + Roth 401(k) + Voluntary Life Insurance + Union Dues</div>\n            <div class=\"text-emerald-300 pt-2 border-t border-gray-800 font-bold\">Step 7: Net Pay Remittance = Taxable Wages - Statutory Taxes - Post-Tax Deductions</div>\n          </div>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">2. Divergence in Taxable Wage Bases</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            A critical responsibility of the payroll accountant is recognizing that \"Gross Pay\" does not equal \"Taxable Wages\". Different statutory programs have conflicting deduction exemptions:\n          </p>\n          <div class=\"overflow-x-auto my-4\">\n            <table class=\"w-full text-left border-collapse border border-gray-700\">\n              <thead>\n                <tr class=\"bg-gray-800 text-gray-200\">\n                  <th class=\"p-3 border border-gray-700\">Deduction Type</th>\n                  <th class=\"p-3 border border-gray-700\">Federal Income Tax (FIT)</th>\n                  <th class=\"p-3 border border-gray-700\">FICA (Social Security & Medicare)</th>\n                  <th class=\"p-3 border border-gray-700\">FUTA (Federal Unemployment)</th>\n                </tr>\n              </thead>\n              <tbody class=\"text-gray-300 text-sm\">\n                <tr class=\"border-b border-gray-800\">\n                  <td class=\"p-3 font-semibold text-emerald-400\">Section 125 Health/Dental/Vision</td>\n                  <td class=\"p-3 text-emerald-400 font-bold\">EXEMPT</td>\n                  <td class=\"p-3 text-emerald-400 font-bold\">EXEMPT</td>\n                  <td class=\"p-3 text-emerald-400 font-bold\">EXEMPT</td>\n                </tr>\n                <tr class=\"border-b border-gray-800 bg-gray-800/30\">\n                  <td class=\"p-3 font-semibold text-blue-400\">Traditional 401(k) Deferral</td>\n                  <td class=\"p-3 text-emerald-400 font-bold\">EXEMPT</td>\n                  <td class=\"p-3 text-rose-400 font-bold\">TAXABLE (Subject to FICA)</td>\n                  <td class=\"p-3 text-emerald-400 font-bold\">EXEMPT</td>\n                </tr>\n                <tr class=\"border-b border-gray-800\">\n                  <td class=\"p-3 font-semibold text-purple-400\">Health Savings Account (HSA)</td>\n                  <td class=\"p-3 text-emerald-400 font-bold\">EXEMPT</td>\n                  <td class=\"p-3 text-emerald-400 font-bold\">EXEMPT (via Cafeteria Plan)</td>\n                  <td class=\"p-3 text-emerald-400 font-bold\">EXEMPT</td>\n                </tr>\n                <tr>\n                  <td class=\"p-3 font-semibold text-amber-400\">Roth 401(k) Contribution</td>\n                  <td class=\"p-3 text-rose-400 font-bold\">TAXABLE</td>\n                  <td class=\"p-3 text-rose-400 font-bold\">TAXABLE</td>\n                  <td class=\"p-3 text-rose-400 font-bold\">TAXABLE</td>\n                </tr>\n              </tbody>\n            </table>\n          </div>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">3. Precision Rounding & Truncation Standards</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Payroll engines must adhere strictly to IEEE 754 financial arithmetic specifications: calculation of intermediate tax rates must maintain precision to at least 5 decimal places, rounding to the nearest integer cent ($0.005 rounds up to $0.01) only at the final disbursement and tax liability aggregation layers.\n          </p>\n        </div>\n      "
    },
    {
      "id": "CH-AEP-008",
      "courseId": "CRS-AEP-001",
      "title": "Pre-Tax Deductions: Section 125 Cafeteria Plans, Traditional 401(k), HSA, and FSA Limits",
      "description": "Analyze IRS Section 125 regulations, qualified benefit elections, annual contribution limits (401k, HSA, FSA), nondiscrimination testing (NDT), and qualifying life events (QLE).",
      "order": 8,
      "duration": "65 mins",
      "videoUrl": "https://www.youtube.com/embed/Vb1-yE6vA3Q",
      "content": "\n        <div class=\"space-y-6\">\n          <p class=\"text-gray-300 leading-relaxed text-lg\">\n            Pre-tax benefit programs offer tremendous financial advantages: employees reduce their taxable income, while employers reduce their statutory payroll tax obligations (saving 7.65% in employer FICA on Section 125 contributions). However, operating Section 125 Cafeteria Plans requires uncompromising compliance with IRS code, strict annual contribution ceilings, irrevocable election rules, and annual nondiscrimination testing.\n          </p>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">1. Section 125 Cafeteria Plan Core Principles</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Under the \"Doctrine of Constructive Receipt,\" an employee is taxable on income they have the unrestricted power to receive in cash. Section 125 of the Internal Revenue Code provides a statutory exemption, allowing employees to elect between cash compensation and qualified non-taxable benefits:\n          </p>\n          <ul class=\"list-disc pl-6 text-gray-300 space-y-2\">\n            <li><strong class=\"text-white\">Irrevocability Rule:</strong> Benefit elections made during annual Open Enrollment cannot be altered during the plan year unless the employee experiences a certified <strong>Qualifying Life Event (QLE)</strong> (e.g., marriage, divorce, birth of child, loss of spouse's coverage).</li>\n            <li><strong class=\"text-white\">Premium-Only Plans (POP):</strong> The most common cafeteria plan tier, allowing employees to pay their portion of employer-sponsored group health, dental, and vision insurance with pre-tax dollars.</li>\n            <li><strong class=\"text-white\">Flexible Spending Accounts (FSA):</strong> Healthcare and Dependent Care accounts funded via pre-tax deductions subject to the statutory <strong>Use-It-or-Lose-It</strong> rule (mitigated either by a 2.5-month grace period or a statutory carryover limit).</li>\n          </ul>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">2. Health Savings Accounts (HSA) vs. Healthcare FSAs</h3>\n          <div class=\"overflow-x-auto my-4\">\n            <table class=\"w-full text-left border-collapse border border-gray-700\">\n              <thead>\n                <tr class=\"bg-gray-800 text-gray-200\">\n                  <th class=\"p-3 border border-gray-700\">Feature</th>\n                  <th class=\"p-3 border border-gray-700\">Health Savings Account (HSA)</th>\n                  <th class=\"p-3 border border-gray-700\">Healthcare Flexible Spending Account (FSA)</th>\n                </tr>\n              </thead>\n              <tbody class=\"text-gray-300 text-sm\">\n                <tr class=\"border-b border-gray-800\">\n                  <td class=\"p-3 font-semibold text-blue-400\">Prerequisite Health Plan</td>\n                  <td class=\"p-3\">High Deductible Health Plan (HDHP) only.</td>\n                  <td class=\"p-3\">Any health plan (or no health plan).</td>\n                </tr>\n                <tr class=\"border-b border-gray-800 bg-gray-800/30\">\n                  <td class=\"p-3 font-semibold text-emerald-400\">Ownership & Portability</td>\n                  <td class=\"p-3\">Owned by employee; 100% portable upon job departure.</td>\n                  <td class=\"p-3\">Owned by employer; unused funds forfeited upon separation.</td>\n                </tr>\n                <tr class=\"border-b border-gray-800\">\n                  <td class=\"p-3 font-semibold text-purple-400\">Rollover / Forfeiture</td>\n                  <td class=\"p-3\">Funds roll over indefinitely; never forfeited.</td>\n                  <td class=\"p-3\">Use-it-or-lose-it (subject to statutory carryover cap or grace period).</td>\n                </tr>\n                <tr>\n                  <td class=\"p-3 font-semibold text-amber-400\">Election Changes</td>\n                  <td class=\"p-3\">Employee can adjust monthly contribution at any time.</td>\n                  <td class=\"p-3\">Locked for plan year unless verified QLE occurs.</td>\n                </tr>\n              </tbody>\n            </table>\n          </div>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">3. Traditional 401(k) / 403(b) Retirement Limits</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Employee elective salary deferrals are subject to statutory annual maximums governed by IRC Section 402(g). Payroll engines must implement automated cumulative stop-caps: once an employee's year-to-date 401(k) deferrals reach the statutory maximum, elective deductions must automatically terminate, preventing costly corrective distributions and plan disqualification. Catch-up contributions are permitted for participants age 50 and older.\n          </p>\n        </div>\n      "
    },
    {
      "id": "CH-AEP-009",
      "courseId": "CRS-AEP-001",
      "title": "Post-Tax Deductions: Roth 401(k), Union Dues, Charitable Contributions & Wage Garnishments",
      "description": "Distinguish post-tax voluntary deductions from pre-tax shelters, Roth 401(k) accounting mechanics, union dues collective bargaining agreements (CBAs), and voluntary payroll allotments.",
      "order": 9,
      "duration": "60 mins",
      "videoUrl": "https://www.youtube.com/embed/5U7yZ8n7m88",
      "content": "\n        <div class=\"space-y-6\">\n          <p class=\"text-gray-300 leading-relaxed text-lg\">\n            Post-tax deductions represent voluntary or legally mandated withholding taken from an employee's compensation <strong>after</strong> all federal, state, and local taxes have been computed and withheld. Because post-tax deductions do not reduce taxable wages, they do not lower current income or payroll tax liabilities for either the employee or the employer.\n          </p>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">1. Roth 401(k) Accounting & Administration</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            A Roth 401(k) combines features of traditional 401(k) plans with Roth IRAs:\n          </p>\n          <div class=\"grid grid-cols-1 md:grid-cols-2 gap-4 my-4\">\n            <div class=\"bg-gray-800/60 p-4 rounded-xl border border-gray-700/60\">\n              <h4 class=\"font-bold text-blue-400 mb-2\">Contribution Mechanics</h4>\n              <p class=\"text-gray-300 text-sm\">Contributions are deducted from post-tax net wages. The employee receives zero immediate tax deduction. However, qualified distributions in retirement (including investment growth) are 100% tax-free.</p>\n            </div>\n            <div class=\"bg-gray-800/60 p-4 rounded-xl border border-gray-700/60\">\n              <h4 class=\"font-bold text-emerald-400 mb-2\">Shared 402(g) Statutory Cap</h4>\n              <p class=\"text-gray-300 text-sm\">Roth 401(k) and Traditional 401(k) deferrals share the identical annual elective deferral limit. An employee can split contributions (e.g., $10k Traditional + $13k Roth), but the combined total cannot exceed the annual IRC limit.</p>\n            </div>\n          </div>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">2. Union Dues & Dues Check-Off Authorizations</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            In unionized workplaces governed by Collective Bargaining Agreements (CBAs):\n          </p>\n          <ul class=\"list-disc pl-6 text-gray-300 space-y-2\">\n            <li><strong class=\"text-white\">Dues Check-Off:</strong> Under Section 302(c)(4) of the Labor Management Relations Act (Taft-Hartley), an employer can deduct union dues from an employee's wages only upon receiving a signed, written authorization card from the employee.</li>\n            <li><strong class=\"text-white\">Right-to-Work Laws:</strong> In states with Right-to-Work statutes, employees cannot be compelled to join a union or pay agency fees as a condition of employment.</li>\n            <li><strong class=\"text-white\">Remittance Deadlines:</strong> CBAs stipulate strict monthly remittance windows to the union local, backed by contractual interest penalties for late disbursement.</li>\n          </ul>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">3. Other Voluntary Post-Tax Allotments</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Common voluntary post-tax deductions include:\n          </p>\n          <ul class=\"list-disc pl-6 text-gray-300 space-y-2\">\n            <li><strong class=\"text-white\">529 College Savings Plans:</strong> Direct payroll routing into state-sponsored educational investment accounts.</li>\n            <li><strong class=\"text-white\">Voluntary Supplemental Life Insurance:</strong> Coverage amounts exceeding basic employer-provided group term life thresholds.</li>\n            <li><strong class=\"text-white\">Employee Stock Purchase Plans (ESPP):</strong> Post-tax payroll deductions accumulated over an offering period to purchase company equity at a discounted price.</li>\n          </ul>\n        </div>\n      "
    },
    {
      "id": "CH-AEP-010",
      "courseId": "CRS-AEP-001",
      "title": "Statutory Wage Garnishments: Child Support, Tax Levies, Student Loans, and Disposable Earnings Caps (CCPA)",
      "description": "Master statutory garnishment priorities, the Consumer Credit Protection Act (CCPA) disposable earnings formula, multiple withholding orders, administrative fees, and penalties for illegal termination.",
      "order": 10,
      "duration": "65 mins",
      "videoUrl": "https://www.youtube.com/embed/5a22Vz9e9-Y",
      "content": "\n        <div class=\"space-y-6\">\n          <p class=\"text-gray-300 leading-relaxed text-lg\">\n            Wage garnishments represent legally binding court or administrative orders compelling an employer to withhold a portion of an employee's earnings to satisfy an outstanding legal debt. Employers that fail to honor garnishment orders or remit withheld funds within statutory timelines can be held personally liable for the employee's entire judgment debt, plus legal fees and court contempt sanctions.\n          </p>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">1. Consumer Credit Protection Act (CCPA) Disposable Earnings</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Under Title III of the CCPA, garnishments cannot be calculated from total gross wages; they must be computed strictly from <strong>Disposable Earnings</strong>:\n          </p>\n          <div class=\"bg-gray-900 p-4 rounded-xl border border-gray-700 font-mono text-sm text-gray-300 space-y-2\">\n            <div><strong>Disposable Earnings</strong> = Gross Pay - Mandatory Statutory Taxes (FIT, FICA, SIT, LIT, Statutory State Disability)</div>\n            <div class=\"text-rose-400 mt-2\">Note: Voluntary deductions (401k, health insurance, union dues) do NOT reduce disposable earnings under the CCPA!</div>\n          </div>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">2. Statutory Garnishment Priority Hierarchy</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            When an employee has multiple competing garnishment orders that exceed maximum statutory limits, federal and state laws dictate the exact order of precedence:\n          </p>\n          <div class=\"overflow-x-auto my-4\">\n            <table class=\"w-full text-left border-collapse border border-gray-700\">\n              <thead>\n                <tr class=\"bg-gray-800 text-gray-200\">\n                  <th class=\"p-3 border border-gray-700\">Priority</th>\n                  <th class=\"p-3 border border-gray-700\">Garnishment Type</th>\n                  <th class=\"p-3 border border-gray-700\">Federal Maximum Withholding Limit</th>\n                </tr>\n              </thead>\n              <tbody class=\"text-gray-300 text-sm\">\n                <tr class=\"border-b border-gray-800\">\n                  <td class=\"p-3 font-bold text-rose-400\">1. Absolute Top Priority</td>\n                  <td class=\"p-3 font-semibold text-white\">Child Support / Spousal Maintenance (IV-D)</td>\n                  <td class=\"p-3\">50% to 65% of disposable earnings (50% if supporting second family; 60% if single; +5% if &gt; 12 weeks in arrears).</td>\n                </tr>\n                <tr class=\"border-b border-gray-800 bg-gray-800/30\">\n                  <td class=\"p-3 font-bold text-amber-400\">2. Second Priority</td>\n                  <td class=\"p-3 font-semibold text-white\">Federal Bankruptcy Court Orders (Chapter 13)</td>\n                  <td class=\"p-3\">Specified dollar amount determined directly by the federal bankruptcy trustee.</td>\n                </tr>\n                <tr class=\"border-b border-gray-800\">\n                  <td class=\"p-3 font-bold text-blue-400\">3. Third Priority</td>\n                  <td class=\"p-3 font-semibold text-white\">Federal Tax Levies (IRS Form 668-W)</td>\n                  <td class=\"p-3\">Everything above the IRS Standard Deduction / personal exemption table (Publication 1494).</td>\n                </tr>\n                <tr class=\"border-b border-gray-800 bg-gray-800/30\">\n                  <td class=\"p-3 font-bold text-purple-400\">4. Fourth Priority</td>\n                  <td class=\"p-3 font-semibold text-white\">Federal Student Loans (AWG) & State Tax Levies</td>\n                  <td class=\"p-3\">15% of disposable earnings for student loans; state limits vary.</td>\n                </tr>\n                <tr>\n                  <td class=\"p-3 font-bold text-gray-400\">5. Lowest Priority</td>\n                  <td class=\"p-3 font-semibold text-white\">Creditor Garnishments (Consumer Judgments)</td>\n                  <td class=\"p-3\">Lesser of 25% of disposable earnings OR amount by which weekly disposable earnings exceed 30x federal minimum wage ($217.50).</td>\n                </tr>\n              </tbody>\n            </table>\n          </div>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">3. Anti-Retaliation Protections (CCPA Section 304)</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Federal law strictly prohibits an employer from discharging an employee because their earnings have been subjected to garnishment for <strong>any one indebtedness</strong>. Violating this provision exposes the employer to criminal prosecution, fines up to $1,000, imprisonment, and mandatory reinstatement with back pay.\n          </p>\n        </div>\n      "
    },
    {
      "id": "CH-AEP-011",
      "courseId": "CRS-AEP-001",
      "title": "Supplemental Wages, Fringe Benefits, Imputed Income & Group Term Life Insurance (GTL)",
      "description": "Payroll tax mechanics for supplemental wages (aggregate vs. flat percentage), taxable fringe benefits, IRS Section 79 Table I Group Term Life Insurance calculations, and relocation expense taxation.",
      "order": 11,
      "duration": "65 mins",
      "videoUrl": "https://www.youtube.com/embed/q_2iF6w-9Z0",
      "content": "\n        <div class=\"space-y-6\">\n          <p class=\"text-gray-300 leading-relaxed text-lg\">\n            Supplemental wages represent all compensation paid to an employee that does not constitute regular wages for the pay period: bonuses, commissions, severance, equity grants, retroactive pay increases, and taxable fringe benefits. The Internal Revenue Service mandates strict withholding protocols for supplemental wages to prevent year-end tax underpayment.\n          </p>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">1. Federal Income Tax Withholding on Supplemental Wages</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Employers must choose between two statutory methods when withholding FIT from supplemental wages:\n          </p>\n          <div class=\"grid grid-cols-1 md:grid-cols-2 gap-4 my-4\">\n            <div class=\"bg-gray-800/60 p-4 rounded-xl border border-gray-700/60\">\n              <h4 class=\"font-bold text-blue-400 mb-2\">Optional Flat Rate Method (22%)</h4>\n              <p class=\"text-gray-300 text-sm\">For supplemental wages up to $1,000,000 in a calendar year, the employer can withhold a flat <strong>22%</strong> for federal income tax, provided the employee's regular wages were subjected to standard withholding in the current or preceding pay period.</p>\n            </div>\n            <div class=\"bg-gray-800/60 p-4 rounded-xl border border-gray-700/60\">\n              <h4 class=\"font-bold text-rose-400 mb-2\">Mandatory High-Income Rate (37%)</h4>\n              <p class=\"text-gray-300 text-sm\">To the extent an employee's cumulative supplemental wages exceed <strong>$1,000,000</strong> during the calendar year, the excess must be withheld at the maximum statutory individual tax rate: currently <strong>37%</strong>, with zero exceptions.</p>\n            </div>\n          </div>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">2. Section 79: Group-Term Life Insurance (GTL) Imputed Income</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Under IRC Section 79, an employer may provide up to <strong>$50,000 of group-term life insurance coverage</strong> tax-free. If coverage exceeds $50,000, the cost of the excess coverage (less any employee post-tax contribution) must be calculated using <strong>IRS Table I uniform premium rates</strong> and added to gross pay as taxable imputed income:\n          </p>\n          <div class=\"bg-gray-900 p-4 rounded-xl border border-gray-700 font-mono text-sm text-gray-300 space-y-2\">\n            <div><strong>Taxable Coverage Base</strong> = Total Life Insurance Face Value - $50,000 Statutory Exclusion</div>\n            <div><strong>Monthly Imputed Income</strong> = (Taxable Coverage Base / $1,000) × IRS Table I Age-Bracket Monthly Rate</div>\n            <div class=\"text-amber-400 mt-2\">Tax Treatment: Subject to Social Security & Medicare (FICA); Exempt from Federal Income Tax withholding (reported on Form W-2 Boxes 1, 3, 5, and 12 Code C).</div>\n          </div>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">3. Personal Use of Company Vehicles & Moving Expenses</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Under IRS guidelines, personal commuting in an employer-provided vehicle is a taxable fringe benefit (calculated using the Cents-per-Mile Rule, Commuting Value Rule [$1.50 per one-way trip], or Annual Lease Value Table). Under the Tax Cuts and Jobs Act (TCJA), employer-paid moving and relocation expenses are 100% taxable as supplemental wages.\n          </p>\n        </div>\n      "
    },
    {
      "id": "CH-AEP-012",
      "courseId": "CRS-AEP-001",
      "title": "Final Paychecks, Severance Calculations, Accrued PTO Payouts & Involuntary Termination Laws",
      "description": "Master final pay timing rules across strict jurisdictions (California Labor Code 201/203 waiting time penalties), severance agreement releases under OWBPA, and garnishment priority upon separation.",
      "order": 12,
      "duration": "65 mins",
      "videoUrl": "https://www.youtube.com/embed/H3Z8J0b9X7E",
      "content": "\n        <div class=\"space-y-6\">\n          <p class=\"text-gray-300 leading-relaxed text-lg\">\n            Employee separations—whether voluntary resignations, performance terminations, or mass workforce reductions—carry the highest immediate legal liability in the entire payroll lifecycle. State labor codes enforce unforgiving deadlines for delivering final paychecks, backed by severe waiting time penalties. A one-day delay in issuing a final check can wipe out thousands of dollars in corporate earnings through statutory employee penalties.\n          </p>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">1. State Final Pay Timing Mandates</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Final pay timing is strictly dictated by state law, differentiating between voluntary and involuntary separations:\n          </p>\n          <div class=\"overflow-x-auto my-4\">\n            <table class=\"w-full text-left border-collapse border border-gray-700\">\n              <thead>\n                <tr class=\"bg-gray-800 text-gray-200\">\n                  <th class=\"p-3 border border-gray-700\">State / Jurisdiction</th>\n                  <th class=\"p-3 border border-gray-700\">Involuntary Termination (Discharged/Fired)</th>\n                  <th class=\"p-3 border border-gray-700\">Voluntary Resignation (Quit)</th>\n                </tr>\n              </thead>\n              <tbody class=\"text-gray-300 text-sm\">\n                <tr class=\"border-b border-gray-800\">\n                  <td class=\"p-3 font-semibold text-rose-400\">California (Labor Code 201/202)</td>\n                  <td class=\"p-3 font-bold text-rose-400\">IMMEDIATELY at the time and place of termination.</td>\n                  <td class=\"p-3\">Within 72 hours, or immediately at time of quitting if 72 hours prior notice was given.</td>\n                </tr>\n                <tr class=\"border-b border-gray-800 bg-gray-800/30\">\n                  <td class=\"p-3 font-semibold text-blue-400\">New York (Labor Law § 191)</td>\n                  <td class=\"p-3\">By the regular payday for the pay period in which separation occurred.</td>\n                  <td class=\"p-3\">By the regular scheduled payday.</td>\n                </tr>\n                <tr class=\"border-b border-gray-800\">\n                  <td class=\"p-3 font-semibold text-purple-400\">Texas (Labor Code § 61.014)</td>\n                  <td class=\"p-3\">Within 6 calendar days of discharge.</td>\n                  <td class=\"p-3\">By the next scheduled regular payday.</td>\n                </tr>\n                <tr>\n                  <td class=\"p-3 font-semibold text-amber-400\">Colorado</td>\n                  <td class=\"p-3\">Immediately upon discharge (or within 6 hours if payroll is offsite).</td>\n                  <td class=\"p-3\">By the next scheduled regular payday.</td>\n                </tr>\n              </tbody>\n            </table>\n          </div>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">2. California Labor Code 203 Waiting Time Penalties</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Under California Labor Code Section 203, if an employer willfully fails to pay all earned wages (including accrued, unused vacation) within statutory deadlines, the employee's wages continue as a penalty at the same daily rate until paid, <strong>up to a maximum of 30 calendar days</strong>:\n          </p>\n          <div class=\"bg-gray-800/60 p-4 rounded-xl border border-gray-700/60 my-4 text-sm text-gray-300 space-y-2\">\n            <div><strong class=\"text-white\">Example Calculation:</strong> An employee earning $30/hr ($240/day) is fired, and their final check is delayed by 10 days.</div>\n            <div class=\"text-rose-400 font-mono\">Waiting Time Penalty = 10 days × $240/day = $2,400 in direct statutory penalties owed to the employee!</div>\n          </div>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">3. Severance Agreements & OWBPA Compliance</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Under the Older Workers Benefit Protection Act (OWBPA), when offering severance in exchange for a legal release of age discrimination claims to workers age 40 and older:\n          </p>\n          <ul class=\"list-disc pl-6 text-gray-300 space-y-2\">\n            <li><strong class=\"text-white\">Review Period:</strong> The employee must be given at least <strong>21 days</strong> to consider individual agreements (or <strong>45 days</strong> for group terminations/layoffs).</li>\n            <li><strong class=\"text-white\">Revocation Window:</strong> The employee has an irrevocable statutory right to revoke the agreement within <strong>7 days</strong> after signing. Severance payments must NEVER be disbursed before the 7-day revocation window has expired!</li>\n          </ul>\n        </div>\n      "
    }
  ],
  "assessments": [
    {
      "id": "ASM-AEP-007",
      "courseId": "CRS-AEP-001",
      "chapterId": "CH-AEP-007",
      "title": "Assessment: Gross-to-Net Engine Mechanics",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-AEP-061",
          "question": "In the standard gross-to-net waterfall, which deduction is subtracted first to determine Federal Income Tax (FIT) taxable wages?",
          "options": [
            "Roth 401(k) post-tax contribution",
            "Pre-tax deductions under Section 125 (health insurance) and traditional 401(k)",
            "Court-ordered child support wage garnishment",
            "Charitable United Way donation"
          ],
          "correctAnswer": 1,
          "explanation": "Pre-tax benefits under Section 125 and traditional 401(k) are subtracted from gross earnings first, forming the base for FIT calculation."
        },
        {
          "id": "Q-AEP-062",
          "question": "How does a Traditional 401(k) salary deferral differ in taxability from a Section 125 medical premium deduction?",
          "options": [
            "Traditional 401(k) is exempt from all taxes including Social Security",
            "Section 125 is exempt from both FIT and FICA, whereas Traditional 401(k) deferrals are exempt from FIT but remain fully subject to FICA (Social Security & Medicare)",
            "Section 125 is taxable for state income tax purposes in all 50 states",
            "Traditional 401(k) cannot be deducted from gross pay"
          ],
          "correctAnswer": 1,
          "explanation": "Retirement deferrals (401k) shield wages from income taxes only; FICA taxes (7.65%) must still be paid on 401(k) deferrals."
        },
        {
          "id": "Q-AEP-063",
          "question": "What is 'Disposable Earnings' in payroll engine architecture, and why is it specifically calculated?",
          "options": [
            "Earnings spent on disposable office supplies",
            "Gross earnings minus only legally mandated taxes; it forms the legal statutory limit for CCPA wage garnishments",
            "The net pay remaining after all 401k and voluntary deductions are taken",
            "Overtime premiums paid in cash"
          ],
          "correctAnswer": 1,
          "explanation": "Under the CCPA, disposable earnings equals gross minus mandatory statutory taxes, serving as the benchmark for maximum garnishment limits."
        },
        {
          "id": "Q-AEP-064",
          "question": "If an employee has insufficient net pay to cover all deductions, which deduction category takes priority over voluntary benefits?",
          "options": [
            "Gym membership post-tax payroll allotment",
            "Statutory taxes (FIT, FICA, SIT) followed by mandatory court-ordered child support and tax levies",
            "Voluntary 529 college savings contributions",
            "Company store merchandise purchases"
          ],
          "correctAnswer": 1,
          "explanation": "Statutory taxes and legal garnishments have mandatory legal priority over all voluntary employee benefit allotments."
        },
        {
          "id": "Q-AEP-065",
          "question": "An employee has $4,000 in gross pay, $300 in Section 125 health insurance, and $200 in Traditional 401(k). What are their FICA taxable wages?",
          "options": [
            "$4,000",
            "$3,700 ($4,000 - $300 Section 125)",
            "$3,500 ($4,000 - $300 - $200)",
            "$3,800"
          ],
          "correctAnswer": 1,
          "explanation": "Section 125 reduces FICA wages ($4,000 - $300 = $3,700). Traditional 401(k) deferrals are not exempt from FICA."
        },
        {
          "id": "Q-AEP-066",
          "question": "Using the same numbers from the previous question ($4,000 gross, $300 Section 125, $200 401k), what are the employee's FIT taxable wages?",
          "options": [
            "$4,000",
            "$3,700",
            "$3,500 ($4,000 - $300 - $200)",
            "$3,800"
          ],
          "correctAnswer": 2,
          "explanation": "Both Section 125 and Traditional 401(k) deferrals reduce FIT taxable wages, giving $4,000 - $500 = $3,500."
        },
        {
          "id": "Q-AEP-067",
          "question": "Why must financial rounding in payroll software occur only at the final disbursement stage rather than during intermediate step percentages?",
          "options": [
            "Intermediate rounding is illegal under federal criminal statutes",
            "Premature intermediate rounding accumulates penny variances across thousands of employees, throwing general ledger accounts and tax agency remittances out of balance",
            "Modern computers cannot round floating point numbers",
            "Banks reject ACH files that contain decimals"
          ],
          "correctAnswer": 1,
          "explanation": "Cumulative rounding errors distort tax liabilities; IEEE 754 financial standards require high-precision intermediate calculations rounded at the end."
        },
        {
          "id": "Q-AEP-068",
          "question": "What is the consequence if a payroll engine erroneously classifies a Roth 401(k) contribution as a pre-tax deduction?",
          "options": [
            "The employee receives a free vacation",
            "Federal and state income taxes will be underwithheld, creating tax underpayment liabilities, amended Form 941 filings, and W-2c corrections",
            "The 401(k) plan is immediately dissolved by the IRS",
            "The employer receives an automatic cash bonus"
          ],
          "correctAnswer": 1,
          "explanation": "Roth deferrals must be deducted from post-tax income; treating them as pre-tax leads to immediate statutory underwithholding."
        },
        {
          "id": "Q-AEP-069",
          "question": "What does the employer FICA tax match consist of?",
          "options": [
            "7.65% total: 6.2% for Social Security (up to annual cap) and 1.45% for Medicare (with no wage cap)",
            "10.0% flat tax on all payroll disbursements",
            "Matching only the employee's 401(k) deferral percentage",
            "2.9% Medicare tax only"
          ],
          "correctAnswer": 0,
          "explanation": "Employers must match employee FICA at 7.65% (6.2% OASDI up to the statutory wage ceiling and 1.45% Medicare on all wages)."
        },
        {
          "id": "Q-AEP-070",
          "question": "What is 'Negative Net Pay', and what causes it in an enterprise payroll cycle?",
          "options": [
            "Paying employees in foreign currencies",
            "A scenario where an employee's total mandatory taxes and deductions exceed their gross earnings for the pay period",
            "A fine assessed by credit bureaus against the company",
            "A salary bonus paid in stock options"
          ],
          "correctAnswer": 1,
          "explanation": "Negative net pay occurs when deductions exceed gross earnings (e.g., an employee on unpaid leave with active health insurance deductions)."
        }
      ]
    },
    {
      "id": "ASM-AEP-008",
      "courseId": "CRS-AEP-001",
      "chapterId": "CH-AEP-008",
      "title": "Assessment: Pre-Tax Deductions & Section 125 Cafeteria Plans",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-AEP-071",
          "question": "What is the 'Irrevocability Rule' governing Section 125 Cafeteria Plan benefit elections?",
          "options": [
            "Employees can never change their benefits for their entire working lifetime",
            "Elections made during annual open enrollment cannot be modified or cancelled during the plan year unless a certified Qualifying Life Event (QLE) occurs",
            "Employers cannot cancel insurance contracts with carriers",
            "Benefits are permanently linked to the employee's credit score"
          ],
          "correctAnswer": 1,
          "explanation": "Under IRS Section 125, pre-tax benefit elections are locked for the entire 12-month plan year unless a recognized life event changes eligibility."
        },
        {
          "id": "Q-AEP-072",
          "question": "Which of the following events constitutes a certified Qualifying Life Event (QLE) allowing a mid-year Section 125 election change?",
          "options": [
            "The employee decides they want to save more money for a vacation",
            "Marriage, divorce, birth or adoption of a child, or loss of coverage under a spouse's employment plan",
            "The employee receives a promotion with no change in compensation",
            "The employee's favorite sports team wins the championship"
          ],
          "correctAnswer": 1,
          "explanation": "QLEs are statutory changes in family status, legal marital status, or employment eligibility that alter healthcare coverage needs."
        },
        {
          "id": "Q-AEP-073",
          "question": "What is the primary operational difference between a Health Savings Account (HSA) and a Flexible Spending Account (FSA)?",
          "options": [
            "FSAs require an HDHP; HSAs do not",
            "HSA funds are owned by the employee and roll over indefinitely year-to-year; FSA funds are employer-owned and subject to use-it-or-lose-it forfeiture rules",
            "HSAs can only be used to pay for gym memberships",
            "FSAs earn taxable interest dividends"
          ],
          "correctAnswer": 1,
          "explanation": "HSAs are portable, employee-owned trust accounts with permanent rollover, whereas healthcare FSAs are subject to annual forfeiture provisions."
        },
        {
          "id": "Q-AEP-074",
          "question": "What financial incentive does an employer have to encourage employee participation in Section 125 pre-tax cafeteria plans?",
          "options": [
            "The IRS pays the employer a $100 cash bounty per participant",
            "Pre-tax Section 125 deductions reduce total wages subject to the employer's 7.65% FICA tax, saving the company money on employment taxes",
            "Insurance companies pay 50% kickbacks to the company general ledger",
            "It eliminates the need for company financial audits"
          ],
          "correctAnswer": 1,
          "explanation": "Every dollar deducted pre-tax under Section 125 saves the employer $0.0765 in employer matching FICA taxes."
        },
        {
          "id": "Q-AEP-075",
          "question": "What is the 'Uniform Coverage Rule' for Healthcare Flexible Spending Accounts (FSAs)?",
          "options": [
            "All employees must wear identical clothing in the office",
            "The full annual FSA election amount must be available for reimbursement to the employee on Day 1 of the plan year, regardless of year-to-date payroll contributions",
            "The employer must match every employee FSA contribution dollar-for-dollar",
            "FSA accounts can only be used to buy prescription eyeglasses"
          ],
          "correctAnswer": 1,
          "explanation": "The uniform coverage rule mandates that the employee can spend their entire annual elected healthcare FSA balance immediately, exposing employers to potential loss."
        },
        {
          "id": "Q-AEP-076",
          "question": "What happens when an employee's cumulative year-to-date 401(k) elective deferrals hit the statutory IRS Section 402(g) limit?",
          "options": [
            "The employee's paycheck is frozen until the following year",
            "The payroll engine must automatically stop deducting 401(k) salary deferrals for the remainder of that calendar year",
            "The employee is automatically switched to a Roth IRA",
            "The employer confiscates the excess contributions"
          ],
          "correctAnswer": 1,
          "explanation": "Automated hard-stop logic in payroll software caps elective deferrals at the statutory maximum to prevent excess contribution penalties."
        },
        {
          "id": "Q-AEP-077",
          "question": "What is 'Nondiscrimination Testing' (NDT) for Section 125 Cafeteria Plans?",
          "options": [
            "Ensuring job interviews do not ask discriminatory questions",
            "Statutory IRS tests (Eligibility, Benefits, and Key Employee Concentration tests) ensuring the plan does not disproportionately favor highly compensated or key employees",
            "A test of computer hardware compatibility",
            "An annual employee satisfaction survey"
          ],
          "correctAnswer": 1,
          "explanation": "NDT prevents corporate executives and highly compensated employees (HCEs) from using tax-sheltered benefit plans disproportionately to rank-and-file workers."
        },
        {
          "id": "Q-AEP-078",
          "question": "Can an employee contribute to both a standard Healthcare FSA and a Health Savings Account (HSA) in the same plan year?",
          "options": [
            "Yes, without any restrictions",
            "No, unless the FSA is specifically established as a 'Limited Purpose FSA' (restricted to vision and dental expenses only)",
            "Yes, provided they pay an IRS penalty tax",
            "Only if they work for a government agency"
          ],
          "correctAnswer": 1,
          "explanation": "General-purpose healthcare FSAs disqualify employees from making HSA contributions; only Limited Purpose FSAs (dental/vision) are compatible."
        },
        {
          "id": "Q-AEP-079",
          "question": "What is the statutory age threshold that permits employees to make additional 'Catch-Up' contributions to their traditional or Roth 401(k)?",
          "options": [
            "Age 35",
            "Age 50 and older by the end of the calendar year",
            "Age 65 only",
            "Age 70½"
          ],
          "correctAnswer": 1,
          "explanation": "Participants turning age 50 or older during the calendar year are permitted to defer additional catch-up dollars into qualified 401(k) accounts."
        },
        {
          "id": "Q-AEP-080",
          "question": "What is the 'Grace Period' rule permitted under IRS cafeteria plan regulations for unused FSA balances?",
          "options": [
            "A 30-day grace period to pay overdue payroll taxes",
            "An optional plan provision allowing employees an extra 2.5 months following the end of the plan year to incur eligible expenses using prior-year funds",
            "A rule allowing employees to forgive company debt",
            "A period where healthcare insurance premiums are free"
          ],
          "correctAnswer": 1,
          "explanation": "Employers may adopt either a 2.5-month grace period extension or a statutory rollover dollar carryover cap to mitigate FSA forfeiture."
        }
      ]
    },
    {
      "id": "ASM-AEP-009",
      "courseId": "CRS-AEP-001",
      "chapterId": "CH-AEP-009",
      "title": "Assessment: Post-Tax Deductions, Roth 401(k) & Allotments",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-AEP-081",
          "question": "How do post-tax deductions affect an employee's current calendar year Form W-2 Box 1 (Wages, tips, other compensation)?",
          "options": [
            "They reduce Box 1 taxable wages dollar-for-dollar",
            "They have zero impact on Box 1 wages; Box 1 reflects earnings before post-tax deductions are subtracted",
            "They increase Box 1 wages by 20%",
            "They eliminate all taxable income"
          ],
          "correctAnswer": 1,
          "explanation": "Post-tax deductions are taken from net pay after taxes; they do not reduce reportable taxable income on Form W-2."
        },
        {
          "id": "Q-AEP-082",
          "question": "What is the core tax advantage of electing a Roth 401(k) over a Traditional 401(k)?",
          "options": [
            "Immediate tax deductions in the year the contribution is made",
            "Tax-free withdrawals of both contributions and accumulated investment earnings in retirement after reaching age 59½ and satisfying the 5-year holding rule",
            "Exemption from state property taxes",
            "Automatic matching by the federal government"
          ],
          "correctAnswer": 1,
          "explanation": "Roth contributions are taxed upfront, allowing all future qualified retirement distributions to be withdrawn 100% tax-free."
        },
        {
          "id": "Q-AEP-083",
          "question": "Under the Taft-Hartley Act, what is legally required before an employer can deduct union dues from an employee's paycheck ('Dues Check-Off')?",
          "options": [
            "A verbal phone call from the union local president",
            "A signed, voluntary written dues check-off authorization card from the employee",
            "A mandatory court order signed by a federal judge",
            "Dues check-off is illegal under federal law"
          ],
          "correctAnswer": 1,
          "explanation": "LMRA Section 302(c)(4) strictly prohibits deducting union dues without an unrevoked, voluntary written authorization signed by the worker."
        },
        {
          "id": "Q-AEP-084",
          "question": "How do 'Right-to-Work' state statutes impact union dues payroll withholding?",
          "options": [
            "They mandate that all workers must pay union dues",
            "They prohibit agreements requiring employees to join a union or pay union dues/agency fees as a condition of obtaining or keeping employment",
            "They double the union dues deduction rate",
            "They require the state governor to sign all payroll checks"
          ],
          "correctAnswer": 1,
          "explanation": "In Right-to-Work states, workers cannot be compelled to pay union dues, making dues deduction entirely voluntary."
        },
        {
          "id": "Q-AEP-085",
          "question": "If an employee contributes to both a Traditional 401(k) and a Roth 401(k) within the same company during the year, what is their combined deferral limit?",
          "options": [
            "They can contribute double the annual limit ($23,000 to each)",
            "The combined total of Traditional and Roth deferrals cannot exceed the single annual IRC Section 402(g) elective deferral limit",
            "Roth contributions have no annual limit",
            "Traditional contributions must equal exactly 50% of Roth contributions"
          ],
          "correctAnswer": 1,
          "explanation": "Traditional and Roth 401(k) deferrals share the identical single statutory elective deferral ceiling."
        },
        {
          "id": "Q-AEP-086",
          "question": "What is an Employee Stock Purchase Plan (ESPP) payroll deduction?",
          "options": [
            "A mandatory tax paid to the New York Stock Exchange",
            "A voluntary post-tax payroll allotment accumulated over an offering period to purchase company common stock, often at a 5% to 15% discount",
            "Purchasing office equipment directly from company inventory",
            "A pre-tax medical benefit for stockbrokers"
          ],
          "correctAnswer": 1,
          "explanation": "ESPPs allow workers to designate post-tax wage deductions to purchase company shares at a discounted fair market value."
        },
        {
          "id": "Q-AEP-087",
          "question": "Are employee voluntary contributions to a 529 College Savings Plan exempt from federal income tax withholding at the time of payroll processing?",
          "options": [
            "Yes, 529 plans are pre-tax under Section 125",
            "No. 529 contributions are post-tax voluntary payroll allotments; federal tax benefits apply upon withdrawal for qualified educational expenses",
            "Yes, but only for employees with children in college",
            "Only in the state of California"
          ],
          "correctAnswer": 1,
          "explanation": "529 payroll deductions are post-tax; tax advantages occur as tax-free compounding growth and tax-free qualified educational withdrawals."
        },
        {
          "id": "Q-AEP-088",
          "question": "How should an employer treat voluntary post-tax deductions when calculating overtime Regular Rate of Pay (RROP)?",
          "options": [
            "Subtract voluntary deductions from total earnings before dividing by hours worked",
            "Voluntary post-tax deductions have no effect on RROP; RROP is calculated from total gross remuneration before any deductions are taken",
            "Add voluntary deductions twice to total pay",
            "Multiply voluntary deductions by 1.5"
          ],
          "correctAnswer": 1,
          "explanation": "Post-tax voluntary deductions do not reduce gross compensation when calculating the regular rate of pay for overtime."
        },
        {
          "id": "Q-AEP-089",
          "question": "What is the general tax treatment of employer matching contributions allocated to an employee's Roth 401(k) prior to SECURE Act 2.0 changes?",
          "options": [
            "Employer matches were always tax-free to the employee",
            "Employer matching contributions were required to be deposited into a pre-tax account (taxable to employee upon distribution)",
            "Employer matches were deducted from employee take-home pay",
            "Employers are legally forbidden from matching Roth contributions"
          ],
          "correctAnswer": 1,
          "explanation": "Traditionally, employer matching funds were placed in pre-tax accounts; SECURE 2.0 now allows employers to offer taxable Roth matching elections."
        },
        {
          "id": "Q-AEP-090",
          "question": "What document authorizes an employer to deduct court-ordered restitution or voluntary charitable contributions from an employee's pay?",
          "options": [
            "An anonymous sticky note left on the accountant's desk",
            "A signed, written payroll deduction authorization or a certified legal court judgment",
            "An oral agreement between two co-workers",
            "A promotional marketing flyer"
          ],
          "correctAnswer": 1,
          "explanation": "Labor statutes require written, signed authorization specifying the amount and purpose for all voluntary wage deductions."
        }
      ]
    },
    {
      "id": "ASM-AEP-010",
      "courseId": "CRS-AEP-001",
      "chapterId": "CH-AEP-010",
      "title": "Assessment: Statutory Wage Garnishments & CCPA Limits",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-AEP-091",
          "question": "Under Title III of the Consumer Credit Protection Act (CCPA), what is the maximum percentage of disposable earnings that can be garnished for ordinary consumer debt judgments?",
          "options": [
            "50%",
            "The lesser of 25% of disposable earnings OR the amount by which weekly disposable earnings exceed 30 times the federal minimum wage ($217.50)",
            "100% of all gross pay",
            "10% flat rate"
          ],
          "correctAnswer": 1,
          "explanation": "The CCPA caps consumer creditor garnishments at 25% of disposable earnings or the excess over 30x the federal minimum wage, protecting low earners."
        },
        {
          "id": "Q-AEP-092",
          "question": "What is the maximum CCPA garnishment percentage for child support if the employee is supporting a second spouse or dependent child and is NOT in arrears?",
          "options": [
            "25%",
            "50% of disposable earnings",
            "65% of disposable earnings",
            "15% of disposable earnings"
          ],
          "correctAnswer": 1,
          "explanation": "The CCPA allows garnishing up to 50% of disposable earnings for child support if the obligor is supporting another family."
        },
        {
          "id": "Q-AEP-093",
          "question": "What additional percentage is added to child support garnishment caps if the employee is more than 12 weeks in arrears?",
          "options": [
            "1%",
            "An additional 5% (raising the cap from 50% to 55%, or from 60% to 65%)",
            "15%",
            "Zero; arrears cannot be collected from wages"
          ],
          "correctAnswer": 1,
          "explanation": "If support payments are more than 12 weeks delinquent, the statutory CCPA limits increase by 5% (to 55% or 65%)."
        },
        {
          "id": "Q-AEP-094",
          "question": "When calculating 'Disposable Earnings' under the CCPA, which of the following is deducted from gross pay?",
          "options": [
            "Traditional 401(k) voluntary retirement contributions",
            "Mandatory statutory taxes only (Federal Income Tax, Social Security, Medicare, State and Local Income Taxes)",
            "Voluntary group health insurance premiums",
            "Union monthly membership dues"
          ],
          "correctAnswer": 1,
          "explanation": "Only legally required statutory taxes reduce gross earnings to establish disposable earnings under CCPA regulations."
        },
        {
          "id": "Q-AEP-095",
          "question": "An employer receives both a Child Support withholding order and a Creditor Judgment garnishment for the same employee. Which order has legal priority?",
          "options": [
            "The creditor garnishment because it was received first",
            "The child support order takes absolute legal priority over commercial creditor garnishments under federal law",
            "The employer splits the paycheck 50/50 between both orders",
            "The employee chooses which debt to pay"
          ],
          "correctAnswer": 1,
          "explanation": "Child support orders hold absolute top priority over general commercial creditor judgments and student loans."
        },
        {
          "id": "Q-AEP-096",
          "question": "What form does the IRS issue to levy an employee's wages for unpaid federal taxes?",
          "options": [
            "Form W-2",
            "Form 668-W (Notice of Levy on Wages, Salary, and Other Income)",
            "Form 1099-NEC",
            "Form 941"
          ],
          "correctAnswer": 1,
          "explanation": "IRS Form 668-W is the official administrative levy notice compelling employers to withhold wages until back taxes are satisfied."
        },
        {
          "id": "Q-AEP-097",
          "question": "How does an IRS federal tax levy determine how much money an employee is permitted to take home?",
          "options": [
            "The IRS permits the employee to keep 50% of their gross wages",
            "The IRS leaves the employee with an exempt amount based on filing status and standard deductions listed in IRS Publication 1494; all remaining earnings are remitted to the IRS",
            "The IRS seizes 100% of all wages, leaving $0 net pay",
            "The employer decides how much the employee needs"
          ],
          "correctAnswer": 1,
          "explanation": "IRS levies seize everything except a statutory exempt allowance determined by the employee's filing status in Publication 1494."
        },
        {
          "id": "Q-AEP-098",
          "question": "Under CCPA Section 304, can an employer fire an employee because their earnings have been garnished for a single debt?",
          "options": [
            "Yes, employers can fire employees for any reason at any time",
            "No. Federal law explicitly prohibits terminating an employee because their earnings have been subjected to garnishment for any single indebtedness",
            "Yes, but only if the debt exceeds $10,000",
            "Yes, if the employee is in their probationary period"
          ],
          "correctAnswer": 1,
          "explanation": "Terminating an employee due to garnishment for a single debt is a federal crime punishable by fines, imprisonment, and civil reinstatement."
        },
        {
          "id": "Q-AEP-099",
          "question": "Can an employer charge an administrative fee for processing an employee's wage garnishment?",
          "options": [
            "Never; administrative fees are illegal in all jurisdictions",
            "Yes, if authorized by state statute, the employer may deduct a statutory administrative fee (typically $1 to $5 per pay run) from the employee's wages",
            "Yes, up to 50% of the total garnishment amount",
            "The court pays the employer a $500 monthly processing grant"
          ],
          "correctAnswer": 1,
          "explanation": "Most states allow employers to deduct a modest statutory processing fee (e.g., $1-$5) to offset administrative bookkeeping overhead."
        },
        {
          "id": "Q-AEP-100",
          "question": "What is the legal consequence if an employer ignores a court child support withholding order and continues paying the employee full wages?",
          "options": [
            "The court will forgive the employee's debt",
            "The employer becomes directly liable for the full amount of child support not withheld, plus contempt of court sanctions and interest penalties",
            "The employee's wages are permanently exempt from future garnishments",
            "The employer is awarded a legal indemnity certificate"
          ],
          "correctAnswer": 1,
          "explanation": "Employers that fail to comply with valid withholding orders face direct judgment liability for the unwithheld child support amounts."
        }
      ]
    },
    {
      "id": "ASM-AEP-011",
      "courseId": "CRS-AEP-001",
      "chapterId": "CH-AEP-011",
      "title": "Assessment: Supplemental Wages, Fringe Benefits & GTL Imputed Income",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-AEP-101",
          "question": "Under IRS guidelines, what is the optional flat rate withholding percentage for supplemental wages up to $1,000,000 in a calendar year?",
          "options": [
            "10%",
            "22%",
            "35%",
            "50%"
          ],
          "correctAnswer": 1,
          "explanation": "Under current tax regulations, employers may use a flat 22% rate to withhold federal income taxes on supplemental wages up to $1M."
        },
        {
          "id": "Q-AEP-102",
          "question": "What is the mandatory federal income tax withholding rate on supplemental wage payments exceeding $1,000,000 in a calendar year?",
          "options": [
            "22%",
            "37% (the highest statutory marginal individual income tax rate)",
            "45%",
            "Withholding is optional above $1,000,000"
          ],
          "correctAnswer": 1,
          "explanation": "Cumulative supplemental wages exceeding $1M must be withheld at the maximum federal individual rate: currently 37%."
        },
        {
          "id": "Q-AEP-103",
          "question": "Under IRC Section 79, what is the maximum amount of employer-provided group-term life insurance (GTL) that can be provided to an employee tax-free?",
          "options": [
            "$10,000",
            "$50,000 of coverage",
            "$100,000 of coverage",
            "Unlimited coverage is always tax-free"
          ],
          "correctAnswer": 1,
          "explanation": "IRC Section 79 excludes the cost of the first $50,000 of employer-provided group-term life insurance from taxable income."
        },
        {
          "id": "Q-AEP-104",
          "question": "An employee has $120,000 in employer-paid group-term life insurance. On what face amount must imputed income be calculated?",
          "options": [
            "$120,000",
            "$70,000 ($120,000 total coverage - $50,000 statutory exemption)",
            "$50,000",
            "$20,000"
          ],
          "correctAnswer": 1,
          "explanation": "The first $50,000 is statutory exempt, leaving $70,000 in taxable coverage evaluated using IRS Table I rates."
        },
        {
          "id": "Q-AEP-105",
          "question": "Which table must employers use to calculate the taxable monthly value of group-term life insurance coverage exceeding $50,000?",
          "options": [
            "IRS Publication 15 Circular E tax tables",
            "IRS Section 79 Table I (Uniform Premiums for Group-Term Life Insurance)",
            "Social Security Actuary Life Expectancy Table",
            "Federal Reserve Prime Rate Chart"
          ],
          "correctAnswer": 1,
          "explanation": "IRS Table I establishes the uniform monthly cost per $1,000 of excess life insurance coverage categorized by age brackets."
        },
        {
          "id": "Q-AEP-106",
          "question": "How is GTL imputed income treated for employment tax withholding purposes?",
          "options": [
            "It is subject to Federal Income Tax withholding and FUTA",
            "It is subject to Social Security and Medicare (FICA) taxes, but is exempt from mandatory Federal Income Tax (FIT) withholding",
            "It is completely exempt from all federal and state taxes",
            "It is subject only to state unemployment taxes"
          ],
          "correctAnswer": 1,
          "explanation": "GTL imputed income must be subjected to FICA withholding, but employers are not required to withhold federal income tax."
        },
        {
          "id": "Q-AEP-107",
          "question": "Under the Tax Cuts and Jobs Act (TCJA), how are employer-paid relocation and moving expense reimbursements treated for payroll taxation?",
          "options": [
            "They are 100% tax-free for all employees",
            "They are fully taxable supplemental wages subject to FIT, FICA, and FUTA (except for active-duty military members)",
            "They are tax-free up to $10,000",
            "They are classified as independent contractor payments on 1099-MISC"
          ],
          "correctAnswer": 1,
          "explanation": "The TCJA eliminated the moving expense tax exclusion; all employer-paid relocation reimbursements are now fully taxable compensation."
        },
        {
          "id": "Q-AEP-108",
          "question": "What is a 'De Minimis' fringe benefit under IRC Section 132(e)?",
          "options": [
            "A corporate executive private jet lease",
            "Property or service so small in value that accounting for it is unreasonable or administratively impracticable (e.g., occasional coffee, office donuts, brief personal phone calls)",
            "A cash bonus of $500",
            "A gift card for $100"
          ],
          "correctAnswer": 1,
          "explanation": "De minimis benefits are low-value, infrequent perks that are impractical to track, making them non-taxable fringe benefits."
        },
        {
          "id": "Q-AEP-109",
          "question": "Why can cash and cash-equivalent gift cards NEVER qualify as non-taxable de minimis fringe benefits?",
          "options": [
            "Because gift cards are banned by banks",
            "IRS regulations explicitly state that cash and cash equivalents are readily measurable and always constitute taxable wages, regardless of how small the dollar amount is",
            "Gift cards can only be given to independent contractors",
            "Gift cards are taxable only on leap years"
          ],
          "correctAnswer": 1,
          "explanation": "Cash and gift certificates are never de minimis; a $10 holiday gift card is taxable supplemental compensation."
        },
        {
          "id": "Q-AEP-110",
          "question": "Under the Cents-per-Mile Rule for valuing personal use of a company vehicle, what records must the employee maintain?",
          "options": [
            "No records are required",
            "A contemporaneous written mileage log documenting date, destination, business miles, and personal commuting miles",
            "A photograph of the car's fuel tank once a month",
            "A receipt for car washes"
          ],
          "correctAnswer": 1,
          "explanation": "Valuing personal vehicle usage requires a verified contemporaneous log detailing business versus personal miles driven."
        }
      ]
    },
    {
      "id": "ASM-AEP-012",
      "courseId": "CRS-AEP-001",
      "chapterId": "CH-AEP-012",
      "title": "Assessment: Final Paychecks, Severance & Termination Compliance",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-AEP-111",
          "question": "Under California Labor Code Section 201, when must an employer provide the final paycheck to an employee who is discharged or fired involuntarily?",
          "options": [
            "Within 30 calendar days",
            "Immediately at the time and place of termination",
            "On the next regularly scheduled bi-weekly payday",
            "Within two weeks following return of company property"
          ],
          "correctAnswer": 1,
          "explanation": "California mandates that discharged employees must be handed their complete final paycheck, including all accrued PTO, immediately at the moment of firing."
        },
        {
          "id": "Q-AEP-112",
          "question": "What is the penalty under California Labor Code Section 203 if an employer willfully fails to pay all final wages on time?",
          "options": [
            "A $10 fine paid to the local fire department",
            "Waiting Time Penalties: the employee's wages continue to accrue at their regular daily rate for each day payment is delayed, up to a maximum of 30 calendar days",
            "The employer's corporate business license is permanently revoked",
            "The employee receives double company stock options"
          ],
          "correctAnswer": 1,
          "explanation": "Section 203 waiting time penalties penalize late final wage payments with up to 30 days of full daily wage accrual."
        },
        {
          "id": "Q-AEP-113",
          "question": "Under the Older Workers Benefit Protection Act (OWBPA), how long must an employer give an individual employee age 40 or older to consider a severance release agreement?",
          "options": [
            "24 hours",
            "At least 21 calendar days (or 45 days in the case of a group termination/exit incentive program)",
            "3 business days",
            "90 days"
          ],
          "correctAnswer": 1,
          "explanation": "The OWBPA mandates a 21-day review period for individual terminations and 45 days for group layoffs to waive age discrimination rights."
        },
        {
          "id": "Q-AEP-114",
          "question": "What is the mandatory revocation window under the OWBPA after an employee age 40+ signs a severance agreement?",
          "options": [
            "Zero days; the signature is instantly final and irrevocable",
            "7 calendar days following execution, during which the employee may revoke the agreement; severance cannot be paid until this period expires",
            "30 days",
            "6 months"
          ],
          "correctAnswer": 1,
          "explanation": "OWBPA agreements cannot take effect and severance must not be disbursed until the statutory 7-day post-signature revocation window passes."
        },
        {
          "id": "Q-AEP-115",
          "question": "Can an employer withhold an employee's final paycheck until the employee returns company equipment (e.g., laptop, keys, security badge)?",
          "options": [
            "Yes, employers can hold wages indefinitely until property is returned",
            "No. In virtually all jurisdictions, earned wages cannot be held hostage for unreturned property; employers must disburse final pay on time and pursue civil remedies for property recovery",
            "Yes, provided the laptop value exceeds $1,000",
            "Only if authorized by the local police department"
          ],
          "correctAnswer": 1,
          "explanation": "Withholding earned wages for unreturned property violates state wage payment laws, exposing employers to severe late pay penalties."
        },
        {
          "id": "Q-AEP-116",
          "question": "In states that treat accrued vacation as earned wages (e.g., California, Montana), must unused vacation be paid out upon termination?",
          "options": [
            "No, vacation is forfeited upon termination",
            "Yes. All accrued, unused vacation and PTO must be paid out in full as wages at the employee's final rate of pay",
            "Only 50% must be paid out",
            "Vacation is paid out only if the termination is voluntary"
          ],
          "correctAnswer": 1,
          "explanation": "Vested vacation pay constitutes earned wages that must be liquidated and included in the final paycheck upon separation."
        },
        {
          "id": "Q-AEP-117",
          "question": "How is severance pay categorized for federal employment tax withholding?",
          "options": [
            "It is completely tax-exempt",
            "It is categorized as supplemental wages, subject to FIT withholding (22% flat rate or aggregate method) and FICA taxes",
            "It is reported on Form 1099-MISC as non-employee compensation",
            "It is taxed at capital gains tax rates"
          ],
          "correctAnswer": 1,
          "explanation": "Severance pay represents supplemental employee wages subject to standard employment taxes (FIT, FICA, FUTA)."
        },
        {
          "id": "Q-AEP-118",
          "question": "Under Texas Payday Law, what is the deadline for paying an employee who is discharged (fired) by the employer?",
          "options": [
            "Immediately within 1 hour",
            "Within 6 calendar days of discharge",
            "On the next regular payday",
            "Within 30 calendar days"
          ],
          "correctAnswer": 1,
          "explanation": "Texas Labor Code § 61.014 mandates that discharged employees must be paid in full within 6 calendar days."
        },
        {
          "id": "Q-AEP-119",
          "question": "When an employee with an active child support withholding order is terminated, what is the employer legally required to do?",
          "options": [
            "Keep the child support order active in case the employee is rehired in 10 years",
            "Promptly notify the issuing child support agency of the termination, providing the employee's last known address and the name of any known new employer",
            "Transfer the child support debt to the employee's supervisor",
            "Nothing; the employer's obligation ends silently"
          ],
          "correctAnswer": 1,
          "explanation": "Child support statutes mandate that employers must notify the state disbursement unit promptly upon an obligor's separation."
        },
        {
          "id": "Q-AEP-120",
          "question": "What is the WARN Act (Worker Adjustment and Retraining Notification Act), and how does it relate to payroll termination liabilities?",
          "options": [
            "A weather warning system for corporate offices",
            "A federal law requiring employers with 100+ employees to provide 60 days advance written notice of plant closings or mass layoffs; failure to give notice requires 60 days of back pay and benefits",
            "A tax on companies that hire foreign workers",
            "A rule requiring employees to give 2 weeks notice before quitting"
          ],
          "correctAnswer": 1,
          "explanation": "The WARN Act mandates 60 days advance notice of mass layoffs, imposing 60 days of back pay and benefits liability for non-compliant employers."
        }
      ]
    }
  ]
};
