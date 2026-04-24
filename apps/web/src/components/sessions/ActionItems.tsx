'use client';

import { format } from 'date-fns';
import type { ActionItem, UserProfile } from '@path-connect/shared';

interface ActionItemsProps {
  actionItems: (ActionItem & { assignee?: Pick<UserProfile, 'id' | 'displayName'> })[];
  currentUserId: string;
  mentorName: string;
}

export function ActionItems({ actionItems, currentUserId, mentorName }: ActionItemsProps) {
  if (!actionItems.length) return null;

  const yourItems = actionItems.filter((item) => item.assigneeId === currentUserId);
  const mentorItems = actionItems.filter((item) => item.assigneeId !== currentUserId);
  const pendingCount = actionItems.filter((item) => item.status === 'PENDING').length;

  return (
    <div className="card mb-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
          <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">Action Items</h2>
          <p className="text-xs text-gray-400">{pendingCount} pending for you</p>
        </div>
      </div>

      {yourItems.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Your Actions</h3>
          <div className="space-y-2">
            {yourItems.map((item) => (
              <ActionItemRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {mentorItems.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">{mentorName}&apos;s Actions</h3>
          <div className="space-y-2">
            {mentorItems.map((item) => (
              <ActionItemRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ActionItemRow({ item }: { item: ActionItem }) {
  const isCompleted = item.status === 'COMPLETED';

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${isCompleted ? 'bg-gray-50 border-gray-100' : 'bg-orange-50/50 border-orange-100'}`}>
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ${
        isCompleted ? 'border-green-400 bg-green-400' : 'border-gray-300 bg-white'
      }`}>
        {isCompleted && (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
          {item.description}
        </p>
        {item.dueDate && (
          <p className="text-xs text-gray-400 mt-1">
            Due: {format(new Date(item.dueDate), 'MMM d')}
          </p>
        )}
      </div>
    </div>
  );
}
