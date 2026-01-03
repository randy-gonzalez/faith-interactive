"use client";

/**
 * Colors Settings Form Component
 *
 * Form for editing brand colors, link colors, gradients, and color presets.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BrandingColorPicker } from "@/components/ui/branding-color-picker";
import { useBranding } from "@/contexts/branding-context";
import type { ChurchBranding } from "@prisma/client";

interface ColorPreset {
  name: string;
  value: string;
}

interface GradientPreset {
  name: string;
  value: string;
}

interface ColorsSettingsFormProps {
  branding: ChurchBranding;
  canEdit: boolean;
}

// Default gradient presets
const DEFAULT_GRADIENTS: GradientPreset[] = [
  { name: "Ocean", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "Sunset", value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { name: "Forest", value: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" },
  { name: "Midnight", value: "linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 100%)" },
  { name: "Sky", value: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)" },
  { name: "Warm", value: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)" },
];

export function ColorsSettingsForm({ branding, canEdit }: ColorsSettingsFormProps) {
  const router = useRouter();
  const brandingContext = useBranding();

  // Colors
  const [colorPrimary, setColorPrimary] = useState(branding.colorPrimary || "#1e40af");
  const [colorSecondary, setColorSecondary] = useState(branding.colorSecondary || "#64748b");
  const [colorAccent, setColorAccent] = useState(branding.colorAccent || "#f59e0b");
  const [colorBackground, setColorBackground] = useState(branding.colorBackground || "#ffffff");
  const [colorText, setColorText] = useState(branding.colorText || "#1f2937");
  const [linkColor, setLinkColor] = useState(branding.linkColor || "");
  const [linkHoverColor, setLinkHoverColor] = useState(branding.linkHoverColor || "");
  const [colorPresets, setColorPresets] = useState<ColorPreset[]>(
    (branding.colorPresets as unknown as ColorPreset[]) || []
  );

  // Gradients
  const [gradientPresets, setGradientPresets] = useState<GradientPreset[]>(() => {
    const presets = branding.gradientPresets as unknown as GradientPreset[];
    return presets && presets.length > 0 ? presets : DEFAULT_GRADIENTS;
  });

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
          colorPrimary: colorPrimary || null,
          colorSecondary: colorSecondary || null,
          colorAccent: colorAccent || null,
          colorBackground: colorBackground || null,
          colorText: colorText || null,
          linkColor: linkColor || null,
          linkHoverColor: linkHoverColor || null,
          colorPresets,
          gradientPresets,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to save colors");
        setSaving(false);
        return;
      }

      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
      brandingContext?.refetch();
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

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-8">
        {/* Main Colors */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Brand Colors</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <BrandingColorPicker
              value={colorPrimary}
              onChange={setColorPrimary}
              disabled={!canEdit}
              label="Primary"
              size="sm"
              showPresets={false}
            />
            <BrandingColorPicker
              value={colorSecondary}
              onChange={setColorSecondary}
              disabled={!canEdit}
              label="Secondary"
              size="sm"
              showPresets={false}
            />
            <BrandingColorPicker
              value={colorAccent}
              onChange={setColorAccent}
              disabled={!canEdit}
              label="Accent"
              size="sm"
              showPresets={false}
            />
            <BrandingColorPicker
              value={colorBackground}
              onChange={setColorBackground}
              disabled={!canEdit}
              label="Background"
              size="sm"
              showPresets={false}
            />
            <BrandingColorPicker
              value={colorText}
              onChange={setColorText}
              disabled={!canEdit}
              label="Text"
              size="sm"
              showPresets={false}
            />
          </div>
        </div>

        {/* Link Colors */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Link Colors</h3>
          <div className="grid grid-cols-2 gap-6 max-w-lg">
            <BrandingColorPicker
              value={linkColor || colorPrimary}
              onChange={setLinkColor}
              disabled={!canEdit}
              label="Link Color"
              size="sm"
              showPresets={false}
            />
            <BrandingColorPicker
              value={linkHoverColor || colorAccent}
              onChange={setLinkHoverColor}
              disabled={!canEdit}
              label="Link Hover"
              size="sm"
              showPresets={false}
            />
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

        {/* Gradient Presets */}
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
          <span className="font-medium">Colors saved successfully</span>
        </div>
      </div>
    </div>
  );
}
