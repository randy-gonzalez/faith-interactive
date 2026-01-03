"use client";

/**
 * Navigation Link Editor Component
 *
 * Editable list of navigation links with:
 * - Add/remove links
 * - Page selection or external URL
 * - Multi-level dropdown support (children)
 * - Drag-and-drop reordering
 */

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { NavLinkExtended, NavLinkChild } from "@/types/template";

interface PageOption {
  id: string;
  title: string;
  urlPath: string | null;
}

interface NavigationLinkEditorProps {
  links: NavLinkExtended[];
  onChange: (links: NavLinkExtended[]) => void;
  pages: PageOption[];
  disabled?: boolean;
  allowDropdowns?: boolean;
}

function generateId(): string {
  return `nav-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function NavigationLinkEditor({
  links,
  onChange,
  pages,
  disabled = false,
  allowDropdowns = true,
}: NavigationLinkEditorProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = useCallback((id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const addLink = useCallback(() => {
    const newLink: NavLinkExtended = {
      id: generateId(),
      label: "New Link",
      href: "/",
      isExternal: false,
      order: links.length,
      children: [],
    };
    onChange([...links, newLink]);
  }, [links, onChange]);

  const updateLink = useCallback(
    (id: string, updates: Partial<NavLinkExtended>) => {
      onChange(
        links.map((link) =>
          link.id === id ? { ...link, ...updates } : link
        )
      );
    },
    [links, onChange]
  );

  const removeLink = useCallback(
    (id: string) => {
      onChange(
        links
          .filter((link) => link.id !== id)
          .map((link, index) => ({ ...link, order: index }))
      );
    },
    [links, onChange]
  );

  const moveLink = useCallback(
    (id: string, direction: "up" | "down") => {
      const index = links.findIndex((link) => link.id === id);
      if (
        (direction === "up" && index === 0) ||
        (direction === "down" && index === links.length - 1)
      ) {
        return;
      }

      const newLinks = [...links];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      [newLinks[index], newLinks[targetIndex]] = [
        newLinks[targetIndex],
        newLinks[index],
      ];

      onChange(newLinks.map((link, i) => ({ ...link, order: i })));
    },
    [links, onChange]
  );

  const addChild = useCallback(
    (parentId: string) => {
      const parent = links.find((link) => link.id === parentId);
      if (!parent) return;

      const newChild: NavLinkChild = {
        id: generateId(),
        label: "Sub Link",
        href: "/",
        isExternal: false,
        order: (parent.children || []).length,
      };

      updateLink(parentId, {
        children: [...(parent.children || []), newChild],
      });

      // Expand the parent to show the new child
      setExpandedItems((prev) => new Set(prev).add(parentId));
    },
    [links, updateLink]
  );

  const updateChild = useCallback(
    (parentId: string, childId: string, updates: Partial<NavLinkChild>) => {
      const parent = links.find((link) => link.id === parentId);
      if (!parent) return;

      updateLink(parentId, {
        children: (parent.children || []).map((child) =>
          child.id === childId ? { ...child, ...updates } : child
        ),
      });
    },
    [links, updateLink]
  );

  const removeChild = useCallback(
    (parentId: string, childId: string) => {
      const parent = links.find((link) => link.id === parentId);
      if (!parent) return;

      updateLink(parentId, {
        children: (parent.children || [])
          .filter((child) => child.id !== childId)
          .map((child, index) => ({ ...child, order: index })),
      });
    },
    [links, updateLink]
  );

  const moveChild = useCallback(
    (parentId: string, childId: string, direction: "up" | "down") => {
      const parent = links.find((link) => link.id === parentId);
      if (!parent || !parent.children) return;

      const index = parent.children.findIndex((child) => child.id === childId);
      if (
        (direction === "up" && index === 0) ||
        (direction === "down" && index === parent.children.length - 1)
      ) {
        return;
      }

      const newChildren = [...parent.children];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      [newChildren[index], newChildren[targetIndex]] = [
        newChildren[targetIndex],
        newChildren[index],
      ];

      updateLink(parentId, {
        children: newChildren.map((child, i) => ({ ...child, order: i })),
      });
    },
    [links, updateLink]
  );

  const handlePageSelect = useCallback(
    (linkId: string, pageId: string) => {
      const page = pages.find((p) => p.id === pageId);
      if (page) {
        updateLink(linkId, {
          pageId: page.id,
          href: page.urlPath ? `/${page.urlPath}` : "/",
          label: page.title,
          isExternal: false,
        });
      }
    },
    [pages, updateLink]
  );

  const handleChildPageSelect = useCallback(
    (parentId: string, childId: string, pageId: string) => {
      const page = pages.find((p) => p.id === pageId);
      if (page) {
        updateChild(parentId, childId, {
          href: page.urlPath ? `/${page.urlPath}` : "/",
          label: page.title,
          isExternal: false,
        });
      }
    },
    [pages, updateChild]
  );

  return (
    <div className="space-y-4">
      {/* Links List */}
      {links.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-sm text-gray-500 mb-3">No navigation links yet</p>
          {!disabled && (
            <Button type="button" variant="secondary" onClick={addLink}>
              Add Link
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {links.map((link, index) => (
            <div key={link.id} className="border border-gray-200 rounded-lg">
              {/* Main Link Row */}
              <div className="flex items-center gap-2 p-3 bg-white">
                {/* Expand/Collapse (if has children or dropdowns allowed) */}
                {allowDropdowns && (
                  <button
                    type="button"
                    onClick={() => toggleExpanded(link.id)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    disabled={disabled}
                  >
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        expandedItems.has(link.id) ? "rotate-90" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                )}

                {/* Link Type Toggle */}
                <select
                  value={link.isExternal ? "external" : "page"}
                  onChange={(e) => {
                    const isExternal = e.target.value === "external";
                    updateLink(link.id, {
                      isExternal,
                      pageId: isExternal ? undefined : link.pageId,
                    });
                  }}
                  disabled={disabled}
                  className="px-2 py-1 text-xs border border-gray-200 rounded bg-white text-gray-700"
                >
                  <option value="page">Page</option>
                  <option value="external">External</option>
                </select>

                {/* Page Select or URL Input */}
                {link.isExternal ? (
                  <input
                    type="text"
                    value={link.href}
                    onChange={(e) => updateLink(link.id, { href: e.target.value })}
                    disabled={disabled}
                    className="flex-1 min-w-0 px-2 py-1 text-sm border border-gray-200 rounded text-gray-900"
                    placeholder="https://..."
                  />
                ) : (
                  <select
                    value={link.pageId || ""}
                    onChange={(e) => handlePageSelect(link.id, e.target.value)}
                    disabled={disabled}
                    className="flex-1 min-w-0 px-2 py-1 text-sm border border-gray-200 rounded bg-white text-gray-900"
                  >
                    <option value="">Select a page...</option>
                    {pages.map((page) => (
                      <option key={page.id} value={page.id}>
                        {page.title}
                      </option>
                    ))}
                  </select>
                )}

                {/* Label Override */}
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => updateLink(link.id, { label: e.target.value })}
                  disabled={disabled}
                  className="w-32 px-2 py-1 text-sm border border-gray-200 rounded text-gray-900"
                  placeholder="Label"
                />

                {/* Move Buttons */}
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveLink(link.id, "up")}
                    disabled={disabled || index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Move up"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveLink(link.id, "down")}
                    disabled={disabled || index === links.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Move down"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => removeLink(link.id)}
                  disabled={disabled}
                  className="p-1 text-gray-400 hover:text-red-500"
                  title="Remove link"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Children (Dropdown Items) */}
              {allowDropdowns && expandedItems.has(link.id) && (
                <div className="border-t border-gray-100 bg-gray-50 p-3">
                  <div className="pl-6 space-y-2">
                    {(link.children || []).map((child, childIndex) => (
                      <div
                        key={child.id}
                        className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded"
                      >
                        {/* Child Link Type */}
                        <select
                          value={child.isExternal ? "external" : "page"}
                          onChange={(e) => {
                            updateChild(link.id, child.id, {
                              isExternal: e.target.value === "external",
                            });
                          }}
                          disabled={disabled}
                          className="px-2 py-1 text-xs border border-gray-200 rounded bg-white text-gray-700"
                        >
                          <option value="page">Page</option>
                          <option value="external">External</option>
                        </select>

                        {/* Child Page/URL */}
                        {child.isExternal ? (
                          <input
                            type="text"
                            value={child.href}
                            onChange={(e) =>
                              updateChild(link.id, child.id, { href: e.target.value })
                            }
                            disabled={disabled}
                            className="flex-1 min-w-0 px-2 py-1 text-sm border border-gray-200 rounded text-gray-900"
                            placeholder="https://..."
                          />
                        ) : (
                          <select
                            value=""
                            onChange={(e) =>
                              handleChildPageSelect(link.id, child.id, e.target.value)
                            }
                            disabled={disabled}
                            className="flex-1 min-w-0 px-2 py-1 text-sm border border-gray-200 rounded bg-white text-gray-900"
                          >
                            <option value="">Select a page...</option>
                            {pages.map((page) => (
                              <option key={page.id} value={page.id}>
                                {page.title}
                              </option>
                            ))}
                          </select>
                        )}

                        {/* Child Label */}
                        <input
                          type="text"
                          value={child.label}
                          onChange={(e) =>
                            updateChild(link.id, child.id, { label: e.target.value })
                          }
                          disabled={disabled}
                          className="w-28 px-2 py-1 text-sm border border-gray-200 rounded text-gray-900"
                          placeholder="Label"
                        />

                        {/* Child Move Buttons */}
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => moveChild(link.id, child.id, "up")}
                            disabled={disabled || childIndex === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            title="Move up"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => moveChild(link.id, child.id, "down")}
                            disabled={
                              disabled ||
                              childIndex === (link.children || []).length - 1
                            }
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            title="Move down"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>

                        {/* Child Delete */}
                        <button
                          type="button"
                          onClick={() => removeChild(link.id, child.id)}
                          disabled={disabled}
                          className="p-1 text-gray-400 hover:text-red-500"
                          title="Remove sub-link"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}

                    {/* Add Child Button */}
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => addChild(link.id)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-2"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add dropdown item
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Link Button */}
      {!disabled && links.length > 0 && (
        <Button type="button" variant="secondary" onClick={addLink}>
          Add Link
        </Button>
      )}
    </div>
  );
}
