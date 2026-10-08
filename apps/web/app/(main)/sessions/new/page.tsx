'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMatches } from '@/hooks/useMatches';
import { useCreateSession } from '@/hooks/useSessions';
import { AvailabilityPicker } from '@/components/sessions/AvailabilityPicker';

export default function NewSessionPage() {
  const router = useRouter();
  const { data: matchesData, isLoading: matchesLoading } = useMatches({ status: 'ACTIVE' });
  const createSession = useCreateSession();

  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState(30);
  const [error, setError] = useState('');

  const activeMatches = matchesData?.data || [];

  const handleMatchSelect = (matchId: string) => {
    const match = activeMatches.find((m) => m.id === matchId);
    setSelectedMatchId(matchId);
    setSelectedMentorId(match?.mentorId || '');
    setScheduledAt('');
    setDuration(30);
  };

  const handleSlotSelect = (slot: { scheduledAt: string; duration: number }) => {
    setScheduledAt(slot.scheduledAt);
    setDuration(slot.duration);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedMatchId) {
      setError('Please select a mentor match');
      return;
    }
    if (!scheduledAt) {
      setError('Please select a time slot');
      return;
    }

    try {
      await createSession.mutateAsync({
        matchId: selectedMatchId,
        scheduledAt,
        duration,
        type: 'VIDEO',
      });
      router.push('/sessions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Schedule a Session</h1>
      <p className="text-gray-500 mb-6">Pick a mentor and available time slot</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Select Match */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-3">1. Select Mentor</label>

          {matchesLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : activeMatches.length === 0 ? (
            <p className="text-sm text-gray-500">
              No active mentor matches. Go to the Mentors page to find and connect with a mentor first.
            </p>
          ) : (
            <div className="space-y-2">
              {activeMatches.map((match) => {
                const mentor = match.mentor;
                const initials = (mentor?.displayName || '?')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase();

                return (
                  <button
                    key={match.id}
                    type="button"
                    onClick={() => handleMatchSelect(match.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      selectedMatchId === match.id
                        ? 'bg-primary-50 border-2 border-primary-500'
                        : 'bg-white border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center text-xs font-semibold text-accent-700 shrink-0">
                      {initials}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{mentor?.displayName || 'Mentor'}</p>
                      <p className="text-xs text-gray-500">{mentor?.email}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Step 2: Pick Time */}
        {selectedMentorId && (
          <div className="card">
            <label className="block text-sm font-medium text-gray-700 mb-3">2. Pick a Time</label>
            <AvailabilityPicker
              mentorId={selectedMentorId}
              onSlotSelect={handleSlotSelect}
              selectedSlot={scheduledAt || null}
            />

            {/* Manual fallback: allow typing a date/time if no calendar slots */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">Or enter a custom date and time:</p>
              <div className="flex gap-3">
                <input
                  type="datetime-local"
                  value={scheduledAt ? new Date(scheduledAt).toISOString().slice(0, 16) : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      setScheduledAt(new Date(e.target.value).toISOString());
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!selectedMatchId || !scheduledAt || createSession.isPending}
          className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createSession.isPending ? 'Scheduling...' : 'Schedule Session'}
        </button>
      </form>
    </div>
  );
}
