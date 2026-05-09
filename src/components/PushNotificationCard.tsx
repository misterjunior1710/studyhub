import { Bell, BellOff, Loader2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const PushNotificationCard = () => {
  const { support, permission, isSubscribed, loading, subscribe, unsubscribe } = usePushNotifications();

  const handleEnable = async () => {
    const ok = await subscribe();
    if (ok) toast.success("Push notifications enabled");
    else if (permission === "denied")
      toast.error("Notifications blocked", {
        description: "Allow notifications in your browser settings to enable.",
      });
    else toast.error("Could not enable notifications");
  };

  const handleDisable = async () => {
    await unsubscribe();
    toast.success("Push notifications disabled");
  };

  return (
    <Card variant="gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" aria-hidden="true" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get alerts even when StudyHub is closed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {support === "supported" ? (
          isSubscribed ? (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-sm text-muted-foreground">
                Enabled on this device.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisable}
                disabled={loading}
                aria-label="Disable push notifications on this device"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
                ) : (
                  <BellOff className="h-4 w-4 mr-2" aria-hidden="true" />
                )}
                Disable
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Turn on browser push to get notified about new replies, mentions, and announcements.
              </p>
              <Button onClick={handleEnable} disabled={loading} aria-label="Enable push notifications">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
                ) : (
                  <Bell className="h-4 w-4 mr-2" aria-hidden="true" />
                )}
                Enable Push Notifications
              </Button>
              {permission === "denied" && (
                <p className="text-xs text-destructive">
                  Notifications are blocked. Allow them in your browser site settings, then try again.
                </p>
              )}
            </div>
          )
        ) : support === "ios-needs-install" ? (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <Smartphone className="h-5 w-5 text-primary mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium">Install StudyHub first</p>
              <p className="text-xs text-muted-foreground mt-1">
                On iPhone/iPad, push notifications only work after you add StudyHub to the Home Screen.
              </p>
              <Button asChild size="sm" variant="outline" className="mt-2">
                <Link to="/install">Install StudyHub</Link>
              </Button>
            </div>
          </div>
        ) : support === "ios-too-old" ? (
          <p className="text-sm text-muted-foreground">
            Your iOS version is too old for push notifications. Update to iOS 16.4 or later.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            This browser does not support push notifications. Try Chrome, Edge, or installed Safari.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PushNotificationCard;
