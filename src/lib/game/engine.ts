import { CARD_BY_ID, CHAMP_BY_ID } from "./catalog";
import { FACE_TARGET, allowsFace, needsTarget, requiresTarget } from "./fx";
import { nextRng, rngInt, shuffle } from "./rng";
import type {
  Action,
  CardInstance,
  ChampionDef,
  Effect,
  MatchState,
  PlayerState,
  TargetKind,
} from "./types";

const BOARD_CAP = 7;
const HAND_CAP = 8;
const START_LIFE = 20;
const START_HAND = 4;

export function opp(p: 0 | 1): 0 | 1 {
  return p === 0 ? 1 : 0;
}

export function champOf(s: MatchState, p: 0 | 1): ChampionDef {
  return CHAMP_BY_ID[s.players[p].championId]!;
}

export function maxLifeOf(s: MatchState, p: 0 | 1): number {
  const c = champOf(s, p);
  return START_LIFE + (c.passive.type === "bonusLife" ? c.passive.value : 0);
}

export function healPlayer(s: MatchState, p: 0 | 1, n: number) {
  if (n <= 0 || s.winner !== null) return;
  const max = maxLifeOf(s, p);
  const before = s.players[p].life;
  s.players[p].life = Math.min(max, before + n);
  const gained = s.players[p].life - before;
  if (gained > 0) log(s, `Lattice Integrity +${gained} (${s.players[p].life}/${max})`, p);
}

export function cardOf(iid: string, s: MatchState) {
  return s.cards[iid];
}

export function defOf(iid: string, s: MatchState) {
  const inst = s.cards[iid];
  return inst ? CARD_BY_ID[inst.cardId] : undefined;
}

function log(s: MatchState, t: string, p?: 0 | 1) {
  s.log.push({ t, p });
  if (s.log.length > 80) s.log.splice(0, s.log.length - 80);
}

function iid(s: MatchState): string {
  s.seq += 1;
  return `c${s.seq}`;
}

export function manaPool(pl: PlayerState): number {
  return pl.permanentMana + pl.tempMana;
}

export function manaAvail(pl: PlayerState): number {
  return Math.max(0, manaPool(pl) - pl.spent);
}

export function currentPower(s: MatchState, inst: CardInstance): number {
  let p = inst.power + inst.eotPower;
  const c = champOf(s, inst.controller);
  if (c.passive.type === "powerAura") p += c.passive.value;
  if (c.passive.type === "anthem") p += c.passive.power;
  return Math.max(0, p);
}

export function currentTough(inst: CardInstance): number {
  return inst.toughness + inst.eotTough;
}

export function playCost(s: MatchState, p: 0 | 1, iid: string): number {
  const def = defOf(iid, s);
  if (!def) return 99;
  const pl = s.players[p];
  const me = champOf(s, p);
  const them = champOf(s, opp(p));
  let cost = def.cost;
  if (me.passive.type === "firstDiscount" && !pl.firstCardPlayed) {
    cost = Math.max(0, cost - me.passive.value);
  }
  if (me.passive.type === "structureDiscount" && def.type === "minion" && pl.permanentMana >= 4) {
    cost = Math.max(0, cost - 1);
  }
  if (me.passive.type === "equalizeHighCost" && cost >= me.passive.from) {
    cost = me.passive.to;
  }
  if (them.passive.type === "taxSpells" && def.type !== "minion") {
    cost += them.passive.value;
  }
  if (them.passive.type === "taxFirstCard" && !pl.firstCardPlayed) {
    cost += them.passive.value;
  }
  return cost;
}

function spawnCard(
  s: MatchState,
  cardId: string,
  owner: 0 | 1,
  extra?: Partial<CardInstance>,
): CardInstance {
  const def = CARD_BY_ID[cardId];
  const inst: CardInstance = {
    iid: iid(s),
    cardId,
    owner,
    controller: owner,
    power: def?.power ?? extra?.power ?? 0,
    toughness: def?.toughness ?? extra?.toughness ?? 1,
    maxToughness: def?.toughness ?? extra?.toughness ?? extra?.maxToughness ?? 1,
    keywords: [...(def?.keywords ?? extra?.keywords ?? [])],
    tapped: false,
    sick: true,
    silenced: false,
    ward: (def?.keywords.includes("ward") ? 1 : 0) + (extra?.ward ?? 0),
    summonedTurn: 0,
    isToken: extra?.isToken ?? false,
    eotPower: 0,
    eotTough: 0,
    ...extra,
  };
  inst.iid = inst.iid || iid(s);
  s.cards[inst.iid] = inst;
  return inst;
}

