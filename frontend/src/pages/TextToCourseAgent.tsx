import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { apiFetch } from "../api";
import { Input, Panel, ProgressBar, Select, StatusPill, cn } from "../components";
import type { AppData, Assessment, Chapter, Course, Question, SkillLevel, User } from "../types";
import { now, uid } from "../types";
import { toast } from "../toast";

type DraftCourse = Omit<Course, "id" | "ownerId" | "approval" | "status" | "version" | "createdAt" | "updatedAt"> & {
  skillId: string;
};
type DraftChapter = Omit<Chapter, "id" | "courseId" | "sequence">;
type DraftAssessment = Omit<Assessment, "id" | "courseId" | "chapterId" | "ownerId" | "approval" | "status" | "createdAt" | "updatedAt"> & {
  chapterIndex: number;
};
type GenerationDraft = {
  course: DraftCourse;
  chapters: DraftChapter[];
  assessments: DraftAssessment[];
  generationDurationMs: number;
  usedFallback?: boolean;
  usedFeedbackCount?: number;
  repairedSections?: number;
};
type GenerationProgressItem = {
  id: string;
  tone: "cyan" | "green" | "amber" | "red" | "slate" | "violet";
  label: string;
  detail?: string;
};
type GenerationStreamEvent = {
  type: "status" | "outline" | "chapter_start" | "chapter_repair" | "chapter_done" | "assessment_start" | "assessment_done" | "final" | "error";
  stage?: string;
  message?: string;
  index?: number;
  total?: number;
  draft?: GenerationDraft;
  validation?: { passed: boolean; wordCount: number; failures?: string[] };
};

const questionTypeLabels: Record<Question["type"], string> = {
  MCQ: "MCQ",
  Descriptive: "Descriptive",
  Rating: "Rating",
  YesNo: "Yes / No",
  ShortAnswer: "Short answer",
  LongAnswer: "Long answer",
};

