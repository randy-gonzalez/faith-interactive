"use client";

/**
 * Testimonial Editor Component
 *
 * Form for creating and editing testimonials.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

interface TestimonialEditorProps {
  testimonial?: {
    id: string;
    name: string;
    title: string | null;
    company: string | null;
    quote: string;
    image: string | null;
    featured: boolean;
    sortOrder: number;
    isActive: boolean;
  };
}

export function TestimonialEditor({ testimonial }: TestimonialEditorProps) {
  const router = useRouter();
  const isEditing = !!testimonial;

  // Form state
  const [name, setName] = useState(testimonial?.name || "");
  const [title, setTitle] = useState(testimonial?.title || "");
  const [company, setCompany] = useState(testimonial?.company || "");
  const [quote, setQuote] = useState(testimonial?.quote || "");
  const [image, setImage] = useState(testimonial?.image || "");
  const [featured, setFeatured] = useState(testimonial?.featured || false);
  const [sortOrder, setSortOrder] = useState(testimonial?.sortOrder || 0);
  const [isActive, setIsActive] = useState(testimonial?.isActive ?? true);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEditing
        ? `/api/platform/marketing/testimonials/${testimonial.id}`
        : "/api/platform/marketing/testimonials";

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          title: title || null,
          company: company || null,
          quote,
          image: image || null,
          featured,
          sortOrder,
          isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save testimonial");
      }

      router.push("/marketing/testimonials");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!isEditing || !confirm("Are you sure you want to delete this testimonial?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/platform/marketing/testimonials/${testimonial.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete testimonial");
      }

      router.push("/marketing/testimonials");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="John Smith"
        />
      </div>

      {/* Title & Company */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Senior Pastor"
          />
        </div>
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
            Church/Company
          </label>
          <input
            type="text"
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="First Baptist Church"
          />
        </div>
      </div>

      {/* Quote */}
      <div>
        <label htmlFor="quote" className="block text-sm font-medium text-gray-700 mb-1">
          Quote *
        </label>
        <textarea
          id="quote"
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          required
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="What they said about working with Faith Interactive..."
        />
      </div>

      {/* Image */}
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
          Photo URL
        </label>
        <input
          type="text"
          id="image"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="https://..."
        />
        {image && (
          <div className="mt-2">
            <img
              src={image}
              alt={name || "Preview"}
              className="w-16 h-16 object-cover rounded-full"
            />
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">
            Sort Order
          </label>
          <input
            type="number"
            id="sortOrder"
            value={sortOrder}
            onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer pb-2">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Featured</span>
          </label>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer pb-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : isEditing ? "Update Testimonial" : "Create Testimonial"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
        </div>

        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 text-red-600 hover:text-red-800 disabled:opacity-50"
          >
            Delete Testimonial
          </button>
        )}
      </div>
    </form>
  );
}
