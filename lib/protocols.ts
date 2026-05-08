import type { Talk, Brand } from "./types";
import { TALKS, BRANDS } from "./talks";

// ---------------------------------------------------------------------------
// Runtime brand classifier
// ---------------------------------------------------------------------------
// `talk.brand` is set by an offline pipeline against a curated brands list and
// misses many real protocols mentioned in talk titles. We close the gap at
// module-load by scanning every untagged title against the (now expanded)
// BRANDS table plus a small ALIASES map. Pre-tagged brands win; detected ones
// fill in. Result: EFFECTIVE_BRAND_BY_TALK_ID.

// Canonical aliases — surface forms that should fold into another slug.
const ALIASES: Record<string, string> = {
  "matic": "polygon",
  "matic network": "polygon",
  "polygon zkevm": "polygon",
  "cairo": "starknet",
  "sway": "fuel",
  "fevm": "filecoin",
  "fvm": "filecoin",
  "fil": "filecoin",
  "subgraphs": "the-graph",
  "subgraph": "the-graph",
  "graph": "the-graph",
  "buidler": "hardhat",
  "veedo": "starknet",
  "danksharding": "celestia",
  "scaffold": "scaffold-eth",
  "scaffold-eth-2": "scaffold-eth",
  "pantheon": "ethereumjs",
  "gnosis chain": "gnosis",
  "gnosis-chain": "gnosis",
  "gnosis pay": "gnosis",
  "gnosis-pay": "gnosis",
  "router protocol": "router",
  "kaia": "klaytn",
  "rootstocks": "rootstock",
  "celo's": "celo",
  "cronos chain": "cronos",
  "cronos play": "cronos",
  "ens domains": "ens",
  "metamask wallet": "metamask",
  "world id": "world-id",
  "worldid": "world-id",
  "0g labs": "0g",
  "yellow network": "yellow",
  "cow swap": "cowswap",
  "cow protocol": "cowswap",
  "the graph": "the-graph",
  "interplanetary consensus": "ipc",
  "instadapp smart wallet": "instadapp",
  "router": "router",
};

// Slugs short or ambiguous enough to over-match. Excluded from title scans.
const CLASSIFIER_STOPLIST = new Set<string>([
  "eth", "pos", "dao", "nft", "evm", "rpc", "ai", "zk", "fe",
  "arc", "mode", "self", "loot", "circles", "loot", "consensus",
]);

interface BrandPattern {
  slug: string;            // canonical slug (after alias resolution)
  pattern: RegExp;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildClassifier(): BrandPattern[] {
  const entries: { surface: string; canonical: string }[] = [];

  for (const slug of Object.keys(BRANDS)) {
    if (CLASSIFIER_STOPLIST.has(slug)) continue;
    const brand = BRANDS[slug];
    entries.push({ surface: slug.replace(/-/g, " "), canonical: slug });
    entries.push({ surface: brand.name, canonical: slug });
  }
  for (const [surface, canonical] of Object.entries(ALIASES)) {
    entries.push({ surface, canonical });
  }

  // Longest-first so "the graph" beats "graph", "polygon zkevm" beats "polygon".
  entries.sort((a, b) => b.surface.length - a.surface.length);

  const seen = new Set<string>();
  const out: BrandPattern[] = [];
  for (const e of entries) {
    const key = e.surface.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    if (key.length < 2) continue;
    out.push({
      slug: e.canonical,
      pattern: new RegExp(`(?:^|[^\\w])${escapeRegex(key)}(?:$|[^\\w])`, "i"),
    });
  }
  return out;
}

const CLASSIFIER = buildClassifier();

function detectBrand(title: string): string | null {
  const lower = ` ${title.toLowerCase()} `;
  for (const { slug, pattern } of CLASSIFIER) {
    if (pattern.test(lower)) return slug;
  }
  return null;
}

// Effective brand per talk: pre-tagged wins, otherwise classify from title.
export const EFFECTIVE_BRAND_BY_TALK_ID: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const t of TALKS) {
    if (t.brand && BRANDS[t.brand]) { m[t.id] = t.brand; continue; }
    const detected = detectBrand(t.title || "");
    if (detected && BRANDS[detected]) m[t.id] = detected;
  }
  return m;
})();

