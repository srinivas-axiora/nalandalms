import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { Input } from "../components";
import type { User } from "../types";
import { apiFetch } from "../api";

type Mode = "signin" | "signup" | "forgot";

type Props = {
  users: User[];
  onLogin: (user: User & { sessionVersion?: number; sv?: number }) => void;
};

const resetTokenFromLocation = () => {
  const query = window.location.hash.includes("?")
    ? window.location.hash.slice(window.location.hash.indexOf("?") + 1)
    : "";
  return new URLSearchParams(query).get("token") || "";
};

export default function Login({ users, onLogin }: Props) {
  const initialResetToken = resetTokenFromLocation();
  const [mode, setMode] = useState<Mode>(initialResetToken ? "forgot" : "signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetToken, setResetToken] = useState(initialResetToken);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (retryAfterSeconds <= 0) return;
    const timer = window.setTimeout(() => {
      setRetryAfterSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [retryAfterSeconds]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
    setSuccessMsg("");
    if (next !== "forgot") {
      if (window.location.hash.startsWith("#reset-password?")) {
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
      }
      setResetToken("");
      setNewPassword("");
    }
  };

  const parseError = (body: any, fallback: string) => {
    if (typeof body?.error === "string") return body.error;
    const fields = body?.error?.fieldErrors;
    if (fields) return Object.values(fields).flat().join(", ") || fallback;
    return fallback;
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccessMsg("");
    setSubmitting(true);

    try {
      if (mode === "signup") {
        const response = await apiFetch("/auth/register", {
          method: "POST",
          body: JSON.stringify({ name, email, password }),
        });
        const body = await response.json();
        if (!response.ok) {
          setError(parseError(body, "Registration failed."));
          return;
        }
        onLogin(body.user);
        return;
      }

      if (mode === "forgot") {
        if (!resetToken) {
          const response = await apiFetch("/auth/forgot-password", {
            method: "POST",
            body: JSON.stringify({ email }),
          });
          const body = await response.json();
          if (!response.ok) {
            setError(parseError(body, "Password reset could not be requested."));
            return;
          }
          // Development/test servers may return the token directly. Production
          // delivers a fragment URL through the configured email provider.
          if (body.resetToken) setResetToken(body.resetToken);
          setSuccessMsg(body.message || "If that account exists, reset instructions have been sent.");
          return;
        }

        const response = await apiFetch("/auth/reset-password", {
          method: "POST",
          body: JSON.stringify({ token: resetToken, newPassword }),
        });
        const body = await response.json();
        if (!response.ok) {
          setError(parseError(body, "Password reset failed."));
          return;
        }
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
        setPassword("");
        setNewPassword("");
        setResetToken("");
        setMode("signin");
        setSuccessMsg("Password reset successfully. Sign in with your new password.");
        return;
      }

      const response = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const body = await response.json();
      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = Number.parseInt(response.headers.get("Retry-After") || "60", 10);
          setRetryAfterSeconds(Number.isFinite(retryAfter) ? Math.max(1, Math.min(300, retryAfter)) : 60);
        }
        setError(parseError(body, "Invalid credentials or inactive account."));
        return;
      }

      setRetryAfterSeconds(0);
      onLogin(body.user);
    } catch {
      setError("The authentication service is unavailable. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const loginIdFor = (user: User) => user.role === "Super Admin" ? "Super Admin" : user.email;
  const showLoginShortcuts = import.meta.env.DEV && mode === "signin";
  const throttled = mode === "signin" && retryAfterSeconds > 0;
  const heading = mode === "signup"
    ? "Create learner account"
    : mode === "forgot"
      ? (resetToken ? "Choose a new password" : "Reset your password")
      : "Secure sign in";
  const description = mode === "signup"
    ? "Public registration always creates a learner account."
    : mode === "forgot"
      ? (resetToken ? "Enter a new password for your account." : "We will send a short-lived reset link if the account exists.")
      : "Use your organization email or assigned login ID.";

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
              Monitor learning, assess skills, and govern credentials from one platform.
            </p>
          </motion.div>
        </section>

        <section className="flex items-center justify-center p-6">
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-xl glow-cyan"
          >
            <h2 className="font-display text-2xl font-semibold text-white">{heading}</h2>
            <p className="mt-2 text-sm text-slate-400">{description}</p>

            <div className="mt-6 space-y-4">
              {mode === "signup" && <Input label="Name" value={name} onChange={setName} />}
              {(mode !== "forgot" || !resetToken) && (
                <Input label={mode === "signin" ? "Login ID" : "Email"} value={email} onChange={setEmail} />
              )}
              {mode !== "forgot" && (
                <Input label="Password" value={password} onChange={setPassword} type="password" />
              )}
              {mode === "forgot" && resetToken && (
                <Input label="New password" value={newPassword} onChange={setNewPassword} type="password" />
              )}
            </div>

            {throttled && (
              <p className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-3 text-center text-sm text-amber-100" aria-live="polite">
                Too many requests from this network. Try again in {retryAfterSeconds}s.
              </p>
            )}
            {successMsg && (
              <p className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-100" aria-live="polite">
                {successMsg}
              </p>
            )}
            {error && (
              <p className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-100" role="alert">
                {error}
              </p>
            )}

            <button
              disabled={submitting || throttled}
              className="mt-6 w-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 font-bold text-slate-950 transition hover:shadow-lg hover:shadow-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Please wait..."
                : throttled
                  ? `Try again in ${retryAfterSeconds}s`
                  : mode === "signup"
                    ? "Create account"
                    : mode === "forgot"
                      ? (resetToken ? "Update password" : "Send reset link")
                      : "Sign in"}
            </button>

            <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
              {mode === "signin" && (
                <>
                  <button type="button" onClick={() => switchMode("forgot")} className="text-cyan-200 hover:text-white">Forgot password?</button>
                  <button type="button" onClick={() => switchMode("signup")} className="text-cyan-200 hover:text-white">Create learner account</button>
                </>
              )}
              {mode !== "signin" && (
                <button type="button" onClick={() => switchMode("signin")} className="text-cyan-200 hover:text-white">Back to sign in</button>
              )}
            </div>

            {showLoginShortcuts && (
              <div className="mt-6 grid gap-2 text-xs text-slate-400">
                {users.filter((user) => user.status === "Active").map((user) => (
                  <button
                    type="button"
                    key={user.id}
                    onClick={() => setEmail(loginIdFor(user))}
                    className="rounded-2xl border border-white/10 px-3 py-2 text-left transition hover:border-cyan-300/50 hover:bg-white/5"
                  >
                    <span className="font-semibold text-cyan-200">{user.role}</span>: {loginIdFor(user)}
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
