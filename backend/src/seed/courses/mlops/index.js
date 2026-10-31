// Course 9: MLOps Masterclass
// Aggregator module for all 5 phases (30 chapters, 30 assessments, 300 questions)
import { phase1 } from "./phase1.js";
import { phase2 } from "./phase2.js";
import { phase3 } from "./phase3.js";
import { phase4 } from "./phase4.js";
import { phase5 } from "./phase5.js";

export const mlopsCourse = {
  id: "CRS-MLO-001",
  title: "MLOps Masterclass: Machine Learning Lifecycle, Kubeflow, Triton & LLMOps Architecture",
  description: "Comprehensive 30-chapter masterclass from machine learning technical debt and reproducibility to enterprise Kubeflow pipelines, Triton/vLLM inference, and automated LLMOps governance. Covers MLOps paradigm, hidden technical debt (Sculley et al.), maturity levels 0-2, data & model versioning with DVC (Git pointers, remote storage, dvc.yaml DAGs), experiment tracking and Model Registry with MLflow (aliases, autologging, signatures), enterprise Feature Stores with Feast (offline vs online stores, Redis, point-in-time time-travel joins, training-serving skew), automated data validation with Great Expectations (Expectation Suites, checkpoints), distributed data processing with Ray Data (streaming datasets, zero-copy Plasma object store) and Spark, containerized ML pipelines with Kubeflow Pipelines (KFP v2 SDK, lightweight components, pipeline DAGs, MLMD metadata), cloud-native workflows with Argo Workflows and Tekton, distributed deep learning parallelism (PyTorch DDP, Ring-AllReduce via NCCL, Tensor Model Parallelism, Pipeline Parallelism, ZeRO stages 1-3), scalable hyperparameter optimization with Ray Tune and Optuna (Bayesian TPE, ASHA asynchronous early stopping), GPU cluster infrastructure with NVIDIA GPU Operator, CUDA virtualization, and Multi-Instance GPU (MIG), Continuous Training (CT/CD) triggers and shadow evaluation, model compilation with ONNX Runtime, NVIDIA TensorRT (layer fusion, FP16/INT8 post-training quantization, QAT), async microservices with FastAPI and BentoML adaptive micro-batching, enterprise multi-model serving with NVIDIA Triton Inference Server (dynamic batching, model ensembles, BLS), cloud-native serving with KServe (v2 Data Plane, Knative scale-to-zero), deployment strategies (canary, shadow launches, Multi-Armed Bandits), edge optimization (TensorFlow Lite, CoreML, structured pruning), ML drift taxonomy (Covariate Shift, Concept Drift, Prior Probability Shift, KS-test, PSI, Wasserstein distance), real-time drift monitoring with Evidently AI and Alibi Detect, Prometheus telemetry (p99 latency, GPU VRAM saturation) and Grafana dashboards, model explainability with SHAP (TreeExplainer) and LIME, automated retraining feedback loops and delayed feedback windows, ML governance (Model Cards, EU AI Act compliance, Cosign cryptographic lineage, bias audits), the LLMOps paradigm and token economics, high-throughput LLM serving with vLLM (PagedAttention, Continuous Batching, Tensor Parallelism), Parameter-Efficient Fine-Tuning (PEFT, LoRA, QLoRA NF4), enterprise RAG architecture (semantic chunking, Pinecone/Qdrant/Milvus, hybrid search, cross-encoder reranking), LLM evaluation and safety (RAG Triad, NeMo Guardrails, LangSmith tracing), and the Cortex AI Financial Platform enterprise capstone architecture and Staff MLOps system design interview mastery.",
  skill: "Machine Learning Operations (MLOps)",
  skillIds: ["SKILL-ML-PIPELINES-LIFECYCLE", "SKILL-MODEL-SERVING-INFRA", "SKILL-LLMOPS-MONITORING-GOVERNANCE"],
  targetLevel: "Advanced",
  prerequisites: ["CRS-DSC-001", "CRS-AIML-001"],
  category: "AI & Machine Learning",
  tags: [
    "MLOps",
    "LLMOps",
    "Kubeflow",
    "MLflow",
    "DVC",
    "Feast",
    "Triton",
    "vLLM",
    "RAG",
    "LoRA",
    "PyTorch",
    "Ray",
    "Evidently",
    "Kubernetes"
  ],
  thumbnailColor: "#8b5cf6",
  ownerId: "EMP-1002",
  approval: "Approved",
  status: "Active",
  version: 1,
  difficulty: "Comprehensive (Beginner to Advanced)",
  estimatedHours: 110,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mlopsSkills = [
  {
    id: "SKILL-ML-PIPELINES-LIFECYCLE",
    name: "ML Pipelines & Experiment Tracking",
    category: "Technical",
    description: "End-to-end ML lifecycle orchestration: DVC data versioning, MLflow tracking and model registry, Feast feature stores, Ray streaming data, and Kubeflow Pipelines (KFP v2).",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-MODEL-SERVING-INFRA",
    name: "Model Serving & High-Throughput Inference",
    category: "Technical",
    description: "Production inference infrastructure: ONNX, NVIDIA TensorRT quantization, FastAPI/BentoML microservices, NVIDIA Triton dynamic batching, KServe scale-to-zero, and GPU scheduling.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-LLMOPS-MONITORING-GOVERNANCE",
    name: "LLMOps, Drift Monitoring & Governance",
    category: "Technical",
    description: "Enterprise generative AI and observability: vLLM PagedAttention serving, LoRA/QLoRA fine-tuning, RAG vector pipelines, Evidently AI drift detection, SHAP explainability, and EU AI Act compliance.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
];

export const mlopsChapters = [
  ...phase1.chapters,
  ...phase2.chapters,
  ...phase3.chapters,
  ...phase4.chapters,
  ...phase5.chapters,
];

export const mlopsAssessments = [
  ...phase1.assessments,
  ...phase2.assessments,
  ...phase3.assessments,
  ...phase4.assessments,
  ...phase5.assessments,
];