function enterBoard(s: MatchState, inst: CardInstance, p: 0 | 1) {
  inst.controller = p;
  inst.summonedTurn = s.players[p].turnsTaken;
  inst.sick = !hasHaste(s, p, inst);
  inst.tapped = false;
  const me = champOf(s, p);
  if (me.passive.type === "wardOnPlay") inst.ward += 1;
  if (me.passive.type === "firstCopy" && !s.players[p].firstCardPlayed) {
    inst.toughness += 1;
    inst.maxToughness += 1;
  }
  s.players[p].board.push(inst.iid);
}

function hasHaste(s: MatchState, p: 0 | 1, inst: CardInstance): boolean {
  if (inst.keywords.includes("haste")) return true;
  return champOf(s, p).passive.type === "grantHaste";
}

function drawOne(s: MatchState, p: 0 | 1, reason = "draw"): boolean {
  const pl = s.players[p];
  if (pl.library.length === 0) {
    pl.fatigue += 1;
    damagePlayer(s, p, pl.fatigue, null);
    log(s, `Fatigue ${pl.fatigue}`, p);
    return false;
  }
  const id = pl.library.shift()!;
  if (pl.hand.length >= HAND_CAP) {
    pl.gy.push(id);
    log(s, `Burned a card (${reason})`, p);
    return false;
  }
  pl.hand.push(id);
  return true;
}

export function damagePlayer(s: MatchState, p: 0 | 1, n: number, src: CardInstance | null) {
  if (n <= 0 || s.winner !== null) return;
  const before = s.players[p].life;
  s.players[p].life = Math.max(0, before - n);
  const dealt = before - s.players[p].life;
  log(s, `HP −${dealt} (${s.players[p].life}/${maxLifeOf(s, p)})`, p);
  if (src && src.keywords.includes("lightDrain") && !src.silenced) {
    healPlayer(s, src.controller, dealt);
  }
  const atkChamp = src ? champOf(s, src.controller) : null;
  if (atkChamp?.passive.type === "damageMills") mill(s, p, 1);
  if (s.players[p].life <= 0) {
    s.winner = opp(p);
    s.phase = "over";
    s.winReason = `${s.players[p].name} reached 0 HP.`;
    log(s, `${s.players[opp(p)].name} wins — ${s.players[p].name} fell to 0 HP.`);
  }
}

function mill(s: MatchState, p: 0 | 1, n: number) {
  const pl = s.players[p];
  for (let i = 0; i < n; i++) {
    if (pl.library.length === 0) {
      damagePlayer(s, p, 1, null);
      break;
    }
    const id = pl.library.shift()!;
    pl.gy.push(id);
  }
}

function kill(s: MatchState, inst: CardInstance, silent = false) {
  const pl = s.players[inst.controller];
  pl.board = pl.board.filter((x) => x !== inst.iid);
  if (!inst.isToken) pl.gy.push(inst.iid);
  if (!silent) {
    const def = CARD_BY_ID[inst.cardId];
    log(s, `${def?.name ?? "Minion"} falls.`, inst.controller);
    if (!inst.silenced && def?.onDeath.length) {
      resolveEffects(s, inst.controller, def.onDeath, inst, undefined);
    }
    const c = champOf(s, inst.controller);
    if (c.passive.type === "deathDrawOnce" && !pl.deathDrawUsed) {
      pl.deathDrawUsed = true;
      drawOne(s, inst.controller, "echo");
    }
  }
}

function dealMinion(s: MatchState, inst: CardInstance, n: number, src: CardInstance | null, targeted: boolean) {
  if (n <= 0) return;
  if (targeted && inst.ward > 0) {
    inst.ward -= 1;
    log(s, `${CARD_BY_ID[inst.cardId]?.name ?? "Minion"}'s Ward holds.`);
    return;
  }
  inst.toughness -= n;
  if (src?.keywords.includes("lightDrain") && !src.silenced) {
    healPlayer(s, src.controller, n);
  }
  const atkChamp = src ? champOf(s, src.controller) : null;
  if (atkChamp?.passive.type === "damageMills") mill(s, inst.controller, 1);
  if (currentTough(inst) <= 0) kill(s, inst);
}

