import { lazy, useEffect, useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn, Avatar, ToastNotification } from "./components";
import { navByRole, now } from "./types";
import type { AppData, ModuleKey, User } from "./types";
import { seedData } from "./seedData";
import { setToastHandler } from "./toast";
import { apiFetch } from "./api";
import { readAppState, writeAppState } from "./app-state-storage";

const Login = lazy(() => import("./pages/Login"));
const MobileProctor = lazy(() => import("./pages/MobileProctor").then((module) => ({ default: module.MobileProctor })));
const ProctorCockpit = lazy(() => import("./pages/ProctorCockpit").then((module) => ({ default: module.ProctorCockpit })));
const VerifyCertificate = lazy(() => import("./pages/VerifyCertificate").then((module) => ({ default: module.VerifyCertificate })));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Courses = lazy(() => import("./pages/Courses"));
const Assessments = lazy(() => import("./pages/Assessments"));
const Skills = lazy(() => import("./pages/Skills"));
const Users = lazy(() => import("./pages/Users"));
const Team = lazy(() => import("./pages/Team"));
const Settings = lazy(() => import("./pages/Settings"));
const Reports = lazy(() => import("./pages/Reports"));
const Certificates = lazy(() => import("./pages/Certificates"));
const Evaluation = lazy(() => import("./pages/Evaluation"));
const Archive = lazy(() => import("./pages/Archive"));
const TextToCourseAgent = lazy(() => import("./pages/TextToCourseAgent"));
const AICopilot = lazy(() => import("./components/AICopilot"));

type AuthenticatedUser = Partial<User> & Pick<User, "id"> & { sessionVersion?: number; sv?: number };

function ModuleGlyph({ icon, active }: { icon: string; active: boolean }) {
  const palette: Record<string, string> = {
    dashboard: "from-cyan-300 via-blue-400 to-sky-600",
    users: "from-emerald-300 via-teal-400 to-cyan-600",
    courses: "from-amber-300 via-orange-400 to-rose-500",
    assessments: "from-violet-300 via-fuchsia-400 to-indigo-600",
    skills: "from-lime-300 via-emerald-400 to-teal-600",
    reports: "from-rose-300 via-pink-400 to-violet-600",
    certificates: "from-yellow-200 via-amber-300 to-orange-500",
    evaluation: "from-red-300 via-orange-400 to-amber-500",
    archive: "from-rose-300 via-red-400 to-rose-600",
    settings: "from-slate-200 via-slate-400 to-slate-700",
    team: "from-blue-300 via-cyan-400 to-emerald-500",
    "my-learning": "from-cyan-200 via-emerald-300 to-lime-500",
    "ai-generator": "from-cyan-300 via-teal-400 to-emerald-600",
    "proctor-cockpit": "from-rose-400 via-amber-400 to-red-600",
  };

  return (
    <span className={cn("relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border", active ? "border-slate-950/10 bg-slate-950/10" : "border-white/10 bg-white/[0.03]")}>
      <span className={cn("h-4 w-4 rotate-45 rounded-[0.3rem] bg-gradient-to-br shadow-lg", palette[icon] || palette.dashboard)} style={{ transform: "rotateX(54deg) rotateZ(45deg)", boxShadow: active ? "0 10px 20px rgba(15, 23, 42, 0.3)" : "0 10px 22px rgba(34, 211, 238, 0.16)" }} />
      <span className="absolute bottom-1.5 h-1.5 w-4 rounded-full bg-black/20 blur-[1px]" />
    </span>
  );
}

function useLocalState<T>(key: string, init: T) {
  const [val, setVal] = useState<T>(() => {
    try { return readAppState(localStorage, key, init, import.meta.env.DEV); } catch { return init; }
  });
  useEffect(() => {
    try { writeAppState(localStorage, key, val, import.meta.env.DEV); } catch {}
  }, [key, val]);
  return [val, setVal] as const;
}

