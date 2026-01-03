"use client";

/**
 * Form Field Editor Component
 *
 * Drag-and-drop field ordering and inline field editing.
 */

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import type { FormField, FormFieldType, SelectOption } from "@/types/forms";
import { FIELD_TYPES, createFormField } from "@/types/forms";

interface FormFieldEditorProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
  canEdit: boolean;
}

interface SortableFieldProps {
  field: FormField;
  onUpdate: (field: FormField) => void;
  onDelete: () => void;
  canEdit: boolean;
}

function SortableField({ field, onUpdate, onDelete, canEdit }: SortableFieldProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const fieldTypeConfig = FIELD_TYPES.find((t) => t.type === field.type);

  const handleOptionsChange = (optionsText: string) => {
    const options: SelectOption[] = optionsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((label) => ({
        label,
        value: label.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
      }));
    onUpdate({ ...field, options });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-gray-200 rounded-lg bg-white"
    >
      {/* Field header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-t-lg">
        {canEdit && (
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </button>
        )}
        <div className="flex-1">
          <span className="font-medium text-gray-900">{field.label}</span>
          <span className="ml-2 text-sm text-gray-500">
            ({fieldTypeConfig?.label || field.type})
          </span>
          {field.required && (
            <span className="ml-2 text-xs text-red-600">Required</span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg
            className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Field editor (expanded) */}
      {isExpanded && (
        <div className="p-4 space-y-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label
              </label>
              <input
                type="text"
                value={field.label}
                onChange={(e) => onUpdate({ ...field, label: e.target.value })}
                disabled={!canEdit}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field Name (key)
              </label>
              <input
                type="text"
                value={field.name}
                onChange={(e) =>
                  onUpdate({
                    ...field,
                    name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
                  })
                }
                disabled={!canEdit}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 text-sm font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placeholder
              </label>
              <input
                type="text"
                value={field.placeholder || ""}
                onChange={(e) => onUpdate({ ...field, placeholder: e.target.value })}
                disabled={!canEdit}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Help Text
              </label>
              <input
                type="text"
                value={field.helpText || ""}
                onChange={(e) => onUpdate({ ...field, helpText: e.target.value })}
                disabled={!canEdit}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => onUpdate({ ...field, required: e.target.checked })}
                disabled={!canEdit}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Required</span>
            </label>
          </div>

          {/* Type-specific options */}
          {field.type === "select" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Options (one per line)
              </label>
              <textarea
                value={field.options?.map((o) => o.label).join("\n") || ""}
                onChange={(e) => handleOptionsChange(e.target.value)}
                disabled={!canEdit}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 text-sm"
                placeholder="Option 1&#10;Option 2&#10;Option 3"
              />
            </div>
          )}

          {field.type === "checkbox" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Checkbox Label
              </label>
              <input
                type="text"
                value={field.checkboxLabel || ""}
                onChange={(e) => onUpdate({ ...field, checkboxLabel: e.target.value })}
                disabled={!canEdit}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 text-sm"
                placeholder="I agree to the terms"
              />
            </div>
          )}

          {/* Validation options for text fields */}
          {["text", "textarea", "email", "phone"].includes(field.type) && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Length
                </label>
                <input
                  type="number"
                  min="0"
                  value={field.validation?.minLength || ""}
                  onChange={(e) =>
                    onUpdate({
                      ...field,
                      validation: {
                        ...field.validation,
                        minLength: e.target.value ? parseInt(e.target.value) : undefined,
                      },
                    })
                  }
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Length
                </label>
                <input
                  type="number"
                  min="1"
                  value={field.validation?.maxLength || ""}
                  onChange={(e) =>
                    onUpdate({
                      ...field,
                      validation: {
                        ...field.validation,
                        maxLength: e.target.value ? parseInt(e.target.value) : undefined,
                      },
                    })
                  }
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 text-sm"
                />
              </div>
            </div>
          )}

          {/* Delete button */}
          {canEdit && (
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={onDelete}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Delete Field
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function FormFieldEditor({ fields, onChange, canEdit }: FormFieldEditorProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = fields.findIndex((f) => f.id === active.id);
        const newIndex = fields.findIndex((f) => f.id === over.id);
        const newFields = arrayMove(fields, oldIndex, newIndex).map((f, i) => ({
          ...f,
          order: i,
        }));
        onChange(newFields);
      }
    },
    [fields, onChange]
  );

  const handleAddField = useCallback(
    (type: FormFieldType) => {
      const newField = createFormField(type, fields.length, {
        name: `field_${fields.length + 1}`,
        label: FIELD_TYPES.find((t) => t.type === type)?.label || "New Field",
      });
      onChange([...fields, newField]);
      setShowAddMenu(false);
    },
    [fields, onChange]
  );

  const handleUpdateField = useCallback(
    (index: number, field: FormField) => {
      const newFields = [...fields];
      newFields[index] = field;
      onChange(newFields);
    },
    [fields, onChange]
  );

  const handleDeleteField = useCallback(
    (index: number) => {
      const newFields = fields.filter((_, i) => i !== index);
      onChange(newFields.map((f, i) => ({ ...f, order: i })));
    },
    [fields, onChange]
  );

  return (
    <div className="space-y-4">
      {fields.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No fields yet.</p>
          {canEdit && <p className="mt-2">Add a field to get started.</p>}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {fields.map((field, index) => (
                <SortableField
                  key={field.id}
                  field={field}
                  onUpdate={(f) => handleUpdateField(index, f)}
                  onDelete={() => handleDeleteField(index)}
                  canEdit={canEdit}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add field button and menu */}
      {canEdit && (
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="w-full border-dashed"
          >
            + Add Field
          </Button>

          {showAddMenu && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="p-2 grid grid-cols-2 gap-2">
                {FIELD_TYPES.map((fieldType) => (
                  <button
                    key={fieldType.type}
                    onClick={() => handleAddField(fieldType.type)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-left rounded-lg hover:bg-gray-100"
                  >
                    <span className="font-medium">{fieldType.label}</span>
                    <span className="text-xs text-gray-500">{fieldType.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
