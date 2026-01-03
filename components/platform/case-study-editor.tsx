"use client";

/**
 * Case Study Editor Component
 *
 * Multi-tab editor for case studies.
 * Tabs: Basic Info | Media | Testimonial | SEO
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabPanel } from "@/components/ui/tabs";

interface CaseStudyEditorProps {
  caseStudy?: {
    id: string;
    churchName: string;
    slug: string;
    logo: string | null;
    description: string | null;
    images: unknown;
    beforeImage: string | null;
    afterImage: string | null;
    testimonialQuote: string | null;
    testimonialName: string | null;
    testimonialTitle: string | null;
    metrics: unknown;
    liveSiteUrl: string | null;
    featured: boolean;
    sortOrder: number;
    status: string;
  };
}

const TABS = [
  { id: "basic", label: "Basic Info" },
  { id: "media", label: "Media" },
  { id: "testimonial", label: "Testimonial" },
  { id: "metrics", label: "Metrics" },
];

interface MetricItem {
  label: string;
  value: string;
}

export function CaseStudyEditor({ caseStudy }: CaseStudyEditorProps) {
  const router = useRouter();
  const isEditing = !!caseStudy;

  const [activeTab, setActiveTab] = useState("basic");

  // Form state
  const [churchName, setChurchName] = useState(caseStudy?.churchName || "");
  const [slug, setSlug] = useState(caseStudy?.slug || "");
  const [logo, setLogo] = useState(caseStudy?.logo || "");
  const [description, setDescription] = useState(caseStudy?.description || "");
  const [images, setImages] = useState<string[]>(
    Array.isArray(caseStudy?.images) ? (caseStudy.images as string[]) : []
  );
  const [beforeImage, setBeforeImage] = useState(caseStudy?.beforeImage || "");
  const [afterImage, setAfterImage] = useState(caseStudy?.afterImage || "");
  const [testimonialQuote, setTestimonialQuote] = useState(caseStudy?.testimonialQuote || "");
  const [testimonialName, setTestimonialName] = useState(caseStudy?.testimonialName || "");
  const [testimonialTitle, setTestimonialTitle] = useState(caseStudy?.testimonialTitle || "");
  const [metrics, setMetrics] = useState<MetricItem[]>(
    caseStudy?.metrics && typeof caseStudy.metrics === "object"
      ? Object.entries(caseStudy.metrics as Record<string, string>).map(([label, value]) => ({
          label,
          value,
        }))
      : []
  );
  const [liveSiteUrl, setLiveSiteUrl] = useState(caseStudy?.liveSiteUrl || "");
  const [featured, setFeatured] = useState(caseStudy?.featured || false);
  const [sortOrder, setSortOrder] = useState(caseStudy?.sortOrder || 0);
  const [status, setStatus] = useState(caseStudy?.status || "DRAFT");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState("");

  // Auto-generate slug from church name
  function handleChurchNameChange(newName: string) {
    setChurchName(newName);
    if (!isEditing && slug === generateSlug(churchName)) {
      setSlug(generateSlug(newName));
    }
  }

  function generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  function addImage() {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  }

  function removeImage(index: number) {
    setImages(images.filter((_, i) => i !== index));
  }

  function addMetric() {
    setMetrics([...metrics, { label: "", value: "" }]);
  }

  function updateMetric(index: number, field: "label" | "value", value: string) {
    const updated = [...metrics];
    updated[index][field] = value;
    setMetrics(updated);
  }

  function removeMetric(index: number) {
    setMetrics(metrics.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Convert metrics array to object
    const metricsObj = metrics.reduce(
      (acc, m) => {
        if (m.label.trim()) {
          acc[m.label.trim()] = m.value.trim();
        }
        return acc;
      },
      {} as Record<string, string>
    );

    try {
      const url = isEditing
        ? `/api/platform/marketing/case-studies/${caseStudy.id}`
        : "/api/platform/marketing/case-studies";

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchName,
          slug,
          logo: logo || null,
          description: description || null,
          images: images.length > 0 ? images : null,
          beforeImage: beforeImage || null,
          afterImage: afterImage || null,
          testimonialQuote: testimonialQuote || null,
          testimonialName: testimonialName || null,
          testimonialTitle: testimonialTitle || null,
          metrics: Object.keys(metricsObj).length > 0 ? metricsObj : null,
          liveSiteUrl: liveSiteUrl || null,
          featured,
          sortOrder,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save case study");
      }

      router.push("/marketing/case-studies");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!isEditing || !confirm("Are you sure you want to delete this case study?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/platform/marketing/case-studies/${caseStudy.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete case study");
      }

      router.push("/marketing/case-studies");
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

      {/* Church Name */}
      <div>
        <label htmlFor="churchName" className="block text-sm font-medium text-gray-700 mb-1">
          Church Name *
        </label>
        <input
          type="text"
          id="churchName"
          value={churchName}
          onChange={(e) => handleChurchNameChange(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="First Baptist Church"
        />
      </div>

      {/* Tabs */}
      <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab}>
        {/* Basic Info Tab */}
        <TabPanel id="basic" activeTab={activeTab}>
          <div className="space-y-6">
            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                URL Slug *
              </label>
              <div className="flex items-center">
                <span className="px-4 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 text-sm">
                  /case-studies/
                </span>
                <input
                  type="text"
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  required
                  pattern="^[a-z0-9-]+$"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="first-baptist-church"
                />
              </div>
            </div>

            {/* Logo */}
            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
                Church Logo URL
              </label>
              <input
                type="text"
                id="logo"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://..."
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Tell the story of this church's website transformation..."
              />
            </div>

            {/* Live Site URL */}
            <div>
              <label htmlFor="liveSiteUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Live Site URL
              </label>
              <input
                type="url"
                id="liveSiteUrl"
                value={liveSiteUrl}
                onChange={(e) => setLiveSiteUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://firstbaptist.church"
              />
            </div>

            {/* Featured & Sort Order */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Featured on homepage</span>
                </label>
              </div>
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
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="DRAFT"
                    checked={status === "DRAFT"}
                    onChange={(e) => setStatus(e.target.value)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-gray-700">Draft</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="PUBLISHED"
                    checked={status === "PUBLISHED"}
                    onChange={(e) => setStatus(e.target.value)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-gray-700">Published</span>
                </label>
              </div>
            </div>
          </div>
        </TabPanel>

        {/* Media Tab */}
        <TabPanel id="media" activeTab={activeTab}>
          <div className="space-y-6">
            {/* Before/After Images */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="beforeImage" className="block text-sm font-medium text-gray-700 mb-1">
                  Before Image URL
                </label>
                <input
                  type="text"
                  id="beforeImage"
                  value={beforeImage}
                  onChange={(e) => setBeforeImage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://..."
                />
                {beforeImage && (
                  <img src={beforeImage} alt="Before" className="mt-2 h-32 object-cover rounded" />
                )}
              </div>
              <div>
                <label htmlFor="afterImage" className="block text-sm font-medium text-gray-700 mb-1">
                  After Image URL
                </label>
                <input
                  type="text"
                  id="afterImage"
                  value={afterImage}
                  onChange={(e) => setAfterImage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://..."
                />
                {afterImage && (
                  <img src={afterImage} alt="After" className="mt-2 h-32 object-cover rounded" />
                )}
              </div>
            </div>

            {/* Gallery Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images</label>
              <div className="space-y-2">
                {images.map((img, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={img}
                      readOnly
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://... (add image URL)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={addImage}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>

        {/* Testimonial Tab */}
        <TabPanel id="testimonial" activeTab={activeTab}>
          <div className="space-y-6">
            <div>
              <label htmlFor="testimonialQuote" className="block text-sm font-medium text-gray-700 mb-1">
                Quote
              </label>
              <textarea
                id="testimonialQuote"
                value={testimonialQuote}
                onChange={(e) => setTestimonialQuote(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="What the church said about working with Faith Interactive..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="testimonialName" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="testimonialName"
                  value={testimonialName}
                  onChange={(e) => setTestimonialName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Pastor John Smith"
                />
              </div>
              <div>
                <label htmlFor="testimonialTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="testimonialTitle"
                  value={testimonialTitle}
                  onChange={(e) => setTestimonialTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Senior Pastor"
                />
              </div>
            </div>
          </div>
        </TabPanel>

        {/* Metrics Tab */}
        <TabPanel id="metrics" activeTab={activeTab}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Add metrics to showcase the results (e.g., &ldquo;Traffic Increase&rdquo; → &ldquo;+200%&rdquo;)
            </p>

            {metrics.map((metric, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={metric.label}
                  onChange={(e) => updateMetric(index, "label", e.target.value)}
                  placeholder="Metric Label"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="text"
                  value={metric.value}
                  onChange={(e) => updateMetric(index, "value", e.target.value)}
                  placeholder="Value"
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => removeMetric(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addMetric}
              className="px-4 py-2 text-indigo-600 hover:text-indigo-800"
            >
              + Add Metric
            </button>
          </div>
        </TabPanel>
      </Tabs>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : isEditing ? "Update Case Study" : "Create Case Study"}
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
            Delete Case Study
          </button>
        )}
      </div>
    </form>
  );
}
