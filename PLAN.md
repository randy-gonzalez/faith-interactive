# Migration Plan: Cloudflare Workers → Vercel

## Overview
Migrate the Faith Interactive marketing site from Cloudflare Workers to Vercel deployment. This involves removing Cloudflare-specific dependencies/configuration and upgrading to the latest Next.js.

---

## Phase 1: Remove Cloudflare Dependencies

### 1.1 Remove Cloudflare packages from package.json
- Remove `@opennextjs/cloudflare` from devDependencies
- Remove `wrangler` from devDependencies
- Remove or update the `preview` and `deploy` scripts (they reference opennextjs-cloudflare)

### 1.2 Delete Cloudflare configuration files
- Delete `wrangler.jsonc`
- Delete `.wrangler/` directory (if exists)
- Delete `.open-next/` directory (if exists)

### 1.3 Remove Cloudflare-specific code
- Delete `lib/storage/image-cloudflare.ts` (Cloudflare Images binding)
- Update `lib/storage/image.ts` to remove Cloudflare environment detection
- Update any API routes that pass Cloudflare env to image processor

---

## Phase 2: Update Next.js Configuration

### 2.1 Upgrade Next.js to 16
- Upgrade `next` from 15.5.9 to Next.js 16 (latest)
- Update related packages as needed (React 19, etc.)

### 2.2 Update next.config.ts for Vercel
- Re-enable image optimization (change `unoptimized: true` to `unoptimized: false` or remove)
- Remove `sharp` from `serverExternalPackages` (Sharp works natively on Vercel)
- Keep all existing security headers and caching configuration

---

## Phase 3: Database Configuration

### 3.1 Keep Prisma + Neon HTTP adapter
The current setup with `@prisma/adapter-neon` works perfectly on Vercel:
- Supports serverless functions with connection pooling
- No cold start connection issues
- Works with edge runtime if needed later

No changes required to:
- `prisma/schema.prisma`
- `lib/db/prisma.ts`
- `lib/db/neon.ts`

---

## Phase 4: Environment Variables (Vercel Dashboard)

After connecting to Vercel, configure these environment variables:

### Required
- `DATABASE_URL` - Neon PostgreSQL connection string
- `NEXT_PUBLIC_APP_URL` - Production URL
- `NEXT_PUBLIC_BASE_URL` - Same as APP_URL
- `NEXT_PUBLIC_MAIN_DOMAIN` - Main domain

### Optional (if using features)
- `JWT_SECRET` - For session management
- `S3_*` variables - For media storage (R2/S3)
- `IMAGE_PROCESSING_ENABLED` - Set to `true` (Sharp will work on Vercel)

---

## Phase 5: Deployment

### 5.1 Connect to Vercel
1. Import GitHub repository to Vercel
2. Vercel auto-detects Next.js
3. Configure environment variables
4. Deploy

### 5.2 Build settings (auto-detected)
- Framework: Next.js
- Build Command: `prisma generate && next build`
- Install Command: `pnpm install`

---

## Files to Modify

| File | Action |
|------|--------|
| `package.json` | Remove Cloudflare deps, update scripts, upgrade to Next.js 16 |
| `next.config.ts` | Re-enable image optimization, remove Sharp exclusion |
| `wrangler.jsonc` | Delete |
| `lib/storage/image-cloudflare.ts` | Delete (if exists) |
| `lib/storage/image.ts` | Remove Cloudflare detection (if present) |
| `.gitignore` | Remove `.wrangler` entry |

---

## Files That Remain Unchanged

- `prisma/schema.prisma` - Works as-is
- `lib/db/prisma.ts` - Neon adapter works on Vercel
- `lib/db/neon.ts` - HTTP client works on Vercel
- All `app/` routes and pages - Fully compatible
- All API routes - Work unchanged

---

## Post-Deployment Verification

1. Test health endpoint: `GET /api/health`
2. Test consultation form submission
3. Verify all pages load correctly
4. Check Vercel logs for errors
5. Verify database connectivity
