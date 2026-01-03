/**
 * Form Submissions Export API Route
 *
 * GET /api/forms/[id]/submissions/export - Export submissions as CSV
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireContentEditor, AuthError } from '@/lib/auth/guards';
import { getTenantPrisma } from '@/lib/db/tenant-prisma';
import { logger } from '@/lib/logging/logger';
import type { FormField } from '@/types/forms';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Escape a value for CSV
 */
function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  let strValue: string;

  if (typeof value === 'boolean') {
    strValue = value ? 'Yes' : 'No';
  } else if (Array.isArray(value)) {
    strValue = value.join(', ');
  } else if (typeof value === 'object') {
    strValue = JSON.stringify(value);
  } else {
    strValue = String(value);
  }

  // Escape quotes and wrap in quotes if necessary
  if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
    return `"${strValue.replace(/"/g, '""')}"`;
  }

  return strValue;
}

/**
 * GET /api/forms/[id]/submissions/export
 * Export all submissions as CSV
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: formId } = await params;
    const user = await requireContentEditor();
    const db = getTenantPrisma(user.churchId);

    // Get the form with its fields
    const form = await db.form.findFirst({
      where: { id: formId },
    });

    if (!form) {
      return NextResponse.json(
        { success: false, error: 'Form not found' },
        { status: 404 }
      );
    }

    // Get query params for filtering
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');

    // Build where clause
    const where: Record<string, unknown> = { formId };

    if (startDate) {
      where.submittedAt = { ...(where.submittedAt as object || {}), gte: new Date(startDate) };
    }
    if (endDate) {
      where.submittedAt = { ...(where.submittedAt as object || {}), lte: new Date(endDate) };
    }
    if (status === 'read') {
      where.isRead = true;
    } else if (status === 'unread') {
      where.isRead = false;
    }

    // Get all submissions matching criteria
    const submissions = await db.formSubmission.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
    });

    if (submissions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No submissions to export' },
        { status: 404 }
      );
    }

    const fields = form.fields as unknown as FormField[];

    // Build CSV header
    const headers = [
      'Submission ID',
      'Submitted At',
      'Status',
      ...fields.map((f) => f.label),
      'IP Address',
    ];

    // Build CSV rows
    const rows = submissions.map((submission) => {
      const data = submission.data as Record<string, unknown>;
      const fieldValues = fields.map((field) => {
        const value = data[field.name];
        return escapeCsvValue(value);
      });

      return [
        submission.id,
        submission.submittedAt.toISOString(),
        submission.isRead ? 'Read' : 'Unread',
        ...fieldValues,
        submission.ipAddress || '',
      ].map(escapeCsvValue).join(',');
    });

    // Combine header and rows
    const csv = [headers.map(escapeCsvValue).join(','), ...rows].join('\n');

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${form.slug}-submissions-${timestamp}.csv`;

    logger.info('Form submissions exported', {
      formId,
      churchId: user.churchId,
      count: submissions.length,
    });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.code === 'UNAUTHENTICATED' ? 401 : 403 }
      );
    }
    logger.error('Failed to export form submissions', error instanceof Error ? error : null);
    return NextResponse.json(
      { success: false, error: 'Failed to export submissions' },
      { status: 500 }
    );
  }
}
