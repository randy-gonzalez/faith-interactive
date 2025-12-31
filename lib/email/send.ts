/**
 * Email Service
 *
 * Simple email sending abstraction. In development, emails are logged to console.
 * In production, this can be replaced with an actual email provider (SendGrid, SES, etc.)
 *
 * IMPLEMENTATION NOTE:
 * For production, replace the sendEmail function body with actual email provider code.
 * The function signature and types should remain the same.
 */

import { logger } from "@/lib/logging/logger";

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Send an email.
 *
 * In development: logs to console.
 * In production: implement actual email sending here.
 *
 * @param options - Email options
 * @returns Promise that resolves when email is "sent"
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  const { to, subject, text, html } = options;

  // In production, replace this with actual email provider
  // Example with SendGrid:
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({ to, from: 'noreply@faithinteractive.com', subject, text, html });

  if (process.env.NODE_ENV === "production") {
    // TODO: Implement production email sending
    logger.warn("Email sending not configured for production", { to, subject });
    return;
  }

  // Development: log the email
  logger.info("Email would be sent (dev mode)", {
    to,
    subject,
    text: text.substring(0, 200) + (text.length > 200 ? "..." : ""),
  });

  // Pretty print for dev console
  console.log("\n📧 ═══════════════════════════════════════════════════════════");
  console.log("  EMAIL (Development Mode - Not Actually Sent)");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`  To:      ${to}`);
  console.log(`  Subject: ${subject}`);
  console.log("───────────────────────────────────────────────────────────────");
  console.log(text);
  if (html) {
    console.log("───────────────────────────────────────────────────────────────");
    console.log("  (HTML version also available)");
  }
  console.log("═══════════════════════════════════════════════════════════════\n");
}

/**
 * Send a user invite email.
 */
export async function sendInviteEmail(
  email: string,
  inviteUrl: string,
  churchName: string,
  inviterName: string | null
): Promise<void> {
  const subject = `You've been invited to join ${churchName}`;

  const text = `
Hello,

${inviterName ? `${inviterName} has` : "You've been"} invited you to join ${churchName} on Faith Interactive.

Click the link below to create your account:
${inviteUrl}

This invite will expire in 7 days.

If you didn't expect this invitation, you can safely ignore this email.

Best regards,
The Faith Interactive Team
`.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">You're invited to join ${churchName}</h1>

  <p style="margin-bottom: 16px;">
    ${inviterName ? `<strong>${inviterName}</strong> has` : "You've been"} invited you to join <strong>${churchName}</strong> on Faith Interactive.
  </p>

  <p style="margin-bottom: 24px;">
    <a href="${inviteUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
      Create Your Account
    </a>
  </p>

  <p style="color: #666; font-size: 14px; margin-bottom: 16px;">
    This invite will expire in 7 days.
  </p>

  <p style="color: #666; font-size: 14px;">
    If you didn't expect this invitation, you can safely ignore this email.
  </p>

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">

  <p style="color: #999; font-size: 12px;">
    Best regards,<br>
    The Faith Interactive Team
  </p>
</body>
</html>
`.trim();

  await sendEmail({ to: email, subject, text, html });
}