function spellBonus(s: MatchState, p: 0 | 1): number {
  const c = champOf(s, p);
  return c.passive.type === "spellDamage" ? c.passive.value : 0;
}

function pickRandomEnemyMinion(s: MatchState, p: 0 | 1): CardInstance | undefined {
  const board = s.players[opp(p)].board
    .map((id) => s.cards[id])
    .filter((x): x is CardInstance => !!x);
  if (!board.length) return undefined;
  const r = rngInt(s.rng, board.length);
  s.rng = r.state;
  return board[r.n];
}

function summonToken(s: MatchState, p: 0 | 1, power: number, tough: number, name: string) {
  const pl = s.players[p];
  if (pl.board.length >= BOARD_CAP) return;
  const id = tokenCardId(name, power, tough);
  if (!CARD_BY_ID[id]) {
    (CARD_BY_ID as Record<string, (typeof CARD_BY_ID)[string]>)[id] = {
      id,
      name,
      type: "minion",
      championId: pl.championId,
      rarity: "common",
      cost: 0,
      power,
      toughness: tough,
      keywords: [],
      copies: 0,
      onPlay: [],
      onDeath: [],
      onAttack: [],
      text: "Token.",
    };
  }
  const inst = spawnCard(s, id, p, {
    power,
    toughness: tough,
    maxToughness: tough,
    isToken: true,
  });
  enterBoard(s, inst, p);
}

function tokenCardId(name: string, p: number, t: number) {
  return `token-${name.toLowerCase().replace(/\s+/g, "-")}-${p}-${t}`;
}

