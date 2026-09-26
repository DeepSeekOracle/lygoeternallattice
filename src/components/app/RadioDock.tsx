import { useEffect, useState } from "react";
import { Loader2, Pause, Play, Radio, SkipForward, Volume2, VolumeX, X } from "lucide-react";
import { bootRadio, next, play, setAudible, setVolume, subscribeRadio, toggle, type RadioState } from "@/lib/radio";
import { setRadioOpen } from "@/lib/radio-ui";
import { cn } from "@/lib/utils";

const HUB = "https://deepseekoracle.github.io/Excavationpro/excavationpro-listen.html";

/** The player's own state, live. */
export function useRadio(): RadioState {
  const [state, setState] = useState<RadioState>({
    ready: false,
    playing: false,
    title: "Excavationpro radio",
    error: "",
    stations: 0,
  });
  useEffect(() => subscribeRadio(setState), []);
  return state;
}

/** Radio on/off + volume live in the save file; the dock forwards changes. */
export function syncRadio(volume: number, audible: boolean) {
  setVolume(volume);
  setAudible(audible);
}

/**
 * The listen-portal dock.
 *
 * `className` carries the placement, because placement is the whole reason
 * this is a component and not a floating pill: in a match it hangs under the
 * header button that opened it, on the menus it sits in the corner. The old
 * fixed bottom-left pill (and the arcade gate's fixed bar) sat on top of the
 * match footer — which is exactly where the buttons a player must press are.
 */
export function RadioDock({
  volume,
  enabled,
  onVolume,
  onEnabled,
  className,
}: {
  volume: number;
  enabled: boolean;
  onVolume: (v: number) => void;
  onEnabled: (on: boolean) => void;
  className?: string;
}) {
  const radio = useRadio();

  useEffect(() => {
    bootRadio();
  }, []);

  useEffect(() => {
    syncRadio(volume, enabled);
  }, [volume, enabled]);

  const audible = enabled && volume > 0;
  const pct = Math.round(volume * 100);

  return (
    <section
      className={cn(
        "rounded-[16px] border border-fg/10 bg-surface/95 p-3 shadow-[0_18px_44px_rgba(0,0,0,0.5)] backdrop-blur",
        className,
      )}
      aria-label="Radio"
    >
      <div className="flex items-center gap-2">
        <span className="grid size-8 shrink-0 place-items-center rounded-[10px] border border-accent/25 bg-accent/10 text-accent">
          <Radio className={cn("size-4", radio.playing && "animate-pulse")} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted">Excavationpro radio</div>
          <div className="truncate text-xs text-fg" title={radio.title}>
            {radio.ready ? (radio.playing ? `▶ ${radio.title}` : radio.title) : "Tuning…"}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setRadioOpen(false)}
          aria-label="Hide radio"
          className="grid size-7 shrink-0 place-items-center rounded-full bg-raised text-muted hairline hover:text-fg"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <div className="mt-2.5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (!enabled) onEnabled(true);
            if (radio.playing) toggle();
            else play();
          }}
          aria-label={radio.playing ? "Pause radio" : "Play radio"}
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-full hairline",
            radio.playing ? "bg-accent text-bg" : "bg-raised text-fg",
          )}
        >
          {!radio.ready ? (
            <Loader2 className="size-4 animate-spin" />
          ) : radio.playing ? (
            <Pause className="size-4" />
          ) : (
            <Play className="ml-0.5 size-4" />
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            if (!enabled) onEnabled(true);
            next();
          }}
          aria-label="Next station"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-raised text-fg hairline"
        >
          <SkipForward className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => onEnabled(!enabled)}
          aria-label={enabled ? "Turn the radio off" : "Turn the radio on"}
          aria-pressed={enabled}
          className="grid size-9 shrink-0 place-items-center rounded-full bg-raised text-fg hairline"
        >
          {audible ? <Volume2 className="size-4" /> : <VolumeX className="size-4 text-muted" />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          aria-label="Radio volume"
          onChange={(e) => {
            const v = Number(e.target.value);
            onVolume(v);
            if (v > 0 && !enabled) onEnabled(true);
          }}
          className="min-w-0 flex-1"
        />
        <span className="tabular w-8 shrink-0 text-right text-[10px] text-muted">{pct}</span>
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px] text-subtle">
        <span className="truncate">
          {radio.error ? <span className="text-danger">{radio.error}</span> : `${radio.stations} stations · shuffle`}
        </span>
        <a
          href={HUB}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-muted underline-offset-4 hover:text-accent hover:underline"
        >
          listen hub ↗
        </a>
      </div>
    </section>
  );
}

/** Corner placement for the menu screens. */
export const RADIO_FLOAT = "fixed bottom-3 left-3 z-[70] w-[min(21rem,calc(100vw-1.5rem))]";
/** Drop-down placement for a match: under the header, clear of the action strip. */
export const RADIO_DROP = "absolute right-2 top-[3.15rem] z-40 w-[min(21rem,calc(100vw-1rem))]";
