import { memo, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { detectDevice, type DeviceInfo } from "@/lib/deviceDetect";
import {
  Download,
  Smartphone,
  Check,
  Share,
  Plus,
  ArrowLeft,
  Wifi,
  BellRing,
  Zap,
  Apple,
  MonitorSmartphone,
  Info,
} from "lucide-react";

type TutorialId =
  | "ios-modern"
  | "ios-legacy"
  | "ipados"
  | "android-chrome"
  | "android-samsung"
  | "android-firefox"
  | "desktop-chrome"
  | "desktop-edge"
  | "desktop-safari"
  | "fallback";

interface Step {
  title: string;
  detail?: string;
}

interface Tutorial {
  id: TutorialId;
  label: string;
  icon: typeof Smartphone;
  versionHint?: string;
  steps: Step[];
  note?: string;
}

const TUTORIALS: Record<TutorialId, Tutorial> = {
  "ios-modern": {
    id: "ios-modern",
    label: "iPhone (iOS 16.4+)",
    icon: Apple,
    versionHint: "Recommended for iOS 16.4 and newer — supports push notifications",
    steps: [
      { title: "Open this page in Safari", detail: "Push notifications only work when installed via Safari, not Chrome or Firefox on iOS." },
      { title: "Tap the Share button", detail: "It's the square with an up-arrow at the bottom of Safari." },
      { title: 'Tap "Add to Home Screen"', detail: "Scroll down in the share sheet to find it." },
      { title: 'Tap "Add" to confirm', detail: "StudyHub will appear on your home screen as an app." },
      { title: "Open StudyHub from the home screen", detail: "Then enable notifications inside Settings to receive push alerts." },
    ],
  },
  "ios-legacy": {
    id: "ios-legacy",
    label: "iPhone (older iOS)",
    icon: Apple,
    versionHint: "iOS 12.2 – 16.3 — install works, push notifications NOT supported",
    steps: [
      { title: "Open this page in Safari", detail: "Other browsers cannot add apps to your home screen on iOS." },
      { title: "Tap the Share button", detail: "Bottom of the screen on iPhone, top-right on iPad." },
      { title: 'Tap "Add to Home Screen"' },
      { title: 'Tap "Add"', detail: "StudyHub will install like a regular app." },
    ],
    note: "Tip: Updating to iOS 16.4 or later unlocks push notifications for installed PWAs.",
  },
  ipados: {
    id: "ipados",
    label: "iPad",
    icon: Apple,
    versionHint: "iPadOS 16.4+ supports push notifications",
    steps: [
      { title: "Open this page in Safari" },
      { title: "Tap the Share icon", detail: "Top-right corner of Safari." },
      { title: 'Tap "Add to Home Screen"' },
      { title: 'Tap "Add" in the top-right' },
    ],
  },
  "android-chrome": {
    id: "android-chrome",
    label: "Android (Chrome)",
    icon: Smartphone,
    versionHint: "Android 8+ recommended — push notifications fully supported",
    steps: [
      { title: 'Tap the menu (⋮) in the top-right of Chrome' },
      { title: 'Tap "Install app" or "Add to Home screen"', detail: "Newer Chrome shows a one-tap install banner." },
      { title: 'Tap "Install" to confirm' },
      { title: "Open StudyHub from your home screen", detail: "Allow notifications when prompted." },
    ],
  },
  "android-samsung": {
    id: "android-samsung",
    label: "Samsung Internet",
    icon: Smartphone,
    versionHint: "Samsung Internet 4+ on Android 5+",
    steps: [
      { title: "Tap the menu (☰) at the bottom" },
      { title: 'Tap "Add page to"' },
      { title: 'Choose "Home screen"' },
      { title: 'Tap "Add"' },
    ],
  },
  "android-firefox": {
    id: "android-firefox",
    label: "Firefox (Android)",
    icon: Smartphone,
    steps: [
      { title: "Tap the menu (⋮) in the top-right" },
      { title: 'Tap "Install" or "Add to Home screen"' },
      { title: "Confirm the install prompt" },
    ],
    note: "Firefox PWA install support varies by Android version. If you don't see Install, use Chrome instead.",
  },
  "desktop-chrome": {
    id: "desktop-chrome",
    label: "Chrome (Desktop)",
    icon: MonitorSmartphone,
    steps: [
      { title: "Click the install icon in the address bar", detail: "Looks like a small monitor with a down-arrow." },
      { title: 'Or open the menu (⋮) and click "Install StudyHub..."' },
      { title: "Click Install in the popup" },
    ],
  },
  "desktop-edge": {
    id: "desktop-edge",
    label: "Edge (Desktop)",
    icon: MonitorSmartphone,
    steps: [
      { title: "Click the install icon in the address bar" },
      { title: 'Or menu (...) → Apps → "Install this site as an app"' },
      { title: "Click Install" },
    ],
  },
  "desktop-safari": {
    id: "desktop-safari",
    label: "Safari (Mac)",
    icon: Apple,
    versionHint: "macOS Sonoma 14+ required",
    steps: [
      { title: 'In Safari, click File → "Add to Dock..."' },
      { title: "Confirm the name and click Add" },
      { title: "Open StudyHub from the Dock or Launchpad" },
    ],
    note: "On older macOS, use Chrome or Edge to install instead.",
  },
  fallback: {
    id: "fallback",
    label: "Other browsers",
    icon: Download,
    steps: [
      { title: "Open your browser's main menu" },
      { title: 'Look for "Install app", "Add to Home Screen", or "Install this site"' },
      { title: "Follow the on-screen prompt" },
    ],
    note: "Best results: use Chrome, Edge, or Safari (on iOS).",
  },
};

const pickDefaultTutorial = (d: DeviceInfo): TutorialId => {
  if (d.platform === "ios") return d.supportsIOSWebPush ? "ios-modern" : "ios-legacy";
  if (d.platform === "ipados") return "ipados";
  if (d.platform === "android") {
    if (d.browser === "samsung") return "android-samsung";
    if (d.browser === "firefox") return "android-firefox";
    return "android-chrome";
  }
  if (d.browser === "edge") return "desktop-edge";
  if (d.platform === "macos" && d.browser === "safari") return "desktop-safari";
  if (d.browser === "chrome" || d.browser === "brave" || d.browser === "opera") return "desktop-chrome";
  return "fallback";
};

const Install = () => {
  const navigate = useNavigate();
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const device = useMemo(detectDevice, []);
  const defaultTab = useMemo(() => pickDefaultTutorial(device), [device]);
  const [activeTab, setActiveTab] = useState<TutorialId>(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const handleInstall = async () => {
    await promptInstall();
  };

  const benefits = [
    { icon: Zap, title: "Instant Access", description: "Open StudyHub from your home screen, no browser needed" },
    { icon: Wifi, title: "Works Offline", description: "Cached content stays available without internet" },
    { icon: BellRing, title: "Push Notifications", description: "Get alerts for messages and answers (Android, iOS 16.4+)" },
  ];

  // Build the visible tab set based on platform so we don't overwhelm users.
  const visibleTabs: TutorialId[] = useMemo(() => {
    if (device.platform === "ios") return ["ios-modern", "ios-legacy"];
    if (device.platform === "ipados") return ["ipados", "ios-legacy"];
    if (device.platform === "android") return ["android-chrome", "android-samsung", "android-firefox"];
    if (device.platform === "macos") return ["desktop-safari", "desktop-chrome", "desktop-edge"];
    if (device.platform === "windows" || device.platform === "linux" || device.platform === "chromeos")
      return ["desktop-chrome", "desktop-edge"];
    return ["fallback"];
  }, [device.platform]);

  const detected = `${device.platform === "unknown" ? "your device" : device.platform.toUpperCase()}${
    device.platformVersionLabel ? ` ${device.platformVersionLabel}` : ""
  } · ${device.browser === "unknown" ? "Browser" : device.browser}${
    device.browserVersion ? ` ${device.browserVersion}` : ""
  }`;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Install StudyHub | Free Study App for iOS, Android, Desktop"
        description="Install StudyHub on iPhone, Android, Windows or Mac in seconds. Step-by-step tutorials auto-tailored to your device. Works offline."
        canonical="https://studyhub.world/install"
      />
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6" aria-label="Go back">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
            <Smartphone className="h-10 w-10 text-primary-foreground" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Install StudyHub</h1>
          <p className="text-muted-foreground">Get the full app experience on your device</p>
          <Badge variant="secondary" className="mt-3 text-xs">Detected: {detected}</Badge>
        </div>

        {isInstalled ? (
          <Card className="border-success/50 bg-success/5">
            <CardContent className="pt-6 text-center">
              <Check className="h-12 w-12 text-success mx-auto mb-4" aria-hidden="true" />
              <h2 className="text-xl font-semibold mb-2">Already Installed</h2>
              <p className="text-muted-foreground">
                StudyHub is on your device. Look for it on your home screen or Dock.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {isInstallable && (
              <Card className="border-primary/50 mb-6">
                <CardContent className="pt-6 text-center space-y-4">
                  <Download className="h-12 w-12 text-primary mx-auto" aria-hidden="true" />
                  <h2 className="text-xl font-semibold">One-Tap Install Available</h2>
                  <p className="text-muted-foreground">
                    Your browser supports direct install — no manual steps needed.
                  </p>
                  <Button onClick={handleInstall} size="lg" className="w-full sm:w-auto">
                    <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                    Install StudyHub
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share className="h-5 w-5" aria-hidden="true" />
                  Install Guide
                </CardTitle>
                <CardDescription>
                  We picked the steps for your device automatically — switch tabs if needed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TutorialId)}>
                  <TabsList
                    className="w-full flex flex-wrap h-auto gap-1 mb-4"
                    aria-label="Choose install instructions for your device"
                  >
                    {visibleTabs.map((id) => (
                      <TabsTrigger key={id} value={id} className="text-xs sm:text-sm">
                        {TUTORIALS[id].label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {visibleTabs.map((id) => {
                    const tut = TUTORIALS[id];
                    return (
                      <TabsContent key={id} value={id} className="space-y-4">
                        {tut.versionHint && (
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                            <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" aria-hidden="true" />
                            <p className="text-xs text-muted-foreground">{tut.versionHint}</p>
                          </div>
                        )}
                        {tut.steps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-primary">{idx + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium flex items-center gap-1 flex-wrap">
                                {step.title}
                                {/Add to Home Screen/i.test(step.title) && <Plus className="h-4 w-4" aria-hidden="true" />}
                              </p>
                              {step.detail && (
                                <p className="text-sm text-muted-foreground">{step.detail}</p>
                              )}
                            </div>
                          </div>
                        ))}
                        {tut.note && (
                          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground">
                              <strong>Note:</strong> {tut.note}
                            </p>
                          </div>
                        )}
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}

        <div className="mt-8 grid gap-4">
          <h2 className="text-lg font-semibold">Why Install?</h2>
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="bg-muted/30">
              <CardContent className="flex items-start gap-4 pt-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <benefit.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-medium">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default memo(Install);
