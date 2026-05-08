"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import type { Talk } from "./types";
import { TALKS } from "./talks";
import { XP_PER_TIER, levelFromXp } from "./xp";
import { ACHIEVEMENTS, evaluateAchievements } from "./achievements";

const KEY_WATCHED = "tp:watched";
const KEY_NAME = "tp:name";
const KEY_CLASS = "tarnished-path:class";  // back-compat with existing
const KEY_ACHIEVEMENTS = "tp:achievements";
const KEY_STREAK_DAYS = "tp:streak-days";

const TALK_BY_ID: Record<string, Talk> = {};
for (const t of TALKS) TALK_BY_ID[t.id] = t;

function loadSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch { return new Set(); }
}
function saveSet(key: string, s: Set<string>) {
  try { window.localStorage.setItem(key, JSON.stringify([...s])); } catch {}
}
function loadStr(key: string): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(key) || "";
}
function saveStr(key: string, v: string) {
  try { window.localStorage.setItem(key, v); } catch {}
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export interface ProgressApi {
  hydrated: boolean;
  watched: Set<string>;
  toggle: (id: string) => void;
  clearAll: () => void;
  // Game state
  name: string;
  setName: (n: string) => void;
  classChosen: string;
  setClass: (c: string) => void;
  xp: number;
  level: ReturnType<typeof levelFromXp>;
  streak: number;
  streakDays: string[];
  achievements: Set<string>;
  newlyUnlocked: string[];
  ackUnlocked: () => void;
  totalAchievements: number;
}

export function useProgress(): ProgressApi {
  const [hydrated, setHydrated] = useState(false);
  const [watched, setWatched] = useState<Set<string>>(() => new Set());
  const [name, setNameState] = useState<string>("Tarnished");
  const [classChosen, setClassChosenState] = useState<string>("");
  const [achievements, setAchievements] = useState<Set<string>>(() => new Set());
  const [streakDays, setStreakDays] = useState<string[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);

  // hydrate from localStorage
  useEffect(() => {
    setWatched(loadSet(KEY_WATCHED));
    setAchievements(loadSet(KEY_ACHIEVEMENTS));
    setNameState(loadStr(KEY_NAME) || "Tarnished");
    setClassChosenState(loadStr(KEY_CLASS) || "");
    try {
      const raw = window.localStorage.getItem(KEY_STREAK_DAYS);
      setStreakDays(raw ? JSON.parse(raw) : []);
    } catch {}
    setHydrated(true);
  }, []);

  const setName = useCallback((n: string) => {
    const clean = n.trim().slice(0, 32) || "Tarnished";
    setNameState(clean);
    saveStr(KEY_NAME, clean);
  }, []);

  const setClass = useCallback((c: string) => {
    setClassChosenState(c);
    if (c) saveStr(KEY_CLASS, c);
    else { try { window.localStorage.removeItem(KEY_CLASS); } catch {} }
  }, []);

  // XP derived from watched set + tier table
  const xp = useMemo(() => {
    let total = 0;
    for (const id of watched) {
      const t = TALK_BY_ID[id];
      if (t) total += XP_PER_TIER[t.tier] || 0;
    }
    return total;
  }, [watched]);

  const level = useMemo(() => levelFromXp(xp), [xp]);

  // Streak: count back consecutive days from today
  const streak = useMemo(() => {
    if (streakDays.length === 0) return 0;
    const days = new Set(streakDays);
    let count = 0;
    const today = todayISO();
    let cursor = today;
    while (days.has(cursor)) {
      count++;
      const d = new Date(cursor);
      d.setUTCDate(d.getUTCDate() - 1);
      cursor = d.toISOString().slice(0, 10);
    }
    return count;
  }, [streakDays]);

  const toggle = useCallback((id: string) => {
    setWatched((prev) => {
      const next = new Set(prev);
      const wasOn = next.has(id);
      if (wasOn) next.delete(id);
      else next.add(id);
      saveSet(KEY_WATCHED, next);

      // streak update on add only
      if (!wasOn) {
        const today = todayISO();
        setStreakDays((sd) => {
          if (sd.includes(today)) return sd;
          const ns = [...sd, today].sort();
          try { window.localStorage.setItem(KEY_STREAK_DAYS, JSON.stringify(ns)); } catch {}
          return ns;
        });
      }
      return next;
    });
  }, []);

  // Re-evaluate achievements whenever watched/class/streak changes
  useEffect(() => {
    if (!hydrated) return;
    const ctx = { watched, talks: TALKS, classChosen, streak };
    const { newly } = evaluateAchievements(ctx, achievements);
    if (newly.length === 0) return;
    setAchievements((prev) => {
      const next = new Set(prev);
      for (const a of newly) next.add(a.id);
      saveSet(KEY_ACHIEVEMENTS, next);
      return next;
    });
    setNewlyUnlocked((prev) => [...prev, ...newly.map((a) => a.id)]);
  }, [watched, classChosen, streak, hydrated, achievements]);

  const ackUnlocked = useCallback(() => setNewlyUnlocked([]), []);

  const clearAll = useCallback(() => {
    const empty = new Set<string>();
    saveSet(KEY_WATCHED, empty);
    saveSet(KEY_ACHIEVEMENTS, empty);
    setWatched(empty);
    setAchievements(empty);
    setStreakDays([]);
    try { window.localStorage.removeItem(KEY_STREAK_DAYS); } catch {}
  }, []);

  return {
    hydrated,
    watched, toggle, clearAll,
    name, setName,
    classChosen, setClass,
    xp, level,
    streak, streakDays,
    achievements,
    newlyUnlocked, ackUnlocked,
    totalAchievements: ACHIEVEMENTS.length,
  };
}
