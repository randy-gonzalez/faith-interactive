"use client";

/**
 * Form Block Editor Component
 *
 * Editor for selecting and configuring a form to embed on a page.
 */

import { useState, useEffect } from "react";
import type { Block, FormBlock } from "@/types/blocks";

interface FormBlockEditorProps {
  block: Block;
  onChange: (block: Block) => void;
}

interface FormOption {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
}

export function FormBlockEditor({ block, onChange }: FormBlockEditorProps) {
  const formBlock = block as FormBlock;
  const [forms, setForms] = useState<FormOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch available forms
  useEffect(() => {
    async function fetchForms() {
      try {
        const response = await fetch("/api/forms");
        const data = await response.json();
        if (data.success) {
          setForms(data.data.forms);
        }
      } catch (error) {
        console.error("Failed to fetch forms:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchForms();
  }, []);

  const updateData = (updates: Partial<FormBlock["data"]>) => {
    onChange({
      ...formBlock,
      data: { ...formBlock.data, ...updates },
    });
  };

  const handleFormSelect = (formId: string) => {
    const selectedForm = forms.find((f) => f.id === formId);
    updateData({
      formId,
      cachedFormName: selectedForm?.name,
    });
  };

  const selectedForm = forms.find((f) => f.id === formBlock.data.formId);

  return (
    <div className="space-y-6">
      {/* Form Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Form
        </label>
        {loading ? (
          <div className="text-sm text-gray-500">Loading forms...</div>
        ) : forms.length === 0 ? (
          <div className="text-sm text-gray-500">
            No forms available. Create a form in the Forms section first.
          </div>
        ) : (
          <select
            value={formBlock.data.formId}
            onChange={(e) => handleFormSelect(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choose a form...</option>
            {forms.map((form) => (
              <option key={form.id} value={form.id} disabled={!form.isActive}>
                {form.name}
                {!form.isActive && " (Inactive)"}
              </option>
            ))}
          </select>
        )}
        {selectedForm && !selectedForm.isActive && (
          <p className="mt-1 text-sm text-amber-600">
            This form is inactive and won't be displayed on the public page.
          </p>
        )}
      </div>

      {/* Optional Heading */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Heading (Optional)
        </label>
        <input
          type="text"
          value={formBlock.data.heading || ""}
          onChange={(e) => updateData({ heading: e.target.value })}
          placeholder="e.g., Get in Touch"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Add a heading above the form. Leave blank to use the form's name or no heading.
        </p>
      </div>

      {/* Optional Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          value={formBlock.data.description || ""}
          onChange={(e) => updateData({ description: e.target.value })}
          placeholder="Optional intro text..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Layout Options */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Width
          </label>
          <select
            value={formBlock.data.maxWidth}
            onChange={(e) =>
              updateData({
                maxWidth: e.target.value as "narrow" | "medium" | "full",
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="narrow">Narrow</option>
            <option value="medium">Medium</option>
            <option value="full">Full Width</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alignment
          </label>
          <select
            value={formBlock.data.alignment}
            onChange={(e) =>
              updateData({
                alignment: e.target.value as "left" | "center" | "right",
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>
    </div>
  );
}
