/**
 * Single Submission API Routes
 *
 * GET /api/forms/[id]/submissions/[subId] - Get submission details
 * PATCH /api/forms/[id]/submissions/[subId] - Mark read/unread
 * DELETE /api/forms/[id]/submissions/[subId] - Delete submission
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireContentEditor, AuthError } from '@/lib/auth/guards';
import { getTenantPrisma } from '@/lib/db/tenant-prisma';
import { logger } from '@/lib/logging/logger';
import type { ApiResponse } from '@/types';

interface RouteParams {
  params: Promise<{ id: string; subId: string }>;
}

/**
 * GET /api/forms/[id]/submissions/[subId]
 * Get full submission details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: formId, subId } = await params;
    const user = await requireContentEditor();
    const db = getTenantPrisma(user.churchId);

    const submission = await db.formSubmission.findFirst({
      where: { id: subId, formId },
      include: {
        form: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            fields: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { submission },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.code === 'UNAUTHENTICATED' ? 401 : 403 }
      );
    }
    logger.error('Failed to get submission', error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to load submission' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/forms/[id]/submissions/[subId]
 * Mark submission as read or unread
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: formId, subId } = await params;
    const user = await requireContentEditor();
    const db = getTenantPrisma(user.churchId);

    // Verify submission exists
    const existing = await db.formSubmission.findFirst({
      where: { id: subId, formId },
    });

    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { isRead } = body;

    if (typeof isRead !== 'boolean') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'isRead must be a boolean' },
        { status: 400 }
      );
    }

    const submission = await db.formSubmission.update({
      where: { id: subId },
      data: {
        isRead,
        readAt: isRead ? new Date() : null,
        readBy: isRead ? user.id : null,
      },
    });

    logger.info('Submission marked', {
      submissionId: subId,
      isRead,
      churchId: user.churchId,
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { submission },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.code === 'UNAUTHENTICATED' ? 401 : 403 }
      );
    }
    logger.error('Failed to update submission', error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update submission' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/forms/[id]/submissions/[subId]
 * Delete a submission
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: formId, subId } = await params;
    const user = await requireContentEditor();
    const db = getTenantPrisma(user.churchId);

    // Verify submission exists
    const existing = await db.formSubmission.findFirst({
      where: { id: subId, formId },
    });

    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Delete associated files first
    await db.formFile.deleteMany({
      where: { submissionId: subId },
    });

    // Delete submission
    await db.formSubmission.delete({
      where: { id: subId },
    });

    logger.info('Submission deleted', {
      submissionId: subId,
      formId,
      churchId: user.churchId,
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.code === 'UNAUTHENTICATED' ? 401 : 403 }
      );
    }
    logger.error('Failed to delete submission', error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete submission' },
      { status: 500 }
    );
  }
}
