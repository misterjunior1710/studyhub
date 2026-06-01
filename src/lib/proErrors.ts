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
 * Detects edge-function responses that indicate the user needs StudyHub Pro
 * (either because they're not Pro or they've exceeded the free-tier daily cap).
 * Works with both supabase.functions.invoke errors and FunctionsHttpError shapes.
 */
export function isProRequiredError(err: unknown): boolean {
  if (!err) return false;
  // supabase.functions.invoke returns { error: FunctionsHttpError } where the
  // serialized body is on `context.body` (string). It also exposes `.status`.
  const anyErr = err as any;
  if (anyErr?.status === 402) return true;
  if (anyErr?.context?.status === 402) return true;
  if (anyErr?.code === "pro_required" || anyErr?.error === "pro_required") return true;
  if (anyErr?.message?.toString?.().toLowerCase?.().includes("pro_required")) return true;
  return false;
}

export async function parseProErrorBody(err: unknown): Promise<ProErrorPayload | null> {
  const anyErr = err as any;
  try {
    if (anyErr?.context?.body) {
      if (typeof anyErr.context.body === "string") {
        return JSON.parse(anyErr.context.body);
      }
      if (typeof anyErr.context.body?.text === "function") {
        const txt = await anyErr.context.body.text();
        return JSON.parse(txt);
      }
      return anyErr.context.body;
    }
  } catch {
    /* noop */
  }
  return null;
}

/**
 * Centralized handler: if the error is a Pro/quota error, show a polished toast
 * with an "Upgrade" action and return true. Otherwise return false so the caller
 * can keep their existing error handling.
 */
export async function handlePremiumError(
  err: unknown,
  opts?: { feature?: string; onUpgrade?: () => void },
): Promise<boolean> {
  if (!isProRequiredError(err)) return false;
  const body = await parseProErrorBody(err);
  const isCap = body?.code === "daily_limit_reached";
  const title = isCap ? "Daily free limit reached" : "StudyHub Pro feature";
  const description = isCap
    ? `${opts?.feature ? opts.feature + " — " : ""}You've used today's free allowance. Upgrade to Pro for unlimited access.`
    : `${opts?.feature ?? "This"} is part of StudyHub Pro. Upgrade to unlock it.`;

  // Fire a natural-moment dialog (throttled per 24h) for the limit case so
  // the user gets the bigger celebratory upsell once a day, plus a toast
  // every time so they can dismiss and keep working.
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(
        new CustomEvent("studyhub:premium-moment", {
          detail: isCap ? "nova_limit_reached" : "feature_locked",
        }),
      );
    } catch {
      /* ignore */
    }
  }

  toast.error(title, {
    description,
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

