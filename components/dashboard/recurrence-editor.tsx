/**
 * Recurrence Editor Component
 *
 * A form section for configuring recurring event patterns.
 * Supports daily, weekly, biweekly, monthly, and yearly recurrence.
 */

"use client";

import { Input } from "@/components/ui/input";

type RecurrenceFrequency = "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY";

interface RecurrenceValues {
  isRecurring: boolean;
  recurrenceFrequency: RecurrenceFrequency | null;
  recurrenceInterval: number | null;
  recurrenceDaysOfWeek: number | null;
  recurrenceDayOfMonth: number | null;
  recurrenceEndDate: string | null;
  recurrenceCount: number | null;
}

interface RecurrenceEditorProps {
  values: RecurrenceValues;
  onChange: (values: RecurrenceValues) => void;
  disabled?: boolean;
}

const DAYS_OF_WEEK = [
  { label: "Sun", value: 1 },
  { label: "Mon", value: 2 },
  { label: "Tue", value: 4 },
  { label: "Wed", value: 8 },
  { label: "Thu", value: 16 },
  { label: "Fri", value: 32 },
  { label: "Sat", value: 64 },
];

const FREQUENCY_OPTIONS: { value: RecurrenceFrequency; label: string }[] = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "BIWEEKLY", label: "Every 2 Weeks" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
];

