"use client";
import { useMemo, useState } from "react";
import { PROTOCOLS, EFFECTIVE_BRAND_BY_TALK_ID } from "@/lib/protocols";
import { useProgress } from "@/lib/progress";
import { TALKS } from "@/lib/talks";
import BrandLogo from "./BrandLogo";

type WatchedFilter = "all" | "started" | "unstarted" | "done";
type SortMode = "talks" | "name" | "progress" | "recent";

const MOBILE_KIND_LIMIT = 8;

export default function ProtocolsGrid() {
  const { watched } = useProgress();
  const [query, setQuery] = useState("");
  const [activeKinds, setActiveKinds] = useState<Set<string>>(new Set());
  const [watchedFilter, setWatchedFilter] = useState<WatchedFilter>("all");
  const [sort, setSort] = useState<SortMode>("talks");
  const [showAllKinds, setShowAllKinds] = useState(false);

  // talks watched per protocol — keyed off EFFECTIVE brand so detected guilds count.
  const watchedByProtocol = useMemo(() => {
    const m: Record<string, number> = {};
    for (const t of TALKS) {
      const slug = EFFECTIVE_BRAND_BY_TALK_ID[t.id];
      if (!slug) continue;
      if (watched.has(t.id)) m[slug] = (m[slug] || 0) + 1;
    }
    return m;
  }, [watched]);

  // Build tag list — { kind, count } sorted by frequency.
  const kinds = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of PROTOCOLS) m[p.brand.kind] = (m[p.brand.kind] || 0) + 1;
    return Object.entries(m)
      .map(([kind, count]) => ({ kind, count }))
      .sort((a, b) => b.count - a.count || a.kind.localeCompare(b.kind));
  }, []);

  const toggleKind = (k: string) => {
    setActiveKinds((prev) => {
      const n = new Set(prev);
      if (n.has(k)) n.delete(k); else n.add(k);
      return n;
    });
  };

  const clearFilters = () => {
    setQuery("");
    setActiveKinds(new Set());
    setWatchedFilter("all");
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = PROTOCOLS.filter((p) => {
      if (activeKinds.size > 0 && !activeKinds.has(p.brand.kind)) return false;
      if (q) {
        const hit = p.brand.name.toLowerCase().includes(q)
          || p.slug.includes(q)
          || p.brand.kind.toLowerCase().includes(q);
        if (!hit) return false;
      }
      const w = watchedByProtocol[p.slug] || 0;
      if (watchedFilter === "started" && w === 0) return false;
      if (watchedFilter === "unstarted" && w > 0) return false;
      if (watchedFilter === "done" && w < p.count) return false;
      return true;
    });

    out = [...out].sort((a, b) => {
      if (sort === "name") return a.brand.name.localeCompare(b.brand.name);
      if (sort === "recent") return b.lastYear - a.lastYear || b.count - a.count;
      if (sort === "progress") {
        const pa = (watchedByProtocol[a.slug] || 0) / a.count;
        const pb = (watchedByProtocol[b.slug] || 0) / b.count;
        return pb - pa || b.count - a.count;
      }
      // talks (default)
      return b.count - a.count || a.brand.name.localeCompare(b.brand.name);
    });

    return out;
  }, [query, activeKinds, watchedFilter, sort, watchedByProtocol]);

  const isFiltering = query.length > 0 || activeKinds.size > 0 || watchedFilter !== "all";

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 pb-24">
      <header className="pt-12 sm:pt-24 pb-8 sm:pb-12">
        <p className="font-mono text-[10px] tracking-widest text-ember mb-4 sm:mb-6">
          ─── PROTOCOL ROADMAPS · {PROTOCOLS.length} GUILDS ───
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-parch mb-6 sm:mb-8">
          The Guilds<br/>of the Path
        </h1>
        <blockquote className="font-serif italic text-base sm:text-lg text-parch border-l border-ember pl-4 sm:pl-6 max-w-2xl leading-[1.55]">
          Each protocol speaks for itself across the archives. Pick one. Theory first — the keynotes
          and the lectures. Then the patterns. Then go build.
        </blockquote>
      </header>

      {/* Filter bar */}
      <section className="mb-8 border-y border-[var(--hairline)] py-5 sm:py-6 space-y-5">
        {/* Search */}
        <div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search · chainlink, ENS, L2, oracle…"
            className="w-full bg-transparent border-b border-[var(--hairline)] focus:border-ember px-0 py-2 font-mono text-sm text-parch placeholder:text-parch-ghost outline-none transition-colors"
          />
        </div>

        {/* Kind tags */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <p className="font-mono text-[10px] tracking-[0.25em] text-parch-faint">KIND</p>
            {kinds.length > MOBILE_KIND_LIMIT && (
              <button
                type="button"
                onClick={() => setShowAllKinds((v) => !v)}
                className="sm:hidden font-mono text-[10px] tracking-[0.22em] text-ember hover:text-parch transition-colors"
              >
                {showAllKinds ? "− LESS" : `+ ${kinds.length - MOBILE_KIND_LIMIT} MORE`}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {kinds.map(({ kind, count }, i) => {
              const active = activeKinds.has(kind);
              const hiddenOnMobile = !showAllKinds && i >= MOBILE_KIND_LIMIT && !active;
              return (
                <button
                  key={kind}
                  type="button"
                  onClick={() => toggleKind(kind)}
                  aria-pressed={active}
                  className={`${hiddenOnMobile ? "hidden sm:inline-flex" : "inline-flex"} items-center px-2.5 py-1 font-mono text-[10px] tracking-[0.18em] border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-void ${
                    active
                      ? "border-ember bg-ember text-void"
                      : "border-[var(--hairline)] text-parch-faint hover:text-parch hover:border-parch-faint"
                  }`}
                >
                  {kind.toUpperCase()}
                  <span className={`ml-1.5 ${active ? "text-void/70" : "text-parch-ghost"}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* State + Sort + Counter — stacks on mobile, row on sm+ */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-y-4 gap-x-8">
          <div>
            <p className="font-mono text-[10px] tracking-[0.25em] text-parch-faint mb-2">STATE</p>
            <div className="flex flex-wrap gap-1.5">
              {(["all", "started", "unstarted", "done"] as WatchedFilter[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setWatchedFilter(s)}
                  aria-pressed={watchedFilter === s}
                  className={`px-2.5 py-1 font-mono text-[10px] tracking-[0.18em] border transition-colors ${
                    watchedFilter === s
                      ? "border-ember bg-ember text-void"
                      : "border-[var(--hairline)] text-parch-faint hover:text-parch hover:border-parch-faint"
                  }`}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] tracking-[0.25em] text-parch-faint mb-2">SORT</p>
            <div className="flex flex-wrap gap-1.5">
              {(["talks", "recent", "progress", "name"] as SortMode[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSort(s)}
                  aria-pressed={sort === s}
                  className={`px-2.5 py-1 font-mono text-[10px] tracking-[0.18em] border transition-colors ${
                    sort === s
                      ? "border-ember bg-ember text-void"
                      : "border-[var(--hairline)] text-parch-faint hover:text-parch hover:border-parch-faint"
                  }`}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-baseline justify-between sm:justify-end gap-3 sm:ml-auto pt-2 sm:pt-0 border-t sm:border-0 border-[var(--hairline)]">
            <p className="font-mono text-[10px] tracking-[0.22em] text-parch-faint">
              {filtered.length} <span className="text-parch-ghost">/ {PROTOCOLS.length} GUILDS</span>
            </p>
            {isFiltering && (
              <button
                type="button"
                onClick={clearFilters}
                className="font-mono text-[10px] tracking-[0.22em] text-ember hover:text-parch transition-colors"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-[var(--hairline)] border border-[var(--hairline)]">
        {filtered.map((p) => {
          const w = watchedByProtocol[p.slug] || 0;
          const pct = Math.round((w / p.count) * 100);
          return (
            <a
              key={p.slug}
              href={`/protocols/${p.slug}`}
              className="group bg-void hover:bg-void-50 px-3.5 py-4 sm:px-5 sm:py-5 flex flex-col gap-2.5 sm:gap-3 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-void"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <BrandLogo slug={p.slug} size={20} />
                <span className="font-serif text-lg sm:text-xl text-parch group-hover:text-ember transition-colors truncate">
                  {p.brand.name}
                </span>
              </div>
              <p className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] text-parch-faint truncate">
                {p.brand.kind.toUpperCase()}
              </p>
              <div className="flex items-baseline gap-1.5 sm:gap-2 mt-auto flex-wrap">
                <span className="font-mono text-[11px] text-parch">{p.count}</span>
                <span className="font-mono text-[9px] sm:text-[10px] tracking-widest text-parch-ghost">TALKS</span>
                <span className="font-mono text-[10px] text-parch-ghost hidden sm:inline">·</span>
                <span className="font-mono text-[9px] sm:text-[10px] tracking-widest text-parch-faint">
                  {p.firstYear || "–"}–{p.lastYear || "–"}
                </span>
              </div>
              <div className="h-px bg-[var(--hairline)] relative">
                <div
                  className="absolute inset-y-0 left-0 bg-ember"
                  style={{ width: `${pct}%`, transition: "width 380ms cubic-bezier(0.22,0.61,0.36,1)" }}
                />
              </div>
              <p className="font-mono text-[9px] sm:text-[10px] tracking-widest text-parch-faint">
                {w}/{p.count} · {pct}%
              </p>
            </a>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="mt-12 font-serif italic text-parch-dim text-center">
          No guild answers to that name.
        </p>
      )}

      <footer className="py-20 mt-12 border-t hairline text-center">
        <p className="font-serif italic text-lg text-parch-dim mb-4">
          Pick a guild. Walk it once. Then come back to The Path.
        </p>
        <p className="font-mono text-[10px] tracking-widest text-parch-faint">── CHOOSE WELL ──</p>
      </footer>
    </main>
  );
}
