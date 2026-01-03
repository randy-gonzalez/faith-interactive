// ==============================================================================
// DEFAULT FORM CONFIGURATIONS
// ==============================================================================
// Pre-configured forms for Contact, Prayer Request, and Volunteer Application.
// These are created automatically when a new church is set up.
// ==============================================================================

import { FormType } from '@prisma/client';
import {
  FormField,
  FormSettings,
  generateHoneypotFieldName,
  DEFAULT_FILE_CONFIG,
} from '@/types/forms';

// ==============================================================================
// CONTACT FORM
// ==============================================================================

export const CONTACT_FORM_FIELDS: FormField[] = [
  {
    id: 'contact_name',
    type: 'text',
    name: 'name',
    label: 'Name',
    placeholder: 'Your name',
    required: true,
    order: 1,
    validation: { minLength: 1, maxLength: 100 },
  },
  {
    id: 'contact_email',
    type: 'email',
    name: 'email',
    label: 'Email',
    placeholder: 'your@email.com',
    required: true,
    order: 2,
    validation: { maxLength: 255 },
  },
  {
    id: 'contact_phone',
    type: 'phone',
    name: 'phone',
    label: 'Phone',
    placeholder: '(555) 123-4567',
    helpText: 'Optional',
    required: false,
    order: 3,
    validation: { maxLength: 20 },
  },
  {
    id: 'contact_message',
    type: 'textarea',
    name: 'message',
    label: 'Message',
    placeholder: 'How can we help you?',
    required: true,
    order: 4,
    validation: { minLength: 1, maxLength: 5000 },
  },
];

export const CONTACT_FORM_SETTINGS: FormSettings = {
  successMessage: "Thank you for your message! We'll be in touch soon.",
  submitButtonText: 'Send Message',
  honeypotEnabled: true,
  honeypotFieldName: generateHoneypotFieldName(),
  minSubmitTime: 3,
};

// ==============================================================================
// PRAYER REQUEST FORM
// ==============================================================================

export const PRAYER_REQUEST_FIELDS: FormField[] = [
  {
    id: 'prayer_name',
    type: 'text',
    name: 'name',
    label: 'Name',
    placeholder: 'Your name (optional)',
    helpText: 'You may submit anonymously',
    required: false,
    order: 1,
    validation: { maxLength: 100 },
  },
  {
    id: 'prayer_email',
    type: 'email',
    name: 'email',
    label: 'Email',
    placeholder: 'your@email.com (optional)',
    helpText: 'Only if you would like us to follow up',
    required: false,
    order: 2,
    validation: { maxLength: 255 },
  },
  {
    id: 'prayer_request',
    type: 'textarea',
    name: 'request',
    label: 'Prayer Request',
    placeholder: 'Share your prayer request...',
    helpText: 'Your request will be kept confidential',
    required: true,
    order: 3,
    validation: { minLength: 1, maxLength: 5000 },
  },
];

export const PRAYER_REQUEST_SETTINGS: FormSettings = {
  successMessage: 'Thank you for sharing your prayer request. Our prayer team will be praying for you.',
  submitButtonText: 'Submit Prayer Request',
  honeypotEnabled: true,
  honeypotFieldName: generateHoneypotFieldName(),
  minSubmitTime: 3,
};

// ==============================================================================
// VOLUNTEER APPLICATION FORM
// ==============================================================================

