import api from '@/lib/api';
import type { ApiResponse, PaginatedResponse, MentorWithUser } from '@path-connect/shared';

export const mentorService = {
  getAll: (params?: { expertise?: string; industry?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<MentorWithUser>>('/mentors', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<MentorWithUser>>(`/mentors/${id}`).then((r) => r.data),
};
