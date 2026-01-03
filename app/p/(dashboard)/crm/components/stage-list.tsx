"use client";

/**
 * Stage List Component
 *
 * Lists all stages with reorder, rename, and toggle active functionality.
 */

import { useState } from "react";
import { updateStage, toggleStageActive, reorderStages } from "@/lib/crm/actions";

interface Stage {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

interface StageListProps {
  stages: Stage[];
}

export function StageList({ stages: initialStages }: StageListProps) {
  const [stages, setStages] = useState(initialStages);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRename(id: string) {
    if (!editName.trim()) {
      setEditingId(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await updateStage(id, { name: editName.trim() });
      if (result.success) {
        setStages((prev) =>
          prev.map((s) => (s.id === id ? { ...s, name: editName.trim() } : s))
        );
        setEditingId(null);
      } else {
        setError(result.error || "Failed to rename stage");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    }

    setIsLoading(false);
  }

  async function handleToggleActive(id: string) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await toggleStageActive(id);
      if (result.success) {
        setStages((prev) =>
          prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
        );
      } else {
        setError(result.error || "Failed to toggle stage");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    }

    setIsLoading(false);
  }

  async function handleMoveUp(index: number) {
    if (index === 0) return;

    const newStages = [...stages];
    [newStages[index - 1], newStages[index]] = [newStages[index], newStages[index - 1]];
    setStages(newStages);

    setIsLoading(true);
    try {
      await reorderStages(newStages.map((s) => s.id));
    } catch (err) {
      // Revert on error
      setStages(stages);
      setError("Failed to reorder stages");
    }
    setIsLoading(false);
  }

  async function handleMoveDown(index: number) {
    if (index === stages.length - 1) return;

    const newStages = [...stages];
    [newStages[index], newStages[index + 1]] = [newStages[index + 1], newStages[index]];
    setStages(newStages);

    setIsLoading(true);
    try {
      await reorderStages(newStages.map((s) => s.id));
    } catch (err) {
      // Revert on error
      setStages(stages);
      setError("Failed to reorder stages");
    }
    setIsLoading(false);
  }

  if (stages.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 text-sm">
        No stages yet. Create one above.
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <ul className="divide-y divide-gray-100">
        {stages.map((stage, index) => (
          <li
            key={stage.id}
            className={`px-4 py-3 flex items-center gap-4 ${
              !stage.isActive ? "bg-gray-50 opacity-60" : ""
            }`}
          >
            {/* Reorder Buttons */}
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => handleMoveUp(index)}
                disabled={index === 0 || isLoading}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                title="Move up"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                onClick={() => handleMoveDown(index)}
                disabled={index === stages.length - 1 || isLoading}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                title="Move down"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Name */}
            <div className="flex-1">
              {editingId === stage.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(stage.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => handleRename(stage.id)}
                    disabled={isLoading}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    disabled={isLoading}
                    className="text-sm text-gray-500 hover:text-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{stage.name}</span>
                  {!stage.isActive && (
                    <span className="text-xs px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded">
                      Inactive
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            {editingId !== stage.id && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setEditingId(stage.id);
                    setEditName(stage.name);
                  }}
                  disabled={isLoading}
                  className="text-sm text-gray-600 hover:text-gray-700"
                >
                  Rename
                </button>
                <button
                  onClick={() => handleToggleActive(stage.id)}
                  disabled={isLoading}
                  className={`text-sm ${
                    stage.isActive
                      ? "text-amber-600 hover:text-amber-700"
                      : "text-green-600 hover:text-green-700"
                  }`}
                >
                  {stage.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
