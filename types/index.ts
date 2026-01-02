/**
 * Faith Interactive - Type Definitions
 *
 * Central type definitions used across the application.
 * These types are designed to work with the Prisma schema.
 */

import type { UserRole, ContentStatus, PlatformRole, ChurchStatus } from "@prisma/client";

// Re-export Prisma enums for convenience
export type { UserRole, ContentStatus, PlatformRole, ChurchStatus } from "@prisma/client";

// ==============================================================================
// TENANT TYPES
// ==============================================================================

/**
 * Minimal church/tenant representation for context passing
 */
export interface TenantContext {
  id: string;
  slug: string;
  name: string;
}

// ==============================================================================
// USER TYPES
// ==============================================================================

/**
 * Safe user object without sensitive fields (for API responses)
 * Note: Role is now on ChurchMembership, but we include it here
 * for backward compatibility in API responses (represents active church role)
 */
export interface SafeUser {
  id: string;
  email: string;
  name: string | null;
  role?: UserRole; // From active church membership (optional for backward compat)
  platformRole: PlatformRole | null;
  isActive: boolean;
  createdAt: Date;
}

/**
 * Church membership - links a user to a church with a role
 */
export interface ChurchMembershipInfo {
  id: string;
  churchId: string;
  role: UserRole;
  isPrimary: boolean;
  isActive: boolean;
  church?: {
    id: string;
    slug: string;
    name: string;
  };
}

/**
 * User with active church context (for authenticated requests)
 * The role comes from the membership, not the user
 */
export interface AuthenticatedUser extends SafeUser {
  activeChurchId: string | null;
  activeChurch?: {
    id: string;
    slug: string;
    name: string;
  } | null;
  // Role in the active church (from membership or implicit for platform users)
  role: UserRole;
  // All memberships for church switching
  memberships?: ChurchMembershipInfo[];
  // Backward compatibility alias for activeChurchId
  // Use this when you need the current church context
  churchId: string;
}

/**
 * Platform user (for Super Admin panel)
 * Has platform role and may or may not have church context
 */
export interface PlatformUser extends SafeUser {
  platformRole: PlatformRole;
  activeChurchId: string | null;
  activeChurch?: {
    id: string;
    slug: string;
    name: string;
  } | null;
  role: UserRole; // Implicit ADMIN when accessing any church
  // Backward compatibility alias for activeChurchId
  churchId: string;
}

// ==============================================================================
// SESSION TYPES
// ==============================================================================

/**
 * Session data stored in database
 * Note: activeChurchId is nullable - platform users may have no active church
 */
export interface SessionData {
  id: string;
  userId: string;
  activeChurchId: string | null;
  expiresAt: Date;
}

// ==============================================================================
// AUTH TYPES
// ==============================================================================

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login response
 */
export interface LoginResponse {
  success: boolean;
  user?: SafeUser;
  error?: string;
}

/**
 * Password reset request payload
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Password reset completion payload
 */
export interface ResetPasswordRequest {
  token: string;
  password: string;
}

// ==============================================================================
// API RESPONSE TYPES
// ==============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Health check response
 * Phase 5: Enhanced with storage check
 */
export interface HealthCheckResponse {
  status: "ok" | "degraded" | "error";
  timestamp: string;
  database: "connected" | "disconnected";
  storage?: "ok" | "error" | "unknown";
  version: string;
  uptime?: number; // Seconds since process start
  checks?: {
    database: { status: "ok" | "error"; latencyMs?: number };
    storage?: { status: "ok" | "error" | "unknown"; message?: string };
  };
}

// ==============================================================================
// CONTENT TYPES
// ==============================================================================

/**
 * Base fields shared by all content types
 */
export interface ContentBase {
  id: string;
  churchId: string;
  status: ContentStatus;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Page content type
 */
export interface PageContent extends ContentBase {
  title: string;
  body: string;
  urlPath: string | null;
  featuredImageUrl: string | null;
}

/**
 * Sermon content type
 */
export interface SermonContent extends ContentBase {
  title: string;
  date: Date;
  speaker: string;
  videoUrl: string | null;
  notes: string | null;
}

/**
 * Event content type
 */
export interface EventContent extends ContentBase {
  title: string;
  startDateTime: Date;
  endDateTime: Date | null;
  location: string | null;
  description: string | null;
}

/**
 * Announcement content type
 */
export interface AnnouncementContent extends ContentBase {
  title: string;
  body: string;
  expiresAt: Date | null;
}

/**
 * Leadership profile content type
 */
export interface LeadershipContent extends ContentBase {
  name: string;
  jobTitle: string | null;
  bio: string | null;
  photoUrl: string | null;
  email: string | null;
  phone: string | null;
  sortOrder: number;
}

// ==============================================================================
// ENVIRONMENT TYPES
// ==============================================================================

/**
 * Environment variables (typed for safety)
 */
export interface EnvConfig {
  DATABASE_URL: string;
  JWT_SECRET: string;
  SESSION_DURATION_DAYS: number;
  PASSWORD_RESET_EXPIRATION_HOURS: number;
  NEXT_PUBLIC_APP_URL: string;
  NODE_ENV: "development" | "staging" | "production";
  RATE_LIMIT_MAX: number;
  RATE_LIMIT_WINDOW_SECONDS: number;
  LOG_LEVEL: "debug" | "info" | "warn" | "error";
}
