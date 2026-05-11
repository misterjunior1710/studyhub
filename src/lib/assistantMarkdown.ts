import { sanitizeHtml } from "@/lib/sanitize";

// Lightweight markdown -> sanitized HTML: bold, italic, links, code, lists, headings, paragraphs.
// Keeps internal links as react-router-friendly anchors (handled by parent click delegate).
export function renderAssistantMarkdown(input: string): string {
  if (!input) return "";
  let s = input
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Code blocks ```lang\n...\n```
  s = s.replace(/```([\s\S]*?)```/g, (_m, code) =>
    `<pre><code>${code.trim()}</code></pre>`);
  // Inline code
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Headings
  s = s.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>")
       .replace(/^##\s+(.+)$/gm, "<h2>$1</h2>")
       .replace(/^#\s+(.+)$/gm, "<h2>$1</h2>");
  // Bold + italic
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
       .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  // Links [text](href)
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, href) => {
    const safe = String(href).replace(/"/g, "&quot;");
    const isInternal = safe.startsWith("/");
    const attrs = isInternal
      ? `href="${safe}" data-internal="1"`
      : `href="${safe}" target="_blank" rel="noopener noreferrer"`;
    return `<a ${attrs} class="text-primary underline underline-offset-2 hover:opacity-80">${text}</a>`;
  });
  // Lists: - item
  s = s.replace(/(^|\n)((?:- .+(?:\n|$))+)/g, (_m, p, block) => {
    const items = block.trim().split("\n").map((l: string) => `<li>${l.replace(/^- /, "")}</li>`).join("");
    return `${p}<ul>${items}</ul>`;
  });
  // Paragraphs (split by blank lines, skip already-block content)
  s = s.split(/\n{2,}/).map((para) => {
    if (/^<(h\d|ul|pre|ol|blockquote)/.test(para.trim())) return para;
    return `<p>${para.replace(/\n/g, "<br>")}</p>`;
  }).join("");

  return sanitizeHtml(s);
}
