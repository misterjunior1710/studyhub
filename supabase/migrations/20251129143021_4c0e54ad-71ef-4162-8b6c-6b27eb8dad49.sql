-- Create posts table
create table public.posts (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  content text not null,
  subject text not null,
  grade text not null,
  stream text not null,
  country text not null,
  upvotes integer not null default 0,
  downvotes integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Create votes table
create table public.votes (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users on delete cascade,
  post_id uuid not null references public.posts on delete cascade,
  vote_type text not null check (vote_type in ('up', 'down')),
  created_at timestamp with time zone not null default now(),
  unique(user_id, post_id)
);

-- Create comments table
create table public.comments (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users on delete cascade,
  post_id uuid not null references public.posts on delete cascade,
  content text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Create notifications table
create table public.notifications (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users on delete cascade,
  type text not null,
  content text not null,
  post_id uuid references public.posts on delete cascade,
  is_read boolean not null default false,
  created_at timestamp with time zone not null default now()
);

-- Create bookmarks table
create table public.bookmarks (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users on delete cascade,
  post_id uuid not null references public.posts on delete cascade,
  created_at timestamp with time zone not null default now(),
  unique(user_id, post_id)
);

-- Enable RLS on all tables
alter table public.posts enable row level security;
alter table public.votes enable row level security;
alter table public.comments enable row level security;
alter table public.notifications enable row level security;
alter table public.bookmarks enable row level security;

-- Posts policies
create policy "Posts are viewable by everyone"
  on public.posts for select using (true);

create policy "Users can create their own posts"
  on public.posts for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own posts"
  on public.posts for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own posts"
  on public.posts for delete 
  using (auth.uid() = user_id);

-- Votes policies
create policy "Votes are viewable by everyone"
  on public.votes for select using (true);

create policy "Users can create their own votes"
  on public.votes for insert 
  with check (auth.uid() = user_id);

create policy "Users can delete their own votes"
  on public.votes for delete 
  using (auth.uid() = user_id);

-- Comments policies
create policy "Comments are viewable by everyone"
  on public.comments for select using (true);

create policy "Users can create their own comments"
  on public.comments for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own comments"
  on public.comments for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on public.comments for delete 
  using (auth.uid() = user_id);

-- Notifications policies
create policy "Users can view their own notifications"
  on public.notifications for select 
  using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on public.notifications for update 
  using (auth.uid() = user_id);

-- Bookmarks policies
create policy "Users can view their own bookmarks"
  on public.bookmarks for select 
  using (auth.uid() = user_id);

create policy "Users can create their own bookmarks"
  on public.bookmarks for insert 
  with check (auth.uid() = user_id);

create policy "Users can delete their own bookmarks"
  on public.bookmarks for delete 
  using (auth.uid() = user_id);

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Triggers for updated_at
create trigger set_updated_at_posts
  before update on public.posts
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_comments
  before update on public.comments
  for each row execute function public.handle_updated_at();

-- Function to create notification when someone comments on a post
create or replace function public.create_comment_notification()
returns trigger as $$
declare
  post_author_id uuid;
  commenter_username text;
begin
  -- Get the post author
  select user_id into post_author_id from public.posts where id = new.post_id;
  
  -- Get commenter username
  select username into commenter_username from public.profiles where id = new.user_id;
  
  -- Only create notification if someone else commented (not the author)
  if post_author_id != new.user_id then
    insert into public.notifications (user_id, type, content, post_id)
    values (
      post_author_id,
      'comment',
      commenter_username || ' commented on your post',
      new.post_id
    );
  end if;
  
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Trigger for comment notifications
create trigger on_comment_created
  after insert on public.comments
  for each row execute function public.create_comment_notification();

-- Function to update vote counts on posts
create or replace function public.update_post_votes()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    if new.vote_type = 'up' then
      update public.posts set upvotes = upvotes + 1 where id = new.post_id;
    else
      update public.posts set downvotes = downvotes + 1 where id = new.post_id;
    end if;
  elsif TG_OP = 'DELETE' then
    if old.vote_type = 'up' then
      update public.posts set upvotes = upvotes - 1 where id = old.post_id;
    else
      update public.posts set downvotes = downvotes - 1 where id = old.post_id;
    end if;
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql security definer set search_path = public;

-- Trigger for updating vote counts
create trigger on_vote_change
  after insert or delete on public.votes
  for each row execute function public.update_post_votes();