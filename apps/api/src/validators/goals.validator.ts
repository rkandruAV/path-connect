import { z } from 'zod';

export const createGoalSchema = z.object({
  planId: z.string().min(1).optional(),
  title: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  period: z.enum(['THIRTY_DAY', 'SIXTY_DAY', 'NINETY_DAY']),
  isAiSuggested: z.boolean().optional(),
});

export const updateGoalSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(['PENDING', 'ON_TRACK', 'ACHIEVED', 'NEEDS_UPDATE']).optional(),
});

export const listGoalsQuerySchema = z.object({
  period: z.enum(['THIRTY_DAY', 'SIXTY_DAY', 'NINETY_DAY']).optional(),
  status: z.enum(['PENDING', 'ON_TRACK', 'ACHIEVED', 'NEEDS_UPDATE']).optional(),
  planId: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const goalIdParamsSchema = z.object({
  id: z.string().min(1),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type ListGoalsQuery = z.infer<typeof listGoalsQuerySchema>;
