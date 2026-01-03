// ==============================================================================
// CONFIGURABLE FORMS SYSTEM - TYPE DEFINITIONS
// ==============================================================================
// TypeScript interfaces for the form builder, field definitions, validation,
// and submission handling.
// ==============================================================================

import { FormType } from '@prisma/client';

// ==============================================================================
// FIELD TYPES
// ==============================================================================

export type FormFieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'date'
  | 'file';

// ==============================================================================
// FIELD VALIDATION
// ==============================================================================

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;       // Regex pattern for custom validation
  patternMessage?: string; // Custom error message for pattern mismatch
  min?: string;           // For date fields (ISO date string)
  max?: string;           // For date fields (ISO date string)
}

// ==============================================================================
// SELECT/RADIO OPTIONS
// ==============================================================================

export interface SelectOption {
  label: string;
  value: string;
}

// ==============================================================================
// FILE UPLOAD CONFIG
// ==============================================================================

export interface FileUploadConfig {
  maxSize: number;          // Max file size in bytes (default 10MB = 10485760)
  allowedTypes: string[];   // MIME types (e.g., ['image/jpeg', 'image/png', 'application/pdf'])
  maxFiles: number;         // Max files per field (default 1)
}

// Default file upload configuration
export const DEFAULT_FILE_CONFIG: FileUploadConfig = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  maxFiles: 1,
};

// Allowed MIME types for file uploads
export const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif'],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
} as const;

// Human-readable file type names
export const FILE_TYPE_LABELS: Record<string, string> = {
  'image/jpeg': 'JPEG Image',
  'image/png': 'PNG Image',
  'image/gif': 'GIF Image',
  'application/pdf': 'PDF Document',
  'application/msword': 'Word Document (.doc)',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document (.docx)',
};

// ==============================================================================
// FORM FIELD DEFINITION
// ==============================================================================

export interface FormField {
  id: string;               // Unique field ID (cuid)
  type: FormFieldType;
  name: string;             // Field name/key for form data
  label: string;            // Display label
  placeholder?: string;
  helpText?: string;        // Help text shown below field
  required: boolean;
  order: number;            // Sort order within form

  // Type-specific configurations
  validation?: FieldValidation;
  options?: SelectOption[]; // For select fields
  checkboxLabel?: string;   // For checkbox fields (text next to checkbox)
  fileConfig?: FileUploadConfig; // For file upload fields
}

// ==============================================================================
// FORM SETTINGS
// ==============================================================================

export interface FormSettings {
  successMessage: string;     // Message shown after successful submission
  submitButtonText: string;   // Submit button label

  // Spam protection
  honeypotEnabled: boolean;
  honeypotFieldName: string;  // Randomized field name for honeypot
  minSubmitTime: number;      // Minimum seconds before submission allowed (default 3)
}

// Default form settings
export const DEFAULT_FORM_SETTINGS: FormSettings = {
  successMessage: 'Thank you for your submission!',
  submitButtonText: 'Submit',
  honeypotEnabled: true,
  honeypotFieldName: 'website', // Will be randomized per form
  minSubmitTime: 3,
};

// ==============================================================================
// FORM DATA
// ==============================================================================

