// Course 9: MLOps Masterclass - Phase 2: Workflow Orchestration & Distributed Training
// Chapters 7 to 12 | Assessments 7 to 12 | 60 MCQs

export const phase2 = {
  chapters: [
    {
      id: "CH-MLO-007",
      courseId: "CRS-MLO-001",
      sequence: 7,
      title: "Containerized ML Pipelines with Kubeflow Pipelines (KFP)",
      description: "Author cloud-native ML pipelines with KFP v2 SDK: lightweight Python components, typed inputs/outputs, pipeline DAGs, and metadata lineage on Kubernetes.",
      contentType: "Rich Text",
      durationMinutes: 85,
      minimumTimeMinutes: 55,
      body: `
# Containerized ML Pipelines with Kubeflow Pipelines (KFP)

Ad-hoc Python scripts executed manually on local machines cannot scale to production. **Kubeflow Pipelines (KFP)** is the leading cloud-native orchestration platform for building reproducible, modular, and scalable machine learning workflows on top of Kubernetes.

---

## 1. KFP v2 Architecture & Components

\`\`\`
+--------------------------------------------------------------------------+
| KUBEFLOW PIPELINES CONTROL PLANE (Kubernetes)                            |
|                                                                          |
|  +-----------------------+     Pipeline JSON      +--------------------+ |
|  | KFP Python SDK (v2)   | ---------------------> | KFP API Server     | |
|  | (@component, @pipeline|                        | & Pipeline Engine  | |
|  +-----------------------+                        +--------------------+ |
|                                                              |           |
|                                         Schedules execution Pods |       |
|                                                              v           |
|  +--------------------------------------------------------------------+  |
|  | KUBERNETES WORKER NODES                                            |  |
|  |  [ Step 1: Preprocess Pod ] -> [ Step 2: GPU Training Pod ] -> ...  |  |
|  +--------------------------------------------------------------------+  |
|                                                                          |
|  +-----------------------+                        +--------------------+ |
|  | ML Metadata (MLMD)    | <--- Logs lineage ---> | Artifact Store     | |
|  | (MySQL / SQLite)      |                        | (MinIO / AWS S3)   | |
|  +-----------------------+                        +--------------------+ |
+--------------------------------------------------------------------------+
\`\`\`

---

## 2. Authoring KFP v2 Components in Python

With the KFP v2 SDK, Python functions are decorated with \`@dsl.component\` to automatically build self-contained container steps:

\`\`\`python
from kfp import dsl
from kfp.dsl import Input, Output, Dataset, Model, Metrics

# Step 1: Lightweight Preprocessing Component
@dsl.component(
    base_image="python:3.11-slim",
    packages_to_install=["pandas==2.2.0", "pyarrow==15.0.0"]
)
def preprocess_data(
    raw_data_url: str,
    processed_dataset: Output[Dataset]
):
    import pandas as pd
    df = pd.read_csv(raw_data_url)
    # Perform cleaning & feature engineering
    df = df.dropna()
    df.to_parquet(processed_dataset.path)

# Step 2: GPU Training Component
@dsl.component(
    base_image="pytorch/pytorch:2.2.0-cuda12.1-cudnn8-runtime",
    packages_to_install=["scikit-learn==1.4.0"]
)
def train_model(
    dataset: Input[Dataset],
    epochs: int,
    trained_model: Output[Model],
    eval_metrics: Output[Metrics]
):
    import pandas as pd
    import torch
    
    df = pd.read_parquet(dataset.path)
    # Simulated training loop...
    accuracy = 0.942
    
    # Save model artifact and log metrics to MLMD
    torch.save({"weights": "..." }, trained_model.path)
    eval_metrics.log_metric("accuracy", accuracy)

# Step 3: Define Pipeline DAG
@dsl.pipeline(
    name="churn-prediction-pipeline",
    description="End-to-end automated customer churn model training"
)
def churn_pipeline(data_url: str, epochs: int = 50):
    prep_task = preprocess_data(raw_data_url=data_url)
    
    train_task = train_model(
        dataset=prep_task.outputs["processed_dataset"],
        epochs=epochs
    )
    # Allocate dedicated NVIDIA GPU to the training pod
    train_task.set_gpu_limit(1).add_node_selector_constraint("nvidia.com/gpu", "nvidia-a100")
\`\`\`

---

## 3. Pipeline Compilation & Submission

\`\`\`python
from kfp import compiler, client

# Compile pipeline DAG into declarative YAML
compiler.Compiler().compile(
    pipeline_func=churn_pipeline,
    package_path="churn_pipeline.yaml"
)

# Submit run directly to remote Kubeflow cluster
kfp_client = client.Client(host="https://kubeflow.corp.internal/pipeline")
run = kfp_client.create_run_from_pipeline_package(
    pipeline_file="churn_pipeline.yaml",
    arguments={"data_url": "s3://enterprise-lake/churn_raw.csv", "epochs": 100}
)
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/5a4G0kZ04rA" title="Kubeflow Pipelines Complete Walkthrough" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-MLO-008",
      courseId: "CRS-MLO-001",
      sequence: 8,
      title: "Cloud-Native Training Workflows with Argo Workflows & Tekton",
      description: "Orchestrate complex ML pipelines using native Kubernetes CRDs with Argo Workflows and Tekton: DAG dependencies, artifact passing, and retries.",
      contentType: "Rich Text",
      durationMinutes: 80,
      minimumTimeMinutes: 50,
      body: `
# Cloud-Native Training Workflows with Argo Workflows & Tekton

While KFP provides a Python-first abstraction, **Argo Workflows** is the underlying Kubernetes-native workflow engine that actually executes container pods. In platform engineering teams, writing declarative Argo Workflow manifests directly unlocks raw cluster scheduling, spot-instance tolerance, and infrastructure efficiency.

---

## 1. Argo Workflows DAG Architecture

\`\`\`yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: distributed-training-dag-
  namespace: ml-workflows
spec:
  entrypoint: ml-pipeline
  serviceAccountName: argo-workflow-runner
  templates:
    - name: ml-pipeline
      dag:
        tasks:
          - name: extract-features
            template: feature-extractor
          - name: train-xgboost
            dependencies: [extract-features]
            template: model-trainer
            arguments:
              parameters: [{name: algo, value: "xgboost"}]
          - name: train-pytorch
            dependencies: [extract-features]
            template: model-trainer
            arguments:
              parameters: [{name: algo, value: "pytorch"}]
          - name: evaluate-best
            dependencies: [train-xgboost, train-pytorch]
            template: model-evaluator

    - name: model-trainer
      inputs:
        parameters:
          - name: algo
      container:
        image: 123456789012.dkr.ecr.us-east-1.amazonaws.com/ml-trainers:v1.2.0
        command: [python, train.py]
        args: ["--algorithm", "{{inputs.parameters.algo}}"]
        resources:
          limits:
            nvidia.com/gpu: 1
\`\`\`

---

## 2. Key Argo Capabilities for ML Operations

- **Fault Tolerance & Retries:** Configure exponential backoff retry policies for training jobs running on cheaper, pre-emptible AWS Spot instances.
- **Shared Volume Artifacts:** Pass intermediate multi-gigabyte embeddings between pods using shared \`PersistentVolumeClaims\` without uploading to external S3 buckets.
- **Conditional Branching:** Only trigger the deployment stage if the evaluation step produces a model with validation accuracy $> 90\\%$.

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/MeU5_k9ss5Y" title="Argo Workflows for Machine Learning" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-MLO-009",
      courseId: "CRS-MLO-001",
      sequence: 9,
      title: "Distributed Deep Learning: Data, Model & Pipeline Parallelism",
      description: "Master distributed training paradigms: Data Parallelism (DDP), Tensor Model Parallelism, Pipeline Parallelism, NCCL, Ring-AllReduce, and ZeRO.",
      contentType: "Rich Text",
      durationMinutes: 90,
      minimumTimeMinutes: 60,
      body: `
# Distributed Deep Learning: Data, Model & Pipeline Parallelism

Modern foundation models (containing tens or hundreds of billions of parameters) cannot fit into the VRAM of a single GPU (e.g., an 80 GB NVIDIA H100). Training these massive architectures requires distributing compute across hundreds of GPUs using sophisticated parallelism strategies.

---

## 1. The Distributed Training Taxonomy

\`\`\`
+--------------------------------------------------------------------------+
| 1. DATA PARALLELISM (PyTorch DDP / FSDP)                                 |
| - Model weights are replicated across all N GPUs.                        |
| - Each GPU processes a distinct slice (batch) of the dataset.            |
| - Gradients are averaged across all GPUs via Ring-AllReduce at each step.|
| - Constraint: Model weights and optimizer states must fit on ONE GPU.    |
+--------------------------------------------------------------------------+
                                    |
+--------------------------------------------------------------------------+
| 2. TENSOR MODEL PARALLELISM (Megatron-LM)                                |
| - Individual weight matrices (linear layers, self-attention) are sliced  |
|   across GPUs in the same node (e.g., RowParallel / ColumnParallel).    |
| - Requires ultra-high bandwidth (NVLink: 900 GB/s) between GPUs.         |
+--------------------------------------------------------------------------+
                                    |
+--------------------------------------------------------------------------+
| 3. PIPELINE PARALLELISM (GPipe)                                          |
| - Layers of the model are partitioned sequentially across nodes.         |
|   (Layers 1-10 on GPU 1; Layers 11-20 on GPU 2).                         |
| - Micro-batching mitigates pipeline bubble idle time.                    |
+--------------------------------------------------------------------------+
\`\`\`

---

## 2. Zero Redundancy Optimizer (ZeRO) Stages

DeepSpeed's **ZeRO** eliminates memory redundancy in Data Parallelism by partitioning optimizer states, gradients, and model parameters across workers:

\`\`\`
STANDARD DDP:   GPU 1 [Params | Grads | Opt]   GPU 2 [Params | Grads | Opt] (Massive Redundancy)

ZeRO Stage 1:   Partitions Optimizer States (4x memory reduction)
ZeRO Stage 2:   Partitions Optimizer States + Gradients (8x memory reduction)
ZeRO Stage 3:   Partitions Optimizer States + Gradients + Model Parameters (Linear scaling to thousands of GPUs)
\`\`\`

---

## 3. High-Performance AllReduce with NVIDIA NCCL

In PyTorch DistributedDataParallel (DDP), gradient synchronization does not route through a centralized master node. Instead, it utilizes **Ring-AllReduce** over the NVIDIA Collective Communications Library (NCCL), where GPUs pass tensor chunks in a logical ring topology, achieving near-optimal network saturation independent of the number of GPUs.

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/S4A_51cR54o" title="Distributed Deep Learning & Data Parallelism Explained" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-MLO-010",
      courseId: "CRS-MLO-001",
      sequence: 10,
      title: "Scalable Hyperparameter Optimization with Ray Tune & Optuna",
      description: "Automate hyperparameter tuning: Bayesian optimization, Tree-structured Parzen Estimators (TPE), Hyperband, and ASHA early-stopping scheduling.",
      contentType: "Rich Text",
      durationMinutes: 80,
      minimumTimeMinutes: 50,
      body: `
# Scalable Hyperparameter Optimization with Ray Tune & Optuna

Tuning hyperparameters via manual trial-and-error or brute-force Grid Search wastes hundreds of thousands of dollars in cloud GPU compute. Modern hyperparameter optimization (HPO) pairs intelligent probabilistic search algorithms with aggressive early stopping schedulers.

---

## 1. Search Algorithms vs. Trial Schedulers

\`\`\`
+------------------------------------+      +------------------------------------+
| SEARCH ALGORITHMS (WHAT to try)    |      | TRIAL SCHEDULERS (WHEN to stop)    |
+------------------------------------+      +------------------------------------+
| - Random Search                    |      | - FIFO (Run all trials to end)     |
| - Bayesian Optimization            |      | - Median Stopping Rule             |
| - Tree-structured Parzen           |      | - Hyperband                        |
|   Estimator (TPE / Optuna)         |      | - ASHA (Asynchronous Successive    |
|   Learns from past trial losses!   |      |   Halving Algorithm)               |
+------------------------------------+      +------------------------------------+
\`\`\`

### Why ASHA Outperforms Standard Hyperband:
Standard Hyperband requires synchronous evaluation rounds (waiting for slow straggler trials before pruning the worst bottom $50\\%$). **ASHA** prunes underperforming trials asynchronously, keeping 100% of GPU worker nodes continuously saturated without idle waiting.

---

## 2. Distributed Tuning with Ray Tune & Optuna

\`\`\`python
import ray
from ray import tune
from ray.tune.schedulers import ASHAScheduler
from ray.tune.search.optuna import OptunaSearch

def objective(config):
    # Simulated training step
    for epoch in range(100):
        val_loss = (config["lr"] - 0.01)**2 + (config["batch_size"] / 1000) + (1.0 / (epoch + 1))
        # Report metric to Tune
        tune.report(loss=val_loss, epoch=epoch)

# Define Hyperparameter Search Space
search_space = {
    "lr": tune.loguniform(1e-4, 1e-1),
    "batch_size": tune.choice([32, 64, 128, 256]),
    "dropout": tune.uniform(0.1, 0.5),
}

# Configure Optuna Bayesian Search
search_algo = OptunaSearch(metric="loss", mode="min")

# Configure ASHA Early Stopping
scheduler = ASHAScheduler(
    max_t=100,
    grace_period=10, # Give every trial at least 10 epochs
    reduction_factor=3
)

# Launch distributed tuning across Ray cluster
tuner = tune.Tuner(
    objective,
    tune_config=tune.TuneConfig(
        search_alg=search_algo,
        scheduler=scheduler,
        num_samples=50 # Run 50 trials
    ),
    param_space=search_space,
)
results = tuner.fit()
print("Best Hyperparameters:", results.get_best_result(metric="loss", mode="min").config)
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/5U_7L5jUu7o" title="Hyperparameter Tuning with Ray Tune & Optuna" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-MLO-011",
      courseId: "CRS-MLO-001",
      sequence: 11,
      title: "GPU Infrastructure Management & Kubernetes Scheduling",
      description: "Manage GPU clusters: NVIDIA GPU Operator, CUDA driver virtualization, MIG (Multi-Instance GPU), GPU time-slicing, and Dynamic Resource Allocation (DRA).",
      contentType: "Rich Text",
      durationMinutes: 80,
      minimumTimeMinutes: 50,
      body: `
# GPU Infrastructure Management & Kubernetes Scheduling

Modern enterprise GPUs (NVIDIA A100/H100) are scarce and expensive ($30,000+ per card). Efficient platform engineering ensures GPUs are virtualized, fractionally partitioned, and scheduled with maximum compute density.

---

## 1. The NVIDIA GPU Operator Architecture

Instead of manually installing proprietary NVIDIA kernel drivers, container runtimes, and CUDA toolkits on every bare-metal worker node, the **NVIDIA GPU Operator** automates the entire lifecycle as Kubernetes DaemonSets:

\`\`\`
+--------------------------------------------------------------------------+
| KUBERNETES WORKER NODE                                                   |
|                                                                          |
|  [ NVIDIA Driver Container ]       --> Installs host kernel drivers      |
|  [ NVIDIA Container Toolkit ]      --> Configures containerd CDI         |
|  [ NVIDIA Device Plugin ]          --> Advertises 'nvidia.com/gpu' alloc |
|  [ NVIDIA DCGM Exporter ]          --> Exports Prometheus GPU metrics    |
|  [ NVIDIA MIG Manager ]            --> Partitions physical GPU into slices|
+--------------------------------------------------------------------------+
\`\`\`

---

## 2. Multi-Instance GPU (MIG) vs. Time-Slicing

| Feature | GPU Time-Slicing | Multi-Instance GPU (MIG) |
|---|---|---|
| **Supported Hardware** | All NVIDIA GPUs | NVIDIA Ampere & Hopper (A100, H100) |
| **Isolation Model** | Interleaved time-shared execution | **Hardware-level physical isolation** |
| **Fault Isolation** | None (OOM on one container crashes all) | **Full hardware memory & compute protection** |
| **QoS Guarantees** | Best-effort | Guaranteed deterministic memory & bandwidth |
| **Ideal Workload** | Development, testing, lightweight inference | **Enterprise production multi-tenant inference** |

### Partitioning an A100 80GB GPU via MIG:
An A100 can be sliced into up to **7 independent instances** (e.g., 7 instances of \`1g.10gb\` each with 10 GB dedicated VRAM), allowing 7 separate inference microservices to execute concurrently with zero noisy-neighbor interference!

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/5a4G0kZ04rA" title="NVIDIA GPU Operator & Kubernetes MIG" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-MLO-012",
      courseId: "CRS-MLO-001",
      sequence: 12,
      title: "Continuous Training & CI/CD for Machine Learning (CT/CD)",
      description: "Build automated Continuous Training (CT) and Continuous Delivery (CD) pipelines: data trigger events, automated regression testing, and shadow evaluation.",
      contentType: "Rich Text",
      durationMinutes: 80,
      minimumTimeMinutes: 50,
      body: `
# Continuous Training & CI/CD for Machine Learning (CT/CD)

Deploying a model once is trivial; building an automated software delivery pipeline that continuously retrains, validates, regression tests, and promotes models in response to real-world data drift is the holy grail of MLOps.

---

## 1. The Automated Continuous Training (CT) Trigger Matrix

\`\`\`
TRIGGER EVENT
+-----------------------+
| 1. On-Demand (Manual) | ---> Initiated by Data Scientist for ad-hoc experimentation
+-----------------------+
| 2. Schedule-Driven    | ---> Retrain nightly or weekly (e.g., Sunday at 02:00 UTC)
+-----------------------+
| 3. Data-Volume Driven | ---> Retrain when 50,000 new labeled samples accumulate in lake
+-----------------------+
| 4. Drift-Event Driven | ---> Automated webhook fired when Evidently AI detects > 5% drift
+-----------------------+
            |
            v
[ EXECUTE KUBEFLOW / ARGO RETRAINING PIPELINE ]
            |
            v
[ MODEL REGRESSION & SHADOW VALIDATION GATE ]
            |
    Meets SLA thresholds?
            |
            +---> YES: Promote to '@challenger' alias & launch Canary Rollout
            +---> NO:  Quarantine run, alert Slack, retain existing '@champion'
\`\`\`

---

## 2. Model Regression Testing Gate

Before any retrained model can be deployed, it must pass rigorous regression testing against a held-out Golden Benchmark Evaluation Suite:
1. **Accuracy Threshold Gate:** Model ROC-AUC must not drop by more than $0.5\\%$ compared to the current Production champion model.
2. **Inference Latency Gate:** Model $p99$ response latency must remain under $50\\text{ms}$ at 500 RPS load.
3. **Data Slice Fairness Gate:** Model accuracy must not exhibit statistically significant bias across demographic sub-slices (e.g., age, geographic region).
4. **Adversarial & Stress Gate:** Model must reject malformed, out-of-range, and prompt-injection inputs gracefully.

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/scEDHsr3APg" title="CI/CD for Machine Learning (CT/CD) Architecture" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
  ],
  assessments: [
    {
      id: "ASM-MLO-007",
      courseId: "CRS-MLO-001",
      chapterId: "CH-MLO-007",
      title: "Containerized ML Pipelines with Kubeflow Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-MLO-061",
          type: "MCQ",
          prompt: "What is the primary role of the Kubeflow Pipelines (KFP) platform?",
          options: [
            "Orchestrating, tracking, and executing modular, reproducible machine learning workflows containerized as Kubernetes pods",
            "Streaming video to mobile smartphones",
            "Managing customer billing invoices",
            "Compiling C code into assembly"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-062",
          type: "MCQ",
          prompt: "How are pipeline components defined using the modern KFP v2 Python SDK?",
          options: [
            "By decorating standard Python functions with '@dsl.component', specifying base Docker images and library requirements",
            "By editing XML configuration files in Notepad",
            "By writing raw assembly code",
            "By deploying virtual machines manually via SSH"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-063",
          type: "MCQ",
          prompt: "What is MLMD (Machine Learning Metadata) in the Kubeflow architecture?",
          options: [
            "A centralized metadata library that records execution lineages, input/output artifacts, parameters, and metrics for every pipeline step",
            "A database that stores employee salaries",
            "A machine learning model for detecting spam emails",
            "A hardware component installed on motherboards"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-064",
          type: "MCQ",
          prompt: "How does KFP pass large dataset artifacts between pipeline components without running out of container memory?",
          options: [
            "By using typed Artifact pointers (Input[Dataset], Output[Dataset]) that stream file paths backed by object storage (e.g., S3/MinIO)",
            "By converting entire datasets into base64 strings passed via CLI flags",
            "By storing datasets in environment variables",
            "By writing files to the developer's local desktop"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-065",
          type: "MCQ",
          prompt: "How can you allocate a dedicated NVIDIA GPU to a specific KFP pipeline task in Python?",
          options: [
            "task.set_gpu_limit(1).add_node_selector_constraint('nvidia.com/gpu', 'nvidia-a100')",
            "task.enable_gpu()",
            "task.hardware = 'gpu'",
            "task.use_cuda = True"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-066",
          type: "MCQ",
          prompt: "What file format does the KFP compiler produce when compiling a pipeline Python function?",
          options: ["A declarative YAML file containing the pipeline DAG specification", "A binary .exe file", "A PDF document", "A SQLite database file"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-067",
          type: "MCQ",
          prompt: "What is 'Pipeline Caching' in Kubeflow Pipelines?",
          options: [
            "Reusing the execution output of a previously executed component if its input parameters and artifact hashes have not changed, skipping unnecessary compute",
            "Storing web pages in browser memory",
            "Saving temporary text files on USB drives",
            "Compressing images using JPEG"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-068",
          type: "MCQ",
          prompt: "What happens if a training step in a KFP pipeline fails due to an Out-of-Memory (OOM) error?",
          options: [
            "The specific pod is terminated by Kubernetes, the step is marked as failed, and downstream dependent steps are skipped",
            "The entire Kubernetes cluster shuts down",
            "The pipeline reboots the developer's laptop",
            "The pipeline deletes the training dataset"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-069",
          type: "MCQ",
          prompt: "What Python client library is used to programmatically submit compiled pipeline YAML files to a running Kubeflow cluster?",
          options: ["kfp.client.Client", "boto3.kfp", "requests.post", "kubernetes.ml"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-070",
          type: "MCQ",
          prompt: "Why are containerized ML components considered superior to monolithic training scripts?",
          options: [
            "Each step can execute in an isolated environment with custom dependencies (e.g., preprocessing in CPU container, training in GPU container), maximizing resource efficiency",
            "Containerized steps run 10x faster than native Python code",
            "Containers do not require CPU scheduling",
            "Containerized components never experience software bugs"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-MLO-008",
      courseId: "CRS-MLO-001",
      chapterId: "CH-MLO-008",
      title: "Cloud-Native Training Workflows with Argo Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-MLO-071",
          type: "MCQ",
          prompt: "What is Argo Workflows?",
          options: [
            "An open-source container-native workflow engine implemented as a Kubernetes Custom Resource Definition (CRD) for orchestrating parallel jobs and DAGs",
            "A web browser built for graphic designers",
            "A relational SQL database management system",
            "A continuous integration tool that only runs on Windows"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-072",
          type: "MCQ",
          prompt: "How do you specify task dependencies to form a Directed Acyclic Graph (DAG) in an Argo Workflow YAML?",
          options: [
            "Using the 'dependencies: [taskA, taskB]' list under a DAG task definition",
            "By ordering YAML tasks sequentially from top to bottom",
            "Using the 'depends_on' keyword from Docker Compose",
            "By numbering tasks 1, 2, 3"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-073",
          type: "MCQ",
          prompt: "Why are retry policies with exponential backoff essential for ML training jobs running on cloud Spot/Preemptible instances?",
          options: [
            "Because Spot instances can be reclaimed by the cloud provider with minimal notice; retry policies automatically reschedule the pod on another node",
            "Because machine learning models crash when training passes 10 epochs",
            "To prevent the GPU from consuming electricity",
            "To bypass Kubernetes security scans"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-074",
          type: "MCQ",
          prompt: "What is an Argo 'ClusterWorkflowTemplate'?",
          options: [
            "A cluster-scoped, reusable workflow template that can be invoked by multiple teams across different namespaces to enforce standardized ML practices",
            "A CSS style template for the Argo web portal",
            "A template for ordering hardware servers",
            "An email format for project status reports"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-075",
          type: "MCQ",
          prompt: "How can two Argo workflow pods share large datasets without uploading them to external cloud object storage?",
          options: [
            "By mounting the same Kubernetes PersistentVolumeClaim (PVC) configured with volume claim templates",
            "By sending the dataset over Bluetooth",
            "By writing data into the Linux kernel log buffer",
            "By encoding the dataset in the pod name"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-076",
          type: "MCQ",
          prompt: "What is Tekton in the cloud-native CI/CD ecosystem?",
          options: [
            "A CNCF framework for creating cloud-native CI/CD pipelines consisting of Tasks, Pipelines, and TaskRuns executing in Kubernetes pods",
            "A distributed key-value store built by Google",
            "A GPU hardware driver for AMD processors",
            "A monitoring dashboard for network routers"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-077",
          type: "MCQ",
          prompt: "What CLI utility is used to submit, list, and watch Argo Workflows from the terminal?",
          options: ["argo", "kubectl ml", "wfctl", "tekton-cli"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-078",
          type: "MCQ",
          prompt: "What feature in Argo allows conditionally skipping downstream deployment tasks if a model evaluation task fails validation criteria?",
          options: [
            "Conditional execution using the 'when: \"{{tasks.eval.outputs.parameters.score}} > 0.90\"' expression",
            "Writing a custom bash script that deletes the cluster",
            "Pausing the workflow manually",
            "Argo cannot evaluate conditional statements"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-079",
          type: "MCQ",
          prompt: "What is an 'Argo Workflow Step' versus a 'DAG'?",
          options: [
            "Steps execute in sequential lists (or inner parallel tuples); DAGs execute based on explicitly declared dependency graphs",
            "Steps run on CPUs; DAGs run on GPUs",
            "Steps run in memory; DAGs run on disk",
            "There is no difference; they are aliases"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-080",
          type: "MCQ",
          prompt: "What happens when an Argo Workflow reaches its configured 'activeDeadlineSeconds' timeout?",
          options: [
            "Argo terminates all running pods in the workflow and marks the execution as timed out/failed, preventing runaway compute costs",
            "Argo doubles the number of worker nodes",
            "Argo emails the company CEO",
            "Argo restarts the training from epoch 1"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-MLO-009",
      courseId: "CRS-MLO-001",
      chapterId: "CH-DVO-009",
      title: "Distributed Deep Learning Parallelism Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-MLO-081",
          type: "MCQ",
          prompt: "What is the defining operational mechanism of Distributed Data Parallelism (PyTorch DDP)?",
          options: [
            "Model parameters are replicated across all GPUs, each GPU processes a distinct mini-batch of data, and gradients are averaged across workers via Ring-AllReduce",
            "The model is cut in half across two computers",
            "Data is stored on USB flash drives",
            "Training is executed on a single CPU thread"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-082",
          type: "MCQ",
          prompt: "When MUST Tensor Model Parallelism (e.g., Megatron-LM) be used instead of standard Data Parallelism?",
          options: [
            "When the model's weight matrices and layer activations are too massive to fit into the physical VRAM of a single GPU",
            "When the dataset contains fewer than 100 rows",
            "When training on laptops without GPUs",
            "When using linear regression algorithms"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-083",
          type: "MCQ",
          prompt: "What does ZeRO Stage 3 (Zero Redundancy Optimizer) accomplish in large language model training?",
          options: [
            "It partitions optimizer states, gradients, AND model parameters evenly across all GPUs, assembling parameters on-demand during forward/backward passes to achieve linear memory scaling",
            "It compresses model weights using MP3 audio compression",
            "It turns off gradient descent calculations",
            "It eliminates the need for power supplies"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-084",
          type: "MCQ",
          prompt: "Why is NVIDIA NCCL (Collective Communications Library) preferred over standard TCP/IP sockets for distributed GPU communication?",
          options: [
            "NCCL is optimized for multi-GPU interconnects (NVLink and InfiniBand), implementing Ring-AllReduce with direct GPU-to-GPU memory copies (GPUDirect RDMA)",
            "NCCL encrypts data using quantum keys",
            "NCCL runs inside browser web workers",
            "NCCL is free from network latency"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-085",
          type: "MCQ",
          prompt: "What is a 'Pipeline Bubble' in Pipeline Parallelism (GPipe)?",
          options: [
            "Idle time where downstream GPUs sit idle waiting for upstream GPUs to compute preceding layer activations before they can begin their work",
            "An air bubble inside a liquid-cooled GPU heatsink",
            "A memory leak in the Linux kernel",
            "A sudden spike in cloud hosting costs"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-086",
          type: "MCQ",
          prompt: "How does Pipeline Parallelism mitigate pipeline bubble idle time?",
          options: [
            "By dividing the training batch into smaller 'micro-batches' that are pipelined concurrently across layer stages",
            "By turning up the GPU fan speed",
            "By skipping every second layer in the neural network",
            "By using 8-bit integers for weights"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-087",
          type: "MCQ",
          prompt: "What is PyTorch FSDP (Fully Sharded Data Parallel)?",
          options: [
            "Native PyTorch implementation of ZeRO-style parameter, gradient, and optimizer state sharding across distributed training nodes",
            "A file system driver for fast SSDs",
            "A library for drawing neural network graphs",
            "A tool for creating Docker containers"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-088",
          type: "MCQ",
          prompt: "What high-speed physical interconnect technology provides up to 900 GB/s bidirectional bandwidth between GPUs on modern NVIDIA HGX servers?",
          options: ["NVLink", "USB 3.0", "Ethernet Cat6", "PCIe Gen 3"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-089",
          type: "MCQ",
          prompt: "What is 'Gradient Accumulation' in deep learning training?",
          options: [
            "Calculating gradients over multiple small micro-batches and summing them before executing a single optimizer step, simulating a large batch size within memory limits",
            "Adding gradients across multiple days of training",
            "Storing gradients in a SQL database table",
            "A bug where gradients fail to clear between epochs"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-090",
          type: "MCQ",
          prompt: "What is Mixed Precision Training (FP16 / BF16 with FP32 Master Weights)?",
          options: [
            "Performing forward and backward passes using fast 16-bit floating point math while maintaining 32-bit master weights for optimizer updates, cutting memory and doubling throughput",
            "Training half the model in Python and half in C++",
            "Using both CPUs and GPUs for the same calculation",
            "Training with random floating point precision"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-MLO-010",
      courseId: "CRS-MLO-001",
      chapterId: "CH-MLO-010",
      title: "Scalable Hyperparameter Optimization Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-MLO-091",
          type: "MCQ",
          prompt: "Why does Bayesian Optimization (such as Optuna's TPE) outperform Grid Search and Random Search?",
          options: [
            "It builds a probabilistic surrogate model of the objective function, using historical trial outcomes to sample the most promising hyperparameter regions intelligently",
            "It tests every possible combination systematically",
            "It skips model training entirely and guesses the weights",
            "It executes 10x faster because it runs on quantum computers"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-092",
          type: "MCQ",
          prompt: "What is the primary role of the ASHA (Asynchronous Successive Halving Algorithm) scheduler in Ray Tune?",
          options: [
            "Pruning poor-performing trials aggressively and asynchronously based on intermediate performance metrics, allocating GPU compute only to promising runs",
            "Selecting random hyperparameters",
            "Encrypting training datasets",
            "Synchronizing all trials at the end of every epoch"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-093",
          type: "MCQ",
          prompt: "How does ASHA improve upon synchronous Hyperband?",
          options: [
            "ASHA promotes and prunes trials asynchronously without waiting for slow stragglers or synchronous round boundaries, keeping cluster GPUs 100% utilized",
            "ASHA can only run on single-core CPUs",
            "ASHA eliminates the need for an objective function",
            "ASHA guarantees 100% test accuracy"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-094",
          type: "MCQ",
          prompt: "What does the 'grace_period' parameter define in an early stopping trial scheduler?",
          options: [
            "The minimum number of training epochs or iterations a trial is guaranteed to execute before it becomes eligible for early termination",
            "The time a developer has to pay cloud invoices",
            "The delay before an alert email is dispatched",
            "The time a pod waits before rebooting"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-095",
          type: "MCQ",
          prompt: "What is Tree-structured Parzen Estimator (TPE)?",
          options: [
            "A Bayesian optimization algorithm that models two probability density distributions: $P(x|y < y^*)$ for good scores and $P(x|y \\ge y^*)$ for bad scores to pick next hyperparameters",
            "A decision tree algorithm for classification",
            "A data structure used in Linux file systems",
            "A parser for Python syntax trees"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-096",
          type: "MCQ",
          prompt: "In Ray Tune, what function call inside the trainable model function communicates intermediate validation metrics back to the scheduler?",
          options: ["tune.report(loss=val_loss, accuracy=val_acc)", "ray.send_metric(val_loss)", "return val_loss", "print(val_loss)"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-097",
          type: "MCQ",
          prompt: "Why should search spaces for learning rates be defined using log-uniform distributions ('tune.loguniform(1e-4, 1e-1)') rather than uniform distributions?",
          options: [
            "Because learning rate sensitivity operates on logarithmic orders of magnitude ($0.001$ vs $0.01$ is as significant a leap as $0.01$ vs $0.1$)",
            "Because Python cannot sample floating point numbers uniformly",
            "Because uniform distributions only support integers",
            "Because GPUs only support logarithmic arithmetic"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-098",
          type: "MCQ",
          prompt: "What is an Optuna 'Study' versus a 'Trial'?",
          options: [
            "A Study is the entire optimization session focused on a specific objective; a Trial is a single execution evaluating one concrete set of hyperparameters",
            "A Study is for academic research; a Trial is for enterprise code",
            "A Study is written in C++; a Trial is written in Python",
            "There is no difference; they are aliases"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-099",
          type: "MCQ",
          prompt: "How can Optuna persist trial histories across distributed worker nodes?",
          options: [
            "By configuring a shared RDBMS backend (e.g., storage='postgresql://user:pass@db:5432/optuna')",
            "By storing results in temporary RAM",
            "By sending SMS messages between nodes",
            "By saving text files in /tmp on each worker"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-100",
          type: "MCQ",
          prompt: "What is Multi-Objective Hyperparameter Optimization?",
          options: [
            "Optimizing for multiple competing metrics simultaneously (e.g., maximizing model accuracy while minimizing inference latency and model memory footprint)",
            "Running optimization on two different computers",
            "Tuning two models from different vendors",
            "Training models in two languages simultaneously"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-MLO-011",
      courseId: "CRS-MLO-001",
      chapterId: "CH-MLO-011",
      title: "GPU Infrastructure Management Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-MLO-101",
          type: "MCQ",
          prompt: "What is the primary role of the NVIDIA GPU Operator in Kubernetes?",
          options: [
            "Automating the deployment and lifecycle management of all NVIDIA software components (drivers, container runtime, device plugins, DCGM monitoring) on Kubernetes nodes",
            "Controlling the physical fan speed of GPUs in a datacenter",
            "Mining cryptocurrency on idle worker nodes",
            "Replacing Kubernetes kube-scheduler with CUDA"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-102",
          type: "MCQ",
          prompt: "What is NVIDIA Multi-Instance GPU (MIG)?",
          options: [
            "A hardware architecture on Ampere/Hopper GPUs that partitions a single physical GPU into up to 7 isolated GPU instances with dedicated compute, memory, and bandwidth",
            "Running 7 virtual machines on a laptop",
            "Connecting 7 separate HDMI monitors to a server",
            "A software tool for resizing JPEG images"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-103",
          type: "MCQ",
          prompt: "What is the key advantage of MIG over software GPU Time-Slicing?",
          options: [
            "MIG provides true physical hardware isolation: an Out-of-Memory (OOM) error or memory corruption on one slice cannot crash or affect neighboring slices",
            "MIG costs zero dollars on AWS",
            "MIG allows GPUs to run without drivers",
            "Time-slicing only works on Windows"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-104",
          type: "MCQ",
          prompt: "What component inside the GPU Operator exports GPU metrics (temperature, utilization, VRAM usage) to Prometheus?",
          options: ["NVIDIA DCGM Exporter (Data Center GPU Manager)", "Kubelet metrics", "Node exporter", "CUDA profiler"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-105",
          type: "MCQ",
          prompt: "How does a Pod request access to an NVIDIA GPU in standard Kubernetes manifests?",
          options: [
            "Under 'resources.limits' declaring 'nvidia.com/gpu: 1'",
            "Under 'environment' declaring 'USE_GPU=true'",
            "By setting 'spec.hardware: nvidia'",
            "By running the container as root"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-106",
          type: "MCQ",
          prompt: "What is GPU Time-Slicing in Kubernetes?",
          options: [
            "A mechanism that allows multiple Pods to share a single GPU by interleaving execution time, ideal for underutilized workloads like dev environments or lightweight inference",
            "Slicing the physical silicon chip with a laser",
            "Limiting GPU execution to daytime hours",
            "Measuring GPU clock speeds in nanoseconds"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-107",
          type: "MCQ",
          prompt: "What is Kubernetes Dynamic Resource Allocation (DRA)?",
          options: [
            "A modern Kubernetes scheduling framework enabling fine-grained, driver-defined claims for specialized hardware (e.g., claiming specific GPU topologies, PCIe links, or DPUs)",
            "Dynamic allocation of RAM for web browsers",
            "Dynamic resizing of PersistentVolumes",
            "Automated DNS record creation"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-108",
          type: "MCQ",
          prompt: "Why should GPU worker nodes in a Kubernetes cluster be tainted (e.g., 'nvidia.com/gpu:NoSchedule')?",
          options: [
            "To prevent general stateless CPU workloads (like Nginx, Redis, or logging agents) from scheduling onto expensive GPU compute nodes",
            "Because GPU nodes cannot run Linux",
            "To turn off network security firewalls",
            "Because tainted nodes consume less electricity"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-109",
          type: "MCQ",
          prompt: "What command displays real-time GPU compute and memory utilization on a Linux machine with NVIDIA drivers?",
          options: ["nvidia-smi", "gpu-stat", "cuda-top", "lspci --gpu"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-110",
          type: "MCQ",
          prompt: "What is GPUDirect RDMA (Remote Direct Memory Access)?",
          options: [
            "A technology enabling network interface cards (NICs) to directly read/write GPU memory across nodes via PCIe/InfiniBand without routing data through host CPU memory",
            "A remote desktop protocol for viewing GPU monitors",
            "A tool for downloading files from Google Drive",
            "A database replication plugin"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-MLO-012",
      courseId: "CRS-MLO-001",
      chapterId: "CH-MLO-012",
      title: "Continuous Training & CI/CD for Machine Learning Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-MLO-111",
          type: "MCQ",
          prompt: "What is Continuous Training (CT) in the MLOps lifecycle?",
          options: [
            "Automating the retraining and evaluation of machine learning models in response to new data arrival, scheduled intervals, or detected model performance degradation",
            "Requiring engineers to take continuous daily exams",
            "Running training loops in an infinite loop without stopping",
            "Training models on personal mobile phones"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-112",
          type: "MCQ",
          prompt: "What is a 'Shadow Deployment' (Dark Launch) for an ML model?",
          options: [
            "Deploying the new model in production alongside the active model; real production requests are duplicated and sent to both, but only the active model's response is returned to users",
            "Deploying the model in an underground datacenter",
            "Running inference only at night",
            "Hiding model predictions from developers"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-113",
          type: "MCQ",
          prompt: "Why is Shadow Evaluation superior to offline test set evaluation prior to production release?",
          options: [
            "It validates real-world latency, throughput, memory consumption, and prediction behavior against live, unpredictable production traffic without impacting end users",
            "It does not require server resources",
            "It eliminates the need for software code reviews",
            "It automatically optimizes SQL queries"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-114",
          type: "MCQ",
          prompt: "What is an 'Accuracy Regression Gate' in an ML deployment pipeline?",
          options: [
            "An automated check verifying that the retrained candidate model performs equal to or better than the active production champion on golden validation benchmarks",
            "A gate that limits how many times a user can log in",
            "A policy that deletes models older than 30 days",
            "A firewall blocking unauthorized IP addresses"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-115",
          type: "MCQ",
          prompt: "What is Data Slice Testing in machine learning validation?",
          options: [
            "Evaluating model accuracy across critical sub-populations or demographic segments (e.g., low-income applicants, new users) to ensure fairness and prevent masked aggregate bias",
            "Cutting data storage hard drives into pieces",
            "Splitting datasets into train and test sets",
            "Testing network speeds across different time slices"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-116",
          type: "MCQ",
          prompt: "What event should trigger an automated Continuous Training pipeline in high-maturity MLOps?",
          options: [
            "A webhook dispatched when monitoring detects statistically significant Data Drift or Concept Drift exceeding predefined threshold bounds",
            "A developer typing 'git push' on a documentation branch",
            "A customer unsubscribing from an email newsletter",
            "An operating system reboot"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-117",
          type: "MCQ",
          prompt: "What is 'Model Invariance Testing' (Metamorphic Testing)?",
          options: [
            "Asserting that introducing benign perturbations to inputs (e.g., changing a user's name from John to Jane in a loan application) does NOT alter the model's prediction",
            "Testing whether the model runs in different timezones",
            "Verifying that model weights cannot be modified on disk",
            "Testing whether the model runs without an internet connection"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-118",
          type: "MCQ",
          prompt: "What should happen automatically if a candidate retrained model fails the model validation gate?",
          options: [
            "The model is quarantined, deployment is halted, an alert is sent to the data science team, and the existing production champion continues serving traffic",
            "The production cluster is destroyed",
            "The candidate model is deployed anyway",
            "The database is reformatted"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-119",
          type: "MCQ",
          prompt: "Why should an ML CI/CD pipeline generate an immutable model artifact (e.g., Docker image or ONNX bundle) rather than training the model inside production?",
          options: [
            "To guarantee byte-for-byte immutability, ensuring that what was tested and certified in staging is identically what executes in production",
            "Because training inside production is free of charge",
            "Because Docker images cannot be transferred across networks",
            "To prevent data scientists from modifying code"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-120",
          type: "MCQ",
          prompt: "What is an 'Automated Canary Rollout' for an ML model?",
          options: [
            "Gradually routing a small percentage of live production traffic (e.g., 5%, then 25%, then 100%) to the new model while monitoring latency, errors, and business KPIs",
            "Deploying models exclusively to canary testing labs",
            "Running the model inside a bird sanctuary",
            "Rebooting all servers simultaneously"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
  ],
};

