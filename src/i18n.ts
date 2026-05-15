// Lightweight UI string lookup with English / Estonian translations.
// Skill names + tutorial titles intentionally stay in English (most are
// English-language terms like "Open Chords"); only chrome and prompts translate.

export type Lang = "en" | "et";

type Strings = Record<string, string>;

const EN: Strings = {
  // Header / chrome
  growTitle: "Grow",
  guitar: "Guitar",
  cooking: "Cooking",
  drawing: "Drawing",

  // Tree subtitles
  guitarSubtitle: "From first strum to jazz voicings",
  cookingSubtitle: "From boiling water to plated dinners",
  drawingSubtitle: "From contour lines to compositions",

  // Buttons / actions
  back: "Back",
  resetProgress: "Reset progress",
  resetTree: "Reset {tree}",
  resetAll: "Reset all progress",
  resetSkill: "Reset {skill}",
  undo: "Undo",
  continue: "Continue",
  getStarted: "Get started",
  stats: "Stats",
  close: "Close",

  // States
  inBloom: "In bloom",
  budding: "Growth",
  bareBranch: "Bare branch",
  dormant: "Dormant",

  // Practice sheet
  prerequisitesNeeded: "Prerequisites needed",
  ofXp: "of",
  xp: "XP",
  locked: "Locked",
  complete: "Complete",
  logPractice: "Log practice",
  quickSession: "Quick\nsession",
  solidPractice: "Solid\npractice",
  deepWork: "Deep\nwork",
  about15min: "~15 min",
  about30min: "~30 min",
  about1hour: "~1 hour",
  branchBloomed: "This branch has fully bloomed.",
  unlockHint: "Complete its prerequisites to unlock this skill.",
  recommendIntro: "If you want to learn, we recommend",

  // Tagline
  tagline: "Every expert was once a beginner",

  // Congrats
  fullyBloomed: "Fully bloomed",
  treeFullyGrown: "Your tree is fully grown!",
  congratsAt: "Congratulations on becoming better at {tree}.",

  // Welcome
  welcomeEyebrow: "Welcome",
  welcomeTitle: "Grow your skills, one branch at a time",
  welcomeBody: "Pick a tree — guitar, cooking, or drawing. Tap any node, log a practice session, and watch your tree blossom as you progress. Each branch unlocks once its prerequisites bloom.",
  welcomeStates: "Bare twig, growth, in bloom, dormant — your tree changes with every session.",

  // Stats
  statsTitle: "Your progress",
  currentStreak: "Current streak",
  longestStreak: "Longest streak",
  daysPracticed: "Days practiced",
  totalXpEarned: "XP logged",
  mostPracticed: "Most practiced",
  noStreak: "Start today",
  daySingular: "day",
  dayPlural: "days",
  practiceHistory: "Practice over the last 26 weeks",
  noHistoryYet: "Log a session to start your history.",
};

const ET: Strings = {
  growTitle: "Kasva",
  guitar: "Kitarr",
  cooking: "Kokandus",
  drawing: "Joonistamine",

  guitarSubtitle: "Esimesest noodist džässakordideni",
  cookingSubtitle: "Vee keetmisest serveeritud õhtusöögini",
  drawingSubtitle: "Kontuurjoontest kompositsioonini",

  back: "Tagasi",
  resetProgress: "Lähtesta",
  resetTree: "Lähtesta {tree}",
  resetAll: "Lähtesta kogu progress",
  resetSkill: "Lähtesta {skill}",
  undo: "Võta tagasi",
  continue: "Jätka",
  getStarted: "Alusta",
  stats: "Statistika",
  close: "Sulge",

  inBloom: "Õitseb",
  budding: "Kasvab",
  bareBranch: "Paljas oks",
  dormant: "Uinunud",

  prerequisitesNeeded: "Eeldused puuduvad",
  ofXp: "/",
  xp: "XP",
  locked: "Lukus",
  complete: "Valmis",
  logPractice: "Logi harjutus",
  quickSession: "Lühike\nharjutus",
  solidPractice: "Korralik\nharjutus",
  deepWork: "Süvitsi\ntöö",
  about15min: "~15 min",
  about30min: "~30 min",
  about1hour: "~1 tund",
  branchBloomed: "See haru on täielikult õitsenud.",
  unlockHint: "Lõpeta eeldused, et see oskus avada.",
  recommendIntro: "Kui tahad õppida, soovitame",

  tagline: "Iga ekspert oli kunagi algaja",

  fullyBloomed: "Täielikult õitsenud",
  treeFullyGrown: "Sinu puu on täielikult kasvanud!",
  congratsAt: "Õnnitlused {tree} õppimise edusammude puhul.",

  welcomeEyebrow: "Tere tulemast",
  welcomeTitle: "Kasvata oma oskusi, üks haru korraga",
  welcomeBody: "Vali puu — kitarr, kokandus või joonistamine. Vajuta sõlmele, logi harjutus ja vaata, kuidas su puu kasvab. Iga haru avaneb, kui selle eeldused on õitsenud.",
  welcomeStates: "Paljas oks, kasvab, õitseb, uinunud — su puu muutub iga harjutusega.",

  statsTitle: "Sinu edusammud",
  currentStreak: "Praegune seeria",
  longestStreak: "Pikim seeria",
  daysPracticed: "Harjutuspäevi",
  totalXpEarned: "XP teenitud",
  mostPracticed: "Enim harjutatud",
  noStreak: "Alusta täna",
  daySingular: "päev",
  dayPlural: "päeva",
  practiceHistory: "Harjutused viimase 26 nädala jooksul",
  noHistoryYet: "Logi harjutus, et ajalugu alustada.",
};

const STRINGS: Record<Lang, Strings> = { en: EN, et: ET };

export function makeT(lang: Lang) {
  return (key: keyof typeof EN, params?: Record<string, string>): string => {
    let s = STRINGS[lang][key] ?? STRINGS.en[key] ?? String(key);
    if (params) for (const [k, v] of Object.entries(params)) s = s.replace(`{${k}}`, v);
    return s;
  };
}

export type TFn = ReturnType<typeof makeT>;
