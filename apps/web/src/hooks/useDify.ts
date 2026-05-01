'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { difyService } from '@/services/difyService';
import type { MatchMentorsInput } from '@/services/difyService';

export function useMatchMentors() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MatchMentorsInput) => difyService.matchMentors(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

export function useGenerateSessionSummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => difyService.generateSessionSummary(sessionId),
    onSuccess: (_data, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId] });
    },
  });
}

export function useGenerateLearningPath() {
  return useMutation({
    mutationFn: () => difyService.getLearningPath(),
  });
}

export function useChatWithAdvisor() {
  return useMutation({
    mutationFn: ({ message, conversationId }: { message: string; conversationId?: string }) =>
      difyService.chat(message, conversationId),
  });
}
