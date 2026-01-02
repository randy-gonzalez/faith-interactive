/**
 * Event Recurrence Calculator
 *
 * Generates occurrence dates for recurring events based on
 * recurrence rules (daily, weekly, biweekly, monthly, yearly).
 */

import { RecurrenceFrequency } from "@prisma/client";

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number;
  daysOfWeek: number | null; // Bitmask: 1=Sun, 2=Mon, 4=Tue, 8=Wed, 16=Thu, 32=Fri, 64=Sat
  dayOfMonth: number | null; // 1-31 or -1 for last day
  endDate: Date | null;
  count: number | null;
}

export interface EventWithRecurrence {
  startDate: Date;
  endDate: Date | null;
  isRecurring: boolean;
  recurrenceFrequency: RecurrenceFrequency | null;
  recurrenceInterval: number | null;
  recurrenceDaysOfWeek: number | null;
  recurrenceDayOfMonth: number | null;
  recurrenceEndDate: Date | null;
  recurrenceCount: number | null;
  timezone: string | null;
}

// Days of week values for the bitmask
export const DAY_VALUES = {
  SUNDAY: 1,
  MONDAY: 2,
  TUESDAY: 4,
  WEDNESDAY: 8,
  THURSDAY: 16,
  FRIDAY: 32,
  SATURDAY: 64,
} as const;

/**
 * Parse a recurrence rule from an event
 */
export function parseRecurrenceRule(event: EventWithRecurrence): RecurrenceRule | null {
  if (!event.isRecurring || !event.recurrenceFrequency) {
    return null;
  }

  return {
    frequency: event.recurrenceFrequency,
    interval: event.recurrenceInterval || 1,
    daysOfWeek: event.recurrenceDaysOfWeek,
    dayOfMonth: event.recurrenceDayOfMonth,
    endDate: event.recurrenceEndDate,
    count: event.recurrenceCount,
  };
}

/**
 * Check if a specific day is set in the bitmask
 */
export function isDaySet(bitmask: number, dayValue: number): boolean {
  return (bitmask & dayValue) !== 0;
}

/**
 * Get the day value for a JavaScript Date (0=Sunday maps to 1, etc.)
 */
function getDateDayValue(date: Date): number {
  const dayOfWeek = date.getDay(); // 0-6
  return 1 << dayOfWeek; // 1, 2, 4, 8, 16, 32, 64
}

/**
 * Get the last day of a month
 */
function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Generate occurrence dates within a range
 */
export function generateOccurrences(
  startDate: Date,
  rule: RecurrenceRule,
  rangeStart: Date,
  rangeEnd: Date,
  maxOccurrences: number = 100
): Date[] {
  const occurrences: Date[] = [];
  let current = new Date(startDate);
  let count = 0;

  // Adjust start if range starts after event start
  if (current < rangeStart) {
    // Skip forward to near the range start
    current = skipToNearRange(current, rule, rangeStart);
  }

  while (current <= rangeEnd && occurrences.length < maxOccurrences) {
    // Check count limit
    if (rule.count !== null && count >= rule.count) {
      break;
    }

    // Check end date limit
    if (rule.endDate && current > rule.endDate) {
      break;
    }

    // Check if this date is valid for the pattern
    if (isValidOccurrence(current, startDate, rule)) {
      if (current >= rangeStart) {
        occurrences.push(new Date(current));
      }
      count++;
    }

    // Advance to next potential occurrence
    current = advanceDate(current, rule);
  }

  return occurrences;
}

/**
 * Skip forward to near the range start (optimization)
 */
