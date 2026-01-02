/**
 * Sermon Topics Management Page
 *
 * Displays and manages all sermon topics for the church.
 * Uses inline editing for simple topic management.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: {
    sermons: number;
  };
}

export default function SermonTopicsPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // New topic form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    fetchTopics();
  }, []);

  async function fetchTopics() {
    try {
      const response = await fetch("/api/sermon-topics");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setTopics(data.topics);
    } catch {
      setError("Failed to load topics");
    } finally {
      setLoading(false);
    }
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/sermon-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          slug: newSlug || generateSlug(newName),
          description: newDescription || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create topic");
      }

      setNewName("");
      setNewSlug("");
      setNewDescription("");
      setShowNewForm(false);
      fetchTopics();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create topic");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id: string) {
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/sermon-topics/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          slug: editSlug,
          description: editDescription || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update topic");
      }

      setEditingId(null);
      fetchTopics();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update topic");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"? This will remove the topic from all sermons.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/sermon-topics/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete topic");
      }

      fetchTopics();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete topic");
    }
  }

  function startEdit(topic: Topic) {
    setEditingId(topic.id);
    setEditName(topic.name);
    setEditSlug(topic.slug);
    setEditDescription(topic.description || "");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading topics...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Sermon Topics
          </h1>
          <p className="text-gray-500 mt-1">
            {topics.length} topic{topics.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setShowNewForm(!showNewForm)}>
          {showNewForm ? "Cancel" : "Add Topic"}
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      {showNewForm && (
        <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            New Topic
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Name"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (!newSlug) {
                    setNewSlug(generateSlug(e.target.value));
                  }
                }}
                placeholder="Faith"
                required
              />
              <Input
                label="Slug"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="faith"
                required
              />
            </div>
            <Input
              label="Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Sermons about trusting God..."
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Creating..." : "Create Topic"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowNewForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {topics.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">
            No topics yet. Add a topic to start categorizing sermons.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sermons
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topics.map((topic) => (
                <tr
                  key={topic.id}
                  className="hover:bg-gray-50"
                >
                  {editingId === topic.id ? (
                    <>
                      <td className="px-6 py-4">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="max-w-xs"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Input
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value)}
                          className="max-w-xs"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {topic._count.sermons}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleUpdate(topic.id)}
                          disabled={saving}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-gray-600 hover:text-gray-800 text-sm"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {topic.name}
                          </div>
                          {topic.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {topic.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {topic.slug}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {topic._count.sermons}
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button
                          onClick={() => startEdit(topic)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(topic.id, topic.name)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
