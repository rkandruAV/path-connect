'use client';

import { useState } from 'react';
import { useUpsertNotes } from '@/hooks/useSessions';
import { sessionNotesSchema } from '@path-connect/shared';

interface PersonalNotesProps {
  sessionId: string;
  existingNote?: string;
}

export function PersonalNotes({ sessionId, existingNote }: PersonalNotesProps) {
  const [content, setContent] = useState(existingNote || '');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const upsertNotes = useUpsertNotes();

  const handleSave = async () => {
    const result = sessionNotesSchema.safeParse({ content: content.trim() });
    if (!result.success) {
      setError(result.error.errors[0]?.message || 'Invalid input');
      return;
    }
    setError('');
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
        onChange={(e) => { setContent(e.target.value); setSaved(false); setError(''); }}
        className="input min-h-[120px] resize-none mb-1"
        maxLength={10000}
        placeholder="What are you thinking about after this session? Any additional reflections..."
      />
      <div className="flex justify-between items-center mb-3">
        {error ? (
          <p className="text-xs text-red-500">{error}</p>
        ) : (
          <span />
        )}
        <span className={`text-xs ${content.length > 9000 ? 'text-amber-500' : 'text-gray-400'}`}>
          {content.length}/10000
        </span>
      </div>

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
