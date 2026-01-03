"use client";

/**
 * Watch Live Block Preview Component
 *
 * Live preview rendering of watch live block with countdown timer
 * and creative "live event" design.
 */

import { useState, useEffect } from "react";
import type { Block, WatchLiveBlock, LivestreamSchedule } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";
import { useBackgroundStyles } from "@/lib/blocks/use-background-styles";
import { getTextColors, resolveTextTheme } from "@/lib/blocks/get-text-colors";
import { Radio } from "lucide-react";

interface WatchLiveBlockPreviewProps {
  block: Block;
}

interface LivestreamStatus {
  isLive: boolean;
  nextStart: Date | null;
  currentEnd: Date | null;
  label?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Parse a time string like "09:00" into hours and minutes
 */
function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return { hours: hours || 0, minutes: minutes || 0 };
}

/**
 * Format time for display (12-hour with AM/PM)
 */
function formatTime(timeStr: string): string {
  const { hours, minutes } = parseTime(timeStr);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Calculate the next occurrence of a scheduled time
 */
function getNextOccurrence(schedule: LivestreamSchedule, now: Date): { start: Date; end: Date } {
  const { hours: startHours, minutes: startMinutes } = parseTime(schedule.startTime);
  const { hours: endHours, minutes: endMinutes } = parseTime(schedule.endTime);

  const currentDay = now.getDay();
  let daysUntil = schedule.dayOfWeek - currentDay;

  // If the day has passed this week, go to next week
  if (daysUntil < 0) {
    daysUntil += 7;
  }

  // If it's today, check if the time has passed
  if (daysUntil === 0) {
    const todayStart = new Date(now);
    todayStart.setHours(startHours, startMinutes, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(endHours, endMinutes, 0, 0);

    // If end time is before start time, it spans midnight
    if (todayEnd < todayStart) {
      todayEnd.setDate(todayEnd.getDate() + 1);
    }

    // If we haven't passed the end time yet, use today
    if (now < todayEnd) {
      return { start: todayStart, end: todayEnd };
    }
    // Otherwise, use next week
    daysUntil = 7;
  }

  const start = new Date(now);
  start.setDate(start.getDate() + daysUntil);
  start.setHours(startHours, startMinutes, 0, 0);

  const end = new Date(start);
  end.setHours(endHours, endMinutes, 0, 0);
  if (end < start) {
    end.setDate(end.getDate() + 1);
  }

  return { start, end };
}

/**
 * Determine if currently live and when the next stream starts
 */
function getLivestreamStatus(schedules: LivestreamSchedule[], now: Date): LivestreamStatus {
  if (schedules.length === 0) {
    return { isLive: false, nextStart: null, currentEnd: null };
  }

  let isLive = false;
  let currentEnd: Date | null = null;
  let liveLabel: string | undefined;
  let nextStart: Date | null = null;
  let nextLabel: string | undefined;

  for (const schedule of schedules) {
    const { start, end } = getNextOccurrence(schedule, now);

    // Check if currently within this stream window
    if (now >= start && now < end) {
      isLive = true;
      currentEnd = end;
      liveLabel = schedule.label;
    }

    // Track the next upcoming start
    if (start > now) {
      if (!nextStart || start < nextStart) {
        nextStart = start;
        nextLabel = schedule.label;
      }
    }
  }

  return {
    isLive,
    nextStart: isLive ? null : nextStart,
    currentEnd,
    label: isLive ? liveLabel : nextLabel,
  };
}

/**
 * Calculate time remaining until a date
 */
function getTimeRemaining(target: Date, now: Date): TimeRemaining {
  const diff = Math.max(0, target.getTime() - now.getTime());

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
  const days = Math.floor(diff / 1000 / 60 / 60 / 24);

  return { days, hours, minutes, seconds };
}

export function WatchLiveBlockPreview({ block }: WatchLiveBlockPreviewProps) {
  const watchLiveBlock = block as WatchLiveBlock;
  const { data, background, advanced } = watchLiveBlock;

  const [now, setNow] = useState(() => new Date());
  const [status, setStatus] = useState<LivestreamStatus>(() =>
    getLivestreamStatus(data.scheduleTimes, new Date())
  );
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date();
      setNow(currentTime);
      const newStatus = getLivestreamStatus(data.scheduleTimes, currentTime);
      setStatus(newStatus);

      if (newStatus.nextStart) {
        setTimeRemaining(getTimeRemaining(newStatus.nextStart, currentTime));
      } else {
        setTimeRemaining(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [data.scheduleTimes]);

  const { style: backgroundStyle, overlay } = useBackgroundStyles(background, "transparent");
  const textColors = getTextColors(background?.textTheme, background?.type);
  const useLightTheme = resolveTextTheme(background?.textTheme, background?.type);
  const advancedProps = getAdvancedProps(advanced);
  const combinedClassName = `block-preview py-16 px-6 relative overflow-hidden ${advancedProps.className || ""}`.trim();

  const alignmentClass = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  }[data.textAlign];

  const liveText = data.liveText || "LIVE NOW";
  const countdownPrefix = data.countdownPrefix || "Next broadcast in";

  return (
    <div {...advancedProps} className={combinedClassName} style={backgroundStyle}>
      {/* Image overlay (for image backgrounds) */}
      {background?.type === "image" && background.imageUrl && overlay && (
        <div className="absolute inset-0" style={overlay} />
      )}

      {/* Decorative elements for "event" feel */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle animated gradient orbs */}
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-red-500/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-tl from-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className={`max-w-3xl mx-auto relative z-10 flex flex-col ${alignmentClass}`}>
        {/* Live Indicator or Countdown */}
        {data.showCountdown && data.scheduleTimes.length > 0 && (
          <div className="mb-6">
            {status.isLive ? (
              /* LIVE Indicator */
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-red-600 rounded-full shadow-lg shadow-red-600/30">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                </span>
                <span className="text-white font-bold text-lg tracking-wide uppercase">
                  {liveText}
                </span>
              </div>
            ) : timeRemaining && status.nextStart ? (
              /* Countdown Timer */
              <div className="space-y-3">
                <p className="text-sm font-medium uppercase tracking-wider" style={{ color: textColors.subtext }}>
                  {countdownPrefix}
                </p>
                <div className="flex gap-2 sm:gap-4 justify-center">
                  {timeRemaining.days > 0 && (
                    <CountdownUnit value={timeRemaining.days} label="Days" useLightTheme={useLightTheme} />
                  )}
                  <CountdownUnit value={timeRemaining.hours} label="Hours" useLightTheme={useLightTheme} />
                  <CountdownUnit value={timeRemaining.minutes} label="Min" useLightTheme={useLightTheme} />
                  <CountdownUnit value={timeRemaining.seconds} label="Sec" useLightTheme={useLightTheme} />
                </div>
                {status.label && (
                  <p className="text-sm" style={{ color: textColors.subtext }}>
                    {status.label} - {DAYS_OF_WEEK[status.nextStart.getDay()]} at{" "}
                    {status.nextStart.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm italic" style={{ color: textColors.subtext }}>
                No upcoming broadcasts scheduled
              </p>
            )}
          </div>
        )}

        {/* Heading */}
        {data.heading && (
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3" style={{ color: textColors.heading }}>
            {data.heading}
          </h2>
        )}

        {/* Subheading */}
        {data.subheading && (
          <p className="text-lg md:text-xl mb-8 max-w-xl" style={{ color: textColors.subtext }}>
            {data.subheading}
          </p>
        )}

        {/* Watch Button */}
        {data.livestreamUrl ? (
          <a
            href={data.livestreamUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            style={status.isLive
              ? { backgroundColor: "#dc2626", color: "#ffffff" }
              : useLightTheme
                ? { backgroundColor: "#ffffff", color: "#1f2937" }
                : { backgroundColor: "var(--btn-primary-bg, #1f2937)", color: "var(--btn-primary-text, #ffffff)" }
            }
          >
            <Radio className="w-5 h-5" />
            {data.buttonText || "Watch Now"}
          </a>
        ) : (
          <div className={`inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-lg bg-gray-300 text-gray-500 cursor-not-allowed`}>
            <Radio className="w-5 h-5" />
            {data.buttonText || "Watch Now"}
          </div>
        )}

        {/* No URL message in editor */}
        {!data.livestreamUrl && (
          <p className="mt-4 text-sm italic" style={{ color: textColors.subtext }}>
            Add a livestream URL to enable the button
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Countdown unit component (days/hours/minutes/seconds box)
 */
function CountdownUnit({
  value,
  label,
  useLightTheme,
}: {
  value: number;
  label: string;
  useLightTheme: boolean;
}) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center
        w-16 h-20 sm:w-20 sm:h-24 rounded-lg shadow-lg
        ${useLightTheme
          ? "bg-white/10 backdrop-blur-sm border border-white/20"
          : "bg-gray-900 border border-gray-800"
        }
      `}
    >
      <span className="text-2xl sm:text-3xl font-bold tabular-nums text-white">
        {value.toString().padStart(2, "0")}
      </span>
      <span
        className={`text-xs uppercase tracking-wider ${useLightTheme ? "text-white/70" : "text-gray-400"}`}
      >
        {label}
      </span>
    </div>
  );
}
