import api from '@/lib/api';

export interface Mentor {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  expertise: string[];
  bio: string;
  rating: number;
  totalSessions: number;
  availability: string[];
  matchScore?: number;
}

export const mentorService = {
  getAll: (params?: Record<string, string>) =>
    api.get<{ data: Mentor[] }>('/mentors', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<{ data: Mentor }>(`/mentors/${id}`).then((r) => r.data),

  getAIMatches: () =>
    api.get<{ data: Mentor[] }>('/mentors/ai-matches').then((r) => r.data),
};
