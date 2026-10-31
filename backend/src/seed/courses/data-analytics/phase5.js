export const phase5Chapters = [
  {
    id: "CH-DNA-025",
    courseId: "CRS-DNA-001",
    title: "The Modern Analytics Stack: ELT, dbt & Cloud Warehouses",
    order: 25,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=0h3jO5BhnqE",
    content: `# The Modern Analytics Stack: ELT, dbt & Cloud Warehouses

### Learning Objectives
1. Understand the architectural shift from legacy ETL (Extract-Transform-Load) to cloud ELT (Extract-Load-Transform).
2. Master the Modern Data Stack (MDS): Ingestion (Fivetran/Airbyte), Warehouse (Snowflake/BigQuery), and Transformation (dbt).
3. Author dbt models: Staging, Intermediate, and Marts using modular SQL and Jinja templating.
4. Manage Directed Acyclic Graphs (DAGs), documentation generation, and schema tests in dbt.

---

### 1. Legacy ETL vs. Modern ELT Architecture

In legacy on-premise architectures, computing power was constrained. Data had to be transformed in external ETL servers (Informatica, SSIS) before loading into databases.
The cloud revolution separated compute from storage:

\`\`\`
   LEGACY ETL (Compute Constrained):
   [ Sources ] ---> [ Heavy External ETL Server ] ---> [ On-Prem Database ]
                     (Slow, Bottlenecked, Rigid)

   MODERN ELT (Cloud Warehouses: Snowflake, BigQuery):
   [ Sources ] 
        |
        v Ingestion (Fivetran / Airbyte)
   [ Cloud Data Warehouse Raw Tables ]
        |
        v Transformation in SQL using dbt (Data Build Tool)
   [ Clean Analytics Marts & Star Schemas ]
\`\`\`

---

### 2. dbt (Data Build Tool) Architecture

dbt applies software engineering best practices (modular code, version control, automated testing, documentation) to SQL transformations:

\`\`\`
   [ RAW DATA ]     --> raw.stripe_payments, raw.shopify_orders
         |
         v (dbt Staging Models: 1-to-1 clean, rename, cast types)
   [ STAGING ]      --> stg_stripe__payments.sql, stg_shopify__orders.sql
         |
         v (dbt Intermediate Models: join, aggregate, business rules)
   [ INTERMEDIATE ] --> int_orders__unioned.sql, int_customer_spend.sql
         |
         v (dbt Marts: Star Schema Facts & Dimensions for BI tools)
   [ MARTS ]        --> fct_orders.sql, dim_customers.sql
\`\`\`

---

### 3. Authoring a dbt Model with Jinja & Ref()

The \`ref()\` function establishes dependencies between models, enabling dbt to build the **Directed Acyclic Graph (DAG)** automatically:

\`\`\`sql
-- models/marts/fct_orders.sql
{{ config(
    materialized='incremental',
    unique_key='order_id'
) }}

WITH payments AS (
    SELECT order_id, SUM(amount_usd) AS total_paid
    FROM {{ ref('stg_stripe__payments') }}
    WHERE status = 'SUCCESS'
    GROUP BY 1
),
orders AS (
    SELECT order_id, customer_id, order_date, status
    FROM {{ ref('stg_shopify__orders') }}
)
SELECT 
    o.order_id,
    o.customer_id,
    o.order_date,
    o.status,
    COALESCE(p.total_paid, 0) AS total_revenue_usd
FROM orders o
LEFT JOIN payments p ON o.order_id = p.order_id

{% if is_incremental() %}
    -- Incremental run: only process new records created since last run
    WHERE o.order_date >= (SELECT MAX(order_date) FROM {{ this }})
{% endif %}
\`\`\`

---

### 4. Automated Testing & Documentation in dbt

\`\`\`yaml
# models/schema.yml
version: 2
models:
  - name: fct_orders
    description: "Core sales fact table containing reconciled orders and revenues"
    columns:
      - name: order_id
        description: "Primary key"
        tests:
          - unique
          - not_null
      - name: total_revenue_usd
        description: "Reconciled total revenue in USD"
        tests:
          - not_null
\`\`\`

\`\`\`bash
# Run all transformations and tests via CLI
dbt build
\`\`\`

---

### 5. Hands-on Lab: dbt Analytics Pipeline
1. Create staging models for raw payment and order CSVs.
2. Build an intermediate customer aggregation model.
3. Configure \`unique\` and \`not_null\` schema tests and execute \`dbt test\`.`
  },
  {
    id: "CH-DNA-026",
    courseId: "CRS-DNA-001",
    title: "Data Governance, Lineage & Metadata Management",
    order: 26,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=k423X7jK5yI",
    content: `# Data Governance, Lineage & Metadata Management

### Learning Objectives
1. Understand the core pillars of Data Governance: Ownership, Quality, Security, Compliance, and Stewardship.
2. Track end-to-end Data Lineage: From operational source databases to BI dashboards.
3. Implement enterprise Data Catalogs (DataHub, Amundsen, Alation, Monte Carlo).
4. Enforce PII masking, tokenization, and privacy compliance under GDPR, CCPA, and HIPAA.

---

### 1. The Cost of Ungoverned Data

Without data governance, organizations suffer from "data swamps":
- No one knows who owns or created a critical table.
- Multiple unverified copies of tables proliferate across cloud storage.
- Developers alter production schemas, silently breaking downstream executive dashboards.
- Regulatory audits find unencrypted credit card details and PII in test databases, resulting in millions of dollars in fines.

---

### 2. End-to-End Data Lineage

**Data Lineage** maps the full lifecycle journey of a data point: where it originated, what transformations modified it, and which downstream dashboards consume it:

\`\`\`
   [ PostgreSQL: public.users ] (Operational Source)
                 |
                 v (Fivetran Sync)
   [ Snowflake: RAW.USERS ]
                 |
                 v (dbt: stg_users -> dim_customers)
   [ Snowflake: ANALYTICS.DIM_CUSTOMERS ]
                 |
                 v (Power BI Dataset: "Customer Intelligence")
   [ Executive Dashboard: "Churn & Retention Cockpit" ]
\`\`\`

#### Impact Analysis:
When a developer proposes dropping \`users.birthdate\`, lineage tools automatically alert the team that 4 BI dashboards and 2 machine learning features will break.

---

### 3. PII Protection & Dynamic Data Masking

Personal Identifiable Information (PII) must be masked dynamically in analytical warehouses so analysts can compute statistics without viewing plain text:

\`\`\`sql
-- Snowflake Dynamic Data Masking Policy
CREATE OR REPLACE MASKING POLICY mask_email AS (val VARCHAR) 
RETURNS VARCHAR ->
    CASE 
        WHEN CURRENT_ROLE() IN ('COMPLIANCE_OFFICER', 'LEGAL_ADMIN') THEN val
        ELSE REGEXP_REPLACE(val, '(^[^@]{2})(.*)(@[^@]+$)', '\\\\1****\\\\3')
    END;

-- Apply policy to column
ALTER TABLE dim_customers MODIFY COLUMN email SET MASKING POLICY mask_email;
\`\`\`

*Result*: Regular analysts query \`email\` and observe \`al****@domain.com\`, protecting privacy while preserving domain uniqueness.

---

### 4. Hands-on Lab: Governance & Lineage Audit
1. Build a mock metadata dictionary mapping table definitions, owners, and update frequencies.
2. Construct a manual lineage graph tracing a financial KPI back to raw ERP source tables.
3. Configure a dynamic masking policy on sensitive customer attributes.`
  },
  {
    id: "CH-DNA-027",
    courseId: "CRS-DNA-001",
    title: "Automated Data Quality Testing with Great Expectations",
    order: 27,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=F3zWw4Zp8sM",
    content: `# Automated Data Quality Testing with Great Expectations

### Learning Objectives
1. Implement programmatic Data Quality (DQ) testing using the **Great Expectations (GX)** framework.
2. Author Expectation Suites: Nullability, Uniqueness, Value ranges, and Statistical set containment.
3. Configure Checkpoints that halt ETL/ELT pipeline execution upon data quality failure.
4. Auto-generate human-readable **Data Docs** living documentation dashboards.

---

### 1. Great Expectations Architecture

Great Expectations brings automated test-driven development (TDD) into data engineering and analytics:

\`\`\`
   [ Raw Data Ingested ]
              |
              v
   +---------------------------------------------+
   |          GREAT EXPECTATIONS CHECKPOINT      |
   |                                             |
   | Expectation Suite: "orders_quality_suite"   |
   | - expect_column_values_to_not_be_null('id') |
   | - expect_column_values_to_be_unique('id')   |
   | - expect_column_values_to_be_between(       |
   |     'amount', min_value=0.01)               |
   +----------------------+----------------------+
                          |
             +------------+------------+
             |                         |
          (PASS)                    (FAIL)
             |                         |
             v                         v
   [ Advance to BI Marts ]   [ Halt Pipeline & Alert Slack ]
                             [ Update Visual Data Docs ]
\`\`\`

---

### 2. Authoring Expectations in Python

\`\`\`python
import great_expectations as gx

# 1. Initialize Context
context = gx.get_context()

# 2. Connect Data Source
data_source = context.data_sources.add_pandas("orders_source")
data_asset = data_source.add_dataframe_asset("orders_asset")
batch_request = data_asset.build_batch_request(dataframe=df)

# 3. Create Expectation Suite
suite = context.suites.add(gx.ExpectationSuite(name="sales_suite"))

# 4. Add Concrete Declarative Expectations
suite.add_expectation(
    gx.expectations.ExpectColumnValuesToNotBeNull(column="order_id")
)
suite.add_expectation(
    gx.expectations.ExpectColumnValuesToBeUnique(column="order_id")
)
suite.add_expectation(
    gx.expectations.ExpectColumnValuesToBeBetween(
        column="discount_rate", 
        min_value=0.0, 
        max_value=0.50 # Discounts cannot exceed 50%!
    )
)
suite.add_expectation(
    gx.expectations.ExpectColumnValuesToBeInSet(
        column="order_status",
        value_set=["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]
    )
)
\`\`\`

---

### 3. Data Docs: Living Quality Documentation

When Great Expectations validates a dataset, it compiles HTML Data Docs detailing every passing and failing row with visual percentages:
- What percentage of values were null?
- What was the minimum/maximum value observed?
- Which specific unexpected values violated the expectation?

---

### 4. Hands-on Lab: Data Quality Gate
1. Create an expectation suite for an e-commerce transactions table.
2. Inject corrupted rows (negative prices, null IDs, invalid status strings).
3. Run the GX checkpoint, verify that the validation fails, and inspect the rendered HTML Data Docs report.`
  },
  {
    id: "CH-DNA-028",
    courseId: "CRS-DNA-001",
    title: "Advanced Analytics: Churn Prediction & Survival Analysis",
    order: 28,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=VywxIQ2ZXw4",
    content: `# Advanced Analytics: Churn Prediction & Survival Analysis

### Learning Objectives
1. Understand why traditional classification models struggle with time-to-event customer data (Censored Data).
2. Master Survival Analysis: Survival Function $S(t)$ and Hazard Function $h(t)$.
3. Model customer retention curves using the Kaplan-Meier Estimator.
4. Quantify risk factors with Cox Proportional Hazards regression modeling.

---

### 1. The Right-Censoring Problem

Standard classification models ask: *"Did the customer churn? (Yes/No)"*.
This introduces critical flaws for active customers:
- A customer who joined yesterday hasn't churned yet, but might churn tomorrow!
- Treating active customers as "Not Churned" biases models.

This is known as **Right-Censored Data**: we know how long they have survived so far, but their ultimate churn event has not occurred yet.

\`\`\`
   CUSTOMER LIFELINES:
   Customer A: |==================== [CHURNED at Month 20]
   Customer B: |========== [CHURNED at Month 10]
   Customer C: |============================== [ACTIVE at Month 30 - Censored!]
   Customer D: |===== [ACTIVE at Month 5 - Censored!]
\`\`\`

**Survival Analysis** models the probability that a customer survives past time $t$ given that they have survived up to that point.

---

### 2. Kaplan-Meier Survival Curves in Python

Using the \`lifelines\` library:

\`\`\`python
import pandas as pd
from lifelines import KaplanMeierFitter
import matplotlib.pyplot as plt

# Load subscription tenure data
# 'tenure_months': observation duration
# 'churned': 1 if cancelled, 0 if active/censored
df = pd.read_csv("saas_subscriber_tenure.csv")

kmf = KaplanMeierFitter()

# Fit survival curve across customer tiers
plt.figure(figsize=(10, 6))

for tier in ['Enterprise', 'SMB', 'Free']:
    mask = (df['tier'] == tier)
    kmf.fit(
        durations=df.loc[mask, 'tenure_months'], 
        event_observed=df.loc[mask, 'churned'], 
        label=tier
    )
    kmf.plot_survival_function()

plt.title("Customer Survival Curves by Subscription Tier (Kaplan-Meier)")
plt.xlabel("Tenure (Months)")
plt.ylabel("Probability of Retained Subscription S(t)")
plt.grid(True, linestyle="--", alpha=0.6)
plt.show()
\`\`\`

---

### 3. Cox Proportional Hazards: Identifying Churn Drivers

The Cox model evaluates how multiple covariates (features) increase or decrease the **hazard** (risk) of churn:

\`\`\`python
from lifelines import CoxPHFitter

cph = CoxPHFitter()
cph.fit(
    df[['tenure_months', 'churned', 'monthly_support_tickets', 'discount_pct', 'feature_adoption_score']], 
    duration_col='tenure_months', 
    event_col='churned'
)

cph.print_summary()
# Exp(coef) represents the Hazard Ratio:
# Hazard Ratio = 1.45 means each additional support ticket increases churn risk by 45%!
\`\`\`

---

### 4. Hands-on Lab: Survival Modeling Lab
1. Model customer lifelines for an enterprise software product.
2. Plot Kaplan-Meier curves comparing annual vs. monthly billing contracts.
3. Calculate the median customer survival lifespan across segments.`
  },
  {
    id: "CH-DNA-029",
    courseId: "CRS-DNA-001",
    title: "Comprehensive Capstone: Enterprise Analytics Audit & Strategy",
    order: 29,
    estimatedMinutes: 60,
    videoUrl: "https://www.youtube.com/watch?v=0h3jO5BhnqE",
    content: `# Comprehensive Capstone: Enterprise Analytics Audit & Strategy

### Learning Objectives
1. Synthesize all data analytics competencies into a real-world enterprise audit of "Aura Global Retail".
2. Ingest, clean, and model multi-million-row sales, inventory, and marketing datasets using advanced SQL and Polars.
3. Compute executive KPIs: NRR, LTV/CAC, Cohort Retention Matrices, and RFM customer segmentation.
4. Build an interactive Streamlit/Power BI dashboard and deliver an executive decision memo to the CEO.

---

### 1. Capstone Enterprise Scenario: "Aura Global Retail"

You are the Principal Analytics Partner contracted by **Aura Global Retail**, an international multi-channel consumer brand generating \$150M annual revenue.
The company is preparing for an upcoming Board of Directors strategic review, but leadership faces critical challenges:
- High customer acquisition spend is generating diminishing returns.
- Customer retention differs wildly across international regions.
- Executives receive conflicting revenue reports from Sales, Marketing, and Accounting.

\`\`\`
   +-------------------------------------------------------------+
   |                AURA GLOBAL DATA ASSETS                      |
   +-------------------------------------------------------------+
   | 1. raw_orders.parquet        | 2.5 million order records    |
   | 2. raw_marketing_spend.csv   | Daily ad spend across Google,|
   |                              | Meta, TikTok, and Affiliates |
   | 3. raw_customer_support.json | Post-purchase tickets & NPS  |
   | 4. dim_regions.geojson       | Geographic trade territories |
   +-------------------------------------------------------------+
\`\`\`

---

### 2. Capstone Milestones

#### Milestone 1: Data Health & Reconciled Marts
- Execute an automated SQL Data Quality assertion audit (detecting nulls, duplicates, and pricing anomalies).
- Model a Kimball Star Schema: \`fact_sales\`, \`dim_customer\`, \`dim_product\`, \`dim_date\`.

#### Milestone 2: Cohort & Unit Economics Modeling
- Construct a 12-month cohort retention triangle matrix.
- Calculate NRR, CAC, and LTV/CAC ratios across marketing acquisition channels.
- Build an RFM behavioral segmentation model classifying customers into Champions, Loyal, At-Risk, and Hibernating.

#### Milestone 3: Executive Dashboard & Interactive Visuals
- Build an interactive Streamlit dashboard or Power BI report featuring KPI cards, revenue waterfall bridges, and geospatial Choropleth trade territory maps.

#### Milestone 4: The C-Suite Decision Memo
- Author an "Amazon-Style 1-Page Narrative Memo" in the SCR format outlining:
  - The root cause of Q3 margin compression.
  - Three concrete recommendations to reallocate \$2.5M in marketing budget.
  - Projected financial upside on next year's EBITDA.

---

### 3. Evaluation Criteria

| Evaluation Dimension | Weight | Success Criteria |
| :--- | :--- | :--- |
| **SQL & Modeling Precision** | 25% | Accurate, optimized SQL window functions, CTEs, and star schema architecture. |
| **Statistical Rigor** | 25% | Sound statistical calculations (p-values, retention modeling, IQR outlier handling). |
| **Visualization Clarity** | 25% | High data-to-ink ratio, purposeful color theory, and responsive interactive controls. |
| **Strategic Leadership** | 25% | Persuasive executive narrative translating analytical numbers into commercial strategy. |`
  },
  {
    id: "CH-DNA-030",
    courseId: "CRS-DNA-001",
    title: "Analytics Career Mastery: Case Interviews & Technical Live Coding",
    order: 30,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=wX0kY748p1k",
    content: `# Analytics Career Mastery: Case Interviews & Technical Live Coding

### Learning Objectives
1. Excel in Tier-1 Data Analyst & Analytics Engineering interview loops (FAANG, FinTech, Tech Startups).
2. Master live SQL whiteboard challenges: Window functions, self-joins, CTEs, and edge cases.
3. Tackle the "Product Analytics Case Study" interview (Root-causing metric drops).
4. Construct a standout public portfolio on GitHub and HuggingFace Spaces showcasing real-world business impact.

---

### 1. The Analytics Interview Process

Top tech organizations evaluate data analysts across four distinct stages:

\`\`\`
   [ STAGE 1: TECHNICAL SCREEN ]  --> Live SQL / Python live-coding challenge
                                      (Window functions, joins, data wrangling)
   [ STAGE 2: PRODUCT CASE STUDY] --> "Daily active users dropped 12% last week.
                                      How would you investigate?"
   [ STAGE 3: BUSINESS STRATEGY ] --> Executive communication, storytelling,
                                      trade-offs, stakeholder management
   [ STAGE 4: TAKE-HOME PROJECT ] --> End-to-end dataset analysis, dashboard,
                                      and executive decision memo
\`\`\`

---

### 2. Framework: The "Metric Drop" Investigation Challenge

When an interviewer asks: *"Uber ride completions dropped 8% week-over-week in London. What do you do?"*, follow this structured diagnostic protocol:

1. **Verify the Metric & Data Integrity**:
   - Is it a real drop or a data pipeline tracking bug? (Did a telemetry logging service crash? Did an ETL job fail?).
2. **Deconstruct Seasonality & External Shocks**:
   - Is it a national holiday? Extreme weather (snowstorm)? Public transit strike? Competitor promotion?
3. **Segment & Localize the Blast Radius**:
   - Is the drop concentrated on iOS or Android? (App release bug).
   - Is the drop on the Rider side (demand) or Driver side (supply)?
   - Is it localized to central London or airports?
4. **Trace the Conversion Funnel**:
   - App opens -> Search ride -> Request ride -> Driver matched -> Trip completed.
   - Where in the funnel did the drop occur?
5. **Formulate Hypotheses & Action Plan**:
   - Present data-backed root causes and recommendations to engineering and operations.

---

### 3. Your Career Progression as an Analytics Leader

\`\`\`
[ Junior Data Analyst ] --> [ Senior Analytics Engineer ] --> [ Lead Analytics Partner ]
           |
           +------------------> [ Head of BI & Analytics ] -> [ Chief Data Officer (CDO) ]
\`\`\`

- **Continuous Mastery**: Blend technical precision in SQL, Python, and dimensional modeling with commercial empathy and executive communication.
- **You are the Navigator**: In the modern enterprise, executives do not need more numbers; they need **clarity**, **insight**, and the **conviction** to make high-stakes decisions with confidence.`
  }
];

