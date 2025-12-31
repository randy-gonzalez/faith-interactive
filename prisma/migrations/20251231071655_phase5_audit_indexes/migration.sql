-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('USER_INVITED', 'USER_ROLE_CHANGED', 'USER_DEACTIVATED', 'USER_REACTIVATED', 'CONTENT_PUBLISHED', 'CONTENT_UNPUBLISHED', 'CONTENT_DELETED', 'DOMAIN_ADDED', 'DOMAIN_VERIFIED', 'DOMAIN_REMOVED', 'REDIRECT_CREATED', 'REDIRECT_UPDATED', 'REDIRECT_DELETED', 'SETTINGS_UPDATED', 'MAINTENANCE_MODE_ENABLED', 'MAINTENANCE_MODE_DISABLED', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_COMPLETED');

-- CreateEnum
CREATE TYPE "AuditEntityType" AS ENUM ('USER', 'USER_INVITE', 'PAGE', 'SERMON', 'EVENT', 'ANNOUNCEMENT', 'LEADERSHIP_PROFILE', 'CUSTOM_DOMAIN', 'REDIRECT_RULE', 'SITE_SETTINGS', 'SESSION');

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
    "churchId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "failReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

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
CREATE INDEX "LoginAttempt_churchId_email_createdAt_idx" ON "LoginAttempt"("churchId", "email", "createdAt");

-- CreateIndex
CREATE INDEX "LoginAttempt_ipAddress_createdAt_idx" ON "LoginAttempt"("ipAddress", "createdAt");

-- CreateIndex
CREATE INDEX "LoginAttempt_createdAt_idx" ON "LoginAttempt"("createdAt");

-- CreateIndex
CREATE INDEX "Announcement_churchId_status_idx" ON "Announcement"("churchId", "status");

-- CreateIndex
CREATE INDEX "Announcement_churchId_status_createdAt_idx" ON "Announcement"("churchId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "ContactSubmission_churchId_isRead_idx" ON "ContactSubmission"("churchId", "isRead");

-- CreateIndex
CREATE INDEX "ContactSubmission_churchId_createdAt_idx" ON "ContactSubmission"("churchId", "createdAt");

-- CreateIndex
CREATE INDEX "Event_churchId_status_idx" ON "Event"("churchId", "status");

-- CreateIndex
CREATE INDEX "Event_churchId_status_startDate_idx" ON "Event"("churchId", "status", "startDate");

-- CreateIndex
CREATE INDEX "LeadershipProfile_churchId_status_idx" ON "LeadershipProfile"("churchId", "status");

-- CreateIndex
CREATE INDEX "LeadershipProfile_churchId_status_sortOrder_idx" ON "LeadershipProfile"("churchId", "status", "sortOrder");

-- CreateIndex
CREATE INDEX "Media_churchId_deletedAt_idx" ON "Media"("churchId", "deletedAt");

-- CreateIndex
CREATE INDEX "Media_churchId_mimeType_deletedAt_idx" ON "Media"("churchId", "mimeType", "deletedAt");

-- CreateIndex
CREATE INDEX "Media_churchId_createdAt_idx" ON "Media"("churchId", "createdAt");

-- CreateIndex
CREATE INDEX "Page_churchId_status_idx" ON "Page"("churchId", "status");

-- CreateIndex
CREATE INDEX "Page_churchId_status_createdAt_idx" ON "Page"("churchId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "PrayerRequest_churchId_isRead_idx" ON "PrayerRequest"("churchId", "isRead");

-- CreateIndex
CREATE INDEX "PrayerRequest_churchId_isArchived_idx" ON "PrayerRequest"("churchId", "isArchived");

-- CreateIndex
CREATE INDEX "PrayerRequest_churchId_createdAt_idx" ON "PrayerRequest"("churchId", "createdAt");

-- CreateIndex
CREATE INDEX "RedirectRule_churchId_isActive_sourcePath_idx" ON "RedirectRule"("churchId", "isActive", "sourcePath");

-- CreateIndex
CREATE INDEX "Sermon_churchId_status_idx" ON "Sermon"("churchId", "status");

-- CreateIndex
CREATE INDEX "Sermon_churchId_status_date_idx" ON "Sermon"("churchId", "status", "date");

-- CreateIndex
CREATE INDEX "VolunteerSignup_churchId_isRead_idx" ON "VolunteerSignup"("churchId", "isRead");

-- CreateIndex
CREATE INDEX "VolunteerSignup_churchId_isArchived_idx" ON "VolunteerSignup"("churchId", "isArchived");

-- CreateIndex
CREATE INDEX "VolunteerSignup_churchId_createdAt_idx" ON "VolunteerSignup"("churchId", "createdAt");
