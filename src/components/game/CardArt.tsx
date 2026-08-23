import { CARD_BY_ID } from "@/lib/game/catalog";
import type { CardType, Keyword } from "@/lib/game/types";
import { cn } from "@/lib/utils";
import { ChampPortrait, champPlate, champTint, hashId } from "./Sigil";

function stars(h: number, n: number) {
  return Array.from({ length: n }, (_, i) => {
    const x = 8 + ((h >>> (i * 3)) % 84);
    const y = 10 + ((h >>> (i * 5 + 2)) % 78);
    const r = 0.6 + ((h >>> (i + 7)) % 12) / 10;
    return { x, y, r };
  });
}

function poly(n: number, cx: number, cy: number, rad: number, rot: number) {
  return Array.from({ length: n }, (_, i) => {
    const a = (Math.PI * 2 * i) / n + rot;
    return `${cx + rad * Math.cos(a)},${cy + rad * Math.sin(a)}`;
  }).join(" ");
}

export function CardArt({
  cardId,
  className,
}: {
  cardId: string;
  className?: string;
}) {
  const def = CARD_BY_ID[cardId];
  const champId = def?.championId ?? cardId.split("-")[0] ?? cardId;
  const tint = champTint(champId);
  const h = hashId(cardId);
  const dx = 38 + (h % 28);
  const dy = 28 + ((h >>> 6) % 26);
  const plate = champPlate(champId);
  const type: CardType = def?.type ?? "minion";
  const n = 5 + (h % 4);
  const rot = ((h % 360) * Math.PI) / 180;
  const pts = poly(n, 50, 52, 28 + (h % 8), rot);
  const ringN = 2 + (h % 3);
  const spark = stars(h, 7 + (h % 5));
  const kws: Keyword[] = def?.keywords ?? [];

  return (
    <div className={cn("relative overflow-hidden bg-bg", className)}>
      {plate ? (
        <img
          src={plate}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            objectPosition: `${dx}% ${dy}%`,
            filter:
              def?.rarity === "signature"
                ? "saturate(1.05) contrast(1.08)"
                : def?.rarity === "rare"
                  ? "saturate(1.02) contrast(1.05)"
                  : "saturate(0.92) contrast(1.04)",
          }}
        />
      ) : (
        <ChampPortrait id={champId} className="absolute inset-0" />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            type === "spell"
              ? `radial-gradient(ellipse at 50% 40%, ${tint}33, transparent 62%), linear-gradient(180deg, transparent 40%, #07080cdd)`
              : type === "resonance"
                ? `radial-gradient(circle at 50% 50%, ${tint}44, transparent 58%), linear-gradient(180deg, transparent 35%, #07080ce8)`
                : `linear-gradient(180deg, transparent 46%, #07080cdb)`,
        }}
      />
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        {spark.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={tint} opacity={0.35 + (i % 3) * 0.15} />
        ))}
        {Array.from({ length: ringN }, (_, i) => (
          <circle
            key={i}
            cx="50"
            cy="52"
            r={18 + i * 9}
            fill="none"
            stroke={tint}
            strokeOpacity={0.18 - i * 0.04}
            strokeWidth="0.7"
          />
        ))}
        <polygon
          points={pts}
          fill="none"
          stroke={tint}
          strokeOpacity={type === "minion" ? 0.55 : 0.35}
          strokeWidth="1.05"
        />
        {type === "spell" && (
          <>
            <path
              d={`M50 18 L${54 + (h % 4)} 50 L50 84 L${46 - (h % 4)} 50 Z`}
              fill="none"
              stroke={tint}
              strokeOpacity="0.55"
              strokeWidth="0.9"
            />
            <circle cx="50" cy="50" r="4" fill={tint} opacity="0.35" />
          </>
        )}
        {type === "resonance" && (
          <>
            <circle cx="50" cy="50" r="11" fill="none" stroke={tint} strokeWidth="1.4" opacity="0.7" />
            <circle cx="50" cy="50" r="5" fill={tint} opacity="0.45" />
          </>
        )}
        {kws.includes("latticeWalk") && (
          <path d="M18 78 L50 22 L82 78" fill="none" stroke={tint} strokeOpacity="0.28" strokeWidth="0.8" />
        )}
        {kws.includes("sealGuard") && (
          <rect x="42" y="44" width="16" height="18" rx="2" fill="none" stroke={tint} strokeOpacity="0.45" />
        )}
        {kws.includes("haste") && (
          <path d="M58 30 L70 48 L62 48 L74 70" fill="none" stroke={tint} strokeOpacity="0.5" strokeWidth="1.1" />
        )}
        {def?.rarity === "signature" && (
          <circle cx="50" cy="52" r="36" fill="none" stroke={tint} strokeOpacity="0.35" strokeWidth="1.6" />
        )}
      </svg>
    </div>
  );
}
