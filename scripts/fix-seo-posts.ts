/**
 * Fix SEO Posts Script
 * Moves posts with "SEO" in the title to the SEO category
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

async function main() {
  console.log("🔍 Finding SEO posts...\n");

  // Find SEO category
  const seoCategory = await prisma.blogCategory.findUnique({ where: { slug: "seo" } });
  if (!seoCategory) {
    console.log("SEO category not found!");
    return;
  }

  // Find all posts
  const allPosts = await prisma.blogPost.findMany({
    select: { id: true, title: true, categoryId: true, category: { select: { name: true } } },
  });

  // Filter posts with SEO in title
  const seoPosts = allPosts.filter(p => p.title.toLowerCase().includes("seo"));

  console.log(`Found ${seoPosts.length} posts with "SEO" in title:\n`);

  for (const post of seoPosts) {
    console.log(`  "${post.title}"`);
    console.log(`    Current category: ${post.category?.name || "None"}`);

    if (post.categoryId !== seoCategory.id) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { categoryId: seoCategory.id },
      });
      console.log(`    ✓ Moved to SEO category`);
    } else {
      console.log(`    (already in SEO)`);
    }
  }

  // Show final counts
  console.log("\n" + "=".repeat(50));
  console.log("\n📊 Final category counts:\n");

  const categories = await prisma.blogCategory.findMany({ orderBy: { name: "asc" } });
  for (const cat of categories) {
    const count = await prisma.blogPost.count({ where: { categoryId: cat.id } });
    console.log(`  ${cat.name}: ${count} posts`);
  }

  await prisma.$disconnect();
  console.log("\n✅ Done!");
}

main().catch(console.error);
