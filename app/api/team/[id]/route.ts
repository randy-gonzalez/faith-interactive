/**
 * Single Team Member API Routes
 *
 * PUT /api/team/[id] - Update member role
 * DELETE /api/team/[id] - Remove member or cancel invite
 *
 * NEW MODEL:
 * - Role is stored on ChurchMembership, not User
 * - Members are managed through memberships
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireTeamManager } from "@/lib/auth/guards";
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

    // Can't change your own role
    if (id === currentUser.id) {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 400 }
      );
    }

    // Find the membership for this user in the current church
    const membership = await prisma.churchMembership.findFirst({
      where: {
        userId: id,
        churchId: currentUser.churchId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "User not found in this organization" }, { status: 404 });
    }

    const body = await request.json();
    const result = updateRoleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Update the membership role
    await prisma.churchMembership.update({
      where: { id: membership.id },
      data: { role: result.data.role },
    });

    return NextResponse.json({
      user: {
        id: membership.user.id,
        email: membership.user.email,
        name: membership.user.name,
        role: result.data.role,
        createdAt: membership.createdAt,
      },
    });
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

    // Can't delete yourself
    if (id === currentUser.id) {
      return NextResponse.json(
        { error: "You cannot remove yourself from the team" },
        { status: 400 }
      );
    }

    // Check if it's a membership
    const membership = await prisma.churchMembership.findFirst({
      where: {
        userId: id,
        churchId: currentUser.churchId,
        isActive: true,
      },
    });

    if (membership) {
      // Soft delete the membership (set isActive to false)
      await prisma.churchMembership.update({
        where: { id: membership.id },
        data: { isActive: false },
      });
      return NextResponse.json({ success: true, type: "user" });
    }

    // Check if it's an invite
    const invite = await prisma.userInvite.findFirst({
      where: {
        id,
        churchId: currentUser.churchId,
        acceptedAt: null, // Only pending invites
      },
    });

    if (invite) {
      await prisma.userInvite.delete({
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
