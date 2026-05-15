/*
 * Visual tree SVG — adapted from the Claude Design output.
 *
 * Renders a stylized botanical tree with 9 anchor points where the React
 * app overlays skill icon circles. The four states (bloom / budding /
 * bare / dormant) are computed by the parent from XP + dependency state.
 *
 * Bark treatment: vertical fissure pattern + along-the-branch striations.
 * Sub-branches share the same gradient + texture so wood reads consistently
 * everywhere. The trunk also gets seeded knots (radial-gradient ellipses).
 */

import type { CSSProperties } from "react";

export type SkillState = "bloom" | "budding" | "bare" | "dormant";

const BARK = "#5C4A3A";
const BARK_DEEP = "#3D2F24";
const BARK_MID = "#4A3B2E";
const BARK_LIGHT = "#7A6856";
const BARK_HIGHLIGHT = "#94806A";
const DORMANT = "#C5BBAE";

interface FoliagePalette {
  shadow: string; base: string; mid: string; highlight: string; edge: string;
  accent?: string; accentDeep?: string;
}

const BLOOM_PALETTE: FoliagePalette = {
  shadow: "#3F6353", base: "#5B8472", mid: "#7BA68F", highlight: "#A8C7B5",
  edge: "#2D4A3E", accent: "#E8B5C0", accentDeep: "#C97A8B",
};
const BUD_PALETTE: FoliagePalette = {
  shadow: "#6E8A77", base: "#8BA692", mid: "#A4C09A", highlight: "#C2D5B7",
  edge: "#4F6B5A",
};

interface NodePos { x: number; y: number; }
// 7th element is optional `front` flag — when true, the edge is rendered in a
// second pass after the trunk so it appears to emerge from the trunk's front.
type EdgeTuple = [string, string, number, number, number, number, boolean?];
interface TrunkSpec {
  baseX: number; baseY: number; tipX: number; tipY: number;
  baseW: number; tipW: number; bend: number; bias: number;
}
interface FillerSpec {
  sx: number; sy: number; ex: number; ey: number;
  baseW: number; tipW: number; depth: number; owner: string; seed: number;
}
interface Layout {
  nodes: Record<string, NodePos>;
  trunk: TrunkSpec;
  edges: EdgeTuple[];
  fillers?: FillerSpec[];
}

export const LAYOUTS: Record<string, Layout> = {
  balanced: {
    nodes: {
      t0:  { x: 500, y: 640 },
      tm1: { x: 500, y: 460 },
      t1a: { x: 240, y: 360 },
      t1b: { x: 760, y: 360 },
      t2a: { x: 105, y: 195 },
      t2b: { x: 320, y: 175 },
      t2c: { x: 875, y: 205 },
      tm2: { x: 500, y: 240 },
      t3:  { x: 235, y:  60 },
    },
    trunk: { baseX: 500, baseY: 700, tipX: 500, tipY: 60, baseW: 96, tipW: 9, bend: 0, bias: 0 },
    edges: [
      ["tm1", "t1a", 36, 20, -22, -0.1],
      ["tm1", "t1b", 36, 20,  22,  0.1, true],  // render in front of trunk
      ["t1a", "t2a", 20, 10, -14,  0],
      ["t1a", "t2b", 20, 10,   6,  0.15],
      ["t1b", "t2c", 20, 10,  14,  0.1],
      ["tm2", "t3",  14,  6, -22, -0.15],
    ],
    fillers: [
      { sx: 520, sy: 320, ex: 690, ey: 220, baseW: 18, tipW: 5, depth: 3, owner: "tm2", seed: 71 },
      { sx: 520, sy: 260, ex: 660, ey: 290, baseW: 14, tipW: 4, depth: 3, owner: "tm2", seed: 91 },
      { sx: 480, sy: 320, ex: 310, ey: 220, baseW: 18, tipW: 5, depth: 3, owner: "tm2", seed: 113 },
      { sx: 480, sy: 260, ex: 340, ey: 290, baseW: 14, tipW: 4, depth: 3, owner: "tm2", seed: 127 },
    ],
  },
};

// ---------- GEOMETRY ----------

function branchPath(x1: number, y1: number, x2: number, y2: number, w1: number, w2: number, bend = 0, controlBias = 0): string {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const ax = x1 + nx * (w1 / 2), ay = y1 + ny * (w1 / 2);
  const bx = x1 - nx * (w1 / 2), by = y1 - ny * (w1 / 2);
  const cx_ = x2 + nx * (w2 / 2), cy_ = y2 + ny * (w2 / 2);
  const dx_ = x2 - nx * (w2 / 2), dy_ = y2 - ny * (w2 / 2);
  const t = 0.5 + controlBias;
  const midX = x1 + dx * t + nx * bend;
  const midY = y1 + dy * t + ny * bend;
  const wMid = (w1 + w2) / 4;
  const c1x = midX + nx * wMid, c1y = midY + ny * wMid;
  const c2x = midX - nx * wMid, c2y = midY - ny * wMid;
  return `M ${ax.toFixed(1)} ${ay.toFixed(1)} Q ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${cx_.toFixed(1)} ${cy_.toFixed(1)} L ${dx_.toFixed(1)} ${dy_.toFixed(1)} Q ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)} Z`;
}

function twigPath(x1: number, y1: number, x2: number, y2: number, bend = 0, controlBias = 0): string {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const t = 0.5 + controlBias;
  const midX = x1 + dx * t + nx * bend;
  const midY = y1 + dy * t + ny * bend;
  return `M ${x1} ${y1} Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${x2} ${y2}`;
}

