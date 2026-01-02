# Faith Interactive (Fi)

Multi-tenant SaaS platform for churches. This includes:
- **Phase 0**: Core infrastructure and authentication
- **Phase 1**: CMS dashboard and content management
- **Phase 2**: Public website rendering
- **Phase 3**: Platform panel for Fi staff

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your PostgreSQL connection string

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed demo data
npm run db:seed

# Add to /etc/hosts for subdomain testing
echo "127.0.0.1 demo.localhost" | sudo tee -a /etc/hosts
echo "127.0.0.1 hope-community.localhost" | sudo tee -a /etc/hosts

# Start development server
npm run dev
```

### Access Points

| Site | URL | Description |
|------|-----|-------------|
| Grace Community Church | http://demo.localhost:3000 | Demo church #1 |
| Hope Community Church | http://hope-community.localhost:3000 | Demo church #2 |
| Marketing Site | http://localhost:3000 | Faith Interactive marketing site |
| Platform Admin | http://localhost:3000/platform | Fi staff admin panel |

### Test Credentials

All accounts use password: `password123`

**Grace Community Church (demo.localhost):**
| Role | Email | Notes |
|------|-------|-------|
| Admin | `admin@example.com` | Full access + PLATFORM_ADMIN |
| Editor | `editor@example.com` | Can edit content |
| Viewer | `viewer@example.com` | Read-only access |

**Hope Community Church (hope-community.localhost):**
| Role | Email |
|------|-------|
| Admin | `admin@hopecommunity.example.com` |
| Editor | `editor@hopecommunity.example.com` |

---

## Architecture

### Multi-Tenant Model

Every request is scoped to a church (tenant) via subdomain:

```
https://grace-community.faithinteractive.com
        └──────────────┘
             tenant slug
