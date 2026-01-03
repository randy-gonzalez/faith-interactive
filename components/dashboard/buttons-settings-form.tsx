"use client";

/**
 * Buttons Settings Form Component
 *
 * Form for editing button styles, colors, and border radius.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BrandingColorPicker } from "@/components/ui/branding-color-picker";
import { useBranding } from "@/contexts/branding-context";
import type { ChurchBranding } from "@prisma/client";

interface ButtonsSettingsFormProps {
  branding: ChurchBranding;
  canEdit: boolean;
}

export function ButtonsSettingsForm({ branding, canEdit }: ButtonsSettingsFormProps) {
  const router = useRouter();
  const brandingContext = useBranding();

  // Get brand colors for defaults
  const colorPrimary = branding.colorPrimary || "#1e40af";
  const colorSecondary = branding.colorSecondary || "#64748b";
  const colorAccent = branding.colorAccent || "#f59e0b";

  // Button/Border styles
  const [buttonStyle, setButtonStyle] = useState(branding.buttonStyle || "rounded");
  const [buttonRadius, setButtonRadius] = useState(branding.buttonRadius || 6);
  const [borderRadius, setBorderRadius] = useState(branding.borderRadius || 8);

  // Button colors
  const [buttonPrimaryBg, setButtonPrimaryBg] = useState(branding.buttonPrimaryBg || "");
  const [buttonPrimaryText, setButtonPrimaryText] = useState(branding.buttonPrimaryText || "");
  const [buttonSecondaryBg, setButtonSecondaryBg] = useState(branding.buttonSecondaryBg || "");
  const [buttonSecondaryText, setButtonSecondaryText] = useState(branding.buttonSecondaryText || "");
  const [buttonOutlineBorder, setButtonOutlineBorder] = useState(branding.buttonOutlineBorder || "");
  const [buttonOutlineText, setButtonOutlineText] = useState(branding.buttonOutlineText || "");
  const [buttonAccentBg, setButtonAccentBg] = useState(branding.buttonAccentBg || "");
  const [buttonAccentText, setButtonAccentText] = useState(branding.buttonAccentText || "");

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  async function handleSave() {
    if (!canEdit) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/branding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buttonStyle,
          buttonRadius,
          borderRadius,
          buttonPrimaryBg: buttonPrimaryBg || null,
          buttonPrimaryText: buttonPrimaryText || null,
          buttonSecondaryBg: buttonSecondaryBg || null,
          buttonSecondaryText: buttonSecondaryText || null,
          buttonOutlineBorder: buttonOutlineBorder || null,
          buttonOutlineText: buttonOutlineText || null,
          buttonAccentBg: buttonAccentBg || null,
          buttonAccentText: buttonAccentText || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to save button styles");
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
        {/* Button Style */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Button Shape</h3>
          <div className="grid grid-cols-3 gap-4 max-w-lg">
            {[
              { value: "rounded", label: "Rounded", preview: "8px" },
              { value: "pill", label: "Pill", preview: "9999px" },
              { value: "square", label: "Square", preview: "0px" },
            ].map((style) => (
              <button
                key={style.value}
                type="button"
                onClick={() => setButtonStyle(style.value)}
                disabled={!canEdit}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  buttonStyle === style.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div
                  className="w-full h-8 mb-2"
                  style={{
                    backgroundColor: colorPrimary,
                    borderRadius: style.preview,
                  }}
                />
                <span className="text-sm font-medium text-gray-700">{style.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Button Radius (only for rounded) */}
        {buttonStyle === "rounded" && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">Corner Radius</h3>
            <div className="max-w-md">
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={buttonRadius}
                  onChange={(e) => setButtonRadius(parseInt(e.target.value))}
                  disabled={!canEdit}
                  className="flex-1"
                />
                <span className="text-sm font-mono text-gray-600 w-16">{buttonRadius}px</span>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  className="px-6 py-2.5 text-white text-sm font-medium"
                  style={{
                    backgroundColor: colorPrimary,
                    borderRadius: `${buttonRadius}px`,
                  }}
                >
                  Preview Button
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Button Colors */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Button Colors</h3>
          <p className="text-xs text-gray-500 mb-4">
            Customize colors for each button type. Leave empty to use brand colors.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Button Colors */}
            <div className="p-4 border border-gray-200 rounded-lg space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Primary Button</h4>
              <BrandingColorPicker
                value={buttonPrimaryBg || colorPrimary}
                onChange={setButtonPrimaryBg}
                disabled={!canEdit}
                label="Background"
                size="sm"
                showPresets={false}
              />
              <BrandingColorPicker
                value={buttonPrimaryText || "#ffffff"}
                onChange={setButtonPrimaryText}
                disabled={!canEdit}
                label="Text"
                size="sm"
                showPresets={false}
              />
            </div>

            {/* Secondary Button Colors */}
            <div className="p-4 border border-gray-200 rounded-lg space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Secondary Button</h4>
              <BrandingColorPicker
                value={buttonSecondaryBg || colorSecondary}
                onChange={setButtonSecondaryBg}
                disabled={!canEdit}
                label="Background"
                size="sm"
                showPresets={false}
              />
              <BrandingColorPicker
                value={buttonSecondaryText || "#ffffff"}
                onChange={setButtonSecondaryText}
                disabled={!canEdit}
                label="Text"
                size="sm"
                showPresets={false}
              />
            </div>

            {/* Outline Button Colors */}
            <div className="p-4 border border-gray-200 rounded-lg space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Outline Button</h4>
              <BrandingColorPicker
                value={buttonOutlineBorder || colorPrimary}
                onChange={setButtonOutlineBorder}
                disabled={!canEdit}
                label="Border"
                size="sm"
                showPresets={false}
              />
              <BrandingColorPicker
                value={buttonOutlineText || colorPrimary}
                onChange={setButtonOutlineText}
                disabled={!canEdit}
                label="Text"
                size="sm"
                showPresets={false}
              />
            </div>

            {/* Accent Button Colors */}
            <div className="p-4 border border-gray-200 rounded-lg space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Accent Button</h4>
              <BrandingColorPicker
                value={buttonAccentBg || colorAccent}
                onChange={setButtonAccentBg}
                disabled={!canEdit}
                label="Background"
                size="sm"
                showPresets={false}
              />
              <BrandingColorPicker
                value={buttonAccentText || "#ffffff"}
                onChange={setButtonAccentText}
                disabled={!canEdit}
                label="Text"
                size="sm"
                showPresets={false}
              />
            </div>
          </div>
        </div>

        {/* Button Preview */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Button Preview</h3>
          <div className="flex flex-wrap gap-4 p-6 bg-gray-50 rounded-lg">
            {/* Primary */}
            <button
              type="button"
              className="px-6 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
              style={{
                backgroundColor: buttonPrimaryBg || colorPrimary,
                color: buttonPrimaryText || "#ffffff",
                borderRadius:
                  buttonStyle === "pill" ? "9999px" :
                  buttonStyle === "square" ? "0px" :
                  `${buttonRadius}px`,
              }}
            >
              Primary Button
            </button>

            {/* Secondary */}
            <button
              type="button"
              className="px-6 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
              style={{
                backgroundColor: buttonSecondaryBg || colorSecondary,
                color: buttonSecondaryText || "#ffffff",
                borderRadius:
                  buttonStyle === "pill" ? "9999px" :
                  buttonStyle === "square" ? "0px" :
                  `${buttonRadius}px`,
              }}
            >
              Secondary Button
            </button>

            {/* Outline */}
            <button
              type="button"
              className="px-6 py-2.5 text-sm font-medium transition-colors hover:bg-gray-100"
              style={{
                color: buttonOutlineText || colorPrimary,
                border: `2px solid ${buttonOutlineBorder || colorPrimary}`,
                borderRadius:
                  buttonStyle === "pill" ? "9999px" :
                  buttonStyle === "square" ? "0px" :
                  `${buttonRadius}px`,
              }}
            >
              Outline Button
            </button>

            {/* Accent */}
            <button
              type="button"
              className="px-6 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
              style={{
                backgroundColor: buttonAccentBg || colorAccent,
                color: buttonAccentText || "#ffffff",
                borderRadius:
                  buttonStyle === "pill" ? "9999px" :
                  buttonStyle === "square" ? "0px" :
                  `${buttonRadius}px`,
              }}
            >
              Accent Button
            </button>
          </div>
        </div>

        {/* Global Border Radius */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Global Border Radius</h3>
          <p className="text-xs text-gray-500 mb-4">
            Applied to cards, images, and other UI elements
          </p>
          <div className="max-w-md">
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="24"
                value={borderRadius}
                onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                disabled={!canEdit}
                className="flex-1"
              />
              <span className="text-sm font-mono text-gray-600 w-16">{borderRadius}px</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div
                className="p-4 bg-white border border-gray-200 shadow-sm"
                style={{ borderRadius: `${borderRadius}px` }}
              >
                <div className="h-16 bg-gray-100 mb-3" style={{ borderRadius: `${Math.max(0, borderRadius - 4)}px` }} />
                <p className="text-sm font-medium text-gray-900">Card Title</p>
                <p className="text-xs text-gray-500">Card preview</p>
              </div>
              <div
                className="h-32 bg-gradient-to-br from-blue-500 to-purple-600"
                style={{ borderRadius: `${borderRadius}px` }}
              />
            </div>
          </div>
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
          <span className="font-medium">Button styles saved successfully</span>
        </div>
      </div>
    </div>
  );
}
