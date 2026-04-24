import { z } from 'zod';

export const createMatchSchema = z.object({
  mentorId: z.string().min(1),
  score: z.number().min(0).max(100).optional(),
  reason: z.string().max(1000).optional(),
});

export const updateMatchSchema = z.object({
  status: z.enum(['ACTIVE', 'DECLINED', 'COMPLETED']),
});

export const listMatchesQuerySchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'COMPLETED', 'DECLINED']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const matchIdParamsSchema = z.object({
  id: z.string().min(1),
});

export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type UpdateMatchInput = z.infer<typeof updateMatchSchema>;
export type ListMatchesQuery = z.infer<typeof listMatchesQuerySchema>;
