// Synthesized Halloween "scream" + drop sound using the Web Audio API.
// No external assets; created on the fly so it always works offline.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

// Ensures audio is unlocked after a user gesture (browsers block autoplay).
export function unlockAudio() {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
}

type ScreamKind = "pumpkin" | "ghost";

const SCREAMS_PUMPKIN = [
  "AAAAHHH!",
  "GYAAAH!",
  "M-M-M-MY HEAD!",
  "HELPPP!",
  "NEEE!",
  "AAARGH!",
  "OOOH NO!",
  "IK LEEF NOG!",
];

const SCREAMS_GHOST = [
  "BOOOOO!",
  "WUUUUUH!",
  "HIHIHI!",
  "WHAAA!",
  "SPOOK!",
  "HAAAH!",
  "IIIIEK!",
  "OEEEEH!",
];

export function randomScream(kind: ScreamKind): string {
  const list = kind === "pumpkin" ? SCREAMS_PUMPKIN : SCREAMS_GHOST;
  return list[Math.floor(Math.random() * list.length)];
}

// A short, eerie descending scream with noise + vibrato.
export function playScream(kind: ScreamKind) {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;

  const base = kind === "pumpkin" ? 520 : 280;
  const wobble = kind === "pumpkin" ? 60 : 110;

  // Vibrato LFO
  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  lfo.frequency.value = kind === "pumpkin" ? 7.5 : 5;
  lfoGain.gain.value = wobble;
  lfo.connect(lfoGain);

  // Carrier (the "voice")
  const osc = c.createOscillator();
  osc.type = kind === "pumpkin" ? "sawtooth" : "triangle";
  osc.frequency.setValueAtTime(base, now);
  osc.frequency.exponentialRampToValueAtTime(base * 0.45, now + 0.55);

  lfoGain.connect(osc.frequency);
  lfo.start(now);
  osc.start(now);

  // Noise component for breathiness
  const noise = c.createBufferSource();
  const buf = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.35;
  noise.buffer = buf;
  const noiseGain = c.createGain();
  noiseGain.gain.setValueAtTime(0.0, now);
  noiseGain.gain.linearRampToValueAtTime(0.25, now + 0.05);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  const noiseFilter = c.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = base * 1.5;
  noise.connect(noiseFilter).connect(noiseGain).connect(c.destination);
  noise.start(now);
  noise.stop(now + 0.5);

  // Volume envelope
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.45, now + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
  osc.connect(gain).connect(c.destination);

  osc.stop(now + 0.65);
  lfo.stop(now + 0.65);
}

// Soft thump when a head lands.
export function playThump() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.5, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
  osc.connect(gain).connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.22);
}

// Creepy minor chime for a win.
export function playWin() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const notes = [392, 466, 587, 698]; // g, a#, d, f (g minor-ish)
  notes.forEach((f, i) => {
    const o = c.createOscillator();
    o.type = "triangle";
    o.frequency.value = f;
    const g = c.createGain();
    const t = now + i * 0.16;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + 0.55);
  });
}

// Low ominous tone for a loss.
export function playLose() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const o = c.createOscillator();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(160, now);
  o.frequency.exponentialRampToValueAtTime(50, now + 1.2);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.4, now + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 1.3);
  const filt = c.createBiquadFilter();
  filt.type = "lowpass";
  filt.frequency.value = 400;
  o.connect(filt).connect(g).connect(c.destination);
  o.start(now);
  o.stop(now + 1.35);
}

// Scythe swoosh — filtered noise sweep, like a blade cutting through air.
export function playSwoosh() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const noise = c.createBufferSource();
  const buf = c.createBuffer(1, c.sampleRate * 0.7, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  noise.buffer = buf;
  const bandpass = c.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.Q.value = 6;
  bandpass.frequency.setValueAtTime(900, now);
  bandpass.frequency.exponentialRampToValueAtTime(2600, now + 0.5);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.linearRampToValueAtTime(0.5, now + 0.08);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
  noise.connect(bandpass).connect(g).connect(c.destination);
  noise.start(now);
  noise.stop(now + 0.65);
}
