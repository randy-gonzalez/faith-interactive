/**
 * Prisma Client Singleton
 *
 * Creates a single Prisma client instance for the application.
 * Uses Neon HTTP adapter for Cloudflare Workers compatibility.
 *
 * In development, we store it on the global object to prevent
 * multiple instances during hot reloading.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaNeonHTTP } from "@prisma/adapter-neon";

// Extend global type to include prisma
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Use Neon HTTP driver for Cloudflare Workers (no WebSockets needed)
  const connectionString = process.env.DATABASE_URL!;
  const adapter = new PrismaNeonHTTP(connectionString, {
    arrayMode: false,
    fullResults: true,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
  });
}

/**
 * Prisma client instance with Neon HTTP adapter.
 *
 * Works directly with your Neon PostgreSQL database on Cloudflare Workers.
 */
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Prevent multiple instances in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
