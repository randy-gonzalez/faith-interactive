"use client";

/**
 * Marketing Page Editor Component
 *
 * Multi-tab page editor for Faith Interactive marketing pages.
 * Tabs: Page Content | Page Settings | SEO / Open Graph
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { BlockEditor } from "@/components/blocks/block-editor";
import type { Block } from "@/types/blocks";

interface PageListItem {
  id: string;
  title: string;
  parentId: string | null;
}

interface MarketingPageEditorProps {
  page?: {
    id: string;
    title: string;
    slug: string;
    blocks: unknown; // JSON field from Prisma
    parentId: string | null;
    sortOrder: number;
    metaTitle: string | null;
    metaDescription: string | null;
    metaKeywords: string | null;
    ogImage: string | null;
    noIndex: boolean;
    status: string;
  };
}

const TABS = [
  { id: "content", label: "Page Content" },
  { id: "settings", label: "Page Settings" },
  { id: "seo", label: "SEO / Open Graph" },
];

export function MarketingPageEditor({ page }: MarketingPageEditorProps) {
  const router = useRouter();
  const isEditing = !!page;

  const [activeTab, setActiveTab] = useState("content");

  // Form state
  const [title, setTitle] = useState(page?.title || "");
  const [slug, setSlug] = useState(page?.slug || "");
  const [blocks, setBlocks] = useState<Block[]>(
    Array.isArray(page?.blocks) ? (page.blocks as Block[]) : []
  );
  const [parentId, setParentId] = useState(page?.parentId || "");
  const [sortOrder, setSortOrder] = useState(page?.sortOrder || 0);
  const [status, setStatus] = useState(page?.status || "DRAFT");

  // SEO fields
  const [metaTitle, setMetaTitle] = useState(page?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(
    page?.metaDescription || ""
  );
  const [metaKeywords, setMetaKeywords] = useState(page?.metaKeywords || "");
  const [ogImage, setOgImage] = useState(page?.ogImage || "");
  const [noIndex, setNoIndex] = useState(page?.noIndex || false);

  // UI state
  const [availablePages, setAvailablePages] = useState<PageListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available pages for parent selector
  useEffect(() => {
    async function loadPages() {
      try {
        const response = await fetch("/api/platform/marketing/pages");
        const data = await response.json();
        if (data.pages) {
          // Filter out current page
          const pages = data.pages.filter(
            (p: PageListItem) => p.id !== page?.id
          );
          setAvailablePages(pages);
        }
      } catch {
        // Silently fail - parent selector will just be empty
      }
    }
    loadPages();
  }, [page?.id]);

  // Build hierarchical options for parent selector
  function buildPageOptions(
    pages: PageListItem[],
    parentId: string | null = null,
    depth: number = 0
  ): { id: string; title: string; depth: number }[] {
    const result: { id: string; title: string; depth: number }[] = [];
    const children = pages.filter((p) => p.parentId === parentId);

    for (const p of children) {
      result.push({ id: p.id, title: p.title, depth });
      result.push(...buildPageOptions(pages, p.id, depth + 1));
    }

    return result;
  }

  const pageOptions = buildPageOptions(availablePages);

  // Auto-generate slug from title (only when creating new)
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEditing
        ? `/api/platform/marketing/pages/${page.id}`
        : "/api/platform/marketing/pages";

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          blocks,
          parentId: parentId || null,
          sortOrder,
          metaTitle: metaTitle || null,
          metaDescription: metaDescription || null,
          metaKeywords: metaKeywords || null,
          ogImage: ogImage || null,
          noIndex,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save page");
      }

      router.push("/platform/marketing/pages");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!isEditing || !confirm("Are you sure you want to delete this page?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/platform/marketing/pages/${page.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete page");
      }

      router.push("/platform/marketing/pages");
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

      {/* Title - always visible */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="About Us"
        />
      </div>

      {/* Tabs */}
      <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab}>
        {/* Page Content Tab */}
        <TabPanel id="content" activeTab={activeTab}>
          <BlockEditor
            blocks={blocks}
            onChange={setBlocks}
            disabled={loading}
          />
        </TabPanel>

        {/* Page Settings Tab */}
        <TabPanel id="settings" activeTab={activeTab}>
          <div className="space-y-6">
            {/* Slug */}
            <div>
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                URL Slug *
              </label>
              <div className="flex items-center">
                <span className="px-4 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 text-sm">
                  faithinteractive.com/
                </span>
                <input
                  type="text"
                  id="slug"
                  value={slug}
                  onChange={(e) =>
                    setSlug(
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                    )
                  }
                  required
                  pattern="^[a-z0-9-]+$"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="about-us"
                />
              </div>
            </div>

            {/* Parent Page Selector */}
            <div>
              <label
                htmlFor="parentId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Parent Page (optional)
              </label>
              <select
                id="parentId"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">No parent (top-level page)</option>
                {pageOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {"—".repeat(p.depth)} {p.title}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Nest this page under another page
              </p>
            </div>

            {/* Sort Order */}
            <div>
              <label
                htmlFor="sortOrder"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Sort Order
              </label>
              <input
                type="number"
                id="sortOrder"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                min={0}
                className="w-24 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Lower numbers appear first
              </p>
            </div>

            {/* Publication Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publication Status
              </label>
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

        {/* SEO / Open Graph Tab */}
        <TabPanel id="seo" activeTab={activeTab}>
          <div className="space-y-6">
            <div>
              <label
                htmlFor="metaTitle"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Meta Title
              </label>
              <input
                type="text"
                id="metaTitle"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                maxLength={200}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Page Title | Faith Interactive"
              />
              <p className="mt-1 text-xs text-gray-500">
                {metaTitle.length}/200 characters (50-60 recommended)
              </p>
            </div>

            <div>
              <label
                htmlFor="metaDescription"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
              <p className="mt-1 text-xs text-gray-500">
                {metaDescription.length}/500 characters (150-160 recommended)
              </p>
            </div>

            <div>
              <label
                htmlFor="metaKeywords"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Meta Keywords (optional)
              </label>
              <input
                type="text"
                id="metaKeywords"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                maxLength={500}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>

            <div>
              <label
                htmlFor="ogImage"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Open Graph Image URL (optional)
              </label>
              <input
                type="url"
                id="ogImage"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://example.com/og-image.jpg"
              />
              <p className="mt-1 text-xs text-gray-500">
                Image shown when shared on social media (1200x630px recommended)
              </p>
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
            {loading ? "Saving..." : isEditing ? "Update Page" : "Create Page"}
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
            Delete Page
          </button>
        )}
      </div>
    </form>
  );
}
