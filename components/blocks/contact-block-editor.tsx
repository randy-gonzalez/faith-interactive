"use client";

/**
 * Contact Block Editor Component
 *
 * Edit form for contact block with address, phone, email, and optional map.
 */

import { useState } from "react";
import type { Block, ContactBlock, BlockBackground, BlockAdvanced } from "@/types/blocks";
import { createDefaultBackground } from "@/types/blocks";
import { BlockBackgroundEditor } from "./block-background-editor";
import { BlockAdvancedEditor } from "./block-advanced-editor";

interface ContactBlockEditorProps {
  block: Block;
  onChange: (block: Block) => void;
  disabled?: boolean;
}

const TABS = [
  { id: "content", label: "Content" },
  { id: "background", label: "Background" },
  { id: "advanced", label: "Advanced" },
] as const;

export function ContactBlockEditor({
  block,
  onChange,
  disabled,
}: ContactBlockEditorProps) {
  const contactBlock = block as ContactBlock;
  const { data } = contactBlock;
  const [activeTab, setActiveTab] = useState<"content" | "background" | "advanced">("content");

  function updateData(updates: Partial<ContactBlock["data"]>) {
    onChange({
      ...contactBlock,
      data: { ...data, ...updates },
    });
  }

  function updateBackground(background: BlockBackground) {
    onChange({
      ...contactBlock,
      background,
    });
  }

  function updateAdvanced(advanced: BlockAdvanced) {
    onChange({
      ...contactBlock,
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
              placeholder="Contact Us"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address (optional)
            </label>
            <textarea
              value={data.address || ""}
              onChange={(e) => updateData({ address: e.target.value })}
              disabled={disabled}
              placeholder="123 Main Street&#10;City, State 12345"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone (optional)
            </label>
            <input
              type="tel"
              value={data.phone || ""}
              onChange={(e) => updateData({ phone: e.target.value })}
              disabled={disabled}
              placeholder="(555) 123-4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email (optional)
            </label>
            <input
              type="email"
              value={data.email || ""}
              onChange={(e) => updateData({ email: e.target.value })}
              disabled={disabled}
              placeholder="info@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Show Map */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={data.showMap}
                onChange={(e) => updateData({ showMap: e.target.checked })}
                disabled={disabled}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Show embedded map
            </label>
          </div>

          {/* Map Embed URL */}
          {data.showMap && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Maps Embed URL
              </label>
              <input
                type="url"
                value={data.mapEmbedUrl || ""}
                onChange={(e) => updateData({ mapEmbedUrl: e.target.value })}
                disabled={disabled}
                placeholder="https://www.google.com/maps/embed?pb=..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get embed URL from Google Maps &gt; Share &gt; Embed a map
              </p>
            </div>
          )}
        </div>
      )}

      {/* Background Tab */}
      {activeTab === "background" && (
        <BlockBackgroundEditor
          background={contactBlock.background || createDefaultBackground()}
          onChange={updateBackground}
          disabled={disabled}
        />
      )}

      {/* Advanced Tab */}
      {activeTab === "advanced" && (
        <BlockAdvancedEditor
          advanced={contactBlock.advanced || {}}
          onChange={updateAdvanced}
          disabled={disabled}
        />
      )}
    </div>
  );
}
