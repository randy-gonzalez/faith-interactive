"use client";

/**
 * Media Library Component
 *
 * Grid view of uploaded media with upload functionality.
 */

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MediaItem {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  alt: string | null;
  url: string;
  variantUrls: Record<string, string> | null;
  createdAt: Date;
  uploadedBy: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface MediaLibraryProps {
  initialMedia: MediaItem[];
  totalCount: number;
}

type FilterType = "all" | "image" | "pdf";

export function MediaLibrary({ initialMedia, totalCount }: MediaLibraryProps) {
  const [media, setMedia] = useState(initialMedia);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [editingAlt, setEditingAlt] = useState(false);
  const [altText, setAltText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredMedia = media.filter((item) => {
    if (filterType === "image") return item.mimeType.startsWith("image/");
    if (filterType === "pdf") return item.mimeType === "application/pdf";
    return true;
  });

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    const uploadedItems: MediaItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading ${i + 1} of ${files.length}: ${file.name}`);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/media", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.media) {
            uploadedItems.push(data.data.media);
          }
        }
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }

    if (uploadedItems.length > 0) {
      setMedia((prev) => [...uploadedItems, ...prev]);
    }

    setUploading(false);
    setUploadProgress(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this file?")) {
      return;
    }

    try {
      const response = await fetch(`/api/media/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMedia((prev) => prev.filter((m) => m.id !== id));
        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleUpdateAlt = async () => {
    if (!selectedItem) return;

    try {
      const response = await fetch(`/api/media/${selectedItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alt: altText }),
      });

      if (response.ok) {
        setMedia((prev) =>
          prev.map((m) =>
            m.id === selectedItem.id ? { ...m, alt: altText } : m
          )
        );
        setSelectedItem((prev) => (prev ? { ...prev, alt: altText } : null));
        setEditingAlt(false);
      }
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isImage = (mimeType: string) => mimeType.startsWith("image/");

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2">
          {(["all", "image", "pdf"] as FilterType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`
                px-3 py-1.5 text-sm rounded-md transition-colors
                ${
                  filterType === type
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }
              `}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleUpload(e.target.files);
              }
            }}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? uploadProgress || "Uploading..." : "Upload Files"}
          </Button>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredMedia.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setSelectedItem(item);
              setAltText(item.alt || "");
              setEditingAlt(false);
            }}
            className={`
              aspect-square rounded-lg overflow-hidden border-2 transition-all
              hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500
              ${
                selectedItem?.id === item.id
                  ? "border-blue-500 ring-2 ring-blue-500"
                  : "border-transparent"
              }
            `}
          >
            {isImage(item.mimeType) ? (
              <img
                src={item.variantUrls?.small || item.url}
                alt={item.alt || item.filename}
                className="w-full h-full object-cover bg-gray-100"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-2">
                <svg
                  className="w-12 h-12 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
                </svg>
                <span className="mt-2 text-xs text-gray-500 truncate w-full text-center">
                  {item.filename}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      {filteredMedia.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No media files found. Upload some files to get started.
        </div>
      )}

      {/* Detail Panel (Sidebar) */}
      {selectedItem && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-gray-200 shadow-xl p-6 overflow-y-auto z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Details
            </h3>
            <button
              onClick={() => setSelectedItem(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Preview */}
          <div className="mb-4">
            {isImage(selectedItem.mimeType) ? (
              <img
                src={selectedItem.variantUrls?.medium || selectedItem.url}
                alt={selectedItem.alt || selectedItem.filename}
                className="w-full rounded-lg bg-gray-100"
              />
            ) : (
              <div className="aspect-video flex items-center justify-center bg-gray-100 rounded-lg">
                <svg className="w-16 h-16 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-500">Filename:</span>
              <p className="text-gray-900 break-all">{selectedItem.filename}</p>
            </div>
            <div>
              <span className="text-gray-500">Size:</span>
              <p className="text-gray-900">{formatSize(selectedItem.size)}</p>
            </div>
            <div>
              <span className="text-gray-500">Type:</span>
              <p className="text-gray-900">{selectedItem.mimeType}</p>
            </div>
            <div>
              <span className="text-gray-500">Uploaded:</span>
              <p className="text-gray-900">{formatDate(selectedItem.createdAt)}</p>
            </div>
            <div>
              <span className="text-gray-500">Uploaded by:</span>
              <p className="text-gray-900">
                {selectedItem.uploadedBy.name || selectedItem.uploadedBy.email}
              </p>
            </div>

            {/* Alt text */}
            {isImage(selectedItem.mimeType) && (
              <div>
                <span className="text-gray-500">Alt text:</span>
                {editingAlt ? (
                  <div className="mt-1 space-y-2">
                    <Input
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      placeholder="Describe this image..."
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleUpdateAlt}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingAlt(false);
                          setAltText(selectedItem.alt || "");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-gray-900 flex-1">
                      {selectedItem.alt || <em className="text-gray-400">Not set</em>}
                    </p>
                    <button
                      onClick={() => setEditingAlt(true)}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* URL */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <span className="text-gray-500 text-sm">URL:</span>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                readOnly
                value={selectedItem.url}
                className="flex-1 text-xs bg-gray-100 border-0 rounded px-2 py-1"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigator.clipboard.writeText(selectedItem.url)}
              >
                Copy
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
            <a
              href={selectedItem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              <Button variant="outline" className="w-full">
                Open in New Tab
              </Button>
            </a>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => handleDelete(selectedItem.id)}
            >
              Delete File
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
