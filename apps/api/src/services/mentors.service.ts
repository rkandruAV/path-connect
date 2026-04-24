import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { NotFoundError } from '../utils/errors.js';
import { getPaginationArgs, toPaginatedResponse } from '../utils/pagination.js';
import type { ListMentorsQuery } from '../validators/mentors.validator.js';

export async function listMentors(filters: ListMentorsQuery) {
  const { skip, take, page, limit } = getPaginationArgs(filters);

  const where: Prisma.MentorProfileWhereInput = {
    isActive: true,
    ...(filters.industry && { industry: { equals: filters.industry, mode: 'insensitive' as const } }),
    ...(filters.expertise && { expertise: { has: filters.expertise } }),
  };

  const [mentors, total] = await Promise.all([
    prisma.mentorProfile.findMany({
      where,
      skip,
      take,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            photoUrl: true,
            role: true,
            currentPosition: true,
            bio: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.mentorProfile.count({ where }),
  ]);

  return toPaginatedResponse(mentors, total, page, limit);
}

export async function getMentorById(id: string) {
  const mentor = await prisma.mentorProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          displayName: true,
          photoUrl: true,
          role: true,
          currentPosition: true,
          bio: true,
        },
      },
    },
  });
  if (!mentor) throw new NotFoundError('Mentor', id);
  return mentor;
}
