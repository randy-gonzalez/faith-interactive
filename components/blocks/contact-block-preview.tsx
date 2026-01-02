"use client";

/**
 * Contact Block Preview Component
 *
 * Live preview rendering of contact block with info and optional map.
 */

import type { Block, ContactBlock, BlockBackground } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";

interface ContactBlockPreviewProps {
  block: Block;
}

function getBackgroundStyles(background?: BlockBackground): React.CSSProperties {
  if (!background) return {};

  switch (background.type) {
    case "color":
      return { backgroundColor: background.color || "transparent" };
    case "gradient":
      return { background: background.gradient };
    case "image":
      if (background.imageUrl) {
        const overlay = background.overlay || "rgba(0,0,0,0.5)";
        return {
          backgroundImage: `linear-gradient(${overlay}, ${overlay}), url(${background.imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        };
      }
      return {};
    default:
      return {};
  }
}

export function ContactBlockPreview({ block }: ContactBlockPreviewProps) {
  const contactBlock = block as ContactBlock;
  const { data, background, advanced } = contactBlock;

  const backgroundStyle = getBackgroundStyles(background);
  const hasBackground = background && background.type !== "color";
  const textColorClass = hasBackground ? "text-white" : "text-gray-900";
  const subTextColorClass = hasBackground ? "text-white/80" : "text-gray-600";
  const advancedProps = getAdvancedProps(advanced);
  const combinedClassName = `py-12 px-6 ${advancedProps.className || ""}`.trim();

  const hasContactInfo = data.address || data.phone || data.email;

  return (
    <div {...advancedProps} className={combinedClassName} style={backgroundStyle}>
      <div className="max-w-4xl mx-auto">
        <h2 className={`text-2xl md:text-3xl font-bold ${textColorClass} text-center mb-8`}>
          {data.heading}
        </h2>

        <div className={`grid ${data.showMap && data.mapEmbedUrl ? "md:grid-cols-2" : ""} gap-8`}>
          {/* Contact Info */}
          {hasContactInfo && (
            <div className="space-y-4">
              {data.address && (
                <div className="flex items-start gap-3">
                  <svg className={`w-5 h-5 ${subTextColorClass} mt-0.5 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className={subTextColorClass} style={{ whiteSpace: "pre-line" }}>
                    {data.address}
                  </div>
                </div>
              )}

              {data.phone && (
                <div className="flex items-center gap-3">
                  <svg className={`w-5 h-5 ${subTextColorClass} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${data.phone}`} className={`${subTextColorClass} hover:underline`}>
                    {data.phone}
                  </a>
                </div>
              )}

              {data.email && (
                <div className="flex items-center gap-3">
                  <svg className={`w-5 h-5 ${subTextColorClass} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${data.email}`} className={`${subTextColorClass} hover:underline`}>
                    {data.email}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Map */}
          {data.showMap && (
            <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
              {data.mapEmbedUrl ? (
                <iframe
                  src={data.mapEmbedUrl}
                  className="w-full h-full"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Add a map embed URL</span>
                </div>
              )}
            </div>
          )}
        </div>

        {!hasContactInfo && !data.showMap && (
          <p className={`text-center ${subTextColorClass} italic`}>
            Add contact information or enable the map to display...
          </p>
        )}
      </div>
    </div>
  );
}
