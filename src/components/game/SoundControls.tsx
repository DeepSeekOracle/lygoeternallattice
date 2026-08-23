import { Volume2, VolumeX, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MuteButton({
  muted,
  onToggle,
  className,
}: {
  muted: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <Button
      variant="quiet"
      size="icon"
      onClick={onToggle}
      aria-label={muted ? "Turn sound on" : "Turn sound off"}
      aria-pressed={!muted}
      title={muted ? "Turn sound on" : "Turn sound off"}
      className={className}
    >
      {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
    </Button>
  );
}

export function SoundSwitch({
  on,
  onChange,
  label,
  hint,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="flex w-full items-center justify-between gap-4 rounded-[16px] bg-raised hairline px-4 py-3 text-left"
    >
      <span>
        <span className="block font-medium">{label}</span>
        {hint && <span className="block text-xs text-muted mt-0.5">{hint}</span>}
      </span>
      <span
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-150",
          on ? "bg-accent" : "bg-border",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-6 rounded-full bg-fg shadow-sm transition-transform duration-150",
            on ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}

export function VolumeRow({
  label,
  value,
  enabled,
  disabled,
  onEnabled,
  onChange,
  icon: Icon,
}: {
  label: string;
  value: number;
  enabled: boolean;
  disabled?: boolean;
  onEnabled: (v: boolean) => void;
  onChange: (v: number) => void;
  icon: LucideIcon;
}) {
  const live = enabled && !disabled;
  return (
    <div className={cn("rounded-[16px] bg-raised hairline px-4 py-3", disabled && "opacity-50")}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">{label}</span>
        <span className="tabular text-xs text-muted">{Math.round(value * 100)}</span>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => onEnabled(!enabled)}
          disabled={disabled}
          aria-label={enabled ? `Mute ${label}` : `Unmute ${label}`}
          aria-pressed={enabled}
          className="size-11 shrink-0 grid place-items-center rounded-[10px] hairline bg-surface text-fg disabled:pointer-events-none"
        >
          {live ? <Icon className="size-4" /> : <VolumeX className="size-4 text-muted" />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={value}
          disabled={disabled || !enabled}
          aria-label={`${label} volume`}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1"
        />
      </div>
    </div>
  );
}
