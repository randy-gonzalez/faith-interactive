// ==============================================================================
// FORM VALIDATION UTILITIES
// ==============================================================================
// Dynamic validation for configurable forms based on field definitions.
// Generates Zod schemas and validates submissions against form configuration.
// ==============================================================================

import { z } from 'zod';
import {
  FormField,
  FormSettings,
  FieldValidation,
  FileUploadConfig,
  DEFAULT_FILE_CONFIG,
} from '@/types/forms';

// ==============================================================================
// FIELD VALIDATION SCHEMA BUILDERS
// ==============================================================================

/**
 * Build a Zod schema for a text field
 */
function buildTextFieldSchema(field: FormField): z.ZodTypeAny {
  let schema = z.string();

  if (field.validation?.minLength) {
    schema = schema.min(field.validation.minLength, {
      message: `${field.label} must be at least ${field.validation.minLength} characters`,
    });
  }

  if (field.validation?.maxLength) {
    schema = schema.max(field.validation.maxLength, {
      message: `${field.label} cannot exceed ${field.validation.maxLength} characters`,
    });
  }

  if (field.validation?.pattern) {
    const regex = new RegExp(field.validation.pattern);
    schema = schema.regex(regex, {
      message: field.validation.patternMessage || `${field.label} format is invalid`,
    });
  }

  if (!field.required) {
    return schema.optional().or(z.literal(''));
  }

  return schema.min(1, { message: `${field.label} is required` });
}

/**
 * Build a Zod schema for an email field
 */
function buildEmailFieldSchema(field: FormField): z.ZodTypeAny {
  let schema = z.string().email({ message: 'Please enter a valid email address' });

  if (field.validation?.maxLength) {
    schema = schema.max(field.validation.maxLength);
  }

  if (!field.required) {
    return schema.optional().or(z.literal(''));
  }

  return schema;
}

/**
 * Build a Zod schema for a phone field
 */
function buildPhoneFieldSchema(field: FormField): z.ZodTypeAny {
  // Basic phone validation - allows various formats
  let schema = z.string();

  if (field.validation?.maxLength) {
    schema = schema.max(field.validation.maxLength);
  }

  // Phone regex: allows digits, spaces, dashes, parentheses, plus sign
  if (field.validation?.pattern) {
    schema = schema.regex(new RegExp(field.validation.pattern), {
      message: field.validation.patternMessage || 'Please enter a valid phone number',
    });
  } else {
    // Default phone pattern
    schema = schema.regex(/^[\d\s\-()+ ]*$/, {
      message: 'Please enter a valid phone number',
    });
  }

  if (!field.required) {
    return schema.optional().or(z.literal(''));
  }

  return schema.min(1, { message: `${field.label} is required` });
}

/**
 * Build a Zod schema for a textarea field
 */
function buildTextareaFieldSchema(field: FormField): z.ZodTypeAny {
  // Same as text but typically with larger maxLength
  return buildTextFieldSchema(field);
}

/**
 * Build a Zod schema for a select field
 */
function buildSelectFieldSchema(field: FormField): z.ZodTypeAny {
  const validValues = field.options?.map((opt) => opt.value) || [];

  if (validValues.length === 0) {
    // No options defined - accept any string
    if (!field.required) {
      return z.string().optional().or(z.literal(''));
    }
    return z.string().min(1, { message: `${field.label} is required` });
  }

  const schema = z.enum(validValues as [string, ...string[]], {
    errorMap: () => ({ message: `Please select a valid option for ${field.label}` }),
  });

  if (!field.required) {
    return schema.optional().or(z.literal(''));
  }

  return schema;
}

/**
 * Build a Zod schema for a checkbox field
 */
function buildCheckboxFieldSchema(field: FormField): z.ZodTypeAny {
  const schema = z.boolean();

  if (field.required) {
    return schema.refine((val) => val === true, {
      message: `${field.label} is required`,
    });
  }

  return schema.optional().default(false);
}

/**
 * Build a Zod schema for a date field
 */
