"use client";

type SoundKind = "click" | "hover" | "success" | "whoosh" | "boot";
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let soundOn: boolean | null = null;
let lastClickAt = -Infinity;
let lastHoverAt = -Infinity;

function soundsEnabled() {
  if (soundOn !== null) return soundOn;
  if (typeof window === "undefined") return true;
  try { soundOn = localStorage.getItem("solar-sound") !== "off"; }
  catch { soundOn = true; }
  return soundOn;
}
function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.45;
    master.connect(ctx.destination);
  }
  return ctx;
}
export async function unlockAudio() {
  if (!soundsEnabled()) return;
  try {
    const audio = getCtx();
    if (audio?.state === "suspended") await audio.resume();
  } catch { /* Unsupported or blocked audio never interrupts the interface. */ }
}

/** Short, rounded low-frequency pops with no noisy or ringing overtones. */
function pop(frequency: number, volume: number, duration = 0.085, delay = 0) {
  if (!ctx || !master || ctx.state !== "running") return;
  const start = ctx.currentTime + delay;
  const oscillator = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const envelope = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.38, start + duration);
  filter.type = "lowpass";
  filter.frequency.value = 650;
  filter.Q.value = 0.45;
  envelope.gain.setValueAtTime(0, start);
  envelope.gain.linearRampToValueAtTime(volume, start + 0.006);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  envelope.gain.linearRampToValueAtTime(0, start + duration + 0.012);
  oscillator.connect(filter);
  filter.connect(envelope);
  envelope.connect(master);
  oscillator.onended = () => { oscillator.disconnect(); filter.disconnect(); envelope.disconnect(); };
  oscillator.start(start);
  oscillator.stop(start + duration + 0.015);
}
export function playUiSound(kind: SoundKind) {
  if (typeof window === "undefined" || !soundsEnabled()) return;
  const now = performance.now();
  if (kind === "click") {
    if (now - lastClickAt < 65) return;
    lastClickAt = now;
  }
  if (kind === "hover") {
    if (now - lastHoverAt < 200) return;
    lastHoverAt = now;
  }
  const run = async () => {
    try {
      const audio = getCtx();
      if (!audio) return;
      if (audio.state === "suspended") await audio.resume();
      if (!soundsEnabled()) return;
      switch (kind) {
        case "click": pop(230, 0.11); break;
        case "hover": pop(185, 0.025, 0.055); break;
        case "success": pop(260, 0.09); pop(320, 0.065, 0.095, 0.1); break;
        case "whoosh": pop(170, 0.045, 0.12); break;
        case "boot": pop(210, 0.055, 0.1); break;
      }
    } catch { /* Audio is optional. */ }
  };
  requestAnimationFrame(() => { void run(); });
}
export function isSoundEnabled() { return soundsEnabled(); }
export function setSoundEnabled(on: boolean) {
  soundOn = on;
  try { localStorage.setItem("solar-sound", on ? "on" : "off"); } catch { /* Keep the session preference. */ }
}
export function softHaptic() { /* No vibration for UI sounds. */ }
