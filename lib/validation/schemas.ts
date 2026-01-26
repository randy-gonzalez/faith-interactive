/**
 * Validation Schemas
 *
 * Zod schemas for validating API request payloads.
 * Centralized here for consistency and reuse.
 */

import { z } from "zod";

// ==============================================================================
// CUSTOM VALIDATORS
// ==============================================================================

/**
 * URL or path validator
 * Accepts either a full URL (http/https) or a relative path starting with /
 * This is needed because local storage returns paths like /uploads/...
 */
const urlOrPath = z.string().refine(
  (val) => {
    if (!val || val === "") return true; // Allow empty strings
    // Accept full URLs or paths starting with /
    return val.startsWith("/") || val.startsWith("http://") || val.startsWith("https://");
  },
  { message: "Must be a valid URL or path" }
).optional().nullable().or(z.literal(""));

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
 * Block background schema
 */
export const blockBackgroundSchema = z.object({
  type: z.enum(["color", "gradient", "image", "video"]),
  color: z.string().optional(),
  gradient: z.string().optional(),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  overlay: z.string().optional(),
  textTheme: z.enum(["light", "dark", "auto"]).optional(),
});

/**
 * Block schema for page content
 */
export const blockSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  order: z.number().int().min(0),
  data: z.record(z.unknown()),
  background: blockBackgroundSchema.optional(),
});

export type BlockInput = z.infer<typeof blockSchema>;

/**
 * Page content validation
 */
export const pageSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  blocks: z.array(blockSchema).optional().default([]),
  urlPath: z
    .string()
    .max(200, "URL path too long")
    .regex(/^[a-z0-9-]*$/, "URL path can only contain lowercase letters, numbers, and hyphens")
    .optional()
    .nullable(),
  featuredImageUrl: urlOrPath,
  // Parent page for nesting
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().int().min(0).optional().default(0),
  // SEO fields
  metaTitle: z.string().max(200, "Meta title too long").optional().nullable(),
  metaDescription: z.string().max(500, "Meta description too long").optional().nullable(),
  metaKeywords: z.string().max(500, "Meta keywords too long").optional().nullable(),
  ogImage: urlOrPath,
  noIndex: z.boolean().optional().default(false),
  // Homepage designation
  isHomePage: z.boolean().optional().default(false),
  // Status - for updating publish state
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

export type PageInput = z.infer<typeof pageSchema>;

/**
 * Marketing page content validation
 */
export const marketingPageSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug too long")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .transform((s) => s.toLowerCase()),
  blocks: z.array(blockSchema).optional().default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional().default("DRAFT"),
  // Parent page for nesting
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().int().min(0).optional().default(0),
  // SEO fields
  metaTitle: z.string().max(200, "Meta title too long").optional().nullable(),
  metaDescription: z.string().max(500, "Meta description too long").optional().nullable(),
  metaKeywords: z.string().max(500, "Meta keywords too long").optional().nullable(),
  ogImage: urlOrPath,
  noIndex: z.boolean().optional().default(false),
});

export type MarketingPageInput = z.infer<typeof marketingPageSchema>;

/**
 * Sermon content validation (basic - for backward compatibility)
 */
