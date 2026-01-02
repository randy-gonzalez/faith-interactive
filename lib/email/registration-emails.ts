/**
 * Event Registration Email Templates
 *
 * Email templates for event registration workflows:
 * - Registration confirmation
 * - Waitlist confirmation
 * - Promoted from waitlist
 * - Event reminders
 * - Registration cancelled
 */

import { sendEmail } from "./send";

/**
 * Format a date for display in emails
 */
function formatEventDate(date: Date, endDate?: Date | null): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };

  const startStr = date.toLocaleString("en-US", options);

  if (endDate) {
    // If same day, just show end time
    if (date.toDateString() === endDate.toDateString()) {
      const endTime = endDate.toLocaleString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
      return `${startStr} - ${endTime}`;
    }
    // Different days
    const endStr = endDate.toLocaleString("en-US", options);
    return `${startStr} to ${endStr}`;
  }

  return startStr;
}

/**
 * Generate calendar links for an event
 */
function generateCalendarLinks(
  title: string,
  startDate: Date,
  endDate: Date | null,
  location: string,
  description: string = ""
): { google: string; ics: string } {
  const start = startDate.toISOString().replace(/-|:|\.\d{3}/g, "");
  const end = (endDate || new Date(startDate.getTime() + 2 * 60 * 60 * 1000))
    .toISOString()
    .replace(/-|:|\.\d{3}/g, "");

  const encodedTitle = encodeURIComponent(title);
  const encodedLocation = encodeURIComponent(location);
  const encodedDescription = encodeURIComponent(description);

  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}&dates=${start}/${end}&details=${encodedDescription}&location=${encodedLocation}`;

  // For ICS, we'd need to generate an actual file - using a data URI approach
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${start}
DTEND:${end}
SUMMARY:${title}
LOCATION:${location}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR`;

  const icsDataUri = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;

  return { google, ics: icsDataUri };
}

/**
 * Send registration confirmation email
 */
export async function sendRegistrationConfirmationEmail(
  email: string,
  churchName: string,
  firstName: string,
  eventTitle: string,
  startDate: Date,
  endDate: Date | null,
  location: string,
  accessToken: string
): Promise<void> {
  const subject = `You're registered: ${eventTitle}`;
  const dateStr = formatEventDate(startDate, endDate);
  const manageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ""}/events/manage?token=${accessToken}`;
  const calendarLinks = generateCalendarLinks(
    eventTitle,
    startDate,
    endDate,
    location,
    `Event at ${churchName}`
  );

  const text = `
Hi ${firstName},

You're registered for ${eventTitle}!

Event Details:
- Date: ${dateStr}
- Location: ${location || "TBD"}

Add to your calendar:
Google Calendar: ${calendarLinks.google}

Manage your registration:
${manageUrl}

If you can no longer attend, please cancel your registration so we can offer your spot to someone else.

We look forward to seeing you!

${churchName}
`.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">You're registered!</h1>

  <p style="margin-bottom: 16px;">
    Hi ${firstName}, you're confirmed for <strong>${eventTitle}</strong>.
  </p>

  <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
    <h2 style="color: #1a1a1a; font-size: 18px; margin: 0 0 12px 0;">${eventTitle}</h2>
    <p style="margin: 0 0 8px 0;"><strong>Date:</strong> ${dateStr}</p>
    ${location ? `<p style="margin: 0;"><strong>Location:</strong> ${location}</p>` : ""}
  </div>

  <p style="margin-bottom: 24px;">
    <a href="${calendarLinks.google}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin-right: 12px;">
      Add to Google Calendar
    </a>
  </p>

  <p style="color: #666; font-size: 14px; margin-bottom: 16px;">
    If you can no longer attend, please <a href="${manageUrl}" style="color: #2563eb;">cancel your registration</a> so we can offer your spot to someone else.
  </p>

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">

  <p style="color: #999; font-size: 12px;">
    We look forward to seeing you!<br>
    ${churchName}
  </p>
</body>
</html>
`.trim();

  await sendEmail({ to: email, subject, text, html });
}

/**
 * Send waitlist confirmation email
 */
export async function sendWaitlistConfirmationEmail(
  email: string,
  churchName: string,
  firstName: string,
  eventTitle: string,
  startDate: Date,
  location: string,
  waitlistPosition: number,
  accessToken: string
): Promise<void> {
  const subject = `You're on the waitlist: ${eventTitle}`;
  const dateStr = formatEventDate(startDate);
  const manageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ""}/events/manage?token=${accessToken}`;

  const text = `
Hi ${firstName},

You've been added to the waitlist for ${eventTitle}.

Your waitlist position: #${waitlistPosition}

Event Details:
- Date: ${dateStr}
- Location: ${location || "TBD"}

If a spot opens up, we'll notify you by email and automatically register you.

Manage your registration:
${manageUrl}

${churchName}
`.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">You're on the waitlist</h1>

  <p style="margin-bottom: 16px;">
    Hi ${firstName}, you've been added to the waitlist for <strong>${eventTitle}</strong>.
  </p>

  <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
    <p style="margin: 0; font-size: 18px; font-weight: 500; color: #92400e;">
      Your waitlist position: <strong>#${waitlistPosition}</strong>
    </p>
  </div>

  <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
    <h2 style="color: #1a1a1a; font-size: 18px; margin: 0 0 12px 0;">${eventTitle}</h2>
    <p style="margin: 0 0 8px 0;"><strong>Date:</strong> ${dateStr}</p>
    ${location ? `<p style="margin: 0;"><strong>Location:</strong> ${location}</p>` : ""}
  </div>

  <p style="color: #666; font-size: 14px; margin-bottom: 16px;">
    If a spot opens up, we'll notify you by email and automatically register you.
  </p>

  <p style="margin-bottom: 24px;">
    <a href="${manageUrl}" style="display: inline-block; background-color: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
      Manage Registration
    </a>
  </p>

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">

  <p style="color: #999; font-size: 12px;">
    ${churchName}
  </p>
</body>
</html>
`.trim();

  await sendEmail({ to: email, subject, text, html });
}

