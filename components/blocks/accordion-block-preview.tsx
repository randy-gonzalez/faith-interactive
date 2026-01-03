"use client";

/**
 * Accordion Block Preview Component
 *
 * Live preview rendering of accordion block with collapsible items.
 */

import { useState } from "react";
import type { Block, AccordionBlock } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";
import { useBackgroundStyles } from "@/lib/blocks/use-background-styles";

interface AccordionBlockPreviewProps {
  block: Block;
}

export function AccordionBlockPreview({ block }: AccordionBlockPreviewProps) {
  const accordionBlock = block as AccordionBlock;
  const { data, background, advanced } = accordionBlock;

  // Initialize open state based on defaultOpen
  const [openItems, setOpenItems] = useState<Set<string>>(() => {
    const initialOpen = new Set<string>();
    data.items.forEach((item) => {
      if (item.defaultOpen) {
        initialOpen.add(item.id);
      }
    });
    return initialOpen;
  });

  const { style: backgroundStyle, overlay } = useBackgroundStyles(background, "transparent");
  const hasBackground = background && background.type !== "color";
  const textColorClass = hasBackground ? "text-white" : "text-gray-900";
  const subTextColorClass = hasBackground ? "text-white/80" : "text-gray-600";
  const borderColor = hasBackground ? "border-white/20" : "border-gray-200";
  const advancedProps = getAdvancedProps(advanced);
  const combinedClassName = `block-preview py-12 px-6 relative ${advancedProps.className || ""}`.trim();

  function toggleItem(id: string) {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div {...advancedProps} className={combinedClassName} style={backgroundStyle}>
      {/* Image overlay (for image backgrounds) */}
      {background?.type === "image" && background.imageUrl && overlay && (
        <div className="absolute inset-0" style={overlay} />
      )}

      <div className="max-w-3xl mx-auto relative z-10">
        {data.heading && (
          <h2 className={`text-2xl md:text-3xl font-bold ${textColorClass} text-center mb-8`}>
            {data.heading}
          </h2>
        )}

        {data.items.length === 0 ? (
          <p className={`text-center ${subTextColorClass} italic`}>
            Add accordion items to display...
          </p>
        ) : (
          <div className={`divide-y ${borderColor}`}>
            {data.items.map((item) => (
              <div key={item.id} className="py-4">
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className={`w-full flex items-center justify-between text-left ${textColorClass}`}
                >
                  <span className="text-lg font-medium">{item.title}</span>
                  <svg
                    className={`w-5 h-5 transition-transform ${
                      openItems.has(item.id) ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openItems.has(item.id) && (
                  <div className={`mt-3 ${subTextColorClass}`}>
                    <div dangerouslySetInnerHTML={{ __html: item.content }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
