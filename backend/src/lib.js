// Foundation layer: pure, dependency-free helpers (no app/state coupling).
import sanitizeHtml from "sanitize-html";
import crypto from "node:crypto";

export const geminiErrorMessage = (err) => {
  const message = err?.message || "";
  if (err?.status === 429 || message.includes("RESOURCE_EXHAUSTED") || message.toLowerCase().includes("quota")) {
    return "Gemini API quota exceeded for the selected model. Check Google AI Studio billing/quota or set GEMINI_MODEL to a model with available quota.";
  }
  if (err?.status === 400) return "Gemini rejected the request. Please shorten or revise the prompt and try again.";
  if (err?.status === 403) return "Gemini API key is not authorized for this model or project.";
  return "Gemini failed to generate a response. Please try again.";
};

// Bound any provider call so a slow/hung upstream cannot pin a request open.
export const withTimeout = (promise, ms, label = "operation") => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s`)), ms)),
]);

export const timingSafeEqual = (a, b) => {
  const bufA = Buffer.from(String(a || ""));
  const bufB = Buffer.from(String(b || ""));
  if (bufA.length === 0 || bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

// ── Server-side HTML sanitizer ──
// Defense-in-depth for stored rich-text / AI chapter bodies that the client
// renders with dangerouslySetInnerHTML. Removes dangerous elements, inline
// event handlers, unsafe URL schemes, and style attributes.
export const sanitizeHtmlServer = (html = "") => sanitizeHtml(String(html), {
  allowedTags: [
    "p", "br", "strong", "b", "em", "i", "u", "s", "blockquote", "code", "pre",
    "h2", "h3", "h4", "ul", "ol", "li", "a", "table", "thead", "tbody", "tr",
    "th", "td", "hr", "span", "div"
  ],
  allowedAttributes: {
    a: ["href", "name", "target", "rel"],
    "*": ["class"]
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }, true),
  },
  disallowedTagsMode: "discard",
  enforceHtmlBoundary: true,
});

export const tokenize = (text = "") => new Set(String(text).toLowerCase().match(/[a-z0-9]+/g) || []);

export const parseGeminiJson = (text) => {
  const raw = String(text || "").trim();
  if (!raw) throw new Error("Gemini returned an empty response.");
  const withoutFence = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    return JSON.parse(withoutFence);
  } catch {
    const start = withoutFence.indexOf("{");
    const end = withoutFence.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(withoutFence.slice(start, end + 1));
    throw new Error("Gemini returned invalid JSON.");
  }
};
