"use client";

/**
 * Accordion Block Editor Component
 *
 * Edit form for accordion block with FAQ item management.
 */

import { useState } from "react";
import type { Block, AccordionBlock, BlockBackground, BlockAdvanced } from "@/types/blocks";
import { createDefaultBackground } from "@/types/blocks";
import { BlockBackgroundEditor } from "./block-background-editor";
import { BlockAdvancedEditor } from "./block-advanced-editor";

interface AccordionBlockEditorProps {
  block: Block;
  onChange: (block: Block) => void;
  disabled?: boolean;
}

const TABS = [
  { id: "content", label: "Content" },
  { id: "background", label: "Background" },
  { id: "advanced", label: "Advanced" },
] as const;

function generateItemId(): string {
  return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function AccordionBlockEditor({
  block,
  onChange,
  disabled,
}: AccordionBlockEditorProps) {
  const accordionBlock = block as AccordionBlock;
  const { data } = accordionBlock;
  const [activeTab, setActiveTab] = useState<"content" | "background" | "advanced">("content");
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  function updateData(updates: Partial<AccordionBlock["data"]>) {
    onChange({
      ...accordionBlock,
      data: { ...data, ...updates },
    });
  }

  function updateBackground(background: BlockBackground) {
    onChange({
      ...accordionBlock,
      background,
    });
  }

  function updateAdvanced(advanced: BlockAdvanced) {
    onChange({
      ...accordionBlock,
      advanced,
    });
  }

  function addItem() {
    const newItemId = generateItemId();
    updateData({
      items: [
        ...data.items,
        {
          id: newItemId,
          title: "New Question",
          content: "",
          defaultOpen: false,
        },
      ],
    });
    setExpandedItemId(newItemId);
  }

  function updateItem(
    id: string,
    updates: Partial<AccordionBlock["data"]["items"][0]>
  ) {
    updateData({
      items: data.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  }

  function removeItem(id: string) {
    updateData({
      items: data.items.filter((item) => item.id !== id),
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
              Heading (optional)
            </label>
            <input
              type="text"
              value={data.heading || ""}
              onChange={(e) => updateData({ heading: e.target.value })}
              disabled={disabled}
              placeholder="Frequently Asked Questions"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Items ({data.items.length})
              </label>
              {!disabled && (
                <button
                  type="button"
                  onClick={addItem}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add Item
                </button>
              )}
            </div>

            {data.items.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No items added</p>
            ) : (
              <div className="space-y-2">
                {data.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-md bg-gray-50"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedItemId(
                          expandedItemId === item.id ? null : item.id
                        )
                      }
                      className="w-full flex items-center justify-between p-3 text-left"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {item.title || `Item ${index + 1}`}
                      </span>
                      <div className="flex items-center gap-2">
                        {!disabled && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              removeItem(item.id);
                            }}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            Remove
                          </span>
                        )}
                        <svg
                          className={`w-4 h-4 text-gray-400 transition-transform ${
                            expandedItemId === item.id ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {expandedItemId === item.id && (
                      <div className="px-3 pb-3 space-y-2 border-t border-gray-200">
                        <div className="pt-2">
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) =>
                              updateItem(item.id, { title: e.target.value })
                            }
                            disabled={disabled}
                            placeholder="Question or title"
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                        <textarea
                          value={item.content}
                          onChange={(e) =>
                            updateItem(item.id, { content: e.target.value })
                          }
                          disabled={disabled}
                          placeholder="Answer or content..."
                          rows={3}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={item.defaultOpen}
                            onChange={(e) =>
                              updateItem(item.id, { defaultOpen: e.target.checked })
                            }
                            disabled={disabled}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          Open by default
                        </label>
                      </div>
                    )}
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
          background={accordionBlock.background || createDefaultBackground()}
          onChange={updateBackground}
          disabled={disabled}
        />
      )}

      {/* Advanced Tab */}
      {activeTab === "advanced" && (
        <BlockAdvancedEditor
          advanced={accordionBlock.advanced || {}}
          onChange={updateAdvanced}
          disabled={disabled}
        />
      )}
    </div>
  );
}
