/**
 * Cleanup Categories Script
 *
 * Merges duplicate categories and removes empty ones.
 * Keeps: Church Branding, Website Design, Digital Marketing, Ministry Tools, Case Studies, SEO
 * Removes: Church Growth, Web Design, Ministry (merging posts first)
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

// Category merges: old slug -> new slug
const CATEGORY_MERGES: Record<string, string> = {
  "web-design": "website-design",      // Web Design -> Website Design
  "ministry": "ministry-tools",        // Ministry -> Ministry Tools
  "church-growth": "digital-marketing", // Church Growth -> Digital Marketing
};

async function main() {
  console.log("🧹 Cleaning up categories...\n");

  // Get all categories
  const categories = await prisma.blogCategory.findMany();
  const categoryMap = new Map(categories.map(c => [c.slug, c]));

  console.log("Current categories:");
  for (const cat of categories) {
    const count = await prisma.blogPost.count({ where: { categoryId: cat.id } });
    console.log(`  - ${cat.name} (${cat.slug}): ${count} posts`);
  }

  console.log("\n" + "=".repeat(60) + "\n");

  // Merge categories
  for (const [oldSlug, newSlug] of Object.entries(CATEGORY_MERGES)) {
    const oldCategory = categoryMap.get(oldSlug);
    const newCategory = categoryMap.get(newSlug);

    if (!oldCategory) {
      console.log(`⏭️  Skipping "${oldSlug}" - category not found`);
      continue;
    }

    if (!newCategory) {
      console.log(`⚠️  Target category "${newSlug}" not found - skipping merge`);
      continue;
    }

    // Count posts in old category
    const postCount = await prisma.blogPost.count({ where: { categoryId: oldCategory.id } });

    if (postCount > 0) {
      // Move posts to new category (one by one - Neon HTTP doesn't support transactions)
      const postsToMove = await prisma.blogPost.findMany({
        where: { categoryId: oldCategory.id },
        select: { id: true },
      });
      for (const post of postsToMove) {
        await prisma.blogPost.update({
          where: { id: post.id },
          data: { categoryId: newCategory.id },
        });
      }
      console.log(`✓ Moved ${postCount} posts from "${oldCategory.name}" to "${newCategory.name}"`);
    }

    // Delete the old category
    await prisma.blogCategory.delete({ where: { id: oldCategory.id } });
    console.log(`✓ Deleted category "${oldCategory.name}"`);
  }

  console.log("\n" + "=".repeat(60) + "\n");

  // Show final state
  console.log("📊 Final categories:\n");
  const finalCategories = await prisma.blogCategory.findMany({ orderBy: { sortOrder: "asc" } });

  for (const cat of finalCategories) {
    const count = await prisma.blogPost.count({ where: { categoryId: cat.id } });
    console.log(`  - ${cat.name}: ${count} posts`);
  }

  await prisma.$disconnect();
  console.log("\n✅ Done!");
}

main().catch(console.error);
