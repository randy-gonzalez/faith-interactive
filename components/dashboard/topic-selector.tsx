/**
 * Topic Selector Component
 *
 * A multi-select chip component for selecting sermon topics.
 * Shows existing topics and allows quick creation of new ones.
 */

"use client";

import { useState, useEffect } from "react";

interface Topic {
  id: string;
  name: string;
  slug: string;
}

interface TopicSelectorProps {
  value: string[]; // Array of topic IDs
  onChange: (topicIds: string[]) => void;
  disabled?: boolean;
  error?: string;
}

export function TopicSelector({
  value,
  onChange,
  disabled = false,
  error,
}: TopicSelectorProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  async function fetchTopics() {
    try {
      const response = await fetch("/api/sermon-topics");
      if (response.ok) {
        const data = await response.json();
        setTopics(data.topics || []);
      }
    } catch (error) {
      console.error("Failed to fetch topics:", error);
    } finally {
      setLoading(false);
    }
  }

  function toggleTopic(topicId: string) {
    if (disabled) return;

    if (value.includes(topicId)) {
      onChange(value.filter((id) => id !== topicId));
    } else {
      onChange([...value, topicId]);
    }
  }

  async function handleCreateTopic() {
    if (!newTopicName.trim()) return;

    setCreating(true);
    try {
      const slug = newTopicName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const response = await fetch("/api/sermon-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTopicName.trim(),
          slug,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newTopic = data.topic;
        setTopics((prev) => [...prev, newTopic]);
        onChange([...value, newTopic.id]);
        setNewTopicName("");
        setShowInput(false);
      }
    } catch (error) {
      console.error("Failed to create topic:", error);
    } finally {
      setCreating(false);
    }
  }

  const selectedTopics = topics.filter((t) => value.includes(t.id));
  const availableTopics = topics.filter((t) => !value.includes(t.id));

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Topics
      </label>

      {loading ? (
        <div className="text-sm text-gray-500">Loading topics...</div>
      ) : (
        <>
          {/* Selected topics */}
          {selectedTopics.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedTopics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => toggleTopic(topic.id)}
                  disabled={disabled}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 disabled:opacity-50"
                >
                  {topic.name}
                  {!disabled && (
                    <svg
                      className="w-4 h-4"
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
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Available topics */}
          {availableTopics.length > 0 && !disabled && (
            <div className="flex flex-wrap gap-2">
              {availableTopics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => toggleTopic(topic.id)}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  {topic.name}
                </button>
              ))}
            </div>
          )}

          {/* Create new topic */}
          {!disabled && (
            <>
              {showInput ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    placeholder="New topic name"
                    className="flex-1 px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white text-gray-900"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCreateTopic();
                      }
                      if (e.key === "Escape") {
                        setShowInput(false);
                        setNewTopicName("");
                      }
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleCreateTopic}
                    disabled={creating || !newTopicName.trim()}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {creating ? "..." : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowInput(false);
                      setNewTopicName("");
                    }}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowInput(true)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Create new topic
                </button>
              )}
            </>
          )}

          {topics.length === 0 && !showInput && (
            <p className="text-sm text-gray-500">
              No topics yet.{" "}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => setShowInput(true)}
                  className="text-blue-600 hover:underline"
                >
                  Create one
                </button>
              )}
            </p>
          )}
        </>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