function resolveOne(
  s: MatchState,
  p: 0 | 1,
  e: Effect,
  src: CardInstance | null,
  targetId?: string,
): void {
  const bonus = src && CARD_BY_ID[src.cardId]?.type !== "minion" ? spellBonus(s, p) : 0;
  const me = s.players[p];
  const you = s.players[opp(p)];
  const tgt = targetId ? s.cards[targetId] : undefined;

  switch (e.op) {
    case "draw":
      for (let i = 0; i < (e.n ?? 1); i++) drawOne(s, p);
      break;
    case "drawOpp":
      for (let i = 0; i < (e.n ?? 1); i++) drawOne(s, opp(p));
      break;
    case "dmg": {
      const n = (e.n ?? 1) + bonus;
      if (targetId === FACE_TARGET) {
        damagePlayer(s, opp(p), n, src);
      } else if (tgt) dealMinion(s, tgt, n, src, true);
      else {
        const r = pickRandomEnemyMinion(s, p);
        if (r) dealMinion(s, r, n, src, false);
        else damagePlayer(s, opp(p), n, src);
      }
      break;
    }
    case "dmgF":
      damagePlayer(s, opp(p), (e.n ?? 1) + bonus, src);
      break;
    case "dmgAllE":
      for (const id of [...you.board]) {
        const m = s.cards[id];
        if (m) dealMinion(s, m, (e.n ?? 1) + bonus, src, false);
      }
      break;
    case "heal":
      healPlayer(s, p, e.n ?? 1);
      break;
    case "buff":
      if (tgt) {
        tgt.power += e.n ?? 1;
        tgt.toughness += e.n2 ?? e.n ?? 1;
        tgt.maxToughness += e.n2 ?? e.n ?? 1;
      }
      break;
    case "buffSelf":
      if (src) {
        src.power += e.n ?? 1;
        src.toughness += e.n2 ?? e.n ?? 1;
        src.maxToughness += e.n2 ?? e.n ?? 1;
      }
      break;
    case "pumpAll":
      for (const id of me.board) {
        const m = s.cards[id];
        if (!m) continue;
        m.power += e.n ?? 1;
        m.toughness += e.n2 ?? e.n ?? 1;
        m.maxToughness += e.n2 ?? e.n ?? 1;
      }
      break;
    case "tempMana":
      me.tempMana += e.n ?? 1;
      break;
    case "tempManaNext":
      me.pendingMana.push({ amount: e.n ?? 1, turns: e.n2 ?? 1 });
      break;
    case "discard": {
      for (let i = 0; i < (e.n ?? 1); i++) {
        if (!you.hand.length) break;
        const r = rngInt(s.rng, you.hand.length);
        s.rng = r.state;
        const id = you.hand.splice(r.n, 1)[0]!;
        you.gy.push(id);
      }
      break;
    }
    case "mill":
      mill(s, opp(p), e.n ?? 1);
      break;
    case "destroy":
      if (tgt) kill(s, tgt);
      break;
    case "bounce":
      if (tgt) {
        const owner = s.players[tgt.controller];
        owner.board = owner.board.filter((x) => x !== tgt.iid);
        if (tgt.isToken) {
          delete s.cards[tgt.iid];
        } else {
          tgt.controller = tgt.owner;
          tgt.tapped = false;
          tgt.sick = true;
          tgt.toughness = tgt.maxToughness;
          s.players[tgt.owner].hand.push(tgt.iid);
          if (s.players[tgt.owner].hand.length > HAND_CAP) {
            s.players[tgt.owner].hand.pop();
            s.players[tgt.owner].gy.push(tgt.iid);
          }
        }
      }
      break;
    case "silence": {
      const m = tgt ?? pickRandomEnemyMinion(s, p);
      if (m) {
        if (m.ward > 0) {
          m.ward -= 1;
          break;
        }
        m.silenced = true;
        m.keywords = [];
      }
      break;
    }
    case "token":
      summonToken(s, p, e.n ?? 1, e.n2 ?? 1, e.name ?? "Echo");
      break;
    case "returnGy": {
      const id = targetId && me.gy.includes(targetId) ? targetId : me.gy.find((g) => CARD_BY_ID[s.cards[g]?.cardId ?? ""]?.type === "minion");
      if (!id) break;
      me.gy = me.gy.filter((x) => x !== id);
      if (me.hand.length < HAND_CAP) me.hand.push(id);
      else me.gy.push(id);
      break;
    }
    case "untap":
      if (tgt) {
        tgt.tapped = false;
        tgt.sick = false;
      }
      break;
    case "wardAll":
      for (const id of me.board) {
        const m = s.cards[id];
        if (m) m.ward += 1;
      }
      break;
    case "lifeOpp":
      damagePlayer(s, p, e.n ?? 1, null);
      break;
    case "stealLife":
      damagePlayer(s, opp(p), e.n ?? 1, src);
      healPlayer(s, p, e.n ?? 1);
      break;
    case "copyMinion":
      if (tgt && me.board.length < BOARD_CAP) {
        summonToken(s, p, 1, 1, CARD_BY_ID[tgt.cardId]?.name ?? "Copy");
      }
      break;
    case "readyAll":
      for (const id of me.board) {
        const m = s.cards[id];
        if (m) {
          m.tapped = false;
          m.sick = false;
        }
      }
      break;
    case "tempBuff":
      if (tgt) {
        tgt.eotPower += e.n ?? 1;
        tgt.eotTough += e.n2 ?? 0;
      }
      break;
  }
}

function resolveEffects(
  s: MatchState,
  p: 0 | 1,
  effects: Effect[],
  src: CardInstance | null,
  targetId?: string,
) {
  for (const e of effects) {
    if (s.winner !== null) return;
    resolveOne(s, p, e, src, targetId);
  }
}

export function legalTargets(s: MatchState, p: 0 | 1, kind: TargetKind, fx?: Effect[]): string[] {
  const me = s.players[p];
  const you = s.players[opp(p)];
  if (kind === "none") return [];
  let ids: string[] = [];
  if (kind === "enemyMinion") ids = you.board.slice();
  else if (kind === "allyMinion") ids = me.board.slice();
  else if (kind === "anyMinion") ids = me.board.concat(you.board);
  else if (kind === "allyGrave") {
    ids = me.gy.filter((id) => {
      const d = CARD_BY_ID[s.cards[id]?.cardId ?? ""];
      return d?.type === "minion";
    });
  }
  if (fx && allowsFace(fx) && (kind === "enemyMinion" || kind === "anyMinion")) {
    ids.push(FACE_TARGET);
  }
  return ids;
}

function canAttack(s: MatchState, inst: CardInstance): boolean {
  if (inst.tapped || inst.controller !== s.active) return false;
  if (inst.sick && !hasHaste(s, inst.controller, inst)) return false;
  return true;
}

