import type { TFn } from "./i18n";

const STATE_DOTS: { state: "bloom" | "budding" | "bare" | "dormant"; fill: string; stroke: string; dashed?: boolean }[] = [
  { state: "bloom",   fill: "#2D4A3E", stroke: "#2D4A3E" },
  { state: "budding", fill: "#C8956C", stroke: "#C8956C" },
  { state: "bare",    fill: "#FAF6F0", stroke: "#2D4A3E" },
  { state: "dormant", fill: "#FAF6F0", stroke: "#C5BBAE", dashed: true },
];

const STATE_LABEL_KEY = {
  bloom: "inBloom", budding: "budding", bare: "bareBranch", dormant: "dormant",
} as const;

export default function WelcomeModal({ t, onClose }: { t: TFn; onClose: () => void }) {
  return (
    <div className="welcome-backdrop" onClick={onClose}>
      <div className="welcome-card" onClick={(e) => e.stopPropagation()}>
        <p className="welcome-eyebrow">{t("welcomeEyebrow")}</p>
        <h2 className="welcome-title">{t("welcomeTitle")}</h2>
        <p className="welcome-body">{t("welcomeBody")}</p>

        <div className="welcome-states">
          {STATE_DOTS.map((s) => (
            <div key={s.state} className="welcome-state">
              <span className="welcome-dot" style={{
                background: s.fill,
                borderColor: s.stroke,
                borderStyle: s.dashed ? "dashed" : "solid",
              }} />
              <span>{t(STATE_LABEL_KEY[s.state])}</span>
            </div>
          ))}
        </div>

        <p className="welcome-foot">{t("welcomeStates")}</p>

        <button className="welcome-cta" onClick={onClose}>{t("getStarted")}</button>
      </div>
    </div>
  );
}
