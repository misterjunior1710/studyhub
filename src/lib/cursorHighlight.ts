const STORAGE_KEY = "studyhub.cursor-highlight";
const EVENT = "cursor-highlight-change";

export const isCursorHighlightEnabled = (): boolean => {
  if (typeof window === "undefined") return true;
  try {
    const val = window.localStorage.getItem(STORAGE_KEY);
    return val === null ? true : val === "1";
  } catch {
    return true;
  }
};

export const setCursorHighlightEnabled = (enabled: boolean) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: enabled }));
};

export const subscribeCursorHighlight = (cb: (enabled: boolean) => void) => {
  const handler = (e: Event) => cb((e as CustomEvent<boolean>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
};
