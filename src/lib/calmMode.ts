// Calm mode: reduces decorative motion, hover scaling, and the
// custom cursor highlighter for users who find the UI too busy.
// Setting persists in localStorage and is applied as a class on <html>.

const STORAGE_KEY = "studyhub.calm-mode";
const CLASS_NAME = "calm-mode";
const EVENT = "calm-mode-change";

export const isCalmModeEnabled = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

export const applyCalmMode = (enabled: boolean) => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle(CLASS_NAME, enabled);
};

export const setCalmMode = (enabled: boolean) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
  } catch {
    /* ignore */
  }
  applyCalmMode(enabled);
  window.dispatchEvent(new CustomEvent(EVENT, { detail: enabled }));
};

export const initCalmMode = () => {
  applyCalmMode(isCalmModeEnabled());
};

export const subscribeCalmMode = (cb: (enabled: boolean) => void) => {
  const handler = (e: Event) => cb((e as CustomEvent<boolean>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
};
