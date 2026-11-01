import { useState, useEffect } from "react";
import { apiFetch } from "../api";
import type { User } from "../types";

// Clean inline SVGs
const ShieldAlert = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
const Pause = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const Play = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const XOctagon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
);
const RefreshCw = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

export type ActiveSession = {
  attemptId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  courseTitle: string;
  assessmentTitle: string;
  startedAt: string;
  status: string;
  isPaused: boolean;
  timeSpentSeconds: number;
  timeRemainingSeconds: number;
  trustScore: number;
  riskLevel: "low" | "medium" | "high";
  flagsCount: number;
  recentFlags: Array<{ eventType: string; severity: string; createdAt: string }>;
  hasPrimaryStream: boolean;
  hasCompanionStream: boolean;
  companionDevice: string | null;
  activeWarningsCount: number;
};

export function ProctorCockpit({ currentUser: _currentUser }: { currentUser: User }) {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string>("");
  const [showWarnModal, setShowWarnModal] = useState<boolean>(false);
  const [showTerminateModal, setShowTerminateModal] = useState<boolean>(false);
  const [terminateReason, setTerminateReason] = useState<string>("");
  const [timeline, setTimeline] = useState<any | null>(null);
  const [showTimelineModal, setShowTimelineModal] = useState<boolean>(false);

  const fetchActiveSessions = async () => {
    try {
      const res = await apiFetch("/proctoring/cockpit/active");
      if (res.ok) {
        const json = await res.json();
        setSessions(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch cockpit sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveSessions();
    const interval = setInterval(fetchActiveSessions, 5000); // 5-second polling
    return () => clearInterval(interval);
  }, []);

  const handleSendWarning = async () => {
    if (!selectedAttemptId || !warningMessage.trim()) return;
    try {
      await apiFetch(`/proctoring/attempts/${selectedAttemptId}/warn`, {
        method: "POST",
        body: JSON.stringify({ message: warningMessage, severity: "medium" }),
      });
      setShowWarnModal(false);
      setWarningMessage("");
      fetchActiveSessions();
    } catch (err) {
      alert("Failed to send warning");
    }
  };

  const handleTogglePause = async (attempt: ActiveSession) => {
    const endpoint = attempt.isPaused ? "resume" : "pause";
    try {
      await apiFetch(`/proctoring/attempts/${attempt.attemptId}/${endpoint}`, { method: "POST" });
      fetchActiveSessions();
    } catch (err) {
      alert(`Could not ${endpoint} exam`);
    }
  };

  const handleTerminate = async () => {
    if (!selectedAttemptId || !terminateReason.trim()) return;
    try {
      await apiFetch(`/proctoring/attempts/${selectedAttemptId}/terminate`, {
        method: "POST",
        body: JSON.stringify({ reason: terminateReason }),
      });
      setShowTerminateModal(false);
      setTerminateReason("");
      fetchActiveSessions();
    } catch (err) {
      alert("Failed to terminate attempt");
    }
  };

  const handleViewTimeline = async (attemptId: string) => {
    setSelectedAttemptId(attemptId);
    try {
      const res = await apiFetch(`/proctoring/attempts/${attemptId}/timeline`);
      if (res.ok) {
        const json = await res.json();
        setTimeline(json.data);
        setShowTimelineModal(true);
      }
    } catch (err) {
      alert("Could not load incident timeline");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">Live Proctoring Cockpit</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
              Real-Time Sentinel
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Live AI anomaly monitoring, trust score tracking, and remote candidate intervention.
          </p>
        </div>
        <button
          onClick={fetchActiveSessions}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          Refresh Feed
        </button>
      </div>

      {/* Grid of Active Sessions */}
      {sessions.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800/80">
          <p className="text-base font-medium text-slate-300">No Active Proctored Exams</p>
          <p className="text-xs text-slate-500 mt-1">Candidate sessions will automatically populate here once started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sessions.map((session) => (
            <div
              key={session.attemptId}
              className={`rounded-2xl border p-5 transition flex flex-col justify-between ${
                session.riskLevel === "high"
                  ? "bg-rose-950/20 border-rose-800/70 shadow-lg shadow-rose-950/20"
                  : session.riskLevel === "medium"
                  ? "bg-amber-950/20 border-amber-800/60"
                  : "bg-slate-900/50 border-slate-800"
              }`}
            >
              <div>
                {/* Header Tile */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-white text-base leading-snug">{session.candidateName}</h3>
                    <p className="text-xs text-slate-400">{session.courseTitle}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        session.riskLevel === "high"
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                          : session.riskLevel === "medium"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      }`}
                    >
                      Trust: {session.trustScore}%
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wide">
                      {session.riskLevel} Risk
                    </span>
                  </div>
                </div>

                {/* Stream Angle Indicators */}
                <div className="flex items-center gap-2 my-3 text-[11px]">
                  <span
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md border ${
                      session.hasPrimaryStream
                        ? "bg-emerald-950/60 text-emerald-400 border-emerald-800"
                        : "bg-slate-800/60 text-slate-400 border-slate-700"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${session.hasPrimaryStream ? "bg-emerald-400" : "bg-slate-500"}`} />
                    Primary Angle
                  </span>
                  <span
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md border ${
                      session.hasCompanionStream
                        ? "bg-cyan-950/60 text-cyan-400 border-cyan-800"
                        : "bg-slate-800/60 text-slate-400 border-slate-700"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${session.hasCompanionStream ? "bg-cyan-400" : "bg-slate-500"}`} />
                    Mobile Companion
                  </span>
                </div>

                {/* Telemetry info */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/50 mb-3">
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">Time Remaining</span>
                    <span className="font-medium text-slate-200">
                      {Math.floor(session.timeRemainingSeconds / 60)}m {session.timeRemainingSeconds % 60}s
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">Anomaly Flags</span>
                    <span className="font-medium text-rose-300">{session.flagsCount} incidents</span>
                  </div>
                </div>

                {/* Recent Anomaly Tag */}
                {session.recentFlags.length > 0 && (
                  <div className="mb-3">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Latest Incident</span>
                    <div className="text-xs bg-rose-950/40 border border-rose-900/60 text-rose-300 px-2 py-1 rounded-lg truncate">
                      ⚠️ {session.recentFlags[0].eventType.replace(/_/g, " ")} ({session.recentFlags[0].severity})
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setSelectedAttemptId(session.attemptId);
                    setShowWarnModal(true);
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 transition flex items-center gap-1"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Warn
                </button>

                <button
                  onClick={() => handleTogglePause(session)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 transition flex items-center gap-1"
                >
                  {session.isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                  {session.isPaused ? "Resume" : "Pause"}
                </button>

                <button
                  onClick={() => handleViewTimeline(session.attemptId)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-cyan-950 text-cyan-300 hover:bg-cyan-900 border border-cyan-800 transition"
                >
                  Timeline
                </button>

                <button
                  onClick={() => {
                    setSelectedAttemptId(session.attemptId);
                    setShowTerminateModal(true);
                  }}
                  className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950 border border-rose-900/50 transition"
                  title="Disqualify Candidate"
                >
                  <XOctagon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Warning Modal */}
      {showWarnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-md w-full space-y-4">
            <h3 className="text-lg font-semibold text-white">Send Remote Proctor Warning</h3>
            <p className="text-xs text-slate-400">
              This message will immediately display as an urgent alert overlay on the candidate's screen.
            </p>
            <textarea
              value={warningMessage}
              onChange={(e) => setWarningMessage(e.target.value)}
              placeholder="e.g. Please face your screen and keep your hands on the keyboard."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowWarnModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSendWarning}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400"
              >
                Transmit Warning
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disqualification Modal */}
      {showTerminateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-rose-900/70 rounded-2xl p-5 max-w-md w-full space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <XOctagon className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Confirm Immediate Disqualification</h3>
            </div>
            <p className="text-xs text-slate-300">
              This will immediately terminate the exam, assign a score of 0, and record a failed outcome on the candidate's enrollment.
            </p>
            <textarea
              value={terminateReason}
              onChange={(e) => setTerminateReason(e.target.value)}
              placeholder="Mandatory reason: e.g. Repeated unauthorized second person in frame."
              rows={3}
              className="w-full bg-slate-950 border border-rose-900/50 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowTerminateModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleTerminate}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-500"
              >
                Disqualify & Terminate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incident Timeline Modal */}
      {showTimelineModal && timeline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-semibold text-white">Incident Timeline: {timeline.candidateName}</h3>
                <p className="text-xs text-slate-400">{timeline.assessmentTitle} • Trust: {timeline.finalTrustScore}%</p>
              </div>
              <button
                onClick={() => setShowTimelineModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕ Close
              </button>
            </div>

            <div className="overflow-y-auto flex-1 py-4 space-y-3">
              {timeline.timeline.map((item: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <span className="text-[10px] text-slate-500 font-mono shrink-0 mt-0.5">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                  <div className={`p-2.5 rounded-xl border flex-1 ${
                    item.severity === "high"
                      ? "bg-rose-950/40 border-rose-800 text-rose-200"
                      : item.severity === "medium"
                      ? "bg-amber-950/40 border-amber-800 text-amber-200"
                      : "bg-slate-950 border-slate-800 text-slate-300"
                  }`}>
                    <p className="font-semibold">{item.title}</p>
                    {item.details?.message && <p className="mt-1 text-slate-300">{item.details.message}</p>}
                    {item.details?.metadata && <p className="mt-1 text-[10px] text-slate-400 font-mono">{JSON.stringify(item.details.metadata)}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

