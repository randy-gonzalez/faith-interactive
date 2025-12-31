/**
 * Validation Schemas
 *
 * Zod schemas for validating API request payloads.
 * Centralized here for consistency and reuse.
 */

import { z } from "zod";

// ==============================================================================
// AUTH SCHEMAS
// ==============================================================================

/**
 * Login request validation
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(255, "Email too long"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password too long"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Forgot password request validation
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(255, "Email too long"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset password request validation
 */
export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(1, "Reset token is required")
    .max(255, "Invalid token"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long")
    // Require at least one number and one letter
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)/,
      "Password must contain at least one letter and one number"
    ),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ==============================================================================
// HELPER FUNCTIONS
// ==============================================================================

/**
 * Validate request body against a schema.
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data or throws ZodError
 *
 * @example
 * ```typescript
 * const body = await request.json();
 * const validated = validateInput(loginSchema, body);
 * // validated is typed as LoginInput
 * ```
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  return schema.parse(data);
}

/**
 * Safely validate request body, returning result object instead of throwing.
 *
 * @example
 * ```typescript
 * const result = safeValidateInput(loginSchema, body);
 * if (!result.success) {
 *   return Response.json({ error: result.error.message }, { status: 400 });
 * }
 * const { email, password } = result.data;
 * ```
 */
export function safeValidateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): z.SafeParseReturnType<unknown, T> {
  return schema.safeParse(data);
}

/**
 * Format Zod validation errors into a user-friendly message.
 */
export function formatZodError(error: z.ZodError): string {
  return error.errors
    .map((e) => `${e.path.join(".")}: ${e.message}`)
    .join(", ");
}

// ==============================================================================
// CONTENT SCHEMAS
// ==============================================================================

/**
 * Page content validation
 */
export const pageSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  body: z.string().min(1, "Content is required"),
  urlPath: z
    .string()
    .max(200, "URL path too long")
    .regex(/^[a-z0-9-]*$/, "URL path can only contain lowercase letters, numbers, and hyphens")
    .optional()
    .nullable(),
  featuredImageUrl: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
});

export type PageInput = z.infer<typeof pageSchema>;

/**
 * Sermon content validation
 */
export const sermonSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  date: z.string().min(1, "Date is required"),
  speaker: z.string().min(1, "Speaker is required").max(100, "Speaker name too long"),
  description: z.string().optional().nullable(),
  videoUrl: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  audioUrl: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  scripture: z.string().max(200, "Scripture reference too long").optional().nullable(),
});

export type SermonInput = z.infer<typeof sermonSchema>;

/**
 * Event content validation
 */
export const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  startDate: z.string().min(1, "Start date/time is required"),
  endDate: z.string().optional().nullable(),
  location: z.string().max(200, "Location too long").optional().nullable(),
  description: z.string().optional().nullable(),
  registrationUrl: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  featuredImageUrl: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
});

export type EventInput = z.infer<typeof eventSchema>;

/**
 * Announcement content validation
 */
export const announcementSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  body: z.string().min(1, "Content is required"),
  expiresAt: z.string().optional().nullable(),
});

export type AnnouncementInput = z.infer<typeof announcementSchema>;

/**
 * Leadership profile content validation
 */
export const leadershipProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  title: z.string().min(1, "Title/role is required").max(100, "Title too long"),
  bio: z.string().optional().nullable(),
  photoUrl: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  email: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
});

export type LeadershipProfileInput = z.infer<typeof leadershipProfileSchema>;

// Alias for backwards compatibility
export const leadershipSchema = leadershipProfileSchema;
export type LeadershipInput = LeadershipProfileInput;

/**
 * User invite validation (Admin only)
 */
export const inviteSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  role: z.enum(["ADMIN", "EDITOR", "VIEWER"]),
});

export type InviteInput = z.infer<typeof inviteSchema>;

// Alias for backwards compatibility
export const userInviteSchema = inviteSchema;
export type UserInviteInput = InviteInput;

/**
 * User role update validation (Admin only)
 */
export const userRoleUpdateSchema = z.object({
  role: z.enum(["ADMIN", "EDITOR", "VIEWER"]),
});

export type UserRoleUpdateInput = z.infer<typeof userRoleUpdateSchema>;