export function canDeclareAttack(s: MatchState, inst: CardInstance): boolean {
  return canAttack(s, inst);
}

function effectsForPlay(s: MatchState, p: 0 | 1, iid: string, choice?: number): Effect[] {
  const def = defOf(iid, s);
  if (!def) return [];
  if (def.choices && choice !== undefined && def.choices[choice]) return def.choices[choice].effects;
  return def.onPlay;
}

export function getLegalActions(s: MatchState): Action[] {
  if (s.phase === "over" || s.winner !== null) return [];
  const p = s.active;
  const pl = s.players[p];
  const acts: Action[] = [];

  if (s.phase === "mulligan") {
    acts.push({ type: "mulligan", keep: true });
    if (!s.mulliganUsed[p]) acts.push({ type: "mulligan", keep: false });
    return acts;
  }

  if (s.phase === "attack") {
    for (const id of pl.board) {
      const m = s.cards[id];
      if (m && (canAttack(s, m) || s.attackers.includes(id))) {
        acts.push({ type: "toggleAttacker", iid: id });
      }
    }
    acts.push({ type: "confirmAttack" });
    return acts;
  }

  if (s.phase === "block") {
    const defender = opp(s.active);
    const defPl = s.players[defender];
    const used = new Set(Object.values(s.blocks));
    for (const a of s.attackers) {
      acts.push({ type: "setBlock", attacker: a, blocker: null });
      for (const b of defPl.board) {
        const blk = s.cards[b];
        if (!blk || blk.tapped) continue;
        if (used.has(b) && s.blocks[a] !== b) continue;
        const atk = s.cards[a];
        if (!atk) continue;
        if (atk.keywords.includes("latticeWalk") && !blk.keywords.includes("latticeWalk")) continue;
        acts.push({ type: "setBlock", attacker: a, blocker: b });
      }
    }
    acts.push({ type: "confirmBlock" });
    return acts;
  }

  // main
  acts.push({ type: "endTurn" });
  acts.push({ type: "concede" });
  if (!pl.combatUsed) {
    if (pl.board.some((id) => {
      const m = s.cards[id];
      return m && canAttack(s, m);
    })) {
      acts.push({ type: "beginCombat" });
    }
    acts.push({ type: "skipCombat" });
  }

  const hero = champOf(s, p);
  if (!pl.heroUsed && manaAvail(pl) >= hero.abilityCost) {
    if (hero.abilityChoices) {
      hero.abilityChoices.forEach((c, i) => {
        const k = needsTarget(c.effects);
        if (k === "none") acts.push({ type: "hero", choice: i });
        else {
          const ts = legalTargets(s, p, k, c.effects);
          for (const t of ts) acts.push({ type: "hero", choice: i, target: t });
          if (!requiresTarget(c.effects) && !ts.includes(FACE_TARGET)) {
            acts.push({ type: "hero", choice: i });
          }
        }
      });
    } else {
      const kind = needsTarget(hero.ability);
      if (kind === "none") acts.push({ type: "hero" });
      else {
        const ts = legalTargets(s, p, kind, hero.ability);
        for (const t of ts) acts.push({ type: "hero", target: t });
        if (!requiresTarget(hero.ability) && !ts.length) acts.push({ type: "hero" });
      }
    }
  }

  for (const hid of pl.hand) {
    const def = defOf(hid, s);
    if (!def) continue;
    const cost = playCost(s, p, hid);
    if (manaAvail(pl) < cost) continue;
    if (def.type === "minion" && pl.board.length >= BOARD_CAP) continue;
    const fx = effectsForPlay(s, p, hid);
    const kind = needsTarget(fx);
    if (kind === "none") {
      acts.push({ type: "play", iid: hid });
      continue;
    }
    const ts = legalTargets(s, p, kind, fx);
    for (const t of ts) acts.push({ type: "play", iid: hid, target: t });
    if (def.type === "minion" || !requiresTarget(fx)) {
      if (!ts.includes(FACE_TARGET)) acts.push({ type: "play", iid: hid });
    }
  }
  return acts;
}

