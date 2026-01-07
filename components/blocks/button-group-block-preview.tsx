"use client";

/**
 * Button Group Block Preview Component
 *
 * Live preview rendering of button group block.
 *
 * DESIGN SYSTEM COMPLIANCE:
 * - All colors via CSS variables (--btn-*, --color-*)
 * - Spacing via CSS variables (--space-*)
 * - Radius via CSS variables (--btn-radius)
 */

import type { Block, ButtonGroupBlock } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";
import { useBackgroundStyles } from "@/lib/blocks/use-background-styles";
import { getTextColors, resolveTextTheme } from "@/lib/blocks/get-text-colors";
import { SECTION_PADDING_COMPACT } from "@/lib/blocks/block-styles";

interface ButtonGroupBlockPreviewProps {
  block: Block;
}

export function ButtonGroupBlockPreview({ block }: ButtonGroupBlockPreviewProps) {
  const buttonGroupBlock = block as ButtonGroupBlock;
  const { data, background, advanced } = buttonGroupBlock;

  const { style: backgroundStyle, overlay } = useBackgroundStyles(background, "transparent");
  const textColors = getTextColors(background?.textTheme, background?.type, background?.color);
  const useLightTheme = resolveTextTheme(background?.textTheme, background?.type);
  const advancedProps = getAdvancedProps(advanced);

  const alignmentClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  // Get button styles using CSS variables for branding
  const getButtonStyles = (variant: "primary" | "secondary" | "outline"): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      borderRadius: "var(--btn-radius, 8px)",
    };

    if (useLightTheme) {
      // On light-themed backgrounds (dark text on image/gradient), use white/transparent variants via CSS vars
      switch (variant) {
        case "primary":
          return { ...baseStyles, backgroundColor: "var(--on-dark-btn-bg)", color: "var(--on-dark-btn-text)" };
        case "secondary":
          return { ...baseStyles, backgroundColor: "var(--on-dark-btn-secondary-bg)", color: "var(--on-dark-btn-secondary-text)" };
        case "outline":
          return { ...baseStyles, backgroundColor: "transparent", color: "var(--on-dark-btn-outline-text)", border: "2px solid var(--on-dark-btn-outline-border)" };
      }
    } else {
      // Use branding colors via CSS variables
      switch (variant) {
        case "primary":
          return { ...baseStyles, backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" };
        case "secondary":
          return { ...baseStyles, backgroundColor: "var(--btn-secondary-bg)", color: "var(--btn-secondary-text)" };
        case "outline":
          return {
            ...baseStyles,
            backgroundColor: "transparent",
            color: "var(--btn-outline-text)",
            border: "2px solid var(--btn-outline-border)",
          };
      }
    }
  };

  // Base classes without colors (using inline styles for colors)
  const getButtonClasses = () => {
    return "inline-block px-[var(--space-5)] py-[var(--space-3)] font-semibold transition-opacity hover:opacity-90";
  };

  const combinedClassName = `block-preview ${SECTION_PADDING_COMPACT} relative ${advancedProps.className || ""}`.trim();

  return (
    <div {...advancedProps} className={combinedClassName} style={backgroundStyle}>
      {/* Image overlay (for image backgrounds) */}
      {background?.type === "image" && background.imageUrl && overlay && (
        <div className="absolute inset-0" style={overlay} />
      )}

      <div className="max-w-4xl mx-auto relative z-10">
        {data.buttons.length === 0 ? (
          <p className="text-center italic" style={{ color: textColors.subtext }}>
            Add buttons to display...
          </p>
        ) : (
          <div className={`flex flex-wrap gap-[var(--space-4)] ${alignmentClasses[data.alignment]}`}>
            {data.buttons.map((btn) => (
              <a
                key={btn.id}
                href={btn.url}
                className={getButtonClasses()}
                style={getButtonStyles(btn.variant)}
              >
                {btn.text}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
