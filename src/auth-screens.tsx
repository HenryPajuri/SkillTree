/*
 * Login / Signup screens — adapted from Claude Design.
 *
 * Two layouts:
 *   - "split": botanical tree illustration on the left, form on the right (≥880px)
 *   - "centered": single card centered (≤880px, automatic via media query)
 *
 * Wraps Supabase auth: signUp + signInWithPassword.
 */

import { useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "./supabase";
import type { TFn } from "./i18n";

type Mode = "signin" | "signup";

// ---------- Brand mark ----------

function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="auth-bm-tk" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3D2F24" />
          <stop offset="55%" stopColor="#5C4A3A" />
          <stop offset="100%" stopColor="#7A6856" />
        </linearGradient>
      </defs>
      <path d="M 17.4 47 L 18.4 32 Q 18.8 24 19.4 18 L 20.6 18 Q 21.2 24 21.6 32 L 22.6 47 Z" fill="url(#auth-bm-tk)" />
      <path d="M 19.5 28 Q 19.8 35 19.6 42" stroke="#3D2F24" strokeWidth="0.5" fill="none" opacity="0.6" />
      <path d="M 20 22 Q 14 19 9.5 17.5" stroke="#5C4A3A" strokeWidth="1.7" fill="none" strokeLinecap="round" />
      <path d="M 20 22 Q 26 19 30.5 17.5" stroke="#5C4A3A" strokeWidth="1.7" fill="none" strokeLinecap="round" />
      <path d="M 20 18 Q 20 13 20 9" stroke="#5C4A3A" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M 20 3 C 30 3 37 9 37 15 C 37 20 33 23 28 23 C 30 25 27 28 22 27 C 21 27 20 27 19 27.5 C 14 28 11 25 13 23 C 8 23 3 20 3 15 C 3 9 10 3 20 3 Z" fill="#5B8472" />
      <path d="M 9 19 C 12 24 17 26 20 25 C 23 26 28 24 31 19 C 27 22 22 22 20 21 C 18 22 13 22 9 19 Z" fill="#3F6353" opacity="0.45" />
      <ellipse cx="17" cy="8" rx="7" ry="3.5" fill="#A8C7B5" opacity="0.7" />
      <ellipse cx="26" cy="12" rx="4" ry="2.5" fill="#A8C7B5" opacity="0.55" />
      <path d="M 8.5 12 Q 11 13 11 16 Q 9 17 7.5 15.5 Q 7 13.5 8.5 12 Z" fill="#3F6353" opacity="0.7" />
      <path d="M 11 15 Q 13 16 13.5 19 Q 11.5 19.5 10 18 Q 9.5 16 11 15 Z" fill="#3F6353" opacity="0.6" />
      <path d="M 31 11 Q 33.5 12 33.5 15 Q 31.5 16 30 14.5 Q 29.5 12 31 11 Z" fill="#3F6353" opacity="0.65" />
      <path d="M 28 17 Q 30 18 30 21 Q 28 21.5 26.5 20 Q 26 18 28 17 Z" fill="#3F6353" opacity="0.55" />
      <path d="M 15 22 Q 17 23 17 25 Q 15 25.5 14 24 Q 13.5 22.5 15 22 Z" fill="#3F6353" opacity="0.5" />
      <path d="M 22 24 Q 24 24.5 24.5 26 Q 23 27 21.5 26 Q 21 24.5 22 24 Z" fill="#3F6353" opacity="0.55" />
      <g transform="translate(25 9)">
        <ellipse cx="0" cy="-2.3" rx="1.4" ry="1.7" fill="#E8B5C0" />
        <ellipse cx="2.2" cy="-0.7" rx="1.4" ry="1.7" transform="rotate(72)" fill="#E8B5C0" />
        <ellipse cx="1.4" cy="1.9" rx="1.4" ry="1.7" transform="rotate(144)" fill="#E8B5C0" />
        <ellipse cx="-1.4" cy="1.9" rx="1.4" ry="1.7" transform="rotate(216)" fill="#E8B5C0" />
        <ellipse cx="-2.2" cy="-0.7" rx="1.4" ry="1.7" transform="rotate(288)" fill="#E8B5C0" />
        <circle cx="0" cy="0" r="0.9" fill="#C97A8B" />
        <circle cx="0" cy="0" r="0.4" fill="#F3DCA7" />
      </g>
      <g transform="translate(11 18)">
        <ellipse cx="0" cy="-1.6" rx="1" ry="1.2" fill="#E8B5C0" />
        <ellipse cx="1.5" cy="-0.5" rx="1" ry="1.2" transform="rotate(72)" fill="#E8B5C0" />
        <ellipse cx="0.95" cy="1.3" rx="1" ry="1.2" transform="rotate(144)" fill="#E8B5C0" />
        <ellipse cx="-0.95" cy="1.3" rx="1" ry="1.2" transform="rotate(216)" fill="#E8B5C0" />
        <ellipse cx="-1.5" cy="-0.5" rx="1" ry="1.2" transform="rotate(288)" fill="#E8B5C0" />
        <circle cx="0" cy="0" r="0.6" fill="#C97A8B" />
      </g>
      <circle cx="32" cy="20" r="1.2" fill="#E8B5C0" />
      <circle cx="32" cy="20" r="0.5" fill="#C97A8B" />
    </svg>
  );
}


