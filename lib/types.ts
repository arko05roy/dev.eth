export type Tier = "boss" | "main" | "side" | "chronicle";
export type ActId = "I" | "II" | "III" | "IV" | "V" | "VI";

export type Source = "devcon" | "ethglobal";

export interface Brand {
  name: string;
  domain: string;
  kind: string;
}

export interface Thread {
  id: string;
  act: ActId;
  name: string;
  blurb: string;
  talkIds: string[];
  count: number;
}

export interface Talk {
  id: string;
  ed: number;            // Devcon edition (-1 for ethglobal)
  title: string;
  type: string;
  speakers: string[];
  url: string;
  yt: string;
  act: ActId;
  tier: Tier;
  flavor: string;
  desc: string;
  prologue: string;
  hasTranscript: boolean;
  source: Source;
  event: string;          // "Devcon 6" or "Pragma Cannes 2025"
  eg_track?: string;      // PRAGMA | WORKSHOP | LECTURE | PANEL | KEYNOTE | SPONSOR
  duration?: number;      // seconds (ethglobal only)
  brand?: string;         // brand slug if a sponsor brand was detected
  threads?: string[];     // thread IDs this talk belongs to
}

export interface Speaker {
  id: string;
  name: string;
  twitter?: string;
  github?: string;
  company?: string;
  bio?: string;
  talks: string[];
  count: number;
}

export interface RelatedTalk {
  id: string;
  title: string;
  ed: number;
  tier: Tier;
}

export interface BossProse {
  name: string;
  prose: string;
  rune: string;
}

export interface ActMeta {
  id: ActId;
  glyph: string; // Greek letter
  index: number;
  title: string;
  subtitle: string;
  land: string;
  mood: string;
  prereq: string;
  runes: string;
}

// Tier glyph mapping (Greek)
export const TIER_GLYPH: Record<Tier, string> = {
  boss: "Φ",       // Phi — boss
  main: "Μ",       // Mu — main
  side: "Σ",       // Sigma — side
  chronicle: "Χ",  // Chi — chronicle
};

export const TIER_LABEL: Record<Tier, string> = {
  boss: "Boss",
  main: "Main Quest",
  side: "Side Quest",
  chronicle: "Chronicle",
};