function striationPath(x1: number, y1: number, x2: number, y2: number, w1: number, w2: number, bend: number, bias: number, lateral: number): string {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const off1 = (w1 / 2) * lateral, off2 = (w2 / 2) * lateral;
  const sx = x1 + nx * off1, sy = y1 + ny * off1;
  const ex = x2 + nx * off2, ey = y2 + ny * off2;
  const t = 0.5 + bias;
  const offMid = (off1 + off2) / 2;
  const midX = x1 + dx * t + nx * (bend + offMid);
  const midY = y1 + dy * t + ny * (bend + offMid);
  return `M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
}

function qPointAndTangent(p0x: number, p0y: number, cx: number, cy: number, p1x: number, p1y: number, t: number) {
  const u = 1 - t;
  const x = u * u * p0x + 2 * u * t * cx + t * t * p1x;
  const y = u * u * p0y + 2 * u * t * cy + t * t * p1y;
  const tx = 2 * u * (cx - p0x) + 2 * t * (p1x - cx);
  const ty = 2 * u * (cy - p0y) + 2 * t * (p1y - cy);
  const tLen = Math.hypot(tx, ty) || 1;
  return { x, y, tx: tx / tLen, ty: ty / tLen };
}

// ---------- DECORATIVE BRANCH RECURSION ----------

interface DecoBranch {
  sx: number; sy: number; ex: number; ey: number;
  baseW: number; tipW: number; bend: number; bias: number;
  depth: number; foliage: SkillState | null; seed: number;
  hideWood?: boolean;
}

function generateDecoBranches(
  p: NodePos, c: NodePos, w1: number, w2: number, bend: number, bias: number,
  depth: number, childState: SkillState, rng: () => number,
  treeCenter: NodePos = { x: 500, y: 600 }, forceInward = true,
): DecoBranch[] {
  if (depth <= 0) return [];

  let subCount: number;
  if (depth >= 4)        subCount = 8 + Math.floor(rng() * 3);
  else if (depth === 3)  subCount = 5 + Math.floor(rng() * 2);
  else if (depth === 2)  subCount = 3 + Math.floor(rng() * 2);
  else                   subCount = rng() < 0.55 ? 1 : 0;

  const out: DecoBranch[] = [];
  if (subCount === 0) return out;

  const forcedInwardCount = forceInward ? (subCount >= 4 ? 2 : 1) : 0;
  const forcedInwardSet = new Set<number>();
  while (forcedInwardSet.size < Math.min(forcedInwardCount, subCount)) {
    forcedInwardSet.add(Math.floor(rng() * subCount));
  }

  for (let s = 0; s < subCount; s++) {
    let baseT: number;
    if (depth >= 4) {
      const norm = subCount === 1 ? 0.5 : s / (subCount - 1);
      baseT = 0.28 + Math.pow(norm, 0.7) * 0.68;
    } else {
      baseT = 0.18 + s * (0.75 / Math.max(1, subCount - 0.5));
    }
    const tParam = Math.min(0.96, Math.max(0.1, baseT + (rng() - 0.5) * 0.08));

    const dx = c.x - p.x, dy = c.y - p.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const tBias = 0.5 + bias;
    const midX = p.x + dx * tBias + nx * bend;
    const midY = p.y + dy * tBias + ny * bend;
    const ptt = qPointAndTangent(p.x, p.y, midX, midY, c.x, c.y, tParam);

    const candPnx = -ptt.ty, candPny = ptt.tx;
    const fromCenterX = ptt.x - treeCenter.x, fromCenterY = ptt.y - treeCenter.y;
    const outwardDot = candPnx * fromCenterX + candPny * fromCenterY;
    const outwardSide = outwardDot >= 0 ? 1 : -1;
    const side = forcedInwardSet.has(s)
      ? -outwardSide
      : (rng() < 0.55 ? outwardSide : -outwardSide);

    const localW = w1 + (w2 - w1) * tParam;
    const pnx = -ptt.ty * side, pny = ptt.tx * side;
    const baseFwd = depth === 3 ? 0.2 : depth === 2 ? 0.4 : 0.6;
    const forwardBias = baseFwd + (rng() - 0.5) * 0.45;

    const lengthFactor = depth >= 4 ? 2.1 : depth === 3 ? 1.9 : depth === 2 ? 1.4 : 0.95;
    const length = localW * lengthFactor * (0.85 + rng() * 0.55) + depth * 8;
    const subBaseW = Math.max(1.4, localW * (0.28 + rng() * 0.12));
    const subTipW = Math.max(0.7, subBaseW * (0.32 + rng() * 0.18));

    const sx = ptt.x, sy = ptt.y;
    const ex = sx + pnx * length + ptt.tx * length * forwardBias;
    const ey = sy + pny * length + ptt.ty * length * forwardBias;

    const subBend = (rng() - 0.5) * (5 + depth * 2.5);
    const subBias = (rng() - 0.5) * 0.2;
    const subSeed = Math.floor(rng() * 1e6);

    const newDepth = depth - 1;
    const wantsFoliage = newDepth === 0 || newDepth === 1;
    const activeState = childState === "bloom" || childState === "budding";
    const foliage: SkillState | null = wantsFoliage && activeState && rng() > 0.12 ? childState : null;

    out.push({ sx, sy, ex, ey, baseW: subBaseW, tipW: subTipW, bend: subBend, bias: subBias, depth: newDepth, foliage, seed: subSeed });

    const grandchildren = generateDecoBranches(
      { x: sx, y: sy }, { x: ex, y: ey },
      subBaseW, subTipW, subBend, subBias,
      newDepth, childState, rng, treeCenter, false,
    );
    out.push(...grandchildren);
  }
  return out;
}

// ---------- SEEDED RNG ----------

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- FOLIAGE PUFF (composite-path optimization) ----------

interface FoliagePuffProps {
  cx: number; cy: number; palette: FoliagePalette;
  size?: number; density?: number; seed?: number;
  squashY?: number; offsetY?: number; accent?: boolean;
}

// Bake `translate(tx ty) rotate(rotDeg)` into a single leaf-shape path string.
// Reduces a puff from ~density elements to one <path> per color layer.
function bakedLeafSubpath(len: number, tx: number, ty: number, rotDeg: number): string {
  const w = len * 0.55;
  const r = (rotDeg * Math.PI) / 180;
  const c = Math.cos(r), s = Math.sin(r);
  const tp = (x: number, y: number): string => {
    const px = x * c - y * s + tx;
    const py = x * s + y * c + ty;
    return `${px.toFixed(1)} ${py.toFixed(1)}`;
  };
  return `M ${tp(0, -len)} Q ${tp(w, -len * 0.1)} ${tp(w * 0.3, len * 0.7)} Q ${tp(0, len)} ${tp(-w * 0.3, len * 0.7)} Q ${tp(-w, -len * 0.1)} ${tp(0, -len)} Z`;
}

function FoliagePuff({
  cx, cy, palette, size = 56, density = 140, seed = 1,
  squashY = 0.9, offsetY = -10, accent = false,
}: FoliagePuffProps) {
  const rng = mulberry32(seed);
  const leaves: { x: number; y: number; leafLen: number; rotation: number; depth: number }[] = [];
  for (let i = 0; i < density; i++) {
    const angle = rng() * Math.PI * 2;
    const radius = Math.pow(rng(), 0.6) * size;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * squashY + offsetY;
    const leafLen = 3.2 + rng() * 2.8;
    const rotation = rng() * 360;
    const depth = rng();
    leaves.push({ x, y, leafLen, rotation, depth });
  }
  leaves.sort((a, b) => a.depth - b.depth);

  const accents: { x: number; y: number; r: number }[] = [];
  if (accent) {
    const accentCount = Math.floor(density * 0.08);
    for (let i = 0; i < accentCount; i++) {
      const angle = rng() * Math.PI * 2;
      const radius = Math.pow(rng(), 0.5) * size * 0.85;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * squashY + offsetY - 3;
      const r = 1.8 + rng() * 1.2;
      accents.push({ x, y, r });
    }
  }

  const cuts = [0, Math.floor(density * 0.35), Math.floor(density * 0.7), Math.floor(density * 0.9), density];
  const layers: string[] = ["", "", "", ""];
  for (let li = 0; li < 4; li++) {
    const slice = leaves.slice(cuts[li], cuts[li + 1]);
    let d = "";
    for (const lf of slice) {
      const dx = li === 0 ? 1 : 0;
      const dy = li === 0 ? 1.5 : li === 3 ? -1 : 0;
      d += bakedLeafSubpath(lf.leafLen, lf.x + dx, lf.y + dy, lf.rotation) + " ";
    }
    layers[li] = d;
  }

  return (
    <g transform={`translate(${cx} ${cy})`}>
      {layers[0] && <path d={layers[0]} fill={palette.shadow} opacity="0.85" />}
      {layers[1] && <path d={layers[1]} fill={palette.base} />}
      {layers[2] && <path d={layers[2]} fill={palette.mid} />}
      {layers[3] && <path d={layers[3]} fill={palette.highlight} opacity="0.9" />}
      {accents.length > 0 && (
        <>
          <g fill={palette.accent} opacity="0.95">
            {accents.map((a, i) => <circle key={i} cx={a.x} cy={a.y} r={a.r} />)}
          </g>
          <g fill={palette.accentDeep} opacity="0.7">
            {accents.map((a, i) => <circle key={i} cx={a.x} cy={a.y} r={a.r * 0.4} />)}
          </g>
        </>
      )}
    </g>
  );
}

function BloomCluster({ cx, cy, seed = 1 }: { cx: number; cy: number; seed?: number }) {
  return <FoliagePuff cx={cx} cy={cy} palette={BLOOM_PALETTE} size={70} density={180}
    seed={seed} squashY={0.88} offsetY={-12} accent />;
}

function BudCluster({ cx, cy, seed = 1 }: { cx: number; cy: number; seed?: number }) {
  return <FoliagePuff cx={cx} cy={cy} palette={BUD_PALETTE} size={40} density={45}
    seed={seed + 100} squashY={0.85} offsetY={-22} />;
}

function BareCluster({ cx, cy, seed = 1 }: { cx: number; cy: number; seed?: number }) {
  const rng = mulberry32(seed + 200);
  const twigs: { x2: number; y2: number; cx: number; cy: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i - 3) * 0.32 + (rng() - 0.5) * 0.15;
    const len = 22 + rng() * 14;
    const x2 = Math.cos(a) * len;
    const y2 = Math.sin(a) * len;
    const cx_ = Math.cos(a + 0.3) * len * 0.6;
    const cy_ = Math.sin(a + 0.3) * len * 0.6;
    twigs.push({ x2, y2, cx: cx_, cy: cy_ });
  }
  return (
    <g transform={`translate(${cx} ${cy})`} stroke={BARK} fill="none" strokeLinecap="round">
      {twigs.map((t, i) => (
        <g key={i}>
          <path d={`M 0 -8 Q ${t.cx} ${t.cy} ${t.x2} ${t.y2}`} strokeWidth="1.4" />
          <path d={`M ${t.cx} ${t.cy} L ${t.cx + (rng() - 0.5) * 8} ${t.cy - 4 - rng() * 4}`}
            strokeWidth="0.9" opacity="0.8" />
          <circle cx={t.x2} cy={t.y2} r="1.1" fill={BARK} stroke="none" />
        </g>
      ))}
    </g>
  );
}

function DormantCluster({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`} stroke={DORMANT} fill="none" strokeLinecap="round" opacity="0.55">
      <path d="M -14 -20 Q -18 -28 -12 -34" strokeWidth="1" strokeDasharray="2 3" />
      <path d="M 12 -20 Q 18 -28 14 -34" strokeWidth="1" strokeDasharray="2 3" />
      <path d="M 0 -22 L 0 -36" strokeWidth="1" strokeDasharray="2 3" />
    </g>
  );
}

