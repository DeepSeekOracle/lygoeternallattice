import assert from "node:assert/strict";
import test from "node:test";
import { CARD_BY_ID, defaultList } from "./catalog.ts";
import { MISSIONS } from "./campaign.ts";
import {
  applyAction,
  createMatch,
  damagePlayer,
  getLegalActions,
  healPlayer,
  maxLifeOf,
  playBlockReason,
  playCost,
} from "./engine.ts";
import { FACE_TARGET } from "./fx.ts";
import { takeAiTurn } from "./ai.ts";
import { runGauntlet } from "./gauntlet.ts";

function open(a = "lyra", b = "d9ra", seed = 7) {
  let s = createMatch({
    seed,
    lists: [defaultList(a), defaultList(b)],
    champions: [a, b],
    names: [a, b],
    humans: [true, false],
  });
  s = applyAction(s, { type: "mulligan", keep: true });
  s = applyAction(s, { type: "mulligan", keep: true });
  return s;
}

test("mulligan keep opens player 0 main with mana 1", () => {
  const s = open();
  assert.equal(s.phase, "main");
  assert.equal(s.active, 0);
  assert.equal(s.players[0].permanentMana, 1);
  assert.ok(s.players[0].hand.length >= 4);
});

test("a playable 1-drop summons onto the board", () => {
  const s = open("d9ra", "lyra", 11);
  const hid = s.players[0].hand.find((id) => {
    const d = CARD_BY_ID[s.cards[id]!.cardId];
    return d && d.type === "minion" && playCost(s, 0, id) <= 1;
  });
  assert.ok(hid, "expected a 1-mana minion in opening hand");
  const next = applyAction(s, { type: "play", iid: hid! });
  assert.equal(next.players[0].board.length, 1);
  assert.ok(next.players[0].board.includes(hid!));
  assert.ok(!next.players[0].hand.includes(hid!));
});

test("targeted minion is still playable with an empty enemy board", () => {
  const s = open("justicae", "lyra", 3);
  const hid = s.players[0].hand.find((id) => CARD_BY_ID[s.cards[id]!.cardId]?.id === "jus-gavel");
  if (!hid) return; // opening hand is rng; skip if not drawn
  const plays = getLegalActions(s).filter((a) => a.type === "play" && a.iid === hid);
  assert.ok(plays.length, "Small Gavel must be playable with no enemy minions");
  const next = applyAction(s, plays[0]!);
  assert.equal(next.players[0].board.length, 1);
});

test("damage spells can hit the Champion face", () => {
  let s = open("aetheris", "lyra", 21);
  // force a dmg spell into hand if absent
  const spellId = Object.values(s.cards).find((c) => c.cardId === "aeth-spark" && c.owner === 0)?.iid;
  if (spellId && !s.players[0].hand.includes(spellId)) {
    s = structuredClone(s);
    s.players[0].hand.push(spellId);
    s.players[0].permanentMana = 3;
  }
  if (!spellId || !s.players[0].hand.includes(spellId)) return;
  const plays = getLegalActions(s).filter((a) => a.type === "play" && a.iid === spellId);
  assert.ok(plays.some((a) => a.type === "play" && a.target === FACE_TARGET));
  const next = applyAction(s, { type: "play", iid: spellId, target: FACE_TARGET });
  assert.ok(next.players[1].life < s.players[1].life);
});

test("destroy spells stay illegal without an enemy minion", () => {
  const s = open("srath", "lyra", 5);
  const hid = s.players[0].hand.find((id) => CARD_BY_ID[s.cards[id]!.cardId]?.id === "srath-omit");
  if (!hid) return;
  s.players[0].permanentMana = 5;
  const reason = playBlockReason(s, 0, hid);
  const plays = getLegalActions(s).filter((a) => a.type === "play" && a.iid === hid);
  assert.equal(plays.length, 0);
  assert.ok(reason);
});

test("assault auto-selects ready attackers", () => {
  let s = open("d9ra", "lyra", 11);
  const hid = s.players[0].hand.find((id) => {
    const d = CARD_BY_ID[s.cards[id]!.cardId];
    return d && d.type === "minion" && (d.keywords.includes("haste") || playCost(s, 0, id) <= 1);
  });
  if (!hid) return;
  s = applyAction(s, { type: "play", iid: hid });
  const inst = s.cards[hid]!;
  if (inst.sick && !inst.keywords.includes("haste")) return;
  s = applyAction(s, { type: "beginCombat" });
  assert.equal(s.phase, "attack");
  assert.ok(s.attackers.includes(hid));
});

