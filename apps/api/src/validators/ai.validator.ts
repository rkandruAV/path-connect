import { z } from 'zod';

// Inlined from @path-connect/shared to avoid runtime dependency on shared dist/
export const matchMentorsSchema = z.object({
  targetRole: z.string().max(200).optional(),
  currentPosition: z.string().max(200).optional(),
  goals: z.string().max(2000).optional(),
});
export type MatchMentorsInput = z.infer<typeof matchMentorsSchema>;

export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000, 'Message must be under 2000 characters'),
  conversationId: z.string().optional(),
});
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;

export const sessionIdParamsSchema = z.object({
  id: z.string().min(1),
});
