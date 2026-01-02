/**
 * Scripture Picker Component
 *
 * Allows selecting structured scripture references (Book, Chapter, Verse).
 * Supports multiple scripture references per sermon.
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ScriptureBook {
  id: string;
  name: string;
  abbreviation: string;
  testament: string;
  sortOrder: number;
  chapterCount: number;
}

export interface ScriptureReference {
  id?: string;
  bookId: string;
  bookName?: string;
  startChapter: number;
  startVerse?: number | null;
  endChapter?: number | null;
  endVerse?: number | null;
}

interface ScripturePickerProps {
  value: ScriptureReference[];
  onChange: (refs: ScriptureReference[]) => void;
  disabled?: boolean;
  error?: string;
}

export function ScripturePicker({
  value,
  onChange,
  disabled = false,
  error,
}: ScripturePickerProps) {
  const [books, setBooks] = useState<ScriptureBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // New reference form state
  const [newBookId, setNewBookId] = useState("");
  const [newStartChapter, setNewStartChapter] = useState(1);
  const [newStartVerse, setNewStartVerse] = useState<number | "">("");
  const [newEndChapter, setNewEndChapter] = useState<number | "">("");
  const [newEndVerse, setNewEndVerse] = useState<number | "">("");

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    try {
      const response = await fetch("/api/scripture-books");
      if (response.ok) {
        const data = await response.json();
        setBooks(data.books || []);
      }
    } catch (error) {
      console.error("Failed to fetch scripture books:", error);
    } finally {
      setLoading(false);
    }
  }

  function getSelectedBook() {
    return books.find((b) => b.id === newBookId);
  }

  function handleAdd() {
    if (!newBookId || !newStartChapter) return;

    const book = books.find((b) => b.id === newBookId);
    if (!book) return;

    const newRef: ScriptureReference = {
      bookId: newBookId,
      bookName: book.name,
      startChapter: newStartChapter,
      startVerse: newStartVerse === "" ? null : newStartVerse,
      endChapter: newEndChapter === "" ? null : newEndChapter,
      endVerse: newEndVerse === "" ? null : newEndVerse,
    };

    onChange([...value, newRef]);
    resetForm();
  }

  function handleRemove(index: number) {
    const newRefs = [...value];
    newRefs.splice(index, 1);
    onChange(newRefs);
  }

  function resetForm() {
    setNewBookId("");
    setNewStartChapter(1);
    setNewStartVerse("");
    setNewEndChapter("");
    setNewEndVerse("");
    setShowAddForm(false);
  }

  function formatReference(ref: ScriptureReference): string {
    const bookName = ref.bookName || books.find((b) => b.id === ref.bookId)?.name || "Unknown";
    let str = `${bookName} ${ref.startChapter}`;

    if (ref.startVerse) {
      str += `:${ref.startVerse}`;
    }

    // Handle range
    if (ref.endChapter && ref.endChapter !== ref.startChapter) {
      str += `-${ref.endChapter}`;
      if (ref.endVerse) {
        str += `:${ref.endVerse}`;
      }
    } else if (ref.endVerse && ref.endVerse !== ref.startVerse) {
      str += `-${ref.endVerse}`;
    }

    return str;
  }

  const selectedBook = getSelectedBook();
  const maxChapters = selectedBook?.chapterCount || 150;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Scripture References
      </label>

      {/* Current references */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((ref, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
            >
              <span>{formatReference(ref)}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="ml-1 hover:text-blue-900"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add reference form */}
      {showAddForm && !disabled && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {/* Book selector */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Book
              </label>
              <select
                value={newBookId}
                onChange={(e) => setNewBookId(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-900"
              >
                <option value="">Select book...</option>
                <optgroup label="Old Testament">
                  {books
                    .filter((b) => b.testament === "OT")
                    .map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.name}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="New Testament">
                  {books
                    .filter((b) => b.testament === "NT")
                    .map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.name}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            {/* Start Chapter */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Chapter
              </label>
              <input
                type="number"
                min={1}
                max={maxChapters}
                value={newStartChapter}
                onChange={(e) => setNewStartChapter(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-900"
              />
            </div>

            {/* Start Verse */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Verse
              </label>
              <input
                type="number"
                min={1}
                placeholder="(optional)"
                value={newStartVerse}
                onChange={(e) =>
                  setNewStartVerse(e.target.value === "" ? "" : parseInt(e.target.value))
                }
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-900"
              />
            </div>

            {/* End Verse */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                End Verse
              </label>
              <input
                type="number"
                min={1}
                placeholder="(optional)"
                value={newEndVerse}
                onChange={(e) =>
                  setNewEndVerse(e.target.value === "" ? "" : parseInt(e.target.value))
                }
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-900"
              />
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleAdd}
              disabled={!newBookId}
            >
              Add Reference
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Add button */}
      {!showAddForm && !disabled && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(true)}
        >
          + Add Scripture Reference
        </Button>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
