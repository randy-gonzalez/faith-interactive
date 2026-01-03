/**
 * Public Form API Route
 *
 * GET /api/forms/[id]/public - Get form details for public display (no auth required)
 *
 * Only returns form fields and settings needed to render the form.
 * Does not expose submission counts, notify emails, or other admin data.
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { getTenantPrisma } from '@/lib/db/tenant-prisma';
import { logger } from '@/lib/logging/logger';
import type { FormField, FormSettings } from '@/types/forms';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/forms/[id]/public
 * Get form details for public rendering. No authentication required.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: formId } = await params;
    const headerStore = await headers();
    const churchSlug = headerStore.get('x-church-slug');

    if (!churchSlug) {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Get church from slug
    const church = await prisma.church.findUnique({
      where: { slug: churchSlug },
    });

    if (!church) {
      return NextResponse.json(
        { success: false, error: 'Church not found' },
        { status: 404 }
      );
    }

    // Get the form
    const db = getTenantPrisma(church.id);
    const form = await db.form.findFirst({
      where: { id: formId },
    });

    if (!form) {
      return NextResponse.json(
        { success: false, error: 'Form not found' },
        { status: 404 }
      );
    }

    // Only return active forms to public
    if (!form.isActive) {
      return NextResponse.json(
        { success: false, error: 'Form not available' },
        { status: 404 }
      );
    }

    // Return only public-safe fields
    const fields = form.fields as unknown as FormField[];
    const settings = form.settings as unknown as FormSettings;

    return NextResponse.json({
      success: true,
      data: {
        form: {
          id: form.id,
          name: form.name,
          description: form.description,
          fields,
          settings: {
            submitButtonText: settings.submitButtonText,
            successMessage: settings.successMessage,
            honeypotEnabled: settings.honeypotEnabled,
            honeypotFieldName: settings.honeypotFieldName,
            minSubmitTime: settings.minSubmitTime,
          },
          isActive: form.isActive,
        },
      },
    });
  } catch (error) {
    logger.error('Failed to get public form', error instanceof Error ? error : null);
    return NextResponse.json(
      { success: false, error: 'Failed to load form' },
      { status: 500 }
    );
  }
}
