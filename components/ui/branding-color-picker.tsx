/**
 * Branding Color Picker
 *
 * Reusable color picker component that displays brand colors as swatches
 * alongside the native color picker and hex input.
 *
 * When a brand color swatch is clicked, it stores a reference (e.g., "brand:primary")
 * instead of the hex value. This allows colors to update globally when brand settings change.
 */

"use client";

import { useState, useEffect, useId, useMemo } from "react";
import { useBrandingWithDefaults, ColorPreset } from "@/contexts/branding-context";
import { Check } from "lucide-react";
import {
  isBrandColorReference,
  getBrandColorName,
  createBrandColorReference,
  type BrandColorName,
} from "@/types/blocks";
import {
  resolveColor,
  type BrandColors,
} from "@/lib/blocks/resolve-colors";

interface BrandingColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
  label?: string;
  size?: "sm" | "md" | "lg";
  includeOpacity?: boolean;
  showPresets?: boolean;
  customPresets?: ColorPreset[];
}

// Size configurations
const sizeConfig = {
  sm: {
    picker: "w-8 h-8",
    swatch: "w-6 h-6",
    input: "text-xs",
    checkIcon: 12,
  },
  md: {
    picker: "w-10 h-10",
    swatch: "w-8 h-8",
    input: "text-sm",
    checkIcon: 14,
  },
  lg: {
    picker: "w-12 h-12",
    swatch: "w-10 h-10",
    input: "text-base",
    checkIcon: 16,
  },
};

// Validate hex color format
function isValidHex(color: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(color);
}

