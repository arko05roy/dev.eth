"use client";
import { createContext, useContext } from "react";

export type WatchedFilter = "all" | "watched" | "unwatched";

export type SourceFilter = "all" | "devcon" | "ethglobal" | "pragma";

export interface FilterState {
  query: string;
  editions: Set<number>; // empty = all
  tiers: Set<string>;    // empty = all
  watchedFilter: WatchedFilter;
  sourceFilter: SourceFilter;
  setQuery: (q: string) => void;
  toggleEdition: (e: number) => void;
  toggleTier: (t: string) => void;
  setWatchedFilter: (w: WatchedFilter) => void;
  setSourceFilter: (s: SourceFilter) => void;
  clearFilters: () => void;
}

export const FilterCtx = createContext<FilterState | null>(null);
export function useFilters() {
  const ctx = useContext(FilterCtx);
  if (!ctx) throw new Error("FilterCtx not provided");
  return ctx;
}

export function matchTalk(
  talk: { title: string; speakers: string[]; flavor: string; desc: string; ed: number; tier: string; id: string; source?: string; eg_track?: string; event?: string },
  watchedSet: Set<string>,
  f: { query: string; editions: Set<number>; tiers: Set<string>; watchedFilter: WatchedFilter; sourceFilter: SourceFilter; }
): boolean {
  // Source filter
  if (f.sourceFilter === "devcon" && talk.source !== "devcon") return false;
  if (f.sourceFilter === "ethglobal" && talk.source !== "ethglobal") return false;
  if (f.sourceFilter === "pragma" && talk.eg_track !== "PRAGMA") return false;

  // Edition filter only applies to Devcon talks (or always if no source filter)
  if (f.editions.size > 0) {
    if (talk.source === "devcon" && !f.editions.has(talk.ed)) return false;
    if (talk.source === "ethglobal" && f.sourceFilter === "devcon") return false; // already handled
  }
  if (f.tiers.size > 0 && !f.tiers.has(talk.tier)) return false;
  if (f.watchedFilter === "watched" && !watchedSet.has(talk.id)) return false;
  if (f.watchedFilter === "unwatched" && watchedSet.has(talk.id)) return false;
  if (f.query) {
    const q = f.query.toLowerCase();
    const hay = (talk.title + " " + talk.speakers.join(" ") + " " + (talk.flavor || "") + " " + (talk.desc || "") + " " + (talk.event || "")).toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}
