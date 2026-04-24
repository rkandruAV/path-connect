import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError, NotFoundError, ForbiddenError } from '../utils/errors.js';
import { getPaginationArgs, toPaginatedResponse } from '../utils/pagination.js';
import type { CreateGoalInput, UpdateGoalInput, ListGoalsQuery } from '../validators/goals.validator.js';

export async function createGoal(userId: string, data: CreateGoalInput) {
  if (data.planId) {
    const plan = await prisma.ninetyDayPlan.findUnique({ where: { id: data.planId } });
    if (!plan) throw new NotFoundError('NinetyDayPlan', data.planId);
    if (plan.userId !== userId) throw new ForbiddenError('This plan does not belong to you');
  }

  return prisma.goal.create({
    data: {
      userId,
      planId: data.planId,
      title: data.title,
      description: data.description,
      period: data.period,
      isAiSuggested: data.isAiSuggested || false,
    },
  });
}

export async function listGoals(userId: string, filters: ListGoalsQuery) {
  const { skip, take, page, limit } = getPaginationArgs(filters);

  const where: Prisma.GoalWhereInput = {
    userId,
    ...(filters.period && { period: filters.period }),
    ...(filters.status && { status: filters.status }),
    ...(filters.planId && { planId: filters.planId }),
  };

  const [goals, total] = await Promise.all([
    prisma.goal.findMany({
      where,
      skip,
      take,
      orderBy: [{ period: 'asc' }, { createdAt: 'asc' }],
    }),
    prisma.goal.count({ where }),
  ]);

  return toPaginatedResponse(goals, total, page, limit);
}

export async function updateGoal(goalId: string, userId: string, data: UpdateGoalInput) {
  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal) throw new NotFoundError('Goal', goalId);
  if (goal.userId !== userId) throw new ForbiddenError('This goal does not belong to you');

  return prisma.goal.update({
    where: { id: goalId },
    data,
  });
}
