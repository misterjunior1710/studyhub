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
        title="Study Calendar | Schedule Study Sessions | Exam Planner"
        description="Plan your study schedule with our free study calendar. Schedule study sessions, track exams, set reminders. Online study planner for students."
        canonical="https://studyhub.world/calendar"
      />
      <Navbar />
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 opacity-0 animate-hero-fade-up">
            Event Calendar
          </h1>
          <p className="text-muted-foreground opacity-0 animate-hero-fade-up" style={{ animationDelay: "100ms" }}>
            View and join study sessions, workshops, and office hours
          </p>
        </header>
        <div className="opacity-0 animate-reveal-up" style={{ animationDelay: "200ms" }}>
          {userId && <EventCalendar userId={userId} />}
        </div>
      </main>
    </div>
  );
};

export default Calendar;