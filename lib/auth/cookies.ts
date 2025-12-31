/**
 * Cookie Management
 *
 * Secure cookie handling for session tokens.
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
 * Get cookie options for the session cookie.
 */
function getCookieOptions(): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: getMaxAge(),
    // In production, you might want to set domain for cross-subdomain cookies
    // domain: isProduction() ? ".faithinteractive.com" : undefined,
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
  ].filter(Boolean);

  return parts.join("; ");
}

/**
 * Create a Set-Cookie header value to clear the session.
 */
export function createClearSessionCookieHeader(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly`;
}
