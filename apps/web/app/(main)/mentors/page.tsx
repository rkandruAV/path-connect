'use client';

import { useState } from 'react';
import { MentorDiscoveryForm } from '@/components/mentors/MentorDiscoveryForm';
import { MentorList } from '@/components/mentors/MentorList';

export default function MentorsPage() {
  const [step, setStep] = useState<'form' | 'results'>('form');

  if (step === 'results') {
    return <MentorList onBack={() => setStep('form')} />;
  }

  return <MentorDiscoveryForm onComplete={() => setStep('results')} />;
}
