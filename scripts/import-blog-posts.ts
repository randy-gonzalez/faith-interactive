/**
 * Blog Import Script
 *
 * Imports blog posts from the legacy Faith Interactive WordPress blog
 * into the new Trends section of the marketing website.
 *
 * USAGE:
 * pnpm tsx scripts/import-blog-posts.ts
 *
 * OPTIONS:
 * --dry-run    Preview what would be imported without making changes
 * --verbose    Show detailed progress
 */

import { PrismaClient, MarketingPageStatus } from "@prisma/client";
import * as cheerio from "cheerio";
import { createId } from "@paralleldrive/cuid2";

const prisma = new PrismaClient();

// Configuration
const SOURCE_BASE_URL = "https://faith-interactive.com";
const BLOG_LISTING_URL = `${SOURCE_BASE_URL}/fi-blog/`;
const TOTAL_PAGES = 4;
const REQUEST_DELAY_MS = 500; // Delay between requests to avoid rate limiting

// Parse command line arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const VERBOSE = args.includes("--verbose");

// Types
interface SourcePost {
  title: string;
  slug: string;
  url: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  publishedAt: Date;
  modifiedAt: Date | null;
  author: string;
  categories: string[];
  tags: string[];
}

interface TextBlockData {
  id: string;
  type: "text";
  order: number;
  background?: {
    type: "color";
    textTheme: "dark"; // Dark text for blog content on light backgrounds
  };
  data: {
    content: string;
    alignment: "left" | "center" | "right";
    maxWidth: "narrow" | "medium" | "full";
  };
}

// Category mappings - WordPress category name to our category
const CATEGORY_MAP: Record<string, string> = {
  "branding": "Church Branding",
  "website improvements": "Website Design",
  "seo for churches": "Digital Marketing",
  "social media": "Digital Marketing",
  "email marketing": "Digital Marketing",
  "content strategy": "Ministry Tools",
  "online giving": "Ministry Tools",
  "case study": "Case Studies",
  "revive": "Case Studies",
};

// Our categories to create
const CATEGORIES = [
  { name: "Church Branding", slug: "church-branding", description: "Brand identity, visual design, and logo strategies for churches", sortOrder: 1 },
  { name: "Website Design", slug: "website-design", description: "UX, typography, mobile-friendly design, and web development", sortOrder: 2 },
  { name: "Digital Marketing", slug: "digital-marketing", description: "SEO, email marketing, social media, and content strategy", sortOrder: 3 },
  { name: "Ministry Tools", slug: "ministry-tools", description: "Online giving, livestreaming, and digital outreach tools", sortOrder: 4 },
  { name: "Case Studies", slug: "case-studies", description: "Revive program winners and church website transformations", sortOrder: 5 },
];

// Tags to create
const TAGS = [
  // Branding
  { name: "Church Branding", slug: "church-branding" },
  { name: "Visual Identity", slug: "visual-identity" },
  { name: "Logo Design", slug: "logo-design" },
  { name: "Brand Strategy", slug: "brand-strategy" },
  // Website Design
  { name: "UX Design", slug: "ux-design" },
  { name: "Mobile Design", slug: "mobile-design" },
  { name: "Typography", slug: "typography" },
  { name: "Web Accessibility", slug: "web-accessibility" },
  // Digital Marketing
  { name: "SEO", slug: "seo" },
  { name: "Email Marketing", slug: "email-marketing" },
  { name: "Social Media", slug: "social-media" },
  { name: "Content Strategy", slug: "content-strategy" },
  // Ministry Tools
  { name: "Online Giving", slug: "online-giving" },
  { name: "Livestreaming", slug: "livestreaming" },
  { name: "Digital Outreach", slug: "digital-outreach" },
  { name: "Bible Study", slug: "bible-study" },
  // Case Studies
  { name: "Revive Program", slug: "revive-program" },
  { name: "Website Makeover", slug: "website-makeover" },
  { name: "Church Transformation", slug: "church-transformation" },
];

