// Course 10: Data Engineer - Phase 2 (Chapters 8-14, Assessments 8-14)
// Apache Spark Architecture, PySpark DataFrames, Memory Management, Joins, Windowing & Structured Streaming

export const phase2 = {
  chapters: [
    {
      id: "CH-DTE-008",
      courseId: "CRS-DTE-001",
      sequence: 8,
      title: "Apache Spark Architecture & Distributed Execution Model",
      description: "Deep dive into Spark's master-worker distributed architecture: Driver process, Cluster Managers (K8s/YARN/Standalone), Executors, Slots, Catalyst Optimizer, and Tungsten Engine.",
      contentType: "Rich Text",
      durationMinutes: 75,
      minimumTimeMinutes: 45,
      body: `
# Apache Spark Architecture & Distributed Execution Model

Apache Spark is a unified analytics engine for large-scale data processing that scales from single-node laptops to thousand-node clusters processing petabytes of data.

---

## 1. Master-Worker Architecture

Spark follows a master/worker distributed computing topology:

\`\`\`
+---------------------------------------------------------------------------------+
|                                 DRIVER PROGRAM                                  |
|  +---------------------------------------------------------------------------+  |
|  |  SparkSession / SparkContext (Entry Point)                                |  |
|  |  DAGScheduler (splits stages by shuffle boundaries)                       |  |
|  |  TaskScheduler (launches tasks across cluster worker slots)               |  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------+-----------------------------------------+
                                        |
                             [ Cluster Manager ]
                    (Kubernetes, YARN, or Standalone)
                                        |
           +----------------------------+----------------------------+
           |                                                         |
           v                                                         v
+-----------------------+                                 +-----------------------+
| WORKER NODE 1         |                                 | WORKER NODE 2         |
|  +-----------------+  |                                 |  +-----------------+  |
|  | EXECUTOR (JVM)  |  |                                 |  | EXECUTOR (JVM)  |  |
|  | [Slot1] [Slot2] |  |                                 |  | [Slot1] [Slot2] |  |
|  | BlockManager    |  |                                 |  | BlockManager    |  |
|  +-----------------+  |                                 |  +-----------------+  |
+-----------------------+                                 +-----------------------+
\`\`\`

### Key Components:
1. **Driver:**
   - Translates user code into a Directed Acyclic Graph (DAG) of execution stages.
   - Schedules tasks across executors and tracks task completion.
   - Coordinates metadata and collects results for actions (e.g., \`df.collect()\`).
2. **Cluster Manager:**
   - Allocates cluster hardware resources (CPU, RAM). Spark supports Kubernetes (native k8s scheduler), YARN (Hadoop ecosystem), and standalone Spark master.
3. **Executors:**
   - JVM processes spawned on worker nodes.
   - Execute tasks in worker threads (slots) and keep in-memory data cached across operations.
   - Run a \`BlockManager\` that manages storage and shuffle partitions.

---

## 2. Catalyst Optimizer & Project Tungsten

Spark SQL and DataFrame operations achieve near bare-metal C++ speed thanks to two foundational compiler engines:

\`\`\`
[ User PySpark / SQL Code ]
             |
             v
   1. Unresolved Logical Plan (verifies syntax)
             |  Catalog / Metastore Resolution
             v
   2. Resolved Logical Plan (validates column names & data types)
             |  Optimization Rules (Predicate Pushdown, Projection Pruning)
             v
   3. Optimized Logical Plan
             |  Physical Planning (e.g., chooses Broadcast vs Sort-Merge Join)
             v
   4. Cost-Based Model (Cost Evaluation)
             |
             v
   5. Selected Physical Plan
             |  Tungsten Whole-Stage Code Generation (Java Bytecode)
             v
       [ EXECUTABLE RDD TASKS ON JVM EXECUTORS ]
\`\`\`

### Catalyst Optimization Rules:
- **Predicate Pushdown:** Filters (\`WHERE age > 21\`) are pushed directly to storage readers (e.g., Parquet metadata or Iceberg manifest) so non-matching row groups are never read off disk.
- **Projection Pruning:** Only referenced columns are deserialized from columnar storage.
- **Constant Folding:** Expressions like \`1 + 1\` are evaluated at compile time rather than per row.

### Project Tungsten:
- **Off-Heap Memory Management:** Allocates memory directly using \`sun.misc.Unsafe\` in contiguous binary format, eliminating JVM Garbage Collection (GC) pauses and object overhead.
- **Cache-Aware Computation:** Designs algorithms and data layouts that maximize CPU L1/L2/L3 cache line hits.
- **Whole-Stage Code Generation:** Synthesizes the entire pipeline of query operators into a single tight bytecode loop, avoiding virtual function call overheads.

---

## 3. Stages, Tasks, and Shuffles

Spark divides query DAGs into **Stages** based on shuffle boundaries:
- **Narrow Dependency (Pipelines within Stage):** Each partition of the parent RDD/DataFrame is used by at most one partition of the child (e.g., \`map\`, \`filter\`). No network transfer needed.
- **Wide Dependency (Shuffle Boundary):** Multiple child partitions depend on data from parent partitions (e.g., \`groupByKey\`, \`join\`, \`distinct\`). Requires all executors to write shuffle files to local disk and fetch partitions over the network.

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/fD_c_XG_Zio" title="Apache Spark Architecture Explained" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `
    },
    {
      id: "CH-DTE-009",
      courseId: "CRS-DTE-001",
      sequence: 9,
      title: "PySpark DataFrame API & Lazy Evaluation",
      description: "Master PySpark DataFrame transformations vs actions, lazy evaluation mechanics, execution plan inspection via explain(), and best practices for resilient pipeline construction.",
      contentType: "Rich Text",
      durationMinutes: 75,
      minimumTimeMinutes: 45,
      body: `
# PySpark DataFrame API & Lazy Evaluation

The DataFrame API provides a distributed collection of data organized into named columns, analogous to a relational table or Pandas DataFrame, but executed lazily across a distributed cluster.

---

## 1. Transformations vs. Actions

Understanding the distinction between lazy transformations and eager actions is critical for Spark performance:

\`\`\`
[ Transformations (Lazy) ]                        [ Actions (Eager) ]
Does NOT trigger execution.                       Triggers DAG compilation
Builds execution plan.                            and cluster task execution.
- select(), withColumn()                         - count(), collect()
- filter(), where()                              - write.save(), write.parquet()
- groupBy(), join()                              - show(), first(), take()
- drop(), distinct()                             - foreach(), reduce()
\`\`\`

### Lazy Evaluation Advantage:
Because transformations are lazy, Spark does not execute operations row-by-row as written. Instead, the Catalyst Optimizer inspects the entire query graph, merges multiple transformations into a single stage, and prunes unused columns before touching physical storage.

---

## 2. Practical PySpark Pipeline Example

\`\`\`python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, when, upper, current_timestamp

# Initialize SparkSession with optimized configuration
spark = SparkSession.builder \\
    .appName("CustomerOrdersETL") \\
    .config("spark.sql.shuffle.partitions", "200") \\
    .config("spark.sql.adaptive.enabled", "true") \\
    .getOrCreate()

# Read raw bronze orders
orders_df = spark.read.format("parquet") \\
    .load("s3://datalake-bronze/orders/")

# Transformations: Chained lazily (zero I/O happens here)
silver_df = orders_df \\
    .filter(col("status").isin(["COMPLETED", "SHIPPED"])) \\
    .withColumn("customer_region", upper(col("billing_country"))) \\
    .withColumn("order_tier", 
        when(col("total_amount") >= 500, "HIGH")
        .when(col("total_amount") >= 100, "MEDIUM")
        .otherwise("LOW")
    ) \\
    .withColumn("processed_at", current_timestamp())

# Action: write out silver table (Catalyst plans and executes physical tasks)
silver_df.write \\
    .format("iceberg") \\
    .mode("append") \\
    .save("glue_catalog.silver.customer_orders")
\`\`\`

---

## 3. Inspecting Execution Plans with \`explain()\`

To debug query performance, inspect Spark's physical plan using \`explain(mode="formatted")\`:

\`\`\`python
silver_df.explain(mode="formatted")
\`\`\`

\`\`\`
== Physical Plan ==
*Project [order_id#10, total_amount#12, CASE WHEN ... END AS order_tier#45, current_timestamp() AS processed_at#46]
+- *Filter (isnotnull(status#11) AND status#11 IN (COMPLETED,SHIPPED))
   +- *BatchScan[order_id#10, status#11, total_amount#12, billing_country#13] 
      ParquetScan Location: s3://datalake-bronze/orders, 
      PartitionFilters: [], 
      PushedFilters: [In(status, [COMPLETED, SHIPPED]), IsNotNull(status)]
\`\`\`

> **Note:** The asterisk (\`*\`) before \`Project\`, \`Filter\`, and \`BatchScan\` indicates that **Whole-Stage Code Generation** is active, combining these steps into a single compiled loop.

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/n_69rNzS660" title="PySpark DataFrame Tutorial" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `
    },
    {
      id: "CH-DTE-010",
      courseId: "CRS-DTE-001",
      sequence: 10,
      title: "Spark Memory Management & Storage Tiers",
      description: "Explore the Unified Memory Manager in Spark executors: Storage Memory, Execution Memory, User Memory, Off-Heap allocation, JVM GC tuning, and disk spill mitigation.",
      contentType: "Rich Text",
      durationMinutes: 75,
      minimumTimeMinutes: 45,
      body: `
# Spark Memory Management & Storage Tiers

Understanding Spark executor memory layout is essential to eliminate Out-Of-Memory (\`java.lang.OutOfMemoryError: Java heap space\`) exceptions and prevent catastrophic spill-to-disk slowdowns.

---

## 1. Unified Memory Management Breakdown

Each Spark executor runs inside a dedicated JVM heap divided into distinct memory regions governed by \`spark.memory.fraction\` (default 0.6):

\`\`\`
+-----------------------------------------------------------------------------------+
|                            TOTAL EXECUTOR JVM HEAP                                |
|  +-------------------------------------+---------------------------------------+  |
|  | RESERVED MEMORY (300 MB Fixed)      | USER MEMORY ((Heap - 300MB) * 0.4)    |  |
|  | Spark internal engine metadata      | Custom data structures, UDF memory    |  |
|  +-------------------------------------+---------------------------------------+  |
|  | SPARK MEMORY POOL ((Heap - 300MB) * 0.6)                                    |  |
|  |  +-------------------------------+---------------------------------------+  |  |
|  |  | STORAGE MEMORY (default 50%)   | EXECUTION MEMORY (default 50%)        |  |  |
|  |  | Cached DataFrames/RDDs        | Shuffles, Joins, Aggregations, Sorts  |  |  |
|  |  | (df.cache(), broadcast data)  | (Spill occurs when this pool is full) |  |  |
|  |  +-------------------------------+---------------------------------------+  |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
\`\`\`

### Dynamic Borrowing Mechanism:
- **Execution borrows from Storage:** If Execution needs more memory and Storage has free space, Execution borrows it immediately.
- **Storage borrows from Execution:** If Storage needs space and Execution has free space, Storage borrows it.
- **Eviction Priority:** If Execution needs space occupied by Storage, Storage blocks are evicted (dropped to disk or purged). However, **Execution blocks are never evicted** because doing so would abort active shuffles!

---

## 2. Spark Memory Configuration Parameters

| Configuration Flag | Default | Description |
| :--- | :--- | :--- |
| \`spark.executor.memory\` | 1g | Base JVM heap allocated per executor process. |
| \`spark.executor.memoryOverhead\` | max(384MB, 10%) | Off-heap memory for VM overhead, Python worker processes, and OS page cache. |
| \`spark.memory.fraction\` | 0.6 | Fraction of (JVM - 300MB) dedicated to Spark Storage + Execution pool. |
| \`spark.memory.storageFraction\` | 0.5 | Amount of storage immune to eviction by execution pool. |
| \`spark.memory.offHeap.enabled\` | false | Enables Tungsten off-heap allocation via Project Tungsten. |
| \`spark.memory.offHeap.size\` | 0 | Off-heap memory size in bytes. |

---

## 3. Detecting & Fixing Spill to Disk

When an executor runs a shuffle sort or hash join and memory demands exceed Execution memory, Spark writes intermediate partitions to local scratch disks:

\`\`\`
Spill (Memory): 14.2 GiB -> Spill (Disk): 2.4 GiB
\`\`\`

### Impact:
Disk spill degrades pipeline performance by 5x-20x due to serialization, I/O writes, and subsequent deserialization reads.

### Remedies:
1. **Increase Shuffle Partitions:** Increase \`spark.sql.shuffle.partitions\` from default 200 to 1000+ so each partition fits into available memory.
2. **Increase Executor Heap:** Increase \`spark.executor.memory\` from 4g to 8g or 16g.
3. **Broadcast Small Tables:** Use \`broadcast(small_df)\` to avoid shuffle joins entirely.
4. **Enable AQE:** Let Adaptive Query Execution automatically coalesce or split skewed shuffle partitions at runtime.

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/5U23Yt2iY_g" title="Spark Memory Tuning Deep Dive" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `
    },
    {
      id: "CH-DTE-011",
      courseId: "CRS-DTE-001",
      sequence: 11,
      title: "Spark Joins & Shuffle Optimization",
      description: "Master distributed join strategies: Broadcast Hash Join, Shuffle Hash Join, Sort-Merge Join, data skew mitigation via salting, and Adaptive Query Execution (AQE).",
      contentType: "Rich Text",
      durationMinutes: 75,
      minimumTimeMinutes: 45,
      body: `
# Spark Joins & Shuffle Optimization

Joins are often the most resource-intensive operations in data pipelines because they frequently require redistributing millions of records across cluster network boundaries (shuffling).

---

## 1. Spark Join Strategies Comparison

\`\`\`
+-------------------------+-------------------------+-------------------------+
| BROADCAST HASH JOIN     | SHUFFLE HASH JOIN       | SORT-MERGE JOIN (SMJ)   |
| (BHJ)                   | (SHJ)                   |                         |
+-------------------------+-------------------------+-------------------------+
| Driver sends small table| Both tables hashed by   | Both tables hashed by   |
| to ALL executors.       | join key, shuffled.     | key, shuffled, then     |
| NO SHUFFLE for big table| Hash table built in mem.| sorted before merge.    |
| Threshold: <= 10MB      | Size: Medium tables.    | Size: Default for big.  |
| FASTEST execution.      | Memory-intensive.       | Resilient to large data.|
+-------------------------+-------------------------+-------------------------+
\`\`\`

### Forcing a Broadcast Join in PySpark:
\`\`\`python
from pyspark.sql.functions import broadcast

# Large transactions table joined against small reference table
large_transactions = spark.read.table("gold.transactions")
small_merchants = spark.read.table("silver.dim_merchants")

# Broadcast hint eliminates shuffle exchange for transactions table
joined_df = large_transactions.join(
    broadcast(small_merchants),
    large_transactions.merchant_id == small_merchants.merchant_id,
    "inner"
)
\`\`\`

---

## 2. Handling Data Skew with Key Salting

Data skew occurs when an asymmetric distribution of keys (e.g., \`user_id = NULL\` or popular retailer ID) routes 90% of records to a single executor task, causing stragglers where one task runs for 2 hours while all others finish in 30 seconds.

### Salting Solution:
\`\`\`python
import random
from pyspark.sql.functions import col, concat, lit, floor, rand, explode, array

# Salt the skewed big table with a random integer between 0 and 19
salted_large = large_df.withColumn(
    "salted_key", 
    concat(col("skewed_id"), lit("_"), floor(rand() * 20))
)

# Replicate the dimension table 20 times to match all possible salt keys
replicated_dim = dim_df.withColumn(
    "salt_factor", 
    explode(array([lit(i) for i in range(20)]))
).withColumn(
    "salted_key",
    concat(col("skewed_id"), lit("_"), col("salt_factor"))
)

# Join on the salted key ensures uniform distribution across partitions
balanced_join = salted_large.join(
    replicated_dim,
    on="salted_key",
    how="inner"
).drop("salted_key", "salt_factor")
\`\`\`

---

## 3. Adaptive Query Execution (AQE)

Starting in Spark 3.0+, Adaptive Query Execution recalculates query physical plans dynamically at runtime based on accurate stage statistics:

\`\`\`python
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")
\`\`\`

- **Dynamically Coalescing Shuffle Partitions:** Automatically merges small post-shuffle partitions into fewer larger partitions to prevent thousands of microscopic tasks.
- **Dynamically Converting to Broadcast Join:** If a table filter reduces its runtime size below \`autoBroadcastJoinThreshold\`, Spark converts SMJ to BHJ on the fly!
- **Dynamic Skew Join Optimization:** Automatically splits oversized skewed partitions into sub-partitions handled concurrently.

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/5a4G0kZ04rA" title="Spark Joins and Shuffle Optimization" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `
    },
    {
      id: "CH-DTE-012",
      courseId: "CRS-DTE-001",
      sequence: 12,
      title: "Window Functions & Analytical Aggregations in PySpark",
      description: "Master advanced analytical computations: Window specifications, partitionBy, orderBy, frame boundaries (rowsBetween/rangeBetween), ranking, and cumulative running metrics.",
      contentType: "Rich Text",
      durationMinutes: 75,
      minimumTimeMinutes: 45,
      body: `
# Window Functions & Analytical Aggregations in PySpark

Window functions allow data engineers to calculate aggregate metrics, rankings, and lead/lag values across a targeted subset of rows (a window frame) without collapsing row granularity like a standard \`groupBy()\`.

---

## 1. Anatomy of a Window Specification

A window is defined using \`Window.partitionBy()\`, \`orderBy()\`, and an optional frame clause:

\`\`\`
Window Specification:
+---------------------+---------------------+-----------------------------------+
| PARTITION BY        | ORDER BY            | FRAME SPECIFICATION               |
| Divides data into   | Sorts rows within   | rowsBetween() or rangeBetween()   |
| logical partitions  | each partition for  | Limits calculation window frame   |
| (e.g., department)  | ranking/cumulative  | (e.g., preceding 7 rows to current)|
+---------------------+---------------------+-----------------------------------+
\`\`\`

---

## 2. Practical Analytical PySpark Examples

\`\`\`python
from pyspark.sql import Window
from pyspark.sql.functions import (
    col, row_number, dense_rank, lag, lead, sum, avg
)

# Sample Data: Customer daily purchases
# Window 1: Rank top 3 purchases per customer
cust_window = Window.partitionBy("customer_id").orderBy(col("purchase_amount").desc())

top_purchases = orders_df.withColumn("rank", dense_rank().over(cust_window)) \\
    .filter(col("rank") <= 3)

# Window 2: Cumulative running total & 7-day rolling average per customer
time_window = Window.partitionBy("customer_id") \\
    .orderBy("transaction_date") \\
    .rowsBetween(Window.unboundedPreceding, Window.currentRow)

rolling_7day_window = Window.partitionBy("customer_id") \\
    .orderBy(col("transaction_date").cast("timestamp").cast("long")) \\
    .rangeBetween(-7 * 86400, Window.currentRow)

analytics_df = orders_df \\
    .withColumn("cumulative_spend", sum("purchase_amount").over(time_window)) \\
    .withColumn("rolling_7d_spend", sum("purchase_amount").over(rolling_7day_window)) \\
    .withColumn("prev_order_amount", lag("purchase_amount", 1).over(
        Window.partitionBy("customer_id").orderBy("transaction_date")
    ))
\`\`\`

---

## 3. Frame Specification: \`rowsBetween\` vs \`rangeBetween\`

| Feature | \`rowsBetween(start, end)\` | \`rangeBetween(start, end)\` |
| :--- | :--- | :--- |
| **Criterion** | Physical row count offset relative to current row. | Logical value offset based on the \`orderBy\` column. |
| **Duplicates** | Identical sorted values are treated as distinct individual rows. | Identical values in the orderBy column share the exact same frame boundary. |
| **Typical Use** | "Average of the past 3 rows regardless of timestamp." | "Average of rows occurring in the previous 7 days (604,800 seconds)." |

> [!WARNING]
> Calling \`Window.orderBy()\` without a \`partitionBy()\` moves all cluster data into a single partition executed on a single worker core! Always ensure high-cardinality partition keys.

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/n_69rNzS660" title="PySpark Window Functions Tutorial" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `
    },
    {
      id: "CH-DTE-013",
      courseId: "CRS-DTE-001",
      sequence: 13,
      title: "Spark Structured Streaming Foundations",
      description: "Understand the micro-batch processing model in Spark Structured Streaming: Streaming Sources, Sinks, Trigger Intervals, Output Modes (Append, Update, Complete), and Checkpointing.",
      contentType: "Rich Text",
      durationMinutes: 75,
      minimumTimeMinutes: 45,
      body: `
# Spark Structured Streaming Foundations

Spark Structured Streaming is a scalable and fault-tolerant stream processing engine built on the Spark SQL engine. It models live data streams as an **unbounded continuously appended table**.

---

## 1. Unbounded Table Model

\`\`\`
Event Stream:  [Event 1] ---> [Event 2] ---> [Event 3] ---> [Event 4] ---> ...
                                  |
                                  v
+-----------------------------------------------------------------------------+
|                          INPUT STREAM AS UNBOUNDED TABLE                    |
| Time T1:  Row 1, Row 2                                                      |
| Time T2:  Row 1, Row 2, Row 3, Row 4                                        |
| Time T3:  Row 1, Row 2, Row 3, Row 4, Row 5                                 |
+-----------------------------------------------------------------------------+
                                  |
                   [ Incremental Query Execution ]
                                  |
                                  v
+-----------------------------------------------------------------------------+
|                             RESULT TABLE                                    |
| Continuous incremental updates emitted to External Sink (Iceberg, Kafka, S3)|
+-----------------------------------------------------------------------------+
\`\`\`

---

## 2. Output Modes Explained

Spark Structured Streaming supports three distinct output modes:

1. **Append Mode (Default):**
   - Only new rows added to the Result Table since the last trigger are emitted to the sink.
   - Ideal for append-only data lakes (writing raw telemetry or transactional logs to Parquet/Iceberg).
   - Only works with aggregations when **Watermarks** are explicitly defined.
2. **Update Mode:**
   - Only rows that were updated in the Result Table since the last trigger are written out.
   - Ideal for upserting metrics into key-value stores (e.g., Redis, DynamoDB, PostgreSQL).
3. **Complete Mode:**
   - The entire updated Result Table is written out to the sink on every trigger.
   - Used only for aggregate queries with bounded cardinality (e.g., total counts by country).

---

## 3. End-to-End Structured Streaming Example

\`\`\`python
from pyspark.sql import SparkSession
from pyspark.sql.functions import from_json, col, expr
from pyspark.sql.types import StructType, StringType, DoubleType, TimestampType

spark = SparkSession.builder.appName("KafkaToIceberg").getOrCreate()

# Define schema for inbound JSON payload
schema = StructType() \\
    .add("order_id", StringType()) \\
    .add("customer_id", StringType()) \\
    .add("amount", DoubleType()) \\
    .add("timestamp", TimestampType())

# Read streaming events from Kafka
streaming_df = spark.readStream \\
    .format("kafka") \\
    .option("kafka.bootstrap.servers", "kafka:9092") \\
    .option("subscribe", "retail.orders") \\
    .option("startingOffsets", "latest") \\
    .load()

# Parse binary Kafka value column as JSON
parsed_df = streaming_df \\
    .select(from_json(col("value").cast("string"), schema).alias("data")) \\
    .select("data.*")

# Write stream to Delta/Iceberg with Write-Ahead Logging & Checkpointing
query = parsed_df.writeStream \\
    .format("iceberg") \\
    .outputMode("append") \\
    .option("checkpointLocation", "s3://datalake-checkpoints/orders_stream/") \\
    .trigger(processingTime="10 seconds") \\
    .toTable("glue_catalog.silver.orders")

query.awaitTermination()
\`\`\`

> [!IMPORTANT]
> The \`checkpointLocation\` parameter saves offsets, state stores, and commit logs to durable storage. If an executor or cluster crashes, Spark restarts from the exact committed offset, ensuring **Exactly-Once delivery semantics**.

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/5a4G0kZ04rA" title="Structured Streaming Fundamentals" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `
    },
    {
      id: "CH-DTE-014",
      courseId: "CRS-DTE-001",
      sequence: 14,
      title: "Streaming State Management & Watermarking",
      description: "Handle out-of-order data and bounded state: Event-time watermarking, state store backends (HDFS vs RocksDB), stream-to-stream joins, and duplicate record deduplication.",
      contentType: "Rich Text",
      durationMinutes: 75,
      minimumTimeMinutes: 45,
      body: `
# Streaming State Management & Watermarking

Stateful stream processing maintains information across events (such as running counts, windowed aggregations, or session windows). Watermarking allows Spark to determine when late-arriving events can be discarded to safely purge memory state stores.

---

## 1. The Challenge of Late Data & Memory Leaks

Without watermarks, a streaming engine would need to keep all historical state in memory indefinitely because an event generated 3 days ago could arrive right now:

\`\`\`
Event Time:    12:00     12:05     12:10     12:15     12:20 (Max Seen)
                  |         |         |         |         |
Watermark (Delay = 10 mins):                    |  [ 12:10 WATERMARK THRESHOLD ]
                                                v
               Events prior to 12:10 are DISCARDED and purged from RAM!
\`\`\`

- **Event Time:** The timestamp embedded inside the record when the event actually occurred at the device/client.
- **Processing Time:** The clock timestamp of the worker machine when Spark processes the record.
- **Watermark Threshold:** \`max(event_time) - delay_threshold\`. Any event with timestamp earlier than the watermark is dropped.

---

## 2. Defining Watermarks in PySpark

\`\`\`python
from pyspark.sql.functions import col, window

# Aggregate click counts over 10-minute tumbling windows with a 5-minute watermark delay
windowed_counts = click_stream_df \\
    .withWatermark("event_time", "5 minutes") \\
    .groupBy(
        window(col("event_time"), "10 minutes", "5 minutes"), # sliding window
        col("page_url")
    ) \\
    .count()

# Append mode can now safely output completed window aggregates
query = windowed_counts.writeStream \\
    .format("parquet") \\
    .outputMode("append") \\
    .option("checkpointLocation", "s3://checkpoints/windowed_clicks/") \\
    .start("s3://datalake-silver/windowed_clicks/")
\`\`\`

---

## 3. RocksDB State Store Provider

For large stateful streaming applications holding millions of active keys, Spark's default in-memory JVM heap state store (\`HDFSBackedStateStoreProvider\`) causes massive GC pauses.

Switching to the **RocksDB State Store Provider** stores state in an off-heap embedded C++ key-value database backed by local SSDs:

\`\`\`python
spark.conf.set(
    "spark.sql.streaming.stateStore.providerClass",
    "org.apache.spark.sql.execution.streaming.state.RocksDBStateStoreProvider"
)
\`\`\`

### Key Benefits:
- Eliminates JVM heap memory pressure and GC pauses.
- Handles tens of gigabytes of state per executor node.
- Asynchronously checkpoints snapshots to durable storage (S3/GCS).

---

## 4. Streaming Deduplication

\`\`\`python
# Deduplicate user page views within a 1-hour event window
deduped_stream = click_stream_df \\
    .withWatermark("event_time", "1 hour") \\
    .dropDuplicates(["user_id", "page_id", "event_time"])
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/5U23Yt2iY_g" title="Spark Streaming State and Watermarks" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `
    }
  ],
  assessments: [
    {
      id: "ASM-DTE-008",
      courseId: "CRS-DTE-001",
      chapterId: "CH-DTE-008",
      title: "Assessment: Apache Spark Architecture & Execution Model",
      passingScore: 70,
      questions: [
        {
          id: "Q-DTE-071",
          type: "MCQ",
          prompt: "What is the primary role of the Spark Driver program?",
          options: [
            "It runs the main() program, creates SparkSession, converts user transformations into execution DAG stages, and schedules tasks onto executors",
            "It acts as a physical hardware node hosting the object storage database",
            "It runs the web browser client interface for users",
            "It replaces the cluster operating system kernel"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-072",
          type: "MCQ",
          prompt: "Which Spark component is responsible for Whole-Stage Java Code Generation and off-heap memory management?",
          options: [
            "Project Tungsten",
            "Hadoop YARN NodeManager",
            "Spark Standalone Master",
            "Zookeeper Coordinator"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-073",
          type: "MCQ",
          prompt: "What marks the boundary between stages in an Apache Spark Directed Acyclic Graph (DAG)?",
          options: [
            "A wide dependency requiring a shuffle (data redistribution across cluster executors)",
            "Every single filter transformation",
            "A call to withColumn()",
            "A change in Python variable names"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-074",
          type: "MCQ",
          prompt: "What optimization is performed by Catalyst's 'Predicate Pushdown'?",
          options: [
            "Pushing filter expressions down to the storage format/reader level so non-matching rows and files are skipped before reading into memory",
            "Converting all integer data types into floating-point numbers",
            "Sorting data alphabetically before filtering",
            "Broadcasting the entire database cluster into driver RAM"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-075",
          type: "MCQ",
          prompt: "What is a 'Narrow Dependency' in Spark computation?",
          options: [
            "A transformation where each partition of the parent RDD is consumed by at most one child partition, requiring no network shuffle",
            "A dependency between two separate external database tables",
            "A network socket with limited bandwidth",
            "A query that contains fewer than five columns"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-076",
          type: "MCQ",
          prompt: "How does Project Tungsten manage memory to bypass JVM Garbage Collection pauses?",
          options: [
            "It allocates raw binary memory off-heap using sun.misc.Unsafe and compact byte encodings",
            "It disables all memory allocation and reads everything from optical disk",
            "It restarts the JVM executor every 5 seconds",
            "It forces all execution onto GPU texture memory"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-077",
          type: "MCQ",
          prompt: "Which cluster managers are natively supported by Apache Spark for resource scheduling?",
          options: [
            "Kubernetes, Apache YARN, and Spark Standalone",
            "Docker Compose and Systemd only",
            "Apache Web Server and NGINX",
            "Redis and Memcached"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-078",
          type: "MCQ",
          prompt: "What is an executor slot in Spark architecture?",
          options: [
            "A thread of execution capable of processing one Spark task concurrently on an executor core",
            "A physical expansion card on a motherboard",
            "A scheduled time slot on a calendar",
            "A reserved port on the network router"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-079",
          type: "MCQ",
          prompt: "What does the Catalyst Optimizer generate from an Optimized Logical Plan?",
          options: [
            "One or more Physical Plans, choosing the most cost-effective one for RDD code generation",
            "A Python script written to disk",
            "An HTML report for data analysts",
            "A Kafka topic configuration"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-080",
          type: "MCQ",
          prompt: "Why is 'df.collect()' considered dangerous when executed on large datasets?",
          options: [
            "It pulls all partitioned data across the entire cluster into the driver's single JVM heap, frequently causing Driver OutOfMemoryError",
            "It deletes the underlying files in S3 storage",
            "It renames all table columns to random UUIDs",
            "It converts all numerical columns to strings"
          ],
          answer: 0,
          points: 10
        }
      ]
    },
    {
      id: "ASM-DTE-009",
      courseId: "CRS-DTE-001",
      chapterId: "CH-DTE-009",
      title: "Assessment: PySpark DataFrame API & Lazy Evaluation",
      passingScore: 70,
      questions: [
        {
          id: "Q-DTE-081",
          type: "MCQ",
          prompt: "Which of the following operations is an Action in Apache Spark?",
          options: [
            "count()",
            "select()",
            "filter()",
            "withColumn()"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-082",
          type: "MCQ",
          prompt: "What is the primary benefit of lazy evaluation in Spark DataFrames?",
          options: [
            "It enables the query optimizer to view the entire pipeline end-to-end, prune columns, push down predicates, and optimize physical execution before running",
            "It executes operations in reverse order to save disk space",
            "It pauses task execution until the user manually presses enter",
            "It caches every single intermediate DataFrame into executor memory automatically"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-083",
          type: "MCQ",
          prompt: "What method should be called on a DataFrame to view its physical and logical execution plan?",
          options: [
            "df.explain()",
            "df.describe()",
            "df.summary()",
            "df.info()"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-084",
          type: "MCQ",
          prompt: "In a Spark physical execution plan, what does an asterisk (*) before an operator name indicate (e.g., '*Filter')?",
          options: [
            "Whole-Stage Code Generation is active for that operator",
            "The operator produced a syntax error",
            "The operator was executed on a GPU",
            "The table was loaded from an uncompressed CSV file"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-085",
          type: "MCQ",
          prompt: "How does Spark's DataFrame API differ fundamentally from Pandas DataFrame API?",
          options: [
            "PySpark DataFrames are distributed across a cluster, lazily evaluated, and immutable, whereas Pandas DataFrames are single-node, eagerly evaluated, and in-memory",
            "PySpark DataFrames do not support string columns",
            "Pandas DataFrames can only be run on AWS EMR clusters",
            "PySpark DataFrames do not support SQL queries"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-086",
          type: "MCQ",
          prompt: "Which PySpark function allows conditional branch evaluation similar to SQL CASE WHEN?",
          options: [
            "pyspark.sql.functions.when()",
            "pyspark.sql.functions.ifelse()",
            "pyspark.sql.functions.switch()",
            "pyspark.sql.functions.choose()"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-087",
          type: "MCQ",
          prompt: "What does 'spark.sql.shuffle.partitions' configure?",
          options: [
            "The default number of partitions created when shuffling data for joins and aggregations (default 200)",
            "The number of CPU cores in the cluster",
            "The total number of nodes in the Kubernetes cluster",
            "The maximum size of Parquet files in megabytes"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-088",
          type: "MCQ",
          prompt: "What happens when you invoke 'df.cache()' on a Spark DataFrame?",
          options: [
            "It lazily sets a flag to persist the DataFrame partitions in executor memory/disk upon the next action execution",
            "It immediately downloads the dataset to the engineer's desktop machine",
            "It locks the database table to prevent concurrent writes",
            "It wipes all temporary shuffle files from executor disks"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-089",
          type: "MCQ",
          prompt: "Which PySpark method should be used to add or replace an existing column in a DataFrame?",
          options: [
            "df.withColumn()",
            "df.addColumn()",
            "df.setColumn()",
            "df.appendColumn()"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-090",
          type: "MCQ",
          prompt: "What is the difference between 'coalesce(n)' and 'repartition(n)' in PySpark?",
          options: [
            "coalesce(n) reduces partitions without a full shuffle by combining local partitions, whereas repartition(n) performs a full shuffle to redistribute data uniformly",
            "coalesce(n) can only increase partitions, whereas repartition(n) can only decrease them",
            "coalesce(n) deletes duplicate records, whereas repartition(n) preserves duplicates",
            "coalesce(n) requires a GPU cluster"
          ],
          answer: 0,
          points: 10
        }
      ]
    },
    {
      id: "ASM-DTE-010",
      courseId: "CRS-DTE-001",
      chapterId: "CH-DTE-010",
      title: "Assessment: Spark Memory Management & Storage Tiers",
      passingScore: 70,
      questions: [
        {
          id: "Q-DTE-091",
          type: "MCQ",
          prompt: "Under Spark's Unified Memory Manager, what are the two dynamic components sharing the Spark memory pool?",
          options: [
            "Storage Memory (cached data, broadcasts) and Execution Memory (shuffles, joins, sorts)",
            "Driver memory and Web UI memory",
            "Operating system page cache and BIOS firmware",
            "Kubernetes pod memory and Docker daemon memory"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-092",
          type: "MCQ",
          prompt: "What happens when Execution Memory requires space occupied by Storage Memory?",
          options: [
            "Execution Memory evicts Storage blocks (dropping them to disk or purging cached partitions) because execution cannot be interrupted",
            "The Spark application crashes immediately",
            "Execution is paused until the user frees memory manually",
            "Storage memory rejects the request and forces execution to terminate"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-093",
          type: "MCQ",
          prompt: "Can Storage Memory evict Execution Memory blocks?",
          options: [
            "No, Execution blocks can never be evicted due to the complexity and cost of re-computing active shuffles and joins",
            "Yes, cached DataFrames always take precedence over running shuffles",
            "Yes, if the cache flag is marked MEMORY_ONLY_SER",
            "Yes, but only on Spark Standalone mode"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-094",
          type: "MCQ",
          prompt: "What is 'Spill to Disk' in Apache Spark execution?",
          options: [
            "When intermediate execution data for a shuffle or sort exceeds available execution memory, Spark serializes and writes temporary blocks to local executor disks",
            "When an executor hardware disk drive fails",
            "When S3 object storage runs out of capacity",
            "When log files fill up the root filesystem"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-095",
          type: "MCQ",
          prompt: "What configuration parameter determines the fraction of executor JVM heap allocated to Spark execution and storage?",
          options: [
            "spark.memory.fraction (default 0.6)",
            "spark.executor.cores",
            "spark.driver.maxResultSize",
            "spark.default.parallelism"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-096",
          type: "MCQ",
          prompt: "What is the purpose of 'spark.executor.memoryOverhead'?",
          options: [
            "Allocates off-heap memory outside the JVM heap for OS overhead, Python Py4J workers, and native libraries",
            "Reserves memory for video card processing",
            "Defines the price per hour of the cloud VM",
            "Limits the size of SQL string queries"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-097",
          type: "MCQ",
          prompt: "How much JVM memory is permanently reserved in Spark for internal engine metadata before calculating the memory pool?",
          options: [
            "300 MB",
            "1024 MB",
            "100 MB",
            "Zero MB"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-098",
          type: "MCQ",
          prompt: "Which Garbage Collection algorithm is widely recommended for Spark executors with large heap sizes (>32 GB)?",
          options: [
            "Garbage-First (G1GC) via -XX:+UseG1GC",
            "Serial GC via -XX:+UseSerialGC",
            "Parallel Old GC",
            "Disabling GC entirely"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-099",
          type: "MCQ",
          prompt: "If a Spark stage exhibits high Spill (Memory) and Spill (Disk), what is the most direct tuning remedy?",
          options: [
            "Increase spark.sql.shuffle.partitions to reduce the partition size handled by each task",
            "Reduce the number of worker nodes in the cluster",
            "Disable Project Tungsten",
            "Convert all Parquet files into uncompressed CSV files"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-100",
          type: "MCQ",
          prompt: "What does StorageLevel.MEMORY_AND_DISK_SER specify when caching a DataFrame?",
          options: [
            "Persists data as serialized Java objects in memory; if memory is insufficient, spills serialized partitions to local disk",
            "Saves data directly to an external database table",
            "Encrypts memory partitions using RSA keys",
            "Stores data strictly in uncompressed driver memory"
          ],
          answer: 0,
          points: 10
        }
      ]
    },
    {
      id: "ASM-DTE-011",
      courseId: "CRS-DTE-001",
      chapterId: "CH-DTE-011",
      title: "Assessment: Spark Joins & Shuffle Optimization",
      passingScore: 70,
      questions: [
        {
          id: "Q-DTE-101",
          type: "MCQ",
          prompt: "When does Spark select a Broadcast Hash Join (BHJ) over a Sort-Merge Join?",
          options: [
            "When one of the joined tables is smaller than spark.sql.autoBroadcastJoinThreshold (default 10MB) or an explicit broadcast() hint is applied",
            "When both tables contain more than 1 billion rows",
            "When data is partitioned by timestamp",
            "When running Spark on Windows without Hadoop"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-102",
          type: "MCQ",
          prompt: "Why is Broadcast Hash Join the most performant join strategy in distributed computing?",
          options: [
            "The large dataset remains in place without requiring any network shuffle; only the small table is broadcast to executors",
            "It stores all data on high-speed NVMe drives",
            "It skips join key comparisons entirely",
            "It runs entirely inside the cluster CPU L1 cache"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-103",
          type: "MCQ",
          prompt: "What are the two phases of a Sort-Merge Join (SMJ)?",
          options: [
            "Hash-partitioning and shuffling both datasets by the join key, followed by sorting each partition before merging matching keys",
            "Filtering NULL values, then writing out to CSV",
            "Broadcasting the left table, then broadcasting the right table",
            "Compiling SQL to Java bytecode, then restarting executors"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-104",
          type: "MCQ",
          prompt: "What symptom in the Spark Web UI indicates a severe data skew issue during a join?",
          options: [
            "99% of tasks complete in seconds, while 1 or 2 tasks run for hours on a single executor core",
            "All tasks complete in exactly 4.2 seconds",
            "The driver CPU utilization stays at 0%",
            "The Web UI displays zero shuffle read bytes"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-105",
          type: "MCQ",
          prompt: "How does the 'Key Salting' technique resolve join data skew?",
          options: [
            "It appends a random integer (0..N) to the skewed key on the large table and replicates matching keys N times on the dimension table to balance partition loads",
            "It encrypts the join keys using cryptographic salt hashes",
            "It drops all rows containing null or frequent keys",
            "It forces the cluster to execute on a single thread"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-106",
          type: "MCQ",
          prompt: "What feature in Spark 3.0+ dynamically adjusts execution plans at runtime based on stage statistics?",
          options: [
            "Adaptive Query Execution (AQE)",
            "Dynamic Frequency Scaling",
            "Tungsten Bytecode Generator",
            "Resilient Distributed Datasets (RDD)"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-107",
          type: "MCQ",
          prompt: "What does AQE's 'Dynamic Coalescing of Shuffle Partitions' do?",
          options: [
            "Merges adjacent small shuffle partitions into fewer larger partitions post-shuffle to avoid scheduling overhead for thousands of tiny tasks",
            "Deletes all shuffle files from disk immediately",
            "Compresses shuffle files using Gzip instead of LZ4",
            "Splits large tables into 10,000 text files"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-108",
          type: "MCQ",
          prompt: "Under what condition will AQE convert a Sort-Merge Join into a Broadcast Hash Join at runtime?",
          options: [
            "When post-filter statistics show one of the join sides is smaller than the broadcast threshold",
            "When the cluster is running on Kubernetes",
            "When the query contains an ORDER BY clause",
            "When all executors have less than 1GB of memory"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-109",
          type: "MCQ",
          prompt: "Which join strategy should be used when joining two petabyte-scale tables that cannot fit in memory?",
          options: [
            "Sort-Merge Join (SMJ)",
            "Broadcast Hash Join (BHJ)",
            "Broadcast Nested Loop Join (BNLJ)",
            "Cartesian Product Join"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-110",
          type: "MCQ",
          prompt: "What is the worst-performing join strategy in Spark that should be avoided at all costs on large tables?",
          options: [
            "Cartesian / Broadcast Nested Loop Join without join conditions (O(M * N) complexity)",
            "Sort-Merge Join with primary keys",
            "Broadcast Hash Join with integer keys",
            "Bucketed Table Join"
          ],
          answer: 0,
          points: 10
        }
      ]
    },
    {
      id: "ASM-DTE-012",
      courseId: "CRS-DTE-001",
      chapterId: "CH-DTE-012",
      title: "Assessment: Window Functions & Analytical Aggregations",
      passingScore: 70,
      questions: [
        {
          id: "Q-DTE-111",
          type: "MCQ",
          prompt: "What is the main advantage of a Window Function compared to a standard groupBy() in PySpark?",
          options: [
            "Window functions compute aggregations and rankings over a partition while preserving individual row-level granularity",
            "Window functions execute 100x faster by bypassing CPU execution",
            "Window functions do not require RAM memory",
            "Window functions automatically convert SQL into Python"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-112",
          type: "MCQ",
          prompt: "What is the difference between rank() and dense_rank() in PySpark?",
          options: [
            "dense_rank() leaves no gaps in ranking sequence after ties (1, 1, 2), whereas rank() skips ranks (1, 1, 3)",
            "dense_rank() works only on string columns",
            "rank() can only be used on numerical columns",
            "dense_rank() sorts in descending order only"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-113",
          type: "MCQ",
          prompt: "What happens if a Window specification includes 'orderBy()' but omits 'partitionBy()'?",
          options: [
            "All cluster rows are sent to a single partition on a single executor core, creating a massive bottleneck and risk of Driver/Executor OOM",
            "Spark raises a compile-time syntax error",
            "The DataFrame is automatically partitioned into 200 random buckets",
            "Execution is distributed across all GPUs"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-114",
          type: "MCQ",
          prompt: "Which frame specification evaluates rows based on physical row offsets rather than logical column values?",
          options: [
            "rowsBetween(start, end)",
            "rangeBetween(start, end)",
            "partitionBetween(start, end)",
            "indexBetween(start, end)"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-115",
          type: "MCQ",
          prompt: "To compute a running total from the beginning of a customer partition up to the current row, what frame specification should be used?",
          options: [
            "rowsBetween(Window.unboundedPreceding, Window.currentRow)",
            "rowsBetween(Window.currentRow, Window.unboundedFollowing)",
            "rangeBetween(-1, 1)",
            "rowsBetween(0, 10)"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-116",
          type: "MCQ",
          prompt: "Which PySpark function retrieves the value of a column from the previous row within the window partition?",
          options: [
            "lag(col, 1)",
            "lead(col, 1)",
            "prev(col)",
            "prior(col)"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-117",
          type: "MCQ",
          prompt: "When computing a 7-day rolling financial average using rangeBetween(-7*86400, 0), what data type must the orderBy column have?",
          options: [
            "A numerical or epoch-second integer/long timestamp representation",
            "A string formatted as 'YYYY-MM-DD'",
            "A boolean flag",
            "A JSON dictionary"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-118",
          type: "MCQ",
          prompt: "What does the function 'row_number()' guarantee within a partitioned window?",
          options: [
            "A unique, strictly sequential integer starting at 1 for every row in the partition, regardless of ties",
            "The total number of rows across the entire table",
            "The physical row index on the SSD block",
            "A random integer between 1 and 100"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-119",
          type: "MCQ",
          prompt: "What is the result of 'lead(col, 2)' on the second-to-last row of a window partition?",
          options: [
            "null",
            "0",
            "The current row value",
            "A runtime exception"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-120",
          type: "MCQ",
          prompt: "Which function calculates the relative rank (percentile) of a row within a partition between 0.0 and 1.0?",
          options: [
            "percent_rank()",
            "dense_rank()",
            "cume_dist()",
            "ntile()"
          ],
          answer: 0,
          points: 10
        }
      ]
    },
    {
      id: "ASM-DTE-013",
      courseId: "CRS-DTE-001",
      chapterId: "CH-DTE-013",
      title: "Assessment: Spark Structured Streaming Foundations",
      passingScore: 70,
      questions: [
        {
          id: "Q-DTE-121",
          type: "MCQ",
          prompt: "How does Spark Structured Streaming conceptually model an incoming data stream?",
          options: [
            "As an unbounded continuously appended table",
            "As a series of discrete disk files",
            "As a fixed-size ring buffer in driver RAM",
            "As a single continuous TCP socket connection"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-122",
          type: "MCQ",
          prompt: "In Structured Streaming, which output mode outputs only the new rows appended to the Result Table since the last trigger?",
          options: [
            "Append Mode",
            "Update Mode",
            "Complete Mode",
            "Snapshot Mode"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-123",
          type: "MCQ",
          prompt: "Which output mode requires that the query contain an aggregation and outputs the ENTIRE updated table on each trigger?",
          options: [
            "Complete Mode",
            "Append Mode",
            "Incremental Mode",
            "Delta Mode"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-124",
          type: "MCQ",
          prompt: "What is the critical role of 'checkpointLocation' in Spark Structured Streaming?",
          options: [
            "Stores offsets, state stores, and transaction commit logs durably to guarantee fault tolerance and exactly-once processing across restarts",
            "Stores compiled Java .class files for fast execution",
            "Saves user web browser login sessions",
            "Archives raw CSV files before processing"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-125",
          type: "MCQ",
          prompt: "What does '.trigger(processingTime=\"10 seconds\")' specify?",
          options: [
            "Spark launches a micro-batch query every 10 seconds to process newly arrived data",
            "The job is killed after running for 10 seconds",
            "Executors sleep for 10 seconds before starting",
            "Data older than 10 seconds is permanently deleted"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-126",
          type: "MCQ",
          prompt: "What trigger option allows Spark Structured Streaming to run micro-batches as fast as possible with zero pause between batches?",
          options: [
            ".trigger(processingTime=\"0 seconds\") or .trigger(availableNow=False)",
            ".trigger(continuous=\"1 millisecond\")",
            ".trigger(batchSize=1)",
            ".trigger(mode=\"instant\")"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-127",
          type: "MCQ",
          prompt: "What does the trigger '.trigger(availableNow=True)' do in Spark 3.3+?",
          options: [
            "Processes all currently available stream data across multiple micro-batches and then shuts down gracefully, ideal for cost-effective recurring batch jobs",
            "Runs a continuous streaming loop that never terminates",
            "Forces all data to be processed on driver memory",
            "Disables checkpointing"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-128",
          type: "MCQ",
          prompt: "When reading from a Kafka source in Structured Streaming, what data type is the 'value' column initially provided as?",
          options: [
            "Binary (bytes), requiring .cast('string') and from_json() parsing",
            "Native Python dictionary",
            "SQL StructType",
            "UTF-8 Plaintext String automatically"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-129",
          type: "MCQ",
          prompt: "What happens if a streaming query with checkpointing is restarted with modified business logic that changes the state schema?",
          options: [
            "The query fails with a state schema incompatibility exception unless checkpoint state is migrated or wiped",
            "Spark automatically updates the old state in place",
            "Spark ignores the new logic and runs old code",
            "Spark converts the stream into a CSV export"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-130",
          type: "MCQ",
          prompt: "Which modern open table format provides first-class streaming sink support with native ACID transactions and time travel in Spark?",
          options: [
            "Delta Lake and Apache Iceberg",
            "Raw uncompressed CSV",
            "Gzipped JSON text files",
            "Apache Avro without Schema Registry"
          ],
          answer: 0,
          points: 10
        }
      ]
    },
    {
      id: "ASM-DTE-014",
      courseId: "CRS-DTE-001",
      chapterId: "CH-DTE-014",
      title: "Assessment: Streaming State Management & Watermarking",
      passingScore: 70,
      questions: [
        {
          id: "Q-DTE-131",
          type: "MCQ",
          prompt: "What is an event-time watermark in Spark Structured Streaming?",
          options: [
            "A moving time threshold (max_event_time - delay) that tells Spark how late data can arrive before being discarded, enabling state store memory cleanup",
            "A digital signature embedded inside Parquet headers for copyright protection",
            "The wall-clock system time of the Kafka broker",
            "The time taken to write a batch to Amazon S3"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-132",
          type: "MCQ",
          prompt: "Why is watermarking required when performing aggregations in 'Append' output mode?",
          options: [
            "Because Spark can only finalize and append a window result when it is certain that no more late data will arrive for that window",
            "Because Append mode cannot write to object storage without watermarking",
            "Because Kafka requires watermarks to commit consumer offsets",
            "Because watermarking compresses integer columns"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-133",
          type: "MCQ",
          prompt: "What happens to an event whose event_time is older than the current watermark threshold?",
          options: [
            "It is dropped immediately and not included in stateful aggregations",
            "It triggers a fatal OutOfMemoryError",
            "It is automatically updated to the current system time",
            "It is forwarded to the cluster administrator via email"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-134",
          type: "MCQ",
          prompt: "What state store provider replaces the default HDFS-backed JVM heap store to handle large-scale streaming state without GC pauses?",
          options: [
            "RocksDB State Store Provider",
            "Redis State Store Provider",
            "SQLite State Store Provider",
            "Cassandra State Store Provider"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-135",
          type: "MCQ",
          prompt: "In a stream-stream join, why must watermarks be specified on BOTH streams?",
          options: [
            "To allow Spark to bound the state store retention period for both streams and purge un-joined records that exceed the delay limit",
            "To synchronize the clock speed of both physical servers",
            "To ensure both streams produce identical record counts",
            "To eliminate the need for join conditions"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-136",
          type: "MCQ",
          prompt: "How does 'dropDuplicates()' behave when combined with a watermark in Structured Streaming?",
          options: [
            "It stores seen keys in state and discards duplicates arriving within the watermark window, evicting expired keys once past the threshold",
            "It deletes all rows that have duplicate primary keys in the database",
            "It creates an exact duplicate copy of every stream",
            "It fails if two rows have the same timestamp"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-137",
          type: "MCQ",
          prompt: "What is the difference between tumbling windows and sliding windows?",
          options: [
            "Tumbling windows are non-overlapping fixed time intervals; sliding windows overlap because the slide duration is shorter than the window duration",
            "Tumbling windows only process integer values; sliding windows process strings",
            "Tumbling windows cannot be used with watermarks",
            "Sliding windows run exclusively on Apache Flink"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-138",
          type: "MCQ",
          prompt: "Where does the RocksDB State Store keep active working state?",
          options: [
            "In local off-heap C++ memory and local executor SSD files, asynchronously synced to durable storage during checkpoints",
            "Directly in the Kafka commit log topic",
            "Inside Amazon DynamoDB tables",
            "In the client's web browser session storage"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-139",
          type: "MCQ",
          prompt: "What is 'Event Time' vs 'Processing Time'?",
          options: [
            "Event Time is when the activity originally took place on the client device; Processing Time is when the data pipeline engine processes the record",
            "Event Time is the server CPU cycle time; Processing Time is Greenwich Mean Time",
            "Event Time is strictly Unix epoch milliseconds; Processing Time is an ISO 8601 string",
            "Event Time and Processing Time are always identical in distributed systems"
          ],
          answer: 0,
          points: 10
        },
        {
          id: "Q-DTE-140",
          type: "MCQ",
          prompt: "What Spark method is used to keep a streaming pipeline active in a Python application until explicitly cancelled?",
          options: [
            "query.awaitTermination()",
            "spark.block()",
            "query.sleep()",
            "spark.keepAlive()"
          ],
          answer: 0,
          points: 10
        }
      ]
    }
  ]
};
