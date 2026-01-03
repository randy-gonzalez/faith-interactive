/**
 * Global Block Reference Editor
 *
 * Editor for a global block reference. Shows the selected block
 * and allows changing the selection.
 */

"use client";

import { useState } from "react";
import type { Block, GlobalBlockReference } from "@/types/blocks";
import { Button } from "@/components/ui/button";
import { GlobalBlockPicker } from "./global-block-picker";
import { Library, RefreshCw, ExternalLink } from "lucide-react";

interface GlobalBlockReferenceEditorProps {
  block: Block;
  onChange: (block: Block) => void;
  disabled?: boolean;
}

export function GlobalBlockReferenceEditor({
  block,
  onChange,
  disabled,
}: GlobalBlockReferenceEditorProps) {
  const refBlock = block as GlobalBlockReference;
  const [pickerOpen, setPickerOpen] = useState(false);

  function handleSelect(globalBlockId: string, name: string) {
    onChange({
      ...refBlock,
      data: {
        globalBlockId,
        cachedName: name,
      },
    });
    setPickerOpen(false);
  }

  const hasSelection = !!refBlock.data.globalBlockId;

  return (
    <div className="space-y-4">
      {/* Selected Block Display */}
      {hasSelection ? (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Library className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {refBlock.data.cachedName || "Global Block"}
                </div>
                <div className="text-sm text-gray-500">
                  ID: {refBlock.data.globalBlockId.slice(0, 8)}...
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`/admin/global-blocks/${refBlock.data.globalBlockId}/edit`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-blue-600 rounded"
                title="Edit global block"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              {!disabled && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPickerOpen(true)}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Change
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Library className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">
            No global block selected
          </p>
          {!disabled && (
            <Button
              variant="secondary"
              onClick={() => setPickerOpen(true)}
            >
              Select Global Block
            </Button>
          )}
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
        <p>
          <strong>Live Sync:</strong> Any changes made to the global block will
          automatically appear everywhere it&apos;s used.
        </p>
      </div>

      {/* Picker Modal */}
      <GlobalBlockPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelect}
      />
    </div>
  );
}
