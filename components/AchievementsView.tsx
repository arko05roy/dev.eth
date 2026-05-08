"use client";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { useProgress } from "@/lib/progress";

export default function AchievementsView() {
  const p = useProgress();

  if (!p.hydrated) {
    return <main className="max-w-4xl mx-auto px-6 py-24 text-parch-faint">Loading…</main>;
  }

  return (
    <main className="max-w-4xl mx-auto px-6 lg:px-12 py-16">
      <a href="/" className="font-mono text-[10px] tracking-widest text-parch-faint hover:text-ember transition-colors">← THE GATE</a>

      <header className="mt-8 mb-12 pb-8 border-b hairline">
        <p className="font-mono text-[10px] tracking-widest text-ember mb-2">─── ACHIEVEMENTS ───</p>
        <h1 className="font-serif text-5xl text-parch leading-tight">Ledger of Runes</h1>
        <p className="mt-3 font-serif italic text-parch-dim">
          {p.achievements.size} of {p.totalAchievements} earned
        </p>
      </header>

      <ul className="grid sm:grid-cols-2 gap-3">
        {ACHIEVEMENTS.map((a) => {
          const unlocked = p.achievements.has(a.id);
          const showName = unlocked || !a.hidden;
          return (
            <li
              key={a.id}
              className={`px-5 py-4 border ${
                unlocked
                  ? "border-ember bg-void-50/40"
                  : "border-[var(--hairline)] opacity-70"
              } transition-colors`}
            >
              <div className="flex items-baseline gap-3 mb-1">
                <span
                  className={`font-serif text-3xl ${unlocked ? "text-ember" : "text-parch-ghost"}`}
                  aria-hidden
                >
                  {unlocked ? a.glyph : "?"}
                </span>
                <span className={`font-serif text-lg ${unlocked ? "text-parch" : "text-parch-faint"}`}>
                  {showName ? a.name : "???"}
                </span>
                {unlocked && (
                  <span className="ml-auto font-mono text-[10px] tracking-widest text-ember">EARNED</span>
                )}
              </div>
              <p className={`text-[12px] italic font-serif leading-relaxed ${unlocked ? "text-parch-dim" : "text-parch-faint"}`}>
                {unlocked ? a.flavor : a.hint}
              </p>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
