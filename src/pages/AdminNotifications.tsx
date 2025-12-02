import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ManualAlertDialog from "@/components/ManualAlertDialog";

const AdminNotifications = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

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
