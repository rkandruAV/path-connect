'use client';

import type { MentorWithUser } from '@path-connect/shared';

interface MentorCardProps {
  mentor: MentorWithUser;
  onConnect: (mentorUserId: string) => void;
  connecting?: boolean;
}

export function MentorCard({ mentor, onConnect, connecting }: MentorCardProps) {
  const initials = mentor.user.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <div className="card">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-700 shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900">{mentor.user.displayName}</h3>
          <p className="text-sm text-gray-500">{mentor.user.currentPosition}</p>
          {mentor.industry && (
            <p className="text-xs text-gray-400 mt-0.5">{mentor.industry}</p>
          )}
          {mentor.yearsExperience && (
            <p className="text-xs text-gray-400">{mentor.yearsExperience} years experience</p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {mentor.expertise.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 text-[11px] font-medium bg-primary-50 text-primary-600 rounded-full"
              >
                {skill}
              </span>
            ))}
            {mentor.expertise.length > 4 && (
              <span className="px-2 py-0.5 text-[11px] text-gray-400 rounded-full">
                +{mentor.expertise.length - 4} more
              </span>
            )}
          </div>
          {mentor.bio && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{mentor.bio}</p>
          )}
        </div>
      </div>
      <button
        onClick={() => onConnect(mentor.user.id)}
        disabled={connecting}
        className="btn-primary w-full mt-4 text-sm"
      >
        {connecting ? 'Connecting...' : 'Connect'}
      </button>
    </div>
  );
}
