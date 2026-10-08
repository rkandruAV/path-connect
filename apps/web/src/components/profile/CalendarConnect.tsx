'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface CalendarConnectProps {
  connected: boolean;
  email?: string | null;
}

export function CalendarConnect({ connected, email }: CalendarConnectProps) {
  const [disconnecting, setDisconnecting] = useState(false);
  const queryClient = useQueryClient();

  const handleConnect = () => {
    // Redirect to backend OAuth flow — the backend redirects to Google
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || '/api/v1'}/calendar/connect`;
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await api.delete('/calendar/disconnect');
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    } catch {
      // Ignore — user can retry
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Google Calendar</h2>
      <p className="text-sm text-gray-500 mb-4">
        Connect your Google Calendar to auto-create events with Google Meet links when sessions are scheduled.
      </p>

      {connected ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Connected</p>
              {email && <p className="text-xs text-gray-500">{email}</p>}
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
          >
            {disconnecting ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M19.5 3.5H4.5C3.4 3.5 2.5 4.4 2.5 5.5V19.5C2.5 20.6 3.4 21.5 4.5 21.5H19.5C20.6 21.5 21.5 20.6 21.5 19.5V5.5C21.5 4.4 20.6 3.5 19.5 3.5Z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M2.5 9.5H21.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8.5 3.5V9.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M15.5 3.5V9.5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          Connect Google Calendar
        </button>
      )}
    </div>
  );
}
