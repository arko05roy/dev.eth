"use client";
import { useProgress } from "@/lib/progress";
import type { Talk, Speaker } from "@/lib/types";
import { ACTS } from "@/lib/acts";
import TalkRow from "./TalkRow";
import { useMemo } from "react";

interface Props {
  name: string;
  talks: Talk[];
  info?: Speaker;
}

export default function SpeakerView({ name, talks, info }: Props) {
  const { watched, toggle } = useProgress();

  const byAct = useMemo(() => {
    const m: Record<string, Talk[]> = {};
    for (const t of talks) (m[t.act] ||= []).push(t);
    return m;
  }, [talks]);

  const watchedCount = talks.filter((t) => watched.has(t.id)).length;
  const editions = Array.from(new Set(talks.map((t) => t.ed))).sort();

  return (
    <main className="max-w-3xl mx-auto px-6 lg:px-12 py-16">
      <a
        href="/"
        className="font-mono text-[10px] tracking-widest text-parch-faint hover:text-ember transition-colors"
      >
        ← THE PATH
      </a>

      <header className="mt-10 mb-12 pb-8 border-b hairline">
        <p className="font-mono text-[10px] tracking-widest text-ember mb-2">
          ─── SPEAKER ───
        </p>
        <h1 className="font-serif text-5xl text-parch leading-tight">{name}</h1>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[11px] text-parch-faint">
          <span>{talks.length} TALK{talks.length === 1 ? "" : "S"}</span>
          <span>·</span>
          <span>DEVCONS {editions.join(", ")}</span>
          <span>·</span>
          <span>{watchedCount} WATCHED</span>
        </div>
        {info?.bio && (
          <p className="mt-6 text-[14px] text-parch-dim leading-relaxed font-serif italic">
            {info.bio}
          </p>
        )}
        {(info?.twitter || info?.github || info?.company) && (
          <div className="mt-4 flex flex-wrap gap-4 font-mono text-[11px]">
            {info.company && (
              <span className="text-parch-faint">@ {info.company}</span>
            )}
            {info.twitter && (
              <a
                href={`https://x.com/${info.twitter.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-parch-faint hover:text-ember underline-offset-4 hover:underline transition-colors"
              >
                X · {info.twitter.replace(/^@/, "")}
              </a>
            )}
            {info.github && (
              <a
                href={`https://github.com/${info.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-parch-faint hover:text-ember underline-offset-4 hover:underline transition-colors"
              >
                GITHUB
              </a>
            )}
          </div>
        )}
      </header>

      {/* Group by Act */}
      {ACTS.map((act) => {
        const list = byAct[act.id];
        if (!list || list.length === 0) return null;
        return (
          <section key={act.id} className="mb-12">
            <div className="flex items-baseline gap-3 mb-4">
              <span className="font-serif text-3xl text-ember" aria-hidden>{act.glyph}</span>
              <h2 className="font-mono text-[11px] tracking-widest text-parch">
                ACT {act.id} · {act.title.toUpperCase()}
              </h2>
            </div>
            <div className="divide-y divide-[var(--hairline)]">
              {list.map((t) => (
                <TalkRow
                  key={t.id}
                  talk={t}
                  watched={watched.has(t.id)}
                  onToggle={toggle}
                />
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
