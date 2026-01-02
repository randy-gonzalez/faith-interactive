/**
 * Venue Selector Component
 *
 * A dropdown component for selecting venues from the library.
 * Shows capacity info and allows using custom location text instead.
 */

"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface Venue {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  capacity: number | null;
}

interface VenueSelectorProps {
  venueId: string | null;
  customLocation: string;
  onVenueChange: (venueId: string | null) => void;
  onLocationChange: (location: string) => void;
  disabled?: boolean;
  error?: string;
}

export function VenueSelector({
  venueId,
  customLocation,
  onVenueChange,
  onLocationChange,
  disabled = false,
  error,
}: VenueSelectorProps) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [useCustom, setUseCustom] = useState(!venueId && !!customLocation);

  useEffect(() => {
    fetchVenues();
  }, []);

  // If venue is cleared and there's custom location, switch to custom mode
  useEffect(() => {
    if (!venueId && customLocation) {
      setUseCustom(true);
    }
  }, [venueId, customLocation]);

  async function fetchVenues() {
    try {
      const response = await fetch("/api/venues");
      if (response.ok) {
        const data = await response.json();
        setVenues(data.venues || []);
      }
    } catch (error) {
      console.error("Failed to fetch venues:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleVenueSelect(id: string) {
    if (id === "custom") {
      setUseCustom(true);
      onVenueChange(null);
    } else if (id === "") {
      setUseCustom(false);
      onVenueChange(null);
      onLocationChange("");
    } else {
      setUseCustom(false);
      onVenueChange(id);
      onLocationChange("");
    }
  }

  const selectedVenue = venues.find((v) => v.id === venueId);

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <select
          value={useCustom ? "custom" : venueId || ""}
          onChange={(e) => handleVenueSelect(e.target.value)}
          disabled={disabled || loading}
          className={`
            w-full px-3 py-2 rounded-md border transition-colors
            bg-white
            text-gray-900
            border-gray-300
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? "border-red-500" : ""}
          `}
        >
          <option value="">No location set</option>
          {venues.length > 0 && (
            <optgroup label="Saved Venues">
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name}
                  {venue.capacity && ` (Capacity: ${venue.capacity})`}
                </option>
              ))}
            </optgroup>
          )}
          <option value="custom">Enter custom location...</option>
        </select>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>

      {/* Show venue details if selected */}
      {selectedVenue && !useCustom && (
        <div className="text-sm text-gray-500 bg-gray-50 rounded-md p-3">
          <div className="font-medium text-gray-900">
            {selectedVenue.name}
          </div>
          {selectedVenue.address && (
            <div>
              {selectedVenue.address}
              {(selectedVenue.city || selectedVenue.state) && (
                <>, {[selectedVenue.city, selectedVenue.state].filter(Boolean).join(", ")}</>
              )}
            </div>
          )}
          {selectedVenue.capacity && (
            <div className="mt-1">
              Capacity: {selectedVenue.capacity.toLocaleString()} people
            </div>
          )}
        </div>
      )}

      {/* Custom location input */}
      {useCustom && (
        <Input
          label="Custom Location"
          value={customLocation}
          onChange={(e) => onLocationChange(e.target.value)}
          disabled={disabled}
          placeholder="Enter location address or description"
        />
      )}
    </div>
  );
}