function startTurn(s: MatchState, p: 0 | 1) {
  const pl = s.players[p];
  pl.turnsTaken += 1;
  pl.permanentMana = Math.min(20, pl.turnsTaken);
  pl.tempMana = 0;
  pl.spent = 0;
  pl.heroUsed = false;
  pl.firstCardPlayed = false;
  pl.deathDrawUsed = false;
  pl.combatUsed = false;
  pl.copyUsed = false;
  s.combatThisTurn = false;
  s.attackers = [];
  s.blocks = {};
  s.active = p;
  s.phase = "main";
  s.turn += 1;

  const add: PendingManaKeep[] = [];
  for (const pend of pl.pendingMana) {
    pl.tempMana += pend.amount;
    if (pend.turns - 1 > 0) add.push({ amount: pend.amount, turns: pend.turns - 1 });
  }
  pl.pendingMana = add;

  for (const id of pl.board) {
    const m = s.cards[id];
    if (!m) continue;
    m.tapped = false;
    m.sick = false;
    m.eotPower = 0;
    m.eotTough = 0;
  }

  const skipDraw = p === s.first && pl.turnsTaken === 1;
  if (!skipDraw) drawOne(s, p, "turn");

  const c = champOf(s, p);
  if (c.passive.type === "chaosDawn") {
    const r = nextRng(s.rng);
    s.rng = r.state;
    if (r.value < 0.5) drawOne(s, p, "zeta");
    else healPlayer(s, p, 1);
  }
  if (c.passive.type === "emptyDraw" && pl.board.length === 0) drawOne(s, p, "horizon");

  log(s, `${pl.name} — dawn ${pl.turnsTaken}. Mana ${pl.permanentMana}.`, p);
}

type PendingManaKeep = { amount: number; turns: number };

function endTurn(s: MatchState) {
  const p = s.active;
  const pl = s.players[p];
  const c = champOf(s, p);
  if (c.passive.type === "endHeal") healPlayer(s, p, c.passive.value);
  for (const id of pl.board) {
    const m = s.cards[id];
    if (!m) continue;
    m.eotPower = 0;
    m.eotTough = 0;
  }
  pl.tempMana = 0;
  startTurn(s, opp(p));
}

function resolveCombat(s: MatchState) {
  const atkP = s.active;
  const defP = opp(atkP);
  for (const aId of s.attackers) {
    if (s.winner !== null) break;
    const atk = s.cards[aId];
    if (!atk || !s.players[atkP].board.includes(aId)) continue;
    const bId = s.blocks[aId];
    const blk = bId ? s.cards[bId] : undefined;
    const ap = currentPower(s, atk);
    if (blk && s.players[defP].board.includes(blk.iid)) {
      const bp = currentPower(s, blk);
      const overflow = Math.max(0, ap - currentTough(blk));
      dealMinion(s, blk, ap, atk, false);
      dealMinion(s, atk, bp, blk, false);
      if (atk.keywords.includes("accordBreak") && overflow > 0 && s.cards[aId]) {
        damagePlayer(s, defP, overflow, atk);
      }
    } else {
      damagePlayer(s, defP, ap, atk);
    }
    if (s.cards[aId] && !atk.keywords.includes("sealGuard")) atk.tapped = true;
  }
  s.attackers = [];
  s.blocks = {};
  s.phase = "main";
  s.players[atkP].combatUsed = true;
  log(s, "Assault resolves.");
}

function applyMulligan(s: MatchState, keep: boolean) {
  const p = s.active;
  const pl = s.players[p];
  if (!keep && !s.mulliganUsed[p]) {
    s.mulliganUsed[p] = true;
    pl.library.push(...pl.hand);
    pl.hand = [];
    const sh = shuffle(pl.library, s.rng);
    pl.library = sh.list;
    s.rng = sh.state;
    for (let i = 0; i < START_HAND; i++) drawOne(s, p, "mulligan");
    log(s, `${pl.name} redraws.`, p);
    return;
  }
  log(s, `${pl.name} keeps.`, p);
  if (p === 0) {
    s.active = 1;
    return;
  }
  startTurn(s, 0);
}

