"use client";
import { useMemo, useState } from "react";
import type { ActMeta, Talk } from "@/lib/types";
import { THREADS } from "@/lib/talks";
import TalkRow from "./TalkRow";
import ThreadView from "./Thread";

interface Props {
  act: ActMeta;
  talks: Talk[];                  // already filtered to this Act and any active query
  watched: Set<string>;
  onToggle: (id: string) => void;
  isFiltering?: boolean;
}

export default function ActSection({ act, talks, watched, onToggle, isFiltering = false }: Props) {
  const actThreads = useMemo(
    () => THREADS.filter((t) => t.act === act.id),
    [act.id]
  );

  // Determine which thread IDs are "in scope" for this filtered talk set
  const filteredTalkIds = useMemo(() => new Set(talks.map((t) => t.id)), [talks]);

  // For each thread, the visible (filtered) subset
  const threadsWithCounts = useMemo(() => {
    return actThreads
      .map((t) => {
        const visible = t.talkIds.filter((id) => filteredTalkIds.has(id));
        return { thread: { ...t, talkIds: visible }, visibleCount: visible.length };
      })
      .filter((x) => x.visibleCount > 0);
  }, [actThreads, filteredTalkIds]);

  // Orphans = talks in this act NOT in any thread within this act
  const inThread = useMemo(() => {
    const s = new Set<string>();
    for (const tt of threadsWithCounts) {
      for (const id of tt.thread.talkIds) s.add(id);
    }
    return s;
  }, [threadsWithCounts]);

  const orphans = useMemo(() => talks.filter((t) => !inThread.has(t.id)), [talks, inThread]);

  const [showOrphans, setShowOrphans] = useState(false);
  // Auto-show orphans when filtering (so search doesn't hide hits)
  const orphansVisible = showOrphans || isFiltering;

  // Per-act progress
  const watchedCount = useMemo(() => talks.filter((t) => watched.has(t.id)).length, [talks, watched]);
  const pct = talks.length === 0 ? 0 : Math.round((watchedCount / talks.length) * 100);

  return (
    <section id={`act-${act.id}`} className="scroll-anchor py-16 border-t hairline">
      {/* Site of Grace header */}
      <header className="mb-10">
        <div className="flex items-baseline gap-6 mb-6">
          <span className="font-serif text-7xl text-ember leading-none" aria-hidden>{act.glyph}</span>
          <div className="flex-1">
            <p className="font-mono text-[11px] tracking-widest text-parch-faint">
              ACT {act.id} · SITE OF GRACE
            </p>
            <h2 className="font-serif text-4xl text-parch mt-1">{act.title}</h2>
            <p className="font-mono text-xs text-parch-faint mt-1 tracking-wider">{act.subtitle}</p>
          </div>
        </div>

        <dl className="grid md:grid-cols-2 gap-x-10 gap-y-4 max-w-4xl">
          <div>
            <dt className="font-mono text-[10px] tracking-widest text-parch-faint mb-1">THE LAND</dt>
            <dd className="prose-read-bright">{act.land}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] tracking-widest text-parch-faint mb-1">THE MOOD</dt>
            <dd className="prose-read-bright">{act.mood}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] tracking-widest text-parch-faint mb-1">PREREQUISITES</dt>
            <dd className="prose-read-bright">{act.prereq}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] tracking-widest text-parch-faint mb-1">RUNES YOU TAKE</dt>
            <dd className="text-ember italic font-serif">{act.runes}</dd>
          </div>
        </dl>

        <div className="mt-6 max-w-md">
          <div className="flex justify-between font-mono text-[10px] tracking-widest text-parch-faint mb-2">
            <span>PROGRESS</span>
            <span>{watchedCount} / {talks.length} · {pct}%</span>
          </div>
          <div className="h-px bg-[var(--hairline)] relative">
            <div className="absolute inset-y-0 left-0 bg-ember" style={{ width: `${pct}%`, transition: "width 380ms cubic-bezier(0.22,0.61,0.36,1)" }} />
          </div>
        </div>
      </header>

      {/* Threads — primary structure */}
      {threadsWithCounts.length > 0 && (
        <section className="mb-10">
          <p className="font-mono text-[11px] tracking-widest text-parch-faint mb-4">
            ─── THREADS · {threadsWithCounts.length} OF {actThreads.length} VISIBLE ───
          </p>
          <p className="prose-read-bright mb-5 max-w-2xl">
            Each thread weaves Devcon canon and ETHGlobal apocrypha into one ordered learning path —
            theory followed by application, intro followed by depth. Click to unroll.
          </p>
          <div>
            {threadsWithCounts.map(({ thread }) => (
              <ThreadView key={thread.id} thread={thread} watched={watched} toggle={onToggle} />
            ))}
          </div>
        </section>
      )}

      {/* Orphans — talks not in any thread */}
      {orphans.length > 0 && (
        <section className="mb-10">
          <div className="flex items-baseline gap-3 mb-4">
            <p className="font-mono text-[11px] tracking-widest text-parch-faint">
              ─── UNTHREADED · {orphans.length} ───
            </p>
            {!isFiltering && (
              <button
                type="button"
                onClick={() => setShowOrphans((v) => !v)}
                className="ml-auto font-mono text-[11px] tracking-widest text-parch-faint hover:text-ember transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-void"
              >
                {orphansVisible ? "[ HIDE ]" : "[ REVEAL ]"}
              </button>
            )}
          </div>
          {orphansVisible ? (
            <div className="divide-y divide-[var(--hairline)]">
              {orphans.map((t) => (
                <TalkRow key={t.id} talk={t} watched={watched.has(t.id)} onToggle={onToggle} />
              ))}
            </div>
          ) : (
            <p className="prose-read max-w-2xl">
              Talks that did not fall cleanly into any thread of this Land. Most are early sermons,
              lightning talks, or sponsor introductions kept for completeness.
            </p>
          )}
        </section>
      )}
    </section>
  );
}
