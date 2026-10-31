// Course 9: MLOps Masterclass - Phase 5: LLMOps, Generative AI Serving & Capstone
// Chapters 25 to 30 | Assessments 25 to 30 | 60 MCQs

export const phase5 = {
  chapters: [
    {
      id: "CH-MLO-025",
      courseId: "CRS-MLO-001",
      sequence: 25,
      title: "The LLMOps Paradigm & Foundation Model Lifecycle",
      description: "Deconstruct the shift from Traditional MLOps to LLMOps: Foundation model lifecycles, Prompt Engineering vs Fine-Tuning vs RAG economics, and token tracking.",
      contentType: "Rich Text",
      durationMinutes: 85,
      minimumTimeMinutes: 55,
      body: `
# The LLMOps Paradigm & Foundation Model Lifecycle

The rise of generative Large Language Models (LLMs) has fundamentally transformed the engineering landscape. While traditional MLOps centered on training custom models from scratch on structured tabular data, **LLMOps** orchestrates massive pre-trained foundation models through prompt engineering, Retrieval-Augmented Generation (RAG), parameter-efficient fine-tuning (PEFT), and KV-cache serving optimization.

---

## 1. Traditional MLOps vs. LLMOps

| Architectural Dimension | Traditional MLOps | Modern LLMOps |
|---|---|---|
| **Model Origin** | Trained from scratch on proprietary domain data | Pre-trained foundation models (Llama 3, Mistral, GPT-4) |
| **Model Size** | Megabytes to few Gigabytes | Tens to hundreds of Gigabytes (7B to 70B+ parameters) |
| **Primary Compute Focus**| Offline batch training on multi-node GPUs | **High-throughput inference & KV-cache memory management** |
| **Input / Output** | Structured numerical vectors / classes | Unstructured natural language tokens |
| **Evaluation Metrics** | Deterministic (ROC-AUC, RMSE, F1-Score) | Non-deterministic (LLM-as-a-Judge, RAG Triad, ROUGE/BLEU) |
| **Cost Vector** | Cloud training hours | **Token inference costs & GPU VRAM memory footprints** |

---

## 2. The Decision Matrix: Prompting vs. RAG vs. Fine-Tuning

\`\`\`
+--------------------------------------------------------------------------+
| 1. PROMPT ENGINEERING & IN-CONTEXT LEARNING                              |
| - Fast execution; zero training; relies entirely on system prompts & few-shot|
| - Trade-off: High token costs on long contexts; bounded by context window |
+--------------------------------------------------------------------------+
                                    |
                    Need Private / Dynamic Enterprise Knowledge?
                                    v
+--------------------------------------------------------------------------+
| 2. RETRIEVAL-AUGMENTED GENERATION (RAG)                                  |
| - Ingests external enterprise knowledge bases into vector databases      |
| - Dynamically injects relevant chunks into the prompt context at runtime  |
| - Prevents hallucinations; provides verifiable document citations        |
+--------------------------------------------------------------------------+
                                    |
                    Need Custom Style, Tone, or Complex Domain Grammar?
                                    v
+--------------------------------------------------------------------------+
| 3. PARAMETER-EFFICIENT FINE-TUNING (PEFT / QLoRA)                        |
| - Trains low-rank adapter matrices (LoRA) on curated domain pairs        |
| - Bakes style, specialized JSON schemas, and jargon into model weights   |
| - Lowest per-query token latency; requires high-quality curated data     |
+--------------------------------------------------------------------------+
\`\`\`

---

## 3. Token Economics & Cost Modeling

LLMOps engineers continuously monitor token consumption:
$$\\text{Total Cost} = \\sum \\left( N_{\\text{prompt\\_tokens}} \\times \\text{Rate}_{\\text{in}} + N_{\\text{completion\\_tokens}} \\times \\text{Rate}_{\\text{out}} \\right)$$

- Completion tokens are typically $3\\times - 4\\times$ more expensive and significantly slower than prompt tokens due to sequential autoregressive generation.
- **Semantic Caching:** Caching identical or semantically similar query responses via vector similarity saves up to $40\\%$ of upstream foundation model API costs.

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/S4A_51cR54o" title="What is LLMOps? Generative AI Operations" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-MLO-026",
      courseId: "CRS-MLO-001",
      sequence: 26,
      title: "High-Throughput LLM Serving with vLLM & TGI",
      description: "Master high-throughput LLM serving architectures: PagedAttention, KV-cache fragmentation mitigation, Continuous Batching, and Speculative Decoding.",
      contentType: "Rich Text",
      durationMinutes: 90,
      minimumTimeMinutes: 60,
      body: `
# High-Throughput LLM Serving with vLLM & TGI

Serving large language models autoregressively is bottlenecked by GPU memory bandwidth and the **Key-Value (KV) Cache**. In standard HuggingFace Transformers, up to $80\\%$ of GPU memory is wasted on static memory pre-allocation and memory fragmentation. **vLLM** solves this via **PagedAttention**, achieving $10\\times - 20\\times$ higher serving throughput.

---

## 1. The KV-Cache Bottleneck & PagedAttention Innovation

During autoregressive generation, each generated token produces Key and Value vector tensors that must be cached across subsequent decoding steps to avoid redundant computations:

\`\`\`
TRADITIONAL HUGGINGFACE SERVING (Contiguous Memory Allocation):
[ Request A: 200 tokens ] [ Blank Reserved Memory: 1800 tokens ] (MASSIVE FRAGMENTATION & WASTE)
[ Request B: 50 tokens  ] [ Blank Reserved Memory: 1950 tokens ] (OOM with only 4 users!)

vLLM PAGEDATTENTION (Virtual Memory Paging):
Physical GPU Memory divided into dynamic Pages (Blocks of 16 tokens):
Block Table: Request A -> [ Block 4 -> Block 12 -> Block 9 ]
Block Table: Request B -> [ Block 1 -> Block 7 ]
- Zero internal fragmentation; near 100% GPU VRAM utilization!
- Handles 50+ concurrent streaming users on a single A100 GPU!
\`\`\`

---

## 2. Continuous Batching (Iteration-Level Scheduling)

Traditional batching waits for the slowest user request in a batch to finish generating all 500 tokens before releasing GPU resources. **Continuous Batching** operates at the iteration level: as soon as an individual sequence emits an end-of-sequence (\`<eos>\`) token, it is evicted immediately, and a newly arriving prompt is slotted into the active batch without delay!

---

## 3. Production vLLM Deployment Manifest

\`\`\`bash
# Launch high-throughput vLLM OpenAI-compatible server on 2 GPUs via Tensor Parallelism
python3 -m vllm.entrypoints.openai.api_server \\
    --model meta-llama/Meta-Llama-3-70B-Instruct \\
    --tensor-parallel-size 2 \\
    --max-model-len 8192 \\
    --gpu-memory-utilization 0.92 \\
    --port 8000
\`\`\`

Query via standard OpenAI client SDK:
\`\`\`python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8000/v1", api_key="token-empty")
response = client.chat.completions.create(
    model="meta-llama/Meta-Llama-3-70B-Instruct",
    messages=[{"role": "user", "content": "Explain PagedAttention in 2 sentences."}],
    temperature=0.2
)
print(response.choices[0].message.content)
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/5a4G0kZ04rA" title="vLLM & PagedAttention Deep Dive" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-MLO-027",
      courseId: "CRS-MLO-001",
      sequence: 27,
      title: "Parameter-Efficient Fine-Tuning (PEFT) & LoRA / QLoRA Pipelines",
      description: "Train domain-specific foundation models: Low-Rank Adaptation (LoRA), 4-bit NormalFloat (NF4) QLoRA, adapter merging, and HuggingFace TRL pipelines.",
      contentType: "Rich Text",
      durationMinutes: 85,
      minimumTimeMinutes: 55,
      body: `
# Parameter-Efficient Fine-Tuning (PEFT) & LoRA / QLoRA Pipelines

Full fine-tuning of a 70B parameter model requires updating and storing all 70 billion parameters, requiring a cluster of 8 NVIDIA H100 GPUs and hundreds of gigabytes of storage per model variant. **LoRA** and **QLoRA** allow fine-tuning on a single commodity GPU by freezing the base model and training tiny low-rank adapter matrices.

---

## 1. Low-Rank Adaptation (LoRA) Mathematics

Instead of updating the full weight matrix $W_0 \\in \\mathbb{R}^{d \\times k}$, LoRA freezes $W_0$ and decomposes the parameter update $\\Delta W$ into the product of two low-rank matrices $A$ and $B$:

$$W = W_0 + \\Delta W = W_0 + \\frac{\\alpha}{r} (B \\cdot A)$$

Where $A \\in \\mathbb{R}^{r \\times k}$ and $B \\in \\mathbb{R}^{d \\times r}$ with rank $r \\ll \\min(d, k)$ (typically $r = 8$ or $r = 16$).
- **Parameters Trained:** Less than $0.1\\%$ of original parameters!
- **Zero Additional Latency at Inference:** At deployment, $\\Delta W = B \\cdot A$ can be mathematically merged directly into $W_0$: \`model.merge_and_unload()\`.

---

## 2. QLoRA: 4-bit NormalFloat Quantization

QLoRA (Dettmers et al.) quantizes the frozen base model to **4-bit NormalFloat (NF4)** precision while computing gradients through 16-bit LoRA adapter matrices:
- Fine-tunes a 30B parameter model on a single 24 GB GPU (e.g., RTX 4090 or A10G).
- Employs **Double Quantization** and **Paged Optimizers** to absorb memory spikes during backpropagation.

---

## 3. Production QLoRA Pipeline in Python

\`\`\`python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training

# 1. 4-bit NormalFloat Quantization Config
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True,
)

model_id = "meta-llama/Meta-Llama-3-8B"
model = AutoModelForCausalLM.from_pretrained(model_id, quantization_config=bnb_config, device_map="auto")
model = prepare_model_for_kbit_training(model)

# 2. Configure Low-Rank Adapters
peft_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)
model = get_peft_model(model, peft_config)
model.print_trainable_parameters()
# Output: trainable params: 13,631,488 || all params: 8,043,892,736 || trainable%: 0.169%
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/5U_7L5jUu7o" title="LoRA and QLoRA Explained in Depth" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-MLO-028",
      courseId: "CRS-MLO-001",
      sequence: 28,
      title: "Enterprise RAG Architecture & Vector Database Operations",
      description: "Build production RAG pipelines: Document chunking, dense vector embeddings, vector databases (Pinecone, Qdrant, Milvus), hybrid search, and cross-encoder reranking.",
      contentType: "Rich Text",
      durationMinutes: 85,
      minimumTimeMinutes: 55,
      body: `
# Enterprise RAG Architecture & Vector Database Operations

Retrieval-Augmented Generation (RAG) grounds foundation models in dynamic, proprietary enterprise data. Naive RAG implementations fail due to poor document chunking, semantic retrieval mismatches, and out-of-context hallucinations.

---

## 1. Enterprise Multi-Stage RAG Pipeline Architecture

\`\`\`
+-----------------------------------------------------------------------------------------+
| 1. INGESTION PIPELINE (Offline / Streaming)                                             |
| Raw Documents (PDF, Wiki, Confluence)                                                   |
|       |                                                                                 |
|       v                                                                                 |
| Semantic Chunking (500 tokens with 50-token sliding overlap)                           |
|       |                                                                                 |
|       v                                                                                 |
| Embedding Model (e.g., text-embedding-3-large / BAAI/bge-large)                          |
|       |                                                                                 |
|       v                                                                                 |
| Upsert to Vector Database (Pinecone, Qdrant, Milvus, pgvector) with Metadata Indexing   |
+-----------------------------------------------------------------------------------------+
                                    |
+-----------------------------------------------------------------------------------------+
| 2. RETRIEVAL & INFERENCE PIPELINE (Real-Time)                                           |
| User Query: "What is our customer refund policy for delayed shipments?"                 |
|       |                                                                                 |
|       +-----------------------------------+-----------------------------------+         |
|       |                                                                       |         |
|       v                                                                       v         |
| Dense Vector Search (Cosine / HNSW)                 Sparse Keyword Search (BM25)        |
|       |                                                                       |         |
|       +-----------------------------------+-----------------------------------+         |
|                                           |                                             |
|                                           v                                             |
|                     Reciprocal Rank Fusion (Hybrid Search)                              |
|                                           |                                             |
|                                           v                                             |
|             Cross-Encoder Reranker (Cohere / BGE-Reranker-Large)                         |
|             Select Top 3 Most Grounded Chunks (< 15ms)                                  |
|                                           |                                             |
|                                           v                                             |
| Augmented Context Prompt ---> LLM (vLLM / Llama-3) ---> Accurate Response with Citations|
+-----------------------------------------------------------------------------------------+
\`\`\`

---

## 2. Hybrid Search: Dense + Sparse Retrieval (BM25 + HNSW)

- **Dense Embeddings (Vector Search):** Excellent for semantic comprehension and concept synonyms, but struggles with exact alphanumeric serial numbers, product IDs, or specific names.
- **Sparse Embeddings (BM25 / Keyword Search):** Excels at exact keyword and alphanumeric token matching.
- **Reciprocal Rank Fusion (RRF):** Blends the rank positions from both retrievers to produce the most accurate top-$k$ candidate set.

---

## 3. Cross-Encoder Reranking

Bi-encoder embedding models score query and document independently ($O(1)$ lookup via vector index). A **Cross-Encoder Reranker** processes the query and candidate chunk jointly through full cross-attention layers, filtering out irrelevant chunks before prompt injection.

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/5a4G0kZ04rA" title="Advanced RAG Architecture & Vector Search" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-MLO-029",
      courseId: "CRS-MLO-001",
      sequence: 29,
      title: "LLM Evaluation, Guardrails & Observability",
      description: "Implement LLM quality assurance: The RAG Triad (Context Relevance, Groundedness, Answer Relevance), LangSmith tracing, and NeMo Guardrails safety filtering.",
      contentType: "Rich Text",
      durationMinutes: 80,
      minimumTimeMinutes: 50,
      body: `
# LLM Evaluation, Guardrails & Observability

Generative AI systems produce non-deterministic natural language outputs. Ensuring safety, eliminating hallucinations, and validating response accuracy requires programmatic evaluation frameworks and perimeter guardrails.

---

## 1. The RAG Triad Evaluation Framework (TruLens)

\`\`\`
                          [ USER QUERY ]
                           /          \\
                          /            \\
           1. Context    /              \\  3. Answer
           Relevance    /                \\    Relevance
                       v                  v
             [ RETRIEVED CONTEXT ] ---> [ GENERATED RESPONSE ]
                            2. Groundedness
                        (Zero Hallucinations!)
\`\`\`

1. **Context Relevance:** Are the retrieved document chunks relevant to the user's specific query? (Evaluates Vector Search & Reranker quality).
2. **Groundedness (Faithfulness):** Is the generated LLM response strictly supported by the retrieved context, or did the model invent external facts? (Measures Hallucination Rate).
3. **Answer Relevance:** Does the final response actually answer the original user query directly?

---

## 2. LLM Safety & Guardrails with NVIDIA NeMo Guardrails

Production LLM endpoints must enforce strict security boundaries to prevent **Prompt Injection**, **Jailbreaks**, and **Sensitive Data Exfiltration (PII)**:

\`\`\`yaml
# Inside config/rails.co
define user ask off_topic
  "Can you write a poem about politics?"
  "How do I hack a server?"

define flow
  user ask off_topic
  bot refuse respond

define bot refuse respond
  "I am an enterprise banking assistant. I can only assist with account inquiries and financial transactions."
\`\`\`

---

## 3. Distributed LLM Tracing with LangSmith / OpenInference

Instrumenting LLM pipelines with OpenInference standards captures the entire execution chain:
- User Prompt $\\rightarrow$ Embedding Latency $\\rightarrow$ Vector DB Query $\\rightarrow$ Reranker Latency $\\rightarrow$ LLM Time-to-First-Token (TTFT) $\\rightarrow$ Inter-Token Latency $\\rightarrow$ Total Cost (\$).

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/5U_7L5jUu7o" title="Evaluating LLMs & RAG Triad Complete Guide" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-MLO-030",
      courseId: "CRS-MLO-001",
      sequence: 30,
      title: "Enterprise MLOps Capstone: The Cortex AI Financial Platform",
      description: "Capstone project: Architect the end-to-end 'Cortex AI' enterprise platform combining Kubeflow, Triton, vLLM, Feast, DVC, and SRE resilience; Staff MLOps interview defense.",
      contentType: "Rich Text",
      durationMinutes: 90,
      minimumTimeMinutes: 60,
      body: `
# Enterprise MLOps Capstone: The Cortex AI Platform

This masterclass capstone synthesizes every foundational, operational, serving, and LLMOps skill mastered across this course into an end-to-end enterprise platform architecture.

---

## 1. The Capstone Architecture: "Cortex AI" Financial Intelligence

You are the Staff MLOps / Platform Architect at **Cortex Financial**, a tier-1 multinational banking institution. You must architect and defend the complete platform supporting:
1. **Real-time Fraud Classification:** Sub-10ms latency inference on 100,000 transactions per second (Triton + Feast + ONNX).
2. **Generative Financial Analyst Assistant:** High-throughput internal RAG and fine-tuned LLM serving (vLLM + Qdrant + NeMo Guardrails).
3. **Automated Continuous Retraining (CT/CD):** Drift-triggered automated training DAGs on Kubernetes (Kubeflow + DVC + MLflow).

\`\`\`
+---------------------------------------------------------------------------------------------------+
| REAL-TIME INGESTION & FEATURE FABRIC                                                              |
| Kafka Streaming Telemetry ---> Feast Online Store (Redis Clustered) [< 5ms lookup]                |
|                           ---> Snowflake / S3 Parquet Lakehouse (DVC Versioned)                   |
+---------------------------------------------------------------------------------------------------+
                                                  |
              +-----------------------------------+-----------------------------------+
              |                                                                       |
              v                                                                       v
+-------------------------------------------+       +-------------------------------------------+
| TIER 1: REAL-TIME FRAUD INFERENCE         |       | TIER 2: ENTERPRISE GENERATIVE LLMOPS      |
| Kubernetes Cluster + NVIDIA GPU Operator  |       | Kubernetes Cluster + Multi-Node A100 HGX  |
| - NVIDIA Triton Inference Server          |       | - vLLM Serving (PagedAttention, TP=2)     |
| - Compiled TensorRT INT8 Models           |       | - Hybrid Vector DB (Qdrant + BM25)        |
| - Dynamic Micro-Batching (5ms window)     |       | - Cross-Encoder Reranker (Cohere/BGE)     |
| - Sub-10ms p99 SLA at 100,000 TPS         |       | - NeMo Guardrails (Anti-Jailbreak/PII)    |
+-------------------------------------------+       +-------------------------------------------+
              |                                                                       |
              +-----------------------------------+-----------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
| AUTOMATED RETRAINING (CT), OBSERVABILITY & COMPLIANCE                                             |
| - Evidently AI Real-Time Drift Monitoring (PSI / KS-test)                                          |
| - Kubeflow Pipelines (KFP v2) + Ray Train (Distributed PyTorch DDP)                               |
| - MLflow Model Registry (Stage Aliases: @champion, @challenger) + Automated Canary Gates          |
| - Prometheus + Alertmanager (Multi-Window Burn-Rate Alerts) + Grafana Unified Operations Center   |
| - Cryptographic Lineage Attestation (Sigstore Cosign) & EU AI Act High-Risk Model Cards           |
+---------------------------------------------------------------------------------------------------+
\`\`\`

---

## 2. Staff MLOps Engineer System Design Interview Defense

When defending enterprise MLOps architectures in Staff and Principal level technical interviews:

### 1. Requirements & Scaling Constraints:
- Differentiate between latency-critical real-time inference (fraud, payment scoring) and asynchronous generative reasoning (RAG, summarization).
- Calculate GPU VRAM requirements based on model parameter precision and concurrent KV-cache allocations:
  $$\\text{Memory (GB)} \\approx \\left( N_{\\text{params}} \\times \\text{bytes\\_per\\_param} \\right) \\times 1.2 + \\text{KV\\_Cache\\_Buffer}$$

### 2. Failure Mode Analysis & Graceful Degradation:
- *"What happens if the primary GPU cluster crashes during peak traffic?"* (Automatic fallback to CPU-optimized ONNX runtime fallback pods with simplified heuristic rules).
- *"How do you prevent data leakage in training pipelines?"* (Enforce point-in-time correct joins via Feast time-travel joins).

### 3. Economic Governance & FinOps:
- Leverage Spot GPU instances for asynchronous Kubeflow retraining DAGs with checkpointing.
- Implement scale-to-zero serverless inference via KServe/Knative for low-frequency models.
- Apply semantic caching to eliminate redundant LLM API calls.

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/SZX3q4W7pms" title="MLOps System Design Interview Complete Guide" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
  ],
  assessments: [
    {
      id: "ASM-MLO-025",
      courseId: "CRS-MLO-001",
      chapterId: "CH-MLO-025",
      title: "The LLMOps Paradigm Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-MLO-241",
          type: "MCQ",
          prompt: "What is the primary operational difference between traditional MLOps and LLMOps?",
          options: [
            "Traditional MLOps focuses on training custom models on structured data; LLMOps orchestrates large pre-trained foundation models through prompt engineering, RAG, fine-tuning, and KV-cache serving",
            "Traditional MLOps runs on Linux; LLMOps runs on Windows",
            "LLMOps does not require monitoring",
            "Traditional MLOps only works with audio data"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-242",
          type: "MCQ",
          prompt: "When should an enterprise choose Retrieval-Augmented Generation (RAG) over model fine-tuning?",
          options: [
            "When the model needs access to dynamic, frequently updated proprietary knowledge and must provide verifiable citations with zero hallucinations",
            "When the model needs to learn a completely new spoken language",
            "When the model needs to run on microcontrollers",
            "When token costs do not matter"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-243",
          type: "MCQ",
          prompt: "Why are completion tokens significantly more expensive and slower than prompt tokens in autoregressive LLM serving?",
          options: [
            "Prompt tokens are processed in parallel in a single forward pass; completion tokens must be generated sequentially one token at a time, requiring repetitive memory loads",
            "Completion tokens require human approval",
            "Prompt tokens do not use GPU memory",
            "Completion tokens are encrypted with AES"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-244",
          type: "MCQ",
          prompt: "What is 'Semantic Caching' in generative AI gateway architectures?",
          options: [
            "Storing past queries and responses in a vector database; semantically similar user queries retrieve the cached response directly, saving token costs and reducing latency",
            "Saving temporary text files on the developer's laptop",
            "Caching DNS records in browser history",
            "Compressing text files using gzip"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-245",
          type: "MCQ",
          prompt: "What is 'LLM-as-a-Judge' in generative AI evaluation?",
          options: [
            "Using a powerful state-of-the-art model (like GPT-4) to evaluate and score the accuracy, fluency, and helpfulness of candidate model responses against strict rubrics",
            "A robotic judge presiding over legal court trials",
            "An algorithm that calculates employee salaries",
            "A software tool that checks PEP8 Python formatting"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-246",
          type: "MCQ",
          prompt: "What is 'Context Window Exhaustion'?",
          options: [
            "When the combined length of input prompt tokens, retrieved RAG context, and requested completion tokens exceeds the maximum context length supported by the model architecture",
            "When a developer runs out of monitors",
            "When the server memory overheats",
            "When internet bandwidth is disconnected"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-247",
          type: "MCQ",
          prompt: "Why is prompt versioning in version control (PromptOps) essential in production LLM applications?",
          options: [
            "Small changes to system prompt wording, formatting instructions, or few-shot examples can drastically alter model output behavior and downstream parsing",
            "Because prompts are compiled into C++ binaries",
            "Because Git will reject repositories without prompt files",
            "To make prompts download 10x faster"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-248",
          type: "MCQ",
          prompt: "When should an enterprise choose Parameter-Efficient Fine-Tuning (PEFT) over RAG?",
          options: [
            "When the application requires consistent specialized output style, nuanced domain jargon, complex JSON schema adherence, or reduced prompt token overhead",
            "When training data changes every 5 minutes",
            "When the enterprise has zero GPU resources",
            "When using pre-trained commercial APIs"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-249",
          type: "MCQ",
          prompt: "What is Time-to-First-Token (TTFT) in streaming LLM inference metrics?",
          options: [
            "The elapsed time from when a user submits a query to when the inference server returns the very first generated text token",
            "The total time to generate the entire response",
            "The time it takes to boot the server hardware",
            "The time a developer spends writing a prompt"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-250",
          type: "MCQ",
          prompt: "What is Inter-Token Latency (Time-Per-Output-Token / TPOT)?",
          options: [
            "The average time required to generate each subsequent token after the first token has been produced, determining the reading speed of streaming text",
            "The network latency between two datacenters",
            "The time it takes to save a file to disk",
            "The latency of database queries"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-MLO-026",
      courseId: "CRS-MLO-001",
      chapterId: "CH-MLO-026",
      title: "High-Throughput LLM Serving with vLLM Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-MLO-251",
          type: "MCQ",
          prompt: "What is the primary breakthrough of 'PagedAttention' in the vLLM serving framework?",
          options: [
            "It manages the Key-Value (KV) cache using virtual memory paging concepts, storing non-contiguous token blocks in physical VRAM to eliminate memory fragmentation and waste",
            "It turns large language models into PDF books",
            "It allows models to run on single-core Raspberry Pi computers",
            "It translates text into 50 languages simultaneously"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-252",
          type: "MCQ",
          prompt: "How does Continuous Batching (Iteration-Level Scheduling) improve GPU throughput over naive static batching in LLM serving?",
          options: [
            "It schedules requests at the iteration level, immediately evicting completed sequences and injecting new requests into the batch without waiting for the slowest sequence to finish",
            "It runs training batches continuously for 24 hours",
            "It eliminates the need for GPU memory",
            "It turns off gradient descent calculations"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-253",
          type: "MCQ",
          prompt: "What is Tensor Parallelism (TP) in vLLM multi-GPU serving?",
          options: [
            "Splitting linear weight matrices across multiple GPUs within the same server node using NVLink to shard memory and accelerate compute for models that exceed a single GPU's VRAM",
            "Running two different models on two GPUs",
            "Running CPU code on GPUs",
            "Training models on separate continents"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-254",
          type: "MCQ",
          prompt: "What is 'Speculative Decoding' in modern LLM inference acceleration?",
          options: [
            "A small, fast draft model generates candidate tokens speculatively, which are then verified in parallel in a single forward pass by the large target model, boosting generation speed",
            "Guessing future stock market trends using neural networks",
            "Running inference without loading model weights",
            "Allowing users to guess the next word"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-255",
          type: "MCQ",
          prompt: "What is the purpose of the '--gpu-memory-utilization 0.90' flag in vLLM configuration?",
          options: [
            "It allocates 90% of total GPU VRAM to the model weights and dynamic KV-cache block pool, reserving 10% for temporary CUDA activation buffers",
            "It limits the GPU clock speed to 90%",
            "It turns off 10% of the GPU cooling fans",
            "It cuts cloud compute invoices by 10%"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-256",
          type: "MCQ",
          prompt: "What is TGI (Text Generation Inference)?",
          options: [
            "HuggingFace's open-source, purpose-built Rust/Python serving framework for deploying large language models with dynamic batching and FlashAttention",
            "A fast-food restaurant chain",
            "A file compression utility",
            "A database management system"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-257",
          type: "MCQ",
          prompt: "What is FlashAttention (Dao et al.)?",
          options: [
            "An exact IO-aware attention algorithm that optimizes GPU SRAM and HBM memory reads/writes, computing attention with linear rather than quadratic memory complexity",
            "A web browser plugin for playing Flash animations",
            "A high-speed camera sensor",
            "A technique for flashing GPU BIOS firmware"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-258",
          type: "MCQ",
          prompt: "What is 'Prefix Caching' (Prompt Caching) in vLLM?",
          options: [
            "Reusing pre-computed KV-cache blocks for shared prompt prefixes (such as long system prompts or few-shot examples) across different user sessions, eliminating redundant prefill latency",
            "Caching DNS domain names",
            "Storing user passwords in browser cookies",
            "Saving images to local hard drives"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-259",
          type: "MCQ",
          prompt: "What communication protocol does vLLM support out of the box to allow drop-in replacement for OpenAI API calls?",
          options: ["OpenAI-compatible HTTP REST API endpoints (/v1/chat/completions)", "FTP file transfer", "SMTP email protocol", "Telnet terminal connection"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-260",
          type: "MCQ",
          prompt: "What occurs if an incoming request exceeds the configured '--max-model-len' in vLLM?",
          options: [
            "vLLM returns an HTTP 400 bad request error indicating the token sequence length exceeds maximum context capacity",
            "The server hardware catches fire",
            "The model generates random numbers",
            "The cluster shuts down"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-MLO-027",
      courseId: "CRS-MLO-001",
      chapterId: "CH-MLO-027",
      title: "PEFT & LoRA / QLoRA Pipelines Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-MLO-261",
          type: "MCQ",
          prompt: "What is the core mathematical mechanism behind Low-Rank Adaptation (LoRA)?",
          options: [
            "Freezing the pre-trained weight matrix W0 and representing parameter updates as the low-rank matrix product B * A, training fewer than 0.2% of total parameters",
            "Dividing all model weights by 2",
            "Deleting odd-numbered layers from the neural network",
            "Converting all weights into random integers"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-262",
          type: "MCQ",
          prompt: "What does the rank parameter 'r' (e.g., r=8 or r=16) represent in a LoRA configuration?",
          options: [
            "The inner dimension of the low-rank adapter matrices, controlling the capacity and parameter count of the trainable update",
            "The number of GPUs used for training",
            "The learning rate of the optimizer",
            "The number of epochs to train"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-263",
          type: "MCQ",
          prompt: "What is QLoRA (Quantized Low-Rank Adaptation)?",
          options: [
            "Quantizing the frozen base foundation model into 4-bit NormalFloat (NF4) while backpropagating gradients through 16-bit LoRA adapter weights, enabling fine-tuning on a single commodity GPU",
            "A quantum computing algorithm for language models",
            "A tool for creating animated GIFs",
            "A technique that eliminates the need for training data"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-264",
          type: "MCQ",
          prompt: "What is '4-bit NormalFloat' (NF4) data type in QLoRA?",
          options: [
            "An information-theoretically optimal quantile quantization data type designed specifically for normally distributed zero-mean neural network weights",
            "A 4-bit integer format used in 1980s video game consoles",
            "A file compression format for text documents",
            "A network packet structure"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-265",
          type: "MCQ",
          prompt: "What does 'model.merge_and_unload()' do when preparing a LoRA fine-tuned model for production serving?",
          options: [
            "It computes W = W0 + (alpha/r) * (B * A) and permanently integrates the adapter weights into the base model tensors, eliminating all extra serving latency",
            "It deletes the base model weights to save disk space",
            "It uploads the model to public HuggingFace hub",
            "It converts Python code into C++"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-266",
          type: "MCQ",
          prompt: "What are 'Paged Optimizers' in the bitsandbytes library?",
          options: [
            "A feature utilizing CUDA unified memory to page optimizer states automatically between GPU VRAM and CPU RAM during gradient surges, preventing out-of-memory crashes",
            "An algorithm that optimizes HTML web pages",
            "A tool that splits books into chapters",
            "A database query indexing method"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-267",
          type: "MCQ",
          prompt: "What HuggingFace library provides higher-level abstractions like SFTTrainer (Supervised Fine-Tuning) and DPO (Direct Preference Optimization)?",
          options: ["TRL (Transformer Reinforcement Learning)", "Scikit-learn", "NumPy", "OpenCV"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-268",
          type: "MCQ",
          prompt: "What target modules in modern Transformer architectures are standardly adapted with LoRA (e.g., target_modules in PEFT)?",
          options: [
            "Self-attention projection matrices (q_proj, k_proj, v_proj, o_proj) and MLP projection matrices (gate_proj, up_proj, down_proj)",
            "The final loss function layer only",
            "The input tokenizer lookup table only",
            "The CPU cache registers"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-269",
          type: "MCQ",
          prompt: "What is the typical file size of a saved LoRA adapter checkpoint compared to a full 70B parameter model?",
          options: [
            "A few tens of megabytes (e.g., 50-200 MB) versus 140+ gigabytes for the full base model",
            "They are identical in file size",
            "LoRA adapters are 10 times larger than the base model",
            "LoRA checkpoints are exactly 1 kilobyte"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-270",
          type: "MCQ",
          prompt: "How can multi-tenant serving platforms serve 100 specialized fine-tuned models cheaply using LoRA?",
          options: [
            "By hosting a single shared copy of the base foundation model in GPU memory and dynamically swapping lightweight LoRA adapter matrices per incoming request",
            "By purchasing 100 dedicated GPU server clusters",
            "By merging all 100 models into a single 1000B parameter model",
            "Multi-tenant serving with LoRA is impossible"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-MLO-028",
      courseId: "CRS-MLO-001",
      chapterId: "CH-MLO-028",
      title: "Enterprise RAG & Vector Database Operations Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-MLO-271",
          type: "MCQ",
          prompt: "What is the role of an Approximate Nearest Neighbor (ANN) index (such as HNSW) in vector databases?",
          options: [
            "Searching high-dimensional vector spaces in logarithmic time ($O(\\log N)$) rather than performing computationally prohibitive exhaustive linear scans ($O(N)$)",
            "Calculating exact square roots of numbers",
            "Compressing images into PNG format",
            "Sorting database tables alphabetically"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-272",
          type: "MCQ",
          prompt: "What is 'Hierarchical Navigable Small World' (HNSW)?",
          options: [
            "A graph-based vector indexing algorithm that constructs multi-layer proximity graphs for ultra-fast, high-recall approximate nearest neighbor search",
            "A small town in Switzerland",
            "A web browser plugin for social media",
            "A local area network protocol"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-273",
          type: "MCQ",
          prompt: "What is Hybrid Search in enterprise RAG systems?",
          options: [
            "Combining Dense Semantic Vector Search (embeddings) with Sparse Keyword Search (BM25) using Reciprocal Rank Fusion (RRF) to capture both conceptual intent and exact keywords",
            "Searching on both Google and Bing simultaneously",
            "Searching across both hard drives and USB drives",
            "Searching with both English and Spanish queries"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-274",
          type: "MCQ",
          prompt: "Why is a Cross-Encoder Reranker placed after initial vector retrieval in production RAG pipelines?",
          options: [
            "Initial vector search retrieves candidate chunks quickly but coarsely; the Cross-Encoder performs deep full-attention scoring between query and chunks to filter out false positives",
            "To encrypt retrieved text chunks with RSA",
            "To translate text into Spanish",
            "To correct spelling errors in user queries"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-275",
          type: "MCQ",
          prompt: "What is 'Semantic Chunking' in document ingestion?",
          options: [
            "Splitting documents based on natural semantic boundaries (headings, sections, paragraphs, sentence breaks) rather than fixed, arbitrary character counts",
            "Splitting files into 1 megabyte zip files",
            "Cutting paper documents with scissors",
            "Deleting random sentences from articles"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-276",
          type: "MCQ",
          prompt: "Why is 'Chunk Overlap' (e.g., 50 tokens) applied during document chunking?",
          options: [
            "To prevent vital semantic context and entity relationships from being severed at the arbitrary boundary cut between adjacent chunks",
            "To duplicate data and fill up disk storage",
            "To confuse the search algorithm",
            "Because vector databases require duplicate data"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-277",
          type: "MCQ",
          prompt: "Which open-source vector database is written in Rust and provides high-performance vector search with rich payload filtering out of the box?",
          options: ["Qdrant", "Redis classic", "SQLite", "MongoDB legacy"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-278",
          type: "MCQ",
          prompt: "What is 'Cosine Similarity' between two normalized embedding vectors u and v?",
          options: [
            "The cosine of the angle between them, calculated as the dot product $u \\cdot v$, measuring directional semantic similarity on a scale from -1 to 1",
            "The physical distance in millimeters between two servers",
            "The difference in file sizes",
            "The time delay between two network packets"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-279",
          type: "MCQ",
          prompt: "What is 'Metadata Filtering' in vector databases?",
          options: [
            "Constraining vector search results by structured metadata attributes (e.g., 'department = finance AND access_tier >= 2') before or during ANN search",
            "Removing author names from documents",
            "Filtering out spam emails",
            "Deleting metadata tags from JPEG images"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-280",
          type: "MCQ",
          prompt: "What vector database extension turns standard PostgreSQL into a high-performance vector database?",
          options: ["pgvector", "pg_stat_statements", "postgis", "pg_crypto"],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-MLO-029",
      courseId: "CRS-MLO-001",
      chapterId: "CH-MLO-029",
      title: "LLM Evaluation, Guardrails & Observability Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-MLO-281",
          type: "MCQ",
          prompt: "What are the three pillars of the RAG Triad evaluation framework (TruLens)?",
          options: [
            "Context Relevance, Groundedness (Faithfulness), and Answer Relevance",
            "Latency, Throughput, and Error Rate",
            "Precision, Recall, and F1-Score",
            "CPU, RAM, and Disk"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-282",
          type: "MCQ",
          prompt: "What does the 'Groundedness' metric evaluate in a generative RAG pipeline?",
          options: [
            "Whether every factual assertion in the generated response is strictly supported by the retrieved context chunks (detecting hallucinations)",
            "Whether the server is physically grounded to the electrical earth",
            "Whether the prompt contains correct grammar",
            "Whether the user is an adult"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-283",
          type: "MCQ",
          prompt: "What is a 'Prompt Injection' attack against an LLM application?",
          options: [
            "A malicious user crafting adversarial input designed to override the system instructions and force the model to execute unauthorized actions or leak secrets",
            "Injecting SQL syntax errors into a relational database",
            "Injecting CSS styles into a web browser",
            "Typing too fast on a keyboard"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-284",
          type: "MCQ",
          prompt: "What open-source framework developed by NVIDIA provides programmatic programmable guardrails (Colang) for conversational LLMs?",
          options: ["NeMo Guardrails", "CUDA Toolkit", "TensorRT-LLM", "DCGM Exporter"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-285",
          type: "MCQ",
          prompt: "What is 'Jailbreaking' in foundation model security?",
          options: [
            "Bypassing a model's safety, ethical, and content moderation alignments through sophisticated adversarial framing (e.g., roleplay, hypothetical scenarios)",
            "Installing unauthorized software on an iPhone",
            "Escaping from a physical prison",
            "Overclocking the GPU processor"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-286",
          type: "MCQ",
          prompt: "What is LangSmith / Langfuse in LLMOps observability?",
          options: [
            "A specialized tracing and debugging platform that logs nested LLM execution chains, agent tool calls, latency breakdowns, and token costs",
            "A programming language compiler",
            "A dictionary of English words",
            "A tool for creating animated 3D characters"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-287",
          type: "MCQ",
          prompt: "What does an Input Guardrail check BEFORE forwarding user input to a foundation model?",
          options: [
            "It scans for prompt injections, malicious intent, jailbreaks, toxic speech, and Personally Identifiable Information (PII)",
            "It checks the user's credit card balance",
            "It measures the user's typing speed",
            "It verifies the user's internet connection"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-288",
          type: "MCQ",
          prompt: "What does an Output Guardrail check AFTER the foundation model produces text but BEFORE returning it to the user?",
          options: [
            "It verifies response groundedness, scans for hallucinated facts, checks for toxic content, and redacts leaked API keys or private data",
            "It checks whether the response is written in comic sans font",
            "It formats text as HTML tables",
            "It counts the number of vowel letters"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-289",
          type: "MCQ",
          prompt: "What is 'Self-Consistency' prompting in LLM reasoning evaluation?",
          options: [
            "Sampling multiple generation paths at high temperature and selecting the majority consensus answer, improving mathematical and logical reasoning accuracy",
            "Ensuring a model never updates its weights",
            "Checking if code compiles without warnings",
            "Enforcing identical response lengths"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-290",
          type: "MCQ",
          prompt: "Why are classical NLP metrics like BLEU and ROUGE often inadequate for evaluating generative LLM applications?",
          options: [
            "They rely on rigid n-gram surface text overlap, penalizing semantically accurate responses that happen to use different phrasing or synonyms",
            "They cannot run on Linux servers",
            "They only work with numbers, not words",
            "They consume 100 gigabytes of memory"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-MLO-030",
      courseId: "CRS-MLO-001",
      chapterId: "CH-MLO-030",
      title: "Enterprise MLOps Capstone & Technical Interviews Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 30,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-MLO-291",
          type: "MCQ",
          prompt: "In architecting the Cortex AI Financial Platform, how do you handle sub-10ms latency requirements for real-time fraud scoring?",
          options: [
            "Deploy compiled TensorRT/ONNX models on NVIDIA Triton with dynamic micro-batching and low-latency feature pre-fetching from Feast Online Store (Redis)",
            "Run uncompiled Python scripts on standard CPU instances",
            "Query a remote LLM API across the public internet",
            "Save requests to a CSV file and evaluate nightly"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-292",
          type: "MCQ",
          prompt: "How is GPU memory estimated for serving a 70-billion parameter model (e.g., Llama-3-70B) in 16-bit precision?",
          options: [
            "At 2 bytes per parameter, base weights require 140 GB; adding KV-cache buffer and activation overhead requires at least 2 x 80GB GPUs (160 GB total)",
            "70 GB of memory",
            "16 GB of memory",
            "1000 GB of memory"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-293",
          type: "MCQ",
          prompt: "In a Staff MLOps Engineer system design interview, what is the best strategy when asked how to handle sudden concept drift in production?",
          options: [
            "Propose automated statistical drift alerts (PSI/KS-test via Evidently), followed by automatic traffic shifting to a conservative heuristic baseline or fallback model while triggering a Kubeflow retraining DAG",
            "Immediately shut down the entire company website",
            "Claim that concept drift never happens in good systems",
            "Delete the drift monitoring tool"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-294",
          type: "MCQ",
          prompt: "How does the Cortex AI platform prevent Training-Serving Skew between offline feature engineering and online inference?",
          options: [
            "By utilizing Feast as a single centralized feature store where feature definitions are written once in Python and shared across offline Parquet and online Redis stores",
            "By writing SQL queries manually in both places",
            "By training models only once every 5 years",
            "By using Excel spreadsheets for production inference"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-295",
          type: "MCQ",
          prompt: "What FinOps strategy minimizes cloud GPU expenses when running continuous distributed retraining jobs on Kubernetes?",
          options: [
            "Scheduling fault-tolerant Ray Train/Kubeflow jobs on cloud Spot/Preemptible instances with automated S3 checkpointing and exponential backoff retries",
            "Purchasing 50 dedicated bare-metal servers with 3-year upfront cash commitments",
            "Running training jobs on developer laptops",
            "Never retraining models"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-296",
          type: "MCQ",
          prompt: "How does Cortex AI enforce regulatory compliance with the European Union AI Act for High-Risk financial algorithms?",
          options: [
            "By maintaining automated Model Cards, cryptographic lineage attestation (Cosign), SHAP explainability APIs, and human-in-the-loop review gates",
            "By paying fines in advance",
            "By moving company headquarters outside of Europe",
            "By making all algorithm code proprietary and hidden"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-297",
          type: "MCQ",
          prompt: "What is an Internal ML Platform (Platform-as-a-Product) in high-maturity engineering organizations?",
          options: [
            "A self-service platform providing Golden Path templates, managed feature stores, automated CT/CD pipelines, and standardized serving runtimes for data scientists",
            "A software store for purchasing smartphone apps",
            "A private gaming forum for data scientists",
            "A mandatory daily meeting"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-298",
          type: "MCQ",
          prompt: "In architecting a multi-tenant enterprise LLM assistant, how do you prevent cross-department data leakage in RAG retrieval?",
          options: [
            "Enforcing metadata filtering on vector database queries using verified JWT identity claims (e.g., 'department = user.dept AND security_clearance >= doc.classification')",
            "Creating separate physical server racks for every employee",
            "Relying on the LLM to remember not to share secrets",
            "Asking users to promise not to ask sensitive questions"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-299",
          type: "MCQ",
          prompt: "What demonstrates senior-level architectural maturity during a Platform Engineering technical interview?",
          options: [
            "Articulating trade-offs, quantitative SLA/SLO budgets, failure modes, cost economics, and recovery plans rather than claiming any single tool is a universal silver bullet",
            "Claiming that the system will never experience an outage",
            "Memorizing every single CLI command in Kubeflow",
            "Refusing to discuss security or cost"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-300",
          type: "MCQ",
          prompt: "What is the ultimate north-star metric of an elite MLOps engineering organization?",
          options: [
            "Lead Time from Model Hypothesis to Production (reducing model deployment and iteration velocity from months to hours with zero unmonitored production regressions)",
            "The total number of GPUs owned",
            "The number of lines of Python code written per day",
            "The complexity of the system architecture diagram"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
  ],
};

