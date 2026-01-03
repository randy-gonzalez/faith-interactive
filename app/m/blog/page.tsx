/**
 * Blog Page
 *
 * List of published blog posts.
 */

import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Tips, trends, and insights for church websites and digital ministry. Stay up to date with the latest in church technology.",
};

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function BlogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const categorySlug = params.category;

  // Build where clause
  const where: Record<string, unknown> = { status: "PUBLISHED" };
  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  const [posts, categories] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      include: {
        category: true,
      },
    }),
    prisma.blogCategory.findMany({
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="marketing-gradient-subtle py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#000646] mb-4">
            Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tips, trends, and insights for church websites and digital ministry.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      {categories.length > 0 && (
        <section className="py-8 bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/blog"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !categorySlug
                    ? "bg-gradient-to-r from-[#77f2a1] to-[#00ffce] text-[#000646]"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/blog?category=${category.slug}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    categorySlug === category.slug
                      ? "bg-gradient-to-r from-[#77f2a1] to-[#00ffce] text-[#000646]"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                {categorySlug
                  ? "No posts in this category yet."
                  : "No blog posts yet. Check back soon!"}
              </p>
              {categorySlug && (
                <Link href="/blog" className="text-[#00d4aa] font-semibold hover:underline">
                  View all posts →
                </Link>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="marketing-card overflow-hidden group"
                >
                  {/* Image */}
                  <div className="aspect-video bg-gradient-to-br from-[#77f2a1]/20 to-[#00ffce]/20 relative overflow-hidden">
                    {post.featuredImage ? (
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-[#00d4aa]/30"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {post.category && (
                      <span className="text-xs font-semibold text-[#00d4aa] uppercase tracking-wide">
                        {post.category.name}
                      </span>
                    )}
                    <h2 className="text-lg font-bold text-[#000646] mt-2 mb-2 group-hover:text-[#00d4aa] transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-gray-600 text-sm line-clamp-2">{post.excerpt}</p>
                    )}
                    <div className="mt-4 text-sm text-gray-500">
                      {post.publishedAt && (
                        <time dateTime={post.publishedAt.toISOString()}>
                          {post.publishedAt.toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </time>
                      )}
                      {post.authorName && <span> · {post.authorName}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
