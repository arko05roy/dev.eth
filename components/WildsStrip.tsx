"use client";
import { useMemo, useState } from "react";
import type { ActId } from "@/lib/types";
import { getParadigmsInAct, type Zone } from "@/lib/paradigms";
import TalkRow from "./TalkRow";

interface Props {
  actId: ActId;
  watched: Set<string>;
  onToggle: (id: string) => void;
}

export default function WildsStrip({ actId, watched, onToggle }: Props) {
  const paradigms = useMemo(() => getParadigmsInAct(actId), [actId]);
  if (paradigms.length === 0) return null;

  const paradigmNames = paradigms.map((p) => p.paradigm.name).join(" · ");
  return (
    <section className="mb-10">
      <p className="font-mono text-[10px] tracking-[0.25em] text-parch-faint mb-1">
        ─── THE WILDS · {paradigms.length} PARADIGM{paradigms.length === 1 ? "" : "S"} ───
      </p>
      <p className="prose-read-bright max-w-2xl mb-2 italic">
        Forests, rivers, hollow trees. Wander by paradigm rather than by thread.
        Many talks live in both at once.
      </p>
      <p className="prose-read italic text-[12px] text-parch-faint max-w-2xl mb-5">
        <span className="text-parch-ghost">Inside · </span>
        {paradigmNames}
      </p>
      <div className="space-y-2">
        {paradigms.map((p) => (
          <ParadigmRow key={p.paradigm.id} entry={p} watched={watched} onToggle={onToggle} />
        ))}
      </div>
    </section>
  );
}

function ParadigmRow({
  entry,
  watched,
  onToggle,
}: {
  entry: ReturnType<typeof getParadigmsInAct>[number];
  watched: Set<string>;
  onToggle: (id: string) => void;
}) {
  const [activeZone, setActiveZone] = useState<string | null>(null);

  const watchedCount = useMemo(() => {
    let n = 0;
    for (const z of entry.zones) for (const t of z.talks) if (watched.has(t.id)) n++;
    return n;
  }, [entry, watched]);
  const pct = entry.totalTalks === 0 ? 0 : Math.round((watchedCount / entry.totalTalks) * 100);

  const openZone: Zone | undefined = entry.zones.find((z) => z.id === activeZone);

  return (
    <article className="border border-[var(--hairline)] hover:border-parch-faint transition-colors">
      <div className="px-4 sm:px-5 py-3 sm:py-4">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h3 className="font-serif italic text-xl sm:text-2xl text-parch">{entry.paradigm.name}</h3>
          <span className="font-mono text-[10px] tracking-widest text-parch-faint">
            {entry.totalTalks} TALK{entry.totalTalks === 1 ? "" : "S"}
          </span>
          <span className="font-mono text-[10px] tracking-widest text-parch-ghost">
            ❦ {entry.zones.length} ZONE{entry.zones.length === 1 ? "" : "S"}
          </span>
          <span className="ml-auto font-mono text-[10px] tracking-widest text-ember">
            {watchedCount}/{entry.totalTalks} · {pct}%
          </span>
        </div>
        <p className="prose-read italic text-[13px] mt-1 max-w-2xl">{entry.paradigm.blurb}</p>
      </div>

      <div className="px-4 sm:px-5">
        <div className="h-px bg-[var(--hairline)] relative">
          <div
            className="absolute inset-y-0 left-0 bg-ember"
            style={{ width: `${pct}%`, transition: "width 380ms cubic-bezier(0.22,0.61,0.36,1)" }}
          />
        </div>
      </div>

      {/* Zone chips */}
      <div className="px-4 sm:px-5 py-3 flex flex-wrap gap-1.5">
        {entry.zones.map((z) => {
          const active = z.id === activeZone;
          const w = z.talks.reduce((n, t) => n + (watched.has(t.id) ? 1 : 0), 0);
          return (
            <button
              key={z.id}
              type="button"
              onClick={() => setActiveZone((cur) => (cur === z.id ? null : z.id))}
              aria-pressed={active}
              className={`inline-flex items-baseline gap-1.5 px-2.5 py-1 border font-mono text-[10px] tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-void ${
                active
                  ? "border-ember bg-ember text-void"
                  : "border-[var(--hairline)] text-parch-faint hover:text-parch hover:border-parch-faint"
              }`}
            >
              <span className="normal-case">{z.name}</span>
              <span className={active ? "text-void/70" : "text-parch-ghost"}>
                {w === 0 ? z.talks.length : `${w}/${z.talks.length}`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active zone talks */}
      {openZone && (
        <div className="border-t border-[var(--hairline)] px-2 sm:px-3 py-2 fade-up">
          <div className="px-2 sm:px-3 pb-2">
            <p className="font-mono text-[10px] tracking-[0.22em] text-ember">
              {openZone.name.toUpperCase()} · {openZone.talks.length} TALK{openZone.talks.length === 1 ? "" : "S"}
            </p>
          </div>
          <div className="divide-y divide-[var(--hairline)]">
            {openZone.talks.map((t) => (
              <TalkRow key={t.id} talk={t} watched={watched.has(t.id)} onToggle={onToggle} compact />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
