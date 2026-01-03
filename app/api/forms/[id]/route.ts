/**
 * Single Form API Routes
 *
 * GET /api/forms/[id] - Get form details
 * PATCH /api/forms/[id] - Update form configuration
 * DELETE /api/forms/[id] - Delete form (custom forms only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext, requireContentEditor, AuthError } from '@/lib/auth/guards';
import { getTenantPrisma } from '@/lib/db/tenant-prisma';
import { updateFormSchema } from '@/lib/forms/validation';
import { isDefaultFormType } from '@/lib/forms/default-forms';
import { logger } from '@/lib/logging/logger';
import type { ApiResponse } from '@/types';
import type { FormField, FormSettings } from '@/types/forms';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/forms/[id]
 * Get full form details including fields and settings
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const context = await requireAuthContext();
    const db = getTenantPrisma(context.church.id);

    const form = await db.form.findFirst({
      where: { id },
      include: {
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!form) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Form not found' },
        { status: 404 }
      );
    }

    // Get unread count
    const unreadCount = await db.formSubmission.count({
      where: {
        formId: form.id,
        isRead: false,
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        form: {
          ...form,
          submissionCount: form._count.submissions,
          unreadCount,
        },
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.code === 'UNAUTHENTICATED' ? 401 : 403 }
      );
    }
    logger.error('Failed to get form', error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to load form' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/forms/[id]
 * Update form configuration
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await requireContentEditor();
    const db = getTenantPrisma(user.churchId);

    // Get existing form
    const existingForm = await db.form.findFirst({
      where: { id },
    });

    if (!existingForm) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Form not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parseResult = updateFormSchema.safeParse(body);

    if (!parseResult.success) {
      const errors = parseResult.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
      return NextResponse.json<ApiResponse>(
        { success: false, error: errors.join('; ') },
        { status: 400 }
      );
    }

    const { name, slug, description, fields, settings, notifyEmails, isActive } = parseResult.data;

    // Check for duplicate slug if changing
    if (slug && slug !== existingForm.slug) {
      const duplicate = await db.form.findFirst({
        where: { slug },
      });

      if (duplicate) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'A form with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (fields !== undefined) updateData.fields = fields as unknown as FormField[];
    if (notifyEmails !== undefined) updateData.notifyEmails = notifyEmails;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Merge settings if provided
    if (settings !== undefined) {
      const existingSettings = existingForm.settings as unknown as FormSettings;
      updateData.settings = {
        ...existingSettings,
        ...settings,
      };
    }

    const form = await db.form.update({
      where: { id },
      data: updateData,
    });

    logger.info('Form updated', { formId: form.id, churchId: user.churchId });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { form },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.code === 'UNAUTHENTICATED' ? 401 : 403 }
      );
    }
    logger.error('Failed to update form', error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update form' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/forms/[id]
 * Delete a form (custom forms only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await requireContentEditor();
    const db = getTenantPrisma(user.churchId);

    const form = await db.form.findFirst({
      where: { id },
    });

    if (!form) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Form not found' },
        { status: 404 }
      );
    }

    // Prevent deletion of default forms
    if (isDefaultFormType(form.type)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Default forms cannot be deleted. You can deactivate them instead.' },
        { status: 400 }
      );
    }

    // Delete form and all submissions (cascade)
    await db.form.delete({
      where: { id },
    });

    logger.info('Form deleted', { formId: id, churchId: user.churchId });

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
    logger.error('Failed to delete form', error instanceof Error ? error : null);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete form' },
      { status: 500 }
    );
  }
}