function buildDateFieldSchema(field: FormField): z.ZodTypeAny {
  const baseSchema = z.string();

  // Build all validations into a single refine
  const schema = baseSchema.refine(
    (val) => {
      // Empty value handling
      if (!val) return !field.required;

      // Validate date format
      const date = new Date(val);
      if (isNaN(date.getTime())) return false;

      // Validate min date
      if (field.validation?.min) {
        const minDate = new Date(field.validation.min);
        if (date < minDate) return false;
      }

      // Validate max date
      if (field.validation?.max) {
        const maxDate = new Date(field.validation.max);
        if (date > maxDate) return false;
      }

      return true;
    },
    { message: 'Please enter a valid date' }
  );

  if (!field.required) {
    return schema.optional().or(z.literal(''));
  }

  return schema;
}

/**
 * Build a Zod schema for a file field
 * Note: This validates the file IDs array, not the actual files
 */
function buildFileFieldSchema(field: FormField): z.ZodTypeAny {
  const config = field.fileConfig || DEFAULT_FILE_CONFIG;

  let schema = z.array(z.string()).max(config.maxFiles, {
    message: `Maximum ${config.maxFiles} file(s) allowed`,
  });

  if (field.required) {
    schema = schema.min(1, { message: `${field.label} is required` });
  }

  if (!field.required) {
    return schema.optional().default([]);
  }

  return schema;
}

// ==============================================================================
// SCHEMA BUILDER
// ==============================================================================

/**
 * Build a Zod schema for a single form field
 */
export function buildFieldSchema(field: FormField): z.ZodTypeAny {
  switch (field.type) {
    case 'text':
      return buildTextFieldSchema(field);
    case 'email':
      return buildEmailFieldSchema(field);
    case 'phone':
      return buildPhoneFieldSchema(field);
    case 'textarea':
      return buildTextareaFieldSchema(field);
    case 'select':
      return buildSelectFieldSchema(field);
    case 'checkbox':
      return buildCheckboxFieldSchema(field);
    case 'date':
      return buildDateFieldSchema(field);
    case 'file':
      return buildFileFieldSchema(field);
    default:
      // Unknown field type - accept any string
      return z.string().optional();
  }
}

/**
 * Build a complete Zod schema for a form based on field definitions
 */
export function buildFormSchema(fields: FormField[], settings?: FormSettings): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const schemaShape: Record<string, z.ZodTypeAny> = {};

  // Build schema for each field
  for (const field of fields) {
    schemaShape[field.name] = buildFieldSchema(field);
  }

  // Add honeypot field if enabled
  if (settings?.honeypotEnabled && settings.honeypotFieldName) {
    schemaShape[settings.honeypotFieldName] = z
      .string()
      .max(0, { message: 'This field should be empty' })
      .optional();
  }

  return z.object(schemaShape);
}

// ==============================================================================
// VALIDATION FUNCTIONS
// ==============================================================================

export interface ValidationResult {
  success: boolean;
  data?: Record<string, unknown>;
  errors?: Record<string, string>;
}

/**
 * Validate form submission data against form configuration
 */
export function validateFormSubmission(
  data: Record<string, unknown>,
  fields: FormField[],
  settings?: FormSettings
): ValidationResult {
  const schema = buildFormSchema(fields, settings);

  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      for (const issue of error.issues) {
        const path = issue.path.join('.');
        if (!errors[path]) {
          errors[path] = issue.message;
        }
      }
      return { success: false, errors };
    }
    throw error;
  }
}

/**
 * Format validation errors for API response
 */
export function formatValidationErrors(errors: Record<string, string>): string {
  const messages = Object.entries(errors).map(([field, message]) => `${field}: ${message}`);
  return messages.join('; ');
}

// ==============================================================================
// FILE VALIDATION
// ==============================================================================

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate a file against upload configuration
 */
