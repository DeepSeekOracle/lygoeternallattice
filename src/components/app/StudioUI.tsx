import type { ComponentType, ReactNode } from "react";
import { ChevronRight, Lock, Sparkles, Swords } from "lucide-react";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/utils";
import { ChampPortrait, champTint } from "@/components/game/Sigil";
import { Button } from "@/components/ui/button";

/* ── Backdrop ─────────────────────────────────────────────────────────────
   Layered page background: optional key art, aurora wash, starfield, vignette.
   Kept behind the content with fixed positioning so long pages stay alive. */
export function StudioBackdrop({ art, dim = 0.55 }: { art?: string; dim?: number }) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg">
      {art && (
        <img
          src={asset(art)}
          alt=""
          crossOrigin="anonymous"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: 1 - dim }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 12% -10%, color-mix(in oklab, var(--color-accent) 16%, transparent), transparent 60%)," +
            "radial-gradient(90% 70% at 100% 0%, color-mix(in oklab, var(--color-ivory) 10%, transparent), transparent 55%)",
        }}
      />
      <div className="starfield absolute inset-0 opacity-70" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in oklab, var(--color-bg) 45%, transparent), color-mix(in oklab, var(--color-bg) 78%, transparent) 42%, var(--color-bg) 100%)",
        }}
      />
    </div>
  );
}

/* ── Brand sigil ─────────────────────────────────────────────────────── */
export function StudioMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn("size-9", className)} aria-hidden="true">
      <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeOpacity="0.35" />
      <circle cx="24" cy="24" r="13.5" fill="none" stroke="currentColor" strokeOpacity="0.55" />
      <circle cx="24" cy="24" r="6" fill="none" stroke="currentColor" />
      <path d="M24 1.5v45M1.5 24h45" stroke="currentColor" strokeOpacity="0.22" />
      <path d="M17 30.5 24 15l7 15.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

/* ── Panels & chrome ─────────────────────────────────────────────────── */
export function StudioPanel({
  children,
  className,
  glow,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div className={cn("studio-panel", glow && "studio-panel-glow", className)}>{children}</div>
  );
}

