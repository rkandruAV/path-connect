import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { createSessionSchema, sessionNotesSchema, listSessionsQuerySchema, sessionIdParamsSchema } from '../validators/sessions.validator.js';
import * as sessionsController from '../controllers/sessions.controller.js';

export const sessionsRouter = Router();

sessionsRouter.use(authenticate);

sessionsRouter.post('/', validate({ body: createSessionSchema }), sessionsController.createSession);
sessionsRouter.get('/', validate({ query: listSessionsQuerySchema }), sessionsController.listSessions);
sessionsRouter.get('/:id', validate({ params: sessionIdParamsSchema }), sessionsController.getSession);
sessionsRouter.post('/:id/notes', validate({ params: sessionIdParamsSchema, body: sessionNotesSchema }), sessionsController.upsertNotes);
