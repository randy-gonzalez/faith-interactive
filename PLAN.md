# Plan: Homepage as Block-Based Page

## Overview
Allow churches to designate any page as their homepage through a flag in Page Settings. The homepage will be built using the block editor like any other page.

## Current State
- `SiteSettings` model already has a `homePageId` field (line 938 in schema.prisma)
- The public homepage (`app/(church)/page.tsx`) already checks for `settings.homePageId` and renders that page's blocks if configured
- The issue: there's no UI in the page editor to set a page as the homepage

## Implementation Plan

### 1. Add `isHomePage` field to Page model (Schema Change)
Add a boolean flag directly on the Page model for simpler querying and UI:
```prisma
// In Page model
isHomePage    Boolean   @default(false)
```

This is cleaner than using SiteSettings.homePageId because:
- Directly visible when editing the page
- No need to fetch SiteSettings to know if a page is the homepage
- Automatic enforcement of "only one homepage" constraint

### 2. Update Page Editor UI
Add a checkbox in the "Page Settings" tab of the page editor:
- Location: In the Page Settings tab, above or near the SEO fields
- Label: "Set as Homepage"
- Description: "When enabled, this page will be displayed as the site's homepage"
- Visual indicator: Show a home icon badge on the page if it's the homepage

### 3. Update Page API Routes
Modify `PUT /api/pages/[id]` to handle `isHomePage`:
- When `isHomePage` is set to `true`, automatically set all other pages' `isHomePage` to `false`
- This ensures only one page can be the homepage at a time
- Also update `SiteSettings.homePageId` to keep them in sync (or remove that field in favor of the new approach)

### 4. Update Public Homepage Route
Modify `app/(church)/page.tsx` to:
- Query for the page where `isHomePage: true` instead of using `SiteSettings.homePageId`
- Keep the fallback default page for churches that haven't designated a homepage

### 5. Update Pages List
In the admin pages list, show a "Home" badge/indicator for the homepage.

## Files to Modify

1. **prisma/schema.prisma**
   - Add `isHomePage Boolean @default(false)` to Page model
   - Add index on `[churchId, isHomePage]`

2. **components/dashboard/page-editor.tsx**
   - Add `isHomePage` state
   - Add checkbox in Page Settings tab
   - Include `isHomePage` in save payload

3. **app/api/pages/[id]/route.ts**
   - Handle `isHomePage` in PUT handler
   - Reset other pages' `isHomePage` when setting a new homepage

4. **app/api/pages/route.ts**
   - Handle `isHomePage` in POST handler (in case creating a new page and setting as homepage)

5. **lib/validation/schemas.ts**
   - Add `isHomePage` to page schema

6. **app/(church)/page.tsx**
   - Update query to use `isHomePage: true` instead of `settings.homePageId`

7. **app/admin/pages/page.tsx** (pages list)
   - Show "Home" badge for the homepage

## Migration Consideration
- Run migration to add the new field
- If `SiteSettings.homePageId` has values, create a one-time migration script to set `isHomePage: true` on those pages
- Consider removing `SiteSettings.homePageId` in a future cleanup phase, or keep both in sync

## UI Mockup

In Page Settings tab:
```
┌─────────────────────────────────────────────────┐
│ Page Settings                                   │
├─────────────────────────────────────────────────┤
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ [✓] Set as Homepage                         │ │
│ │     This page will be displayed when        │ │
│ │     visitors go to your site's root URL     │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ URL Path                                        │
│ ┌─────────────────────────────────────────────┐ │
│ │ about-us                                    │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ... (rest of page settings)                     │
└─────────────────────────────────────────────────┘
```
