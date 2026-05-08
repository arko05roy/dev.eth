"use client";
import { useState, useEffect } from "react";
import { useFilters, type SourceFilter } from "@/lib/filter";
import { TIER_GLYPH, TIER_LABEL } from "@/lib/types";

const EDITIONS = [0, 1, 2, 3, 4, 5, 6, 7];
const TIERS: ("boss" | "main" | "side" | "chronicle")[] = ["boss", "main", "side", "chronicle"];
const SOURCES: SourceFilter[] = ["all", "devcon", "ethglobal", "pragma"];

export default function FilterBar() {
  const f = useFilters();
  const [mobileOpen, setMobileOpen] = useState(false);

  const anyActive =
    f.query.length > 0 ||
    f.editions.size > 0 ||
    f.tiers.size > 0 ||
    f.watchedFilter !== "all" ||
    f.sourceFilter !== "all";

  const activeCount =
    (f.query ? 1 : 0) + f.editions.size + f.tiers.size +
    (f.watchedFilter !== "all" ? 1 : 0) +
    (f.sourceFilter !== "all" ? 1 : 0);

  // Lock body scroll when sheet open
  useEffect(() => {
    if (!mobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, [mobileOpen]);

  // Close on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <>
      {/* MOBILE — compact bar with single search + filters button */}
      <div className="lg:hidden mb-6">
        <div className="flex items-center gap-3 border-b border-[var(--hairline)] py-3">
          <span className="font-mono text-[10px] tracking-[0.25em] text-parch-faint shrink-0">⌕</span>
          <input
            value={f.query}
            onChange={(e) => f.setQuery(e.target.value)}
            placeholder="search talks…"
            aria-label="Search talks"
            className="flex-1 bg-transparent outline-none px-0 py-1 text-[14px] text-parch placeholder:text-parch-ghost font-sans"
          />
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="font-mono text-[10px] tracking-[0.22em] text-parch-faint hover:text-ember transition-colors px-2 py-1 border border-[var(--hairline)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-void"
          >
            FILTERS{activeCount > 0 && <span className="text-ember ml-1">·{activeCount}</span>}
          </button>
        </div>

        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-void/70 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto bg-void border-t border-[var(--hairline)] fade-up"
            >
              <div className="sticky top-0 bg-void border-b border-[var(--hairline)] px-5 py-3 flex items-baseline justify-between">
                <p className="font-mono text-[11px] tracking-[0.3em] text-ember">─── FILTERS ───</p>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="font-mono text-[10px] tracking-[0.22em] text-parch-faint hover:text-ember transition-colors"
                >
                  CLOSE
                </button>
              </div>

              <div className="px-5 py-5 space-y-7 pb-10">
                <FilterSection label="SOURCE">
                  {SOURCES.map((s) => (
                    <Chip key={s} active={f.sourceFilter === s} onClick={() => f.setSourceFilter(s)} label={s} exclusive />
                  ))}
                </FilterSection>
                <FilterSection label="DEVCON">
                  {EDITIONS.map((e) => (
                    <Chip key={e} active={f.editions.has(e)} onClick={() => f.toggleEdition(e)} label={`${e}`} />
                  ))}
                </FilterSection>
                <FilterSection label="TIER">
                  {TIERS.map((t) => (
                    <Chip key={t} active={f.tiers.has(t)} onClick={() => f.toggleTier(t)} label={`${TIER_GLYPH[t]} ${TIER_LABEL[t]}`} />
                  ))}
                </FilterSection>
                <FilterSection label="STATE">
                  {(["all", "watched", "unwatched"] as const).map((w) => (
                    <Chip key={w} active={f.watchedFilter === w} onClick={() => f.setWatchedFilter(w)} label={w} exclusive />
                  ))}
                </FilterSection>

                {anyActive && (
                  <button
                    type="button"
                    onClick={f.clearFilters}
                    className="w-full py-3 border border-[var(--hairline)] hover:border-blood hover:text-blood font-mono text-[10px] tracking-[0.22em] text-parch-faint transition-colors"
                  >
                    CLEAR ALL
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-3 border border-ember bg-ember/10 hover:bg-ember hover:text-void font-mono text-[11px] tracking-[0.3em] text-ember transition-colors"
                >
                  APPLY
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* DESKTOP — inline (not sticky), dense */}
      <div className="hidden lg:block mb-8 pb-5 border-b border-[var(--hairline)]">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-[10px] tracking-[0.25em] text-parch-faint shrink-0">⌕ SEARCH</span>
          <input
            value={f.query}
            onChange={(e) => f.setQuery(e.target.value)}
            placeholder="title · speaker · abstract · event…"
            aria-label="Search talks"
            className="flex-1 bg-transparent border-b border-[var(--hairline)] focus:border-ember outline-none px-0 py-1 text-[14px] text-parch placeholder:text-parch-ghost transition-colors font-sans"
          />
          {anyActive && (
            <button
              type="button"
              onClick={f.clearFilters}
              className="font-mono text-[10px] tracking-[0.22em] text-parch-faint hover:text-blood transition-colors"
            >
              [ CLEAR ]
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-mono">
          <FilterGroup label="SOURCE">
            {SOURCES.map((s) => (
              <Chip key={s} active={f.sourceFilter === s} onClick={() => f.setSourceFilter(s)} label={s} exclusive />
            ))}
          </FilterGroup>
          <FilterGroup label="DEVCON">
            {EDITIONS.map((e) => (
              <Chip key={e} active={f.editions.has(e)} onClick={() => f.toggleEdition(e)} label={`${e}`} />
            ))}
          </FilterGroup>
          <FilterGroup label="TIER">
            {TIERS.map((t) => (
              <Chip key={t} active={f.tiers.has(t)} onClick={() => f.toggleTier(t)} label={`${TIER_GLYPH[t]} ${TIER_LABEL[t]}`} />
            ))}
          </FilterGroup>
          <FilterGroup label="STATE">
            {(["all", "watched", "unwatched"] as const).map((w) => (
              <Chip key={w} active={f.watchedFilter === w} onClick={() => f.setWatchedFilter(w)} label={w} exclusive />
            ))}
          </FilterGroup>
        </div>
      </div>
    </>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-parch-faint tracking-[0.22em] shrink-0">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.28em] text-parch mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  label, active, onClick,
}: {
  label: string; active: boolean; onClick: () => void; exclusive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-2.5 py-1 border tracking-[0.18em] uppercase transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-void ${
        active
          ? "border-ember text-ember"
          : "border-[var(--hairline)] text-parch-faint hover:text-parch hover:border-parch-ghost"
      }`}
    >
      {label}
    </button>
  );
}
