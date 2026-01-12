# Media Uploader Issues - Investigation & Fixes

## Issues Identified

### Issue 1: Bulk Uploads Not Allowing Multiple File Selection
**Location:** [fi-admin/components/dashboard/media-library.tsx](../fi-admin/components/dashboard/media-library.tsx#L224-L235)

**Current Code (Line 224-228):**
```tsx
<input
  ref={fileInputRef}
  type="file"
  accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
  multiple  // ← This IS set correctly
  className="hidden"
```

**Finding:** The `multiple` attribute IS present. The issue is likely browser-specific or related to how the hidden input is triggered.

**Root Cause:** The file input is `className="hidden"` and triggered via `fileInputRef.current?.click()`. Some browsers have issues with programmatic clicks on hidden file inputs for security reasons.

**Fix:** Change from `hidden` to visually hidden but still accessible:
```tsx
className="sr-only"  // Screen reader only, but accessible
// OR
style={{ position: 'absolute', left: '-9999px' }}
```

---

### Issue 2: Uploaded Images Showing as Broken in Gallery
**Location:** [fi-admin/components/dashboard/media-library.tsx](../fi-admin/components/dashboard/media-library.tsx#L265-L270)

**Current Code (Line 267):**
```tsx
<img
  src={item.variantUrls?.["small-square"] || item.variantUrls?.small || item.url}
  alt={item.alt || item.filename}
  className="w-full h-full object-cover bg-gray-100"
/>
```

**Finding:** The gallery tries to use variant URLs first, falling back to the original URL. The issue is likely that:

1. The `variantUrls` are using the raw Vercel Blob URL (e.g., `https://nzdsskmet9ac9kik.public.blob.vercel-storage.com/...`)
2. But the custom domain `assets.faith-interactive.com` should be used instead

**Root Cause:** Looking at [fi-admin/lib/storage/vercel-blob.ts](../fi-admin/lib/storage/vercel-blob.ts#L61-L64), the `getUrl()` method returns the raw storage path as-is:
```typescript
getUrl(storagePath: string): string {
  return storagePath; // Returns raw Vercel Blob URL
}
```

**Fix:** Add domain rewriting in `getUrl()`:
```typescript
getUrl(storagePath: string): string {
  // Rewrite to custom domain if configured
  const customDomain = process.env.BLOB_CUSTOM_DOMAIN; // "assets.faith-interactive.com"
  if (customDomain && storagePath.includes('.blob.vercel-storage.com/')) {
    return storagePath.replace(
      /https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//,
      `https://${customDomain}/`
    );
  }
  return storagePath;
}
```

---

### Issue 3: Files Being Renamed on Upload (SEO Issue)
**Location:** [fi-admin/lib/storage/image.ts](../fi-admin/lib/storage/image.ts#L63-L75)

**Current Code (Line 63-67):**
```typescript
export function generateBaseFilename(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
}
```

**And in `processAndUploadImage` (Line 196-198):**
```typescript
const baseFilename = generateBaseFilename();
const originalExt = originalFilename.split(".").pop()?.toLowerCase() || "jpg";
const originalFilenameWithExt = `${baseFilename}.${originalExt}`;
```

**Finding:** The original filename is completely discarded and replaced with `{timestamp}-{random}.{ext}`. For example:
- Input: `randy-gonzalez.jpg`
- Output: `1736640000000-abc123.jpg`

This is bad for SEO because:
1. Search engines use filenames as signals for image relevance
2. SEO-optimized filenames like `randy-gonzalez.jpg` become meaningless timestamps
3. Breaks any external links or SEO juice from the original filenames

**Fix:** Preserve the original filename, only add uniqueness suffix if needed:
```typescript
export function generateFilename(originalFilename: string): string {
  // Sanitize filename for URL safety
  const sanitized = originalFilename
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')  // Replace unsafe chars
    .replace(/-+/g, '-')             // Collapse multiple dashes
    .replace(/^-|-$/g, '');          // Trim leading/trailing dashes

  // Add short random suffix to prevent collisions (but keep SEO value)
  const ext = sanitized.split('.').pop() || 'jpg';
  const name = sanitized.replace(/\.[^.]+$/, '');
  const random = Math.random().toString(36).substring(2, 6);

  return `${name}-${random}.${ext}`;
}
```

This would transform:
- `randy-gonzalez.jpg` → `randy-gonzalez-x7k2.jpg` (SEO preserved!)
- `My Photo (1).PNG` → `my-photo-1-a3b4.png` (sanitized but readable)

---

## Files to Modify

All changes are in the **fi-admin** project:

| File | Issue | Change |
|------|-------|--------|
| `components/dashboard/media-library.tsx` | #1 | Change `hidden` to `sr-only` |
| `lib/storage/vercel-blob.ts` | #2 | Add custom domain rewriting |
| `lib/storage/image.ts` | #3 | Preserve original filename |
| `.env.example` | #2 | Add `BLOB_CUSTOM_DOMAIN` var |

---

## Implementation Order

1. **Fix #1 (Multiple file selection)** - Quick CSS change
2. **Fix #3 (Filename preservation)** - Update filename generation logic
3. **Fix #2 (Broken images)** - Add domain rewriting + env var

---

## Environment Variable Needed

Add to `.env` and `.env.example`:
```env
# Custom domain for blob storage (maps to Vercel Blob)
BLOB_CUSTOM_DOMAIN="assets.faith-interactive.com"
```
