import DOMPurify from "dompurify";

// Enforce safe link attributes on every sanitize call to prevent tabnapping.
// Runs once at module load; DOMPurify hooks are global.
let hookInstalled = false;
const installLinkHook = () => {
  if (hookInstalled) return;
  // dompurify is typed loosely; guard in case it's not available (e.g. SSR)
  if (typeof DOMPurify.addHook !== "function") return;
  DOMPurify.addHook("afterSanitizeAttributes", (node: Element) => {
    if (node.tagName === "A") {
      const target = node.getAttribute("target");
      if (target === "_blank") {
        node.setAttribute("rel", "noopener noreferrer");
      } else if (node.hasAttribute("rel")) {
        // Strip any rel the author may have set without target=_blank
        const rel = node.getAttribute("rel") || "";
        if (!/\bnoopener\b/.test(rel) || !/\bnoreferrer\b/.test(rel)) {
          node.setAttribute("rel", "noopener noreferrer");
        }
      }
    }
  });
  hookInstalled = true;
};
installLinkHook();

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string
 */
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
      'img', 'span', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class', 'style'],
    ALLOW_DATA_ATTR: false,
  });
};
