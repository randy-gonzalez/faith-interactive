# Block Display Fixes Implementation Plan

## Issues to Address

1. **Recent Sermons block shows dummy data** - needs to fetch real sermon data from database
2. **Placeholder message below sermons** - should be removed from public site
3. **Hero block caption text not centered** - subheading not inheriting alignment
4. **Text colors differ between preview and public site** - hardcoded white text in blocks
5. **Need light/dark text theme toggle for backgrounds** - allow selecting text color palette

## Root Cause Analysis

### Issue 1 & 2: Sermon Block Data
The `SermonFeatureBlockPreview` component uses `PLACEHOLDER_SERMONS` array and shows a placeholder message. The component was designed for preview purposes and is reused on the public site via `BlockRenderer`, but **no actual sermon data is passed to it**.

**Current flow:**
- `BlockRenderer` → `SermonFeatureBlockPreview` → shows placeholder data
- No prop exists to pass real sermon data

### Issue 3: Hero Caption Alignment
The hero block preview has `alignmentClasses` defined but the subheading has no `max-w-2xl` class that could interfere with centering on smaller text. Looking at the screenshot - the caption appears left-aligned within a centered container. The issue is that `max-w-2xl` on the subheading constrains it, but text-alignment should still work.

Actually reviewing the code more carefully - the alignment IS applied to the outer container. The subheading inherits `text-center` from the flex parent. The issue may be that `max-w-2xl` with `text-center` should work... Let me verify the actual behavior.

### Issue 4 & 5: Text Colors
The block preview components (Hero, Sermon Feature) have **hardcoded white text**:
- Hero: `text-white` on heading, `text-white/90` on subheading
- Sermon: determines text color based on `hasBackground` check

The problem is blocks assume dark backgrounds = light text, but users need control over this. The current approach doesn't account for:
1. Light gradient backgrounds needing dark text
2. User preference for text color scheme

## Proposed Solution

### 1. Sermon Feature Block - Server Component Split
Create a server-side wrapper that fetches sermons and passes them to the preview component.

**Changes:**
- Add `sermons` prop to `SermonFeatureBlockPreview` interface
- When sermons prop is provided, use real data; otherwise show placeholder
- Create `SermonFeatureBlockServer` for public site use that fetches data
- Update `BlockRenderer` to use server component for sermon blocks
- Conditionally show placeholder message only when no real data

**Files to modify:**
- `components/blocks/sermon-feature-block-preview.tsx`
- `components/blocks/block-renderer.tsx`
- Create: `components/blocks/sermon-feature-block-server.tsx`

### 2. Hero Caption Centering
Review the actual CSS behavior. The `max-w-2xl` class may need adjustment or the text-align should be applied directly to the paragraph element.

**Files to modify:**
- `components/blocks/hero-block-preview.tsx`

### 3. Text Theme (Light/Dark) for Blocks
Add a `textTheme` property to the block background configuration that allows selecting "light" (white text) or "dark" (dark text) or "auto" (detect from background).

**Database/Type Changes:**
- Extend `BlockBackground` interface in `types/blocks.ts` to include `textTheme?: "light" | "dark" | "auto"`

**Editor Changes:**
- Add "Text Theme" toggle in background editor tab for all blocks
- Options: Auto (default), Light Text, Dark Text

**Branding Changes:**
- Add "Light Theme Colors" section in Theme > Colors that defines:
  - Light heading color (default: white)
  - Light text color (default: white/90)
  - Light subtext color (default: white/70)
- These become CSS variables: `--color-light-heading`, `--color-light-text`, `--color-light-subtext`

**Preview Component Changes:**
- Update all block previews to read `textTheme` from background config
- When "light": use light theme CSS variables
- When "dark": use standard text colors (--color-text)
- When "auto" or undefined: detect from background type/color

**Files to modify:**
- `types/blocks.ts` - add textTheme to BlockBackground
- `components/blocks/block-background-editor.tsx` - add text theme selector
- `components/blocks/hero-block-preview.tsx` - use textTheme
- `components/blocks/sermon-feature-block-preview.tsx` - use textTheme
- `components/public/branding-styles.tsx` - add light theme CSS variables
- `components/dashboard/colors-settings-form.tsx` - add light theme color pickers
- `prisma/schema.prisma` - add light theme color fields to ChurchBranding
- `lib/public/get-site-data.ts` - include light theme colors in BrandingData

## Implementation Steps

### Phase 1: Sermon Block Real Data
1. Add optional `sermons` prop to SermonFeatureBlockPreview
2. Create SermonFeatureBlockServer component
3. Update BlockRenderer to detect sermon-feature and use server component
4. Remove placeholder message when real data is present

### Phase 2: Hero Caption Fix
1. Apply text alignment directly to heading and subheading elements
2. Remove constraining max-width or ensure it doesn't break centering

### Phase 3: Text Theme System
1. Add `textTheme` to BlockBackground type
2. Add database fields for light theme colors
3. Create migration
4. Update branding API to handle new fields
5. Add light theme color pickers to Theme > Colors
6. Add BrandingStyles CSS variables for light theme
7. Add text theme selector to block background editor
8. Update block preview components to use text theme

## Technical Details

### New BlockBackground Interface
```typescript
export interface BlockBackground {
  type: "color" | "gradient" | "image" | "video";
  color?: ColorValue;
  gradient?: string;
  imageUrl?: string;
  videoUrl?: string;
  overlay?: ColorValue;
  textTheme?: "light" | "dark" | "auto"; // NEW
}
```

### New ChurchBranding Fields
```prisma
model ChurchBranding {
  // ... existing fields ...

  // Light theme colors (for dark backgrounds)
  lightHeadingColor   String?  // Default: #ffffff
  lightTextColor      String?  // Default: rgba(255,255,255,0.9)
  lightSubtextColor   String?  // Default: rgba(255,255,255,0.7)
}
```

### New CSS Variables
```css
:root {
  --color-light-heading: #ffffff;
  --color-light-text: rgba(255, 255, 255, 0.9);
  --color-light-subtext: rgba(255, 255, 255, 0.7);
}
```

### Text Theme Helper Function
```typescript
function getTextColors(textTheme: "light" | "dark" | "auto" | undefined, backgroundType: string) {
  const useLightTheme = textTheme === "light" ||
    (textTheme === "auto" || !textTheme) &&
    (backgroundType === "gradient" || backgroundType === "image" || backgroundType === "video");

  return {
    heading: useLightTheme ? "var(--color-light-heading)" : "var(--color-text)",
    text: useLightTheme ? "var(--color-light-text)" : "var(--color-text)",
    subtext: useLightTheme ? "var(--color-light-subtext)" : "var(--color-secondary)",
  };
}
```
