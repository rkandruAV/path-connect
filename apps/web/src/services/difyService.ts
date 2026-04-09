import api from '@/lib/api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface LearningPath {
  id: string;
  title: string;
  milestones: {
    title: string;
    description: string;
    resources: string[];
    completed: boolean;
  }[];
  progress: number;
}

export const difyService = {
  chat: (message: string, conversationId?: string) =>
    api.post<{ data: { answer: string; conversationId: string } }>('/ai/chat', {
      message,
      conversationId,
    }).then((r) => r.data),

  getLearningPath: () =>
    api.get<{ data: LearningPath }>('/ai/learning-path').then((r) => r.data),

  generateSessionSummary: (sessionId: string) =>
    api.post<{ data: { summary: string; actionItems: string[] } }>(`/ai/sessions/${sessionId}/summarize`).then((r) => r.data),
};
