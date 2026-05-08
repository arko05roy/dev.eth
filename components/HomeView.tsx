"use client";
import { TALKS } from "@/lib/talks";
import { useProgress } from "@/lib/progress";
import { ACTS, CLASSES } from "@/lib/acts";
import Map from "./Map";
import { useEffect, useState } from "react";
import { ACHIEVEMENTS } from "@/lib/achievements";

export default function HomeView() {
  const p = useProgress();

  // count split
  const counts = (() => {
    let dev = 0, eg = 0;
    for (const t of TALKS) (t.source === "ethglobal" ? eg++ : dev++);
    return { dev, eg, total: TALKS.length };
  })();

  return (
    <main className="max-w-5xl mx-auto px-6 lg:px-12 pb-24">
      <header className="pt-16 pb-10">
        <p className="font-mono text-[10px] tracking-widest text-ember mb-6">
          ─── DEVCON · ETHGLOBAL · 2014–2026 · {counts.total} TALKS ───
        </p>
        <h1 className="font-serif text-5xl md:text-7xl leading-[1.02] text-parch mb-8">
          The Tarnished<br/>Path
        </h1>
        <blockquote className="font-serif italic text-base md:text-lg text-parch-dim border-l border-ember pl-6 max-w-2xl leading-relaxed">
          Tarnished, you stand at the gate. Six Lands lie before you.
          One holds the protocol's first whisper; one holds its present frontier.
          The map below is yours to walk.
        </blockquote>

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] tracking-wider text-parch-faint">
          <span><span className="text-ember">{counts.dev.toLocaleString()}</span> CANONICAL · DEVCON</span>
          <span><span className="text-ember">{counts.eg.toLocaleString()}</span> APOCRYPHAL · ETHGLOBAL</span>
          <span><span className="text-ember">{ACHIEVEMENTS.length}</span> ACHIEVEMENTS</span>
        </div>
      </header>

      {/* Tarnished card — only after hydration */}
      {p.hydrated && (
        <TarnishedCard p={p} />
      )}

      <section className="mb-16 mt-12">
        <p className="font-mono text-[10px] tracking-widest text-parch-faint mb-4">
          ─── THE MAP ───
        </p>
        <Map talks={TALKS} watched={p.watched} />
      </section>

      <Quicklinks />

      {p.hydrated && p.classChosen && (
        <p className="text-center mt-10 font-mono text-[11px] tracking-widest text-parch-faint">
          You walk as <span className="text-ember">{p.classChosen}</span>.
        </p>
      )}

      {p.hydrated && !p.classChosen && (
        <ClassPick onPick={p.setClass} />
      )}

      {/* Newly-unlocked toast */}
      {p.hydrated && p.newlyUnlocked.length > 0 && (
        <UnlockToast ids={p.newlyUnlocked} ack={p.ackUnlocked} />
      )}
    </main>
  );
}

