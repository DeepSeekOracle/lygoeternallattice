import { CARD_BY_ID, CHAMP_BY_ID, KEYWORD_TEXT } from "@/lib/game/catalog";
import type { CardInstance, Keyword } from "@/lib/game/types";
import { cn } from "@/lib/utils";
import { Sigil, champTint } from "./Sigil";

const KW_LABEL: Record<Keyword, string> = {
  latticeWalk: "L-Walk",
  sealGuard: "Seal-Guard",
  lightDrain: "L-Drain",
  accordBreak: "Accord-Break",
  haste: "Haste",
  ward: "Ward",
};

export function CardFace({
  cardId,
  inst,
  size = "sm",
  selected,
  dim,
  onClick,
  power,
  tough,
}: {
  cardId: string;
  inst?: CardInstance;
  size?: "xs" | "sm" | "md";
  selected?: boolean;
  dim?: boolean;
  onClick?: () => void;
  power?: number;
  tough?: number;
}) {
  const def = CARD_BY_ID[cardId];
  if (!def) return null;
  const champ = CHAMP_BY_ID[def.championId];
  const tint = champTint(def.championId);
  const p = power ?? inst?.power ?? def.power;
  const t = tough ?? inst?.toughness ?? def.toughness;
  const w =
    size === "md" ? "w-[200px]" : size === "xs" ? "w-[72px]" : "w-[104px]";
  const minion = def.type === "minion";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative shrink-0 text-left rounded-[14px] overflow-hidden hairline bg-surface shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-transform duration-150",
        w,
        size === "md" ? "rounded-[18px]" : "",
        selected && "ring-2 ring-accent scale-[1.03]",
        dim && "opacity-45",
      )}
      style={{ boxShadow: selected ? `0 0 0 1px ${tint}` : undefined }}
    >
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{ background: `linear-gradient(180deg, ${tint}22, transparent 42%)` }}
      />
      <div className="relative flex items-start justify-between px-1.5 pt-1.5">
        <span
          className={cn(
            "tabular font-medium bg-bg/80 rounded-full hairline",
            size === "xs" ? "text-[10px] px-1" : "text-xs px-1.5 py-0.5",
          )}
        >
          {def.cost}
        </span>
        <span className={cn("uppercase tracking-wider text-muted", size === "xs" ? "text-[8px]" : "text-[9px]")}>
          {def.type === "resonance" ? "Res" : def.type}
        </span>
      </div>
      <div className={cn("mx-1.5 mt-1 overflow-hidden rounded-[8px]", size === "xs" ? "h-8" : size === "md" ? "h-28" : "h-14")}>
        <Sigil id={def.id} className="h-full w-full" />
      </div>
      <div className={cn("px-1.5 pt-1 font-display leading-tight", size === "xs" ? "text-[10px]" : size === "md" ? "text-base" : "text-[11px]")}>
        {def.name}
      </div>
      {size !== "xs" && (
        <p className={cn("px-1.5 pb-1 text-muted leading-snug", size === "md" ? "text-xs min-h-12" : "text-[9px] min-h-8")}>
          {def.text}
        </p>
      )}
      {minion && (
        <div className="flex justify-end px-1.5 pb-1.5">
          <span className="tabular text-[11px] bg-bg/70 px-1.5 py-0.5 rounded-[6px] hairline">
            {p}/{t}
          </span>
        </div>
      )}
      {size === "md" && champ && (
        <p className="px-1.5 pb-2 text-[10px] text-subtle">{champ.name}</p>
      )}
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
}: {
  inst: CardInstance;
  power: number;
  attacking?: boolean;
  blocking?: boolean;
  onClick?: () => void;
  mine?: boolean;
}) {
  const def = CARD_BY_ID[inst.cardId];
  const tint = champTint(def?.championId ?? "");
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative w-[72px] sm:w-[84px] rounded-[12px] bg-raised hairline overflow-hidden transition-transform duration-150",
        attacking && "ring-2 ring-accent -translate-y-2",
        blocking && "ring-2 ring-fg/50",
        inst.tapped && "opacity-70 rotate-3",
        inst.sick && mine && "opacity-80",
      )}
    >
      <div className="h-9 overflow-hidden">
        <Sigil id={inst.cardId} />
      </div>
      <div className="px-1 py-1">
        <div className="text-[10px] leading-tight truncate font-display">{def?.name ?? "Token"}</div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[8px] text-muted truncate">
            {inst.keywords.map((k) => KW_LABEL[k]?.[0]).join(" ")}
            {inst.ward > 0 ? " W" : ""}
          </span>
          <span className="tabular text-[11px]" style={{ color: tint }}>
            {power}/{inst.toughness}
          </span>
        </div>
      </div>
    </button>
  );
}

export function KeywordHint({ k }: { k: Keyword }) {
  return <span className="text-muted">{KEYWORD_TEXT[k]}</span>;
}
