"use client";

/**
 * Divider Block Preview Component
 *
 * Live preview rendering of divider block.
 *
 * DESIGN SYSTEM COMPLIANCE:
 * - All colors via CSS variables (--color-border, --color-text-muted)
 * - Spacing via CSS variables (--space-*)
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
    small: "py-[var(--space-4)]",
    medium: "py-[var(--space-6)]",
    large: "py-[var(--space-8)]",
  };

  const advancedProps = getAdvancedProps(advanced);
  const combinedClassName = `block-preview px-[var(--space-5)] ${heightClasses[data.height]} ${advancedProps.className || ""}`.trim();

  return (
    <div {...advancedProps} className={combinedClassName}>
      <div className="max-w-4xl mx-auto">
        {data.style === "line" && (
          <hr className="border-t" style={{ borderColor: "var(--color-border)" }} />
        )}
        {data.style === "dots" && (
          <div className="flex justify-center gap-[var(--space-2)]">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--color-text-muted)" }} />
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--color-text-muted)" }} />
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--color-text-muted)" }} />
          </div>
        )}
        {data.style === "space" && (
          <div className="h-0" />
        )}
      </div>
    </div>
  );
}
