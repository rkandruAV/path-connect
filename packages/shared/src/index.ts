// Shared types and utilities for PathConnect

import { z } from 'zod';

// ─── Shared Validators (Zod schemas used by both frontend & backend) ─

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

export const createGoalSchema = z.object({
  planId: z.string().min(1).optional(),
  title: z.string().min(1, 'Title is required').max(500, 'Title must be under 500 characters'),
  description: z.string().max(2000).optional(),
  period: z.enum(['THIRTY_DAY', 'SIXTY_DAY', 'NINETY_DAY']),
  isAiSuggested: z.boolean().optional(),
});
export type CreateGoalInput = z.infer<typeof createGoalSchema>;

// ─── Generic Response Types ──────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiErrorResponse {
  data: null;
  message: string;
  errors?: { field: string; message: string }[];
}

// ─── Enums ───────────────────────────────────────────────

export type UserRole = 'MENTOR' | 'MENTEE' | 'ADMIN';
export type MatchStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'DECLINED';
export type SessionStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
export type SessionType = 'VIDEO' | 'AUDIO' | 'IN_PERSON';
export type ActionItemStatus = 'PENDING' | 'COMPLETED';
export type GoalPeriod = 'THIRTY_DAY' | 'SIXTY_DAY' | 'NINETY_DAY';
export type GoalStatus = 'PENDING' | 'ON_TRACK' | 'ACHIEVED' | 'NEEDS_UPDATE';
export type PlanStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

// ─── Entity Types ────────────────────────────────────────

export interface UserProfile {
  id: string;
  firebaseUid: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
  role: UserRole;
  currentPosition?: string;
  targetRole?: string;
  bio?: string;
  weekStreak: number;
  mentorProfile?: MentorProfile;
  googleCalendarConnected?: boolean;
  googleCalendarEmail?: string;
}

export interface MentorProfile {
  id: string;
  userId: string;
  expertise: string[];
  industry?: string;
  yearsExperience?: number;
  availability: string[];
  bio?: string;
  isActive: boolean;
}

export interface MentorWithUser extends MentorProfile {
  user: UserProfile;
}

export interface Match {
  id: string;
  menteeId: string;
  mentorId: string;
  score?: number;
  reason?: string;
  status: MatchStatus;
  mentee?: UserProfile;
  mentor?: UserProfile;
  createdAt: string;
}

export interface Session {
  id: string;
  menteeId: string;
  mentorId: string;
  matchId?: string;
  scheduledAt: string;
  duration: number;
  type: SessionType;
  status: SessionStatus;
  meetingLink?: string;
  calendarEventId?: string;
}

export interface AvailabilitySlot {
  start: string;
  end: string;
}

export interface AvailabilityResponse {
  calendarConnected: boolean;
  date: string;
  slots: AvailabilitySlot[];
}

export interface SessionDetail extends Session {
  summary?: SessionSummary;
  actionItems: ActionItem[];
  notes: SessionNote[];
  mentee: UserProfile;
  mentor: UserProfile;
}

export interface SessionSummary {
  id: string;
  conversationSummary: string;
  keyTopics: string[];
  keyInsights: string[];
}

export interface ActionItem {
  id: string;
  sessionId: string;
  assigneeId: string;
  description: string;
  dueDate?: string;
  status: ActionItemStatus;
}

export interface SessionNote {
  id: string;
  sessionId: string;
  userId: string;
  content: string;
}

export interface NinetyDayPlan {
  id: string;
  userId: string;
  title?: string;
  startDate: string;
  status: PlanStatus;
  goals?: Goal[];
}

export interface Goal {
  id: string;
  planId?: string;
  userId: string;
  title: string;
  description?: string;
  period: GoalPeriod;
  status: GoalStatus;
  isAiSuggested: boolean;
}

export interface Milestone {
  id: string;
  userId: string;
  title: string;
  description?: string;
  achievedAt?: string;
}