// Normalize hex to 6 or 8 digit format
function normalizeHex(color: string): string {
  let hex = color.replace(/^#/, "");

  // Handle shorthand (3 digit) hex
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  return `#${hex.toLowerCase()}`;
}

// Extract opacity from 8-digit hex (returns 0-100)
function getOpacityFromHex(color: string): number {
  // Don't try to parse brand references
  if (isBrandColorReference(color)) return 100;

  const hex = color.replace(/^#/, "");
  if (hex.length === 8) {
    const alpha = parseInt(hex.slice(6, 8), 16);
    return Math.round((alpha / 255) * 100);
  }
  return 100;
}

// Add opacity to hex color
function addOpacityToHex(color: string, opacity: number): string {
  const hex = color.replace(/^#/, "").slice(0, 6);
  const alpha = Math.round((opacity / 100) * 255)
    .toString(16)
    .padStart(2, "0");
  return `#${hex}${alpha}`;
}

// Get base color without alpha
function getBaseColor(color: string): string {
  // Don't modify brand references
  if (isBrandColorReference(color)) return color;

  const hex = color.replace(/^#/, "");
  return `#${hex.slice(0, 6)}`;
}

// Brand color names for swatches
const BRAND_SWATCH_ORDER: BrandColorName[] = ["primary", "secondary", "accent", "background", "text"];

const BRAND_SWATCH_LABELS: Record<BrandColorName, string> = {
  primary: "Primary",
  secondary: "Secondary",
  accent: "Accent",
  background: "Background",
  text: "Text",
};

export function BrandingColorPicker({
  value,
  onChange,
  disabled = false,
  label,
  size = "md",
  includeOpacity = false,
  showPresets = true,
  customPresets = [],
}: BrandingColorPickerProps) {
  const id = useId();
  const { colors, colorPresets } = useBrandingWithDefaults();
  const config = sizeConfig[size];

  // Convert context colors to BrandColors type
  const brandColors: BrandColors = useMemo(
    () => ({
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.accent,
      background: colors.background,
      text: colors.text,
    }),
    [colors]
  );

  // Resolve the current value to a hex color for display
  const resolvedHex = useMemo(
    () => resolveColor(value, brandColors),
    [value, brandColors]
  );

  // Check if the current value is a brand reference
  const currentBrandRef = useMemo(
    () => getBrandColorName(value),
    [value]
  );

  // Local state for hex input (allows typing invalid values temporarily)
  const [hexInput, setHexInput] = useState(resolvedHex);
  const [opacity, setOpacity] = useState(getOpacityFromHex(resolvedHex));

  // Sync hex input with external value changes
  useEffect(() => {
    setHexInput(resolvedHex);
    setOpacity(getOpacityFromHex(resolvedHex));
  }, [resolvedHex]);

  // Combine custom presets with branding presets
  const allPresets = [...customPresets, ...colorPresets];

  // Handle native color picker change - always stores as hex (custom color)
  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    if (includeOpacity && opacity < 100) {
      onChange(addOpacityToHex(newColor, opacity));
    } else {
      onChange(newColor);
    }
  };

  // Handle hex input change - stores as hex
  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;

    // Auto-add # prefix if missing
    if (input && !input.startsWith("#") && !input.startsWith("brand:")) {
      input = `#${input}`;
    }

    setHexInput(input);

    // Only update parent if valid hex
    if (isValidHex(input)) {
      const normalized = normalizeHex(input);
      if (includeOpacity && opacity < 100) {
        onChange(addOpacityToHex(normalized, opacity));
      } else {
        onChange(normalized);
      }
    }
  };

  // Handle hex input blur - revert to last valid value if invalid
  const handleHexBlur = () => {
    if (!isValidHex(hexInput)) {
      setHexInput(resolvedHex);
    }
  };

  // Handle brand swatch click - stores as brand reference
  const handleBrandSwatchClick = (brandName: BrandColorName) => {
    if (disabled) return;

    // Store as brand reference (e.g., "brand:primary")
    const reference = createBrandColorReference(brandName);

    // Note: Brand references don't support opacity currently
    onChange(reference);
  };

  // Handle custom preset swatch click - stores as hex
  const handlePresetSwatchClick = (hexColor: string) => {
    if (disabled) return;

    if (includeOpacity && opacity < 100) {
      onChange(addOpacityToHex(hexColor, opacity));
    } else {
      onChange(hexColor);
    }
  };

  // Handle opacity slider change
  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOpacity = parseInt(e.target.value, 10);
    setOpacity(newOpacity);

    // If currently a brand reference, convert to hex when adding opacity
    const baseHex = isBrandColorReference(value)
      ? resolvedHex
      : getBaseColor(value);

    if (newOpacity < 100) {
      onChange(addOpacityToHex(baseHex, newOpacity));
    } else {
      // If at 100% opacity, check if we should restore brand reference
      // For simplicity, just use the hex value
      onChange(baseHex);
    }
  };

  // Check if a brand color is selected (by reference)
  const isBrandSelected = (brandName: BrandColorName): boolean => {
    return currentBrandRef === brandName;
  };

  // Check if a custom preset hex color matches the current value
  const isPresetSelected = (hexColor: string): boolean => {
    // Don't match if current value is a brand reference
    if (currentBrandRef) return false;

    const baseValue = getBaseColor(resolvedHex).toLowerCase();
    const basePreset = getBaseColor(hexColor).toLowerCase();
    return baseValue === basePreset;
  };

  // Brand color swatch component
  const BrandSwatch = ({
    brandName,
    swatchSize,
  }: {
    brandName: BrandColorName;
    swatchSize: string;
  }) => {
    const hexColor = brandColors[brandName];
    const selected = isBrandSelected(brandName);
    const displayLabel = BRAND_SWATCH_LABELS[brandName];

    return (
      <button
        type="button"
        onClick={() => handleBrandSwatchClick(brandName)}
        disabled={disabled}
        title={displayLabel}
        className={`
          ${swatchSize} rounded-md border-2 relative
          transition-all duration-150
          ${
            selected
              ? "border-blue-500 ring-2 ring-blue-200"
              : "border-gray-300 hover:border-gray-400"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
        `}
        style={{ backgroundColor: hexColor }}
      >
        {selected && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Check
              size={config.checkIcon}
              className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]"
            />
          </span>
        )}
      </button>
    );
  };

  // Custom preset swatch component
  const PresetSwatch = ({
    color,
    name,
    swatchSize,
  }: {
    color: string;
    name: string;
    swatchSize: string;
  }) => {
    const selected = isPresetSelected(color);

    return (
      <button
        type="button"
        onClick={() => handlePresetSwatchClick(color)}
        disabled={disabled}
        title={name}
        className={`
          ${swatchSize} rounded-md border-2 relative
          transition-all duration-150
          ${
            selected
              ? "border-blue-500 ring-2 ring-blue-200"
              : "border-gray-300 hover:border-gray-400"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
        `}
        style={{ backgroundColor: color }}
      >
        {selected && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Check
              size={config.checkIcon}
              className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]"
            />
          </span>
        )}
      </button>
    );
  };

  // Display text showing if this is a brand color
  const displayLabel = currentBrandRef
    ? `${BRAND_SWATCH_LABELS[currentBrandRef]} (${resolvedHex})`
    : null;

  return (
    <div className="space-y-3">
      {/* Label */}
      {label && (
        <label
          htmlFor={`${id}-color`}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}

      {/* Color picker and hex input row */}
      <div className="flex items-center gap-3">
        {/* Native color picker */}
        <div className="relative">
          <input
            type="color"
            id={`${id}-color`}
            value={getBaseColor(resolvedHex)}
            onChange={handlePickerChange}
            disabled={disabled}
            className={`
              ${config.picker} rounded-lg border border-gray-300 cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            style={{ padding: "2px" }}
          />
        </div>

        {/* Hex input or brand label */}
        <div className="flex-1 relative">
          {currentBrandRef ? (
            // Show brand color indicator
            <div
              className={`
                px-3 py-2 border border-gray-300 rounded-md ${config.input}
                text-gray-900 bg-gray-50 flex items-center gap-2
              `}
            >
              <span
                className="w-4 h-4 rounded-sm border border-gray-300 shrink-0"
                style={{ backgroundColor: resolvedHex }}
              />
              <span className="truncate">{BRAND_SWATCH_LABELS[currentBrandRef]}</span>
              <span className="text-gray-400 font-mono text-xs">{resolvedHex}</span>
            </div>
          ) : (
            // Show hex input for custom colors
            <input
              type="text"
              value={hexInput}
              onChange={handleHexInputChange}
              onBlur={handleHexBlur}
              disabled={disabled}
              placeholder="#000000"
              className={`
                w-full px-3 py-2 border rounded-md font-mono ${config.input}
                text-gray-900 bg-white
                ${
                  !isValidHex(hexInput)
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }
                focus:outline-none focus:ring-2
                disabled:bg-gray-50 disabled:cursor-not-allowed
              `}
            />
          )}
        </div>
      </div>

      {/* Opacity slider */}
      {includeOpacity && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-600">Opacity</label>
            <span className="text-xs text-gray-500">{opacity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={opacity}
            onChange={handleOpacityChange}
            disabled={disabled}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      )}

      {/* Brand color swatches */}
      {showPresets && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Brand Colors
          </p>
          <div className="flex flex-wrap gap-2">
            {BRAND_SWATCH_ORDER.map((brandName) => (
              <BrandSwatch
                key={brandName}
                brandName={brandName}
                swatchSize={config.swatch}
              />
            ))}
          </div>
        </div>
      )}

      {/* Custom presets */}
      {showPresets && allPresets.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Custom Colors
          </p>
          <div className="flex flex-wrap gap-2">
            {allPresets.map((preset, index) => (
              <PresetSwatch
                key={`${preset.name}-${index}`}
                color={preset.value}
                name={preset.name}
                swatchSize={config.swatch}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
