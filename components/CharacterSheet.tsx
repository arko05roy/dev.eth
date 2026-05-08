"use client";
import { useProgress } from "@/lib/progress";
import { TALKS } from "@/lib/talks";
import { ACTS, CLASSES } from "@/lib/acts";
import { LEVELS } from "@/lib/xp";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { useMemo } from "react";

export default function CharacterSheet() {
  const p = useProgress();

  const perAct = useMemo(() => {
    const m: Record<string, { total: number; w: number }> = {};
    for (const a of ACTS) m[a.id] = { total: 0, w: 0 };
    for (const t of TALKS) {
      m[t.act].total++;
      if (p.watched.has(t.id)) m[t.act].w++;
    }
    return m;
  }, [p.watched]);

  const sourceCount = useMemo(() => {
    let dev = 0, eg = 0;
    for (const id of p.watched) {
      const t = TALKS.find((x) => x.id === id);
      if (!t) continue;
      if (t.source === "ethglobal") eg++; else dev++;
    }
    return { dev, eg };
  }, [p.watched]);

  if (!p.hydrated) {
    return <main className="max-w-3xl mx-auto px-6 py-24 text-parch-faint">Loading…</main>;
  }

  return (
    <main className="max-w-3xl mx-auto px-6 lg:px-12 py-16">
      <a href="/" className="font-mono text-[10px] tracking-widest text-parch-faint hover:text-ember transition-colors">← THE GATE</a>

      <header className="mt-8 mb-12 pb-8 border-b hairline">
        <p className="font-mono text-[10px] tracking-widest text-ember mb-2">─── CHARACTER ───</p>
        <h1 className="font-serif text-5xl text-parch leading-tight">{p.name}</h1>
        <p className="mt-3 font-serif italic text-parch-dim">
          {p.classChosen ? `Walks as ${p.classChosen}` : "Class unbound"}
          {" · "}
          {p.level.current.name}
        </p>
      </header>

      {/* Level ladder */}
      <section className="mb-12">
        <p className="font-mono text-[10px] tracking-widest text-parch-faint mb-3">LEVEL</p>
        <div className="space-y-2">
          {LEVELS.map((lvl, i) => {
            const reached = p.xp >= lvl.threshold;
            const isCurrent = lvl.index === p.level.current.index;
            const isNext = p.level.next?.index === lvl.index;
            return (
              <div
                key={lvl.index}
                className={`flex items-baseline gap-3 px-3 py-2 border ${
                  isCurrent ? "border-ember bg-void-50" :
                  isNext ? "border-parch-faint" :
                  "border-[var(--hairline)] opacity-70"
                }`}
              >
                <span className="font-mono text-[10px] tracking-widest text-parch-faint w-6">
                  {String(i).padStart(2, "0")}
                </span>
                <span className={`font-serif text-base ${reached ? "text-parch" : "text-parch-faint"}`}>
                  {lvl.name}
                </span>
                <span className="ml-auto font-mono text-[11px] text-parch-faint">
                  {lvl.threshold.toLocaleString()} XP
                </span>
                {isCurrent && <span className="font-mono text-[10px] tracking-widest text-ember">YOU</span>}
              </div>
            );
          })}
        </div>
        <div className="mt-4 max-w-md">
          <p className="font-mono text-[10px] tracking-widest text-parch-faint mb-1">
            {p.xp.toLocaleString()} XP
            {p.level.next && ` · ${(p.level.next.threshold - p.xp).toLocaleString()} to ${p.level.next.name}`}
          </p>
          <div className="h-px bg-[var(--hairline)] relative">
            <div className="absolute inset-y-0 left-0 bg-ember" style={{ width: `${p.level.pctToNext}%` }} />
          </div>
          <p className="font-serif italic text-[12px] text-parch-faint mt-2">{p.level.current.flavor}</p>
        </div>
      </section>

      {/* Stats grid */}
      <section className="mb-12 grid sm:grid-cols-2 gap-x-10 gap-y-6">
        <Block title="QUESTS COMPLETE">
          <p className="font-serif text-3xl text-parch">{p.watched.size.toLocaleString()}<span className="text-parch-faint text-lg"> / {TALKS.length.toLocaleString()}</span></p>
          <p className="font-mono text-[11px] text-parch-faint mt-1">
            <span className="text-ember">{sourceCount.dev}</span> Devcon · <span className="text-ember">{sourceCount.eg}</span> ETHGlobal
          </p>
        </Block>
        <Block title="STREAK">
          <p className="font-serif text-3xl text-parch">{p.streak}<span className="text-parch-faint text-lg"> day{p.streak === 1 ? "" : "s"}</span></p>
          <p className="font-mono text-[11px] text-parch-faint mt-1">{p.streakDays.length} total days walked</p>
        </Block>
        <Block title="ACHIEVEMENTS">
          <p className="font-serif text-3xl text-parch">{p.achievements.size}<span className="text-parch-faint text-lg"> / {p.totalAchievements}</span></p>
          <a href="/achievements" className="font-mono text-[11px] text-ember hover:underline underline-offset-4">VIEW LEDGER →</a>
        </Block>
        <Block title="CLASS">
          {p.classChosen ? (
            <>
              <p className="font-serif text-2xl text-parch">{p.classChosen}</p>
              <p className="font-serif italic text-[12px] text-parch-faint mt-1">
                {CLASSES.find((c) => c.name === p.classChosen)?.soul}
              </p>
              <button
                onClick={() => p.setClass("")}
                className="mt-2 font-mono text-[10px] tracking-widest text-parch-faint hover:text-blood transition-colors"
              >[ UNBIND ]</button>
            </>
          ) : (
            <>
              <p className="font-serif text-2xl text-parch-faint">Unbound</p>
              <a href="/" className="font-mono text-[10px] tracking-widest text-ember hover:underline underline-offset-4 mt-1 inline-block">[ CHOOSE ON HOME ]</a>
            </>
          )}
        </Block>
      </section>

      {/* Per-Act progress */}
      <section className="mb-12">
        <p className="font-mono text-[10px] tracking-widest text-parch-faint mb-4">LANDS WALKED</p>
        <div className="space-y-3">
          {ACTS.map((act) => {
            const s = perAct[act.id];
            const pct = s.total === 0 ? 0 : Math.round((s.w / s.total) * 100);
            return (
              <a
                key={act.id}
                href={`/path#act-${act.id}`}
                className="block px-4 py-3 border border-[var(--hairline)] hover:border-ember transition-colors"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-2xl text-ember">{act.glyph}</span>
                  <span className="font-mono text-[10px] tracking-widest text-parch-faint">ACT {act.id}</span>
                  <span className="font-serif text-base text-parch flex-1">{act.title}</span>
                  <span className="font-mono text-[11px] text-parch-faint">{s.w}/{s.total} · {pct}%</span>
                </div>
                <div className="mt-2 h-px bg-[var(--hairline)] relative">
                  <div className="absolute inset-y-0 left-0 bg-ember" style={{ width: `${pct}%` }} />
                </div>
              </a>
            );
          })}
        </div>
      </section>

      <DangerZone clearAll={p.clearAll} />
    </main>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-widest text-parch-faint mb-2">{title}</p>
      {children}
    </div>
  );
}

function DangerZone({ clearAll }: { clearAll: () => void }) {
  return (
    <section className="mt-16 pt-8 border-t hairline">
      <p className="font-mono text-[10px] tracking-widest text-parch-faint mb-3">⚠ DANGER</p>
      <button
        onClick={() => {
          if (window.confirm("Reset all progress? This cannot be undone.")) clearAll();
        }}
        className="font-mono text-[11px] tracking-widest text-blood hover:text-parch transition-colors"
      >
        [ RESET PATH ]
      </button>
      <p className="font-serif italic text-[12px] text-parch-faint mt-2">
        All quests, runes, and achievements forgotten. The gate reopens.
      </p>
    </section>
  );
}
