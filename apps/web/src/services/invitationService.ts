import api from '@/lib/api';

export interface Invitation {
  id: string;
  token: string;
  inviteeEmail: string;
  inviteeName: string | null;
  inviteeRole: string;
  status: string;
  inviteLink: string;
  expiresAt: string;
  createdAt: string;
}

export interface InvitationDetails {
  inviteeName: string | null;
  inviteeEmail: string;
  inviteeRole: string;
  inviter: {
    id: string;
    displayName: string | null;
    email: string;
    photoUrl: string | null;
  };
}

export const invitationService = {
  create: (data: { email: string; name?: string; role?: string }) =>
    api.post<{ data: Invitation; message: string }>('/invitations', data).then((r) => r.data),

  getByToken: (token: string) =>
    api.get<{ data: InvitationDetails }>(`/invitations/${token}`).then((r) => r.data),

  accept: (token: string) =>
    api.post<{ data: Invitation; message: string }>(`/invitations/${token}/accept`).then((r) => r.data),

  list: () =>
    api.get<{ data: Invitation[] }>('/invitations').then((r) => r.data),
};
