/* The radio.
 *
 * The arcade's other games carry a listen-portal dock (games/<game>/radio.js):
 * one <audio> element, a shuffled bag of stations, a title, next, and a volume
 * that remembers itself. This is the same player for a React app.
 *
 * Two details are deliberate:
 *
 *  - The <audio> element lives outside React, in the module, appended to the
 *    document. A player that unmounts with a component stops the music every
 *    time the screen changes, and a match screen re-renders constantly.
 *  - Nothing plays until a gesture (autoplay policy), and it only auto-resumes
 *    on the first gesture if the listener had the radio on before — the flag is
 *    remembered per browser, so a first-time visitor is never ambushed by audio.
 *
 * Volume and mute are owned by the game's save (Settings → Radio: the `music`
 * and `musicOn` fields), not by this module — the dock renders those values and
 * calls back into the save when they change. */

import { asset } from "@/lib/asset";

export type RadioTrack = { title: string; url: string };

export type RadioState = {
  ready: boolean;
  playing: boolean;
  title: string;
  error: string;
  stations: number;
};

const ON_KEY = "lygo-eternal-radio-on";
const EXTRA_PLAYLISTS = [
  "https://deepseekoracle.github.io/Excavationpro/data/public_stream_playlist.json",
  "https://asiancoastline.com/data/public_stream_playlist.json",
];
const FAIL_LIMIT = 12;

let el: HTMLAudioElement | null = null;
let tracks: RadioTrack[] = [];
let bag: number[] = [];
let index = -1;
let fails = 0;
let userPaused = false;
let volume = 0.45;
let muted = false;
let armed = false;
let loading: Promise<void> | null = null;

let state: RadioState = { ready: false, playing: false, title: "Excavationpro radio", error: "", stations: 0 };
const subs = new Set<(s: RadioState) => void>();

function emit(patch: Partial<RadioState>) {
  state = { ...state, ...patch };
  subs.forEach((fn) => fn(state));
}

export function subscribeRadio(fn: (s: RadioState) => void): () => void {
  subs.add(fn);
  fn(state);
  return () => {
    subs.delete(fn);
  };
}

function rememberOn(on: boolean) {
  try {
    if (on) localStorage.setItem(ON_KEY, "1");
    else localStorage.removeItem(ON_KEY);
  } catch {
    /* private mode */
  }
}

function wasOn() {
  try {
    return localStorage.getItem(ON_KEY) === "1";
  } catch {
    return false;
  }
}

/** The element is created once, on first use, and lives on the body. */
function audio(): HTMLAudioElement {
  if (el) return el;
  const node = document.createElement("audio");
  node.preload = "none";
  node.setAttribute("data-lygo-radio", "");
  node.style.display = "none";
  node.volume = volume;
  node.muted = muted;
  node.addEventListener("ended", () => {
    fails = 0;
    next();
  });
  node.addEventListener("error", () => {
    if (userPaused || !node.src) return;
    if (fails > FAIL_LIMIT) {
      emit({ playing: false, error: "Stations unreachable — check the connection." });
      return;
    }
    fails += 1;
    next();
  });
  node.addEventListener("playing", () => emit({ playing: true, error: "" }));
  node.addEventListener("pause", () => emit({ playing: false }));
  document.body.appendChild(node);
  el = node;
  return node;
}

function shuffleBag() {
  bag = tracks.map((_, i) => i);
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j]!, bag[i]!];
  }
}

function ingest(data: unknown) {
  const raw = Array.isArray(data)
    ? data
    : ((data as { tracks?: unknown[]; streams?: unknown[] } | null)?.tracks ??
      (data as { streams?: unknown[] } | null)?.streams ??
      []);
  const list: RadioTrack[] = [];
  for (const t of raw as Record<string, unknown>[]) {
    const url = (t?.stream_url ?? t?.url) as string | undefined;
    if (!url || typeof url !== "string") continue;
    const title = (t?.title ?? t?.name ?? "Untitled") as string;
    if (tracks.some((x) => x.url === url)) continue;
    list.push({ title, url });
  }
  if (list.length) {
    tracks = tracks.concat(list);
    emit({ stations: tracks.length, ready: true });
  }
}

