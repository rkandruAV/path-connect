import api from '@/lib/api';

export interface MatchMentorsInput {
  targetRole?: string;
  currentPosition?: string;
  goals?: string;
}

export interface LearningPathGoal {
  title: string;
  period: string;
  description: string;
}

export const difyService = {
  matchMentors: (data: MatchMentorsInput) =>
    api.post<{ data: unknown[]; message: string }>('/ai/match-mentors', data).then((r) => r.data),

  chat: (message: string, conversationId?: string) =>
    api.post<{ data: { answer: string; conversationId: string } }>('/ai/chat', {
      message,
      conversationId,
    }).then((r) => r.data),

  getLearningPath: () =>
    api.get<{ data: LearningPathGoal[] }>('/ai/learning-path').then((r) => r.data),

  generateSessionSummary: (sessionId: string) =>
    api.post<{ data: unknown }>(`/ai/sessions/${sessionId}/summarize`).then((r) => r.data),
};
