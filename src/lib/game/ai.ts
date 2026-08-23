import { CARD_BY_ID } from "./catalog";
import { applyAction, champOf, currentPower, getLegalActions, manaAvail } from "./engine";
import type { Action, Difficulty, MatchState } from "./types";

function evalSide(s: MatchState, p: 0 | 1): number {
  const pl = s.players[p];
  let v = pl.life * 3 + pl.hand.length * 2 + pl.library.length * 0.15;
  for (const id of pl.board) {
    const m = s.cards[id];
    if (!m) continue;
    v += currentPower(s, m) * 2.4 + m.toughness * 1.6 + 1.5;
  }
  v += manaAvail(pl) * 0.2;
  return v;
}

function scoreState(s: MatchState, p: 0 | 1): number {
  if (s.winner === p) return 10_000;
  if (s.winner === (p === 0 ? 1 : 0)) return -10_000;
  return evalSide(s, p) - evalSide(s, p === 0 ? 1 : 0);
}

function playable(a: Action): boolean {
  return a.type !== "concede";
}

function cheapKeep(s: MatchState): boolean {
  const p = s.active;
  return s.players[p].hand.some((id) => {
    const d = CARD_BY_ID[s.cards[id]?.cardId ?? ""];
    return d && d.cost <= 2;
  });
}

export function pickAction(s: MatchState, difficulty: Difficulty): Action {
  const legal = getLegalActions(s).filter(playable);
  if (!legal.length) return { type: "endTurn" };

  if (s.phase === "mulligan") {
    const keep = cheapKeep(s);
    if (keep) return { type: "mulligan", keep: true };
    if (legal.some((a) => a.type === "mulligan" && !a.keep)) return { type: "mulligan", keep: false };
    return { type: "mulligan", keep: true };
  }

  if (s.phase === "attack") {
    const toggles = legal.filter((a) => a.type === "toggleAttacker") as Extract<Action, { type: "toggleAttacker" }>[];
    for (const t of toggles) {
      if (!s.attackers.includes(t.iid)) return t;
    }
    return { type: "confirmAttack" };
  }

  if (s.phase === "block") {
    const p = s.active;
    const def = p === 0 ? 1 : 0;
    const unused = new Set(s.players[def].board.filter((id) => !Object.values(s.blocks).includes(id)));
    for (const a of s.attackers) {
      if (s.blocks[a]) continue;
      const atk = s.cards[a];
      if (!atk) continue;
      const ap = currentPower(s, atk);
      let best: string | null = null;
      let bestScore = -99;
      for (const b of unused) {
        const blk = s.cards[b];
        if (!blk) continue;
        if (atk.keywords.includes("latticeWalk") && !blk.keywords.includes("latticeWalk")) continue;
        const kills = currentPower(s, blk) >= atk.toughness;
        const dies = ap >= blk.toughness;
        let sc = 0;
        if (kills && !dies) sc = 6;
        else if (kills && dies) sc = 3;
        else if (!dies) sc = 1;
        else sc = ap >= 4 ? 2 : -1;
        if (sc > bestScore) {
          bestScore = sc;
          best = b;
        }
      }
      if (best && bestScore > 0) {
        unused.delete(best);
        return { type: "setBlock", attacker: a, blocker: best };
      }
    }
    return { type: "confirmBlock" };
  }

  if (difficulty === "easy") {
    const plays = legal.filter((a) => a.type === "play" || a.type === "hero");
    if (plays.length && Math.random() > 0.25) {
      return plays[Math.floor(Math.random() * plays.length)]!;
    }
    const combat = legal.find((a) => a.type === "beginCombat");
    if (combat && Math.random() > 0.4) return combat;
    const end = legal.find((a) => a.type === "endTurn");
    return end ?? legal[0]!;
  }

  const p = s.active;
  let best = legal[0]!;
  let bestV = -Infinity;
  const candidates = legal.filter((a) => a.type !== "skipCombat");
  const pool = difficulty === "hard" ? candidates : candidates.slice(0, Math.min(candidates.length, 18));
  for (const a of pool) {
    let v = 0;
    try {
      const next = applyAction(s, a);
      v = scoreState(next, p);
      if (a.type === "play") {
        const d = CARD_BY_ID[s.cards[a.iid]?.cardId ?? ""];
        v += (d?.cost ?? 0) * 0.8;
      }
      if (a.type === "hero") v += 2;
      if (a.type === "beginCombat") v += 1.5;
      if (a.type === "endTurn") v -= 0.4 * manaAvail(s.players[p]);
    } catch {
      v = -999;
    }
    if (v > bestV) {
      bestV = v;
      best = a;
    }
  }
  return best;
}

export function autoBlocks(s: MatchState): MatchState {
  let cur = s;
  let guard = 0;
  while (cur.phase === "block" && cur.winner === null && guard++ < 24) {
    const a = pickAction(cur, "normal");
    cur = applyAction(cur, a);
  }
  return cur;
}

export function autoAttackers(s: MatchState): MatchState {
  let cur = s;
  let guard = 0;
  while (cur.phase === "attack" && cur.winner === null && guard++ < 16) {
    const a = pickAction(cur, "normal");
    cur = applyAction(cur, a);
  }
  return cur;
}

export function takeAiTurn(s: MatchState, difficulty: Difficulty): MatchState {
  let cur = s;
  let guard = 0;
  const actor = () => (cur.phase === "block" ? ((cur.active === 0 ? 1 : 0) as 0 | 1) : cur.active);
  const startActor = actor();
  const startTurn = cur.players[startActor].turnsTaken;
  while (cur.winner === null && guard++ < 40) {
    const who = actor();
    if (cur.phase === "main" && who === startActor && cur.players[who].turnsTaken !== startTurn) break;
    if (cur.phase === "mulligan" && who !== startActor) break;
    const humanNow = cur.phase === "block" ? cur.humans[who] : cur.humans[who];
    if (humanNow) break;
    const a = pickAction(cur, difficulty);
    cur = applyAction(cur, a);
    if (a.type === "endTurn" || a.type === "mulligan") break;
  }
  return cur;
}
