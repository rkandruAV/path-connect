import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError, NotFoundError, ForbiddenError } from '../utils/errors.js';
import { getPaginationArgs, toPaginatedResponse } from '../utils/pagination.js';
import { sendConnectionRequestEmail, sendConnectionAcceptedEmail } from '../lib/email.js';
import type { CreateMatchInput, UpdateMatchInput, ListMatchesQuery } from '../validators/matches.validator.js';

export async function createMatch(menteeId: string, data: CreateMatchInput) {
  if (menteeId === data.mentorId) {
    throw new AppError('Cannot match with yourself', 400);
  }

  const mentor = await prisma.user.findUnique({ where: { id: data.mentorId } });
  if (!mentor || mentor.role !== 'MENTOR') {
    throw new AppError('Specified user is not a mentor', 400);
  }

  const existing = await prisma.match.findUnique({
    where: { menteeId_mentorId: { menteeId, mentorId: data.mentorId } },
  });
  if (existing && existing.status !== 'DECLINED' && existing.status !== 'COMPLETED') {
    throw new AppError('An active or pending match already exists with this mentor', 409);
  }

  return prisma.match.create({
    data: {
      menteeId,
      mentorId: data.mentorId,
      score: data.score,
      reason: data.reason,
    },
    include: {
      mentee: { select: { id: true, displayName: true, photoUrl: true, email: true, role: true } },
      mentor: { select: { id: true, displayName: true, photoUrl: true, email: true, role: true } },
    },
  });
}

export async function requestConnection(matchId: string, userId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      mentee: { select: { id: true, displayName: true, email: true } },
      mentor: { select: { id: true, displayName: true, email: true } },
    },
  });
  if (!match) throw new NotFoundError('Match', matchId);
  if (match.menteeId !== userId) {
    throw new ForbiddenError('Only the mentee can request this connection');
  }
  if (match.status !== 'PENDING') {
    throw new AppError('This connection is no longer pending', 400);
  }

  // Send notification to mentor
  if (match.mentor?.email) {
    await sendConnectionRequestEmail({
      to: match.mentor.email,
      menteeName: match.mentee?.displayName || match.mentee?.email || 'A mentee',
      mentorName: match.mentor.displayName || undefined,
      reason: match.reason || undefined,
    });
  }

  return { message: 'Connection request sent to mentor' };
}

export async function listMatches(userId: string, filters: ListMatchesQuery) {
  const { skip, take, page, limit } = getPaginationArgs(filters);

  const where: Prisma.MatchWhereInput = {
    OR: [{ menteeId: userId }, { mentorId: userId }],
    ...(filters.status && { status: filters.status }),
  };

  const [matches, total] = await Promise.all([
    prisma.match.findMany({
      where,
      skip,
      take,
      include: {
        mentee: { select: { id: true, displayName: true, photoUrl: true, email: true, role: true } },
        mentor: { select: { id: true, displayName: true, photoUrl: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.match.count({ where }),
  ]);

  return toPaginatedResponse(matches, total, page, limit);
}

export async function updateMatchStatus(matchId: string, userId: string, data: UpdateMatchInput) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw new NotFoundError('Match', matchId);

  // Validate permissions and state transitions
  if (data.status === 'ACTIVE' || data.status === 'DECLINED') {
    if (match.mentorId !== userId) {
      throw new ForbiddenError('Only the mentor can accept or decline a connection request');
    }
    if (match.status !== 'PENDING') {
      throw new AppError('Can only accept/decline a pending match', 400);
    }
  }

  if (data.status === 'COMPLETED') {
    if (match.menteeId !== userId && match.mentorId !== userId) {
      throw new ForbiddenError();
    }
    if (match.status !== 'ACTIVE') {
      throw new AppError('Can only complete an active match', 400);
    }
  }

  const updated = await prisma.match.update({
    where: { id: matchId },
    data: { status: data.status },
    include: {
      mentee: { select: { id: true, displayName: true, photoUrl: true, email: true, role: true } },
      mentor: { select: { id: true, displayName: true, photoUrl: true, email: true, role: true } },
    },
  });

  // Notify mentee when mentor accepts (non-blocking)
  if (data.status === 'ACTIVE' && updated.mentee?.email) {
    sendConnectionAcceptedEmail({
      to: updated.mentee.email,
      menteeName: updated.mentee.displayName || 'there',
      mentorName: updated.mentor?.displayName || 'Your mentor',
    }).catch((err) => console.error('[email] Failed to send acceptance email:', err));
  }

  return updated;
}