/** Local catalogue first (never blocked), then the bigger public playlists. */
export function loadStations(): Promise<void> {
  if (loading) return loading;
  loading = (async () => {
    try {
      const local = await fetch(asset("radio.json"), { cache: "no-cache" }).then((r) => r.json());
      ingest(local);
      const more = (local as { playlist?: string } | null)?.playlist;
      if (more) EXTRA_PLAYLISTS.unshift(more);
    } catch {
      emit({ error: "Station list offline" });
    }
    for (const url of EXTRA_PLAYLISTS) {
      if (tracks.length > 40) break;
      try {
        const data = await fetch(url, { mode: "cors" }).then((r) => {
          if (!r.ok) throw new Error(String(r.status));
          return r.json();
        });
        ingest(data);
      } catch {
        /* CORS or offline: the local list is enough */
      }
    }
    if (tracks.length) {
      shuffleBag();
      emit({ ready: true, stations: tracks.length, error: "" });
    } else {
      emit({ error: "No stations found" });
    }
  })();
  return loading;
}

function loadTrack(i: number) {
  if (!tracks.length) return false;
  index = ((i % tracks.length) + tracks.length) % tracks.length;
  const node = audio();
  const track = tracks[index]!;
  node.src = track.url;
  node.volume = volume;
  node.muted = muted;
  emit({ title: track.title, error: "" });
  return true;
}

function pickAndLoad(): boolean {
  if (!tracks.length) return false;
  if (!bag.length) shuffleBag();
  const pick = bag.pop();
  loadTrack(pick == null ? Math.floor(Math.random() * tracks.length) : pick);
  return true;
}

/** Next station. Keeps playing only if we were already playing. */
export function next() {
  if (!pickAndLoad()) return;
  if (state.playing) void audio().play().catch(() => emit({ playing: false }));
}

/** Play — and on the very first press, load a station and start it. */
export function play() {
  userPaused = false;
  const node = audio();
  if (!node.src) {
    if (!tracks.length) {
      void loadStations().then(() => play());
      return;
    }
    // The first press used to only load the station and wait for a second
    // press, which read as "the radio button does nothing".
    pickAndLoad();
  }
  node.volume = volume;
  node.muted = muted;
  node
    .play()
    .then(() => {
      fails = 0;
      rememberOn(true);
      emit({ playing: true, error: "" });
    })
    .catch((err: unknown) => {
      const name = (err as { name?: string } | null)?.name;
      if (name === "NotAllowedError") {
        emit({ playing: false, error: "Press play to start the radio" });
        armUnlock();
      } else {
        emit({ playing: false, error: "Could not start that station" });
      }
    });
}

export function toggle() {
  if (state.playing) {
    userPaused = true;
    if (el) el.pause();
    rememberOn(false);
    emit({ playing: false });
    return;
  }
  play();
}

export function setVolume(v: number) {
  volume = Math.max(0, Math.min(1, v));
  if (el) el.volume = volume;
}

/** Master mute (the game's sound toggle) and the radio row's own on/off. */
export function setAudible(on: boolean) {
  muted = !on;
  if (el) el.muted = muted;
}

/** True if the station list has arrived. */
export function stationCount() {
  return tracks.length;
}

function armUnlock() {
  if (armed) return;
  armed = true;
  const go = () => {
    document.removeEventListener("pointerdown", go, true);
    document.removeEventListener("keydown", go, true);
    armed = false;
    if (!userPaused && !state.playing) play();
  };
  document.addEventListener("pointerdown", go, true);
  document.addEventListener("keydown", go, true);
}

/** Called once at boot: load stations, and resume where the listener left off. */
export function bootRadio() {
  void loadStations();
  if (wasOn()) armUnlock();
}
