"use client";
import { useProgress } from "@/lib/progress";
import { TALKS } from "@/lib/talks";
import { ACTS } from "@/lib/acts";
import { TIER_GLYPH } from "@/lib/types";
import type { Talk } from "@/lib/types";
import { useMemo } from "react";

export default function QuestLog() {
  const p = useProgress();

  const { active, foreshadowed, done } = useMemo(() => {
    if (!p.hydrated) return { active: [], foreshadowed: [], done: [] };

    // Find current Act = first Act with progress > 0 and < 100
    let currentAct: string | undefined;
    for (const a of ACTS) {
      const list = TALKS.filter((t) => t.act === a.id);
      const w = list.filter((t) => p.watched.has(t.id)).length;
      if (w > 0 && w < list.length) { currentAct = a.id; break; }
    }
    if (!currentAct) {
      currentAct = ACTS.find((a) => TALKS.some((t) => t.act === a.id && !p.watched.has(t.id)))?.id;
    }

    // Active: top 5 unwatched in current Act ordered by tier
    const tierOrder: Record<string, number> = { boss: 0, main: 1, side: 2, chronicle: 3 };
    const active: Talk[] = currentAct
      ? TALKS
          .filter((t) => t.act === currentAct && !p.watched.has(t.id))
          .sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier])
          .slice(0, 5)
      : [];

    // Foreshadowed: next 6 unwatched bosses across the Path
    const foreshadowed = TALKS
      .filter((t) => t.tier === "boss" && !p.watched.has(t.id))
      .slice(0, 6);

    // Done: most recently watched (we don't track timestamps; just by watched set order in TALKS reverse)
    const watchedTalks = TALKS.filter((t) => p.watched.has(t.id));
    const done = watchedTalks.slice(-15).reverse();

    return { active, foreshadowed, done };
  }, [p.watched, p.hydrated]);

  if (!p.hydrated) {
    return <main className="max-w-4xl mx-auto px-6 py-24 text-parch-faint">Loading…</main>;
  }

  return (
    <main className="max-w-4xl mx-auto px-6 lg:px-12 py-16">
      <a href="/" className="font-mono text-[10px] tracking-widest text-parch-faint hover:text-ember transition-colors">← THE GATE</a>

      <header className="mt-8 mb-12 pb-8 border-b hairline">
        <p className="font-mono text-[10px] tracking-widest text-ember mb-2">─── QUEST LOG ───</p>
        <h1 className="font-serif text-5xl text-parch leading-tight">{p.name}</h1>
        <p className="mt-3 font-serif italic text-parch-dim">
          {p.watched.size} quest{p.watched.size === 1 ? "" : "s"} complete · {p.xp.toLocaleString()} XP
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        <Column title="ACTIVE" subtitle="Take these next." talks={active} watched={p.watched} toggle={p.toggle} />
        <Column title="FORESHADOWED" subtitle="Bosses ahead." talks={foreshadowed} watched={p.watched} toggle={p.toggle} dimmer />
        <Column title="DONE" subtitle="Recent runes." talks={done} watched={p.watched} toggle={p.toggle} done />
      </div>
    </main>
  );
}

function Column({
  title, subtitle, talks, watched, toggle, dimmer = false, done = false,
}: {
  title: string; subtitle: string; talks: Talk[]; watched: Set<string>; toggle: (id: string) => void;
  dimmer?: boolean; done?: boolean;
}) {
  return (
    <section>
      <h2 className="font-mono text-[11px] tracking-widest text-ember mb-1">{title}</h2>
      <p className="font-serif italic text-[12px] text-parch-faint mb-5">{subtitle}</p>
      {talks.length === 0 ? (
        <p className="text-[13px] italic text-parch-faint font-serif">— empty —</p>
      ) : (
        <ul className="space-y-3">
          {talks.map((t) => (
            <li key={t.id} className={`px-3 py-2 border ${dimmer ? "border-[var(--hairline)] opacity-80" : "border-[var(--hairline)]"} hover:border-parch-faint transition-colors`}>
              <div className="flex items-baseline gap-2 mb-1">
                <button
                  onClick={() => toggle(t.id)}
                  className={`font-mono text-base ${watched.has(t.id) ? "text-ember" : "text-parch-ghost hover:text-parch-faint"}`}
                  aria-pressed={watched.has(t.id)}
                  aria-label={`Toggle ${t.title}`}
                >
                  {watched.has(t.id) ? "●" : "○"}
                </button>
                <span className="font-mono text-[10px] tracking-widest text-parch-faint">
                  {TIER_GLYPH[t.tier]} · {t.event}
                </span>
              </div>
              <a
                href={`/path#${t.id}`}
                className="font-serif text-sm text-parch hover:text-ember transition-colors leading-snug block"
              >
                {t.title}
              </a>
              {done && (
                <p className="font-mono text-[10px] text-parch-ghost mt-1">+{t.tier === "boss" ? 100 : t.tier === "main" ? 40 : t.tier === "side" ? 15 : 5} XP</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
