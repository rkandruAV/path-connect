'use client';

import { useState } from 'react';
import { format, addDays } from 'date-fns';
import { useMentorAvailability } from '@/hooks/useMentors';
import type { AvailabilitySlot } from '@path-connect/shared';

interface AvailabilityPickerProps {
  mentorId: string;
  onSlotSelect: (slot: { scheduledAt: string; duration: number }) => void;
  selectedSlot?: string | null;
}

export function AvailabilityPicker({ mentorId, onSlotSelect, selectedSlot }: AvailabilityPickerProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const { data: availability, isLoading } = useMentorAvailability(mentorId, selectedDate);

  // Generate next 14 days for the date picker
  const dateOptions = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(new Date(), i + 1);
    return {
      value: format(date, 'yyyy-MM-dd'),
      label: format(date, 'EEE, MMM d'),
    };
  });

  const formatSlotTime = (isoString: string) => {
    return format(new Date(isoString), 'h:mm a');
  };

  const getSlotDuration = (slot: AvailabilitySlot) => {
    const start = new Date(slot.start).getTime();
    const end = new Date(slot.end).getTime();
    return Math.round((end - start) / 60000);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Select a Date</label>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {dateOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setSelectedDate(opt.value)}
            className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedDate === opt.value
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {selectedDate && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Available Time Slots</label>

          {isLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : !availability?.calendarConnected ? (
            <p className="text-sm text-gray-500">
              This mentor hasn&apos;t connected their calendar yet. You can still schedule by picking a time manually.
            </p>
          ) : availability.slots.length === 0 ? (
            <p className="text-sm text-gray-500">
              No available slots on this date. Try another day.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availability.slots.map((slot) => {
                const duration = getSlotDuration(slot);
                return (
                  <button
                    key={slot.start}
                    type="button"
                    onClick={() => onSlotSelect({ scheduledAt: slot.start, duration: Math.min(duration, 60) })}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors text-center ${
                      selectedSlot === slot.start
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {formatSlotTime(slot.start)} - {formatSlotTime(slot.end)}
                    <span className="block text-xs opacity-75">{duration} min</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