function FoliageForState({ state, x, y, seed = 1 }: { state: SkillState; x: number; y: number; seed?: number }) {
  if (state === "bloom") return <BloomCluster cx={x} cy={y} seed={seed} />;
  if (state === "budding") return <BudCluster cx={x} cy={y} seed={seed} />;
  if (state === "bare") return <BareCluster cx={x} cy={y} seed={seed} />;
  return <DormantCluster cx={x} cy={y} />;
}

// ---------- BLOOM BURST ----------

function BloomBurst({ cx, cy, seed = 1, count = 22 }: { cx: number; cy: number; seed?: number; count?: number }) {
  const rng = mulberry32(seed + 31337);
  const petals: { bx: number; by: number; rot: number; size: number; tint: number; delay: number; duration: number }[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (rng() * Math.PI) - Math.PI;
    const speed = 40 + rng() * 55;
    petals.push({
      bx: Math.cos(angle) * speed,
      by: Math.sin(angle) * speed,
      rot: (rng() - 0.5) * 720,
      size: 2.4 + rng() * 1.8,
      tint: rng(),
      delay: rng() * 0.18,
      duration: 2.4 + rng() * 0.7,
    });
  }
  return (
    <g transform={`translate(${cx} ${cy})`}>
      {petals.map((p, i) => {
        let fill: string, shadow: string;
        if (p.tint < 0.4)        { fill = "#E8B5C0"; shadow = "#9C6171"; }
        else if (p.tint < 0.6)   { fill = "#D89AA8"; shadow = "#9C6171"; }
        else if (p.tint < 0.82)  { fill = "#A4C09A"; shadow = "#5B8472"; }
        else                     { fill = "#C2D5B7"; shadow = "#7BA68F"; }
        const cssVars = {
          "--st-bx": `${p.bx}px`,
          "--st-by": `${p.by}px`,
          "--st-rot": `${p.rot}deg`,
          animationDuration: `${p.duration}s`,
          animationDelay: `${p.delay}s`,
        } as CSSProperties;
        return (
          <g key={i} className="st-burst-petal" style={cssVars}>
            <ellipse cx={0.4} cy={0.4} rx={p.size * 0.55} ry={p.size} fill={shadow} opacity="0.35" />
            <ellipse cx={0} cy={0} rx={p.size * 0.55} ry={p.size} fill={fill} />
          </g>
        );
      })}
    </g>
  );
}

