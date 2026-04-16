import { useState, useCallback, useEffect, useRef } from "react";

type SkillStatus = "completed" | "in-progress" | "available" | "locked";

interface Skill {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
  status: SkillStatus;
  progress: number;
  xp: number;
  maxXp: number;
  icon: string;
  children: string[];
  tier: number;
}

interface SkillTreeData {
  name: string;
  description: string;
  skills: Record<string, Skill>;
}

const TREES: Record<string, SkillTreeData> = {
  guitar: {
    name: "Guitar",
    description: "From first strum to jazz voicings",
    skills: {
      basics: {
        id: "basics", name: "The Basics", description: "Holding, tuning, and your first notes",
        x: 50, y: 88, status: "completed", progress: 100, xp: 120, maxXp: 120,
        icon: "♪", children: ["chords", "rhythm"], tier: 0,
      },
      chords: {
        id: "chords", name: "Open Chords", description: "The essential shapes that unlock every campfire song",
        x: 25, y: 55, status: "completed", progress: 100, xp: 200, maxXp: 200,
        icon: "♫", children: ["barre", "fingerpicking"], tier: 1,
      },
      rhythm: {
        id: "rhythm", name: "Strumming", description: "Finding your groove and developing solid timing",
        x: 75, y: 60, status: "in-progress", progress: 62, xp: 124, maxXp: 200,
        icon: "◊", children: ["songwriting"], tier: 1,
      },
      barre: {
        id: "barre", name: "Barre Chords", description: "Moveable shapes that open the entire fretboard",
        x: 15, y: 30, status: "available", progress: 0, xp: 0, maxXp: 300,
        icon: "◈", children: ["jazz"], tier: 2,
      },
      fingerpicking: {
        id: "fingerpicking", name: "Fingerpicking", description: "Delicate patterns with individual fingers",
        x: 42, y: 25, status: "available", progress: 0, xp: 0, maxXp: 300,
        icon: "✧", children: ["jazz"], tier: 2,
      },
      songwriting: {
        id: "songwriting", name: "Songwriting", description: "Composing your own pieces and progressions",
        x: 72, y: 28, status: "locked", progress: 0, xp: 0, maxXp: 350,
        icon: "✦", children: [], tier: 2,
      },
      jazz: {
        id: "jazz", name: "Jazz Voicings", description: "Extended chords and advanced harmony",
        x: 32, y: 8, status: "locked", progress: 0, xp: 0, maxXp: 500,
        icon: "❋", children: [], tier: 3,
      },
    },
  },
  cooking: {
    name: "Cooking",
    description: "From knife skills to plated art",
    skills: {
      knifeskills: {
        id: "knifeskills", name: "Knife Skills", description: "Dice, julienne, chiffonade — the foundation",
        x: 50, y: 88, status: "completed", progress: 100, xp: 150, maxXp: 150,
        icon: "△", children: ["sauces", "proteins"], tier: 0,
      },
      sauces: {
        id: "sauces", name: "Mother Sauces", description: "The five French sauces that build everything",
        x: 28, y: 55, status: "in-progress", progress: 40, xp: 80, maxXp: 200,
        icon: "○", children: ["plating"], tier: 1,
      },
      proteins: {
        id: "proteins", name: "Proteins", description: "Meat, fish, and tofu — cooked to perfection",
        x: 72, y: 55, status: "available", progress: 0, xp: 0, maxXp: 250,
        icon: "◇", children: ["plating"], tier: 1,
      },
      plating: {
        id: "plating", name: "Plating", description: "Turning dishes into visual art",
        x: 50, y: 22, status: "locked", progress: 0, xp: 0, maxXp: 300,
        icon: "❊", children: [], tier: 2,
      },
    },
  },
  drawing: {
    name: "Drawing",
    description: "From first line to full scenes",
    skills: {
      lines: {
        id: "lines", name: "Line Control", description: "Confident marks drawn from the shoulder",
        x: 50, y: 88, status: "completed", progress: 100, xp: 100, maxXp: 100,
        icon: "—", children: ["shapes", "perspective"], tier: 0,
      },
      shapes: {
        id: "shapes", name: "Form & Shape", description: "Breaking everything into basic 3D forms",
        x: 30, y: 55, status: "in-progress", progress: 75, xp: 150, maxXp: 200,
        icon: "□", children: ["anatomy", "shading"], tier: 1,
      },
      perspective: {
        id: "perspective", name: "Perspective", description: "1, 2, and 3-point spatial drawing",
        x: 70, y: 58, status: "available", progress: 0, xp: 0, maxXp: 250,
        icon: "⬡", children: ["environments"], tier: 1,
      },
      anatomy: {
        id: "anatomy", name: "Anatomy", description: "The human figure drawn with understanding",
        x: 18, y: 25, status: "locked", progress: 0, xp: 0, maxXp: 400,
        icon: "⊕", children: [], tier: 2,
      },
      shading: {
        id: "shading", name: "Light & Shadow", description: "Rendering form through value",
        x: 44, y: 22, status: "locked", progress: 0, xp: 0, maxXp: 300,
        icon: "◐", children: [], tier: 2,
      },
      environments: {
        id: "environments", name: "Environments", description: "Immersive spaces and landscapes",
        x: 70, y: 25, status: "locked", progress: 0, xp: 0, maxXp: 350,
        icon: "▲", children: [], tier: 2,
      },
    },
  },
};

