"use client";

/**
 * Block Editor Core Component
 *
 * Main editor component with:
 * - Block list with drag-to-reorder
 * - Add block button/menu
 * - Delete block button per block
 * - Side-by-side layout: Editor (left) | Preview (right)
 */

import { useState, useId } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Block, BlockType } from "@/types/blocks";
import {
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
} from "@/types/blocks";
import { HeroBlockEditor } from "./hero-block-editor";
import { HeroBlockPreview } from "./hero-block-preview";
import { TextBlockEditor } from "./text-block-editor";
import { TextBlockPreview } from "./text-block-preview";
import { ImageBlockEditor } from "./image-block-editor";
import { ImageBlockPreview } from "./image-block-preview";
import { VideoBlockEditor } from "./video-block-editor";
import { VideoBlockPreview } from "./video-block-preview";
import { CardGridBlockEditor } from "./card-grid-block-editor";
import { CardGridBlockPreview } from "./card-grid-block-preview";
import { FeatureBlockEditor } from "./feature-block-editor";
import { FeatureBlockPreview } from "./feature-block-preview";
import { ServiceTimesBlockEditor } from "./service-times-block-editor";
import { ServiceTimesBlockPreview } from "./service-times-block-preview";
import { ContactBlockEditor } from "./contact-block-editor";
import { ContactBlockPreview } from "./contact-block-preview";
import { SermonFeatureBlockEditor } from "./sermon-feature-block-editor";
import { SermonFeatureBlockPreview } from "./sermon-feature-block-preview";
import { EventsFeatureBlockEditor } from "./events-feature-block-editor";
import { EventsFeatureBlockPreview } from "./events-feature-block-preview";
import { AccordionBlockEditor } from "./accordion-block-editor";
import { AccordionBlockPreview } from "./accordion-block-preview";
import { DividerBlockEditor } from "./divider-block-editor";
import { DividerBlockPreview } from "./divider-block-preview";
import { ButtonGroupBlockEditor } from "./button-group-block-editor";
import { ButtonGroupBlockPreview } from "./button-group-block-preview";
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
  Plus,
  X,
} from "lucide-react";

// Map block types to Lucide icons
const BLOCK_ICONS: Record<BlockType, React.ComponentType<{ className?: string }>> = {
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
};

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  disabled?: boolean;
  onPreviewClick?: () => void;
}

