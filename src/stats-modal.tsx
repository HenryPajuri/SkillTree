import { useState } from "react";
import type { TFn, Lang } from "./i18n";

export interface StatsData {
  currentStreak: number;
  longestStreak: number;
  daysPracticed: number;
  totalXp: number;
  mostPracticedTree: { name: string; xp: number } | null;
  history: Record<string, number>; // YYYY-MM-DD -> xp logged that day
}

const dayKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const MONTH_LABEL_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_LABEL_ET = ["Jaan", "Veebr", "Märts", "Apr", "Mai", "Juuni", "Juuli", "Aug", "Sept", "Okt", "Nov", "Dets"];

function formatTooltipDate(dateStr: string, lang: Lang): string {
  const d = new Date(dateStr);
  const locale = lang === "et" ? "et-EE" : "en-US";
  return d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });
}

// 26-week heatmap, GitHub-style.
function Heatmap({ history, monthLabels, lang, t }: {
  history: Record<string, number>; monthLabels: string[]; lang: Lang; t: TFn;
}) {
  const [hover, setHover] = useState<{ date: string; xp: number; x: number; y: number } | null>(null);

  const WEEKS = 26;
  const CELL = 12;
  const GAP = 3;
  const STEP = CELL + GAP;
  const LEFT_PAD = 0;
  const TOP_PAD = 18;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayDow = today.getDay(); // 0 = Sun
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + (6 - todayDow));
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - WEEKS * 7 + 1);

  const cells: { date: string; xp: number; week: number; day: number; isFuture: boolean; month: number }[] = [];
  for (let i = 0; i < WEEKS * 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const k = dayKey(date);
    cells.push({
      date: k,
      xp: history[k] || 0,
      week: Math.floor(i / 7),
      day: i % 7,
      isFuture: date > today,
      month: date.getMonth(),
    });
  }

  // Column header months (one label per month change, at the column where the month starts)
  const monthMarks: { week: number; month: number }[] = [];
  let prevMonth = -1;
  for (let w = 0; w < WEEKS; w++) {
    const firstCell = cells[w * 7];
    if (firstCell.month !== prevMonth) {
      monthMarks.push({ week: w, month: firstCell.month });
      prevMonth = firstCell.month;
    }
  }

  const colorFor = (xp: number, isFuture: boolean): string => {
    if (isFuture) return "transparent";
    if (xp === 0) return "#EFE7DA";
    if (xp <= 25) return "#9CC0AD";
    if (xp <= 75) return "#5B8472";
    return "#2D4A3E";
  };

  const width = LEFT_PAD + WEEKS * STEP;
  const height = TOP_PAD + 7 * STEP;

  const onCellEnter = (e: React.MouseEvent<SVGRectElement>, c: typeof cells[0]) => {
    if (c.isFuture) return;
    const r = e.currentTarget.getBoundingClientRect();
    setHover({ date: c.date, xp: c.xp, x: r.left + r.width / 2, y: r.top });
  };

  return (
    <div className="heatmap-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: "block", maxWidth: 600 }}>
        {monthMarks.map((m, i) => (
          <text key={i}
            x={LEFT_PAD + m.week * STEP + 1}
            y={11}
            fontSize="10"
            fontFamily="'DM Sans', sans-serif"
            fill="#9B9585">
            {monthLabels[m.month]}
          </text>
        ))}
        {cells.map((c, i) => (
          <rect key={i}
            x={LEFT_PAD + c.week * STEP}
            y={TOP_PAD + c.day * STEP}
            width={CELL} height={CELL} rx={2}
            fill={colorFor(c.xp, c.isFuture)}
            stroke={c.isFuture ? "transparent" : "#FAF6F0"}
            strokeWidth={1}
            style={{ cursor: c.isFuture ? "default" : "pointer" }}
            onMouseEnter={(e) => onCellEnter(e, c)}
            onMouseLeave={() => setHover(null)} />
        ))}
      </svg>
      {hover && (
        <div className="heatmap-tooltip" style={{ left: hover.x, top: hover.y }}>
          <div className="heatmap-tooltip-date">{formatTooltipDate(hover.date, lang)}</div>
          <div className="heatmap-tooltip-xp">{hover.xp} {t("xp")}</div>
        </div>
      )}
    </div>
  );
}

