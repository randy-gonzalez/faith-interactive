"use client";

/**
 * Card Grid Block Editor Component
 *
 * Edit form for card grid block with card list management.
 */

import { useState } from "react";
import type { Block, CardGridBlock, BlockBackground, BlockAdvanced } from "@/types/blocks";
import { createDefaultBackground } from "@/types/blocks";
import { BlockBackgroundEditor } from "./block-background-editor";
import { BlockAdvancedEditor } from "./block-advanced-editor";
import { MediaPicker } from "@/components/dashboard/media-picker";

interface CardGridBlockEditorProps {
  block: Block;
  onChange: (block: Block) => void;
  disabled?: boolean;
}

const TABS = [
  { id: "content", label: "Content" },
  { id: "background", label: "Background" },
  { id: "advanced", label: "Advanced" },
] as const;

function generateCardId(): string {
  return `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function CardGridBlockEditor({
  block,
  onChange,
  disabled,
}: CardGridBlockEditorProps) {
  const cardGridBlock = block as CardGridBlock;
  const { data } = cardGridBlock;
  const [activeTab, setActiveTab] = useState<"content" | "background" | "advanced">("content");
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  function updateData(updates: Partial<CardGridBlock["data"]>) {
    onChange({
      ...cardGridBlock,
      data: { ...data, ...updates },
    });
  }

  function updateBackground(background: BlockBackground) {
    onChange({
      ...cardGridBlock,
      background,
    });
  }

  function updateAdvanced(advanced: BlockAdvanced) {
    onChange({
      ...cardGridBlock,
      advanced,
    });
  }

  function addCard() {
    const newCardId = generateCardId();
    updateData({
      cards: [
        ...data.cards,
        {
          id: newCardId,
          imageUrl: "",
          title: "New Card",
          description: "",
          linkUrl: "",
          linkText: "",
        },
      ],
    });
    setExpandedCardId(newCardId);
  }

  function updateCard(
    id: string,
    updates: Partial<CardGridBlock["data"]["cards"][0]>
  ) {
    updateData({
      cards: data.cards.map((card) =>
        card.id === id ? { ...card, ...updates } : card
      ),
    });
  }

  function removeCard(id: string) {
    updateData({
      cards: data.cards.filter((card) => card.id !== id),
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
          {/* Columns */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Columns
            </label>
            <div className="flex gap-1">
              {([2, 3, 4] as const).map((cols) => (
                <button
                  key={cols}
                  type="button"
                  onClick={() => updateData({ columns: cols })}
                  disabled={disabled}
                  className={`flex-1 px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    data.columns === cols
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  } disabled:opacity-50`}
                >
                  {cols}
                </button>
              ))}
            </div>
          </div>

          {/* Cards */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Cards ({data.cards.length})
              </label>
              {!disabled && (
                <button
                  type="button"
                  onClick={addCard}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add Card
                </button>
              )}
            </div>

            {data.cards.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No cards added</p>
            ) : (
              <div className="space-y-2">
                {data.cards.map((card, index) => (
                  <div
                    key={card.id}
                    className="border border-gray-200 rounded-md bg-gray-50"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedCardId(
                          expandedCardId === card.id ? null : card.id
                        )
                      }
                      className="w-full flex items-center justify-between p-3 text-left"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {card.title || `Card ${index + 1}`}
                      </span>
                      <div className="flex items-center gap-2">
                        {!disabled && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              removeCard(card.id);
                            }}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            Remove
                          </span>
                        )}
                        <svg
                          className={`w-4 h-4 text-gray-400 transition-transform ${
                            expandedCardId === card.id ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {expandedCardId === card.id && (
                      <div className="px-3 pb-3 space-y-3 border-t border-gray-200">
                        <div className="pt-2">
                          <MediaPicker
                            label="Card Image"
                            value={card.imageUrl || ""}
                            onChange={(url) =>
                              updateCard(card.id, { imageUrl: url || "" })
                            }
                            disabled={disabled}
                          />
                        </div>
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) =>
                            updateCard(card.id, { title: e.target.value })
                          }
                          disabled={disabled}
                          placeholder="Title"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                        <textarea
                          value={card.description || ""}
                          onChange={(e) =>
                            updateCard(card.id, { description: e.target.value })
                          }
                          disabled={disabled}
                          placeholder="Description"
                          rows={2}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={card.linkText || ""}
                            onChange={(e) =>
                              updateCard(card.id, { linkText: e.target.value })
                            }
                            disabled={disabled}
                            placeholder="Link text"
                            className="px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          />
                          <input
                            type="text"
                            value={card.linkUrl || ""}
                            onChange={(e) =>
                              updateCard(card.id, { linkUrl: e.target.value })
                            }
                            disabled={disabled}
                            placeholder="Link URL"
                            className="px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          />
                        </div>
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
          background={cardGridBlock.background || createDefaultBackground()}
          onChange={updateBackground}
          disabled={disabled}
        />
      )}

      {/* Advanced Tab */}
      {activeTab === "advanced" && (
        <BlockAdvancedEditor
          advanced={cardGridBlock.advanced || {}}
          onChange={updateAdvanced}
          disabled={disabled}
        />
      )}
    </div>
  );
}
