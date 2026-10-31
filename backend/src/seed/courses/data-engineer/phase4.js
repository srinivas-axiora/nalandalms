// Course 10: Data Engineer - Phase 4 (Chapters 22-27, Assessments 22-27)
// Apache Airflow, Production DAGs, dbt Foundations & Advanced Modeling, Snowflake & BigQuery

export const phase4 = {
  "chapters": [
    {
      "id": "CH-DTE-022",
      "courseId": "CRS-DTE-001",
      "sequence": 22,
      "title": "Apache Airflow Architecture & Core Primitives",
      "description": "Understand Airflow's distributed control plane: Webserver, Scheduler, Metadata Database, Celery and Kubernetes Executors, DAG parsing loop, Operators, Tasks, and XComs.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Apache Airflow Architecture & Core Primitives\n\nApache Airflow is the industry-standard programmatic workflow orchestration platform used by modern data teams to author, schedule, and monitor data pipelines as Directed Acyclic Graphs (DAGs).\n\n---\n\n## 1. Airflow Core Architecture\n\n```\n+---------------------------------------------------------------------------------+\n|                               AIRFLOW CONTROL PLANE                             |\n|  +--------------------+     +---------------------+     +--------------------+  |\n|  | AIRFLOW WEBSERVER  |     |  AIRFLOW SCHEDULER  |     |   METADATA DB      |  |\n|  | (Flask UI, REST)   |     |  (DAG processor &   |     | (PostgreSQL/MySQL) |  |\n|  |                    |     |   task trigger loop)|     | State of all runs  |  |\n|  +--------------------+     +---------------------+     +--------------------+  |\n+---------------------------------------+-----------------------------------------+\n                                        | Dispatches Task Instances\n                                        v\n                    [ EXECUTOR (Celery / Kubernetes) ]\n                                        |\n           +----------------------------+----------------------------+\n           |                                                         |\n           v                                                         v\n+-----------------------+                                 +-----------------------+\n| CELERY WORKER 1 /     |                                 | CELERY WORKER 2 /     |\n| K8S POD 1             |                                 | K8S POD 2             |\n| [TaskInstance: ETL]   |                                 | [TaskInstance: Spark] |\n+-----------------------+                                 +-----------------------+\n```\n\n### Key Components:\n1. **Airflow Scheduler:** Heartbeat loop that continuously monitors DAG files in dags_folder, schedules DagRuns based on execution dates, checks task upstream dependencies, and hands queued tasks to the Executor.\n2. **Metadata Database:** Relational database (PostgreSQL/MySQL) storing all task states, run histories, variables, connections, and user roles.\n3. **Webserver:** Flask application providing the web dashboard, Gantt charts, logs, and manual trigger controls.\n4. **Executor:** The compute abstraction. CeleryExecutor distributes work to standing worker nodes; KubernetesExecutor spins up an isolated, dedicated pod per task instance and tears it down upon completion.\n\n---\n\n## 2. DAGs, Operators, and Task Instances\n\n- **DAG (Directed Acyclic Graph):** A collection of tasks organized with directional dependencies without cyclic loops.\n- **Operator:** The template for a task (e.g., PythonOperator, BashOperator, SparkSubmitOperator, SnowflakeOperator).\n- **Task:** An instantiated operator inside a DAG.\n- **Task Instance:** A specific execution of a task for a particular logical date (logical_date / execution_date).\n\n---\n\n## 3. Cross-Communication (XComs)\n\nXComs (Cross-Communications) allow tasks to exchange small pieces of metadata (such as S3 file paths or record counts):\n\n```python\n# Task 1: Pushes metadata to XCom\ndef extract_data(**context):\n    output_path = \"s3://bronze-bucket/orders_2026_10_30.parquet\"\n    context['ti'].xcom_push(key='file_location', value=output_path)\n\n# Task 2: Pulls metadata from XCom\ndef transform_data(**context):\n    file_path = context['ti'].xcom_pull(key='file_location', task_ids='extract_task')\n    print(f\"Reading extracted file from: {file_path}\")\n```\n\n> [!CAUTION]\n> XCom data is stored directly in the Airflow Metadata Database (PostgreSQL). Never pass large DataFrames or datasets through XComs! Only pass lightweight metadata pointers (e.g., S3 URIs, run IDs).\n\n<div class=\"video-container\" style=\"position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;\">\n  <iframe src=\"https://www.youtube.com/embed/5a4G0kZ04rA\" title=\"Airflow Architecture & Core Primitives\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%;\"></iframe>\n</div>"
    },
    {
      "id": "CH-DTE-023",
      "courseId": "CRS-DTE-001",
      "sequence": 23,
      "title": "Production Airflow DAG Engineering & Best Practices",
      "description": "Write production-grade DAGs: TaskFlow API (@dag, @task), dynamic task mapping, SLAs, retry strategies with exponential backoff, worker pools, and CI/CD testing.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Production Airflow DAG Engineering & Best Practices\n\nWriting production-grade Airflow code requires adhering to strict software engineering standards to avoid overloading the scheduler and ensure fault tolerance.\n\n---\n\n## 1. Modern TaskFlow API (@dag and @task)\n\nThe modern Airflow 2.x TaskFlow API eliminates boilerplate operators and manages XCom dependencies implicitly through Python function returns and arguments:\n\n```python\nfrom datetime import datetime, timedelta\nfrom airflow.decorators import dag, task\n\ndefault_args = {\n    'owner': 'data-engineering',\n    'retries': 3,\n    'retry_delay': timedelta(minutes=5),\n    'retry_exponential_backoff': True,\n    'max_retry_delay': timedelta(minutes=30),\n}\n\n@dag(\n    dag_id='retail_ecom_pipeline',\n    default_args=default_args,\n    schedule_interval='@daily',\n    start_date=datetime(2026, 1, 1),\n    catchup=False,\n    max_active_runs=1,\n    tags=['production', 'retail']\n)\ndef retail_pipeline():\n\n    @task()\n    def extract_orders() -> str:\n        s3_path = \"s3://bronze/orders/today.parquet\"\n        return s3_path\n\n    @task()\n    def transform_orders(input_path: str) -> dict:\n        metrics = {\"path\": input_path, \"row_count\": 1450000}\n        return metrics\n\n    @task()\n    def load_iceberg(metrics: dict):\n        print(f\"Loading {metrics['row_count']} rows from {metrics['path']} into Iceberg\")\n\n    orders_path = extract_orders()\n    transformed_metrics = transform_orders(orders_path)\n    load_iceberg(transformed_metrics)\n\npipeline = retail_pipeline()\n```\n\n---\n\n## 2. Dynamic Task Mapping (.expand())\n\nAirflow 2.3+ introduced Dynamic Task Mapping, allowing pipelines to generate tasks at runtime based on upstream data (similar to a distributed MapReduce):\n\n```python\n@task\ndef get_customer_shards() -> list:\n    return [\"shard_na\", \"shard_eu\", \"shard_apac\"]\n\n@task\ndef process_shard(shard_id: str):\n    print(f\"Processing customer data for {shard_id}\")\n\nshards = get_customer_shards()\nprocess_shard.expand(shard_id=shards) # Dynamically creates 3 parallel tasks!\n```\n\n---\n\n## 3. Golden Rules of DAG Engineering\n\n1. **Top-Level Code Restraint:** Never make HTTP requests, SQL queries, or heavy computations in the top-level Python file outside of tasks! The Airflow Scheduler evaluates top-level code every few seconds; blocking calls starve the scheduler.\n2. **Idempotence:** Every task must be re-runnable without producing duplicate data or side effects (e.g., using partition overwrite instead of raw append).\n3. **Always set catchup=False:** Unless historical backfilling is explicitly intended, disable catchup to avoid spawning hundreds of historical runs upon DAG deployment.\n\n<div class=\"video-container\" style=\"position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;\">\n  <iframe src=\"https://www.youtube.com/embed/5a4G0kZ04rA\" title=\"Airflow TaskFlow & Dynamic DAGs\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%;\"></iframe>\n</div>"
    },
    {
      "id": "CH-DTE-024",
      "courseId": "CRS-DTE-001",
      "sequence": 24,
      "title": "Data Build Tool (dbt) Foundations & Modeling",
      "description": "Master analytics engineering with dbt Core: Project anatomy, models, Jinja templating, ref() and source() functions, materializations (table, view, incremental, ephemeral), and compilation.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Data Build Tool (dbt) Foundations & Modeling\n\n**dbt (data build tool)** enables analytics engineers and data engineers to transform data in their warehouse by writing simple modular SQL SELECT statements while dbt handles DDL, execution order, and DAG creation.\n\n---\n\n## 1. dbt Project Anatomy\n\n```\nmy_dbt_project/\n  ├── dbt_project.yml          (Project configuration, model materializations)\n  ├── profiles.yml             (Connection credentials to Snowflake/BigQuery)\n  ├── models/\n  │   ├── staging/             (Bronze -> Silver initial cleanups)\n  │   │   ├── _src_orders.yml  (Source declarations & tests)\n  │   │   └── stg_orders.sql   (Standardization model)\n  │   └── marts/               (Silver -> Gold business entities)\n  │       ├── fct_orders.sql   (Fact table)\n  │       └── dim_users.sql    (Dimension table)\n  └── macros/                  (Reusable Jinja functions)\n```\n\n---\n\n## 2. The Power of {{ ref() }} and {{ source() }}\n\ndbt builds the execution dependency DAG automatically through references:\n\n```sql\n-- models/marts/fct_orders.sql\n{{ config(materialized='table') }}\n\nWITH stg_orders AS (\n    SELECT * FROM {{ ref('stg_orders') }} -- Resolves to analytics.silver.stg_orders\n),\n\ndim_users AS (\n    SELECT * FROM {{ ref('dim_users') }}   -- Creates explicit DAG edge!\n)\n\nSELECT \n    o.order_id,\n    o.customer_id,\n    u.country,\n    o.total_amount,\n    o.order_timestamp\nFROM stg_orders o\nLEFT JOIN dim_users u ON o.customer_id = u.customer_id\nWHERE o.status = 'COMPLETED'\n```\n\n---\n\n## 3. Materialization Strategies\n\n| Materialization | Generated SQL Action | Ideal Use Case |\n| :--- | :--- | :--- |\n| **view** | CREATE OR REPLACE VIEW AS ... | Lightweight models, staging layers, rapid development. Zero storage cost. |\n| **table** | CREATE TABLE AS SELECT ... | Complex transformations, joins, reporting marts queried heavily by BI tools. Rebuilt completely on each run. |\n| **incremental** | MERGE INTO ... or INSERT INTO ... | Massive event datasets (billions of rows). Transforms only new or modified records since previous run. |\n| **ephemeral** | Injected as a Common Table Expression (CTE) | Intermediate calculations not needed in the warehouse catalog. |\n\n<div class=\"video-container\" style=\"position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;\">\n  <iframe src=\"https://www.youtube.com/embed/5a4G0kZ04rA\" title=\"dbt Core Foundations & Modeling\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%;\"></iframe>\n</div>"
    },
    {
      "id": "CH-DTE-025",
      "courseId": "CRS-DTE-001",
      "sequence": 25,
      "title": "Advanced dbt: Incremental Models, Testing & Documentation",
      "description": "Engineer resilient enterprise data models: Incremental merge strategies, is_incremental() macro, schema and data tests (unique, not_null), dbt snapshots (SCD Type 2), and dbt docs.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Advanced dbt: Incremental Models, Testing & Documentation\n\nProcessing petabyte-scale datasets requires incremental loading techniques and automated data contract validation before shipping assets to BI dashboards.\n\n---\n\n## 1. Incremental Models & is_incremental()\n\nIncremental models allow dbt to transform only newly inserted or updated rows:\n\n```sql\n-- models/marts/fct_web_events.sql\n{{\n    config(\n        materialized='incremental',\n        unique_key='event_id',\n        incremental_strategy='merge',\n        cluster_by=['event_date', 'event_type']\n    )\n}}\n\nSELECT\n    event_id,\n    user_id,\n    event_type,\n    payload,\n    event_timestamp,\n    DATE(event_timestamp) AS event_date\nFROM {{ source('raw_events', 'clickstream') }}\n\n{% if is_incremental() %}\n    -- Only evaluate records newer than the max event_timestamp in current table\n    -- Add a 3-hour lookback buffer to capture late-arriving events!\n    WHERE event_timestamp >= (SELECT MAX(event_timestamp) - INTERVAL '3 HOURS' FROM {{ this }})\n{% endif %}\n```\n\n---\n\n## 2. Automated Testing Suite\n\ndbt includes out-of-the-box generic tests declared in YAML:\n\n```yaml\nversion: 2\n\nmodels:\n  - name: fct_orders\n    description: \"Enterprise golden orders fact table\"\n    columns:\n      - name: order_id\n        tests:\n          - unique\n          - not_null\n      - name: status\n        tests:\n          - accepted_values:\n              values: ['PLACED', 'SHIPPED', 'DELIVERED', 'CANCELLED']\n      - name: customer_id\n        tests:\n          - relationships:\n              to: ref('dim_customers')\n              field: customer_id\n```\n\n---\n\n## 3. Slowly Changing Dimensions (SCD Type 2) with dbt Snapshots\n\nSnapshots capture historical changes in mutable source tables over time by maintaining dbt_valid_from and dbt_valid_to timestamp intervals:\n\n```sql\n-- snapshots/orders_snapshot.sql\n{% snapshot orders_snapshot %}\n\n{{\n    config(\n      target_schema='snapshots',\n      unique_key='order_id',\n      strategy='timestamp',\n      updated_at='updated_at'\n    )\n}}\n\nSELECT * FROM {{ source('crm_mysql', 'orders') }}\n\n{% endsnapshot %}\n```\n\n<div class=\"video-container\" style=\"position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;\">\n  <iframe src=\"https://www.youtube.com/embed/5a4G0kZ04rA\" title=\"Advanced dbt Incremental & Snapshots\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%;\"></iframe>\n</div>"
    },
    {
      "id": "CH-DTE-026",
      "courseId": "CRS-DTE-001",
      "sequence": 26,
      "title": "Snowflake Cloud Data Warehouse Architecture",
      "description": "Master Snowflake's multi-cluster shared data architecture: Storage Layer, Virtual Warehouses, Micro-partitioning & Clustering, Zero-Copy Cloning, Time Travel, and Snowpipe continuous ingestion.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Snowflake Cloud Data Warehouse Architecture\n\nSnowflake revolutionized cloud analytics through its true separation of compute, storage, and cloud services.\n\n---\n\n## 1. Multi-Cluster Shared Data Architecture\n\n```\n+---------------------------------------------------------------------------------+\n|                           CLOUD SERVICES LAYER                                  |\n|  - Authentication, Access Control, Query Optimization & Metadata Management     |\n+---------------------------------------------------------------------------------+\n                                        |\n           +----------------------------+----------------------------+\n           |                                                         |\n           v                                                         v\n+-----------------------+                                 +-----------------------+\n| VIRTUAL WAREHOUSE     |                                 | VIRTUAL WAREHOUSE     |\n| (ANALYTICS: Size XL)  |                                 | (ETL / DBT: Size M)   |\n| Independent Compute   |                                 | Zero Resource         |\n| Cluster (EC2/GCE/VMs) |                                 | Contention!           |\n+-----------------------+                                 +-----------------------+\n           |                                                         |\n           +----------------------------+----------------------------+\n                                        |\n                                        v\n+---------------------------------------------------------------------------------+\n|                            CENTRALIZED STORAGE LAYER                            |\n|  Scalable Object Storage (S3 / GCS / Azure Blob) containing Micro-Partitions    |\n+---------------------------------------------------------------------------------+\n```\n\n### Architectural Superpowers:\n- **Zero Resource Contention:** Large ETL workloads running on an XL warehouse have zero performance impact on dashboard analysts querying a Medium warehouse!\n- **Auto-Suspend & Auto-Resume:** Warehouses shut down when idle, eliminating idle compute billing.\n\n---\n\n## 2. Micro-Partitions and Data Clustering\n\n- Snowflake automatically divides all table data into contiguous, immutable columnar blocks called **Micro-Partitions** (50 to 500 MB uncompressed).\n- The Cloud Services Layer records min/max metadata for every column across all micro-partitions.\n- Queries execute **Partition Pruning**: micro-partitions with min/max bounds outside query WHERE clauses are completely skipped during scans.\n\n---\n\n## 3. Time Travel, Zero-Copy Cloning & Snowpipe\n\n- **Time Travel:** Allows querying historical table states up to 90 days in the past:\n  ```sql\n  SELECT * FROM customer_orders AT(OFFSET => -60*60); -- 1 hour ago\n  SELECT * FROM customer_orders BEFORE(STATEMENT => '01a9b2c3-0001');\n  ```\n- **Zero-Copy Cloning:** Creates an instantaneous copy of a database, schema, or table without copying underlying storage bytes:\n  ```sql\n  CREATE TABLE orders_dev CLONE orders_prod;\n  ```\n- **Snowpipe Continuous Ingestion:** Serverless event-driven ingestion listening to cloud storage S3 SNS/SQS notifications to load files micro-batch by micro-batch into Snowflake.\n\n<div class=\"video-container\" style=\"position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;\">\n  <iframe src=\"https://www.youtube.com/embed/5a4G0kZ04rA\" title=\"Snowflake Architecture & Snowpipe\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%;\"></iframe>\n</div>"
    },
    {
      "id": "CH-DTE-027",
      "courseId": "CRS-DTE-001",
      "sequence": 27,
      "title": "Google BigQuery & Serverless Analytics Engine",
      "description": "Explore Google BigQuery's petabyte serverless analytics platform: Dremel execution engine, Capacitor columnar storage, Colossus, Partitioning vs Clustering, Slot commitments, and BI Engine.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Google BigQuery & Serverless Analytics Engine\n\nGoogle BigQuery is a serverless, highly scalable, and cost-effective multi-cloud data warehouse designed for business agility.\n\n---\n\n## 1. BigQuery Infrastructure Architecture\n\nBigQuery decouples compute from storage using Google's world-class planetary data center infrastructure:\n\n```\n+---------------------------------------------------------------------------------+\n|                         DREMEL EXECUTION ENGINE (Compute)                       |\n|  - Dynamically provisions thousands of virtual worker SLOTS per query           |\n|  - Multi-level execution tree aggregates results across parallel shards         |\n+---------------------------------------------------------------------------------+\n                                        |\n                 [ JUPITER NETWORK: 1 Tbps Bisection Bandwidth ]\n                                        |\n+---------------------------------------------------------------------------------+\n|                           COLOSSUS STORAGE (Global FS)                          |\n|  - Capacitor columnar storage format with embedded dictionary & RLE encoding    |\n|  - Highly replicated, fault-tolerant planetary file system                      |\n+---------------------------------------------------------------------------------+\n```\n\n---\n\n## 2. Partitioning vs. Clustering\n\nTo minimize query cost and scan latency, BigQuery tables should combine partitioning and clustering:\n\n| Feature | Table Partitioning | Table Clustering |\n| :--- | :--- | :--- |\n| **Mechanic** | Divides table into distinct date/timestamp/integer boundaries. | Sorts and co-locates data within each partition based on up to 4 columns. |\n| **Granularity** | Coarse (e.g., Daily partitions: PARTITION BY DATE(created_at)). | Fine-grained (e.g., CLUSTER BY customer_id, event_type). |\n| **Cost Impact** | **Directly reduces billed bytes!** BigQuery charges $6.25 per TB scanned; partitioned queries scan only matched partitions. | Further improves scan speed by pruning non-matching blocks within partitions. |\n\n```sql\nCREATE OR REPLACE TABLE `analytics.ecommerce.orders`\nPARTITION BY DATE(order_timestamp)\nCLUSTER BY customer_id, store_id\nAS SELECT * FROM `analytics.staging.orders`;\n```\n\n---\n\n## 3. On-Demand vs. Capacity (Slots) Pricing & BI Engine\n\n- **On-Demand Pricing:** Billed per TB of data scanned by queries (encourages optimization via partition filters and column pruning).\n- **Capacity (Slots) Commitments:** Predictable monthly flat rate allocating dedicated Dremel Slots for steady-state enterprise analytics.\n- **BigQuery BI Engine:** In-memory acceleration service that transparently caches frequently accessed table segments, delivering sub-second response times to Looker and Tableau dashboards.\n\n<div class=\"video-container\" style=\"position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;\">\n  <iframe src=\"https://www.youtube.com/embed/5a4G0kZ04rA\" title=\"Google BigQuery Deep Dive\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%;\"></iframe>\n</div>"
    }
  ],
  "assessments": [
    {
      "id": "ASM-DTE-022",
      "courseId": "CRS-DTE-001",
      "chapterId": "CH-DTE-022",
      "title": "Assessment: Apache Airflow Architecture & Primitives",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DTE-211",
          "type": "MCQ",
          "prompt": "What is the primary role of the Airflow Scheduler?",
          "options": [
            "It continuously parses DAG files, checks upstream task dependencies, evaluates execution dates, and enqueues runnable task instances for the Executor",
            "It renders web dashboard HTML pages for user browsers",
            "It manages the underlying Kubernetes container image registry",
            "It compiles Python code into C++ machine instructions"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-212",
          "type": "MCQ",
          "prompt": "Where is the state of all Airflow DAG runs, task instances, variables, and connections durably stored?",
          "options": [
            "In the Airflow Metadata Database (PostgreSQL or MySQL)",
            "Inside local text files in /tmp",
            "Inside git commit messages",
            "In the user's browser cookie cache"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-213",
          "type": "MCQ",
          "prompt": "How does KubernetesExecutor execute tasks differently from CeleryExecutor?",
          "options": [
            "KubernetesExecutor spins up a dedicated, isolated pod for each individual task instance and terminates it upon completion, whereas Celery uses static standing workers",
            "KubernetesExecutor runs tasks directly inside the PostgreSQL database",
            "CeleryExecutor does not support Python tasks",
            "KubernetesExecutor requires Windows servers"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-214",
          "type": "MCQ",
          "prompt": "What is an Airflow Operator vs a Task?",
          "options": [
            "An Operator is a template class defining a piece of work; a Task is an instantiated operator within a DAG",
            "An Operator runs in Docker; a Task runs in Bash",
            "There is no difference between an Operator and a Task",
            "An Operator manages user logins"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-215",
          "type": "MCQ",
          "prompt": "Why should data engineers NEVER pass large datasets or Pandas DataFrames through Airflow XComs?",
          "options": [
            "XCom values are serialized and stored directly in the relational Metadata Database, leading to database performance degradation and memory crashes",
            "XCom encrypts data using a one-way hash that cannot be read",
            "XCom deletes files after 5 seconds",
            "XCom only accepts boolean values"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-216",
          "type": "MCQ",
          "prompt": "What does 'DAG' stand for in workflow orchestration?",
          "options": [
            "Directed Acyclic Graph",
            "Distributed Automated Gateway",
            "Data Analytics Group",
            "Dynamic Asynchronous Grid"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-217",
          "type": "MCQ",
          "prompt": "In Airflow, what does a 'Task Instance' represent?",
          "options": [
            "A specific execution of a task for a particular logical date / execution_date",
            "A Python script file on disk",
            "A worker node in the Kubernetes cluster",
            "A database backup snapshot"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-218",
          "type": "MCQ",
          "prompt": "Which parameter controls the maximum number of concurrent task instances allowed across the entire Airflow instance?",
          "options": [
            "parallelism",
            "max_active_tasks_per_dag",
            "dag_concurrency",
            "worker_concurrency"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-219",
          "type": "MCQ",
          "prompt": "What is an Airflow Hook?",
          "options": [
            "An interface to external platforms and databases (e.g., S3Hook, PostgresHook, SnowflakeHook) encapsulating authentication and connection management",
            "A git commit trigger for code deployment",
            "A Python decorator that intercepts exceptions",
            "A hardware sensor on a server rack"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-220",
          "type": "MCQ",
          "prompt": "What does the Airflow DAG parsing loop do?",
          "options": [
            "The DagFileProcessor periodically executes each Python file in the DAGs folder to evaluate DAG structures and synchronize them with the metadata DB",
            "It translates Python DAGs into JavaScript",
            "It cleans up old log files from worker disks",
            "It validates SQL syntax against the data warehouse"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DTE-023",
      "courseId": "CRS-DTE-001",
      "chapterId": "CH-DTE-023",
      "title": "Assessment: Production Airflow DAG Engineering",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DTE-221",
          "type": "MCQ",
          "prompt": "Why is executing heavy external database queries or HTTP calls in top-level DAG code considered an anti-pattern?",
          "options": [
            "Top-level code is executed by the scheduler process on every parsing loop (every few seconds), causing scheduler thread starvation and massive cluster latency",
            "It triggers automatic Airflow billing charges",
            "Top-level code can only be written in Bash",
            "It deletes the Airflow database tables"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-222",
          "type": "MCQ",
          "prompt": "What is the primary benefit of the modern TaskFlow API (@dag and @task) introduced in Airflow 2.0?",
          "options": [
            "It provides clean, idiomatic Python syntax where function return values and inputs automatically handle XCom serialization and dependency wiring",
            "It eliminates the need for an Airflow Scheduler",
            "It compiles Python tasks into Rust binaries",
            "It bypasses Kubernetes security policies"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-223",
          "type": "MCQ",
          "prompt": "What does setting 'catchup=False' in a DAG definition prevent?",
          "options": [
            "Prevents Airflow from triggering backfill DAG runs for every past schedule interval between start_date and current time upon initial deployment",
            "Prevents tasks from catching network exceptions",
            "Disables retry strategies on failed tasks",
            "Stops tasks from logging errors"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-224",
          "type": "MCQ",
          "prompt": "What feature in Airflow 2.3+ allows generating a dynamic number of parallel tasks at runtime based on the output of an upstream task?",
          "options": [
            "Dynamic Task Mapping via .expand()",
            "SubDAGs",
            "Task Groups",
            "TriggerDagRunOperator"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-225",
          "type": "MCQ",
          "prompt": "What is an Airflow Pool used for?",
          "options": [
            "Limiting task concurrency across specific resource-intensive workloads (e.g., capping concurrent Snowflake queries to 5)",
            "Allocating IP addresses to worker pods",
            "Storing cached database query results",
            "Pooling developer git commits"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-226",
          "type": "MCQ",
          "prompt": "What is an 'Idempotent' data pipeline task?",
          "options": [
            "A task that produces the exact same end state regardless of whether it is executed once or re-executed ten times with the same inputs",
            "A task that runs in under 1 second",
            "A task that requires no database connections",
            "A task that never fails"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-227",
          "type": "MCQ",
          "prompt": "What does 'retry_exponential_backoff=True' do when configuring task retries?",
          "options": [
            "Doubles the delay between consecutive retry attempts to avoid hammering struggling downstream services",
            "Triples the CPU allocation for each retry",
            "Retries the task indefinitely until successful",
            "Reduces the timeout limit by half"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-228",
          "type": "MCQ",
          "prompt": "How does a TaskGroup differ visually and architecturally from legacy SubDAGs?",
          "options": [
            "TaskGroups are purely UI grouping abstractions running in the same DAG context without the performance and deadlocking issues of SubDAGs",
            "TaskGroups run on separate physical servers",
            "TaskGroups require a dedicated Celery queue",
            "TaskGroups cannot contain more than 3 tasks"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-229",
          "type": "MCQ",
          "prompt": "What does 'max_active_runs=1' ensure on a DAG?",
          "options": [
            "Only one active DagRun is allowed to execute at any given time, preventing race conditions from concurrent executions",
            "The DAG can only be executed once in its entire lifetime",
            "Only one user can view the DAG in the UI",
            "The DAG uses a single worker core"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-230",
          "type": "MCQ",
          "prompt": "Which Airflow sensor mode releases worker resources while waiting for external conditions, avoiding worker slot starvation?",
          "options": [
            "mode='reschedule'",
            "mode='poke'",
            "mode='block'",
            "mode='sleep'"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DTE-024",
      "courseId": "CRS-DTE-001",
      "chapterId": "CH-DTE-024",
      "title": "Assessment: dbt Foundations & Modeling",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DTE-231",
          "type": "MCQ",
          "prompt": "What is dbt (data build tool) primarily used for in the modern data stack?",
          "options": [
            "Transforming data inside the data warehouse through modular SQL SELECT statements and managing DDL and DAG dependencies (the 'T' in ELT)",
            "Extracting data from REST APIs and loading into S3",
            "Creating machine learning deep neural networks",
            "Managing Kubernetes pod networking"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-232",
          "type": "MCQ",
          "prompt": "What function in dbt establishes relationships between models and automatically constructs the project DAG lineage?",
          "options": [
            "{{ ref('model_name') }}",
            "{{ source('source_name') }}",
            "{{ link('model_name') }}",
            "{{ depend('model_name') }}"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-233",
          "type": "MCQ",
          "prompt": "Which dbt materialization creates a physical table in the data warehouse that is completely dropped and rebuilt on every execution?",
          "options": [
            "table",
            "view",
            "incremental",
            "ephemeral"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-234",
          "type": "MCQ",
          "prompt": "What does the 'ephemeral' materialization in dbt generate in compiled SQL queries?",
          "options": [
            "Injects the model as a Common Table Expression (WITH cte AS ...) directly into downstream dependent models without creating a database object",
            "Creates a temporary table deleted after 1 hour",
            "Stores data in the browser cache",
            "Saves the result to an S3 CSV file"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-235",
          "type": "MCQ",
          "prompt": "Where are warehouse connection credentials (such as account, user, and role) configured in a dbt environment?",
          "options": [
            "profiles.yml (stored securely in ~/.dbt/ outside the git repo)",
            "dbt_project.yml",
            "packages.yml",
            "README.md"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-236",
          "type": "MCQ",
          "prompt": "What is the function of {{ source('source_name', 'table_name') }} in dbt?",
          "options": [
            "Declares and references raw data loaded by ingestion tools, enabling lineage tracking and freshness checks on source tables",
            "Imports a Python library",
            "Connects to an external web service",
            "Executes a bash script"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-237",
          "type": "MCQ",
          "prompt": "Which command compiles all dbt models and executes the resulting DDL/DML statements inside the target warehouse?",
          "options": [
            "dbt run",
            "dbt compile",
            "dbt test",
            "dbt build"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-238",
          "type": "MCQ",
          "prompt": "What templating language is embedded within dbt SQL models to support dynamic control flow, macros, and environment variables?",
          "options": [
            "Jinja",
            "Handlebars",
            "Mustache",
            "Blade"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-239",
          "type": "MCQ",
          "prompt": "What does the command 'dbt build' execute?",
          "options": [
            "Runs models, tests, snapshots, and seeds in the correct DAG dependency order in a single consolidated command",
            "Compiles dbt source code to C++ binaries",
            "Deploys an Airflow cluster",
            "Replaces the data warehouse schema"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-240",
          "type": "MCQ",
          "prompt": "What file in a dbt project defines project name, version, model path configurations, and default materializations?",
          "options": [
            "dbt_project.yml",
            "manifest.json",
            "catalog.json",
            "docker-compose.yml"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DTE-025",
      "courseId": "CRS-DTE-001",
      "chapterId": "CH-DTE-025",
      "title": "Assessment: Advanced dbt Incremental & Snapshots",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DTE-241",
          "type": "MCQ",
          "prompt": "How does an incremental dbt model decide which records to process during subsequent executions?",
          "options": [
            "It uses the {% if is_incremental() %} macro block to filter records newer than the maximum timestamp already present in the target table ({{ this }})",
            "It scans all rows and deletes duplicate rows in Python",
            "It hashes the entire database every 5 minutes",
            "It re-creates the table from scratch each time"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-242",
          "type": "MCQ",
          "prompt": "What incremental strategy is commonly used in Snowflake and BigQuery to insert new records and update existing records based on a unique key?",
          "options": [
            "merge",
            "append",
            "delete+insert",
            "truncate"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-243",
          "type": "MCQ",
          "prompt": "What are the four built-in generic tests provided by dbt Core?",
          "options": [
            "unique, not_null, accepted_values, and relationships",
            "accuracy, completeness, latency, and speed",
            "unit, integration, regression, and sanity",
            "schema, type, foreign_key, and check"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-244",
          "type": "MCQ",
          "prompt": "What type of data warehouse model is generated by dbt Snapshots?",
          "options": [
            "Slowly Changing Dimension Type 2 (SCD Type 2) tracking historical changes with valid-from and valid-to timestamp columns",
            "Star Schema Fact Table",
            "Wide denormalized flat CSV file",
            "In-memory Redis cache"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-245",
          "type": "MCQ",
          "prompt": "What happens when you run 'dbt run --full-refresh' on an incremental model?",
          "options": [
            "dbt ignores the is_incremental() condition, drops or overwrites the existing table, and re-processes the entire historical dataset from scratch",
            "dbt updates only the last 24 hours of data",
            "dbt deletes the model from git",
            "dbt refreshes only the web documentation"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-246",
          "type": "MCQ",
          "prompt": "In a dbt snapshot configured with 'strategy: timestamp', what column does dbt check to identify changed rows?",
          "options": [
            "The column specified by 'updated_at'",
            "The database primary key column",
            "The created_at column",
            "The system clock time"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-247",
          "type": "MCQ",
          "prompt": "What strategy should be used in dbt snapshots when the source table lacks an updated_at timestamp column?",
          "options": [
            "strategy: check (defining a list of columns to check for value changes via MD5 hashing)",
            "strategy: guess",
            "strategy: continuous",
            "strategy: manual"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-248",
          "type": "MCQ",
          "prompt": "Why is a lookback window (e.g., - INTERVAL '3 HOURS') recommended inside the 'is_incremental()' block?",
          "options": [
            "To capture late-arriving events or backfilled updates that occurred with earlier event timestamps than the latest recorded event",
            "To slow down the query to prevent warehouse overload",
            "Because SQL databases do not support exact equality comparisons",
            "To allow the dbt scheduler to sleep"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-249",
          "type": "MCQ",
          "prompt": "What command generates interactive web documentation showing full model lineage DAGs, descriptions, and test results?",
          "options": [
            "dbt docs generate && dbt docs serve",
            "dbt doc build",
            "dbt web show",
            "dbt lineage export"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-250",
          "type": "MCQ",
          "prompt": "What is a 'Singular Test' in dbt?",
          "options": [
            "A custom SQL query in the tests/ directory that passes if it returns 0 rows, and fails if it returns any error/failing rows",
            "A test that runs on a single CPU core",
            "A test applied to exactly one integer column",
            "A unit test written in pytest"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DTE-026",
      "courseId": "CRS-DTE-001",
      "chapterId": "CH-DTE-026",
      "title": "Assessment: Snowflake Cloud Data Warehouse Architecture",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DTE-251",
          "type": "MCQ",
          "prompt": "What are the three distinct layers in Snowflake's architecture?",
          "options": [
            "Cloud Services Layer, Virtual Warehouse (Compute) Layer, and Centralized Storage Layer",
            "Frontend, Backend, and Database",
            "Driver, Executor, and Storage",
            "Ingestion, Processing, and Serving"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-252",
          "type": "MCQ",
          "prompt": "What is a Snowflake Virtual Warehouse?",
          "options": [
            "An independent cluster of compute resources (CPU, RAM, local SSD) used to execute queries without resource contention with other warehouses",
            "A physical building housing servers",
            "An S3 storage bucket",
            "A web portal for business intelligence"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-253",
          "type": "MCQ",
          "prompt": "What are Micro-Partitions in Snowflake?",
          "options": [
            "Immutable columnar storage files (50-500MB uncompressed) into which Snowflake automatically divides all table data",
            "Small virtual machines running Linux",
            "Temporary RAM buffers in compute nodes",
            "Network subnets inside the VPC"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-254",
          "type": "MCQ",
          "prompt": "How does Snowflake's Zero-Copy Cloning work without duplicating storage costs?",
          "options": [
            "It duplicates only the metadata pointers to existing micro-partitions; new storage is only incurred when cloned data is modified (Copy-on-Write)",
            "It compresses data to 0 bytes using quantum algorithms",
            "It moves storage to free temporary scratch disks",
            "It converts tables into views"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-255",
          "type": "MCQ",
          "prompt": "What does Snowflake Time Travel enable data engineers to do?",
          "options": [
            "Query, clone, and restore historical data from tables that was modified or dropped up to 90 days in the past",
            "Predict future transactional sales values using ML",
            "Run queries faster than the speed of light",
            "Fast-forward system clocks to test future schedules"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-256",
          "type": "MCQ",
          "prompt": "What is Snowpipe in Snowflake?",
          "options": [
            "A serverless continuous ingestion service that loads data into Snowflake tables as soon as files arrive in cloud object storage via event notifications",
            "A physical fiber optic cable between AWS and Azure",
            "A CLI tool for exporting data to CSV",
            "A Python SDK for running Spark on Snowflake"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-257",
          "type": "MCQ",
          "prompt": "What feature in Snowflake automatically stops virtual warehouse compute billing when no queries are running for a specified number of seconds?",
          "options": [
            "Auto-Suspend",
            "Auto-Prune",
            "Auto-Drop",
            "Idle-Kill"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-258",
          "type": "MCQ",
          "prompt": "How does Snowflake perform query pruning during execution?",
          "options": [
            "The Cloud Services Layer checks column min/max metadata for all micro-partitions and skips reading files that cannot contain query matching rows",
            "It drops all NULL values before scanning",
            "It reads the entire table into RAM and sorts it",
            "It delegates pruning to the client web browser"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-259",
          "type": "MCQ",
          "prompt": "What is Snowflake's Fail-Safe period?",
          "options": [
            "A 7-day non-configurable disaster recovery window following Time Travel, accessible only by Snowflake Support to recover corrupted data",
            "A backup battery in the data center",
            "An automatic query cancellation timeout",
            "A security firewall against DDoS attacks"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-260",
          "type": "MCQ",
          "prompt": "What is a Multi-Cluster Warehouse used for in Snowflake?",
          "options": [
            "Automatically scaling additional compute clusters up and down to handle high concurrent user query volume without queueing delays",
            "Distributing data across five different cloud providers",
            "Running multiple operating systems simultaneously",
            "Replicating tables between different databases"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DTE-027",
      "courseId": "CRS-DTE-001",
      "chapterId": "CH-DTE-027",
      "title": "Assessment: Google BigQuery & Serverless Analytics",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DTE-261",
          "type": "MCQ",
          "prompt": "What is the query execution engine that powers Google BigQuery?",
          "options": [
            "Dremel",
            "Spark SQL",
            "Presto / Trino",
            "Hive Tez"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-262",
          "type": "MCQ",
          "prompt": "What underlying global file system and columnar format are used by BigQuery for storage?",
          "options": [
            "Colossus storage system with Capacitor columnar file format",
            "HDFS with Apache ORC",
            "Amazon S3 with Parquet",
            "NFS with CSV"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-263",
          "type": "MCQ",
          "prompt": "How does Table Partitioning in BigQuery directly reduce query costs under On-Demand pricing?",
          "options": [
            "BigQuery charges based on bytes scanned; queries with partition filters scan only matching partitions, drastically reducing billed data volumes",
            "BigQuery waives all fees for partitioned tables",
            "Partitioning compresses numbers into 1 bit",
            "Partitioned tables bypass the Dremel engine"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-264",
          "type": "MCQ",
          "prompt": "What is the difference between Partitioning and Clustering in BigQuery?",
          "options": [
            "Partitioning divides tables into coarse segments by date/range; Clustering sorts and groups data within partitions by up to four columns for fine-grained pruning",
            "Partitioning runs on GPUs; Clustering runs on CPUs",
            "Partitioning is free; Clustering costs $100/day",
            "Clustering can only be used on JSON strings"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-265",
          "type": "MCQ",
          "prompt": "What is a 'Slot' in Google BigQuery architecture?",
          "options": [
            "A virtual unit of computational capacity (CPU, memory, and networking) used by Dremel to execute SQL queries",
            "A physical PCI Express slot on a Google server",
            "A time window on a scheduling calendar",
            "A partition directory in Cloud Storage"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-266",
          "type": "MCQ",
          "prompt": "What is the primary benefit of BigQuery BI Engine?",
          "options": [
            "An in-memory acceleration service that transparently caches hot table segments, delivering sub-second response times to BI dashboards",
            "A tool for designing charts in PowerPoint",
            "An automated script generator for Airflow",
            "A billing calculator for cloud costs"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-267",
          "type": "MCQ",
          "prompt": "What high-speed petabit network fabric connects BigQuery compute slots to Colossus storage nodes?",
          "options": [
            "Jupiter network",
            "Ethernet 10Gbps",
            "Infiniband FDR",
            "Public Internet VPN"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-268",
          "type": "MCQ",
          "prompt": "Under BigQuery On-Demand pricing, what is the standard approximate cost per Terabyte of query data scanned?",
          "options": [
            "~$6.25 per TB",
            "~$50.00 per TB",
            "~$0.01 per TB",
            "$0 (completely free)"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-269",
          "type": "MCQ",
          "prompt": "What BigQuery feature allows querying data directly stored in Cloud Storage (Parquet, CSV, Avro) without loading it into BigQuery storage first?",
          "options": [
            "External Tables (BigLake)",
            "BigQuery ML",
            "BigQuery GIS",
            "Dataflow Stream"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-270",
          "type": "MCQ",
          "prompt": "What is the purpose of the BigQuery Storage Write API?",
          "options": [
            "A high-throughput, low-latency gRPC streaming ingestion API supporting exactly-once delivery semantics and dynamic schema updates",
            "A legacy REST API for uploading single CSV files",
            "A command-line tool for formatting hard drives",
            "A driver for writing directly to PostgreSQL"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    }
  ]
};
