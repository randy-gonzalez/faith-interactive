/**
 * Custom HTML Block Editor
 *
 * Editor for the Custom HTML block type.
 * Provides a code editor for HTML input with live preview
 * and security warnings for potentially unsafe content.
 */

"use client";

import { useState, useMemo } from "react";
import type { Block, CustomHtmlBlock, BlockBackground, BlockAdvanced } from "@/types/blocks";
import { hasUnsafeContent, sanitizeHtml } from "@/lib/security/html-sanitizer";
import { BlockBackgroundEditor } from "./block-background-editor";
import { BlockAdvancedEditor } from "./block-advanced-editor";

interface CustomHtmlBlockEditorProps {
  block: Block;
  onChange: (block: Block) => void;
  disabled?: boolean;
}

type TabId = "code" | "preview" | "settings" | "background" | "advanced";

export function CustomHtmlBlockEditor({
  block,
  onChange,
  disabled,
}: CustomHtmlBlockEditorProps) {
  const htmlBlock = block as CustomHtmlBlock;
  const { data, background, advanced } = htmlBlock;
  const [activeTab, setActiveTab] = useState<TabId>("code");

  // Check for unsafe content
  const safetyCheck = useMemo(
    () => hasUnsafeContent(data.html),
    [data.html]
  );

  // Get sanitized preview
  const sanitizedHtml = useMemo(
    () => sanitizeHtml(data.html),
    [data.html]
  );

  function updateData(updates: Partial<CustomHtmlBlock["data"]>) {
    onChange({
      ...htmlBlock,
      data: { ...data, ...updates },
    });
  }

  function updateBackground(newBackground: BlockBackground | undefined) {
    onChange({
      ...htmlBlock,
      background: newBackground,
    });
  }

  function updateAdvanced(newAdvanced: BlockAdvanced | undefined) {
    onChange({
      ...htmlBlock,
      advanced: newAdvanced,
    });
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "code", label: "HTML Code" },
    { id: "preview", label: "Preview" },
    { id: "settings", label: "Settings" },
    { id: "background", label: "Background" },
    { id: "advanced", label: "Advanced" },
  ];

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Safety Warning */}
      {!safetyCheck.safe && activeTab === "code" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-yellow-800">
                Content will be sanitized
              </h4>
              <ul className="mt-1 text-sm text-yellow-700 list-disc list-inside">
                {safetyCheck.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "code" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              HTML Content
            </label>
            <textarea
              value={data.html}
              onChange={(e) => updateData({ html: e.target.value })}
              disabled={disabled}
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="<div class='my-custom-content'>
  <h2>Your HTML here</h2>
  <p>Enter any HTML content...</p>
</div>"
            />
            <p className="mt-2 text-sm text-gray-500">
              HTML is automatically sanitized for security. Scripts, event handlers,
              and potentially dangerous content will be removed.
            </p>
          </div>
        </div>
      )}

      {activeTab === "preview" && (
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Sanitized Preview
            </h4>
            {sanitizedHtml ? (
              <div
                className="prose prose-sm max-w-none bg-white border border-gray-100 rounded p-4"
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
              />
            ) : (
              <p className="text-gray-500 italic">No content to preview</p>
            )}
          </div>
          {data.html !== sanitizedHtml && (
            <div className="text-sm text-yellow-600">
              Note: Some content was removed during sanitization for security.
            </div>
          )}
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-6">
          {/* Max Width */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Width
            </label>
            <select
              value={data.maxWidth}
              onChange={(e) =>
                updateData({
                  maxWidth: e.target.value as "narrow" | "medium" | "full",
                })
              }
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="narrow">Narrow (max-w-2xl)</option>
              <option value="medium">Medium (max-w-4xl)</option>
              <option value="full">Full Width</option>
            </select>
          </div>

          {/* Alignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alignment
            </label>
            <div className="flex gap-2">
              {(["left", "center", "right"] as const).map((align) => (
                <button
                  key={align}
                  type="button"
                  onClick={() => updateData({ alignment: align })}
                  disabled={disabled}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    data.alignment === align
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {align.charAt(0).toUpperCase() + align.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Padding */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Padding Top
              </label>
              <select
                value={data.paddingTop}
                onChange={(e) =>
                  updateData({
                    paddingTop: e.target.value as "none" | "small" | "medium" | "large",
                  })
                }
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="none">None</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Padding Bottom
              </label>
              <select
                value={data.paddingBottom}
                onChange={(e) =>
                  updateData({
                    paddingBottom: e.target.value as "none" | "small" | "medium" | "large",
                  })
                }
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="none">None</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {activeTab === "background" && (
        <BlockBackgroundEditor
          background={background || { type: "color" }}
          onChange={updateBackground}
          disabled={disabled}
        />
      )}

      {activeTab === "advanced" && (
        <BlockAdvancedEditor
          advanced={advanced || {}}
          onChange={updateAdvanced}
          disabled={disabled}
        />
      )}
    </div>
  );
}