// Generate unique IDs
function generateId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Sortable block wrapper
function SortableBlock({
  block,
  onUpdate,
  onDelete,
  disabled,
  isExpanded,
  onToggle,
}: {
  block: Block;
  onUpdate: (block: Block) => void;
  onDelete: () => void;
  disabled?: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Get a preview of the block content for collapsed state
  function getBlockPreview(): string {
    switch (block.type) {
      case "hero": {
        const heroData = block.data as { heading?: string; subheading?: string };
        return heroData.heading || heroData.subheading || "Empty hero block";
      }
      case "text": {
        const textData = block.data as { content?: string };
        return textData.content?.replace(/<[^>]*>/g, "").slice(0, 50) || "Empty text block";
      }
      case "image": {
        const imageData = block.data as { alt?: string; caption?: string };
        return imageData.alt || imageData.caption || "Empty image block";
      }
      case "video": {
        const videoData = block.data as { videoUrl?: string };
        return videoData.videoUrl ? "Video embedded" : "No video URL";
      }
      case "card-grid": {
        const cardData = block.data as { cards?: unknown[] };
        return `${cardData.cards?.length || 0} cards`;
      }
      case "feature": {
        const featureData = block.data as { heading?: string };
        return featureData.heading || "Empty feature block";
      }
      case "service-times": {
        const serviceData = block.data as { services?: unknown[] };
        return `${serviceData.services?.length || 0} services`;
      }
      case "contact": {
        const contactData = block.data as { heading?: string };
        return contactData.heading || "Contact block";
      }
      case "sermon-feature": {
        const sermonData = block.data as { heading?: string };
        return sermonData.heading || "Sermon feature block";
      }
      case "events-feature": {
        const eventsData = block.data as { heading?: string };
        return eventsData.heading || "Events feature block";
      }
      case "accordion": {
        const accordionData = block.data as { items?: unknown[] };
        return `${accordionData.items?.length || 0} items`;
      }
      case "divider": {
        const dividerData = block.data as { style?: string };
        return `${dividerData.style || "line"} divider`;
      }
      case "button-group": {
        const buttonData = block.data as { buttons?: unknown[] };
        return `${buttonData.buttons?.length || 0} buttons`;
      }
      default:
        return "Block content";
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg bg-white mb-3 transition-all ${
        isExpanded ? "border-blue-300 shadow-sm" : "border-gray-200"
      }`}
    >
      {/* Block header - clickable to expand/collapse */}
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
          isExpanded ? "bg-blue-50" : "bg-gray-50 hover:bg-gray-100"
        } ${isExpanded ? "rounded-t-lg" : "rounded-lg"}`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {!disabled && (
            <span
              className="cursor-grab text-gray-400 hover:text-gray-600 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
              {...attributes}
              {...listeners}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </span>
          )}
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-gray-700 capitalize">
              {BLOCK_TYPES[block.type as BlockType]?.name || block.type}
            </span>
            {!isExpanded && (
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {getBlockPreview()}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!disabled && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-gray-400 hover:text-red-600 transition-colors p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </span>
          )}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Block editor content - only shown when expanded */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200">
          {block.type === "hero" && (
            <HeroBlockEditor block={block} onChange={onUpdate} disabled={disabled} />
          )}
          {block.type === "text" && (
            <TextBlockEditor block={block} onChange={onUpdate} disabled={disabled} />
          )}
          {block.type === "image" && (
            <ImageBlockEditor block={block} onChange={onUpdate} disabled={disabled} />
          )}
          {block.type === "video" && (
            <VideoBlockEditor block={block} onChange={onUpdate} disabled={disabled} />
          )}
          {block.type === "card-grid" && (
            <CardGridBlockEditor block={block} onChange={onUpdate} disabled={disabled} />
          )}
          {block.type === "feature" && (
            <FeatureBlockEditor block={block} onChange={onUpdate} disabled={disabled} />
          )}
          {block.type === "service-times" && (
            <ServiceTimesBlockEditor block={block} onChange={onUpdate} disabled={disabled} />
          )}
          {block.type === "contact" && (
            <ContactBlockEditor block={block} onChange={onUpdate} disabled={disabled} />
          )}
          {block.type === "sermon-feature" && (
            <SermonFeatureBlockEditor block={block} onChange={onUpdate} disabled={disabled} />
          )}
          {block.type === "events-feature" && (
            <EventsFeatureBlockEditor block={block} onChange={onUpdate} disabled={disabled} />
          )}
          {block.type === "accordion" && (
            <AccordionBlockEditor block={block} onChange={onUpdate} disabled={disabled} />
          )}
          {block.type === "divider" && (
            <DividerBlockEditor block={block} onChange={onUpdate} disabled={disabled} />
          )}
          {block.type === "button-group" && (
            <ButtonGroupBlockEditor block={block} onChange={onUpdate} disabled={disabled} />
          )}
        </div>
      )}
    </div>
  );
}

