# Cloudflare Deployment Guide

This guide walks through deploying the Faith Interactive application to Cloudflare Pages with Workers.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#step-1-database-setup)
3. [Cloudflare R2 Storage](#step-2-cloudflare-r2-storage)
4. [Cloudflare KV for Rate Limiting](#step-3-cloudflare-kv-for-rate-limiting)
5. [Project Configuration](#step-4-project-configuration)
6. [Environment Variables](#step-5-environment-variables)
7. [Run Database Migrations](#step-6-run-database-migrations)
8. [Deploy to Cloudflare Pages](#step-7-deploy-to-cloudflare-pages)
9. [Custom Domain Setup](#step-8-custom-domain-setup)
10. [Post-Deployment Verification](#step-9-post-deployment-verification)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- [ ] A Cloudflare account (free tier works for testing)
- [ ] Node.js 18+ installed locally
- [ ] Git repository with the project code
- [ ] Access to a PostgreSQL database (Neon, Supabase, or similar)

---

## Step 1: Database Setup

The application uses PostgreSQL with Prisma ORM. For Cloudflare deployment, use a serverless-compatible PostgreSQL provider.

### Option A: Neon (Recommended)

1. **Create a Neon account** at [neon.tech](https://neon.tech)

2. **Create a new project**
   - Choose a region close to your users
   - Note the connection string provided

3. **Enable connection pooling**
   - Go to your project dashboard
   - Navigate to "Connection Details"
   - Copy the "Pooled connection string" (uses `-pooler` suffix)

4. **Format your DATABASE_URL**
   ```
   postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```

### Option B: Supabase

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Get the connection string**
   - Go to Settings > Database
   - Copy the "Connection string" (URI format)
   - Use the "Session mode" pooler for Prisma

---

## Step 2: Cloudflare R2 Storage

R2 provides S3-compatible object storage for media uploads.

### Create R2 Bucket

1. **Log into Cloudflare Dashboard**

2. **Navigate to R2 Object Storage**
   - Click "Create bucket"
   - Name: `fi-media` (or your preferred name)
   - Location: Auto (or choose specific region)

3. **Enable Public Access**
   - Go to bucket Settings > Public Access
   - Enable "Allow Access"
   - Note the public URL: `https://pub-xxx.r2.dev`

4. **Create API Token**
   - Go to R2 > Manage R2 API Tokens
   - Click "Create API token"
   - Permissions: Object Read & Write
   - Specify bucket: `fi-platform`
   - Save the Access Key ID and Secret Access Key

5. **Get R2 Endpoint**
   - Format: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
   - Find your Account ID in the Cloudflare dashboard URL or Overview page

### Environment Variables for R2

```
S3_BUCKET=fi-platform
S3_REGION=auto
S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=<your-access-key>
S3_SECRET_ACCESS_KEY=<your-secret-key>
S3_PUBLIC_URL=https://assets.fi-platform.com
```

---

## Step 3: Cloudflare KV for Rate Limiting

The application includes rate limiting that needs persistent storage in a serverless environment.

### Create KV Namespace

1. **In Cloudflare Dashboard**, go to Workers & Pages > KV

2. **Create a namespace**
   - Click "Create a namespace"
   - Name: `fi-rate-limit`
   - Note the Namespace ID

### Update Middleware (Optional Enhancement)

The current in-memory rate limiter works but resets on cold starts. For production, consider implementing KV-based rate limiting:

```typescript
// This is optional - the current implementation works for most use cases
// KV-based rate limiting provides persistence across worker instances
```

---

## Step 4: Project Configuration

### Install Dependencies

```bash
npm install -D @cloudflare/next-on-pages wrangler
```

### Create wrangler.toml

Create `wrangler.toml` in the project root:

```toml
name = "fi-app"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

# Pages configuration
pages_build_output_dir = ".vercel/output/static"

# KV Namespace binding (for rate limiting)
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "<your-kv-namespace-id>"

# R2 Bucket binding (optional - can use env vars instead)
[[r2_buckets]]
binding = "MEDIA_BUCKET"
bucket_name = "fi-media"

# Environment variables (non-secrets)
[vars]
NODE_ENV = "production"
NEXT_PUBLIC_APP_URL = "https://faith-interactive.com"
```

### Update package.json Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "pages:build": "npx @cloudflare/next-on-pages",
    "pages:preview": "wrangler pages dev .vercel/output/static",
    "pages:deploy": "wrangler pages deploy .vercel/output/static"
  }
}
```

### Create .dev.vars for Local Development

Create `.dev.vars` (gitignored) for local Wrangler development:

```
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret-min-32-chars
S3_BUCKET=fi-media
S3_REGION=auto
S3_ENDPOINT=https://xxx.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=xxx
S3_SECRET_ACCESS_KEY=xxx
S3_PUBLIC_URL=https://pub-xxx.r2.dev
```

---

## Step 5: Environment Variables

### Required Variables

Set these in Cloudflare Pages > Settings > Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string (pooled) | `postgresql://user:pass@host/db` |
| `JWT_SECRET` | Min 32 character secret for auth tokens | `your-secure-random-string-here` |
| `SESSION_DURATION_DAYS` | How long sessions last | `7` |
| `NEXT_PUBLIC_APP_URL` | Your production URL | `https://faith-interactive.com` |
| `S3_BUCKET` | R2 bucket name | `fi-media` |
| `S3_REGION` | Always "auto" for R2 | `auto` |
| `S3_ENDPOINT` | R2 endpoint URL | `https://xxx.r2.cloudflarestorage.com` |
| `S3_ACCESS_KEY_ID` | R2 access key | `xxx` |
| `S3_SECRET_ACCESS_KEY` | R2 secret key | `xxx` |
| `S3_PUBLIC_URL` | Public URL for uploaded files | `https://pub-xxx.r2.dev` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PASSWORD_RESET_EXPIRATION_HOURS` | Password reset token lifetime | `1` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `RATE_LIMIT_WINDOW_SECONDS` | Rate limit window | `60` |
| `LOG_LEVEL` | Logging verbosity | `info` |

### Setting Variables in Cloudflare

1. Go to **Workers & Pages** > Your project > **Settings**
2. Click **Environment Variables**
3. Add each variable
4. Mark sensitive values as **Encrypted** (DATABASE_URL, JWT_SECRET, S3 credentials)
5. Set for both **Production** and **Preview** environments

---

## Step 6: Run Database Migrations

Before deploying, run migrations against your production database.

```bash
# Option 1: Set temporarily in your shell
export DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require"
npx prisma migrate deploy

# Option 2: Inline (doesn't persist)
DATABASE_URL="your-connection-string" npx prisma migrate deploy
```

If this is a fresh database, also seed the initial data:

```bash
DATABASE_URL="your-connection-string" npm run db:seed
```

> **Note:** You only need to run migrations when there are schema changes. The Prisma client is generated during the build process automatically.

---

## Step 7: Deploy to Cloudflare Pages

### Option A: GitHub Integration (Recommended)

1. **Connect Repository**
   - Go to Workers & Pages > Create application > Pages
   - Connect to Git > Select your repository
   - Authorize Cloudflare access

2. **Configure Build Settings**
   ```
   Framework preset: Next.js
   Build command: npx @cloudflare/next-on-pages
   Build output directory: .vercel/output/static
   Root directory: / (or your app directory)
   ```

3. **Set Environment Variables**
   - Add all required variables before first deploy

4. **Deploy**
   - Click "Save and Deploy"
   - Wait for build to complete (5-10 minutes first time)

### Option B: Direct Deploy via CLI

```bash
# Login to Cloudflare
wrangler login

# Build the application
npm run build
npm run pages:build

# Deploy to Pages
npm run pages:deploy

# Or create a new Pages project
wrangler pages project create fi-app

# Then deploy
wrangler pages deploy .vercel/output/static --project-name=fi-app
```

---

## Step 8: Custom Domain Setup

### Add Custom Domain

1. **In Pages Project Settings**, go to Custom domains

2. **Add domain**
   - Enter: `faith-interactive.com`
   - Cloudflare will verify DNS

3. **Configure DNS** (if domain is on Cloudflare)
   - Automatic: Cloudflare adds the CNAME record
   - Manual: Add CNAME pointing to `<project>.pages.dev`

### Multi-Tenant Subdomains

For the multi-tenant architecture, configure:

```
faith-interactive.com        → Marketing site
admin.faith-interactive.com  → Admin dashboard
platform.faith-interactive.com → Platform admin
*.faith-interactive.com      → Tenant sites (wildcard)
```

**Wildcard DNS:**
1. Go to DNS settings for your domain
2. Add: `* CNAME <project>.pages.dev` (proxied)

**SSL/TLS:**
1. Go to SSL/TLS > Edge Certificates
2. Ensure "Full (strict)" mode is enabled
3. Order Advanced Certificate for wildcard coverage if needed

---

## Step 9: Post-Deployment Verification

### Verify Core Functionality

Run through this checklist after deployment:

- [ ] **Homepage loads** - Visit your domain
- [ ] **Auth works** - Try logging in
- [ ] **Database connected** - Create/edit content
- [ ] **File uploads work** - Upload an image in media library
- [ ] **Multi-tenant routing** - Test subdomain access
- [ ] **Custom domains** - Test any configured tenant domains

### Test API Endpoints

```bash
# Health check (if implemented)
curl https://faith-interactive.com/api/health

# Check auth endpoint responds
curl -X POST https://faith-interactive.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

### Monitor Logs

1. Go to Workers & Pages > Your project > **Logs**
2. Enable Real-time Logs for debugging
3. Check for errors in the console

---

## Troubleshooting

### Common Issues

#### Build Fails: "Edge runtime not supported"

Some Node.js APIs aren't available in Workers. Check for:
- `fs` module usage (use R2 instead)
- Native Node modules

**Solution:** Ensure code paths that use Node-specific features are server-only.

#### Database Connection Timeouts

**Cause:** Connection pool exhaustion or missing pooler.

**Solution:**
- Use pooled connection string (with `-pooler` suffix for Neon)
- Add `?connection_limit=1` to DATABASE_URL for serverless

#### File Uploads Failing

**Cause:** R2 credentials or CORS issues.

**Solution:**
1. Verify R2 credentials are correct
2. Check bucket permissions allow public read
3. Verify S3_ENDPOINT format is correct

#### Rate Limiting Not Working

**Cause:** In-memory rate limiter resets on cold starts.

**Solution:** This is expected behavior. For strict rate limiting, implement KV-based storage.

#### Middleware Routing Issues

**Cause:** Hostname matching not working correctly.

**Solution:**
1. Check `NEXT_PUBLIC_APP_URL` is set correctly
2. Verify DNS is properly configured
3. Check middleware logs for hostname detection

### Debug Mode

Enable verbose logging temporarily:

```
LOG_LEVEL=debug
```

Then check Pages logs for detailed output.

### Getting Help

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [next-on-pages GitHub](https://github.com/cloudflare/next-on-pages)
- [Prisma Edge Deployment](https://www.prisma.io/docs/guides/deployment/edge)

---

## Deployment Checklist Summary

```
[ ] Database provisioned and migrated
[ ] R2 bucket created with public access
[ ] KV namespace created (optional)
[ ] wrangler.toml configured
[ ] Environment variables set in Cloudflare
[ ] GitHub integration connected (or CLI deploy)
[ ] Custom domain configured
[ ] SSL certificate active
[ ] Wildcard DNS for multi-tenant (if needed)
[ ] Post-deployment verification complete
```

---

## Updating the Application

### Automatic Deploys (GitHub Integration)

Push to your main branch triggers automatic deployment:

```bash
git add .
git commit -m "Update application"
git push origin main
```

### Manual Deploy

```bash
npm run build
npm run pages:build
npm run pages:deploy
```

### Database Migrations

Run migrations before deploying code that depends on schema changes:

```bash
DATABASE_URL="your-production-url" npx prisma migrate deploy
```

---

## Cost Considerations

### Cloudflare Free Tier Includes:
- 100,000 requests/day on Workers
- 10 GB R2 storage
- 1 GB R2 egress/month (then $0.015/GB)
- Unlimited KV reads, 1,000 writes/day

### When to Upgrade:
- High traffic: Workers Paid ($5/month) for 10M requests
- Large media library: R2 pricing is very competitive
- Custom SSL for wildcards: May need Advanced Certificate Manager

---

*Last updated: January 2025*
