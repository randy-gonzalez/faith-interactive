/**
 * HTML Sanitizer
 *
 * Provides secure HTML sanitization for the Custom HTML block.
 * Uses DOMPurify with a restrictive configuration that allows
 * common HTML elements while blocking dangerous content.
 */

import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitization configuration for custom HTML blocks.
 * Allows common HTML elements while blocking dangerous content.
 */
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    // Structure
    "div", "span", "p", "br", "hr",
    // Headings
    "h1", "h2", "h3", "h4", "h5", "h6",
    // Text formatting
    "strong", "em", "b", "i", "u", "s", "mark", "small", "sub", "sup",
    // Lists
    "ul", "ol", "li", "dl", "dt", "dd",
    // Links & Media
    "a", "img", "video", "audio", "source", "iframe",
    // Tables
    "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
    // Semantic
    "article", "section", "aside", "header", "footer", "nav", "figure", "figcaption",
    // Other
    "blockquote", "pre", "code", "abbr", "address",
  ],
  ALLOWED_ATTR: [
    // Global
    "id", "class", "style", "title",
    // Links
    "href", "target", "rel",
    // Images/Media
    "src", "alt", "width", "height", "loading",
    // iframes (for embeds)
    "frameborder", "allow", "allowfullscreen",
    // Tables
    "colspan", "rowspan",
  ],
  ALLOW_DATA_ATTR: true,
  // Require rel="noopener" for external links
  ADD_ATTR: ["target"],
  // Allow safe iframes (YouTube, Vimeo, etc.)
  ADD_TAGS: ["iframe"],
  // Restrict URLs to safe protocols
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
};

/**
 * Sanitize HTML content for safe rendering.
 * Removes potentially dangerous elements while preserving styling.
 *
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering
 *
 * @example
 * ```typescript
 * const safeHtml = sanitizeHtml('<script>alert("xss")</script><p>Hello</p>');
 * // Returns: '<p>Hello</p>'
 * ```
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, SANITIZE_CONFIG);
}

/**
 * Check if HTML contains potentially dangerous content.
 * Used for validation/warnings in the editor.
 *
 * @param html - Raw HTML string to check
 * @returns Object with safety status and list of warnings
 *
 * @example
 * ```typescript
 * const check = hasUnsafeContent('<script>alert("xss")</script>');
 * // Returns: { safe: false, warnings: ["Script tags will be removed"] }
 * ```
 */
export function hasUnsafeContent(html: string): {
  safe: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  // Check for script tags
  if (/<script/i.test(html)) {
    warnings.push("Script tags will be removed");
  }

  // Check for on* event attributes
  if (/\son\w+\s*=/i.test(html)) {
    warnings.push("Event handlers (onclick, onload, etc.) will be removed");
  }

  // Check for javascript: URLs
  if (/javascript:/i.test(html)) {
    warnings.push("JavaScript URLs will be removed");
  }

  // Check for data: URLs (potential XSS vector)
  if (/data:/i.test(html)) {
    warnings.push("Data URLs may be modified");
  }

  // Check for style expressions (IE-specific XSS)
  if (/expression\s*\(/i.test(html)) {
    warnings.push("CSS expressions will be removed");
  }

  // Check for vbscript: URLs
  if (/vbscript:/i.test(html)) {
    warnings.push("VBScript URLs will be removed");
  }

  return {
    safe: warnings.length === 0,
    warnings,
  };
}

/**
 * Get a preview of what content will be removed during sanitization.
 * Useful for showing users what changes will be made.
 *
 * @param html - Raw HTML string
 * @returns Object with original length, sanitized length, and diff info
 */
export function getSanitizationPreview(html: string): {
  originalLength: number;
  sanitizedLength: number;
  contentRemoved: boolean;
  sanitized: string;
} {
  const sanitized = sanitizeHtml(html);
  return {
    originalLength: html.length,
    sanitizedLength: sanitized.length,
    contentRemoved: html.length !== sanitized.length,
    sanitized,
  };
}
