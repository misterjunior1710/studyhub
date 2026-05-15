import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Rss,
  HelpCircle,
  ListChecks,
  Sparkles,
  Calendar,
  NotebookPen,
  Palette,
  Users,
  UserPlus,
  Trophy,
  Bookmark,
  Download,
  Megaphone,
  LifeBuoy,
  Settings,
  Timer,
  GraduationCap,
  FileText,
  MessageSquare,
  Hash,
  Clock,
  TrendingUp,
  Search as SearchIcon,
  Briefcase,
  Compass,
  Layers,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "@/contexts/AuthContext";

type PageEntry = {
  path: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  keywords?: string[];
  category: string;
};

const PAGES: PageEntry[] = [
  { path: "/", label: "Home", icon: Compass, category: "Pages", keywords: ["landing", "start"] },
  { path: "/feed", label: "Feed", icon: Rss, category: "Pages", keywords: ["posts", "timeline"] },
  { path: "/questions", label: "Questions", icon: HelpCircle, category: "Pages", keywords: ["q&a", "doubts", "ask"] },
  { path: "/tasks", label: "Tasks", icon: ListChecks, category: "Productivity", keywords: ["todo", "assignments"] },
  { path: "/calendar", label: "Calendar", icon: Calendar, category: "Productivity", keywords: ["schedule", "events"] },
  { path: "/notes", label: "Notes", icon: NotebookPen, category: "Productivity", keywords: ["writing", "journal"] },
  { path: "/whiteboards", label: "Whiteboards", icon: Palette, category: "Productivity", keywords: ["draw", "canvas"] },
  { path: "/study", label: "Study Tools", icon: Timer, category: "Study", keywords: ["pomodoro", "flashcards", "quiz", "mind map"] },
  { path: "/content-generator", label: "AI Study Tools", icon: Sparkles, category: "Study", keywords: ["generate", "ai", "summarise"] },
  { path: "/assistant", label: "Nova AI", icon: Sparkles, category: "Study", keywords: ["chat", "ai", "tutor", "assistant"] },
  { path: "/transitions", label: "Life Skills", icon: GraduationCap, category: "Study", keywords: ["budget", "savings", "transition", "guide"] },
  { path: "/transitions/resources", label: "Transition Resources", icon: FileText, category: "Study", keywords: ["resources", "library"] },
  { path: "/friends", label: "Friends", icon: UserPlus, category: "Social" },
  { path: "/groups", label: "Groups", icon: Users, category: "Social", keywords: ["communities", "study group"] },
  { path: "/leaderboard", label: "Leaderboard", icon: Trophy, category: "Social", keywords: ["ranking", "league"] },
  { path: "/saved", label: "Saved Posts", icon: Bookmark, category: "Account" },
  { path: "/install", label: "Install App", icon: Download, category: "Account", keywords: ["pwa", "download"] },
  { path: "/updates", label: "Updates", icon: Megaphone, category: "Account", keywords: ["announcements", "changelog"] },
  { path: "/support", label: "Support", icon: LifeBuoy, category: "Account", keywords: ["help", "contact"] },
  { path: "/settings", label: "Settings", icon: Settings, category: "Account", keywords: ["preferences", "profile"] },
];

const RECENT_KEY = "studyhub:globalSearch:recent";
const MAX_RECENT = 6;

const TRENDING = [
  "Math notes",
  "Flashcards",
  "Whiteboard",
  "Groups",
  "Budgeting guide",
  "Nova AI",
];

