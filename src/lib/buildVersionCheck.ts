/**
 * Build version checker
 *
 * Vite already produces content-hashed asset filenames, so the browser is forced
 * to fetch new JS/CSS whenever a build changes. The remaining problem is the
 * cached index.html itself: until the user refreshes, they keep loading old
 * hashed asset references.
 *
 * This module periodically fetches the live index.html (with cache-busting
 * query string) and compares the referenced main script hash against the one
 * loaded at startup. When they differ, a new build has shipped and we surface
 * a toast prompting the user to reload.
 */
import { toast } from "sonner";

const CHECK_INTERVAL_MS = 5 * 60 * 1000; // every 5 minutes
const STORAGE_KEY = "app-build-hash";

let initialHash: string | null = null;
let notified = false;

const extractMainHash = (html: string): string | null => {
  // Matches both dev (/src/main.tsx) and prod (/assets/index-<hash>.js) outputs
  const match =
    html.match(/\/assets\/[^"']*\.js/) ||
    html.match(/src=["']([^"']*main[^"']*\.[jt]sx?)["']/);
  return match ? match[0] : null;
};

const checkForNewBuild = async () => {
  if (notified || !navigator.onLine) return;

  try {
    const res = await fetch(`/?_=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });
    if (!res.ok) return;

    const html = await res.text();
    const liveHash = extractMainHash(html);
    if (!liveHash || !initialHash) return;

    if (liveHash !== initialHash) {
      notified = true;
      try {
        localStorage.setItem(STORAGE_KEY, liveHash);
      } catch {
        /* ignore */
      }
      toast("A new version is available", {
        description: "Reload to get the latest updates.",
        duration: Infinity,
        action: {
          label: "Reload",
          onClick: () => window.location.reload(),
        },
      });
    }
  } catch {
    // Network error — silently retry next interval
  }
};

export const initBuildVersionCheck = () => {
  // Capture the hash of the currently loaded main script
  const scripts = Array.from(document.querySelectorAll("script[src]"));
  const mainScript = scripts.find((s) => {
    const src = (s as HTMLScriptElement).src;
    return /main\.[jt]sx?$/.test(src) || /\/assets\/.*\.js$/.test(src);
  }) as HTMLScriptElement | undefined;

  initialHash = mainScript ? new URL(mainScript.src).pathname : null;

  // Defer first check so it never blocks initial render
  window.setTimeout(checkForNewBuild, 30_000);
  window.setInterval(checkForNewBuild, CHECK_INTERVAL_MS);

  // Also check when the tab regains focus
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") checkForNewBuild();
  });
};
