"use client";
import type { Thread } from "@/lib/types";
import MiniDungeonCard from "./MiniDungeonCard";

interface Props {
  threads: Thread[];
  watched: Set<string>;
  onToggle: (id: string) => void;
}

export default function MiniDungeonGrid({ threads, watched, onToggle }: Props) {
  if (threads.length === 0) return null;
  const previewNames = threads.slice(0, 6).map((t) => t.name).join(" · ");
  const more = Math.max(0, threads.length - 6);
  return (
    <section className="mb-10">
      <p className="font-mono text-[10px] tracking-[0.25em] text-parch-faint mb-1">
        ─── MINI-DUNGEONS · {threads.length} ───
      </p>
      <p className="prose-read-bright max-w-2xl mb-2 italic">
        Smaller halls woven by curators and the classifier together. ⚔ marks halls where bosses still wait.
      </p>
      <p className="prose-read italic text-[12px] text-parch-faint max-w-2xl mb-5">
        <span className="text-parch-ghost">Inside · </span>
        {previewNames}
        {more > 0 && <span className="text-parch-ghost"> · and {more} more</span>}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {threads.map((t) => (
          <MiniDungeonCard key={t.id} thread={t} watched={watched} onToggle={onToggle} />
        ))}
      </div>
    </section>
  );
}
