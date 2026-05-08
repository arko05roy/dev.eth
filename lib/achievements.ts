import type { Talk } from "./types";

export interface Achievement {
  id: string;
  name: string;
  glyph: string; // Greek
  hint: string;        // Shown when locked
  flavor: string;      // Shown when unlocked
  hidden?: boolean;    // Don't show name when locked
  check: (ctx: AchCtx) => boolean;
}

export interface AchCtx {
  watched: Set<string>;
  talks: Talk[];
  classChosen?: string;
  streak: number;
}

function countWhere(ctx: AchCtx, fn: (t: Talk) => boolean): number {
  let n = 0;
  for (const t of ctx.talks) if (ctx.watched.has(t.id) && fn(t)) n++;
  return n;
}

function totalWhere(ctx: AchCtx, fn: (t: Talk) => boolean): number {
  let n = 0;
  for (const t of ctx.talks) if (fn(t)) n++;
  return n;
}

function pctOf(ctx: AchCtx, fn: (t: Talk) => boolean): number {
  const total = totalWhere(ctx, fn);
  if (total === 0) return 0;
  return countWhere(ctx, fn) / total;
}

export const ACHIEVEMENTS: Achievement[] = [
  // First contact
  { id: "first-flame", name: "First Flame", glyph: "α",
    hint: "Mark anything watched.",
    flavor: "The first sermon. The fire takes.",
    check: (c) => c.watched.size >= 1 },
  { id: "first-boss", name: "First Boss", glyph: "Φ",
    hint: "Strike down a Boss.",
    flavor: "A god has fallen. The runes are yours.",
    check: (c) => countWhere(c, t => t.tier === "boss") >= 1 },

  // Per-Act completionists (Foundation tier — bosses + main)
  { id: "mire-walker",     name: "Walker of the Mire",        glyph: "Α",
    hint: "Complete every Boss and Main Quest of the Genesis Mire.",
    flavor: "You walked where Vitalik first stood. The sapling remembers.",
    check: (c) => pctOf(c, t => t.act === "I" && (t.tier === "boss" || t.tier === "main")) >= 1.0 },
  { id: "substrate-walker", name: "Walker of the Substrate",  glyph: "Β",
    hint: "Complete every Boss and Main of the Substrate Sanctum.",
    flavor: "The bytecode no longer hides from you.",
    check: (c) => pctOf(c, t => t.act === "II" && (t.tier === "boss" || t.tier === "main")) >= 1.0 },
  { id: "market-walker",    name: "Walker of the Markets",    glyph: "Γ",
    hint: "Complete every Boss and Main of the Markets of the Dead.",
    flavor: "The dark forest has shown you its accounting.",
    check: (c) => pctOf(c, t => t.act === "III" && (t.tier === "boss" || t.tier === "main")) >= 1.0 },
  { id: "engine-walker",    name: "Walker of the Engine",     glyph: "Δ",
    hint: "Complete every Boss and Main of the Engine Room.",
    flavor: "You hear the slot's tick from a long way off.",
    check: (c) => pctOf(c, t => t.act === "IV" && (t.tier === "boss" || t.tier === "main")) >= 1.0 },
  { id: "frontier-walker",  name: "Walker of the Frontier",   glyph: "Ε",
    hint: "Complete every Boss and Main of the Frontier.",
    flavor: "The math no longer hides behind its symbols.",
    check: (c) => pctOf(c, t => t.act === "V" && (t.tier === "boss" || t.tier === "main")) >= 1.0 },
  { id: "endgame-walker",   name: "Walker of the Endgame",    glyph: "Ζ",
    hint: "Complete every Boss and Main of the Endgame.",
    flavor: "The Lands of Reeds know your name.",
    check: (c) => pctOf(c, t => t.act === "VI" && (t.tier === "boss" || t.tier === "main")) >= 1.0 },

  // Class arcs
  { id: "magus-rises",      name: "The Magus Rises",     glyph: "Ψ",
    hint: "As the Magus, complete the ZK depth of the Frontier.",
    flavor: "You bend math into proof. The world is a circuit.",
    check: (c) => c.classChosen === "The Magus" && pctOf(c, t => t.act === "V" && (t.tier === "boss" || t.tier === "main")) >= 0.7 },
  { id: "sellsword-fed",    name: "The Sellsword's Hunger", glyph: "Ξ",
    hint: "As the Sellsword, complete the Markets of the Dead.",
    flavor: "You take what is not bolted down. Even the bolts.",
    check: (c) => c.classChosen === "The Sellsword" && pctOf(c, t => t.act === "III" && (t.tier === "boss" || t.tier === "main")) >= 1.0 },
  { id: "warden-keeps",     name: "The Warden Keeps",    glyph: "Λ",
    hint: "As the Warden, complete the Engine Room.",
    flavor: "Every slot. Every block. Every validator. None forgotten.",
    check: (c) => c.classChosen === "The Warden" && pctOf(c, t => t.act === "IV" && (t.tier === "boss" || t.tier === "main")) >= 1.0 },
  { id: "architect-draws",  name: "The Architect Draws",  glyph: "Π",
    hint: "As the Architect, master the Frontier and Engine Room.",
    flavor: "You design the next protocol. Stones placed in their order.",
    check: (c) => c.classChosen === "The Architect" && pctOf(c, t => t.act === "V" && (t.tier === "boss" || t.tier === "main")) >= 1.0 && pctOf(c, t => t.act === "IV" && t.tier === "boss") >= 0.7 },
  { id: "smith-tempered",   name: "The Smith Tempered",   glyph: "Θ",
    hint: "As the Smith, master the Substrate Sanctum.",
    flavor: "Your contracts hold. Even when the chain does not.",
    check: (c) => c.classChosen === "The Smith" && pctOf(c, t => t.act === "II" && (t.tier === "boss" || t.tier === "main")) >= 1.0 },

  // Topical
  { id: "all-bosses",       name: "Slayer of Demigods",   glyph: "Φ⁺",
    hint: "Strike down every Boss in every Land.",
    flavor: "Seventy-two demigods. Each one fell.",
    check: (c) => pctOf(c, t => t.tier === "boss") >= 1.0 },
  { id: "polyglot",         name: "Polyglot",             glyph: "λ",
    hint: "Watch talks from at least 50 distinct speakers.",
    flavor: "You have heard fifty voices. Each shaped you.",
    check: (c) => {
      const speakers = new Set<string>();
      for (const t of c.talks) {
        if (c.watched.has(t.id)) for (const s of t.speakers) speakers.add(s);
      }
      return speakers.size >= 50;
    } },
  { id: "decade-witness",   name: "Decade Witness",       glyph: "δ",
    hint: "Watch at least one talk from every Devcon (0–7).",
    flavor: "Ten years pressed into your eyes.",
    check: (c) => {
      const eds = new Set<number>();
      for (const t of c.talks) if (c.watched.has(t.id)) eds.add(t.ed);
      return [0,1,2,3,4,5,6,7].every(e => eds.has(e));
    } },
  { id: "century",          name: "Century",              glyph: "ϵ",
    hint: "100 talks watched.",
    flavor: "A hundred sermons. The shape of the protocol begins to settle.",
    check: (c) => c.watched.size >= 100 },
  { id: "gross",            name: "Three Score and Twelve", glyph: "ξ",
    hint: "250 talks watched.",
    flavor: "You are a stranger here no longer.",
    check: (c) => c.watched.size >= 250 },
  { id: "thousand",         name: "Of Thousands",         glyph: "η",
    hint: "1000 talks watched.",
    flavor: "Most who claim mastery have not watched a tenth as much.",
    check: (c) => c.watched.size >= 1000 },

  // Topic specialists (heuristic on tags/titles in flavor)
  { id: "reentrant",        name: "Reentrant",            glyph: "↻",
    hint: "Watch every talk that names reentrancy or the call's wound.",
    flavor: "The first vulnerability the field gave a name. You know its shape.",
    check: (c) => {
      const matches = c.talks.filter(t => /reentran|call\.|fallback|withdraw pattern/i.test(t.title + " " + t.desc));
      return matches.length > 0 && matches.every(t => c.watched.has(t.id));
    } },
  { id: "cypherpunk-vow",   name: "Cypherpunk Vow",       glyph: "Σ¬",
    hint: "Complete the privacy thread of the Endgame.",
    flavor: "You took the old vow. You will keep it.",
    check: (c) => {
      const priv = c.talks.filter(t => t.act === "VI" && /privacy|cypherpunk|anonym|tor|mix|shielded/i.test(t.title + " " + t.flavor));
      return priv.length >= 5 && priv.every(t => c.watched.has(t.id));
    } },
  { id: "consensus-keeper", name: "Keeper of Consensus",  glyph: "Δ²",
    hint: "Watch every Casper-named talk across all Devcons.",
    flavor: "Casper is no longer friendly to you. It is familiar.",
    check: (c) => {
      const casper = c.talks.filter(t => /casper/i.test(t.title));
      return casper.length > 0 && casper.every(t => c.watched.has(t.id));
    } },

  // Streak
  { id: "vigil",            name: "Vigil",                glyph: "τ",
    hint: "A streak of 7 consecutive days.",
    flavor: "Seven days. The path knows your step.",
    check: (c) => c.streak >= 7 },
  { id: "long-vigil",       name: "Long Vigil",           glyph: "Τ",
    hint: "A streak of 30 consecutive days.",
    flavor: "Thirty days. The path knows your name.",
    check: (c) => c.streak >= 30 },

  // Apocrypha (ETHGlobal)
  { id: "apocrypha-init",   name: "Apocrypha Initiate",   glyph: "א",
    hint: "Read 10 of the Hackathon Halls' apocryphal scrolls.",
    flavor: "Not all wisdom is canonical.",
    check: (c) => countWhere(c, t => (t as Talk & { source?: string }).source === "ethglobal") >= 10 },
  { id: "pragma-walker",    name: "Pragmatist",           glyph: "π",
    hint: "Walk a full Pragma summit.",
    flavor: "The single track. The clearest hour. You took it whole.",
    check: (c) => {
      const evs: Record<string, Talk[]> = {};
      for (const t of c.talks) {
        const event = (t as Talk & { event?: string; eg_track?: string }).event;
        const track = (t as Talk & { eg_track?: string }).eg_track;
        if (track === "PRAGMA" && event) (evs[event] ||= []).push(t);
      }
      return Object.values(evs).some(list => list.length >= 4 && list.every(t => c.watched.has(t.id)));
    } },

  // Hidden / secret
  { id: "chronicler",       name: "Chronicler",           glyph: "?",
    hidden: true,
    hint: "...",
    flavor: "You read what most refuse. You found names no one will name again.",
    check: (c) => countWhere(c, t => t.tier === "chronicle") >= 100 },
  { id: "the-vow-spoken",   name: "The Vow Spoken",       glyph: "?",
    hidden: true,
    hint: "...",
    flavor: "You named yourself. The path heard.",
    check: () => false }, // unlocked elsewhere when user sets a custom Tarnished name
];

export function evaluateAchievements(ctx: AchCtx, alreadyUnlocked: Set<string>): { newly: Achievement[]; total: number } {
  const newly: Achievement[] = [];
  for (const a of ACHIEVEMENTS) {
    if (alreadyUnlocked.has(a.id)) continue;
    try {
      if (a.check(ctx)) newly.push(a);
    } catch { /* ignore */ }
  }
  return { newly, total: ACHIEVEMENTS.length };
}
