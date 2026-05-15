import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import type { CSSProperties } from "react";
import { SkillTree } from "./tree-svg";
import type { SkillState } from "./tree-svg";
import { makeT } from "./i18n";
import type { Lang, TFn } from "./i18n";
import StatsModal, { computeStats, dayKey } from "./stats-modal";
import WelcomeModal from "./welcome-modal";
import { supabase } from "./supabase";
import type { Session } from "@supabase/supabase-js";

// ---------- DATA ----------

type IconKind = "music-note" | "music-bar" | "diamond" | "diamond-stroke" | "spark";
type LocalizedText = { en: string; et: string };

interface Skill {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  icon: IconKind;
  xp: number;
  maxXp: number;
  parents: string[]; // skill ids that must be bloomed to unlock this
  tutorial?: { title: string; url: string };
}

// Quick helper that's used in many places below.
const tx = (text: LocalizedText, lang: Lang): string => text[lang];

interface TreeData {
  title: string;
  subtitle: string;
  skills: Record<string, Skill>;
}

// Standard 9-node structure; ids match LAYOUTS.balanced anchors.
// Parents define what must be in bloom before this skill becomes "bare" (ready).
const TREES: Record<string, TreeData> = {
  guitar: {
    title: "Grow",
    subtitle: "From first strum to jazz voicings",
    skills: {
      t0: { id: "t0",
        name: { en: "The Basics", et: "Põhitõed" },
        description: { en: "Holding, tuning, and your first notes", et: "Hoidmine, häälestamine ja esimesed noodid" },
        icon: "music-note", xp: 0, maxXp: 120, parents: [],
        tutorial: { title: "Beginner Day 1: Guitar Quick Start (JustinGuitar)", url: "https://www.justinguitar.com/guitar-lessons/beginner-day-1-guitar-quick-start-aw-007" } },
      tm1: { id: "tm1",
        name: { en: "Music Theory", et: "Muusikateooria" },
        description: { en: "Scales, intervals, and the language of harmony", et: "Skaalad, intervallid ja harmoonia keel" },
        icon: "diamond-stroke", xp: 0, maxXp: 200, parents: ["t0"],
        tutorial: { title: "Music Theory for Guitar (samuraiguitarist)", url: "https://www.youtube.com/watch?v=o-qNepGpI3U" } },
      t1a: { id: "t1a",
        name: { en: "Open Chords", et: "Avatud akordid" },
        description: { en: "The shapes that unlock every campfire song", et: "Kujundid, mis avavad iga lõkkelaulu" },
        icon: "music-bar", xp: 0, maxXp: 200, parents: ["tm1"],
        tutorial: { title: "First 7 Chords To Learn on Guitar (Andy Guitar)", url: "https://www.youtube.com/watch?v=R_qmvyUDvEc" } },
      t1b: { id: "t1b",
        name: { en: "Strumming", et: "Akordilöögid" },
        description: { en: "Finding your groove and solid timing", et: "Oma rütmi ja tugeva ajatuse leidmine" },
        icon: "diamond", xp: 0, maxXp: 200, parents: ["tm1"],
        tutorial: { title: "THE Strumming Pattern (JustinGuitar)", url: "https://www.justinguitar.com/guitar-lessons/the-strumming-pattern-b1-404" } },
      t2a: { id: "t2a",
        name: { en: "Barre Chords", et: "Barré-akordid" },
        description: { en: "Moveable shapes that open the entire fretboard", et: "Liikuvad kujundid, mis avavad kogu kaela" },
        icon: "diamond-stroke", xp: 0, maxXp: 300, parents: ["t1a"],
        tutorial: { title: "Fail-Proof Guide To Easy Barre Chords on Guitar (JustinGuitar)", url: "https://www.youtube.com/watch?v=IxXG5S8vSd8&t=5s" } },
      t2b: { id: "t2b",
        name: { en: "Fingerpicking", et: "Sõrmemäng" },
        description: { en: "Delicate patterns with individual fingers", et: "Õrnad mustrid eraldi sõrmedega" },
        icon: "spark", xp: 0, maxXp: 300, parents: ["t1a"],
        tutorial: { title: "Introduction to Fingerstyle Guitar (JustinGuitar)", url: "https://www.justinguitar.com/guitar-lessons/introduction-to-fingerstyle-guitar-bg-1105" } },
      t2c: { id: "t2c",
        name: { en: "Songwriting", et: "Lugude loomine" },
        description: { en: "Composing your own pieces and progressions", et: "Oma palade ja akordijärgnevuste loomine" },
        icon: "spark", xp: 0, maxXp: 350, parents: ["t1b"],
        tutorial: { title: "How To Write Chord Progressions — Songwriting Basics (Signals Music Studio)", url: "https://www.youtube.com/watch?v=M8eItITv8QA" } },
      tm2: { id: "tm2",
        name: { en: "Improvisation", et: "Improvisatsioon" },
        description: { en: "Speaking in scales and shaping a solo on the fly", et: "Skaaladega rääkimine ja soolo loomine lennult" },
        icon: "spark", xp: 0, maxXp: 400, parents: ["t2a", "t2b", "t2c"],
        tutorial: { title: "Minor Pentatonic: The 5 Patterns (JustinGuitar)", url: "https://www.justinguitar.com/guitar-lessons/minor-pentatonic-the-5-patterns-sc-304" } },
      t3: { id: "t3",
        name: { en: "Jazz Voicings", et: "Džässakordid" },
        description: { en: "Extended chords and advanced harmony", et: "Laiendatud akordid ja edasijõudnute harmoonia" },
        icon: "spark", xp: 0, maxXp: 500, parents: ["tm2"],
        tutorial: { title: "The Ultimate Jazz Chord Guide (Jens Larsen)", url: "https://jenslarsen.nl/the-ultimate-jazz-chord-guide-12-most-important-voicing-types/" } },
    },
  },
  cooking: {
    title: "Grow",
    subtitle: "From boiling water to plated dinners",
    skills: {
      t0: { id: "t0",
        name: { en: "Knife Skills", et: "Noaoskused" },
        description: { en: "Dice, julienne, chiffonade — the foundation", et: "Kuubikud, peenikesed ribad, lehed — alus" },
        icon: "music-note", xp: 0, maxXp: 120, parents: [],
        tutorial: { title: "Knife Skills: How to Chop (Serious Eats)", url: "https://www.youtube.com/watch?v=XyS915RynEQ" } },
      tm1: { id: "tm1",
        name: { en: "Seasoning", et: "Maitsestamine" },
        description: { en: "Salt, acid, fat, heat — balancing the elements", et: "Sool, hape, rasv, kuumus — elementide tasakaal" },
        icon: "diamond-stroke", xp: 0, maxXp: 180, parents: ["t0"],
        tutorial: { title: "Samin Nosrat on Salt, Fat, Acid, Heat (The Splendid Table)", url: "https://www.splendidtable.org/story/2017/05/05/samin-nosrat-on-mastering-salt-fat-acid-and-heat" } },
      t1a: { id: "t1a",
        name: { en: "Eggs", et: "Munad" },
        description: { en: "Scrambles, omelets, poached — perfect every time", et: "Munaroad, omletid, vesimunad — alati ideaalsed" },
        icon: "music-bar", xp: 0, maxXp: 200, parents: ["tm1"],
        tutorial: { title: "Really Good Scrambled Eggs (Kenji López-Alt)", url: "https://www.youtube.com/watch?v=CXTnq7srJRs" } },
      t1b: { id: "t1b",
        name: { en: "Stocks", et: "Puljongid" },
        description: { en: "Building flavor from bones and scraps", et: "Maitse ehitamine kontidest ja jäänustest" },
        icon: "diamond", xp: 0, maxXp: 220, parents: ["tm1"],
        tutorial: { title: "The Ultimate Guide to Amazing Chicken Stock", url: "https://www.youtube.com/watch?v=rjDHii3Ngj8" } },
      t2a: { id: "t2a",
        name: { en: "Pasta", et: "Pasta" },
        description: { en: "Doughs, shapes, and sauces that cling", et: "Taignad, kujud ja kastmed, mis hoiavad kinni" },
        icon: "diamond-stroke", xp: 0, maxXp: 280, parents: ["t1a"],
        tutorial: { title: "Homemade Fresh Egg Pasta (Serious Eats)", url: "https://www.seriouseats.com/fresh-egg-pasta" } },
      t2b: { id: "t2b",
        name: { en: "Searing", et: "Pruunistamine" },
        description: { en: "Crusts, Maillard, and resting meat right", et: "Koorikud, Maillard ja liha õige puhkamine" },
        icon: "spark", xp: 0, maxXp: 280, parents: ["t1a"],
        tutorial: { title: "The Reverse Sear (Kenji's Cooking Show)", url: "https://www.youtube.com/watch?v=pO8TUuSv7HA" } },
      t2c: { id: "t2c",
        name: { en: "Sauces", et: "Kastmed" },
        description: { en: "The five mother sauces and what builds from them", et: "Viis emakastet ja see, mis nendest ehitub" },
        icon: "spark", xp: 0, maxXp: 320, parents: ["t1b"],
        tutorial: { title: "How to Make the Five Mother Sauces (Escoffier)", url: "https://www.escoffier.edu/blog/recipes/how-to-make-the-five-mother-sauces/" } },
      tm2: { id: "tm2",
        name: { en: "Timing", et: "Ajastus" },
        description: { en: "Composing a multi-course dinner that lands hot", et: "Mitmekäigulise õhtusöögi loomine, mis jõuab lauale soojalt" },
        icon: "spark", xp: 0, maxXp: 400, parents: ["t2a", "t2b", "t2c"],
        tutorial: { title: "7 Rules for Cooking a Multi-Course Meal with Confidence (The Kitchn)", url: "https://www.thekitchn.com/7-rules-for-cooking-a-multi-course-meal-with-confidence-221411" } },
      t3: { id: "t3",
        name: { en: "Plating", et: "Serveerimine" },
        description: { en: "Turning a dish into something you stop to look at", et: "Toidu muutmine millekski, mille pärast peatud" },
        icon: "spark", xp: 0, maxXp: 500, parents: ["tm2"],
        tutorial: { title: "The 6 Rules of Plating (Epicurious 101)", url: "https://www.youtube.com/watch?v=T2leakA9Uo8" } },
    },
  },
  drawing: {
    title: "Grow",
    subtitle: "From contour lines to compositions",
    skills: {
      t0: { id: "t0",
        name: { en: "Line", et: "Joon" },
        description: { en: "Confident marks drawn from the shoulder", et: "Enesekindlad jooned õlast tõmmatuna" },
        icon: "music-note", xp: 0, maxXp: 100, parents: [],
        tutorial: { title: "Drawabox Lesson 1: Superimposed Lines", url: "https://drawabox.com/lesson/1/superimposedlines" } },
      tm1: { id: "tm1",
        name: { en: "Gesture", et: "Žest" },
        description: { en: "Capturing motion and weight in a few strokes", et: "Liikumise ja raskuse tabamine mõne tõmbega" },
        icon: "diamond-stroke", xp: 0, maxXp: 180, parents: ["t0"],
        tutorial: { title: "How to Draw Gesture (Proko)", url: "https://www.proko.com/course-lesson/how-to-draw-gesture/" } },
      t1a: { id: "t1a",
        name: { en: "Shape", et: "Kuju" },
        description: { en: "Breaking the world into flat silhouettes", et: "Maailma jaotamine lameneteks siluettideks" },
        icon: "music-bar", xp: 0, maxXp: 200, parents: ["tm1"],
        tutorial: { title: "Good Shapes — 10 Minutes To Better Painting (Marco Bucci)", url: "https://www.youtube.com/watch?v=-ZknWKTpc90" } },
      t1b: { id: "t1b",
        name: { en: "Value", et: "Toon" },
        description: { en: "Light, dark, and the contrast in between", et: "Hele, tume ja nende vaheline kontrast" },
        icon: "diamond", xp: 0, maxXp: 200, parents: ["tm1"],
        tutorial: { title: "Light and Shadow — 10 Minutes To Better Painting (Marco Bucci)", url: "https://www.youtube.com/watch?v=xcCJ2CU-bFw" } },
      t2a: { id: "t2a",
        name: { en: "Form", et: "Vorm" },
        description: { en: "Turning silhouettes into three-dimensional volume", et: "Siluettide muutmine kolmemõõtmeliseks ruumiks" },
        icon: "diamond-stroke", xp: 0, maxXp: 280, parents: ["t1a"],
        tutorial: { title: "Structure Basics — Making Things Look 3D (Proko)", url: "https://www.proko.com/course-lesson/structure-basics-making-things-look-3d" } },
      t2b: { id: "t2b",
        name: { en: "Perspective", et: "Perspektiiv" },
        description: { en: "One, two, and three-point spatial drawing", et: "Ühe-, kahe- ja kolmepunktiline ruumijoonistamine" },
        icon: "spark", xp: 0, maxXp: 300, parents: ["t1a"],
        tutorial: { title: "One-Point Perspective (Proko)", url: "https://www.proko.com/course-lesson/one-point-perspective" } },
      t2c: { id: "t2c",
        name: { en: "Texture", et: "Tekstuur" },
        description: { en: "Surface marks — rough, smooth, soft, hard", et: "Pinnamärgid — krobeline, sile, pehme, kõva" },
        icon: "spark", xp: 0, maxXp: 280, parents: ["t1b"],
        tutorial: { title: "Drawabox Lesson 2: Texture and Detail", url: "https://drawabox.com/lesson/2/2" } },
      tm2: { id: "tm2",
        name: { en: "Color Theory", et: "Värviteooria" },
        description: { en: "Hue, saturation, temperature, and harmony", et: "Toon, küllastatus, temperatuur ja harmoonia" },
        icon: "spark", xp: 0, maxXp: 380, parents: ["t2a", "t2b", "t2c"],
        tutorial: { title: "Color Theory Basics for Digital Painters", url: "https://www.youtube.com/watch?v=P0P8iGs2jWI" } },
      t3: { id: "t3",
        name: { en: "Composition", et: "Kompositsioon" },
        description: { en: "Arranging the eye through a finished scene", et: "Pilgu juhtimine läbi valmis stseeni" },
        icon: "spark", xp: 0, maxXp: 500, parents: ["tm2"],
        tutorial: { title: "Visual Language — 10 Minutes To Better Painting (Marco Bucci)", url: "https://www.youtube.com/watch?v=9fknSkyN6_0" } },
    },
  },
};

