'use client';

import { useState } from 'react';
import { useUpsertNotes } from '@/hooks/useSessions';

interface PersonalNotesProps {
  sessionId: string;
  existingNote?: string;
}

export function PersonalNotes({ sessionId, existingNote }: PersonalNotesProps) {
  const [content, setContent] = useState(existingNote || '');
  const [saved, setSaved] = useState(false);
  const upsertNotes = useUpsertNotes();

  const handleSave = async () => {
    if (!content.trim()) return;
    await upsertNotes.mutateAsync({ sessionId, content: content.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="card">
      <h2 className="font-semibold text-gray-900 mb-1">Personal Notes</h2>
      <p className="text-xs text-gray-400 mb-3">Capture your own thoughts or reflections</p>

      <textarea
        value={content}
        onChange={(e) => { setContent(e.target.value); setSaved(false); }}
        className="input min-h-[120px] resize-none mb-3"
        placeholder="What are you thinking about after this session? Any additional reflections..."
      />

      <button
        onClick={handleSave}
        disabled={upsertNotes.isPending || !content.trim()}
        className="btn-primary w-full"
      >
        {upsertNotes.isPending ? 'Saving...' : saved ? 'Saved!' : 'Save Note'}
      </button>
    </div>
  );
}
