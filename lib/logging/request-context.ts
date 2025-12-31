/**
 * Request Context
 *
 * Provides request-scoped context including:
 * - Request ID for correlation across logs
 * - Church/tenant context
 * - Route information
 *
 * Uses Node.js AsyncLocalStorage for context propagation within a request.
 *
 * USAGE:
 * ```typescript
 * import { requestContext, withRequestContext } from "@/lib/logging/request-context";
 *
 * // In middleware or route handler:
 * await withRequestContext({ requestId: "req_123" }, async () => {
 *   // All code in this callback has access to the context
 *   const ctx = requestContext.get();
 *   console.log(ctx?.requestId); // "req_123"
 * });
 * ```
 */

import { AsyncLocalStorage } from "async_hooks";
import { headers } from "next/headers";

// Request ID header name (also used by Cloudflare)
export const REQUEST_ID_HEADER = "x-request-id";

/**
 * Context data stored per request
 */
export interface RequestContextData {
  requestId: string;
  churchId?: string;
  churchSlug?: string;
  route?: string;
  method?: string;
  userAgent?: string;
  ip?: string;
  startTime?: number;
}

/**
 * AsyncLocalStorage for request context
 * This allows us to access the context anywhere in the call stack
 */
const asyncLocalStorage = new AsyncLocalStorage<RequestContextData>();

/**
 * Generate a unique request ID
 * Format: req_<timestamp>_<random>
 */
export function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `req_${timestamp}_${random}`;
}

/**
 * Request context utilities
 */
export const requestContext = {
  /**
   * Get the current request context (if available)
   */
  get(): RequestContextData | undefined {
    return asyncLocalStorage.getStore();
  },

  /**
   * Get the current request ID (or generate a fallback)
   * This is safe to call even outside of a request context
   */
  getRequestId(): string {
    const ctx = asyncLocalStorage.getStore();
    return ctx?.requestId || generateRequestId();
  },

  /**
   * Get context as a flat object suitable for logging
   */
  getLogMeta(): Record<string, string | undefined> {
    const ctx = asyncLocalStorage.getStore();
    if (!ctx) return {};

    return {
      requestId: ctx.requestId,
      churchId: ctx.churchId,
      churchSlug: ctx.churchSlug,
      route: ctx.route,
      method: ctx.method,
    };
  },
};

/**
 * Run a function with request context
 * All code within the callback can access the context via requestContext.get()
 */
export function withRequestContext<T>(
  context: RequestContextData,
  fn: () => T
): T {
  return asyncLocalStorage.run(context, fn);
}

/**
 * Get request ID from Next.js headers (for server components and route handlers)
 * Falls back to generating a new one if not present
 */
export async function getRequestIdFromHeaders(): Promise<string> {
  try {
    const headersList = await headers();
    const requestId = headersList.get(REQUEST_ID_HEADER);
    return requestId || generateRequestId();
  } catch {
    // headers() may throw if called outside of a request context
    return generateRequestId();
  }
}

/**
 * Get full request context from Next.js headers (for server components and route handlers)
 */
export async function getRequestContextFromHeaders(): Promise<RequestContextData> {
  try {
    const headersList = await headers();
    return {
      requestId: headersList.get(REQUEST_ID_HEADER) || generateRequestId(),
      churchId: headersList.get("x-church-id") || undefined,
      churchSlug: headersList.get("x-church-slug") || undefined,
      route: headersList.get("x-next-pathname") || undefined,
      method: headersList.get("x-next-method") || undefined,
      userAgent: headersList.get("user-agent") || undefined,
      ip: headersList.get("x-forwarded-for")?.split(",")[0].trim() ||
          headersList.get("cf-connecting-ip") ||
          headersList.get("x-real-ip") ||
          undefined,
    };
  } catch {
    // headers() may throw if called outside of a request context
    return {
      requestId: generateRequestId(),
    };
  }
}