/**
 * Send email when promoted from waitlist
 */
export async function sendPromotedFromWaitlistEmail(
  email: string,
  churchName: string,
  firstName: string,
  eventTitle: string,
  startDate: Date,
  endDate: Date | null,
  location: string,
  accessToken: string
): Promise<void> {
  const subject = `Good news! You're now registered: ${eventTitle}`;
  const dateStr = formatEventDate(startDate, endDate);
  const manageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ""}/events/manage?token=${accessToken}`;
  const calendarLinks = generateCalendarLinks(
    eventTitle,
    startDate,
    endDate,
    location,
    `Event at ${churchName}`
  );

  const text = `
Hi ${firstName},

Great news! A spot opened up and you've been automatically registered for ${eventTitle}!

Event Details:
- Date: ${dateStr}
- Location: ${location || "TBD"}

Add to your calendar:
Google Calendar: ${calendarLinks.google}

Manage your registration:
${manageUrl}

We look forward to seeing you!

${churchName}
`.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #d1fae5; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
    <h1 style="color: #065f46; font-size: 24px; margin: 0;">Good news!</h1>
  </div>

  <p style="margin-bottom: 16px;">
    Hi ${firstName}, a spot opened up and you've been <strong>automatically registered</strong> for <strong>${eventTitle}</strong>!
  </p>

  <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
    <h2 style="color: #1a1a1a; font-size: 18px; margin: 0 0 12px 0;">${eventTitle}</h2>
    <p style="margin: 0 0 8px 0;"><strong>Date:</strong> ${dateStr}</p>
    ${location ? `<p style="margin: 0;"><strong>Location:</strong> ${location}</p>` : ""}
  </div>

  <p style="margin-bottom: 24px;">
    <a href="${calendarLinks.google}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin-right: 12px;">
      Add to Google Calendar
    </a>
  </p>

  <p style="color: #666; font-size: 14px; margin-bottom: 16px;">
    If you can no longer attend, please <a href="${manageUrl}" style="color: #2563eb;">cancel your registration</a> so we can offer your spot to someone else.
  </p>

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">

  <p style="color: #999; font-size: 12px;">
    We look forward to seeing you!<br>
    ${churchName}
  </p>
</body>
</html>
`.trim();

  await sendEmail({ to: email, subject, text, html });
}

/**
 * Send event reminder email
 */
export async function sendEventReminderEmail(
  email: string,
  churchName: string,
  firstName: string,
  eventTitle: string,
  startDate: Date,
  location: string,
  accessToken: string,
  reminderType: "1_day" | "1_hour" = "1_day"
): Promise<void> {
  const timeframe = reminderType === "1_day" ? "tomorrow" : "in 1 hour";
  const subject = `Reminder: ${eventTitle} is ${timeframe}`;
  const dateStr = formatEventDate(startDate);
  const manageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ""}/events/manage?token=${accessToken}`;

  const text = `
Hi ${firstName},

This is a reminder that ${eventTitle} is ${timeframe}.

Event Details:
- Date: ${dateStr}
- Location: ${location || "TBD"}

Can't make it? Manage your registration:
${manageUrl}

See you there!

${churchName}
`.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">Event Reminder</h1>

  <p style="margin-bottom: 16px;">
    Hi ${firstName}, this is a reminder that <strong>${eventTitle}</strong> is <strong>${timeframe}</strong>.
  </p>

  <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
    <h2 style="color: #1a1a1a; font-size: 18px; margin: 0 0 12px 0;">${eventTitle}</h2>
    <p style="margin: 0 0 8px 0;"><strong>Date:</strong> ${dateStr}</p>
    ${location ? `<p style="margin: 0;"><strong>Location:</strong> ${location}</p>` : ""}
  </div>

  <p style="color: #666; font-size: 14px; margin-bottom: 16px;">
    Can't make it? <a href="${manageUrl}" style="color: #2563eb;">Cancel your registration</a>.
  </p>

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">

  <p style="color: #999; font-size: 12px;">
    See you there!<br>
    ${churchName}
  </p>
</body>
</html>
`.trim();

  await sendEmail({ to: email, subject, text, html });
}

/**
 * Send registration cancelled email
 */
export async function sendRegistrationCancelledEmail(
  email: string,
  churchName: string,
  firstName: string,
  eventTitle: string,
  startDate: Date
): Promise<void> {
  const subject = `Registration cancelled: ${eventTitle}`;
  const dateStr = formatEventDate(startDate);

  const text = `
Hi ${firstName},

Your registration for ${eventTitle} has been cancelled.

Event Details:
- ${eventTitle}
- ${dateStr}

If you'd like to register again and spots are available, you can do so on our website.

${churchName}
`.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">Registration Cancelled</h1>

  <p style="margin-bottom: 16px;">
    Hi ${firstName}, your registration for <strong>${eventTitle}</strong> has been cancelled.
  </p>

  <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
    <p style="margin: 0 0 8px 0;"><strong>${eventTitle}</strong></p>
    <p style="margin: 0; color: #666;">${dateStr}</p>
  </div>

  <p style="color: #666; font-size: 14px;">
    If you'd like to register again and spots are available, you can do so on our website.
  </p>

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">

  <p style="color: #999; font-size: 12px;">
    ${churchName}
  </p>
</body>
</html>
`.trim();

  await sendEmail({ to: email, subject, text, html });
}
