'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invitationService } from '@/services/invitationService';

export function useInvitations() {
  return useQuery({
    queryKey: ['invitations'],
    queryFn: () => invitationService.list(),
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { email: string; name?: string; role?: string }) =>
      invitationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });
}

export function useInvitationByToken(token: string | null) {
  return useQuery({
    queryKey: ['invitation', token],
    queryFn: () => invitationService.getByToken(token!),
    enabled: !!token,
  });
}

export function useAcceptInvitation() {
  return useMutation({
    mutationFn: (token: string) => invitationService.accept(token),
  });
}
