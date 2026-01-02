"use client";

/**
 * Text Block Editor Component
 *
 * Edit form for text block with alignment and max width options.
 */

import { useState } from "react";
import type { Block, TextBlock, BlockBackground, BlockAdvanced } from "@/types/blocks";
import { createDefaultBackground } from "@/types/blocks";
import { BlockBackgroundEditor } from "./block-background-editor";
import { BlockAdvancedEditor } from "./block-advanced-editor";

interface TextBlockEditorProps {
  block: Block;
  onChange: (block: Block) => void;
  disabled?: boolean;
}

const TABS = [
  { id: "content", label: "Content" },
  { id: "background", label: "Background" },
  { id: "advanced", label: "Advanced" },
] as const;

export function TextBlockEditor({
  block,
  onChange,
  disabled,
}: TextBlockEditorProps) {
  const textBlock = block as TextBlock;
  const { data } = textBlock;
  const [activeTab, setActiveTab] = useState<"content" | "background" | "advanced">("content");

  function updateData(updates: Partial<TextBlock["data"]>) {
    onChange({
      ...textBlock,
      data: { ...data, ...updates },
    });
  }

  function updateBackground(background: BlockBackground) {
    onChange({
      ...textBlock,
      background,
    });
  }

  function updateAdvanced(advanced: BlockAdvanced) {
    onChange({
      ...textBlock,
      advanced,
    });
  }

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4" aria-label="Block editor tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Tab */}
      {activeTab === "content" && (
        <div className="space-y-4">
          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              value={data.content}
              onChange={(e) => updateData({ content: e.target.value })}
              disabled={disabled}
              placeholder="Enter your text content..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supports basic HTML formatting
            </p>
          </div>

          {/* Alignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Text Alignment
            </label>
            <div className="flex gap-1">
              {(["left", "center", "right"] as const).map((align) => (
                <button
                  key={align}
                  type="button"
                  onClick={() => updateData({ alignment: align })}
                  disabled={disabled}
                  className={`flex-1 px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    data.alignment === align
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  } disabled:opacity-50`}
                >
                  {align.charAt(0).toUpperCase() + align.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Max Width */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content Width
            </label>
            <div className="flex gap-1">
              {(["narrow", "medium", "full"] as const).map((width) => (
                <button
                  key={width}
                  type="button"
                  onClick={() => updateData({ maxWidth: width })}
                  disabled={disabled}
                  className={`flex-1 px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    data.maxWidth === width
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  } disabled:opacity-50`}
                >
                  {width.charAt(0).toUpperCase() + width.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Background Tab */}
      {activeTab === "background" && (
        <BlockBackgroundEditor
          background={textBlock.background || createDefaultBackground()}
          onChange={updateBackground}
          disabled={disabled}
        />
      )}

      {/* Advanced Tab */}
      {activeTab === "advanced" && (
        <BlockAdvancedEditor
          advanced={textBlock.advanced || {}}
          onChange={updateAdvanced}
          disabled={disabled}
        />
      )}
    </div>
  );
}
