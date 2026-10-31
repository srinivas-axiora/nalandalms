// Phase 2: Computer Vision & Convolutional Neural Networks (Chapters 8 to 13) - AI / Machine Learning
// World-class curriculum: Zero to employable master.

export const phase2 = {
  chapters: [
    // ── Chapter 8 ──
    {
      id: "CH-AIML-008",
      courseId: "CRS-AIML-001",
      sequence: 8,
      title: "Convolution Operations, Kernels, Padding & Pooling Mechanics",
      description: "2D spatial convolutions, parameter sharing, translation equivariance, valid vs same padding, stride arithmetic, receptive field calculations, and Max vs Average Pooling.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Computer Vision • Chapter 8</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Convolution Operations, Kernels, Padding & Pooling Mechanics</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Fully connected dense layers fail completely on high-resolution image data. A single 4K RGB image has over 24 million input features; connecting it to a modest 1,000-neuron layer requires 24 billion weights. Convolutional Neural Networks (CNNs) exploit two structural properties of natural images: <strong>local receptive fields</strong> and <strong>translation equivariance</strong>.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/KuXjwB4LzSA" title="Convolutional Neural Networks Explained" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Convolution Spatial Dimension Arithmetic</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">Given an input feature map of height \\(H_{in}\\) and width \\(W_{in}\\), kernel size \\(K\\), padding \\(P\\), and stride \\(S\\), the spatial dimensions of the output feature map are given by:</p>
  <div style="background:#f8fafc;border-left:4px solid #6366f1;padding:16px;margin:20px 0;font-size:16px;font-weight:600;color:#1e293b;">
    $$H_{out} = \\left\\lfloor \\frac{H_{in} - K + 2P}{S} \\right\\rfloor + 1, \\quad W_{out} = \\left\\lfloor \\frac{W_{in} - K + 2P}{S} \\right\\rfloor + 1$$
  </div>
  <p style="font-size:14px;color:#475569;">To preserve spatial height and width exactly when stride \\(S=1\\) with an odd kernel \\(K\\), set padding to \\(P = (K - 1) / 2\\) (e.g. \\(K=3 \\implies P=1\\); \\(K=5 \\implies P=2\\)).</p>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Parameter sharing allows a small \\(3 \\times 3\\) kernel to slide across an entire image regardless of input resolution.</li>
      <li>Max Pooling introduces local spatial invariance and halves spatial resolution without adding learnable parameters.</li>
      <li>Stacking two consecutive \\(3 \\times 3\\) convolutions yields an effective receptive field of \\(5 \\times 5\\) while using 28% fewer parameters than a single \\(5 \\times 5\\) filter.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 9 ──
    {
      id: "CH-AIML-009",
      courseId: "CRS-AIML-001",
      sequence: 9,
      title: "Classic & Modern CNN Architectures: AlexNet, VGG, ResNet & DenseNet",
      description: "Historical evolution of deep vision, AlexNet GPU breakthrough, VGG modular 3x3 stacks, Inception multi-scale factorized convolutions, and DenseNet feature reuse.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 28,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Computer Vision • Chapter 9</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Classic & Modern CNN Architectures: AlexNet to DenseNet</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">The ImageNet Large Scale Visual Recognition Challenge (ILSVRC) catalyzed the deep learning revolution. We trace the architectural lineage of vision backbones, analyzing how modern networks overcome computational bottlenecks.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/DAOcjicFr1Y" title="CNN Architecture Evolution" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Architecture Comparison Matrix</h2>
  <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
    <thead>
      <tr style="background:#f1f5f9;text-align:left;">
        <th style="padding:12px;border:1px solid #cbd5e1;">Architecture</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Year</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Key Innovation</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Top-5 Error</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Parameter Count</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>AlexNet</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">2012</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">First GPU-trained deep CNN, ReLU, Dropout</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">16.4%</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">61 Million</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>VGG-16</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">2014</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Homogeneous stacks of small 3x3 convolutions</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">7.3%</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">138 Million</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>GoogLeNet / Inception</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">2014</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Multi-scale parallel kernels with 1x1 bottleneck dimension reduction</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">6.7%</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">7 Million</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>ResNet-50</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">2015</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Identity shortcut skip connections (Residual learning)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">3.57% (Superhuman)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">25.6 Million</td>
      </tr>
    </tbody>
  </table>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>1x1 convolutions act as cross-channel pooling, enabling drastic parameter reduction before expensive spatial 3x3 filters.</li>
      <li>VGG proved that deep networks of small filters outperform shallow networks of large filters (e.g. 11x11 or 7x7).</li>
      <li>DenseNet connects every layer to every subsequent layer, maximizing feature propagation and gradient flow.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 10 ──
    {
      id: "CH-AIML-010",
      courseId: "CRS-AIML-001",
      sequence: 10,
      title: "Deep Residual Learning & Skip Connections (ResNet)",
      description: "Degradation problem of deep networks, formulation of residual mapping F(x) = H(x) - x, identity shortcuts, bottleneck blocks, and training 152+ layer models.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Computer Vision • Chapter 10</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Deep Residual Learning & Skip Connections (ResNet)</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Prior to 2015, stacking more layers beyond ~20 led to higher training error—not due to overfitting, but due to optimization degradation. He et al. resolved this degradation through identity shortcut connections, allowing networks to scale past 1,000 layers.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/ZILIbUvp5lk" title="ResNet Residual Networks Explained" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The Residual Formulation</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">Instead of forcing stacked layers to fit an underlying mapping \\(\\mathcal{H}(\\mathbf{x})\\), residual blocks fit the residual mapping \\(\\mathcal{F}(\\mathbf{x}) = \\mathcal{H}(\\mathbf{x}) - \\mathbf{x}\\). The original mapping is recast as:</p>
  <div style="background:#f8fafc;border-left:4px solid #6366f1;padding:16px;margin:20px 0;font-size:16px;font-weight:600;color:#1e293b;">
    $$\\mathcal{H}(\\mathbf{x}) = \\mathcal{F}(\\mathbf{x}) + \\mathbf{x}$$
  </div>
  <p style="font-size:14px;color:#475569;">During backpropagation, the gradient of the loss \\(\\mathcal{E}\\) contains an identity term: \\(\\frac{\\partial \\mathcal{E}}{\\partial \\mathbf{x}} = \\frac{\\partial \\mathcal{E}}{\\partial \\mathcal{H}} \\left( \\frac{\\partial \\mathcal{F}}{\\partial \\mathbf{x}} + \\mathbf{I} \\right)\\). Because of the \\(+\\mathbf{I}\\) identity term, gradients flow backwards unimpeded to shallow layers even if \\(\\frac{\\partial \\mathcal{F}}{\\partial \\mathbf{x}} \\to 0\\).</p>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Residual learning guarantees that adding layers can never degrade training accuracy; at worst, layers learn zero residuals \\(\\mathcal{F}(\\mathbf{x})=0\\) behaving as an identity pass.</li>
      <li>Bottleneck residual blocks (1x1 reduce -> 3x3 conv -> 1x1 expand) enable extreme depth with low parameter counts.</li>
      <li>Skip connections are now a foundational design motif across all modern deep learning, including Transformers and Diffusion models.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 11 ──
    {
      id: "CH-AIML-011",
      courseId: "CRS-AIML-001",
      sequence: 11,
      title: "Transfer Learning & Fine-Tuning Vision Models with Torchvision",
      description: "Feature extraction vs full fine-tuning, freezing convolutional backbones, layer-wise discriminative learning rates, data augmentation strategies (RandAugment, Mixup, CutMix).",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Computer Vision • Chapter 11</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Transfer Learning & Fine-Tuning Vision Models with Torchvision</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Training deep networks from scratch requires millions of labeled images and days of compute. Transfer learning transfers rich visual representations learned on ImageNet (edges, textures, object parts) to downstream specialized medical or industrial tasks with minimal data.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/mPFq5KMxKVw" title="Transfer Learning PyTorch Tutorial" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Freezing Backbones & Replacing Classification Heads</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import torch
import torch.nn as nn
from torchvision.models import resnet50, ResNet50_Weights

# Load state-of-the-art pretrained ImageNet V2 weights
weights = ResNet50_Weights.DEFAULT
model = resnet50(weights=weights)

# Phase 1: Freeze all convolutional backbone parameters
for param in model.parameters():
    param.requires_grad = False

# Replace the final 1000-class fully connected head with target task head (e.g. 5 disease classes)
num_features = model.fc.in_features
model.fc = nn.Sequential(
    nn.Linear(num_features, 256),
    nn.ReLU(),
    nn.Dropout(p=0.4),
    nn.Linear(256, 5) # Only this new head requires gradients!
)
model = model.to(device)</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Always utilize standard normalization statistics matching the pretraining dataset: <code>mean=[0.485, 0.456, 0.406]</code> and <code>std=[0.229, 0.224, 0.225]</code>.</li>
      <li>Advanced regularizations like <strong>Mixup</strong> (blending two images and their one-hot labels linearly) dramatically suppress overfitting.</li>
      <li>Unfreeze deeper convolutional blocks for fine-tuning using a 10x lower learning rate than the freshly initialized head.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 12 ──
    {
      id: "CH-AIML-012",
      courseId: "CRS-AIML-001",
      sequence: 12,
      title: "Object Detection Fundamentals: Two-Stage vs One-Stage Detectors (YOLOv8)",
      description: "Bounding box regression, Intersection over Union (IoU), Non-Maximum Suppression (NMS), Anchor boxes vs Anchor-free paradigms, Faster R-CNN, and YOLOv8 real-time architecture.",
      contentType: "Rich Text",
      durationMinutes: 60,
      minimumTimeMinutes: 30,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Computer Vision • Chapter 12</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Object Detection Fundamentals: Two-Stage vs One-Stage Detectors (YOLO)</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Object detection locates and classifies multiple objects simultaneously within an image. We explore the architectural divide between high-accuracy two-stage detectors (Faster R-CNN) and high-speed one-stage detectors (YOLOv8), mastering evaluation via mean Average Precision (mAP).</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/ag3DLKsl2vk" title="YOLO Object Detection Explained" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Two-Stage vs One-Stage Architecture</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:20px 0;">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#0284c7;margin-top:0;">Two-Stage Detectors (Faster R-CNN)</h3>
      <p style="font-size:14px;color:#475569;">1. Region Proposal Network (RPN) generates candidate bounding boxes.<br>2. RoI Pooling extracts regional features for classification and bbox refinement.<br><strong>Pros:</strong> High precision for small objects.<br><strong>Cons:</strong> High latency (~15-20 FPS), unsuitable for real-time edge devices.</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#6366f1;margin-top:0;">One-Stage Detectors (YOLOv8)</h3>
      <p style="font-size:14px;color:#475569;">Frames detection as a single unified regression problem from image pixels directly to bounding box coordinates and class probabilities.<br><strong>Pros:</strong> Blazing real-time speed (100+ FPS), anchor-free decoupled head.<br><strong>Cons:</strong> Historical trade-off in small object recall (mostly resolved in modern versions).</p>
    </div>
  </div>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li><strong>Intersection over Union (IoU)</strong> measures the area of overlap divided by the area of union between predicted and ground-truth boxes.</li>
      <li><strong>Non-Maximum Suppression (NMS)</strong> removes redundant overlapping bounding boxes based on class confidence scores and IoU thresholds.</li>
      <li>Standard detection performance is evaluated using <strong>mAP@0.5:0.95</strong> (mean average precision averaged over IoU thresholds from 0.50 to 0.95 in steps of 0.05).</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 13 ──
    {
      id: "CH-AIML-013",
      courseId: "CRS-AIML-001",
      sequence: 13,
      title: "Image Segmentation: Semantic & Instance Segmentation (U-Net & Mask R-CNN)",
      description: "Pixel-level classification, encoder-decoder skip connections in U-Net, transposed convolutions, Dice Loss vs Binary Cross-Entropy, and Mask R-CNN RoIAlign.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 28,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Computer Vision • Chapter 13</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Image Segmentation: Semantic & Instance Segmentation (U-Net)</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">While object detection places coarse bounding boxes around entities, image segmentation achieves fine-grained pixel-level understanding. We build encoder-decoder architectures with lateral skip connections for medical imaging and autonomous driving.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/azM57DysncM" title="U-Net Image Segmentation" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The U-Net Architectural Symmetry</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">The U-Net consists of a contracting path (encoder) that captures contextual semantic features and a symmetric expanding path (decoder) that enables precise spatial localization. Lateral skip connections copy high-resolution feature maps from encoder stages directly to decoder upsampling stages, preserving fine boundary definitions that would otherwise be lost during pooling.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Dice Loss for Extreme Foreground-Background Imbalance</h2>
  <div style="background:#f8fafc;border-left:4px solid #6366f1;padding:16px;margin:20px 0;font-size:16px;font-weight:600;color:#1e293b;">
    $$\\mathcal{L}_{Dice} = 1 - \\frac{2 \\sum_i p_i y_i + \\epsilon}{\\sum_i p_i + \\sum_i y_i + \\epsilon}$$
  </div>
  <p style="font-size:14px;color:#475569;">When segmenting tiny tumors occupying < 1% of an MRI scan, standard Cross-Entropy is overwhelmed by background pixels. Dice Loss directly optimizes the harmonic overlap of foreground masks.</p>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li><strong>Semantic Segmentation</strong> labels every pixel with a class (e.g. all cars share label 1); <strong>Instance Segmentation</strong> distinguishes individual instances (Car A vs Car B).</li>
      <li>Transposed Convolutions or Bilinear Upsampling + \\(3 \\times 3\\) Convolutions restore spatial resolution in the decoder path.</li>
      <li>Mask R-CNN replaces RoIPool with <strong>RoIAlign</strong> (using bilinear interpolation) to preserve exact sub-pixel spatial alignments for mask prediction.</li>
    </ul>
  </div>
</div>`
    }
  ],

  assessments: [
    {
      id: "ASM-AIML-008",
      title: "Convolution Operations & CNN Mechanics Assessment",
      chapterId: "CH-AIML-008",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-008-01", type: "MCQ", prompt: "What two structural priors do Convolutional Neural Networks exploit in 2D image data?", options: ["Local receptive fields and translation equivariance (parameter sharing)", "Linear independence and spherical symmetry", "Temporal causality and recurrence", "Complete graph connectivity"], answer: 0, points: 10 },
        { id: "Q-AIML-008-02", type: "MCQ", prompt: "Given an input image of 32x32, kernel size 5x5, padding 0, and stride 1, what is the output spatial size?", options: ["28 x 28", "30 x 30", "32 x 32", "26 x 26"], answer: 0, points: 10 },
        { id: "Q-AIML-008-03", type: "MCQ", prompt: "What padding value P is required to maintain identical spatial dimensions for a 3x3 kernel with stride 1 ('Same' padding)?", options: ["P = 1", "P = 2", "P = 0", "P = 3"], answer: 0, points: 10 },
        { id: "Q-AIML-008-04", type: "MCQ", prompt: "What is the primary function of Max Pooling layers in convolutional architectures?", options: ["Downsampling spatial resolution to reduce computational cost and introduce local spatial translation invariance", "Normalizing channel weights", "Adding non-linear activation", "Increasing feature channels"], answer: 0, points: 10 },
        { id: "Q-AIML-008-05", type: "MCQ", prompt: "How many learnable parameters (including bias) exist in a Conv2D layer with 16 input channels, 32 output channels, and 3x3 kernels?", options: ["4,640 parameters ((3*3*16 + 1) * 32)", "1,536 parameters", "512 parameters", "9,216 parameters"], answer: 0, points: 10 },
        { id: "Q-AIML-008-06", type: "MCQ", prompt: "What is 'Receptive Field' in deep convolutional networks?", options: ["The region of the input image that directly influences the activation of a particular neuron in a deeper feature map", "The camera lens focal length", "The size of the GPU buffer", "The batch size dimension"], answer: 0, points: 10 },
        { id: "Q-AIML-008-07", type: "MCQ", prompt: "What is the effective receptive field of two stacked 3x3 convolutional layers (with stride 1)?", options: ["5 x 5", "6 x 6", "9 x 9", "3 x 3"], answer: 0, points: 10 },
        { id: "Q-AIML-008-08", type: "MCQ", prompt: "What is 'Dilated' (or Atrous) convolution?", options: ["A convolution with spaces between kernel elements that expands receptive field without increasing parameter count", "A convolution that doubles channel depth", "A 1D convolution", "A compressed 8-bit convolution"], answer: 0, points: 10 },
        { id: "Q-AIML-008-09", type: "MCQ", prompt: "Why is 1x1 convolution frequently referred to as 'Network-in-Network' or channel-wise pooling?", options: ["It computes linear combinations across feature channels at each spatial pixel location, allowing dimension reduction", "It convolves spatial neighbors", "It crops the image", "It blurs image pixels"], answer: 0, points: 10 },
        { id: "Q-AIML-008-10", type: "MCQ", prompt: "What happens to the spatial dimensions of an image when a 2x2 Max Pooling layer with stride 2 is applied?", options: ["Both height and width are halved (spatial area reduced by 75%)", "Height is halved but width remains constant", "Dimensions remain unchanged", "Area is reduced by 50%"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-AIML-009",
      title: "Classic & Modern CNN Architectures Assessment",
      chapterId: "CH-AIML-009",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-009-01", type: "MCQ", prompt: "What landmark deep neural network won ImageNet 2012, igniting modern deep learning adoption?", options: ["AlexNet", "LeNet-5", "ResNet", "Transformer"], answer: 0, points: 10 },
        { id: "Q-AIML-009-02", type: "MCQ", prompt: "What was VGG's primary architectural design principle compared to earlier networks?", options: ["Using homogeneous, repeating stacks of small 3x3 convolutions with small strides throughout the entire backbone", "Using huge 11x11 filters", "Eliminating convolutions", "Using attention heads"], answer: 0, points: 10 },
        { id: "Q-AIML-009-03", type: "MCQ", prompt: "What is an Inception module in GoogLeNet?", options: ["A block that computes parallel convolutions with 1x1, 3x3, and 5x5 filters alongside max pooling, concatenating outputs", "A single deep recurrent loop", "A fully connected linear layer", "A dropout layer"], answer: 0, points: 10 },
        { id: "Q-AIML-009-04", type: "MCQ", prompt: "Why did GoogLeNet introduce 1x1 convolutions before its 3x3 and 5x5 filter branches?", options: ["To reduce channel dimensions (bottleneck), slashing parameter count and computational complexity", "To rotate feature maps", "To invert color channels", "To add noise"], answer: 0, points: 10 },
        { id: "Q-AIML-009-05", type: "MCQ", prompt: "What technique in modern CNNs replaced massive parameter-heavy fully connected layers at the output?", options: ["Global Average Pooling (GAP)", "Local Response Normalization", "Max Unpooling", "Zero padding"], answer: 0, points: 10 },
        { id: "Q-AIML-009-06", type: "MCQ", prompt: "What distinguishes DenseNet from ResNet?", options: ["DenseNet concatenates feature maps from all previous layers, whereas ResNet sums them element-wise", "DenseNet has no skip connections", "DenseNet is an unsupervised autoencoder", "DenseNet only works on audio"], answer: 0, points: 10 },
        { id: "Q-AIML-009-07", type: "MCQ", prompt: "Why was VGG-16 criticized despite its high accuracy in ILSVRC 2014?", options: ["Its 138 million parameters made it computationally heavy with slow inference and huge memory consumption", "It had lower accuracy than AlexNet", "It could not run on GPUs", "It failed to converge"], answer: 0, points: 10 },
        { id: "Q-AIML-009-08", type: "MCQ", prompt: "What CNN architecture family systematically scales depth, width, and image resolution using a compound coefficient?", options: ["EfficientNet", "MobileNet", "AlexNet", "Inception-v1"], answer: 0, points: 10 },
        { id: "Q-AIML-009-09", type: "MCQ", prompt: "What convolution variant decomposes standard 2D convolution into depthwise and pointwise operations for mobile edge devices?", options: ["Depthwise Separable Convolution (MobileNet)", "Transposed Convolution", "Dilated Convolution", "Group Convolution"], answer: 0, points: 10 },
        { id: "Q-AIML-009-10", type: "MCQ", prompt: "What vision model applies standard Transformer self-attention directly to flattened image patches?", options: ["Vision Transformer (ViT)", "DenseNet", "VGG", "ResNet-50"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-AIML-010",
      title: "Deep Residual Learning & ResNet Assessment",
      chapterId: "CH-AIML-010",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-010-01", type: "MCQ", prompt: "What phenomenon was observed when building 'plain' deep networks with 50+ layers prior to ResNet?", options: ["Optimization degradation: training error increased as depth increased, even though overfitting was not occurring", "Test error increased while train error was zero", "Weights diverged to infinity", "GPU memory cleared"], answer: 0, points: 10 },
        { id: "Q-AIML-010-02", type: "MCQ", prompt: "What mathematical formulation defines a residual learning building block?", options: ["H(x) = F(x) + x", "H(x) = F(x) * x", "H(x) = F(x) / x", "H(x) = max(F(x), x)"], answer: 0, points: 10 },
        { id: "Q-AIML-010-03", type: "MCQ", prompt: "Why do identity skip connections (+x) guarantee that deeper networks perform at least as well as shallower ones?", options: ["The network can easily learn to set residual weights F(x) to zero, collapsing the block into a benign identity pass", "They double the parameter count", "They force all weights to 1.0", "They skip backpropagation completely"], answer: 0, points: 10 },
        { id: "Q-AIML-010-04", type: "MCQ", prompt: "What does backpropagation through a residual block yield mathematically that prevents vanishing gradients?", options: ["An additive identity term (+I) that allows gradients to flow backwards unimpeded to shallow layers", "A zero gradient term", "A multiplicative decay factor", "An exponential scaling factor"], answer: 0, points: 10 },
        { id: "Q-AIML-010-05", type: "MCQ", prompt: "What three layers constitute a 'Bottleneck' residual block in ResNet-50/101/152?", options: ["1x1 Conv (dimension reduction) -> 3x3 Conv -> 1x1 Conv (dimension restoration)", "Three 3x3 Convs", "5x5 Conv -> MaxPool -> Linear", "7x7 Conv -> BatchNorm -> ReLU"], answer: 0, points: 10 },
        { id: "Q-AIML-010-06", type: "MCQ", prompt: "How does ResNet match dimensions when adding the identity shortcut x if spatial size or channel count changes?", options: ["Using a 1x1 convolution with stride 2 on the shortcut path (Projection shortcut)", "Zero padding spatial edges only", "Truncating extra channels", "Re-initializing the block"], answer: 0, points: 10 },
        { id: "Q-AIML-010-07", type: "MCQ", prompt: "What order of operations did the improved 'Pre-activation ResNet' introduce for enhanced gradient flow?", options: ["BatchNorm -> ReLU -> Weight Convolution (instead of Weight -> BatchNorm -> ReLU)", "Weight -> ReLU -> BatchNorm", "ReLU -> Weight -> BatchNorm", "Weight -> Dropout -> ReLU"], answer: 0, points: 10 },
        { id: "Q-AIML-010-08", type: "MCQ", prompt: "What is the total number of layers in the deepest standard ResNet architecture evaluated in the 2015 paper?", options: ["ResNet-152 (with experimental versions up to 1,202 layers)", "ResNet-50", "ResNet-16", "ResNet-34"], answer: 0, points: 10 },
        { id: "Q-AIML-010-09", type: "MCQ", prompt: "What is ResNeXt?", options: ["An architectural extension of ResNet introducing multi-branch grouped convolutions (cardinality)", "A recurrent neural network", "A vision transformer", "A quantized 4-bit model"], answer: 0, points: 10 },
        { id: "Q-AIML-010-10", type: "MCQ", prompt: "What error rate did ResNet achieve on ImageNet 2015, famously beating human-level performance (~5.1%)?", options: ["3.57% top-5 error", "8.5%", "12.2%", "0.01%"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-AIML-011",
      title: "Transfer Learning & Fine-Tuning Assessment",
      chapterId: "CH-AIML-011",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-011-01", type: "MCQ", prompt: "What visual features do early convolutional layers in a pretrained deep vision model typically capture?", options: ["Low-level generic primitives like edges, oriented lines, color gradients, and textures", "Class-specific semantic objects (e.g. dog faces)", "Pixel noise", "Text captions"], answer: 0, points: 10 },
        { id: "Q-AIML-011-02", type: "MCQ", prompt: "How do you freeze parameters of a pretrained model in PyTorch to prevent them from updating during training?", options: ["Set `param.requires_grad = False` for each parameter in the backbone", "Call `model.freeze()`", "Pass `lr=0` in Adam", "Set `model.eval()` only"], answer: 0, points: 10 },
        { id: "Q-AIML-011-03", type: "MCQ", prompt: "Why should a newly initialized classification head be trained before unfreezing and fine-tuning the pretrained backbone?", options: ["Large random gradients from the uninitialized head would overwrite and destroy the pretrained weights (catastrophic forgetting)", "Pretrained weights cannot calculate gradients", "The optimizer requires 10 epochs to allocate memory", "To convert data to float32"], answer: 0, points: 10 },
        { id: "Q-AIML-011-04", type: "MCQ", prompt: "What data augmentation strategy creates synthetic training examples by taking a convex linear combination of pairs of images and labels?", options: ["Mixup", "RandomCrop", "Cutout", "ColorJitter"], answer: 0, points: 10 },
        { id: "Q-AIML-011-05", type: "MCQ", prompt: "What data augmentation cuts a rectangular patch from one image and pastes it onto another, adjusting target labels proportionally?", options: ["CutMix", "Mosaic", "Affine transform", "Gaussian blur"], answer: 0, points: 10 },
        { id: "Q-AIML-011-06", type: "MCQ", prompt: "What learning rate strategy applies lower learning rates to shallow layers and higher rates to deeper/head layers?", options: ["Discriminative (Layer-wise) Learning Rates", "OneCycleLR", "StepLR", "Cosine Annealing"], answer: 0, points: 10 },
        { id: "Q-AIML-011-07", type: "MCQ", prompt: "What ImageNet normalization mean and standard deviation tensors are standard in Torchvision models?", options: ["mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]", "mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]", "mean=[0, 0, 0], std=[1, 1, 1]", "mean=[1, 1, 1], std=[0, 0, 0]"], answer: 0, points: 10 },
        { id: "Q-AIML-011-08", type: "MCQ", prompt: "When is 'feature extraction' (training only the top linear classifier) preferred over full fine-tuning?", options: ["When the target dataset is small and domain-similar to ImageNet", "When the target dataset has 10 million images", "When compute resources are infinite", "When target images are completely unlabelled"], answer: 0, points: 10 },
        { id: "Q-AIML-011-09", type: "MCQ", prompt: "What is AutoAugment / RandAugment in modern computer vision pipelines?", options: ["Automated augmentation policies that randomly select and tune transformation magnitudes without manual tuning", "A tool for generating fake deepfakes", "A model compression technique", "A hardware GPU scaler"], answer: 0, points: 10 },
        { id: "Q-AIML-011-10", type: "MCQ", prompt: "What happens if you fail to normalize validation images using the exact training dataset distribution?", options: ["Model accuracy drops substantially due to covariate domain shift between training and evaluation tensors", "PyTorch throws a shape mismatch error", "The GPU stops working", "Outputs become zero"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-AIML-012",
      title: "Object Detection & YOLOv8 Assessment",
      chapterId: "CH-AIML-012",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-012-01", type: "MCQ", prompt: "What metric calculates the overlap area between a predicted bounding box and a ground-truth box divided by their combined area?", options: ["Intersection over Union (IoU)", "Mean Squared Error", "Cosine Similarity", "F1 Score"], answer: 0, points: 10 },
        { id: "Q-AIML-012-02", type: "MCQ", prompt: "What algorithm iteratively eliminates redundant, lower-confidence bounding boxes that have high IoU overlap with top predictions?", options: ["Non-Maximum Suppression (NMS)", "K-Means", "Beam Search", "Simulated Annealing"], answer: 0, points: 10 },
        { id: "Q-AIML-012-03", type: "MCQ", prompt: "What fundamental architectural difference distinguishes two-stage detectors (Faster R-CNN) from one-stage detectors (YOLO)?", options: ["Two-stage models use a Region Proposal Network before classification; one-stage models predict boxes and classes directly in a single pass", "Two-stage models cannot run on GPUs", "One-stage models do not use convolutions", "Two-stage models have no loss function"], answer: 0, points: 10 },
        { id: "Q-AIML-012-04", type: "MCQ", prompt: "What is 'mAP@0.50' in object detection evaluation benchmarks?", options: ["Mean Average Precision calculated across all classes using an IoU threshold of 0.50", "Minimum Accuracy Percentage", "Max Area Prediction", "Mean Anchor Precision"], answer: 0, points: 10 },
        { id: "Q-AIML-012-05", type: "MCQ", prompt: "What feature pyramid network (FPN) innovation improves detection of small objects across multi-scale feature maps?", options: ["Combining top-down semantic features with bottom-up high-resolution spatial feature paths (PANet / BiFPN)", "Stacking 100 pooling layers", "Upsampling images to 8K resolution", "Using purely linear heads"], answer: 0, points: 10 },
        { id: "Q-AIML-012-06", type: "MCQ", prompt: "What does it mean for modern architectures like YOLOv8 to be 'anchor-free'?", options: ["They predict box center offsets and dimensions directly from feature points rather than regressing offsets from predefined anchor boxes", "They do not use bounding boxes", "They cannot predict object location", "They only classify single objects"], answer: 0, points: 10 },
        { id: "Q-AIML-012-07", type: "MCQ", prompt: "In Faster R-CNN, what is the role of the Region Proposal Network (RPN)?", options: ["Generating candidate regions of interest that likely contain foreground objects", "Classifying the final 80 object classes", "Downsampling input images", "Computing image embeddings"], answer: 0, points: 10 },
        { id: "Q-AIML-012-08", type: "MCQ", prompt: "What loss function in modern YOLO models penalizes bounding box distance and aspect ratio deviations directly?", options: ["Complete IoU (CIoU) / Distribution Focal Loss", "Mean Absolute Error", "Binary Cross Entropy only", "Hinge Loss"], answer: 0, points: 10 },
        { id: "Q-AIML-012-09", type: "MCQ", prompt: "What is the primary speed advantage of YOLO models that makes them ideal for embedded edge devices (e.g. Jetson)?", options: ["Single forward-pass inference processing full frames at 60-150+ frames per second", "Zero memory footprint", "Runs without hardware multipliers", "Does not use float operations"], answer: 0, points: 10 },
        { id: "Q-AIML-012-10", type: "MCQ", prompt: "What format represents bounding box annotations in the standard COCO dataset?", options: ["[x_min, y_min, width, height]", "[x_center, y_center, radius]", "[x1, y1, x2, y2, x3, y3]", "Raw binary masks only"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-AIML-013",
      title: "Image Segmentation & U-Net Assessment",
      chapterId: "CH-AIML-013",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-013-01", type: "MCQ", prompt: "What is the fundamental difference between Semantic Segmentation and Instance Segmentation?", options: ["Semantic segmentation labels all pixels of a category with the same class; instance segmentation distinguishes distinct individual instances of that class", "Semantic segmentation only works on text", "Instance segmentation does not predict masks", "Semantic segmentation uses bounding boxes"], answer: 0, points: 10 },
        { id: "Q-AIML-013-02", type: "MCQ", prompt: "What is the purpose of lateral skip connections between encoder and decoder stages in U-Net?", options: ["Copying high-resolution spatial feature maps directly across to decoder upsampling stages to preserve fine boundary localization", "Skipping layers to reduce compute", "Bypassing gradient backpropagation", "Adding regularization noise"], answer: 0, points: 10 },
        { id: "Q-AIML-013-03", type: "MCQ", prompt: "Why is Dice Loss (or Soft Dice) superior to standard Cross-Entropy for medical segmentation tasks?", options: ["It is robust to extreme class imbalance where foreground lesions or tumors occupy less than 1% of total image pixels", "It is 10x faster to compute", "It requires no ground-truth masks", "It converts masks into bounding boxes"], answer: 0, points: 10 },
        { id: "Q-AIML-013-04", type: "MCQ", prompt: "What layer operation in the U-Net decoder expands spatial dimensions back to original resolution?", options: ["Transposed Convolution (ConvTranspose2d) or Bilinear Upsampling", "Max Pooling", "Strided Convolution with stride 2", "Dense Linear layer"], answer: 0, points: 10 },
        { id: "Q-AIML-013-05", type: "MCQ", prompt: "What mechanism did Mask R-CNN introduce to resolve the pixel misalignment issues of standard RoIPool?", options: ["RoIAlign (using bilinear interpolation at fractional sampling points)", "RoIMax", "Average pooling", "Nearest neighbor snapping"], answer: 0, points: 10 },
        { id: "Q-AIML-013-06", type: "MCQ", prompt: "What evaluation metric evaluates the mean spatial overlap of predicted segmentation masks versus ground truth masks?", options: ["Mean Intersection over Union (mIoU / Jaccard Index)", "Top-1 Accuracy", "Perplexity", "BLEU score"], answer: 0, points: 10 },
        { id: "Q-AIML-013-07", type: "MCQ", prompt: "What is Panoptic Segmentation?", options: ["A unified task combining Semantic Segmentation (stuff: sky, road) and Instance Segmentation (things: cars, pedestrians)", "3D point cloud segmentation", "Video frame interpolation", "Black and white thresholding"], answer: 0, points: 10 },
        { id: "Q-AIML-013-08", type: "MCQ", prompt: "What model family from Meta AI introduced promptable, zero-shot foundation segmentation across arbitrary images?", options: ["Segment Anything Model (SAM)", "YOLOv5", "ResNet-101", "VGG-19"], answer: 0, points: 10 },
        { id: "Q-AIML-013-09", type: "MCQ", prompt: "In medical imaging, what dimensional extension of U-Net processes volumetric 3D CT and MRI scans directly?", options: ["3D U-Net (using Conv3D and MaxPool3D)", "VolumeNet", "PointNet", "SliceNet"], answer: 0, points: 10 },
        { id: "Q-AIML-013-10", type: "MCQ", prompt: "What artifact commonly arises when utilizing Transposed Convolutions with uneven stride/kernel overlap?", options: ["Checkerboard artifacts in generated mask textures", "Color inversion", "Total blurriness", "GPU out of memory"], answer: 0, points: 10 },
      ]
    }
  ]
};

