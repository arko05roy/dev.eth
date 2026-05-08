"use client";
import { ACTS } from "@/lib/acts";
import type { Talk } from "@/lib/types";
import { useMemo } from "react";

interface Props {
  talks: Talk[];
  watched: Set<string>;
}

// Hand-placed nodes — flowing south-east, like a path through Lands
const NODES: Record<string, { x: number; y: number }> = {
  I:   { x: 90,  y: 90 },
  II:  { x: 250, y: 130 },
  III: { x: 410, y: 200 },
  IV:  { x: 200, y: 320 },
  V:   { x: 470, y: 360 },
  VI:  { x: 700, y: 280 },
};

const TRAILS: [string, string, "main" | "fork"][] = [
  ["I","II","main"], ["II","III","main"],
  ["III","IV","fork"], ["III","V","main"], ["III","VI","fork"],
  ["IV","V","fork"],  ["V","VI","main"],
];

export default function Map({ talks, watched }: Props) {
  const stats = useMemo(() => {
    const m: Record<string, { total: number; w: number }> = {};
    for (const a of ACTS) m[a.id] = { total: 0, w: 0 };
    for (const t of talks) {
      m[t.act].total++;
      if (watched.has(t.id)) m[t.act].w++;
    }
    return m;
  }, [talks, watched]);

  return (
    <div className="relative max-w-3xl mx-auto px-2">
      <svg
        viewBox="0 0 800 460"
        className="w-full h-auto"
        role="img"
        aria-label="Map of the six Lands"
      >
        <defs>
          <radialGradient id="halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c9a96e" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#c9a96e" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#c9a96e" stopOpacity="0" />
          </radialGradient>
          <pattern id="parchgrain" width="120" height="120" patternUnits="userSpaceOnUse">
            <rect width="120" height="120" fill="transparent" />
            <circle cx="20" cy="40" r="0.4" fill="#c9a96e" opacity="0.07" />
            <circle cx="80" cy="20" r="0.3" fill="#c9a96e" opacity="0.05" />
            <circle cx="60" cy="90" r="0.4" fill="#c9a96e" opacity="0.06" />
            <circle cx="100" cy="60" r="0.3" fill="#c9a96e" opacity="0.05" />
          </pattern>
        </defs>

        <rect width="800" height="460" fill="url(#parchgrain)" />

        {/* Trails */}
        {TRAILS.map(([from, to, kind], i) => {
          const a = NODES[from], b = NODES[to];
          const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 20 };
          const path = `M ${a.x} ${a.y} Q ${mid.x} ${mid.y} ${b.x} ${b.y}`;
          return (
            <path
              key={i}
              d={path}
              fill="none"
              stroke="#4a4438"
              strokeWidth={kind === "main" ? 1.2 : 0.7}
              strokeDasharray={kind === "fork" ? "3 5" : ""}
              opacity={0.7}
            />
          );
        })}

        {/* Act nodes */}
        {ACTS.map((act) => {
          const pos = NODES[act.id];
          const s = stats[act.id];
          const pct = s.total === 0 ? 0 : s.w / s.total;
          const radius = 26 + pct * 14;
          return (
            <g key={act.id} transform={`translate(${pos.x},${pos.y})`}>
              <a href={`/path#act-${act.id}`}>
                {/* halo by progress */}
                <circle r={radius + 18} fill="url(#halo)" opacity={0.6 + pct * 0.4} />
                {/* node */}
                <circle r={radius} fill="#0e0c0a" stroke="#c9a96e" strokeWidth={pct === 1 ? 2 : 1} />
                {/* glyph */}
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontFamily="serif"
                  fontSize={radius * 1.1}
                  fill="#c9a96e"
                  className="font-serif"
                >{act.glyph}</text>
                {/* label below */}
                <text
                  textAnchor="middle"
                  y={radius + 18}
                  fontSize="11"
                  fill="#a89c87"
                  fontFamily="ui-sans-serif, system-ui"
                  letterSpacing="2"
                >{`ACT ${act.id}`}</text>
                <text
                  textAnchor="middle"
                  y={radius + 32}
                  fontSize="10"
                  fill="#7a7160"
                  fontFamily="ui-monospace, monospace"
                >{`${s.w}/${s.total} · ${Math.round(pct * 100)}%`}</text>
              </a>
            </g>
          );
        })}
      </svg>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-6">
        {ACTS.map((act) => (
          <a
            key={act.id}
            href={`/path#act-${act.id}`}
            className="px-3 py-2 border border-[var(--hairline)] hover:border-parch-faint hover:bg-void-50/40 transition-colors group"
          >
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-2xl text-ember">{act.glyph}</span>
              <span className="font-mono text-[10px] tracking-widest text-parch-faint">ACT {act.id}</span>
            </div>
            <div className="font-serif text-sm text-parch leading-tight mt-0.5">{act.title}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
