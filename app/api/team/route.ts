/**
 * Team API Routes
 *
 * GET /api/team - List all team members for the church
 * POST /api/team - Create a new invite
 *
 * NEW MODEL:
 * - Team members are users with active memberships in this church
 * - Role is stored on ChurchMembership, not User
 * - Users can belong to multiple churches
 */

import { NextResponse } from "next/server";
import { requireTeamManager } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { inviteSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";
import { generateToken } from "@/lib/auth/password";
import { sendInviteEmail } from "@/lib/email/send";
import { headers } from "next/headers";

export async function GET() {
  try {
    const currentUser = await requireTeamManager();

    // Get all active memberships for this church with user details
    // Exclude platform users (super admins) - they have implicit access but aren't "team members"
    const memberships = await prisma.churchMembership.findMany({
      where: {
        churchId: currentUser.churchId,
        isActive: true,
        user: {
          platformRole: null, // Exclude platform users
        },
      },
      orderBy: { createdAt: "desc" },
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

    // Get pending invites for this church
    const invites = await prisma.userInvite.findMany({
      where: {
        churchId: currentUser.churchId,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform memberships to user format for backward compatibility
    const users = memberships.map((m) => ({
      id: m.user.id,
      email: m.user.email,
      name: m.user.name,
      role: m.role,
      createdAt: m.createdAt,
    }));

    return NextResponse.json({ users, invites });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to fetch team", error as Error);
    return NextResponse.json(
      { error: "Failed to fetch team" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireTeamManager();

    const body = await request.json();
    const result = inviteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Check if user already has a membership in this church
    const existingMembership = await prisma.churchMembership.findFirst({
      where: {
        churchId: currentUser.churchId,
        isActive: true,
        user: { email: result.data.email.toLowerCase() },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "A user with this email is already a member" },
        { status: 400 }
      );
    }

    // Check if there's already a pending invite for this church
    const existingInvite = await prisma.userInvite.findFirst({
      where: {
        churchId: currentUser.churchId,
        email: result.data.email.toLowerCase(),
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvite) {
      return NextResponse.json(
        { error: "An invite for this email is already pending" },
        { status: 400 }
      );
    }

    // Create invite token (expires in 7 days)
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await prisma.userInvite.create({
      data: {
        churchId: currentUser.churchId,
        email: result.data.email.toLowerCase(),
        role: result.data.role,
        token,
        expiresAt,
        invitedById: currentUser.id,
      },
    });

    // Get the church name for the email
    const headerStore = await headers();
    const host = headerStore.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const inviteUrl = `${protocol}://${host}/accept-invite?token=${token}`;

    // Get church name
    const church = await prisma.church.findUnique({
      where: { id: currentUser.churchId },
      select: { name: true },
    });
    const churchName = church?.name || "your church";

    // Send invite email
    await sendInviteEmail(
      result.data.email,
      inviteUrl,
      churchName,
      currentUser.name
    );

    logger.info("User invite created and email sent", {
      email: result.data.email,
      role: result.data.role,
      churchId: currentUser.churchId,
    });

    return NextResponse.json(
      {
        invite: {
          id: invite.id,
          email: invite.email,
          role: invite.role,
          expiresAt: invite.expiresAt,
        },
        // Include invite URL in dev for testing
        ...(process.env.NODE_ENV !== "production" && { inviteUrl }),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    logger.error("Failed to create invite", error as Error);
    return NextResponse.json(
      { error: "Failed to create invite" },
      { status: 500 }
    );
  }
}
