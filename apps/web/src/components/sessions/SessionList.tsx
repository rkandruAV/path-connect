'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useSessions } from '@/hooks/useSessions';
import type { SessionStatus } from '@path-connect/shared';

const tabs: { label: string; value: SessionStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'Completed', value: 'COMPLETED' },
];

const statusStyles: Record<string, string> = {
  SCHEDULED: 'bg-blue-50 text-blue-600',
  COMPLETED: 'bg-green-50 text-green-600',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

export function SessionList() {
  const [statusFilter, setStatusFilter] = useState<SessionStatus | undefined>(undefined);
  const { data, isLoading } = useSessions({ status: statusFilter });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Sessions</h1>
      <p className="text-gray-500 mb-6">Your mentoring sessions</p>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
                <div className="h-5 bg-gray-200 rounded-full w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : data?.data?.length ? (
        <div className="space-y-3">
          {data.data.map((session) => {
            const otherPerson = session.mentor;
            const initials = otherPerson?.displayName
              ?.split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase() || '?';

            return (
              <Link key={session.id} href={`/sessions/${session.id}`}>
                <div className="card hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-xs font-semibold text-primary-700 shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">
                        Session with {otherPerson?.displayName || 'Unknown'}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                        <span>{format(new Date(session.scheduledAt), 'MMM d, yyyy')}</span>
                        <span>{session.duration} min</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.summary && (
                        <span className="px-2 py-0.5 text-[10px] font-medium bg-primary-50 text-primary-600 rounded-full">
                          AI Summary
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${statusStyles[session.status] || 'bg-gray-100 text-gray-500'}`}>
                        {session.status.charAt(0) + session.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="card text-center py-8">
          <p className="text-gray-500">No sessions found</p>
        </div>
      )}
    </div>
  );
}
