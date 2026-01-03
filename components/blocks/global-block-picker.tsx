/**
 * Global Block Picker
 *
 * Modal dialog to select a global block from the library.
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Library, Search } from "lucide-react";

interface GlobalBlockOption {
  id: string;
  name: string;
  description: string | null;
  blockType: string;
  updatedAt: string;
}

interface GlobalBlockPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (globalBlockId: string, name: string) => void;
  excludeIds?: string[];
}

export function GlobalBlockPicker({
  isOpen,
  onClose,
  onSelect,
  excludeIds = [],
}: GlobalBlockPickerProps) {
  const [globalBlocks, setGlobalBlocks] = useState<GlobalBlockOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadGlobalBlocks();
    }
  }, [isOpen]);

  async function loadGlobalBlocks() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/global-blocks");
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to load global blocks");
        return;
      }

      // Transform data for display
      const blocks: GlobalBlockOption[] = data.data.globalBlocks.map(
        (block: {
          id: string;
          name: string;
          description: string | null;
          blockContent: { type: string };
          updatedAt: string;
        }) => ({
          id: block.id,
          name: block.name,
          description: block.description,
          blockType: block.blockContent?.type || "unknown",
          updatedAt: block.updatedAt,
        })
      );

      setGlobalBlocks(blocks);
    } catch {
      setError("Failed to load global blocks");
    } finally {
      setLoading(false);
    }
  }

  // Filter blocks
  const filteredBlocks = globalBlocks
    .filter((block) => !excludeIds.includes(block.id))
    .filter(
      (block) =>
        !search ||
        block.name.toLowerCase().includes(search.toLowerCase()) ||
        block.description?.toLowerCase().includes(search.toLowerCase())
    );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Library className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Select Global Block
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search global blocks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading global blocks...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : filteredBlocks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {globalBlocks.length === 0
                  ? "No global blocks created yet"
                  : "No matching blocks found"}
              </p>
              {globalBlocks.length === 0 && (
                <a
                  href="/global-blocks/new"
                  className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                >
                  Create your first global block
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredBlocks.map((block) => (
                <button
                  key={block.id}
                  type="button"
                  onClick={() => onSelect(block.id, block.name)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {block.name}
                      </div>
                      {block.description && (
                        <div className="text-sm text-gray-500 mt-0.5">
                          {block.description}
                        </div>
                      )}
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {block.blockType}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <Button variant="ghost" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
