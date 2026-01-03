/**
 * Popup Block Preview
 *
 * Shows a preview card in the editor indicating popup configuration.
 * The actual popup rendering happens in PopupRenderer on the public site.
 */

"use client";

import type { Block, PopupBlock } from "@/types/blocks";

interface PopupBlockPreviewProps {
  block: Block;
}

export function PopupBlockPreview({ block }: PopupBlockPreviewProps) {
  const popupBlock = block as PopupBlock;
  const { data } = popupBlock;

  const triggerLabels = {
    "time-delay": `After ${(data.trigger.delayMs || 5000) / 1000}s`,
    scroll: `At ${data.trigger.scrollPercentage || 50}% scroll`,
    "exit-intent": "On exit intent",
    "button-click": data.trigger.buttonText || "Button click",
  };

  const positionLabels = {
    center: "Center",
    bottom: "Bottom",
    "slide-in-right": "Slide in right",
  };

  return (
    <div className="block-preview bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
          <svg
            className="w-6 h-6 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-purple-900">
              Popup Block
            </span>
            <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
              {data.size}
            </span>
          </div>

          {data.heading && (
            <h4 className="text-gray-900 font-medium mb-1 truncate">
              {data.heading}
            </h4>
          )}

          {data.content && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {data.content.replace(/<[^>]*>/g, "").slice(0, 100)}
              {data.content.length > 100 ? "..." : ""}
            </p>
          )}

          {/* Configuration Summary */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded">
              <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {triggerLabels[data.trigger.type]}
            </span>

            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded">
              <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              {positionLabels[data.position]}
            </span>

            {data.buttons.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded">
                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                {data.buttons.length} button{data.buttons.length !== 1 ? "s" : ""}
              </span>
            )}

            {data.display.oncePerSession && (
              <span className="inline-flex items-center px-2 py-1 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded">
                Once per session
              </span>
            )}

            {data.display.onceEver && (
              <span className="inline-flex items-center px-2 py-1 bg-orange-50 border border-orange-200 text-orange-700 rounded">
                Once ever
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Note about popup behavior */}
      <div className="mt-4 pt-4 border-t border-purple-200">
        <p className="text-xs text-purple-700">
          Popup will be triggered on the live site based on the configured rules.
          It won&apos;t appear in the page preview.
        </p>
      </div>
    </div>
  );
}
