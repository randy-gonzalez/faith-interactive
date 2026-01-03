/**
 * CRM Validation Schemas
 *
 * Zod schemas for validating CRM-related input data.
 */

import { z } from "zod";

// ==============================================================================
// CRM STAGE SCHEMAS
// ==============================================================================

/**
 * Create stage schema
 */
export const createStageSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  sortOrder: z.number().int().min(0).optional(),
});

export type CreateStageInput = z.infer<typeof createStageSchema>;

/**
 * Update stage schema
 */
export const updateStageSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateStageInput = z.infer<typeof updateStageSchema>;

/**
 * Reorder stages schema
 */
export const reorderStagesSchema = z.object({
  stageIds: z.array(z.string().min(1)).min(1, "At least one stage required"),
});

export type ReorderStagesInput = z.infer<typeof reorderStagesSchema>;

// ==============================================================================
// CRM LEAD SCHEMAS
// ==============================================================================

/**
 * Lead source options
 */
export const LEAD_SOURCES = [
  "referral",
  "inbound",
  "list",
  "event",
  "cold_outreach",
  "website",
  "other",
] as const;

/**
 * Create lead schema
 */
export const createLeadSchema = z.object({
  churchName: z.string().min(1, "Church name is required").max(200, "Church name too long"),
  primaryContactName: z.string().max(100, "Contact name too long").optional().nullable(),
  email: z.string().email("Invalid email").max(255, "Email too long").optional().nullable().or(z.literal("")),
  phone: z.string().max(30, "Phone too long").optional().nullable(),
  website: z.string().url("Invalid URL").max(255, "Website too long").optional().nullable().or(z.literal("")),
  location: z.string().max(100, "Location too long").optional().nullable(),
  stageId: z.string().min(1, "Stage is required"),
  ownerUserId: z.string().optional(), // Only used by FI_ADMIN
  source: z.string().max(50, "Source too long").optional().nullable(),
  notes: z.string().max(10000, "Notes too long").optional().nullable(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

/**
 * Update lead schema
 */
export const updateLeadSchema = z.object({
  churchName: z.string().min(1, "Church name is required").max(200, "Church name too long").optional(),
  primaryContactName: z.string().max(100, "Contact name too long").optional().nullable(),
  email: z.string().email("Invalid email").max(255, "Email too long").optional().nullable().or(z.literal("")),
  phone: z.string().max(30, "Phone too long").optional().nullable(),
  website: z.string().url("Invalid URL").max(255, "Website too long").optional().nullable().or(z.literal("")),
  location: z.string().max(100, "Location too long").optional().nullable(),
  source: z.string().max(50, "Source too long").optional().nullable(),
  notes: z.string().max(10000, "Notes too long").optional().nullable(),
});

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;

/**
 * Change stage schema
 */
export const changeStageSchema = z.object({
  stageId: z.string().min(1, "Stage is required"),
});

export type ChangeStageInput = z.infer<typeof changeStageSchema>;

/**
 * Reassign owner schema (FI_ADMIN only)
 */
export const reassignOwnerSchema = z.object({
  ownerUserId: z.string().min(1, "Owner is required"),
});

export type ReassignOwnerInput = z.infer<typeof reassignOwnerSchema>;

// ==============================================================================
// CRM TASK SCHEMAS
// ==============================================================================

/**
 * Task type options
 */
export const TASK_TYPES = ["CALL", "EMAIL", "TEXT", "MEETING", "INSTAGRAM", "FACEBOOK", "TIKTOK", "TWITTER", "OTHER"] as const;

/**
 * Create task schema
 */
export const createTaskSchema = z.object({
  leadId: z.string().min(1, "Lead is required"),
  type: z.enum(TASK_TYPES, {
    errorMap: () => ({ message: "Invalid task type" }),
  }),
  dueAt: z.string().min(1, "Due date is required"),
  notes: z.string().max(5000, "Notes too long").optional().nullable(),
  // For FI_ADMIN to override DNC restriction
  allowDncOverride: z.boolean().optional().default(false),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

/**
 * Update task schema
 */
export const updateTaskSchema = z.object({
  type: z.enum(TASK_TYPES).optional(),
  dueAt: z.string().optional(),
  notes: z.string().max(5000, "Notes too long").optional().nullable(),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

/**
 * Reschedule task schema
 */
export const rescheduleTaskSchema = z.object({
  dueAt: z.string().min(1, "Due date is required"),
});

export type RescheduleTaskInput = z.infer<typeof rescheduleTaskSchema>;

// ==============================================================================
// CRM DNC SCHEMAS
// ==============================================================================

/**
 * Set DNC schema
 */
export const setDncSchema = z.object({
  reason: z.string().max(500, "Reason too long").optional().nullable(),
});

export type SetDncInput = z.infer<typeof setDncSchema>;

// ==============================================================================
// FILTER/QUERY SCHEMAS
// ==============================================================================

/**
 * Lead list filter schema
 */
export const leadListFilterSchema = z.object({
  stageId: z.string().optional(),
  followUpFilter: z.enum(["overdue", "due_today", "none", "all"]).optional().default("all"),
  showDnc: z.boolean().optional().default(false),
  search: z.string().max(100).optional(),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(25),
});

export type LeadListFilterInput = z.infer<typeof leadListFilterSchema>;

/**
 * Task list filter schema
 */
export const taskListFilterSchema = z.object({
  type: z.enum(TASK_TYPES).optional(),
  stageId: z.string().optional(),
  showDnc: z.boolean().optional().default(false),
});

export type TaskListFilterInput = z.infer<typeof taskListFilterSchema>;
