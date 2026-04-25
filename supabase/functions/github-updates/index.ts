import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const REPO_OWNER = "misterjunior1710";
const REPO_NAME = "studyhub";
const BRANCH = "main";
type UpdateMode = "newest" | "all";

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const NEWEST_ITEMS = 15;
const ALL_ITEMS_LIMIT = 1000;
const GITHUB_PAGE_SIZE = 100;

// Conventional-commit style prefixes we surface as "updates" (optional — fallback classifies by keywords)
const ALLOWED_PREFIX_RE = /^(feat|feature|fix|bugfix|update|updates|perf|performance|refactor|improve|improvement|add|new|chore|docs|style)(\([^)]+\))?!?:\s*/i;
// Skip noisy/auto-generated commits and generic titles in the Newest view only
const SKIP_RE = /^(merge |revert |wip\b|work in progress|changes?$|updates?$|initial commit|lovable|bot|automated|auto[- ]|x-lovable)/i;

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
  mode: UpdateMode;
}

function classify(text: string): UpdateItem["category"] {
  const p = text.toLowerCase();
  if (/^(feat|feature|add|new)\b/.test(p) || /\b(add(ed|s)?|new|introduce|implement)\b/.test(p)) return "feature";
  if (/^(fix|bugfix)\b/.test(p) || /\b(fix(ed|es)?|bug|resolve|patch)\b/.test(p)) return "fix";
  if (/^perf/.test(p) || /\b(perf|performance|optimi[sz]e|speed)\b/.test(p)) return "performance";
  if (/^refactor/.test(p) || /\b(refactor|cleanup|restructure)\b/.test(p)) return "refactor";
  return "update";
}

function cleanMessage(raw: string, skipNoisy: boolean): { title: string; body: string } | null {
  const firstLine = raw.split("\n")[0].trim();
  if (!firstLine || (skipNoisy && SKIP_RE.test(firstLine))) return null;

  // Strip conventional prefix if present (e.g. "feat: ", "fix(scope): ")
  let title = firstLine;
  const match = firstLine.match(ALLOWED_PREFIX_RE);
  if (match) title = firstLine.slice(match[0].length).trim();
  if (!title || title.length < 3) return null;

  const bodyLines = raw.split("\n").slice(1)
    .filter(l => !/^(co-authored-by|signed-off-by|x-lovable-edit-id):/i.test(l.trim()))
    .join("\n").trim();
  return { title: title.charAt(0).toUpperCase() + title.slice(1), body: bodyLines };
}

interface GitHubCommit {
  sha: string;
  commit: { message: string; author: { name: string; date: string } };
  author: { login: string } | null;
  html_url: string;
}

async function fetchFromGitHub(token: string, mode: UpdateMode): Promise<UpdateItem[]> {
  const itemLimit = mode === "all" ? ALL_ITEMS_LIMIT : NEWEST_ITEMS;
  const items: UpdateItem[] = [];

  for (let page = 1; items.length < itemLimit; page += 1) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits?sha=${BRANCH}&per_page=${GITHUB_PAGE_SIZE}&page=${page}`;
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

    const commits = await res.json() as GitHubCommit[];
    if (commits.length === 0) break;

    for (const c of commits) {
      const cleaned = cleanMessage(c.commit.message, mode === "newest");
      if (!cleaned) continue;
      items.push({
        id: c.sha,
        category: classify(cleaned.title),
        title: cleaned.title,
        description: cleaned.body || cleaned.title,
        date: c.commit.author.date,
        url: c.html_url,
        author: c.author?.login ?? c.commit.author.name ?? null,
      });
      if (items.length >= itemLimit) break;
    }

    if (commits.length < GITHUB_PAGE_SIZE || mode === "newest") break;
  }

  return items;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const githubToken = Deno.env.get("GITHUB_TOKEN");

  const supabase = createClient(supabaseUrl, serviceKey);

  const url = new URL(req.url);
  const requestBody = req.method === "POST"
    ? await req.json().catch(() => ({})) as { mode?: string; refresh?: boolean }
    : {};
  const mode: UpdateMode = requestBody.mode === "all" || url.searchParams.get("mode") === "all" ? "all" : "newest";
  const force = requestBody.refresh === true || url.searchParams.get("refresh") === "1";
  const cacheKey = `${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${mode}`;

  // Try cache first
  const { data: cached } = await supabase
    .from("cached_updates")
    .select("payload, fetched_at")
    .eq("id", cacheKey)
    .maybeSingle();

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
    const items = await fetchFromGitHub(githubToken, mode);
    const payload: CachedPayload = { items, source: "github", cached_at: new Date().toISOString(), mode };

    await supabase.from("cached_updates").upsert({
      id: cacheKey,
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