// Keyword to tag mappings for auto-assignment
const TAG_KEYWORDS: Record<string, string[]> = {
  "church-branding": ["brand", "branding", "identity", "visual"],
  "visual-identity": ["visual", "identity", "look", "design"],
  "logo-design": ["logo", "emblem", "symbol"],
  "ux-design": ["user experience", "ux", "usability", "navigation"],
  "mobile-design": ["mobile", "responsive", "phone", "tablet"],
  "typography": ["typography", "font", "typeface"],
  "seo": ["seo", "search engine", "google", "ranking"],
  "email-marketing": ["email", "newsletter", "mailchimp"],
  "social-media": ["social media", "facebook", "instagram", "twitter"],
  "content-strategy": ["content strategy", "blog", "writing", "storytelling"],
  "online-giving": ["giving", "donation", "tithe", "offering"],
  "livestreaming": ["livestream", "live stream", "broadcast", "youtube live"],
  "digital-outreach": ["outreach", "evangelism", "ministry", "mission"],
  "revive-program": ["revive", "winner", "makeover"],
  "website-makeover": ["makeover", "redesign", "new website", "transformation"],
};

// Helper functions
function log(message: string, verbose = false) {
  if (!verbose || VERBOSE) {
    console.log(message);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractSlugFromUrl(url: string): string {
  // Remove trailing slash and get last segment
  const cleanUrl = url.replace(/\/$/, "");
  const parts = cleanUrl.split("/");
  return parts[parts.length - 1];
}

function cleanHtml(html: string): string {
  const $ = cheerio.load(html);

  // Remove WordPress-specific elements
  $(".wp-block-separator").replaceWith("<hr>");
  $(".wp-block-image").each((_, el) => {
    const img = $(el).find("img");
    if (img.length) {
      $(el).replaceWith(img);
    }
  });

  // Remove unnecessary attributes
  $("*").removeAttr("class");
  $("*").removeAttr("id");
  $("*").removeAttr("style");
  $("*").removeAttr("data-id");

  // Keep only meaningful content
  const content = $.html();

  // Clean up whitespace
  return content
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .replace(/<p>\s*<\/p>/g, "")
    .replace(/<div>\s*<\/div>/g, "")
    .trim();
}

function createTextBlock(content: string, order: number): TextBlockData {
  return {
    id: createId(),
    type: "text",
    order,
    background: {
      type: "color",
      textTheme: "dark", // Dark text for blog content on light page backgrounds
    },
    data: {
      content,
      alignment: "left",
      maxWidth: "medium",
    },
  };
}

function inferCategory(post: SourcePost): string {
  const titleLower = post.title.toLowerCase();
  const contentLower = post.content.toLowerCase();
  const combined = `${titleLower} ${contentLower}`;

  // Check source categories first
  for (const cat of post.categories) {
    const catLower = cat.toLowerCase();
    for (const [key, value] of Object.entries(CATEGORY_MAP)) {
      if (catLower.includes(key)) {
        return value;
      }
    }
  }

  // Infer from content
  if (combined.includes("revive") || combined.includes("winner") || combined.includes("makeover")) {
    return "Case Studies";
  }
  if (combined.includes("seo") || combined.includes("email") || combined.includes("social media")) {
    return "Digital Marketing";
  }
  if (combined.includes("brand") || combined.includes("logo") || combined.includes("identity")) {
    return "Church Branding";
  }
  if (combined.includes("giving") || combined.includes("livestream") || combined.includes("devotional")) {
    return "Ministry Tools";
  }
  if (combined.includes("website") || combined.includes("design") || combined.includes("user experience")) {
    return "Website Design";
  }

  // Default
  return "Digital Marketing";
}

function inferTags(post: SourcePost): string[] {
  const titleLower = post.title.toLowerCase();
  const contentLower = post.content.toLowerCase();
  const combined = `${titleLower} ${contentLower}`;
  const matchedTags: Set<string> = new Set();

  // Add source tags if they match our tags
  for (const sourceTag of post.tags) {
    const sourceTagSlug = sourceTag.toLowerCase().replace(/\s+/g, "-");
    const matchingTag = TAGS.find(
      (t) => t.slug === sourceTagSlug || t.name.toLowerCase() === sourceTag.toLowerCase()
    );
    if (matchingTag) {
      matchedTags.add(matchingTag.slug);
    }
  }

  // Infer from content keywords
  for (const [tagSlug, keywords] of Object.entries(TAG_KEYWORDS)) {
    for (const keyword of keywords) {
      if (combined.includes(keyword.toLowerCase())) {
        matchedTags.add(tagSlug);
        break;
      }
    }
  }

  // Ensure at least one tag
  if (matchedTags.size === 0) {
    matchedTags.add("digital-outreach");
  }

  // Limit to 5 tags max
  return Array.from(matchedTags).slice(0, 5);
}

async function fetchPage(url: string): Promise<string> {
  log(`  Fetching: ${url}`, true);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.text();
}

// Pages/slugs to exclude (not blog posts)
const EXCLUDED_SLUGS = [
  "about",
  "about-2", // About Faith Interactive page
  "company", // About Faith Interactive page
  "contact",
  "contact-fi",
  "services",
  "work",
  "blog",
  "our-work",
  "schedule-a-consultation",
  "privacy-policy",
  "terms-of-service",
  "pricing",
  "faq",
  "team",
  "careers",
  "fi-blog",
  "free-website-makeover",
  "free-website-makeover-2",
  "nominate-my-church",
  "nominate-my-church-faith-interactive",
  "meet-the-team-introduce-our-church-leaders",
  "revive", // Main Revive program page (not a blog post)
];

// Title patterns to exclude (non-blog content pages)
const EXCLUDED_TITLE_PATTERNS = [
  /^about faith interactive$/i,
  /^free website makeover$/i,
  /^nominate my church/i,
  /^contact/i,
  /^meet the team/i,
];

async function getPostUrlsFromListingPage(pageNum: number): Promise<string[]> {
  const url = pageNum === 1 ? BLOG_LISTING_URL : `${BLOG_LISTING_URL}${pageNum}/`;
  const html = await fetchPage(url);
  const $ = cheerio.load(html);
  const urls: string[] = [];

  // Find all article links - adjust selector based on WordPress theme
  $("article a, .post a, .blog-post a, a[href*='faith-interactive.com']").each((_, el) => {
    const href = $(el).attr("href");
    if (
      href &&
      href.startsWith(SOURCE_BASE_URL) &&
      !href.includes("/fi-blog/") &&
      !href.includes("/page/") &&
      !href.includes("/category/") &&
      !href.includes("/tag/") &&
      !href.includes("#") &&
      !urls.includes(href)
    ) {
      // Exclude non-post URLs
      const slug = extractSlugFromUrl(href);
      if (slug && slug.length > 5 && !EXCLUDED_SLUGS.includes(slug)) {
        urls.push(href);
      }
    }
  });

  return urls;
}

async function scrapePost(url: string): Promise<SourcePost | null> {
  try {
    const html = await fetchPage(url);
    const $ = cheerio.load(html);

    // Extract title
    const title =
      $("h1.entry-title").text().trim() ||
      $("h1").first().text().trim() ||
      $('meta[property="og:title"]').attr("content") ||
      "";

    if (!title) {
      log(`  Warning: No title found for ${url}`, true);
      return null;
    }

    // Check if title matches excluded patterns (non-blog pages)
    if (EXCLUDED_TITLE_PATTERNS.some((pattern) => pattern.test(title))) {
      log(`  Skipping non-blog page: ${title}`, true);
      return null;
    }

    // Extract slug
    const slug = extractSlugFromUrl(url);

    // Extract dates
    const publishedStr =
      $('meta[property="article:published_time"]').attr("content") ||
      $("time[datetime]").attr("datetime") ||
      $(".entry-date").text().trim();
    const modifiedStr = $('meta[property="article:modified_time"]').attr("content");

    let publishedAt = new Date();
    if (publishedStr) {
      const parsed = new Date(publishedStr);
      if (!isNaN(parsed.getTime())) {
        publishedAt = parsed;
      }
    }

    let modifiedAt: Date | null = null;
    if (modifiedStr) {
      const parsed = new Date(modifiedStr);
      if (!isNaN(parsed.getTime())) {
        modifiedAt = parsed;
      }
    }

    // Extract author
    const author =
      $('meta[name="author"]').attr("content") ||
      $(".author-name").text().trim() ||
      $(".entry-author").text().trim() ||
      "Randy Gonzalez";

    // Extract featured image
    const featuredImage =
      $('meta[property="og:image"]').attr("content") ||
      $(".post-thumbnail img").attr("src") ||
      $("article img").first().attr("src") ||
      null;

    // Extract categories
    const categories: string[] = [];
    $('a[rel="category tag"], .cat-links a, .entry-categories a').each((_, el) => {
      const cat = $(el).text().trim();
      if (cat) categories.push(cat);
    });

    // Extract tags
    const tags: string[] = [];
    $('a[rel="tag"], .tag-links a, .entry-tags a').each((_, el) => {
      const tag = $(el).text().trim();
      if (tag) tags.push(tag);
    });

    // Extract content - Handle Elementor page builder structure
    // Elementor uses widget-based structure instead of standard WordPress content
    const contentElements: string[] = [];

    // Find all content sections (excluding header and footer)
    const mainContent = $('div[data-elementor-type="wp-post"], div[data-elementor-type="single-post"]');
    const contentContainer = mainContent.length ? mainContent : $("body");

    // Remove navigation, footer, header elements
    const excludeSelectors = [
      '[data-elementor-type="header"]',
      '[data-elementor-type="footer"]',
      ".elementor-widget-post-navigation",
      ".elementor-widget-n-menu",
      "footer",
      "header",
      "nav",
    ];

    // Process widgets in document order to maintain content flow
    contentContainer
      .find(".elementor-widget")
      .not(excludeSelectors.join(", "))
      .each((_, widget) => {
        const $widget = $(widget);
        const container = $widget.find(".elementor-widget-container").first();

        if ($widget.hasClass("elementor-widget-text-editor")) {
          // Text content - get inner HTML
          const html = container.html();
          if (html && html.trim()) {
            contentElements.push(html.trim());
          }
        } else if ($widget.hasClass("elementor-widget-heading")) {
          // Headings - preserve tag level
          const heading = container.find(".elementor-heading-title, h1, h2, h3, h4, h5, h6").first();
          if (heading.length) {
            const tagName = heading.prop("tagName")?.toLowerCase() || "h2";
            const text = heading.text().trim();
            if (text) {
              contentElements.push(`<${tagName}>${text}</${tagName}>`);
            }
          }
        } else if ($widget.hasClass("elementor-widget-image")) {
          // Images - include in content
          const img = container.find("img").first();
          if (img.length) {
            const src = img.attr("src") || "";
            const alt = img.attr("alt") || "";
            if (src && !src.includes("logo") && !src.includes("icon")) {
              contentElements.push(`<figure><img src="${src}" alt="${alt}" /></figure>`);
            }
          }
        }
      });

    let content = contentElements.join("\n");

    // If Elementor extraction failed, try standard WordPress selectors as fallback
    if (!content || content.length < 100) {
      const fallbackEl = $(".entry-content, .post-content, article .content").first();
      fallbackEl.find("script, style, .sharedaddy, .jp-relatedposts, .post-navigation").remove();
      const fallbackHtml = fallbackEl.html();
      if (fallbackHtml && fallbackHtml.length > content.length) {
        content = fallbackHtml;
      }
    }

    content = cleanHtml(content);

    // Extract excerpt
    const excerpt =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      $(".entry-excerpt").text().trim() ||
      content.replace(/<[^>]+>/g, "").substring(0, 300) + "...";

    return {
      title,
      slug,
      url,
      excerpt: excerpt.substring(0, 500),
      content,
      featuredImage,
      publishedAt,
      modifiedAt,
      author,
      categories,
      tags,
    };
  } catch (error) {
    log(`  Error scraping ${url}: ${error}`, true);
    return null;
  }
}

async function ensureCategoriesExist(): Promise<Map<string, string>> {
  const categoryMap = new Map<string, string>();

  for (const cat of CATEGORIES) {
    if (DRY_RUN) {
      log(`  [DRY RUN] Would create category: ${cat.name}`, true);
      categoryMap.set(cat.name, `dry-run-${cat.slug}`);
    } else {
      const existing = await prisma.blogCategory.findUnique({
        where: { slug: cat.slug },
      });

      if (existing) {
        categoryMap.set(cat.name, existing.id);
        log(`  Category exists: ${cat.name}`, true);
      } else {
        const created = await prisma.blogCategory.create({
          data: cat,
        });
        categoryMap.set(cat.name, created.id);
        log(`  Created category: ${cat.name}`);
      }
    }
  }

  return categoryMap;
}

async function ensureTagsExist(): Promise<Map<string, string>> {
  const tagMap = new Map<string, string>();

  for (const tag of TAGS) {
    if (DRY_RUN) {
      log(`  [DRY RUN] Would create tag: ${tag.name}`, true);
      tagMap.set(tag.slug, `dry-run-${tag.slug}`);
    } else {
      const existing = await prisma.blogTag.findUnique({
        where: { slug: tag.slug },
      });

      if (existing) {
        tagMap.set(tag.slug, existing.id);
        log(`  Tag exists: ${tag.name}`, true);
      } else {
        const created = await prisma.blogTag.create({
          data: tag,
        });
        tagMap.set(tag.slug, created.id);
        log(`  Created tag: ${tag.name}`);
      }
    }
  }

  return tagMap;
}

async function importPost(
  post: SourcePost,
  categoryMap: Map<string, string>,
  tagMap: Map<string, string>
): Promise<boolean> {
  // Check if post already exists
  const existing = await prisma.blogPost.findUnique({
    where: { slug: post.slug },
  });

  if (existing) {
    log(`  Skipping (exists): ${post.title}`);
    return false;
  }

  // Determine category
  const categoryName = inferCategory(post);
  const categoryId = categoryMap.get(categoryName);

  // Determine tags
  const tagSlugs = inferTags(post);
  const tagIds = tagSlugs.map((slug) => tagMap.get(slug)).filter(Boolean) as string[];

  // Create content block
  const blocks = [createTextBlock(post.content, 0)];

  if (DRY_RUN) {
    log(`  [DRY RUN] Would import: ${post.title}`);
    log(`    Category: ${categoryName}`, true);
    log(`    Tags: ${tagSlugs.join(", ")}`, true);
    log(`    Published: ${post.publishedAt.toISOString()}`, true);
    return true;
  }

  // Create the post
  await prisma.blogPost.create({
    data: {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      blocks: blocks as unknown as [],
      featuredImage: post.featuredImage,
      categoryId,
      authorName: post.author,
      status: MarketingPageStatus.PUBLISHED,
      publishedAt: post.publishedAt,
      metaTitle: post.title.substring(0, 200),
      metaDescription: post.excerpt.substring(0, 500),
      ogImage: post.featuredImage,
      noIndex: false,
      tags: {
        create: tagIds.map((tagId) => ({
          tagId,
        })),
      },
    },
  });

  log(`  Imported: ${post.title}`);
  return true;
}

async function main() {
  console.log("🚀 Blog Import Script");
  console.log("====================");
  if (DRY_RUN) {
    console.log("⚠️  DRY RUN MODE - No changes will be made\n");
  }

  try {
    // Step 1: Ensure categories exist
    console.log("\n📁 Setting up categories...");
    const categoryMap = await ensureCategoriesExist();

    // Step 2: Ensure tags exist
    console.log("\n🏷️  Setting up tags...");
    const tagMap = await ensureTagsExist();

    // Step 3: Collect all post URLs
    console.log("\n📋 Collecting post URLs...");
    const allUrls: string[] = [];

    for (let page = 1; page <= TOTAL_PAGES; page++) {
      log(`  Scanning page ${page}...`);
      const urls = await getPostUrlsFromListingPage(page);
      allUrls.push(...urls);
      await delay(REQUEST_DELAY_MS);
    }

    // Remove duplicates
    const uniqueUrls = [...new Set(allUrls)];
    console.log(`  Found ${uniqueUrls.length} unique post URLs`);

    // Step 4: Scrape and import each post
    console.log("\n📝 Importing posts...");
    let imported = 0;
    let skipped = 0;
    let failed = 0;

    for (const url of uniqueUrls) {
      await delay(REQUEST_DELAY_MS);

      const post = await scrapePost(url);
      if (!post) {
        failed++;
        continue;
      }

      const wasImported = await importPost(post, categoryMap, tagMap);
      if (wasImported) {
        imported++;
      } else {
        skipped++;
      }
    }

    // Summary
    console.log("\n✅ Import complete!");
    console.log("==================");
    console.log(`  Total URLs found: ${uniqueUrls.length}`);
    console.log(`  Imported: ${imported}`);
    console.log(`  Skipped (existing): ${skipped}`);
    console.log(`  Failed: ${failed}`);

    if (DRY_RUN) {
      console.log("\n⚠️  This was a dry run. Run without --dry-run to import posts.");
    }
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
