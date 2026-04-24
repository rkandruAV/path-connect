'use client';

import { useSessions } from '@/hooks/useSessions';
import { format } from 'date-fns';

export function InsightsTab() {
  const { data: sessionsData } = useSessions({ status: 'COMPLETED' });
  const sessions = sessionsData?.data || [];

  const sessionsWithInsights = sessions.filter(
    (s) => s.summary?.keyInsights && s.summary.keyInsights.length > 0
  );

  if (sessionsWithInsights.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-gray-500">No insights yet. Complete sessions to build your insight library!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessionsWithInsights.map((session) => (
        <div key={session.id} className="card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary-700">
                {session.mentor?.displayName?.[0] || '?'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Session with {session.mentor?.displayName || 'Mentor'}
              </p>
              <p className="text-xs text-gray-400">
                {format(new Date(session.scheduledAt), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {session.summary!.keyInsights.map((insight, index) => (
              <div key={index} className="flex gap-2 p-2 bg-primary-50/50 rounded-lg">
                <span className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-[10px] font-semibold text-primary-700 shrink-0">
                  {index + 1}
                </span>
                <p className="text-xs text-gray-600 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