export interface ProtocolSummary {
  slug: string;
  brand: Brand;
  count: number;
  devcon: number;
  ethglobal: number;
  firstYear: number;
  lastYear: number;
}

export interface RoadmapStage {
  id: "theory" | "patterns" | "application";
  title: string;
  blurb: string;
  talks: Talk[];
}

export interface Hall {
  name: string;
  blurb: string;
  talks: Talk[];
}

export interface Crossroad {
  otherSlug: string;
  otherName: string;
  talks: Talk[];
}

export interface ProtocolRoadmap {
  slug: string;
  brand: Brand;
  total: number;
  stages: RoadmapStage[];
  halls?: Hall[];           // LLM-clustered (from guild-halls.json)
  crossroads?: Crossroad[]; // deterministic — talks that mention another guild
}

// LLM-derived halls (loaded once, gracefully empty if artifact missing).
let _guildHalls: Record<string, { halls: Array<{ name: string; blurb: string; talkIds: string[] }> }> | null = null;
function loadGuildHalls() {
  if (_guildHalls !== null) return _guildHalls;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _guildHalls = require("./guild-halls.json");
  } catch {
    _guildHalls = {};
  }
  return _guildHalls!;
}

// Build summaries once at module load.
export const PROTOCOLS: ProtocolSummary[] = (() => {
  const counts: Record<string, Talk[]> = {};
  for (const t of TALKS) {
    const slug = EFFECTIVE_BRAND_BY_TALK_ID[t.id];
    if (!slug) continue;
    (counts[slug] ||= []).push(t);
  }
  const out: ProtocolSummary[] = [];
  for (const slug of Object.keys(counts)) {
    const brand = BRANDS[slug];
    if (!brand) continue;
    const list = counts[slug];
    let dev = 0, eg = 0, first = Infinity, last = -Infinity;
    for (const t of list) {
      if (t.source === "ethglobal") eg++; else dev++;
      const y = yearOf(t);
      if (y < first) first = y;
      if (y > last) last = y;
    }
    out.push({
      slug,
      brand,
      count: list.length,
      devcon: dev,
      ethglobal: eg,
      firstYear: isFinite(first) ? first : 0,
      lastYear: isFinite(last) ? last : 0,
    });
  }
  out.sort((a, b) => b.count - a.count || a.brand.name.localeCompare(b.brand.name));
  return out;
})();

export const PROTOCOL_BY_SLUG: Record<string, ProtocolSummary> = (() => {
  const m: Record<string, ProtocolSummary> = {};
  for (const p of PROTOCOLS) m[p.slug] = p;
  return m;
})();

const TIER_RANK: Record<string, number> = { boss: 0, main: 1, side: 2, chronicle: 3 };

function yearOf(t: Talk): number {
  // Devcon: ed 0..7 → 2014..2024 roughly; we don't have year, so derive from event string
  const m = (t.event || "").match(/(20\d{2})/);
  if (m) return parseInt(m[1], 10);
  // Devcon 0..7 → 2014..2024 (uneven). Best-effort fallback.
  const dev = [2014, 2015, 2016, 2017, 2018, 2019, 2022, 2023, 2024];
  if (t.source === "devcon" && t.ed >= 0 && t.ed < dev.length) return dev[t.ed];
  return 0;
}

function isTheoryTalk(t: Talk): boolean {
  if (t.source === "devcon") return t.tier === "boss" || t.tier === "main";
  const tr = (t.eg_track || "").toUpperCase();
  return tr === "KEYNOTE" || tr === "LECTURE" || tr === "PRAGMA";
}

function isApplicationTalk(t: Talk): boolean {
  if (t.source === "devcon") return false;
  const tr = (t.eg_track || "").toUpperCase();
  if (tr === "WORKSHOP" || tr === "SPONSOR") return true;
  return /workshop|build|how to|tutorial|hack/i.test(t.title);
}

