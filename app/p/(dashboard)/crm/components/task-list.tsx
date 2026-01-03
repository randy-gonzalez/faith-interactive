"use client";

/**
 * Task List Component
 *
 * Displays a list of tasks with quick actions.
 */

import { useState } from "react";
import Link from "next/link";
import { markTaskDone, rescheduleTask } from "@/lib/crm/actions";
import type { TaskWithLead } from "@/lib/crm/queries";

interface TaskListProps {
  tasks: TaskWithLead[];
}

export function TaskList({ tasks }: TaskListProps) {
  return (
    <div className="divide-y divide-gray-100">
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} />
      ))}
    </div>
  );
}

function TaskRow({ task }: { task: TaskWithLead }) {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isDnc = !!task.lead.dnc;
  const dueDate = new Date(task.dueAt);
  const formattedDate = dueDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const formattedTime = dueDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  async function handleMarkDone() {
    setIsLoading(true);
    try {
      await markTaskDone(task.id);
    } catch (error) {
      console.error("Failed to mark task done:", error);
    }
    setIsLoading(false);
  }

  async function handleReschedule(newDate: string) {
    setIsLoading(true);
    try {
      await rescheduleTask(task.id, { dueAt: newDate });
      setIsRescheduling(false);
    } catch (error) {
      console.error("Failed to reschedule task:", error);
    }
    setIsLoading(false);
  }

  return (
    <div className="px-4 py-3 hover:bg-gray-50 flex items-center gap-4">
      {/* Task Type Badge */}
      <div className="shrink-0">
        <TaskTypeBadge type={task.type} />
      </div>

      {/* Lead Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/crm/leads/${task.lead.id}`}
          className="font-medium text-gray-900 hover:text-indigo-600 truncate block"
        >
          {task.lead.churchName}
        </Link>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{task.lead.stage.name}</span>
          {isDnc && (
            <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded">
              DNC
            </span>
          )}
        </div>
      </div>

      {/* Due Date */}
      <div className="shrink-0 text-sm text-gray-500">
        {formattedDate} at {formattedTime}
      </div>

      {/* Actions */}
      <div className="shrink-0 flex items-center gap-2">
        {isRescheduling ? (
          <RescheduleInput
            onSubmit={handleReschedule}
            onCancel={() => setIsRescheduling(false)}
            isLoading={isLoading}
          />
        ) : (
          <>
            <button
              onClick={handleMarkDone}
              disabled={isLoading}
              className="text-sm text-green-600 hover:text-green-700 disabled:opacity-50"
            >
              Done
            </button>
            <button
              onClick={() => setIsRescheduling(true)}
              disabled={isLoading}
              className="text-sm text-gray-600 hover:text-gray-700 disabled:opacity-50"
            >
              Reschedule
            </button>
            <Link
              href={`/crm/leads/${task.lead.id}`}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              Open
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

function TaskTypeBadge({ type }: { type: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    CALL: { bg: "bg-blue-100", text: "text-blue-700", label: "Call" },
    EMAIL: { bg: "bg-purple-100", text: "text-purple-700", label: "Email" },
    TEXT: { bg: "bg-teal-100", text: "text-teal-700", label: "Text" },
    MEETING: { bg: "bg-amber-100", text: "text-amber-700", label: "Meeting" },
    OTHER: { bg: "bg-gray-100", text: "text-gray-700", label: "Other" },
  };

  const { bg, text, label } = config[type] || config.OTHER;

  return (
    <span className={`text-xs px-2 py-1 rounded ${bg} ${text}`}>
      {label}
    </span>
  );
}

function RescheduleInput({
  onSubmit,
  onCancel,
  isLoading,
}: {
  onSubmit: (date: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [value, setValue] = useState(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(0);
    return now.toISOString().slice(0, 16);
  });

  return (
    <div className="flex items-center gap-2">
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="text-sm border border-gray-300 rounded px-2 py-1"
        disabled={isLoading}
      />
      <button
        onClick={() => onSubmit(new Date(value).toISOString())}
        disabled={isLoading}
        className="text-sm text-green-600 hover:text-green-700 disabled:opacity-50"
      >
        Save
      </button>
      <button
        onClick={onCancel}
        disabled={isLoading}
        className="text-sm text-gray-500 hover:text-gray-600 disabled:opacity-50"
      >
        Cancel
      </button>
    </div>
  );
}
