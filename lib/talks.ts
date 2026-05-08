// AUTO-GENERATED. Do not edit by hand.
import type { Talk, BossProse, Speaker, RelatedTalk, Thread, Brand } from "./types";
import talksData from "./talks.json";
import bossData from "./boss-prose.json";
import speakerData from "./speakers.json";
import relatedData from "./related.json";
import threadData from "./threads.json";
import brandData from "./brands.json";

export const TOTAL_TALKS = (talksData as unknown as Talk[]).length;
export const TALKS = talksData as unknown as Talk[];
export const BOSS_PROSE = bossData as Record<string, BossProse>;
export const SPEAKERS = speakerData as Record<string, Speaker>;
export const RELATED = relatedData as Record<string, RelatedTalk[]>;
export const THREADS = threadData as unknown as Thread[];
export const BRANDS = brandData as Record<string, Brand>;
export const THREAD_BY_ID: Record<string, Thread> = (() => {
  const m: Record<string, Thread> = {};
  for (const t of THREADS) m[t.id] = t;
  return m;
})();

// Lookup map (built once at module load)
export const TALK_BY_ID: Record<string, Talk> = (() => {
  const m: Record<string, Talk> = {};
  for (const t of TALKS) m[t.id] = t;
  return m;
})();

// Speaker slug → talks given by that speaker
export const TALKS_BY_SPEAKER: Record<string, Talk[]> = (() => {
  const m: Record<string, Talk[]> = {};
  for (const t of TALKS) {
    for (const sp of t.speakers) {
      const slug = sp.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      if (!slug) continue;
      (m[slug] ||= []).push(t);
    }
  }
  return m;
})();
