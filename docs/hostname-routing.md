# Hostname-Based Routing Architecture

This document describes the hostname-based routing architecture for Faith Interactive, which provides **hard isolation** between different application surfaces.

## Overview

We use hostname-based routing where each surface has its own subdomain. The middleware rewrites requests to internal path prefixes (`/m`, `/p`, `/a`, `/t`) based on the hostname, keeping URLs clean for users:

| Surface | Production Hostname | Local Hostname | Internal Prefix | Purpose |
|---------|---------------------|----------------|-----------------|---------|
| Marketing | `faith-interactive.com` | `faith-interactive.local` | `/m` | Public marketing website |
| Platform | `platform.faith-interactive.com` | `platform.faith-interactive.local` | `/p` | Fi internal admin (super admin, sales) |
| Admin | `admin.faith-interactive.com` | `admin.faith-interactive.local` | `/a` | Church staff dashboard |
| Tenant | `{slug}.faith-interactive.com` | `{slug}.faith-interactive.local` | `/t` | Church public websites |

## Why Hostname-Based Routing?

1. **Hard Isolation**: Each surface has completely separate layouts, CSS, and navigation
2. **No Route Conflicts**: `/events` on tenant site vs `/events` on admin are completely separate
3. **Security Boundaries**: Cookies are isolated per subdomain
4. **Clean Architecture**: Each surface can evolve independently
5. **Custom Domains**: Tenant sites can use custom domains (e.g., `gracechurch.org`)

## How It Works

### URL Rewriting

The middleware intercepts all requests and rewrites them to the correct internal path:

```
User visits:                          Internally routes to:
─────────────────────────────────────────────────────────────
faith-interactive.com/             →  /m/
faith-interactive.com/pricing      →  /m/pricing
platform.faith-interactive.com/    →  /p/
admin.faith-interactive.com/       →  /a/
admin.faith-interactive.com/pages  →  /a/pages
demo.faith-interactive.com/        →  /t/
demo.faith-interactive.com/sermons →  /t/sermons
```

Users never see the `/m`, `/p`, `/a`, `/t` prefixes in their browser - they're internal only.

## Directory Structure

```
app/
├── m/                    # Marketing website (faith-interactive.com)
│   ├── layout.tsx        # Marketing layout with its own nav/footer
│   ├── marketing.css     # Marketing-specific styles
│   ├── page.tsx          # Homepage
│   ├── features/
│   ├── pricing/
│   └── ...
│
├── p/                    # Fi internal platform (platform.faith-interactive.com)
│   ├── layout.tsx        # Platform layout with sidebar
│   ├── platform.css      # Platform-specific styles
│   ├── page.tsx          # Redirects to /churches
│   ├── churches/
│   ├── crm/
│   └── ...
│
├── a/                    # Church admin dashboard (admin.faith-interactive.com)
│   ├── layout.tsx        # Admin layout with sidebar
│   ├── admin.css         # Admin-specific styles
│   ├── page.tsx          # Redirects to /dashboard
│   ├── (auth)/           # Auth pages (login, forgot-password, etc.)
│   ├── dashboard/
│   ├── pages/
│   ├── sermons/
│   └── ...
│
├── t/                    # Church public websites (*.faith-interactive.com)
│   ├── layout.tsx        # Public layout with header/footer
│   ├── tenant.css        # Tenant base styles (branding via CSS vars)
│   ├── page.tsx          # Homepage
│   ├── sermons/
│   ├── events/
│   └── ...
│
└── api/                  # Shared API routes
    └── ...
```

**Why path prefixes instead of route groups?**

Next.js route groups (with parentheses like `(admin)`) are stripped from URLs, which means routes across groups would conflict:
- `(admin)/events/page.tsx` → `/events`
- `(tenant)/events/page.tsx` → `/events`

Both resolve to `/events`, causing a build error. Using actual path prefixes (`/a/events`, `/t/events`) avoids this conflict while the middleware keeps URLs clean for users.

### CSS Isolation

Each surface imports its own CSS file at the layout level:

```tsx
// app/m/layout.tsx
import "./marketing.css";

// app/p/layout.tsx
import "./platform.css";

// app/a/layout.tsx
import "./admin.css";

// app/t/layout.tsx
import "./tenant.css";
```

