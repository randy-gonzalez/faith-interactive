"use client";

/**
 * Logos Settings Form Component
 *
 * Form for editing church logos: header, light, dark, and favicon.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MediaPicker } from "@/components/dashboard/media-picker";
import { useBranding } from "@/contexts/branding-context";
import type { ChurchBranding } from "@prisma/client";

interface LogosSettingsFormProps {
  branding: ChurchBranding;
  canEdit: boolean;
}

export function LogosSettingsForm({ branding, canEdit }: LogosSettingsFormProps) {
  const router = useRouter();
  const brandingContext = useBranding();

  // Logos
  const [logoHeaderUrl, setLogoHeaderUrl] = useState(branding.logoHeaderUrl || "");
  const [logoLightUrl, setLogoLightUrl] = useState(branding.logoLightUrl || "");
  const [logoDarkUrl, setLogoDarkUrl] = useState(branding.logoDarkUrl || "");
  const [faviconUrl, setFaviconUrl] = useState(branding.faviconUrl || "");

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  async function handleSave() {
    if (!canEdit) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/branding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logoHeaderUrl: logoHeaderUrl || null,
          logoLightUrl: logoLightUrl || null,
          logoDarkUrl: logoDarkUrl || null,
          faviconUrl: faviconUrl || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to save logos");
        setSaving(false);
        return;
      }

      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
      brandingContext?.refetch();
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Header Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Header Logo
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Main logo displayed in the website header
            </p>
            <MediaPicker
              value={logoHeaderUrl || null}
              onChange={(url) => setLogoHeaderUrl(url || "")}
              disabled={!canEdit}
              placeholder="Select header logo"
            />
            {logoHeaderUrl && (
              <div className="mt-2 p-4 bg-gray-100 rounded-lg">
                <img src={logoHeaderUrl} alt="Header logo preview" className="max-h-16 object-contain" />
              </div>
            )}
          </div>

          {/* Light Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Light Logo
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Logo variant for dark backgrounds
            </p>
            <MediaPicker
              value={logoLightUrl || null}
              onChange={(url) => setLogoLightUrl(url || "")}
              disabled={!canEdit}
              placeholder="Select light logo"
            />
            {logoLightUrl && (
              <div className="mt-2 p-4 bg-gray-800 rounded-lg">
                <img src={logoLightUrl} alt="Light logo preview" className="max-h-16 object-contain" />
              </div>
            )}
          </div>

          {/* Dark Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dark Logo
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Logo variant for light backgrounds
            </p>
            <MediaPicker
              value={logoDarkUrl || null}
              onChange={(url) => setLogoDarkUrl(url || "")}
              disabled={!canEdit}
              placeholder="Select dark logo"
            />
            {logoDarkUrl && (
              <div className="mt-2 p-4 bg-white border rounded-lg">
                <img src={logoDarkUrl} alt="Dark logo preview" className="max-h-16 object-contain" />
              </div>
            )}
          </div>

          {/* Favicon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Favicon
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Small icon shown in browser tabs (32x32 recommended)
            </p>
            <MediaPicker
              value={faviconUrl || null}
              onChange={(url) => setFaviconUrl(url || "")}
              disabled={!canEdit}
              placeholder="Select favicon"
            />
            {faviconUrl && (
              <div className="mt-2 flex items-center gap-2">
                <img src={faviconUrl} alt="Favicon preview" className="w-8 h-8 object-contain" />
                <span className="text-xs text-gray-500">Favicon preview</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      {canEdit && (
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} isLoading={saving}>
            Save Changes
          </Button>
        </div>
      )}

      {/* Save Success Toast */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          showSaveSuccess
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">Logos saved successfully</span>
        </div>
      </div>
    </div>
  );
}
