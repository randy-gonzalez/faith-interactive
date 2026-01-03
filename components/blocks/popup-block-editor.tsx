/**
 * Popup Block Editor
 *
 * Editor for the Popup block type.
 * Configures popup content, trigger conditions, display rules, and styling.
 */

"use client";

import { useState } from "react";
import { createId } from "@paralleldrive/cuid2";
import type { Block, PopupBlock, BlockBackground, BlockAdvanced } from "@/types/blocks";
import { BlockBackgroundEditor } from "./block-background-editor";
import { BlockAdvancedEditor } from "./block-advanced-editor";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MediaPicker } from "@/components/dashboard/media-picker";

interface PopupBlockEditorProps {
  block: Block;
  onChange: (block: Block) => void;
  disabled?: boolean;
}

type TabId = "content" | "trigger" | "display" | "style" | "background" | "advanced";

export function PopupBlockEditor({
  block,
  onChange,
  disabled,
}: PopupBlockEditorProps) {
  const popupBlock = block as PopupBlock;
  const { data, background, advanced } = popupBlock;
  const [activeTab, setActiveTab] = useState<TabId>("content");

  function updateData(updates: Partial<PopupBlock["data"]>) {
    onChange({
      ...popupBlock,
      data: { ...data, ...updates },
    });
  }

  function updateTrigger(updates: Partial<PopupBlock["data"]["trigger"]>) {
    onChange({
      ...popupBlock,
      data: { ...data, trigger: { ...data.trigger, ...updates } },
    });
  }

  function updateDisplay(updates: Partial<PopupBlock["data"]["display"]>) {
    onChange({
      ...popupBlock,
      data: { ...data, display: { ...data.display, ...updates } },
    });
  }

  function updateBackground(newBackground: BlockBackground | undefined) {
    onChange({
      ...popupBlock,
      background: newBackground,
    });
  }

  function updateAdvanced(newAdvanced: BlockAdvanced | undefined) {
    onChange({
      ...popupBlock,
      advanced: newAdvanced,
    });
  }

  function addButton() {
    updateData({
      buttons: [
        ...data.buttons,
        {
          id: createId(),
          label: "Button",
          action: "close",
          variant: "primary",
        },
      ],
    });
  }

  function updateButton(
    index: number,
    updates: Partial<PopupBlock["data"]["buttons"][0]>
  ) {
    const newButtons = [...data.buttons];
    newButtons[index] = { ...newButtons[index], ...updates };
    updateData({ buttons: newButtons });
  }

  function removeButton(index: number) {
    updateData({
      buttons: data.buttons.filter((_, i) => i !== index),
    });
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "content", label: "Content" },
    { id: "trigger", label: "Trigger" },
    { id: "display", label: "Display Rules" },
    { id: "style", label: "Style" },
    { id: "background", label: "Background" },
    { id: "advanced", label: "Advanced" },
  ];

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="-mb-px flex space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
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

      {/* Content Tab */}
      {activeTab === "content" && (
        <div className="space-y-6">
          <Input
            label="Heading (optional)"
            value={data.heading || ""}
            onChange={(e) => updateData({ heading: e.target.value })}
            disabled={disabled}
            placeholder="e.g., Welcome!"
          />

          <Textarea
            label="Content"
            value={data.content}
            onChange={(e) => updateData({ content: e.target.value })}
            disabled={disabled}
            rows={5}
            placeholder="Enter popup content (HTML supported)"
          />

          <MediaPicker
            label="Image (optional)"
            value={data.imageUrl || ""}
            onChange={(url) => updateData({ imageUrl: url || "" })}
            disabled={disabled}
          />

          {/* Buttons */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Buttons
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addButton}
                disabled={disabled}
              >
                + Add Button
              </Button>
            </div>

            {data.buttons.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No buttons added</p>
            ) : (
              <div className="space-y-3">
                {data.buttons.map((button, index) => (
                  <div
                    key={button.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Button {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeButton(index)}
                        disabled={disabled}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Label"
                        value={button.label}
                        onChange={(e) =>
                          updateButton(index, { label: e.target.value })
                        }
                        disabled={disabled}
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Action
                        </label>
                        <select
                          value={button.action}
                          onChange={(e) =>
                            updateButton(index, {
                              action: e.target.value as "close" | "link",
                            })
                          }
                          disabled={disabled}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="close">Close Popup</option>
                          <option value="link">Go to Link</option>
                        </select>
                      </div>
                    </div>

                    {button.action === "link" && (
                      <Input
                        label="URL"
                        value={button.url || ""}
                        onChange={(e) =>
                          updateButton(index, { url: e.target.value })
                        }
                        disabled={disabled}
                        placeholder="https://..."
                      />
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Style
                      </label>
                      <div className="flex gap-2">
                        {(["primary", "secondary"] as const).map((variant) => (
                          <button
                            key={variant}
                            type="button"
                            onClick={() => updateButton(index, { variant })}
                            disabled={disabled}
                            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                              button.variant === variant
                                ? "bg-blue-50 border-blue-500 text-blue-700"
                                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {variant.charAt(0).toUpperCase() + variant.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trigger Tab */}
      {activeTab === "trigger" && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trigger Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { value: "time-delay", label: "Time Delay", desc: "Show after X seconds" },
                  { value: "scroll", label: "Scroll", desc: "Show after scrolling X%" },
                  { value: "exit-intent", label: "Exit Intent", desc: "Show when leaving page" },
                  { value: "button-click", label: "Button Click", desc: "Manual trigger" },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateTrigger({ type: option.value })}
                  disabled={disabled}
                  className={`p-4 text-left rounded-lg border transition-colors ${
                    data.trigger.type === option.value
                      ? "bg-blue-50 border-blue-500"
                      : "bg-white border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-500">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Delay Options */}
          {data.trigger.type === "time-delay" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delay (milliseconds)
              </label>
              <input
                type="number"
                value={data.trigger.delayMs || 5000}
                onChange={(e) =>
                  updateTrigger({ delayMs: parseInt(e.target.value) || 5000 })
                }
                disabled={disabled}
                min={1000}
                step={1000}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <p className="mt-1 text-sm text-gray-500">
                1000ms = 1 second. Recommended: 3000-10000ms
              </p>
            </div>
          )}

          {/* Scroll Options */}
          {data.trigger.type === "scroll" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scroll Percentage
              </label>
              <input
                type="range"
                value={data.trigger.scrollPercentage || 50}
                onChange={(e) =>
                  updateTrigger({ scrollPercentage: parseInt(e.target.value) })
                }
                disabled={disabled}
                min={10}
                max={100}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>10%</span>
                <span className="font-medium">{data.trigger.scrollPercentage || 50}%</span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* Button Click Options */}
          {data.trigger.type === "button-click" && (
            <Input
              label="Button Text (displayed on page)"
              value={data.trigger.buttonText || ""}
              onChange={(e) => updateTrigger({ buttonText: e.target.value })}
              disabled={disabled}
              placeholder="e.g., Sign Up Now"
            />
          )}
        </div>
      )}

      {/* Display Rules Tab */}
      {activeTab === "display" && (
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={data.display.oncePerSession || false}
                onChange={(e) =>
                  updateDisplay({ oncePerSession: e.target.checked })
                }
                disabled={disabled}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">
                  Once per session
                </span>
                <p className="text-sm text-gray-500">
                  Only show once per browser session
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={data.display.onceEver || false}
                onChange={(e) => updateDisplay({ onceEver: e.target.checked })}
                disabled={disabled}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">
                  Once ever (remembered)
                </span>
                <p className="text-sm text-gray-500">
                  Never show again after first view (uses localStorage)
                </p>
              </div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency Limit (days between displays)
            </label>
            <input
              type="number"
              value={data.display.frequencyDays || ""}
              onChange={(e) =>
                updateDisplay({
                  frequencyDays: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              disabled={disabled}
              min={1}
              placeholder="Leave empty for no limit"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <p className="mt-1 text-sm text-gray-500">
              If set, popup will only show again after this many days
            </p>
          </div>
        </div>
      )}

      {/* Style Tab */}
      {activeTab === "style" && (
        <div className="space-y-6">
          {/* Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Popup Size
            </label>
            <div className="flex gap-2">
              {(["small", "medium", "large", "full"] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => updateData({ size })}
                  disabled={disabled}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    data.size === size
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { value: "center", label: "Center" },
                  { value: "bottom", label: "Bottom" },
                  { value: "slide-in-right", label: "Slide In Right" },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateData({ position: option.value })}
                  disabled={disabled}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    data.position === option.value
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Close Options */}
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={data.showCloseButton}
                onChange={(e) => updateData({ showCloseButton: e.target.checked })}
                disabled={disabled}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-900">
                Show close button (X)
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={data.closeOnOverlayClick}
                onChange={(e) =>
                  updateData({ closeOnOverlayClick: e.target.checked })
                }
                disabled={disabled}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-900">
                Close when clicking outside
              </span>
            </label>
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
