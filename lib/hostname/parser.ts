/**
 * Hostname Parser Utility
 *
 * Centralized hostname parsing for hostname-based routing.
 * Handles production and local development environments.
 *
 * @module lib/hostname/parser
 */

/**
 * App surface types - each surface has isolated routing, layouts, and styles
 */
export type AppSurface = "marketing" | "platform" | "admin" | "tenant";

/**
 * Result of parsing a hostname
 */
export interface ParsedHostname {
  surface: AppSurface;
  churchSlug: string | null;
  isLocal: boolean;
  originalHost: string;
}

/**
 * Configuration for hostname parsing
 */
export interface HostnameConfig {
  /** Production main domain (e.g., "faith-interactive.com") */
  productionDomain: string;
  /** Local development domain (e.g., "faith-interactive.local") */
  localDomain: string;
  /** Reserved subdomains that map to specific surfaces */
  reservedSubdomains: {
    platform: string;
    admin: string;
  };
}

/**
 * Default configuration - can be overridden for testing
 */
export const DEFAULT_HOSTNAME_CONFIG: HostnameConfig = {
  productionDomain: "faith-interactive.com",
  localDomain: "faith-interactive.local",
  reservedSubdomains: {
    platform: "platform",
    admin: "admin",
  },
};

/**
 * Check if a hostname is localhost-based (for simple local dev)
 */
export function isLocalhostHostname(hostname: string): boolean {
  const normalized = normalizeHostname(hostname);
  return normalized === "localhost" || normalized.endsWith(".localhost");
}

/**
 * Extract subdomain from localhost-based hostname
 * e.g., admin.localhost → "admin"
 */
export function extractLocalhostSubdomain(hostname: string): string | null {
  const normalized = normalizeHostname(hostname);
  if (normalized === "localhost") {
    return null;
  }
  if (normalized.endsWith(".localhost")) {
    const subdomain = normalized.replace(".localhost", "");
    if (subdomain && subdomain !== "www") {
      return subdomain;
    }
  }
  return null;
}

/**
 * Normalize a hostname by removing port and converting to lowercase
 */
export function normalizeHostname(hostname: string): string {
  return hostname.split(":")[0].toLowerCase();
}

/**
 * Check if a hostname is a local development hostname
 */
export function isLocalHostname(
  hostname: string,
  config: HostnameConfig = DEFAULT_HOSTNAME_CONFIG
): boolean {
  const normalized = normalizeHostname(hostname);
  return (
    normalized === config.localDomain ||
    normalized.endsWith(`.${config.localDomain}`)
  );
}

/**
 * Check if a hostname is a production hostname
 */
export function isProductionHostname(
  hostname: string,
  config: HostnameConfig = DEFAULT_HOSTNAME_CONFIG
): boolean {
  const normalized = normalizeHostname(hostname);
  return (
    normalized === config.productionDomain ||
    normalized === `www.${config.productionDomain}` ||
    normalized.endsWith(`.${config.productionDomain}`)
  );
}

/**
 * Check if a hostname might be a custom domain (not our main domain pattern)
 */
export function isCustomDomain(
  hostname: string,
  config: HostnameConfig = DEFAULT_HOSTNAME_CONFIG
): boolean {
  return (
    !isLocalHostname(hostname, config) &&
    !isProductionHostname(hostname, config) &&
    !isLocalhostHostname(hostname)
  );
}

/**
 * Extract subdomain from a hostname
 *
 * Examples:
 * - grace.faith-interactive.com → "grace"
 * - platform.faith-interactive.com → "platform"
 * - faith-interactive.com → null
 * - www.faith-interactive.com → null (www is ignored)
 * - grace.faith-interactive.local → "grace"
 */
export function extractSubdomain(
  hostname: string,
  config: HostnameConfig = DEFAULT_HOSTNAME_CONFIG
): string | null {
  const normalized = normalizeHostname(hostname);

  // Handle local development
  if (normalized.endsWith(`.${config.localDomain}`)) {
    const subdomain = normalized.replace(`.${config.localDomain}`, "");
    if (subdomain && subdomain !== "www") {
      return subdomain;
    }
    return null;
  }

  // Handle production
  if (normalized.endsWith(`.${config.productionDomain}`)) {
    const subdomain = normalized.replace(`.${config.productionDomain}`, "");
    if (subdomain && subdomain !== "www") {
      return subdomain;
    }
    return null;
  }

  // Handle apex domain
  if (
    normalized === config.localDomain ||
    normalized === config.productionDomain ||
    normalized === `www.${config.productionDomain}`
  ) {
    return null;
  }

  return null;
}

/**
 * Parse a hostname and determine the app surface and church slug
 *
 * Routing Map:
 *
 * Production:
 * - faith-interactive.com                              => marketing
 * - www.faith-interactive.com                          => marketing
 * - platform.faith-interactive.com                     => platform
 * - admin.faith-interactive.com                        => admin
 * - *.faith-interactive.com (other)                    => tenant (churchSlug = subdomain)
 *
 * Local (faith-interactive.local):
 * - faith-interactive.local                            => marketing
 * - platform.faith-interactive.local                   => platform
 * - admin.faith-interactive.local                      => admin
 * - *.faith-interactive.local (other)                  => tenant (churchSlug = subdomain)
 *
 * Local (localhost - simpler setup):
 * - localhost                                          => marketing
 * - platform.localhost                                 => platform
 * - admin.localhost                                    => admin
 * - *.localhost (other)                                => tenant (churchSlug = subdomain)
 *
 * Custom domains:
 * - Any other hostname                                 => tenant (slug resolved via DB)
 */
