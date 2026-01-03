/**
 * Form Submissions API Routes
 *
 * GET /api/forms/[id]/submissions - List submissions (paginated)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireContentEditor, AuthError } from '@/lib/auth/guards';
import { getTenantPrisma } from '@/lib/db/tenant-prisma';
import { logger } from '@/lib/logging/logger';
import type { ApiResponse } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/forms/[id]/submissions
 * List submissions for a form (paginated)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: formId } = await params;
    const user = await requireContentEditor();
    const db = getTenantPrisma(user.churchId);

    // Verify form exists
    const form = await db.form.findFirst({
      where: { id: formId },
    });

    if (!form) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Form not found' },
        { status: 404 }
      );
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const status = searchParams.get('status'); // 'read', 'unread', or null for all

    // Build where clause
    const where: Record<string, unknown> = { formId };
    if (status === 'read') {
      where.isRead = true;
    } else if (status === 'unread') {
      where.isRead = false;
    }

    // Get total count
    const total = await db.formSubmission.count({ where });
    const unreadCount = await db.formSubmission.count({
      where: { formId, isRead: false },
    });

    // Get submissions
    const submissions = await db.formSubmission.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        data: true,
        files: true,
        submittedAt: true,
        isRead: true,
        readAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        submissions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        unreadCount,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.code === 'UNAUTHENTICATED' ? 401 : 403 }
      );
    }
    logger.error('Failed to list form submissions', error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to load submissions' },
      { status: 500 }
    );
  }
}
