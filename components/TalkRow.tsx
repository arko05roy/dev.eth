"use client";
import { Talk, TIER_GLYPH } from "@/lib/types";
import { BOSS_PROSE, RELATED, TALK_BY_ID, THREAD_BY_ID } from "@/lib/talks";
import { XP_PER_TIER } from "@/lib/xp";
import { memo, useState } from "react";
import BrandLogo from "./BrandLogo";
import BossCard from "./BossCard";

interface Props {
  talk: Talk;
  watched: boolean;
  onToggle: (id: string) => void;
  /** When true, render bosses as a normal row (no full BossCard ceremony).
      Used in cross-cutting surfaces like the Wilds, where the boss is appearing
      as a side reference, not in its canonical thread. */
  compact?: boolean;
}

function speakerSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function Row({ talk, watched, onToggle, compact = false }: Props) {
  const isBoss = talk.tier === "boss";
  const boss = isBoss ? BOSS_PROSE[talk.id] : undefined;
  const [expanded, setExpanded] = useState(false);
  const hasMore = !!talk.desc || !!talk.prologue;
  const related = isBoss ? RELATED[talk.id] : undefined;

  // Bosses with hand-written prose render through the illuminated BossCard —
  // EXCEPT when the row is being shown in compact mode (cross-paradigm Wilds, etc.),
  // where the full ceremony would be misleading. In compact mode bosses are still
  // marked with the Φ glyph but render as a normal row.
  if (isBoss && boss && !compact) {
    return <BossCard talk={talk} watched={watched} onToggle={onToggle} />;
  }

  return (
    <article
      id={talk.id}
      data-tier={talk.tier}
      className={`scroll-anchor group relative flex gap-4 ${
        isBoss
          ? "border border-[var(--hairline)] bg-void-50 px-5 py-5 mb-3"
          : "px-3 py-2.5 hover:bg-void-50/60"
      } transition-colors duration-200`}
    >
      <button
        type="button"
        onClick={() => onToggle(talk.id)}
        aria-pressed={watched}
        aria-label={watched ? `Mark unwatched: ${talk.title}` : `Mark watched: ${talk.title}`}
        className={`shrink-0 mt-0.5 h-6 w-6 flex items-center justify-center font-mono text-base focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-void transition-colors ${
          watched ? "text-ember" : "text-parch-ghost hover:text-parch-faint"
        }`}
      >
        {watched ? "●" : "○"}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span
            aria-hidden
            className={`font-mono text-[10px] tracking-widest ${
              isBoss ? "text-ember" : "text-parch-ghost"
            }`}
            title={talk.tier}
          >
            {TIER_GLYPH[talk.tier]}
          </span>
          {talk.source === "devcon" ? (
            <span className="font-mono text-[10px] tracking-widest text-parch-faint">
              DEVCON {talk.ed}
            </span>
          ) : (
            <span className={`font-mono text-[10px] tracking-widest ${
              talk.eg_track === "PRAGMA" ? "text-ember" : "text-parch-faint"
            }`}>
              {talk.eg_track === "PRAGMA" ? "PRAGMA" : "ETHGLOBAL"}
              <span className="text-parch-ghost"> · {talk.event}</span>
            </span>
          )}
          {talk.type && talk.type !== "Talk" && (
            <span className="font-mono text-[10px] tracking-widest text-parch-ghost">
              · {talk.type.toUpperCase()}
            </span>
          )}
          {talk.hasTranscript && (
            <span className="font-mono text-[9px] tracking-widest text-parch-ghost" title="Transcript available">
              · ⌜TR⌝
            </span>
          )}
          {talk.brand && <BrandLogo slug={talk.brand} size={14} />}
          <span className="ml-auto font-mono text-[9px] tracking-widest text-parch-ghost" title={`${XP_PER_TIER[talk.tier]} XP on completion`}>
            +{XP_PER_TIER[talk.tier]}
          </span>
        </div>

        {isBoss && boss ? (
          <>
            <h3 className="font-serif text-2xl leading-tight text-parch mt-2 mb-1">
              {boss.name}
            </h3>
            <p className="font-serif italic text-base text-parch-dim mb-3">
              {talk.title}
            </p>
            <div className="boss-prose text-sm mb-3">
              <p>{boss.prose}</p>
            </div>
            <div className="text-sm text-parch-dim mb-4">
              <span className="text-parch-faint">You take from this fight: </span>
              <span className="text-ember">{boss.rune}</span>
            </div>
          </>
        ) : (
          <h3 className={`font-serif leading-snug ${
            talk.tier === "main" ? "text-lg text-parch" : "text-[15px] text-parch-dim"
          }`}>
            {talk.title}
          </h3>
        )}

        {talk.speakers.length > 0 && (
          <p className="mt-1 font-mono text-[11px] text-parch-faint truncate">
            {talk.speakers.map((sp, i) => (
              <span key={i}>
                <a
                  href={`/s/${speakerSlug(sp)}`}
                  className="hover:text-ember underline-offset-4 hover:underline transition-colors"
                >
                  {sp}
                </a>
                {i < talk.speakers.length - 1 && ", "}
              </span>
            ))}
          </p>
        )}

        {!isBoss && (
          <p className="mt-0.5 italic text-[12px] text-parch-faint">
            {talk.flavor}
          </p>
        )}

        {/* Expandable description + transcript prologue + threads */}
        {(hasMore || (talk.threads && talk.threads.length > 0)) && (
          <div className="mt-2">
            {expanded ? (
              <div className="space-y-3 fade-up">
                {talk.desc && (
                  <div>
                    <p className="font-mono text-[10px] tracking-widest text-parch-faint mb-1">ABSTRACT</p>
                    <p className="text-[13px] text-parch-dim leading-relaxed">{talk.desc}</p>
                  </div>
                )}
                {talk.prologue && (
                  <div>
                    <p className="font-mono text-[10px] tracking-widest text-parch-faint mb-1">PROLOGUE · the talk's first words</p>
                    <p className="text-[13px] text-parch-dim leading-relaxed font-serif italic border-l border-ember/40 pl-3">{talk.prologue}</p>
                  </div>
                )}
                {talk.threads && talk.threads.length > 0 && (
                  <div>
                    <p className="font-mono text-[10px] tracking-widest text-parch-faint mb-1">THREADS</p>
                    <div className="flex flex-wrap gap-1.5">
                      {talk.threads.map((tid) => {
                        const th = THREAD_BY_ID[tid];
                        if (!th) return null;
                        return (
                          <span
                            key={tid}
                            className="font-mono text-[10px] tracking-wider text-parch-faint border border-[var(--hairline)] px-2 py-0.5"
                          >
                            {th.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
            {hasMore && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-1 font-mono text-[10px] tracking-widest text-parch-ghost hover:text-ember transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-void"
              >
                {expanded ? "[ FOLD ]" : "[ UNFOLD ]"}
              </button>
            )}
          </div>
        )}

        {/* Related talks for bosses */}
        {isBoss && related && related.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[var(--hairline)]">
            <p className="font-mono text-[10px] tracking-widest text-parch-faint mb-2">IF THIS BOSS STRUCK YOU</p>
            <ul className="space-y-1">
              {related.map((r) => {
                const rt = TALK_BY_ID[r.id];
                return (
                  <li key={r.id} className="text-[12px]">
                    <a
                      href={`#${r.id}`}
                      className="text-parch-dim hover:text-ember transition-colors"
                    >
                      <span className="font-mono text-[10px] text-parch-faint mr-2">D{r.ed} · {TIER_GLYPH[rt?.tier ?? r.tier]}</span>
                      {r.title}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="mt-2 flex gap-3 font-mono text-[11px] tracking-wider">
          <a
            href={talk.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-parch-faint hover:text-ember underline-offset-4 hover:underline transition-colors"
          >
            ARCHIVE
          </a>
          {talk.yt && (
            <a
              href={`https://youtu.be/${talk.yt}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-parch-faint hover:text-ember underline-offset-4 hover:underline transition-colors"
            >
              YOUTUBE
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default memo(Row);
