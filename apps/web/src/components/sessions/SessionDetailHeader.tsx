'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import type { SessionDetail } from '@path-connect/shared';

interface SessionDetailHeaderProps {
  session: SessionDetail;
}

export function SessionDetailHeader({ session }: SessionDetailHeaderProps) {
  const mentorName = session.mentor?.displayName || 'Mentor';
  const initials = mentorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="mb-6">
      <Link href="/sessions" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-accent-100 flex items-center justify-center text-lg font-semibold text-accent-700">
          {initials}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Session with {mentorName}</h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {format(new Date(session.scheduledAt), 'MMMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {session.duration} min
            </span>
          </div>
        </div>
      </div>

      {session.summary && (
        <div className="mt-3">
          <span className="px-3 py-1 text-xs font-medium bg-accent-50 text-accent-700 rounded-full">
            AI-Captured Summary
          </span>
        </div>
      )}
    </div>
  );
}
