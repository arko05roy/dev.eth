"use client";
import { useEffect, useMemo, useState } from "react";
import type { ActMeta, Talk } from "@/lib/types";
import { SPEAKERS } from "@/lib/talks";

interface Props {
  acts: ActMeta[];
  talks: Talk[];
  watched: Set<string>;
  totalWatched: number;
  totalTalks: number;
  onClearAll: () => void;
}

export default function Sidebar({ acts, talks, watched, totalWatched, totalTalks, onClearAll }: Props) {
  const [active, setActive] = useState<string>("act-I");
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    const sections = acts.map((a) => document.getElementById(`act-${a.id}`)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [acts]);

  const pct = totalTalks === 0 ? 0 : Math.round((totalWatched / totalTalks) * 100);

  const perActCounts = acts.map((a) => {
    const list = talks.filter((t) => t.act === a.id);
    const w = list.filter((t) => watched.has(t.id)).length;
    return { act: a, total: list.length, w };
  });

  return (
    <aside className="hidden lg:flex lg:flex-col w-72 shrink-0 border-r hairline px-6 py-10 sticky top-12 h-[calc(100vh-3rem)] overflow-y-auto">
      <div className="mb-10">
        <a href="/" className="block group">
          <p className="font-mono text-[10px] tracking-[0.25em] text-parch-faint">DEVCON · ETHGLOBAL</p>
          <h1 className="font-serif text-3xl leading-tight text-parch mt-1 group-hover:text-ember transition-colors">
            dev<span className="text-ember">.</span>eth
          </h1>
          <p className="font-mono text-[10px] tracking-[0.25em] text-parch-ghost mt-1">← THE GATE</p>
        </a>
      </div>

      <div className="mb-10">
        <div className="flex justify-between font-mono text-[10px] tracking-widest text-parch-faint mb-2">
          <span>OVERALL</span>
          <span>{totalWatched}/{totalTalks}</span>
        </div>
        <div className="h-px bg-[var(--hairline)] relative mb-2">
          <div
            className="absolute inset-y-0 left-0 bg-ember"
            style={{ width: `${pct}%`, transition: "width 380ms cubic-bezier(0.22,0.61,0.36,1)" }}
          />
        </div>
        <p className="font-mono text-[11px] text-parch-dim">{pct}% complete</p>
      </div>

      <nav className="space-y-1 mb-10">
        {perActCounts.map(({ act, total, w }) => {
          const isActive = active === `act-${act.id}`;
          const apct = total === 0 ? 0 : Math.round((w / total) * 100);
          return (
            <a
              key={act.id}
              href={`#act-${act.id}`}
              className={`group flex items-baseline gap-3 py-2 transition-colors ${
                isActive ? "text-ember" : "text-parch-dim hover:text-parch"
              }`}
            >
              <span className="font-serif text-2xl w-6" aria-hidden>{act.glyph}</span>
              <span className="flex-1 min-w-0">
                <span className="font-mono text-[10px] tracking-widest block">
                  ACT {act.id}
                </span>
                <span className="font-serif text-sm leading-tight block truncate">
                  {act.title}
                </span>
              </span>
              <span className="font-mono text-[10px] text-parch-faint">
                {apct}%
              </span>
            </a>
          );
        })}
      </nav>

      <ProlificVoices />

      <div className="mt-auto pt-6 border-t hairline space-y-3">
        <button
          type="button"
          onClick={() => {
            if (confirmClear) {
              onClearAll();
              setConfirmClear(false);
            } else {
              setConfirmClear(true);
              setTimeout(() => setConfirmClear(false), 4000);
            }
          }}
          className="w-full font-mono text-[10px] tracking-widest text-parch-faint hover:text-blood py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blood focus-visible:ring-offset-2 focus-visible:ring-offset-void"
        >
          {confirmClear ? "[ CONFIRM RESET ]" : "[ RESET PATH ]"}
        </button>
        <p className="font-mono text-[10px] text-parch-ghost leading-relaxed">
          Progress saved locally.
          <br/>
          {totalTalks} talks across<br/>
          Devcons 0–7.
        </p>
      </div>
    </aside>
  );
}

function ProlificVoices() {
  const top = useMemo(() => {
    return Object.values(SPEAKERS)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, []);

  function slugify(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  return (
    <div className="mb-8 pt-4 border-t hairline">
      <p className="font-mono text-[10px] tracking-widest text-parch-faint mb-3">
        PROLIFIC VOICES
      </p>
      <ul className="space-y-1">
        {top.map((sp) => (
          <li key={sp.id}>
            <a
              href={`/s/${slugify(sp.name)}`}
              className="flex justify-between items-baseline gap-2 py-0.5 text-[12px] text-parch-dim hover:text-ember transition-colors"
            >
              <span className="truncate font-serif">{sp.name}</span>
              <span className="font-mono text-[10px] text-parch-faint shrink-0">{sp.count}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
