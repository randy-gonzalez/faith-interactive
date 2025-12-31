/**
 * Accept Invite API Route
 *
 * POST /api/auth/accept-invite - Accept an invite and create account
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { logger } from "@/lib/logging/logger";
import { z } from "zod";

const acceptInviteSchema = z.object({
  token: z.string().min(1),
  name: z.string().min(1).max(100),
  password: z.string().min(8).max(100),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = acceptInviteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Find the invite
    const invite = await prisma.userInvite.findUnique({
      where: { token: result.data.token },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invalid or expired invite" },
        { status: 400 }
      );
    }

    if (invite.acceptedAt) {
      return NextResponse.json(
        { error: "This invite has already been used" },
        { status: 400 }
      );
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This invite has expired" },
        { status: 400 }
      );
    }

    // Check if email is already registered
    const existingUser = await prisma.user.findFirst({
      where: {
        email: invite.email,
        churchId: invite.churchId,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Create the user and mark invite as accepted
    const passwordHash = await hashPassword(result.data.password);

    const [user] = await prisma.$transaction([
      prisma.user.create({
        data: {
          email: invite.email,
          name: result.data.name,
          passwordHash,
          role: invite.role,
          churchId: invite.churchId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      }),
      prisma.userInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      }),
    ]);

    logger.info("Invite accepted", {
      userId: user.id,
      email: user.email,
      churchId: invite.churchId,
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully. You can now log in.",
    });
  } catch (error) {
    logger.error("Failed to accept invite", error as Error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
