"use server";

/**
 * CRM Server Actions
 *
 * All CRM mutations go through these server actions.
 * Each action enforces RBAC and validates input.
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import {
  requireCrmUser,
  requirePlatformAdmin,
  requireLeadAccess,
  getLeadOwnerForCreate,
  canAccessLead,
  canCreateContactTaskForDnc,
  isPlatformAdmin,
  type CrmUser,
} from "./guards";
import {
  createStageSchema,
  updateStageSchema,
  reorderStagesSchema,
  createLeadSchema,
  updateLeadSchema,
  changeStageSchema,
  reassignOwnerSchema,
  createTaskSchema,
  updateTaskSchema,
  rescheduleTaskSchema,
  setDncSchema,
  type CreateStageInput,
  type UpdateStageInput,
  type CreateLeadInput,
  type UpdateLeadInput,
  type CreateTaskInput,
  type SetDncInput,
  type RescheduleTaskInput,
} from "./schemas";

// ==============================================================================
// HELPER: Update lead's nextFollowUpAt
// ==============================================================================

async function updateLeadNextFollowUp(leadId: string): Promise<void> {
  const earliestTask = await prisma.crmTask.findFirst({
    where: {
      leadId,
      status: "OPEN",
    },
    orderBy: { dueAt: "asc" },
    select: { dueAt: true },
  });

  await prisma.crmLead.update({
    where: { id: leadId },
    data: { nextFollowUpAt: earliestTask?.dueAt ?? null },
  });
}

// ==============================================================================
// STAGE ACTIONS
// ==============================================================================

/**
 * Create a new stage (FI_ADMIN only)
 */
export async function createStage(input: CreateStageInput): Promise<
  { success: true; stage: Awaited<ReturnType<typeof prisma.crmStage.create>> } |
  { success: false; error: string }
> {
  try {
    await requirePlatformAdmin();
    const validated = createStageSchema.parse(input);

    // Get max sort order
    const maxOrder = await prisma.crmStage.aggregate({
      _max: { sortOrder: true },
    });

    const stage = await prisma.crmStage.create({
      data: {
        name: validated.name,
        sortOrder: validated.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
      },
    });

    revalidatePath("/platform/crm");
    return { success: true, stage };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create stage" };
  }
}

/**
 * Update a stage (FI_ADMIN only)
 */
export async function updateStage(id: string, input: UpdateStageInput) {
  const user = await requirePlatformAdmin();
  const validated = updateStageSchema.parse(input);

  // If deactivating, ensure at least one active stage remains
  if (validated.isActive === false) {
    const activeCount = await prisma.crmStage.count({
      where: { isActive: true, id: { not: id } },
    });
    if (activeCount === 0) {
      return { success: false, error: "Cannot deactivate the last active stage" };
    }
  }

  const stage = await prisma.crmStage.update({
    where: { id },
    data: validated,
  });

  revalidatePath("/platform/crm");
  return { success: true, stage };
}

/**
 * Reorder stages (FI_ADMIN only)
 */
