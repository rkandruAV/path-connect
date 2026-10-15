import crypto from 'node:crypto';
import { prisma } from '../lib/prisma.js';
import { sendInviteEmail } from '../lib/email.js';
import { AppError, NotFoundError } from '../utils/errors.js';
import type { CreateInvitationInput } from '../validators/invitations.validator.js';

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://path-connect.vercel.app';
const INVITE_EXPIRY_DAYS = 30;

function generateToken(): string {
  return crypto.randomBytes(24).toString('base64url');
}

export function buildInviteLink(token: string): string {
  return `${FRONTEND_URL}/register?invite=${token}`;
}

export async function createInvitation(inviterId: string, input: CreateInvitationInput) {
  const inviter = await prisma.user.findUnique({
    where: { id: inviterId },
    select: { id: true, displayName: true, email: true },
  });
  if (!inviter) throw new NotFoundError('User', inviterId);

  // Check for existing pending invitation to same email from same inviter
  const existing = await prisma.invitation.findFirst({
    where: {
      inviterId,
      inviteeEmail: input.email.toLowerCase(),
      status: 'PENDING',
      expiresAt: { gt: new Date() },
    },
  });

  if (existing) {
    return {
      invitation: existing,
      inviteLink: buildInviteLink(existing.token),
    };
  }

  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

  const invitation = await prisma.invitation.create({
    data: {
      token,
      inviterId,
      inviteeEmail: input.email.toLowerCase(),
      inviteeName: input.name || null,
      inviteeRole: input.role as 'MENTOR' | 'MENTEE',
      expiresAt,
    },
  });

  const inviteLink = buildInviteLink(token);
  const inviterName = inviter.displayName || inviter.email;

  // Send email (non-blocking — don't fail the request if email fails)
  sendInviteEmail({
    to: input.email,
    inviterName,
    inviteeName: input.name,
    inviteLink,
  }).catch((err) => {
    console.error('[invitations] Failed to send invite email:', err);
  });

  return { invitation, inviteLink };
}

export async function getInvitationByToken(token: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: {
      inviter: {
        select: { id: true, displayName: true, email: true, photoUrl: true },
      },
    },
  });

  if (!invitation) throw new NotFoundError('Invitation', token);

  if (invitation.status === 'ACCEPTED') {
    throw new AppError('This invitation has already been used', 400);
  }

  if (invitation.expiresAt < new Date()) {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'EXPIRED' },
    });
    throw new AppError('This invitation has expired', 410);
  }

  return invitation;
}

export async function acceptInvitation(token: string, acceptedUserId: string) {
  const invitation = await prisma.invitation.findUnique({ where: { token } });
  if (!invitation) throw new NotFoundError('Invitation', token);

  if (invitation.status !== 'PENDING') {
    throw new AppError('This invitation is no longer valid', 400);
  }

  if (invitation.expiresAt < new Date()) {
    throw new AppError('This invitation has expired', 410);
  }

  const updated = await prisma.invitation.update({
    where: { id: invitation.id },
    data: { status: 'ACCEPTED', acceptedUserId },
  });

  return updated;
}

export async function listInvitations(userId: string) {
  return prisma.invitation.findMany({
    where: { inviterId: userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}
