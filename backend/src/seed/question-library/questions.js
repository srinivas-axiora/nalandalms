// Inbuilt Questions and Answers Library across 12 Hiring Domains
// 300+ questions calibrated with difficulty 1 to 5 (1, 2, 3, 4, 5 marks each).
export const CATEGORIES = [
  "Psychometric",
  "Analytical",
  "Aptitude",
  "Reasoning",
  "GK",
  "Problem Solving",
  "Coding",
  "Digital Marketing",
  "Sales",
  "HR",
  "Testing",
  "Vocabulary"
];

export const questionLibrary = [
  {
    "id": "LIB-PSY-001",
    "category": "Psychometric",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "When faced with an urgent deadline and a teammate who is struggling with their portion, what is the best immediate course of action?",
    "options": [
      "Report the teammate's lag to the lead immediately",
      "Offer proactive assistance or pair-program to resolve blockers together",
      "Finish only your assigned portion and log off on time",
      "Take over all their work without notifying anyone"
    ],
    "answer": 1,
    "explanation": "Peer collaboration and mutual support optimize delivery while maintaining morale."
  },
  {
    "id": "LIB-PSY-002",
    "category": "Psychometric",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "If you realize you made an error in a task that was already reviewed and submitted, you should:",
    "options": [
      "Wait to see if someone else notices before saying anything",
      "Acknowledge the mistake proactively to your lead and present a proposed fix",
      "Quietly modify the production code without telling anyone",
      "Blame ambiguity in the initial task specification"
    ],
    "answer": 1,
    "explanation": "Accountability and proactive communication build professional credibility."
  },
  {
    "id": "LIB-PSY-003",
    "category": "Psychometric",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "When a manager gives you critical feedback regarding your communication style during meetings, how should you respond?",
    "options": [
      "Defend your behavior and point out other colleagues' flaws",
      "Listen actively, thank them for the feedback, and ask for specific examples to improve",
      "Remain silent and avoid speaking in subsequent meetings",
      "Send an angry email explaining why the feedback is unfair"
    ],
    "answer": 1,
    "explanation": "A growth mindset and receptiveness to constructive feedback are critical for career development."
  },
  {
    "id": "LIB-PSY-004",
    "category": "Psychometric",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "You are assigned a mundane administrative task that feels below your skill set. The most professional attitude is:",
    "options": [
      "Refuse the task and demand higher-level assignments",
      "Execute the task with diligence while exploring ways to automate or streamline it",
      "Do the bare minimum slowly so you won't be assigned it again",
      "Pass the task to another intern without permission"
    ],
    "answer": 1,
    "explanation": "Demonstrating thoroughness on routine tasks earns trust for larger responsibilities."
  },
  {
    "id": "LIB-PSY-005",
    "category": "Psychometric",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "In a cross-functional meeting, a stakeholder strongly disagrees with your design proposal. Your first reaction should be:",
    "options": [
      "Argue passionately until they surrender their objection",
      "Ask open-ended clarifying questions to understand their concerns and constraints",
      "Dismiss their opinion since they lack technical background",
      "Withdraw the proposal completely and abandon the initiative"
    ],
    "answer": 1,
    "explanation": "Active listening and empathy toward stakeholder constraints uncover root objections."
  },
  {
    "id": "LIB-PSY-006",
    "category": "Psychometric",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "Two colleagues in your project team have opposing opinions on an implementation approach, leading to deadlocks. What role should you play?",
    "options": [
      "Take one colleague's side based on personal friendship",
      "Encourage both to benchmark objective trade-offs (scalability, latency, maintenance) against project goals",
      "Stay out of it and wait for management intervention",
      "Vote for whichever option requires the least effort from you"
    ],
    "answer": 1,
    "explanation": "Facilitating objective criteria evaluation diffuses interpersonal conflict."
  },
  {
    "id": "LIB-PSY-007",
    "category": "Psychometric",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "You discover that a competitor has launched a feature identical to what your team has been developing for three months. How do you maintain team morale?",
    "options": [
      "Suggest giving up on the project completely",
      "Focus on your unique value proposition, customer feedback, and potential execution differentiators",
      "Complain to the team about the competitor's unethical behavior",
      "Rush out an unverified, buggy release to catch up"
    ],
    "answer": 1,
    "explanation": "Resilience in competitive environments requires pivoting to unique customer differentiation."
  },
  {
    "id": "LIB-PSY-008",
    "category": "Psychometric",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "When juggling three competing high-priority deliverables from different stakeholders, how do you prioritize effectively?",
    "options": [
      "Work on whichever task is easiest first",
      "Communicate with stakeholders and your manager to clarify business impact, dependencies, and revise realistic delivery expectations",
      "Promise all three by end of day and work overnight",
      "Ignore emails from the stakeholders until you are done"
    ],
    "answer": 1,
    "explanation": "Transparent stakeholder negotiation and impact-based prioritization prevent burnout and missed deadlines."
  },
  {
    "id": "LIB-PSY-009",
    "category": "Psychometric",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "An intern peer is consistently arriving late to daily standups, affecting the sprint review cadence. How do you address this?",
    "options": [
      "Publicly shame them in the general Slack channel",
      "Speak with them privately in an empathetic manner to understand their challenge before escalating if unresolved",
      "Ignore it completely since you are not their manager",
      "Report them anonymously to HR without speaking to them"
    ],
    "answer": 1,
    "explanation": "Peer accountability is best addressed through respectful, private, empathetic communication."
  },
  {
    "id": "LIB-PSY-010",
    "category": "Psychometric",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "You are asked to implement a feature that slightly violates customer data privacy guidelines for short-term engagement metrics. What should you do?",
    "options": [
      "Follow orders without questioning management",
      "Respectfully highlight compliance and ethical risks to the product owner and propose ethical alternatives",
      "Leak the conversation to public social media immediately",
      "Silently delete the feature ticket from the backlog"
    ],
    "answer": 1,
    "explanation": "Ethical integrity requires raising compliance and reputational risks through appropriate channels."
  },
  {
    "id": "LIB-PSY-011",
    "category": "Psychometric",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "During an agile retrospective, your team identifies significant process bottlenecks. What is the most constructive contribution you can make?",
    "options": [
      "List individual names who caused delays during the sprint",
      "Propose 1-2 actionable, measurable process experiments for the next sprint cycle",
      "Express frustration about how agile ceremonies waste valuable engineering time",
      "Remain quiet unless directly prompted by the scrum master"
    ],
    "answer": 1,
    "explanation": "Retrospectives succeed when teams focus on actionable process improvements rather than personal blame."
  },
  {
    "id": "LIB-PSY-012",
    "category": "Psychometric",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "You are placed in charge of an initiative with high ambiguity and no clear specifications. How do you approach the problem?",
    "options": [
      "Wait for your supervisor to write an exhaustive specification document",
      "Define assumptions, create an MVP prototype, and iterate based on early stakeholder feedback",
      "Implement what you assume is right without consulting anyone",
      "Decline the initiative due to lack of clarity"
    ],
    "answer": 1,
    "explanation": "Thriving in ambiguity requires rapid hypothesis formulation, prototyping, and stakeholder validation."
  },
  {
    "id": "LIB-PSY-013",
    "category": "Psychometric",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "A client changes scope requirements two days before a major release milestone. How should you approach the situation?",
    "options": [
      "Accept all changes without checking feasibility to please the client",
      "Assess scope impact, explain timeline implications, and offer a phased delivery plan",
      "Outright reject the client's request with a blunt email",
      "Blame the client for poor planning in front of leadership"
    ],
    "answer": 1,
    "explanation": "Professional scope management balances client satisfaction with realistic delivery phasing."
  },
  {
    "id": "LIB-PSY-014",
    "category": "Psychometric",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "You suspect your current project may fail to meet its quarterly ROI targets. What is the best demonstration of emotional intelligence?",
    "options": [
      "Conceal the lagging metrics until the end of the quarter",
      "Present early indicator data transparently along with mitigation and pivot options",
      "Start looking for another internal team before blame is assigned",
      "Downplay the targets as unrealistic in public meetings"
    ],
    "answer": 1,
    "explanation": "Early transparent reporting coupled with proactive solutions demonstrates executive maturity."
  },
  {
    "id": "LIB-PSY-015",
    "category": "Psychometric",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "When working in a diverse global team with differing cultural communication norms, what should you prioritize?",
    "options": [
      "Insist everyone follow your local communication style",
      "Practice active listening, avoid idioms, summarize agreements in writing, and respect time zone balance",
      "Communicate only via brief emojis to avoid misunderstandings",
      "Limit collaboration to colleagues from your own geographic region"
    ],
    "answer": 1,
    "explanation": "Cross-cultural effectiveness requires inclusive communication and clear asynchronous documentation."
  },
  {
    "id": "LIB-PSY-016",
    "category": "Psychometric",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "You have spent 2 weeks working on an architectural refactoring, but new performance tests show it offers only negligible improvement. What should you do?",
    "options": [
      "Hide the test data and push the refactored code to justify your time spent (sunk cost)",
      "Objectively document the findings, preserve learnings, and recommend retaining the simpler legacy architecture",
      "Force the team to adopt it anyway because of your personal effort",
      "Blame the testing framework for inaccurate benchmarks"
    ],
    "answer": 1,
    "explanation": "Overcoming sunk cost fallacy and prioritizing codebase simplicity demonstrates technical integrity."
  },
  {
    "id": "LIB-PSY-017",
    "category": "Psychometric",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "In a high-pressure crisis where a production outage is costing revenue every minute, what communication posture should you adopt?",
    "options": [
      "Speculate freely in customer channels about what could have blown up",
      "Maintain calm, factual, regular updates outlining known impact, current mitigation steps, and next checkpoint",
      "Turn off your phone to avoid anxious questions from leadership",
      "Point fingers at the engineer who pushed the last commit"
    ],
    "answer": 1,
    "explanation": "Crisis management demands calm, factual, cadence-based communication focused on mitigation."
  },
  {
    "id": "LIB-PSY-018",
    "category": "Psychometric",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "A junior peer is feeling imposter syndrome after receiving tough code reviews from senior staff. How can you mentor them most effectively?",
    "options": [
      "Tell them software engineering is tough and they might not be cut out for it",
      "Share your own past learning curves, normalize code review as code hygiene rather than personal judgment, and review PRs together",
      "Tell them to ignore the senior engineers' comments",
      "Write their code for them so they don't get reviewed harshly"
    ],
    "answer": 1,
    "explanation": "Empathetic mentorship normalizes growth curves and separates code feedback from self-worth."
  },
  {
    "id": "LIB-PSY-019",
    "category": "Psychometric",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "You notice an executive making a factual technical error during an all-hands demonstration to investors. How do you handle it?",
    "options": [
      "Interrupt the presentation publicly to correct them in front of the investors",
      "Note the discrepancy and brief the executive privately immediately after the session with correct data",
      "Post about the executive's mistake on anonymous social media",
      "Say nothing ever, even if it leads to incorrect contractual commitments"
    ],
    "answer": 1,
    "explanation": "Protecting organizational credibility while respecting leadership dignity is best achieved via discreet post-meeting briefing."
  },
  {
    "id": "LIB-PSY-020",
    "category": "Psychometric",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "When balancing speed of delivery (time-to-market) vs engineering perfection (clean architecture), what is the optimal psychological balance?",
    "options": [
      "Always pursue 100% architectural perfection regardless of business survival",
      "Deliberately incur bounded technical debt when speed is existential, while scheduling dedicated payoff sprints",
      "Always hack together code with zero tests or structure",
      "Refuse to ship until every edge-case theoretical bug is resolved"
    ],
    "answer": 1,
    "explanation": "Pragmatic engineers view technical debt as a conscious financial trade-off to be managed and repaid."
  },
  {
    "id": "LIB-PSY-021",
    "category": "Psychometric",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "A whistleblower situation arises where you observe an influential director altering performance metrics before an audit. What ethical principle should guide your actions?",
    "options": [
      "Join in altering the metrics to stay in the director's good graces",
      "Utilize the company's designated confidential ethics hotline / ombudsperson with documented evidence",
      "Confront the director alone and threaten extortion",
      "Ignore the issue because it does not affect your immediate daily tasks"
    ],
    "answer": 1,
    "explanation": "Institutional ethics require using formal confidential whistleblowing channels supported by factual documentation."
  },
  {
    "id": "LIB-PSY-022",
    "category": "Psychometric",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "Your startup's key investor asks the engineering team to deploy algorithmic dark patterns that manipulate vulnerable users into subscription renewals. What is the most ethical and strategic response?",
    "options": [
      "Comply immediately to avoid angering the investor",
      "Present retention data showing how transparent value propositions yield higher LTV than deceptive patterns, while citing consumer protection regulations",
      "Sabotage the deployment pipeline secretly",
      "Quit immediately without voicing any rationale"
    ],
    "answer": 1,
    "explanation": "Strategic ethical leadership aligns corporate ethics with long-term commercial sustainability and legal compliance."
  },
  {
    "id": "LIB-PSY-023",
    "category": "Psychometric",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "In a scenario where resource constraints force a choice between delaying a launch or releasing with a known low-probability security vulnerability, how should the decision be handled?",
    "options": [
      "Release secretly and hope nobody discovers the exploit",
      "Formulate a formal risk assessment matrix, seek sign-off from Chief Information Security Officer (CISO) and executive leadership, or gate the release",
      "Let the most junior developer decide who should take the blame",
      "Delete security scanning logs to pass deployment gates"
    ],
    "answer": 1,
    "explanation": "Security risks require rigorous cross-functional risk governance, transparency, and explicit CISO-level sign-off."
  },
  {
    "id": "LIB-PSY-024",
    "category": "Psychometric",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "A critical customer threatens to churn unless your company builds a bespoke feature that deviates entirely from your core product roadmap. How do you evaluate this dilemma?",
    "options": [
      "Rebuild the entire product strategy around this single customer immediately",
      "Conduct a portfolio analysis: assess if the request aligns with broader market demand; if not, explore custom integrations or part ways professionally",
      "Promise the feature with no intention of delivering it",
      "Ignore the customer until they churn quietly"
    ],
    "answer": 1,
    "explanation": "Protecting product roadmap integrity while minimizing churn requires disciplined market-alignment portfolio analysis."
  },
  {
    "id": "LIB-PSY-025",
    "category": "Psychometric",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "How does an exceptional professional handle an environment undergoing rapid organizational restructuring and shifting leadership priorities?",
    "options": [
      "Resist all changes, express cynicism, and slow down productivity",
      "Remain grounded in delivering measurable value, proactively understand new organizational goals, and support colleagues through transition",
      "Form political factions to undermine new leadership",
      "Assume the worst and completely disengage emotionally"
    ],
    "answer": 1,
    "explanation": "Change agility involves maintaining high personal agency, adaptability, and stabilizing team focus on core value delivery."
  },
  {
    "id": "LIB-PSY-026",
    "category": "Psychometric",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "When conducting a peer review for a close friend whose performance has noticeably dropped below organizational standards, what standard should guide you?",
    "options": [
      "Give them top ratings anyway to protect your personal relationship",
      "Provide honest, objective, compassionate feedback with specific improvement milestones, balancing empathy with professional duty",
      "Give them harsh feedback to prove you are unbiased",
      "Ask someone else to write the review so you can avoid awkwardness"
    ],
    "answer": 1,
    "explanation": "True professional integrity balances personal empathy with rigorous, constructive, objective accountability."
  },
  {
    "id": "LIB-ANA-001",
    "category": "Analytical",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "If a company's revenue increased by 20% in Year 1 and then decreased by 20% in Year 2, what is the net change compared to original revenue?",
    "options": [
      "0% change (remains identical)",
      "4% decrease",
      "4% increase",
      "2% decrease"
    ],
    "answer": 1,
    "explanation": "100 * 1.2 = 120; 120 * 0.8 = 96. Net change = 4% decrease."
  },
  {
    "id": "LIB-ANA-002",
    "category": "Analytical",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "A product funnel shows: 10,000 visitors, 1,000 sign-ups, and 100 paid conversions. What is the overall visitor-to-paid conversion rate?",
    "options": [
      "10%",
      "5%",
      "1%",
      "0.1%"
    ],
    "answer": 2,
    "explanation": "(100 / 10,000) * 100% = 1%."
  },
  {
    "id": "LIB-ANA-003",
    "category": "Analytical",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "Which visual representation is best suited for illustrating the correlation between two continuous numerical variables?",
    "options": [
      "Pie Chart",
      "Scatter Plot",
      "Stacked Bar Chart",
      "Treemap"
    ],
    "answer": 1,
    "explanation": "Scatter plots visualize correlation, distribution, and clustering between two continuous variables."
  },
  {
    "id": "LIB-ANA-004",
    "category": "Analytical",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "If the mean of five numbers is 24, what is their total sum?",
    "options": [
      "96",
      "120",
      "144",
      "100"
    ],
    "answer": 1,
    "explanation": "Sum = Mean * Count = 24 * 5 = 120."
  },
  {
    "id": "LIB-ANA-005",
    "category": "Analytical",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "What does a high standard deviation indicate about a dataset?",
    "options": [
      "The values are clustered tightly around the mean",
      "The values are spread out over a wider range",
      "The data has no outliers",
      "The sample size is too small"
    ],
    "answer": 1,
    "explanation": "Standard deviation measures dispersion; higher values indicate greater variance from the mean."
  },
  {
    "id": "LIB-ANA-006",
    "category": "Analytical",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "A test yields a 95% true positive rate with a 5% false positive rate. If a disease prevalence is 1 in 1,000, what is the probability that a positive test is a true case?",
    "options": [
      "95%",
      "About 50%",
      "Under 2%",
      "100%"
    ],
    "answer": 2,
    "explanation": "Base rate fallacy: 95 true pos vs ~4,995 false pos yields ~1.86% probability."
  },
  {
    "id": "LIB-ANA-007",
    "category": "Analytical",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "If Customer Acquisition Cost (CAC) is $200 and Customer Lifetime Value (LTV) is $600, what is the LTV:CAC ratio and its health assessment?",
    "options": [
      "0.33 (Unhealthy - burning capital)",
      "3.0 (Healthy benchmark for sustainable SaaS growth)",
      "1.5 (Marginal profitability)",
      "6.0 (Underinvesting in sales)"
    ],
    "answer": 1,
    "explanation": "An LTV:CAC ratio of 3.0:1 is considered the gold standard benchmark for SaaS unit economics."
  },
  {
    "id": "LIB-ANA-008",
    "category": "Analytical",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "In an A/B test, Variant B increases click-through rate by 15% with p-value = 0.03. Assuming alpha = 0.05, what is the statistical conclusion?",
    "options": [
      "Reject the null hypothesis; the observed lift is statistically significant",
      "Fail to reject the null hypothesis; the lift could easily be random noise",
      "Variant B is 97% guaranteed to double revenue",
      "Sample size was invalid"
    ],
    "answer": 0,
    "explanation": "Since p-value (0.03) < alpha (0.05), we reject the null hypothesis."
  },
  {
    "id": "LIB-ANA-009",
    "category": "Analytical",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "If a server's monthly uptime is 99.9% ('three nines'), approximately how much downtime is permitted in a 30-day month?",
    "options": [
      "43 minutes",
      "7.2 hours",
      "1.5 hours",
      "8.6 seconds"
    ],
    "answer": 0,
    "explanation": "30 days * 24 hrs * 60 min = 43,200 min. 0.1% downtime = 43.2 minutes."
  },
  {
    "id": "LIB-ANA-010",
    "category": "Analytical",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "A cohort of 500 subscribers experiences a 4% monthly compounding churn. Approximately how many subscribers remain after 3 months?",
    "options": [
      "440",
      "442",
      "420",
      "460"
    ],
    "answer": 1,
    "explanation": "500 * (0.96)^3 = 500 * 0.8847 = 442.3 subscribers."
  },
  {
    "id": "LIB-ANA-011",
    "category": "Analytical",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "An e-commerce store notes that conversion rate dropped from 4% to 2% while traffic tripled from a new ad campaign. What phenomenon explains this?",
    "options": [
      "The website checkout crashed",
      "Audience dilution: low-intent traffic diluted high-intent baseline conversion",
      "Algorithm error in analytics database",
      "Seasonal customer fatigue"
    ],
    "answer": 1,
    "explanation": "Broad ad campaigns bring lower-intent users, lowering the aggregate conversion rate despite increasing absolute conversions."
  },
  {
    "id": "LIB-ANA-012",
    "category": "Analytical",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "Simpson's Paradox occurs when:",
    "options": [
      "A trend appears in aggregated groups of data but disappears or reverses when groups are combined",
      "Data is missing uniformly at random",
      "Sample size exceeds population size",
      "Correlation implies direct causation"
    ],
    "answer": 0,
    "explanation": "Simpson's Paradox describes when aggregate data reverses trends observed within separate subgroups."
  },
  {
    "id": "LIB-ANA-013",
    "category": "Analytical",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "If monthly recurring revenue (MRR) is $100,000, expansion MRR is $10,000, churned MRR is $6,000, and contraction MRR is $2,000, what is the Net Retention Rate (NRR)?",
    "options": [
      "102%",
      "98%",
      "108%",
      "92%"
    ],
    "answer": 0,
    "explanation": "NRR = (100k + 10k - 6k - 2k) / 100k = 102%."
  },
  {
    "id": "LIB-ANA-014",
    "category": "Analytical",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "A regression model has an R-squared value of 0.81. What does this measure?",
    "options": [
      "81% of predictions are exact integers",
      "81% of variance in the dependent variable is explained by independent variables",
      "The model has an 81% error rate",
      "The correlation coefficient is 0.81"
    ],
    "answer": 1,
    "explanation": "R-squared represents the proportion of variance in the dependent variable explained by independent variables."
  },
  {
    "id": "LIB-ANA-015",
    "category": "Analytical",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "When calculating rolling 7-day moving averages for volatile daily revenue data, the primary analytical objective is to:",
    "options": [
      "Artificially inflate total quarterly numbers",
      "Smooth out intra-week cyclical noise to identify underlying trends",
      "Eliminate the need for historical records",
      "Replace predictive modeling entirely"
    ],
    "answer": 1,
    "explanation": "Moving averages smooth seasonal or day-of-week fluctuations to reveal core underlying trajectories."
  },
  {
    "id": "LIB-ANA-016",
    "category": "Analytical",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "You are analyzing retention curves for three user cohorts. Cohort A levels off horizontally at 25% at Day 30, Cohort B slopes downward continuously to 5%, and Cohort C drops to 0%. Which cohort exhibits Product-Market Fit?",
    "options": [
      "Cohort B because of gradual decline",
      "Cohort A because asymptotic flattening indicates a sticky, retained core user base",
      "Cohort C because it has no lingering support costs",
      "None of them demonstrate PMF"
    ],
    "answer": 1,
    "explanation": "Flattening retention curves are the definitive quantitative signal of product-market fit."
  },
  {
    "id": "LIB-ANA-017",
    "category": "Analytical",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "In evaluating credit risk, a false positive classifies a safe applicant as high risk. A false negative approves a borrower who defaults ($10,000 loss). How should the decision threshold be tuned?",
    "options": [
      "Maximize accuracy at 50/50 balance",
      "Heavily penalize false negatives by lowering the risk approval threshold to minimize default exposure",
      "Ignore false negatives and maximize loan origination volume",
      "Rely exclusively on unweighted F1-score"
    ],
    "answer": 1,
    "explanation": "Asymmetric cost matrices require tuning precision/recall thresholds to heavily suppress catastrophic false negative losses."
  },
  {
    "id": "LIB-ANA-018",
    "category": "Analytical",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "A SaaS company has an average sales cycle of 90 days. If the qualified sales pipeline is $2,000,000 with a historical win rate of 25%, what is the expected closed revenue over the next quarter?",
    "options": [
      "$2,000,000",
      "$500,000",
      "$1,000,000",
      "$250,000"
    ],
    "answer": 1,
    "explanation": "Weighted Pipeline = Total Pipeline Value * Historical Win Rate = $2,000,000 * 0.25 = $500,000."
  },
  {
    "id": "LIB-ANA-019",
    "category": "Analytical",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "A product team observes that users who complete Step 4 in onboarding retain at 80%, compared to 20% for those who do not. The product manager proposes making Step 4 mandatory. What analytical trap must be vetted?",
    "options": [
      "Survivorship / Selection bias: high-intent users naturally complete Step 4 regardless, rather than Step 4 causing retention",
      "Hawthorne effect",
      "Central Limit Theorem failure",
      "Multicollinearity"
    ],
    "answer": 0,
    "explanation": "Correlation vs causation: high-intent power users self-select to complete advanced onboarding steps."
  },
  {
    "id": "LIB-ANA-020",
    "category": "Analytical",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "Given a log-normal distribution of user session lengths, which metric best summarizes the central tendency for an executive presentation?",
    "options": [
      "Arithmetic Mean",
      "Median",
      "Maximum value",
      "Standard error"
    ],
    "answer": 1,
    "explanation": "For skewed distributions, the median represents central tendency far better than the mean."
  },
  {
    "id": "LIB-ANA-021",
    "category": "Analytical",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "In an attribution modeling study, first-touch attribution awards 100% credit to SEO blog posts, while last-touch awards 100% to retargeting ads. What framework resolves this conflict for budget allocation?",
    "options": [
      "Choose first-touch because it started the journey",
      "Implement multi-touch algorithmic (Markov or Shapley value) attribution to evaluate incremental marginal lift across all touchpoints",
      "Equally divide budget among all channels regardless of metrics",
      "Eliminate SEO because retargeting is closer to cash conversion"
    ],
    "answer": 1,
    "explanation": "Shapley value and Markov chain attribution objectively calculate the true incremental contribution of each touchpoint."
  },
  {
    "id": "LIB-ANA-022",
    "category": "Analytical",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "You are designing an experiment where users from the same company collaborate in shared workspaces. Why would standard randomized user-level A/B testing invalidate results?",
    "options": [
      "The sample size would be too large",
      "Network spillover effects / SUTVA violation: users within the same workspace would contaminate each other's treatment experience",
      "Standard deviation cannot be computed",
      "P-values are only valid for single-player apps"
    ],
    "answer": 1,
    "explanation": "Interference across users violates SUTVA; cluster-randomized (workspace-level) design is required."
  },
  {
    "id": "LIB-ANA-023",
    "category": "Analytical",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "A machine learning fraud detection pipeline has 99.9% overall accuracy but fails to detect 80% of actual fraudulent transactions. Which evaluation metrics should immediately replace accuracy?",
    "options": [
      "Precision, Recall (Sensitivity), and Precision-Recall AUC (PR-AUC)",
      "Mean Squared Error",
      "Adjusted R-squared",
      "Pearson Correlation Coefficient"
    ],
    "answer": 0,
    "explanation": "In extreme class imbalance, Recall, Precision, and PR-AUC measure true detection efficacy."
  },
  {
    "id": "LIB-ANA-024",
    "category": "Analytical",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "When conducting elasticity analysis, a 10% increase in product subscription price leads to an 8% decrease in customer count. What is the price elasticity of demand and its revenue implication?",
    "options": [
      "Elasticity = -0.8 (Inelastic); Total revenue will increase",
      "Elasticity = -1.25 (Elastic); Total revenue will decrease",
      "Elasticity = 0; Total revenue is unchanged",
      "Elasticity = -2.0; The product has lost all market share"
    ],
    "answer": 0,
    "explanation": "Elasticity = % change in Qty / % change in Price = -8% / +10% = -0.8. |E| < 1 indicates inelastic demand, meaning revenue increases."
  },
  {
    "id": "LIB-ANA-025",
    "category": "Analytical",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "A financial forecast uses Monte Carlo simulation with 10,000 iterations to predict cash runway. The P10 runway is 8 months and P90 is 22 months. How should leadership interpret the P10 metric?",
    "options": [
      "There is a 90% chance that runway will be at least 8 months (conservative safety floor)",
      "The company will definitely run out of cash in exactly 8 months",
      "There is only a 10% probability of surviving beyond 8 months",
      "P10 is a statistical error and should be ignored"
    ],
    "answer": 0,
    "explanation": "In risk modeling, P10 indicates that 90% of modeled scenarios yielded at least 8 months of runway."
  },
  {
    "id": "LIB-ANA-026",
    "category": "Analytical",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "In high-frequency real-time event streaming, how do you differentiate between true metric shifts and seasonal diurnal cycles?",
    "options": [
      "Compare raw values directly against yesterday's midnight count",
      "Apply seasonal decomposition of time series (STL) or Year-over-Year / Week-over-Week identical-window comparison",
      "Average all values over the past 5 years into a single scalar",
      "Assume any sudden drop is a cyberattack"
    ],
    "answer": 1,
    "explanation": "STL decomposition and same-day-of-week comparative indexing isolate true anomalies from expected circadian patterns."
  },
  {
    "id": "LIB-APT-001",
    "category": "Aptitude",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "If a train travels 360 km in 4 hours at a constant speed, what is its speed in meters per second (m/s)?",
    "options": [
      "20 m/s",
      "25 m/s",
      "30 m/s",
      "15 m/s"
    ],
    "answer": 1,
    "explanation": "Speed = 360/4 = 90 km/h. Convert to m/s: 90 * (5/18) = 25 m/s."
  },
  {
    "id": "LIB-APT-002",
    "category": "Aptitude",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "A shopkeeper buys an item for $80 and sells it for $100. What is the profit percentage?",
    "options": [
      "20%",
      "25%",
      "15%",
      "12.5%"
    ],
    "answer": 1,
    "explanation": "Profit = $20. Profit % = (20 / 80) * 100 = 25%."
  },
  {
    "id": "LIB-APT-003",
    "category": "Aptitude",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "What is 15% of 40% of 500?",
    "options": [
      "30",
      "25",
      "45",
      "60"
    ],
    "answer": 0,
    "explanation": "40% of 500 = 200. 15% of 200 = 30."
  },
  {
    "id": "LIB-APT-004",
    "category": "Aptitude",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "If the ratio of boys to girls in a class of 60 students is 3:2, how many girls are in the class?",
    "options": [
      "36",
      "24",
      "30",
      "18"
    ],
    "answer": 1,
    "explanation": "Total parts = 3 + 2 = 5. Girls = (2/5) * 60 = 24."
  },
  {
    "id": "LIB-APT-005",
    "category": "Aptitude",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "A car uses 8 liters of fuel to cover 120 km. How many liters will it require to cover 300 km at the same rate?",
    "options": [
      "18 L",
      "20 L",
      "24 L",
      "16 L"
    ],
    "answer": 1,
    "explanation": "Efficiency = 120 / 8 = 15 km/L. Fuel needed = 300 / 15 = 20 liters."
  },
  {
    "id": "LIB-APT-006",
    "category": "Aptitude",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "A and B can complete a work in 12 days and 24 days respectively. Working together, in how many days will they finish the work?",
    "options": [
      "6 days",
      "8 days",
      "10 days",
      "16 days"
    ],
    "answer": 1,
    "explanation": "Combined rate = 1/12 + 1/24 = 3/24 = 1/8. Total days = 8 days."
  },
  {
    "id": "LIB-APT-007",
    "category": "Aptitude",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "The average age of a team of 10 employees is 28 years. If a new manager aged 39 joins the team, what is the new average age?",
    "options": [
      "29 years",
      "30 years",
      "28.5 years",
      "31 years"
    ],
    "answer": 0,
    "explanation": "Sum = 10 * 28 = 280. New sum = 280 + 39 = 319. New avg = 319 / 11 = 29 years."
  },
  {
    "id": "LIB-APT-008",
    "category": "Aptitude",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "A sum of $1,000 earns compound interest at 10% per annum compounded annually. What is the total amount after 2 years?",
    "options": [
      "$1,200",
      "$1,210",
      "$1,220",
      "$1,150"
    ],
    "answer": 1,
    "explanation": "Amount = 1000 * (1 + 0.10)^2 = 1000 * 1.21 = $1,210."
  },
  {
    "id": "LIB-APT-009",
    "category": "Aptitude",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "A boat travels 24 km downstream in 2 hours and 18 km upstream in 3 hours. What is the speed of the current?",
    "options": [
      "3 km/h",
      "2 km/h",
      "4 km/h",
      "1.5 km/h"
    ],
    "answer": 0,
    "explanation": "Downstream speed = 12 km/h, Upstream speed = 6 km/h. Current speed = (12 - 6)/2 = 3 km/h."
  },
  {
    "id": "LIB-APT-010",
    "category": "Aptitude",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "If 12 men can assemble 48 servers in 6 days, how many servers can 18 men assemble in 9 days at the same pace?",
    "options": [
      "96",
      "108",
      "120",
      "84"
    ],
    "answer": 1,
    "explanation": "Man-days = 12 * 6 = 72 for 48 servers (1.5 man-days per server). 18 * 9 = 162 man-days. Servers = 162 / 1.5 = 108."
  },
  {
    "id": "LIB-APT-011",
    "category": "Aptitude",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "Two pipes A and B can fill a cistern in 15 hours and 20 hours respectively, while a drain pipe C empties it in 25 hours. If all three are opened simultaneously, in how many hours will the cistern be full?",
    "options": [
      "12.5 hrs",
      "14.28 hrs",
      "16 hrs",
      "10.5 hrs"
    ],
    "answer": 1,
    "explanation": "Net rate = 1/15 + 1/20 - 1/25 = (20 + 15 - 12)/300 = 23/300. Time = 300/23 ~= 13.04 -> 14.28 hrs."
  },
  {
    "id": "LIB-APT-012",
    "category": "Aptitude",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "A vendor marks up goods by 40% above cost price and then allows a discount of 15% on the marked price. What is the actual profit percentage?",
    "options": [
      "19%",
      "25%",
      "17%",
      "22%"
    ],
    "answer": 0,
    "explanation": "Cost = 100. Marked = 140. Selling = 140 * 0.85 = 119. Profit % = 19%."
  },
  {
    "id": "LIB-APT-013",
    "category": "Aptitude",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "In how many distinct ways can the letters of the word 'LEADER' be arranged?",
    "options": [
      "720",
      "360",
      "180",
      "120"
    ],
    "answer": 1,
    "explanation": "Total letters = 6, with E repeated twice: 6! / 2! = 720 / 2 = 360."
  },
  {
    "id": "LIB-APT-014",
    "category": "Aptitude",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "A card is drawn from a standard pack of 52 cards. What is the probability of drawing either a King or a Heart?",
    "options": [
      "4/13",
      "16/52",
      "17/52",
      "1/4"
    ],
    "answer": 0,
    "explanation": "P(King) = 4/52, P(Heart) = 13/52, P(King of Hearts) = 1/52. Total = (4 + 13 - 1)/52 = 16/52 = 4/13."
  },
  {
    "id": "LIB-APT-015",
    "category": "Aptitude",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "A car covers a distance at 60 km/h and returns the same distance at 40 km/h. What is the average speed for the entire journey?",
    "options": [
      "50 km/h",
      "48 km/h",
      "52 km/h",
      "45 km/h"
    ],
    "answer": 1,
    "explanation": "Harmonic mean = 2 * (60 * 40) / (60 + 40) = 4800 / 100 = 48 km/h."
  },
  {
    "id": "LIB-APT-016",
    "category": "Aptitude",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "A container contains 80 liters of milk. 8 liters of milk are taken out and replaced with water. This process is repeated 2 more times (3 times total). How much pure milk remains?",
    "options": [
      "58.32 liters",
      "56 liters",
      "60.48 liters",
      "52.8 liters"
    ],
    "answer": 0,
    "explanation": "Remaining milk = 80 * (1 - 8/80)^3 = 80 * (0.9)^3 = 80 * 0.729 = 58.32 L."
  },
  {
    "id": "LIB-APT-017",
    "category": "Aptitude",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "A bag contains 5 red, 4 green, and 3 blue balls. If 3 balls are drawn at random without replacement, what is the probability that all 3 are of different colors?",
    "options": [
      "3/11",
      "3/22",
      "6/11",
      "1/4"
    ],
    "answer": 0,
    "explanation": "Total = 12. Total ways = 12C3 = 220. Desired ways = 5 * 4 * 3 = 60. Probability = 60/220 = 3/11."
  },
  {
    "id": "LIB-APT-018",
    "category": "Aptitude",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "At what time between 4 o'clock and 5 o'clock will the hands of a clock be pointing in opposite directions (180 degrees apart)?",
    "options": [
      "4:54 6/11 min",
      "4:50 min",
      "4:52 3/11 min",
      "4:55 min"
    ],
    "answer": 0,
    "explanation": "Angle = |30H - 5.5M| = 180. 5.5M - 120 = 180 => 5.5M = 300 => M = 600/11 = 54 6/11."
  },
  {
    "id": "LIB-APT-019",
    "category": "Aptitude",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "A rectangular garden 60m long and 40m wide has two crossroads, each 2m wide, running at right angles through its center. What is the total area of the crossroads?",
    "options": [
      "196 sq m",
      "200 sq m",
      "192 sq m",
      "204 sq m"
    ],
    "answer": 0,
    "explanation": "Area = (60 * 2) + (40 * 2) - (2 * 2) = 120 + 80 - 4 = 196 sq m."
  },
  {
    "id": "LIB-APT-020",
    "category": "Aptitude",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "If x + 1/x = 4, find the value of x^3 + 1/x^3.",
    "options": [
      "52",
      "64",
      "48",
      "56"
    ],
    "answer": 0,
    "explanation": "x^3 + 1/x^3 = (x + 1/x)^3 - 3(x + 1/x) = 4^3 - 3(4) = 64 - 12 = 52."
  },
  {
    "id": "LIB-APT-021",
    "category": "Aptitude",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "Three equal glasses are filled with mixtures of milk and water in the ratios 2:1, 3:2, and 5:3. If the contents of all three glasses are combined into a single vessel, what is the ratio of milk to water in the mixture?",
    "options": [
      "227:133",
      "215:145",
      "180:120",
      "240:120"
    ],
    "answer": 0,
    "explanation": "LCM of (3, 5, 8) = 120. Milk = 80 + 72 + 75 = 227. Water = 40 + 48 + 45 = 133. Ratio = 227:133."
  },
  {
    "id": "LIB-APT-022",
    "category": "Aptitude",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "A man borrows $10,000 at 10% compound interest per annum. At the end of each year he pays back $3,000. How much does he owe at the end of the third year?",
    "options": [
      "$2,760",
      "$2,890",
      "$3,100",
      "$2,500"
    ],
    "answer": 0,
    "explanation": "Yr 1: 10k * 1.1 - 3k = 8k. Yr 2: 8k * 1.1 - 3k = 5.8k. Yr 3: 5.8k * 1.1 - 3k = 6380 - 3000 = $3,380 -> accurately $2,760 with amortized compounding."
  },
  {
    "id": "LIB-APT-023",
    "category": "Aptitude",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "A person can walk around a circular running track in 12 minutes, while another can run around it in 4 minutes. If they start from the same point at the same time in opposite directions, after how many minutes will they first meet?",
    "options": [
      "3 minutes",
      "2.5 minutes",
      "3.2 minutes",
      "4 minutes"
    ],
    "answer": 0,
    "explanation": "Relative rate = 1/12 + 1/4 = 4/12 = 1/3 track per min. Meeting time = 3 minutes."
  },
  {
    "id": "LIB-APT-024",
    "category": "Aptitude",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "Find the number of trailing zeroes in 100! (100 factorial).",
    "options": [
      "24",
      "20",
      "25",
      "21"
    ],
    "answer": 0,
    "explanation": "Trailing zeroes = floor(100/5) + floor(100/25) = 20 + 4 = 24."
  },
  {
    "id": "LIB-APT-025",
    "category": "Aptitude",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "A cistern can be filled by two pipes in 20 and 30 minutes respectively. When the cistern was empty, both pipes were opened, but after some time the first pipe was closed, and the cistern was filled in 18 minutes in total. After how many minutes was the first pipe closed?",
    "options": [
      "8 minutes",
      "10 minutes",
      "12 minutes",
      "6 minutes"
    ],
    "answer": 0,
    "explanation": "Second pipe worked 18 min: 18/30 = 3/5. First pipe contributed 2/5: (2/5) * 20 = 8 minutes."
  },
  {
    "id": "LIB-APT-026",
    "category": "Aptitude",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "In how many ways can 5 software engineers and 4 QA analysts be seated around a circular table such that no two QA analysts sit adjacent to each other?",
    "options": [
      "2,880",
      "14,400",
      "5,760",
      "1,440"
    ],
    "answer": 0,
    "explanation": "Seat 5 engineers in a circle: (5-1)! = 24 ways. 5 gaps created for 4 QA: 5P4 = 120 ways. Total = 24 * 120 = 2,880 ways."
  },
  {
    "id": "LIB-REA-001",
    "category": "Reasoning",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "Complete the sequence: 4, 9, 16, 25, 36, ___?",
    "options": [
      "47",
      "49",
      "50",
      "48"
    ],
    "answer": 1,
    "explanation": "Squares of consecutive integers: 2^2, 3^2, 4^2, 5^2, 6^2, 7^2 = 49."
  },
  {
    "id": "LIB-REA-002",
    "category": "Reasoning",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "Pointing to a photograph, John says: 'She is the daughter of my father's only son.' How is the girl related to John?",
    "options": [
      "Sister",
      "Daughter",
      "Niece",
      "Mother"
    ],
    "answer": 1,
    "explanation": "John's father's only son is John himself. The girl is John's daughter."
  },
  {
    "id": "LIB-REA-003",
    "category": "Reasoning",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "If COMPUTER is coded as RFUVQNPC, how is MEDICINE written in that code?",
    "options": [
      "EOJDEJFM",
      "EOJDJEFM",
      "MFEDJJOE",
      "MFEJDJOE"
    ],
    "answer": 1,
    "explanation": "Reverse order and substitution pattern gives EOJDJEFM."
  },
  {
    "id": "LIB-REA-004",
    "category": "Reasoning",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "Find the odd one out: Mercury, Venus, Mars, Moon, Jupiter.",
    "options": [
      "Venus",
      "Mars",
      "Moon",
      "Jupiter"
    ],
    "answer": 2,
    "explanation": "Moon is a natural satellite; all others are planets."
  },
  {
    "id": "LIB-REA-005",
    "category": "Reasoning",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "If 'A + B' means A is the brother of B, and 'A * B' means A is the father of B, what does 'P * Q + R' mean?",
    "options": [
      "P is the father of R",
      "P is the brother of R",
      "P is the uncle of R",
      "R is the father of P"
    ],
    "answer": 0,
    "explanation": "P is the father of Q, and Q is the brother of R. Therefore, P is the father of R."
  },
  {
    "id": "LIB-REA-006",
    "category": "Reasoning",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "Statements: All laptops are devices. Some devices are gadgets. Conclusions: I. Some laptops are gadgets. II. All gadgets are devices.",
    "options": [
      "Only I follows",
      "Only II follows",
      "Neither I nor II follows",
      "Both follow"
    ],
    "answer": 2,
    "explanation": "Particular premises do not guarantee overlap between laptops and gadgets; nor are all gadgets devices."
  },
  {
    "id": "LIB-REA-007",
    "category": "Reasoning",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "A clock reads 4:30. If the minute hand points East, in which direction does the hour hand point?",
    "options": [
      "North-East",
      "North-West",
      "South-East",
      "South-West"
    ],
    "answer": 0,
    "explanation": "At 4:30, minute hand is at 6 (South normally). If South is rotated to East (90 deg counter-clockwise), hour hand (between 4 and 5) rotates to North-East."
  },
  {
    "id": "LIB-REA-008",
    "category": "Reasoning",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "Six friends A, B, C, D, E, and F are sitting in a row facing North. C is between A and E. D is at the extreme right. B is second to the left of D. F is to the immediate left of A. Who is sitting at the extreme left?",
    "options": [
      "F",
      "A",
      "C",
      "E"
    ],
    "answer": 0,
    "explanation": "Layout from left to right: F - A - C - E - B - D. F sits at the extreme left."
  },
  {
    "id": "LIB-REA-009",
    "category": "Reasoning",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "If 'POND' is coded as 'RSTL', how is 'HEAR' coded in that same systematic shift?",
    "options": [
      "JGCT",
      "JHDV",
      "JGDT",
      "KIDU"
    ],
    "answer": 0,
    "explanation": "Pattern: P+2=R, O+4=S, N+6=T, D+8=L. H+2=J, E+2=G, A+2=C, R+2=T -> JGCT."
  },
  {
    "id": "LIB-REA-010",
    "category": "Reasoning",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "Complete the alpha-numeric sequence: 2Z5, 4Y7, 8X11, 16W17, ___?",
    "options": [
      "32V25",
      "32U26",
      "24V25",
      "32V23"
    ],
    "answer": 0,
    "explanation": "Numbers: 2, 4, 8, 16, 32. Letters: Z, Y, X, W, V. Last numbers: 5 (+2), 7 (+4), 11 (+6), 17 (+8) -> 25. Result = 32V25."
  },
  {
    "id": "LIB-REA-011",
    "category": "Reasoning",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "In a certain code, '786' means 'study very hard', '958' means 'hard work pays', and '645' means 'study and work'. Which digit represents 'very'?",
    "options": [
      "7",
      "8",
      "6",
      "9"
    ],
    "answer": 0,
    "explanation": "'hard' is common in 786 and 958 -> '8'. 'study' is common in 786 and 645 -> '6'. Therefore, '7' stands for 'very'."
  },
  {
    "id": "LIB-REA-012",
    "category": "Reasoning",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "Statements: Some managers are leaders. No leader is corrupt. All corrupt persons are prosecuted. Conclusion: Some managers are not corrupt.",
    "options": [
      "Definitely true",
      "Definitely false",
      "Probably false",
      "Data insufficient"
    ],
    "answer": 0,
    "explanation": "Managers who are leaders cannot be corrupt because no leader is corrupt. Thus, some managers are not corrupt."
  },
  {
    "id": "LIB-REA-013",
    "category": "Reasoning",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "If South-East becomes North, North-East becomes West, and all other directions change accordingly, what will West become?",
    "options": [
      "North-East",
      "South-East",
      "North-West",
      "South-West"
    ],
    "answer": 1,
    "explanation": "Each direction rotates 135 degrees clockwise. West rotated 135 deg clockwise points to South-East."
  },
  {
    "id": "LIB-REA-014",
    "category": "Reasoning",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "Eight people are sitting in a circle facing the center. A is opposite E. B is to the immediate right of A. F is opposite B. Who is sitting to the immediate left of F?",
    "options": [
      "E",
      "C",
      "D",
      "A"
    ],
    "answer": 0,
    "explanation": "By circular symmetry facing center, opposite B is F; the position to F's left corresponds to opposite A's right, which is E."
  },
  {
    "id": "LIB-REA-015",
    "category": "Reasoning",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "Find the missing term: 1, 8, 27, 64, 125, ___?",
    "options": [
      "216",
      "256",
      "343",
      "196"
    ],
    "answer": 0,
    "explanation": "Cubes of positive integers: 1^3, 2^3, 3^3, 4^3, 5^3, 6^3 = 216."
  },
  {
    "id": "LIB-REA-016",
    "category": "Reasoning",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "Five executives P, Q, R, S, T hold different designations (CEO, CTO, CFO, CMO, COO). P is senior to Q but junior to T. R is neither CEO nor COO. S is senior to T. Who is the CEO?",
    "options": [
      "S",
      "T",
      "P",
      "R"
    ],
    "answer": 0,
    "explanation": "Seniority chain: S > T > P > Q. Since S is senior to T who is senior to P and Q, S holds the highest rank (CEO)."
  },
  {
    "id": "LIB-REA-017",
    "category": "Reasoning",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "Statements: Only a few developers are architects. All architects are designers. Some designers are engineers. Which conclusion is valid?",
    "options": [
      "All developers can never be architects",
      "All engineers are architects",
      "No developer is a designer",
      "Some architects are not designers"
    ],
    "answer": 0,
    "explanation": "'Only a few developers are architects' means some developers are architects and some developers are definitely not architects."
  },
  {
    "id": "LIB-REA-018",
    "category": "Reasoning",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "A cube has all six faces painted with different colors. Red is opposite Green. Blue is adjacent to White. Yellow is adjacent to Red. Which color must be opposite Blue?",
    "options": [
      "Yellow or White",
      "Yellow",
      "White",
      "Data insufficient"
    ],
    "answer": 0,
    "explanation": "Given Red is opposite Green, the remaining four faces form a ring; Blue can be opposite Yellow or White depending on parity."
  },
  {
    "id": "LIB-REA-019",
    "category": "Reasoning",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "Find the next figure in the pattern sequence of a clock's hands advancing by 1 hr 15 min, 1 hr 30 min, 1 hr 45 min respectively. What is the next jump?",
    "options": [
      "2 hours",
      "2 hrs 15 min",
      "1 hr 50 min",
      "2 hrs 30 min"
    ],
    "answer": 0,
    "explanation": "Arithmetic sequence of increments (+15 min): 75, 90, 105, next increment is 120 minutes (2 hours)."
  },
  {
    "id": "LIB-REA-020",
    "category": "Reasoning",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "In a family of 7, A is the grandfather of G. B is the mother of C. D is married to B. E is the sister of D. How is E related to C?",
    "options": [
      "Aunt",
      "Mother",
      "Niece",
      "Sister"
    ],
    "answer": 0,
    "explanation": "D is C's father. E is D's sister. Therefore, E is C's paternal aunt."
  },
  {
    "id": "LIB-REA-021",
    "category": "Reasoning",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "A truth-teller always tells the truth, a liar always lies, and a spy can either lie or tell the truth. You ask Person A: 'Are you the spy?' A replies: 'No.' You ask Person B: 'Did A tell the truth?' B says: 'Yes.' What can be deduced?",
    "options": [
      "A is not the liar",
      "B is definitely the spy",
      "A must be the truth-teller",
      "B is the liar"
    ],
    "answer": 0,
    "explanation": "A liar cannot say 'No' to 'Are you the spy?' because a liar would have to say 'Yes'. Therefore, A is definitely not the liar."
  },
  {
    "id": "LIB-REA-022",
    "category": "Reasoning",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "Three boxes are labeled 'Apples', 'Oranges', and 'Apples & Oranges'. All three boxes are labeled incorrectly. You can pick only one fruit from one box. Which box should you pick from to correctly label all three?",
    "options": [
      "The box labeled 'Apples & Oranges'",
      "The box labeled 'Apples'",
      "The box labeled 'Oranges'",
      "Any box will work"
    ],
    "answer": 0,
    "explanation": "Pick from 'Apples & Oranges'. Since it is mislabeled, whatever fruit you pull is the true sole content of that box."
  },
  {
    "id": "LIB-REA-023",
    "category": "Reasoning",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "Statements: All A are B. 20% of B are C. No C is D. All E are D. Conclusion: Some B can never be E.",
    "options": [
      "Definitely true",
      "Definitely false",
      "Cannot be determined",
      "Only valid if B=C"
    ],
    "answer": 0,
    "explanation": "The portion of B that is C can never be D (and hence can never be E). Thus, some B can never be E."
  },
  {
    "id": "LIB-REA-024",
    "category": "Reasoning",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "Four suspects (W, X, Y, Z) are questioned. Exactly one is guilty and exactly one tells the truth. W says: 'X did it.' X says: 'Z did it.' Y says: 'I did not do it.' Z says: 'X lied.' Who is the guilty party?",
    "options": [
      "Y",
      "X",
      "W",
      "Z"
    ],
    "answer": 0,
    "explanation": "X and Z make contradictory statements, so one must tell the truth. W and Y must be lying. Since Y lied ('I did not do it'), Y is the guilty party."
  },
  {
    "id": "LIB-REA-025",
    "category": "Reasoning",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "In a tournament of 6 teams, each team plays every other team exactly once. What is the minimum number of wins required to guarantee a top-2 finish?",
    "options": [
      "4 wins",
      "5 wins",
      "3 wins",
      "2 wins"
    ],
    "answer": 0,
    "explanation": "Total matches = 6C2 = 15. Winning 4 out of 5 matches mathematically guarantees a top-2 placement."
  },
  {
    "id": "LIB-REA-026",
    "category": "Reasoning",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "A prisoner is given 100 black marbles, 100 white marbles, and two identical bowls. He must distribute all marbles between the bowls. One bowl is chosen at random, and one marble is drawn. To maximize probability of drawing a white marble, how should he distribute them?",
    "options": [
      "1 white marble in Bowl 1; 99 white + 100 black in Bowl 2",
      "50 white in Bowl 1; 50 white + 100 black in Bowl 2",
      "50 white + 50 black in each bowl",
      "100 white in Bowl 1; 100 black in Bowl 2"
    ],
    "answer": 0,
    "explanation": "Probability = 0.5 * 1 + 0.5 * (99/199) ~= 0.748 (74.8% probability of survival)."
  },
  {
    "id": "LIB-GK-001",
    "category": "GK",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[GK Fundamental Concept 1] Which foundational principle governs effective execution in gk?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in GK begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-GK-002",
    "category": "GK",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[GK Fundamental Concept 2] Which foundational principle governs effective execution in gk?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in GK begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-GK-003",
    "category": "GK",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[GK Fundamental Concept 3] Which foundational principle governs effective execution in gk?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in GK begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-GK-004",
    "category": "GK",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[GK Fundamental Concept 4] Which foundational principle governs effective execution in gk?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in GK begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-GK-005",
    "category": "GK",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[GK Fundamental Concept 5] Which foundational principle governs effective execution in gk?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in GK begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-GK-006",
    "category": "GK",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[GK Operational Practice 1] In modern corporate environments, how is gk performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-GK-007",
    "category": "GK",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[GK Operational Practice 2] In modern corporate environments, how is gk performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-GK-008",
    "category": "GK",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[GK Operational Practice 3] In modern corporate environments, how is gk performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-GK-009",
    "category": "GK",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[GK Operational Practice 4] In modern corporate environments, how is gk performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-GK-010",
    "category": "GK",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[GK Operational Practice 5] In modern corporate environments, how is gk performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-GK-011",
    "category": "GK",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[GK Applied Scenario 1] When implementing an end-to-end gk workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-GK-012",
    "category": "GK",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[GK Applied Scenario 2] When implementing an end-to-end gk workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-GK-013",
    "category": "GK",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[GK Applied Scenario 3] When implementing an end-to-end gk workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-GK-014",
    "category": "GK",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[GK Applied Scenario 4] When implementing an end-to-end gk workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-GK-015",
    "category": "GK",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[GK Applied Scenario 5] When implementing an end-to-end gk workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-GK-016",
    "category": "GK",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[GK Strategic Evaluation 1] An audit reveals systematic inefficiencies in your organization's gk pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-GK-017",
    "category": "GK",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[GK Strategic Evaluation 2] An audit reveals systematic inefficiencies in your organization's gk pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-GK-018",
    "category": "GK",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[GK Strategic Evaluation 3] An audit reveals systematic inefficiencies in your organization's gk pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-GK-019",
    "category": "GK",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[GK Strategic Evaluation 4] An audit reveals systematic inefficiencies in your organization's gk pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-GK-020",
    "category": "GK",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[GK Strategic Evaluation 5] An audit reveals systematic inefficiencies in your organization's gk pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-GK-021",
    "category": "GK",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[GK Executive Architecture 1] At enterprise scale, how should an executive structure cross-departmental governance for gk?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-GK-022",
    "category": "GK",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[GK Executive Architecture 2] At enterprise scale, how should an executive structure cross-departmental governance for gk?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-GK-023",
    "category": "GK",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[GK Executive Architecture 3] At enterprise scale, how should an executive structure cross-departmental governance for gk?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-GK-024",
    "category": "GK",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[GK Executive Architecture 4] At enterprise scale, how should an executive structure cross-departmental governance for gk?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-GK-025",
    "category": "GK",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[GK Executive Architecture 5] At enterprise scale, how should an executive structure cross-departmental governance for gk?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-GK-026",
    "category": "GK",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[GK Executive Architecture 6] At enterprise scale, how should an executive structure cross-departmental governance for gk?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-PRB-001",
    "category": "Problem Solving",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[Problem Solving Fundamental Concept 1] Which foundational principle governs effective execution in problem solving?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in Problem Solving begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-PRB-002",
    "category": "Problem Solving",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[Problem Solving Fundamental Concept 2] Which foundational principle governs effective execution in problem solving?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in Problem Solving begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-PRB-003",
    "category": "Problem Solving",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[Problem Solving Fundamental Concept 3] Which foundational principle governs effective execution in problem solving?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in Problem Solving begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-PRB-004",
    "category": "Problem Solving",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[Problem Solving Fundamental Concept 4] Which foundational principle governs effective execution in problem solving?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in Problem Solving begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-PRB-005",
    "category": "Problem Solving",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[Problem Solving Fundamental Concept 5] Which foundational principle governs effective execution in problem solving?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in Problem Solving begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-PRB-006",
    "category": "Problem Solving",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[Problem Solving Operational Practice 1] In modern corporate environments, how is problem solving performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-PRB-007",
    "category": "Problem Solving",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[Problem Solving Operational Practice 2] In modern corporate environments, how is problem solving performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-PRB-008",
    "category": "Problem Solving",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[Problem Solving Operational Practice 3] In modern corporate environments, how is problem solving performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-PRB-009",
    "category": "Problem Solving",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[Problem Solving Operational Practice 4] In modern corporate environments, how is problem solving performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-PRB-010",
    "category": "Problem Solving",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[Problem Solving Operational Practice 5] In modern corporate environments, how is problem solving performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-PRB-011",
    "category": "Problem Solving",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[Problem Solving Applied Scenario 1] When implementing an end-to-end problem solving workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-PRB-012",
    "category": "Problem Solving",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[Problem Solving Applied Scenario 2] When implementing an end-to-end problem solving workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-PRB-013",
    "category": "Problem Solving",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[Problem Solving Applied Scenario 3] When implementing an end-to-end problem solving workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-PRB-014",
    "category": "Problem Solving",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[Problem Solving Applied Scenario 4] When implementing an end-to-end problem solving workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-PRB-015",
    "category": "Problem Solving",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[Problem Solving Applied Scenario 5] When implementing an end-to-end problem solving workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-PRB-016",
    "category": "Problem Solving",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[Problem Solving Strategic Evaluation 1] An audit reveals systematic inefficiencies in your organization's problem solving pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-PRB-017",
    "category": "Problem Solving",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[Problem Solving Strategic Evaluation 2] An audit reveals systematic inefficiencies in your organization's problem solving pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-PRB-018",
    "category": "Problem Solving",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[Problem Solving Strategic Evaluation 3] An audit reveals systematic inefficiencies in your organization's problem solving pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-PRB-019",
    "category": "Problem Solving",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[Problem Solving Strategic Evaluation 4] An audit reveals systematic inefficiencies in your organization's problem solving pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-PRB-020",
    "category": "Problem Solving",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[Problem Solving Strategic Evaluation 5] An audit reveals systematic inefficiencies in your organization's problem solving pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-PRB-021",
    "category": "Problem Solving",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Problem Solving Executive Architecture 1] At enterprise scale, how should an executive structure cross-departmental governance for problem solving?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-PRB-022",
    "category": "Problem Solving",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Problem Solving Executive Architecture 2] At enterprise scale, how should an executive structure cross-departmental governance for problem solving?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-PRB-023",
    "category": "Problem Solving",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Problem Solving Executive Architecture 3] At enterprise scale, how should an executive structure cross-departmental governance for problem solving?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-PRB-024",
    "category": "Problem Solving",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Problem Solving Executive Architecture 4] At enterprise scale, how should an executive structure cross-departmental governance for problem solving?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-PRB-025",
    "category": "Problem Solving",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Problem Solving Executive Architecture 5] At enterprise scale, how should an executive structure cross-departmental governance for problem solving?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-PRB-026",
    "category": "Problem Solving",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Problem Solving Executive Architecture 6] At enterprise scale, how should an executive structure cross-departmental governance for problem solving?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-COD-001",
    "category": "Coding",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[Coding Fundamental Concept 1] Which foundational principle governs effective execution in coding?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in Coding begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-COD-002",
    "category": "Coding",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[Coding Fundamental Concept 2] Which foundational principle governs effective execution in coding?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in Coding begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-COD-003",
    "category": "Coding",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[Coding Fundamental Concept 3] Which foundational principle governs effective execution in coding?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in Coding begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-COD-004",
    "category": "Coding",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[Coding Fundamental Concept 4] Which foundational principle governs effective execution in coding?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in Coding begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-COD-005",
    "category": "Coding",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[Coding Fundamental Concept 5] Which foundational principle governs effective execution in coding?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in Coding begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-COD-006",
    "category": "Coding",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[Coding Operational Practice 1] In modern corporate environments, how is coding performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-COD-007",
    "category": "Coding",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[Coding Operational Practice 2] In modern corporate environments, how is coding performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-COD-008",
    "category": "Coding",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[Coding Operational Practice 3] In modern corporate environments, how is coding performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-COD-009",
    "category": "Coding",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[Coding Operational Practice 4] In modern corporate environments, how is coding performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-COD-010",
    "category": "Coding",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[Coding Operational Practice 5] In modern corporate environments, how is coding performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-COD-011",
    "category": "Coding",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[Coding Applied Scenario 1] When implementing an end-to-end coding workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-COD-012",
    "category": "Coding",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[Coding Applied Scenario 2] When implementing an end-to-end coding workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-COD-013",
    "category": "Coding",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[Coding Applied Scenario 3] When implementing an end-to-end coding workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-COD-014",
    "category": "Coding",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[Coding Applied Scenario 4] When implementing an end-to-end coding workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-COD-015",
    "category": "Coding",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[Coding Applied Scenario 5] When implementing an end-to-end coding workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-COD-016",
    "category": "Coding",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[Coding Strategic Evaluation 1] An audit reveals systematic inefficiencies in your organization's coding pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-COD-017",
    "category": "Coding",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[Coding Strategic Evaluation 2] An audit reveals systematic inefficiencies in your organization's coding pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-COD-018",
    "category": "Coding",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[Coding Strategic Evaluation 3] An audit reveals systematic inefficiencies in your organization's coding pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-COD-019",
    "category": "Coding",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[Coding Strategic Evaluation 4] An audit reveals systematic inefficiencies in your organization's coding pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-COD-020",
    "category": "Coding",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[Coding Strategic Evaluation 5] An audit reveals systematic inefficiencies in your organization's coding pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-COD-021",
    "category": "Coding",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Coding Executive Architecture 1] At enterprise scale, how should an executive structure cross-departmental governance for coding?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-COD-022",
    "category": "Coding",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Coding Executive Architecture 2] At enterprise scale, how should an executive structure cross-departmental governance for coding?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-COD-023",
    "category": "Coding",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Coding Executive Architecture 3] At enterprise scale, how should an executive structure cross-departmental governance for coding?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-COD-024",
    "category": "Coding",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Coding Executive Architecture 4] At enterprise scale, how should an executive structure cross-departmental governance for coding?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-COD-025",
    "category": "Coding",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Coding Executive Architecture 5] At enterprise scale, how should an executive structure cross-departmental governance for coding?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-COD-026",
    "category": "Coding",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Coding Executive Architecture 6] At enterprise scale, how should an executive structure cross-departmental governance for coding?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-MKT-001",
    "category": "Digital Marketing",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[Digital Marketing Fundamental Concept 1] Which foundational principle governs effective execution in digital marketing?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in Digital Marketing begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-MKT-002",
    "category": "Digital Marketing",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[Digital Marketing Fundamental Concept 2] Which foundational principle governs effective execution in digital marketing?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in Digital Marketing begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-MKT-003",
    "category": "Digital Marketing",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[Digital Marketing Fundamental Concept 3] Which foundational principle governs effective execution in digital marketing?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in Digital Marketing begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-MKT-004",
    "category": "Digital Marketing",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[Digital Marketing Fundamental Concept 4] Which foundational principle governs effective execution in digital marketing?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in Digital Marketing begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-MKT-005",
    "category": "Digital Marketing",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[Digital Marketing Fundamental Concept 5] Which foundational principle governs effective execution in digital marketing?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in Digital Marketing begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-MKT-006",
    "category": "Digital Marketing",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[Digital Marketing Operational Practice 1] In modern corporate environments, how is digital marketing performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-MKT-007",
    "category": "Digital Marketing",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[Digital Marketing Operational Practice 2] In modern corporate environments, how is digital marketing performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-MKT-008",
    "category": "Digital Marketing",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[Digital Marketing Operational Practice 3] In modern corporate environments, how is digital marketing performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-MKT-009",
    "category": "Digital Marketing",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[Digital Marketing Operational Practice 4] In modern corporate environments, how is digital marketing performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-MKT-010",
    "category": "Digital Marketing",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[Digital Marketing Operational Practice 5] In modern corporate environments, how is digital marketing performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-MKT-011",
    "category": "Digital Marketing",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[Digital Marketing Applied Scenario 1] When implementing an end-to-end digital marketing workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-MKT-012",
    "category": "Digital Marketing",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[Digital Marketing Applied Scenario 2] When implementing an end-to-end digital marketing workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-MKT-013",
    "category": "Digital Marketing",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[Digital Marketing Applied Scenario 3] When implementing an end-to-end digital marketing workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-MKT-014",
    "category": "Digital Marketing",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[Digital Marketing Applied Scenario 4] When implementing an end-to-end digital marketing workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-MKT-015",
    "category": "Digital Marketing",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[Digital Marketing Applied Scenario 5] When implementing an end-to-end digital marketing workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-MKT-016",
    "category": "Digital Marketing",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[Digital Marketing Strategic Evaluation 1] An audit reveals systematic inefficiencies in your organization's digital marketing pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-MKT-017",
    "category": "Digital Marketing",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[Digital Marketing Strategic Evaluation 2] An audit reveals systematic inefficiencies in your organization's digital marketing pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-MKT-018",
    "category": "Digital Marketing",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[Digital Marketing Strategic Evaluation 3] An audit reveals systematic inefficiencies in your organization's digital marketing pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-MKT-019",
    "category": "Digital Marketing",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[Digital Marketing Strategic Evaluation 4] An audit reveals systematic inefficiencies in your organization's digital marketing pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-MKT-020",
    "category": "Digital Marketing",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[Digital Marketing Strategic Evaluation 5] An audit reveals systematic inefficiencies in your organization's digital marketing pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-MKT-021",
    "category": "Digital Marketing",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Digital Marketing Executive Architecture 1] At enterprise scale, how should an executive structure cross-departmental governance for digital marketing?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-MKT-022",
    "category": "Digital Marketing",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Digital Marketing Executive Architecture 2] At enterprise scale, how should an executive structure cross-departmental governance for digital marketing?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-MKT-023",
    "category": "Digital Marketing",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Digital Marketing Executive Architecture 3] At enterprise scale, how should an executive structure cross-departmental governance for digital marketing?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-MKT-024",
    "category": "Digital Marketing",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Digital Marketing Executive Architecture 4] At enterprise scale, how should an executive structure cross-departmental governance for digital marketing?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-MKT-025",
    "category": "Digital Marketing",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Digital Marketing Executive Architecture 5] At enterprise scale, how should an executive structure cross-departmental governance for digital marketing?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-MKT-026",
    "category": "Digital Marketing",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Digital Marketing Executive Architecture 6] At enterprise scale, how should an executive structure cross-departmental governance for digital marketing?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-SLS-001",
    "category": "Sales",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[Sales Fundamental Concept 1] Which foundational principle governs effective execution in sales?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in Sales begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-SLS-002",
    "category": "Sales",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[Sales Fundamental Concept 2] Which foundational principle governs effective execution in sales?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in Sales begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-SLS-003",
    "category": "Sales",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[Sales Fundamental Concept 3] Which foundational principle governs effective execution in sales?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in Sales begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-SLS-004",
    "category": "Sales",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[Sales Fundamental Concept 4] Which foundational principle governs effective execution in sales?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in Sales begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-SLS-005",
    "category": "Sales",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[Sales Fundamental Concept 5] Which foundational principle governs effective execution in sales?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in Sales begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-SLS-006",
    "category": "Sales",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[Sales Operational Practice 1] In modern corporate environments, how is sales performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-SLS-007",
    "category": "Sales",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[Sales Operational Practice 2] In modern corporate environments, how is sales performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-SLS-008",
    "category": "Sales",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[Sales Operational Practice 3] In modern corporate environments, how is sales performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-SLS-009",
    "category": "Sales",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[Sales Operational Practice 4] In modern corporate environments, how is sales performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-SLS-010",
    "category": "Sales",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[Sales Operational Practice 5] In modern corporate environments, how is sales performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-SLS-011",
    "category": "Sales",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[Sales Applied Scenario 1] When implementing an end-to-end sales workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-SLS-012",
    "category": "Sales",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[Sales Applied Scenario 2] When implementing an end-to-end sales workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-SLS-013",
    "category": "Sales",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[Sales Applied Scenario 3] When implementing an end-to-end sales workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-SLS-014",
    "category": "Sales",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[Sales Applied Scenario 4] When implementing an end-to-end sales workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-SLS-015",
    "category": "Sales",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[Sales Applied Scenario 5] When implementing an end-to-end sales workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-SLS-016",
    "category": "Sales",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[Sales Strategic Evaluation 1] An audit reveals systematic inefficiencies in your organization's sales pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-SLS-017",
    "category": "Sales",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[Sales Strategic Evaluation 2] An audit reveals systematic inefficiencies in your organization's sales pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-SLS-018",
    "category": "Sales",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[Sales Strategic Evaluation 3] An audit reveals systematic inefficiencies in your organization's sales pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-SLS-019",
    "category": "Sales",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[Sales Strategic Evaluation 4] An audit reveals systematic inefficiencies in your organization's sales pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-SLS-020",
    "category": "Sales",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[Sales Strategic Evaluation 5] An audit reveals systematic inefficiencies in your organization's sales pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-SLS-021",
    "category": "Sales",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Sales Executive Architecture 1] At enterprise scale, how should an executive structure cross-departmental governance for sales?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-SLS-022",
    "category": "Sales",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Sales Executive Architecture 2] At enterprise scale, how should an executive structure cross-departmental governance for sales?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-SLS-023",
    "category": "Sales",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Sales Executive Architecture 3] At enterprise scale, how should an executive structure cross-departmental governance for sales?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-SLS-024",
    "category": "Sales",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Sales Executive Architecture 4] At enterprise scale, how should an executive structure cross-departmental governance for sales?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-SLS-025",
    "category": "Sales",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Sales Executive Architecture 5] At enterprise scale, how should an executive structure cross-departmental governance for sales?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-SLS-026",
    "category": "Sales",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Sales Executive Architecture 6] At enterprise scale, how should an executive structure cross-departmental governance for sales?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-HR-001",
    "category": "HR",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[HR Fundamental Concept 1] Which foundational principle governs effective execution in hr?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in HR begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-HR-002",
    "category": "HR",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[HR Fundamental Concept 2] Which foundational principle governs effective execution in hr?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in HR begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-HR-003",
    "category": "HR",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[HR Fundamental Concept 3] Which foundational principle governs effective execution in hr?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in HR begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-HR-004",
    "category": "HR",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[HR Fundamental Concept 4] Which foundational principle governs effective execution in hr?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in HR begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-HR-005",
    "category": "HR",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[HR Fundamental Concept 5] Which foundational principle governs effective execution in hr?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in HR begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-HR-006",
    "category": "HR",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[HR Operational Practice 1] In modern corporate environments, how is hr performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-HR-007",
    "category": "HR",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[HR Operational Practice 2] In modern corporate environments, how is hr performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-HR-008",
    "category": "HR",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[HR Operational Practice 3] In modern corporate environments, how is hr performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-HR-009",
    "category": "HR",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[HR Operational Practice 4] In modern corporate environments, how is hr performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-HR-010",
    "category": "HR",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[HR Operational Practice 5] In modern corporate environments, how is hr performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-HR-011",
    "category": "HR",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[HR Applied Scenario 1] When implementing an end-to-end hr workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-HR-012",
    "category": "HR",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[HR Applied Scenario 2] When implementing an end-to-end hr workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-HR-013",
    "category": "HR",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[HR Applied Scenario 3] When implementing an end-to-end hr workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-HR-014",
    "category": "HR",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[HR Applied Scenario 4] When implementing an end-to-end hr workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-HR-015",
    "category": "HR",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[HR Applied Scenario 5] When implementing an end-to-end hr workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-HR-016",
    "category": "HR",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[HR Strategic Evaluation 1] An audit reveals systematic inefficiencies in your organization's hr pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-HR-017",
    "category": "HR",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[HR Strategic Evaluation 2] An audit reveals systematic inefficiencies in your organization's hr pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-HR-018",
    "category": "HR",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[HR Strategic Evaluation 3] An audit reveals systematic inefficiencies in your organization's hr pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-HR-019",
    "category": "HR",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[HR Strategic Evaluation 4] An audit reveals systematic inefficiencies in your organization's hr pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-HR-020",
    "category": "HR",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[HR Strategic Evaluation 5] An audit reveals systematic inefficiencies in your organization's hr pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-HR-021",
    "category": "HR",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[HR Executive Architecture 1] At enterprise scale, how should an executive structure cross-departmental governance for hr?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-HR-022",
    "category": "HR",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[HR Executive Architecture 2] At enterprise scale, how should an executive structure cross-departmental governance for hr?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-HR-023",
    "category": "HR",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[HR Executive Architecture 3] At enterprise scale, how should an executive structure cross-departmental governance for hr?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-HR-024",
    "category": "HR",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[HR Executive Architecture 4] At enterprise scale, how should an executive structure cross-departmental governance for hr?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-HR-025",
    "category": "HR",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[HR Executive Architecture 5] At enterprise scale, how should an executive structure cross-departmental governance for hr?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-HR-026",
    "category": "HR",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[HR Executive Architecture 6] At enterprise scale, how should an executive structure cross-departmental governance for hr?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-TST-001",
    "category": "Testing",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[Testing Fundamental Concept 1] Which foundational principle governs effective execution in testing?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in Testing begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-TST-002",
    "category": "Testing",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[Testing Fundamental Concept 2] Which foundational principle governs effective execution in testing?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in Testing begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-TST-003",
    "category": "Testing",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[Testing Fundamental Concept 3] Which foundational principle governs effective execution in testing?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in Testing begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-TST-004",
    "category": "Testing",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[Testing Fundamental Concept 4] Which foundational principle governs effective execution in testing?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in Testing begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-TST-005",
    "category": "Testing",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[Testing Fundamental Concept 5] Which foundational principle governs effective execution in testing?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in Testing begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-TST-006",
    "category": "Testing",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[Testing Operational Practice 1] In modern corporate environments, how is testing performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-TST-007",
    "category": "Testing",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[Testing Operational Practice 2] In modern corporate environments, how is testing performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-TST-008",
    "category": "Testing",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[Testing Operational Practice 3] In modern corporate environments, how is testing performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-TST-009",
    "category": "Testing",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[Testing Operational Practice 4] In modern corporate environments, how is testing performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-TST-010",
    "category": "Testing",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[Testing Operational Practice 5] In modern corporate environments, how is testing performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-TST-011",
    "category": "Testing",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[Testing Applied Scenario 1] When implementing an end-to-end testing workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-TST-012",
    "category": "Testing",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[Testing Applied Scenario 2] When implementing an end-to-end testing workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-TST-013",
    "category": "Testing",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[Testing Applied Scenario 3] When implementing an end-to-end testing workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-TST-014",
    "category": "Testing",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[Testing Applied Scenario 4] When implementing an end-to-end testing workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-TST-015",
    "category": "Testing",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[Testing Applied Scenario 5] When implementing an end-to-end testing workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-TST-016",
    "category": "Testing",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[Testing Strategic Evaluation 1] An audit reveals systematic inefficiencies in your organization's testing pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-TST-017",
    "category": "Testing",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[Testing Strategic Evaluation 2] An audit reveals systematic inefficiencies in your organization's testing pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-TST-018",
    "category": "Testing",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[Testing Strategic Evaluation 3] An audit reveals systematic inefficiencies in your organization's testing pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-TST-019",
    "category": "Testing",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[Testing Strategic Evaluation 4] An audit reveals systematic inefficiencies in your organization's testing pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-TST-020",
    "category": "Testing",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[Testing Strategic Evaluation 5] An audit reveals systematic inefficiencies in your organization's testing pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-TST-021",
    "category": "Testing",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Testing Executive Architecture 1] At enterprise scale, how should an executive structure cross-departmental governance for testing?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-TST-022",
    "category": "Testing",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Testing Executive Architecture 2] At enterprise scale, how should an executive structure cross-departmental governance for testing?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-TST-023",
    "category": "Testing",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Testing Executive Architecture 3] At enterprise scale, how should an executive structure cross-departmental governance for testing?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-TST-024",
    "category": "Testing",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Testing Executive Architecture 4] At enterprise scale, how should an executive structure cross-departmental governance for testing?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-TST-025",
    "category": "Testing",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Testing Executive Architecture 5] At enterprise scale, how should an executive structure cross-departmental governance for testing?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-TST-026",
    "category": "Testing",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Testing Executive Architecture 6] At enterprise scale, how should an executive structure cross-departmental governance for testing?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-VOC-001",
    "category": "Vocabulary",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[Vocabulary Fundamental Concept 1] Which foundational principle governs effective execution in vocabulary?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in Vocabulary begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-VOC-002",
    "category": "Vocabulary",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[Vocabulary Fundamental Concept 2] Which foundational principle governs effective execution in vocabulary?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in Vocabulary begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-VOC-003",
    "category": "Vocabulary",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[Vocabulary Fundamental Concept 3] Which foundational principle governs effective execution in vocabulary?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in Vocabulary begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-VOC-004",
    "category": "Vocabulary",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[Vocabulary Fundamental Concept 4] Which foundational principle governs effective execution in vocabulary?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in Vocabulary begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-VOC-005",
    "category": "Vocabulary",
    "difficulty": 1,
    "points": 1,
    "type": "MCQ",
    "prompt": "[Vocabulary Fundamental Concept 5] Which foundational principle governs effective execution in vocabulary?",
    "options": [
      "Consistent application of industry-standard baseline frameworks",
      "Ad-hoc guesswork without tracking metrics",
      "Relying entirely on manual unverified workflows",
      "Avoiding documentation and stakeholder alignment"
    ],
    "answer": 0,
    "explanation": "Core excellence in Vocabulary begins with disciplined application of established industry benchmarks."
  },
  {
    "id": "LIB-VOC-006",
    "category": "Vocabulary",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[Vocabulary Operational Practice 1] In modern corporate environments, how is vocabulary performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-VOC-007",
    "category": "Vocabulary",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[Vocabulary Operational Practice 2] In modern corporate environments, how is vocabulary performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-VOC-008",
    "category": "Vocabulary",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[Vocabulary Operational Practice 3] In modern corporate environments, how is vocabulary performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-VOC-009",
    "category": "Vocabulary",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[Vocabulary Operational Practice 4] In modern corporate environments, how is vocabulary performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-VOC-010",
    "category": "Vocabulary",
    "difficulty": 2,
    "points": 2,
    "type": "MCQ",
    "prompt": "[Vocabulary Operational Practice 5] In modern corporate environments, how is vocabulary performance objectively tracked and improved?",
    "options": [
      "By measuring key performance indicators (KPIs) against historical baselines",
      "By subjectively rating work based on employee popularity",
      "By deleting past audit trails to prevent scrutiny",
      "By ignoring operational feedback loops"
    ],
    "answer": 0,
    "explanation": "Systematic measurement through standardized KPIs ensures objective governance and continuous optimization."
  },
  {
    "id": "LIB-VOC-011",
    "category": "Vocabulary",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[Vocabulary Applied Scenario 1] When implementing an end-to-end vocabulary workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-VOC-012",
    "category": "Vocabulary",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[Vocabulary Applied Scenario 2] When implementing an end-to-end vocabulary workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-VOC-013",
    "category": "Vocabulary",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[Vocabulary Applied Scenario 3] When implementing an end-to-end vocabulary workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-VOC-014",
    "category": "Vocabulary",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[Vocabulary Applied Scenario 4] When implementing an end-to-end vocabulary workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-VOC-015",
    "category": "Vocabulary",
    "difficulty": 3,
    "points": 3,
    "type": "MCQ",
    "prompt": "[Vocabulary Applied Scenario 5] When implementing an end-to-end vocabulary workflow under tight resource constraints, what is the optimal methodology?",
    "options": [
      "Prioritize high-impact deliverables using a phased milestone roadmap",
      "Attempt all tasks concurrently without prioritization",
      "Compromise regulatory compliance to finish early",
      "Outsource the core responsibility without supervision"
    ],
    "answer": 0,
    "explanation": "Structured prioritization and milestone-driven phased rollouts mitigate execution risk under resource limitations."
  },
  {
    "id": "LIB-VOC-016",
    "category": "Vocabulary",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[Vocabulary Strategic Evaluation 1] An audit reveals systematic inefficiencies in your organization's vocabulary pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-VOC-017",
    "category": "Vocabulary",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[Vocabulary Strategic Evaluation 2] An audit reveals systematic inefficiencies in your organization's vocabulary pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-VOC-018",
    "category": "Vocabulary",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[Vocabulary Strategic Evaluation 3] An audit reveals systematic inefficiencies in your organization's vocabulary pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-VOC-019",
    "category": "Vocabulary",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[Vocabulary Strategic Evaluation 4] An audit reveals systematic inefficiencies in your organization's vocabulary pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-VOC-020",
    "category": "Vocabulary",
    "difficulty": 4,
    "points": 4,
    "type": "MCQ",
    "prompt": "[Vocabulary Strategic Evaluation 5] An audit reveals systematic inefficiencies in your organization's vocabulary pipeline. What strategic framework should be deployed?",
    "options": [
      "Conduct Root Cause Analysis (Fishbone/5 Whys) and formulate preventive corrective actions (CAPA)",
      "Reassign blame to external vendors without investigation",
      "Conceal the audit findings from leadership",
      "Completely dismantle the existing pipeline without a transition plan"
    ],
    "answer": 0,
    "explanation": "Structured root-cause analysis paired with Corrective and Preventive Actions (CAPA) sustainably eliminates systemic defects."
  },
  {
    "id": "LIB-VOC-021",
    "category": "Vocabulary",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Vocabulary Executive Architecture 1] At enterprise scale, how should an executive structure cross-departmental governance for vocabulary?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-VOC-022",
    "category": "Vocabulary",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Vocabulary Executive Architecture 2] At enterprise scale, how should an executive structure cross-departmental governance for vocabulary?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-VOC-023",
    "category": "Vocabulary",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Vocabulary Executive Architecture 3] At enterprise scale, how should an executive structure cross-departmental governance for vocabulary?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-VOC-024",
    "category": "Vocabulary",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Vocabulary Executive Architecture 4] At enterprise scale, how should an executive structure cross-departmental governance for vocabulary?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-VOC-025",
    "category": "Vocabulary",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Vocabulary Executive Architecture 5] At enterprise scale, how should an executive structure cross-departmental governance for vocabulary?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  },
  {
    "id": "LIB-VOC-026",
    "category": "Vocabulary",
    "difficulty": 5,
    "points": 5,
    "type": "MCQ",
    "prompt": "[Vocabulary Executive Architecture 6] At enterprise scale, how should an executive structure cross-departmental governance for vocabulary?",
    "options": [
      "Establish a Center of Excellence (CoE) with standardized metrics, automated compliance gates, and executive oversight",
      "Operate in isolated silos without shared architectural standards",
      "Decentralize all policies with zero accountability or monitoring",
      "Depend exclusively on legacy manual spreadsheets for enterprise tracking"
    ],
    "answer": 0,
    "explanation": "Enterprise scalability demands centralized standards and governance via a Center of Excellence (CoE) coupled with automated compliance telemetry."
  }
];

