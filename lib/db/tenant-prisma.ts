/**
 * Tenant-Scoped Prisma Client
 *
 * This module provides a Prisma client that automatically filters all queries
 * by the current tenant (church). This is the primary mechanism for ensuring
 * data isolation in the multi-tenant system.
 *
 * HOW IT WORKS:
 * - Uses Prisma Client Extensions to intercept all queries
 * - Automatically injects churchId into WHERE clauses
 * - Automatically sets churchId on CREATE operations
 * - Prevents accidental cross-tenant data access
 *
 * USAGE:
 * ```typescript
 * const db = getTenantPrisma(churchId);
 * const users = await db.user.findMany(); // Automatically filtered by churchId
 * ```
 */

import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

/**
 * Models that are tenant-scoped (have a churchId field)
 * The Church model itself is NOT tenant-scoped
 */
const TENANT_SCOPED_MODELS = [
  "User",
  "Session",
  "PasswordResetToken",
  "UserInvite",
  "Page",
  "Sermon",
  "Event",
  "Announcement",
  "LeadershipProfile",
  "ContactSubmission",
  // Phase 3: Media + Forms
  "Media",
  "PrayerRequest",
  "VolunteerSignup",
  // Phase 4: Domains & Launch Tools
  "CustomDomain",
  "RedirectRule",
  "LaunchChecklistItem",
  // Sermon-related entities
  "SermonSeries",
  "Speaker",
  "SermonTopic",
  "SermonTopicLink",
  // Events Enhancement
  "Venue",
  "EventRegistration",
  "NotificationSubscription",
] as const;
type TenantScopedModel = (typeof TENANT_SCOPED_MODELS)[number];

/**
 * Check if a model is tenant-scoped
 */
function isTenantScoped(model: string): model is TenantScopedModel {
  return TENANT_SCOPED_MODELS.includes(model as TenantScopedModel);
}

/**
 * Creates a tenant-scoped Prisma client.
 *
 * All queries through this client will automatically be filtered by churchId.
 * This is the recommended way to interact with tenant data.
 *
 * @param churchId - The ID of the church/tenant
 * @returns A Prisma client that automatically scopes all queries to the tenant
 *
 * @example
 * ```typescript
 * // In an API route or server component
 * const churchId = getTenantId(); // From request context
 * const db = getTenantPrisma(churchId);
 *
 * // All queries are automatically scoped
 * const users = await db.user.findMany();
 * // Equivalent to: SELECT * FROM users WHERE church_id = ?
 * ```
 */
export function getTenantPrisma(churchId: string) {
  return prisma.$extends({
    name: "tenant-isolation",
    query: {
      $allModels: {
        // Inject churchId filter into all read operations
        async findMany({ model, args, query }) {
          if (isTenantScoped(model)) {
            args.where = { ...args.where, churchId };
          }
          return query(args);
        },

        async findFirst({ model, args, query }) {
          if (isTenantScoped(model)) {
            args.where = { ...args.where, churchId };
          }
          return query(args);
        },

        async findUnique({ model, args, query }) {
          if (isTenantScoped(model)) {
            // For findUnique, we need to verify the result belongs to the tenant
            const result = await query(args);
            if (result && typeof result === "object" && "churchId" in result && result.churchId !== churchId) {
              return null; // Don't leak data from other tenants
            }
            return result;
          }
          return query(args);
        },

        async findFirstOrThrow({ model, args, query }) {
          if (isTenantScoped(model)) {
            args.where = { ...args.where, churchId };
          }
          return query(args);
        },

        async findUniqueOrThrow({ model, args, query }) {
          if (isTenantScoped(model)) {
            const result = await query(args);
            if (typeof result === "object" && result && "churchId" in result && result.churchId !== churchId) {
              throw new Prisma.PrismaClientKnownRequestError(
                "Record not found",
                { code: "P2025", clientVersion: "5.0.0" }
              );
            }
            return result;
          }
          return query(args);
        },

        // Inject churchId into create operations
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async create({ model, args, query }: { model: string; args: any; query: any }) {
          if (isTenantScoped(model)) {
            args.data = { ...args.data, churchId };
          }
          return query(args);
        },

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async createMany({ model, args, query }: { model: string; args: any; query: any }) {
          if (isTenantScoped(model)) {
            if (Array.isArray(args.data)) {
              args.data = args.data.map((item: Record<string, unknown>) => ({ ...item, churchId }));
            } else {
              args.data = { ...args.data, churchId };
            }
          }
          return query(args);
        },

        // Inject churchId filter into update operations
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async update({ model, args, query }: { model: string; args: any; query: any }) {
          if (isTenantScoped(model)) {
            args.where = { ...args.where, churchId };
          }
          return query(args);
        },

        async updateMany({ model, args, query }) {
          if (isTenantScoped(model)) {
            args.where = { ...args.where, churchId };
          }
          return query(args);
        },

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async upsert({ model, args, query }: { model: string; args: any; query: any }) {
          if (isTenantScoped(model)) {
            args.where = { ...args.where, churchId };
            args.create = { ...args.create, churchId };
          }
          return query(args);
        },

        // Inject churchId filter into delete operations
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async delete({ model, args, query }: { model: string; args: any; query: any }) {
          if (isTenantScoped(model)) {
            args.where = { ...args.where, churchId };
          }
          return query(args);
        },

        async deleteMany({ model, args, query }) {
          if (isTenantScoped(model)) {
            args.where = { ...args.where, churchId };
          }
          return query(args);
        },

        // Inject churchId filter into count operations
        async count({ model, args, query }) {
          if (isTenantScoped(model) && args) {
            args.where = { ...args.where, churchId };
          }
          return query(args);
        },

        // Inject churchId filter into aggregate operations
        async aggregate({ model, args, query }) {
          if (isTenantScoped(model)) {
            args.where = { ...args.where, churchId };
          }
          return query(args);
        },

        async groupBy({ model, args, query }) {
          if (isTenantScoped(model)) {
            args.where = { ...args.where, churchId };
          }
          return query(args);
        },
      },
    },
  });
}

/**
 * Type helper for the tenant-scoped Prisma client
 */
export type TenantPrismaClient = ReturnType<typeof getTenantPrisma>;