function FallingPetals({ cx, cy, seed = 1, count = 7 }: { cx: number; cy: number; seed?: number; count?: number }) {
  const rng = mulberry32(seed + 7777);
  const petals: { sx: number; sy: number; fall: number; drift: number; rot: number; size: number; tint: number; duration: number; delay: number }[] = [];
  for (let i = 0; i < count; i++) {
    petals.push({
      sx: (rng() - 0.5) * 90,
      sy: -25 + (rng() - 0.5) * 35,
      fall: 100 + rng() * 60,
      drift: (rng() - 0.5) * 70,
      rot: (rng() - 0.5) * 540,
      size: 2.1 + rng() * 1.6,
      tint: rng(),
      duration: 6 + rng() * 4,
      delay: -rng() * 8,
    });
  }
  return (
    <g transform={`translate(${cx} ${cy})`}>
      {petals.map((p, i) => {
        let fill: string, shadow: string;
        if (p.tint < 0.35)      { fill = "#E8B5C0"; shadow = "#9C6171"; }
        else if (p.tint < 0.55) { fill = "#D89AA8"; shadow = "#9C6171"; }
        else if (p.tint < 0.78) { fill = "#A4C09A"; shadow = "#5B8472"; }
        else if (p.tint < 0.92) { fill = "#7BA68F"; shadow = "#3F6353"; }
        else                    { fill = "#C2D5B7"; shadow = "#7BA68F"; }
        const cssVars = {
          "--st-drift": `${p.drift}px`,
          "--st-fall": `${p.fall}px`,
          "--st-rot": `${p.rot}deg`,
          animationDuration: `${p.duration}s`,
          animationDelay: `${p.delay}s`,
        } as CSSProperties;
        return (
          <g key={i} className="st-petal" style={cssVars}>
            <ellipse cx={p.sx + 0.4} cy={p.sy + 0.4} rx={p.size * 0.55} ry={p.size} fill={shadow} opacity="0.35" />
            <ellipse cx={p.sx} cy={p.sy} rx={p.size * 0.55} ry={p.size} fill={fill} />
            <path d={`M ${p.sx} ${p.sy - p.size * 0.5} L ${p.sx} ${p.sy + p.size * 0.4}`}
              stroke={shadow} strokeWidth="0.3" opacity="0.4" />
          </g>
        );
      })}
    </g>
  );
}

// ---------- BRANCH GEOMETRY HELPER ----------

// Tapered filled path (sx,sy)→(ex,ey) with bend, plus a backward-extending
// control point at the base so the branch curves INTO its parent — creates
// an organic "collar" instead of a flat perpendicular slab edge.
function taperedFilled(sx: number, sy: number, ex: number, ey: number, baseW: number, tipW: number, b: number, bi: number): string {
  const dxL = ex - sx, dyL = ey - sy;
  const lenL = Math.hypot(dxL, dyL) || 1;
  const nxL = -dyL / lenL, nyL = dxL / lenL;
  const tL = 0.5 + bi;
  const midXL = sx + dxL * tL + nxL * b;
  const midYL = sy + dyL * tL + nyL * b;
  const ax = sx + nxL * (baseW / 2), ay = sy + nyL * (baseW / 2);
  const bx = sx - nxL * (baseW / 2), by = sy - nyL * (baseW / 2);
  const cx2 = ex + nxL * (tipW / 2), cy2 = ey + nyL * (tipW / 2);
  const dx3 = ex - nxL * (tipW / 2), dy3 = ey - nyL * (tipW / 2);
  const wMid = (baseW + tipW) / 4;
  const backExt = baseW * 0.85;
  const baseCtlX = sx - (dxL / lenL) * backExt;
  const baseCtlY = sy - (dyL / lenL) * backExt;
  return `M ${ax.toFixed(1)} ${ay.toFixed(1)} Q ${(midXL + nxL * wMid).toFixed(1)} ${(midYL + nyL * wMid).toFixed(1)} ${cx2.toFixed(1)} ${cy2.toFixed(1)} L ${dx3.toFixed(1)} ${dy3.toFixed(1)} Q ${(midXL - nxL * wMid).toFixed(1)} ${(midYL - nyL * wMid).toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)} Q ${baseCtlX.toFixed(1)} ${baseCtlY.toFixed(1)} ${ax.toFixed(1)} ${ay.toFixed(1)} Z`;
}

