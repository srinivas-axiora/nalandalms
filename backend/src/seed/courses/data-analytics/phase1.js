export const phase1Chapters = [
  {
    id: "CH-DNA-001",
    courseId: "CRS-DNA-001",
    title: "The Data Analytics Lifecycle & Dimensional Modeling",
    order: 1,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=k423X7jK5yI",
    content: `# The Data Analytics Lifecycle & Dimensional Modeling

### Learning Objectives
1. Map the end-to-end Data Analytics Lifecycle: Problem Definition, Data Ingestion, Cleaning, Exploration, Modeling, and Executive Communication.
2. Differentiate Descriptive, Diagnostic, Predictive, and Prescriptive analytics.
3. Master Ralph Kimball's Dimensional Modeling: Fact Tables vs. Dimension Tables.
4. Compare Star Schema vs. Snowflake Schema design for analytical data warehouses (OLAP).

---

### 1. The Four Tiers of Analytics

Data analytics transforms raw institutional data into actionable decisions across four evolutionary stages:

\`\`\`
   Value / Impact
        ^
        |                                                 [ PRESCRIPTIVE ]
        |                                           "How can we make it happen?"
        |                                           (Optimization, Simulation)
        |
        |                                   [ PREDICTIVE ]
        |                             "What will happen next?"
        |                             (Forecasting, ML Models)
        |
        |                     [ DIAGNOSTIC ]
        |               "Why did it happen?"
        |               (Root Cause, Drill-Downs)
        |
        |         [ DESCRIPTIVE ]
        |   "What happened?"
        |   (KPI Dashboards, Reports)
        |
        +-------------------------------------------------------------> Difficulty
\`\`\`

---

### 2. OLTP vs. OLAP Architecture

| Dimension | OLTP (Online Transaction Processing) | OLAP (Online Analytical Processing) |
| :--- | :--- | :--- |
| **Primary Goal** | Fast, reliable execution of concurrent transactions (CRUD). | High-speed analytical queries aggregating millions of records. |
| **Data Schema** | Highly normalized (3NF / Boyce-Codd) to eliminate redundancy. | Denormalized dimensional models (Star & Snowflake schemas). |
| **Query Pattern** | Simple, fast lookups: \`SELECT ... WHERE id = ?\` | Heavy aggregations: \`GROUP BY\`, \`SUM\`, \`AVG\`, \`WINDOW\` functions. |
| **Underlying Tech**| PostgreSQL, MySQL, SQL Server, Oracle. | Snowflake, BigQuery, Amazon Redshift, ClickHouse, DuckDB. |

---

### 3. Dimensional Modeling: Facts & Dimensions

In Ralph Kimball's analytical modeling philosophy, business processes are modeled around **Facts** and **Dimensions**:

\`\`\`
                         +-----------------------+
                         |     dim_customer      |
                         +-----------------------+
                         | customer_key (PK)     |
                         | email, region, tier   |
                         +-----------+-----------+
                                     |
                                     | 1
                                     |
                                     v *
   +--------------------+  *   +-----------------------+   *   +--------------------+
   |     dim_date       |<-----+       fact_sales      |------>|    dim_product     |
   +--------------------+      +-----------------------+       +--------------------+
   | date_key (PK)      |      | sale_id (PK)          |       | product_key (PK)   |
   | full_date, month   |      | date_key (FK)         |       | name, category     |
   | quarter, year      |      | customer_key (FK)     |       | unit_cost, brand   |
   +--------------------+      | product_key (FK)      |       +--------------------+
                               | quantity_sold         |
                               | gross_revenue         |
                               | discount_amount       |
                               +-----------------------+
\`\`\`

#### Key Concepts:
- **Fact Tables**: Contain quantitative measurements, numerical metrics, and foreign keys (e.g. \`fact_orders\`, \`fact_transactions\`). Usually append-only and contain millions to billions of rows.
- **Dimension Tables**: Contain contextual, descriptive attributes that provide filters and grouping contexts (e.g. \`dim_customer\`, \`dim_product\`, \`dim_time\`).
- **Star Schema**: Dimensions link directly to the central Fact table with zero sub-normalization. Optimal for query performance and BI tool joining.
- **Snowflake Schema**: Dimensions are partially normalized into secondary hierarchy tables (e.g. \`dim_product\` joins to \`dim_subcategory\` which joins to \`dim_category\`). Reduces storage redundancy at the cost of complex query joins.

---

### 4. Hands-on Lab: Dimensional Model Design
1. Analyze a simulated ride-sharing application (Uber / Lyft).
2. Identify the central business event: \`fact_rides\`.
3. Design Fact metrics: ride duration, distance, base fare, surge multiplier, driver payout, tip.
4. Design Dimensions: \`dim_driver\`, \`dim_rider\`, \`dim_location\` (pickup/dropoff coordinates), \`dim_date_time\`.`
  },
  {
    id: "CH-DNA-002",
    courseId: "CRS-DNA-001",
    title: "Advanced SQL: Window Functions & Analytical Partitioning",
    order: 2,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=VywxIQ2ZXw4",
    content: `# Advanced SQL: Window Functions & Analytical Partitioning

### Learning Objectives
1. Understand SQL Window Functions and how they differ from standard \`GROUP BY\` aggregations.
2. Master the \`OVER(PARTITION BY ... ORDER BY ...)\` clause.
3. Apply ranking functions: \`ROW_NUMBER()\`, \`RANK()\`, and \`DENSE_RANK()\`.
4. Perform time-series shifts and offsets using \`LAG()\` and \`LEAD()\`.
5. Compute cumulative totals, rolling moving averages, and running balances.

---

### 1. Window Functions vs. GROUP BY

While \`GROUP BY\` collapses rows into a single summary record, **Window Functions** compute calculations across a set of rows while preserving individual row identities:

\`\`\`
   GROUP BY (Collapses Rows):
   Row 1: Dept A | $1000 \
   Row 2: Dept A | $2000  --> Collapsed into: Dept A | Total: $6000
   Row 3: Dept A | $3000 /

   WINDOW FUNCTION (Preserves All Rows):
   Row 1: Dept A | $1000 | Dept Total: $6000 | Dept Rank: 1
   Row 2: Dept A | $2000 | Dept Total: $6000 | Dept Rank: 2
   Row 3: Dept A | $3000 | Dept Total: $6000 | Dept Rank: 3
\`\`\`

---

### 2. ROW_NUMBER vs. RANK vs. DENSE_RANK

Understanding tie-breaking behavior is vital for reporting top-N queries:

| Value | \`ROW_NUMBER()\` | \`RANK()\` | \`DENSE_RANK()\` | Explanation |
| :--- | :--- | :--- | :--- | :--- |
| **\$500** | 1 | 1 | 1 | Highest earner |
| **\$400** | 2 | 2 | 2 | Tied for 2nd |
| **\$400** | 3 | 2 | 2 | Tied for 2nd |
| **\$300** | 4 | **4** (Skips 3!) | **3** (No gaps!) | Next rank |

\`\`\`sql
-- Fetch Top 3 highest revenue products per category
WITH ranked_products AS (
    SELECT 
        category,
        product_name,
        revenue,
        DENSE_RANK() OVER (
            PARTITION BY category 
            ORDER BY revenue DESC
        ) AS rank_in_cat
    FROM sales
)
SELECT * 
FROM ranked_products 
WHERE rank_in_cat <= 3;
\`\`\`

---

### 3. Time-Series Shifts: LAG and LEAD

\`LAG()\` accesses data from preceding rows; \`LEAD()\` accesses data from following rows without self-joins:

\`\`\`sql
-- Calculate Month-over-Month (MoM) Growth Rate
WITH monthly_revenue AS (
    SELECT 
        DATE_TRUNC('month', order_date) AS order_month,
        SUM(amount) AS total_revenue
    FROM orders
    GROUP BY 1
)
SELECT 
    order_month,
    total_revenue,
    LAG(total_revenue, 1) OVER (ORDER BY order_month) AS prev_month_revenue,
    ROUND(
        (total_revenue - LAG(total_revenue, 1) OVER (ORDER BY order_month)) 
        / LAG(total_revenue, 1) OVER (ORDER BY order_month) * 100.0, 
        2
    ) AS mom_growth_pct
FROM monthly_revenue;
\`\`\`

---

### 4. Running Totals & Moving Averages

\`\`\`sql
-- Calculate a 7-day Moving Average of Daily Active Users (DAU)
SELECT 
    activity_date,
    active_users,
    AVG(active_users) OVER (
        ORDER BY activity_date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS dau_7day_moving_avg
FROM daily_metrics;
\`\`\`

---

### 5. Hands-on Lab: Top Performers & MoM Analysis
1. Query a sales transaction dataset.
2. Calculate the running cumulative revenue throughout the fiscal year.
3. Compute the percentage difference in daily sales compared to the previous day using \`LAG()\`.`
  },
  {
    id: "CH-DNA-003",
    courseId: "CRS-DNA-001",
    title: "Complex SQL Joins, CTEs & Recursive Query Modeling",
    order: 3,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=F3zWw4Zp8sM",
    content: `# Complex SQL Joins, CTEs & Recursive Query Modeling

### Learning Objectives
1. Master advanced relational joins: Self Joins, Cross Joins, and Non-Equi Joins.
2. Structure complex analytical pipelines with Common Table Expressions (CTEs) vs. subqueries.
3. Model hierarchical tree structures using Recursive CTEs (Organization charts, product category taxonomies).
4. Utilize \`COALESCE\`, \`NULLIF\`, and \`CASE WHEN\` for defensive data transformation.

---

### 1. Non-Equi Joins & Cross Joins in Analytics

While standard joins use equality (\`ON a.id = b.id\`), analytical queries frequently require non-equi joins to map continuous ranges:

\`\`\`sql
-- Map customer order amounts to tiered loyalty discount brackets
SELECT 
    o.order_id,
    o.customer_id,
    o.order_amount,
    t.tier_name,
    t.discount_pct
FROM orders o
JOIN loyalty_tiers t 
  ON o.order_amount >= t.min_spend 
 AND o.order_amount <  t.max_spend;
\`\`\`

#### Cross Joins for Complete Date Dimension Densification:
When dates have zero sales, a standard \`GROUP BY date\` will omit missing days. A \`CROSS JOIN\` against a master date calendar fills all gaps with \$0.00:

\`\`\`sql
-- Generate every combination of Store and Calendar Date
SELECT s.store_id, d.calendar_date, COALESCE(SUM(o.revenue), 0) AS daily_rev
FROM dim_stores s
CROSS JOIN dim_calendar d
LEFT JOIN fact_orders o 
  ON s.store_id = o.store_id 
 AND d.calendar_date = o.order_date
GROUP BY s.store_id, d.calendar_date;
\`\`\`

---

### 2. Common Table Expressions (CTEs)

CTEs (\`WITH cte_name AS (...)\`) transform unreadable, nested subqueries into sequential, testable pipelines:

\`\`\`sql
WITH active_customers AS (
    SELECT customer_id, MAX(order_date) AS last_order
    FROM orders
    GROUP BY customer_id
    HAVING MAX(order_date) >= CURRENT_DATE - INTERVAL '90 days'
),
customer_spend AS (
    SELECT o.customer_id, SUM(o.amount) AS total_ltd_spend
    FROM orders o
    JOIN active_customers c ON o.customer_id = c.customer_id
    GROUP BY o.customer_id
)
SELECT 
    CASE 
        WHEN total_ltd_spend > 5000 THEN 'VIP'
        WHEN total_ltd_spend > 1000 THEN 'Regular'
        ELSE 'Casual'
    END AS customer_segment,
    COUNT(*) AS total_customers,
    ROUND(AVG(total_ltd_spend), 2) AS avg_spend
FROM customer_spend
GROUP BY 1;
\`\`\`

---

### 3. Recursive CTEs: Hierarchies & Trees

Recursive CTEs solve graph and hierarchy traversal (e.g. employee reporting structures):

\`\`\`sql
WITH RECURSIVE org_hierarchy AS (
    -- Anchor Member: Root CEO (manager_id is NULL)
    SELECT employee_id, name, manager_id, 1 AS level, CAST(name AS VARCHAR(255)) AS path
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    -- Recursive Member: Join subordinates to their managers
    SELECT e.employee_id, e.name, e.manager_id, o.level + 1, CAST(o.path || ' -> ' || e.name AS VARCHAR(255))
    FROM employees e
    JOIN org_hierarchy o ON e.manager_id = o.employee_id
)
SELECT level, employee_id, name, path
FROM org_hierarchy
ORDER BY level, path;
\`\`\`

---

### 4. Hands-on Lab: Organizational Hierarchy Audit
1. Query a simulated company database containing employees and managers.
2. Build a recursive CTE calculating management depth and reporting chains.
3. Compute the total count of direct and indirect reports for every director.`
  },
  {
    id: "CH-DNA-004",
    courseId: "CRS-DNA-001",
    title: "Cohort Analysis, Retention & Customer Churn Modeling in SQL",
    order: 4,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=0h3jO5BhnqE",
    content: `# Cohort Analysis, Retention & Customer Churn Modeling in SQL

### Learning Objectives
1. Define user cohorts based on acquisition timestamps, behavioral actions, and demographics.
2. Build a triangular Cohort Retention Matrix in pure SQL.
3. Calculate Rolling Churn, Monthly Active Users (MAU), and Customer Retention Rate (CRR).
4. Perform Customer Lifetime Value (LTV) and Repeat Purchase calculations.

---

### 1. The Power of Cohort Analysis

Looking at aggregate active users masks underlying retention decay. If 1,000 new users sign up but 1,000 old users churn, overall traffic looks flat while the product is secretly failing.

\`\`\`
   COHORT RETENTION HEATMAP:
   +-------------------------------------------------------------+
   | Cohort   | Size  | Month 0 | Month 1 | Month 2 | Month 3   |
   +----------+-------+---------+---------+---------+-----------+
   | Jan 2026 | 1,000 |  100%   |   45%   |   32%   |   28%     |
   | Feb 2026 | 1,200 |  100%   |   48%   |   36%   |    -      |
   | Mar 2026 | 1,500 |  100%   |   52%   |    -    |    -      |
   | Apr 2026 | 1,800 |  100%   |    -    |    -    |    -      |
   +-------------------------------------------------------------+
\`\`\`

---

### 2. Building a Cohort Matrix in Pure SQL

A complete production query in PostgreSQL / Snowflake calculating cohort retention:

\`\`\`sql
-- Step 1: Find the first acquisition month for each user
WITH user_first_month AS (
    SELECT 
        user_id,
        DATE_TRUNC('month', MIN(order_date)) AS cohort_month
    FROM orders
    GROUP BY user_id
),
-- Step 2: Track activity months relative to cohort month
user_activity AS (
    SELECT 
        o.user_id,
        f.cohort_month,
        DATE_TRUNC('month', o.order_date) AS activity_month,
        -- Calculate month offset: (Year diff * 12) + Month diff
        (EXTRACT(YEAR FROM o.order_date) - EXTRACT(YEAR FROM f.cohort_month)) * 12 +
        (EXTRACT(MONTH FROM o.order_date) - EXTRACT(MONTH FROM f.cohort_month)) AS month_number
    FROM orders o
    JOIN user_first_month f ON o.user_id = f.user_id
    GROUP BY 1, 2, 3, 4
),
-- Step 3: Count total users acquired in each cohort
cohort_sizes AS (
    SELECT cohort_month, COUNT(DISTINCT user_id) AS total_users
    FROM user_first_month
    GROUP BY 1
)
-- Step 4: Calculate retention percentage per cohort per month
SELECT 
    a.cohort_month,
    s.total_users,
    a.month_number,
    COUNT(DISTINCT a.user_id) AS active_users,
    ROUND(COUNT(DISTINCT a.user_id) * 100.0 / s.total_users, 2) AS retention_pct
FROM user_activity a
JOIN cohort_sizes s ON a.cohort_month = s.cohort_month
GROUP BY a.cohort_month, s.total_users, a.month_number
ORDER BY a.cohort_month, a.month_number;
\`\`\`

---

### 3. Customer Churn & Retention Formulas

$$\\text{Customer Retention Rate (CRR)} = \\frac{E - N}{S} \\times 100$$

Where:
- $E$ = Number of customers at the end of the period.
- $N$ = Number of new customers acquired during the period.
- $S$ = Number of customers at the start of the period.

$$\\text{Churn Rate} = 100 - \\text{CRR} = \\frac{\\text{Lost Customers}}{\\text{Customers at Start}} \\times 100$$

---

### 4. Hands-on Lab: SaaS Subscription Cohorts
1. Analyze a subscription log table with subscription start and cancellation dates.
2. Build a monthly retention matrix for a 12-month period.
3. Identify which customer acquisition cohort had the steepest Month-1 drop-off.`
  },
  {
    id: "CH-DNA-005",
    courseId: "CRS-DNA-001",
    title: "SQL Query Performance Tuning & Execution Plans",
    order: 5,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=FqSPh_x2Yt4",
    content: `# SQL Query Performance Tuning & Execution Plans

### Learning Objectives
1. Read and analyze database execution plans using \`EXPLAIN\` and \`EXPLAIN ANALYZE\`.
2. Differentiate Sequential Scans vs. Index Scans, Index Only Scans, and Bitmap Scans.
3. Understand join algorithms: Nested Loop, Hash Join, and Merge Join.
4. Optimize analytical queries by eliminating sargability violations, table bloat, and redundant CTE scans.

---

### 1. Reading an Execution Plan

When an analytical query takes 45 seconds instead of 200ms, SDETs and Analytics Engineers inspect the query execution plan generated by the database cost-based optimizer:

\`\`\`sql
EXPLAIN ANALYZE
SELECT customer_id, SUM(amount)
FROM orders
WHERE order_date >= '2026-01-01'
GROUP BY customer_id;
\`\`\`

#### Sample Execution Plan Tree:
\`\`\`
HashAggregate  (cost=1420.50..1440.50 rows=2000 width=40) (actual time=12.4..14.1 rows=1840 loops=1)
  Group Key: customer_id
  ->  Bitmap Heap Scan on orders  (cost=42.10..1350.20 rows=14000 width=16) (actual time=2.1..8.5 rows=14210 loops=1)
        Recheck Cond: (order_date >= '2026-01-01'::date)
        ->  Bitmap Index Scan on idx_orders_date  (cost=0.00..38.60 rows=14000 width=0) (actual time=1.8..1.8 rows=14210 loops=1)
Planning Time: 0.184 ms
Execution Time: 14.821 ms
\`\`\`

---

### 2. Scan Types Decoded

- **Sequential Scan (Seq Scan)**: Reads every page of the table from disk. Acceptable when reading >20% of the table; catastrophic for single-record lookups on a 50-million-row table.
- **Index Scan**: Traverses B-Tree index to locate row pointers (TIDs), then fetches matching data pages from the heap.
- **Index Only Scan**: All requested columns reside directly in the index itself (Covering Index). Zero heap page accesses required (fastest possible read!).
- **Bitmap Heap Scan**: Collects row locations into a memory bitmap first, sorts them by physical disk location, and reads heap pages sequentially.

---

### 3. Join Algorithms in Analytical Engines

| Join Method | Ideal Scenario | How It Operates |
| :--- | :--- | :--- |
| **Nested Loop** | One small table (<100 rows) joining a large indexed table. | Outer loop scans table A; inner loop executes index lookup on table B per row. |
| **Hash Join** | Joining two medium-to-large unindexed datasets on equality. | Builds in-memory hash table of smaller table; scans larger table to probe matches. |
| **Merge Join** | Both datasets are already sorted by the join key. | Scans both sorted lists simultaneously in a single linear pass (extremely efficient). |

---

### 4. Sargability (Search Argument Able)

A query is **non-sargable** when wrapping a column in a function prevents the database from using its B-Tree index:

\`\`\`sql
-- ❌ NON-SARGABLE (Forces full table scan on 10 million rows!)
SELECT * FROM orders WHERE EXTRACT(YEAR FROM order_date) = 2026;

-- ✅ SARGABLE (Uses B-Tree index on order_date directly!)
SELECT * FROM orders WHERE order_date >= '2026-01-01' AND order_date < '2027-01-01';

-- ❌ NON-SARGABLE (Leading wildcard prevents index traversal)
SELECT * FROM users WHERE email LIKE '%@nalanda.org';

-- ✅ SARGABLE (Prefix search uses B-Tree index)
SELECT * FROM users WHERE email LIKE 'admin%';
\`\`\`

---

### 5. Hands-on Lab: Query Optimization Challenge
1. Inspect an un-indexed query running against a 1-million-row table in 4,200ms.
2. Generate the \`EXPLAIN ANALYZE\` plan and identify the Sequential Scan bottleneck.
3. Design a composite covering B-Tree index and achieve sub-15ms execution time.`
  },
  {
    id: "CH-DNA-006",
    courseId: "CRS-DNA-001",
    title: "Data Quality, Anomaly Detection & Sanity Audits in SQL",
    order: 6,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=5x2bK3L_1U0",
    content: `# Data Quality, Anomaly Detection & Sanity Audits in SQL

### Learning Objectives
1. Implement automated Data Quality (DQ) validation suites using pure SQL assertions.
2. Test the 6 Dimensions of Data Quality: Accuracy, Completeness, Consistency, Timeliness, Validity, and Uniqueness.
3. Detect statistical outliers and transaction anomalies using Z-scores and Interquartile Range (IQR) in SQL.
4. Establish automated data health check alerts before feeding downstream BI dashboards.

---

### 1. The 6 Dimensions of Data Quality

Garbage In, Garbage Out (GIGO): BI dashboards and machine learning models are only as good as the underlying data integrity.

\`\`\`
   +-------------------------------------------------------------+
   |              THE 6 DATA QUALITY DIMENSIONS                  |
   +-------------------------------------------------------------+
   | 1. Completeness  | Are mandatory fields non-null?           |
   | 2. Uniqueness    | Are primary keys free of duplicates?     |
   | 3. Validity      | Do values conform to formats (emails)?   |
   | 4. Consistency   | Do numbers match across relational keys? |
   | 5. Timeliness    | Is the data fresh or stale?              |
   | 6. Accuracy      | Does data reflect real-world truth?      |
   +-------------------------------------------------------------+
\`\`\`

---

### 2. Automated SQL Quality Assertion Suite

\`\`\`sql
-- Data Quality Health Check Script
WITH dq_checks AS (
    -- Check 1: Completeness - Null customer IDs in orders
    SELECT 'Orders Missing Customer ID' AS check_name, COUNT(*) AS failure_count
    FROM orders WHERE customer_id IS NULL

    UNION ALL

    -- Check 2: Uniqueness - Duplicate active subscription records
    SELECT 'Duplicate Active Subscriptions', COUNT(*) - COUNT(DISTINCT user_id)
    FROM subscriptions WHERE status = 'ACTIVE'

    UNION ALL

    -- Check 3: Validity - Impossible future dates
    SELECT 'Future Order Dates', COUNT(*)
    FROM orders WHERE order_date > CURRENT_TIMESTAMP

    UNION ALL

    -- Check 4: Validity - Negative order amounts
    SELECT 'Negative Order Amounts', COUNT(*)
    FROM orders WHERE amount < 0

    UNION ALL

    -- Check 5: Consistency - Orphaned order items
    SELECT 'Orphan Order Items', COUNT(*)
    FROM order_items i
    LEFT JOIN orders o ON i.order_id = o.order_id
    WHERE o.order_id IS NULL
)
SELECT * 
FROM dq_checks 
WHERE failure_count > 0; -- Alert if ANY check fails!
\`\`\`

---

### 3. Outlier & Anomaly Detection via SQL Z-Score

Detecting fraudulent credit card charges or telemetry spikes directly in SQL:

$$Z = \\frac{X - \\mu}{\\sigma}$$

Any transaction with $|Z| > 3$ is a statistical anomaly (3 standard deviations from the mean):

\`\`\`sql
WITH stats AS (
    SELECT 
        AVG(amount) AS mean_amount,
        STDDEV(amount) AS stddev_amount
    FROM transactions
)
SELECT 
    t.transaction_id,
    t.user_id,
    t.amount,
    ROUND((t.amount - s.mean_amount) / s.stddev_amount, 2) AS z_score
FROM transactions t
CROSS JOIN stats s
WHERE ABS((t.amount - s.mean_amount) / s.stddev_amount) > 3.0
ORDER BY z_score DESC;
\`\`\`

---

### 4. Hands-on Lab: Data Health Pipeline
1. Construct an automated SQL sanity script covering all 6 data quality dimensions.
2. Run against an e-commerce database with injected corruption (nulls, duplicates, future dates).
3. Generate an executive data health score (Pass/Fail) based on assertion violation counts.`
  }
];

