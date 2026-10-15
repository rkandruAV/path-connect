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

export function MyMentees() {
  const { data: activeMatches, isLoading: loadingActive } = useMatches({ status: 'ACTIVE' });
  const { data: pendingMatches, isLoading: loadingPending } = useMatches({ status: 'PENDING' });

  const active = activeMatches?.data || [];
  const pending = pendingMatches?.data || [];

  if (loadingActive || loadingPending) return null;
  if (active.length === 0 && pending.length === 0) return null;

  return (
    <div className="mb-6 space-y-3">
      {/* Active mentees */}
      {active.length > 0 && (
        <div className="card">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">My Mentees</p>
          <div className="space-y-3">
            {active.map((match) => {
              const mentee = match.mentee;
              if (!mentee) return null;
              return (
                <div key={match.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-700">
                      {getInitials(mentee.displayName)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{mentee.displayName || mentee.email}</p>
                      <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-primary-50 text-primary-700 rounded-full">
                        Active
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/sessions/new"
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    Schedule
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pending mentee requests */}
      {pending.length > 0 && (
        <div className="card">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Pending Requests</p>
          <div className="space-y-3">
            {pending.map((match) => {
              const mentee = match.mentee;
              if (!mentee) return null;
              return (
                <div key={match.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-accent-100 flex items-center justify-center text-xs font-semibold text-accent-700">
                      {getInitials(mentee.displayName)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{mentee.displayName || mentee.email}</p>
                      <span className="text-[11px] text-gray-400">Wants to connect</span>
                    </div>
                  </div>
                  <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    Pending
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