// ---------- Form icons ----------

const Icons = {
  mail: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M 3 7 L 12 13 L 21 7" />
    </svg>
  ),
  lock: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M 8 11 V 8 a 4 4 0 0 1 8 0 v 3" />
    </svg>
  ),
  person: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M 4 21 a 8 8 0 0 1 16 0" />
    </svg>
  ),
  eye: (open: boolean): ReactNode => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 2 12 C 5 6 9 4 12 4 C 15 4 19 6 22 12 C 19 18 15 20 12 20 C 9 20 5 18 2 12 Z" />
      <circle cx="12" cy="12" r="3" />
      {!open && <path d="M 4 4 L 20 20" stroke="currentColor" strokeWidth="1.6" />}
    </svg>
  ),
};

// ---------- AuthForm ----------

function AuthForm({ mode, onSwitch, t }: { mode: Mode; onSwitch: (m: Mode) => void; t: TFn }) {
  const [showPw, setShowPw] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error: err } = await supabase.auth.signUp({
          email, password,
          options: { data: { name: name || undefined } },
        });
        if (err) throw err;
        if (data.user && !data.session) {
          setInfo("Check your email to confirm your account.");
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={submit}>
      <h1 className="auth-title">
        {mode === "signup" ? "Plant your tree" : "Welcome back"}
      </h1>
      <p className="auth-sub">
        {mode === "signup"
          ? "Pick a craft. Track your seasons. Watch it grow."
          : "Sign in to keep growing your skills."}
      </p>

      <div className="mode-toggle" role="tablist">
        <button type="button" role="tab"
          className={mode === "signin" ? "is-active" : ""}
          onClick={() => onSwitch("signin")}>Sign in</button>
        <button type="button" role="tab"
          className={mode === "signup" ? "is-active" : ""}
          onClick={() => onSwitch("signup")}>Create account</button>
      </div>

      {mode === "signup" && (
        <div className="field">
          <label htmlFor="name">Your name</label>
          <div className="input-wrap">
            <span className="input-icon">{Icons.person}</span>
            <input id="name" className="input" type="text" placeholder="Casey Rivers"
              value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>
      )}

      <div className="field">
        <label htmlFor="email">Email</label>
        <div className="input-wrap">
          <span className="input-icon">{Icons.mail}</span>
          <input id="email" className="input" type="email" placeholder="you@example.com"
            autoComplete="email" required
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>
        <div className="input-wrap">
          <span className="input-icon">{Icons.lock}</span>
          <input id="password" className="input"
            type={showPw ? "text" : "password"}
            placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required minLength={mode === "signup" ? 8 : undefined}
            value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="button" className="input-toggle"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? "Hide password" : "Show password"}>
            {Icons.eye(showPw)}
          </button>
        </div>
      </div>

      {error && <p className="auth-error">{error}</p>}
      {info && <p className="auth-info">{info}</p>}

      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? "…" : mode === "signup" ? "Plant my tree" : "Sign in"}
      </button>

      <p className="footer-cta">
        {mode === "signin" ? (
          <>New here?
            <a href="#" onClick={(e) => { e.preventDefault(); onSwitch("signup"); }}>Create an account</a>
          </>
        ) : (
          <>Already have an account?
            <a href="#" onClick={(e) => { e.preventDefault(); onSwitch("signin"); }}>Sign in</a>
          </>
        )}
      </p>

      <p className="auth-tagline">{t("tagline")}</p>
    </form>
  );
}

// ---------- Layout ----------

export default function AuthScreens({ t, initialMode = "signup", onBack }: {
  t: TFn; initialMode?: Mode; onBack?: () => void;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);

  return (
    <div className="auth-root auth-root-centered">
      {onBack && (
        <button className="auth-back" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t("back")}
        </button>
      )}
      <main className="auth-form-side">
        <div className="auth-card">
          <a href="#" className="auth-brand" onClick={(e) => e.preventDefault()}>
            <BrandMark size={32} />
            <span className="auth-brand-name">SkillTree</span>
          </a>
          <AuthForm mode={mode} onSwitch={setMode} t={t} />
        </div>
      </main>
    </div>
  );
}
