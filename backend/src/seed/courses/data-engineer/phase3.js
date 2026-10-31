// Course 10: Data Engineer - Phase 3 (Chapters 15-21, Assessments 15-21)
// Apache Kafka Architecture, Producer/Consumer Internals, Schema Registry, Kafka Connect, Kafka Streams & Apache Flink

export const phase3 = {
  "chapters": [
    {
      "id": "CH-DTE-015",
      "courseId": "CRS-DTE-001",
      "sequence": 15,
      "title": "Apache Kafka Core Architecture & Storage Internals",
      "description": "Understand Kafka's distributed commit-log architecture: Brokers, Topics, Partitions, Segments (.log, .index, .timeindex), Page Cache, Zero-Copy OS transfer, and KRaft consensus.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "\n# Apache Kafka Core Architecture & Storage Internals\n\nApache Kafka is a distributed event store and stream-processing platform capable of handling trillions of events a day with millisecond latencies.\n\n---\n\n## 1. Kafka Architectural Model\n\nKafka implements a distributed append-only commit-log topology:\n- **Topic:** A logical feed or category name to which records are published.\n- **Partition:** The fundamental unit of parallelism and physical storage. Each partition is an ordered, immutable sequence of records.\n- **Offset:** A monotonically increasing 64-bit integer assigned sequentially to each message within a partition.\n- **In-Sync Replicas (ISR):** The set of broker replicas actively caught up with the partition leader's commit log.\n\n---\n\n## 2. Storage Internals: Segments and Indexes\n\nOn broker local disks, each partition directory contains rolling Segment Files:\n1. `00000000000000000000.log`: Contains raw serialized binary message payloads and headers.\n2. `00000000000000000000.index`: Sparse index mapping logical message offsets to physical byte positions in the .log file.\n3. `00000000000000000000.timeindex`: Sparse index mapping millisecond timestamps to message logical offsets for time-based lookups.\n\n### Retention & Compaction:\n- **Delete Policy (`cleanup.policy=delete`):** Segments older than `retention.ms` (default 7 days) or exceeding `retention.bytes` are deleted.\n- **Compaction Policy (`cleanup.policy=compact`):** Kafka retains the latest known value for each unique message key, discarding older historical updates.\n\n---\n\n## 3. High Performance: Zero-Copy and OS Page Cache\n\nKafka avoids JVM Garbage Collection overhead and maximizes network throughput via two key operating system mechanisms:\n1. **Linux Page Cache:** The broker does not store messages in JVM heap memory. Instead, writes and reads hit the Linux kernel OS page cache directly.\n2. **Zero-Copy Network Transfer (`sendfile` system call):** Bytes are transferred directly from the OS page cache to the Network Interface Card (NIC) buffer, bypassing user-space JVM memory copies entirely.\n\n---\n\n## 4. KRaft Consensus (Replacing ZooKeeper)\n\nStarting in Kafka 3.0+, KRaft (Kafka Raft Metadata Mode) eliminates external ZooKeeper dependencies:\n- Cluster metadata is stored in an internal replicated Kafka topic named `@metadata`.\n- Dedicated controller brokers form a Raft quorum, achieving sub-second leader failovers and scaling clusters to millions of partitions.\n\n<div class=\"video-container\" style=\"position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;\">\n  <iframe src=\"https://www.youtube.com/embed/Ch5VhJzaoaI\" title=\"Kafka Architecture & Storage Internals\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%;\"></iframe>\n</div>\n      "
    },
    {
      "id": "CH-DTE-016",
      "courseId": "CRS-DTE-001",
      "sequence": 16,
      "title": "Kafka Producer Internals & Delivery Guarantees",
      "description": "Master Kafka producer architecture: Serializers, Partitioner algorithms, RecordAccumulator batching, ACKs (0, 1, all), Idempotent Producers, and Transactional Exactly-Once delivery.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "\n# Kafka Producer Internals & Delivery Guarantees\n\nProducing events at high throughput requires balancing durability, batching efficiency, and ordering guarantees.\n\n---\n\n## 1. Producer Internal Pipeline\n\n1. **Serializer:** Converts Key and Value objects into raw byte arrays.\n2. **Partitioner:** Evaluates the message key. If a key is present, computes `murmur2(key) % num_partitions` to guarantee that all messages for that key land on the same partition.\n3. **RecordAccumulator:** Memory buffer pooling records into `RecordBatches` per topic-partition until `batch.size` is reached or `linger.ms` expires.\n4. **Sender Thread:** Background I/O thread transmitting batches to broker sockets concurrently.\n\n---\n\n## 2. Producer Acknowledgments (`acks`)\n\n- `acks = 0`: Fire-and-forget. Producer does not wait for broker response. Highest throughput, highest risk of data loss.\n- `acks = 1`: Producer waits for Partition Leader to commit to local log. Data is lost if leader crashes before replication.\n- `acks = all` (or `-1`): Producer waits for Leader and all In-Sync Replicas (`min.insync.replicas`) to acknowledge. Zero data loss guarantee.\n\n---\n\n## 3. Idempotent Producers (`enable.idempotence = true`)\n\nIn distributed networks, retries cause duplicate messages when network ACKs drop.\nWith idempotence enabled:\n- The producer is assigned a unique Producer ID (PID).\n- Each batch is stamped with a sequence number.\n- Brokers track sequence numbers and discard duplicate messages while returning successful acknowledgments.\n\n<div class=\"video-container\" style=\"position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;\">\n  <iframe src=\"https://www.youtube.com/embed/Ch5VhJzaoaI\" title=\"Kafka Producer Deep Dive\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%;\"></iframe>\n</div>\n      "
    },
    {
      "id": "CH-DTE-017",
      "courseId": "CRS-DTE-001",
      "sequence": 17,
      "title": "Kafka Consumer Groups & Rebalancing Protocols",
      "description": "Master distributed consumption: Consumer Groups, Partition Assignment Strategies (Range, RoundRobin, Cooperative Sticky), Offset Commit semantics, and Rebalance Storm mitigation.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "\n# Kafka Consumer Groups & Rebalancing Protocols\n\nConsumer Groups allow a pool of independent processes or containers to divide and conquer the partitions of a topic to scale event consumption horizontally.\n\n---\n\n## 1. Consumer Group Mechanics\n\n- Each partition is assigned to at most one consumer instance within a specific consumer group, guaranteeing ordered processing per partition.\n- If consumers outnumber partitions, excess consumers sit idle as hot standbys.\n- Multiple independent consumer groups can read from the same topic simultaneously without interfering with each other's offsets.\n\n---\n\n## 2. Rebalancing Protocols: Eager vs. Cooperative Sticky\n\n- **Eager Assignment (`RangeAssignor` / `RoundRobinAssignor`):** Revokes all partitions across all consumers, causing stop-the-world pauses and rebalance storms during deployments.\n- **Cooperative Sticky Assignment (`CooperativeStickyAssignor`):** Rebalances incrementally. Unaffected consumers continue reading without interruption; only migrated partitions are reassigned.\n\n---\n\n## 3. Offset Commit Strategies & Consumer Lag\n\n- **Automatic Commits (`enable.auto.commit = true`):** Commits offsets periodically regardless of processing state. Unsafe for mission-critical pipelines due to risk of silent data loss during crashes.\n- **Manual Commits (`commitSync()` / `commitAsync()`):** Commits offsets only after records have been fully written to downstream datastores, guaranteeing at-least-once delivery.\n- **Consumer Lag:** The delta between Log End Offset and current committed offset:\n  ```\n  Lag = LogEndOffset - CurrentConsumerOffset\n  ```\n\n<div class=\"video-container\" style=\"position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;\">\n  <iframe src=\"https://www.youtube.com/embed/5a4G0kZ04rA\" title=\"Kafka Consumers & Rebalancing\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%;\"></iframe>\n</div>\n      "
    },
    {
      "id": "CH-DTE-018",
      "courseId": "CRS-DTE-001",
      "sequence": 18,
      "title": "Schema Registry & Binary Serialization with Avro / Protobuf",
      "description": "Enforce contract-driven streaming architectures: Confluent Schema Registry, Apache Avro schemas, 5-byte wire format, and Backward, Forward, and Full schema evolution compatibility modes.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "\n# Schema Registry & Binary Serialization with Avro / Protobuf\n\nIn enterprise streaming architectures, untyped JSON messages lead to downstream pipeline breakages when upstream producers introduce undeclared schema changes.\n\n---\n\n## 1. Confluent Schema Registry Architecture\n\n1. Producer validates schema against Schema Registry before sending.\n2. Schema Registry returns a 4-byte Schema ID.\n3. Producer prepends a 5-byte header to the message:\n   - Byte 0: Magic byte (`0x00`).\n   - Bytes 1-4: 4-byte Schema ID in big-endian binary format.\n   - Remaining bytes: Compact binary-encoded Avro payload.\n4. Consumers extract the Schema ID from the 5-byte header and deserialize payloads using the cached schema definition.\n\n---\n\n## 2. Schema Evolution Compatibility Modes\n\n- **BACKWARD (Default):** New schema can read data written by older schemas. Consumers must be upgraded first. Fields can only be deleted, or added if they have default values.\n- **FORWARD:** Old schema can read data written by new schemas. Producers must be upgraded first. Can add new fields, but cannot delete old fields.\n- **FULL:** Backward and Forward compatible. Producers and consumers can be upgraded in any order independently. New fields must have defaults.\n- **NONE:** Compatibility checks disabled (risky).\n\n<div class=\"video-container\" style=\"position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;\">\n  <iframe src=\"https://www.youtube.com/embed/Ch5VhJzaoaI\" title=\"Schema Registry and Avro\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%;\"></iframe>\n</div>\n      "
    },
    {
      "id": "CH-DTE-019",
      "courseId": "CRS-DTE-001",
      "sequence": 19,
      "title": "Kafka Connect & Enterprise Connectors",
      "description": "Explore the Kafka Connect distributed framework: Source vs Sink Connectors, Debezium log-based Change Data Capture (CDC), S3 Sink Connectors, and Single Message Transforms (SMTs).",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "\n# Kafka Connect & Enterprise Connectors\n\nKafka Connect provides a scalable, fault-tolerant runtime for streaming data between Kafka and external databases, key-value stores, and cloud storage without custom client code.\n\n---\n\n## 1. Connect Architecture & Primitives\n\n- **Source Connector:** Ingests change streams from databases (e.g., Debezium MySQL CDC) into Kafka topics.\n- **Sink Connector:** Delivers messages from Kafka topics to external targets (e.g., Snowflake, S3, BigQuery, OpenSearch).\n- **Tasks:** Distributed units of execution assigned across Kafka Connect worker JVM processes.\n- **Single Message Transforms (SMTs):** Lightweight in-flight transformations (e.g., `ExtractNewRecordState`, `ValueToKey`, `RegexRouter`).\n\n---\n\n## 2. Debezium MySQL CDC Architecture\n\nDebezium streams table row modifications directly from the MySQL binary log (binlog) at the engine level:\n- Incurs near-zero database CPU overhead compared to polling queries.\n- Captures all `INSERT`, `UPDATE`, and `DELETE` operations with exact before/after states.\n- Emits structured events with schema metadata directly to Kafka.\n\n<div class=\"video-container\" style=\"position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;\">\n  <iframe src=\"https://www.youtube.com/embed/5a4G0kZ04rA\" title=\"Kafka Connect Architecture\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%;\"></iframe>\n</div>\n      "
    },
    {
      "id": "CH-DTE-020",
      "courseId": "CRS-DTE-001",
      "sequence": 20,
      "title": "Stream Processing with Kafka Streams & ksqlDB",
      "description": "Build lightweight stateful stream applications: Kafka Streams Topology DSL, KStream vs KTable duality, RocksDB embedded state stores, windowed aggregations, and ksqlDB SQL queries.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "\n# Stream Processing with Kafka Streams & ksqlDB\n\nKafka Streams is a client library for building real-time event-driven applications and microservices backed by Apache Kafka.\n\n---\n\n## 1. Stream-Table Duality (KStream vs KTable)\n\n- **KStream:** Represents an append-only stream of independent events (e.g., clicks, transactions). Every record is an INSERT.\n- **KTable:** Represents the current state of the world for each unique key. Every record is an UPDATE/UPSERT.\n- **Duality:** Replaying a KStream changelog reconstructs a KTable; emitting updates from a KTable produces a KStream.\n\n---\n\n## 2. State Stores & Windowing\n\n- **RocksDB Embedded State:** High-performance off-heap embedded key-value storage on local worker disks, continuously backed up to Kafka changelog topics.\n- **Window Types:** Tumbling (fixed, non-overlapping), Hopping (overlapping), Sliding, and Session windows.\n- **ksqlDB:** Allows developers to build real-time stream processing topologies using standard declarative SQL statements.\n\n<div class=\"video-container\" style=\"position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;\">\n  <iframe src=\"https://www.youtube.com/embed/Ch5VhJzaoaI\" title=\"Kafka Streams & ksqlDB\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%;\"></iframe>\n</div>\n      "
    },
    {
      "id": "CH-DTE-021",
      "courseId": "CRS-DTE-001",
      "sequence": 21,
      "title": "High-Throughput Stream Processing with Apache Flink",
      "description": "Master enterprise true stream processing: Apache Flink architecture, JobManager/TaskManager, asynchronous barrier snapshotting (Chandy-Lamport), Savepoints, and stateful stream joins.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "\n# High-Throughput Stream Processing with Apache Flink\n\nApache Flink is a native, event-driven distributed stream processor that evaluates records tuple-by-tuple with sub-millisecond latencies.\n\n---\n\n## 1. Flink Architecture & Distributed Topology\n\n- **JobManager (Master):** Coordinates task scheduling, resource allocation, and triggers asynchronous checkpoints.\n- **TaskManager (Worker):** Executes operator subtasks inside dedicated Task Slots and manages embedded RocksDB state backends.\n- **Continuous Execution:** Records flow through continuous network pipelines without artificial micro-batch delays.\n\n---\n\n## 2. Chandy-Lamport Checkpointing & Savepoints\n\n- **Asynchronous Barrier Snapshotting:** Injects checkpoint barriers into stream channels; operators snapshot local state without blocking in-flight records.\n- **Checkpoints:** Automatic, periodic lightweight snapshots for fast crash recovery.\n- **Savepoints:** Manually triggered, portable snapshots used for application upgrades, cluster migrations, and state schema evolution.\n\n<div class=\"video-container\" style=\"position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;\">\n  <iframe src=\"https://www.youtube.com/embed/5U23Yt2iY_g\" title=\"Apache Flink Architecture\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%;\"></iframe>\n</div>\n      "
    }
  ],
  "assessments": [
    {
      "id": "ASM-DTE-015",
      "courseId": "CRS-DTE-001",
      "chapterId": "CH-DTE-015",
      "title": "Assessment: Apache Kafka Core Architecture & Storage",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DTE-141",
          "type": "MCQ",
          "prompt": "What is a Partition in Apache Kafka?",
          "options": [
            "An ordered, immutable, append-only commit log that serves as the basic unit of parallelism and physical storage",
            "A temporary cache deleted after 60 seconds",
            "A relational database table with foreign key constraints",
            "A network firewall rule between brokers"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-142",
          "type": "MCQ",
          "prompt": "How does Linux Zero-Copy (via sendfile) optimize Kafka broker throughput?",
          "options": [
            "It transfers bytes directly from OS Page Cache to the Network Interface Card (NIC) buffer, avoiding CPU data copies into user-space JVM memory",
            "It compresses records to zero bytes",
            "It deletes messages immediately upon receipt",
            "It disables network encryption"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-143",
          "type": "MCQ",
          "prompt": "What are the three core files comprising a Kafka segment on disk?",
          "options": [
            ".log (data), .index (offset-to-byte position), and .timeindex (timestamp-to-offset)",
            ".csv, .json, and .xml",
            ".parquet, .orc, and .avro",
            ".dll, .so, and .bin"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-144",
          "type": "MCQ",
          "prompt": "What is KRaft in modern Apache Kafka clusters?",
          "options": [
            "An event-driven Raft consensus mechanism replacing ZooKeeper for cluster metadata and leader management",
            "A new graphical user interface for monitoring brokers",
            "A hardware accelerator card for ARM processors",
            "A Python SDK for producing messages"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-145",
          "type": "MCQ",
          "prompt": "What does an In-Sync Replica (ISR) represent?",
          "options": [
            "The set of partition replicas that are actively caught up with the partition leader's log within the replica.lag.time.max.ms window",
            "A broker located in a different geographical cloud region",
            "A backup copy saved to optical tape",
            "A consumer that reads data without lag"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-146",
          "type": "MCQ",
          "prompt": "What happens when 'cleanup.policy=compact' is configured on a Kafka topic?",
          "options": [
            "Kafka periodically deletes older records with the same message key, retaining only the latest value for each key",
            "All messages older than 24 hours are truncated",
            "The entire topic is compressed into a single zip file",
            "Zero-byte messages are dropped"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-147",
          "type": "MCQ",
          "prompt": "Why doesn't Apache Kafka store message data inside the JVM heap?",
          "options": [
            "To avoid catastrophic JVM Garbage Collection pauses and take full advantage of the operating system's automatic page cache management",
            "Because Java does not support byte arrays",
            "Because JVM heaps cannot exceed 512 MB",
            "Because KRaft requires disk storage only"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-148",
          "type": "MCQ",
          "prompt": "What is the function of the sparse '.index' file in a segment?",
          "options": [
            "Enables O(1) binary search to find the physical disk byte position for any given message logical offset",
            "Stores the primary keys of the source SQL table",
            "Lists all connected consumer IP addresses",
            "Tracks the user password hash"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-149",
          "type": "MCQ",
          "prompt": "What default condition causes Kafka to roll over an active segment file into a new segment?",
          "options": [
            "The segment file reaches segment.bytes (default 1GB) or segment.ms (default 7 days)",
            "Every 10,000 messages",
            "Whenever a consumer disconnects",
            "When the broker CPU exceeds 80%"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-150",
          "type": "MCQ",
          "prompt": "What is an Offset in Kafka?",
          "options": [
            "A monotonically increasing 64-bit integer uniquely identifying a message within a specific partition",
            "A timestamp in milliseconds since Unix epoch",
            "A UUID generated by the producer client",
            "A memory memory pointer address"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DTE-016",
      "courseId": "CRS-DTE-001",
      "chapterId": "CH-DTE-016",
      "title": "Assessment: Kafka Producer Internals & Guarantees",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DTE-151",
          "type": "MCQ",
          "prompt": "What is the function of 'linger.ms' in the Kafka Producer?",
          "options": [
            "Introduces an artificial delay to allow more records to accumulate into a single batch before sending, drastically increasing throughput",
            "Determines how long the producer waits before retrying a failed broker connection",
            "Sets the message time-to-live in the topic",
            "Controls the SSL handshake timeout"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-152",
          "type": "MCQ",
          "prompt": "Which 'acks' setting guarantees zero data loss if leader fails, provided min.insync.replicas >= 2?",
          "options": [
            "acks=all (or acks=-1)",
            "acks=1",
            "acks=0",
            "acks=leader"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-153",
          "type": "MCQ",
          "prompt": "How does 'enable.idempotence=true' prevent duplicate messages on producer retries?",
          "options": [
            "The broker tracks Producer IDs (PIDs) and sequence numbers, silently deduplicating batches that were already committed",
            "It drops all retried network packets",
            "It stores duplicate records in an error queue",
            "It disables producer retries completely"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-154",
          "type": "MCQ",
          "prompt": "How does the default Kafka partitioner assign a message to a partition when a non-null key is provided?",
          "options": [
            "It hashes the serialized key bytes using Murmur2 and computes: murmur2(key) % num_partitions",
            "It assigns partitions in round-robin sequence",
            "It sends the record to all partitions simultaneously",
            "It sends the record to partition 0 always"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-155",
          "type": "MCQ",
          "prompt": "What compression algorithm provides an outstanding combination of high compression ratio and ultra-fast decompression speed for Kafka producers?",
          "options": [
            "zstd or snappy",
            "bzip2",
            "7-Zip",
            "tar"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-156",
          "type": "MCQ",
          "prompt": "What happens if 'min.insync.replicas=2' is configured and only 1 broker replica is in the ISR when a producer sends with 'acks=all'?",
          "options": [
            "The broker rejects the write with a NotEnoughReplicasException, refusing to accept un-replicated data",
            "The broker accepts the write anyway and warns the producer",
            "The message is written to partition 0 instead",
            "The consumer group takes over the write"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-157",
          "type": "MCQ",
          "prompt": "Where are messages buffered inside the producer client before the background Sender thread transmits them?",
          "options": [
            "The RecordAccumulator",
            "The Local SSD swap file",
            "The Browser LocalStorage",
            "The OS Page Cache"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-158",
          "type": "MCQ",
          "prompt": "What setting limits the maximum amount of memory the producer can use for buffering un-sent records?",
          "options": [
            "buffer.memory",
            "batch.size",
            "max.request.size",
            "send.buffer.bytes"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-159",
          "type": "MCQ",
          "prompt": "To guarantee strict message ordering within a partition when retries are enabled, what must 'max.in.flight.requests.per.connection' be set to?",
          "options": [
            "1 (or <= 5 if idempotence is enabled)",
            "100",
            "Unlimited",
            "0"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-160",
          "type": "MCQ",
          "prompt": "What is the default partitioner behavior in modern Kafka (3.3+) when the message key is null?",
          "options": [
            "Built-in Sticky Partitioner batching records to one partition until batch.size is reached before switching to another partition",
            "Writing exclusively to partition 0",
            "Dropping the message with a NullPointerException",
            "Generating a random UUID key"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DTE-017",
      "courseId": "CRS-DTE-001",
      "chapterId": "CH-DTE-017",
      "title": "Assessment: Kafka Consumer Groups & Rebalancing",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DTE-161",
          "type": "MCQ",
          "prompt": "Can two consumers within the SAME Consumer Group read from the same topic partition simultaneously?",
          "options": [
            "No, each partition is assigned to at most one consumer instance within a specific group to guarantee in-order consumption",
            "Yes, Kafka supports concurrent reading within a partition by multiple group members",
            "Yes, if auto.commit is disabled",
            "Yes, if the topic has more than 100 partitions"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-162",
          "type": "MCQ",
          "prompt": "What happens if a topic has 4 partitions and a consumer group contains 6 active consumers?",
          "options": [
            "4 consumers will each process 1 partition, while 2 consumers will remain idle as hot standbys",
            "The cluster crashes due to partition exhaustion",
            "2 partitions will be read twice concurrently",
            "Kafka automatically splits the 4 partitions into 6"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-163",
          "type": "MCQ",
          "prompt": "What is the primary advantage of the CooperativeStickyAssignor over Eager rebalance assignors?",
          "options": [
            "It rebalances incrementally, allowing unaffected consumers to continue processing without triggering a stop-the-world rebalance storm",
            "It reorders partitions alphabetically",
            "It reduces partition storage by 50%",
            "It replaces the broker with a Kubernetes daemon"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-164",
          "type": "MCQ",
          "prompt": "Where does Apache Kafka store consumer group committed offsets?",
          "options": [
            "In an internal, highly replicated, compacted topic named '__consumer_offsets'",
            "In a file on the consumer laptop",
            "In an external MySQL database",
            "In Apache ZooKeeper root node '/offsets'"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-165",
          "type": "MCQ",
          "prompt": "What is 'Consumer Lag'?",
          "options": [
            "The numerical difference between the latest message offset written to a partition and the consumer group's last committed offset",
            "The time taken to boot a consumer container",
            "The network ping between consumer and broker",
            "The duration of an SSL handshake"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-166",
          "type": "MCQ",
          "prompt": "What risk is associated with 'enable.auto.commit=true' in production consumer applications?",
          "options": [
            "Offsets may be committed before business logic has completed processing, leading to silent data loss during container crashes",
            "The broker runs out of disk space immediately",
            "Network sockets are blocked permanently",
            "The consumer cannot subscribe to more than 1 topic"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-167",
          "type": "MCQ",
          "prompt": "What setting determines the maximum time allowed between consecutive poll() calls before a consumer is deemed dead and removed from the group?",
          "options": [
            "max.poll.interval.ms",
            "session.timeout.ms",
            "heartbeat.interval.ms",
            "connection.timeout.ms"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-168",
          "type": "MCQ",
          "prompt": "What does 'auto.offset.reset=earliest' specify?",
          "options": [
            "If no committed offset exists for the group, the consumer starts reading from the very beginning of the partition log",
            "The consumer reads only messages produced after it starts up",
            "The consumer throws an exception if the partition has offsets",
            "The consumer reads only even-numbered offsets"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-169",
          "type": "MCQ",
          "prompt": "How often should consumer background heartbeats be transmitted relative to 'session.timeout.ms'?",
          "options": [
            "heartbeat.interval.ms should typically be 1/3 of session.timeout.ms (e.g., 3s heartbeat for 10s timeout)",
            "They should be exactly equal",
            "Heartbeats should be sent once per hour",
            "Heartbeats are not required in Kafka"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-170",
          "type": "MCQ",
          "prompt": "Which broker is designated to coordinate group membership, heartbeats, and rebalances for a given consumer group?",
          "options": [
            "The Group Coordinator (the leader broker of the __consumer_offsets partition hash of group.id)",
            "The oldest broker in the cluster",
            "Broker ID 0 always",
            "Any randomly chosen worker node"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DTE-018",
      "courseId": "CRS-DTE-001",
      "chapterId": "CH-DTE-018",
      "title": "Assessment: Schema Registry & Binary Serialization",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DTE-171",
          "type": "MCQ",
          "prompt": "What does the 5-byte header in Confluent Schema Registry wire format consist of?",
          "options": [
            "1 magic byte (0x00) followed by a 4-byte registered Schema ID in big-endian order",
            "5 ASCII characters representing the schema name",
            "A 5-byte SHA-256 hash checksum",
            "The Unix epoch timestamp of message generation"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-172",
          "type": "MCQ",
          "prompt": "Under 'BACKWARD' compatibility, what is the upgrade sequence rule between consumers and producers?",
          "options": [
            "Consumers must be upgraded to support the new schema before producers begin publishing with it",
            "Producers must be upgraded first",
            "Brokers must be restarted before each message",
            "Consumers and producers cannot be upgraded"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-173",
          "type": "MCQ",
          "prompt": "Why are Avro binary serialized payloads significantly smaller than equivalent JSON payloads?",
          "options": [
            "Avro payloads contain only raw binary data values without field names or redundant quotes, relying on the schema for deserialization",
            "Avro deletes all decimal numbers",
            "Avro converts strings to 1-bit flags",
            "Avro runs only on encrypted network channels"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-174",
          "type": "MCQ",
          "prompt": "Under 'FULL' compatibility, what mandatory requirement applies to any newly added field in a schema?",
          "options": [
            "The new field must specify a default value",
            "The new field must be named 'id'",
            "The new field can only be an integer",
            "The new field cannot be nullable"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-175",
          "type": "MCQ",
          "prompt": "What happens if a producer attempts to publish a message with an evolved schema that violates the subject's compatibility rules?",
          "options": [
            "The Schema Registry rejects the schema registration with an HTTP 409 Conflict, and the producer fails to serialize the record",
            "The broker accepts the message and deletes the topic",
            "The consumer group is immediately stopped",
            "The schema is automatically translated to XML"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-176",
          "type": "MCQ",
          "prompt": "How does a consumer know which schema to use when deserializing an Avro message from Kafka?",
          "options": [
            "It extracts the 4-byte Schema ID from the 5-byte header and retrieves the corresponding schema from the local cache or Schema Registry",
            "It queries the topic name and guesses the schema",
            "It checks the SQL database catalog",
            "The full schema is embedded in every single message"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-177",
          "type": "MCQ",
          "prompt": "In Avro schemas, how is an optional (nullable) field defined?",
          "options": [
            "Using a union type containing null and the data type: [\"null\", \"string\"] with default: null",
            "Using the keyword 'optional string'",
            "Setting nullable: true in the header",
            "Leaving the field name blank"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-178",
          "type": "MCQ",
          "prompt": "What is a 'Subject' in Confluent Schema Registry?",
          "options": [
            "The scope under which schemas evolve and are registered (e.g., '<topic-name>-value' or '<topic-name>-key')",
            "The TLS certificate common name",
            "The user identity running the Kafka cluster",
            "The primary key column of the source table"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-179",
          "type": "MCQ",
          "prompt": "What is the primary benefit of 'FORWARD' compatibility?",
          "options": [
            "Producers can be upgraded first to publish new schemas, and existing consumers can still read records without failing",
            "Consumers can read records backward in time",
            "Network latency is reduced by forwarding packets",
            "Kafka topics can be read from both ends"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-180",
          "type": "MCQ",
          "prompt": "Which modern binary serialization format provides comparable contract safety to Avro and is heavily used in Google microservices?",
          "options": [
            "Protocol Buffers (Protobuf)",
            "YAML",
            "CSV with RFC 4180 headers",
            "HTML5 WebSockets"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DTE-019",
      "courseId": "CRS-DTE-001",
      "chapterId": "CH-DTE-019",
      "title": "Assessment: Kafka Connect & Enterprise Connectors",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DTE-181",
          "type": "MCQ",
          "prompt": "What is the primary distinction between a Source Connector and a Sink Connector in Kafka Connect?",
          "options": [
            "Source connectors ingest data from external systems into Kafka; Sink connectors export data from Kafka into external datastores",
            "Source connectors read JSON; Sink connectors read CSV",
            "Source connectors run on Linux; Sink connectors run on Windows",
            "Source connectors are synchronous; Sink connectors are asynchronous"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-182",
          "type": "MCQ",
          "prompt": "How does the Debezium MySQL CDC Connector capture table modifications without impacting operational query performance?",
          "options": [
            "It continuously reads row changes directly from the MySQL binary log (binlog) at the storage engine level",
            "It runs 'SELECT * FROM table' every 500 milliseconds",
            "It adds database triggers on every column",
            "It locks the database table during each read"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-183",
          "type": "MCQ",
          "prompt": "What is a Single Message Transform (SMT) in Kafka Connect?",
          "options": [
            "A lightweight in-flight transformation that modifies, filters, or routes an individual record before it is written to Kafka or external storage",
            "A large batch Spark aggregation job",
            "A SQL stored procedure",
            "A network firewall inspection rule"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-184",
          "type": "MCQ",
          "prompt": "Which Debezium SMT transforms nested CDC change envelopes (with 'before', 'after', 'op') into a clean flat record payload?",
          "options": [
            "io.debezium.transforms.ExtractNewRecordState",
            "org.apache.kafka.connect.transforms.Flatten",
            "io.debezium.transforms.DropOldState",
            "org.apache.kafka.connect.transforms.UnpackPayload"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-185",
          "type": "MCQ",
          "prompt": "How does Kafka Connect scale across a distributed cluster?",
          "options": [
            "A Connector splits its workload into multiple parallel Tasks, which are distributed across the worker JVM nodes in the Connect cluster",
            "By increasing the RAM on the database master node",
            "By spinning up separate Kafka clusters for each table",
            "By running one connector per Docker container exclusively"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-186",
          "type": "MCQ",
          "prompt": "Where does a distributed Kafka Connect cluster store its internal configurations, task assignments, and source offsets?",
          "options": [
            "In internal Kafka topics (connect-configs, connect-status, connect-offsets)",
            "In an external MySQL database",
            "In local text files under /etc/kafka",
            "In Redis memory"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-187",
          "type": "MCQ",
          "prompt": "What happens when a Kafka Connect worker node crashes in distributed mode?",
          "options": [
            "The cluster triggers a rebalance and reassigns the failed worker's tasks to surviving workers, resuming from committed offsets",
            "All data in Kafka topics is erased",
            "The entire Connect cluster must be manually re-installed",
            "The source database locks up"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-188",
          "type": "MCQ",
          "prompt": "Which connector is commonly used to batch and write streaming Kafka events into Amazon S3 in Parquet format?",
          "options": [
            "Confluent Amazon S3 Sink Connector",
            "Debezium S3 Connector",
            "AWS Lambda Sync Tool",
            "Kafka MirrorMaker 1"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-189",
          "type": "MCQ",
          "prompt": "How can database credentials be securely injected into a Kafka Connect REST configuration?",
          "options": [
            "Using ConfigProvider plugins (e.g., FileConfigProvider or AWS SecretsManagerConfigProvider via variable substitution)",
            "Hardcoding plaintext passwords in the JSON payload",
            "Passing credentials via cleartext HTTP URL query parameters",
            "Disabling database authentication"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-190",
          "type": "MCQ",
          "prompt": "What is the purpose of the 'ValueToKey' SMT in Kafka Connect?",
          "options": [
            "Extracts a designated field from the message payload and sets it as the Kafka record key for partition hashing",
            "Converts numerical values into encryption keys",
            "Validates user credentials against LDAP",
            "Replaces message keys with random timestamps"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DTE-020",
      "courseId": "CRS-DTE-001",
      "chapterId": "CH-DTE-020",
      "title": "Assessment: Kafka Streams & ksqlDB",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DTE-191",
          "type": "MCQ",
          "prompt": "What is the core conceptual difference between a KStream and a KTable in Kafka Streams?",
          "options": [
            "A KStream models an append-only stream of independent events; a KTable models a changelog view representing the latest state for each key",
            "A KStream is read-only; a KTable is write-only",
            "A KStream runs on Spark; a KTable runs on Kafka",
            "A KStream does not support keys"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-192",
          "type": "MCQ",
          "prompt": "What embedded database is used by default in Kafka Streams to manage stateful aggregations and joins on local worker disks?",
          "options": [
            "RocksDB",
            "SQLite",
            "H2 Database",
            "PostgreSQL"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-193",
          "type": "MCQ",
          "prompt": "How does Kafka Streams ensure fault tolerance for local state stores if a container or node crashes?",
          "options": [
            "State updates are continuously backed up to an internal Kafka changelog topic; on restart, the state store is rebuilt from the changelog",
            "By taking daily disk snapshots to S3",
            "By replicating RAM to another computer via SSH",
            "State is discarded and cannot be recovered"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-194",
          "type": "MCQ",
          "prompt": "What is ksqlDB?",
          "options": [
            "An event streaming database built on Kafka that enables real-time stream processing using standard SQL syntax",
            "A relational database replacement for PostgreSQL",
            "A NoSQL key-value cache like Redis",
            "A desktop SQL query editor"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-195",
          "type": "MCQ",
          "prompt": "What is the duality of streams and tables in stream processing?",
          "options": [
            "A stream can be transformed into a table by aggregating its changelog, and a table can be converted into a stream by emitting its change records",
            "Streams and tables use the same file extensions on disk",
            "Streams run on CPU; tables run on RAM",
            "There is no relationship between streams and tables"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-196",
          "type": "MCQ",
          "prompt": "In a Kafka Streams application, what happens when you perform a groupBy() on a column that is NOT the current record key?",
          "options": [
            "It triggers an internal repartitioning shuffle, writing records to a temporary repartition topic partitioned by the new key",
            "It causes an immediate compile error",
            "It combines all rows onto partition 0",
            "It executes on the database server"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-197",
          "type": "MCQ",
          "prompt": "What is a 'Tumbling Window' in Kafka Streams?",
          "options": [
            "A fixed-size, non-overlapping, contiguous time window based on event timestamps",
            "A window that moves forward every millisecond",
            "A window that expands indefinitely until memory runs out",
            "A window that tracks physical row counts instead of time"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-198",
          "type": "MCQ",
          "prompt": "What is the difference between a Push Query and a Pull Query in ksqlDB?",
          "options": [
            "A Push query streams continuous incremental updates to the client; a Pull query retrieves the current snapshot state of a table like a traditional SQL query",
            "Push queries use HTTP POST; Pull queries use HTTP GET",
            "Push queries modify data; Pull queries delete data",
            "Pull queries run on Spark; Push queries run on Kafka"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-199",
          "type": "MCQ",
          "prompt": "What does 'GlobalKTable' provide in Kafka Streams?",
          "options": [
            "A fully replicated cache of an entire topic populated on every instance of the application, enabling joins without co-partitioning",
            "A table synchronized across 100 cloud regions",
            "A table accessible by all external web users",
            "A table that cannot be queried"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-200",
          "type": "MCQ",
          "prompt": "Why is co-partitioning mandatory when performing a join between two KStreams or between a KStream and a KTable?",
          "options": [
            "Both topics must have the same number of partitions and use the same partitioning key strategy so matching keys reside on the same worker node",
            "To ensure both topics use the exact same schema version",
            "To synchronize the clock speeds of Kafka brokers",
            "Co-partitioning is only required for CSV data"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DTE-021",
      "courseId": "CRS-DTE-001",
      "chapterId": "CH-DTE-021",
      "title": "Assessment: Stream Processing with Apache Flink",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DTE-201",
          "type": "MCQ",
          "prompt": "How does Apache Flink's processing model differ fundamentally from Apache Spark's default Structured Streaming?",
          "options": [
            "Flink processes events continuous tuple-by-tuple with sub-millisecond latencies, whereas Spark defaults to micro-batching intervals",
            "Flink does not support stateful stream processing",
            "Spark cannot read from Apache Kafka",
            "Flink runs exclusively in Python without JVM"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-202",
          "type": "MCQ",
          "prompt": "What algorithm does Apache Flink use for distributed, non-blocking asynchronous state snapshotting?",
          "options": [
            "Chandy-Lamport variant using Checkpoint Barriers flowing through data streams",
            "Two-Phase Commit locking all tables",
            "Paxos consensus protocol",
            "Full cluster memory freezing"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-203",
          "type": "MCQ",
          "prompt": "What is the primary difference between a Flink Checkpoint and a Flink Savepoint?",
          "options": [
            "Checkpoints are automatic and internal for machine failure recovery; Savepoints are manually triggered, portable snapshots for upgrades and migrations",
            "Checkpoints store data in RAM; Savepoints store data on floppy disks",
            "Checkpoints are triggered by users; Savepoints are triggered by brokers",
            "Savepoints are only supported in Spark"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-204",
          "type": "MCQ",
          "prompt": "What are the master and worker components of an Apache Flink cluster called?",
          "options": [
            "JobManager (Master) and TaskManager (Worker)",
            "Driver and Executor",
            "NameNode and DataNode",
            "Controller and Broker"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-205",
          "type": "MCQ",
          "prompt": "What state backend in Flink is designed to support multi-terabyte state exceeding TaskManager JVM heap limits?",
          "options": [
            "EmbeddedRocksDBStateBackend",
            "HashMapStateBackend",
            "MemoryStateBackend",
            "FileStreamStateBackend"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-206",
          "type": "MCQ",
          "prompt": "What happens when an operator in Flink receives a Checkpoint Barrier on one input channel while waiting for barriers on other channels?",
          "options": [
            "In aligned checkpointing, it buffers records from the completed channel until barriers arrive on all channels before taking the snapshot",
            "It drops all subsequent records immediately",
            "It restarts the TaskManager",
            "It converts the stream into batch mode"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-207",
          "type": "MCQ",
          "prompt": "What does 'Unaligned Checkpoints' in Flink improve during periods of heavy backpressure?",
          "options": [
            "Barriers overtake buffered in-flight data, allowing checkpoints to complete quickly even when processing queues are completely full",
            "It disables checkpointing during peak hours",
            "It drops slow consumers from the cluster",
            "It increases network latency intentionally"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-208",
          "type": "MCQ",
          "prompt": "What library in Apache Flink provides Complex Event Processing (CEP) to detect pattern sequences across event streams?",
          "options": [
            "FlinkCEP",
            "FlinkML",
            "FlinkSQL",
            "Gelly"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-209",
          "type": "MCQ",
          "prompt": "How does Flink handle end-to-end exactly-once delivery when writing to external sinks like Kafka or S3?",
          "options": [
            "Through a Two-Phase Commit (2PC) protocol coordinated with Flink checkpoints (e.g., FlinkKafkaProducer / TwoPhaseCommitSinkFunction)",
            "By writing each message three times",
            "By disabling consumer retries",
            "By using HTTP basic auth"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DTE-210",
          "type": "MCQ",
          "prompt": "What is a 'Task Slot' in a Flink TaskManager?",
          "options": [
            "A fixed slice of resources (specifically JVM managed memory) capable of running one parallel operator subtask",
            "A physical USB port on the server",
            "A scheduled cron job interval",
            "A reserved TCP port on the network interface"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    }
  ]
};
