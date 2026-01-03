/**
 * Global Block Reference Preview
 *
 * Shows a preview of the referenced global block in the editor.
 * In the public site, the global block is resolved and rendered inline.
 */

"use client";

import type { Block, GlobalBlockReference } from "@/types/blocks";
import { Library } from "lucide-react";

interface GlobalBlockReferencePreviewProps {
  block: Block;
}

export function GlobalBlockReferencePreview({
  block,
}: GlobalBlockReferencePreviewProps) {
  const refBlock = block as GlobalBlockReference;
  const hasSelection = !!refBlock.data.globalBlockId;

  if (!hasSelection) {
    return (
      <div className="block-preview px-6 py-8 text-center">
        <div className="max-w-md mx-auto border-2 border-dashed border-gray-300 rounded-lg p-8">
          <Library className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No global block selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="block-preview px-6 py-8">
      <div className="max-w-2xl mx-auto bg-purple-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Library className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="font-medium text-purple-900">
              {refBlock.data.cachedName || "Global Block"}
            </div>
            <div className="text-sm text-purple-600">
              This block&apos;s content will be rendered here
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
