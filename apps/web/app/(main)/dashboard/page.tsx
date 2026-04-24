'use client';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { UpcomingSession } from '@/components/dashboard/UpcomingSession';
import { FeatureCard } from '@/components/dashboard/FeatureCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { useGoals } from '@/hooks/useGoals';
import { useSessions } from '@/hooks/useSessions';

export default function DashboardPage() {
  const { data: goals } = useGoals();
  const { data: completedSessions } = useSessions({ status: 'COMPLETED' });

  const totalGoals = goals?.total || 0;
  const achievedGoals = goals?.data?.filter((g) => g.status === 'ACHIEVED').length || 0;
  const progressPercent = totalGoals > 0 ? Math.round((achievedGoals / totalGoals) * 100) : 0;

  return (
    <div>
      <DashboardHeader />
      <StatsRow />
      <UpcomingSession />

      <div className="space-y-4 mb-6">
        <FeatureCard
          href="/learning-path"
          icon={
            <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          }
          iconBgColor="bg-primary-50"
          title="Progress Tracking"
          subtitle="View your growth"
        >
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-orange-400 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{progressPercent}%</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{achievedGoals} goals completed</p>
        </FeatureCard>

        <FeatureCard
          href="/sessions"
          icon={
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          }
          iconBgColor="bg-blue-50"
          title="Session Summaries"
          subtitle="Review past sessions"
          badge="AI-Captured"
        >
          <p className="text-xs text-gray-400">{completedSessions?.total || 0} sessions with action items &amp; insights</p>
        </FeatureCard>

        <FeatureCard
          href="/mentors"
          icon={
            <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </svg>
          }
          iconBgColor="bg-orange-50"
          title="Find Mentor"
          subtitle="Discover new mentors"
        >
          <p className="text-xs text-gray-400">Start mentor discovery process</p>
        </FeatureCard>

        <FeatureCard
          href="#"
          icon={
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
          }
          iconBgColor="bg-green-50"
          title="Sounding Board"
          subtitle="Peer support network"
          comingSoon
        />

        <FeatureCard
          href="#"
          icon={
            <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          }
          iconBgColor="bg-primary-50"
          title="Mentorship Loop"
          subtitle="Evolve & give back"
          comingSoon
        />
      </div>

      <QuickActions />
    </div>
  );
}
