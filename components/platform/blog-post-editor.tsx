"use client";

/**
 * Blog Post Editor Component
 *
 * Multi-tab editor for blog posts.
 * Tabs: Content | Settings | SEO
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { BlockEditor } from "@/components/blocks/block-editor";
import type { Block } from "@/types/blocks";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface BlogPostEditorProps {
  post?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    blocks: unknown;
    featuredImage: string | null;
    categoryId: string | null;
    authorName: string | null;
    status: string;
    metaTitle: string | null;
    metaDescription: string | null;
    ogImage: string | null;
    noIndex: boolean;
    tags: Tag[];
  };
  categories: Category[];
  tags: Tag[];
}

const TABS = [
  { id: "content", label: "Content" },
  { id: "settings", label: "Settings" },
  { id: "seo", label: "SEO" },
];

export function BlogPostEditor({ post, categories, tags }: BlogPostEditorProps) {
  const router = useRouter();
  const isEditing = !!post;

  const [activeTab, setActiveTab] = useState("content");

  // Form state
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [blocks, setBlocks] = useState<Block[]>(
    Array.isArray(post?.blocks) ? (post.blocks as Block[]) : []
  );
  const [featuredImage, setFeaturedImage] = useState(post?.featuredImage || "");
  const [categoryId, setCategoryId] = useState(post?.categoryId || "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    post?.tags?.map((t) => t.id) || []
  );
  const [authorName, setAuthorName] = useState(post?.authorName || "");
  const [status, setStatus] = useState(post?.status || "DRAFT");

  // SEO fields
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription || "");
  const [ogImage, setOgImage] = useState(post?.ogImage || "");
  const [noIndex, setNoIndex] = useState(post?.noIndex || false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate slug from title
  function handleTitleChange(newTitle: string) {
    setTitle(newTitle);
    if (!isEditing && slug === generateSlug(title)) {
      setSlug(generateSlug(newTitle));
    }
  }

  function generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEditing
        ? `/api/platform/marketing/blog/posts/${post.id}`
        : "/api/platform/marketing/blog/posts";

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          excerpt: excerpt || null,
          blocks,
          featuredImage: featuredImage || null,
          categoryId: categoryId || null,
          tagIds: selectedTagIds,
          authorName: authorName || null,
          status,
          metaTitle: metaTitle || null,
          metaDescription: metaDescription || null,
          ogImage: ogImage || null,
          noIndex,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save post");
      }

      router.push("/marketing/blog");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!isEditing || !confirm("Are you sure you want to delete this post?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/platform/marketing/blog/posts/${post.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete post");
      }

      router.push("/marketing/blog");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="How to Build an Effective Church Website"
        />
      </div>

      {/* Tabs */}
      <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab}>
        {/* Content Tab */}
        <TabPanel id="content" activeTab={activeTab}>
          <div className="space-y-6">
            {/* Excerpt */}
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                maxLength={500}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="A brief summary shown in blog listings..."
              />
              <p className="mt-1 text-xs text-gray-500">{excerpt.length}/500 characters</p>
            </div>

            {/* Block Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Post Content
              </label>
              <BlockEditor blocks={blocks} onChange={setBlocks} disabled={loading} />
            </div>
          </div>
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel id="settings" activeTab={activeTab}>
          <div className="space-y-6">
            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                URL Slug *
              </label>
              <div className="flex items-center">
                <span className="px-4 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 text-sm">
                  faithinteractive.com/blog/
                </span>
                <input
                  type="text"
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  required
                  pattern="^[a-z0-9-]+$"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="effective-church-website"
                />
              </div>
            </div>

            {/* Featured Image */}
            <div>
              <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700 mb-1">
                Featured Image URL
              </label>
              <input
                type="text"
                id="featuredImage"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://..."
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="categoryId"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Uncategorized</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.length === 0 ? (
                  <p className="text-sm text-gray-500">No tags available. Create some in Categories & Tags.</p>
                ) : (
                  tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                        selectedTagIds.includes(tag.id)
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Author */}
            <div>
              <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-1">
                Author Name
              </label>
              <input
                type="text"
                id="authorName"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="John Smith"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Publication Status</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="DRAFT"
                    checked={status === "DRAFT"}
                    onChange={(e) => setStatus(e.target.value)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-gray-700">Draft</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="PUBLISHED"
                    checked={status === "PUBLISHED"}
                    onChange={(e) => setStatus(e.target.value)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-gray-700">Published</span>
                </label>
              </div>
            </div>
          </div>
        </TabPanel>

        {/* SEO Tab */}
        <TabPanel id="seo" activeTab={activeTab}>
          <div className="space-y-6">
            <div>
              <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Meta Title
              </label>
              <input
                type="text"
                id="metaTitle"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                maxLength={200}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Post Title | Faith Interactive Blog"
              />
              <p className="mt-1 text-xs text-gray-500">{metaTitle.length}/200 (50-60 recommended)</p>
            </div>

            <div>
              <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
              </label>
              <textarea
                id="metaDescription"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={2}
                maxLength={500}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="A brief description for search engines..."
              />
              <p className="mt-1 text-xs text-gray-500">{metaDescription.length}/500 (150-160 recommended)</p>
            </div>

            <div>
              <label htmlFor="ogImage" className="block text-sm font-medium text-gray-700 mb-1">
                Open Graph Image URL
              </label>
              <input
                type="text"
                id="ogImage"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://..."
              />
              <p className="mt-1 text-xs text-gray-500">1200x630px recommended for social sharing</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="noIndex"
                checked={noIndex}
                onChange={(e) => setNoIndex(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="noIndex" className="text-sm text-gray-700">
                Hide from search engines (noindex)
              </label>
            </div>
          </div>
        </TabPanel>
      </Tabs>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : isEditing ? "Update Post" : "Create Post"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
        </div>

        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 text-red-600 hover:text-red-800 disabled:opacity-50"
          >
            Delete Post
          </button>
        )}
      </div>
    </form>
  );
}