export function StudioChip({
  children,
  tone = "muted",
  className,
}: {
  children: ReactNode;
  tone?: "muted" | "accent" | "ivory" | "danger";
  className?: string;
}) {
  const tones = {
    muted: "text-muted border-fg/10",
    accent: "text-accent border-accent/40 bg-accent/10",
    ivory: "text-ivory border-ivory/35 bg-ivory/10",
    danger: "text-danger border-danger/40 bg-danger/10",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-[3px] text-[10px] uppercase tracking-[0.16em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StudioSection({
  title,
  hint,
  right,
  children,
  className,
}: {
  title: string;
  hint?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h3 className="studio-eyebrow">{title}</h3>
          {hint && <p className="text-xs text-muted mt-1 max-w-lg">{hint}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

export function StudioProgress({
  value,
  max,
  className,
  showValue = true,
}: {
  value: number;
  max: number;
  className?: string;
  showValue?: boolean;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="studio-track flex-1">
        <div className="studio-track-fill" style={{ width: `${pct}%` }} />
      </div>
      {showValue && (
        <span className="tabular text-[11px] text-muted shrink-0">
          {value}/{max}
        </span>
      )}
    </div>
  );
}

/* ── Mode tile ───────────────────────────────────────────────────────── */
export function StudioTile({
  icon: Icon,
  title,
  hint,
  stat,
  progress,
  badge,
  onClick,
  feature,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  hint: string;
  stat?: string;
  progress?: { value: number; max: number };
  badge?: string;
  onClick: () => void;
  feature?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("studio-tile group", feature && "studio-tile-feature")}
    >
      <span className="studio-tile-icon">
        <Icon className="size-[18px]" />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="flex items-center gap-2">
          <span className="font-display text-lg leading-tight">{title}</span>
          {badge && <StudioChip tone="accent">{badge}</StudioChip>}
        </span>
        <span className="block text-xs text-muted mt-0.5 leading-snug">{hint}</span>
        {progress && <StudioProgress className="mt-2" value={progress.value} max={progress.max} />}
      </span>
      {stat && <span className="tabular text-[11px] text-ivory/80 shrink-0">{stat}</span>}
      <ChevronRight className="size-4 shrink-0 text-subtle transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-accent" />
    </button>
  );
}

/* ── Next-up hero card ───────────────────────────────────────────────── */
export function StudioNextUp({
  index,
  total,
  title,
  story,
  opponentName,
  opponentId,
  cta,
  onGo,
  done,
}: {
  index: number;
  total: number;
  title: string;
  story: string;
  opponentName: string;
  opponentId: string;
  cta: string;
  onGo: () => void;
  done?: boolean;
}) {
  return (
    <StudioPanel glow className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-32 sm:h-auto sm:w-40 shrink-0 overflow-hidden">
          <ChampPortrait id={opponentId} />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, transparent 40%, color-mix(in oklab, var(--color-surface) 92%, transparent))",
            }}
          />
          <div
            className="absolute inset-0 sm:hidden"
            style={{
              background:
                "linear-gradient(to bottom, transparent 45%, color-mix(in oklab, var(--color-surface) 92%, transparent))",
            }}
          />
        </div>
        <div className="flex-1 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <StudioChip tone="accent">
              <Sparkles className="size-3" />
              {done ? "Campaign held" : "Next chapter"}
            </StudioChip>
            <span className="tabular text-[11px] text-muted">
              {index + 1} of {total}
            </span>
          </div>
          <h2 className="font-display text-3xl mt-2 leading-tight">{title}</h2>
          <p className="text-sm text-muted mt-2 max-w-xl">{story}</p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-subtle mt-3">
            Foe · {opponentName}
          </p>
          <Button className="mt-4 w-full sm:w-auto" size="lg" onClick={onGo}>
            <Swords className="size-4" />
            {cta}
          </Button>
        </div>
      </div>
    </StudioPanel>
  );
}

/* ── Portrait tiles ──────────────────────────────────────────────────── */
export function StudioPortrait({
  id,
  name,
  epithet,
  selected,
  locked,
  onClick,
  className,
  compact,
}: {
  id: string;
  name: string;
  epithet?: string;
  selected?: boolean;
  locked?: boolean;
  onClick?: () => void;
  className?: string;
  compact?: boolean;
}) {
  const tint = champTint(id);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      style={{ ["--tint" as string]: tint }}
      className={cn(
        "studio-portrait group",
        selected && "studio-portrait-on",
        locked && "opacity-45",
        className,
      )}
    >
      <span className="studio-portrait-face">
        <ChampPortrait id={id} />
        {locked && (
          <span className="absolute inset-0 grid place-items-center bg-bg/70 text-muted">
            <Lock className="size-4" />
          </span>
        )}
      </span>
      {!compact && (
        <span className="studio-portrait-label">
          <span className="font-display text-[15px] leading-tight truncate" style={{ color: tint }}>
            {name}
          </span>
          {epithet && <span className="block text-[10px] text-muted truncate">{epithet}</span>}
        </span>
      )}
    </button>
  );
}

export function StudioPortraitRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-2 overflow-x-auto scroll-none pb-1 -mx-1 px-1", className)}>
      {children}
    </div>
  );
}

/* ── Mana pips (match) ───────────────────────────────────────────────── */
export function StudioManaPips({
  available,
  permanent,
  pending = 0,
  large,
}: {
  available: number;
  permanent: number;
  pending?: number;
  large?: boolean;
}) {
  const total = Math.max(permanent + pending, available + pending);
  const caps = Math.min(20, Math.max(6, total));
  const s = large ? "size-[9px]" : "size-2";
  return (
    <span className="inline-flex items-center gap-[3px]" title={`${available} of ${permanent} mana`}>
      {Array.from({ length: caps }, (_, i) => {
        const filled = i < available;
        const owned = i < permanent;
        return (
          <i
            key={i}
            className={cn(
              s,
              "rounded-[2px] rotate-45 transition-colors duration-200",
              filled
                ? "bg-accent shadow-[0_0_6px_color-mix(in_oklab,var(--color-accent)_60%,transparent)]"
                : owned
                  ? "bg-accent/20 border border-accent/30"
                  : "bg-fg/10 border border-fg/10",
            )}
          />
        );
      })}
    </span>
  );
}

/* ── Stats strip ─────────────────────────────────────────────────────── */
export function StudioStats({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="flex flex-wrap items-stretch gap-2">
      {items.map((s) => (
        <div key={s.label} className="studio-stat">
          <span className="studio-stat-value tabular">{s.value}</span>
          <span className="studio-stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
