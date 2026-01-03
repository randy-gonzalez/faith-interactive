/**
 * New Blog Post Page
 *
 * Platform admin page for creating a new blog post.
 */

import { prisma } from "@/lib/db/prisma";
import { requirePlatformUser } from "@/lib/auth/guards";
import { BlogPostEditor } from "@/components/platform/blog-post-editor";
import Link from "next/link";

export default async function NewBlogPostPage() {
  await requirePlatformUser();

  // Fetch categories and tags for the editor
  const [categories, tags] = await Promise.all([
    prisma.blogCategory.findMany({
      orderBy: { sortOrder: "asc" },
    }),
    prisma.blogTag.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

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
        <h1 className="text-2xl font-bold text-gray-900">Create Blog Post</h1>
        <p className="text-gray-600 mt-1">
          Write a new blog post for the Faith Interactive marketing site.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <BlogPostEditor categories={categories} tags={tags} />
      </div>
    </div>
  );
}