type ResultItem =
  | { kind: "post"; id: string; title: string; subject?: string }
  | { kind: "user"; id: string; username: string; avatar_url?: string | null }
  | { kind: "group"; id: string; name: string; description?: string | null }
  | { kind: "note"; id: string; title: string }
  | { kind: "deck"; id: string; title: string }
  | { kind: "tag"; id: string; tag: string };

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GlobalSearch = ({ open, onOpenChange }: GlobalSearchProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query.trim(), 220);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const reqId = useRef(0);

  // Load recent searches
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) setRecent(JSON.parse(stored));
    } catch {}
  }, [open]);

  const saveRecent = useCallback((term: string) => {
    if (!term.trim()) return;
    setRecent((prev) => {
      const next = [term, ...prev.filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(0, MAX_RECENT);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  // Run async search
  useEffect(() => {
    if (!debounced || debounced.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    const id = ++reqId.current;
    setLoading(true);

    const term = debounced;
    const like = `%${term.replace(/[%_]/g, "")}%`;

    (async () => {
      try {
        const queries: any[] = [
          // Posts (visible: not hidden)
          supabase
            .from("posts")
            .select("id, title, subject, content, hashtags")
            .eq("is_hidden", false)
            .or(`title.ilike.${like},subject.ilike.${like},content.ilike.${like}`)
            .order("created_at", { ascending: false })
            .limit(5),
          // Public profiles
          supabase
            .from("profiles")
            .select("id, username, avatar_url, is_public")
            .eq("is_public", true)
            .ilike("username", like)
            .limit(5),
          // Groups (RLS will scope to public/member)
          supabase
            .from("group_chats")
            .select("id, name, description")
            .or(`name.ilike.${like},description.ilike.${like}`)
            .limit(5),
        ];

        if (user) {
          queries.push(
            // Own notes
            supabase
              .from("notes")
              .select("id, title, content")
              .eq("user_id", user.id)
              .or(`title.ilike.${like},content.ilike.${like},subject.ilike.${like}`)
              .order("updated_at", { ascending: false })
              .limit(5),
            // Flashcard decks (own + public via RLS)
            supabase
              .from("flashcard_decks")
              .select("id, title, description")
              .or(`title.ilike.${like},description.ilike.${like}`)
              .limit(5),
          );
        }

        const responses = await Promise.all(queries);
        if (id !== reqId.current) return;

        const collected: ResultItem[] = [];
        const [postsRes, usersRes, groupsRes, notesRes, decksRes] = responses;

        (postsRes?.data ?? []).forEach((p: any) =>
          collected.push({ kind: "post", id: p.id, title: p.title, subject: p.subject }),
        );
        (usersRes?.data ?? []).forEach((u: any) =>
          collected.push({ kind: "user", id: u.id, username: u.username, avatar_url: u.avatar_url }),
        );
        (groupsRes?.data ?? []).forEach((g: any) =>
          collected.push({ kind: "group", id: g.id, name: g.name, description: g.description }),
        );
        (notesRes?.data ?? []).forEach((n: any) =>
          collected.push({ kind: "note", id: n.id, title: n.title }),
        );
        (decksRes?.data ?? []).forEach((d: any) =>
          collected.push({ kind: "deck", id: d.id, title: d.title }),
        );

        // Hashtag synthetic result
        if (/^#?\w+$/.test(term)) {
          const tag = term.replace(/^#/, "");
          collected.unshift({ kind: "tag", id: tag, tag });
        }

        setResults(collected);
      } catch (e) {
        if (id === reqId.current) setResults([]);
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    })();
  }, [debounced, user]);

  // Filter pages by fuzzy-ish includes
  const filteredPages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PAGES.slice(0, 8);
    return PAGES.filter((p) => {
      const hay = [p.label, p.path, p.description, ...(p.keywords ?? [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      // simple fuzzy: every char of q appears in order
      let i = 0;
      for (const ch of hay) {
        if (ch === q[i]) i++;
        if (i === q.length) return true;
      }
      return hay.includes(q);
    }).slice(0, 8);
  }, [query]);

  const go = useCallback(
    (path: string, term?: string) => {
      if (term) saveRecent(term);
      else if (query.trim()) saveRecent(query.trim());
      onOpenChange(false);
      navigate(path);
    },
    [navigate, onOpenChange, query, saveRecent],
  );

  const groupedPages = useMemo(() => {
    const groups: Record<string, PageEntry[]> = {};
    for (const p of filteredPages) {
      (groups[p.category] ||= []).push(p);
    }
    return groups;
  }, [filteredPages]);

  const renderResultGroup = (
    label: string,
    icon: React.ElementType,
    items: ResultItem[],
    onSelect: (it: any) => void,
    getLabel: (it: any) => string,
    getSub?: (it: any) => string | undefined,
  ) => {
    if (!items.length) return null;
    const Icon = icon;
    return (
      <CommandGroup heading={label}>
        {items.map((it: any) => (
          <CommandItem
            key={`${label}-${it.id}`}
            value={`${label}-${getLabel(it)}-${it.id}`}
            onSelect={() => onSelect(it)}
            className="gap-2"
          >
            <Icon className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col min-w-0">
              <span className="truncate">{getLabel(it)}</span>
              {getSub?.(it) && (
                <span className="text-xs text-muted-foreground truncate">{getSub(it)}</span>
              )}
            </div>
          </CommandItem>
        ))}
      </CommandGroup>
    );
  };

  const posts = results.filter((r) => r.kind === "post") as Extract<ResultItem, { kind: "post" }>[];
  const users = results.filter((r) => r.kind === "user") as Extract<ResultItem, { kind: "user" }>[];
  const groups = results.filter((r) => r.kind === "group") as Extract<ResultItem, { kind: "group" }>[];
  const notes = results.filter((r) => r.kind === "note") as Extract<ResultItem, { kind: "note" }>[];
  const decks = results.filter((r) => r.kind === "deck") as Extract<ResultItem, { kind: "deck" }>[];
  const tags = results.filter((r) => r.kind === "tag") as Extract<ResultItem, { kind: "tag" }>[];

  const hasQuery = query.trim().length > 0;
  const hasResults =
    filteredPages.length > 0 ||
    posts.length || users.length || groups.length || notes.length || decks.length || tags.length;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search pages, posts, friends, groups, notes…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[420px]">
        {!hasResults && hasQuery && !loading && (
          <CommandEmpty>No results for “{query}”.</CommandEmpty>
        )}

        {/* Empty state: recent + trending */}
        {!hasQuery && (
          <>
            {recent.length > 0 && (
              <CommandGroup heading="Recent">
                {recent.map((term) => (
                  <CommandItem
                    key={`recent-${term}`}
                    value={`recent-${term}`}
                    onSelect={() => setQuery(term)}
                    className="gap-2"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{term}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandGroup heading="Trending">
              {TRENDING.map((term) => (
                <CommandItem
                  key={`trend-${term}`}
                  value={`trend-${term}`}
                  onSelect={() => setQuery(term)}
                  className="gap-2"
                >
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span>{term}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Pages — categorized */}
        {Object.entries(groupedPages).map(([cat, items]) => (
          <CommandGroup key={cat} heading={cat}>
            {items.map((p) => {
              const Icon = p.icon;
              return (
                <CommandItem
                  key={p.path}
                  value={`page-${p.label}-${p.path}`}
                  onSelect={() => go(p.path)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span>{p.label}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground/70">{p.path}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}

        {/* Async results */}
        {hasQuery && (
          <>
            {tags.length > 0 && (
              <CommandGroup heading="Tag">
                {tags.map((t) => (
                  <CommandItem
                    key={`tag-${t.tag}`}
                    value={`tag-${t.tag}`}
                    onSelect={() => go(`/feed?tag=${encodeURIComponent(t.tag)}`, t.tag)}
                    className="gap-2"
                  >
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span>#{t.tag}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {renderResultGroup(
              "Questions & Posts",
              MessageSquare,
              posts,
              (p) => go(`/post/${p.id}`, p.title),
              (p) => p.title,
              (p) => p.subject,
            )}
            {renderResultGroup(
              "People",
              UserPlus,
              users,
              (u) => go(`/user/${u.username}`, u.username),
              (u) => `@${u.username}`,
            )}
            {renderResultGroup(
              "Groups",
              Users,
              groups,
              (g) => go(`/groups/${g.id}`, g.name),
              (g) => g.name,
              (g) => g.description ?? undefined,
            )}
            {renderResultGroup(
              "Notes",
              NotebookPen,
              notes,
              (n) => go(`/notes?id=${n.id}`, n.title),
              (n) => n.title || "Untitled note",
            )}
            {renderResultGroup(
              "Flashcard Decks",
              Layers,
              decks,
              (d) => go(`/study?deck=${d.id}`, d.title),
              (d) => d.title,
            )}

            {loading && (
              <div className="px-3 py-2 text-xs text-muted-foreground">Searching…</div>
            )}
          </>
        )}

        {/* Footer hint */}
        <CommandSeparator />
        <div className="flex items-center justify-between px-3 py-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <SearchIcon className="h-3 w-3" /> Global search
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground/70">↵</kbd> open ·{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground/70">esc</kbd> close
          </span>
        </div>
      </CommandList>
    </CommandDialog>
  );
};

export default GlobalSearch;
