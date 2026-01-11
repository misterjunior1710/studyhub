import { memo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Download, Smartphone, Check, Share, Plus, ArrowLeft, Wifi, BellRing, Zap } from "lucide-react";

const Install = () => {
  const navigate = useNavigate();
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();

  const handleInstall = async () => {
    const result = await promptInstall();
    if (result.outcome === "accepted") {
      // Successfully installed
    }
  };

  const benefits = [
    { icon: Zap, title: "Instant Access", description: "Open StudyHub directly from your home screen" },
    { icon: Wifi, title: "Works Offline", description: "Access cached content even without internet" },
    { icon: BellRing, title: "Stay Updated", description: "Get notified about new answers and messages" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Download Study App Free | iOS Android Windows Mac"
        description="Download free study app for iPhone, Android, Windows, Mac. Homework help app, study groups app, flashcard app. Install now, no app store needed."
        canonical="https://studyhub.world/install"
      />
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
            <Smartphone className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Install StudyHub</h1>
          <p className="text-muted-foreground">
            Get the full app experience on your device
          </p>
        </div>

        {isInstalled ? (
          <Card className="border-success/50 bg-success/5">
            <CardContent className="pt-6 text-center">
              <Check className="h-12 w-12 text-success mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Already Installed!</h2>
              <p className="text-muted-foreground">
                StudyHub is installed on your device. Look for it on your home screen.
              </p>
            </CardContent>
          </Card>
        ) : isInstallable ? (
          <Card className="border-primary/50">
            <CardContent className="pt-6 text-center space-y-4">
              <Download className="h-12 w-12 text-primary mx-auto" />
              <h2 className="text-xl font-semibold">Ready to Install</h2>
              <p className="text-muted-foreground">
                Click below to add StudyHub to your home screen
              </p>
              <Button onClick={handleInstall} size="lg" className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Install StudyHub
              </Button>
            </CardContent>
          </Card>
        ) : isIOS ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share className="h-5 w-5" />
                Install on iOS (iPhone / iPad)
              </CardTitle>
              <CardDescription>
                Follow these steps to add StudyHub to your home screen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium">Open in Safari browser</p>
                  <p className="text-sm text-muted-foreground">
                    Make sure you're using Safari (not Chrome or other browsers)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium">Tap the Share button</p>
                  <p className="text-sm text-muted-foreground">
                    Look for the share icon (box with arrow) at the bottom of the screen
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium">Scroll and tap "Add to Home Screen"</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    Look for the <Plus className="h-4 w-4" /> icon in the menu
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">4</span>
                </div>
                <div>
                  <p className="font-medium">Tap "Add" to confirm</p>
                  <p className="text-sm text-muted-foreground">
                    StudyHub will appear on your home screen
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Install on Your Device</CardTitle>
              <CardDescription>
                Add StudyHub to your home screen for quick access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Use your browser's menu to install this app:
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-primary">Chrome (Android):</span>
                  <span className="text-muted-foreground">Menu (⋮) → "Install app" or "Add to Home screen"</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-primary">Chrome (Desktop):</span>
                  <span className="text-muted-foreground">Menu (⋮) → "Install StudyHub..." or look for install icon in address bar</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-primary">Edge:</span>
                  <span className="text-muted-foreground">Menu → "Apps" → "Install this site as an app"</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-primary">Firefox (Android):</span>
                  <span className="text-muted-foreground">Menu → "Install" (if available) or "Add to Home screen"</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-semibold text-primary">Samsung Internet:</span>
                  <span className="text-muted-foreground">Menu → "Add page to" → "Home screen"</span>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> After installation, you can open StudyHub directly from your home screen like any other app. The app will also work offline for cached content.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 grid gap-4">
          <h2 className="text-lg font-semibold">Why Install?</h2>
          {benefits.map((benefit, index) => (
            <Card key={index} className="bg-muted/30">
              <CardContent className="flex items-start gap-4 pt-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <benefit.icon className="h-5 w-5 text-primary" />
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
    </div>
  );
};

export default memo(Install);
