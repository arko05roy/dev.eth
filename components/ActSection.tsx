"use client";
import { useMemo, useState } from "react";
import type { ActMeta, Talk } from "@/lib/types";
import { EFFECTIVE_THREADS } from "@/lib/auto-threads";
import { isClassificationLoaded } from "@/lib/paradigms";
import LegacyDungeon from "./LegacyDungeon";
import MiniDungeonGrid from "./MiniDungeonGrid";
import WildsStrip from "./WildsStrip";
import TalkRow from "./TalkRow";

interface Props {
  act: ActMeta;
  talks: Talk[];                  // already filtered to this Act and any active query
  watched: Set<string>;
  onToggle: (id: string) => void;
  isFiltering?: boolean;
}

export default function ActSection({ act, talks, watched, onToggle, isFiltering = false }: Props) {
  const actThreads = useMemo(
    () => EFFECTIVE_THREADS.filter((t) => t.act === act.id),
    [act.id]
  );

  const filteredTalkIds = useMemo(() => new Set(talks.map((t) => t.id)), [talks]);

  // For each thread, the visible (filtered) subset
  const threadsWithCounts = useMemo(() => {
    return actThreads
      .map((t) => {
        const visible = t.talkIds.filter((id) => filteredTalkIds.has(id));
        return { thread: { ...t, talkIds: visible }, visibleCount: visible.length };
      })
      .filter((x) => x.visibleCount > 0)
      .sort((a, b) => b.visibleCount - a.visibleCount);
  }, [actThreads, filteredTalkIds]);

  // Pick the legacy dungeon (largest thread of this act) and the mini-dungeons (rest).
  const [legacyEntry, ...miniEntries] = threadsWithCounts;
  const legacy = legacyEntry?.thread;
  const minis = miniEntries.map((m) => m.thread);

  // Talks not in any thread of this Act, partitioned into sub-buckets.
  const buckets = useMemo(() => {
    const inThread = new Set<string>();
    for (const tt of threadsWithCounts) for (const id of tt.thread.talkIds) inThread.add(id);

    const sponsor: Talk[] = [];
    const lightning: Talk[] = [];
    const music: Talk[] = [];
    const frontiers: Talk[] = [];
    const apocrypha: Talk[] = [];

    for (const t of talks) {
      if (inThread.has(t.id)) continue;
      const tr = (t.eg_track || "").toUpperCase();
      const ty = (t.type || "").toLowerCase();
      if (tr === "SPONSOR") sponsor.push(t);
      else if (ty === "lightning talk") lightning.push(t);
      else if (ty === "music") music.push(t);
      else if (ty === "talk" || ty === "workshop" || ty === "pragma" || ty === "keynote" || ty === "panel") frontiers.push(t);
      else apocrypha.push(t);
    }
    return { sponsor, lightning, music, frontiers, apocrypha };
  }, [talks, threadsWithCounts]);

  // Topic chip rail (mini-dungeons only — legacy gets its own hero card)
  const chipThreads = miniEntries;

  // Per-act progress
  const watchedCount = useMemo(() => talks.filter((t) => watched.has(t.id)).length, [talks, watched]);
  const pct = talks.length === 0 ? 0 : Math.round((watchedCount / talks.length) * 100);

  const wildsAvailable = isClassificationLoaded();

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

      {/* Topic chip rail — jump to mini-dungeon threads. */}
      {chipThreads.length > 0 && (
        <section className="mb-8">
          <p className="font-mono text-[10px] tracking-[0.25em] text-parch-faint mb-3">
            JUMP TO TOPIC · {chipThreads.length + (legacy ? 1 : 0)} THREAD{chipThreads.length === 0 && legacy ? "" : "S"}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {legacy && (
              <a
                href={`#thread-${legacy.id}`}
                className="inline-flex items-baseline gap-1.5 px-2.5 py-1 border border-ember text-ember hover:bg-ember hover:text-void transition-colors font-mono text-[10px] tracking-[0.12em] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-void"
              >
                <span className="normal-case">Ω {legacy.name}</span>
                <span className="opacity-70">{legacy.talkIds.length}</span>
              </a>
            )}
            {chipThreads.map(({ thread, visibleCount }) => (
              <a
                key={thread.id}
                href={`#thread-${thread.id}`}
                className="inline-flex items-baseline gap-1.5 px-2.5 py-1 border border-[var(--hairline)] hover:border-ember hover:text-ember transition-colors font-mono text-[10px] tracking-[0.12em] text-parch-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-void"
              >
                <span className="normal-case">{thread.name}</span>
                <span className="text-parch-ghost">{visibleCount}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Legacy Dungeon — the centerpiece */}
      {legacy && <LegacyDungeon thread={legacy} watched={watched} onToggle={onToggle} />}

      {/* Mini-Dungeons grid */}
      {minis.length > 0 && <MiniDungeonGrid threads={minis} watched={watched} onToggle={onToggle} />}

      {/* The Wilds — paradigm zones (only if classification artifact present) */}
      {wildsAvailable && <WildsStrip actId={act.id} watched={watched} onToggle={onToggle} />}

      {/* Sub-buckets — every un-threaded talk lands somewhere visible */}
      <section className="mb-6 space-y-3">
        {buckets.frontiers.length > 0 && (
          <CollapsibleBucket
            label="THE FRONTIERS"
            sub={`${buckets.frontiers.length} talks awaiting their thread — lectures, workshops, panels not yet woven into a topic`}
            talks={buckets.frontiers}
            watched={watched}
            onToggle={onToggle}
            forceOpen={isFiltering}
          />
        )}
        {buckets.sponsor.length > 0 && (
          <CollapsibleBucket
            label="THE HERALDS"
            sub={
              <>
                {buckets.sponsor.length} sponsor sessions — also organized as guild roadmaps in{" "}
                <a href="/protocols" className="text-ember hover:text-parch transition-colors">/protocols</a>
              </>
            }
            talks={buckets.sponsor}
            watched={watched}
            onToggle={onToggle}
            forceOpen={isFiltering}
          />
        )}
        {buckets.lightning.length > 0 && (
          <CollapsibleBucket
            label="LIGHTNING"
            sub={`${buckets.lightning.length} lightning talks — short, sharp, often the seed of a thread`}
            talks={buckets.lightning}
            watched={watched}
            onToggle={onToggle}
            forceOpen={isFiltering}
          />
        )}
        {buckets.music.length > 0 && (
          <CollapsibleBucket
            label="MUSIC & CEREMONY"
            sub={`${buckets.music.length} ceremonial recordings — opening, closing, music`}
            talks={buckets.music}
            watched={watched}
            onToggle={onToggle}
            forceOpen={isFiltering}
          />
        )}
        {buckets.apocrypha.length > 0 && (
          <CollapsibleBucket
            label="APOCRYPHA"
            sub={`${buckets.apocrypha.length} breakouts and miscellany — the archive's edge`}
            talks={buckets.apocrypha}
            watched={watched}
            onToggle={onToggle}
            forceOpen={isFiltering}
          />
        )}
      </section>
    </section>
  );
}

function CollapsibleBucket({
  label,
  sub,
  talks,
  watched,
  onToggle,
  forceOpen,
}: {
  label: string;
  sub: React.ReactNode;
  talks: Talk[];
  watched: Set<string>;
  onToggle: (id: string) => void;
  forceOpen: boolean;
}) {
  const [open, setOpen] = useState(false);
  const isOpen = forceOpen || open;

  const watchedCount = useMemo(
    () => talks.reduce((n, t) => n + (watched.has(t.id) ? 1 : 0), 0),
    [talks, watched]
  );
  const pct = talks.length === 0 ? 0 : Math.round((watchedCount / talks.length) * 100);

  return (
    <article className="border border-[var(--hairline)] hover:border-parch-faint transition-colors">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={isOpen}
        className="w-full text-left px-4 sm:px-5 py-3 sm:py-4 flex items-baseline gap-3 sm:gap-4 group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-void"
      >
        <span className={`font-mono text-[16px] sm:text-[18px] transition-transform ${isOpen ? "rotate-90" : ""}`} aria-hidden>
          {isOpen ? "▾" : "▸"}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-mono text-[11px] sm:text-[12px] tracking-[0.25em] text-parch group-hover:text-ember transition-colors">
              {label}
            </span>
            <span className="font-mono text-[10px] tracking-widest text-parch-faint">
              {talks.length}
            </span>
          </div>
          <p className="prose-read mt-1.5 text-[12px] sm:text-[13px]">{sub}</p>
        </div>
        <div className="shrink-0 text-right min-w-[56px]">
          <p className="font-mono text-[10px] tracking-widest text-parch-faint">{watchedCount}/{talks.length}</p>
          <p className="font-mono text-[10px] tracking-widest text-ember">{pct}%</p>
        </div>
      </button>

      <div className="px-4 sm:px-5">
        <div className="h-px bg-[var(--hairline)] relative">
          <div
            className="absolute inset-y-0 left-0 bg-ember"
            style={{ width: `${pct}%`, transition: "width 380ms cubic-bezier(0.22,0.61,0.36,1)" }}
          />
        </div>
      </div>

      {isOpen && (
        <div className="px-2 sm:px-3 py-2 fade-up">
          <div className="divide-y divide-[var(--hairline)]">
            {talks.map((t) => (
              <TalkRow key={t.id} talk={t} watched={watched.has(t.id)} onToggle={onToggle} compact />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
