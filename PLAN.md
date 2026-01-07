# Typography Fix for Trends Blog Posts

## Problem
The trends blog post typography doesn't match the rest of the marketing site. The content is rendered using `TextBlockPreview` which relies on CSS variables (`--font-heading`, `--font-body`) that don't exist in the marketing context, and uses Tailwind prose classes that aren't styled to match `marketing.css`.

Screenshot shows:
- Headings are oversized (h1 styling being applied where h2/h3 should be)
- Body text doesn't match the marketing site's Inter font with proper sizing
- No proper article typography hierarchy

## Solution

### Option 1: Add article prose styles to marketing.css (Recommended)
Create a `.prose-article` class in `marketing.css` that provides proper typography for blog content matching the site design:
- h1: 2.5rem-4rem (clamp) - matches `.h1`
- h2: 1.75rem-2.5rem (clamp) - matches `.h2`
- h3: 1.25rem - matches `.h3`
- h4: 1rem bold
- p: 1rem, 1.6 line-height
- Lists, blockquotes, images properly styled
- Uses `--fi-*` color variables

Then update `TextBlockPreview` to detect marketing context and use the article styles.

### Option 2: Create a dedicated ArticleContent component for marketing blog posts
Render the blog HTML content directly with proper styling wrapper instead of using `BlockRenderer` and `TextBlockPreview`.

## Implementation Plan (Option 1)

### Step 1: Add `.prose-article` styles to marketing.css
```css
/* ==========================================================================
   Article Prose — Blog Content
   ========================================================================== */

.prose-article {
  font-size: 1rem;
  line-height: 1.75;
  color: var(--fi-gray-900);
}

.prose-article > * + * {
  margin-top: 1.5em;
}

.prose-article h1 {
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin-top: 2.5em;
  margin-bottom: 0.75em;
}

.prose-article h2 {
  font-size: clamp(1.5rem, 3vw, 1.875rem);
  font-weight: 500;
  line-height: 1.25;
  letter-spacing: -0.015em;
  margin-top: 2em;
  margin-bottom: 0.75em;
}

.prose-article h3 {
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: -0.01em;
  margin-top: 1.75em;
  margin-bottom: 0.5em;
}

.prose-article h4 {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.prose-article p {
  margin-bottom: 1.25em;
}

.prose-article ul,
.prose-article ol {
  padding-left: 1.5em;
  margin-bottom: 1.25em;
}

.prose-article li {
  margin-bottom: 0.5em;
}

.prose-article blockquote {
  border-left: 3px solid var(--fi-blue);
  padding-left: 1.5rem;
  font-style: italic;
  color: var(--fi-gray-700);
}

.prose-article img,
.prose-article figure {
  margin: 2em 0;
  border-radius: 4px;
}

.prose-article figure img {
  margin: 0;
}

.prose-article figcaption {
  margin-top: 0.75em;
  font-size: 0.875rem;
  color: var(--fi-gray-500);
  text-align: center;
}

.prose-article a {
  color: var(--fi-blue);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.prose-article a:hover {
  color: var(--fi-black);
}

.prose-article strong {
  font-weight: 600;
}

/* Remove first/last margins */
.prose-article > :first-child {
  margin-top: 0;
}

.prose-article > :last-child {
  margin-bottom: 0;
}
```

### Step 2: Update the Trends detail page
Replace the `prose prose-lg` wrapper with `prose-article` and render content directly without BlockRenderer overhead (since blog posts only use text blocks).

```tsx
{/* Content */}
<div className="container">
  <div className="max-w-3xl">
    {post.excerpt && (
      <p className="text-large text-[var(--fi-gray-700)] mb-12 leading-relaxed">
        {post.excerpt}
      </p>
    )}

    <div className="prose-article">
      {/* Render text block content directly */}
      {blocks.map((block) => {
        if (block.type === 'text') {
          return (
            <div
              key={block.id}
              dangerouslySetInnerHTML={{ __html: block.data.content }}
            />
          );
        }
        return null;
      })}
    </div>
  </div>
</div>
```

### Step 3: Update existing blog posts (one-time migration)
The existing posts have `textTheme: "dark"` which won't matter since we're now using `prose-article` styling. No database changes needed - the content HTML is already correct.

## Files to Modify
1. `app/m/marketing.css` - Add `.prose-article` styles
2. `app/m/trends/[slug]/page.tsx` - Use `prose-article` class instead of prose/BlockRenderer

## Testing
- Check all 37 imported blog posts render correctly
- Verify typography matches the rest of the marketing site
- Ensure images, headings, lists, and links are properly styled
