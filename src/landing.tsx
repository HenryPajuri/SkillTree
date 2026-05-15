/*
 * Landing page — adapted from Claude Design.
 *
 * Public marketing page shown to visitors before they log in.
 * Single CTA throughout: "Plant your tree" → auth screen.
 *
 * Streak-related copy was rewritten because the app DOES have a daily
 * streak counter and a 26-week practice heatmap (in the Stats modal).
 * The original copy claimed "no streaks" — kept the gentle ethos but
 * made the wording honest.
 */

import { useMemo } from "react";
import { SkillTree } from "./tree-svg";
import type { SkillState } from "./tree-svg";

// Hero tree: the real SkillTree component with every skill set to bloom.
// Same DNA as the live app — bark texture, recursive branches, knots,
// foliage clusters, and falling petals at each bloomed node.
const ALL_BLOOMED: Record<string, SkillState> = {
  t0: "bloom", tm1: "bloom", tm2: "bloom",
  t1a: "bloom", t1b: "bloom",
  t2a: "bloom", t2b: "bloom", t2c: "bloom",
  t3: "bloom",
};

function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lp-bm-tk" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3D2F24" />
          <stop offset="55%" stopColor="#5C4A3A" />
          <stop offset="100%" stopColor="#7A6856" />
        </linearGradient>
      </defs>
      <path d="M 17.4 47 L 18.4 32 Q 18.8 24 19.4 18 L 20.6 18 Q 21.2 24 21.6 32 L 22.6 47 Z" fill="url(#lp-bm-tk)" />
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

// ---------- Hero tree (the real SkillTree component, fully bloomed) ----------

function HeroTree() {
  return (
    <svg className="lp-hero-tree" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg">
      <SkillTree states={ALL_BLOOMED} />
    </svg>
  );
}

// ---------- Falling petals overlay ----------

// One petal/leaf — proper teardrop or almond shape with a center vein
// instead of a flat circle. Color tints chosen to match the canopy.
function PetalShape({ kind }: { kind: "blossom-pink" | "blossom-deep" | "leaf-sage" | "leaf-forest" }) {
  if (kind === "blossom-pink" || kind === "blossom-deep") {
    const fill = kind === "blossom-pink" ? "#E8B5C0" : "#D89AA8";
    return (
      <svg width="8" height="10" viewBox="-4 -0.5 8 10" xmlns="http://www.w3.org/2000/svg">
        <path d="M 0 0 Q 3.5 1 3 5 Q 2 8 0 9 Q -2 8 -3 5 Q -3.5 1 0 0 Z" fill={fill} />
        <path d="M 0 1 L 0 7" stroke="#9C6171" strokeWidth="0.3" opacity="0.5" />
      </svg>
    );
  }
  const fill = kind === "leaf-sage" ? "#A4C09A" : "#7BA68F";
  const vein = kind === "leaf-sage" ? "#5B8472" : "#3F6353";
  return (
    <svg width="10" height="14" viewBox="-5 -1 10 16" xmlns="http://www.w3.org/2000/svg">
      <path d="M 0 0 Q 3 5 0 14 Q -3 5 0 0 Z" fill={fill} />
      <path d="M 0 1 L 0 13" stroke={vein} strokeWidth="0.4" opacity="0.6" />
    </svg>
  );
}

function FallingPetalsOverlay() {
  type Kind = "blossom-pink" | "blossom-deep" | "leaf-sage" | "leaf-forest";
  const petals = useMemo(() => {
    return Array.from({ length: 18 }, () => {
      // 55% pink blossom, 15% deep pink, 22% sage leaf, 8% forest leaf
      const r = Math.random();
      let kind: Kind;
      if (r < 0.55) kind = "blossom-pink";
      else if (r < 0.70) kind = "blossom-deep";
      else if (r < 0.92) kind = "leaf-sage";
      else kind = "leaf-forest";
      return {
        kind,
        x: 10 + Math.random() * 80,
        drift: Math.random() * 80 - 40,
        rot: (Math.random() - 0.5) * 720,
        duration: 8 + Math.random() * 7,
        delay: -Math.random() * 14,
      };
    });
  }, []);

  return (
    <div className="lp-petals" aria-hidden="true">
      {petals.map((p, i) => (
        <div key={i}
          className="lp-petal"
          style={{
            left: `${p.x}%`,
            ...({
              "--lp-drift": `${p.drift}px`,
              "--lp-rot": `${p.rot}deg`,
              "--lp-dur": `${p.duration}s`,
              "--lp-delay": `${p.delay}s`,
            } as React.CSSProperties),
          }}>
          <PetalShape kind={p.kind} />
        </div>
      ))}
    </div>
  );
}

