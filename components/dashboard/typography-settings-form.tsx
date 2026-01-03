"use client";

/**
 * Typography Settings Form Component
 *
 * Form for editing typography settings: fonts, sizes, line heights.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useBranding } from "@/contexts/branding-context";
import type { ChurchBranding } from "@prisma/client";

interface TypographySettingsFormProps {
  branding: ChurchBranding;
  canEdit: boolean;
}

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

export function TypographySettingsForm({ branding, canEdit }: TypographySettingsFormProps) {
  const router = useRouter();
  const brandingContext = useBranding();

  // Typography
  const [fontPrimary, setFontPrimary] = useState(branding.fontPrimary || "");
  const [fontSecondary, setFontSecondary] = useState(branding.fontSecondary || "");
  const [fontSizeBase, setFontSizeBase] = useState(branding.fontSizeBase || 16);
  const [headingScale, setHeadingScale] = useState(branding.headingScale || 1.25);
  const [lineHeight, setLineHeight] = useState(branding.lineHeight || 1.5);

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
          fontPrimary: fontPrimary || null,
          fontSecondary: fontSecondary || null,
          fontSizeBase,
          headingScale,
          lineHeight,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to save typography");
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

        {/* Preview */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Preview</h3>
          <div className="p-6 bg-gray-50 rounded-lg space-y-4">
            <h1
              className="text-4xl font-bold"
              style={{
                fontFamily: fontPrimary || "inherit",
                lineHeight: lineHeight,
              }}
            >
              Heading 1
            </h1>
            <h2
              className="text-2xl font-semibold"
              style={{
                fontFamily: fontPrimary || "inherit",
                lineHeight: lineHeight,
              }}
            >
              Heading 2
            </h2>
            <h3
              className="text-xl font-medium"
              style={{
                fontFamily: fontPrimary || "inherit",
                lineHeight: lineHeight,
              }}
            >
              Heading 3
            </h3>
            <p
              style={{
                fontFamily: fontSecondary || "inherit",
                fontSize: `${fontSizeBase}px`,
                lineHeight: lineHeight,
              }}
            >
              This is a sample paragraph to demonstrate how your body text will
              look with the selected font and typography settings. The quick brown
              fox jumps over the lazy dog.
            </p>
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
          <span className="font-medium">Typography saved successfully</span>
        </div>
      </div>
    </div>
  );
}
