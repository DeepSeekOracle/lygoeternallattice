import { useEffect, useRef, useState } from "react";
import { Pause, Play, Radio, SkipForward } from "lucide-react";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/utils";

const HUB = "https://deepseekoracle.github.io/Excavationpro/excavationpro-listen.html";

type Track = { title: string; url: string };

export function RadioMini() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bagRef = useRef<Track[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [on, setOn] = useState(false);
  const [title, setTitle] = useState("Excavationpro radio");
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(asset("radio.json"))
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data?.tracks) ? (data.tracks as Track[]).filter((t) => t.url) : [];
        setTracks(list);
        bagRef.current = shuffle(list);
      })
      .catch(() => {
        if (!cancelled) setErr("Radio list offline");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const next = () => playRandom(el);
    el.addEventListener("ended", next);
    el.addEventListener("error", next);
    return () => {
      el.removeEventListener("ended", next);
      el.removeEventListener("error", next);
    };
  }, [tracks]);

  function playRandom(el: HTMLAudioElement) {
    if (!bagRef.current.length) bagRef.current = shuffle(tracks);
    const t = bagRef.current.pop();
    if (!t) {
      setErr("No streams");
      return;
    }
    setTitle(t.title);
    setErr("");
    el.src = t.url;
    el.play().catch(() => setErr("Tap play again"));
  }

  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (on) {
      el.pause();
      setOn(false);
      return;
    }
    setOn(true);
    if (!el.src) playRandom(el);
    else el.play().catch(() => playRandom(el));
  }

  function skip() {
    const el = audioRef.current;
    if (!el) return;
    setOn(true);
    playRandom(el);
  }

  return (
    <div className="fixed bottom-3 left-3 z-[70] max-w-[min(22rem,calc(100vw-1.5rem))] rounded-[14px] bg-surface/95 hairline px-2.5 py-2 shadow-[0_12px_40px_rgba(0,0,0,.45)]">
      <audio ref={audioRef} preload="none" />
      <div className="flex items-center gap-2">
        <Radio className="size-3.5 shrink-0 text-accent" />
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted">Hub radio</div>
          <div className="truncate text-xs text-fg" title={title}>
            {on ? title : "Excavationpro listen hub"}
          </div>
        </div>
        <button
          type="button"
          className={cn(
            "size-8 shrink-0 rounded-full hairline flex items-center justify-center",
            on ? "bg-accent text-bg" : "bg-raised text-fg",
          )}
          aria-label={on ? "Pause radio" : "Play radio"}
          onClick={toggle}
        >
          {on ? <Pause className="size-3.5" /> : <Play className="size-3.5 ml-0.5" />}
        </button>
        <button
          type="button"
          className="size-8 shrink-0 rounded-full hairline bg-raised flex items-center justify-center text-fg"
          aria-label="Next track"
          onClick={skip}
        >
          <SkipForward className="size-3.5" />
        </button>
      </div>
      {err && <p className="text-[10px] text-danger mt-1 px-0.5">{err}</p>}
      <a
        href={HUB}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 block text-[10px] text-muted hover:text-accent truncate"
      >
        excavationpro-listen.html ↗
      </a>
    </div>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}
