'use client';

import { useParams } from 'next/navigation';
import { useSessionDetail } from '@/hooks/useSessions';
import { useCurrentUser } from '@/hooks/useUser';
import { SessionDetailHeader } from '@/components/sessions/SessionDetailHeader';
import { ConversationSummary } from '@/components/sessions/ConversationSummary';
import { KeyTopics } from '@/components/sessions/KeyTopics';
import { ActionItems } from '@/components/sessions/ActionItems';
import { KeyInsights } from '@/components/sessions/KeyInsights';
import { PersonalNotes } from '@/components/sessions/PersonalNotes';

export default function SessionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: session, isLoading } = useSessionDetail(id);
  const { data: currentUser } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-20" />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-200" />
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
        <div className="card"><div className="h-32 bg-gray-100 rounded" /></div>
        <div className="card"><div className="h-24 bg-gray-100 rounded" /></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Session not found</p>
      </div>
    );
  }

  const mentorName = session.mentor?.displayName || 'Mentor';
  const existingNote = session.notes?.[0]?.content;

  return (
    <div>
      <SessionDetailHeader session={session} />

      {session.summary && (
        <>
          <ConversationSummary summary={session.summary} />
          <KeyTopics topics={session.summary.keyTopics} />
        </>
      )}

      {session.actionItems?.length > 0 && currentUser && (
        <ActionItems
          actionItems={session.actionItems}
          currentUserId={currentUser.id}
          mentorName={mentorName}
        />
      )}

      {session.summary && session.summary.keyInsights?.length > 0 && (
        <KeyInsights insights={session.summary.keyInsights} />
      )}

      <PersonalNotes sessionId={session.id} existingNote={existingNote} />
    </div>
  );
}
