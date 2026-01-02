-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('PLATFORM_ADMIN', 'PLATFORM_STAFF');

-- CreateEnum
CREATE TYPE "ChurchStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "MarketingPageStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "PlatformAuditAction" AS ENUM ('CHURCH_CREATED', 'CHURCH_UPDATED', 'CHURCH_SUSPENDED', 'CHURCH_UNSUSPENDED', 'CHURCH_DELETED', 'CHURCH_USER_INVITED', 'CHURCH_USER_ROLE_CHANGED', 'CHURCH_USER_DEACTIVATED', 'CHURCH_DOMAIN_ADDED', 'CHURCH_DOMAIN_VERIFIED', 'CHURCH_DOMAIN_REMOVED', 'MARKETING_PAGE_CREATED', 'MARKETING_PAGE_UPDATED', 'MARKETING_PAGE_PUBLISHED', 'MARKETING_PAGE_UNPUBLISHED', 'MARKETING_PAGE_DELETED', 'MARKETING_SETTINGS_UPDATED', 'IMPERSONATION_STARTED', 'IMPERSONATION_ENDED');

-- CreateEnum
CREATE TYPE "PlatformEntityType" AS ENUM ('CHURCH', 'CHURCH_USER', 'CHURCH_DOMAIN', 'MARKETING_PAGE', 'MARKETING_SETTINGS', 'SESSION');

-- AlterTable
ALTER TABLE "Church" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "primaryContactEmail" TEXT,
ADD COLUMN     "status" "ChurchStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "platformRole" "PlatformRole";

-- CreateTable
CREATE TABLE "MarketingPage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "MarketingPageStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "metaTitle" TEXT,
    "metaDescription" TEXT,
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

-- CreateIndex
CREATE UNIQUE INDEX "MarketingPage_slug_key" ON "MarketingPage"("slug");

-- CreateIndex
CREATE INDEX "MarketingPage_slug_idx" ON "MarketingPage"("slug");

-- CreateIndex
CREATE INDEX "MarketingPage_status_idx" ON "MarketingPage"("status");

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
CREATE INDEX "Church_status_idx" ON "Church"("status");

-- CreateIndex
CREATE INDEX "Church_deletedAt_idx" ON "Church"("deletedAt");

-- CreateIndex
CREATE INDEX "User_platformRole_idx" ON "User"("platformRole");

-- AddForeignKey
ALTER TABLE "PlatformAuditLog" ADD CONSTRAINT "PlatformAuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
