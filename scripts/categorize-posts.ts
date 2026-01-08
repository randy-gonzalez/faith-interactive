/**
 * Categorize Posts Script
 *
 * Reviews all blog posts and assigns them to appropriate categories
 * based on their content and title.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaNeonHTTP } from "@prisma/adapter-neon";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const adapter = new PrismaNeonHTTP(connectionString, {
  arrayMode: false,
  fullResults: true,
});
const prisma = new PrismaClient({ adapter });

// Category assignment rules based on title/content keywords
const CATEGORY_RULES: Record<string, { keywords: string[]; categorySlug: string }[]> = {
  // Posts about Revive program winners should be in Case Studies
  "case-studies": [
    { keywords: ["revive winner", "revive ministry", "our first revive", "our second revive", "our third revive", "our fourth revive", "our fifth revive", "our sixth revive", "website makeover for churches"], categorySlug: "case-studies" },
    { keywords: ["new website!", "brand new website", "lights up online", "digital transformation"], categorySlug: "case-studies" },
  ],
  // Branding posts
  "church-branding": [
    { keywords: ["brand identity", "branding", "typography", "color psychology", "fonts shape"], categorySlug: "church-branding" },
  ],
  // Website design posts
  "website-design": [
    { keywords: ["user experience", "mobile-friendly", "well-designed", "website design", "welcoming user experience"], categorySlug: "website-design" },
  ],
  // Digital marketing posts
  "digital-marketing": [
    { keywords: ["seo", "email design", "email list", "segmentation", "keywords", "online presence", "content strategy"], categorySlug: "digital-marketing" },
  ],
  // Ministry tools posts
  "ministry-tools": [
    { keywords: ["online giving", "sermon video", "bible study", "livestream", "devotional", "worship song", "ai for church"], categorySlug: "ministry-tools" },
  ],
};

async function main() {
  console.log("📊 Analyzing posts and categories...\n");

  // Get all categories
  const categories = await prisma.blogCategory.findMany();
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));

  console.log("Categories:");
  for (const cat of categories) {
    const count = await prisma.blogPost.count({ where: { categoryId: cat.id } });
    console.log(`  - ${cat.name}: ${count} posts`);
  }

  // Get all posts
  const posts = await prisma.blogPost.findMany({
    select: { id: true, title: true, slug: true, excerpt: true, categoryId: true, category: { select: { name: true, slug: true } } },
    orderBy: { title: "asc" },
  });

  console.log(`\nTotal posts: ${posts.length}\n`);
  console.log("=".repeat(80));

  // Categorization updates
  const updates: { id: string; title: string; oldCategory: string; newCategory: string; newCategoryId: string }[] = [];

  for (const post of posts) {
    const titleLower = post.title.toLowerCase();
    const excerptLower = (post.excerpt || "").toLowerCase();
    const combined = `${titleLower} ${excerptLower}`;

    let newCategorySlug: string | null = null;

    // Check for Case Studies (Revive winners, new website launches)
    if (
      combined.includes("revive winner") ||
      combined.includes("revive ministry") ||
      titleLower.includes("our first revive") ||
      titleLower.includes("our second revive") ||
      titleLower.includes("our third revive") ||
      titleLower.includes("our fourth revive") ||
      titleLower.includes("our fifth revive") ||
      titleLower.includes("our sixth revive") ||
      titleLower.includes("website makeover for churches") ||
      titleLower.includes("new website!") ||
      titleLower.includes("brand new website") ||
      titleLower.includes("lights up online") ||
      titleLower.includes("digital transformation") ||
      titleLower.includes("partnering for a cause")
    ) {
      newCategorySlug = "case-studies";
    }
    // Check for Church Branding
    else if (
      combined.includes("brand identity") ||
      combined.includes("church branding") ||
      combined.includes("typography") ||
      combined.includes("color psychology") ||
      combined.includes("fonts shape") ||
      titleLower.includes("photography")
    ) {
      newCategorySlug = "church-branding";
    }
    // Check for Website Design
    else if (
      combined.includes("user experience") ||
      combined.includes("mobile-friendly") ||
      combined.includes("well-designed") ||
      combined.includes("welcoming") && combined.includes("website") ||
      titleLower.includes("key elements") && titleLower.includes("website")
    ) {
      newCategorySlug = "website-design";
    }
    // Check for Digital Marketing
    else if (
      combined.includes("seo") ||
      combined.includes("email design") ||
      combined.includes("email list") ||
      combined.includes("segmentation") ||
      combined.includes("keywords") ||
      combined.includes("content strategy") ||
      titleLower.includes("online presence") ||
      titleLower.includes("plan a visit") ||
      titleLower.includes("outreach")
    ) {
      newCategorySlug = "digital-marketing";
    }
    // Check for Ministry Tools
    else if (
      combined.includes("online giving") ||
      combined.includes("sermon video") ||
      combined.includes("bible study") ||
      combined.includes("livestream") ||
      combined.includes("devotional") ||
      combined.includes("worship song") ||
      combined.includes("ai for church") ||
      titleLower.includes("donations")
    ) {
      newCategorySlug = "ministry-tools";
    }

    // If we found a better category, record the update
    if (newCategorySlug && post.category?.slug !== newCategorySlug) {
      const newCategoryId = categoryMap.get(newCategorySlug);
      if (newCategoryId) {
        updates.push({
          id: post.id,
          title: post.title,
          oldCategory: post.category?.name || "None",
          newCategory: categories.find(c => c.slug === newCategorySlug)?.name || newCategorySlug,
          newCategoryId,
        });
      }
    }
  }

  console.log(`\nProposed category changes: ${updates.length}\n`);

  if (updates.length === 0) {
    console.log("No changes needed - all posts are properly categorized.");
    await prisma.$disconnect();
    return;
  }

  // Show proposed changes
  for (const update of updates) {
    console.log(`  "${update.title}"`);
    console.log(`    ${update.oldCategory} → ${update.newCategory}`);
  }

  // Apply updates
  console.log("\n🔄 Applying updates...\n");

  for (const update of updates) {
    await prisma.blogPost.update({
      where: { id: update.id },
      data: { categoryId: update.newCategoryId },
    });
    console.log(`  ✓ Updated: ${update.title}`);
  }

  // Show final counts
  console.log("\n" + "=".repeat(80));
  console.log("\n📊 Final category counts:\n");

  for (const cat of categories) {
    const count = await prisma.blogPost.count({ where: { categoryId: cat.id } });
    console.log(`  - ${cat.name}: ${count} posts`);
  }

  await prisma.$disconnect();
  console.log("\n✅ Done!");
}

main().catch(console.error);