export interface Form {
  id: string;
  churchId: string;
  name: string;
  slug: string;
  description?: string | null;
  type: FormType;
  fields: FormField[];
  settings: FormSettings;
  notifyEmails: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Form creation input
export interface CreateFormInput {
  name: string;
  slug: string;
  description?: string;
  type?: FormType;
  fields: FormField[];
  settings?: Partial<FormSettings>;
  notifyEmails?: string[];
  isActive?: boolean;
}

// Form update input
export interface UpdateFormInput {
  name?: string;
  slug?: string;
  description?: string | null;
  fields?: FormField[];
  settings?: Partial<FormSettings>;
  notifyEmails?: string[];
  isActive?: boolean;
}

// ==============================================================================
// FORM SUBMISSION
// ==============================================================================

export interface FormSubmissionFile {
  fieldName: string;
  fileId: string;
  filename: string;
  storedPath: string;
  mimeType: string;
  size: number;
}

export interface FormSubmission {
  id: string;
  churchId: string;
  formId: string;
  data: Record<string, unknown>;
  files?: FormSubmissionFile[] | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  submittedAt: Date;
  isRead: boolean;
  readAt?: Date | null;
  readBy?: string | null;
  createdAt: Date;
}

// Submission with form details (for display)
export interface FormSubmissionWithForm extends FormSubmission {
  form: {
    id: string;
    name: string;
    slug: string;
    type: FormType;
    fields: FormField[];
  };
}

// ==============================================================================
// PUBLIC FORM SUBMISSION INPUT
// ==============================================================================

export interface SubmitFormInput {
  data: Record<string, unknown>;
  files?: string[];           // Array of temporary file IDs
  honeypot?: string;          // Honeypot field value (should be empty)
  timestamp?: string;         // Encrypted timestamp for timing validation
}

// ==============================================================================
// FORM FILE
// ==============================================================================

export interface FormFile {
  id: string;
  churchId: string;
  submissionId?: string | null;
  filename: string;
  storedPath: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
  expiresAt?: Date | null;
}

// ==============================================================================
// API RESPONSE TYPES
// ==============================================================================

export interface FormListResponse {
  forms: Form[];
  total: number;
}

export interface FormSubmissionListResponse {
  submissions: FormSubmission[];
  total: number;
  unreadCount: number;
}

export interface FormSubmitResponse {
  success: boolean;
  message: string;
  submissionId?: string;
}

export interface FileUploadResponse {
  success: boolean;
  fileId: string;
  filename: string;
  size: number;
  mimeType: string;
}

// ==============================================================================
// FIELD TYPE METADATA
// ==============================================================================

export interface FieldTypeMetadata {
  type: FormFieldType;
  label: string;
  description: string;
  icon: string;                // Lucide icon name
  supportsValidation: boolean;
  supportsOptions: boolean;
  supportsFileConfig: boolean;
  defaultValidation?: FieldValidation;
}

export const FIELD_TYPES: FieldTypeMetadata[] = [
  {
    type: 'text',
    label: 'Text',
    description: 'Single-line text input',
    icon: 'Type',
    supportsValidation: true,
    supportsOptions: false,
    supportsFileConfig: false,
    defaultValidation: { maxLength: 255 },
  },
  {
    type: 'email',
    label: 'Email',
    description: 'Email address input with validation',
    icon: 'Mail',
    supportsValidation: true,
    supportsOptions: false,
    supportsFileConfig: false,
    defaultValidation: { maxLength: 255 },
  },
  {
    type: 'phone',
    label: 'Phone',
    description: 'Phone number input',
    icon: 'Phone',
    supportsValidation: true,
    supportsOptions: false,
    supportsFileConfig: false,
    defaultValidation: { maxLength: 20 },
  },
  {
    type: 'textarea',
    label: 'Long Text',
    description: 'Multi-line text area',
    icon: 'AlignLeft',
    supportsValidation: true,
    supportsOptions: false,
    supportsFileConfig: false,
    defaultValidation: { maxLength: 5000 },
  },
  {
    type: 'select',
    label: 'Dropdown',
    description: 'Single selection from options',
    icon: 'ChevronDown',
    supportsValidation: false,
    supportsOptions: true,
    supportsFileConfig: false,
  },
  {
    type: 'checkbox',
    label: 'Checkbox',
    description: 'Single checkbox for yes/no',
    icon: 'CheckSquare',
    supportsValidation: false,
    supportsOptions: false,
    supportsFileConfig: false,
  },
  {
    type: 'date',
    label: 'Date',
    description: 'Date picker',
    icon: 'Calendar',
    supportsValidation: true,
    supportsOptions: false,
    supportsFileConfig: false,
  },
  {
    type: 'file',
    label: 'File Upload',
    description: 'File attachment (images, documents)',
    icon: 'Upload',
    supportsValidation: false,
    supportsOptions: false,
    supportsFileConfig: true,
  },
];

// ==============================================================================
// HELPER FUNCTIONS
// ==============================================================================

/**
 * Get field type metadata by type
 */
export function getFieldTypeMetadata(type: FormFieldType): FieldTypeMetadata | undefined {
  return FIELD_TYPES.find((ft) => ft.type === type);
}

/**
 * Generate a random honeypot field name
 */
export function generateHoneypotFieldName(): string {
  const prefixes = ['website', 'url', 'homepage', 'link', 'site'];
  const suffixes = ['_field', '_input', '_value', '_data', ''];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return `${prefix}${suffix}`;
}

/**
 * Create a new field with defaults
 */
export function createFormField(
  type: FormFieldType,
  order: number,
  overrides?: Partial<FormField>
): FormField {
  const metadata = getFieldTypeMetadata(type);
  const id = `field_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  return {
    id,
    type,
    name: `field_${order}`,
    label: metadata?.label || 'Field',
    required: false,
    order,
    validation: metadata?.defaultValidation,
    ...overrides,
  };
}

/**
 * Validate file against upload config
 */
export function validateFileUpload(
  file: { size: number; type: string },
  config: FileUploadConfig
): { valid: boolean; error?: string } {
  if (file.size > config.maxSize) {
    const maxMB = Math.round(config.maxSize / (1024 * 1024));
    return { valid: false, error: `File size exceeds ${maxMB}MB limit` };
  }

  if (!config.allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }

  return { valid: true };
}
