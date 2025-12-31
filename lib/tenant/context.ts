/**
 * Tenant Context Utilities
 *
 * Provides utilities for accessing the current tenant (church) context
 * in server-side code. The tenant is extracted from the subdomain
 * by the middleware and passed via request headers.
 *
 * IMPORTANT: These functions only work in server-side contexts
 * (Server Components, API Routes, Middleware).
 */

import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { getTenantPrisma, type TenantPrismaClient } from "@/lib/db/tenant-prisma";
import type { TenantContext } from "@/types";

// Header names used to pass tenant context
export const TENANT_HEADER_ID = "x-church-id";
export const TENANT_HEADER_SLUG = "x-church-slug";
export const TENANT_HEADER_NAME = "x-church-name";

/**
 * Get the current tenant ID from request headers.
 *
 * @throws Error if no tenant context is available
 *
 * @example
 * ```typescript
 * // In a Server Component or API Route
 * const churchId = await getTenantId();
 * ```
 */
export async function getTenantId(): Promise<string> {
  const headerStore = await headers();
  const churchId = headerStore.get(TENANT_HEADER_ID);

  if (!churchId) {
    throw new Error(
      "No tenant context available. Ensure the request includes a valid subdomain."
    );
  }

  return churchId;
}

/**
 * Get the full tenant context from request headers.
 *
 * @throws Error if no tenant context is available
 */
export async function getTenantContext(): Promise<TenantContext> {
  const headerStore = await headers();
  const id = headerStore.get(TENANT_HEADER_ID);
  const slug = headerStore.get(TENANT_HEADER_SLUG);
  const name = headerStore.get(TENANT_HEADER_NAME);

  if (!id || !slug || !name) {
    throw new Error(
      "No tenant context available. Ensure the request includes a valid subdomain."
    );
  }

  return { id, slug, name };
}

/**
 * Get a tenant-scoped Prisma client for the current request.
 *
 * This is the recommended way to access the database in tenant-scoped
 * server-side code. All queries will automatically be filtered by
 * the current church.
 *
 * @throws Error if no tenant context is available
 *
 * @example
 * ```typescript
 * // In an API Route
 * const db = await getTenantDb();
 * const users = await db.user.findMany(); // Automatically filtered by church
 * ```
 */
export async function getTenantDb(): Promise<TenantPrismaClient> {
  const churchId = await getTenantId();
  return getTenantPrisma(churchId);
}

/**
 * Resolve a church from a subdomain slug.
 *
 * This is used by the middleware to look up the church from the URL.
 * It uses the raw Prisma client since we don't have tenant context yet.
 *
 * @param slug - The subdomain slug (e.g., "grace-community")
 * @returns The church if found, null otherwise
 */
export async function resolveChurchBySlug(slug: string): Promise<TenantContext | null> {
  const church = await prisma.church.findUnique({
    where: { slug },
    select: { id: true, slug: true, name: true },
  });

  return church;
}

/**
 * Check if a slug is reserved (cannot be used for church subdomains).
 *
 * Reserved slugs include system routes and common patterns that
 * should not be used as church subdomains.
 */
const RESERVED_SLUGS = [
  "www",
  "api",
  "app",
  "admin",
  "dashboard",
  "login",
  "register",
  "signup",
  "signin",
  "auth",
  "static",
  "assets",
  "public",
  "cdn",
  "mail",
  "email",
  "support",
  "help",
  "docs",
  "blog",
  "status",
  "health",
  // Add more as needed
];

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.toLowerCase());
}
