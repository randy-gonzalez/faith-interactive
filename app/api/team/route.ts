/**
 * Team API Routes
 *
 * GET /api/team - List all team members for the church
 * POST /api/team - Create a new invite
 */

import { NextResponse } from "next/server";
import { requireTeamManager } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { inviteSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";
import { generateToken } from "@/lib/auth/password";
import { sendInviteEmail } from "@/lib/email/send";
import { headers } from "next/headers";

export async function GET() {
  try {
    const currentUser = await requireTeamManager();
    const db = getTenantPrisma(currentUser.churchId);

    const [users, invites] = await Promise.all([
      db.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      }),
      db.userInvite.findMany({
        where: {
          acceptedAt: null,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

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
    const db = getTenantPrisma(currentUser.churchId);

    const body = await request.json();
    const result = inviteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: { email: result.data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    // Check if there's already a pending invite
    const existingInvite = await db.userInvite.findFirst({
      where: {
        email: result.data.email,
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

    // churchId is automatically injected by tenant-prisma extension
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const invite = await (db.userInvite.create as any)({
      data: {
        email: result.data.email,
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
    const church = await db.user.findUnique({
      where: { id: currentUser.id },
      select: { church: { select: { name: true } } },
    });
    const churchName = church?.church.name || "your church";

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
