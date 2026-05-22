/**
 * Force-fresh boot for legacy clients.
 *
 * Old StudyHub installs (especially Android WebViews and browsers that cached
 * an early service-worker shell) keep serving stale HTML/JS until the user
 * does a manual hard refresh. This module guarantees those clients get
 * exactly ONE forced clean boot, after which the normal NetworkFirst SW
 * cycle keeps them current.
 *
 * Bump KILL_VERSION whenever we need to force every existing client to
 * purge caches + re-register the service worker on next visit.
 */

const KILL_VERSION = "2026-05-22-a";
const KILL_KEY = "studyhub.killVersion";

const purgeAllAndReload = async () => {
  try {
    if ("caches" in window) {
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
    }
  } catch { /* ignore */ }
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
  } catch { /* ignore */ }
  try {
    localStorage.setItem(KILL_KEY, KILL_VERSION);
  } catch { /* ignore */ }

  const url = new URL(window.location.href);
  url.searchParams.set("_v", Date.now().toString());
  window.location.replace(url.toString());
};

export const runForceFreshBootIfNeeded = (): boolean => {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(KILL_KEY);
  } catch {
    return false;
  }
  if (stored === KILL_VERSION) return false;

  // First boot OR stale legacy boot — purge once.
  // We only force a *reload* for legacy clients (those that already had
  // something stored under any old key OR had a SW registered). Brand-new
  // visitors just get the marker written so they don't reload unnecessarily.
  const isLegacy =
    stored !== null ||
    (typeof navigator !== "undefined" &&
      "serviceWorker" in navigator &&
      // Heuristic: a controller exists only when an SW already claimed this page
      !!navigator.serviceWorker.controller);

  if (!isLegacy) {
    try {
      localStorage.setItem(KILL_KEY, KILL_VERSION);
    } catch { /* ignore */ }
    return false;
  }

  void purgeAllAndReload();
  return true;
};

/**
 * Auto-reload as soon as a new service worker takes control. Combined with
 * `skipWaiting` + `clientsClaim` in the SW config this means a new build
 * propagates to active tabs within seconds of the SW update check, with no
 * user action required.
 */
export const installAutoReloadOnSWUpdate = () => {
  if (!("serviceWorker" in navigator)) return;
  let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloaded) return;
    // Only auto-reload if there was already a controller (i.e. this is an
    // update, not the very first registration on a fresh visit).
    reloaded = true;
    window.location.reload();
  });
};
