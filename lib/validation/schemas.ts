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

// ==============================================================================
// SITE SETTINGS SCHEMAS
// ==============================================================================

/**
 * Navigation item schema (used in header/footer nav arrays)
 */
export const navItemSchema = z.object({
  pageId: z.string().min(1),
  label: z.string().min(1).max(50),
  order: z.number().int().min(0),
});

export type NavItem = z.infer<typeof navItemSchema>;

/**
 * Site settings validation
 */
export const siteSettingsSchema = z.object({
  // Header
  logoUrl: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  headerNavigation: z.array(navItemSchema).optional().default([]),

  // Footer
  footerText: z.string().max(500, "Footer text too long").optional().nullable(),
  footerNavigation: z.array(navItemSchema).optional().default([]),
  facebookUrl: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  instagramUrl: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  youtubeUrl: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),

  // Service info
  serviceTimes: z.string().max(1000, "Service times too long").optional().nullable(),
  address: z.string().max(500, "Address too long").optional().nullable(),
  phone: z.string().max(50, "Phone too long").optional().nullable(),
  contactEmail: z.string().email("Invalid email").optional().nullable().or(z.literal("")),

  // SEO
  metaTitle: z.string().max(60, "Meta title too long").optional().nullable(),
  metaDescription: z.string().max(160, "Meta description too long").optional().nullable(),
  faviconUrl: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),

  // Map
  mapEmbedUrl: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),

  // Home page
  homePageId: z.string().optional().nullable(),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

// ==============================================================================
// CONTACT FORM SCHEMAS
// ==============================================================================

/**
 * Contact form submission validation
 */
export const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().min(1, "Email is required").email("Invalid email").max(255, "Email too long"),
  message: z.string().min(1, "Message is required").max(5000, "Message too long"),
  // Honeypot field - should be empty if submitted by a human
  website: z.string().max(0, "Invalid submission").optional(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

// ==============================================================================
// PHASE 3: PRAYER REQUEST FORM
// ==============================================================================

/**
 * Prayer request form submission validation
 * Name and email are optional to allow anonymous requests.
 */
export const prayerRequestSchema = z.object({
  name: z.string().max(100, "Name too long").optional().nullable(),
  email: z.string().email("Invalid email").max(255, "Email too long").optional().nullable().or(z.literal("")),
  request: z.string().min(1, "Prayer request is required").max(5000, "Request too long"),
  // Honeypot field - should be empty if submitted by a human
  website: z.string().max(0, "Invalid submission").optional(),
});

export type PrayerRequestInput = z.infer<typeof prayerRequestSchema>;

// ==============================================================================
// PHASE 3: VOLUNTEER SIGNUP FORM
// ==============================================================================

/**
 * Volunteer signup form submission validation
 */
export const volunteerSignupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().min(1, "Email is required").email("Invalid email").max(255, "Email too long"),
  phone: z.string().max(20, "Phone number too long").optional().nullable(),
  interests: z.array(z.string().max(100)).max(20, "Too many interests").optional().default([]),
  message: z.string().max(2000, "Message too long").optional().nullable(),
  // Honeypot field - should be empty if submitted by a human
  website: z.string().max(0, "Invalid submission").optional(),
});

export type VolunteerSignupInput = z.infer<typeof volunteerSignupSchema>;

// ==============================================================================
// PHASE 3: MEDIA UPLOAD
// ==============================================================================

/**
 * Media alt text update validation
 */
export const mediaUpdateSchema = z.object({
  alt: z.string().max(500, "Alt text too long").optional().nullable(),
});

export type MediaUpdateInput = z.infer<typeof mediaUpdateSchema>;

// ==============================================================================
// EXTENDED SITE SETTINGS (PHASE 3)
// ==============================================================================

/**
 * Extended site settings with notification recipients and Phase 4 features
 */
export const siteSettingsExtendedSchema = siteSettingsSchema.extend({
  // Phase 3: Notification recipients (comma-separated emails)
  prayerNotifyEmails: z.string().max(500, "Too many emails").optional().nullable(),
  volunteerNotifyEmails: z.string().max(500, "Too many emails").optional().nullable(),
  // Phase 4: Maintenance mode
  maintenanceMode: z.boolean().optional().default(false),
});

export type SiteSettingsExtendedInput = z.infer<typeof siteSettingsExtendedSchema>;
