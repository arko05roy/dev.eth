// Re-runnable audit of the /protocols coverage.
// Usage: node scripts/audit-protocols.mjs
//
// Checks:
//   1. Total brand count + total /protocols pages.
//   2. For a hardcoded list of "famous protocols I'd expect" — pass/fail per name.
//   3. Scans the corpus for unbranded SPONSOR/WORKSHOP titles, surfaces top
//      candidates that have ≥1 mention but no /protocols/[slug] page yet.
//
// If the list at the bottom grows over time, re-run discovery.

import fs from "node:fs";
const ROOT = process.cwd();
const T = JSON.parse(fs.readFileSync(`${ROOT}/lib/talks.json`, "utf8"));
const B = JSON.parse(fs.readFileSync(`${ROOT}/lib/brands.json`, "utf8"));

const brandSlugs = new Set(Object.keys(B).map((s) => s.toLowerCase()));
const brandNames = new Set(Object.values(B).map((b) => b.name.toLowerCase()));

console.log(`Total brands in brands.json: ${Object.keys(B).length}`);
console.log(`Total talks in talks.json:   ${T.length}`);

// 1. Famous-protocol smoke list — must be reachable
const FAMOUS = [
  // L1 / L2 / chains
  "chainlink", "uniswap", "aave", "ens", "the-graph", "lido", "filecoin",
  "polygon", "arbitrum", "optimism", "base", "scroll", "linea", "starknet", "zksync",
  "celestia", "avail", "eigenlayer", "celo", "skale", "fuel", "zora", "boba",
  // newer / user-flagged
  "citrea", "fhenix", "plume", "monad", "aurora", "cartesi", "altlayer",
  "berachain", "hyperliquid", "manta", "movement", "espresso", "symbiotic",
  // wallet / smart account
  "metamask", "safe", "biconomy", "daimo", "argent", "rainbow",
  // DeFi
  "morpho", "pendle", "synthetix", "liquity", "hop",
  // Identity / privacy
  "worldcoin", "self", "lit", "sismo", "world-id",
  // bridges
  "wormhole", "layerzero", "axelar", "across", "stargate", "synapse",
  // tools
  "foundry", "hardhat", "remix", "blockscout", "tenderly", "alchemy",
  // sponsor talk examples user mentioned
  "0g", "yellow", "superfluid", "livepeer",
];

let famousPass = 0, famousFail = 0;
const missing = [];
for (const slug of FAMOUS) {
  if (brandSlugs.has(slug)) famousPass++;
  else { famousFail++; missing.push(slug); }
}
console.log(`\nFamous-protocol smoke test: ${famousPass}/${FAMOUS.length} pass`);
if (missing.length) console.log(`  MISSING: ${missing.join(", ")}`);

// 2. Surface unbranded talks that mention a candidate protocol name (heuristic).
// For each unbranded talk in SPONSOR/WORKSHOP/LECTURE/PRAGMA, extract candidate names
// from "Build with X" / "I X Workshop" / "X Protocol" patterns and aggregate frequencies.
const unbranded = T.filter((t) => {
  if (t.brand && B[t.brand]) return false;
  const tr = (t.eg_track || "").toUpperCase();
  return tr === "SPONSOR" || tr === "WORKSHOP" || tr === "LECTURE" || tr === "KEYNOTE" || tr === "PRAGMA";
});

const PATS = [
  /\bI\s+([A-Z0-9][\w.&'-]+(?:\s+[A-Z0-9][\w.&'-]+){0,2})\s+(?:Workshop|SDK|Track|Bounty)\b/g,
  /\b(?:Build(?:ing)?|Hack(?:ing)?|Develop(?:ing)?|Deploy(?:ing)?)\s+(?:an?\s+\w+\s+)?(?:with|on|using|atop)\s+([A-Z0-9][\w.&'-]+(?:\s+[A-Z0-9][\w.&'-]+){0,1})\b/g,
  /\bIntroducing\s+([A-Z0-9][\w.&'-]+(?:\s+[A-Z0-9][\w.&'-]+){0,1})\b/g,
];

const STOP = new Set([
  "the","a","an","your","with","on","using","building","build","ethereum","web3",
  "defi","dapp","app","apps","dapps","ai","zk","onchain","off-chain","mainnet","testnet",
  "smart","contract","contracts","wallet","wallets","intro","introduction","welcome",
  "keynote","panel","fireside","workshop","sponsor","ceremony","general","other",
]);

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

const candidates = {};
for (const t of unbranded) {
  for (const pat of PATS) {
    pat.lastIndex = 0;
    let m;
    while ((m = pat.exec(t.title)) !== null) {
      const raw = m[1].trim();
      const slug = slugify(raw);
      if (!slug || slug.length < 3) continue;
      if (STOP.has(slug)) continue;
      if (slug.split("-").every((p) => STOP.has(p))) continue;
      if (brandSlugs.has(slug)) continue;
      if (brandNames.has(raw.toLowerCase())) continue;
      if (!candidates[slug]) candidates[slug] = { name: raw, freq: 0, samples: [] };
      candidates[slug].freq++;
      if (candidates[slug].samples.length < 2) candidates[slug].samples.push(t.title);
    }
  }
}

const sorted = Object.entries(candidates)
  .map(([slug, e]) => ({ slug, ...e }))
  .filter((e) => e.freq >= 2)
  .sort((a, b) => b.freq - a.freq);

console.log(`\nUn-catalogued candidates appearing ≥2× in titles: ${sorted.length}`);
for (const c of sorted.slice(0, 40)) {
  console.log(`  ${String(c.freq).padStart(3)}  ${c.slug.padEnd(30)} ${c.name}`);
}
if (sorted.length > 40) console.log(`  ... and ${sorted.length - 40} more (freq ≥ 2)`);
