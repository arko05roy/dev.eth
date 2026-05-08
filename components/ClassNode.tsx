"use client";
import { useEffect, useState } from "react";
import { CLASSES } from "@/lib/acts";

const KEY = "tarnished-path:class";

export default function ClassNode() {
  const [chosen, setChosen] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setChosen(window.localStorage.getItem(KEY));
    } catch {}
    setHydrated(true);
  }, []);

  const choose = (name: string) => {
    setChosen(name);
    try { window.localStorage.setItem(KEY, name); } catch {}
  };

  const reset = () => {
    setChosen(null);
    try { window.localStorage.removeItem(KEY); } catch {}
  };

  return (
    <section className="scroll-anchor py-20 border-t hairline">
      <div className="text-center mb-10">
        <p className="font-mono text-[10px] tracking-widest text-ember mb-3">
          ─── THE TARNISHED CHOOSES ───
        </p>
        <h2 className="font-serif text-4xl text-parch">Choose Your Class</h2>
        <p className="mt-3 text-sm text-parch-dim max-w-xl mx-auto leading-relaxed">
          You have walked the substrate and the markets. Now choose. This decides which trail through Acts IV and V you follow first. After completing one arc, the others reopen.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-3 max-w-4xl mx-auto">
        {CLASSES.map((c) => {
          const isChosen = chosen === c.name;
          return (
            <button
              key={c.name}
              type="button"
              onClick={() => choose(c.name)}
              aria-pressed={isChosen}
              className={`group text-left p-5 border transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-void ${
                isChosen
                  ? "border-ember bg-void-50"
                  : "border-[var(--hairline)] hover:border-parch-faint hover:bg-void-50/40"
              }`}
            >
              <div className="flex items-baseline gap-4 mb-2">
                <span className={`font-serif text-3xl ${isChosen ? "text-ember" : "text-parch-dim group-hover:text-parch"}`} aria-hidden>
                  {c.glyph}
                </span>
                <h3 className={`font-serif text-xl ${isChosen ? "text-ember" : "text-parch"}`}>
                  {c.name}
                </h3>
                {isChosen && (
                  <span className="ml-auto font-mono text-[10px] tracking-widest text-ember">
                    CHOSEN
                  </span>
                )}
              </div>
              <p className="text-sm text-parch-dim italic font-serif mb-3 leading-relaxed">
                {c.soul}
              </p>
              <p className="font-mono text-[10px] tracking-wider text-parch-faint">
                {c.path}
              </p>
            </button>
          );
        })}
      </div>

      {hydrated && chosen && (
        <p className="text-center mt-8 font-mono text-[11px] tracking-widest text-parch-faint">
          You walk as {chosen}.{" "}
          <button
            type="button"
            onClick={reset}
            className="underline-offset-4 hover:text-ember hover:underline transition-colors"
          >
            [ unbind ]
          </button>
        </p>
      )}
    </section>
  );
}
