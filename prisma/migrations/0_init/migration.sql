-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('PLATFORM_ADMIN', 'PLATFORM_STAFF', 'SALES_REP');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "ChurchStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "FormType" AS ENUM ('CONTACT', 'PRAYER_REQUEST', 'VOLUNTEER', 'CUSTOM');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('REGISTERED', 'WAITLISTED', 'CANCELLED', 'CHECKED_IN', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS', 'PUSH');

-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "DomainStatus" AS ENUM ('PENDING', 'ACTIVE', 'ERROR');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('USER_INVITED', 'USER_ROLE_CHANGED', 'USER_DEACTIVATED', 'USER_REACTIVATED', 'CONTENT_PUBLISHED', 'CONTENT_UNPUBLISHED', 'CONTENT_DELETED', 'DOMAIN_ADDED', 'DOMAIN_VERIFIED', 'DOMAIN_REMOVED', 'REDIRECT_CREATED', 'REDIRECT_UPDATED', 'REDIRECT_DELETED', 'SETTINGS_UPDATED', 'MAINTENANCE_MODE_ENABLED', 'MAINTENANCE_MODE_DISABLED', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_COMPLETED', 'EVENT_REGISTRATION_CREATED', 'EVENT_REGISTRATION_CANCELLED', 'EVENT_REGISTRATION_CHECKED_IN', 'EVENT_REGISTRATIONS_EXPORTED', 'VENUE_CREATED', 'VENUE_UPDATED', 'VENUE_DELETED');

-- CreateEnum
CREATE TYPE "AuditEntityType" AS ENUM ('USER', 'USER_INVITE', 'PAGE', 'SERMON', 'SERMON_SERIES', 'SPEAKER', 'SERMON_TOPIC', 'EVENT', 'ANNOUNCEMENT', 'LEADERSHIP_PROFILE', 'CUSTOM_DOMAIN', 'REDIRECT_RULE', 'SITE_SETTINGS', 'SESSION', 'VENUE', 'EVENT_REGISTRATION');

-- CreateEnum
CREATE TYPE "MarketingPageStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "PlatformAuditAction" AS ENUM ('CHURCH_CREATED', 'CHURCH_UPDATED', 'CHURCH_SUSPENDED', 'CHURCH_UNSUSPENDED', 'CHURCH_DELETED', 'CHURCH_USER_INVITED', 'CHURCH_USER_ROLE_CHANGED', 'CHURCH_USER_DEACTIVATED', 'CHURCH_DOMAIN_ADDED', 'CHURCH_DOMAIN_VERIFIED', 'CHURCH_DOMAIN_REMOVED', 'MARKETING_PAGE_CREATED', 'MARKETING_PAGE_UPDATED', 'MARKETING_PAGE_PUBLISHED', 'MARKETING_PAGE_UNPUBLISHED', 'MARKETING_PAGE_DELETED', 'MARKETING_SETTINGS_UPDATED', 'IMPERSONATION_STARTED', 'IMPERSONATION_ENDED');

-- CreateEnum
CREATE TYPE "PlatformEntityType" AS ENUM ('CHURCH', 'CHURCH_USER', 'CHURCH_DOMAIN', 'MARKETING_PAGE', 'MARKETING_SETTINGS', 'SESSION');

-- CreateEnum
CREATE TYPE "CrmTaskType" AS ENUM ('CALL', 'EMAIL', 'TEXT', 'MEETING', 'INSTAGRAM', 'FACEBOOK', 'TIKTOK', 'TWITTER', 'OTHER');

-- CreateEnum
CREATE TYPE "CrmTaskStatus" AS ENUM ('OPEN', 'DONE');

-- CreateTable
CREATE TABLE "Church" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "primaryContactEmail" TEXT,
    "status" "ChurchStatus" NOT NULL DEFAULT 'ACTIVE',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Church_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT,
    "platformRole" "PlatformRole",
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChurchMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChurchMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activeChurchId" TEXT,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInvite" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "invitedById" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "blocks" JSONB NOT NULL DEFAULT '[]',
    "urlPath" TEXT,
    "featuredImageUrl" TEXT,
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "metaTitle" VARCHAR(200),
    "metaDescription" VARCHAR(500),
    "metaKeywords" VARCHAR(500),
    "ogImage" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "isHomePage" BOOLEAN NOT NULL DEFAULT false,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlobalBlock" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "blockContent" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlobalBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sermon" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "speakerId" TEXT,
    "speakerName" TEXT,
    "seriesId" TEXT,
    "seriesOrder" INTEGER,
    "scripture" TEXT,
    "description" TEXT,
    "notes" TEXT,
    "videoUrl" TEXT,
    "audioUrl" TEXT,
    "artworkUrl" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sermon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "venueId" TEXT,
    "location" TEXT,
    "description" TEXT,
    "registrationUrl" TEXT,
    "featuredImageUrl" TEXT,
    "featuredMediaId" TEXT,
    "registrationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "capacity" INTEGER,
    "waitlistEnabled" BOOLEAN NOT NULL DEFAULT false,
    "registrationDeadline" TIMESTAMP(3),
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceFrequency" "RecurrenceFrequency",
    "recurrenceInterval" INTEGER,
    "recurrenceDaysOfWeek" INTEGER,
    "recurrenceDayOfMonth" INTEGER,
    "recurrenceEndDate" TIMESTAMP(3),
    "recurrenceCount" INTEGER,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venue" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "capacity" INTEGER,
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRegistration" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "occurrenceDate" TIMESTAMP(3),
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "additionalAttendees" INTEGER NOT NULL DEFAULT 0,
    "customFields" JSONB,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'REGISTERED',
    "waitlistPosition" INTEGER,
    "checkedInAt" TIMESTAMP(3),
    "checkedInBy" TEXT,
    "reminderOptIn" BOOLEAN NOT NULL DEFAULT true,
    "accessToken" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventReminder" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "sentAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationSubscription" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "pushSubscription" JSONB,
    "phoneNumber" TEXT,
    "channels" "NotificationChannel"[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadershipProfile" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bio" TEXT,
    "photoUrl" TEXT,
    "email" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadershipProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SermonSeries" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "artworkUrl" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SermonSeries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Speaker" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "bio" TEXT,
    "photoUrl" TEXT,
    "email" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isGuest" BOOLEAN NOT NULL DEFAULT false,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Speaker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScriptureBook" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "testament" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "chapterCount" INTEGER NOT NULL,

    CONSTRAINT "ScriptureBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScriptureReference" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "startChapter" INTEGER NOT NULL,
    "startVerse" INTEGER,
    "endChapter" INTEGER,
    "endVerse" INTEGER,
    "sermonId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScriptureReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SermonTopic" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SermonTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SermonTopicLink" (
    "id" TEXT NOT NULL,
    "sermonId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,

    CONSTRAINT "SermonTopicLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "logoUrl" TEXT,
    "headerNavigation" JSONB DEFAULT '[]',
    "footerText" TEXT,
    "footerNavigation" JSONB DEFAULT '[]',
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "youtubeUrl" TEXT,
    "serviceTimes" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "contactEmail" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "faviconUrl" TEXT,
    "mapEmbedUrl" TEXT,
    "homePageId" TEXT,
    "prayerNotifyEmails" TEXT,
    "volunteerNotifyEmails" TEXT,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "headerTemplate" TEXT NOT NULL DEFAULT 'classic',
    "headerConfig" JSONB,
    "footerTemplate" TEXT NOT NULL DEFAULT '4-column',
    "footerConfig" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChurchBranding" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "logoHeaderUrl" TEXT,
    "logoLightUrl" TEXT,
    "logoDarkUrl" TEXT,
    "faviconUrl" TEXT,
    "colorPrimary" TEXT,
    "colorSecondary" TEXT,
    "colorAccent" TEXT,
    "colorBackground" TEXT,
    "colorText" TEXT,
    "colorPresets" JSONB DEFAULT '[]',
    "gradientPresets" JSONB DEFAULT '[]',
    "fontPrimary" TEXT,
    "fontSecondary" TEXT,
    "fontSizeBase" INTEGER DEFAULT 16,
    "headingScale" DOUBLE PRECISION DEFAULT 1.25,
    "lineHeight" DOUBLE PRECISION DEFAULT 1.5,
    "buttonStyle" TEXT DEFAULT 'rounded',
    "buttonRadius" INTEGER DEFAULT 6,
    "buttonPrimaryBg" TEXT,
    "buttonPrimaryText" TEXT,
    "buttonSecondaryBg" TEXT,
    "buttonSecondaryText" TEXT,
    "buttonOutlineBorder" TEXT,
    "buttonOutlineText" TEXT,
    "buttonAccentBg" TEXT,
    "buttonAccentText" TEXT,
    "borderRadius" INTEGER DEFAULT 8,
    "linkColor" TEXT,
    "linkHoverColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChurchBranding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactSubmission" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "storagePath" TEXT NOT NULL,
    "variants" JSONB,
    "alt" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrayerRequest" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "request" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrayerRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerSignup" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "interests" JSONB DEFAULT '[]',
    "message" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VolunteerSignup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomDomain" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "status" "DomainStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "verificationToken" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RedirectRule" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "sourcePath" TEXT NOT NULL,
    "destinationUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RedirectRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaunchChecklistItem" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "itemKey" TEXT NOT NULL,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "completedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaunchChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actorEmail" TEXT,
    "actorIp" TEXT,
    "action" "AuditAction" NOT NULL,
    "entityType" "AuditEntityType" NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "requestId" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginAttempt" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "failReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingPage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "blocks" JSONB NOT NULL DEFAULT '[]',
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "MarketingPageStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "metaTitle" VARCHAR(200),
    "metaDescription" VARCHAR(500),
    "metaKeywords" VARCHAR(500),
    "ogImage" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingSiteSettings" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL DEFAULT 'Faith Interactive',
    "defaultMetaTitle" TEXT,
    "defaultMetaDescription" TEXT,
    "faviconUrl" TEXT,
    "headerNavigation" JSONB NOT NULL DEFAULT '[]',
    "footerText" TEXT,
    "footerLinks" JSONB NOT NULL DEFAULT '[]',
    "homePageSlug" TEXT NOT NULL DEFAULT 'home',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingSiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformAuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "actorEmail" TEXT NOT NULL,
    "actorIp" TEXT,
    "action" "PlatformAuditAction" NOT NULL,
    "entityType" "PlatformEntityType" NOT NULL,
    "entityId" TEXT,
    "targetChurchId" TEXT,
    "metadata" JSONB,
    "requestId" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Form" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" "FormType" NOT NULL DEFAULT 'CUSTOM',
    "fields" JSONB NOT NULL DEFAULT '[]',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "notifyEmails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormSubmission" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "files" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "readBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormFile" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "submissionId" TEXT,
    "filename" TEXT NOT NULL,
    "storedPath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "FormFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmStage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmLead" (
    "id" TEXT NOT NULL,
    "churchName" TEXT NOT NULL,
    "primaryContactName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "location" TEXT,
    "stageId" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "source" TEXT,
    "notes" TEXT,
    "nextFollowUpAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmTask" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "type" "CrmTaskType" NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "status" "CrmTaskStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmDnc" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "reason" TEXT,
    "addedByUserId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmDnc_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Church_slug_key" ON "Church"("slug");

-- CreateIndex
CREATE INDEX "Church_slug_idx" ON "Church"("slug");

-- CreateIndex
CREATE INDEX "Church_status_idx" ON "Church"("status");

-- CreateIndex
CREATE INDEX "Church_deletedAt_idx" ON "Church"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_platformRole_idx" ON "User"("platformRole");

-- CreateIndex
CREATE INDEX "ChurchMembership_userId_idx" ON "ChurchMembership"("userId");

-- CreateIndex
CREATE INDEX "ChurchMembership_churchId_idx" ON "ChurchMembership"("churchId");

-- CreateIndex
CREATE INDEX "ChurchMembership_userId_isActive_idx" ON "ChurchMembership"("userId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ChurchMembership_userId_churchId_key" ON "ChurchMembership"("userId", "churchId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_activeChurchId_idx" ON "Session"("activeChurchId");

-- CreateIndex
CREATE INDEX "Session_token_idx" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "UserInvite_token_key" ON "UserInvite"("token");

-- CreateIndex
CREATE INDEX "UserInvite_churchId_idx" ON "UserInvite"("churchId");

-- CreateIndex
CREATE INDEX "UserInvite_token_idx" ON "UserInvite"("token");

-- CreateIndex
CREATE UNIQUE INDEX "UserInvite_churchId_email_key" ON "UserInvite"("churchId", "email");

-- CreateIndex
CREATE INDEX "Page_churchId_idx" ON "Page"("churchId");

-- CreateIndex
CREATE INDEX "Page_status_idx" ON "Page"("status");

-- CreateIndex
CREATE INDEX "Page_parentId_idx" ON "Page"("parentId");

-- CreateIndex
CREATE INDEX "Page_churchId_status_idx" ON "Page"("churchId", "status");

-- CreateIndex
CREATE INDEX "Page_churchId_status_createdAt_idx" ON "Page"("churchId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Page_churchId_parentId_sortOrder_idx" ON "Page"("churchId", "parentId", "sortOrder");

-- CreateIndex
CREATE INDEX "Page_churchId_isHomePage_idx" ON "Page"("churchId", "isHomePage");

-- CreateIndex
CREATE UNIQUE INDEX "Page_churchId_urlPath_key" ON "Page"("churchId", "urlPath");

-- CreateIndex
CREATE INDEX "GlobalBlock_churchId_idx" ON "GlobalBlock"("churchId");

-- CreateIndex
CREATE INDEX "GlobalBlock_churchId_isActive_idx" ON "GlobalBlock"("churchId", "isActive");

-- CreateIndex
CREATE INDEX "GlobalBlock_churchId_name_idx" ON "GlobalBlock"("churchId", "name");

-- CreateIndex
CREATE INDEX "Sermon_churchId_idx" ON "Sermon"("churchId");

-- CreateIndex
CREATE INDEX "Sermon_status_idx" ON "Sermon"("status");

-- CreateIndex
CREATE INDEX "Sermon_date_idx" ON "Sermon"("date");

-- CreateIndex
CREATE INDEX "Sermon_speakerId_idx" ON "Sermon"("speakerId");

-- CreateIndex
CREATE INDEX "Sermon_seriesId_idx" ON "Sermon"("seriesId");

-- CreateIndex
CREATE INDEX "Sermon_churchId_status_idx" ON "Sermon"("churchId", "status");

-- CreateIndex
CREATE INDEX "Sermon_churchId_status_date_idx" ON "Sermon"("churchId", "status", "date");

-- CreateIndex
CREATE INDEX "Sermon_churchId_seriesId_idx" ON "Sermon"("churchId", "seriesId");

-- CreateIndex
CREATE INDEX "Sermon_churchId_speakerId_idx" ON "Sermon"("churchId", "speakerId");

-- CreateIndex
CREATE INDEX "Event_churchId_idx" ON "Event"("churchId");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "Event_startDate_idx" ON "Event"("startDate");

-- CreateIndex
CREATE INDEX "Event_venueId_idx" ON "Event"("venueId");

-- CreateIndex
CREATE INDEX "Event_isRecurring_idx" ON "Event"("isRecurring");

-- CreateIndex
CREATE INDEX "Event_churchId_status_idx" ON "Event"("churchId", "status");

-- CreateIndex
CREATE INDEX "Event_churchId_status_startDate_idx" ON "Event"("churchId", "status", "startDate");

-- CreateIndex
CREATE INDEX "Event_churchId_isRecurring_idx" ON "Event"("churchId", "isRecurring");

-- CreateIndex
CREATE INDEX "Venue_churchId_idx" ON "Venue"("churchId");

-- CreateIndex
CREATE INDEX "Venue_churchId_isActive_idx" ON "Venue"("churchId", "isActive");

-- CreateIndex
CREATE INDEX "Venue_sortOrder_idx" ON "Venue"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_accessToken_key" ON "EventRegistration"("accessToken");

-- CreateIndex
CREATE INDEX "EventRegistration_churchId_idx" ON "EventRegistration"("churchId");

-- CreateIndex
CREATE INDEX "EventRegistration_eventId_idx" ON "EventRegistration"("eventId");

-- CreateIndex
CREATE INDEX "EventRegistration_eventId_status_idx" ON "EventRegistration"("eventId", "status");

-- CreateIndex
CREATE INDEX "EventRegistration_email_idx" ON "EventRegistration"("email");

-- CreateIndex
CREATE INDEX "EventRegistration_accessToken_idx" ON "EventRegistration"("accessToken");

-- CreateIndex
CREATE INDEX "EventRegistration_occurrenceDate_idx" ON "EventRegistration"("occurrenceDate");

-- CreateIndex
CREATE INDEX "EventRegistration_status_idx" ON "EventRegistration"("status");

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_eventId_email_occurrenceDate_key" ON "EventRegistration"("eventId", "email", "occurrenceDate");

-- CreateIndex
CREATE INDEX "EventReminder_scheduledFor_sentAt_idx" ON "EventReminder"("scheduledFor", "sentAt");

-- CreateIndex
CREATE INDEX "EventReminder_registrationId_idx" ON "EventReminder"("registrationId");

-- CreateIndex
CREATE INDEX "EventReminder_scheduledFor_idx" ON "EventReminder"("scheduledFor");

-- CreateIndex
CREATE INDEX "NotificationSubscription_churchId_idx" ON "NotificationSubscription"("churchId");

-- CreateIndex
CREATE INDEX "NotificationSubscription_userId_idx" ON "NotificationSubscription"("userId");

-- CreateIndex
CREATE INDEX "NotificationSubscription_email_idx" ON "NotificationSubscription"("email");

-- CreateIndex
CREATE INDEX "NotificationSubscription_isActive_idx" ON "NotificationSubscription"("isActive");

-- CreateIndex
CREATE INDEX "Announcement_churchId_idx" ON "Announcement"("churchId");

-- CreateIndex
CREATE INDEX "Announcement_status_idx" ON "Announcement"("status");

-- CreateIndex
CREATE INDEX "Announcement_expiresAt_idx" ON "Announcement"("expiresAt");

-- CreateIndex
CREATE INDEX "Announcement_churchId_status_idx" ON "Announcement"("churchId", "status");

-- CreateIndex
CREATE INDEX "Announcement_churchId_status_createdAt_idx" ON "Announcement"("churchId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "LeadershipProfile_churchId_idx" ON "LeadershipProfile"("churchId");

-- CreateIndex
CREATE INDEX "LeadershipProfile_status_idx" ON "LeadershipProfile"("status");

-- CreateIndex
CREATE INDEX "LeadershipProfile_sortOrder_idx" ON "LeadershipProfile"("sortOrder");

-- CreateIndex
CREATE INDEX "LeadershipProfile_churchId_status_idx" ON "LeadershipProfile"("churchId", "status");

-- CreateIndex
CREATE INDEX "LeadershipProfile_churchId_status_sortOrder_idx" ON "LeadershipProfile"("churchId", "status", "sortOrder");

-- CreateIndex
CREATE INDEX "SermonSeries_churchId_idx" ON "SermonSeries"("churchId");

-- CreateIndex
CREATE INDEX "SermonSeries_status_idx" ON "SermonSeries"("status");

-- CreateIndex
CREATE INDEX "SermonSeries_sortOrder_idx" ON "SermonSeries"("sortOrder");

-- CreateIndex
CREATE INDEX "SermonSeries_churchId_status_idx" ON "SermonSeries"("churchId", "status");

-- CreateIndex
CREATE INDEX "SermonSeries_churchId_status_startDate_idx" ON "SermonSeries"("churchId", "status", "startDate");

-- CreateIndex
CREATE INDEX "Speaker_churchId_idx" ON "Speaker"("churchId");

-- CreateIndex
CREATE INDEX "Speaker_status_idx" ON "Speaker"("status");

-- CreateIndex
CREATE INDEX "Speaker_sortOrder_idx" ON "Speaker"("sortOrder");

-- CreateIndex
CREATE INDEX "Speaker_churchId_status_idx" ON "Speaker"("churchId", "status");

-- CreateIndex
CREATE INDEX "Speaker_churchId_isGuest_idx" ON "Speaker"("churchId", "isGuest");

-- CreateIndex
CREATE UNIQUE INDEX "ScriptureBook_name_key" ON "ScriptureBook"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ScriptureBook_sortOrder_key" ON "ScriptureBook"("sortOrder");

-- CreateIndex
CREATE INDEX "ScriptureBook_testament_idx" ON "ScriptureBook"("testament");

-- CreateIndex
CREATE INDEX "ScriptureBook_sortOrder_idx" ON "ScriptureBook"("sortOrder");

-- CreateIndex
CREATE INDEX "ScriptureReference_sermonId_idx" ON "ScriptureReference"("sermonId");

-- CreateIndex
CREATE INDEX "ScriptureReference_bookId_idx" ON "ScriptureReference"("bookId");

-- CreateIndex
CREATE INDEX "ScriptureReference_bookId_startChapter_idx" ON "ScriptureReference"("bookId", "startChapter");

-- CreateIndex
CREATE INDEX "SermonTopic_churchId_idx" ON "SermonTopic"("churchId");

-- CreateIndex
CREATE INDEX "SermonTopic_churchId_name_idx" ON "SermonTopic"("churchId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "SermonTopic_churchId_slug_key" ON "SermonTopic"("churchId", "slug");

-- CreateIndex
CREATE INDEX "SermonTopicLink_sermonId_idx" ON "SermonTopicLink"("sermonId");

-- CreateIndex
CREATE INDEX "SermonTopicLink_topicId_idx" ON "SermonTopicLink"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "SermonTopicLink_sermonId_topicId_key" ON "SermonTopicLink"("sermonId", "topicId");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSettings_churchId_key" ON "SiteSettings"("churchId");

-- CreateIndex
CREATE UNIQUE INDEX "ChurchBranding_churchId_key" ON "ChurchBranding"("churchId");

-- CreateIndex
CREATE INDEX "ChurchBranding_churchId_idx" ON "ChurchBranding"("churchId");

-- CreateIndex
CREATE INDEX "ContactSubmission_churchId_idx" ON "ContactSubmission"("churchId");

-- CreateIndex
CREATE INDEX "ContactSubmission_createdAt_idx" ON "ContactSubmission"("createdAt");

-- CreateIndex
CREATE INDEX "ContactSubmission_isRead_idx" ON "ContactSubmission"("isRead");

-- CreateIndex
CREATE INDEX "ContactSubmission_churchId_isRead_idx" ON "ContactSubmission"("churchId", "isRead");

-- CreateIndex
CREATE INDEX "ContactSubmission_churchId_createdAt_idx" ON "ContactSubmission"("churchId", "createdAt");

-- CreateIndex
CREATE INDEX "Media_churchId_idx" ON "Media"("churchId");

-- CreateIndex
CREATE INDEX "Media_uploadedById_idx" ON "Media"("uploadedById");

-- CreateIndex
CREATE INDEX "Media_mimeType_idx" ON "Media"("mimeType");

-- CreateIndex
CREATE INDEX "Media_deletedAt_idx" ON "Media"("deletedAt");

-- CreateIndex
CREATE INDEX "Media_createdAt_idx" ON "Media"("createdAt");

-- CreateIndex
CREATE INDEX "Media_churchId_deletedAt_idx" ON "Media"("churchId", "deletedAt");

-- CreateIndex
CREATE INDEX "Media_churchId_mimeType_deletedAt_idx" ON "Media"("churchId", "mimeType", "deletedAt");

-- CreateIndex
CREATE INDEX "Media_churchId_createdAt_idx" ON "Media"("churchId", "createdAt");

-- CreateIndex
CREATE INDEX "PrayerRequest_churchId_idx" ON "PrayerRequest"("churchId");

-- CreateIndex
CREATE INDEX "PrayerRequest_createdAt_idx" ON "PrayerRequest"("createdAt");

-- CreateIndex
CREATE INDEX "PrayerRequest_isRead_idx" ON "PrayerRequest"("isRead");

-- CreateIndex
CREATE INDEX "PrayerRequest_isArchived_idx" ON "PrayerRequest"("isArchived");

-- CreateIndex
CREATE INDEX "PrayerRequest_churchId_isRead_idx" ON "PrayerRequest"("churchId", "isRead");

-- CreateIndex
CREATE INDEX "PrayerRequest_churchId_isArchived_idx" ON "PrayerRequest"("churchId", "isArchived");

-- CreateIndex
CREATE INDEX "PrayerRequest_churchId_createdAt_idx" ON "PrayerRequest"("churchId", "createdAt");

-- CreateIndex
CREATE INDEX "VolunteerSignup_churchId_idx" ON "VolunteerSignup"("churchId");

-- CreateIndex
CREATE INDEX "VolunteerSignup_createdAt_idx" ON "VolunteerSignup"("createdAt");

-- CreateIndex
CREATE INDEX "VolunteerSignup_isRead_idx" ON "VolunteerSignup"("isRead");

-- CreateIndex
CREATE INDEX "VolunteerSignup_isArchived_idx" ON "VolunteerSignup"("isArchived");

-- CreateIndex
CREATE INDEX "VolunteerSignup_churchId_isRead_idx" ON "VolunteerSignup"("churchId", "isRead");

-- CreateIndex
CREATE INDEX "VolunteerSignup_churchId_isArchived_idx" ON "VolunteerSignup"("churchId", "isArchived");

-- CreateIndex
CREATE INDEX "VolunteerSignup_churchId_createdAt_idx" ON "VolunteerSignup"("churchId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CustomDomain_hostname_key" ON "CustomDomain"("hostname");

-- CreateIndex
CREATE INDEX "CustomDomain_churchId_idx" ON "CustomDomain"("churchId");

-- CreateIndex
CREATE INDEX "CustomDomain_hostname_idx" ON "CustomDomain"("hostname");

-- CreateIndex
CREATE INDEX "CustomDomain_status_idx" ON "CustomDomain"("status");

-- CreateIndex
CREATE INDEX "RedirectRule_churchId_idx" ON "RedirectRule"("churchId");

-- CreateIndex
CREATE INDEX "RedirectRule_isActive_idx" ON "RedirectRule"("isActive");

-- CreateIndex
CREATE INDEX "RedirectRule_churchId_isActive_sourcePath_idx" ON "RedirectRule"("churchId", "isActive", "sourcePath");

-- CreateIndex
CREATE UNIQUE INDEX "RedirectRule_churchId_sourcePath_key" ON "RedirectRule"("churchId", "sourcePath");

-- CreateIndex
CREATE INDEX "LaunchChecklistItem_churchId_idx" ON "LaunchChecklistItem"("churchId");

-- CreateIndex
CREATE UNIQUE INDEX "LaunchChecklistItem_churchId_itemKey_key" ON "LaunchChecklistItem"("churchId", "itemKey");

-- CreateIndex
CREATE INDEX "AuditLog_churchId_createdAt_idx" ON "AuditLog"("churchId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_churchId_action_idx" ON "AuditLog"("churchId", "action");

-- CreateIndex
CREATE INDEX "AuditLog_churchId_entityType_idx" ON "AuditLog"("churchId", "entityType");

-- CreateIndex
CREATE INDEX "AuditLog_churchId_actorUserId_idx" ON "AuditLog"("churchId", "actorUserId");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "LoginAttempt_email_createdAt_idx" ON "LoginAttempt"("email", "createdAt");

-- CreateIndex
CREATE INDEX "LoginAttempt_ipAddress_createdAt_idx" ON "LoginAttempt"("ipAddress", "createdAt");

-- CreateIndex
CREATE INDEX "LoginAttempt_createdAt_idx" ON "LoginAttempt"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MarketingPage_slug_key" ON "MarketingPage"("slug");

-- CreateIndex
CREATE INDEX "MarketingPage_slug_idx" ON "MarketingPage"("slug");

-- CreateIndex
CREATE INDEX "MarketingPage_status_idx" ON "MarketingPage"("status");

-- CreateIndex
CREATE INDEX "MarketingPage_parentId_idx" ON "MarketingPage"("parentId");

-- CreateIndex
CREATE INDEX "MarketingPage_parentId_sortOrder_idx" ON "MarketingPage"("parentId", "sortOrder");

-- CreateIndex
CREATE INDEX "PlatformAuditLog_actorUserId_idx" ON "PlatformAuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "PlatformAuditLog_action_idx" ON "PlatformAuditLog"("action");

-- CreateIndex
CREATE INDEX "PlatformAuditLog_entityType_idx" ON "PlatformAuditLog"("entityType");

-- CreateIndex
CREATE INDEX "PlatformAuditLog_targetChurchId_idx" ON "PlatformAuditLog"("targetChurchId");

-- CreateIndex
CREATE INDEX "PlatformAuditLog_createdAt_idx" ON "PlatformAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Form_churchId_idx" ON "Form"("churchId");

-- CreateIndex
CREATE INDEX "Form_churchId_type_idx" ON "Form"("churchId", "type");

-- CreateIndex
CREATE INDEX "Form_churchId_isActive_idx" ON "Form"("churchId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Form_churchId_slug_key" ON "Form"("churchId", "slug");

-- CreateIndex
CREATE INDEX "FormSubmission_churchId_idx" ON "FormSubmission"("churchId");

-- CreateIndex
CREATE INDEX "FormSubmission_formId_idx" ON "FormSubmission"("formId");

-- CreateIndex
CREATE INDEX "FormSubmission_formId_isRead_idx" ON "FormSubmission"("formId", "isRead");

-- CreateIndex
CREATE INDEX "FormSubmission_formId_createdAt_idx" ON "FormSubmission"("formId", "createdAt");

-- CreateIndex
CREATE INDEX "FormSubmission_churchId_createdAt_idx" ON "FormSubmission"("churchId", "createdAt");

-- CreateIndex
CREATE INDEX "FormFile_churchId_idx" ON "FormFile"("churchId");

-- CreateIndex
CREATE INDEX "FormFile_submissionId_idx" ON "FormFile"("submissionId");

-- CreateIndex
CREATE INDEX "FormFile_expiresAt_idx" ON "FormFile"("expiresAt");

-- CreateIndex
CREATE INDEX "CrmStage_sortOrder_idx" ON "CrmStage"("sortOrder");

-- CreateIndex
CREATE INDEX "CrmStage_isActive_idx" ON "CrmStage"("isActive");

-- CreateIndex
CREATE INDEX "CrmStage_isActive_sortOrder_idx" ON "CrmStage"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "CrmLead_stageId_idx" ON "CrmLead"("stageId");

-- CreateIndex
CREATE INDEX "CrmLead_ownerUserId_idx" ON "CrmLead"("ownerUserId");

-- CreateIndex
CREATE INDEX "CrmLead_nextFollowUpAt_idx" ON "CrmLead"("nextFollowUpAt");

-- CreateIndex
CREATE INDEX "CrmLead_ownerUserId_stageId_idx" ON "CrmLead"("ownerUserId", "stageId");

-- CreateIndex
CREATE INDEX "CrmLead_ownerUserId_nextFollowUpAt_idx" ON "CrmLead"("ownerUserId", "nextFollowUpAt");

-- CreateIndex
CREATE INDEX "CrmLead_createdAt_idx" ON "CrmLead"("createdAt");

-- CreateIndex
CREATE INDEX "CrmTask_leadId_idx" ON "CrmTask"("leadId");

-- CreateIndex
CREATE INDEX "CrmTask_ownerUserId_idx" ON "CrmTask"("ownerUserId");

-- CreateIndex
CREATE INDEX "CrmTask_status_idx" ON "CrmTask"("status");

-- CreateIndex
CREATE INDEX "CrmTask_dueAt_idx" ON "CrmTask"("dueAt");

-- CreateIndex
CREATE INDEX "CrmTask_ownerUserId_status_idx" ON "CrmTask"("ownerUserId", "status");

-- CreateIndex
CREATE INDEX "CrmTask_ownerUserId_status_dueAt_idx" ON "CrmTask"("ownerUserId", "status", "dueAt");

-- CreateIndex
CREATE INDEX "CrmTask_leadId_status_idx" ON "CrmTask"("leadId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CrmDnc_leadId_key" ON "CrmDnc"("leadId");

-- CreateIndex
CREATE INDEX "CrmDnc_addedByUserId_idx" ON "CrmDnc"("addedByUserId");

-- AddForeignKey
ALTER TABLE "ChurchMembership" ADD CONSTRAINT "ChurchMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchMembership" ADD CONSTRAINT "ChurchMembership_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_activeChurchId_fkey" FOREIGN KEY ("activeChurchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInvite" ADD CONSTRAINT "UserInvite_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Page"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlobalBlock" ADD CONSTRAINT "GlobalBlock_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sermon" ADD CONSTRAINT "Sermon_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sermon" ADD CONSTRAINT "Sermon_speakerId_fkey" FOREIGN KEY ("speakerId") REFERENCES "Speaker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sermon" ADD CONSTRAINT "Sermon_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "SermonSeries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venue" ADD CONSTRAINT "Venue_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventReminder" ADD CONSTRAINT "EventReminder_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "EventRegistration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationSubscription" ADD CONSTRAINT "NotificationSubscription_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadershipProfile" ADD CONSTRAINT "LeadershipProfile_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SermonSeries" ADD CONSTRAINT "SermonSeries_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Speaker" ADD CONSTRAINT "Speaker_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScriptureReference" ADD CONSTRAINT "ScriptureReference_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "ScriptureBook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScriptureReference" ADD CONSTRAINT "ScriptureReference_sermonId_fkey" FOREIGN KEY ("sermonId") REFERENCES "Sermon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SermonTopic" ADD CONSTRAINT "SermonTopic_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SermonTopicLink" ADD CONSTRAINT "SermonTopicLink_sermonId_fkey" FOREIGN KEY ("sermonId") REFERENCES "Sermon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SermonTopicLink" ADD CONSTRAINT "SermonTopicLink_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "SermonTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurchBranding" ADD CONSTRAINT "ChurchBranding_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactSubmission" ADD CONSTRAINT "ContactSubmission_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerRequest" ADD CONSTRAINT "PrayerRequest_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerSignup" ADD CONSTRAINT "VolunteerSignup_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomDomain" ADD CONSTRAINT "CustomDomain_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedirectRule" ADD CONSTRAINT "RedirectRule_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaunchChecklistItem" ADD CONSTRAINT "LaunchChecklistItem_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingPage" ADD CONSTRAINT "MarketingPage_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "MarketingPage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformAuditLog" ADD CONSTRAINT "PlatformAuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormFile" ADD CONSTRAINT "FormFile_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmLead" ADD CONSTRAINT "CrmLead_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "CrmStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmLead" ADD CONSTRAINT "CrmLead_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmTask" ADD CONSTRAINT "CrmTask_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "CrmLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmTask" ADD CONSTRAINT "CrmTask_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmDnc" ADD CONSTRAINT "CrmDnc_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "CrmLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmDnc" ADD CONSTRAINT "CrmDnc_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

