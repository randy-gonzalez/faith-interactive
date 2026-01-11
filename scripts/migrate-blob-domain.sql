-- ==============================================================================
-- Migration: Update Blob Storage Domain
-- ==============================================================================
-- Old domain: https://nzdsskmet9ac9kik.public.blob.vercel-storage.com/
-- New domain: https://assets.faith-interactive.com/
-- ==============================================================================

-- IMPORTANT: Backup your database before running this migration!

BEGIN;

-- ==============================================================================
-- Update MarketingSiteSettings
-- ==============================================================================
UPDATE "MarketingSiteSettings"
SET "faviconUrl" = REPLACE("faviconUrl", 'https://nzdsskmet9ac9kik.public.blob.vercel-storage.com/', 'https://assets.faith-interactive.com/')
WHERE "faviconUrl" LIKE '%nzdsskmet9ac9kik.public.blob.vercel-storage.com%';

-- ==============================================================================
-- Update MarketingPage
-- ==============================================================================
UPDATE "MarketingPage"
SET "ogImage" = REPLACE("ogImage", 'https://nzdsskmet9ac9kik.public.blob.vercel-storage.com/', 'https://assets.faith-interactive.com/')
WHERE "ogImage" LIKE '%nzdsskmet9ac9kik.public.blob.vercel-storage.com%';

UPDATE "MarketingPage"
SET "blocks" = REPLACE("blocks"::text, 'https://nzdsskmet9ac9kik.public.blob.vercel-storage.com/', 'https://assets.faith-interactive.com/')::jsonb
WHERE "blocks"::text LIKE '%nzdsskmet9ac9kik.public.blob.vercel-storage.com%';

-- ==============================================================================
-- Update BlogPost
-- ==============================================================================
UPDATE "BlogPost"
SET "featuredImage" = REPLACE("featuredImage", 'https://nzdsskmet9ac9kik.public.blob.vercel-storage.com/', 'https://assets.faith-interactive.com/')
WHERE "featuredImage" LIKE '%nzdsskmet9ac9kik.public.blob.vercel-storage.com%';

UPDATE "BlogPost"
SET "ogImage" = REPLACE("ogImage", 'https://nzdsskmet9ac9kik.public.blob.vercel-storage.com/', 'https://assets.faith-interactive.com/')
WHERE "ogImage" LIKE '%nzdsskmet9ac9kik.public.blob.vercel-storage.com%';

UPDATE "BlogPost"
SET "blocks" = REPLACE("blocks"::text, 'https://nzdsskmet9ac9kik.public.blob.vercel-storage.com/', 'https://assets.faith-interactive.com/')::jsonb
WHERE "blocks"::text LIKE '%nzdsskmet9ac9kik.public.blob.vercel-storage.com%';

-- ==============================================================================
-- Update CaseStudy
-- ==============================================================================
UPDATE "CaseStudy"
SET "logo" = REPLACE("logo", 'https://nzdsskmet9ac9kik.public.blob.vercel-storage.com/', 'https://assets.faith-interactive.com/')
WHERE "logo" LIKE '%nzdsskmet9ac9kik.public.blob.vercel-storage.com%';

UPDATE "CaseStudy"
SET "images" = REPLACE("images"::text, 'https://nzdsskmet9ac9kik.public.blob.vercel-storage.com/', 'https://assets.faith-interactive.com/')::jsonb
WHERE "images"::text LIKE '%nzdsskmet9ac9kik.public.blob.vercel-storage.com%';

UPDATE "CaseStudy"
SET "beforeImage" = REPLACE("beforeImage", 'https://nzdsskmet9ac9kik.public.blob.vercel-storage.com/', 'https://assets.faith-interactive.com/')
WHERE "beforeImage" LIKE '%nzdsskmet9ac9kik.public.blob.vercel-storage.com%';