const PALETTE = {
  cream: "#FAF6F0",
  parchment: "#F0E8DC",
  ink: "#1A1A18",
  forest: "#2D4A3E",
  forestLight: "#3D6B5A",
  amber: "#C8956C",
  amberLight: "#E2B98B",
  amberDark: "#A67448",
  terracotta: "#C4654A",
  sage: "#8BA692",
  stone: "#9B9585",
  muted: "#B5ADA0",
  faint: "#D8D0C4",
};

interface StatusStyle {
  color: string;
  fill: string;
  textColor: string;
  label: string;
  ring: string;
}

const STATUS_CONFIG: Record<SkillStatus, StatusStyle> = {
  completed: { color: PALETTE.forest, fill: PALETTE.forest, textColor: PALETTE.cream, label: "Mastered", ring: PALETTE.forestLight },
  "in-progress": { color: PALETTE.amber, fill: PALETTE.amber, textColor: PALETTE.cream, label: "Growing", ring: PALETTE.amberLight },
  available: { color: PALETTE.forestLight, fill: "transparent", textColor: PALETTE.forest, label: "Ready", ring: PALETTE.sage },
  locked: { color: PALETTE.faint, fill: "transparent", textColor: PALETTE.muted, label: "Locked", ring: PALETTE.faint },
};

function OrganicBranch({ parent, child, parentStatus }: { parent: Skill; child: Skill; parentStatus: SkillStatus }) {
  const svgW = 800, svgH = 600;
  const x1 = (parent.x / 100) * svgW, y1 = (parent.y / 100) * svgH;
  const x2 = (child.x / 100) * svgW, y2 = (child.y / 100) * svgH;

  const midY = y1 + (y2 - y1) * 0.4;
  const wobble = (x2 - x1) * 0.15;
  const path = `M ${x1} ${y1} C ${x1 + wobble} ${midY}, ${x2 - wobble} ${midY + (y2 - y1) * 0.1}, ${x2} ${y2}`;

  const isActive = parentStatus === "completed";
  const isPartial = parentStatus === "in-progress";

  return (
    <g>
      <path d={path} fill="none" stroke={isActive ? PALETTE.forest : isPartial ? PALETTE.amber + "66" : PALETTE.faint}
        strokeWidth={isActive ? 2.5 : 1.5}
        strokeDasharray={!isActive && !isPartial ? "8 6" : "none"}
        strokeLinecap="round" opacity={isActive ? 0.7 : isPartial ? 0.5 : 0.3} />
      {isActive && <>
        <circle r="3" fill={PALETTE.forest} opacity={0.4}>
          <animateMotion dur="4s" repeatCount="indefinite" path={path} />
        </circle>
      </>}
    </g>
  );
}

