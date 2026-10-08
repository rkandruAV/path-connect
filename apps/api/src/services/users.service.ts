import { prisma } from '../lib/prisma.js';
import { invalidateCache } from '../lib/redis.js';
import { NotFoundError } from '../utils/errors.js';
import type { CreateUserInput, UpdateUserInput } from '../validators/users.validator.js';

export async function getUserWithProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { mentorProfile: true },
  });
  if (!user) throw new NotFoundError('User', userId);

  // Never expose refresh token to frontend; provide derived boolean instead
  const { googleRefreshToken, ...safeUser } = user;
  return {
    ...safeUser,
    googleCalendarConnected: !!googleRefreshToken,
  };
}

export async function createOrUpdateUser(userId: string, data: CreateUserInput) {
  const { mentorProfile, ...userData } = data;

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: userData,
    });

    if (mentorProfile && user.role === 'MENTOR') {
      await tx.mentorProfile.upsert({
        where: { userId },
        create: { userId, ...mentorProfile },
        update: mentorProfile,
      });
    }

    return tx.user.findUnique({
      where: { id: userId },
      include: { mentorProfile: true },
    });
  });

  if (data.mentorProfile) {
    await invalidateCache('mentors:active');
  }

  return result;
}

export async function updateUser(userId: string, data: UpdateUserInput) {
  const { mentorProfile, ...userData } = data;

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: userData,
    });

    if (mentorProfile && user.role === 'MENTOR') {
      await tx.mentorProfile.upsert({
        where: { userId },
        create: { userId, ...mentorProfile },
        update: mentorProfile,
      });
    }

    return tx.user.findUnique({
      where: { id: userId },
      include: { mentorProfile: true },
    });
  });

  if (data.mentorProfile) {
    await invalidateCache('mentors:active');
  }

  return result;
}
