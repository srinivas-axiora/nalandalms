// Course 10: Data Engineering Masterclass
// Aggregator module for all 5 phases (32 chapters, 32 assessments, 320 questions)
import { phase1 } from "./phase1.js";
import { phase2 } from "./phase2.js";
import { phase3 } from "./phase3.js";
import { phase4 } from "./phase4.js";
import { phase5 } from "./phase5.js";

export const dataEngineerCourse = {
  id: "CRS-DTE-001",
  title: "Data Engineering Masterclass: Distributed Systems, Spark, Kafka, Lakehouse & Airflow",
  description: "Comprehensive 32-chapter masterclass covering modern distributed data architectures: Object storage, Parquet/Avro columnar formats, Open Table Formats (Apache Iceberg & Delta Lake), Lakehouse compaction and retention, Medallion Architecture, log-based CDC with Debezium, data quality frameworks, Apache Spark internals and Catalyst/Tungsten execution, PySpark DataFrames and lazy evaluation, Spark memory management and shuffle optimization, window functions, Spark Structured Streaming with RocksDB state stores and event-time watermarking, Apache Kafka architecture and storage internals (segments, zero-copy, KRaft), Producer internals and idempotent delivery, Consumer groups and cooperative sticky rebalancing, Confluent Schema Registry and Avro schema evolution, Kafka Connect source/sink connectors and SMTs, Kafka Streams and ksqlDB, Apache Flink high-throughput stream processing with Chandy-Lamport checkpointing, Apache Airflow control plane and TaskFlow API DAG engineering, dbt Core modeling and materializations, advanced incremental merge models and SCD Type 2 snapshots, Snowflake multi-cluster shared data architecture and Snowpipe, Google BigQuery serverless engine and partitioning/clustering, OpenLineage and metadata catalogs (DataHub/Amundsen), the 5 pillars of data observability and anomaly detection, dynamic data masking, row-level security, crypto-shredding GDPR compliance, FinOps cost control, the AuraCommerce Global omnichannel retail lakehouse capstone project, and Staff Data Engineer system design interview mastery.",
  skill: "Data Engineering & Distributed Systems",
  skillIds: [
    "SKILL-DISTRIBUTED-STORAGE-LAKEHOUSE",
    "SKILL-SPARK-KAFKA-STREAMING",
    "SKILL-DATA-ORCHESTRATION-GOVERNANCE"
  ],
  targetLevel: "Advanced",
  prerequisites: ["CRS-PFS-001", "CRS-DSC-001"],
  category: "Data & Analytics",
  tags: [
    "Data Engineering",
    "Apache Spark",
    "Apache Kafka",
    "Delta Lake",
    "Apache Iceberg",
    "Apache Airflow",
    "dbt",
    "Snowflake",
    "BigQuery",
    "Apache Flink",
    "Lakehouse",
    "Distributed Systems"
  ],
  thumbnailColor: "#0284c7",
  ownerId: "EMP-1002",
  approval: "Approved",
  status: "Active",
  version: 1,
  difficulty: "Comprehensive (Beginner to Advanced)",
  estimatedHours: 120,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const dataEngineerSkills = [
  {
    id: "SKILL-DISTRIBUTED-STORAGE-LAKEHOUSE",
    name: "Distributed Storage & Lakehouse Architecture",
    category: "Technical",
    description: "Deep mastery of cloud object storage, Parquet/Avro columnar encoding, Open Table Formats (Apache Iceberg, Delta Lake), Medallion Architecture, ACID snapshot isolation, and log-based CDC.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-SPARK-KAFKA-STREAMING",
    name: "Apache Spark & Real-Time Event Streaming",
    category: "Technical",
    description: "Production mastery of distributed compute: Apache Spark Catalyst/Tungsten execution, PySpark DataFrames, memory management, shuffle joins, Structured Streaming, Apache Kafka internals, Schema Registry, and Apache Flink stream processing.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-DATA-ORCHESTRATION-GOVERNANCE",
    name: "Data Orchestration, Modeling & Governance",
    category: "Technical",
    description: "Enterprise orchestration and governance: Apache Airflow TaskFlow API, dbt Core modeling and incremental snapshots, Snowflake/BigQuery cloud warehouses, OpenLineage metadata catalogs, observability, and FinOps cost governance.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
];

export const dataEngineerChapters = [
  ...phase1.chapters,
  ...phase2.chapters,
  ...phase3.chapters,
  ...phase4.chapters,
  ...phase5.chapters,
];

export const dataEngineerAssessments = [
  ...phase1.assessments,
  ...phase2.assessments,
  ...phase3.assessments,
  ...phase4.assessments,
  ...phase5.assessments,
];

