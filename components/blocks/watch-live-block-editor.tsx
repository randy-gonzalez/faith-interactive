"use client";

/**
 * Watch Live Block Editor Component
 *
 * Edit form for watch live block with livestream URL and schedule management.
 */

import { useState } from "react";
import type { Block, WatchLiveBlock, BlockBackground, BlockAdvanced, LivestreamSchedule } from "@/types/blocks";
import { createDefaultBackground } from "@/types/blocks";
import { BlockBackgroundEditor } from "./block-background-editor";
import { BlockAdvancedEditor } from "./block-advanced-editor";

interface WatchLiveBlockEditorProps {
  block: Block;
  onChange: (block: Block) => void;
  disabled?: boolean;
}

const TABS = [
  { id: "content", label: "Content" },
  { id: "schedule", label: "Schedule" },
  { id: "background", label: "Background" },
  { id: "advanced", label: "Advanced" },
] as const;

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

function generateScheduleId(): string {
  return `sch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function WatchLiveBlockEditor({
  block,
  onChange,
  disabled,
}: WatchLiveBlockEditorProps) {
  const watchLiveBlock = block as WatchLiveBlock;
  const { data } = watchLiveBlock;
  const [activeTab, setActiveTab] = useState<"content" | "schedule" | "background" | "advanced">("content");

  function updateData(updates: Partial<WatchLiveBlock["data"]>) {
    onChange({
      ...watchLiveBlock,
      data: { ...data, ...updates },
    });
  }

  function updateBackground(background: BlockBackground) {
    onChange({
      ...watchLiveBlock,
      background,
    });
  }

  function updateAdvanced(advanced: BlockAdvanced) {
    onChange({
      ...watchLiveBlock,
      advanced,
    });
  }

  function addSchedule() {
    updateData({
      scheduleTimes: [
        ...data.scheduleTimes,
        {
          id: generateScheduleId(),
          dayOfWeek: 0, // Sunday
          startTime: "09:00",
          endTime: "10:30",
          label: "",
        },
      ],
    });
  }

  function updateSchedule(id: string, updates: Partial<LivestreamSchedule>) {
    updateData({
      scheduleTimes: data.scheduleTimes.map((sch) =>
        sch.id === id ? { ...sch, ...updates } : sch
      ),
    });
  }

  function removeSchedule(id: string) {
    updateData({
      scheduleTimes: data.scheduleTimes.filter((sch) => sch.id !== id),
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
              placeholder="Watch Live"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Subheading */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subheading
            </label>
            <input
              type="text"
              value={data.subheading || ""}
              onChange={(e) => updateData({ subheading: e.target.value })}
              disabled={disabled}
              placeholder="Join us for worship online"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Livestream URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Livestream URL
            </label>
            <input
              type="url"
              value={data.livestreamUrl}
              onChange={(e) => updateData({ livestreamUrl: e.target.value })}
              disabled={disabled}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <p className="mt-1 text-xs text-gray-500">
              Link to your YouTube, Facebook, or other streaming platform
            </p>
          </div>

          {/* Button Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Button Text
            </label>
            <input
              type="text"
              value={data.buttonText}
              onChange={(e) => updateData({ buttonText: e.target.value })}
              disabled={disabled}
              placeholder="Watch Now"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Text Alignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Text Alignment
            </label>
            <select
              value={data.textAlign}
              onChange={(e) => updateData({ textAlign: e.target.value as "left" | "center" | "right" })}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>

          {/* Countdown Settings */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Countdown Settings</h4>

            <div className="space-y-3">
              {/* Show Countdown */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.showCountdown}
                  onChange={(e) => updateData({ showCountdown: e.target.checked })}
                  disabled={disabled}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Show countdown timer</span>
              </label>

              {data.showCountdown && (
                <>
                  {/* Countdown Prefix */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Countdown Text
                    </label>
                    <input
                      type="text"
                      value={data.countdownPrefix || ""}
                      onChange={(e) => updateData({ countdownPrefix: e.target.value })}
                      disabled={disabled}
                      placeholder="Next broadcast in"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  {/* Live Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Live Indicator Text
                    </label>
                    <input
                      type="text"
                      value={data.liveText || ""}
                      onChange={(e) => updateData({ liveText: e.target.value })}
                      disabled={disabled}
                      placeholder="LIVE NOW"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === "schedule" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Broadcast Schedule</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Set recurring weekly times when you go live
              </p>
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={addSchedule}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add Time
              </button>
            )}
          </div>

          {data.scheduleTimes.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-sm text-gray-500">No broadcast times scheduled</p>
              <p className="text-xs text-gray-400 mt-1">
                Add times to enable the countdown feature
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.scheduleTimes.map((sch, index) => (
                <div
                  key={sch.id}
                  className="p-3 border border-gray-200 rounded-md bg-gray-50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">
                      Broadcast {index + 1}
                    </span>
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => removeSchedule(sch.id)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Day of Week */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Day</label>
                    <select
                      value={sch.dayOfWeek}
                      onChange={(e) =>
                        updateSchedule(sch.id, { dayOfWeek: parseInt(e.target.value) })
                      }
                      disabled={disabled}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      {DAYS_OF_WEEK.map((day) => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Time Range */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={sch.startTime}
                        onChange={(e) =>
                          updateSchedule(sch.id, { startTime: e.target.value })
                        }
                        disabled={disabled}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">End Time</label>
                      <input
                        type="time"
                        value={sch.endTime}
                        onChange={(e) =>
                          updateSchedule(sch.id, { endTime: e.target.value })
                        }
                        disabled={disabled}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  {/* Label */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Label (optional)
                    </label>
                    <input
                      type="text"
                      value={sch.label || ""}
                      onChange={(e) =>
                        updateSchedule(sch.id, { label: e.target.value })
                      }
                      disabled={disabled}
                      placeholder="e.g., Morning Service, Evening Worship"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Background Tab */}
      {activeTab === "background" && (
        <BlockBackgroundEditor
          background={watchLiveBlock.background || createDefaultBackground()}
          onChange={updateBackground}
          disabled={disabled}
        />
      )}

      {/* Advanced Tab */}
      {activeTab === "advanced" && (
        <BlockAdvancedEditor
          advanced={watchLiveBlock.advanced || {}}
          onChange={updateAdvanced}
          disabled={disabled}
        />
      )}
    </div>
  );
}
