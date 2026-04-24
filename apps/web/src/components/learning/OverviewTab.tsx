'use client';

import { useGoals } from '@/hooks/useGoals';
import { useSessions } from '@/hooks/useSessions';
import { useCurrentUser } from '@/hooks/useUser';
import { useMatches } from '@/hooks/useMatches';
import { format } from 'date-fns';
import type { Goal, GoalPeriod } from '@path-connect/shared';

const periodLabels: Record<GoalPeriod, string> = {
  THIRTY_DAY: '30 Days',
  SIXTY_DAY: '60 Days',
  NINETY_DAY: '90 Days',
};

const periodOrder: GoalPeriod[] = ['THIRTY_DAY', 'SIXTY_DAY', 'NINETY_DAY'];

export function OverviewTab() {
  const { data: goalsData } = useGoals({ limit: 50 });
  const { data: sessions } = useSessions();
  const { data: user } = useCurrentUser();
  const { data: matches } = useMatches({ status: 'ACTIVE' });

  const goals = goalsData?.data || [];
  const totalGoals = goals.length;
  const achievedGoals = goals.filter((g) => g.status === 'ACHIEVED').length;
  const progressPercent = totalGoals > 0 ? Math.round((achievedGoals / totalGoals) * 100) : 0;

  const goalsByPeriod = periodOrder.map((period) => {
    const periodGoals = goals.filter((g: Goal) => g.period === period);
    const achieved = periodGoals.filter((g: Goal) => g.status === 'ACHIEVED').length;
    const total = periodGoals.length;
    const percent = total > 0 ? Math.round((achieved / total) * 100) : 0;
    return { period, label: periodLabels[period], achieved, total, percent };
  });

  const activeMatch = matches?.data?.[0];
  const startDate = activeMatch?.createdAt ? format(new Date(activeMatch.createdAt), 'MMMM d, yyyy') : 'N/A';

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="font-semibold text-gray-900">Overall Progress</h2>
            </div>
            <p className="text-sm text-gray-500">{achievedGoals} of {totalGoals} goals achieved</p>
          </div>
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="#f3f4f6" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15" fill="none"
                stroke="#8b5cf6" strokeWidth="3"
                strokeDasharray={`${progressPercent * 0.942} 100`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary-600">
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* 30/60/90 Day Milestones */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">30/60/90 Day Milestones</h2>
        <div className="space-y-4">
          {goalsByPeriod.map((item) => (
            <div key={item.period}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <span className="text-xs text-gray-500">{item.achieved}/{item.total}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.percent === 100
                        ? 'bg-gray-800'
                        : item.percent > 0
                          ? 'bg-primary-500'
                          : 'bg-gray-200'
                    }`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-8 text-right">{item.percent}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Relationship Growth */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Relationship Growth</h2>
            <p className="text-xs text-gray-400">Started {startDate}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-primary-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-primary-600">{sessions?.total || 0}</p>
            <p className="text-xs text-gray-500">Total Sessions</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-orange-500">{user?.weekStreak || 0}w</p>
            <p className="text-xs text-gray-500">Current Streak</p>
          </div>
        </div>
      </div>
    </div>
  );
}
