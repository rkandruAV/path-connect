'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMatches } from '@/hooks/useMatches';
import { useGenerateLearningPath } from '@/hooks/useDify';
import { useCreateGoal } from '@/hooks/useGoals';
import type { GoalPeriod } from '@path-connect/shared';

export function ProgressHeader() {
  const { data: matches } = useMatches({ status: 'ACTIVE' });
  const activeMatch = matches?.data?.[0];
  const mentorName = activeMatch?.mentor?.displayName || 'your mentor';

  const generatePath = useGenerateLearningPath();
  const createGoal = useCreateGoal();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGeneratePath = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const result = await generatePath.mutateAsync();
      const goals = result.data || [];
      for (const goal of goals) {
        await createGoal.mutateAsync({
          title: goal.title,
          period: goal.period as GoalPeriod,
          description: goal.description,
        });
      }
    } catch {
      setError('Failed to generate suggestions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mb-6">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Progress</h1>
            <p className="text-sm text-gray-500">Journey with {mentorName}</p>
          </div>
        </div>
        <button
          onClick={handleGeneratePath}
          disabled={isGenerating}
          className="btn-primary text-xs px-3 py-1.5"
        >
          {isGenerating ? (
            <span className="flex items-center gap-1.5">
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating...
            </span>
          ) : 'AI Suggestions'}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
