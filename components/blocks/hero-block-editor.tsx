"use client";

/**
 * Hero Block Editor Component
 *
 * Edit form for hero block with tabbed interface:
 * - Content tab: Heading, subheading, alignment, CTA buttons
 * - Background tab: Shared background editor (color/gradient/image/video)
 */

import { useState } from "react";
import type { Block, HeroBlock, BlockBackground, BlockAdvanced } from "@/types/blocks";
import { createDefaultBackground } from "@/types/blocks";
import { BlockBackgroundEditor } from "./block-background-editor";
import { BlockAdvancedEditor } from "./block-advanced-editor";

interface HeroBlockEditorProps {
  block: Block;
  onChange: (block: Block) => void;
  disabled?: boolean;
}

const TABS = [
  { id: "content", label: "Content" },
  { id: "background", label: "Background" },
  { id: "advanced", label: "Advanced" },
] as const;

function generateButtonId(): string {
  return `btn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function HeroBlockEditor({
  block,
  onChange,
  disabled,
}: HeroBlockEditorProps) {
  const heroBlock = block as HeroBlock;
  const { data } = heroBlock;
  const [activeTab, setActiveTab] = useState<"content" | "background" | "advanced">(
    "content"
  );

  function updateData(updates: Partial<HeroBlock["data"]>) {
    onChange({
      ...heroBlock,
      data: { ...data, ...updates },
    });
  }

  function updateBackground(background: BlockBackground) {
    onChange({
      ...heroBlock,
      background,
    });
  }

  function updateAdvanced(advanced: BlockAdvanced) {
    onChange({
      ...heroBlock,
      advanced,
    });
  }

  function addButton() {
    updateData({
      buttons: [
        ...data.buttons,
        {
          id: generateButtonId(),
          label: "Button",
          url: "#",
          variant: "primary",
        },
      ],
    });
  }

  function updateButton(
    id: string,
    updates: Partial<HeroBlock["data"]["buttons"][0]>
  ) {
    updateData({
      buttons: data.buttons.map((btn) =>
        btn.id === id ? { ...btn, ...updates } : btn
      ),
    });
  }

  function removeButton(id: string) {
    updateData({
      buttons: data.buttons.filter((btn) => btn.id !== id),
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
              placeholder="Enter heading text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Subheading */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subheading (optional)
            </label>
            <input
              type="text"
              value={data.subheading || ""}
              onChange={(e) => updateData({ subheading: e.target.value })}
              disabled={disabled}
              placeholder="Enter subheading text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Alignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content Alignment
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

          {/* CTA Buttons */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Call-to-Action Buttons
              </label>
              {!disabled && data.buttons.length < 3 && (
                <button
                  type="button"
                  onClick={addButton}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add Button
                </button>
              )}
            </div>

            {data.buttons.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No buttons added</p>
            ) : (
              <div className="space-y-3">
                {data.buttons.map((btn, index) => (
                  <div
                    key={btn.id}
                    className="p-3 border border-gray-200 rounded-md bg-gray-50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">
                        Button {index + 1}
                      </span>
                      {!disabled && (
                        <button
                          type="button"
                          onClick={() => removeButton(btn.id)}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={btn.label}
                        onChange={(e) =>
                          updateButton(btn.id, { label: e.target.value })
                        }
                        disabled={disabled}
                        placeholder="Button label"
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                      <input
                        type="text"
                        value={btn.url}
                        onChange={(e) =>
                          updateButton(btn.id, { url: e.target.value })
                        }
                        disabled={disabled}
                        placeholder="URL"
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>

                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateButton(btn.id, { variant: "primary" })
                        }
                        disabled={disabled}
                        className={`flex-1 px-2 py-1 text-xs rounded border transition-colors ${
                          btn.variant === "primary"
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        } disabled:opacity-50`}
                      >
                        Primary
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateButton(btn.id, { variant: "secondary" })
                        }
                        disabled={disabled}
                        className={`flex-1 px-2 py-1 text-xs rounded border transition-colors ${
                          btn.variant === "secondary"
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        } disabled:opacity-50`}
                      >
                        Secondary
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Background Tab */}
      {activeTab === "background" && (
        <BlockBackgroundEditor
          background={heroBlock.background || createDefaultBackground()}
          onChange={updateBackground}
          disabled={disabled}
        />
      )}

      {/* Advanced Tab */}
      {activeTab === "advanced" && (
        <BlockAdvancedEditor
          advanced={heroBlock.advanced || {}}
          onChange={updateAdvanced}
          disabled={disabled}
        />
      )}
    </div>
  );
}
