"use client";

/**
 * Button Group Block Editor Component
 *
 * Edit form for button group block with multiple CTA buttons.
 */

import { useState } from "react";
import type { Block, ButtonGroupBlock, BlockBackground, BlockAdvanced } from "@/types/blocks";
import { createDefaultBackground } from "@/types/blocks";
import { BlockBackgroundEditor } from "./block-background-editor";
import { BlockAdvancedEditor } from "./block-advanced-editor";

interface ButtonGroupBlockEditorProps {
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

export function ButtonGroupBlockEditor({
  block,
  onChange,
  disabled,
}: ButtonGroupBlockEditorProps) {
  const buttonGroupBlock = block as ButtonGroupBlock;
  const { data } = buttonGroupBlock;
  const [activeTab, setActiveTab] = useState<"content" | "background" | "advanced">("content");

  function updateData(updates: Partial<ButtonGroupBlock["data"]>) {
    onChange({
      ...buttonGroupBlock,
      data: { ...data, ...updates },
    });
  }

  function updateBackground(background: BlockBackground) {
    onChange({
      ...buttonGroupBlock,
      background,
    });
  }

  function updateAdvanced(advanced: BlockAdvanced) {
    onChange({
      ...buttonGroupBlock,
      advanced,
    });
  }

  function addButton() {
    updateData({
      buttons: [
        ...data.buttons,
        {
          id: generateButtonId(),
          text: "Button",
          url: "#",
          variant: "primary",
        },
      ],
    });
  }

  function updateButton(
    id: string,
    updates: Partial<ButtonGroupBlock["data"]["buttons"][0]>
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
          {/* Alignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alignment
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

          {/* Buttons */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Buttons
              </label>
              {!disabled && data.buttons.length < 4 && (
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
                        value={btn.text}
                        onChange={(e) =>
                          updateButton(btn.id, { text: e.target.value })
                        }
                        disabled={disabled}
                        placeholder="Button text"
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
                      {(["primary", "secondary", "outline"] as const).map((variant) => (
                        <button
                          key={variant}
                          type="button"
                          onClick={() => updateButton(btn.id, { variant })}
                          disabled={disabled}
                          className={`flex-1 px-2 py-1 text-xs rounded border transition-colors ${
                            btn.variant === variant
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          } disabled:opacity-50`}
                        >
                          {variant.charAt(0).toUpperCase() + variant.slice(1)}
                        </button>
                      ))}
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
          background={buttonGroupBlock.background || createDefaultBackground()}
          onChange={updateBackground}
          disabled={disabled}
        />
      )}

      {/* Advanced Tab */}
      {activeTab === "advanced" && (
        <BlockAdvancedEditor
          advanced={buttonGroupBlock.advanced || {}}
          onChange={updateAdvanced}
          disabled={disabled}
        />
      )}
    </div>
  );
}
