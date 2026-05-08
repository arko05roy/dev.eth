// Runtime topical auto-threading.
// Curated `lib/threads.json` covers ~49% of the corpus. This module extends
// existing curated threads with keyword-matched orphans, and creates a small
// number of new emergent threads for topics curators haven't named.
// Pure runtime — `talks.json` and `threads.json` are never mutated.

import type { Talk, Thread, ActId, Tier } from "./types";
import { TALKS, THREADS } from "./talks";

interface Topic {
  /** Either an existing curated thread id (extension) OR a new id (emergent thread). */
  id: string;
  act: ActId;
  /** When set: append matches to this curated thread instead of creating a new one. */
  extends?: string;
  /** Required for new emergent threads. Ignored when `extends` is set. */
  name?: string;
  blurb?: string;
  keywords: RegExp;
  negativeKeywords?: RegExp;
}

// --- Topic vocabulary ------------------------------------------------------
// Keywords run against `${title} ${desc} ${prologue}` lowercased.
// Where a curated thread already exists, we only `extends:` it.
// New emergent threads are created for topic gaps the curators didn't name.

const TOPICS: Topic[] = [
  // ─── Act I ──────────────────────────────────────────────────────────────
  { id: "early-projects", act: "I", extends: "early-projects",
    keywords: /\b(augur|maker(?!\s*sure)|gnosis safe|raiden|status|aragon|0x project|district0x|golem)\b/ },
  { id: "first-roadmap", act: "I", extends: "first-roadmap",
    keywords: /\b(roadmap|future of ethereum|vision|where ethereum is going)\b/ },

  // ─── Act II ─────────────────────────────────────────────────────────────
  { id: "solidity-tongue", act: "II", extends: "solidity-tongue",
    keywords: /\b(solidity|vyper|yul|huff|sol\b|abi encoding|inline assembly|smart contract language)\b/ },
  { id: "evm-internals", act: "II", extends: "evm-internals",
    keywords: /\b(evm|opcode|opcodes|bytecode|gas\b|memory model|stack(?!\s+channel)|precompile|reth\b|geth\b|nethermind\b|besu\b|erigon)\b/ },
  { id: "eof-modernization", act: "II", extends: "eof-modernization",
    keywords: /\b(eof\b|evm object format|evm modernization)\b/ },
  { id: "vuln-bestiary", act: "II", extends: "vuln-bestiary",
    keywords: /\b(reentrancy|exploit|vulnerab|attack vector|hack(ed)?|drained|drain attack|front[- ]?run|sandwich|read[- ]?only reentrancy|signature replay|integer overflow|underflow|access control|delegate ?call|tx\.origin|incident retro)\b/,
    negativeKeywords: /real estate|fashion|fashion show/ },
  { id: "audit-discipline", act: "II", extends: "audit-discipline",
    keywords: /\b(audit(s|ing|or)?|code review|secur(e|ity) review|cyfrin|trail of bits|spearbit|consensys diligence|halborn|peckshield|sherlock|code4rena|c4)\b/ },
  { id: "formal-verification", act: "II", extends: "formal-verification",
    keywords: /\b(formal verif|formally verif|certora|halmos|hevm|kontrol|k framework|smt solver|smt-lib|lean(\s|4)|coq\b|isabelle|model check)\b/ },
  { id: "fuzzing-testing", act: "II", extends: "fuzzing-testing",
    keywords: /\b(fuzz(ing|er)?|invariant test|echidna|medusa|foundry test|property[- ]based)\b/ },
  { id: "dev-tooling", act: "II", extends: "dev-tooling",
    keywords: /\b(foundry|forge\b|anvil\b|hardhat|truffle|remix|tenderly|debugger|dev tool|developer tooling|scaffold[- ]?eth|wagmi|viem\b|ethers\.?js|web3\.?js|brownie|ape|debugging|stack traces)\b/ },
  // — emergent —
  { id: "gas-optimization", act: "II",
    name: "The Gas-Cutter's Trade",
    blurb: "Yul, assembly, opcode hunting. Every wei a vow.",
    keywords: /\b(gas optimi[sz]|gas golf|gas saving|assembly\b|yul\b|opcode hunting|cheap(er)? gas|gas[- ]?efficient)\b/ },
  { id: "indexing-the-graph", act: "II",
    name: "Indexing the Archive",
    blurb: "Subgraphs, substreams, indexers. How the chain is read.",
    keywords: /\b(subgraph|substreams?|the graph\b|indexer|indexing|envio|goldsky|ponder\b|dune analytics)\b/ },

  // ─── Act III ────────────────────────────────────────────────────────────
  { id: "amm-lineage", act: "III", extends: "amm-lineage",
    keywords: /\b(amm\b|automated market maker|uniswap|curve\b|balancer|sushi|pancake|concentrated liquidity|order book|dex\b|paraswap|cow\s?swap|1inch|kyber|airswap)\b/,
    negativeKeywords: /onchain games?|gaming/ },
  { id: "lending-stables", act: "III", extends: "lending-stables",
    keywords: /\b(lending|borrow(ing)?|aave\b|compound\b|morpho|spark protocol|maker(?:dao)?|dai\b|usdc\b|usdt\b|tether|pyusd|stablecoin|stable coin|peg(ged)?|liquidation|collateral|cdp\b|gho\b|crvusd|frax)\b/ },
  { id: "mev-foundations", act: "III", extends: "mev-foundations",
    keywords: /\b(\bmev\b|searcher|order ?flow|maximal extractable|sandwich attack|builder market)\b/ },
  { id: "pbs-builders", act: "III", extends: "pbs-builders",
    keywords: /\b(\bpbs\b|proposer[- ]?builder|block building|relay(s|ing)?\b|mev[- ]?boost|flashbots)\b/ },
  { id: "preconfs", act: "III", extends: "preconfs",
    keywords: /\b(preconf(irmation)?s?|based sequenc|inclusion list|based rollup)\b/ },
  { id: "fairer-markets", act: "III", extends: "fairer-markets",
    keywords: /\b(fair(er)? market|fair sequencing|fair ordering|threshold encryption|encrypted mempool)\b/ },
  { id: "oracles", act: "III", extends: "oracles",
    keywords: /\b(oracle(s)?|chainlink|pyth\b|redstone|tellor|api3\b|umbrella|flare network|price feed|data feed|ccip\b)\b/ },
  { id: "cryptoeconomics", act: "III", extends: "cryptoeconomics",
    keywords: /\b(cryptoeconomic|mechanism design|game theor|incentive design|auction theory|tokenomic)\b/ },
  // — emergent —
  { id: "intents-orderflow", act: "III",
    name: "Intents & Solver Markets",
    blurb: "Where the user states the wish, and solvers answer.",
    keywords: /\bintents?\b|\bsolver(s)?\b|\bcow protocol\b|\buniswapx\b|\b7683\b/ },

  // ─── Act IV ─────────────────────────────────────────────────────────────
  { id: "casper-lineage", act: "IV", extends: "casper-lineage",
    keywords: /\b(casper|proof of stake transition|the merge\b|pos transition)\b/ },
  { id: "beacon-chain", act: "IV", extends: "beacon-chain",
    keywords: /\b(beacon chain|consensus layer|epoch|slot\b|attestation|fork choice|lmd[- ]?ghost|finalit(y|ization))\b/ },
  { id: "validator-ops", act: "IV", extends: "validator-ops",
    keywords: /\b(solo stak|validator(s)?\b|home stak(er|ing)|dvt\b|distributed validator|obol\b|ssv\b|slashing|withdrawal credentials)\b/ },
  { id: "lst-restaking", act: "IV", extends: "lst-restaking",
    keywords: /\b(\blst\b|liquid staking|lido\b|rocket ?pool|stader|frax ether|sfrxeth|restaking|eigenlayer|symbiotic|karak|avs\b|actively validated)\b/ },
  { id: "light-clients", act: "IV", extends: "light-clients",
    keywords: /\b(light client(s)?|helios|trustless rpc)\b/ },
  { id: "client-engineering", act: "IV", extends: "client-engineering",
    keywords: /\b(execution client|consensus client|geth|reth|nethermind|besu|erigon|lighthouse|prysm|teku\b|nimbus|lodestar|grandine|client diversity)\b/ },
  { id: "p2p-networking", act: "IV", extends: "p2p-networking",
    keywords: /\b(libp2p|gossipsub|devp2p|p2p\b|peer[- ]to[- ]peer|discv5|enr\b|rlpx)\b/ },
  { id: "issuance-policy", act: "IV", extends: "issuance-policy",
    keywords: /\b(issuance|monetary policy|censorship resist|\beip[- ]?1559|burn rate|ultra sound)\b/ },

  // ─── Act V ──────────────────────────────────────────────────────────────
  { id: "zk-foundations", act: "V", extends: "zk-foundations",
    keywords: /\bzero[- ]?knowledge\b|\bzkp(s)?\b|\bzk\b/,
    negativeKeywords: /zksync|zkevm|zk[- ]?rollup/ },
  { id: "proof-systems", act: "V", extends: "proof-systems",
    keywords: /\b(snark(s)?\b|stark(s)?\b|plonk|halo2|groth16|nova\b|sumcheck|risc[- ]?zero|sp1\b|jolt\b|plonky[23]?\b|fri\b|kzg\b)\b/ },
  { id: "zk-circuits", act: "V", extends: "zk-circuits",
    keywords: /\b(circom|noir\b|cairo\b|leo\b|aleo\b|circuit(s)?|constraint system|arithmetiz|r1cs)\b/ },
  { id: "zkevms", act: "V", extends: "zkevms",
    keywords: /\bzkevm\b|\bzk[- ]?evm\b|\bpolygon zk|\bscroll\b|\blinea\b|\bzksync (?:era|2)\b|\btaiko\b/ },
  { id: "zk-rollups", act: "V", extends: "zk-rollups",
    keywords: /\bzk[- ]?rollup(s)?\b|\bvalidity rollup/ },
  { id: "optimistic-rollups", act: "V", extends: "optimistic-rollups",
    keywords: /\boptimistic rollup|\bfraud proof|\boptimism(?!\s*foundation)\b|\barbitrum\b|\bbase\b(?:\s+chain)?|\bop stack\b|\bnitro\b/ },
  { id: "old-paths-plasma-channels", act: "V", extends: "old-paths-plasma-channels",
    keywords: /\bplasma\b|\bstate channel(s)?\b|\bpayment channel|\braiden\b|\bconnext\b|\bcounterfactual\b/ },
  { id: "rollup-mental-models", act: "V", extends: "rollup-mental-models",
    keywords: /\brollup mental|\bmental model.*rollup|\bwhat (is|are) rollup/ },
  { id: "appchains-superchain", act: "V", extends: "appchains-superchain",
    keywords: /\bappchain(s)?\b|\bsuperchain\b|\bopstack\b|\bapp[- ]specific chain/ },
  { id: "account-abstraction", act: "V", extends: "account-abstraction",
    keywords: /\baccount abstraction|\berc[- ]?4337|\bsmart account(s)?|\bpaymaster|\buserop|\b7702\b|\beip[- ]?7702|\bsocial recovery|\bbundler/ },
  { id: "smart-wallets-ux", act: "V", extends: "smart-wallets-ux",
    keywords: /\bsmart wallet|\bpasskey\b|\bweb3auth\b|\bdynamic\.xyz|\bprivy\b|\bwallet ux|\bonboarding|\bseedless|\bembedded wallet/ },
  { id: "bridges-interop", act: "V", extends: "bridges-interop",
    keywords: /\bbridge(s|d|ing)?\b|\bcross[- ]?chain|\binterop|\bmessaging protocol|\baxelar\b|\bhyperlane\b|\bwormhole\b|\blayerzero\b|\bccip\b|\bacross protocol|\bsynapse\b|\bceler\b|\bhashi\b|\bibc\b/ },
  { id: "intents-solvers", act: "V", extends: "intents-solvers",
    keywords: /\bintents?\b|\bsolver(s)?\b|\berc[- ]?7683\b/ },
  { id: "data-availability", act: "V", extends: "data-availability",
    keywords: /\bdata availability\b|\bda layer\b|\bcelestia\b|\bavail\b|\beigenda\b|\bnear da\b|\bdanksharding|\bproto[- ]?danksharding|\b4844\b|\beip[- ]?4844\b|\bblob(s)?\b/ },
  { id: "kzg-verkle", act: "V", extends: "kzg-verkle",
    keywords: /\bkzg\b|\bverkle\b|\bpolynomial commitment|\bipa commitment/ },
  { id: "applied-crypto", act: "V", extends: "applied-crypto",
    keywords: /\bapplied crypto|\bthreshold (?:signature|crypto)|\bbls\b|\bvdf\b|\bvrf\b|\bschnorr|\bmpc\b|\bfhe\b|\bhomomorphic|\btlsnotary|\bzk[- ]?email|\bnullifier|\bsemaphore|\bchaum/ },
  { id: "identity-personhood", act: "V", extends: "identity-personhood",
    keywords: /\bidentity\b|\bdid\b|\bverifiable credential|\bworld id\b|\bworldcoin\b|\bself\.xyz|\bself protocol|\bsbts?\b|\bsoulbound|\battestation(s)?\b|\beas\b|\bproof of personhood|\bsybil/ },
  { id: "stateless-ethereum", act: "V", extends: "stateless-ethereum",
    keywords: /\bstateless\b|\bportal network|\bwitness data/ },

  // ─── Act VI ─────────────────────────────────────────────────────────────
  { id: "privacy-l1", act: "VI", extends: "privacy-l1",
    keywords: /\bprivacy at l1\b|\bprivate ethereum|\bshielded\b|\baztec\b|\bzcash\b/ },
  { id: "mixers-anonsets", act: "VI", extends: "mixers-anonsets",
    keywords: /\btornado\b|\bsemaphore\b|\bbandada\b|\bmixer(s)?\b|\banonymity set|\bprivacy pool/ },
  { id: "tor-lessons", act: "VI", extends: "tor-lessons",
    keywords: /\btor\b|\bonion routing|\bcypherpunk\b/ },
  { id: "onchain-games", act: "VI", extends: "onchain-games",
    keywords: /\bonchain game(s)?\b|\bautonomous world|\bmud\b(?:\s+(?:framework|engine))?|\bargus\b|\bworld engine|\bdark forest|\bfully onchain|\bdojo\b|\bgaming(?: on| with)/ },
  { id: "daos-governance", act: "VI", extends: "daos-governance",
    keywords: /\bdao(s)?\b|\bgovernance|\bvoting|\bquadratic|\bfutarchy|\bquorum|\bproposal(s)?\b|\bsnapshot\b|\btally\b|\baragon\b|\bcouncil\b/ },
  { id: "public-goods", act: "VI", extends: "public-goods",
    keywords: /\bpublic good(s)?\b|\bgitcoin\b|\bquadratic funding|\bretropgf\b|\bretroactive\b|\bregen(erative)?\b|\bcommons\b|\bfunding the commons|\bimpact\b|\bclimate\b|\bphilanthropy|\bgrant(s|ee)?\b|\bdonation/ },
  { id: "ens-identity", act: "VI", extends: "ens-identity",
    keywords: /\bens\b|\b\.eth\b|\bnamewrapper|\beth name|\bensip|\bonchain name(s)?\b/ },
  { id: "real-world", act: "VI", extends: "real-world",
    keywords: /\brwa(s)?\b|\breal[- ]?world asset|\btokeniz(ed|ation|ing)|\binstitutional|\bregulat(ion|ory|ed)\b|\bcompliance\b|\bkyc\b|\bbank(s|ing)?\b|\bbond(s)?\b|\btreasury bill|\benterprise\b|\badoption\b|\bbusiness\b|\bcorporate\b|\benterprise blockchain|\binsurance\b|\bsupply chain/ },
  { id: "ai-agents", act: "VI", extends: "ai-agents",
    keywords: /\bai\b|\bagent(s|ic)?\b|\bllm(s)?\b|\binference\b|\bonchain ai\b|\beliza\b|\bvirtuals\b|\bgaladriel\b|\b0g\b|\bphala\b/,
    negativeKeywords: /real estate agent|booking agent/ },
  { id: "philosophy-vows", act: "VI", extends: "philosophy-vows",
    keywords: /\bphilosophy|\bvow(s)?\b|\bvalues\b|\bpurpose\b|\bcredo\b|\bmission\b|\bvision\b|\bethereum (?:roadmap|future|vision|values|purpose|mission|path|story|year)|\bfuture of ethereum|\bnext (?:decade|era|chapter)|\bdirection|\blatest on ethereum|\bopening ceremon|\bclosing ceremon|\bstate of ethereum|\bcypherpunk|\bdecentrali[sz]ation\b|\bkeynote|\bkartik|\bfireside\b|\baya\b/ },
  { id: "non-evm-l1s", act: "VI", extends: "non-evm-l1s",
    keywords: /\bsolana\b|\bnear protocol|\bnear blockchain|\bcosmos\b|\bpolkadot\b|\bcardano\b|\balgorand\b|\btezos\b|\bsui\b|\baptos\b|\bmove(?:\s+language)?\b|\binternet computer|\bdfinity\b|\bhedera\b|\bavalanche\b/ },
  { id: "storage-systems", act: "VI", extends: "storage-systems",
    keywords: /\bipfs\b|\bfilecoin\b|\barweave\b|\bswarm\b|\bethstorage\b|\bwalrus\b|\bstorj\b|\bskynet\b|\bdecentrali[sz]ed storage|\bcontent addressed/ },
  { id: "social-protocols", act: "VI", extends: "social-protocols",
    keywords: /\blens(?: protocol)?\b|\bfarcaster|\bframe(s)?\b|\bdesoc|\bmirror\.xyz|\bxmtp\b|\bpush protocol|\bsocial graph|\bsocial network|\bcommunit(y|ies)\b/,
    negativeKeywords: /\bcoin cast|\bnewscast/ },
  // — emergent (Act VI) —
  { id: "research-frontier", act: "VI",
    name: "The Research Halls",
    blurb: "Open problems, unfinished proofs, the long horizon. Research, not product.",
    keywords: /\bresearch\b|\bopen problem|\bfrontier\b|\bunsolved\b|\bcryptography research|\bgame theory|\bformaliz|\btheoretical/ },
  { id: "ux-onboarding", act: "VI",
    name: "The First Steps",
    blurb: "Onboarding, education, the first thousand. How a Tarnished is welcomed in.",
    keywords: /\bonboarding\b|\bnew user|\bbeginner|\bnewcomer|\beducation\b|\blearn ethereum|\bfirst (?:steps|users)|\bweb2 to web3|\baccessibility/ },
];

