import { z } from 'zod';

export const createSessionSchema = z.object({
  matchId: z.string().min(1),
  scheduledAt: z.string().datetime(),
  duration: z.number().int().min(15).max(180),
  type: z.enum(['VIDEO', 'AUDIO', 'IN_PERSON']).optional(),
  meetingLink: z.string().url().optional(),
});

export const sessionNotesSchema = z.object({
  content: z.string().min(1).max(10000),
});

export const listSessionsQuerySchema = z.object({
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const sessionIdParamsSchema = z.object({
  id: z.string().min(1),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type SessionNotesInput = z.infer<typeof sessionNotesSchema>;
export type ListSessionsQuery = z.infer<typeof listSessionsQuerySchema>;