export function RecurrenceEditor({
  values,
  onChange,
  disabled = false,
}: RecurrenceEditorProps) {
  const {
    isRecurring,
    recurrenceFrequency,
    recurrenceInterval,
    recurrenceDaysOfWeek,
    recurrenceDayOfMonth,
    recurrenceEndDate,
    recurrenceCount,
  } = values;

  function handleToggle(checked: boolean) {
    if (checked) {
      onChange({
        ...values,
        isRecurring: true,
        recurrenceFrequency: "WEEKLY",
        recurrenceInterval: 1,
        recurrenceDaysOfWeek: null,
        recurrenceDayOfMonth: null,
        recurrenceEndDate: null,
        recurrenceCount: null,
      });
    } else {
      onChange({
        ...values,
        isRecurring: false,
        recurrenceFrequency: null,
        recurrenceInterval: null,
        recurrenceDaysOfWeek: null,
        recurrenceDayOfMonth: null,
        recurrenceEndDate: null,
        recurrenceCount: null,
      });
    }
  }

  function handleFrequencyChange(freq: RecurrenceFrequency) {
    const newValues: RecurrenceValues = {
      ...values,
      recurrenceFrequency: freq,
      recurrenceInterval: freq === "BIWEEKLY" ? 2 : 1,
      // Initialize days of week to 0 for weekly/biweekly, null otherwise
      recurrenceDaysOfWeek: (freq === "WEEKLY" || freq === "BIWEEKLY") ? 0 : null,
      recurrenceDayOfMonth: null,
    };

    onChange(newValues);
  }

  function toggleDayOfWeek(dayValue: number) {
    const current = recurrenceDaysOfWeek || 0;
    const newValue = current ^ dayValue; // XOR to toggle
    onChange({ ...values, recurrenceDaysOfWeek: newValue });
  }

  function isDaySelected(dayValue: number): boolean {
    return ((recurrenceDaysOfWeek || 0) & dayValue) !== 0;
  }

  function getPatternDescription(): string {
    if (!isRecurring || !recurrenceFrequency) return "";

    let desc = "";
    const interval = recurrenceInterval || 1;

    switch (recurrenceFrequency) {
      case "DAILY":
        desc = interval === 1 ? "Every day" : `Every ${interval} days`;
        break;
      case "WEEKLY":
        if (interval === 1) {
          desc = "Every week";
        } else {
          desc = `Every ${interval} weeks`;
        }
        if (recurrenceDaysOfWeek) {
          const days = DAYS_OF_WEEK.filter((d) => isDaySelected(d.value))
            .map((d) => d.label)
            .join(", ");
          if (days) desc += ` on ${days}`;
        }
        break;
      case "BIWEEKLY":
        desc = "Every 2 weeks";
        if (recurrenceDaysOfWeek) {
          const days = DAYS_OF_WEEK.filter((d) => isDaySelected(d.value))
            .map((d) => d.label)
            .join(", ");
          if (days) desc += ` on ${days}`;
        }
        break;
      case "MONTHLY":
        if (recurrenceDayOfMonth) {
          if (recurrenceDayOfMonth === -1) {
            desc = interval === 1
              ? "Monthly on the last day"
              : `Every ${interval} months on the last day`;
          } else {
            desc = interval === 1
              ? `Monthly on day ${recurrenceDayOfMonth}`
              : `Every ${interval} months on day ${recurrenceDayOfMonth}`;
          }
        } else {
          desc = interval === 1 ? "Monthly" : `Every ${interval} months`;
        }
        break;
      case "YEARLY":
        desc = interval === 1 ? "Every year" : `Every ${interval} years`;
        break;
    }

    if (recurrenceEndDate) {
      const date = new Date(recurrenceEndDate);
      desc += ` until ${date.toLocaleDateString()}`;
    } else if (recurrenceCount) {
      desc += ` for ${recurrenceCount} occurrence${recurrenceCount > 1 ? "s" : ""}`;
    }

    return desc;
  }

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex items-center gap-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => handleToggle(e.target.checked)}
            disabled={disabled}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
        <span className="text-sm font-medium text-gray-900">
          Repeat this event
        </span>
      </div>

      {isRecurring && (
        <div className="pl-14 space-y-4">
          {/* Frequency */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Repeats
            </label>
            <select
              value={recurrenceFrequency || "WEEKLY"}
              onChange={(e) => handleFrequencyChange(e.target.value as RecurrenceFrequency)}
              disabled={disabled}
              className="w-full px-3 py-2 rounded-md border bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500"
            >
              {FREQUENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Interval (for non-biweekly) */}
          {recurrenceFrequency !== "BIWEEKLY" && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700">Every</span>
              <input
                type="number"
                min="1"
                max="99"
                value={recurrenceInterval || 1}
                onChange={(e) =>
                  onChange({
                    ...values,
                    recurrenceInterval: parseInt(e.target.value) || 1,
                  })
                }
                disabled={disabled}
                className="w-20 px-3 py-2 rounded-md border bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                {recurrenceFrequency === "DAILY" && (recurrenceInterval === 1 ? "day" : "days")}
                {recurrenceFrequency === "WEEKLY" && (recurrenceInterval === 1 ? "week" : "weeks")}
                {recurrenceFrequency === "MONTHLY" && (recurrenceInterval === 1 ? "month" : "months")}
                {recurrenceFrequency === "YEARLY" && (recurrenceInterval === 1 ? "year" : "years")}
              </span>
            </div>
          )}

          {/* Days of week (for weekly/biweekly) */}
          {(recurrenceFrequency === "WEEKLY" || recurrenceFrequency === "BIWEEKLY") && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                On these days
              </label>
              <div className="flex gap-1">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDayOfWeek(day.value)}
                    disabled={disabled}
                    className={`
                      w-10 h-10 rounded-md text-sm font-medium transition-colors
                      ${
                        isDaySelected(day.value)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Day of month (for monthly) */}
          {recurrenceFrequency === "MONTHLY" && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700">On day</span>
              <select
                value={recurrenceDayOfMonth?.toString() || ""}
                onChange={(e) =>
                  onChange({
                    ...values,
                    recurrenceDayOfMonth: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                disabled={disabled}
                className="w-24 px-3 py-2 rounded-md border bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Same day</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
                <option value="-1">Last day</option>
              </select>
            </div>
          )}

          {/* End condition */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Ends
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  checked={!recurrenceEndDate && !recurrenceCount}
                  onChange={() =>
                    onChange({
                      ...values,
                      recurrenceEndDate: null,
                      recurrenceCount: null,
                    })
                  }
                  disabled={disabled}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Never</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  checked={!!recurrenceEndDate}
                  onChange={() =>
                    onChange({
                      ...values,
                      recurrenceEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .slice(0, 10),
                      recurrenceCount: null,
                    })
                  }
                  disabled={disabled}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">On date</span>
                {recurrenceEndDate && (
                  <input
                    type="date"
                    value={recurrenceEndDate?.slice(0, 10) || ""}
                    onChange={(e) =>
                      onChange({
                        ...values,
                        recurrenceEndDate: e.target.value || null,
                      })
                    }
                    disabled={disabled}
                    className="px-3 py-1 rounded-md border bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  checked={!!recurrenceCount}
                  onChange={() =>
                    onChange({
                      ...values,
                      recurrenceEndDate: null,
                      recurrenceCount: 10,
                    })
                  }
                  disabled={disabled}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">After</span>
                {recurrenceCount && (
                  <>
                    <input
                      type="number"
                      min="1"
                      max="999"
                      value={recurrenceCount || ""}
                      onChange={(e) =>
                        onChange({
                          ...values,
                          recurrenceCount: parseInt(e.target.value) || null,
                        })
                      }
                      disabled={disabled}
                      className="w-20 px-3 py-1 rounded-md border bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">occurrences</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Pattern preview */}
          {getPatternDescription() && (
            <div className="bg-blue-50 text-blue-700 rounded-md p-3 text-sm">
              {getPatternDescription()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
