"use client";
import { useMemo } from "react";
import { TALKS, TOTAL_TALKS } from "@/lib/talks";
import { EFFECTIVE_THREADS } from "@/lib/auto-threads";
import { ACTS } from "@/lib/acts";
import { useProgress } from "@/lib/progress";

export default function PathHub() {
  const { watched } = useProgress();

  // Per-Act stats: total talks, watched, top thread names (preview).
  const perAct = useMemo(() => {
    return ACTS.map((act) => {
      const list = TALKS.filter((t) => t.act === act.id);
      const w = list.filter((t) => watched.has(t.id)).length;
      const acth = EFFECTIVE_THREADS.filter((t) => t.act === act.id);
      const topThreads = [...acth].sort((a, b) => b.count - a.count).slice(0, 4).map((t) => t.name);
      return { act, total: list.length, watched: w, threads: acth.length, topThreads };
    });
  }, [watched]);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 pb-24">
      <header className="pt-12 sm:pt-24 pb-8 sm:pb-12">
        <p className="font-mono text-[10px] tracking-widest text-ember mb-4 sm:mb-6">
          ─── DEVCON · 2014–2024 · ETHGLOBAL · 2017–2026 · {TOTAL_TALKS} TALKS ───
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-parch mb-6 sm:mb-8">
          The Tarnished<br/>Path
        </h1>
        <blockquote className="font-serif italic text-base sm:text-lg text-parch border-l border-ember pl-4 sm:pl-6 max-w-2xl leading-[1.55]">
          Six Lands. Twelve years of recordings, sorted into threads, paradigms, and dungeons of their own.
          Choose where to begin. Or wander. The path is yours.
        </blockquote>
      </header>

      {/* Region cards — the world map */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--hairline)] border border-[var(--hairline)]">
        {perAct.map(({ act, total, watched: w, threads, topThreads }) => {
          const pct = total === 0 ? 0 : Math.round((w / total) * 100);
          return (
            <a
              key={act.id}
              href={`/path/${act.id.toLowerCase()}`}
              className="group bg-void hover:bg-void-50 px-5 sm:px-7 py-6 sm:py-8 flex flex-col gap-4 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-void"
            >
              <div className="flex items-baseline gap-4">
                <span className="font-serif text-5xl sm:text-6xl text-ember leading-none" aria-hidden>
                  {act.glyph}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[10px] tracking-widest text-parch-faint">
                    ACT {act.id} · {act.subtitle.toUpperCase()}
                  </p>
                  <h2 className="font-serif text-2xl sm:text-3xl text-parch group-hover:text-ember transition-colors leading-tight mt-1">
                    {act.title}
                  </h2>
                </div>
              </div>

              <p className="prose-read-bright text-[14px] line-clamp-3 max-w-xl">
                {act.land}
              </p>

              <div className="flex items-baseline gap-3 flex-wrap font-mono text-[10px] tracking-widest text-parch-faint">
                <span>{total} TALKS</span>
                <span className="text-parch-ghost">·</span>
                <span>{threads} THREADS</span>
                <span className="text-parch-ghost">·</span>
                <span className="text-ember">{w}/{total} · {pct}%</span>
              </div>

              {topThreads.length > 0 && (
                <p className="prose-read italic text-[12px] text-parch-faint">
                  <span className="text-parch-ghost">Notable threads · </span>
                  {topThreads.join(" · ")}
                </p>
              )}

              <div className="h-px bg-[var(--hairline)] relative">
                <div
                  className="absolute inset-y-0 left-0 bg-ember"
                  style={{ width: `${pct}%`, transition: "width 380ms cubic-bezier(0.22,0.61,0.36,1)" }}
                />
              </div>

              <p className="font-mono text-[10px] tracking-widest text-ember opacity-0 group-hover:opacity-100 transition-opacity">
                ENTER {act.title.toUpperCase()} →
              </p>
            </a>
          );
        })}
      </section>

      <footer className="py-20 mt-12 border-t hairline text-center">
        <p className="font-serif italic text-lg text-parch-dim mb-4">
          Six Lands wait. Walk one or wander all.
        </p>
        <p className="font-mono text-[10px] tracking-widest text-parch-faint">── GO WELL, TARNISHED ──</p>
      </footer>
    </main>
  );
}
