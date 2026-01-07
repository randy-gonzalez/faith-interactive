# Cloudflare Deployment Guide

Complete guide to deploying Faith Interactive to Cloudflare Pages.

---

## Overview

This deployment uses:
- **Cloudflare Pages** - Hosts the Next.js application
- **Cloudflare R2** - S3-compatible storage for media uploads
- **Cloudflare KV** - Rate limiting storage
- **External PostgreSQL** - Database (Neon recommended)

**Estimated setup time:** 30-45 minutes

---

## Prerequisites

- Cloudflare account (free tier works)
- GitHub repository with this codebase
- PostgreSQL database (Neon, Supabase, or similar)

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

**Important:** Use the pooled connection (has `-pooler` in the hostname). This is required for serverless environments.

---

## Step 2: Create R2 Storage Bucket

### In Cloudflare Dashboard:

1. Go to **R2 Object Storage** in the left sidebar
2. Click **Create bucket**
   - Name: `fi-platform` (or your preferred name)
   - Location: Leave as default
3. Click **Create bucket**

### Enable Public Access:

1. Click on your new bucket
2. Go to **Settings** tab
3. Under **Public access**, click **Allow Access**
4. Copy the **Public bucket URL** (looks like `https://pub-xxxx.r2.dev`)

### Create API Credentials:

1. Go back to **R2 Object Storage** main page
2. Click **Manage R2 API Tokens** (right side)
3. Click **Create API token**
4. Configure:
   - **Token name:** `fi-platform-access`
   - **Permissions:** Object Read & Write
   - **Specify bucket:** Select your bucket
5. Click **Create API Token**
6. **SAVE THESE VALUES** (shown only once):
   - Access Key ID
   - Secret Access Key

### Find Your Account ID:

1. Go to any page in Cloudflare Dashboard
2. Look at the URL: `https://dash.cloudflare.com/XXXXXXXXX/...`
3. The string after `cloudflare.com/` is your Account ID
4. Your R2 endpoint is: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`

---

## Step 3: Create KV Namespace

1. Go to **Workers & Pages** → **KV** in the left sidebar
2. Click **Create a namespace**
3. Name: `fi-rate-limit`
4. Click **Add**
5. Note the **Namespace ID** (you'll need this later)

---

## Step 4: Connect GitHub Repository

1. Go to **Workers & Pages** in the left sidebar
2. Click **Create** → **Pages** → **Connect to Git**
3. Select **GitHub** and authorize Cloudflare
4. Select your repository
5. Configure build settings:

| Setting | Value |
|---------|-------|
| **Project name** | `fi-platform` |
| **Production branch** | `main` |
| **Build command** | `npm run build && npx opennextjs-cloudflare build` |
| **Build output directory** | `.open-next` |

6. **Don't deploy yet** - click **Save** without deploying (we need to add environment variables first)

---

## Step 5: Configure Environment Variables

Go to your Pages project → **Settings** → **Environment variables**

### Required Variables (Add All)

Click **Add variable** for each:

| Variable | Value | Encrypt? |
|----------|-------|----------|
| `DATABASE_URL` | Your Neon pooled connection string | Yes |
| `JWT_SECRET` | Random 32+ character string (generate one) | Yes |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.com` | No |
| `NEXT_PUBLIC_BASE_URL` | `https://your-domain.com` | No |
| `NEXT_PUBLIC_MAIN_DOMAIN` | `your-domain.com` (no https) | No |
| `S3_BUCKET` | Your R2 bucket name | No |
| `S3_REGION` | `auto` | No |
| `S3_ENDPOINT` | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` | No |
| `S3_ACCESS_KEY_ID` | Your R2 access key | Yes |
| `S3_SECRET_ACCESS_KEY` | Your R2 secret key | Yes |
| `S3_PUBLIC_URL` | Your R2 public URL (`https://pub-xxx.r2.dev`) | No |
| `SESSION_DURATION_DAYS` | `7` | No |
| `PASSWORD_RESET_EXPIRATION_HOURS` | `1` | No |
| `FORM_TIMESTAMP_SECRET` | Random 32+ character string | Yes |

**To generate random secrets:**
```bash
openssl rand -base64 32
```

### Set for Both Environments

Make sure each variable is set for:
- ✅ Production
- ✅ Preview

---

## Step 6: Add Bindings

Go to your Pages project → **Settings** → **Bindings**

### Add KV Namespace:

1. Click **+ Add**
2. Select **KV namespace**
3. Configure:
   - **Variable name:** `RATE_LIMIT_KV`
   - **KV namespace:** Select `fi-rate-limit`
4. Click **Save**

### Add Images Binding (Optional):

1. Click **+ Add**
2. Select **Images**
3. Configure:
   - **Variable name:** `IMAGES`
4. Click **Save**

> **Note:** If the Images binding doesn't save, that's okay. The app will work without it - images just won't be resized on upload.

---

## Step 7: Run Database Migrations

Before deploying, set up your database schema.

**On your local machine:**

```bash
# Set your production database URL temporarily
export DATABASE_URL="postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require"

# Run migrations
npx prisma migrate deploy

# Seed initial data (creates platform admin user)
npm run db:seed
```

