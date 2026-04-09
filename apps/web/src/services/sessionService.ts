import api from '@/lib/api';

export interface Session {
  id: string;
  matchId: string;
  mentorName: string;
  menteeName: string;
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  aiSummary?: string;
  actionItems?: string[];
}

export const sessionService = {
  getAll: (params?: Record<string, string>) =>
    api.get<{ data: Session[] }>('/sessions', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<{ data: Session }>(`/sessions/${id}`).then((r) => r.data),

  create: (data: { matchId: string; scheduledAt: string; duration: number }) =>
    api.post<{ data: Session }>('/sessions', data).then((r) => r.data),

  update: (id: string, data: Partial<Session>) =>
    api.patch<{ data: Session }>(`/sessions/${id}`, data).then((r) => r.data),

  getSummary: (id: string) =>
    api.get<{ data: { summary: string; actionItems: string[] } }>(`/sessions/${id}/summary`).then((r) => r.data),
};
