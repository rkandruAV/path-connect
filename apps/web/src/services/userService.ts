import api from '@/lib/api';
import type { ApiResponse, UserProfile } from '@path-connect/shared';

export interface UpdateMeInput {
  displayName?: string;
  currentPosition?: string;
  targetRole?: string;
  bio?: string;
  mentorProfile?: {
    expertise?: string[];
    industry?: string;
    yearsExperience?: number;
    availability?: string[];
    bio?: string;
    isActive?: boolean;
  };
}

export const userService = {
  getMe: () =>
    api.get<ApiResponse<UserProfile>>('/users/me').then((r) => r.data),

  updateMe: (data: UpdateMeInput) =>
    api.patch<ApiResponse<UserProfile>>('/users/me', data).then((r) => r.data),

  create: (data: { firebaseUid: string; email: string; role: 'MENTOR' | 'MENTEE' }) =>
    api.post<ApiResponse<UserProfile>>('/users', data).then((r) => r.data),
};
