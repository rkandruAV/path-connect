import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { redis } from '../lib/redis.js';
import { usersRouter } from './users.js';
import { mentorsRouter } from './mentors.js';
import { matchesRouter } from './matches.js';
import { sessionsRouter } from './sessions.js';
import { goalsRouter } from './goals.js';
import { aiRouter } from './ai.js';
import { webhooksRouter } from './webhooks.js';

export const apiRouter = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     description: Returns service status and dependency connectivity
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Service healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [ok, degraded]
 *                 service:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 dependencies:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                     redis:
 *                       type: string
 *       503:
 *         description: Service degraded (database unreachable)
 */
apiRouter.get('/health', async (_req, res) => {
  const deps: Record<string, string> = {};
  let status = 'ok';

  // Check database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`;
    deps.database = 'ok';
  } catch {
    deps.database = 'unreachable';
    status = 'degraded';
  }

  // Check Redis connectivity
  try {
    await redis.ping();
    deps.redis = 'ok';
  } catch {
    deps.redis = 'unreachable';
    // Redis is non-critical — app works without it (cache miss fallback)
  }

  const statusCode = status === 'ok' ? 200 : 503;
  res.status(statusCode).json({
    status,
    service: 'path-connect-api',
    timestamp: new Date().toISOString(),
    dependencies: deps,
  });
});

apiRouter.use('/users', usersRouter);
apiRouter.use('/mentors', mentorsRouter);
apiRouter.use('/matches', matchesRouter);
apiRouter.use('/sessions', sessionsRouter);
apiRouter.use('/goals', goalsRouter);
apiRouter.use('/ai', aiRouter);
apiRouter.use('/webhooks', webhooksRouter);
