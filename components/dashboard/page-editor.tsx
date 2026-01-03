"use client";

/**
 * Page Editor Component
 *
 * Multi-tab page editor for church pages.
 * Tabs: Page Content | Page Settings | SEO / Open Graph
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BlockEditor } from "@/components/blocks/block-editor";
import { PagePreviewModal } from "@/components/dashboard/page-preview-modal";
import type { Block } from "@/types/blocks";
import type { ContentStatus } from "@prisma/client";

interface PageListItem {
  id: string;
  title: string;
  parentId: string | null;
}

interface PageEditorProps {
  initialData?: {
    id: string;
    title: string;
    blocks: unknown; // JSON field from Prisma
    urlPath: string | null;
    featuredImageUrl: string | null;
    parentId: string | null;
    sortOrder: number;
    metaTitle: string | null;
    metaDescription: string | null;
    metaKeywords: string | null;
    ogImage: string | null;
    noIndex: boolean;
    isHomePage: boolean;
    status: ContentStatus;
  };
  canEdit: boolean;
  churchSlug: string;
}

const TABS = [
  { id: "content", label: "Page Content" },
  { id: "settings", label: "Page Settings" },
  { id: "seo", label: "SEO / Open Graph" },
];

/**
 * Build the public URL for a page on the church's subdomain.
 * Handles localhost and production domains.
 * Returns null if called during SSR (window not available).
 */
function getPublicPageUrl(churchSlug: string, pagePath: string): string | null {
  if (typeof window === "undefined") return null;

  const protocol = window.location.protocol;
  const host = window.location.host;

  // Handle localhost (e.g., localhost:3000 → demo.localhost:3000)
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    const [hostname, port] = host.split(":");
    const portSuffix = port ? `:${port}` : "";
    return `${protocol}//${churchSlug}.${hostname}${portSuffix}/${pagePath}`;
  }

  // Handle production (e.g., faithinteractive.com → demo.faithinteractive.com)
  // Remove any existing subdomain first
  const parts = host.split(".");
  const mainDomain = parts.length >= 2 ? parts.slice(-2).join(".") : host;
  return `${protocol}//${churchSlug}.${mainDomain}/${pagePath}`;
}