export function BlockEditor({ blocks, onChange, disabled, onPreviewClick }: BlockEditorProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(
    blocks.length === 1 ? blocks[0].id : null
  );
  const dndContextId = useId();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      const newBlocks = arrayMove(blocks, oldIndex, newIndex).map((b, i) => ({
        ...b,
        order: i,
      }));
      onChange(newBlocks);
    }
  }

  function addBlock(type: BlockType) {
    const id = generateId();
    const order = blocks.length;

    let newBlock: Block;
    switch (type) {
      case "hero":
        newBlock = createHeroBlock(id, order);
        break;
      case "text":
        newBlock = createTextBlock(id, order);
        break;
      case "image":
        newBlock = createImageBlock(id, order);
        break;
      case "video":
        newBlock = createVideoBlock(id, order);
        break;
      case "card-grid":
        newBlock = createCardGridBlock(id, order);
        break;
      case "feature":
        newBlock = createFeatureBlock(id, order);
        break;
      case "service-times":
        newBlock = createServiceTimesBlock(id, order);
        break;
      case "contact":
        newBlock = createContactBlock(id, order);
        break;
      case "sermon-feature":
        newBlock = createSermonFeatureBlock(id, order);
        break;
      case "events-feature":
        newBlock = createEventsFeatureBlock(id, order);
        break;
      case "accordion":
        newBlock = createAccordionBlock(id, order);
        break;
      case "divider":
        newBlock = createDividerBlock(id, order);
        break;
      case "button-group":
        newBlock = createButtonGroupBlock(id, order);
        break;
      default:
        return;
    }

    onChange([...blocks, newBlock]);
    setExpandedBlockId(id); // Auto-expand new block
    setShowAddMenu(false);
  }

  function updateBlock(updatedBlock: Block) {
    onChange(blocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b)));
  }

  function deleteBlock(id: string) {
    if (!confirm("Are you sure you want to delete this block?")) return;
    onChange(
      blocks
        .filter((b) => b.id !== id)
        .map((b, i) => ({ ...b, order: i }))
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(320px,480px)_1fr] gap-6">
      {/* Editor Panel */}
      <div className="space-y-4 max-w-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Blocks</h3>
          {!disabled && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Block
              </button>

              {showAddMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowAddMenu(false)}
                  />
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-20">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <span className="text-sm font-semibold text-gray-900">Add Block</span>
                      <button
                        type="button"
                        onClick={() => setShowAddMenu(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-3 grid grid-cols-3 gap-2">
                      {Object.entries(BLOCK_TYPES).map(([type, meta]) => {
                        const Icon = BLOCK_ICONS[type as BlockType];
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => addBlock(type as BlockType)}
                            title={meta.description}
                            className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors group"
                          >
                            <Icon className="w-6 h-6 text-gray-500 group-hover:text-blue-600" />
                            <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600 text-center leading-tight">
                              {meta.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {blocks.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <p className="text-gray-500">No blocks yet</p>
            {!disabled && (
              <p className="text-sm text-gray-400 mt-1">
                Click "Add Block" to get started
              </p>
            )}
          </div>
        ) : (
          <DndContext
            id={dndContextId}
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={blocks.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              {blocks
                .sort((a, b) => a.order - b.order)
                .map((block) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    onUpdate={updateBlock}
                    onDelete={() => deleteBlock(block.id)}
                    disabled={disabled}
                    isExpanded={expandedBlockId === block.id}
                    onToggle={() => setExpandedBlockId(
                      expandedBlockId === block.id ? null : block.id
                    )}
                  />
                ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Preview Panel */}
      <div className="space-y-4 min-w-0">
        <button
          type="button"
          onClick={onPreviewClick}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors group"
        >
          Preview
          <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100 min-h-[400px] sticky top-4">
          {blocks.length === 0 ? (
            <div className="flex items-center justify-center h-[400px] text-gray-400">
              Preview will appear here
            </div>
          ) : (
            <div className="bg-white">
              {blocks
                .sort((a, b) => a.order - b.order)
                .map((block) => (
                  <div key={block.id}>
                    {block.type === "hero" && <HeroBlockPreview block={block} />}
                    {block.type === "text" && <TextBlockPreview block={block} />}
                    {block.type === "image" && <ImageBlockPreview block={block} />}
                    {block.type === "video" && <VideoBlockPreview block={block} />}
                    {block.type === "card-grid" && <CardGridBlockPreview block={block} />}
                    {block.type === "feature" && <FeatureBlockPreview block={block} />}
                    {block.type === "service-times" && <ServiceTimesBlockPreview block={block} />}
                    {block.type === "contact" && <ContactBlockPreview block={block} />}
                    {block.type === "sermon-feature" && <SermonFeatureBlockPreview block={block} />}
                    {block.type === "events-feature" && <EventsFeatureBlockPreview block={block} />}
                    {block.type === "accordion" && <AccordionBlockPreview block={block} />}
                    {block.type === "divider" && <DividerBlockPreview block={block} />}
                    {block.type === "button-group" && <ButtonGroupBlockPreview block={block} />}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
