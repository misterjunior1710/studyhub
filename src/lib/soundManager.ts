// 🔊 Sound Manager — robust Web Audio with first-gesture init + haptics
// Browser autoplay policy requires AudioContext to be created/resumed inside a user gesture.

type SoundName =
  | "click"
  | "toggle"
  | "coin"
  | "goalComplete"
  | "levelUp"
  | "streakMilestone"
  | "missionComplete"
  | "error";

interface SoundManagerState {
  ctx: AudioContext | null;
  initialized: boolean;
  enabled: boolean;
  hapticsEnabled: boolean;
  lastPlayed: string | null;
  lastPlayedAt: number;
}

const state: SoundManagerState = {
  ctx: null,
  initialized: false,
  enabled: true,
  hapticsEnabled: true,
  lastPlayed: null,
  lastPlayedAt: 0,
};

// ---------- localStorage prefs ----------
const SOUND_KEY = "studyhub_sound_enabled";
const HAPTICS_KEY = "studyhub_haptics_enabled";

const loadPrefs = () => {
  if (typeof window === "undefined") return;
  try {
    const s = localStorage.getItem(SOUND_KEY);
    if (s !== null) state.enabled = s === "true";
    const h = localStorage.getItem(HAPTICS_KEY);
    if (h !== null) state.hapticsEnabled = h === "true";
  } catch {}
};
loadPrefs();

// ---------- Init on first user gesture ----------
const initAudio = () => {
  if (state.initialized) return;
  if (typeof window === "undefined") return;
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) {
      console.warn("🔇 Web Audio not supported in this browser");
      return;
    }
    state.ctx = new Ctx();
    state.initialized = true;
    if (state.ctx.state === "suspended") {
      state.ctx.resume().catch((e) => console.warn("🔇 AudioContext resume failed:", e));
    }
    console.log("🔊 Sound initialized (state:", state.ctx.state, ")");
  } catch (e) {
    console.warn("🔇 Sound init failed:", e);
  }
};

// Attach first-gesture listeners (one-shot)
if (typeof window !== "undefined") {
  const handler = () => {
    initAudio();
    window.removeEventListener("pointerdown", handler);
    window.removeEventListener("keydown", handler);
    window.removeEventListener("touchstart", handler);
  };
  window.addEventListener("pointerdown", handler, { once: false });
  window.addEventListener("keydown", handler, { once: false });
  window.addEventListener("touchstart", handler, { once: false });
}

// ---------- Tone helper ----------
const tone = (
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.12,
  startOffset = 0,
) => {
  const ctx = state.ctx;
  if (!ctx) return;
  const now = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration);
};

// ---------- Haptics ----------
const vibrate = (pattern: number | number[]) => {
  if (!state.hapticsEnabled) return;
  if (typeof navigator === "undefined" || !navigator.vibrate) return;
  try {
    navigator.vibrate(pattern);
  } catch {}
};

// ---------- Sound presets ----------
const presets: Record<SoundName, () => void> = {
  click: () => {
    tone(600, 0.04, "sine", 0.06);
    vibrate(8);
  },
  toggle: () => {
    tone(500, 0.05, "triangle", 0.08);
    tone(750, 0.05, "triangle", 0.06, 0.04);
    vibrate(12);
  },
  coin: () => {
    tone(880, 0.08, "triangle", 0.18);
    tone(1320, 0.12, "triangle", 0.12, 0.05);
    vibrate(15);
  },
  goalComplete: () => {
    tone(523, 0.1, "sine", 0.18);
    tone(659, 0.1, "sine", 0.18, 0.1);
    tone(784, 0.18, "sine", 0.2, 0.2);
    vibrate([20, 30, 20]);
  },
  missionComplete: () => {
    tone(659, 0.1, "triangle", 0.18);
    tone(880, 0.1, "triangle", 0.18, 0.1);
    tone(1175, 0.2, "triangle", 0.2, 0.2);
    vibrate([15, 25, 15]);
  },
  levelUp: () => {
    tone(523, 0.1, "square", 0.15);
    tone(659, 0.1, "square", 0.15, 0.1);
    tone(784, 0.1, "square", 0.15, 0.2);
    tone(1046, 0.3, "square", 0.2, 0.3);
    vibrate([30, 50, 30, 50]);
  },
  streakMilestone: () => {
    tone(440, 0.12, "sawtooth", 0.12);
    tone(554, 0.12, "sawtooth", 0.12, 0.12);
    tone(659, 0.12, "sawtooth", 0.12, 0.24);
    tone(880, 0.25, "sawtooth", 0.18, 0.36);
    vibrate([20, 30, 20, 30, 40]);
  },
  error: () => {
    tone(220, 0.2, "sawtooth", 0.1);
    vibrate([30, 50]);
  },
};

// ---------- Public API ----------
export const soundManager = {
  init: initAudio,
  isInitialized: () => state.initialized,
  isEnabled: () => state.enabled,
  isHapticsEnabled: () => state.hapticsEnabled,
  getLastPlayed: () => state.lastPlayed,
  getLastPlayedAt: () => state.lastPlayedAt,

  setEnabled(enabled: boolean) {
    state.enabled = enabled;
    try {
      localStorage.setItem(SOUND_KEY, String(enabled));
    } catch {}
    console.log(enabled ? "🔊 Sound enabled" : "🔇 Sound muted");
  },

  setHapticsEnabled(enabled: boolean) {
    state.hapticsEnabled = enabled;
    try {
      localStorage.setItem(HAPTICS_KEY, String(enabled));
    } catch {}
    console.log(enabled ? "📳 Haptics enabled" : "📴 Haptics disabled");
  },

  play(name: SoundName) {
    if (!state.enabled) {
      // Still try haptics for non-sound feedback if haptics is on
      const fn = presets[name];
      if (fn && state.hapticsEnabled) {
        // Fire only the vibrate portion by calling the preset (tone() will no-op without ctx)
        fn();
      }
      return;
    }
    if (!state.initialized || !state.ctx) {
      console.log("🔇 Sound blocked: not initialized yet (waiting for first user gesture)");
      // Still vibrate
      if (state.hapticsEnabled) presets[name]?.();
      return;
    }
    if (state.ctx.state === "suspended") {
      state.ctx.resume().catch(() => {});
    }
    try {
      presets[name]();
      state.lastPlayed = name;
      state.lastPlayedAt = Date.now();
      console.log("🔊 Playing:", name);
    } catch (e) {
      console.warn("🔇 Sound play failed for", name, e);
    }
  },
};

// Back-compat shim for legacy imports
export const sounds = {
  coin: () => soundManager.play("coin"),
  goalComplete: () => soundManager.play("goalComplete"),
  levelUp: () => soundManager.play("levelUp"),
  streakMilestone: () => soundManager.play("streakMilestone"),
  error: () => soundManager.play("error"),
};

export const setSoundEnabled = (enabled: boolean) => soundManager.setEnabled(enabled);