export function applyAction(state: MatchState, action: Action): MatchState {
  const s = structuredClone(state) as MatchState;
  if (s.winner !== null) return s;
  const p = s.active;
  const pl = s.players[p];

  switch (action.type) {
    case "mulligan":
      applyMulligan(s, action.keep);
      break;
    case "play": {
      if (s.phase !== "main") break;
      if (!pl.hand.includes(action.iid)) break;
      const def = defOf(action.iid, s);
      if (!def) break;
      const cost = playCost(s, p, action.iid);
      if (manaAvail(pl) < cost) break;
      if (def.type === "minion" && pl.board.length >= BOARD_CAP) break;
      pl.spent += cost;
      pl.hand = pl.hand.filter((x) => x !== action.iid);
      const inst = s.cards[action.iid]!;
      let fx = def.onPlay;
      if (def.choices && action.choice !== undefined) fx = def.choices[action.choice]?.effects ?? fx;
      if (def.type === "minion") {
        enterBoard(s, inst, p);
        log(s, `Summon ${def.name}.`, p);
      } else {
        pl.gy.push(inst.iid);
        log(s, `${def.type === "resonance" ? "Resonance" : "Spell"}: ${def.name}.`, p);
      }
      resolveEffects(s, p, fx, inst, action.target);
      if (def.type !== "minion") {
        for (const id of [...pl.board]) {
          const m = s.cards[id];
          if (!m || m.silenced || !m.keywords.includes("inspire")) continue;
          m.eotPower += 1;
          log(s, `${CARD_BY_ID[m.cardId]?.name ?? "Minion"} is inspired.`, p);
        }
      }
      pl.firstCardPlayed = true;
      break;
    }
    case "hero": {
      if (s.phase !== "main") break;
      const hero = champOf(s, p);
      if (pl.heroUsed) break;
      if (manaAvail(pl) < hero.abilityCost) break;
      pl.spent += hero.abilityCost;
      pl.heroUsed = true;
      const fx =
        hero.abilityChoices && action.choice !== undefined
          ? (hero.abilityChoices[action.choice]?.effects ?? hero.ability)
          : hero.ability;
      log(s, `${hero.name} — ${hero.abilityName}.`, p);
      resolveEffects(s, p, fx, null, action.target);
      break;
    }
    case "beginCombat":
      if (s.phase !== "main" || pl.combatUsed) break;
      s.phase = "attack";
      s.attackers = pl.board.filter((id) => {
        const m = s.cards[id];
        return !!m && canAttack(s, m);
      });
      log(s, s.attackers.length ? `Assault — ${s.attackers.length} ready.` : "Assault declared.", p);
      break;
    case "skipCombat":
      if (s.phase !== "main") break;
      pl.combatUsed = true;
      break;
    case "toggleAttacker": {
      if (s.phase !== "attack") break;
      const inst = s.cards[action.iid];
      if (!inst || inst.controller !== p) break;
      const i = s.attackers.indexOf(action.iid);
      if (i >= 0) s.attackers.splice(i, 1);
      else if (canAttack(s, inst)) s.attackers.push(action.iid);
      break;
    }
    case "confirmAttack":
      if (s.phase !== "attack") break;
      if (!s.attackers.length) {
        pl.combatUsed = true;
        s.phase = "main";
        break;
      }
      for (const aId of s.attackers) {
        const atk = s.cards[aId];
        if (!atk || atk.silenced) continue;
        const cdef = CARD_BY_ID[atk.cardId];
        if (cdef?.onAttack.length) {
          log(s, `${cdef.name} assaults.`, p);
          resolveEffects(s, p, cdef.onAttack, atk);
        }
      }
      s.phase = "block";
      s.blocks = {};
      log(s, `${s.attackers.length} assault(s).`, p);
      break;
    case "setBlock":
      if (s.phase !== "block") break;
      if (action.blocker === null) {
        delete s.blocks[action.attacker];
      } else {
        s.blocks[action.attacker] = action.blocker;
      }
      break;
    case "confirmBlock":
      if (s.phase !== "block") break;
      resolveCombat(s);
      break;
    case "endTurn":
      if (s.phase !== "main") break;
      endTurn(s);
      break;
    case "concede":
      s.winner = opp(p);
      s.phase = "over";
      s.winReason = `${pl.name} conceded.`;
      log(s, s.winReason);
      break;
  }
  return s;
}

