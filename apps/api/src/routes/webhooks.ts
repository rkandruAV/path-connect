import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const webhooksRouter = Router();

// Shared secret for webhook authentication (n8n → API)
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'dev-webhook-secret';

function verifyWebhookSecret(req: Request, res: Response): boolean {
  const token = req.headers['x-webhook-secret'];
  if (token !== WEBHOOK_SECRET) {
    res.status(401).json({ data: null, message: 'Invalid webhook secret' });
    return false;
  }
  return true;
}

/**
 * @openapi
 * /webhooks/upcoming-sessions:
 *   get:
 *     summary: Get sessions starting within a time window
 *     description: Used by n8n to send session reminders. Requires webhook secret.
 *     tags: [Webhooks]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: withinMinutes
 *         schema:
 *           type: integer
 *           default: 60
 *         description: Sessions starting within this many minutes
 *     responses:
 *       200:
 *         description: List of upcoming sessions with participant details
 *       401:
 *         description: Invalid webhook secret
 */
webhooksRouter.get('/upcoming-sessions', async (req: Request, res: Response) => {
  if (!verifyWebhookSecret(req, res)) return;

  const withinMinutes = parseInt(req.query.withinMinutes as string) || 60;
  const now = new Date();
  const windowEnd = new Date(now.getTime() + withinMinutes * 60 * 1000);

  const sessions = await prisma.session.findMany({
    where: {
      status: 'SCHEDULED',
      scheduledAt: {
        gte: now,
        lte: windowEnd,
      },
    },
    include: {
      mentee: { select: { id: true, displayName: true, email: true } },
      mentor: { select: { id: true, displayName: true, email: true } },
      match: { select: { id: true, reason: true } },
    },
    orderBy: { scheduledAt: 'asc' },
  });

  res.json({ data: sessions, count: sessions.length });
});

/**
 * @openapi
 * /webhooks/completed-sessions:
 *   get:
 *     summary: Get recently completed sessions without summaries
 *     description: Used by n8n to trigger auto-summarization. Requires webhook secret.
 *     tags: [Webhooks]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: sinceHours
 *         schema:
 *           type: integer
 *           default: 24
 *         description: Sessions completed within this many hours
 *     responses:
 *       200:
 *         description: Completed sessions that need summarization
 *       401:
 *         description: Invalid webhook secret
 */
webhooksRouter.get('/completed-sessions', async (req: Request, res: Response) => {
  if (!verifyWebhookSecret(req, res)) return;

  const sinceHours = parseInt(req.query.sinceHours as string) || 24;
  const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000);

  const sessions = await prisma.session.findMany({
    where: {
      status: 'COMPLETED',
      updatedAt: { gte: since },
      summary: null, // No summary yet
    },
    include: {
      mentee: { select: { id: true, displayName: true, email: true } },
      mentor: { select: { id: true, displayName: true, email: true } },
      notes: { select: { content: true, userId: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  res.json({ data: sessions, count: sessions.length });
});

/**
 * @openapi
 * /webhooks/weekly-digest:
 *   get:
 *     summary: Get weekly activity data for digest emails
 *     description: Used by n8n to send weekly digests. Returns active users with their recent activity.
 *     tags: [Webhooks]
 *     security: []
 *     responses:
 *       200:
 *         description: Users with their weekly activity
 *       401:
 *         description: Invalid webhook secret
 */
webhooksRouter.get('/weekly-digest', async (req: Request, res: Response) => {
  if (!verifyWebhookSecret(req, res)) return;

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Get users who had activity in the past week
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { sessionsAsMentee: { some: { updatedAt: { gte: oneWeekAgo } } } },
        { sessionsAsMentor: { some: { updatedAt: { gte: oneWeekAgo } } } },
        { goals: { some: { updatedAt: { gte: oneWeekAgo } } } },
      ],
    },
    select: {
      id: true,
      displayName: true,
      email: true,
      weekStreak: true,
      sessionsAsMentee: {
        where: { updatedAt: { gte: oneWeekAgo } },
        select: { id: true, status: true, scheduledAt: true },
      },
      sessionsAsMentor: {
        where: { updatedAt: { gte: oneWeekAgo } },
        select: { id: true, status: true, scheduledAt: true },
      },
      goals: {
        where: { updatedAt: { gte: oneWeekAgo } },
        select: { id: true, title: true, status: true, period: true },
      },
    },
  });

  const digest = users.map((user) => ({
    userId: user.id,
    displayName: user.displayName,
    email: user.email,
    weekStreak: user.weekStreak,
    sessionsThisWeek: user.sessionsAsMentee.length + user.sessionsAsMentor.length,
    completedSessions: [...user.sessionsAsMentee, ...user.sessionsAsMentor]
      .filter((s) => s.status === 'COMPLETED').length,
    upcomingSessions: [...user.sessionsAsMentee, ...user.sessionsAsMentor]
      .filter((s) => s.status === 'SCHEDULED').length,
    goalsUpdated: user.goals.length,
    goalsAchieved: user.goals.filter((g) => g.status === 'ACHIEVED').length,
  }));

  res.json({ data: digest, count: digest.length });
});
