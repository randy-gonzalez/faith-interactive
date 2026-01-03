"use client";

/**
 * Lead Filters Component
 *
 * Filter controls for the leads list.
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

interface Stage {
  id: string;
  name: string;
}

interface LeadFiltersProps {
  stages: Stage[];
}

export function LeadFilters({ stages }: LeadFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") || "");

  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset to page 1
    startTransition(() => {
      router.push(`/platform/crm/leads?${params.toString()}`);
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateFilter("search", search || null);
  }

  return (
    <div className="flex flex-wrap gap-4 items-center">
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search leads..."
          className="w-64 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Search
        </button>
      </form>

      {/* Stage Filter */}
      <select
        value={searchParams.get("stageId") || ""}
        onChange={(e) => updateFilter("stageId", e.target.value || null)}
        className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        disabled={isPending}
      >
        <option value="">All Stages</option>
        {stages.map((stage) => (
          <option key={stage.id} value={stage.id}>
            {stage.name}
          </option>
        ))}
      </select>

      {/* Follow-up Filter */}
      <select
        value={searchParams.get("followUpFilter") || "all"}
        onChange={(e) => updateFilter("followUpFilter", e.target.value === "all" ? null : e.target.value)}
        className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        disabled={isPending}
      >
        <option value="all">All Follow-ups</option>
        <option value="overdue">Overdue</option>
        <option value="due_today">Due Today</option>
        <option value="none">No Follow-up</option>
      </select>

      {/* Show DNC Toggle */}
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={searchParams.get("showDnc") === "true"}
          onChange={(e) => updateFilter("showDnc", e.target.checked ? "true" : null)}
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          disabled={isPending}
        />
        Show DNC
      </label>

      {/* Clear Filters */}
      {(searchParams.get("stageId") ||
        searchParams.get("followUpFilter") ||
        searchParams.get("showDnc") ||
        searchParams.get("search")) && (
        <button
          onClick={() => {
            setSearch("");
            router.push("/platform/crm/leads");
          }}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Clear filters
        </button>
      )}

      {isPending && (
        <span className="text-sm text-gray-400">Loading...</span>
      )}
    </div>
  );
}