**Default login credentials after seeding:**
- Email: `randy@shiftagency.com`
- Password: `password123`

> ⚠️ **Change this password immediately after first login!**

---

## Step 8: Deploy

### Option A: Trigger from Dashboard

1. Go to your Pages project
2. Click **Deployments** tab
3. Click **Retry deployment** or push a commit to trigger

### Option B: Push to GitHub

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

The deployment will:
1. Clone your repository
2. Install dependencies
3. Run `npm run build` (includes Prisma generate)
4. Run `opennextjs-cloudflare build`
5. Deploy to Cloudflare's edge network

**First deployment takes ~3-5 minutes.** Watch the build logs for any errors.

---

## Step 9: Configure Custom Domain

### Add Your Domain:

1. Go to your Pages project → **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `faith-interactive.com`)
4. Follow the DNS verification steps

### For Multi-Tenant (Wildcard Subdomains):

If you want tenant sites on subdomains like `demo.faith-interactive.com`:

1. Go to your domain's **DNS settings** in Cloudflare
2. Add a wildcard record:
   - **Type:** CNAME
   - **Name:** `*`
   - **Target:** `your-project.pages.dev`
   - **Proxy status:** Proxied (orange cloud)

3. Go to **SSL/TLS** → **Edge Certificates**
4. Ensure you have a certificate covering `*.your-domain.com`
   - Free Universal SSL covers the apex and `www`
   - For wildcards, you may need Advanced Certificate Manager ($10/month)

---

## Step 10: Post-Deployment Setup

### First Login:

1. Visit `https://your-domain.com/p/login` (platform admin)
2. Login with the seeded credentials
3. **Immediately change your password**

### Create Your First Church:

1. Go to Platform Admin → Churches
2. Click **New Church**
3. Enter church name and slug
4. The church will be accessible at `https://slug.your-domain.com`

### Invite Church Admins:

1. Go to the church admin panel (`/a/settings/team`)
2. Click **Invite Team Member**
3. Enter their email and select role
4. They'll receive an invitation email

---

## Verification Checklist

After deployment, verify these work:

- [ ] Homepage loads at your domain
- [ ] Platform admin login works (`/p/login`)
- [ ] Can create a new church
- [ ] Church admin panel works (`/a/dashboard`)
- [ ] Can upload images in media library
- [ ] Tenant subdomain routing works
- [ ] Email sending works (invite flow)

---

## Troubleshooting

### Build Fails

**Check the build logs** in Cloudflare Pages → Deployments → Click failed deployment

Common issues:
- **Missing environment variables** - Add all required vars
- **pnpm lockfile outdated** - Run `pnpm install` locally and push
- **TypeScript errors** - Fix locally before pushing

### Database Connection Errors

- Verify `DATABASE_URL` is the **pooled** connection string
- Check the password doesn't have special characters that need URL encoding
- Ensure the database is accessible (not IP-restricted)

### File Uploads Failing

- Verify all S3_* environment variables are set
- Check R2 bucket has public access enabled
- Verify the API token has read/write permissions

### Rate Limiting Errors

- Ensure KV binding is configured with variable name `RATE_LIMIT_KV`
- Check the KV namespace exists

### Pages Shows "No Functions"

- This is normal for OpenNext - it bundles everything into a single worker
- The app should still work

---

## Updating the Application

### Automatic (Recommended)

Push to `main` branch triggers automatic deployment:

```bash
git push origin main
```

### Database Schema Changes

When you have Prisma schema changes:

```bash
# Generate migration locally
npx prisma migrate dev --name description_of_change

# Deploy to production
DATABASE_URL="your-prod-url" npx prisma migrate deploy

# Then push code
git push origin main
```

---

## Cost Summary

### Free Tier Includes:
- 100,000 worker requests/day
- 10 GB R2 storage
- 10 million KV reads/month
- 1 million KV writes/month
- Unlimited static asset bandwidth

### Paid Features You Might Need:
- **Wildcard SSL certificate** - $10/month (Advanced Certificate Manager)
- **More worker requests** - $5/month for 10M requests
- **Image transformations** - $0.50/1000 unique transformations

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Edge                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Pages      │    │     R2       │    │     KV       │  │
│  │  (Next.js)   │───▶│   Storage    │    │ Rate Limit   │  │
│  │              │    │              │    │              │  │
│  └──────┬───────┘    └──────────────┘    └──────────────┘  │
│         │                                                   │
└─────────┼───────────────────────────────────────────────────┘
          │
          ▼
    ┌──────────────┐
    │   Neon       │
    │  PostgreSQL  │
    │   (Pooled)   │
    └──────────────┘
```

---

## Quick Reference

| Resource | URL |
|----------|-----|
| Cloudflare Dashboard | https://dash.cloudflare.com |
| Pages Project | Workers & Pages → Your Project |
| Build Logs | Deployments → Click deployment |
| Environment Variables | Settings → Environment variables |
| Bindings | Settings → Bindings |
| Custom Domains | Custom domains tab |

---

*Last updated: January 2026*