function TarnishedCard({ p }: { p: ReturnType<typeof useProgress> }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(p.name);
  useEffect(() => setDraft(p.name), [p.name]);

  return (
    <section className="border border-[var(--hairline)] bg-void-50/40 px-6 py-5 mb-2">
      <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] tracking-widest text-parch-faint mb-1">YOU ARE</p>
          {editing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                p.setName(draft);
                setEditing(false);
              }}
              className="flex items-baseline gap-2"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                autoFocus
                onBlur={() => { p.setName(draft); setEditing(false); }}
                className="bg-transparent border-b border-ember outline-none font-serif text-3xl text-parch px-0 py-0 max-w-[220px]"
                maxLength={32}
              />
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="font-serif text-3xl text-parch hover:text-ember transition-colors text-left"
              title="Click to rename"
            >
              {p.name}
            </button>
          )}
          <p className="font-mono text-[10px] tracking-widest text-ember mt-1">
            {p.level.current.name.toUpperCase()}
            {p.level.next ? ` · ${p.level.pctToNext}% to ${p.level.next.name}` : " · MAX"}
          </p>
        </div>
        <Stat label="XP" value={p.xp.toLocaleString()} />
        <Stat label="QUESTS" value={`${p.watched.size} / ${TALKS.length.toLocaleString()}`} />
        <Stat label="STREAK" value={p.streak === 0 ? "—" : `${p.streak} day${p.streak === 1 ? "" : "s"}`} />
        <Stat label="ACHIEVEMENTS" value={`${p.achievements.size} / ${p.totalAchievements}`} />
        <Stat label="CLASS" value={p.classChosen || "—"} />
      </div>
      <div className="mt-4">
        <div className="h-px bg-[var(--hairline)] relative">
          <div
            className="absolute inset-y-0 left-0 bg-ember"
            style={{ width: `${p.level.pctToNext}%`, transition: "width 380ms cubic-bezier(0.22,0.61,0.36,1)" }}
          />
        </div>
        <p className="font-serif italic text-[12px] text-parch-faint mt-2">{p.level.current.flavor}</p>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-widest text-parch-faint">{label}</p>
      <p className="font-serif text-lg text-parch leading-tight">{value}</p>
    </div>
  );
}

function Quicklinks() {
  const links = [
    { href: "/path", label: "WALK THE PATH", sub: "Browse all talks by Land" },
    { href: "/character", label: "CHARACTER", sub: "Your runes and tally" },
    { href: "/quests", label: "QUEST LOG", sub: "Active · Done · Foreshadowed" },
    { href: "/achievements", label: "ACHIEVEMENTS", sub: "What lies hidden" },
  ];
  return (
    <section className="grid grid-cols-2 gap-2 mt-6">
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          className="px-4 py-3 border border-[var(--hairline)] hover:border-ember hover:bg-void-50/40 transition-colors"
        >
          <div className="font-mono text-[11px] tracking-widest text-ember">{l.label}</div>
          <div className="font-serif text-[13px] text-parch-dim mt-1 italic">{l.sub}</div>
        </a>
      ))}
    </section>
  );
}

function ClassPick({ onPick }: { onPick: (c: string) => void }) {
  return (
    <section className="mt-12 pt-8 border-t hairline">
      <p className="font-mono text-[10px] tracking-widest text-ember text-center mb-3">
        ─── CHOOSE YOUR CLASS, OR DEFER ───
      </p>
      <p className="text-center font-serif italic text-parch-dim text-sm mb-6">
        Each class is a soul, not a cage. You can change it later.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {CLASSES.map((c) => (
          <button
            key={c.name}
            onClick={() => onPick(c.name)}
            className="text-left p-4 border border-[var(--hairline)] hover:border-ember hover:bg-void-50/40 transition-colors"
          >
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-2xl text-ember">{c.glyph}</span>
              <span className="font-serif text-base text-parch">{c.name}</span>
            </div>
            <p className="text-[12px] text-parch-dim italic font-serif mt-1 leading-relaxed">{c.soul}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function UnlockToast({ ids, ack }: { ids: string[]; ack: () => void }) {
  // Show only the most recent
  const id = ids[ids.length - 1];
  const ach = ACHIEVEMENTS.find((a) => a.id === id);
  if (!ach) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      onClick={ack}
      className="fixed bottom-6 right-6 z-30 max-w-sm border border-ember bg-void-50/95 backdrop-blur px-4 py-3 cursor-pointer fade-up"
    >
      <p className="font-mono text-[10px] tracking-widest text-ember mb-1">
        ✦ ACHIEVEMENT
      </p>
      <p className="font-serif text-lg text-parch leading-tight">
        <span className="text-ember mr-2">{ach.glyph}</span>
        {ach.name}
      </p>
      <p className="text-[12px] italic text-parch-dim mt-1 font-serif">{ach.flavor}</p>
      {ids.length > 1 && (
        <p className="font-mono text-[9px] text-parch-faint mt-2">
          + {ids.length - 1} MORE — TAP TO DISMISS
        </p>
      )}
    </div>
  );
}
