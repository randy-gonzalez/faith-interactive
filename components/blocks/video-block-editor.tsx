"use client";

/**
 * Video Block Editor Component
 *
 * Edit form for video block with YouTube/Vimeo support.
 */

import { useState } from "react";
import type { Block, VideoBlock, BlockBackground, BlockAdvanced } from "@/types/blocks";
import { createDefaultBackground } from "@/types/blocks";
import { BlockBackgroundEditor } from "./block-background-editor";
import { BlockAdvancedEditor } from "./block-advanced-editor";
import { MediaPicker } from "@/components/dashboard/media-picker";

interface VideoBlockEditorProps {
  block: Block;
  onChange: (block: Block) => void;
  disabled?: boolean;
}

const TABS = [
  { id: "content", label: "Content" },
  { id: "background", label: "Background" },
  { id: "advanced", label: "Advanced" },
] as const;

export function VideoBlockEditor({
  block,
  onChange,
  disabled,
}: VideoBlockEditorProps) {
  const videoBlock = block as VideoBlock;
  const { data } = videoBlock;
  const [activeTab, setActiveTab] = useState<"content" | "background" | "advanced">("content");

  function updateData(updates: Partial<VideoBlock["data"]>) {
    onChange({
      ...videoBlock,
      data: { ...data, ...updates },
    });
  }

  function updateBackground(background: BlockBackground) {
    onChange({
      ...videoBlock,
      background,
    });
  }

  function updateAdvanced(advanced: BlockAdvanced) {
    onChange({
      ...videoBlock,
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
          {/* Video Source Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video Source
            </label>
            <div className="flex gap-1">
              {(["external", "upload"] as const).map((source) => (
                <button
                  key={source}
                  type="button"
                  onClick={() => updateData({ videoSource: source, videoUrl: "" })}
                  disabled={disabled}
                  className={`flex-1 px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    (data.videoSource || "external") === source
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  } disabled:opacity-50`}
                >
                  {source === "external" ? "YouTube / Vimeo" : "Upload Video"}
                </button>
              ))}
            </div>
          </div>

          {/* External Video URL */}
          {(data.videoSource || "external") === "external" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video URL
              </label>
              <input
                type="url"
                value={data.videoUrl}
                onChange={(e) => updateData({ videoUrl: e.target.value })}
                disabled={disabled}
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Paste a YouTube or Vimeo video link
              </p>
            </div>
          )}

          {/* Upload Video */}
          {data.videoSource === "upload" && (
            <MediaPicker
              label="Video File"
              value={data.videoUrl}
              onChange={(url) => updateData({ videoUrl: url || "" })}
              disabled={disabled}
            />
          )}

          {/* Aspect Ratio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aspect Ratio
            </label>
            <div className="flex gap-1">
              {(["16:9", "4:3", "1:1"] as const).map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => updateData({ aspectRatio: ratio })}
                  disabled={disabled}
                  className={`flex-1 px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    data.aspectRatio === ratio
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  } disabled:opacity-50`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Autoplay */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={data.autoplay}
                onChange={(e) => updateData({ autoplay: e.target.checked })}
                disabled={disabled}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Autoplay (muted)
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Video will autoplay muted when visible
            </p>
          </div>
        </div>
      )}

      {/* Background Tab */}
      {activeTab === "background" && (
        <BlockBackgroundEditor
          background={videoBlock.background || createDefaultBackground()}
          onChange={updateBackground}
          disabled={disabled}
        />
      )}

      {/* Advanced Tab */}
      {activeTab === "advanced" && (
        <BlockAdvancedEditor
          advanced={videoBlock.advanced || {}}
          onChange={updateAdvanced}
          disabled={disabled}
        />
      )}
    </div>
  );
}