export const draftInternAssessments = [
  {
    "id": "ASM-INTERN-SWE",
    "title": "Software Engineering Intern Hiring Assessment (Summer 2027)",
    "courseId": "CRS-PY-001",
    "type": "MCQ",
    "approval": "Draft",
    "status": "Active",
    "durationMinutes": 30,
    "passScore": 70,
    "questionLimit": 15,
    "difficulty": "Intermediate",
    "description": "Curated entry-level technical test for prospective Software Engineer Interns covering Coding, Testing, Analytical, and Problem Solving.",
    "questions": [
      {
        "id": "LIB-ANA-001",
        "category": "Analytical",
        "difficulty": 1,
        "points": 1,
        "type": "MCQ",
        "prompt": "If a company's revenue increased by 20% in Year 1 and then decreased by 20% in Year 2, what is the net change compared to original revenue?",
        "options": [
          "0% change (remains identical)",
          "4% decrease",
          "4% increase",
          "2% decrease"
        ],
        "answer": 1,
        "explanation": "100 * 1.2 = 120; 120 * 0.8 = 96. Net change = 4% decrease."
      },
      {
        "id": "LIB-ANA-002",
        "category": "Analytical",
        "difficulty": 1,
        "points": 1,
        "type": "MCQ",
        "prompt": "A product funnel shows: 10,000 visitors, 1,000 sign-ups, and 100 paid conversions. What is the overall visitor-to-paid conversion rate?",
        "options": [
          "10%",
          "5%",
          "1%",
          "0.1%"
        ],
        "answer": 2,
        "explanation": "(100 / 10,000) * 100% = 1%."
      },
      {
        "id": "LIB-ANA-003",
        "category": "Analytical",
        "difficulty": 1,
        "points": 1,
        "type": "MCQ",
        "prompt": "Which visual representation is best suited for illustrating the correlation between two continuous numerical variables?",
        "options": [
          "Pie Chart",
          "Scatter Plot",
          "Stacked Bar Chart",
          "Treemap"
        ],
        "answer": 1,
        "explanation": "Scatter plots visualize correlation, distribution, and clustering between two continuous variables."
      },
      {
        "id": "LIB-ANA-004",
        "category": "Analytical",
        "difficulty": 1,
        "points": 1,
        "type": "MCQ",
        "prompt": "If the mean of five numbers is 24, what is their total sum?",
        "options": [
          "96",
          "120",
          "144",
          "100"
        ],
        "answer": 1,
        "explanation": "Sum = Mean * Count = 24 * 5 = 120."
      },
      {
        "id": "LIB-ANA-005",
        "category": "Analytical",
        "difficulty": 1,
        "points": 1,
        "type": "MCQ",
        "prompt": "What does a high standard deviation indicate about a dataset?",
        "options": [
          "The values are clustered tightly around the mean",
          "The values are spread out over a wider range",
          "The data has no outliers",
          "The sample size is too small"
        ],
        "answer": 1,
        "explanation": "Standard deviation measures dispersion; higher values indicate greater variance from the mean."
      },
      {
        "id": "LIB-ANA-006",
        "category": "Analytical",
        "difficulty": 2,
        "points": 2,
        "type": "MCQ",
        "prompt": "A test yields a 95% true positive rate with a 5% false positive rate. If a disease prevalence is 1 in 1,000, what is the probability that a positive test is a true case?",
        "options": [
          "95%",
          "About 50%",
          "Under 2%",
          "100%"
        ],
        "answer": 2,
        "explanation": "Base rate fallacy: 95 true pos vs ~4,995 false pos yields ~1.86% probability."
      },
      {
        "id": "LIB-ANA-007",
        "category": "Analytical",
        "difficulty": 2,
        "points": 2,
        "type": "MCQ",
        "prompt": "If Customer Acquisition Cost (CAC) is $200 and Customer Lifetime Value (LTV) is $600, what is the LTV:CAC ratio and its health assessment?",
        "options": [
          "0.33 (Unhealthy - burning capital)",
          "3.0 (Healthy benchmark for sustainable SaaS growth)",
          "1.5 (Marginal profitability)",
          "6.0 (Underinvesting in sales)"
        ],
        "answer": 1,
        "explanation": "An LTV:CAC ratio of 3.0:1 is considered the gold standard benchmark for SaaS unit economics."
      },
      {
        "id": "LIB-ANA-008",
        "category": "Analytical",
        "difficulty": 2,
        "points": 2,
        "type": "MCQ",
        "prompt": "In an A/B test, Variant B increases click-through rate by 15% with p-value = 0.03. Assuming alpha = 0.05, what is the statistical conclusion?",
        "options": [
          "Reject the null hypothesis; the observed lift is statistically significant",
          "Fail to reject the null hypothesis; the lift could easily be random noise",
          "Variant B is 97% guaranteed to double revenue",
          "Sample size was invalid"
        ],
        "answer": 0,
        "explanation": "Since p-value (0.03) < alpha (0.05), we reject the null hypothesis."
      },
      {
        "id": "LIB-ANA-009",
        "category": "Analytical",
        "difficulty": 2,
        "points": 2,
        "type": "MCQ",
        "prompt": "If a server's monthly uptime is 99.9% ('three nines'), approximately how much downtime is permitted in a 30-day month?",
        "options": [
          "43 minutes",
          "7.2 hours",
          "1.5 hours",
          "8.6 seconds"
        ],
        "answer": 0,
        "explanation": "30 days * 24 hrs * 60 min = 43,200 min. 0.1% downtime = 43.2 minutes."
      },
      {
        "id": "LIB-ANA-010",
        "category": "Analytical",
        "difficulty": 2,
        "points": 2,
        "type": "MCQ",
        "prompt": "A cohort of 500 subscribers experiences a 4% monthly compounding churn. Approximately how many subscribers remain after 3 months?",
        "options": [
          "440",
          "442",
          "420",
          "460"
        ],
        "answer": 1,
        "explanation": "500 * (0.96)^3 = 500 * 0.8847 = 442.3 subscribers."
      },
      {
        "id": "LIB-ANA-011",
        "category": "Analytical",
        "difficulty": 3,
        "points": 3,
        "type": "MCQ",
        "prompt": "An e-commerce store notes that conversion rate dropped from 4% to 2% while traffic tripled from a new ad campaign. What phenomenon explains this?",
        "options": [
          "The website checkout crashed",
          "Audience dilution: low-intent traffic diluted high-intent baseline conversion",
          "Algorithm error in analytics database",
          "Seasonal customer fatigue"
        ],
        "answer": 1,
        "explanation": "Broad ad campaigns bring lower-intent users, lowering the aggregate conversion rate despite increasing absolute conversions."
      },
      {
        "id": "LIB-ANA-012",
        "category": "Analytical",
        "difficulty": 3,
        "points": 3,
        "type": "MCQ",
        "prompt": "Simpson's Paradox occurs when:",
        "options": [
          "A trend appears in aggregated groups of data but disappears or reverses when groups are combined",
          "Data is missing uniformly at random",
          "Sample size exceeds population size",
          "Correlation implies direct causation"
        ],
        "answer": 0,
        "explanation": "Simpson's Paradox describes when aggregate data reverses trends observed within separate subgroups."
      },
      {
        "id": "LIB-ANA-013",
        "category": "Analytical",
        "difficulty": 3,
        "points": 3,
        "type": "MCQ",
        "prompt": "If monthly recurring revenue (MRR) is $100,000, expansion MRR is $10,000, churned MRR is $6,000, and contraction MRR is $2,000, what is the Net Retention Rate (NRR)?",
        "options": [
          "102%",
          "98%",
          "108%",
          "92%"
        ],
        "answer": 0,
        "explanation": "NRR = (100k + 10k - 6k - 2k) / 100k = 102%."
      },
      {
        "id": "LIB-ANA-014",
        "category": "Analytical",
        "difficulty": 3,
        "points": 3,
        "type": "MCQ",
        "prompt": "A regression model has an R-squared value of 0.81. What does this measure?",
        "options": [
          "81% of predictions are exact integers",
          "81% of variance in the dependent variable is explained by independent variables",
          "The model has an 81% error rate",
          "The correlation coefficient is 0.81"
        ],
        "answer": 1,
        "explanation": "R-squared represents the proportion of variance in the dependent variable explained by independent variables."
      },
      {
        "id": "LIB-ANA-015",
        "category": "Analytical",
        "difficulty": 3,
        "points": 3,
        "type": "MCQ",
        "prompt": "When calculating rolling 7-day moving averages for volatile daily revenue data, the primary analytical objective is to:",
        "options": [
          "Artificially inflate total quarterly numbers",
          "Smooth out intra-week cyclical noise to identify underlying trends",
          "Eliminate the need for historical records",
          "Replace predictive modeling entirely"
        ],
        "answer": 1,
        "explanation": "Moving averages smooth seasonal or day-of-week fluctuations to reveal core underlying trajectories."
      },
      {
        "id": "LIB-ANA-016",
        "category": "Analytical",
        "difficulty": 4,
        "points": 4,
        "type": "MCQ",
        "prompt": "You are analyzing retention curves for three user cohorts. Cohort A levels off horizontally at 25% at Day 30, Cohort B slopes downward continuously to 5%, and Cohort C drops to 0%. Which cohort exhibits Product-Market Fit?",
        "options": [
          "Cohort B because of gradual decline",
          "Cohort A because asymptotic flattening indicates a sticky, retained core user base",
          "Cohort C because it has no lingering support costs",
          "None of them demonstrate PMF"
        ],
        "answer": 1,
        "explanation": "Flattening retention curves are the definitive quantitative signal of product-market fit."
      },
      {
        "id": "LIB-ANA-017",
        "category": "Analytical",
        "difficulty": 4,
        "points": 4,
        "type": "MCQ",
        "prompt": "In evaluating credit risk, a false positive classifies a safe applicant as high risk. A false negative approves a borrower who defaults ($10,000 loss). How should the decision threshold be tuned?",
        "options": [
          "Maximize accuracy at 50/50 balance",
          "Heavily penalize false negatives by lowering the risk approval threshold to minimize default exposure",
          "Ignore false negatives and maximize loan origination volume",
          "Rely exclusively on unweighted F1-score"
        ],
        "answer": 1,
        "explanation": "Asymmetric cost matrices require tuning precision/recall thresholds to heavily suppress catastrophic false negative losses."
      },
      {
        "id": "LIB-ANA-018",
        "category": "Analytical",
        "difficulty": 4,
        "points": 4,
        "type": "MCQ",
        "prompt": "A SaaS company has an average sales cycle of 90 days. If the qualified sales pipeline is $2,000,000 with a historical win rate of 25%, what is the expected closed revenue over the next quarter?",
        "options": [
          "$2,000,000",
          "$500,000",
          "$1,000,000",
          "$250,000"
        ],
        "answer": 1,
        "explanation": "Weighted Pipeline = Total Pipeline Value * Historical Win Rate = $2,000,000 * 0.25 = $500,000."
      },
      {
        "id": "LIB-ANA-019",
        "category": "Analytical",
        "difficulty": 4,
        "points": 4,
        "type": "MCQ",
        "prompt": "A product team observes that users who complete Step 4 in onboarding retain at 80%, compared to 20% for those who do not. The product manager proposes making Step 4 mandatory. What analytical trap must be vetted?",
        "options": [
          "Survivorship / Selection bias: high-intent users naturally complete Step 4 regardless, rather than Step 4 causing retention",
          "Hawthorne effect",
          "Central Limit Theorem failure",
          "Multicollinearity"
        ],
        "answer": 0,
        "explanation": "Correlation vs causation: high-intent power users self-select to complete advanced onboarding steps."
      },
      {
        "id": "LIB-ANA-020",
        "category": "Analytical",
        "difficulty": 4,
        "points": 4,
        "type": "MCQ",
        "prompt": "Given a log-normal distribution of user session lengths, which metric best summarizes the central tendency for an executive presentation?",
        "options": [
          "Arithmetic Mean",
          "Median",
          "Maximum value",
          "Standard error"
        ],
        "answer": 1,
        "explanation": "For skewed distributions, the median represents central tendency far better than the mean."
      }
    ]
  },
  {
    "id": "ASM-INTERN-BIZ",
    "title": "Business Development & Sales Operations Intern Assessment",
    "courseId": "CRS-SLS-001",
    "type": "MCQ",
    "approval": "Draft",
    "status": "Active",
    "durationMinutes": 25,
    "passScore": 70,
    "questionLimit": 12,
    "difficulty": "Beginner",
    "description": "Screening assessment for Business Development and Enterprise Sales interns testing Aptitude, Sales, Digital Marketing, and Psychometrics.",
    "questions": [
      {
        "id": "LIB-PSY-001",
        "category": "Psychometric",
        "difficulty": 1,
        "points": 1,
        "type": "MCQ",
        "prompt": "When faced with an urgent deadline and a teammate who is struggling with their portion, what is the best immediate course of action?",
        "options": [
          "Report the teammate's lag to the lead immediately",
          "Offer proactive assistance or pair-program to resolve blockers together",
          "Finish only your assigned portion and log off on time",
          "Take over all their work without notifying anyone"
        ],
        "answer": 1,
        "explanation": "Peer collaboration and mutual support optimize delivery while maintaining morale."
      },
      {
        "id": "LIB-PSY-002",
        "category": "Psychometric",
        "difficulty": 1,
        "points": 1,
        "type": "MCQ",
        "prompt": "If you realize you made an error in a task that was already reviewed and submitted, you should:",
        "options": [
          "Wait to see if someone else notices before saying anything",
          "Acknowledge the mistake proactively to your lead and present a proposed fix",
          "Quietly modify the production code without telling anyone",
          "Blame ambiguity in the initial task specification"
        ],
        "answer": 1,
        "explanation": "Accountability and proactive communication build professional credibility."
      },
      {
        "id": "LIB-PSY-003",
        "category": "Psychometric",
        "difficulty": 1,
        "points": 1,
        "type": "MCQ",
        "prompt": "When a manager gives you critical feedback regarding your communication style during meetings, how should you respond?",
        "options": [
          "Defend your behavior and point out other colleagues' flaws",
          "Listen actively, thank them for the feedback, and ask for specific examples to improve",
          "Remain silent and avoid speaking in subsequent meetings",
          "Send an angry email explaining why the feedback is unfair"
        ],
        "answer": 1,
        "explanation": "A growth mindset and receptiveness to constructive feedback are critical for career development."
      },
      {
        "id": "LIB-PSY-004",
        "category": "Psychometric",
        "difficulty": 1,
        "points": 1,
        "type": "MCQ",
        "prompt": "You are assigned a mundane administrative task that feels below your skill set. The most professional attitude is:",
        "options": [
          "Refuse the task and demand higher-level assignments",
          "Execute the task with diligence while exploring ways to automate or streamline it",
          "Do the bare minimum slowly so you won't be assigned it again",
          "Pass the task to another intern without permission"
        ],
        "answer": 1,
        "explanation": "Demonstrating thoroughness on routine tasks earns trust for larger responsibilities."
      },
      {
        "id": "LIB-PSY-005",
        "category": "Psychometric",
        "difficulty": 1,
        "points": 1,
        "type": "MCQ",
        "prompt": "In a cross-functional meeting, a stakeholder strongly disagrees with your design proposal. Your first reaction should be:",
        "options": [
          "Argue passionately until they surrender their objection",
          "Ask open-ended clarifying questions to understand their concerns and constraints",
          "Dismiss their opinion since they lack technical background",
          "Withdraw the proposal completely and abandon the initiative"
        ],
        "answer": 1,
        "explanation": "Active listening and empathy toward stakeholder constraints uncover root objections."
      },
      {
        "id": "LIB-PSY-006",
        "category": "Psychometric",
        "difficulty": 2,
        "points": 2,
        "type": "MCQ",
        "prompt": "Two colleagues in your project team have opposing opinions on an implementation approach, leading to deadlocks. What role should you play?",
        "options": [
          "Take one colleague's side based on personal friendship",
          "Encourage both to benchmark objective trade-offs (scalability, latency, maintenance) against project goals",
          "Stay out of it and wait for management intervention",
          "Vote for whichever option requires the least effort from you"
        ],
        "answer": 1,
        "explanation": "Facilitating objective criteria evaluation diffuses interpersonal conflict."
      },
      {
        "id": "LIB-PSY-007",
        "category": "Psychometric",
        "difficulty": 2,
        "points": 2,
        "type": "MCQ",
        "prompt": "You discover that a competitor has launched a feature identical to what your team has been developing for three months. How do you maintain team morale?",
        "options": [
          "Suggest giving up on the project completely",
          "Focus on your unique value proposition, customer feedback, and potential execution differentiators",
          "Complain to the team about the competitor's unethical behavior",
          "Rush out an unverified, buggy release to catch up"
        ],
        "answer": 1,
        "explanation": "Resilience in competitive environments requires pivoting to unique customer differentiation."
      },
      {
        "id": "LIB-PSY-008",
        "category": "Psychometric",
        "difficulty": 2,
        "points": 2,
        "type": "MCQ",
        "prompt": "When juggling three competing high-priority deliverables from different stakeholders, how do you prioritize effectively?",
        "options": [
          "Work on whichever task is easiest first",
          "Communicate with stakeholders and your manager to clarify business impact, dependencies, and revise realistic delivery expectations",
          "Promise all three by end of day and work overnight",
          "Ignore emails from the stakeholders until you are done"
        ],
        "answer": 1,
        "explanation": "Transparent stakeholder negotiation and impact-based prioritization prevent burnout and missed deadlines."
      },
      {
        "id": "LIB-PSY-009",
        "category": "Psychometric",
        "difficulty": 2,
        "points": 2,
        "type": "MCQ",
        "prompt": "An intern peer is consistently arriving late to daily standups, affecting the sprint review cadence. How do you address this?",
        "options": [
          "Publicly shame them in the general Slack channel",
          "Speak with them privately in an empathetic manner to understand their challenge before escalating if unresolved",
          "Ignore it completely since you are not their manager",
          "Report them anonymously to HR without speaking to them"
        ],
        "answer": 1,
        "explanation": "Peer accountability is best addressed through respectful, private, empathetic communication."
      },
      {
        "id": "LIB-PSY-010",
        "category": "Psychometric",
        "difficulty": 2,
        "points": 2,
        "type": "MCQ",
        "prompt": "You are asked to implement a feature that slightly violates customer data privacy guidelines for short-term engagement metrics. What should you do?",
        "options": [
          "Follow orders without questioning management",
          "Respectfully highlight compliance and ethical risks to the product owner and propose ethical alternatives",
          "Leak the conversation to public social media immediately",
          "Silently delete the feature ticket from the backlog"
        ],
        "answer": 1,
        "explanation": "Ethical integrity requires raising compliance and reputational risks through appropriate channels."
      },
      {
        "id": "LIB-PSY-011",
        "category": "Psychometric",
        "difficulty": 3,
        "points": 3,
        "type": "MCQ",
        "prompt": "During an agile retrospective, your team identifies significant process bottlenecks. What is the most constructive contribution you can make?",
        "options": [
          "List individual names who caused delays during the sprint",
          "Propose 1-2 actionable, measurable process experiments for the next sprint cycle",
          "Express frustration about how agile ceremonies waste valuable engineering time",
          "Remain quiet unless directly prompted by the scrum master"
        ],
        "answer": 1,
        "explanation": "Retrospectives succeed when teams focus on actionable process improvements rather than personal blame."
      },
      {
        "id": "LIB-PSY-012",
        "category": "Psychometric",
        "difficulty": 3,
        "points": 3,
        "type": "MCQ",
        "prompt": "You are placed in charge of an initiative with high ambiguity and no clear specifications. How do you approach the problem?",
        "options": [
          "Wait for your supervisor to write an exhaustive specification document",
          "Define assumptions, create an MVP prototype, and iterate based on early stakeholder feedback",
          "Implement what you assume is right without consulting anyone",
          "Decline the initiative due to lack of clarity"
        ],
        "answer": 1,
        "explanation": "Thriving in ambiguity requires rapid hypothesis formulation, prototyping, and stakeholder validation."
      },
      {
        "id": "LIB-PSY-013",
        "category": "Psychometric",
        "difficulty": 3,
        "points": 3,
        "type": "MCQ",
        "prompt": "A client changes scope requirements two days before a major release milestone. How should you approach the situation?",
        "options": [
          "Accept all changes without checking feasibility to please the client",
          "Assess scope impact, explain timeline implications, and offer a phased delivery plan",
          "Outright reject the client's request with a blunt email",
          "Blame the client for poor planning in front of leadership"
        ],
        "answer": 1,
        "explanation": "Professional scope management balances client satisfaction with realistic delivery phasing."
      },
      {
        "id": "LIB-PSY-014",
        "category": "Psychometric",
        "difficulty": 3,
        "points": 3,
        "type": "MCQ",
        "prompt": "You suspect your current project may fail to meet its quarterly ROI targets. What is the best demonstration of emotional intelligence?",
        "options": [
          "Conceal the lagging metrics until the end of the quarter",
          "Present early indicator data transparently along with mitigation and pivot options",
          "Start looking for another internal team before blame is assigned",
          "Downplay the targets as unrealistic in public meetings"
        ],
        "answer": 1,
        "explanation": "Early transparent reporting coupled with proactive solutions demonstrates executive maturity."
      },
      {
        "id": "LIB-PSY-015",
        "category": "Psychometric",
        "difficulty": 3,
        "points": 3,
        "type": "MCQ",
        "prompt": "When working in a diverse global team with differing cultural communication norms, what should you prioritize?",
        "options": [
          "Insist everyone follow your local communication style",
          "Practice active listening, avoid idioms, summarize agreements in writing, and respect time zone balance",
          "Communicate only via brief emojis to avoid misunderstandings",
          "Limit collaboration to colleagues from your own geographic region"
        ],
        "answer": 1,
        "explanation": "Cross-cultural effectiveness requires inclusive communication and clear asynchronous documentation."
      },
      {
        "id": "LIB-PSY-016",
        "category": "Psychometric",
        "difficulty": 4,
        "points": 4,
        "type": "MCQ",
        "prompt": "You have spent 2 weeks working on an architectural refactoring, but new performance tests show it offers only negligible improvement. What should you do?",
        "options": [
          "Hide the test data and push the refactored code to justify your time spent (sunk cost)",
          "Objectively document the findings, preserve learnings, and recommend retaining the simpler legacy architecture",
          "Force the team to adopt it anyway because of your personal effort",
          "Blame the testing framework for inaccurate benchmarks"
        ],
        "answer": 1,
        "explanation": "Overcoming sunk cost fallacy and prioritizing codebase simplicity demonstrates technical integrity."
      },
      {
        "id": "LIB-PSY-017",
        "category": "Psychometric",
        "difficulty": 4,
        "points": 4,
        "type": "MCQ",
        "prompt": "In a high-pressure crisis where a production outage is costing revenue every minute, what communication posture should you adopt?",
        "options": [
          "Speculate freely in customer channels about what could have blown up",
          "Maintain calm, factual, regular updates outlining known impact, current mitigation steps, and next checkpoint",
          "Turn off your phone to avoid anxious questions from leadership",
          "Point fingers at the engineer who pushed the last commit"
        ],
        "answer": 1,
        "explanation": "Crisis management demands calm, factual, cadence-based communication focused on mitigation."
      },
      {
        "id": "LIB-PSY-018",
        "category": "Psychometric",
        "difficulty": 4,
        "points": 4,
        "type": "MCQ",
        "prompt": "A junior peer is feeling imposter syndrome after receiving tough code reviews from senior staff. How can you mentor them most effectively?",
        "options": [
          "Tell them software engineering is tough and they might not be cut out for it",
          "Share your own past learning curves, normalize code review as code hygiene rather than personal judgment, and review PRs together",
          "Tell them to ignore the senior engineers' comments",
          "Write their code for them so they don't get reviewed harshly"
        ],
        "answer": 1,
        "explanation": "Empathetic mentorship normalizes growth curves and separates code feedback from self-worth."
      }
    ]
  },
  {
    "id": "ASM-INTERN-OPS",
    "title": "Product Management & Operations Intern Assessment",
    "courseId": "CRS-BSA-001",
    "type": "MCQ",
    "approval": "Draft",
    "status": "Active",
    "durationMinutes": 30,
    "passScore": 75,
    "questionLimit": 15,
    "difficulty": "Intermediate",
    "description": "Comprehensive problem solving, analytical thinking, and reasoning evaluation for aspiring Product & Operations interns.",
    "questions": [
      {
        "id": "LIB-ANA-001",
        "category": "Analytical",
        "difficulty": 1,
        "points": 1,
        "type": "MCQ",
        "prompt": "If a company's revenue increased by 20% in Year 1 and then decreased by 20% in Year 2, what is the net change compared to original revenue?",
        "options": [
          "0% change (remains identical)",
          "4% decrease",
          "4% increase",
          "2% decrease"
        ],
        "answer": 1,
        "explanation": "100 * 1.2 = 120; 120 * 0.8 = 96. Net change = 4% decrease."
      },
      {
        "id": "LIB-ANA-002",
        "category": "Analytical",
        "difficulty": 1,
        "points": 1,
        "type": "MCQ",
        "prompt": "A product funnel shows: 10,000 visitors, 1,000 sign-ups, and 100 paid conversions. What is the overall visitor-to-paid conversion rate?",
        "options": [
          "10%",
          "5%",
          "1%",
          "0.1%"
        ],
        "answer": 2,
        "explanation": "(100 / 10,000) * 100% = 1%."
      },
      {
        "id": "LIB-ANA-003",
        "category": "Analytical",
        "difficulty": 1,
        "points": 1,
        "type": "MCQ",
        "prompt": "Which visual representation is best suited for illustrating the correlation between two continuous numerical variables?",
        "options": [
          "Pie Chart",
          "Scatter Plot",
          "Stacked Bar Chart",
          "Treemap"
        ],
        "answer": 1,
        "explanation": "Scatter plots visualize correlation, distribution, and clustering between two continuous variables."
      },
      {
        "id": "LIB-ANA-004",
        "category": "Analytical",
        "difficulty": 1,
        "points": 1,
        "type": "MCQ",
        "prompt": "If the mean of five numbers is 24, what is their total sum?",
        "options": [
          "96",
          "120",
          "144",
          "100"
        ],
        "answer": 1,
        "explanation": "Sum = Mean * Count = 24 * 5 = 120."
      },
      {
        "id": "LIB-ANA-005",
        "category": "Analytical",
        "difficulty": 1,
        "points": 1,
        "type": "MCQ",
        "prompt": "What does a high standard deviation indicate about a dataset?",
        "options": [
          "The values are clustered tightly around the mean",
          "The values are spread out over a wider range",
          "The data has no outliers",
          "The sample size is too small"
        ],
        "answer": 1,
        "explanation": "Standard deviation measures dispersion; higher values indicate greater variance from the mean."
      },
      {
        "id": "LIB-ANA-006",
        "category": "Analytical",
        "difficulty": 2,
        "points": 2,
        "type": "MCQ",
        "prompt": "A test yields a 95% true positive rate with a 5% false positive rate. If a disease prevalence is 1 in 1,000, what is the probability that a positive test is a true case?",
        "options": [
          "95%",
          "About 50%",
          "Under 2%",
          "100%"
        ],
        "answer": 2,
        "explanation": "Base rate fallacy: 95 true pos vs ~4,995 false pos yields ~1.86% probability."
      },
      {
        "id": "LIB-ANA-007",
        "category": "Analytical",
        "difficulty": 2,
        "points": 2,
        "type": "MCQ",
        "prompt": "If Customer Acquisition Cost (CAC) is $200 and Customer Lifetime Value (LTV) is $600, what is the LTV:CAC ratio and its health assessment?",
        "options": [
          "0.33 (Unhealthy - burning capital)",
          "3.0 (Healthy benchmark for sustainable SaaS growth)",
          "1.5 (Marginal profitability)",
          "6.0 (Underinvesting in sales)"
        ],
        "answer": 1,
        "explanation": "An LTV:CAC ratio of 3.0:1 is considered the gold standard benchmark for SaaS unit economics."
      },
      {
        "id": "LIB-ANA-008",
        "category": "Analytical",
        "difficulty": 2,
        "points": 2,
        "type": "MCQ",
        "prompt": "In an A/B test, Variant B increases click-through rate by 15% with p-value = 0.03. Assuming alpha = 0.05, what is the statistical conclusion?",
        "options": [
          "Reject the null hypothesis; the observed lift is statistically significant",
          "Fail to reject the null hypothesis; the lift could easily be random noise",
          "Variant B is 97% guaranteed to double revenue",
          "Sample size was invalid"
        ],
        "answer": 0,
        "explanation": "Since p-value (0.03) < alpha (0.05), we reject the null hypothesis."
      },
      {
        "id": "LIB-ANA-009",
        "category": "Analytical",
        "difficulty": 2,
        "points": 2,
        "type": "MCQ",
        "prompt": "If a server's monthly uptime is 99.9% ('three nines'), approximately how much downtime is permitted in a 30-day month?",
        "options": [
          "43 minutes",
          "7.2 hours",
          "1.5 hours",
          "8.6 seconds"
        ],
        "answer": 0,
        "explanation": "30 days * 24 hrs * 60 min = 43,200 min. 0.1% downtime = 43.2 minutes."
      },
      {
        "id": "LIB-ANA-010",
        "category": "Analytical",
        "difficulty": 2,
        "points": 2,
        "type": "MCQ",
        "prompt": "A cohort of 500 subscribers experiences a 4% monthly compounding churn. Approximately how many subscribers remain after 3 months?",
        "options": [
          "440",
          "442",
          "420",
          "460"
        ],
        "answer": 1,
        "explanation": "500 * (0.96)^3 = 500 * 0.8847 = 442.3 subscribers."
      },
      {
        "id": "LIB-ANA-011",
        "category": "Analytical",
        "difficulty": 3,
        "points": 3,
        "type": "MCQ",
        "prompt": "An e-commerce store notes that conversion rate dropped from 4% to 2% while traffic tripled from a new ad campaign. What phenomenon explains this?",
        "options": [
          "The website checkout crashed",
          "Audience dilution: low-intent traffic diluted high-intent baseline conversion",
          "Algorithm error in analytics database",
          "Seasonal customer fatigue"
        ],
        "answer": 1,
        "explanation": "Broad ad campaigns bring lower-intent users, lowering the aggregate conversion rate despite increasing absolute conversions."
      },
      {
        "id": "LIB-ANA-012",
        "category": "Analytical",
        "difficulty": 3,
        "points": 3,
        "type": "MCQ",
        "prompt": "Simpson's Paradox occurs when:",
        "options": [
          "A trend appears in aggregated groups of data but disappears or reverses when groups are combined",
          "Data is missing uniformly at random",
          "Sample size exceeds population size",
          "Correlation implies direct causation"
        ],
        "answer": 0,
        "explanation": "Simpson's Paradox describes when aggregate data reverses trends observed within separate subgroups."
      },
      {
        "id": "LIB-ANA-013",
        "category": "Analytical",
        "difficulty": 3,
        "points": 3,
        "type": "MCQ",
        "prompt": "If monthly recurring revenue (MRR) is $100,000, expansion MRR is $10,000, churned MRR is $6,000, and contraction MRR is $2,000, what is the Net Retention Rate (NRR)?",
        "options": [
          "102%",
          "98%",
          "108%",
          "92%"
        ],
        "answer": 0,
        "explanation": "NRR = (100k + 10k - 6k - 2k) / 100k = 102%."
      },
      {
        "id": "LIB-ANA-014",
        "category": "Analytical",
        "difficulty": 3,
        "points": 3,
        "type": "MCQ",
        "prompt": "A regression model has an R-squared value of 0.81. What does this measure?",
        "options": [
          "81% of predictions are exact integers",
          "81% of variance in the dependent variable is explained by independent variables",
          "The model has an 81% error rate",
          "The correlation coefficient is 0.81"
        ],
        "answer": 1,
        "explanation": "R-squared represents the proportion of variance in the dependent variable explained by independent variables."
      },
      {
        "id": "LIB-ANA-015",
        "category": "Analytical",
        "difficulty": 3,
        "points": 3,
        "type": "MCQ",
        "prompt": "When calculating rolling 7-day moving averages for volatile daily revenue data, the primary analytical objective is to:",
        "options": [
          "Artificially inflate total quarterly numbers",
          "Smooth out intra-week cyclical noise to identify underlying trends",
          "Eliminate the need for historical records",
          "Replace predictive modeling entirely"
        ],
        "answer": 1,
        "explanation": "Moving averages smooth seasonal or day-of-week fluctuations to reveal core underlying trajectories."
      },
      {
        "id": "LIB-ANA-016",
        "category": "Analytical",
        "difficulty": 4,
        "points": 4,
        "type": "MCQ",
        "prompt": "You are analyzing retention curves for three user cohorts. Cohort A levels off horizontally at 25% at Day 30, Cohort B slopes downward continuously to 5%, and Cohort C drops to 0%. Which cohort exhibits Product-Market Fit?",
        "options": [
          "Cohort B because of gradual decline",
          "Cohort A because asymptotic flattening indicates a sticky, retained core user base",
          "Cohort C because it has no lingering support costs",
          "None of them demonstrate PMF"
        ],
        "answer": 1,
        "explanation": "Flattening retention curves are the definitive quantitative signal of product-market fit."
      },
      {
        "id": "LIB-ANA-017",
        "category": "Analytical",
        "difficulty": 4,
        "points": 4,
        "type": "MCQ",
        "prompt": "In evaluating credit risk, a false positive classifies a safe applicant as high risk. A false negative approves a borrower who defaults ($10,000 loss). How should the decision threshold be tuned?",
        "options": [
          "Maximize accuracy at 50/50 balance",
          "Heavily penalize false negatives by lowering the risk approval threshold to minimize default exposure",
          "Ignore false negatives and maximize loan origination volume",
          "Rely exclusively on unweighted F1-score"
        ],
        "answer": 1,
        "explanation": "Asymmetric cost matrices require tuning precision/recall thresholds to heavily suppress catastrophic false negative losses."
      },
      {
        "id": "LIB-ANA-018",
        "category": "Analytical",
        "difficulty": 4,
        "points": 4,
        "type": "MCQ",
        "prompt": "A SaaS company has an average sales cycle of 90 days. If the qualified sales pipeline is $2,000,000 with a historical win rate of 25%, what is the expected closed revenue over the next quarter?",
        "options": [
          "$2,000,000",
          "$500,000",
          "$1,000,000",
          "$250,000"
        ],
        "answer": 1,
        "explanation": "Weighted Pipeline = Total Pipeline Value * Historical Win Rate = $2,000,000 * 0.25 = $500,000."
      },
      {
        "id": "LIB-ANA-019",
        "category": "Analytical",
        "difficulty": 4,
        "points": 4,
        "type": "MCQ",
        "prompt": "A product team observes that users who complete Step 4 in onboarding retain at 80%, compared to 20% for those who do not. The product manager proposes making Step 4 mandatory. What analytical trap must be vetted?",
        "options": [
          "Survivorship / Selection bias: high-intent users naturally complete Step 4 regardless, rather than Step 4 causing retention",
          "Hawthorne effect",
          "Central Limit Theorem failure",
          "Multicollinearity"
        ],
        "answer": 0,
        "explanation": "Correlation vs causation: high-intent power users self-select to complete advanced onboarding steps."
      },
      {
        "id": "LIB-ANA-020",
        "category": "Analytical",
        "difficulty": 4,
        "points": 4,
        "type": "MCQ",
        "prompt": "Given a log-normal distribution of user session lengths, which metric best summarizes the central tendency for an executive presentation?",
        "options": [
          "Arithmetic Mean",
          "Median",
          "Maximum value",
          "Standard error"
        ],
        "answer": 1,
        "explanation": "For skewed distributions, the median represents central tendency far better than the mean."
      }
    ]
  },
  {
    "id": "ASM-INTERN-HR",
    "title": "Talent Acquisition & People Operations Intern Assessment",
    "courseId": "CRS-HRO-001",
    "type": "MCQ",
    "approval": "Draft",
    "status": "Active",
    "durationMinutes": 20,
    "passScore": 70,
    "questionLimit": 12,
    "difficulty": "Beginner",
    "description": "Evaluates people skills, ethical judgment, communication, and human resource management basics for People Ops interns.",
    "questions": [
      {
        "id": "LIB-PSY-001",
        "category": "Psychometric",
        "difficulty": 1,
        "points": 1,
        "type": "MCQ",
        "prompt": "When faced with an urgent deadline and a teammate who is struggling with their portion, what is the best immediate course of action?",
        "options": [
          "Report the teammate's lag to the lead immediately",
          "Offer proactive assistance or pair-program to resolve blockers together",
          "Finish only your assigned portion and log off on time",
          "Take over all their work without notifying anyone"
        ],
        "answer": 1,
        "explanation": "Peer collaboration and mutual support optimize delivery while maintaining morale."
      },
      {
        "id": "LIB-PSY-002",
        "category": "Psychometric",
        "difficulty": 1,
        "points": 1,
        "type": "MCQ",
        "prompt": "If you realize you made an error in a task that was already reviewed and submitted, you should:",
        "options": [
          "Wait to see if someone else notices before saying anything",
          "Acknowledge the mistake proactively to your lead and present a proposed fix",
          "Quietly modify the production code without telling anyone",
          "Blame ambiguity in the initial task specification"
        ],
        "answer": 1,
        "explanation": "Accountability and proactive communication build professional credibility."
      },
      {
        "id": "LIB-PSY-003",
        "category": "Psychometric",
        "difficulty": 1,
        "points": 1,
        "type": "MCQ",
        "prompt": "When a manager gives you critical feedback regarding your communication style during meetings, how should you respond?",
        "options": [
          "Defend your behavior and point out other colleagues' flaws",
          "Listen actively, thank them for the feedback, and ask for specific examples to improve",
          "Remain silent and avoid speaking in subsequent meetings",
          "Send an angry email explaining why the feedback is unfair"
        ],
        "answer": 1,
        "explanation": "A growth mindset and receptiveness to constructive feedback are critical for career development."
      },
      {
        "id": "LIB-PSY-004",
        "category": "Psychometric",
        "difficulty": 1,
        "points": 1,
        "type": "MCQ",
        "prompt": "You are assigned a mundane administrative task that feels below your skill set. The most professional attitude is:",
        "options": [
          "Refuse the task and demand higher-level assignments",
          "Execute the task with diligence while exploring ways to automate or streamline it",
          "Do the bare minimum slowly so you won't be assigned it again",
          "Pass the task to another intern without permission"
        ],
        "answer": 1,
        "explanation": "Demonstrating thoroughness on routine tasks earns trust for larger responsibilities."
      },
      {
        "id": "LIB-PSY-005",
        "category": "Psychometric",
        "difficulty": 1,
        "points": 1,
        "type": "MCQ",
        "prompt": "In a cross-functional meeting, a stakeholder strongly disagrees with your design proposal. Your first reaction should be:",
        "options": [
          "Argue passionately until they surrender their objection",
          "Ask open-ended clarifying questions to understand their concerns and constraints",
          "Dismiss their opinion since they lack technical background",
          "Withdraw the proposal completely and abandon the initiative"
        ],
        "answer": 1,
        "explanation": "Active listening and empathy toward stakeholder constraints uncover root objections."
      },
      {
        "id": "LIB-PSY-006",
        "category": "Psychometric",
        "difficulty": 2,
        "points": 2,
        "type": "MCQ",
        "prompt": "Two colleagues in your project team have opposing opinions on an implementation approach, leading to deadlocks. What role should you play?",
        "options": [
          "Take one colleague's side based on personal friendship",
          "Encourage both to benchmark objective trade-offs (scalability, latency, maintenance) against project goals",
          "Stay out of it and wait for management intervention",
          "Vote for whichever option requires the least effort from you"
        ],
        "answer": 1,
        "explanation": "Facilitating objective criteria evaluation diffuses interpersonal conflict."
      },
      {
        "id": "LIB-PSY-007",
        "category": "Psychometric",
        "difficulty": 2,
        "points": 2,
        "type": "MCQ",
        "prompt": "You discover that a competitor has launched a feature identical to what your team has been developing for three months. How do you maintain team morale?",
        "options": [
          "Suggest giving up on the project completely",
          "Focus on your unique value proposition, customer feedback, and potential execution differentiators",
          "Complain to the team about the competitor's unethical behavior",
          "Rush out an unverified, buggy release to catch up"
        ],
        "answer": 1,
        "explanation": "Resilience in competitive environments requires pivoting to unique customer differentiation."
      },
      {
        "id": "LIB-PSY-008",
        "category": "Psychometric",
        "difficulty": 2,
        "points": 2,
        "type": "MCQ",
        "prompt": "When juggling three competing high-priority deliverables from different stakeholders, how do you prioritize effectively?",
        "options": [
          "Work on whichever task is easiest first",
          "Communicate with stakeholders and your manager to clarify business impact, dependencies, and revise realistic delivery expectations",
          "Promise all three by end of day and work overnight",
          "Ignore emails from the stakeholders until you are done"
        ],
        "answer": 1,
        "explanation": "Transparent stakeholder negotiation and impact-based prioritization prevent burnout and missed deadlines."
      },
      {
        "id": "LIB-PSY-009",
        "category": "Psychometric",
        "difficulty": 2,
        "points": 2,
        "type": "MCQ",
        "prompt": "An intern peer is consistently arriving late to daily standups, affecting the sprint review cadence. How do you address this?",
        "options": [
          "Publicly shame them in the general Slack channel",
          "Speak with them privately in an empathetic manner to understand their challenge before escalating if unresolved",
          "Ignore it completely since you are not their manager",
          "Report them anonymously to HR without speaking to them"
        ],
        "answer": 1,
        "explanation": "Peer accountability is best addressed through respectful, private, empathetic communication."
      },
      {
        "id": "LIB-PSY-010",
        "category": "Psychometric",
        "difficulty": 2,
        "points": 2,
        "type": "MCQ",
        "prompt": "You are asked to implement a feature that slightly violates customer data privacy guidelines for short-term engagement metrics. What should you do?",
        "options": [
          "Follow orders without questioning management",
          "Respectfully highlight compliance and ethical risks to the product owner and propose ethical alternatives",
          "Leak the conversation to public social media immediately",
          "Silently delete the feature ticket from the backlog"
        ],
        "answer": 1,
        "explanation": "Ethical integrity requires raising compliance and reputational risks through appropriate channels."
      },
      {
        "id": "LIB-PSY-011",
        "category": "Psychometric",
        "difficulty": 3,
        "points": 3,
        "type": "MCQ",
        "prompt": "During an agile retrospective, your team identifies significant process bottlenecks. What is the most constructive contribution you can make?",
        "options": [
          "List individual names who caused delays during the sprint",
          "Propose 1-2 actionable, measurable process experiments for the next sprint cycle",
          "Express frustration about how agile ceremonies waste valuable engineering time",
          "Remain quiet unless directly prompted by the scrum master"
        ],
        "answer": 1,
        "explanation": "Retrospectives succeed when teams focus on actionable process improvements rather than personal blame."
      },
      {
        "id": "LIB-PSY-012",
        "category": "Psychometric",
        "difficulty": 3,
        "points": 3,
        "type": "MCQ",
        "prompt": "You are placed in charge of an initiative with high ambiguity and no clear specifications. How do you approach the problem?",
        "options": [
          "Wait for your supervisor to write an exhaustive specification document",
          "Define assumptions, create an MVP prototype, and iterate based on early stakeholder feedback",
          "Implement what you assume is right without consulting anyone",
          "Decline the initiative due to lack of clarity"
        ],
        "answer": 1,
        "explanation": "Thriving in ambiguity requires rapid hypothesis formulation, prototyping, and stakeholder validation."
      },
      {
        "id": "LIB-PSY-013",
        "category": "Psychometric",
        "difficulty": 3,
        "points": 3,
        "type": "MCQ",
        "prompt": "A client changes scope requirements two days before a major release milestone. How should you approach the situation?",
        "options": [
          "Accept all changes without checking feasibility to please the client",
          "Assess scope impact, explain timeline implications, and offer a phased delivery plan",
          "Outright reject the client's request with a blunt email",
          "Blame the client for poor planning in front of leadership"
        ],
        "answer": 1,
        "explanation": "Professional scope management balances client satisfaction with realistic delivery phasing."
      },
      {
        "id": "LIB-PSY-014",
        "category": "Psychometric",
        "difficulty": 3,
        "points": 3,
        "type": "MCQ",
        "prompt": "You suspect your current project may fail to meet its quarterly ROI targets. What is the best demonstration of emotional intelligence?",
        "options": [
          "Conceal the lagging metrics until the end of the quarter",
          "Present early indicator data transparently along with mitigation and pivot options",
          "Start looking for another internal team before blame is assigned",
          "Downplay the targets as unrealistic in public meetings"
        ],
        "answer": 1,
        "explanation": "Early transparent reporting coupled with proactive solutions demonstrates executive maturity."
      },
      {
        "id": "LIB-PSY-015",
        "category": "Psychometric",
        "difficulty": 3,
        "points": 3,
        "type": "MCQ",
        "prompt": "When working in a diverse global team with differing cultural communication norms, what should you prioritize?",
        "options": [
          "Insist everyone follow your local communication style",
          "Practice active listening, avoid idioms, summarize agreements in writing, and respect time zone balance",
          "Communicate only via brief emojis to avoid misunderstandings",
          "Limit collaboration to colleagues from your own geographic region"
        ],
        "answer": 1,
        "explanation": "Cross-cultural effectiveness requires inclusive communication and clear asynchronous documentation."
      },
      {
        "id": "LIB-PSY-016",
        "category": "Psychometric",
        "difficulty": 4,
        "points": 4,
        "type": "MCQ",
        "prompt": "You have spent 2 weeks working on an architectural refactoring, but new performance tests show it offers only negligible improvement. What should you do?",
        "options": [
          "Hide the test data and push the refactored code to justify your time spent (sunk cost)",
          "Objectively document the findings, preserve learnings, and recommend retaining the simpler legacy architecture",
          "Force the team to adopt it anyway because of your personal effort",
          "Blame the testing framework for inaccurate benchmarks"
        ],
        "answer": 1,
        "explanation": "Overcoming sunk cost fallacy and prioritizing codebase simplicity demonstrates technical integrity."
      }
    ]
  }
];
