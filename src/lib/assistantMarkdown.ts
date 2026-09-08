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
  // Links [text](href)
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, href) => {
    const safe = String(href).replace(/"/g, "&quot;");
    const isInternal = safe.startsWith("/");
    const attrs = isInternal
      ? `href="${safe}" data-internal="1"`
      : `href="${safe}" target="_blank" rel="noopener noreferrer"`;
    return `<a ${attrs} class="text-primary underline underline-offset-2 hover:opacity-80">${text}</a>`;
  });

  // Normalise bullet markers: "* ", "+ ", "• ", "– " (with optional indent) -> "- "
  s = s.replace(/^[ \t]*[*+•–—][ \t]+/gm, "- ");

  // Unordered lists
  s = s.replace(/(^|\n)((?:- .+(?:\n|$))+)/g, (_m, p, block) => {
    const items = block.trim().split("\n").map((l: string) => `<li>${l.replace(/^- /, "")}</li>`).join("");
    return `${p}<ul>${items}</ul>`;
  });

  // Ordered lists: "1. item"
  s = s.replace(/(^|\n)((?:[ \t]*\d+[.)][ \t]+.+(?:\n|$))+)/g, (_m, p, block) => {
    const items = block.trim().split("\n")
      .map((l: string) => `<li>${l.replace(/^[ \t]*\d+[.)][ \t]+/, "")}</li>`).join("");
    return `${p}<ol>${items}</ol>`;
  });

  // Bold + italic (after lists so leading "*" bullets aren't mistaken for emphasis)
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
       .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");

  // Paragraphs (split by blank lines, skip already-block content)
  s = s.split(/\n{2,}/).map((para) => {
    const t = para.trim();
    if (!t) return "";
    if (/^<(h\d|ul|pre|ol|blockquote)/.test(t)) return t;
    // Split mixed blocks so lists never end up nested inside a paragraph.
    return t
      .split(/(<(?:ul|ol)>[\s\S]*?<\/(?:ul|ol)>)/g)
      .map((chunk) => {
        const c = chunk.trim().replace(/^(?:<br>)+|(?:<br>)+$/g, "");
        if (!c) return "";
        if (/^<(ul|ol)>/.test(c)) return c;
        return `<p>${c.replace(/\n/g, "<br>")}</p>`;
      })
      .join("");
  }).join("");


  return sanitizeHtml(s);
}