```

**Data isolation** is enforced at multiple levels:
1. **Middleware** - Extracts tenant from subdomain
2. **Prisma Extensions** - Auto-filters all queries by `churchId`
3. **Database constraints** - Foreign keys ensure referential integrity

### Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: Database sessions (not JWT-only)
- **Styling**: Tailwind CSS

---

## Route Structure

### Public Website (No auth required)

| Route | Description |
|-------|-------------|
| `/` | Home page (configurable or default welcome) |
| `/sermons` | Sermon listing |
| `/sermons/[id]` | Sermon detail with video/audio |
| `/events` | Events calendar |
| `/events/[id]` | Event detail |
| `/staff` | Leadership profiles |
| `/contact` | Contact form with map |
| `/p/[slug]` | Published pages |

### Admin Dashboard (Auth required)

| Route | Description | Access |
|-------|-------------|--------|
| `/admin` | Redirects to dashboard | All |
| `/admin/dashboard` | Dashboard home | All |
| `/admin/pages` | Manage pages | Editor+ |
| `/admin/sermons` | Manage sermons | Editor+ |
| `/admin/events` | Manage events | Editor+ |
| `/admin/announcements` | Manage announcements | Editor+ |
| `/admin/leadership` | Manage staff profiles | Editor+ |
| `/admin/settings` | Site settings | Editor+ |
| `/admin/team` | Team management | Admin |

### Platform Dashboard (Platform staff only)

| Route | Description | Access |
|-------|-------------|--------|
| `/platform` | Overview dashboard | Platform User |
| `/platform/churches` | Church management | Platform User |
| `/platform/churches/new` | Create new church | Platform Admin |
| `/platform/churches/[id]` | Church detail & users | Platform User |
| `/platform/marketing/pages` | Marketing pages | Platform User |
| `/platform/marketing/pages/new` | Create marketing page | Platform Admin |
| `/platform/marketing/pages/[id]` | Edit marketing page | Platform Admin |
| `/platform/marketing/settings` | Marketing site settings | Platform Admin |
| `/platform/audit-log` | Platform audit log | Platform User |

---

## Site Settings

Configure your church website in the dashboard under **Site Settings**:

### Header
- Logo URL
- Navigation links (select from published pages)

### Home Page
- Choose a page as home, or use default welcome

### Service Times & Location
- Service schedule
- Address
- Phone
- Contact email
- Google Maps embed URL

### Footer
- Footer text
- Footer navigation links
- Social media URLs (Facebook, Instagram, YouTube)

### SEO
- Default meta title
- Default meta description
- Favicon URL

### How to get Google Maps Embed URL:
1. Go to Google Maps
2. Search for your church address
3. Click **Share** → **Embed a map**
4. Copy the `src` URL from the iframe code

---

## Contact Form

The contact page includes:
- Contact information display
- Google Maps embed (if configured)
- Contact form with spam protection

### Spam Protection
- **Honeypot field**: Hidden field that bots fill, humans don't
- **Rate limiting**: 5 submissions per hour per IP

### Email Notifications
Contact form submissions are emailed to the address configured in Site Settings → Contact Email.

In development, emails are logged to the console. For production, configure your email provider in `lib/email/send.ts`.

---

## Caching Strategy

Public pages are cached for CDN delivery:

| Route Type | Cache Policy |
|------------|--------------|
| Public pages (`/`, `/sermons`, `/events`, etc.) | 60s cache, 5min stale-while-revalidate |
| Dashboard routes | No cache (private) |
| API routes | No cache (private) |

Works with Cloudflare CDN out of the box.

---

## Project Structure

```
fi-app/
├── app/
│   ├── (auth)/             # Auth pages (login, reset password)
│   ├── (church)/           # Public church website (subdomains)
│   ├── (public)/           # Public page routes
│   ├── admin/              # Admin dashboard (/admin/*)
│   ├── platform/           # Fi staff admin panel (/platform/*)
│   └── api/
│       ├── auth/           # Auth API routes
│       ├── platform/       # Platform API routes
│       └── ...             # Other API routes
├── components/
│   ├── dashboard/          # Dashboard/admin components
│   ├── public/             # Public website components
│   ├── platform/           # Platform admin components
│   └── ui/                 # Reusable UI components
├── lib/
│   ├── auth/               # Authentication logic
│   ├── audit/              # Audit logging (tenant + platform)
│   ├── db/                 # Database clients
│   ├── email/              # Email service
│   ├── logging/            # Centralized logging
│   ├── public/             # Public site utilities
│   ├── security/           # Rate limiting
│   ├── tenant/             # Tenant context
│   └── validation/         # Zod schemas
├── prisma/                  # Database schema
├── scripts/                 # Utility scripts
├── types/                   # TypeScript types
└── middleware.ts            # Request middleware
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/fi_dev` |
| `JWT_SECRET` | Secret for token signing (32+ chars) | Generate with `openssl rand -base64 32` |
| `SESSION_DURATION_DAYS` | Session lifetime | `7` |
| `PASSWORD_RESET_EXPIRATION_HOURS` | Reset token lifetime | `1` |
| `NEXT_PUBLIC_APP_URL` | Base URL | `http://localhost:3000` |
| `NODE_ENV` | Environment | `development` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `RATE_LIMIT_WINDOW_SECONDS` | Rate limit window | `60` |
| `LOG_LEVEL` | Logging verbosity | `debug` |

---

## Database Commands

```bash
# Generate Prisma client after schema changes
npm run db:generate

# Create and run migrations (recommended)
npm run db:migrate

# Push schema to database (development only)
npm run db:push

# Seed demo data
npm run db:seed

# Reset database (development only)
npm run db:reset
```

---

## Content Publishing

All content types support publishing workflow:

| Status | Description |
|--------|-------------|
| **Draft** | Only visible in dashboard |
| **Published** | Visible on public website |

When you publish content:
- `status` is set to `PUBLISHED`
- `publishedAt` timestamp is recorded

Only published content appears on the public website.

---

## Roles & Permissions

### Church Roles (Per-Tenant)

| Role | Content | Team |
|------|---------|------|
| **Admin** | Full access | Full access |
| **Editor** | Create, edit, publish, delete | View only |
| **Viewer** | View only | View only |

### Platform Roles (Fi Staff Only)

