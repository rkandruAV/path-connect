'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMatches } from '@/hooks/useMatches';
import { matchService } from '@/services/matchService';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();
  const [actionId, setActionId] = useState<string | null>(null);

  const respondToRequest = useMutation({
    mutationFn: ({ matchId, status }: { matchId: string; status: 'ACTIVE' | 'DECLINED' }) =>
      matchService.updateStatus(matchId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      setActionId(null);
    },
    onError: () => {
      setActionId(null);
    },
  });

  const handleAccept = (matchId: string) => {
    setActionId(matchId);
    respondToRequest.mutate({ matchId, status: 'ACTIVE' });
  };

  const handleDecline = (matchId: string) => {
    setActionId(matchId);
    respondToRequest.mutate({ matchId, status: 'DECLINED' });
  };

  const active = activeMatches?.data || [];
  const pending = pendingMatches?.data || [];

  if (loadingActive || loadingPending) return null;
  if (active.length === 0 && pending.length === 0) return null;

  return (
    <div className="mb-6 space-y-3">
      {/* Pending mentee requests — show first so mentor sees them immediately */}
      {pending.length > 0 && (
        <div className="card">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
            Connection Requests ({pending.length})
          </p>
          <div className="space-y-4">
            {pending.map((match) => {
              const mentee = match.mentee;
              if (!mentee) return null;
              const isActioning = actionId === match.id;
              return (
                <div key={match.id}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center text-xs font-semibold text-accent-700">
                      {getInitials(mentee.displayName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{mentee.displayName || mentee.email}</p>
                      {match.reason && (
                        <p className="text-xs text-gray-400 truncate">{match.reason}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-13">
                    <button
                      onClick={() => handleAccept(match.id)}
                      disabled={isActioning}
                      className="btn-primary text-xs px-4 py-1.5 flex-1"
                    >
                      {isActioning && respondToRequest.variables?.status === 'ACTIVE'
                        ? 'Accepting...'
                        : 'Accept'}
                    </button>
                    <button
                      onClick={() => handleDecline(match.id)}
                      disabled={isActioning}
                      className="btn-secondary text-xs px-4 py-1.5 flex-1 text-gray-500 border-gray-200 hover:bg-gray-50"
                    >
                      {isActioning && respondToRequest.variables?.status === 'DECLINED'
                        ? 'Declining...'
                        : 'Decline'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
    </div>
  );
}