const formatDuration = (ms: number) => {
  if (!ms) return "-";
  const seconds = Math.max(1, Math.round(ms / 1000));
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s`;
};

function BookLoader({ stage }: { stage: number }) {
  const fill = Math.min(100, 18 + stage * 16);
  return (
    <div className="mx-auto w-full max-w-sm text-center">
      <div className="relative mx-auto h-36 w-44">
        <div className="absolute inset-x-4 bottom-3 h-28 rounded-b-3xl rounded-t-lg border border-cyan-300/40 bg-slate-900 shadow-2xl shadow-cyan-950/30" />
        <motion.div
          className="absolute bottom-4 left-5 right-5 rounded-b-3xl bg-gradient-to-t from-cyan-400 via-emerald-300 to-amber-200"
          animate={{ height: `${fill}%` }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        />
        <div className="absolute inset-x-3 bottom-2 h-30 rounded-b-3xl rounded-t-xl border border-white/20 bg-slate-950/35" />
        <div className="absolute left-1/2 top-5 h-28 w-px -translate-x-1/2 bg-white/20" />
        <motion.div className="absolute -right-2 top-1 h-28 w-20 origin-left rounded-r-2xl border border-cyan-200/30 bg-slate-800" animate={{ rotateY: [0, -18, 0] }} transition={{ duration: 1.4, repeat: Infinity }} />
      </div>
    </div>
  );
}

function OpenBookSuccess() {
  return (
    <div className="relative h-28 w-44">
      <motion.div className="absolute left-0 top-5 h-24 w-24 origin-right rounded-l-3xl border border-emerald-200/40 bg-emerald-300/15" initial={{ rotateY: 0 }} animate={{ rotateY: -28 }} />
      <motion.div className="absolute right-0 top-5 h-24 w-24 origin-left rounded-r-3xl border border-emerald-200/40 bg-emerald-300/15" initial={{ rotateY: 0 }} animate={{ rotateY: 28 }} />
      <div className="absolute left-1/2 top-4 h-26 w-px -translate-x-1/2 bg-emerald-100/30" />
      <div className="absolute inset-x-10 bottom-0 h-3 rounded-full bg-emerald-300/30 blur-md" />
    </div>
  );
}

export default function TextToCourseAgent({
  data,
  currentUser,
  setData,
  onGoToCreated,
}: {
  data: AppData;
  currentUser: User;
  setData: (d: AppData) => void;
  onGoToCreated: () => void;
}) {
  const activeSkills = data.skills.filter((skill) => skill.status === "Active");
  const [text, setText] = useState("");
  const [skillId, setSkillId] = useState(activeSkills[0]?.id || "");
  const selectedSkill = activeSkills.find((skill) => skill.id === skillId) || activeSkills[0];
  const [courseLevel, setCourseLevel] = useState<SkillLevel>("Beginner");
  const [chapterCount, setChapterCount] = useState("3");
  const [isGenerating, setIsGenerating] = useState(false);
  const [stage, setStage] = useState(0);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgressItem[]>([]);
  const [currentActivity, setCurrentActivity] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [draft, setDraft] = useState<GenerationDraft | null>(null);
  const [approvedCourseId, setApprovedCourseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<"chapters" | "assessments">("chapters");
  const [feedbackType, setFeedbackType] = useState<"Course" | "Chapter" | "Assessment" | "Overall">("Chapter");
  const [feedbackRating, setFeedbackRating] = useState("3");
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSaving, setFeedbackSaving] = useState(false);

  const acharyaCourses = data.courses.filter((course) => course.generatedBy === "Acharya");
  const acharyaChapters = data.chapters.filter((chapter) => chapter.generatedBy === "Acharya");
  const acharyaAssessments = data.assessments.filter((assessment) => assessment.generatedBy === "Acharya");
  const avgMs = acharyaCourses.length
    ? Math.round(acharyaCourses.reduce((sum, course) => sum + (course.generationDurationMs || 0), 0) / acharyaCourses.length)
    : 0;

  const stages = [
    "Reading your prompt",
    "Generating course structure",
    "Creating chapters one by one",
    "Validating chapter quality",
    "Creating assessments after chapters",
    "Preparing editable preview",
    "Finalizing Acharya draft",
  ];

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    draft?.assessments.forEach((assessment) => assessment.questions.forEach((question) => {
      counts[question.type] = (counts[question.type] || 0) + 1;
    }));
    return counts;
  }, [draft]);

  const handleGenerate = async () => {
    const count = Math.max(1, Math.min(20, Number(chapterCount) || 0));
    if (!selectedSkill) {
      setError("Please create an active skill before using Acharya.");
      return;
    }
    if (text.trim().length < 50) {
      setError("Please provide at least 50 characters of educational content.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setDraft(null);
    setApprovedCourseId(null);
    setStage(0);
    setGenerationProgress([{ id: "start", tone: "cyan", label: "Reading source material", detail: "Acharya is preparing the course plan." }]);
    setCurrentActivity("Reading your prompt and preparing the course structure.");
    setProgressPercent(4);

    try {
      const res = await apiFetch("/ai/generate-course-stream", {
        method: "POST",
        body: JSON.stringify({
          text,
          skillId: selectedSkill.id,
          skillName: selectedSkill.name,
          courseLevel,
          chapterCount: count,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || "Failed to generate Acharya draft.");
      }
      if (!res.body) throw new Error("The browser could not read live generation progress.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalDraft: GenerationDraft | null = null;

      // Each streamed event maps directly to a visible progress item, so users
      // can see outline, chapter, validation, and assessment work as it happens.
      const handleEvent = (event: GenerationStreamEvent) => {
        if (event.message) setCurrentActivity(event.message);
        if (event.type === "status") {
          const nextStage = event.stage === "outline" ? 1 : event.stage === "reading" ? 0 : stage;
          setStage(nextStage);
          setGenerationProgress((items) => [...items, { id: `${event.type}-${Date.now()}-${items.length}`, tone: "cyan", label: event.message || "Working" }]);
          setProgressPercent((value) => Math.max(value, event.stage === "outline" ? 10 : 6));
        }
        if (event.type === "outline") {
          setStage(1);
          setProgressPercent(15);
          setGenerationProgress((items) => [...items, { id: "outline", tone: "green", label: `Course structure created`, detail: `${count} chapters planned before content generation.` }]);
        }
        if (event.type === "chapter_start" && typeof event.index === "number") {
          const chapterIndex = event.index;
          setStage(2);
          const pct = 15 + Math.round((chapterIndex / Math.max(1, count)) * 55);
          setProgressPercent(pct);
          setGenerationProgress((items) => [...items, { id: `chapter-start-${chapterIndex}`, tone: "cyan", label: `Creating Chapter ${chapterIndex + 1} of ${count}`, detail: event.message }]);
        }
        if (event.type === "chapter_repair" && typeof event.index === "number") {
          const chapterIndex = event.index;
          setStage(3);
          setGenerationProgress((items) => [...items, { id: `chapter-repair-${chapterIndex}`, tone: "amber", label: `Validating Chapter ${chapterIndex + 1} of ${count}`, detail: event.validation?.failures?.join(" ") || "Quality repair in progress." }]);
        }
        if (event.type === "chapter_done" && typeof event.index === "number") {
          const chapterIndex = event.index;
          setStage(3);
          const pct = 15 + Math.round(((chapterIndex + 1) / Math.max(1, count)) * 55);
          setProgressPercent(pct);
          setGenerationProgress((items) => [...items, {
            id: `chapter-done-${chapterIndex}`,
            tone: event.validation?.passed ? "green" : "amber",
            label: `Chapter ${chapterIndex + 1} of ${count} Created`,
            detail: event.validation ? `${event.validation.wordCount} words validated` : "Chapter completed",
          }]);
        }
        if (event.type === "assessment_start") {
          setStage(4);
          setProgressPercent(76);
          setGenerationProgress((items) => [...items, { id: "assessment-start", tone: "violet", label: "Creating assessments after chapters", detail: "Quizzes, MCQs, assignments, and descriptive questions are now being generated." }]);
        }
        if (event.type === "assessment_done") {
          setStage(5);
          setProgressPercent(90);
          setGenerationProgress((items) => [...items, { id: "assessment-done", tone: "green", label: "Assessments created", detail: "Assessment generation started only after every chapter was complete." }]);
        }
        if (event.type === "final" && event.draft) {
          const completedDraft = event.draft;
          finalDraft = completedDraft;
          setDraft(completedDraft);
          setStage(stages.length - 1);
          setProgressPercent(100);
          setGenerationProgress((items) => [...items, { id: "final", tone: "green", label: "Acharya draft ready for review", detail: `${completedDraft.chapters.length} chapters and ${completedDraft.assessments.length} assessments completed.` }]);
        }
        if (event.type === "error") throw new Error(event.message || "Generation failed.");
      };

      // The backend sends newline-delimited JSON. Keep partial chunks in `buffer`
      // until a full line arrives, then apply that progress event to the UI.
      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim()) continue;
          handleEvent(JSON.parse(line));
        }
        if (done) break;
      }
      if (buffer.trim()) handleEvent(JSON.parse(buffer));
      if (!finalDraft) throw new Error("Generation ended before Acharya returned a completed draft.");
      setText("");
      setStage(stages.length - 1);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  const updateDraftCourse = (patch: Partial<DraftCourse>) => {
    if (!draft) return;
    setDraft({ ...draft, course: { ...draft.course, ...patch } });
  };

  const updateChapter = (index: number, patch: Partial<DraftChapter>) => {
    if (!draft) return;
    setDraft({ ...draft, chapters: draft.chapters.map((chapter, i) => i === index ? { ...chapter, ...patch } : chapter) });
  };

  const updateQuestion = (assessmentIndex: number, questionId: string, patch: Partial<Question>) => {
    if (!draft) return;
    setDraft({
      ...draft,
      assessments: draft.assessments.map((assessment, i) => i === assessmentIndex
        ? { ...assessment, questions: assessment.questions.map((question) => question.id === questionId ? { ...question, ...patch } : question) }
        : assessment),
    });
  };

  const updateOption = (assessmentIndex: number, question: Question, optionIndex: number, value: string) => {
    const options = [...(question.options || ["", "", "", ""])];
    options[optionIndex] = value;
    updateQuestion(assessmentIndex, question.id, { options });
  };

  const submitGenerationFeedback = async () => {
    if (!selectedSkill || feedbackComment.trim().length < 10) {
      toast("Write at least 10 characters of feedback for Acharya");
      return;
    }
    setFeedbackSaving(true);
    try {
      const res = await apiFetch("/ai/generation-feedback", {
        method: "POST",
        body: JSON.stringify({
          skillName: selectedSkill.name,
          courseLevel,
          feedbackType,
          rating: Math.max(1, Math.min(5, Number(feedbackRating) || 3)),
          comment: feedbackComment.trim(),
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Failed to save feedback.");
      setFeedbackComment("");
      setFeedbackRating("3");
      toast("Acharya feedback saved for future generations");
    } catch (err: any) {
      toast(err.message || "Failed to save feedback");
    } finally {
      setFeedbackSaving(false);
    }
  };

  const approveDraft = () => {
    if (!draft || !selectedSkill) return;
    const duration = draft.generationDurationMs || 0;
    const courseId = `NLD-${selectedSkill.name.slice(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdAt = now();
    const course: Course = {
      id: courseId,
      title: draft.course.title,
      description: draft.course.description,
      skill: selectedSkill.name,
      skillIds: [selectedSkill.id],
      targetLevel: courseLevel,
      prerequisites: [],
      category: selectedSkill.category,
      tags: draft.course.tags || ["Acharya"],
      thumbnailColor: "#22d3ee",
      ownerId: currentUser.id,
      approval: currentUser.role === "Manager" ? "Pending" : "Approved",
      status: "Active",
      version: 1,
      difficulty: courseLevel === "Expert" ? "Advanced" : courseLevel,
      estimatedHours: Math.max(1, Math.ceil(draft.chapters.reduce((sum, chapter) => sum + Number(chapter.durationMinutes || 20), 0) / 60)),
      createdAt,
      updatedAt: createdAt,
      generatedBy: "Acharya",
      generationDurationMs: duration,
    };
    const chapters: Chapter[] = draft.chapters.map((chapter, index) => ({
      ...chapter,
      id: uid("CH"),
      courseId,
      sequence: index + 1,
      contentType: chapter.contentType || "Rich Text",
      durationMinutes: Number(chapter.durationMinutes || 20),
      minimumTimeMinutes: Number(chapter.minimumTimeMinutes || Math.max(1, Math.floor(Number(chapter.durationMinutes || 20) * 0.7))),
      generatedBy: "Acharya",
      generationDurationMs: duration,
    }));
    const assessments: Assessment[] = draft.assessments.map((assessment) => {
      const chapter = chapters[Math.min(assessment.chapterIndex || 0, chapters.length - 1)];
      return {
        ...assessment,
        id: uid("ASM"),
        courseId,
        chapterId: chapter.id,
        ownerId: currentUser.id,
        approval: "Approved",
        status: "Active",
        type: "Mixed",
        questionLimit: 30,
        durationMinutes: Number(assessment.durationMinutes || 45),
        passScore: Number(assessment.passScore || 70),
        createdAt,
        updatedAt: createdAt,
        generatedBy: "Acharya",
        generationDurationMs: duration,
      };
    });
    setData({
      ...data,
      courses: [course, ...data.courses],
      chapters: [...data.chapters, ...chapters],
      assessments: [...assessments, ...data.assessments],
      audit: [
        { id: uid("AUD"), actorId: currentUser.id, action: "Approved Acharya course", entity: courseId, at: createdAt },
        ...data.audit,
      ],
    });
    setApprovedCourseId(courseId);
    setDraft(null);
    toast("Acharya course approved and merged successfully");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="grid gap-3 md:grid-cols-4">
        {[
          ["Courses", acharyaCourses.length],
          ["Chapters", acharyaChapters.length],
          ["Assessments", acharyaAssessments.length],
          ["Avg time", formatDuration(avgMs)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-widest text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <Panel title="Acharya" kicker="Course generation"
        action={draft ? <StatusPill tone="amber">Draft awaiting approval</StatusPill> : <StatusPill tone="cyan">{acharyaCourses.length} approved courses</StatusPill>}>
        <div className="grid gap-4 lg:grid-cols-[1fr_0.65fr]">
          <label className="space-y-2 text-sm text-slate-400 lg:row-span-4">
            <span>Prompt</span>
            <textarea
              value={text}
              onChange={(event) => { setText(event.target.value); setError(null); }}
              disabled={isGenerating}
              placeholder="Paste source material, rough notes, learning goals, or a course brief for Acharya..."
              className="min-h-72 w-full resize-none rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300 disabled:opacity-50"
            />
            <span className="block text-xs text-slate-600">{text.length} chars {text.length >= 50 ? "ready" : "(min 50)"}</span>
          </label>
          <label className="space-y-2 text-sm text-slate-400">
            <span>Skill tag</span>
            <select value={skillId} onChange={(event) => setSkillId(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300">
              {activeSkills.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}
            </select>
          </label>
          <Select label="Course level" value={courseLevel} values={["Beginner", "Intermediate", "Advanced", "Expert"]} onChange={(value) => setCourseLevel(value)} />
          <Input label="Number of chapters" value={chapterCount} onChange={setChapterCount} type="number" />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || text.trim().length < 50 || !selectedSkill}
            className={cn("rounded-2xl px-5 py-3 font-bold transition", isGenerating || text.trim().length < 50 || !selectedSkill ? "cursor-not-allowed bg-slate-800 text-slate-500" : "bg-cyan-300 text-slate-950 hover:brightness-110")}
          >
            {isGenerating ? "Acharya is creating..." : "Generate Acharya draft"}
          </button>
        </div>
        {error && <p className="mt-4 rounded-2xl border border-rose-300/30 bg-rose-300/10 p-3 text-sm text-rose-100">{error}</p>}
      </Panel>

      <AnimatePresence>
        {isGenerating && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-3xl border border-cyan-300/20 bg-slate-950/90 p-8">
            <BookLoader stage={stage} />
            <p className="mt-4 text-center text-lg font-semibold text-white">Acharya is preparing your course</p>
            <p className="mt-2 text-center text-cyan-200">{currentActivity || stages[stage]}</p>
            <div className="mx-auto mt-5 max-w-2xl">
              <ProgressBar value={progressPercent} tone={stage >= 4 ? "violet" : "cyan"} />
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>{stages[stage]}</span>
                <span>{progressPercent}%</span>
              </div>
            </div>
            <div className="mx-auto mt-6 max-h-80 max-w-2xl space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              {generationProgress.map((item) => (
                <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <StatusPill tone={item.tone}>{item.tone === "green" ? "Done" : item.tone === "amber" ? "Check" : item.tone === "violet" ? "Quiz" : "Live"}</StatusPill>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    {item.detail && <p className="mt-1 text-xs leading-5 text-slate-400">{item.detail}</p>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {approvedCourseId && (
        <div className="rounded-3xl border border-emerald-300/25 bg-emerald-300/5 p-8">
          <div className="flex flex-wrap items-center gap-6">
            <OpenBookSuccess />
            <div className="min-w-0 flex-1">
              <h3 className="text-2xl font-semibold text-white">Acharya course approved</h3>
              <p className="mt-2 text-sm text-slate-400">The course, chapters, and assessments have been merged and linked.</p>
              <button onClick={onGoToCreated} className="mt-5 rounded-full bg-emerald-300 px-5 py-3 text-sm font-bold text-slate-950">Go to created chapter</button>
            </div>
          </div>
        </div>
      )}

      {draft && !isGenerating && (
        <div className="space-y-6">
          <Panel title="Editable Acharya preview" kicker="Review before approval"
            action={<button onClick={approveDraft} className="rounded-full bg-emerald-300 px-5 py-2.5 text-sm font-bold text-slate-950">Approve course</button>}>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Course title" value={draft.course.title} onChange={(value) => updateDraftCourse({ title: value })} />
              <Input label="Tags" value={(draft.course.tags || []).join(", ")} onChange={(value) => updateDraftCourse({ tags: value.split(",").map((tag) => tag.trim()).filter(Boolean) })} />
              <label className="space-y-2 text-sm text-slate-400 md:col-span-2">
                <span>Description</span>
                <textarea value={draft.course.description} onChange={(event) => updateDraftCourse({ description: event.target.value })} className="min-h-20 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300" />
              </label>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-5">
              <StatusPill tone="cyan">{draft.chapters.length} chapters</StatusPill>
              <StatusPill tone="violet">{draft.assessments.length} assessments</StatusPill>
              <StatusPill>{typeCounts.MCQ || 0} MCQ</StatusPill>
              <StatusPill>{typeCounts.Rating || 0} rating</StatusPill>
              <StatusPill>{formatDuration(draft.generationDurationMs)}</StatusPill>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {draft.usedFeedbackCount ? <StatusPill tone="green">{draft.usedFeedbackCount} feedback memories used</StatusPill> : <StatusPill>No feedback memory used</StatusPill>}
              {draft.repairedSections ? <StatusPill tone="amber">{draft.repairedSections} quality repairs</StatusPill> : <StatusPill tone="green">All chapter validations passed</StatusPill>}
              {draft.usedFallback && <StatusPill tone="amber">Structured fallback completed</StatusPill>}
            </div>
          </Panel>

          <Panel title="Improve Acharya" kicker="Feedback memory">
            <div className="grid gap-4 lg:grid-cols-[11rem_8rem_1fr_auto]">
              <Select label="Feedback area" value={feedbackType} values={["Course", "Chapter", "Assessment", "Overall"]} onChange={(value) => setFeedbackType(value as typeof feedbackType)} />
              <Input label="Rating" value={feedbackRating} onChange={setFeedbackRating} type="number" />
              <label className="space-y-2 text-sm text-slate-400">
                <span>What should Acharya improve next time?</span>
                <textarea
                  value={feedbackComment}
                  onChange={(event) => setFeedbackComment(event.target.value)}
                  placeholder="Example: Chapters need deeper client-handling scenarios, role-play practice, and clearer beginner explanations."
                  className="min-h-20 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300"
                />
              </label>
              <button
                onClick={submitGenerationFeedback}
                disabled={feedbackSaving || feedbackComment.trim().length < 10}
                className={cn("self-end rounded-2xl px-5 py-3 text-sm font-bold", feedbackSaving || feedbackComment.trim().length < 10 ? "cursor-not-allowed bg-slate-800 text-slate-500" : "bg-violet-300 text-slate-950")}
              >
                {feedbackSaving ? "Saving..." : "Save memory"}
              </button>
            </div>
          </Panel>

          <div className="flex gap-2">
            <button onClick={() => setPreviewTab("chapters")} className={cn("rounded-full px-4 py-2 text-sm font-semibold", previewTab === "chapters" ? "bg-white text-slate-950" : "border border-white/10 text-slate-300")}>Chapters</button>
            <button onClick={() => setPreviewTab("assessments")} className={cn("rounded-full px-4 py-2 text-sm font-semibold", previewTab === "assessments" ? "bg-white text-slate-950" : "border border-white/10 text-slate-300")}>Assessments</button>
          </div>

          {previewTab === "chapters" ? (
            <div className="space-y-4">
              {draft.chapters.map((chapter, index) => (
                <div key={index} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="grid gap-4 md:grid-cols-[1fr_10rem]">
                    <Input label={`Chapter ${index + 1} title`} value={chapter.title} onChange={(value) => updateChapter(index, { title: value })} />
                    <Input label="Duration" value={String(chapter.durationMinutes)} onChange={(value) => updateChapter(index, { durationMinutes: Number(value) })} type="number" />
                    <label className="space-y-2 text-sm text-slate-400 md:col-span-2">
                      <span>Description</span>
                      <textarea value={chapter.description} onChange={(event) => updateChapter(index, { description: event.target.value })} className="min-h-16 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white" />
                    </label>
                    <label className="space-y-2 text-sm text-slate-400 md:col-span-2">
                      <span>Body</span>
                      <textarea value={chapter.body} onChange={(event) => updateChapter(index, { body: event.target.value })} className="min-h-32 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white" />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {draft.assessments.map((assessment, assessmentIndex) => (
                <div key={assessmentIndex} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{assessment.title}</h3>
                      <p className="text-xs text-slate-500">Chapter {assessment.chapterIndex + 1} - {assessment.questions.length} questions</p>
                    </div>
                    <StatusPill tone="violet">30 default questions</StatusPill>
                  </div>
                  <div className="space-y-3">
                    {assessment.questions.map((question, questionIndex) => (
                      <div key={question.id} className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                        <div className="mb-3 flex flex-wrap gap-2">
                          <StatusPill tone="cyan">Q{questionIndex + 1}</StatusPill>
                          <StatusPill>{questionTypeLabels[question.type]}</StatusPill>
                          <StatusPill tone="amber">{question.category || "CourseDepth"}</StatusPill>
                        </div>
                        <textarea value={question.prompt} onChange={(event) => updateQuestion(assessmentIndex, question.id, { prompt: event.target.value })} className="min-h-16 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" />
                        {question.type === "MCQ" && (
                          <div className="mt-3 grid gap-2 md:grid-cols-2">
                            {(question.options || ["", "", "", ""]).map((option, optionIndex) => (
                              <label key={optionIndex} className="grid gap-2 text-xs text-slate-400">
                                <span>Option {String.fromCharCode(65 + optionIndex)}</span>
                                <input value={option} onChange={(event) => updateOption(assessmentIndex, question, optionIndex, event.target.value)} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white" />
                              </label>
                            ))}
                          </div>
                        )}
                        {question.type !== "MCQ" && (
                          <Input label={question.type === "Rating" ? "Rating scale" : "Expected answer / rubric"} value={question.type === "Rating" ? String(question.ratingScale || 5) : (question.expectedAnswer || question.rubric || "")} onChange={(value) => question.type === "Rating" ? updateQuestion(assessmentIndex, question.id, { ratingScale: Number(value) || 5 }) : updateQuestion(assessmentIndex, question.id, { expectedAnswer: value, rubric: value })} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
