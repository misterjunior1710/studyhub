import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";
import EventCalendar from "@/components/calendar/EventCalendar";
import { Loader2 } from "lucide-react";

const Calendar = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Event Calendar | StudyHub"
        description="View and join study sessions, workshops, and office hours on StudyHub."
      />
      <Navbar />
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {userId && <EventCalendar userId={userId} />}
      </main>
    </div>
  );
};

export default Calendar;