// Render one decorative sub-branch (filled path + texture + along-the-branch fissures).
// Used by primary edges, trunk sub-branches, crown branches, and fillers so all wood
// shares the same visual treatment.
function renderSubBranch(sb: DecoBranch, key: string, owningState: SkillState | null) {
  const sbPath = taperedFilled(sb.sx, sb.sy, sb.ex, sb.ey, sb.baseW, sb.tipW, sb.bend, sb.bias);
  const showFoliage = sb.foliage && (owningState !== "bare");
  return (
    <g key={key}>
      <path d={sbPath} fill="url(#barkShade)" />
      <path d={sbPath} fill="url(#barkTexture)" opacity="0.12" />
      {[-0.65, -0.3, 0.05, 0.4, 0.65].map((lat, kk) => (
        <path key={`bk-${kk}`}
          d={striationPath(sb.sx, sb.sy, sb.ex, sb.ey, sb.baseW, sb.tipW, sb.bend, sb.bias, lat)}
          stroke={kk % 2 === 0 ? BARK_DEEP : BARK_MID}
          strokeWidth={Math.max(0.5, sb.baseW * 0.07)}
          fill="none" opacity="0.7" />
      ))}
      {showFoliage && sb.foliage && (
        <FoliagePuff cx={sb.ex} cy={sb.ey}
          palette={sb.foliage === "bloom" ? BLOOM_PALETTE : BUD_PALETTE}
          size={sb.foliage === "bloom" ? 24 : 18}
          density={sb.foliage === "bloom" ? 55 : 28}
          seed={sb.seed} squashY={0.9} offsetY={-3}
          accent={sb.foliage === "bloom"} />
      )}
    </g>
  );
}

// Render one primary edge (the named connections in LAYOUTS.edges).
// Shared between the back-of-trunk first pass and the front-of-trunk second pass.
function renderPrimaryEdge(
  parentId: string, childId: string, w1: number, w2: number, bend: number, bias: number,
  i: number, getNode: (id: string) => NodePos, states: Record<string, SkillState>,
  treeCenter: NodePos,
) {
  const p = getNode(parentId);
  const c = getNode(childId);
  const path = branchPath(p.x, p.y, c.x, c.y, w1, w2, bend, bias);
  const isTrunk = parentId === "root";
  const childState = states[childId] || "dormant";
  const rng = mulberry32(i * 17 + 3);

  let depth: number;
  if (isTrunk)        depth = 0;
  else if (w1 >= 22)  depth = 3;
  else if (w1 >= 12)  depth = 2;
  else                depth = 2;

  const decoBranches = generateDecoBranches(p, c, w1, w2, bend, bias, depth, childState, rng, treeCenter);

  return (
    <g key={`edge-${i}`}>
      <path d={branchPath(p.x, p.y + 1.5, c.x, c.y + 1.5, w1, w2, bend, bias)}
        fill={BARK_DEEP} opacity="0.35" />
      <path d={path} fill="url(#barkShade)" />
      <path d={path} fill="url(#barkTexture)" opacity={isTrunk ? 0.55 : 0.4} />
      {[-0.7, -0.45, -0.25, -0.05, 0.15, 0.35, 0.55, 0.75].map((lateral, k) => (
        <path key={`str-${k}`}
          d={striationPath(p.x, p.y, c.x, c.y, w1, w2, bend, bias, lateral)}
          stroke={k % 2 === 0 ? BARK_DEEP : BARK_MID}
          strokeWidth={isTrunk ? 0.9 : Math.max(0.6, w1 * 0.05)}
          fill="none" opacity={0.7} />
      ))}
      <path d={striationPath(p.x, p.y, c.x, c.y, w1, w2, bend, bias, -0.85)}
        stroke={BARK_HIGHLIGHT} strokeWidth={isTrunk ? 1.0 : 0.5}
        fill="none" opacity="0.45" />
      {decoBranches.map((sb, k) => renderSubBranch(sb, `sb-${k}`, childState))}
    </g>
  );
}

// ---------- MAIN COMPONENT ----------

export interface SkillTreeProps {
  states: Record<string, SkillState>;
  layoutName?: keyof typeof LAYOUTS;
  bloomBursts?: Record<string, number>;
  showAnchors?: boolean;
}

