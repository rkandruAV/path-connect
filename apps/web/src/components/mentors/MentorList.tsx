'use client';

import { useMentors } from '@/hooks/useMentors';
import { useCreateMatch } from '@/hooks/useMatches';
import { MentorCard } from './MentorCard';

interface MentorListProps {
  onBack: () => void;
}

export function MentorList({ onBack }: MentorListProps) {
  const { data, isLoading } = useMentors();
  const createMatch = useCreateMatch();

  const handleConnect = (mentorUserId: string) => {
    createMatch.mutate({ mentorId: mentorUserId });
  };

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
      <p className="text-gray-500 mb-6">Based on your career goals and experience</p>

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
          {data.data.map((mentor) => (
            <MentorCard
              key={mentor.id}
              mentor={mentor}
              onConnect={handleConnect}
              connecting={createMatch.isPending}
            />
          ))}
        </div>
      ) : (
        <div className="card text-center py-8">
          <p className="text-gray-500">No mentors found. Check back later!</p>
        </div>
      )}

      {createMatch.isSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg shadow-lg">
          Connection request sent!
        </div>
      )}
    </div>
  );
}
