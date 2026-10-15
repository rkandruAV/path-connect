'use client';

import Link from 'next/link';
import { useMatches } from '@/hooks/useMatches';

function getInitials(name?: string | null) {
  return name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || '?';
}

export function MyMentor() {
  const { data: activeMatches, isLoading: loadingActive } = useMatches({ status: 'ACTIVE' });
  const { data: pendingMatches, isLoading: loadingPending } = useMatches({ status: 'PENDING' });

  const active = activeMatches?.data || [];
  const pending = pendingMatches?.data || [];

  if (loadingActive || loadingPending) return null;
  if (active.length === 0 && pending.length === 0) return null;

  return (
    <div className="mb-6 space-y-3">
      {/* Active mentor connections */}
      {active.map((match) => {
        const mentor = match.mentor;
        if (!mentor) return null;
        return (
          <div key={match.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-700">
                  {getInitials(mentor.displayName)}
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">My Mentor</p>
                  <p className="font-semibold text-gray-900">{mentor.displayName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-primary-50 text-primary-700 rounded-full">
                      Connected
                    </span>
                    {match.score && (
                      <span className="text-[11px] text-gray-400">{match.score}% match</span>
                    )}
                  </div>
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
      })}

      {/* Pending mentor requests */}
      {pending.length > 0 && (
        <div className="card">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Pending Connections</p>
          <div className="space-y-3">
            {pending.map((match) => {
              const mentor = match.mentor;
              if (!mentor) return null;
              return (
                <div key={match.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-accent-100 flex items-center justify-center text-xs font-semibold text-accent-700">
                      {getInitials(mentor.displayName)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{mentor.displayName}</p>
                      {match.score && (
                        <span className="text-[11px] text-gray-400">{match.score}% match</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    Awaiting
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
