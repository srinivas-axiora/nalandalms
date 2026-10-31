export const phase3 = {
  "chapters": [
    {
      "id": "CH-AEP-013",
      "courseId": "CRS-AEP-001",
      "title": "Federal Tax Withholding: Form W-4 Mechanics, FIT Withholding Tables & Additional Medicare Tax",
      "description": "Master modern redesign Form W-4 mechanics (5-step process), percentage and wage-bracket withholding methods (Publication 15-T), and Additional Medicare Tax (0.9%) threshold monitoring.",
      "order": 13,
      "duration": "65 mins",
      "videoUrl": "https://www.youtube.com/embed/n3bNqXwFfio",
      "content": "\n        <div class=\"space-y-6\">\n          <p class=\"text-gray-300 leading-relaxed text-lg\">\n            Federal Income Tax (FIT) withholding is the cornerstone of statutory employment tax compliance. With the comprehensive redesign of IRS Form W-4 (eliminating personal withholding allowances in favor of a 5-step computational model) and strict computational algorithms outlined in IRS Publication 15-T, payroll professionals must execute exact mathematical algorithms to ensure neither underwithholding nor excessive withholding occurs.\n          </p>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">1. The Redesigned Form W-4 Architecture</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Since 2020, Form W-4 replaces archaic withholding allowances with transparent dollar-value adjustments reflecting the Tax Cuts and Jobs Act (TCJA):\n          </p>\n          <div class=\"grid grid-cols-1 md:grid-cols-2 gap-4 my-4\">\n            <div class=\"bg-gray-800/60 p-4 rounded-xl border border-gray-700/60\">\n              <h4 class=\"font-bold text-blue-400 mb-2\">Step 1 & Step 2: Status & Multiple Jobs</h4>\n              <p class=\"text-gray-300 text-sm\">Step 1: Marital filing status (Single, Married Filing Jointly, Head of Household). Step 2: Checkbox or estimator tables when an employee holds multiple jobs or a spouse also works, preventing dual-standard deduction underwithholding.</p>\n            </div>\n            <div class=\"bg-gray-800/60 p-4 rounded-xl border border-gray-700/60\">\n              <h4 class=\"font-bold text-emerald-400 mb-2\">Step 3, 4 & 5: Credits, Adjustments & Signature</h4>\n              <p class=\"text-gray-300 text-sm\">Step 3: Direct child/dependent tax credits ($2,000 per child under 17). Step 4: Other income (4a), itemized deductions exceeding standard deduction (4b), and extra dollar withholding per pay period (4c). Step 5: Legally required signature under penalties of perjury.</p>\n            </div>\n          </div>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">2. IRS Publication 15-T Computational Methods</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Payroll engines utilize the <strong>Percentage Method</strong> tables in Publication 15-T for automated gross-to-net calculations:\n          </p>\n          <div class=\"bg-gray-900 p-4 rounded-xl border border-gray-700 font-mono text-sm text-gray-300 space-y-2\">\n            <div><strong>Adjusted Wage Base</strong> = (Taxable Wages + Step 4a) - (Step 4b)</div>\n            <div><strong>Tentative Withholding</strong> = Evaluated against annualized tax brackets based on filing status</div>\n            <div class=\"text-emerald-400 mt-2\"><strong>Final Pay Period FIT</strong> = Tentative Withholding - (Step 3 Credits / Pay Periods) + Step 4c Extra Withholding</div>\n          </div>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">3. Additional Medicare Tax (0.9%) Compliance</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Under the Affordable Care Act (ACA), employers are statutory fiduciaries required to withhold an <strong>Additional Medicare Tax of 0.9%</strong> on wages paid to an employee in excess of <strong>$200,000 in a calendar year</strong>:\n          </p>\n          <ul class=\"list-disc pl-6 text-gray-300 space-y-2\">\n            <li><strong class=\"text-white\">Withholding Trigger:</strong> Withholding begins automatically in the pay period in which cumulative gross wages exceed $200,000, regardless of the employee's marital status or Form W-4 filing status.</li>\n            <li><strong class=\"text-white\">Zero Employer Match:</strong> Unlike regular Medicare (1.45% employee + 1.45% employer), there is <strong>NO employer match</strong> on the Additional Medicare Tax. The 0.9% is an employee tax only.</li>\n          </ul>\n        </div>\n      "
    },
    {
      "id": "CH-AEP-014",
      "courseId": "CRS-AEP-001",
      "title": "FICA Taxation: Social Security (OASDI) Wage Caps, Medicare Hospital Insurance & Employer Matching",
      "description": "Analyze the Federal Insurance Contributions Act (FICA): Social Security annual wage base indexation, Medicare tax mechanics, multi-employer excess FICA refunds, and tax deposit schedules.",
      "order": 14,
      "duration": "60 mins",
      "videoUrl": "https://www.youtube.com/embed/Vb1-yE6vA3Q",
      "content": "\n        <div class=\"space-y-6\">\n          <p class=\"text-gray-300 leading-relaxed text-lg\">\n            The Federal Insurance Contributions Act (FICA) funds two critical federal social safety net programs: Old-Age, Survivors, and Disability Insurance (OASDI, commonly known as Social Security) and Hospital Insurance (Medicare). Operating FICA taxation demands precise wage tracking against indexed annual limits and managing dual-employer withholding dynamics.\n          </p>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">1. FICA Tax Components & Rates</h3>\n          <div class=\"overflow-x-auto my-4\">\n            <table class=\"w-full text-left border-collapse border border-gray-700\">\n              <thead>\n                <tr class=\"bg-gray-800 text-gray-200\">\n                  <th class=\"p-3 border border-gray-700\">Tax Component</th>\n                  <th class=\"p-3 border border-gray-700\">Employee Rate</th>\n                  <th class=\"p-3 border border-gray-700\">Employer Rate</th>\n                  <th class=\"p-3 border border-gray-700\">Annual Statutory Wage Base Limit</th>\n                </tr>\n              </thead>\n              <tbody class=\"text-gray-300 text-sm\">\n                <tr class=\"border-b border-gray-800\">\n                  <td class=\"p-3 font-semibold text-blue-400\">Social Security (OASDI)</td>\n                  <td class=\"p-3\">6.2%</td>\n                  <td class=\"p-3\">6.2%</td>\n                  <td class=\"p-3 font-bold text-amber-400\">Indexed Annually by SSA (e.g., $168,600 in 2024 / $176,100 in 2025). Deductions stop once cap is met.</td>\n                </tr>\n                <tr class=\"border-b border-gray-800 bg-gray-800/30\">\n                  <td class=\"p-3 font-semibold text-emerald-400\">Medicare (Hospital Insurance)</td>\n                  <td class=\"p-3\">1.45%</td>\n                  <td class=\"p-3\">1.45%</td>\n                  <td class=\"p-3 font-bold text-emerald-400\">NO LIMIT (Applies to all covered compensation without ceiling).</td>\n                </tr>\n                <tr>\n                  <td class=\"p-3 font-semibold text-purple-400\">Additional Medicare Tax</td>\n                  <td class=\"p-3\">0.9%</td>\n                  <td class=\"p-3 text-gray-500 font-bold\">0.0% (No Match)</td>\n                  <td class=\"p-3\">Applies to compensation exceeding $200,000 threshold.</td>\n                </tr>\n              </tbody>\n            </table>\n          </div>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">2. Multi-Employer Excess Social Security Withholding</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            When an employee changes employers mid-year or works for two unrelated employers simultaneously, each employer must independently withhold Social Security tax up to the annual statutory cap without regard to wages earned at the other company. As a result, the employee may experience total Social Security withholding exceeding the annual maximum:\n          </p>\n          <ul class=\"list-disc pl-6 text-gray-300 space-y-2\">\n            <li><strong class=\"text-white\">Employee Remedy:</strong> The employee claims the excess Social Security tax withheld as a credit on their personal individual federal income tax return (Form 1040, Schedule 3).</li>\n            <li><strong class=\"text-white\">Employer Rule:</strong> Neither employer is entitled to a refund of their matching 6.2% employer Social Security tax contribution.</li>\n          </ul>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">3. Common Paymaster Rule (Affiliated Entities)</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Under IRC Sections 3121(s) and 3306(p), if two or more related corporate entities concurrently employ the same individual and disburse compensation through a designated <strong>Common Paymaster</strong>, the employee is treated as having a single employer for FICA and FUTA tax caps, saving the affiliated group thousands in duplicate payroll taxes.\n          </p>\n        </div>\n      "
    },
    {
      "id": "CH-AEP-015",
      "courseId": "CRS-AEP-001",
      "title": "Unemployment Taxes: FUTA Credit Reductions (Form 940) & State Unemployment Insurance (SUI/SUTA) Experience Ratings",
      "description": "Deconstruct the dual federal-state unemployment framework: FUTA calculation, maximum 5.4% state credit, Title XII loan insolvency credit reductions, and SUTA experience rating formulas.",
      "order": 15,
      "duration": "65 mins",
      "videoUrl": "https://www.youtube.com/embed/5U7yZ8n7m88",
      "content": "\n        <div class=\"space-y-6\">\n          <p class=\"text-gray-300 leading-relaxed text-lg\">\n            Unemployment insurance in the United States operates as a coordinated federal-state partnership created under Title IX of the Social Security Act of 1935. Unlike income and employee FICA taxes, unemployment taxes are primarily an <strong>employer-paid tax</strong> (with rare exceptions in PA, NJ, and AK). Managing unemployment liabilities requires understanding the interplay between Federal Unemployment Tax (FUTA) credits and State Unemployment Tax (SUTA) experience ratings.\n          </p>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">1. The FUTA Tax Architecture & The 5.4% State Credit</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            The standard statutory FUTA tax rate is <strong>6.0%</strong> on the first <strong>$7,000</strong> of taxable wages paid to each employee during the calendar year:\n          </p>\n          <div class=\"bg-gray-800/60 p-4 rounded-xl border border-gray-700/60 my-4 text-sm text-gray-300 space-y-2\">\n            <div><strong class=\"text-white\">The Normal FUTA Credit:</strong> Employers who pay their State Unemployment Taxes (SUTA) in full and on time receive a maximum statutory credit of <strong>5.4%</strong> against the 6.0% FUTA rate.</div>\n            <div class=\"text-emerald-400 font-mono\">Effective Net FUTA Rate = 6.0% - 5.4% = 0.6% ($42.00 maximum per employee per year).</div>\n          </div>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">2. Title XII Insolvency & FUTA Credit Reduction States</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            During severe economic recessions, state unemployment trust funds frequently become depleted. States borrow funds from the federal government under <strong>Title XII of the Social Security Act</strong>. If a state carries an outstanding federal loan balance for two consecutive years on January 1 and remains unpaid on November 10 of that year, the state becomes a <strong>Credit Reduction State</strong>:\n          </p>\n          <div class=\"overflow-x-auto my-4\">\n            <table class=\"w-full text-left border-collapse border border-gray-700\">\n              <thead>\n                <tr class=\"bg-gray-800 text-gray-200\">\n                  <th class=\"p-3 border border-gray-700\">Year of Delinquency</th>\n                  <th class=\"p-3 border border-gray-700\">Credit Reduction Penalty</th>\n                  <th class=\"p-3 border border-gray-700\">Effective Net FUTA Rate Paid by Employers</th>\n                </tr>\n              </thead>\n              <tbody class=\"text-gray-300 text-sm\">\n                <tr class=\"border-b border-gray-800\">\n                  <td class=\"p-3\">Year 1 of Reduction</td>\n                  <td class=\"p-3 font-semibold text-amber-400\">0.3% (Credit drops from 5.4% to 5.1%)</td>\n                  <td class=\"p-3 font-bold text-amber-400\">0.9% ($63.00 / employee)</td>\n                </tr>\n                <tr class=\"border-b border-gray-800 bg-gray-800/30\">\n                  <td class=\"p-3\">Year 2 of Reduction</td>\n                  <td class=\"p-3 font-semibold text-rose-400\">0.6% (Credit drops to 4.8%)</td>\n                  <td class=\"p-3 font-bold text-rose-400\">1.2% ($84.00 / employee)</td>\n                </tr>\n                <tr>\n                  <td class=\"p-3\">Year 3 of Reduction</td>\n                  <td class=\"p-3 font-semibold text-rose-500\">0.9% (Credit drops to 4.5%)</td>\n                  <td class=\"p-3 font-bold text-rose-500\">1.5% ($105.00 / employee) + Potential BCR Add-on</td>\n                </tr>\n              </tbody>\n            </table>\n          </div>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">3. SUTA Experience Ratings (Reserve Ratio vs. Benefit Ratio)</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Unlike flat federal rates, an employer's SUTA tax rate varies significantly based on their history of layoffs:\n          </p>\n          <ul class=\"list-disc pl-6 text-gray-300 space-y-2\">\n            <li><strong class=\"text-white\">Reserve Ratio System:</strong> (Cumulative Lifetime Taxes Paid - Cumulative Lifetime Benefits Drawn) / Average Annual Taxable Payroll. Higher reserve ratios yield lower tax rates.</li>\n            <li><strong class=\"text-white\">Benefit Ratio System:</strong> Cumulative Benefits Paid over trailing 3 years / Total Taxable Payroll over trailing 3 years. Lower benefit ratios result in lower tax rates.</li>\n            <li><strong class=\"text-white\">SUTA Dumping Prohibitions:</strong> The federal SUTA Dumping Prevention Act prohibits businesses from forming shell entities or engaging in corporate restructuring solely to evade high experience tax rates.</li>\n          </ul>\n        </div>\n      "
    },
    {
      "id": "CH-AEP-016",
      "courseId": "CRS-AEP-001",
      "title": "Multi-State Payroll Nexus: Remote Workers, Reciprocity Agreements & SIT/Local Tax Withholding",
      "description": "Navigate remote work payroll compliance: physical presence nexus, State Income Tax (SIT) withholding rules, statutory reciprocity agreements, convenience of the employer rules, and municipal local taxes.",
      "order": 16,
      "duration": "65 mins",
      "videoUrl": "https://www.youtube.com/embed/5a22Vz9e9-Y",
      "content": "\n        <div class=\"space-y-6\">\n          <p class=\"text-gray-300 leading-relaxed text-lg\">\n            The proliferation of remote and hybrid workforces has transformed multi-state payroll into an administrative and regulatory legal labyrinth. When an employee lives in New Jersey and works remotely for a company headquartered in Manhattan, or splits time between offices in Illinois and Wisconsin, the payroll department must navigate complex nexus triggers, conflicting state withholding mandates, and municipal income tax rules.\n          </p>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">1. Establishing Payroll Nexus & State Tax Registration</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Hiring even a single remote employee in a new state establishes <strong>Physical Presence Payroll Nexus</strong> in that jurisdiction. Before issuing the first paycheck, the organization must:\n          </p>\n          <ul class=\"list-disc pl-6 text-gray-300 space-y-2\">\n            <li>Register with the state's Secretary of State to qualify as a foreign entity doing business in that jurisdiction.</li>\n            <li>Obtain a State Employer Tax Withholding ID from the State Department of Revenue.</li>\n            <li>Register for State Unemployment Insurance (SUTA) with the State Department of Labor, receiving a new employer initial tax rate.</li>\n            <li>Secure statutory Workers' Compensation insurance coverage compliant with local state requirements.</li>\n          </ul>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">2. State Withholding Rules: Resident vs. Non-Resident</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            The general legal principle is that income tax is owed to the state where the <strong>physical services are performed</strong>, while the employee's resident state also holds universal taxation authority:\n          </p>\n          <div class=\"overflow-x-auto my-4\">\n            <table class=\"w-full text-left border-collapse border border-gray-700\">\n              <thead>\n                <tr class=\"bg-gray-800 text-gray-200\">\n                  <th class=\"p-3 border border-gray-700\">Scenario</th>\n                  <th class=\"p-3 border border-gray-700\">Withholding Rule</th>\n                  <th class=\"p-3 border border-gray-700\">Operational Execution</th>\n                </tr>\n              </thead>\n              <tbody class=\"text-gray-300 text-sm\">\n                <tr class=\"border-b border-gray-800\">\n                  <td class=\"p-3 font-semibold text-blue-400\">Reciprocity Agreement Exists</td>\n                  <td class=\"p-3\">Two neighboring states sign a bilateral agreement (e.g., PA and NJ; DC, MD, and VA).</td>\n                  <td class=\"p-3\">Withhold SIT exclusively for the employee's <strong>resident state</strong>. Employee submits a Certificate of Non-Residence (e.g., Form NJ-165) to waive work-state withholding.</td>\n                </tr>\n                <tr class=\"border-b border-gray-800 bg-gray-800/30\">\n                  <td class=\"p-3 font-semibold text-emerald-400\">No Reciprocity Agreement</td>\n                  <td class=\"p-3\">Work-state taxes the wages earned while physically working in that state; home-state taxes total global income.</td>\n                  <td class=\"p-3\">Withhold for work state first; withhold for resident state only if resident state tax rate exceeds work state rate (providing a resident tax credit for taxes paid to work state).</td>\n                </tr>\n                <tr>\n                  <td class=\"p-3 font-semibold text-rose-400\">\"Convenience of the Employer\" Rule</td>\n                  <td class=\"p-3\">Enforced aggressively by New York, Nebraska, Pennsylvania, and Delaware.</td>\n                  <td class=\"p-3\">If an out-of-state remote worker telecommutes for their own convenience rather than an absolute employer necessity, the state taxes 100% of their wages as if worked at headquarters!</td>\n                </tr>\n              </tbody>\n            </table>\n          </div>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">3. Municipal & Local Income Taxes (LIT)</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Thousands of localities enforce local payroll taxes (e.g., NYC Resident Tax, Yonkers, Philadelphia Wage Tax, Ohio RITA municipal taxes, Kentucky occupational license fees). Unlike federal taxes, municipal taxes often depend strictly on whether the employee resides inside city limits or whether the work was performed within municipal geographic boundaries.\n          </p>\n        </div>\n      "
    },
    {
      "id": "CH-AEP-017",
      "courseId": "CRS-AEP-001",
      "title": "Quarterly Payroll Filings: Reconciling and Filing Federal Form 941 & State Quarterly Reports",
      "description": "Master quarterly compliance: Federal Form 941 reconciliations (Part 1 wages/taxes, Part 2 deposit schedule, Schedule B daily liabilities), Form 941-X adjustments, and state quarterly wage reporting.",
      "order": 17,
      "duration": "65 mins",
      "videoUrl": "https://www.youtube.com/embed/q_2iF6w-9Z0",
      "content": "\n        <div class=\"space-y-6\">\n          <p class=\"text-gray-300 leading-relaxed text-lg\">\n            Quarterly reporting represents the primary reconciliation checkpoint between an employer's internal payroll general ledger and federal/state taxing authorities. Federal Form 941 (Employer's Quarterly Federal Tax Return) reports income taxes, Social Security, and Medicare withheld from employees, along with the employer's matching liability. Inaccurate filings or out-of-balance Schedule B liability reports trigger immediate IRS discrepancy notices and statutory failure-to-deposit penalties.\n          </p>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">1. Anatomy of Federal Form 941</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Form 941 must be filed by the last day of the month following the end of each calendar quarter (April 30, July 31, October 31, and January 31):\n          </p>\n          <div class=\"bg-gray-900 p-4 rounded-xl border border-gray-700 font-mono text-sm text-gray-300 space-y-2\">\n            <div><strong class=\"text-blue-400\">Line 2:</strong> Total wages, tips, and other compensation paid in the quarter</div>\n            <div><strong class=\"text-emerald-400\">Line 3:</strong> Federal income tax withheld from wages, tips, and other compensation</div>\n            <div><strong class=\"text-purple-400\">Line 5a:</strong> Taxable Social Security wages × 12.4% (6.2% employee + 6.2% employer)</div>\n            <div><strong class=\"text-amber-400\">Line 5c:</strong> Taxable Medicare wages × 2.9% (1.45% employee + 1.45% employer)</div>\n            <div><strong class=\"text-rose-400\">Line 5d:</strong> Taxable wages subject to Additional Medicare Tax withholding × 0.9%</div>\n            <div class=\"text-indigo-300 pt-2 border-t border-gray-800\">Line 12: Total taxes after adjustments (Must reconcile within $0.00 to Schedule B)</div>\n          </div>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">2. Schedule B: Report of Tax Liability for Semi-Weekly Depositors</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Semi-weekly schedule depositors must attach <strong>Schedule B (Form 941)</strong>, detailing tax liabilities on a day-by-day basis:\n          </p>\n          <div class=\"bg-gray-800/60 p-4 rounded-xl border border-gray-700/60 my-4 text-sm text-gray-300 space-y-2\">\n            <div class=\"text-amber-400 font-bold\">The Golden Rule of Schedule B:</div>\n            <div>Schedule B reports the <strong>liability date</strong> (the date wages were paid), NOT the date taxes were deposited into the bank!</div>\n            <div>The sum of all daily liabilities across Month 1, Month 2, and Month 3 on Schedule B must equal Line 12 of Form 941 to the exact penny. A single cent variance generates an automated IRS Notice CP207.</div>\n          </div>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">3. Form 941-X: Correcting Errors</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            When prior-quarter errors are discovered (e.g., missed wage adjustments, incorrect tax calculations), the employer must file <strong>Form 941-X (Adjusted Employer's Quarterly Federal Tax Return)</strong> as a stand-alone correction return. Employers must choose between the \"Adjusted Return Process\" (claiming a credit against current taxes) or the \"Claim Process\" (requesting a formal refund via Form 843).\n          </p>\n        </div>\n      "
    },
    {
      "id": "CH-AEP-018",
      "courseId": "CRS-AEP-001",
      "title": "Year-End Processing & Reconciliations: Form W-2, W-3, 1099-NEC, 1099-MISC & Affordable Care Act (Form 1095-C)",
      "description": "Year-end payroll closing playbook: Box-by-box Form W-2 reconciliation against Form 941, Form W-3 transmittal, Form 1099-NEC nonemployee compensation reporting, and ACA Form 1095-C employer mandates.",
      "order": 18,
      "duration": "65 mins",
      "videoUrl": "https://www.youtube.com/embed/H3Z8J0b9X7E",
      "content": "\n        <div class=\"space-y-6\">\n          <p class=\"text-gray-300 leading-relaxed text-lg\">\n            Fourth-quarter year-end processing is the ultimate trial of an enterprise payroll organization. Every single wage transaction, pre-tax deduction, fringe benefit imputation, and tax remittance conducted over the preceding 365 days must reconcile with mathematical perfection across corporate accounting books, state agencies, the IRS, and the Social Security Administration (SSA).\n          </p>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">1. Box-by-Box Form W-2 Reconciliation Formula</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Before transmitting Form W-2 to employees and the SSA (mandatory deadline: <strong>January 31</strong>), payroll accountants must verify critical balancing equations:\n          </p>\n          <div class=\"overflow-x-auto my-4\">\n            <table class=\"w-full text-left border-collapse border border-gray-700\">\n              <thead>\n                <tr class=\"bg-gray-800 text-gray-200\">\n                  <th class=\"p-3 border border-gray-700\">W-2 Box</th>\n                  <th class=\"p-3 border border-gray-700\">Description</th>\n                  <th class=\"p-3 border border-gray-700\">Quarterly Form 941 Reconciliation Check</th>\n                </tr>\n              </thead>\n              <tbody class=\"text-gray-300 text-sm\">\n                <tr class=\"border-b border-gray-800\">\n                  <td class=\"p-3 font-semibold text-blue-400\">Box 1</td>\n                  <td class=\"p-3\">Wages, tips, other compensation</td>\n                  <td class=\"p-3\">Sum of Line 2 across all four Q1-Q4 Forms 941.</td>\n                </tr>\n                <tr class=\"border-b border-gray-800 bg-gray-800/30\">\n                  <td class=\"p-3 font-semibold text-emerald-400\">Box 2</td>\n                  <td class=\"p-3\">Federal income tax withheld</td>\n                  <td class=\"p-3\">Sum of Line 3 across all four Q1-Q4 Forms 941.</td>\n                </tr>\n                <tr class=\"border-b border-gray-800\">\n                  <td class=\"p-3 font-semibold text-purple-400\">Box 3 & Box 5</td>\n                  <td class=\"p-3\">Social Security wages & Medicare wages</td>\n                  <td class=\"p-3\">Sum of Line 5a (Col 1) and Line 5c (Col 1) across all four Q1-Q4 Forms 941.</td>\n                </tr>\n                <tr>\n                  <td class=\"p-3 font-semibold text-amber-400\">Box 12 Codes</td>\n                  <td class=\"p-3\">Statutory deferrals & benefits</td>\n                  <td class=\"p-3\">Code D (401k), Code W (HSA), Code DD (Cost of Employer Health Coverage), Code C (GTL &gt; $50k).</td>\n                </tr>\n              </tbody>\n            </table>\n          </div>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">2. 1099-NEC vs. 1099-MISC Reporting</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Under PATH Act legislation, non-employee compensation is reported separately:\n          </p>\n          <ul class=\"list-disc pl-6 text-gray-300 space-y-2\">\n            <li><strong class=\"text-white\">Form 1099-NEC:</strong> Reports non-employee compensation of <strong>$600 or more</strong> paid to independent contractors, freelancers, and unincorporated vendors. Due January 31.</li>\n            <li><strong class=\"text-white\">Form 1099-MISC:</strong> Reports royalties ($10+), rent, prizes, awards, and legal settlement proceeds. Due February 28 (paper) or March 31 (electronic).</li>\n          </ul>\n\n          <h3 class=\"text-xl font-bold text-white mt-6 mb-3\">3. Affordable Care Act (ACA) Reporting: Form 1094-C & 1095-C</h3>\n          <p class=\"text-gray-300 leading-relaxed\">\n            Applicable Large Employers (ALEs)—organizations employing <strong>50 or more full-time equivalent (FTE) employees</strong>—must comply with the Employer Shared Responsibility provisions under IRC Section 4980H:\n          </p>\n          <div class=\"bg-gray-800/60 p-4 rounded-xl border border-gray-700/60 text-sm text-gray-300 space-y-2\">\n            <div><strong class=\"text-white\">Form 1095-C:</strong> Furnished to each full-time employee documenting monthly healthcare offer of coverage codes (Part II, Line 14 Code Series 1) and safe harbor affordability codes (Line 16 Code Series 2).</div>\n            <div><strong class=\"text-white\">Form 1094-C:</strong> Transmittal transacted with the IRS aggregating total full-time headcount and certifying minimum essential coverage compliance.</div>\n          </div>\n        </div>\n      "
    }
  ],
  "assessments": [
    {
      "id": "ASM-AEP-013",
      "courseId": "CRS-AEP-001",
      "chapterId": "CH-AEP-013",
      "title": "Assessment: Federal Tax Withholding & Form W-4 Mechanics",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-AEP-121",
          "question": "How did the 2020 Form W-4 redesign alter the calculation of federal income tax withholding?",
          "options": [
            "It made federal tax withholding completely optional",
            "It eliminated personal withholding allowances, replacing them with a 5-step model accounting for filing status, multiple jobs, dependents, and other adjustments",
            "It replaced income tax with a national flat sales tax",
            "It mandated that all employees pay 50% of their wages in taxes"
          ],
          "correctAnswer": 1,
          "explanation": "The redesigned Form W-4 dropped confusing withholding allowances in favor of transparent dollar-value adjustments."
        },
        {
          "id": "Q-AEP-122",
          "question": "What is the mandatory threshold at which an employer must begin withholding the 0.9% Additional Medicare Tax?",
          "options": [
            "On all wages from the first dollar earned",
            "When an employee's cumulative calendar year wages exceed $200,000",
            "$500,000",
            "$1,000,000"
          ],
          "correctAnswer": 1,
          "explanation": "Employers are required to begin withholding 0.9% Additional Medicare Tax in the pay period in which wages exceed $200,000."
        },
        {
          "id": "Q-AEP-123",
          "question": "What is the employer matching obligation for the 0.9% Additional Medicare Tax?",
          "options": [
            "Employer must match 0.9% dollar-for-dollar",
            "Zero; there is no employer matching tax obligation for the Additional Medicare Tax (it is strictly an employee tax)",
            "Employer pays 1.45%",
            "Employer matches 50% of the tax"
          ],
          "correctAnswer": 1,
          "explanation": "Unlike regular Medicare (which requires a 1.45% employer match), the 0.9% Additional Medicare Tax is borne solely by the employee."
        },
        {
          "id": "Q-AEP-124",
          "question": "If an employee fails to submit a completed Form W-4 upon hire, what is the default withholding status under IRS guidelines?",
          "options": [
            "Exempt with zero withholding",
            "Single or Married Filing Separately with no other adjustments (Step 1 single standard deduction)",
            "Married filing jointly with 10 allowances",
            "Flat 50% withholding"
          ],
          "correctAnswer": 1,
          "explanation": "IRS rules state that if an employee fails to submit a W-4, the employer must treat them as Single with no other adjustments."
        },
        {
          "id": "Q-AEP-125",
          "question": "In Form W-4 Step 3, what annual dollar credit is claimed for each qualifying child under age 17?",
          "options": [
            "$500",
            "$2,000 per qualifying child",
            "$5,000",
            "$10,000"
          ],
          "correctAnswer": 1,
          "explanation": "Step 3 allows claiming $2,000 per qualifying child under 17 (and $500 for other dependents), reducing annual tax withholding."
        },
        {
          "id": "Q-AEP-126",
          "question": "What does Step 4(c) on Form W-4 allow an employee to request?",
          "options": [
            "An extra monetary amount to be withheld from their paycheck each pay period",
            "A complete exemption from Social Security taxes",
            "A loan from the company retirement fund",
            "An increase in hourly wage rate"
          ],
          "correctAnswer": 0,
          "explanation": "Step 4(c) enables an employee to designate an exact additional dollar withholding amount per pay period."
        },
        {
          "id": "Q-AEP-127",
          "question": "What publication does the IRS release annually providing computational percentage method tables for automated payroll systems?",
          "options": [
            "Publication 590",
            "Publication 15-T (Federal Income Tax Withholding Methods)",
            "Publication 946",
            "Circular A"
          ],
          "correctAnswer": 1,
          "explanation": "Publication 15-T provides the automated percentage formulas and manual wage bracket tables for federal income tax withholding."
        },
        {
          "id": "Q-AEP-128",
          "question": "Under what condition can an employee legally claim complete 'Exempt' status on Form W-4?",
          "options": [
            "Whenever they want to take a break from paying taxes",
            "Only if they had no federal tax liability in the prior tax year AND expect to have zero tax liability in the current tax year",
            "If they are enrolled in an online college degree",
            "If they work less than 40 hours per week"
          ],
          "correctAnswer": 1,
          "explanation": "An employee can only write 'Exempt' on Form W-4 if they had no tax liability last year and expect zero liability this year."
        },
        {
          "id": "Q-AEP-129",
          "question": "How long does a Form W-4 claiming 'Exempt' status remain valid before requiring renewal?",
          "options": [
            "Permanently for 10 years",
            "It expires annually on February 15 of the following calendar year, requiring a new W-4 submission",
            "It expires at the end of every quarter",
            "It is valid for 30 days only"
          ],
          "correctAnswer": 1,
          "explanation": "Exempt W-4 claims expire on February 15 annually; if no new form is submitted, withholding defaults to Single."
        },
        {
          "id": "Q-AEP-130",
          "question": "What is an employer required to do if an employee checks the Step 2(c) box on Form W-4 for multiple jobs?",
          "options": [
            "Double the employee's salary",
            "Use the specific higher withholding rate table in Publication 15-T for Step 2(c) checked to account for multiple wage earners",
            "Terminate the employee for working two jobs",
            "Deduct 40% flat tax"
          ],
          "correctAnswer": 1,
          "explanation": "Checking Step 2(c) instructs the payroll engine to apply withholding tables tailored to multi-job earners to avoid tax deficits."
        }
      ]
    },
    {
      "id": "ASM-AEP-014",
      "courseId": "CRS-AEP-001",
      "chapterId": "CH-AEP-014",
      "title": "Assessment: FICA Taxation & Social Security Caps",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-AEP-131",
          "question": "What is the statutory employee tax rate for Social Security (OASDI) under FICA?",
          "options": [
            "1.45%",
            "6.2%",
            "7.65%",
            "10.0%"
          ],
          "correctAnswer": 1,
          "explanation": "The employee Social Security withholding rate is 6.2% on covered wages up to the annual statutory wage ceiling."
        },
        {
          "id": "Q-AEP-132",
          "question": "What happens when an employee's cumulative year-to-date earnings with an employer reach the Social Security statutory wage base limit?",
          "options": [
            "The employee must pay double Medicare tax",
            "Social Security tax withholding stops for the remainder of the calendar year for both the employee (6.2%) and the employer (6.2%)",
            "The employee must donate the difference to charity",
            "All payroll deductions cease completely"
          ],
          "correctAnswer": 1,
          "explanation": "Once an employee reaches the annual OASDI cap, Social Security tax withholding stops for both employee and employer for that year."
        },
        {
          "id": "Q-AEP-133",
          "question": "What is the statutory employee tax rate for Medicare (Hospital Insurance) under FICA?",
          "options": [
            "6.2%",
            "1.45% (with no annual wage ceiling)",
            "3.0%",
            "5.0%"
          ],
          "correctAnswer": 1,
          "explanation": "Medicare tax is 1.45% for the employee and 1.45% for the employer on all covered wages, with no upper dollar limit."
        },
        {
          "id": "Q-AEP-134",
          "question": "An employee works for Company A for 6 months (earning $120,000) and joins Company B for the remainder of the year (earning $100,000). How must Company B handle Social Security tax withholding?",
          "options": [
            "Company B can ignore Company A's earnings and must withhold Social Security from $0 up to the statutory cap for its own wage payments",
            "Company B can stop withholding immediately because the employee already paid enough at Company A",
            "Company B must call Company A and request a refund",
            "Company B pays all the employee's income taxes"
          ],
          "correctAnswer": 0,
          "explanation": "Each employer must withhold Social Security independently from dollar zero up to the annual limit, without credit for prior employer earnings."
        },
        {
          "id": "Q-AEP-135",
          "question": "How does the employee recover excess Social Security tax withheld caused by working for two unrelated employers in the same calendar year?",
          "options": [
            "By demanding a cash refund from Company B's HR department",
            "By claiming a credit for excess Social Security tax paid on their individual federal income tax return (Form 1040)",
            "The money is permanently lost to the government",
            "By visiting the local Social Security office in person"
          ],
          "correctAnswer": 1,
          "explanation": "Excess Social Security taxes withheld across multiple employers are refunded as a direct tax credit on the employee's Form 1040."
        },
        {
          "id": "Q-AEP-136",
          "question": "Is Company B entitled to a refund of its employer matching Social Security tax when the employee exceeded the cap due to multi-employer earnings?",
          "options": [
            "Yes, Company B gets a 100% tax credit on Form 941",
            "No. Employers are not entitled to a refund of employer FICA taxes paid on wages up to the cap within their own entity",
            "Yes, but only if approved by the Governor",
            "Only if Company B is a non-profit"
          ],
          "correctAnswer": 1,
          "explanation": "Each employer's matching liability stands independently; the government does not refund the employer portion of multi-employer excess FICA."
        },
        {
          "id": "Q-AEP-137",
          "question": "What is a 'Common Paymaster' arrangement under IRC Section 3121(s)?",
          "options": [
            "A software company that sells payroll programs",
            "A legal tax mechanism allowing related corporate entities that employ the same individual concurrently to treat the compensation as coming from a single employer for FICA/FUTA caps",
            "A master bank account shared between two competitors",
            "A union hiring hall arrangement"
          ],
          "correctAnswer": 1,
          "explanation": "A Common Paymaster allows affiliated corporations sharing an employee to avoid duplicate FICA employer matching taxes."
        },
        {
          "id": "Q-AEP-138",
          "question": "Which of the following earnings types is fully EXEMPT from FICA taxation?",
          "options": [
            "Annual performance cash bonuses",
            "Section 125 qualified medical insurance pre-tax payroll deductions",
            "Commissions earned on software sales",
            "Overtime wage premiums"
          ],
          "correctAnswer": 1,
          "explanation": "Section 125 pre-tax health deductions are legally excluded from wages subject to Social Security and Medicare taxes."
        },
        {
          "id": "Q-AEP-139",
          "question": "Are tips received by food and beverage service employees subject to FICA taxation?",
          "options": [
            "Tips are completely non-taxable under federal law",
            "Yes. All cash tips of $20 or more in a calendar month reported to the employer are subject to employee and employer FICA taxes",
            "Tips are subject only to Medicare tax, but not Social Security",
            "Tips are taxed only if paid by credit card"
          ],
          "correctAnswer": 1,
          "explanation": "Reported cash tips of $20+ per month constitute taxable employee wages subject to both employee withholding and employer matching FICA."
        },
        {
          "id": "Q-AEP-140",
          "question": "What is the total combined FICA tax rate paid on an employee's wages up to the Social Security wage cap (combining employee and employer shares)?",
          "options": [
            "7.65%",
            "15.3% (7.65% employee + 7.65% employer)",
            "20.0%",
            "12.4%"
          ],
          "correctAnswer": 1,
          "explanation": "The combined employee and employer FICA tax burden equals 15.3% (12.4% OASDI + 2.9% Medicare)."
        }
      ]
    },
    {
      "id": "ASM-AEP-015",
      "courseId": "CRS-AEP-001",
      "chapterId": "CH-AEP-015",
      "title": "Assessment: Unemployment Taxes & FUTA/SUTA Calculations",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-AEP-141",
          "question": "What is the federal statutory wage base limit per employee for Federal Unemployment Tax (FUTA)?",
          "options": [
            "$7,000 per employee per calendar year",
            "$50,000",
            "$168,600",
            "There is no wage limit on FUTA"
          ],
          "correctAnswer": 0,
          "explanation": "The federal FUTA wage base is capped at the first $7,000 in taxable wages paid to each employee annually."
        },
        {
          "id": "Q-AEP-142",
          "question": "What is the maximum state credit allowable against the 6.0% gross FUTA tax rate for timely SUTA tax payments?",
          "options": [
            "1.0%",
            "5.4%",
            "6.0%",
            "2.5%"
          ],
          "correctAnswer": 1,
          "explanation": "Employers who pay state unemployment taxes on time receive a maximum 5.4% statutory credit, reducing FUTA to an effective 0.6%."
        },
        {
          "id": "Q-AEP-143",
          "question": "What is the effective net FUTA tax rate paid by an employer entitled to the maximum 5.4% credit?",
          "options": [
            "0.6% (resulting in a maximum of $42.00 per employee per year)",
            "6.0%",
            "1.45%",
            "Zero"
          ],
          "correctAnswer": 0,
          "explanation": "6.0% minus 5.4% credit leaves an effective FUTA rate of 0.6% ($42.00 max on $7,000 of wages)."
        },
        {
          "id": "Q-AEP-144",
          "question": "What triggers a state becoming a 'FUTA Credit Reduction State' under Title XII of the Social Security Act?",
          "options": [
            "The state increases its corporate income tax rate",
            "The state borrows funds from the federal unemployment trust fund and has an outstanding loan balance for two consecutive years on January 1 that remains unpaid on November 10",
            "The state eliminates all unemployment benefits",
            "The state legislature fails to pass an annual budget"
          ],
          "correctAnswer": 1,
          "explanation": "Carrying delinquent Title XII federal unemployment loans triggers statutory FUTA credit reductions, increasing federal unemployment taxes on employers."
        },
        {
          "id": "Q-AEP-145",
          "question": "How does an employer report and reconcile annual FUTA tax liabilities with the IRS?",
          "options": [
            "Form 941",
            "Form 940 (Employer's Annual Federal Unemployment Tax Return)",
            "Form W-2",
            "Form 1099-NEC"
          ],
          "correctAnswer": 1,
          "explanation": "Annual FUTA liabilities and state credit calculations are reported on IRS Form 940, due January 31."
        },
        {
          "id": "Q-AEP-146",
          "question": "Do employees pay FUTA tax through paycheck deductions?",
          "options": [
            "Yes, employees pay 50% of the FUTA tax",
            "No. FUTA is an employer-paid tax and cannot legally be deducted from employee wages",
            "Yes, in all 50 states",
            "Only executive employees pay FUTA"
          ],
          "correctAnswer": 1,
          "explanation": "FUTA is strictly an employer tax; deducting FUTA from employee wages is a federal violation."
        },
        {
          "id": "Q-AEP-147",
          "question": "Which three states are notable for assessing an employee-paid SUTA or State Unemployment/Disability tax deduction?",
          "options": [
            "Texas, Florida, and Nevada",
            "Pennsylvania, New Jersey, and Alaska",
            "California, Arizona, and New Mexico",
            "New York, Ohio, and Illinois"
          ],
          "correctAnswer": 1,
          "explanation": "Pennsylvania, New Jersey, and Alaska are the rare states that require employee contributions toward state unemployment funds."
        },
        {
          "id": "Q-AEP-148",
          "question": "What is an employer's SUTA 'Experience Rating'?",
          "options": [
            "A rating given by employees on company review websites",
            "A state formula that adjusts an employer's unemployment tax rate based on the volume of unemployment claims filed by their former employees",
            "The number of years the company has been in business",
            "A credit score issued by Dun & Bradstreet"
          ],
          "correctAnswer": 1,
          "explanation": "Experience ratings reward employers with low layoff rates with lower SUTA tax percentages, while penalizing high-turnover employers."
        },
        {
          "id": "Q-AEP-149",
          "question": "What illegal practice does the SUTA Dumping Prevention Act prohibit?",
          "options": [
            "Dumping office paper waste in city landfills",
            "Forming new shell corporate entities or restructuring businesses solely to shed high SUTA tax experience ratings and obtain lower new-employer rates",
            "Paying unemployment claims in cash",
            "Filing unemployment reports electronically"
          ],
          "correctAnswer": 1,
          "explanation": "SUTA dumping involves manipulating corporate entity structures to fraudulently evade high unemployment tax rates."
        },
        {
          "id": "Q-AEP-150",
          "question": "When is an employer required to make quarterly FUTA tax deposits via EFTPS?",
          "options": [
            "Whenever taxes exceed $50",
            "In any calendar quarter where cumulative undeposited FUTA tax liability exceeds $500",
            "Only on December 31 of each year",
            "FUTA deposits are never required quarterly"
          ],
          "correctAnswer": 1,
          "explanation": "If accumulated FUTA liability exceeds $500 in a quarter, it must be deposited by the end of the month following the quarter."
        }
      ]
    },
    {
      "id": "ASM-AEP-016",
      "courseId": "CRS-AEP-001",
      "chapterId": "CH-AEP-016",
      "title": "Assessment: Multi-State Payroll Nexus & Reciprocity Compliance",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-AEP-151",
          "question": "What is 'Physical Presence Payroll Nexus' in state employment taxation?",
          "options": [
            "Having a website accessible to residents of a state",
            "Employing a worker who physically lives and performs labor within a state, legally subjecting the employer to that state's tax withholding, unemployment, and labor laws",
            "Shipping consumer products into a state via postal mail",
            "Holding an annual shareholders meeting in a state"
          ],
          "correctAnswer": 1,
          "explanation": "Having an employee perform labor within a state's borders creates physical tax nexus, triggering withholding and registration requirements."
        },
        {
          "id": "Q-AEP-152",
          "question": "What is an interstate State Income Tax (SIT) 'Reciprocity Agreement'?",
          "options": [
            "An agreement to trade state agricultural products",
            "A bilateral agreement between two states allowing commuters to pay income tax solely to their state of residence rather than the state where they physically work",
            "A treaty merging two state supreme courts",
            "An agreement to eliminate all state sales taxes"
          ],
          "correctAnswer": 1,
          "explanation": "Reciprocity agreements relieve interstate commuters from dual tax withholding, taxing income solely in the employee's resident state."
        },
        {
          "id": "Q-AEP-153",
          "question": "In the absence of a reciprocity agreement, which state has the primary legal right to tax an employee's earned wages?",
          "options": [
            "The state where the company's CEO resides",
            "The physical work-state (the state where the labor or services were physically performed)",
            "The federal district of Washington, DC",
            "The state where the corporate bank account is located"
          ],
          "correctAnswer": 1,
          "explanation": "The physical work location retains primary taxation rights; the resident state provides a credit for taxes paid to the work state."
        },
        {
          "id": "Q-AEP-154",
          "question": "What is the controversial 'Convenience of the Employer' rule enforced by states like New York?",
          "options": [
            "Employers can pay employees whenever it is convenient for the accounting team",
            "A rule dictating that out-of-state remote employees are taxed by New York unless telecommuting is an absolute necessity of the employer rather than the employee's personal convenience",
            "A rule allowing remote workers to work free of state taxes",
            "A requirement that employers provide free coffee to office workers"
          ],
          "correctAnswer": 1,
          "explanation": "Under NY's convenience rule, remote workers assigned to a NY office owe NY state income tax unless telecommuting is mandated by employer necessity."
        },
        {
          "id": "Q-AEP-155",
          "question": "An employee lives in New Jersey and commutes to work in Pennsylvania (states with a bilateral reciprocity agreement). Which state tax is withheld?",
          "options": [
            "Pennsylvania state income tax only",
            "New Jersey state income tax only (upon filing Form REV-419 with the employer)",
            "Both PA and NJ full taxes simultaneously",
            "Neither state; income is tax-free"
          ],
          "correctAnswer": 1,
          "explanation": "Under the PA/NJ reciprocity pact, compensation is taxed solely in the resident state (NJ) upon filing a non-residence certificate."
        },
        {
          "id": "Q-AEP-156",
          "question": "Which of the following US states imposes ZERO State Personal Income Tax (SIT) on wages?",
          "options": [
            "California, New York, and Massachusetts",
            "Texas, Florida, Washington, Nevada, and Wyoming",
            "Illinois, Pennsylvania, and New Jersey",
            "Oregon, Minnesota, and Wisconsin"
          ],
          "correctAnswer": 1,
          "explanation": "States like Texas, Florida, Washington, and Nevada have no state personal earned income tax."
        },
        {
          "id": "Q-AEP-157",
          "question": "What is a 'Local Services Tax' or 'Municipal Income Tax' in multi-state payroll administration?",
          "options": [
            "A tax assessed on international wire transfers",
            "City-, county-, or school district-level payroll taxes (e.g., Philadelphia Wage Tax, Ohio RITA, NYC Resident Tax) assessed in addition to state taxes",
            "A fee paid to use city parking meters",
            "A fee paid to register a company motor vehicle"
          ],
          "correctAnswer": 1,
          "explanation": "Municipalities often assess local earned income taxes based on residency or work location inside municipal borders."
        },
        {
          "id": "Q-AEP-158",
          "question": "What must a payroll department obtain before withholding state taxes for an employee who relocates to a brand-new state?",
          "options": [
            "Approval from the United Nations",
            "A State Withholding Account Number and State Unemployment Insurance (SUTA) Account Number from that state's tax agencies",
            "A letter from the employee's landlord",
            "A copy of the employee's high school diploma"
          ],
          "correctAnswer": 1,
          "explanation": "Employers must formally register with the new state's revenue and labor departments to remit withheld taxes legally."
        },
        {
          "id": "Q-AEP-159",
          "question": "How do 'Resident Tax Credits' prevent double taxation when an employee lives in State A and works in State B with no reciprocity?",
          "options": [
            "The employee is exempt from all federal income taxes",
            "Resident State A grants the employee a tax credit against their home-state tax liability for income taxes paid to work-State B",
            "Work-State B mails the employee a cash rebate check every month",
            "The employer pays double salary to offset the loss"
          ],
          "correctAnswer": 1,
          "explanation": "Resident states allow a credit for taxes paid to non-resident work states, preventing unconstitutional double taxation of the same earnings."
        },
        {
          "id": "Q-AEP-160",
          "question": "What is the primary risk of an organization allowing employees to work remotely in unapproved states without notifying payroll?",
          "options": [
            "The employee will use too much electricity",
            "Unregistered corporate nexus, unpaid state unemployment liabilities, non-compliance with local mandatory paid leave programs, and severe tax penalties",
            "Computer screens will stop displaying corporate software",
            "Federal income taxes are doubled automatically"
          ],
          "correctAnswer": 1,
          "explanation": "Unreported remote work creates corporate tax nexus, corporate income tax liability, and labor standard non-compliance."
        }
      ]
    },
    {
      "id": "ASM-AEP-017",
      "courseId": "CRS-AEP-001",
      "chapterId": "CH-AEP-017",
      "title": "Assessment: Quarterly Form 941 Reconciliations & Filings",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-AEP-161",
          "question": "What is the filing deadline for Federal Form 941 for the first calendar quarter (Q1 ending March 31)?",
          "options": [
            "April 15",
            "April 30 (the last day of the month following the end of the quarter)",
            "December 31",
            "March 31"
          ],
          "correctAnswer": 1,
          "explanation": "Form 941 is due on the last day of the month following the calendar quarter end: April 30 for Q1."
        },
        {
          "id": "Q-AEP-162",
          "question": "What critical requirement applies to Schedule B of Form 941 for semi-weekly schedule depositors?",
          "options": [
            "Schedule B must list the social security numbers of all employees",
            "Schedule B must detail tax liabilities on the exact dates wages were paid, and the total must reconcile to Line 12 of Form 941 to the penny",
            "Schedule B is completely optional for large corporations",
            "Schedule B lists the company's daily stock closing prices"
          ],
          "correctAnswer": 1,
          "explanation": "Schedule B records daily tax liability based on payday dates; its total must match Line 12 exactly, or IRS CP207 notices are triggered."
        },
        {
          "id": "Q-AEP-163",
          "question": "What is the consequence of reporting tax deposit dates rather than wage liability dates on Schedule B of Form 941?",
          "options": [
            "The IRS will issue a cash reward for honesty",
            "The IRS will misalign liabilities with bank deposits, triggering automated Failure-to-Deposit (FTD) penalty notices against the employer",
            "The company's bank account is frozen for 90 days",
            "Nothing; the IRS does not examine dates"
          ],
          "correctAnswer": 1,
          "explanation": "Listing deposit dates instead of pay dates creates artificial deposit delinquencies, generating automated FTD penalties."
        },
        {
          "id": "Q-AEP-164",
          "question": "Which form must an employer file to correct errors discovered on a previously filed Form 941?",
          "options": [
            "Form W-2c",
            "Form 941-X (Adjusted Employer's Quarterly Federal Tax Return or Claim for Refund)",
            "Form 1040-X",
            "Form 1099-MISC"
          ],
          "correctAnswer": 1,
          "explanation": "Form 941-X is the designated stand-alone form used to correct prior-quarter Form 941 employment tax errors."
        },
        {
          "id": "Q-AEP-165",
          "question": "On Form 941 Line 5a (Taxable Social Security wages), what tax rate is multiplied against the wage total?",
          "options": [
            "6.2%",
            "12.4% (combining 6.2% employee withholding + 6.2% employer matching tax)",
            "7.65%",
            "15.3%"
          ],
          "correctAnswer": 1,
          "explanation": "Line 5a calculates total Social Security tax: 12.4% on combined employee and employer shares."
        },
        {
          "id": "Q-AEP-166",
          "question": "What is the 'Next-Day Deposit Rule' under IRS employment tax regulations?",
          "options": [
            "Taxes can always be paid the next day without penalty",
            "If an employer accumulates $100,000 or more in federal employment taxes on any day during a deposit period, the taxes must be deposited by the close of the next business day",
            "Employees must deposit their paychecks the next day",
            "The rule applies only to agricultural businesses"
          ],
          "correctAnswer": 1,
          "explanation": "The $100,000 threshold overrides normal semi-weekly or monthly deposit schedules, compelling next-business-day electronic deposit."
        },
        {
          "id": "Q-AEP-167",
          "question": "What electronic system does the federal government mandate for depositing federal payroll taxes (FIT, FICA, FUTA)?",
          "options": [
            "PayPal or Venmo",
            "EFTPS (Electronic Federal Tax Payment System)",
            "Mailing cash via certified postal mail",
            "Cryptocurrency blockchain transfers"
          ],
          "correctAnswer": 1,
          "explanation": "EFTPS is the mandatory electronic clearing system for remitting all federal business and employment tax deposits."
        },
        {
          "id": "Q-AEP-168",
          "question": "How are fractions of cents variances reconciled on Form 941 Line 7?",
          "options": [
            "They are ignored and rounded to $100",
            "Line 7 allows modest adjustments for fractions of cents resulting from rounding differences between individual employee calculations and aggregate tax rates",
            "Fractions of cents are donated to the Department of the Treasury",
            "They must be deducted from the payroll manager's personal salary"
          ],
          "correctAnswer": 1,
          "explanation": "Line 7 accommodates minor arithmetic fractional cent differences arising from pay-period rounding across large workforces."
        },
        {
          "id": "Q-AEP-169",
          "question": "What is the penalty rate under IRC Section 6656 for a late federal tax deposit that is more than 15 days delinquent?",
          "options": [
            "1%",
            "10% of the underpayment (jumping to 15% if unremitted within 10 days of the first IRS notice)",
            "50%",
            "Zero penalty if paid within one year"
          ],
          "correctAnswer": 1,
          "explanation": "IRC Section 6656 imposes a 10% penalty on deposits overdue by more than 15 days, escalating to 15% upon notice issuance."
        },
        {
          "id": "Q-AEP-170",
          "question": "What information is typically submitted alongside state quarterly payroll tax filings?",
          "options": [
            "Photographs of all new hires",
            "Individual employee wage details: Employee SSN, full legal name, total gross wages, and SUTA taxable wages for the quarter",
            "The company's commercial lease agreement",
            "A list of company hardware inventory"
          ],
          "correctAnswer": 1,
          "explanation": "State quarterly wage listings require granular per-employee wage records to determine individual unemployment claim eligibility."
        }
      ]
    },
    {
      "id": "ASM-AEP-018",
      "courseId": "CRS-AEP-001",
      "chapterId": "CH-AEP-018",
      "title": "Assessment: Year-End Processing, Form W-2 & ACA Reporting",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-AEP-171",
          "question": "What is the mandatory federal deadline for an employer to furnish Form W-2 to employees and submit copies to the Social Security Administration (SSA)?",
          "options": [
            "December 31",
            "January 31 of the year following the tax year",
            "April 15",
            "March 31"
          ],
          "correctAnswer": 1,
          "explanation": "Under the PATH Act, Form W-2 must be furnished to employees and filed with the SSA by January 31."
        },
        {
          "id": "Q-AEP-172",
          "question": "What form serves as the summary transmittal document when filing paper Forms W-2 with the Social Security Administration?",
          "options": [
            "Form 940",
            "Form W-3 (Transmittal of Wage and Tax Statements)",
            "Form 1096",
            "Form 1099-NEC"
          ],
          "correctAnswer": 1,
          "explanation": "Form W-3 aggregates the totals of all individual Forms W-2, serving as the official transmittal to the SSA."
        },
        {
          "id": "Q-AEP-173",
          "question": "Which Form W-2 Box 12 code is used to report elective deferrals to a traditional Section 401(k) retirement plan?",
          "options": [
            "Code A",
            "Code D",
            "Code W",
            "Code DD"
          ],
          "correctAnswer": 1,
          "explanation": "Code D in Box 12 designates traditional Section 401(k) elective salary deferrals."
        },
        {
          "id": "Q-AEP-174",
          "question": "What does Code DD in Box 12 of Form W-2 represent?",
          "options": [
            "Direct Deposit bank account routing number",
            "Cost of employer-sponsored group health coverage (informational reporting under the Affordable Care Act)",
            "Delinquent disciplinary deductions",
            "Disability insurance payments"
          ],
          "correctAnswer": 1,
          "explanation": "Code DD reports the aggregate cost of employer-sponsored healthcare; it is purely informational and non-taxable."
        },
        {
          "id": "Q-AEP-175",
          "question": "What is the difference between Form 1099-NEC and Form 1099-MISC?",
          "options": [
            "Form 1099-NEC is for corporations; 1099-MISC is for partnerships",
            "Form 1099-NEC reports nonemployee compensation paid to independent contractors; Form 1099-MISC reports miscellaneous payments such as rent, prizes, and royalties",
            "Form 1099-NEC is an annual tax return for non-profit entities",
            "Both forms are completely interchangeable"
          ],
          "correctAnswer": 1,
          "explanation": "Form 1099-NEC isolates non-employee contractor pay, while 1099-MISC reports rents, royalties, and legal damages."
        },
        {
          "id": "Q-AEP-176",
          "question": "What threshold makes an employer an 'Applicable Large Employer' (ALE) subject to the Affordable Care Act (ACA) employer shared responsibility mandate?",
          "options": [
            "10 or more employees",
            "An average of 50 or more Full-Time Equivalent (FTE) employees during the preceding calendar year",
            "1,000 employees",
            "Only Fortune 500 corporations"
          ],
          "correctAnswer": 1,
          "explanation": "An ALE is an employer that employed an average of at least 50 full-time equivalent employees on business days during the preceding year."
        },
        {
          "id": "Q-AEP-177",
          "question": "What form must an Applicable Large Employer furnish annually to each full-time employee documenting healthcare offers under the ACA?",
          "options": [
            "Form W-4",
            "Form 1095-C (Employer-Provided Health Insurance Offer and Coverage)",
            "Form 1099-R",
            "Form 941-X"
          ],
          "correctAnswer": 1,
          "explanation": "Form 1095-C certifies to the employee and the IRS whether an affordable offer of minimum essential coverage was provided."
        },
        {
          "id": "Q-AEP-178",
          "question": "What form must an employer file to correct an error on a previously submitted Form W-2 that has already been filed with the SSA?",
          "options": [
            "Form 1040-X",
            "Form W-2c (Corrected Wage and Tax Statement) along with Form W-3c",
            "File a brand-new Form W-2 marked 'Duplicate'",
            "Send an email to the IRS commissioner"
          ],
          "correctAnswer": 1,
          "explanation": "Form W-2c and transmittal Form W-3c are the official statutory forms used to correct errors on filed W-2s."
        },
        {
          "id": "Q-AEP-179",
          "question": "Why must the sum of Box 1 on all Forms W-2 equal the sum of Line 2 across all four quarterly Forms 941 for that tax year?",
          "options": [
            "Because the SSA and IRS cross-reference annual wage totals; an imbalance triggers automated CP2000 and SSA reconciliation inquiry letters",
            "Imbalances cause computer printers to jam",
            "It is a guideline that is never enforced",
            "Because state laws mandate identical numbers"
          ],
          "correctAnswer": 0,
          "explanation": "The SSA and IRS share automated cross-check pipelines; discrepancies between quarterly 941s and annual W-2s trigger tax audit notices."
        },
        {
          "id": "Q-AEP-180",
          "question": "Under the ACA, what is an 'Affordable Offer of Coverage' safe harbor for employers?",
          "options": [
            "Giving employees $10 a month for vitamins",
            "Proving the employee's required premium contribution does not exceed a statutory percentage of their Form W-2 Box 1 wages, rate of pay, or federal poverty line",
            "Offering free health insurance to executives only",
            "Health insurance with a $20,000 annual deductible"
          ],
          "correctAnswer": 1,
          "explanation": "Safe harbors (W-2 wages, rate of pay, or federal poverty level) allow ALEs to mathematically prove coverage is legally affordable."
        }
      ]
    }
  ]
};
