/**
 * Edit Blog Post Page
 *
 * Platform admin page for editing an existing blog post.
 */

import { prisma } from "@/lib/db/prisma";
import { requirePlatformUser } from "@/lib/auth/guards";
import { BlogPostEditor } from "@/components/platform/blog-post-editor";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: PageProps) {
  await requirePlatformUser();
  const { id } = await params;

  // Fetch the post with its tags
  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  // Fetch categories and tags for the editor
  const [categories, tags] = await Promise.all([
    prisma.blogCategory.findMany({
      orderBy: { sortOrder: "asc" },
    }),
    prisma.blogTag.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  // Transform post data for the editor
  const postForEditor = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    blocks: post.blocks,
    featuredImage: post.featuredImage,
    categoryId: post.categoryId,
    authorName: post.authorName,
    status: post.status,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    ogImage: post.ogImage,
    noIndex: post.noIndex,
    tags: post.tags.map((pt) => ({
      id: pt.tag.id,
      name: pt.tag.name,
      slug: pt.tag.slug,
    })),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/marketing/blog"
          className="text-gray-500 hover:text-gray-700"
        >
          ← Back to Blog Posts
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Blog Post</h1>
        <p className="text-gray-600 mt-1">
          Update &ldquo;{post.title}&rdquo;
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <BlogPostEditor post={postForEditor} categories={categories} tags={tags} />
      </div>
    </div>
  );
}
