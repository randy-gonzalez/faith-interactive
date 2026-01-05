-- CreateTable
CREATE TABLE "PlatformMedia" (
    "id" TEXT NOT NULL,
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

    CONSTRAINT "PlatformMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlatformMedia_mimeType_idx" ON "PlatformMedia"("mimeType");

-- CreateIndex
CREATE INDEX "PlatformMedia_deletedAt_idx" ON "PlatformMedia"("deletedAt");

-- CreateIndex
CREATE INDEX "PlatformMedia_createdAt_idx" ON "PlatformMedia"("createdAt");

-- AddForeignKey
ALTER TABLE "PlatformMedia" ADD CONSTRAINT "PlatformMedia_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
