"use client";

/**
 * Divider Block Editor Component
 *
 * Edit form for divider block with style and height options.
 */

import { useState } from "react";
import type { Block, DividerBlock, BlockAdvanced } from "@/types/blocks";
import { BlockAdvancedEditor } from "./block-advanced-editor";

interface DividerBlockEditorProps {
  block: Block;
  onChange: (block: Block) => void;
  disabled?: boolean;
}

const TABS = [
  { id: "content", label: "Content" },
  { id: "advanced", label: "Advanced" },
] as const;

export function DividerBlockEditor({
  block,
  onChange,
  disabled,
}: DividerBlockEditorProps) {
  const dividerBlock = block as DividerBlock;
  const { data } = dividerBlock;
  const [activeTab, setActiveTab] = useState<"content" | "advanced">("content");

  function updateData(updates: Partial<DividerBlock["data"]>) {
    onChange({
      ...dividerBlock,
      data: { ...data, ...updates },
    });
  }

  function updateAdvanced(advanced: BlockAdvanced) {
    onChange({
      ...dividerBlock,
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
          {/* Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Style
            </label>
            <div className="flex gap-1">
              {(["line", "space", "dots"] as const).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => updateData({ style })}
                  disabled={disabled}
                  className={`flex-1 px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    data.style === style
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  } disabled:opacity-50`}
                >
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height
            </label>
            <div className="flex gap-1">
              {(["small", "medium", "large"] as const).map((height) => (
                <button
                  key={height}
                  type="button"
                  onClick={() => updateData({ height })}
                  disabled={disabled}
                  className={`flex-1 px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    data.height === height
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  } disabled:opacity-50`}
                >
                  {height.charAt(0).toUpperCase() + height.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Advanced Tab */}
      {activeTab === "advanced" && (
        <BlockAdvancedEditor
          advanced={dividerBlock.advanced || {}}
          onChange={updateAdvanced}
          disabled={disabled}
        />
      )}
    </div>
  );
}
