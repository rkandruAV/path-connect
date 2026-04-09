// Shared types and utilities for PathConnect
// Expanded in Phase 1 with full type definitions

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export type UserRole = 'MENTOR' | 'MENTEE' | 'ADMIN';

export interface UserProfile {
  id: string;
  firebaseUid: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
  role: UserRole;
}
