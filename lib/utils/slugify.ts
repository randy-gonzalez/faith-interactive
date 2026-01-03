/**
 * Slug Generation Utilities
 *
 * Functions for generating URL-safe slugs from titles.
 */

/**
 * Convert a string to a URL-safe slug.
 *
 * @example
 * slugify("My Church Page") => "my-church-page"
 * slugify("  Hello   World!  ") => "hello-world"
 * slugify("Café & Restaurant") => "cafe-restaurant"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Remove accents/diacritics
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, "-")
    // Remove all non-alphanumeric characters except hyphens
    .replace(/[^a-z0-9-]/g, "")
    // Replace multiple consecutive hyphens with single hyphen
    .replace(/-+/g, "-")
    // Remove leading/trailing hyphens
    .replace(/^-|-$/g, "");
}

/**
 * Generate a unique slug by appending -1, -2, etc. if needed.
 *
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns A unique slug
 *
 * @example
 * makeUniqueSlug("about", ["home", "contact"]) => "about"
 * makeUniqueSlug("about", ["about", "contact"]) => "about-1"
 * makeUniqueSlug("about", ["about", "about-1"]) => "about-2"
 */
export function makeUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  // If the base slug doesn't exist, use it
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  // Find the highest existing suffix number
  let suffix = 1;
  while (existingSlugs.includes(`${baseSlug}-${suffix}`)) {
    suffix++;
  }

  return `${baseSlug}-${suffix}`;
}

/**
 * Generate a slug from a title, ensuring uniqueness.
 *
 * @param title - The title to generate a slug from
 * @param existingSlugs - Array of existing slugs to check against
 * @returns A unique slug
 */
export function generateUniqueSlug(title: string, existingSlugs: string[]): string {
  const baseSlug = slugify(title);

  // Handle edge case where title produces empty slug
  if (!baseSlug) {
    return makeUniqueSlug("page", existingSlugs);
  }

  return makeUniqueSlug(baseSlug, existingSlugs);
}
