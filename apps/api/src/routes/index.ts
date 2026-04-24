import { Router } from 'express';
import { usersRouter } from './users.js';
import { mentorsRouter } from './mentors.js';
import { matchesRouter } from './matches.js';
import { sessionsRouter } from './sessions.js';
import { goalsRouter } from './goals.js';
import { aiRouter } from './ai.js';

export const apiRouter = Router();

// Health check (no auth required)
apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'path-connect-api', timestamp: new Date().toISOString() });
});

apiRouter.use('/users', usersRouter);
apiRouter.use('/mentors', mentorsRouter);
apiRouter.use('/matches', matchesRouter);
apiRouter.use('/sessions', sessionsRouter);
apiRouter.use('/goals', goalsRouter);
apiRouter.use('/ai', aiRouter);
