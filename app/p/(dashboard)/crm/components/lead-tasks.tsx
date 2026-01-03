"use client";

/**
 * Lead Tasks Component
 *
 * Task management for a lead: create, list, complete, reschedule.
 */

import { useState } from "react";
import { createTask, markTaskDone, rescheduleTask } from "@/lib/crm/actions";
import type { TaskWithLead } from "@/lib/crm/queries";
import { TASK_TYPES } from "@/lib/crm/schemas";

interface LeadTasksProps {
  leadId: string;
  tasks: {
    open: TaskWithLead[];
    done: TaskWithLead[];
  };
  isDnc: boolean;
}

export function LeadTasks({ leadId, tasks, isDnc }: LeadTasksProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-medium text-gray-900">Follow-ups</h2>
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            Add Follow-up
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-100">
        {/* Create Form */}
        {showCreateForm && (
          <CreateTaskForm
            leadId={leadId}
            isDnc={isDnc}
            onClose={() => setShowCreateForm(false)}
          />
        )}

        {/* Open Tasks */}
        {tasks.open.length > 0 && (
          <div className="p-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              Open ({tasks.open.length})
            </h3>
            <div className="space-y-2">
              {tasks.open.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}

        {/* Done Tasks */}
        {tasks.done.length > 0 && (
          <div className="p-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              Completed ({tasks.done.length})
            </h3>
            <div className="space-y-2 opacity-60">
              {tasks.done.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {tasks.open.length === 0 && tasks.done.length === 0 && !showCreateForm && (
          <div className="p-8 text-center text-gray-500 text-sm">
            No follow-ups yet. Add one to get started.
          </div>
        )}
      </div>
    </div>
  );
}

const SCHEDULE_PRESETS = [
  { key: "1day", businessDays: 1 },
  { key: "2days", businessDays: 2 },
  { key: "3days", businessDays: 3 },
  { key: "1week", calendarDays: 7 },
  { key: "2weeks", calendarDays: 14 },
  { key: "1month", calendarDays: 30 },
  { key: "3months", calendarDays: 90 },
  { key: "6months", calendarDays: 180 },
] as const;

function skipToNextBusinessDay(date: Date): Date {
  const day = date.getDay();
  if (day === 0) date.setDate(date.getDate() + 1); // Sunday → Monday
  if (day === 6) date.setDate(date.getDate() + 2); // Saturday → Monday
  return date;
}

function addBusinessDays(startDate: Date, days: number): Date {
  const date = new Date(startDate);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return date;
}

function getSmartDueDate(preset: typeof SCHEDULE_PRESETS[number]): Date {
  const now = new Date();
  let targetDate: Date;

  if ("businessDays" in preset) {
    targetDate = addBusinessDays(now, preset.businessDays);
  } else {
    targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + preset.calendarDays);
    targetDate = skipToNextBusinessDay(targetDate);
  }

  targetDate.setHours(9, 0, 0, 0);
  return targetDate;
}

function getSmartLabel(preset: typeof SCHEDULE_PRESETS[number]): string {
  const targetDate = getSmartDueDate(preset);
  const now = new Date();
  const diffDays = Math.round((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const dayName = targetDate.toLocaleDateString("en-US", { weekday: "long" });
  const shortDate = targetDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  // Within same week or next week - show day name
  if (diffDays <= 7) {
    return dayName;
  }
  // Within 2 weeks - show "Next [Day]" or date
  if (diffDays <= 14) {
    return `Next ${dayName}`;
  }
  // Beyond 2 weeks - show date
  return shortDate;
}

function getDateFromPreset(preset: typeof SCHEDULE_PRESETS[number]): string {
  return getSmartDueDate(preset).toISOString();
}

function CreateTaskForm({
  leadId,
  isDnc,
  onClose,
}: {
  leadId: string;
  isDnc: boolean;
  onClose: () => void;
}) {
  const [type, setType] = useState<string>("CALL");
  const [selectedPresetKey, setSelectedPresetKey] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isContactType = ["CALL", "EMAIL", "TEXT"].includes(type);
  const selectedPreset = SCHEDULE_PRESETS.find((p) => p.key === selectedPresetKey);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPreset) {
      setError("Please select when to follow up");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const result = await createTask({
        leadId,
        type: type as (typeof TASK_TYPES)[number],
        dueAt: getDateFromPreset(selectedPreset),
        notes: notes || null,
        allowDncOverride: false,
      });

      if (!result.success) {
        setError(result.error || "Failed to create task");
      } else {
        onClose();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    }

    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-50 space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      {isDnc && isContactType && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-700">
          Warning: This lead is marked DNC. Contact tasks may be blocked.
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {TASK_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0) + t.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Follow up on
        </label>
        <div className="flex flex-wrap gap-2">
          {SCHEDULE_PRESETS.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => setSelectedPresetKey(preset.key)}
              className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                selectedPresetKey === preset.key
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
              }`}
            >
              {getSmartLabel(preset)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="text-sm text-gray-600 hover:text-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !selectedPreset}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? "Creating..." : "Add Follow-up"}
        </button>
      </div>
    </form>
  );
}

function TaskRow({ task }: { task: TaskWithLead }) {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isOpen = task.status === "OPEN";
  const dueDate = new Date(task.dueAt);
  const isOverdue = isOpen && dueDate < new Date();

  async function handleMarkDone() {
    setIsLoading(true);
    try {
      await markTaskDone(task.id);
    } catch (error) {
      console.error("Failed to mark done:", error);
    }
    setIsLoading(false);
  }

  async function handleReschedule(newDate: string) {
    setIsLoading(true);
    try {
      await rescheduleTask(task.id, { dueAt: newDate });
      setIsRescheduling(false);
    } catch (error) {
      console.error("Failed to reschedule:", error);
    }
    setIsLoading(false);
  }

  return (
    <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
      {/* Type Badge */}
      <TaskTypeBadge type={task.type} />

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm ${isOverdue ? "text-red-600 font-medium" : "text-gray-700"}`}>
            {dueDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            at{" "}
            {dueDate.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
            {isOverdue && " (Overdue)"}
          </span>
        </div>
        {task.notes && (
          <p className="text-sm text-gray-500 truncate">{task.notes}</p>
        )}
      </div>

      {/* Actions */}
      {isOpen && (
        <div className="shrink-0 flex items-center gap-2">
          {isRescheduling ? (
            <div className="flex items-center gap-2 flex-wrap">
              {SCHEDULE_PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => handleReschedule(getDateFromPreset(preset))}
                  disabled={isLoading}
                  className="px-2 py-1 text-xs rounded border border-gray-300 bg-white text-gray-700 hover:border-indigo-400 disabled:opacity-50"
                >
                  {getSmartLabel(preset)}
                </button>
              ))}
              <button
                onClick={() => setIsRescheduling(false)}
                disabled={isLoading}
                className="text-xs text-gray-500 ml-1"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleMarkDone}
                disabled={isLoading}
                className="text-sm text-green-600 hover:text-green-700"
              >
                Done
              </button>
              <button
                onClick={() => setIsRescheduling(true)}
                disabled={isLoading}
                className="text-sm text-gray-600 hover:text-gray-700"
              >
                Reschedule
              </button>
            </>
          )}
        </div>
      )}

      {/* Completed indicator */}
      {!isOpen && task.completedAt && (
        <span className="text-xs text-gray-400">
          Completed {new Date(task.completedAt).toLocaleDateString()}
        </span>
      )}
    </div>
  );
}

function TaskTypeBadge({ type }: { type: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    CALL: { bg: "bg-blue-100", text: "text-blue-700", label: "Call" },
    EMAIL: { bg: "bg-purple-100", text: "text-purple-700", label: "Email" },
    TEXT: { bg: "bg-teal-100", text: "text-teal-700", label: "Text" },
    MEETING: { bg: "bg-amber-100", text: "text-amber-700", label: "Meeting" },
    INSTAGRAM: { bg: "bg-pink-100", text: "text-pink-700", label: "Instagram" },
    FACEBOOK: { bg: "bg-blue-100", text: "text-blue-700", label: "Facebook" },
    TIKTOK: { bg: "bg-slate-100", text: "text-slate-700", label: "TikTok" },
    TWITTER: { bg: "bg-sky-100", text: "text-sky-700", label: "Twitter" },
    OTHER: { bg: "bg-gray-100", text: "text-gray-700", label: "Other" },
  };

  const { bg, text, label } = config[type] || config.OTHER;

  return (
    <span className={`text-xs px-2 py-1 rounded ${bg} ${text}`}>
      {label}
    </span>
  );
}
