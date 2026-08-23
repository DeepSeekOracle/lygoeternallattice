export function nextRng(state: number): { state: number; value: number } {
  let a = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { state: a, value };
}

export function rngInt(state: number, max: number): { state: number; n: number } {
  const r = nextRng(state);
  return { state: r.state, n: Math.floor(r.value * max) };
}

export function shuffle<T>(list: T[], state: number): { list: T[]; state: number } {
  const out = list.slice();
  let s = state;
  for (let i = out.length - 1; i > 0; i--) {
    const r = rngInt(s, i + 1);
    s = r.state;
    const j = r.n;
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return { list: out, state: s };
}

export function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
