import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const REPO_OWNER = "misterjunior1710";
const REPO_NAME = "studyhub";
const BRANCH = "main";
const CACHE_KEY = `${REPO_OWNER}/${REPO_NAME}/${BRANCH}`;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ITEMS = 15;

// Conventional-commit style prefixes we surface as "updates"
const ALLOWED_PREFIX_RE = /^(feat|fix|update|perf|refactor)(\([^)]+\))?!?:\s*/i;

interface UpdateItem {
  id: string;
  category: "feature" | "fix" | "update" | "performance" | "refactor";
  title: string;
  description: string;
  date: string;
  url: string;
  author: string | null;
}

interface CachedPayload {
  items: UpdateItem[];
  source: "github";
  cached_at: string;
}

function classify(prefix: string): UpdateItem["category"] {
  const p = prefix.toLowerCase();
  if (p.startsWith("feat")) return "feature";
  if (p.startsWith("fix")) return "fix";
  if (p.startsWith("perf")) return "performance";
  if (p.startsWith("refactor")) return "refactor";
  return "update";
}

function cleanMessage(raw: string): { prefix: string; title: string; body: string } | null {
  const firstLine = raw.split("\n")[0].trim();
  const match = firstLine.match(ALLOWED_PREFIX_RE);
  if (!match) return null;
  const prefix = match[1];
  const title = firstLine.slice(match[0].length).trim();
  if (!title) return null;
  // Remove trailing co-author lines + signed-off lines from body
  const bodyLines = raw.split("\n").slice(1)
    .filter(l => !/^(co-authored-by|signed-off-by):/i.test(l.trim()))
    .join("\n").trim();
  return { prefix, title: title.charAt(0).toUpperCase() + title.slice(1), body: bodyLines };
}

async function fetchFromGitHub(token: string): Promise<UpdateItem[]> {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits?sha=${BRANCH}&per_page=50`;
  const res = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "studyhub-updates-fn",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text.slice(0, 200)}`);
  }
  const commits = await res.json() as Array<{
    sha: string;
    commit: { message: string; author: { name: string; date: string } };
    author: { login: string } | null;
    html_url: string;
  }>;

  const items: UpdateItem[] = [];
  for (const c of commits) {
    const cleaned = cleanMessage(c.commit.message);
    if (!cleaned) continue;
    items.push({
      id: c.sha,
      category: classify(cleaned.prefix),
      title: cleaned.title,
      description: cleaned.body || cleaned.title,
      date: c.commit.author.date,
      url: c.html_url,
      author: c.author?.login ?? c.commit.author.name ?? null,
    });
    if (items.length >= MAX_ITEMS) break;
  }
  return items;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const githubToken = Deno.env.get("GITHUB_TOKEN");

  const supabase = createClient(supabaseUrl, serviceKey);

  // Try cache first
  const { data: cached } = await supabase
    .from("cached_updates")
    .select("payload, fetched_at")
    .eq("id", CACHE_KEY)
    .maybeSingle();

  const url = new URL(req.url);
  const force = url.searchParams.get("refresh") === "1";
  const cacheAge = cached ? Date.now() - new Date(cached.fetched_at).getTime() : Infinity;
  const cacheValid = cached && cacheAge < CACHE_TTL_MS;

  if (cacheValid && !force) {
    return new Response(JSON.stringify({ ...(cached.payload as CachedPayload), from_cache: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!githubToken) {
    if (cached) {
      return new Response(JSON.stringify({ ...(cached.payload as CachedPayload), from_cache: true, stale: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "GITHUB_TOKEN not configured", items: [] }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const items = await fetchFromGitHub(githubToken);
    const payload: CachedPayload = { items, source: "github", cached_at: new Date().toISOString() };

    await supabase.from("cached_updates").upsert({
      id: CACHE_KEY,
      payload,
      fetched_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ ...payload, from_cache: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("GitHub fetch failed:", err);
    // Fallback to stale cache if available
    if (cached) {
      return new Response(JSON.stringify({
        ...(cached.payload as CachedPayload),
        from_cache: true,
        stale: true,
        error: String(err),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: String(err), items: [] }), {
      status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