| Role | Description | Access |
|------|-------------|--------|
| **PLATFORM_ADMIN** | Full platform access | Create/edit churches, marketing pages, settings |
| **PLATFORM_STAFF** | Limited platform access | View churches, marketing pages, audit log |

Platform roles are **separate** from church roles. A user can have both:
- A church role (for their church dashboard)
- A platform role (for platform panel access)

---

## Platform Panel

The platform panel at `/platform` is for Faith Interactive staff to manage:

### Church Management
- Create new churches (tenants)
- Edit church name, slug, contact email
- Suspend/unsuspend churches
- Soft-delete churches (sets `deletedAt`)
- Manage church users from platform context

### Marketing Website
- Create/edit marketing pages (Home, Pricing, Features, etc.)
- Manage site settings (logo, navigation, footer)
- Configure home page
- Set SEO metadata

### Platform Audit Log
All platform-level actions are logged:
- Church creation/update/suspension/deletion
- Marketing page changes
- Settings updates
- User management actions

### How to Access Platform Panel
1. Navigate to http://localhost:3000/platform
2. Sign in with credentials that have `platformRole` set to `PLATFORM_ADMIN` or `PLATFORM_STAFF`
3. Use `admin@example.com` / `password123` for demo access

---

## Local Development

### Subdomain Setup

For subdomain-based multi-tenancy, add entries to `/etc/hosts`:

```bash
# Add demo tenant
echo "127.0.0.1 demo.localhost" | sudo tee -a /etc/hosts

# Add more tenants as needed
echo "127.0.0.1 grace.localhost" | sudo tee -a /etc/hosts
```

Then access: `http://demo.localhost:3000`

### Running the App

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

---

## Deployment

### Vercel (Recommended)

1. Connect repository to Vercel
2. Set environment variables in Vercel dashboard
3. Configure PostgreSQL (Vercel Postgres, Neon, or Supabase)
4. Deploy

### Cloudflare Setup

The app is designed to work behind Cloudflare:

- **DNS**: Point your domain to Vercel
- **SSL**: Full (strict) mode
- **Proxy**: Enabled for CDN caching
- **Subdomains**: Wildcard `*.faithinteractive.com`

---

## Database Backups

### Manual Backup

```bash
./scripts/backup-db.sh
```

### Automated Backups (Cron)

```bash
# Add to crontab (daily at 2 AM)
0 2 * * * /path/to/fi-app/scripts/backup-db.sh >> /var/log/fi-backup.log 2>&1
```

### Restore

```bash
gunzip -c backups/fi-YYYYMMDD-HHMMSS.sql.gz | psql $DATABASE_URL
```

---

## Security

### Implemented

- ✅ bcrypt password hashing (cost factor 12)
- ✅ Database-backed sessions (revocable)
- ✅ HTTP-only secure cookies
- ✅ CSRF protection (SameSite cookies)
- ✅ Rate limiting (in-memory, foundation)
- ✅ Security headers (CSP, X-Frame-Options, etc.)
- ✅ Input validation (Zod)
- ✅ Tenant isolation (Prisma extensions)
- ✅ Credential filtering in logs
- ✅ Honeypot spam protection
- ✅ Contact form rate limiting

### Production Considerations

- Upgrade rate limiting to Redis-backed
- Configure stricter CSP
- Enable Cloudflare WAF
- Set up monitoring/alerting
- Implement audit logging
- Configure production email service

---

## Design Decisions

### Why Database Sessions?

- Immediate revocation (logout, security breach)
- Session data stays server-side
- Easy to audit active sessions
- No token refresh complexity

### Why Single Database (vs Schema-per-Tenant)?

- Simpler operations and maintenance
- Easier migrations
- Lower infrastructure cost
- Sufficient isolation via `churchId` filtering
- Can migrate to schema-per-tenant later if needed

### Why Subdomain-Based Tenancy?

- Industry standard for SaaS
- Clean, professional URLs
- Easy to identify tenant context
- Good for SEO

### Why Navigation Stored as JSON?

- Simple, no separate tables needed
- Flexible structure
- Easy to reorder
- Suitable for small nav lists

---

## License

Proprietary - Faith Interactive
