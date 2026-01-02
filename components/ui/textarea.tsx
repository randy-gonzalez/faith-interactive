/**
 * Textarea Component
 *
 * Reusable form textarea with label and error display.
 */

import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`
            block w-full px-3 py-2 border rounded-md shadow-sm text-sm
            border-gray-300
            bg-white
            text-gray-900
            placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:cursor-not-allowed
            ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}
            ${className}
          `}
          rows={4}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
