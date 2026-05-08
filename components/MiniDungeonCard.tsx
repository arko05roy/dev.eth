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

export default function MiniDungeonCard({ thread, watched, onToggle }: Props) {
  const [open, setOpen] = useState(false);

  const talks: Talk[] = useMemo(
    () => thread.talkIds.map((id) => TALK_BY_ID[id]).filter(Boolean),
    [thread.talkIds]
  );

  const bosses = useMemo(() => talks.filter((t) => t.tier === "boss").slice(0, 2), [talks]);
  const mainCount = useMemo(() => talks.filter((t) => t.tier === "main").length, [talks]);

  const watchedCount = useMemo(
    () => talks.reduce((n, t) => n + (watched.has(t.id) ? 1 : 0), 0),
    [talks, watched]
  );
  const pct = talks.length === 0 ? 0 : Math.round((watchedCount / talks.length) * 100);
  const hasBosses = bosses.length > 0;

  return (
    <article
      id={`thread-${thread.id}`}
      className="scroll-mt-24 border border-[var(--hairline)] hover:border-parch-faint transition-colors flex flex-col"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="text-left px-4 py-3.5 group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-void"
      >
        <div className="flex items-baseline gap-2 flex-wrap">
          {hasBosses && <span className="text-ember font-mono text-[12px]" aria-hidden>⚔</span>}
          <h3 className="font-serif text-lg text-parch group-hover:text-ember transition-colors">
            {thread.name}
          </h3>
        </div>
        <p className="prose-read text-[12px] mt-1 line-clamp-2">{thread.blurb}</p>
        <div className="flex items-baseline gap-3 mt-2 flex-wrap">
          <span className="font-mono text-[10px] tracking-widest text-parch-faint">
            {thread.count} TALK{thread.count === 1 ? "" : "S"}
          </span>
          {hasBosses && (
            <span className="font-mono text-[10px] tracking-widest text-ember">
              {bosses.length} BOSS{bosses.length === 1 ? "" : "ES"}
            </span>
          )}
          {mainCount > 0 && (
            <span className="font-mono text-[10px] tracking-widest text-parch-ghost">
              {mainCount} MAIN
            </span>
          )}
          <span className="ml-auto font-mono text-[10px] tracking-widest text-parch-faint">
            {watchedCount}/{thread.count} · {pct}%
          </span>
        </div>
      </button>

      <div className="px-4">
        <div className="h-px bg-[var(--hairline)] relative">
          <div
            className="absolute inset-y-0 left-0 bg-ember"
            style={{ width: `${pct}%`, transition: "width 380ms cubic-bezier(0.22,0.61,0.36,1)" }}
          />
        </div>
      </div>

      {/* Boss preview when collapsed — show titles inline */}
      {!open && hasBosses && (
        <div className="px-4 py-2.5 border-t border-[var(--hairline)] space-y-1">
          {bosses.map((b) => (
            <a
              key={b.id}
              href={`#${b.id}`}
              onClick={(e) => { e.preventDefault(); setOpen(true); }}
              className="block font-serif text-[13px] italic text-parch-faint hover:text-ember transition-colors line-clamp-1"
            >
              <span className="text-ember mr-1.5" aria-hidden>Φ</span>
              {b.title}
            </a>
          ))}
        </div>
      )}

      {open && (
        <div className="border-t border-[var(--hairline)] px-1 py-2 fade-up">
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