test("gauntlet still closes matches", () => {
  const r = runGauntlet(8);
  assert.equal(r.errors.length, 0, r.errors.join(" | "));
  assert.ok(r.results.every((x) => !x.startsWith("timeout")), r.results.join("\n"));
});

test("HP: face damage reduces life and 0 HP ends the match", () => {
  let s = open();
  const max = maxLifeOf(s, 1);
  assert.equal(s.players[1].life, max);
  s = structuredClone(s);
  damagePlayer(s, 1, 7, null);
  assert.equal(s.players[1].life, max - 7);
  assert.equal(s.winner, null);
  damagePlayer(s, 1, 99, null);
  assert.equal(s.players[1].life, 0);
  assert.equal(s.winner, 0);
  assert.equal(s.phase, "over");
  assert.match(s.winReason ?? "", /0 HP/);
});

test("HP: heal never exceeds max life", () => {
  let s = open("volaris", "lyra", 2);
  const max = maxLifeOf(s, 0);
  assert.ok(max >= 20);
  s = structuredClone(s);
  damagePlayer(s, 0, 3, null);
  healPlayer(s, 0, 50);
  assert.equal(s.players[0].life, max);
});

test("campaign Star Core match boots with working HP", () => {
  const m = MISSIONS[0];
  assert.equal(m!.id, "m0");
  const s = createMatch({
    seed: 42,
    lists: [defaultList(m!.player ?? "lyra"), defaultList(m!.opponent)],
    champions: [m!.player ?? "lyra", m!.opponent],
    names: ["Operator", "COSMARA"],
    humans: [true, false],
  });
  assert.equal(s.players[0].life, 20);
  assert.equal(s.players[1].life, 20);
  assert.ok(s.players[0].library.length + s.players[0].hand.length > 10);
  assert.ok(s.players[1].library.length > 10);
});

test("LYRA list has real Champion-face damage", () => {
  const list = defaultList("lyra");
  assert.equal(list.length, 29);
  const face = list.filter((id) => {
    const d = CARD_BY_ID[id];
    const fx = [...(d?.onPlay ?? []), ...(d?.onAttack ?? [])];
    return fx.some((e) => e.op === "dmgF" || (e.op === "dmg" && e.target !== "enemyMinion"));
  });
  assert.ok(face.length >= 8, `LYRA face cards: ${face.length}`);
});

test("Star Core (LYRA vs COSMARA) is actually winnable", () => {
  let wins = 0;
  for (let g = 0; g < 8; g++) {
    let s = createMatch({
      seed: 200 + g * 17,
      lists: [defaultList("lyra"), defaultList("cosmara")],
      champions: ["lyra", "cosmara"],
      names: ["LYRA", "COSMARA"],
      humans: [false, false],
    });
    let steps = 0;
    while (s.winner === null && steps++ < 500) {
      s = takeAiTurn(s, "normal");
      if (s.phase === "block") s = applyAction(s, { type: "confirmBlock" });
    }
    if (s.winner === 0) wins += 1;
  }
  assert.ok(wins >= 1, `LYRA won ${wins}/8 vs COSMARA`);
});

test("assault vs AI leaves main and lands unblocked hits", () => {
  let s = open("lyra", "cosmara", 9);
  s = structuredClone(s);
  const iid = Object.values(s.cards).find((c) => c.cardId === "lyra-bridge" && c.owner === 0)?.iid;
  assert.ok(iid);
  s.players[0].board.push(iid!);
  s.players[0].hand = s.players[0].hand.filter((id) => id !== iid);
  const inst = s.cards[iid!]!;
  inst.sick = false;
  inst.tapped = false;
  inst.controller = 0;
  s.players[1].board = [];
  const before = s.players[1].life;
  s = applyAction(s, { type: "beginCombat" });
  assert.equal(s.phase, "attack");
  s = applyAction(s, { type: "confirmAttack" });
  assert.equal(s.phase, "main", `stuck in ${s.phase}`);
  assert.ok(s.players[0].combatUsed);
  assert.ok(s.players[1].life < before, `life stayed ${s.players[1].life}`);
});