export function createMatch(opts: {
  seed: number;
  lists: [string[], string[]];
  champions: [string, string];
  names: [string, string];
  humans: [boolean, boolean];
}): MatchState {
  let rng = opts.seed || 1;
  const cards: Record<string, CardInstance> = {};
  const mkPlayer = (p: 0 | 1): PlayerState => {
    const c = CHAMP_BY_ID[opts.champions[p]]!;
    const life = START_LIFE + (c.passive.type === "bonusLife" ? c.passive.value : 0);
    return {
      name: opts.names[p],
      championId: opts.champions[p],
      life,
      turnsTaken: 0,
      permanentMana: 0,
      tempMana: 0,
      pendingMana: [],
      spent: 0,
      library: [],
      hand: [],
      board: [],
      gy: [],
      exile: [],
      heroUsed: false,
      firstCardPlayed: false,
      deathDrawUsed: false,
      combatUsed: false,
      fatigue: 0,
      copyUsed: false,
    };
  };

  const s: MatchState = {
    seed: opts.seed,
    rng,
    seq: 0,
    turn: 0,
    active: 0,
    first: 0,
    phase: "mulligan",
    players: [mkPlayer(0), mkPlayer(1)],
    cards,
    log: [],
    winner: null,
    winReason: "",
    attackers: [],
    blocks: {},
    humans: opts.humans,
    names: opts.names,
    mulliganUsed: [false, false],
    combatThisTurn: false,
  };

  for (const p of [0, 1] as const) {
    const list = opts.lists[p];
    for (const cardId of list) {
      const inst = spawnCard(s, cardId, p);
      s.players[p].library.push(inst.iid);
    }
    const sh = shuffle(s.players[p].library, s.rng);
    s.players[p].library = sh.list;
    s.rng = sh.state;
    for (let i = 0; i < START_HAND; i++) drawOne(s, p, "open");
  }
  log(s, "The lattice opens. Mulligan.");
  return s;
}

export function isHuman(s: MatchState): boolean {
  return s.humans[s.active];
}

export function isHumanController(s: MatchState, p: 0 | 1): boolean {
  if (s.phase === "block") return s.humans[opp(s.active)];
  return s.humans[p];
}

export function combatPreview(
  s: MatchState,
  atkId: string,
  blkId?: string | null,
): { power: number; face: number; kills: boolean; dies: boolean; overflow: number } {
  const atk = s.cards[atkId];
  if (!atk) return { power: 0, face: 0, kills: false, dies: false, overflow: 0 };
  const ap = currentPower(s, atk);
  const blk = blkId ? s.cards[blkId] : undefined;
  if (!blk) return { power: ap, face: ap, kills: false, dies: false, overflow: 0 };
  const bp = currentPower(s, blk);
  const overflow = Math.max(0, ap - currentTough(blk));
  return {
    power: ap,
    face: atk.keywords.includes("accordBreak") ? overflow : 0,
    kills: ap >= currentTough(blk),
    dies: bp >= currentTough(atk),
    overflow,
  };
}

export function playBlockReason(s: MatchState, p: 0 | 1, hid: string): string | null {
  if (s.winner !== null) return "The lattice is closed";
  if (s.phase === "attack") return "Finish the assault first";
  if (s.phase === "block") return "Assign seals first";
  if (s.phase === "mulligan") return "Keep or redraw first";
  if (s.phase !== "main") return "Not your dawn";
  if (s.active !== p) return "Not your dawn";
  const def = defOf(hid, s);
  if (!def) return "Unknown card";
  const pl = s.players[p];
  if (!pl.hand.includes(hid)) return "Not in hand";
  const cost = playCost(s, p, hid);
  const have = manaAvail(pl);
  if (have < cost) return `Needs ${cost} mana · you have ${have}`;
  if (def.type === "minion" && pl.board.length >= BOARD_CAP) return "The field is full";
  const fx = effectsForPlay(s, p, hid);
  const kind = needsTarget(fx);
  if (kind !== "none" && def.type !== "minion") {
    const ts = legalTargets(s, p, kind, fx);
    if (!ts.length) {
      if (kind === "allyGrave") return "The Archive is empty";
      if (kind === "allyMinion") return "Needs a friendly minion";
      if (kind === "enemyMinion") return "Needs an enemy minion";
      return "No legal target";
    }
  }
  return null;
}

export function isLegalAction(s: MatchState, a: Action): boolean {
  return getLegalActions(s).some((x) => actionEq(x, a));
}

function actionEq(a: Action, b: Action): boolean {
  if (a.type !== b.type) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}
