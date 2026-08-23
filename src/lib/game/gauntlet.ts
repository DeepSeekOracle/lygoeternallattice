import { CHAMPIONS, defaultList, deckIssues } from "./catalog.ts";
import { createMatch, getLegalActions, applyAction } from "./engine.ts";
import { pickAction } from "./ai.ts";

export function runGauntlet(games = 12): { issues: string[]; results: string[]; errors: string[] } {
  const issues = CHAMPIONS.flatMap((c) => deckIssues(c.id));
  const results: string[] = [];
  const errors: string[] = [];
  const ids = CHAMPIONS.map((c) => c.id);
  for (let g = 0; g < games; g++) {
    const a = ids[g % ids.length]!;
    const b = ids[(g * 3 + 1) % ids.length]!;
    try {
      let s = createMatch({
        seed: 1000 + g * 97,
        lists: [defaultList(a), defaultList(b)],
        champions: [a, b],
        names: [a, b],
        humans: [false, false],
      });
      let steps = 0;
      while (s.winner === null && steps++ < 400) {
        const legal = getLegalActions(s);
        if (!legal.length) {
          errors.push(`no legal ${a} vs ${b} phase=${s.phase}`);
          break;
        }
        const act = pickAction(s, "normal");
        s = applyAction(s, act);
      }
      if (s.winner === null) results.push(`timeout ${a} vs ${b} t=${s.turn}`);
      else results.push(`${a} vs ${b} → P${s.winner} in ${s.turn} turns`);
    } catch (e) {
      errors.push(`${a} vs ${b}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return { issues, results, errors };
}

if (typeof process !== "undefined" && process.argv[1]?.includes("gauntlet")) {
  const r = runGauntlet(12);
  console.log("issues", r.issues);
  console.log("errors", r.errors);
  console.log(r.results.join("\n"));
}

