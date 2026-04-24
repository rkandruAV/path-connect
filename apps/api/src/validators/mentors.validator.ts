import { z } from 'zod';

export const listMentorsQuerySchema = z.object({
  expertise: z.string().optional(),
  industry: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const mentorIdParamsSchema = z.object({
  id: z.string().min(1),
});

export type ListMentorsQuery = z.infer<typeof listMentorsQuerySchema>;
