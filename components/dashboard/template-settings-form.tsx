"use client";

/**
 * Template Settings Form Component
 *
 * Form for editing header and footer templates with:
 * - Visual template selectors
 * - Configuration options for each template
 * - Navigation link editor with multi-level dropdown support
 * - Live preview
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MediaPicker } from "@/components/dashboard/media-picker";
import { NavigationLinkEditor } from "@/components/dashboard/navigation-link-editor";
import {
  HeaderTemplate,
  FooterTemplate,
  HeaderConfig,
  FooterConfig,
  NavLinkExtended,
  HEADER_TEMPLATES,
  FOOTER_TEMPLATES,
  DEFAULT_HEADER_CONFIG,
  DEFAULT_FOOTER_CONFIG,
} from "@/types/template";

interface PageOption {
  id: string;
  title: string;
  urlPath: string | null;
}

interface TemplateSettingsFormProps {
  settings: {
    headerTemplate: string;
    headerConfig: HeaderConfig;
    footerTemplate: string;
    footerConfig: FooterConfig;
    headerNavigation: unknown[];
    footerNavigation: unknown[];
  };
  pages: PageOption[];
  canEdit: boolean;
}

const TABS = [
  { id: "header", label: "Header" },
  { id: "footer", label: "Footer" },
];

export function TemplateSettingsForm({
  settings,
  pages,
  canEdit,
}: TemplateSettingsFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("header");

  // Header state
  const [headerTemplate, setHeaderTemplate] = useState<HeaderTemplate>(
    (settings.headerTemplate as HeaderTemplate) || "classic"
  );
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>({
    ...DEFAULT_HEADER_CONFIG,
    ...settings.headerConfig,
  });
  const [headerNavigation, setHeaderNavigation] = useState<NavLinkExtended[]>(
    (settings.headerNavigation as NavLinkExtended[]) || []
  );

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

  // Header config update helper
  const updateHeaderConfig = useCallback(
    (updates: Partial<HeaderConfig>) => {
      setHeaderConfig((prev) => ({ ...prev, ...updates }));
    },
    []
  );

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
          headerTemplate,
          headerConfig,
          footerTemplate,
          footerConfig,
          headerNavigation,
          footerNavigation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save template settings");
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
          {/* Header Tab */}
          <TabPanel id="header" activeTab={activeTab}>
            <div className="p-6 space-y-8">
              {/* Template Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Header Layout
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {HEADER_TEMPLATES.map((template) => (
                    <button
                      key={template.value}
                      type="button"
                      onClick={() => setHeaderTemplate(template.value)}
                      disabled={!canEdit}
                      className={`relative p-4 border-2 rounded-lg transition-all text-left ${
                        headerTemplate === template.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {/* Mini Preview */}
                      <div className="mb-3">
                        <HeaderTemplatePreview
                          template={template.value}
                          isActive={headerTemplate === template.value}
                        />
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {template.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {template.description}
                      </p>
                      {headerTemplate === template.value && (
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

              {/* Desktop Options */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Desktop Options
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Logo Position */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo Position
                    </label>
                    <select
                      value={headerConfig.logoPosition}
                      onChange={(e) =>
                        updateHeaderConfig({
                          logoPosition: e.target.value as "left" | "center",
                        })
                      }
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                    </select>
                  </div>

                  {/* Navigation Alignment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Navigation Alignment
                    </label>
                    <select
                      value={headerConfig.navAlignment}
                      onChange={(e) =>
                        updateHeaderConfig({
                          navAlignment: e.target.value as
                            | "left"
                            | "center"
                            | "right",
                        })
                      }
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>

                  {/* Background Style */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Style
                    </label>
                    <select
                      value={headerConfig.background}
                      onChange={(e) =>
                        updateHeaderConfig({
                          background: e.target.value as
                            | "solid"
                            | "transparent"
                            | "blur",
                        })
                      }
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                    >
                      <option value="solid">Solid</option>
                      <option value="transparent">Transparent</option>
                      <option value="blur">Blur (Glassmorphism)</option>
                    </select>
                  </div>

                  {/* Show Navigation Toggle */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="showNavigation"
                      checked={headerConfig.showNavigation}
                      onChange={(e) =>
                        updateHeaderConfig({ showNavigation: e.target.checked })
                      }
                      disabled={!canEdit}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="showNavigation"
                      className="text-sm text-gray-700"
                    >
                      Show navigation links on desktop
                    </label>
                  </div>

                  {/* Sticky Header Toggle */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="sticky"
                      checked={headerConfig.sticky}
                      onChange={(e) =>
                        updateHeaderConfig({ sticky: e.target.checked })
                      }
                      disabled={!canEdit}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="sticky" className="text-sm text-gray-700">
                      Sticky header (stays visible on scroll)
                    </label>
                  </div>
                </div>
              </div>

              {/* CTA Button Options */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Call-to-Action Button
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Show CTA */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="showCta"
                      checked={headerConfig.ctaButton.show}
                      onChange={(e) =>
                        updateHeaderConfig({
                          ctaButton: {
                            ...headerConfig.ctaButton,
                            show: e.target.checked,
                          },
                        })
                      }
                      disabled={!canEdit}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="showCta" className="text-sm text-gray-700">
                      Show CTA button
                    </label>
                  </div>

                  {headerConfig.ctaButton.show && (
                    <>
                      {/* CTA Label */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Button Label
                        </label>
                        <input
                          type="text"
                          value={headerConfig.ctaButton.label}
                          onChange={(e) =>
                            updateHeaderConfig({
                              ctaButton: {
                                ...headerConfig.ctaButton,
                                label: e.target.value,
                              },
                            })
                          }
                          disabled={!canEdit}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                          placeholder="Contact Us"
                        />
                      </div>

                      {/* CTA Link */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Button Link
                        </label>
                        <input
                          type="text"
                          value={headerConfig.ctaButton.href}
                          onChange={(e) =>
                            updateHeaderConfig({
                              ctaButton: {
                                ...headerConfig.ctaButton,
                                href: e.target.value,
                              },
                            })
                          }
                          disabled={!canEdit}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                          placeholder="/contact"
                        />
                      </div>

                      {/* CTA Style */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Button Style
                        </label>
                        <select
                          value={headerConfig.ctaButton.style}
                          onChange={(e) =>
                            updateHeaderConfig({
                              ctaButton: {
                                ...headerConfig.ctaButton,
                                style: e.target.value as
                                  | "primary"
                                  | "secondary"
                                  | "outline",
                              },
                            })
                          }
                          disabled={!canEdit}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                        >
                          <option value="primary">Primary</option>
                          <option value="secondary">Secondary</option>
                          <option value="outline">Outline</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Mobile Options */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Mobile Options
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Mobile Menu Style */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Menu Style
                    </label>
                    <select
                      value={headerConfig.mobileMenuStyle}
                      onChange={(e) =>
                        updateHeaderConfig({
                          mobileMenuStyle: e.target.value as
                            | "slide"
                            | "dropdown"
                            | "fullscreen",
                        })
                      }
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                    >
                      <option value="slide">Slide Out</option>
                      <option value="dropdown">Dropdown</option>
                      <option value="fullscreen">Full Screen Overlay</option>
                    </select>
                  </div>

                  {/* Mobile Breakpoint */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Breakpoint
                    </label>
                    <select
                      value={headerConfig.mobileBreakpoint}
                      onChange={(e) =>
                        updateHeaderConfig({
                          mobileBreakpoint: parseInt(e.target.value),
                        })
                      }
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                    >
                      <option value={640}>640px (sm)</option>
                      <option value={768}>768px (md)</option>
                      <option value={1024}>1024px (lg)</option>
                    </select>
                  </div>

                  {/* Show CTA on Mobile */}
                  <div className="flex items-center gap-3 pt-7">
                    <input
                      type="checkbox"
                      id="showCtaOnMobile"
                      checked={headerConfig.showCtaOnMobile}
                      onChange={(e) =>
                        updateHeaderConfig({
                          showCtaOnMobile: e.target.checked,
                        })
                      }
                      disabled={!canEdit}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="showCtaOnMobile"
                      className="text-sm text-gray-700"
                    >
                      Show CTA button on mobile
                    </label>
                  </div>

                  {/* Mobile Logo */}
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Logo (Optional)
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Use a different logo on mobile devices. Leave empty to use
                      the main logo.
                    </p>
                    <MediaPicker
                      value={headerConfig.mobileLogoUrl || null}
                      onChange={(url) =>
                        updateHeaderConfig({ mobileLogoUrl: url || undefined })
                      }
                      disabled={!canEdit}
                      placeholder="Select mobile logo"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Navigation Links
                </h3>
                <NavigationLinkEditor
                  links={headerNavigation}
                  onChange={setHeaderNavigation}
                  pages={pages}
                  disabled={!canEdit}
                  allowDropdowns={true}
                />
              </div>
            </div>
          </TabPanel>

          {/* Footer Tab */}
          <TabPanel id="footer" activeTab={activeTab}>
            <div className="p-6 space-y-8">
              {/* Template Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Footer Layout
                </h3>
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

              {/* Section Visibility */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Visible Sections
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={footerConfig.showChurchInfo}
                      onChange={(e) =>
                        updateFooterConfig({ showChurchInfo: e.target.checked })
                      }
                      disabled={!canEdit}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Church Info</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={footerConfig.showServiceTimes}
                      onChange={(e) =>
                        updateFooterConfig({
                          showServiceTimes: e.target.checked,
                        })
                      }
                      disabled={!canEdit}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Service Times</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={footerConfig.showContactInfo}
                      onChange={(e) =>
                        updateFooterConfig({
                          showContactInfo: e.target.checked,
                        })
                      }
                      disabled={!canEdit}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Contact Info</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={footerConfig.showQuickLinks}
                      onChange={(e) =>
                        updateFooterConfig({ showQuickLinks: e.target.checked })
                      }
                      disabled={!canEdit}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Quick Links</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={footerConfig.showSocialIcons}
                      onChange={(e) =>
                        updateFooterConfig({
                          showSocialIcons: e.target.checked,
                        })
                      }
                      disabled={!canEdit}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Social Icons</span>
                  </label>
                </div>
              </div>

              {/* Styling Options */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Styling
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Social Icon Style */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Social Icon Style
                    </label>
                    <select
                      value={footerConfig.socialIconStyle}
                      onChange={(e) =>
                        updateFooterConfig({
                          socialIconStyle: e.target.value as
                            | "filled"
                            | "outline"
                            | "monochrome",
                        })
                      }
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                    >
                      <option value="filled">Filled (Colored)</option>
                      <option value="outline">Outline</option>
                      <option value="monochrome">Monochrome</option>
                    </select>
                  </div>

                  {/* Custom Copyright */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Copyright Text
                    </label>
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
                    <p className="text-xs text-gray-500 mt-1">
                      Default: &quot;© {new Date().getFullYear()} [Church
                      Name]. All rights reserved.&quot;
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Navigation Links */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Footer Navigation Links
                </h3>
                <NavigationLinkEditor
                  links={footerNavigation}
                  onChange={setFooterNavigation}
                  pages={pages}
                  disabled={!canEdit}
                  allowDropdowns={false}
                />
              </div>
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
          <span className="font-medium">Template settings saved</span>
        </div>
      </div>
    </div>
  );
}

// Header Template Mini Preview Component
function HeaderTemplatePreview({
  template,
  isActive,
}: {
  template: HeaderTemplate;
  isActive: boolean;
}) {
  const bgColor = isActive ? "bg-blue-200" : "bg-gray-200";
  const accentColor = isActive ? "bg-blue-400" : "bg-gray-400";

  switch (template) {
    case "classic":
      return (
        <div className={`h-8 ${bgColor} rounded flex items-center px-2`}>
          <div className={`w-6 h-3 ${accentColor} rounded-sm`} />
          <div className="flex-1" />
          <div className="flex gap-1">
            <div className={`w-4 h-2 ${accentColor} rounded-sm`} />
            <div className={`w-4 h-2 ${accentColor} rounded-sm`} />
            <div className={`w-4 h-2 ${accentColor} rounded-sm`} />
          </div>
          <div className={`w-6 h-3 ${accentColor} rounded-sm ml-2`} />
        </div>
      );

    case "centered":
      return (
        <div className={`h-12 ${bgColor} rounded flex flex-col items-center justify-center gap-1 px-2`}>
          <div className={`w-8 h-3 ${accentColor} rounded-sm`} />
          <div className="flex gap-1">
            <div className={`w-4 h-2 ${accentColor} rounded-sm`} />
            <div className={`w-4 h-2 ${accentColor} rounded-sm`} />
            <div className={`w-4 h-2 ${accentColor} rounded-sm`} />
          </div>
        </div>
      );

    case "minimal":
      return (
        <div className={`h-8 ${bgColor} rounded flex items-center justify-between px-2`}>
          <div className={`w-6 h-3 ${accentColor} rounded-sm`} />
          <div className="flex flex-col gap-0.5">
            <div className={`w-4 h-0.5 ${accentColor} rounded-sm`} />
            <div className={`w-4 h-0.5 ${accentColor} rounded-sm`} />
            <div className={`w-4 h-0.5 ${accentColor} rounded-sm`} />
          </div>
        </div>
      );

    case "split":
      return (
        <div className={`h-8 ${bgColor} rounded flex items-center px-2`}>
          <div className={`w-6 h-3 ${accentColor} rounded-sm`} />
          <div className="flex-1 flex justify-center gap-1">
            <div className={`w-4 h-2 ${accentColor} rounded-sm`} />
            <div className={`w-4 h-2 ${accentColor} rounded-sm`} />
            <div className={`w-4 h-2 ${accentColor} rounded-sm`} />
          </div>
          <div className={`w-6 h-3 ${accentColor} rounded-sm`} />
        </div>
      );

    default:
      return null;
  }
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
