// Course 10: Data Engineer Masterclass - Phase 1: Distributed Storage, File Formats & Modern Lakehouse Architecture
// Chapters 1 to 7 | Assessments 1 to 7 | 70 MCQs

export const phase1 = {
  chapters: [
    {
      id: "CH-DTE-001",
      courseId: "CRS-DTE-001",
      sequence: 1,
      title: "Data Engineering Foundations & Modern Data Architecture",
      description: "Understand the evolution of data architecture: Data Warehouses, Data Lakes, Lakehouses, ETL vs ELT, batch vs streaming, and Lambda vs Kappa architectures.",
      contentType: "Rich Text",
      durationMinutes: 75,
      minimumTimeMinutes: 45,
      body: `
# Data Engineering Foundations & Modern Data Architecture

Data engineering is the discipline of designing, building, and operating reliable distributed data pipelines that transform raw operational exhaust into clean, queryable, high-trust analytical assets.

---

## 1. Architectural Evolution: Warehouse vs. Lake vs. Lakehouse

\`\`\`
+-----------------------+     +-----------------------+     +-----------------------+
| 1. DATA WAREHOUSE     |     | 2. DATA LAKE          |     | 3. MODERN LAKEHOUSE   |
| (1990s - 2010s)       |     | (2010s - 2020s)       |     | (2020s - Present)     |
+-----------------------+     +-----------------------+     +-----------------------+
| - Proprietary storage |     | - Cheap object store  |     | - Cheap object store  |
| - Schema-on-write     |     |   (S3 / HDFS / GCS)   |   |   (S3 / GCS)          |
| - Fast SQL queries    |     | - Schema-on-read      |     | - Open Table Formats  |
| - Structured data only|     | - All data types      |     |   (Iceberg, Delta)    |
| - Expensive scaling   |     | - No ACID guarantees  |     | - Full ACID, time     |
|                       |     | - "Data Swamp" risk   |     |   travel & fast SQL   |
+-----------------------+     +-----------------------+     +-----------------------+
\`\`\`

---

## 2. ETL vs. ELT: The Paradigm Shift

- **Extract, Transform, Load (ETL):** In legacy systems, data was transformed on dedicated compute servers (e.g., Informatica, custom Python) *before* loading into the warehouse to avoid overloading expensive warehouse compute.
- **Extract, Load, Transform (ELT):** Modern cloud warehouses (Snowflake, BigQuery) and Lakehouses separate storage from compute. Raw data is loaded immediately into object storage (preserving fidelity), and transformations are executed directly inside the scalable data engine using SQL/dbt.

---

## 3. Streaming Paradigms: Lambda vs. Kappa Architecture

\`\`\`
LAMBDA ARCHITECTURE (Dual-Codebase Complexity):
All Data ---> [ Speed Layer: Real-Time Stream Engine (Storm/Flink) ] ---> Real-time View
         ---> [ Batch Layer: Master Storage + Batch Engine (Hadoop)  ] ---> Batch View
(Flaw: Maintaining two separate codebases for stream and batch creates logic drift!)

KAPPA ARCHITECTURE (Single Stream-First Codebase):
All Data ---> [ Kafka / Redpanda Append-Only Event Log ]
         ---> [ Unified Stream Processor (Apache Flink / Spark Streaming) ] ---> Serving Layer
(Benefit: Single processing codebase for both real-time streaming and historical replay!)
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/5a4G0kZ04rA" title="Data Engineering Architecture Explained" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DTE-002",
      courseId: "CRS-DTE-001",
      sequence: 2,
      title: "Distributed Storage Systems & Columnar File Formats",
      description: "Master distributed storage architectures (HDFS, S3/GCS consistency), Parquet columnar storage, dictionary encoding, run-length encoding, and Avro serialization.",
      contentType: "Rich Text",
      durationMinutes: 80,
      minimumTimeMinutes: 50,
      body: `
# Distributed Storage Systems & Columnar File Formats

In big data engineering, I/O bandwidth is the primary bottleneck. Storing terabytes of data in row-oriented formats (CSV, JSON) forces query engines to read 100% of bytes from disk even when a query only aggregates a single column. **Columnar file formats** solve this.

---

## 1. Row-Oriented vs. Columnar Storage Layout

\`\`\`
ROW-ORIENTED (CSV, JSON, Avro):
Row 1: [ User: 101 | Age: 25 | State: 'CA' | Revenue: $120.50 ]
Row 2: [ User: 102 | Age: 42 | State: 'NY' | Revenue: $450.00 ]
- Optimal for: OLTP transactional workloads (writing/reading full rows by ID).
- Catastrophic for: Analytics queries (e.g., "SELECT AVG(Revenue) FROM table").

COLUMNAR STORAGE (Apache Parquet, Apache ORC):
Col 'User':    [ 101, 102, ... ]
Col 'Age':     [ 25, 42, ... ]
Col 'State':   [ 'CA', 'NY', ... ]
Col 'Revenue': [ 120.50, 450.00, ... ]
- Optimal for: OLAP analytics! Query engine reads ONLY the 'Revenue' column bytes.
- Column Pruning: Unreferenced columns are never transferred over network/disk!
\`\`\`

---

## 2. Apache Parquet File Internals & Compression

An Apache Parquet file consists of self-contained **Row Groups** containing **Column Chunks** and a detailed **File Footer**:

\`\`\`
+--------------------------------------------------------------------------+
| PARQUET FILE STRUCTURE                                                   |
|                                                                          |
|  +--------------------------------------------------------------------+  |
|  | ROW GROUP 1 (e.g., 500,000 rows / 128 MB)                          |  |
|  |  - Column Chunk: 'User_ID' (Snappy compressed, Dictionary encoded) |  |
|  |  - Column Chunk: 'Revenue' (ZSTD compressed, Bit-packed)           |  |
|  +--------------------------------------------------------------------+  |
|                                                                          |
|  +--------------------------------------------------------------------+  |
|  | FILE FOOTER METADATA                                               |  |
|  |  - Schema definition                                               |  |
|  |  - Row Group 1 Stats: min_revenue=10.0, max_revenue=500.0          |  |
|  |  - Row Group 2 Stats: min_revenue=600.0, max_revenue=1200.0        |  |
|  +--------------------------------------------------------------------+  |
+--------------------------------------------------------------------------+
\`\`\`

### Predicate Pushdown (Data Skipping):
When a query executes: \`SELECT * FROM sales WHERE Revenue > 550.0\`, the query engine reads the footer metadata first. Because Row Group 1 has \`max_revenue=500.0\`, the engine completely skips reading Row Group 1 from disk, eliminating $50\\%$ of I/O!

---

## 3. High-Efficiency Encoding Algorithms

- **Dictionary Encoding:** Replaces repeating text strings (e.g., 50 US State names) with compact 1-byte integer keys.
- **Run-Length Encoding (RLE):** Compresses consecutive identical values (\`['NY', 'NY', 'NY', 'NY']\` $\\rightarrow$ \`'NY' x 4\`).
- **Bit Packing:** Stores integers using only the exact minimum number of bits required (e.g., values 0 to 3 store in 2 bits instead of 32 bits).

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/qiQR5rTSshw" title="Apache Parquet File Format Explained" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DTE-003",
      courseId: "CRS-DTE-001",
      sequence: 3,
      title: "The Open Table Format Revolution: Apache Iceberg & Delta Lake",
      description: "Master modern open table formats: ACID transactions on object storage, metadata trees, snapshots, schema evolution, time-travel, and hidden partitioning.",
      contentType: "Rich Text",
      durationMinutes: 85,
      minimumTimeMinutes: 55,
      body: `
# The Open Table Format Revolution: Apache Iceberg & Delta Lake

Before Open Table Formats, data lakes were merely directories of files. When a writer failed mid-batch, corrupted partial files remained on disk. Multiple concurrent writers corrupted table state. **Apache Iceberg** and **Delta Lake** introduce enterprise ACID transactional guarantees directly on top of raw cloud object storage.

---

## 1. Apache Iceberg Metadata Architecture

Unlike legacy Hive tables that track partitions as physical directory strings in a MySQL metastore, Iceberg tracks data files through an immutable **Tree of Metadata Snapshots**:

\`\`\`
+--------------------------------------------------------------------------+
| 1. CATALOG (Glue / REST / Hive Metastore)                                |
|    Points to Current Metadata File: s3://bucket/table/metadata/v3.json   |
+--------------------------------------------------------------------------+
                                    |
                                    v
+--------------------------------------------------------------------------+
| 2. ICEBERG METADATA FILE (v3.json)                                       |
|    - Schema, Partition Spec, History Log                                 |
|    - Current Snapshot ID: Snapshot_402                                   |
+--------------------------------------------------------------------------+
                                    |
                                    v
+--------------------------------------------------------------------------+
| 3. MANIFEST LIST (snap-402.avro)                                         |
|    Points to all Manifest Files in this snapshot + partition bounds      |
+--------------------------------------------------------------------------+
                                    |
                    +---------------+---------------+
                    |                               |
                    v                               v
+---------------------------------------+   +---------------------------------------+
| 4. MANIFEST FILE A (manifest-1.avro)  |   | MANIFEST FILE B (manifest-2.avro)     |
| List of Parquet Data Files + Col Stats|   | List of Parquet Data Files + Col Stats|
+---------------------------------------+   +---------------------------------------+
                    |                               |
                    v                               v
+-----------------------------------------------------------------------------------+
| 5. DATA FILES (Parquet files stored in S3/GCS: data/0001.parquet, 0002.parquet)   |
+-----------------------------------------------------------------------------------+
\`\`\`

---

## 2. Revolutionary Iceberg Capabilities

1. **ACID Transactions via Optimistic Concurrency Control (OCC):** Atomic commits swap the catalog pointer from \`v2.json\` to \`v3.json\`. If a concurrent write conflicts, the engine automatically retries without corrupting data.
2. **Hidden Partitioning:** Users query by date (\`WHERE event_timestamp >= '2026-10-01'\`), and Iceberg automatically calculates partition pruning without forcing users to know internal partition column names (\`date_partition=2026-10\`).
3. **Full Schema Evolution:** Rename columns, drop columns, or reorder columns without rewriting underlying Parquet files (tracked via immutable unique field IDs).
4. **Time Travel & Auditing:** Query table state as of a historical timestamp or snapshot ID:
   \`\`\`sql
   SELECT * FROM sales_lakehouse FOR SYSTEM_TIME AS OF '2026-10-25 12:00:00';
   \`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/S4A_51cR54o" title="Apache Iceberg Architecture Explained" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DTE-004",
      courseId: "CRS-DTE-001",
      sequence: 4,
      title: "Lakehouse Compaction, Optimization & Retention Operations",
      description: "Solve the Small File Problem: Bin-packing compaction, Z-Order multidimensional clustering, vacuuming expired snapshots, and data skipping statistics.",
      contentType: "Rich Text",
      durationMinutes: 80,
      minimumTimeMinutes: 50,
      body: `
# Lakehouse Compaction, Optimization & Retention Operations

Streaming ingestion pipelines continuously append tiny Parquet files every 10 seconds. Over months, tables accumulate millions of tiny 500 KB files. This **"Small File Problem"** degrades query performance exponentially due to massive metadata overhead and millions of S3 GET API calls.

---

## 1. Bin-Packing Compaction

Compaction consolidates thousands of fragmented small files into optimal **128 MB – 512 MB** Parquet files without altering table transactional state:

\`\`\`
BEFORE COMPACTION: 10,000 tiny files (100 KB each) -> 10,000 S3 GET requests, massive latency
AFTER COMPACTION:  2 optimal files (500 MB each)   -> 2 sequential reads, ultra-fast query
\`\`\`

Executing Compaction in Apache Iceberg via Spark:
\`\`\`sql
CALL system.rewrite_data_files(
  table => 'production.events',
  strategy => 'binpack',
  options => map('target-file-size-bytes', '536870912') -- 512 MB target
);
\`\`\`

---

## 2. Multi-Dimensional Data Clustering with Z-Ordering

Standard sorting orders data linearly along a single column ($X$). If a query filters on column $Y$, sorting by $X$ provides zero pruning benefits.

**Z-Order Curves** map multi-dimensional space (e.g., \`[event_date, customer_id, region]\`) into a single 1D space while preserving spatial locality:
- Allows efficient data skipping across *multiple query filter columns simultaneously*!
- Dramatically accelerates point-lookups and range queries in lakehouse engines.

---

## 3. Garbage Collection & Snapshot Expiration

Every ACID update in Iceberg and Delta Lake writes new files without immediately deleting old files (to preserve time-travel). To recover storage costs:

\`\`\`sql
-- Expire snapshots older than 7 days
CALL system.expire_snapshots(
  table => 'production.events',
  older_than => TIMESTAMP '2026-10-23 00:00:00'
);

-- Delete orphaned Parquet files unreferenced by any valid snapshot
CALL system.remove_orphan_files(table => 'production.events');
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/5a4G0kZ04rA" title="Delta Lake & Iceberg Compaction & Optimization" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DTE-005",
      courseId: "CRS-DTE-001",
      sequence: 5,
      title: "Data Modeling for Modern Warehouses & Lakehouses",
      description: "Master enterprise data modeling: Kimball Dimensional Modeling, Star/Snowflake schemas, Medallion Architecture (Bronze, Silver, Gold), and One Big Table (OBT).",
      contentType: "Rich Text",
      durationMinutes: 80,
      minimumTimeMinutes: 50,
      body: `
# Data Modeling for Modern Warehouses & Lakehouses

Without disciplined data modeling, data platforms degenerate into unmanageable "data swamps" filled with duplicate calculations, conflicting metrics, and unoptimized join operations.

---

## 1. The Medallion Architecture (Bronze $\\rightarrow$ Silver $\\rightarrow$ Gold)

\`\`\`
+-----------------------+     +-----------------------+     +-----------------------+
| BRONZE LAYER (Raw)    |     | SILVER LAYER (Clean)  |     | GOLD LAYER (Business) |
+-----------------------+     +-----------------------+     +-----------------------+
| - Append-only raw data|     | - Cleaned & validated |     | - Aggregated datamarts|
| - Exact schema fidelity|    | - Deduplicated records|     | - Kimball Star Schema |
| - Unaltered source API|     | - Enriched with joins |     | - One Big Table (OBT) |
|   payloads / CDC WAL  |     | - Conform datatypes   |     | - Power BI / Tableau  |
+-----------------------+     +-----------------------+     +-----------------------+
\`\`\`

---

## 2. Kimball Dimensional Modeling vs. One Big Table (OBT)

| Feature | Kimball Star Schema | One Big Table (OBT) |
|---|---|---|
| **Structure** | Central Fact Table surrounded by Dimension Tables | Single massively denormalized flat table |
| **Join Requirements** | Multi-table joins required at query time | **Zero joins required at query time** |
| **Storage Efficiency**| High (Normalized dimensions eliminate text repeats) | Lower (Redundant string columns repeated) |
| **Lakehouse Fit** | Traditional SQL Warehouses | **Modern Columnar Engines (BigQuery, Snowflake)** |

In modern cloud columnar engines, Parquet dictionary encoding compresses redundant strings so efficiently that the compute performance gained by eliminating table joins in **OBT** frequently outweighs normalized Star Schema architectures for dashboard queries.

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/8w5g6y6Ywz0" title="Medallion Architecture & Kimball Data Modeling" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DTE-006",
      courseId: "CRS-DTE-001",
      sequence: 6,
      title: "Modern Ingestion Patterns & Change Data Capture (CDC)",
      description: "Architect robust data ingestion: Batch extraction with backoff, Change Data Capture (CDC) via Debezium and Kafka, and database transaction log replication.",
      contentType: "Rich Text",
      durationMinutes: 80,
      minimumTimeMinutes: 50,
      body: `
# Modern Ingestion Patterns & Change Data Capture (CDC)

Extracting data from operational transactional databases (PostgreSQL, MySQL, Oracle) using periodic SQL queries (\`SELECT * FROM orders WHERE updated_at > last_sync\`) introduces severe production risks: table lock contention, performance degradation on operational systems, and missed deleted records.

---

## 1. Log-Based Change Data Capture (CDC) with Debezium

Log-based CDC bypasses the database SQL query execution engine entirely. It reads the database's internal **Write-Ahead Log (WAL / Binary Log)** directly:

\`\`\`
+-----------------------+     Writes row edit     +-----------------------+
| OLTP APPLICATION      | ----------------------> | PostgreSQL / MySQL    |
+-----------------------+                         | Write-Ahead Log (WAL) |
                                                  +-----------------------+
                                                              |
                                                    Tails log asynchronously
                                                              v
+-----------------------+     Publishes events    +-----------------------+
| Apache Kafka Topic    | <---------------------- | Debezium Connector    |
| (JSON / Avro events)  |                         | (Kafka Connect)       |
+-----------------------+                         +-----------------------+
            |
            v
[ Apache Iceberg / Delta Lakehouse Bronze Table ]
\`\`\`

### Why Log-Based CDC is Superior:
1. **Zero Database Query Overhead:** Reads raw disk log bytes without running SQL query threads on the production database.
2. **Captures Deletes:** Standard SQL polling cannot detect deleted rows; CDC logs \`"op": "d"\` tombstone events.
3. **Sub-Second Latency:** Every insert, update, and delete is streamed into Kafka within milliseconds.

---

## 2. Debezium CDC Event Structure

\`\`\`json
{
  "before": { "order_id": 1042, "status": "PENDING", "amount": 120.0 },
  "after":  { "order_id": 1042, "status": "SHIPPED", "amount": 120.0 },
  "source": { "version": "2.5.0", "db": "ecommerce", "table": "orders", "ts_ms": 1730291400000 },
  "op": "u",
  "ts_ms": 1730291400150
}
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/5U_7L5jUu7o" title="Change Data Capture (CDC) with Debezium & Kafka" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DTE-007",
      courseId: "CRS-DTE-001",
      sequence: 7,
      title: "Data Quality Foundations & Schema Enforcement",
      description: "Implement data quality gates: Schema-on-read vs Schema-on-write, handling schema drift, Dead-Letter Queues (DLQ), and automated Great Expectations audits.",
      contentType: "Rich Text",
      durationMinutes: 75,
      minimumTimeMinutes: 45,
      body: `
# Data Quality Foundations & Schema Enforcement

In production data engineering, data contracts must be enforced at the ingestion perimeter. Malformed records, swapped column types, and unannounced upstream schema modifications must be quarantined before polluting downstream data lakes.

---

## 1. Dead-Letter Queue (DLQ) & Quarantine Pattern

\`\`\`
INCOMING EVENT STREAM ---> SCHEMA VALIDATION GATE ---> VALID? ---> BRONZE TABLE
                                    |
                                    +---> INVALID? ---> DEAD-LETTER QUEUE (DLQ)
                                                        (Quarantine S3 Bucket)
                                                                  |
                                                        Alerts Data Ops Team
\`\`\`

---

## 2. Schema Evolution vs. Schema Enforcement

- **Schema Enforcement:** Prevents bad data from polluting tables by rejecting inserts that don't match the table schema.
- **Schema Evolution (Automatic Schema Updates):** Safely accommodates legitimate backwards-compatible upstream additions (e.g., new nullable columns) without breaking pipelines.

---

## 3. Automated Great Expectations Quality Checkpoint

\`\`\`python
import great_expectations as gx

context = gx.get_context()
validator = context.sources.pandas_default.read_parquet("data/silver/orders.parquet")

validator.expect_column_values_to_not_be_null("order_id")
validator.expect_column_values_to_be_unique("order_id")
validator.expect_column_values_to_be_between("amount", min_value=0.01, max_value=100000.0)
validator.expect_column_distinct_values_to_be_in_set("status", ["PENDING", "PAID", "SHIPPED", "CANCELLED"])

results = validator.validate()
if not results.success:
    raise ValueError("Silver dataset data quality validation failed!")
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/14QWn0rUv_U" title="Data Quality & Schema Governance in Data Engineering" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
  ],
  assessments: [
    {
      id: "ASM-DTE-001",
      courseId: "CRS-DTE-001",
      chapterId: "CH-DTE-001",
      title: "Data Engineering Foundations & Architecture Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DTE-001",
          type: "MCQ",
          prompt: "What is the primary architectural differentiator of a modern Lakehouse compared to a legacy Data Lake?",
          options: [
            "A Lakehouse implements open table formats (Iceberg, Delta Lake) providing ACID transactions, time-travel, and fast SQL performance directly over low-cost object storage",
            "A Lakehouse runs exclusively on physical bare-metal hardware",
            "A Lakehouse does not support unstructured data",
            "A Lakehouse eliminates the need for SQL queries"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-002",
          type: "MCQ",
          prompt: "Why has modern cloud data engineering shifted from ETL to ELT?",
          options: [
            "Cloud warehouses separate storage from compute, allowing raw data to be loaded immediately and transformed scalably using SQL/dbt within the warehouse engine",
            "ETL is illegal under international copyright law",
            "ELT runs on personal laptops without cloud connectivity",
            "ETL cannot process structured CSV files"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-003",
          type: "MCQ",
          prompt: "What is the primary operational flaw of the classic Lambda Architecture?",
          options: [
            "Maintaining two separate codebases and execution engines (batch layer and speed layer) causes business logic drift and high maintenance overhead",
            "It cannot process streaming events",
            "It requires three separate cloud providers",
            "It only works with Python 2.7"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-004",
          type: "MCQ",
          prompt: "How does the Kappa Architecture solve the dual-codebase problem of the Lambda Architecture?",
          options: [
            "By processing all data through a single stream-first processing engine (e.g., Apache Flink or Kafka Streams) for both real-time events and historical replays",
            "By eliminating the data warehouse entirely",
            "By converting all data into text files",
            "By running batch jobs every 10 seconds"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-005",
          type: "MCQ",
          prompt: "What is 'Schema-on-Read' versus 'Schema-on-Write'?",
          options: [
            "Schema-on-Write enforces data structure upon ingestion; Schema-on-Read stores raw data without validation, applying schema interpretation only when querying",
            "Schema-on-Read is for SQL; Schema-on-Write is for NoSQL",
            "Schema-on-Write only works on mobile devices",
            "There is no difference; they are aliases"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-006",
          type: "MCQ",
          prompt: "What is a 'Data Swamp' in data lake engineering?",
          options: [
            "An unorganized, uncataloged, and ungoverned data lake filled with stale, duplicated, or corrupt data files that users cannot trust or find",
            "A flooded datacenter basement",
            "A database that runs out of electricity",
            "A software bug in the Linux kernel"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-007",
          type: "MCQ",
          prompt: "What is the primary characteristic of an OLAP (Online Analytical Processing) system compared to an OLTP system?",
          options: [
            "OLAP is optimized for high-throughput, complex analytical aggregate queries scanning millions of historical rows; OLTP is optimized for low-latency row-level transactions",
            "OLAP runs on smartphones; OLTP runs on mainframes",
            "OLAP does not support numbers",
            "OLTP only stores JSON data"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-008",
          type: "MCQ",
          prompt: "In modern data architecture, what is meant by 'Separation of Storage and Compute'?",
          options: [
            "Storage scales independently in low-cost object stores (S3/GCS), while compute clusters spin up dynamically on-demand and scale down to zero when idle",
            "Keeping physical hard drives in a different building than CPUs",
            "Storing data on paper instead of computers",
            "Running databases on separate operating systems"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-009",
          type: "MCQ",
          prompt: "What is 'Data Ingestion Latency'?",
          options: [
            "The time elapsed between when an event occurs in the source operational system and when it becomes queryable in the analytical storage system",
            "The time it takes to reboot the database",
            "The time a developer spends typing code",
            "The physical network ping between servers"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-010",
          type: "MCQ",
          prompt: "What is a Data Contract in data engineering?",
          options: [
            "An explicit, versioned agreement between software engineering producers and data engineering consumers defining schema, SLA, semantics, and quality standards",
            "A legal employment contract signed by data engineers",
            "An invoice paid to cloud providers",
            "A warranty on hard drive hardware"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DTE-002",
      courseId: "CRS-DTE-001",
      chapterId: "CH-DTE-002",
      title: "Distributed Storage & Columnar File Formats Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DTE-011",
          type: "MCQ",
          prompt: "Why is Apache Parquet significantly faster than CSV for analytical SQL aggregation queries?",
          options: [
            "Parquet is columnar: engines read only the specific columns needed by the query (column pruning) and leverage row group min/max statistics (predicate pushdown)",
            "Parquet files are written in assembly code",
            "CSV files are encrypted by default",
            "Parquet runs on the GPU"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-012",
          type: "MCQ",
          prompt: "What is 'Predicate Pushdown' in Parquet query execution?",
          options: [
            "Query engines use min/max column statistics stored in Parquet footers to completely skip reading entire row groups that cannot match the SQL WHERE clause",
            "Pushing queries to remote datacenters",
            "Translating SQL into Python",
            "Deleting filtered rows permanently"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-013",
          type: "MCQ",
          prompt: "What is 'Dictionary Encoding' in columnar file compression?",
          options: [
            "Building a table of unique string values and replacing occurrences in the data with small integer keys, drastically reducing file size",
            "Translating column names into English",
            "Looking up words in an Oxford dictionary",
            "Sorting rows alphabetically"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-014",
          type: "MCQ",
          prompt: "What is the typical default Row Group size in Apache Parquet files for optimal I/O throughput?",
          options: ["128 MB to 512 MB", "4 KB", "10 GB", "1 MB"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-015",
          type: "MCQ",
          prompt: "What file format is row-oriented and standard for streaming serialization with Apache Kafka due to compact binary encoding and schema evolution support?",
          options: ["Apache Avro", "Apache Parquet", "CSV", "HTML"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-016",
          type: "MCQ",
          prompt: "What is 'Run-Length Encoding' (RLE)?",
          options: [
            "A compression technique that replaces repeated consecutive values with the value and its repetition count (e.g., 'CA, CA, CA' -> 'CA x 3')",
            "Measuring how far an athlete runs in miles",
            "Encoding text into Morse code",
            "A method for sorting numbers"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-017",
          type: "MCQ",
          prompt: "What consistency model does Amazon S3 provide for PUT and DELETE operations as of late 2020?",
          options: [
            "Strong read-after-write consistency for all applications with zero latency penalty",
            "Eventual consistency only",
            "Inconsistent reads for 24 hours",
            "Manual consistency requiring API polling"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-018",
          type: "MCQ",
          prompt: "Where is structural metadata stored inside an Apache Parquet file?",
          options: [
            "In the File Footer at the end of the file, allowing engines to read metadata with a single range-GET request before parsing data",
            "In the first 10 bytes of the header",
            "In a separate .txt file",
            "In browser cookies"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-019",
          type: "MCQ",
          prompt: "What compression codec is widely preferred as the default for Parquet due to its high decompression speed and modest CPU overhead?",
          options: ["Snappy (or ZSTD)", "Bzip2", "Tar", "7zip"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-020",
          type: "MCQ",
          prompt: "What is 'Column Pruning' during SQL execution?",
          options: [
            "The query engine reads and loads only the specific columns requested in the SELECT statement, ignoring unreferenced columns completely",
            "Deleting unused columns from database tables",
            "Renaming columns with short names",
            "Formatting columns as dates"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DTE-003",
      courseId: "CRS-DTE-001",
      chapterId: "CH-DTE-003",
      title: "Apache Iceberg & Delta Lake Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DTE-021",
          type: "MCQ",
          prompt: "How does Apache Iceberg achieve ACID transactions on cloud object storage like Amazon S3?",
          options: [
            "Using an immutable metadata tree where atomic snapshot swaps commit state changes via Optimistic Concurrency Control (OCC)",
            "By locking physical hard drives in the server rack",
            "By holding open a single database connection forever",
            "Iceberg does not support ACID transactions"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-022",
          type: "MCQ",
          prompt: "What is 'Hidden Partitioning' in Apache Iceberg?",
          options: [
            "Iceberg handles partition transformations (e.g., date(timestamp), bucket(id)) under the hood; users query original columns without needing to specify partition columns explicitly",
            "Hiding partition folders with password protection",
            "Encrypting partition names with AES",
            "Deleting partitions after 24 hours"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-023",
          type: "MCQ",
          prompt: "What is a 'Manifest List' in the Apache Iceberg metadata hierarchy?",
          options: [
            "An Avro file snapshot that lists all manifest files comprising a specific table snapshot, along with summary statistics and partition bounds for each manifest",
            "A list of employees who have read permissions",
            "A text file containing SQL queries",
            "A shipping manifest for datacenter hardware"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-024",
          type: "MCQ",
          prompt: "What feature in Delta Lake and Iceberg enables users to query historical versions of a table ('as of' a specific timestamp)?",
          options: ["Time Travel", "Future Prediction", "Schema Inversion", "Data Replay"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-025",
          type: "MCQ",
          prompt: "How does Apache Iceberg handle full schema evolution (adding, dropping, renaming columns)?",
          options: [
            "By assigning immutable unique integer IDs to every column, tracking columns independently of names or positions without rewriting Parquet data files",
            "By deleting the table and recreating it",
            "By rewriting all historical Parquet files on S3",
            "By asking the database administrator for permission"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-026",
          type: "MCQ",
          prompt: "What is the transaction log mechanism used by Delta Lake to guarantee ACID operations?",
          options: [
            "The Delta Log (_delta_log): an ordered sequence of JSON commit files checkpointed periodically with Parquet summaries",
            "A SQLite database file on the driver",
            "A text file in /tmp",
            "An email sent to the data team"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-027",
          type: "MCQ",
          prompt: "What is Optimistic Concurrency Control (OCC)?",
          options: [
            "A concurrency control method where writers proceed without locking; before committing, the engine checks for conflicting changes and retries if another writer committed first",
            "Assuming that all queries will succeed without testing",
            "Locking all tables for 24 hours",
            "A protocol that disables concurrent writes"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-028",
          type: "MCQ",
          prompt: "What catalog backends can manage table pointers for Apache Iceberg?",
          options: [
            "AWS Glue Data Catalog, Project Nessie, Iceberg REST Catalog, Hive Metastore, and JDBC Catalogs",
            "Only MySQL",
            "Only Google Sheets",
            "Only local text files"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-029",
          type: "MCQ",
          prompt: "What is 'Copy-on-Write' (CoW) versus 'Merge-on-Read' (MoR) in table format update modes?",
          options: [
            "CoW rewrites the entire data file upon any row update; MoR writes compact positional delete files, deferring the merge until query time to achieve faster write performance",
            "CoW runs on CPUs; MoR runs on GPUs",
            "MoR is for streaming; CoW is for batch only",
            "There is no difference; they are aliases"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-030",
          type: "MCQ",
          prompt: "Why does Iceberg eliminate the classic Hive Metastore bottleneck in petabyte-scale data lakes?",
          options: [
            "Iceberg metadata is stored in files on object storage; queries read metadata in parallel via compute nodes rather than overloading a centralized RDBMS metastore",
            "Iceberg deletes the metadata",
            "Iceberg uses 100 MySQL servers",
            "Iceberg does not support petabyte scales"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DTE-004",
      courseId: "CRS-DTE-001",
      chapterId: "CH-DTE-004",
      title: "Lakehouse Compaction & Optimization Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DTE-031",
          type: "MCQ",
          prompt: "What causes the 'Small File Problem' in lakehouse architectures?",
          options: [
            "Continuous streaming ingestion or fragmented micro-batch writes creating millions of tiny (< 1 MB) files, causing massive metadata overhead and S3 API latency",
            "Hard drives running out of physical sectors",
            "A bug in the Parquet compression algorithm",
            "Network cables operating at 10 Mbps"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-032",
          type: "MCQ",
          prompt: "How does Bin-Packing Compaction resolve the small file problem?",
          options: [
            "It reads thousands of fragmented small files and rewrites them into optimal (128 MB - 512 MB) Parquet files atomically without changing table contents",
            "It deletes small files permanently",
            "It renames small files with short names",
            "It compresses files into zip archives"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-033",
          type: "MCQ",
          prompt: "What is Z-Order Clustering (Multidimensional Clustering)?",
          options: [
            "An algorithm that maps multidimensional data into a 1D space along a space-filling curve, enabling efficient data skipping across multiple query filter columns simultaneously",
            "Sorting rows in reverse alphabetical order (Z to A)",
            "A compression codec developed by Google",
            "A sorting method used exclusively for numbers"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-034",
          type: "MCQ",
          prompt: "What is the purpose of the 'VACUUM' command in Delta Lake?",
          options: [
            "It permanently deletes data files that are no longer referenced by the current table state and are older than the retention threshold (default: 7 days)",
            "It cleans physical dust from server motherboards",
            "It clears browser cache",
            "It defragments the host operating system drive"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-035",
          type: "MCQ",
          prompt: "What is the consequence of running VACUUM with a retention threshold of 0 hours in Delta Lake?",
          options: [
            "It deletes all historical data files immediately, breaking time-travel queries and potentially failing active concurrent write transactions",
            "It doubles table query speed",
            "It reboots the cloud cluster",
            "It formats the AWS S3 bucket"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-036",
          type: "MCQ",
          prompt: "What procedure in Apache Iceberg expires old snapshots and deletes unneeded metadata files?",
          options: ["system.expire_snapshots()", "system.vacuum_table()", "ALTER TABLE DROP SNAPSHOTS", "iceberg.purge_old()"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-037",
          type: "MCQ",
          prompt: "What are 'Orphan Files' in a lakehouse data directory?",
          options: [
            "Files present in the storage bucket that are not referenced by any valid table metadata snapshot (often left behind by failed or aborted write jobs)",
            "Files created by deleted user accounts",
            "Files with zero byte length",
            "Files stored in /tmp"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-038",
          type: "MCQ",
          prompt: "How does Z-Ordering differ from standard linear multi-column sorting (e.g., 'ORDER BY colA, colB')?",
          options: [
            "Linear sorting prioritizes colA, leaving colB disorganized for queries filtering on colB alone; Z-ordering clusters both columns with equal priority",
            "Linear sorting only works on numbers; Z-ordering works on text",
            "Z-ordering can only be used on 2 columns maximum",
            "Linear sorting is twice as fast"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-039",
          type: "MCQ",
          prompt: "Why should compaction jobs be scheduled during off-peak hours in production?",
          options: [
            "Compaction reads and rewrites gigabytes of data, consuming significant compute and memory that could compete with production analytical workloads",
            "Because cloud object storage is closed at night",
            "Because compaction can only execute on weekends",
            "To prevent the server from overheating"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-040",
          type: "MCQ",
          prompt: "What target Parquet file size is recommended for optimal balance between query parallelism and small-file metadata overhead in Iceberg/Delta?",
          options: ["128 MB to 512 MB", "1 KB", "10 MB", "10 GB"],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DTE-005",
      courseId: "CRS-DTE-001",
      chapterId: "CH-DTE-005",
      title: "Data Modeling for Lakehouses Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DTE-041",
          type: "MCQ",
          prompt: "In the Medallion Architecture, what data is stored in the 'Bronze' layer?",
          options: [
            "Raw, append-only, unfiltered data ingested directly from source operational systems in its original schema and fidelity",
            "Aggregated KPI metrics for executive dashboards",
            "Cleaned, deduplicated relational tables",
            "Machine learning model weights"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-042",
          type: "MCQ",
          prompt: "What transformations occur between the Bronze layer and the 'Silver' layer?",
          options: [
            "Data cleaning, schema conformance, deduplication, type casting, filtering corrupt records, and enriching with dimension lookups",
            "Exporting data to Excel spreadsheets",
            "Printing data on paper",
            "Encrypting data with user passwords"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-043",
          type: "MCQ",
          prompt: "What is the primary role of the 'Gold' layer in the Medallion Architecture?",
          options: [
            "Curated, business-level aggregated datamarts organized in Star schemas or One Big Table (OBT) optimized for BI reporting and analytics",
            "Storing raw uncompressed JSON logs",
            "Backing up the operating system",
            "Hosting public static websites"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-044",
          type: "MCQ",
          prompt: "What is a 'Fact Table' in Kimball Dimensional Modeling?",
          options: [
            "A central table containing numerical measurements, metrics, and foreign keys referencing surrounding dimension tables (e.g., sales revenue, quantities)",
            "A table containing factual historical trivia",
            "A table storing employee contact information",
            "A list of database table names"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-045",
          type: "MCQ",
          prompt: "What is a 'Dimension Table' in Kimball modeling?",
          options: [
            "A table providing textual descriptive context and attributes surrounding business processes (e.g., customer details, product categories, store locations)",
            "A table measuring the physical length and width of servers",
            "A table storing mathematical equations",
            "A table that holds temporary variables"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-046",
          type: "MCQ",
          prompt: "What is a Slowly Changing Dimension Type 2 (SCD Type 2)?",
          options: [
            "Tracking historical changes by inserting a new record with effective start/end timestamps and an active flag whenever an attribute changes",
            "Overwriting the old attribute value in-place without preserving history",
            "Adding a new column for every update",
            "Deleting the customer record"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-047",
          type: "MCQ",
          prompt: "Why is 'One Big Table' (OBT) increasingly popular in modern cloud data warehouses (BigQuery, Snowflake)?",
          options: [
            "Columnar storage and dictionary encoding compress repeating data efficiently, eliminating expensive join operations and accelerating dashboard queries",
            "Because cloud warehouses cannot execute JOIN statements",
            "Because OBT takes 10x less disk space than normalized tables",
            "OBT is mandated by SQL standards"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-048",
          type: "MCQ",
          prompt: "What is a Surrogate Key in dimensional modeling?",
          options: [
            "An artificially generated unique integer (or hash) assigned as a primary key to decouple warehouse tables from natural operational system keys",
            "A backup password for the database",
            "A private SSH key",
            "A secondary IP address"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-049",
          type: "MCQ",
          prompt: "What is a 'Conformed Dimension' in Kimball enterprise architecture?",
          options: [
            "A single, standardized dimension table (e.g., Date or Customer) shared across multiple disparate business processes and fact tables",
            "A dimension table that conforms to PEP8 guidelines",
            "A table that cannot be modified",
            "A dimension table with exactly 100 rows"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-050",
          type: "MCQ",
          prompt: "What is a 'Degenerate Dimension' in dimensional modeling?",
          options: [
            "A dimension attribute (such as an invoice number or order ID) stored directly in the fact table without a separate dimension table",
            "A corrupt dimension table with missing data",
            "A dimension table that causes query syntax errors",
            "A dimension table with no primary key"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DTE-006",
      courseId: "CRS-DTE-001",
      chapterId: "CH-DTE-006",
      title: "Modern Ingestion Patterns & CDC Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DTE-051",
          type: "MCQ",
          prompt: "What is Change Data Capture (CDC)?",
          options: [
            "A pattern for identifying, capturing, and streaming row-level mutations (inserts, updates, deletes) in a source database as they occur in real time",
            "A method for tracking software bugs in Jira",
            "A tool for taking webcam screenshots",
            "A git commit tracking utility"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-052",
          type: "MCQ",
          prompt: "Why is log-based CDC (e.g., Debezium) superior to periodic query polling ('SELECT WHERE updated_at > ...')?",
          options: [
            "It reads the database transaction log (WAL/Binlog) directly without running SQL query threads on the database, capturing all deletes and minimizing performance impact",
            "It runs on personal mobile phones",
            "It turns relational databases into NoSQL databases",
            "It does not require database permissions"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-053",
          type: "MCQ",
          prompt: "What is a 'Tombstone Record' in event streaming CDC?",
          options: [
            "A message published with a null payload indicating that the corresponding key/row has been deleted in the source database",
            "A corrupt record that crashes the consumer",
            "A record that expired after 30 days",
            "A database backup file"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-054",
          type: "MCQ",
          prompt: "What is the Write-Ahead Log (WAL) in PostgreSQL?",
          options: [
            "An append-only log file on disk recording all data modifications before they are committed to data pages, ensuring durability and crash recovery",
            "A text file where users write notes",
            "A list of upcoming software features",
            "A firewall configuration file"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-055",
          type: "MCQ",
          prompt: "What open-source framework is the de-facto industry standard for distributed log-based CDC running on Kafka Connect?",
          options: ["Debezium", "Apache Airflow", "dbt Core", "Terraform"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-056",
          type: "MCQ",
          prompt: "What is 'Backpressure' in high-volume streaming data ingestion?",
          options: [
            "A protective mechanism where downstream consumer components signal upstream producers to slow down ingestion when processing buffers become saturated",
            "Air pressure inside a cooling fan",
            "A network switch hardware error",
            "A database deadlock exception"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-057",
          type: "MCQ",
          prompt: "How does Debezium handle initial snapshotting when attached to an existing database table with 100 million rows?",
          options: [
            "It performs an initial consistent snapshot read of all existing table rows before seamlessly transitioning to streaming incremental WAL change events",
            "It deletes all 100 million rows and starts empty",
            "It crashes with an out-of-memory error",
            "It skips existing rows and only streams future changes"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-058",
          type: "MCQ",
          prompt: "Why is exponential backoff with jitter critical when extracting data from third-party REST APIs?",
          options: [
            "To prevent API rate-limit exhaustion (HTTP 429) and avoid retry storms that overwhelm external API endpoints during service degradation",
            "To speed up HTTP downloads by 10x",
            "Because Python requests library requires it",
            "To encrypt network traffic with TLS"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-059",
          type: "MCQ",
          prompt: "What database feature in MySQL is utilized by Debezium to stream transaction logs?",
          options: ["The MySQL Binary Log (binlog)", "The slow query log", "The error log", "The general query log"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-060",
          type: "MCQ",
          prompt: "What is 'At-Least-Once' ingestion semantics?",
          options: [
            "Every source event is guaranteed to be delivered and processed at least once, but duplicate records may occur under network failures, requiring deduplication",
            "Data is delivered exactly once with zero duplicates",
            "Data is delivered only on Tuesdays",
            "Data is never guaranteed to be delivered"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DTE-007",
      courseId: "CRS-DTE-001",
      chapterId: "CH-DTE-007",
      title: "Data Quality & Schema Enforcement Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DTE-061",
          type: "MCQ",
          prompt: "What is a Dead-Letter Queue (DLQ) in an ingestion data pipeline?",
          options: [
            "A dedicated quarantine topic or storage directory where malformed, unparseable, or schema-violating records are routed for triage without halting the entire pipeline",
            "A queue for deleted user emails",
            "A queue where cancelled print jobs are stored",
            "A hardware component in network routers"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-062",
          type: "MCQ",
          prompt: "What is 'Schema Drift'?",
          options: [
            "Unexpected changes to upstream source data schemas (e.g., renamed fields, newly added columns, altered data types) that cause downstream pipeline failures",
            "Moving databases between cloud providers",
            "The physical movement of data across network cables",
            "An update to the operating system version"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-063",
          type: "MCQ",
          prompt: "What is the primary difference between Schema Enforcement and Schema Evolution in Delta Lake?",
          options: [
            "Schema Enforcement rejects inserts containing unexpected columns or type mismatches; Schema Evolution automatically adds new nullable columns to the table schema when declared",
            "Schema Enforcement is for Python; Schema Evolution is for Scala",
            "Schema Enforcement deletes the table upon error",
            "There is no difference; they are aliases"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-064",
          type: "MCQ",
          prompt: "What open-source Python framework allows defining declarative data tests as 'Expectation Suites' for data pipelines?",
          options: ["Great Expectations", "PyTest classic", "NumPy", "Selenium"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-065",
          type: "MCQ",
          prompt: "What data quality expectation asserts that an integer column must never contain values outside the range 1 to 100?",
          options: [
            "expect_column_values_to_be_between('score', min_value=1, max_value=100)",
            "expect_range('score', 1, 100)",
            "assert score in range(1, 100)",
            "verify_column('score', between=[1, 100])"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-066",
          type: "MCQ",
          prompt: "What is 'Data Freshness' (SLA) in data pipeline monitoring?",
          options: [
            "The measure of how recently a dataset was updated relative to the current wall-clock time (e.g., asserting table is updated at least once every 6 hours)",
            "The physical temperature of the server",
            "The age of the data engineer",
            "Whether the dataset contains modern terms"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-067",
          type: "MCQ",
          prompt: "What is 'Shift-Left' Data Quality?",
          options: [
            "Validating and enforcing data quality contracts as early as possible in the lifecycle (at source generation and ingestion) rather than discovering errors in executive dashboards",
            "Moving data to datacenters on the west coast",
            "Aligning text to the left margin in reports",
            "Writing code using the left hand"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-068",
          type: "MCQ",
          prompt: "Why should duplicate records be quarantined or deduplicated in the Silver layer rather than the Gold layer?",
          options: [
            "To prevent duplicate records from inflating metric calculations across multiple downstream business Gold datamarts and machine learning pipelines",
            "Because the Gold layer cannot execute SQL queries",
            "Because deduplication is free in the Silver layer",
            "Because the Silver layer is stored in RAM"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-069",
          type: "MCQ",
          prompt: "What is an 'Uniqueness Constraint' in modern data lakehouses?",
          options: [
            "Asserting that a primary key column (such as customer_id) contains no duplicate values across rows",
            "Requiring every column to have a unique name",
            "Restricting table access to one user",
            "Encrypting data with unique keys"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DTE-070",
          type: "MCQ",
          prompt: "What action should an automated pipeline take if a critical data quality checkpoint fails in the Silver layer?",
          options: [
            "Abort downstream Gold aggregations, preserve the execution state, and dispatch an immediate alert to the data engineering on-call channel",
            "Delete the entire database",
            "Deploy the corrupted data to production dashboards",
            "Ignore the error and mark the job as success"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
  ],
};