export const phase1Assessments = [
  {
    id: "ASM-DNA-001",
    courseId: "CRS-DNA-001",
    chapterId: "CH-DNA-001",
    title: "Assessment: Data Analytics Lifecycle & Dimensional Modeling",
    passingScore: 70,
    questions: [
      {
        id: "Q-DNA-001-01",
        text: "In the analytics maturity model, which tier of analytics answers the question 'Why did it happen?' using root cause analysis and drill-downs?",
        options: ["Descriptive Analytics", "Diagnostic Analytics", "Predictive Analytics", "Prescriptive Analytics"],
        correctAnswer: 1,
        explanation: "Diagnostic analytics explores underlying drivers and root causes to explain why past events occurred."
      },
      {
        id: "Q-DNA-001-02",
        text: "What is the primary architectural purpose of a Fact Table in Ralph Kimball's dimensional modeling?",
        options: [
          "Storing quantitative numerical measurements and foreign keys representing business process events (e.g. sales, rides)",
          "Storing employee names and phone numbers only",
          "Storing configuration files for the database",
          "Translating SQL into HTML"
        ],
        correctAnswer: 0,
        explanation: "Fact tables contain numeric metrics (revenue, quantity) and foreign keys connecting to dimension tables."
      },
      {
        id: "Q-DNA-001-03",
        text: "How does an OLAP analytical data warehouse differ from an OLTP transactional database?",
        options: [
          "OLAP is denormalized and optimized for high-speed complex aggregation queries; OLTP is normalized for high-concurrency transactional writes",
          "OLAP does not use SQL",
          "OLTP can only run on mobile phones",
          "OLAP stores only text files"
        ],
        correctAnswer: 0,
        explanation: "OLAP optimizes for heavy aggregations and reporting; OLTP optimizes for fast, concurrent atomic transactions."
      },
      {
        id: "Q-DNA-001-04",
        text: "What characterizes a Star Schema in dimensional data modeling?",
        options: [
          "A central Fact table surrounded by denormalized Dimension tables that link directly to the fact with zero sub-normalization",
          "All tables have exactly 5 columns",
          "Tables are arranged in a circle without any primary keys",
          "A schema with no fact tables"
        ],
        correctAnswer: 0,
        explanation: "Star schemas feature a central fact table surrounded by denormalized dimension tables, resembling a star."
      },
      {
        id: "Q-DNA-001-05",
        text: "How does a Snowflake Schema differ from a Star Schema?",
        options: [
          "Dimension tables in a Snowflake schema are normalized into secondary lookup hierarchy tables, reducing storage redundancy",
          "Snowflake schema is only used during winter months",
          "Snowflake schema has zero dimensions",
          "Snowflake schema is 100x slower on all databases"
        ],
        correctAnswer: 0,
        explanation: "Snowflake schemas normalize dimension tables into hierarchical sub-dimensions to eliminate repeated text attributes."
      },
      {
        id: "Q-DNA-001-06",
        text: "Which of the following is an example of a Dimension Table attribute in an e-commerce data warehouse?",
        options: [
          "Customer Region, Product Category, or Store Name",
          "Order Revenue in dollars",
          "Quantity of items purchased",
          "Total discount amount"
        ],
        correctAnswer: 0,
        explanation: "Dimensions provide context and descriptive filters (Customer Region, Product Category) for slicing facts."
      },
      {
        id: "Q-DNA-001-07",
        text: "What cloud database platforms are purpose-built for high-speed analytical OLAP workloads?",
        options: ["Snowflake, Google BigQuery, and Amazon Redshift", "SQLite and Microsoft Access", "Redis and Memcached", "MySQL 5.1 only"],
        correctAnswer: 0,
        explanation: "Snowflake, BigQuery, and Redshift are modern columnar cloud data warehouses engineered for analytical OLAP queries."
      },
      {
        id: "Q-DNA-001-08",
        text: "What is a 'Surrogate Key' in dimensional modeling?",
        options: [
          "An artificially generated sequential integer or UUID primary key assigned to dimension records, independent of source system natural keys",
          "The user's real-world social security number",
          "A foreign key that is always left null",
          "A database password"
        ],
        correctAnswer: 0,
        explanation: "Surrogate keys insulate the data warehouse from changes or recycling of natural keys in source transactional systems."
      },
      {
        id: "Q-DNA-001-09",
        text: "In the analytics lifecycle, what phase immediately precedes building executive visualization dashboards?",
        options: ["Exploratory Data Analysis (EDA) and Analytical Modeling", "Buying a larger monitor", "Sending an invoice to the client", "Shutting down the server"],
        correctAnswer: 0,
        explanation: "Data ingestion, cleaning, and exploratory modeling establish clean, validated metrics before dashboard visualization."
      },
      {
        id: "Q-DNA-001-10",
        text: "What does 'Grain' refer to in dimensional modeling?",
        options: [
          "The exact level of detail or atomic business transaction represented by a single row in the Fact table",
          "The speed of the computer processor",
          "The size of the CSV file on disk",
          "The number of database administrators"
        ],
        correctAnswer: 0,
        explanation: "The grain defines what individual rows represent (e.g. one row per order line item vs. one row per order)."
      }
    ]
  },
  {
    id: "ASM-DNA-002",
    courseId: "CRS-DNA-001",
    chapterId: "CH-DNA-002",
    title: "Assessment: Window Functions & Analytical Partitioning",
    passingScore: 70,
    questions: [
      {
        id: "Q-DNA-002-01",
        text: "How do SQL Window Functions fundamentally differ from 'GROUP BY' aggregations?",
        options: [
          "Window functions compute aggregations across a partition of rows while preserving individual row records rather than collapsing them",
          "Window functions cannot calculate averages or sums",
          "Window functions only work in mobile apps",
          "Window functions require an internet connection"
        ],
        correctAnswer: 0,
        explanation: "Window functions retain the full detail of individual rows while appending calculated analytical window values."
      },
      {
        id: "Q-DNA-002-02",
        text: "If three employees tie for 2nd place in salary, what rank values does 'DENSE_RANK()' assign to the tied employees and the next employee?",
        options: [
          "Tied employees receive 2, 2, 2; next employee receives 3 (no rank gaps)",
          "Tied employees receive 2, 2, 2; next employee receives 5 (skips ranks)",
          "All employees receive 1",
          "An error is thrown"
        ],
        correctAnswer: 0,
        explanation: "DENSE_RANK assigns identical ranks to ties without skipping subsequent ranks (1, 2, 2, 3)."
      },
      {
        id: "Q-DNA-002-03",
        text: "How does 'RANK()' handle ties compared to 'DENSE_RANK()'?",
        options: [
          "RANK() leaves gaps in the sequence following ties (e.g. 1, 2, 2, 4); DENSE_RANK() leaves no gaps (1, 2, 2, 3)",
          "RANK() breaks ties randomly",
          "RANK() only works on string columns",
          "There is no difference"
        ],
        correctAnswer: 0,
        explanation: "RANK skips subsequent ranks equal to the number of tied positions, whereas DENSE_RANK remains continuous."
      },
      {
        id: "Q-DNA-002-04",
        text: "Which window function retrieves values from a previous row in the ordered partition without performing a self-join?",
        options: ["LAG()", "LEAD()", "FIRST_VALUE()", "PRIOR()"],
        correctAnswer: 0,
        explanation: "'LAG(column, offset)' accesses data from preceding rows in the window partition."
      },
      {
        id: "Q-DNA-002-05",
        text: "Which window function accesses data from subsequent (following) rows in the partition?",
        options: ["LEAD()", "LAG()", "NEXT()", "FORWARD()"],
        correctAnswer: 0,
        explanation: "'LEAD(column, offset)' accesses values from succeeding rows in the window."
      },
      {
        id: "Q-DNA-002-06",
        text: "What clause inside 'OVER()' divides rows into distinct groups where the window calculation resets for each group?",
        options: ["PARTITION BY", "GROUP BY", "SPLIT BY", "SECTION BY"],
        correctAnswer: 0,
        explanation: "'PARTITION BY' divides the dataset into logical partitions where calculations operate independently."
      },
      {
        id: "Q-DNA-002-07",
        text: "How do you calculate a running cumulative total of daily revenue using a window function?",
        options: [
          "SUM(amount) OVER (ORDER BY order_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)",
          "SUM(amount) GROUP BY order_date",
          "TOTAL(amount) OVER ALL",
          "ACCUMULATE(amount)"
        ],
        correctAnswer: 0,
        explanation: "'SUM() OVER (ORDER BY ... ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)' accumulates revenue sequentially."
      },
      {
        id: "Q-DNA-002-08",
        text: "What is 'ROW_NUMBER()' guaranteed to return for every row within a partition, regardless of duplicate or tied values?",
        options: [
          "A unique, strictly sequential integer starting at 1 with zero ties and zero gaps",
          "Random floating point numbers",
          "The same number for all rows",
          "Null"
        ],
        correctAnswer: 0,
        explanation: "ROW_NUMBER always produces a strictly unique sequence (1, 2, 3, 4...) even when order values are tied."
      },
      {
        id: "Q-DNA-002-09",
        text: "How is a 7-day rolling moving average specified in a window frame clause?",
        options: [
          "ROWS BETWEEN 6 PRECEDING AND CURRENT ROW",
          "ROWS 7",
          "RANGE 7 DAYS",
          "LIMIT 7"
        ],
        correctAnswer: 0,
        explanation: "'ROWS BETWEEN 6 PRECEDING AND CURRENT ROW' aggregates exactly 7 rows (the current day plus prior 6 days)."
      },
      {
        id: "Q-DNA-002-10",
        text: "Can Window Functions be placed directly inside a SQL 'WHERE' clause?",
        options: [
          "No, because WHERE filters execute before window functions; you must wrap the query in a CTE or subquery first",
          "Yes, window functions can be used anywhere in a query",
          "Only in PostgreSQL",
          "Only on weekends"
        ],
        correctAnswer: 0,
        explanation: "SQL evaluation order executes WHERE prior to WINDOW calculations; filtering on window results requires a CTE/subquery."
      }
    ]
  },
  {
    id: "ASM-DNA-003",
    courseId: "CRS-DNA-001",
    chapterId: "CH-DNA-003",
    title: "Assessment: Complex Joins, CTEs & Recursive Queries",
    passingScore: 70,
    questions: [
      {
        id: "Q-DNA-003-01",
        text: "What is a Common Table Expression (CTE) in SQL?",
        options: [
          "A named temporary result set defined with the 'WITH' keyword that exists only for the duration of the query",
          "A permanent database table created on disk",
          "A user account role",
          "A network connection string"
        ],
        correctAnswer: 0,
        explanation: "CTEs provide modular, readable named temporary query blocks that simplify complex multi-step transformations."
      },
      {
        id: "Q-DNA-003-02",
        text: "What type of join produces a Cartesian product (every row of Table A paired with every row of Table B)?",
        options: ["CROSS JOIN", "INNER JOIN", "LEFT JOIN", "FULL OUTER JOIN"],
        correctAnswer: 0,
        explanation: "A CROSS JOIN combines every row from the first table with every row from the second table (M x N rows)."
      },
      {
        id: "Q-DNA-003-03",
        text: "Why are CROSS JOINs frequently used with Calendar tables in time-series data analysis?",
        options: [
          "To generate all possible combinations of dimensions (e.g. Store x Date) so days with zero sales are not dropped from reporting",
          "To delete old dates from the database",
          "To speed up hard drives",
          "To translate dates into Roman numerals"
        ],
        correctAnswer: 0,
        explanation: "Cross-joining calendar dates with dimension entities densifies datasets, ensuring zero-activity days appear in charts."
      },
      {
        id: "Q-DNA-003-04",
        text: "What two members comprise a Recursive CTE in SQL?",
        options: [
          "The Anchor Member (base query) and the Recursive Member joined with UNION ALL",
          "The Primary Key and Foreign Key",
          "The Header and Footer",
          "The Try block and Catch block"
        ],
        correctAnswer: 0,
        explanation: "Recursive CTEs combine a non-recursive Anchor query with a Recursive query that repeatedly joins back to the CTE."
      },
      {
        id: "Q-DNA-003-05",
        text: "What SQL function returns the first non-null value among its arguments, commonly used to replace nulls with zeros?",
        options: ["COALESCE()", "NULLIF()", "ISNULL()", "NVL2()"],
        correctAnswer: 0,
        explanation: "'COALESCE(val1, val2, ...)' evaluates arguments in order and returns the first non-null expression."
      },
      {
        id: "Q-DNA-003-06",
        text: "What does the 'NULLIF(a, b)' function return if argument 'a' is equal to argument 'b'?",
        options: ["NULL (useful for preventing division by zero: amount / NULLIF(qty, 0))", "0", "1", "An error"],
        correctAnswer: 0,
        explanation: "'NULLIF(a, b)' returns NULL if both arguments are equal, protecting calculations from divide-by-zero crashes."
      },
      {
        id: "Q-DNA-003-07",
        text: "What is a 'Self Join' in relational SQL?",
        options: [
          "Joining a table to itself, typically to model hierarchical relationships like employee-to-manager or predecessor orders",
          "Joining two identical database servers",
          "A join executed by a single user",
          "A query with no WHERE clause"
        ],
        correctAnswer: 0,
        explanation: "Self-joins join a table against an aliased instance of itself to evaluate relational dependencies within the same table."
      },
      {
        id: "Q-DNA-003-08",
        text: "What is a 'Non-Equi Join'?",
        options: [
          "A join condition that utilizes operators other than equality (e.g. >=, <=, BETWEEN, <, >)",
          "A join between two different database brands",
          "A join that produces an error",
          "A join with unequal numbers of columns"
        ],
        correctAnswer: 0,
        explanation: "Non-equi joins use comparison inequalities, such as matching timestamps to active validity date ranges."
      },
      {
        id: "Q-DNA-003-09",
        text: "In Recursive CTEs, what safeguard terminates execution if an infinite circular loop occurs?",
        options: [
          "A recursion depth limit (e.g. MAXRECURSION in SQL Server or cycle detection in PostgreSQL)",
          "The computer battery dying",
          "Deleting the database",
          "The server overheating"
        ],
        correctAnswer: 0,
        explanation: "Recursion depth limits prevent infinite loops when cyclical data graphs exist."
      },
      {
        id: "Q-DNA-003-10",
        text: "Why are CTEs generally preferred over deeply nested subqueries in enterprise analytics codebases?",
        options: [
          "CTEs read sequentially top-to-bottom, enhancing readability, modular maintenance, and enabling query component reuse",
          "CTEs are required by law",
          "CTEs run in external web browsers",
          "Subqueries are deprecated in SQL"
        ],
        correctAnswer: 0,
        explanation: "CTEs structure complex analytical queries into clean, sequential, maintainable logic pipelines."
      }
    ]
  },
  {
    id: "ASM-DNA-004",
    courseId: "CRS-DNA-001",
    chapterId: "CH-DNA-004",
    title: "Assessment: Cohort Analysis & Retention Modeling",
    passingScore: 70,
    questions: [
      {
        id: "Q-DNA-004-01",
        text: "What is a 'Cohort' in customer and behavioral data analytics?",
        options: [
          "A group of users who share a common characteristic or experienced a common event within a defined time period (e.g. signed up in Jan 2026)",
          "A software development team",
          "A single customer account",
          "A physical database server"
        ],
        correctAnswer: 0,
        explanation: "A cohort is a segmented cohort of individuals bound by a shared timestamped event or attribute."
      },
      {
        id: "Q-DNA-004-02",
        text: "Why does relying solely on aggregate Daily Active Users (DAU) or Monthly Active Users (MAU) conceal underlying business problems?",
        options: [
          "High top-of-funnel acquisition can temporarily mask high churn rates, making a product look growing while retaining zero long-term users",
          "Because MAU is calculated in minutes",
          "Because active users don't spend money",
          "Because DAU is always inaccurate"
        ],
        correctAnswer: 0,
        explanation: "Aggregate user numbers mask high churn if new user sign-ups happen to offset churning existing users."
      },
      {
        id: "Q-DNA-004-03",
        text: "What visual pattern does a classic Cohort Retention Matrix form in business intelligence reports?",
        options: [
          "A triangle (or heat-mapped retention curve) where newer cohorts have fewer subsequent months of historical data",
          "A circle",
          "A single straight vertical line",
          "A pyramid with no data"
        ],
        correctAnswer: 0,
        explanation: "Retention matrices form triangles because older cohorts have more historical months elapsed than newer cohorts."
      },
      {
        id: "Q-DNA-004-04",
        text: "In SQL, how is the 'cohort_month' typically established for a customer in an e-commerce database?",
        options: [
          "DATE_TRUNC('month', MIN(order_date)) GROUP BY user_id",
          "CURRENT_DATE",
          "MAX(order_date)",
          "DATE_ADD(order_date, 30)"
        ],
        correctAnswer: 0,
        explanation: "The minimum (earliest) order date truncated to the month establishes the user's acquisition cohort."
      },
      {
        id: "Q-DNA-004-05",
        text: "How is Customer Retention Rate (CRR) calculated over a defined business period?",
        options: [
          "((End Customers - New Customers Acquired) / Start Customers) * 100",
          "(Total Revenue / Total Users) * 100",
          "(Lost Customers / New Customers) * 100",
          "Total Signups / Total Visits"
        ],
        correctAnswer: 0,
        explanation: "CRR isolates existing retained users by subtracting new signups from the end balance, divided by starting users."
      },
      {
        id: "Q-DNA-004-06",
        text: "If a SaaS company starts the month with 1,000 customers, loses 50 customers, and acquires 200 new customers, what is the Churn Rate for that month?",
        options: ["5% (50 / 1000)", "20%", "15%", "50%"],
        correctAnswer: 0,
        explanation: "Churn Rate = Lost Customers (50) / Starting Customers (1,000) * 100 = 5.0%."
      },
      {
        id: "Q-DNA-004-07",
        text: "What does 'Month 0' retention percentage represent in a standard cohort retention table?",
        options: [
          "100%: All users in that cohort were active during their initial acquisition period",
          "0%: No users have purchased yet",
          "50%",
          "Undefined"
        ],
        correctAnswer: 0,
        explanation: "Month 0 represents the baseline acquisition milestone where 100% of the cohort members were active."
      },
      {
        id: "Q-DNA-004-08",
        text: "What SQL date function in PostgreSQL/Snowflake truncates timestamps to the first day of their respective month?",
        options: ["DATE_TRUNC('month', timestamp)", "TRUNC_MONTH(timestamp)", "MONTH(timestamp)", "ROUND_DATE(timestamp)"],
        correctAnswer: 0,
        explanation: "'DATE_TRUNC('month', date)' rounds timestamps down to the first day of the month at 00:00:00."
      },
      {
        id: "Q-DNA-004-09",
        text: "What is Customer Lifetime Value (LTV)?",
        options: [
          "The total net monetary value a customer is projected to generate for a business over the entire duration of their relationship",
          "The age of the oldest customer",
          "The speed of order delivery",
          "The customer's credit score"
        ],
        correctAnswer: 0,
        explanation: "LTV calculates total projected net revenue contributed by a customer across their entire operational relationship."
      },
      {
        id: "Q-DNA-004-10",
        text: "What does a 'flattening' retention curve indicate about a digital product?",
        options: [
          "The product has achieved Product-Market Fit (PMF) because a core cohort of users continues using the product indefinitely",
          "All users have abandoned the product",
          "The website has crashed",
          "The database is full"
        ],
        correctAnswer: 0,
        explanation: "A retention curve that asymptotes and flattens horizontally proves that a baseline of loyal users remains retained over time."
      }
    ]
  },
  {
    id: "ASM-DNA-005",
    courseId: "CRS-DNA-001",
    chapterId: "CH-DNA-005",
    title: "Assessment: Query Performance Tuning & Execution Plans",
    passingScore: 70,
    questions: [
      {
        id: "Q-DNA-005-01",
        text: "What SQL command outputs the estimated execution cost and the actual measured runtimes and row counts of a query?",
        options: ["EXPLAIN ANALYZE", "SHOW PLAN", "DEBUG QUERY", "PROFILE ALL"],
        correctAnswer: 0,
        explanation: "'EXPLAIN ANALYZE' executes the query and returns real runtime performance statistics alongside cost estimates."
      },
      {
        id: "Q-DNA-005-02",
        text: "What is an Index Only Scan in relational databases?",
        options: [
          "An ultra-fast scan where all requested columns reside in the index itself (Covering Index), avoiding any disk access to table heap pages",
          "A scan that only looks at table indexes and prints an error",
          "A scan that deletes all indexes",
          "A slow scan that reads every page on disk"
        ],
        correctAnswer: 0,
        explanation: "Index Only Scans satisfy queries entirely from the index leaf nodes, eliminating expensive heap fetches."
      },
      {
        id: "Q-DNA-005-03",
        text: "Why is 'WHERE EXTRACT(YEAR FROM created_at) = 2026' considered non-sargable?",
        options: [
          "Wrapping the column in a function prevents the database optimizer from using a standard B-Tree index on 'created_at', forcing a full table scan",
          "Because 2026 is in the future",
          "Because EXTRACT is not supported in SQL",
          "Because dates cannot be indexed"
        ],
        correctAnswer: 0,
        explanation: "Applying functions to indexed columns prevents B-Tree traversal, degrading lookups to full sequential scans."
      },
      {
        id: "Q-DNA-005-04",
        text: "How should the non-sargable query 'WHERE EXTRACT(YEAR FROM created_at) = 2026' be refactored for index optimization?",
        options: [
          "WHERE created_at >= '2026-01-01' AND created_at < '2027-01-01'",
          "WHERE YEAR(created_at) = 2026",
          "WHERE created_at LIKE '2026%'",
          "WHERE created_at::text = '2026'"
        ],
        correctAnswer: 0,
        explanation: "Direct range comparisons against raw column values are sargable and execute fast B-Tree range scans."
      },
      {
        id: "Q-DNA-005-05",
        text: "When does the database optimizer choose a Hash Join over a Nested Loop join?",
        options: [
          "When joining two medium-to-large unindexed tables on equality conditions",
          "When joining two 5-row tables",
          "When joining on an inequality like > or <",
          "Hash joins are never used by databases"
        ],
        correctAnswer: 0,
        explanation: "Hash joins build an in-memory hash table of the smaller dataset to efficiently match records from larger tables."
      },
      {
        id: "Q-DNA-005-06",
        text: "What join algorithm is optimal when both joining datasets are already sorted by the join key?",
        options: ["Merge Join", "Nested Loop", "Cross Join", "Cartesian Join"],
        correctAnswer: 0,
        explanation: "Merge Join performs a single synchronized linear pass over both sorted inputs with minimal memory overhead."
      },
      {
        id: "Q-DNA-005-07",
        text: "What does a Sequential Scan (Seq Scan) do?",
        options: [
          "Scans every physical block and page of the table sequentially from start to finish",
          "Searches using an index",
          "Runs tests in parallel",
          "Sorts the table in alphabetical order"
        ],
        correctAnswer: 0,
        explanation: "Sequential scans inspect all pages of a table, which is expensive for large tables when filtering small subsets."
      },
      {
        id: "Q-DNA-005-08",
        text: "Why does a leading wildcard query like 'WHERE username LIKE '%smith'' prevent index utilization?",
        options: [
          "B-Trees are sorted from left to right; a leading wildcard prevents the engine from locating the starting branch in the tree",
          "Because percent signs crash databases",
          "Because smith is a common name",
          "Wildcards are prohibited in SQL"
        ],
        correctAnswer: 0,
        explanation: "B-Tree indexes sort strings from first character to last; leading wildcards eliminate index entry points."
      },
      {
        id: "Q-DNA-005-09",
        text: "What does the 'cost' metric in an execution plan represent (e.g. cost=0.00..42.50)?",
        options: [
          "Arbitrary computational work units estimated by the optimizer based on disk page I/O fetches and CPU operations",
          "The dollar cost in cloud billing",
          "The execution time in seconds",
          "The RAM usage in megabytes"
        ],
        correctAnswer: 0,
        explanation: "Cost estimates computational complexity based on sequential vs random I/O page fetches and CPU evaluations."
      },
      {
        id: "Q-DNA-005-10",
        text: "What database maintenance command updates table statistics so the query planner generates optimal execution plans?",
        options: ["ANALYZE (or VACUUM ANALYZE)", "UPDATE ALL", "REPAIR INDEX", "FLUSH CACHE"],
        correctAnswer: 0,
        explanation: "'ANALYZE' gathers statistical distributions of table column values to guide cost-based optimizer decisions."
      }
    ]
  },
  {
    id: "ASM-DNA-006",
    courseId: "CRS-DNA-001",
    chapterId: "CH-DNA-006",
    title: "Assessment: Data Quality & Anomaly Detection in SQL",
    passingScore: 70,
    questions: [
      {
        id: "Q-DNA-006-01",
        text: "What are the six foundational dimensions of Data Quality?",
        options: [
          "Accuracy, Completeness, Consistency, Timeliness, Validity, and Uniqueness",
          "Speed, Storage, Color, Font, Size, and Weight",
          "CPU, Memory, Network, Disk, Power, and Cooling",
          "Select, Insert, Update, Delete, Drop, and Alter"
        ],
        correctAnswer: 0,
        explanation: "The six universally recognized data quality dimensions ensure datasets are fit for analytical consumption."
      },
      {
        id: "Q-DNA-006-02",
        text: "What data quality dimension is violated when an order record has a NULL customer_id in a mandatory foreign key column?",
        options: ["Completeness", "Timeliness", "Accuracy", "Scalability"],
        correctAnswer: 0,
        explanation: "Completeness measures whether all required data fields contain populated, non-null values."
      },
      {
        id: "Q-DNA-006-03",
        text: "In statistical anomaly detection, what is a Z-score?",
        options: [
          "The number of standard deviations a given data point lies above or below the mean: (X - mean) / stddev",
          "The price of the product multiplied by tax",
          "The total number of rows in the table",
          "A database primary key"
        ],
        correctAnswer: 0,
        explanation: "Z-scores quantify how many standard deviations an observation deviates from the population mean."
      },
      {
        id: "Q-DNA-006-04",
        text: "Under standard normal distribution assumptions, an observation with a Z-score greater than 3.0 (|Z| > 3) is classified as what?",
        options: [
          "A statistical outlier / anomaly (representing less than 0.3% of normal distribution occurrences)",
          "An average data point",
          "A missing null value",
          "A primary key collision"
        ],
        correctAnswer: 0,
        explanation: "Observations beyond 3 standard deviations occur <0.3% of the time, signaling probable anomalies or fraud."
      },
      {
        id: "Q-DNA-006-05",
        text: "What SQL condition checks for primary key uniqueness violations in a user table?",
        options: [
          "SELECT id, COUNT(*) FROM users GROUP BY id HAVING COUNT(*) > 1;",
          "SELECT id FROM users WHERE id IS UNIQUE;",
          "SELECT DISTINCT * FROM users;",
          "SELECT COUNT(id) FROM users;"
        ],
        correctAnswer: 0,
        explanation: "'GROUP BY id HAVING COUNT(*) > 1' identifies IDs that appear more than once in the table."
      },
      {
        id: "Q-DNA-006-06",
        text: "What data quality dimension is violated when an application records customer birthdates in the year 2099?",
        options: ["Validity / Accuracy", "Completeness", "Uniqueness", "Portability"],
        correctAnswer: 0,
        explanation: "Future birthdates violate business rules and physical domain validity."
      },
      {
        id: "Q-DNA-006-07",
        text: "What is an 'Orphan Record' in relational databases?",
        options: [
          "A record in a child table whose foreign key references a parent primary key that does not exist",
          "A record created on a weekend",
          "A table with zero columns",
          "A query that returns zero rows"
        ],
        correctAnswer: 0,
        explanation: "Orphans occur when child records lose their parent references, violating referential consistency."
      },
      {
        id: "Q-DNA-006-08",
        text: "What open-source Python/SQL framework allows defining automated data contracts and pipeline tests like 'expect_column_values_to_not_be_null'?",
        options: ["Great Expectations", "Selenium", "Postman", "JUnit"],
        correctAnswer: 0,
        explanation: "Great Expectations is the leading industry framework for continuous data quality validation."
      },
      {
        id: "Q-DNA-006-09",
        text: "How can SQL detect negative price anomalies in an e-commerce catalog?",
        options: [
          "SELECT * FROM products WHERE price < 0.00;",
          "SELECT price FROM products GROUP BY price;",
          "SELECT COUNT(price) FROM products;",
          "Negative prices are impossible in SQL"
        ],
        correctAnswer: 0,
        explanation: "Checking 'WHERE price < 0' identifies invalid negative inventory prices."
      },
      {
        id: "Q-DNA-006-10",
        text: "What is 'Data Freshness' (or Timeliness) in analytics engineering?",
        options: [
          "The degree to which data accurately reflects the current state of the business within expected latency SLAs",
          "The date when the database server was purchased",
          "How frequently developers commit code",
          "The age of the oldest customer"
        ],
        correctAnswer: 0,
        explanation: "Timeliness measures how recently data was ingested compared to expected refresh SLAs."
      }
    ]
  }
];

export const phase1 = {
  chapters: phase1Chapters,
  assessments: phase1Assessments
};

