"use client";

/**
 * Sermon Feature Block Editor Component
 *
 * Edit form for sermon feature block that displays sermons from the library.
 */

import { useState } from "react";
import type { Block, SermonFeatureBlock, BlockBackground, BlockAdvanced } from "@/types/blocks";
import { createDefaultBackground } from "@/types/blocks";
import { BlockBackgroundEditor } from "./block-background-editor";
import { BlockAdvancedEditor } from "./block-advanced-editor";

interface SermonFeatureBlockEditorProps {
  block: Block;
  onChange: (block: Block) => void;
  disabled?: boolean;
}

const TABS = [
  { id: "content", label: "Content" },
  { id: "background", label: "Background" },
  { id: "advanced", label: "Advanced" },
] as const;

export function SermonFeatureBlockEditor({
  block,
  onChange,
  disabled,
}: SermonFeatureBlockEditorProps) {
  const sermonFeatureBlock = block as SermonFeatureBlock;
  const { data } = sermonFeatureBlock;
  const [activeTab, setActiveTab] = useState<"content" | "background" | "advanced">("content");

  function updateData(updates: Partial<SermonFeatureBlock["data"]>) {
    onChange({
      ...sermonFeatureBlock,
      data: { ...data, ...updates },
    });
  }

  function updateBackground(background: BlockBackground) {
    onChange({
      ...sermonFeatureBlock,
      background,
    });
  }

  function updateAdvanced(advanced: BlockAdvanced) {
    onChange({
      ...sermonFeatureBlock,
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
          {/* Heading */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Heading
            </label>
            <input
              type="text"
              value={data.heading}
              onChange={(e) => updateData({ heading: e.target.value })}
              disabled={disabled}
              placeholder="Recent Sermons"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Display Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Mode
            </label>
            <div className="flex gap-1">
              {(["latest", "featured"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => updateData({ displayMode: mode })}
                  disabled={disabled}
                  className={`flex-1 px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    data.displayMode === mode
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  } disabled:opacity-50`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Sermons
            </label>
            <select
              value={data.count}
              onChange={(e) => updateData({ count: parseInt(e.target.value) })}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {/* Show Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={data.showDescription}
                onChange={(e) => updateData({ showDescription: e.target.checked })}
                disabled={disabled}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Show sermon descriptions
            </label>
          </div>

          {/* Button */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Text
              </label>
              <input
                type="text"
                value={data.buttonText}
                onChange={(e) => updateData({ buttonText: e.target.value })}
                disabled={disabled}
                placeholder="View All Sermons"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button URL
              </label>
              <input
                type="text"
                value={data.buttonUrl}
                onChange={(e) => updateData({ buttonUrl: e.target.value })}
                disabled={disabled}
                placeholder="/sermons"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>
      )}

      {/* Background Tab */}
      {activeTab === "background" && (
        <BlockBackgroundEditor
          background={sermonFeatureBlock.background || createDefaultBackground()}
          onChange={updateBackground}
          disabled={disabled}
        />
      )}

      {/* Advanced Tab */}
      {activeTab === "advanced" && (
        <BlockAdvancedEditor
          advanced={sermonFeatureBlock.advanced || {}}
          onChange={updateAdvanced}
          disabled={disabled}
        />
      )}
    </div>
  );
}