export async function reorderStages(stageIds: string[]) {
  const user = await requirePlatformAdmin();
  reorderStagesSchema.parse({ stageIds });

  // Update each stage with its new order
  await prisma.$transaction(
    stageIds.map((id, index) =>
      prisma.crmStage.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );

  revalidatePath("/platform/crm");
  return { success: true };
}

/**
 * Toggle stage active status (FI_ADMIN only)
 */
export async function toggleStageActive(id: string) {
  const user = await requirePlatformAdmin();

  const stage = await prisma.crmStage.findUnique({ where: { id } });
  if (!stage) {
    return { success: false, error: "Stage not found" };
  }

  // If activating, just do it
  if (!stage.isActive) {
    await prisma.crmStage.update({
      where: { id },
      data: { isActive: true },
    });
    revalidatePath("/platform/crm");
    return { success: true };
  }

  // If deactivating, ensure at least one active stage remains
  const activeCount = await prisma.crmStage.count({
    where: { isActive: true, id: { not: id } },
  });
  if (activeCount === 0) {
    return { success: false, error: "Cannot deactivate the last active stage" };
  }

  await prisma.crmStage.update({
    where: { id },
    data: { isActive: false },
  });

  revalidatePath("/platform/crm");
  return { success: true };
}

// ==============================================================================
// LEAD ACTIONS
// ==============================================================================

/**
 * Create a new lead
 */
export async function createLead(input: CreateLeadInput): Promise<
  { success: true; lead: Awaited<ReturnType<typeof prisma.crmLead.create>> } |
  { success: false; error: string }
> {
  try {
    const user = await requireCrmUser();
    const validated = createLeadSchema.parse(input);

    // Determine owner (SALES_REP always gets self, FI_ADMIN can specify)
    const ownerUserId = getLeadOwnerForCreate(user, validated.ownerUserId);

    const lead = await prisma.crmLead.create({
      data: {
        churchName: validated.churchName,
        primaryContactName: validated.primaryContactName || null,
        email: validated.email || null,
        phone: validated.phone || null,
        website: validated.website || null,
        location: validated.location || null,
        stageId: validated.stageId,
        ownerUserId,
        source: validated.source || null,
        notes: validated.notes || null,
      },
      include: {
        stage: true,
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    revalidatePath("/platform/crm");
    return { success: true, lead };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create lead" };
  }
}

/**
 * Update a lead
 */
export async function updateLead(id: string, input: UpdateLeadInput) {
  const user = await requireCrmUser();
  const validated = updateLeadSchema.parse(input);

  // Check access
  const lead = await prisma.crmLead.findUnique({
    where: { id },
    select: { ownerUserId: true },
  });
  if (!lead) {
    return { success: false, error: "Lead not found" };
  }
  requireLeadAccess(user, lead.ownerUserId);

  const updatedLead = await prisma.crmLead.update({
    where: { id },
    data: {
      ...validated,
      email: validated.email || null,
      website: validated.website || null,
    },
    include: {
      stage: true,
      owner: { select: { id: true, name: true, email: true } },
    },
  });

  revalidatePath("/platform/crm");
  return { success: true, lead: updatedLead };
}

/**
 * Change lead stage
 */
export async function changeLeadStage(leadId: string, stageId: string) {
  const user = await requireCrmUser();
  changeStageSchema.parse({ stageId });

  // Check access
  const lead = await prisma.crmLead.findUnique({
    where: { id: leadId },
    select: { ownerUserId: true },
  });
  if (!lead) {
    return { success: false, error: "Lead not found" };
  }
  requireLeadAccess(user, lead.ownerUserId);

  // Verify stage exists and is active
  const stage = await prisma.crmStage.findUnique({ where: { id: stageId } });
  if (!stage || !stage.isActive) {
    return { success: false, error: "Invalid stage" };
  }

  await prisma.crmLead.update({
    where: { id: leadId },
    data: { stageId },
  });

  revalidatePath("/platform/crm");
  return { success: true };
}

/**
 * Reassign lead owner (FI_ADMIN only)
 */
export async function reassignLeadOwner(leadId: string, ownerUserId: string) {
  const user = await requirePlatformAdmin();
  reassignOwnerSchema.parse({ ownerUserId });

  // Verify user exists and has CRM access
  const newOwner = await prisma.user.findUnique({
    where: { id: ownerUserId },
    select: { platformRole: true },
  });
  if (!newOwner || (newOwner.platformRole !== "PLATFORM_ADMIN" && newOwner.platformRole !== "SALES_REP")) {
    return { success: false, error: "Invalid owner - must be a CRM user" };
  }

  await prisma.crmLead.update({
    where: { id: leadId },
    data: { ownerUserId },
  });

  revalidatePath("/platform/crm");
  return { success: true };
}

// ==============================================================================
// DNC ACTIONS
// ==============================================================================

/**
 * Set DNC (Do Not Contact) on a lead
 */
export async function setDnc(leadId: string, input: SetDncInput) {
  const user = await requireCrmUser();
  const validated = setDncSchema.parse(input);

  // Check access
  const lead = await prisma.crmLead.findUnique({
    where: { id: leadId },
    select: { ownerUserId: true },
  });
  if (!lead) {
    return { success: false, error: "Lead not found" };
  }
  requireLeadAccess(user, lead.ownerUserId);

  // Upsert DNC record
  await prisma.crmDnc.upsert({
    where: { leadId },
    create: {
      leadId,
      reason: validated.reason || null,
      addedByUserId: user.id,
    },
    update: {
      reason: validated.reason || null,
      addedByUserId: user.id,
      addedAt: new Date(),
    },
  });

  revalidatePath("/platform/crm");
  return { success: true };
}

/**
 * Clear DNC from a lead
 */
export async function clearDnc(leadId: string) {
  const user = await requireCrmUser();

  // Check access
  const lead = await prisma.crmLead.findUnique({
    where: { id: leadId },
    select: { ownerUserId: true },
  });
  if (!lead) {
    return { success: false, error: "Lead not found" };
  }
  requireLeadAccess(user, lead.ownerUserId);

  await prisma.crmDnc.delete({
    where: { leadId },
  }).catch(() => {
    // Ignore if not found
  });

  revalidatePath("/platform/crm");
  return { success: true };
}

// ==============================================================================
// TASK ACTIONS
// ==============================================================================

/**
 * Create a task
 */
export async function createTask(input: CreateTaskInput): Promise<
  { success: true; task: Awaited<ReturnType<typeof prisma.crmTask.create>> } |
  { success: false; error: string }
> {
  try {
    const user = await requireCrmUser();
    const validated = createTaskSchema.parse(input);

    // Check lead access
    const lead = await prisma.crmLead.findUnique({
      where: { id: validated.leadId },
      include: { dnc: true },
    });
    if (!lead) {
      return { success: false, error: "Lead not found" };
    }
    requireLeadAccess(user, lead.ownerUserId);

    // Check DNC restrictions for contact tasks
    const isDnc = !!lead.dnc;
    const dncCheck = canCreateContactTaskForDnc(
      user,
      validated.type,
      isDnc,
      validated.allowDncOverride
    );
    if (!dncCheck.allowed) {
      return { success: false, error: dncCheck.reason || "DNC restriction prevents this action" };
    }

    const task = await prisma.crmTask.create({
      data: {
        leadId: validated.leadId,
        ownerUserId: user.id,
        type: validated.type,
        dueAt: new Date(validated.dueAt),
        notes: validated.notes || null,
      },
    });

    // Update lead's nextFollowUpAt
    await updateLeadNextFollowUp(validated.leadId);

    revalidatePath("/platform/crm");
    return { success: true, task };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create task" };
  }
}

/**
 * Update a task
 */
export async function updateTask(id: string, input: Partial<CreateTaskInput>) {
  const user = await requireCrmUser();

  // Get task and check access via lead
  const task = await prisma.crmTask.findUnique({
    where: { id },
    include: { lead: { select: { ownerUserId: true } } },
  });
  if (!task) {
    return { success: false, error: "Task not found" };
  }
  requireLeadAccess(user, task.lead.ownerUserId);

  const updateData: Record<string, unknown> = {};
  if (input.type) updateData.type = input.type;
  if (input.dueAt) updateData.dueAt = new Date(input.dueAt);
  if (input.notes !== undefined) updateData.notes = input.notes || null;

  await prisma.crmTask.update({
    where: { id },
    data: updateData,
  });

  // Update lead's nextFollowUpAt
  await updateLeadNextFollowUp(task.leadId);

  revalidatePath("/platform/crm");
  return { success: true };
}

/**
 * Mark task as done
 */
export async function markTaskDone(id: string) {
  const user = await requireCrmUser();

  // Get task and check access via lead
  const task = await prisma.crmTask.findUnique({
    where: { id },
    include: { lead: { select: { ownerUserId: true } } },
  });
  if (!task) {
    return { success: false, error: "Task not found" };
  }
  requireLeadAccess(user, task.lead.ownerUserId);

  await prisma.crmTask.update({
    where: { id },
    data: {
      status: "DONE",
      completedAt: new Date(),
    },
  });

  // Update lead's nextFollowUpAt
  await updateLeadNextFollowUp(task.leadId);

  revalidatePath("/platform/crm");
  return { success: true };
}

/**
 * Reschedule a task
 */
export async function rescheduleTask(id: string, input: RescheduleTaskInput) {
  const user = await requireCrmUser();
  const validated = rescheduleTaskSchema.parse(input);

  // Get task and check access via lead
  const task = await prisma.crmTask.findUnique({
    where: { id },
    include: { lead: { select: { ownerUserId: true } } },
  });
  if (!task) {
    return { success: false, error: "Task not found" };
  }
  requireLeadAccess(user, task.lead.ownerUserId);

  await prisma.crmTask.update({
    where: { id },
    data: {
      dueAt: new Date(validated.dueAt),
      status: "OPEN", // Reopen if it was done
      completedAt: null,
    },
  });

  // Update lead's nextFollowUpAt
  await updateLeadNextFollowUp(task.leadId);

  revalidatePath("/platform/crm");
  return { success: true };
}

// ==============================================================================
// SEED STAGES (One-time setup)
// ==============================================================================

/**
 * Seed default stages if none exist
 */
export async function seedDefaultStages() {
  const existingCount = await prisma.crmStage.count();
  if (existingCount > 0) {
    return { success: true, message: "Stages already exist" };
  }

  const defaultStages = [
    { name: "New", sortOrder: 0 },
    { name: "Contacted", sortOrder: 1 },
    { name: "Qualified", sortOrder: 2 },
    { name: "Demo Scheduled", sortOrder: 3 },
    { name: "Proposal Sent", sortOrder: 4 },
    { name: "Won", sortOrder: 5 },
    { name: "Lost", sortOrder: 6 },
  ];

  await prisma.crmStage.createMany({ data: defaultStages });

  return { success: true, message: "Default stages created" };
}