Each CSS file:
- Imports Tailwind: `@import "tailwindcss";`
- Defines its own CSS variables (`:root { ... }`)
- Has surface-specific utility classes

### Authentication Boundaries

| Surface | Auth Requirement | Cookie Scope |
|---------|------------------|--------------|
| Marketing | None | N/A |
| Platform | Platform role required | `platform.faith-interactive.com` |
| Admin | Any authenticated user | `admin.faith-interactive.com` |
| Tenant | None (public) | N/A |

**Cookie Isolation**: Cookies are NOT shared across subdomains. This means:
- Admin session cookie only works on `admin.*`
- Platform session cookie only works on `platform.*`
- No cross-subdomain session sharing

### Custom Domain Support

Tenant sites can use custom domains (e.g., `gracechurch.org`):

1. Church registers custom domain in admin
2. DNS points to Faith Interactive servers
3. Middleware detects custom domain (not matching our subdomain patterns)
4. Calls `/api/internal/resolve-domain` to lookup church slug
5. Routes to tenant surface with resolved church context

## Local Development Setup

### Step 1: Edit /etc/hosts

Add these entries to `/etc/hosts` (requires sudo):

```bash
sudo nano /etc/hosts
```

Add the following lines:

```
# Faith Interactive local development
127.0.0.1 faith-interactive.local
127.0.0.1 platform.faith-interactive.local
127.0.0.1 admin.faith-interactive.local
127.0.0.1 demo.faith-interactive.local
127.0.0.1 grace.faith-interactive.local
```

### Step 2: Start Development Server

```bash
npm run dev
```

The server runs on `localhost:3000`, but you'll access it via the hostnames.

### Step 3: Test Each Surface

| URL | Expected Surface |
|-----|------------------|
| `http://faith-interactive.local:3000` | Marketing homepage |
| `http://platform.faith-interactive.local:3000` | Platform login/dashboard |
| `http://admin.faith-interactive.local:3000` | Admin login/dashboard |
| `http://demo.faith-interactive.local:3000` | Demo church public site |
| `http://grace.faith-interactive.local:3000` | Grace church public site |

### Troubleshooting Local Development

**DNS not resolving:**
- Flush DNS cache: `sudo dscacheutil -flushcache` (macOS)
- Verify hosts file entry is correct
- Try `ping faith-interactive.local` to verify resolution

**Wrong surface loading:**
- Check browser dev tools → Network → Request Headers → Host
- Verify middleware is receiving correct hostname
- Check middleware console logs

**Port issues:**
- If using port 3000, ensure the host entry resolves to `127.0.0.1`
- Access with port: `http://admin.faith-interactive.local:3000`

## Key Files

| File | Purpose |
|------|---------|
| `lib/hostname/parser.ts` | Hostname parsing utilities |
| `lib/hostname/parser.test.ts` | Tests for hostname parsing |
| `middleware.ts` | Main routing middleware |
| `lib/auth/cookies.ts` | Cookie management with subdomain isolation |

## Hostname Parser API

```typescript
import { parseHostname, buildSurfaceUrl, getSurfaceRoutePrefix } from "@/lib/hostname/parser";

// Parse a hostname
const result = parseHostname("demo.faith-interactive.com");
// { surface: "tenant", churchSlug: "demo", isLocal: false, originalHost: "..." }

// Build a URL for a surface (for external links)
const url = buildSurfaceUrl("admin", "/pages", { isLocal: true });
// "http://admin.faith-interactive.local:3000/pages"

// Get internal route prefix (for middleware rewrites)
const prefix = getSurfaceRoutePrefix("admin");
// "/a"
```

## Shared Components

Shared components live in `components/` but must NOT import surface-specific CSS:

```
components/
├── shared/           # Truly shared (no surface CSS)
├── dashboard/        # Used by admin surface
├── platform/         # Used by platform surface
└── public/           # Used by tenant surface
```

## Security Considerations

1. **Cookie Isolation**: Session cookies are NOT shared across subdomains
2. **Auth Boundaries**: Each surface has its own auth requirements
3. **No Route Bleed**: Admin routes can't be accessed from tenant hostnames
4. **CSP Headers**: Configure per-surface if needed in `next.config.ts`