export function buildRoadmap(slug: string): ProtocolRoadmap | null {
  const summary = PROTOCOL_BY_SLUG[slug];
  if (!summary) return null;

  const talks = TALKS.filter((t) => EFFECTIVE_BRAND_BY_TALK_ID[t.id] === slug);

  const theory: Talk[] = [];
  const application: Talk[] = [];
  const patterns: Talk[] = [];

  for (const t of talks) {
    if (isApplicationTalk(t)) application.push(t);
    else if (isTheoryTalk(t)) theory.push(t);
    else patterns.push(t);
  }

  const sortAsc = (a: Talk, b: Talk) => {
    const ya = yearOf(a), yb = yearOf(b);
    if (ya !== yb) return ya - yb;
    return (TIER_RANK[a.tier] ?? 9) - (TIER_RANK[b.tier] ?? 9);
  };
  const sortDesc = (a: Talk, b: Talk) => {
    const ya = yearOf(a), yb = yearOf(b);
    if (ya !== yb) return yb - ya;
    return (TIER_RANK[a.tier] ?? 9) - (TIER_RANK[b.tier] ?? 9);
  };

  theory.sort(sortAsc);
  patterns.sort(sortAsc);
  application.sort(sortDesc);

  const stages: RoadmapStage[] = ([
    {
      id: "theory" as const,
      title: "Foundations",
      blurb: "What the protocol is, why it exists, what problem it claims. Keynotes and lectures, oldest first — start where the story starts.",
      talks: theory,
    },
    {
      id: "patterns" as const,
      title: "Patterns",
      blurb: "Case studies, panels, side quests. How others have used it, what broke, what stuck.",
      talks: patterns,
    },
    {
      id: "application" as const,
      title: "Application",
      blurb: "Workshops and sponsor builds. Pick one and build something. Newest first — the SDK has changed.",
      talks: application,
    },
  ] satisfies RoadmapStage[]).filter((s) => s.talks.length > 0);

  // Halls — LLM-clustered, optional
  const halls = buildHalls(slug, talks);

  // Crossroads — deterministic. For every talk in this guild, scan its title/desc for
  // mentions of OTHER guilds. Group by the other guild.
  const crossroads = buildCrossroads(slug, talks);

  return {
    slug,
    brand: summary.brand,
    total: talks.length,
    stages,
    halls,
    crossroads,
  };
}

function buildHalls(slug: string, talks: Talk[]): Hall[] | undefined {
  const data = loadGuildHalls()[slug];
  if (!data || !data.halls || data.halls.length === 0) return undefined;
  const byId: Record<string, Talk> = {};
  for (const t of talks) byId[t.id] = t;
  const halls: Hall[] = [];
  for (const h of data.halls) {
    const hallTalks = h.talkIds.map((id) => byId[id]).filter(Boolean);
    if (hallTalks.length === 0) continue;
    halls.push({ name: h.name, blurb: h.blurb, talks: hallTalks });
  }
  return halls.length > 0 ? halls : undefined;
}

function buildCrossroads(slug: string, talks: Talk[]): Crossroad[] {
  // Build a regex that matches any other guild name (longest first to avoid sub-match).
  const others = PROTOCOLS.filter((p) => p.slug !== slug);
  const groupedByOther: Record<string, Talk[]> = {};

  for (const t of talks) {
    const hay = `${t.title || ""} ${t.desc || ""}`.toLowerCase();
    for (const p of others) {
      const name = p.brand.name.toLowerCase();
      const slugForm = p.slug.replace(/-/g, " ");
      // Match name or slug-with-spaces, word-boundary safe.
      const re = new RegExp(`(?:^|[^\\w])(?:${escapeRegex(name)}|${escapeRegex(slugForm)})(?:$|[^\\w])`);
      if (re.test(` ${hay} `)) {
        if (EFFECTIVE_BRAND_BY_TALK_ID[t.id] === p.slug) continue; // it's that guild's own talk
        (groupedByOther[p.slug] ||= []).push(t);
      }
    }
  }

  const out: Crossroad[] = [];
  for (const otherSlug of Object.keys(groupedByOther)) {
    const otherSummary = PROTOCOL_BY_SLUG[otherSlug];
    if (!otherSummary) continue;
    out.push({ otherSlug, otherName: otherSummary.brand.name, talks: groupedByOther[otherSlug] });
  }
  // Sort by talk count desc — strongest connections first.
  out.sort((a, b) => b.talks.length - a.talks.length);
  return out;
}
