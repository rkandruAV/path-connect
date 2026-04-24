'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/stores/authStore';
import type { UserProfile } from '@path-connect/shared';

export function useCurrentUser() {
  const { user: firebaseUser, loading } = useAuthStore();

  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => userService.getMe().then((r) => r.data),
    enabled: !loading && !!firebaseUser,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Pick<UserProfile, 'displayName' | 'currentPosition' | 'targetRole' | 'bio'>>) =>
      userService.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}
