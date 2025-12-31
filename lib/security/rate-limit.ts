/**
 * Rate Limiting Foundation
 *
 * In-memory rate limiter using a sliding window algorithm.
 * This is a foundation implementation for Phase 0.
 *
 * LIMITATIONS (intentional for Phase 0):
 * - In-memory storage (resets on server restart)
 * - Not shared across server instances
 * - No persistence
 *
 * PRODUCTION UPGRADE PATH:
 * Replace the in-memory store with Redis for:
 * - Persistence across restarts
 * - Shared state across multiple server instances
 * - Better scalability
 *
 * Example Redis upgrade:
 * ```typescript
 * import { Redis } from "@upstash/redis";
 * const redis = new Redis({ url: process.env.UPSTASH_REDIS_URL, token: ... });
 * // Use redis.incr() and redis.expire() instead of Map
 * ```
 */

import { logger } from "@/lib/logging/logger";

interface RateLimitConfig {
  // Maximum requests allowed in the window
  max: number;
  // Window size in seconds
  windowSeconds: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store for rate limit tracking
// Key format: `${identifier}:${route}`
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup interval to prevent memory leaks (every 5 minutes)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

// Cleanup old entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt < now) {
        rateLimitStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);
}

/**
 * Get rate limit configuration from environment or use defaults
 */
function getConfig(): RateLimitConfig {
  return {
    max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
    windowSeconds: parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS || "60", 10),
  };
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  // Whether the request is allowed
  allowed: boolean;
  // Remaining requests in the current window
  remaining: number;
  // When the window resets (Unix timestamp in seconds)
  resetAt: number;
  // Total limit
  limit: number;
}

/**
 * Check and update rate limit for an identifier
 *
 * @param identifier - Unique identifier for the client (usually IP address)
 * @param route - Optional route identifier for per-route limits
 * @param config - Optional custom rate limit configuration
 * @returns Rate limit result
 *
 * @example
 * ```typescript
 * const result = checkRateLimit(clientIp, "/api/auth/login");
 * if (!result.allowed) {
 *   return new Response("Too Many Requests", { status: 429 });
 * }
 * ```
 */
export function checkRateLimit(
  identifier: string,
  route?: string,
  config?: Partial<RateLimitConfig>
): RateLimitResult {
  const { max, windowSeconds } = { ...getConfig(), ...config };
  const key = route ? `${identifier}:${route}` : identifier;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  const existing = rateLimitStore.get(key);

  // If no existing entry or window has expired, start fresh
  if (!existing || existing.resetAt < now) {
    const entry: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(key, entry);

    return {
      allowed: true,
      remaining: max - 1,
      resetAt: Math.floor(entry.resetAt / 1000),
      limit: max,
    };
  }

  // Increment count
  existing.count++;
  const allowed = existing.count <= max;
  const remaining = Math.max(0, max - existing.count);

  if (!allowed) {
    logger.warn("Rate limit exceeded", {
      identifier,
      route,
      count: existing.count,
      max,
    });
  }

  return {
    allowed,
    remaining,
    resetAt: Math.floor(existing.resetAt / 1000),
    limit: max,
  };
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.resetAt.toString(),
  };
}

/**
 * Reset rate limit for an identifier (useful for testing)
 */
export function resetRateLimit(identifier: string, route?: string): void {
  const key = route ? `${identifier}:${route}` : identifier;
  rateLimitStore.delete(key);
}

/**
 * Clear all rate limits (useful for testing)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}
