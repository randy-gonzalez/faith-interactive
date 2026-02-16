-- Create ChurchPartner table (safe - only adds new table)
CREATE TABLE IF NOT EXISTS "ChurchPartner" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "logoUrl" TEXT NOT NULL,
  "websiteUrl" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ChurchPartner_pkey" PRIMARY KEY ("id")
);

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS "ChurchPartner_slug_key" ON "ChurchPartner"("slug");

-- Create composite index for queries
CREATE INDEX IF NOT EXISTS "ChurchPartner_isActive_sortOrder_idx" ON "ChurchPartner"("isActive", "sortOrder");
