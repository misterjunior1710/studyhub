import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

// Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A
const KONAMI_CODE = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "KeyB", "KeyA"
];

// Secret study messages
const STUDY_TIPS = [
  "🧠 The brain can only focus for 25-45 minutes. Take breaks!",
  "📚 Teaching others is the best way to learn.",
  "💤 Sleep helps consolidate memories. Rest well!",
  "🎯 Set small, achievable goals for each study session.",
  "🌿 Study in a well-lit, quiet environment.",
  "📝 Handwriting notes improves retention by 30%.",
  "🏃 Exercise before studying boosts brain power!",
  "🎵 Classical music can enhance focus.",
];

// Secret click counter for logo
const LOGO_CLICKS_NEEDED = 7;

export function useEasterEggs() {
  const [konamiProgress, setKonamiProgress] = useState<string[]>([]);
  const [logoClicks, setLogoClicks] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [partyMode, setPartyMode] = useState(false);

  // Konami code listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const newProgress = [...konamiProgress, e.code].slice(-KONAMI_CODE.length);
      setKonamiProgress(newProgress);

      if (newProgress.join(",") === KONAMI_CODE.join(",")) {
        triggerKonamiEaster();
        setKonamiProgress([]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [konamiProgress]);

  // Logo click handler
  const handleLogoClick = useCallback(() => {
    const now = Date.now();
    
    // Reset if more than 2 seconds since last click
    if (now - lastClickTime > 2000) {
      setLogoClicks(1);
    } else {
      setLogoClicks(prev => prev + 1);
    }
    setLastClickTime(now);

    if (logoClicks + 1 >= LOGO_CLICKS_NEEDED) {
      triggerLogoEaster();
      setLogoClicks(0);
    }
  }, [logoClicks, lastClickTime]);

  const triggerKonamiEaster = () => {
    setPartyMode(true);
    toast.success("🎮 Konami Code Activated!", {
      description: "You found a secret! +100 virtual XP 🎉",
      duration: 5000,
    });
    
    // Add party effect
    document.body.classList.add("party-mode");
    setTimeout(() => {
      document.body.classList.remove("party-mode");
      setPartyMode(false);
    }, 3000);

    // Log for fun
    console.log("%c🎮 KONAMI CODE UNLOCKED! 🎮", "font-size: 24px; color: gold; text-shadow: 2px 2px 0 #000;");
  };

  const triggerLogoEaster = () => {
    const randomTip = STUDY_TIPS[Math.floor(Math.random() * STUDY_TIPS.length)];
    toast.success("📖 Study Secret Unlocked!", {
      description: randomTip,
      duration: 6000,
    });
    console.log("%c📚 SECRET TIP: " + randomTip, "font-size: 14px; color: #4CAF50;");
  };

  return {
    handleLogoClick,
    partyMode,
  };
}

// CSS for party mode - add to index.css
export const partyModeStyles = `
  @keyframes party-rainbow {
    0% { filter: hue-rotate(0deg); }
    100% { filter: hue-rotate(360deg); }
  }
  
  .party-mode {
    animation: party-rainbow 0.5s linear infinite;
  }
  
  .party-mode * {
    animation: party-rainbow 0.3s linear infinite;
  }
`;
