import { z } from 'zod';

// ─── AI Validators ──────────────────────────────────────

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

// ─── Session Validators ─────────────────────────────────

export const sessionNotesSchema = z.object({
  content: z.string().min(1, 'Notes cannot be empty').max(10000, 'Notes must be under 10,000 characters'),
});
export type SessionNotesInput = z.infer<typeof sessionNotesSchema>;

export const createSessionSchema = z.object({
  matchId: z.string().min(1),
  scheduledAt: z.string().datetime(),
  duration: z.number().int().min(15, 'Minimum 15 minutes').max(180, 'Maximum 3 hours'),
  type: z.enum(['VIDEO', 'AUDIO', 'IN_PERSON']).optional(),
  meetingLink: z.string().url('Invalid URL').optional(),
});
export type CreateSessionInput = z.infer<typeof createSessionSchema>;

// ─── User / Mentor Validators ───────────────────────────

export const mentorProfileSchema = z.object({
  expertise: z.array(z.string()).min(1, 'At least one area of expertise required').max(20, 'Maximum 20 areas'),
  industry: z.string().max(100, 'Industry must be under 100 characters').optional(),
  yearsExperience: z.number().int().min(0).max(50, 'Maximum 50 years').optional(),
  availability: z.array(z.string()).optional(),
  bio: z.string().max(2000, 'Bio must be under 2000 characters').optional(),
});
export type MentorProfileInput = z.infer<typeof mentorProfileSchema>;

export const updateUserSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  role: z.enum(['MENTOR', 'MENTEE']).optional(),
  currentPosition: z.string().max(200).optional(),
  targetRole: z.string().max(200).optional(),
  bio: z.string().max(2000).optional(),
  mentorProfile: mentorProfileSchema.optional(),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// ─── Goal Validators ────────────────────────────────────

export const createGoalSchema = z.object({
  planId: z.string().min(1).optional(),
  title: z.string().min(1, 'Title is required').max(500, 'Title must be under 500 characters'),
  description: z.string().max(2000).optional(),
  period: z.enum(['THIRTY_DAY', 'SIXTY_DAY', 'NINETY_DAY']),
  isAiSuggested: z.boolean().optional(),
});
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
