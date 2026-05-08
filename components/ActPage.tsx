"use client";
import { useMemo, useState, useCallback } from "react";
import type { ActMeta } from "@/lib/types";
import { TALKS } from "@/lib/talks";
import { ACTS } from "@/lib/acts";
import { useProgress } from "@/lib/progress";
import { FilterCtx, type WatchedFilter, type SourceFilter, matchTalk } from "@/lib/filter";
import ActSection from "./ActSection";
import FilterBar from "./FilterBar";

interface Props {
  act: ActMeta;
}

export default function ActPage({ act }: Props) {
  const { watched, toggle } = useProgress();

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

  // Filter to this Act's talks
  const actTalks = useMemo(() => {
    return TALKS.filter((t) =>
      t.act === act.id && matchTalk(t, watched, { query, editions, tiers, watchedFilter, sourceFilter })
    );
  }, [act.id, watched, query, editions, tiers, watchedFilter, sourceFilter]);

  const isFiltering =
    query.length > 0 || editions.size > 0 || tiers.size > 0 || watchedFilter !== "all" || sourceFilter !== "all";

  // Sibling Acts for prev/next nav
  const idx = ACTS.findIndex((a) => a.id === act.id);
  const prev = idx > 0 ? ACTS[idx - 1] : null;
  const next = idx < ACTS.length - 1 ? ACTS[idx + 1] : null;

  return (
    <FilterCtx.Provider value={filterCtx}>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 pb-24">
        {/* Breadcrumb back to hub */}
        <nav className="pt-8 pb-4 flex items-baseline gap-3">
          <a
            href="/path"
            className="font-mono text-[10px] tracking-widest text-parch-faint hover:text-ember transition-colors"
          >
            ← THE TARNISHED PATH
          </a>
          <span className="font-mono text-[10px] tracking-widest text-parch-ghost">/</span>
          <span className="font-mono text-[10px] tracking-widest text-ember">
            ACT {act.id}
          </span>
        </nav>

        <FilterBar />

        {isFiltering && (
          <div className="mb-6 font-mono text-[11px] tracking-widest text-parch-faint">
            {actTalks.length} TALK{actTalks.length === 1 ? "" : "S"} MATCH IN THIS LAND
          </div>
        )}

        <ActSection
          act={act}
          talks={actTalks}
          watched={watched}
          onToggle={toggle}
          isFiltering={isFiltering}
        />

        {/* Prev/Next region nav */}
        <nav className="pt-12 mt-12 border-t hairline grid grid-cols-2 gap-4 sm:gap-8">
          {prev ? (
            <a
              href={`/path/${prev.id.toLowerCase()}`}
              className="group block px-4 py-5 border border-[var(--hairline)] hover:border-ember transition-colors"
            >
              <p className="font-mono text-[10px] tracking-widest text-parch-faint">← PREVIOUS LAND</p>
              <p className="font-serif text-xl text-parch group-hover:text-ember transition-colors mt-1">
                <span className="text-ember mr-2" aria-hidden>{prev.glyph}</span>
                {prev.title}
              </p>
            </a>
          ) : <span />}
          {next ? (
            <a
              href={`/path/${next.id.toLowerCase()}`}
              className="group block px-4 py-5 border border-[var(--hairline)] hover:border-ember transition-colors text-right"
            >
              <p className="font-mono text-[10px] tracking-widest text-parch-faint">NEXT LAND →</p>
              <p className="font-serif text-xl text-parch group-hover:text-ember transition-colors mt-1">
                {next.title}
                <span className="text-ember ml-2" aria-hidden>{next.glyph}</span>
              </p>
            </a>
          ) : <span />}
        </nav>
      </main>
    </FilterCtx.Provider>
  );
}