const NODE_IDS = ["t0", "tm1", "t1a", "t1b", "t2a", "t2b", "t2c", "tm2", "t3"];

// ---------- STATE DERIVATION ----------

function deriveState(skill: Skill, allSkills: Record<string, Skill>): SkillState {
  if (skill.xp >= skill.maxXp) return "bloom";
  if (skill.xp > 0) return "budding";
  // A skill unlocks as soon as ALL parents have ANY progress — you can pick up
  // chords or strumming while still working through music theory.
  const parentsReady = skill.parents.every((pid) => {
    const p = allSkills[pid];
    return p && p.xp > 0;
  });
  return parentsReady ? "bare" : "dormant";
}

function deriveAllStates(skills: Record<string, Skill>): Record<string, SkillState> {
  const out: Record<string, SkillState> = {};
  for (const id of Object.keys(skills)) {
    out[id] = deriveState(skills[id], skills);
  }
  return out;
}

const STATE_COLORS: Record<SkillState, { fill: string; stroke: string; icon: string; label: string }> = {
  bloom:   { fill: "#2D4A3E", stroke: "#2D4A3E", icon: "#FAF6F0", label: "#2D4A3E" },
  budding: { fill: "#C8956C", stroke: "#C8956C", icon: "#FAF6F0", label: "#A67448" },
  bare:    { fill: "#FAF6F0", stroke: "#2D4A3E", icon: "#2D4A3E", label: "#5C4A3A" },
  dormant: { fill: "#FAF6F0", stroke: "#C5BBAE", icon: "#C5BBAE", label: "#B5ADA0" },
};