export const phase5Assessments = [
  {
    id: "ASM-DNA-025",
    courseId: "CRS-DNA-001",
    chapterId: "CH-DNA-025",
    title: "Assessment: The Modern Analytics Stack & dbt",
    passingScore: 70,
    questions: [
      {
        id: "Q-DNA-025-01",
        text: "What is the primary difference between legacy ETL and modern cloud ELT architectures?",
        options: [
          "In ELT, raw data is loaded directly into the cloud warehouse first and transformed using SQL inside the warehouse; in ETL, transformations occurred on external servers prior to loading",
          "ELT does not use databases",
          "ETL is only used in mobile applications",
          "There is no difference"
        ],
        correctAnswer: 0,
        explanation: "Modern ELT leverages the massive compute scale of cloud warehouses to transform data after loading."
      },
      {
        id: "Q-DNA-025-02",
        text: "What open-source transformation tool has become the industry standard for modeling SQL pipelines in the Modern Data Stack?",
        options: ["dbt (data build tool)", "Tableau", "Microsoft Excel", "Jira"],
        correctAnswer: 0,
        explanation: "dbt enables analysts to build modular, tested, version-controlled SQL transformation models."
      },
      {
        id: "Q-DNA-025-03",
        text: "In dbt, what function is used to reference other upstream models and automatically build the Directed Acyclic Graph (DAG)?",
        options: ["{{ ref('model_name') }}", "{{ join('model_name') }}", "{{ table('model_name') }}", "{{ link('model_name') }}"],
        correctAnswer: 0,
        explanation: "The 'ref()' macro resolves model dependencies and builds lineage DAGs automatically."
      },
      {
        id: "Q-DNA-025-04",
        text: "What is an 'Incremental Model' in dbt?",
        options: [
          "A model that transforms only new or modified source records since the last dbt execution rather than re-computing the entire table",
          "A model that adds 1 to every number",
          "A model that only runs on weekends",
          "A model that creates empty tables"
        ],
        correctAnswer: 0,
        explanation: "Incremental models process only new delta records, saving immense compute cost on multi-billion-row tables."
      },
      {
        id: "Q-DNA-025-05",
        text: "What templating engine is integrated into dbt to allow dynamic code generation, loops, and environment variables inside SQL?",
        options: ["Jinja", "Handlebars", "Blade", "EJS"],
        correctAnswer: 0,
        explanation: "dbt uses Jinja templating to enable dynamic macros, conditional logic, and looping in SQL."
      },
      {
        id: "Q-DNA-025-06",
        text: "What four generic out-of-the-box data tests are provided natively in dbt schema.yml configurations?",
        options: [
          "unique, not_null, accepted_values, and relationships",
          "fast, slow, high, and low",
          "select, insert, update, and delete",
          "red, green, blue, and yellow"
        ],
        correctAnswer: 0,
        explanation: "dbt ships with four core tests: unique, not_null, accepted_values, and referential integrity relationships."
      },
      {
        id: "Q-DNA-025-07",
        text: "What is a 'Directed Acyclic Graph' (DAG) in data pipeline orchestration?",
        options: [
          "A graph representing task dependencies flowing in one direction without circular loops",
          "A circular flow chart that loops indefinitely",
          "A graph with zero connections",
          "A pie chart"
        ],
        correctAnswer: 0,
        explanation: "A DAG defines dependency order between models without cycles, guaranteeing deterministic execution order."
      },
      {
        id: "Q-DNA-025-08",
        text: "What cloud platforms are categorized as modern columnar cloud data warehouses in the Modern Data Stack?",
        options: ["Snowflake, Google BigQuery, and Databricks SQL", "Microsoft Access and Lotus 1-2-3", "MongoDB only", "Redis Cache"],
        correctAnswer: 0,
        explanation: "Snowflake, BigQuery, and Databricks are the primary cloud data warehouse targets for modern analytics stacks."
      },
      {
        id: "Q-DNA-025-09",
        text: "What dbt command compiles models, executes transformations, and runs all configured data quality assertions in a single step?",
        options: ["dbt build", "dbt start", "dbt make", "dbt execute"],
        correctAnswer: 0,
        explanation: "'dbt build' runs models, tests, seeds, and snapshots in dependency order defined by the DAG."
      },
      {
        id: "Q-DNA-025-10",
        text: "What is a 'Marts' layer in modern analytics modeling?",
        options: [
          "The business-facing presentation layer containing Star Schema Fact and Dimension tables optimized for BI tools and end users",
          "A grocery store simulation",
          "The raw untransformed landing zone",
          "A temporary scratch directory"
        ],
        correctAnswer: 0,
        explanation: "Marts contain business-oriented, clean dimensional models ready for visual analytics consumption."
      }
    ]
  },
  {
    id: "ASM-DNA-026",
    courseId: "CRS-DNA-001",
    chapterId: "CH-DNA-026",
    title: "Assessment: Data Governance & Lineage",
    passingScore: 70,
    questions: [
      {
        id: "Q-DNA-026-01",
        text: "What is Data Lineage in enterprise data architecture?",
        options: [
          "The complete auditable historical path showing how data moves and transforms from operational source systems to downstream BI reports",
          "The family ancestry of the database developer",
          "The speed of network cables",
          "A list of software versions"
        ],
        correctAnswer: 0,
        explanation: "Lineage visualizes the provenance and transformation lifecycle of data across the enterprise."
      },
      {
        id: "Q-DNA-026-02",
        text: "What is an Impact Analysis performed with data lineage tools?",
        options: [
          "Evaluating which downstream models, dashboards, and ML features will break before modifying or dropping a source database column",
          "Testing how hard a server can be physically dropped",
          "Analyzing the financial stock market",
          "Measuring CPU fan speed"
        ],
        correctAnswer: 0,
        explanation: "Lineage-based impact analysis reveals downstream dependencies to prevent breaking production dashboards."
      },
      {
        id: "Q-DNA-026-03",
        text: "What is Dynamic Data Masking in modern cloud warehouses (like Snowflake)?",
        options: [
          "Altering sensitive PII strings (e.g. emails, SSNs) at query time based on user role permissions without modifying underlying data on disk",
          "Deleting data from the table",
          "Wearing a mask while programming",
          "Encrypting the computer monitor"
        ],
        correctAnswer: 0,
        explanation: "Dynamic masking obscures sensitive columns based on the querying user's authorization role."
      },
      {
        id: "Q-DNA-026-04",
        text: "What is an enterprise Data Catalog (e.g. DataHub, Amundsen, Alation)?",
        options: [
          "A searchable metadata inventory that organizes datasets, owners, schema definitions, documentation, and lineage graphs",
          "A paper catalog mailed to homes",
          "A retail store inventory system",
          "A list of computer passwords"
        ],
        correctAnswer: 0,
        explanation: "Data catalogs provide an indexed, searchable directory of enterprise data assets for discovery and governance."
      },
      {
        id: "Q-DNA-026-05",
        text: "What regulation grants European individuals the legal right to request complete deletion of their personal identifiable data?",
        options: ["GDPR (General Data Protection Regulation)", "HIPAA", "SOX", "PCI-DSS"],
        correctAnswer: 0,
        explanation: "GDPR Article 17 mandates the Right to Erasure (Right to be Forgotten) for personal data."
      },
      {
        id: "Q-DNA-026-06",
        text: "What does 'Data Stewardship' encompass in governance frameworks?",
        options: [
          "Assigning operational accountability to specific domain owners for maintaining data quality, definitions, and access rules",
          "Carrying computers to meetings",
          "Cleaning physical server racks",
          "Writing code without documentation"
        ],
        correctAnswer: 0,
        explanation: "Stewards are accountable for the accuracy, documentation, and regulatory compliance of their domain's data."
      },
      {
        id: "Q-DNA-026-07",
        text: "What is a 'Data Swamp'?",
        options: [
          "A data lake that lacks documentation, governance, metadata, or quality controls, making data unusable and untrusted",
          "A database server located in a wetland",
          "A computer filled with water",
          "A backup tape drive"
        ],
        correctAnswer: 0,
        explanation: "A data swamp is an unmanaged data repository where data is dumped without metadata or governance."
      },
      {
        id: "Q-DNA-026-08",
        text: "What is Tokenization in data security?",
        options: [
          "Replacing sensitive data elements with non-sensitive algorithmic surrogate tokens that map back to the original value via a secure token vault",
          "Paying employees in cryptocurrency",
          "Creating casino chips",
          "Buying bus tickets"
        ],
        correctAnswer: 0,
        explanation: "Tokenization substitutes sensitive values with non-reversible surrogate tokens to minimize breach exposure."
      },
      {
        id: "Q-DNA-026-09",
        text: "What does SOC 2 Type II compliance audit in enterprise SaaS data environments?",
        options: [
          "Security, Availability, Processing Integrity, Confidentiality, and Privacy controls over an extended evaluation period",
          "The speed of customer deliveries",
          "The company's marketing branding",
          "The price of product subscriptions"
        ],
        correctAnswer: 0,
        explanation: "SOC 2 Type II audits evaluate operational effectiveness of security and privacy controls over 6–12 months."
      },
      {
        id: "Q-DNA-026-10",
        text: "Why must automated lineage tools parse SQL dialect ASTs (Abstract Syntax Trees)?",
        options: [
          "To accurately understand column-level derivation dependencies through complex joins, window functions, and subqueries",
          "To translate SQL into English",
          "To check spelling mistakes in queries",
          "To format code"
        ],
        correctAnswer: 0,
        explanation: "AST parsing decodes fine-grained column transformations to construct accurate end-to-end lineage graphs."
      }
    ]
  },
  {
    id: "ASM-DNA-027",
    courseId: "CRS-DNA-001",
    chapterId: "CH-DNA-027",
    title: "Assessment: Automated Data Quality with Great Expectations",
    passingScore: 70,
    questions: [
      {
        id: "Q-DNA-027-01",
        text: "What is an 'Expectation' in the Great Expectations framework?",
        options: [
          "A declarative, programmatic assertion defining an expected characteristic of a dataset (e.g. expect_column_values_to_not_be_null)",
          "A feeling of hope about the future",
          "A project deadline set by management",
          "A database index"
        ],
        correctAnswer: 0,
        explanation: "Expectations are unit tests for data, asserting constraints on schemas, nullability, uniqueness, and distributions."
      },
      {
        id: "Q-DNA-027-02",
        text: "What is an 'Expectation Suite' in Great Expectations?",
        options: [
          "A cohesive collection of multiple expectations grouped together to validate a specific table or data asset",
          "A hotel room for data engineers",
          "A paid software license tier",
          "A Python virtual environment"
        ],
        correctAnswer: 0,
        explanation: "An Expectation Suite bundles multiple validation checks into a single reusable test package."
      },
      {
        id: "Q-DNA-027-03",
        text: "What does 'expect_column_values_to_be_in_set()' validate?",
        options: [
          "That all values in the column belong to an approved list of permitted categorical values (e.g. ['PENDING', 'SHIPPED', 'CANCELLED'])",
          "That the column contains numbers",
          "That the column is empty",
          "That the column has a primary key"
        ],
        correctAnswer: 0,
        explanation: "This expectation validates that all column values fall within an allowed set of discrete values."
      },
      {
        id: "Q-DNA-027-04",
        text: "What is a 'Checkpoint' in Great Expectations?",
        options: [
          "The primary operational feature that pairs an Expectation Suite with a Data Asset, runs validation, and triggers actions (alerts, reports)",
          "A physical security guard station",
          "A git commit point",
          "A database backup snapshot"
        ],
        correctAnswer: 0,
        explanation: "Checkpoints execute validation suites against batches of data and route pass/fail alert actions."
      },
      {
        id: "Q-DNA-027-05",
        text: "What are 'Data Docs' in Great Expectations?",
        options: [
          "Auto-generated HTML documentation dashboards that display validation results, passing percentages, and failed row values visually",
          "Doctor appointments for employees",
          "PDF user manuals",
          "Medical records in a hospital"
        ],
        correctAnswer: 0,
        explanation: "Data Docs translate expectations and validation runs into clean, interactive HTML reports for stakeholders."
      },
      {
        id: "Q-DNA-027-06",
        text: "How can Great Expectations prevent corrupt data from reaching production BI dashboards?",
        options: [
          "By configuring pipeline orchestration (Airflow/Prefect) to halt downstream execution if a Checkpoint validation fails",
          "By deleting the cloud warehouse",
          "By turning off the power to the server",
          "By hiding failing charts manually"
        ],
        correctAnswer: 0,
        explanation: "Placing Checkpoints before publishing steps stops data pipelines when quality thresholds are breached."
      },
      {
        id: "Q-DNA-027-07",
        text: "What expectation validates that order discount rates do not exceed a 40% threshold?",
        options: [
          "ExpectColumnValuesToBeBetween(column='discount', min_value=0.0, max_value=0.40)",
          "ExpectDiscountBelow(0.40)",
          "ExpectColumnMax(0.40)",
          "ExpectNumbersLessThan(0.40)"
        ],
        correctAnswer: 0,
        explanation: "'ExpectColumnValuesToBeBetween' enforces boundary ranges on continuous numerical features."
      },
      {
        id: "Q-DNA-027-08",
        text: "What backend data engines does Great Expectations support natively?",
        options: [
          "Pandas DataFrames, Spark DataFrames, and SQL databases (PostgreSQL, Snowflake, BigQuery, Redshift)",
          "Microsoft Word files only",
          "Audio MP3 files only",
          "Google Sheets only"
        ],
        correctAnswer: 0,
        explanation: "Great Expectations translates expectations into native execution queries across Pandas, Spark, and SQL engines."
      },
      {
        id: "Q-DNA-027-09",
        text: "What is an 'Action List' in a Great Expectations Checkpoint?",
        options: [
          "A sequence of automated tasks executed following validation (e.g. sending Slack notifications, updating Data Docs, storing results)",
          "A to-do list written on a whiteboard",
          "A list of employees to hire",
          "A list of database passwords"
        ],
        correctAnswer: 0,
        explanation: "Action Lists define automated follow-up steps triggered by validation outcomes (e.g. Slack alerts)."
      },
      {
        id: "Q-DNA-027-10",
        text: "What parameter allows an expectation to tolerate a small percentage of anomalous records (e.g. allow up to 1% nulls)?",
        options: ["mostly=0.99", "tolerance=0.01", "allow_errors=True", "threshold=0.99"],
        correctAnswer: 0,
        explanation: "The 'mostly' parameter specifies the minimum success fraction required for the expectation to pass (e.g. mostly=0.99)."
      }
    ]
  },
  {
    id: "ASM-DNA-028",
    courseId: "CRS-DNA-001",
    chapterId: "CH-DNA-028",
    title: "Assessment: Churn Prediction & Survival Analysis",
    passingScore: 70,
    questions: [
      {
        id: "Q-DNA-028-01",
        text: "What is 'Right-Censored Data' in customer lifetime analysis?",
        options: [
          "Active customers whose ultimate churn event has not occurred by the end of the study period, meaning their total duration is only partially observed",
          "Data that was deleted from the right side of a table",
          "Data from conservative political organizations",
          "Corrupted text files"
        ],
        correctAnswer: 0,
        explanation: "Right-censoring occurs when an observation ends while the subject is still active, without experiencing the event."
      },
      {
        id: "Q-DNA-028-02",
        text: "What non-parametric statistical estimator is widely used in survival analysis to estimate customer retention curves over time?",
        options: ["Kaplan-Meier Estimator", "Ordinary Least Squares", "K-Means", "Naive Bayes"],
        correctAnswer: 0,
        explanation: "The Kaplan-Meier estimator calculates the empirical survival function from time-to-event censored datasets."
      },
      {
        id: "Q-DNA-028-03",
        text: "What regression model evaluates how multiple continuous and categorical covariates affect the baseline hazard rate of customer churn?",
        options: ["Cox Proportional Hazards Model", "Simple Linear Regression", "Polynomial Regression", "K-Nearest Neighbors"],
        correctAnswer: 0,
        explanation: "Cox Proportional Hazards models how risk factors multiply the baseline hazard over time."
      },
      {
        id: "Q-DNA-028-04",
        text: "What does a Hazard Ratio (HR) of 1.35 indicate for a risk covariate (e.g. customer submitted an escalated support ticket)?",
        options: [
          "Customers with that covariate have a 35% higher instantaneous risk of churn at any point in time compared to the baseline group",
          "The customer will churn in exactly 1.35 days",
          "The customer's subscription price is $1.35",
          "There is no effect"
        ],
        correctAnswer: 0,
        explanation: "Hazard Ratios > 1.0 indicate elevated risk; HR=1.35 corresponds to a 35% higher instantaneous rate of churning."
      },
      {
        id: "Q-DNA-028-05",
        text: "What does the Survival Function S(t) represent mathematically?",
        options: [
          "The probability that a customer remains active (has not churned) past time t: P(T > t)",
          "The total revenue of the company",
          "The speed of server response times",
          "The probability of acquiring a new customer"
        ],
        correctAnswer: 0,
        explanation: "S(t) represents the probability that the event of interest has not occurred prior to time t."
      },
      {
        id: "Q-DNA-028-06",
        text: "What popular open-source Python library provides Kaplan-Meier and Cox Proportional Hazards modeling?",
        options: ["lifelines", "seaborn", "flask", "pylint"],
        correctAnswer: 0,
        explanation: "'lifelines' is the premier Python library for survival analysis and time-to-event modeling."
      },
      {
        id: "Q-DNA-028-07",
        text: "What is the Median Survival Time on a Kaplan-Meier curve?",
        options: [
          "The point in time t at which the survival probability S(t) drops to exactly 0.50 (50% of the cohort has churned)",
          "The average age of all users",
          "The middle day of the year",
          "The median order price"
        ],
        correctAnswer: 0,
        explanation: "Median survival time marks the milestone where 50% of the starting cohort has experienced the event."
      },
      {
        id: "Q-DNA-028-08",
        text: "Why does treating active, non-churned subscribers as 'Class 0 (Non-Churned)' in traditional logistic regression introduce severe bias?",
        options: [
          "It ignores customer tenure; a subscriber who joined yesterday is treated identically to a loyal 10-year subscriber",
          "Logistic regression is not supported in Python",
          "Subscribers cannot be represented in binary numbers",
          "There is zero bias"
        ],
        correctAnswer: 0,
        explanation: "Binary classification ignores exposure time, conflating newly-acquired users with established loyal subscribers."
      },
      {
        id: "Q-DNA-028-09",
        text: "What does a Hazard Ratio of less than 1.0 (e.g. HR = 0.60) signify?",
        options: [
          "The covariate is a protective factor: it reduces the instantaneous risk of churn by 40%",
          "The covariate accelerates customer churn",
          "The model has failed",
          "All customers will cancel"
        ],
        correctAnswer: 0,
        explanation: "HR < 1.0 denotes a protective variable (e.g. annual contract adoption) that dampens churn risk."
      },
      {
        id: "Q-DNA-028-10",
        text: "What statistical hypothesis test compares whether two empirical Kaplan-Meier survival curves are statistically significantly different?",
        options: ["Log-Rank Test", "Two-Sample t-test", "Paired Z-test", "Pearson Correlation"],
        correctAnswer: 0,
        explanation: "The Log-Rank test compares survival distributions across independent groups over time."
      }
    ]
  },
  {
    id: "ASM-DNA-029",
    courseId: "CRS-DNA-001",
    chapterId: "CH-DNA-029",
    title: "Assessment: Enterprise Analytics Capstone Audit",
    passingScore: 70,
    questions: [
      {
        id: "Q-DNA-029-01",
        text: "In the Aura Global Retail capstone scenario, what initial step must the analytics team execute prior to building executive dashboards?",
        options: [
          "An automated Data Quality sanity audit to detect anomalies, missing keys, duplicate orders, and negative amounts in raw source tables",
          "Design marketing logos in Canva",
          "Re-price all retail products",
          "Deploy the website to production"
        ],
        correctAnswer: 0,
        explanation: "Data quality validation ensures foundational tables are clean and verified before modeling and visualization."
      },
      {
        id: "Q-DNA-029-02",
        text: "What dimensional model is architected in the capstone to support scalable BI reporting across international markets?",
        options: [
          "A Kimball Star Schema with central fact_sales connected to dim_customer, dim_product, dim_region, and dim_date",
          "A single giant flat table with 250 unindexed columns",
          "An unstructured collection of JSON documents with no schema",
          "A relational model with zero primary keys"
        ],
        correctAnswer: 0,
        explanation: "Star schemas optimize analytical query performance, simplify joins, and integrate seamlessly with BI engines."
      },
      {
        id: "Q-DNA-029-03",
        text: "In the capstone cohort analysis, what critical insight does the 12-month retention triangle matrix reveal?",
        options: [
          "Whether newer customer acquisition cohorts are retaining better or worse than older cohorts at equivalent monthly milestones",
          "The names of underperforming developers",
          "The electricity consumption of cloud servers",
          "The average speed of delivery trucks"
        ],
        correctAnswer: 0,
        explanation: "Cohort triangles track retention decay curves across successive monthly cohorts to evaluate product health."
      },
      {
        id: "Q-DNA-029-04",
        text: "What RFM customer segment in the capstone represents high-priority targets for personalized account-manager outreach?",
        options: [
          "At Risk (high historical spend and frequency, but low recency)",
          "Hibernating (score 111)",
          "Promising newcomers who bought once",
          "Anonymous web visitors"
        ],
        correctAnswer: 0,
        explanation: "At-Risk accounts contributed significant historical revenue and warrant high-touch intervention before permanent churn."
      },
      {
        id: "Q-DNA-029-05",
        text: "What chart type in the executive capstone dashboard reconciles Budget EBITDA to Actual EBITDA by isolating price and volume drivers?",
        options: ["Waterfall Bridge Chart", "Pie Chart", "Radar Chart", "Bubble Chart"],
        correctAnswer: 0,
        explanation: "Waterfall bridges visually display positive and negative variances driving operational profit changes."
      },
      {
        id: "Q-DNA-029-06",
        text: "What is the recommended format for the capstone's C-suite strategic communication deliverable?",
        options: [
          "A concise Amazon-style narrative decision memo using the SCR framework with executive recommendations upfront",
          "A 150-slide PowerPoint deck with tiny bullet points",
          "A raw SQL query script sent via email",
          "A spreadsheet containing 500,000 unformatted rows"
        ],
        correctAnswer: 0,
        explanation: "Concise narrative memos lead with data-backed recommendations and strategic rationale, respecting executive time."
      },
      {
        id: "Q-DNA-029-07",
        text: "How does the capstone framework handle dynamic customer regional access in the BI dashboard?",
        options: [
          "By implementing dynamic Row-Level Security (RLS) mapped to user identities (e.g. USERPRINCIPALNAME())",
          "By creating 50 separate copies of the dashboard for each manager",
          "By asking managers to close their eyes when other regions appear",
          "By removing regional data from the company"
        ],
        correctAnswer: 0,
        explanation: "Dynamic RLS enforces data governance in a single dashboard model based on authenticated user credentials."
      },
      {
        id: "Q-DNA-029-08",
        text: "What geospatial visualization in the capstone illustrates sales territory coverage and identifies underperforming market cold spots?",
        options: ["Choropleth map with territory boundary polygons", "Network topology diagram", "Box plot", "Treemap"],
        correctAnswer: 0,
        explanation: "Choropleth maps shade sales territories to reveal geographic distribution and market penetration gaps."
      },
      {
        id: "Q-DNA-029-09",
        text: "In the unit economics audit, what indicates that Aura Global Retail is over-relying on saturated marketing ad channels?",
        options: [
          "Customer Acquisition Cost (CAC) surging while Payback Period extends beyond 18 months and LTV/CAC drops below 1.5",
          "Gross margin increasing to 95%",
          "Customer reviews being overwhelmingly positive",
          "Organic website traffic tripling"
        ],
        correctAnswer: 0,
        explanation: "Rising CAC, extended payback duration, and deteriorating LTV/CAC ratios signal ad network saturation."
      },
      {
        id: "Q-DNA-029-10",
        text: "What does the 'Resolution' section of the capstone executive memo recommend regarding the marketing budget?",
        options: [
          "Reallocating budget from high-CAC saturated paid channels into high-retention customer referral programs and loyalty perks",
          "Shutting down the company website permanently",
          "Tripling ad spend on failing channels",
          "Firing all customer support representatives"
        ],
        correctAnswer: 0,
        explanation: "Data-driven strategy reallocates capital to high-ROI, high-retention channels to restore unit economics."
      }
    ]
  },
  {
    id: "ASM-DNA-030",
    courseId: "CRS-DNA-001",
    chapterId: "CH-DNA-030",
    title: "Assessment: Analytics Career Mastery & Case Interviews",
    passingScore: 70,
    questions: [
      {
        id: "Q-DNA-030-01",
        text: "In a product analytics case interview question ('Daily active users dropped 10% last week'), what should be your immediate first step?",
        options: [
          "Verify data tracking and pipeline integrity to confirm whether the drop is real or an artifact of broken logging/ETL pipelines",
          "Immediately announce that the company is failing",
          "Demand that developers rewrite the application in Go",
          "Guess that competitors launched a marketing campaign"
        ],
        correctAnswer: 0,
        explanation: "Always verify data integrity first: apparent metric shifts are frequently tracking or ingestion bugs."
      },
      {
        id: "Q-DNA-030-02",
        text: "When live-coding in a technical SQL interview, what advanced clause should you instinctively consider when asked to find the 'Top N records per category'?",
        options: [
          "A Window Function using DENSE_RANK() or ROW_NUMBER() with PARTITION BY",
          "A CROSS JOIN with 10 tables",
          "A manual cursor loop in PL/SQL",
          "A SELECT * with no filters"
        ],
        correctAnswer: 0,
        explanation: "Window functions with 'PARTITION BY' and 'DENSE_RANK() <= N' are the standard solution for top-N group queries."
      },
      {
        id: "Q-DNA-030-03",
        text: "What distinguishes a Senior Analytics Engineer / Lead Analyst from a Junior Analyst in case study interviews?",
        options: [
          "Senior analysts connect metrics directly to business models, profitability, customer psychology, and executive decisions rather than just reciting SQL syntax",
          "Senior analysts only write code in assembly language",
          "Senior analysts refuse to use BI tools",
          "Senior analysts work without datasets"
        ],
        correctAnswer: 0,
        explanation: "Senior analysts display commercial empathy, framing analytical findings in terms of business impact and strategy."
      },
      {
        id: "Q-DNA-030-04",
        text: "What is an effective strategy for structuring an open-source data analytics portfolio on GitHub to impress hiring managers?",
        options: [
          "End-to-end projects featuring clean dbt/SQL models, reproducible Python notebooks, interactive web apps (Streamlit), and executive memos",
          "Forking 200 random repositories without writing any code",
          "Uploading unformatted raw CSV files with zero documentation",
          "Uploading proprietary confidential data from previous employers"
        ],
        correctAnswer: 0,
        explanation: "Hiring managers look for end-to-end execution: business context, clean code, interactive visual prototypes, and memos."
      },
      {
        id: "Q-DNA-030-05",
        text: "What metric decomposition step should be taken when analyzing an unexpected drop in e-commerce revenue?",
        options: [
          "Decompose revenue into Traffic * Conversion Rate * Average Order Value to isolate which specific sub-driver failed",
          "Check the color of the office walls",
          "Email all customers demanding they spend money",
          "Delete the orders table"
        ],
        correctAnswer: 0,
        explanation: "Deconstructing revenue into its core drivers (Traffic x CR x AOV) isolates the exact point of failure."
      },
      {
        id: "Q-DNA-030-06",
        text: "What is a 'Take-Home Analytics Project' typically evaluating during hiring evaluations?",
        options: [
          "Your ability to clean messy real-world data, choose appropriate modeling techniques, synthesize business insights, and present recommendations clearly",
          "How fast you can type on a keyboard",
          "Your ability to copy code from StackOverflow without reading it",
          "How many hours you can stay awake"
        ],
        correctAnswer: 0,
        explanation: "Take-homes evaluate end-to-end data craftsmanship, business reasoning, and communication clarity."
      },
      {
        id: "Q-DNA-030-07",
        text: "How should an analyst handle missing or ambiguous requirements in an interview prompt?",
        options: [
          "Proactively ask clarifying questions, state reasonable business assumptions explicitly, and validate alignment with the interviewer",
          "Guess silently and never explain assumptions",
          "Refuse to answer until given a 50-page specification document",
          "Walk out of the interview"
        ],
        correctAnswer: 0,
        explanation: "Clarifying ambiguity demonstrates structured communication and collaborative problem-solving."
      },
      {
        id: "Q-DNA-030-08",
        text: "What is the primary role of a Head of Business Intelligence / Analytics Director?",
        options: [
          "Establishing institutional data governance, empowering self-service reporting, standardizing the semantic layer, and guiding C-suite strategy",
          "Fixing employee printer drivers",
          "Writing all 10,000 SQL queries personally",
          "Preventing employees from accessing data"
        ],
        correctAnswer: 0,
        explanation: "Analytics leadership scales data capabilities across people, architecture, governance, and business alignment."
      },
      {
        id: "Q-DNA-030-09",
        text: "In SQL, what function resolves string matching when searching for usernames regardless of uppercase or lowercase variations?",
        options: ["LOWER(username) = LOWER('target') or ILIKE in PostgreSQL", "UPPER() only", "STR_MATCH()", "EQUALS()"],
        correctAnswer: 0,
        explanation: "'LOWER()' or 'ILIKE' provides case-insensitive matching across database engines."
      },
      {
        id: "Q-DNA-030-10",
        text: "What mindset defines an elite data analytics professional?",
        options: [
          "Viewing data as an instrument for decision enablement, relentlessly pursuing truth, and translating complexity into actionable clarity",
          "Generating as many charts as possible to look busy",
          "Hiding unexpected data anomalies to avoid difficult questions",
          "Prioritizing complex algorithms over business utility"
        ],
        correctAnswer: 0,
        explanation: "Elite analytics professionals empower strategic conviction through rigorous truth, clarity, and business empathy."
      }
    ]
  }
];

export const phase5 = {
  chapters: phase5Chapters,
  assessments: phase5Assessments
};

