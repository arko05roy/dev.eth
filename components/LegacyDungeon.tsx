"use client";
import { useMemo, useState } from "react";
import type { Thread, Talk } from "@/lib/types";
import { TALK_BY_ID } from "@/lib/talks";
import TalkRow from "./TalkRow";

interface Props {
  thread: Thread;
  watched: Set<string>;
  onToggle: (id: string) => void;
}

export default function LegacyDungeon({ thread, watched, onToggle }: Props) {
  const [open, setOpen] = useState(false);

  const talks: Talk[] = useMemo(
    () => thread.talkIds.map((id) => TALK_BY_ID[id]).filter(Boolean),
    [thread.talkIds]
  );

  const bosses = useMemo(() => talks.filter((t) => t.tier === "boss"), [talks]);
  const mains = useMemo(() => talks.filter((t) => t.tier === "main"), [talks]);

  const watchedCount = useMemo(
    () => talks.reduce((n, t) => n + (watched.has(t.id) ? 1 : 0), 0),
    [talks, watched]
  );
  const pct = talks.length === 0 ? 0 : Math.round((watchedCount / talks.length) * 100);

  return (
    <article
      id={`thread-${thread.id}`}
      className="scroll-mt-24 border border-ember/40 bg-void-50/30 mb-8"
    >
      <header className="px-5 sm:px-7 py-5 sm:py-6 border-b border-[var(--hairline)]">
        <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.3em] text-ember mb-2">
          ── THE LEGACY OF THIS LAND ──
        </p>
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="font-serif text-3xl text-ember leading-none" aria-hidden>Ω</span>
          <h2 className="font-serif text-2xl sm:text-3xl text-parch">{thread.name}</h2>
        </div>
        <p className="prose-read-bright italic text-[14px] sm:text-base mt-2 max-w-2xl">{thread.blurb}</p>
        <div className="mt-4 flex items-baseline gap-3 flex-wrap">
          <span className="font-mono text-[10px] tracking-widest text-parch-faint">
            {thread.count} TALK{thread.count === 1 ? "" : "S"}
          </span>
          {bosses.length > 0 && (
            <span className="font-mono text-[10px] tracking-widest text-ember">
              {bosses.length} BOSS{bosses.length === 1 ? "" : "ES"}
            </span>
          )}
          {mains.length > 0 && (
            <span className="font-mono text-[10px] tracking-widest text-parch-faint">
              {mains.length} MAIN QUEST{mains.length === 1 ? "" : "S"}
            </span>
          )}
          <span className="ml-auto font-mono text-[10px] tracking-widest text-ember">
            {watchedCount}/{thread.count} · {pct}%
          </span>
        </div>
        <div className="mt-3 h-px bg-[var(--hairline)] relative">
          <div
            className="absolute inset-y-0 left-0 bg-ember"
            style={{ width: `${pct}%`, transition: "width 380ms cubic-bezier(0.22,0.61,0.36,1)" }}
          />
        </div>
      </header>

      {/* Boss roster (always visible) */}
      {bosses.length > 0 && (
        <section className="px-5 sm:px-7 py-4">
          <p className="font-mono text-[10px] tracking-[0.3em] text-parch-faint mb-3">
            ── BOSSES OF THE LEGACY ──
          </p>
          <div className="space-y-2">
            {bosses.map((b) => (
              <a
                key={b.id}
                href={`#${b.id}`}
                onClick={(e) => { e.preventDefault(); setOpen(true); }}
                className={`block group ${
                  watched.has(b.id) ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-2xl text-ember" aria-hidden>Φ</span>
                  <span className="font-serif text-lg text-parch group-hover:text-ember transition-colors leading-tight">
                    {b.title}
                  </span>
                  {watched.has(b.id) && (
                    <span className="font-mono text-[10px] tracking-widest text-ember">✓</span>
                  )}
                </div>
                {b.flavor && (
                  <p className="prose-read italic text-[12px] mt-0.5 ml-7 line-clamp-1">{b.flavor}</p>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left px-5 sm:px-7 py-3 border-t border-[var(--hairline)] hover:bg-void-50/40 font-mono text-[11px] tracking-[0.25em] text-parch-faint hover:text-ember transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-void"
      >
        {open ? "▾ FOLD THE LEGACY" : `▸ UNFOLD ALL ${thread.count} TALKS`}
      </button>

      {open && (
        <div className="border-t border-[var(--hairline)] px-2 sm:px-3 py-2 fade-up">
          <div className="divide-y divide-[var(--hairline)]">
            {talks.map((t) => (
              <TalkRow key={t.id} talk={t} watched={watched.has(t.id)} onToggle={onToggle} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