export const sermonSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  date: z.string().min(1, "Date is required"),
  // Speaker - supports both ID and custom name
  speakerId: z.string().optional().nullable(),
  speakerName: z.string().max(100, "Speaker name too long").optional().nullable(),
  // Series
  seriesId: z.string().optional().nullable(),
  seriesOrder: z.number().int().min(1).optional().nullable(),
  // Scripture
  scripture: z.string().max(200, "Scripture reference too long").optional().nullable(),
  scriptureReferences: z.array(z.object({
    id: z.string().optional(),
    bookId: z.string().min(1),
    startChapter: z.number().int().min(1),
    startVerse: z.number().int().min(1).optional().nullable(),
    endChapter: z.number().int().min(1).optional().nullable(),
    endVerse: z.number().int().min(1).optional().nullable(),
  })).optional().default([]),
  // Content
  description: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  // Media
  videoUrl: urlOrPath,
  audioUrl: urlOrPath,
  artworkUrl: urlOrPath,
  // Topics
  topicIds: z.array(z.string()).optional().default([]),
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
  registrationUrl: urlOrPath,
  featuredImageUrl: urlOrPath,
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
  photoUrl: urlOrPath,
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
  logoUrl: urlOrPath,
  headerNavigation: z.array(navItemSchema).optional().default([]),

  // Footer
  footerText: z.string().max(500, "Footer text too long").optional().nullable(),
  footerNavigation: z.array(navItemSchema).optional().default([]),
  facebookUrl: urlOrPath,
  instagramUrl: urlOrPath,
  youtubeUrl: urlOrPath,

  // Service info
  serviceTimes: z.string().max(1000, "Service times too long").optional().nullable(),
  address: z.string().max(500, "Address too long").optional().nullable(),
  phone: z.string().max(50, "Phone too long").optional().nullable(),
  contactEmail: z.string().email("Invalid email").optional().nullable().or(z.literal("")),

  // SEO
  metaTitle: z.string().max(60, "Meta title too long").optional().nullable(),
  metaDescription: z.string().max(160, "Meta description too long").optional().nullable(),
  faviconUrl: urlOrPath,

  // Map
  mapEmbedUrl: urlOrPath,

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

// ==============================================================================
// SERMON SYSTEM SCHEMAS
// ==============================================================================

/**
 * Sermon series validation
 */
export const sermonSeriesSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  description: z.string().max(5000, "Description too long").optional().nullable(),
  artworkUrl: urlOrPath,
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  sortOrder: z.number().int().min(0).optional().default(0),
});

export type SermonSeriesInput = z.infer<typeof sermonSeriesSchema>;

/**
 * Speaker profile validation
 */
export const speakerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  title: z.string().max(100, "Title too long").optional().nullable(),
  bio: z.string().max(5000, "Bio too long").optional().nullable(),
  photoUrl: urlOrPath,
  email: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  sortOrder: z.number().int().min(0).optional().default(0),
  isGuest: z.boolean().optional().default(false),
});

export type SpeakerInput = z.infer<typeof speakerSchema>;

/**
 * Sermon topic validation
 */
export const sermonTopicSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug too long")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().max(500, "Description too long").optional().nullable(),
});

export type SermonTopicInput = z.infer<typeof sermonTopicSchema>;

/**
 * Scripture reference validation (used in sermon form)
 */
export const scriptureReferenceSchema = z.object({
  bookId: z.string().min(1, "Book is required"),
  startChapter: z.number().int().min(1, "Chapter is required"),
  startVerse: z.number().int().min(1).optional().nullable(),
  endChapter: z.number().int().min(1).optional().nullable(),
  endVerse: z.number().int().min(1).optional().nullable(),
});

export type ScriptureReferenceInput = z.infer<typeof scriptureReferenceSchema>;

/**
 * Extended sermon schema with new fields
 */
export const sermonExtendedSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  date: z.string().min(1, "Date is required"),
  // Speaker - supports both legacy string and new ID
  speakerId: z.string().optional().nullable(),
  speakerName: z.string().max(100, "Speaker name too long").optional().nullable(),
  // Series
  seriesId: z.string().optional().nullable(),
  seriesOrder: z.number().int().min(1).optional().nullable(),
  // Scripture
  scripture: z.string().max(200, "Scripture reference too long").optional().nullable(),
  scriptureReferences: z.array(scriptureReferenceSchema).optional().default([]),
  // Content
  description: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  // Media
  videoUrl: urlOrPath,
  audioUrl: urlOrPath,
  artworkUrl: urlOrPath,
  // Topics
  topicIds: z.array(z.string()).optional().default([]),
});

export type SermonExtendedInput = z.infer<typeof sermonExtendedSchema>;

// ==============================================================================
// EVENTS ENHANCEMENT SCHEMAS
// ==============================================================================

/**
 * Venue validation
 */