export function PageEditor({ initialData, canEdit, churchSlug }: PageEditorProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [activeTab, setActiveTab] = useState("content");

  // Form state
  const [title, setTitle] = useState(initialData?.title || "");
  const [blocks, setBlocks] = useState<Block[]>(
    Array.isArray(initialData?.blocks) ? (initialData.blocks as Block[]) : []
  );
  const [urlPath, setUrlPath] = useState(initialData?.urlPath || "");
  const [featuredImageUrl, setFeaturedImageUrl] = useState(
    initialData?.featuredImageUrl || ""
  );
  const [parentId, setParentId] = useState(initialData?.parentId || "");
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder || 0);
  const [status, setStatus] = useState<ContentStatus>(
    initialData?.status || "DRAFT"
  );

  // SEO fields
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(
    initialData?.metaDescription || ""
  );
  const [metaKeywords, setMetaKeywords] = useState(
    initialData?.metaKeywords || ""
  );
  const [ogImage, setOgImage] = useState(initialData?.ogImage || "");
  const [noIndex, setNoIndex] = useState(initialData?.noIndex || false);
  const [isHomePage, setIsHomePage] = useState(initialData?.isHomePage || false);

  // UI state
  const [availablePages, setAvailablePages] = useState<PageListItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [publicPageUrl, setPublicPageUrl] = useState<string | null>(null);

  // Compute public page URL on client side
  useEffect(() => {
    if (isEditing && (urlPath || initialData?.id)) {
      setPublicPageUrl(getPublicPageUrl(churchSlug, urlPath || initialData?.id));
    }
  }, [isEditing, urlPath, initialData?.id, churchSlug]);

  // Load available pages for parent selector
  useEffect(() => {
    async function loadPages() {
      try {
        const response = await fetch("/api/pages");
        const data = await response.json();
        if (data.success && data.data?.pages) {
          // Filter out current page and its descendants
          const pages = data.data.pages.filter(
            (p: PageListItem) => p.id !== initialData?.id
          );
          setAvailablePages(pages);
        }
      } catch {
        // Silently fail - parent selector will just be empty
      }
    }
    loadPages();
  }, [initialData?.id]);

  // Build hierarchical options for parent selector
  function buildPageOptions(
    pages: PageListItem[],
    parentId: string | null = null,
    depth: number = 0
  ): { id: string; title: string; depth: number }[] {
    const result: { id: string; title: string; depth: number }[] = [];
    const children = pages.filter((p) => p.parentId === parentId);

    for (const page of children) {
      result.push({ id: page.id, title: page.title, depth });
      result.push(...buildPageOptions(pages, page.id, depth + 1));
    }

    return result;
  }

  const pageOptions = buildPageOptions(availablePages);

  async function handleSave() {
    if (!canEdit) return;

    setSaving(true);
    setError("");

    try {
      const url = isEditing ? `/api/pages/${initialData.id}` : "/api/pages";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          blocks,
          urlPath: urlPath || null,
          featuredImageUrl: featuredImageUrl || null,
          parentId: parentId || null,
          sortOrder,
          metaTitle: metaTitle || null,
          metaDescription: metaDescription || null,
          metaKeywords: metaKeywords || null,
          ogImage: ogImage || null,
          noIndex,
          isHomePage,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to save page");
        setSaving(false);
        return;
      }

      // Redirect to edit page if creating new
      if (!isEditing) {
        router.push(`/pages/${data.data.page.id}/edit`);
      } else {
        // Show success animation for existing pages
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 2000);
      }
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!canEdit || !initialData) return;
    if (!confirm("Are you sure you want to delete this page?")) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/pages/${initialData.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to delete page");
        setDeleting(false);
        return;
      }

      router.push("/pages");
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Page title */}
      <Input
        label="Page Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        disabled={!canEdit}
        placeholder="Page title"
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab}>
        {/* Page Content Tab */}
        <TabPanel id="content" activeTab={activeTab}>
          <BlockEditor
            blocks={blocks}
            onChange={setBlocks}
            disabled={!canEdit}
            onPreviewClick={() => setShowPreview(true)}
          />
        </TabPanel>

        {/* Page Settings Tab */}
        <TabPanel id="settings" activeTab={activeTab}>
          <div className="space-y-6">
            {/* Homepage Designation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="isHomePage"
                  checked={isHomePage}
                  onChange={(e) => setIsHomePage(e.target.checked)}
                  disabled={!canEdit}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div>
                  <label htmlFor="isHomePage" className="text-sm font-medium text-gray-900">
                    Set as Homepage
                  </label>
                  <p className="text-sm text-gray-600 mt-0.5">
                    This page will be displayed when visitors go to your site&apos;s root URL.
                    {isHomePage && status === "PUBLISHED" && (
                      <span className="block mt-1 text-blue-600 font-medium">
                        This page is currently the homepage.
                      </span>
                    )}
                    {isHomePage && status === "DRAFT" && (
                      <span className="block mt-1 text-amber-600 font-medium">
                        Warning: This page is set as homepage but is currently a draft.
                        Publish this page to make it visible on your site.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Parent Page Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Page (optional)
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                disabled={!canEdit}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No parent (top-level page)</option>
                {pageOptions.map((page) => (
                  <option key={page.id} value={page.id}>
                    {"—".repeat(page.depth)} {page.title}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Nest this page under another page
              </p>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                disabled={!canEdit}
                min={0}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Lower numbers appear first
              </p>
            </div>

            {/* URL Path */}
            <Input
              label="URL Path (optional)"
              value={urlPath}
              onChange={(e) =>
                setUrlPath(
                  e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                )
              }
              disabled={!canEdit}
              placeholder="about-us"
            />
            <p className="-mt-4 text-sm text-gray-500">
              Custom URL path for this page
            </p>
          </div>
        </TabPanel>

        {/* SEO / Open Graph Tab */}
        <TabPanel id="seo" activeTab={activeTab}>
          <div className="space-y-6">
            <Input
              label="Meta Title"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              disabled={!canEdit}
              placeholder="Page Title | Site Name"
              maxLength={200}
            />
            <p className="-mt-4 text-xs text-gray-500">
              {metaTitle.length}/200 characters (50-60 recommended)
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                disabled={!canEdit}
                placeholder="A brief description of this page for search engines..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                maxLength={500}
              />
              <p className="mt-1 text-xs text-gray-500">
                {metaDescription.length}/500 characters (150-160 recommended)
              </p>
            </div>

            <Input
              label="Meta Keywords (optional)"
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
              disabled={!canEdit}
              placeholder="keyword1, keyword2, keyword3"
              maxLength={500}
            />

            <Input
              label="Open Graph Image URL (optional)"
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              disabled={!canEdit}
              placeholder="https://example.com/og-image.jpg"
              type="url"
            />
            <p className="-mt-4 text-xs text-gray-500">
              Image shown when shared on social media (1200x630px recommended)
            </p>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="noIndex"
                checked={noIndex}
                onChange={(e) => setNoIndex(e.target.checked)}
                disabled={!canEdit}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="noIndex" className="text-sm text-gray-700">
                Hide from search engines (noindex)
              </label>
            </div>
          </div>
        </TabPanel>
      </Tabs>

      {/* Fixed Actions Bar */}
      {canEdit && (
        <div className="fixed bottom-0 left-64 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
          <div className="px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Status Toggle */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setStatus("DRAFT")}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none ${
                      status === "DRAFT"
                        ? "bg-gray-600 text-white"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("PUBLISHED")}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none ${
                      status === "PUBLISHED"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    Published
                  </button>
                </div>
              </div>

              {/* Center: Preview Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Preview
                </button>
                {isEditing && publicPageUrl && status === "PUBLISHED" && (
                  <a
                    href={publicPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Page
                  </a>
                )}
              </div>

              {/* Right: Primary Actions */}
              <div className="flex items-center gap-2">
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    isLoading={deleting}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                )}
                <Button size="sm" onClick={handleSave} isLoading={saving}>
                  {saving ? "Saving..." : isEditing ? "Save" : "Create Page"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Success Toast */}
      <div
        className={`fixed bottom-20 right-6 z-50 transition-all duration-300 ${
          showSaveSuccess
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg">
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="font-medium">Changes saved successfully</span>
        </div>
      </div>

      {/* Preview Modal */}
      <PagePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={title}
        blocks={blocks}
        featuredImageUrl={featuredImageUrl || undefined}
        viewport={previewViewport}
        onViewportChange={setPreviewViewport}
      />
    </div>
  );
}
