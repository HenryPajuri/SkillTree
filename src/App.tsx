import { useEffect, useState, useMemo } from "react";
import type { Session } from "@supabase/supabase-js";
import SkillTreeV2 from "./skilltree-v2";
import AuthScreens from "./auth-screens";
import LandingPage from "./landing";
import { supabase } from "./supabase";
import { makeT } from "./i18n";
import type { Lang } from "./i18n";

type View = "landing" | "auth";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [view, setView] = useState<View>("landing");

  // Auth-gate language matches the user's saved preference so the tagline
  // and labels on the auth screen are already localized.
  const lang: Lang = (() => {
    try {
      const v = localStorage.getItem("skilltree-v2-lang");
      return v === "et" ? "et" : "en";
    } catch { return "en"; }
  })();
  const t = useMemo(() => makeT(lang), [lang]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (checking) {
    return <div className="auth-loading" />;
  }

  if (session) {
    return <SkillTreeV2 session={session} />;
  }

  if (view === "auth") {
    return <AuthScreens t={t} onBack={() => setView("landing")} />;
  }

  return <LandingPage onPlant={() => setView("auth")} />;
}
