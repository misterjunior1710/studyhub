import DOMPurify from "dompurify";

/**
 * Converts markdown-style formatting to HTML for chat messages
 * Supports: **bold**, _italic_, and newlines
 */
export function formatMessage(text: string): string {
  if (!text) return "";
  
  // Escape HTML first
  let formatted = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  
  // Convert markdown-style formatting
  // Bold: **text** or __text__
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  formatted = formatted.replace(/__(.+?)__/g, "<strong>$1</strong>");
  
  // Italic: _text_ or *text* (single)
  formatted = formatted.replace(/_(.+?)_/g, "<em>$1</em>");
  formatted = formatted.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");
  
  // Newlines to <br>
  formatted = formatted.replace(/\n/g, "<br>");
  
  // Sanitize the result
  return DOMPurify.sanitize(formatted, {
    ALLOWED_TAGS: ["strong", "em", "br"],
    ALLOWED_ATTR: [],
  });
}

/**
 * Check if a message contains any formatting
 */
export function hasFormatting(text: string): boolean {
  return /\*\*.*\*\*|__.*__|_.*_|\*[^*]+\*/.test(text);
}
