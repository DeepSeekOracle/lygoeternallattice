import { CHAMP_BY_ID } from "@/lib/game/catalog";
import { cn } from "@/lib/utils";

const TINT: Record<string, string> = {
  lyra: "#9eb7c8",
  d9ra: "#b08968",
  srath: "#8a9098",
  arkos: "#6a9e9a",
  kairos: "#c4a574",
  aetheris: "#7ec8c0",
  scendr: "#8b92a8",
  sancora: "#8aaa9a",
  sephrael: "#a8b4c4",
  omnisiren: "#7a8690",
  lightfather: "#d5d0c4",
  volaris: "#c5ccd4",
  zeta: "#5e8f8a",
  justicae: "#9a958c",
  seidon: "#5b7c8a",
  nullvoid: "#8a5a5a",
  veil: "#6a6874",
  cosmara: "#b8c5c0",
};

export function champTint(id: string): string {
  if (TINT[id]) return TINT[id]!;
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  const hue = (h >>> 0) % 160;
  return `hsl(${hue} 18% 62%)`;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function Sigil({
  id,
  className,
  glyph,
}: {
  id: string;
  className?: string;
  glyph?: string;
}) {
  const h = hash(id);
  const champ = CHAMP_BY_ID[id.split("-")[0] ?? ""] ?? CHAMP_BY_ID[id];
  const tint = champTint(champ?.id ?? id.split("-")[0] ?? id);
  const n = 5 + (h % 5);
  const rings = 2 + (h % 3);
  const rot = (h % 360) * 0.15;
  const g =
    glyph ??
    champ?.name.replace(/[^A-ZΔΣΩΛΦΘÆ]/g, "").slice(0, 2) ??
    id.slice(0, 1).toUpperCase();

  const pts = Array.from({ length: n }, (_, i) => {
    const a = ((Math.PI * 2 * i) / n + rot) * (180 / Math.PI);
    const rad = 34;
    const x = 50 + rad * Math.cos((a * Math.PI) / 180);
    const y = 50 + rad * Math.sin((a * Math.PI) / 180);
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 100 100" className={cn("block", className)} aria-hidden>
      <rect width="100" height="100" fill="#0b0d12" />
      {Array.from({ length: rings }, (_, i) => (
        <circle
          key={i}
          cx="50"
          cy="50"
          r={16 + i * 10}
          fill="none"
          stroke={tint}
          strokeOpacity={0.35 - i * 0.08}
          strokeWidth="1.2"
        />
      ))}
      <polygon points={pts} fill="none" stroke={tint} strokeOpacity="0.7" strokeWidth="1.1" />
      <circle cx="50" cy="50" r="7" fill="none" stroke={tint} strokeWidth="1.4" />
      <text
        x="50"
        y="54"
        textAnchor="middle"
        fontSize="11"
        fill={tint}
        fontFamily="Georgia, serif"
      >
        {g.slice(0, 2)}
      </text>
    </svg>
  );
}