export default function StatsModal({ data, t, lang, onClose }: {
  data: StatsData;
  t: TFn;
  lang: "en" | "et";
  onClose: () => void;
}) {
  const months = lang === "et" ? MONTH_LABEL_ET : MONTH_LABEL_EN;
  const hasHistory = Object.keys(data.history).length > 0;

  const dayWord = (n: number) => n === 1 ? t("daySingular") : t("dayPlural");

  return (
    <div className="stats-backdrop" onClick={onClose}>
      <div className="stats-card" onClick={(e) => e.stopPropagation()}>
        <div className="stats-header">
          <h2 className="stats-title">{t("statsTitle")}</h2>
          <button className="stats-close" aria-label={t("close")} onClick={onClose}>×</button>
        </div>

        <div className="stats-grid">
          <div className="stat-tile">
            <span className="stat-num">{data.currentStreak}</span>
            <span className="stat-label">{data.currentStreak > 0 ? `${dayWord(data.currentStreak)} · ${t("currentStreak").toLowerCase()}` : t("noStreak")}</span>
          </div>
          <div className="stat-tile">
            <span className="stat-num">{data.longestStreak}</span>
            <span className="stat-label">{dayWord(data.longestStreak)} · {t("longestStreak").toLowerCase()}</span>
          </div>
          <div className="stat-tile">
            <span className="stat-num">{data.daysPracticed}</span>
            <span className="stat-label">{t("daysPracticed")}</span>
          </div>
          <div className="stat-tile">
            <span className="stat-num">{data.totalXp}</span>
            <span className="stat-label">{t("totalXpEarned")}</span>
          </div>
        </div>

        {data.mostPracticedTree && (
          <p className="stats-most-practiced">
            <span className="stats-most-label">{t("mostPracticed")}:</span>
            <span className="stats-most-name">{t(data.mostPracticedTree.name as "guitar")}</span>
            <span className="stats-most-xp">{data.mostPracticedTree.xp} XP</span>
          </p>
        )}

        <div className="stats-heatmap-wrap">
          <p className="stats-heatmap-label">{t("practiceHistory")}</p>
          {hasHistory
            ? <Heatmap history={data.history} monthLabels={months} lang={lang} t={t} />
            : <p className="stats-empty">{t("noHistoryYet")}</p>}
        </div>
      </div>
    </div>
  );
}

// Helpers exported for the parent to compute stats from current state.
export function computeStats(
  history: Record<string, number>,
  trees: Record<string, { skills: Record<string, { xp: number; maxXp: number }> }>,
): StatsData {
  // Streaks
  const dates = Object.keys(history).filter((k) => history[k] > 0).sort();
  let longest = 0;
  let run = 0;
  let prev: number | null = null;
  for (const d of dates) {
    const ts = new Date(d).getTime();
    if (prev !== null && (ts - prev) === 86400000) run++;
    else run = 1;
    if (run > longest) longest = run;
    prev = ts;
  }

  // Current streak — count back from today (or yesterday if no log today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today.getTime() - 86400000);
  const has = (d: Date) => (history[dayKey(d)] || 0) > 0;

  let curStreak = 0;
  let cursor: Date | null = null;
  if (has(today)) cursor = today;
  else if (has(yesterday)) cursor = yesterday;

  while (cursor && has(cursor)) {
    curStreak++;
    cursor = new Date(cursor.getTime() - 86400000);
  }

  // Most-practiced TREE (sum XP across each tree's skills, pick the largest)
  let mostPracticedTree: { name: string; xp: number } | null = null;
  for (const [treeKey, tree] of Object.entries(trees)) {
    const treeXp = Object.values(tree.skills).reduce((a, sk) => a + sk.xp, 0);
    if (!mostPracticedTree || treeXp > mostPracticedTree.xp) {
      mostPracticedTree = { name: treeKey, xp: treeXp };
    }
  }
  if (mostPracticedTree && mostPracticedTree.xp === 0) mostPracticedTree = null;

  // XP from history is the cumulative effort (not affected by resets)
  const historyXp = Object.values(history).reduce((a, b) => a + b, 0);

  return {
    currentStreak: curStreak,
    longestStreak: longest,
    daysPracticed: dates.length,
    totalXp: historyXp,
    mostPracticedTree,
    history,
  };
}

export { dayKey };
