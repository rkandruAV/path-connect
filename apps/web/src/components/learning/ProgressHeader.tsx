'use client';

import Link from 'next/link';
import { useMatches } from '@/hooks/useMatches';

export function ProgressHeader() {
  const { data: matches } = useMatches({ status: 'ACTIVE' });
  const activeMatch = matches?.data?.[0];
  const mentorName = activeMatch?.mentor?.displayName || 'your mentor';

  return (
    <div className="mb-6">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Progress</h1>
          <p className="text-sm text-gray-500">Journey with {mentorName}</p>
        </div>
      </div>
    </div>
  );
}
