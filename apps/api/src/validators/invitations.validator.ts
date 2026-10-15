import { z } from 'zod';

export const createInvitationSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().max(100).optional(),
  role: z.enum(['MENTOR', 'MENTEE']).default('MENTOR'),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
