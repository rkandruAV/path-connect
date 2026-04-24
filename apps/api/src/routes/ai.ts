import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { matchMentorsSchema, chatMessageSchema, sessionIdParamsSchema } from '../validators/ai.validator.js';
import * as aiController from '../controllers/ai.controller.js';

export const aiRouter = Router();

aiRouter.use(authenticate);

aiRouter.post('/match-mentors', validate({ body: matchMentorsSchema }), aiController.matchMentors);
aiRouter.post('/chat', validate({ body: chatMessageSchema }), aiController.chat);
aiRouter.get('/learning-path', aiController.getLearningPath);
aiRouter.post('/sessions/:id/summarize', validate({ params: sessionIdParamsSchema }), aiController.summarizeSession);
