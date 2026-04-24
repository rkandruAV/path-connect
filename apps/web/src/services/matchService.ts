import api from '@/lib/api';
import type { ApiResponse, PaginatedResponse, Match, MatchStatus } from '@path-connect/shared';

export const matchService = {
  getAll: (params?: { status?: MatchStatus; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Match>>('/matches', { params }).then((r) => r.data),

  create: (data: { mentorId: string; score?: number; reason?: string }) =>
    api.post<ApiResponse<Match>>('/matches', data).then((r) => r.data),

  updateStatus: (id: string, status: MatchStatus) =>
    api.patch<ApiResponse<Match>>(`/matches/${id}`, { status }).then((r) => r.data),
};
