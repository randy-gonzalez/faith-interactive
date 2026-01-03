"use client";

/**
 * Form Editor Component
 *
 * Provides a tabbed interface for editing form configuration:
 * - Fields tab: Drag-and-drop field ordering, field editing
 * - Settings tab: Success message, submit button, spam protection
 * - Notifications tab: Email recipients
 * - Submissions tab: View and manage submissions
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormFieldEditor } from "./form-field-editor";
import { FormSubmissions } from "./form-submissions";
import type { Form, FormType } from "@prisma/client";
import type { FormField, FormSettings } from "@/types/forms";

interface FormEditorProps {
  form: Form & {
    submissionCount?: number;
    unreadCount?: number;
  };
  canEdit: boolean;
  initialTab?: string;
}

type TabType = "fields" | "settings" | "notifications" | "submissions";

export function FormEditor({ form, canEdit, initialTab }: FormEditorProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>(
    (initialTab as TabType) || "fields"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Parse JSON fields
  const [fields, setFields] = useState<FormField[]>(
    (form.fields as unknown as FormField[]) || []
  );
  const [settings, setSettings] = useState<FormSettings>(
    (form.settings as unknown as FormSettings) || {
      successMessage: "Thank you for your submission!",
      submitButtonText: "Submit",
      honeypotEnabled: true,
      honeypotFieldName: "website",
      minSubmitTime: 3,
    }
  );
  const [notifyEmails, setNotifyEmails] = useState<string[]>(
    form.notifyEmails || []
  );
  const [formName, setFormName] = useState(form.name);
  const [formDescription, setFormDescription] = useState(form.description || "");
  const [isActive, setIsActive] = useState(form.isActive);

  const isDefaultForm = form.type !== "CUSTOM";

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/forms/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          description: formDescription || null,
          fields,
          settings,
          notifyEmails,
          isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save form");
      }

      setSuccess("Form saved successfully");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save form");
    } finally {
      setIsSaving(false);
    }
  }, [form.id, formName, formDescription, fields, settings, notifyEmails, isActive, router]);

  const tabs = [
    { id: "fields" as const, label: "Fields" },
    { id: "settings" as const, label: "Settings" },
    { id: "notifications" as const, label: "Notifications" },
    { id: "submissions" as const, label: "Submissions", count: form.unreadCount },
  ];

  return (
    <div className="space-y-6">
      {/* Status messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      {/* Form header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 max-w-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Form Name
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              disabled={!canEdit}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              placeholder="Optional description shown above the form"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={!canEdit}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>
          {canEdit && (
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeTab === "fields" && (
          <FormFieldEditor
            fields={fields}
            onChange={setFields}
            canEdit={canEdit}
          />
        )}

        {activeTab === "settings" && (
          <div className="space-y-6 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Success Message
              </label>
              <textarea
                value={settings.successMessage}
                onChange={(e) =>
                  setSettings({ ...settings, successMessage: e.target.value })
                }
                disabled={!canEdit}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                placeholder="Message shown after successful submission"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Submit Button Text
              </label>
              <input
                type="text"
                value={settings.submitButtonText}
                onChange={(e) =>
                  setSettings({ ...settings, submitButtonText: e.target.value })
                }
                disabled={!canEdit}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Spam Protection
              </h3>
              <div className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.honeypotEnabled}
                    onChange={(e) =>
                      setSettings({ ...settings, honeypotEnabled: e.target.checked })
                    }
                    disabled={!canEdit}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Enable honeypot protection
                  </span>
                </label>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum submit time (seconds)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={settings.minSubmitTime}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        minSubmitTime: parseInt(e.target.value) || 0,
                      })
                    }
                    disabled={!canEdit}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Reject submissions faster than this (bots fill forms instantly)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-6 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notification Recipients
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Enter email addresses to receive notifications when this form is
                submitted. One email per line.
              </p>
              <textarea
                value={notifyEmails.join("\n")}
                onChange={(e) =>
                  setNotifyEmails(
                    e.target.value
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  )
                }
                disabled={!canEdit}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 font-mono text-sm"
                placeholder="admin@example.com&#10;pastor@example.com"
              />
              {notifyEmails.length === 0 && (
                <p className="mt-2 text-sm text-amber-600">
                  No recipients configured. Notifications will be sent to the
                  church contact email if set.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "submissions" && (
          <FormSubmissions formId={form.id} canEdit={canEdit} />
        )}
      </div>
    </div>
  );
}
