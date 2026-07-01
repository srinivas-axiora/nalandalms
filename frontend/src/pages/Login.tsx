import { useState, useEffect, useRef, useCallback } from "react";
import type { FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "../components";
import type { User, AppData, LoginSecurity } from "../types";
import { now } from "../types";
import { apiFetch } from "../api";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const RATE_LIMIT_MAX = 10; // max 10 attempts per minute

type Props = {
  users: User[];
  data: AppData;
  onLogin: (u: User & { sessionVersion?: number; sv?: number }) => void;
  onUpdateSecurity: (next: Record<string, LoginSecurity>) => void;
};

export default function Login({ users, data, onLogin, onUpdateSecurity }: Props) {
  const [email, setEmail] = useState("Super Admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cooldownRemaining, setCooldownRemaining] = useState(0); // ms
  const [rateLimitRemaining, setRateLimitRemaining] = useState(0); // ms
  const rateLimitLog = useRef<number[]>([]); // timestamps of recent login attempts
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rateLimitTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const security = data.loginSecurity || {};

  const getSecurity = useCallback((emailKey: string): LoginSecurity => {
    return security[emailKey] || { failedAttempts: 0, lockedUntil: null, lastFailedAt: null };
  }, [security]);

  // Check if account is currently locked
  const getTimeUntilUnlock = useCallback((emailKey: string): number => {
    const sec = getSecurity(emailKey);
    if (!sec.lockedUntil) return 0;
    const remaining = new Date(sec.lockedUntil).getTime() - Date.now();
    return remaining > 0 ? remaining : 0;
  }, [getSecurity]);

  // Update cooldown on email change or security state change
  useEffect(() => {
    const remaining = getTimeUntilUnlock(email);
    setCooldownRemaining(remaining);

    if (remaining > 0) {
      cooldownTimerRef.current = setInterval(() => {
        const r = getTimeUntilUnlock(email);
        setCooldownRemaining(r);
        if (r <= 0 && cooldownTimerRef.current) {
          clearInterval(cooldownTimerRef.current);
          cooldownTimerRef.current = null;
          // Auto-clear the lockout when timer expires
          const updated = { ...security };
          const sec = getSecurity(email);
          updated[email] = { ...sec, failedAttempts: 0, lockedUntil: null };
          onUpdateSecurity(updated);
        }
      }, 250);
    }

    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }
    };
  }, [email, security, getSecurity, getTimeUntilUnlock, onUpdateSecurity]);

  // Rate-limit timer
  useEffect(() => {
    return () => {
      if (rateLimitTimerRef.current) {
        clearInterval(rateLimitTimerRef.current);
        rateLimitTimerRef.current = null;
      }
    };
  }, []);

  const checkRateLimit = (): boolean => {
    const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
    rateLimitLog.current = rateLimitLog.current.filter((t) => t > cutoff);
    return rateLimitLog.current.length >= RATE_LIMIT_MAX;
  };

  const getRateLimitWait = (): number => {
    if (rateLimitLog.current.length < RATE_LIMIT_MAX) return 0;
    const oldest = rateLimitLog.current[0];
    return Math.max(0, oldest + RATE_LIMIT_WINDOW_MS - Date.now());
  };

  const formatTime = (ms: number): string => {
    const totalSec = Math.ceil(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return min > 0 ? `${min}:${String(sec).padStart(2, "0")}` : `${sec}s`;
  };

  const loginIdFor = (user: User) => user.role === "Super Admin" ? "Super Admin" : user.email;
  const showLoginShortcuts = import.meta.env.DEV;

  const isLocked = cooldownRemaining > 0;
  const isRateLimited = rateLimitRemaining > 0;
  const currentSecurity = getSecurity(email);
  const remainingAttempts = Math.max(0, MAX_ATTEMPTS - currentSecurity.failedAttempts);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (checkRateLimit()) {
      const wait = getRateLimitWait();
      setRateLimitRemaining(wait);
      setError(`Too many login attempts. Please wait ${formatTime(wait)}.`);
      if (!rateLimitTimerRef.current) {
        rateLimitTimerRef.current = setInterval(() => {
          const w = getRateLimitWait();
          setRateLimitRemaining(w);
          if (w <= 0 && rateLimitTimerRef.current) {
            clearInterval(rateLimitTimerRef.current);
            rateLimitTimerRef.current = null;
            setError("");
          }
        }, 250);
      }
      return;
    }

    rateLimitLog.current.push(Date.now());

    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const resData = await res.json();

      if (!res.ok) {
        const updated = { ...security };
        if (resData.lockedUntil) {
          updated[email] = {
            failedAttempts: resData.failedAttempts,
            lockedUntil: resData.lockedUntil,
            lastFailedAt: now(),
          };
          const remaining = new Date(resData.lockedUntil).getTime() - Date.now();
          setError(`Account locked. Try again in ${formatTime(Math.max(0, remaining))}.`);
        } else {
          updated[email] = {
            failedAttempts: resData.failedAttempts || (getSecurity(email).failedAttempts + 1),
            lockedUntil: null,
            lastFailedAt: now(),
          };
          const left = MAX_ATTEMPTS - updated[email].failedAttempts;
          if (left <= 2 && left > 0) {
            setError(`Invalid credentials. ${left} attempt${left === 1 ? "" : "s"} remaining before lockout.`);
          } else {
            setError(resData.error || "Invalid credentials or inactive account.");
          }
        }
        onUpdateSecurity(updated);
        return;
      }

      // Successful login — reset security locally and notify app
      const updated = { ...security };
      updated[email] = { failedAttempts: 0, lockedUntil: null, lastFailedAt: null };
      onUpdateSecurity(updated);
      onLogin(resData.user);
    } catch (err) {
      setError("Failed to connect to the authentication server.");
    }
  };

  const attemptBarWidth = Math.min(100, (currentSecurity.failedAttempts / MAX_ATTEMPTS) * 100);
  const showAttemptWarning = currentSecurity.failedAttempts >= 3 && !isLocked;

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 bg-mesh" />
      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-center p-8 lg:p-16">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm uppercase tracking-[0.45em] text-cyan-200/80">Nalanda</p>
            <h1 className="mt-5 max-w-4xl font-display text-5xl font-semibold tracking-tight text-white md:text-7xl">
              Enterprise learning, governed from one secure command center.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Monitor employee learning activities, analyze skill ratings, and discover development areas — all in one platform.
            </p>
          </motion.div>
        </section>
        <section className="flex items-center justify-center p-6">
          <motion.form onSubmit={submit} initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-xl glow-cyan">
            <h2 className="font-display text-2xl font-semibold text-white">Secure sign in</h2>
            <p className="mt-2 text-sm text-slate-400">Use the listed login IDs. Employees sign in with their mail ID.</p>
            <div className="mt-6 space-y-4">
              <Input label="Login ID" value={email} onChange={setEmail} />
              <Input label="Password" value={password} onChange={setPassword} type="password" />
            </div>

            {/* Failed attempts progress bar */}
            <AnimatePresence>
              {currentSecurity.failedAttempts > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Login attempts</span>
                    <span className={currentSecurity.failedAttempts >= MAX_ATTEMPTS ? "text-rose-300 font-semibold" : currentSecurity.failedAttempts >= 3 ? "text-amber-300" : "text-slate-400"}>
                      {currentSecurity.failedAttempts} / {MAX_ATTEMPTS}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        currentSecurity.failedAttempts >= MAX_ATTEMPTS
                          ? "bg-gradient-to-r from-rose-500 to-red-400"
                          : currentSecurity.failedAttempts >= 3
                          ? "bg-gradient-to-r from-amber-500 to-orange-400"
                          : "bg-gradient-to-r from-cyan-400 to-blue-500"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${attemptBarWidth}%` }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cooldown timer */}
            <AnimatePresence>
              {isLocked && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <motion.div
                      className="h-2.5 w-2.5 rounded-full bg-rose-400"
                      animate={{ scale: [1, 0.6, 1], opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">Account Locked</span>
                  </div>
                  <p className="text-3xl font-display font-bold text-white tabular-nums">
                    {formatTime(cooldownRemaining)}
                  </p>
                  <p className="mt-1 text-xs text-rose-200/70">Too many failed attempts. Please wait.</p>

                  {/* Visual cooldown ring */}
                  <div className="mt-3 flex justify-center">
                    <svg width="48" height="48" viewBox="0 0 48 48" className="transform -rotate-90">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(244,63,94,0.15)" strokeWidth="3" />
                      <motion.circle
                        cx="24" cy="24" r="20"
                        fill="none"
                        stroke="url(#cooldownGrad)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 20}
                        animate={{
                          strokeDashoffset: [0, 2 * Math.PI * 20],
                        }}
                        transition={{
                          duration: LOCKOUT_DURATION_MS / 1000,
                          ease: "linear",
                        }}
                      />
                      <defs>
                        <linearGradient id="cooldownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#fb7185" />
                          <stop offset="100%" stopColor="#f43f5e" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Rate limit warning */}
            <AnimatePresence>
              {isRateLimited && !isLocked && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-3 text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <motion.div
                      className="h-2 w-2 rounded-full bg-amber-400"
                      animate={{ scale: [1, 0.6, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className="text-xs font-semibold text-amber-200">Rate limited — wait {formatTime(rateLimitRemaining)}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Attempt warning */}
            <AnimatePresence>
              {showAttemptWarning && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100 text-center"
                >
                  ⚠️ {remainingAttempts} attempt{remainingAttempts === 1 ? "" : "s"} remaining before lockout
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error message */}
            {error && (
              <p className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-100">{error}</p>
            )}

            <button
              disabled={isRateLimited}
              className={`mt-6 w-full rounded-full px-5 py-3 font-bold transition ${
                isRateLimited
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed opacity-60"
                  : "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:shadow-lg hover:shadow-cyan-400/20"
              }`}
            >
              {isRateLimited ? "Please wait..." : "Sign in"}
            </button>
            {showLoginShortcuts && (
              <div className="mt-6 grid gap-2 text-xs text-slate-400">
                {users.filter((u) => u.status === "Active").map((u) => (
                  <button type="button" key={u.id} onClick={() => setEmail(loginIdFor(u))}
                    className="rounded-2xl border border-white/10 px-3 py-2 text-left transition hover:border-cyan-300/50 hover:bg-white/5">
                    <span className="font-semibold text-cyan-200">{u.role}</span>: {loginIdFor(u)}
                  </button>
                ))}
              </div>
            )}
          </motion.form>
        </section>
      </div>
    </main>
  );
}