const emptyAppData: AppData = {
  users: [],
  skills: [],
  targetSkills: [],
  courses: [],
  chapters: [],
  assessments: [],
  enrollments: [],
  attempts: [],
  chapterFeedbacks: [],
  skillRatings: [],
  audit: [],
  archive: [],
  sessionVersion: {},
  issuedCertificates: [],
};

function normalizeData(data: AppData): AppData {
  if (!data) return emptyAppData;
  // Collect all archived entity IDs to prevent re-adding deleted items from seed
  const archivedIds = new Set((data?.archive || []).map((r) => r.entityId));
  (data?.archive || []).forEach((r) => {
    r.relatedData?.chapters?.forEach((ch) => archivedIds.add(ch.id));
    r.relatedData?.assessments?.forEach((a) => archivedIds.add(a.id));
  });

  const mergeById = <T extends { id: string }>(current: T[], seeded: T[]) => {
    const currentIds = new Set((current || []).map((item) => item.id));
    return [...(current || []), ...seeded.filter((item) => !currentIds.has(item.id) && !archivedIds.has(item.id))];
  };

  const usersRaw = data?.users || [];
  const existingUserIds = new Set(usersRaw.map((user) => user.id));
  const isDev = Boolean(import.meta.env.DEV);
  const users = isDev ? [
    ...usersRaw.map((user) => {
      const seedUser = seedData.users.find((item) => item.id === user.id);
      return {
        ...user,
        role: user.id === "EMP-1001" && user.email === "admin@nalanda.local" && user.role === "Super Admin" ? "Admin" : user.role,
        team: user.team || seedUser?.team || "Unassigned",
      };
    }),
    ...seedData.users.filter((user) => !existingUserIds.has(user.id) && !archivedIds.has(user.id)),
  ] : usersRaw;
  const skills = isDev ? mergeById(data?.skills || [], seedData.skills) : (data?.skills || []);
  const targetSkills = isDev ? mergeById(data?.targetSkills || [], seedData.targetSkills) : (data?.targetSkills || []);
  const courses = isDev ? mergeById(data?.courses || [], seedData.courses) : (data?.courses || []);
  const chapters = isDev ? mergeById(data?.chapters || [], seedData.chapters) : (data?.chapters || []);
  const assessments = isDev ? mergeById(data?.assessments || [], seedData.assessments) : (data?.assessments || []);

  const rawEnrollments = data?.enrollments || (data as any)?.assignments || [];
  const rawAttempts = data?.attempts || [];

  return {
    ...data,
    users,
    skills,
    targetSkills,
    chapters: chapters.map((chapter) => ({
      ...chapter,
      minimumTimeMinutes: chapter.minimumTimeMinutes ?? 1,
    })),
    courses: courses.map((course) => {
      const seedCourse = seedData.courses.find((item) => item.id === course.id);
      const skill = skills.find((item) => item.name === course.skill);
      return {
        ...course,
        skillIds: course.skillIds?.length ? course.skillIds : seedCourse?.skillIds || (skill ? [skill.id] : []),
        targetLevel: course.targetLevel || seedCourse?.targetLevel || course.difficulty,
        prerequisites: course.prerequisites || [],
      };
    }),
    enrollments: rawEnrollments.map((enrollment) => ({
      ...enrollment,
      dueAt: enrollment.dueAt || null,
      priority: enrollment.priority || "Medium",
      mandatory: enrollment.mandatory ?? false,
      timeSpentSeconds: enrollment.timeSpentSeconds ?? Math.round((enrollment.timeSpentMinutes || 0) * 60),
      chapterTimeSpentSeconds: enrollment.chapterTimeSpentSeconds || {},
    })),
    assessments: assessments.map((assessment) => {
      const course = courses.find((item) => item.id === assessment.courseId);
      const seedAssessment = seedData.assessments.find((item) => item.id === assessment.id);
      const questions = seedAssessment && seedAssessment.questions.length > assessment.questions.length ? seedAssessment.questions : assessment.questions;
      return {
        ...assessment,
        difficulty: assessment.difficulty || course?.difficulty || "Beginner",
        questionLimit: assessment.questionLimit || seedAssessment?.questionLimit || Math.min(10, questions?.length || 10),
        questions,
        createdAt: assessment.createdAt || now(),
        updatedAt: assessment.updatedAt || assessment.createdAt || now(),
      };
    }),
    attempts: rawAttempts.map((attempt) => ({
      ...attempt,
      selectedQuestionIds: attempt.selectedQuestionIds || [],
      tabSwitchWarnings: attempt.tabSwitchWarnings || 0,
      autoSubmittedReason: attempt.autoSubmittedReason || null,
      proctorCaptures: attempt.proctorCaptures || [],
      timeSpentSeconds: attempt.timeSpentSeconds ?? (attempt.submittedAt ? Math.max(0, Math.round((new Date(attempt.submittedAt).getTime() - new Date(attempt.startedAt).getTime()) / 1000)) : 0),
    })),
    archive: data?.archive || (data as any)?.archives || [],
    sessionVersion: data?.sessionVersion || {},
    issuedCertificates: data?.issuedCertificates || [],
    audit: data?.audit || (data as any)?.auditLogs || [],
  };
}

