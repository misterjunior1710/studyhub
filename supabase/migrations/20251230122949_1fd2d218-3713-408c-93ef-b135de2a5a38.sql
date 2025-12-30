-- Whiteboards table
CREATE TABLE public.whiteboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.group_chats(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL DEFAULT 'Untitled Whiteboard',
  canvas_data jsonb DEFAULT '{"elements": [], "background": "#ffffff"}'::jsonb,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.whiteboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view whiteboards"
  ON public.whiteboards FOR SELECT
  USING (is_group_member(group_id, auth.uid()));

CREATE POLICY "Group members can create whiteboards"
  ON public.whiteboards FOR INSERT
  WITH CHECK (is_group_member(group_id, auth.uid()) AND auth.uid() = created_by);

CREATE POLICY "Group members can update whiteboards"
  ON public.whiteboards FOR UPDATE
  USING (is_group_member(group_id, auth.uid()));

CREATE POLICY "Group admins can delete whiteboards"
  ON public.whiteboards FOR DELETE
  USING (is_group_admin(group_id, auth.uid()));

-- Collaborative documents table
CREATE TABLE public.collaborative_docs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.group_chats(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL DEFAULT 'Untitled Document',
  content text DEFAULT '',
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.collaborative_docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view documents"
  ON public.collaborative_docs FOR SELECT
  USING (is_group_member(group_id, auth.uid()));

CREATE POLICY "Group members can create documents"
  ON public.collaborative_docs FOR INSERT
  WITH CHECK (is_group_member(group_id, auth.uid()) AND auth.uid() = created_by);

CREATE POLICY "Group members can update documents"
  ON public.collaborative_docs FOR UPDATE
  USING (is_group_member(group_id, auth.uid()));

CREATE POLICY "Group admins can delete documents"
  ON public.collaborative_docs FOR DELETE
  USING (is_group_admin(group_id, auth.uid()));

-- Study events table
CREATE TABLE public.study_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  location text,
  is_virtual boolean DEFAULT true,
  meeting_link text,
  created_by uuid NOT NULL,
  group_id uuid REFERENCES public.group_chats(id) ON DELETE CASCADE,
  is_public boolean DEFAULT false,
  max_attendees integer,
  reminder_sent boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.study_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public events or group events they belong to"
  ON public.study_events FOR SELECT
  USING (is_public = true OR (group_id IS NOT NULL AND is_group_member(group_id, auth.uid())) OR created_by = auth.uid());

CREATE POLICY "Users can create events"
  ON public.study_events FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their events"
  ON public.study_events FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete their events"
  ON public.study_events FOR DELETE
  USING (auth.uid() = created_by);

-- Event RSVPs table
CREATE TABLE public.event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.study_events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going')),
  reminder_enabled boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view RSVPs for events they can see"
  ON public.event_rsvps FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.study_events e 
    WHERE e.id = event_id 
    AND (e.is_public = true OR (e.group_id IS NOT NULL AND is_group_member(e.group_id, auth.uid())) OR e.created_by = auth.uid())
  ));

CREATE POLICY "Users can RSVP to events"
  ON public.event_rsvps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own RSVP"
  ON public.event_rsvps FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own RSVP"
  ON public.event_rsvps FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime for collaborative features
ALTER PUBLICATION supabase_realtime ADD TABLE public.whiteboards;
ALTER PUBLICATION supabase_realtime ADD TABLE public.collaborative_docs;