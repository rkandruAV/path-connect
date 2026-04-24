'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUpdateProfile } from '@/hooks/useUser';

interface MentorDiscoveryFormProps {
  onComplete: () => void;
}

export function MentorDiscoveryForm({ onComplete }: MentorDiscoveryFormProps) {
  const [targetRole, setTargetRole] = useState('');
  const [currentPosition, setCurrentPosition] = useState('');
  const [goals, setGoals] = useState('');
  const updateProfile = useUpdateProfile();

  const isValid = targetRole.trim() && currentPosition.trim() && goals.trim();

  const handleSubmit = async () => {
    if (!isValid) return;
    await updateProfile.mutateAsync({
      targetRole: targetRole.trim(),
      currentPosition: currentPosition.trim(),
      bio: goals.trim(),
    });
    onComplete();
  };

  return (
    <div>
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Home
      </Link>

      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Let&apos;s start your journey to success</h1>
      </div>

      <div className="space-y-6">
        <div className="bg-primary-50 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Career Goal</h3>
              <p className="text-xs text-gray-500">What role or career are you targeting?</p>
            </div>
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Role or Industry</label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="input"
            placeholder="e.g., Product Manager, Software Engineer..."
          />
        </div>

        <div className="bg-primary-50 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Current Position</h3>
              <p className="text-xs text-gray-500">Tell us about your background</p>
            </div>
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Role &amp; Experience</label>
          <input
            type="text"
            value={currentPosition}
            onChange={(e) => setCurrentPosition(e.target.value)}
            className="input"
            placeholder="e.g., Marketing Manager with 5 years experience..."
          />
        </div>

        <div className="bg-primary-50 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Success Metrics</h3>
              <p className="text-xs text-gray-500">What do you want to achieve in 3-6 months?</p>
            </div>
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Goals</label>
          <textarea
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            className="input min-h-[100px] resize-none"
            placeholder="e.g., Land my first PM interview, Build a portfolio, Network with industry professionals..."
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!isValid || updateProfile.isPending}
        className={`w-full mt-6 py-3 rounded-lg font-medium transition-colors ${
          isValid
            ? 'btn-primary'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {updateProfile.isPending ? 'Saving...' : 'Next →'}
      </button>
      {!isValid && (
        <p className="text-center text-xs text-gray-400 mt-2">Please fill in all fields to continue</p>
      )}
    </div>
  );
}
