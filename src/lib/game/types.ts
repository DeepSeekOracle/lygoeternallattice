export type Keyword =
  | "latticeWalk"
  | "sealGuard"
  | "lightDrain"
  | "accordBreak"
  | "haste"
  | "ward";

export type CardType = "minion" | "spell" | "resonance";
export type Rarity = "common" | "uncommon" | "rare" | "signature";
export type TargetKind =
  | "none"
  | "enemyMinion"
  | "allyMinion"
  | "anyMinion"
  | "allyGrave";

export type Alignment = "council" | "shadow" | "lattice";

export type EffectOp =
  | "draw"
  | "drawOpp"
  | "dmg"
  | "dmgF"
  | "dmgAllE"
  | "heal"
  | "buff"
  | "buffSelf"
  | "pumpAll"
  | "tempMana"
  | "tempManaNext"
  | "discard"
  | "mill"
  | "destroy"
  | "bounce"
  | "silence"
  | "token"
  | "returnGy"
  | "untap"
  | "wardAll"
  | "lifeOpp"
  | "stealLife"
  | "copyMinion"
  | "readyAll";

export interface Effect {
  op: EffectOp;
  n?: number;
  n2?: number;
  name?: string;
  target?: TargetKind;
}

export type ChampionPassive =
  | { type: "firstDiscount"; value: number }
  | { type: "powerAura"; value: number }
  | { type: "spellDamage"; value: number }
  | { type: "grantHaste" }
  | { type: "structureDiscount" }
  | { type: "anthem"; power: number; toughness: number }
  | { type: "wardOnPlay" }
  | { type: "deathDrawOnce" }
  | { type: "taxSpells"; value: number }
  | { type: "bonusLife"; value: number }
  | { type: "endHeal"; value: number }
  | { type: "equalizeHighCost"; from: number; to: number }
  | { type: "chaosDawn" }
  | { type: "emptyDraw" }
  | { type: "firstCopy" }
  | { type: "damageMills" }
  | { type: "taxFirstCard"; value: number };

export interface ChampionDef {
  id: string;
  seat: number | "shadow" | "lattice";
  name: string;
  epithet: string;
  role: string;
  lore: string;
  playstyle: string;
  alignment: Alignment;
  abilityName: string;
  abilityCost: number;
  abilityText: string;
  ability: Effect[];
  abilityChoices?: { label: string; effects: Effect[] }[];
  passiveName: string;
  passiveText: string;
  passive: ChampionPassive;
}

export interface CardDef {
  id: string;
  name: string;
  type: CardType;
  championId: string;
  rarity: Rarity;
  cost: number;
  power: number;
  toughness: number;
  keywords: Keyword[];
  text: string;
  flavor?: string;
  copies: number;
  onPlay: Effect[];
  onDeath: Effect[];
  onAttack: Effect[];
  choices?: { label: string; effects: Effect[] }[];
}

export interface CardInstance {
  iid: string;
  cardId: string;
  owner: 0 | 1;
  controller: 0 | 1;
  power: number;
  toughness: number;
  maxToughness: number;
  keywords: Keyword[];
  tapped: boolean;
  sick: boolean;
  silenced: boolean;
  ward: number;
  summonedTurn: number;
  isToken: boolean;
  eotPower: number;
  eotTough: number;
}

export interface PendingMana {
  amount: number;
  turns: number;
}

export interface PlayerState {
  name: string;
  championId: string;
  life: number;
  turnsTaken: number;
  permanentMana: number;
  tempMana: number;
  pendingMana: PendingMana[];
  spent: number;
  library: string[];
  hand: string[];
  board: string[];
  gy: string[];
  exile: string[];
  heroUsed: boolean;
  firstCardPlayed: boolean;
  deathDrawUsed: boolean;
  combatUsed: boolean;
  fatigue: number;
  copyUsed: boolean;
}

export type Phase = "mulligan" | "main" | "attack" | "block" | "over";

export type Action =
  | { type: "mulligan"; keep: boolean }
  | { type: "play"; iid: string; target?: string; choice?: number }
  | { type: "hero"; target?: string; choice?: number }
  | { type: "beginCombat" }
  | { type: "skipCombat" }
  | { type: "toggleAttacker"; iid: string }
  | { type: "confirmAttack" }
  | { type: "setBlock"; attacker: string; blocker: string | null }
  | { type: "confirmBlock" }
  | { type: "endTurn" }
  | { type: "concede" };

export interface LogEntry {
  t: string;
  p?: 0 | 1;
}

export interface MatchState {
  seed: number;
  rng: number;
  seq: number;
  turn: number;
  active: 0 | 1;
  first: 0 | 1;
  phase: Phase;
  players: [PlayerState, PlayerState];
  cards: Record<string, CardInstance>;
  log: LogEntry[];
  winner: 0 | 1 | null;
  winReason: string;
  attackers: string[];
  blocks: Record<string, string>;
  humans: [boolean, boolean];
  names: [string, string];
  mulliganUsed: [boolean, boolean];
  combatThisTurn: boolean;
}

export interface DeckList {
  id: string;
  championId: string;
  name: string;
  cards: string[];
}

export type Difficulty = "easy" | "normal" | "hard";
export type Screen =
  | "title"
  | "campaign"
  | "skirmish"
  | "ranked"
  | "hotseat"
  | "lobby"
  | "builder"
  | "forge"
  | "codex"
  | "settings"
  | "match"
  | "tutorial";