// ---------- ICON GLYPHS ----------

function NodeIcon({ kind, color }: { kind: IconKind; color: string }) {
  if (kind === "music-note") {
    return (
      <g fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M -3 5 L -3 -6 L 5 -8 L 5 3" />
        <ellipse cx="-5" cy="5" rx="3" ry="2.2" fill={color} stroke="none" />
        <ellipse cx="3" cy="3" rx="3" ry="2.2" fill={color} stroke="none" />
      </g>
    );
  }
  if (kind === "music-bar") {
    return (
      <g fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round">
        <path d="M -5 5 L -5 -6" />
        <path d="M 5 3 L 5 -8" />
        <path d="M -5 -6 L 5 -8" />
        <ellipse cx="-6" cy="5" rx="2.2" ry="1.6" fill={color} stroke="none" />
        <ellipse cx="4" cy="3" rx="2.2" ry="1.6" fill={color} stroke="none" />
      </g>
    );
  }
  if (kind === "diamond") {
    return <path d="M 0 -7 L 7 0 L 0 7 L -7 0 Z" fill={color} />;
  }
  if (kind === "diamond-stroke") {
    return <path d="M 0 -7 L 7 0 L 0 7 L -7 0 Z" fill="none" stroke={color} strokeWidth="1.6" />;
  }
  // spark
  return <path d="M 0 -8 Q 1.5 -1.5 8 0 Q 1.5 1.5 0 8 Q -1.5 1.5 -8 0 Q -1.5 -1.5 0 -8 Z" fill={color} />;
}

