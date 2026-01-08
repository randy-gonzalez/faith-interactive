/**
 * Category Trends Page
 *
 * SEO-friendly URL structure: /trends/category/[categorySlug]
 */

import type { Metadata } from "next";
import { db } from "@/lib/db/neon";
import Link from "next/link";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { notFound } from "next/navigation";

// Force dynamic rendering - database not available at build time
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ categorySlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categorySlug } = await params;

  const category = await db.blogCategory.findUnique({
    where: { slug: categorySlug },
  });

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: `${category.name} | Trends`,
    description: `Thoughts on ${category.name.toLowerCase()} for churches and ministries.`,
  };
}

export default async function CategoryTrendsPage({ params }: PageProps) {
  const { categorySlug } = await params;

  const category = await db.blogCategory.findUnique({
    where: { slug: categorySlug },
  });

  if (!category) {
    notFound();
  }

  const [posts, categories] = await Promise.all([
    db.blogPost.findMany({
      where: { status: "PUBLISHED", categoryId: category.id },
      orderBy: [{ publishedAt: "desc" }],
    }),
    db.blogCategory.findMany({
      orderBy: [{ sortOrder: "asc" }],
    }),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <ScrollReveal>
            <p className="text-micro text-[#737373] mb-6">Trends</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-display hero-headline mb-8">
              {category.name}
            </h1>
          </ScrollReveal>
        </div>
      </section>

      {/* Category Filter */}
      {categories.length > 0 && (
        <section className="border-b border-[#e5e5e5]">
          <div className="container py-6">
            <div className="flex flex-wrap gap-6">
              <Link
                href="/trends"
                className="text-sm font-medium transition-colors text-[#737373] hover:text-[#171717]"
              >
                All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/trends/category/${cat.slug}`}
                  className={`text-sm font-medium transition-colors ${
                    categorySlug === cat.slug
                      ? "text-[#171717]"
                      : "text-[#737373] hover:text-[#171717]"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Posts */}
      <section className="section">
        <div className="container">
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#737373]">Nothing here yet.</p>
            </div>
          ) : (
            <div className="max-w-3xl">
              <div className="divide-y divide-[#e5e5e5]">
                {posts.map((post, index) => (
                  <ScrollReveal key={post.id} delay={0.05 * index}>
                    <Link
                      href={`/trends/${post.slug}`}
                      className="block py-8 group"
                    >
                      <div className="flex items-start justify-between gap-8">
                        <div>
                          <h2 className="h3 mb-2 group-hover:text-[#4f76f6] transition-colors">
                            {post.title}
                          </h2>
                          {post.excerpt && (
                            <p className="text-[#525252] line-clamp-2">
                              {post.excerpt}
                            </p>
                          )}
                        </div>
                        {post.publishedAt && (
                          <time
                            dateTime={post.publishedAt.toISOString()}
                            className="text-sm text-[#737373] whitespace-nowrap"
                          >
                            {post.publishedAt.toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })}
                          </time>
                        )}
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
