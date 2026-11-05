import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Panel, Modal, StatusPill, ProgressBar, Input, Select, StarRating, Avatar, cn, EmptyState, DeleteConfirmModal } from "../components";
import type { AppData, User, Course, Chapter, ChapterFeedback, Enrollment, SkillLevel, Assessment, Attempt, ProctorCapture, Question, ArchivedRecord } from "../types";
import { isAdminRole } from "../types";
import { now, uid } from "../types";
import { toast } from "../toast";
import { apiFetch, uploadCourseFile } from "../api";
import AICopilot from "../components/AICopilot";

const demoPdfDataUrl = "data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSAvQ29udGVudHMgNCAwIFIgL1Jlc291cmNlcyA8PCAvRm9udCA8PCAvRjEgNSAwIFIgPj4gPj4gPj4KZW5kb2JqCjQgMCBvYmoKPDwgL0xlbmd0aCAxMTggPj4Kc3RyZWFtCkJUCi9GMSAyNCBUZgo3MiA3MjAgVGQKKE5hbGFuZGEgQ2hhcHRlciBQREYpIFRqCjAgLTQwIFRkCi9GMSAxNCBUZgooVXBsb2FkIGEgcGRmIGZyb20gdGhlIGFkbWluIGNvdXJzZSBlZGl0b3IgdG8gcmVwbGFjZSB0aGlzIGRlbW8gZG9jdW1lbnQuKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCjUgMCBvYmoKPDwgL1R5cGUgL0ZvbnQgL1N1YnR5cGUgL1R5cGUxIC9CYXNlRm9udCAvSGVsdmV0aWNhID4+CmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNzQgMDAwMDAgbiAKMDAwMDAwMDQ0MiAwMDAwMCBuIAp0cmFpbGVyCjw8IC9Sb290IDEgMCBSIC9TaXplIDYgPj4Kc3RhcnR4cmVmCjUxMgolJUVPRg==";

function shuffleQuestions(questions: Question[], seed: string) {
  let hash = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) || 1;
  return [...questions].sort(() => {
    hash = (hash * 9301 + 49297) % 233280;
    return hash / 233280 - 0.5;
  });
}

