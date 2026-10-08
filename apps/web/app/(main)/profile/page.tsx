'use client';

export const dynamic = 'force-dynamic';

import { useCurrentUser } from '@/hooks/useUser';
import { CalendarConnect } from '@/components/profile/CalendarConnect';

export default function ProfilePage() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="card"><div className="h-32 bg-gray-100 rounded" /></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Unable to load profile</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-accent-100 flex items-center justify-center text-xl font-semibold text-accent-700">
            {(user.displayName || user.email)
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user.displayName || 'No name set'}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-400 mt-1">{user.role}</p>
          </div>
        </div>
      </div>

      {user.role === 'MENTOR' && (
        <CalendarConnect
          connected={!!user.googleCalendarConnected}
          email={user.googleCalendarEmail}
        />
      )}
    </div>
  );
}
