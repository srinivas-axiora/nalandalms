// Phase 4: Modern Large Language Models & GenAI (Chapters 20 to 26) - AI / Machine Learning
// World-class curriculum: Zero to employable master.

export const phase4 = {
  chapters: [
    // ── Chapter 20 ──
    {
      id: "CH-AIML-020",
      courseId: "CRS-AIML-001",
      sequence: 20,
      title: "Encoder vs Decoder Models: BERT vs GPT Architecture Paradigms",
      description: "Bidirectional contextual representation in BERT, autoregressive generation in GPT, Encoder-Decoder architectures (T5, BART), and task taxonomy alignment.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 28,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 4: LLMs & GenAI • Chapter 20</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Encoder vs Decoder Models: BERT vs GPT Architecture Paradigms</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">The Transformer architecture spawned three divergent paradigms: Autoencoding Encoder-only (BERT), Autoregressive Decoder-only (GPT), and Sequence-to-Sequence Encoder-Decoder (T5). Selecting the right paradigm is foundational for cost-effective AI engineering.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/FKlPCeyrF5w" title="BERT vs GPT Comparison" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The 3 Architectural Paradigms</h2>
  <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
    <thead>
      <tr style="background:#f1f5f9;text-align:left;">
        <th style="padding:12px;border:1px solid #cbd5e1;">Paradigm</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Representative Models</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Attention Type</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Primary Production Tasks</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Encoder-Only</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">BERT, RoBERTa, DeBERTa</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Bidirectional (Full sequence visibility)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Classification, Named Entity Recognition (NER), Semantic Search embeddings</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Decoder-Only</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">GPT-4, Llama 3, Mistral, Claude</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Causal / Autoregressive (Left-to-right only)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Generative text, code completion, reasoning agents, chat</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Encoder-Decoder</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">T5, BART, Whisper (Audio)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Bidirectional encoder + Causal decoder</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Summarization, cross-lingual translation, speech-to-text</td>
      </tr>
    </tbody>
  </table>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>BERT sees future and past context simultaneously, making it optimal for extracting rich static sentence embeddings.</li>
      <li>Decoder-only models dominate generative AI because next-token prediction aligns naturally with zero-shot in-context learning.</li>
      <li>Do not use expensive generative LLMs for simple classification or sentiment tasks; a fine-tuned RoBERTa model is 50x faster and 100x cheaper.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 21 ──
    {
      id: "CH-AIML-021",
      courseId: "CRS-AIML-001",
      sequence: 21,
      title: "Hugging Face Ecosystem: Transformers, Datasets & Pipelines",
      description: "AutoModel, AutoTokenizer, task pipelines, Hugging Face Hub versioning, dataset streaming (Arrow format), and distributed multi-GPU training with Accelerate.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 4: LLMs & GenAI • Chapter 21</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Hugging Face Ecosystem: Transformers & Pipelines</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Hugging Face is the central platform of modern machine learning. By abstracting model architectures behind clean <code>AutoModelForCausalLM</code> interfaces, developers can instantiate, evaluate, and fine-tune open-weights models in minutes.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/QEaBAZQCtwE" title="Hugging Face Transformers Tutorial" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Idiomatic Hugging Face Causal Generation</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

model_id = "meta-llama/Meta-Llama-3-8B-Instruct"

# Instantiate fast Rust-based tokenizer and FP16 model
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype=torch.bfloat16,
    device_map="auto" # Distributes layers across available GPUs automatically
)

messages = [
    {"role": "system", "content": "You are an enterprise AI architect."},
    {"role": "user", "content": "Explain LoRA in three bullet points."}
]

# Apply chat template formatting specific to Llama 3
prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
inputs = tokenizer(prompt, return_tensors="pt").to("cuda")

# Generate response with repetition penalty and temperature sampling
outputs = model.generate(
    **inputs,
    max_new_tokens=150,
    temperature=0.7,
    top_p=0.9,
    do_sample=True
)
print(tokenizer.decode(outputs[0][inputs.input_ids.shape[1]:], skip_special_tokens=True))</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li><code>device_map="auto"</code> leverages Hugging Face Accelerate to automatically balance model layers across heterogeneous GPU VRAM and system RAM.</li>
      <li>Always utilize <code>tokenizer.apply_chat_template()</code> to match the exact system/user tokens used during instruction tuning.</li>
      <li>Use Hugging Face <code>Trainer</code> with <code>TrainingArguments</code> for multi-GPU Distributed Data Parallel (DDP) fine-tuning.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 22 ──
    {
      id: "CH-AIML-022",
      courseId: "CRS-AIML-001",
      sequence: 22,
      title: "Pretraining vs Fine-Tuning: Causal & Masked Language Modeling",
      description: "Self-supervised pretraining objectives, Chinchilla compute-optimal scaling laws, masked language modeling (MLM), autoregressive cross-entropy, and instruction tuning (SFT).",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 28,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 4: LLMs & GenAI • Chapter 22</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Pretraining vs Fine-Tuning: Causal & Masked Language Modeling</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">The two-stage paradigm—unsupervised pretraining on trillions of tokens followed by supervised instruction tuning—forms the foundation of generative AI. We examine the mathematical objectives governing pretraining and compute-optimal scaling.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/zjkBMFhNj_g" title="Intro to Large Language Models Andrej Karpathy" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The Chinchilla Scaling Laws (Hoffmann et al., 2022)</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">Kaplan et al. initially suggested scaling model parameters faster than dataset size. DeepMind's Chinchilla study proved that for compute-optimal pretraining, <strong>model parameters and training tokens should be scaled in equal proportion</strong>: for every doubling of parameters, token count must also double. A compute-optimal 7B model requires at least 140 billion tokens; modern models (Llama 3 8B) are deliberately trained on 15 trillion tokens (overtrained) to minimize downstream inference latency.</p>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Causal Language Modeling minimizes negative log-likelihood: $$\\mathcal{L} = -\\sum_{t=1}^T \\log P(w_t \\mid w_1, \\dots, w_{t-1})$$.</li>
      <li>Supervised Fine-Tuning (SFT) transforms a raw document completion engine into an interactive conversational assistant.</li>
      <li>Data quality, deduplication, and synthetic data filtering have a substantially higher impact on final reasoning ability than minor architectural tweaks.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 23 ──
    {
      id: "CH-AIML-023",
      courseId: "CRS-AIML-001",
      sequence: 23,
      title: "Parameter-Efficient Fine-Tuning (PEFT): LoRA & QLoRA",
      description: "Low-Rank Adaptation (LoRA) intrinsic rank hypothesis, forward pass W = W_0 + BA, rank r and alpha scaling, QLoRA 4-bit NormalFloat (NF4), and double quantization.",
      contentType: "Rich Text",
      durationMinutes: 60,
      minimumTimeMinutes: 30,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 4: LLMs & GenAI • Chapter 23</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Parameter-Efficient Fine-Tuning (PEFT): LoRA & QLoRA</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Full parameter fine-tuning of a 70B parameter model requires 16-bit master weights, 16-bit gradients, and 32-bit optimizer states (Adam), consuming over 1.2 Terabytes of GPU VRAM. <strong>Low-Rank Adaptation (LoRA)</strong> freezes pretrained weights and injects trainable low-rank decomposition matrices, reducing trainable parameters by 99% while preserving performance.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/t509sv5MT0w" title="LoRA and QLoRA Explained" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Mathematical Mechanics of LoRA</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">For a frozen weight matrix \\(\\mathbf{W}_0 \\in \\mathbb{R}^{d \\times k}\\), LoRA decomposes parameter updates \\(\\Delta \\mathbf{W}\\) into low-rank matrices \\(\\mathbf{B} \\in \\mathbb{R}^{d \\times r}\\) and \\(\\mathbf{A} \\in \\mathbb{R}^{r \\times k}\\), where rank \\(r \\ll \\min(d, k)\\):</p>
  <div style="background:#f8fafc;border-left:4px solid #6366f1;padding:16px;margin:20px 0;font-size:16px;font-weight:600;color:#1e293b;">
    $$\\mathbf{h} = \\mathbf{W}_0 \\mathbf{x} + \\Delta \\mathbf{W} \\mathbf{x} = \\mathbf{W}_0 \\mathbf{x} + \\frac{\\alpha}{r} \\mathbf{B} \\mathbf{A} \\mathbf{x}$$
  </div>
  <p style="font-size:14px;color:#475569;">\\(\\mathbf{A}\\) is initialized with Gaussian noise \\(\\mathcal{N}(0, \\sigma^2)\\) and \\(\\mathbf{B}\\) is initialized to zero, ensuring \\(\\Delta \\mathbf{W} = 0\\) at the start of training. After training, \\(\\mathbf{B}\\mathbf{A}\\) can be folded directly into \\(\\mathbf{W}_0\\) for zero-latency inference!</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. QLoRA in Hugging Face PEFT</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>from peft import LoraConfig, get_peft_model, TaskType
from transformers import BitsAndBytesConfig

# 4-bit NormalFloat (NF4) quantization config
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True
)

peft_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"]
)
model = get_peft_model(base_model, peft_config)
model.print_trainable_parameters()
# Output: trainable params: 20M || all params: 8B || trainable%: 0.25%</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>LoRA reduces VRAM requirements by over 75% by eliminating optimizer states for frozen weights.</li>
      <li><strong>QLoRA</strong> quantizes the frozen base model to 4-bit NormalFloat (NF4) while maintaining 16-bit LoRA adapter gradients, enabling fine-tuning a 70B model on two consumer 24GB GPUs.</li>
      <li>At deployment, LoRA weights can be dynamically hot-swapped per enterprise client without reloading the multi-gigabyte base model.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 24 ──
    {
      id: "CH-AIML-024",
      courseId: "CRS-AIML-001",
      sequence: 24,
      title: "Model Quantization Mechanics: FP16, INT8, INT4 (BitsAndBytes, GPTQ, AWQ)",
      description: "Floating point formats (IEEE FP32 vs BF16 vs FP16), Post-Training Quantization (PTQ) vs Quantization-Aware Training (QAT), Zero-point and scale factor equations, GPTQ second-order Hessian inversion, and Activation-aware Weight Quantization (AWQ).",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 28,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 4: LLMs & GenAI • Chapter 24</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Model Quantization Mechanics: FP16, INT8 & INT4 (GPTQ, AWQ)</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Serving Large Language Models is predominantly memory-bandwidth bound. To generate tokens in real time, billions of parameters must be read from GPU High-Bandwidth Memory (HBM) into cache every single forward pass. Quantizing weights from 16-bit to 4-bit cuts memory footprint by 75% and quadruples generation throughput.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/5T-3mgk17Ac" title="Quantization Explained (AWQ, GPTQ)" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Linear Symmetric Quantization Equations</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">Mapping continuous floating-point weights \\(x\\) to signed \\(b\\)-bit integers \\(q \\in [-2^{b-1}, 2^{b-1}-1]\\) is governed by a scale factor \\(s\\):</p>
  <div style="background:#f8fafc;border-left:4px solid #6366f1;padding:16px;margin:20px 0;font-size:16px;font-weight:600;color:#1e293b;">
    $$s = \\frac{\\max(|x|)}{2^{b-1} - 1}, \\quad q = \\text{clip}\\left( \\left\\lfloor \\frac{x}{s} \\right\\rceil, -2^{b-1}, 2^{b-1}-1 \\right), \\quad \\hat{x} = q \\cdot s$$
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Modern 4-Bit Quantization: GPTQ vs AWQ</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:20px 0;">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#0284c7;margin-top:0;">GPTQ (Exact Second-Order)</h3>
      <p style="font-size:14px;color:#475569;">Quantizes one column of weights at a time while updating remaining unquantized weights using inverse Hessian approximations. Fast one-shot offline quantization; slightly sensitive to activation outliers.</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#6366f1;margin-top:0;">AWQ (Activation-aware)</h3>
      <p style="font-size:14px;color:#475569;">Recognizes that not all weights are equal: 1% of salient weights corresponding to large input activations protect perplexity. AWQ protects salient channels by scaling them prior to integer rounding, yielding higher accuracy.</p>
    </div>
  </div>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li><strong>BF16 (Bfloat16)</strong> maintains the identical 8-bit dynamic exponent range as FP32, eliminating gradient underflow without loss scaling.</li>
      <li>4-bit quantized models (AWQ/GPTQ) run with almost zero degradation in benchmark MMLU scores compared to FP16 baselines.</li>
      <li>Inference engines like vLLM and TensorRT-LLM use AWQ to maximize tokens-per-second per GPU.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 25 ──
    {
      id: "CH-AIML-025",
      courseId: "CRS-AIML-001",
      sequence: 25,
      title: "Prompt Engineering, In-Context Learning & Few-Shot Reasoning",
      description: "In-context learning mechanics, Chain-of-Thought (CoT), Tree-of-Thoughts (ToT), Self-Consistency decoding, ReAct (Reason + Act) prompting, and prompt injection vulnerabilities.",
      contentType: "Rich Text",
      durationMinutes: 45,
      minimumTimeMinutes: 20,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 4: LLMs & GenAI • Chapter 25</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Prompt Engineering, In-Context Learning & Few-Shot Reasoning</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Large Language Models exhibit emergent capabilities: without modifying model weights, providing structured exemplars in the context window alters activation dynamics to perform complex multi-step reasoning. We study the engineering patterns that separate fragile prompts from production reliability.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/_7UoucsH2tI" title="Prompt Engineering Techniques" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Advanced Reasoning Patterns</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px;margin:20px 0;">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#0284c7;margin-top:0;">Chain-of-Thought (CoT)</h3>
      <p style="font-size:14px;color:#475569;">Instructing the model to "think step by step" forces it to generate intermediate reasoning tokens, allocating more computation (floating point FLOPs) before committing to a final answer.</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#6366f1;margin-top:0;">Self-Consistency Majority Vote</h3>
      <p style="font-size:14px;color:#475569;">Samples multiple independent reasoning paths at temperature \\(T=0.7\\) and takes the majority consensus answer, eliminating stochastic hallucinations on math and logic benchmarks.</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#10b981;margin-top:0;">ReAct (Reason + Act)</h3>
      <p style="font-size:14px;color:#475569;">Interleaves Thought generation, Tool Action execution (e.g. SQL query or search), and Observation parsing, forming the backbone of autonomous AI agents.</p>
    </div>
  </div>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Few-shot exemplars provide implicit task formatting and tone calibration far more reliably than verbose prose instructions.</li>
      <li>Enforce structured JSON output schemas using constrained decoding engines (e.g. Outlines, Guidance, Instructor).</li>
      <li>Defend against prompt injection using XML delimiters (e.g. <code>&lt;user_input&gt;</code>) and secondary input evaluation guardrails.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 26 ──
    {
      id: "CH-AIML-026",
      courseId: "CRS-AIML-001",
      sequence: 26,
      title: "Model Alignment & Safety: RLHF, DPO & Constitutional AI",
      description: "The alignment problem, Bradley-Terry preference modeling, PPO reinforcement learning with reward models, Direct Preference Optimization (DPO), and Anthropic Constitutional AI.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 28,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 4: LLMs & GenAI • Chapter 26</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Model Alignment & Safety: RLHF, DPO & Constitutional AI</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Raw pre-trained base models hallucinate toxicity, provide dangerous instructions, and fail to follow user intent. Alignment steers models to become Helpful, Honest, and Harmless (HHH). We analyze classical RLHF with PPO and modern Direct Preference Optimization (DPO).</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/2MBJOuVq380" title="RLHF and DPO Alignment Explained" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. RLHF with PPO vs Direct Preference Optimization (DPO)</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:20px 0;">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#0284c7;margin-top:0;">Classical RLHF (PPO Pipeline)</h3>
      <p style="font-size:14px;color:#475569;">1. Train Reward Model on human pairwise preferences (winner \\(y_w\\) vs loser \\(y_l\\)).<br>2. Optimize policy \\(\\pi_\\theta\\) using Proximal Policy Optimization (PPO) against reward model, penalizing KL-divergence from reference model \\(\\pi_{ref}\\).<br><strong>Drawbacks:</strong> Complex orchestration of 4 separate LLMs in memory simultaneously; notoriously unstable training.</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#6366f1;margin-top:0;">Direct Preference Optimization (DPO)</h3>
      <p style="font-size:14px;color:#475569;">Rafailov et al. (Stanford, 2023) proved mathematically that the optimal policy under the Bradley-Terry model can be extracted directly without training a reward model or using RL:<br>$$\\mathcal{L}_{DPO} = -\\mathbb{E} \\left[ \\log \\sigma \\left( \\beta \\log \\frac{\\pi_\\theta(y_w \\mid x)}{\\pi_{ref}(y_w \\mid x)} - \\beta \\log \\frac{\\pi_\\theta(y_l \\mid x)}{\\pi_{ref}(y_l \\mid x)} \\right) \\right]$$<br><strong>Benefits:</strong> Stable standard cross-entropy loss, half the VRAM footprint.</p>
    </div>
  </div>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>DPO eliminates the need for unstable reinforcement learning by formulating alignment directly as classification loss over paired preferred/rejected completions.</li>
      <li>The KL divergence penalty \\(\\beta\\) prevents the aligned policy from drifting too far from the base model, protecting linguistic fluency.</li>
      <li><strong>Constitutional AI</strong> uses an AI model guided by a written set of ethical rules (constitution) to self-critique and revise completions without human labelers.</li>
    </ul>
  </div>
</div>`
    }
  ],

  assessments: [
    {
      id: "ASM-AIML-020",
      title: "Encoder vs Decoder Models Assessment",
      chapterId: "CH-AIML-020",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-020-01", type: "MCQ", prompt: "What architectural paradigm does BERT utilize?", options: ["Encoder-only with bidirectional self-attention", "Decoder-only with causal masking", "Encoder-Decoder", "Recurrent ConvNet"], answer: 0, points: 10 },
        { id: "Q-AIML-020-02", type: "MCQ", prompt: "Why are Decoder-only models (e.g. GPT-4, Llama 3) preferred for generative natural language tasks?", options: ["Autoregressive next-token prediction natively matches language generation and exhibits powerful zero-shot in-context learning", "They cannot overfit", "They use no attention heads", "They only accept English"], answer: 0, points: 10 },
        { id: "Q-AIML-020-03", type: "MCQ", prompt: "Why is BERT ineffective for free-form creative text generation?", options: ["BERT was trained with bidirectional attention and cannot generate tokens autoregressively without leaking future context", "BERT has no vocabulary", "BERT only works on sentences under 5 words", "BERT cannot run on GPUs"], answer: 0, points: 10 },
        { id: "Q-AIML-020-04", type: "MCQ", prompt: "What model architecture does Google T5 (Text-to-Text Transfer Transformer) employ?", options: ["Encoder-Decoder architecture", "Decoder-only", "Encoder-only", "Pure convolutional"], answer: 0, points: 10 },
        { id: "Q-AIML-020-05", type: "MCQ", prompt: "For extracting semantic embeddings to perform vector search over 10 million documents, which model family is most cost-effective?", options: ["Encoder-only models (e.g. BGE, E5, RoBERTa)", "70B Decoder-only LLMs", "RNNs", "Diffusion models"], answer: 0, points: 10 },
        { id: "Q-AIML-020-06", type: "MCQ", prompt: "What is the role of the special [CLS] token in BERT?", options: ["Its output embedding serves as an aggregated representation of the entire sequence for classification tasks", "It marks the end of a sentence", "It clears model cache", "It separates two sentences"], answer: 0, points: 10 },
        { id: "Q-AIML-020-07", type: "MCQ", prompt: "What pretraining objective did RoBERTa drop from BERT after proving it did not improve downstream accuracy?", options: ["Next Sentence Prediction (NSP)", "Masked Language Modeling", "Adam optimizer", "Weight decay"], answer: 0, points: 10 },
        { id: "Q-AIML-020-08", type: "MCQ", prompt: "In causal language models, what does 'greedy decoding' do during token generation?", options: ["Selects the token with the single highest probability at each step (argmax)", "Samples randomly with high temperature", "Selects top 5 tokens", "Evaluates all possible sentences"], answer: 0, points: 10 },
        { id: "Q-AIML-020-09", type: "MCQ", prompt: "What parameter controls randomness by dividing logits prior to softmax calculation in autoregressive LLMs?", options: ["Temperature", "Top-k", "Top-p", "Repetition penalty"], answer: 0, points: 10 },
        { id: "Q-AIML-020-10", type: "MCQ", prompt: "What sampling strategy dynamically cuts off candidates whose cumulative probability exceeds threshold p?", options: ["Top-p (Nucleus) Sampling", "Top-k Sampling", "Greedy Search", "Beam Search"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-AIML-021",
      title: "Hugging Face Ecosystem Assessment",
      chapterId: "CH-AIML-021",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-021-01", type: "MCQ", prompt: "What Hugging Face class automatically selects the appropriate model architecture given a model repository identifier?", options: ["AutoModelForCausalLM (or AutoModel)", "ModelLoader", "HFModel", "TorchHub"], answer: 0, points: 10 },
        { id: "Q-AIML-021-02", type: "MCQ", prompt: "What does setting `device_map='auto'` accomplish when loading large models via Transformers?", options: ["Automatically shards and distributes model layers across available GPU VRAM, CPU memory, and disk", "Runs model on mobile phone", "Trains model without code", "Switches from Python to C++"], answer: 0, points: 10 },
        { id: "Q-AIML-021-03", type: "MCQ", prompt: "What method formats raw conversation dictionaries into the exact prompt string expected by instruction-tuned LLMs?", options: ["tokenizer.apply_chat_template()", "tokenizer.format_chat()", "tokenizer.render()", "str(conversation)"], answer: 0, points: 10 },
        { id: "Q-AIML-021-04", type: "MCQ", prompt: "What underlying memory and file format does the Hugging Face `datasets` library use for zero-copy streaming of huge corpora?", options: ["Apache Arrow", "CSV text", "Pickle", "HDF5"], answer: 0, points: 10 },
        { id: "Q-AIML-021-05", type: "MCQ", prompt: "What open-source library from Hugging Face simplifies launching multi-GPU and distributed training without boilerplate?", options: ["Accelerate", "Diffusers", "Gradio", "Hub"], answer: 0, points: 10 },
        { id: "Q-AIML-021-06", type: "MCQ", prompt: "What high-level abstraction in Transformers executes an end-to-end ML task (tokenize, model, decode) in a single line?", options: ["pipeline('text-generation', model='...')", "quickrun()", "Trainer.predict()", "AutoTask()"], answer: 0, points: 10 },
        { id: "Q-AIML-021-07", type: "MCQ", prompt: "What file format is standard on the Hugging Face Hub for safely storing model weights without arbitrary code execution risks?", options: ["Safetensors", "Pickle (.pkl)", "PyTorch (.bin)", "JSON"], answer: 0, points: 10 },
        { id: "Q-AIML-021-08", type: "MCQ", prompt: "What parameter in `model.generate()` penalizes already generated tokens to prevent infinite repetitive loops?", options: ["repetition_penalty", "max_length", "temperature", "no_repeat_ngram_size"], answer: 0, points: 10 },
        { id: "Q-AIML-021-09", type: "MCQ", prompt: "What library allows deploying interactive browser demonstration GUIs for Hugging Face models with simple Python scripts?", options: ["Gradio", "Flask", "Django", "React"], answer: 0, points: 10 },
        { id: "Q-AIML-021-10", type: "MCQ", prompt: "What is `torch_dtype=torch.bfloat16` used for when loading modern foundation models?", options: ["Loading weights in 16-bit Brain Floating Point, cutting VRAM by 50% compared to standard 32-bit float", "Enabling CPU execution", "Quantizing model to 4 bits", "Compressing files on disk"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-AIML-022",
      title: "Pretraining & Scaling Laws Assessment",
      chapterId: "CH-AIML-022",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-022-01", type: "MCQ", prompt: "What primary self-supervised objective is used to pretrain decoder-only Large Language Models?", options: ["Causal Language Modeling (Autoregressive Next-Token Prediction)", "Masked Language Modeling (Fill in blanks)", "Contrastive sentence embedding", "Supervised classification"], answer: 0, points: 10 },
        { id: "Q-AIML-022-02", type: "MCQ", prompt: "What foundational insight did DeepMind's Chinchilla Scaling Law establish regarding compute-optimal LLM training?", options: ["Model parameters and training token volume should be scaled in equal proportion for optimal loss per FLOP", "Parameters should be scaled 10x faster than tokens", "Token quality does not matter", "Compute cannot predict performance"], answer: 0, points: 10 },
        { id: "Q-AIML-022-03", type: "MCQ", prompt: "What percentage of tokens were randomly masked during BERT's Masked Language Modeling (MLM) pretraining?", options: ["15% of total tokens", "50%", "5%", "80%"], answer: 0, points: 10 },
        { id: "Q-AIML-022-04", type: "MCQ", prompt: "Why do modern frontier models (e.g. LLaMA 3) deliberately 'overtrain' models beyond compute-optimal Chinchilla ratios?", options: ["To optimize inference economics: a smaller model trained on massive tokens is faster and cheaper to serve in production", "Because GPUs run out of data", "To increase parameter count", "To bypass copyright laws"], answer: 0, points: 10 },
        { id: "Q-AIML-022-05", type: "MCQ", prompt: "What is 'Supervised Fine-Tuning' (SFT) in the LLM training pipeline?", options: ["Training a pretrained base model on curated instruction-response pairs to teach it conversational assistant behavior", "Pretraining on raw web dumps", "Quantizing to 4 bits", "Pruning zero weights"], answer: 0, points: 10 },
        { id: "Q-AIML-022-06", type: "MCQ", prompt: "What evaluation benchmark tests multi-task language understanding across 57 academic subjects (elementary to professional)?", options: ["MMLU (Massive Multitask Language Understanding)", "GLUE", "ImageNet", "SQuAD"], answer: 0, points: 10 },
        { id: "Q-AIML-022-07", type: "MCQ", prompt: "What loss metric mathematically measures how surprised a language model is by the next token in a test corpus?", options: ["Perplexity (PPL = e^CrossEntropyLoss)", "Accuracy", "F1 score", "Mean Squared Error"], answer: 0, points: 10 },
        { id: "Q-AIML-022-08", type: "MCQ", prompt: "What data quality filter removes near-identical documents from pretraining web scrapes to prevent memorization?", options: ["MinHash LSH deduplication", "BPE tokenization", "Word2Vec", "Cosine loss"], answer: 0, points: 10 },
        { id: "Q-AIML-022-09", type: "MCQ", prompt: "What term describes the phenomenon where capabilities (arithmetic, coding) suddenly appear once models exceed a critical parameter scale?", options: ["Emergent Abilities", "Catastrophic Forgetting", "Underfitting", "Mode Collapse"], answer: 0, points: 10 },
        { id: "Q-AIML-022-10", type: "MCQ", prompt: "What is the typical ratio of human-written data to synthetic model-generated data in frontier LLM post-training?", options: ["Synthetic data increasingly comprises the vast majority (90%+) of reasoning and coding alignment data", "Synthetic data is never used", "Human data must be 100%", "Zero data is required"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-AIML-023",
      title: "PEFT & LoRA Assessment",
      chapterId: "CH-AIML-023",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-023-01", type: "MCQ", prompt: "What mathematical hypothesis motivates Low-Rank Adaptation (LoRA)?", options: ["Weight updates during adaptation have a low 'intrinsic dimension/rank' that can be captured in low-rank matrices B and A", "All weights should be zero", "Neural networks only need 1 layer", "Gradients are always rank 1"], answer: 0, points: 10 },
        { id: "Q-AIML-023-02", type: "MCQ", prompt: "How are the low-rank matrices A and B initialized in LoRA at the beginning of training?", options: ["A is initialized with Gaussian noise and B is initialized to zero, ensuring Delta W is zero initially", "Both are initialized to 1.0", "Both are random uniform", "Both are zero"], answer: 0, points: 10 },
        { id: "Q-AIML-023-03", type: "MCQ", prompt: "What is the primary operational advantage of LoRA at inference deployment time?", options: ["The trained adapter weights Delta W = B * A can be merged directly into the base weights W_0, incurring zero additional inference latency", "It doubles context length", "It eliminates the need for tokenizers", "It compiles to WebAssembly"], answer: 0, points: 10 },
        { id: "Q-AIML-023-04", type: "MCQ", prompt: "What key innovations distinguish QLoRA from standard LoRA?", options: ["4-bit NormalFloat (NF4) base weight quantization, Double Quantization, and Paged Optimizers", "Using 8-bit floats only", "Eliminating attention layers", "Training on CPU"], answer: 0, points: 10 },
        { id: "Q-AIML-023-05", type: "MCQ", prompt: "What parameter in LoRA acts as a scaling constant for the low-rank update (Delta W = alpha / r * B * A)?", options: ["lora_alpha", "r (rank)", "lora_dropout", "target_modules"], answer: 0, points: 10 },
        { id: "Q-AIML-023-06", type: "MCQ", prompt: "What modules in a Transformer are typically targeted for LoRA adaptation to maximize performance?", options: ["All linear projection layers (Attention: q, k, v, o; and MLP: gate, up, down projections)", "Only the embedding layer", "Only the final layer", "Only LayerNorm layers"], answer: 0, points: 10 },
        { id: "Q-AIML-023-07", type: "MCQ", prompt: "What is Double Quantization in QLoRA?", options: ["Quantizing the quantization scale constants themselves from 32-bit floats to 8-bit integers, saving 0.37 bits per parameter", "Quantizing twice in a loop", "Quantizing inputs and outputs", "Compressing text files"], answer: 0, points: 10 },
        { id: "Q-AIML-023-08", type: "MCQ", prompt: "What is Prefix Tuning compared to LoRA?", options: ["Prefix Tuning prepends continuous learnable virtual tokens to attention keys and values; LoRA adapts weight matrices directly", "Prefix Tuning is unsupervised", "Prefix Tuning deletes tokens", "There is no difference"], answer: 0, points: 10 },
        { id: "Q-AIML-023-09", type: "MCQ", prompt: "Approximately what percentage of original parameters are updated during a typical LoRA fine-tuning run?", options: ["0.1% to 1.0% of total parameters", "50%", "90%", "0.00001%"], answer: 0, points: 10 },
        { id: "Q-AIML-023-10", type: "MCQ", prompt: "What hardware capability enables multi-tenant enterprise serving with LoRA?", options: ["Dynamic adapter routing: serving dozens of customized customer LoRA adapters on a single shared frozen base model in VRAM", "Multiple power supplies", "Air-cooled GPUs", "Direct drive SSDs"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-AIML-024",
      title: "Model Quantization Assessment",
      chapterId: "CH-AIML-024",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-024-01", type: "MCQ", prompt: "Why is Large Language Model text generation bounded primarily by memory bandwidth rather than compute FLOPs during inference?", options: ["Every generated token requires streaming the model's multi-gigabyte weights from VRAM into GPU registers (Arithmetic Intensity is low)", "CPUs are too slow", "Softmax cannot run on tensor cores", "Transformers have no matrix multiplications"], answer: 0, points: 10 },
        { id: "Q-AIML-024-02", type: "MCQ", prompt: "What is the primary difference between IEEE FP16 and Google Bfloat16 (BF16)?", options: ["BF16 retains an 8-bit exponent identical to FP32, preventing underflow/overflow without needing dynamic loss scaling", "BF16 has higher precision mantissa", "FP16 requires no GPU support", "BF16 uses 32 bits"], answer: 0, points: 10 },
        { id: "Q-AIML-024-03", type: "MCQ", prompt: "What is Post-Training Quantization (PTQ)?", options: ["Quantizing a model's weights and activations after pretraining is complete, requiring little or no retraining", "Quantizing during the first epoch", "Training from scratch in 4-bit", "Deleting weights below 0.1"], answer: 0, points: 10 },
        { id: "Q-AIML-024-04", type: "MCQ", prompt: "What algorithm quantizes weights column-by-column using second-order inverse Hessian error compensation?", options: ["GPTQ", "BitsAndBytes", "LLM.int8()", "K-Means"], answer: 0, points: 10 },
        { id: "Q-AIML-024-05", type: "MCQ", prompt: "What insight underpins Activation-aware Weight Quantization (AWQ)?", options: ["Protecting the 1% most salient weight channels corresponding to high-magnitude activation features preserves accuracy", "Quantizing everything to 1-bit", "Deleting outlier activations", "Multiplying weights by zero"], answer: 0, points: 10 },
        { id: "Q-AIML-024-06", type: "MCQ", prompt: "What is the memory reduction factor when quantizing a 16-bit model (FP16/BF16) down to 4-bit (INT4)?", options: ["~4x reduction (75% less VRAM)", "2x reduction", "10x reduction", "1.5x reduction"], answer: 0, points: 10 },
        { id: "Q-AIML-024-07", type: "MCQ", prompt: "What library pioneered LLM.int8() mixed-precision decomposition where outlier activations remain in FP16?", options: ["BitsAndBytes (Tim Dettmers et al.)", "PyTorch native only", "TensorFlow Lite", "ONNX Runtime"], answer: 0, points: 10 },
        { id: "Q-AIML-024-08", type: "MCQ", prompt: "What happens to inference perplexity if a model is quantized with AWQ or GPTQ to 4 bits with a calibration dataset?", options: ["Perplexity remains almost identical to unquantized FP16 baselines (often < 0.1 degradation)", "Perplexity doubles", "The model outputs random gibberish", "The model becomes 100% accurate"], answer: 0, points: 10 },
        { id: "Q-AIML-024-09", type: "MCQ", prompt: "What is 'group size' (e.g. group_size=128) in modern 4-bit quantization schemes?", options: ["The number of adjacent weights sharing a single scale and zero-point factor, balancing accuracy and metadata overhead", "The batch size during inference", "The number of attention heads", "The number of GPUs"], answer: 0, points: 10 },
        { id: "Q-AIML-024-10", type: "MCQ", prompt: "What format developed by Georgi Gerganov enables running quantized LLMs on CPU and Apple Silicon via llama.cpp?", options: ["GGUF (formerly GGML)", "Safetensors", "ONNX", "TorchScript"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-AIML-025",
      title: "Prompt Engineering & In-Context Reasoning Assessment",
      chapterId: "CH-AIML-025",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-025-01", type: "MCQ", prompt: "Why does Chain-of-Thought (CoT) prompting significantly improve multi-step reasoning performance?", options: ["It forces the model to generate intermediate tokens, effectively granting it more test-time computational budget before outputting an answer", "It updates the model weights dynamically", "It queries external Google search", "It reduces the prompt length"], answer: 0, points: 10 },
        { id: "Q-AIML-025-02", type: "MCQ", prompt: "What is 'Few-Shot Prompting'?", options: ["Providing 2 to 5 high-quality input-output exemplars within the context window prior to the target query", "Training a model on few images", "Generating only 3 words", "Calling the API twice"], answer: 0, points: 10 },
        { id: "Q-AIML-025-03", type: "MCQ", prompt: "What decoding strategy generates multiple reasoning paths and selects the answer with majority consensus?", options: ["Self-Consistency decoding", "Greedy decoding", "Top-k sampling", "Beam search"], answer: 0, points: 10 },
        { id: "Q-AIML-025-04", type: "MCQ", prompt: "What does the ReAct framework interleave during autonomous agent execution?", options: ["Reasoning traces ('Thoughts') and Action calls with external tool environments", "Reactions and Emotions", "Recurrent and Attention layers", "Read and Write permissions"], answer: 0, points: 10 },
        { id: "Q-AIML-025-05", type: "MCQ", prompt: "What security risk involves an adversarial user embedding instructions that override the model's system prompt?", options: ["Prompt Injection (Jailbreaking)", "Data Drift", "Overfitting", "Gradient Inversion"], answer: 0, points: 10 },
        { id: "Q-AIML-025-06", type: "MCQ", prompt: "What tool allows enforcing valid JSON schema outputs from open-weights LLMs via finite state machine regex masking?", options: ["Outlines (or Guidance / Instructor)", "RegEx standalone", "Pydantic validator after generation", "Postgres"], answer: 0, points: 10 },
        { id: "Q-AIML-025-07", type: "MCQ", prompt: "What is the Tree-of-Thoughts (ToT) prompting paradigm?", options: ["Exploring multiple reasoning branches as a tree with deliberate self-evaluation and backtracking algorithms (BFS / DFS)", "A decision tree algorithm", "Drawing tree diagrams in ASCII", "A file system structure"], answer: 0, points: 10 },
        { id: "Q-AIML-025-08", type: "MCQ", prompt: "What is the 'Lost in the Middle' phenomenon observed in long-context Large Language Models?", options: ["Models retrieve information positioned at the very beginning or end of long context windows much better than in the middle", "Models forget the system prompt", "Tokens in the middle are corrupted", "Models crash after 4k tokens"], answer: 0, points: 10 },
        { id: "Q-AIML-025-09", type: "MCQ", prompt: "How should dynamic untrusted user inputs be isolated inside prompts to defend against indirect prompt injections?", options: ["Wrapping user text in strict structural delimiters like XML tags (<user_query>...</user_query>)", "Converting text to base64", "Removing all punctuation", "Disabling user input"], answer: 0, points: 10 },
        { id: "Q-AIML-025-10", type: "MCQ", prompt: "What is 'System Prompt' (or Developer Message) in conversational LLM APIs?", options: ["High-priority persistent instructions that establish the persona, behavioral boundaries, and operational constraints of the assistant", "The operating system boot script", "The user's first query", "The error log output"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-AIML-026",
      title: "Model Alignment & Safety Assessment",
      chapterId: "CH-AIML-026",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-026-01", type: "MCQ", prompt: "What are the three core criteria of AI alignment known as the 'HHH framework'?", options: ["Helpful, Honest, and Harmless", "High, Hard, and Heavy", "Fast, Cheap, and Accurate", "Human, Holistic, and Heuristic"], answer: 0, points: 10 },
        { id: "Q-AIML-026-02", type: "MCQ", prompt: "What preference model is used in RLHF to compute the probability that completion y_w is preferred over y_l?", options: ["The Bradley-Terry preference model: P(y_w > y_l) = sigmoid(r(x, y_w) - r(x, y_l))", "The Elo rating model", "The Gini index", "Bayes Theorem"], answer: 0, points: 10 },
        { id: "Q-AIML-026-03", type: "MCQ", prompt: "What is the primary operational advantage of Direct Preference Optimization (DPO) over classic RLHF with PPO?", options: ["DPO eliminates the separate reward model and RL policy loop, optimizing alignment directly via implicit reward cross-entropy", "DPO requires no human preferences", "DPO produces 100% truthful models", "DPO only runs on single GPUs"], answer: 0, points: 10 },
        { id: "Q-AIML-026-04", type: "MCQ", prompt: "Why does the RLHF objective include a KL divergence penalty term between the trained policy and frozen reference model?", options: ["To prevent the policy from collapsing, gaming the reward model (reward hacking), or losing linguistic fluency", "To speed up matrix multiplication", "To reduce dataset size", "To increase vocabulary size"], answer: 0, points: 10 },
        { id: "Q-AIML-026-05", type: "MCQ", prompt: "What is 'Reward Hacking' (or Goodhart's Law in AI alignment)?", options: ["The model discovers unintended shortcuts that maximize numerical reward scores without satisfying human intent", "A cyberattack on the reward database", "Deleting the reward function", "Bribing human raters"], answer: 0, points: 10 },
        { id: "Q-AIML-026-06", type: "MCQ", prompt: "What alignment method developed by Anthropic uses an AI model to critique and refine responses against an ethical constitution?", options: ["Constitutional AI (RLAIF: Reinforcement Learning from AI Feedback)", "Supervised Tuning", "Self-Attention", "Backpropagation"], answer: 0, points: 10 },
        { id: "Q-AIML-026-07", type: "MCQ", prompt: "In DPO loss, what does the hyperparameter beta control?", options: ["The strength of the implicit KL divergence constraint against the reference model", "The learning rate", "The batch size", "The number of tokens generated"], answer: 0, points: 10 },
        { id: "Q-AIML-026-08", type: "MCQ", prompt: "What alignment technique aligns models by pairing prompts with positive and negative completions using Odds Ratio Policy Optimization?", options: ["ORPO (Odds Ratio Policy Optimization)", "K-Means", "DBSCAN", "SVD"], answer: 0, points: 10 },
        { id: "Q-AIML-026-09", type: "MCQ", prompt: "What is 'Sycophancy' in conversational AI models?", options: ["The model falsely agreeing with the user's erroneous statements or biases simply to provide pleasing answers", "Model crashing unexpectedly", "Refusing to answer questions", "Repeating user sentences verbatim"], answer: 0, points: 10 },
        { id: "Q-AIML-026-10", type: "MCQ", prompt: "What guardrail open-source library from NVIDIA applies programmable safety rails, topical bounds, and hallucination checks?", options: ["NeMo Guardrails", "TensorRT", "CUDA Toolkit", "PyTorch Live"], answer: 0, points: 10 },
      ]
    }
  ]
};

