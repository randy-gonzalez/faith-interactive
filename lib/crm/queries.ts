/**
 * CRM Query Functions
 *
 * Server-side data fetching for CRM pages.
 * All queries enforce RBAC at the query level.
 */

import { prisma } from "@/lib/db/prisma";
import {
  type CrmUser,
  getLeadWhereClause,
  getTaskWhereClause,
  canAccessLead,
  isPlatformAdmin,
} from "./guards";

// ==============================================================================
// TYPES
// ==============================================================================

export interface LeadWithDetails {
  id: string;
  churchName: string;
  primaryContactName: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  location: string | null;
  source: string | null;
  notes: string | null;
  nextFollowUpAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  stage: {
    id: string;
    name: string;
    sortOrder: number;
    isActive: boolean;
  };
  owner: {
    id: string;
    name: string | null;
    email: string;
  };
  dnc: {
    id: string;
    reason: string | null;
    addedAt: Date;
    addedBy: { name: string | null; email: string };
  } | null;
  _count: {
    tasks: number;
  };
}

export interface TaskWithLead {
  id: string;
  type: string;
  dueAt: Date;
  status: string;
  notes: string | null;
  completedAt: Date | null;
  createdAt: Date;
  lead: {
    id: string;
    churchName: string;
    stage: { id: string; name: string };
    dnc: { id: string } | null;
  };
  owner: {
    id: string;
    name: string | null;
    email: string;
  };
}

// ==============================================================================
// STAGE QUERIES
// ==============================================================================

/**
 * Get all stages (active and inactive)
 */
