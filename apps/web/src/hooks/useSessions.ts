'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionService } from '@/services/sessionService';
import type { SessionStatus } from '@path-connect/shared';

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
