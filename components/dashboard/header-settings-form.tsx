"use client";

/**
 * Header Settings Form Component
 *
 * Form for editing header template and configuration with tabbed interface:
 * - Layout: Visual template selector
 * - Desktop: Logo position, nav alignment, background, sticky
 * - Mobile: Menu style, breakpoint, mobile logo
 * - CTA Button: Call-to-action button configuration
 * - Navigation: Navigation link editor with dropdown support
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MediaPicker } from "@/components/dashboard/media-picker";
import { NavigationLinkEditor } from "@/components/dashboard/navigation-link-editor";
import {
  HeaderTemplate,
  HeaderConfig,
  NavLinkExtended,
  HEADER_TEMPLATES,
  DEFAULT_HEADER_CONFIG,
} from "@/types/template";

interface PageOption {
  id: string;
  title: string;
  urlPath: string | null;
}

interface HeaderSettingsFormProps {
  settings: {
    headerTemplate: string;
    headerConfig: HeaderConfig;
    headerNavigation: unknown[];
  };
  pages: PageOption[];
  canEdit: boolean;
}

const TABS = [
  { id: "navigation", label: "Navigation" },
  { id: "layout", label: "Layout" },
  { id: "desktop", label: "Desktop" },
  { id: "mobile", label: "Mobile" },
  { id: "cta", label: "CTA Button" },
];

export function HeaderSettingsForm({
  settings,
  pages,
  canEdit,
}: HeaderSettingsFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("navigation");

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
          headerNavigation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save header settings");
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
                Header Layout
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Choose a layout style for your website header
              </p>
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
          </TabPanel>

          {/* Desktop Tab */}
          <TabPanel id="desktop" activeTab={activeTab}>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Desktop Options
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Configure how your header appears on desktop screens
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        navAlignment: e.target.value as "left" | "center" | "right",
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
                        background: e.target.value as "solid" | "transparent" | "blur",
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
              </div>

              <div className="border-t pt-6 space-y-4">
                <h4 className="text-sm font-medium text-gray-700">Display Options</h4>

                {/* Show Navigation Toggle */}
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={headerConfig.showNavigation}
                    onChange={(e) =>
                      updateHeaderConfig({ showNavigation: e.target.checked })
                    }
                    disabled={!canEdit}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Show Navigation</span>
                    <p className="text-xs text-gray-500">Display navigation links on desktop</p>
                  </div>
                </label>

                {/* Sticky Header Toggle */}
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={headerConfig.sticky}
                    onChange={(e) =>
                      updateHeaderConfig({ sticky: e.target.checked })
                    }
                    disabled={!canEdit}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Sticky Header</span>
                    <p className="text-xs text-gray-500">Header stays visible when scrolling</p>
                  </div>
                </label>
              </div>
            </div>
          </TabPanel>

          {/* Mobile Tab */}
          <TabPanel id="mobile" activeTab={activeTab}>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Mobile Options
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Configure how your header appears on mobile devices
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mobile Menu Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Menu Style
                  </label>
                  <select
                    value={headerConfig.mobileMenuStyle}
                    onChange={(e) =>
                      updateHeaderConfig({
                        mobileMenuStyle: e.target.value as "slide" | "dropdown" | "fullscreen",
                      })
                    }
                    disabled={!canEdit}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                  >
                    <option value="slide">Slide Out</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="fullscreen">Full Screen Overlay</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    How the navigation menu appears on mobile
                  </p>
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
                  <p className="text-xs text-gray-500 mt-1">
                    Screen width where mobile menu activates
                  </p>
                </div>
              </div>

              {/* Show CTA on Mobile */}
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={headerConfig.showCtaOnMobile}
                  onChange={(e) =>
                    updateHeaderConfig({
                      showCtaOnMobile: e.target.checked,
                    })
                  }
                  disabled={!canEdit}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Show CTA on Mobile</span>
                  <p className="text-xs text-gray-500">Display the call-to-action button on mobile devices</p>
                </div>
              </label>

              {/* Mobile Logo */}
              <div className="border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Logo (Optional)
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Use a different logo on mobile devices. Leave empty to use the main logo.
                </p>
                <MediaPicker
                  value={headerConfig.mobileLogoUrl || null}
                  onChange={(url) =>
                    updateHeaderConfig({ mobileLogoUrl: url || undefined })
                  }
                  disabled={!canEdit}
                  placeholder="Select mobile logo"
                />
                {headerConfig.mobileLogoUrl && (
                  <div className="mt-3 p-4 bg-gray-100 rounded-lg inline-block">
                    <img
                      src={headerConfig.mobileLogoUrl}
                      alt="Mobile logo preview"
                      className="max-h-12 object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          </TabPanel>

          {/* CTA Button Tab */}
          <TabPanel id="cta" activeTab={activeTab}>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Call-to-Action Button
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Add a prominent button to your header for important actions
                </p>
              </div>

              {/* Show CTA Toggle */}
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
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
                <div>
                  <span className="text-sm font-medium text-gray-700">Enable CTA Button</span>
                  <p className="text-xs text-gray-500">Show a call-to-action button in the header</p>
                </div>
              </label>

              {headerConfig.ctaButton.show && (
                <div className="border-t pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  </div>

                  {/* CTA Style */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Button Style
                    </label>
                    <div className="grid grid-cols-3 gap-4 max-w-md">
                      {[
                        { value: "primary", label: "Primary", desc: "Solid background" },
                        { value: "secondary", label: "Secondary", desc: "Muted style" },
                        { value: "outline", label: "Outline", desc: "Border only" },
                      ].map((style) => (
                        <button
                          key={style.value}
                          type="button"
                          onClick={() =>
                            updateHeaderConfig({
                              ctaButton: {
                                ...headerConfig.ctaButton,
                                style: style.value as "primary" | "secondary" | "outline",
                              },
                            })
                          }
                          disabled={!canEdit}
                          className={`p-3 border-2 rounded-lg transition-colors text-center ${
                            headerConfig.ctaButton.style === style.value
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

                  {/* Preview */}
                  <div className="border-t pt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Preview
                    </label>
                    <div className="p-6 bg-gray-50 rounded-lg inline-block">
                      <button
                        type="button"
                        className={`px-5 py-2.5 text-sm font-medium rounded-md transition-colors ${
                          headerConfig.ctaButton.style === "primary"
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : headerConfig.ctaButton.style === "secondary"
                            ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                            : "border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                        }`}
                      >
                        {headerConfig.ctaButton.label || "Button"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabPanel>

          {/* Navigation Tab */}
          <TabPanel id="navigation" activeTab={activeTab}>
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Navigation Links
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Add and organize your header navigation links. You can create dropdown menus for grouped items.
              </p>
              <NavigationLinkEditor
                links={headerNavigation}
                onChange={setHeaderNavigation}
                pages={pages}
                disabled={!canEdit}
                allowDropdowns={true}
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
          <span className="font-medium">Header settings saved</span>
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

    case "transparent":
      // Transparent with gradient background to show overlay effect
      return (
        <div className="h-10 rounded overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500" />
          <div className={`absolute inset-x-0 top-0 h-8 ${isActive ? "bg-white/30" : "bg-white/20"} flex items-center px-2`}>
            <div className={`w-6 h-3 ${isActive ? "bg-white" : "bg-white/80"} rounded-sm`} />
            <div className="flex-1" />
            <div className="flex gap-1">
              <div className={`w-4 h-2 ${isActive ? "bg-white" : "bg-white/80"} rounded-sm`} />
              <div className={`w-4 h-2 ${isActive ? "bg-white" : "bg-white/80"} rounded-sm`} />
              <div className={`w-4 h-2 ${isActive ? "bg-white" : "bg-white/80"} rounded-sm`} />
            </div>
            <div className={`w-6 h-3 ${isActive ? "bg-white" : "bg-white/80"} rounded-sm ml-2`} />
          </div>
        </div>
      );

    case "boxed":
      // Boxed header floating in container
      return (
        <div className={`h-12 ${bgColor} rounded p-2`}>
          <div className={`h-full ${isActive ? "bg-white" : "bg-gray-50"} rounded-lg shadow-sm flex items-center px-2`}>
            <div className={`w-5 h-2.5 ${accentColor} rounded-sm`} />
            <div className="flex-1" />
            <div className="flex gap-1">
              <div className={`w-3 h-1.5 ${accentColor} rounded-sm`} />
              <div className={`w-3 h-1.5 ${accentColor} rounded-sm`} />
              <div className={`w-3 h-1.5 ${accentColor} rounded-sm`} />
            </div>
            <div className={`w-5 h-2.5 ${accentColor} rounded-sm ml-2`} />
          </div>
        </div>
      );

    case "full-width":
      // Logo left, nav centered, CTA right
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

    case "double-row":
      return (
        <div className={`h-12 ${bgColor} rounded flex flex-col px-2`}>
          <div className="flex items-center justify-end gap-1 h-5 border-b border-gray-300/30">
            <div className={`w-8 h-1.5 ${accentColor} rounded-sm opacity-60`} />
            <div className={`w-5 h-2 ${accentColor} rounded-sm`} />
          </div>
          <div className="flex items-center justify-between flex-1">
            <div className={`w-6 h-3 ${accentColor} rounded-sm`} />
            <div className="flex gap-1">
              <div className={`w-4 h-2 ${accentColor} rounded-sm`} />
              <div className={`w-4 h-2 ${accentColor} rounded-sm`} />
              <div className={`w-4 h-2 ${accentColor} rounded-sm`} />
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
