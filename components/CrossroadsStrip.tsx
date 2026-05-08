"use client";
import type { Crossroad } from "@/lib/protocols";
import BrandLogo from "./BrandLogo";

interface Props {
  crossroads: Crossroad[];
  selfName: string;
}

export default function CrossroadsStrip({ crossroads, selfName }: Props) {
  if (!crossroads || crossroads.length === 0) return null;
  // Take the top 12 strongest connections to keep the strip readable.
  const top = crossroads.slice(0, 12);

  return (
    <section className="pt-12 pb-4 border-t hairline">
      <p className="font-mono text-[10px] tracking-[0.3em] text-parch-faint mb-2">
        ── THE CROSSROADS · {crossroads.length} GUILD{crossroads.length === 1 ? "" : "S"} CONNECTED ──
      </p>
      <p className="prose-read italic text-[13px] mb-5 max-w-2xl">
        Where {selfName}'s name appears in another guild's talks. The world is sprawling — these are the paths between.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {top.map((c) => (
          <a
            key={c.otherSlug}
            href={`/protocols/${c.otherSlug}`}
            className="group flex items-center gap-3 px-4 py-3 border border-[var(--hairline)] hover:border-ember bg-void-50/30 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-void"
          >
            <BrandLogo slug={c.otherSlug} size={20} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[10px] text-parch-ghost" aria-hidden>⟶</span>
                <span className="font-serif text-base text-parch group-hover:text-ember transition-colors truncate">
                  {c.otherName}
                </span>
              </div>
              <p className="font-mono text-[10px] tracking-widest text-parch-faint mt-0.5">
                {c.talks.length} TALK{c.talks.length === 1 ? "" : "S"}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
