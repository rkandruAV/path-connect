// Shared types and utilities for PathConnect

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
