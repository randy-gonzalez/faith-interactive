"use client";

/**
 * Branding Form Component
 *
 * Form for editing church branding settings with tabbed interface:
 * - Logos: Header, light, dark, favicon
 * - Colors: Primary, secondary, accent, presets
 * - Gradients: Preset gradients
 * - Typography: Fonts, sizes, line heights
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MediaPicker } from "@/components/dashboard/media-picker";
import type { ChurchBranding } from "@prisma/client";

interface ColorPreset {
  name: string;
  value: string;
}

interface GradientPreset {
  name: string;
  value: string;
}

interface BrandingFormProps {
  branding: ChurchBranding;
  canEdit: boolean;
}

const TABS = [
  { id: "logos", label: "Logos" },
  { id: "colors", label: "Colors" },
  { id: "gradients", label: "Gradients" },
  { id: "typography", label: "Typography" },
];

// Popular Google Fonts for selection
const FONT_OPTIONS = [
  { value: "", label: "System Default" },
  { value: "Inter", label: "Inter" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Lato", label: "Lato" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Poppins", label: "Poppins" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Merriweather", label: "Merriweather" },
  { value: "Raleway", label: "Raleway" },
  { value: "Source Sans Pro", label: "Source Sans Pro" },
  { value: "Oswald", label: "Oswald" },
  { value: "Nunito", label: "Nunito" },
  { value: "PT Sans", label: "PT Sans" },
  { value: "Work Sans", label: "Work Sans" },
];

// Default gradient presets
const DEFAULT_GRADIENTS: GradientPreset[] = [
  { name: "Ocean", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "Sunset", value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { name: "Forest", value: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" },
  { name: "Midnight", value: "linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 100%)" },
  { name: "Sky", value: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)" },
  { name: "Warm", value: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)" },
];

export function BrandingForm({ branding, canEdit }: BrandingFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("logos");

  // Logos
  const [logoHeaderUrl, setLogoHeaderUrl] = useState(branding.logoHeaderUrl || "");
  const [logoLightUrl, setLogoLightUrl] = useState(branding.logoLightUrl || "");
  const [logoDarkUrl, setLogoDarkUrl] = useState(branding.logoDarkUrl || "");
  const [faviconUrl, setFaviconUrl] = useState(branding.faviconUrl || "");

  // Colors
  const [colorPrimary, setColorPrimary] = useState(branding.colorPrimary || "#1e40af");
  const [colorSecondary, setColorSecondary] = useState(branding.colorSecondary || "#64748b");
  const [colorAccent, setColorAccent] = useState(branding.colorAccent || "#f59e0b");
  const [colorBackground, setColorBackground] = useState(branding.colorBackground || "#ffffff");
  const [colorText, setColorText] = useState(branding.colorText || "#1f2937");
  const [colorPresets, setColorPresets] = useState<ColorPreset[]>(
    (branding.colorPresets as unknown as ColorPreset[]) || []
  );

  // Gradients
  const [gradientPresets, setGradientPresets] = useState<GradientPreset[]>(() => {
    const presets = branding.gradientPresets as unknown as GradientPreset[];
    return presets && presets.length > 0 ? presets : DEFAULT_GRADIENTS;
  });

  // Typography
  const [fontPrimary, setFontPrimary] = useState(branding.fontPrimary || "");
  const [fontSecondary, setFontSecondary] = useState(branding.fontSecondary || "");
  const [fontSizeBase, setFontSizeBase] = useState(branding.fontSizeBase || 16);
  const [headingScale, setHeadingScale] = useState(branding.headingScale || 1.25);
  const [lineHeight, setLineHeight] = useState(branding.lineHeight || 1.5);

  // Button/Border styles
  const [buttonStyle, setButtonStyle] = useState(branding.buttonStyle || "rounded");
  const [buttonRadius, setButtonRadius] = useState(branding.buttonRadius || 6);
  const [borderRadius, setBorderRadius] = useState(branding.borderRadius || 8);
  const [linkColor, setLinkColor] = useState(branding.linkColor || "");
  const [linkHoverColor, setLinkHoverColor] = useState(branding.linkHoverColor || "");

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Color preset management
  const [newColorName, setNewColorName] = useState("");
  const [newColorValue, setNewColorValue] = useState("#000000");

  // Gradient preset management
  const [newGradientName, setNewGradientName] = useState("");
  const [newGradientValue, setNewGradientValue] = useState("");

  function addColorPreset() {
    if (!newColorName.trim() || !newColorValue) return;
    setColorPresets([...colorPresets, { name: newColorName.trim(), value: newColorValue }]);
    setNewColorName("");
    setNewColorValue("#000000");
  }

  function removeColorPreset(index: number) {
    setColorPresets(colorPresets.filter((_, i) => i !== index));
  }

  function addGradientPreset() {
    if (!newGradientName.trim() || !newGradientValue.trim()) return;
    setGradientPresets([...gradientPresets, { name: newGradientName.trim(), value: newGradientValue.trim() }]);
    setNewGradientName("");
    setNewGradientValue("");
  }

  function removeGradientPreset(index: number) {
    setGradientPresets(gradientPresets.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!canEdit) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/branding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logoHeaderUrl: logoHeaderUrl || null,
          logoLightUrl: logoLightUrl || null,
          logoDarkUrl: logoDarkUrl || null,
          faviconUrl: faviconUrl || null,
          colorPrimary: colorPrimary || null,
          colorSecondary: colorSecondary || null,
          colorAccent: colorAccent || null,
          colorBackground: colorBackground || null,
          colorText: colorText || null,
          colorPresets,
          gradientPresets,
          fontPrimary: fontPrimary || null,
          fontSecondary: fontSecondary || null,
          fontSizeBase,
          headingScale,
          lineHeight,
          buttonStyle,
          buttonRadius,
          borderRadius,
          linkColor: linkColor || null,
          linkHoverColor: linkHoverColor || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to save branding");
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
          {/* Logos Tab */}
          <TabPanel id="logos" activeTab={activeTab}>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Header Logo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Header Logo
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Main logo displayed in the website header
                  </p>
                  <MediaPicker
                    value={logoHeaderUrl || null}
                    onChange={(url) => setLogoHeaderUrl(url || "")}
                    disabled={!canEdit}
                    placeholder="Select header logo"
                  />
                  {logoHeaderUrl && (
                    <div className="mt-2 p-4 bg-gray-100 rounded-lg">
                      <img src={logoHeaderUrl} alt="Header logo preview" className="max-h-16 object-contain" />
                    </div>
                  )}
                </div>

                {/* Light Logo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Light Logo
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Logo variant for dark backgrounds
                  </p>
                  <MediaPicker
                    value={logoLightUrl || null}
                    onChange={(url) => setLogoLightUrl(url || "")}
                    disabled={!canEdit}
                    placeholder="Select light logo"
                  />
                  {logoLightUrl && (
                    <div className="mt-2 p-4 bg-gray-800 rounded-lg">
                      <img src={logoLightUrl} alt="Light logo preview" className="max-h-16 object-contain" />
                    </div>
                  )}
                </div>

                {/* Dark Logo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dark Logo
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Logo variant for light backgrounds
                  </p>
                  <MediaPicker
                    value={logoDarkUrl || null}
                    onChange={(url) => setLogoDarkUrl(url || "")}
                    disabled={!canEdit}
                    placeholder="Select dark logo"
                  />
                  {logoDarkUrl && (
                    <div className="mt-2 p-4 bg-white border rounded-lg">
                      <img src={logoDarkUrl} alt="Dark logo preview" className="max-h-16 object-contain" />
                    </div>
                  )}
                </div>

                {/* Favicon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Favicon
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Small icon shown in browser tabs (32x32 recommended)
                  </p>
                  <MediaPicker
                    value={faviconUrl || null}
                    onChange={(url) => setFaviconUrl(url || "")}
                    disabled={!canEdit}
                    placeholder="Select favicon"
                  />
                  {faviconUrl && (
                    <div className="mt-2 flex items-center gap-2">
                      <img src={faviconUrl} alt="Favicon preview" className="w-8 h-8 object-contain" />
                      <span className="text-xs text-gray-500">Favicon preview</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabPanel>

          {/* Colors Tab */}
          <TabPanel id="colors" activeTab={activeTab}>
            <div className="p-6 space-y-8">
              {/* Main Colors */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Brand Colors</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {/* Primary */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Primary</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colorPrimary}
                        onChange={(e) => setColorPrimary(e.target.value)}
                        disabled={!canEdit}
                        className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={colorPrimary}
                        onChange={(e) => setColorPrimary(e.target.value)}
                        disabled={!canEdit}
                        className="flex-1 px-2 py-1 text-xs font-mono border border-gray-300 rounded text-gray-900"
                      />
                    </div>
                  </div>

                  {/* Secondary */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Secondary</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colorSecondary}
                        onChange={(e) => setColorSecondary(e.target.value)}
                        disabled={!canEdit}
                        className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={colorSecondary}
                        onChange={(e) => setColorSecondary(e.target.value)}
                        disabled={!canEdit}
                        className="flex-1 px-2 py-1 text-xs font-mono border border-gray-300 rounded text-gray-900"
                      />
                    </div>
                  </div>

                  {/* Accent */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Accent</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colorAccent}
                        onChange={(e) => setColorAccent(e.target.value)}
                        disabled={!canEdit}
                        className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={colorAccent}
                        onChange={(e) => setColorAccent(e.target.value)}
                        disabled={!canEdit}
                        className="flex-1 px-2 py-1 text-xs font-mono border border-gray-300 rounded text-gray-900"
                      />
                    </div>
                  </div>

                  {/* Background */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Background</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colorBackground}
                        onChange={(e) => setColorBackground(e.target.value)}
                        disabled={!canEdit}
                        className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={colorBackground}
                        onChange={(e) => setColorBackground(e.target.value)}
                        disabled={!canEdit}
                        className="flex-1 px-2 py-1 text-xs font-mono border border-gray-300 rounded text-gray-900"
                      />
                    </div>
                  </div>

                  {/* Text */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Text</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colorText}
                        onChange={(e) => setColorText(e.target.value)}
                        disabled={!canEdit}
                        className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={colorText}
                        onChange={(e) => setColorText(e.target.value)}
                        disabled={!canEdit}
                        className="flex-1 px-2 py-1 text-xs font-mono border border-gray-300 rounded text-gray-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Link Colors */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Link Colors</h3>
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Link Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={linkColor || colorPrimary}
                        onChange={(e) => setLinkColor(e.target.value)}
                        disabled={!canEdit}
                        className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={linkColor}
                        onChange={(e) => setLinkColor(e.target.value)}
                        disabled={!canEdit}
                        placeholder="Uses primary"
                        className="flex-1 px-2 py-1 text-xs font-mono border border-gray-300 rounded text-gray-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Link Hover</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={linkHoverColor || colorAccent}
                        onChange={(e) => setLinkHoverColor(e.target.value)}
                        disabled={!canEdit}
                        className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={linkHoverColor}
                        onChange={(e) => setLinkHoverColor(e.target.value)}
                        disabled={!canEdit}
                        placeholder="Uses accent"
                        className="flex-1 px-2 py-1 text-xs font-mono border border-gray-300 rounded text-gray-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Presets */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Custom Color Presets</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Add custom colors that will be available in the block editor
                </p>

                {/* Existing presets */}
                {colorPresets.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {colorPresets.map((preset, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full"
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: preset.value }}
                        />
                        <span className="text-sm text-gray-700">{preset.name}</span>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => removeColorPreset(index)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new preset */}
                {canEdit && (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newColorValue}
                      onChange={(e) => setNewColorValue(e.target.value)}
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      placeholder="Color name"
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                    />
                    <Button type="button" variant="secondary" onClick={addColorPreset}>
                      Add Color
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabPanel>

          {/* Gradients Tab */}
          <TabPanel id="gradients" activeTab={activeTab}>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Gradient Presets</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Gradients available in the block editor for backgrounds
                </p>

                {/* Existing gradients */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {gradientPresets.map((preset, index) => (
                    <div key={index} className="relative group">
                      <div
                        className="h-24 rounded-lg border border-gray-200"
                        style={{ background: preset.value }}
                      />
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-gray-700">{preset.name}</span>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => removeGradientPreset(index)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add new gradient */}
                {canEdit && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Add Custom Gradient</h4>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={newGradientName}
                        onChange={(e) => setNewGradientName(e.target.value)}
                        placeholder="Gradient name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                      />
                      <input
                        type="text"
                        value={newGradientValue}
                        onChange={(e) => setNewGradientValue(e.target.value)}
                        placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono text-gray-900"
                      />
                      {newGradientValue && (
                        <div
                          className="h-16 rounded-lg border border-gray-200"
                          style={{ background: newGradientValue }}
                        />
                      )}
                      <Button type="button" variant="secondary" onClick={addGradientPreset}>
                        Add Gradient
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabPanel>

          {/* Typography Tab */}
          <TabPanel id="typography" activeTab={activeTab}>
            <div className="p-6 space-y-8">
              {/* Fonts */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Fonts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heading Font
                    </label>
                    <select
                      value={fontPrimary}
                      onChange={(e) => setFontPrimary(e.target.value)}
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                    >
                      {FONT_OPTIONS.map((font) => (
                        <option key={font.value} value={font.value}>
                          {font.label}
                        </option>
                      ))}
                    </select>
                    {fontPrimary && (
                      <p className="mt-2 text-2xl" style={{ fontFamily: fontPrimary }}>
                        Sample Heading Text
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Body Font
                    </label>
                    <select
                      value={fontSecondary}
                      onChange={(e) => setFontSecondary(e.target.value)}
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                    >
                      {FONT_OPTIONS.map((font) => (
                        <option key={font.value} value={font.value}>
                          {font.label}
                        </option>
                      ))}
                    </select>
                    {fontSecondary && (
                      <p className="mt-2" style={{ fontFamily: fontSecondary }}>
                        Sample body text for your website content.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Typography Settings */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Typography Scale</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base Font Size
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="12"
                        max="24"
                        value={fontSizeBase}
                        onChange={(e) => setFontSizeBase(parseInt(e.target.value))}
                        disabled={!canEdit}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-600 w-12">{fontSizeBase}px</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heading Scale
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="1"
                        max="1.5"
                        step="0.05"
                        value={headingScale}
                        onChange={(e) => setHeadingScale(parseFloat(e.target.value))}
                        disabled={!canEdit}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-600 w-12">{headingScale.toFixed(2)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Line Height
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="1"
                        max="2"
                        step="0.1"
                        value={lineHeight}
                        onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                        disabled={!canEdit}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-600 w-12">{lineHeight.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Button & Border Styles */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Button & Border Styles</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Button Style
                    </label>
                    <select
                      value={buttonStyle}
                      onChange={(e) => setButtonStyle(e.target.value)}
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                    >
                      <option value="rounded">Rounded</option>
                      <option value="pill">Pill</option>
                      <option value="square">Square</option>
                    </select>
                    <div className="mt-3">
                      <button
                        type="button"
                        className="px-4 py-2 text-white text-sm font-medium"
                        style={{
                          backgroundColor: colorPrimary,
                          borderRadius:
                            buttonStyle === "pill" ? "9999px" :
                            buttonStyle === "square" ? "0px" :
                            `${buttonRadius}px`,
                        }}
                      >
                        Sample Button
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Button Radius
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={buttonRadius}
                        onChange={(e) => setButtonRadius(parseInt(e.target.value))}
                        disabled={!canEdit || buttonStyle === "pill" || buttonStyle === "square"}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-600 w-12">{buttonRadius}px</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Global Border Radius
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="24"
                        value={borderRadius}
                        onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                        disabled={!canEdit}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-600 w-12">{borderRadius}px</span>
                    </div>
                    <div
                      className="mt-3 p-4 bg-gray-100 border border-gray-300"
                      style={{ borderRadius: `${borderRadius}px` }}
                    >
                      <p className="text-sm text-gray-600">Card preview</p>
                    </div>
                  </div>
                </div>
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
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">Branding saved successfully</span>
        </div>
      </div>
    </div>
  );
}
