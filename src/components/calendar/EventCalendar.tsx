import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon, Plus, Loader2, MapPin, 
  Video, Users, Clock, Bell, Check, X, Share2 
} from "lucide-react";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import ShareEventDialog from "./ShareEventDialog";
import CreateEventDialog from "./CreateEventDialog";

interface StudyEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  is_virtual: boolean;
  meeting_link: string | null;
  created_by: string;
  group_id: string | null;
  is_public: boolean;
  max_attendees: number | null;
  rsvp_count?: number;
  user_rsvp?: string | null;
}

interface EventCalendarProps {
  userId: string;
  groupId?: string;
}

const EventCalendar = ({ userId, groupId }: EventCalendarProps) => {
  const [events, setEvents] = useState<StudyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [rsvpLoading, setRsvpLoading] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, [userId, groupId, currentMonth]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);

      let query = supabase
        .from("study_events")
        .select("*")
        .gte("start_time", monthStart.toISOString())
        .lte("start_time", monthEnd.toISOString())
        .order("start_time", { ascending: true });

      if (groupId) {
        query = query.eq("group_id", groupId);
      }

      const { data: eventsData, error: eventsError } = await query;

      if (eventsError) throw eventsError;

      // Get RSVPs for each event
      const eventsWithRsvps = await Promise.all(
        (eventsData || []).map(async (event) => {
          const { count } = await supabase
            .from("event_rsvps")
            .select("*", { count: "exact", head: true })
            .eq("event_id", event.id)
            .eq("status", "going");

          const { data: userRsvp } = await supabase
            .from("event_rsvps")
            .select("status")
            .eq("event_id", event.id)
            .eq("user_id", userId)
            .single();

          return {
            ...event,
            rsvp_count: count || 0,
            user_rsvp: userRsvp?.status || null,
          };
        })
      );

      setEvents(eventsWithRsvps);
    } catch (error) {
      console.error("Error loading events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleRsvp = async (eventId: string, status: "going" | "maybe" | "not_going") => {
    setRsvpLoading(eventId);
    try {
      const event = events.find(e => e.id === eventId);
      
      if (event?.user_rsvp) {
        // Update existing RSVP
        const { error } = await supabase
          .from("event_rsvps")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("event_id", eventId)
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        // Create new RSVP
        const { error } = await supabase
          .from("event_rsvps")
          .insert({
            event_id: eventId,
            user_id: userId,
            status,
          });

        if (error) throw error;
      }

      toast.success(`RSVP updated to "${status}"`);
      loadEvents();
    } catch (error) {
      console.error("Error updating RSVP:", error);
      toast.error("Failed to update RSVP");
    } finally {
      setRsvpLoading(null);
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getEventsForDay = (date: Date) => {
    return events.filter((event) => isSameDay(new Date(event.start_time), date));
  };

  const selectedDateEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Event Calendar
        </h2>
        <CreateEventDialog userId={userId} groupId={groupId} onEventCreated={loadEvents} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        {/* Calendar Grid */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                Previous
              </Button>
              <CardTitle className="text-lg">
                {format(currentMonth, "MMMM yyyy")}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                Next
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
              {/* Empty cells for days before the month starts */}
              {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {days.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      aspect-square p-1 rounded-lg text-sm transition-colors relative
                      ${isToday(day) ? "bg-primary/10 font-bold" : ""}
                      ${isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"}
                    `}
                  >
                    {format(day, "d")}
                    {dayEvents.length > 0 && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {selectedDate
                ? format(selectedDate, "MMMM d, yyyy")
                : "Select a date"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
            {selectedDate ? (
              selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg bg-muted/50 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <div className="flex items-center gap-1">
                        {event.created_by === userId && (
                          <ShareEventDialog 
                            eventId={event.id} 
                            eventTitle={event.title}
                            userId={userId}
                          />
                        )}
                        <Badge variant={event.is_virtual ? "secondary" : "outline"}>
                          {event.is_virtual ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(new Date(event.start_time), "h:mm a")} -{" "}
                      {format(new Date(event.end_time), "h:mm a")}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {event.rsvp_count} attending
                      {event.max_attendees && ` / ${event.max_attendees} max`}
                    </div>
                    {event.is_virtual && event.meeting_link && (
                      <a
                        href={event.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Join Meeting
                      </a>
                    )}
                    <div className="flex gap-1 pt-1">
                      <Button
                        size="sm"
                        variant={event.user_rsvp === "going" ? "default" : "outline"}
                        className="flex-1 h-7 text-xs"
                        onClick={() => handleRsvp(event.id, "going")}
                        disabled={rsvpLoading === event.id}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Going
                      </Button>
                      <Button
                        size="sm"
                        variant={event.user_rsvp === "maybe" ? "default" : "outline"}
                        className="flex-1 h-7 text-xs"
                        onClick={() => handleRsvp(event.id, "maybe")}
                        disabled={rsvpLoading === event.id}
                      >
                        Maybe
                      </Button>
                      <Button
                        size="sm"
                        variant={event.user_rsvp === "not_going" ? "default" : "outline"}
                        className="flex-1 h-7 text-xs"
                        onClick={() => handleRsvp(event.id, "not_going")}
                        disabled={rsvpLoading === event.id}
                      >
                        <X className="h-3 w-3 mr-1" />
                        No
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No events on this day
                </p>
              )
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Click a date to see events
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventCalendar;