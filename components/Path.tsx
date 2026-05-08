"use client";
import { useMemo, useState, useCallback } from "react";
import { TALKS, TOTAL_TALKS } from "@/lib/talks";
import { ACTS } from "@/lib/acts";
import { useProgress } from "@/lib/progress";
import { FilterCtx, type WatchedFilter, type SourceFilter, matchTalk } from "@/lib/filter";
import Sidebar from "./Sidebar";
import ActSection from "./ActSection";
import ClassNode from "./ClassNode";
import FilterBar from "./FilterBar";

export default function Path() {
  const { watched, toggle, clearAll } = useProgress();

  const [query, setQuery] = useState("");
  const [editions, setEditions] = useState<Set<number>>(new Set());
  const [tiers, setTiers] = useState<Set<string>>(new Set());
  const [watchedFilter, setWatchedFilter] = useState<WatchedFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");

  const toggleEdition = useCallback((e: number) => {
    setEditions((prev) => {
      const n = new Set(prev);
      if (n.has(e)) n.delete(e); else n.add(e);
      return n;
    });
  }, []);
  const toggleTier = useCallback((t: string) => {
    setTiers((prev) => {
      const n = new Set(prev);
      if (n.has(t)) n.delete(t); else n.add(t);
      return n;
    });
  }, []);
  const clearFilters = useCallback(() => {
    setQuery("");
    setEditions(new Set());
    setTiers(new Set());
    setWatchedFilter("all");
    setSourceFilter("all");
  }, []);

  const filterCtx = useMemo(
    () => ({ query, editions, tiers, watchedFilter, sourceFilter, setQuery, toggleEdition, toggleTier, setWatchedFilter, setSourceFilter, clearFilters }),
    [query, editions, tiers, watchedFilter, sourceFilter, toggleEdition, toggleTier, clearFilters]
  );

  // Pre-filter all talks
  const filtered = useMemo(() => {
    return TALKS.filter((t) =>
      matchTalk(t, watched, { query, editions, tiers, watchedFilter, sourceFilter })
    );
  }, [watched, query, editions, tiers, watchedFilter, sourceFilter]);

  const byAct = useMemo(() => {
    const m: Record<string, typeof TALKS> = { I: [], II: [], III: [], IV: [], V: [], VI: [] };
    for (const t of filtered) m[t.act].push(t);
    return m;
  }, [filtered]);

  const totalWatched = watched.size;
  const isFiltering =
    query.length > 0 || editions.size > 0 || tiers.size > 0 || watchedFilter !== "all" || sourceFilter !== "all";

  return (
    <FilterCtx.Provider value={filterCtx}>
      <div className="flex min-h-screen">
        <Sidebar
          acts={ACTS}
          talks={TALKS}
          watched={watched}
          totalWatched={totalWatched}
          totalTalks={TOTAL_TALKS}
          onClearAll={clearAll}
        />

        <main className="flex-1 max-w-4xl mx-auto px-6 lg:px-12 pb-24">
          {/* Cold open */}
          <header className="pt-24 pb-12">
            <p className="font-mono text-[10px] tracking-widest text-ember mb-6">
              ─── DEVCON · 2014–2024 · {TOTAL_TALKS} TALKS ───
            </p>
            <h1 className="font-serif text-5xl md:text-6xl leading-[1.05] text-parch mb-8">
              The Tarnished<br/>Path
            </h1>
            <blockquote className="font-serif italic text-lg text-parch border-l border-ember pl-6 max-w-2xl leading-[1.55]">
              Every recorded sermon, every battle, every confession the protocol has spoken aloud
              across twelve years. Walk it in order, or wander. Some doors open only after others close.
            </blockquote>

            <div className="mt-12 grid sm:grid-cols-3 gap-6 max-w-2xl">
              <Legend glyph="Φ" label="Boss" sub="Defines the Land" />
              <Legend glyph="Μ" label="Main Quest" sub="Critical" />
              <Legend glyph="Σ" label="Side Quest" sub="Supporting" />
            </div>
            <p className="prose-read mt-8 max-w-2xl">
              Click <span className="text-ember">○</span> to mark a talk watched · <span className="text-ember">[ UNFOLD ]</span> to read its abstract and prologue · <span className="text-ember">⌜TR⌝</span> means a Whisper transcript exists. Progress saves to your browser.
            </p>
          </header>

          <FilterBar />

          {isFiltering && (
            <div className="mb-6 font-mono text-[11px] tracking-widest text-parch-faint">
              {filtered.length} TALK{filtered.length === 1 ? "" : "S"} MATCH · ACROSS {Object.values(byAct).filter((a) => a.length > 0).length} ACT{Object.values(byAct).filter((a) => a.length > 0).length === 1 ? "" : "S"}
            </div>
          )}

          {/* Acts I–III */}
          {ACTS.slice(0, 3).map((act) => (
            byAct[act.id].length === 0 && isFiltering ? null : (
              <ActSection
                key={act.id}
                act={act}
                talks={byAct[act.id]}
                watched={watched}
                onToggle={toggle}
                isFiltering={isFiltering}
              />
            )
          ))}

          {/* Class node — only shown when not filtering */}
          {!isFiltering && <ClassNode />}

          {/* Acts IV–VI */}
          {ACTS.slice(3).map((act) => (
            byAct[act.id].length === 0 && isFiltering ? null : (
              <ActSection
                key={act.id}
                act={act}
                talks={byAct[act.id]}
                watched={watched}
                onToggle={toggle}
                isFiltering={isFiltering}
              />
            )
          ))}

          {/* Closing */}
          <footer className="py-20 border-t hairline text-center">
            <p className="font-serif italic text-lg text-parch-dim mb-4">
              This is the end of the recorded path. Go build. Or come back to a Land you skipped.
            </p>
            <p className="font-mono text-[10px] tracking-widest text-parch-faint">
              ── GO WELL, TARNISHED ──
            </p>
            <p className="mt-8 font-mono text-[10px] text-parch-ghost">
              Source: efdevcon/monorepo · Data: archive.devcon.org
            </p>
          </footer>
        </main>
      </div>
    </FilterCtx.Provider>
  );
}

function Legend({ glyph, label, sub }: { glyph: string; label: string; sub: string }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="font-serif text-2xl text-ember" aria-hidden>{glyph}</span>
        <span className="font-mono text-[11px] tracking-widest text-parch">{label.toUpperCase()}</span>
      </div>
      <p className="font-mono text-[11px] text-parch-faint">{sub}</p>
    </div>
  );
}
