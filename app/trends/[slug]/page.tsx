/**
 * Trends Post Detail Page
 *
 * Purpose: Share the full article.
 * Clean, readable, focused on content.
 */

import type { Metadata } from "next";
import { db } from "@/lib/db/neon";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BlogPostSchema } from "@/components/marketing/structured-data";
import type { TextBlock } from "@/types/blocks";

// Force dynamic rendering - database not available at build time on Cloudflare
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.blogPost.findUnique({
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

export default async function TrendsPostPage({ params }: PageProps) {
  const { slug } = await params;

  const post = await db.blogPost.findUnique({
    where: { slug, status: "PUBLISHED" },
  });

  if (!post) {
    notFound();
  }

  // Extract text content from blocks for article rendering
  const blocks = Array.isArray(post.blocks) ? (post.blocks as unknown as TextBlock[]) : [];
  const articleContent = blocks
    .filter((block) => block.type === "text" && block.data?.content)
    .map((block) => block.data.content)
    .join("");

  return (
    <>
      <BlogPostSchema
        title={post.title}
        description={post.metaDescription || post.excerpt || ""}
        datePublished={post.publishedAt?.toISOString() || post.createdAt.toISOString()}
        dateModified={post.updatedAt.toISOString()}
        authorName={post.authorName || "Faith Interactive"}
        image={post.ogImage || post.featuredImage || undefined}
        url={`https://faith-interactive.com/trends/${post.slug}`}
      />

      <article>
        {/* Header */}
        <header className="hero">
          <div className="container">
            <div className="max-w-3xl">
              <Link
                href="/trends"
                className="text-micro text-[#737373] hover:text-[#171717] transition-colors mb-6 inline-block"
              >
                &larr; Trends
              </Link>
              <h1 className="text-display mb-6">{post.title}</h1>
              <div className="flex items-center gap-4 text-[#737373]">
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
                    <span>&middot;</span>
                    <span>{post.authorName}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="container mb-16">
            <div className="max-w-4xl">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="container">
          <div className="max-w-3xl">
            {post.excerpt && (
              <p className="text-large text-[var(--fi-gray-700)] mb-12 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {/* Article content with marketing typography */}
            <div
              className="prose-article"
              dangerouslySetInnerHTML={{ __html: articleContent }}
            />
          </div>
        </div>
      </article>

      {/* Back to Trends */}
      <section className="section">
        <div className="container">
          <div className="max-w-3xl">
            <Link href="/trends" className="link-arrow">
              Back to Trends
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
