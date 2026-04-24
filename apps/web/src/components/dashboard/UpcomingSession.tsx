'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { useSessions } from '@/hooks/useSessions';

export function UpcomingSession() {
  const { data } = useSessions({ status: 'SCHEDULED' });
  const nextSession = data?.data?.[0];

  if (!nextSession) {
    return (
      <div className="card bg-gray-50 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">No upcoming sessions</p>
            <p className="text-xs text-gray-400">Schedule a session with your mentor</p>
          </div>
        </div>
      </div>
    );
  }

  const mentorName = nextSession.mentor?.displayName || 'Your Mentor';
  const sessionDate = format(new Date(nextSession.scheduledAt), 'MMM d');
  const sessionTime = format(new Date(nextSession.scheduledAt), 'h:mm a');

  return (
    <div className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 p-5 text-white mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold">Upcoming Session</p>
            <p className="text-sm text-primary-100">with {mentorName}</p>
            <p className="text-sm text-primary-100">{sessionDate} at {sessionTime}</p>
          </div>
        </div>
        <Link
          href={`/sessions/${nextSession.id}`}
          className="px-4 py-2 bg-white text-primary-600 font-medium rounded-lg text-sm hover:bg-primary-50 transition-colors"
        >
          Join
        </Link>
      </div>
    </div>
  );
}
