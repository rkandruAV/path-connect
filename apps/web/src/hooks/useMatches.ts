'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchService } from '@/services/matchService';
import type { MatchStatus } from '@path-connect/shared';

export function useMatches(params?: { status?: MatchStatus; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['matches', params],
    queryFn: () => matchService.getAll(params),
  });
}

export function useCreateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { mentorId: string; score?: number; reason?: string }) =>
      matchService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}
