"use client";

/**
 * Form Block Preview Component
 *
 * Preview rendering of form block. Shows the actual form or a placeholder in editor.
 * On public pages, the form is fully interactive.
 *
 * DESIGN SYSTEM COMPLIANCE:
 * - All colors via CSS variables (--color-*, --btn-*)
 * - Spacing via CSS variables (--space-*)
 * - Typography via CSS variables (--font-*)
 * - Radius via CSS variables (--radius)
 */

import { useState, useEffect } from "react";
import type { Block, FormBlock } from "@/types/blocks";
import { DynamicForm } from "@/components/public/dynamic-form";
import { getAdvancedProps } from "./block-advanced-editor";
import { useBackgroundStyles } from "@/lib/blocks/use-background-styles";
import { getTextColors, resolveTextTheme } from "@/lib/blocks/get-text-colors";
import { SECTION_PADDING, getCardClasses } from "@/lib/blocks/block-styles";
import type { FormField, FormSettings } from "@/types/forms";

interface FormBlockPreviewProps {
  block: Block;
  isEditor?: boolean; // True when in editor preview, false on public pages
}

interface FormData {
  id: string;
  name: string;
  description: string | null;
  fields: FormField[];
  settings: FormSettings;
  isActive: boolean;
}

export function FormBlockPreview({ block, isEditor = false }: FormBlockPreviewProps) {
  const formBlock = block as FormBlock;
  const { data, background, advanced } = formBlock;
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { style: backgroundStyle, overlay } = useBackgroundStyles(background, "transparent");
  const textColors = getTextColors(background?.textTheme, background?.type, background?.color);
  const useLightTheme = resolveTextTheme(background?.textTheme, background?.type);
  const cardClasses = getCardClasses(useLightTheme);
  const advancedProps = getAdvancedProps(advanced);

  // Fetch form data
  useEffect(() => {
    async function fetchForm() {
      if (!data.formId) {
        setLoading(false);
        return;
      }

      try {
        // Use public endpoint for public pages, authenticated endpoint for editor
        const endpoint = isEditor
          ? `/api/forms/${data.formId}`
          : `/api/forms/${data.formId}/public`;
        const response = await fetch(endpoint);
        const result = await response.json();

        if (result.success) {
          setFormData({
            id: result.data.form.id,
            name: result.data.form.name,
            description: result.data.form.description,
            fields: result.data.form.fields as FormField[],
            settings: result.data.form.settings as FormSettings,
            isActive: result.data.form.isActive,
          });
        } else {
          setError("Form not found");
        }
      } catch (err) {
        setError("Failed to load form");
      } finally {
        setLoading(false);
      }
    }

    fetchForm();
  }, [data.formId, isEditor]);

  const maxWidthClass = {
    narrow: "max-w-md",
    medium: "max-w-2xl",
    full: "max-w-full",
  }[data.maxWidth];

  const alignmentClass = {
    left: "mr-auto",
    center: "mx-auto",
    right: "ml-auto",
  }[data.alignment];

  const combinedClassName =
    `block-preview ${SECTION_PADDING} relative ${advancedProps.className || ""}`.trim();

  // Editor placeholder when no form is selected
  if (!data.formId) {
    return (
      <div {...advancedProps} className={combinedClassName} style={backgroundStyle}>
        {background?.type === "image" && background.imageUrl && overlay && (
          <div className="absolute inset-0" style={overlay} />
        )}
        <div className={`${maxWidthClass} ${alignmentClass} relative z-10`}>
          <div className="border-2 border-dashed rounded-[var(--radius)] p-[var(--space-6)] text-center" style={{ borderColor: "var(--color-border)" }}>
            <svg
              className="w-12 h-12 mx-auto mb-[var(--space-4)]"
              style={{ color: "var(--color-text-muted)" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p style={{ color: "var(--color-text-muted)" }}>Select a form to display</p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div {...advancedProps} className={combinedClassName} style={backgroundStyle}>
        {background?.type === "image" && background.imageUrl && overlay && (
          <div className="absolute inset-0" style={overlay} />
        )}
        <div className={`${maxWidthClass} ${alignmentClass} relative z-10`}>
          <div className="text-center" style={{ color: "var(--color-text-muted)" }}>Loading form...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !formData) {
    return (
      <div {...advancedProps} className={combinedClassName} style={backgroundStyle}>
        {background?.type === "image" && background.imageUrl && overlay && (
          <div className="absolute inset-0" style={overlay} />
        )}
        <div className={`${maxWidthClass} ${alignmentClass} relative z-10`}>
          <div className="text-center" style={{ color: "var(--color-text-muted)" }}>
            {error || "Form not found"}
            {data.cachedFormName && (
              <p className="mt-[var(--space-1)] text-sm">Previously: {data.cachedFormName}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Inactive form warning (editor only)
  if (!formData.isActive && isEditor) {
    return (
      <div {...advancedProps} className={combinedClassName} style={backgroundStyle}>
        {background?.type === "image" && background.imageUrl && overlay && (
          <div className="absolute inset-0" style={overlay} />
        )}
        <div className={`${maxWidthClass} ${alignmentClass} relative z-10`}>
          <div className="border border-amber-300 bg-amber-50 rounded-[var(--radius)] p-[var(--space-5)] text-center">
            <p className="text-amber-700 font-medium">{formData.name}</p>
            <p className="text-amber-600 text-sm mt-[var(--space-1)]">
              This form is inactive and won't be displayed on the public page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Don't show inactive forms on public pages
  if (!formData.isActive && !isEditor) {
    return null;
  }

  // Render the form
  const heading = data.heading || formData.name;
  const description = data.description || formData.description;

  return (
    <div {...advancedProps} className={combinedClassName} style={backgroundStyle}>
      {background?.type === "image" && background.imageUrl && overlay && (
        <div className="absolute inset-0" style={overlay} />
      )}
      <div className={`${maxWidthClass} ${alignmentClass} relative z-10`}>
        {heading && (
          <h2 className="text-[length:var(--font-size-h2)] font-bold text-center mb-[var(--space-4)]" style={{ color: textColors.heading, fontFamily: "var(--font-heading)" }}>
            {heading}
          </h2>
        )}
        {description && (
          <p className="text-center mb-[var(--space-6)]" style={{ color: textColors.subtext }}>{description}</p>
        )}

        {isEditor ? (
          // In editor mode, show a preview placeholder
          <div className={`${cardClasses} rounded-[var(--radius)] p-[var(--space-5)]`}>
            <p className="text-sm text-center mb-[var(--space-4)]" style={{ color: textColors.subtext }}>
              Form Preview: {formData.name}
            </p>
            <div className="space-y-[var(--space-4)] opacity-60 pointer-events-none">
              {formData.fields.slice(0, 3).map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium mb-[var(--space-1)]" style={{ color: textColors.text }}>
                    {field.label}
                    {field.required && " *"}
                  </label>
                  {field.type === "textarea" ? (
                    <div className={`w-full h-20 rounded-[var(--radius)] ${useLightTheme ? "bg-white/20 border border-white/30" : "bg-[var(--color-surface)] border"}`} style={{ borderColor: useLightTheme ? undefined : "var(--color-border)" }} />
                  ) : (
                    <div className={`w-full h-10 rounded-[var(--radius)] ${useLightTheme ? "bg-white/20 border border-white/30" : "bg-[var(--color-surface)] border"}`} style={{ borderColor: useLightTheme ? undefined : "var(--color-border)" }} />
                  )}
                </div>
              ))}
              {formData.fields.length > 3 && (
                <p className="text-xs text-center" style={{ color: textColors.subtext }}>
                  + {formData.fields.length - 3} more fields
                </p>
              )}
              <div className="h-10 rounded-[var(--radius)]" style={{ backgroundColor: useLightTheme ? "var(--on-dark-btn-bg)" : "var(--btn-primary-bg)" }} />
            </div>
          </div>
        ) : (
          // On public pages, render the actual interactive form
          <div className="bg-[var(--color-surface)] rounded-[var(--radius)] shadow-sm p-[var(--space-5)]">
            <DynamicForm
              formId={formData.id}
              fields={formData.fields}
              settings={formData.settings}
            />
          </div>
        )}
      </div>
    </div>
  );
}
