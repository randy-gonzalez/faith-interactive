/**
 * Hostname Parser Utility
 *
 * Simplified for marketing-only site.
 * All hostnames are treated as marketing surface.
 *
 * @module lib/hostname/parser
 */

/**
 * App surface type - only marketing
 */
export type AppSurface = "marketing";

/**
 * Result of parsing a hostname
 */
export interface ParsedHostname {
  surface: AppSurface;
  isLocal: boolean;
  originalHost: string;
}

/**
 * Normalize a hostname by removing port and converting to lowercase
 */
export function normalizeHostname(hostname: string): string {
  return hostname.split(":")[0].toLowerCase();
}

/**
 * Check if a hostname is localhost-based
 */
export function isLocalhostHostname(hostname: string): boolean {
  const normalized = normalizeHostname(hostname);
  return normalized === "localhost" || normalized.endsWith(".localhost");
}

/**
 * Parse a hostname - always returns marketing surface
 */
export function parseHostname(hostname: string): ParsedHostname {
  const normalized = normalizeHostname(hostname);
  const isLocal =
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized.endsWith(".local");

  return {
    surface: "marketing",
    isLocal,
    originalHost: hostname,
  };
}

/**
 * Get the route path prefix for a surface
 * Used for middleware rewrites
 */
export function getSurfaceRoutePrefix(_surface: AppSurface): string {
  return "/m";
}
