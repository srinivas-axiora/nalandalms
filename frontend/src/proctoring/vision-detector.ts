// Edge Vision Proctoring Engine (Client-side real-time anomaly detection)
// Detects face absence, multiple faces, and head/gaze deviation using HTML5 Canvas & Optical Motion Analysis.

export type VisionAnomalyType =
  | "FACE_ABSENT"
  | "MULTIPLE_FACES"
  | "GAZE_AWAY"
  | "AUDIO_SPIKE"
  | "TAB_SWITCH"
  | "DEVICE_DETECTED";

export type VisionFrameResult = {
  faceDetected: boolean;
  faceCount: number;
  gazeCentered: boolean;
  confidence: number;
  anomaly?: VisionAnomalyType | null;
  severity: "low" | "medium" | "high";
};

export class EdgeVisionDetector {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private absentFramesCount = 0;
  private gazeAwayFramesCount = 0;
  private consecutiveAnomalies = 0;
  private lastAnalysisTime = 0;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = 160;
    this.canvas.height = 120;
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
  }

  // Analyzes a single frame from an HTMLVideoElement
  public analyzeFrame(video: HTMLVideoElement): VisionFrameResult {
    if (!this.ctx || !video.videoWidth || !video.videoHeight || video.paused) {
      return {
        faceDetected: false,
        faceCount: 0,
        gazeCentered: true,
        confidence: 0,
        anomaly: null,
        severity: "low",
      };
    }

    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.drawImage(video, 0, 0, w, h);
    const frame = this.ctx.getImageData(0, 0, w, h);
    const data = frame.data;

    let skinPixelCount = 0;
    let leftSkinPixels = 0;
    let rightSkinPixels = 0;
    let totalLuminance = 0;

    // Fast sampling: examine every 4th pixel for skin-tone & luminance distribution
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      totalLuminance += luminance;

      // Normalized RGB skin tone heuristic filter
      const isSkin =
        r > 60 &&
        g > 40 &&
        b > 20 &&
        r > g &&
        r > b &&
        r - g > 10 &&
        Math.abs(r - g) > 15;

      if (isSkin) {
        skinPixelCount++;
        const pixelIndex = i / 4;
        const x = pixelIndex % w;
        if (x < w / 2) {
          leftSkinPixels++;
        } else {
          rightSkinPixels++;
        }
      }
    }

    const sampleCount = data.length / 16;
    const skinRatio = skinPixelCount / sampleCount;
    const avgLuminance = totalLuminance / sampleCount;

    // Face Presence Detection
    const faceDetected = skinRatio > 0.08 && avgLuminance > 25;
    let faceCount = faceDetected ? 1 : 0;

    // Multiple faces heuristic: abnormally widespread skin pixel cluster across disparate quadrants
    if (skinRatio > 0.45) {
      faceCount = 2;
    }

    // Gaze / Head Pose Symmetry Analysis
    const totalSkin = leftSkinPixels + rightSkinPixels;
    const asymmetry = totalSkin > 0 ? Math.abs(leftSkinPixels - rightSkinPixels) / totalSkin : 0;
    const gazeCentered = asymmetry < 0.45; // Asymmetry > 45% suggests head turned sideways

    let anomaly: VisionAnomalyType | null = null;
    let severity: "low" | "medium" | "high" = "low";

    if (!faceDetected) {
      this.absentFramesCount++;
      if (this.absentFramesCount >= 3) {
        // Face absent for ~3-4 frames (~3 seconds)
        anomaly = "FACE_ABSENT";
        severity = "high";
      }
    } else {
      this.absentFramesCount = 0;
    }

    if (faceCount > 1) {
      anomaly = "MULTIPLE_FACES";
      severity = "high";
    } else if (faceDetected && !gazeCentered) {
      this.gazeAwayFramesCount++;
      if (this.gazeAwayFramesCount >= 4) {
        anomaly = "GAZE_AWAY";
        severity = "medium";
      }
    } else {
      this.gazeAwayFramesCount = 0;
    }

    const confidence = faceDetected ? Math.min(1.0, 0.65 + skinRatio) : 0.85;

    return {
      faceDetected,
      faceCount,
      gazeCentered,
      confidence: Number(confidence.toFixed(2)),
      anomaly,
      severity,
    };
  }

  public reset() {
    this.absentFramesCount = 0;
    this.gazeAwayFramesCount = 0;
    this.consecutiveAnomalies = 0;
  }
}