UPDATE "CaseStudy"
SET "afterImage" = REPLACE("afterImage", 'https://nzdsskmet9ac9kik.public.blob.vercel-storage.com/', 'https://assets.faith-interactive.com/')
WHERE "afterImage" LIKE '%nzdsskmet9ac9kik.public.blob.vercel-storage.com%';

-- ==============================================================================
-- Update Testimonial
-- ==============================================================================
UPDATE "Testimonial"
SET "image" = REPLACE("image", 'https://nzdsskmet9ac9kik.public.blob.vercel-storage.com/', 'https://assets.faith-interactive.com/')
WHERE "image" LIKE '%nzdsskmet9ac9kik.public.blob.vercel-storage.com%';

-- ==============================================================================
-- Update PlatformMedia
-- ==============================================================================
UPDATE "PlatformMedia"
SET "storagePath" = REPLACE("storagePath", 'https://nzdsskmet9ac9kik.public.blob.vercel-storage.com/', 'https://assets.faith-interactive.com/')
WHERE "storagePath" LIKE '%nzdsskmet9ac9kik.public.blob.vercel-storage.com%';

UPDATE "PlatformMedia"
SET "variants" = REPLACE("variants"::text, 'https://nzdsskmet9ac9kik.public.blob.vercel-storage.com/', 'https://assets.faith-interactive.com/')::jsonb
WHERE "variants" IS NOT NULL AND "variants"::text LIKE '%nzdsskmet9ac9kik.public.blob.vercel-storage.com%';

COMMIT;

-- ==============================================================================
-- Verification Query - Run after migration to ensure no old URLs remain
-- ==============================================================================
/*
SELECT 'MarketingSiteSettings.faviconUrl' as location, COUNT(*) as count FROM "MarketingSiteSettings" WHERE "faviconUrl" LIKE '%nzdsskmet9ac9kik%'
UNION ALL
SELECT 'MarketingPage.ogImage', COUNT(*) FROM "MarketingPage" WHERE "ogImage" LIKE '%nzdsskmet9ac9kik%'
UNION ALL
SELECT 'MarketingPage.blocks', COUNT(*) FROM "MarketingPage" WHERE "blocks"::text LIKE '%nzdsskmet9ac9kik%'
UNION ALL
SELECT 'BlogPost.featuredImage', COUNT(*) FROM "BlogPost" WHERE "featuredImage" LIKE '%nzdsskmet9ac9kik%'
UNION ALL
SELECT 'BlogPost.ogImage', COUNT(*) FROM "BlogPost" WHERE "ogImage" LIKE '%nzdsskmet9ac9kik%'
UNION ALL
SELECT 'BlogPost.blocks', COUNT(*) FROM "BlogPost" WHERE "blocks"::text LIKE '%nzdsskmet9ac9kik%'
UNION ALL
SELECT 'CaseStudy.logo', COUNT(*) FROM "CaseStudy" WHERE "logo" LIKE '%nzdsskmet9ac9kik%'
UNION ALL
SELECT 'CaseStudy.images', COUNT(*) FROM "CaseStudy" WHERE "images"::text LIKE '%nzdsskmet9ac9kik%'
UNION ALL
SELECT 'CaseStudy.beforeImage', COUNT(*) FROM "CaseStudy" WHERE "beforeImage" LIKE '%nzdsskmet9ac9kik%'
UNION ALL
SELECT 'CaseStudy.afterImage', COUNT(*) FROM "CaseStudy" WHERE "afterImage" LIKE '%nzdsskmet9ac9kik%'
UNION ALL
SELECT 'Testimonial.image', COUNT(*) FROM "Testimonial" WHERE "image" LIKE '%nzdsskmet9ac9kik%'
UNION ALL
SELECT 'PlatformMedia.storagePath', COUNT(*) FROM "PlatformMedia" WHERE "storagePath" LIKE '%nzdsskmet9ac9kik%'
UNION ALL
SELECT 'PlatformMedia.variants', COUNT(*) FROM "PlatformMedia" WHERE "variants"::text LIKE '%nzdsskmet9ac9kik%';
*/
