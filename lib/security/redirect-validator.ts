/**
 * Redirect URL Validator
 *
 * Prevents open redirect vulnerabilities by validating destination URLs.
 *
 * Open redirects allow attackers to redirect users to malicious sites
 * using your domain as a trusted intermediary.
 *
 * ALLOWED:
 * - Relative paths starting with / (e.g., /about, /contact)
 * - Same-origin absolute URLs
 * - Explicitly allowed external domains (configurable)
 *
 * BLOCKED:
 * - Protocol-relative URLs (//evil.com)
 * - JavaScript URLs (javascript:)
 * - Data URLs (data:)
 * - External domains not in allowlist
 */

import { logger } from "@/lib/logging/logger";

/**
 * Configuration for redirect validation
 */
interface RedirectValidatorConfig {
  /** Allowed external domains (in addition to same-origin) */
  allowedDomains?: string[];
  /** Main domain for the application */
  mainDomain?: string;
}

// Default allowed domains (can be extended via environment)
const DEFAULT_ALLOWED_DOMAINS = [
  "faithinteractive.com",
  "www.faithinteractive.com",
];

// Parse additional allowed domains from environment
const ENV_ALLOWED_DOMAINS = process.env.REDIRECT_ALLOWED_DOMAINS
  ? process.env.REDIRECT_ALLOWED_DOMAINS.split(",").map((d) => d.trim().toLowerCase())
  : [];

/**
 * Result of validating a redirect URL
 */
export interface RedirectValidationResult {
  /** Whether the URL is safe to redirect to */
  valid: boolean;
  /** If invalid, the reason why */
  reason?: string;
  /** The validated/normalized URL */
  url?: string;
}

/**
 * Patterns that should never be allowed in redirect URLs
 */
const DANGEROUS_PATTERNS = [
  /^javascript:/i,
  /^data:/i,
  /^vbscript:/i,
  /^file:/i,
  // Block encoded variations
  /^j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/i,
  // Block backslash-based bypasses (browser quirks)
  /^[\/\\]{2}/,
];

/**
 * Validate a redirect destination URL
 *
 * @param url - The URL to validate
 * @param config - Optional configuration
 * @returns Validation result with reason if invalid
 */
export function validateRedirectUrl(
  url: string,
  config: RedirectValidatorConfig = {}
): RedirectValidationResult {
  const {
    allowedDomains = [...DEFAULT_ALLOWED_DOMAINS, ...ENV_ALLOWED_DOMAINS],
    mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || "faithinteractive.com",
  } = config;

  // Trim and normalize
  const normalizedUrl = url.trim();

  // Empty URL
  if (!normalizedUrl) {
    return { valid: false, reason: "URL is empty" };
  }

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(normalizedUrl)) {
      logger.warn("Blocked dangerous redirect URL pattern", {
        url: normalizedUrl.substring(0, 100),
      });
      return { valid: false, reason: "URL contains dangerous pattern" };
    }
  }

  // Protocol-relative URLs are dangerous (//evil.com)
  if (normalizedUrl.startsWith("//")) {
    return { valid: false, reason: "Protocol-relative URLs are not allowed" };
  }

  // Relative paths starting with / are always allowed
  if (normalizedUrl.startsWith("/")) {
    // But not // (protocol-relative)
    if (normalizedUrl.startsWith("//")) {
      return { valid: false, reason: "Protocol-relative URLs are not allowed" };
    }
    // Basic path validation - no newlines or control characters
    if (/[\x00-\x1F\x7F]/.test(normalizedUrl)) {
      return { valid: false, reason: "URL contains invalid characters" };
    }
    return { valid: true, url: normalizedUrl };
  }

  // For absolute URLs, parse and validate
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(normalizedUrl);
  } catch {
    return { valid: false, reason: "Invalid URL format" };
  }

  // Only allow http and https protocols
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return { valid: false, reason: `Protocol ${parsedUrl.protocol} is not allowed` };
  }

  // Check if the hostname is allowed
  const hostname = parsedUrl.hostname.toLowerCase();

  // Always allow the main domain and its subdomains
  if (
    hostname === mainDomain.toLowerCase() ||
    hostname.endsWith(`.${mainDomain.toLowerCase()}`)
  ) {
    return { valid: true, url: parsedUrl.toString() };
  }

  // Check explicitly allowed domains
  const isAllowed = allowedDomains.some((domain) => {
    const normalizedDomain = domain.toLowerCase();
    return (
      hostname === normalizedDomain ||
      hostname.endsWith(`.${normalizedDomain}`)
    );
  });

  if (isAllowed) {
    return { valid: true, url: parsedUrl.toString() };
  }

  // Not in allowlist
  logger.warn("Blocked redirect to external domain", {
    hostname,
    url: normalizedUrl.substring(0, 100),
  });
  return {
    valid: false,
    reason: `External domain ${hostname} is not allowed. Only relative paths or approved domains are permitted.`,
  };
}

/**
 * Check if a URL is a relative path
 */
export function isRelativePath(url: string): boolean {
  const trimmed = url.trim();
  return trimmed.startsWith("/") && !trimmed.startsWith("//");
}

/**
 * Check if a URL is an absolute URL
 */
export function isAbsoluteUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize a redirect URL by stripping dangerous content
 * Returns null if the URL cannot be made safe
 */
export function sanitizeRedirectUrl(url: string): string | null {
  const result = validateRedirectUrl(url);
  return result.valid ? result.url || null : null;
}
