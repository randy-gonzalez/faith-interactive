/**
 * Forms API Routes
 *
 * GET /api/forms - List all forms for the church
 * POST /api/forms - Create a new custom form
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext, requireContentEditor, AuthError } from '@/lib/auth/guards';
import { getTenantPrisma } from '@/lib/db/tenant-prisma';
import { createFormSchema } from '@/lib/forms/validation';
import { generateHoneypotFieldName } from '@/lib/forms/spam-protection';
import { DEFAULT_FORM_SETTINGS } from '@/types/forms';
import { logger } from '@/lib/logging/logger';
import type { ApiResponse } from '@/types';
import type { FormField, FormSettings } from '@/types/forms';

/**
 * GET /api/forms
 * List all forms for the current church
 */
export async function GET() {
  try {
    const context = await requireAuthContext();
    const db = getTenantPrisma(context.church.id);

    const forms = await db.form.findMany({
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        type: true,
        isActive: true,
        notifyEmails: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    // Get unread counts per form
    const formsWithCounts = await Promise.all(
      forms.map(async (form) => {
        const unreadCount = await db.formSubmission.count({
          where: {
            formId: form.id,
            isRead: false,
          },
        });

        return {
          ...form,
          submissionCount: form._count.submissions,
          unreadCount,
        };
      })
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { forms: formsWithCounts },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.code === 'UNAUTHENTICATED' ? 401 : 403 }
      );
    }
    logger.error('Failed to list forms', error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to load forms' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/forms
 * Create a new custom form
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireContentEditor();
    const db = getTenantPrisma(user.churchId);

    const body = await request.json();
    const parseResult = createFormSchema.safeParse(body);

    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
      return NextResponse.json<ApiResponse>(
        { success: false, error: errors.join('; ') },
        { status: 400 }
      );
    }

    const { name, slug, description, type, fields, settings, notifyEmails, isActive } =
      parseResult.data;

    // Check for duplicate slug
    const existing = await db.form.findFirst({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'A form with this slug already exists' },
        { status: 400 }
      );
    }

    // Merge settings with defaults
    const formSettings: FormSettings = {
      ...DEFAULT_FORM_SETTINGS,
      ...settings,
      honeypotFieldName: generateHoneypotFieldName(),
    };

    // Create the form
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = await (db.form.create as any)({
      data: {
        name,
        slug,
        description: description || null,
        type: type || 'CUSTOM',
        fields: fields as unknown as FormField[],
        settings: formSettings as unknown as Record<string, unknown>,
        notifyEmails: notifyEmails || [],
        isActive: isActive ?? true,
      },
    });

    logger.info('Form created', { formId: form.id, churchId: user.churchId });

    return NextResponse.json<ApiResponse>(
      { success: true, data: { form } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.code === 'UNAUTHENTICATED' ? 401 : 403 }
      );
    }
    logger.error('Failed to create form', error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create form' },
      { status: 500 }
    );
  }
}
