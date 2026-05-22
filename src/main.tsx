import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initBuildVersionCheck } from "./lib/buildVersionCheck";
import {
  runForceFreshBootIfNeeded,
  installAutoReloadOnSWUpdate,
} from "./lib/forceFreshBoot";

// One-time forced cache purge for legacy clients still showing an old build.
// If this triggers, the page reloads and the rest of this module never runs.
const purging = runForceFreshBootIfNeeded();

// Force service worker update on every page load so users get the latest version
if (!purging && 'serviceWorker' in navigator) {
  installAutoReloadOnSWUpdate();
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.update();
    });
  });
  // Periodically check for SW updates so long-lived tabs/WebViews stay fresh
  window.setInterval(() => {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.update());
    });
  }, 60 * 1000);
  // Re-check when the tab regains focus (covers backgrounded WebViews)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.update());
      });
    }
  });
  // Handle navigation requests from push notification clicks
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'PUSH_NAVIGATE' && event.data.url) {
      window.location.assign(event.data.url);
    }
  });
}

// Hide loading skeleton after React mounts
const hideLoadingSkeleton = () => {
  const skeleton = document.getElementById('loading-skeleton');
  if (skeleton) {
    skeleton.classList.add('hidden');
    // Remove from DOM after transition completes
    setTimeout(() => skeleton.remove(), 300);
  }
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Hide skeleton after React has rendered using double RAF for reliability
requestAnimationFrame(() => {
  requestAnimationFrame(hideLoadingSkeleton);
});

// Detect new builds and prompt user to reload (non-blocking, deferred)
initBuildVersionCheck();
