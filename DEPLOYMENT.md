# Vercel Deployment Guide

Complete guide to deploying Faith Interactive Marketing Site to Vercel.

---

## Overview

This deployment uses:
- **Vercel** - Hosts the Next.js 16 application
- **Neon** - Serverless PostgreSQL database
- **Cloudflare R2** (or S3) - Media storage (optional)

---

## Prerequisites

- Vercel account (free tier works)
- GitHub repository with this codebase
- Neon PostgreSQL database

---

## Step 1: Create PostgreSQL Database

### Using Neon (Recommended)

1. Go to [neon.tech](https://neon.tech) and create an account
2. Click **New Project**
3. Choose a name and region (pick one close to your users)
4. After creation, go to **Dashboard** → **Connection Details**
5. Copy the **Pooled connection string** - it looks like:
   ```
   postgresql://user:password@ep-xxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

**Important:** Use the pooled connection (has `-pooler` in the hostname). This is optimal for serverless environments.

---

## Step 2: Connect to Vercel

### Option A: Via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Vercel auto-detects Next.js - no configuration needed
5. Click **Deploy** (it will fail initially - we need env vars)

### Option B: Via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Link and deploy
vercel link
vercel deploy
```

---

## Step 3: Configure Environment Variables

Go to your Vercel project → **Settings** → **Environment Variables**

### Required Variables

| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_URL` | Your Neon pooled connection string | All |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.com` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` | Preview |
| `NEXT_PUBLIC_BASE_URL` | Same as APP_URL | All |
| `NEXT_PUBLIC_MAIN_DOMAIN` | `your-domain.com` (no https) | All |

### Optional Variables (if using media storage)

| Variable | Value |
|----------|-------|
| `S3_BUCKET` | Your R2/S3 bucket name |
| `S3_REGION` | `auto` (for R2) or AWS region |
| `S3_ENDPOINT` | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` |
| `S3_ACCESS_KEY_ID` | Your access key |
| `S3_SECRET_ACCESS_KEY` | Your secret key |
| `S3_PUBLIC_URL` | Public URL for the bucket |
| `IMAGE_PROCESSING_ENABLED` | `true` |

### Other Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | - | For session management |
| `SESSION_DURATION_DAYS` | `7` | Session length |
| `RATE_LIMIT_MAX` | `100` | Requests per window |
| `RATE_LIMIT_WINDOW_SECONDS` | `60` | Rate limit window |

**To generate random secrets:**
```bash
openssl rand -base64 32
```

---

## Step 4: Run Database Migrations

Before the first deployment, set up your database schema.

**On your local machine:**

```bash
# Set your production database URL temporarily
export DATABASE_URL="postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require"

# Run migrations
npx prisma migrate deploy
```

Or add a build hook in Vercel:
- Go to **Settings** → **General** → **Build & Development Settings**
- Override the build command: `prisma migrate deploy && prisma generate && next build`

---

## Step 5: Deploy

### Automatic Deployment

Push to your `main` branch triggers automatic deployment:

```bash
git push origin main
```

### Manual Deployment

```bash
vercel deploy --prod
```

---

## Step 6: Configure Custom Domain

1. Go to your Vercel project → **Settings** → **Domains**
2. Add your domain (e.g., `faith-interactive.com`)
3. Follow DNS configuration instructions:
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Or use Vercel's nameservers for full DNS management

Vercel automatically provisions SSL certificates.

---

## Verification Checklist

After deployment, verify these work:

- [ ] Homepage loads at your domain
- [ ] Health check returns OK (`/api/health`)
- [ ] Contact form submission works
- [ ] All pages render correctly
- [ ] Images load properly

---

## Troubleshooting

### Build Fails

Check the build logs in Vercel → **Deployments** → Click failed deployment

Common issues:
- **Missing environment variables** - Add all required vars
- **TypeScript errors** - Fix locally before pushing
- **Prisma generate fails** - Ensure DATABASE_URL is set

### Database Connection Errors

- Verify `DATABASE_URL` uses the **pooled** connection string
- Check password doesn't have special characters needing URL encoding
- Ensure database allows connections from Vercel IPs (Neon allows all by default)

### Middleware Warning

Next.js 16 shows a deprecation warning about middleware → proxy migration. The current middleware still works. Migration to the new proxy pattern is optional.

---

## Updating the Application

### Code Changes

Push to `main` triggers automatic deployment:

```bash
git push origin main
```

### Database Schema Changes

```bash
# Generate migration locally
npx prisma migrate dev --name description_of_change

# Commit the migration
git add prisma/migrations
git commit -m "Add migration: description"

# Push (Vercel will run migrate deploy during build)
git push origin main
```

---

## Cost Summary

### Vercel Free Tier (Hobby)

- 100 GB bandwidth/month
- Serverless function invocations: 100 GB-hours
- Edge function invocations: 500,000
- Automatic HTTPS
- Preview deployments

### Vercel Pro ($20/user/month)

- 1 TB bandwidth
- More function execution time
- Team features
- Advanced analytics

### Neon Free Tier

- 0.5 GB storage
- 1 project
- Autoscaling compute

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Vercel Edge                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Next.js 16 Application                   │  │
│  │                                                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │  │
│  │  │   Pages     │  │     API     │  │  Middleware │   │  │
│  │  │   (SSR)     │  │   Routes    │  │ (Rate Limit)│   │  │
│  │  └─────────────┘  └──────┬──────┘  └─────────────┘   │  │
│  │                          │                            │  │
│  └──────────────────────────┼────────────────────────────┘  │
│                             │                               │
└─────────────────────────────┼───────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │       Neon       │
                    │    PostgreSQL    │
                    │  (HTTP Adapter)  │
                    └──────────────────┘
```

---

## Quick Reference

| Resource | URL |
|----------|-----|
| Vercel Dashboard | https://vercel.com/dashboard |
| Project Settings | Your Project → Settings |
| Deployments | Your Project → Deployments |
| Environment Variables | Settings → Environment Variables |
| Domains | Settings → Domains |
| Logs | Your Project → Logs |

---

*Last updated: January 2026*
