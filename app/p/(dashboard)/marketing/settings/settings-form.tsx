"use client";

/**
 * Marketing Site Settings Form
 *
 * Client component for editing marketing site settings.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MarketingSiteSettings } from "@prisma/client";

interface NavItem {
  label: string;
  url: string;
  order: number;
}

interface MarketingSettingsFormProps {
  settings: MarketingSiteSettings;
  pages: { slug: string; title: string }[];
}

export function MarketingSettingsForm({ settings, pages }: MarketingSettingsFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [siteName, setSiteName] = useState(settings.siteName);
  const [defaultMetaTitle, setDefaultMetaTitle] = useState(settings.defaultMetaTitle || "");
  const [defaultMetaDescription, setDefaultMetaDescription] = useState(settings.defaultMetaDescription || "");
  const [faviconUrl, setFaviconUrl] = useState(settings.faviconUrl || "");
  const [homePageSlug, setHomePageSlug] = useState(settings.homePageSlug);
  const [footerText, setFooterText] = useState(settings.footerText || "");

  // Navigation items - cast through unknown for JSON fields
  const [headerNav, setHeaderNav] = useState<NavItem[]>(
    (settings.headerNavigation as unknown as NavItem[]) || []
  );
  const [footerLinks, setFooterLinks] = useState<NavItem[]>(
    (settings.footerLinks as unknown as NavItem[]) || []
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/platform/marketing/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteName,
          defaultMetaTitle: defaultMetaTitle || null,
          defaultMetaDescription: defaultMetaDescription || null,
          faviconUrl: faviconUrl || null,
          homePageSlug,
          footerText: footerText || null,
          headerNavigation: headerNav,
          footerLinks,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save settings");
        return;
      }

      setSuccess(true);
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  }

  function addNavItem(type: "header" | "footer") {
    const newItem: NavItem = { label: "", url: "", order: 0 };
    if (type === "header") {
      newItem.order = headerNav.length;
      setHeaderNav([...headerNav, newItem]);
    } else {
      newItem.order = footerLinks.length;
      setFooterLinks([...footerLinks, newItem]);
    }
  }

  function updateNavItem(type: "header" | "footer", index: number, field: keyof NavItem, value: string | number) {
    if (type === "header") {
      const updated = [...headerNav];
      updated[index] = { ...updated[index], [field]: value };
      setHeaderNav(updated);
    } else {
      const updated = [...footerLinks];
      updated[index] = { ...updated[index], [field]: value };
      setFooterLinks(updated);
    }
  }

  function removeNavItem(type: "header" | "footer", index: number) {
    if (type === "header") {
      setHeaderNav(headerNav.filter((_, i) => i !== index));
    } else {
      setFooterLinks(footerLinks.filter((_, i) => i !== index));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          Settings saved successfully!
        </div>
      )}

      {/* Site Identity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Site Identity</h2>

        <div>
          <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">
            Site Name
          </label>
          <input
            type="text"
            id="siteName"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label htmlFor="faviconUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Favicon URL
          </label>
          <input
            type="url"
            id="faviconUrl"
            value={faviconUrl}
            onChange={(e) => setFaviconUrl(e.target.value)}
            placeholder="https://example.com/favicon.ico"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* SEO Defaults */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">SEO Defaults</h2>
        <p className="text-sm text-gray-600">
          These are used when a page doesn&apos;t have its own SEO settings.
        </p>

        <div>
          <label htmlFor="defaultMetaTitle" className="block text-sm font-medium text-gray-700 mb-1">
            Default Meta Title
          </label>
          <input
            type="text"
            id="defaultMetaTitle"
            value={defaultMetaTitle}
            onChange={(e) => setDefaultMetaTitle(e.target.value)}
            placeholder="Faith Interactive - Church Websites Made Easy"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="defaultMetaDescription" className="block text-sm font-medium text-gray-700 mb-1">
            Default Meta Description
          </label>
          <textarea
            id="defaultMetaDescription"
            value={defaultMetaDescription}
            onChange={(e) => setDefaultMetaDescription(e.target.value)}
            rows={3}
            placeholder="Build a beautiful website for your church..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Home Page */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Home Page</h2>
        <p className="text-sm text-gray-600">
          Select which page to show when visitors go to the root URL.
        </p>

        <div>
          <label htmlFor="homePageSlug" className="block text-sm font-medium text-gray-700 mb-1">
            Home Page
          </label>
          <select
            id="homePageSlug"
            value={homePageSlug}
            onChange={(e) => setHomePageSlug(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="home">Default (home)</option>
            {pages.map((page) => (
              <option key={page.slug} value={page.slug}>
                {page.title} (/{page.slug})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Header Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Header Navigation</h2>
            <p className="text-sm text-gray-600">Links shown in the site header.</p>
          </div>
          <button
            type="button"
            onClick={() => addNavItem("header")}
            className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Add Link
          </button>
        </div>

        {headerNav.length === 0 ? (
          <p className="text-gray-500 text-sm">No header links configured.</p>
        ) : (
          <div className="space-y-3">
            {headerNav.map((item, index) => (
              <div key={index} className="flex gap-3 items-center">
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => updateNavItem("header", index, "label", e.target.value)}
                  placeholder="Label"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="text"
                  value={item.url}
                  onChange={(e) => updateNavItem("header", index, "url", e.target.value)}
                  placeholder="/pricing or https://..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeNavItem("header", index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Footer</h2>

        <div>
          <label htmlFor="footerText" className="block text-sm font-medium text-gray-700 mb-1">
            Footer Text
          </label>
          <input
            type="text"
            id="footerText"
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            placeholder="© 2025 Faith Interactive. All rights reserved."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">Footer Links</p>
            <button
              type="button"
              onClick={() => addNavItem("footer")}
              className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Add Link
            </button>
          </div>

          {footerLinks.length === 0 ? (
            <p className="text-gray-500 text-sm">No footer links configured.</p>
          ) : (
            <div className="space-y-3">
              {footerLinks.map((item, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => updateNavItem("footer", index, "label", e.target.value)}
                    placeholder="Label"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    value={item.url}
                    onChange={(e) => updateNavItem("footer", index, "url", e.target.value)}
                    placeholder="/privacy or https://..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeNavItem("footer", index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