function formatDuration(seconds = 0) {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return hours > 0
    ? `${hours}h ${String(minutes).padStart(2, "0")}m`
    : `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function sanitizeRichText(html = "") {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}

function ProctoredAssessment({ assessment, course, chapter, currentUser, onSubmit, onCancel }: {
  assessment: Assessment; course: Course; chapter: Chapter; currentUser: User; onSubmit: (attempt: Attempt) => void; onCancel: () => void;
}) {
  const [started, setStarted] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<"Idle" | "Granted" | "Denied">("Idle");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [warnings, setWarnings] = useState(0);
  const [warningMessage, setWarningMessage] = useState("");
  const [captures, setCaptures] = useState<ProctorCapture[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState(now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const submittedRef = useRef(false);
  const assessmentRef = useRef<HTMLDivElement | null>(null);
  const openedAtRef = useRef(Date.now());
  const selectedQuestions = useMemo(() => shuffleQuestions(assessment.questions, `${assessment.id}-${currentUser.id}-${Date.now()}`).slice(0, assessment.questionLimit || 10), [assessment, currentUser.id]);
  const currentQuestion = selectedQuestions[questionIndex];

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  useEffect(() => () => stopStream(), []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - openedAtRef.current) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setPermissionStatus("Granted");
    } catch {
      setPermissionStatus("Denied");
      setWarningMessage("Camera and microphone permission is required before starting the assessment.");
    }
  };

  const enterFullscreen = async () => {
    await (assessmentRef.current || document.documentElement).requestFullscreen?.();
  };

  const start = async () => {
    if (permissionStatus !== "Granted") {
      await requestPermissions();
      return;
    }
    try {
      const res = await apiFetch(`/assessments/${assessment.id}/attempts/start`, { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.id) {
          setAttemptId(json.data.id);
        }
      }
    } catch (err) {
      console.warn("Could not start attempt on backend, falling back to local session", err);
    }
    setStartedAt(now());
    setStarted(true);
    await enterFullscreen();
  };

  const captureImage = (questionId: string) => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    // Keep proctoring capture metadata without storing heavy base64 images in localStorage
    setCaptures((items) => [
      ...items,
      {
        id: uid("CAP"),
        assessmentId: assessment.id,
        courseId: course.id,
        chapterId: chapter.id,
        userId: currentUser.id,
        questionId,
        imageDataUrl: "",
        capturedAt: now(),
      },
    ]);
  };

  useEffect(() => {
    if (!started || !currentQuestion) return;
    const timer = window.setTimeout(() => captureImage(currentQuestion.id), 3000);
    return () => window.clearTimeout(timer);
  }, [started, currentQuestion?.id]);

  const submit = async (reason: string | null = null, forcedWarnings = warnings) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const timeSpentSeconds = Math.max(1, Math.floor((Date.now() - openedAtRef.current) / 1000));
    stopStream();
    if (document.fullscreenElement) document.exitFullscreen?.();

    const currentAttemptId = attemptId || uid("ATT");
    const payload = {
      answers,
      selectedQuestionIds: selectedQuestions.map((q) => q.id),
      tabSwitchWarnings: forcedWarnings,
      autoSubmittedReason: reason,
      timeSpentSeconds,
    };

    let serverAttempt: Attempt | null = null;
    if (attemptId) {
      try {
        const res = await apiFetch(`/assessments/attempts/${attemptId}/submit`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            serverAttempt = {
              ...json.data,
              proctorCaptures: captures,
            };
          }
        }
      } catch (err) {
        console.error("Backend assessment submission failed:", err);
      }
    }

    if (serverAttempt) {
      onSubmit(serverAttempt);
    } else {
      const maxScore = selectedQuestions.reduce((sum, q) => sum + q.points, 0);
      onSubmit({
        id: currentAttemptId,
        assessmentId: assessment.id,
        chapterId: chapter.id,
        courseId: course.id,
        userId: currentUser.id,
        status: "Submitted",
        score: null,
        maxScore,
        feedback: reason ? `Auto submitted: ${reason}` : "Submitted for grading",
        answers,
        selectedQuestionIds: selectedQuestions.map((q) => q.id),
        tabSwitchWarnings: forcedWarnings,
        autoSubmittedReason: reason,
        proctorCaptures: captures,
        startedAt,
        submittedAt: now(),
        timeSpentSeconds,
      });
    }
  };

  const handleViolation = (message: string) => {
    if (!started || submittedRef.current) return;
    setWarnings((count) => {
      const next = count + 1;
      setWarningMessage(`${message} Warning ${next}/2. Assessment auto-submits after more than 2 warnings.`);
      if (attemptId) {
        apiFetch("/proctoring/events", {
          method: "POST",
          body: JSON.stringify({
            attemptId,
            eventType: message.includes("Tab") ? "TAB_SWITCH" : "FULLSCREEN_EXIT",
            severity: next > 2 ? "high" : "medium",
            metadata: { message, warningNumber: next },
          }),
        }).catch(() => {});
      }
      if (next > 2) window.setTimeout(() => submit(message, next), 0);
      return next;
    });
  };

  useEffect(() => {
    if (!started) return;
    const onVisibility = () => { if (document.hidden) handleViolation("Tab switch detected."); };
    const onBlur = () => handleViolation("Window focus changed.");
    const onFullscreen = () => { if (!document.fullscreenElement) handleViolation("Fullscreen exited."); };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("fullscreenchange", onFullscreen);
    };
  }, [started, warnings, answers, captures]);

  return (
    <motion.div ref={assessmentRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] overflow-y-auto bg-slate-950 p-4">
      <div className="mx-auto max-w-5xl">
        <video ref={videoRef} autoPlay muted playsInline className="fixed bottom-4 right-4 z-[90] h-28 w-40 rounded-2xl border border-cyan-300/30 bg-slate-900 object-cover" />
        {!started ? (
          <div className="mx-auto mt-8 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
            <StatusPill tone="amber">Proctored assessment</StatusPill>
            <h2 className="mt-4 text-3xl font-semibold text-white">{assessment.title}</h2>
            <p className="mt-2 text-slate-400">{course.title} - {chapter.title}</p>
            <p className="mt-3 text-sm text-cyan-100">Assessment timer: {formatDuration(elapsedSeconds)}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {["Camera and microphone access is mandatory.", "Assessment opens in fullscreen mode.", "Do not switch tabs, windows, or exit fullscreen.", "More than 2 violations auto-submit the attempt.", `Only ${assessment.questionLimit || 10} randomized questions are shown from the question bank.`, "A camera image is captured 3 seconds after each question appears for evaluation review."].map((rule) => <div key={rule} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-300">{rule}</div>)}
            </div>
            {warningMessage && <p className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">{warningMessage}</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={requestPermissions} className="rounded-full border border-cyan-300/30 px-5 py-3 text-sm font-bold text-cyan-100">Allow camera and mic</button>
              <button onClick={start} disabled={permissionStatus !== "Granted"} className={cn("rounded-full px-5 py-3 text-sm font-bold", permissionStatus === "Granted" ? "bg-cyan-300 text-slate-950" : "cursor-not-allowed bg-slate-700 text-slate-400")}>Start assessment</button>
              <button onClick={() => { stopStream(); onCancel(); }} className="rounded-full border border-white/10 px-5 py-3 text-sm text-slate-300">Cancel</button>
            </div>
          </div>
        ) : currentQuestion ? (
          <div className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2"><StatusPill tone="cyan">Question {questionIndex + 1}/{selectedQuestions.length}</StatusPill><StatusPill tone={warnings > 0 ? "amber" : "green"}>Warnings {warnings}/2</StatusPill></div>
              <StatusPill tone="violet">Time {formatDuration(elapsedSeconds)}</StatusPill>
              <button onClick={() => submit(null)} className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-bold text-slate-950">Submit assessment</button>
            </div>
            {warningMessage && <p className="mb-5 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">{warningMessage}</p>}
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{currentQuestion.points} points</p>
              <h3 className="mt-3 text-xl font-semibold text-white">{currentQuestion.prompt}</h3>
              {currentQuestion.type === "MCQ" ? <div className="mt-5 grid gap-3">{currentQuestion.options?.map((option, index) => <label key={option} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 p-4 text-slate-300 hover:bg-white/5"><input type="radio" name={currentQuestion.id} checked={answers[currentQuestion.id] === index} onChange={() => setAnswers({ ...answers, [currentQuestion.id]: index })} />{option}</label>)}</div> : <textarea value={String(answers[currentQuestion.id] || "")} onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })} className="mt-5 min-h-32 w-full rounded-2xl border border-white/10 bg-slate-950 p-4 text-white" />}
            </div>
            <div className="mt-6 flex justify-between gap-3">
              <button disabled={questionIndex === 0} onClick={() => setQuestionIndex((i) => Math.max(0, i - 1))} className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-slate-300 disabled:opacity-40">Previous</button>
              {questionIndex < selectedQuestions.length - 1 ? <button onClick={() => setQuestionIndex((i) => i + 1)} className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-950">Next question</button> : <button onClick={() => submit(null)} className="rounded-full bg-emerald-300 px-5 py-2.5 text-sm font-bold text-slate-950">Finish and submit</button>}
            </div>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

function ChapterPlayer({ course, chapters, enrollment, assessments, attempts, feedbacks, currentUser, onProgress, onChapterTime, onFeedback, onAttempt, onClose }: {
  course: Course; chapters: Chapter[]; enrollment?: Enrollment; assessments: Assessment[]; attempts: Attempt[]; feedbacks: ChapterFeedback[];
  currentUser: User; onProgress: (chId: string, seconds: number) => void; onChapterTime: (chId: string, seconds: number) => void; onFeedback: (fb: ChapterFeedback) => void; onAttempt: (att: Attempt) => void; onClose: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [pdfZoom, setPdfZoom] = useState(1);
  const [pdfOpenedAt, setPdfOpenedAt] = useState<number | null>(null);
  const [pdfElapsedSeconds, setPdfElapsedSeconds] = useState(0);
  const [authorizedPdfUrl, setAuthorizedPdfUrl] = useState("");
  const [, setTimerTick] = useState(0);
  const [chapterSeconds, setChapterSeconds] = useState<Record<string, number>>(() => ({ ...(enrollment?.chapterTimeSpentSeconds || {}) }));
  const [fbForm, setFbForm] = useState({ rating: 0, clarity: 0, relevance: 0, comments: "" });
  const videoRef = useRef<HTMLVideoElement>(null);
  const activeChapterIdRef = useRef<string | null>(null);
  const activeStartedAtRef = useRef<number | null>(null);

  const ch = chapters[idx];
  if (!ch) return null;
  const isCompleted = enrollment?.completedChapters.includes(ch.id);
  const hasFeedback = feedbacks.some((f) => f.chapterId === ch.id && f.userId === currentUser.id);
  const chAssessment = assessments.find((a: any) => a.chapterId === ch.id && a.approval === "Approved");
  const hasAttempt = attempts.some((a: any) => a.chapterId === ch.id && a.userId === currentUser.id && (a.status === "Passed" || a.status === "Submitted"));
  const pdfSource = authorizedPdfUrl || (ch.url?.startsWith("data:application/pdf") ? ch.url : demoPdfDataUrl);
  const pdfViewerSource = `${pdfSource}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
  const requiredSeconds = Math.max(0, Math.round((ch.minimumTimeMinutes ?? ch.durationMinutes ?? 0) * 60));
  const visibleElapsed = activeChapterIdRef.current === ch.id && activeStartedAtRef.current && !document.hidden ? Math.floor((Date.now() - activeStartedAtRef.current) / 1000) : 0;
  const currentChapterSeconds = (chapterSeconds[ch.id] || 0) + visibleElapsed;
  const minimumMet = isCompleted || currentChapterSeconds >= requiredSeconds;

  const flushActiveTime = (pause = false, persist = true) => {
    const activeId = activeChapterIdRef.current;
    const startedAt = activeStartedAtRef.current;
    if (!activeId || !startedAt) return 0;
    const deltaSeconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
    if (deltaSeconds > 0) {
      setChapterSeconds((current) => {
        return { ...current, [activeId]: (current[activeId] || 0) + deltaSeconds };
      });
      if (persist) onChapterTime(activeId, deltaSeconds);
    }
    activeStartedAtRef.current = pause ? null : Date.now();
    return deltaSeconds;
  };

  const switchChapter = (nextIdx: number) => {
    flushActiveTime(true);
    setIdx(nextIdx);
  };

  const closePlayer = () => {
    flushActiveTime(true);
    onClose();
  };

  useEffect(() => {
    setChapterSeconds((current) => ({ ...(enrollment?.chapterTimeSpentSeconds || {}), ...current }));
  }, [enrollment?.id]);

  useEffect(() => {
    if (!ch || isCompleted) {
      activeChapterIdRef.current = null;
      activeStartedAtRef.current = null;
      return;
    }
    activeChapterIdRef.current = ch.id;
    activeStartedAtRef.current = Date.now();
    return () => { flushActiveTime(true); };
  }, [ch.id, isCompleted]);

  useEffect(() => {
    const timer = window.setInterval(() => setTimerTick((tick) => tick + 1), 1000);
    const onVisibility = () => {
      if (document.hidden) flushActiveTime(true);
      else if (activeChapterIdRef.current && !isCompleted) activeStartedAtRef.current = Date.now();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      flushActiveTime(true);
    };
  }, [isCompleted]);

  useEffect(() => {
    if (!showPdf || !pdfOpenedAt) return;
    const interval = window.setInterval(() => {
      setPdfElapsedSeconds(Math.floor((Date.now() - pdfOpenedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [showPdf, pdfOpenedAt]);

  // Video progress tracking via API
  useEffect(() => {
    if (!ch || !ch.contentType.includes("Video")) return;
    
    // Fetch last saved progress
    apiFetch(`/courses/${course.id}/chapters/${ch.id}/progress`)
      .then((res) => { if (res.ok) return res.json(); throw new Error(); })
      .then((data) => {
        if (data.currentTime && videoRef.current) {
          videoRef.current.currentTime = data.currentTime;
        }
      })
      .catch(() => {});

    // Save progress every 30 seconds
    const intervalId = window.setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        apiFetch(`/courses/${course.id}/chapters/${ch.id}/progress`, {
          method: "POST",
          body: JSON.stringify({ currentTime: videoRef.current.currentTime }),
        }).catch(() => {});
      }
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [ch, course.id]);

  const completeChapter = () => {
    if (!minimumMet) return;
    const deltaSeconds = flushActiveTime(true, false);
    onProgress(ch.id, deltaSeconds);
    if (chAssessment && !hasAttempt) {
      setShowAssessment(true);
    }
  };
  const submitFeedback = () => {
    if (fbForm.rating === 0) return;
    onFeedback({ id: uid("CF"), chapterId: ch.id, courseId: course.id, userId: currentUser.id, rating: fbForm.rating, clarity: fbForm.clarity || fbForm.rating, relevance: fbForm.relevance || fbForm.rating, comments: fbForm.comments, submittedAt: now() });
    setShowFeedback(false);
    setFbForm({ rating: 0, clarity: 0, relevance: 0, comments: "" });
  };
  const openPdfViewer = async () => {
    try {
      const response = await apiFetch(`/content/${course.id}/${ch.id}/url`);
      if (!response.ok) throw new Error();
      const result = await response.json();
      setAuthorizedPdfUrl(result.url);
    } catch {
      if (!ch.url?.startsWith("data:application/pdf")) {
        toast("This document is unavailable or you no longer have access");
        return;
      }
      setAuthorizedPdfUrl(ch.url);
    }
    setPdfElapsedSeconds(0);
    setPdfOpenedAt(Date.now());
    setPdfZoom(1);
    setShowPdf(true);
  };
  const closePdfViewer = () => {
    setShowPdf(false);
    setPdfOpenedAt(null);
    setPdfElapsedSeconds(0);
    setAuthorizedPdfUrl("");
  };
  const formatTimer = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <Modal title={course.title} onClose={closePlayer} wide>
      <div className="grid gap-6 lg:grid-cols-[0.3fr_0.7fr]">
        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">Chapters ({chapters.length})</p>
          {chapters.map((c, i) => {
            const done = enrollment?.completedChapters.includes(c.id);
            return (
              <button key={c.id} onClick={() => switchChapter(i)} className={cn("w-full rounded-2xl border p-3 text-left transition", i === idx ? "border-cyan-300/50 bg-cyan-300/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]")}>
                <div className="flex items-center gap-2">
                  <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold", done ? "bg-emerald-400 text-slate-950" : "bg-white/10 text-slate-400")}>{done ? "✓" : c.sequence}</span>
                  <span className="truncate text-sm font-medium text-white">{c.title}</span>
                </div>
                <p className="mt-1 pl-8 text-xs text-slate-500">{c.contentType} · {c.durationMinutes}m</p>
              </button>
            );
          })}
          <div className="mt-4 rounded-2xl border border-white/10 p-3">
            <p className="mb-2 text-sm text-slate-400">Progress</p>
            <ProgressBar value={enrollment?.progress || 0} tone={enrollment?.progress === 100 ? "green" : "cyan"} />
            <p className="mt-1 text-xs text-slate-500">{enrollment?.progress || 0}% complete</p>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <StatusPill tone="cyan">{ch.contentType}</StatusPill>
            <StatusPill>Ch {ch.sequence}</StatusPill>
            {isCompleted && <StatusPill tone="green">Completed</StatusPill>}
            {hasFeedback && <StatusPill tone="violet">Feedback submitted</StatusPill>}
            {hasAttempt && <StatusPill tone="green">Assessment passed</StatusPill>}
            <StatusPill tone={minimumMet ? "green" : "amber"}>Time {formatDuration(currentChapterSeconds)} / {formatDuration(requiredSeconds)}</StatusPill>
          </div>
          <h3 className="text-2xl font-semibold text-white">{ch.title}</h3>
          <p className="mt-2 text-sm text-slate-400">{ch.description}</p>
          {!minimumMet && (
            <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
              <p className="text-sm font-semibold text-amber-100">Minimum chapter time required before completion</p>
              <div className="mt-3"><ProgressBar value={requiredSeconds ? Math.min(100, Math.round((currentChapterSeconds / requiredSeconds) * 100)) : 100} tone="amber" /></div>
              <p className="mt-2 text-xs text-amber-100/80">{formatDuration(Math.max(0, requiredSeconds - currentChapterSeconds))} remaining before Mark complete and Next chapter are enabled.</p>
            </div>
          )}
          <div
            className="chapter-rich-text mt-6 min-h-[120px] rounded-2xl border border-white/10 bg-slate-900/50 p-6 text-slate-300"
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(ch.body) }}
          />
          {ch.contentType === "PDF" && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">{ch.fileName || "Chapter PDF"}</p>
                  <p className="text-xs text-slate-400">View the chapter document in focus mode.</p>
                </div>
                <button
                  onClick={openPdfViewer}
                  className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-200"
                >
                  View
                </button>
              </div>
            </div>
          )}
          {ch.contentType.includes("Video") && (
            <div className="mt-4 aspect-video overflow-hidden rounded-2xl border border-white/10 bg-slate-900 relative group">
              {ch.url ? (
                <video ref={videoRef} className="h-full w-full object-contain" src={ch.url} controls controlsList="nodownload" />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">🎬 Video: {ch.fileName}</div>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {!isCompleted && <button onClick={completeChapter} disabled={!minimumMet} className={cn("rounded-full px-5 py-2.5 text-sm font-bold", minimumMet ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950" : "cursor-not-allowed bg-slate-700 text-slate-400")}>Mark complete</button>}
            {isCompleted && !hasFeedback && <button onClick={() => setShowFeedback(true)} className="rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-500 px-5 py-2.5 text-sm font-bold text-slate-950">Submit feedback ★</button>}
            {isCompleted && chAssessment && !hasAttempt && <button onClick={() => setShowAssessment(true)} className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-sm font-bold text-slate-950">Take assessment</button>}
            {idx < chapters.length - 1 && <button onClick={() => switchChapter(idx + 1)} disabled={!minimumMet} className={cn("rounded-full border px-5 py-2.5 text-sm font-semibold", minimumMet ? "border-white/10 text-slate-200 hover:bg-white/5" : "cursor-not-allowed border-white/5 text-slate-600")}>Next chapter</button>}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showFeedback && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl">
              <h3 className="text-xl font-semibold text-white mb-4">Chapter feedback — {ch.title}</h3>
              <div className="space-y-4">
                <div><p className="text-sm text-slate-400 mb-1">Overall rating</p><StarRating value={fbForm.rating} onChange={(v) => setFbForm({ ...fbForm, rating: v })} /></div>
                <div><p className="text-sm text-slate-400 mb-1">Clarity</p><StarRating value={fbForm.clarity} onChange={(v) => setFbForm({ ...fbForm, clarity: v })} /></div>
                <div><p className="text-sm text-slate-400 mb-1">Relevance</p><StarRating value={fbForm.relevance} onChange={(v) => setFbForm({ ...fbForm, relevance: v })} /></div>
                <label className="block text-sm text-slate-400">Comments
                  <textarea value={fbForm.comments} onChange={(e) => setFbForm({ ...fbForm, comments: e.target.value })} className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-900 p-3 text-white min-h-[80px]" />
                </label>
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={submitFeedback} className="rounded-full bg-violet-400 px-5 py-2.5 text-sm font-bold text-slate-950">Submit</button>
                <button onClick={() => setShowFeedback(false)} className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-slate-300">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showAssessment && chAssessment && (
          <ProctoredAssessment assessment={chAssessment} course={course} chapter={ch} currentUser={currentUser} onSubmit={(attempt) => { onAttempt(attempt); setShowAssessment(false); }} onCancel={() => setShowAssessment(false)} />
        )}
        {showPdf && ch.contentType === "PDF" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-slate-950/95 p-3 backdrop-blur-xl md:p-5">
            <div className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{ch.fileName || ch.title}</p>
                  <p className="text-xs text-slate-400">Viewing time {formatTimer(pdfElapsedSeconds)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPdfZoom((z) => Math.max(0.75, +(z - 0.1).toFixed(2)))} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-lg font-semibold text-slate-200 hover:bg-white/5" title="Zoom out">-</button>
                  <span className="w-14 text-center text-xs font-semibold text-slate-300">{Math.round(pdfZoom * 100)}%</span>
                  <button onClick={() => setPdfZoom((z) => Math.min(1.8, +(z + 0.1).toFixed(2)))} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-lg font-semibold text-slate-200 hover:bg-white/5" title="Zoom in">+</button>
                  <button onClick={closePdfViewer} className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-200">Close</button>
                </div>
              </div>
              <div className="flex-1 overflow-auto bg-slate-900 p-4">
                <div className="mx-auto h-full min-h-[70vh] origin-top rounded-xl bg-white shadow-2xl transition-transform" style={{ transform: `scale(${pdfZoom})`, width: `${100 / pdfZoom}%` }}>
                  <iframe title={ch.title} src={pdfViewerSource} className="h-full min-h-[70vh] w-full rounded-xl border-0" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* AI Copilot — context-aware for this chapter */}
      <AICopilot
        isOpen={copilotOpen}
        onToggle={() => setCopilotOpen(o => !o)}
        context={{
          courseTitle: course.title,
          chapterTitle: ch.title,
          chapterBody: ch.body,
        }}
      />
    </Modal>
  );
}

export default function Courses({ data, currentUser, setData }: { data: AppData; currentUser: User; setData: (d: AppData) => void }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [playCourse, setPlayCourse] = useState<Course | null>(null);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [assignCourse, setAssignCourse] = useState<Course | null>(null);
  const [skillFilter, setSkillFilter] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [form, setForm] = useState({ title: "", description: "", skillId: data.skills[0]?.id || "", category: "Technical", tags: "", targetLevel: "Beginner" as SkillLevel, difficulty: "Beginner" as Course["difficulty"], estimatedHours: "4" });
  const [editForm, setEditForm] = useState({ title: "", description: "", skillId: "", category: "", tags: "", targetLevel: "Beginner" as SkillLevel, difficulty: "Beginner" as Course["difficulty"], estimatedHours: "4" });
  const [chapterForm, setChapterForm] = useState({ id: "", title: "", description: "", contentType: "Rich Text" as Chapter["contentType"], body: "", url: "", fileName: "", durationMinutes: "20", minimumTimeMinutes: "15" });
  const [assignmentForm, setAssignmentForm] = useState({ dueAt: "", priority: "High" as Enrollment["priority"], mandatory: true });

  const teamIds = data.users.filter((u) => u.managerId === currentUser.id).map((u) => u.id);
  const addAudit = (d: AppData, action: string, entity: string): AppData => ({ ...d, audit: [{ id: uid("AUD"), actorId: currentUser.id, action, entity, at: now() }, ...d.audit] });

  // Employee sees only assigned approved courses. Manager/Admin sees all.
  const visible = data.courses.filter((c) => {
    if (currentUser.role === "Employee") return data.enrollments.some((e) => e.userId === currentUser.id && e.courseId === c.id) && c.approval === "Approved" && c.status === "Active";
    return skillFilter === "All" || c.skillIds?.includes(skillFilter) || data.skills.find((skill) => skill.id === skillFilter)?.name === c.skill;
  });

  const candidates = data.users.filter((u) => !isAdminRole(u.role) && u.status === "Active" && (isAdminRole(currentUser.role) || teamIds.includes(u.id) || u.id === currentUser.id));

  const resetChapterForm = () => setChapterForm({ id: "", title: "", description: "", contentType: "Rich Text", body: "", url: "", fileName: "", durationMinutes: "20", minimumTimeMinutes: "15" });

  const openEditor = (course: Course) => {
    const skill = data.skills.find((item) => course.skillIds?.includes(item.id) || item.name === course.skill);
    setEditCourse(course);
    setEditForm({
      title: course.title,
      description: course.description,
      skillId: skill?.id || data.skills[0]?.id || "",
      category: course.category,
      tags: course.tags.join(", "),
      targetLevel: course.targetLevel,
      difficulty: course.difficulty,
      estimatedHours: String(course.estimatedHours),
    });
    resetChapterForm();
  };

  const getReadiness = (course: Course) => {
    const chapters = data.chapters.filter((chapter) => chapter.courseId === course.id);
    const assessments = data.assessments.filter((assessment) => assessment.courseId === course.id);
    const hasApprovedAssessment = assessments.some((assessment) => assessment.approval === "Approved");
    const issues = [
      !course.skillIds?.length ? "Map at least one skill" : "",
      chapters.length === 0 ? "Add at least one chapter" : "",
      assessments.length === 0 ? "Create an assessment" : "",
      assessments.length > 0 && !hasApprovedAssessment ? "Approve at least one assessment" : "",
    ].filter(Boolean);
    return { chapters, assessments, issues, ready: issues.length === 0 };
  };

  const saveCourse = () => {
    const selectedSkill = data.skills.find((skill) => skill.id === form.skillId);
    if (!selectedSkill) return;
    apiFetch("/courses", {
      method: "POST",
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        skill: selectedSkill.name,
        skillIds: [selectedSkill.id],
        targetLevel: form.targetLevel,
        difficulty: form.difficulty,
        estimatedHours: Number(form.estimatedHours),
        category: form.category,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        contentTypes: ["Rich Text"]
      })
    })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((resData) => {
        const c = resData.data;
        setData(addAudit({ ...data, courses: [c, ...data.courses] }, "Created course", c.id));
        setCreateOpen(false);
        setForm({ title: "", description: "", skillId: data.skills[0]?.id || "", category: "Technical", tags: "", targetLevel: "Beginner", difficulty: "Beginner", estimatedHours: "4" });
        toast("Course created successfully");
      })
      .catch(() => toast("Failed to create course"));
  };

  const approve = (id: string) => {
    const course = data.courses.find((c) => c.id === id);
    if (!course || !getReadiness(course).ready) return;
    apiFetch(`/courses/${id}/approval`, {
      method: "PATCH",
      body: JSON.stringify({ approval: "Approved" })
    })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((resData) => {
        setData(addAudit({ ...data, courses: data.courses.map((c) => c.id === id ? resData.data : c) }, "Approved course", id));
        toast("Course approved successfully");
      })
      .catch(() => toast("Failed to approve course"));

  };
  const reject = (id: string) => {
    apiFetch(`/courses/${id}/approval`, {
      method: "PATCH",
      body: JSON.stringify({ approval: "Rejected" })
    })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((resData) => {
        setData(addAudit({ ...data, courses: data.courses.map((c) => c.id === id ? resData.data : c) }, "Rejected course", id));
        toast("Course rejected");
      })
      .catch(() => toast("Failed to reject course"));
  };

  const toggleCourseStatus = (course: Course) => {
    const newStatus = course.status === "Active" ? "Inactive" : "Active";
    apiFetch(`/courses/${course.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus })
    })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((resData) => {
        setData(addAudit({
          ...data,
          courses: data.courses.map((c) => c.id === course.id ? resData.data : c),
        }, newStatus === "Inactive" ? "Deactivated course" : "Activated course", course.id));
        toast(newStatus === "Inactive" ? "Course deactivated successfully" : "Course activated successfully");
      })
      .catch(() => toast("Failed to update status"));
  };

  const handleDeleteCourse = (comment: string) => {
    if (!deleteTarget) return;
    apiFetch(`/courses/${deleteTarget.id}`, {
      method: "DELETE",
      body: JSON.stringify({ deletionComment: comment })
    })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then(() => {
    const relatedChapters = data.chapters.filter((ch) => ch.courseId === deleteTarget.id);
    const relatedAssessments = data.assessments.filter((a) => a.courseId === deleteTarget.id);
    const relatedEnrollments = data.enrollments.filter((e) => e.courseId === deleteTarget.id);
    const archived: ArchivedRecord = {
      id: uid("ARC"),
      entityType: "Course",
      entityId: deleteTarget.id,
      entityData: { ...deleteTarget },
      relatedData: {
        chapters: relatedChapters,
        assessments: relatedAssessments,
        enrollments: relatedEnrollments,
      },
      deletedBy: currentUser.id,
      deletedByName: currentUser.name,
      deletionComment: comment,
      deletedAt: now(),
    };
    setData(addAudit({
      ...data,
      courses: data.courses.filter((c) => c.id !== deleteTarget.id),
      chapters: data.chapters.filter((ch) => ch.courseId !== deleteTarget.id),
      assessments: data.assessments.filter((a) => a.courseId !== deleteTarget.id),
      enrollments: data.enrollments.filter((e) => e.courseId !== deleteTarget.id),
      archive: [archived, ...(data.archive || [])],
    }, "Permanently deleted course", deleteTarget.id));
    setDeleteTarget(null);
        toast("Course deleted successfully");
      })
      .catch(() => toast("Failed to delete course"));
  };
  const saveCourseEdits = () => {
    if (!editCourse) return;
    const selectedSkill = data.skills.find((skill) => skill.id === editForm.skillId);
    if (!selectedSkill) return;
    apiFetch(`/courses/${editCourse.id}`, {
      method: "PUT",
      body: JSON.stringify({
        title: editForm.title,
        description: editForm.description,
        skill: selectedSkill.name,
        skillIds: [selectedSkill.id],
        targetLevel: editForm.targetLevel,
        category: editForm.category,
        tags: editForm.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        difficulty: editForm.difficulty,
        estimatedHours: Number(editForm.estimatedHours),
      })
    })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((resData) => {
        setData(addAudit({
          ...data,
          courses: data.courses.map((course) => course.id === editCourse.id ? resData.data : course),
        }, "Updated course", editCourse.id));
        toast("Course updated successfully");
      })
      .catch(() => toast("Failed to update course"));
  };

  const saveChapter = () => {
    if (!editCourse || !chapterForm.title.trim()) return;
    const isEditing = Boolean(chapterForm.id);
    const existingChapter = isEditing ? data.chapters.find((chapter) => chapter.id === chapterForm.id) : undefined;
    const url = isEditing ? `/courses/${editCourse.id}/chapters/${chapterForm.id}` : `/courses/${editCourse.id}/chapters`;
    apiFetch(url, {
      method: isEditing ? "PUT" : "POST",
      body: JSON.stringify({
        courseVersion: editCourse.version,
        ...(isEditing ? { chapterVersion: existingChapter?.version } : {}),
        title: chapterForm.title,
        description: chapterForm.description,
        contentType: chapterForm.contentType,
        body: chapterForm.body,
        url: chapterForm.url || undefined,
        fileName: chapterForm.fileName || undefined,
        durationMinutes: Number(chapterForm.durationMinutes),
        minimumTimeMinutes: Number(chapterForm.minimumTimeMinutes) || Number(chapterForm.durationMinutes) || 1,
      })
    })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((resData) => {
        const chapter = resData.data;
        const courseVersion = Number(resData.courseVersion || editCourse.version);
        const chapters = isEditing
          ? data.chapters.map((item) => item.id === chapter.id ? chapter : item)
          : [...data.chapters, chapter];
        const courses = data.courses.map((course) => course.id === editCourse.id ? { ...course, version: courseVersion } : course);
        setEditCourse((current) => current ? { ...current, version: courseVersion } : current);
        setData(addAudit({ ...data, chapters, courses }, isEditing ? "Updated chapter" : "Created chapter", chapter.id));
        resetChapterForm();
        toast(isEditing ? "Chapter updated successfully" : "Chapter created successfully");
      })
      .catch(() => toast("Failed to save chapter"));
  };

  const editChapter = (chapter: Chapter) => {
    setChapterForm({
      id: chapter.id,
      title: chapter.title,
      description: chapter.description,
      contentType: chapter.contentType,
      body: chapter.body,
      url: chapter.url || "",
      fileName: chapter.fileName || "",
      durationMinutes: String(chapter.durationMinutes),
      minimumTimeMinutes: String(chapter.minimumTimeMinutes ?? chapter.durationMinutes),
    });
  };

  const handlePdfUpload = async (file: File) => {
    if (!editCourse) return;
    try {
      const result = await uploadCourseFile(editCourse.id, file, "chapter_pdf");
      setChapterForm((current) => ({ ...current, fileName: file.name, url: result.key }));
      toast("PDF uploaded securely");
    } catch {
      toast("PDF upload failed");
    }
  };

  const assign = (courseId: string, userId: string) => {
    if (data.enrollments.some((e) => e.courseId === courseId && e.userId === userId)) return;
    apiFetch("/assignments", {
      method: "POST",
      body: JSON.stringify({
        courseId,
        userIds: [userId],
        dueAt: assignmentForm.dueAt || null,
        priority: assignmentForm.priority,
        mandatory: assignmentForm.mandatory
      })
    })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((resData) => {
        setData(addAudit({ ...data, enrollments: [...resData.data, ...data.enrollments] }, "Assigned course", `${courseId}→${userId}`));
        toast("Course assigned successfully");
      })
      .catch(() => toast("Failed to assign course"));
  };

  const handleProgress = (chId: string, seconds: number) => {
    if (!playCourse) return;
    const chapters = data.chapters.filter((c) => c.courseId === playCourse.id);
    const existing = data.enrollments.find((e) => e.courseId === playCourse.id && e.userId === currentUser.id);
    const completed = new Set(existing?.completedChapters || []);
    completed.add(chId);
    const progress = Math.round((completed.size / chapters.length) * 100);
    const enrollments = existing
      ? data.enrollments.map((e) => e.id === existing.id ? {
        ...e,
        progress,
        completedChapters: Array.from(completed),
        timeSpentSeconds: (e.timeSpentSeconds || 0) + seconds,
        timeSpentMinutes: Math.ceil(((e.timeSpentSeconds || 0) + seconds) / 60),
        chapterTimeSpentSeconds: seconds > 0 ? { ...(e.chapterTimeSpentSeconds || {}), [chId]: ((e.chapterTimeSpentSeconds || {})[chId] || 0) + seconds } : e.chapterTimeSpentSeconds,
        completedAt: progress >= 100 ? now() : e.completedAt,
      } : e)
      : [{ id: uid("ENR"), courseId: playCourse.id, userId: currentUser.id, assignedBy: currentUser.id, dueAt: null, priority: "Medium" as const, mandatory: false, progress, completedChapters: Array.from(completed), timeSpentMinutes: Math.ceil(seconds / 60), timeSpentSeconds: seconds, chapterTimeSpentSeconds: seconds > 0 ? { [chId]: seconds } : {}, startedAt: now(), completedAt: progress >= 100 ? now() : null }, ...data.enrollments];
    setData(addAudit({ ...data, enrollments }, "Completed chapter", chId));
    if (seconds > 0) {
      apiFetch(`/courses/${playCourse.id}/chapters/${chId}/time`, {
        method: "POST",
        body: JSON.stringify({ seconds }),
      }).catch(() => {});
    }
  };
  const handleChapterTime = (chId: string, seconds: number) => {
    if (!playCourse) return;
    if (seconds <= 0) return;
    const existing = data.enrollments.find((e) => e.courseId === playCourse.id && e.userId === currentUser.id);
    const enrollments = existing
      ? data.enrollments.map((e) => e.id === existing.id ? {
        ...e,
        timeSpentSeconds: (e.timeSpentSeconds || 0) + seconds,
        timeSpentMinutes: Math.ceil(((e.timeSpentSeconds || 0) + seconds) / 60),
        chapterTimeSpentSeconds: { ...(e.chapterTimeSpentSeconds || {}), [chId]: ((e.chapterTimeSpentSeconds || {})[chId] || 0) + seconds },
      } : e)
      : [{ id: uid("ENR"), courseId: playCourse.id, userId: currentUser.id, assignedBy: currentUser.id, dueAt: null, priority: "Medium" as const, mandatory: false, progress: 0, completedChapters: [], timeSpentMinutes: Math.ceil(seconds / 60), timeSpentSeconds: seconds, chapterTimeSpentSeconds: { [chId]: seconds }, startedAt: now(), completedAt: null }, ...data.enrollments];
    setData({ ...data, enrollments });
    apiFetch(`/courses/${playCourse.id}/chapters/${chId}/time`, {
      method: "POST",
      body: JSON.stringify({ seconds }),
    }).catch(() => {});
  };
  const handleFeedback = (fb: ChapterFeedback) => {
    apiFetch("/chapter-feedbacks", {
      method: "POST",
      body: JSON.stringify({
        chapterId: fb.chapterId,
        courseId: fb.courseId,
        rating: fb.rating,
        clarity: fb.clarity,
        relevance: fb.relevance,
        comments: fb.comments
      })
    })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((resData) => {
        setData(addAudit({ ...data, chapterFeedbacks: [resData.data, ...data.chapterFeedbacks] }, "Submitted feedback", fb.chapterId));
        toast("Feedback submitted successfully");
      })
      .catch(() => toast("Failed to submit feedback"));
  };

  const handleAttempt = (att: any) => {
    apiFetch(`/assessments/${att.assessmentId}/attempts/start`, { method: "POST" })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((startData) => {
        const attemptId = startData.data.id;
        return apiFetch(`/assessments/attempts/${attemptId}/submit`, {
          method: "POST",
          body: JSON.stringify({
            answers: att.answers,
            selectedQuestionIds: att.selectedQuestionIds,
            tabSwitchWarnings: att.tabSwitchWarnings,
            autoSubmittedReason: att.autoSubmittedReason,
            timeSpentSeconds: att.timeSpentSeconds
          })
        });
      })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((submitData) => {
        const serverAttempt = submitData.data;
        const next = addAudit({ ...data, attempts: [serverAttempt, ...data.attempts] }, "Submitted assessment", serverAttempt.assessmentId);
        
        const assessmentSeconds = serverAttempt.timeSpentSeconds || 0;
        if (assessmentSeconds > 0) {
          next.enrollments = next.enrollments.map((enrollment) => enrollment.courseId === serverAttempt.courseId && enrollment.userId === serverAttempt.userId ? {
            ...enrollment,
            timeSpentSeconds: (enrollment.timeSpentSeconds || 0) + assessmentSeconds,
            timeSpentMinutes: Math.ceil(((enrollment.timeSpentSeconds || 0) + assessmentSeconds) / 60),
          } : enrollment);
        }
        
        if (serverAttempt.status === "Passed" || serverAttempt.status === "Submitted") {
          const skill = data.courses.find((c) => c.id === serverAttempt.courseId)?.skill;
          if (skill) {
            const existing = next.skillRatings.find((r) => r.userId === currentUser.id && r.skill === skill);
            if (existing) {
              next.skillRatings = next.skillRatings.map((r) => r.id === existing.id ? { ...r, score: Math.min(100, Math.round((r.score * r.assessmentsBased + serverAttempt.score) / (r.assessmentsBased + 1))), assessmentsBased: r.assessmentsBased + 1, trend: "up" as const, lastUpdated: now() } : r);
            } else {
              next.skillRatings = [{ id: uid("SK"), userId: currentUser.id, skill, score: serverAttempt.score || 0, assessmentsBased: 1, trend: "up" as const, lastUpdated: now() }, ...next.skillRatings];
            }
          }
        }
        setData(next);
        toast("Assessment attempt submitted successfully");
      })
      .catch((err) => {
        console.error("Error submitting assessment:", err);
        toast("Failed to submit assessment to server");
      });
  };

  return (
    <div className="space-y-6">
      <Panel title={currentUser.role === "Employee" ? "My assigned courses" : "Course management"} kicker="Courses"
        action={currentUser.role !== "Employee" ? <button onClick={() => setCreateOpen(true)} className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-sm font-bold text-slate-950">Create course</button> : null}>
        {currentUser.role !== "Employee" && (
          <div className="mb-5 flex flex-wrap gap-2">
            <button onClick={() => setSkillFilter("All")} className={cn("rounded-full px-4 py-2 text-xs font-semibold transition", skillFilter === "All" ? "bg-white text-slate-950" : "border border-white/10 text-slate-300 hover:bg-white/5")}>All skills</button>
            {data.skills.filter((skill) => skill.status === "Active").map((skill) => (
              <button key={skill.id} onClick={() => setSkillFilter(skill.id)} className={cn("rounded-full px-4 py-2 text-xs font-semibold transition", skillFilter === skill.id ? "bg-cyan-300 text-slate-950" : "border border-white/10 text-slate-300 hover:bg-white/5")}>{skill.name}</button>
            ))}
          </div>
        )}
        {visible.length === 0 ? <EmptyState title="No courses" description="No courses available yet." /> : (
          <div className="grid gap-4">
            {visible.map((c) => {
              const chs = data.chapters.filter((ch) => ch.courseId === c.id);
              const enrs = data.enrollments.filter((e) => e.courseId === c.id);
              const avgProg = enrs.length ? Math.round(enrs.reduce((s, e) => s + e.progress, 0) / enrs.length) : 0;
              const readiness = getReadiness(c);
              return (
                <article key={c.id} className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20">
                  <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <StatusPill tone="cyan">{c.id}</StatusPill>
                        <StatusPill tone={c.approval === "Approved" ? "green" : c.approval === "Rejected" ? "red" : "amber"}>{c.approval}</StatusPill>
                        <StatusPill tone={readiness.ready ? "green" : "red"}>{readiness.ready ? "Ready" : "Needs setup"}</StatusPill>
                        <StatusPill tone="violet">{c.difficulty}</StatusPill>
                        <StatusPill>{chs.length} chapters</StatusPill>
                        {c.status === "Inactive" && <StatusPill tone="red">Inactive</StatusPill>}
                      </div>
                      <h3 className="mt-4 text-xl font-semibold text-white">{c.title}</h3>
                      <p className="mt-2 text-sm text-slate-400 leading-6">{c.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">{c.tags.map((t) => <span key={t} className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">{t}</span>)}</div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm text-slate-400"><span>{enrs.length} enrolled</span><span>{avgProg}%</span></div>
                      <ProgressBar value={avgProg} tone={avgProg > 75 ? "green" : "amber"} />
                      <p className="text-xs text-slate-500">Skill: {c.skill} · {c.estimatedHours}h · v{c.version}</p>
                      {!readiness.ready && <p className="text-xs leading-5 text-amber-200">Approval blocked: {readiness.issues.join(", ")}</p>}
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => setPlayCourse(c)} className="action-btn rounded-full bg-cyan-300 px-3 py-2 text-xs font-bold text-slate-950">Open</button>
                        {currentUser.role !== "Employee" && <>
                          <button onClick={() => openEditor(c)} className="action-btn rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-violet-100">Edit course</button>
                          <button onClick={() => setAssignCourse(c)} className="action-btn rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-cyan-100">Assign</button>
                        </>}
                        {isAdminRole(currentUser.role) && <button onClick={() => toggleCourseStatus(c)} className={cn("action-btn rounded-full border px-3 py-2 text-xs font-semibold", c.status === "Active" ? "border-amber-300/30 text-amber-200" : "border-emerald-300/30 text-emerald-200")}>{c.status === "Active" ? "Deactivate" : "Activate"}</button>}
                        {isAdminRole(currentUser.role) && c.approval === "Pending" && <>
                          <button disabled={!readiness.ready} onClick={() => approve(c.id)} className={cn("action-btn rounded-full px-3 py-2 text-xs font-bold", readiness.ready ? "bg-emerald-300 text-slate-950" : "cursor-not-allowed border border-white/10 text-slate-500")}>Approve</button>
                          <button onClick={() => reject(c.id)} className="action-btn rounded-full bg-rose-300 px-3 py-2 text-xs font-bold text-slate-950">Reject</button>
                        </>}
                        {currentUser.role === "Super Admin" && <button onClick={() => setDeleteTarget(c)} className="action-btn rounded-full border border-rose-300/30 bg-rose-300/10 px-3 py-2 text-xs font-semibold text-rose-200">Delete</button>}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Panel>

      <AnimatePresence>
        {createOpen && (
          <Modal title="Create course" onClose={() => setCreateOpen(false)}>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
              <label className="space-y-2 text-sm text-slate-400"><span>Mapped skill</span>
                <select value={form.skillId} onChange={(e) => setForm({ ...form, skillId: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-300">
                  {data.skills.filter((skill) => skill.status === "Active").map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}
                </select>
              </label>
              <Input label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
              <Input label="Tags (comma-separated)" value={form.tags} onChange={(v) => setForm({ ...form, tags: v })} />
              <Select label="Target level" value={form.targetLevel} values={["Beginner", "Intermediate", "Advanced", "Expert"]} onChange={(v) => setForm({ ...form, targetLevel: v })} />
              <Select label="Difficulty" value={form.difficulty} values={["Beginner", "Intermediate", "Advanced"]} onChange={(v) => setForm({ ...form, difficulty: v })} />
              <Input label="Estimated hours" value={form.estimatedHours} onChange={(v) => setForm({ ...form, estimatedHours: v })} type="number" />
              <label className="space-y-2 text-sm text-slate-400 md:col-span-2"><span>Description</span>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300" />
              </label>
              <button onClick={saveCourse} className="rounded-full bg-cyan-300 px-5 py-3 font-bold text-slate-950 md:col-span-2">Save course (approval requires chapters and assessment)</button>
            </div>
          </Modal>
        )}
        {editCourse && (
          <Modal title={`Edit course: ${editCourse.title}`} onClose={() => setEditCourse(null)} wide>
            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-5">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="mb-4 flex flex-wrap gap-2">
                    <StatusPill tone="cyan">{editCourse.id}</StatusPill>
                    <StatusPill tone={editCourse.approval === "Approved" ? "green" : editCourse.approval === "Rejected" ? "red" : "amber"}>{editCourse.approval}</StatusPill>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input label="Title" value={editForm.title} onChange={(v) => setEditForm({ ...editForm, title: v })} />
                    <label className="space-y-2 text-sm text-slate-400"><span>Mapped skill</span>
                      <select value={editForm.skillId} onChange={(e) => setEditForm({ ...editForm, skillId: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300">
                        {data.skills.filter((skill) => skill.status === "Active").map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}
                      </select>
                    </label>
                    <Input label="Category" value={editForm.category} onChange={(v) => setEditForm({ ...editForm, category: v })} />
                    <Input label="Tags" value={editForm.tags} onChange={(v) => setEditForm({ ...editForm, tags: v })} />
                    <Select label="Target level" value={editForm.targetLevel} values={["Beginner", "Intermediate", "Advanced", "Expert"]} onChange={(v) => setEditForm({ ...editForm, targetLevel: v })} />
                    <Select label="Difficulty" value={editForm.difficulty} values={["Beginner", "Intermediate", "Advanced"]} onChange={(v) => setEditForm({ ...editForm, difficulty: v })} />
                    <Input label="Estimated hours" value={editForm.estimatedHours} onChange={(v) => setEditForm({ ...editForm, estimatedHours: v })} type="number" />
                    <label className="space-y-2 text-sm text-slate-400 md:col-span-2"><span>Description</span>
                      <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300" />
                    </label>
                    <button onClick={saveCourseEdits} className="rounded-full bg-cyan-300 px-5 py-3 font-bold text-slate-950 md:col-span-2">Save course changes</button>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-widest text-slate-500">Approval readiness</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {getReadiness(editCourse).ready ? <StatusPill tone="green">Ready for approval</StatusPill> : getReadiness(editCourse).issues.map((issue) => <StatusPill key={issue} tone="amber">{issue}</StatusPill>)}
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-500">Course chapters</p>
                      <h3 className="mt-1 text-lg font-semibold text-white">{data.chapters.filter((chapter) => chapter.courseId === editCourse.id).length}/99 chapters</h3>
                    </div>
                    {chapterForm.id && <button onClick={resetChapterForm} className="rounded-full border border-white/10 px-3 py-2 text-xs text-slate-300">New chapter</button>}
                  </div>
                  <div className="space-y-2">
                    {data.chapters.filter((chapter) => chapter.courseId === editCourse.id).sort((a, b) => a.sequence - b.sequence).map((chapter) => {
                      const assessment = data.assessments.find((item) => item.chapterId === chapter.id);
                      return (
                        <button key={chapter.id} onClick={() => editChapter(chapter)} className={cn("w-full rounded-2xl border p-3 text-left transition", chapterForm.id === chapter.id ? "border-cyan-300/50 bg-cyan-300/10" : "border-white/10 bg-slate-900/40 hover:bg-white/[0.06]")}>
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400/10 text-sm font-bold text-cyan-300">{chapter.sequence}</span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-white">{chapter.title}</p>
                              <p className="text-xs text-slate-500">{chapter.contentType} · {chapter.durationMinutes}m</p>
                            </div>
                            <StatusPill tone={assessment ? "green" : "red"}>{assessment ? "Assessment" : "No assessment"}</StatusPill>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="mb-4 text-sm font-semibold text-white">{chapterForm.id ? "Edit chapter" : "Add chapter"}</p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input label="Chapter title" value={chapterForm.title} onChange={(v) => setChapterForm({ ...chapterForm, title: v })} />
                    <Select label="Content type" value={chapterForm.contentType} values={["Rich Text", "PDF", "Video Link"]} onChange={(v) => setChapterForm({ ...chapterForm, contentType: v, fileName: v === "PDF" ? chapterForm.fileName : "", url: v === "PDF" || v === "Video Link" ? chapterForm.url : "" })} />
                    <Input label="Duration (min)" value={chapterForm.durationMinutes} onChange={(v) => setChapterForm({ ...chapterForm, durationMinutes: v })} type="number" />
                    <Input label="Minimum required time (min)" value={chapterForm.minimumTimeMinutes} onChange={(v) => setChapterForm({ ...chapterForm, minimumTimeMinutes: v })} type="number" />
                    {chapterForm.contentType === "Video Link" && <Input label="Video URL" value={chapterForm.url} onChange={(v) => setChapterForm({ ...chapterForm, url: v })} />}
                    {chapterForm.contentType === "PDF" && (
                      <label className="space-y-2 text-sm text-slate-400"><span>Upload PDF</span>
                        <input type="file" accept=".pdf,application/pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePdfUpload(f); }} className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white file:mr-3 file:rounded-full file:border-0 file:bg-cyan-300 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-slate-950" />
                        {chapterForm.fileName && <span className="block text-xs text-cyan-200">Selected: {chapterForm.fileName}</span>}
                      </label>
                    )}
                    <label className="space-y-2 text-sm text-slate-400 md:col-span-2"><span>Description</span>
                      <textarea value={chapterForm.description} onChange={(e) => setChapterForm({ ...chapterForm, description: e.target.value })} className="min-h-16 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300" />
                    </label>
                    <label className="space-y-2 text-sm text-slate-400 md:col-span-2"><span>Content body</span>
                      <textarea value={chapterForm.body} onChange={(e) => setChapterForm({ ...chapterForm, body: e.target.value })} className="min-h-28 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300" />
                    </label>
                    <button onClick={saveChapter} className="rounded-full bg-emerald-300 px-5 py-3 font-bold text-slate-950 md:col-span-2">{chapterForm.id ? "Save chapter changes" : "Add chapter to course"}</button>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        )}
        {assignCourse && (
          <Modal title={`Assign: ${assignCourse.title}`} onClose={() => setAssignCourse(null)}>
            <div className="mb-5 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-3">
              <label className="space-y-2 text-sm text-slate-400"><span>Due date</span>
                <input type="date" value={assignmentForm.dueAt} onChange={(e) => setAssignmentForm({ ...assignmentForm, dueAt: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300" />
              </label>
              <Select label="Priority" value={assignmentForm.priority} values={["Low", "Medium", "High"]} onChange={(v) => setAssignmentForm({ ...assignmentForm, priority: v })} />
              <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-300">
                <span>Mandatory</span>
                <input type="checkbox" checked={assignmentForm.mandatory} onChange={(e) => setAssignmentForm({ ...assignmentForm, mandatory: e.target.checked })} className="h-5 w-5 accent-cyan-300" />
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {candidates.map((u) => {
                const enrolled = data.enrollments.some((e) => e.courseId === assignCourse.id && e.userId === u.id);
                const mappedSkill = data.skills.find((skill) => assignCourse.skillIds?.includes(skill.id) || skill.name === assignCourse.skill);
                const target = mappedSkill ? data.targetSkills.find((item) => item.skillId === mappedSkill.id && (item.scope === "Organization" || item.department === u.department || item.designation === u.designation || item.userId === u.id)) : null;
                const score = mappedSkill ? data.skillRatings.find((rating) => rating.userId === u.id && rating.skill === mappedSkill.name)?.score || 0 : 0;
                const recommended = target ? score < target.targetScore : false;
                return (
                  <button key={u.id} disabled={enrolled} onClick={() => assign(assignCourse.id, u.id)} className={cn("rounded-2xl border p-4 text-left transition", enrolled ? "border-emerald-300/30 bg-emerald-300/5 opacity-60" : recommended ? "border-amber-300/40 bg-amber-300/5 hover:border-amber-200/70" : "border-white/10 hover:border-cyan-300/50")}>
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} size="sm" />
                      <div><p className="font-medium text-white">{u.name}</p><p className="text-xs text-slate-500">{u.department} · {u.role}</p></div>
                    </div>
                    {recommended && <p className="mt-2 text-xs text-amber-200">Recommended: {mappedSkill?.name} gap {target!.targetScore - score} points</p>}
                    {enrolled && <p className="mt-2 text-xs text-emerald-300">Already enrolled</p>}
                  </button>
                );
              })}
            </div>
          </Modal>
        )}
        {playCourse && (
          <ChapterPlayer
            course={playCourse}
            chapters={data.chapters.filter((c) => c.courseId === playCourse.id).sort((a, b) => a.sequence - b.sequence)}
            enrollment={data.enrollments.find((e) => e.courseId === playCourse.id && e.userId === currentUser.id)}
            assessments={data.assessments.filter((a) => a.courseId === playCourse.id)}
            attempts={data.attempts.filter((a) => a.courseId === playCourse.id)}
            feedbacks={data.chapterFeedbacks.filter((f) => f.courseId === playCourse.id)}
            currentUser={currentUser}
            onProgress={handleProgress}
            onChapterTime={handleChapterTime}
            onFeedback={handleFeedback}
            onAttempt={handleAttempt}
            onClose={() => setPlayCourse(null)}
          />
        )}
        {deleteTarget && (
          <DeleteConfirmModal
            entityType="Course"
            entityName={deleteTarget.title}
            entityId={deleteTarget.id}
            onConfirm={handleDeleteCourse}
            onClose={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
