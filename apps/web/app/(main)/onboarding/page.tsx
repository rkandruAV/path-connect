'use client';

import { useCurrentUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { MentorOnboardingForm } from '@/components/mentors/MentorOnboardingForm';

export default function OnboardingPage() {
  const { data: user, isLoading } = useCurrentUser();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  // If mentee or already has a mentor profile, go to dashboard
  if (user?.role !== 'MENTOR' || user?.mentorProfile) {
    router.replace('/dashboard');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Set Up Your Mentor Profile</h1>
        <p className="text-gray-500 mt-1">
          Help mentees find you by sharing your expertise and availability
        </p>
      </div>

      <div className="card">
        <MentorOnboardingForm />
      </div>
    </div>
  );
}
