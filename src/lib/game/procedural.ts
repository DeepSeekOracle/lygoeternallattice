import { CARD_BY_ID, CHAMP_BY_ID } from "./catalog";
import { parseFx, parseKw } from "./fx";
import { rngInt, shuffle } from "./rng";
import type { CardDef, ChampionDef, Rarity } from "./types";

const PREFIX = [
  "Luminal",
  "Spiral",
  "Seal",
  "Lattice",
  "Echo",
  "Moon",
  "Haven",
  "Accord",
  "Fractal",
  "Silent",
  "Prism",
  "Tide",
  "Edge",
  "Canon",
  "Star",
];
const NOUN = [
  "Scribe",
  "Warden",
  "Wolf",
  "Hymn",
  "Keep",
  "Vector",
  "Node",
  "Adept",
  "Shard",
  "Pulse",
  "Archive",
  "Bridge",
  "Crown",
  "Needle",
  "Map",
];
const FX = [
  "draw:1",
  "heal:2",
  "dmgF:2",
  "dmgM:2",
  "mill:2",
  "tempMana:1",
  "buff:1:1",
  "token:1:1:Echo",
  "bounce",
  "silence",
];

function nameFrom(seed: number): { state: number; name: string } {
  let s = seed;
  const a = rngInt(s, PREFIX.length);
  s = a.state;
  const b = rngInt(s, NOUN.length);
  s = b.state;
  return { state: s, name: `${PREFIX[a.n]} ${NOUN[b.n]}` };
}

export function forgeChampion(seed: number, title?: string): {
  champion: ChampionDef;
  cards: CardDef[];
  list: string[];
} {
  let s = seed >>> 0 || 1;
  const id = `forge-${s.toString(16)}`;
  const nm = title?.trim() || nameFrom(s).name;
  const passives: ChampionDef["passive"][] = [
    { type: "firstDiscount", value: 1 },
    { type: "powerAura", value: 1 },
    { type: "grantHaste" },
    { type: "endHeal", value: 1 },
    { type: "bonusLife", value: 2 },
    { type: "wardOnPlay" },
  ];
  const pr = rngInt(s, passives.length);
  s = pr.state;
  const champion: ChampionDef = {
    id,
    seat: "lattice",
    name: nm.toUpperCase(),
    epithet: "Forged Seal",
    role: "Procedural lattice champion",
    lore: "Struck from the Lattice Forge — a new seal that still answers to Haven canon: light-math, memory, and accord.",
    playstyle: "Generated curve with a single signature.",
    alignment: "lattice",
    abilityName: "Forge Pulse",
    abilityCost: 2,
    abilityText: "Draw 1.",
    ability: parseFx("draw:1"),
    passiveName: "New Seal",
    passiveText: "A living seal, freshly cut.",
    passive: passives[pr.n]!,
  };

  const cards: CardDef[] = [];
  const costs = [1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 6, 1, 2, 4];
  const kinds: Array<CardDef["type"]> = [
    "minion",
    "spell",
    "minion",
    "minion",
    "spell",
    "minion",
    "minion",
    "spell",
    "minion",
    "spell",
    "minion",
    "minion",
    "resonance",
    "minion",
    "spell",
  ];
  for (let i = 0; i < 15; i++) {
    const n1 = nameFrom(s);
    s = n1.state;
    const fx = FX[rngInt(s, FX.length).n]!;
    s = rngInt(s, FX.length).state;
    const kwRoll = rngInt(s, 6);
    s = kwRoll.state;
    const kw = ["", "S", "H", "L", "D", "W"][kwRoll.n]!;
    const cost = costs[i]!;
    const type = kinds[i]!;
    const p = type === "minion" ? Math.max(1, cost - (kwRoll.n % 2)) : 0;
    const t = type === "minion" ? Math.max(1, cost + 1 - (kwRoll.n % 3)) : 0;
    const rarity: Rarity = i === 11 ? "signature" : i === 12 ? "rare" : "common";
    const cid = `${id}-${i}`;
    const card: CardDef = {
      id: cid,
      name: n1.name,
      type,
      championId: id,
      rarity,
      cost,
      power: p,
      toughness: t,
      keywords: parseKw(type === "minion" ? kw : ""),
      copies: i >= 12 ? 1 : 2,
      onPlay: parseFx(type === "minion" && i % 3 !== 0 ? "" : fx),
      onDeath: type === "minion" && i % 5 === 0 ? parseFx("token:1:1:Echo") : [],
      onAttack: [],
      text:
        type === "resonance"
          ? "Resonance. A forged mana spark."
          : type === "spell"
            ? "A forged seal-script."
            : "A forged minion of the lattice.",
      flavor: "Struck from the Lattice Forge.",
    };
    if (type === "resonance") {
      card.onPlay = parseFx("tempMana:2");
      card.cost = 0;
      card.copies = 1;
    }
    cards.push(card);
    CARD_BY_ID[cid] = card;
  }
  CHAMP_BY_ID[id] = champion;

  let list: string[] = [];
  for (const c of cards) for (let i = 0; i < c.copies; i++) list.push(c.id);
  if (list.length > 29) list = list.slice(0, 29);
  while (list.length < 29) list.push(cards[0]!.id);
  const sh = shuffle(list, s);
  return { champion, cards, list: sh.list.slice(0, 29) };
}
