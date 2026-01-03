/**
 * Blog Posts List Page
 *
 * List all blog posts with filtering and management.
 */

import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { requirePlatformUserOrRedirect, isPlatformAdmin } from "@/lib/auth/guards";

export default async function BlogPostsPage() {
  const user = await requirePlatformUserOrRedirect();
  const canEdit = isPlatformAdmin(user);

  const [posts, categories] = await Promise.all([
    prisma.blogPost.findMany({
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    }),
    prisma.blogCategory.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  const draftCount = posts.filter((p) => p.status === "DRAFT").length;
  const publishedCount = posts.filter((p) => p.status === "PUBLISHED").length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600">
            Manage blog posts for the Faith Interactive marketing site.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/marketing/blog/categories"
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Categories & Tags
          </Link>
          {canEdit && (
            <Link
              href="/marketing/blog/new"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Post
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Posts</p>
          <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Published</p>
          <p className="text-2xl font-bold text-green-600">{publishedCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Drafts</p>
          <p className="text-2xl font-bold text-gray-600">{draftCount}</p>
        </div>
      </div>

      {/* Posts table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No blog posts yet.</p>
            {canEdit && (
              <Link
                href="/marketing/blog/new"
                className="text-indigo-600 hover:text-indigo-800 mt-2 inline-block"
              >
                Create your first post
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{post.title}</p>
                      <p className="text-sm text-gray-500">/{post.slug}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {post.category ? (
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
                        {post.category.name}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">Uncategorized</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {post.authorName || "Unknown"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {post.publishedAt
                      ? formatDate(post.publishedAt)
                      : formatDate(post.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right space-x-4">
                    {post.status === "PUBLISHED" && (
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900 text-sm"
                      >
                        View
                      </a>
                    )}
                    <Link
                      href={`/marketing/blog/${post.id}`}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isPublished = status === "PUBLISHED";
  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
        isPublished
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-700"
      }`}
    >
      {isPublished ? "Published" : "Draft"}
    </span>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
