'use client';

import { useMatches } from '@/hooks/useMatches';
import { matchService } from '@/services/matchService';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface MentorListProps {
  onBack: () => void;
}

export function MentorList({ onBack }: MentorListProps) {
  const { data, isLoading } = useMatches({ status: 'PENDING' });
  const queryClient = useQueryClient();

  const acceptMatch = useMutation({
    mutationFn: (matchId: string) => matchService.updateStatus(matchId, 'ACTIVE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });

  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Recommended Mentors</h1>
      <p className="text-gray-500 mb-6">AI-matched based on your career goals and experience</p>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
                  <div className="flex gap-2">
                    <div className="h-5 bg-gray-200 rounded-full w-16" />
                    <div className="h-5 bg-gray-200 rounded-full w-20" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : data?.data?.length ? (
        <div className="space-y-4">
          {data.data.map((match) => {
            const mentor = match.mentor;
            if (!mentor) return null;
            const initials = mentor.displayName
              ?.split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase() || '?';

            return (
              <div key={match.id} className="card">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-700 shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{mentor.displayName}</h3>
                    {match.score && (
                      <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium bg-green-50 text-green-700 rounded-full">
                        {match.score}% match
                      </span>
                    )}
                    {match.reason && (
                      <p className="text-sm text-gray-500 mt-1">{match.reason}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => acceptMatch.mutate(match.id)}
                  disabled={acceptMatch.isPending}
                  className="btn-primary w-full mt-4 text-sm"
                >
                  {acceptMatch.isPending ? 'Connecting...' : 'Connect'}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card text-center py-8">
          <p className="text-gray-500">No mentor matches found. Try adjusting your goals!</p>
        </div>
      )}

      {acceptMatch.isSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg shadow-lg">
          Connection request sent!
        </div>
      )}
    </div>
  );
}
