import sanitizeHtml from "sanitize-html";

// Article HTML comes from the browser, so it is cleaned on the server before saving.
export const cleanHtml = (html: string) =>
  sanitizeHtml(html, {
    allowedTags: ["p", "br", "strong", "em", "h2", "h3", "ul", "ol", "li", "blockquote", "a"],
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow", target: "_blank" }) },
  });

export const textOnly = (html: string) =>
  sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, " ").trim();
