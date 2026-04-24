import api from '@/lib/api';
import type { ApiResponse, PaginatedResponse, Goal, GoalPeriod, GoalStatus } from '@path-connect/shared';

export const goalService = {
  getAll: (params?: { period?: GoalPeriod; status?: GoalStatus; planId?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Goal>>('/goals', { params }).then((r) => r.data),

  create: (data: { title: string; period: GoalPeriod; planId?: string; description?: string }) =>
    api.post<ApiResponse<Goal>>('/goals', data).then((r) => r.data),

  update: (id: string, data: { status?: GoalStatus; title?: string }) =>
    api.patch<ApiResponse<Goal>>(`/goals/${id}`, data).then((r) => r.data),
};