export async function getAllStages() {
  return prisma.crmStage.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

/**
 * Get active stages only
 */
export async function getActiveStages() {
  return prisma.crmStage.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

/**
 * Get first active stage (for default assignment)
 */
export async function getDefaultStage() {
  return prisma.crmStage.findFirst({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

// ==============================================================================
// LEAD QUERIES
// ==============================================================================

/**
 * Get leads with pagination and filtering
 */
export async function getLeads(
  user: CrmUser,
  options: {
    stageId?: string;
    followUpFilter?: "overdue" | "due_today" | "none" | "all";
    showDnc?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<{ leads: LeadWithDetails[]; total: number; pages: number }> {
  const {
    stageId,
    followUpFilter = "all",
    showDnc = false,
    search,
    page = 1,
    limit = 25,
  } = options;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  // Build where clause
  const where: Record<string, unknown> = {
    ...getLeadWhereClause(user),
  };

  if (stageId) {
    where.stageId = stageId;
  }

  if (!showDnc) {
    where.dnc = null;
  }

  if (search) {
    where.OR = [
      { churchName: { contains: search, mode: "insensitive" } },
      { primaryContactName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  // Follow-up filter
  if (followUpFilter === "overdue") {
    where.nextFollowUpAt = { lt: todayStart };
  } else if (followUpFilter === "due_today") {
    where.nextFollowUpAt = { gte: todayStart, lt: todayEnd };
  } else if (followUpFilter === "none") {
    where.nextFollowUpAt = null;
  }

  const [leads, total] = await Promise.all([
    prisma.crmLead.findMany({
      where,
      include: {
        stage: true,
        owner: { select: { id: true, name: true, email: true } },
        dnc: {
          include: {
            addedBy: { select: { name: true, email: true } },
          },
        },
        _count: { select: { tasks: true } },
      },
      orderBy: [
        { nextFollowUpAt: { sort: "asc", nulls: "last" } },
        { updatedAt: "desc" },
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.crmLead.count({ where }),
  ]);

  return {
    leads: leads as LeadWithDetails[],
    total,
    pages: Math.ceil(total / limit),
  };
}

/**
 * Get a single lead by ID
 */
export async function getLead(
  user: CrmUser,
  id: string
): Promise<LeadWithDetails | null> {
  const lead = await prisma.crmLead.findUnique({
    where: { id },
    include: {
      stage: true,
      owner: { select: { id: true, name: true, email: true } },
      dnc: {
        include: {
          addedBy: { select: { name: true, email: true } },
        },
      },
      _count: { select: { tasks: true } },
    },
  });

  if (!lead) return null;

  // Check access
  if (!canAccessLead(user, lead.ownerUserId)) {
    return null; // Return null instead of throwing to avoid leaking existence
  }

  return lead as LeadWithDetails;
}

/**
 * Get leads grouped by stage for Kanban view
 */
export async function getLeadsByStage(user: CrmUser) {
  const stages = await getActiveStages();
  const whereClause = getLeadWhereClause(user);

  const result: Record<string, LeadWithDetails[]> = {};

  for (const stage of stages) {
    const leads = await prisma.crmLead.findMany({
      where: {
        ...whereClause,
        stageId: stage.id,
        dnc: { is: null }, // Don't show DNC leads in Kanban
      },
      include: {
        stage: true,
        owner: { select: { id: true, name: true, email: true } },
        dnc: true,
        _count: { select: { tasks: true } },
      },
      orderBy: [
        { nextFollowUpAt: { sort: "asc", nulls: "last" } },
      ],
      take: 50, // Limit per column
    });

    result[stage.id] = leads as LeadWithDetails[];
  }

  return { stages, leadsByStage: result };
}

// ==============================================================================
// TASK QUERIES
// ==============================================================================

/**
 * Get tasks for the dashboard (My Follow-ups view)
 */
export async function getMyTasks(user: CrmUser): Promise<{
  overdue: TaskWithLead[];
  dueToday: TaskWithLead[];
  upcoming: TaskWithLead[];
}> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);
  const weekEnd = new Date(todayStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const baseWhere = {
    ...getTaskWhereClause(user),
    status: "OPEN" as const,
  };

  const [overdue, dueToday, upcoming] = await Promise.all([
    // Overdue
    prisma.crmTask.findMany({
      where: {
        ...baseWhere,
        dueAt: { lt: todayStart },
      },
      include: {
        lead: {
          select: {
            id: true,
            churchName: true,
            stage: { select: { id: true, name: true } },
            dnc: { select: { id: true } },
          },
        },
        owner: { select: { id: true, name: true, email: true } },
      },
      orderBy: { dueAt: "asc" },
      take: 50,
    }),
    // Due today
    prisma.crmTask.findMany({
      where: {
        ...baseWhere,
        dueAt: { gte: todayStart, lt: todayEnd },
      },
      include: {
        lead: {
          select: {
            id: true,
            churchName: true,
            stage: { select: { id: true, name: true } },
            dnc: { select: { id: true } },
          },
        },
        owner: { select: { id: true, name: true, email: true } },
      },
      orderBy: { dueAt: "asc" },
      take: 50,
    }),
    // Upcoming (next 7 days, excluding today)
    prisma.crmTask.findMany({
      where: {
        ...baseWhere,
        dueAt: { gte: todayEnd, lt: weekEnd },
      },
      include: {
        lead: {
          select: {
            id: true,
            churchName: true,
            stage: { select: { id: true, name: true } },
            dnc: { select: { id: true } },
          },
        },
        owner: { select: { id: true, name: true, email: true } },
      },
      orderBy: { dueAt: "asc" },
      take: 50,
    }),
  ]);

  return {
    overdue: overdue as TaskWithLead[],
    dueToday: dueToday as TaskWithLead[],
    upcoming: upcoming as TaskWithLead[],
  };
}

/**
 * Get tasks for a specific lead
 */
export async function getLeadTasks(
  user: CrmUser,
  leadId: string
): Promise<{ open: TaskWithLead[]; done: TaskWithLead[] }> {
  // First verify lead access
  const lead = await prisma.crmLead.findUnique({
    where: { id: leadId },
    select: { ownerUserId: true },
  });

  if (!lead || !canAccessLead(user, lead.ownerUserId)) {
    return { open: [], done: [] };
  }

  const [open, done] = await Promise.all([
    prisma.crmTask.findMany({
      where: { leadId, status: "OPEN" },
      include: {
        lead: {
          select: {
            id: true,
            churchName: true,
            stage: { select: { id: true, name: true } },
            dnc: { select: { id: true } },
          },
        },
        owner: { select: { id: true, name: true, email: true } },
      },
      orderBy: { dueAt: "asc" },
    }),
    prisma.crmTask.findMany({
      where: { leadId, status: "DONE" },
      include: {
        lead: {
          select: {
            id: true,
            churchName: true,
            stage: { select: { id: true, name: true } },
            dnc: { select: { id: true } },
          },
        },
        owner: { select: { id: true, name: true, email: true } },
      },
      orderBy: { completedAt: "desc" },
      take: 20,
    }),
  ]);

  return {
    open: open as TaskWithLead[],
    done: done as TaskWithLead[],
  };
}

// ==============================================================================
// USER QUERIES (for owner assignment)
// ==============================================================================

/**
 * Get all CRM users (for owner dropdown in PLATFORM_ADMIN view)
 */
export async function getCrmUsers() {
  return prisma.user.findMany({
    where: {
      platformRole: { in: ["PLATFORM_ADMIN", "SALES_REP"] },
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      platformRole: true,
    },
    orderBy: { name: "asc" },
  });
}

// ==============================================================================
// STATS QUERIES
// ==============================================================================

/**
 * Get dashboard stats for the user
 */
export async function getDashboardStats(user: CrmUser) {
  const whereClause = getLeadWhereClause(user);
  const taskWhereClause = getTaskWhereClause(user);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [totalLeads, dncLeads, overdueTaskCount, openTaskCount] = await Promise.all([
    prisma.crmLead.count({ where: whereClause }),
    prisma.crmLead.count({
      where: { ...whereClause, dnc: { isNot: null } },
    }),
    prisma.crmTask.count({
      where: {
        ...taskWhereClause,
        status: "OPEN",
        dueAt: { lt: todayStart },
      },
    }),
    prisma.crmTask.count({
      where: { ...taskWhereClause, status: "OPEN" },
    }),
  ]);

  return {
    totalLeads,
    dncLeads,
    activeLeads: totalLeads - dncLeads,
    overdueTaskCount,
    openTaskCount,
  };
}
