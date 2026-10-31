// Course 10: Data Engineer - Phase 5 (Chapters 28-32, Assessments 28-32)
// Data Lineage & Catalogs, Observability, Privacy/Security/FinOps, Capstone Project & System Design Mastery

export const phase5 = {
  "chapters": [
    {
      "id": "CH-DTE-028",
      "courseId": "CRS-DTE-001",
      "sequence": 28,
      "title": "Data Lineage, Catalogs & Metadata Management",
      "description": "Master modern metadata governance: OpenLineage open standard, Marquez, Apache Atlas, DataHub, Amundsen, column-level lineage tracking, and automated asset discovery.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Data Lineage, Catalogs & Metadata Management\n\nAs enterprise data architectures grow to thousands of tables and millions of columns, automated lineage and metadata discovery become critical to prevent pipeline breakage and maintain regulatory compliance.\n\n---\n\n## 1. The OpenLineage Standard & Architecture\n\n```\n+---------------------------------------------------------------------------------+\n|                             DATA PIPELINE ECOSYSTEM                             |\n|  +--------------------+     +---------------------+     +--------------------+  |\n|  | AIRFLOW DAG RUNS   |     | SPARK SQL EXECUTIONS|     | DBT BUILD RUNS     |  |\n|  | (OpenLineage Hook) |     | (Spark Listener)    |     | (dbt OpenLineage)  |  |\n|  +--------------------+     +---------------------+     +--------------------+  |\n+---------------------------------------+-----------------------------------------+\n                                        | Emits OpenLineage Events (JSON Schema)\n                                        v\n+---------------------------------------------------------------------------------+\n|                      METADATA REPOSITORY & CATALOG SERVICE                      |\n|  (DataHub / Marquez / Apache Atlas / Amundsen)                                  |\n|  - Constructs end-to-end directed graph: Source -> Transformation -> Mart -> BI |\n|  - Column-Level Lineage (Tracks exactly which upstream source columns feed a BI) |\n+---------------------------------------------------------------------------------+\n```\n\n### Key Lineage Facets:\n- **Dataset Facet:** Captures schema, storage location (e.g., `s3://silver/orders`), and data format.\n- **Job Facet:** Captures code repository URL, commit hash, and job name (e.g., `dbt.marts.fct_orders`).\n- **Run Facet:** Captures specific execution timestamps, status (START, COMPLETE, FAIL), and runtime parameters.\n\n---\n\n## 2. Table-Level vs. Column-Level Lineage\n\n1. **Table-Level Lineage:** Informs engineers that `fct_orders` depends on `stg_orders` and `dim_users`. If `stg_orders` fails, downstream alerts fire.\n2. **Column-Level Lineage:** Parses SQL ASTs to map fine-grained relationships (e.g., `fct_orders.gross_revenue` is derived from `stg_orders.item_price * stg_orders.quantity`). Essential for impact analysis when modifying schema types.\n\n---\n\n## 3. Data Catalogs (DataHub vs. Amundsen)\n\n- **DataHub (LinkedIn):** Graph-based metadata platform built on Kafka and Elasticsearch supporting real-time streaming metadata ingestion, search, and access control governance.\n- **Amundsen (Lyft):** Search and discovery engine indexing tables, dashboards, and column descriptions backed by Neo4j or Elasticsearch.\n\n<div class=\"video-container\" style=\"position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;\">\n  <iframe src=\"https://www.youtube.com/embed/5a4G0kZ04rA\" title=\"Data Lineage & Catalogs\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%;\"></iframe>\n</div>"
    },
    {
      "id": "CH-DTE-029",
      "courseId": "CRS-DTE-001",
      "sequence": 29,
      "title": "Data Observability, Anomaly Detection & SLA Tracking",
      "description": "Build robust observability across data pipelines: The 5 pillars of data observability (Freshness, Volume, Quality, Schema, Lineage), statistical anomaly detection, and SLA incident alerting.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Data Observability, Anomaly Detection & SLA Tracking\n\nData Observability is the practice of monitoring, detecting, predicting, and resolving data incidents across the entire lifecycle before bad data poisons executive BI dashboards or machine learning models.\n\n---\n\n## 1. The 5 Pillars of Data Observability\n\n```\n+---------------------------------------------------------------------------------+\n|                     THE 5 PILLARS OF DATA OBSERVABILITY                         |\n+-------------------+-------------------------------------------------------------+\n| 1. FRESHNESS      | Is data arriving on time? Measures pipeline latency against     |\n|                   | Service Level Objectives (SLOs).                                |\n+-------------------+-------------------------------------------------------------+\n| 2. VOLUME         | Are tables receiving expected record counts? Detects missing or |\n|                   | duplicate batch ingestion (e.g., zero rows loaded today).       |\n+-------------------+-------------------------------------------------------------+\n| 3. QUALITY        | Are field values valid? Detects NULL spikes, out-of-range       |\n|                   | values, format errors, and integrity constraint violations.     |\n+-------------------+-------------------------------------------------------------+\n| 4. SCHEMA         | Has the table schema changed unexpectedly? Detects dropped,     |\n|                   | renamed, or type-modified columns that break downstream jobs.   |\n+-------------------+-------------------------------------------------------------+\n| 5. LINEAGE        | When an incident occurs, what upstream source caused it and what|\n|                   | downstream dashboards / ML models are impacted?                 |\n+-------------------+-------------------------------------------------------------+\n```\n\n---\n\n## 2. Statistical Anomaly Detection\n\nRather than setting rigid static thresholds, modern observability engines (Monte Carlo, Datafold, Elementary) model historical moving averages and seasonality (e.g., lower weekend volumes):\n\n```python\n# Rolling Z-score anomaly detection query\nWITH daily_counts AS (\n    SELECT DATE(created_at) AS metric_date, COUNT(*) AS row_count\n    FROM raw_events.clickstream\n    WHERE created_at >= CURRENT_DATE - INTERVAL '30 DAYS'\n    GROUP BY 1\n),\nstats AS (\n    SELECT \n        AVG(row_count) AS avg_count,\n        STDDEV(row_count) AS std_count\n    FROM daily_counts\n)\nSELECT \n    d.metric_date,\n    d.row_count,\n    (d.row_count - s.avg_count) / NULLIF(s.std_count, 0) AS z_score\nFROM daily_counts d, stats s\nWHERE ABS((d.row_count - s.avg_count) / NULLIF(s.std_count, 0)) > 3.0; -- 3 Sigma Anomaly!\n```\n\n---\n\n## 3. SLA Tracking & Incident Response\n\n- **Data Downtime:** The total time data is missing, inaccurate, or unavailable across critical tables.\n- **Circuit Breakers:** Automatically halting downstream pipeline runs and preventing dashboard refreshes when upstream data tests fail.\n\n<div class=\"video-container\" style=\"position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;\">\n  <iframe src=\"https://www.youtube.com/embed/5a4G0kZ04rA\" title=\"Data Observability Explained\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%;\"></iframe>\n</div>"
    },
    {
      "id": "CH-DTE-030",
      "courseId": "CRS-DTE-001",
      "sequence": 30,
      "title": "Data Privacy, Security & FinOps Governance",
      "description": "Implement enterprise data governance: RBAC, ABAC, Row-Level Security (RLS), Dynamic Data Masking, GDPR/CCPA Right-to-be-Forgotten pipelines, and Cloud Data Warehouse FinOps cost control.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Data Privacy, Security & FinOps Governance\n\nEnterprise data engineering requires balancing rapid analytical access with bulletproof security, statutory privacy regulations (GDPR, CCPA, HIPAA), and cloud financial management (FinOps).\n\n---\n\n## 1. Access Control: RBAC, RLS & Dynamic Data Masking\n\n- **Role-Based Access Control (RBAC):** Privileges granted to roles (e.g., `ANALYST_ROLE`, `FINANCE_ROLE`) rather than individual users.\n- **Row-Level Security (RLS):** Filtering rows dynamically based on the querying user's authorization context (e.g., an EU manager sees only EU customer records):\n  ```sql\n  CREATE ROW ACCESS POLICY region_policy AS (region_val VARCHAR) RETURNS BOOLEAN ->\n    CURRENT_ROLE() IN ('GLOBAL_ADMIN') OR region_val = CURRENT_USER_REGION();\n  ```\n- **Dynamic Column Masking:** Obfuscating sensitive PII columns (e.g., SSNs, credit cards, emails) based on caller permissions without rewriting physical data:\n  ```sql\n  CREATE MASKING POLICY email_mask AS (val VARCHAR) RETURNS VARCHAR ->\n    CASE WHEN CURRENT_ROLE() = 'PII_AUTHORIZED' THEN val\n         ELSE REGEXP_REPLACE(val, '(.*)@(.*)', '***@$2')\n    END;\n  ```\n\n---\n\n## 2. GDPR/CCPA 'Right to be Forgotten' Engineering\n\nHandling consumer data erasure requests in append-only immutable Lakehouses (Parquet files) requires specific strategies:\n1. **Delta Lake / Iceberg ACID Deletes:** Executing targeted `DELETE FROM customer_lakehouse WHERE customer_id = 'CUST-109'` rewriting only impacted data files.\n2. **Cryptographic Erasure (Crypto-Shredding):** Storing each customer's PII encrypted with a dedicated customer-specific encryption key in KMS. Deleting the key permanently renders all historical lakehouse records undecryptable without rewriting petabytes of storage!\n\n---\n\n## 3. Data FinOps: Warehouse Cost Optimization\n\n1. **Warehouse Right-Sizing:** Monitor average query queue times vs. warehouse sizes. Downsize underutilized XL warehouses to Medium.\n2. **Auto-Suspend:** Set virtual warehouse auto-suspend timeouts to 60 seconds for interactive analyst workloads.\n3. **Query Timeouts (`STATEMENT_TIMEOUT_IN_SECONDS`):** Kill rogue un-optimized cartesian product queries automatically after 30 minutes.\n\n<div class=\"video-container\" style=\"position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;\">\n  <iframe src=\"https://www.youtube.com/embed/5a4G0kZ04rA\" title=\"Data Security & FinOps\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%;\"></iframe>\n</div>"
    },
    {
      "id": "CH-DTE-031",
      "courseId": "CRS-DTE-001",
      "sequence": 31,
      "title": "Enterprise Capstone Project: Global Omnichannel Retail Data Lakehouse",
      "description": "Design and implement AuraCommerce Global's petabyte-scale lakehouse: Kafka CDC ingestion, Spark Structured Streaming, Apache Iceberg Medallion tiers, Airflow orchestration, and dbt marts.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Enterprise Capstone Project: Global Omnichannel Retail Data Lakehouse\n\nIn this capstone project, you synthesize all principles learned across the course to architect a petabyte-scale global data lakehouse platform for **AuraCommerce Global**, a multi-billion dollar omnichannel retailer.\n\n---\n\n## 1. System Architecture Blueprint\n\n```\n+---------------------------------------------------------------------------------+\n|                    AURACOMMERCE GLOBAL DATA LAKEHOUSE BLUEPRINT                 |\n+---------------------------------------------------------------------------------+\n                                                                                   \n  [ MySQL / Postgres Prod ]       [ Web / App Clickstream ]      [ SAP ERP Orders ]\n             |                                |                           |        \n             v                                v                           v        \n     (Debezium CDC)                  (Fluentbit / Kafka)           (S3 Batch Drop) \n             |                                |                           |        \n             +--------------------------------+---------------------------+        \n                                              |                                    \n                                              v                                    \n                     +-------------------------------------------------+           \n                     |  KAFKA CLUSTER (KRaft + Confluent Schema Reg)   |           \n                     |  Topics: orders.v1, clicks.v1, inventory.v1     |           \n                     +-------------------------------------------------+           \n                                              |                                    \n                          +-------------------+-------------------+                \n                          |                                       |                \n                          v                                       v                \n             [ Spark Structured Streaming ]            [ Apache Flink Real-Time ]  \n             (Micro-batch, RocksDB State)              (Real-Time Fraud & Anomaly) \n                          |                                       |                \n                          v                                       v                \n             +---------------------------------------------------------+           \n             |       BRONZE LAKE TIER (Raw Append-Only Parquet)        |           \n             +---------------------------------------------------------+           \n                                              |                                    \n                                   [ Spark / Airflow DAGs ]                        \n                                              |                                    \n                                              v                                    \n             +---------------------------------------------------------+           \n             | SILVER LAKEHOUSE (Apache Iceberg: ACID, Schema Enforced)|           \n             +---------------------------------------------------------+           \n                                              |                                    \n                                      [ dbt Core / SQL ]                           \n                                              |                                    \n                                              v                                    \n             +---------------------------------------------------------+           \n             |  GOLD ANALYTICS MARTS (Snowflake / BigQuery / Iceberg)  |           \n             |  fct_orders, dim_customers, daily_omnichannel_kpis      |           \n             +---------------------------------------------------------+           \n                                              |                                    \n             +--------------------------------+------------------------+           \n             |                                                         |           \n             v                                                         v           \n     [ BI & Executive Dashboards ]                             [ ML Feature Store ]\n```\n\n---\n\n## 2. Key Engineering Implementation Milestones\n\n1. **Milestone 1 - Ingestion & Schema Contracts:** Deploy Debezium CDC on transactional MySQL databases streaming change records to Kafka with Avro serialization and Confluent Schema Registry enforcement.\n2. **Milestone 2 - Bronze & Silver Lakehouse:** Build Spark Structured Streaming jobs reading Kafka topics, writing append-only raw JSON to Bronze S3, and performing upserts into partitioned Apache Iceberg Silver tables with RocksDB state checkpointing.\n3. **Milestone 3 - Gold Modeling with dbt:** Implement dimensional fact and dimension models with incremental merge materializations and automated test assertions (`unique`, `not_null`, `accepted_values`).\n4. **Milestone 4 - Orchestration & Governance:** Author Airflow TaskFlow DAGs managing pipeline scheduling, OpenLineage event dispatching to DataHub, and dynamic column masking for customer PII.\n\n<div class=\"video-container\" style=\"position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;\">\n  <iframe src=\"https://www.youtube.com/embed/5a4G0kZ04rA\" title=\"Enterprise Lakehouse Project Architecture\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%;\"></iframe>\n</div>"
    },
    {
      "id": "CH-DTE-032",
      "courseId": "CRS-DTE-001",
      "sequence": 32,
      "title": "Data Engineering System Design & Technical Interview Mastery",
      "description": "Master senior/staff data engineering system design interviews: Frameworks for petabyte-scale batch/streaming systems, failure mode analysis, capacity estimation, and trade-off matrices.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Data Engineering System Design & Technical Interview Mastery\n\nSystem design interviews for senior and lead data engineers assess your ability to design robust, cost-effective, scalable distributed architectures under real-world operational constraints.\n\n---\n\n## 1. The 4-Step System Design Framework\n\n```\n+---------------------------------------------------------------------------------+\n|                 DATA SYSTEM DESIGN INTERVIEW FRAMEWORK                          |\n+---------------------------------------------------------------------------------+\n| 1. REQUIREMENTS & SCOPE (5-8 Mins)                                              |\n|    - Functional: Data sources, query patterns, freshness latency (Real-time vs  |\n|      Daily batch), delivery semantics (at-least-once vs exactly-once).          |\n|    - Non-Functional: Throughput (RPS), daily volume (GB/TB), SLA, data retention|\n+---------------------------------------------------------------------------------+\n| 2. CAPACITY & RESOURCE ESTIMATION (3-5 Mins)                                    |\n|    - Compute write throughput: 10,000 events/sec * 1 KB = 10 MB/sec = 864 GB/day|\n|    - Calculate Kafka partition requirements: 10 MB/sec / 2 MB/sec/part = 5 min  |\n+---------------------------------------------------------------------------------+\n| 3. HIGH-LEVEL ARCHITECTURE (10-15 Mins)                                         |\n|    - Ingestion layer (Kafka/Connect) -> Processing (Spark/Flink) ->             |\n|      Storage (Iceberg Lakehouse / Snowflake) -> Serving (APIs, BI).             |\n+---------------------------------------------------------------------------------+\n| 4. DEEP DIVE & FAILURE MODES (15-20 Mins)                                       |\n|    - What happens if a broker/executor dies?                                    |\n|    - How do you handle schema drift? Data skew? Out-of-order events?            |\n|    - Backpressure mitigation & Cost/FinOps trade-offs.                          |\n+---------------------------------------------------------------------------------+\n```\n\n---\n\n## 2. Core Trade-Off Matrices\n\n| Decision | Option A | Option B | Core Trade-Off |\n| :--- | :--- | :--- | :--- |\n| **Format** | Apache Iceberg | Delta Lake | Iceberg offers superior multi-engine independence (Trino, Spark, Flink); Delta offers deep Databricks ecosystem integration. |\n| **Streaming Engine** | Spark Structured Streaming | Apache Flink | Spark offers unified DataFrame batch/stream code; Flink provides true event-by-event sub-millisecond latencies. |\n| **CDC Strategy** | Log-Based (Debezium) | Query-Based Polling | Log-based captures deletes and incurs zero query load, but requires DB superuser replication permissions. |\n\n<div class=\"video-container\" style=\"position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;\">\n  <iframe src=\"https://www.youtube.com/embed/5a4G0kZ04rA\" title=\"Data Engineering System Design Mastery\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%;\"></iframe>\n</div>"
    }
  ],
  "assessments": [
    {
      "id": "ASM-DTE-028",
      "courseId": "CRS-DTE-001",
      "chapterId": "CH-DTE-028",
      "title": "Assessment: Data Lineage & Catalogs",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DTE-271",
          "type": "MCQ",
          "prompt": "What is OpenLineage in data engineering?",
          "options": [
            "An open standard and JSON specification for defining and collecting data lineage metadata from pipeline engines during execution",
            "An open-source SQL database",
            "A cloud infrastructure monitoring tool",
            "A file compression algorithm"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-272",
          "type": "MCQ",
          "prompt": "What is the primary benefit of Column-Level Lineage over Table-Level Lineage?",
          "options": [
            "It tracks the exact origin and transformation logic for individual columns, enabling precise impact analysis before altering upstream column definitions",
            "It reduces storage consumption by 50%",
            "It speeds up SQL queries by 10x",
            "It encrypts columns using AES-256"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-273",
          "type": "MCQ",
          "prompt": "Which metadata platform, originally developed at LinkedIn, uses Kafka and Elasticsearch for streaming metadata ingestion and graph discovery?",
          "options": [
            "DataHub",
            "Apache Cassandra",
            "Grafana",
            "Prometheus"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-274",
          "type": "MCQ",
          "prompt": "What are the three fundamental entity facets captured by OpenLineage events?",
          "options": [
            "Datasets, Jobs, and Runs",
            "Users, Passwords, and Tokens",
            "CPUs, Disks, and Networks",
            "Tables, Views, and Triggers"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-275",
          "type": "MCQ",
          "prompt": "What open-source reference implementation server is maintained by the OpenLineage project to collect and visualize lineage DAGs?",
          "options": [
            "Marquez",
            "Postman",
            "Docker Swarm",
            "Terraform"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-276",
          "type": "MCQ",
          "prompt": "How does dbt capture data lineage across its project models?",
          "options": [
            "By parsing {{ ref() }} and {{ source() }} macro references to construct the project Directed Acyclic Graph (DAG)",
            "By inspecting network packets",
            "By querying the browser cache",
            "Through manual user drag-and-drop actions"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-277",
          "type": "MCQ",
          "prompt": "What is Amundsen?",
          "options": [
            "A data search and discovery engine originally built at Lyft to index datasets, dashboards, and column documentation",
            "A distributed messaging broker",
            "An orchestration tool replacing Airflow",
            "A machine learning training framework"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-278",
          "type": "MCQ",
          "prompt": "Why is automated metadata collection preferred over manual catalog curation in modern data enterprises?",
          "options": [
            "Pipelines evolve rapidly; manual documentation quickly becomes obsolete, whereas automated crawlers and execution hooks capture real-time truth",
            "Manual catalogs are illegal under GDPR",
            "Automated catalogs eliminate the need for SQL databases",
            "Manual documentation cannot be rendered in HTML"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-279",
          "type": "MCQ",
          "prompt": "How does Spark's OpenLineage listener extract column lineage from queries?",
          "options": [
            "By analyzing the Catalyst Optimizer's Resolved and Optimized Logical Plans to determine input-output column mappings",
            "By reading the raw Python source code lines",
            "By taking screenshots of the Spark UI",
            "By inspecting the driver's memory dump"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-280",
          "type": "MCQ",
          "prompt": "What is an 'Impact Analysis' in data metadata management?",
          "options": [
            "Evaluating the downstream dependencies and dashboards that will be broken if an upstream schema is modified or dropped",
            "Measuring server electricity consumption during peak hours",
            "Calculating database hard drive vibration",
            "Testing network latency under DDoS attacks"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DTE-029",
      "courseId": "CRS-DTE-001",
      "chapterId": "CH-DTE-029",
      "title": "Assessment: Data Observability & Anomaly Detection",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DTE-281",
          "type": "MCQ",
          "prompt": "What are the five recognized pillars of modern Data Observability?",
          "options": [
            "Freshness, Volume, Quality, Schema, and Lineage",
            "CPU, Memory, Disk, Network, and Uptime",
            "Speed, Storage, Compute, Cost, and Security",
            "Ingestion, Transformation, Storage, Serving, and Reporting"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-282",
          "type": "MCQ",
          "prompt": "What does the 'Freshness' pillar measure in data observability?",
          "options": [
            "How recently a table was updated and whether data delivery meets defined Service Level Objectives (SLOs)",
            "The temperature of the server room",
            "Whether column names follow camelCase naming standards",
            "The age of the engineer who wrote the pipeline"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-283",
          "type": "MCQ",
          "prompt": "What is 'Data Downtime'?",
          "options": [
            "Periods of time where data is missing, inaccurate, corrupted, or erroneous, impacting business decisions",
            "Scheduled data warehouse maintenance windows",
            "When engineers log off for the weekend",
            "When the network router is restarted"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-284",
          "type": "MCQ",
          "prompt": "Why is ML-based statistical anomaly detection superior to static threshold rules for volume monitoring?",
          "options": [
            "It automatically adapts to seasonal patterns (e.g., lower weekend sales volumes) without generating false alerts",
            "It runs without requiring any CPU cycles",
            "It eliminates the need for SQL databases",
            "It guarantees 100% bug-free data pipelines"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-285",
          "type": "MCQ",
          "prompt": "What is a 'Circuit Breaker' in a data pipeline?",
          "options": [
            "An automated gatekeeper that halts downstream pipeline runs and prevents dashboard refreshes if critical upstream data quality tests fail",
            "A physical electrical fuse in the data center rack",
            "A software license timeout",
            "An algorithm that truncates database logs"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-286",
          "type": "MCQ",
          "prompt": "What statistical metric indicates that a daily row count deviates significantly (e.g., 3 standard deviations) from the moving average?",
          "options": [
            "Z-Score (|Z| > 3)",
            "P-Value = 1.0",
            "R-Squared = 0",
            "F-Statistic = 100"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-287",
          "type": "MCQ",
          "prompt": "What does the 'Schema' pillar detect in data observability?",
          "options": [
            "Unannounced column deletions, renames, or unexpected data type mutations made in source databases",
            "Changes in developer git commit author emails",
            "Updates to the operating system kernel",
            "New rows added to fact tables"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-288",
          "type": "MCQ",
          "prompt": "What is an example of a 'Volume Anomaly'?",
          "options": [
            "A daily ETL job ingesting 0 rows instead of the expected 500,000 rows due to an upstream API outage",
            "A query running 2 seconds slower than yesterday",
            "A user changing their password",
            "A warehouse bill increasing by $1.00"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-289",
          "type": "MCQ",
          "prompt": "Which open-source dbt package provides automated data anomaly detection and observability directly within dbt projects?",
          "options": [
            "Elementary",
            "dbt-expectations",
            "dbt-utils",
            "dbt-audit"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-290",
          "type": "MCQ",
          "prompt": "Where should data observability alerts typically be routed for rapid engineering triage?",
          "options": [
            "Dedicated Slack/Teams incident channels and PagerDuty/Opsgenie for critical SLA breaches",
            "Printed on physical paper",
            "Saved to an unmonitored FTP server",
            "Forwarded to marketing social media accounts"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DTE-030",
      "courseId": "CRS-DTE-001",
      "chapterId": "CH-DTE-030",
      "title": "Assessment: Data Security, Privacy & FinOps Governance",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DTE-291",
          "type": "MCQ",
          "prompt": "What is Dynamic Data Masking in modern cloud data warehouses?",
          "options": [
            "Obfuscating sensitive column values (e.g., masking emails or SSNs) at query runtime based on the user's role without modifying underlying storage",
            "Encrypting the hard drive with a physical key",
            "Hiding the database icon from desktop screens",
            "Deleting sensitive data after 10 minutes"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-292",
          "type": "MCQ",
          "prompt": "What does Row-Level Security (RLS) enforce?",
          "options": [
            "Restricts query results to only the subset of rows that match the calling user's geographic, department, or role authorization rules",
            "Prevents rows from exceeding 100 bytes in size",
            "Limits tables to a maximum of 1 million rows",
            "Enforces alphabetical sorting on primary keys"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-293",
          "type": "MCQ",
          "prompt": "How does 'Crypto-Shredding' efficiently satisfy GDPR/CCPA 'Right to be Forgotten' in immutable data lakes without rewriting petabytes of Parquet files?",
          "options": [
            "Each user's PII is encrypted with a dedicated encryption key; permanently destroying that key renders historical data unreadable instantly",
            "By physically shredding the server hard drives with industrial machinery",
            "By executing a full table drop and re-creating the lake",
            "By replacing all bytes with zeros in Python"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-294",
          "type": "MCQ",
          "prompt": "What is Role-Based Access Control (RBAC)?",
          "options": [
            "Managing security by assigning database permissions to roles and assigning users to appropriate roles rather than granting privileges directly to users",
            "Allowing all employees full superuser permissions",
            "Restricting logins based on the brand of computer used",
            "Enforcing password changes every 2 hours"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-295",
          "type": "MCQ",
          "prompt": "In Cloud Data FinOps, what setting automatically halts queries that run beyond a reasonable time threshold to prevent runaway compute bills?",
          "options": [
            "STATEMENT_TIMEOUT_IN_SECONDS (or query timeout)",
            "AUTO_SUSPEND_TIMEOUT",
            "MAX_CONCURRENCY_LEVEL",
            "IDLE_SESSION_KILLER"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-296",
          "type": "MCQ",
          "prompt": "Why should virtual warehouse 'Auto-Suspend' be configured with short timeouts (e.g., 60 seconds) in Snowflake?",
          "options": [
            "To stop compute billing immediately when queries finish, preventing organizations from paying for idle VM compute capacity",
            "To clear the database metadata cache",
            "To reboot the operating system for security updates",
            "To force analysts to log off at the end of the day"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-297",
          "type": "MCQ",
          "prompt": "What is Attribute-Based Access Control (ABAC)?",
          "options": [
            "Dynamic access control evaluating attributes of the user, resource, action, and environment (e.g., time of day, IP address, data classification tags)",
            "Access control based purely on alphabetical employee names",
            "A system that requires two passwords to login",
            "Access granted exclusively to developers"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-298",
          "type": "MCQ",
          "prompt": "What is an effective strategy for allocating data warehouse compute costs to specific business units (e.g., Marketing vs. Finance)?",
          "options": [
            "Provision dedicated virtual warehouses per business department and tag them with cost-center resource tags",
            "Divide the monthly cloud bill equally by the number of employees",
            "Charge the department that runs the fewest queries",
            "Disable billing alerts"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-299",
          "type": "MCQ",
          "prompt": "What risk is associated with granting 'ACCOUNTADMIN' role in Snowflake or 'Owner' in BigQuery to general data engineers?",
          "options": [
            "Excessive administrative privilege allowing unrestricted billing modifications, security policy alterations, and catastrophic accidental data deletions",
            "It slows down query execution speeds by 50%",
            "It locks the engineer out of the web console",
            "It prevents dbt from executing models"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-300",
          "type": "MCQ",
          "prompt": "Under GDPR, what is the maximum standard time window an enterprise has to comply with a consumer's verified data erasure request?",
          "options": [
            "30 calendar days",
            "24 hours",
            "1 year",
            "Indefinite"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DTE-031",
      "courseId": "CRS-DTE-001",
      "chapterId": "CH-DTE-031",
      "title": "Assessment: Enterprise Capstone Project Architecture",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DTE-301",
          "type": "MCQ",
          "prompt": "In the AuraCommerce Global Capstone architecture, what is the role of Apache Kafka and Schema Registry?",
          "options": [
            "Serving as the centralized, contract-enforced real-time event streaming backbone decoupling transactional databases from lakehouse consumers",
            "Storing historical reporting data for 10 years",
            "Running daily scheduled dbt transformations",
            "Providing a web dashboard for marketing analysts"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-302",
          "type": "MCQ",
          "prompt": "Why is Apache Iceberg selected for the Silver tier over raw un-managed Parquet files?",
          "options": [
            "Iceberg provides full ACID transactions, atomic partition evolution, snapshot isolation, and time-travel querying over cloud object storage",
            "Iceberg stores data on magnetic tapes",
            "Iceberg is an in-memory Redis cache replacement",
            "Iceberg does not require schema definitions"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-303",
          "type": "MCQ",
          "prompt": "How does the Bronze tier protect against data corruption caused by downstream transformation bugs?",
          "options": [
            "It retains raw, immutable, append-only operational payloads with zero business transformations, enabling complete historical pipeline replays",
            "It deletes all malformed records immediately",
            "It encrypts files with a password known only to the CEO",
            "It runs on an isolated bare-metal server"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-304",
          "type": "MCQ",
          "prompt": "Which component in the Capstone platform is responsible for daily batch orchestration and dependency management?",
          "options": [
            "Apache Airflow using the modern TaskFlow API",
            "Linux Cron jobs running on worker laptops",
            "Kafka Connect Source tasks",
            "Manual developer CLI executions"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-305",
          "type": "MCQ",
          "prompt": "What tool transforms clean Silver Iceberg tables into business-ready Gold marts (fact and dimension tables)?",
          "options": [
            "dbt Core executing modular SQL models and automated test suites",
            "Excel VBA Macros",
            "Tableau Desktop",
            "Bash awk scripts"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-306",
          "type": "MCQ",
          "prompt": "How does Debezium ingest changes from the operational MySQL customer database into Kafka?",
          "options": [
            "By tailing the MySQL binary log (binlog) non-intrusively to capture row-level inserts, updates, and deletes",
            "By running SELECT * FROM customers every second",
            "By exporting daily CSV dumps via FTP",
            "By taking manual database backups"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-307",
          "type": "MCQ",
          "prompt": "What stream processing engine is deployed in parallel with Spark to execute sub-millisecond real-time fraud detection?",
          "options": [
            "Apache Flink",
            "Apache Hive",
            "Presto / Trino",
            "PostgreSQL"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-308",
          "type": "MCQ",
          "prompt": "Where does Spark Structured Streaming persist streaming checkpoint state to survive executor restarts?",
          "options": [
            "Amazon S3 or Google Cloud Storage via a durable checkpointLocation",
            "Local RAM on worker node 1",
            "In the browser LocalStorage",
            "Inside the Kafka __consumer_offsets topic only"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-309",
          "type": "MCQ",
          "prompt": "How is customer privacy (PII) protected in the AuraCommerce Gold marts?",
          "options": [
            "Through Dynamic Column Masking policies obfuscating credit card and phone numbers for non-privileged roles",
            "By removing all customer records from the database",
            "By publishing customer data only in PDF format",
            "By shutting down the data warehouse at night"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-310",
          "type": "MCQ",
          "prompt": "How is data lineage tracked across the end-to-end AuraCommerce platform?",
          "options": [
            "OpenLineage events emitted from Spark, Airflow, and dbt dispatched to a centralized DataHub metadata catalog",
            "By writing comments in Python scripts",
            "By checking git commit logs manually",
            "Lineage tracking is not supported in distributed architectures"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DTE-032",
      "courseId": "CRS-DTE-001",
      "chapterId": "CH-DTE-032",
      "title": "Assessment: Data Engineering System Design Mastery",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DTE-311",
          "type": "MCQ",
          "prompt": "What is the recommended first step when approaching a senior data engineering system design interview?",
          "options": [
            "Clarify functional and non-functional requirements: data volume, throughput (RPS), freshness latency SLAs, query patterns, and delivery guarantees",
            "Immediately draw a Spark cluster diagram",
            "Start writing SQL DDL commands on the whiteboard",
            "Argue with the interviewer about programming languages"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-312",
          "type": "MCQ",
          "prompt": "If an incoming event stream receives 20,000 events/second with an average payload size of 1 KB, what is the sustained daily ingestion volume?",
          "options": [
            "~1.73 Terabytes / day (20 MB/sec * 86,400 seconds)",
            "~100 Gigabytes / day",
            "~500 Megabytes / day",
            "~50 Petabytes / day"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-313",
          "type": "MCQ",
          "prompt": "If a single Kafka partition can sustain 2 MB/second of write throughput, how many partitions are required to handle 20 MB/second of traffic with 2x headroom for traffic spikes?",
          "options": [
            "20 partitions (20 MB/s * 2 / 2 MB/s/partition)",
            "2 partitions",
            "100 partitions",
            "1 partition"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-314",
          "type": "MCQ",
          "prompt": "What is the core architectural trade-off between Apache Flink and Apache Spark Structured Streaming?",
          "options": [
            "Flink provides true event-driven processing with sub-millisecond latencies but higher operational complexity; Spark provides unified micro-batching with simpler code re-use",
            "Flink is free while Spark costs $100 per query",
            "Spark cannot process JSON files",
            "Flink runs only on Windows servers"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-315",
          "type": "MCQ",
          "prompt": "Why is Log-Based CDC (Debezium) preferred over Query-Based CDC (polling SELECT statements) in system design?",
          "options": [
            "Log-based CDC captures hard DELETEs, provides exact transaction commit order, and introduces negligible CPU overhead on source transactional databases",
            "Log-based CDC encrypts data automatically",
            "Query-based CDC cannot connect to PostgreSQL",
            "Log-based CDC eliminates the need for Kafka"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-316",
          "type": "MCQ",
          "prompt": "What is the CAP Theorem trade-off in distributed storage systems?",
          "options": [
            "Under a network partition (P), a distributed system must choose between Consistency (C) and Availability (A)",
            "A system can only have Compute, Analytics, or Storage",
            "CPU, Allocation, and Power are always equal",
            "Memory cannot exceed disk capacity"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-317",
          "type": "MCQ",
          "prompt": "How do you mitigate severe data skew in a distributed Spark or Flink join during an interview discussion?",
          "options": [
            "Implement key salting on skewed keys, broadcast small dimension tables, or enable Adaptive Query Execution (AQE)",
            "Filter out all skewed records and throw them away",
            "Switch from Python to Java",
            "Run the query on a single CPU core"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-318",
          "type": "MCQ",
          "prompt": "What is 'Backpressure' in a streaming system and how should it be handled?",
          "options": [
            "When downstream processing cannot keep pace with ingestion rates; handled via rate-limiting sources, scaling consumer pods, or buffering in durable commit logs",
            "When physical water pipes burst in the data center",
            "When an SSL certificate expires",
            "When network packets are routed backwards"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-319",
          "type": "MCQ",
          "prompt": "What delivery guarantee is achieved when combining idempotent producers, transactional consumers, and ACID lakehouse commits?",
          "options": [
            "End-to-End Exactly-Once Processing Semantics",
            "At-Most-Once Delivery",
            "Unreliable Best-Effort Delivery",
            "Zero-Delivery Guarantee"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-320",
          "type": "MCQ",
          "prompt": "In senior system design interviews, what distinguishes an elite candidate when discussing cloud costs (FinOps)?",
          "options": [
            "Proactively evaluating trade-offs between managed services vs self-hosted compute, storage lifecycle tiers, partition pruning, and virtual warehouse auto-suspension",
            "Claiming that cost is irrelevant because the company has unlimited funding",
            "Suggesting hosting everything on an engineer's personal laptop",
            "Recommending uncompressed CSV storage to avoid compression CPU licensing costs"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    }
  ]
};
