"use client";

/**
 * Block Advanced Editor Component
 *
 * Shared editor for advanced block settings:
 * - Custom CSS classes
 * - Element ID
 * - Aria label
 * - Data attributes
 */

import type { BlockAdvanced } from "@/types/blocks";

interface BlockAdvancedEditorProps {
  advanced: BlockAdvanced;
  onChange: (advanced: BlockAdvanced) => void;
  disabled?: boolean;
}

// Validate HTML ID (must start with letter, followed by letters, digits, hyphens, underscores)
function isValidHtmlId(id: string): boolean {
  if (!id) return true; // Empty is valid
  return /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(id);
}

export function BlockAdvancedEditor({
  advanced,
  onChange,
  disabled,
}: BlockAdvancedEditorProps) {
  const elementIdError = advanced.elementId && !isValidHtmlId(advanced.elementId)
    ? "ID must start with a letter and contain only letters, numbers, hyphens, and underscores"
    : null;

  return (
    <div className="space-y-4">
      {/* CSS Classes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          CSS Classes
        </label>
        <input
          type="text"
          value={advanced.cssClasses || ""}
          onChange={(e) => onChange({ ...advanced, cssClasses: e.target.value })}
          disabled={disabled}
          placeholder="my-class another-class"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        <p className="text-xs text-gray-500 mt-1">
          Space-separated list of CSS class names
        </p>
      </div>

      {/* Element ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Element ID
        </label>
        <input
          type="text"
          value={advanced.elementId || ""}
          onChange={(e) => onChange({ ...advanced, elementId: e.target.value })}
          disabled={disabled}
          placeholder="my-section"
          className={`w-full px-3 py-2 border rounded-md text-gray-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
            elementIdError ? "border-red-300" : "border-gray-300"
          }`}
        />
        {elementIdError ? (
          <p className="text-xs text-red-600 mt-1">{elementIdError}</p>
        ) : (
          <p className="text-xs text-gray-500 mt-1">
            Unique identifier for anchor links (e.g., #my-section)
          </p>
        )}
      </div>

      {/* Aria Label */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Aria Label
        </label>
        <input
          type="text"
          value={advanced.ariaLabel || ""}
          onChange={(e) => onChange({ ...advanced, ariaLabel: e.target.value })}
          disabled={disabled}
          placeholder="Descriptive label for screen readers"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        <p className="text-xs text-gray-500 mt-1">
          Accessibility label for screen readers
        </p>
      </div>

      {/* Data Attributes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Data Attributes
        </label>
        <textarea
          value={advanced.dataAttributes || ""}
          onChange={(e) => onChange({ ...advanced, dataAttributes: e.target.value })}
          disabled={disabled}
          placeholder="analytics-id=hero-section&#10;tracking=enabled"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        <p className="text-xs text-gray-500 mt-1">
          One per line, format: key=value (becomes data-key="value")
        </p>
      </div>
    </div>
  );
}

/**
 * Helper function to parse data attributes string into object
 */
export function parseDataAttributes(dataAttributes?: string): Record<string, string> {
  if (!dataAttributes) return {};

  const result: Record<string, string> = {};
  const lines = dataAttributes.split("\n").filter(line => line.trim());

  for (const line of lines) {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      const cleanKey = key.trim().replace(/^data-/, "");
      result[`data-${cleanKey}`] = valueParts.join("=").trim();
    }
  }

  return result;
}

/**
 * Helper function to get advanced props for rendering
 */
export function getAdvancedProps(advanced?: BlockAdvanced): {
  className?: string;
  id?: string;
  "aria-label"?: string;
} & Record<string, string> {
  if (!advanced) return {};

  const props: Record<string, string> = {};

  if (advanced.cssClasses) {
    props.className = advanced.cssClasses;
  }

  if (advanced.elementId && isValidHtmlId(advanced.elementId)) {
    props.id = advanced.elementId;
  }

  if (advanced.ariaLabel) {
    props["aria-label"] = advanced.ariaLabel;
  }

  return {
    ...props,
    ...parseDataAttributes(advanced.dataAttributes),
  };
}
