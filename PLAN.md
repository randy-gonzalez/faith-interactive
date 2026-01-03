# Plan: Replace Header Layouts with More User-Friendly Options

## Current State
We have 8 header layouts, but 3 need to be replaced:
- **Remove:** `logo-right`, `stacked`, `inline` (not user-friendly)
- **Keep:** `classic`, `centered`, `minimal`, `split`, `double-row`

## New Layout Ideas to Replace the 3 Removed

### Option 1: "Transparent Hero" (`transparent`)
- Header overlays the hero section with transparent background
- Logo and navigation visible over hero image/gradient
- Great for dramatic, modern church websites with hero images
- Preview: Glass-like header over gradient background

### Option 2: "Left Sidebar" (`sidebar`)
- Vertical sidebar navigation on the left
- Logo at top, nav items stacked vertically
- Content area to the right
- Modern, app-like feel - good for content-heavy sites

### Option 3: "Mega Menu" (`mega`)
- Similar to classic but designed for mega dropdown menus
- Wider spacing, supports large dropdown panels
- Good for churches with many ministries/pages to showcase

### Option 4: "Boxed" (`boxed`)
- Header contained in a centered box with rounded corners
- Floats above content with shadow
- Modern, clean aesthetic

### Option 5: "Full Width Bar" (`full-width`)
- Logo and CTA on edges, navigation perfectly centered
- Balanced, symmetrical look
- Professional and clean

### Option 6: "Top Bar + Header" (`top-bar`)
- Similar to double-row but with contact info (phone, email, social) in top bar
- Main header below with logo and navigation
- Classic church website feel

### Option 7: "Hamburger Always" (`hamburger`)
- Always shows hamburger menu regardless of screen size
- Clean, minimal look with focus on content
- Logo prominent, navigation tucked away

## Recommended Replacements

Based on user-friendliness and creativity, I recommend:

1. **`transparent`** - Dramatic, modern feel for hero-focused sites
2. **`boxed`** - Clean, modern aesthetic that stands out
3. **`full-width`** - Balanced, professional look

These provide visual variety while being intuitive layouts that users understand.

## Files to Modify

1. `types/template.ts` - Update HeaderTemplate type and HEADER_TEMPLATES array
2. `lib/validation/schemas.ts` - Update Zod schema
3. `components/public/header.tsx` - Update render functions
4. `components/dashboard/header-settings-form.tsx` - Update preview components

## Implementation

Replace:
- `logo-right` → `transparent`
- `stacked` → `boxed`
- `inline` → `full-width`