function skipToNearRange(start: Date, rule: RecurrenceRule, rangeStart: Date): Date {
  const current = new Date(start);

  // Rough skip based on frequency
  switch (rule.frequency) {
    case "DAILY": {
      const daysDiff = Math.floor((rangeStart.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
      const intervalsToSkip = Math.max(0, Math.floor(daysDiff / rule.interval) - 1);
      current.setDate(current.getDate() + intervalsToSkip * rule.interval);
      break;
    }
    case "WEEKLY":
    case "BIWEEKLY": {
      const weeksDiff = Math.floor((rangeStart.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const interval = rule.frequency === "BIWEEKLY" ? 2 : rule.interval;
      const intervalsToSkip = Math.max(0, Math.floor(weeksDiff / interval) - 1);
      current.setDate(current.getDate() + intervalsToSkip * interval * 7);
      break;
    }
    case "MONTHLY": {
      const monthsDiff =
        (rangeStart.getFullYear() - start.getFullYear()) * 12 +
        (rangeStart.getMonth() - start.getMonth());
      const intervalsToSkip = Math.max(0, Math.floor(monthsDiff / rule.interval) - 1);
      current.setMonth(current.getMonth() + intervalsToSkip * rule.interval);
      break;
    }
    case "YEARLY": {
      const yearsDiff = rangeStart.getFullYear() - start.getFullYear();
      const intervalsToSkip = Math.max(0, Math.floor(yearsDiff / rule.interval) - 1);
      current.setFullYear(current.getFullYear() + intervalsToSkip * rule.interval);
      break;
    }
  }

  return current;
}

/**
 * Check if a date is a valid occurrence for the pattern
 */
function isValidOccurrence(date: Date, startDate: Date, rule: RecurrenceRule): boolean {
  switch (rule.frequency) {
    case "DAILY":
      // Every N days from start
      const daysDiff = Math.floor((date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
      return daysDiff % rule.interval === 0;

    case "WEEKLY":
    case "BIWEEKLY": {
      // Check if on a valid week
      const weeksDiff = Math.floor((date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const weekInterval = rule.frequency === "BIWEEKLY" ? 2 : rule.interval;
      if (weeksDiff % weekInterval !== 0) {
        // Not on the right week, but need to check if we're within the same week
        const startOfStartWeek = new Date(startDate);
        startOfStartWeek.setDate(startOfStartWeek.getDate() - startOfStartWeek.getDay());
        const startOfCurrentWeek = new Date(date);
        startOfCurrentWeek.setDate(startOfCurrentWeek.getDate() - startOfCurrentWeek.getDay());
        const exactWeeksDiff = Math.floor((startOfCurrentWeek.getTime() - startOfStartWeek.getTime()) / (7 * 24 * 60 * 60 * 1000));
        if (exactWeeksDiff % weekInterval !== 0) {
          return false;
        }
      }

      // If daysOfWeek is specified, check if the day is selected
      if (rule.daysOfWeek !== null && rule.daysOfWeek !== 0) {
        const dayValue = getDateDayValue(date);
        return isDaySet(rule.daysOfWeek, dayValue);
      }

      // If no days specified, only the original day
      return date.getDay() === startDate.getDay();
    }

    case "MONTHLY": {
      // Check if on a valid month
      const monthsDiff =
        (date.getFullYear() - startDate.getFullYear()) * 12 +
        (date.getMonth() - startDate.getMonth());
      if (monthsDiff % rule.interval !== 0) {
        return false;
      }

      // Check day of month
      if (rule.dayOfMonth !== null) {
        if (rule.dayOfMonth === -1) {
          // Last day of month
          const lastDay = getLastDayOfMonth(date.getFullYear(), date.getMonth());
          return date.getDate() === lastDay;
        }
        return date.getDate() === rule.dayOfMonth;
      }

      // Default: same day of month as start
      return date.getDate() === startDate.getDate();
    }

    case "YEARLY": {
      // Check if on a valid year
      const yearsDiff = date.getFullYear() - startDate.getFullYear();
      if (yearsDiff % rule.interval !== 0) {
        return false;
      }

      // Same month and day as start
      return (
        date.getMonth() === startDate.getMonth() &&
        date.getDate() === startDate.getDate()
      );
    }

    default:
      return false;
  }
}

/**
 * Advance date to next potential occurrence
 */
function advanceDate(date: Date, rule: RecurrenceRule): Date {
  const next = new Date(date);

  switch (rule.frequency) {
    case "DAILY":
      next.setDate(next.getDate() + rule.interval);
      break;

    case "WEEKLY":
    case "BIWEEKLY":
      // If days of week specified, advance to next day in the pattern
      if (rule.daysOfWeek !== null && rule.daysOfWeek !== 0) {
        let found = false;
        const startDay = date.getDay();

        // Try each day for the rest of this week
        for (let i = 1; i <= 7; i++) {
          const checkDay = (startDay + i) % 7;
          const checkValue = 1 << checkDay;

          if (i < 7 - startDay + 1) {
            // Still in the same week
            if (isDaySet(rule.daysOfWeek, checkValue)) {
              next.setDate(next.getDate() + i);
              found = true;
              break;
            }
          } else {
            // Would be next week - apply interval
            break;
          }
        }

        if (!found) {
          // Move to start of next valid week and find first day
          const interval = rule.frequency === "BIWEEKLY" ? 2 : rule.interval;
          const daysToNextWeek = 7 - date.getDay();
          next.setDate(next.getDate() + daysToNextWeek + (interval - 1) * 7);

          // Find first day in pattern
          for (let i = 0; i <= 6; i++) {
            const checkValue = 1 << i;
            if (isDaySet(rule.daysOfWeek, checkValue)) {
              next.setDate(next.getDate() + i);
              break;
            }
          }
        }
      } else {
        // No specific days, advance by interval weeks
        const interval = rule.frequency === "BIWEEKLY" ? 2 : rule.interval;
        next.setDate(next.getDate() + interval * 7);
      }
      break;

    case "MONTHLY":
      next.setMonth(next.getMonth() + rule.interval);
      // Handle day adjustment for months with fewer days
      if (rule.dayOfMonth === -1) {
        // Last day of month
        next.setDate(getLastDayOfMonth(next.getFullYear(), next.getMonth()));
      } else if (rule.dayOfMonth !== null) {
        const targetDay = Math.min(
          rule.dayOfMonth,
          getLastDayOfMonth(next.getFullYear(), next.getMonth())
        );
        next.setDate(targetDay);
      }
      break;

    case "YEARLY":
      next.setFullYear(next.getFullYear() + rule.interval);
      break;
  }

  return next;
}

/**
 * Format a recurrence rule as human-readable text
 */
export function formatRecurrencePattern(
  rule: RecurrenceRule | null,
  startDate?: Date
): string {
  if (!rule) return "";

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let pattern = "";

  switch (rule.frequency) {
    case "DAILY":
      pattern = rule.interval === 1 ? "Every day" : `Every ${rule.interval} days`;
      break;

    case "WEEKLY":
      if (rule.daysOfWeek !== null && rule.daysOfWeek !== 0) {
        const days: string[] = [];
        for (let i = 0; i < 7; i++) {
          if (isDaySet(rule.daysOfWeek, 1 << i)) {
            days.push(dayNames[i]);
          }
        }
        pattern = rule.interval === 1
          ? `Weekly on ${days.join(", ")}`
          : `Every ${rule.interval} weeks on ${days.join(", ")}`;
      } else {
        pattern = rule.interval === 1 ? "Weekly" : `Every ${rule.interval} weeks`;
        if (startDate) {
          pattern += ` on ${dayNames[startDate.getDay()]}`;
        }
      }
      break;

    case "BIWEEKLY":
      if (rule.daysOfWeek !== null && rule.daysOfWeek !== 0) {
        const days: string[] = [];
        for (let i = 0; i < 7; i++) {
          if (isDaySet(rule.daysOfWeek, 1 << i)) {
            days.push(dayNames[i]);
          }
        }
        pattern = `Every 2 weeks on ${days.join(", ")}`;
      } else {
        pattern = "Every 2 weeks";
        if (startDate) {
          pattern += ` on ${dayNames[startDate.getDay()]}`;
        }
      }
      break;

    case "MONTHLY":
      if (rule.dayOfMonth === -1) {
        pattern = rule.interval === 1
          ? "Monthly on the last day"
          : `Every ${rule.interval} months on the last day`;
      } else if (rule.dayOfMonth !== null) {
        const ordinal = getOrdinal(rule.dayOfMonth);
        pattern = rule.interval === 1
          ? `Monthly on the ${ordinal}`
          : `Every ${rule.interval} months on the ${ordinal}`;
      } else {
        pattern = rule.interval === 1 ? "Monthly" : `Every ${rule.interval} months`;
        if (startDate) {
          pattern += ` on the ${getOrdinal(startDate.getDate())}`;
        }
      }
      break;

    case "YEARLY":
      pattern = rule.interval === 1 ? "Yearly" : `Every ${rule.interval} years`;
      if (startDate) {
        const monthName = startDate.toLocaleString("default", { month: "long" });
        pattern += ` on ${monthName} ${startDate.getDate()}`;
      }
      break;
  }

  // Add end condition
  if (rule.endDate) {
    pattern += ` until ${rule.endDate.toLocaleDateString()}`;
  } else if (rule.count) {
    pattern += ` for ${rule.count} occurrence${rule.count > 1 ? "s" : ""}`;
  }

  return pattern;
}

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 */
function getOrdinal(n: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

/**
 * Get the next occurrence after a given date
 */
export function getNextOccurrence(
  startDate: Date,
  rule: RecurrenceRule,
  afterDate: Date = new Date()
): Date | null {
  const occurrences = generateOccurrences(
    startDate,
    rule,
    afterDate,
    new Date(afterDate.getTime() + 365 * 24 * 60 * 60 * 1000), // Look up to 1 year ahead
    1
  );

  return occurrences.length > 0 ? occurrences[0] : null;
}