// ---------- PRACTICE SHEET ----------

function PracticeSheet({ skill, state, t, lang, onClose, onLogXp, onReset }: {
  skill: Skill; state: SkillState; t: TFn; lang: Lang;
  onClose: () => void;
  onLogXp: (id: string, amount: number) => void;
  onReset: (id: string) => void;
}) {
  const [pending, setPending] = useState<number | null>(null);
  const isDone = state === "bloom";
  const isLocked = state === "dormant";

  const handleLog = (amt: number) => {
    setPending(amt);
    setTimeout(() => {
      onLogXp(skill.id, amt);
      setPending(null);
    }, 350);
  };

  const progressPct = Math.min(100, Math.round((skill.xp / skill.maxXp) * 100));
  const stateColor = STATE_COLORS[state];
  const stateLabelKey = ({
    bloom: "inBloom", budding: "budding", bare: "bareBranch", dormant: "dormant",
  } as const)[state];

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grab" />

        <div className="sheet-header">
          <div className="sheet-icon" style={{ background: stateColor.fill, borderColor: stateColor.stroke }}>
            <svg viewBox="-12 -12 24 24" width="32" height="32"><NodeIcon kind={skill.icon} color={stateColor.icon} /></svg>
          </div>
          <div style={{ flex: 1 }}>
            <h3 className="sheet-title">{tx(skill.name, lang)}</h3>
            <p className="sheet-desc">{tx(skill.description, lang)}</p>
          </div>
        </div>

        <div className="sheet-progress">
          <div className="sheet-progress-row">
            <span>{isLocked ? t("prerequisitesNeeded") : `${skill.xp} ${t("ofXp")} ${skill.maxXp} ${t("xp")}`}</span>
            <span style={{ color: stateColor.label, fontWeight: 600 }}>
              {t(stateLabelKey)}{!isLocked && !isDone ? ` · ${progressPct}%` : ""}
            </span>
          </div>
          <div className="sheet-progress-track">
            <div className="sheet-progress-fill"
              style={{ width: `${progressPct}%`, background: `linear-gradient(90deg, ${stateColor.fill}88, ${stateColor.fill})` }} />
          </div>
        </div>

        {!isLocked && !isDone && (
          <div className="sheet-log">
            <p className="sheet-log-label">{t("logPractice")}</p>
            <div className="sheet-log-buttons">
              {[
                { amt: 10, labelKey: "quickSession", timeKey: "about15min" },
                { amt: 25, labelKey: "solidPractice", timeKey: "about30min" },
                { amt: 50, labelKey: "deepWork", timeKey: "about1hour" },
              ].map(({ amt, labelKey, timeKey }) => {
                const active = pending === amt;
                return (
                  <button key={amt} className={`log-btn${active ? " is-active" : ""}`} onClick={() => handleLog(amt)}
                    style={active ? { background: stateColor.fill, borderColor: stateColor.fill } : undefined}>
                    <span className="log-amt" style={active ? { color: "#FAF6F0" } : undefined}>+{amt}</span>
                    <span className="log-label" style={active ? { color: "#FAF6F0" } : undefined}>{t(labelKey as "quickSession")}</span>
                    <span className="log-time" style={active ? { color: "#FAF6F0CC" } : undefined}>{t(timeKey as "about15min")}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isDone && <p className="sheet-done">{t("branchBloomed")}</p>}
        {isLocked && <p className="sheet-locked">{t("unlockHint")}</p>}

        {skill.tutorial && (
          <div className="sheet-tutorial">
            <p className="sheet-tutorial-label">{t("recommendIntro")}</p>
            <a className="sheet-tutorial-link" href={skill.tutorial.url}
              target="_blank" rel="noopener noreferrer">
              {skill.tutorial.title}
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M3 9 L9 3 M5 3 H9 V7" stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        )}

        {skill.xp > 0 && (
          <button className="sheet-reset" onClick={() => onReset(skill.id)}>
            {t("resetSkill", { skill: tx(skill.name, lang) })}
          </button>
        )}
      </div>
    </div>
  );
}

// ---------- MAIN APP ----------

const STORAGE_KEY = "skilltree-v2-data";
const STORAGE_HISTORY_KEY = "skilltree-v2-history";
const STORAGE_LANG_KEY = "skilltree-v2-lang";
const STORAGE_WELCOMED_KEY = "skilltree-v2-welcomed";

function loadXp(): Record<string, Record<string, number>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function loadHistory(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function loadLang(): Lang {
  try {
    const v = localStorage.getItem(STORAGE_LANG_KEY);
    if (v === "en" || v === "et") return v;
  } catch { /* ignore */ }
  return "en";
}

function applyXp(trees: Record<string, TreeData>, saved: Record<string, Record<string, number>>): Record<string, TreeData> {
  const out: Record<string, TreeData> = {};
  for (const [tree, data] of Object.entries(trees)) {
    const next: TreeData = { ...data, skills: {} };
    const savedTree = saved[tree] || {};
    for (const [id, skill] of Object.entries(data.skills)) {
      next.skills[id] = { ...skill, xp: Math.min(savedTree[id] ?? skill.xp, skill.maxXp) };
    }
    out[tree] = next;
  }
  return out;
}

export default function SkillTreeV2({ session }: { session: Session }) {
  const userEmail = session.user.email ?? "";
  const userName = (session.user.user_metadata?.name as string | undefined) || userEmail.split("@")[0] || "User";
  const userInitial = userName.charAt(0).toUpperCase();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const handleSignOut = async () => { await supabase.auth.signOut(); };

  const [activeTree, setActiveTree] = useState<string>("guitar");
  const [trees, setTrees] = useState<Record<string, TreeData>>(() => applyXp(TREES, loadXp()));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bloomBursts, setBloomBursts] = useState<Record<string, number>>({});
  // Bursts that happened while the practice sheet was open — drained when it closes
  // so the user actually sees the petal explosion (otherwise it plays behind the
  // sheet's blurred backdrop). Stored in a ref since render never reads it directly.
  const pendingBurstsRef = useRef<string[]>([]);
  const [resetMenuOpen, setResetMenuOpen] = useState(false);
  const [congratsTree, setCongratsTree] = useState<string | null>(null);
  const [history, setHistory] = useState<Record<string, number>>(() => loadHistory());
  const [lang, setLang] = useState<Lang>(() => loadLang());
  const [statsOpen, setStatsOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(() => {
    try { return localStorage.getItem(STORAGE_WELCOMED_KEY) !== "true"; }
    catch { return true; }
  });

  const t = useMemo(() => makeT(lang), [lang]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(history)); } catch { /* ignore */ }
  }, [history]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_LANG_KEY, lang); } catch { /* ignore */ }
  }, [lang]);

  const dismissWelcome = useCallback(() => {
    setWelcomeOpen(false);
    try { localStorage.setItem(STORAGE_WELCOMED_KEY, "true"); } catch { /* ignore */ }
  }, []);
  const [undo, setUndo] = useState<{ message: string; snapshot: Record<string, TreeData>; ts: number } | null>(null);
  const undoTimerRef = useRef<number | null>(null);

  const showUndo = useCallback((message: string, snapshot: Record<string, TreeData>) => {
    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);
    setUndo({ message, snapshot, ts: Date.now() });
    undoTimerRef.current = window.setTimeout(() => setUndo(null), 5000);
  }, []);

  const performUndo = useCallback(() => {
    if (!undo) return;
    setTrees(undo.snapshot);
    setBloomBursts({});
    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);
    setUndo(null);
  }, [undo]);

  useEffect(() => () => {
    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);
  }, []);

  const tree = trees[activeTree];
  const states = deriveAllStates(tree.skills);
  const bloomedCount = Object.values(states).filter((s) => s === "bloom").length;
  const totalCount = Object.keys(tree.skills).length;

  // Persist XP whenever trees change
  useEffect(() => {
    const payload: Record<string, Record<string, number>> = {};
    for (const [name, data] of Object.entries(trees)) {
      payload[name] = {};
      for (const [id, sk] of Object.entries(data.skills)) {
        payload[name][id] = sk.xp;
      }
    }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch { /* ignore */ }
  }, [trees]);

  const handleLogXp = useCallback((skillId: string, amount: number) => {
    let actualGain = 0;
    setTrees((prev) => {
      const next = { ...prev };
      const curTree = next[activeTree];
      const skill = curTree.skills[skillId];
      if (!skill) return prev;

      const wasBloom = skill.xp >= skill.maxXp;
      const newXp = Math.min(skill.xp + amount, skill.maxXp);
      actualGain = newXp - skill.xp;
      const willBloom = newXp >= skill.maxXp;

      next[activeTree] = {
        ...curTree,
        skills: { ...curTree.skills, [skillId]: { ...skill, xp: newXp } },
      };

      if (!wasBloom && willBloom) {
        // Defer burst if sheet is open — drained on close. Otherwise fire immediately.
        if (selectedId !== null) {
          if (!pendingBurstsRef.current.includes(skillId)) {
            pendingBurstsRef.current.push(skillId);
          }
        } else {
          setBloomBursts((b) => ({ ...b, [skillId]: (b[skillId] || 0) + 1 }));
        }
        const allBloomed = Object.values(next[activeTree].skills)
          .every((s) => s.xp >= s.maxXp);
        if (allBloomed) setCongratsTree(activeTree);
      }

      return next;
    });

    // Track effort in the daily history (capped at maxXp gain, so no extra credit
    // for clicking +50 on a skill that only had 10 left).
    if (actualGain > 0) {
      const today = dayKey(new Date());
      setHistory((h) => ({ ...h, [today]: (h[today] || 0) + actualGain }));
    }
  }, [activeTree, selectedId]);

  const closeSheet = useCallback(() => {
    setSelectedId(null);
    const pending = pendingBurstsRef.current;
    if (pending.length > 0) {
      setBloomBursts((b) => {
        const next = { ...b };
        for (const id of pending) next[id] = (next[id] || 0) + 1;
        return next;
      });
      pendingBurstsRef.current = [];
    }
  }, []);

  const switchTree = (key: string) => {
    setActiveTree(key);
    closeSheet();
  };

  const resetSkill = useCallback((skillId: string) => {
    setTrees((prev) => {
      const curTree = prev[activeTree];
      const skill = curTree.skills[skillId];
      if (!skill || skill.xp === 0) return prev;
      showUndo(t("resetSkill", { skill: tx(skill.name, lang) }), prev);
      return {
        ...prev,
        [activeTree]: {
          ...curTree,
          skills: { ...curTree.skills, [skillId]: { ...skill, xp: 0 } },
        },
      };
    });
  }, [activeTree, showUndo, t, lang]);

  const resetTree = (key: string) => {
    setTrees((prev) => {
      showUndo(t("resetTree", { tree: t(key as "guitar") }), prev);
      return {
        ...prev,
        [key]: {
          ...prev[key],
          skills: Object.fromEntries(
            Object.entries(prev[key].skills).map(([id, sk]) => [id, { ...sk, xp: 0 }]),
          ) as Record<string, Skill>,
        },
      };
    });
    setBloomBursts({});
    setSelectedId(null);
  };

  const resetAll = () => {
    setTrees((prev) => {
      showUndo(t("resetAll"), prev);
      return TREES;
    });
    setBloomBursts({});
    setSelectedId(null);
  };

  const subtitleKey: "guitarSubtitle" | "cookingSubtitle" | "drawingSubtitle" =
    `${activeTree}Subtitle` as "guitarSubtitle";

  const stats = useMemo(() => computeStats(history, trees), [history, trees]);

  const selectedSkill = selectedId ? tree.skills[selectedId] : null;
  const selectedState = selectedSkill ? states[selectedSkill.id] : null;

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title-block">
          <h1 className="app-title">{t("growTitle")}</h1>
          <p className="app-subtitle">{t(subtitleKey)}</p>
        </div>

        <div className="domain-tabs">
          {Object.keys(trees).map((key) => (
            <button key={key} className={`domain-tab${activeTree === key ? " is-active" : ""}`}
              onClick={() => switchTree(key)}>
              {t(key as "guitar")}
            </button>
          ))}
        </div>

        <div className="progress-cluster">
          {stats.currentStreak > 0 && (
            <button className="streak-badge" onClick={() => setStatsOpen(true)} title={t("currentStreak")}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 1.5C5 4 4 6 4 8.5a4 4 0 0 0 8 0c0-1.4-.5-2.5-1.4-3.4.4 1.5-.1 2.7-1.1 2.9.4-1.4-.1-3-1.5-6.5z"
                  fill="currentColor" />
              </svg>
              <span>{stats.currentStreak}</span>
            </button>
          )}

          <div className="progress-pill">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(bloomedCount / totalCount) * 100}%` }} />
            </div>
            <span>{bloomedCount}/{totalCount}</span>
          </div>

          <button className="header-icon-btn" title={t("stats")} onClick={() => setStatsOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="9" width="2.4" height="5" rx="0.6" fill="currentColor" />
              <rect x="6.8" y="5" width="2.4" height="9" rx="0.6" fill="currentColor" />
              <rect x="11.6" y="2" width="2.4" height="12" rx="0.6" fill="currentColor" />
            </svg>
          </button>

          <button className="header-icon-btn lang-btn" title="Language" onClick={() => setLang((l) => l === "en" ? "et" : "en")}>
            {lang.toUpperCase()}
          </button>

          <div className="reset-control">
            <button className="header-icon-btn" title={t("resetProgress")}
              onClick={() => setResetMenuOpen((o) => !o)}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M2 8a6 6 0 1 0 1.76-4.24" stroke="currentColor" strokeWidth="1.6"
                  strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 2v3.5h3.5" stroke="currentColor" strokeWidth="1.6"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {resetMenuOpen && (
              <>
                <div className="reset-backdrop" onClick={() => setResetMenuOpen(false)} />
                <div className="reset-menu">
                  <button onClick={() => { setResetMenuOpen(false); resetTree(activeTree); }}>
                    {t("resetTree", { tree: t(activeTree as "guitar") })}
                  </button>
                  <button className="danger"
                    onClick={() => { setResetMenuOpen(false); resetAll(); }}>
                    {t("resetAll")}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="reset-control">
            <button className="user-avatar-btn" title={userEmail}
              onClick={() => setUserMenuOpen((o) => !o)}>
              {userInitial}
            </button>
            {userMenuOpen && (
              <>
                <div className="reset-backdrop" onClick={() => setUserMenuOpen(false)} />
                <div className="reset-menu user-menu">
                  <div className="user-menu-info">
                    <div className="user-menu-name">{userName}</div>
                    <div className="user-menu-email">{userEmail}</div>
                  </div>
                  <button onClick={() => { setUserMenuOpen(false); handleSignOut(); }}>
                    {lang === "et" ? "Logi välja" : "Sign out"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="stage">
        <div className="tree-frame">
          <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet" className="tree-svg">
            <SkillTree states={states} bloomBursts={bloomBursts} />

            {/* Skill nodes on top */}
            <g>
              {NODE_IDS.map((id) => {
                const skill = tree.skills[id];
                if (!skill) return null;
                const state = states[id];
                const color = STATE_COLORS[state];
                const isClickable = state !== "dormant";
                return (
                  <SkillNode key={id} id={id} skill={skill} state={state} color={color} lang={lang}
                    onClick={isClickable ? () => setSelectedId(id) : undefined} />
                );
              })}
            </g>
          </svg>
        </div>
      </main>

      <footer className="app-footer">
        <div className="legend">
          {(["bloom", "budding", "bare", "dormant"] as SkillState[]).map((s) => {
            const c = STATE_COLORS[s];
            const labelKey = ({ bloom: "inBloom", budding: "budding", bare: "bareBranch", dormant: "dormant" } as const)[s];
            return (
              <div key={s} className="legend-item">
                <span className="legend-dot" style={{
                  background: c.fill, borderColor: c.stroke,
                  borderStyle: s === "dormant" ? "dashed" : "solid",
                }} />
                <span>{t(labelKey)}</span>
              </div>
            );
          })}
        </div>
        <p className="tagline">{t("tagline")}</p>
      </footer>

      {undo && (
        <div className="undo-toast" key={undo.ts}>
          <span className="undo-message">{undo.message}</span>
          <button className="undo-btn" onClick={performUndo}>{t("undo")}</button>
        </div>
      )}

      {selectedSkill && selectedState && (
        <PracticeSheet skill={selectedSkill} state={selectedState} t={t} lang={lang}
          onClose={closeSheet} onLogXp={handleLogXp} onReset={resetSkill} />
      )}

      {congratsTree && (
        <CongratsOverlay treeName={t(congratsTree as "guitar")} t={t}
          onClose={() => setCongratsTree(null)} />
      )}

      {statsOpen && <StatsModal data={stats} t={t} lang={lang} onClose={() => setStatsOpen(false)} />}

      {welcomeOpen && <WelcomeModal t={t} onClose={dismissWelcome} />}
    </div>
  );
}

function CongratsOverlay({ treeName, t, onClose }: { treeName: string; t: TFn; onClose: () => void }) {
  const [petals] = useState(() => {
    const colors = ["#E8B5C0", "#D89AA8", "#A4C09A", "#7BA68F", "#C2D5B7"];
    return Array.from({ length: 42 }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * 4,
      duration: 5 + Math.random() * 5,
      rot: (Math.random() - 0.5) * 720,
      drift: (Math.random() - 0.5) * 240,
      size: 5 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  });

  return (
    <div className="congrats-backdrop" onClick={onClose}>
      <div className="congrats-petals" aria-hidden="true">
        {petals.map((p, i) => {
          const cssVars = {
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * 1.4}px`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            "--c-rot": `${p.rot}deg`,
            "--c-drift": `${p.drift}px`,
          } as CSSProperties;
          return <span key={i} className="congrats-petal" style={cssVars} />;
        })}
      </div>
      <div className="congrats-card" onClick={(e) => e.stopPropagation()}>
        <p className="congrats-eyebrow">{t("fullyBloomed")}</p>
        <h2 className="congrats-tree">{t("treeFullyGrown")}</h2>
        <p className="congrats-message">{t("congratsAt", { tree: treeName.toLowerCase() })}</p>
        <button className="congrats-close" onClick={onClose}>{t("continue")}</button>
      </div>
    </div>
  );
}

