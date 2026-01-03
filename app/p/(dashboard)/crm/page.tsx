/**
 * CRM Dashboard - My Follow-ups
 *
 * Shows tasks organized by: Overdue, Due Today, Upcoming (next 7 days)
 */

import { requireCrmUser } from "@/lib/crm/guards";
import { getMyTasks, getDashboardStats } from "@/lib/crm/queries";
import { seedDefaultStages } from "@/lib/crm/actions";
import Link from "next/link";
import { TaskList } from "./components/task-list";

export default async function CrmDashboardPage() {
  const user = await requireCrmUser();

  // Ensure default stages exist
  await seedDefaultStages();

  const [tasks, stats] = await Promise.all([
    getMyTasks(user),
    getDashboardStats(user),
  ]);

  const totalTasks = tasks.overdue.length + tasks.dueToday.length + tasks.upcoming.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Follow-ups</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalTasks} open {totalTasks === 1 ? "task" : "tasks"}
          </p>
        </div>
        <Link
          href="/crm/leads/new"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
        >
          New Lead
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={stats.totalLeads} />
        <StatCard label="Active Leads" value={stats.activeLeads} />
        <StatCard label="DNC Leads" value={stats.dncLeads} variant="muted" />
        <StatCard
          label="Overdue Tasks"
          value={stats.overdueTaskCount}
          variant={stats.overdueTaskCount > 0 ? "danger" : "default"}
        />
      </div>

      {/* Task Sections */}
      <div className="space-y-6">
        {/* Overdue */}
        <TaskSection
          title="Overdue"
          count={tasks.overdue.length}
          variant="danger"
        >
          {tasks.overdue.length > 0 ? (
            <TaskList tasks={tasks.overdue} />
          ) : (
            <EmptyState message="No overdue tasks" />
          )}
        </TaskSection>

        {/* Due Today */}
        <TaskSection
          title="Due Today"
          count={tasks.dueToday.length}
          variant="warning"
        >
          {tasks.dueToday.length > 0 ? (
            <TaskList tasks={tasks.dueToday} />
          ) : (
            <EmptyState message="No tasks due today" />
          )}
        </TaskSection>

        {/* Upcoming */}
        <TaskSection
          title="Upcoming (Next 7 Days)"
          count={tasks.upcoming.length}
        >
          {tasks.upcoming.length > 0 ? (
            <TaskList tasks={tasks.upcoming} />
          ) : (
            <EmptyState message="No upcoming tasks" />
          )}
        </TaskSection>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: number;
  variant?: "default" | "muted" | "danger";
}) {
  const valueColor = {
    default: "text-gray-900",
    muted: "text-gray-500",
    danger: "text-red-600",
  }[variant];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-semibold ${valueColor}`}>{value}</p>
    </div>
  );
}

function TaskSection({
  title,
  count,
  variant = "default",
  children,
}: {
  title: string;
  count: number;
  variant?: "default" | "warning" | "danger";
  children: React.ReactNode;
}) {
  const borderColor = {
    default: "border-gray-200",
    warning: "border-amber-300",
    danger: "border-red-300",
  }[variant];

  const badgeColor = {
    default: "bg-gray-100 text-gray-700",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-red-100 text-red-800",
  }[variant];

  return (
    <div className={`bg-white rounded-lg border ${borderColor}`}>
      <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
        <h2 className="font-medium text-gray-900">{title}</h2>
        <span className={`text-xs px-2 py-0.5 rounded-full ${badgeColor}`}>
          {count}
        </span>
      </div>
      <div>{children}</div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="px-4 py-8 text-center text-gray-500 text-sm">
      {message}
    </div>
  );
}
