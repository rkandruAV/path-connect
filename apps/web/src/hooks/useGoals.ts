'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalService } from '@/services/goalService';
import type { GoalPeriod, GoalStatus } from '@path-connect/shared';

export function useGoals(params?: { period?: GoalPeriod; status?: GoalStatus; planId?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['goals', params],
    queryFn: () => goalService.getAll(params),
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status?: GoalStatus; title?: string } }) =>
      goalService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}
