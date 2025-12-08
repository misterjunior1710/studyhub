import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

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
