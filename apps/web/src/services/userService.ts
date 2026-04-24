import api from '@/lib/api';
import type { ApiResponse, UserProfile } from '@path-connect/shared';

export const userService = {
  getMe: () =>
    api.get<ApiResponse<UserProfile>>('/users/me').then((r) => r.data),

  updateMe: (data: Partial<Pick<UserProfile, 'displayName' | 'currentPosition' | 'targetRole' | 'bio'>>) =>
    api.patch<ApiResponse<UserProfile>>('/users/me', data).then((r) => r.data),

  create: (data: { firebaseUid: string; email: string; role: 'MENTOR' | 'MENTEE' }) =>
    api.post<ApiResponse<UserProfile>>('/users', data).then((r) => r.data),
};
