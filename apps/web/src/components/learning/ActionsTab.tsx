'use client';

import { useGoals } from '@/hooks/useGoals';
import type { Goal, GoalPeriod } from '@path-connect/shared';

const periodLabels: Record<GoalPeriod, string> = {
  THIRTY_DAY: 'First 30 Days',
  SIXTY_DAY: 'Days 31-60',
  NINETY_DAY: 'Days 61-90',
};

const periodOrder: GoalPeriod[] = ['THIRTY_DAY', 'SIXTY_DAY', 'NINETY_DAY'];

const statusColors: Record<string, string> = {
  ACHIEVED: 'text-green-600 bg-green-50',
  ON_TRACK: 'text-blue-600 bg-blue-50',
  NEEDS_UPDATE: 'text-orange-600 bg-orange-50',
  PENDING: 'text-gray-500 bg-gray-100',
};

export function ActionsTab() {
  const { data: goalsData } = useGoals({ limit: 50 });
  const goals = goalsData?.data || [];

  return (
    <div className="space-y-6">
      {periodOrder.map((period) => {
        const periodGoals = goals.filter((g: Goal) => g.period === period);
        if (periodGoals.length === 0) return null;

        return (
          <div key={period}>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{periodLabels[period]}</h3>
            <div className="space-y-2">
              {periodGoals.map((goal: Goal) => (
                <div key={goal.id} className="card py-3 px-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      goal.status === 'ACHIEVED' ? 'border-green-400 bg-green-400' : 'border-gray-300 bg-white'
                    }`}>
                      {goal.status === 'ACHIEVED' && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${goal.status === 'ACHIEVED' ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {goal.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${statusColors[goal.status]}`}>
                          {goal.status === 'ACHIEVED' ? 'Achieved' : goal.status === 'ON_TRACK' ? 'On Track' : goal.status === 'NEEDS_UPDATE' ? 'Needs Update' : 'Pending'}
                        </span>
                        {goal.isAiSuggested && (
                          <span className="px-2 py-0.5 text-[10px] font-medium bg-accent-50 text-accent-700 rounded-full">
                            AI Suggested
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {goals.length === 0 && (
        <div className="card text-center py-8">
          <p className="text-gray-500">No goals yet. Create your 90-day plan to get started!</p>
        </div>
      )}
    </div>
  );
}
