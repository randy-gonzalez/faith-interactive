# Faith Interactive (Fi) - Phase 0 Foundation

Multi-tenant SaaS platform for churches. This is the **Phase 0 foundation** - core infrastructure and authentication only.

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your PostgreSQL connection string

# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:push

# Seed demo data
pnpm db:seed

# Add to /etc/hosts for subdomain testing
echo "127.0.0.1 demo.localhost" | sudo tee -a /etc/hosts

# Start development server
pnpm dev
```

Then visit: **http://demo.localhost:3000**

Test credentials:
- Email: `demo@example.com`
- Password: `password123`

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
- **Styling**: Tailwind CSS (minimal)

---

## Project Structure

```
fi-app/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, reset password)
│   ├── api/               # API routes
│   │   ├── auth/          # Auth endpoints
│   │   └── health/        # Health check
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── lib/                    # Shared utilities
│   ├── auth/              # Authentication logic
│   ├── db/                # Database clients
│   ├── logging/           # Centralized logging
│   ├── security/          # Rate limiting
│   ├── tenant/            # Tenant context
│   └── validation/        # Zod schemas
├── prisma/                 # Database schema
├── scripts/                # Utility scripts
├── types/                  # TypeScript types
└── middleware.ts           # Request middleware
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
pnpm db:generate

# Push schema to database (development)
pnpm db:push

# Create and run migrations (production)
pnpm db:migrate

# Seed demo data
pnpm db:seed
```

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
pnpm dev          # Start dev server with Turbopack
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

---

## Authentication

### Session Flow

1. User submits credentials → `/api/auth/login`
2. Server validates → creates session in database
3. Session token stored in HTTP-only cookie
4. Subsequent requests validated via cookie

### Password Reset (Development)

In development, reset tokens are logged to the console:

```
=== PASSWORD RESET TOKEN ===
Email: demo@example.com
Token: abc123...
Reset URL: http://demo.localhost:3000/reset-password?token=abc123...
============================
```

In production, integrate an email service (Resend, SendGrid, etc.).

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

### Backup Strategy

- Daily compressed backups (`.sql.gz`)
- 30-day retention
- Stored in `backups/` directory
- For production: Consider managed backup solutions (AWS RDS, Vercel Postgres, etc.)

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

### Production Considerations

- Upgrade rate limiting to Redis-backed
- Configure stricter CSP
- Enable Cloudflare WAF
- Set up monitoring/alerting
- Implement audit logging

---

## What's NOT Included (Phase 0)

- ❌ CMS dashboard
- ❌ Content types / pages
- ❌ Admin UI
- ❌ Media uploads
- ❌ Forms
- ❌ Billing / payments
- ❌ Social login
- ❌ Email sending (tokens logged only)
- ❌ Role-based access (prepared, not implemented)
- ❌ Church onboarding UI

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
- Good for SEO (eventually)

### Why Prisma Extensions?

- Automatic query filtering (hard to bypass)
- Type-safe
- Centralized isolation logic
- Works with all query types

---

## Contributing

This is Phase 0 foundation code. Keep changes:

- **Minimal** - Only what's needed
- **Explicit** - Clear over clever
- **Documented** - Comments explain decisions
- **Secure** - No shortcuts on security

---

## License

Proprietary - Faith Interactive
