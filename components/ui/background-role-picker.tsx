"use client";

/**
 * Background Role Picker Component
 *
 * Simple picker for selecting semantic background roles.
 * Shows swatches for Primary, Secondary, Accent, Surface, Muted.
 * No custom hex color option - only semantic roles.
 */

import { useBrandingWithDefaults } from "@/contexts/branding-context";
import {
  type BackgroundRole,
  BACKGROUND_ROLES,
  BACKGROUND_ROLE_LABELS,
} from "@/types/blocks";

interface BackgroundRolePickerProps {
  value: BackgroundRole;
  onChange: (role: BackgroundRole) => void;
  disabled?: boolean;
  label?: string;
}

/**
 * Default fallback colors when branding is not available.
 */
const DEFAULT_ROLE_COLORS: Record<BackgroundRole, string> = {
  primary: "#1e40af",
  secondary: "#64748b",
  accent: "#f59e0b",
  surface: "#ffffff",
  muted: "#f3f4f6",
};

/**
 * Get the preview color for a role based on branding context.
 * Always returns a hex color value for reliable rendering.
 */
function getRolePreviewColor(
  role: BackgroundRole,
  colors: { primary: string; secondary: string; accent: string; background: string }
): string {
  switch (role) {
    case "primary":
      return colors.primary || DEFAULT_ROLE_COLORS.primary;
    case "secondary":
      return colors.secondary || DEFAULT_ROLE_COLORS.secondary;
    case "accent":
      return colors.accent || DEFAULT_ROLE_COLORS.accent;
    case "surface":
      return colors.background || DEFAULT_ROLE_COLORS.surface;
    case "muted":
      return DEFAULT_ROLE_COLORS.muted;
    default:
      return DEFAULT_ROLE_COLORS.primary;
  }
}

export function BackgroundRolePicker({
  value,
  onChange,
  disabled,
  label = "Background Color",
}: BackgroundRolePickerProps) {
  const branding = useBrandingWithDefaults();

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {BACKGROUND_ROLES.map((role) => {
          const isSelected = value === role;
          const previewColor = getRolePreviewColor(role, branding.colors);

          return (
            <button
              key={role}
              type="button"
              onClick={() => onChange(role)}
              disabled={disabled}
              className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-all ${
                isSelected
                  ? "border-blue-500 ring-2 ring-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400 bg-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={BACKGROUND_ROLE_LABELS[role]}
            >
              {/* Color swatch */}
              <span
                className="w-5 h-5 rounded border border-gray-200 flex-shrink-0"
                style={{ backgroundColor: previewColor }}
              />
              {/* Label */}
              <span className="text-sm text-gray-700">
                {BACKGROUND_ROLE_LABELS[role]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
