// Lightweight client-only device + browser detection for PWA install tutorials.
// Designed for production use: no UA-CH dependency, defensive parsing.

export type Platform =
  | "ios"
  | "ipados"
  | "android"
  | "windows"
  | "macos"
  | "linux"
  | "chromeos"
  | "unknown";

export type Browser =
  | "safari"
  | "chrome"
  | "edge"
  | "firefox"
  | "samsung"
  | "opera"
  | "brave"
  | "unknown";

export interface DeviceInfo {
  platform: Platform;
  platformVersion: number | null; // major version (e.g. 17 for iOS 17.2)
  platformVersionLabel: string | null; // e.g. "17.2"
  browser: Browser;
  browserVersion: number | null;
  isMobile: boolean;
  isTablet: boolean;
  // Capability flags
  supportsBeforeInstallPrompt: boolean; // Chromium-family
  supportsIOSAddToHomeScreen: boolean; // any iOS Safari
  supportsIOSWebPush: boolean; // iOS 16.4+ standalone PWA
  isStandalone: boolean;
}

const parseFloatSafe = (value: string | undefined): number | null => {
  if (!value) return null;
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
};

export const detectDevice = (): DeviceInfo => {
  if (typeof window === "undefined") {
    return {
      platform: "unknown",
      platformVersion: null,
      platformVersionLabel: null,
      browser: "unknown",
      browserVersion: null,
      isMobile: false,
      isTablet: false,
      supportsBeforeInstallPrompt: false,
      supportsIOSAddToHomeScreen: false,
      supportsIOSWebPush: false,
      isStandalone: false,
    };
  }

  const ua = window.navigator.userAgent;
  const uaLower = ua.toLowerCase();

  // Platform detection
  let platform: Platform = "unknown";
  let platformVersion: number | null = null;
  let platformVersionLabel: string | null = null;

  // iPad on iOS 13+ reports as Mac — disambiguate via touch
  const isIPadOS =
    /macintosh/i.test(ua) &&
    typeof navigator.maxTouchPoints === "number" &&
    navigator.maxTouchPoints > 1;

  if (/iphone|ipod/.test(uaLower)) {
    platform = "ios";
    const m = ua.match(/OS (\d+)[._](\d+)(?:[._](\d+))?/i);
    if (m) {
      platformVersion = parseInt(m[1], 10);
      platformVersionLabel = `${m[1]}.${m[2]}${m[3] ? "." + m[3] : ""}`;
    }
  } else if (/ipad/.test(uaLower) || isIPadOS) {
    platform = "ipados";
    const m = ua.match(/OS (\d+)[._](\d+)(?:[._](\d+))?/i) || ua.match(/Version\/(\d+)\.(\d+)/);
    if (m) {
      platformVersion = parseInt(m[1], 10);
      platformVersionLabel = `${m[1]}.${m[2]}${m[3] ? "." + m[3] : ""}`;
    }
  } else if (/android/.test(uaLower)) {
    platform = "android";
    const m = ua.match(/Android (\d+)(?:\.(\d+))?/i);
    if (m) {
      platformVersion = parseInt(m[1], 10);
      platformVersionLabel = m[2] ? `${m[1]}.${m[2]}` : m[1];
    }
  } else if (/windows nt/.test(uaLower)) {
    platform = "windows";
    const m = ua.match(/Windows NT (\d+)\.(\d+)/i);
    if (m) {
      // NT 10.0 → Windows 10/11
      platformVersion = parseFloat(`${m[1]}.${m[2]}`);
      platformVersionLabel = `${m[1]}.${m[2]}`;
    }
  } else if (/mac os x|macintosh/.test(uaLower)) {
    platform = "macos";
    const m = ua.match(/Mac OS X (\d+)[._](\d+)/i);
    if (m) {
      platformVersion = parseInt(m[1], 10);
      platformVersionLabel = `${m[1]}.${m[2]}`;
    }
  } else if (/cros/.test(uaLower)) {
    platform = "chromeos";
  } else if (/linux/.test(uaLower)) {
    platform = "linux";
  }

  // Browser detection — order matters
  let browser: Browser = "unknown";
  let browserVersion: number | null = null;

  if (/edg\//i.test(ua)) {
    browser = "edge";
    browserVersion = parseFloatSafe(ua.match(/Edg\/(\d+)/i)?.[1]);
  } else if (/samsungbrowser/i.test(ua)) {
    browser = "samsung";
    browserVersion = parseFloatSafe(ua.match(/SamsungBrowser\/(\d+)/i)?.[1]);
  } else if (/opr\/|opera/i.test(ua)) {
    browser = "opera";
    browserVersion = parseFloatSafe(ua.match(/(?:OPR|Opera)\/(\d+)/i)?.[1]);
  } else if (/firefox|fxios/i.test(ua)) {
    browser = "firefox";
    browserVersion = parseFloatSafe(ua.match(/(?:Firefox|FxiOS)\/(\d+)/i)?.[1]);
  } else if (/chrome|crios/i.test(ua)) {
    browser = "chrome";
    browserVersion = parseFloatSafe(ua.match(/(?:Chrome|CriOS)\/(\d+)/i)?.[1]);
  } else if (/safari/i.test(ua)) {
    browser = "safari";
    browserVersion = parseFloatSafe(ua.match(/Version\/(\d+)/i)?.[1]);
  }

  // Brave exposes navigator.brave
  if ((navigator as any).brave?.isBrave) browser = "brave";

  const isMobile = /mobi|android|iphone|ipod/i.test(ua) && !/ipad/i.test(uaLower);
  const isTablet = /ipad/i.test(uaLower) || isIPadOS || (/android/.test(uaLower) && !/mobi/i.test(uaLower));

  const supportsBeforeInstallPrompt = "BeforeInstallPromptEvent" in window || /chrome|edg|opr|samsungbrowser/i.test(ua);
  const supportsIOSAddToHomeScreen = platform === "ios" || platform === "ipados";
  const supportsIOSWebPush =
    (platform === "ios" || platform === "ipados") &&
    platformVersion !== null &&
    (platformVersion > 16 || (platformVersion === 16 && (platformVersionLabel ?? "").startsWith("16.4")));

  const isStandalone =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true;

  return {
    platform,
    platformVersion,
    platformVersionLabel,
    browser,
    browserVersion,
    isMobile,
    isTablet,
    supportsBeforeInstallPrompt,
    supportsIOSAddToHomeScreen,
    supportsIOSWebPush,
    isStandalone,
  };
};
