let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfx: GainNode | null = null;
let music: GainNode | null = null;
let drone: OscillatorNode | null = null;
let unlocked = false;

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
    master.gain.value = 1;
    sfx.gain.value = 0.8;
    music.gain.value = 0.45;
  }
  return ctx;
}

export function unlockAudio() {
  const c = ac();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  unlocked = true;
  startDrone();
}

export function setSfxVolume(v: number) {
  if (sfx) sfx.gain.setTargetAtTime(v * v, ac()!.currentTime, 0.03);
}
export function setMusicVolume(v: number) {
  if (music) music.gain.setTargetAtTime(v * v, ac()!.currentTime, 0.03);
}

function beep(freq: number, dur: number, type: OscillatorType, gain = 0.08, bus: GainNode | null = sfx) {
  const c = ac();
  if (!c || !bus || !unlocked) return;
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
  const c = ac();
  if (c && c.state === "suspended") void c.resume();
}
