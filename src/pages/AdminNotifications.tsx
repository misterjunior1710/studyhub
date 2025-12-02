import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Bell, Shield, Users, FileText, Flag, AlertTriangle, CreditCard, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ManualAlertDialog from "@/components/ManualAlertDialog";
import { getAlertsEnabled, setAlertsEnabled, getTodayStats, sendDailySummary } from "@/lib/emailAlerts";

const AdminNotifications = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alertsEnabled, setAlertsEnabledState] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [dailyStats, setDailyStats] = useState({
    total_users: 0,
    total_posts: 0,
    total_flagged: 0,
    total_errors: 0,
    total_payments: 0,
  });

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadSettings();
      loadDailyStats();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: isAdminResult } = await supabase.rpc("is_admin");
    
    if (!isAdminResult) {
      navigate("/");
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  };

  const loadSettings = async () => {
    const enabled = await getAlertsEnabled();
    setAlertsEnabledState(enabled);
  };

  const loadDailyStats = async () => {
    const stats = await getTodayStats();
    setDailyStats(stats);
  };

  const handleToggleAlerts = async (checked: boolean) => {
    setToggleLoading(true);
    const success = await setAlertsEnabled(checked);
    if (success) {
      setAlertsEnabledState(checked);
      toast.success(`Alerts ${checked ? 'enabled' : 'disabled'}`);
    } else {
      toast.error('Failed to update alert settings');
    }
    setToggleLoading(false);
  };

  const handleSendSummary = async () => {
    setSummaryLoading(true);
    const result = await sendDailySummary();
    if (result.success) {
      toast.success('Daily summary sent successfully');
    } else {
      toast.error(result.message || 'Failed to send daily summary');
    }
    setSummaryLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Alerts Toggle Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Alert Settings
              </CardTitle>
              <CardDescription>
                Control whether email alerts are sent for events.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Enable Admin Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Alerts are {alertsEnabled ? 'ON' : 'OFF'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={alertsEnabled}
                  onCheckedChange={handleToggleAlerts}
                  disabled={toggleLoading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Daily Summary Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Daily Summary Preview
              </CardTitle>
              <CardDescription>
                Live stats for today. Summary is sent automatically at 7:30 PM IST.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-muted-foreground">Today's Users</span>
                  </div>
                  <p className="text-2xl font-bold">{dailyStats.total_users}</p>
                </div>
                
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Today's Posts</span>
                  </div>
                  <p className="text-2xl font-bold">{dailyStats.total_posts}</p>
                </div>
                
                <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Flag className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-muted-foreground">Flagged Posts</span>
                  </div>
                  <p className="text-2xl font-bold">{dailyStats.total_flagged}</p>
                </div>
                
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-muted-foreground">Errors</span>
                  </div>
                  <p className="text-2xl font-bold">{dailyStats.total_errors}</p>
                </div>
                
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-muted-foreground">Payments</span>
                  </div>
                  <p className="text-2xl font-bold">{dailyStats.total_payments}</p>
                </div>
              </div>

              <Button 
                onClick={handleSendSummary} 
                disabled={summaryLoading}
                className="w-full gap-2"
              >
                {summaryLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send Today's Summary Now
              </Button>
            </CardContent>
          </Card>

          {/* Manual Alert Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Admin Notifications
              </CardTitle>
              <CardDescription>
                Send manual alerts for important events. Alerts are sent via EmailJS for: payments, errors, flagged posts, and manual alerts only.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-3 mb-3">
                  <Bell className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Manual Alert System</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Use this to send custom alerts to yourself. Only the following event types trigger emails:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside mb-4 space-y-1">
                  <li><strong>payment</strong> - Successful payment notifications</li>
                  <li><strong>error</strong> - Backend/API failures</li>
                  <li><strong>flagged_post</strong> - Flagged or suspicious content</li>
                  <li><strong>manual_alert</strong> - Custom alerts from this page</li>
                </ul>
                <ManualAlertDialog />
              </div>

              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <h4 className="font-medium text-amber-600 dark:text-amber-400 mb-2">
                  Configuration Required
                </h4>
                <p className="text-sm text-muted-foreground">
                  To enable email alerts, add these environment variables:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside mt-2 space-y-1">
                  <li>VITE_EMAILJS_SERVICE_ID</li>
                  <li>VITE_EMAILJS_TEMPLATE_ID</li>
                  <li>VITE_EMAILJS_PUBLIC_KEY</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminNotifications;