export default function App() {
  const passwordResetFlowRequested = window.location.hash.startsWith("#reset-password?");
  const [rawData, setDataState] = useLocalState<AppData>("nalanda-v3", import.meta.env.DEV ? seedData : emptyAppData);
  const data = normalizeData(rawData);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionVersion, setSessionVersion] = useState<number | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [module, setModule] = useState<ModuleKey>("dashboard");
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const sessionRevokedRef = useRef(false);

  const syncAuthenticatedUser = useCallback((authUser: AuthenticatedUser) => {
    setDataState((prev) => {
      const normalized = normalizeData(prev);
      const existing = normalized.users.find((user) => user.id === authUser.id);
      if (!existing) return normalized;

      const sessionVer = authUser.sessionVersion ?? authUser.sv ?? normalized.sessionVersion?.[authUser.id] ?? 0;
      const nextUser: User = {
        ...existing,
        name: authUser.name ?? existing.name,
        email: authUser.email ?? existing.email,
        role: authUser.role ?? existing.role,
        department: authUser.department ?? existing.department,
        team: authUser.team ?? existing.team,
        designation: authUser.designation ?? existing.designation,
        managerId: authUser.managerId ?? existing.managerId,
        status: authUser.status ?? "Active",
        joinedAt: authUser.joinedAt ?? existing.joinedAt,
        lastActive: "Today",
      };

      return {
        ...normalized,
        users: normalized.users.map((user) => user.id === authUser.id ? nextUser : user),
        sessionVersion: { ...(normalized.sessionVersion || {}), [authUser.id]: sessionVer },
      };
    });
  }, [setDataState]);

  const loadBackendData = useCallback(async () => {
    try {
      const res = await apiFetch("/app-data/bootstrap");
      if (res.ok) {
        const dbData = await res.json();
        const mappedData = {
          ...dbData,
          enrollments: dbData.enrollments || dbData.assignments || [],
          audit: dbData.audit || dbData.auditLogs || [],
          archive: dbData.archive || dbData.archives || [],
        };
        setDataState(mappedData);
      }
    } catch (err) {
      console.error("Error loading app data from backend:", err);
    }
  }, [setDataState]);

  useEffect(() => {
    setToastHandler((msg) => {
      setToastMsg(null);
      requestAnimationFrame(() => setToastMsg(msg));
    });

    if (passwordResetFlowRequested) {
      setSessionId(null);
      setSessionVersion(null);
      if (!import.meta.env.DEV) setDataState(emptyAppData);
      setIsInitializing(false);
      return;
    }

    // Check existing session
    apiFetch("/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => {
        syncAuthenticatedUser(data.user);
        setSessionId(data.user.id);
        setSessionVersion(data.user.sessionVersion ?? data.user.sv ?? 0);
        loadBackendData();
      })
      .catch(() => {
        setSessionId(null);
        setSessionVersion(null);
        if (!import.meta.env.DEV) setDataState(emptyAppData);
      })
      .finally(() => setIsInitializing(false));
  }, [syncAuthenticatedUser, loadBackendData, passwordResetFlowRequested, setDataState]);

  const currentUser = data.users.find((u) => u.id === sessionId && u.status === "Active") || null;
  const setData = (next: AppData) => setDataState(next);

  const signIn = (u: User & { sessionVersion?: number; sv?: number }) => {
    const ver = u.sessionVersion ?? u.sv ?? data.sessionVersion?.[u.id] ?? 0;
    syncAuthenticatedUser(u);
    setSessionId(u.id);
    setSessionVersion(ver);
    sessionRevokedRef.current = false;
    loadBackendData();
  };

  const forceSignOut = useCallback(async (reason?: string) => {
    if (sessionRevokedRef.current) return;
    sessionRevokedRef.current = true;
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch (e) {}
    setSessionId(null);
    setSessionVersion(null);
    setDataState(import.meta.env.DEV ? seedData : emptyAppData);
    try { localStorage.removeItem("nalanda-v3"); } catch {}
    if (reason) setToastMsg(reason);
  }, [setDataState]);

  const resetDemo = () => { setDataState(seedData); setSessionId(null); setSessionVersion(null); };

  // Periodic session validation — every 5 seconds
  useEffect(() => {
    if (!sessionId) return;

    const validate = () => {
      const freshData = normalizeData(rawData);
      const user = freshData.users.find((u) => u.id === sessionId);

      if (!user) {
        forceSignOut("Session expired — your account has been deleted.");
        return;
      }
      if (user.status !== "Active") {
        forceSignOut("Session revoked — your account has been deactivated.");
        return;
      }
      const currentVer = freshData.sessionVersion?.[sessionId] || 0;
      if (sessionVersion !== null && currentVer !== sessionVersion) {
        forceSignOut("Session revoked — your access has been changed by an administrator.");
        return;
      }
    };

    const interval = setInterval(validate, 5000);
    // Also validate immediately
    validate();
    return () => clearInterval(interval);
  }, [sessionId, sessionVersion, rawData, forceSignOut]);

  useEffect(() => {
    if (currentUser && !navByRole[currentUser.role].some((n) => n.key === module)) setModule("dashboard");
  }, [currentUser, module]);

  if (window.location.pathname.startsWith("/mobile-proctor")) {
    return <MobileProctor />;
  }
  if (window.location.pathname.startsWith("/verify/")) {
    return <VerifyCertificate />;
  }

  if (isInitializing) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white font-semibold">Loading Nalanda...</div>;
  }

  if (!currentUser || passwordResetFlowRequested) return <Login users={data.users} onLogin={signIn} />;

  const nav = navByRole[currentUser.role];

  const render = () => {
    switch (module) {
      case "dashboard": return <Dashboard data={data} currentUser={currentUser} />;
      case "my-learning": return <Courses data={{ ...data, courses: data.courses.filter((c) => data.enrollments.some((e) => e.userId === currentUser.id && e.courseId === c.id) && c.approval === "Approved") }} currentUser={{ ...currentUser, role: "Employee" }} setData={setData} />;
      case "courses": return <Courses data={data} currentUser={currentUser} setData={setData} />;
      case "assessments": return <Assessments data={data} currentUser={currentUser} setData={setData} />;
      case "skills": return <Skills data={data} currentUser={currentUser} setData={setData} />;
      case "users": return <Users data={data} currentUser={currentUser} setData={setData} />;
      case "team": return <Team data={data} currentUser={currentUser} />;
      case "settings": return <Settings data={data} currentUser={currentUser} setData={setData} />;
      case "reports": return <Reports data={data} currentUser={currentUser} />;
      case "certificates": return <Certificates data={data} currentUser={currentUser} setData={setData} />;
      case "evaluation": return <Evaluation data={data} currentUser={currentUser} />;
      case "archive": return <Archive data={data} currentUser={currentUser} setData={setData} />;
      case "proctor-cockpit": return <ProctorCockpit currentUser={currentUser} />;
      case "ai-generator": return <TextToCourseAgent data={data} currentUser={currentUser} setData={setData} onGoToCreated={() => {
        setModule("courses");
      }} />;
      default: return <Dashboard data={data} currentUser={currentUser} />;
    }
  };

  return (
    <>
    <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-mesh" />
      <div className="relative z-10 flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-slate-950/70 p-5 backdrop-blur-xl lg:flex lg:flex-col">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 rounded-2xl border border-cyan-200/30 bg-cyan-300/10">
              <motion.span className="absolute inset-2 rounded-xl bg-cyan-300/80" animate={{ scale: [1, 0.72, 1], opacity: [0.95, 0.55, 0.95] }} transition={{ duration: 3, repeat: Infinity }} />
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-white">Nalanda</p>
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">L&D Platform</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-3">
              <Avatar name={currentUser.name} size="sm" />
              <div className="min-w-0">
                <p className="truncate font-medium text-white text-sm">{currentUser.name}</p>
                <p className="text-xs text-slate-400">{currentUser.role} - {currentUser.department}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => forceSignOut()} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5">Sign out</button>
              <button onClick={resetDemo} className="rounded-full border border-rose-300/20 px-3 py-1.5 text-xs text-rose-200 hover:bg-rose-300/10">Reset</button>
            </div>
          </div>

          <nav className="mt-6 flex-1 space-y-1">
            {nav.map((n) => (
              <button key={n.key} onClick={() => setModule(n.key)} className={cn("flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition", module === n.key ? "bg-white text-slate-950 shadow-lg" : "text-slate-400 hover:bg-white/5 hover:text-white")}>
                <ModuleGlyph icon={n.icon} active={module === n.key} />
                <span>{n.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs font-medium text-white">Nalanda v1.0</p>
            <p className="mt-1 text-xs text-slate-500 leading-5">Local API mode · Backend on port 8080</p>
          </div>
        </aside>

        {/* Mobile header */}
        <div className="fixed top-0 left-0 right-0 z-40 lg:hidden">
          <header className="flex items-center justify-between border-b border-white/10 bg-slate-950/90 px-4 py-3 backdrop-blur-xl">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white">Menu</button>
            <p className="font-display text-lg font-semibold text-white">Nalanda</p>
            <button onClick={() => forceSignOut()} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300">Sign out</button>
          </header>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0, x: -200 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -200 }} className="absolute top-full left-0 w-64 border-r border-white/10 bg-slate-950 p-4 shadow-2xl">
                <nav className="space-y-1">
                  {nav.map((n) => (
                    <button key={n.key} onClick={() => { setModule(n.key); setSidebarOpen(false); }} className={cn("flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium", module === n.key ? "bg-white text-slate-950" : "text-slate-400")}>
                      <ModuleGlyph icon={n.icon} active={module === n.key} /><span>{n.label}</span>
                    </button>
                  ))}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main content */}
        <section className="min-w-0 flex-1 p-4 pt-16 md:p-6 lg:p-8 lg:pt-8">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{currentUser.role} workspace</p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-white">{nav.find((n) => n.key === module)?.label}</h1>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={`${currentUser.id}-${module}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
              {render()}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </main>
    <ToastNotification message={toastMsg} onDone={() => setToastMsg(null)} />
    <AICopilot
      isOpen={copilotOpen}
      onToggle={() => setCopilotOpen(o => !o)}
      context={{ courseTitle: `Nalanda ${nav.find(n => n.key === module)?.label || ""} Module` }}
    />
    </>
  );
}

