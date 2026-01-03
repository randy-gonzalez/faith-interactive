/**
 * Form Submission API Route
 *
 * POST /api/forms/[id]/submit - Submit a form (public, rate-limited)
 *
 * Security measures:
 * - Honeypot field detection
 * - Time-based validation
 * - Rate limiting per IP
 * - Input validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { getTenantPrisma } from '@/lib/db/tenant-prisma';
import { logger } from '@/lib/logging/logger';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';
import { validateFormSubmission, formatValidationErrors } from '@/lib/forms/validation';
import { performSpamCheck, getRateLimitConfig } from '@/lib/forms/spam-protection';
import { sendFormSubmissionNotificationEmail } from '@/lib/email/send';
import type { FormField, FormSettings, FormSubmissionFile } from '@/types/forms';
import type { FormType } from '@prisma/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/forms/[id]/submit
 * Submit a form. Public endpoint with spam protection and rate limiting.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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
      include: {
        siteSettings: true,
      },
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

    if (!form.isActive) {
      return NextResponse.json(
        { success: false, error: 'This form is no longer accepting submissions' },
        { status: 400 }
      );
    }

    // Get client IP for rate limiting and logging
    const forwardedFor = headerStore.get('x-forwarded-for');
    const realIp = headerStore.get('x-real-ip');
    const clientIp = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';
    const userAgent = headerStore.get('user-agent') || undefined;

    // Check rate limit based on form type
    const rateLimitConfig = getRateLimitConfig(form.type as keyof typeof import('@/lib/forms/spam-protection').RATE_LIMITS);
    const rateLimitResult = checkRateLimit(
      clientIp,
      `/api/forms/${formId}/submit`,
      { max: rateLimitConfig.requests, windowSeconds: rateLimitConfig.windowSeconds }
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many submissions. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const body = await request.json();
    const settings = form.settings as unknown as FormSettings;
    const fields = form.fields as unknown as FormField[];

    // Perform spam checks
    const honeypotFieldNames = settings.honeypotEnabled && settings.honeypotFieldName
      ? [settings.honeypotFieldName]
      : [];

    const spamCheck = performSpamCheck(body, {
      honeypotFieldNames,
      timestampToken: body._timestamp,
      minSubmitTime: settings.minSubmitTime || 3,
    });

    if (spamCheck.isSpam) {
      logger.warn('Spam detected on form submission', {
        formId,
        churchId: church.id,
        reason: spamCheck.reason,
        ip: clientIp,
      });

      // Return success to not tip off the bot, but don't process
      return NextResponse.json(
        { success: true, message: settings.successMessage },
        { headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Remove internal fields from data before validation
    const { _timestamp, [settings.honeypotFieldName]: _honeypot, ...submissionData } = body;

    // Validate submission data against form fields
    const validationResult = validateFormSubmission(submissionData, fields);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: formatValidationErrors(validationResult.errors || {}) },
        {
          status: 400,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Handle file references if present
    let fileReferences: FormSubmissionFile[] | null = null;
    const fileFields = fields.filter((f) => f.type === 'file');

    if (fileFields.length > 0) {
      fileReferences = [];

      for (const field of fileFields) {
        const fileIds = submissionData[field.name];
        if (Array.isArray(fileIds) && fileIds.length > 0) {
          // Look up files and link them to this submission
          for (const fileId of fileIds) {
            const file = await db.formFile.findFirst({
              where: {
                id: fileId,
                submissionId: null, // Only unlinked files
              },
            });

            if (file) {
              fileReferences.push({
                fieldName: field.name,
                fileId: file.id,
                filename: file.filename,
                storedPath: file.storedPath,
                mimeType: file.mimeType,
                size: file.size,
              });
            }
          }
        }
      }
    }

    // Create the submission
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const submission = await (db.formSubmission.create as any)({
      data: {
        formId,
        data: validationResult.data,
        files: fileReferences,
        ipAddress: clientIp,
        userAgent,
      },
    });

    // Link files to submission
    if (fileReferences && fileReferences.length > 0) {
      const fileIds = fileReferences.map((f) => f.fileId);
      await db.formFile.updateMany({
        where: { id: { in: fileIds } },
        data: { submissionId: submission.id, expiresAt: null },
      });
    }

    // Send notification emails
    const notifyEmails = form.notifyEmails.length > 0
      ? form.notifyEmails
      : church.siteSettings?.contactEmail
        ? [church.siteSettings.contactEmail]
        : [];

    if (notifyEmails.length > 0) {
      try {
        await sendFormSubmissionNotificationEmail(
          notifyEmails,
          church.name,
          form.name,
          validationResult.data as Record<string, unknown>,
          fields,
          submission.id
        );
      } catch (emailError) {
        // Log but don't fail the request if email fails
        logger.error('Failed to send form submission notification email', emailError as Error);
      }
    }

    logger.info('Form submitted', {
      formId,
      formType: form.type,
      submissionId: submission.id,
      churchId: church.id,
    });

    return NextResponse.json(
      {
        success: true,
        message: settings.successMessage,
        submissionId: submission.id,
      },
      { headers: getRateLimitHeaders(rateLimitResult) }
    );
  } catch (error) {
    logger.error('Form submission failed', error as Error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit form. Please try again.' },
      { status: 500 }
    );
  }
}
