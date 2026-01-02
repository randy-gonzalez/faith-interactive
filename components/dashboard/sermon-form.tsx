/**
 * Sermon Form Component
 *
 * Reusable form for creating and editing sermons.
 * Includes speaker selection, series, scripture references, topics, and artwork.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MediaPicker } from "@/components/dashboard/media-picker";
import { ScripturePicker, type ScriptureReference } from "@/components/dashboard/scripture-picker";
import { TopicSelector } from "@/components/dashboard/topic-selector";
import type { Sermon, Speaker, SermonSeries } from "@prisma/client";

interface SermonWithRelations extends Sermon {
  speaker?: Speaker | null;
  series?: SermonSeries | null;
  topics?: Array<{ topic: { id: string; name: string } }>;
  scriptureReferences?: Array<{
    id: string;
    bookId: string;
    book?: { name: string };
    startChapter: number;
    startVerse: number | null;
    endChapter: number | null;
    endVerse: number | null;
  }>;
}

interface SermonFormProps {
  initialData?: SermonWithRelations;
  canEdit: boolean;
}

export function SermonForm({ initialData, canEdit }: SermonFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  // Basic fields
  const [title, setTitle] = useState(initialData?.title || "");
  const [date, setDate] = useState(
    initialData?.date
      ? new Date(initialData.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [description, setDescription] = useState(initialData?.description || "");
  const [notes, setNotes] = useState(initialData?.notes || "");

  // Speaker
  const [speakerId, setSpeakerId] = useState(initialData?.speakerId || "");
  const [speakerName, setSpeakerName] = useState(initialData?.speakerName || "");
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loadingSpeakers, setLoadingSpeakers] = useState(true);

  // Series
  const [seriesId, setSeriesId] = useState(initialData?.seriesId || "");
  const [seriesOrder, setSeriesOrder] = useState<number | "">(initialData?.seriesOrder || "");
  const [seriesList, setSeriesList] = useState<SermonSeries[]>([]);
  const [loadingSeries, setLoadingSeries] = useState(true);

  // Scripture
  const [scripture, setScripture] = useState(initialData?.scripture || "");
  const [scriptureReferences, setScriptureReferences] = useState<ScriptureReference[]>(
    initialData?.scriptureReferences?.map((ref) => ({
      id: ref.id,
      bookId: ref.bookId,
      bookName: ref.book?.name,
      startChapter: ref.startChapter,
      startVerse: ref.startVerse,
      endChapter: ref.endChapter,
      endVerse: ref.endVerse,
    })) || []
  );

  // Topics
  const [topicIds, setTopicIds] = useState<string[]>(
    initialData?.topics?.map((t) => t.topic.id) || []
  );

  // Media
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || "");
  const [audioUrl, setAudioUrl] = useState(initialData?.audioUrl || "");
  const [artworkUrl, setArtworkUrl] = useState(initialData?.artworkUrl || "");

  // Form state
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch speakers and series on mount
  useEffect(() => {
    fetchSpeakers();
    fetchSeries();
  }, []);

  async function fetchSpeakers() {
    try {
      const response = await fetch("/api/speakers");
      if (response.ok) {
        const data = await response.json();
        setSpeakers(data.speakers || []);
      }
    } catch (error) {
      console.error("Failed to fetch speakers:", error);
    } finally {
      setLoadingSpeakers(false);
    }
  }

  async function fetchSeries() {
    try {
      const response = await fetch("/api/sermon-series");
      if (response.ok) {
        const data = await response.json();
        setSeriesList(data.series || []);
      }
    } catch (error) {
      console.error("Failed to fetch series:", error);
    } finally {
      setLoadingSeries(false);
    }
  }

  function handleSpeakerChange(value: string) {
    if (value === "custom") {
      setSpeakerId("");
      // Keep speakerName for custom entry
    } else if (value === "") {
      setSpeakerId("");
      setSpeakerName("");
    } else {
      setSpeakerId(value);
      // Clear custom name when selecting from dropdown
      const speaker = speakers.find((s) => s.id === value);
      if (speaker) {
        setSpeakerName(speaker.name);
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit) return;

    setError("");
    setFieldErrors({});
    setSaving(true);

    try {
      const url = isEditing ? `/api/sermons/${initialData.id}` : "/api/sermons";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          date,
          speakerId: speakerId || null,
          speakerName: speakerId ? null : speakerName || null,
          seriesId: seriesId || null,
          seriesOrder: seriesOrder === "" ? null : seriesOrder,
          scripture: scripture || null,
          scriptureReferences,
          description: description || null,
          notes: notes || null,
          videoUrl: videoUrl || null,
          audioUrl: audioUrl || null,
          artworkUrl: artworkUrl || null,
          topicIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details?.fieldErrors) {
          const errors: Record<string, string> = {};
          for (const [field, messages] of Object.entries(data.details.fieldErrors)) {
            errors[field] = (messages as string[])[0];
          }
          setFieldErrors(errors);
        } else {
          setError(data.error || "Failed to save sermon");
        }
        setSaving(false);
        return;
      }

      router.push("/admin/sermons");
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!initialData || !canEdit) return;
    setPublishing(true);

    try {
      const action = initialData.status === "PUBLISHED" ? "unpublish" : "publish";
      const response = await fetch(`/api/sermons/${initialData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to update status");
        setPublishing(false);
        return;
      }

      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setPublishing(false);
    }
  }

  async function handleDelete() {
    if (!initialData || !canEdit) return;
    if (!confirm("Are you sure you want to delete this sermon?")) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/sermons/${initialData.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to delete sermon");
        setDeleting(false);
        return;
      }

      router.push("/admin/sermons");
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
      setDeleting(false);
    }
  }

  const useCustomSpeaker = !speakerId && speakerName;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <section className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Basic Information
        </h3>

        <Input
          label="Title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={!canEdit}
          error={fieldErrors.title}
          placeholder="Sermon title"
        />

        <Input
          label="Date"
          name="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          disabled={!canEdit}
          error={fieldErrors.date}
        />

        <Textarea
          label="Description (optional)"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={!canEdit}
          error={fieldErrors.description}
          placeholder="Brief description of the sermon..."
          rows={3}
        />
      </section>

      {/* Speaker */}
      <section className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Speaker
        </h3>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Speaker
          </label>
          <select
            value={useCustomSpeaker ? "custom" : speakerId}
            onChange={(e) => handleSpeakerChange(e.target.value)}
            disabled={!canEdit || loadingSpeakers}
            className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">Select speaker...</option>
            {speakers
              .filter((s) => s.status === "PUBLISHED")
              .map((speaker) => (
                <option key={speaker.id} value={speaker.id}>
                  {speaker.name}
                  {speaker.title && ` (${speaker.title})`}
                </option>
              ))}
            <option value="custom">Enter custom name...</option>
          </select>

          {useCustomSpeaker && (
            <Input
              label="Custom Speaker Name"
              value={speakerName}
              onChange={(e) => setSpeakerName(e.target.value)}
              disabled={!canEdit}
              placeholder="Guest speaker name"
            />
          )}
        </div>
      </section>

      {/* Series */}
      <section className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Series
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Sermon Series (optional)
            </label>
            <select
              value={seriesId}
              onChange={(e) => setSeriesId(e.target.value)}
              disabled={!canEdit || loadingSeries}
              className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">No series</option>
              {seriesList
                .filter((s) => s.status === "PUBLISHED")
                .map((series) => (
                  <option key={series.id} value={series.id}>
                    {series.name}
                  </option>
                ))}
            </select>
          </div>

          {seriesId && (
            <Input
              label="Order in Series"
              type="number"
              min={1}
              value={seriesOrder}
              onChange={(e) =>
                setSeriesOrder(e.target.value === "" ? "" : parseInt(e.target.value))
              }
              disabled={!canEdit}
              placeholder="1"
            />
          )}
        </div>
      </section>

      {/* Scripture */}
      <section className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Scripture
        </h3>

        <ScripturePicker
          value={scriptureReferences}
          onChange={setScriptureReferences}
          disabled={!canEdit}
        />

        <Input
          label="Scripture Text (optional)"
          name="scripture"
          value={scripture}
          onChange={(e) => setScripture(e.target.value)}
          disabled={!canEdit}
          error={fieldErrors.scripture}
          placeholder="e.g., John 3:16 or Matthew 5:1-12"
        />
        <p className="text-xs text-gray-500">
          You can use the picker above for structured references, or enter text here for display.
        </p>
      </section>

      {/* Topics */}
      <section className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Topics
        </h3>

        <TopicSelector
          value={topicIds}
          onChange={setTopicIds}
          disabled={!canEdit}
        />
      </section>

      {/* Media */}
      <section className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Media
        </h3>

        <MediaPicker
          label="Sermon Artwork"
          value={artworkUrl}
          onChange={(url) => setArtworkUrl(url || "")}
          disabled={!canEdit}
          placeholder="Select artwork"
        />

        <Input
          label="Video URL (optional)"
          name="videoUrl"
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          disabled={!canEdit}
          error={fieldErrors.videoUrl}
          placeholder="https://youtube.com/watch?v=..."
        />

        <Input
          label="Audio URL (optional)"
          name="audioUrl"
          type="url"
          value={audioUrl}
          onChange={(e) => setAudioUrl(e.target.value)}
          disabled={!canEdit}
          error={fieldErrors.audioUrl}
          placeholder="https://example.com/sermon.mp3"
        />
      </section>

      {/* Notes */}
      <section className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Notes
        </h3>

        <Textarea
          label="Sermon Notes/Outline (optional)"
          name="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={!canEdit}
          error={fieldErrors.notes}
          placeholder="Enter sermon notes, outline, or key points..."
          rows={8}
        />
      </section>

      {/* Actions */}
      {canEdit && (
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Sermon"}
          </Button>

          {isEditing && (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={handlePublish}
                disabled={publishing}
              >
                {publishing
                  ? "Updating..."
                  : initialData.status === "PUBLISHED"
                  ? "Unpublish"
                  : "Publish"}
              </Button>

              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </>
          )}

          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/admin/sermons")}
          >
            Cancel
          </Button>
        </div>
      )}
    </form>
  );
}
