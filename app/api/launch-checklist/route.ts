/**
 * Launch Checklist API Routes
 *
 * GET /api/launch-checklist - Get all checklist items with completion status
 * POST /api/launch-checklist - Update checklist item status (Admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getAuthContext } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";
import { z } from "zod";
import { formatZodError } from "@/lib/validation/schemas";

/**
 * Predefined checklist items for all churches.
 * These are the standard launch tasks.
 */
export const LAUNCH_CHECKLIST_ITEMS = [
  {
    key: "domain_added",
    label: "Custom domain added",
    description: "Add your custom domain (e.g., www.yourchurch.org)",
    category: "domain",
  },
  {
    key: "domain_verified",
    label: "Domain verified",
    description: "Verify domain ownership via DNS TXT record",
    category: "domain",
  },
  {
    key: "domain_pointed",
    label: "Domain pointed to servers",
    description: "Configure DNS CNAME/A record to point to Faith Interactive",
    category: "domain",
  },
  {
    key: "ssl_active",
    label: "SSL certificate active",
    description: "Ensure HTTPS is working on your custom domain",
    category: "domain",
  },
  {
    key: "logo_uploaded",
    label: "Logo uploaded",
    description: "Upload your church logo in Site Settings",
    category: "branding",
  },
  {
    key: "header_configured",
    label: "Header navigation configured",
    description: "Set up your main navigation menu",
    category: "branding",
  },
  {
    key: "footer_configured",
    label: "Footer configured",
    description: "Add footer links and social media URLs",
    category: "branding",
  },
  {
    key: "contact_info",
    label: "Contact information added",
    description: "Add service times, address, phone, and email",
    category: "content",
  },
  {
    key: "home_page",
    label: "Home page published",
    description: "Create and publish your home page content",
    category: "content",
  },
  {
    key: "about_page",
    label: "About page published",
    description: "Create and publish your about page",
    category: "content",
  },
] as const;

// Validation schema for updating checklist item
const updateChecklistSchema = z.object({
  itemKey: z.string().refine(
    (key) => LAUNCH_CHECKLIST_ITEMS.some((item) => item.key === key),
    "Invalid checklist item key"
  ),
  isComplete: z.boolean(),
  notes: z.string().max(500).optional(),
});

/**
 * GET /api/launch-checklist
 * Get all checklist items with completion status for the church.
 * Admin only.
 */
export async function GET() {
  try {
    const context = await getAuthContext();
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Require admin role
    if (context.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get completed items from database
    const completedItems = await prisma.launchChecklistItem.findMany({
      where: { churchId: context.church.id },
    });

    // Map completion status to each predefined item
    const completedMap = new Map(
      completedItems.map((item) => [item.itemKey, item])
    );

    const items = LAUNCH_CHECKLIST_ITEMS.map((item) => {
      const completed = completedMap.get(item.key);
      return {
        key: item.key,
        label: item.label,
        description: item.description,
        category: item.category,
        isComplete: completed?.isComplete ?? false,
        completedAt: completed?.completedAt ?? null,
        notes: completed?.notes ?? null,
      };
    });

    // Calculate progress
    const completedCount = items.filter((i) => i.isComplete).length;
    const totalCount = items.length;

    return NextResponse.json({
      items,
      progress: {
        completed: completedCount,
        total: totalCount,
        percentage: Math.round((completedCount / totalCount) * 100),
      },
    });
  } catch (error) {
    logger.error("Failed to get launch checklist", error as Error);
    return NextResponse.json(
      { error: "Failed to get launch checklist" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/launch-checklist
 * Update a checklist item's completion status.
 * Admin only.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();

    const body = await request.json();
    const result = updateChecklistSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: formatZodError(result.error) },
        { status: 400 }
      );
    }

    const { itemKey, isComplete, notes } = result.data;

    // Upsert the checklist item
    const item = await prisma.launchChecklistItem.upsert({
      where: {
        churchId_itemKey: {
          churchId: user.churchId,
          itemKey,
        },
      },
      update: {
        isComplete,
        completedAt: isComplete ? new Date() : null,
        completedBy: isComplete ? user.id : null,
        notes: notes || null,
      },
      create: {
        churchId: user.churchId,
        itemKey,
        isComplete,
        completedAt: isComplete ? new Date() : null,
        completedBy: isComplete ? user.id : null,
        notes: notes || null,
      },
    });

    logger.info("Launch checklist item updated", {
      churchId: user.churchId,
      itemKey,
      isComplete,
    });

    // Get updated progress
    const completedItems = await prisma.launchChecklistItem.count({
      where: {
        churchId: user.churchId,
        isComplete: true,
      },
    });

    return NextResponse.json({
      item: {
        key: itemKey,
        isComplete: item.isComplete,
        completedAt: item.completedAt,
        notes: item.notes,
      },
      progress: {
        completed: completedItems,
        total: LAUNCH_CHECKLIST_ITEMS.length,
        percentage: Math.round(
          (completedItems / LAUNCH_CHECKLIST_ITEMS.length) * 100
        ),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes("permission")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    logger.error("Failed to update launch checklist", error as Error);
    return NextResponse.json(
      { error: "Failed to update launch checklist" },
      { status: 500 }
    );
  }
}
