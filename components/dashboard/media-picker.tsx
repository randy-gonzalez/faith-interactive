/**
 * Media Picker Component
 *
 * A modal-based component for selecting images from the media library.
 * Supports inline uploading and returns the selected image URL.
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface MediaItem {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  alt: string | null;
  url: string;
  variantUrls: Record<string, string> | null;
}

interface MediaPickerProps {
  value: string | null;
  onChange: (url: string | null, mediaId?: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export function MediaPicker({
  value,
  onChange,
  label,
  placeholder = "Select an image",
  disabled = false,
  error,
}: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch media when modal opens
  useEffect(() => {
    if (isOpen && media.length === 0) {
      fetchMedia();
    }
  }, [isOpen]);

  async function fetchMedia() {
    setLoading(true);
    try {
      const response = await fetch("/api/media?type=image");
      if (response.ok) {
        const data = await response.json();
        setMedia(data.media || []);
      }
    } catch (error) {
      console.error("Failed to fetch media:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(files: FileList) {
    setUploading(true);
    setUploadError(null);

    const file = files[0];
    if (!file) {
      setUploading(false);
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Only image files are allowed");
      setUploading(false);
      return;
    }

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
          const newItem = data.data.media;
          setMedia((prev) => [newItem, ...prev]);
          setSelectedItem(newItem);
        }
      } else {
        const data = await response.json();
        setUploadError(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleSelect() {
    if (selectedItem) {
      onChange(selectedItem.url, selectedItem.id);
      setIsOpen(false);
      setSelectedItem(null);
    }
  }

  function handleClear() {
    onChange(null);
  }

  function handleClose() {
    setIsOpen(false);
    setSelectedItem(null);
    setUploadError(null);
  }

  // Get preview thumbnail from current value
  const currentImage = value || null;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="flex items-center gap-3">
        {/* Preview */}
        {currentImage ? (
          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
            <img
              src={currentImage}
              alt="Selected image"
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-gray-900/70 text-white flex items-center justify-center hover:bg-gray-900"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(true)}
          disabled={disabled}
        >
          {currentImage ? "Change Image" : placeholder}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={handleClose}
          />

          {/* Modal Content */}
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Select Image
                </h2>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Toolbar */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleUpload(e.target.files);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Upload New Image"}
                  </Button>
                  {uploadError && (
                    <span className="text-sm text-red-600">
                      {uploadError}
                    </span>
                  )}
                </div>
              </div>

              {/* Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                  <div className="text-center py-12 text-gray-500">
                    Loading...
                  </div>
                ) : media.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No images in the library. Upload one to get started.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {media.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        className={`
                          aspect-square rounded-lg overflow-hidden border-2 transition-all
                          hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500
                          ${
                            selectedItem?.id === item.id
                              ? "border-blue-500 ring-2 ring-blue-500"
                              : "border-transparent"
                          }
                        `}
                      >
                        <img
                          src={item.variantUrls?.small || item.url}
                          alt={item.alt || item.filename}
                          className="w-full h-full object-cover bg-gray-100"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-500">
                  {selectedItem ? (
                    <span className="text-gray-900">
                      Selected: {selectedItem.filename}
                    </span>
                  ) : (
                    "Click an image to select it"
                  )}
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="ghost" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSelect}
                    disabled={!selectedItem}
                  >
                    Select Image
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
