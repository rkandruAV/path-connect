'use client';

import Link from 'next/link';
import { useMatches } from '@/hooks/useMatches';

export function MyMentor() {
  const { data: activeMatches, isLoading } = useMatches({ status: 'ACTIVE' });
  const match = activeMatches?.data?.[0];

  if (isLoading || !match) return null;

  const mentor = match.mentor;
  if (!mentor) return null;

  const initials = mentor.displayName
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-700">
            {initials}
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">My Mentor</p>
            <p className="font-semibold text-gray-900">{mentor.displayName}</p>
            {match.score && (
              <span className="text-[11px] text-primary-600">{match.score}% match</span>
            )}
          </div>
        </div>
        <Link
          href="/sessions/new"
          className="btn-secondary text-xs px-3 py-1.5"
        >
          Schedule Session
        </Link>
      </div>
    </div>
  );
}
