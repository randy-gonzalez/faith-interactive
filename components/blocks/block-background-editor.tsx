"use client";

/**
 * Block Background Editor Component
 *
 * Shared background editor for all block types.
 * Supports: Color, Gradient, Image, Video
 */

import { useState } from "react";
import type { BlockBackground } from "@/types/blocks";
import { MediaPicker } from "@/components/dashboard/media-picker";
import { BrandingColorPicker } from "@/components/ui/branding-color-picker";

interface BlockBackgroundEditorProps {
  background: BlockBackground;
  onChange: (background: BlockBackground) => void;
  disabled?: boolean;
}

const BACKGROUND_TYPES = [
  { id: "color", label: "Color" },
  { id: "gradient", label: "Gradient" },
  { id: "image", label: "Image" },
  { id: "video", label: "Video" },
] as const;

// Preset gradients for quick selection
const PRESET_GRADIENTS = [
  { name: "Ocean", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "Sunset", value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { name: "Forest", value: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" },
  { name: "Midnight", value: "linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 100%)" },
  { name: "Sky", value: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)" },
  { name: "Warm", value: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)" },
];

export function BlockBackgroundEditor({
  background,
  onChange,
  disabled,
}: BlockBackgroundEditorProps) {
  const [customGradient, setCustomGradient] = useState(
    background.type === "gradient" ? background.gradient || "" : ""
  );

  function updateBackground(updates: Partial<BlockBackground>) {
    onChange({ ...background, ...updates });
  }

  function handleTypeChange(type: BlockBackground["type"]) {
    // Preserve existing values when switching types
    const newBackground: BlockBackground = { ...background, type };

    // Set defaults if switching to a type without a value
    if (type === "color" && !newBackground.color) {
      newBackground.color = "#1e40af";
    }
    if (type === "gradient" && !newBackground.gradient) {
      newBackground.gradient = PRESET_GRADIENTS[0].value;
    }

    onChange(newBackground);
  }

  function handleGradientPaste(value: string) {
    setCustomGradient(value);
    // Validate it looks like a gradient
    if (
      value.includes("gradient") ||
      value.includes("linear-") ||
      value.includes("radial-")
    ) {
      updateBackground({ gradient: value });
    }
  }

  return (
    <div className="space-y-4">
      {/* Background Type Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Background Type
        </label>
        <div className="flex flex-wrap gap-2">
          {BACKGROUND_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => handleTypeChange(type.id)}
              disabled={disabled}
              className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                background.type === type.id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              } disabled:opacity-50`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color Options */}
      {background.type === "color" && (
        <BrandingColorPicker
          value={background.color || "#1e40af"}
          onChange={(color) => updateBackground({ color })}
          disabled={disabled}
          label="Background Color"
        />
      )}

      {/* Gradient Options */}
      {background.type === "gradient" && (
        <div className="space-y-4">
          {/* Preset Gradients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preset Gradients
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_GRADIENTS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    updateBackground({ gradient: preset.value });
                    setCustomGradient(preset.value);
                  }}
                  disabled={disabled}
                  className={`h-12 rounded-lg border-2 transition-all ${
                    background.gradient === preset.value
                      ? "border-blue-500 ring-2 ring-blue-500"
                      : "border-transparent hover:border-gray-300"
                  } disabled:opacity-50`}
                  style={{ background: preset.value }}
                  title={preset.name}
                />
              ))}
            </div>
          </div>

          {/* Custom Gradient Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Gradient (paste CSS)
            </label>
            <input
              type="text"
              value={customGradient}
              onChange={(e) => handleGradientPaste(e.target.value)}
              disabled={disabled}
              placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            {/* Preview */}
            {background.gradient && (
              <div
                className="mt-2 h-16 rounded-lg border border-gray-200"
                style={{ background: background.gradient }}
              />
            )}
          </div>
        </div>
      )}

      {/* Image Options */}
      {background.type === "image" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Background Image
          </label>
          <MediaPicker
            value={background.imageUrl || null}
            onChange={(url) => updateBackground({ imageUrl: url || undefined })}
            disabled={disabled}
            placeholder="Select background image"
          />
          {background.imageUrl && (
            <div
              className="mt-3 h-32 rounded-lg border border-gray-200 bg-cover bg-center"
              style={{ backgroundImage: `url(${background.imageUrl})` }}
            />
          )}
        </div>
      )}

      {/* Video Options */}
      {background.type === "video" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Background Video
          </label>
          <MediaPicker
            value={background.videoUrl || null}
            onChange={(url) => updateBackground({ videoUrl: url || undefined })}
            disabled={disabled}
            placeholder="Select background video"
          />
          <p className="mt-2 text-xs text-gray-500">
            Select an MP4 video from the media library. Video will autoplay muted and loop.
          </p>
        </div>
      )}

      {/* Overlay (for image and video) */}
      {(background.type === "image" || background.type === "video") && (
        <div className="space-y-2">
          <BrandingColorPicker
            value={background.overlay || "#00000080"}
            onChange={(color) => updateBackground({ overlay: color || undefined })}
            disabled={disabled}
            label="Overlay Color (optional)"
            includeOpacity
          />
          {background.overlay && (
            <button
              type="button"
              onClick={() => updateBackground({ overlay: undefined })}
              disabled={disabled}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear overlay
            </button>
          )}
        </div>
      )}
    </div>
  );
}