export const venueSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  address: z.string().max(500, "Address too long").optional().nullable(),
  city: z.string().max(100, "City too long").optional().nullable(),
  state: z.string().max(100, "State too long").optional().nullable(),
  zipCode: z.string().max(20, "Zip code too long").optional().nullable(),
  capacity: z.number().int().min(1, "Capacity must be at least 1").optional().nullable(),
  notes: z.string().max(5000, "Notes too long").optional().nullable(),
  sortOrder: z.number().int().min(0).optional().default(0),
});

export type VenueInput = z.infer<typeof venueSchema>;

/**
 * Event registration validation (public form)
 */
export const eventRegistrationSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email").max(255, "Email too long"),
  firstName: z.string().min(1, "First name is required").max(100, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(100, "Last name too long"),
  phone: z.string().max(20, "Phone number too long").optional().nullable(),
  additionalAttendees: z.number().int().min(0).max(20, "Maximum 20 additional attendees").optional().default(0),
  reminderOptIn: z.boolean().optional().default(true),
  occurrenceDate: z.string().datetime().optional().nullable(),
  // Honeypot field - should be empty if submitted by a human
  website: z.string().max(0, "Invalid submission").optional(),
});

export type EventRegistrationInput = z.infer<typeof eventRegistrationSchema>;

/**
 * Extended event schema with venues, registration, and recurrence
 */
export const eventExtendedSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  startDate: z.string().min(1, "Start date/time is required"),
  endDate: z.string().optional().nullable(),
  // Venue - can use venueId or location text (or both)
  venueId: z.string().optional().nullable(),
  location: z.string().max(200, "Location too long").optional().nullable(),
  description: z.string().optional().nullable(),
  // Legacy external registration (still supported)
  registrationUrl: urlOrPath,
  // Featured image - URL or media library reference
  featuredImageUrl: urlOrPath,
  featuredMediaId: z.string().optional().nullable(),
  // Built-in registration settings
  registrationEnabled: z.boolean().optional().default(false),
  capacity: z.number().int().min(1, "Capacity must be at least 1").optional().nullable(),
  waitlistEnabled: z.boolean().optional().default(false),
  registrationDeadline: z.string().datetime().optional().nullable(),
  // Recurrence
  isRecurring: z.boolean().optional().default(false),
  recurrenceFrequency: z.enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "YEARLY"]).optional().nullable(),
  recurrenceInterval: z.number().int().min(1).optional().nullable(),
  recurrenceDaysOfWeek: z.number().int().min(0).max(127).optional().nullable(),
  recurrenceDayOfMonth: z.number().int().min(-1).max(31).optional().nullable(),
  recurrenceEndDate: z.string().datetime().optional().nullable(),
  recurrenceCount: z.number().int().min(1).optional().nullable(),
  timezone: z.string().max(50).optional().default("America/New_York"),
});

export type EventExtendedInput = z.infer<typeof eventExtendedSchema>;

/**
 * Admin registration update schema
 */
export const registrationUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Valid email is required").max(255),
  phone: z.string().max(50).optional().nullable(),
  additionalAttendees: z.number().int().min(0).max(20).optional(),
  reminderOptIn: z.boolean().optional(),
});

export type RegistrationUpdateInput = z.infer<typeof registrationUpdateSchema>;

// ==============================================================================
// TEMPLATE SETTINGS SCHEMAS
// ==============================================================================

/**
 * Extended navigation item with external URLs and children support
 */
export const navLinkExtendedSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(50),
  href: z.string().min(1).max(500),
  isExternal: z.boolean().default(false),
  order: z.number().int().min(0),
  pageId: z.string().optional().nullable(),
  children: z.array(z.object({
    id: z.string().min(1),
    label: z.string().min(1).max(50),
    href: z.string().min(1).max(500),
    isExternal: z.boolean().default(false),
    order: z.number().int().min(0),
  })).optional().default([]),
});

export type NavLinkExtendedInput = z.infer<typeof navLinkExtendedSchema>;

/**
 * Header CTA button configuration
 */
export const headerCtaButtonSchema = z.object({
  show: z.boolean().default(true),
  label: z.string().min(1).max(50).default("Contact Us"),
  href: z.string().min(1).max(500).default("/contact"),
  isExternal: z.boolean().default(false),
  style: z.enum(["primary", "secondary", "outline"]).default("primary"),
});

