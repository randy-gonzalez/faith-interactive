"use client";

/**
 * Create Stage Form Component
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createStage } from "@/lib/crm/actions";

export function CreateStageForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await createStage({ name: name.trim() });
      if (result.success) {
        setName("");
        router.refresh();
      } else {
        setError(result.error || "Failed to create stage");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    }

    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <label htmlFor="stageName" className="block text-sm font-medium text-gray-700 mb-1">
            New Stage
          </label>
          <input
            type="text"
            id="stageName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter stage name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !name.trim()}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? "Creating..." : "Add Stage"}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </form>
  );
}