export function SkillTree({
  states, layoutName = "balanced", bloomBursts = {}, showAnchors = false,
}: SkillTreeProps) {
  const layout = LAYOUTS[layoutName] || LAYOUTS.balanced;
  const nodes = layout.nodes;
  const root: NodePos = { x: nodes.t0.x, y: 700 };
  const getNode = (id: string): NodePos => (id === "root" ? root : nodes[id]);
  const treeCenter: NodePos = { x: nodes.t0.x, y: nodes.t0.y };

  const branchClass = (childId: string): "active" | "dormant" => {
    const s = states[childId];
    return s === "dormant" ? "dormant" : "active";
  };

  return (
    <>
      <defs>
        {/* Bark fissures — irregular vertical cracks. Two-tone, slightly offset. */}
        <pattern id="barkTexture" x="0" y="0" width="14" height="48" patternUnits="userSpaceOnUse">
          <rect width="14" height="48" fill={BARK} />
          <path d="M 3 0 Q 4 8 3.5 16 Q 2.8 24 3.2 32 Q 4 40 3 48"
            stroke={BARK_DEEP} strokeWidth="1.2" fill="none" opacity="0.65" />
          <path d="M 8 0 Q 7.2 10 8.5 20 Q 9.3 30 7.8 42 Q 7 47 8 48"
            stroke={BARK_DEEP} strokeWidth="0.9" fill="none" opacity="0.5" />
          <path d="M 12 0 Q 11.5 12 12.2 26 Q 12.6 38 11.8 48"
            stroke={BARK_DEEP} strokeWidth="0.7" fill="none" opacity="0.35" />
          <path d="M 5.5 0 Q 5 10 5.5 24 Q 6 38 5.5 48"
            stroke={BARK_HIGHLIGHT} strokeWidth="0.6" fill="none" opacity="0.35" />
          <line x1="1" y1="14" x2="3" y2="14" stroke={BARK_DEEP} strokeWidth="0.5" opacity="0.5" />
          <line x1="10" y1="22" x2="12.5" y2="22" stroke={BARK_DEEP} strokeWidth="0.5" opacity="0.5" />
          <line x1="2" y1="36" x2="4" y2="36" stroke={BARK_DEEP} strokeWidth="0.4" opacity="0.45" />
        </pattern>
        <linearGradient id="barkShade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={BARK_DEEP} />
          <stop offset="20%" stopColor={BARK_MID} />
          <stop offset="50%" stopColor={BARK} />
          <stop offset="80%" stopColor={BARK_LIGHT} />
          <stop offset="100%" stopColor={BARK_DEEP} />
        </linearGradient>
        <radialGradient id="knotGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1F1410" />
          <stop offset="55%" stopColor={BARK_DEEP} />
          <stop offset="100%" stopColor={BARK_MID} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* PRIMARY EDGES — back pass (skip front-of-trunk edges) */}
      <g>
        {layout.edges.map(([parentId, childId, w1, w2, bend, bias, front], i) => {
          if (branchClass(childId) === "dormant") return null;
          if (front) return null;
          return renderPrimaryEdge(parentId, childId, w1, w2, bend, bias, i, getNode, states, treeCenter);
        })}
      </g>

      {/* TRUNK */}
      {(() => {
        const tr = layout.trunk;
        const t0State = states.t0 || "dormant";
        const tm1State = states.tm1 || "dormant";
        const tm2State = states.tm2 || "dormant";
        const anyActive = [t0State, tm1State, tm2State].some((s) => s !== "dormant");
        if (!anyActive) return null;

        const cP = { x: tr.baseX, y: tr.baseY };
        const cC = { x: tr.tipX, y: tr.tipY };
        const cW1 = tr.baseW, cW2 = tr.tipW;
        const cBend = tr.bend || 0, cBias = tr.bias || 0;
        const rng = mulberry32(987);
        const ctBranches = generateDecoBranches(cP, cC, cW1, cW2, cBend, cBias, 4, "bloom", rng, treeCenter);

        const zoneState = (sy: number): SkillState => {
          if (sy >= nodes.tm1.y) return t0State;
          if (sy >= nodes.tm2.y) return tm1State;
          return tm2State;
        };

        ctBranches.forEach((sb) => {
          const ownerState = zoneState(sb.sy);
          if (ownerState === "dormant") {
            sb.hideWood = true;
            sb.foliage = null;
          } else if (ownerState === "bare") {
            sb.foliage = null;
            // Hide depth-0 terminal twigs — they read as floating debris when bare
            if (sb.depth <= 0) sb.hideWood = true;
          } else {
            sb.foliage = sb.depth <= 1 ? ownerState : null;
          }
        });

        const ctPath = branchPath(cP.x, cP.y, cC.x, cC.y, cW1, cW2, cBend, cBias);

        // Knots — stratified along the LOWER half of the trunk only
        // (where real branch scars naturally form). Each is offset to one
        // side of the trunk (never on the spine), and rendered as a 3-layer
        // scar — outer bark-grain ring, dark body, inner eye, tiny lip
        // highlight — so they read as real wood, not flat dots.
        const knotRng = mulberry32(317);
        const knots: { x: number; y: number; r: number }[] = [];
        const trunkLen = Math.abs(cC.y - cP.y);
        const bands = [
          { tMin: 0.05, tMax: 0.18 },
          { tMin: 0.32, tMax: 0.48 },
        ];
        for (const band of bands) {
          const t = band.tMin + knotRng() * (band.tMax - band.tMin);
          const ky = cP.y - trunkLen * t;
          const localW = cW1 + (cW2 - cW1) * t;
          const side = knotRng() < 0.5 ? -1 : 1;
          const lateral = side * (0.15 + knotRng() * 0.15) * localW;
          const r = 1.8 + knotRng() * 1.3; // 1.8–3.1
          knots.push({ x: cP.x + lateral, y: ky, r });
        }

        return (
          <g>
            <path d={branchPath(cP.x, cP.y + 1.5, cC.x, cC.y + 1.5, cW1, cW2, cBend, cBias)}
              fill={BARK_DEEP} opacity="0.35" />
            <path d={ctPath} fill="url(#barkShade)" />
            <path d={ctPath} fill="url(#barkTexture)" opacity="0.55" />

            {/* Knots — 4-layer scar */}
            {knots.map((kn, j) => (
              <g key={`knot-${j}`}>
                {/* Outer ring — bark grain curving around the knot */}
                <ellipse cx={kn.x} cy={kn.y} rx={kn.r * 1.8} ry={kn.r * 1.3}
                  fill="none" stroke={BARK_DEEP} strokeWidth="0.4" opacity="0.35" />
                {/* Soft dark body */}
                <ellipse cx={kn.x} cy={kn.y} rx={kn.r * 1.2} ry={kn.r * 0.95}
                  fill="url(#knotGradient)" opacity="0.9" />
                {/* Inner eye — darker spot in the center */}
                <ellipse cx={kn.x} cy={kn.y} rx={kn.r * 0.4} ry={kn.r * 0.3}
                  fill="#15100A" opacity="0.7" />
                {/* Tiny lip highlight below — suggests the depression */}
                <ellipse cx={kn.x + kn.r * 0.1} cy={kn.y + kn.r * 0.7}
                  rx={kn.r * 0.5} ry={kn.r * 0.15}
                  fill={BARK_HIGHLIGHT} opacity="0.5" />
              </g>
            ))}

            {[-0.7, -0.45, -0.25, -0.05, 0.15, 0.35, 0.55, 0.75].map((lateral, k) => (
              <path key={`ctstr-${k}`}
                d={striationPath(cP.x, cP.y, cC.x, cC.y, cW1, cW2, cBend, cBias, lateral)}
                stroke={k % 2 === 0 ? BARK_DEEP : BARK_MID} strokeWidth="1.0"
                fill="none" opacity={0.45} />
            ))}
            <path d={striationPath(cP.x, cP.y, cC.x, cC.y, cW1, cW2, cBend, cBias, -0.85)}
              stroke={BARK_HIGHLIGHT} strokeWidth="1.2" fill="none" opacity="0.45" />

            {ctBranches.map((sb, k) => {
              if (sb.hideWood) return null;
              return renderSubBranch(sb, `ctsb-${k}`, sb.foliage ? "bloom" : null);
            })}

            {tm2State === "bloom" && (
              <FoliagePuff cx={cC.x} cy={cC.y} palette={BLOOM_PALETTE}
                size={36} density={85} seed={4242} squashY={0.9} offsetY={-4} accent />
            )}
            {tm2State === "budding" && (
              <FoliagePuff cx={cC.x} cy={cC.y} palette={BUD_PALETTE}
                size={22} density={30} seed={4242} squashY={0.9} offsetY={-8} />
            )}
          </g>
        );
      })()}

      {/* PRIMARY EDGES — front pass (the front-of-trunk edges, after trunk is drawn) */}
      <g>
        {layout.edges.map(([parentId, childId, w1, w2, bend, bias, front], i) => {
          if (branchClass(childId) === "dormant") return null;
          if (!front) return null;
          return renderPrimaryEdge(parentId, childId, w1, w2, bend, bias, i, getNode, states, treeCenter);
        })}
      </g>

      {/* CROWN BRANCHES on named non-trunk nodes */}
      <g>
        {Object.entries(nodes).map(([id, pos]) => {
          if (id === "t0" || id === "tm1" || id === "tm2") return null;
          const state = states[id] || "dormant";
          if (state === "dormant") return null;

          const incoming = layout.edges.find(([, c]) => c === id);
          if (!incoming) return null;
          const [parentId] = incoming;
          const parent = getNode(parentId);
          const dx = pos.x - parent.x, dy = pos.y - parent.y;
          const len = Math.hypot(dx, dy) || 1;
          const dirX = dx / len, dirY = dy / len;

          const crownLen = 70;
          const cP = { x: pos.x, y: pos.y };
          const cC = { x: pos.x + dirX * crownLen, y: pos.y + dirY * crownLen };
          const rng2 = mulberry32(id.charCodeAt(0) * 41 + id.charCodeAt(id.length - 1) * 7 + 31);
          const branches = generateDecoBranches(
            cP, cC, 16, 5, 0, 0,
            state === "bare" ? 1 : 3, state, rng2, treeCenter, true,
          );

          // Side crown — perpendicular to outgoing, picked to point upward
          const perp1X = -dirY, perp1Y = dirX;
          const perp2X = dirY, perp2Y = -dirX;
          const usePerp1 = perp1Y < perp2Y;
          const sideDirX = usePerp1 ? perp1X : perp2X;
          const sideDirY = usePerp1 ? perp1Y : perp2Y;
          const sideLen = 90;
          const cC_s = { x: pos.x + sideDirX * sideLen, y: pos.y + sideDirY * sideLen };
          const rng3 = mulberry32(id.charCodeAt(0) * 53 + 17);
          // Hide side crown entirely when bare — keeps the canopy area legible
          const sideBranches = state === "bare"
            ? []
            : generateDecoBranches(cP, cC_s, 14, 4, 0, 0, 3, state, rng3, treeCenter, true);

          const allBranches = [...branches, ...sideBranches];

          // Render the virtual outgoing branch itself — anchors the sub-branches
          const outgoingPath = taperedFilled(pos.x, pos.y, cC.x, cC.y, 14, 5, 0, 0);
          const sidePath = state !== "bare"
            ? taperedFilled(pos.x, pos.y, cC_s.x, cC_s.y, 12, 4, 0, 0)
            : null;

          return (
            <g key={`crown-${id}`}>
              {/* Virtual outgoing branch */}
              <path d={outgoingPath} fill="url(#barkShade)" />
              <path d={outgoingPath} fill="url(#barkTexture)" opacity="0.12" />
              {[-0.5, -0.1, 0.3].map((lat, kk) => (
                <path key={`outk-${kk}`}
                  d={striationPath(pos.x, pos.y, cC.x, cC.y, 14, 5, 0, 0, lat)}
                  stroke={kk % 2 === 0 ? BARK_DEEP : BARK_MID}
                  strokeWidth="0.8" fill="none" opacity="0.65" />
              ))}
              {sidePath && (
                <>
                  <path d={sidePath} fill="url(#barkShade)" />
                  <path d={sidePath} fill="url(#barkTexture)" opacity="0.12" />
                  {[-0.4, 0.1, 0.4].map((lat, kk) => (
                    <path key={`sidk-${kk}`}
                      d={striationPath(pos.x, pos.y, cC_s.x, cC_s.y, 12, 4, 0, 0, lat)}
                      stroke={kk % 2 === 0 ? BARK_DEEP : BARK_MID}
                      strokeWidth="0.7" fill="none" opacity="0.65" />
                  ))}
                </>
              )}
              {allBranches.map((sb, k) => {
                if (sb.hideWood) return null;
                return renderSubBranch(sb, `cr-${k}`, state);
              })}
            </g>
          );
        })}
      </g>

      {/* FILLER BRANCHES */}
      {layout.fillers && (
        <g>
          {layout.fillers.map((f, i) => {
            const ownerState = states[f.owner] || "dormant";
            if (ownerState === "dormant") return null;

            const cP = { x: f.sx, y: f.sy };
            const cC = { x: f.ex, y: f.ey };
            const rngF = mulberry32(f.seed);
            const branches = generateDecoBranches(
              cP, cC, f.baseW, f.tipW, 0, 0, f.depth, ownerState, rngF, treeCenter, true,
            );
            const mainPath = taperedFilled(f.sx, f.sy, f.ex, f.ey, f.baseW, f.tipW, 0, 0);

            return (
              <g key={`filler-${i}`}>
                <path d={mainPath} fill="url(#barkShade)" />
                <path d={mainPath} fill="url(#barkTexture)" opacity="0.12" />
                {[-0.65, -0.3, 0.05, 0.4, 0.65].map((lat, kk) => (
                  <path key={`fmk-${kk}`}
                    d={striationPath(f.sx, f.sy, f.ex, f.ey, f.baseW, f.tipW, 0, 0, lat)}
                    stroke={kk % 2 === 0 ? BARK_DEEP : BARK_MID}
                    strokeWidth={Math.max(0.5, f.baseW * 0.07)}
                    fill="none" opacity="0.7" />
                ))}
                {branches.map((sb, k) => {
                  if (sb.hideWood) return null;
                  return renderSubBranch(sb, `fb-${k}`, ownerState);
                })}
                {ownerState !== "bare" && (
                  <FoliagePuff cx={f.ex} cy={f.ey}
                    palette={ownerState === "bloom" ? BLOOM_PALETTE : BUD_PALETTE}
                    size={ownerState === "bloom" ? 28 : 20}
                    density={ownerState === "bloom" ? 65 : 32}
                    seed={f.seed + 999} squashY={0.9} offsetY={-3}
                    accent={ownerState === "bloom"} />
                )}
              </g>
            );
          })}
        </g>
      )}

      {/* DORMANT TWIGS (dashed) */}
      <g>
        {layout.edges.map(([parentId, childId, , , bend, bias], i) => {
          if (branchClass(childId) !== "dormant") return null;
          const p = getNode(parentId);
          const c = getNode(childId);
          return (
            <path key={`dormant-${i}`}
              d={twigPath(p.x, p.y, c.x, c.y, bend, bias)}
              stroke={DORMANT} strokeWidth="1.4" strokeDasharray="4 5"
              strokeLinecap="round" fill="none" opacity="0.7" />
          );
        })}
      </g>

      {/* FOLIAGE AT EACH NODE TIP — skip "bare" for non-trunk skills (crown branches
          already render visible bare twigs), and skip t0 entirely (trunk base). */}
      <g>
        {Object.entries(nodes).map(([id, pos], i) => {
          if (id === "t0") return null;
          const state = states[id] || "dormant";
          const isTrunkSkill = id === "tm1" || id === "tm2";
          if (state === "bare" && !isTrunkSkill) return null;
          const seed = id.charCodeAt(0) * 31 + id.charCodeAt(id.length - 1) + i * 7;
          return (
            <g key={`foliage-${id}`}>
              <FoliageForState state={state} x={pos.x} y={pos.y} seed={seed} />
            </g>
          );
        })}
      </g>

      {/* FALLING PETALS */}
      <g>
        {Object.entries(nodes).map(([id, pos], i) => {
          if (id === "t0") return null;
          if (states[id] !== "bloom") return null;
          const seed = id.charCodeAt(0) * 31 + id.charCodeAt(id.length - 1) + i * 7;
          return <FallingPetals key={`petals-${id}`} cx={pos.x} cy={pos.y} seed={seed} />;
        })}
      </g>

      {/* BLOOM BURST (one-shot on transition) */}
      <g>
        {Object.entries(nodes).map(([id, pos], i) => {
          const burstCount = bloomBursts[id] || 0;
          if (burstCount <= 0) return null;
          if (states[id] !== "bloom") return null;
          const seedBase = id.charCodeAt(0) * 31 + id.charCodeAt(id.length - 1) + i * 7 + burstCount * 13;

          const isTrunkSkill = id === "t0" || id === "tm1" || id === "tm2";
          if (isTrunkSkill) {
            let yTop: number, yBottom: number;
            if (id === "t0")       { yTop = nodes.tm1.y; yBottom = layout.trunk.baseY; }
            else if (id === "tm1") { yTop = nodes.tm2.y; yBottom = nodes.tm1.y; }
            else                   { yTop = layout.trunk.tipY; yBottom = nodes.tm2.y; }

            const rng = mulberry32(seedBase + 1234);
            const points: { x: number; y: number; seed: number }[] = [];
            for (let k = 0; k < 7; k++) {
              const yy = yTop + rng() * (yBottom - yTop);
              const xx = layout.trunk.baseX + (rng() - 0.5) * 240;
              points.push({ x: xx, y: yy, seed: seedBase + k * 11 });
            }
            return (
              <g key={`burst-${id}-${burstCount}`}>
                {points.map((pt, k) => (
                  <BloomBurst key={k} cx={pt.x} cy={pt.y} seed={pt.seed} count={14} />
                ))}
              </g>
            );
          }

          return <BloomBurst key={`burst-${id}-${burstCount}`} cx={pos.x} cy={pos.y} seed={seedBase} />;
        })}
      </g>

      {showAnchors && (
        <g>
          {Object.entries(nodes).map(([id, pos]) => (
            <g key={`anchor-${id}`} transform={`translate(${pos.x} ${pos.y})`}>
              <circle r="3" fill="#ff3366" />
              <text y="-32" textAnchor="middle" fontSize="11" fill="#666" fontFamily="monospace">{id}</text>
            </g>
          ))}
        </g>
      )}
    </>
  );
}
