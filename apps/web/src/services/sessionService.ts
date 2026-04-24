import api from '@/lib/api';
import type {
  ApiResponse,
  PaginatedResponse,
  Session,
  SessionDetail,
  SessionNote,
  SessionStatus,
  SessionType,
  UserProfile,
  SessionSummary,
} from '@path-connect/shared';

export type SessionListItem = Session & {
  mentee: Pick<UserProfile, 'id' | 'displayName' | 'photoUrl' | 'email' | 'role'>;
  mentor: Pick<UserProfile, 'id' | 'displayName' | 'photoUrl' | 'email' | 'role'>;
  summary?: SessionSummary | null;
};

export const sessionService = {
  getAll: (params?: { status?: SessionStatus; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<SessionListItem>>('/sessions', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<SessionDetail>>(`/sessions/${id}`).then((r) => r.data),

  create: (data: { matchId: string; scheduledAt: string; duration: number; type?: SessionType; meetingLink?: string }) =>
    api.post<ApiResponse<Session>>('/sessions', data).then((r) => r.data),

  upsertNotes: (id: string, content: string) =>
    api.post<ApiResponse<SessionNote>>(`/sessions/${id}/notes`, { content }).then((r) => r.data),
};
