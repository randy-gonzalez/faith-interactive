/**
 * Email Service
 *
 * Simple email sending abstraction using Resend.
 * In development without RESEND_API_KEY, emails are logged to console.
 * In production, emails are sent via Resend.
 */

import { Resend } from "resend";
import { logger } from "@/lib/logging/logger";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM || "Faith Interactive <noreply@faith-interactive.com>";

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Send an email.
 *
 * With RESEND_API_KEY: sends via Resend.
 * Without RESEND_API_KEY: logs to console (dev mode).
 *
 * @param options - Email options
 * @returns Promise that resolves when email is sent
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  const { to, subject, text, html } = options;

  // Production: send via Resend
  if (resend) {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      text,
      html,
    });

    if (error) {
      logger.error("Failed to send email via Resend", new Error(error.message), { to, subject });
      throw new Error(`Failed to send email: ${error.message}`);
    }

    logger.info("Email sent via Resend", { to, subject });
    return;
  }

  // Development: log the email
  logger.info("Email would be sent (dev mode - no RESEND_API_KEY)", {
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

/**
 * Send a contact form notification email to the church admin.
 */
export async function sendContactNotificationEmail(
  toEmail: string,
  churchName: string,
  senderName: string,
  senderEmail: string,
  message: string
): Promise<void> {
  const subject = `New Contact Form Submission - ${churchName}`;

  const text = `
New Contact Form Submission

From: ${senderName}
Email: ${senderEmail}

Message:
${message}

---
This message was sent through your ${churchName} website contact form.
`.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">New Contact Form Submission</h1>

  <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
    <p style="margin: 0 0 8px 0;"><strong>From:</strong> ${senderName}</p>
    <p style="margin: 0;"><strong>Email:</strong> <a href="mailto:${senderEmail}" style="color: #2563eb;">${senderEmail}</a></p>
  </div>

  <h2 style="color: #1a1a1a; font-size: 18px; margin-bottom: 12px;">Message:</h2>
  <div style="background-color: #fff; border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${message}</div>

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">

  <p style="color: #999; font-size: 12px;">
    This message was sent through your ${churchName} website contact form.
  </p>
</body>
</html>
`.trim();

  await sendEmail({ to: toEmail, subject, text, html });
}

/**
 * Send a prayer request notification email to designated recipients.
 */
export async function sendPrayerRequestNotificationEmail(
  toEmails: string[],
  churchName: string,
  senderName: string | null,
  senderEmail: string | null,
  prayerRequest: string
): Promise<void> {
  const subject = `New Prayer Request - ${churchName}`;
  const isAnonymous = !senderName && !senderEmail;

  const text = `
New Prayer Request

${isAnonymous ? "From: Anonymous" : `From: ${senderName || "Not provided"}`}
${senderEmail ? `Email: ${senderEmail}` : ""}

Prayer Request:
${prayerRequest}

---
This prayer request was submitted through your ${churchName} website.
`.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">New Prayer Request</h1>

  <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
    <p style="margin: 0 0 8px 0;"><strong>From:</strong> ${isAnonymous ? "Anonymous" : senderName || "Not provided"}</p>
    ${senderEmail ? `<p style="margin: 0;"><strong>Email:</strong> <a href="mailto:${senderEmail}" style="color: #2563eb;">${senderEmail}</a></p>` : ""}
  </div>

  <h2 style="color: #1a1a1a; font-size: 18px; margin-bottom: 12px;">Prayer Request:</h2>
  <div style="background-color: #fff; border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${prayerRequest}</div>

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">

  <p style="color: #999; font-size: 12px;">
    This prayer request was submitted through your ${churchName} website.
  </p>
</body>
</html>
`.trim();

  // Send to all recipients
  await Promise.all(
    toEmails.map((email) => sendEmail({ to: email, subject, text, html }))
  );
}

/**
 * Send a volunteer signup notification email to designated recipients.
 */
export async function sendVolunteerSignupNotificationEmail(
  toEmails: string[],
  churchName: string,
  name: string,
  email: string,
  phone: string | null,
  interests: string[],
  message: string | null
): Promise<void> {
  const subject = `New Volunteer Signup - ${churchName}`;

  const interestsText = interests.length > 0
    ? interests.join(", ")
    : "None specified";

  const text = `
New Volunteer Signup

Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ""}

Areas of Interest:
${interestsText}

${message ? `Additional Message:\n${message}` : ""}

---
This volunteer signup was submitted through your ${churchName} website.
`.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">New Volunteer Signup</h1>

  <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
    <p style="margin: 0 0 8px 0;"><strong>Name:</strong> ${name}</p>
    <p style="margin: 0 0 8px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #2563eb;">${email}</a></p>
    ${phone ? `<p style="margin: 0;"><strong>Phone:</strong> ${phone}</p>` : ""}
  </div>

  <h2 style="color: #1a1a1a; font-size: 18px; margin-bottom: 12px;">Areas of Interest:</h2>
  <div style="background-color: #fff; border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
    ${interests.length > 0
      ? interests.map((i) => `<span style="display: inline-block; background-color: #e0e7ff; color: #3730a3; padding: 4px 12px; border-radius: 16px; margin: 4px 4px 4px 0; font-size: 14px;">${i}</span>`).join("")
      : "<em>None specified</em>"
    }
  </div>

  ${message ? `
  <h2 style="color: #1a1a1a; font-size: 18px; margin-bottom: 12px;">Additional Message:</h2>
  <div style="background-color: #fff; border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${message}</div>
  ` : ""}

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">

  <p style="color: #999; font-size: 12px;">
    This volunteer signup was submitted through your ${churchName} website.
  </p>
</body>
</html>
`.trim();

  // Send to all recipients
  await Promise.all(
    toEmails.map((toEmail) => sendEmail({ to: toEmail, subject, text, html }))
  );
}

/**
 * Send a form submission notification email to designated recipients.
 * This is the unified notification for all configurable forms.
 */
export async function sendFormSubmissionNotificationEmail(
  toEmails: string[],
  churchName: string,
  formName: string,
  data: Record<string, unknown>,
  fields: Array<{ name: string; label: string; type: string }>,
  submissionId: string
): Promise<void> {
  const subject = `New ${formName} Submission - ${churchName}`;

  // Build field values text
  const fieldValuesText = fields
    .map((field) => {
      const value = data[field.name];
      if (value === undefined || value === null || value === "") {
        return `${field.label}: Not provided`;
      }
      if (Array.isArray(value)) {
        return `${field.label}: ${value.join(", ")}`;
      }
      if (typeof value === "boolean") {
        return `${field.label}: ${value ? "Yes" : "No"}`;
      }
      return `${field.label}: ${value}`;
    })
    .join("\n");

  const text = `
New ${formName} Submission

${fieldValuesText}

---
Submission ID: ${submissionId}
This submission was sent through your ${churchName} website.
`.trim();

  // Build field values HTML
  const fieldValuesHtml = fields
    .map((field) => {
      const value = data[field.name];
      let displayValue: string;

      if (value === undefined || value === null || value === "") {
        displayValue = "<em>Not provided</em>";
      } else if (Array.isArray(value)) {
        displayValue = value.join(", ");
      } else if (typeof value === "boolean") {
        displayValue = value ? "Yes" : "No";
      } else if (field.type === "textarea") {
        displayValue = `<div style="white-space: pre-wrap;">${String(value)}</div>`;
      } else {
        displayValue = String(value);
      }

      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #374151; width: 30%;">${field.label}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${displayValue}</td>
        </tr>
      `;
    })
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">New ${formName} Submission</h1>

  <table style="width: 100%; border-collapse: collapse; background-color: #fff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
    ${fieldValuesHtml}
  </table>

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">

  <p style="color: #999; font-size: 12px;">
    Submission ID: ${submissionId}<br>
    This submission was sent through your ${churchName} website.
  </p>
</body>
</html>
`.trim();

  // Send to all recipients
  await Promise.all(
    toEmails.map((toEmail) => sendEmail({ to: toEmail, subject, text, html }))
  );
}

/**
 * Send a consultation request notification email to platform admins.
 * Used for the public marketing website contact form.
 */
export async function sendConsultationNotificationEmail(
  toEmails: string[],
  data: {
    name: string;
    email: string;
    phone: string | null;
    churchName: string | null;
    packageInterest: string | null;
    message: string | null;
  },
  consultationId: string
): Promise<void> {
  const subject = `New Consultation Request${data.churchName ? ` - ${data.churchName}` : ` from ${data.name}`}`;

  const packageLabels: Record<string, string> = {
    free: "FREE (Church Plants) + $25/mo platform",
    small: "Small Church ($500 setup) + $25/mo platform",
    large: "Large Church ($1,500 setup) + $25/mo platform",
  };

  const packageDisplay = data.packageInterest
    ? packageLabels[data.packageInterest] || data.packageInterest
    : "Not specified";

  const text = `
New Consultation Request

Name: ${data.name}
Email: ${data.email}
${data.phone ? `Phone: ${data.phone}` : "Phone: Not provided"}
${data.churchName ? `Church Name: ${data.churchName}` : "Church Name: Not provided"}
Package Interest: ${packageDisplay}

${data.message ? `Message:\n${data.message}` : "No message provided"}

---
View in admin: https://platform.faith-interactive.com/marketing/consultations/${consultationId}
`.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #77f2a1 0%, #00ffce 100%); padding: 24px; border-radius: 8px 8px 0 0;">
    <h1 style="color: #000646; font-size: 24px; margin: 0;">New Consultation Request</h1>
  </div>

  <div style="background-color: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 140px;">Name:</td>
        <td style="padding: 8px 0; color: #1f2937;">${data.name}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: 600; color: #374151;">Email:</td>
        <td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #2563eb;">${data.email}</a></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: 600; color: #374151;">Phone:</td>
        <td style="padding: 8px 0; color: #1f2937;">${data.phone || "Not provided"}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: 600; color: #374151;">Church Name:</td>
        <td style="padding: 8px 0; color: #1f2937;">${data.churchName || "Not provided"}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: 600; color: #374151;">Package Interest:</td>
        <td style="padding: 8px 0;">
          <span style="display: inline-block; background-color: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 16px; font-size: 14px;">
            ${packageDisplay}
          </span>
        </td>
      </tr>
    </table>

    ${data.message ? `
    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <h3 style="color: #1f2937; font-size: 16px; margin: 0 0 12px 0;">Message:</h3>
      <div style="background-color: #fff; border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${data.message}</div>
    </div>
    ` : ""}

    <div style="margin-top: 24px; text-align: center;">
      <a href="https://platform.faith-interactive.com/marketing/consultations/${consultationId}"
         style="display: inline-block; background: linear-gradient(135deg, #77f2a1 0%, #00ffce 100%); color: #000646; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
        View in Admin Dashboard
      </a>
    </div>
  </div>

  <div style="padding: 16px; text-align: center;">
    <p style="color: #6b7280; font-size: 12px; margin: 0;">
      This consultation request was submitted through the Faith Interactive website.
    </p>
  </div>
</body>
</html>
`.trim();

  // Send to all platform admin recipients
  await Promise.all(
    toEmails.map((toEmail) => sendEmail({ to: toEmail, subject, text, html }))
  );
}
