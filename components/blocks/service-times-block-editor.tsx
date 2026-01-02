"use client";

/**
 * Service Times Block Editor Component
 *
 * Edit form for service times block with service list management.
 */

import { useState } from "react";
import type { Block, ServiceTimesBlock, BlockBackground, BlockAdvanced } from "@/types/blocks";
import { createDefaultBackground } from "@/types/blocks";
import { BlockBackgroundEditor } from "./block-background-editor";
import { BlockAdvancedEditor } from "./block-advanced-editor";

interface ServiceTimesBlockEditorProps {
  block: Block;
  onChange: (block: Block) => void;
  disabled?: boolean;
}

const TABS = [
  { id: "content", label: "Content" },
  { id: "background", label: "Background" },
  { id: "advanced", label: "Advanced" },
] as const;

function generateServiceId(): string {
  return `svc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function ServiceTimesBlockEditor({
  block,
  onChange,
  disabled,
}: ServiceTimesBlockEditorProps) {
  const serviceTimesBlock = block as ServiceTimesBlock;
  const { data } = serviceTimesBlock;
  const [activeTab, setActiveTab] = useState<"content" | "background" | "advanced">("content");

  function updateData(updates: Partial<ServiceTimesBlock["data"]>) {
    onChange({
      ...serviceTimesBlock,
      data: { ...data, ...updates },
    });
  }

  function updateBackground(background: BlockBackground) {
    onChange({
      ...serviceTimesBlock,
      background,
    });
  }

  function updateAdvanced(advanced: BlockAdvanced) {
    onChange({
      ...serviceTimesBlock,
      advanced,
    });
  }

  function addService() {
    updateData({
      services: [
        ...data.services,
        {
          id: generateServiceId(),
          name: "New Service",
          time: "",
          location: "",
          description: "",
        },
      ],
    });
  }

  function updateService(
    id: string,
    updates: Partial<ServiceTimesBlock["data"]["services"][0]>
  ) {
    updateData({
      services: data.services.map((svc) =>
        svc.id === id ? { ...svc, ...updates } : svc
      ),
    });
  }

  function removeService(id: string) {
    updateData({
      services: data.services.filter((svc) => svc.id !== id),
    });
  }

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4" aria-label="Block editor tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Tab */}
      {activeTab === "content" && (
        <div className="space-y-4">
          {/* Heading */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Heading
            </label>
            <input
              type="text"
              value={data.heading}
              onChange={(e) => updateData({ heading: e.target.value })}
              disabled={disabled}
              placeholder="Service Times"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Services */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Services
              </label>
              {!disabled && (
                <button
                  type="button"
                  onClick={addService}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add Service
                </button>
              )}
            </div>

            {data.services.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No services added</p>
            ) : (
              <div className="space-y-3">
                {data.services.map((svc, index) => (
                  <div
                    key={svc.id}
                    className="p-3 border border-gray-200 rounded-md bg-gray-50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">
                        Service {index + 1}
                      </span>
                      {!disabled && (
                        <button
                          type="button"
                          onClick={() => removeService(svc.id)}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={svc.name}
                        onChange={(e) =>
                          updateService(svc.id, { name: e.target.value })
                        }
                        disabled={disabled}
                        placeholder="Service name"
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                      <input
                        type="text"
                        value={svc.time}
                        onChange={(e) =>
                          updateService(svc.id, { time: e.target.value })
                        }
                        disabled={disabled}
                        placeholder="9:00 AM & 11:00 AM"
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>

                    <input
                      type="text"
                      value={svc.location || ""}
                      onChange={(e) =>
                        updateService(svc.id, { location: e.target.value })
                      }
                      disabled={disabled}
                      placeholder="Location (optional)"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />

                    <input
                      type="text"
                      value={svc.description || ""}
                      onChange={(e) =>
                        updateService(svc.id, { description: e.target.value })
                      }
                      disabled={disabled}
                      placeholder="Description (optional)"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Background Tab */}
      {activeTab === "background" && (
        <BlockBackgroundEditor
          background={serviceTimesBlock.background || createDefaultBackground()}
          onChange={updateBackground}
          disabled={disabled}
        />
      )}

      {/* Advanced Tab */}
      {activeTab === "advanced" && (
        <BlockAdvancedEditor
          advanced={serviceTimesBlock.advanced || {}}
          onChange={updateAdvanced}
          disabled={disabled}
        />
      )}
    </div>
  );
}
