let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfx: GainNode | null = null;
let music: GainNode | null = null;
let drone: OscillatorNode | null = null;
let unlocked = false;

let sfxVol = 0.8;
let musicVol = 0.45;
let muted = false;
let sfxOn = true;
let musicOn = true;

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C({ latencyHint: "interactive" });
    master = ctx.createGain();
    sfx = ctx.createGain();
    music = ctx.createGain();
    sfx.connect(master);
    music.connect(master);
    master.connect(ctx.destination);
    applyGains();
  }
  return ctx;
}

function applyGains() {
  if (!ctx || !master || !sfx || !music) return;
  const t = ctx.currentTime;
  master.gain.setTargetAtTime(muted ? 0 : 1, t, 0.04);
  sfx.gain.setTargetAtTime(sfxOn ? sfxVol * sfxVol : 0, t, 0.04);
  music.gain.setTargetAtTime(musicOn ? musicVol * musicVol : 0, t, 0.04);
}

export type AudioSettings = {
  sfx: number;
  music: number;
  muted: boolean;
  sfxOn: boolean;
  musicOn: boolean;
};

export function getAudioSettings(): AudioSettings {
  return { sfx: sfxVol, music: musicVol, muted, sfxOn, musicOn };
}

export function applyAudioSettings(s: Partial<AudioSettings>) {
  if (typeof s.sfx === "number") sfxVol = clamp01(s.sfx);
  if (typeof s.music === "number") musicVol = clamp01(s.music);
  if (typeof s.muted === "boolean") muted = s.muted;
  if (typeof s.sfxOn === "boolean") sfxOn = s.sfxOn;
  if (typeof s.musicOn === "boolean") musicOn = s.musicOn;
  applyGains();
}

export function unlockAudio() {
  const c = ac();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  unlocked = true;
  applyGains();
  startDrone();
}

export function setSfxVolume(v: number) {
  sfxVol = clamp01(v);
  applyGains();
}

export function setMusicVolume(v: number) {
  musicVol = clamp01(v);
  applyGains();
}

export function setMuted(v: boolean) {
  muted = v;
  applyGains();
}

export function toggleMuted(): boolean {
  muted = !muted;
  applyGains();
  return muted;
}

export function setSfxOn(v: boolean) {
  sfxOn = v;
  applyGains();
}

export function setMusicOn(v: boolean) {
  musicOn = v;
  applyGains();
}

export function isMuted() {
  return muted;
}

function beep(freq: number, dur: number, type: OscillatorType, gain = 0.08, bus: GainNode | null = sfx) {
  const c = ac();
  if (!c || !bus || !unlocked || muted || !sfxOn) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq * (0.97 + Math.random() * 0.06);
  g.gain.value = gain;
  o.connect(g);
  g.connect(bus);
  const t = c.currentTime;
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export function sfxPlay(kind: string) {
  if (muted || !sfxOn) return;
  switch (kind) {
    case "ui":
      beep(520, 0.06, "sine", 0.04);
      break;
    case "draw":
      beep(880, 0.09, "triangle", 0.05);
      break;
    case "play":
      beep(240, 0.12, "sine", 0.07);
      beep(480, 0.16, "triangle", 0.04);
      break;
    case "attack":
      beep(140, 0.14, "sawtooth", 0.05);
      break;
    case "hit":
      beep(90, 0.18, "square", 0.06);
      break;
    case "death":
      beep(70, 0.28, "sine", 0.07);
      break;
    case "win":
      beep(523, 0.2, "triangle", 0.06);
      beep(659, 0.28, "triangle", 0.05);
      beep(784, 0.4, "sine", 0.05);
      break;
    case "lose":
      beep(196, 0.4, "sine", 0.07);
      break;
    case "mana":
      beep(640, 0.08, "sine", 0.04);
      break;
    case "error":
      beep(180, 0.1, "square", 0.04);
      break;
    default:
      beep(400, 0.06, "sine", 0.03);
  }
}

function startDrone() {
  const c = ac();
  if (!c || !music || drone) return;
  const o1 = c.createOscillator();
  const o2 = c.createOscillator();
  const g = c.createGain();
  o1.type = "sine";
  o2.type = "sine";
  o1.frequency.value = 110;
  o2.frequency.value = 164.8;
  g.gain.value = 0.035;
  o1.connect(g);
  o2.connect(g);
  g.connect(music);
  o1.start();
  o2.start();
  drone = o1;
}

export function resumeAudio() {
  const c = ctx;
  if (c && c.state === "suspended") void c.resume();
}
