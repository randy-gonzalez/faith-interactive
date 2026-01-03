/**
 * Consultation Request Detail API Routes
 *
 * GET /api/platform/marketing/consultations/[id] - Get a single consultation
 * PATCH /api/platform/marketing/consultations/[id] - Update consultation status/notes
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePlatformUser } from "@/lib/auth/guards";
import { logger } from "@/lib/logging/logger";
import { consultationUpdateSchema, formatZodError } from "@/lib/validation/schemas";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/platform/marketing/consultations/[id]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requirePlatformUser();
    const { id } = await params;

    const consultation = await prisma.consultationRequest.findUnique({
      where: { id },
    });

    if (!consultation) {
      return NextResponse.json({ error: "Consultation request not found" }, { status: 404 });
    }

    return NextResponse.json({ consultation });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Platform")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to get consultation request", error as Error);
    return NextResponse.json(
      { error: "Failed to get consultation request" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/platform/marketing/consultations/[id]
 * Update consultation status and notes.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requirePlatformUser();
    const { id } = await params;

    const existing = await prisma.consultationRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Consultation request not found" }, { status: 404 });
    }

    const body = await request.json();
    const result = consultationUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: formatZodError(result.error) },
        { status: 400 }
      );
    }

    const { status, notes, assignedToId } = result.data;

    const consultation = await prisma.consultationRequest.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes: notes || null }),
        ...(assignedToId !== undefined && { assignedToId: assignedToId || null }),
      },
    });

    logger.info("Consultation request updated", {
      consultationId: id,
      status: consultation.status,
      updatedBy: user.email,
    });

    return NextResponse.json({ consultation });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Platform")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Failed to update consultation request", error as Error);
    return NextResponse.json(
      { error: "Failed to update consultation request" },
      { status: 500 }
    );
  }
}
