import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type SharePlatform =
  | "whatsapp"
  | "twitter"
  | "facebook"
  | "telegram"
  | "reddit"
  | "instagram"
  | "copy"
  | "native";

export const buildShareUrl = (postId: string): string =>
  `https://studyhub.world/post/${postId}`;

export const buildShareMessage = (title: string): string =>
  `🔥 Found this on StudyHub:\n\n${title}\n\nJoin here: https://studyhub.world`;

export const getPlatformShareUrl = (
  platform: Exclude<SharePlatform, "instagram" | "copy" | "native">,
  text: string,
  url: string
): string => {
  const t = encodeURIComponent(text);
  const u = encodeURIComponent(url);
  switch (platform) {
    case "whatsapp":
      return `https://wa.me/?text=${t}%20${u}`;
    case "twitter":
      return `https://twitter.com/intent/tweet?text=${t}&url=${u}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    case "telegram":
      return `https://t.me/share/url?url=${u}&text=${t}`;
    case "reddit":
      return `https://www.reddit.com/submit?url=${u}&title=${t}`;
  }
};

// Cooldown to prevent spam (5s per post per session)
const shareCooldown = new Map<string, number>();
const COOLDOWN_MS = 5000;

export const incrementShareCount = async (postId: string): Promise<void> => {
  const last = shareCooldown.get(postId) ?? 0;
  const now = Date.now();
  if (now - last < COOLDOWN_MS) return;
  shareCooldown.set(postId, now);

  try {
    const { data, error: fetchErr } = await supabase
      .from("posts")
      .select("share_count")
      .eq("id", postId)
      .maybeSingle();
    if (fetchErr || !data) return;
    await supabase
      .from("posts")
      .update({ share_count: (data.share_count ?? 0) + 1 })
      .eq("id", postId);
  } catch (err) {
    console.error("Share count increment failed:", err);
  }
};

export const formatShareCount = (count: number): string => {
  if (count < 1000) return String(count);
  const k = count / 1000;
  if (k < 10) return `${k.toFixed(1).replace(/\.0$/, "")}K+`;
  return `${Math.floor(k)}K+`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
};

interface ShareData {
  postId: string;
  title: string;
  text?: string;
  url?: string;
}

export const sharePost = async ({ postId, title, text, url }: ShareData): Promise<boolean> => {
  const finalUrl = url ?? buildShareUrl(postId);
  const finalText = text ?? buildShareMessage(title);

  if (navigator.share) {
    try {
      await navigator.share({ title, text: finalText, url: finalUrl });
      await incrementShareCount(postId);
      return true;
    } catch (error) {
      if ((error as Error).name === "AbortError") return false;
    }
  }

  const ok = await copyToClipboard(finalUrl);
  if (ok) {
    toast.success("Link copied to clipboard");
    await incrementShareCount(postId);
    return true;
  }
  toast.error("Failed to share. Please copy the URL manually.");
  return false;
};

export const shareToPlatform = async (
  platform: SharePlatform,
  postId: string,
  title: string
): Promise<void> => {
  const url = buildShareUrl(postId);
  const text = buildShareMessage(title);

  if (platform === "instagram") {
    const ok = await copyToClipboard(url);
    if (ok) toast.success("Link copied! Paste it on Instagram.");
    else toast.error("Couldn't copy the link");
    await incrementShareCount(postId);
    return;
  }

  if (platform === "copy") {
    const ok = await copyToClipboard(url);
    if (ok) toast.success("Link copied to clipboard");
    else toast.error("Couldn't copy the link");
    await incrementShareCount(postId);
    return;
  }

  if (platform === "native") {
    await sharePost({ postId, title });
    return;
  }

  const shareUrl = getPlatformShareUrl(platform, text, url);
  window.open(shareUrl, "_blank", "noopener,noreferrer");
  await incrementShareCount(postId);
};
