/**
 * Prisma Client Singleton
 *
 * Creates a single Prisma client instance for the application.
 * In development, we store it on the global object to prevent
 * multiple instances during hot reloading.
 *
 * IMPORTANT: This is the raw Prisma client. For tenant-scoped queries,
 * use getTenantPrisma() from lib/db/tenant-prisma.ts instead.
 */

import { PrismaClient } from "@prisma/client";

// Extend global type to include prisma
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Raw Prisma client instance.
 *
 * Use this ONLY for:
 * - Church lookups (resolving tenant from subdomain)
 * - Database health checks
 * - Migrations and seeding
 *
 * For all other queries, use getTenantPrisma() to ensure tenant isolation.
 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development"
    ? ["query", "error", "warn"]
    : ["error"],
});

// Prevent multiple instances in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
