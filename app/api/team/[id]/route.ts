/**
 * Single Team Member API Routes
 *
 * PUT /api/team/[id] - Update user role
 * DELETE /api/team/[id] - Remove user or cancel invite
 */

import { NextResponse } from "next/server";
import { requireTeamManager } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { logger } from "@/lib/logging/logger";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateRoleSchema = z.object({
  role: z.enum(["ADMIN", "EDITOR", "VIEWER"]),
});

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currentUser = await requireTeamManager();
    const db = getTenantPrisma(currentUser.churchId);

    // Can't change your own role
    if (id === currentUser.id) {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const result = updateRoleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: { role: result.data.role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to update user role", error as Error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currentUser = await requireTeamManager();
    const db = getTenantPrisma(currentUser.churchId);

    // Can't delete yourself
    if (id === currentUser.id) {
      return NextResponse.json(
        { error: "You cannot remove yourself from the team" },
        { status: 400 }
      );
    }

    // Check if it's a user or an invite
    const user = await db.user.findUnique({
      where: { id },
    });

    if (user) {
      // Delete user and their sessions
      await db.session.deleteMany({
        where: { userId: id },
      });
      await db.user.delete({
        where: { id },
      });
      return NextResponse.json({ success: true, type: "user" });
    }

    // Check if it's an invite
    const invite = await db.userInvite.findUnique({
      where: { id },
    });

    if (invite) {
      await db.userInvite.delete({
        where: { id },
      });
      return NextResponse.json({ success: true, type: "invite" });
    }

    return NextResponse.json(
      { error: "User or invite not found" },
      { status: 404 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to remove team member", error as Error);
    return NextResponse.json(
      { error: "Failed to remove team member" },
      { status: 500 }
    );
  }
}