function SkillBud({ skill, onClick, selected, index }: { skill: Skill; onClick: (s: Skill) => void; selected: boolean; index: number }) {
  const config = STATUS_CONFIG[skill.status];
  const isLocked = skill.status === "locked";
  const svgW = 800, svgH = 600;
  const cx = (skill.x / 100) * svgW, cy = (skill.y / 100) * svgH;
  const r = 28;

  return (
    <g onClick={() => !isLocked && onClick(skill)} style={{ cursor: isLocked ? "default" : "pointer" }}
      className="skill-bud" opacity={0}
      >
      <style>{`
        .skill-bud { animation: budAppear 0.6s ease-out ${index * 0.08 + 0.2}s forwards; }
        @keyframes budAppear { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      {selected && <circle cx={cx} cy={cy} r={r + 14} fill="none" stroke={config.ring}
        strokeWidth={1} opacity={0.4} strokeDasharray="4 4">
        <animateTransform attributeName="transform" type="rotate"
          from={`0 ${cx} ${cy}`} to={`360 ${cx} ${cy}`} dur="20s" repeatCount="indefinite" />
      </circle>}

      {skill.status === "completed" && <>
        <circle cx={cx} cy={cy} r={r + 6} fill="none" stroke={PALETTE.forest} strokeWidth={0.5} opacity={0.2} />
        <circle cx={cx} cy={cy} r={r + 10} fill="none" stroke={PALETTE.forest} strokeWidth={0.3} opacity={0.1} />
      </>}

      <circle cx={cx} cy={cy} r={r} fill={config.fill || "transparent"}
        stroke={config.color} strokeWidth={skill.status === "available" ? 1.5 : 2}
        strokeDasharray={isLocked ? "3 3" : "none"} opacity={isLocked ? 0.4 : 1} />

      {skill.status === "in-progress" && <>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={PALETTE.parchment}
          strokeWidth={3} opacity={0.3} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={config.color}
          strokeWidth={3} strokeDasharray={`${(skill.progress / 100) * (2 * Math.PI * r)} ${2 * Math.PI * r}`}
          strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} opacity={0.9} />
      </>}

      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="central"
        fontSize={skill.status === "completed" ? "16" : "14"}
        fontFamily="'Playfair Display', serif" fontWeight={500}
        fill={skill.status === "available" ? config.color : config.textColor}
        opacity={isLocked ? 0.3 : 1} style={{ pointerEvents: "none" }}>
        {skill.icon}
      </text>

      <text x={cx} y={cy + r + 18} textAnchor="middle" dominantBaseline="central"
        fontSize="11" fontFamily="'DM Sans', sans-serif" fontWeight={500}
        fill={isLocked ? PALETTE.muted : PALETTE.ink} opacity={isLocked ? 0.35 : 0.75}
        letterSpacing="0.3px" style={{ pointerEvents: "none" }}>
        {skill.name}
      </text>
    </g>
  );
}

function PracticeSheet({ skill, onClose, onLogXp }: { skill: Skill; onClose: () => void; onLogXp: (id: string, amount: number) => void }) {
  const config = STATUS_CONFIG[skill.status];
  const isLocked = skill.status === "locked";
  const [logAmount, setLogAmount] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLog = (amt: number) => {
    setLogAmount(amt);
    setShowConfirm(true);
    setTimeout(() => {
      onLogXp(skill.id, amt);
      setShowConfirm(false);
      setLogAmount(null);
    }, 600);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        position: "absolute", inset: 0,
        background: "rgba(26,26,24,0.2)", backdropFilter: "blur(4px)",
      }} />
      <div onClick={(e) => e.stopPropagation()} style={{
        position: "relative", width: "100%", maxWidth: 480,
        background: PALETTE.cream, borderRadius: "24px 24px 0 0",
        padding: "32px 28px 40px", animation: "sheetUp 0.35s cubic-bezier(0.16,1,0.3,1)",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.08)",
      }}>
        <div style={{
          width: 36, height: 4, borderRadius: 2, background: PALETTE.faint,
          margin: "0 auto 24px",
        }} />

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%", display: "flex",
            alignItems: "center", justifyContent: "center",
            background: config.fill || PALETTE.parchment,
            border: `2px solid ${config.color}`,
          }}>
            <span style={{
              fontSize: 20, fontFamily: "'Playfair Display', serif",
              color: skill.status === "available" ? config.color : config.textColor,
            }}>{skill.icon}</span>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600,
              color: PALETTE.ink, margin: 0, lineHeight: 1.2,
            }}>{skill.name}</h3>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 13,
              color: PALETTE.stone, margin: "4px 0 0",
            }}>{skill.description}</p>
          </div>
        </div>

        <div style={{
          background: PALETTE.parchment, borderRadius: 12, padding: "14px 16px", marginBottom: 20,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: PALETTE.stone, fontWeight: 500 }}>
              {isLocked ? "Prerequisites needed" : `${skill.xp} of ${skill.maxXp} XP`}
            </span>
            <span style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
              color: config.color,
            }}>
              {isLocked ? "Locked" : skill.status === "completed" ? "Complete" : `${skill.progress}%`}
            </span>
          </div>
          <div style={{
            height: 6, background: PALETTE.cream, borderRadius: 3, overflow: "hidden",
          }}>
            <div style={{
              height: "100%", width: `${skill.progress}%`, borderRadius: 3,
              background: `linear-gradient(90deg, ${config.color}88, ${config.color})`,
              transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)",
            }} />
          </div>
        </div>

        {!isLocked && skill.status !== "completed" && (
          <div>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: PALETTE.stone,
              margin: "0 0 10px", fontWeight: 500, letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}>Log practice</p>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { amt: 10, label: "Quick\nsession", time: "~15 min" },
                { amt: 25, label: "Solid\npractice", time: "~30 min" },
                { amt: 50, label: "Deep\nwork", time: "~1 hour" },
              ].map(({ amt, label, time }) => (
                <button key={amt} onClick={() => handleLog(amt)} style={{
                  flex: 1, padding: "16px 8px", background: showConfirm && logAmount === amt ? config.color : "transparent",
                  border: `1.5px solid ${showConfirm && logAmount === amt ? config.color : PALETTE.faint}`,
                  borderRadius: 14, cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                  transform: showConfirm && logAmount === amt ? "scale(0.96)" : "scale(1)",
                }}>
                  <div style={{
                    fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600,
                    color: showConfirm && logAmount === amt ? PALETTE.cream : PALETTE.ink,
                    marginBottom: 4,
                  }}>+{amt}</div>
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 10,
                    color: showConfirm && logAmount === amt ? PALETTE.cream + "cc" : PALETTE.stone,
                    lineHeight: 1.3, whiteSpace: "pre-line",
                  }}>{label}</div>
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 9, marginTop: 4,
                    color: showConfirm && logAmount === amt ? PALETTE.cream + "88" : PALETTE.muted,
                  }}>{time}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {skill.status === "completed" && (
          <div style={{
            textAlign: "center", padding: "12px 0",
            fontFamily: "'Playfair Display', serif", fontSize: 16,
            color: PALETTE.forest, fontStyle: "italic",
          }}>
            This branch has fully bloomed.
          </div>
        )}
      </div>
    </div>
  );
}

export default function SkillTreeV2() {
  const [activeTree, setActiveTree] = useState("guitar");
  const [trees, setTrees] = useState(TREES);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [animKey, setAnimKey] = useState(0);

  const tree = trees[activeTree];
  const skills = Object.values(tree.skills);
  const totalXp = skills.reduce((s, sk) => s + sk.xp, 0);
  const maxXp = skills.reduce((s, sk) => s + sk.maxXp, 0);
  const completedCount = skills.filter((s) => s.status === "completed").length;

  const handleLogXp = useCallback((skillId: string, amount: number) => {
    setTrees((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as typeof TREES;
      const skill = next[activeTree].skills[skillId];
      if (!skill || skill.status === "locked" || skill.status === "completed") return prev;
      skill.xp = Math.min(skill.xp + amount, skill.maxXp);
      skill.progress = Math.round((skill.xp / skill.maxXp) * 100);
      if (skill.status === "available" && skill.xp > 0) skill.status = "in-progress";
      if (skill.xp >= skill.maxXp) {
        skill.status = "completed"; skill.progress = 100;
        for (const childId of skill.children) {
          const child = next[activeTree].skills[childId];
          if (child && child.status === "locked") {
            const parents = Object.values(next[activeTree].skills)
              .filter((s) => s.children.includes(childId));
            if (parents.every((p) => p.status === "completed")) child.status = "available";
          }
        }
      }
      setSelectedSkill({ ...skill });
      return next;
    });
  }, [activeTree]);

  useEffect(() => {
    if (selectedSkill) {
      const updated = trees[activeTree].skills[selectedSkill.id];
      if (updated) setSelectedSkill({ ...updated });
    }
  }, [trees]);

  const switchTree = (key: string) => {
    setActiveTree(key);
    setSelectedSkill(null);
    setAnimKey((k) => k + 1);
  };

  return (
    <div style={{
      width: "100vw", height: "100vh", background: PALETTE.cream,
      overflow: "hidden", position: "relative",
      backgroundImage: `radial-gradient(${PALETTE.faint}44 1px, transparent 1px)`,
      backgroundSize: "24px 24px",
    }}>
      <style>{`
        @keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes budAppear { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        .tree-selector:hover { background: ${PALETTE.parchment} !important; }
        * { box-sizing: border-box; }
      `}</style>

      {/* Top bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
        padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        background: `linear-gradient(to bottom, ${PALETTE.cream} 60%, transparent)`,
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700,
            color: PALETTE.ink, margin: 0, letterSpacing: "-0.5px",
          }}>Grow</h1>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: PALETTE.stone,
            margin: "2px 0 0", fontWeight: 500,
          }}>{tree.description}</p>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: PALETTE.parchment, borderRadius: 20, padding: "8px 16px",
        }}>
          <div style={{
            width: 40, height: 4, borderRadius: 2, background: PALETTE.faint, overflow: "hidden",
          }}>
            <div style={{
              height: "100%", width: `${(totalXp / maxXp) * 100}%`,
              background: PALETTE.forest, borderRadius: 2,
              transition: "width 0.6s ease",
            }} />
          </div>
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
            color: PALETTE.forest,
          }}>{completedCount}/{skills.length}</span>
        </div>
      </div>

      {/* Tree selector */}
      <div style={{
        position: "absolute", top: 80, left: "50%", transform: "translateX(-50%)",
        zIndex: 10, display: "flex", gap: 2,
        background: PALETTE.parchment, borderRadius: 14, padding: 3,
        border: `1px solid ${PALETTE.faint}`,
      }}>
        {Object.entries(trees).map(([key, t]) => (
          <button key={key} className="tree-selector" onClick={() => switchTree(key)} style={{
            background: activeTree === key ? PALETTE.cream : "transparent",
            border: "none", borderRadius: 11, padding: "8px 20px", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
            color: activeTree === key ? PALETTE.ink : PALETTE.stone,
            boxShadow: activeTree === key ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
            transition: "all 0.2s",
          }}>{t.name}</button>
        ))}
      </div>

      {/* SVG Tree */}
      <svg key={animKey} viewBox="0 0 800 600" style={{
        width: "100%", height: "100%", position: "absolute", top: 0, left: 0,
      }}>
        {/* Trunk from bottom */}
        <path d={`M 400 600 C 400 560, 400 520, ${(skills[0]?.x / 100) * 800} ${(skills[0]?.y / 100) * 600}`}
          fill="none" stroke={PALETTE.forest} strokeWidth={3} opacity={0.15} strokeLinecap="round" />

        {skills.map((skill) =>
          skill.children.map((childId) => {
            const child = tree.skills[childId];
            if (!child) return null;
            return <OrganicBranch key={`${skill.id}-${childId}`}
              parent={skill} child={child} parentStatus={skill.status} />;
          })
        )}

        {skills.map((skill, i) => (
          <SkillBud key={skill.id} skill={skill} index={i}
            onClick={(s) => setSelectedSkill(selectedSkill?.id === s.id ? null : s)}
            selected={selectedSkill?.id === skill.id} />
        ))}
      </svg>

      {/* Legend */}
      <div style={{
        position: "absolute", bottom: 24, left: 28, display: "flex", gap: 20, zIndex: 5,
      }}>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: key === "available" || key === "locked" ? "transparent" : cfg.color,
              border: `1.5px solid ${cfg.color}`,
              opacity: key === "locked" ? 0.4 : 0.8,
              ...(key === "locked" ? { borderStyle: "dashed" } : {}),
            }} />
            <span style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: PALETTE.stone,
              fontWeight: 500,
            }}>{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* Attribution */}
      <div style={{
        position: "absolute", bottom: 24, right: 28,
        fontFamily: "'Playfair Display', serif", fontSize: 11,
        color: PALETTE.muted, fontStyle: "italic",
      }}>
        Every expert was once a beginner
      </div>

      {/* Practice sheet */}
      {selectedSkill && (
        <PracticeSheet skill={selectedSkill}
          onClose={() => setSelectedSkill(null)} onLogXp={handleLogXp} />
      )}
    </div>
  );
}
