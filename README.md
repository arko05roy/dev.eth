# dev.eth

Every talk, every workshop, every ecosystem on Ethereum.

A learning game cut from the complete archives of Devcon (2014–2024) and ETHGlobal (2017–2026). 4,371 talks across 142 events, ranked, threaded, played.

## What's in the corpus

- **1,722 Devcon talks** across Devcons 0–7 — every recorded session, hand-classified into six Lands (Acts) with bosses, main quests, and chronicles
- **2,649 ETHGlobal talks** across 142 events — every Pragma summit, every workshop, every keynote, every panel, every sponsor session worth watching
- **59 topic threads** weaving Devcon canon and ETHGlobal apocrypha into ordered learning paths — theory followed by application, intro followed by depth
- **80 sponsor brand logos** detected and rendered inline (Chainlink, Hedera, Flare, Avail, EigenLayer, Optimism, Arbitrum, …)
- **Whisper transcripts** for 1,073 talks — first 320 chars surface in-app as a "prologue"

## Game mechanics

- **XP per tier** (Boss 100 · Main 40 · Side 15 · Chronicle 5)
- **Levels** Tarnished → Wretch → Vagabond → Wanderer → Astrologer → Prophet → Lord of the Path
- **30+ achievements** with Miyazaki-toned flavor text and 2 hidden secrets
- **Streak tracking** by calendar day
- **Class system** — Magus / Sellsword / Warden / Architect / Smith
- All progress in `localStorage`. No account system.

## Routes

- `/` — Hero
- `/path` — The full corpus, organized by Acts → topic threads
- `/begin` — Map view, character card, class picker
- `/character` — Level ladder, stats, per-Act progress
- `/quests` — Active / Foreshadowed / Done
- `/achievements` — The Ledger of Runes
- `/s/[slug]` — Speaker pages (1,506 statically pre-rendered)

## Stack

Next.js 16 (Turbopack) · React 19 · TypeScript strict · Tailwind 3 · Cormorant Garamond + Inter + JetBrains Mono · No backend.

## Data sources

- **Devcon**: [`efdevcon/monorepo`](https://github.com/efdevcon/monorepo) → `devcon-api/data/sessions/`
- **ETHGlobal**: [@ETHGlobal YouTube channel](https://www.youtube.com/@ETHGlobal/playlists), enumerated via `yt-dlp --flat-playlist`
- **Speaker bios**: same monorepo, `data/speakers/`
- **Sponsor logos**: Google's favicon CDN (`s2/favicons?domain=…`)

Build pipeline scripts live in `/tmp/` during development:

- `build_tarnished.py` — Devcon classification & Site-of-Grace prose
- `enrich.py` — speaker resolution, transcript prologues, related-talks
- `eg_fetch_videos.py` — yt-dlp parallel fetch of all ETHGlobal playlists
- `eg_classify.py` — ETHGlobal classification & junk filtering
- `build_threads.py` — topic-thread classifier (59 threads)

## Run locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Aesthetic

Dark scholarly archive. Miyazaki dread, not Marvel quips. Warm parchment ink on deep void. Greek glyphs as marks. Ember as the only chromatic accent. See [`brand.md`](brand.md) for the full system.

## License

MIT.