export function validateFile(
  file: { size: number; type: string; name: string },
  config: FileUploadConfig = DEFAULT_FILE_CONFIG
): FileValidationResult {
  // Check file size
  if (file.size > config.maxSize) {
    const maxMB = Math.round(config.maxSize / (1024 * 1024));
    return { valid: false, error: `File "${file.name}" exceeds the ${maxMB}MB size limit` };
  }

  // Check MIME type
  if (!config.allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type "${file.type}" is not allowed` };
  }

  // Check for suspicious file extensions in the name
  const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.ps1', '.vbs', '.js'];
  const lowerName = file.name.toLowerCase();
  for (const ext of suspiciousExtensions) {
    if (lowerName.endsWith(ext)) {
      return { valid: false, error: `File extension "${ext}" is not allowed` };
    }
  }

  return { valid: true };
}

/**
 * Validate multiple files against configuration
 */
export function validateFiles(
  files: Array<{ size: number; type: string; name: string }>,
  config: FileUploadConfig = DEFAULT_FILE_CONFIG
): FileValidationResult {
  // Check max files
  if (files.length > config.maxFiles) {
    return { valid: false, error: `Maximum ${config.maxFiles} file(s) allowed` };
  }

  // Validate each file
  for (const file of files) {
    const result = validateFile(file, config);
    if (!result.valid) {
      return result;
    }
  }

  return { valid: true };
}

// ==============================================================================
// FORM CONFIGURATION VALIDATION
// ==============================================================================

/**
 * Zod schema for validating form field configuration
 */
export const formFieldConfigSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['text', 'email', 'phone', 'textarea', 'select', 'checkbox', 'date', 'file']),
  name: z.string().min(1).max(50).regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
    message: 'Field name must start with a letter or underscore and contain only letters, numbers, and underscores',
  }),
  label: z.string().min(1).max(100),
  placeholder: z.string().max(200).optional(),
  helpText: z.string().max(500).optional(),
  required: z.boolean(),
  order: z.number().int().min(0),
  validation: z
    .object({
      minLength: z.number().int().min(0).optional(),
      maxLength: z.number().int().min(1).optional(),
      pattern: z.string().max(500).optional(),
      patternMessage: z.string().max(200).optional(),
      min: z.string().optional(),
      max: z.string().optional(),
    })
    .optional(),
  options: z
    .array(
      z.object({
        label: z.string().min(1).max(100),
        value: z.string().min(1).max(100),
      })
    )
    .max(50)
    .optional(),
  checkboxLabel: z.string().max(200).optional(),
  fileConfig: z
    .object({
      maxSize: z.number().int().min(1).max(50 * 1024 * 1024), // Max 50MB
      allowedTypes: z.array(z.string()).min(1).max(20),
      maxFiles: z.number().int().min(1).max(10),
    })
    .optional(),
});

/**
 * Zod schema for validating form settings
 */
export const formSettingsSchema = z.object({
  successMessage: z.string().min(1).max(1000),
  submitButtonText: z.string().min(1).max(50),
  honeypotEnabled: z.boolean(),
  honeypotFieldName: z.string().min(1).max(50),
  minSubmitTime: z.number().int().min(0).max(60),
});

/**
 * Zod schema for creating a new form
 */
export const createFormSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: 'Slug must be lowercase letters, numbers, and hyphens only',
    }),
  description: z.string().max(500).optional(),
  type: z.enum(['CONTACT', 'PRAYER_REQUEST', 'VOLUNTEER', 'CUSTOM']).optional(),
  fields: z.array(formFieldConfigSchema).min(1).max(50),
  settings: formSettingsSchema.partial().optional(),
  notifyEmails: z.array(z.string().email()).max(10).optional(),
  isActive: z.boolean().optional(),
});

/**
 * Zod schema for updating a form
 */
export const updateFormSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: 'Slug must be lowercase letters, numbers, and hyphens only',
    })
    .optional(),
  description: z.string().max(500).nullable().optional(),
  fields: z.array(formFieldConfigSchema).min(1).max(50).optional(),
  settings: formSettingsSchema.partial().optional(),
  notifyEmails: z.array(z.string().email()).max(10).optional(),
  isActive: z.boolean().optional(),
});

/**
 * Validate form configuration
 */
export function validateFormConfig(config: unknown): ValidationResult {
  try {
    const data = createFormSchema.parse(config);
    return { success: true, data: data as unknown as Record<string, unknown> };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      for (const issue of error.issues) {
        const path = issue.path.join('.');
        if (!errors[path]) {
          errors[path] = issue.message;
        }
      }
      return { success: false, errors };
    }
    throw error;
  }
}
