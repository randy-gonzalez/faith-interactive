-- CreateEnum
CREATE TYPE "DomainStatus" AS ENUM ('PENDING', 'ACTIVE', 'ERROR');

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "maintenanceMode" BOOLEAN NOT NULL DEFAULT false;

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
CREATE UNIQUE INDEX "RedirectRule_churchId_sourcePath_key" ON "RedirectRule"("churchId", "sourcePath");

-- CreateIndex
CREATE INDEX "LaunchChecklistItem_churchId_idx" ON "LaunchChecklistItem"("churchId");

-- CreateIndex
CREATE UNIQUE INDEX "LaunchChecklistItem_churchId_itemKey_key" ON "LaunchChecklistItem"("churchId", "itemKey");

-- AddForeignKey
ALTER TABLE "CustomDomain" ADD CONSTRAINT "CustomDomain_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedirectRule" ADD CONSTRAINT "RedirectRule_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaunchChecklistItem" ADD CONSTRAINT "LaunchChecklistItem_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;
