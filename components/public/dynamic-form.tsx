"use client";

/**
 * Dynamic Form Component
 *
 * Renders a form dynamically based on field configuration.
 * Supports all field types: text, email, phone, textarea, select, checkbox, date, file.
 * Includes honeypot and timing-based spam protection.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { FormField, FormSettings } from "@/types/forms";
import { DEFAULT_FILE_CONFIG, FILE_TYPE_LABELS } from "@/types/forms";
import { Upload, X, FileIcon, ImageIcon, AlertCircle, Loader2 } from "lucide-react";

interface DynamicFormProps {
  formId: string;
  fields: FormField[];
  settings: FormSettings;
  className?: string;
}

// Track uploaded files
interface UploadedFile {
  fileId: string;
  filename: string;
  size: number;
  mimeType: string;
}

export function DynamicForm({ formId, fields, settings, className }: DynamicFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [fileUploads, setFileUploads] = useState<Record<string, UploadedFile[]>>({});
  const [honeypot, setHoneypot] = useState("");
  const [loadTime] = useState(() => Date.now());

  // Sort fields by order
  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  // Initialize form data with default values
  useEffect(() => {
    const defaults: Record<string, unknown> = {};
    sortedFields.forEach((field) => {
      if (field.type === "checkbox") {
        defaults[field.name] = false;
      } else {
        defaults[field.name] = "";
      }
    });
    setFormData(defaults);
  }, [fields]);

  const handleFieldChange = useCallback((name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleFileUpload = useCallback((fieldName: string, files: UploadedFile[]) => {
    setFileUploads((prev) => ({ ...prev, [fieldName]: files }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Build submission data with file IDs
      const submitData: Record<string, unknown> = {
        ...formData,
        _timestamp: loadTime.toString(),
      };

      // Add file IDs for file fields
      Object.entries(fileUploads).forEach(([fieldName, files]) => {
        if (files.length > 0) {
          submitData[fieldName] = files.map((f) => f.fileId);
        }
      });

      // Add honeypot if enabled
      if (settings.honeypotEnabled && settings.honeypotFieldName) {
        submitData[settings.honeypotFieldName] = honeypot;
      }

      const response = await fetch(`/api/forms/${formId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit form");
      }

      setSuccess(true);
      // Reset form
      const defaults: Record<string, unknown> = {};
      sortedFields.forEach((field) => {
        if (field.type === "checkbox") {
          defaults[field.name] = false;
        } else {
          defaults[field.name] = "";
        }
      });
      setFormData(defaults);
      setFileUploads({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <svg
          className="w-12 h-12 text-green-500 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          Submitted Successfully
        </h3>
        <p className="text-green-600">
          {settings.successMessage}
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 text-sm text-green-600 hover:underline"
        >
          Submit another response
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className || ""}`}>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {sortedFields.map((field) => (
        <FormFieldRenderer
          key={field.id}
          field={field}
          value={formData[field.name]}
          onChange={(value) => handleFieldChange(field.name, value)}
          disabled={loading}
          uploadedFiles={fileUploads[field.name] || []}
          onFileUpload={(files) => handleFileUpload(field.name, files)}
        />
      ))}

      {/* Honeypot field - hidden from humans, visible to bots */}
      {settings.honeypotEnabled && (
        <div
          className="absolute -left-[9999px] opacity-0 pointer-events-none"
          aria-hidden="true"
        >
          <label htmlFor={settings.honeypotFieldName}>
            Website (leave blank)
          </label>
          <input
            type="text"
            id={settings.honeypotFieldName}
            name={settings.honeypotFieldName}
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Submitting..." : settings.submitButtonText}
      </Button>
    </form>
  );
}

// ==============================================================================
// FIELD RENDERER
// ==============================================================================

interface FormFieldRendererProps {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled: boolean;
  uploadedFiles: UploadedFile[];
  onFileUpload: (files: UploadedFile[]) => void;
}

