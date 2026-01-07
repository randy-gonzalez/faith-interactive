"use client";

/**
 * Spacing Settings Form Component
 *
 * Form for editing global spacing density.
 * Provides live preview of section padding, card gaps, and button spacing.
 *
 * Previews use the same CSS variable tokens as the public site to accurately
 * demonstrate how density changes affect the layout.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useBranding } from "@/contexts/branding-context";
import type { ChurchBranding } from "@prisma/client";
import type { SpacingDensity, ContentWidth } from "@/lib/theme/tokens";
import { BASE_SPACING_RAMP, DENSITY_MULTIPLIERS, CONTENT_WIDTH_VALUES } from "@/lib/theme/tokens";

interface SpacingSettingsFormProps {
  branding: ChurchBranding;
  canEdit: boolean;
}

const DENSITY_OPTIONS: {
  value: SpacingDensity;
  label: string;
  description: string;
}[] = [
  {
    value: "compact",
    label: "Compact",
    description: `Tighter spacing (${DENSITY_MULTIPLIERS.compact}x) — fits more content`,
  },
  {
    value: "comfortable",
    label: "Comfortable",
    description: "Default spacing (1x) — balanced and readable",
  },
  {
    value: "spacious",
    label: "Spacious",
    description: `More breathing room (${DENSITY_MULTIPLIERS.spacious}x) — open feel`,
  },
];

const CONTENT_WIDTH_OPTIONS: {
  value: ContentWidth;
  label: string;
  description: string;
  width: string;
}[] = [
  {
    value: "narrow",
    label: "Narrow",
    description: "Reading-focused, blog-style layout",
    width: CONTENT_WIDTH_VALUES.narrow,
  },
  {
    value: "normal",
    label: "Normal",
    description: "Balanced default for most sites",
    width: CONTENT_WIDTH_VALUES.normal,
  },
  {
    value: "wide",
    label: "Wide",
    description: "Fills large screens for immersive content",
    width: CONTENT_WIDTH_VALUES.wide,
  },
];

export function SpacingSettingsForm({ branding, canEdit }: SpacingSettingsFormProps) {
  const router = useRouter();
  const brandingContext = useBranding();

  // Spacing density
  const [spacingDensity, setSpacingDensity] = useState<SpacingDensity>(
    (branding.spacingDensity as SpacingDensity) || "comfortable"
  );

  // Content width
  const [contentWidth, setContentWidth] = useState<ContentWidth>(
    (branding.contentWidth as ContentWidth) || "normal"
  );

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Calculate spacing values for preview
  const multiplier = DENSITY_MULTIPLIERS[spacingDensity];
  const spacingRamp = BASE_SPACING_RAMP.map((value) => Math.round(value * multiplier));

  // Key spacing values used in previews (matching block-styles.ts)
  const space5 = spacingRamp[4]; // --space-5 (24px base)
  const space6 = spacingRamp[5]; // --space-6 (32px base)
  const space7 = spacingRamp[6]; // --space-7 (48px base)
  const space8 = spacingRamp[7]; // --space-8 (64px base)
  const space3 = spacingRamp[2]; // --space-3 (12px base)
  const space4 = spacingRamp[3]; // --space-4 (16px base)

  async function handleSave() {
    if (!canEdit) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/branding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spacingDensity,
          contentWidth,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to save spacing settings");
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
        {/* Density Selector */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Spacing Density</h3>
          <p className="text-xs text-gray-500 mb-4">
            Controls padding, margins, and gaps throughout your public website
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DENSITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSpacingDensity(option.value)}
                disabled={!canEdit}
                className={`p-4 border-2 rounded-lg transition-colors text-left ${
                  spacingDensity === option.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                } ${!canEdit ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      spacingDensity === option.value
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {spacingDensity === option.value && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{option.label}</span>
                </div>
                <p className="text-xs text-gray-500">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Content Width Selector */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Content Width</h3>
          <p className="text-xs text-gray-500 mb-4">
            Maximum width of content containers (header, footer, and page sections)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CONTENT_WIDTH_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setContentWidth(option.value)}
                disabled={!canEdit}
                className={`p-4 border-2 rounded-lg transition-colors text-left ${
                  contentWidth === option.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                } ${!canEdit ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      contentWidth === option.value
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {contentWidth === option.value && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{option.label}</span>
                  <span className="text-xs text-gray-400 font-mono">({option.width})</span>
                </div>
                <p className="text-xs text-gray-500">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Content Width Preview */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Content Width Preview</h3>
          <p className="text-xs text-gray-500 mb-4">
            Shows how content will appear at different widths (current: {CONTENT_WIDTH_VALUES[contentWidth]})
          </p>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-100 overflow-x-auto">
            <div className="relative min-w-[600px]">
              {/* Full width indicator */}
              <div className="absolute left-0 right-0 h-8 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                <span className="text-xs text-gray-400 bg-gray-100 px-2">Full screen width</span>
              </div>
              {/* Container preview */}
              <div className="mt-12 relative">
                {CONTENT_WIDTH_OPTIONS.map((option, idx) => {
                  const widthNum = parseInt(option.width);
                  const maxPreviewWidth = 88; // 88rem = wide
                  const widthPercent = (widthNum / maxPreviewWidth) * 100;
                  const isActive = contentWidth === option.value;
                  return (
                    <div
                      key={option.value}
                      className={`mx-auto mb-2 h-10 rounded flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                      style={{ width: `${widthPercent}%` }}
                    >
                      <span className="text-xs font-medium">{option.label} ({option.width})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Spacing Scale Preview */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Spacing Scale Preview</h3>
          <p className="text-xs text-gray-500 mb-4">
            The 8-step spacing ramp used throughout your site ({multiplier}x multiplier)
          </p>
          <div className="flex flex-wrap items-end gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            {spacingRamp.map((px, index) => (
              <div key={index} className="text-center">
                <div
                  className="bg-blue-500 rounded mx-auto"
                  style={{ width: `${Math.max(px, 4)}px`, height: `${Math.max(px, 4)}px` }}
                />
                <p className="text-xs text-gray-600 mt-2 font-medium">--space-{index + 1}</p>
                <p className="text-xs font-mono text-gray-400">{px}px</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section Padding Preview - Two stacked sections */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Section Padding Preview</h3>
          <p className="text-xs text-gray-500 mb-4">
            How content sections will appear on your public site (using --space-8 / --space-6)
          </p>
          <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
            {/* Section 1 - Surface background */}
            <div
              className="bg-white border-b border-gray-200"
              style={{
                paddingTop: `${space8}px`,
                paddingBottom: `${space8}px`,
                paddingLeft: `${space6}px`,
                paddingRight: `${space6}px`,
              }}
            >
              <div className="max-w-md mx-auto text-center border border-blue-200 bg-blue-50/50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Section One</h4>
                <p className="text-sm text-gray-600">
                  This section uses SECTION_PADDING with the current density.
                </p>
              </div>
            </div>
            {/* Section 2 - Muted background */}
            <div
              className="bg-gray-100"
              style={{
                paddingTop: `${space8}px`,
                paddingBottom: `${space8}px`,
                paddingLeft: `${space6}px`,
                paddingRight: `${space6}px`,
              }}
            >
              <div className="max-w-md mx-auto text-center border border-blue-200 bg-blue-50/50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Section Two</h4>
                <p className="text-sm text-gray-600">
                  The dashed border shows the outer edge of padding.
                </p>
              </div>
            </div>
            {/* Info bar */}
            <div className="px-4 py-3 bg-gray-800 text-xs text-gray-300 font-mono flex justify-between">
              <span>py: {space8}px (--space-8)</span>
              <span>px: {space6}px (--space-6)</span>
            </div>
          </div>
        </div>

        {/* Card Grid Gap Preview - 6 cards in 2 rows */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Card Grid Gap Preview</h3>
          <p className="text-xs text-gray-500 mb-4">
            Spacing between cards in grid layouts (using --space-6)
          </p>
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <div
              className="grid grid-cols-3"
              style={{ gap: `${space6}px` }}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-2 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500 font-mono text-center">
              gap: {space6}px (--space-6)
            </div>
          </div>
        </div>

        {/* Button Spacing Preview */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Button Spacing Preview</h3>
          <p className="text-xs text-gray-500 mb-4">
            Padding inside buttons (--space-3 / --space-5) and gaps between buttons (--space-4)
          </p>
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            {/* Button group */}
            <div
              className="flex flex-wrap"
              style={{ gap: `${space4}px` }}
            >
              <button
                type="button"
                className="bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors hover:bg-blue-700"
                style={{
                  paddingTop: `${space3}px`,
                  paddingBottom: `${space3}px`,
                  paddingLeft: `${space5}px`,
                  paddingRight: `${space5}px`,
                }}
              >
                Primary Button
              </button>
              <button
                type="button"
                className="bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors hover:bg-gray-700"
                style={{
                  paddingTop: `${space3}px`,
                  paddingBottom: `${space3}px`,
                  paddingLeft: `${space5}px`,
                  paddingRight: `${space5}px`,
                }}
              >
                Secondary Button
              </button>
              <button
                type="button"
                className="bg-transparent text-blue-600 text-sm font-medium rounded-lg border-2 border-blue-600 transition-colors hover:bg-blue-50"
                style={{
                  paddingTop: `${space3}px`,
                  paddingBottom: `${space3}px`,
                  paddingLeft: `${space5}px`,
                  paddingRight: `${space5}px`,
                }}
              >
                Outline Button
              </button>
            </div>
            {/* Info */}
            <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500 font-mono space-y-1">
              <div>Button padding: {space3}px / {space5}px (--space-3 / --space-5)</div>
              <div>Button gap: {space4}px (--space-4)</div>
            </div>
          </div>
        </div>

        {/* Compact Section Padding Preview */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Compact Section Preview</h3>
          <p className="text-xs text-gray-500 mb-4">
            Used for smaller blocks like images and buttons (--space-7 / --space-5)
          </p>
          <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
            <div
              className="bg-gray-50"
              style={{
                paddingTop: `${space7}px`,
                paddingBottom: `${space7}px`,
                paddingLeft: `${space5}px`,
                paddingRight: `${space5}px`,
              }}
            >
              <div className="max-w-sm mx-auto text-center border border-gray-200 bg-white rounded-lg p-3">
                <p className="text-sm text-gray-600">Compact section content</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-gray-800 text-xs text-gray-300 font-mono flex justify-between">
              <span>py: {space7}px (--space-7)</span>
              <span>px: {space5}px (--space-5)</span>
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
          <span className="font-medium">Spacing settings saved successfully</span>
        </div>
      </div>
    </div>
  );
}
