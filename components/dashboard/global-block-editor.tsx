/**
 * Global Block Editor
 *
 * A simplified single-block editor for creating and editing global blocks.
 * Allows selecting a block type and editing its content.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createId } from "@paralleldrive/cuid2";
import {
  Block,
  BlockType,
  BLOCK_TYPES,
  createHeroBlock,
  createTextBlock,
  createImageBlock,
  createVideoBlock,
  createCardGridBlock,
  createFeatureBlock,
  createServiceTimesBlock,
  createContactBlock,
  createSermonFeatureBlock,
  createEventsFeatureBlock,
  createAccordionBlock,
  createDividerBlock,
  createButtonGroupBlock,
  createPopupBlock,
  createCustomHtmlBlock,
} from "@/types/blocks";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { HeroBlockEditor } from "@/components/blocks/hero-block-editor";
import { TextBlockEditor } from "@/components/blocks/text-block-editor";
import { ImageBlockEditor } from "@/components/blocks/image-block-editor";
import { VideoBlockEditor } from "@/components/blocks/video-block-editor";
import { CardGridBlockEditor } from "@/components/blocks/card-grid-block-editor";
import { FeatureBlockEditor } from "@/components/blocks/feature-block-editor";
import { ServiceTimesBlockEditor } from "@/components/blocks/service-times-block-editor";
import { ContactBlockEditor } from "@/components/blocks/contact-block-editor";
import { SermonFeatureBlockEditor } from "@/components/blocks/sermon-feature-block-editor";
import { EventsFeatureBlockEditor } from "@/components/blocks/events-feature-block-editor";
import { AccordionBlockEditor } from "@/components/blocks/accordion-block-editor";
import { DividerBlockEditor } from "@/components/blocks/divider-block-editor";
import { ButtonGroupBlockEditor } from "@/components/blocks/button-group-block-editor";
import { PopupBlockEditor } from "@/components/blocks/popup-block-editor";
import { CustomHtmlBlockEditor } from "@/components/blocks/custom-html-block-editor";
import {
  LayoutTemplate,
  Type,
  Image,
  Video,
  LayoutGrid,
  Columns2,
  Clock,
  Mail,
  BookOpen,
  Calendar,
  ChevronsDown,
  Minus,
  MousePointerClick,
  MessageSquare,
  Code,
  Square,
} from "lucide-react";

// Map block types to Lucide icons
const BLOCK_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  hero: LayoutTemplate,
  text: Type,
  image: Image,
  video: Video,
  "card-grid": LayoutGrid,
  feature: Columns2,
  "service-times": Clock,
  contact: Mail,
  "sermon-feature": BookOpen,
  "events-feature": Calendar,
  accordion: ChevronsDown,
  divider: Minus,
  "button-group": MousePointerClick,
  popup: MessageSquare,
  "custom-html": Code,
};

interface GlobalBlockEditorProps {
  initialData?: {
    id: string;
    name: string;
    description: string | null;
    blockContent: unknown;
  };
  canEdit: boolean;
}

// Block types available for global blocks (excluding global-block references)
const AVAILABLE_BLOCK_TYPES = Object.entries(BLOCK_TYPES).filter(
  ([key]) => key !== "global-block"
) as [BlockType, (typeof BLOCK_TYPES)[BlockType]][];

function createBlockByType(type: BlockType): Block {
  const id = createId();
  const order = 0;

  switch (type) {
    case "hero":
      return createHeroBlock(id, order);
    case "text":
      return createTextBlock(id, order);
    case "image":
      return createImageBlock(id, order);
    case "video":
      return createVideoBlock(id, order);
    case "card-grid":
      return createCardGridBlock(id, order);
    case "feature":
      return createFeatureBlock(id, order);
    case "service-times":
      return createServiceTimesBlock(id, order);
    case "contact":
      return createContactBlock(id, order);
    case "sermon-feature":
      return createSermonFeatureBlock(id, order);
    case "events-feature":
      return createEventsFeatureBlock(id, order);
    case "accordion":
      return createAccordionBlock(id, order);
    case "divider":
      return createDividerBlock(id, order);
    case "button-group":
      return createButtonGroupBlock(id, order);
    case "popup":
      return createPopupBlock(id, order);
    case "custom-html":
      return createCustomHtmlBlock(id, order);
    default:
      return createTextBlock(id, order);
  }
}

function getBlockEditor(block: Block, onChange: (block: Block) => void, disabled?: boolean) {
  switch (block.type) {
    case "hero":
      return <HeroBlockEditor block={block} onChange={onChange} disabled={disabled} />;
    case "text":
      return <TextBlockEditor block={block} onChange={onChange} disabled={disabled} />;
    case "image":
      return <ImageBlockEditor block={block} onChange={onChange} disabled={disabled} />;
    case "video":
      return <VideoBlockEditor block={block} onChange={onChange} disabled={disabled} />;
    case "card-grid":
      return <CardGridBlockEditor block={block} onChange={onChange} disabled={disabled} />;
    case "feature":
      return <FeatureBlockEditor block={block} onChange={onChange} disabled={disabled} />;
    case "service-times":
      return <ServiceTimesBlockEditor block={block} onChange={onChange} disabled={disabled} />;
    case "contact":
      return <ContactBlockEditor block={block} onChange={onChange} disabled={disabled} />;
    case "sermon-feature":
      return <SermonFeatureBlockEditor block={block} onChange={onChange} disabled={disabled} />;
    case "events-feature":
      return <EventsFeatureBlockEditor block={block} onChange={onChange} disabled={disabled} />;
    case "accordion":
      return <AccordionBlockEditor block={block} onChange={onChange} disabled={disabled} />;
    case "divider":
      return <DividerBlockEditor block={block} onChange={onChange} disabled={disabled} />;
    case "button-group":
      return <ButtonGroupBlockEditor block={block} onChange={onChange} disabled={disabled} />;
    case "popup":
      return <PopupBlockEditor block={block} onChange={onChange} disabled={disabled} />;
    case "custom-html":
      return <CustomHtmlBlockEditor block={block} onChange={onChange} disabled={disabled} />;
    default:
      return <div className="text-gray-500">Unknown block type</div>;
  }
}

export function GlobalBlockEditor({ initialData, canEdit }: GlobalBlockEditorProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  // Form state
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [block, setBlock] = useState<Block | null>(() => {
    if (initialData?.blockContent) {
      return initialData.blockContent as Block;
    }
    return null;
  });
  const [selectedType, setSelectedType] = useState<BlockType | null>(() => {
    if (initialData?.blockContent) {
      return (initialData.blockContent as Block).type as BlockType;
    }
    return null;
  });

  // UI state
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  function handleSelectType(type: BlockType) {
    setSelectedType(type);
    setBlock(createBlockByType(type));
  }

  async function handleSave() {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!block) {
      setError("Please select a block type and configure it");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const endpoint = isEditing
        ? `/api/global-blocks/${initialData.id}`
        : "/api/global-blocks";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
          blockContent: block,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to save global block");
        setSaving(false);
        return;
      }

      router.push("/admin/global-blocks");
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this global block? Pages using it will show a placeholder.")) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/global-blocks/${initialData?.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to delete global block");
        setDeleting(false);
        return;
      }

      router.push("/admin/global-blocks");
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Name and Description */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <Input
          label="Block Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!canEdit}
          required
          placeholder="e.g., Header CTA Banner"
        />

        <Textarea
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={!canEdit}
          rows={2}
          placeholder="Brief description of what this block is used for"
        />
      </div>

      {/* Block Type Selector (only shown when creating new) */}
      {!selectedType && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Select Block Type
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {AVAILABLE_BLOCK_TYPES.map(([type, info]) => {
              const IconComponent = BLOCK_ICONS[type] || Square;

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleSelectType(type)}
                  disabled={!canEdit}
                  className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <IconComponent className="w-6 h-6 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">{info.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Block Editor */}
      {block && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {BLOCK_TYPES[block.type as BlockType]?.name || block.type} Content
            </h3>
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setBlock(null);
                  setSelectedType(null);
                }}
              >
                Change Type
              </Button>
            )}
          </div>
          {getBlockEditor(block, setBlock, !canEdit)}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Fixed Actions Bar */}
      {canEdit && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-100 border-t border-gray-300 shadow-lg">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                {isEditing && (
                  <Button
                    variant="danger"
                    onClick={handleDelete}
                    isLoading={deleting}
                  >
                    Delete
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={() => router.push("/admin/global-blocks")}>
                  Cancel
                </Button>

                <Button variant="primary" onClick={handleSave} isLoading={saving}>
                  {isEditing ? "Save Changes" : "Create Global Block"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
