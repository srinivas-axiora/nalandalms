import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EdgeVisionDetector } from "../proctoring/vision-detector";

type PublicAssessmentMeta = {
  id: string;
  token: string;
  title: string;
  courseTitle: string;
  durationMinutes: number;
  passScore: number;
  totalQuestions: number;
  proctoringRequired: boolean;
  fullscreenRequired: boolean;
  tabSwitchAutoSubmit: boolean;
  maxTabSwitches: number;
  status: string;
};

type BlindQuestion = {
  id: string;
  prompt: string;
  type: "MCQ" | "Descriptive" | string;
  options?: string[];
  points: number;
};

type SubmissionResult = {
  submissionId: string;
  candidateName: string;
  candidateEmail: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean | null;
  status: "Passed" | "Failed" | "PendingManualReview" | string;
  requiresManualReview: boolean;
  passScore: number;
  trustScore: number;
  timeSpentSeconds: number;
  submittedAt: string;
  tabSwitchCount: number;
  flagsCount: number;
};

export default function CandidateAssessment() {
  const [token, setToken] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PublicAssessmentMeta | null>(null);

  // Flow stages: "welcome" | "device-check" | "exam" | "submitted"
  const [stage, setStage] = useState<"welcome" | "device-check" | "exam" | "submitted">("welcome");

  // Candidate credentials
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [starting, setStarting] = useState(false);
  const [identityError, setIdentityError] = useState<string | null>(null);

  // Active exam state
  const [attemptToken, setAttemptToken] = useState<string>("");
  const [questions, setQuestions] = useState<BlindQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [trustScore, setTrustScore] = useState<number>(100);
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);

  // Proctoring elements
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(true);
  const [fullscreenWarning, setFullscreenWarning] = useState(false);
  const detectorRef = useRef<EdgeVisionDetector | null>(null);
  const absentFramesCountRef = useRef(0);

  // Extract token from URL
  useEffect(() => {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const candidateIdx = parts.findIndex((p) => p === "candidate-assessment" || p === "take-assessment");
    const extractedToken = candidateIdx !== -1 && parts[candidateIdx + 1] ? parts[candidateIdx + 1] : "";
    setToken(extractedToken);

    if (!extractedToken) {
      setError("Assessment link token is missing from the URL.");
      setLoading(false);
      return;
    }

    // Fetch assessment public details
    fetch(`/api/public/candidate-assessments/${extractedToken}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load assessment.");
        setMeta(data.data);
        setTimeLeft((data.data.durationMinutes || 30) * 60);
      })
      .catch((err) => {
        setError(err.message || "Unable to reach assessment server.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Initialize EdgeVisionDetector
  useEffect(() => {
    detectorRef.current = new EdgeVisionDetector();
  }, []);

  // Helper to send telemetry events to backend
  const sendProctoringEvent = useCallback(
    async (eventType: string, severity: "low" | "medium" | "high" = "medium", metadata: Record<string, any> = {}) => {
      if (!attemptToken || !token) return;
      try {
        const res = await fetch(`/api/public/candidate-assessments/${token}/event`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attemptToken,
            eventType,
            severity,
            metadata,
          }),
        });
        if (res.ok) {
          const d = await res.json();
          if (d.trustScore !== undefined) setTrustScore(d.trustScore);
          if (d.tabSwitchCount !== undefined) setTabSwitchWarnings(d.tabSwitchCount);
          if (d.autoSubmitted) {
            handleFinalSubmit();
          }
        }
      } catch (err) {
        console.warn("Failed to report proctoring event:", err);
      }
    },
    [attemptToken, token]
  );

  // Setup camera stream for device check / proctoring
  const startCamera = async () => {
    try {
      if (streamRef.current) return true;
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      return true;
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraActive(false);
      return false;
    }
  };

  // Stop camera when unmounting or finished
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Step 1: Submit identity to start test
  const handleStartIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIdentityError(null);

    const trimmedName = candidateName.trim();
    const trimmedEmail = candidateEmail.trim().toLowerCase();

    if (trimmedName.length < 2) {
      setIdentityError("Please enter your full name (minimum 2 characters).");
      return;
    }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setIdentityError("Please enter a valid email address.");
      return;
    }

    setStarting(true);
    try {
      const res = await fetch(`/api/public/candidate-assessments/${token}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateName: trimmedName,
          candidateEmail: trimmedEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          throw new Error(
            data.error || "An assessment has already been submitted for this email ID. Only one response is permitted."
          );
        }
        throw new Error(data.error || "Unable to start assessment.");
      }

      setAttemptToken(data.attemptToken);
      setQuestions(data.questions || []);
      setTimeLeft((data.durationMinutes || meta?.durationMinutes || 30) * 60);

      if (meta?.proctoringRequired) {
        setStage("device-check");
        startCamera();
      } else {
        setStage("exam");
      }
    } catch (err: any) {
      setIdentityError(err.message || "Something went wrong.");
    } finally {
      setStarting(false);
    }
  };

  // Step 2: Device check confirmed -> enter fullscreen & begin exam
  const handleBeginExam = async () => {
    try {
      if (meta?.fullscreenRequired && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {
      // Browser might block fullscreen without direct gesture; proceed anyway
    }
    setStage("exam");
  };

  // Fullscreen enforcement during exam
  useEffect(() => {
    if (stage !== "exam" || !meta?.fullscreenRequired) return;

    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setFullscreenWarning(true);
        sendProctoringEvent("FULLSCREEN_EXIT", "high", { timestamp: Date.now() });
      } else {
        setFullscreenWarning(false);
      }
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [stage, meta, sendProctoringEvent]);

  // Tab switch & Window Blur detection during exam
  useEffect(() => {
    if (stage !== "exam") return;

    const onVisibilityChange = () => {
      if (document.hidden) {
        sendProctoringEvent("TAB_SWITCH", "high", { hidden: true, timestamp: Date.now() });
      }
    };

    const onBlur = () => {
      sendProctoringEvent("WINDOW_BLUR", "medium", { blur: true, timestamp: Date.now() });
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
    };
  }, [stage, sendProctoringEvent]);

  // Continuous Camera Vision Analysis (Face presence detection)
  useEffect(() => {
    if (stage !== "exam" || !meta?.proctoringRequired || !cameraActive) return;

    const interval = setInterval(() => {
      if (!videoRef.current || !detectorRef.current) return;
      const result = detectorRef.current.analyzeFrame(videoRef.current);
      setFaceDetected(result.faceDetected);

      if (!result.faceDetected) {
        absentFramesCountRef.current++;
        if (absentFramesCountRef.current === 3) {
          sendProctoringEvent("FACE_ABSENT", "medium", { consecutiveFrames: 3 });
        }
      } else {
        absentFramesCountRef.current = 0;
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [stage, meta, cameraActive, sendProctoringEvent]);

  // Assessment countdown timer
  useEffect(() => {
    if (stage !== "exam") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [stage]);

  // Answer selection handler
  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  // Submit assessment responses
  const handleFinalSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const res = await fetch(`/api/public/candidate-assessments/${token}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptToken,
          answers,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed.");

      setSubmissionResult(data.result);
      setStage("submitted");
    } catch (err: any) {
      alert("Error submitting answers: " + (err.message || "Network error"));
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Render Loading & Error screens
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white font-sans">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent mx-auto" />
          <p className="text-slate-400 text-sm">Verifying assessment link...</p>
        </div>
      </div>
    );
  }

  if (error || !meta) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white font-sans">
        <div className="max-w-md w-full rounded-3xl border border-rose-500/30 bg-white/[0.03] p-8 backdrop-blur-xl text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-semibold text-white">Assessment Unavailable</h2>
          <p className="text-sm text-slate-400 leading-relaxed">{error || "This assessment link is invalid or expired."}</p>
          <p className="text-xs text-slate-500">Please contact your recruiter or assessment coordinator for a valid link.</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STAGE 1: Welcome & Candidate Identification (Google Form Style)
  // ─────────────────────────────────────────────────────────────────────────────
  if (stage === "welcome") {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-cyan-500/30">
        <div className="w-full max-w-xl space-y-6">
          {/* Header Card */}
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500" />
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-400/10 border border-cyan-400/20 text-cyan-300">
                Nalanda Assessment
              </span>
              <span className="text-xs text-slate-400">{meta.courseTitle}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">{meta.title}</h1>

            <div className="mt-6 grid grid-cols-3 gap-3 border-y border-white/10 py-4 text-center">
              <div>
                <p className="text-xs text-slate-400">Duration</p>
                <p className="text-lg font-bold text-white">{meta.durationMinutes} min</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Questions</p>
                <p className="text-lg font-bold text-white">{meta.totalQuestions}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Passing Score</p>
                <p className="text-lg font-bold text-emerald-400">{meta.passScore}%</p>
              </div>
            </div>

            {/* Strict Single Submission Notice */}
            <div className="mt-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs text-amber-200 leading-relaxed flex items-start gap-3">
              <span className="font-bold text-sm">ℹ</span>
              <div>
                <strong className="block text-amber-100 mb-0.5">Strict Single Submission Policy</strong>
                Only one assessment response is accepted per candidate email ID. Once submitted or started, this link cannot be reused.
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl shadow-xl">
            <form onSubmit={handleStartIdentity} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3.5 text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john@example.com"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3.5 text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition text-sm"
                />
                <p className="mt-1.5 text-[11px] text-slate-500">Your score and certificate (if passed) will be linked to this email.</p>
              </div>

              {identityError && (
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
                  {identityError}
                </div>
              )}

              <button
                type="submit"
                disabled={starting}
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 py-4 text-center font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50"
              >
                {starting ? "Verifying email..." : meta.proctoringRequired ? "Continue to Proctoring Check" : "Start Assessment"}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STAGE 2: Device & Proctoring Readiness Check
  // ─────────────────────────────────────────────────────────────────────────────
  if (stage === "device-check") {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">System & Camera Check</h2>
              <p className="text-xs text-slate-400">Position yourself clearly in front of the camera before beginning.</p>
            </div>

            {/* Video Preview Box */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/20 bg-slate-900 flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 p-4 text-center space-y-3">
                  <p className="text-xs text-slate-300">Webcam permission is required for proctoring verification.</p>
                  <button
                    onClick={startCamera}
                    className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950"
                  >
                    Enable Camera
                  </button>
                </div>
              )}
              {cameraActive && (
                <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 border border-white/10 text-[11px]">
                  <span className={`h-2 w-2 rounded-full ${faceDetected ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
                  <span className={faceDetected ? "text-emerald-300" : "text-rose-300"}>
                    {faceDetected ? "Face Detected" : "Align Face in Center"}
                  </span>
                </div>
              )}
            </div>

            {/* Proctoring Rules Checklist */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-emerald-300">
                <span>✓</span>
                <span>Camera feed continuously monitored</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-300">
                <span>✓</span>
                <span>Fullscreen lock enabled (exiting decreases trust score)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-300">
                <span>✓</span>
                <span>Tab switching and copy/paste blocked</span>
              </div>
            </div>

            <button
              onClick={handleBeginExam}
              disabled={!cameraActive}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 py-4 font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:opacity-95 active:scale-[0.99] transition disabled:opacity-40"
            >
              Enter Fullscreen & Begin Assessment
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STAGE 3: Active Proctored Assessment
  // ─────────────────────────────────────────────────────────────────────────────
  if (stage === "exam") {
    const currentQ = questions[currentIndex];
    const totalQ = questions.length;
    const answeredCount = Object.keys(answers).length;

    return (
      <div
        className="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none"
        onCopy={(e) => e.preventDefault()}
        onPaste={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Top Header / HUD */}
        <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/90 backdrop-blur-md px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-white truncate max-w-sm">{meta.title}</h1>
            <p className="text-xs text-slate-400">Candidate: {candidateName} ({candidateEmail})</p>
          </div>

          <div className="flex items-center gap-6">
            {/* Trust Score indicator */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs">
              <span className="text-slate-400">Trust Score:</span>
              <span
                className={`font-bold ${
                  trustScore >= 80 ? "text-emerald-400" : trustScore >= 60 ? "text-amber-400" : "text-rose-400"
                }`}
              >
                {trustScore}%
              </span>
            </div>

            {/* Timer countdown */}
            <div
              className={`rounded-2xl border px-4 py-1.5 font-mono text-sm font-bold ${
                timeLeft < 180 ? "border-rose-500/40 bg-rose-500/10 text-rose-300 animate-pulse" : "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
              }`}
            >
              ⏱ {formatTimer(timeLeft)}
            </div>

            <button
              onClick={handleFinalSubmit}
              disabled={submitting}
              className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300 active:scale-95 transition"
            >
              {submitting ? "Submitting..." : "Finish Test"}
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 max-w-5xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question View (Col 1-3) */}
          <div className="lg:col-span-3 space-y-6">
            {currentQ && (
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                    Question {currentIndex + 1} of {totalQ}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {currentQ.points || 10} Points
                  </span>
                </div>

                <h2 className="text-lg font-medium text-white leading-relaxed">{currentQ.prompt}</h2>

                {/* Options List */}
                {currentQ.options && currentQ.options.length > 0 && (
                  <div className="space-y-3 pt-2">
                    {currentQ.options.map((opt, optIdx) => {
                      const isSelected = answers[currentQ.id] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(currentQ.id, optIdx)}
                          className={`w-full text-left rounded-2xl border p-4 text-sm transition flex items-center gap-4 ${
                            isSelected
                              ? "border-cyan-400 bg-cyan-400/10 text-white shadow-lg shadow-cyan-400/10"
                              : "border-white/10 bg-slate-900/60 text-slate-300 hover:border-white/20 hover:bg-white/[0.02]"
                          }`}
                        >
                          <span
                            className={`h-6 w-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${
                              isSelected ? "border-cyan-400 bg-cyan-400 text-slate-950" : "border-slate-600 text-slate-400"
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Prev / Next buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 disabled:opacity-30"
                  >
                    ← Previous
                  </button>

                  <button
                    onClick={() => setCurrentIndex((prev) => Math.min(totalQ - 1, prev + 1))}
                    disabled={currentIndex === totalQ - 1}
                    className="rounded-xl border border-white/10 px-5 py-2 text-xs font-semibold text-cyan-200 hover:bg-white/5 disabled:opacity-30"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Navigator & Camera Feed (Col 4) */}
          <div className="space-y-6">
            {/* Live Camera Feed PiP */}
            {cameraActive && (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl overflow-hidden space-y-2">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-white/10">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[10px]">
                    <span className={`h-1.5 w-1.5 rounded-full ${faceDetected ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
                    <span className={faceDetected ? "text-emerald-300" : "text-rose-300"}>
                      {faceDetected ? "Proctor Active" : "No Face"}
                    </span>
                  </div>
                </div>
                {tabSwitchWarnings > 0 && (
                  <p className="text-[11px] text-amber-300 text-center font-medium">
                    ⚠️ {tabSwitchWarnings} Tab switches logged
                  </p>
                )}
              </div>
            )}

            {/* Questions Navigator Grid */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Questions Overview</span>
                <span className="font-semibold text-white">{answeredCount}/{totalQ} Answered</span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isCurrent = currentIndex === idx;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-9 w-9 rounded-xl text-xs font-bold transition flex items-center justify-center ${
                        isCurrent
                          ? "ring-2 ring-cyan-400 bg-cyan-400 text-slate-950"
                          : isAnswered
                          ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300"
                          : "bg-slate-900/60 border border-white/10 text-slate-400 hover:border-white/20"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Fullscreen Exit Warning Modal Overlay */}
        <AnimatePresence>
          {fullscreenWarning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
            >
              <div className="max-w-md w-full rounded-3xl border border-rose-500/40 bg-slate-900 p-8 text-center space-y-5 shadow-2xl">
                <div className="h-12 w-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-300 flex items-center justify-center mx-auto text-xl font-bold">
                  ⚠️
                </div>
                <h3 className="text-xl font-bold text-white">Fullscreen Exited!</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  You have left fullscreen mode. A proctoring violation has been logged and your Trust Score was reduced.
                </p>
                <button
                  onClick={() => {
                    document.documentElement.requestFullscreen().catch(() => {});
                    setFullscreenWarning(false);
                  }}
                  className="w-full rounded-2xl bg-rose-500 py-3.5 font-bold text-white shadow-lg shadow-rose-500/30 hover:bg-rose-400 transition text-sm"
                >
                  Return to Fullscreen Mode
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STAGE 4: Completion & Graded Results Summary
  // ─────────────────────────────────────────────────────────────────────────────
  if (stage === "submitted" && submissionResult) {
    const passed = submissionResult.passed;
    const requiresManualReview = submissionResult.requiresManualReview;

    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-6">
          <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl shadow-2xl text-center space-y-6">
            <div
              className={`h-16 w-16 rounded-3xl mx-auto flex items-center justify-center text-3xl font-bold shadow-xl ${
                requiresManualReview
                  ? "bg-amber-500/20 border border-amber-500/30 text-amber-300 shadow-amber-500/10"
                  : passed
                  ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-emerald-500/10"
                  : "bg-rose-500/20 border border-rose-500/30 text-rose-400 shadow-rose-500/10"
              }`}
            >
              {requiresManualReview ? "…" : passed ? "✓" : "✗"}
            </div>

            <div>
              <span
                className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold mb-3 ${
                  requiresManualReview
                    ? "bg-amber-400/10 border border-amber-400/30 text-amber-200"
                    : passed
                    ? "bg-emerald-400/10 border border-emerald-400/30 text-emerald-300"
                    : "bg-rose-400/10 border border-rose-400/30 text-rose-300"
                }`}
              >
                {requiresManualReview
                  ? "MANUAL REVIEW PENDING"
                  : passed
                    ? "ASSESSMENT PASSED"
                    : "ASSESSMENT NOT CLEARED"}
              </span>
              <h1 className="text-2xl font-bold text-white">Thank You, {submissionResult.candidateName}!</h1>
              <p className="text-xs text-slate-400 mt-1">
                {requiresManualReview
                  ? "Your responses were recorded and are awaiting evaluator review."
                  : "Your responses have been recorded and graded."}
              </p>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-3 gap-3 border-y border-white/10 py-5">
              <div>
                <p className="text-xs text-slate-400">Your Score</p>
                <p className="text-xl font-bold text-white">
                  {submissionResult.score}/{submissionResult.maxScore}
                </p>
                <p className="text-[11px] text-slate-500 font-semibold">
                  {requiresManualReview ? "Preliminary" : `${submissionResult.percentage}%`}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Pass Mark</p>
                <p className="text-xl font-bold text-slate-300">{submissionResult.passScore}%</p>
                <p className="text-[11px] text-slate-500">Threshold</p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Trust Score</p>
                <p
                  className={`text-xl font-bold ${
                    submissionResult.trustScore >= 80 ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {submissionResult.trustScore}%
                </p>
                <p className="text-[11px] text-slate-500">{submissionResult.flagsCount} flags logged</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              A copy of your results and verification details have been recorded under{" "}
              <strong className="text-slate-200">{submissionResult.candidateEmail}</strong>. You may now close this tab.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return null;
}

