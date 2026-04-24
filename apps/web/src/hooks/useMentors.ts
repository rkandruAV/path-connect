'use client';

import { useQuery } from '@tanstack/react-query';
import { mentorService } from '@/services/mentorService';

export function useMentors(params?: { expertise?: string; industry?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['mentors', params],
    queryFn: () => mentorService.getAll(params),
  });
}

export function useMentor(id: string) {
  return useQuery({
    queryKey: ['mentors', id],
    queryFn: () => mentorService.getById(id).then((r) => r.data),
    enabled: !!id,
  });
}
