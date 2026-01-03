/**
 * Cookie Management
 *
 * Secure cookie handling for session tokens.
 *
 * HOSTNAME-BASED COOKIE SCOPING:
 * =============================
 * With hostname-based routing, we have separate subdomains:
 * - admin.faith-interactive.com   (church admin dashboard)
 * - platform.faith-interactive.com (Fi internal platform)
 * - *.faith-interactive.com       (tenant public sites)
 *
 * Cookie Strategy:
 * - Cookies are scoped to the specific subdomain (no Domain attribute)
 * - This means admin cookies are NOT shared with platform or tenant sites
 * - This provides HARD ISOLATION between surfaces
 *
 * Why NOT share cookies across subdomains:
 * 1. Security: Tenant sites could potentially read admin cookies if shared
 * 2. Isolation: Each surface has different auth requirements
 * 3. Simplicity: No complex cross-subdomain session management
 *
 * Login Flow:
 * - Users log in at admin.faith-interactive.com/login
 * - Session cookie is set for admin.faith-interactive.com only
 * - Platform users can access platform.faith-interactive.com after logging in
 *   (platform uses same cookie name but different subdomain = isolated)
 *
 * SECURITY CONSIDERATIONS:
 * - HttpOnly: Prevents JavaScript access (XSS mitigation)
 * - Secure: Only sent over HTTPS (in production)
 * - SameSite: CSRF protection
 * - Path: Limits cookie scope
 */

import { cookies } from "next/headers";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

// Cookie name for session token
export const SESSION_COOKIE_NAME = "fi_session";

/**
 * Check if we're in production environment
 */
function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Get session duration in seconds
 */
function getMaxAge(): number {
  const days = parseInt(process.env.SESSION_DURATION_DAYS || "7", 10);
  return days * 24 * 60 * 60; // Convert to seconds
}

/**
 * Get the cookie domain for cross-subdomain sharing.
 *
 * In development with localhost, we need to share cookies across subdomains
 * (admin.localhost, platform.localhost, etc.) for seamless login flow.
 *
 * In production, cookies are scoped to the specific subdomain for isolation.
 */
function getCookieDomain(): string | undefined {
  if (!isProduction()) {
    // In development, share cookies across *.localhost
    // This allows login on admin.localhost to work on platform.localhost
    return "localhost";
  }
  // In production, no domain = scoped to exact host only
  return undefined;
}

/**
 * Get cookie options for the session cookie.
 */
function getCookieOptions(): Partial<ResponseCookie> {
  const domain = getCookieDomain();
  return {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: getMaxAge(),
    ...(domain ? { domain } : {}),
  };
}

/**
 * Set the session cookie.
 *
 * @param token - Session token to store
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, getCookieOptions());
}

/**
 * Get the session token from cookies.
 *
 * @returns Session token if present, undefined otherwise
 */
export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

/**
 * Clear the session cookie (logout).
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Create a Set-Cookie header value for the session.
 * Useful for API routes that need to set cookies in the response.
 *
 * @param token - Session token
 * @returns Set-Cookie header value
 */
export function createSessionCookieHeader(token: string): string {
  const options = getCookieOptions();
  const parts = [
    `${SESSION_COOKIE_NAME}=${token}`,
    `Path=${options.path}`,
    `Max-Age=${options.maxAge}`,
    options.httpOnly ? "HttpOnly" : "",
    options.secure ? "Secure" : "",
    `SameSite=${options.sameSite}`,
    options.domain ? `Domain=${options.domain}` : "",
  ].filter(Boolean);

  return parts.join("; ");
}

/**
 * Create a Set-Cookie header value to clear the session.
 */
export function createClearSessionCookieHeader(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly`;
}
