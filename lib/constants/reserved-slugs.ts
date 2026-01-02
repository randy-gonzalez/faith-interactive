/**
 * Reserved URL Slugs
 *
 * These slugs are reserved for built-in routes and cannot be used
 * as page URL paths. This prevents conflicts between dynamic pages
 * and fixed application routes.
 */

export const RESERVED_SLUGS = [
  // Public church routes
  "events",
  "sermons",
  "staff",
  "contact",
  "prayer",
  "volunteer",

  // Auth routes
  "login",
  "logout",
  "forgot-password",
  "reset-password",
  "accept-invite",
  "select-church",

  // System routes
  "admin",
  "api",
  "platform",

  // Legacy route (in case old links exist)
  "p",
] as const;

export type ReservedSlug = (typeof RESERVED_SLUGS)[number];

/**
 * Check if a slug is reserved
 */
export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.toLowerCase() as ReservedSlug);
}
