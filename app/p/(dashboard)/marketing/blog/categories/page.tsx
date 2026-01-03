/**
 * Blog Categories & Tags Management Page
 */

import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { requirePlatformUserOrRedirect, isPlatformAdmin } from "@/lib/auth/guards";
import { CategoryForm } from "./category-form";
import { TagForm } from "./tag-form";

export default async function BlogCategoriesPage() {
  const user = await requirePlatformUserOrRedirect();
  const canEdit = isPlatformAdmin(user);

  const [categories, tags] = await Promise.all([
    prisma.blogCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: { posts: true },
        },
      },
    }),
    prisma.blogTag.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories & Tags</h1>
          <p className="text-gray-600">
            Organize your blog posts with categories and tags.
          </p>
        </div>
        <Link
          href="/marketing/blog"
          className="text-indigo-600 hover:text-indigo-800"
        >
          ← Back to Posts
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
            <p className="text-sm text-gray-500">Each post can have one category.</p>
          </div>

          {canEdit && (
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <CategoryForm />
            </div>
          )}

          <div className="divide-y divide-gray-200">
            {categories.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No categories yet.
              </div>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{category.name}</p>
                    <p className="text-sm text-gray-500">
                      /{category.slug} • {category._count.posts} post{category._count.posts !== 1 ? "s" : ""}
                    </p>
                  </div>
                  {canEdit && (
                    <CategoryActions category={category} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
            <p className="text-sm text-gray-500">Posts can have multiple tags.</p>
          </div>

          {canEdit && (
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <TagForm />
            </div>
          )}

          <div className="px-6 py-4">
            {tags.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No tags yet.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <TagBadge key={tag.id} tag={tag} canEdit={canEdit} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryActions({ category }: { category: { id: string; name: string; _count: { posts: number } } }) {
  return (
    <form action={`/api/platform/marketing/blog/categories/${category.id}`} method="DELETE">
      <button
        type="button"
        className="text-red-600 hover:text-red-800 text-sm"
        disabled={category._count.posts > 0}
        title={category._count.posts > 0 ? "Remove posts from this category first" : "Delete category"}
        onClick={async (e) => {
          e.preventDefault();
          if (category._count.posts > 0) {
            alert("Remove posts from this category first");
            return;
          }
          if (!confirm(`Delete category "${category.name}"?`)) return;
          const res = await fetch(`/api/platform/marketing/blog/categories/${category.id}`, {
            method: "DELETE",
          });
          if (res.ok) {
            window.location.reload();
          } else {
            const data = await res.json();
            alert(data.error || "Failed to delete");
          }
        }}
      >
        Delete
      </button>
    </form>
  );
}

function TagBadge({ tag, canEdit }: { tag: { id: string; name: string; slug: string; _count: { posts: number } }; canEdit: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-700">
      {tag.name}
      <span className="text-gray-400">({tag._count.posts})</span>
      {canEdit && (
        <button
          type="button"
          className="ml-1 text-gray-400 hover:text-red-600"
          onClick={async () => {
            if (!confirm(`Delete tag "${tag.name}"?`)) return;
            const res = await fetch(`/api/platform/marketing/blog/tags/${tag.id}`, {
              method: "DELETE",
            });
            if (res.ok) {
              window.location.reload();
            } else {
              const data = await res.json();
              alert(data.error || "Failed to delete");
            }
          }}
        >
          ×
        </button>
      )}
    </span>
  );
}