// ---------- Sub-components ----------

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M 3 7 L 11 7 M 7 3 L 11 7 L 7 11" />
    </svg>
  );
}

// ---------- Landing page ----------

export default function LandingPage({ onPlant }: { onPlant: () => void }) {
  return (
    <div className="landing-page">
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <a className="lp-brand" href="#" onClick={(e) => e.preventDefault()}>
            <BrandMark size={32} />
            <span className="lp-brand-name">SkillTree</span>
          </a>
          <div className="lp-nav-links">
            <a href="#how">How it works</a>
            <a href="#crafts">Crafts</a>
            <a href="#features">Features</a>
          </div>
          <div>
            <button className="lp-btn lp-btn-primary" onClick={onPlant}>Plant your tree</button>
          </div>
        </div>
      </nav>

      <header className="lp-hero">
        <FallingPetalsOverlay />
        <div className="lp-container">
          <div className="lp-hero-grid">
            <div>
              <span className="lp-eyebrow">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="2.5" fill="#2D4A3E" />
                </svg>
                Long-term skill journals, the slow way
              </span>
              <h1 className="lp-headline">
                Plant a skill. <br />Watch it <em>bloom</em>, season after season.
              </h1>
              <p className="lp-sub">
                SkillTree turns the years-long climb of learning a craft into a single living tree.
                Every chord, every dish, every line you practice grows a branch.
              </p>
              <div className="lp-hero-ctas">
                <button className="lp-btn lp-btn-primary lp-btn-lg" onClick={onPlant}>
                  Plant your tree <ArrowIcon />
                </button>
              </div>
              <div className="lp-hero-meta">
                <span>Free to start</span>
                <span className="lp-dot" />
                <span>Practice on your schedule</span>
                <span className="lp-dot" />
                <span>Web app</span>
              </div>
            </div>
            <div className="lp-hero-tree-wrap">
              <HeroTree />
            </div>
          </div>
        </div>
      </header>

      <section id="how" className="lp-section">
        <div className="lp-container">
          <div className="lp-section-head">
            <span className="lp-eyebrow">How a skill grows</span>
            <h2 className="lp-h2">Four <em>seasons</em>, one branch.</h2>
            <p>
              Each skill lives in one of four states. The path forward is always visible —
              and a missed week is never a setback.
            </p>
          </div>
          <div className="lp-seasons">
            <div className="lp-season-card">
              <div className="lp-step-num">01</div>
              <div className="lp-stage">
                <svg width="60" height="80" viewBox="0 0 60 80">
                  <circle cx="30" cy="44" r="20" fill="#FAF6F0" stroke="#C5BBAE" strokeWidth="1.2" strokeDasharray="3 3" />
                  <path d="M 22 35 Q 18 30 15 30" stroke="#C5BBAE" strokeWidth="1" strokeDasharray="2 3" fill="none" />
                  <path d="M 38 35 Q 42 30 45 30" stroke="#C5BBAE" strokeWidth="1" strokeDasharray="2 3" fill="none" />
                  <path d="M 30 26 L 30 18" stroke="#C5BBAE" strokeWidth="1" strokeDasharray="2 3" fill="none" />
                </svg>
              </div>
              <h3 className="lp-h3">Dormant</h3>
              <p>The skill exists in your tree as a ghost branch. Not started — but the path is visible.</p>
            </div>
            <div className="lp-season-card">
              <div className="lp-step-num">02</div>
              <div className="lp-stage">
                <svg width="60" height="80" viewBox="0 0 60 80">
                  <circle cx="30" cy="44" r="20" fill="#FAF6F0" stroke="#2D4A3E" strokeWidth="1.5" />
                  <path d="M 30 24 Q 32 15 35 10" stroke="#5C4A3A" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                  <path d="M 22 28 Q 16 22 12 15" stroke="#5C4A3A" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                  <path d="M 38 26 Q 44 18 50 12" stroke="#5C4A3A" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                  <circle cx="35" cy="10" r="1.2" fill="#5C4A3A" />
                  <circle cx="12" cy="15" r="1.2" fill="#5C4A3A" />
                  <circle cx="50" cy="12" r="1.2" fill="#5C4A3A" />
                </svg>
              </div>
              <h3 className="lp-h3">Bare branch</h3>
              <p>You've committed. The branch is real — woody, ready, waiting for the first practice.</p>
            </div>
            <div className="lp-season-card">
              <div className="lp-step-num">03</div>
              <div className="lp-stage">
                <svg width="60" height="80" viewBox="0 0 60 80">
                  <circle cx="30" cy="44" r="20" fill="#C8956C" stroke="#C8956C" strokeWidth="1.5" />
                  <ellipse cx="22" cy="20" rx="2.5" ry="4" fill="#A4C09A" transform="rotate(-20 22 20)" />
                  <ellipse cx="38" cy="18" rx="2.5" ry="4" fill="#A4C09A" transform="rotate(20 38 18)" />
                  <ellipse cx="30" cy="14" rx="2.5" ry="4" fill="#A4C09A" />
                  <ellipse cx="15" cy="28" rx="2" ry="3.5" fill="#7BA68F" transform="rotate(-40 15 28)" />
                  <ellipse cx="45" cy="28" rx="2" ry="3.5" fill="#7BA68F" transform="rotate(40 45 28)" />
                </svg>
              </div>
              <h3 className="lp-h3">Growth</h3>
              <p>The first leaves break out. You're returning to it regularly — small wins, real momentum.</p>
            </div>
            <div className="lp-season-card">
              <div className="lp-step-num">04</div>
              <div className="lp-stage">
                <svg width="60" height="80" viewBox="0 0 60 80">
                  <circle cx="30" cy="44" r="20" fill="#2D4A3E" stroke="#2D4A3E" strokeWidth="1.5" />
                  <ellipse cx="30" cy="18" rx="22" ry="14" fill="#5B8472" />
                  <ellipse cx="22" cy="15" rx="9" ry="7" fill="#7BA68F" />
                  <ellipse cx="38" cy="15" rx="8" ry="6" fill="#7BA68F" />
                  <ellipse cx="30" cy="11" rx="7" ry="5" fill="#A8C7B5" />
                  <circle cx="18" cy="20" r="1.6" fill="#E8B5C0" />
                  <circle cx="42" cy="20" r="1.6" fill="#E8B5C0" />
                  <circle cx="28" cy="8" r="1.4" fill="#E8B5C0" />
                  <circle cx="36" cy="22" r="1.3" fill="#E8B5C0" />
                </svg>
              </div>
              <h3 className="lp-h3">In bloom</h3>
              <p>You can do this. Mastered, embodied, on tap. The branch flowers — and stays.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="crafts" className="lp-section">
        <div className="lp-container">
          <div className="lp-section-head">
            <span className="lp-eyebrow">Pick your craft</span>
            <h2 className="lp-h2">Three trees to start with. <em>More to come.</em></h2>
            <p>
              Each tree comes with a curated skill graph — the through-line from absolute beginner
              to embodied mastery, mapped by teachers who've actually walked it.
            </p>
          </div>
          <div className="lp-crafts">
            <button className="lp-craft-card" onClick={onPlant}>
              <div className="lp-craft-art" style={{ background: "linear-gradient(135deg, #F0E8DC 0%, #E8DDC8 100%)" }}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <rect x="55" y="20" width="10" height="60" rx="3" fill="#5C4A3A" />
                  <ellipse cx="60" cy="92" rx="22" ry="20" fill="#7A6856" />
                  <circle cx="60" cy="92" r="6" fill="#3D2F24" />
                  <line x1="58" y1="22" x2="58" y2="80" stroke="#FAF6F0" strokeWidth="0.6" />
                  <line x1="62" y1="22" x2="62" y2="80" stroke="#FAF6F0" strokeWidth="0.6" />
                  <circle cx="55" cy="24" r="1.6" fill="#FAF6F0" />
                  <circle cx="65" cy="24" r="1.6" fill="#FAF6F0" />
                  <circle cx="55" cy="30" r="1.6" fill="#FAF6F0" />
                  <circle cx="65" cy="30" r="1.6" fill="#FAF6F0" />
                </svg>
              </div>
              <div className="lp-craft-body">
                <h3 className="lp-h3">Guitar</h3>
                <p>From your first open chord to fluent jazz voicings.</p>
                <div className="lp-meta"><b>9 branches</b> · <span>~6 months to growth</span></div>
              </div>
            </button>
            <button className="lp-craft-card" onClick={onPlant}>
              <div className="lp-craft-art" style={{ background: "linear-gradient(135deg, #F3EBE1 0%, #E9DAC4 100%)" }}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <path d="M 25 78 L 88 78 L 95 70 L 95 60 L 25 60 Z" fill="#C5BBAE" stroke="#9B9585" strokeWidth="1" />
                  <rect x="20" y="62" width="20" height="14" rx="2" fill="#5C4A3A" />
                  <line x1="25" y1="65" x2="40" y2="65" stroke="#3D2F24" strokeWidth="0.6" />
                  <line x1="25" y1="69" x2="40" y2="69" stroke="#3D2F24" strokeWidth="0.6" />
                  <line x1="25" y1="73" x2="40" y2="73" stroke="#3D2F24" strokeWidth="0.6" />
                  <circle cx="60" cy="50" r="2.5" fill="#7BA68F" />
                  <circle cx="68" cy="46" r="2.5" fill="#5B8472" />
                  <circle cx="74" cy="52" r="2.5" fill="#A4C09A" />
                  <circle cx="82" cy="48" r="2.5" fill="#7BA68F" />
                </svg>
              </div>
              <div className="lp-craft-body">
                <h3 className="lp-h3">Cooking</h3>
                <p>Knife skills, eggs, stocks, sauces, plating. Build a kitchen-fluent vocabulary.</p>
                <div className="lp-meta"><b>9 branches</b> · <span>~3 months to growth</span></div>
              </div>
            </button>
            <button className="lp-craft-card" onClick={onPlant}>
              <div className="lp-craft-art" style={{ background: "linear-gradient(135deg, #EFE5D8 0%, #E5D5BE 100%)" }}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <rect x="48" y="20" width="12" height="80" rx="2" fill="#C8956C" transform="rotate(15 54 60)" />
                  <path d="M 73 95 L 81 109 L 67 109 Z" fill="#3D2F24" />
                  <path d="M 38 32 L 50 22 L 56 26 L 44 36 Z" fill="#FAF6F0" stroke="#5C4A3A" strokeWidth="0.6" />
                  <path d="M 22 88 Q 30 76 38 84 Q 46 92 56 80" stroke="#3D2F24" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                  <path d="M 30 96 Q 38 88 46 94" stroke="#3D2F24" strokeWidth="1" fill="none" strokeLinecap="round" />
                </svg>
              </div>
              <div className="lp-craft-body">
                <h3 className="lp-h3">Drawing</h3>
                <p>From line and shape to value, perspective, and composition. The fundamentals, properly.</p>
                <div className="lp-meta"><b>9 branches</b> · <span>~4 months to growth</span></div>
              </div>
            </button>
          </div>
        </div>
      </section>

      <section id="features" className="lp-section">
        <div className="lp-container">
          <div className="lp-section-head">
            <span className="lp-eyebrow">Built for the long path</span>
            <h2 className="lp-h2">Track gently. Grow slowly. <em>No setbacks.</em></h2>
            <p>
              SkillTree is for crafts you want to do for years. Daily streaks and a practice
              heatmap if they motivate you — but never a fail state.
            </p>
          </div>
          <div className="lp-features">
            <div className="lp-feat">
              <div className="lp-feat-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M 12 22 L 12 14" />
                  <path d="M 4 14 Q 7 4 12 4 Q 17 4 20 14 Z" />
                  <path d="M 7 18 L 17 18" />
                </svg>
              </div>
              <h4 className="lp-h4">One tree, your whole craft</h4>
              <p>See every skill at once — what's blooming, growing, bare, or still dormant. The full shape of where you've been.</p>
            </div>
            <div className="lp-feat">
              <div className="lp-feat-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M 12 7 L 12 12 L 15 14" />
                </svg>
              </div>
              <h4 className="lp-h4">Streaks without setbacks</h4>
              <p>Optional daily streaks and a 26-week practice heatmap. Miss a day and your tree still remembers everything you've planted.</p>
            </div>
            <div className="lp-feat">
              <div className="lp-feat-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M 4 5 a 2 2 0 0 1 2 -2 h 9 l 5 5 v 11 a 2 2 0 0 1 -2 2 H 6 a 2 2 0 0 1 -2 -2 Z" />
                  <path d="M 14 3 v 5 h 5" />
                  <path d="M 8 13 h 8" />
                  <path d="M 8 17 h 5" />
                </svg>
              </div>
              <h4 className="lp-h4">A guide at every branch</h4>
              <p>Each skill links to a hand-picked free tutorial — JustinGuitar, Proko, Kenji López-Alt. The next thing to learn is always one tap away.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-quote-section">
        <div className="lp-container lp-quote">
          <blockquote>
            "I gave up on a daily-practice app five times. With SkillTree, I just keep finding myself
            back at the tree, looking at where I've been. I'm playing better than I have in years."
          </blockquote>
          <p className="lp-quote-author"><b>Mia Okafor</b> · learning fingerstyle, 14 months in</p>
        </div>
      </section>

      <section className="lp-cta-section">
        <div className="lp-container">
          <h2 className="lp-h2 lp-cta-h">Your tree is <em>still dormant</em>.</h2>
          <p>Plant it. We'll be here however long it takes.</p>
          <div className="lp-hero-ctas" style={{ justifyContent: "center" }}>
            <button className="lp-btn lp-btn-primary lp-btn-lg" onClick={onPlant}>Plant your tree</button>
          </div>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-container lp-footer-inner">
          <div className="lp-footer-tagline">Every expert was once a beginner</div>
          <div className="lp-footer-links">
            <a href="#" onClick={(e) => e.preventDefault()}>About</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Privacy</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Terms</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