function FormFieldRenderer({
  field,
  value,
  onChange,
  disabled,
  uploadedFiles,
  onFileUpload,
}: FormFieldRendererProps) {
  const labelText = field.required ? `${field.label} *` : field.label;

  switch (field.type) {
    case "text":
      return (
        <div>
          <label
            htmlFor={field.id}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {labelText}
          </label>
          <Input
            id={field.id}
            type="text"
            value={String(value || "")}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            disabled={disabled}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
          />
          {field.helpText && (
            <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
          )}
        </div>
      );

    case "email":
      return (
        <div>
          <label
            htmlFor={field.id}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {labelText}
          </label>
          <Input
            id={field.id}
            type="email"
            value={String(value || "")}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || "email@example.com"}
            required={field.required}
            disabled={disabled}
          />
          {field.helpText && (
            <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
          )}
        </div>
      );

    case "phone":
      return (
        <div>
          <label
            htmlFor={field.id}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {labelText}
          </label>
          <Input
            id={field.id}
            type="tel"
            value={String(value || "")}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || "(555) 123-4567"}
            required={field.required}
            disabled={disabled}
          />
          {field.helpText && (
            <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
          )}
        </div>
      );

    case "textarea":
      return (
        <div>
          <label
            htmlFor={field.id}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {labelText}
          </label>
          <Textarea
            id={field.id}
            value={String(value || "")}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            disabled={disabled}
            rows={5}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
          />
          {field.helpText && (
            <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
          )}
        </div>
      );

    case "select":
      return (
        <div>
          <label
            htmlFor={field.id}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {labelText}
          </label>
          <select
            id={field.id}
            value={String(value || "")}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          >
            <option value="">{field.placeholder || "Select an option..."}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {field.helpText && (
            <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
          )}
        </div>
      );

    case "checkbox":
      return (
        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              id={field.id}
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              required={field.required}
              disabled={disabled}
              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">
                {field.checkboxLabel || field.label}
                {field.required && " *"}
              </span>
              {field.helpText && (
                <p className="text-sm text-gray-500">{field.helpText}</p>
              )}
            </div>
          </label>
        </div>
      );

    case "date":
      return (
        <div>
          <label
            htmlFor={field.id}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {labelText}
          </label>
          <Input
            id={field.id}
            type="date"
            value={String(value || "")}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            disabled={disabled}
            min={field.validation?.min}
            max={field.validation?.max}
          />
          {field.helpText && (
            <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
          )}
        </div>
      );

    case "file":
      return (
        <FileUploadField
          field={field}
          uploadedFiles={uploadedFiles}
          onFileUpload={onFileUpload}
          disabled={disabled}
        />
      );

    default:
      return null;
  }
}

// ==============================================================================
// FILE UPLOAD FIELD
// ==============================================================================

interface FileUploadFieldProps {
  field: FormField;
  uploadedFiles: UploadedFile[];
  onFileUpload: (files: UploadedFile[]) => void;
  disabled: boolean;
}

function FileUploadField({
  field,
  uploadedFiles,
  onFileUpload,
  disabled,
}: FileUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileConfig = field.fileConfig || DEFAULT_FILE_CONFIG;
  const maxFiles = fileConfig.maxFiles || 1;
  const canUploadMore = uploadedFiles.length < maxFiles;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);

    try {
      const newFiles: UploadedFile[] = [...uploadedFiles];

      for (let i = 0; i < files.length; i++) {
        if (newFiles.length >= maxFiles) break;

        const file = files[i];

        // Validate file type
        if (!fileConfig.allowedTypes.includes(file.type)) {
          setError(`File type not allowed: ${file.name}`);
          continue;
        }

        // Validate file size
        if (file.size > fileConfig.maxSize) {
          const maxMB = Math.round(fileConfig.maxSize / (1024 * 1024));
          setError(`File too large (max ${maxMB}MB): ${file.name}`);
          continue;
        }

        // Upload file
        const formData = new FormData();
        formData.append("file", file);
        formData.append("fieldName", field.name);

        const response = await fetch("/api/forms/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || `Failed to upload: ${file.name}`);
          continue;
        }

        newFiles.push({
          fileId: data.data.fileId,
          filename: data.data.filename,
          size: data.data.size,
          mimeType: data.data.mimeType,
        });
      }

      onFileUpload(newFiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveFile = (fileId: string) => {
    onFileUpload(uploadedFiles.filter((f) => f.fileId !== fileId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImageType = (mimeType: string): boolean => {
    return mimeType.startsWith("image/");
  };

  const labelText = field.required ? `${field.label} *` : field.label;

  // Build accept attribute for file input
  const acceptTypes = fileConfig.allowedTypes.join(",");

  // Get human-readable allowed types
  const allowedTypeLabels = fileConfig.allowedTypes
    .map((type) => FILE_TYPE_LABELS[type] || type)
    .join(", ");

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {labelText}
      </label>

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="mb-3 space-y-2">
          {uploadedFiles.map((file) => (
            <div
              key={file.fileId}
              className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
            >
              {isImageType(file.mimeType) ? (
                <ImageIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
              ) : (
                <FileIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.filename}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveFile(file.fileId)}
                disabled={disabled}
                className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-50"
                aria-label={`Remove ${file.filename}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {canUploadMore && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            disabled || uploading
              ? "border-gray-200 bg-gray-50 cursor-not-allowed"
              : "border-gray-300 hover:border-blue-400 cursor-pointer"
          }`}
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptTypes}
            multiple={maxFiles > 1}
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="sr-only"
            aria-label={field.label}
          />

          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                {allowedTypeLabels}
              </p>
              <p className="text-xs text-gray-500">
                Max {Math.round(fileConfig.maxSize / (1024 * 1024))}MB
                {maxFiles > 1 && ` · Up to ${maxFiles} files`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Help text */}
      {field.helpText && (
        <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
      )}
    </div>
  );
}
