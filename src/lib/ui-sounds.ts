"use client";

type SoundKind = "click" | "hover" | "success" | "whoosh" | "boot";

let ctx: AudioContext | null = null;
let unlocked = false;
let master: GainNode | null = null;
let noiseCache: AudioBuffer | null = null;
let soundOn: boolean | null = null;
let lastClickAt = 0;
let lastHoverAt = 0;

function soundsEnabled() {
  if (soundOn != null) return soundOn;
  if (typeof window === "undefined") return true;
  soundOn = localStorage.getItem("solar-sound") !== "off";
  return soundOn;
}

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.65;
    master.connect(ctx.destination);
  }
  return ctx;
}

function out() {
  getCtx();
  return master;
}

/** Один шумовой буфер на всю сессию — без аллокаций на каждый клик */
function getNoiseBuffer() {
  const c = getCtx();
  if (!c) return null;
  if (noiseCache) return noiseCache;
  const len = Math.floor(c.sampleRate * 0.12);
  const buffer = c.createBuffer(1, len, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noiseCache = buffer;
  return noiseCache;
}

export async function unlockAudio() {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") await c.resume();
  unlocked = true;
  getNoiseBuffer();
}

function playCachedNoise(
  duration: number,
  gain: number,
  filterFreq: number,
  filterQ = 0.7,
  type: BiquadFilterType = "bandpass",
) {
  const c = getCtx();
  const dest = out();
  const buffer = getNoiseBuffer();
  if (!c || !dest || !buffer || !unlocked) return;

  const t0 = c.currentTime;
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = filterFreq;
  filter.Q.value = filterQ;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  src.connect(filter);
  filter.connect(g);
  g.connect(dest);
  src.start(t0);
  src.stop(t0 + duration + 0.02);
}

function softTone(
  freq: number,
  duration: number,
  type: OscillatorType,
  gain: number,
  slideTo?: number,
  attack = 0.004,
) {
  const c = getCtx();
  const dest = out();
  if (!c || !dest || !unlocked) return;

  const t0 = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo != null) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(50, slideTo),
      t0 + duration,
    );
  }
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g);
  g.connect(dest);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

/** Клик: один короткий тон — без шума и без лишней работы на main thread */
function asmrClick() {
  softTone(880, 0.028, "sine", 0.018, 520, 0.001);
}

function asmrHover() {
  softTone(1600, 0.02, "sine", 0.005, 2000, 0.002);
}

function asmrSuccess() {
  softTone(392, 0.08, "sine", 0.022, 523, 0.008);
  softTone(659, 0.1, "sine", 0.014);
}

/** Переход: мягкий «лист», без звонкого bandpass */
function asmrWhoosh() {
  playCachedNoise(0.22, 0.014, 420, 0.5, "lowpass");
  softTone(140, 0.2, "sine", 0.008, 72, 0.02);
}

function asmrBoot() {
  softTone(196, 0.12, "sine", 0.024, 262, 0.015);
  softTone(392, 0.14, "sine", 0.014);
}

/**
 * Звук после кадра — клик/навигация не ждут Web Audio.
 */
export function playUiSound(kind: SoundKind) {
  if (typeof window === "undefined") return;
  if (!soundsEnabled()) return;

  const now = performance.now();
  if (kind === "click") {
    if (now - lastClickAt < 35) return;
    lastClickAt = now;
  }
  if (kind === "hover") {
    if (now - lastHoverAt < 180) return;
    lastHoverAt = now;
  }

  const run = () => {
    const c = getCtx();
    if (!c) return;

    const fire = () => {
      unlocked = true;
      switch (kind) {
        case "click":
          asmrClick();
          break;
        case "hover":
          asmrHover();
          break;
        case "success":
          asmrSuccess();
          break;
        case "whoosh":
          asmrWhoosh();
          break;
        case "boot":
          asmrBoot();
          break;
      }
    };

    if (c.state === "suspended") {
      void c.resume().then(fire);
      return;
    }
    fire();
  };

  // клик/hover — после paint, чтобы UI не ждал аудио
  if (kind === "click" || kind === "hover") {
    requestAnimationFrame(() => {
      queueMicrotask(run);
    });
    return;
  }
  run();
}

export function isSoundEnabled() {
  return soundsEnabled();
}

export function setSoundEnabled(on: boolean) {
  soundOn = on;
  localStorage.setItem("solar-sound", on ? "on" : "off");
}

export function softHaptic() {
  // вибрация на десктопе бесполезна, на мобиле иногда даёт лаг — не дергаем
}
