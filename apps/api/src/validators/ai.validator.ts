import { z } from 'zod';

// Re-export shared schemas so existing backend imports continue to work
export { matchMentorsSchema, chatMessageSchema } from '@path-connect/shared';
export type { MatchMentorsInput, ChatMessageInput } from '@path-connect/shared';

export const sessionIdParamsSchema = z.object({
  id: z.string().min(1),
});
