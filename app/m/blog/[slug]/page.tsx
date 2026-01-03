/**
 * Blog Post Detail Page
 */

import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CTAInline } from "@/components/marketing/cta-section";
import { BlogPostSchema } from "@/components/marketing/structured-data";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import type { Block } from "@/types/blocks";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug, status: "PUBLISHED" },
  });

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || undefined,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt || undefined,
      images: post.ogImage || post.featuredImage ? [post.ogImage || post.featuredImage!] : undefined,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      authors: post.authorName ? [post.authorName] : undefined,
    },
    robots: post.noIndex ? { index: false } : undefined,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      category: true,
      tags: {
        include: { tag: true },
      },
    },
  });

  if (!post) {
    notFound();
  }

  const blocks = Array.isArray(post.blocks) ? (post.blocks as unknown as Block[]) : [];

  // Get related posts
  const relatedPosts = await prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: post.id },
      categoryId: post.categoryId,
    },
    take: 3,
    orderBy: { publishedAt: "desc" },
  });

  return (
    <>
      <BlogPostSchema
        title={post.title}
        description={post.metaDescription || post.excerpt || ""}
        datePublished={post.publishedAt?.toISOString() || post.createdAt.toISOString()}
        dateModified={post.updatedAt.toISOString()}
        authorName={post.authorName || "Faith Interactive"}
        image={post.ogImage || post.featuredImage || undefined}
        url={`https://faith-interactive.com/blog/${post.slug}`}
      />

      <article>
        {/* Hero */}
        <header className="marketing-gradient-subtle py-16">
          <div className="max-w-3xl mx-auto px-4">
            {post.category && (
              <Link
                href={`/blog?category=${post.category.slug}`}
                className="text-sm font-semibold text-[#00d4aa] uppercase tracking-wide hover:underline"
              >
                {post.category.name}
              </Link>
            )}
            <h1 className="text-4xl md:text-5xl font-bold text-[#000646] mt-4 mb-6">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-gray-600">
              {post.publishedAt && (
                <time dateTime={post.publishedAt.toISOString()}>
                  {post.publishedAt.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              )}
              {post.authorName && (
                <>
                  <span>·</span>
                  <span>{post.authorName}</span>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="max-w-4xl mx-auto px-4 -mt-8">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full rounded-2xl shadow-lg"
            />
          </div>
        )}

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 py-12">
          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Block Content */}
          <div className="prose prose-lg max-w-none">
            <BlockRenderer blocks={blocks} />
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-500 mb-3">Tags</p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map(({ tag }) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-12">
            <CTAInline />
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 marketing-gradient-subtle">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-[#000646] mb-8">
              Related Posts
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="marketing-card p-6 group"
                >
                  <h3 className="font-bold text-[#000646] group-hover:text-[#00d4aa] transition-colors line-clamp-2">
                    {relatedPost.title}
                  </h3>
                  {relatedPost.excerpt && (
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
