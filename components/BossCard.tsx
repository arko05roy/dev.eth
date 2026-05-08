"use client";
import type { Talk } from "@/lib/types";
import { BOSS_PROSE, RELATED, TALK_BY_ID, THREAD_BY_ID } from "@/lib/talks";
import { XP_PER_TIER } from "@/lib/xp";
import { TIER_GLYPH } from "@/lib/types";
import BrandLogo from "./BrandLogo";
import { useMemo } from "react";

interface Props {
  talk: Talk;
  watched: boolean;
  onToggle: (id: string) => void;
}

// Boss number — derived from the boss's position within all bosses of its act.
// Shown as roman numeral ("BOSS III OF VII · ACT V").
const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI", "XXII", "XXIII", "XXIV", "XXV"];

export default function BossCard({ talk, watched, onToggle }: Props) {
  const boss = BOSS_PROSE[talk.id];
  const related = RELATED[talk.id];

  // Find boss position within its act (memoized once per render)
  const { position, total } = useMemo(() => {
    let pos = 0, count = 0;
    let foundPos = 0;
    // Read TALK_BY_ID values without iterating the giant TALKS array repeatedly
    const allTalks = Object.values(TALK_BY_ID);
    for (const t of allTalks) {
      if (t.act === talk.act && t.tier === "boss") {
        count++;
        if (t.id === talk.id) foundPos = count;
      }
    }
    pos = foundPos;
    return { position: pos, total: count };
  }, [talk.act, talk.id]);

  if (!boss) {
    // Fallback if no hand-written prose exists
    return (
      <article id={talk.id} className="scroll-anchor relative my-6 px-6 py-6 border border-[var(--hairline)] bg-void-50">
        <h3 className="font-serif text-2xl text-parch">{talk.title}</h3>
      </article>
    );
  }

  // First letter for drop cap
  const firstChar = boss.prose.charAt(0);
  const restProse = boss.prose.slice(1);

  return (
    <article
      id={talk.id}
      data-tier="boss"
      className="scroll-anchor relative my-8 group"
    >
      {/* Outer frame: double-rule manuscript treatment */}
      <div className="relative border-t border-b border-[var(--hairline)]">
        {/* Inner accent rule — the gold band */}
        <div className="absolute inset-x-0 top-px h-px bg-gradient-to-r from-transparent via-ember to-transparent opacity-50" aria-hidden />
        <div className="absolute inset-x-0 bottom-px h-px bg-gradient-to-r from-transparent via-ember to-transparent opacity-30" aria-hidden />

        {/* Background atmosphere — warm halo behind glyph, fading to void */}
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          aria-hidden
          style={{
            background: "radial-gradient(circle at 12% 28%, rgba(201,169,110,0.10), transparent 38%)",
          }}
        />

        <div className="relative px-6 sm:px-10 py-10">
          {/* HEADER — boss number + act + watched toggle */}
          <header className="flex items-baseline justify-between mb-6">
            <p className="font-mono text-[10px] tracking-[0.2em] text-ember">
              ✦ BOSS {position > 0 ? ROMAN[position] : ""} {total > 0 ? `OF ${ROMAN[total]}` : ""} · ACT {talk.act}
            </p>
            <button
              type="button"
              onClick={() => onToggle(talk.id)}
              aria-pressed={watched}
              aria-label={watched ? `Mark unwatched: ${talk.title}` : `Strike down: ${talk.title}`}
              className="font-mono text-[10px] tracking-[0.2em] text-parch-faint hover:text-ember transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-void"
            >
              {watched ? "[ STRUCK DOWN ]" : "[ MARK SLAIN ]"}
            </button>
          </header>

          {/* MAIN — illuminated glyph + boss name + talk title */}
          <div className="grid grid-cols-[auto_1fr] gap-x-6 sm:gap-x-10 items-start">
            {/* Illuminated capital — Greek glyph, ember-on-void, on a faint halo */}
            <div className="relative shrink-0">
              <span
                aria-hidden
                className="block font-serif text-[110px] sm:text-[150px] leading-none text-ember"
                style={{
                  textShadow: "0 0 28px rgba(201,169,110,0.18), 0 0 60px rgba(201,169,110,0.08)",
                }}
              >
                {TIER_GLYPH.boss}
              </span>
              {/* Sub-tag under glyph */}
              <p className="mt-2 font-mono text-[9px] tracking-[0.25em] text-parch-faint text-center">
                PHI · BOSS
              </p>
            </div>

            <div className="min-w-0 pt-2 sm:pt-4">
              {/* Boss name — the chosen epithet */}
              <h2 className="font-serif text-3xl sm:text-5xl leading-[1.05] text-parch">
                <span className="italic">{boss.name}</span>
              </h2>
              {/* Talk title — actual archive title, smaller, italic */}
              <p className="mt-3 font-serif italic text-base sm:text-lg text-parch-dim leading-snug">
                <span className="text-parch-faint">— </span>{talk.title}
              </p>

              {/* Speaker + brand + edition */}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] tracking-[0.18em] text-parch-faint">
                {talk.source === "devcon" ? (
                  <span>DEVCON {talk.ed}</span>
                ) : (
                  <span>{talk.event?.toUpperCase()}</span>
                )}
                {talk.speakers.length > 0 && (
                  <span className="text-parch-ghost">·  {talk.speakers.join(" · ")}</span>
                )}
                {talk.brand && (
                  <span className="inline-flex items-center gap-1.5">
                    <BrandLogo slug={talk.brand} size={12} /> <span>·</span>
                  </span>
                )}
                {talk.hasTranscript && <span className="text-parch-ghost">⌜TRANSCRIPT⌝</span>}
              </div>
            </div>
          </div>

          {/* PROSE — drop cap on first letter */}
          <div className="mt-8 max-w-2xl">
            <p className="font-serif text-[15px] sm:text-base leading-[1.7] text-parch-dim">
              <span
                className="float-left mr-2 mt-1 font-serif font-medium text-ember leading-none"
                style={{ fontSize: "3.2em" }}
                aria-hidden
              >
                {firstChar}
              </span>
              {restProse}
            </p>
          </div>

          {/* RUNE BLOCK — the ceremonial extraction */}
          <div className="mt-10 relative">
            {/* Hairline separator with corner ornament */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-ember font-serif text-xs leading-none" aria-hidden>✦</span>
              <div className="flex-1 h-px bg-gradient-to-r from-ember/40 via-[var(--hairline)] to-transparent" />
              <p className="font-mono text-[9px] tracking-[0.3em] text-ember whitespace-nowrap">
                WHAT YOU TAKE FROM THIS FIGHT
              </p>
              <div className="flex-1 h-px bg-gradient-to-l from-ember/40 via-[var(--hairline)] to-transparent" />
              <span className="text-ember font-serif text-xs leading-none" aria-hidden>✦</span>
            </div>

            {/* The rune itself — extract the italicized noun, render it as monumental display */}
            <RuneCallout rune={boss.rune} />
          </div>

          {/* THREADS — kin paths */}
          {talk.threads && talk.threads.length > 0 && (
            <div className="mt-10 pt-6 border-t border-[var(--hairline)]">
              <p className="font-mono text-[9px] tracking-[0.3em] text-parch-faint mb-3">
                THIS BOSS BELONGS TO
              </p>
              <div className="flex flex-wrap gap-1.5">
                {talk.threads.map((tid) => {
                  const th = THREAD_BY_ID[tid];
                  if (!th) return null;
                  return (
                    <span
                      key={tid}
                      className="font-mono text-[10px] tracking-wider text-parch-faint border border-[var(--hairline)] hover:border-ember hover:text-ember transition-colors px-2 py-0.5"
                    >
                      {th.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* RELATED — kin bosses to seek */}
          {related && related.length > 0 && (
            <div className="mt-8 pt-6 border-t border-[var(--hairline)]">
              <p className="font-mono text-[9px] tracking-[0.3em] text-parch-faint mb-3">
                IF THIS BOSS STRUCK YOU, SEEK
              </p>
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                {related.map((r) => {
                  const rt = TALK_BY_ID[r.id];
                  return (
                    <li key={r.id} className="text-[12px] leading-snug">
                      <a
                        href={`#${r.id}`}
                        className="text-parch-dim hover:text-ember transition-colors block"
                      >
                        <span className="font-mono text-[10px] text-parch-faint mr-2">D{r.ed} · {TIER_GLYPH[rt?.tier ?? r.tier]}</span>
                        <span className="font-serif italic">{r.title}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* FOOTER — links + XP */}
          <footer className="mt-10 pt-5 border-t border-[var(--hairline)] flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] tracking-widest">
            <a
              href={talk.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-parch-faint hover:text-ember transition-colors underline-offset-4 hover:underline"
            >
              ARCHIVE
            </a>
            {talk.yt && (
              <a
                href={`https://youtu.be/${talk.yt}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-parch-faint hover:text-ember transition-colors underline-offset-4 hover:underline"
              >
                YOUTUBE
              </a>
            )}
            <span className="ml-auto text-ember">+{XP_PER_TIER.boss} XP</span>
          </footer>
        </div>
      </div>
    </article>
  );
}

// Render the "rune of *X*" line with the noun extracted into a monumental italic display
function RuneCallout({ rune }: { rune: string }) {
  // Match "the rune of *X*" or "the rune of *X*. ..." — extract the asterisk-italic noun
  const m = rune.match(/the rune of \*([^*]+)\*\.?\s*(.*)/i);
  if (!m) {
    // Fallback: just render the rune string as-is, with bold italic emphasis
    return (
      <p className="font-serif text-2xl italic text-ember leading-tight max-w-2xl">{rune}</p>
    );
  }
  const noun = m[1];
  const rest = m[2]?.trim();
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-[11px] tracking-[0.2em] text-parch-faint mb-2">
        the rune of
      </p>
      <p className="font-serif italic text-5xl sm:text-7xl leading-[1.0] text-ember mb-4">
        {noun}
      </p>
      {rest && (
        <p className="font-serif text-[14px] leading-relaxed text-parch-dim italic">
          {rest}
        </p>
      )}
    </div>
  );
}
