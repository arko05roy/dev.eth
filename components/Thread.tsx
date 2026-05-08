"use client";
import type { Thread, Talk } from "@/lib/types";
import { TALK_BY_ID } from "@/lib/talks";
import { useMemo, useState } from "react";
import TalkRow from "./TalkRow";

interface Props {
  thread: Thread;
  watched: Set<string>;
  toggle: (id: string) => void;
}

export default function ThreadView({ thread, watched, toggle }: Props) {
  const [open, setOpen] = useState(false);

  const talks: Talk[] = useMemo(
    () => thread.talkIds.map((id) => TALK_BY_ID[id]).filter(Boolean),
    [thread.talkIds]
  );

  const stats = useMemo(() => {
    let dev = 0, eg = 0, w = 0;
    for (const t of talks) {
      if (t.source === "ethglobal") eg++; else dev++;
      if (watched.has(t.id)) w++;
    }
    return { dev, eg, w, total: talks.length };
  }, [talks, watched]);

  const pct = stats.total === 0 ? 0 : Math.round((stats.w / stats.total) * 100);

  return (
    <article className="border border-[var(--hairline)] hover:border-parch-faint transition-colors mb-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left px-5 py-4 flex items-baseline gap-4 group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-void"
      >
        <span className={`font-mono text-[18px] transition-transform ${open ? "rotate-90" : ""}`} aria-hidden>
          {open ? "▾" : "▸"}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="font-serif text-xl text-parch group-hover:text-ember transition-colors">
              {thread.name}
            </h3>
            <span className="font-mono text-[10px] tracking-widest text-parch-faint">
              {stats.total} TALK{stats.total === 1 ? "" : "S"}
            </span>
            <span className="font-mono text-[10px] tracking-widest text-parch-ghost">
              · {stats.dev} DEVCON · {stats.eg} ETHGLOBAL
            </span>
          </div>
          <p className="prose-read mt-1.5">{thread.blurb}</p>
        </div>
        <div className="shrink-0 text-right min-w-[64px]">
          <p className="font-mono text-[10px] tracking-widest text-parch-faint">{stats.w}/{stats.total}</p>
          <p className="font-mono text-[10px] tracking-widest text-ember">{pct}%</p>
        </div>
      </button>

      {/* Mini progress bar */}
      <div className="px-5">
        <div className="h-px bg-[var(--hairline)] relative">
          <div className="absolute inset-y-0 left-0 bg-ember" style={{ width: `${pct}%`, transition: "width 380ms cubic-bezier(0.22,0.61,0.36,1)" }} />
        </div>
      </div>

      {open && (
        <div className="px-2 pb-3 fade-up">
          <div className="divide-y divide-[var(--hairline)]">
            {talks.map((t) => (
              <TalkRow key={t.id} talk={t} watched={watched.has(t.id)} onToggle={toggle} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
