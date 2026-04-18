// Lightweight Web Audio sound effects — no external assets needed.
// Respects user's sound_enabled profile setting.

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

export const setSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled;
};

const getCtx = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

const playTone = (
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.15,
  startOffset = 0,
) => {
  if (!soundEnabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration);
};

export const sounds = {
  coin: () => {
    playTone(880, 0.08, "triangle", 0.18);
    playTone(1320, 0.12, "triangle", 0.12, 0.05);
  },
  goalComplete: () => {
    playTone(523, 0.1, "sine", 0.18);
    playTone(659, 0.1, "sine", 0.18, 0.1);
    playTone(784, 0.18, "sine", 0.2, 0.2);
  },
  levelUp: () => {
    playTone(523, 0.1, "square", 0.15);
    playTone(659, 0.1, "square", 0.15, 0.1);
    playTone(784, 0.1, "square", 0.15, 0.2);
    playTone(1046, 0.3, "square", 0.2, 0.3);
  },
  streakMilestone: () => {
    playTone(440, 0.12, "sawtooth", 0.12);
    playTone(554, 0.12, "sawtooth", 0.12, 0.12);
    playTone(659, 0.12, "sawtooth", 0.12, 0.24);
    playTone(880, 0.25, "sawtooth", 0.18, 0.36);
  },
  error: () => {
    playTone(220, 0.2, "sawtooth", 0.1);
  },
};
