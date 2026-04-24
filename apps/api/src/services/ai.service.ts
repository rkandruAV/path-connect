import { prisma } from '../lib/prisma.js';
import { runWorkflow, sendChatMessage } from '../lib/dify.js';
import { AppError, NotFoundError, ForbiddenError } from '../utils/errors.js';
import type { MatchMentorsInput, ChatMessageInput } from '../validators/ai.validator.js';

const MENTOR_MATCHER_KEY = process.env.DIFY_MENTOR_MATCHER_KEY || '';
const SESSION_SUMMARIZER_KEY = process.env.DIFY_SESSION_SUMMARIZER_KEY || '';
const LEARNING_PATH_KEY = process.env.DIFY_LEARNING_PATH_KEY || '';
const AI_ADVISOR_KEY = process.env.DIFY_AI_ADVISOR_KEY || '';

const userSelect = {
  id: true,
  displayName: true,
  photoUrl: true,
  email: true,
  role: true,
} as const;

export async function matchMentors(userId: string, criteria: MatchMentorsInput) {
  if (!MENTOR_MATCHER_KEY) {
    throw new AppError('Mentor matching is not configured', 503);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User', userId);

  const mentors = await prisma.mentorProfile.findMany({
    where: { isActive: true },
    include: { user: { select: userSelect } },
  });

  if (mentors.length === 0) {
    return [];
  }

  const menteeProfile = {
    id: user.id,
    currentPosition: criteria.currentPosition || user.currentPosition || '',
    targetRole: criteria.targetRole || user.targetRole || '',
    goals: criteria.goals || '',
  };

  const mentorList = mentors.map((m) => ({
    id: m.userId,
    name: m.user.displayName || m.user.email,
    expertise: m.expertise,
    industry: m.industry,
    yearsExperience: m.yearsExperience,
    bio: m.bio,
  }));

  const outputs = await runWorkflow(
    MENTOR_MATCHER_KEY,
    { mentee_profile: JSON.stringify(menteeProfile), mentors: JSON.stringify(mentorList) },
    userId
  );

  // Parse Dify output — expects { mentors: [{ id, score, reason }] }
  const ranked = (outputs.mentors as Array<{ id: string; score: number; reason: string }>) || [];

  // Create Match records for each ranked mentor
  const matches = await Promise.all(
    ranked.map(async (r) => {
      const existing = await prisma.match.findUnique({
        where: { menteeId_mentorId: { menteeId: userId, mentorId: r.id } },
      });
      if (existing && existing.status !== 'DECLINED' && existing.status !== 'COMPLETED') {
        return prisma.match.findUnique({
          where: { id: existing.id },
          include: { mentee: { select: userSelect }, mentor: { select: userSelect } },
        });
      }
      return prisma.match.create({
        data: {
          menteeId: userId,
          mentorId: r.id,
          score: r.score,
          reason: r.reason,
        },
        include: { mentee: { select: userSelect }, mentor: { select: userSelect } },
      });
    })
  );

  return matches.filter(Boolean);
}

export async function summarizeSession(sessionId: string, userId: string) {
  if (!SESSION_SUMMARIZER_KEY) {
    throw new AppError('Session summarization is not configured', 503);
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      mentee: { select: userSelect },
      mentor: { select: userSelect },
      notes: true,
    },
  });

  if (!session) throw new NotFoundError('Session', sessionId);
  if (session.menteeId !== userId && session.mentorId !== userId) {
    throw new ForbiddenError('You do not have access to this session');
  }
  if (session.notes.length === 0) {
    throw new AppError('No session notes to summarize', 400);
  }

  const sessionContext = {
    mentee: session.mentee.displayName || session.mentee.email,
    mentor: session.mentor.displayName || session.mentor.email,
    scheduledAt: session.scheduledAt.toISOString(),
    type: session.type,
  };

  const sessionNotes = session.notes.map((n) => n.content).join('\n\n');

  const outputs = await runWorkflow(
    SESSION_SUMMARIZER_KEY,
    { session_notes: sessionNotes, session_context: JSON.stringify(sessionContext) },
    userId
  );

  // Expects { summary, topics[], actionItems[], insights[] }
  const summary = (outputs.summary as string) || '';
  const topics = (outputs.topics as string[]) || [];
  const actionItems = (outputs.actionItems as Array<{ description: string; assignee: 'mentee' | 'mentor'; dueDate?: string }>) || [];
  const insights = (outputs.insights as string[]) || [];

  // Upsert SessionSummary + create ActionItems in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const sessionSummary = await tx.sessionSummary.upsert({
      where: { sessionId },
      create: {
        sessionId,
        conversationSummary: summary,
        keyTopics: topics,
        keyInsights: insights,
      },
      update: {
        conversationSummary: summary,
        keyTopics: topics,
        keyInsights: insights,
      },
    });

    // Delete old AI-generated action items, then create new ones
    await tx.actionItem.deleteMany({ where: { sessionId } });

    if (actionItems.length > 0) {
      await tx.actionItem.createMany({
        data: actionItems.map((item) => ({
          sessionId,
          assigneeId: item.assignee === 'mentor' ? session.mentorId : session.menteeId,
          description: item.description,
          dueDate: item.dueDate ? new Date(item.dueDate) : null,
        })),
      });
    }

    const createdActions = await tx.actionItem.findMany({
      where: { sessionId },
      include: { assignee: { select: userSelect } },
    });

    return { ...sessionSummary, actionItems: createdActions };
  });

  return result;
}

export async function generateLearningPath(userId: string) {
  if (!LEARNING_PATH_KEY) {
    throw new AppError('Learning path generation is not configured', 503);
  }

  const [user, goals, milestones, recentSummaries] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 20 }),
    prisma.milestone.findMany({ where: { userId }, orderBy: { achievedAt: 'desc' }, take: 10 }),
    prisma.sessionSummary.findMany({
      where: { session: { OR: [{ menteeId: userId }, { mentorId: userId }] } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  if (!user) throw new NotFoundError('User', userId);

  const userContext = {
    currentPosition: user.currentPosition || '',
    targetRole: user.targetRole || '',
    existingGoals: goals.map((g) => ({ title: g.title, period: g.period, status: g.status })),
    milestones: milestones.map((m) => ({ title: m.title, description: m.description })),
    recentInsights: recentSummaries.flatMap((s) => s.keyInsights),
  };

  const outputs = await runWorkflow(
    LEARNING_PATH_KEY,
    { user_context: JSON.stringify(userContext) },
    userId
  );

  // Expects { goals: [{ title, period, description }] }
  return (outputs.goals as Array<{ title: string; period: string; description: string }>) || [];
}

export async function chatWithAdvisor(userId: string, input: ChatMessageInput) {
  if (!AI_ADVISOR_KEY) {
    throw new AppError('AI advisor is not configured', 503);
  }

  const result = await sendChatMessage(
    AI_ADVISOR_KEY,
    input.message,
    userId,
    input.conversationId
  );

  return result;
}
