import { toast } from "sonner";

interface ShareData {
  title: string;
  text?: string;
  url: string;
}

export const sharePost = async ({ title, text, url }: ShareData): Promise<boolean> => {
  // Use Web Share API if available (mobile-friendly)
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text: text || title,
        url,
      });
      return true;
    } catch (error) {
      // User cancelled or share failed
      if ((error as Error).name !== "AbortError") {
        console.error("Share failed:", error);
        // Fall through to clipboard fallback
      } else {
        // User cancelled, don't show error
        return false;
      }
    }
  }

  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
    return true;
  } catch (error) {
    // Last resort: use deprecated execCommand
    try {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success("Link copied to clipboard");
      return true;
    } catch (err) {
      toast.error("Failed to share. Please copy the URL manually.");
      return false;
    }
  }
};
