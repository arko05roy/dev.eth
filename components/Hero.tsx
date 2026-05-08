"use client";
import { TOTAL_TALKS, TALKS, THREADS } from "@/lib/talks";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { useEffect, useState } from "react";

export default function Hero() {
  const [counts] = useState(() => {
    let dev = 0, eg = 0;
    const events = new Set<string>();
    for (const t of TALKS) {
      if (t.source === "ethglobal") { eg++; events.add(t.event); } else dev++;
    }
    return { dev, eg, events: events.size, threads: THREADS.length, total: TOTAL_TALKS, ach: ACHIEVEMENTS.length };
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <main className="relative min-h-[calc(100vh-3rem)] overflow-hidden bg-void text-parch">
      {/* ── Atmospherics ── */}
      <BackgroundLayers />

      {/* ── Massive ghost glyph behind everything ── */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 flex items-center justify-end pr-[5vw] transition-opacity duration-1000 ${mounted ? "opacity-100" : "opacity-0"}`}
      >
        <div className="font-serif text-ember/[0.06] leading-none select-none" style={{ fontSize: "min(64vw, 70vh)" }}>
          Δ
        </div>
      </div>

      {/* ── Editorial top-strip: vertical date marginalia + ledger ── */}
      <div className="absolute left-3 sm:left-6 top-16 hidden sm:flex flex-col items-center gap-3 pointer-events-none">
        <span className="font-mono text-[9px] tracking-[0.4em] text-ember rotate-180" style={{ writingMode: "vertical-rl" }}>
          MMXIV — MMXXVI
        </span>
        <span className="h-24 w-px bg-gradient-to-b from-ember/60 to-transparent" />
      </div>

      {/* ── Main content ── */}
      <section className="relative z-10 px-6 sm:px-16 lg:px-20 pt-16 sm:pt-24 pb-20 max-w-[1400px] mx-auto">
        {/* HEADLINE — single line, centered */}
        <div className={`text-center transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
          <h1 className="font-serif leading-none tracking-[-0.03em] text-parch whitespace-nowrap text-[clamp(4.5rem,18vw,18rem)]">
            dev<span className="italic font-light text-ember">.</span>eth
          </h1>
        </div>

        {/* TAGLINE — centered, beneath the wordmark */}
        <div className={`mt-8 sm:mt-12 text-center transition-all duration-700 delay-150 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
          <p className="font-serif italic text-xl sm:text-3xl text-parch leading-[1.3] max-w-3xl mx-auto">
            every talk, every workshop, every ecosystem
            <br className="hidden sm:block" />
            <span className="text-ember"> on ethereum.</span>
          </p>
        </div>

        {/* CTA + alt — centered */}
        <div className={`mt-12 sm:mt-16 flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-stretch justify-center transition-all duration-700 delay-300 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
          <a
            href="/path"
            className="group relative inline-flex items-stretch overflow-hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember focus-visible:ring-offset-4 focus-visible:ring-offset-void"
          >
            <span className="flex items-center px-5 py-5 font-mono text-[11px] tracking-[0.32em] text-ember bg-ember/5 border border-ember border-r-0 group-hover:bg-ember group-hover:text-void transition-colors">
              ✦
            </span>
            <span className="flex items-baseline gap-3 px-7 py-5 border border-ember bg-void group-hover:bg-ember group-hover:text-void transition-colors">
              <span className="font-serif italic text-2xl leading-none">Enter the Path</span>
              <span className="font-mono text-[11px] tracking-[0.3em] opacity-60 group-hover:opacity-100 transition-opacity">→</span>
            </span>
          </a>
          <a
            href="/begin"
            className="inline-flex items-center gap-3 px-5 py-5 border border-[var(--hairline)] hover:border-parch-faint transition-colors font-mono text-[11px] tracking-[0.28em] text-parch-faint hover:text-parch focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-void"
          >
            FIRST TIME — BEGIN HERE
          </a>
        </div>

        {/* STAT REEL — bold editorial figures, asymmetric */}
        <div className={`mt-20 sm:mt-32 transition-all duration-700 delay-500 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
          <div className="flex items-baseline gap-6 mb-6">
            <span className="font-mono text-[10px] tracking-[0.32em] text-ember">─── THE LEDGER ───</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-10 gap-x-8 border-t border-[var(--hairline)] pt-10">
            <Stat n={counts.total.toLocaleString()} label="TALKS"      hint="Devcon · ETHGlobal" />
            <Stat n={counts.dev.toLocaleString()}   label="CANON"      hint="Devcon 0 → 7" />
            <Stat n={counts.eg.toLocaleString()}    label="APOCRYPHA"  hint={`${counts.events} events`} />
            <Stat n={counts.threads.toString()}     label="THREADS"    hint="topic paths" />
            <Stat n={counts.ach.toString()}         label="RUNES"      hint="to be earned" />
          </div>
        </div>

        {/* BOTTOM ROW — six act glyphs as a row, big and bold */}
        <div className={`mt-20 sm:mt-28 transition-all duration-700 delay-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
          <div className="border-t border-[var(--hairline)] pt-8">
            <div className="flex items-baseline gap-6 mb-6">
              <span className="font-mono text-[10px] tracking-[0.32em] text-ember">─── SIX LANDS ───</span>
              <span className="font-mono text-[10px] tracking-[0.22em] text-parch-faint hidden sm:inline">FROM GENESIS MIRE TO ENDGAME</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-px bg-[var(--hairline)] border border-[var(--hairline)]">
              {[
                { g: "Α", n: "I",   t: "Genesis Mire" },
                { g: "Β", n: "II",  t: "Substrate" },
                { g: "Γ", n: "III", t: "Markets" },
                { g: "Δ", n: "IV",  t: "Engine Room" },
                { g: "Ε", n: "V",   t: "Frontier" },
                { g: "Ζ", n: "VI",  t: "Endgame" },
              ].map((a) => (
                <a
                  key={a.n}
                  href={`/path#act-${a.n}`}
                  className="group bg-void hover:bg-void-50 transition-colors px-4 py-6 sm:py-8 flex flex-col items-center gap-2"
                >
                  <span className="font-serif text-5xl sm:text-6xl text-ember leading-none group-hover:text-ember-glow transition-colors">{a.g}</span>
                  <span className="font-mono text-[9px] tracking-[0.3em] text-parch-faint">ACT {a.n}</span>
                  <span className="font-serif italic text-[13px] text-parch group-hover:text-ember transition-colors">{a.t}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ n, label, hint }: { n: string; label: string; hint?: string }) {
  return (
    <div>
      <p className="font-serif text-5xl sm:text-6xl text-parch leading-none tracking-[-0.02em]">
        {n}
      </p>
      <p className="mt-3 font-mono text-[10px] tracking-[0.3em] text-ember">{label}</p>
      {hint && <p className="mt-1 font-mono text-[10px] tracking-[0.18em] text-parch-faint">{hint}</p>}
    </div>
  );
}

function BackgroundLayers() {
  return (
    <>
      {/* Top warm glow */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[80vh] pointer-events-none"
        style={{
          background:
            "radial-gradient(70% 55% at 60% 0%, rgba(212,185,124,0.10) 0%, rgba(212,185,124,0.04) 30%, transparent 70%)",
        }}
      />
      {/* Bottom void deepening */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[40vh] pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.55))" }}
      />
      {/* Grain */}
      <svg
        aria-hidden
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06] mix-blend-screen"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="hero-grain" x="0" y="0" width="160" height="160" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="40" r="0.5" fill="#d4b97c" />
            <circle cx="80" cy="20" r="0.4" fill="#d4b97c" />
            <circle cx="60" cy="90" r="0.5" fill="#d4b97c" />
            <circle cx="140" cy="60" r="0.3" fill="#d4b97c" />
            <circle cx="100" cy="140" r="0.4" fill="#d4b97c" />
            <circle cx="40" cy="160" r="0.5" fill="#d4b97c" />
            <circle cx="160" cy="120" r="0.3" fill="#d4b97c" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grain)" />
      </svg>
      {/* Corner ornaments */}
      <div aria-hidden className="absolute top-4 right-6 sm:top-8 sm:right-10 font-serif text-2xl text-ember/40 pointer-events-none">✦</div>
      <div aria-hidden className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 font-serif text-2xl text-ember/40 pointer-events-none">✦</div>
    </>
  );
}
