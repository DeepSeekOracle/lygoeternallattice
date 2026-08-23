import type { Effect, TargetKind } from "./types";

export function parseFx(src: string): Effect[] {
  if (!src) return [];
  return src.split(",").filter(Boolean).map(parseOne);
}

function parseOne(part: string): Effect {
  const [op, ...rest] = part.split(":");
  const n = rest[0] !== undefined ? Number(rest[0]) : undefined;
  const n2 = rest[1] !== undefined ? Number(rest[1]) : undefined;
  switch (op) {
    case "draw":
      return { op: "draw", n: n ?? 1 };
    case "drawOpp":
      return { op: "drawOpp", n: n ?? 1 };
    case "dmgM":
      return { op: "dmg", n: n ?? 1, target: "enemyMinion" };
    case "dmgAny":
      return { op: "dmg", n: n ?? 1, target: "anyMinion" };
    case "dmgF":
      return { op: "dmgF", n: n ?? 1 };
    case "dmgAllE":
      return { op: "dmgAllE", n: n ?? 1 };
    case "heal":
      return { op: "heal", n: n ?? 1 };
    case "buff":
      return { op: "buff", n: n ?? 1, n2: n2 ?? n ?? 1, target: "allyMinion" };
    case "buffSelf":
      return { op: "buffSelf", n: n ?? 1, n2: n2 ?? n ?? 1 };
    case "pumpAll":
      return { op: "pumpAll", n: n ?? 1, n2: n2 ?? n ?? 1 };
    case "tempMana":
      return { op: "tempMana", n: n ?? 1 };
    case "tempManaNext":
      return { op: "tempManaNext", n: n ?? 1, n2: n2 ?? 1 };
    case "discard":
      return { op: "discard", n: n ?? 1 };
    case "mill":
      return { op: "mill", n: n ?? 1 };
    case "destroy":
      return { op: "destroy", target: "enemyMinion" };
    case "bounce":
      return { op: "bounce", target: "enemyMinion" };
    case "silence":
      return { op: "silence", target: "anyMinion" };
    case "token":
      return { op: "token", n: n ?? 1, n2: n2 ?? 1, name: rest[2] ?? "Echo" };
    case "tokenN":
      return { op: "token", n: n ?? 1, n2: n2 ?? 1, name: rest[2] ?? "Accord", target: rest[3] as TargetKind };
    case "returnGy":
      return { op: "returnGy", target: "allyGrave" };
    case "untap":
      return { op: "untap", target: "allyMinion" };
    case "wardAll":
      return { op: "wardAll" };
    case "lifeOpp":
      return { op: "lifeOpp", n: n ?? 1 };
    case "stealLife":
      return { op: "stealLife", n: n ?? 1 };
    case "copyMinion":
      return { op: "copyMinion", target: "allyMinion" };
    case "readyAll":
      return { op: "readyAll" };
    default:
      return { op: "draw", n: 0 };
  }
}

export function needsTarget(effects: Effect[]): TargetKind {
  for (const e of effects) {
    if (e.target && e.target !== "none") return e.target;
  }
  return "none";
}

export const KW: Record<string, import("./types").Keyword> = {
  L: "latticeWalk",
  S: "sealGuard",
  D: "lightDrain",
  A: "accordBreak",
  H: "haste",
  W: "ward",
};

export function parseKw(src: string): import("./types").Keyword[] {
  const out: import("./types").Keyword[] = [];
  for (const ch of src) {
    const k = KW[ch];
    if (k) out.push(k);
  }
  return out;
}