export function parseHostname(
  hostname: string,
  config: HostnameConfig = DEFAULT_HOSTNAME_CONFIG
): ParsedHostname {
  const isLocal = isLocalHostname(hostname, config) || isLocalhostHostname(hostname);

  // Check for custom domain first
  if (isCustomDomain(hostname, config)) {
    return {
      surface: "tenant",
      churchSlug: null, // Must be resolved via database lookup
      isLocal: false,
      originalHost: hostname,
    };
  }

  // Handle localhost-based hostnames (simpler local dev setup)
  if (isLocalhostHostname(hostname)) {
    const localhostSubdomain = extractLocalhostSubdomain(hostname);

    // No subdomain = marketing site
    if (!localhostSubdomain) {
      return {
        surface: "marketing",
        churchSlug: null,
        isLocal: true,
        originalHost: hostname,
      };
    }

    // Check for reserved subdomains
    if (localhostSubdomain === config.reservedSubdomains.platform) {
      return {
        surface: "platform",
        churchSlug: null,
        isLocal: true,
        originalHost: hostname,
      };
    }

    if (localhostSubdomain === config.reservedSubdomains.admin) {
      return {
        surface: "admin",
        churchSlug: null,
        isLocal: true,
        originalHost: hostname,
      };
    }

    // Any other subdomain = tenant site
    return {
      surface: "tenant",
      churchSlug: localhostSubdomain,
      isLocal: true,
      originalHost: hostname,
    };
  }

  // Extract subdomain for faith-interactive.local / faith-interactive.com
  const subdomain = extractSubdomain(hostname, config);

  // No subdomain = marketing site (apex domain)
  if (!subdomain) {
    return {
      surface: "marketing",
      churchSlug: null,
      isLocal,
      originalHost: hostname,
    };
  }

  // Check for reserved subdomains
  if (subdomain === config.reservedSubdomains.platform) {
    return {
      surface: "platform",
      churchSlug: null,
      isLocal,
      originalHost: hostname,
    };
  }

  if (subdomain === config.reservedSubdomains.admin) {
    return {
      surface: "admin",
      churchSlug: null, // Admin scopes to user's active church via session
      isLocal,
      originalHost: hostname,
    };
  }

  // Any other subdomain = tenant site
  return {
    surface: "tenant",
    churchSlug: subdomain,
    isLocal,
    originalHost: hostname,
  };
}

/**
 * Build a URL for a specific surface
 *
 * @param surface - The target surface
 * @param path - The path within that surface
 * @param churchSlug - Optional church slug for tenant surface
 * @param config - Hostname configuration
 * @param isLocal - Whether to use local or production domain
 * @param useLocalhost - Whether to use localhost instead of faith-interactive.local
 */
export function buildSurfaceUrl(
  surface: AppSurface,
  path: string,
  options: {
    churchSlug?: string;
    isLocal?: boolean;
    useLocalhost?: boolean;
    config?: HostnameConfig;
  } = {}
): string {
  const config = options.config || DEFAULT_HOSTNAME_CONFIG;
  const protocol = options.isLocal ? "http" : "https";
  const port = options.isLocal ? ":3000" : "";

  // Determine base domain
  let baseDomain: string;
  if (options.isLocal) {
    // Use localhost if explicitly requested or if useLocalhost is true
    baseDomain = options.useLocalhost ? "localhost" : config.localDomain;
  } else {
    baseDomain = config.productionDomain;
  }

  let hostname: string;

  switch (surface) {
    case "marketing":
      hostname = baseDomain;
      break;
    case "platform":
      hostname = `${config.reservedSubdomains.platform}.${baseDomain}`;
      break;
    case "admin":
      hostname = `${config.reservedSubdomains.admin}.${baseDomain}`;
      break;
    case "tenant":
      if (!options.churchSlug) {
        throw new Error("churchSlug is required for tenant surface");
      }
      hostname = `${options.churchSlug}.${baseDomain}`;
      break;
  }

  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${protocol}://${hostname}${port}${normalizedPath}`;
}

/**
 * Build a URL for a specific surface, auto-detecting localhost vs custom domain
 * based on current hostname
 */
export function buildSurfaceUrlFromCurrentHost(
  surface: AppSurface,
  path: string,
  currentHostname: string,
  options: {
    churchSlug?: string;
    config?: HostnameConfig;
  } = {}
): string {
  const isLocal = isLocalHostname(currentHostname, options.config) || isLocalhostHostname(currentHostname);
  const useLocalhost = isLocalhostHostname(currentHostname);

  return buildSurfaceUrl(surface, path, {
    ...options,
    isLocal,
    useLocalhost,
  });
}

/**
 * Get the route path prefix for a surface
 * Used for middleware rewrites
 *
 * Note: We use actual path prefixes (not route groups) because Next.js
 * route groups don't support overlapping routes across groups.
 * The middleware rewrites requests to these prefixes based on hostname.
 *
 * Path prefixes:
 * - /m = marketing
 * - /p = platform
 * - /a = admin
 * - /t = tenant
 */
export function getSurfaceRoutePrefix(surface: AppSurface): string {
  switch (surface) {
    case "marketing":
      return "/m";
    case "platform":
      return "/p";
    case "admin":
      return "/a";
    case "tenant":
      return "/t";
  }
}