export const VOLUNTEER_FORM_FIELDS: FormField[] = [
  {
    id: 'volunteer_name',
    type: 'text',
    name: 'name',
    label: 'Name',
    placeholder: 'Your full name',
    required: true,
    order: 1,
    validation: { minLength: 1, maxLength: 100 },
  },
  {
    id: 'volunteer_email',
    type: 'email',
    name: 'email',
    label: 'Email',
    placeholder: 'your@email.com',
    required: true,
    order: 2,
    validation: { maxLength: 255 },
  },
  {
    id: 'volunteer_phone',
    type: 'phone',
    name: 'phone',
    label: 'Phone',
    placeholder: '(555) 123-4567',
    helpText: 'Best number to reach you',
    required: false,
    order: 3,
    validation: { maxLength: 20 },
  },
  {
    id: 'volunteer_interests',
    type: 'select',
    name: 'interests',
    label: 'Area of Interest',
    placeholder: 'Select an area',
    helpText: 'Where would you like to serve?',
    required: true,
    order: 4,
    options: [
      { label: 'Worship & Music', value: 'worship' },
      { label: 'Children\'s Ministry', value: 'children' },
      { label: 'Youth Ministry', value: 'youth' },
      { label: 'Welcome Team / Greeters', value: 'welcome' },
      { label: 'Audio / Visual / Tech', value: 'tech' },
      { label: 'Hospitality / Food Service', value: 'hospitality' },
      { label: 'Small Groups', value: 'small_groups' },
      { label: 'Outreach / Missions', value: 'outreach' },
      { label: 'Administrative Support', value: 'admin' },
      { label: 'Other', value: 'other' },
    ],
  },
  {
    id: 'volunteer_experience',
    type: 'textarea',
    name: 'experience',
    label: 'Tell Us About Yourself',
    placeholder: 'Share any relevant experience or why you would like to serve in this area...',
    helpText: 'Optional, but helps us find the best fit',
    required: false,
    order: 5,
    validation: { maxLength: 2000 },
  },
  {
    id: 'volunteer_availability',
    type: 'select',
    name: 'availability',
    label: 'Availability',
    placeholder: 'Select your availability',
    required: true,
    order: 6,
    options: [
      { label: 'Weekly', value: 'weekly' },
      { label: 'Bi-weekly', value: 'biweekly' },
      { label: 'Monthly', value: 'monthly' },
      { label: 'As needed', value: 'as_needed' },
    ],
  },
];

export const VOLUNTEER_FORM_SETTINGS: FormSettings = {
  successMessage: 'Thank you for your interest in serving! Someone from our team will be in touch with you soon.',
  submitButtonText: 'Submit Application',
  honeypotEnabled: true,
  honeypotFieldName: generateHoneypotFieldName(),
  minSubmitTime: 3,
};

// ==============================================================================
// DEFAULT FORM CONFIGURATIONS
// ==============================================================================

export interface DefaultFormConfig {
  type: FormType;
  name: string;
  slug: string;
  description: string;
  fields: FormField[];
  settings: FormSettings;
}

export const DEFAULT_FORMS: DefaultFormConfig[] = [
  {
    type: 'CONTACT',
    name: 'Contact Form',
    slug: 'contact',
    description: 'Have a question or want to get in touch? Send us a message.',
    fields: CONTACT_FORM_FIELDS,
    settings: CONTACT_FORM_SETTINGS,
  },
  {
    type: 'PRAYER_REQUEST',
    name: 'Prayer Request',
    slug: 'prayer-request',
    description: 'Submit a prayer request and our prayer team will be praying for you.',
    fields: PRAYER_REQUEST_FIELDS,
    settings: PRAYER_REQUEST_SETTINGS,
  },
  {
    type: 'VOLUNTEER',
    name: 'Volunteer Application',
    slug: 'volunteer',
    description: 'Join our team of volunteers and make a difference in our community.',
    fields: VOLUNTEER_FORM_FIELDS,
    settings: VOLUNTEER_FORM_SETTINGS,
  },
];

// ==============================================================================
// HELPER FUNCTIONS
// ==============================================================================

/**
 * Get default form configuration by type
 */
export function getDefaultFormConfig(type: FormType): DefaultFormConfig | undefined {
  return DEFAULT_FORMS.find((form) => form.type === type);
}

/**
 * Check if a form type is a default/system form
 */
export function isDefaultFormType(type: FormType): boolean {
  return type === 'CONTACT' || type === 'PRAYER_REQUEST' || type === 'VOLUNTEER';
}

/**
 * Create default forms for a church
 * Returns form data ready to be inserted into database
 */
export function createDefaultFormsData(churchId: string): Array<{
  churchId: string;
  name: string;
  slug: string;
  description: string;
  type: FormType;
  fields: FormField[];
  settings: FormSettings;
  notifyEmails: string[];
  isActive: boolean;
}> {
  return DEFAULT_FORMS.map((form) => ({
    churchId,
    name: form.name,
    slug: form.slug,
    description: form.description,
    type: form.type as FormType,
    fields: form.fields,
    settings: {
      ...form.settings,
      honeypotFieldName: generateHoneypotFieldName(), // Unique per church
    },
    notifyEmails: [],
    isActive: true,
  }));
}