function SkillNode({ id, skill, state, color, lang, onClick }: {
  id: string; skill: Skill; state: SkillState; lang: Lang;
  color: typeof STATE_COLORS[SkillState]; onClick?: () => void;
}) {
  const pos = LAYOUT_POSITIONS[id];
  if (!pos) return null;
  const r = 28;
  const cursorStyle: CSSProperties = onClick ? { cursor: "pointer" } : {};
  const label = tx(skill.name, lang);

  return (
    <g transform={`translate(${pos.x} ${pos.y})`} style={cursorStyle} onClick={onClick}>
      <circle r={r} fill={color.fill} stroke={color.stroke}
        strokeWidth={state === "dormant" ? 1.2 : 1.5}
        strokeDasharray={state === "dormant" ? "3 3" : "none"} />
      <NodeIcon kind={skill.icon} color={color.icon} />
      <text y={r + 22} textAnchor="middle" fontFamily="'DM Sans', sans-serif"
        fontSize="18" fontWeight="500" stroke="#FAF6F0" strokeWidth="5"
        strokeLinejoin="round" fill="none" opacity="0.95"
        style={{ pointerEvents: "none" }}>{label}</text>
      <text y={r + 22} textAnchor="middle" fontFamily="'DM Sans', sans-serif"
        fontSize="18" fontWeight="500" fill={color.label}
        letterSpacing="0.01em" style={{ pointerEvents: "none" }}>{label}</text>
    </g>
  );
}

// Mirror of LAYOUTS.balanced.nodes — kept here so SkillNode positioning stays
// trivially in sync without importing the heavy tree module's internals.
const LAYOUT_POSITIONS: Record<string, { x: number; y: number }> = {
  t0:  { x: 500, y: 640 },
  tm1: { x: 500, y: 460 },
  t1a: { x: 240, y: 360 },
  t1b: { x: 760, y: 360 },
  t2a: { x: 105, y: 195 },
  t2b: { x: 320, y: 175 },
  t2c: { x: 875, y: 205 },
  tm2: { x: 500, y: 240 },
  t3:  { x: 235, y:  60 },
};
