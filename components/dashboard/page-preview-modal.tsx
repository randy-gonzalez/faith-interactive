"use client";

/**
 * Page Preview Modal
 *
 * Full-screen modal that renders the page as it would appear on the public site.
 * Includes viewport size selector for responsive preview.
 */

import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import type { Block } from "@/types/blocks";

type ViewportSize = "desktop" | "tablet" | "mobile";

const VIEWPORT_WIDTHS: Record<ViewportSize, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

interface PagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  blocks: Block[];
  featuredImageUrl?: string;
  viewport: ViewportSize;
  onViewportChange: (viewport: ViewportSize) => void;
}

export function PagePreviewModal({
  isOpen,
  onClose,
  title,
  blocks,
  featuredImageUrl,
  viewport,
  onViewportChange,
}: PagePreviewModalProps) {
  // Close on ESC key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const modal = (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-900/95">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-white">
            Preview: {title || "Untitled Page"}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Viewport Selector */}
          <div className="flex rounded-lg border border-gray-600 overflow-hidden">
            <button
              type="button"
              onClick={() => onViewportChange("desktop")}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                viewport === "desktop"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              title="Desktop (Full width)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onViewportChange("tablet")}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                viewport === "tablet"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              title="Tablet (768px)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onViewportChange("mobile")}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                viewport === "mobile"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              title="Mobile (375px)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </button>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Close preview (ESC)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div
        className="flex-1 overflow-auto p-6"
        onClick={(e) => {
          // Close when clicking the backdrop (outside the preview container)
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          className="mx-auto bg-white min-h-full shadow-2xl transition-all duration-300"
          style={{ maxWidth: VIEWPORT_WIDTHS[viewport] }}
        >
          {/* Simulated page content */}
          {blocks.length === 0 && !featuredImageUrl ? (
            <div className="flex items-center justify-center h-96 text-gray-400">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-lg font-medium">No content to preview</p>
                <p className="text-sm mt-1">Add blocks to see the preview</p>
              </div>
            </div>
          ) : (
            <>
              {/* Featured Image */}
              {featuredImageUrl && (
                <img
                  src={featuredImageUrl}
                  alt={title}
                  className="w-full h-64 sm:h-96 object-cover"
                />
              )}

              {/* Page Blocks */}
              <BlockRenderer blocks={blocks} />
            </>
          )}
        </div>
      </div>

      {/* Footer with viewport info */}
      <div className="px-6 py-2 bg-gray-800 border-t border-gray-700 text-center">
        <span className="text-sm text-gray-400">
          {viewport === "desktop" ? "Full width" : VIEWPORT_WIDTHS[viewport]} viewport
        </span>
      </div>
    </div>
  );

  // Render in a portal to ensure it's above everything
  return createPortal(modal, document.body);
}
