"use client";

/**
 * Footer Settings Form Component
 *
 * Form for editing footer template and configuration with tabbed interface:
 * - Layout: Visual template selector
 * - Sections: Section visibility toggles
 * - Styling: Social icon style, copyright text
 * - Navigation: Footer navigation links
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { NavigationLinkEditor } from "@/components/dashboard/navigation-link-editor";
import {
  FooterTemplate,
  FooterConfig,
  NavLinkExtended,
  FOOTER_TEMPLATES,
  DEFAULT_FOOTER_CONFIG,
} from "@/types/template";

interface PageOption {
  id: string;
  title: string;
  urlPath: string | null;
}

interface FooterSettingsFormProps {
  settings: {
    footerTemplate: string;
    footerConfig: FooterConfig;
    footerNavigation: unknown[];
  };
  pages: PageOption[];
  canEdit: boolean;
}

const TABS = [
  { id: "navigation", label: "Navigation" },
  { id: "layout", label: "Layout" },
  { id: "sections", label: "Sections" },
  { id: "styling", label: "Styling" },
];

export function FooterSettingsForm({
  settings,
  pages,
  canEdit,
}: FooterSettingsFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("navigation");

  // Footer state
  const [footerTemplate, setFooterTemplate] = useState<FooterTemplate>(
    (settings.footerTemplate as FooterTemplate) || "4-column"
  );
  const [footerConfig, setFooterConfig] = useState<FooterConfig>({
    ...DEFAULT_FOOTER_CONFIG,
    ...settings.footerConfig,
  });
  const [footerNavigation, setFooterNavigation] = useState<NavLinkExtended[]>(
    (settings.footerNavigation as NavLinkExtended[]) || []
  );

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Footer config update helper
  const updateFooterConfig = useCallback(
    (updates: Partial<FooterConfig>) => {
      setFooterConfig((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  async function handleSave() {
    if (!canEdit) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/template-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          footerTemplate,
          footerConfig,
          footerNavigation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save footer settings");
        setSaving(false);
        return;
      }

      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg">
        <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab}>
          {/* Layout Tab */}
          <TabPanel id="layout" activeTab={activeTab}>
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Footer Layout
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Choose a layout style for your website footer
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {FOOTER_TEMPLATES.map((template) => (
                  <button
                    key={template.value}
                    type="button"
                    onClick={() => setFooterTemplate(template.value)}
                    disabled={!canEdit}
                    className={`relative p-4 border-2 rounded-lg transition-all text-left ${
                      footerTemplate === template.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {/* Mini Preview */}
                    <div className="mb-3">
                      <FooterTemplatePreview
                        template={template.value}
                        isActive={footerTemplate === template.value}
                      />
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {template.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {template.description}
                    </p>
                    {footerTemplate === template.value && (
                      <div className="absolute top-2 right-2">
                        <svg
                          className="w-5 h-5 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </TabPanel>

          {/* Sections Tab */}
          <TabPanel id="sections" activeTab={activeTab}>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Visible Sections
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Choose which sections to display in your footer
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={footerConfig.showChurchInfo}
                    onChange={(e) =>
                      updateFooterConfig({ showChurchInfo: e.target.checked })
                    }
                    disabled={!canEdit}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Church Info</span>
                    <p className="text-xs text-gray-500">Display church name, logo, and description</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={footerConfig.showServiceTimes}
                    onChange={(e) =>
                      updateFooterConfig({ showServiceTimes: e.target.checked })
                    }
                    disabled={!canEdit}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Service Times</span>
                    <p className="text-xs text-gray-500">Show your weekly service schedule</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={footerConfig.showContactInfo}
                    onChange={(e) =>
                      updateFooterConfig({ showContactInfo: e.target.checked })
                    }
                    disabled={!canEdit}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Contact Info</span>
                    <p className="text-xs text-gray-500">Display address, phone, and email</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={footerConfig.showQuickLinks}
                    onChange={(e) =>
                      updateFooterConfig({ showQuickLinks: e.target.checked })
                    }
                    disabled={!canEdit}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Quick Links</span>
                    <p className="text-xs text-gray-500">Show navigation links in footer</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={footerConfig.showSocialIcons}
                    onChange={(e) =>
                      updateFooterConfig({ showSocialIcons: e.target.checked })
                    }
                    disabled={!canEdit}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Social Icons</span>
                    <p className="text-xs text-gray-500">Display social media links</p>
                  </div>
                </label>
              </div>
            </div>
          </TabPanel>

          {/* Styling Tab */}
          <TabPanel id="styling" activeTab={activeTab}>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Styling Options
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Customize the appearance of your footer
                </p>
              </div>

              {/* Social Icon Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Social Icon Style
                </label>
                <div className="grid grid-cols-3 gap-4 max-w-lg">
                  {[
                    { value: "filled", label: "Filled", desc: "Solid colored icons" },
                    { value: "outline", label: "Outline", desc: "Border only icons" },
                    { value: "monochrome", label: "Monochrome", desc: "Single color icons" },
                  ].map((style) => (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() =>
                        updateFooterConfig({
                          socialIconStyle: style.value as "filled" | "outline" | "monochrome",
                        })
                      }
                      disabled={!canEdit}
                      className={`p-3 border-2 rounded-lg transition-colors text-center ${
                        footerConfig.socialIconStyle === style.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-700">{style.label}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{style.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Social Icons Preview */}
              <div className="border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Social Icons Preview
                </label>
                <div className="p-6 bg-gray-800 rounded-lg inline-block">
                  <div className="flex gap-4">
                    <SocialIconPreview style={footerConfig.socialIconStyle} icon="facebook" />
                    <SocialIconPreview style={footerConfig.socialIconStyle} icon="instagram" />
                    <SocialIconPreview style={footerConfig.socialIconStyle} icon="youtube" />
                  </div>
                </div>
              </div>

              {/* Custom Copyright */}
              <div className="border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Copyright Text
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Leave empty to use the default: &quot;© {new Date().getFullYear()} [Church Name]. All rights reserved.&quot;
                </p>
                <input
                  type="text"
                  value={footerConfig.customCopyrightText || ""}
                  onChange={(e) =>
                    updateFooterConfig({
                      customCopyrightText: e.target.value || undefined,
                    })
                  }
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  placeholder="Leave empty for auto-generated copyright"
                />
              </div>
            </div>
          </TabPanel>

          {/* Navigation Tab */}
          <TabPanel id="navigation" activeTab={activeTab}>
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Footer Navigation Links
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Add links that appear in the footer quick links section
              </p>
              <NavigationLinkEditor
                links={footerNavigation}
                onChange={setFooterNavigation}
                pages={pages}
                disabled={!canEdit}
                allowDropdowns={false}
              />
            </div>
          </TabPanel>
        </Tabs>
      </div>

      {/* Save Button */}
      {canEdit && (
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} isLoading={saving}>
            Save Changes
          </Button>
        </div>
      )}

      {/* Save Success Toast */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          showSaveSuccess
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg">
          <svg
            className="w-5 h-5 shrink-0"
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
          <span className="font-medium">Footer settings saved</span>
        </div>
      </div>
    </div>
  );
}

// Footer Template Mini Preview Component
function FooterTemplatePreview({
  template,
  isActive,
}: {
  template: FooterTemplate;
  isActive: boolean;
}) {
  const bgColor = isActive ? "bg-blue-300" : "bg-gray-300";
  const accentColor = isActive ? "bg-blue-100" : "bg-gray-100";

  switch (template) {
    case "4-column":
      return (
        <div className={`h-12 ${bgColor} rounded p-2`}>
          <div className="flex gap-1 h-full">
            <div className={`flex-1 ${accentColor} rounded-sm`} />
            <div className={`flex-1 ${accentColor} rounded-sm`} />
            <div className={`flex-1 ${accentColor} rounded-sm`} />
            <div className={`flex-1 ${accentColor} rounded-sm`} />
          </div>
        </div>
      );

    case "3-column":
      return (
        <div className={`h-12 ${bgColor} rounded p-2`}>
          <div className="flex gap-1 h-full">
            <div className={`flex-1 ${accentColor} rounded-sm`} />
            <div className={`flex-1 ${accentColor} rounded-sm`} />
            <div className={`flex-1 ${accentColor} rounded-sm`} />
          </div>
        </div>
      );

    case "2-column":
      return (
        <div className={`h-12 ${bgColor} rounded p-2`}>
          <div className="flex gap-1 h-full">
            <div className={`flex-[2] ${accentColor} rounded-sm`} />
            <div className={`flex-1 ${accentColor} rounded-sm`} />
          </div>
        </div>
      );

    case "stacked":
      return (
        <div className={`h-12 ${bgColor} rounded p-2`}>
          <div className="flex flex-col gap-1 h-full">
            <div className={`flex-1 ${accentColor} rounded-sm`} />
            <div className={`flex-1 ${accentColor} rounded-sm`} />
          </div>
        </div>
      );

    case "minimal":
      return (
        <div className={`h-12 ${bgColor} rounded p-2 flex items-center justify-center`}>
          <div className={`w-3/4 h-3 ${accentColor} rounded-sm`} />
        </div>
      );

    default:
      return null;
  }
}

// Social Icon Preview Component
function SocialIconPreview({
  style,
  icon,
}: {
  style: "filled" | "outline" | "monochrome";
  icon: "facebook" | "instagram" | "youtube";
}) {
  const colors = {
    facebook: { filled: "bg-blue-600", outline: "border-blue-600 text-blue-600", mono: "bg-white" },
    instagram: { filled: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400", outline: "border-pink-500 text-pink-500", mono: "bg-white" },
    youtube: { filled: "bg-red-600", outline: "border-red-600 text-red-600", mono: "bg-white" },
  };

  const paths = {
    facebook: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
    instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
    youtube: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  };

  if (style === "filled") {
    return (
      <div className={`w-10 h-10 ${colors[icon].filled} rounded-lg flex items-center justify-center`}>
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d={paths[icon]} />
        </svg>
      </div>
    );
  }

  if (style === "outline") {
    return (
      <div className={`w-10 h-10 border-2 ${colors[icon].outline} rounded-lg flex items-center justify-center bg-transparent`}>
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d={paths[icon]} />
        </svg>
      </div>
    );
  }

  // Monochrome
  return (
    <div className={`w-10 h-10 ${colors[icon].mono} rounded-lg flex items-center justify-center`}>
      <svg className="w-5 h-5 text-gray-800" viewBox="0 0 24 24" fill="currentColor">
        <path d={paths[icon]} />
      </svg>
    </div>
  );
}
