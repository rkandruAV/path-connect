'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionService } from '@/services/sessionService';
import type { SessionStatus, SessionType } from '@path-connect/shared';

export function useSessions(params?: { status?: SessionStatus; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['sessions', params],
    queryFn: () => sessionService.getAll(params),
  });
}

export function useSessionDetail(id: string) {
  return useQuery({
    queryKey: ['sessions', id],
    queryFn: () => sessionService.getById(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { matchId: string; scheduledAt: string; duration: number; type?: SessionType }) =>
      sessionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useUpsertNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, content }: { sessionId: string; content: string }) =>
      sessionService.upsertNotes(sessionId, content),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', variables.sessionId] });
    },
  });
}
