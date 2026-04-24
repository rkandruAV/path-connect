import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError, NotFoundError, ForbiddenError } from '../utils/errors.js';
import { getPaginationArgs, toPaginatedResponse } from '../utils/pagination.js';
import type { CreateSessionInput, ListSessionsQuery } from '../validators/sessions.validator.js';

const userSelect = { id: true, displayName: true, photoUrl: true, email: true, role: true };

export async function createSession(userId: string, data: CreateSessionInput) {
  const match = await prisma.match.findUnique({ where: { id: data.matchId } });
  if (!match) throw new NotFoundError('Match', data.matchId);
  if (match.status !== 'ACTIVE') {
    throw new AppError('Can only create sessions for active matches', 400);
  }
  if (match.menteeId !== userId && match.mentorId !== userId) {
    throw new ForbiddenError('You are not part of this match');
  }

  return prisma.session.create({
    data: {
      menteeId: match.menteeId,
      mentorId: match.mentorId,
      matchId: match.id,
      scheduledAt: new Date(data.scheduledAt),
      duration: data.duration,
      type: data.type || 'VIDEO',
      meetingLink: data.meetingLink,
    },
    include: {
      mentee: { select: userSelect },
      mentor: { select: userSelect },
    },
  });
}

export async function listSessions(userId: string, filters: ListSessionsQuery) {
  const { skip, take, page, limit } = getPaginationArgs(filters);

  const where: Prisma.SessionWhereInput = {
    OR: [{ menteeId: userId }, { mentorId: userId }],
    ...(filters.status && { status: filters.status }),
  };

  const [sessions, total] = await Promise.all([
    prisma.session.findMany({
      where,
      skip,
      take,
      include: {
        mentee: { select: userSelect },
        mentor: { select: userSelect },
        summary: true,
      },
      orderBy: { scheduledAt: 'desc' },
    }),
    prisma.session.count({ where }),
  ]);

  return toPaginatedResponse(sessions, total, page, limit);
}

export async function getSessionDetail(sessionId: string, userId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      mentee: { select: userSelect },
      mentor: { select: userSelect },
      summary: true,
      actionItems: {
        include: { assignee: { select: userSelect } },
        orderBy: { createdAt: 'asc' },
      },
      notes: {
        where: { userId },
      },
    },
  });

  if (!session) throw new NotFoundError('Session', sessionId);
  if (session.menteeId !== userId && session.mentorId !== userId) {
    throw new ForbiddenError('You are not part of this session');
  }

  return session;
}

export async function upsertSessionNote(sessionId: string, userId: string, content: string) {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) throw new NotFoundError('Session', sessionId);
  if (session.menteeId !== userId && session.mentorId !== userId) {
    throw new ForbiddenError('You are not part of this session');
  }

  return prisma.sessionNote.upsert({
    where: { sessionId_userId: { sessionId, userId } },
    create: { sessionId, userId, content },
    update: { content },
  });
}
