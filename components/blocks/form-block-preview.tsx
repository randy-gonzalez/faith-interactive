"use client";

/**
 * Form Block Preview Component
 *
 * Preview rendering of form block. Shows the actual form or a placeholder in editor.
 * On public pages, the form is fully interactive.
 */

import { useState, useEffect } from "react";
import type { Block, FormBlock } from "@/types/blocks";
import { DynamicForm } from "@/components/public/dynamic-form";
import { getAdvancedProps } from "./block-advanced-editor";
import { useBackgroundStyles } from "@/lib/blocks/use-background-styles";
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
    `block-preview py-12 px-6 relative ${advancedProps.className || ""}`.trim();

  // Editor placeholder when no form is selected
  if (!data.formId) {
    return (
      <div {...advancedProps} className={combinedClassName} style={backgroundStyle}>
        {background?.type === "image" && background.imageUrl && overlay && (
          <div className="absolute inset-0" style={overlay} />
        )}
        <div className={`${maxWidthClass} ${alignmentClass} relative z-10`}>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <svg
              className="w-12 h-12 mx-auto text-gray-400 mb-4"
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
            <p className="text-gray-500">Select a form to display</p>
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
          <div className="text-center text-gray-500">Loading form...</div>
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
          <div className="text-center text-gray-500">
            {error || "Form not found"}
            {data.cachedFormName && (
              <p className="mt-1 text-sm">Previously: {data.cachedFormName}</p>
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
          <div className="border border-amber-300 bg-amber-50 rounded-lg p-6 text-center">
            <p className="text-amber-700 font-medium">{formData.name}</p>
            <p className="text-amber-600 text-sm mt-1">
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
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-4">
            {heading}
          </h2>
        )}
        {description && (
          <p className="text-gray-600 text-center mb-8">{description}</p>
        )}

        {isEditor ? (
          // In editor mode, show a preview placeholder
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <p className="text-sm text-gray-500 text-center mb-4">
              Form Preview: {formData.name}
            </p>
            <div className="space-y-4 opacity-60 pointer-events-none">
              {formData.fields.slice(0, 3).map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && " *"}
                  </label>
                  {field.type === "textarea" ? (
                    <div className="w-full h-20 bg-white border border-gray-300 rounded-lg" />
                  ) : (
                    <div className="w-full h-10 bg-white border border-gray-300 rounded-lg" />
                  )}
                </div>
              ))}
              {formData.fields.length > 3 && (
                <p className="text-xs text-gray-400 text-center">
                  + {formData.fields.length - 3} more fields
                </p>
              )}
              <div className="h-10 bg-blue-600 rounded-lg" />
            </div>
          </div>
        ) : (
          // On public pages, render the actual interactive form
          <div className="bg-white rounded-lg shadow-sm p-6">
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