// --- Build ----------------------------------------------------------------

const TIER_RANK: Record<Tier, number> = { boss: 0, main: 1, side: 2, chronicle: 3 };
const DEVCON_YEARS = [2014, 2015, 2016, 2017, 2018, 2019, 2022, 2023, 2024];

function yearOf(t: Talk): number {
  const m = (t.event || "").match(/(20\d{2})/);
  if (m) return parseInt(m[1], 10);
  if (t.source === "devcon" && t.ed >= 0 && t.ed < DEVCON_YEARS.length) return DEVCON_YEARS[t.ed];
  return 0;
}

function sortAutoTalks(ids: string[]): string[] {
  const byId: Record<string, Talk> = {};
  for (const t of TALKS) byId[t.id] = t;
  return [...ids].sort((a, b) => {
    const ta = byId[a], tb = byId[b];
    if (!ta || !tb) return 0;
    const tr = (TIER_RANK[ta.tier] ?? 9) - (TIER_RANK[tb.tier] ?? 9);
    if (tr !== 0) return tr;
    return yearOf(ta) - yearOf(tb);
  });
}

export const EFFECTIVE_THREADS: Thread[] = (() => {
  // Curated baseline — preserve original order of talkIds (curator-blessed).
  const curatedById: Record<string, Thread> = {};
  for (const t of THREADS) curatedById[t.id] = t;

  // Track curated talk IDs separately so we never reorder them.
  const curatedIds: Record<string, string[]> = {};
  const curatedSet: Record<string, Set<string>> = {};
  for (const t of THREADS) {
    curatedIds[t.id] = [...t.talkIds];
    curatedSet[t.id] = new Set(t.talkIds);
  }

  // Auto-additions per thread id.
  const autoAdds: Record<string, Set<string>> = {};
  // Talk ids per emergent (new) thread.
  const newThreadIds: Record<string, Set<string>> = {};

  for (const topic of TOPICS) {
    const isExt = !!topic.extends;
    const targetId = isExt ? topic.extends! : topic.id;

    if (isExt && !curatedById[targetId]) {
      // Bad config — extends a thread that doesn't exist. Skip.
      continue;
    }
    if (isExt) {
      autoAdds[targetId] ||= new Set<string>();
    } else {
      newThreadIds[targetId] ||= new Set<string>();
    }
    const sink = isExt ? autoAdds[targetId] : newThreadIds[targetId];

    for (const t of TALKS) {
      if (t.act !== topic.act) continue;
      if (isExt && curatedSet[targetId].has(t.id)) continue;
      if (sink.has(t.id)) continue;
      const hay = `${t.title || ""} ${t.desc || ""} ${t.prologue || ""}`.toLowerCase();
      if (topic.negativeKeywords && topic.negativeKeywords.test(hay)) continue;
      if (!topic.keywords.test(hay)) continue;
      sink.add(t.id);
    }
  }

  // Merge LLM-suggested thread assignments (from parallel-subagent classification).
  // Graceful fallback: if lib/talk-threads.json is missing, this block is a no-op.
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const llm = require("./talk-threads.json") as Record<string, string[]>;
    for (const [talkId, threadIds] of Object.entries(llm || {})) {
      const talk = TALKS.find((t) => t.id === talkId);
      if (!talk) continue;
      for (const tid of threadIds) {
        const target = curatedById[tid];
        if (!target || target.act !== talk.act) continue;
        if (curatedSet[tid].has(talkId)) continue; // already there
        autoAdds[tid] ||= new Set<string>();
        autoAdds[tid].add(talkId);
      }
    }
  } catch {
    // No artifact yet — runs in degraded mode (regex-only).
  }

  // Reassemble curated threads with auto-added talks appended (sorted tier→year).
  const out: Thread[] = THREADS.map((t) => {
    const adds = autoAdds[t.id];
    const extra = adds ? sortAutoTalks([...adds]) : [];
    const merged = [...curatedIds[t.id], ...extra];
    return { ...t, talkIds: merged, count: merged.length };
  });

  // Append new emergent threads.
  for (const topic of TOPICS) {
    if (topic.extends) continue;
    const ids = newThreadIds[topic.id];
    if (!ids || ids.size === 0) continue;
    const sorted = sortAutoTalks([...ids]);
    out.push({
      id: topic.id,
      act: topic.act,
      name: topic.name || topic.id,
      blurb: topic.blurb || "",
      talkIds: sorted,
      count: sorted.length,
    });
  }

  return out;
})();
