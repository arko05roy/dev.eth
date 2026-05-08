"use client";
import { useMemo, useState } from "react";
import type { ProtocolRoadmap, Hall } from "@/lib/protocols";
import { useProgress } from "@/lib/progress";
import TalkRow from "./TalkRow";
import BrandLogo from "./BrandLogo";
import CrossroadsStrip from "./CrossroadsStrip";

interface Props {
  roadmap: ProtocolRoadmap;
}

export default function ProtocolRoadmapView({ roadmap }: Props) {
  const { watched, toggle } = useProgress();

  const watchedCount = useMemo(() => {
    let n = 0;
    for (const s of roadmap.stages) for (const t of s.talks) if (watched.has(t.id)) n++;
    return n;
  }, [roadmap, watched]);

  const pct = Math.round((watchedCount / roadmap.total) * 100);

  return (
    <main className="max-w-4xl mx-auto px-6 lg:px-12 pb-24">
      <nav className="pt-8 pb-4">
        <a
          href="/protocols"
          className="font-mono text-[10px] tracking-widest text-parch-faint hover:text-ember transition-colors"
        >
          ← ALL GUILDS
        </a>
      </nav>

      <header className="pt-8 pb-12 border-b hairline">
        <div className="flex items-center gap-4 mb-6">
          <BrandLogo slug={roadmap.slug} size={32} />
          <p className="font-mono text-[10px] tracking-widest text-ember">
            {roadmap.brand.kind.toUpperCase()} · GUILD ROADMAP
          </p>
        </div>
        <h1 className="font-serif text-5xl md:text-6xl leading-[1.05] text-parch mb-6">
          {roadmap.brand.name}
        </h1>
        <blockquote className="font-serif italic text-lg text-parch border-l border-ember pl-6 max-w-2xl leading-[1.55]">
          {roadmap.total} talks across the archives. Walk them in order — theory before application,
          oldest before newest. The shape of an apprenticeship.
        </blockquote>

        <div className="mt-10 grid sm:grid-cols-3 gap-6 max-w-2xl">
          <Stat label="TALKS" value={String(roadmap.total)} />
          <Stat label="WATCHED" value={`${watchedCount}/${roadmap.total}`} />
          <Stat label="PROGRESS" value={`${pct}%`} accent />
        </div>
        <div className="mt-6 h-px bg-[var(--hairline)] relative max-w-2xl">
          <div
            className="absolute inset-y-0 left-0 bg-ember"
            style={{ width: `${pct}%`, transition: "width 380ms cubic-bezier(0.22,0.61,0.36,1)" }}
          />
        </div>
      </header>

      {/* When Halls are present (LLM-clustered by topic), they replace the
          generic Foundations/Patterns/Application stages — the stages cover
          the same talks, just organized by tier-heuristic instead of topic.
          Showing both means every talk renders twice. */}
      {roadmap.halls && roadmap.halls.length > 0 ? (
        <section className="pt-16 pb-4">
          <p className="font-mono text-[10px] tracking-[0.3em] text-ember mb-2">
            ── THE HALLS · {roadmap.halls.length} ──
          </p>
          <p className="prose-read italic max-w-2xl mb-6">
            Sub-zones inside the guild. Each Hall is a coherent line of inquiry across the archive.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roadmap.halls.map((h) => (
              <HallCard key={h.name} hall={h} watched={watched} onToggle={toggle} />
            ))}
          </div>
        </section>
      ) : (
        // Fallback for guilds without LLM hall clustering — keep the original 3-stage layout.
        roadmap.stages.map((stage, i) => (
          <section key={stage.id} className="pt-16 pb-4">
            <div className="flex items-baseline gap-4 mb-3">
              <span className="font-serif text-4xl text-ember" aria-hidden>
                {romanNumeral(i + 1)}
              </span>
              <h2 className="font-serif text-3xl text-parch">{stage.title}</h2>
              <span className="font-mono text-[10px] tracking-widest text-parch-faint">
                {stage.talks.length} TALK{stage.talks.length === 1 ? "" : "S"}
              </span>
            </div>
            <p className="prose-read max-w-2xl mb-6">{stage.blurb}</p>

            <div className="border-t border-[var(--hairline)] divide-y divide-[var(--hairline)]">
              {stage.talks.map((t) => (
                <TalkRow key={t.id} talk={t} watched={watched.has(t.id)} onToggle={toggle} />
              ))}
            </div>
          </section>
        ))
      )}

      {/* Crossroads — connections to other guilds */}
      {roadmap.crossroads && roadmap.crossroads.length > 0 && (
        <CrossroadsStrip crossroads={roadmap.crossroads} selfName={roadmap.brand.name} />
      )}

      <footer className="py-20 mt-8 border-t hairline text-center">
        <p className="font-serif italic text-lg text-parch-dim mb-4">
          The guild's tongue is now yours. Go build something with it.
        </p>
        <p className="font-mono text-[10px] tracking-widest text-parch-faint">
          ── {roadmap.brand.name.toUpperCase()} ──
        </p>
      </footer>
    </main>
  );
}

function HallCard({
  hall,
  watched,
  onToggle,
}: {
  hall: Hall;
  watched: Set<string>;
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const watchedCount = useMemo(
    () => hall.talks.reduce((n, t) => n + (watched.has(t.id) ? 1 : 0), 0),
    [hall, watched]
  );
  const pct = hall.talks.length === 0 ? 0 : Math.round((watchedCount / hall.talks.length) * 100);

  return (
    <article className="border border-[var(--hairline)] hover:border-parch-faint transition-colors">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left px-4 py-3 group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-void"
      >
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className={`font-mono text-[12px] transition-transform ${open ? "rotate-90" : ""}`} aria-hidden>
            {open ? "▾" : "▸"}
          </span>
          <h3 className="font-serif text-lg text-parch group-hover:text-ember transition-colors">
            {hall.name}
          </h3>
          <span className="font-mono text-[10px] tracking-widest text-parch-faint">
            {hall.talks.length}
          </span>
          <span className="ml-auto font-mono text-[10px] tracking-widest text-ember">
            {watchedCount}/{hall.talks.length} · {pct}%
          </span>
        </div>
        <p className="prose-read italic text-[12px] mt-1">{hall.blurb}</p>
      </button>
      <div className="px-4">
        <div className="h-px bg-[var(--hairline)] relative">
          <div
            className="absolute inset-y-0 left-0 bg-ember"
            style={{ width: `${pct}%`, transition: "width 380ms cubic-bezier(0.22,0.61,0.36,1)" }}
          />
        </div>
      </div>
      {open && (
        <div className="border-t border-[var(--hairline)] divide-y divide-[var(--hairline)]">
          {hall.talks.map((t) => (
            <TalkRow key={t.id} talk={t} watched={watched.has(t.id)} onToggle={onToggle} />
          ))}
        </div>
      )}
    </article>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-widest text-parch-faint mb-1">{label}</p>
      <p className={`font-serif text-2xl ${accent ? "text-ember" : "text-parch"}`}>{value}</p>
    </div>
  );
}

function romanNumeral(n: number): string {
  return ["I", "II", "III", "IV", "V", "VI"][n - 1] || String(n);
}
