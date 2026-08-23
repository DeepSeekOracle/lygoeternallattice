import { CARD_BY_ID, CHAMP_BY_ID, KEYWORD_TEXT, RARITY_LABEL } from "@/lib/game/catalog";
import type { CardInstance, Keyword } from "@/lib/game/types";
import { cn } from "@/lib/utils";
import { CardArt } from "./CardArt";
import { champTint } from "./Sigil";

const KW_LABEL: Record<Keyword, string> = {
  latticeWalk: "L-Walk",
  sealGuard: "Seal-Guard",
  lightDrain: "L-Drain",
  accordBreak: "Accord-Break",
  haste: "Haste",
  ward: "Ward",
  inspire: "Inspire",
};

const TYPE_LABEL = {
  minion: "Minion",
  spell: "Spell",
  resonance: "Resonance",
} as const;

export function CardFace({
  cardId,
  inst,
  size = "sm",
  selected,
  dim,
  playable,
  onClick,
  power,
  tough,
  playCost,
}: {
  cardId: string;
  inst?: CardInstance;
  size?: "xs" | "sm" | "md";
  selected?: boolean;
  dim?: boolean;
  playable?: boolean;
  onClick?: () => void;
  power?: number;
  tough?: number;
  playCost?: number;
}) {
  const def = CARD_BY_ID[cardId];
  if (!def) return null;
  const champ = CHAMP_BY_ID[def.championId];
  const tint = champTint(def.championId);
  const p = power ?? inst?.power ?? def.power;
  const t = tough ?? inst?.toughness ?? def.toughness;
  const damaged = inst ? t < inst.maxToughness : false;
  const shownCost = playCost ?? def.cost;
  const discounted = shownCost < def.cost;
  const taxed = shownCost > def.cost;
  const minion = def.type === "minion";
  const kws = inst?.keywords ?? def.keywords;
  const w =
    size === "md" ? "w-[248px]" : size === "xs" ? "w-[76px]" : "w-[100px] sm:w-[118px]";
  const rarityRing =
    def.rarity === "signature"
      ? "ring-1 ring-ivory/70"
      : def.rarity === "rare"
        ? "ring-1 ring-ivory/35"
        : def.rarity === "uncommon"
          ? "ring-1 ring-accent/40"
          : "";

  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={(e) => {
        if (!onClick) return;
        if (e.pointerType === "mouse" || e.pointerType === "touch") {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "relative shrink-0 text-left overflow-hidden bg-surface shadow-[0_12px_28px_rgba(0,0,0,0.45)] transition-[transform,box-shadow] duration-150",
        w,
        size === "md" ? "rounded-[18px]" : "rounded-[14px]",
        rarityRing,
        selected && "scale-[1.04] ring-2 ring-accent",
        dim && "opacity-45",
        playable && !dim && "card-playable",
        def.rarity === "signature" && "card-foil",
        def.rarity === "rare" && "card-sheen",
      )}
      style={{
        boxShadow: selected
          ? `0 0 0 1px ${tint}, 0 12px 28px rgba(0,0,0,0.45)`
          : undefined,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{ background: `linear-gradient(165deg, ${tint}26, transparent 46%)` }}
      />

      <div className="relative flex items-start justify-between px-1.5 pt-1.5 z-[1]">
        <span
          className={cn(
            "tabular font-medium rounded-full bg-bg/85 hairline leading-none",
            size === "xs" ? "text-[10px] px-1 py-0.5" : "text-[11px] px-1.5 py-0.5",
            discounted && "text-accent",
            taxed && "text-danger",
          )}
          style={discounted || taxed ? undefined : { color: tint }}
        >
          {shownCost}
        </span>
        <span
          className={cn(
            "uppercase tracking-[0.14em] text-muted",
            size === "xs" ? "text-[7px]" : "text-[8px]",
          )}
        >
          {def.type === "resonance" ? "Res" : TYPE_LABEL[def.type]}
        </span>
      </div>

      <div
        className={cn(
          "relative mx-1.5 mt-1 overflow-hidden rounded-[8px] hairline",
          size === "xs" ? "h-11" : size === "md" ? "h-36" : "h-[72px]",
        )}
      >
        <CardArt cardId={def.id} className="h-full w-full" />
        {def.rarity === "signature" && (
          <span className="absolute top-1 right-1 text-[7px] uppercase tracking-[0.16em] bg-bg/70 px-1 py-0.5 rounded-[4px] text-ivory">
            Seal
          </span>
        )}
      </div>

      <div
        className={cn(
          "relative px-1.5 pt-1 font-display leading-tight",
          size === "xs" ? "text-[10px] pb-1" : size === "md" ? "text-[17px]" : "text-[12px]",
        )}
      >
        {def.name}
      </div>

      {size !== "xs" && (
        <div className="px-1.5 flex items-center gap-1 flex-wrap">
          {kws.slice(0, size === "md" ? 6 : 3).map((k) => (
            <span
              key={k}
              className="text-[8px] uppercase tracking-[0.08em] text-accent-dim bg-bg/50 px-1 py-px rounded-[4px]"
              title={KEYWORD_TEXT[k]}
            >
              {KW_LABEL[k]}
            </span>
          ))}
          {inst && inst.ward > 0 && (
            <span className="text-[8px] uppercase tracking-[0.08em] text-ivory bg-bg/50 px-1 py-px rounded-[4px]">
              Ward
            </span>
          )}
        </div>
      )}

      {size !== "xs" && (
        <p
          className={cn(
            "px-1.5 pt-0.5 text-muted leading-snug",
            size === "md" ? "text-[11px] min-h-12" : "text-[9px] min-h-8 line-clamp-3",
          )}
        >
          {def.text}
        </p>
      )}

      {size === "md" && def.flavor && (
        <p className="px-1.5 pt-1 pb-0.5 text-[10px] italic text-subtle leading-snug">{def.flavor}</p>
      )}

      <div
        className={cn(
          "relative flex items-end justify-between px-1.5",
          size === "xs" ? "pb-1" : "pb-1.5 pt-0.5",
        )}
      >
        {size === "md" && champ ? (
          <span className="text-[9px] text-subtle truncate pr-2">
            {champ.name} · {RARITY_LABEL[def.rarity]}
          </span>
        ) : (
          <span className="text-[8px] text-subtle uppercase tracking-wider">
            {def.rarity === "common" ? "" : RARITY_LABEL[def.rarity]}
          </span>
        )}
        {minion && (
          <span
            className={cn(
              "tabular font-medium bg-bg/80 px-1.5 py-0.5 rounded-[6px] hairline",
              size === "md" ? "text-sm" : "text-[11px]",
              damaged && "text-danger",
            )}
          >
            <span style={{ color: tint }}>{p}</span>
            <span className="text-subtle">/</span>
            <span className={damaged ? "text-danger" : ""}>{t}</span>
          </span>
        )}
      </div>
    </button>
  );
}

export function BoardMinion({
  inst,
  power,
  attacking,
  blocking,
  onClick,
  mine,
  preview,
  targetable,
  fresh,
}: {
  inst: CardInstance;
  power: number;
  attacking?: boolean;
  blocking?: boolean;
  onClick?: () => void;
  mine?: boolean;
  preview?: { face: number; kills: boolean; dies: boolean };
  targetable?: boolean;
  fresh?: boolean;
}) {
  const def = CARD_BY_ID[inst.cardId];
  const tint = champTint(def?.championId ?? "");
  const damaged = inst.toughness < inst.maxToughness;
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={(e) => {
        if (!onClick) return;
        if (e.pointerType === "mouse" || e.pointerType === "touch") {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "relative w-[78px] sm:w-[92px] rounded-[14px] bg-raised overflow-hidden transition-transform duration-150 hairline",
        attacking && "ring-2 ring-accent -translate-y-2 shadow-[0_10px_24px_rgba(0,0,0,0.45)]",
        blocking && "ring-2 ring-fg/50",
        inst.tapped && "opacity-70 rotate-[4deg]",
        inst.sick && mine && "opacity-80",
        targetable && "target-pulse",
        fresh && "card-pop",
      )}
    >
      <div className="h-12 sm:h-14 overflow-hidden">
        <CardArt cardId={inst.cardId} className="h-full w-full" />
      </div>
      <div className="px-1 py-1">
        <div className="text-[10px] leading-tight truncate font-display">{def?.name ?? "Token"}</div>
        <div className="flex items-center justify-between mt-0.5 gap-1">
          <span className="text-[7px] text-muted truncate tracking-wide uppercase">
            {inst.keywords.map((k) => KW_LABEL[k]?.[0]).join("")}
            {inst.ward > 0 ? "W" : ""}
            {inst.silenced ? "×" : ""}
          </span>
          <span className="tabular text-[11px] font-medium">
            <span style={{ color: tint }}>{power}</span>
            <span className="text-subtle">/</span>
            <span className={damaged ? "text-danger" : ""}>{inst.toughness}</span>
          </span>
        </div>
      </div>
      {preview && attacking && (
        <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[9px] tabular bg-bg/90 hairline rounded-full px-1.5 py-px text-accent">
          {preview.face > 0 ? `${preview.face}` : preview.kills ? "trade" : "hit"}
        </span>
      )}
      {inst.ward > 0 && (
        <span
          className="absolute top-1 left-1 size-2 rounded-full bg-ivory/80"
          title="Ward"
        />
      )}
    </button>
  );
}

export function KeywordHint({ k }: { k: Keyword }) {
  return <span className="text-muted">{KEYWORD_TEXT[k]}</span>;
}
