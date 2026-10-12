'use client';

import { useState } from 'react';
import { MentorDiscoveryForm } from '@/components/mentors/MentorDiscoveryForm';
import { MentorList } from '@/components/mentors/MentorList';
import { useMatches } from '@/hooks/useMatches';

export default function MentorsPage() {
  const { data: matches, isLoading } = useMatches({ status: 'PENDING' });
  const hasMatches = !isLoading && (matches?.data?.length ?? 0) > 0;
  const [step, setStep] = useState<'form' | 'results' | null>(null);

  // Show loading skeleton while checking for existing matches
  if (isLoading && step === null) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-32 bg-gray-200 rounded" />
      </div>
    );
  }

  // Auto-select step: show results if matches exist, otherwise show form
  const currentStep = step ?? (hasMatches ? 'results' : 'form');

  if (currentStep === 'results') {
    return <MentorList onBack={() => setStep('form')} />;
  }

  return <MentorDiscoveryForm onComplete={() => setStep('results')} />;
}