/**
 * Header configuration schema
 */
export const headerConfigSchema = z.object({
  logoPosition: z.enum(["left", "center"]).default("left"),
  navAlignment: z.enum(["left", "center", "right"]).default("right"),
  showNavigation: z.boolean().default(true),
  sticky: z.boolean().default(true),
  background: z.enum(["solid", "transparent", "blur"]).default("solid"),
  backgroundColor: z.string().optional().nullable(),
  ctaButton: headerCtaButtonSchema.default({}),
  mobileBreakpoint: z.number().int().min(320).max(1200).default(768),
  mobileMenuStyle: z.enum(["slide", "dropdown", "fullscreen"]).default("slide"),
  mobileLogoUrl: urlOrPath,
  showCtaOnMobile: z.boolean().default(true),
  mobileMenuBgColor: z.string().optional().nullable(),
});

export type HeaderConfigInput = z.infer<typeof headerConfigSchema>;

/**
 * Footer configuration schema
 */
export const footerConfigSchema = z.object({
  showChurchInfo: z.boolean().default(true),
  showServiceTimes: z.boolean().default(true),
  showContactInfo: z.boolean().default(true),
  showQuickLinks: z.boolean().default(true),
  showSocialIcons: z.boolean().default(true),
  backgroundColor: z.string().optional().nullable(),
  backgroundImage: urlOrPath,
  socialIconStyle: z.enum(["filled", "outline", "monochrome"]).default("filled"),
  customCopyrightText: z.string().max(500).optional().nullable(),
  columnOrder: z.array(z.enum(["info", "contact", "links", "social"])).default(["info", "contact", "links", "social"]),
});

export type FooterConfigInput = z.infer<typeof footerConfigSchema>;

/**
 * Template settings validation (for dedicated template settings route)
 */
export const templateSettingsSchema = z.object({
  headerTemplate: z.enum(["classic", "centered", "minimal", "split", "transparent", "boxed", "full-width", "double-row"]).default("classic"),
  headerConfig: headerConfigSchema.optional().nullable(),
  footerTemplate: z.enum(["4-column", "3-column", "2-column", "stacked", "minimal"]).default("4-column"),
  footerConfig: footerConfigSchema.optional().nullable(),
  // Extended navigation arrays
  headerNavigation: z.array(navLinkExtendedSchema).optional().default([]),
  footerNavigation: z.array(navLinkExtendedSchema).optional().default([]),
});

export type TemplateSettingsInput = z.infer<typeof templateSettingsSchema>;

// ==============================================================================
// GLOBAL BLOCKS SCHEMA
// ==============================================================================

/**
 * Global block validation
 * Used for creating and updating reusable blocks
 */
export const globalBlockSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional().nullable(),
  blockContent: z.object({
    type: z.string().min(1, "Block type is required"),
    data: z.record(z.unknown()),
    background: blockBackgroundSchema.optional(),
    advanced: z.object({
      cssClasses: z.string().optional(),
      elementId: z.string().optional(),
      ariaLabel: z.string().optional(),
      dataAttributes: z.string().optional(),
    }).optional(),
  }),
});

export type GlobalBlockInput = z.infer<typeof globalBlockSchema>;

// ==============================================================================
// MARKETING BLOG SCHEMAS
// ==============================================================================

/**
 * Blog category validation
 */
export const blogCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug too long")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .transform((s) => s.toLowerCase()),
  description: z.string().max(500, "Description too long").optional().nullable(),
  sortOrder: z.number().int().min(0).optional().default(0),
});

export type BlogCategoryInput = z.infer<typeof blogCategorySchema>;

/**
 * Blog tag validation
 */
export const blogTagSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50, "Slug too long")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .transform((s) => s.toLowerCase()),
});

export type BlogTagInput = z.infer<typeof blogTagSchema>;

/**
 * Blog post validation
 */
