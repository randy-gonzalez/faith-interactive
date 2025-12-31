"use client";

/**
 * Site Settings Form Component
 *
 * Handles editing of all site settings in organized sections.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SiteSettings } from "@prisma/client";

interface NavItem {
  pageId: string;
  label: string;
  order: number;
}

interface PageOption {
  id: string;
  title: string;
  urlPath: string | null;
}

interface SiteSettingsFormProps {
  settings: SiteSettings;
  pages: PageOption[];
  churchName: string;
  canEdit: boolean;
}

export function SiteSettingsForm({
  settings,
  pages,
  churchName,
  canEdit,
}: SiteSettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Parse JSON navigation safely
  const parseNavigation = (value: unknown): NavItem[] => {
    if (!value || !Array.isArray(value)) return [];
    return value as NavItem[];
  };

  // Form state
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || "");
  const [headerNav, setHeaderNav] = useState<NavItem[]>(
    parseNavigation(settings.headerNavigation)
  );
  const [footerText, setFooterText] = useState(settings.footerText || "");
  const [footerNav, setFooterNav] = useState<NavItem[]>(
    parseNavigation(settings.footerNavigation)
  );
  const [facebookUrl, setFacebookUrl] = useState(settings.facebookUrl || "");
  const [instagramUrl, setInstagramUrl] = useState(settings.instagramUrl || "");
  const [youtubeUrl, setYoutubeUrl] = useState(settings.youtubeUrl || "");
  const [serviceTimes, setServiceTimes] = useState(settings.serviceTimes || "");
  const [address, setAddress] = useState(settings.address || "");
  const [phone, setPhone] = useState(settings.phone || "");
  const [contactEmail, setContactEmail] = useState(settings.contactEmail || "");
  const [metaTitle, setMetaTitle] = useState(settings.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(settings.metaDescription || "");
  const [faviconUrl, setFaviconUrl] = useState(settings.faviconUrl || "");
  const [mapEmbedUrl, setMapEmbedUrl] = useState(settings.mapEmbedUrl || "");
  const [homePageId, setHomePageId] = useState(settings.homePageId || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logoUrl,
          headerNavigation: headerNav,
          footerText,
          footerNavigation: footerNav,
          facebookUrl,
          instagramUrl,
          youtubeUrl,
          serviceTimes,
          address,
          phone,
          contactEmail,
          metaTitle,
          metaDescription,
          faviconUrl,
          mapEmbedUrl,
          homePageId: homePageId || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save settings");
      }

      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Navigation helpers
  const addNavItem = (type: "header" | "footer") => {
    const setNav = type === "header" ? setHeaderNav : setFooterNav;
    const nav = type === "header" ? headerNav : footerNav;
    if (pages.length === 0) return;

    setNav([
      ...nav,
      {
        pageId: pages[0].id,
        label: pages[0].title,
        order: nav.length,
      },
    ]);
  };

  const updateNavItem = (
    type: "header" | "footer",
    index: number,
    field: keyof NavItem,
    value: string | number
  ) => {
    const setNav = type === "header" ? setHeaderNav : setFooterNav;
    const nav = type === "header" ? headerNav : footerNav;
    const updated = [...nav];
    updated[index] = { ...updated[index], [field]: value };

    // If pageId changed, update label to page title
    if (field === "pageId") {
      const page = pages.find((p) => p.id === value);
      if (page) {
        updated[index].label = page.title;
      }
    }

    setNav(updated);
  };

  const removeNavItem = (type: "header" | "footer", index: number) => {
    const setNav = type === "header" ? setHeaderNav : setFooterNav;
    const nav = type === "header" ? headerNav : footerNav;
    setNav(nav.filter((_, i) => i !== index));
  };

  const moveNavItem = (type: "header" | "footer", index: number, direction: "up" | "down") => {
    const setNav = type === "header" ? setHeaderNav : setFooterNav;
    const nav = type === "header" ? headerNav : footerNav;
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= nav.length) return;

    const updated = [...nav];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    // Update order values
    updated.forEach((item, i) => {
      item.order = i;
    });
    setNav(updated);
  };

  const renderNavEditor = (type: "header" | "footer") => {
    const nav = type === "header" ? headerNav : footerNav;
    const label = type === "header" ? "Header" : "Footer";

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label} Navigation
          </label>
          {canEdit && (
            <button
              type="button"
              onClick={() => addNavItem(type)}
              disabled={pages.length === 0}
              className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              + Add Link
            </button>
          )}
        </div>

        {nav.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No navigation links configured
          </p>
        ) : (
          <div className="space-y-2">
            {nav.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"
              >
                <select
                  value={item.pageId}
                  onChange={(e) => updateNavItem(type, index, "pageId", e.target.value)}
                  disabled={!canEdit}
                  className="flex-1 text-sm rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                >
                  {pages.map((page) => (
                    <option key={page.id} value={page.id}>
                      {page.title}
                    </option>
                  ))}
                </select>
                <Input
                  value={item.label}
                  onChange={(e) => updateNavItem(type, index, "label", e.target.value)}
                  placeholder="Link label"
                  disabled={!canEdit}
                  className="w-32 text-sm"
                />
                {canEdit && (
                  <>
                    <button
                      type="button"
                      onClick={() => moveNavItem(type, index, "up")}
                      disabled={index === 0}
                      className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveNavItem(type, index, "down")}
                      disabled={index === nav.length - 1}
                      className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeNavItem(type, index)}
                      className="p-1 text-red-500 hover:text-red-700"
                      title="Remove"
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400">
          Settings saved successfully!
        </div>
      )}

      {/* Header Section */}
      <section className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Header
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Logo URL
            </label>
            <Input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              disabled={!canEdit}
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter a URL to your church logo image
            </p>
          </div>

          {renderNavEditor("header")}
        </div>
      </section>

      {/* Home Page Section */}
      <section className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Home Page
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Home Page Content
          </label>
          <select
            value={homePageId}
            onChange={(e) => setHomePageId(e.target.value)}
            disabled={!canEdit}
            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-sm"
          >
            <option value="">Default welcome message</option>
            {pages.map((page) => (
              <option key={page.id} value={page.id}>
                {page.title}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Select a page to use as your home page, or use the default welcome
          </p>
        </div>
      </section>

      {/* Service Info Section */}
      <section className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Service Times & Location
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Service Times
            </label>
            <Textarea
              value={serviceTimes}
              onChange={(e) => setServiceTimes(e.target.value)}
              placeholder="Sunday: 9:00 AM & 11:00 AM&#10;Wednesday: 7:00 PM"
              rows={3}
              disabled={!canEdit}
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter your service times (one per line)
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address
            </label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main Street, City, State 12345"
              disabled={!canEdit}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              disabled={!canEdit}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contact Email
            </label>
            <Input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="info@yourchurch.com"
              disabled={!canEdit}
            />
            <p className="mt-1 text-xs text-gray-500">
              Contact form submissions will be sent here
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Google Maps Embed URL
            </label>
            <Input
              type="url"
              value={mapEmbedUrl}
              onChange={(e) => setMapEmbedUrl(e.target.value)}
              placeholder="https://www.google.com/maps/embed?pb=..."
              disabled={!canEdit}
            />
            <p className="mt-1 text-xs text-gray-500">
              Get this from Google Maps → Share → Embed a map → Copy src URL
            </p>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <section className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Footer
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Footer Text
            </label>
            <Textarea
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              placeholder={`© ${new Date().getFullYear()} ${churchName}. All rights reserved.`}
              rows={2}
              disabled={!canEdit}
            />
          </div>

          {renderNavEditor("footer")}

          <div className="grid gap-4 md:grid-cols-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Facebook URL
              </label>
              <Input
                type="url"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/yourchurch"
                disabled={!canEdit}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Instagram URL
              </label>
              <Input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/yourchurch"
                disabled={!canEdit}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                YouTube URL
              </label>
              <Input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/@yourchurch"
                disabled={!canEdit}
              />
            </div>
          </div>
        </div>
      </section>

      {/* SEO Section */}
      <section className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          SEO & Metadata
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Default Page Title
            </label>
            <Input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder={churchName}
              maxLength={60}
              disabled={!canEdit}
            />
            <p className="mt-1 text-xs text-gray-500">
              {metaTitle.length}/60 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Default Meta Description
            </label>
            <Textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Welcome to our church community..."
              rows={2}
              maxLength={160}
              disabled={!canEdit}
            />
            <p className="mt-1 text-xs text-gray-500">
              {metaDescription.length}/160 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Favicon URL
            </label>
            <Input
              type="url"
              value={faviconUrl}
              onChange={(e) => setFaviconUrl(e.target.value)}
              placeholder="https://example.com/favicon.ico"
              disabled={!canEdit}
            />
            <p className="mt-1 text-xs text-gray-500">
              The small icon shown in browser tabs (ICO, PNG, or SVG)
            </p>
          </div>
        </div>
      </section>

      {/* Submit Button */}
      {canEdit && (
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      )}
    </form>
  );
}
