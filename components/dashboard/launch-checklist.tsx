"use client";

/**
 * Launch Checklist Component
 *
 * Interactive checklist for tracking launch readiness tasks.
 * Allows toggling items complete/incomplete.
 */

import { useState } from "react";

interface ChecklistItem {
  key: string;
  label: string;
  description: string;
  category: string;
  isComplete: boolean;
  completedAt: Date | null;
  notes: string | null;
}

interface LaunchChecklistProps {
  items: ChecklistItem[];
  initialProgress: {
    completed: number;
    total: number;
    percentage: number;
  };
}

// Category display names and order
const CATEGORIES = [
  { key: "domain", label: "Domain Setup" },
  { key: "branding", label: "Branding" },
  { key: "content", label: "Content" },
] as const;

export function LaunchChecklist({ items, initialProgress }: LaunchChecklistProps) {
  const [checklistItems, setChecklistItems] = useState(items);
  const [progress, setProgress] = useState(initialProgress);
  const [updating, setUpdating] = useState<string | null>(null);

  const handleToggle = async (itemKey: string, currentValue: boolean) => {
    setUpdating(itemKey);

    try {
      const response = await fetch("/api/launch-checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemKey,
          isComplete: !currentValue,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Update local state
        setChecklistItems(checklistItems.map((item) =>
          item.key === itemKey
            ? {
                ...item,
                isComplete: data.item.isComplete,
                completedAt: data.item.completedAt,
              }
            : item
        ));
        setProgress(data.progress);
      }
    } catch (error) {
      console.error("Failed to update checklist item:", error);
    } finally {
      setUpdating(null);
    }
  };

  // Group items by category
  const itemsByCategory = CATEGORIES.map((category) => ({
    ...category,
    items: checklistItems.filter((item) => item.category === category.key),
  }));

  return (
    <div className="space-y-6">
      {itemsByCategory.map((category) => (
        <div
          key={category.key}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden"
        >
          {/* Category Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              {category.label}
            </h2>
          </div>

          {/* Items */}
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {category.items.map((item) => {
              const isUpdating = updating === item.key;

              return (
                <li key={item.key} className="px-6 py-4">
                  <label className="flex items-start gap-4 cursor-pointer">
                    {/* Checkbox */}
                    <div className="flex-shrink-0 pt-0.5">
                      <input
                        type="checkbox"
                        checked={item.isComplete}
                        onChange={() => handleToggle(item.key, item.isComplete)}
                        disabled={isUpdating}
                        className={`
                          w-5 h-5 rounded border-2 cursor-pointer
                          ${item.isComplete
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-gray-300 dark:border-gray-600"
                          }
                          ${isUpdating ? "opacity-50" : ""}
                          focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                        `}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium ${
                        item.isComplete
                          ? "text-gray-500 dark:text-gray-400 line-through"
                          : "text-gray-900 dark:text-white"
                      }`}>
                        {item.label}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {item.description}
                      </div>
                      {item.completedAt && (
                        <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Completed {new Date(item.completedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* Status indicator */}
                    <div className="flex-shrink-0">
                      {isUpdating ? (
                        <span className="text-sm text-gray-400">Saving...</span>
                      ) : item.isComplete ? (
                        <svg
                          className="w-5 h-5 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-gray-300 dark:text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="12" r="10" strokeWidth="2" />
                        </svg>
                      )}
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {/* Quick Links */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Quick Links
        </h3>
        <div className="flex flex-wrap gap-3">
          <a
            href="/admin/domains"
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Manage Domains &rarr;
          </a>
          <a
            href="/admin/settings"
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Site Settings &rarr;
          </a>
          <a
            href="/admin/pages"
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Manage Pages &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
