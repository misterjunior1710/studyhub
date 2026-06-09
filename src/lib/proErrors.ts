import { toast } from "sonner";

export interface ProErrorPayload {
  error?: string;
  code?: string;
  message?: string;
  bucket?: string;
  limit?: number;
  upgrade_url?: string;
}

/**
 * Reads the JSON body from a supabase.functions.invoke error.
 * The SDK exposes the underlying Response on `err.context` — we clone and
 * parse it. Falls back gracefully when the body has already been consumed
 * or isn't JSON.
 */
export async function parseProErrorBody(err: unknown): Promise<ProErrorPayload | null> {
  const anyErr = err as any;
  const ctx = anyErr?.context;
  try {
    // Case 1: context is a Response (most common with supabase-js v2)
    if (ctx && typeof ctx === "object" && typeof ctx.clone === "function") {
      try {
        const cloned = ctx.clone();
        const txt = await cloned.text();
        if (txt) {
          try { return JSON.parse(txt) as ProErrorPayload; }
          catch { return { message: txt }; }
        }
      } catch { /* ignore */ }
    }
    // Case 2: pre-parsed shapes
    if (ctx?.body) {
      if (typeof ctx.body === "string") {
        try { return JSON.parse(ctx.body); } catch { return { message: ctx.body }; }
      }
      if (typeof ctx.body?.text === "function") {
        const txt = await ctx.body.text();
        try { return JSON.parse(txt); } catch { return { message: txt }; }
      }
      if (typeof ctx.body === "object") return ctx.body as ProErrorPayload;
    }
    // Case 3: error itself carries a JSON-ish message
    if (typeof anyErr?.message === "string") {
      const m = anyErr.message.trim();
      if (m.startsWith("{")) {
        try { return JSON.parse(m); } catch { /* ignore */ }
      }
    }
  } catch {
    /* noop */
  }
  return null;
}

/** Try to read the HTTP status code from any common error shape. */
function getStatus(err: unknown): number | null {
  const anyErr = err as any;
  return (
    anyErr?.status ??
    anyErr?.context?.status ??
    anyErr?.response?.status ??
    null
  );
}

export async function isProRequiredError(err: unknown): Promise<boolean> {
  if (!err) return false;
  if (getStatus(err) === 402) return true;
  const anyErr = err as any;
  if (anyErr?.code === "pro_required" || anyErr?.error === "pro_required") return true;
  if (anyErr?.message?.toString?.().toLowerCase?.().includes("pro_required")) return true;
  // Last resort: peek at the body
  const body = await parseProErrorBody(err);
  if (body?.error === "pro_required" || body?.code === "pro_required" || body?.code === "daily_limit_reached") return true;
  return false;
}

/** Map raw error shapes to a clear, user-friendly title + description. */
export function explainError(
  err: unknown,
  opts?: { feature?: string; defaultMessage?: string },
): { title: string; description: string } {
  const anyErr = err as any;
  const feature = opts?.feature ?? "This action";
  const status = getStatus(err);
  const raw = (anyErr?.message ?? "").toString();
  const lower = raw.toLowerCase();

  if (status === 401 || lower.includes("unauthorized") || lower.includes("jwt")) {
    return { title: "You're signed out", description: "Please sign in again to continue." };
  }
  if (status === 403) {
    return { title: "Not allowed", description: `${feature} isn't available on your account.` };
  }
  if (status === 404) {
    return { title: "Not found", description: `${feature} couldn't be reached. Try again shortly.` };
  }
  if (status === 408 || lower.includes("timeout") || lower.includes("timed out") || lower.includes("aborted")) {
    return {
      title: "Took too long to respond",
      description: `${feature} didn't respond in time. Check your connection and try again.`,
    };
  }
  if (status === 429 || lower.includes("rate limit")) {
    return {
      title: "Too many requests",
      description: "You're going a bit fast. Wait a few seconds, then try again.",
    };
  }
  if (status === 413 || lower.includes("payload too large")) {
    return { title: "Attachment too large", description: "Try a smaller file (under 8 MB)." };
  }
  if (lower.includes("failed to fetch") || lower.includes("networkerror") || lower.includes("network error")) {
    return {
      title: "Network problem",
      description: "We couldn't reach the server. Check your internet connection and try again.",
    };
  }
  if (status && status >= 500) {
    return {
      title: "Server hiccup",
      description: `${feature} is having trouble right now. Please try again in a moment.`,
    };
  }
  if (status && status >= 400) {
    return {
      title: "Couldn't complete that",
      description: raw || opts?.defaultMessage || `${feature} failed. Please try again.`,
    };
  }
  return {
    title: "Something went wrong",
    description: raw || opts?.defaultMessage || `${feature} failed. Please try again.`,
  };
}

/**
 * Centralized handler: if the error is a Pro/quota error, show a polished toast
 * with an "Upgrade" action and return true. Otherwise show a clear, meaningful
 * error toast and return true as well — so callers never need a generic fallback.
 */
export async function handlePremiumError(
  err: unknown,
  opts?: { feature?: string; onUpgrade?: () => void; defaultMessage?: string },
): Promise<boolean> {
  const body = await parseProErrorBody(err);
  const status = getStatus(err);
  const isProErr =
    status === 402 ||
    body?.error === "pro_required" ||
    body?.code === "pro_required" ||
    body?.code === "daily_limit_reached";

  if (isProErr) {
    const isCap = body?.code === "daily_limit_reached";
    const feature = opts?.feature ?? "This feature";
    const title = isCap ? "Daily free limit reached" : "StudyHub Pro feature";
    const description =
      body?.message ||
      (isCap
        ? `${feature} — you've used today's free allowance. Upgrade to Pro for unlimited access.`
        : `${feature} is part of StudyHub Pro. Upgrade to unlock it.`);

    if (typeof window !== "undefined") {
      try {
        window.dispatchEvent(
          new CustomEvent("studyhub:premium-moment", {
            detail: isCap ? "nova_limit_reached" : "feature_locked",
          }),
        );
      } catch { /* ignore */ }
    }

    toast.error(title, {
      description,
      duration: 7000,
      action: {
        label: "Upgrade",
        onClick: () => {
          if (opts?.onUpgrade) opts.onUpgrade();
          else window.location.href = "/pricing";
        },
      },
    });
    return true;
  }

  // Not a Pro error — still surface a meaningful message instead of a generic
  // "timeout" or empty toast. This makes the helper a one-stop error reporter
  // for callers (per project standard).
  const { title, description } = explainError(err, opts);
  toast.error(title, { description, duration: 6000 });
  return true;
}
