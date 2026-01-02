"use client";

/**
 * Divider Block Preview Component
 *
 * Live preview rendering of divider block.
 */

import type { Block, DividerBlock } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";

interface DividerBlockPreviewProps {
  block: Block;
}

export function DividerBlockPreview({ block }: DividerBlockPreviewProps) {
  const dividerBlock = block as DividerBlock;
  const { data, advanced } = dividerBlock;

  const heightClasses = {
    small: "py-4",
    medium: "py-8",
    large: "py-16",
  };

  const advancedProps = getAdvancedProps(advanced);
  const combinedClassName = `px-6 ${heightClasses[data.height]} ${advancedProps.className || ""}`.trim();

  return (
    <div {...advancedProps} className={combinedClassName}>
      <div className="max-w-4xl mx-auto">
        {data.style === "line" && (
          <hr className="border-t border-gray-300" />
        )}
        {data.style === "dots" && (
          <div className="flex justify-center gap-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
          </div>
        )}
        {data.style === "space" && (
          <div className="h-0" />
        )}
      </div>
    </div>
  );
}
