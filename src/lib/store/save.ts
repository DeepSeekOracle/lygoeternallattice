import { CHAMPIONS } from "@/lib/game/catalog";
import type { Difficulty } from "@/lib/game/types";

export const SAVE_VERSION = 1;
const KEY = "lygo-eternal-lattice-v1";

export interface CustomDeck {
  id: string;
  name: string;
  championId: string;
  cards: string[];
}

export interface LeaderRow {
  name: string;
  rating: number;
  wins: number;
  losses: number;
  at: number;
}

export interface SaveData {
  version: number;
  playerName: string;
  unlocked: string[];
  campaignIndex: number;
  campaignDone: string[];
  customDecks: CustomDeck[];
  rating: number;
  wins: number;
  losses: number;
  games: number;
  leaderboard: LeaderRow[];
  tutorialDone: boolean;
  settings: {
    sfx: number;
    music: number;
    shake: boolean;
    difficulty: Difficulty;
  };
}

const ALL = CHAMPIONS.map((c) => c.id);

export function defaultSave(): SaveData {
  return {
    version: SAVE_VERSION,
    playerName: "",
    unlocked: ["lyra"],
    campaignIndex: 0,
    campaignDone: [],
    customDecks: [],
    rating: 1000,
    wins: 0,
    losses: 0,
    games: 0,
    leaderboard: [],
    tutorialDone: false,
    settings: { sfx: 0.8, music: 0.45, shake: true, difficulty: "normal" },
  };
}

function migrate(raw: SaveData): SaveData {
  const d = defaultSave();
  return {
    ...d,
    ...raw,
    version: SAVE_VERSION,
    unlocked: Array.from(new Set([...(raw.unlocked ?? []), "lyra"])),
    settings: { ...d.settings, ...raw.settings },
    leaderboard: raw.leaderboard ?? [],
    customDecks: raw.customDecks ?? [],
  };
}

export function loadSave(): SaveData {
  try {
    const t = localStorage.getItem(KEY);
    if (!t) return defaultSave();
    return migrate(JSON.parse(t) as SaveData);
  } catch {
    return defaultSave();
  }
}

export function writeSave(s: SaveData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* private mode */
  }
}

export function unlockAll(): string[] {
  return ALL.slice();
}

export function recordRanked(s: SaveData, win: boolean): SaveData {
  const delta = win ? 24 : -18;
  const rating = Math.max(100, s.rating + delta);
  const next: SaveData = {
    ...s,
    rating,
    wins: s.wins + (win ? 1 : 0),
    losses: s.losses + (win ? 0 : 1),
    games: s.games + 1,
  };
  if (s.playerName.trim()) {
    const row: LeaderRow = {
      name: s.playerName.trim().slice(0, 24),
      rating,
      wins: next.wins,
      losses: next.losses,
      at: Date.now(),
    };
    const board = s.leaderboard.filter((r) => r.name !== row.name);
    board.push(row);
    board.sort((a, b) => b.rating - a.rating);
    next.leaderboard = board.slice(0, 20);
  }
  return next;
}
