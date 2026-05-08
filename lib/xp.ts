import type { Tier } from "./types";

export const XP_PER_TIER: Record<Tier, number> = {
  boss: 100,
  main: 40,
  side: 15,
  chronicle: 5,
};

export interface Level {
  index: number;
  name: string;
  threshold: number;
  flavor: string;
}

// Levels gate flavor only, never content. The Tarnished always wanders freely.
export const LEVELS: Level[] = [
  { index: 0, name: "Tarnished",                threshold: 0,     flavor: "You wake at the gate. Most do not." },
  { index: 1, name: "Wretch",                   threshold: 250,   flavor: "The first hundred sermons have not killed you." },
  { index: 2, name: "Vagabond",                 threshold: 700,   flavor: "You walk a road others abandon." },
  { index: 3, name: "Wanderer",                 threshold: 1500,  flavor: "The Lands no longer surprise you." },
  { index: 4, name: "Astrologer",               threshold: 3000,  flavor: "You read the protocol like stars." },
  { index: 5, name: "Prophet",                  threshold: 6000,  flavor: "You see what the next decade is forming into." },
  { index: 6, name: "Lord of the Path",         threshold: 12000, flavor: "Few have walked this far. None have walked further." },
];

export function levelFromXp(xp: number): { current: Level; next?: Level; pctToNext: number } {
  let current = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.threshold) current = l;
  const next = LEVELS[current.index + 1];
  if (!next) return { current, pctToNext: 100 };
  const span = next.threshold - current.threshold;
  const into = xp - current.threshold;
  return { current, next, pctToNext: Math.min(100, Math.round((into / span) * 100)) };
}
