/**
 * Trends Page
 *
 * Purpose: Share useful thinking, not content marketing.
 * Answer: "What are these people thinking about?"
 *
 * Intentionally excluded:
 * - Card-heavy layouts
 * - Gradient pill buttons
 * - Marketing language in descriptions
 */

import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";

export const metadata: Metadata = {
  title: "Trends",
  description:
    "Thoughts on church websites, design, and digital presence.",
};

// Force dynamic rendering - database not available at build time on Cloudflare
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function TrendsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const categorySlug = params.category;

  const where: Record<string, unknown> = { status: "PUBLISHED" };
  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  const [posts, categories] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      include: { category: true },
    }),
    prisma.blogCategory.findMany({
      orderBy: { sortOrder: "asc" },
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
              Thoughts on church & design
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
                className={`text-sm font-medium transition-colors ${
                  !categorySlug ? "text-[#171717]" : "text-[#737373] hover:text-[#171717]"
                }`}
              >
                All
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/trends?category=${category.slug}`}
                  className={`text-sm font-medium transition-colors ${
                    categorySlug === category.slug
                      ? "text-[#171717]"
                      : "text-[#737373] hover:text-[#171717]"
                  }`}
                >
                  {category.name}
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
              <p className="text-[#737373]">
                {categorySlug ? "Nothing here yet." : "Coming soon."}
              </p>
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
