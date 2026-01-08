# SEO-Friendly URL Structure for Trends Categories

## Current State
- `/trends` - All posts
- `/trends?category=website-design` - Filtered by category (query parameter - not SEO friendly)
- `/trends/[slug]` - Individual post

## Proposed Structure
- `/trends` - All posts
- `/trends/category/[categorySlug]` - Posts filtered by category (SEO friendly)
- `/trends/[slug]` - Individual post

## Implementation Plan

### 1. Create Category Route
Create new file: `app/trends/category/[categorySlug]/page.tsx`
- Copy and adapt logic from main trends page
- Add category-specific metadata generation
- Handle 404 for invalid categories

### 2. Update Category Links
Update `app/trends/page.tsx`:
- Change category links from `/trends?category={slug}` to `/trends/category/{slug}`
- Remove query parameter handling (no longer needed on main page)

### 3. Create Shared Components
Extract shared UI components to avoid duplication:
- Category filter navigation
- Blog post grid/list
- Metadata generation helpers

### 4. Add Redirects (Optional)
In `next.config.ts`, add redirects from old URLs to new:
```typescript
async redirects() {
  return [
    {
      source: '/trends',
      has: [{ type: 'query', key: 'category', value: '(?<cat>.*)' }],
      destination: '/trends/category/:cat',
      permanent: true,
    },
  ];
}
```

## Files to Create/Modify

| File | Action |
|------|--------|
| `app/trends/category/[categorySlug]/page.tsx` | Create - category listing page |
| `app/trends/page.tsx` | Update - change category links, simplify |
| `next.config.ts` | Update - add redirect from old URLs |

## SEO Benefits
- Clean, readable URLs that indicate content hierarchy
- Category pages can have unique meta descriptions
- Better crawlability and indexing
- URLs can be shared and understood by users