export const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug too long")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .transform((s) => s.toLowerCase()),
  excerpt: z.string().max(500, "Excerpt too long").optional().nullable(),
  blocks: z.array(blockSchema).optional().default([]),
  featuredImage: urlOrPath,
  categoryId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).optional().default([]),
  authorName: z.string().max(100, "Author name too long").optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional().default("DRAFT"),
  // SEO fields
  metaTitle: z.string().max(200, "Meta title too long").optional().nullable(),
  metaDescription: z.string().max(500, "Meta description too long").optional().nullable(),
  ogImage: urlOrPath,
  noIndex: z.boolean().optional().default(false),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;

// ==============================================================================
// MARKETING CASE STUDY SCHEMAS
// ==============================================================================

/**
 * Case study validation
 */
export const caseStudySchema = z.object({
  churchName: z.string().min(1, "Church name is required").max(200, "Church name too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug too long")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .transform((s) => s.toLowerCase()),
  logo: urlOrPath,
  description: z.string().min(1, "Description is required"),
  images: z.array(z.string()).optional().default([]),
  beforeImage: urlOrPath,
  afterImage: urlOrPath,
  testimonialQuote: z.string().max(1000, "Testimonial too long").optional().nullable(),
  testimonialName: z.string().max(100, "Name too long").optional().nullable(),
  testimonialTitle: z.string().max(100, "Title too long").optional().nullable(),
  metrics: z.record(z.string()).optional().nullable(),
  liveSiteUrl: urlOrPath,
  featured: z.boolean().optional().default(false),
  sortOrder: z.number().int().min(0).optional().default(0),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional().default("DRAFT"),
});

export type CaseStudyInput = z.infer<typeof caseStudySchema>;

// ==============================================================================
// MARKETING TESTIMONIAL SCHEMAS
// ==============================================================================

/**
 * Testimonial validation
 */
export const testimonialSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  title: z.string().max(100, "Title too long").optional().nullable(),
  company: z.string().max(100, "Company too long").optional().nullable(),
  quote: z.string().min(1, "Quote is required").max(1000, "Quote too long"),
  image: urlOrPath,
  featured: z.boolean().optional().default(false),
  sortOrder: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;

// ==============================================================================
// CONSULTATION REQUEST SCHEMAS
// ==============================================================================

/**
 * Consultation form validation (public submission)
 */
export const consultationFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().min(1, "Email is required").email("Invalid email").max(255, "Email too long"),
  phone: z.string().max(20, "Phone number too long").optional().nullable(),
  churchName: z.string().max(200, "Church name too long").optional().nullable(),
  packageInterest: z.enum(["free", "small", "large"]).optional().nullable(),
  message: z.string().max(5000, "Message too long").optional().nullable(),
  // Honeypot field - should be empty if submitted by a human
  website: z.string().max(0, "Invalid submission").optional(),
});

export type ConsultationFormInput = z.infer<typeof consultationFormSchema>;

/**
 * Consultation status update validation (admin)
 */
export const consultationUpdateSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "CLOSED"]).optional(),
  notes: z.string().max(5000, "Notes too long").optional().nullable(),
  assignedToId: z.string().optional().nullable(),
});

export type ConsultationUpdateInput = z.infer<typeof consultationUpdateSchema>;

// ==============================================================================
// WEBSITE REVIEW REQUEST SCHEMAS
// ==============================================================================

/**
 * Website review request form validation (public submission)
 * Lead magnet for first-time visitor website review
 */
export const websiteReviewRequestSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().min(1, "Email is required").email("Invalid email").max(255, "Email too long"),
  churchName: z.string().min(1, "Church name is required").max(200, "Church name too long"),
  websiteUrl: z
    .string()
    .max(500, "URL too long")
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return null;
      // Auto-prepend https:// if no protocol specified
      if (!val.match(/^https?:\/\//i)) {
        return `https://${val}`;
      }
      return val;
    })
    .refine(
      (val) => {
        if (!val) return true; // Allow empty/null
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Please enter a valid website URL (e.g., yourchurch.com)" }
    ),
  role: z.enum(["pastor", "admin", "communications", "volunteer", "other"]).optional().nullable(),
  // Honeypot field - should be empty if submitted by a human
  website: z.string().max(0, "Invalid submission").optional(),
});

export type WebsiteReviewRequestInput = z.infer<typeof websiteReviewRequestSchema>;
