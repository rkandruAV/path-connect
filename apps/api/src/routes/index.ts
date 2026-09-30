import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { usersRouter } from './users.js';
import { mentorsRouter } from './mentors.js';
import { matchesRouter } from './matches.js';
import { sessionsRouter } from './sessions.js';
import { goalsRouter } from './goals.js';
import { aiRouter } from './ai.js';

export const apiRouter = Router();

// Health check with dependency status (no auth required)
apiRouter.get('/health', async (_req, res) => {
  const health: Record<string, unknown> = {
    status: 'ok',
    service: 'path-connect-api',
    timestamp: new Date().toISOString(),
    dependencies: {} as Record<string, string>,
  };

  // Check database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`;
    (health.dependencies as Record<string, string>).database = 'ok';
  } catch {
    (health.dependencies as Record<string, string>).database = 'unreachable';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

apiRouter.use('/users', usersRouter);
apiRouter.use('/mentors', mentorsRouter);
apiRouter.use('/matches', matchesRouter);
apiRouter.use('/sessions', sessionsRouter);
apiRouter.use('/goals', goalsRouter);
apiRouter.use('/ai', aiRouter);
