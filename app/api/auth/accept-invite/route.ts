/**
 * Accept Invite API Route
 *
 * POST /api/auth/accept-invite - Accept an invite and create account/membership
 *
 * NEW MODEL:
 * - If user already exists (by email), create a ChurchMembership
 * - If user doesn't exist, create User + ChurchMembership
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
      include: {
        church: {
          select: { name: true, slug: true },
        },
      },
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

    // Check if user already exists (globally unique email)
    const existingUser = await prisma.user.findUnique({
      where: { email: invite.email },
      include: {
        memberships: {
          where: { churchId: invite.churchId },
        },
      },
    });

    // If user exists and already has membership in this church, error
    if (existingUser && existingUser.memberships.length > 0) {
      return NextResponse.json(
        { error: "You already have access to this organization" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(result.data.password);

    if (existingUser) {
      // User exists - just add membership to this church
      await prisma.$transaction([
        prisma.churchMembership.create({
          data: {
            userId: existingUser.id,
            churchId: invite.churchId,
            role: invite.role,
            isPrimary: false, // Not primary since user already has an account
            isActive: true,
          },
        }),
        prisma.userInvite.update({
          where: { id: invite.id },
          data: { acceptedAt: new Date() },
        }),
      ]);

      logger.info("Invite accepted - membership added to existing user", {
        userId: existingUser.id,
        email: existingUser.email,
        churchId: invite.churchId,
        role: invite.role,
      });

      return NextResponse.json({
        success: true,
        message: `You now have access to ${invite.church.name}. You can log in with your existing password.`,
        existingUser: true,
      });
    }

    // User doesn't exist - create new user + membership
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: invite.email,
          name: result.data.name,
          passwordHash,
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });

      await tx.churchMembership.create({
        data: {
          userId: newUser.id,
          churchId: invite.churchId,
          role: invite.role,
          isPrimary: true, // First church is primary
          isActive: true,
        },
      });

      await tx.userInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      });

      return newUser;
    });

    logger.info("Invite accepted - new user created", {
      userId: user.id,
      email: user.email,
      churchId: invite.churchId,
      role: invite.role,
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully. You can now log in.",
      existingUser: false,
    });
  } catch (error) {
    logger.error("Failed to accept invite", error as Error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
