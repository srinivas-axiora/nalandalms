// Course 9: MLOps Masterclass - Phase 3: High-Performance Model Serving & Inference
// Chapters 13 to 18 | Assessments 13 to 18 | 60 MCQs

export const phase3 = {
  chapters: [
    {
      id: "CH-MLO-013",
      courseId: "CRS-MLO-001",
      sequence: 13,
      title: "Model Serialization & Optimization Frameworks",
      description: "Master high-performance model compilation: Open Neural Network Exchange (ONNX), NVIDIA TensorRT, post-training quantization (FP16/INT8), pruning, and TorchScript.",
      contentType: "Rich Text",
      durationMinutes: 85,
      minimumTimeMinutes: 55,
      body: `
# Model Serialization & Optimization Frameworks

Deploying uncompiled raw PyTorch or TensorFlow model checkpoints directly into production introduces severe latency and memory penalties due to Python runtime overhead, unoptimized compute graphs, and redundant kernel launches. Production MLOps compiles and quantizes models into optimized intermediate representations.

---

## 1. The Model Compilation & Optimization Stack

\`\`\`
+--------------------------------------------------------------------------+
| FRAMEWORK TRAINING CHECKPOINT (PyTorch .pt / TensorFlow SavedModel)      |
+--------------------------------------------------------------------------+
                                    |
                    Export to Intermediate Representation
                                    v
+--------------------------------------------------------------------------+
| OPEN NEURAL NETWORK EXCHANGE (ONNX) / TorchScript                        |
| - Standardized compute graph representation                              |
| - Platform & language neutral (Run in C++, Rust, Go, Python)             |
+--------------------------------------------------------------------------+
                                    |
                    Hardware-Specific Acceleration Engine
                                    v
+--------------------------------------------------------------------------+
| NVIDIA TENSORRT / INTEL OPENVINO                                         |
| 1. Layer & Tensor Fusion: Combines Conv + Bias + ReLU into single kernel |
| 2. Kernel Auto-Tuning: Selects fastest CUDA algorithm for hardware (A100)|
| 3. Dynamic Tensor Memory: Minimizes memory allocation overhead           |
| 4. Quantization: Converts FP32 weights -> FP16 or INT8 precision         |
+--------------------------------------------------------------------------+
                                    |
                                    v
+--------------------------------------------------------------------------+
| COMPILED ENGINE BINARY (.engine / .plan) -> Sub-5ms Inference Latency!   |
+--------------------------------------------------------------------------+
\`\`\`

---

## 2. Quantization Spectrum: FP32 vs. FP16 vs. INT8

$$\\text{Memory Reduction:} \\quad \\text{FP32 (32 bits)} \\longrightarrow \\text{FP16 (16 bits, 50\\% savings)} \\longrightarrow \\text{INT8 (8 bits, 75\\% savings)}$$

- **Post-Training Quantization (PTQ):** Quantizes pre-trained weights directly into 8-bit integers using a small calibration dataset to compute dynamic range scaling factors ($S$) and zero-points ($Z$):
  $$q = \\text{round}\\left(\\frac{x}{S}\\right) + Z$$
- **Quantization-Aware Training (QAT):** Models quantization noise during training forward passes, preserving accuracy on sensitive architectures like vision transformers.

---

## 3. Python Export to ONNX & ONNX Runtime Execution

\`\`\`python
import torch
import onnxruntime as ort
import numpy as np

# 1. Export PyTorch Model to ONNX
model = MyPyTorchClassifier().eval()
dummy_input = torch.randn(1, 3, 224, 224, requires_grad=False)

torch.onnx.export(
    model,
    dummy_input,
    "model.onnx",
    export_params=True,
    opset_version=17,
    do_constant_folding=True, # Optimizes static graph constants
    input_names=["input"],
    output_names=["output"],
    dynamic_axes={"input": {0: "batch_size"}, "output": {0: "batch_size"}}
)

# 2. High-Performance Execution with ONNX Runtime (C++ Execution Provider)
session = ort.InferenceSession("model.onnx", providers=["CUDAExecutionProvider", "CPUExecutionProvider"])
inputs = {"input": np.random.randn(8, 3, 224, 224).astype(np.float32)}
outputs = session.run(None, inputs)
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/5a4G0kZ04rA" title="ONNX Runtime & Model Optimization Explained" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-MLO-014",
      courseId: "CRS-MLO-001",
      sequence: 14,
      title: "REST & gRPC Model Microservices with FastAPI & BentoML",
      description: "Build production inference microservices: asynchronous FastAPI endpoints, gRPC protocol buffers, adaptive micro-batching, and BentoML packaging.",
      contentType: "Rich Text",
      durationMinutes: 80,
      minimumTimeMinutes: 50,
      body: `
# REST & gRPC Model Microservices with FastAPI & BentoML

Inference endpoints must provide low latency, strong typing, concurrent request handling, and graceful scaling. Wrapping machine learning models in naive synchronous Flask apps introduces severe performance bottlenecks under real production workloads.

---

## 1. REST vs. gRPC for Model Inference

| Architectural Attribute | REST (JSON over HTTP/1.1) | gRPC (Protobuf over HTTP/2) |
|---|---|---|
| **Payload Serialization** | Text-based JSON (Heavy CPU parsing overhead) | Binary Protocol Buffers (Ultra-fast serialization) |
| **Transport Layer** | HTTP/1.1 (Head-of-Line blocking) | HTTP/2 (Bidirectional streaming & multiplexing) |
| **Payload Efficiency** | Low (numeric arrays become verbose text strings) | **High (packed binary byte arrays)** |
| **Schema Enforcement** | Soft (OpenAPI / Pydantic) | **Strict compile-time Protobuf IDL contracts** |
| **Production Target** | Public edge APIs, web frontends | **Internal high-throughput microservices (< 2ms)** |

---

## 2. BentoML Production Serving Framework

**BentoML** is a unified framework purpose-built for machine learning serving. It natively supports **Adaptive Micro-Batching**, combining multiple concurrent incoming inference requests into a single tensor batch to maximize GPU throughput:

\`\`\`python
import bentoml
import numpy as np

# Load optimized runner
model_runner = bentoml.onnx.get("fraud_detector:latest").to_runner()
svc = bentoml.Service("fraud_detection_service", runners=[model_runner])

@svc.api(
    input=bentoml.io.NumpyNdarray(dtype="float32", shape=(-1, 30)),
    output=bentoml.io.NumpyNdarray()
)
async def predict(features: np.ndarray) -> np.ndarray:
    # Automatically micro-batches incoming requests across 10ms window
    return await model_runner.predict.async_run(features)
\`\`\`

Build and containerize the production Bento:
\`\`\`bash
# Build standardized OCI container image
bentoml build
bentoml containerize fraud_detection_service:latest -t enterprise/fraud-detector:v1.0
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/MeU5_k9ss5Y" title="BentoML Tutorial: Production ML Serving" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-MLO-015",
      courseId: "CRS-MLO-001",
      sequence: 15,
      title: "Enterprise Inference Serving with NVIDIA Triton Inference Server",
      description: "Deploy multi-model inference pipelines with NVIDIA Triton: Dynamic Batching, model ensembles, concurrent model execution, and shared memory IPC.",
      contentType: "Rich Text",
      durationMinutes: 85,
      minimumTimeMinutes: 55,
      body: `
# Enterprise Inference Serving with NVIDIA Triton Inference Server

For mission-critical production deployments handling tens of thousands of requests per second, **NVIDIA Triton Inference Server** is the gold standard. Built entirely in C++, Triton delivers multi-model concurrent execution across GPUs and CPUs, multi-framework support, and dynamic batching.

---

## 1. Triton Model Repository Topology

\`\`\`
model_repository/
  ├── fraud_classifier/
  │   ├── config.pbtxt             # Configuration: inputs, outputs, batching
  │   ├── 1/                       # Version 1 folder
  │   │   └── model.onnx           # Serialized model artifact
  │   └── 2/                       # Version 2 folder
  │       └── model.onnx
  │
  └── preprocessing_pipeline/
      ├── config.pbtxt
      └── 1/
          └── model.py             # Python Business Logic Scripting (BLS)
\`\`\`

---

## 2. Dynamic Batching Configuration (\`config.pbtxt\`)

Dynamic Batching aggregates individual incoming inference requests over a microsecond time window, passing them to the GPU as a single combined batch to achieve maximum tensor core utilization:

\`\`\`protobuf
name: "fraud_classifier"
platform: "onnxruntime_onnx"
max_batch_size: 64

input [
  {
    name: "input_features"
    data_type: TYPE_FP32
    dims: [ 30 ]
  }
]
output [
  {
    name: "probabilities"
    data_type: TYPE_FP32
    dims: [ 2 ]
  }
]

# Enable Dynamic Batching
dynamic_batching {
  max_queue_delay_microseconds: 5000 # Wait up to 5ms to assemble a batch of 64
}

# Concurrent Model Instances across GPUs
instance_group [
  {
    count: 2
    kind: KIND_GPU
    gpus: [ 0 ]
  }
]
\`\`\`

---

## 3. Model Ensembles & Business Logic Scripting (BLS)

Triton allows chaining data transformations, tokenizers, and multiple neural networks into an atomic pipeline without sending intermediate payloads back across the network to the client:
$$\\text{Client Request} \\longrightarrow \\text{Ensemble: [ Preprocess Tokenizer } \\rightarrow \\text{ BERT Transformer } \\rightarrow \\text{ Softmax Classifier ] } \\longrightarrow \\text{ Result}$$

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/5a4G0kZ04rA" title="NVIDIA Triton Inference Server Complete Guide" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-MLO-016",
      courseId: "CRS-MLO-001",
      sequence: 16,
      title: "Cloud-Native Model Serving with KServe & Seldon Core",
      description: "Deploy serverless ML inference on Kubernetes using KServe: Open Inference Protocol (v2 Data Plane), scale-to-zero with Knative, and Transformer architecture.",
      contentType: "Rich Text",
      durationMinutes: 80,
      minimumTimeMinutes: 50,
      body: `
# Cloud-Native Model Serving with KServe & Seldon Core

Running inference on Kubernetes requires standardized APIs and efficient autoscaling. **KServe** (formerly KFServing) provides a cloud-native standard for serverless model serving with native support for autoscaling to zero when idle.

---

## 1. KServe Architecture: Predictor, Transformer & Explainer

\`\`\`
                                  +------------------------------------------+
                                  | INGRESS TRAFFIC (Open Inference v2 REST) |
                                  +------------------------------------------+
                                                       |
                                                       v
+--------------------------------------------------------------------------------------------------+
| KSERVE INFERENCESERVICE POD                                                                      |
|                                                                                                  |
|   +-----------------------+     Internal Payload     +---------------------+                     |
|   | TRANSFORMER POD       | -----------------------> | PREDICTOR POD       |                     |
|   | (Tokenizes text,      |                          | (NVIDIA Triton /    |                     |
|   |  fetches Feast online |                          |  TorchServe / ONNX) |                     |
|   |  features)            |                          +---------------------+                     |
|   +-----------------------+                                     |                                |
|                                                                 v                                |
|                                                      +---------------------+                     |
|                                                      | EXPLAINER POD       |                     |
|                                                      | (Calculates SHAP)   |                     |
|                                                      +---------------------+                     |
+--------------------------------------------------------------------------------------------------+
\`\`\`

---

## 2. KServe InferenceService Manifest

\`\`\`yaml
apiVersion: "serving.kserve.io/v1beta1"
kind: "InferenceService"
metadata:
  name: "xgboost-churn"
  namespace: "ml-serving"
spec:
  predictor:
    model:
      modelFormat:
        name: xgboost
      storageUri: "s3://enterprise-model-registry/churn/v2/"
      resources:
        requests:
          cpu: "500m"
          memory: "1Gi"
        limits:
          cpu: "2000m"
          memory: "2Gi"
    # Knative Serverless Autoscaling
    minReplicas: 0 # Scales to ZERO when no traffic is received!
    maxReplicas: 10
    scaleTarget: 100 # Target concurrency per pod
\`\`\`

---

## 3. Open Inference Protocol (v2 Data Plane)

KServe, Triton, and Seldon Core adhere to the standardized CNCF **v2 Data Plane** specification, guaranteeing client libraries can query models across any serving backend:
\`\`\`bash
# Standard v2 REST health check endpoint
curl -X GET https://inference.corp.internal/v2/models/xgboost-churn/ready

# Standard v2 JSON prediction payload
curl -X POST https://inference.corp.internal/v2/models/xgboost-churn/infer \\
  -H "Content-Type: application/json" \\
  -d '{"inputs": [{"name": "input_0", "shape": [1, 4], "datatype": "FP32", "data": [1.2, 3.4, 0.5, 2.1]}]}'
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/5a4G0kZ04rA" title="KServe Tutorial: Serverless ML on Kubernetes" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-MLO-017",
      courseId: "CRS-MLO-001",
      sequence: 17,
      title: "Production Deployment Strategies for ML Models",
      description: "Implement safe release patterns: Canary rollouts, Blue/Green zero-downtime cutovers, Shadow/Dark launches, and Multi-Armed Bandit online experimentation.",
      contentType: "Rich Text",
      durationMinutes: 75,
      minimumTimeMinutes: 45,
      body: `
# Production Deployment Strategies for ML Models

Replacing a production model instantaneously with a new checkpoint creates unacceptable operational and financial risk. Enterprise ML systems employ gradual, controlled traffic shifting patterns.

---

## 1. Deployment Strategy Taxonomy for ML

\`\`\`
+-----------------------+     +-----------------------+     +-----------------------+
| 1. CANARY ROLLOUT     |     | 2. BLUE / GREEN       |     | 3. SHADOW / DARK      |
+-----------------------+     +-----------------------+     +-----------------------+
| Split traffic by %    |     | Maintain 2 identical  |     | Replicate 100% of live|
| (90% v1, 10% v2).     |     | environments. Switch  |     | traffic to new model. |
| Monitor error rate &  |     | 100% of router traffic|     | Users only see v1;    |
| latency before 100%.  |     | instantaneously.      |     | v2 tested for safety. |
+-----------------------+     +-----------------------+     +-----------------------+
\`\`\`

---

## 2. Multi-Armed Bandit (MAB) Online Experimentation

Traditional A/B testing splits traffic $50/50$ statically for weeks, exposing $50\\%$ of customers to an underperforming model throughout the duration of the test.

**Multi-Armed Bandits** (e.g., Thompson Sampling, Upper Confidence Bound - UCB) dynamically allocate traffic in real time, routing more traffic toward the winning model as evidence accumulates:

$$\\text{Traffic Allocation} \\propto P(\\text{Model } k \\text{ is optimal})$$

- Minimizes **Cumulative Regret** (customer churn or lost revenue during the test).
- Automatically phases out failing models without human intervention.

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/VnvRFRk_51k" title="Canary & Shadow Deployments for ML Models" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-MLO-018",
      courseId: "CRS-MLO-001",
      sequence: 18,
      title: "Edge ML Deployment & On-Device Model Optimization",
      description: "Deploy machine learning models to constrained edge devices: TensorFlow Lite, ONNX Mobile, CoreML, INT8 quantization, and offline inference pipelines.",
      contentType: "Rich Text",
      durationMinutes: 75,
      minimumTimeMinutes: 45,
      body: `
# Edge ML Deployment & On-Device Model Optimization

In edge applications—such as autonomous vehicles, mobile applications, medical devices, and IoT sensors—models cannot depend on cloud connectivity due to network latency, bandwidth costs, and privacy regulations.

---

## 1. Edge Engineering Constraints

1. **Strict Compute & Memory Budgets:** Mobile devices possess limited RAM (e.g., 2–4 GB shared with the OS) and no active cooling fans.
2. **Thermal & Battery Constraints:** Continuous floating-point matrix multiplication causes CPU/GPU thermal throttling and rapid battery drain.
3. **Zero Network Dependency:** Inference must execute 100% offline with deterministic latency ($< 16\\text{ms}$ for 60 FPS computer vision).

---

## 2. Model Compression Techniques for Edge

- **Structured Pruning:** Zeroing out entire redundant convolution filters or attention heads, physically reducing matrix dimensions and memory bandwidth.
- **Integer Quantization (INT8):** Converting 32-bit floating point weights into 8-bit signed integers, allowing edge processors (ARM NEON / Apple Neural Engine / Hexagon DSP) to execute vectorized integer instructions $4\\times$ faster.
- **Weight Sharing & Huffman Coding:** Compressing identical weight clusters to reduce file sizes for over-the-air (OTA) mobile downloads.

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/5a4G0kZ04rA" title="TensorFlow Lite & Edge AI Optimization" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
  ],
  assessments: [
    {
      id: "ASM-MLO-013",
      courseId: "CRS-MLO-001",
      chapterId: "CH-MLO-013",
      title: "Model Serialization & Optimization Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-MLO-121",
          type: "MCQ",
          prompt: "What is the primary architectural benefit of exporting a PyTorch model to the Open Neural Network Exchange (ONNX) format?",
          options: [
            "It decouples the model representation from Python, allowing execution across diverse hardware engines (C++, CUDA, TensorRT, OpenVINO) without Python runtime overhead",
            "It turns machine learning models into HTML web pages",
            "It converts images into audio files",
            "It automatically retrains the model on new data"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-122",
          type: "MCQ",
          prompt: "What does 'Layer Fusion' accomplish inside an optimization engine like NVIDIA TensorRT?",
          options: [
            "It merges adjacent operations (e.g., Convolution + Bias Add + ReLU activation) into a single CUDA GPU kernel launch, dramatically reducing memory bandwidth bottlenecks",
            "It deletes half the layers in a neural network",
            "It connects two physical servers together",
            "It compresses files into zip format"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-123",
          type: "MCQ",
          prompt: "How much memory reduction is achieved by quantizing a model from standard 32-bit floating point (FP32) to 8-bit integer (INT8) precision?",
          options: [
            "75% reduction (from 4 bytes per parameter down to 1 byte per parameter)",
            "50% reduction",
            "10% reduction",
            "Zero reduction"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-124",
          type: "MCQ",
          prompt: "What is the difference between Post-Training Quantization (PTQ) and Quantization-Aware Training (QAT)?",
          options: [
            "PTQ quantizes weights after training using a small calibration set; QAT models quantization noise directly during training forward passes to preserve accuracy on sensitive models",
            "PTQ runs on mobile devices; QAT runs on supercomputers",
            "PTQ requires source code; QAT does not",
            "There is no difference; they are exact aliases"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-125",
          type: "MCQ",
          prompt: "What is 'Constant Folding' during graph optimization?",
          options: [
            "Evaluating static, unchanging sub-expressions in the compute graph at compile-time rather than recomputing them on every inference forward pass",
            "Folding paper documentation in the office",
            "Deleting zero values from database tables",
            "Compressing text strings using gzip"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-126",
          type: "MCQ",
          prompt: "Why should you specify 'dynamic_axes' when exporting a model to ONNX via 'torch.onnx.export'?",
          options: [
            "To permit variable batch sizes and variable input sequence lengths at inference time rather than fixing batch size to a static scalar",
            "To allow the model to run on both Intel and AMD CPUs",
            "To enable 3D visualization in browser dashboards",
            "To prevent the GPU from overheating"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-127",
          type: "MCQ",
          prompt: "What is TorchScript in the PyTorch ecosystem?",
          options: [
            "An intermediate representation of PyTorch models created via tracing (torch.jit.trace) or scripting (torch.jit.script) that can run in a standalone C++ runtime",
            "A scripting language for writing web pages",
            "A JavaScript library for drawing charts",
            "A tool for formatting Python docstrings"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-128",
          type: "MCQ",
          prompt: "What optimization hardware engine is specifically engineered by Intel for accelerating inference on Intel Xeon CPUs and integrated GPUs?",
          options: ["OpenVINO", "TensorRT", "CUDA Toolkit", "CoreML"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-129",
          type: "MCQ",
          prompt: "What is 'Weight Pruning' in deep learning optimization?",
          options: [
            "Setting non-critical weight parameters with near-zero values to exactly zero, creating sparse matrices that require less storage and computation",
            "Deleting random layers from the neural network",
            "Reducing the size of image pixels",
            "Stopping training after 5 minutes"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-130",
          type: "MCQ",
          prompt: "What execution provider in ONNX Runtime delivers high-performance acceleration on NVIDIA GPUs?",
          options: ["CUDAExecutionProvider (or TensorrtExecutionProvider)", "CPUExecutionProvider", "MetalExecutionProvider", "DirectMLExecutionProvider"],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-MLO-014",
      courseId: "CRS-MLO-001",
      chapterId: "CH-MLO-014",
      title: "REST & gRPC Model Microservices Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-MLO-131",
          type: "MCQ",
          prompt: "Why is gRPC (Protocol Buffers over HTTP/2) preferred over REST (JSON over HTTP/1.1) for high-throughput internal microservice inference?",
          options: [
            "Binary protobuf serialization eliminates heavy JSON string parsing overhead, and HTTP/2 multiplexing avoids connection head-of-line blocking",
            "gRPC only works with machine learning models",
            "JSON is deprecated in modern web development",
            "gRPC runs on quantum computing hardware"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-132",
          type: "MCQ",
          prompt: "What is 'Adaptive Micro-Batching' in modern inference frameworks like BentoML?",
          options: [
            "Dynamically queuing concurrent incoming individual requests over a tiny time window (e.g., 5-10ms) and executing them as a single tensor batch on the GPU",
            "Saving batches of images to disk",
            "Splitting database rows across multiple tables",
            "Limiting user requests to 10 per day"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-133",
          type: "MCQ",
          prompt: "Why does dynamic micro-batching dramatically improve GPU serving economics?",
          options: [
            "GPUs are parallel compute engines; processing a batch of 16 requests simultaneously takes nearly the same time as processing 1 request, multiplying throughput by over 10x",
            "It turns off the GPU memory controller",
            "It reduces the price of cloud hosting by 90%",
            "It eliminates the need for network bandwidth"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-134",
          type: "MCQ",
          prompt: "What Python web framework provides native async request handling and automatic OpenAPI schema validation using Pydantic?",
          options: ["FastAPI", "Flask", "Django classic", "Bottle"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-135",
          type: "MCQ",
          prompt: "In a production ML microservice, why should CPU-bound heavy matrix math NOT be executed directly inside the main async event loop?",
          options: [
            "Blocking CPU computations freeze the entire asyncio event loop, preventing all other concurrent requests from being received or processed",
            "Because Python will immediately throw a syntax error",
            "Because async functions cannot return numbers",
            "Because the operating system will terminate the network interface"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-136",
          type: "MCQ",
          prompt: "What is a 'Bento' in the BentoML framework?",
          options: [
            "A standardized, self-contained distribution format bundling model weights, inference service code, dependencies, and container build configurations",
            "A lunch box sold in Japanese restaurants",
            "A JavaScript frontend framework",
            "A Kubernetes network plugin"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-137",
          type: "MCQ",
          prompt: "What protocol buffer compiler converts .proto interface definition files into typed client and server stubs in Python?",
          options: ["protoc", "grpc-build", "thrift-compile", "json-schema-gen"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-138",
          type: "MCQ",
          prompt: "How can you implement health check endpoints in a production ML microservice for Kubernetes liveness/readiness probes?",
          options: [
            "Expose '/healthz' (liveness) returning HTTP 200, and '/ready' (readiness) checking if model weights are fully loaded into GPU memory before returning 200",
            "By checking if the server power light is blinking",
            "By pinging google.com every second",
            "By checking the developer's Slack status"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-139",
          type: "MCQ",
          prompt: "What is 'Model Warm-up' prior to attaching a serving container to production traffic?",
          options: [
            "Running a dummy inference request through the model during container startup to trigger CUDA initialization and kernel compilation, avoiding cold-start latency spikes for real users",
            "Heating the server room to 40 degrees Celsius",
            "Re-training the model on random data",
            "Allowing the hard drive to spin for 10 minutes"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-140",
          type: "MCQ",
          prompt: "Which command containerizes a BentoML service into an OCI-compliant Docker image?",
          options: ["bentoml containerize <bento-name>:<tag>", "docker build --bento", "bentoml export-image", "bentoml pack --docker"],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-MLO-015",
      courseId: "CRS-MLO-001",
      chapterId: "CH-MLO-015",
      title: "NVIDIA Triton Inference Server Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-MLO-141",
          type: "MCQ",
          prompt: "What is the primary architectural advantage of NVIDIA Triton Inference Server over custom Python Flask/FastAPI wrappers?",
          options: [
            "Triton is implemented in C++ with native multi-model concurrent GPU execution, hardware dynamic batching, and zero-copy shared memory IPC",
            "Triton trains neural networks automatically without code",
            "Triton only runs on mobile devices",
            "Triton does not require an operating system"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-142",
          type: "MCQ",
          prompt: "What file in a Triton model repository specifies inputs, outputs, precision, dynamic batching, and instance groups?",
          options: ["config.pbtxt", "model.yaml", "settings.json", "triton.ini"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-143",
          type: "MCQ",
          prompt: "What does setting 'max_queue_delay_microseconds: 5000' in Triton's dynamic batching configuration do?",
          options: [
            "It instructs Triton to wait up to 5 milliseconds to aggregate incoming requests until 'max_batch_size' is reached before launching the inference kernel",
            "It drops requests if they take longer than 5 microseconds",
            "It pauses the server for 5 minutes between queries",
            "It deletes slow requests from memory"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-144",
          type: "MCQ",
          prompt: "What is a Triton 'Model Ensemble'?",
          options: [
            "A pipeline that links multiple models together (e.g., Image Preprocessor -> Object Detector -> Classifier) into an atomic compute graph within Triton without network roundtrips",
            "A group of data scientists working in the same room",
            "A collection of training datasets",
            "A musical band composed of robots"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-145",
          type: "MCQ",
          prompt: "What backend frameworks can NVIDIA Triton serve simultaneously out of the box?",
          options: [
            "TensorRT, ONNX Runtime, PyTorch (LibTorch), TensorFlow, and custom Python backends",
            "Only PyTorch",
            "Only TensorFlow",
            "Only Scikit-learn"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-146",
          type: "MCQ",
          prompt: "What is Business Logic Scripting (BLS) in Triton?",
          options: [
            "A Python backend capability allowing engineers to author custom business logic, pre/post-processing, and dynamic model execution directly inside Triton",
            "A billing software module for invoicing customers",
            "A programming language developed by Microsoft",
            "A legal compliance document"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-147",
          type: "MCQ",
          prompt: "How does Triton support concurrent execution of multiple model copies on a single physical GPU?",
          options: [
            "By configuring 'instance_group [ { count: 2, kind: KIND_GPU } ]' in config.pbtxt, creating multiple execution engines in separate CUDA streams",
            "By running two operating systems simultaneously",
            "By splitting the GPU in half with a physical saw",
            "Triton does not support concurrent execution"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-148",
          type: "MCQ",
          prompt: "What is System Shared Memory / CUDA Shared Memory IPC in Triton client communication?",
          options: [
            "Allowing the client application and Triton to transfer input/output tensors directly through shared memory, eliminating HTTP/network serialization overhead entirely",
            "Sharing RAM with public internet users",
            "A cloud storage bucket accessible by all employees",
            "A tool for syncing files between laptops"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-149",
          type: "MCQ",
          prompt: "How does Triton manage model versioning within its model repository structure?",
          options: [
            "By placing model artifacts in numerically named subdirectories (e.g., '1/', '2/'), configurable to serve the latest version, specific versions, or all versions simultaneously",
            "By renaming the model file with Git commit hashes",
            "By storing versions in an external MySQL database",
            "By appending timestamps to the filename"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-150",
          type: "MCQ",
          prompt: "What official benchmarking tool provided by NVIDIA measures Triton latency, throughput, and GPU saturation across dynamic batch sizes?",
          options: ["Perf Analyzer (perf_analyzer)", "Apache Bench", "JMeter", "Postman Runner"],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-MLO-016",
      courseId: "CRS-MLO-001",
      chapterId: "CH-MLO-016",
      title: "Cloud-Native Model Serving with KServe Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-MLO-151",
          type: "MCQ",
          prompt: "What is KServe (formerly KFServing)?",
          options: [
            "A cloud-native Kubernetes Custom Resource Definition (InferenceService) providing serverless, multi-framework model serving with scale-to-zero capabilities",
            "A database replication tool",
            "A food delivery mobile application",
            "A monitoring dashboard for DNS servers"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-152",
          type: "MCQ",
          prompt: "What underlying Kubernetes technology enables KServe to scale model replica pods down to ZERO when no inference requests are arriving?",
          options: ["Knative Serving (via Queue-Proxy and Activator components)", "Kube-proxy iptables", "CoreDNS caching", "Linux systemd"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-153",
          type: "MCQ",
          prompt: "What are the three distinct components of a KServe InferenceService specification?",
          options: [
            "Predictor (Core model inference), Transformer (Pre/Post-processing), and Explainer (Interpretability/SHAP)",
            "Ingress, Service, and Pod",
            "HTML, CSS, and JavaScript",
            "CPU, Memory, and Disk"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-154",
          type: "MCQ",
          prompt: "What is the Open Inference Protocol (v2 Data Plane)?",
          options: [
            "A standardized REST and gRPC API specification developed collaboratively by KServe, Seldon, and Triton ensuring uniform prediction formats across frameworks",
            "An open-source network cable standard",
            "A protocol for sending encrypted emails",
            "A video streaming protocol"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-155",
          type: "MCQ",
          prompt: "What is Seldon Core?",
          options: [
            "A cloud-native ML serving platform for Kubernetes supporting complex inference graphs, canary rollouts, outlier detection, and multi-armed bandits",
            "A CPU processor built by Intel",
            "A Linux operating system distribution",
            "A continuous integration tool built by Apple"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-156",
          type: "MCQ",
          prompt: "How does KServe load model weights into predictor pods without baking multi-gigabyte models into Docker images?",
          options: [
            "Via an automated Storage Initializer init container that pulls model artifacts from S3/GCS using the specified 'storageUri'",
            "By downloading files from YouTube",
            "By asking the user to upload the file via web browser",
            "By transferring files over Bluetooth"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-157",
          type: "MCQ",
          prompt: "What happens during a 'Cold Start' in scale-to-zero serverless inference?",
          options: [
            "The first request to an idle model experiences a brief latency delay while Knative spawns a new pod, initializes the container, and loads model weights into memory",
            "The server hardware freezes and must be rebooted",
            "The request is permanently dropped",
            "The model weights are corrupted"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-158",
          type: "MCQ",
          prompt: "How can you prevent cold start latency for critical production services in KServe?",
          options: [
            "By configuring 'minReplicas: 1' (or higher) to ensure at least one warm instance is always running",
            "By turning off cluster security firewalls",
            "By allocating 100 terabytes of disk space",
            "Cold starts cannot be prevented"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-159",
          type: "MCQ",
          prompt: "What is an 'Explainer' container in a KServe InferenceService?",
          options: [
            "A specialized sidecar or service that computes explainability values (like SHAP or LIME attributions) when requested by clients via the '/explain' endpoint",
            "A voice synthesizer that reads logs aloud",
            "A chatbot that answers user questions",
            "A documentation generator"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-160",
          type: "MCQ",
          prompt: "What ingress controller is standardly paired with Knative and KServe for intelligent request routing and autoscaling metrics?",
          options: ["Istio (or Kourier)", "Apache HTTP Server", "BIND DNS", "Squid Proxy"],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-MLO-017",
      courseId: "CRS-MLO-001",
      chapterId: "CH-MLO-017",
      title: "Production Deployment Strategies for ML Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-MLO-161",
          type: "MCQ",
          prompt: "How does a Canary Rollout operate for an ML model?",
          options: [
            "A small percentage of live production traffic (e.g., 10%) is routed to the new candidate model while the remaining 90% stays on the proven model, monitoring health before advancing",
            "The model is deployed exclusively in the Canary Islands",
            "The model is tested on birds",
            "All servers are restarted simultaneously"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-162",
          type: "MCQ",
          prompt: "What is the defining operational advantage of a Shadow Deployment (Dark Launch)?",
          options: [
            "Zero end-user impact: candidate models process real live production payloads in real-time, verifying latency, memory, and prediction outputs without users seeing the results",
            "It runs on dark fiber network lines",
            "It consumes zero electricity",
            "It automatically fixes software bugs"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-163",
          type: "MCQ",
          prompt: "How does Multi-Armed Bandit (MAB) experimentation improve upon static 50/50 A/B testing?",
          options: [
            "It dynamically routes increasing percentages of traffic to whichever model is performing better in real time, minimizing lost revenue and customer churn during the experiment",
            "It tests 50 models simultaneously with equal traffic",
            "It eliminates the need for mathematical statistics",
            "It requires zero user data"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-164",
          type: "MCQ",
          prompt: "What is 'Cumulative Regret' in online model experimentation?",
          options: [
            "The total lost reward or business value incurred by routing traffic to sub-optimal model variants during the testing period rather than the optimal variant",
            "The psychological stress experienced by data scientists",
            "The cost of deleting database records",
            "The amount of memory leaked by the server"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-165",
          type: "MCQ",
          prompt: "In a Blue/Green deployment strategy, how is traffic switched between the old environment (Blue) and the new environment (Green)?",
          options: [
            "By updating the router or load balancer target group instantaneously (100% cutover) once the Green environment passes all smoke tests",
            "By shutting down the blue servers and waiting 2 hours",
            "By painting the server racks green",
            "By asking users to refresh their browser"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-166",
          type: "MCQ",
          prompt: "What popular Multi-Armed Bandit algorithm models probabilities using Bayesian beta distributions to balance exploration and exploitation?",
          options: ["Thompson Sampling", "QuickSort", "Dijkstra algorithm", "Breadth-first search"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-167",
          type: "MCQ",
          prompt: "What metric should trigger an instant, automated rollback during a canary deployment of a new recommendation model?",
          options: [
            "A statistically significant surge in HTTP 5xx errors or an unacceptable spike in p99 inference latency beyond the agreed SLA",
            "A drop in external temperature",
            "An increase in user registrations",
            "A Git commit on the documentation branch"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-168",
          type: "MCQ",
          prompt: "What service mesh technology is frequently utilized on Kubernetes to implement percentage-based traffic splits for model canaries?",
          options: ["Istio VirtualServices with weighted routing rules", "CoreDNS", "Calico CNI", "Kubelet"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-169",
          type: "MCQ",
          prompt: "What is the primary risk of an immediate 'Big Bang' deployment (replacing 100% of production traffic instantly)?",
          options: [
            "Any hidden bug, catastrophic latency spike, or unexpected edge case instantly impacts 100% of end users with maximum blast radius",
            "It consumes too much paper",
            "Cloud providers charge double for instant updates",
            "It violates Git version control guidelines"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-170",
          type: "MCQ",
          prompt: "Why is tracking business metrics (like conversion rate or checkout value) alongside technical metrics (latency, error rate) critical during model rollouts?",
          options: [
            "A model can return HTTP 200 responses with low latency while making mathematically flawed predictions that destroy company revenue",
            "Because technical metrics cannot be measured in real time",
            "Because business metrics are required by the Linux kernel",
            "Because Kubernetes only monitors financial spreadsheets"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-MLO-018",
      courseId: "CRS-MLO-001",
      chapterId: "CH-MLO-018",
      title: "Edge ML Deployment & On-Device Optimization Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-MLO-171",
          type: "MCQ",
          prompt: "What is the primary reason for deploying machine learning models directly on edge devices (smartphones, IoT sensors, vehicles)?",
          options: [
            "Ultra-low latency, zero dependence on network connectivity, bandwidth cost reduction, and user data privacy compliance",
            "Edge devices have more memory than cloud datacenters",
            "Edge deployment eliminates the need for software code",
            "To make models impossible to copy"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-172",
          type: "MCQ",
          prompt: "What is TensorFlow Lite (TFLite)?",
          options: [
            "A lightweight runtime and converter specifically designed for executing compressed machine learning models on mobile, embedded, and IoT devices",
            "A web browser built by Google",
            "A simplified version of Python for kids",
            "A database management system"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-173",
          type: "MCQ",
          prompt: "What is Apple CoreML?",
          options: [
            "Apple's framework for integrating machine learning models into iOS, macOS, and watchOS apps, leveraging the Apple Neural Engine (ANE) hardware accelerator",
            "An Apple hardware desktop computer",
            "An online music store",
            "A language compiler for Swift"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-174",
          type: "MCQ",
          prompt: "How does thermal throttling impact machine learning inference on edge devices?",
          options: [
            "Excessive heat generated by heavy matrix computations forces the mobile OS to throttle CPU/GPU clock speeds, causing latency to degrade significantly",
            "It sets the phone battery on fire",
            "It turns off the phone display",
            "It deletes uncommitted code"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-175",
          type: "MCQ",
          prompt: "What is Full Integer Quantization in TFLite?",
          options: [
            "Converting all 32-bit floating point model weights and activation tensors into 8-bit integers, enabling execution on integer-only hardware accelerators like DSPs",
            "Rounding all predictions to 0 or 1",
            "Deleting decimal places from training data",
            "Compressing text files using tar"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-176",
          type: "MCQ",
          prompt: "What is an NPU in modern edge hardware architectures?",
          options: [
            "Neural Processing Unit: a dedicated hardware silicon accelerator optimized specifically for vectorized matrix multiplication operations in neural networks",
            "Network Packet Utility",
            "Node Power Unit",
            "Non-Programmable User interface"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-177",
          type: "MCQ",
          prompt: "What mechanism is commonly used to distribute updated model weights to millions of edge mobile devices in the field?",
          options: [
            "Over-the-Air (OTA) background delta updates downloaded via CDN when the device is connected to Wi-Fi and charging",
            "Mailing USB thumb drives to every customer",
            "Requiring users to manually recompile code",
            "Connecting devices with physical cables in stores"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-178",
          type: "MCQ",
          prompt: "What is Federated Learning in edge machine learning?",
          options: [
            "A decentralized training paradigm where edge devices train on local data and transmit only encrypted gradient updates to a central server, preserving data privacy",
            "A government organization regulating AI",
            "Training models on a single supercomputer",
            "A network protocol replacing TCP/IP"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-179",
          type: "MCQ",
          prompt: "What is 'Structured Pruning' versus 'Unstructured Pruning' for edge models?",
          options: [
            "Structured pruning removes entire channels or filters resulting in dense, smaller matrices that run faster on standard hardware; Unstructured pruning zeros out individual weights creating sparse matrices",
            "Structured pruning requires an internet connection",
            "Unstructured pruning only works on text data",
            "There is no difference; they are aliases"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-180",
          type: "MCQ",
          prompt: "Why should edge computer vision models maintain inference latency under 16 milliseconds per frame?",
          options: [
            "To maintain a real-time 60 frames-per-second (FPS) processing pipeline without dropping video frames",
            "Because mobile batteries discharge in 16 milliseconds",
            "Because Bluetooth connections disconnect after 16ms",
            "Because edge screens only refresh once per second"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
  ],
};

